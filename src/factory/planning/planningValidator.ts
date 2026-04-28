import { getBusinessSystemFamily } from "../catalog/businessSystemsCatalog.js";
import { planningBoundaries } from "./planningEngine.js";
import type {
  PlanningBoundarySet,
  PlanningEngineResult,
  PlanningInput,
  PlanningValidationFinding,
  PlanningValidationResult,
  PlanningValidationStatus,
} from "./types.js";

const SCHEMA_VERSION = "1.0" as const;
const MAX_TEXT_LENGTH = 1_200;
const MAX_ARRAY_LENGTH = 100;

const boundaryKeys = [
  "advisoryOnly",
  "dataOnly",
  "noProviderCalls",
  "noNetwork",
  "noFileWrites",
  "noRuntimeExecution",
  "noStoreMutation",
  "noActionDispatch",
  "noProposalCreation",
  "noProposalApproval",
  "noScaffolding",
  "noDbSchemas",
  "noEnterpriseGeneration",
  "noExactPrices",
  "noGuaranteedDeliveryDates",
  "noProductionReadinessClaims",
] as const satisfies readonly (keyof PlanningBoundarySet)[];

const forbiddenContentPatterns = [
  "provider output",
  "network call",
  "generated code",
  "code snippet",
  "create table",
  "scaffold instruction",
  "scaffold output",
  "runtime execution",
  "action dispatch",
  "proposal execution",
  "proposal approval",
  "store mutation",
  "jarvis-complete",
  "production-ready",
  "guaranteed delivery",
  "guarantees compliance",
  "legally compliant",
  "certified",
  "security certified",
];

const priceClaimPattern = /(?:\$|usd|bob|eur|price|cost)\s*\d+|\d+\s*(?:usd|bob|eur)/i;
const hypotheticalPattern = /hypothetical|assumption|assumed|illustrative/i;
const guaranteedDatePattern =
  /\b(?:will|guaranteed|committed|fixed)\b.{0,40}\b(?:deliver|launch|finish|complete|go live|go-live)\b/i;
const codeLikePattern = /```|function\s+\w+\s*\(|class\s+\w+|const\s+\w+\s*=|=>\s*\{/i;

const makeValidationId = (): string =>
  `planning_validation_${Date.now().toString(36)}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const safeStringValues = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(safeStringValues);
  if (isRecord(value)) return Object.values(value).flatMap(safeStringValues);
  return [];
};

const addFinding = (
  findings: PlanningValidationFinding[],
  severity: "warn" | "fail",
  reasonCode: string,
  safeMessage: string,
  source?: {
    path?: string;
    familyId?: string;
    metadata?: Record<string, string | number | boolean>;
  },
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(source?.path ? { path: source.path } : {}),
    ...(source?.familyId ? { familyId: source.familyId } : {}),
    ...(source?.metadata ? { metadata: source.metadata } : {}),
  });
};

const sourceContext = (input: {
  path?: string | undefined;
  familyId?: string | undefined;
  metadata?: Record<string, string | number | boolean> | undefined;
}): Parameters<typeof addFinding>[4] => ({
  ...(input.path ? { path: input.path } : {}),
  ...(input.familyId ? { familyId: input.familyId } : {}),
  ...(input.metadata ? { metadata: input.metadata } : {}),
});

const hasAllBoundaries = (value: unknown): value is PlanningBoundarySet =>
  isRecord(value) && boundaryKeys.every((key) => value[key] === true);

const validateTextSafety = (
  value: unknown,
  errors: PlanningValidationFinding[],
  warnings: PlanningValidationFinding[],
  path: string,
  familyId?: string,
): void => {
  safeStringValues(value).forEach((text, valueIndex) => {
    if (text.length > MAX_TEXT_LENGTH) {
      addFinding(errors, "fail", "TEXT_TOO_LONG", "Planning text exceeds the bounded description limit.", {
        ...sourceContext({ path, familyId }),
        metadata: { valueIndex, maxLength: MAX_TEXT_LENGTH },
      });
    }

    forbiddenContentPatterns.forEach((pattern) => {
      if (text.toLowerCase().includes(pattern)) {
        addFinding(errors, "fail", "FORBIDDEN_CONTENT", "Planning text contains content outside advisory scope.", {
          ...sourceContext({ path, familyId }),
        });
      }
    });

    if (priceClaimPattern.test(text) && !hypotheticalPattern.test(text)) {
      addFinding(
        errors,
        "fail",
        "EXACT_PRICE_CLAIM",
        "Planning output must not include exact price or cost claims without explicit hypothetical assumptions.",
        sourceContext({ path, familyId }),
      );
    }

    if (guaranteedDatePattern.test(text)) {
      addFinding(
        errors,
        "fail",
        "GUARANTEED_DELIVERY_DATE",
        "Planning output must not claim guaranteed delivery dates.",
        sourceContext({ path, familyId }),
      );
    }

    if (codeLikePattern.test(text)) {
      addFinding(
        errors,
        "fail",
        "CODE_SNIPPET",
        "Planning output must not include code snippets.",
        sourceContext({ path, familyId }),
      );
    }
  });

  if (Array.isArray(value) && value.length > MAX_ARRAY_LENGTH) {
    addFinding(warnings, "warn", "ARRAY_FIELD_LARGE", "Planning array is larger than the recommended bound.", {
      ...sourceContext({ path, familyId }),
      metadata: { maxItems: MAX_ARRAY_LENGTH },
    });
  }
};

const validationResult = (
  warnings: PlanningValidationFinding[],
  errors: PlanningValidationFinding[],
): PlanningValidationResult => {
  const status: PlanningValidationStatus =
    errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass";

  return {
    validationId: makeValidationId(),
    createdAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    valid: errors.length === 0,
    status,
    findingCount: warnings.length + errors.length,
    warnings,
    errors,
    advisoryOnly: true,
    boundaries: planningBoundaries,
  };
};

export const validatePlanningInput = (
  input: unknown,
): PlanningValidationResult => {
  const warnings: PlanningValidationFinding[] = [];
  const errors: PlanningValidationFinding[] = [];

  if (!isRecord(input)) {
    addFinding(errors, "fail", "INVALID_INPUT", "Planning input must be an object.");
    return validationResult(warnings, errors);
  }

  const familyId = isNonEmptyString(input.familyId) ? input.familyId : undefined;
  if (!familyId) {
    addFinding(errors, "fail", "MISSING_FAMILY_ID", "Planning input familyId is required.", {
      path: "familyId",
    });
  } else if (!getBusinessSystemFamily(familyId)) {
    addFinding(errors, "fail", "UNKNOWN_FAMILY", "Planning input family must exist in the catalog.", {
      path: "familyId",
      familyId,
    });
  }

  if (input.moduleBlueprints !== undefined && !Array.isArray(input.moduleBlueprints)) {
    addFinding(errors, "fail", "INVALID_MODULE_BLUEPRINTS", "moduleBlueprints must be an array when provided.", {
      ...sourceContext({ path: "moduleBlueprints", familyId }),
    });
  }

  validateTextSafety(input, errors, warnings, "input", familyId);
  return validationResult(warnings, errors);
};

export const validatePlanningEngineResult = (
  result: unknown,
): PlanningValidationResult => {
  const warnings: PlanningValidationFinding[] = [];
  const errors: PlanningValidationFinding[] = [];

  if (!isRecord(result)) {
    addFinding(errors, "fail", "INVALID_RESULT", "Planning result must be an object.");
    return validationResult(warnings, errors);
  }

  const familyId = isNonEmptyString(result.familyId) ? result.familyId : undefined;

  ["planningId", "createdAt", "familyId", "familyName"].forEach((field) => {
    if (!isNonEmptyString(result[field])) {
      addFinding(errors, "fail", "MISSING_REQUIRED_FIELD", "Planning result required field is missing.", {
        ...sourceContext({ path: field, familyId }),
      });
    }
  });

  if (result.schemaVersion !== SCHEMA_VERSION) {
    addFinding(errors, "fail", "INVALID_SCHEMA_VERSION", "Planning result schema version is unsupported.", {
      ...sourceContext({ path: "schemaVersion", familyId }),
    });
  }

  if (familyId && !getBusinessSystemFamily(familyId)) {
    addFinding(errors, "fail", "UNKNOWN_FAMILY", "Planning result family must exist in the catalog.", {
      path: "familyId",
      familyId,
    });
  }

  if (result.advisoryOnly !== true) {
    addFinding(errors, "fail", "ADVISORY_BOUNDARY_MISSING", "Planning result must remain advisory only.", {
      ...sourceContext({ path: "advisoryOnly", familyId }),
    });
  }

  if (!hasAllBoundaries(result.boundaries)) {
    addFinding(errors, "fail", "BOUNDARY_MISSING", "All planning safety boundaries must be true.", {
      ...sourceContext({ path: "boundaries", familyId }),
    });
  }

  const planningResult = result as Partial<PlanningEngineResult>;
  if (familyId && getBusinessSystemFamily(familyId)) {
    if (!Array.isArray(planningResult.roadmap) || planningResult.roadmap.length === 0) {
      addFinding(errors, "fail", "EMPTY_ROADMAP", "Valid planning results must include roadmap phases.", {
        ...sourceContext({ path: "roadmap", familyId }),
      });
    }
    if (!Array.isArray(planningResult.backlog) || planningResult.backlog.length === 0) {
      addFinding(errors, "fail", "EMPTY_BACKLOG", "Valid planning results must include backlog items.", {
        ...sourceContext({ path: "backlog", familyId }),
      });
    }
  }

  if (!Array.isArray(planningResult.assumptions) || planningResult.assumptions.length === 0) {
    addFinding(errors, "fail", "MISSING_ASSUMPTIONS", "Planning result must include assumptions.", {
      ...sourceContext({ path: "assumptions", familyId }),
    });
  }

  if (!Array.isArray(planningResult.exclusions) || planningResult.exclusions.length === 0) {
    addFinding(errors, "fail", "MISSING_EXCLUSIONS", "Planning result must include exclusions.", {
      ...sourceContext({ path: "exclusions", familyId }),
    });
  }

  if (!["low", "medium", "high"].includes(String(planningResult.confidence))) {
    addFinding(errors, "fail", "MISSING_CONFIDENCE", "Planning result must include a valid confidence value.", {
      ...sourceContext({ path: "confidence", familyId }),
    });
  }

  validateTextSafety(result, errors, warnings, "result", familyId);
  return validationResult(warnings, errors);
};
