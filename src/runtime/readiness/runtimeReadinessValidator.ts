import {
  runtimeReadinessBoundaries,
  supportedRuntimeReadinessCategories,
  supportedRuntimeReadinessCheckIds,
  supportedRuntimeReadinessLevels,
  supportedRuntimeReadinessRiskTiers,
} from "./runtimeReadinessTemplates.js";
import type {
  RuntimeReadinessBlocker,
  RuntimeReadinessCategory,
  RuntimeReadinessCheck,
  RuntimeReadinessCheckId,
  RuntimeReadinessEvidenceReference,
  RuntimeReadinessInput,
  RuntimeReadinessLevel,
  RuntimeReadinessPrecondition,
  RuntimeReadinessProfile,
  RuntimeReadinessRecommendation,
  RuntimeReadinessRiskTier,
  RuntimeReadinessValidationFinding,
  RuntimeReadinessValidationResult,
} from "./types.js";

const MAX_TEXT_LENGTH = 1200;
const MAX_ARRAY_LENGTH = 120;

const forbiddenContentPatterns: Array<{ pattern: RegExp; reasonCode: string; safeMessage: string }> = [
  {
    pattern: /@openai\/agents|fetch\s*\(|from\s+['"]fs|from\s+['"]fs\/promises|child[_-]process|exec\s*\(|spawn\s*\(|write\s*File|append\s*File|mkdir|rm\s+-rf/i,
    reasonCode: "FORBIDDEN_SOURCE_BEHAVIOR_TOKEN",
    safeMessage: "Runtime readiness metadata must not include source behavior tokens for providers, network, filesystem, or command execution.",
  },
  {
    pattern:
      /\b(performs?|performed|runs?|ran|executes?|executed|starts?|started)\s+(a\s+|the\s+)?(repo\s+scan|repository\s+scan|repository\s+inspection)\b|\b(scans?\s+(repo|repository)|reads?\s+(files|stores)|writes?\s+(files|stores))\b/i,
    reasonCode: "FORBIDDEN_SCAN_OR_FILE_BEHAVIOR",
    safeMessage: "Runtime readiness metadata must not describe repo scanning or file/store behavior.",
  },
  {
    pattern:
      /\b(implements?|implemented|starts?|runs?|executes?|enables?|creates?|launches?)\s+(a\s+|the\s+)?(server|listener|worker|queue|scheduler)\b|\b(server|listener|worker|queue|scheduler)\s+(starts?|runs?|executes?|enables?)\b/i,
    reasonCode: "FORBIDDEN_RUNTIME_IMPLEMENTATION_WORDING",
    safeMessage: "Runtime readiness metadata must not describe server, listener, worker, queue, or scheduler behavior as implemented.",
  },
  {
    pattern:
      /\b(implements?|implemented|creates?|applies?|executes?)\s+(a\s+|the\s+)?(DB\s+adapter|DB\s+schema|database\s+schema|SQL)\b|\bSQL\s+execution\b|\bSELECT\b|\bINSERT\s+INTO\b|\bUPDATE\s+\w+\s+SET\b|\bDELETE\s+FROM\b|\bDROP\s+TABLE\b|\bCREATE\s+TABLE\b/i,
    reasonCode: "DB_SCHEMA_OR_SQL_CONTENT",
    safeMessage: "Runtime readiness metadata must not include database adapter, schema, or SQL snippets.",
  },
  {
    pattern:
      /\b(performs?|performed|executes?|executed|enforces?|enforced|applies?|applied)\s+(a\s+|the\s+)?(migration\s+apply|backup|restore|repair|auth|rate-limit)\b|\b(migration\s+apply|backup\s+execution|restore\s+execution|repair\s+execution|auth\s+enforcement|rate-limit\s+enforcement)\s+(is|are)\s+(implemented|enabled|active)\b/i,
    reasonCode: "FORBIDDEN_OPERATIONAL_ENFORCEMENT_WORDING",
    safeMessage: "Runtime readiness metadata must not describe migration apply, backup, restore, repair, auth, or rate-limit enforcement behavior.",
  },
  {
    pattern:
      /\b(executes?|executed|performs?|performed|runs?|ran)\s+(a\s+|the\s+)?(runtime|automation|connector|dashboard|action|proposal|approval|job)\b|\b(mutates?|mutated|writes?|wrote)\s+(a\s+|the\s+)?(store|memory|learning|baseline|artifact)\b/i,
    reasonCode: "FORBIDDEN_EXECUTION_OR_MUTATION_WORDING",
    safeMessage: "Runtime readiness metadata must not describe execution or mutation behavior.",
  },
  {
    pattern: /\bproduction-ready\b|\bproduction ready\b|security guarantee|compliance guarantee|certification guarantee|certified secure|guarantees compliance/i,
    reasonCode: "PRODUCTION_OR_GOVERNANCE_OVERCLAIM",
    safeMessage: "Runtime readiness metadata must not include production, security, compliance, or certification guarantees.",
  },
];

const isSupportedCheckId = (value: string): value is RuntimeReadinessCheckId =>
  supportedRuntimeReadinessCheckIds.includes(value as RuntimeReadinessCheckId);

const isSupportedCategory = (value: string): value is RuntimeReadinessCategory =>
  supportedRuntimeReadinessCategories.includes(value as RuntimeReadinessCategory);

const isSupportedReadinessLevel = (value: string): value is RuntimeReadinessLevel =>
  supportedRuntimeReadinessLevels.includes(value as RuntimeReadinessLevel);

const isSupportedRiskTier = (value: string): value is RuntimeReadinessRiskTier =>
  supportedRuntimeReadinessRiskTiers.includes(value as RuntimeReadinessRiskTier);

const makeResult = (
  warnings: RuntimeReadinessValidationFinding[],
  errors: RuntimeReadinessValidationFinding[],
  checkCount: number,
): RuntimeReadinessValidationResult => ({
  validationId: "runtime_readiness_validation:static",
  schemaVersion: "1.0",
  valid: errors.length === 0,
  status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass",
  checkCount,
  warnings,
  errors,
  advisoryOnly: true,
  boundaries: runtimeReadinessBoundaries,
});

const addFinding = (
  findings: RuntimeReadinessValidationFinding[],
  severity: RuntimeReadinessValidationFinding["severity"],
  reasonCode: string,
  safeMessage: string,
  path?: string,
  checkId?: RuntimeReadinessCheckId,
  metadata?: RuntimeReadinessValidationFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(checkId ? { checkId } : {}),
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
  errors: RuntimeReadinessValidationFinding[],
  path: string,
  checkId?: RuntimeReadinessCheckId,
): void => {
  if (typeof value === "string" && value.length > MAX_TEXT_LENGTH) {
    addFinding(
      errors,
      "fail",
      "TEXT_TOO_LONG",
      "Runtime readiness metadata text exceeds the bounded length limit.",
      path,
      checkId,
    );
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) {
      addFinding(
        errors,
        "fail",
        "ARRAY_TOO_LONG",
        "Runtime readiness metadata array exceeds the bounded item limit.",
        path,
        checkId,
      );
    }
    value.forEach((item, index) => checkTextBounds(item, errors, `${path}.${index}`, checkId));
  }
  if (isObject(value)) {
    Object.entries(value).forEach(([key, item]) =>
      checkTextBounds(item, errors, `${path}.${key}`, checkId),
    );
  }
};

const checkForbiddenContent = (
  value: unknown,
  errors: RuntimeReadinessValidationFinding[],
  checkId?: RuntimeReadinessCheckId,
): void => {
  safeStringValues(value).forEach((text) => {
    forbiddenContentPatterns.forEach(({ pattern, reasonCode, safeMessage }) => {
      if (pattern.test(text)) {
        addFinding(errors, "fail", reasonCode, safeMessage, undefined, checkId);
      }
    });
  });
};

const checkUniqueIds = (
  ids: string[],
  idLabel: string,
  errors: RuntimeReadinessValidationFinding[],
  checkId?: RuntimeReadinessCheckId,
): void => {
  const seen = new Set<string>();
  ids.forEach((id, index) => {
    if (!id.trim()) {
      addFinding(errors, "fail", "EMPTY_ID", `${idLabel} must not be empty.`, `${idLabel}.${index}`, checkId);
      return;
    }
    if (seen.has(id)) {
      addFinding(errors, "fail", "DUPLICATE_ID", `${idLabel} values must be unique.`, idLabel, checkId);
    }
    seen.add(id);
  });
};

const requiredArray = (
  value: unknown,
  path: string,
  errors: RuntimeReadinessValidationFinding[],
  checkId?: RuntimeReadinessCheckId,
): void => {
  if (!Array.isArray(value) || value.length === 0) {
    addFinding(
      errors,
      "fail",
      "REQUIRED_ARRAY_EMPTY",
      "Required runtime readiness metadata arrays must be present and non-empty.",
      path,
      checkId,
    );
  }
};

const checkBoundaries = (
  model: Partial<RuntimeReadinessCheck | RuntimeReadinessProfile>,
  errors: RuntimeReadinessValidationFinding[],
  pathPrefix: string,
  checkId?: RuntimeReadinessCheckId,
): void => {
  if (model.advisoryOnly !== true) {
    addFinding(
      errors,
      "fail",
      "ADVISORY_ONLY_REQUIRED",
      "Runtime readiness metadata must be advisory only.",
      `${pathPrefix}.advisoryOnly`,
      checkId,
    );
  }

  const boundaries = model.boundaries as unknown as Record<string, unknown> | undefined;
  if (!boundaries) {
    addFinding(
      errors,
      "fail",
      "BOUNDARIES_REQUIRED",
      "Runtime readiness metadata must include advisory safety boundaries.",
      `${pathPrefix}.boundaries`,
      checkId,
    );
    return;
  }

  const expectedBoundaries = runtimeReadinessBoundaries as unknown as Record<string, true>;
  Object.keys(expectedBoundaries).forEach((boundaryName) => {
    if (boundaries[boundaryName] !== true) {
      addFinding(
        errors,
        "fail",
        "BOUNDARY_NOT_TRUE",
        "All runtime readiness safety boundaries must be true.",
        `${pathPrefix}.boundaries.${boundaryName}`,
        checkId,
      );
    }
  });
};

const checkEvidence = (
  items: RuntimeReadinessEvidenceReference[] | undefined,
  errors: RuntimeReadinessValidationFinding[],
  checkId: RuntimeReadinessCheckId,
): void => {
  (items ?? []).forEach((item, index) => {
    if (item.metadataOnly !== true || item.noFileRead !== true) {
      addFinding(
        errors,
        "fail",
        "EVIDENCE_METADATA_ONLY_REQUIRED",
        "Evidence references must be metadata strings only and must not read files.",
        `evidenceReferences.${index}`,
        checkId,
      );
    }
    if (!item.reference.trim() || !item.safeSummary.trim()) {
      addFinding(
        errors,
        "fail",
        "EVIDENCE_REFERENCE_REQUIRED",
        "Evidence references require bounded reference and summary text.",
        `evidenceReferences.${index}`,
        checkId,
      );
    }
  });
};

const checkPreconditions = (
  items: RuntimeReadinessPrecondition[] | undefined,
  errors: RuntimeReadinessValidationFinding[],
  checkId: RuntimeReadinessCheckId,
): void => {
  (items ?? []).forEach((item, index) => {
    if (item.metadataOnly !== true) {
      addFinding(
        errors,
        "fail",
        "PRECONDITION_METADATA_ONLY_REQUIRED",
        "Preconditions must remain metadata only.",
        `preconditions.${index}`,
        checkId,
      );
    }
  });
};

const checkBlockers = (
  items: RuntimeReadinessBlocker[] | undefined,
  errors: RuntimeReadinessValidationFinding[],
  checkId: RuntimeReadinessCheckId,
): void => {
  (items ?? []).forEach((item, index) => {
    if (!isSupportedRiskTier(item.severity)) {
      addFinding(
        errors,
        "fail",
        "BLOCKER_SEVERITY_INVALID",
        "Blocker severity must be a supported risk tier.",
        `blockers.${index}.severity`,
        checkId,
      );
    }
    if (item.metadataOnly !== true) {
      addFinding(
        errors,
        "fail",
        "BLOCKER_METADATA_ONLY_REQUIRED",
        "Blockers must remain metadata only.",
        `blockers.${index}`,
        checkId,
      );
    }
  });
};

const checkRecommendations = (
  items: RuntimeReadinessRecommendation[] | undefined,
  errors: RuntimeReadinessValidationFinding[],
  checkId: RuntimeReadinessCheckId,
): void => {
  (items ?? []).forEach((item, index) => {
    if (item.recommendationOnly !== true || item.noExecution !== true) {
      addFinding(
        errors,
        "fail",
        "RECOMMENDATION_ONLY_REQUIRED",
        "Recommendations must be metadata only and must not execute.",
        `recommendations.${index}`,
        checkId,
      );
    }
  });
};

const validateCheckShape = (
  check: Partial<RuntimeReadinessCheck>,
  errors: RuntimeReadinessValidationFinding[],
  warnings: RuntimeReadinessValidationFinding[],
  pathPrefix = "check",
): void => {
  const checkId = check.checkId && isSupportedCheckId(check.checkId) ? check.checkId : undefined;

  if (!check.checkId || !isSupportedCheckId(check.checkId)) {
    addFinding(errors, "fail", "CHECK_ID_INVALID", "Runtime readiness check id must be supported.", `${pathPrefix}.checkId`);
  }
  if (check.schemaVersion !== "1.0") {
    addFinding(errors, "fail", "SCHEMA_VERSION_INVALID", "Runtime readiness schema version must be 1.0.", `${pathPrefix}.schemaVersion`, checkId);
  }
  if (!check.category || !isSupportedCategory(check.category)) {
    addFinding(errors, "fail", "CATEGORY_INVALID", "Runtime readiness category must be supported.", `${pathPrefix}.category`, checkId);
  }
  if (!check.name?.trim() || !check.summary?.trim() || !check.currentStatus?.trim()) {
    addFinding(errors, "fail", "REQUIRED_TEXT_MISSING", "Runtime readiness name, summary, and current status are required.", `${pathPrefix}.name`, checkId);
  }
  if (!check.readinessLevel || !isSupportedReadinessLevel(check.readinessLevel)) {
    addFinding(errors, "fail", "READINESS_LEVEL_INVALID", "Runtime readiness level must be supported.", `${pathPrefix}.readinessLevel`, checkId);
  }
  if (!check.riskTier || !isSupportedRiskTier(check.riskTier)) {
    addFinding(errors, "fail", "RISK_TIER_INVALID", "Runtime readiness risk tier must be supported.", `${pathPrefix}.riskTier`, checkId);
  }

  requiredArray(check.evidenceReferences, `${pathPrefix}.evidenceReferences`, errors, checkId);
  requiredArray(check.preconditions, `${pathPrefix}.preconditions`, errors, checkId);
  requiredArray(check.blockers, `${pathPrefix}.blockers`, errors, checkId);
  requiredArray(check.recommendations, `${pathPrefix}.recommendations`, errors, checkId);
  requiredArray(check.assumptions, `${pathPrefix}.assumptions`, errors, checkId);
  requiredArray(check.exclusions, `${pathPrefix}.exclusions`, errors, checkId);

  checkUniqueIds((check.evidenceReferences ?? []).map((item) => item.evidenceId), "evidenceId", errors, checkId);
  checkUniqueIds((check.preconditions ?? []).map((item) => item.preconditionId), "preconditionId", errors, checkId);
  checkUniqueIds((check.blockers ?? []).map((item) => item.blockerId), "blockerId", errors, checkId);
  checkUniqueIds((check.recommendations ?? []).map((item) => item.recommendationId), "recommendationId", errors, checkId);

  if (checkId) {
    checkEvidence(check.evidenceReferences, errors, checkId);
    checkPreconditions(check.preconditions, errors, checkId);
    checkBlockers(check.blockers, errors, checkId);
    checkRecommendations(check.recommendations, errors, checkId);
  }

  if (check.readinessLevel === "future_gated_execution") {
    addFinding(
      warnings,
      "warn",
      "FUTURE_GATED_EXECUTION_REQUIRES_REVIEW",
      "Future gated execution readiness should only appear as a deferred target, not current behavior.",
      `${pathPrefix}.readinessLevel`,
      checkId,
    );
  }

  checkBoundaries(check, errors, pathPrefix, checkId);
  checkTextBounds(check, errors, pathPrefix, checkId);
  checkForbiddenContent(check, errors, checkId);
};

export const validateRuntimeReadinessCheck = (
  check: RuntimeReadinessCheck,
): RuntimeReadinessValidationResult => {
  const warnings: RuntimeReadinessValidationFinding[] = [];
  const errors: RuntimeReadinessValidationFinding[] = [];
  validateCheckShape(check, errors, warnings);
  return makeResult(warnings, errors, 1);
};

export const validateRuntimeReadinessChecks = (
  checks: RuntimeReadinessCheck[],
): RuntimeReadinessValidationResult => {
  const warnings: RuntimeReadinessValidationFinding[] = [];
  const errors: RuntimeReadinessValidationFinding[] = [];

  if (!Array.isArray(checks) || checks.length === 0) {
    addFinding(errors, "fail", "CHECKS_REQUIRED", "At least one runtime readiness check is required.");
    return makeResult(warnings, errors, 0);
  }

  const checkIds = new Set<string>();
  checks.forEach((check, index) => {
    validateCheckShape(check, errors, warnings, `checks.${index}`);
    if (check.checkId) {
      if (checkIds.has(check.checkId)) {
        addFinding(errors, "fail", "DUPLICATE_CHECK_ID", "Runtime readiness check ids must be unique.", `checks.${index}.checkId`, check.checkId);
      }
      checkIds.add(check.checkId);
    }
  });

  supportedRuntimeReadinessCheckIds.forEach((checkId) => {
    if (!checkIds.has(checkId)) {
      addFinding(
        warnings,
        "warn",
        "SUPPORTED_CHECK_MISSING",
        "A supported runtime readiness check is missing from this model set.",
        "checkId",
        checkId,
      );
    }
  });

  return makeResult(warnings, errors, checks.length);
};

export const validateRuntimeReadinessProfile = (
  profile: RuntimeReadinessProfile,
): RuntimeReadinessValidationResult => {
  const warnings: RuntimeReadinessValidationFinding[] = [];
  const errors: RuntimeReadinessValidationFinding[] = [];

  if (!profile.profileId.trim() || !profile.name.trim() || !profile.summary.trim()) {
    addFinding(errors, "fail", "PROFILE_REQUIRED_FIELDS", "Profile id, name, and summary are required.", "profile");
  }
  if (profile.schemaVersion !== "1.0") {
    addFinding(errors, "fail", "SCHEMA_VERSION_INVALID", "Runtime readiness profile schema version must be 1.0.", "schemaVersion");
  }
  requiredArray(profile.checks, "checks", errors);
  requiredArray(profile.includedCheckIds, "includedCheckIds", errors);
  requiredArray(profile.assumptions, "assumptions", errors);
  requiredArray(profile.exclusions, "exclusions", errors);
  checkBoundaries(profile, errors, "profile");

  profile.includedCheckIds.forEach((checkId, index) => {
    if (!isSupportedCheckId(checkId)) {
      addFinding(errors, "fail", "CHECK_ID_INVALID", "Profile included check ids must be supported.", `includedCheckIds.${index}`);
    }
  });
  profile.checks.forEach((check, index) => validateCheckShape(check, errors, warnings, `checks.${index}`));
  checkTextBounds(profile, errors, "profile");
  checkForbiddenContent(profile, errors);

  return makeResult(warnings, errors, profile.checks.length);
};

export const validateRuntimeReadinessInput = (
  input: RuntimeReadinessInput,
): RuntimeReadinessValidationResult => {
  const warnings: RuntimeReadinessValidationFinding[] = [];
  const errors: RuntimeReadinessValidationFinding[] = [];

  (input.checkIds ?? []).forEach((checkId, index) => {
    const normalized = checkId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    if (!isSupportedCheckId(normalized)) {
      addFinding(errors, "fail", "CHECK_ID_INVALID", "Runtime readiness input check ids must be supported.", `checkIds.${index}`);
    }
  });

  checkTextBounds(input, errors, "input");
  checkForbiddenContent(input, errors);
  return makeResult(warnings, errors, 0);
};
