export type BaselineManifestSchemaVersion = "1.0";

export type BaselineManifestId = string;

export type BaselineManifestStatus = "planned" | "candidate_described" | "blocked" | "deferred";

export type BaselineManifestRiskTier = "low" | "medium" | "high" | "critical";

export type BaselineCandidateReferenceKind =
  | "quality_report_baseline_candidate"
  | "quality_snapshot_baseline_candidate"
  | "eval_risk_summary_candidate"
  | "artifact_manifest_candidate"
  | "baseline_metadata"
  | "schema_version_metadata"
  | "commit_phase_reference"
  | "known_exclusion";

export type BaselineArtifactReferenceKind =
  | "quality_report"
  | "quality_snapshot"
  | "artifact_manifest"
  | "redacted_summary"
  | "future_candidate";

export type BaselineComparisonStatus =
  | "not_run"
  | "candidate_only"
  | "no_regression"
  | "advisory_regression"
  | "blocked"
  | "unknown";

export type BaselinePrivacyScanStatus = "not_run" | "planned" | "pass" | "warn" | "fail" | "unknown";

export type BaselineRetentionClass = "short_review_window" | "future_policy" | "unknown";

export interface BaselineManifestBoundarySet {
  advisoryOnly: true;
  dryRunOnly: true;
  sourceOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemReads: true;
  noFilesystemWrites: true;
  noBaselineCreation: true;
  noBaselineMutation: true;
  noArtifactGeneration: true;
  noArtifactMutation: true;
  noQualityExecution: true;
  noEvalExecution: true;
  noRiskExecution: true;
  noCiWorkflowChanges: true;
  noPackageScriptChanges: true;
  noStrictCiActivation: true;
  noFailOnReviewActivation: true;
  noFailOnRegressionActivation: true;
  noPrAnnotations: true;
  noBranchProtection: true;
  noBadgeGeneration: true;
  noStoreMutation: true;
  noMemoryLearningMutation: true;
  noActionDispatch: true;
  noProposalApprovalExecution: true;
  noAutomationExecution: true;
  noRuntimeExecution: true;
  noDashboardImplementation: true;
  noConnectorImplementation: true;
  noDbSchemas: true;
  noSql: true;
  noProductionReadinessClaims: true;
  noSecurityComplianceGuarantees: true;
}

export interface BaselineCandidateReference {
  candidateId: string;
  kind: BaselineCandidateReferenceKind;
  label: string;
  reference: string;
  summary: string;
  riskTier: BaselineManifestRiskTier;
  metadataOnly: true;
  noFileRead: true;
  redacted: true;
}

export interface BaselineArtifactReference {
  artifactId: string;
  kind: BaselineArtifactReferenceKind;
  label: string;
  reference: string;
  summary: string;
  riskTier: BaselineManifestRiskTier;
  metadataOnly: true;
  noFileRead: true;
  redacted: true;
}

export interface BaselineComparisonSummary {
  comparisonId: string;
  status: BaselineComparisonStatus;
  summary: string;
  baselineLoaded: boolean;
  advisoryRegression: boolean;
  statusChanged: boolean;
  fingerprintChanged: boolean;
  addedFailingIdsCount: number;
  addedWarningIdsCount: number;
  privacyStatusChanged: boolean;
  budgetStatusChanged: boolean;
  riskDecisionChanged: boolean;
  metadataOnly: true;
  redacted: true;
}

export interface BaselinePrivacyScanSummary {
  scanId: string;
  status: BaselinePrivacyScanStatus;
  summary: string;
  checked: boolean;
  reasonCodes: string[];
  metadataOnly: true;
  redacted: true;
}

export interface BaselineApprovalRequirement {
  approvalId: string;
  summary: string;
  required: true;
  approverRole: string;
  reasonRequired: true;
  explicitRegressionStatementRequired: true;
  metadataOnly: true;
  noExecution: true;
}

export interface BaselineRollbackReference {
  rollbackId: string;
  reference: string;
  summary: string;
  metadataOnly: true;
  noExecution: true;
}

export interface BaselineRetentionNote {
  retentionId: string;
  retentionClass: BaselineRetentionClass;
  summary: string;
  metadataOnly: true;
  noRetentionChange: true;
}

export interface BaselineManifestDryRun {
  manifestId: BaselineManifestId;
  schemaVersion: BaselineManifestSchemaVersion;
  status: BaselineManifestStatus;
  name: string;
  summary: string;
  candidateReferences: BaselineCandidateReference[];
  artifactReferences: BaselineArtifactReference[];
  comparisonSummary: BaselineComparisonSummary;
  privacyScanSummary: BaselinePrivacyScanSummary;
  approvalRequirement: BaselineApprovalRequirement;
  rollbackReference: BaselineRollbackReference;
  retentionNote: BaselineRetentionNote;
  knownExclusions: string[];
  assumptions: string[];
  advisoryOnly: true;
  dryRunOnly: true;
  boundaries: BaselineManifestBoundarySet;
}

export interface BaselineManifestInput {
  manifestId?: string;
  status?: string;
  name?: string;
  summary?: string;
  candidateReferences?: BaselineCandidateReference[];
  artifactReferences?: BaselineArtifactReference[];
  assumptions?: string[];
  knownExclusions?: string[];
}

export interface BaselineManifestResult {
  ok: boolean;
  status: "manifest_found" | "manifest_not_found" | "manifest_built" | "input_invalid";
  manifest?: BaselineManifestDryRun;
  manifests?: BaselineManifestDryRun[];
  warnings: BaselineManifestValidationFinding[];
  errors: BaselineManifestValidationFinding[];
  advisoryOnly: true;
  dryRunOnly: true;
  boundaries: BaselineManifestBoundarySet;
}

export type BaselineManifestValidationSeverity = "info" | "warn" | "fail";

export interface BaselineManifestValidationFinding {
  id: string;
  severity: BaselineManifestValidationSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  manifestId?: BaselineManifestId;
  metadata?: Record<string, string | number | boolean>;
}

export interface BaselineManifestValidationResult {
  validationId: string;
  schemaVersion: BaselineManifestSchemaVersion;
  valid: boolean;
  status: "pass" | "warn" | "fail";
  manifestCount: number;
  warnings: BaselineManifestValidationFinding[];
  errors: BaselineManifestValidationFinding[];
  advisoryOnly: true;
  dryRunOnly: true;
  boundaries: BaselineManifestBoundarySet;
}
