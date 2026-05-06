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

export type ProjectStateStatus =
  | "not_started"
  | "observed"
  | "reported"
  | "planned"
  | "proposed"
  | "blocked"
  | "deferred";

export type ProjectSnapshotStatus = "candidate" | "valid" | "warn" | "invalid";

export type ProjectEvidenceRef = PMEvidenceReference;

export interface ProjectRoadmapRef {
  roadmapRefId: string;
  phaseRef: ProjectPhaseRef;
  label: string;
  safeSummary: string;
  metadataOnly: true;
  noFileRead: true;
}

export interface ProjectMilestoneRef {
  milestoneRefId: string;
  label: string;
  safeSummary: string;
  targetPhaseRef?: ProjectPhaseRef;
  status: ProjectStateStatus;
  metadataOnly: true;
  noExecution: true;
}

export interface ProjectTaskSummaryRef {
  taskRefId: string;
  label: string;
  safeSummary: string;
  status: ProjectStateStatus;
  phaseRef?: ProjectPhaseRef;
  metadataOnly: true;
  noTaskExecution: true;
}

export interface ProjectDecisionRef {
  decisionRefId: string;
  label: string;
  safeSummary: string;
  decisionMode: PMDecisionMode;
  phaseRef?: ProjectPhaseRef;
  metadataOnly: true;
  noApprovalExecution: true;
}

export interface ProjectRiskRef {
  riskRefId: string;
  label: string;
  safeSummary: string;
  riskTier: PMRiskTier;
  riskSurfaces: PMRiskSurface[];
  metadataOnly: true;
  noMitigationExecution: true;
}

export interface ProjectBlockerRef {
  blockerRefId: string;
  label: string;
  safeSummary: string;
  severity: PMRiskTier;
  blockedPhaseRefs: ProjectPhaseRef[];
  metadataOnly: true;
  noResolutionExecution: true;
}

export interface ProjectDoDRef {
  dodRefId: string;
  label: string;
  safeSummary: string;
  phaseRef?: ProjectPhaseRef;
  metadataOnly: true;
  noCheckExecution: true;
}

export interface ProjectStateSummary {
  projectId: ProjectId;
  schemaVersion: PMSchemaVersion;
  name: string;
  safeSummary: string;
  currentPhaseRef: ProjectPhaseRef;
  status: ProjectStateStatus;
  allowedAutonomyLevels: PMAllowedAutonomyLevel[];
  riskTier: PMRiskTier;
  metadataOnly: true;
}

export interface ProjectState {
  projectId: ProjectId;
  schemaVersion: PMSchemaVersion;
  name: string;
  safeSummary: string;
  currentPhaseRef: ProjectPhaseRef;
  status: ProjectStateStatus;
  allowedAutonomyLevels: PMAllowedAutonomyLevel[];
  roadmapRefs: ProjectRoadmapRef[];
  milestoneRefs: ProjectMilestoneRef[];
  taskSummaryRefs: ProjectTaskSummaryRef[];
  decisionRefs: ProjectDecisionRef[];
  riskRefs: ProjectRiskRef[];
  blockerRefs: ProjectBlockerRef[];
  dodRefs: ProjectDoDRef[];
  evidenceRefs: ProjectEvidenceRef[];
  recommendedNextSteps: PMRecommendedNextStep[];
  assumptions: string[];
  exclusions: string[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: PMBoundarySet;
}

export interface ProjectSnapshot {
  snapshotId: string;
  projectId: ProjectId;
  schemaVersion: PMSchemaVersion;
  status: ProjectSnapshotStatus;
  summary: ProjectStateSummary;
  state: ProjectState;
  validation: ProjectStateValidationResult;
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: PMBoundarySet;
}

export interface ProjectStateInput {
  projectId?: string;
  schemaVersion?: string;
  name?: string;
  safeSummary?: string;
  currentPhaseRef?: string;
  status?: string;
  allowedAutonomyLevels?: string[];
  roadmapRefs?: ProjectRoadmapRef[];
  milestoneRefs?: ProjectMilestoneRef[];
  taskSummaryRefs?: ProjectTaskSummaryRef[];
  decisionRefs?: ProjectDecisionRef[];
  riskRefs?: ProjectRiskRef[];
  blockerRefs?: ProjectBlockerRef[];
  dodRefs?: ProjectDoDRef[];
  evidenceRefs?: ProjectEvidenceRef[];
  recommendedNextSteps?: PMRecommendedNextStep[];
  assumptions?: string[];
  exclusions?: string[];
}

export interface ProjectStateValidationFinding {
  id: string;
  severity: PMFindingSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  projectId?: ProjectId;
  phaseRef?: ProjectPhaseRef;
  metadata?: Record<string, string | number | boolean>;
}

export interface ProjectStateValidationResult {
  validationId: string;
  schemaVersion: PMSchemaVersion;
  valid: boolean;
  status: "pass" | "warn" | "fail";
  findings: ProjectStateValidationFinding[];
  warnings: ProjectStateValidationFinding[];
  errors: ProjectStateValidationFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: PMBoundarySet;
}

export type PMTaskId = string;

export type PMMilestoneId = string;

export type PMTaskStatus =
  | "planned"
  | "ready"
  | "in_progress"
  | "blocked"
  | "needs_review"
  | "done"
  | "deferred";

export type PMTaskPriority = "low" | "medium" | "high" | "critical";

export type PMTaskDependencyType =
  | "blocks"
  | "requires"
  | "related"
  | "sequence_after";

export type PMMilestoneStatus =
  | "empty"
  | "planned"
  | "in_progress"
  | "blocked"
  | "complete"
  | "mixed";

export type PMMilestoneHealth = PMMilestoneStatus;

export interface PMTaskGraphValidationFinding {
  id: string;
  severity: PMFindingSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  taskId?: PMTaskId;
  milestoneId?: PMMilestoneId;
  metadata?: Record<string, string | number | boolean>;
}

export interface PMTaskGraphValidationResult {
  validationId: string;
  schemaVersion: PMSchemaVersion;
  valid: boolean;
  status: "pass" | "warn" | "fail";
  findings: PMTaskGraphValidationFinding[];
  warnings: PMTaskGraphValidationFinding[];
  errors: PMTaskGraphValidationFinding[];
  orderedTaskIds: PMTaskId[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: PMBoundarySet;
}

export interface PMTaskGraphBuildResult {
  ok: boolean;
  status: "graph_built" | "input_invalid";
  orderedTaskIds: PMTaskId[];
  validation: PMTaskGraphValidationResult;
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: PMBoundarySet;
}
