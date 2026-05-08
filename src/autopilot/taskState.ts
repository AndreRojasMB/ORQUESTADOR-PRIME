import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type { AutopilotBoundarySet, AutopilotTaskState } from "./types.js";

export interface AutopilotTaskStateTransitionResult {
  valid: boolean;
  from: AutopilotTaskState;
  to: AutopilotTaskState;
  reasonCode: string;
  safeMessage: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  boundaries: AutopilotBoundarySet;
}

const allowedTaskStateTransitions: Record<
  AutopilotTaskState,
  readonly AutopilotTaskState[]
> = {
  pending: ["running", "blocked", "needs_review"],
  running: ["codex_done", "failed", "blocked", "needs_review"],
  codex_done: ["validating", "needs_review", "failed"],
  validating: ["approved", "needs_review", "failed", "blocked"],
  needs_review: ["pending", "approved", "blocked", "failed"],
  approved: ["pending"],
  failed: ["pending", "needs_review"],
  blocked: ["pending", "needs_review"],
};

export function getAllowedTaskStateTransitions(
  from: AutopilotTaskState,
): readonly AutopilotTaskState[] {
  return allowedTaskStateTransitions[from];
}

export function validateTaskStateTransition(
  from: AutopilotTaskState,
  to: AutopilotTaskState,
): AutopilotTaskStateTransitionResult {
  const allowed = allowedTaskStateTransitions[from].includes(to);

  return {
    valid: allowed,
    from,
    to,
    reasonCode: allowed
      ? "TASK_STATE_TRANSITION_ALLOWED"
      : "TASK_STATE_TRANSITION_BLOCKED",
    safeMessage: allowed
      ? "Task state transition is allowed as metadata."
      : "Task state transition is not part of the source-only autopilot contract.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
