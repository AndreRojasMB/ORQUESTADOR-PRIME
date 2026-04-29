export type RuntimeReadinessSchemaVersion = "1.0";

export type RuntimeReadinessCheckId =
  | "runtime_api_server_readiness"
  | "worker_readiness"
  | "queue_readiness"
  | "scheduler_readiness"
  | "store_adapter_readiness"
  | "sqlite_postgres_strategy_readiness"
  | "migration_apply_readiness"
  | "backup_restore_readiness"
  | "repair_mode_readiness"
  | "auth_rate_limit_readiness"
  | "observability_readiness"
  | "retention_forget_readiness"
  | "approval_action_safety_integration_readiness"
  | "automation_runtime_dependency_readiness"
  | "dashboard_control_center_runtime_visibility_readiness"
  | "deployment_productization_readiness";

export type RuntimeReadinessCategory =
  | "api_server"
  | "workers"
  | "queues"
  | "schedulers"
  | "stores"
  | "database"
  | "migrations"
  | "backups"
  | "repairs"
  | "auth"
  | "observability"
  | "retention"
  | "actions"
  | "automation"
  | "dashboard"
  | "deployment";

export type RuntimeReadinessLevel =
  | "not_implemented"
  | "docs_only_spec"
  | "source_only_advisory"
  | "local_read_only_diagnostic"
  | "local_dry_run_planning"
  | "live_adjacent_guarded"
  | "deferred_until_prerequisites"
  | "future_gated_execution";

export type RuntimeReadinessRiskTier = "low" | "medium" | "high" | "critical";

export type RuntimeReadinessEvidenceReferenceType =
  | "doc"
  | "source"
  | "package"
  | "workflow"
  | "roadmap"
  | "policy";

export type RuntimeReadinessRecommendationPriority = "low" | "medium" | "high";

export interface RuntimeReadinessBoundarySet {
  advisoryOnly: true;
  sourceOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemReads: true;
  noFilesystemWrites: true;
  noRepositoryScanning: true;
  noCommandExecution: true;
  noRuntimeExecution: true;
  noServerApiImplementation: true;
  noWorkerImplementation: true;
  noQueueImplementation: true;
  noSchedulerImplementation: true;
  noDbAdapterImplementation: true;
  noMigrationApply: true;
  noBackupRestoreExecution: true;
  noRepairExecution: true;
  noAuthRateLimitImplementation: true;
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

export interface RuntimeReadinessEvidenceReference {
  evidenceId: string;
  label: string;
  reference: string;
  referenceType: RuntimeReadinessEvidenceReferenceType;
  safeSummary: string;
  metadataOnly: true;
  noFileRead: true;
}

export interface RuntimeReadinessPrecondition {
  preconditionId: string;
  title: string;
  safeSummary: string;
  requiredBefore: string;
  metadataOnly: true;
}

export interface RuntimeReadinessBlocker {
  blockerId: string;
  title: string;
  safeSummary: string;
  severity: RuntimeReadinessRiskTier;
  metadataOnly: true;
}

export interface RuntimeReadinessRecommendation {
  recommendationId: string;
  title: string;
  safeSummary: string;
  priority: RuntimeReadinessRecommendationPriority;
  recommendationOnly: true;
  noExecution: true;
}

export interface RuntimeReadinessCheck {
  checkId: RuntimeReadinessCheckId;
  schemaVersion: RuntimeReadinessSchemaVersion;
  category: RuntimeReadinessCategory;
  name: string;
  summary: string;
  readinessLevel: RuntimeReadinessLevel;
  riskTier: RuntimeReadinessRiskTier;
  currentStatus: string;
  evidenceReferences: RuntimeReadinessEvidenceReference[];
  preconditions: RuntimeReadinessPrecondition[];
  blockers: RuntimeReadinessBlocker[];
  recommendations: RuntimeReadinessRecommendation[];
  assumptions: string[];
  exclusions: string[];
  advisoryOnly: true;
  boundaries: RuntimeReadinessBoundarySet;
}

export interface RuntimeReadinessProfile {
  profileId: string;
  schemaVersion: RuntimeReadinessSchemaVersion;
  name: string;
  summary: string;
  checks: RuntimeReadinessCheck[];
  includedCheckIds: RuntimeReadinessCheckId[];
  assumptions: string[];
  exclusions: string[];
  advisoryOnly: true;
  boundaries: RuntimeReadinessBoundarySet;
}

export interface RuntimeReadinessInput {
  checkIds?: Array<RuntimeReadinessCheckId | string>;
  profileId?: string;
  name?: string;
  summary?: string;
  assumptions?: string[];
  exclusions?: string[];
}

export type RuntimeReadinessResultStatus =
  | "check_found"
  | "check_not_found"
  | "profile_built"
  | "input_invalid";

export interface RuntimeReadinessResult {
  ok: boolean;
  status: RuntimeReadinessResultStatus;
  check?: RuntimeReadinessCheck;
  checks?: RuntimeReadinessCheck[];
  profile?: RuntimeReadinessProfile;
  warnings: RuntimeReadinessValidationFinding[];
  errors: RuntimeReadinessValidationFinding[];
  advisoryOnly: true;
  boundaries: RuntimeReadinessBoundarySet;
}

export type RuntimeReadinessValidationSeverity = "warn" | "fail";

export type RuntimeReadinessValidationStatus = "pass" | "warn" | "fail";

export interface RuntimeReadinessValidationFinding {
  id: string;
  severity: RuntimeReadinessValidationSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  checkId?: RuntimeReadinessCheckId;
  metadata?: Record<string, string | number | boolean>;
}

export interface RuntimeReadinessValidationResult {
  validationId: string;
  schemaVersion: RuntimeReadinessSchemaVersion;
  valid: boolean;
  status: RuntimeReadinessValidationStatus;
  checkCount: number;
  warnings: RuntimeReadinessValidationFinding[];
  errors: RuntimeReadinessValidationFinding[];
  advisoryOnly: true;
  boundaries: RuntimeReadinessBoundarySet;
}
