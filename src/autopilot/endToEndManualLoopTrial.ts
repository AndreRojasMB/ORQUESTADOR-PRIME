import type { AutopilotMode, AutopilotRiskLevel } from "./types.js";
import type { AutopilotReportValidationStatus } from "./reportValidator.js";
import type {
  ControlledCodexReportAlertLevel,
  ControlledCodexReportCloseoutStatus,
} from "./controlledCodexReportReturn.js";

export type EndToEndManualLoopStageName =
  | "create_dry_run"
  | "generate_prompt_draft"
  | "validate_handoff"
  | "approve_for_copy"
  | "manual_copy_to_codex"
  | "manual_codex_execution"
  | "manual_report_return"
  | "normalize_report"
  | "validate_report"
  | "generate_next_action"
  | "generate_closeout"
  | "render_human_response";

export type EndToEndManualActionType =
  | "copy_prompt"
  | "paste_prompt_to_codex"
  | "run_codex_manually"
  | "paste_codex_report_back"
  | "approve_next_phase";

export type EndToEndManualLoopTrialStatus =
  | "completed"
  | "needs_review"
  | "blocked";

export interface EndToEndManualLoopTrialInput {
  trialId: string;
  userIdeaText: string;
  sourceDryRunRef: string;
  handoffRef: string;
  targetCodexPhase: string;
  targetCodexMode: AutopilotMode;
  manualCopyRequired: boolean;
  manualReportReturnRequired: boolean;
  expectedArtifactChain: readonly string[];
  expectedReportShape: readonly string[];
  expectedValidationStatus: AutopilotReportValidationStatus;
  expectedCloseoutStatus: ControlledCodexReportCloseoutStatus;
  expectedNextAction: string;
  riskLevel: AutopilotRiskLevel;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
}

export interface EndToEndManualLoopStage {
  stageId: string;
  stageName: EndToEndManualLoopStageName;
  inputRefs: readonly string[];
  outputRefs: readonly string[];
  humanActionRequired: boolean;
  automationAllowed: boolean;
  blockingConditions: readonly string[];
  riskLevel: AutopilotRiskLevel;
  evidenceRefs: readonly string[];
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface EndToEndManualAction {
  actionId: string;
  actionType: EndToEndManualActionType;
  requiredHuman: boolean;
  instruction: string;
  expectedEvidence: readonly string[];
  safetyWarning: string;
  allowedAutomationLevel: "manual_only";
  completionClaim: string;
  riskLevel: AutopilotRiskLevel;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noCodexInvocation: true;
  noOpenClawInvocation: true;
  noSystemCopyBuffer: true;
  noProviderCalls: true;
  noFilesystemWrites: true;
}

export interface EndToEndManualLoopValidation {
  validationId: string;
  dryRunComplete: boolean;
  promptDraftPresent: boolean;
  handoffApprovedForCopy: boolean;
  safeToExecuteRemainsFalse: boolean;
  manualCopyConfirmed: boolean;
  manualExecutionConfirmed: boolean;
  reportReturnConfirmed: boolean;
  reportValidationStatus: AutopilotReportValidationStatus;
  closeoutStatus: ControlledCodexReportCloseoutStatus;
  nextActionProduced: boolean;
  sourceSideExecutionAbsent: boolean;
  blockers: readonly string[];
  warnings: readonly string[];
  validationStatus: AutopilotReportValidationStatus;
  alertLevel: ControlledCodexReportAlertLevel;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface EndToEndManualLoopOutcome {
  outcomeId: string;
  trialStatus: EndToEndManualLoopTrialStatus;
  completedStages: readonly EndToEndManualLoopStageName[];
  blockedStages: readonly EndToEndManualLoopStageName[];
  manualActionsRequired: readonly EndToEndManualActionType[];
  manualActionsCompleted: readonly EndToEndManualActionType[];
  nextRecommendedPhase: string;
  closeoutStatus: ControlledCodexReportCloseoutStatus;
  safeToContinue: boolean;
  humanFacingSummary: string;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface EndToEndManualLoopSummary {
  summaryId: string;
  trialId: string;
  targetCodexPhase: string;
  targetCodexMode: AutopilotMode;
  stageCount: number;
  blockedStageCount: number;
  manualActionCount: number;
  completedManualActionCount: number;
  validationStatus: AutopilotReportValidationStatus;
  alertLevel: ControlledCodexReportAlertLevel;
  closeoutStatus: ControlledCodexReportCloseoutStatus;
  safeToContinue: boolean;
  recommendedNextPhase: string;
  safeSummary: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface EndToEndManualLoopTrial {
  input: EndToEndManualLoopTrialInput;
  stages: readonly EndToEndManualLoopStage[];
  manualActions: readonly EndToEndManualAction[];
  validation: EndToEndManualLoopValidation;
  outcome: EndToEndManualLoopOutcome;
  summary: EndToEndManualLoopSummary;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noCodexInvocation: true;
  noOpenClawInvocation: true;
  noSystemCopyBuffer: true;
  noReportRetrieval: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemWrites: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
}

const requiredStageNames: readonly EndToEndManualLoopStageName[] = [
  "create_dry_run",
  "generate_prompt_draft",
  "validate_handoff",
  "approve_for_copy",
  "manual_copy_to_codex",
  "manual_codex_execution",
  "manual_report_return",
  "normalize_report",
  "validate_report",
  "generate_next_action",
  "generate_closeout",
  "render_human_response",
];

const requiredManualActionTypes: readonly EndToEndManualActionType[] = [
  "copy_prompt",
  "paste_prompt_to_codex",
  "run_codex_manually",
  "paste_codex_report_back",
  "approve_next_phase",
];

const manualOnlyStages: readonly EndToEndManualLoopStageName[] = [
  "manual_copy_to_codex",
  "manual_codex_execution",
  "manual_report_return",
];

const cleanCloseoutStatuses: readonly ControlledCodexReportCloseoutStatus[] = [
  "closed_and_pushed",
  "completed_local_only",
];

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const uniqueStages = (
  values: readonly EndToEndManualLoopStageName[] | undefined,
): EndToEndManualLoopStageName[] => Array.from(new Set(values ?? []));

const uniqueActions = (
  values: readonly EndToEndManualActionType[] | undefined,
): EndToEndManualActionType[] => Array.from(new Set(values ?? []));

const normalizeClaim = (claim: string): string => claim.trim().toLowerCase();

const actionCompletedByHuman = (
  action: EndToEndManualAction | undefined,
): boolean =>
  action !== undefined &&
  action.requiredHuman &&
  action.allowedAutomationLevel === "manual_only" &&
  action.completionClaim.trim().length > 0 &&
  !normalizeClaim(action.completionClaim).includes("missing") &&
  !normalizeClaim(action.completionClaim).includes("not_completed") &&
  !normalizeClaim(action.completionClaim).includes("blocked");

const statusFromBlockers = (
  blockers: readonly string[],
  warnings: readonly string[],
): AutopilotReportValidationStatus => {
  if (blockers.some((blocker) => blocker.startsWith("blocked:"))) {
    return "blocked";
  }

  if (blockers.some((blocker) => blocker.startsWith("failed:"))) {
    return "failed";
  }

  if (blockers.length > 0 || warnings.length > 0) {
    return "needs_review";
  }

  return "passed";
};

const alertFromStatus = (
  status: AutopilotReportValidationStatus,
): ControlledCodexReportAlertLevel =>
  status === "blocked" || status === "failed"
    ? "blocking_alert"
    : status === "needs_review"
      ? "mild_alert"
      : "no_alert";

export const createEndToEndManualLoopStage = (
  input: Omit<
    EndToEndManualLoopStage,
    "advisoryOnly" | "sourceOnly" | "metadataOnly" | "noExecution"
  >,
): EndToEndManualLoopStage => ({
  ...input,
  automationAllowed: manualOnlyStages.includes(input.stageName)
    ? false
    : input.automationAllowed,
  inputRefs: uniqueStrings(input.inputRefs),
  outputRefs: uniqueStrings(input.outputRefs),
  blockingConditions: uniqueStrings(input.blockingConditions),
  evidenceRefs: uniqueStrings(input.evidenceRefs),
  limitations: uniqueStrings(input.limitations),
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecution: true,
});

export const createEndToEndManualAction = (
  input: Omit<
    EndToEndManualAction,
    | "advisoryOnly"
    | "sourceOnly"
    | "metadataOnly"
    | "noExecution"
    | "noCodexInvocation"
    | "noOpenClawInvocation"
    | "noSystemCopyBuffer"
    | "noProviderCalls"
    | "noFilesystemWrites"
  >,
): EndToEndManualAction => ({
  ...input,
  requiredHuman: true,
  allowedAutomationLevel: "manual_only",
  expectedEvidence: uniqueStrings(input.expectedEvidence),
  limitations: uniqueStrings(input.limitations),
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecution: true,
  noCodexInvocation: true,
  noOpenClawInvocation: true,
  noSystemCopyBuffer: true,
  noProviderCalls: true,
  noFilesystemWrites: true,
});

export const selectBlockedEndToEndStages = (
  stages: readonly EndToEndManualLoopStage[],
): EndToEndManualLoopStage[] =>
  stages.filter((stage) => stage.blockingConditions.length > 0);

export const selectRequiredManualActions = (
  actions: readonly EndToEndManualAction[],
): EndToEndManualAction[] =>
  actions.filter((action) => action.requiredHuman);

export const validateEndToEndManualLoopTrial = (input: {
  trial: EndToEndManualLoopTrialInput;
  stages: readonly EndToEndManualLoopStage[];
  manualActions: readonly EndToEndManualAction[];
  promptDraftPresent?: boolean;
  handoffApprovedForCopy?: boolean;
  safeToExecute?: boolean;
  reportValidationStatus?: AutopilotReportValidationStatus;
  closeoutStatus?: ControlledCodexReportCloseoutStatus;
  nextActionProduced?: boolean;
  sourceSideExecutionAbsent?: boolean;
}): EndToEndManualLoopValidation => {
  const stageNames = new Set(input.stages.map((stage) => stage.stageName));
  const actionByType = new Map(
    input.manualActions.map((action) => [action.actionType, action]),
  );
  const missingStages = requiredStageNames.filter((stage) => !stageNames.has(stage));
  const missingActions = requiredManualActionTypes.filter(
    (action) => !actionByType.has(action),
  );
  const copyPrompt = actionByType.get("copy_prompt");
  const pastePrompt = actionByType.get("paste_prompt_to_codex");
  const runManually = actionByType.get("run_codex_manually");
  const returnReport = actionByType.get("paste_codex_report_back");
  const approveNext = actionByType.get("approve_next_phase");
  const manualOnlyViolation = input.stages.some(
    (stage) => manualOnlyStages.includes(stage.stageName) && stage.automationAllowed,
  );
  const nonManualAction = input.manualActions.some(
    (action) => action.allowedAutomationLevel !== "manual_only" || !action.requiredHuman,
  );
  const dryRunComplete =
    input.trial.sourceDryRunRef.trim().length > 0 &&
    input.trial.expectedArtifactChain.length > 0 &&
    missingStages.length === 0;
  const promptDraftPresent =
    input.promptDraftPresent ??
    input.trial.expectedArtifactChain.includes("prompt_draft_metadata");
  const handoffApprovedForCopy = input.handoffApprovedForCopy ?? true;
  const safeToExecuteRemainsFalse = input.safeToExecute !== true;
  const manualCopyConfirmed =
    actionCompletedByHuman(copyPrompt) && actionCompletedByHuman(pastePrompt);
  const manualExecutionConfirmed = actionCompletedByHuman(runManually);
  const reportReturnConfirmed =
    actionCompletedByHuman(returnReport) && input.trial.manualReportReturnRequired;
  const reportValidationStatus =
    input.reportValidationStatus ?? input.trial.expectedValidationStatus;
  const closeoutStatus = input.closeoutStatus ?? input.trial.expectedCloseoutStatus;
  const nextActionProduced =
    input.nextActionProduced ?? input.trial.expectedNextAction.trim().length > 0;
  const sourceSideExecutionAbsent = input.sourceSideExecutionAbsent !== false;

  const blockers = uniqueStrings([
    ...(!dryRunComplete ? ["blocked:dry_run_incomplete"] : []),
    ...(!promptDraftPresent ? ["blocked:prompt_draft_missing"] : []),
    ...(!handoffApprovedForCopy ? ["blocked:handoff_not_approved_for_copy"] : []),
    ...(!safeToExecuteRemainsFalse ? ["blocked:prompt_marked_action_ready"] : []),
    ...(!manualCopyConfirmed ? ["blocked:manual_copy_missing"] : []),
    ...(!manualExecutionConfirmed ? ["blocked:manual_external_run_missing"] : []),
    ...(!reportReturnConfirmed ? ["blocked:manual_report_return_missing"] : []),
    ...(!nextActionProduced ? ["blocked:next_action_missing"] : []),
    ...(!sourceSideExecutionAbsent ? ["blocked:source_side_external_action_claim"] : []),
    ...(
      reportValidationStatus === "blocked"
        ? ["blocked:report_validation_blocked"]
        : []
    ),
    ...(
      reportValidationStatus === "failed"
        ? ["failed:report_validation_failed"]
        : []
    ),
    ...(
      closeoutStatus === "blocked" || closeoutStatus === "unsafe_scope"
        ? [`blocked:closeout_${closeoutStatus}`]
        : []
    ),
    ...(missingStages.length > 0
      ? missingStages.map((stage) => `blocked:missing_stage_${stage}`)
      : []),
    ...(missingActions.length > 0
      ? missingActions.map((action) => `blocked:missing_manual_action_${action}`)
      : []),
    ...(manualOnlyViolation ? ["blocked:manual_stage_allows_automation"] : []),
    ...(nonManualAction ? ["blocked:manual_action_not_manual_only"] : []),
  ]);
  const warnings = uniqueStrings([
    ...(
      reportValidationStatus === "needs_review"
        ? ["warning:report_validation_needs_review"]
        : []
    ),
    ...(
      closeoutStatus === "needs_human_review"
        ? ["warning:closeout_needs_human_review"]
        : []
    ),
    ...(!actionCompletedByHuman(approveNext)
      ? ["warning:next_phase_approval_pending"]
      : []),
    ...selectBlockedEndToEndStages(input.stages).map(
      (stage) => `warning:stage_has_blocking_conditions:${stage.stageName}`,
    ),
  ]);
  const validationStatus = statusFromBlockers(blockers, warnings);
  const alertLevel = alertFromStatus(validationStatus);

  return {
    validationId: `${input.trial.trialId}:validation`,
    dryRunComplete,
    promptDraftPresent,
    handoffApprovedForCopy,
    safeToExecuteRemainsFalse,
    manualCopyConfirmed,
    manualExecutionConfirmed,
    reportReturnConfirmed,
    reportValidationStatus,
    closeoutStatus,
    nextActionProduced,
    sourceSideExecutionAbsent,
    blockers,
    warnings,
    validationStatus,
    alertLevel,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
  };
};

export const evaluateEndToEndManualLoopOutcome = (input: {
  trial: EndToEndManualLoopTrialInput;
  stages: readonly EndToEndManualLoopStage[];
  manualActions: readonly EndToEndManualAction[];
  validation: EndToEndManualLoopValidation;
}): EndToEndManualLoopOutcome => {
  const blockedStages = uniqueStages(
    selectBlockedEndToEndStages(input.stages).map((stage) => stage.stageName),
  );
  const completedStages = uniqueStages(
    input.stages
      .filter((stage) => stage.blockingConditions.length === 0)
      .map((stage) => stage.stageName),
  );
  const manualActionsRequired = uniqueActions(
    selectRequiredManualActions(input.manualActions).map((action) => action.actionType),
  );
  const manualActionsCompleted = uniqueActions(
    input.manualActions
      .filter((action) => actionCompletedByHuman(action))
      .map((action) => action.actionType),
  );
  const closeoutClean = cleanCloseoutStatuses.includes(input.validation.closeoutStatus);
  const safeToContinue =
    input.validation.validationStatus === "passed" &&
    closeoutClean &&
    input.validation.sourceSideExecutionAbsent;
  const trialStatus: EndToEndManualLoopTrialStatus = safeToContinue
    ? "completed"
    : input.validation.alertLevel === "blocking_alert"
      ? "blocked"
      : "needs_review";

  return {
    outcomeId: `${input.trial.trialId}:outcome`,
    trialStatus,
    completedStages,
    blockedStages,
    manualActionsRequired,
    manualActionsCompleted,
    nextRecommendedPhase: safeToContinue
      ? input.trial.expectedNextAction
      : "human_review_required",
    closeoutStatus: input.validation.closeoutStatus,
    safeToContinue,
    humanFacingSummary: safeToContinue
      ? "End-to-end manual loop trial metadata passed with human-mediated handoff and report return evidence."
      : "End-to-end manual loop trial metadata needs review or retry before continuing.",
    limitations: uniqueStrings(input.trial.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
  };
};

export const summarizeEndToEndManualLoopTrial = (input: {
  trial: EndToEndManualLoopTrialInput;
  stages: readonly EndToEndManualLoopStage[];
  manualActions: readonly EndToEndManualAction[];
  validation: EndToEndManualLoopValidation;
  outcome: EndToEndManualLoopOutcome;
}): EndToEndManualLoopSummary => ({
  summaryId: `${input.trial.trialId}:summary`,
  trialId: input.trial.trialId,
  targetCodexPhase: input.trial.targetCodexPhase,
  targetCodexMode: input.trial.targetCodexMode,
  stageCount: input.stages.length,
  blockedStageCount: input.outcome.blockedStages.length,
  manualActionCount: input.outcome.manualActionsRequired.length,
  completedManualActionCount: input.outcome.manualActionsCompleted.length,
  validationStatus: input.validation.validationStatus,
  alertLevel: input.validation.alertLevel,
  closeoutStatus: input.outcome.closeoutStatus,
  safeToContinue: input.outcome.safeToContinue,
  recommendedNextPhase: input.outcome.nextRecommendedPhase,
  safeSummary: input.outcome.humanFacingSummary,
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecution: true,
});

export const createEndToEndManualLoopTrial = (input: {
  trial: EndToEndManualLoopTrialInput;
  stages: readonly EndToEndManualLoopStage[];
  manualActions: readonly EndToEndManualAction[];
  promptDraftPresent?: boolean;
  handoffApprovedForCopy?: boolean;
  safeToExecute?: boolean;
  reportValidationStatus?: AutopilotReportValidationStatus;
  closeoutStatus?: ControlledCodexReportCloseoutStatus;
  nextActionProduced?: boolean;
  sourceSideExecutionAbsent?: boolean;
}): EndToEndManualLoopTrial => {
  const validationInput: Parameters<typeof validateEndToEndManualLoopTrial>[0] = {
    trial: input.trial,
    stages: input.stages,
    manualActions: input.manualActions,
  };

  if (input.promptDraftPresent !== undefined) {
    validationInput.promptDraftPresent = input.promptDraftPresent;
  }

  if (input.handoffApprovedForCopy !== undefined) {
    validationInput.handoffApprovedForCopy = input.handoffApprovedForCopy;
  }

  if (input.safeToExecute !== undefined) {
    validationInput.safeToExecute = input.safeToExecute;
  }

  if (input.reportValidationStatus !== undefined) {
    validationInput.reportValidationStatus = input.reportValidationStatus;
  }

  if (input.closeoutStatus !== undefined) {
    validationInput.closeoutStatus = input.closeoutStatus;
  }

  if (input.nextActionProduced !== undefined) {
    validationInput.nextActionProduced = input.nextActionProduced;
  }

  if (input.sourceSideExecutionAbsent !== undefined) {
    validationInput.sourceSideExecutionAbsent = input.sourceSideExecutionAbsent;
  }

  const validation = validateEndToEndManualLoopTrial(validationInput);
  const outcome = evaluateEndToEndManualLoopOutcome({
    trial: input.trial,
    stages: input.stages,
    manualActions: input.manualActions,
    validation,
  });
  const summary = summarizeEndToEndManualLoopTrial({
    trial: input.trial,
    stages: input.stages,
    manualActions: input.manualActions,
    validation,
    outcome,
  });

  return {
    input: input.trial,
    stages: input.stages,
    manualActions: input.manualActions,
    validation,
    outcome,
    summary,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noCodexInvocation: true,
    noOpenClawInvocation: true,
    noSystemCopyBuffer: true,
    noReportRetrieval: true,
    noProviderCalls: true,
    noNetwork: true,
    noFilesystemWrites: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
  };
};
