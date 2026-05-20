export type ControlledAutomationOptionId =
  | "manual_dashboard_only"
  | "dashboard_interaction_hardening"
  | "controlled_openclaw_paste_future"
  | "controlled_report_return_future"
  | "defer_until_real_test";

export type ControlledAutomationImplementationCost =
  | "low"
  | "medium"
  | "high";

export type ControlledAutomationSafetyLevel =
  | "highest"
  | "high"
  | "medium"
  | "low"
  | "blocked";

export type ControlledAutomationSignal =
  | "strong"
  | "acceptable"
  | "weak"
  | "high";

export type ControlledAutomationRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type ControlledAutomationDecisionStatus =
  | "manual_dashboard_only"
  | "dashboard_interaction_hardening"
  | "controlled_openclaw_paste_future"
  | "controlled_report_return_future"
  | "defer_until_real_test"
  | "blocked";

export interface ControlledAutomationOption {
  optionId: ControlledAutomationOptionId;
  optionName: string;
  description: string;
  benefit: string;
  risk: string;
  requiredReadiness: readonly string[];
  requiredApproval: readonly string[];
  implementationCost: ControlledAutomationImplementationCost;
  safetyLevel: ControlledAutomationSafetyLevel;
  recommendation: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface ControlledAutomationReadinessCriteria {
  dashboardClarity: ControlledAutomationSignal;
  userFrictionLevel: ControlledAutomationSignal;
  copyPastePainLevel: ControlledAutomationSignal;
  approvalAuditReadiness: ControlledAutomationSignal;
  abortRollbackReadiness: ControlledAutomationSignal;
  reportValidationReliability: ControlledAutomationSignal;
  dirtyFileSafety: ControlledAutomationSignal;
  operatorConfidence: ControlledAutomationSignal;
  safetyRisk: ControlledAutomationRiskLevel;
  evidenceRefs: readonly string[];
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface ControlledAutomationDecisionInput {
  decisionId: string;
  sourceDashboardRef: string;
  sourceLoopUxRef: string;
  sourceApprovalAuditRef: string;
  sourceOpenClawBridgeRef: string;
  sourceReportReturnRef: string;
  realMiniTestCompleted: boolean;
  realMiniTestEvidenceRefs: readonly string[];
  readinessCriteria: ControlledAutomationReadinessCriteria;
  riskLevel: ControlledAutomationRiskLevel;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  options: readonly ControlledAutomationOption[];
}

export interface ControlledAutomationDecisionOutcome {
  outcomeId: string;
  selectedOption: ControlledAutomationOptionId;
  rejectedOptions: readonly ControlledAutomationOptionId[];
  decisionReason: string;
  safeToAutomate: boolean;
  requiresMiniTestFirst: boolean;
  recommendedNextPhase: string;
  requiredApprovals: readonly string[];
  blockers: readonly string[];
  warnings: readonly string[];
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noCodexInvocation: true;
  noOpenClawInvocation: true;
  noSystemCopyBuffer: true;
  noPromptTransferAutomation: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemWrites: true;
  noDashboardMutation: true;
  noDbSqlMutation: true;
  noPackageWorkflowChanges: true;
  noMemoryPersistence: true;
}

export interface ControlledAutomationRecommendation {
  recommendationId: string;
  selectedOption: ControlledAutomationOptionId;
  decisionStatus: ControlledAutomationDecisionStatus;
  recommendedNextPhase: string;
  rationale: string;
  safeToContinue: boolean;
  safeToAutomate: boolean;
  requiresHumanApproval: boolean;
  evidenceRefs: readonly string[];
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface ControlledAutomationSummary {
  summaryId: string;
  decisionId: string;
  selectedOption: ControlledAutomationOptionId;
  rejectedOptionCount: number;
  blockerCount: number;
  warningCount: number;
  realMiniTestCompleted: boolean;
  safeToAutomate: boolean;
  recommendedNextPhase: string;
  safeSummary: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface ControlledAutomationDecision {
  input: ControlledAutomationDecisionInput;
  outcome: ControlledAutomationDecisionOutcome;
  recommendation: ControlledAutomationRecommendation;
  summary: ControlledAutomationSummary;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noCodexInvocation: true;
  noOpenClawInvocation: true;
  noSystemCopyBuffer: true;
  noPromptTransferAutomation: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemWrites: true;
  noDashboardMutation: true;
  noDbSqlMutation: true;
  noPackageWorkflowChanges: true;
  noMemoryPersistence: true;
}

const REQUIRED_OPTIONS: readonly ControlledAutomationOptionId[] = [
  "manual_dashboard_only",
  "dashboard_interaction_hardening",
  "controlled_openclaw_paste_future",
  "controlled_report_return_future",
  "defer_until_real_test",
];

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const uniqueOptions = (
  values: readonly ControlledAutomationOptionId[],
): ControlledAutomationOptionId[] => Array.from(new Set(values));

const createReadiness = (
  input: Omit<
    ControlledAutomationReadinessCriteria,
    "advisoryOnly" | "sourceOnly" | "metadataOnly"
  >,
): ControlledAutomationReadinessCriteria => ({
  ...input,
  evidenceRefs: uniqueStrings(input.evidenceRefs),
  limitations: uniqueStrings(input.limitations),
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
});

function hasAllRequiredOptions(options: readonly ControlledAutomationOption[]): boolean {
  const ids = new Set(options.map((option) => option.optionId));
  return REQUIRED_OPTIONS.every((optionId) => ids.has(optionId));
}

function isStrong(value: ControlledAutomationSignal): boolean {
  return value === "strong";
}

function isWeak(value: ControlledAutomationSignal): boolean {
  return value === "weak";
}

function isHigh(value: ControlledAutomationSignal): boolean {
  return value === "high";
}

function isHighSafetyRisk(value: ControlledAutomationRiskLevel): boolean {
  return value === "high" || value === "critical";
}

function getDecisionStatus(
  selectedOption: ControlledAutomationOptionId,
  blockers: readonly string[],
): ControlledAutomationDecisionStatus {
  if (blockers.length > 0 && selectedOption === "manual_dashboard_only") {
    return "blocked";
  }
  return selectedOption;
}

export function createControlledAutomationOption(
  input: ControlledAutomationOption,
): ControlledAutomationOption {
  return {
    ...input,
    requiredReadiness: uniqueStrings(input.requiredReadiness),
    requiredApproval: uniqueStrings(input.requiredApproval),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createControlledAutomationDecisionInput(
  input: Omit<ControlledAutomationDecisionInput, "readinessCriteria" | "options"> & {
    readinessCriteria: Omit<
      ControlledAutomationReadinessCriteria,
      "advisoryOnly" | "sourceOnly" | "metadataOnly"
    >;
    options: readonly ControlledAutomationOption[];
  },
): ControlledAutomationDecisionInput {
  const options = input.options.map(createControlledAutomationOption);
  return {
    ...input,
    realMiniTestEvidenceRefs: uniqueStrings(input.realMiniTestEvidenceRefs),
    readinessCriteria: createReadiness(input.readinessCriteria),
    requiredApprovals: uniqueStrings(input.requiredApprovals),
    limitations: uniqueStrings([
      ...input.limitations,
      hasAllRequiredOptions(options) ? "" : "One or more decision options are missing.",
    ]),
    options,
  };
}

export function selectRejectedAutomationOptions(
  options: readonly ControlledAutomationOption[],
  selectedOption: ControlledAutomationOptionId,
): ControlledAutomationOptionId[] {
  return uniqueOptions(
    options
      .map((option) => option.optionId)
      .filter((optionId) => optionId !== selectedOption),
  );
}

export function evaluateControlledAutomationDecision(
  input: ControlledAutomationDecisionInput,
): ControlledAutomationDecisionOutcome {
  const readiness = input.readinessCriteria;
  const blockers: string[] = [];
  const warnings: string[] = [];

  let selectedOption: ControlledAutomationOptionId = "manual_dashboard_only";
  let decisionReason = "Manual dashboard remains the safest baseline.";
  let recommendedNextPhase = "Phase 147B - REAL MINI TEST EXECUTION PLAN";
  let requiresMiniTestFirst = false;

  if (!hasAllRequiredOptions(input.options)) {
    warnings.push("Decision option set is incomplete.");
  }

  if (isHighSafetyRisk(readiness.safetyRisk) || isHighSafetyRisk(input.riskLevel)) {
    selectedOption = "manual_dashboard_only";
    decisionReason = "Safety risk is high, so the loop should stay manual.";
    recommendedNextPhase = "Phase 147B - REAL MINI TEST EXECUTION PLAN";
    blockers.push("Safety risk blocks assisted paths.");
  } else if (!input.realMiniTestCompleted) {
    selectedOption = "defer_until_real_test";
    decisionReason = "A real mini test is required before choosing assisted behavior.";
    recommendedNextPhase = "Phase 147B - REAL MINI TEST EXECUTION PLAN";
    requiresMiniTestFirst = true;
  } else if (isWeak(readiness.dashboardClarity)) {
    selectedOption = "dashboard_interaction_hardening";
    decisionReason = "Dashboard clarity is weak, so operator UX should be hardened first.";
    recommendedNextPhase = "Phase 147B - LOOP DASHBOARD INTERACTION HARDENING PLAN";
    warnings.push("Dashboard clarity needs hardening before assisted behavior.");
  } else if (isWeak(readiness.reportValidationReliability)) {
    selectedOption = "controlled_report_return_future";
    decisionReason = "Report validation is weak, so report return should be hardened first.";
    recommendedNextPhase = "Phase 147B - CONTROLLED REPORT RETURN HARDENING PLAN";
    warnings.push("Report validation reliability is weak.");
  } else if (
    isHigh(readiness.copyPastePainLevel) &&
    isStrong(readiness.approvalAuditReadiness) &&
    isStrong(readiness.abortRollbackReadiness)
  ) {
    selectedOption = "controlled_openclaw_paste_future";
    decisionReason = "Manual transfer pain is high and core safety readiness is strong.";
    recommendedNextPhase = "Phase 147B - CONTROLLED OPENCLAW TRIAL PLAN";
    warnings.push("OpenClaw path remains future-gated and requires separate approval.");
  } else if (
    isStrong(readiness.dashboardClarity) &&
    (readiness.copyPastePainLevel === "strong" || readiness.copyPastePainLevel === "acceptable")
  ) {
    selectedOption = "manual_dashboard_only";
    decisionReason = "Dashboard clarity is good and manual transfer pain is tolerable.";
    recommendedNextPhase = "Phase 147B - REAL MINI TEST EXECUTION PLAN";
  } else {
    selectedOption = "defer_until_real_test";
    decisionReason = "Evidence is not strong enough to select an assisted path.";
    recommendedNextPhase = "Phase 147B - REAL MINI TEST EXECUTION PLAN";
    requiresMiniTestFirst = !input.realMiniTestCompleted;
    warnings.push("Decision evidence is inconclusive.");
  }

  const safeToAutomate =
    input.realMiniTestCompleted &&
    selectedOption === "controlled_openclaw_paste_future" &&
    isStrong(readiness.approvalAuditReadiness) &&
    isStrong(readiness.abortRollbackReadiness) &&
    isStrong(readiness.reportValidationReliability) &&
    isStrong(readiness.dirtyFileSafety) &&
    isStrong(readiness.operatorConfidence) &&
    !isHighSafetyRisk(readiness.safetyRisk) &&
    blockers.length === 0;

  return {
    outcomeId: `${input.decisionId}:outcome`,
    selectedOption,
    rejectedOptions: selectRejectedAutomationOptions(input.options, selectedOption),
    decisionReason,
    safeToAutomate,
    requiresMiniTestFirst,
    recommendedNextPhase,
    requiredApprovals: uniqueStrings(input.requiredApprovals),
    blockers: uniqueStrings(blockers),
    warnings: uniqueStrings(warnings),
    limitations: uniqueStrings([
      ...input.limitations,
      "Decision is advisory metadata only.",
      selectedOption === "controlled_openclaw_paste_future"
        ? "OpenClaw path remains future-gated and unavailable in this phase."
        : "",
    ]),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noCodexInvocation: true,
    noOpenClawInvocation: true,
    noSystemCopyBuffer: true,
    noPromptTransferAutomation: true,
    noProviderCalls: true,
    noNetwork: true,
    noFilesystemWrites: true,
    noDashboardMutation: true,
    noDbSqlMutation: true,
    noPackageWorkflowChanges: true,
    noMemoryPersistence: true,
  };
}

export function summarizeControlledAutomationDecision(
  input: ControlledAutomationDecisionInput,
  outcome: ControlledAutomationDecisionOutcome,
): ControlledAutomationSummary {
  return {
    summaryId: `${input.decisionId}:summary`,
    decisionId: input.decisionId,
    selectedOption: outcome.selectedOption,
    rejectedOptionCount: outcome.rejectedOptions.length,
    blockerCount: outcome.blockers.length,
    warningCount: outcome.warnings.length,
    realMiniTestCompleted: input.realMiniTestCompleted,
    safeToAutomate: outcome.safeToAutomate,
    recommendedNextPhase: outcome.recommendedNextPhase,
    safeSummary: outcome.safeToAutomate
      ? "Future assisted path can be planned, but still requires a separate approved phase."
      : "Automation remains unavailable; continue with manual/dashboard decision flow.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createControlledAutomationDecision(
  input: ControlledAutomationDecisionInput,
): ControlledAutomationDecision {
  const outcome = evaluateControlledAutomationDecision(input);
  const decisionStatus = getDecisionStatus(outcome.selectedOption, outcome.blockers);
  const recommendation: ControlledAutomationRecommendation = {
    recommendationId: `${input.decisionId}:recommendation`,
    selectedOption: outcome.selectedOption,
    decisionStatus,
    recommendedNextPhase: outcome.recommendedNextPhase,
    rationale: outcome.decisionReason,
    safeToContinue: outcome.blockers.length === 0,
    safeToAutomate: outcome.safeToAutomate,
    requiresHumanApproval: true,
    evidenceRefs: uniqueStrings([
      ...input.realMiniTestEvidenceRefs,
      ...input.readinessCriteria.evidenceRefs,
    ]),
    limitations: uniqueStrings(outcome.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };

  return {
    input,
    outcome,
    recommendation,
    summary: summarizeControlledAutomationDecision(input, outcome),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noCodexInvocation: true,
    noOpenClawInvocation: true,
    noSystemCopyBuffer: true,
    noPromptTransferAutomation: true,
    noProviderCalls: true,
    noNetwork: true,
    noFilesystemWrites: true,
    noDashboardMutation: true,
    noDbSqlMutation: true,
    noPackageWorkflowChanges: true,
    noMemoryPersistence: true,
  };
}

export function selectAutomationOptionsBySafetyLevel(
  options: readonly ControlledAutomationOption[],
  safetyLevel: ControlledAutomationSafetyLevel,
): ControlledAutomationOption[] {
  return options.filter((option) => option.safetyLevel === safetyLevel);
}
