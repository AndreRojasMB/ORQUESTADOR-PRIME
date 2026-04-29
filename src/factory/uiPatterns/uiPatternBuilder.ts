import { getBusinessSystemFamily } from "../catalog/businessSystemsCatalog.js";
import {
  listUiPatternTemplates as cloneUiPatternTemplates,
  supportedUiPatternCategories,
  uiPatternBoundaries,
} from "./uiPatternTemplates.js";
import type {
  UiAlignment,
  UiPatternCategory,
  UiPatternInput,
  UiPatternModel,
  UiPatternResult,
  UiPatternValidationFinding,
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

const isSupportedCategory = (value: string): value is UiPatternCategory =>
  supportedUiPatternCategories.includes(value as UiPatternCategory);

const makeFinding = (
  reasonCode: string,
  safeMessage: string,
  category?: UiPatternCategory | string,
): UiPatternValidationFinding => ({
  id: "finding_1",
  severity: "fail",
  reasonCode,
  safeMessage,
  ...(category && isSupportedCategory(normalizeCategory(category))
    ? { category: normalizeCategory(category) as UiPatternCategory }
    : {}),
});

const result = (
  status: UiPatternResult["status"],
  errors: UiPatternValidationFinding[],
  warnings: UiPatternValidationFinding[] = [],
  model?: UiPatternModel,
  models?: UiPatternModel[],
): UiPatternResult => ({
  ok: errors.length === 0 && (status === "model_built" || status === "template_found"),
  status,
  ...(model ? { model } : {}),
  ...(models ? { models } : {}),
  warnings,
  errors,
  advisoryOnly: true,
  boundaries: uiPatternBoundaries,
});

const boundedUnique = (values: readonly string[] | undefined, limit: number): string[] =>
  Array.from(new Set((values ?? []).map(normalizeId).filter(Boolean))).slice(0, limit);

const cloneTemplate = (category: UiPatternCategory): UiPatternModel | undefined =>
  cloneUiPatternTemplates().find((template) => template.category === category);

const alignmentNote = (
  alignmentId: string,
  target: UiAlignment["target"],
  safeSummary: string,
  futureOnly = false,
): UiAlignment => ({
  alignmentId,
  target,
  safeSummary,
  advisoryOnly: true,
  metadataOnly: true,
  ...(futureOnly ? { futureOnly: true } : {}),
});

export const getUiPatternTemplate = (
  category: UiPatternCategory | string,
): UiPatternResult => {
  const normalized = normalizeCategory(category);
  if (!isSupportedCategory(normalized)) {
    return result("category_not_found", [
      makeFinding(
        "CATEGORY_NOT_FOUND",
        "Requested UI pattern category is not in the supported source registry.",
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
          "Requested UI pattern template is not available.",
          normalized,
        ),
      ]);
};

export const listUiPatternTemplates = (): UiPatternModel[] =>
  cloneUiPatternTemplates();

export const buildUiPatternModel = (input: UiPatternInput): UiPatternResult => {
  const normalizedCategory = normalizeCategory(input.category);
  if (!isSupportedCategory(normalizedCategory)) {
    return result("category_not_found", [
      makeFinding(
        "CATEGORY_NOT_FOUND",
        "Requested UI pattern category is not in the supported source registry.",
        input.category,
      ),
    ]);
  }

  const template = cloneTemplate(normalizedCategory);
  if (!template) {
    return result("category_not_found", [
      makeFinding(
        "CATEGORY_NOT_FOUND",
        "Requested UI pattern template is not available.",
        normalizedCategory,
      ),
    ]);
  }

  const family = input.familyId ? getBusinessSystemFamily(input.familyId) : undefined;
  const requestedModuleIds = boundedUnique(input.moduleIds, 12);
  const requestedProcessIds = boundedUnique(input.processIds, 12);
  const requestedReportingIds = boundedUnique(input.reportingIds, 12);
  const requestedTransactionIds = boundedUnique(input.transactionIds, 12);
  const requestedPlanningIds = boundedUnique(input.planningIds, 12);
  const requestedFrameworkIds = boundedUnique(input.frameworkIds, 12);
  const familyModuleIds = family
    ? family.coreModules.map((module) => normalizeId(module.id || module.name)).slice(0, 12)
    : [];
  const uiPatternName = input.uiPatternName?.trim();
  const categoryId = normalizeId(normalizedCategory);
  const familyAssumptions = family
    ? [
        `${family.name} catalog context was attached for review only.`,
        "Catalog modules and UI vocabulary are planning inputs, not delivered interface assets.",
      ]
    : [];

  const model: UiPatternModel = {
    ...template,
    uiPatternId: family
      ? `ui:${categoryId}:${normalizeId(family.familyId)}`
      : template.uiPatternId,
    ...(family ? { familyId: family.familyId } : {}),
    moduleIds:
      requestedModuleIds.length > 0
        ? requestedModuleIds
        : template.moduleIds.length > 0
          ? template.moduleIds.slice()
          : familyModuleIds,
    processIds: requestedProcessIds,
    reportingIds: requestedReportingIds,
    transactionIds: requestedTransactionIds,
    planningIds: requestedPlanningIds,
    frameworkIds: requestedFrameworkIds,
    name: uiPatternName && uiPatternName.length <= 120 ? uiPatternName : template.name,
    moduleAlignment: [
      ...template.moduleAlignment,
      ...(family
        ? [
            alignmentNote(
              `alignment:${categoryId}:${normalizeId(family.familyId)}:catalog`,
              "module_blueprint",
              `${family.name} catalog modules can be compared with UI surface needs.`,
            ),
          ]
        : []),
    ],
    processAlignment: [
      ...template.processAlignment,
      ...(requestedProcessIds.length > 0
        ? [
            alignmentNote(
              `alignment:${categoryId}:process-input`,
              "process",
              "Caller-supplied process ids can be reviewed against UI state notes.",
            ),
          ]
        : []),
    ],
    reportingAlignment: [
      ...template.reportingAlignment,
      ...(requestedReportingIds.length > 0
        ? [
            alignmentNote(
              `alignment:${categoryId}:reporting-input`,
              "reporting",
              "Caller-supplied reporting ids can be reviewed against summary placement metadata.",
            ),
          ]
        : []),
    ],
    transactionAlignment: [
      ...template.transactionAlignment,
      ...(requestedTransactionIds.length > 0
        ? [
            alignmentNote(
              `alignment:${categoryId}:transaction-input`,
              "transaction",
              "Caller-supplied transaction ids can be reviewed against traceability and review surfaces.",
            ),
          ]
        : []),
    ],
    planningAlignment: [
      ...template.planningAlignment,
      ...(requestedPlanningIds.length > 0
        ? [
            alignmentNote(
              `alignment:${categoryId}:planning-input`,
              "planning",
              "Caller-supplied planning ids can be reviewed against MVP and enterprise UI maturity.",
            ),
          ]
        : []),
    ],
    frameworkAlignment: [
      ...template.frameworkAlignment,
      ...(requestedFrameworkIds.length > 0
        ? [
            alignmentNote(
              `alignment:${categoryId}:framework-input`,
              "framework_future",
              "Caller-supplied framework ids remain future advisory UI implementation context.",
              true,
            ),
          ]
        : []),
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
    confidence:
      input.confidence ??
      (family ||
      requestedProcessIds.length > 0 ||
      requestedReportingIds.length > 0 ||
      requestedTransactionIds.length > 0
        ? "medium"
        : template.confidence),
  };

  return result("model_built", [], [], model);
};
