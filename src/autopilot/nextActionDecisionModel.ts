import type { AutopilotErrorLearningRulesResult } from "./errorLearningRules.js";
import type { AutopilotMemoryUpdateProposalFromReport } from "./memoryProposalBuilder.js";
import type { CodexReportContract, CodexPushStatus } from "./reportContract.js";
import type {
  AutopilotReportValidationResult,
  AutopilotReportValidationStatus,
} from "./reportValidator.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type {
  AutopilotBoundarySet,
  AutopilotFinding,
  AutopilotMode,
  AutopilotRiskLevel,
} from "./types.js";
import type { AutopilotValidationSummary } from "./autopilotValidationSummary.js";

export type AutopilotCoordinatorAlertLevel =
  | "no_alert"
  | "mild_alert"
  | "blocking_alert";

export type AutopilotCoordinatorNextAction =
  | "continue_next_phase"
  | "continue_to_I_phase"
  | "continue_to_next_B_phase"
  | "retry_phase"
  | "request_human_review"
  | "freeze_scope"
  | "rollback_plan"
  | "blocked"
  | "closeout_required";

export type AutopilotApprovalStatus =
  | "not_required"
  | "required"
  | "approved"
  | "rejected"
  | "pending_review";

export interface AutopilotDirtyFilesStatus {
  knownPreExisting: string[];
  currentDirty: string[];
  staged: string[];
  metadataOnly: true;
}

export interface AutopilotCoordinatorBlockerSummary {
  blocked: boolean;
  reasons: string[];
  metadataOnly: true;
}

export interface AutopilotCoordinatorPromptSeed {
  promptNeeded: boolean;
  handoffAllowed: boolean;
  promptTitle: string;
  safeSummary: string;
  metadataOnly: true;
  noCodexInvocation: true;
}

export interface AutopilotCoordinatorHumanOutput {
  alertLabel: "No hay alerta" | "Alerta leve" | "Alerta bloqueante";
  nextPhaseLine: string;
  recommendedModelLine: string;
  promptLine: string;
  skeleton: string;
  metadataOnly: true;
  noExecution: true;
}

export interface AutopilotCoordinatorInput {
  phase: string;
  phaseMode: AutopilotMode;
  previousPhaseMode?: AutopilotMode;
  expectedNextPhase: string;
  matchingImplementationPhase?: string;
  report: CodexReportContract;
  validation: AutopilotReportValidationResult;
  validationSummary: AutopilotValidationSummary;
  memoryProposal?: AutopilotMemoryUpdateProposalFromReport;
  errorLearningRules?: AutopilotErrorLearningRulesResult;
  dirtyFilesStatus?: AutopilotDirtyFilesStatus;
  commitStatus?: "not_required" | "present" | "missing" | "unexpected";
  pushStatus?: CodexPushStatus;
  riskLevel: AutopilotRiskLevel;
  approvalStatus: AutopilotApprovalStatus;
  blockedReasons?: string[];
  recommendedModel?: string;
}

export interface AutopilotCoordinatorResult {
  coordinationId: string;
  phase: string;
  alertLevel: AutopilotCoordinatorAlertLevel;
  alertMessage: string;
  nextPhase: string;
  nextAction: AutopilotCoordinatorNextAction;
  reason: string;
  recommendedModel: string;
  promptNeeded: boolean;
  handoffAllowed: boolean;
  memoryWriteAllowed: false;
  requiredApproval: boolean;
  blockerSummary: AutopilotCoordinatorBlockerSummary;
  humanFacingResponseSkeleton: AutopilotCoordinatorHumanOutput;
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

export const autopilotCoordinatorNextActions = [
  "continue_next_phase",
  "continue_to_I_phase",
  "continue_to_next_B_phase",
  "retry_phase",
  "request_human_review",
  "freeze_scope",
  "rollback_plan",
  "blocked",
  "closeout_required",
] as const satisfies readonly AutopilotCoordinatorNextAction[];

export const autopilotCoordinatorAlertLevels = [
  "no_alert",
  "mild_alert",
  "blocking_alert",
] as const satisfies readonly AutopilotCoordinatorAlertLevel[];

export function coordinatorAlertLabel(
  alertLevel: AutopilotCoordinatorAlertLevel,
): AutopilotCoordinatorHumanOutput["alertLabel"] {
  if (alertLevel === "blocking_alert") {
    return "Alerta bloqueante";
  }

  if (alertLevel === "mild_alert") {
    return "Alerta leve";
  }

  return "No hay alerta";
}

export function isValidationPassed(
  status: AutopilotReportValidationStatus,
): boolean {
  return status === "passed";
}

export function isFutureExecutionRisk(
  riskLevel: AutopilotRiskLevel,
): boolean {
  return (
    riskLevel === "execute_low_risk_future" ||
    riskLevel === "execute_gated_future"
  );
}

export function createCoordinatorBlockerSummary(
  reasons: readonly string[],
): AutopilotCoordinatorBlockerSummary {
  return {
    blocked: reasons.length > 0,
    reasons: [...reasons],
    metadataOnly: true,
  };
}

export function createCoordinatorFinding(
  phase: string,
  reasonCode: string,
  safeMessage: string,
  severity: AutopilotFinding["severity"],
): AutopilotFinding {
  return {
    findingId: `${phase}:coordinator:${reasonCode.toLowerCase()}`,
    reasonCode,
    severity,
    safeMessage,
  };
}

export const autopilotCoordinatorSourceOnlyBoundaries =
  autopilotSourceOnlyBoundaries;
