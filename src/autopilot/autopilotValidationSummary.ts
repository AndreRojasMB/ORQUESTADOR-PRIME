import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type {
  AutopilotPostValidationAction,
  AutopilotReportValidationResult,
} from "./reportValidator.js";
import type { AutopilotBoundarySet } from "./types.js";

export interface AutopilotValidationSummary {
  summaryId: string;
  phase: string;
  status: AutopilotReportValidationResult["status"];
  nextAction: AutopilotPostValidationAction;
  findingCount: number;
  failCount: number;
  warnCount: number;
  scopeViolationCount: number;
  missingCommandCount: number;
  missingTestCount: number;
  forbiddenGrepViolationCount: number;
  dirtyFilesWarningCount: number;
  secretsLoggingWarningCount: number;
  commitPushFindingCount: number;
  safeSummary: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noMemoryPersistence: true;
  boundaries: AutopilotBoundarySet;
}

export function summarizeAutopilotValidation(
  validation: AutopilotReportValidationResult,
): AutopilotValidationSummary {
  const failCount = validation.findings.filter(
    (finding) => finding.severity === "fail",
  ).length;
  const warnCount = validation.findings.filter(
    (finding) => finding.severity === "warn",
  ).length;

  return {
    summaryId: `${validation.phase}:validation_summary`,
    phase: validation.phase,
    status: validation.status,
    nextAction: validation.nextAction,
    findingCount: validation.findings.length,
    failCount,
    warnCount,
    scopeViolationCount: validation.scopeViolations.length,
    missingCommandCount: validation.missingCommands.length,
    missingTestCount: validation.missingTests.length,
    forbiddenGrepViolationCount: validation.forbiddenGrepViolations.length,
    dirtyFilesWarningCount: validation.dirtyFilesWarnings.length,
    secretsLoggingWarningCount: validation.secretsLoggingWarnings.length,
    commitPushFindingCount: validation.commitPushFindings.length,
    safeSummary: validation.safeSummary,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noMemoryPersistence: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
