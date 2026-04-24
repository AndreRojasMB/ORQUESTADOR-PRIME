// src/trajectory/trajectoryJudge.ts
// Heuristic judge for trajectory quality evaluation.
// Phase 28B — signal-based, no LLM calls, no self-modification.
//
// Evidence-first approach:
// - Accumulates positive and negative signals from 0
// - Returns null if evidence is too weak
// - Only normalizes into 0–10 when sufficient evidence exists

import type { Trajectory } from "../types.js";

// ─── Types ──────────────────────────────────────────────────────

export interface JudgeSignal {
  name: string;
  value: number;
  reason: string;
}

export interface JudgeVerdict {
  score: number | null;
  confidence: "high" | "medium" | "low" | "none";
  signals: JudgeSignal[];
}

// ─── Signal thresholds ──────────────────────────────────────────

const MIN_EVIDENCE_SIGNALS = 2;
const DURATION_SLOW_MS = 120_000;
const DURATION_SUSPICIOUSLY_FAST_MS = 100;
const OUTPUT_TOO_SHORT = 50;
const OUTPUT_REASONABLE = 100;

// ─── Signal extraction ──────────────────────────────────────────

function extractSignals(trajectory: Trajectory): JudgeSignal[] {
  const signals: JudgeSignal[] = [];

  // Parse success/failure — strong signal
  if (trajectory.result.parseSuccess) {
    signals.push({
      name: "parse-success",
      value: 3,
      reason: "Output parsed successfully into structured schema",
    });
  } else {
    signals.push({
      name: "parse-failure",
      value: -4,
      reason: "Output failed structured parsing",
    });
  }

  // Structured output present
  if (trajectory.result.structured !== null) {
    signals.push({
      name: "structured-output",
      value: 1.5,
      reason: "Structured output was produced",
    });
  }

  // Error signals
  if (trajectory.errors.length === 0) {
    signals.push({
      name: "no-errors",
      value: 1.5,
      reason: "Execution completed without errors",
    });
  } else if (trajectory.errors.length >= 3) {
    signals.push({
      name: "many-errors",
      value: -4,
      reason: `${trajectory.errors.length} errors during execution`,
    });
  } else {
    signals.push({
      name: "has-errors",
      value: -2.5,
      reason: `${trajectory.errors.length} error(s) during execution`,
    });
  }

  // Output length
  if (trajectory.result.rawLength < OUTPUT_TOO_SHORT) {
    signals.push({
      name: "output-too-short",
      value: -1.5,
      reason: `Output only ${trajectory.result.rawLength} chars — suspiciously short`,
    });
  } else if (trajectory.result.rawLength > OUTPUT_REASONABLE) {
    signals.push({
      name: "output-reasonable-length",
      value: 0.5,
      reason: "Output has reasonable length",
    });
  }

  // Provider response
  if (trajectory.providerCalls.length === 0) {
    signals.push({
      name: "no-provider-call",
      value: -2,
      reason: "No provider call recorded — likely early failure",
    });
  }

  // Agent selection
  if (trajectory.agentsUsed.length === 0) {
    signals.push({
      name: "no-agents",
      value: -1.5,
      reason: "No agents were selected for this run",
    });
  }

  // Duration anomalies
  if (trajectory.durationMs > DURATION_SLOW_MS) {
    signals.push({
      name: "slow-execution",
      value: -0.5,
      reason: `Execution took ${Math.round(trajectory.durationMs / 1000)}s — abnormally slow`,
    });
  } else if (trajectory.durationMs < DURATION_SUSPICIOUSLY_FAST_MS) {
    signals.push({
      name: "suspiciously-fast",
      value: -1,
      reason: `Execution took only ${trajectory.durationMs}ms — likely errored early`,
    });
  }

  return signals;
}

// ─── Score computation ──────────────────────────────────────────

function computeConfidence(signals: JudgeSignal[]): "high" | "medium" | "low" | "none" {
  const strongSignals = signals.filter((s) => Math.abs(s.value) >= 2);
  if (strongSignals.length >= 3) return "high";
  if (strongSignals.length >= 2) return "medium";
  if (signals.length >= MIN_EVIDENCE_SIGNALS) return "low";
  return "none";
}

function normalizeToScale(rawSum: number): number {
  // Raw sum typically ranges from about -10 to +7
  // Map this to 0–10 scale:
  //   -10 → 0, 0 → 5, +7 → 10
  const normalized = 5 + (rawSum * 0.5);
  return Math.round(Math.max(0, Math.min(10, normalized)) * 10) / 10;
}

// ─── Main judge function ────────────────────────────────────────

/**
 * Evaluates a trajectory and returns a verdict with score and signals.
 *
 * Evidence-first: accumulates signals from 0. Returns null score
 * if insufficient evidence exists to make a meaningful assessment.
 *
 * Pure function — no side effects, no LLM calls.
 */
export function judgeTrajectory(trajectory: Trajectory): JudgeVerdict {
  const signals = extractSignals(trajectory);
  const confidence = computeConfidence(signals);

  // Insufficient evidence — do not invent a score
  if (confidence === "none") {
    return { score: null, confidence, signals };
  }

  const rawSum = signals.reduce((sum, s) => sum + s.value, 0);
  const score = normalizeToScale(rawSum);

  return { score, confidence, signals };
}
