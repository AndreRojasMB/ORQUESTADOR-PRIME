import {
  autopilotDryRunRequiredPromptSections,
  autopilotDryRunScenarioMatrix,
  type AutopilotDryRunScenario,
} from "./dryRunScenarioMatrix.js";
import {
  runAutopilotRealDryRun,
  type AutopilotRealDryRunResult,
} from "./realDryRunPilot.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type { AutopilotBoundarySet, AutopilotRiskLevel } from "./types.js";

export type AutopilotDryRunQualityGateStatus =
  | "passed"
  | "warning"
  | "failed"
  | "blocked";

export interface AutopilotDryRunQualityGateResult {
  gateId: string;
  status: AutopilotDryRunQualityGateStatus;
  message: string;
  evidenceRefs: string[];
  riskLevel: AutopilotRiskLevel;
  requiresHumanReview: boolean;
  recommendedAction: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noCodexInvocation: true;
  noProviderCalls: true;
  noDashboardMutation: true;
  noGitMutationFromSource: true;
  noMemoryPersistence: true;
  boundaries: AutopilotBoundarySet;
}

export interface AutopilotDryRunQualityGateInput {
  scenario: AutopilotDryRunScenario;
  result: AutopilotRealDryRunResult;
  humanFacingResponseSkeleton?: string;
}

export interface AutopilotDryRunScenarioEvaluation {
  scenarioId: string;
  title: string;
  result: AutopilotRealDryRunResult;
  gates: AutopilotDryRunQualityGateResult[];
  overallStatus: AutopilotDryRunQualityGateStatus;
  recommendedNextStep: string;
  safeToReturnToPhase121I: boolean;
  metadataOnly: true;
  noExecution: true;
}

export interface AutopilotDryRunHardeningSummary {
  summaryId: string;
  scenarioResults: AutopilotDryRunScenarioEvaluation[];
  passedCount: number;
  warningCount: number;
  failedCount: number;
  blockedCount: number;
  recommendedNextStep: string;
  safeToReturnToPhase121I: boolean;
  metadataOnly: true;
  noExecution: true;
}

const gate = (input: {
  gateId: string;
  status: AutopilotDryRunQualityGateStatus;
  message: string;
  evidenceRefs?: string[];
  riskLevel?: AutopilotRiskLevel;
  requiresHumanReview?: boolean;
  recommendedAction?: string;
}): AutopilotDryRunQualityGateResult => ({
  gateId: input.gateId,
  status: input.status,
  message: input.message,
  evidenceRefs: input.evidenceRefs ? [...input.evidenceRefs] : [],
  riskLevel: input.riskLevel ?? "report_only",
  requiresHumanReview:
    input.requiresHumanReview ??
    (input.status === "warning" ||
      input.status === "failed" ||
      input.status === "blocked"),
  recommendedAction:
    input.recommendedAction ??
    (input.status === "passed"
      ? "Continue evaluating metadata."
      : "Request human review before continuing."),
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecution: true,
  noCodexInvocation: true,
  noProviderCalls: true,
  noDashboardMutation: true,
  noGitMutationFromSource: true,
  noMemoryPersistence: true,
  boundaries: autopilotSourceOnlyBoundaries,
});

const missingSections = (skeleton: string): string[] =>
  autopilotDryRunRequiredPromptSections.filter(
    (section) => !skeleton.includes(section),
  );

export function evaluatePromptCompletenessGate(
  input: AutopilotDryRunQualityGateInput,
): AutopilotDryRunQualityGateResult {
  const skeleton =
    input.humanFacingResponseSkeleton ??
    input.result.humanFacingResponseSkeleton;
  const missing = missingSections(skeleton);
  const promptAvailable =
    input.result.nextCodexPromptDraft.promptMarkdown.length > 0 &&
    input.result.nextCodexPromptDraft.metadataOnly &&
    input.result.nextCodexPromptDraft.noCodexInvocation;

  if (!promptAvailable || missing.length > 0) {
    return gate({
      gateId: `${input.scenario.scenarioId}:prompt_completeness`,
      status: "blocked",
      message: "Prompt metadata is incomplete or missing required human-facing sections.",
      evidenceRefs: missing,
      recommendedAction: "Block handoff and request human review.",
    });
  }

  return gate({
    gateId: `${input.scenario.scenarioId}:prompt_completeness`,
    status: "passed",
    message: "Prompt metadata includes all required human-facing sections.",
    evidenceRefs: [...autopilotDryRunRequiredPromptSections],
  });
}

export function evaluateReportCompletenessGate(
  input: AutopilotDryRunQualityGateInput,
): AutopilotDryRunQualityGateResult {
  const report = input.result.validation;
  const sourceReport = input.scenario.simulatedInput.report;
  const complete =
    sourceReport.reportId.length > 0 &&
    sourceReport.phase.length > 0 &&
    sourceReport.filesInspected.length > 0 &&
    sourceReport.filesModified.length > 0 &&
    sourceReport.commandsExecuted.length > 0 &&
    sourceReport.scopeCheck.length > 0 &&
    sourceReport.forbiddenGrepResult.length > 0 &&
    sourceReport.nextRecommendedPhase.length > 0 &&
    sourceReport.advisoryOnly &&
    sourceReport.sourceOnly &&
    sourceReport.metadataOnly;

  return gate({
    gateId: `${input.scenario.scenarioId}:report_completeness`,
    status: complete ? "passed" : "failed",
    message: complete
      ? "Report metadata contains the required fields."
      : "Report metadata is incomplete.",
    evidenceRefs: [report.validationId],
    recommendedAction: complete
      ? "Continue evaluating metadata."
      : "Request report completion before continuing.",
  });
}

export function evaluateValidationConsistencyGate(
  input: AutopilotDryRunQualityGateInput,
): AutopilotDryRunQualityGateResult {
  const statusMatches =
    input.result.validation.status === input.scenario.expectedValidationStatus;
  const hardFailureConsistent =
    input.result.validation.findings.some((finding) => finding.severity === "fail")
      ? input.result.validation.status === "failed" ||
        input.result.validation.status === "blocked"
      : true;

  return gate({
    gateId: `${input.scenario.scenarioId}:validation_consistency`,
    status: statusMatches && hardFailureConsistent ? "passed" : "failed",
    message:
      statusMatches && hardFailureConsistent
        ? "Validation metadata matches expected scenario status."
        : "Validation metadata does not match expected scenario status.",
    evidenceRefs: [input.result.validation.validationId],
  });
}

export function evaluateMemoryProposalSafetyGate(
  input: AutopilotDryRunQualityGateInput,
): AutopilotDryRunQualityGateResult {
  const proposal = input.result.memoryProposal;
  const safe =
    proposal.status === input.scenario.expectedMemoryProposalStatus &&
    proposal.status === "proposed" &&
    proposal.requiresHumanApproval &&
    proposal.noMemoryPersistence &&
    proposal.noStoreMutation;

  return gate({
    gateId: `${input.scenario.scenarioId}:memory_proposal_safety`,
    status: safe ? "passed" : "blocked",
    message: safe
      ? "Memory output remains proposal-only and review-gated."
      : "Memory output is unsafe or missing review requirements.",
    evidenceRefs: [proposal.proposalId],
    recommendedAction: safe
      ? "Keep memory as proposal metadata."
      : "Block memory use and request human review.",
  });
}

export function evaluateNextActionConsistencyGate(
  input: AutopilotDryRunQualityGateInput,
): AutopilotDryRunQualityGateResult {
  const next = input.result.nextActionRecommendation;
  const safe =
    next.nextAction === input.scenario.expectedNextAction &&
    next.nextPhase === input.scenario.expectedNextPhase &&
    next.handoffAllowed === input.scenario.expectedHandoffAllowed &&
    next.requiredApproval === input.scenario.expectedHumanReviewRequired &&
    next.noCodexInvocation &&
    !next.memoryWriteAllowed;

  return gate({
    gateId: `${input.scenario.scenarioId}:next_action_consistency`,
    status: safe ? "passed" : "failed",
    message: safe
      ? "Next-action metadata matches expected scenario output."
      : "Next-action metadata diverges from expected scenario output.",
    evidenceRefs: [next.coordinationId],
  });
}

export function evaluateCloseoutConsistencyGate(
  input: AutopilotDryRunQualityGateInput,
): AutopilotDryRunQualityGateResult {
  const closeout = input.result.closeoutResult;
  const safe =
    closeout.closeoutStatus === input.scenario.expectedCloseoutStatus &&
    closeout.noCodexInvocation &&
    closeout.noGitMutationFromSource &&
    closeout.noMemoryPersistence;

  return gate({
    gateId: `${input.scenario.scenarioId}:closeout_consistency`,
    status: safe ? "passed" : "failed",
    message: safe
      ? "Closeout metadata matches expected scenario output."
      : "Closeout metadata diverges from expected scenario output.",
    evidenceRefs: [closeout.closeoutId],
  });
}

export function evaluateScopeSafetyGate(
  input: AutopilotDryRunQualityGateInput,
): AutopilotDryRunQualityGateResult {
  const hasBlockingScope = input.result.validation.scopeViolations.some(
    (finding) => finding.severity === "fail",
  );
  const staged = input.scenario.simulatedInput.workspace.stagedFiles.length > 0;
  const shouldBlock = staged || hasBlockingScope;
  const blockedAsExpected =
    !shouldBlock ||
    input.result.validation.status === "blocked" ||
    input.result.closeoutStatus === "unsafe_scope" ||
    input.result.closeoutStatus === "blocked";

  return gate({
    gateId: `${input.scenario.scenarioId}:scope_safety`,
    status: blockedAsExpected ? (shouldBlock ? "blocked" : "passed") : "failed",
    message: blockedAsExpected
      ? "Scope metadata is handled according to the scenario risk."
      : "Scope metadata was not handled conservatively.",
    evidenceRefs: input.result.validation.scopeViolations.map(
      (finding) => finding.findingId,
    ),
    recommendedAction: shouldBlock
      ? "Keep scenario blocked until human review."
      : "Continue evaluating metadata.",
  });
}

export function evaluateForbiddenActionGate(
  input: AutopilotDryRunQualityGateInput,
): AutopilotDryRunQualityGateResult {
  const safe =
    input.result.noExecution &&
    input.result.noCodexInvocation &&
    input.result.noProcessLaunch &&
    input.result.noProviderCalls &&
    input.result.noNetwork &&
    input.result.noDashboardMutation &&
    input.result.noGitMutationFromSource &&
    input.result.noMemoryPersistence &&
    input.result.boundaries.noOpenClawExecution &&
    input.result.boundaries.noWhatsAppOutbound &&
    input.result.boundaries.noN8nExecution &&
    input.result.boundaries.noDbSqlMutation &&
    input.result.boundaries.noPackageWorkflowChanges;

  return gate({
    gateId: `${input.scenario.scenarioId}:forbidden_action`,
    status: safe ? "passed" : "blocked",
    message: safe
      ? "No forbidden external action is represented as completed."
      : "Forbidden action metadata was detected.",
    evidenceRefs: [input.result.dryRunId],
    recommendedAction: safe
      ? "Continue evaluating metadata."
      : "Block scenario and request human review.",
  });
}

const scenarioOverallStatus = (
  gates: readonly AutopilotDryRunQualityGateResult[],
): AutopilotDryRunQualityGateStatus => {
  if (gates.some((item) => item.status === "blocked")) {
    return "blocked";
  }

  if (gates.some((item) => item.status === "failed")) {
    return "failed";
  }

  if (gates.some((item) => item.status === "warning")) {
    return "warning";
  }

  return "passed";
};

export function evaluateDryRunQualityGates(
  scenario: AutopilotDryRunScenario,
): AutopilotDryRunScenarioEvaluation {
  const result = runAutopilotRealDryRun(scenario.simulatedInput);
  const gateInput: AutopilotDryRunQualityGateInput =
    scenario.simulatedHumanFacingResponseSkeleton !== undefined
      ? {
          scenario,
          result,
          humanFacingResponseSkeleton: scenario.simulatedHumanFacingResponseSkeleton,
        }
      : { scenario, result };
  const gates = [
    evaluatePromptCompletenessGate(gateInput),
    evaluateReportCompletenessGate(gateInput),
    evaluateValidationConsistencyGate(gateInput),
    evaluateMemoryProposalSafetyGate(gateInput),
    evaluateNextActionConsistencyGate(gateInput),
    evaluateCloseoutConsistencyGate(gateInput),
    evaluateScopeSafetyGate(gateInput),
    evaluateForbiddenActionGate(gateInput),
  ];
  const overallStatus = scenarioOverallStatus(gates);

  return {
    scenarioId: scenario.scenarioId,
    title: scenario.title,
    result,
    gates,
    overallStatus,
    recommendedNextStep:
      overallStatus === "passed" || overallStatus === "warning"
        ? "Scenario is safe for advisory continuation."
        : "Scenario should remain blocked or reviewed before continuation.",
    safeToReturnToPhase121I: overallStatus !== "failed",
    metadataOnly: true,
    noExecution: true,
  };
}

export function summarizeAutopilotDryRunHardening(
  scenarios: readonly AutopilotDryRunScenario[] = autopilotDryRunScenarioMatrix,
): AutopilotDryRunHardeningSummary {
  const scenarioResults = scenarios.map(evaluateDryRunQualityGates);
  const passedCount = scenarioResults.filter(
    (item) => item.overallStatus === "passed",
  ).length;
  const warningCount = scenarioResults.filter(
    (item) => item.overallStatus === "warning",
  ).length;
  const failedCount = scenarioResults.filter(
    (item) => item.overallStatus === "failed",
  ).length;
  const blockedCount = scenarioResults.filter(
    (item) => item.overallStatus === "blocked",
  ).length;
  const safeToReturnToPhase121I = failedCount === 0;

  return {
    summaryId: "autopilot-dry-run-hardening:summary",
    scenarioResults,
    passedCount,
    warningCount,
    failedCount,
    blockedCount,
    recommendedNextStep: safeToReturnToPhase121I
      ? "Return to Phase 121I after human review of expected blocked scenarios."
      : "Plan Phase PILOT-3B to resolve hardening failures.",
    safeToReturnToPhase121I,
    metadataOnly: true,
    noExecution: true,
  };
}
