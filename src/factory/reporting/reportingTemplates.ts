import type {
  AnalyticalDataset,
  AnalyticalDimension,
  AnalyticalMeasure,
  DashboardDefinition,
  DataFreshnessAssumption,
  DataQualityCheck,
  EtlPlanNote,
  KpiDefinition,
  MetricDefinition,
  ReportConsumer,
  ReportDefinition,
  ReportingAlignment,
  ReportingBoundarySet,
  ReportingConfidence,
  ReportingDomainCategory,
  ReportingLayerModel,
  ReportingMaturityNotes,
  ReportingRisk,
  ReportPermission,
  ReportSection,
  ReportVisualization,
  WarehouseModelNote,
} from "./types.js";

export const supportedReportingCategories = [
  "executive_dashboard",
  "sales_reporting",
  "procurement_reporting",
  "inventory_reporting",
  "maintenance_work_order_reporting",
  "incident_support_reporting",
  "finance_closing_reporting",
  "access_security_reporting",
  "process_performance_reporting",
  "generic",
] as const satisfies readonly ReportingDomainCategory[];

export const reportingBoundaries: ReportingBoundarySet = {
  advisoryOnly: true,
  sourceOnly: true,
  noProviderCalls: true,
  noNetwork: true,
  noFilesystemReads: true,
  noFilesystemWrites: true,
  noCommandExecution: true,
  noRuntimeExecution: true,
  noWorkflowExecution: true,
  noAutomationExecution: true,
  noReportExecution: true,
  noDashboardExecution: true,
  noEtlExecution: true,
  noBiToolApiCalls: true,
  noSqlExecution: true,
  noStoreMutation: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noScaffolding: true,
  noDbSchemas: true,
  noGeneratedDashboards: true,
  noGeneratedSqlFiles: true,
  noGeneratedEtlJobs: true,
  noGeneratedSystems: true,
  noProductionReadinessClaims: true,
  noComplianceGuarantees: true,
  noExactFinancialClaimsWithoutAssumptions: true,
};

interface ReportingTemplateConfig {
  category: ReportingDomainCategory;
  name: string;
  purpose: string;
  focus: string;
  primaryConsumer: string;
  secondaryConsumer: string;
  kpiNames: [string, string];
  metricNames: [string, string];
  dimensions: [string, string];
  measures: [string, string];
  risk: string;
  confidence?: ReportingConfidence;
}

const idPart = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const kpi = (
  prefix: string,
  index: number,
  name: string,
  metricIds: string[],
  focus: string,
): KpiDefinition => ({
  kpiId: `${prefix}:kpi:${index}`,
  name,
  purpose: `Review ${focus} using bounded stakeholder-approved definitions.`,
  metricIds,
  calculationNotes: [
    "Calculation method must be reviewed with business owners before use.",
    "Values are not asserted by this source model.",
  ],
  assumptions: [
    "Source data availability and ownership remain review assumptions.",
    "KPI thresholds are intentionally omitted until stakeholders approve them.",
  ],
  riskNotes: [
    "Different teams may define the KPI differently without a shared glossary.",
  ],
  advisoryOnly: true,
});

const metric = (
  prefix: string,
  index: number,
  name: string,
  dimensionIds: string[],
  measureIds: string[],
): MetricDefinition => ({
  metricId: `${prefix}:metric:${index}`,
  name,
  purpose: "Provide a reviewable measurement idea for reporting scope.",
  calculationNotes: [
    "Metric formula is a planning note and must be confirmed before implementation.",
  ],
  assumptions: [
    "Exact business values are not produced by this model.",
    "Data owners must confirm source definitions and refresh expectations.",
  ],
  dimensionIds,
  measureIds,
  riskNotes: ["Metric drift can occur if source definitions are not governed."],
  advisoryOnly: true,
});

const dimension = (prefix: string, index: number, name: string): AnalyticalDimension => ({
  dimensionId: `${prefix}:dimension:${index}`,
  name,
  description: "Advisory analytical grouping metadata for later report design.",
  metadataOnly: true,
});

const measure = (prefix: string, index: number, name: string): AnalyticalMeasure => ({
  measureId: `${prefix}:measure:${index}`,
  name,
  description: "Advisory measure metadata for later report design.",
  aggregationGuidance: "Aggregation approach is assumption-based and requires review.",
  assumptions: ["No warehouse column or formula is created by this metadata."],
  metadataOnly: true,
});

const dataset = (
  prefix: string,
  dimensionIds: string[],
  measureIds: string[],
  focus: string,
): AnalyticalDataset => ({
  datasetId: `${prefix}:dataset:core`,
  name: "Core reporting dataset concept",
  purpose: `Describe candidate ${focus} data needed for reporting review.`,
  dimensionIds,
  measureIds,
  sourceNotes: [
    "Source ownership, lineage, and refresh method must be reviewed separately.",
    "This dataset is metadata only and does not define storage.",
  ],
  metadataOnly: true,
});

const section = (
  prefix: string,
  kpiIds: string[],
  metricIds: string[],
  visualizationIds: string[],
): ReportSection => ({
  sectionId: `${prefix}:section:summary`,
  name: "Summary section",
  description: "Review-ready section metadata for the most important reporting questions.",
  kpiIds,
  metricIds,
  visualizationIds,
});

const visualization = (
  prefix: string,
  kpiIds: string[],
  metricIds: string[],
  dimensionIds: string[],
): ReportVisualization => ({
  visualizationId: `${prefix}:visualization:summary`,
  name: "Summary visualization concept",
  description: "Describes a possible visual presentation without generating a dashboard.",
  visualizationType: "summary",
  kpiIds,
  metricIds,
  dimensionIds,
  advisoryOnly: true,
});

const dashboard = (
  prefix: string,
  sectionIds: string[],
  visualizationIds: string[],
  consumerIds: string[],
  permissionIds: string[],
): DashboardDefinition => ({
  dashboardId: `${prefix}:dashboard:overview`,
  name: "Overview dashboard metadata",
  purpose: "Describe dashboard scope for review without creating a dashboard artifact.",
  sectionIds,
  visualizationIds,
  consumerIds,
  permissionIds,
  metadataOnly: true,
  advisoryOnly: true,
});

const report = (
  prefix: string,
  sectionIds: string[],
  consumerIds: string[],
  permissionIds: string[],
): ReportDefinition => ({
  reportId: `${prefix}:report:review`,
  name: "Review report metadata",
  purpose: "Describe report contents for stakeholder review only.",
  sectionIds,
  consumerIds,
  permissionIds,
  metadataOnly: true,
  advisoryOnly: true,
});

const consumer = (
  prefix: string,
  index: number,
  name: string,
  stakeholderType: string,
): ReportConsumer => ({
  consumerId: `${prefix}:consumer:${index}`,
  name,
  stakeholderType,
  purpose: "Review reporting needs and decision context.",
});

const permission = (
  prefix: string,
  index: number,
  roleOrAudience: string,
): ReportPermission => ({
  permissionId: `${prefix}:permission:${index}`,
  name: `${roleOrAudience} report visibility metadata`,
  roleOrAudience,
  accessSummary: "Access intent is advisory and must be enforced by a later approved system.",
  advisoryOnly: true,
  noAccessEnforcement: true,
});

const freshness = (prefix: string): DataFreshnessAssumption => ({
  freshnessId: `${prefix}:freshness:review`,
  name: "Freshness review assumption",
  assumption: "Expected refresh timing must be confirmed with process and data owners.",
  reviewNotes: [
    "MVP may use manual or delayed source extracts.",
    "Enterprise maturity may require governed freshness monitoring.",
  ],
  assumptionBased: true,
});

const qualityCheck = (prefix: string, focus: string): DataQualityCheck => ({
  checkId: `${prefix}:quality:completeness`,
  name: "Completeness review",
  purpose: `Review whether ${focus} data is complete enough for stakeholder decisions.`,
  safeCheckSummary: "Check definition is advisory and does not inspect data.",
  severity: "medium",
  advisoryOnly: true,
});

const etlNote = (prefix: string): EtlPlanNote => ({
  etlNoteId: `${prefix}:etl:advisory`,
  name: "ETL/ELT planning note",
  safeSummary: "Movement and transformation approach remains future planning metadata only.",
  advisoryOnly: true,
  notExecutable: true,
});

const warehouseNote = (prefix: string): WarehouseModelNote => ({
  warehouseNoteId: `${prefix}:warehouse:advisory`,
  name: "Warehouse/datamart planning note",
  safeSummary: "Analytical storage shape is a review note and not a schema.",
  advisoryOnly: true,
  notSchema: true,
});

const risk = (prefix: string, title: string): ReportingRisk => ({
  riskId: `${prefix}:risk:definition-drift`,
  title,
  safeSummary: "Reporting value can be misleading if owners disagree on definitions.",
  severity: "medium",
  mitigation: "Require glossary and owner review before implementation.",
});

const alignment = (
  prefix: string,
  target: ReportingAlignment["target"],
  safeSummary: string,
  futureOnly = false,
): ReportingAlignment => ({
  alignmentId: `${prefix}:alignment:${target}`,
  target,
  safeSummary,
  advisoryOnly: true,
  ...(futureOnly ? { futureOnly: true } : {}),
});

const maturity = (focus: string): ReportingMaturityNotes => ({
  mvp: [`Start with a small ${focus} reporting slice and explicit assumptions.`],
  enterprise: [
    "Add governed definitions, owner signoff, freshness monitoring, and access review.",
  ],
  deferred: [
    "External BI assets, tool integration, transformation jobs, analytical storage design, and runtime telemetry are deferred.",
  ],
});

const model = (config: ReportingTemplateConfig): ReportingLayerModel => {
  const prefix = idPart(config.category);
  const dimensionItems = config.dimensions.map((name, index) =>
    dimension(prefix, index + 1, name),
  );
  const measureItems = config.measures.map((name, index) => measure(prefix, index + 1, name));
  const dimensionIds = dimensionItems.map((item) => item.dimensionId);
  const measureIds = measureItems.map((item) => item.measureId);
  const metricItems = config.metricNames.map((name, index) =>
    metric(prefix, index + 1, name, dimensionIds, measureIds),
  );
  const metricIds = metricItems.map((item) => item.metricId);
  const kpiItems = config.kpiNames.map((name, index) =>
    kpi(prefix, index + 1, name, metricIds.slice(index, index + 1), config.focus),
  );
  const kpiIds = kpiItems.map((item) => item.kpiId);
  const visual = visualization(prefix, kpiIds, metricIds, dimensionIds);
  const reportSection = section(prefix, kpiIds, metricIds, [visual.visualizationId]);
  const consumers = [
    consumer(prefix, 1, config.primaryConsumer, "primary stakeholder"),
    consumer(prefix, 2, config.secondaryConsumer, "review stakeholder"),
  ];
  const permissions = consumers.map((item, index) =>
    permission(prefix, index + 1, item.name),
  );
  const sectionIds = [reportSection.sectionId];
  const consumerIds = consumers.map((item) => item.consumerId);
  const permissionIds = permissions.map((item) => item.permissionId);

  return {
    reportingId: `reporting:${prefix}`,
    schemaVersion: "1.0",
    category: config.category,
    name: config.name,
    purpose: config.purpose,
    processIds: [],
    moduleIds: [],
    kpis: kpiItems,
    metrics: metricItems,
    dashboards: [dashboard(prefix, sectionIds, [visual.visualizationId], consumerIds, permissionIds)],
    reports: [report(prefix, sectionIds, consumerIds, permissionIds)],
    sections: [reportSection],
    visualizations: [visual],
    datasets: [dataset(prefix, dimensionIds, measureIds, config.focus)],
    dimensions: dimensionItems,
    measures: measureItems,
    freshnessAssumptions: [freshness(prefix)],
    dataQualityChecks: [qualityCheck(prefix, config.focus)],
    etlNotes: [etlNote(prefix)],
    warehouseNotes: [warehouseNote(prefix)],
    consumers,
    permissions,
    risks: [risk(prefix, config.risk)],
    processAlignment: [
      alignment(prefix, "process", "Process checkpoints and handoffs can inform reporting review."),
    ],
    moduleAlignment: [
      alignment(prefix, "module_blueprint", "Module reports and permissions can be compared with this model."),
    ],
    planningAlignment: [
      alignment(prefix, "planning", "Planning can treat reporting maturity as scope and risk metadata."),
    ],
    futureBiToolAlignment: [
      alignment(
        prefix,
        "future_bi_tool",
        "Power BI, Metabase, or Superset strategy remains future-only metadata.",
        true,
      ),
    ],
    maturityNotes: maturity(config.focus),
    assumptions: [
      "Reporting definitions require stakeholder review before implementation.",
      "No exact business or financial value is produced by this model.",
    ],
    exclusions: [
      "No dashboard artifact, SQL file, ETL job, BI tool payload, schema, or scaffold is created.",
    ],
    confidence: config.confidence ?? "medium",
    advisoryOnly: true,
    boundaries: reportingBoundaries,
  };
};

export const reportingTemplates: readonly ReportingLayerModel[] = [
  model({
    category: "executive_dashboard",
    name: "Executive dashboard reporting model",
    purpose: "Describe leadership-facing reporting metadata for review.",
    focus: "executive summary",
    primaryConsumer: "Executive sponsor",
    secondaryConsumer: "Operations lead",
    kpiNames: ["Business health indicator", "Priority risk indicator"],
    metricNames: ["Summary trend metric", "Decision checkpoint metric"],
    dimensions: ["Business area", "Reporting period"],
    measures: ["Reviewed value", "Risk count"],
    risk: "Leadership dashboard definition drift",
  }),
  model({
    category: "sales_reporting",
    name: "Sales reporting model",
    purpose: "Describe sales pipeline, order, and performance reporting metadata.",
    focus: "sales",
    primaryConsumer: "Sales manager",
    secondaryConsumer: "Finance reviewer",
    kpiNames: ["Pipeline review indicator", "Order progress indicator"],
    metricNames: ["Opportunity movement metric", "Order review metric"],
    dimensions: ["Customer segment", "Sales stage"],
    measures: ["Pipeline amount assumption", "Order count"],
    risk: "Sales metric interpretation risk",
  }),
  model({
    category: "procurement_reporting",
    name: "Procurement reporting model",
    purpose: "Describe supplier, purchase, receiving, and variance reporting metadata.",
    focus: "procurement",
    primaryConsumer: "Procurement lead",
    secondaryConsumer: "Receiving reviewer",
    kpiNames: ["Supplier review indicator", "Purchase variance indicator"],
    metricNames: ["Purchase request metric", "Receiving variance metric"],
    dimensions: ["Supplier", "Purchase category"],
    measures: ["Request count", "Variance count"],
    risk: "Supplier and receiving definitions may not match.",
  }),
  model({
    category: "inventory_reporting",
    name: "Inventory reporting model",
    purpose: "Describe stock, movement, reconciliation, and adjustment reporting metadata.",
    focus: "inventory",
    primaryConsumer: "Warehouse lead",
    secondaryConsumer: "Audit reviewer",
    kpiNames: ["Stock review indicator", "Reconciliation indicator"],
    metricNames: ["Movement metric", "Adjustment review metric"],
    dimensions: ["Warehouse", "Item group"],
    measures: ["Movement count", "Adjustment count"],
    risk: "Inventory reporting can mislead if movement timing is unclear.",
  }),
  model({
    category: "maintenance_work_order_reporting",
    name: "Maintenance work-order reporting model",
    purpose: "Describe backlog, escalation, and service expectation reporting metadata.",
    focus: "maintenance work-order",
    primaryConsumer: "Maintenance manager",
    secondaryConsumer: "Operations reviewer",
    kpiNames: ["Backlog review indicator", "Escalation review indicator"],
    metricNames: ["Open work-order metric", "Escalation metric"],
    dimensions: ["Asset group", "Work-order status"],
    measures: ["Open item count", "Escalation count"],
    risk: "SLA expectations can be mistaken for guarantees without review.",
  }),
  model({
    category: "incident_support_reporting",
    name: "Incident and support reporting model",
    purpose: "Describe severity, response, resolution, handoff, and closure metadata.",
    focus: "incident support",
    primaryConsumer: "Support lead",
    secondaryConsumer: "Service owner",
    kpiNames: ["Severity review indicator", "Resolution review indicator"],
    metricNames: ["Response metric", "Closure metric"],
    dimensions: ["Severity", "Support queue"],
    measures: ["Incident count", "Closure count"],
    risk: "Support metrics can hide handoff gaps without queue context.",
  }),
  model({
    category: "finance_closing_reporting",
    name: "Finance and closing reporting model",
    purpose: "Describe cut-off, reconciliation, checkpoint, signoff, and exception metadata.",
    focus: "finance closing",
    primaryConsumer: "Finance lead",
    secondaryConsumer: "Audit reviewer",
    kpiNames: ["Closing checkpoint indicator", "Reconciliation review indicator"],
    metricNames: ["Exception metric", "Signoff readiness metric"],
    dimensions: ["Closing area", "Review checkpoint"],
    measures: ["Exception count", "Pending review count"],
    risk: "Financial reporting requires explicit assumptions and owner review.",
  }),
  model({
    category: "access_security_reporting",
    name: "Access and security reporting model",
    purpose: "Describe access review, request volume, revoke path, and audit metadata.",
    focus: "access security",
    primaryConsumer: "Security reviewer",
    secondaryConsumer: "System owner",
    kpiNames: ["Access review indicator", "Revocation review indicator"],
    metricNames: ["Access request metric", "Review exception metric"],
    dimensions: ["Role group", "Access status"],
    measures: ["Request count", "Exception count"],
    risk: "Access reports must not be confused with access enforcement.",
  }),
  model({
    category: "process_performance_reporting",
    name: "Process performance reporting model",
    purpose: "Describe cycle, bottleneck, exception, handoff, and checkpoint reporting metadata.",
    focus: "process performance",
    primaryConsumer: "Process owner",
    secondaryConsumer: "Project manager",
    kpiNames: ["Cycle review indicator", "Bottleneck review indicator"],
    metricNames: ["Transition metric", "Exception metric"],
    dimensions: ["Process state", "Responsible role"],
    measures: ["Transition count", "Exception count"],
    risk: "Process reporting can imply false precision without reviewed event definitions.",
  }),
  model({
    category: "generic",
    name: "Generic reporting model",
    purpose: "Describe a safe starter reporting model for early review.",
    focus: "generic reporting",
    primaryConsumer: "Business reviewer",
    secondaryConsumer: "Technical reviewer",
    kpiNames: ["Review priority indicator", "Data readiness indicator"],
    metricNames: ["Candidate metric", "Readiness metric"],
    dimensions: ["Business area", "Review status"],
    measures: ["Item count", "Readiness count"],
    risk: "Generic reporting needs domain review before use.",
    confidence: "low",
  }),
];

const cloneModel = (template: ReportingLayerModel): ReportingLayerModel =>
  JSON.parse(JSON.stringify(template)) as ReportingLayerModel;

export const listReportingTemplates = (): ReportingLayerModel[] =>
  reportingTemplates.map(cloneModel);
