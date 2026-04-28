import {
  REQUIRED_BUSINESS_SYSTEM_FAMILY_IDS,
  businessSystemsCatalog,
} from "./businessSystemsCatalog.js";
import type {
  BusinessSystemFamily,
  BusinessSystemFamilyId,
  CatalogValidationBoundarySet,
  CatalogValidationFinding,
  CatalogValidationResult,
  CatalogValidationStatus,
} from "./types.js";

const SCHEMA_VERSION = "1.0" as const;
const MAX_TEXT_LENGTH = 1_000;
const MAX_ARRAY_LENGTH = 50;

const boundaries: CatalogValidationBoundarySet = {
  dataOnly: true,
  noGeneration: true,
  noScaffolding: true,
  noDbSchemas: true,
  noRuntimeExecution: true,
  noProviderCalls: true,
  noNetwork: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noStoreMutation: true,
};

const requiredArrayFields = [
  "aliases",
  "typicalActors",
  "coreModules",
  "commonEntities",
  "workflows",
  "permissions",
  "reports",
  "integrations",
  "complianceAndAuditConcerns",
  "dataModelPatterns",
  "uiPatterns",
  "deploymentNotes",
  "riskNotes",
  "assumptions",
  "tags",
] as const;

const certificationClaimPatterns = [
  "certified",
  "guarantees compliance",
  "legally compliant",
];

const forbiddenContentPatterns = [
  "token",
  "apiKey",
  "secret",
  "password",
  "bearer",
  "provider output",
  "generated code",
  "scaffold output",
  "CREATE TABLE",
  "action dispatch",
  "proposal creation",
];

const makeValidationId = (): string =>
  `catalog_validation_${Date.now().toString(36)}`;

const addFinding = (
  findings: CatalogValidationFinding[],
  severity: "warn" | "fail",
  reasonCode: string,
  safeMessage: string,
  familyId?: BusinessSystemFamilyId,
  metadata?: Record<string, string | number | boolean>,
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(familyId ? { familyId } : {}),
    ...(metadata ? { metadata } : {}),
  });
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const safeStringValues = (value: unknown): string[] => {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(safeStringValues);
  }
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(safeStringValues);
  }
  return [];
};

const hasPattern = (text: string, pattern: string): boolean =>
  text.toLowerCase().includes(pattern.toLowerCase());

const validateTextBounds = (
  family: BusinessSystemFamily,
  errors: CatalogValidationFinding[],
  warnings: CatalogValidationFinding[],
): void => {
  const values = safeStringValues(family);
  values.forEach((value, index) => {
    if (value.length > MAX_TEXT_LENGTH) {
      addFinding(
        errors,
        "fail",
        "TEXT_TOO_LONG",
        "Catalog text exceeds the bounded description limit.",
        family.familyId,
        { valueIndex: index, maxLength: MAX_TEXT_LENGTH },
      );
    }
  });

  requiredArrayFields.forEach((field) => {
    const value = family[field];
    if (value.length > MAX_ARRAY_LENGTH) {
      addFinding(
        warnings,
        "warn",
        "ARRAY_FIELD_LARGE",
        "Catalog array field is larger than the recommended starter metadata bound.",
        family.familyId,
        { field, maxItems: MAX_ARRAY_LENGTH },
      );
    }
  });
};

const validateRequiredFields = (
  family: BusinessSystemFamily,
  errors: CatalogValidationFinding[],
): void => {
  if (!isNonEmptyString(family.familyId)) {
    addFinding(errors, "fail", "MISSING_FAMILY_ID", "Family id is required.");
  }
  if (!isNonEmptyString(family.name)) {
    addFinding(errors, "fail", "MISSING_NAME", "Family name is required.", family.familyId);
  }
  if (!isNonEmptyString(family.purpose)) {
    addFinding(errors, "fail", "MISSING_PURPOSE", "Family purpose is required.", family.familyId);
  }

  requiredArrayFields.forEach((field) => {
    const value = family[field];
    if (!Array.isArray(value) || value.length === 0) {
      addFinding(
        errors,
        "fail",
        "MISSING_REQUIRED_FIELD",
        "Required catalog field must be present and non-empty.",
        family.familyId,
        { field },
      );
    }
  });
};

const validateNestedRequiredFields = (
  family: BusinessSystemFamily,
  errors: CatalogValidationFinding[],
): void => {
  family.coreModules.forEach((module) => {
    if (!isNonEmptyString(module.id) || !isNonEmptyString(module.name) || !isNonEmptyString(module.description)) {
      addFinding(errors, "fail", "INVALID_MODULE", "Core module metadata is incomplete.", family.familyId);
    }
  });
  family.commonEntities.forEach((entity) => {
    if (!isNonEmptyString(entity.id) || !isNonEmptyString(entity.name) || !isNonEmptyString(entity.description)) {
      addFinding(errors, "fail", "INVALID_ENTITY", "Common entity metadata is incomplete.", family.familyId);
    }
  });
  family.workflows.forEach((workflow) => {
    if (
      !isNonEmptyString(workflow.workflowId) ||
      !isNonEmptyString(workflow.name) ||
      !isNonEmptyString(workflow.description) ||
      workflow.actors.length === 0 ||
      workflow.steps.length === 0
    ) {
      addFinding(errors, "fail", "INVALID_WORKFLOW", "Workflow metadata is incomplete.", family.familyId);
    }
  });
  family.integrations.forEach((integration) => {
    if (
      !isNonEmptyString(integration.integrationId) ||
      !isNonEmptyString(integration.name) ||
      !isNonEmptyString(integration.type) ||
      !isNonEmptyString(integration.description)
    ) {
      addFinding(errors, "fail", "INVALID_INTEGRATION", "Integration metadata is incomplete.", family.familyId);
    }
  });
};

const validateSafetyText = (
  family: BusinessSystemFamily,
  errors: CatalogValidationFinding[],
): void => {
  const values = safeStringValues(family);
  values.forEach((value) => {
    certificationClaimPatterns.forEach((pattern) => {
      if (hasPattern(value, pattern)) {
        addFinding(
          errors,
          "fail",
          "CERTIFICATION_OVERCLAIM",
          "Catalog text must stay in guidance-only language.",
          family.familyId,
        );
      }
    });
    forbiddenContentPatterns.forEach((pattern) => {
      if (hasPattern(value, pattern)) {
        addFinding(
          errors,
          "fail",
          "FORBIDDEN_CONTENT",
          "Catalog text contains content outside data-only advisory scope.",
          family.familyId,
        );
      }
    });
  });
};

export const validateBusinessSystemsCatalog = (
  catalog: readonly BusinessSystemFamily[] = businessSystemsCatalog,
): CatalogValidationResult => {
  const errors: CatalogValidationFinding[] = [];
  const warnings: CatalogValidationFinding[] = [];
  const familyIds = catalog.map((family) => family.familyId);
  const seenFamilyIds = new Set<string>();
  const seenAliases = new Map<string, string>();

  catalog.forEach((family) => {
    if (seenFamilyIds.has(family.familyId)) {
      addFinding(
        errors,
        "fail",
        "DUPLICATE_FAMILY_ID",
        "Family ids must be unique.",
        family.familyId,
      );
    }
    seenFamilyIds.add(family.familyId);

    const familyAliases = new Set<string>();
    family.aliases.forEach((alias) => {
      const normalizedAlias = alias.trim().toLowerCase();
      if (familyAliases.has(normalizedAlias)) {
        addFinding(
          errors,
          "fail",
          "DUPLICATE_ALIAS",
          "Aliases must be unique within each catalog family.",
          family.familyId,
        );
      }
      familyAliases.add(normalizedAlias);

      const previousFamilyId = seenAliases.get(normalizedAlias);
      if (previousFamilyId && previousFamilyId !== family.familyId) {
        addFinding(
          errors,
          "fail",
          "DUPLICATE_ALIAS",
          "Aliases must be unique across catalog families.",
          family.familyId,
        );
      }
      seenAliases.set(normalizedAlias, family.familyId);
    });

    validateRequiredFields(family, errors);
    validateNestedRequiredFields(family, errors);
    validateTextBounds(family, errors, warnings);
    validateSafetyText(family, errors);
  });

  REQUIRED_BUSINESS_SYSTEM_FAMILY_IDS.forEach((requiredFamilyId) => {
    if (!seenFamilyIds.has(requiredFamilyId)) {
      addFinding(
        errors,
        "fail",
        "MISSING_REQUIRED_FAMILY",
        "A required business system family is missing.",
        requiredFamilyId,
      );
    }
  });

  const requiredFamilyIdsPresent = REQUIRED_BUSINESS_SYSTEM_FAMILY_IDS.every(
    (requiredFamilyId) => seenFamilyIds.has(requiredFamilyId),
  );
  const status: CatalogValidationStatus =
    errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass";

  return {
    validationId: makeValidationId(),
    createdAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    valid: errors.length === 0,
    status,
    familyCount: catalog.length,
    familyIds,
    requiredFamilyIdsPresent,
    warnings,
    errors,
    advisoryOnly: true,
    boundaries,
  };
};
