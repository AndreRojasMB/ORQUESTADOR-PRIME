import { readMemoryStore } from "./memoryStore.js";
import {
  MEMORY_V2_ENTRY_SCHEMA_VERSION,
  type MemoryV1BackfillCandidate,
  type MemoryV2Entry,
  type MemoryV2ProjectScope,
} from "./memoryV2Types.js";
import { safeMemoryV2Preview } from "./memoryV2Redaction.js";

function tagsFromKeywords(keywords: string[]): string[] {
  return keywords
    .map((keyword) =>
      keyword
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter((tag) => tag.length > 0);
}

export async function readMemoryV1AsV2Candidates(
  projectScope: MemoryV2ProjectScope,
): Promise<MemoryV1BackfillCandidate[]> {
  const store = await readMemoryStore();

  return store.entries.map((entry) => {
    const title = safeMemoryV2Preview(entry.task, 160);
    const summary = safeMemoryV2Preview(entry.summary ?? entry.task, 600);
    const preview = safeMemoryV2Preview(`${entry.task} ${entry.summary ?? ""}`);

    const converted: MemoryV2Entry = {
      id: `v1_${entry.id}`,
      schemaVersion: MEMORY_V2_ENTRY_SCHEMA_VERSION,
      createdAt: entry.timestamp,
      updatedAt: entry.timestamp,
      projectScope,
      type: "run-summary",
      title: title.text,
      summary: summary.text,
      tags: tagsFromKeywords(entry.keywords),
      source: "v1-adapter",
      links: {
        traceIds: entry.traceId ? [entry.traceId] : [],
        trajectoryIds: [],
        proposalIds: [],
        executionResultIds: [],
        channelAuditIds: [],
        memoryV1Ids: [entry.id],
        docs: [],
      },
      privacy: {
        label: "project",
        allowedForPrompt: true,
        allowCrossProject: false,
        reason: "V1 backfill uses redacted task/summary preview only",
      },
      redaction: {
        redacted: true,
        redactionVersion: "1.0",
        removedKinds: preview.removedKinds,
        containsRawIdentity: preview.containsRawIdentity,
        containsSecrets: preview.containsSecrets,
        safePreview: preview.text,
      },
      retention: {
        expiresAt: null,
        ttlDays: null,
        retainUntilExplicitlyDeleted: true,
      },
      priority: "low",
      confidence: "low",
    };

    return {
      entry: converted,
      original: entry,
    };
  });
}
