// src/whatsapp/httpBridge.ts
// Minimal HTTP bridge that exposes processInboundWebhook over a local endpoint.
// Designed for n8n/WhatsApp integration — maps n8n payload format to internal format.
//
// Binds ONLY to 127.0.0.1 (loopback). No external exposure.
//
// Usage:
//   npm run bridge:whatsapp
//   WHATSAPP_HOOK_TOKEN=mytoken npm run bridge:whatsapp
//   BRIDGE_PORT=9000 npm run bridge:whatsapp

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { processInboundWebhook } from "./bridge.js";
import { logger } from "../observability/logger.js";

// ─── Config ─────────────────────────────────────────────────────

const HOST = "127.0.0.1";
const PORT = Number(process.env["BRIDGE_PORT"]) || 8787;
const MAX_BODY_BYTES = 64 * 1024; // 64 KB
const TIMEOUT_MS = 120_000; // 2 minutes — orchestrator can be slow

// ─── n8n payload → internal format mapping ──────────────────────

interface N8nPayload {
  source?: string;
  provider?: string;
  from?: string;
  to?: string;
  messageType?: string;
  userMessage?: string;
  raw?: unknown;
  metadata?: {
    messageId?: string;
    timestamp?: string;
  };
}

interface N8nResponse {
  status: "ok" | "error" | "needs_approval";
  replyText: string;
  runId: string;
  traceId: string;
  needsApproval: boolean;
  proposedActions: unknown[];
  error: string | null;
}

/**
 * Maps the n8n WhatsApp payload to the internal format expected by
 * processInboundWebhook / messageParser.
 *
 * n8n sends:  { from: "whatsapp:+591...", userMessage: "...", metadata: { messageId } }
 * Internal expects: { sender: "+591...", text: "...", messageId: "..." }
 */
function mapN8nToInternal(payload: N8nPayload): Record<string, unknown> | null {
  const userMessage = payload.userMessage;
  if (!userMessage || typeof userMessage !== "string" || userMessage.trim() === "") {
    return null;
  }

  // Strip "whatsapp:" prefix from sender if present
  let sender = payload.from ?? "";
  if (sender.startsWith("whatsapp:")) {
    sender = sender.slice("whatsapp:".length);
  }

  const messageId = payload.metadata?.messageId ?? randomUUID();

  let timestamp: number | undefined;
  if (payload.metadata?.timestamp) {
    const parsed = Date.parse(payload.metadata.timestamp);
    if (!Number.isNaN(parsed)) timestamp = parsed;
  }

  return {
    sender: sender || "unknown",
    messageId,
    text: userMessage.trim(),
    ...(timestamp !== undefined && { timestamp }),
  };
}

function buildResponse(
  status: N8nResponse["status"],
  replyText: string,
  opts?: { runId?: string; error?: string; needsApproval?: boolean; proposedActions?: unknown[] },
): N8nResponse {
  return {
    status,
    replyText,
    runId: opts?.runId ?? "",
    traceId: randomUUID(),
    needsApproval: opts?.needsApproval ?? false,
    proposedActions: opts?.proposedActions ?? [],
    error: opts?.error ?? null,
  };
}

// ─── Body reader ────────────────────────────────────────────────

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        req.destroy();
        reject(new Error("Body too large"));
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

// ─── JSON response helper ───────────────────────────────────────

function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

// ─── Request handler ────────────────────────────────────────────

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const requestId = randomUUID().slice(0, 8);

  // Health check
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { status: "ok", timestamp: new Date().toISOString() });
    return;
  }

  // Only accept POST /whatsapp-orchestrator
  if (req.method !== "POST" || req.url !== "/whatsapp-orchestrator") {
    sendJson(res, 404, buildResponse("error", "Not found", { error: "Unknown endpoint" }));
    return;
  }

  // Content-Type check
  const contentType = req.headers["content-type"] ?? "";
  if (!contentType.includes("application/json")) {
    sendJson(res, 400, buildResponse("error", "Content-Type must be application/json", {
      error: "Invalid content type",
    }));
    return;
  }

  logger.info(`whatsapp:http [${requestId}] incoming request`);

  // Read body
  let rawBody: string;
  try {
    rawBody = await readBody(req);
  } catch (err) {
    sendJson(res, 413, buildResponse("error", "Request body too large (max 64KB)", {
      error: "Body too large",
    }));
    return;
  }

  // Parse JSON
  let payload: N8nPayload;
  try {
    payload = JSON.parse(rawBody) as N8nPayload;
  } catch {
    sendJson(res, 400, buildResponse("error", "Invalid JSON in request body", {
      error: "JSON parse error",
    }));
    return;
  }

  // Validate userMessage
  if (!payload.userMessage || typeof payload.userMessage !== "string" || payload.userMessage.trim() === "") {
    sendJson(res, 400, buildResponse("error", "Campo 'userMessage' es requerido y no puede estar vacío.", {
      error: "Missing userMessage",
    }));
    return;
  }

  // Map to internal format
  const internalPayload = mapN8nToInternal(payload);
  if (!internalPayload) {
    sendJson(res, 400, buildResponse("error", "No se pudo mapear el payload al formato interno.", {
      error: "Payload mapping failed",
    }));
    return;
  }

  // Resolve hook token: header > env > empty (bridge.ts will validate against config)
  const hookToken =
    (req.headers["x-hook-token"] as string | undefined) ??
    process.env["WHATSAPP_HOOK_TOKEN"] ??
    "";

  // Call the existing WhatsApp pipeline
  try {
    const reply = await processInboundWebhook(internalPayload, hookToken);

    if (reply === null) {
      // null means: disabled, token invalid, malformed after internal parse, or duplicate
      sendJson(res, 200, buildResponse("error",
        "Mensaje no procesado. Verificá: hookToken, allowedPhones, whatsapp.enabled en config, o si es un mensaje duplicado.",
        { error: "Message not processed (check config)" },
      ));
      return;
    }

    logger.info(`whatsapp:http [${requestId}] reply sent`);

    sendJson(res, 200, buildResponse("ok", reply.text, { runId: requestId }));
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error(`whatsapp:http [${requestId}] internal error`, { error: errorMsg });

    sendJson(res, 200, buildResponse("error",
      "Error interno del orquestador. Intentá de nuevo.",
      { error: "Internal orchestrator error", runId: requestId },
    ));
  }
}

// ─── Server ─────────────────────────────────────────────────────

const server = createServer((req, res) => {
  res.setTimeout(TIMEOUT_MS);
  handleRequest(req, res).catch((err) => {
    logger.error("whatsapp:http unhandled error", {
      error: err instanceof Error ? err.message : String(err),
    });
    if (!res.headersSent) {
      sendJson(res, 500, buildResponse("error", "Error interno inesperado.", {
        error: "Unhandled server error",
      }));
    }
  });
});

server.listen(PORT, HOST, () => {
  logger.section("WHATSAPP HTTP BRIDGE");
  logger.info(`Listening on http://${HOST}:${PORT}`);
  logger.info(`Endpoint:  POST http://${HOST}:${PORT}/whatsapp-orchestrator`);
  logger.info(`Health:    GET  http://${HOST}:${PORT}/health`);
  logger.info(`Max body:  ${MAX_BODY_BYTES / 1024} KB`);
  logger.info(`Timeout:   ${TIMEOUT_MS / 1000}s`);
  logger.info(`Hook token: ${hookTokenSource()}`);
  logger.info("Press Ctrl+C to stop.");
});

function hookTokenSource(): string {
  if (process.env["WHATSAPP_HOOK_TOKEN"]) return "from env WHATSAPP_HOOK_TOKEN";
  return "from X-Hook-Token header (per request)";
}

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("whatsapp:http shutting down...");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
