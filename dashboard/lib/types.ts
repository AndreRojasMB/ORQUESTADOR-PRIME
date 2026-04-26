// dashboard/lib/types.ts
// Dashboard-local type definitions mirroring the orchestrator's data shapes.
// These types describe the JSON structures stored on disk — they carry no
// runtime coupling to the orchestrator and are safe to import from any
// Server Component or Server Action.

// ─── Orchestrator Modes ─────────────────────────────────────────

export type OrchestratorMode =
  | "plan"
  | "route"
  | "blueprint"
  | "audit"
  | "scaffold"
  | "memory"
  | "init"
  | "execute"
  | "chat";

// ─── Provider ───────────────────────────────────────────────────

export type ProviderName = "openai" | "anthropic" | "openclaw";

// ─── Trace (from src/observability/tracer.ts) ───────────────────

export interface PhaseTrace {
  phase: string;
  startedAt: number;
  durationMs: number;
}

export interface ProviderTrace {
  provider: ProviderName;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  durationMs: number;
}

export interface TraceRecord {
  traceId: string;
  mode: OrchestratorMode;
  task: string;
  startedAt: string;
  totalMs: number;
  phases: PhaseTrace[];
  provider?: ProviderTrace;
  parseSuccess: boolean;
  parseError?: string;
  selectedAgents: string[];
  matchedKeywords: string[];
}

// ─── Memory (from src/types.ts) ─────────────────────────────────

export type MemoryEntryType =
  | "plan"
  | "route"
  | "blueprint"
  | "audit"
  | "scaffold";

export interface MemoryEntry {
  id: string;
  type: MemoryEntryType;
  task: string;
  timestamp: string;
  projectType?: string;
  agents: string[];
  keywords: string[];
  summary?: string;
  outputDir?: string;
  traceId: string;
  trace?: TraceRecord;
}

export interface MemoryStore {
  version: string;
  entries: MemoryEntry[];
  lastRun?: string;
}

// ─── User Config (from src/config/userConfig.ts) ────────────────

export interface RoutingRule {
  keywords: string[];
  agents: string[];
}

export interface WhatsAppConfig {
  enabled: boolean;
  allowedPhones: string[];
  maxMessagesPerHour: number;
  safeModes: OrchestratorMode[];
  n8nWebhookPath: string;
  hookToken: string;
  replyVia: "n8n" | "direct";
}

export interface UserConfig {
  version: string;
  agents: {
    disabled: string[];
  };
  routing: {
    rules: RoutingRule[];
  };
  providers: Partial<Record<string, ProviderName>>;
  n8n: {
    triggers: Record<string, string>;
  };
  allowedDomains: string[];
  whatsapp: WhatsAppConfig;
}

// ─── Agent Metadata (from src/agents/registry.ts) ───────────────

export type AgentTier = "core" | "specialized" | "advanced" | "design";

export type AgentDomain =
  | "architecture"
  | "frontend"
  | "backend"
  | "quality"
  | "data"
  | "security"
  | "infrastructure"
  | "integration"
  | "design"
  | "ai";

export interface AgentMeta {
  domain: AgentDomain;
  tier: AgentTier;
  tags: string[];
  description: string;
}

// ─── Trajectory (from src/types.ts) ─────────────────────────────

export type TrajectorySource = "cli" | "whatsapp" | "omi" | "dashboard" | null;
export type ApprovalStatus = "pending" | "approved" | "rejected" | "auto" | null;
export type OutcomeStatus =
  | "completed"
  | "partial"
  | "merged"
  | "reverted"
  | "ci_failed"
  | "rejected"
  | null;

export interface TrajectoryProviderCall {
  provider: ProviderName;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  durationMs: number;
}

export interface TrajectoryError {
  phase: string;
  message: string;
  timestamp: string;
}

export interface Trajectory {
  id: string;
  createdAt: string;
  traceId: string;
  memoryEntryId: string | null;
  source: TrajectorySource;
  userMessage: string;
  intent: { mode: OrchestratorMode; task: string };
  agentsUsed: string[];
  providerCalls: TrajectoryProviderCall[];
  toolCalls: string[];
  errors: TrajectoryError[];
  durationMs: number;
  result: {
    parseSuccess: boolean;
    structured: unknown | null;
    rawLength: number;
  };
  approvalStatus: ApprovalStatus;
  outcome: OutcomeStatus;
  judgeScore: number | null;
}

export interface TrajectoryStore {
  version: string;
  trajectories: Trajectory[];
}

// ─── Distillation (mirrors src/trajectory/distillationClassifier.ts) ──

export type DistillationTier = "trusted" | "usable" | "weak" | "unusable";

export interface DistillationResult {
  tier: DistillationTier;
  reasons: string[];
}

// ─── Actions (mirrors src/actions/types.ts) ─────────────────────

export type ActionSource =
  | "cli"
  | "whatsapp"
  | "omi"
  | "dashboard"
  | "openclaw"
  | "system";

export type ActionRiskLevel = "safe" | "review-required" | "forbidden";

export type ActionCategory =
  | "file-write"
  | "file-delete"
  | "git-branch"
  | "git-push"
  | "pr-create"
  | "pr-merge"
  | "tool-invoke"
  | "deploy"
  | "config-change"
  | "notification"
  | "query"
  | "other";

export type ActionStatus =
  | "proposed"
  | "classified"
  | "pending-approval"
  | "approved"
  | "rejected"
  | "expired"
  | "executed"
  | "failed";

export type ApprovalPolicy = "require-human" | "never";

export interface ActionProposal {
  id: string;
  createdAt: string;
  source: ActionSource;
  sourceEventId: string | null;
  category: ActionCategory;
  title: string;
  description: string;
  parameters: Record<string, unknown>;
  riskLevel: ActionRiskLevel;
  riskReason: string;
  approvalPolicy: ApprovalPolicy;
  status: ActionStatus;
  decidedAt: string | null;
  decidedBy: string | null;
  expiresAt: string | null;
  traceId: string | null;
  trajectoryId: string | null;
}

export interface ActionStoreData {
  version: string;
  proposals: ActionProposal[];
}

// ─── Channel audit (mirrors src/actions/types.ts) ──────────────

export type ChannelKind = ActionSource | "api";

export type ChannelOperation =
  | "create-proposal"
  | "request-review"
  | "list-pending"
  | "grant-second-approval"
  | "dispatch-approved";

export type ChannelAuditDecision = "allowed" | "blocked";

export type ChannelAuditReasonCode =
  | "allowed"
  | "unknown-channel"
  | "missing-identity"
  | "untrusted-identity"
  | "permission-denied"
  | "operation-not-allowed"
  | "category-not-allowed"
  | "forbidden-category"
  | "rate-limit-exceeded"
  | "malformed-request"
  | "duplicate-source-event"
  | "proposal-not-found"
  | "proposal-not-approved"
  | "second-approval-missing"
  | "second-approval-expired"
  | "second-approval-parameter-drift"
  | "real-execution-disabled"
  | "real-execution-category-not-allowlisted"
  | "prior-successful-execution"
  | "audit-store-write-failed"
  | "unknown-error";

export interface ChannelPermissionSnapshot {
  canCreateProposal: boolean;
  canRequestReview: boolean;
  canListPending: boolean;
  canGrantSecondApproval: boolean;
  canDispatchApproved: boolean;
  allowedProposalCategories: ActionCategory[];
  allowedDispatchCategories: ActionCategory[];
  forbiddenCategories: ActionCategory[];
  maxProposalsPerHour: number;
  maxDispatchesPerHour: number;
}

export interface ChannelAuditEntry {
  id: string;
  timestamp: string;
  decision: ChannelAuditDecision;
  reasonCode: ChannelAuditReasonCode;
  reason: string;
  channel: ChannelKind;
  principalHash: string | null;
  trusted: boolean;
  trustReason: string;
  authMethod: string;
  operation: ChannelOperation;
  category: ActionCategory | null;
  proposalId: string | null;
  sourceEventId: string | null;
  correlationId: string | null;
  runId: string | null;
  realExecutionEnabled: boolean | null;
  secondApprovalId: string | null;
  executionResultId: string | null;
  permissionSnapshot?: ChannelPermissionSnapshot;
}

export interface ChannelAuditStoreData {
  version: string;
  entries: ChannelAuditEntry[];
}

export interface ChannelAuditStats {
  total: number;
  allowed: number;
  blocked: number;
  byChannel: Partial<Record<ChannelKind, number>>;
  byOperation: Partial<Record<ChannelOperation, number>>;
  byReasonCode: Partial<Record<ChannelAuditReasonCode, number>>;
}

// ─── Execution results (mirrors src/actions/types.ts) ───────────

export type ExecutionOutcome =
  | "success"
  | "failure"
  | "dry-run"
  | "deferred"
  | "blocked";

export interface ExecutionResult {
  id: string;
  proposalId: string;
  category: ActionCategory;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  outcome: ExecutionOutcome;
  ok: boolean;
  message: string;
  output: unknown;
  actor: string;
}

export interface ExecutionResultStoreData {
  version: string;
  results: ExecutionResult[];
}

// ─── Second approvals (mirrors src/actions/types.ts) ────────────

export type SecondApprovalStatus =
  | "granted"
  | "consumed"
  | "expired"
  | "revoked";

export interface SecondApproval {
  id: string;
  proposalId: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt: string;
  status: SecondApprovalStatus;
  consumedAt: string | null;
  revokedAt: string | null;
  proposalParameterHash: string;
  proposalStatusAtGrant: ActionStatus;
}

export interface SecondApprovalStoreData {
  version: string;
  approvals: SecondApproval[];
}

// ─── Defaults ───────────────────────────────────────────────────

export const EMPTY_MEMORY_STORE: MemoryStore = {
  version: "1.0",
  entries: [],
};

export const EMPTY_TRAJECTORY_STORE: TrajectoryStore = {
  version: "1.0",
  trajectories: [],
};

export const EMPTY_ACTION_STORE: ActionStoreData = {
  version: "1.0",
  proposals: [],
};

export const EMPTY_CHANNEL_AUDIT_STORE: ChannelAuditStoreData = {
  version: "1.0",
  entries: [],
};

export const EMPTY_EXECUTION_RESULT_STORE: ExecutionResultStoreData = {
  version: "1.0",
  results: [],
};

export const EMPTY_SECOND_APPROVAL_STORE: SecondApprovalStoreData = {
  version: "1.0",
  approvals: [],
};

export const DEFAULT_USER_CONFIG: UserConfig = {
  version: "1.0",
  agents: { disabled: [] },
  routing: { rules: [] },
  providers: {},
  n8n: { triggers: {} },
  allowedDomains: ["api.openai.com", "api.anthropic.com"],
  whatsapp: {
    enabled: false,
    allowedPhones: [],
    maxMessagesPerHour: 20,
    safeModes: ["plan", "route", "blueprint", "audit", "memory"],
    n8nWebhookPath: "orquestador-whatsapp",
    hookToken: "",
    replyVia: "n8n",
  },
};
