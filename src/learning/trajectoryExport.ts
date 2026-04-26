import type { MemoryEntry } from "../types.js";
import type { Trajectory } from "../types.js";
import type {
  ActionProposal,
  ChannelAuditEntry,
  ExecutionResult,
} from "../actions/types.js";
import { classifyForDistillation } from "../trajectory/distillationClassifier.js";
import {
  collectUnsafeKeys,
  DEFAULT_REMOVED_KINDS,
  hashTask,
  taskPreview,
} from "./redaction.js";
import {
  assignHeuristicLabel,
  buildQualitySignals,
} from "./qualitySignals.js";
import {
  LEARNING_EXPORT_SCHEMA_VERSION,
  type LearningActionLink,
  type LearningChannelAuditLink,
  type LearningExecutionLink,
  type LearningExportFilters,
  type LearningExportRecord,
  type LearningMemoryLink,
} from "./types.js";

interface BuildLearningExportRecordsInput {
  trajectories: Trajectory[];
  actions: ActionProposal[];
  executionResults: ExecutionResult[];
  channelAuditEntries: ChannelAuditEntry[];
  memoryEntries: MemoryEntry[];
  filters: LearningExportFilters;
  exportedAt: string;
}

interface PreparedTrajectory {
  trajectory: Trajectory;
  actionLinks: LearningActionLink[];
  executionLinks: LearningExecutionLink[];
  channelAuditLinks: LearningChannelAuditLink[];
  memoryLink: LearningMemoryLink | null;
  privacyWarnings: string[];
}

function dateValue(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function toActionLink(action: ActionProposal): LearningActionLink {
  return {
    id: action.id,
    createdAt: action.createdAt,
    source: action.source,
    sourceEventId: action.sourceEventId,
    category: action.category,
    status: action.status,
    riskLevel: action.riskLevel,
    traceId: action.traceId,
    trajectoryId: action.trajectoryId,
    titlePreview: taskPreview(action.title, 120),
  };
}

function toExecutionLink(result: ExecutionResult): LearningExecutionLink {
  return {
    id: result.id,
    proposalId: result.proposalId,
    category: result.category,
    startedAt: result.startedAt,
    finishedAt: result.finishedAt,
    durationMs: result.durationMs,
    outcome: result.outcome,
    ok: result.ok,
  };
}

function toChannelAuditLink(entry: ChannelAuditEntry): LearningChannelAuditLink {
  return {
    id: entry.id,
    timestamp: entry.timestamp,
    decision: entry.decision,
    reasonCode: entry.reasonCode,
    channel: entry.channel,
    operation: entry.operation,
    category: entry.category,
    proposalId: entry.proposalId,
    sourceEventId: entry.sourceEventId,
    correlationId: entry.correlationId,
    runId: entry.runId,
  };
}

function toMemoryLink(entry: MemoryEntry): LearningMemoryLink {
  return {
    id: entry.id,
    type: entry.type,
    timestamp: entry.timestamp,
    source: entry.source,
    traceId: entry.traceId,
    taskHash: hashTask(entry.task),
    taskPreview: taskPreview(entry.task),
  };
}

function linkTrajectory(input: {
  trajectory: Trajectory;
  actions: ActionProposal[];
  executionResults: ExecutionResult[];
  channelAuditEntries: ChannelAuditEntry[];
  memoryEntries: MemoryEntry[];
}): PreparedTrajectory {
  const { trajectory, actions, executionResults, channelAuditEntries, memoryEntries } = input;

  const linkedActions = actions.filter(
    (action) =>
      action.trajectoryId === trajectory.id ||
      action.traceId === trajectory.traceId,
  );
  const actionIds = new Set(linkedActions.map((action) => action.id));
  const actionSourceEventIds = new Set(
    linkedActions
      .map((action) => action.sourceEventId)
      .filter((sourceEventId): sourceEventId is string => Boolean(sourceEventId)),
  );

  const linkedExecutions = executionResults.filter((result) =>
    actionIds.has(result.proposalId),
  );

  const linkedAuditEntries = channelAuditEntries.filter((entry) => {
    if (entry.proposalId && actionIds.has(entry.proposalId)) {
      return true;
    }
    if (entry.sourceEventId && actionSourceEventIds.has(entry.sourceEventId)) {
      return true;
    }
    return entry.correlationId === trajectory.traceId || entry.runId === trajectory.traceId;
  });

  const linkedMemory = memoryEntries.find(
    (entry) =>
      entry.id === trajectory.memoryEntryId ||
      (entry.traceId !== null && entry.traceId === trajectory.traceId),
  );

  const unsafeParameterKeys = unique(
    linkedActions.flatMap((action) => collectUnsafeKeys(action.parameters)),
  );

  const privacyWarnings =
    unsafeParameterKeys.length > 0
      ? [`linked action parameters contained redacted key(s): ${unsafeParameterKeys.join(", ")}`]
      : [];

  return {
    trajectory,
    actionLinks: linkedActions.map(toActionLink),
    executionLinks: linkedExecutions.map(toExecutionLink),
    channelAuditLinks: linkedAuditEntries.map(toChannelAuditLink),
    memoryLink: linkedMemory ? toMemoryLink(linkedMemory) : null,
    privacyWarnings,
  };
}

function matchesFilters(prepared: PreparedTrajectory, filters: LearningExportFilters): boolean {
  const { trajectory, actionLinks, channelAuditLinks } = prepared;

  if (filters.since && dateValue(trajectory.createdAt) < dateValue(filters.since)) {
    return false;
  }

  if (filters.mode && trajectory.intent.mode !== filters.mode) {
    return false;
  }

  if (filters.source) {
    if (trajectory.source === filters.source) {
      return true;
    }
    if (actionLinks.some((action) => action.source === filters.source)) {
      return true;
    }
    if (channelAuditLinks.some((entry) => entry.channel === filters.source)) {
      return true;
    }
    return false;
  }

  return true;
}

function toRecord(prepared: PreparedTrajectory, exportedAt: string): LearningExportRecord {
  const { trajectory, actionLinks, executionLinks, channelAuditLinks, memoryLink, privacyWarnings } = prepared;
  const distillation = classifyForDistillation(trajectory);
  const labelInput = {
    trajectory,
    distillation,
    actionLinks,
    executionLinks,
    channelAuditLinks,
  };

  return {
    schemaVersion: LEARNING_EXPORT_SCHEMA_VERSION,
    recordType: "trajectory",
    exportedAt,
    trajectoryId: trajectory.id,
    createdAt: trajectory.createdAt,
    traceId: trajectory.traceId,
    memoryEntryId: trajectory.memoryEntryId,
    source: trajectory.source,
    mode: trajectory.intent.mode,
    taskHash: hashTask(trajectory.intent.task || trajectory.userMessage),
    taskPreview: taskPreview(trajectory.intent.task || trajectory.userMessage),
    agentsUsed: trajectory.agentsUsed.slice(),
    providerCalls: trajectory.providerCalls.map((call) => ({
      provider: call.provider,
      model: call.model,
      inputTokens: call.inputTokens,
      outputTokens: call.outputTokens,
      durationMs: call.durationMs,
    })),
    toolCallCount: trajectory.toolCalls.length,
    errorCount: trajectory.errors.length,
    errorPhases: unique(trajectory.errors.map((error) => taskPreview(error.phase, 80))),
    durationMs: trajectory.durationMs,
    parseSuccess: trajectory.result.parseSuccess,
    rawLength: trajectory.result.rawLength,
    approvalStatus: trajectory.approvalStatus,
    outcome: trajectory.outcome,
    judgeScore: trajectory.judgeScore,
    distillation: {
      tier: distillation.tier,
      reasons: distillation.reasons.map((reason) => taskPreview(reason, 120)),
    },
    heuristicLabel: assignHeuristicLabel(labelInput),
    labelSource: "heuristic",
    qualitySignals: buildQualitySignals(labelInput),
    actionLinks,
    executionLinks,
    channelAuditLinks,
    memoryLink,
    privacy: {
      redacted: true,
      includeRaw: false,
      removedKinds: [...DEFAULT_REMOVED_KINDS],
      warnings: privacyWarnings,
    },
  };
}

export function buildLearningExportRecords(
  input: BuildLearningExportRecordsInput,
): LearningExportRecord[] {
  const prepared = input.trajectories
    .slice()
    .sort((a, b) => dateValue(a.createdAt) - dateValue(b.createdAt))
    .map((trajectory) =>
      linkTrajectory({
        trajectory,
        actions: input.actions,
        executionResults: input.executionResults,
        channelAuditEntries: input.channelAuditEntries,
        memoryEntries: input.memoryEntries,
      }),
    )
    .filter((entry) => matchesFilters(entry, input.filters));

  const limited =
    input.filters.limit !== null
      ? prepared.slice(-input.filters.limit)
      : prepared;

  return limited.map((entry) => toRecord(entry, input.exportedAt));
}
