import type {
  AutopilotCloseoutAlertLevel,
  AutopilotCloseoutCheckResult,
  AutopilotCloseoutInput,
} from "./phaseCloseoutDecisionModel.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type { AutopilotBoundarySet } from "./types.js";

export interface AutopilotRoadmapReturnReadiness {
  roadmapReturnAllowed: boolean;
  targetPhase: string;
  reason: string;
  requiredConditionSummary: string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noGitMutationFromSource: true;
  noMemoryPersistence: true;
  boundaries: AutopilotBoundarySet;
}

const checkPassed = (check: AutopilotCloseoutCheckResult): boolean =>
  check.status === "passed";

const isSuccessfulPush = (input: AutopilotCloseoutInput): boolean =>
  input.pushStatus === "pushed" || input.finalReport.pushStatus === "pushed";

const isPhase26KI = (phase: string): boolean =>
  phase.toLowerCase().includes("26k-i");

const isPhase109B = (phase: string): boolean =>
  phase.toLowerCase().includes("109b");

export function evaluateRoadmapReturnReadiness(
  input: AutopilotCloseoutInput,
  alertLevel: AutopilotCloseoutAlertLevel,
): AutopilotRoadmapReturnReadiness {
  const conditions = [
    "Phase is 26K-I.",
    "Phase mode is implementation.",
    "Typecheck metadata passed.",
    "Smoke metadata passed.",
    "Forbidden grep metadata is clean.",
    "Scope check metadata passed.",
    "Commit hash metadata exists.",
    "Push status metadata is successful.",
    "No staged files outside scope are reported.",
    "No blocking alert remains.",
    "Roadmap target is Phase 109B.",
  ];

  const commitHash = input.commitHash ?? input.finalReport.commitHash;
  const allowed =
    isPhase26KI(input.phase) &&
    input.phaseMode === "I" &&
    checkPassed(input.typecheckResult) &&
    checkPassed(input.smokeResult) &&
    checkPassed(input.forbiddenGrepResult) &&
    checkPassed(input.scopeCheckResult) &&
    typeof commitHash === "string" &&
    commitHash.length > 0 &&
    isSuccessfulPush(input) &&
    input.stagedFiles.length === 0 &&
    alertLevel !== "blocking_alert" &&
    isPhase109B(input.roadmapTarget);

  return {
    roadmapReturnAllowed: allowed,
    targetPhase: input.roadmapTarget,
    reason: allowed
      ? "Phase 26K-I closeout metadata supports returning to the formal PM roadmap."
      : "Roadmap return remains unavailable until closeout metadata is complete and non-blocking.",
    requiredConditionSummary: conditions,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noGitMutationFromSource: true,
    noMemoryPersistence: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
