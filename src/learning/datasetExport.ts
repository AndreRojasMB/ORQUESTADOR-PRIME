import { readActionStore } from "../actions/actionStore.js";
import { readChannelAuditStore } from "../actions/channelAuditStore.js";
import { readExecutionResultStore } from "../actions/executionResultStore.js";
import { readMemoryStore } from "../memory/memoryStore.js";
import { readTrajectoryStore } from "../trajectory/trajectoryStore.js";
import { DEFAULT_REMOVED_KINDS } from "./redaction.js";
import { buildLearningExportRecords } from "./trajectoryExport.js";
import { generatePreferencePairs } from "./preferencePairs.js";
import {
  LEARNING_EXPORT_SCHEMA_VERSION,
  type DatasetExportOptions,
  type DatasetExportResult,
  type LearningExportFilters,
  type LearningExportFormat,
  type LearningExportManifest,
  type LearningHeuristicLabel,
} from "./types.js";

function normalizeLimit(limit: number | undefined): number | null {
  if (limit === undefined) {
    return null;
  }
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("--limit must be a positive integer");
  }
  return limit;
}

function normalizeSince(since: string | undefined): string | null {
  if (since === undefined) {
    return null;
  }
  if (!Number.isFinite(Date.parse(since))) {
    throw new Error("--since must be a valid ISO-compatible date");
  }
  return since;
}

function buildFilters(options: DatasetExportOptions): LearningExportFilters {
  if (options.includeRaw === true) {
    throw new Error("--include-raw=true is not supported in this export-only phase");
  }

  return {
    limit: normalizeLimit(options.limit),
    since: normalizeSince(options.since),
    source: options.source ?? null,
    mode: options.mode ?? null,
    includePairs: options.includePairs ?? true,
    includeRaw: false,
  };
}

function countLabel(
  labels: Record<LearningHeuristicLabel, number>,
  label: LearningHeuristicLabel,
): number {
  return labels[label] ?? 0;
}

function buildManifest(input: {
  createdAt: string;
  filters: LearningExportFilters;
  records: DatasetExportResult["records"];
  preferencePairCount: number;
  sourceStores: LearningExportManifest["sourceStores"];
  warnings: string[];
}): LearningExportManifest {
  const labelCounts = input.records.reduce<Record<LearningHeuristicLabel, number>>(
    (counts, record) => {
      counts[record.heuristicLabel] = (counts[record.heuristicLabel] ?? 0) + 1;
      return counts;
    },
    {
      accepted: 0,
      usable: 0,
      rejected: 0,
      "needs-review": 0,
    },
  );

  return {
    schemaVersion: LEARNING_EXPORT_SCHEMA_VERSION,
    createdAt: input.createdAt,
    toolName: "learning-export",
    sourceStores: input.sourceStores,
    recordCounts: {
      total: input.records.length,
      accepted: countLabel(labelCounts, "accepted"),
      usable: countLabel(labelCounts, "usable"),
      rejected: countLabel(labelCounts, "rejected"),
      needsReview: countLabel(labelCounts, "needs-review"),
    },
    preferencePairCount: input.preferencePairCount,
    redactionPolicy: {
      defaultRedacted: true,
      rawExportSupported: false,
      removedKinds: [...DEFAULT_REMOVED_KINDS],
    },
    filters: input.filters,
    warnings: input.warnings,
  };
}

export async function buildLearningDatasetExport(
  options: DatasetExportOptions = {},
): Promise<DatasetExportResult> {
  const exportedAt = new Date().toISOString();
  const filters = buildFilters(options);

  const trajectoryStore = await readTrajectoryStore();
  const actionStore = await readActionStore();
  const executionResultStore = await readExecutionResultStore();
  const channelAuditStore = await readChannelAuditStore();
  const memoryStore = await readMemoryStore();

  const records = buildLearningExportRecords({
    trajectories: trajectoryStore.trajectories,
    actions: actionStore.proposals,
    executionResults: executionResultStore.results,
    channelAuditEntries: channelAuditStore.entries,
    memoryEntries: memoryStore.entries,
    filters,
    exportedAt,
  });
  const preferencePairs = filters.includePairs ? generatePreferencePairs(records) : [];
  const warnings = records.length === 0 ? ["no trajectories matched the selected filters"] : [];

  const manifest = buildManifest({
    createdAt: exportedAt,
    filters,
    records,
    preferencePairCount: preferencePairs.length,
    sourceStores: {
      trajectories: {
        version: trajectoryStore.version,
        count: trajectoryStore.trajectories.length,
      },
      actions: {
        version: actionStore.version,
        count: actionStore.proposals.length,
      },
      executionResults: {
        version: executionResultStore.version,
        count: executionResultStore.results.length,
      },
      channelAudit: {
        version: channelAuditStore.version,
        count: channelAuditStore.entries.length,
      },
      memory: {
        version: memoryStore.version,
        count: memoryStore.entries.length,
      },
    },
    warnings,
  });

  return {
    manifest,
    records,
    preferencePairs,
  };
}

export function formatDatasetExport(
  result: DatasetExportResult,
  format: LearningExportFormat,
  pretty = false,
): string {
  if (format === "json") {
    return JSON.stringify(result, null, pretty ? 2 : 0);
  }

  const lines = [
    { kind: "manifest", manifest: result.manifest },
    ...result.records.map((record) => ({ kind: "record", record })),
    ...result.preferencePairs.map((preferencePair) => ({
      kind: "preferencePair",
      preferencePair,
    })),
  ];

  return `${lines.map((line) => JSON.stringify(line)).join("\n")}\n`;
}
