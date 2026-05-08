import {
  closeoutAlertLabel,
  createCloseoutBlockerSummary,
  createCloseoutFinding,
  type AutopilotCloseoutAlertLevel,
  type AutopilotCloseoutCheckResult,
  type AutopilotCloseoutHumanOutput,
  type AutopilotCloseoutInput,
  type AutopilotCloseoutPromptType,
  type AutopilotCloseoutResult,
  type AutopilotCloseoutStatus,
} from "./phaseCloseoutDecisionModel.js";
import { evaluateRoadmapReturnReadiness } from "./roadmapReturnPolicy.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";

const checkPassed = (check: AutopilotCloseoutCheckResult): boolean =>
  check.status === "passed";

const checkFailed = (check: AutopilotCloseoutCheckResult): boolean =>
  check.status === "failed";

const hasCommitHash = (input: AutopilotCloseoutInput): boolean => {
  const hash = input.commitHash ?? input.finalReport.commitHash;
  return typeof hash === "string" && hash.length > 0;
};

const hasSuccessfulPush = (input: AutopilotCloseoutInput): boolean =>
  input.pushStatus === "pushed" || input.finalReport.pushStatus === "pushed";

const hasUnstagedDirtyOutsideScope = (
  input: AutopilotCloseoutInput,
): boolean =>
  input.dirtyFilesOutsideScope.length > 0 && input.stagedFiles.length === 0;

const verificationFailed = (input: AutopilotCloseoutInput): boolean =>
  checkFailed(input.typecheckResult) ||
  checkFailed(input.testsResult) ||
  checkFailed(input.smokeResult);

const grepOrScopeFailed = (input: AutopilotCloseoutInput): boolean =>
  checkFailed(input.forbiddenGrepResult) ||
  checkFailed(input.scopeCheckResult);

const validationBlocked = (input: AutopilotCloseoutInput): boolean =>
  input.validation.status === "blocked" ||
  input.validation.scopeViolations.some((finding) => finding.severity === "fail");

const collectCloseoutBlockers = (
  input: AutopilotCloseoutInput,
): string[] => {
  const blockers = [...(input.unresolvedBlockers ?? [])];

  if (input.stagedFiles.length > 0) {
    blockers.push("Dirty files outside scope are reported as staged.");
  }

  if (validationBlocked(input)) {
    blockers.push("Validation metadata reports blocked or unsafe scope.");
  }

  if (grepOrScopeFailed(input)) {
    blockers.push("Forbidden grep or scope check metadata failed.");
  }

  return blockers;
};

export function classifyPhaseCloseoutAlert(
  input: AutopilotCloseoutInput,
): AutopilotCloseoutAlertLevel {
  if (collectCloseoutBlockers(input).length > 0) {
    return "blocking_alert";
  }

  if (
    verificationFailed(input) ||
    hasUnstagedDirtyOutsideScope(input) ||
    input.validation.status === "needs_review" ||
    input.memoryProposalStatus === "proposed" ||
    (input.phaseMode === "I" && (!hasCommitHash(input) || !hasSuccessfulPush(input)))
  ) {
    return "mild_alert";
  }

  return "no_alert";
}

export function classifyPhaseCloseoutStatus(
  input: AutopilotCloseoutInput,
): AutopilotCloseoutStatus {
  const blockers = collectCloseoutBlockers(input);
  if (validationBlocked(input)) {
    return "unsafe_scope";
  }

  if (blockers.length > 0) {
    return "blocked";
  }

  if (verificationFailed(input) || input.validation.status === "needs_review") {
    return "needs_human_review";
  }

  if (input.phaseMode === "B") {
    return "completed_local_only";
  }

  if (input.phaseMode === "I" && !hasCommitHash(input)) {
    return "needs_commit";
  }

  if (input.phaseMode === "I" && !hasSuccessfulPush(input)) {
    return "needs_push";
  }

  return "closed_and_pushed";
}

export function recommendCloseoutNextPhase(
  input: AutopilotCloseoutInput,
  status: AutopilotCloseoutStatus,
  roadmapReturnAllowed: boolean,
): string {
  if (roadmapReturnAllowed) {
    return input.roadmapTarget;
  }

  if (
    status === "blocked" ||
    status === "unsafe_scope" ||
    status === "needs_human_review"
  ) {
    return input.phase;
  }

  return input.expectedNextPhase;
}

function requiredPromptTypeForStatus(
  status: AutopilotCloseoutStatus,
  roadmapReturnAllowed: boolean,
): AutopilotCloseoutPromptType {
  if (roadmapReturnAllowed) {
    return "roadmap_return_prompt";
  }

  if (status === "completed_local_only" || status === "needs_commit") {
    return "implementation_prompt";
  }

  if (status === "needs_human_review" || status === "blocked" || status === "unsafe_scope") {
    return "human_review_prompt";
  }

  return "planning_prompt";
}

export function buildCloseoutMessage(
  status: AutopilotCloseoutStatus,
  roadmapReturnAllowed: boolean,
): string {
  if (roadmapReturnAllowed) {
    return "Phase closeout metadata supports returning to Phase 109B.";
  }

  if (status === "closed_and_pushed") {
    return "Implementation phase is closed with commit and push metadata.";
  }

  if (status === "completed_local_only") {
    return "Planning phase is complete locally and ready for an implementation phase to commit it.";
  }

  if (status === "needs_commit") {
    return "Implementation phase needs commit metadata before it can close.";
  }

  if (status === "needs_push") {
    return "Implementation phase needs push metadata before it can close.";
  }

  if (status === "unsafe_scope") {
    return "Closeout metadata reports unsafe scope and must not continue.";
  }

  if (status === "blocked") {
    return "Closeout metadata reports blockers that require human review.";
  }

  return "Closeout metadata requires human review before continuing.";
}

function buildCloseoutHumanOutput(input: {
  alertLevel: AutopilotCloseoutAlertLevel;
  nextPhase: string;
  closeoutMessage: string;
  recommendedModel: string;
  requiredPromptType: AutopilotCloseoutPromptType;
}): AutopilotCloseoutHumanOutput {
  const alertLabel = closeoutAlertLabel(input.alertLevel);
  const promptLine =
    input.requiredPromptType === "none"
      ? "No prompt required."
      : `${input.requiredPromptType}: ${input.closeoutMessage}`;
  const nextPhaseLine = `${input.nextPhase} - ${input.closeoutMessage}`;

  return {
    alertLabel,
    nextPhaseLine,
    recommendedModelLine: input.recommendedModel,
    promptLine,
    skeleton: [
      "1. Alerta",
      alertLabel,
      "",
      "2. Siguiente fase",
      nextPhaseLine,
      "",
      "3. Modelo recomendado",
      input.recommendedModel,
      "",
      "4. Prompt listo para Codex",
      promptLine,
    ].join("\n"),
    metadataOnly: true,
    noExecution: true,
  };
}

export function coordinatePhaseCloseout(
  input: AutopilotCloseoutInput,
): AutopilotCloseoutResult {
  const initialStatus = classifyPhaseCloseoutStatus(input);
  const alertLevel = classifyPhaseCloseoutAlert(input);
  const roadmapReadiness = evaluateRoadmapReturnReadiness(input, alertLevel);
  const closeoutStatus: AutopilotCloseoutStatus = roadmapReadiness.roadmapReturnAllowed
    ? "ready_for_roadmap_return"
    : initialStatus;
  const nextPhase = recommendCloseoutNextPhase(
    input,
    closeoutStatus,
    roadmapReadiness.roadmapReturnAllowed,
  );
  const closeoutMessage = buildCloseoutMessage(
    closeoutStatus,
    roadmapReadiness.roadmapReturnAllowed,
  );
  const blockerReasons = collectCloseoutBlockers(input);
  const blockerSummary = createCloseoutBlockerSummary(blockerReasons);
  const requiredPromptType = requiredPromptTypeForStatus(
    closeoutStatus,
    roadmapReadiness.roadmapReturnAllowed,
  );
  const recommendedModel =
    input.recommendedModel ??
    (roadmapReadiness.roadmapReturnAllowed ? "Codex planning mode" : "Codex");
  const humanFacingOutput = buildCloseoutHumanOutput({
    alertLevel,
    nextPhase,
    closeoutMessage,
    recommendedModel,
    requiredPromptType,
  });
  const findings = blockerReasons.map((blocker) =>
    createCloseoutFinding(input.phase, "CLOSEOUT_BLOCKER", blocker, "fail"),
  );
  const humanReviewRequired =
    alertLevel !== "no_alert" ||
    closeoutStatus === "needs_human_review" ||
    closeoutStatus === "blocked" ||
    closeoutStatus === "unsafe_scope";

  return {
    closeoutId: `${input.phase}:phase_closeout`,
    phase: input.phase,
    closeoutStatus,
    alertLevel,
    closeoutMessage,
    commitRequired: input.phaseMode === "I" && !hasCommitHash(input),
    pushRequired: input.phaseMode === "I" && !hasSuccessfulPush(input),
    humanReviewRequired,
    safeToContinue:
      closeoutStatus === "ready_for_next_phase" ||
      closeoutStatus === "ready_for_roadmap_return" ||
      closeoutStatus === "closed_and_pushed" ||
      closeoutStatus === "completed_local_only",
    nextPhase,
    roadmapReturnAllowed: roadmapReadiness.roadmapReturnAllowed,
    blockerSummary,
    recommendedModel,
    requiredPromptType,
    humanFacingOutput,
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
