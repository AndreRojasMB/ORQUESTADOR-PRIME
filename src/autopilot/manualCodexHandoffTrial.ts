import type { HumanApprovedCodexHandoffPackage } from "./humanApprovedCodexHandoff.js";
import type {
  AutopilotCoordinatorAlertLevel,
  AutopilotCoordinatorNextAction,
} from "./nextActionDecisionModel.js";
import type { AutopilotCloseoutStatus } from "./phaseCloseoutDecisionModel.js";
import type { CodexReportContract } from "./reportContract.js";
import type {
  AutopilotMode,
  AutopilotRiskLevel,
} from "./types.js";
import type { AutopilotReportValidationStatus } from "./reportValidator.js";

export type ManualCodexTrialStatus =
  | "ready_for_manual_run"
  | "completed"
  | "needs_review"
  | "blocked";

export interface ManualCodexHandoffTrialInput {
  trialId: string;
  sourceDryRunRef: string;
  handoffRef: string;
  targetPhase: string;
  targetMode: AutopilotMode;
  manualCopyRequired: boolean;
  codexExecutionManual: boolean;
  expectedCodexReportShape: readonly string[];
  expectedValidationStatus: AutopilotReportValidationStatus;
  expectedNextAction: AutopilotCoordinatorNextAction;
  riskLevel: AutopilotRiskLevel;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
}

export interface ManualCodexCopyStep {
  copyStepId: string;
  promptRef: string;
  approvedForCopy: boolean;
  copiedByHuman: boolean;
  copiedAtLabel: string;
  destination: string;
  executionNotAutomated: boolean;
  riskLevel: AutopilotRiskLevel;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noCodexInvocation: true;
  noSystemCopyAutomation: true;
  noProviderCalls: true;
  noFilesystemWrites: true;
}

export interface ManualCodexExpectedReport {
  phase: string;
  filesInspected: readonly string[];
  filesModified: readonly string[];
  summary: string;
  safetyGuarantees: readonly string[];
  testsScripts: readonly string[];
  commandsExecuted: readonly string[];
  scopeCheck: string;
  forbiddenGrep: string;
  commitPush: string;
  nextRecommendedPhase: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface ManualCodexTrialValidation {
  validationId: string;
  expectedPhaseMatches: boolean;
  expectedModeMatches: boolean;
  scopeRespected: boolean;
  forbiddenFilesUntouched: boolean;
  dirtyOutsideScopeNotStaged: boolean;
  typecheckReported: boolean;
  smokeReported: boolean;
  forbiddenGrepClean: boolean;
  commitPushAppropriate: boolean;
  unsafeRuntimeClaimsAbsent: boolean;
  validationStatus: AutopilotReportValidationStatus;
  alertLevel: AutopilotCoordinatorAlertLevel;
  recommendedAction: AutopilotCoordinatorNextAction;
  blockers: readonly string[];
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface ManualCodexTrialOutcome {
  outcomeId: string;
  trialStatus: ManualCodexTrialStatus;
  handoffApprovedForCopy: boolean;
  promptCopiedManually: boolean;
  codexReportReceived: boolean;
  validationStatus: AutopilotReportValidationStatus;
  nextActionProduced: boolean;
  closeoutStatusProduced: boolean;
  safeToContinue: boolean;
  recommendedNextPhase: string;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface ManualCodexTrialSummary {
  summaryId: string;
  trialId: string;
  trialStatus: ManualCodexTrialStatus;
  targetPhase: string;
  targetMode: AutopilotMode;
  validationStatus: AutopilotReportValidationStatus;
  alertLevel: AutopilotCoordinatorAlertLevel;
  blockerCount: number;
  safeToContinue: boolean;
  recommendedNextPhase: string;
  safeSummary: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface ManualCodexHandoffTrial {
  input: ManualCodexHandoffTrialInput;
  copyStep: ManualCodexCopyStep;
  expectedReport: ManualCodexExpectedReport;
  returnedReport: CodexReportContract;
  validation: ManualCodexTrialValidation;
  outcome: ManualCodexTrialOutcome;
  summary: ManualCodexTrialSummary;
  closeoutStatus: AutopilotCloseoutStatus;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noCodexInvocation: true;
  noProviderCalls: true;
  noFilesystemWrites: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
}

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const expectedReportShape: readonly string[] = [
  "phase",
  "files inspected",
  "files modified",
  "implementation or plan summary",
  "safety guarantees",
  "tests/scripts",
  "commands executed",
  "scope check",
  "forbidden grep",
  "commit/push",
  "next recommended phase",
];

const unsafeClaimMarkers: readonly string[] = [
  "provider call completed",
  "dashboard mutation completed",
  "db/sql mutation completed",
  "package workflow changed",
  "runtime runner started",
  "secret material exposed",
  "network call completed",
  "project files written from source",
];

const pathMatchesPattern = (path: string, pattern: string): boolean => {
  if (pattern.endsWith("/*")) {
    return path.startsWith(pattern.slice(0, -1));
  }

  if (pattern.endsWith("*")) {
    return path.startsWith(pattern.slice(0, -1));
  }

  return path === pattern;
};

const pathMatchesAny = (path: string, patterns: readonly string[]): boolean =>
  patterns.some((pattern) => pathMatchesPattern(path, pattern));

const normalizedIncludes = (values: readonly string[], expected: string): boolean => {
  const needle = expected.toLowerCase();
  return values.some((value) => value.toLowerCase().includes(needle));
};

const reportText = (report: CodexReportContract): string =>
  [
    report.summary,
    report.scopeCheck,
    report.forbiddenGrepResult,
    report.nextRecommendedPhase,
    ...report.findings.map((finding) => finding.safeMessage),
  ].join("\n");

const isForbiddenGrepClean = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.includes("clean") ||
    normalized.includes("no matches") ||
    normalized.includes("no forbidden") ||
    normalized.includes("allowed historical")
  );
};

const expectedModeMatchesReport = (
  targetMode: AutopilotMode,
  report: CodexReportContract,
): boolean => {
  if (targetMode === "B") {
    return report.pushStatus === "not_requested" || report.pushStatus === undefined;
  }

  if (targetMode === "I") {
    return report.pushStatus === "pushed" && typeof report.commitHash === "string";
  }

  return true;
};

const statusFromBlockers = (blockers: readonly string[]): AutopilotReportValidationStatus => {
  if (blockers.some((blocker) => blocker.startsWith("blocked:"))) {
    return "blocked";
  }

  if (blockers.some((blocker) => blocker.startsWith("failed:"))) {
    return "failed";
  }

  if (blockers.length > 0) {
    return "needs_review";
  }

  return "passed";
};

const actionFromStatus = (
  status: AutopilotReportValidationStatus,
  targetMode: AutopilotMode,
): AutopilotCoordinatorNextAction => {
  if (status === "blocked") {
    return "blocked";
  }

  if (status === "failed") {
    return "retry_phase";
  }

  if (status === "needs_review") {
    return "request_human_review";
  }

  return targetMode === "B" ? "continue_to_I_phase" : "continue_to_next_B_phase";
};

export const createManualCodexCopyStep = (
  input: Omit<
    ManualCodexCopyStep,
    | "advisoryOnly"
    | "sourceOnly"
    | "metadataOnly"
    | "noCodexInvocation"
    | "noSystemCopyAutomation"
    | "noProviderCalls"
    | "noFilesystemWrites"
  >,
): ManualCodexCopyStep => ({
  ...input,
  limitations: uniqueStrings(input.limitations),
  executionNotAutomated: true,
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noCodexInvocation: true,
  noSystemCopyAutomation: true,
  noProviderCalls: true,
  noFilesystemWrites: true,
});

export const createManualCodexExpectedReport = (
  input: Omit<ManualCodexExpectedReport, "advisoryOnly" | "sourceOnly" | "metadataOnly">,
): ManualCodexExpectedReport => ({
  ...input,
  filesInspected: uniqueStrings(input.filesInspected),
  filesModified: uniqueStrings(input.filesModified),
  safetyGuarantees: uniqueStrings(input.safetyGuarantees),
  testsScripts: uniqueStrings(input.testsScripts),
  commandsExecuted: uniqueStrings(input.commandsExecuted),
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
});

export const validateManualCodexTrialReport = (input: {
  trial: ManualCodexHandoffTrialInput;
  copyStep: ManualCodexCopyStep;
  handoffPackage: Pick<
    HumanApprovedCodexHandoffPackage,
    "safeToCopy" | "safeToExecute" | "requiresHumanApproval" | "allowedFiles" | "forbiddenFiles"
  >;
  report: CodexReportContract;
  expectedReport: ManualCodexExpectedReport;
  currentDirtyFiles?: readonly string[];
  previousDirtyFiles?: readonly string[];
  stagedFiles?: readonly string[];
}): ManualCodexTrialValidation => {
  const previousDirty = new Set(input.previousDirtyFiles ?? []);
  const currentDirty = input.currentDirtyFiles ?? [];
  const stagedFiles = input.stagedFiles ?? [];
  const expectedPhaseMatches = input.report.phase === input.trial.targetPhase;
  const expectedModeMatches = expectedModeMatchesReport(input.trial.targetMode, input.report);
  const forbiddenFilesTouched = input.report.filesModified.some((file) =>
    pathMatchesAny(file, input.handoffPackage.forbiddenFiles),
  );
  const outOfScopeFilesTouched = input.report.filesModified.some(
    (file) =>
      input.handoffPackage.allowedFiles.length > 0 &&
      !pathMatchesAny(file, input.handoffPackage.allowedFiles),
  );
  const dirtyOutsideScopeStaged = stagedFiles.some(
    (file) =>
      !previousDirty.has(file) ||
      pathMatchesAny(file, input.handoffPackage.forbiddenFiles) ||
      (input.handoffPackage.allowedFiles.length > 0 &&
        !pathMatchesAny(file, input.handoffPackage.allowedFiles)),
  );
  const typecheckReported = normalizedIncludes(
    input.report.commandsExecuted.map((command) => command.command),
    "tsc --noEmit",
  );
  const smokeReported =
    input.report.tests.length > 0 ||
    normalizedIncludes(input.report.commandsExecuted.map((command) => command.command), "smoke");
  const forbiddenGrepClean = isForbiddenGrepClean(input.report.forbiddenGrepResult);
  const commitPushAppropriate =
    input.trial.targetMode === "B"
      ? !input.report.commitHash && (input.report.pushStatus === undefined || input.report.pushStatus === "not_requested")
      : typeof input.report.commitHash === "string" && input.report.pushStatus === "pushed";
  const unsafeRuntimeClaimsAbsent = !unsafeClaimMarkers.some((marker) =>
    reportText(input.report).toLowerCase().includes(marker),
  );
  const dirtyOutsideScopeNotStaged =
    stagedFiles.length === 0 ||
    (!dirtyOutsideScopeStaged && currentDirty.every((file) => previousDirty.has(file) || input.report.filesModified.includes(file)));
  const scopeRespected = !forbiddenFilesTouched && !outOfScopeFilesTouched;
  const forbiddenFilesUntouched = !forbiddenFilesTouched;
  const blockers = uniqueStrings([
    ...(!input.handoffPackage.safeToCopy ? ["blocked:handoff_not_approved_for_copy"] : []),
    ...(input.handoffPackage.safeToExecute ? ["blocked:handoff_marked_action_ready"] : []),
    ...(!input.handoffPackage.requiresHumanApproval ? ["blocked:human_approval_missing"] : []),
    ...(!input.copyStep.copiedByHuman ? ["blocked:manual_copy_missing"] : []),
    ...(!input.copyStep.executionNotAutomated ? ["blocked:copy_step_not_manual"] : []),
    ...(!expectedPhaseMatches ? ["failed:phase_mismatch"] : []),
    ...(!expectedModeMatches ? ["failed:mode_mismatch"] : []),
    ...(!scopeRespected ? ["blocked:scope_violation"] : []),
    ...(!forbiddenFilesUntouched ? ["blocked:forbidden_file_touched"] : []),
    ...(!dirtyOutsideScopeNotStaged ? ["blocked:dirty_outside_scope_staged"] : []),
    ...(!typecheckReported ? ["warning:typecheck_not_reported"] : []),
    ...(!smokeReported ? ["warning:smoke_not_reported"] : []),
    ...(!forbiddenGrepClean ? ["failed:forbidden_grep_not_clean"] : []),
    ...(!commitPushAppropriate ? ["failed:commit_push_inappropriate"] : []),
    ...(!unsafeRuntimeClaimsAbsent ? ["blocked:unsafe_runtime_claim"] : []),
  ]);
  const validationStatus = statusFromBlockers(blockers);
  const alertLevel: AutopilotCoordinatorAlertLevel =
    validationStatus === "blocked" || validationStatus === "failed"
      ? "blocking_alert"
      : validationStatus === "needs_review"
        ? "mild_alert"
        : "no_alert";

  return {
    validationId: `${input.trial.trialId}:validation`,
    expectedPhaseMatches,
    expectedModeMatches,
    scopeRespected,
    forbiddenFilesUntouched,
    dirtyOutsideScopeNotStaged,
    typecheckReported,
    smokeReported,
    forbiddenGrepClean,
    commitPushAppropriate,
    unsafeRuntimeClaimsAbsent,
    validationStatus,
    alertLevel,
    recommendedAction: actionFromStatus(validationStatus, input.trial.targetMode),
    blockers,
    limitations: uniqueStrings([
      "metadata_report_only",
      "manual_copy_evidence_supplied_by_human_or_fixture",
      "no_live_session_monitoring",
      ...input.trial.limitations,
    ]),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
  };
};

export const evaluateManualCodexTrialOutcome = (input: {
  trial: ManualCodexHandoffTrialInput;
  copyStep: ManualCodexCopyStep;
  report?: CodexReportContract;
  validation: ManualCodexTrialValidation;
  closeoutStatus?: AutopilotCloseoutStatus;
}): ManualCodexTrialOutcome => {
  const handoffApprovedForCopy = input.copyStep.approvedForCopy;
  const promptCopiedManually = input.copyStep.copiedByHuman && input.copyStep.executionNotAutomated;
  const codexReportReceived = input.report !== undefined;
  const nextActionProduced = input.validation.recommendedAction.length > 0;
  const closeoutStatusProduced = input.closeoutStatus !== undefined;
  const safeToContinue =
    input.validation.validationStatus === "passed" &&
    handoffApprovedForCopy &&
    promptCopiedManually &&
    codexReportReceived &&
    nextActionProduced &&
    closeoutStatusProduced;
  const trialStatus: ManualCodexTrialStatus = safeToContinue
    ? "completed"
    : input.validation.validationStatus === "blocked" || input.validation.validationStatus === "failed"
      ? "blocked"
      : "needs_review";

  return {
    outcomeId: `${input.trial.trialId}:outcome`,
    trialStatus,
    handoffApprovedForCopy,
    promptCopiedManually,
    codexReportReceived,
    validationStatus: input.validation.validationStatus,
    nextActionProduced,
    closeoutStatusProduced,
    safeToContinue,
    recommendedNextPhase: safeToContinue
      ? "PILOT-6B - Semi-Automated Handoff Safety Plan"
      : "PILOT-5I - Manual Codex Handoff Trial Implementation",
    limitations: uniqueStrings(input.trial.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
  };
};

export const summarizeManualCodexHandoffTrial = (input: {
  trial: ManualCodexHandoffTrialInput;
  validation: ManualCodexTrialValidation;
  outcome: ManualCodexTrialOutcome;
}): ManualCodexTrialSummary => ({
  summaryId: `${input.trial.trialId}:summary`,
  trialId: input.trial.trialId,
  trialStatus: input.outcome.trialStatus,
  targetPhase: input.trial.targetPhase,
  targetMode: input.trial.targetMode,
  validationStatus: input.validation.validationStatus,
  alertLevel: input.validation.alertLevel,
  blockerCount: input.validation.blockers.length,
  safeToContinue: input.outcome.safeToContinue,
  recommendedNextPhase: input.outcome.recommendedNextPhase,
  safeSummary: input.outcome.safeToContinue
    ? "Manual handoff trial metadata passed with human-mediated copy and review evidence."
    : "Manual handoff trial metadata requires review or retry before continuing.",
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecution: true,
});

export const createManualCodexHandoffTrial = (input: {
  trial: ManualCodexHandoffTrialInput;
  copyStep: ManualCodexCopyStep;
  expectedReport: ManualCodexExpectedReport;
  returnedReport: CodexReportContract;
  handoffPackage: Pick<
    HumanApprovedCodexHandoffPackage,
    "safeToCopy" | "safeToExecute" | "requiresHumanApproval" | "allowedFiles" | "forbiddenFiles"
  >;
  closeoutStatus?: AutopilotCloseoutStatus;
  currentDirtyFiles?: readonly string[];
  previousDirtyFiles?: readonly string[];
  stagedFiles?: readonly string[];
}): ManualCodexHandoffTrial => {
  const validationInput: Parameters<typeof validateManualCodexTrialReport>[0] = {
    trial: input.trial,
    copyStep: input.copyStep,
    handoffPackage: input.handoffPackage,
    report: input.returnedReport,
    expectedReport: input.expectedReport,
  };

  if (input.currentDirtyFiles !== undefined) {
    validationInput.currentDirtyFiles = input.currentDirtyFiles;
  }

  if (input.previousDirtyFiles !== undefined) {
    validationInput.previousDirtyFiles = input.previousDirtyFiles;
  }

  if (input.stagedFiles !== undefined) {
    validationInput.stagedFiles = input.stagedFiles;
  }

  const validation = validateManualCodexTrialReport(validationInput);
  const closeoutStatus: AutopilotCloseoutStatus =
    input.closeoutStatus ??
    (validation.validationStatus === "passed" ? "completed_local_only" : "needs_human_review");
  const outcome = evaluateManualCodexTrialOutcome({
    trial: input.trial,
    copyStep: input.copyStep,
    report: input.returnedReport,
    validation,
    closeoutStatus,
  });
  const summary = summarizeManualCodexHandoffTrial({
    trial: input.trial,
    validation,
    outcome,
  });

  return {
    input: input.trial,
    copyStep: input.copyStep,
    expectedReport: input.expectedReport,
    returnedReport: input.returnedReport,
    validation,
    outcome,
    summary,
    closeoutStatus,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noCodexInvocation: true,
    noProviderCalls: true,
    noFilesystemWrites: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
  };
};

export const createManualCodexHandoffTrialInput = (
  input: Partial<ManualCodexHandoffTrialInput> = {},
): ManualCodexHandoffTrialInput => ({
  trialId: input.trialId ?? "manual_codex_handoff_trial:sample_mobile_idea_blueprint",
  sourceDryRunRef: input.sourceDryRunRef ?? "conversational_build_loop:habit_world_v1",
  handoffRef: input.handoffRef ?? "human_approved_codex_handoff:habit_world_v1",
  targetPhase: input.targetPhase ?? "TRIAL-1B - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN PLAN",
  targetMode: input.targetMode ?? "B",
  manualCopyRequired: input.manualCopyRequired ?? true,
  codexExecutionManual: input.codexExecutionManual ?? true,
  expectedCodexReportShape: uniqueStrings(input.expectedCodexReportShape ?? expectedReportShape),
  expectedValidationStatus: input.expectedValidationStatus ?? "passed",
  expectedNextAction: input.expectedNextAction ?? "continue_to_I_phase",
  riskLevel: input.riskLevel ?? "plan_only",
  requiredApprovals: uniqueStrings(
    input.requiredApprovals ?? [
      "human_operator_manual_copy_approval",
      "pm_scope_approval",
      "safety_review",
      "closeout_review",
    ],
  ),
  limitations: uniqueStrings(
    input.limitations ?? [
      "manual_copy_only",
      "metadata_validation_only",
      "no_live_session_monitoring",
      "no_source_driven_external_action",
    ],
  ),
});
