import { createHash } from "crypto";
import type {
  QualityBudgetStatus,
  QualityDashboardBoundaries,
  QualityDashboardData,
  QualityDashboardProject,
  QualityEvalSummary,
  QualityOverallStatus,
  QualityPrivacyStatus,
  QualityRiskSummary,
} from "./types.js";

export const QUALITY_SNAPSHOT_SCHEMA_VERSION = "1.0";

export interface QualitySnapshot {
  snapshotId: string;
  createdAt: string;
  schemaVersion: typeof QUALITY_SNAPSHOT_SCHEMA_VERSION;
  project: QualityDashboardProject;
  phase: string | null;
  commit: string | null;
  sourceDashboardId: string;
  sourceDashboardCreatedAt: string;
  sourceDashboardSchemaVersion: string;
  overallStatus: QualityOverallStatus;
  evalSummary: QualityEvalSummary;
  riskSummary: QualityRiskSummary;
  privacyStatus: QualityPrivacyStatus;
  budgetStatus: QualityBudgetStatus;
  failingIds: string[];
  warningIds: string[];
  fingerprint: string;
  advisoryOnly: true;
  boundaries: QualityDashboardBoundaries;
}

export interface QualitySnapshotComparison {
  comparisonId: string;
  createdAt: string;
  schemaVersion: typeof QUALITY_SNAPSHOT_SCHEMA_VERSION;
  current: QualitySnapshot;
  baseline: QualitySnapshot | null;
  baselineLoaded: boolean;
  baselineWarning?: string;
  statusChanged: boolean;
  previousOverallStatus: QualityOverallStatus | null;
  currentOverallStatus: QualityOverallStatus;
  addedFailingIds: string[];
  removedFailingIds: string[];
  addedWarningIds: string[];
  removedWarningIds: string[];
  privacyStatusChanged: boolean;
  budgetStatusChanged: boolean;
  riskDecisionChanged: boolean;
  riskLevelChanged: boolean;
  fingerprintChanged: boolean;
  schemaWarnings: string[];
  advisoryRegression: boolean;
  advisoryOnly: true;
  boundaries: QualityDashboardBoundaries;
}

export interface BuildQualitySnapshotInput {
  dashboard: QualityDashboardData;
  phase?: string;
  commit?: string;
}

export interface CompareQualitySnapshotsInput {
  current: QualitySnapshot;
  baseline?: QualitySnapshot | null;
}

function sorted(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))].sort();
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, stableValue(entry)]),
    );
  }

  return value;
}

function stableJson(value: unknown): string {
  return JSON.stringify(stableValue(value));
}

function hashId(prefix: string, value: unknown): string {
  return `${prefix}_${createHash("sha256").update(stableJson(value)).digest("hex").slice(0, 16)}`;
}

function cloneEvalSummary(summary: QualityEvalSummary): QualityEvalSummary {
  return {
    ...summary,
    failingIds: sorted(summary.failingIds),
    warningIds: sorted(summary.warningIds),
  };
}

function cloneRiskSummary(summary: QualityRiskSummary): QualityRiskSummary {
  return {
    ...summary,
    reasonCodes: sorted(summary.reasonCodes),
    warnings: sorted(summary.warnings),
  };
}

function fingerprintPayload(input: {
  dashboard: QualityDashboardData;
  evalSummary: QualityEvalSummary;
  riskSummary: QualityRiskSummary;
  failingIds: string[];
  warningIds: string[];
}) {
  return {
    schemaVersion: QUALITY_SNAPSHOT_SCHEMA_VERSION,
    project: {
      projectId: input.dashboard.project.projectId,
      projectRootHash: input.dashboard.project.projectRootHash,
    },
    overallStatus: input.dashboard.overallStatus,
    privacyStatus: input.dashboard.privacyStatus,
    budgetStatus: input.dashboard.budgetStatus,
    evalSummary: input.evalSummary,
    riskSummary: {
      riskLevel: input.riskSummary.riskLevel,
      recommendedDecision: input.riskSummary.recommendedDecision,
      requiredHumanReview: input.riskSummary.requiredHumanReview,
      requiresExplicitApproval: input.riskSummary.requiresExplicitApproval,
      reasonCodes: input.riskSummary.reasonCodes,
    },
    failingIds: input.failingIds,
    warningIds: input.warningIds,
  };
}

export function buildQualitySnapshot(input: BuildQualitySnapshotInput): QualitySnapshot {
  const createdAt = new Date().toISOString();
  const evalSummary = cloneEvalSummary(input.dashboard.evalSummary);
  const riskSummary = cloneRiskSummary(input.dashboard.riskSummary);
  const failingIds = sorted(input.dashboard.failingIds);
  const warningIds = sorted(input.dashboard.warningIds);
  const fingerprint = hashId(
    "qfp",
    fingerprintPayload({
      dashboard: input.dashboard,
      evalSummary,
      riskSummary,
      failingIds,
      warningIds,
    }),
  );

  return {
    snapshotId: hashId("qsnap", {
      createdAt,
      sourceDashboardId: input.dashboard.dashboardId,
      fingerprint,
    }),
    createdAt,
    schemaVersion: QUALITY_SNAPSHOT_SCHEMA_VERSION,
    project: { ...input.dashboard.project },
    phase: input.phase?.trim() ? input.phase.trim() : null,
    commit: input.commit?.trim() ? input.commit.trim() : null,
    sourceDashboardId: input.dashboard.dashboardId,
    sourceDashboardCreatedAt: input.dashboard.createdAt,
    sourceDashboardSchemaVersion: input.dashboard.schemaVersion,
    overallStatus: input.dashboard.overallStatus,
    evalSummary,
    riskSummary,
    privacyStatus: input.dashboard.privacyStatus,
    budgetStatus: input.dashboard.budgetStatus,
    failingIds,
    warningIds,
    fingerprint,
    advisoryOnly: true,
    boundaries: { ...input.dashboard.boundaries },
  };
}

function difference(current: string[], baseline: string[]): string[] {
  const baselineSet = new Set(baseline);
  return current.filter((id) => !baselineSet.has(id)).sort();
}

function statusRank(status: QualityOverallStatus): number {
  return { pass: 0, warn: 1, review: 2, blocked: 3 }[status];
}

function privacyRank(status: QualityPrivacyStatus): number {
  return { clear: 0, redacted: 1, unsafe: 2 }[status];
}

function budgetRank(status: QualityBudgetStatus): number {
  return { ok: 0, warn: 1, block: 2 }[status];
}

function riskDecisionRank(decision: QualityRiskSummary["recommendedDecision"]): number {
  return {
    proceed: 0,
    proceed_with_warnings: 1,
    pause_for_review: 2,
    require_explicit_approval: 3,
    block_until_fixed: 4,
  }[decision];
}

function riskLevelRank(level: QualityRiskSummary["riskLevel"]): number {
  return { low: 0, medium: 1, high: 2, critical: 3 }[level];
}

function schemaWarnings(current: QualitySnapshot, baseline: QualitySnapshot | null): string[] {
  const warnings: string[] = [];
  if (current.schemaVersion !== QUALITY_SNAPSHOT_SCHEMA_VERSION) {
    warnings.push(`Current snapshot schema ${current.schemaVersion} differs from ${QUALITY_SNAPSHOT_SCHEMA_VERSION}.`);
  }
  if (baseline && baseline.schemaVersion !== QUALITY_SNAPSHOT_SCHEMA_VERSION) {
    warnings.push(`Baseline snapshot schema ${baseline.schemaVersion} differs from ${QUALITY_SNAPSHOT_SCHEMA_VERSION}.`);
  }
  return warnings;
}

export function compareQualitySnapshots(
  input: CompareQualitySnapshotsInput,
): QualitySnapshotComparison {
  const createdAt = new Date().toISOString();
  const baseline = input.baseline ?? null;
  const addedFailingIds = baseline ? difference(input.current.failingIds, baseline.failingIds) : [];
  const removedFailingIds = baseline ? difference(baseline.failingIds, input.current.failingIds) : [];
  const addedWarningIds = baseline ? difference(input.current.warningIds, baseline.warningIds) : [];
  const removedWarningIds = baseline ? difference(baseline.warningIds, input.current.warningIds) : [];
  const statusChanged = baseline
    ? input.current.overallStatus !== baseline.overallStatus
    : false;
  const privacyStatusChanged = baseline
    ? input.current.privacyStatus !== baseline.privacyStatus
    : false;
  const budgetStatusChanged = baseline
    ? input.current.budgetStatus !== baseline.budgetStatus
    : false;
  const riskDecisionChanged = baseline
    ? input.current.riskSummary.recommendedDecision !== baseline.riskSummary.recommendedDecision
    : false;
  const riskLevelChanged = baseline
    ? input.current.riskSummary.riskLevel !== baseline.riskSummary.riskLevel
    : false;
  const fingerprintChanged = baseline ? input.current.fingerprint !== baseline.fingerprint : false;
  const worsened =
    !!baseline &&
    (addedFailingIds.length > 0 ||
      statusRank(input.current.overallStatus) > statusRank(baseline.overallStatus) ||
      privacyRank(input.current.privacyStatus) > privacyRank(baseline.privacyStatus) ||
      budgetRank(input.current.budgetStatus) > budgetRank(baseline.budgetStatus) ||
      riskDecisionRank(input.current.riskSummary.recommendedDecision) >
        riskDecisionRank(baseline.riskSummary.recommendedDecision) ||
      riskLevelRank(input.current.riskSummary.riskLevel) >
        riskLevelRank(baseline.riskSummary.riskLevel));

  return {
    comparisonId: hashId("qcmp", {
      createdAt,
      currentSnapshotId: input.current.snapshotId,
      baselineSnapshotId: baseline?.snapshotId ?? null,
      currentFingerprint: input.current.fingerprint,
      baselineFingerprint: baseline?.fingerprint ?? null,
    }),
    createdAt,
    schemaVersion: QUALITY_SNAPSHOT_SCHEMA_VERSION,
    current: input.current,
    baseline,
    baselineLoaded: baseline !== null,
    ...(baseline ? {} : { baselineWarning: "No baseline snapshot supplied." }),
    statusChanged,
    previousOverallStatus: baseline?.overallStatus ?? null,
    currentOverallStatus: input.current.overallStatus,
    addedFailingIds,
    removedFailingIds,
    addedWarningIds,
    removedWarningIds,
    privacyStatusChanged,
    budgetStatusChanged,
    riskDecisionChanged,
    riskLevelChanged,
    fingerprintChanged,
    schemaWarnings: schemaWarnings(input.current, baseline),
    advisoryRegression: worsened,
    advisoryOnly: true,
    boundaries: { ...input.current.boundaries },
  };
}
