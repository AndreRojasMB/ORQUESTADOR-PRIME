import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type {
  AutopilotBoundarySet,
  AutopilotCommandResult,
  AutopilotFinding,
  AutopilotValidationFinalStatus,
} from "./types.js";

export type CodexPushStatus =
  | "not_requested"
  | "not_pushed"
  | "pushed"
  | "failed"
  | "blocked";

export interface CodexReportContract {
  reportId: string;
  phase: string;
  filesInspected: string[];
  filesModified: string[];
  summary: string;
  commandsExecuted: AutopilotCommandResult[];
  tests: AutopilotCommandResult[];
  scopeCheck: string;
  forbiddenGrepResult: string;
  commitHash?: string;
  pushStatus?: CodexPushStatus;
  nextRecommendedPhase: string;
  findings: AutopilotFinding[];
  finalStatus: AutopilotValidationFinalStatus;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecutionFromReport: true;
  boundaries: AutopilotBoundarySet;
}

export function createEmptyCodexReportContract(
  phase: string,
): CodexReportContract {
  return {
    reportId: `${phase}:report`,
    phase,
    filesInspected: [],
    filesModified: [],
    summary: "Codex report metadata has not been provided yet.",
    commandsExecuted: [],
    tests: [],
    scopeCheck: "not_run",
    forbiddenGrepResult: "not_run",
    nextRecommendedPhase: "needs_review",
    findings: [],
    finalStatus: "needs_review",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecutionFromReport: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
