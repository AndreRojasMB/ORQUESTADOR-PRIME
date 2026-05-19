import type { AutopilotMode, AutopilotRiskLevel } from "./types.js";
import type { AutopilotReportValidationStatus } from "./reportValidator.js";

export type ControlledCodexReportAlertLevel =
  | "no_alert"
  | "mild_alert"
  | "blocking_alert";

export type ControlledCodexReportCloseoutStatus =
  | "closed_and_pushed"
  | "completed_local_only"
  | "needs_commit"
  | "needs_push"
  | "needs_retry"
  | "needs_human_review"
  | "blocked"
  | "unsafe_scope";

export type ControlledCodexReportReturnDecisionStatus =
  | "continue"
  | "retry"
  | "human_review"
  | "blocked";

export interface ControlledCodexReportReturnInput {
  reportReturnId: string;
  sourceHandoffRef: string;
  sourceTrialRef: string;
  reportText: string;
  expectedPhase: string;
  expectedMode: AutopilotMode;
  expectedBranch: string;
  receivedAtLabel: string;
  submittedByHuman: boolean;
  riskLevel: AutopilotRiskLevel;
  limitations: readonly string[];
}

export interface ControlledCodexNormalizedReport {
  phase: string;
  filesInspected: readonly string[];
  filesModified: readonly string[];
  summary: string;
  implementationDetails: string;
  safetyGuarantees: readonly string[];
  testsScripts: readonly string[];
  commandsExecuted: readonly string[];
  scopeCheck: string;
  forbiddenGrep: string;
  commitPush: string;
  nextRecommendedPhase: string;
  unresolvedIssues: readonly string[];
  evidenceRefs: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface ControlledCodexReportValidation {
  validationId: string;
  phaseMatches: boolean;
  modeMatches: boolean;
  requiredSectionsPresent: boolean;
  allowedFilesRespected: boolean;
  forbiddenFilesUntouched: boolean;
  dirtyOutsideScopeNotStaged: boolean;
  typecheckPassed: boolean;
  smokePassed: boolean;
  forbiddenGrepClean: boolean;
  commitPushExpected: boolean;
  unsafeRuntimeClaimsAbsent: boolean;
  secretsAbsent: boolean;
  packageWorkflowUntouched: boolean;
  dashboardUntouched: boolean;
  providerMutationAbsent: boolean;
  validationStatus: AutopilotReportValidationStatus;
  alertLevel: ControlledCodexReportAlertLevel;
  blockers: readonly string[];
  warnings: readonly string[];
  recommendedFixes: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface ControlledCodexReportCloseout {
  closeoutId: string;
  reportReturnRef: string;
  validationRef: string;
  closeoutStatus: ControlledCodexReportCloseoutStatus;
  safeToContinue: boolean;
  needsRetry: boolean;
  needsHumanReview: boolean;
  nextRecommendedPhase: string;
  nextRecommendedMode: AutopilotMode;
  memoryProposalAllowed: boolean;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noMemoryPersistence: true;
}

export interface ControlledCodexReportReturnDecision {
  decisionId: string;
  reportReturnRef: string;
  validationStatus: AutopilotReportValidationStatus;
  alertLevel: ControlledCodexReportAlertLevel;
  closeoutStatus: ControlledCodexReportCloseoutStatus;
  decisionStatus: ControlledCodexReportReturnDecisionStatus;
  safeToContinue: boolean;
  recommendedNextPhase: string;
  blockers: readonly string[];
  warnings: readonly string[];
  requiresHumanReview: boolean;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface ControlledCodexReportReturnSummary {
  summaryId: string;
  reportReturnId: string;
  expectedPhase: string;
  expectedMode: AutopilotMode;
  validationStatus: AutopilotReportValidationStatus;
  alertLevel: ControlledCodexReportAlertLevel;
  closeoutStatus: ControlledCodexReportCloseoutStatus;
  blockerCount: number;
  warningCount: number;
  safeToContinue: boolean;
  recommendedNextPhase: string;
  safeSummary: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface ControlledCodexReportReturn {
  input: ControlledCodexReportReturnInput;
  normalizedReport: ControlledCodexNormalizedReport;
  validation: ControlledCodexReportValidation;
  closeout: ControlledCodexReportCloseout;
  decision: ControlledCodexReportReturnDecision;
  summary: ControlledCodexReportReturnSummary;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noCodexInvocation: true;
  noExternalSessionRead: true;
  noOpenClawInvocation: true;
  noSystemCopyBuffer: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemWrites: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
}

const requiredSectionLabels = [
  "phase",
  "files inspected",
  "files modified",
  "summary",
  "safety guarantees",
  "tests/scripts",
  "commands executed",
  "scope check",
  "forbidden grep",
  "commit/push",
  "next recommended phase",
] as const;

const unsafeRuntimeClaimMarkers: readonly string[] = [
  "runtime runner started",
  "project files written from source",
  "external session accessed",
  "codex invocation completed",
  "openclaw operation completed",
  "system copy buffer used",
  "prompt insertion completed",
  "source-driven git action completed",
];

const providerClaimMarkers: readonly string[] = [
  "provider call completed",
  "provider mutation completed",
  "outbound provider action completed",
];

const secretClaimMarkers: readonly string[] = [
  "secret material exposed",
  "api key exposed",
  "vault content exposed",
  "raw private value exposed",
];

const packageWorkflowClaimMarkers: readonly string[] = [
  "package workflow changed",
  "package.json modified",
  "workflow file modified",
  ".github modified",
];

const dashboardClaimMarkers: readonly string[] = [
  "dashboard mutation completed",
  "dashboard file modified",
];

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const normalizeText = (value: string): string => value.trim().toLowerCase();

const pathMatchesPattern = (path: string, pattern: string): boolean => {
  if (pattern.endsWith("/*")) {
    return path.startsWith(pattern.slice(0, -1));
  }

  if (pattern.endsWith("*")) {
    return path.startsWith(pattern.slice(0, -1));
  }

  return path === pattern;
};

const pathMatchesAny = (path: string, patterns: readonly string[]): boolean =>
  patterns.some((pattern) => pathMatchesPattern(path, pattern));

const reportCombinedText = (
  input: ControlledCodexReportReturnInput,
  report: ControlledCodexNormalizedReport,
): string =>
  [
    input.reportText,
    report.phase,
    report.summary,
    report.implementationDetails,
    report.scopeCheck,
    report.forbiddenGrep,
    report.commitPush,
    report.nextRecommendedPhase,
    ...report.filesModified,
    ...report.safetyGuarantees,
    ...report.testsScripts,
    ...report.commandsExecuted,
    ...report.unresolvedIssues,
  ].join("\n").toLowerCase();

const containsAnyMarker = (text: string, markers: readonly string[]): boolean =>
  markers.some((marker) => text.includes(marker));

const sectionValue = (reportText: string, labels: readonly string[]): string => {
  const lines = reportText.split(/\r?\n/);
  const normalizedLabels = labels.map((label) => label.toLowerCase());
  const nextKnownLabel = (line: string): boolean => {
    const lower = line.trim().toLowerCase();
    return requiredSectionLabels.some((label) => lower.startsWith(`${label}:`));
  };

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();
    const matchingLabel = normalizedLabels.find((label) => lower.startsWith(`${label}:`));
    if (matchingLabel !== undefined) {
      const inlineValue = trimmed.slice(matchingLabel.length + 1).trim();
      if (inlineValue.length > 0) {
        return inlineValue;
      }

      const sectionLines: string[] = [];
      for (const sectionLine of lines.slice(index + 1)) {
        if (nextKnownLabel(sectionLine)) {
          break;
        }
        const normalizedLine = sectionLine.trim().replace(/^[-*]\s*/, "");
        if (normalizedLine.length > 0) {
          sectionLines.push(normalizedLine);
        }
      }

      return sectionLines.join("; ");
    }
  }

  return "";
};

const listSection = (reportText: string, labels: readonly string[]): string[] => {
  const value = sectionValue(reportText, labels);
  if (value.length === 0) {
    return [];
  }

  return uniqueStrings(
    value
      .split(/;|,/)
      .map((item) => item.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean),
  );
};

const isForbiddenGrepClean = (value: string): boolean => {
  const normalized = normalizeText(value);
  return (
    normalized.includes("clean") ||
    normalized.includes("no matches") ||
    normalized.includes("no forbidden") ||
    normalized.includes("false positive documented")
  );
};

const commandEvidencePassed = (
  commands: readonly string[],
  tests: readonly string[],
  needle: string,
): boolean => {
  const normalizedNeedle = needle.toLowerCase();
  return [...commands, ...tests].some((value) => {
    const lower = value.toLowerCase();
    return lower.includes(normalizedNeedle) && !lower.includes("failed");
  });
};

const commitPushMatchesMode = (
  expectedMode: AutopilotMode,
  commitPush: string,
): boolean => {
  const normalized = normalizeText(commitPush);
  if (expectedMode === "B") {
    return (
      normalized.includes("no commit") ||
      normalized.includes("no push") ||
      normalized.includes("not requested") ||
      normalized.includes("local only")
    );
  }

  if (expectedMode === "I") {
    const hasCommitEvidence =
      normalized.includes("commit hash") ||
      normalized.includes("commit:") ||
      normalized.includes("committed");
    const hasPushEvidence =
      normalized.includes("push status") ||
      normalized.includes("pushed") ||
      normalized.includes("push: ok");
    const negated = normalized.includes("no commit") || normalized.includes("no push");
    return hasCommitEvidence && hasPushEvidence && !negated;
  }

  return normalized.length > 0;
};

const statusFromFindings = (input: {
  blockers: readonly string[];
  warnings: readonly string[];
}): AutopilotReportValidationStatus => {
  if (input.blockers.some((blocker) => blocker.startsWith("blocked:"))) {
    return "blocked";
  }

  if (input.blockers.some((blocker) => blocker.startsWith("failed:"))) {
    return "failed";
  }

  if (input.blockers.length > 0 || input.warnings.length > 0) {
    return "needs_review";
  }

  return "passed";
};

const alertFromStatus = (
  status: AutopilotReportValidationStatus,
): ControlledCodexReportAlertLevel =>
  status === "blocked" || status === "failed"
    ? "blocking_alert"
    : status === "needs_review"
      ? "mild_alert"
      : "no_alert";

const nextModeFromPhase = (phase: string, fallback: AutopilotMode): AutopilotMode => {
  if (phase.includes("-I") || phase.includes(" IMPLEMENTATION")) {
    return "I";
  }

  if (phase.includes("-B") || phase.includes(" PLAN")) {
    return "B";
  }

  return fallback;
};

export const createControlledCodexNormalizedReport = (
  input: Partial<ControlledCodexNormalizedReport> & {
    reportText?: string;
    fallbackPhase?: string;
    fallbackNextRecommendedPhase?: string;
  },
): ControlledCodexNormalizedReport => {
  const reportText = input.reportText ?? "";

  return {
    phase:
      input.phase ??
      (sectionValue(reportText, ["phase"]) || input.fallbackPhase || ""),
    filesInspected:
      input.filesInspected ?? listSection(reportText, ["files inspected"]),
    filesModified:
      input.filesModified ?? listSection(reportText, ["files modified"]),
    summary:
      input.summary ??
      sectionValue(reportText, ["summary", "implementation summary", "plan summary"]),
    implementationDetails:
      input.implementationDetails ??
      sectionValue(reportText, ["implementation details", "implementation summary", "plan summary"]),
    safetyGuarantees:
      input.safetyGuarantees ?? listSection(reportText, ["safety guarantees"]),
    testsScripts:
      input.testsScripts ?? listSection(reportText, ["tests/scripts", "tests"]),
    commandsExecuted:
      input.commandsExecuted ?? listSection(reportText, ["commands executed"]),
    scopeCheck: input.scopeCheck ?? sectionValue(reportText, ["scope check"]),
    forbiddenGrep: input.forbiddenGrep ?? sectionValue(reportText, ["forbidden grep"]),
    commitPush: input.commitPush ?? sectionValue(reportText, ["commit/push"]),
    nextRecommendedPhase:
      input.nextRecommendedPhase ??
      (sectionValue(reportText, ["next recommended phase"]) ||
        input.fallbackNextRecommendedPhase ||
        ""),
    unresolvedIssues:
      input.unresolvedIssues ?? listSection(reportText, ["unresolved issues"]),
    evidenceRefs: input.evidenceRefs ?? listSection(reportText, ["evidence refs"]),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
};

export const selectControlledReportBlockers = (
  validation: Pick<ControlledCodexReportValidation, "blockers">,
): string[] => uniqueStrings(validation.blockers);

export const selectControlledReportWarnings = (
  validation: Pick<ControlledCodexReportValidation, "warnings">,
): string[] => uniqueStrings(validation.warnings);

export const validateControlledCodexReportReturn = (input: {
  reportReturn: ControlledCodexReportReturnInput;
  normalizedReport: ControlledCodexNormalizedReport;
  allowedFiles?: readonly string[];
  forbiddenFiles?: readonly string[];
  previousDirtyFiles?: readonly string[];
  currentDirtyFiles?: readonly string[];
  stagedFiles?: readonly string[];
  requiredSections?: readonly string[];
}): ControlledCodexReportValidation => {
  const allowedFiles = input.allowedFiles ?? [];
  const forbiddenFiles = input.forbiddenFiles ?? [];
  const previousDirty = new Set(input.previousDirtyFiles ?? []);
  const currentDirtyFiles = input.currentDirtyFiles ?? [];
  const stagedFiles = input.stagedFiles ?? [];
  const combinedText = reportCombinedText(input.reportReturn, input.normalizedReport);
  const requiredSections = input.requiredSections ?? requiredSectionLabels;
  const sectionPresence = new Map<string, boolean>([
    ["phase", input.normalizedReport.phase.length > 0],
    ["files inspected", input.normalizedReport.filesInspected.length > 0],
    ["files modified", input.normalizedReport.filesModified.length > 0],
    ["summary", input.normalizedReport.summary.length > 0],
    ["safety guarantees", input.normalizedReport.safetyGuarantees.length > 0],
    ["tests/scripts", input.normalizedReport.testsScripts.length > 0],
    ["commands executed", input.normalizedReport.commandsExecuted.length > 0],
    ["scope check", input.normalizedReport.scopeCheck.length > 0],
    ["forbidden grep", input.normalizedReport.forbiddenGrep.length > 0],
    ["commit/push", input.normalizedReport.commitPush.length > 0],
    ["next recommended phase", input.normalizedReport.nextRecommendedPhase.length > 0],
  ]);
  const missingSections = requiredSections.filter(
    (section) => sectionPresence.get(section.toLowerCase()) !== true,
  );
  const requiredSectionsPresent = missingSections.length === 0;
  const phaseMatches = input.normalizedReport.phase === input.reportReturn.expectedPhase;
  const modeMatches = commitPushMatchesMode(
    input.reportReturn.expectedMode,
    input.normalizedReport.commitPush,
  );
  const allowedFilesRespected =
    allowedFiles.length === 0 ||
    input.normalizedReport.filesModified.every((file) => pathMatchesAny(file, allowedFiles));
  const forbiddenFilesUntouched = input.normalizedReport.filesModified.every(
    (file) => !pathMatchesAny(file, forbiddenFiles),
  );
  const dirtyOutsideScopeStaged = stagedFiles.some(
    (file) =>
      !previousDirty.has(file) ||
      pathMatchesAny(file, forbiddenFiles) ||
      (allowedFiles.length > 0 && !pathMatchesAny(file, allowedFiles)),
  );
  const dirtyOutsideScopeNotStaged =
    stagedFiles.length === 0 ||
    (!dirtyOutsideScopeStaged &&
      currentDirtyFiles.every((file) => previousDirty.has(file) || input.normalizedReport.filesModified.includes(file)));
  const typecheckPassed = commandEvidencePassed(
    input.normalizedReport.commandsExecuted,
    input.normalizedReport.testsScripts,
    "tsc --noEmit",
  );
  const smokePassed =
    commandEvidencePassed(input.normalizedReport.commandsExecuted, input.normalizedReport.testsScripts, "smoke") ||
    commandEvidencePassed(input.normalizedReport.commandsExecuted, input.normalizedReport.testsScripts, "test");
  const forbiddenGrepClean = isForbiddenGrepClean(input.normalizedReport.forbiddenGrep);
  const commitPushExpected = modeMatches;
  const unsafeRuntimeClaimsAbsent = !containsAnyMarker(combinedText, unsafeRuntimeClaimMarkers);
  const secretsAbsent = !containsAnyMarker(combinedText, secretClaimMarkers);
  const packageWorkflowUntouched =
    !containsAnyMarker(combinedText, packageWorkflowClaimMarkers) &&
    !input.normalizedReport.filesModified.some((file) => file === "package.json" || file.startsWith(".github/"));
  const dashboardUntouched =
    !containsAnyMarker(combinedText, dashboardClaimMarkers) &&
    !input.normalizedReport.filesModified.some((file) => file.startsWith("dashboard/"));
  const providerMutationAbsent = !containsAnyMarker(combinedText, providerClaimMarkers);

  const blockers = uniqueStrings([
    ...(!input.reportReturn.submittedByHuman ? ["blocked:report_not_human_submitted"] : []),
    ...(!phaseMatches ? ["blocked:phase_mismatch"] : []),
    ...(!modeMatches ? ["failed:mode_mismatch"] : []),
    ...(!requiredSectionsPresent ? missingSections.map((section) => `blocked:missing_${section.replace(/\s+/g, "_")}`) : []),
    ...(!allowedFilesRespected ? ["blocked:allowed_file_scope_violation"] : []),
    ...(!forbiddenFilesUntouched ? ["blocked:forbidden_file_touched"] : []),
    ...(!dirtyOutsideScopeNotStaged ? ["blocked:dirty_outside_scope_staged"] : []),
    ...(!forbiddenGrepClean ? ["failed:forbidden_grep_not_clean"] : []),
    ...(!commitPushExpected ? ["failed:commit_push_mismatch"] : []),
    ...(!unsafeRuntimeClaimsAbsent ? ["blocked:unsafe_runtime_claim"] : []),
    ...(!secretsAbsent ? ["blocked:secret_material_claim"] : []),
    ...(!packageWorkflowUntouched ? ["blocked:package_workflow_claim"] : []),
    ...(!dashboardUntouched ? ["blocked:dashboard_claim"] : []),
    ...(!providerMutationAbsent ? ["blocked:provider_claim"] : []),
  ]);
  const warnings = uniqueStrings([
    ...(!typecheckPassed ? ["warning:typecheck_evidence_missing_or_failed"] : []),
    ...(!smokePassed ? ["warning:smoke_evidence_missing_or_failed"] : []),
    ...(input.normalizedReport.unresolvedIssues.length > 0 ? ["warning:unresolved_issues_present"] : []),
  ]);
  const validationStatus = statusFromFindings({ blockers, warnings });
  const alertLevel = alertFromStatus(validationStatus);
  const recommendedFixes = uniqueStrings([
    ...(!input.reportReturn.submittedByHuman ? ["Provide report text through a human-submitted review step."] : []),
    ...(!phaseMatches ? ["Return the report for the expected phase."] : []),
    ...(!modeMatches ? ["Align commit/push evidence with the expected phase mode."] : []),
    ...(!requiredSectionsPresent ? ["Add missing required report sections."] : []),
    ...(!allowedFilesRespected || !forbiddenFilesUntouched ? ["Repair file scope evidence before closeout."] : []),
    ...(!dirtyOutsideScopeNotStaged ? ["Unstage unrelated dirty files before closeout."] : []),
    ...(!forbiddenGrepClean ? ["Resolve or document forbidden grep findings."] : []),
    ...(!typecheckPassed ? ["Add typecheck evidence or accepted skip reason."] : []),
    ...(!smokePassed ? ["Add smoke evidence or accepted skip reason."] : []),
    ...(!unsafeRuntimeClaimsAbsent || !providerMutationAbsent ? ["Remove unsafe runtime or provider claims."] : []),
    ...(!secretsAbsent ? ["Remove secret-material exposure from the report."] : []),
    ...(!packageWorkflowUntouched ? ["Remove unapproved package/workflow mutation from scope."] : []),
    ...(!dashboardUntouched ? ["Remove dashboard mutation from scope."] : []),
  ]);

  return {
    validationId: `${input.reportReturn.reportReturnId}:validation`,
    phaseMatches,
    modeMatches,
    requiredSectionsPresent,
    allowedFilesRespected,
    forbiddenFilesUntouched,
    dirtyOutsideScopeNotStaged,
    typecheckPassed,
    smokePassed,
    forbiddenGrepClean,
    commitPushExpected,
    unsafeRuntimeClaimsAbsent,
    secretsAbsent,
    packageWorkflowUntouched,
    dashboardUntouched,
    providerMutationAbsent,
    validationStatus,
    alertLevel,
    blockers,
    warnings,
    recommendedFixes,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
  };
};

export const createControlledCodexReportCloseout = (input: {
  reportReturn: ControlledCodexReportReturnInput;
  normalizedReport: ControlledCodexNormalizedReport;
  validation: ControlledCodexReportValidation;
  requiredApprovals?: readonly string[];
  limitations?: readonly string[];
}): ControlledCodexReportCloseout => {
  const closeoutStatus: ControlledCodexReportCloseoutStatus =
    input.validation.validationStatus === "blocked"
      ? input.validation.allowedFilesRespected === false ||
          input.validation.forbiddenFilesUntouched === false ||
          input.validation.dirtyOutsideScopeNotStaged === false
        ? "unsafe_scope"
        : "blocked"
      : input.validation.validationStatus === "failed"
        ? input.validation.commitPushExpected === false && input.reportReturn.expectedMode === "I"
          ? input.normalizedReport.commitPush.toLowerCase().includes("commit") &&
              !input.normalizedReport.commitPush.toLowerCase().includes("no commit")
            ? "needs_push"
            : "needs_commit"
          : "needs_retry"
        : input.validation.validationStatus === "needs_review"
          ? "needs_human_review"
          : input.reportReturn.expectedMode === "I"
            ? "closed_and_pushed"
            : "completed_local_only";
  const safeToContinue =
    closeoutStatus === "closed_and_pushed" ||
    closeoutStatus === "completed_local_only";
  const needsRetry = closeoutStatus === "needs_retry";
  const needsHumanReview = closeoutStatus === "needs_human_review";
  const nextRecommendedPhase = safeToContinue
    ? input.normalizedReport.nextRecommendedPhase
    : needsRetry
      ? input.reportReturn.expectedPhase
      : "human_review_required";

  return {
    closeoutId: `${input.reportReturn.reportReturnId}:closeout`,
    reportReturnRef: input.reportReturn.reportReturnId,
    validationRef: input.validation.validationId,
    closeoutStatus,
    safeToContinue,
    needsRetry,
    needsHumanReview,
    nextRecommendedPhase,
    nextRecommendedMode: nextModeFromPhase(nextRecommendedPhase, input.reportReturn.expectedMode),
    memoryProposalAllowed:
      safeToContinue &&
      input.validation.secretsAbsent &&
      input.validation.alertLevel !== "blocking_alert",
    requiredApprovals: uniqueStrings(
      input.requiredApprovals ?? [
        "human_report_review",
        "scope_closeout_review",
        "next_phase_review",
      ],
    ),
    limitations: uniqueStrings(
      input.limitations ?? [
        "human_submitted_report_only",
        "metadata_validation_only",
        "no_external_session_access",
        "no_memory_persistence",
      ],
    ),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noMemoryPersistence: true,
  };
};

export const evaluateControlledCodexReportReturnDecision = (input: {
  reportReturn: ControlledCodexReportReturnInput;
  validation: ControlledCodexReportValidation;
  closeout: ControlledCodexReportCloseout;
}): ControlledCodexReportReturnDecision => {
  const decisionStatus: ControlledCodexReportReturnDecisionStatus =
    input.closeout.closeoutStatus === "blocked" ||
    input.closeout.closeoutStatus === "unsafe_scope"
      ? "blocked"
      : input.closeout.needsRetry
        ? "retry"
        : input.closeout.needsHumanReview ||
            input.validation.validationStatus === "needs_review"
          ? "human_review"
          : "continue";

  return {
    decisionId: `${input.reportReturn.reportReturnId}:decision`,
    reportReturnRef: input.reportReturn.reportReturnId,
    validationStatus: input.validation.validationStatus,
    alertLevel: input.validation.alertLevel,
    closeoutStatus: input.closeout.closeoutStatus,
    decisionStatus,
    safeToContinue: input.closeout.safeToContinue && decisionStatus === "continue",
    recommendedNextPhase: input.closeout.nextRecommendedPhase,
    blockers: selectControlledReportBlockers(input.validation),
    warnings: selectControlledReportWarnings(input.validation),
    requiresHumanReview:
      decisionStatus !== "continue" || input.closeout.requiredApprovals.length > 0,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
  };
};

export const summarizeControlledCodexReportReturn = (input: {
  reportReturn: ControlledCodexReportReturnInput;
  validation: ControlledCodexReportValidation;
  closeout: ControlledCodexReportCloseout;
  decision: ControlledCodexReportReturnDecision;
}): ControlledCodexReportReturnSummary => ({
  summaryId: `${input.reportReturn.reportReturnId}:summary`,
  reportReturnId: input.reportReturn.reportReturnId,
  expectedPhase: input.reportReturn.expectedPhase,
  expectedMode: input.reportReturn.expectedMode,
  validationStatus: input.validation.validationStatus,
  alertLevel: input.validation.alertLevel,
  closeoutStatus: input.closeout.closeoutStatus,
  blockerCount: input.validation.blockers.length,
  warningCount: input.validation.warnings.length,
  safeToContinue: input.decision.safeToContinue,
  recommendedNextPhase: input.decision.recommendedNextPhase,
  safeSummary: input.decision.safeToContinue
    ? "Controlled report return metadata passed and closeout can continue."
    : "Controlled report return metadata requires retry, review, or blocking resolution.",
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecution: true,
});

export const createControlledCodexReportReturn = (input: {
  reportReturn: ControlledCodexReportReturnInput;
  normalizedReport?: ControlledCodexNormalizedReport;
  allowedFiles?: readonly string[];
  forbiddenFiles?: readonly string[];
  previousDirtyFiles?: readonly string[];
  currentDirtyFiles?: readonly string[];
  stagedFiles?: readonly string[];
  requiredSections?: readonly string[];
}): ControlledCodexReportReturn => {
  const normalizedReport =
    input.normalizedReport ??
    createControlledCodexNormalizedReport({
      reportText: input.reportReturn.reportText,
      fallbackPhase: input.reportReturn.expectedPhase,
    });
  const validationInput: Parameters<typeof validateControlledCodexReportReturn>[0] = {
    reportReturn: input.reportReturn,
    normalizedReport,
  };

  if (input.allowedFiles !== undefined) {
    validationInput.allowedFiles = input.allowedFiles;
  }

  if (input.forbiddenFiles !== undefined) {
    validationInput.forbiddenFiles = input.forbiddenFiles;
  }

  if (input.previousDirtyFiles !== undefined) {
    validationInput.previousDirtyFiles = input.previousDirtyFiles;
  }

  if (input.currentDirtyFiles !== undefined) {
    validationInput.currentDirtyFiles = input.currentDirtyFiles;
  }

  if (input.stagedFiles !== undefined) {
    validationInput.stagedFiles = input.stagedFiles;
  }

  if (input.requiredSections !== undefined) {
    validationInput.requiredSections = input.requiredSections;
  }

  const validation = validateControlledCodexReportReturn(validationInput);
  const closeout = createControlledCodexReportCloseout({
    reportReturn: input.reportReturn,
    normalizedReport,
    validation,
  });
  const decision = evaluateControlledCodexReportReturnDecision({
    reportReturn: input.reportReturn,
    validation,
    closeout,
  });
  const summary = summarizeControlledCodexReportReturn({
    reportReturn: input.reportReturn,
    validation,
    closeout,
    decision,
  });

  return {
    input: input.reportReturn,
    normalizedReport,
    validation,
    closeout,
    decision,
    summary,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noCodexInvocation: true,
    noExternalSessionRead: true,
    noOpenClawInvocation: true,
    noSystemCopyBuffer: true,
    noProviderCalls: true,
    noNetwork: true,
    noFilesystemWrites: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
  };
};
