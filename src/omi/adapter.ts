// src/omi/adapter.ts
// Omi memory_created ingestion adapter.
// Validates, normalizes, deduplicates, and writes to memoryStore.
// Phase 26B — ingestion only, no execution, no trajectories.

import { readMemoryStore, appendMemoryEntry } from "../memory/memoryStore.js";
import { logger } from "../observability/logger.js";
import type { MemoryEntry } from "../types.js";
import { processOmiActionItems } from "./actionItems.js";
import type {
  OmiActionProposalContext,
  OmiActionProposalSummary,
} from "./actionItems.js";
import type { UserConfig } from "../config/userConfig.js";
import type { OmiWebhookPayload, OmiMemoryEvent } from "./types.js";

// ─── In-memory dedup fast path ──────────────────────────────────

const DEDUP_MAX = 1000;
const seenIds = new Set<string>();

function markSeen(id: string): void {
  if (seenIds.size >= DEDUP_MAX) {
    // Evict oldest — Sets iterate in insertion order
    const first = seenIds.values().next().value as string;
    seenIds.delete(first);
  }
  seenIds.add(id);
}

// ─── Payload validation ─────────────────────────────────────────

export function validateOmiPayload(
  raw: unknown,
): { ok: true; payload: OmiWebhookPayload } | { ok: false; reason: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, reason: "Payload is not an object" };
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj["type"] !== "string" || !obj["type"]) {
    return { ok: false, reason: "Missing or invalid 'type' field" };
  }

  if (!obj["memory"] || typeof obj["memory"] !== "object") {
    return { ok: false, reason: "Missing or invalid 'memory' field" };
  }

  const memory = obj["memory"] as Record<string, unknown>;

  if (typeof memory["id"] !== "string" || !memory["id"]) {
    return { ok: false, reason: "Missing or invalid 'memory.id'" };
  }

  if (typeof memory["created_at"] !== "string" || !memory["created_at"]) {
    return { ok: false, reason: "Missing or invalid 'memory.created_at'" };
  }

  if (!memory["structured"] || typeof memory["structured"] !== "object") {
    return { ok: false, reason: "Missing or invalid 'memory.structured'" };
  }

  const structured = memory["structured"] as Record<string, unknown>;

  if (typeof structured["title"] !== "string" || !structured["title"]) {
    return { ok: false, reason: "Missing or invalid 'memory.structured.title'" };
  }

  if (typeof structured["overview"] !== "string" || !structured["overview"]) {
    return { ok: false, reason: "Missing or invalid 'memory.structured.overview'" };
  }

  return { ok: true, payload: raw as OmiWebhookPayload };
}

// ─── Normalization ──────────────────────────────────────────────

export function normalizeOmiEvent(payload: OmiWebhookPayload): OmiMemoryEvent {
  const { memory } = payload;
  const { structured } = memory;

  // Join transcript segments into a single string if present
  let transcript: string | null = null;
  if (
    Array.isArray(memory.transcript_segments) &&
    memory.transcript_segments.length > 0
  ) {
    transcript = memory.transcript_segments
      .map((seg) => seg.text)
      .filter(Boolean)
      .join(" ")
      .trim() || null;
  }

  // Validate timestamp — fallback to now if unparseable
  let timestamp = memory.created_at;
  if (Number.isNaN(Date.parse(timestamp))) {
    timestamp = new Date().toISOString();
  }

  return {
    memoryId: memory.id,
    title: structured.title.trim(),
    overview: structured.overview.trim(),
    category: structured.category?.trim() ?? null,
    actionItems: Array.isArray(structured.action_items)
      ? structured.action_items.filter((item): item is string => typeof item === "string")
      : [],
    transcript,
    timestamp,
    source: "omi",
  };
}

// ─── Keyword extraction from Omi event ──────────────────────────

function extractKeywords(event: OmiMemoryEvent): string[] {
  const words = new Set<string>();

  // Category as keyword
  if (event.category) {
    words.add(event.category.toLowerCase());
  }

  // Title words (3+ chars, lowercased, skip common words)
  const stopWords = new Set(["the", "and", "for", "with", "from", "that", "this", "was", "are", "has"]);
  for (const word of event.title.toLowerCase().split(/\s+/)) {
    const clean = word.replace(/[^a-z0-9]/g, "");
    if (clean.length >= 3 && !stopWords.has(clean)) {
      words.add(clean);
    }
  }

  return [...words].slice(0, 10);
}

// ─── Deduplication (in-memory fast path + store check) ──────────

async function isDuplicate(entryId: string): Promise<boolean> {
  // Fast path — in-memory Set
  if (seenIds.has(entryId)) {
    return true;
  }

  // Slow path — check persisted store for restart resilience
  const store = await readMemoryStore();
  return store.entries.some((e) => e.id === entryId);
}

// ─── Main ingestion function ────────────────────────────────────

export interface IngestResult {
  status: "ingested" | "duplicate" | "invalid";
  entryId?: string;
  reason?: string;
  actionProposals?: OmiActionProposalSummary;
}

export interface IngestOmiMemoryOptions {
  userConfig?: UserConfig;
  actionProposalContext?: OmiActionProposalContext;
}

export async function ingestOmiMemory(
  raw: unknown,
  options: IngestOmiMemoryOptions = {},
): Promise<IngestResult> {
  // Validate
  const validation = validateOmiPayload(raw);
  if (!validation.ok) {
    logger.warn("omi:adapter invalid payload", { reason: validation.reason });
    return { status: "invalid", reason: validation.reason };
  }

  // Normalize
  const event = normalizeOmiEvent(validation.payload);
  const entryId = `omi-${event.memoryId}`;

  // Deduplicate
  if (await isDuplicate(entryId)) {
    logger.info("omi:adapter duplicate skipped", { entryId });
    return { status: "duplicate", entryId };
  }

  // Build MemoryEntry — use "plan" as the closest existing MemoryEntryType
  // Source discrimination is via the source field, not the type field
  const entry: MemoryEntry = {
    id: entryId,
    type: "plan",
    task: event.title,
    timestamp: event.timestamp,
    agents: [],
    keywords: extractKeywords(event),
    summary: event.overview.slice(0, 500),
    traceId: null,
    source: "omi",
  };

  // Persist
  try {
    await appendMemoryEntry(entry);
    markSeen(entryId);
    logger.info("omi:adapter memory ingested", { entryId, title: event.title });

    const actionProposalContext = options.actionProposalContext ?? {
      trusted: false,
      trustReason: "omi action proposal trust context missing",
    };
    let actionProposals: OmiActionProposalSummary | undefined;
    try {
      actionProposals = await processOmiActionItems(
        event,
        actionProposalContext,
        options.userConfig ? { config: options.userConfig } : {},
      );
      if (actionProposals.explicitCount > 0) {
        logger.info("omi:adapter action items processed", {
          entryId,
          explicitCount: actionProposals.explicitCount,
          created: actionProposals.created,
          blocked: actionProposals.blocked,
        });
      }
    } catch (err) {
      logger.warn("omi:adapter action item processing failed", {
        entryId,
        error: String(err),
      });
      actionProposals = {
        explicitCount: 0,
        attempted: 0,
        created: 0,
        blocked: 0,
        proposalIds: [],
        blockedReasonCodes: ["unknown-error"],
      };
    }

    return actionProposals.explicitCount > 0
      ? { status: "ingested", entryId, actionProposals }
      : { status: "ingested", entryId };
  } catch (err) {
    logger.warn("omi:adapter write failed", { entryId, error: String(err) });
    return { status: "invalid", entryId, reason: "Memory write failed" };
  }
}
