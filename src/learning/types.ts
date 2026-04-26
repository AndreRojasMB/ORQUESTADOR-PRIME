import type {
  ApprovalStatus,
  OrchestratorMode,
  OutcomeStatus,
  TrajectoryProviderCall,
  TrajectorySource,
} from "../types.js";
import type {
  ActionCategory,
  ActionRiskLevel,
  ActionSource,
  ActionStatus,
  ChannelAuditDecision,
  ChannelAuditReasonCode,
  ChannelKind,
  ChannelOperation,
  ExecutionOutcome,
} from "../actions/types.js";
import type { DistillationTier } from "../trajectory/distillationClassifier.js";

export const LEARNING_EXPORT_SCHEMA_VERSION = "1.0";

export type LearningExportFormat = "json" | "jsonl";

export type LearningExportSource =
  | Exclude<TrajectorySource, null>
  | "openclaw"
  | "system";

export type LearningHeuristicLabel =
  | "accepted"
  | "usable"
  | "rejected"
  | "needs-review";

export type QualitySignalPolarity = "positive" | "negative" | "neutral";

export interface QualitySignal {
  code: string;
  polarity: QualitySignalPolarity;
  weight: number;
  confidence: "high" | "medium" | "low";
  evidence: string;
  heuristic: true;
}

export interface LearningProviderCall {
  provider: TrajectoryProviderCall["provider"];
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  durationMs: number;
}

export interface LearningActionLink {
  id: string;
  createdAt: string;
  source: ActionSource;
  sourceEventId: string | null;
  category: ActionCategory;
  status: ActionStatus;
  riskLevel: ActionRiskLevel;
  traceId: string | null;
  trajectoryId: string | null;
  titlePreview: string;
}

export interface LearningExecutionLink {
  id: string;
  proposalId: string;
  category: ActionCategory;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  outcome: ExecutionOutcome;
  ok: boolean;
}

export interface LearningChannelAuditLink {
  id: string;
  timestamp: string;
  decision: ChannelAuditDecision;
  reasonCode: ChannelAuditReasonCode;
  channel: ChannelKind;
  operation: ChannelOperation;
  category: ActionCategory | null;
  proposalId: string | null;
  sourceEventId: string | null;
  correlationId: string | null;
  runId: string | null;
}

export interface LearningMemoryLink {
  id: string;
  type: string;
  timestamp: string;
  source: TrajectorySource | undefined;
  traceId: string | null;
  taskHash: string;
  taskPreview: string;
}

export interface LearningPrivacyMetadata {
  redacted: true;
  includeRaw: false;
  removedKinds: string[];
  warnings: string[];
}

export interface LearningExportRecord {
  schemaVersion: typeof LEARNING_EXPORT_SCHEMA_VERSION;
  recordType: "trajectory";
  exportedAt: string;
  trajectoryId: string;
  createdAt: string;
  traceId: string;
  memoryEntryId: string | null;
  source: TrajectorySource;
  mode: OrchestratorMode;
  taskHash: string;
  taskPreview: string;
  agentsUsed: string[];
  providerCalls: LearningProviderCall[];
  toolCallCount: number;
  errorCount: number;
  errorPhases: string[];
  durationMs: number;
  parseSuccess: boolean;
  rawLength: number;
  approvalStatus: ApprovalStatus;
  outcome: OutcomeStatus;
  judgeScore: number | null;
  distillation: {
    tier: DistillationTier;
    reasons: string[];
  };
  heuristicLabel: LearningHeuristicLabel;
  labelSource: "heuristic";
  qualitySignals: QualitySignal[];
  actionLinks: LearningActionLink[];
  executionLinks: LearningExecutionLink[];
  channelAuditLinks: LearningChannelAuditLink[];
  memoryLink: LearningMemoryLink | null;
  privacy: LearningPrivacyMetadata;
}

export interface PreferencePair {
  schemaVersion: typeof LEARNING_EXPORT_SCHEMA_VERSION;
  id: string;
  chosenTrajectoryId: string;
  rejectedTrajectoryId: string;
  chosenLabel: LearningHeuristicLabel;
  rejectedLabel: LearningHeuristicLabel;
  mode: OrchestratorMode;
  source: TrajectorySource;
  overlapScore: number;
  basis: string[];
  reasonCodes: string[];
  heuristicConfidence: "high" | "medium" | "low";
  requiresHumanReview: true;
}

export interface LearningExportFilters {
  limit: number | null;
  since: string | null;
  source: LearningExportSource | null;
  mode: OrchestratorMode | string | null;
  includePairs: boolean;
  includeRaw: false;
}

export interface LearningExportManifest {
  schemaVersion: typeof LEARNING_EXPORT_SCHEMA_VERSION;
  createdAt: string;
  toolName: "learning-export";
  sourceStores: {
    trajectories: { version: string; count: number };
    actions: { version: string; count: number };
    executionResults: { version: string; count: number };
    channelAudit: { version: string; count: number };
    memory: { version: string; count: number };
  };
  recordCounts: {
    total: number;
    accepted: number;
    usable: number;
    rejected: number;
    needsReview: number;
  };
  preferencePairCount: number;
  redactionPolicy: {
    defaultRedacted: true;
    rawExportSupported: false;
    removedKinds: string[];
  };
  filters: LearningExportFilters;
  warnings: string[];
}

export interface DatasetExportResult {
  manifest: LearningExportManifest;
  records: LearningExportRecord[];
  preferencePairs: PreferencePair[];
}

export interface DatasetExportOptions {
  format?: LearningExportFormat;
  limit?: number;
  since?: string;
  source?: LearningExportSource;
  mode?: OrchestratorMode | string;
  includePairs?: boolean;
  includeRaw?: boolean;
  pretty?: boolean;
}
