// src/trajectory/distillationClassifier.ts
// Classifies trajectories into trust tiers for distillation readiness.
// Phase 28D — pure function, no LLM calls, no self-modification.
//
// Relies ONLY on persisted Trajectory fields:
//   judgeScore, outcome, approvalStatus, result.parseSuccess,
//   errors, durationMs, agentsUsed, providerCalls
//
// Does NOT depend on internal judge verdict data (confidence, signals).

import type { Trajectory } from "../types.js";

// ─── Types ──────────────────────────────────────────────────────

export type DistillationTier = "trusted" | "usable" | "weak" | "unusable";

export interface DistillationResult {
  tier: DistillationTier;
  reasons: string[];
}

// ─── Thresholds ─────────────────────────────────────────────────

const SCORE_TRUSTED = 7;
const SCORE_USABLE = 5;
const SCORE_UNUSABLE = 3;

// ─── Classifier ─────────────────────────────────────────────────

/**
 * Classifies a trajectory into a distillation trust tier.
 *
 * Rules are evaluated in order — first match wins.
 * Uses only persisted Trajectory fields, never internal judge internals.
 *
 * Pure function — no side effects, no LLM calls.
 */
export function classifyForDistillation(t: Trajectory): DistillationResult {
  // ── Unusable gates (evaluated first) ──────────────────────────

  if (!t.result.parseSuccess) {
    return { tier: "unusable", reasons: ["no structured output — parse failed"] };
  }

  if (t.outcome === "rejected") {
    return { tier: "unusable", reasons: ["human explicitly rejected"] };
  }

  if (t.outcome === "ci_failed") {
    return { tier: "unusable", reasons: ["CI validation failed"] };
  }

  if (t.judgeScore !== null && t.judgeScore < SCORE_UNUSABLE) {
    return { tier: "unusable", reasons: [`low judge score (${t.judgeScore})`] };
  }

  // ── Trusted gates ─────────────────────────────────────────────

  if (t.approvalStatus === "approved" && t.outcome === "merged") {
    return { tier: "trusted", reasons: ["human approved and merged"] };
  }

  if (t.judgeScore !== null && t.judgeScore >= SCORE_TRUSTED) {
    return { tier: "trusted", reasons: [`high judge score (${t.judgeScore})`] };
  }

  // ── Usable gates ──────────────────────────────────────────────

  if (t.outcome === "completed" && t.judgeScore !== null && t.judgeScore >= SCORE_USABLE) {
    return { tier: "usable", reasons: [`completed with decent score (${t.judgeScore})`] };
  }

  // ── Weak gates ────────────────────────────────────────────────

  if (t.outcome === "completed" && t.judgeScore === null) {
    return { tier: "weak", reasons: ["completed but unscored"] };
  }

  if (t.judgeScore !== null && t.judgeScore >= SCORE_USABLE && t.judgeScore < SCORE_TRUSTED) {
    return { tier: "weak", reasons: [`moderate score (${t.judgeScore}) without completed outcome`] };
  }

  // ── Default ───────────────────────────────────────────────────

  return { tier: "unusable", reasons: ["insufficient evidence"] };
}
