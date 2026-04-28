import { getBusinessSystemFamily } from "../catalog/businessSystemsCatalog.js";
import {
  businessProcessBoundaries,
  businessProcessTemplates,
  listBusinessProcessTemplates as cloneBusinessProcessTemplates,
  supportedBusinessProcessCategories,
} from "./processTemplates.js";
import type {
  BusinessProcessCategory,
  BusinessProcessModel,
  BusinessProcessModelInput,
  BusinessProcessModelResult,
  BusinessProcessValidationFinding,
  ProcessAlignmentNote,
} from "./types.js";

const normalizeId = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeCategory = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const makeFinding = (
  reasonCode: string,
  safeMessage: string,
  category?: BusinessProcessCategory | string,
): BusinessProcessValidationFinding => ({
  id: "finding_1",
  severity: "fail",
  reasonCode,
  safeMessage,
  ...(category ? { category: category as BusinessProcessCategory } : {}),
});

const isSupportedCategory = (value: string): value is BusinessProcessCategory =>
  supportedBusinessProcessCategories.includes(value as BusinessProcessCategory);

const result = (
  status: BusinessProcessModelResult["status"],
  errors: BusinessProcessValidationFinding[],
  warnings: BusinessProcessValidationFinding[] = [],
  model?: BusinessProcessModel,
  models?: BusinessProcessModel[],
): BusinessProcessModelResult => ({
  ok: errors.length === 0 && (status === "model_built" || status === "template_found"),
  status,
  ...(model ? { model } : {}),
  ...(models ? { models } : {}),
  warnings,
  errors,
  advisoryOnly: true,
  boundaries: businessProcessBoundaries,
});

const cloneTemplate = (category: BusinessProcessCategory): BusinessProcessModel | undefined =>
  cloneBusinessProcessTemplates().find((template) => template.category === category);

const alignmentNote = (
  alignmentId: string,
  target: ProcessAlignmentNote["target"],
  safeSummary: string,
  futureOnly = false,
): ProcessAlignmentNote => ({
  alignmentId,
  target,
  safeSummary,
  advisoryOnly: true,
  ...(futureOnly ? { futureOnly: true } : {}),
});

const boundedUnique = (values: readonly string[] | undefined, limit: number): string[] =>
  Array.from(new Set((values ?? []).map(normalizeId).filter(Boolean))).slice(0, limit);

export const getBusinessProcessTemplate = (
  category: BusinessProcessCategory | string,
): BusinessProcessModelResult => {
  const normalized = normalizeCategory(category);
  if (!isSupportedCategory(normalized)) {
    return result("category_not_found", [
      makeFinding(
        "CATEGORY_NOT_FOUND",
        "Requested business process category is not in the supported source registry.",
        category,
      ),
    ]);
  }

  const template = cloneTemplate(normalized);
  return template
    ? result("template_found", [], [], template)
    : result("category_not_found", [
        makeFinding(
          "CATEGORY_NOT_FOUND",
          "Requested business process category is not in the supported source registry.",
          normalized,
        ),
      ]);
};

export const listBusinessProcessTemplates = (): BusinessProcessModel[] =>
  cloneBusinessProcessTemplates();

export const buildBusinessProcessModel = (
  input: BusinessProcessModelInput,
): BusinessProcessModelResult => {
  const normalizedCategory = normalizeCategory(input.category);
  if (!isSupportedCategory(normalizedCategory)) {
    return result("category_not_found", [
      makeFinding(
        "CATEGORY_NOT_FOUND",
        "Requested business process category is not in the supported source registry.",
        input.category,
      ),
    ]);
  }

  const template = cloneTemplate(normalizedCategory);
  if (!template) {
    return result("category_not_found", [
      makeFinding(
        "CATEGORY_NOT_FOUND",
        "Requested business process template is not available.",
        normalizedCategory,
      ),
    ]);
  }

  const family = input.familyId ? getBusinessSystemFamily(input.familyId) : undefined;
  const requestedModuleIds = boundedUnique(input.moduleIds, 12);
  const familyModuleIds = family
    ? family.coreModules.map((module) => normalizeId(module.id || module.name)).slice(0, 12)
    : [];
  const moduleIds = requestedModuleIds.length > 0
    ? requestedModuleIds
    : template.moduleIds.length > 0
      ? template.moduleIds.slice()
      : familyModuleIds;
  const processName = input.processName?.trim();
  const familyAssumptions = family
    ? [
        `${family.name} catalog context was attached for review only.`,
        "Catalog workflows and modules are planning inputs, not executable process output.",
      ]
    : [];

  const model: BusinessProcessModel = {
    ...template,
    processId: family
      ? `process:${normalizedCategory}:${normalizeId(family.familyId)}`
      : template.processId,
    ...(family ? { familyId: family.familyId } : {}),
    moduleIds,
    name: processName && processName.length <= 120 ? processName : template.name,
    moduleAlignment: [
      ...template.moduleAlignment,
      ...(family
        ? [
            alignmentNote(
              `alignment:${normalizedCategory}:${normalizeId(family.familyId)}:catalog`,
              "module_blueprint",
              `${family.name} catalog modules can be compared with this process model during review.`,
            ),
          ]
        : []),
    ],
    planningAlignment: [
      ...template.planningAlignment,
      alignmentNote(
        `alignment:${normalizedCategory}:maturity`,
        "planning",
        "Planning can compare MVP and enterprise maturity notes against roadmap scope.",
      ),
    ],
    automationAlignment: [
      ...template.automationAlignment,
      alignmentNote(
        `alignment:${normalizedCategory}:automation-future`,
        "automation_future",
        "Automation alignment is metadata only and remains future-gated.",
        true,
      ),
    ],
    assumptions: [
      ...template.assumptions,
      ...familyAssumptions,
      ...(input.assumptions ?? []).slice(0, 8),
    ],
    exclusions: [
      ...template.exclusions,
      ...(input.exclusions ?? []).slice(0, 8),
    ],
    confidence: input.confidence ?? (family ? "medium" : template.confidence),
  };

  return result("model_built", [], [], model);
};
