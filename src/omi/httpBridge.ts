// src/omi/httpBridge.ts
// Minimal HTTP bridge for Omi webhook ingestion.
// Binds ONLY to 127.0.0.1 (loopback). No external exposure.
// Phase 26B — ingestion only, no execution.
//
// Usage:
//   npm run bridge:omi
//   OMI_WEBHOOK_SECRET=mysecret npm run bridge:omi
//   OMI_BRIDGE_PORT=8788 npm run bridge:omi

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { randomUUID } from "node:crypto";
import { ingestOmiMemory } from "./adapter.js";
import type { OmiActionProposalSummary } from "./actionItems.js";
import { readUserConfig } from "../config/userConfigStore.js";
import { OMI_CONFIG } from "../config.js";
import { logger } from "../observability/logger.js";

// ─── Config ─────────────────────────────────────────────────────

const HOST = "127.0.0.1";
const PORT = Number(process.env["OMI_BRIDGE_PORT"]) || 8788;
const MAX_BODY_BYTES = 64 * 1024; // 64 KB
const TIMEOUT_MS = 30_000; // 30 seconds — ingestion is fast

// ─── Response helpers ───────────────────────────────────────────

interface OmiResponse {
  status: "ok" | "error" | "duplicate";
  message: string;
  entryId?: string;
  error?: string;
  actionProposals?: OmiActionProposalSummary;
}

function sendJson(res: ServerResponse, statusCode: number, data: OmiResponse): void {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
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

// ─── Webhook secret validation ──────────────────────────────────

interface OmiSecretValidation {
  memoryAllowed: boolean;
  actionProposalTrusted: boolean;
  actionProposalTrustReason: string;
}

function validateSecret(
  req: IncomingMessage,
  body: string,
): OmiSecretValidation {
  const secret = OMI_CONFIG.webhookSecret;
  if (!secret) {
    return {
      memoryAllowed: true,
      actionProposalTrusted: false,
      actionProposalTrustReason: "omi webhook secret not configured",
    };
  }

  const signature = req.headers["x-omi-signature"] as string | undefined;
  if (!signature) {
    return {
      memoryAllowed: false,
      actionProposalTrusted: false,
      actionProposalTrustReason: "omi webhook signature missing",
    };
  }

  const expected = createHmac("sha256", secret).update(body).digest("hex");

  try {
    const valid = timingSafeEqual(
      Buffer.from(signature, "utf-8"),
      Buffer.from(expected, "utf-8"),
    );
    return {
      memoryAllowed: valid,
      actionProposalTrusted: valid,
      actionProposalTrustReason: valid
        ? "omi webhook signature verified"
        : "omi webhook signature invalid",
    };
  } catch {
    return {
      memoryAllowed: false,
      actionProposalTrusted: false,
      actionProposalTrustReason: "omi webhook signature invalid",
    };
  }
}

// ─── Request handler ────────────────────────────────────────────

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const requestId = randomUUID().slice(0, 8);

  // Health check
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { status: "ok", message: "Omi bridge healthy" });
    return;
  }

  // Only accept POST /omi-webhook
  if (req.method !== "POST" || req.url !== "/omi-webhook") {
    sendJson(res, 404, { status: "error", message: "Not found", error: "Unknown endpoint" });
    return;
  }

  // Content-Type check
  const contentType = req.headers["content-type"] ?? "";
  if (!contentType.includes("application/json")) {
    sendJson(res, 400, {
      status: "error",
      message: "Content-Type must be application/json",
      error: "Invalid content type",
    });
    return;
  }

  logger.info(`omi:http [${requestId}] incoming webhook`);

  // Check if Omi is enabled in user config
  const userConfig = await readUserConfig();
  if (!userConfig.omi?.enabled) {
    logger.info(`omi:http [${requestId}] rejected — omi disabled in config`);
    sendJson(res, 403, {
      status: "error",
      message: "Omi ingestion is disabled in config",
      error: "omi.enabled is false",
    });
    return;
  }

  // Read body
  let rawBody: string;
  try {
    rawBody = await readBody(req);
  } catch {
    sendJson(res, 413, {
      status: "error",
      message: "Request body too large (max 64KB)",
      error: "Body too large",
    });
    return;
  }

  // Validate webhook secret. Memory ingestion preserves existing behavior:
  // missing secret is allowed, invalid configured signature is rejected.
  const secretValidation = validateSecret(req, rawBody);
  if (!secretValidation.memoryAllowed) {
    logger.warn(`omi:http [${requestId}] rejected — invalid signature`);
    sendJson(res, 401, {
      status: "error",
      message: "Invalid webhook signature",
      error: "Signature validation failed",
    });
    return;
  }

  // Parse JSON
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    sendJson(res, 400, {
      status: "error",
      message: "Invalid JSON in request body",
      error: "JSON parse error",
    });
    return;
  }

  // Check event type against allowed list
  const eventType = (payload as Record<string, unknown>)?.["type"];
  if (
    typeof eventType === "string" &&
    !userConfig.omi.allowedEventTypes.includes(eventType)
  ) {
    logger.info(`omi:http [${requestId}] skipped — event type "${eventType}" not allowed`);
    sendJson(res, 200, {
      status: "ok",
      message: `Event type "${eventType}" not in allowedEventTypes — skipped`,
    });
    return;
  }

  // Ingest
  try {
    const result = await ingestOmiMemory(payload, {
      userConfig,
      actionProposalContext: {
        trusted: secretValidation.actionProposalTrusted,
        trustReason: secretValidation.actionProposalTrustReason,
      },
    });

    if (result.status === "invalid") {
      sendJson(res, 400, {
        status: "error",
        message: result.reason ?? "Invalid payload",
        error: "Validation failed",
      });
      return;
    }

    if (result.status === "duplicate") {
      logger.info(`omi:http [${requestId}] duplicate — ${result.entryId}`);
      sendJson(res, 200, {
        status: "duplicate",
        message: "Event already ingested",
        ...(result.entryId ? { entryId: result.entryId } : {}),
      });
      return;
    }

    logger.info(`omi:http [${requestId}] ingested — ${result.entryId}`);
    sendJson(res, 200, {
      status: "ok",
      message: "Memory ingested",
      ...(result.entryId ? { entryId: result.entryId } : {}),
      ...(result.actionProposals
        ? { actionProposals: result.actionProposals }
        : {}),
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error(`omi:http [${requestId}] internal error`, { error: errorMsg });
    sendJson(res, 200, {
      status: "error",
      message: "Internal ingestion error",
      error: "Internal error",
    });
  }
}

// ─── Server ─────────────────────────────────────────────────────

const server = createServer((req, res) => {
  res.setTimeout(TIMEOUT_MS);
  handleRequest(req, res).catch((err) => {
    logger.error("omi:http unhandled error", {
      error: err instanceof Error ? err.message : String(err),
    });
    if (!res.headersSent) {
      sendJson(res, 500, {
        status: "error",
        message: "Unexpected internal error",
        error: "Unhandled server error",
      });
    }
  });
});

server.listen(PORT, HOST, () => {
  logger.section("OMI HTTP BRIDGE");
  logger.info(`Listening on http://${HOST}:${PORT}`);
  logger.info(`Endpoint:  POST http://${HOST}:${PORT}/omi-webhook`);
  logger.info(`Health:    GET  http://${HOST}:${PORT}/health`);
  logger.info(`Max body:  ${MAX_BODY_BYTES / 1024} KB`);
  logger.info(`Timeout:   ${TIMEOUT_MS / 1000}s`);
  logger.info(`Secret:    ${OMI_CONFIG.webhookSecret ? "configured" : "not set (signature validation disabled)"}`);
  logger.info("Press Ctrl+C to stop.");
});

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("omi:http shutting down...");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
