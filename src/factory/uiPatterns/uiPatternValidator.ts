import {
  listUiPatternTemplates,
  supportedUiPatternCategories,
  uiPatternBoundaries,
} from "./uiPatternTemplates.js";
import type {
  UiAlignment,
  UiPatternCategory,
  UiPatternInput,
  UiPatternModel,
  UiPatternValidationFinding,
  UiPatternValidationResult,
} from "./types.js";

const MAX_TEXT_LENGTH = 1200;
const MAX_ARRAY_LENGTH = 120;

const forbiddenContentPatterns: Array<{ pattern: RegExp; reasonCode: string; safeMessage: string }> = [
  {
    pattern: /```|<\s*\/?\s*(div|span|section|main|form|table|button|input|script)\b|function\s+\w+\s*\(|class\s+\w+\s*\{|=>|const\s+\w+\s*=/i,
    reasonCode: "CODE_OR_MARKUP_SNIPPET",
    safeMessage: "UI pattern metadata must not include JSX, TSX, CSS, HTML, or code snippets.",
  },
  {
    pattern: /\bSELECT\b|\bINSERT\s+INTO\b|\bUPDATE\s+\w+\s+SET\b|\bDELETE\s+FROM\b|\bDROP\s+TABLE\b|\bCREATE\s+TABLE\b/i,
    reasonCode: "SQL_OR_SCHEMA_CONTENT",
    safeMessage: "UI pattern metadata must not include SQL or database schema snippets.",
  },
  {
    pattern: /provider output|provider call|network call|filesystem read|filesystem write|command execution/i,
    reasonCode: "FORBIDDEN_RUNTIME_BEHAVIOR",
    safeMessage: "UI pattern metadata must not describe provider, network, filesystem, or command behavior.",
  },
  {
    pattern: /UI rendering|render UI|render screen|mount UI|draw the screen|screen rendering/i,
    reasonCode: "FORBIDDEN_UI_RENDERING",
    safeMessage: "UI pattern metadata must not describe UI rendering behavior.",
  },
  {
    pattern: /generate route|generated route|create route|route file|generate component|generated component|create component|component file|scaffold output|frontend scaffold/i,
    reasonCode: "FORBIDDEN_UI_GENERATION",
    safeMessage: "UI pattern metadata must not describe route, component, or scaffold generation.",
  },
  {
    pattern: /generated dashboard|dashboard generation|BI execution|dashboard execution|report execution/i,
    reasonCode: "FORBIDDEN_DASHBOARD_BEHAVIOR",
    safeMessage: "UI pattern metadata must not describe generated dashboard or BI execution behavior.",
  },
  {
    pattern: /workflow execution|automation execution|runtime execution|store mutation|action dispatch|proposal creation/i,
    reasonCode: "FORBIDDEN_EXECUTION_BEHAVIOR",
    safeMessage: "UI pattern metadata must not describe workflow, automation, runtime, store, action, or proposal behavior.",
  },
  {
    pattern: /approval execution|execute approval|approve request|reject request|permission enforcement|enforce permission|grant permission|revoke permission/i,
    reasonCode: "FORBIDDEN_PERMISSION_OR_APPROVAL_BEHAVIOR",
    safeMessage: "UI pattern metadata must not describe approval execution or permission enforcement.",
  },
  {
    pattern: /transaction execution|payment execution|execute payment|process payment|run transaction|commit transaction/i,
    reasonCode: "FORBIDDEN_TRANSACTION_OR_PAYMENT_BEHAVIOR",
    safeMessage: "UI pattern metadata must not describe transaction or payment execution behavior.",
  },
  {
    pattern: /database schema|db schema|generated system|production-ready|production ready|JARVIS-complete|JARVIS complete/i,
    reasonCode: "FORBIDDEN_SYSTEM_OR_PRODUCTION_CLAIM",
    safeMessage: "UI pattern metadata must not describe schemas, generated systems, or production readiness.",
  },
  {
    pattern: /WCAG compliant|ADA compliant|accessibility certified|guarantees accessibility|accessibility guaranteed|certified|guarantees compliance|legally compliant/i,
    reasonCode: "ACCESSIBILITY_OR_COMPLIANCE_OVERCLAIM",
    safeMessage: "UI pattern metadata must not include accessibility or compliance guarantees.",
  },
];

const normalizeCategory = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const isSupportedCategory = (value: string): value is UiPatternCategory =>
  supportedUiPatternCategories.includes(value as UiPatternCategory);

const createdAt = (): string => new Date().toISOString();

const makeResult = (
  warnings: UiPatternValidationFinding[],
  errors: UiPatternValidationFinding[],
  modelCount: number,
): UiPatternValidationResult => ({
  validationId: `ui_pattern_validation:${createdAt()}`,
  createdAt: createdAt(),
  schemaVersion: "1.0",
  valid: errors.length === 0,
  status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass",
  modelCount,
  warnings,
  errors,
  advisoryOnly: true,
  boundaries: uiPatternBoundaries,
});

const addFinding = (
  findings: UiPatternValidationFinding[],
  severity: UiPatternValidationFinding["severity"],
  reasonCode: string,
  safeMessage: string,
  path?: string,
  model?: Partial<UiPatternModel>,
  metadata?: UiPatternValidationFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(model?.category ? { category: model.category } : {}),
    ...(model?.uiPatternId ? { uiPatternId: model.uiPatternId } : {}),
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
  errors: UiPatternValidationFinding[],
  path: string,
  model?: Partial<UiPatternModel>,
): void => {
  if (typeof value === "string" && value.length > MAX_TEXT_LENGTH) {
    addFinding(
      errors,
      "fail",
      "TEXT_TOO_LONG",
      "UI pattern metadata text exceeds the bounded length limit.",
      path,
      model,
    );
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) {
      addFinding(
        errors,
        "fail",
        "ARRAY_TOO_LONG",
        "UI pattern metadata array exceeds the bounded item limit.",
        path,
        model,
      );
    }
    value.forEach((item, index) => checkTextBounds(item, errors, `${path}.${index}`, model));
  }
  if (isObject(value)) {
    Object.entries(value).forEach(([key, item]) =>
      checkTextBounds(item, errors, `${path}.${key}`, model),
    );
  }
};

const checkForbiddenContent = (
  value: unknown,
  errors: UiPatternValidationFinding[],
  model?: Partial<UiPatternModel>,
): void => {
  safeStringValues(value).forEach((text) => {
    forbiddenContentPatterns.forEach(({ pattern, reasonCode, safeMessage }) => {
      if (pattern.test(text)) {
        addFinding(errors, "fail", reasonCode, safeMessage, undefined, model);
      }
    });
  });
};

const checkUniqueIds = (
  ids: string[],
  idLabel: string,
  errors: UiPatternValidationFinding[],
  model: Partial<UiPatternModel>,
): void => {
  const seen = new Set<string>();
  ids.forEach((id) => {
    if (!id.trim()) {
      addFinding(errors, "fail", "EMPTY_ID", `${idLabel} must not be empty.`, idLabel, model);
      return;
    }
    if (seen.has(id)) {
      addFinding(
        errors,
        "fail",
        "DUPLICATE_ID",
        `${idLabel} values must be unique.`,
        idLabel,
        model,
      );
    }
    seen.add(id);
  });
};

const requiredArray = (
  value: unknown,
  path: string,
  errors: UiPatternValidationFinding[],
  model: Partial<UiPatternModel>,
): void => {
  if (!Array.isArray(value) || value.length === 0) {
    addFinding(
      errors,
      "fail",
      "REQUIRED_ARRAY_EMPTY",
      "Required UI pattern arrays must be present and non-empty.",
      path,
      model,
    );
  }
};

const checkBoundaries = (
  model: Partial<UiPatternModel>,
  errors: UiPatternValidationFinding[],
): void => {
  if (model.advisoryOnly !== true) {
    addFinding(
      errors,
      "fail",
      "ADVISORY_ONLY_REQUIRED",
      "UI pattern model must be advisory only.",
      "advisoryOnly",
      model,
    );
  }

  const boundaries = model.boundaries as Record<string, unknown> | undefined;
  if (!boundaries) {
    addFinding(
      errors,
      "fail",
      "BOUNDARIES_REQUIRED",
      "UI pattern model must include advisory safety boundaries.",
      "boundaries",
      model,
    );
    return;
  }

  Object.keys(uiPatternBoundaries).forEach((boundaryName) => {
    if (boundaries[boundaryName] !== true) {
      addFinding(
        errors,
        "fail",
        "BOUNDARY_NOT_TRUE",
        "All UI pattern safety boundaries must be true.",
        `boundaries.${boundaryName}`,
        model,
      );
    }
  });
};

const checkAlignmentMetadataOnly = (
  alignments: UiAlignment[] | undefined,
  path: string,
  errors: UiPatternValidationFinding[],
  model: Partial<UiPatternModel>,
): void => {
  (alignments ?? []).forEach((alignment, index) => {
    if (alignment.advisoryOnly !== true || alignment.metadataOnly !== true) {
      addFinding(
        errors,
        "fail",
        "ALIGNMENT_METADATA_ONLY_REQUIRED",
        "UI pattern alignment entries must remain advisory metadata only.",
        `${path}.${index}`,
        model,
      );
    }
  });
};

const validateModelShape = (
  model: Partial<UiPatternModel>,
  errors: UiPatternValidationFinding[],
  warnings: UiPatternValidationFinding[],
): void => {
  if (!model.uiPatternId?.trim()) {
    addFinding(errors, "fail", "UI_PATTERN_ID_REQUIRED", "UI pattern id is required.", "uiPatternId", model);
  }
  if (model.schemaVersion !== "1.0") {
    addFinding(errors, "fail", "SCHEMA_VERSION_INVALID", "UI pattern schema version must be 1.0.", "schemaVersion", model);
  }
  if (!model.category || !isSupportedCategory(model.category)) {
    addFinding(errors, "fail", "CATEGORY_INVALID", "UI pattern category must be supported.", "category", model);
  }
  if (!model.name?.trim() || !model.purpose?.trim()) {
    addFinding(errors, "fail", "NAME_PURPOSE_REQUIRED", "UI pattern name and purpose are required.", "name", model);
  }
  if (!model.confidence) {
    addFinding(errors, "fail", "CONFIDENCE_REQUIRED", "UI pattern confidence is required.", "confidence", model);
  }

  requiredArray(model.screens, "screens", errors, model);
  requiredArray(model.layoutRegions, "layoutRegions", errors, model);
  requiredArray(model.navigationPatterns, "navigationPatterns", errors, model);
  requiredArray(model.interactionPatterns, "interactionPatterns", errors, model);
  requiredArray(model.dataDisplayPatterns, "dataDisplayPatterns", errors, model);
  requiredArray(model.forms, "forms", errors, model);
  requiredArray(model.tables, "tables", errors, model);
  requiredArray(model.filters, "filters", errors, model);
  requiredArray(model.workflowPatterns, "workflowPatterns", errors, model);
  requiredArray(model.permissionPatterns, "permissionPatterns", errors, model);
  requiredArray(model.documentPatterns, "documentPatterns", errors, model);
  requiredArray(model.reportingPatterns, "reportingPatterns", errors, model);
  requiredArray(model.accessibilityNotes, "accessibilityNotes", errors, model);
  requiredArray(model.responsiveNotes, "responsiveNotes", errors, model);
  requiredArray(model.stateNotes, "stateNotes", errors, model);
  requiredArray(model.risks, "risks", errors, model);
  requiredArray(model.assumptions, "assumptions", errors, model);
  requiredArray(model.exclusions, "exclusions", errors, model);

  checkUniqueIds((model.screens ?? []).map((item) => item.screenId), "screenId", errors, model);
  checkUniqueIds((model.layoutRegions ?? []).map((item) => item.regionId), "regionId", errors, model);
  checkUniqueIds((model.navigationPatterns ?? []).map((item) => item.navigationId), "navigationId", errors, model);
  checkUniqueIds((model.interactionPatterns ?? []).map((item) => item.interactionId), "interactionId", errors, model);
  checkUniqueIds((model.dataDisplayPatterns ?? []).map((item) => item.displayId), "displayId", errors, model);
  checkUniqueIds((model.forms ?? []).map((item) => item.formId), "formId", errors, model);
  checkUniqueIds((model.tables ?? []).map((item) => item.tableId), "tableId", errors, model);
  checkUniqueIds((model.filters ?? []).map((item) => item.filterId), "filterId", errors, model);
  checkUniqueIds((model.workflowPatterns ?? []).map((item) => item.workflowUiId), "workflowUiId", errors, model);
  checkUniqueIds((model.permissionPatterns ?? []).map((item) => item.permissionUiId), "permissionUiId", errors, model);
  checkUniqueIds((model.documentPatterns ?? []).map((item) => item.documentUiId), "documentUiId", errors, model);
  checkUniqueIds((model.reportingPatterns ?? []).map((item) => item.reportingUiId), "reportingUiId", errors, model);
  checkUniqueIds((model.risks ?? []).map((item) => item.riskId), "riskId", errors, model);

  (model.accessibilityNotes ?? []).forEach((note, index) => {
    if (note.notComplianceGuarantee !== true) {
      addFinding(
        errors,
        "fail",
        "ACCESSIBILITY_RECOMMENDATION_REQUIRED",
        "Accessibility notes must be recommendations, not guarantees.",
        `accessibilityNotes.${index}`,
        model,
      );
    }
  });

  (model.responsiveNotes ?? []).forEach((note, index) => {
    if (note.notRenderedBehavior !== true) {
      addFinding(
        errors,
        "fail",
        "RESPONSIVE_ADVISORY_REQUIRED",
        "Responsive notes must be advisory, not rendered behavior.",
        `responsiveNotes.${index}`,
        model,
      );
    }
  });

  (model.workflowPatterns ?? []).forEach((item, index) => {
    if (item.noWorkflowExecution !== true) {
      addFinding(
        errors,
        "fail",
        "WORKFLOW_UI_METADATA_ONLY_REQUIRED",
        "Workflow UI entries must not imply workflow behavior.",
        `workflowPatterns.${index}`,
        model,
      );
    }
  });

  (model.permissionPatterns ?? []).forEach((item, index) => {
    if (item.noPermissionEnforcement !== true) {
      addFinding(
        errors,
        "fail",
        "PERMISSION_METADATA_ONLY_REQUIRED",
        "Permission UI entries must not enforce permissions.",
        `permissionPatterns.${index}`,
        model,
      );
    }
  });

  (model.reportingPatterns ?? []).forEach((item, index) => {
    if (item.noDashboardGeneration !== true) {
      addFinding(
        errors,
        "fail",
        "REPORTING_UI_METADATA_ONLY_REQUIRED",
        "Reporting UI entries must not create dashboard assets.",
        `reportingPatterns.${index}`,
        model,
      );
    }
  });

  checkAlignmentMetadataOnly(model.moduleAlignment, "moduleAlignment", errors, model);
  checkAlignmentMetadataOnly(model.processAlignment, "processAlignment", errors, model);
  checkAlignmentMetadataOnly(model.reportingAlignment, "reportingAlignment", errors, model);
  checkAlignmentMetadataOnly(model.transactionAlignment, "transactionAlignment", errors, model);
  checkAlignmentMetadataOnly(model.planningAlignment, "planningAlignment", errors, model);
  checkAlignmentMetadataOnly(model.frameworkAlignment, "frameworkAlignment", errors, model);

  if (!model.maturityNotes?.mvp.length || !model.maturityNotes.enterprise.length || !model.maturityNotes.deferred.length) {
    addFinding(
      warnings,
      "warn",
      "MATURITY_NOTES_INCOMPLETE",
      "UI pattern maturity notes should include MVP, enterprise, and deferred notes.",
      "maturityNotes",
      model,
    );
  }
};

export const validateUiPatternModel = (
  model: UiPatternModel,
): UiPatternValidationResult => {
  const warnings: UiPatternValidationFinding[] = [];
  const errors: UiPatternValidationFinding[] = [];
  validateModelShape(model, errors, warnings);
  checkBoundaries(model, errors);
  checkTextBounds(model, errors, "model", model);
  checkForbiddenContent(model, errors, model);
  return makeResult(warnings, errors, 1);
};

export const validateUiPatternModels = (
  models: UiPatternModel[],
): UiPatternValidationResult => {
  const warnings: UiPatternValidationFinding[] = [];
  const errors: UiPatternValidationFinding[] = [];

  if (!Array.isArray(models) || models.length === 0) {
    addFinding(
      errors,
      "fail",
      "MODELS_REQUIRED",
      "At least one UI pattern model is required for validation.",
    );
    return makeResult(warnings, errors, 0);
  }

  const categories = new Set<string>();
  models.forEach((model, index) => {
    validateModelShape(model, errors, warnings);
    checkBoundaries(model, errors);
    checkTextBounds(model, errors, `models.${index}`, model);
    checkForbiddenContent(model, errors, model);
    if (model.category) {
      if (categories.has(model.category)) {
        addFinding(
          errors,
          "fail",
          "DUPLICATE_CATEGORY",
          "UI pattern categories must be unique in a template set.",
          `models.${index}.category`,
          model,
        );
      }
      categories.add(model.category);
    }
  });

  supportedUiPatternCategories.forEach((category) => {
    if (!categories.has(category)) {
      addFinding(
        warnings,
        "warn",
        "SUPPORTED_CATEGORY_MISSING",
        "A supported UI pattern category is missing from this model set.",
        "category",
        { category },
      );
    }
  });

  return makeResult(warnings, errors, models.length);
};

export const validateUiPatternInput = (
  input: UiPatternInput,
): UiPatternValidationResult => {
  const warnings: UiPatternValidationFinding[] = [];
  const errors: UiPatternValidationFinding[] = [];
  const normalizedCategory = normalizeCategory(input.category);

  if (!normalizedCategory || !isSupportedCategory(normalizedCategory)) {
    addFinding(
      errors,
      "fail",
      "CATEGORY_INVALID",
      "UI pattern input category must be supported.",
      "category",
    );
  }

  checkTextBounds(input, errors, "input");
  checkForbiddenContent(input, errors);

  return makeResult(warnings, errors, 0);
};

export const validateDefaultUiPatternTemplates = (): UiPatternValidationResult =>
  validateUiPatternModels(listUiPatternTemplates());
