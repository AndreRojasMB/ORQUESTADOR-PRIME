import {
  baselineManifestBoundaries,
  cloneBaselineManifestDryRun,
  getBaselineManifestTemplateById,
  listBaselineManifestTemplates as listTemplateModels,
  supportedBaselineManifestIds,
  supportedBaselineManifestStatuses,
} from "./baselineManifestTemplates.js";
import type {
  BaselineArtifactReference,
  BaselineCandidateReference,
  BaselineManifestDryRun,
  BaselineManifestId,
  BaselineManifestInput,
  BaselineManifestResult,
  BaselineManifestStatus,
  BaselineManifestValidationFinding,
} from "./types.js";

const normalizeId = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const isSupportedManifestId = (value: string): value is BaselineManifestId =>
  supportedBaselineManifestIds.includes(value as (typeof supportedBaselineManifestIds)[number]);

const isSupportedStatus = (value: string): value is BaselineManifestStatus =>
  supportedBaselineManifestStatuses.includes(value as BaselineManifestStatus);

const boundedUnique = (values: readonly string[] | undefined, limit: number): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean))).slice(0, limit);

const finding = (
  reasonCode: string,
  safeMessage: string,
  path?: string,
): BaselineManifestValidationFinding => ({
  id: "finding_1",
  severity: "fail",
  reasonCode,
  safeMessage,
  ...(path ? { path } : {}),
});

const result = (
  status: BaselineManifestResult["status"],
  errors: BaselineManifestValidationFinding[],
  warnings: BaselineManifestValidationFinding[] = [],
  manifest?: BaselineManifestDryRun,
  manifests?: BaselineManifestDryRun[],
): BaselineManifestResult => ({
  ok: errors.length === 0 && (status === "manifest_found" || status === "manifest_built"),
  status,
  ...(manifest ? { manifest } : {}),
  ...(manifests ? { manifests } : {}),
  warnings,
  errors,
  advisoryOnly: true,
  dryRunOnly: true,
  boundaries: baselineManifestBoundaries,
});

const cloneCandidateReferences = (
  value: readonly BaselineCandidateReference[] | undefined,
): BaselineCandidateReference[] | undefined => value?.map((item) => ({ ...item }));

const cloneArtifactReferences = (
  value: readonly BaselineArtifactReference[] | undefined,
): BaselineArtifactReference[] | undefined => value?.map((item) => ({ ...item }));

export const listBaselineManifestDryRunTemplates = (): BaselineManifestDryRun[] =>
  listTemplateModels();

export const listBaselineManifestTemplates = (): BaselineManifestDryRun[] =>
  listBaselineManifestDryRunTemplates();

export const getBaselineManifestTemplate = (
  manifestId: BaselineManifestId | string,
): BaselineManifestResult => {
  const normalized = normalizeId(manifestId);
  if (!isSupportedManifestId(normalized)) {
    return result("manifest_not_found", [
      finding(
        "MANIFEST_ID_NOT_FOUND",
        "Requested baseline manifest id is not in the supported advisory registry.",
        "manifestId",
      ),
    ]);
  }

  const template = getBaselineManifestTemplateById(normalized);
  return template
    ? result("manifest_found", [], [], cloneBaselineManifestDryRun(template))
    : result("manifest_not_found", [
        finding(
          "MANIFEST_TEMPLATE_NOT_FOUND",
          "Requested baseline manifest template is not available.",
          "manifestId",
        ),
      ]);
};

export const buildBaselineManifestDryRun = (
  input: BaselineManifestInput = {},
): BaselineManifestResult => {
  const requestedManifestId = normalizeId(input.manifestId ?? "baseline_manifest_dry_run_candidate");
  if (!isSupportedManifestId(requestedManifestId)) {
    return result("input_invalid", [
      finding(
        "MANIFEST_ID_INVALID",
        "Baseline manifest input includes an unsupported manifest id.",
        "manifestId",
      ),
    ]);
  }

  if (input.status && !isSupportedStatus(input.status)) {
    return result("input_invalid", [
      finding(
        "MANIFEST_STATUS_INVALID",
        "Baseline manifest input includes an unsupported manifest status.",
        "status",
      ),
    ]);
  }

  const template = getBaselineManifestTemplateById(requestedManifestId);
  if (!template) {
    return result("manifest_not_found", [
      finding(
        "MANIFEST_TEMPLATE_NOT_FOUND",
        "Requested baseline manifest template is not available.",
        "manifestId",
      ),
    ]);
  }

  const manifestStatus: BaselineManifestStatus = input.status
    ? (input.status as BaselineManifestStatus)
    : template.status;

  const manifest: BaselineManifestDryRun = {
    ...cloneBaselineManifestDryRun(template),
    status: manifestStatus,
    name: input.name?.trim() || template.name,
    summary: input.summary?.trim() || template.summary,
    candidateReferences: cloneCandidateReferences(input.candidateReferences) ?? template.candidateReferences,
    artifactReferences: cloneArtifactReferences(input.artifactReferences) ?? template.artifactReferences,
    assumptions: [
      "Baseline manifest dry-runs are advisory metadata, not committed baseline artifacts.",
      ...boundedUnique(template.assumptions, 8),
      ...boundedUnique(input.assumptions, 8),
    ],
    knownExclusions: [
      ...boundedUnique(template.knownExclusions, 12),
      ...boundedUnique(input.knownExclusions, 8),
    ],
    advisoryOnly: true,
    dryRunOnly: true,
    boundaries: baselineManifestBoundaries,
  };

  return result("manifest_built", [], [], manifest, [manifest]);
};
