import {
  listReportingTemplates,
  reportingBoundaries,
  supportedReportingCategories,
} from "./reportingTemplates.js";
import type {
  DataQualityCheck,
  KpiDefinition,
  MetricDefinition,
  ReportingDomainCategory,
  ReportingLayerInput,
  ReportingLayerModel,
  ReportingValidationFinding,
  ReportingValidationResult,
} from "./types.js";

const MAX_TEXT_LENGTH = 1200;
const MAX_ARRAY_LENGTH = 120;

const forbiddenContentPatterns: Array<{ pattern: RegExp; reasonCode: string; safeMessage: string }> = [
  {
    pattern: /\bSELECT\b|\bINSERT\s+INTO\b|\bUPDATE\s+\w+\s+SET\b|\bDELETE\s+FROM\b|\bDROP\s+TABLE\b|\bCREATE\s+TABLE\b/i,
    reasonCode: "SQL_OR_SCHEMA_CONTENT",
    safeMessage: "Reporting metadata must not include SQL or database schema snippets.",
  },
  {
    pattern: /```|<script\b|function\s+\w+\s*\(|class\s+\w+\s*\{|=>/i,
    reasonCode: "CODE_SNIPPET",
    safeMessage: "Reporting metadata must not include code snippets.",
  },
  {
    pattern: /provider output|provider call|network call|filesystem read|filesystem write|command execution/i,
    reasonCode: "FORBIDDEN_RUNTIME_BEHAVIOR",
    safeMessage: "Reporting metadata must not describe provider, network, filesystem, or command behavior.",
  },
  {
    pattern: /report execution|dashboard execution|etl execution|BI tool API|sql execution/i,
    reasonCode: "FORBIDDEN_REPORTING_EXECUTION",
    safeMessage: "Reporting metadata must not describe report, dashboard, ETL, BI API, or SQL behavior.",
  },
  {
    pattern: /workflow execution|automation execution|runtime execution|store mutation|action dispatch|proposal creation/i,
    reasonCode: "FORBIDDEN_EXECUTION_BEHAVIOR",
    safeMessage: "Reporting metadata must not describe workflow, automation, runtime, store, action, or proposal behavior.",
  },
  {
    pattern: /scaffold output|generated dashboard|generated sql|generated etl|generated system|database schema|db schema/i,
    reasonCode: "FORBIDDEN_GENERATION_BEHAVIOR",
    safeMessage: "Reporting metadata must not describe generated assets, scaffolds, or schemas.",
  },
  {
    pattern: /certified|guarantees compliance|legally compliant|security certified|compliance guaranteed/i,
    reasonCode: "COMPLIANCE_OVERCLAIM",
    safeMessage: "Reporting metadata must not include compliance or security certification claims.",
  },
  {
    pattern: /production-ready|production ready|JARVIS-complete|JARVIS complete/i,
    reasonCode: "PRODUCTION_OVERCLAIM",
    safeMessage: "Reporting metadata must not claim production readiness.",
  },
  {
    pattern: /\$\s*\d|\b\d+(?:\.\d+)?\s*%|guaranteed revenue|guaranteed savings|guaranteed profit/i,
    reasonCode: "UNSUPPORTED_EXACT_CLAIM",
    safeMessage: "Reporting metadata must not include exact financial or business claims without explicit assumptions.",
  },
];

const normalizeCategory = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const isSupportedCategory = (value: string): value is ReportingDomainCategory =>
  supportedReportingCategories.includes(value as ReportingDomainCategory);

const createdAt = (): string => new Date().toISOString();

const makeResult = (
  warnings: ReportingValidationFinding[],
  errors: ReportingValidationFinding[],
  modelCount: number,
): ReportingValidationResult => ({
  validationId: `reporting_validation:${createdAt()}`,
  createdAt: createdAt(),
  schemaVersion: "1.0",
  valid: errors.length === 0,
  status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass",
  modelCount,
  warnings,
  errors,
  advisoryOnly: true,
  boundaries: reportingBoundaries,
});

const addFinding = (
  findings: ReportingValidationFinding[],
  severity: ReportingValidationFinding["severity"],
  reasonCode: string,
  safeMessage: string,
  path?: string,
  model?: Partial<ReportingLayerModel>,
  metadata?: ReportingValidationFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(model?.category ? { category: model.category } : {}),
    ...(model?.reportingId ? { reportingId: model.reportingId } : {}),
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
  errors: ReportingValidationFinding[],
  path: string,
  model?: Partial<ReportingLayerModel>,
): void => {
  if (typeof value === "string" && value.length > MAX_TEXT_LENGTH) {
    addFinding(
      errors,
      "fail",
      "TEXT_TOO_LONG",
      "Reporting metadata text exceeds the bounded length limit.",
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
        "Reporting metadata array exceeds the bounded item limit.",
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
  errors: ReportingValidationFinding[],
  model?: Partial<ReportingLayerModel>,
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
  errors: ReportingValidationFinding[],
  model: Partial<ReportingLayerModel>,
): void => {
  const seen = new Set<string>();
  ids.forEach((id) => {
    if (!id.trim()) {
      addFinding(
        errors,
        "fail",
        "EMPTY_ID",
        `${idLabel} must not be empty.`,
        idLabel,
        model,
      );
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

const checkBoundaries = (
  model: Partial<ReportingLayerModel>,
  errors: ReportingValidationFinding[],
): void => {
  if (model.advisoryOnly !== true) {
    addFinding(
      errors,
      "fail",
      "ADVISORY_ONLY_REQUIRED",
      "Reporting model must be advisory only.",
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
      "Reporting model must include advisory safety boundaries.",
      "boundaries",
      model,
    );
    return;
  }

  Object.keys(reportingBoundaries).forEach((boundaryName) => {
    if (boundaries[boundaryName] !== true) {
      addFinding(
        errors,
        "fail",
        "BOUNDARY_NOT_TRUE",
        "All reporting safety boundaries must be true.",
        `boundaries.${boundaryName}`,
        model,
      );
    }
  });
};

const requiredArray = (
  value: unknown,
  path: string,
  errors: ReportingValidationFinding[],
  model: Partial<ReportingLayerModel>,
): void => {
  if (!Array.isArray(value) || value.length === 0) {
    addFinding(
      errors,
      "fail",
      "REQUIRED_ARRAY_EMPTY",
      "Required reporting arrays must be present and non-empty.",
      path,
      model,
    );
  }
};

const checkMetadataOnly = (
  items: Array<{ metadataOnly?: boolean; advisoryOnly?: boolean }>,
  path: string,
  errors: ReportingValidationFinding[],
  model: Partial<ReportingLayerModel>,
): void => {
  items.forEach((item, index) => {
    if (item.metadataOnly !== true && item.advisoryOnly !== true) {
      addFinding(
        errors,
        "fail",
        "METADATA_ONLY_REQUIRED",
        "Dashboard, report, dataset, dimension, measure, and visualization items must remain metadata only or advisory only.",
        `${path}.${index}`,
        model,
      );
    }
  });
};

const checkKpis = (
  kpis: KpiDefinition[],
  errors: ReportingValidationFinding[],
  model: Partial<ReportingLayerModel>,
): void => {
  kpis.forEach((item, index) => {
    if (!item.assumptions?.length || !item.calculationNotes?.length) {
      addFinding(
        errors,
        "fail",
        "KPI_ASSUMPTIONS_REQUIRED",
        "KPIs must include assumptions and calculation notes.",
        `kpis.${index}`,
        model,
      );
    }
    if (item.advisoryOnly !== true) {
      addFinding(
        errors,
        "fail",
        "KPI_ADVISORY_ONLY_REQUIRED",
        "KPIs must be advisory metadata.",
        `kpis.${index}.advisoryOnly`,
        model,
      );
    }
  });
};

const checkMetrics = (
  metrics: MetricDefinition[],
  errors: ReportingValidationFinding[],
  model: Partial<ReportingLayerModel>,
): void => {
  metrics.forEach((item, index) => {
    if (!item.assumptions?.length || !item.calculationNotes?.length) {
      addFinding(
        errors,
        "fail",
        "METRIC_ASSUMPTIONS_REQUIRED",
        "Metrics must include assumptions and calculation notes.",
        `metrics.${index}`,
        model,
      );
    }
    if (item.advisoryOnly !== true) {
      addFinding(
        errors,
        "fail",
        "METRIC_ADVISORY_ONLY_REQUIRED",
        "Metrics must be advisory metadata.",
        `metrics.${index}.advisoryOnly`,
        model,
      );
    }
  });
};

const checkDataQuality = (
  checks: DataQualityCheck[],
  errors: ReportingValidationFinding[],
  model: Partial<ReportingLayerModel>,
): void => {
  checks.forEach((item, index) => {
    if (!item.safeCheckSummary?.trim()) {
      addFinding(
        errors,
        "fail",
        "QUALITY_CHECK_SUMMARY_REQUIRED",
        "Data quality checks must include safe non-executable summaries.",
        `dataQualityChecks.${index}`,
        model,
      );
    }
    if (item.advisoryOnly !== true) {
      addFinding(
        errors,
        "fail",
        "QUALITY_CHECK_ADVISORY_ONLY_REQUIRED",
        "Data quality checks must be advisory only.",
        `dataQualityChecks.${index}.advisoryOnly`,
        model,
      );
    }
  });
};

const checkReferences = (
  model: ReportingLayerModel,
  errors: ReportingValidationFinding[],
): void => {
  const kpiIds = new Set(model.kpis.map((item) => item.kpiId));
  const metricIds = new Set(model.metrics.map((item) => item.metricId));
  const dimensionIds = new Set(model.dimensions.map((item) => item.dimensionId));
  const measureIds = new Set(model.measures.map((item) => item.measureId));
  const sectionIds = new Set(model.sections.map((item) => item.sectionId));
  const visualizationIds = new Set(model.visualizations.map((item) => item.visualizationId));
  const consumerIds = new Set(model.consumers.map((item) => item.consumerId));
  const permissionIds = new Set(model.permissions.map((item) => item.permissionId));

  const requireKnown = (
    ids: string[],
    known: Set<string>,
    reasonCode: string,
    path: string,
  ): void => {
    ids.forEach((id) => {
      if (!known.has(id)) {
        addFinding(
          errors,
          "fail",
          reasonCode,
          "Reporting references must point to known metadata ids.",
          path,
          model,
        );
      }
    });
  };

  model.kpis.forEach((item, index) =>
    requireKnown(item.metricIds, metricIds, "UNKNOWN_METRIC_REFERENCE", `kpis.${index}.metricIds`),
  );
  model.metrics.forEach((item, index) => {
    requireKnown(
      item.dimensionIds,
      dimensionIds,
      "UNKNOWN_DIMENSION_REFERENCE",
      `metrics.${index}.dimensionIds`,
    );
    requireKnown(
      item.measureIds,
      measureIds,
      "UNKNOWN_MEASURE_REFERENCE",
      `metrics.${index}.measureIds`,
    );
  });
  model.sections.forEach((item, index) => {
    requireKnown(item.kpiIds, kpiIds, "UNKNOWN_KPI_REFERENCE", `sections.${index}.kpiIds`);
    requireKnown(
      item.metricIds,
      metricIds,
      "UNKNOWN_METRIC_REFERENCE",
      `sections.${index}.metricIds`,
    );
    requireKnown(
      item.visualizationIds,
      visualizationIds,
      "UNKNOWN_VISUALIZATION_REFERENCE",
      `sections.${index}.visualizationIds`,
    );
  });
  model.visualizations.forEach((item, index) => {
    requireKnown(
      item.kpiIds,
      kpiIds,
      "UNKNOWN_KPI_REFERENCE",
      `visualizations.${index}.kpiIds`,
    );
    requireKnown(
      item.metricIds,
      metricIds,
      "UNKNOWN_METRIC_REFERENCE",
      `visualizations.${index}.metricIds`,
    );
    requireKnown(
      item.dimensionIds,
      dimensionIds,
      "UNKNOWN_DIMENSION_REFERENCE",
      `visualizations.${index}.dimensionIds`,
    );
  });
  model.dashboards.forEach((item, index) => {
    requireKnown(
      item.sectionIds,
      sectionIds,
      "UNKNOWN_SECTION_REFERENCE",
      `dashboards.${index}.sectionIds`,
    );
    requireKnown(
      item.visualizationIds,
      visualizationIds,
      "UNKNOWN_VISUALIZATION_REFERENCE",
      `dashboards.${index}.visualizationIds`,
    );
    requireKnown(
      item.consumerIds,
      consumerIds,
      "UNKNOWN_CONSUMER_REFERENCE",
      `dashboards.${index}.consumerIds`,
    );
    requireKnown(
      item.permissionIds,
      permissionIds,
      "UNKNOWN_PERMISSION_REFERENCE",
      `dashboards.${index}.permissionIds`,
    );
  });
  model.reports.forEach((item, index) => {
    requireKnown(
      item.sectionIds,
      sectionIds,
      "UNKNOWN_SECTION_REFERENCE",
      `reports.${index}.sectionIds`,
    );
    requireKnown(
      item.consumerIds,
      consumerIds,
      "UNKNOWN_CONSUMER_REFERENCE",
      `reports.${index}.consumerIds`,
    );
    requireKnown(
      item.permissionIds,
      permissionIds,
      "UNKNOWN_PERMISSION_REFERENCE",
      `reports.${index}.permissionIds`,
    );
  });
  model.datasets.forEach((item, index) => {
    requireKnown(
      item.dimensionIds,
      dimensionIds,
      "UNKNOWN_DIMENSION_REFERENCE",
      `datasets.${index}.dimensionIds`,
    );
    requireKnown(
      item.measureIds,
      measureIds,
      "UNKNOWN_MEASURE_REFERENCE",
      `datasets.${index}.measureIds`,
    );
  });
};

export const validateReportingLayerModel = (
  model: ReportingLayerModel,
): ReportingValidationResult => validateReportingLayerModels([model]);

export const validateReportingLayerModels = (
  models: ReportingLayerModel[],
): ReportingValidationResult => {
  const warnings: ReportingValidationFinding[] = [];
  const errors: ReportingValidationFinding[] = [];

  if (!Array.isArray(models) || models.length === 0) {
    addFinding(
      errors,
      "fail",
      "MODELS_REQUIRED",
      "At least one reporting model is required for validation.",
    );
    return makeResult(warnings, errors, 0);
  }

  models.forEach((model, modelIndex) => {
    if (!isObject(model)) {
      addFinding(
        errors,
        "fail",
        "MODEL_OBJECT_REQUIRED",
        "Reporting model must be an object.",
        `models.${modelIndex}`,
      );
      return;
    }

    if (!isSupportedCategory(model.category)) {
      addFinding(
        errors,
        "fail",
        "UNKNOWN_CATEGORY",
        "Reporting model category must be supported.",
        `models.${modelIndex}.category`,
        model,
      );
    }

    ["reportingId", "name", "purpose"].forEach((field) => {
      if (typeof model[field as keyof ReportingLayerModel] !== "string" || !(model[field as keyof ReportingLayerModel] as string).trim()) {
        addFinding(
          errors,
          "fail",
          "REQUIRED_FIELD_EMPTY",
          "Required reporting fields must be present and non-empty.",
          `models.${modelIndex}.${field}`,
          model,
        );
      }
    });

    requiredArray(model.kpis, `models.${modelIndex}.kpis`, errors, model);
    requiredArray(model.metrics, `models.${modelIndex}.metrics`, errors, model);
    requiredArray(model.dashboards, `models.${modelIndex}.dashboards`, errors, model);
    requiredArray(model.reports, `models.${modelIndex}.reports`, errors, model);
    requiredArray(model.sections, `models.${modelIndex}.sections`, errors, model);
    requiredArray(model.visualizations, `models.${modelIndex}.visualizations`, errors, model);
    requiredArray(model.datasets, `models.${modelIndex}.datasets`, errors, model);
    requiredArray(model.dimensions, `models.${modelIndex}.dimensions`, errors, model);
    requiredArray(model.measures, `models.${modelIndex}.measures`, errors, model);
    requiredArray(
      model.freshnessAssumptions,
      `models.${modelIndex}.freshnessAssumptions`,
      errors,
      model,
    );
    requiredArray(model.dataQualityChecks, `models.${modelIndex}.dataQualityChecks`, errors, model);
    requiredArray(model.etlNotes, `models.${modelIndex}.etlNotes`, errors, model);
    requiredArray(model.warehouseNotes, `models.${modelIndex}.warehouseNotes`, errors, model);
    requiredArray(model.consumers, `models.${modelIndex}.consumers`, errors, model);
    requiredArray(model.permissions, `models.${modelIndex}.permissions`, errors, model);
    requiredArray(model.risks, `models.${modelIndex}.risks`, errors, model);
    requiredArray(model.assumptions, `models.${modelIndex}.assumptions`, errors, model);
    requiredArray(model.exclusions, `models.${modelIndex}.exclusions`, errors, model);

    checkBoundaries(model, errors);
    checkTextBounds(model, errors, `models.${modelIndex}`, model);
    checkForbiddenContent(model, errors, model);

    if (Array.isArray(model.kpis)) {
      checkUniqueIds(model.kpis.map((item) => item.kpiId), "kpiId", errors, model);
      checkKpis(model.kpis, errors, model);
    }
    if (Array.isArray(model.metrics)) {
      checkUniqueIds(model.metrics.map((item) => item.metricId), "metricId", errors, model);
      checkMetrics(model.metrics, errors, model);
    }
    if (Array.isArray(model.dashboards)) {
      checkUniqueIds(
        model.dashboards.map((item) => item.dashboardId),
        "dashboardId",
        errors,
        model,
      );
      checkMetadataOnly(model.dashboards, "dashboards", errors, model);
    }
    if (Array.isArray(model.reports)) {
      checkUniqueIds(model.reports.map((item) => item.reportId), "reportId", errors, model);
      checkMetadataOnly(model.reports, "reports", errors, model);
    }
    if (Array.isArray(model.datasets)) {
      checkUniqueIds(
        model.datasets.map((item) => item.datasetId),
        "datasetId",
        errors,
        model,
      );
      checkMetadataOnly(model.datasets, "datasets", errors, model);
    }
    if (Array.isArray(model.dimensions)) {
      checkUniqueIds(
        model.dimensions.map((item) => item.dimensionId),
        "dimensionId",
        errors,
        model,
      );
      checkMetadataOnly(model.dimensions, "dimensions", errors, model);
    }
    if (Array.isArray(model.measures)) {
      checkUniqueIds(model.measures.map((item) => item.measureId), "measureId", errors, model);
      checkMetadataOnly(model.measures, "measures", errors, model);
    }
    if (Array.isArray(model.visualizations)) {
      checkUniqueIds(
        model.visualizations.map((item) => item.visualizationId),
        "visualizationId",
        errors,
        model,
      );
      checkMetadataOnly(model.visualizations, "visualizations", errors, model);
    }
    if (Array.isArray(model.consumers)) {
      checkUniqueIds(
        model.consumers.map((item) => item.consumerId),
        "consumerId",
        errors,
        model,
      );
    }
    if (Array.isArray(model.permissions)) {
      checkUniqueIds(
        model.permissions.map((item) => item.permissionId),
        "permissionId",
        errors,
        model,
      );
      model.permissions.forEach((item, index) => {
        if (item.advisoryOnly !== true || item.noAccessEnforcement !== true) {
          addFinding(
            errors,
            "fail",
            "PERMISSION_METADATA_ONLY_REQUIRED",
            "Report permissions must be advisory metadata only.",
            `permissions.${index}`,
            model,
          );
        }
      });
    }
    if (Array.isArray(model.dataQualityChecks)) {
      checkDataQuality(model.dataQualityChecks, errors, model);
    }
    if (Array.isArray(model.etlNotes)) {
      model.etlNotes.forEach((item, index) => {
        if (item.advisoryOnly !== true || item.notExecutable !== true) {
          addFinding(
            errors,
            "fail",
            "ETL_NOTE_ADVISORY_ONLY_REQUIRED",
            "ETL notes must be advisory and not executable.",
            `etlNotes.${index}`,
            model,
          );
        }
      });
    }
    if (Array.isArray(model.warehouseNotes)) {
      model.warehouseNotes.forEach((item, index) => {
        if (item.advisoryOnly !== true || item.notSchema !== true) {
          addFinding(
            errors,
            "fail",
            "WAREHOUSE_NOTE_METADATA_ONLY_REQUIRED",
            "Warehouse notes must be advisory metadata and not schemas.",
            `warehouseNotes.${index}`,
            model,
          );
        }
      });
    }

    if (
      Array.isArray(model.kpis) &&
      Array.isArray(model.metrics) &&
      Array.isArray(model.dashboards) &&
      Array.isArray(model.reports) &&
      Array.isArray(model.sections) &&
      Array.isArray(model.visualizations) &&
      Array.isArray(model.datasets) &&
      Array.isArray(model.dimensions) &&
      Array.isArray(model.measures) &&
      Array.isArray(model.consumers) &&
      Array.isArray(model.permissions)
    ) {
      checkReferences(model, errors);
    }
  });

  return makeResult(warnings, errors, models.length);
};

export const validateReportingLayerInput = (
  input: ReportingLayerInput,
): ReportingValidationResult => {
  const warnings: ReportingValidationFinding[] = [];
  const errors: ReportingValidationFinding[] = [];

  if (!input || typeof input !== "object") {
    addFinding(
      errors,
      "fail",
      "INPUT_OBJECT_REQUIRED",
      "Reporting layer input must be an object.",
    );
    return makeResult(warnings, errors, 0);
  }

  const normalized = normalizeCategory(String(input.category ?? ""));
  if (!normalized || !isSupportedCategory(normalized)) {
    addFinding(
      errors,
      "fail",
      "UNKNOWN_CATEGORY",
      "Reporting input category must be supported.",
      "category",
    );
  }

  checkTextBounds(input, errors, "input");
  checkForbiddenContent(input, errors);

  return makeResult(warnings, errors, 0);
};

export const validateReportingTemplateRegistry = (): ReportingValidationResult =>
  validateReportingLayerModels(listReportingTemplates());
