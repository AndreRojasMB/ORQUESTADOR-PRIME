import { getBusinessSystemFamily } from "../catalog/businessSystemsCatalog.js";
import {
  listTransactionalTemplates as cloneTransactionalTemplates,
  supportedTransactionalCategories,
  transactionalBoundaries,
} from "./transactionTemplates.js";
import type {
  TransactionalAlignment,
  TransactionalDomainCategory,
  TransactionalSystemInput,
  TransactionalSystemModel,
  TransactionalSystemResult,
  TransactionalValidationFinding,
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

const isSupportedCategory = (value: string): value is TransactionalDomainCategory =>
  supportedTransactionalCategories.includes(value as TransactionalDomainCategory);

const makeFinding = (
  reasonCode: string,
  safeMessage: string,
  category?: TransactionalDomainCategory | string,
): TransactionalValidationFinding => ({
  id: "finding_1",
  severity: "fail",
  reasonCode,
  safeMessage,
  ...(category && isSupportedCategory(normalizeCategory(category))
    ? { category: normalizeCategory(category) as TransactionalDomainCategory }
    : {}),
});

const result = (
  status: TransactionalSystemResult["status"],
  errors: TransactionalValidationFinding[],
  warnings: TransactionalValidationFinding[] = [],
  model?: TransactionalSystemModel,
  models?: TransactionalSystemModel[],
): TransactionalSystemResult => ({
  ok: errors.length === 0 && (status === "model_built" || status === "template_found"),
  status,
  ...(model ? { model } : {}),
  ...(models ? { models } : {}),
  warnings,
  errors,
  advisoryOnly: true,
  boundaries: transactionalBoundaries,
});

const boundedUnique = (values: readonly string[] | undefined, limit: number): string[] =>
  Array.from(new Set((values ?? []).map(normalizeId).filter(Boolean))).slice(0, limit);

const cloneTemplate = (category: TransactionalDomainCategory): TransactionalSystemModel | undefined =>
  cloneTransactionalTemplates().find((template) => template.category === category);

const alignmentNote = (
  alignmentId: string,
  target: TransactionalAlignment["target"],
  safeSummary: string,
  futureOnly = false,
): TransactionalAlignment => ({
  alignmentId,
  target,
  safeSummary,
  advisoryOnly: true,
  ...(futureOnly ? { futureOnly: true } : {}),
});

export const getTransactionalTemplate = (
  category: TransactionalDomainCategory | string,
): TransactionalSystemResult => {
  const normalized = normalizeCategory(category);
  if (!isSupportedCategory(normalized)) {
    return result("category_not_found", [
      makeFinding(
        "CATEGORY_NOT_FOUND",
        "Requested transactional category is not in the supported source registry.",
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
          "Requested transactional template is not available.",
          normalized,
        ),
      ]);
};

export const listTransactionalTemplates = (): TransactionalSystemModel[] =>
  cloneTransactionalTemplates();

export const buildTransactionalSystemModel = (
  input: TransactionalSystemInput,
): TransactionalSystemResult => {
  const normalizedCategory = normalizeCategory(input.category);
  if (!isSupportedCategory(normalizedCategory)) {
    return result("category_not_found", [
      makeFinding(
        "CATEGORY_NOT_FOUND",
        "Requested transactional category is not in the supported source registry.",
        input.category,
      ),
    ]);
  }

  const template = cloneTemplate(normalizedCategory);
  if (!template) {
    return result("category_not_found", [
      makeFinding(
        "CATEGORY_NOT_FOUND",
        "Requested transactional template is not available.",
        normalizedCategory,
      ),
    ]);
  }

  const family = input.familyId ? getBusinessSystemFamily(input.familyId) : undefined;
  const requestedProcessIds = boundedUnique(input.processIds, 12);
  const requestedModuleIds = boundedUnique(input.moduleIds, 12);
  const requestedReportingIds = boundedUnique(input.reportingIds, 12);
  const familyModuleIds = family
    ? family.coreModules.map((module) => normalizeId(module.id || module.name)).slice(0, 12)
    : [];
  const transactionalName = input.transactionalName?.trim();
  const categoryId = normalizeId(normalizedCategory);
  const familyAssumptions = family
    ? [
        `${family.name} catalog context was attached for review only.`,
        "Catalog workflows, modules, and reports are planning inputs, not transactional assets.",
      ]
    : [];

  const model: TransactionalSystemModel = {
    ...template,
    transactionalId: family
      ? `transactional:${categoryId}:${normalizeId(family.familyId)}`
      : template.transactionalId,
    ...(family ? { familyId: family.familyId } : {}),
    processIds: requestedProcessIds,
    moduleIds:
      requestedModuleIds.length > 0
        ? requestedModuleIds
        : template.moduleIds.length > 0
          ? template.moduleIds.slice()
          : familyModuleIds,
    reportingIds: requestedReportingIds,
    name: transactionalName && transactionalName.length <= 120 ? transactionalName : template.name,
    processAlignment: [
      ...template.processAlignment,
      ...(requestedProcessIds.length > 0
        ? [
            alignmentNote(
              `alignment:${categoryId}:process-input`,
              "process",
              "Caller-supplied process ids can be reviewed against transactional states.",
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
              `${family.name} catalog modules can be compared with this transactional model.`,
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
              "Caller-supplied reporting ids can be reviewed against transactional traceability.",
            ),
          ]
        : []),
    ],
    planningAlignment: [
      ...template.planningAlignment,
      alignmentNote(
        `alignment:${categoryId}:maturity`,
        "planning",
        "Planning can compare MVP and enterprise transactional maturity against roadmap scope.",
      ),
    ],
    futureRuntimeStoreMigrationAlignment: [
      ...template.futureRuntimeStoreMigrationAlignment,
      alignmentNote(
        `alignment:${categoryId}:future-runtime-store-migration`,
        "future_runtime_store_migration",
        "Future runtime, store, and migration alignment remains metadata only and separately approved.",
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
    confidence:
      input.confidence ??
      (family || requestedProcessIds.length > 0 || requestedReportingIds.length > 0
        ? "medium"
        : template.confidence),
  };

  return result("model_built", [], [], model);
};
