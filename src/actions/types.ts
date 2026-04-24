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
