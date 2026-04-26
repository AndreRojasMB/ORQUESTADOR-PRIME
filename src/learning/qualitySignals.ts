import type { Trajectory } from "../types.js";
import type { DistillationResult } from "../trajectory/distillationClassifier.js";
import type {
  LearningActionLink,
  LearningChannelAuditLink,
  LearningExecutionLink,
  LearningHeuristicLabel,
  QualitySignal,
} from "./types.js";

interface SignalInput {
  trajectory: Trajectory;
  distillation: DistillationResult;
  actionLinks: LearningActionLink[];
  executionLinks: LearningExecutionLink[];
  channelAuditLinks: LearningChannelAuditLink[];
}

function signal(
  code: string,
  polarity: QualitySignal["polarity"],
  weight: number,
  confidence: QualitySignal["confidence"],
  evidence: string,
): QualitySignal {
  return {
    code,
    polarity,
    weight,
    confidence,
    evidence,
    heuristic: true,
  };
}

export function buildQualitySignals(input: SignalInput): QualitySignal[] {
  const { trajectory, distillation, actionLinks, executionLinks, channelAuditLinks } = input;
  const signals: QualitySignal[] = [];

  if (trajectory.result.parseSuccess) {
    signals.push(signal("parse-success", "positive", 3, "high", "Structured parsing succeeded"));
  } else {
    signals.push(signal("parse-failure", "negative", -4, "high", "Structured parsing failed"));
  }

  if (trajectory.errors.length === 0) {
    signals.push(signal("no-errors", "positive", 1, "medium", "No trajectory errors were recorded"));
  } else {
    signals.push(signal("errors-present", "negative", -2, "medium", `${trajectory.errors.length} trajectory error(s) recorded`));
  }

  if (trajectory.outcome === "completed" || trajectory.outcome === "merged") {
    signals.push(signal(`outcome-${trajectory.outcome}`, "positive", 2, "medium", `Outcome is ${trajectory.outcome}`));
  } else if (
    trajectory.outcome === "rejected" ||
    trajectory.outcome === "ci_failed" ||
    trajectory.outcome === "reverted"
  ) {
    signals.push(signal(`outcome-${trajectory.outcome}`, "negative", -3, "high", `Outcome is ${trajectory.outcome}`));
  } else if (trajectory.outcome === "partial") {
    signals.push(signal("outcome-partial", "neutral", 0, "low", "Outcome is partial"));
  }

  if (trajectory.approvalStatus === "approved") {
    signals.push(signal("approval-approved", "positive", 2, "high", "Human approval was recorded"));
  } else if (trajectory.approvalStatus === "rejected") {
    signals.push(signal("approval-rejected", "negative", -4, "high", "Human rejection was recorded"));
  } else if (trajectory.approvalStatus === "pending") {
    signals.push(signal("approval-pending", "neutral", 0, "medium", "Human review is pending"));
  } else if (trajectory.approvalStatus === "auto") {
    signals.push(signal("approval-auto", "neutral", 0, "low", "Automatic approval status was recorded"));
  }

  if (trajectory.judgeScore !== null) {
    if (trajectory.judgeScore >= 7) {
      signals.push(signal("judge-high", "positive", 2, "medium", `Judge score is ${trajectory.judgeScore}`));
    } else if (trajectory.judgeScore >= 5) {
      signals.push(signal("judge-medium", "positive", 1, "medium", `Judge score is ${trajectory.judgeScore}`));
    } else {
      signals.push(signal("judge-low", "negative", -2, "medium", `Judge score is ${trajectory.judgeScore}`));
    }
  } else {
    signals.push(signal("judge-missing", "neutral", 0, "low", "No judge score was persisted"));
  }

  const distillationPolarity =
    distillation.tier === "trusted" || distillation.tier === "usable"
      ? "positive"
      : distillation.tier === "unusable"
        ? "negative"
        : "neutral";
  signals.push(
    signal(
      `distillation-${distillation.tier}`,
      distillationPolarity,
      distillation.tier === "trusted" ? 3 : distillation.tier === "usable" ? 2 : distillation.tier === "weak" ? 0 : -3,
      "medium",
      `Distillation tier is ${distillation.tier}`,
    ),
  );

  for (const action of actionLinks) {
    if (action.status === "approved" || action.status === "executed") {
      signals.push(signal(`linked-action-${action.status}`, "positive", 1, "medium", `Linked action ${action.id} is ${action.status}`));
    } else if (action.status === "rejected" || action.status === "failed" || action.status === "expired") {
      signals.push(signal(`linked-action-${action.status}`, "negative", -1, "medium", `Linked action ${action.id} is ${action.status}`));
    } else {
      signals.push(signal(`linked-action-${action.status}`, "neutral", 0, "low", `Linked action ${action.id} is ${action.status}`));
    }
  }

  for (const execution of executionLinks) {
    if (execution.ok && execution.outcome === "success") {
      signals.push(signal("execution-success", "positive", 2, "high", `Execution result ${execution.id} succeeded`));
    } else if (execution.outcome === "dry-run" || execution.outcome === "deferred") {
      signals.push(signal(`execution-${execution.outcome}`, "neutral", 0, "medium", `Execution result ${execution.id} was ${execution.outcome}`));
    } else {
      signals.push(signal(`execution-${execution.outcome}`, "negative", -2, "high", `Execution result ${execution.id} did not succeed`));
    }
  }

  const blockedAuditCount = channelAuditLinks.filter((entry) => entry.decision === "blocked").length;
  const allowedAuditCount = channelAuditLinks.filter((entry) => entry.decision === "allowed").length;
  if (allowedAuditCount > 0) {
    signals.push(signal("channel-audit-allowed", "positive", 1, "medium", `${allowedAuditCount} allowed channel audit decision(s)`));
  }
  if (blockedAuditCount > 0) {
    signals.push(signal("channel-audit-blocked", "negative", -1, "medium", `${blockedAuditCount} blocked channel audit decision(s)`));
  }

  return signals;
}

export function assignHeuristicLabel(input: SignalInput): LearningHeuristicLabel {
  const { trajectory, distillation, actionLinks, executionLinks } = input;

  if (!trajectory.result.parseSuccess) {
    return "rejected";
  }
  if (
    trajectory.outcome === "rejected" ||
    trajectory.outcome === "ci_failed" ||
    trajectory.approvalStatus === "rejected"
  ) {
    return "rejected";
  }
  if (trajectory.judgeScore !== null && trajectory.judgeScore < 3) {
    return "rejected";
  }
  if (actionLinks.some((action) => action.status === "rejected" || action.status === "failed")) {
    return "rejected";
  }
  if (executionLinks.some((execution) => execution.outcome === "failure" || execution.outcome === "blocked")) {
    return "rejected";
  }
  if (distillation.tier === "trusted") {
    return "accepted";
  }
  if (
    trajectory.approvalStatus === "approved" &&
    (trajectory.outcome === "completed" || trajectory.outcome === "merged")
  ) {
    return "accepted";
  }
  if (trajectory.judgeScore !== null && trajectory.judgeScore >= 7) {
    return "accepted";
  }
  if (distillation.tier === "usable") {
    return "usable";
  }
  if (
    trajectory.outcome === "completed" &&
    trajectory.judgeScore !== null &&
    trajectory.judgeScore >= 5
  ) {
    return "usable";
  }
  return "needs-review";
}
