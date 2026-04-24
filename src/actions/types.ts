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
