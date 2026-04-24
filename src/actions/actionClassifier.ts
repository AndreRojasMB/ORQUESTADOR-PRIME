// src/actions/actionClassifier.ts
// Classifies action proposals by risk level and assigns approval policy.
// Phase 27A — classification only, no execution.

import type {
  ActionCategory,
  ActionRiskLevel,
  ApprovalPolicy,
} from "./types.js";

// ─── Risk classification by category ────────────────────────────

const CATEGORY_RISK: Record<ActionCategory, ActionRiskLevel> = {
  // Safe — read-only or low-impact
  "query":          "safe",
  "notification":   "safe",

  // Review required — creates artifacts or modifies state
  "file-write":     "review-required",
  "git-branch":     "review-required",
  "pr-create":      "review-required",
  "tool-invoke":    "review-required",
  "config-change":  "review-required",
  "other":          "review-required",

  // Forbidden — destructive or high-impact
  "file-delete":    "forbidden",
  "git-push":       "forbidden",
  "pr-merge":       "forbidden",
  "deploy":         "forbidden",
};

// ─── Risk reasons ───────────────────────────────────────────────

const RISK_REASONS: Record<ActionRiskLevel, string> = {
  "safe":
    "Read-only or low-impact action — no destructive side effects",
  "review-required":
    "Creates or modifies artifacts — requires human review before execution",
  "forbidden":
    "Destructive or high-impact action — must not be executed without explicit human override",
};

// ─── Approval policy by risk level ──────────────────────────────

const RISK_POLICY: Record<ActionRiskLevel, ApprovalPolicy> = {
  "safe":             "require-human",
  "review-required":  "require-human",
  "forbidden":        "never",
};

// ─── Classifier ─────────────────────────────────────────────────

export interface ClassificationResult {
  riskLevel: ActionRiskLevel;
  riskReason: string;
  approvalPolicy: ApprovalPolicy;
}

/**
 * Classifies an action by its category and returns risk level,
 * reason, and approval policy.
 *
 * In Phase 27A all policies resolve to "require-human" or "never".
 * No action is auto-approved.
 */
export function classifyAction(category: ActionCategory): ClassificationResult {
  const riskLevel = CATEGORY_RISK[category];
  return {
    riskLevel,
    riskReason: RISK_REASONS[riskLevel],
    approvalPolicy: RISK_POLICY[riskLevel],
  };
}

/**
 * Returns true if the action can ever be approved (not forbidden).
 * Forbidden actions must be rejected unless the policy is overridden
 * in a future phase.
 */
export function isApprovable(category: ActionCategory): boolean {
  return CATEGORY_RISK[category] !== "forbidden";
}
