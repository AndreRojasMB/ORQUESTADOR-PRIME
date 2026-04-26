// src/actions/types.ts
// Controlled actions layer — proposals only, no execution.
// Phase 27A — channel-agnostic action proposal model.

// ─── Action Source ──────────────────────────────────────────────
// Self-contained source discriminator for the actions layer.
// Intentionally independent from trajectory or other layer types.

export type ActionSource =
  | "cli"
  | "whatsapp"
  | "omi"
  | "dashboard"
  | "openclaw"
  | "system";

// ─── External Channel Identity (Phase 33B) ─────────────────────
// Foundational types only. These do not create proposal, approval, or
// dispatch paths; future bridges consume them behind explicit safety gates.

export type ChannelKind = ActionSource | "api";

export type ChannelAuthMethod =
  | "none"
  | "local-cli"
  | "hook-token"
  | "hmac"
  | "api-token"
  | "local-session"
  | "provider-token"
  | "system";

export type ChannelOperation =
  | "create-proposal"
  | "request-review"
  | "list-pending"
  | "grant-second-approval"
  | "dispatch-approved";

export interface ChannelIdentity {
  channel: ChannelKind;
  principalHash: string | null;
  displayName?: string;
  sourceEventId: string | null;
  authMethod: ChannelAuthMethod;
  trusted: boolean;
  trustReason: string;
  receivedAt: string;
}

// ─── Action Risk Classification ─────────────────────────────────

export type ActionRiskLevel = "safe" | "review-required" | "forbidden";

// ─── Action Category ────────────────────────────────────────────

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

export const GLOBAL_FORBIDDEN_ACTION_CATEGORIES = [
  "file-delete",
  "git-push",
  "pr-merge",
  "deploy",
] as const satisfies readonly ActionCategory[];

export interface ChannelPermission {
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

// ─── Channel Audit (Phase 33C) ─────────────────────────────────
// Append-only decision records for future external channel bridges.
// Stores hashed principals only; raw phone/email/token/request bodies stay out.

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
  authMethod: ChannelAuthMethod;
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

// ─── Action Status ──────────────────────────────────────────────

export type ActionStatus =
  | "proposed"
  | "classified"
  | "pending-approval"
  | "approved"
  | "rejected"
  | "expired"
  | "executed"
  | "failed";

// ─── Approval Policy ────────────────────────────────────────────

export type ApprovalPolicy =
  | "require-human"
  | "never";

// ─── Action Proposal ────────────────────────────────────────────

export interface ActionProposal {
  id: string;
  createdAt: string;
  source: ActionSource;
  sourceEventId: string | null;

  // What
  category: ActionCategory;
  title: string;
  description: string;
  parameters: Record<string, unknown>;

  // Classification
  riskLevel: ActionRiskLevel;
  riskReason: string;
  approvalPolicy: ApprovalPolicy;

  // Status
  status: ActionStatus;
  decidedAt: string | null;
  decidedBy: string | null;
  expiresAt: string | null;

  // Links
  traceId: string | null;
  trajectoryId: string | null;
}

// ─── Action Store ───────────────────────────────────────────────

export interface ActionStoreData {
  version: string;
  proposals: ActionProposal[];
}

// ─── Execution Result (Phase 30A) ───────────────────────────────
// Append-only log of dispatches. Independent from ActionStatus:
// proposals stay "approved" after dispatch; this store records what
// happened on each dispatch attempt.

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

// ─── Second Approval (Phase 32A) ────────────────────────────────
// Single-use, short-lived, parameter-bound authorization used as a
// second gate in front of repo-mutating dispatch. Real execution
// stays OFF in 32A (ACTIONS_REAL_EXECUTION_ENABLED=false); this store
// lands the infrastructure so future phases can consume it.

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
  // Hash of canonical JSON of the proposal parameters at grant time.
  // Guards against parameter drift between grant and consume.
  proposalParameterHash: string;
  proposalStatusAtGrant: ActionStatus;
}

export interface SecondApprovalStoreData {
  version: string;
  approvals: SecondApproval[];
}
