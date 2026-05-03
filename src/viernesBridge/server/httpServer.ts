import { timingSafeEqual } from "crypto";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "http";
import type {
  ViernesBridgeApprovalCommandBoundaryResult,
  ViernesBridgeApprovalCommandPayload,
  ViernesBridgeBoundaryPayload,
} from "../boundary/types.js";

type BoundaryAdapterModule = typeof import("../boundary/cliAdapter.js");
type StatusStoreModule = typeof import("../status/statusStore.js");

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 8789;
const MAX_BODY_BYTES = 64 * 1024;
const TOKEN_HEADER = "x-orquestador-bridge-token";

async function loadBoundaryAdapterModule(): Promise<BoundaryAdapterModule> {
  return (await import(new URL("../boundary/cliAdapter.ts", import.meta.url).href)) as BoundaryAdapterModule;
}

async function loadStatusStoreModule(): Promise<StatusStoreModule> {
  return (await import(new URL("../status/statusStore.ts", import.meta.url).href)) as StatusStoreModule;
}

export interface ViernesBridgeHttpServerOptions {
  host?: string;
  port?: number;
  token?: string;
  env?: NodeJS.ProcessEnv;
  executeReadOnly?: boolean;
}

export interface ViernesBridgeHttpServerHandle {
  server: Server;
  host: string;
  port: number;
  url: string;
}

function jsonResponse(
  response: ServerResponse,
  statusCode: number,
  body: unknown,
): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function requestToken(request: IncomingMessage): string | undefined {
  const value = request.headers[TOKEN_HEADER];
  if (Array.isArray(value)) return value[0];
  return value;
}

function authorized(request: IncomingMessage, token: string | undefined): boolean {
  if (!token) return true;
  const provided = requestToken(request);
  return !!provided && safeEqual(provided, token);
}

function readRequestBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf-8");

    request.on("data", (chunk: string) => {
      raw += chunk;
      if (Buffer.byteLength(raw, "utf-8") > MAX_BODY_BYTES) {
        reject(new Error("request_body_too_large"));
        request.destroy();
      }
    });

    request.on("end", () => resolve(raw));
    request.on("error", reject);
  });
}

function parsePayload(raw: string): ViernesBridgeBoundaryPayload {
  const parsed = JSON.parse(raw || "{}") as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("payload_must_be_json_object");
  }
  return parsed as ViernesBridgeBoundaryPayload;
}

function parseApprovalCommandPayload(raw: string): ViernesBridgeApprovalCommandPayload {
  const parsed = JSON.parse(raw || "{}") as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("payload_must_be_json_object");
  }
  return parsed as ViernesBridgeApprovalCommandPayload;
}

function payloadIntent(payload: ViernesBridgeBoundaryPayload | undefined): string | undefined {
  return typeof payload?.intent === "string" ? payload.intent : undefined;
}

function publicResponse(result: Awaited<ReturnType<BoundaryAdapterModule["processViernesBridgeBoundaryPayload"]>>) {
  const response = result.response;
  return {
    requestId: response.requestId,
    status: response.status,
    summary: response.summary,
    proposedActions: response.proposedActions ?? [],
    approvalRequests: response.approvalRequests ?? [],
    executionResults: response.executionResults ?? [],
    blockedReasons: response.blockedReasons ?? [],
    createdAt: response.createdAt,
  };
}

function publicApprovalResponse(result: ViernesBridgeApprovalCommandBoundaryResult) {
  const response = result.response;
  return {
    requestId: response.requestId,
    status: response.status,
    summary: response.summary,
    ...(response.approvalId ? { approvalId: response.approvalId } : {}),
    ...(response.actionId ? { actionId: response.actionId } : {}),
    blockedReasons: response.blockedReasons ?? [],
    ...(response.executionResult ? { executionResult: response.executionResult } : {}),
    createdAt: response.createdAt,
  };
}

async function updateHandshakeStatus(input: {
  options: ViernesBridgeHttpServerOptions;
  status: Parameters<StatusStoreModule["recordViernesBridgeHandshake"]>[0]["status"];
  connected?: boolean;
  intent?: string;
  errorCode?: string;
  requestId?: string;
}): Promise<void> {
  try {
    const { recordViernesBridgeHandshake } = await loadStatusStoreModule();
    await recordViernesBridgeHandshake(
      {
        mode: "local_http",
        status: input.status,
        ...(input.connected !== undefined ? { connected: input.connected } : {}),
        ...(input.intent ? { intent: input.intent } : {}),
        ...(input.errorCode ? { errorCode: input.errorCode } : {}),
        ...(input.requestId ? { requestId: input.requestId } : {}),
      },
      {
        env: input.options.env ?? process.env,
      },
    );
  } catch {
    // Status persistence must never change boundary behavior.
  }
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  options: ViernesBridgeHttpServerOptions,
): Promise<void> {
  const path = request.url ?? "";
  const isViernesRequest = request.method === "POST" && path === "/viernes/request";
  const isApprovalCommand =
    request.method === "POST" && path === "/viernes/approval-command";

  if (!isViernesRequest && !isApprovalCommand) {
    jsonResponse(response, 404, {
      status: "error",
      summary: "not_found",
    });
    return;
  }

  if (!authorized(request, options.token)) {
    await updateHandshakeStatus({
      options,
      status: "unauthorized",
      connected: false,
      errorCode: "unauthorized",
    });
    jsonResponse(response, 401, {
      status: "error",
      summary: "unauthorized",
    });
    return;
  }

  try {
    const raw = await readRequestBody(request);

    if (isApprovalCommand) {
      const payload = parseApprovalCommandPayload(raw);
      const { processViernesBridgeApprovalCommandPayload } =
        await loadBoundaryAdapterModule();
      const result = await processViernesBridgeApprovalCommandPayload(payload, {
        policyOptions: {
          env: options.env ?? process.env,
          envFiles: [],
        },
        env: options.env ?? process.env,
        envFiles: [],
      });
      const responseBody = publicApprovalResponse(result);
      await updateHandshakeStatus({
        options,
        status: result.response.status,
        connected: true,
        intent: "approval_command",
        requestId: result.response.requestId,
        ...(result.response.blockedReasons?.[0]
          ? { errorCode: result.response.blockedReasons[0] }
          : {}),
      });
      jsonResponse(response, 200, responseBody);
      return;
    }

    const payload = parsePayload(raw);
    const { processViernesBridgeBoundaryPayload } =
      await loadBoundaryAdapterModule();
    const result = await processViernesBridgeBoundaryPayload(payload, {
      executeReadOnly: options.executeReadOnly ?? false,
      policyOptions: {
        env: options.env ?? process.env,
        envFiles: [],
      },
    });
    const responseBody = publicResponse(result);
    const intent = payloadIntent(payload);
    await updateHandshakeStatus({
      options,
      status: result.response.status,
      connected: true,
      ...(intent ? { intent } : {}),
      requestId: result.response.requestId,
      ...(result.response.blockedReasons?.[0]
        ? { errorCode: result.response.blockedReasons[0] }
        : {}),
    });
    jsonResponse(response, 200, responseBody);
  } catch (err) {
    const summary = err instanceof Error ? err.message : "boundary_error";
    const statusCode =
      summary === "request_body_too_large" || summary === "payload_must_be_json_object"
        ? 400
        : 500;
    await updateHandshakeStatus({
      options,
      status: statusCode === 400 ? "invalid_request" : "error",
      connected: false,
      errorCode: summary,
    });
    jsonResponse(response, statusCode, {
      status: "error",
      summary,
    });
  }
}

export function createViernesBridgeHttpServer(
  options: ViernesBridgeHttpServerOptions = {},
): Server {
  return createServer((request, response) => {
    void handleRequest(request, response, options);
  });
}

function configuredPort(env: NodeJS.ProcessEnv): number {
  const raw = env.ORQUESTADOR_VIERNES_BRIDGE_PORT;
  if (!raw) return DEFAULT_PORT;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 && parsed < 65536
    ? parsed
    : DEFAULT_PORT;
}

export async function listenViernesBridgeHttpServer(
  options: ViernesBridgeHttpServerOptions = {},
): Promise<ViernesBridgeHttpServerHandle> {
  const env = options.env ?? process.env;
  const host = options.host ?? DEFAULT_HOST;
  const port = options.port ?? configuredPort(env);
  const token = options.token ?? env.ORQUESTADOR_VIERNES_BRIDGE_TOKEN;
  const server = createViernesBridgeHttpServer({
    ...options,
    host,
    port,
    ...(token ? { token } : {}),
    env,
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  const actualPort =
    typeof address === "object" && address ? address.port : port;

  return {
    server,
    host,
    port: actualPort,
    url: `http://${host}:${actualPort}`,
  };
}
