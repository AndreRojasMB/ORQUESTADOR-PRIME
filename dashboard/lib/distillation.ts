// dashboard/lib/distillation.ts
// Local mirror of src/trajectory/distillationClassifier.ts.
// Dashboard stays decoupled from the orchestrator runtime — this file is a
// pure copy, kept in sync manually. Do not import from src/.

import type { DistillationResult, Trajectory } from "./types";

const SCORE_TRUSTED = 7;
const SCORE_USABLE = 5;
const SCORE_UNUSABLE = 3;

export function classifyForDistillation(t: Trajectory): DistillationResult {
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

  if (t.approvalStatus === "approved" && t.outcome === "merged") {
    return { tier: "trusted", reasons: ["human approved and merged"] };
  }

  if (t.judgeScore !== null && t.judgeScore >= SCORE_TRUSTED) {
    return { tier: "trusted", reasons: [`high judge score (${t.judgeScore})`] };
  }

  if (t.outcome === "completed" && t.judgeScore !== null && t.judgeScore >= SCORE_USABLE) {
    return { tier: "usable", reasons: [`completed with decent score (${t.judgeScore})`] };
  }

  if (t.outcome === "completed" && t.judgeScore === null) {
    return { tier: "weak", reasons: ["completed but unscored"] };
  }

  if (t.judgeScore !== null && t.judgeScore >= SCORE_USABLE && t.judgeScore < SCORE_TRUSTED) {
    return {
      tier: "weak",
      reasons: [`moderate score (${t.judgeScore}) without completed outcome`],
    };
  }

  return { tier: "unusable", reasons: ["insufficient evidence"] };
}
