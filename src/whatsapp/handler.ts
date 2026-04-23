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
import type {
  ChannelMessage,
  ChannelReply,
  WhatsAppConfig,
  WhatsAppAuditEntry,
  WhatsAppDecision,
} from "./types.js";

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
  config: WhatsAppConfig,
): Promise<ChannelReply | null> {
  const replyTo = message.senderRaw ?? "";

  try {
    // 1. Feature gate
    if (!config.enabled) return null;

    // 2. Phone allowlist
    if (!isPhoneAllowed(message.senderHash, config.allowedPhones)) {
      logAudit(
        buildAuditEntry(message, "none", "none", "blocked_phone"),
      );
      return { to: replyTo, text: "Access denied. Your number is not authorized." };
    }

    // 3. Rate limiting
    const limiter = getRateLimiter(config.maxMessagesPerHour);
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

    // 5. Intent resolution
    const { mode, task, blocked } = resolveIntent(
      message.text,
      config.safeModes,
    );

    if (blocked) {
      logAudit(
        buildAuditEntry(message, mode, mode, "blocked_mode"),
      );
      return {
        to: replyTo,
        text: `Mode "${mode}" is not allowed via WhatsApp. Allowed: ${config.safeModes.join(", ")}.`,
      };
    }

    // 6. Audit log — allowed (log resolved mode only, never raw message text)
    logAudit(buildAuditEntry(message, mode, mode, "allowed"));

    // 7. Run orchestrator
    const result = await runOrchestrator(task, mode, "whatsapp");

    // 8. Format reply
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
