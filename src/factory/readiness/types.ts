export type ReadinessSchemaVersion = "1.0";

export type ReadinessLaneId =
  | "factory_metadata_lanes"
  | "runtime_deeper"
  | "native_automation_deeper"
  | "dashboard_control_center"
  | "integrations_connectors"
  | "safe_self_improvement"
  | "baseline_strict_ci"
  | "productization_release"
  | "quality_evals_risk"
  | "workspace_memory_learning"
  | "actions_proposals_approvals"
  | "jobs_notifications"
  | "channels_computer_use"
  | "deployment_productization";

export type ReadinessLaneCategory =
  | "factory"
  | "runtime"
  | "automation"
  | "dashboard"
  | "connectors"
  | "self_improvement"
  | "ci_governance"
  | "release_governance"
  | "quality"
  | "workspace_state"
  | "actions"
  | "jobs"
  | "channels"
  | "deployment";

export type ReadinessMaturityLevel =
  | "not_implemented"
  | "docs_only_spec"
  | "source_only_advisory"
  | "local_read_only_diagnostic"
  | "local_advisory_tooling"
  | "live_adjacent_guarded"
  | "deferred_until_prerequisites"
  | "future_gated_execution";

export type ReadinessRiskTier = "low" | "medium" | "high" | "critical";

export type ReadinessStatusType =
  | "implemented_advisory"
  | "spec_only"
  | "local_diagnostic"
  | "local_advisory"
  | "live_adjacent"
  | "deferred";

export type ReadinessEvidenceReferenceType =
  | "doc"
  | "source"
  | "workflow"
  | "package"
  | "roadmap"
  | "policy";

export type ReadinessNextStepPriority = "low" | "medium" | "high";

export interface ReadinessBoundarySet {
  advisoryOnly: true;
  sourceOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemReads: true;
  noFilesystemWrites: true;
  noRepositoryScanning: true;
  noCommandExecution: true;
  noRuntimeExecution: true;
  noDashboardImplementation: true;
  noAutomationExecution: true;
  noConnectorImplementation: true;
  noCredentialVaultImplementation: true;
  noCiWorkflowChanges: true;
  noPackageScriptChanges: true;
  noBaselineArtifactMutation: true;
  noStoreMutation: true;
  noMemoryLearningMutation: true;
  noActionDispatch: true;
  noProposalApprovalExecution: true;
  noJobsExecution: true;
  noScaffolding: true;
  noDbSchemas: true;
  noSql: true;
  noBranchTagReleaseCreation: true;
  noProductionReadinessClaims: true;
  noSecurityComplianceGuarantees: true;
}

export interface ReadinessEvidenceReference {
  evidenceId: string;
  label: string;
  reference: string;
  referenceType: ReadinessEvidenceReferenceType;
  safeSummary: string;
  metadataOnly: true;
  noFileRead: true;
}

export interface ReadinessPrecondition {
  preconditionId: string;
  title: string;
  safeSummary: string;
  requiredBefore: string;
  metadataOnly: true;
}

export interface ReadinessBlocker {
  blockerId: string;
  title: string;
  safeSummary: string;
  severity: ReadinessRiskTier;
  metadataOnly: true;
}

export interface ReadinessNextStep {
  nextStepId: string;
  title: string;
  safeSummary: string;
  priority: ReadinessNextStepPriority;
  recommendationOnly: true;
  noExecution: true;
}

export interface ReadinessLaneModel {
  laneId: ReadinessLaneId;
  schemaVersion: ReadinessSchemaVersion;
  category: ReadinessLaneCategory;
  name: string;
  summary: string;
  maturityLevel: ReadinessMaturityLevel;
  riskTier: ReadinessRiskTier;
  statusType: ReadinessStatusType;
  evidenceReferences: ReadinessEvidenceReference[];
  preconditions: ReadinessPrecondition[];
  blockers: ReadinessBlocker[];
  nextSteps: ReadinessNextStep[];
  assumptions: string[];
  exclusions: string[];
  advisoryOnly: true;
  boundaries: ReadinessBoundarySet;
}

export interface ReadinessMaturitySnapshot {
  snapshotId: string;
  schemaVersion: ReadinessSchemaVersion;
  name: string;
  summary: string;
  lanes: ReadinessLaneModel[];
  includedLaneIds: ReadinessLaneId[];
  assumptions: string[];
  exclusions: string[];
  advisoryOnly: true;
  boundaries: ReadinessBoundarySet;
}

export interface ReadinessInput {
  laneIds?: Array<ReadinessLaneId | string>;
  snapshotId?: string;
  name?: string;
  summary?: string;
  assumptions?: string[];
  exclusions?: string[];
}

export type ReadinessResultStatus =
  | "lane_found"
  | "lane_not_found"
  | "snapshot_built"
  | "input_invalid";

export interface ReadinessResult {
  ok: boolean;
  status: ReadinessResultStatus;
  lane?: ReadinessLaneModel;
  lanes?: ReadinessLaneModel[];
  snapshot?: ReadinessMaturitySnapshot;
  warnings: ReadinessValidationFinding[];
  errors: ReadinessValidationFinding[];
  advisoryOnly: true;
  boundaries: ReadinessBoundarySet;
}

export type ReadinessValidationSeverity = "warn" | "fail";

export type ReadinessValidationStatus = "pass" | "warn" | "fail";

export interface ReadinessValidationFinding {
  id: string;
  severity: ReadinessValidationSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  laneId?: ReadinessLaneId;
  metadata?: Record<string, string | number | boolean>;
}

export interface ReadinessValidationResult {
  validationId: string;
  schemaVersion: ReadinessSchemaVersion;
  valid: boolean;
  status: ReadinessValidationStatus;
  modelCount: number;
  warnings: ReadinessValidationFinding[];
  errors: ReadinessValidationFinding[];
  advisoryOnly: true;
  boundaries: ReadinessBoundarySet;
}
