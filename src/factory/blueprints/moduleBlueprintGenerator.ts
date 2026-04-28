import {
  getBusinessSystemFamily,
  listBusinessSystemFamilies,
} from "../catalog/businessSystemsCatalog.js";
import type {
  BusinessSystemFamily,
  BusinessSystemMetadataItem,
} from "../catalog/types.js";
import type {
  ModuleBlueprint,
  ModuleBlueprintBoundary,
  ModuleBlueprintGenerationOptions,
  ModuleBlueprintGenerationResult,
  ModuleBlueprintValidationFinding,
} from "./types.js";

export const moduleBlueprintBoundaries: ModuleBlueprintBoundary = {
  advisoryOnly: true,
  noCodeGeneration: true,
  noScaffolding: true,
  noDbSchemas: true,
  noFileWrites: true,
  noRuntimeExecution: true,
  noProviderCalls: true,
  noNetwork: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noStoreMutation: true,
};

const makeFinding = (
  reasonCode: string,
  safeMessage: string,
  familyId?: string,
  moduleId?: string,
): ModuleBlueprintValidationFinding => ({
  id: "finding_1",
  severity: "fail",
  reasonCode,
  safeMessage,
  ...(familyId ? { familyId } : {}),
  ...(moduleId ? { moduleId } : {}),
});

const safeNormalizeId = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const findModule = (
  family: BusinessSystemFamily,
  requestedModuleId: string,
): BusinessSystemMetadataItem | undefined => {
  const normalizedRequestedModuleId = safeNormalizeId(requestedModuleId);
  return family.coreModules.find(
    (module) =>
      safeNormalizeId(module.id) === normalizedRequestedModuleId ||
      safeNormalizeId(module.name) === normalizedRequestedModuleId,
  );
};

const relatedItems = <T extends { id?: string; name: string; description: string }>(
  items: readonly T[],
  module: BusinessSystemMetadataItem,
): T[] => {
  const moduleTokens = new Set(
    `${module.id} ${module.name} ${module.description}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2),
  );
  const matches = items.filter((item) =>
    `${item.id ?? ""} ${item.name} ${item.description}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .some((token) => moduleTokens.has(token)),
  );

  return matches.length > 0 ? matches : items.slice(0, 4);
};

const makeBlueprint = (
  family: BusinessSystemFamily,
  module: BusinessSystemMetadataItem,
  includeAssumptions: boolean,
): ModuleBlueprint => {
  const moduleId = safeNormalizeId(module.id || module.name);
  const entities = relatedItems(family.commonEntities, module);
  const workflows = family.workflows.slice(0, 3);
  const permissions = family.permissions.slice(0, 4);
  const reports = family.reports.slice(0, 3);
  const integrations = family.integrations.slice(0, 3);

  return {
    blueprintId: `blueprint:${family.familyId}:${moduleId}`,
    createdAt: new Date().toISOString(),
    schemaVersion: "1.0",
    familyId: family.familyId,
    moduleId,
    name: module.name,
    purpose: module.description,
    actors: family.typicalActors.slice(),
    responsibilities: [
      `Describe ${module.name} responsibilities using ${family.name} catalog metadata.`,
      "Keep module scope reviewable before any implementation phase.",
      "Identify role, data, reporting, and integration touchpoints for human review.",
    ],
    entities,
    workflows,
    permissions,
    reports,
    integrations,
    businessRules: [
      "Confirm module rules through stakeholder interview before implementation.",
      "Keep rules advisory until reviewed by the owning business role.",
    ],
    auditConcerns: family.complianceAndAuditConcerns.slice(),
    risks: [
      ...family.riskNotes,
      "Catalog-derived blueprint may miss organization-specific exceptions.",
    ],
    assumptions: includeAssumptions
      ? [
          ...family.assumptions,
          "Generated from static catalog metadata for review only.",
          "No file, code, schema, or runtime output is produced.",
        ]
      : [
          "Assumptions were minimized by option; human review remains required.",
          "No file, code, schema, or runtime output is produced.",
        ],
    uiPatterns: family.uiPatterns.slice(),
    dataConsiderations: [
      ...family.dataModelPatterns.map((pattern) => `Consider ${pattern} as a logical planning pattern.`),
      "Do not treat these notes as database schema definitions.",
    ],
    testConsiderations: [
      "Review required module behavior with example workflows.",
      "Plan unit, integration, access-control, and regression checks in a later implementation phase.",
      "Use synthetic or redacted test data only.",
    ],
    implementationNotes: [
      "This module blueprint is advisory source data.",
      "Implementation, scaffold, database, and runtime behavior require later approval.",
      "Keep compliance language as checklist guidance, not certification.",
    ],
    advisoryOnly: true,
    boundaries: moduleBlueprintBoundaries,
  };
};

const result = (
  status: ModuleBlueprintGenerationResult["status"],
  errors: ModuleBlueprintValidationFinding[],
  warnings: ModuleBlueprintValidationFinding[] = [],
  blueprint?: ModuleBlueprint,
  blueprints?: ModuleBlueprint[],
): ModuleBlueprintGenerationResult => ({
  ok: status === "generated",
  status,
  ...(blueprint ? { blueprint } : {}),
  ...(blueprints ? { blueprints } : {}),
  errors,
  warnings,
  advisoryOnly: true,
  boundaries: moduleBlueprintBoundaries,
});

export const listBlueprintableModules = (familyId: string): string[] => {
  const family = getBusinessSystemFamily(familyId);
  if (!family) {
    return [];
  }
  return family.coreModules.map((module) => safeNormalizeId(module.id || module.name));
};

export const generateModuleBlueprint = (
  options: ModuleBlueprintGenerationOptions,
): ModuleBlueprintGenerationResult => {
  const family = getBusinessSystemFamily(options.familyId);
  if (!family) {
    return result("family_not_found", [
      makeFinding(
        "FAMILY_NOT_FOUND",
        "Requested business system family is not available in the catalog.",
      ),
    ]);
  }

  if (!options.moduleId) {
    return generateModuleBlueprintsForFamily(family.familyId);
  }

  const module = findModule(family, options.moduleId);
  if (!module) {
    return result("module_not_found", [
      makeFinding(
        "MODULE_NOT_FOUND",
        "Requested module is not available in the selected family catalog.",
        family.familyId,
      ),
    ]);
  }

  return result(
    "generated",
    [],
    [],
    makeBlueprint(family, module, options.includeAssumptions !== false),
  );
};

export const generateModuleBlueprintsForFamily = (
  familyId: string,
): ModuleBlueprintGenerationResult => {
  const family = getBusinessSystemFamily(familyId);
  if (!family) {
    return result("family_not_found", [
      makeFinding(
        "FAMILY_NOT_FOUND",
        "Requested business system family is not available in the catalog.",
      ),
    ]);
  }

  const blueprints = family.coreModules.map((module) =>
    makeBlueprint(family, module, true),
  );

  return result("generated", [], [], undefined, blueprints);
};

export const listBlueprintableFamilies = (): string[] =>
  listBusinessSystemFamilies().map((family) => family.familyId);
