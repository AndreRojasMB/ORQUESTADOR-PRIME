import {
  listRuntimeReadinessTemplates,
  runtimeReadinessBoundaries,
  supportedRuntimeReadinessCheckIds,
} from "./runtimeReadinessTemplates.js";
import type {
  RuntimeReadinessCheck,
  RuntimeReadinessCheckId,
  RuntimeReadinessInput,
  RuntimeReadinessProfile,
  RuntimeReadinessResult,
  RuntimeReadinessValidationFinding,
} from "./types.js";

const normalizeId = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const isSupportedCheckId = (value: string): value is RuntimeReadinessCheckId =>
  supportedRuntimeReadinessCheckIds.includes(value as RuntimeReadinessCheckId);

const boundedUnique = (values: readonly string[] | undefined, limit: number): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean))).slice(0, limit);

const cloneCheck = (model: RuntimeReadinessCheck): RuntimeReadinessCheck => ({
  ...model,
  evidenceReferences: model.evidenceReferences.map((item) => ({ ...item })),
  preconditions: model.preconditions.map((item) => ({ ...item })),
  blockers: model.blockers.map((item) => ({ ...item })),
  recommendations: model.recommendations.map((item) => ({ ...item })),
  assumptions: model.assumptions.slice(),
  exclusions: model.exclusions.slice(),
  boundaries: { ...model.boundaries },
});

const finding = (
  reasonCode: string,
  safeMessage: string,
  path?: string,
): RuntimeReadinessValidationFinding => ({
  id: "finding_1",
  severity: "fail",
  reasonCode,
  safeMessage,
  ...(path ? { path } : {}),
});

const result = (
  status: RuntimeReadinessResult["status"],
  errors: RuntimeReadinessValidationFinding[],
  warnings: RuntimeReadinessValidationFinding[] = [],
  check?: RuntimeReadinessCheck,
  checks?: RuntimeReadinessCheck[],
  profile?: RuntimeReadinessProfile,
): RuntimeReadinessResult => ({
  ok: errors.length === 0 && (status === "check_found" || status === "profile_built"),
  status,
  ...(check ? { check } : {}),
  ...(checks ? { checks } : {}),
  ...(profile ? { profile } : {}),
  warnings,
  errors,
  advisoryOnly: true,
  boundaries: runtimeReadinessBoundaries,
});

export const listRuntimeReadinessCheckTemplates = (): RuntimeReadinessCheck[] =>
  listRuntimeReadinessTemplates();

export const getRuntimeReadinessCheckTemplate = (
  checkId: RuntimeReadinessCheckId | string,
): RuntimeReadinessResult => {
  const normalized = normalizeId(checkId);
  if (!isSupportedCheckId(normalized)) {
    return result("check_not_found", [
      finding(
        "CHECK_ID_NOT_FOUND",
        "Requested runtime readiness check id is not in the supported source registry.",
        "checkId",
      ),
    ]);
  }

  const template = listRuntimeReadinessTemplates().find((item) => item.checkId === normalized);
  return template
    ? result("check_found", [], [], cloneCheck(template))
    : result("check_not_found", [
        finding(
          "CHECK_TEMPLATE_NOT_FOUND",
          "Requested runtime readiness check template is not available.",
          "checkId",
        ),
      ]);
};

export const buildRuntimeReadinessProfile = (
  input: RuntimeReadinessInput = {},
): RuntimeReadinessResult => {
  const requestedCheckIds = input.checkIds?.length
    ? input.checkIds.map((checkId) => normalizeId(checkId))
    : supportedRuntimeReadinessCheckIds.slice();

  const unsupportedCheckIds = requestedCheckIds.filter((checkId) => !isSupportedCheckId(checkId));
  if (unsupportedCheckIds.length > 0) {
    return result("input_invalid", [
      {
        ...finding(
          "CHECK_ID_INVALID",
          "Runtime readiness profile input includes unsupported check ids.",
          "checkIds",
        ),
        metadata: { invalidCheckCount: unsupportedCheckIds.length },
      },
    ]);
  }

  const templates = listRuntimeReadinessTemplates();
  const checks = requestedCheckIds
    .filter(isSupportedCheckId)
    .map((checkId) => templates.find((template) => template.checkId === checkId))
    .filter((check): check is RuntimeReadinessCheck => Boolean(check))
    .map(cloneCheck);

  const includedCheckIds = checks.map((check) => check.checkId);
  const assumptions = [
    "Runtime readiness is curated advisory metadata, not a runtime probe, repository scan, or health monitor.",
    "Evidence references are metadata strings only and are not read by this source module.",
    ...boundedUnique(input.assumptions, 8),
  ];
  const exclusions = [
    "No runtime, server, worker, queue, scheduler, database, migration, backup, repair, auth, dashboard, automation, connector, action, job, CI, package, release, deployment, or store behavior is executed.",
    "No filesystem, provider, network, command, package, workflow, baseline, artifact, branch, tag, or release behavior is performed.",
    ...boundedUnique(input.exclusions, 8),
  ];

  const profile: RuntimeReadinessProfile = {
    profileId: input.profileId?.trim() || "runtime-readiness:profile:current",
    schemaVersion: "1.0",
    name: input.name?.trim() || "ORQUESTADOR-PRIME runtime readiness profile",
    summary:
      input.summary?.trim() ||
      "Curated advisory runtime readiness metadata for source-only planning and governance review.",
    checks,
    includedCheckIds,
    assumptions,
    exclusions,
    advisoryOnly: true,
    boundaries: runtimeReadinessBoundaries,
  };

  return result("profile_built", [], [], undefined, checks, profile);
};
