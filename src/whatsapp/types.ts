// src/whatsapp/types.ts
// Channel adapter types for WhatsApp integration.
// Type-only dependency on core types — no runtime coupling.

import type { OrchestratorMode } from "../types.js";

// ─── Adapter-normalized inbound payload ──────────────────────────

/** Channel-agnostic message shape. Future channels produce this same type. */
export interface ChannelMessage {
  senderHash: string;       // SHA-256 of sender identifier
  senderRaw?: string;       // in-memory only — never persisted or logged
  messageId: string;        // dedup key
  text: string;             // user message
  timestamp: number;        // unix ms
  profileName?: string | undefined; // display name if available
  channel: "whatsapp";             // discriminator for future channels
}

/** What the handler returns to the bridge for delivery. */
export interface ChannelReply {
  to: string;               // raw sender (for transport to route reply)
  text: string;             // formatted response
}

// ─── WhatsApp-specific config ────────────────────────────────────

export interface WhatsAppConfig {
  enabled: boolean;
  allowedPhones: string[];            // E.164, hashed at check time
  maxMessagesPerHour: number;
  safeModes: OrchestratorMode[];      // only these modes allowed from WhatsApp
  n8nWebhookPath: string;
  hookToken: string;
  replyVia: "n8n" | "direct";
}

// ─── Audit logging ───────────────────────────────────────────────

export type WhatsAppDecision =
  | "allowed"
  | "blocked_phone"
  | "blocked_rate"
  | "blocked_replay"
  | "blocked_mode"
  | "blocked_disabled";

/** Audit log entry shape — senderHash only, never raw phone. */
export interface WhatsAppAuditEntry {
  timestamp: string;        // ISO
  senderHash: string;
  messageId: string;
  commandDetected: string;
  modeResolved: string;
  decision: WhatsAppDecision;
}
