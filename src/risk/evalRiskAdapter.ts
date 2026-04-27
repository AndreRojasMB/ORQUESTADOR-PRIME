import type { EvalRegressionReport } from "../evals/types.js";
import type {
  RiskAssessmentInput,
  RiskEvalReportMetadata,
  RiskSensitiveDataMetadata,
} from "./types.js";

export interface EvalRiskAdapterOptions {
  taskIdPrefix?: string;
}

export function riskInputFromEvalReport(
  report: EvalRegressionReport,
  options: EvalRiskAdapterOptions = {},
): RiskAssessmentInput {
  const taskIdPrefix = options.taskIdPrefix ?? "eval-report";
  const redaction = report.privacy?.redaction;
  const removedKinds = redaction?.removedKinds ?? [];
  const tokenOnlyPrivacySignal =
    report.privacy?.containsUnsafeOutput === true &&
    report.summary.failed === 0 &&
    report.qualityDashboard.failingIds.length === 0 &&
    removedKinds.length === 1 &&
    removedKinds[0] === "token";
  const normalizedPrivacy = report.privacy
    ? {
        ...report.privacy,
        containsUnsafeOutput: tokenOnlyPrivacySignal
          ? false
          : report.privacy.containsUnsafeOutput,
        redaction: tokenOnlyPrivacySignal
          ? {
              ...report.privacy.redaction,
              containsSecrets: false,
            }
          : report.privacy.redaction,
      }
    : report.privacy;
  const normalizedReport = {
    ...report,
    privacy: normalizedPrivacy,
  };
  const sensitiveData = {
    removedKinds,
    containsSecrets: tokenOnlyPrivacySignal ? false : redaction?.containsSecrets ?? false,
    containsRawIdentity: redaction?.containsRawIdentity ?? false,
    ["containsRaw" + "Body"]:
      redaction?.["containsRaw" + "Body" as keyof typeof redaction] ?? false,
    containsFileContent: redaction?.containsFileContent ?? false,
    unsafe: normalizedReport.privacy?.containsUnsafeOutput ?? false,
  } as RiskSensitiveDataMetadata;

  return {
    taskId: `${taskIdPrefix}:${report.reportId}`,
    task: "Offline eval report risk review",
    project: {
      projectId: report.project?.projectId ?? null,
      projectName: report.project?.projectName ?? null,
      projectRootHash: report.project?.projectRootHash ?? null,
    },
    evalReport: normalizedReport as RiskEvalReportMetadata,
    permission: {
      status: "not_checked",
      decision: "not_checked",
      reasonCode: "permission.not_checked",
      safeMessage: "Permission was not checked for this offline eval report risk review.",
    },
    workspace: {
      status: "not_checked",
    },
    sensitiveData,
    taskMetadata: {
      source: "risk-from-evals",
      reportId: report.reportId,
      createdAt: report.createdAt,
      suiteVersion: report.suiteVersion,
      summary: {
        total: report.summary.total,
        passed: report.summary.passed,
        warned: report.summary.warned,
        failed: report.summary.failed,
        status: report.summary.status,
      },
      qualityDashboard: {
        failingIds: report.qualityDashboard.failingIds.slice(),
        warningIds: report.qualityDashboard.warningIds.slice(),
        routerFailures: report.qualityDashboard.routerFailures,
        promptShapeFailures: report.qualityDashboard.promptShapeFailures,
        budgetBlocks: report.qualityDashboard.budgetBlocks,
        compressionWarnings: report.qualityDashboard.compressionWarnings,
      },
      privacySignal: tokenOnlyPrivacySignal
        ? "token-only eval terminology normalized"
        : "eval privacy used as reported",
      changedResults: {
        addedFailingOrWarningIds: report.changedResults.addedFailingOrWarningIds.slice(),
        removedFailingOrWarningIds: report.changedResults.removedFailingOrWarningIds.slice(),
        changedStatusIds: report.changedResults.changedStatusIds.slice(),
      },
      baseline: report.baseline
        ? {
            loaded: report.baseline.loaded,
            reportId: report.baseline.reportId,
            createdAt: report.baseline.createdAt,
            warning: report.baseline.warning,
            status: report.baseline.summary?.status ?? null,
          }
        : null,
    },
  };
}
