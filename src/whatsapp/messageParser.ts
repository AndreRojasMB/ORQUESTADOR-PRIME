// src/whatsapp/messageParser.ts
// Parses a raw inbound payload into a ChannelMessage.
// Hashes the sender phone — raw value kept in-memory only for reply routing.

import { createHash } from "node:crypto";
import type { ChannelMessage } from "./types.js";

/**
 * Parses a raw WhatsApp inbound payload (as forwarded by n8n) into
 * a normalized ChannelMessage. Returns null if the payload is malformed.
 * Never throws.
 */
export function parseWhatsAppPayload(raw: unknown): ChannelMessage | null {
  if (raw == null || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;

  const sender = typeof obj["sender"] === "string" ? obj["sender"] : undefined;
  const messageId =
    typeof obj["messageId"] === "string" ? obj["messageId"] : undefined;
  const text = typeof obj["text"] === "string" ? obj["text"] : undefined;

  if (!sender || !messageId || !text) return null;

  const timestamp =
    typeof obj["timestamp"] === "number"
      ? obj["timestamp"]
      : Date.now();

  const profileName =
    typeof obj["profileName"] === "string" ? obj["profileName"] : undefined;

  const senderHash = createHash("sha256").update(sender).digest("hex");

  return {
    senderHash,
    senderRaw: sender,
    messageId,
    text,
    timestamp,
    profileName,
    channel: "whatsapp",
  };
}
