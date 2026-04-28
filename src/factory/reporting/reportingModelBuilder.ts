import { getBusinessSystemFamily } from "../catalog/businessSystemsCatalog.js";
import {
  listReportingTemplates as cloneReportingTemplates,
  reportingBoundaries,
  supportedReportingCategories,
} from "./reportingTemplates.js";
import type {
  ReportingAlignment,
  ReportingDomainCategory,
  ReportingLayerInput,
  ReportingLayerModel,
  ReportingLayerResult,
  ReportingValidationFinding,
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

const isSupportedCategory = (value: string): value is ReportingDomainCategory =>
  supportedReportingCategories.includes(value as ReportingDomainCategory);

const makeFinding = (
  reasonCode: string,
  safeMessage: string,
  category?: ReportingDomainCategory | string,
): ReportingValidationFinding => ({
  id: "finding_1",
  severity: "fail",
  reasonCode,
  safeMessage,
  ...(category && isSupportedCategory(normalizeCategory(category))
    ? { category: normalizeCategory(category) as ReportingDomainCategory }
    : {}),
});

const result = (
  status: ReportingLayerResult["status"],
  errors: ReportingValidationFinding[],
  warnings: ReportingValidationFinding[] = [],
  model?: ReportingLayerModel,
  models?: ReportingLayerModel[],
): ReportingLayerResult => ({
  ok: errors.length === 0 && (status === "model_built" || status === "template_found"),
  status,
  ...(model ? { model } : {}),
  ...(models ? { models } : {}),
  warnings,
  errors,
  advisoryOnly: true,
  boundaries: reportingBoundaries,
});

const boundedUnique = (values: readonly string[] | undefined, limit: number): string[] =>
  Array.from(new Set((values ?? []).map(normalizeId).filter(Boolean))).slice(0, limit);

const cloneTemplate = (category: ReportingDomainCategory): ReportingLayerModel | undefined =>
  cloneReportingTemplates().find((template) => template.category === category);

const alignmentNote = (
  alignmentId: string,
  target: ReportingAlignment["target"],
  safeSummary: string,
  futureOnly = false,
): ReportingAlignment => ({
  alignmentId,
  target,
  safeSummary,
  advisoryOnly: true,
  ...(futureOnly ? { futureOnly: true } : {}),
});

export const getReportingTemplate = (
  category: ReportingDomainCategory | string,
): ReportingLayerResult => {
  const normalized = normalizeCategory(category);
  if (!isSupportedCategory(normalized)) {
    return result("category_not_found", [
      makeFinding(
        "CATEGORY_NOT_FOUND",
        "Requested reporting category is not in the supported source registry.",
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
          "Requested reporting template is not available.",
          normalized,
        ),
      ]);
};

export const listReportingTemplates = (): ReportingLayerModel[] =>
  cloneReportingTemplates();

export const buildReportingLayerModel = (
  input: ReportingLayerInput,
): ReportingLayerResult => {
  const normalizedCategory = normalizeCategory(input.category);
  if (!isSupportedCategory(normalizedCategory)) {
    return result("category_not_found", [
      makeFinding(
        "CATEGORY_NOT_FOUND",
        "Requested reporting category is not in the supported source registry.",
        input.category,
      ),
    ]);
  }

  const template = cloneTemplate(normalizedCategory);
  if (!template) {
    return result("category_not_found", [
      makeFinding(
        "CATEGORY_NOT_FOUND",
        "Requested reporting template is not available.",
        normalizedCategory,
      ),
    ]);
  }

  const family = input.familyId ? getBusinessSystemFamily(input.familyId) : undefined;
  const requestedProcessIds = boundedUnique(input.processIds, 12);
  const requestedModuleIds = boundedUnique(input.moduleIds, 12);
  const familyModuleIds = family
    ? family.coreModules.map((module) => normalizeId(module.id || module.name)).slice(0, 12)
    : [];
  const reportingName = input.reportingName?.trim();
  const categoryId = normalizeId(normalizedCategory);
  const familyAssumptions = family
    ? [
        `${family.name} catalog context was attached for review only.`,
        "Catalog reports and modules are planning inputs, not reporting assets.",
      ]
    : [];

  const model: ReportingLayerModel = {
    ...template,
    reportingId: family
      ? `reporting:${categoryId}:${normalizeId(family.familyId)}`
      : template.reportingId,
    ...(family ? { familyId: family.familyId } : {}),
    processIds: requestedProcessIds,
    moduleIds:
      requestedModuleIds.length > 0
        ? requestedModuleIds
        : template.moduleIds.length > 0
          ? template.moduleIds.slice()
          : familyModuleIds,
    name: reportingName && reportingName.length <= 120 ? reportingName : template.name,
    processAlignment: [
      ...template.processAlignment,
      ...(requestedProcessIds.length > 0
        ? [
            alignmentNote(
              `alignment:${categoryId}:process-input`,
              "process",
              "Caller-supplied process ids can be reviewed against reporting checkpoints.",
            ),
          ]
        : []),
    ],
    moduleAlignment: [
      ...template.moduleAlignment,
      ...(family
        ? [
            alignmentNote(
              `alignment:${categoryId}:${normalizeId(family.familyId)}:catalog`,
              "module_blueprint",
              `${family.name} catalog reports and modules can be compared with this reporting model.`,
            ),
          ]
        : []),
    ],
    planningAlignment: [
      ...template.planningAlignment,
      alignmentNote(
        `alignment:${categoryId}:maturity`,
        "planning",
        "Planning can compare MVP and enterprise reporting maturity against roadmap scope.",
      ),
    ],
    futureBiToolAlignment: [
      ...template.futureBiToolAlignment,
      alignmentNote(
        `alignment:${categoryId}:future-tool-strategy`,
        "future_bi_tool",
        "Future external BI tool strategy remains metadata only and separately approved.",
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
    confidence: input.confidence ?? (family || requestedProcessIds.length > 0 ? "medium" : template.confidence),
  };

  return result("model_built", [], [], model);
};
