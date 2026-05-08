import { buildHumanFacingPhaseResponse } from "./humanFacingPhaseResponse.js";
import {
  createCoordinatorBlockerSummary,
  createCoordinatorFinding,
  isFutureExecutionRisk,
  isValidationPassed,
  type AutopilotCoordinatorAlertLevel,
  type AutopilotCoordinatorInput,
  type AutopilotCoordinatorNextAction,
  type AutopilotCoordinatorPromptSeed,
  type AutopilotCoordinatorResult,
} from "./nextActionDecisionModel.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";

const hasUnstagedDirtyOutsideScope = (
  input: AutopilotCoordinatorInput,
): boolean => {
  const dirty = input.dirtyFilesStatus;
  if (!dirty) {
    return false;
  }

  return dirty.currentDirty.length > 0 && dirty.staged.length === 0;
};

const hasStagedDirtyOutsideScope = (
  input: AutopilotCoordinatorInput,
): boolean => (input.dirtyFilesStatus?.staged.length ?? 0) > 0;

const implementationCommitMissing = (
  input: AutopilotCoordinatorInput,
): boolean =>
  input.phaseMode === "I" &&
  (input.commitStatus === "missing" ||
    input.report.commitHash === undefined ||
    input.pushStatus === "not_pushed" ||
    input.pushStatus === "failed" ||
    input.report.pushStatus === "not_pushed" ||
    input.report.pushStatus === "failed" ||
    input.report.pushStatus === undefined);

const validationHasHardFailure = (
  input: AutopilotCoordinatorInput,
): boolean =>
  input.validation.failedCommands.length > 0 ||
  input.validation.forbiddenGrepViolations.some(
    (finding) => finding.severity === "fail",
  ) ||
  input.validation.commitPushFindings.some(
    (finding) => finding.severity === "fail",
  );

const collectBlockers = (
  input: AutopilotCoordinatorInput,
): string[] => {
  const blockers = [...(input.blockedReasons ?? [])];

  if (input.validation.status === "blocked") {
    blockers.push("Validation metadata is blocked.");
  }

  if (input.validation.scopeViolations.some((item) => item.severity === "fail")) {
    blockers.push("Scope validation contains blocking findings.");
  }

  if (hasStagedDirtyOutsideScope(input)) {
    blockers.push("Dirty files outside scope are reported as staged.");
  }

  if (isFutureExecutionRisk(input.riskLevel)) {
    blockers.push("Risk level is reserved for a future execution-gated phase.");
  }

  return blockers;
};

export function classifyPhaseAlert(
  input: AutopilotCoordinatorInput,
): AutopilotCoordinatorAlertLevel {
  if (collectBlockers(input).length > 0) {
    return "blocking_alert";
  }

  if (input.riskLevel === "critical_plan_only") {
    return "blocking_alert";
  }

  if (
    input.validation.status === "needs_review" ||
    input.validation.status === "failed" ||
    hasUnstagedDirtyOutsideScope(input) ||
    implementationCommitMissing(input) ||
    input.memoryProposal?.requiresHumanApproval === true ||
    input.validationSummary.warnCount > 0
  ) {
    return "mild_alert";
  }

  return "no_alert";
}

export function decideNextPhaseFromValidation(
  input: AutopilotCoordinatorInput,
): AutopilotCoordinatorNextAction {
  if (collectBlockers(input).length > 0) {
    return "blocked";
  }

  if (input.riskLevel === "critical_plan_only") {
    return "freeze_scope";
  }

  if (validationHasHardFailure(input)) {
    return input.validation.status === "failed"
      ? "retry_phase"
      : "request_human_review";
  }

  if (implementationCommitMissing(input)) {
    return "closeout_required";
  }

  if (!isValidationPassed(input.validation.status)) {
    return input.validation.status === "failed"
      ? "retry_phase"
      : "request_human_review";
  }

  if (input.phaseMode === "B") {
    return "continue_to_I_phase";
  }

  if (input.phaseMode === "I") {
    return "continue_to_next_B_phase";
  }

  return "continue_next_phase";
}

export function recommendModelForNextPhase(
  input: AutopilotCoordinatorInput,
): string {
  if (input.approvalStatus === "pending_review") {
    return "Human review first, then Codex";
  }

  if (input.riskLevel === "critical_plan_only") {
    return "Codex planning mode";
  }

  return input.recommendedModel ?? "Codex";
}

function nextPhaseForAction(
  input: AutopilotCoordinatorInput,
  nextAction: AutopilotCoordinatorNextAction,
): string {
  if (nextAction === "continue_to_I_phase") {
    return input.matchingImplementationPhase ?? input.expectedNextPhase;
  }

  if (nextAction === "blocked" || nextAction === "request_human_review") {
    return input.phase;
  }

  return input.expectedNextPhase;
}

function reasonForAction(
  nextAction: AutopilotCoordinatorNextAction,
  alertLevel: AutopilotCoordinatorAlertLevel,
): string {
  if (nextAction === "blocked") {
    return "Blocking metadata requires a new human-reviewed plan.";
  }

  if (nextAction === "retry_phase") {
    return "Validation metadata reports failed checks that should be retried.";
  }

  if (nextAction === "request_human_review") {
    return "Validation metadata is incomplete or requires human judgment.";
  }

  if (nextAction === "closeout_required") {
    return "Implementation metadata needs closeout evidence before continuing.";
  }

  if (nextAction === "freeze_scope") {
    return "Risk remains planning-only and should not advance to implementation.";
  }

  if (alertLevel === "mild_alert") {
    return "Phase can continue with caution after reviewing warnings.";
  }

  return "Validation metadata is clean for the next advisory phase.";
}

function buildPromptSeed(
  input: AutopilotCoordinatorInput,
  nextAction: AutopilotCoordinatorNextAction,
  nextPhase: string,
  blockers: readonly string[],
): AutopilotCoordinatorPromptSeed {
  const promptNeeded =
    nextAction === "continue_to_I_phase" ||
    nextAction === "retry_phase" ||
    nextAction === "rollback_plan";
  const handoffAllowed =
    promptNeeded &&
    blockers.length === 0 &&
    input.validation.status === "passed" &&
    !isFutureExecutionRisk(input.riskLevel);

  return {
    promptNeeded,
    handoffAllowed,
    promptTitle: `Prompt seed for ${nextPhase}`,
    safeSummary: handoffAllowed
      ? `Prepare a human-reviewed Codex handoff for ${nextPhase}.`
      : "Handoff is not allowed until validation, approval, or blocker metadata is resolved.",
    metadataOnly: true,
    noCodexInvocation: true,
  };
}

export function coordinateNextAutopilotAction(
  input: AutopilotCoordinatorInput,
): AutopilotCoordinatorResult {
  const blockers = collectBlockers(input);
  const alertLevel = classifyPhaseAlert(input);
  const nextAction = decideNextPhaseFromValidation(input);
  const nextPhase = nextPhaseForAction(input, nextAction);
  const reason = reasonForAction(nextAction, alertLevel);
  const recommendedModel = recommendModelForNextPhase(input);
  const promptSeed = buildPromptSeed(input, nextAction, nextPhase, blockers);
  const blockerSummary = createCoordinatorBlockerSummary(blockers);
  const findings = blockers.map((blocker) =>
    createCoordinatorFinding(
      input.phase,
      "COORDINATOR_BLOCKER",
      blocker,
      "fail",
    ),
  );
  const requiredApproval =
    input.approvalStatus === "required" ||
    input.approvalStatus === "pending_review" ||
    input.memoryProposal?.requiresHumanApproval === true ||
    nextAction === "request_human_review" ||
    nextAction === "blocked" ||
    nextAction === "freeze_scope";
  const humanFacingResponseSkeleton = buildHumanFacingPhaseResponse({
    alertLevel,
    nextPhase,
    reason,
    recommendedModel,
    promptSeed,
    nextAction,
  });

  return {
    coordinationId: `${input.phase}:next_action_coordination`,
    phase: input.phase,
    alertLevel,
    alertMessage: humanFacingResponseSkeleton.alertLabel,
    nextPhase,
    nextAction,
    reason,
    recommendedModel,
    promptNeeded: promptSeed.promptNeeded,
    handoffAllowed: promptSeed.handoffAllowed,
    memoryWriteAllowed: false,
    requiredApproval,
    blockerSummary,
    humanFacingResponseSkeleton,
    findings,
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
}
