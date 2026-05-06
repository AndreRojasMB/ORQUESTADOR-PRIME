import type {
  PMAllowedAutonomyLevel,
  PMAutonomyLevel,
  PMBoundarySet,
  PMDecisionMode,
  PMFindingSeverity,
  PMRiskSurface,
  PMRiskTier,
} from "./types.js";

export const pmFoundationBoundaries: PMBoundarySet = {
  advisoryOnly: true,
  sourceOnly: true,
  noProviderCalls: true,
  noNetwork: true,
  noFilesystemReads: true,
  noFilesystemWrites: true,
  noCommandExecution: true,
  noRuntimeExecution: true,
  noDashboardImplementation: true,
  noScaffoldGeneration: true,
  noConnectorImplementation: true,
  noCredentialVaultImplementation: true,
  noPackageWorkflowChanges: true,
  noBaselineArtifactMutation: true,
  noActionProposalApprovalExecution: true,
  noJobsExecution: true,
  noPersistence: true,
  noCiChanges: true,
  noDbSchemas: true,
  noSql: true,
  noProductionReadinessClaims: true,
  noFullyAutonomousClaims: true,
  noSecurityComplianceGuarantees: true,
};

export const pmAllowedAutonomyLevels101To120 = [
  "L0_observe_only",
  "L1_report_only",
  "L2_plan_only",
  "L3_propose_only",
] as const satisfies readonly PMAllowedAutonomyLevel[];

export const pmDeniedAutonomyLevels101To120 = [
  "L4_prepare_review_only",
  "L5_approval_gated_execution",
  "L6_autonomous_execution",
] as const satisfies readonly PMAutonomyLevel[];

export const pmRiskSurfaces = [
  "runtime",
  "dashboard",
  "scaffold",
  "connector",
  "credential",
  "automation",
  "action_approval",
  "jobs",
  "ci_baseline",
  "release",
  "security_policy",
  "package_workflow",
  "database_schema",
  "deployment",
  "provider",
  "memory_learning",
  "store",
  "unknown",
] as const satisfies readonly PMRiskSurface[];

export const pmRiskTiers = [
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly PMRiskTier[];

export const pmDecisionModes = [
  "observe_only",
  "report_only",
  "plan_only",
  "propose_only",
] as const satisfies readonly PMDecisionMode[];

export const pmFindingSeverities = [
  "info",
  "warn",
  "fail",
] as const satisfies readonly PMFindingSeverity[];
