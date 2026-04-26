import type {
  ApprovalStatus,
  OrchestratorMode,
  OutcomeStatus,
  TrajectorySource,
} from "../types.js";
import type {
  ActionCategory,
  ActionRiskLevel,
  ActionSource,
  ActionStatus,
  ChannelAuditReasonCode,
  ChannelKind,
  ChannelOperation,
  ExecutionOutcome,
} from "../actions/types.js";

export const SUPERVISOR_GOALS_STORE_VERSION = "1.0";
export const SUPERVISOR_REPORT_SCHEMA_VERSION = "1.0";

export interface ProjectIdentity {
  projectId: string;
  projectName: string;
  projectRoot: string;
  projectRootHash: string;
}

export type ProjectGoalStatus =
  | "active"
  | "blocked"
  | "done"
  | "deferred"
  | "dropped";

export type ProjectGoalPriority = "low" | "medium" | "high";

export type ProjectGoalSource = "manual" | "supervisor";

export type ProjectGoalPrivacyLabel = "public" | "internal" | "private";

export interface ProjectGoalLinks {
  traceIds: string[];
  proposalIds: string[];
  docs: string[];
}

export interface ProjectGoal {
  id: string;
  title: string;
  description: string;
  status: ProjectGoalStatus;
  priority: ProjectGoalPriority;
  source: ProjectGoalSource;
  createdAt: string;
  updatedAt: string;
  targetPhase?: string;
  successCriteria: string[];
  blockers: string[];
  riskNotes: string[];
  privacyLabel: ProjectGoalPrivacyLabel;
  links: ProjectGoalLinks;
}

export interface ProjectGoalsState {
  projectId: string;
  projectName: string;
  projectRootHash: string;
  createdAt: string;
  updatedAt: string;
  goals: ProjectGoal[];
}

export interface SupervisorGoalsStoreData {
  version: typeof SUPERVISOR_GOALS_STORE_VERSION;
  projects: Record<string, ProjectGoalsState>;
}

export interface SupervisorGoalSummary {
  total: number;
  active: number;
  blocked: number;
  done: number;
  deferred: number;
  dropped: number;
  highPriorityActive: number;
  activeGoals: Array<{
    id: string;
    title: string;
    priority: ProjectGoalPriority;
    status: ProjectGoalStatus;
    targetPhase: string | null;
    blockerCount: number;
  }>;
}

export interface SupervisorTrajectorySummary {
  total: number;
  recentCount: number;
  parseFailures: number;
  errorCount: number;
  byMode: Partial<Record<OrchestratorMode, number>>;
  byOutcome: Record<string, number>;
  latest: Array<{
    id: string;
    createdAt: string;
    mode: OrchestratorMode;
    source: TrajectorySource;
    outcome: OutcomeStatus;
    approvalStatus: ApprovalStatus;
    judgeScore: number | null;
    parseSuccess: boolean;
    errorCount: number;
  }>;
}

export interface SupervisorActionSummary {
  total: number;
  byStatus: Partial<Record<ActionStatus, number>>;
  byCategory: Partial<Record<ActionCategory, number>>;
  pendingReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
  recent: Array<{
    id: string;
    createdAt: string;
    source: ActionSource;
    category: ActionCategory;
    status: ActionStatus;
    riskLevel: ActionRiskLevel;
    titlePreview: string;
    traceId: string | null;
    trajectoryId: string | null;
  }>;
}

export interface SupervisorExecutionSummary {
  total: number;
  successful: number;
  failed: number;
  blocked: number;
  byOutcome: Partial<Record<ExecutionOutcome, number>>;
  recent: Array<{
    id: string;
    proposalId: string;
    category: ActionCategory;
    startedAt: string;
    finishedAt: string;
    durationMs: number;
    outcome: ExecutionOutcome;
    ok: boolean;
  }>;
}

export interface SupervisorChannelAuditSummary {
  total: number;
  allowed: number;
  blocked: number;
  byChannel: Partial<Record<ChannelKind, number>>;
  byOperation: Partial<Record<ChannelOperation, number>>;
  byReasonCode: Partial<Record<ChannelAuditReasonCode, number>>;
  recentBlocked: Array<{
    id: string;
    timestamp: string;
    channel: ChannelKind;
    operation: ChannelOperation;
    reasonCode: ChannelAuditReasonCode;
    category: ActionCategory | null;
    proposalId: string | null;
    sourceEventId: string | null;
  }>;
}

export interface SupervisorMemorySummary {
  total: number;
  recent: Array<{
    id: string;
    type: string;
    timestamp: string;
    source: TrajectorySource | undefined;
    traceId: string | null;
    taskPreview: string;
  }>;
}

export type SupervisorRiskSeverity = "low" | "medium" | "high";

export interface SupervisorRisk {
  id: string;
  severity: SupervisorRiskSeverity;
  title: string;
  summary: string;
  evidence: string[];
  advisoryOnly: true;
}

export type SupervisorRecommendationKind =
  | "define-goals"
  | "review-proposals"
  | "inspect-failures"
  | "inspect-channel-blocks"
  | "continue-roadmap"
  | "run-verification"
  | "reduce-risk";

export interface SupervisorRecommendation {
  id: string;
  kind: SupervisorRecommendationKind;
  priority: ProjectGoalPriority;
  title: string;
  rationale: string;
  nextSafeStep: string;
  forbiddenShortcuts: string[];
  advisoryOnly: true;
}

export interface SupervisorAdvisoryReport {
  schemaVersion: typeof SUPERVISOR_REPORT_SCHEMA_VERSION;
  generatedAt: string;
  project: {
    projectId: string;
    projectName: string;
    projectRootHash: string;
  };
  boundaries: {
    advisoryOnly: true;
    noProviderCalls: true;
    cannotApproveRejectOrDispatch: true;
    cannotGrantOrConsumeSecondApproval: true;
    cannotCreateProposals: true;
    cannotMutateExistingStores: true;
  };
  goals: SupervisorGoalSummary;
  trajectories: SupervisorTrajectorySummary;
  actions: SupervisorActionSummary;
  executions: SupervisorExecutionSummary;
  channelAudit: SupervisorChannelAuditSummary;
  memory: SupervisorMemorySummary;
  risks: SupervisorRisk[];
  blockers: string[];
  recommendations: SupervisorRecommendation[];
}

export interface BuildSupervisorReportOptions {
  projectRoot?: string;
  recentLimit?: number;
  now?: string;
}
