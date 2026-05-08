import type { CodexHandoffContract } from "./codexHandoff.js";
import type { CodexReportContract } from "./reportContract.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type {
  AutopilotBoundarySet,
  AutopilotCommandResult,
  AutopilotFinding,
  AutopilotRiskLevel,
} from "./types.js";

export type AutopilotReportValidationStatus =
  | "passed"
  | "failed"
  | "needs_review"
  | "blocked";

export type AutopilotPostValidationAction =
  | "continue_next_phase"
  | "retry_phase"
  | "request_human_review"
  | "freeze_scope"
  | "rollback_plan"
  | "blocked";

export interface AutopilotReportValidationInput {
  report: CodexReportContract;
  handoff?: CodexHandoffContract;
  expectedPhase?: string;
  expectedBranch?: string;
  allowedFiles?: string[];
  forbiddenFiles?: string[];
  requiredCommands?: string[];
  expectedTests?: string[];
  forbiddenGrepRules?: string[];
  previousDirtyFiles?: string[];
  currentDirtyFiles?: string[];
  stagedFiles?: string[];
  commitRequired?: boolean;
  pushRequired?: boolean;
  riskLevel?: AutopilotRiskLevel;
  acceptedWarningCodes?: string[];
}

export interface AutopilotReportValidationResult {
  validationId: string;
  phase: string;
  expectedBranch?: string;
  status: AutopilotReportValidationStatus;
  scopeViolations: AutopilotFinding[];
  missingCommands: AutopilotFinding[];
  failedCommands: AutopilotFinding[];
  missingTests: AutopilotFinding[];
  forbiddenGrepViolations: AutopilotFinding[];
  dirtyFilesWarnings: AutopilotFinding[];
  secretsLoggingWarnings: AutopilotFinding[];
  commitPushFindings: AutopilotFinding[];
  findings: AutopilotFinding[];
  nextAction: AutopilotPostValidationAction;
  safeSummary: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noFilesystemAccess: true;
  noMemoryPersistence: true;
  boundaries: AutopilotBoundarySet;
}

const commandPassed = (result: AutopilotCommandResult): boolean =>
  result.result === "passed";

const normalize = (value: string): string => value.trim().toLowerCase();

const includesCommand = (
  commands: readonly AutopilotCommandResult[],
  requiredCommand: string,
): AutopilotCommandResult | undefined => {
  const needle = normalize(requiredCommand);
  return commands.find((command) =>
    normalize(command.command).includes(needle),
  );
};

const pathMatchesPattern = (path: string, pattern: string): boolean => {
  if (pattern.endsWith("/*")) {
    return path.startsWith(pattern.slice(0, -1));
  }

  if (pattern.endsWith("*")) {
    return path.startsWith(pattern.slice(0, -1));
  }

  return path === pattern;
};

const pathMatchesAny = (
  path: string,
  patterns: readonly string[],
): boolean => patterns.some((pattern) => pathMatchesPattern(path, pattern));

const finding = (
  phase: string,
  reasonCode: string,
  safeMessage: string,
  severity: AutopilotFinding["severity"],
  path?: string,
): AutopilotFinding => ({
  findingId: `${phase}:${reasonCode.toLowerCase()}:${path ?? "metadata"}`,
  severity,
  reasonCode,
  safeMessage,
  ...(path ? { path } : {}),
});

const safeTextHasSensitiveMarker = (value: string): boolean => {
  const lower = value.toLowerCase();
  return [
    "api key",
    "token",
    "secret",
    "credential",
    "raw prompt",
    "raw provider output",
    "webhook secret",
    "vault content",
  ].some((marker) => lower.includes(marker));
};

export function recommendPostValidationAction(
  status: AutopilotReportValidationStatus,
  riskLevel: AutopilotRiskLevel = "plan_only",
): AutopilotPostValidationAction {
  if (status === "blocked") {
    return "blocked";
  }

  if (riskLevel === "critical_plan_only" && status !== "passed") {
    return "freeze_scope";
  }

  if (status === "failed") {
    return "retry_phase";
  }

  if (status === "needs_review") {
    return "request_human_review";
  }

  return riskLevel === "execute_low_risk_future" ||
    riskLevel === "execute_gated_future"
    ? "request_human_review"
    : "continue_next_phase";
}

export function validateCodexReportAgainstHandoff(
  input: AutopilotReportValidationInput,
): AutopilotReportValidationResult {
  const report = input.report;
  const phase = input.expectedPhase ?? input.handoff?.phase ?? report.phase;
  const allowedFiles =
    input.allowedFiles ?? input.handoff?.allowedFiles ?? [];
  const forbiddenFiles =
    input.forbiddenFiles ?? input.handoff?.forbiddenFiles ?? [];
  const requiredCommands =
    input.requiredCommands ?? input.handoff?.verificationPlan.commands ?? [];
  const expectedTests = input.expectedTests ?? [];
  const previousDirtyFiles = new Set(input.previousDirtyFiles ?? []);
  const currentDirtyFiles = input.currentDirtyFiles ?? [];
  const stagedFiles = input.stagedFiles ?? [];

  const scopeViolations: AutopilotFinding[] = [];
  for (const file of report.filesModified) {
    if (pathMatchesAny(file, forbiddenFiles)) {
      scopeViolations.push(
        finding(
          phase,
          "FORBIDDEN_FILE_MODIFIED",
          "Report metadata includes a modified file from a forbidden surface.",
          "fail",
          file,
        ),
      );
      continue;
    }

    if (allowedFiles.length > 0 && !pathMatchesAny(file, allowedFiles)) {
      scopeViolations.push(
        finding(
          phase,
          "OUT_OF_SCOPE_FILE_MODIFIED",
          "Report metadata includes a modified file outside the approved scope.",
          "fail",
          file,
        ),
      );
    }
  }

  for (const file of stagedFiles) {
    if (
      pathMatchesAny(file, forbiddenFiles) ||
      (allowedFiles.length > 0 && !pathMatchesAny(file, allowedFiles))
    ) {
      scopeViolations.push(
        finding(
          phase,
          "UNRELATED_STAGED_FILE",
          "Caller metadata reports a staged file outside the approved phase scope.",
          "fail",
          file,
        ),
      );
    }
  }

  const missingCommands: AutopilotFinding[] = [];
  const failedCommands: AutopilotFinding[] = [];
  for (const command of requiredCommands) {
    const reported = includesCommand(report.commandsExecuted, command);
    if (!reported) {
      missingCommands.push(
        finding(
          phase,
          "MISSING_REQUIRED_COMMAND",
          "A required verification command is missing from the Codex report metadata.",
          "warn",
          command,
        ),
      );
    } else if (!commandPassed(reported)) {
      failedCommands.push(
        finding(
          phase,
          "FAILED_REQUIRED_COMMAND",
          "A required verification command is reported as failed or skipped.",
          "fail",
          reported.command,
        ),
      );
    }
  }

  const missingTests: AutopilotFinding[] = [];
  const failedTests: AutopilotFinding[] = [];
  for (const testName of expectedTests) {
    const reported = includesCommand(report.tests, testName);
    if (!reported) {
      missingTests.push(
        finding(
          phase,
          "MISSING_EXPECTED_TEST",
          "An expected test is missing from the Codex report metadata.",
          "warn",
          testName,
        ),
      );
    } else if (!commandPassed(reported)) {
      failedTests.push(
        finding(
          phase,
          "FAILED_EXPECTED_TEST",
          "An expected test is reported as failed or skipped.",
          "fail",
          reported.command,
        ),
      );
    }
  }

  const forbiddenGrepViolations: AutopilotFinding[] = [];
  const grepSummary = normalize(report.forbiddenGrepResult);
  if (grepSummary === "not_run" || grepSummary === "") {
    forbiddenGrepViolations.push(
      finding(
        phase,
        "FORBIDDEN_GREP_NOT_RUN",
        "Forbidden grep evidence was not supplied in the report metadata.",
        "warn",
      ),
    );
  } else if (
    grepSummary.includes("violation") ||
    (grepSummary.includes("match") && !grepSummary.includes("allowed"))
  ) {
    forbiddenGrepViolations.push(
      finding(
        phase,
        "FORBIDDEN_GREP_MATCH",
        "Forbidden grep evidence reports an unapproved match.",
        "fail",
      ),
    );
  }

  const dirtyFilesWarnings: AutopilotFinding[] = [];
  for (const file of currentDirtyFiles) {
    if (!previousDirtyFiles.has(file) && !report.filesModified.includes(file)) {
      dirtyFilesWarnings.push(
        finding(
          phase,
          "NEW_DIRTY_FILE_OUTSIDE_REPORT",
          "Caller metadata includes a dirty file that was not present before the phase and is not listed in the report.",
          "warn",
          file,
        ),
      );
    }
  }

  const secretsLoggingWarnings: AutopilotFinding[] = [
    report.summary,
    report.scopeCheck,
    report.forbiddenGrepResult,
    ...report.findings.map((item) => item.safeMessage),
  ].some(safeTextHasSensitiveMarker)
    ? [
        finding(
          phase,
          "SENSITIVE_MARKER_IN_REPORT",
          "Report metadata contains wording that may indicate sensitive material and requires human review.",
          "warn",
        ),
      ]
    : [];

  const commitPushFindings: AutopilotFinding[] = [];
  if (input.commitRequired && !report.commitHash) {
    commitPushFindings.push(
      finding(
        phase,
        "MISSING_REQUIRED_COMMIT",
        "Implementation phase metadata is missing the required commit hash.",
        "fail",
      ),
    );
  }

  if (input.pushRequired && report.pushStatus !== "pushed") {
    commitPushFindings.push(
      finding(
        phase,
        "MISSING_REQUIRED_PUSH",
        "Implementation phase metadata does not report a successful push.",
        "fail",
      ),
    );
  }

  if (!input.commitRequired && report.commitHash) {
    commitPushFindings.push(
      finding(
        phase,
        "UNEXPECTED_COMMIT",
        "Planning phase metadata reports a commit where none was expected.",
        "fail",
      ),
    );
  }

  const allFindings = [
    ...scopeViolations,
    ...missingCommands,
    ...failedCommands,
    ...missingTests,
    ...failedTests,
    ...forbiddenGrepViolations,
    ...dirtyFilesWarnings,
    ...secretsLoggingWarnings,
    ...commitPushFindings,
  ];

  const hasBlockedScope = scopeViolations.some(
    (item) =>
      item.reasonCode === "FORBIDDEN_FILE_MODIFIED" ||
      item.reasonCode === "UNRELATED_STAGED_FILE",
  );
  const hasFailures = allFindings.some((item) => item.severity === "fail");
  const hasWarnings = allFindings.some((item) => item.severity === "warn");
  const status: AutopilotReportValidationStatus = hasBlockedScope
    ? "blocked"
    : hasFailures
      ? "failed"
      : hasWarnings
        ? "needs_review"
        : "passed";

  const nextAction = recommendPostValidationAction(
    status,
    input.riskLevel,
  );

  return {
    validationId: `${phase}:report_validation`,
    phase,
    ...(input.expectedBranch ? { expectedBranch: input.expectedBranch } : {}),
    status,
    scopeViolations,
    missingCommands,
    failedCommands: [...failedCommands, ...failedTests],
    missingTests,
    forbiddenGrepViolations,
    dirtyFilesWarnings,
    secretsLoggingWarnings,
    commitPushFindings,
    findings: allFindings,
    nextAction,
    safeSummary:
      status === "passed"
        ? "Report metadata satisfies the supplied handoff validation expectations."
        : "Report metadata requires additional review before the autopilot loop can continue.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noFilesystemAccess: true,
    noMemoryPersistence: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
