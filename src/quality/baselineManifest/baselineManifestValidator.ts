import {
  baselineManifestBoundaries,
  supportedBaselineArtifactReferenceKinds,
  supportedBaselineCandidateReferenceKinds,
  supportedBaselineComparisonStatuses,
  supportedBaselineManifestStatuses,
  supportedBaselinePrivacyScanStatuses,
  supportedBaselineRetentionClasses,
  supportedBaselineManifestRiskTiers,
} from "./baselineManifestTemplates.js";
import type {
  BaselineArtifactReference,
  BaselineCandidateReference,
  BaselineComparisonStatus,
  BaselineManifestDryRun,
  BaselineManifestId,
  BaselineManifestInput,
  BaselineManifestRiskTier,
  BaselineManifestStatus,
  BaselineManifestValidationFinding,
  BaselineManifestValidationResult,
  BaselinePrivacyScanStatus,
  BaselineRetentionClass,
} from "./types.js";

const MAX_TEXT_LENGTH = 1200;
const MAX_ARRAY_LENGTH = 120;
const MAX_REASON_CODES = 32;

const forbiddenContentPatterns: Array<{ pattern: RegExp; reasonCode: string; safeMessage: string }> = [
  {
    pattern:
      /@openai\/agents|fetch\s*\(|from\s+['"]fs|from\s+['"]fs\/promises|child[_-]process|exec\s*\(|spawn\s*\(|write\s*File|append\s*File|mkdir|unlink|rm\s+-rf/i,
    reasonCode: "FORBIDDEN_SOURCE_BEHAVIOR_TOKEN",
    safeMessage:
      "Baseline manifest metadata must not include source behavior tokens for providers, network, filesystem, or command execution.",
  },
  {
    pattern:
      /\b(performs?|performed|runs?|ran|executes?|executed|invokes?|invoked|calls?|called)\s+(a\s+|the\s+)?(quality|eval|risk|snapshot|gate|artifact\s+dry-run|CI|workflow)\b/i,
    reasonCode: "FORBIDDEN_QUALITY_OR_CI_BEHAVIOR",
    safeMessage:
      "Baseline manifest metadata must not describe quality, eval, risk, artifact, CI, or workflow behavior as executed.",
  },
  {
    pattern:
      /\b(creates?|created|commits?|committed|updates?|updated|mutates?|mutated|generates?|generated|publishes?|published)\s+(a\s+|the\s+)?(baseline|artifact|PR\s+annotation|branch\s+protection|badge)\b/i,
    reasonCode: "FORBIDDEN_BASELINE_OR_ARTIFACT_BEHAVIOR",
    safeMessage:
      "Baseline manifest metadata must not describe baseline creation, artifact generation, annotations, branch protection, or badges as behavior.",
  },
  {
    pattern:
      /\b(enables?|enabled|activates?|activated)\s+(strict\s+CI|fail-on-review|fail-on-regression|quality\s+gate|regression\s+gate)\b/i,
    reasonCode: "FORBIDDEN_STRICT_GATE_BEHAVIOR",
    safeMessage: "Baseline manifest metadata must not describe strict CI or fail flags as enabled.",
  },
  {
    pattern:
      /\b(executes?|executed|performs?|performed|runs?|ran)\s+(a\s+|the\s+)?(runtime|automation|connector|dashboard|action|proposal|approval|job)\b|\b(mutates?|mutated|writes?|wrote)\s+(a\s+|the\s+)?(store|memory|learning)\b/i,
    reasonCode: "FORBIDDEN_EXECUTION_OR_MUTATION_WORDING",
    safeMessage: "Baseline manifest metadata must not describe execution or mutation behavior.",
  },
  {
    pattern:
      /\b(raw\s+(task|prompt|provider|tool|log|file|artifact|report|snapshot|message|body)|secret|token|provider\s+key|credential|api\s+key|private\s+key)\b/i,
    reasonCode: "RAW_PRIVATE_DATA_WORDING",
    safeMessage: "Baseline manifest metadata must not include raw/private data wording except in explicit exclusions.",
  },
  {
    pattern: /\b[A-Za-z]:\\|\/(?:home|users|tmp|mnt|var|etc)\//i,
    reasonCode: "ABSOLUTE_PATH_CONTENT",
    safeMessage: "Baseline manifest metadata must not include absolute local paths.",
  },
  {
    pattern:
      /\bproduction-ready\b|\bproduction ready\b|security guarantee|compliance guarantee|certification guarantee|certified secure|guarantees compliance/i,
    reasonCode: "PRODUCTION_OR_GOVERNANCE_OVERCLAIM",
    safeMessage:
      "Baseline manifest metadata must not include production, security, compliance, or certification guarantees.",
  },
];

const allowedExclusionPattern = /\b(no|not|never|denied|excluded|must not|without)\b/i;

const isSupportedStatus = (value: string): value is BaselineManifestStatus =>
  supportedBaselineManifestStatuses.includes(value as BaselineManifestStatus);

const isSupportedRiskTier = (value: string): value is BaselineManifestRiskTier =>
  supportedBaselineManifestRiskTiers.includes(value as BaselineManifestRiskTier);

const isSupportedComparisonStatus = (value: string): value is BaselineComparisonStatus =>
  supportedBaselineComparisonStatuses.includes(value as BaselineComparisonStatus);

const isSupportedPrivacyScanStatus = (value: string): value is BaselinePrivacyScanStatus =>
  supportedBaselinePrivacyScanStatuses.includes(value as BaselinePrivacyScanStatus);

const isSupportedRetentionClass = (value: string): value is BaselineRetentionClass =>
  supportedBaselineRetentionClasses.includes(value as BaselineRetentionClass);

const makeResult = (
  warnings: BaselineManifestValidationFinding[],
  errors: BaselineManifestValidationFinding[],
  manifestCount: number,
): BaselineManifestValidationResult => ({
  validationId: "baseline_manifest_validation:static",
  schemaVersion: "1.0",
  valid: errors.length === 0,
  status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass",
  manifestCount,
  warnings,
  errors,
  advisoryOnly: true,
  dryRunOnly: true,
  boundaries: baselineManifestBoundaries,
});

const addFinding = (
  findings: BaselineManifestValidationFinding[],
  severity: BaselineManifestValidationFinding["severity"],
  reasonCode: string,
  safeMessage: string,
  path?: string,
  manifestId?: BaselineManifestId,
  metadata?: BaselineManifestValidationFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(manifestId ? { manifestId } : {}),
    ...(metadata ? { metadata } : {}),
  });
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const safeStringValues = (value: unknown, acc: string[] = []): string[] => {
  if (typeof value === "string") {
    acc.push(value);
    return acc;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => safeStringValues(item, acc));
    return acc;
  }
  if (isObject(value)) {
    Object.values(value).forEach((item) => safeStringValues(item, acc));
  }
  return acc;
};

const checkTextBounds = (
  value: unknown,
  errors: BaselineManifestValidationFinding[],
  path: string,
  manifestId?: BaselineManifestId,
): void => {
  if (typeof value === "string" && value.length > MAX_TEXT_LENGTH) {
    addFinding(
      errors,
      "fail",
      "TEXT_TOO_LONG",
      "Baseline manifest metadata text exceeds the bounded length limit.",
      path,
      manifestId,
    );
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) {
      addFinding(
        errors,
        "fail",
        "ARRAY_TOO_LONG",
        "Baseline manifest metadata array exceeds the bounded item limit.",
        path,
        manifestId,
      );
    }
    value.forEach((item, index) => checkTextBounds(item, errors, `${path}.${index}`, manifestId));
  }
  if (isObject(value)) {
    Object.entries(value).forEach(([key, item]) =>
      checkTextBounds(item, errors, `${path}.${key}`, manifestId),
    );
  }
};

const checkForbiddenContent = (
  value: unknown,
  errors: BaselineManifestValidationFinding[],
  manifestId?: BaselineManifestId,
): void => {
  safeStringValues(value).forEach((text) => {
    forbiddenContentPatterns.forEach(({ pattern, reasonCode, safeMessage }) => {
      if (pattern.test(text) && !allowedExclusionPattern.test(text)) {
        addFinding(errors, "fail", reasonCode, safeMessage, undefined, manifestId);
      }
    });
  });
};

const checkUniqueIds = (
  ids: string[],
  idLabel: string,
  errors: BaselineManifestValidationFinding[],
  manifestId?: BaselineManifestId,
): void => {
  const seen = new Set<string>();
  ids.forEach((id, index) => {
    if (!id.trim()) {
      addFinding(errors, "fail", "EMPTY_ID", `${idLabel} must not be empty.`, `${idLabel}.${index}`, manifestId);
      return;
    }
    if (seen.has(id)) {
      addFinding(errors, "fail", "DUPLICATE_ID", `${idLabel} values must be unique.`, idLabel, manifestId);
    }
    seen.add(id);
  });
};

const requiredArray = (
  value: unknown,
  path: string,
  errors: BaselineManifestValidationFinding[],
  manifestId?: BaselineManifestId,
): void => {
  if (!Array.isArray(value) || value.length === 0) {
    addFinding(
      errors,
      "fail",
      "REQUIRED_ARRAY_EMPTY",
      "Required baseline manifest metadata arrays must be present and non-empty.",
      path,
      manifestId,
    );
  }
};

const checkBoundaries = (
  model: Partial<BaselineManifestDryRun>,
  errors: BaselineManifestValidationFinding[],
  pathPrefix: string,
  manifestId?: BaselineManifestId,
): void => {
  if (model.advisoryOnly !== true) {
    addFinding(errors, "fail", "ADVISORY_ONLY_REQUIRED", "Baseline manifests must be advisory only.", `${pathPrefix}.advisoryOnly`, manifestId);
  }
  if (model.dryRunOnly !== true) {
    addFinding(errors, "fail", "DRY_RUN_ONLY_REQUIRED", "Baseline manifests must be dry-run only.", `${pathPrefix}.dryRunOnly`, manifestId);
  }

  const boundaries = model.boundaries as unknown as Record<string, unknown> | undefined;
  if (!boundaries) {
    addFinding(
      errors,
      "fail",
      "BOUNDARIES_REQUIRED",
      "Baseline manifests must include advisory safety boundaries.",
      `${pathPrefix}.boundaries`,
      manifestId,
    );
    return;
  }

  const expectedBoundaries = baselineManifestBoundaries as unknown as Record<string, true>;
  Object.keys(expectedBoundaries).forEach((boundaryName) => {
    if (boundaries[boundaryName] !== true) {
      addFinding(
        errors,
        "fail",
        "BOUNDARY_NOT_TRUE",
        "All baseline manifest safety boundaries must be true.",
        `${pathPrefix}.boundaries.${boundaryName}`,
        manifestId,
      );
    }
  });
};

const checkCandidateReference = (
  item: BaselineCandidateReference,
  index: number,
  errors: BaselineManifestValidationFinding[],
  manifestId: BaselineManifestId,
): void => {
  const path = `candidateReferences.${index}`;
  if (!supportedBaselineCandidateReferenceKinds.includes(item.kind)) {
    addFinding(errors, "fail", "UNKNOWN_CANDIDATE_KIND", "Baseline candidate reference kind is not supported.", `${path}.kind`, manifestId);
  }
  if (!isSupportedRiskTier(item.riskTier)) {
    addFinding(errors, "fail", "UNKNOWN_RISK_TIER", "Baseline candidate reference risk tier is not supported.", `${path}.riskTier`, manifestId);
  }
  if (item.metadataOnly !== true || item.noFileRead !== true || item.redacted !== true) {
    addFinding(
      errors,
      "fail",
      "CANDIDATE_REFERENCE_BOUNDARY_REQUIRED",
      "Baseline candidate references must be redacted metadata strings only and must not read files.",
      path,
      manifestId,
    );
  }
};

const checkArtifactReference = (
  item: BaselineArtifactReference,
  index: number,
  errors: BaselineManifestValidationFinding[],
  manifestId: BaselineManifestId,
): void => {
  const path = `artifactReferences.${index}`;
  if (!supportedBaselineArtifactReferenceKinds.includes(item.kind)) {
    addFinding(errors, "fail", "UNKNOWN_ARTIFACT_KIND", "Baseline artifact reference kind is not supported.", `${path}.kind`, manifestId);
  }
  if (!isSupportedRiskTier(item.riskTier)) {
    addFinding(errors, "fail", "UNKNOWN_RISK_TIER", "Baseline artifact reference risk tier is not supported.", `${path}.riskTier`, manifestId);
  }
  if (item.metadataOnly !== true || item.noFileRead !== true || item.redacted !== true) {
    addFinding(
      errors,
      "fail",
      "ARTIFACT_REFERENCE_BOUNDARY_REQUIRED",
      "Baseline artifact references must be redacted metadata strings only and must not read files.",
      path,
      manifestId,
    );
  }
};

export const validateBaselineManifestDryRun = (
  manifest: BaselineManifestDryRun,
): BaselineManifestValidationResult => {
  const warnings: BaselineManifestValidationFinding[] = [];
  const errors: BaselineManifestValidationFinding[] = [];
  const manifestId = manifest.manifestId;

  if (manifest.schemaVersion !== "1.0") {
    addFinding(errors, "fail", "SCHEMA_VERSION_UNSUPPORTED", "Baseline manifest schema version is not supported.", "schemaVersion", manifestId);
  }
  if (!manifest.manifestId?.trim()) {
    addFinding(errors, "fail", "MANIFEST_ID_REQUIRED", "Baseline manifest id is required.", "manifestId", manifestId);
  }
  if (!isSupportedStatus(manifest.status)) {
    addFinding(errors, "fail", "MANIFEST_STATUS_UNSUPPORTED", "Baseline manifest status is not supported.", "status", manifestId);
  }

  requiredArray(manifest.candidateReferences, "candidateReferences", errors, manifestId);
  requiredArray(manifest.artifactReferences, "artifactReferences", errors, manifestId);
  requiredArray(manifest.assumptions, "assumptions", errors, manifestId);
  requiredArray(manifest.knownExclusions, "knownExclusions", errors, manifestId);

  checkUniqueIds(
    manifest.candidateReferences.map((item) => item.candidateId),
    "candidateId",
    errors,
    manifestId,
  );
  checkUniqueIds(
    manifest.artifactReferences.map((item) => item.artifactId),
    "artifactId",
    errors,
    manifestId,
  );

  manifest.candidateReferences.forEach((item, index) =>
    checkCandidateReference(item, index, errors, manifestId),
  );
  manifest.artifactReferences.forEach((item, index) =>
    checkArtifactReference(item, index, errors, manifestId),
  );

  if (!isSupportedComparisonStatus(manifest.comparisonSummary.status)) {
    addFinding(errors, "fail", "COMPARISON_STATUS_UNSUPPORTED", "Baseline comparison status is not supported.", "comparisonSummary.status", manifestId);
  }
  if (manifest.comparisonSummary.metadataOnly !== true || manifest.comparisonSummary.redacted !== true) {
    addFinding(
      errors,
      "fail",
      "COMPARISON_METADATA_ONLY_REQUIRED",
      "Baseline comparison summaries must be redacted metadata only.",
      "comparisonSummary",
      manifestId,
    );
  }
  if (!Number.isInteger(manifest.comparisonSummary.addedFailingIdsCount) || manifest.comparisonSummary.addedFailingIdsCount < 0) {
    addFinding(errors, "fail", "COMPARISON_COUNT_INVALID", "Baseline comparison counts must be non-negative integers.", "comparisonSummary.addedFailingIdsCount", manifestId);
  }
  if (!Number.isInteger(manifest.comparisonSummary.addedWarningIdsCount) || manifest.comparisonSummary.addedWarningIdsCount < 0) {
    addFinding(errors, "fail", "COMPARISON_COUNT_INVALID", "Baseline comparison counts must be non-negative integers.", "comparisonSummary.addedWarningIdsCount", manifestId);
  }

  if (!isSupportedPrivacyScanStatus(manifest.privacyScanSummary.status)) {
    addFinding(errors, "fail", "PRIVACY_SCAN_STATUS_UNSUPPORTED", "Baseline privacy scan status is not supported.", "privacyScanSummary.status", manifestId);
  }
  if (manifest.privacyScanSummary.reasonCodes.length > MAX_REASON_CODES) {
    addFinding(errors, "fail", "PRIVACY_REASON_CODES_TOO_MANY", "Baseline privacy scan reason codes exceed the bounded limit.", "privacyScanSummary.reasonCodes", manifestId);
  }
  if (manifest.privacyScanSummary.metadataOnly !== true || manifest.privacyScanSummary.redacted !== true) {
    addFinding(
      errors,
      "fail",
      "PRIVACY_SCAN_METADATA_ONLY_REQUIRED",
      "Baseline privacy scan summaries must be redacted metadata only.",
      "privacyScanSummary",
      manifestId,
    );
  }

  if (
    manifest.approvalRequirement.metadataOnly !== true ||
    manifest.approvalRequirement.noExecution !== true ||
    manifest.approvalRequirement.required !== true
  ) {
    addFinding(
      errors,
      "fail",
      "APPROVAL_METADATA_ONLY_REQUIRED",
      "Baseline approval requirements must be metadata only and cannot execute.",
      "approvalRequirement",
      manifestId,
    );
  }
  if (manifest.rollbackReference.metadataOnly !== true || manifest.rollbackReference.noExecution !== true) {
    addFinding(
      errors,
      "fail",
      "ROLLBACK_METADATA_ONLY_REQUIRED",
      "Baseline rollback references must be metadata only and cannot execute.",
      "rollbackReference",
      manifestId,
    );
  }
  if (!isSupportedRetentionClass(manifest.retentionNote.retentionClass)) {
    addFinding(errors, "fail", "RETENTION_CLASS_UNSUPPORTED", "Baseline retention class is not supported.", "retentionNote.retentionClass", manifestId);
  }
  if (manifest.retentionNote.metadataOnly !== true || manifest.retentionNote.noRetentionChange !== true) {
    addFinding(
      errors,
      "fail",
      "RETENTION_METADATA_ONLY_REQUIRED",
      "Baseline retention notes must be metadata only and cannot change retention.",
      "retentionNote",
      manifestId,
    );
  }

  checkBoundaries(manifest, errors, "manifest", manifestId);
  checkTextBounds(manifest, errors, "manifest", manifestId);
  checkForbiddenContent(manifest, errors, manifestId);

  return makeResult(warnings, errors, 1);
};

export const validateBaselineManifestDryRuns = (
  manifests: BaselineManifestDryRun[],
): BaselineManifestValidationResult => {
  const warnings: BaselineManifestValidationFinding[] = [];
  const errors: BaselineManifestValidationFinding[] = [];

  if (!Array.isArray(manifests) || manifests.length === 0) {
    addFinding(
      errors,
      "fail",
      "MANIFESTS_REQUIRED",
      "At least one baseline manifest dry-run model is required.",
      "manifests",
    );
    return makeResult(warnings, errors, 0);
  }

  const ids = manifests.map((manifest) => manifest.manifestId);
  checkUniqueIds(ids, "manifestId", errors);

  manifests.forEach((manifest) => {
    const validation = validateBaselineManifestDryRun(manifest);
    warnings.push(...validation.warnings);
    errors.push(...validation.errors);
  });

  return makeResult(warnings, errors, manifests.length);
};

export const validateBaselineManifestInput = (
  input: BaselineManifestInput,
): BaselineManifestValidationResult => {
  const warnings: BaselineManifestValidationFinding[] = [];
  const errors: BaselineManifestValidationFinding[] = [];

  if (input.status && !isSupportedStatus(input.status)) {
    addFinding(
      errors,
      "fail",
      "MANIFEST_STATUS_UNSUPPORTED",
      "Baseline manifest input status is not supported.",
      "status",
    );
  }

  checkTextBounds(input, errors, "input");
  checkForbiddenContent(input, errors);

  const inputCandidateIds = input.candidateReferences?.map((item) => item.candidateId) ?? [];
  const inputArtifactIds = input.artifactReferences?.map((item) => item.artifactId) ?? [];
  if (inputCandidateIds.length > 0) {
    checkUniqueIds(inputCandidateIds, "candidateId", errors);
  }
  if (inputArtifactIds.length > 0) {
    checkUniqueIds(inputArtifactIds, "artifactId", errors);
  }

  return makeResult(warnings, errors, 0);
};
