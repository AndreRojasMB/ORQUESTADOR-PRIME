import type { AutopilotCoordinatorResult } from "./nextActionDecisionModel.js";
import type { CodexReportContract, CodexPushStatus } from "./reportContract.js";
import type { AutopilotReportValidationResult } from "./reportValidator.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type {
  AutopilotBoundarySet,
  AutopilotFinding,
  AutopilotMode,
  AutopilotRiskLevel,
} from "./types.js";

export type AutopilotCloseoutStatus =
  | "closed_and_pushed"
  | "completed_local_only"
  | "needs_commit"
  | "needs_push"
  | "needs_human_review"
  | "blocked"
  | "unsafe_scope"
  | "ready_for_next_phase"
  | "ready_for_roadmap_return";

export type AutopilotCloseoutAlertLevel =
  | "no_alert"
  | "mild_alert"
  | "blocking_alert";

export type AutopilotCloseoutPromptType =
  | "none"
  | "implementation_prompt"
  | "planning_prompt"
  | "human_review_prompt"
  | "rollback_plan_prompt"
  | "roadmap_return_prompt";

export type AutopilotCloseoutCheckStatus =
  | "passed"
  | "failed"
  | "not_run"
  | "skipped";

export interface AutopilotCloseoutCheckResult {
  name: string;
  status: AutopilotCloseoutCheckStatus;
  safeSummary: string;
  metadataOnly: true;
}

export interface AutopilotCloseoutBlockerSummary {
  blocked: boolean;
  reasons: string[];
  metadataOnly: true;
}

export interface AutopilotCloseoutHumanOutput {
  alertLabel: "No hay alerta" | "Alerta leve" | "Alerta bloqueante";
  nextPhaseLine: string;
  recommendedModelLine: string;
  promptLine: string;
  skeleton: string;
  metadataOnly: true;
  noExecution: true;
}

export interface AutopilotCloseoutInput {
  phase: string;
  phaseMode: AutopilotMode;
  branch: string;
  expectedNextPhase: string;
  roadmapTarget: string;
  finalReport: CodexReportContract;
  validation: AutopilotReportValidationResult;
  nextActionRecommendation?: AutopilotCoordinatorResult;
  memoryProposalStatus?: "proposed" | "approved" | "rejected" | "deferred";
  testsResult: AutopilotCloseoutCheckResult;
  smokeResult: AutopilotCloseoutCheckResult;
  typecheckResult: AutopilotCloseoutCheckResult;
  forbiddenGrepResult: AutopilotCloseoutCheckResult;
  scopeCheckResult: AutopilotCloseoutCheckResult;
  stagedFiles: string[];
  dirtyFilesOutsideScope: string[];
  commitHash?: string;
  pushStatus?: CodexPushStatus;
  riskLevel: AutopilotRiskLevel;
  acceptedWarnings?: string[];
  unresolvedBlockers?: string[];
  sourceOnlyImplementation?: boolean;
  recommendedModel?: string;
}

export interface AutopilotCloseoutResult {
  closeoutId: string;
  phase: string;
  closeoutStatus: AutopilotCloseoutStatus;
  alertLevel: AutopilotCloseoutAlertLevel;
  closeoutMessage: string;
  commitRequired: boolean;
  pushRequired: boolean;
  humanReviewRequired: boolean;
  safeToContinue: boolean;
  nextPhase: string;
  roadmapReturnAllowed: boolean;
  blockerSummary: AutopilotCloseoutBlockerSummary;
  recommendedModel: string;
  requiredPromptType: AutopilotCloseoutPromptType;
  humanFacingOutput: AutopilotCloseoutHumanOutput;
  findings: AutopilotFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noCodexInvocation: true;
  noProcessLaunch: true;
  noProviderCalls: true;
  noNetwork: true;
  noDashboardMutation: true;
  noGitMutationFromSource: true;
  noMemoryPersistence: true;
  boundaries: AutopilotBoundarySet;
}

export const autopilotCloseoutStatuses = [
  "closed_and_pushed",
  "completed_local_only",
  "needs_commit",
  "needs_push",
  "needs_human_review",
  "blocked",
  "unsafe_scope",
  "ready_for_next_phase",
  "ready_for_roadmap_return",
] as const satisfies readonly AutopilotCloseoutStatus[];

export const autopilotCloseoutPromptTypes = [
  "none",
  "implementation_prompt",
  "planning_prompt",
  "human_review_prompt",
  "rollback_plan_prompt",
  "roadmap_return_prompt",
] as const satisfies readonly AutopilotCloseoutPromptType[];

export function closeoutAlertLabel(
  alertLevel: AutopilotCloseoutAlertLevel,
): AutopilotCloseoutHumanOutput["alertLabel"] {
  if (alertLevel === "blocking_alert") {
    return "Alerta bloqueante";
  }

  if (alertLevel === "mild_alert") {
    return "Alerta leve";
  }

  return "No hay alerta";
}

export function createCloseoutBlockerSummary(
  reasons: readonly string[],
): AutopilotCloseoutBlockerSummary {
  return {
    blocked: reasons.length > 0,
    reasons: [...reasons],
    metadataOnly: true,
  };
}

export function createCloseoutFinding(
  phase: string,
  reasonCode: string,
  safeMessage: string,
  severity: AutopilotFinding["severity"],
): AutopilotFinding {
  return {
    findingId: `${phase}:closeout:${reasonCode.toLowerCase()}`,
    reasonCode,
    severity,
    safeMessage,
  };
}

export const autopilotCloseoutSourceOnlyBoundaries =
  autopilotSourceOnlyBoundaries;
