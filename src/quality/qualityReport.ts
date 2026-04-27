import { createHash } from "crypto";
import type { EvalRegressionReport } from "../evals/types.js";
import type { RiskApprovalSignal } from "../risk/types.js";
import type {
  QualityBudgetStatus,
  QualityDashboardData,
  QualityDashboardSourceSummary,
  QualityOverallStatus,
  QualityPrivacyStatus,
  QualityTrendSummary,
} from "./types.js";
import { QUALITY_DASHBOARD_SCHEMA_VERSION } from "./types.js";

export interface BuildQualityDashboardDataInput {
  evalReport: EvalRegressionReport;
  riskSignal: RiskApprovalSignal;
  sources: QualityDashboardSourceSummary[];
}

function dashboardId(createdAt: string, evalId: string, riskId: string): string {
  return `quality_${createHash("sha256")
    .update(`${createdAt}:${evalId}:${riskId}`)
    .digest("hex")
    .slice(0, 16)}`;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))].sort();
}

function privacyStatus(input: {
  evalReport: EvalRegressionReport;
  riskSignal: RiskApprovalSignal;
}): QualityPrivacyStatus {
  if (
    input.evalReport.privacy.containsUnsafeOutput ||
    input.riskSignal.sensitiveDataFlags.unsafe ||
    input.riskSignal.sensitiveDataFlags.containsSecrets ||
    input.riskSignal.sensitiveDataFlags.containsRawBody ||
    input.riskSignal.sensitiveDataFlags.containsFileContent
  ) {
    return "unsafe";
  }

  if (
    input.evalReport.privacy.redaction.removedKinds.length > 0 ||
    input.riskSignal.sensitiveDataFlags.removedKinds.length > 0 ||
    input.riskSignal.sensitiveDataFlags.containsRawIdentity
  ) {
    return "redacted";
  }

  return "clear";
}

function budgetStatus(evalReport: EvalRegressionReport): QualityBudgetStatus {
  if (evalReport.qualityDashboard.budgetBlocks > 0) {
    return "block";
  }
  if (evalReport.qualityDashboard.compressionWarnings > 0) {
    return "warn";
  }
  return "ok";
}

function evalStatus(evalReport: EvalRegressionReport): "pass" | "warn" | "fail" {
  if (evalReport.summary.failed > 0 || evalReport.qualityDashboard.failingIds.length > 0) {
    return "fail";
  }
  if (
    evalReport.summary.warned > 0 ||
    evalReport.qualityDashboard.warningIds.length > 0 ||
    evalReport.qualityDashboard.compressionWarnings > 0
  ) {
    return "warn";
  }
  return evalReport.summary.status;
}

function overallStatus(input: {
  evalReport: EvalRegressionReport;
  riskSignal: RiskApprovalSignal;
  privacy: QualityPrivacyStatus;
}): QualityOverallStatus {
  if (
    input.riskSignal.recommendedDecision === "block_until_fixed" ||
    input.privacy === "unsafe"
  ) {
    return "blocked";
  }
  if (
    evalStatus(input.evalReport) === "fail" ||
    input.riskSignal.recommendedDecision === "pause_for_review" ||
    input.riskSignal.recommendedDecision === "require_explicit_approval"
  ) {
    return "review";
  }
  if (
    evalStatus(input.evalReport) === "warn" ||
    input.riskSignal.recommendedDecision === "proceed_with_warnings" ||
    input.riskSignal.warnings.length > 0
  ) {
    return "warn";
  }
  return "pass";
}

function trendSummary(evalReport: EvalRegressionReport): QualityTrendSummary {
  const currentFailing = new Set(evalReport.qualityDashboard.failingIds);
  const currentWarnings = new Set(evalReport.qualityDashboard.warningIds);
  const added = evalReport.changedResults.addedFailingOrWarningIds;
  const removed = evalReport.changedResults.removedFailingOrWarningIds;

  return {
    addedFailingIds: added.filter((id) => currentFailing.has(id)).sort(),
    removedFailingIds: removed.filter((id) => !currentWarnings.has(id)).sort(),
    addedWarningIds: added.filter((id) => currentWarnings.has(id)).sort(),
    removedWarningIds: removed.filter((id) => !currentFailing.has(id)).sort(),
    changedStatusIds: evalReport.changedResults.changedStatusIds.slice().sort(),
    baselineLoaded: evalReport.baseline?.loaded ?? null,
    ...(evalReport.baseline?.warning
      ? { baselineWarning: evalReport.baseline.warning }
      : {}),
  };
}

function recommendedNextActions(input: {
  evalReport: EvalRegressionReport;
  riskSignal: RiskApprovalSignal;
  privacy: QualityPrivacyStatus;
  budget: QualityBudgetStatus;
}): string[] {
  const actions: string[] = [];

  if (input.evalReport.qualityDashboard.failingIds.length > 0) {
    actions.push("Review failing eval ids before risky changes.");
  }
  if (input.evalReport.qualityDashboard.warningIds.length > 0) {
    actions.push("Inspect eval warning ids before relying on this report.");
  }
  if (input.riskSignal.riskReasons.length > 0) {
    actions.push("Inspect risk reason codes before execution.");
  }
  if (input.privacy === "unsafe") {
    actions.push("Address privacy unsafe output before sharing artifacts.");
  }
  if (input.budget === "block") {
    actions.push("Review budget blocks before provider-backed work.");
  } else if (input.budget === "warn") {
    actions.push("Review compression and budget warnings before adding context.");
  }
  if (actions.length === 0) {
    actions.push("Continue with normal verification before any risky change.");
  }

  return actions.slice(0, 6);
}

export function buildQualityDashboardData(
  input: BuildQualityDashboardDataInput,
): QualityDashboardData {
  const createdAt = new Date().toISOString();
  const privacy = privacyStatus(input);
  const budget = budgetStatus(input.evalReport);
  const evalSummaryStatus = evalStatus(input.evalReport);
  const overall = overallStatus({
    evalReport: input.evalReport,
    riskSignal: input.riskSignal,
    privacy,
  });
  const failingIds = uniqueSorted([
    ...input.evalReport.qualityDashboard.failingIds,
    ...(input.riskSignal.recommendedDecision === "block_until_fixed"
      ? input.riskSignal.riskReasons
      : []),
  ]);
  const warningIds = uniqueSorted([
    ...input.evalReport.qualityDashboard.warningIds,
    ...input.riskSignal.warnings,
    ...(input.riskSignal.recommendedDecision === "proceed_with_warnings"
      ? input.riskSignal.riskReasons
      : []),
  ]);

  return {
    dashboardId: dashboardId(createdAt, input.evalReport.reportId, input.riskSignal.signalId),
    createdAt,
    schemaVersion: QUALITY_DASHBOARD_SCHEMA_VERSION,
    project: {
      projectId: input.evalReport.project.projectId ?? input.riskSignal.project.projectId,
      projectName: input.evalReport.project.projectName ?? input.riskSignal.project.projectName,
      projectRootHash:
        input.evalReport.project.projectRootHash ?? input.riskSignal.project.projectRootHash,
    },
    sources: input.sources.map((source) => ({ ...source })),
    overallStatus: overall,
    evalSummary: {
      status: evalSummaryStatus,
      total: input.evalReport.summary.total,
      passed: input.evalReport.summary.passed,
      warned: input.evalReport.summary.warned,
      failed: input.evalReport.summary.failed,
      routerFailures: input.evalReport.qualityDashboard.routerFailures,
      promptShapeFailures: input.evalReport.qualityDashboard.promptShapeFailures,
      budgetBlocks: input.evalReport.qualityDashboard.budgetBlocks,
      compressionWarnings: input.evalReport.qualityDashboard.compressionWarnings,
      failingIds: input.evalReport.qualityDashboard.failingIds.slice().sort(),
      warningIds: input.evalReport.qualityDashboard.warningIds.slice().sort(),
    },
    riskSummary: {
      riskLevel: input.riskSignal.riskLevel,
      recommendedDecision: input.riskSignal.recommendedDecision,
      requiredHumanReview: input.riskSignal.requiredHumanReview,
      requiresExplicitApproval: input.riskSignal.requiresExplicitApproval,
      reasonCodes: input.riskSignal.riskReasons.slice().sort(),
      warnings: input.riskSignal.warnings.slice().sort(),
    },
    failingIds,
    warningIds,
    trend: trendSummary(input.evalReport),
    privacyStatus: privacy,
    budgetStatus: budget,
    recommendedNextActions: recommendedNextActions({
      evalReport: input.evalReport,
      riskSignal: input.riskSignal,
      privacy,
      budget,
    }),
    advisoryOnly: true,
    boundaries: {
      advisoryOnly: true,
      noProviderCalls: true,
      noNetwork: true,
      noRuntimeGateWiring: true,
      noApprovalExecution: true,
      noProposalCreation: true,
      noDispatch: true,
      noStoreMutation: true,
      noDashboardUi: true,
    },
  };
}
