// src/whatsapp/handler.ts
// WhatsApp business logic handler.
// Pre-condition: transport auth (hook token) already verified by bridge.
// This function assumes the message comes from a trusted transport.

import { createHash } from "node:crypto";
import { runOrchestrator } from "../orchestrator/orchestrator.js";
import { logger } from "../observability/logger.js";
import { getRateLimiter } from "./rateLimiter.js";
import { resolveIntent } from "./intentResolver.js";
import { formatReply } from "./replyFormatter.js";
import {
  handleWhatsAppActionCommand,
  isWhatsAppActionCommand,
} from "./actionCommands.js";
import type { UserConfig } from "../config/userConfig.js";
import type {
  ChannelMessage,
  ChannelReply,
  WhatsAppAuditEntry,
  WhatsAppDecision,
} from "./types.js";

// ─── ORQUESTADOR approval bridge observation mode ────────────────

type OrquestadorApprovalCommand =
  | "approve_latest"
  | "reject_latest"
  | "status"
  | "latest"
  | "cancel"
  | "ambiguous"
  | "no_action";

type OrquestadorApprovalBridgeStatus =
  | "read_only_executed"
  | "rejected"
  | "cancelled"
  | "blocked"
  | "not_found"
  | "orquestador_unavailable"
  | "bridge_not_configured"
  | "no_action";

interface OrquestadorApprovalContext {
  approvalId: string;
  approvalCode: string;
  actionId?: string;
  status?: string;
  summary?: string;
}

interface OrquestadorApprovalBridgeRuntimeConfig {
  orquestadorApprovalBridgeEnabled?: boolean;
  orquestadorApprovalBridgeUrl?: string;
  orquestadorApprovalBridgeLatest?: Partial<OrquestadorApprovalContext>;
}

interface OrquestadorApprovalBridgeConfig {
  enabled: boolean;
  bridgeUrl?: string;
  latestApproval?: OrquestadorApprovalContext;
}

interface OrquestadorApprovalBridgeResponse {
  status?: unknown;
  summary?: unknown;
  approvalStatus?: unknown;
}

const ORQUESTADOR_APPROVAL_BRIDGE_TIMEOUT_MS = 2_000;

const ORQUESTADOR_APPROVE_COMMANDS = new Set([
  "aprobar orquestador",
  "aprobar ultima de orquestador",
]);

const ORQUESTADOR_REJECT_COMMANDS = new Set([
  "rechazar orquestador",
  "rechazar ultima de orquestador",
]);

const ORQUESTADOR_STATUS_COMMANDS = new Set([
  "estado aprobacion orquestador",
]);

const ORQUESTADOR_LATEST_COMMANDS = new Set([
  "ultima aprobacion orquestador",
]);

const ORQUESTADOR_CANCEL_COMMANDS = new Set([
  "cancelar aprobacion orquestador",
]);

const ORQUESTADOR_AMBIGUOUS_COMMANDS = new Set([
  "si",
  "sí",
  "ok",
  "dale",
  "hazlo",
  "aprobar",
  "acepto",
]);

function normalizeApprovalCommand(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function classifyOrquestadorApprovalCommand(
  text: string,
): OrquestadorApprovalCommand {
  const normalized = normalizeApprovalCommand(text);

  if (ORQUESTADOR_APPROVE_COMMANDS.has(normalized)) return "approve_latest";
  if (ORQUESTADOR_REJECT_COMMANDS.has(normalized)) return "reject_latest";
  if (ORQUESTADOR_STATUS_COMMANDS.has(normalized)) return "status";
  if (ORQUESTADOR_LATEST_COMMANDS.has(normalized)) return "latest";
  if (ORQUESTADOR_CANCEL_COMMANDS.has(normalized)) return "cancel";
  if (ORQUESTADOR_AMBIGUOUS_COMMANDS.has(normalized)) return "ambiguous";

  return "no_action";
}

function coerceApprovalContext(
  input: Partial<OrquestadorApprovalContext> | undefined,
): OrquestadorApprovalContext | undefined {
  if (!input) return undefined;
  const approvalId = typeof input.approvalId === "string" ? input.approvalId.trim() : "";
  const approvalCode = typeof input.approvalCode === "string" ? input.approvalCode.trim() : "";

  if (!approvalId || !approvalCode) return undefined;

  const context: OrquestadorApprovalContext = {
    approvalId,
    approvalCode,
    status: typeof input.status === "string" ? input.status.trim() : "pending",
    summary:
      typeof input.summary === "string" && input.summary.trim()
        ? input.summary.trim()
        : "ORQUESTADOR approval pending.",
  };

  if (typeof input.actionId === "string" && input.actionId.trim()) {
    context.actionId = input.actionId.trim();
  }

  return context;
}

function isLoopbackBridgeUrl(rawUrl: string | undefined): rawUrl is string {
  if (!rawUrl) return false;

  try {
    const parsed = new URL(rawUrl);
    return (
      parsed.protocol === "http:" &&
      ["127.0.0.1", "localhost", "::1"].includes(parsed.hostname)
    );
  } catch {
    return false;
  }
}

function getOrquestadorApprovalBridgeConfig(
  config: UserConfig,
): OrquestadorApprovalBridgeConfig {
  const runtimeConfig = config.whatsapp as typeof config.whatsapp &
    OrquestadorApprovalBridgeRuntimeConfig;
  const bridgeUrl = runtimeConfig.orquestadorApprovalBridgeUrl;
  const bridgeConfig: OrquestadorApprovalBridgeConfig = {
    enabled: runtimeConfig.orquestadorApprovalBridgeEnabled === true,
  };

  if (isLoopbackBridgeUrl(bridgeUrl)) {
    bridgeConfig.bridgeUrl = bridgeUrl;
  }

  const latestApproval = coerceApprovalContext(
    runtimeConfig.orquestadorApprovalBridgeLatest,
  );
  if (latestApproval) {
    bridgeConfig.latestApproval = latestApproval;
  }

  return bridgeConfig;
}

function approvalCommandText(
  command: "approve_latest" | "reject_latest",
  context: OrquestadorApprovalContext,
): string {
  if (command === "approve_latest") return `aprobar ${context.approvalCode}`;
  return `rechazar ${context.approvalCode}`;
}

function safeBridgeStatus(
  command: "approve_latest" | "reject_latest",
  bridgeResponse: OrquestadorApprovalBridgeResponse,
): OrquestadorApprovalBridgeStatus {
  const rawStatus =
    typeof bridgeResponse.status === "string" ? bridgeResponse.status : undefined;

  if (rawStatus === "read_only_executed" || rawStatus === "rejected") {
    return rawStatus;
  }

  return command === "approve_latest" ? "read_only_executed" : "rejected";
}

function formatOrquestadorApprovalReply(
  status: OrquestadorApprovalBridgeStatus,
  message: string,
): string {
  return [
    "[ORQUESTADOR approval observation]",
    `status=${status}`,
    message,
    "outboundSent=false",
    "providerWrites=none",
    "writesEnabled=false",
  ].join("\n");
}

async function postOrquestadorApprovalCommand(
  bridgeUrl: string,
  command: "approve_latest" | "reject_latest",
  context: OrquestadorApprovalContext,
): Promise<OrquestadorApprovalBridgeResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    ORQUESTADOR_APPROVAL_BRIDGE_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${bridgeUrl.replace(/\/+$/, "")}/viernes/approval-command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "approval_command",
        text: approvalCommandText(command, context),
        approvalId: context.approvalId,
        actionId: context.actionId,
        source: "whatsapp",
      }),
      signal: controller.signal,
    });

    const parsed = (await response.json().catch(() => ({}))) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as OrquestadorApprovalBridgeResponse;
    }
    return {};
  } finally {
    clearTimeout(timeout);
  }
}

async function tryHandleOrquestadorApprovalBridge(
  message: ChannelMessage,
  config: UserConfig,
): Promise<ChannelReply | undefined> {
  const bridgeConfig = getOrquestadorApprovalBridgeConfig(config);
  if (!bridgeConfig.enabled) return undefined;

  const replyTo = message.senderRaw ?? "";
  const command = classifyOrquestadorApprovalCommand(message.text);

  if (command === "no_action") return undefined;

  if (command === "ambiguous") {
    logAudit(
      buildAuditEntry(message, "orquestador_approval", "orquestador_approval", "blocked_mode"),
    );
    return {
      to: replyTo,
      text: formatOrquestadorApprovalReply(
        "blocked",
        "Comando ambiguo: no se aprobo ni rechazo ORQUESTADOR. Usa APROBAR ORQUESTADOR o RECHAZAR ORQUESTADOR.",
      ),
    };
  }

  logAudit(
    buildAuditEntry(message, "orquestador_approval", "orquestador_approval", "allowed"),
  );

  const context = bridgeConfig.latestApproval;

  if (command === "status" || command === "latest") {
    if (!context) {
      return {
        to: replyTo,
        text: formatOrquestadorApprovalReply(
          "not_found",
          "No hay aprobacion ORQUESTADOR pendiente en contexto local.",
        ),
      };
    }

    return {
      to: replyTo,
      text: formatOrquestadorApprovalReply(
        (context.status as OrquestadorApprovalBridgeStatus | undefined) ?? "not_found",
        `Ultima aprobacion ORQUESTADOR: ${context.status ?? "pending"}. ${context.summary ?? ""}`.trim(),
      ),
    };
  }

  if (command === "cancel") {
    return {
      to: replyTo,
      text: formatOrquestadorApprovalReply(
        "cancelled",
        "Aprobacion ORQUESTADOR cancelada solo en modo observacion local.",
      ),
    };
  }

  if (!context) {
    return {
      to: replyTo,
      text: formatOrquestadorApprovalReply(
        "not_found",
        "No hay aprobacion ORQUESTADOR pendiente en contexto local.",
      ),
    };
  }

  if (!bridgeConfig.bridgeUrl) {
    return {
      to: replyTo,
      text: formatOrquestadorApprovalReply(
        "bridge_not_configured",
        "Bridge local ORQUESTADOR no configurado para modo observacion.",
      ),
    };
  }

  try {
    const bridgeResponse = await postOrquestadorApprovalCommand(
      bridgeConfig.bridgeUrl,
      command,
      context,
    );
    const status = safeBridgeStatus(command, bridgeResponse);
    const summary =
      typeof bridgeResponse.summary === "string"
        ? bridgeResponse.summary
        : typeof bridgeResponse.approvalStatus === "string"
          ? bridgeResponse.approvalStatus
          : "Comando ORQUESTADOR procesado por bridge local.";

    return {
      to: replyTo,
      text: formatOrquestadorApprovalReply(status, summary),
    };
  } catch {
    return {
      to: replyTo,
      text: formatOrquestadorApprovalReply(
        "orquestador_unavailable",
        "ORQUESTADOR local no disponible. No se aprobo ni rechazo automaticamente.",
      ),
    };
  }
}

// ─── Replay protection ──────────────────────────────────────────

const MAX_SEEN_IDS = 10_000;
const seenIds = new Set<string>();
const seenOrder: string[] = [];

function isDuplicate(messageId: string): boolean {
  if (seenIds.has(messageId)) return true;

  seenIds.add(messageId);
  seenOrder.push(messageId);

  // FIFO eviction
  while (seenOrder.length > MAX_SEEN_IDS) {
    const oldest = seenOrder.shift()!;
    seenIds.delete(oldest);
  }

  return false;
}

// ─── Phone allowlist check ───────────────────────────────────────

function isPhoneAllowed(
  senderHash: string,
  allowedPhones: string[],
): boolean {
  if (allowedPhones.length === 0) return false; // deny all by default

  for (const phone of allowedPhones) {
    const hash = createHash("sha256").update(phone).digest("hex");
    if (hash === senderHash) return true;
  }

  return false;
}

// ─── Audit logging ───────────────────────────────────────────────

function logAudit(entry: WhatsAppAuditEntry): void {
  logger.info("whatsapp:inbound", entry as unknown as Record<string, unknown>);
}

function buildAuditEntry(
  message: ChannelMessage,
  commandDetected: string,
  modeResolved: string,
  decision: WhatsAppDecision,
): WhatsAppAuditEntry {
  return {
    timestamp: new Date().toISOString(),
    senderHash: message.senderHash,
    messageId: message.messageId,
    commandDetected,
    modeResolved,
    decision,
  };
}

// ─── Handler ─────────────────────────────────────────────────────

/**
 * Processes a validated WhatsApp message through the security pipeline
 * and returns a reply. Transport auth is handled by the bridge layer.
 *
 * Returns null if the feature is disabled. Returns an error reply
 * (never throws) for any blocked or failed request.
 */
export async function handleWhatsAppMessage(
  message: ChannelMessage,
  config: UserConfig,
): Promise<ChannelReply | null> {
  const replyTo = message.senderRaw ?? "";
  const whatsappConfig = config.whatsapp;

  try {
    // 1. Feature gate
    if (!whatsappConfig.enabled) return null;

    // 2. Phone allowlist
    if (!isPhoneAllowed(message.senderHash, whatsappConfig.allowedPhones)) {
      logAudit(
        buildAuditEntry(message, "none", "none", "blocked_phone"),
      );
      return { to: replyTo, text: "Access denied. Your number is not authorized." };
    }

    // 3. Rate limiting
    const limiter = getRateLimiter(whatsappConfig.maxMessagesPerHour);
    if (!limiter.isAllowed(message.senderHash)) {
      logAudit(
        buildAuditEntry(message, "none", "none", "blocked_rate"),
      );
      return { to: replyTo, text: "Rate limit exceeded. Please try again later." };
    }

    // 4. Replay protection
    if (isDuplicate(message.messageId)) {
      logAudit(
        buildAuditEntry(message, "none", "none", "blocked_replay"),
      );
      return null; // silently drop duplicate
    }

    // 5. Feature-flagged ORQUESTADOR approval bridge observation mode.
    const approvalBridgeReply = await tryHandleOrquestadorApprovalBridge(
      message,
      config,
    );
    if (approvalBridgeReply) return approvalBridgeReply;

    // 6. Deterministic action commands (no orchestrator/provider call)
    if (isWhatsAppActionCommand(message.text)) {
      logAudit(buildAuditEntry(message, "actions", "actions", "allowed"));
      return handleWhatsAppActionCommand(message, config);
    }

    // 7. Intent resolution
    const { mode, task, blocked } = resolveIntent(
      message.text,
      whatsappConfig.safeModes,
    );

    if (blocked) {
      logAudit(
        buildAuditEntry(message, mode, mode, "blocked_mode"),
      );
      return {
        to: replyTo,
        text: `Mode "${mode}" is not allowed via WhatsApp. Allowed: ${whatsappConfig.safeModes.join(", ")}.`,
      };
    }

    // 8. Audit log — allowed (log resolved mode only, never raw message text)
    logAudit(buildAuditEntry(message, mode, mode, "allowed"));

    // 9. Run orchestrator
    const result = await runOrchestrator(task, mode, "whatsapp");

    // 10. Format reply
    const text = formatReply(result);

    return { to: replyTo, text };
  } catch (err) {
    logger.error("whatsapp:handler failed", {
      error: err instanceof Error ? err.message : String(err),
      senderHash: message.senderHash,
    });
    return {
      to: replyTo,
      text: "An error occurred processing your request. Please try again.",
    };
  }
}
