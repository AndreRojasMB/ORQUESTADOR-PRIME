import { getBusinessSystemFamily } from "../catalog/businessSystemsCatalog.js";
import type { ModuleBlueprint, ModuleBlueprintBoundary, ModuleBlueprintValidationFinding, ModuleBlueprintValidationResult, ModuleBlueprintValidationStatus } from "./types.js";
import { moduleBlueprintBoundaries } from "./moduleBlueprintGenerator.js";

const SCHEMA_VERSION = "1.0" as const;
const MAX_TEXT_LENGTH = 1_200;
const MAX_ARRAY_LENGTH = 80;

const boundaryKeys = [
  "advisoryOnly",
  "noCodeGeneration",
  "noScaffolding",
  "noDbSchemas",
  "noFileWrites",
  "noRuntimeExecution",
  "noProviderCalls",
  "noNetwork",
  "noActionDispatch",
  "noProposalCreation",
  "noStoreMutation",
] as const satisfies readonly (keyof ModuleBlueprintBoundary)[];

const requiredArrayFields = [
  "actors",
  "responsibilities",
  "entities",
  "workflows",
  "permissions",
  "reports",
  "integrations",
  "businessRules",
  "auditConcerns",
  "risks",
  "assumptions",
  "uiPatterns",
  "dataConsiderations",
  "testConsiderations",
  "implementationNotes",
] as const;

const certificationClaimPatterns = [
  "certified",
  "guarantees compliance",
  "legally compliant",
];

const forbiddenContentPatterns = [
  "token",
  "apikey",
  "api key",
  "secret",
  "password",
  "bearer",
  "provider output",
  "generated code",
  "generated file",
  "scaffold instruction",
  "scaffold output",
  "create table",
  "action dispatch",
  "proposal creation",
  "runtime execution",
];

const pathLikePattern = /(?:[A-Za-z]:\\|\/(?:home|users|tmp|var|etc|root)\/)/i;

const makeValidationId = (): string =>
  `module_blueprint_validation_${Date.now().toString(36)}`;

const addFinding = (
  findings: ModuleBlueprintValidationFinding[],
  severity: "warn" | "fail",
  reasonCode: string,
  safeMessage: string,
  familyId?: string,
  moduleId?: string,
  metadata?: Record<string, string | number | boolean>,
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(familyId ? { familyId } : {}),
    ...(moduleId ? { moduleId } : {}),
    ...(metadata ? { metadata } : {}),
  });
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const safeStringValues = (value: unknown): string[] => {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(safeStringValues);
  }
  if (isRecord(value)) {
    return Object.values(value).flatMap(safeStringValues);
  }
  return [];
};

const includesPattern = (text: string, pattern: string): boolean =>
  text.toLowerCase().includes(pattern.toLowerCase());

const hasAllBoundaries = (value: unknown): value is ModuleBlueprintBoundary =>
  isRecord(value) && boundaryKeys.every((key) => value[key] === true);

const normalizeId = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const validateBlueprintShape = (
  blueprint: unknown,
  index: number,
  errors: ModuleBlueprintValidationFinding[],
  warnings: ModuleBlueprintValidationFinding[],
): void => {
  if (!isRecord(blueprint)) {
    addFinding(
      errors,
      "fail",
      "INVALID_BLUEPRINT",
      "Module blueprint must be an object.",
      undefined,
      undefined,
      { index },
    );
    return;
  }

  const familyId = isNonEmptyString(blueprint.familyId) ? blueprint.familyId : undefined;
  const moduleId = isNonEmptyString(blueprint.moduleId) ? blueprint.moduleId : undefined;

  ["blueprintId", "createdAt", "familyId", "moduleId", "name", "purpose"].forEach((field) => {
    if (!isNonEmptyString(blueprint[field])) {
      addFinding(
        errors,
        "fail",
        "MISSING_REQUIRED_FIELD",
        "Required blueprint field must be present and non-empty.",
        familyId,
        moduleId,
        { field },
      );
    }
  });

  if (blueprint.schemaVersion !== SCHEMA_VERSION) {
    addFinding(
      errors,
      "fail",
      "INVALID_SCHEMA_VERSION",
      "Module blueprint schema version is unsupported.",
      familyId,
      moduleId,
    );
  }

  if (blueprint.advisoryOnly !== true) {
    addFinding(
      errors,
      "fail",
      "ADVISORY_BOUNDARY_MISSING",
      "Module blueprint must remain advisory only.",
      familyId,
      moduleId,
    );
  }

  if (!hasAllBoundaries(blueprint.boundaries)) {
    addFinding(
      errors,
      "fail",
      "BOUNDARY_MISSING",
      "All module blueprint safety boundaries must be true.",
      familyId,
      moduleId,
    );
  }

  if (!familyId || !getBusinessSystemFamily(familyId)) {
    addFinding(
      errors,
      "fail",
      "UNKNOWN_FAMILY",
      "Module blueprint family must exist in the business systems catalog.",
      familyId,
      moduleId,
    );
  } else if (moduleId) {
    const family = getBusinessSystemFamily(familyId);
    const moduleExists = family?.coreModules.some(
      (module) =>
        normalizeId(module.id) === normalizeId(moduleId) ||
        normalizeId(module.name) === normalizeId(moduleId),
    );
    if (!moduleExists) {
      addFinding(
        errors,
        "fail",
        "UNKNOWN_MODULE",
        "Module blueprint module must exist in the selected catalog family.",
        familyId,
        moduleId,
      );
    }
  }

  requiredArrayFields.forEach((field) => {
    const value = blueprint[field];
    if (!Array.isArray(value) || value.length === 0) {
      addFinding(
        errors,
        "fail",
        "EMPTY_REQUIRED_ARRAY",
        "Required blueprint array field must be non-empty.",
        familyId,
        moduleId,
        { field },
      );
    } else if (value.length > MAX_ARRAY_LENGTH) {
      addFinding(
        warnings,
        "warn",
        "ARRAY_FIELD_LARGE",
        "Blueprint array field is larger than the recommended starter bound.",
        familyId,
        moduleId,
        { field, maxItems: MAX_ARRAY_LENGTH },
      );
    }
  });

  safeStringValues(blueprint).forEach((value, valueIndex) => {
    if (value.length > MAX_TEXT_LENGTH) {
      addFinding(
        errors,
        "fail",
        "TEXT_TOO_LONG",
        "Blueprint text exceeds the bounded description limit.",
        familyId,
        moduleId,
        { valueIndex, maxLength: MAX_TEXT_LENGTH },
      );
    }

    certificationClaimPatterns.forEach((pattern) => {
      if (includesPattern(value, pattern)) {
        addFinding(
          errors,
          "fail",
          "CERTIFICATION_OVERCLAIM",
          "Blueprint text must stay in guidance-only language.",
          familyId,
          moduleId,
        );
      }
    });

    forbiddenContentPatterns.forEach((pattern) => {
      if (includesPattern(value, pattern)) {
        addFinding(
          errors,
          "fail",
          "FORBIDDEN_CONTENT",
          "Blueprint text contains content outside advisory module planning scope.",
          familyId,
          moduleId,
        );
      }
    });

    if (pathLikePattern.test(value)) {
      addFinding(
        warnings,
        "warn",
        "PATH_LIKE_TEXT",
        "Blueprint text should avoid raw local paths.",
        familyId,
        moduleId,
      );
    }
  });
};

export const validateModuleBlueprints = (
  blueprints: unknown[],
): ModuleBlueprintValidationResult => {
  const errors: ModuleBlueprintValidationFinding[] = [];
  const warnings: ModuleBlueprintValidationFinding[] = [];

  if (!Array.isArray(blueprints)) {
    addFinding(
      errors,
      "fail",
      "INVALID_BLUEPRINT_LIST",
      "Blueprint validation input must be an array.",
    );
  } else {
    blueprints.forEach((blueprint, index) =>
      validateBlueprintShape(blueprint, index, errors, warnings),
    );
  }

  const status: ModuleBlueprintValidationStatus =
    errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass";

  return {
    validationId: makeValidationId(),
    createdAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    valid: errors.length === 0,
    status,
    blueprintCount: Array.isArray(blueprints) ? blueprints.length : 0,
    warnings,
    errors,
    advisoryOnly: true,
    boundaries: moduleBlueprintBoundaries,
  };
};

export const validateModuleBlueprint = (
  blueprint: unknown,
): ModuleBlueprintValidationResult =>
  validateModuleBlueprints([blueprint as ModuleBlueprint]);
