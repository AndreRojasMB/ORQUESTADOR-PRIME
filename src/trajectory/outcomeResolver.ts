// src/trajectory/outcomeResolver.ts
// Derives OutcomeStatus from available evidence at trajectory build time.
// Phase 28C — pure function, no LLM calls, no self-modification.
//
// Conservative: returns null when outcome is genuinely unknown.

import type { OrchestratorMode, ApprovalStatus, OutcomeStatus } from "../types.js";

// ─── Types ──────────────────────────────────────────────────────

export interface OutcomeInput {
  mode: OrchestratorMode;
  parseSuccess: boolean;
  errorCount: number;
  approvalStatus: ApprovalStatus;
  tracePhases: string[];
}

// ─── Modes with meaningful outcomes ─────────────────────────────

const OUTCOME_MODES: Set<OrchestratorMode> = new Set([
  "plan",
  "route",
  "blueprint",
  "audit",
  "scaffold",
  "execute",
]);

// ─── Resolver ───────────────────────────────────────────────────

/**
 * Derives an OutcomeStatus from available build-time evidence.
 *
 * Rules:
 * - memory, init, chat → null (no meaningful outcome concept)
 * - plan, route, blueprint, audit, scaffold:
 *     parseSuccess && no errors → "completed"
 *     otherwise → "partial"
 * - execute:
 *     rejected → "rejected"
 *     approved + execution:write phase present → "merged"
 *     approved but no write phase → "partial"
 *     pending (deferred review) → null
 *     parse failed → "partial"
 *
 * Returns null when evidence is genuinely insufficient.
 */
export function resolveOutcome(input: OutcomeInput): OutcomeStatus {
  // Modes without meaningful outcome
  if (!OUTCOME_MODES.has(input.mode)) {
    return null;
  }

  // Execute mode — approval-driven outcomes
  if (input.mode === "execute") {
    return resolveExecuteOutcome(input);
  }

  // Non-execute modes — parse/error-driven outcomes
  if (input.parseSuccess && input.errorCount === 0) {
    return "completed";
  }

  return "partial";
}

// ─── Execute-specific resolution ────────────────────────────────

function resolveExecuteOutcome(input: OutcomeInput): OutcomeStatus {
  // Parse failed — no proposal was generated
  if (!input.parseSuccess) {
    return "partial";
  }

  // Rejected by human
  if (input.approvalStatus === "rejected") {
    return "rejected";
  }

  // Approved — check if execution actually happened
  if (input.approvalStatus === "approved") {
    const hasWritePhase = input.tracePhases.includes("execution:write");
    return hasWritePhase ? "merged" : "partial";
  }

  // Pending review — outcome genuinely unknown
  if (input.approvalStatus === "pending") {
    return null;
  }

  // No approval status (e.g. parse succeeded but approval not reached)
  return null;
}
