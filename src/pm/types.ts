export type PMSchemaVersion = "1.0";

export type ProjectId = string;

export type ProjectPhaseRef = string;

export type PMAutonomyLevel =
  | "L0_observe_only"
  | "L1_report_only"
  | "L2_plan_only"
  | "L3_propose_only"
  | "L4_prepare_review_only"
  | "L5_approval_gated_execution"
  | "L6_autonomous_execution";

export type PMAllowedAutonomyLevel =
  | "L0_observe_only"
  | "L1_report_only"
  | "L2_plan_only"
  | "L3_propose_only";

export interface PMBoundarySet {
  advisoryOnly: true;
  sourceOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemReads: true;
  noFilesystemWrites: true;
  noCommandExecution: true;
  noRuntimeExecution: true;
  noDashboardImplementation: true;
  noScaffoldGeneration: true;
  noConnectorImplementation: true;
  noCredentialVaultImplementation: true;
  noPackageWorkflowChanges: true;
  noBaselineArtifactMutation: true;
  noActionProposalApprovalExecution: true;
  noJobsExecution: true;
  noPersistence: true;
  noCiChanges: true;
  noDbSchemas: true;
  noSql: true;
  noProductionReadinessClaims: true;
  noFullyAutonomousClaims: true;
  noSecurityComplianceGuarantees: true;
}

export type PMRiskSurface =
  | "runtime"
  | "dashboard"
  | "scaffold"
  | "connector"
  | "credential"
  | "automation"
  | "action_approval"
  | "jobs"
  | "ci_baseline"
  | "release"
  | "security_policy"
  | "package_workflow"
  | "database_schema"
  | "deployment"
  | "provider"
  | "memory_learning"
  | "store"
  | "unknown";

export type PMRiskTier = "low" | "medium" | "high" | "critical";

export type PMStatus =
  | "not_started"
  | "observed"
  | "reported"
  | "planned"
  | "proposed"
  | "blocked"
  | "deferred";

export type PMDecisionMode =
  | "observe_only"
  | "report_only"
  | "plan_only"
  | "propose_only";

export type PMEvidenceReferenceType =
  | "doc"
  | "source"
  | "roadmap"
  | "policy"
  | "review"
  | "status";

export interface PMEvidenceReference {
  evidenceId: string;
  label: string;
  reference: string;
  referenceType: PMEvidenceReferenceType;
  safeSummary: string;
  metadataOnly: true;
  noFileRead: true;
}

export interface PMApprovalPlanningReference {
  approvalPlanId: string;
  label: string;
  safeSummary: string;
  riskTier: PMRiskTier;
  riskSurfaces: PMRiskSurface[];
  requiredReviewerRole: string;
  requiredBefore: string;
  metadataOnly: true;
  noApprovalExecution: true;
}

export type PMFindingSeverity = "info" | "warn" | "fail";

export interface PMValidationFinding {
  id: string;
  severity: PMFindingSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  phaseRef?: ProjectPhaseRef;
  riskSurface?: PMRiskSurface;
  metadata?: Record<string, string | number | boolean>;
}

export interface PMValidationResult {
  validationId: string;
  schemaVersion: PMSchemaVersion;
  valid: boolean;
  status: "pass" | "warn" | "fail";
  warnings: PMValidationFinding[];
  errors: PMValidationFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: PMBoundarySet;
}

export interface PMRecommendedNextStep {
  nextStepId: string;
  title: string;
  safeSummary: string;
  priority: PMRiskTier;
  decisionMode: PMDecisionMode;
  riskSurfaces: PMRiskSurface[];
  recommendationOnly: true;
  noExecution: true;
}

export interface PMPhasePlan {
  phaseRef: ProjectPhaseRef;
  schemaVersion: PMSchemaVersion;
  title: string;
  safeSummary: string;
  status: PMStatus;
  decisionMode: PMDecisionMode;
  allowedAutonomyLevel: PMAllowedAutonomyLevel;
  riskTier: PMRiskTier;
  riskSurfaces: PMRiskSurface[];
  evidenceReferences: PMEvidenceReference[];
  approvalPlanningReferences: PMApprovalPlanningReference[];
  recommendedNextSteps: PMRecommendedNextStep[];
  assumptions: string[];
  exclusions: string[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: PMBoundarySet;
}

export interface PMProjectStateSummary {
  projectId: ProjectId;
  schemaVersion: PMSchemaVersion;
  name: string;
  safeSummary: string;
  currentPhaseRef: ProjectPhaseRef;
  status: PMStatus;
  allowedAutonomyLevels: PMAllowedAutonomyLevel[];
  phasePlans: PMPhasePlan[];
  evidenceReferences: PMEvidenceReference[];
  recommendedNextSteps: PMRecommendedNextStep[];
  assumptions: string[];
  exclusions: string[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: PMBoundarySet;
}
