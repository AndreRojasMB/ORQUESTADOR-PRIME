import type { EvalStatus } from "../evals/types.js";
import type { RiskDecision, RiskLevel } from "../risk/types.js";

export const QUALITY_DASHBOARD_SCHEMA_VERSION = "1.0";

export type QualityOverallStatus = "pass" | "warn" | "review" | "blocked";

export type QualityPrivacyStatus = "clear" | "redacted" | "unsafe";

export type QualityBudgetStatus = "ok" | "warn" | "block";

export interface QualityDashboardProject {
  projectId: string | null;
  projectName: string | null;
  projectRootHash: string | null;
}

export interface QualityDashboardSourceSummary {
  type: "eval-report" | "risk-signal";
  id?: string;
  path?: string;
  generated: boolean;
  createdAt?: string;
  schemaVersion?: string;
  suiteVersion?: string;
}

export interface QualityEvalSummary {
  status: EvalStatus;
  total: number;
  passed: number;
  warned: number;
  failed: number;
  routerFailures: number;
  promptShapeFailures: number;
  budgetBlocks: number;
  compressionWarnings: number;
  failingIds: string[];
  warningIds: string[];
}

export interface QualityRiskSummary {
  riskLevel: RiskLevel;
  recommendedDecision: RiskDecision;
  requiredHumanReview: boolean;
  requiresExplicitApproval: boolean;
  reasonCodes: string[];
  warnings: string[];
}

export interface QualityTrendSummary {
  addedFailingIds: string[];
  removedFailingIds: string[];
  addedWarningIds: string[];
  removedWarningIds: string[];
  changedStatusIds: string[];
  baselineLoaded: boolean | null;
  baselineWarning?: string;
}

export interface QualityDashboardBoundaries {
  advisoryOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noRuntimeGateWiring: true;
  noApprovalExecution: true;
  noProposalCreation: true;
  noDispatch: true;
  noStoreMutation: true;
  noDashboardUi: true;
}

export interface QualityDashboardData {
  dashboardId: string;
  createdAt: string;
  schemaVersion: typeof QUALITY_DASHBOARD_SCHEMA_VERSION;
  project: QualityDashboardProject;
  sources: QualityDashboardSourceSummary[];
  overallStatus: QualityOverallStatus;
  evalSummary: QualityEvalSummary;
  riskSummary: QualityRiskSummary;
  failingIds: string[];
  warningIds: string[];
  trend: QualityTrendSummary;
  privacyStatus: QualityPrivacyStatus;
  budgetStatus: QualityBudgetStatus;
  recommendedNextActions: string[];
  advisoryOnly: true;
  boundaries: QualityDashboardBoundaries;
}
