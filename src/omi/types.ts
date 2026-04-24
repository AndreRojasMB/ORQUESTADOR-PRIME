// src/omi/types.ts
// Types for Omi webhook ingestion (memory_created events only).
// Phase 26B — ingestion adapter, no execution.

// ─── Inbound Omi webhook payload ────────────────────────────────

export interface OmiTranscriptSegment {
  text: string;
  speaker?: string;
  start?: number;
  end?: number;
}

export interface OmiStructuredMemory {
  title: string;
  overview: string;
  emoji?: string;
  category?: string;
  action_items?: string[];
}

export interface OmiMemoryPayload {
  id: string;
  created_at: string;
  structured: OmiStructuredMemory;
  transcript_segments?: OmiTranscriptSegment[];
}

export interface OmiWebhookPayload {
  type: string;
  memory: OmiMemoryPayload;
}

// ─── Normalized internal event ──────────────────────────────────

export interface OmiMemoryEvent {
  memoryId: string;          // from memory.id — dedup key
  title: string;             // from structured.title
  overview: string;          // from structured.overview
  category: string | null;   // from structured.category
  actionItems: string[];     // from structured.action_items
  transcript: string | null; // joined transcript_segments text
  timestamp: string;         // from created_at, validated ISO
  source: "omi";
}

// ─── Omi user config ────────────────────────────────────────────

export interface OmiConfig {
  enabled: boolean;
  allowedEventTypes: string[];
}
