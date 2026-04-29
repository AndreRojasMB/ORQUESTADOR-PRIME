import type {
  BaselineArtifactReference,
  BaselineArtifactReferenceKind,
  BaselineCandidateReference,
  BaselineCandidateReferenceKind,
  BaselineComparisonStatus,
  BaselineManifestBoundarySet,
  BaselineManifestDryRun,
  BaselineManifestId,
  BaselineManifestRiskTier,
  BaselineManifestStatus,
  BaselinePrivacyScanStatus,
  BaselineRetentionClass,
} from "./types.js";

export const baselineManifestBoundaries: BaselineManifestBoundarySet = {
  advisoryOnly: true,
  dryRunOnly: true,
  sourceOnly: true,
  noProviderCalls: true,
  noNetwork: true,
  noFilesystemReads: true,
  noFilesystemWrites: true,
  noBaselineCreation: true,
  noBaselineMutation: true,
  noArtifactGeneration: true,
  noArtifactMutation: true,
  noQualityExecution: true,
  noEvalExecution: true,
  noRiskExecution: true,
  noCiWorkflowChanges: true,
  noPackageScriptChanges: true,
  noStrictCiActivation: true,
  noFailOnReviewActivation: true,
  noFailOnRegressionActivation: true,
  noPrAnnotations: true,
  noBranchProtection: true,
  noBadgeGeneration: true,
  noStoreMutation: true,
  noMemoryLearningMutation: true,
  noActionDispatch: true,
  noProposalApprovalExecution: true,
  noAutomationExecution: true,
  noRuntimeExecution: true,
  noDashboardImplementation: true,
  noConnectorImplementation: true,
  noDbSchemas: true,
  noSql: true,
  noProductionReadinessClaims: true,
  noSecurityComplianceGuarantees: true,
};

export const supportedBaselineManifestIds = ["baseline_manifest_dry_run_candidate"] as const;

export const supportedBaselineManifestStatuses = [
  "planned",
  "candidate_described",
  "blocked",
  "deferred",
] as const satisfies readonly BaselineManifestStatus[];

export const supportedBaselineManifestRiskTiers = [
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly BaselineManifestRiskTier[];

export const supportedBaselineCandidateReferenceKinds = [
  "quality_report_baseline_candidate",
  "quality_snapshot_baseline_candidate",
  "eval_risk_summary_candidate",
  "artifact_manifest_candidate",
  "baseline_metadata",
  "schema_version_metadata",
  "commit_phase_reference",
  "known_exclusion",
] as const satisfies readonly BaselineCandidateReferenceKind[];

export const supportedBaselineArtifactReferenceKinds = [
  "quality_report",
  "quality_snapshot",
  "artifact_manifest",
  "redacted_summary",
  "future_candidate",
] as const satisfies readonly BaselineArtifactReferenceKind[];

export const supportedBaselineComparisonStatuses = [
  "not_run",
  "candidate_only",
  "no_regression",
  "advisory_regression",
  "blocked",
  "unknown",
] as const satisfies readonly BaselineComparisonStatus[];

export const supportedBaselinePrivacyScanStatuses = [
  "not_run",
  "planned",
  "pass",
  "warn",
  "fail",
  "unknown",
] as const satisfies readonly BaselinePrivacyScanStatus[];

export const supportedBaselineRetentionClasses = [
  "short_review_window",
  "future_policy",
  "unknown",
] as const satisfies readonly BaselineRetentionClass[];

const candidate = (
  candidateId: string,
  kind: BaselineCandidateReferenceKind,
  label: string,
  reference: string,
  summary: string,
  riskTier: BaselineManifestRiskTier,
): BaselineCandidateReference => ({
  candidateId,
  kind,
  label,
  reference,
  summary,
  riskTier,
  metadataOnly: true,
  noFileRead: true,
  redacted: true,
});

const artifact = (
  artifactId: string,
  kind: BaselineArtifactReferenceKind,
  label: string,
  reference: string,
  summary: string,
  riskTier: BaselineManifestRiskTier,
): BaselineArtifactReference => ({
  artifactId,
  kind,
  label,
  reference,
  summary,
  riskTier,
  metadataOnly: true,
  noFileRead: true,
  redacted: true,
});

const baselineManifestTemplates: BaselineManifestDryRun[] = [
  {
    manifestId: "baseline_manifest_dry_run_candidate",
    schemaVersion: "1.0",
    status: "candidate_described",
    name: "Baseline manifest dry-run candidate",
    summary:
      "Advisory metadata describing future baseline candidates, redacted artifact references, comparison summaries, privacy review fields, approval needs, rollback references, and retention notes without creating baselines or artifacts.",
    candidateReferences: [
      candidate(
        "candidate_quality_report",
        "quality_report_baseline_candidate",
        "Quality report baseline candidate",
        "quality-report-candidate:future-approved",
        "Future baseline candidate reference for compact quality report status and reason-code summaries.",
        "medium",
      ),
      candidate(
        "candidate_quality_snapshot",
        "quality_snapshot_baseline_candidate",
        "Quality snapshot baseline candidate",
        "quality-snapshot-candidate:future-approved",
        "Future baseline candidate reference for snapshot fingerprints, counts, decisions, and redacted comparison metadata.",
        "medium",
      ),
      candidate(
        "candidate_eval_risk_summary",
        "eval_risk_summary_candidate",
        "Eval and risk summary candidate",
        "eval-risk-summary-candidate:future-approved",
        "Future candidate reference for bounded eval and risk status summaries, not raw reports or runner output.",
        "high",
      ),
      candidate(
        "candidate_artifact_manifest",
        "artifact_manifest_candidate",
        "Artifact manifest candidate",
        "artifact-manifest-candidate:future-approved",
        "Future candidate reference for redacted artifact names, schema metadata, privacy status, and retention notes.",
        "medium",
      ),
      candidate(
        "candidate_baseline_metadata",
        "baseline_metadata",
        "Baseline metadata",
        "baseline-metadata:future-approved",
        "Future baseline metadata reference for schema version, phase, commit, approver role, and status.",
        "medium",
      ),
      candidate(
        "candidate_schema_version",
        "schema_version_metadata",
        "Schema and version metadata",
        "schema-version:baseline-manifest:1.0",
        "Static schema metadata for validating dry-run baseline manifest fields.",
        "low",
      ),
      candidate(
        "candidate_commit_phase",
        "commit_phase_reference",
        "Commit and phase reference",
        "phase-commit-reference:future-approved",
        "Future reference to approved phase and commit metadata; this template does not inspect git history.",
        "medium",
      ),
      candidate(
        "candidate_known_exclusions",
        "known_exclusion",
        "Known exclusions",
        "known-exclusions:source-only-advisory",
        "Metadata-only exclusions for raw artifacts, full report content, private text, credentials, local paths, and unredacted outputs.",
        "high",
      ),
    ],
    artifactReferences: [
      artifact(
        "artifact_quality_report",
        "quality_report",
        "Redacted quality report reference",
        "artifact:quality-report:redacted:future-approved",
        "Metadata string for a future compact quality report artifact, not the artifact body.",
        "medium",
      ),
      artifact(
        "artifact_quality_snapshot",
        "quality_snapshot",
        "Redacted quality snapshot reference",
        "artifact:quality-snapshot:redacted:future-approved",
        "Metadata string for a future compact quality snapshot artifact, not the snapshot body.",
        "medium",
      ),
      artifact(
        "artifact_manifest",
        "artifact_manifest",
        "Redacted artifact manifest reference",
        "artifact:manifest:redacted:future-approved",
        "Metadata string for future artifact manifest status, size class, privacy status, and retention class.",
        "medium",
      ),
      artifact(
        "artifact_privacy_summary",
        "redacted_summary",
        "Privacy scan summary reference",
        "artifact:privacy-summary:redacted:future-approved",
        "Metadata string for future privacy scan status and reason codes only.",
        "high",
      ),
    ],
    comparisonSummary: {
      comparisonId: "comparison_baseline_candidate",
      status: "candidate_only",
      summary:
        "Comparison metadata is planned and redacted; no baseline is loaded, no strict gate is enabled, and no report body is included.",
      baselineLoaded: false,
      advisoryRegression: false,
      statusChanged: false,
      fingerprintChanged: false,
      addedFailingIdsCount: 0,
      addedWarningIdsCount: 0,
      privacyStatusChanged: false,
      budgetStatusChanged: false,
      riskDecisionChanged: false,
      metadataOnly: true,
      redacted: true,
    },
    privacyScanSummary: {
      scanId: "privacy_scan_baseline_candidate",
      status: "planned",
      summary:
        "Privacy scan metadata is required before promotion; denied content includes raw bodies, provider output, credentials, local paths, logs, and full artifacts.",
      checked: false,
      reasonCodes: ["privacy_scan_required_before_promotion", "raw_private_data_denied"],
      metadataOnly: true,
      redacted: true,
    },
    approvalRequirement: {
      approvalId: "approval_required_for_baseline_promotion",
      summary:
        "Future baseline promotion requires explicit human approval, phase and commit context, privacy evidence, and a statement that regressions are not hidden.",
      required: true,
      approverRole: "human_reviewer",
      reasonRequired: true,
      explicitRegressionStatementRequired: true,
      metadataOnly: true,
      noExecution: true,
    },
    rollbackReference: {
      rollbackId: "rollback_reference_future_baseline",
      reference: "rollback:baseline-candidate:future-approved",
      summary:
        "Rollback reference is metadata only; any future rollback process requires a separate approved implementation phase.",
      metadataOnly: true,
      noExecution: true,
    },
    retentionNote: {
      retentionId: "retention_note_redacted_artifacts",
      retentionClass: "future_policy",
      summary:
        "Retention is metadata only. Future release or CI policy must define artifact retention before baseline promotion.",
      metadataOnly: true,
      noRetentionChange: true,
    },
    knownExclusions: [
      "No committed baseline is created.",
      "No artifact is generated or mutated.",
      "No quality, eval, risk, CI, runtime, dashboard, connector, automation, action, job, store, or provider behavior is invoked.",
      "No raw report body, raw snapshot body, raw task text, raw provider output, raw logs, credentials, local paths, or full artifact content is included.",
    ],
    assumptions: [
      "Baseline manifest metadata is curated source-only advisory data.",
      "References are strings for future review and do not cause file reads.",
      "Promotion to committed baselines remains blocked until a dedicated approved phase.",
    ],
    advisoryOnly: true,
    dryRunOnly: true,
    boundaries: baselineManifestBoundaries,
  },
];

const cloneCandidateReference = (item: BaselineCandidateReference): BaselineCandidateReference => ({
  ...item,
});

const cloneArtifactReference = (item: BaselineArtifactReference): BaselineArtifactReference => ({
  ...item,
});

export const cloneBaselineManifestDryRun = (
  manifest: BaselineManifestDryRun,
): BaselineManifestDryRun => ({
  ...manifest,
  candidateReferences: manifest.candidateReferences.map(cloneCandidateReference),
  artifactReferences: manifest.artifactReferences.map(cloneArtifactReference),
  comparisonSummary: { ...manifest.comparisonSummary },
  privacyScanSummary: {
    ...manifest.privacyScanSummary,
    reasonCodes: manifest.privacyScanSummary.reasonCodes.slice(),
  },
  approvalRequirement: { ...manifest.approvalRequirement },
  rollbackReference: { ...manifest.rollbackReference },
  retentionNote: { ...manifest.retentionNote },
  knownExclusions: manifest.knownExclusions.slice(),
  assumptions: manifest.assumptions.slice(),
  boundaries: { ...manifest.boundaries },
});

export const listBaselineManifestTemplates = (): BaselineManifestDryRun[] =>
  baselineManifestTemplates.map(cloneBaselineManifestDryRun);

export const getBaselineManifestTemplateById = (
  manifestId: BaselineManifestId,
): BaselineManifestDryRun | undefined =>
  listBaselineManifestTemplates().find((template) => template.manifestId === manifestId);
