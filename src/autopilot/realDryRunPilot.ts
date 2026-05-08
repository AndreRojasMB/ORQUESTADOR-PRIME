import {
  autopilotRealDryRunCommitPushFixture,
  autopilotRealDryRunExpectedNextPhase,
  autopilotRealDryRunHandoff,
  autopilotRealDryRunLimitations,
  autopilotRealDryRunReport,
  autopilotRealDryRunRiskApprovalFixture,
  autopilotRealDryRunRoadmapReturnTarget,
  autopilotRealDryRunTask,
  autopilotRealDryRunWorkspaceFixture,
  type AutopilotRealDryRunCommitPushFixture,
  type AutopilotRealDryRunRiskApprovalFixture,
  type AutopilotRealDryRunWorkspaceFixture,
} from "./realDryRunFixtures.js";
import { prepareCodexHandoffPackage, type CodexHandoffPackage } from "./codexHandoffRunner.js";
import { createMemoryUpdateProposalFromReport } from "./memoryProposalBuilder.js";
import {
  deriveErrorLearningRules,
  type AutopilotErrorLearningRulesResult,
} from "./errorLearningRules.js";
import {
  validateCodexReportAgainstHandoff,
  type AutopilotReportValidationResult,
} from "./reportValidator.js";
import {
  summarizeAutopilotValidation,
  type AutopilotValidationSummary,
} from "./autopilotValidationSummary.js";
import {
  coordinateNextAutopilotAction,
} from "./nextActionCoordinator.js";
import type { AutopilotCoordinatorResult } from "./nextActionDecisionModel.js";
import {
  coordinatePhaseCloseout,
} from "./phaseCloseoutCoordinator.js";
import type {
  AutopilotCloseoutCheckResult,
  AutopilotCloseoutResult,
  AutopilotCloseoutStatus,
} from "./phaseCloseoutDecisionModel.js";
import type { CodexHandoffContract } from "./codexHandoff.js";
import type { AutopilotMemoryUpdateProposalFromReport } from "./memoryProposalBuilder.js";
import type { CodexReportContract } from "./reportContract.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type {
  AutopilotBoundarySet,
  AutopilotMode,
  AutopilotTaskMetadata,
} from "./types.js";

export type AutopilotRealDryRunSuccessStatus = "passed" | "failed";

export interface AutopilotDryRunPromptDraft {
  draftId: string;
  phase: string;
  nextPhase: string;
  promptMarkdown: string;
  sourcePackageRef: string;
  metadataOnly: true;
  noCodexInvocation: true;
  noExecution: true;
  requiresHumanReview: true;
  boundaries: AutopilotBoundarySet;
}

export interface AutopilotRealDryRunInput {
  dryRunId: string;
  task: AutopilotTaskMetadata;
  handoff: CodexHandoffContract;
  report: CodexReportContract;
  phaseMode: AutopilotMode;
  expectedNextPhase: string;
  matchingImplementationPhase: string;
  roadmapTarget: string;
  workspace: AutopilotRealDryRunWorkspaceFixture;
  commitPush: AutopilotRealDryRunCommitPushFixture;
  riskApproval: AutopilotRealDryRunRiskApprovalFixture;
  closeoutChecks?: AutopilotRealDryRunCloseoutChecksFixture;
  limitations: string[];
  recommendedModel?: string;
  metadataOnly: true;
  sourceOnly: true;
  advisoryOnly: true;
  noExecution: true;
  boundaries: AutopilotBoundarySet;
}

export interface AutopilotRealDryRunCloseoutChecksFixture {
  testsResult?: AutopilotCloseoutCheckResult;
  smokeResult?: AutopilotCloseoutCheckResult;
  typecheckResult?: AutopilotCloseoutCheckResult;
  forbiddenGrepResult?: AutopilotCloseoutCheckResult;
  scopeCheckResult?: AutopilotCloseoutCheckResult;
  unresolvedBlockers?: string[];
  metadataOnly: true;
}

export interface AutopilotRealDryRunSummary {
  summaryId: string;
  dryRunId: string;
  phase: string;
  validationStatus: AutopilotReportValidationResult["status"];
  memoryProposalStatus: AutopilotMemoryUpdateProposalFromReport["status"];
  learningRuleCount: number;
  nextAction: AutopilotCoordinatorResult["nextAction"];
  closeoutStatus: AutopilotCloseoutStatus;
  promptDraftAvailable: boolean;
  successStatus: AutopilotRealDryRunSuccessStatus;
  safeSummary: string;
  metadataOnly: true;
  noExecution: true;
}

export interface AutopilotRealDryRunResult {
  dryRunId: string;
  phase: string;
  handoffPackage: CodexHandoffPackage;
  validation: AutopilotReportValidationResult;
  validationSummary: AutopilotValidationSummary;
  memoryProposal: AutopilotMemoryUpdateProposalFromReport;
  learningRules: AutopilotErrorLearningRulesResult;
  nextActionRecommendation: AutopilotCoordinatorResult;
  closeoutResult: AutopilotCloseoutResult;
  closeoutStatus: AutopilotCloseoutStatus;
  humanFacingResponseSkeleton: string;
  nextCodexPromptDraft: AutopilotDryRunPromptDraft;
  summary: AutopilotRealDryRunSummary;
  successStatus: AutopilotRealDryRunSuccessStatus;
  limitations: string[];
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

const passedCheck = (
  name: string,
  safeSummary: string,
): AutopilotCloseoutCheckResult => ({
  name,
  status: "passed",
  safeSummary,
  metadataOnly: true,
});

export function buildAutopilotRealDryRunInput(
  overrides: Partial<AutopilotRealDryRunInput> = {},
): AutopilotRealDryRunInput {
  const base: AutopilotRealDryRunInput = {
    dryRunId: "autopilot-real-dry-run:pilot-1",
    task: autopilotRealDryRunTask,
    handoff: autopilotRealDryRunHandoff,
    report: autopilotRealDryRunReport,
    phaseMode: "B",
    expectedNextPhase: autopilotRealDryRunExpectedNextPhase,
    matchingImplementationPhase: autopilotRealDryRunExpectedNextPhase,
    roadmapTarget: autopilotRealDryRunRoadmapReturnTarget,
    workspace: autopilotRealDryRunWorkspaceFixture,
    commitPush: autopilotRealDryRunCommitPushFixture,
    riskApproval: autopilotRealDryRunRiskApprovalFixture,
    limitations: [...autopilotRealDryRunLimitations],
    recommendedModel: "Codex planning mode",
    metadataOnly: true,
    sourceOnly: true,
    advisoryOnly: true,
    noExecution: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };

  return {
    ...base,
    ...overrides,
    limitations: overrides.limitations
      ? [...overrides.limitations]
      : [...base.limitations],
  };
}

export function buildAutopilotDryRunPromptDraft(input: {
  dryRunId: string;
  handoffPackage: CodexHandoffPackage;
  nextActionRecommendation: AutopilotCoordinatorResult;
}): AutopilotDryRunPromptDraft {
  return {
    draftId: `${input.dryRunId}:prompt_draft`,
    phase: input.handoffPackage.handoffMetadata.phase,
    nextPhase: input.nextActionRecommendation.nextPhase,
    promptMarkdown: input.handoffPackage.promptMarkdown,
    sourcePackageRef: input.handoffPackage.packageId,
    metadataOnly: true,
    noCodexInvocation: true,
    noExecution: true,
    requiresHumanReview: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}

export function evaluateAutopilotDryRunSuccess(input: {
  validationSummary: AutopilotValidationSummary;
  memoryProposal: AutopilotMemoryUpdateProposalFromReport;
  learningRules: AutopilotErrorLearningRulesResult;
  nextActionRecommendation: AutopilotCoordinatorResult;
  closeoutResult: AutopilotCloseoutResult;
  nextCodexPromptDraft: AutopilotDryRunPromptDraft;
}): AutopilotRealDryRunSuccessStatus {
  const humanSkeleton = input.nextActionRecommendation.humanFacingResponseSkeleton.skeleton;
  const hasRequiredHumanSections =
    humanSkeleton.includes("1. Alerta") &&
    humanSkeleton.includes("2. Siguiente fase") &&
    humanSkeleton.includes("3. Modelo recomendado") &&
    humanSkeleton.includes("4. Prompt listo para Codex");
  const safetyFlagsHold =
    input.memoryProposal.noMemoryPersistence &&
    input.nextActionRecommendation.noCodexInvocation &&
    input.nextActionRecommendation.noExecution &&
    input.closeoutResult.noCodexInvocation &&
    input.closeoutResult.noExecution &&
    input.nextCodexPromptDraft.noCodexInvocation &&
    input.nextCodexPromptDraft.noExecution;

  return input.validationSummary.status === "passed" &&
    input.memoryProposal.status === "proposed" &&
    input.learningRules.metadataOnly &&
    input.nextActionRecommendation.nextAction === "continue_to_I_phase" &&
    input.closeoutResult.closeoutStatus === "completed_local_only" &&
    input.nextCodexPromptDraft.promptMarkdown.length > 0 &&
    hasRequiredHumanSections &&
    safetyFlagsHold
    ? "passed"
    : "failed";
}

export function summarizeAutopilotRealDryRun(
  result: Omit<AutopilotRealDryRunResult, "summary">,
): AutopilotRealDryRunSummary {
  return {
    summaryId: `${result.dryRunId}:summary`,
    dryRunId: result.dryRunId,
    phase: result.phase,
    validationStatus: result.validationSummary.status,
    memoryProposalStatus: result.memoryProposal.status,
    learningRuleCount: result.learningRules.rules.length,
    nextAction: result.nextActionRecommendation.nextAction,
    closeoutStatus: result.closeoutStatus,
    promptDraftAvailable: result.nextCodexPromptDraft.promptMarkdown.length > 0,
    successStatus: result.successStatus,
    safeSummary:
      result.successStatus === "passed"
        ? "Autopilot dry-run metadata completed the full loop safely."
        : "Autopilot dry-run metadata requires review before continuing.",
    metadataOnly: true,
    noExecution: true,
  };
}

export function runAutopilotRealDryRun(
  input: AutopilotRealDryRunInput = buildAutopilotRealDryRunInput(),
): AutopilotRealDryRunResult {
  const recommendedModel = input.recommendedModel ?? "Codex planning mode";
  const handoffPackage = prepareCodexHandoffPackage({
    task: input.task,
    handoff: input.handoff,
    nextPhase: input.expectedNextPhase,
    recommendedModel,
  });
  const validation = validateCodexReportAgainstHandoff({
    report: input.report,
    handoff: input.handoff,
    expectedPhase: input.handoff.phase,
    expectedBranch: input.handoff.branch,
    previousDirtyFiles: input.workspace.knownPreExistingDirtyFiles,
    currentDirtyFiles: input.workspace.currentDirtyFiles,
    stagedFiles: input.workspace.stagedFiles,
    commitRequired: input.commitPush.commitRequired,
    pushRequired: input.commitPush.pushRequired,
    riskLevel: input.riskApproval.riskLevel,
    expectedTests: ["autopilot-real-dry-run-tests"],
  });
  const validationSummary = summarizeAutopilotValidation(validation);
  const memoryProposal = createMemoryUpdateProposalFromReport({
    report: input.report,
    validation,
    riskLevel: input.riskApproval.riskLevel,
  });
  const learningRules = deriveErrorLearningRules({
    report: input.report,
    validation,
  });
  const nextActionRecommendation = coordinateNextAutopilotAction({
    phase: input.handoff.phase,
    phaseMode: input.phaseMode,
    expectedNextPhase: input.expectedNextPhase,
    matchingImplementationPhase: input.matchingImplementationPhase,
    report: input.report,
    validation,
    validationSummary,
    memoryProposal,
    errorLearningRules: learningRules,
    dirtyFilesStatus: {
      knownPreExisting: [...input.workspace.knownPreExistingDirtyFiles],
      currentDirty: [...input.workspace.currentDirtyFiles],
      staged: [...input.workspace.stagedFiles],
      metadataOnly: true,
    },
    commitStatus: input.commitPush.commitStatus,
    pushStatus: input.commitPush.pushStatus,
    riskLevel: input.riskApproval.riskLevel,
    approvalStatus: input.riskApproval.approvalStatus,
    recommendedModel,
  });
  const closeoutResult = coordinatePhaseCloseout({
    phase: input.handoff.phase,
    phaseMode: input.phaseMode,
    branch: input.handoff.branch,
    expectedNextPhase: input.expectedNextPhase,
    roadmapTarget: input.roadmapTarget,
    finalReport: input.report,
    validation,
    nextActionRecommendation,
    memoryProposalStatus: memoryProposal.status,
    testsResult: input.closeoutChecks?.testsResult ?? passedCheck(
      "autopilot real dry-run smoke",
      "Smoke metadata is supplied by the caller and reports success.",
    ),
    smokeResult: input.closeoutChecks?.smokeResult ?? passedCheck(
      "source-only dry-run smoke",
      "Dry-run safety metadata reports success.",
    ),
    typecheckResult: input.closeoutChecks?.typecheckResult ?? passedCheck(
      "tsc --noEmit",
      "Typecheck metadata is supplied by the caller and reports success.",
    ),
    forbiddenGrepResult: input.closeoutChecks?.forbiddenGrepResult ?? passedCheck(
      "forbidden grep",
      "Forbidden grep metadata is supplied by the caller and reports success.",
    ),
    scopeCheckResult: input.closeoutChecks?.scopeCheckResult ?? passedCheck(
      "scope check",
      "Scope metadata is supplied by the caller and reports success.",
    ),
    stagedFiles: [...input.workspace.stagedFiles],
    dirtyFilesOutsideScope: [...input.workspace.currentDirtyFiles],
    pushStatus: input.commitPush.pushStatus,
    riskLevel: input.riskApproval.riskLevel,
    unresolvedBlockers: input.closeoutChecks?.unresolvedBlockers ?? [],
    sourceOnlyImplementation: true,
    recommendedModel,
  });
  const nextCodexPromptDraft = buildAutopilotDryRunPromptDraft({
    dryRunId: input.dryRunId,
    handoffPackage,
    nextActionRecommendation,
  });
  const successStatus = evaluateAutopilotDryRunSuccess({
    validationSummary,
    memoryProposal,
    learningRules,
    nextActionRecommendation,
    closeoutResult,
    nextCodexPromptDraft,
  });
  const withoutSummary: Omit<AutopilotRealDryRunResult, "summary"> = {
    dryRunId: input.dryRunId,
    phase: input.handoff.phase,
    handoffPackage,
    validation,
    validationSummary,
    memoryProposal,
    learningRules,
    nextActionRecommendation,
    closeoutResult,
    closeoutStatus: closeoutResult.closeoutStatus,
    humanFacingResponseSkeleton:
      nextActionRecommendation.humanFacingResponseSkeleton.skeleton,
    nextCodexPromptDraft,
    successStatus,
    limitations: [...input.limitations],
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noCodexInvocation: true,
    noProcessLaunch: true,
    noProviderCalls: true,
    noNetwork: true,
    noDashboardMutation: true,
    noGitMutationFromSource: true,
    noMemoryPersistence: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };

  return {
    ...withoutSummary,
    summary: summarizeAutopilotRealDryRun(withoutSummary),
  };
}
