import {
  listReadinessTemplates as cloneReadinessTemplates,
  readinessBoundaries,
  supportedReadinessLaneIds,
} from "./readinessTemplates.js";
import type {
  ReadinessInput,
  ReadinessLaneId,
  ReadinessLaneModel,
  ReadinessMaturitySnapshot,
  ReadinessResult,
  ReadinessValidationFinding,
} from "./types.js";

const normalizeId = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const isSupportedLaneId = (value: string): value is ReadinessLaneId =>
  supportedReadinessLaneIds.includes(value as ReadinessLaneId);

const boundedUnique = (values: readonly string[] | undefined, limit: number): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean))).slice(0, limit);

const cloneLane = (model: ReadinessLaneModel): ReadinessLaneModel => ({
  ...model,
  evidenceReferences: model.evidenceReferences.map((item) => ({ ...item })),
  preconditions: model.preconditions.map((item) => ({ ...item })),
  blockers: model.blockers.map((item) => ({ ...item })),
  nextSteps: model.nextSteps.map((item) => ({ ...item })),
  assumptions: model.assumptions.slice(),
  exclusions: model.exclusions.slice(),
  boundaries: { ...model.boundaries },
});

const finding = (
  reasonCode: string,
  safeMessage: string,
  path?: string,
): ReadinessValidationFinding => ({
  id: "finding_1",
  severity: "fail",
  reasonCode,
  safeMessage,
  ...(path ? { path } : {}),
});

const result = (
  status: ReadinessResult["status"],
  errors: ReadinessValidationFinding[],
  warnings: ReadinessValidationFinding[] = [],
  lane?: ReadinessLaneModel,
  lanes?: ReadinessLaneModel[],
  snapshot?: ReadinessMaturitySnapshot,
): ReadinessResult => ({
  ok: errors.length === 0 && (status === "lane_found" || status === "snapshot_built"),
  status,
  ...(lane ? { lane } : {}),
  ...(lanes ? { lanes } : {}),
  ...(snapshot ? { snapshot } : {}),
  warnings,
  errors,
  advisoryOnly: true,
  boundaries: readinessBoundaries,
});

export const listReadinessLaneTemplates = (): ReadinessLaneModel[] =>
  cloneReadinessTemplates();

export const getReadinessLaneTemplate = (
  laneId: ReadinessLaneId | string,
): ReadinessResult => {
  const normalized = normalizeId(laneId);
  if (!isSupportedLaneId(normalized)) {
    return result("lane_not_found", [
      finding(
        "LANE_ID_NOT_FOUND",
        "Requested readiness lane id is not in the supported source registry.",
        "laneId",
      ),
    ]);
  }

  const template = cloneReadinessTemplates().find((item) => item.laneId === normalized);
  return template
    ? result("lane_found", [], [], cloneLane(template))
    : result("lane_not_found", [
        finding(
          "LANE_TEMPLATE_NOT_FOUND",
          "Requested readiness lane template is not available.",
          "laneId",
        ),
      ]);
};

export const buildReadinessMaturitySnapshot = (
  input: ReadinessInput = {},
): ReadinessResult => {
  const requestedLaneIds = input.laneIds?.length
    ? input.laneIds.map((laneId) => normalizeId(laneId))
    : supportedReadinessLaneIds.slice();

  const unsupportedLaneIds = requestedLaneIds.filter((laneId) => !isSupportedLaneId(laneId));
  if (unsupportedLaneIds.length > 0) {
    return result("input_invalid", [
      {
        ...finding(
          "LANE_ID_INVALID",
          "Readiness snapshot input includes unsupported lane ids.",
          "laneIds",
        ),
        metadata: { invalidLaneCount: unsupportedLaneIds.length },
      },
    ]);
  }

  const templates = cloneReadinessTemplates();
  const lanes = requestedLaneIds
    .filter(isSupportedLaneId)
    .map((laneId) => templates.find((template) => template.laneId === laneId))
    .filter((lane): lane is ReadinessLaneModel => Boolean(lane))
    .map(cloneLane);

  const includedLaneIds = lanes.map((lane) => lane.laneId);
  const assumptions = [
    "Readiness is a curated advisory snapshot, not a repository scan or runtime monitor.",
    "Evidence references are metadata strings only and are not read by this source module.",
    ...boundedUnique(input.assumptions, 8),
  ];
  const exclusions = [
    "No runtime, dashboard, automation, connector, action, job, CI, release, deployment, or store behavior is executed.",
    "No filesystem, provider, network, command, package, workflow, baseline, artifact, branch, tag, or release behavior is performed.",
    ...boundedUnique(input.exclusions, 8),
  ];

  const snapshot: ReadinessMaturitySnapshot = {
    snapshotId: input.snapshotId?.trim() || "readiness:snapshot:current",
    schemaVersion: "1.0",
    name: input.name?.trim() || "ORQUESTADOR-PRIME readiness maturity snapshot",
    summary:
      input.summary?.trim() ||
      "Curated advisory maturity metadata for source-only planning and governance review.",
    lanes,
    includedLaneIds,
    assumptions,
    exclusions,
    advisoryOnly: true,
    boundaries: readinessBoundaries,
  };

  return result("snapshot_built", [], [], undefined, lanes, snapshot);
};
