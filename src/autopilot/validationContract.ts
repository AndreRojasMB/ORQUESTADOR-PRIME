import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type {
  AutopilotBoundarySet,
  AutopilotCommandResult,
  AutopilotFinding,
  AutopilotValidationFinalStatus,
} from "./types.js";

export interface AutopilotValidationReportContract {
  validationId: string;
  phase: string;
  typecheck: AutopilotCommandResult;
  tests: AutopilotCommandResult[];
  pyCompile: AutopilotCommandResult;
  gitStatus: AutopilotCommandResult;
  scopeViolations: AutopilotFinding[];
  forbiddenGrepViolations: AutopilotFinding[];
  secretsLoggingWarnings: AutopilotFinding[];
  finalStatus: AutopilotValidationFinalStatus;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noRuntimeExecution: true;
  noAutomaticRollback: true;
  boundaries: AutopilotBoundarySet;
}

export interface AutopilotValidationStatusInput {
  phase: string;
  typecheckPassed: boolean;
  testsPassed: boolean;
  pyCompilePassed: boolean;
  hasScopeViolations: boolean;
  hasForbiddenGrepViolations: boolean;
  hasSecretsWarnings: boolean;
}

const commandResult = (
  command: string,
  passed: boolean,
  safeSummary: string,
): AutopilotCommandResult => ({
  command,
  result: passed ? "passed" : "failed",
  safeSummary,
  metadataOnly: true,
  noExecutionFromContract: true,
});

export function summarizeValidationStatus(
  input: AutopilotValidationStatusInput,
): AutopilotValidationReportContract {
  const scopeViolations: AutopilotFinding[] = input.hasScopeViolations
    ? [
        {
          findingId: `${input.phase}:scope_violation`,
          severity: "fail",
          reasonCode: "SCOPE_VIOLATION",
          safeMessage: "Validation metadata reports changed files outside approved scope.",
        },
      ]
    : [];
  const forbiddenGrepViolations: AutopilotFinding[] =
    input.hasForbiddenGrepViolations
      ? [
          {
            findingId: `${input.phase}:forbidden_grep`,
            severity: "fail",
            reasonCode: "FORBIDDEN_GREP_MATCH",
            safeMessage: "Validation metadata reports forbidden grep matches.",
          },
        ]
      : [];
  const secretsLoggingWarnings: AutopilotFinding[] = input.hasSecretsWarnings
    ? [
        {
          findingId: `${input.phase}:secrets_warning`,
          severity: "warn",
          reasonCode: "SECRETS_LOGGING_WARNING",
          safeMessage: "Validation metadata reports possible secret or logging warnings.",
        },
      ]
    : [];

  const hardFailure =
    !input.typecheckPassed ||
    !input.testsPassed ||
    !input.pyCompilePassed ||
    scopeViolations.length > 0 ||
    forbiddenGrepViolations.length > 0;
  const finalStatus: AutopilotValidationFinalStatus = hardFailure
    ? "failed"
    : secretsLoggingWarnings.length > 0
      ? "accepted_with_warnings"
      : "accepted";

  return {
    validationId: `${input.phase}:validation`,
    phase: input.phase,
    typecheck: commandResult(
      "node node_modules/typescript/bin/tsc --noEmit",
      input.typecheckPassed,
      "TypeScript verification status supplied by caller metadata.",
    ),
    tests: [
      commandResult(
        "targeted tests",
        input.testsPassed,
        "Test status supplied by caller metadata.",
      ),
    ],
    pyCompile: commandResult(
      "python3 -m py_compile",
      input.pyCompilePassed,
      "Python compile status supplied by caller metadata.",
    ),
    gitStatus: commandResult(
      "git status --short --branch",
      !input.hasScopeViolations,
      "Git status scope supplied by caller metadata.",
    ),
    scopeViolations,
    forbiddenGrepViolations,
    secretsLoggingWarnings,
    finalStatus,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noRuntimeExecution: true,
    noAutomaticRollback: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
