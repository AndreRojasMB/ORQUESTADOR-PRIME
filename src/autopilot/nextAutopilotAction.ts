import { isAutopilotFutureExecutionRisk, autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type {
  AutopilotBoundarySet,
  AutopilotRiskLevel,
  AutopilotTaskState,
} from "./types.js";

export type AutopilotNextActionCategory =
  | "observe"
  | "report"
  | "plan"
  | "propose"
  | "request_human_approval"
  | "request_clarification"
  | "validate_codex_report"
  | "propose_memory_update"
  | "defer_due_to_risk"
  | "stop_due_to_blocker";

export interface AutopilotNextActionRecommendation {
  nextActionId: string;
  nextPhase: string;
  category: AutopilotNextActionCategory;
  reason: string;
  riskLevel: AutopilotRiskLevel;
  prerequisites: string[];
  blockedBy: string[];
  recommendedModel: string;
  requiresApproval: boolean;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noCodexInvocation: true;
  noProviderCalls: true;
  boundaries: AutopilotBoundarySet;
}

export interface AutopilotNextActionInput {
  currentPhase: string;
  nextPhase: string;
  taskState: AutopilotTaskState;
  riskLevel: AutopilotRiskLevel;
  blockedBy?: string[];
  prerequisites?: string[];
  recommendedModel?: string;
}

export function recommendNextAutopilotAction(
  input: AutopilotNextActionInput,
): AutopilotNextActionRecommendation {
  const blockedBy = input.blockedBy ? [...input.blockedBy] : [];
  const prerequisites = input.prerequisites ? [...input.prerequisites] : [];
  const isBlocked = input.taskState === "blocked" || blockedBy.length > 0;
  const futureExecutionRisk = isAutopilotFutureExecutionRisk(input.riskLevel);

  const category: AutopilotNextActionCategory = isBlocked
    ? "stop_due_to_blocker"
    : futureExecutionRisk
      ? "defer_due_to_risk"
      : input.taskState === "codex_done"
        ? "validate_codex_report"
        : input.taskState === "approved"
          ? "plan"
          : "propose";

  return {
    nextActionId: `${input.currentPhase}:next_action`,
    nextPhase: input.nextPhase,
    category,
    reason: isBlocked
      ? "Current task is blocked and requires human review before continuing."
      : futureExecutionRisk
        ? "Requested risk level is reserved for a future execution-gated phase."
        : "Next action remains advisory and requires human approval before implementation.",
    riskLevel: input.riskLevel,
    prerequisites,
    blockedBy,
    recommendedModel: input.recommendedModel ?? "Codex",
    requiresApproval: true,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noCodexInvocation: true,
    noProviderCalls: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
