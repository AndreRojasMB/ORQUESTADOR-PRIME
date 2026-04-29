import {
  cloneEnterpriseDemoTemplate,
  enterpriseDemoBoundaries,
  getEnterpriseDemoTemplateById,
  listEnterpriseDemoTemplates as listTemplateModels,
  supportedEnterpriseDemoCategories,
  supportedEnterpriseDemoIds,
} from "./enterpriseDemoTemplates.js";
import type {
  EnterpriseDemoCategory,
  EnterpriseDemoId,
  EnterpriseDemoInput,
  EnterpriseDemoResult,
  EnterpriseDemoTemplate,
  EnterpriseDemoValidationFinding,
} from "./types.js";

const normalizeId = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const isSupportedDemoId = (value: string): value is EnterpriseDemoId =>
  supportedEnterpriseDemoIds.includes(value as EnterpriseDemoId);

const isSupportedCategory = (value: string): value is EnterpriseDemoCategory =>
  supportedEnterpriseDemoCategories.includes(value as EnterpriseDemoCategory);

const boundedUnique = (values: readonly string[] | undefined, limit: number): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean))).slice(0, limit);

const finding = (
  reasonCode: string,
  safeMessage: string,
  path?: string,
): EnterpriseDemoValidationFinding => ({
  id: "finding_1",
  severity: "fail",
  reasonCode,
  safeMessage,
  ...(path ? { path } : {}),
});

const result = (
  status: EnterpriseDemoResult["status"],
  errors: EnterpriseDemoValidationFinding[],
  warnings: EnterpriseDemoValidationFinding[] = [],
  demo?: EnterpriseDemoTemplate,
  demos?: EnterpriseDemoTemplate[],
): EnterpriseDemoResult => ({
  ok: errors.length === 0 && (status === "demo_found" || status === "demo_built"),
  status,
  ...(demo ? { demo } : {}),
  ...(demos ? { demos } : {}),
  warnings,
  errors,
  advisoryOnly: true,
  sourceOnly: true,
  boundaries: enterpriseDemoBoundaries,
});

export const listEnterpriseDemoTemplates = (): EnterpriseDemoTemplate[] =>
  listTemplateModels();

export const getEnterpriseDemoTemplate = (
  demoId: EnterpriseDemoId | string,
): EnterpriseDemoResult => {
  const normalized = normalizeId(demoId);
  if (!isSupportedDemoId(normalized)) {
    return result("demo_not_found", [
      finding(
        "DEMO_ID_NOT_FOUND",
        "Requested enterprise demo id is not in the supported advisory registry.",
        "demoId",
      ),
    ]);
  }

  const template = getEnterpriseDemoTemplateById(normalized);
  return template
    ? result("demo_found", [], [], cloneEnterpriseDemoTemplate(template))
    : result("demo_not_found", [
        finding(
          "DEMO_TEMPLATE_NOT_FOUND",
          "Requested enterprise demo template is not available.",
          "demoId",
        ),
      ]);
};

export const buildEnterpriseDemo = (
  input: EnterpriseDemoInput = {},
): EnterpriseDemoResult => {
  const requestedDemoId = normalizeId(input.demoId ?? input.category ?? "generic_factory_demo");
  if (!isSupportedDemoId(requestedDemoId)) {
    return result("input_invalid", [
      finding(
        "DEMO_ID_INVALID",
        "Enterprise demo input includes an unsupported demo id.",
        "demoId",
      ),
    ]);
  }

  if (input.category && !isSupportedCategory(normalizeId(input.category))) {
    return result("input_invalid", [
      finding(
        "DEMO_CATEGORY_INVALID",
        "Enterprise demo input includes an unsupported demo category.",
        "category",
      ),
    ]);
  }

  const template = getEnterpriseDemoTemplateById(requestedDemoId);
  if (!template) {
    return result("demo_not_found", [
      finding(
        "DEMO_TEMPLATE_NOT_FOUND",
        "Requested enterprise demo template is not available.",
        "demoId",
      ),
    ]);
  }

  const demo: EnterpriseDemoTemplate = {
    ...cloneEnterpriseDemoTemplate(template),
    name: input.name?.trim() || template.name,
    summary: input.summary?.trim() || template.summary,
    assumptions: [
      "Enterprise demo metadata is advisory and source-only.",
      ...boundedUnique(template.assumptions, 10),
      ...boundedUnique(input.assumptions, 8),
    ],
    exclusions: [
      ...boundedUnique(template.exclusions, 14),
      ...boundedUnique(input.exclusions, 8),
    ],
    advisoryOnly: true,
    sourceOnly: true,
    boundaries: enterpriseDemoBoundaries,
  };

  return result("demo_built", [], [], demo, [demo]);
};
