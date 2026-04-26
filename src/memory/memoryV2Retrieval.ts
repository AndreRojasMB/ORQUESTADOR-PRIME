import { deriveProjectIdentity } from "../supervisor/projectIdentity.js";
import type { ProjectIdentity } from "../supervisor/types.js";
import { readMemoryV1AsV2Candidates } from "./memoryV1Adapter.js";
import { createMemoryV2ProjectScope, readMemoryV2Store } from "./memoryV2Store.js";
import {
  type MemoryV2Entry,
  type MemoryV2EntryType,
  type MemoryV2RetrievalQuery,
  type MemoryV2RetrievalResponse,
  type MemoryV2RetrievalResult,
  type MemoryV2SafeContext,
} from "./memoryV2Types.js";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 25;
const LOW_SCORE_CUTOFF = 0.5;

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "para",
  "como",
  "con",
  "una",
  "del",
  "los",
  "las",
  "que",
  "por",
]);

interface FilterCounters {
  projectMismatch: number;
  expired: number;
  privacy: number;
  unsafeRedaction: number;
  lowScore: number;
}

function clampLimit(limit: number | undefined): number {
  if (limit === undefined) {
    return DEFAULT_LIMIT;
  }
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("Memory V2 retrieval limit must be a positive integer");
  }
  return Math.min(limit, MAX_LIMIT);
}

function normalizeTag(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function ageDays(createdAt: string, nowMs: number): number {
  const createdMs = Date.parse(createdAt);
  if (!Number.isFinite(createdMs)) {
    return 0;
  }
  return Math.max(0, Math.floor((nowMs - createdMs) / 86_400_000));
}

function isExpired(entry: MemoryV2Entry, nowMs: number): boolean {
  if (!entry.retention.expiresAt) {
    return false;
  }
  const expiresMs = Date.parse(entry.retention.expiresAt);
  return Number.isFinite(expiresMs) && expiresMs < nowMs;
}

function isPrivacyAllowed(entry: MemoryV2Entry, allowPrivate: boolean): boolean {
  if (entry.privacy.label === "secret") {
    return false;
  }
  if (entry.privacy.label === "private" && !allowPrivate) {
    return false;
  }
  return entry.privacy.allowedForPrompt;
}

function hasUnsafeRedaction(entry: MemoryV2Entry): boolean {
  return (
    !entry.redaction.redacted ||
    entry.redaction.containsRawIdentity ||
    entry.redaction.containsSecrets
  );
}

function scoreEntry(input: {
  entry: MemoryV2Entry;
  queryTokens: string[];
  tags: string[];
  type: MemoryV2EntryType | null;
  nowMs: number;
}): { score: number; reasons: string[] } {
  const { entry, queryTokens, tags, type, nowMs } = input;
  let score = 0;
  const reasons: string[] = ["project-scope-match"];

  if (type && entry.type === type) {
    score += 3;
    reasons.push("type-match");
  }

  const entryTags = new Set(entry.tags.map(normalizeTag));
  for (const tag of tags) {
    if (entryTags.has(tag)) {
      score += 2;
      reasons.push(`tag-match:${tag}`);
    }
  }

  const searchable = `${entry.title} ${entry.summary} ${entry.tags.join(" ")}`;
  const entryTokens = new Set(tokenize(searchable));
  let keywordMatches = 0;
  for (const token of queryTokens) {
    if (entryTokens.has(token)) {
      keywordMatches++;
    }
  }
  if (keywordMatches > 0) {
    score += Math.min(keywordMatches * 1.25, 5);
    reasons.push(`keyword-overlap:${keywordMatches}`);
  }

  const age = ageDays(entry.createdAt, nowMs);
  if (age <= 7) {
    score += 1;
    reasons.push("recent");
  } else if (age <= 30) {
    score += 0.5;
    reasons.push("recent-ish");
  }

  if (entry.priority === "high") {
    score += 2;
    reasons.push("high-priority");
  } else if (entry.priority === "medium") {
    score += 1;
    reasons.push("medium-priority");
  }

  if (entry.confidence === "high") {
    score += 1;
    reasons.push("high-confidence");
  } else if (entry.confidence === "medium") {
    score += 0.5;
    reasons.push("medium-confidence");
  }

  if (entry.source === "manual" || entry.source === "supervisor") {
    score += 0.75;
    reasons.push(`trusted-source:${entry.source}`);
  } else if (entry.source === "v1-adapter") {
    score += 0.25;
    reasons.push("v1-backfill");
  }

  return {
    score: Math.round(score * 100) / 100,
    reasons,
  };
}

function toSafeContext(
  entry: MemoryV2Entry,
  nowMs: number,
): MemoryV2SafeContext {
  return {
    title: entry.title,
    summary: entry.summary,
    tags: entry.tags.slice(),
    type: entry.type,
    ageDays: ageDays(entry.createdAt, nowMs),
    privacyLabel: entry.privacy.label,
  };
}

async function collectCandidates(query: MemoryV2RetrievalQuery): Promise<{
  identity: ProjectIdentity;
  entries: MemoryV2Entry[];
}> {
  const identity = deriveProjectIdentity(query.projectRoot);
  const projectScope = await createMemoryV2ProjectScope(identity.projectRoot);
  const store = await readMemoryV2Store();
  const entries = store.entries.slice();

  if (query.includeV1Backfill === true) {
    const v1Candidates = await readMemoryV1AsV2Candidates(projectScope);
    entries.push(...v1Candidates.map((candidate) => candidate.entry));
  }

  return { identity, entries };
}

export async function retrieveMemoryV2(
  query: MemoryV2RetrievalQuery,
): Promise<MemoryV2RetrievalResponse> {
  const { identity, entries } = await collectCandidates(query);
  const nowMs = Date.parse(query.now ?? new Date().toISOString());
  const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
  const limit = clampLimit(query.limit);
  const tags = unique((query.tags ?? []).map(normalizeTag).filter((tag) => tag.length > 0));
  const queryTokens = unique(tokenize(query.query));
  const filtered: FilterCounters = {
    projectMismatch: 0,
    expired: 0,
    privacy: 0,
    unsafeRedaction: 0,
    lowScore: 0,
  };

  const scored: MemoryV2RetrievalResult[] = [];

  for (const entry of entries) {
    if (entry.projectScope.projectId !== identity.projectId) {
      filtered.projectMismatch++;
      continue;
    }
    if (isExpired(entry, safeNowMs)) {
      filtered.expired++;
      continue;
    }
    if (!isPrivacyAllowed(entry, query.allowPrivate === true)) {
      filtered.privacy++;
      continue;
    }
    if (hasUnsafeRedaction(entry) && query.allowUnsafeRedaction !== true) {
      filtered.unsafeRedaction++;
      continue;
    }

    const scoredEntry = scoreEntry({
      entry,
      queryTokens,
      tags,
      type: query.type ?? null,
      nowMs: safeNowMs,
    });

    if (scoredEntry.score < LOW_SCORE_CUTOFF) {
      filtered.lowScore++;
      continue;
    }

    scored.push({
      entryId: entry.id,
      score: scoredEntry.score,
      reasons: scoredEntry.reasons,
      safeContext: toSafeContext(entry, safeNowMs),
    });
  }

  scored.sort((a, b) => b.score - a.score || a.entryId.localeCompare(b.entryId));

  return {
    project: {
      projectId: identity.projectId,
      projectName: identity.projectName,
      projectRootHash: identity.projectRootHash,
    },
    query: {
      text: query.query,
      tags,
      type: query.type ?? null,
      includeV1Backfill: query.includeV1Backfill === true,
      allowPrivate: query.allowPrivate === true,
      allowUnsafeRedaction: query.allowUnsafeRedaction === true,
      limit,
    },
    results: scored.slice(0, limit),
    totalCandidates: entries.length,
    filtered,
  };
}
