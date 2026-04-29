import {
  readinessBoundaries,
  supportedReadinessLaneIds,
  supportedReadinessMaturityLevels,
  supportedReadinessRiskTiers,
} from "./readinessTemplates.js";
import type {
  ReadinessBlocker,
  ReadinessEvidenceReference,
  ReadinessInput,
  ReadinessLaneId,
  ReadinessLaneModel,
  ReadinessMaturityLevel,
  ReadinessMaturitySnapshot,
  ReadinessNextStep,
  ReadinessPrecondition,
  ReadinessRiskTier,
  ReadinessValidationFinding,
  ReadinessValidationResult,
} from "./types.js";

const MAX_TEXT_LENGTH = 1200;
const MAX_ARRAY_LENGTH = 120;

const forbiddenContentPatterns: Array<{ pattern: RegExp; reasonCode: string; safeMessage: string }> = [
  {
    pattern: /@openai\/agents|fetch\s*\(|from\s+['"]fs|from\s+['"]fs\/promises|child[_-]process|exec\s*\(|spawn\s*\(|write\s*File|append\s*File|rm\s+-rf/i,
    reasonCode: "FORBIDDEN_SOURCE_BEHAVIOR_TOKEN",
    safeMessage: "Readiness metadata must not include source behavior tokens for providers, network, filesystem, or command execution.",
  },
  {
    pattern: /\bSELECT\b|\bINSERT\s+INTO\b|\bUPDATE\s+\w+\s+SET\b|\bDELETE\s+FROM\b|\bDROP\s+TABLE\b|\bCREATE\s+TABLE\b/i,
    reasonCode: "SQL_OR_SCHEMA_CONTENT",
    safeMessage: "Readiness metadata must not include SQL or database schema snippets.",
  },
  {
    pattern: /\b(reads|writes|scans|executes|dispatches|approves|runs|mutates|implements)\s+(files|filesystem|repository|runtime|dashboard|automation|connector|store|jobs|actions|approval|workflow)\b/i,
    reasonCode: "EXECUTABLE_BEHAVIOR_WORDING",
    safeMessage: "Readiness metadata must not describe executable behavior.",
  },
  {
    pattern: /\bproduction-ready\b|\bproduction ready\b|security guarantee|compliance guarantee|certification guarantee|certified secure|guarantees compliance/i,
    reasonCode: "PRODUCTION_OR_GOVERNANCE_OVERCLAIM",
    safeMessage: "Readiness metadata must not include production, security, compliance, or certification guarantees.",
  },
];

const isSupportedLaneId = (value: string): value is ReadinessLaneId =>
  supportedReadinessLaneIds.includes(value as ReadinessLaneId);

const isSupportedMaturityLevel = (value: string): value is ReadinessMaturityLevel =>
  supportedReadinessMaturityLevels.includes(value as ReadinessMaturityLevel);

const isSupportedRiskTier = (value: string): value is ReadinessRiskTier =>
  supportedReadinessRiskTiers.includes(value as ReadinessRiskTier);

const makeResult = (
  warnings: ReadinessValidationFinding[],
  errors: ReadinessValidationFinding[],
  modelCount: number,
): ReadinessValidationResult => ({
  validationId: "readiness_validation:static",
  schemaVersion: "1.0",
  valid: errors.length === 0,
  status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass",
  modelCount,
  warnings,
  errors,
  advisoryOnly: true,
  boundaries: readinessBoundaries,
});

const addFinding = (
  findings: ReadinessValidationFinding[],
  severity: ReadinessValidationFinding["severity"],
  reasonCode: string,
  safeMessage: string,
  path?: string,
  laneId?: ReadinessLaneId,
  metadata?: ReadinessValidationFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(laneId ? { laneId } : {}),
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
  errors: ReadinessValidationFinding[],
  path: string,
  laneId?: ReadinessLaneId,
): void => {
  if (typeof value === "string" && value.length > MAX_TEXT_LENGTH) {
    addFinding(
      errors,
      "fail",
      "TEXT_TOO_LONG",
      "Readiness metadata text exceeds the bounded length limit.",
      path,
      laneId,
    );
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) {
      addFinding(
        errors,
        "fail",
        "ARRAY_TOO_LONG",
        "Readiness metadata array exceeds the bounded item limit.",
        path,
        laneId,
      );
    }
    value.forEach((item, index) => checkTextBounds(item, errors, `${path}.${index}`, laneId));
  }
  if (isObject(value)) {
    Object.entries(value).forEach(([key, item]) =>
      checkTextBounds(item, errors, `${path}.${key}`, laneId),
    );
  }
};

const checkForbiddenContent = (
  value: unknown,
  errors: ReadinessValidationFinding[],
  laneId?: ReadinessLaneId,
): void => {
  safeStringValues(value).forEach((text) => {
    forbiddenContentPatterns.forEach(({ pattern, reasonCode, safeMessage }) => {
      if (pattern.test(text)) {
        addFinding(errors, "fail", reasonCode, safeMessage, undefined, laneId);
      }
    });
  });
};

const checkUniqueIds = (
  ids: string[],
  idLabel: string,
  errors: ReadinessValidationFinding[],
  laneId?: ReadinessLaneId,
): void => {
  const seen = new Set<string>();
  ids.forEach((id, index) => {
    if (!id.trim()) {
      addFinding(errors, "fail", "EMPTY_ID", `${idLabel} must not be empty.`, `${idLabel}.${index}`, laneId);
      return;
    }
    if (seen.has(id)) {
      addFinding(errors, "fail", "DUPLICATE_ID", `${idLabel} values must be unique.`, idLabel, laneId);
    }
    seen.add(id);
  });
};

const requiredArray = (
  value: unknown,
  path: string,
  errors: ReadinessValidationFinding[],
  laneId?: ReadinessLaneId,
): void => {
  if (!Array.isArray(value) || value.length === 0) {
    addFinding(
      errors,
      "fail",
      "REQUIRED_ARRAY_EMPTY",
      "Required readiness metadata arrays must be present and non-empty.",
      path,
      laneId,
    );
  }
};

const checkBoundaries = (
  model: Partial<ReadinessLaneModel | ReadinessMaturitySnapshot>,
  errors: ReadinessValidationFinding[],
  pathPrefix: string,
  laneId?: ReadinessLaneId,
): void => {
  if (model.advisoryOnly !== true) {
    addFinding(
      errors,
      "fail",
      "ADVISORY_ONLY_REQUIRED",
      "Readiness metadata must be advisory only.",
      `${pathPrefix}.advisoryOnly`,
      laneId,
    );
  }

  const boundaries = model.boundaries as Record<string, unknown> | undefined;
  if (!boundaries) {
    addFinding(
      errors,
      "fail",
      "BOUNDARIES_REQUIRED",
      "Readiness metadata must include advisory safety boundaries.",
      `${pathPrefix}.boundaries`,
      laneId,
    );
    return;
  }

  Object.keys(readinessBoundaries).forEach((boundaryName) => {
    if (boundaries[boundaryName] !== true) {
      addFinding(
        errors,
        "fail",
        "BOUNDARY_NOT_TRUE",
        "All readiness safety boundaries must be true.",
        `${pathPrefix}.boundaries.${boundaryName}`,
        laneId,
      );
    }
  });
};

const checkEvidence = (
  items: ReadinessEvidenceReference[] | undefined,
  errors: ReadinessValidationFinding[],
  laneId: ReadinessLaneId,
): void => {
  (items ?? []).forEach((item, index) => {
    if (item.metadataOnly !== true || item.noFileRead !== true) {
      addFinding(
        errors,
        "fail",
        "EVIDENCE_METADATA_ONLY_REQUIRED",
        "Evidence references must be metadata strings only and must not read files.",
        `evidenceReferences.${index}`,
        laneId,
      );
    }
    if (!item.reference.trim() || !item.safeSummary.trim()) {
      addFinding(
        errors,
        "fail",
        "EVIDENCE_REFERENCE_REQUIRED",
        "Evidence references require bounded reference and summary text.",
        `evidenceReferences.${index}`,
        laneId,
      );
    }
  });
};

const checkPreconditions = (
  items: ReadinessPrecondition[] | undefined,
  errors: ReadinessValidationFinding[],
  laneId: ReadinessLaneId,
): void => {
  (items ?? []).forEach((item, index) => {
    if (item.metadataOnly !== true) {
      addFinding(
        errors,
        "fail",
        "PRECONDITION_METADATA_ONLY_REQUIRED",
        "Preconditions must remain metadata only.",
        `preconditions.${index}`,
        laneId,
      );
    }
  });
};

const checkBlockers = (
  items: ReadinessBlocker[] | undefined,
  errors: ReadinessValidationFinding[],
  laneId: ReadinessLaneId,
): void => {
  (items ?? []).forEach((item, index) => {
    if (!isSupportedRiskTier(item.severity)) {
      addFinding(
        errors,
        "fail",
        "BLOCKER_SEVERITY_INVALID",
        "Blocker severity must be a supported risk tier.",
        `blockers.${index}.severity`,
        laneId,
      );
    }
    if (item.metadataOnly !== true) {
      addFinding(
        errors,
        "fail",
        "BLOCKER_METADATA_ONLY_REQUIRED",
        "Blockers must remain metadata only.",
        `blockers.${index}`,
        laneId,
      );
    }
  });
};

const checkNextSteps = (
  items: ReadinessNextStep[] | undefined,
  errors: ReadinessValidationFinding[],
  laneId: ReadinessLaneId,
): void => {
  (items ?? []).forEach((item, index) => {
    if (item.recommendationOnly !== true || item.noExecution !== true) {
      addFinding(
        errors,
        "fail",
        "NEXT_STEP_RECOMMENDATION_ONLY_REQUIRED",
        "Next steps must be recommendations only and must not execute.",
        `nextSteps.${index}`,
        laneId,
      );
    }
  });
};

const validateLaneShape = (
  model: Partial<ReadinessLaneModel>,
  errors: ReadinessValidationFinding[],
  warnings: ReadinessValidationFinding[],
  pathPrefix = "model",
): void => {
  const laneId = model.laneId && isSupportedLaneId(model.laneId) ? model.laneId : undefined;

  if (!model.laneId || !isSupportedLaneId(model.laneId)) {
    addFinding(errors, "fail", "LANE_ID_INVALID", "Readiness lane id must be supported.", `${pathPrefix}.laneId`);
  }
  if (model.schemaVersion !== "1.0") {
    addFinding(errors, "fail", "SCHEMA_VERSION_INVALID", "Readiness schema version must be 1.0.", `${pathPrefix}.schemaVersion`, laneId);
  }
  if (!model.name?.trim() || !model.summary?.trim()) {
    addFinding(errors, "fail", "NAME_SUMMARY_REQUIRED", "Readiness lane name and summary are required.", `${pathPrefix}.name`, laneId);
  }
  if (!model.maturityLevel || !isSupportedMaturityLevel(model.maturityLevel)) {
    addFinding(errors, "fail", "MATURITY_LEVEL_INVALID", "Readiness maturity level must be supported.", `${pathPrefix}.maturityLevel`, laneId);
  }
  if (!model.riskTier || !isSupportedRiskTier(model.riskTier)) {
    addFinding(errors, "fail", "RISK_TIER_INVALID", "Readiness risk tier must be supported.", `${pathPrefix}.riskTier`, laneId);
  }

  requiredArray(model.evidenceReferences, `${pathPrefix}.evidenceReferences`, errors, laneId);
  requiredArray(model.preconditions, `${pathPrefix}.preconditions`, errors, laneId);
  requiredArray(model.blockers, `${pathPrefix}.blockers`, errors, laneId);
  requiredArray(model.nextSteps, `${pathPrefix}.nextSteps`, errors, laneId);
  requiredArray(model.assumptions, `${pathPrefix}.assumptions`, errors, laneId);
  requiredArray(model.exclusions, `${pathPrefix}.exclusions`, errors, laneId);

  checkUniqueIds((model.evidenceReferences ?? []).map((item) => item.evidenceId), "evidenceId", errors, laneId);
  checkUniqueIds((model.preconditions ?? []).map((item) => item.preconditionId), "preconditionId", errors, laneId);
  checkUniqueIds((model.blockers ?? []).map((item) => item.blockerId), "blockerId", errors, laneId);
  checkUniqueIds((model.nextSteps ?? []).map((item) => item.nextStepId), "nextStepId", errors, laneId);

  if (laneId) {
    checkEvidence(model.evidenceReferences, errors, laneId);
    checkPreconditions(model.preconditions, errors, laneId);
    checkBlockers(model.blockers, errors, laneId);
    checkNextSteps(model.nextSteps, errors, laneId);
  }

  if (model.maturityLevel === "future_gated_execution") {
    addFinding(
      warnings,
      "warn",
      "FUTURE_GATED_EXECUTION_REQUIRES_REVIEW",
      "Future gated execution maturity should only appear as a deferred target, not current behavior.",
      `${pathPrefix}.maturityLevel`,
      laneId,
    );
  }

  checkBoundaries(model, errors, pathPrefix, laneId);
  checkTextBounds(model, errors, pathPrefix, laneId);
  checkForbiddenContent(model, errors, laneId);
};

export const validateReadinessLaneModel = (
  model: ReadinessLaneModel,
): ReadinessValidationResult => {
  const warnings: ReadinessValidationFinding[] = [];
  const errors: ReadinessValidationFinding[] = [];
  validateLaneShape(model, errors, warnings);
  return makeResult(warnings, errors, 1);
};

export const validateReadinessLaneModels = (
  models: ReadinessLaneModel[],
): ReadinessValidationResult => {
  const warnings: ReadinessValidationFinding[] = [];
  const errors: ReadinessValidationFinding[] = [];

  if (!Array.isArray(models) || models.length === 0) {
    addFinding(errors, "fail", "MODELS_REQUIRED", "At least one readiness lane model is required.");
    return makeResult(warnings, errors, 0);
  }

  const laneIds = new Set<string>();
  models.forEach((model, index) => {
    validateLaneShape(model, errors, warnings, `models.${index}`);
    if (model.laneId) {
      if (laneIds.has(model.laneId)) {
        addFinding(errors, "fail", "DUPLICATE_LANE_ID", "Readiness lane ids must be unique.", `models.${index}.laneId`, model.laneId);
      }
      laneIds.add(model.laneId);
    }
  });

  supportedReadinessLaneIds.forEach((laneId) => {
    if (!laneIds.has(laneId)) {
      addFinding(
        warnings,
        "warn",
        "SUPPORTED_LANE_MISSING",
        "A supported readiness lane is missing from this model set.",
        "laneId",
        laneId,
      );
    }
  });

  return makeResult(warnings, errors, models.length);
};

export const validateReadinessMaturitySnapshot = (
  snapshot: ReadinessMaturitySnapshot,
): ReadinessValidationResult => {
  const warnings: ReadinessValidationFinding[] = [];
  const errors: ReadinessValidationFinding[] = [];

  if (!snapshot.snapshotId.trim() || !snapshot.name.trim() || !snapshot.summary.trim()) {
    addFinding(errors, "fail", "SNAPSHOT_REQUIRED_FIELDS", "Snapshot id, name, and summary are required.", "snapshot");
  }
  if (snapshot.schemaVersion !== "1.0") {
    addFinding(errors, "fail", "SCHEMA_VERSION_INVALID", "Readiness snapshot schema version must be 1.0.", "schemaVersion");
  }
  requiredArray(snapshot.lanes, "lanes", errors);
  requiredArray(snapshot.includedLaneIds, "includedLaneIds", errors);
  requiredArray(snapshot.assumptions, "assumptions", errors);
  requiredArray(snapshot.exclusions, "exclusions", errors);
  checkBoundaries(snapshot, errors, "snapshot");

  snapshot.includedLaneIds.forEach((laneId, index) => {
    if (!isSupportedLaneId(laneId)) {
      addFinding(errors, "fail", "LANE_ID_INVALID", "Snapshot included lane ids must be supported.", `includedLaneIds.${index}`);
    }
  });
  snapshot.lanes.forEach((model, index) => validateLaneShape(model, errors, warnings, `lanes.${index}`));
  checkTextBounds(snapshot, errors, "snapshot");
  checkForbiddenContent(snapshot, errors);

  return makeResult(warnings, errors, snapshot.lanes.length);
};

export const validateReadinessInput = (
  input: ReadinessInput,
): ReadinessValidationResult => {
  const warnings: ReadinessValidationFinding[] = [];
  const errors: ReadinessValidationFinding[] = [];

  (input.laneIds ?? []).forEach((laneId, index) => {
    const normalized = laneId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    if (!isSupportedLaneId(normalized)) {
      addFinding(errors, "fail", "LANE_ID_INVALID", "Readiness input lane ids must be supported.", `laneIds.${index}`);
    }
  });

  checkTextBounds(input, errors, "input");
  checkForbiddenContent(input, errors);
  return makeResult(warnings, errors, 0);
};
