export type ReportingSchemaVersion = "1.0";

export type ReportingDomainId = string;

export type ReportingDomainCategory =
  | "executive_dashboard"
  | "sales_reporting"
  | "procurement_reporting"
  | "inventory_reporting"
  | "maintenance_work_order_reporting"
  | "incident_support_reporting"
  | "finance_closing_reporting"
  | "access_security_reporting"
  | "process_performance_reporting"
  | "generic";

export type ReportingConfidence = "low" | "medium" | "high";

export interface ReportingBoundarySet {
  advisoryOnly: true;
  sourceOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemReads: true;
  noFilesystemWrites: true;
  noCommandExecution: true;
  noRuntimeExecution: true;
  noWorkflowExecution: true;
  noAutomationExecution: true;
  noReportExecution: true;
  noDashboardExecution: true;
  noEtlExecution: true;
  noBiToolApiCalls: true;
  noSqlExecution: true;
  noStoreMutation: true;
  noActionDispatch: true;
  noProposalCreation: true;
  noScaffolding: true;
  noDbSchemas: true;
  noGeneratedDashboards: true;
  noGeneratedSqlFiles: true;
  noGeneratedEtlJobs: true;
  noGeneratedSystems: true;
  noProductionReadinessClaims: true;
  noComplianceGuarantees: true;
  noExactFinancialClaimsWithoutAssumptions: true;
}

export interface KpiDefinition {
  kpiId: string;
  name: string;
  purpose: string;
  metricIds: string[];
  calculationNotes: string[];
  assumptions: string[];
  riskNotes: string[];
  advisoryOnly: true;
}

export interface MetricDefinition {
  metricId: string;
  name: string;
  purpose: string;
  calculationNotes: string[];
  assumptions: string[];
  dimensionIds: string[];
  measureIds: string[];
  riskNotes: string[];
  advisoryOnly: true;
}

export interface DashboardDefinition {
  dashboardId: string;
  name: string;
  purpose: string;
  sectionIds: string[];
  visualizationIds: string[];
  consumerIds: string[];
  permissionIds: string[];
  metadataOnly: true;
  advisoryOnly: true;
}

export interface ReportDefinition {
  reportId: string;
  name: string;
  purpose: string;
  sectionIds: string[];
  consumerIds: string[];
  permissionIds: string[];
  metadataOnly: true;
  advisoryOnly: true;
}

export interface ReportSection {
  sectionId: string;
  name: string;
  description: string;
  kpiIds: string[];
  metricIds: string[];
  visualizationIds: string[];
}

export interface ReportVisualization {
  visualizationId: string;
  name: string;
  description: string;
  visualizationType:
    | "scorecard"
    | "trend"
    | "table"
    | "bar"
    | "line"
    | "matrix"
    | "funnel"
    | "heatmap"
    | "summary";
  kpiIds: string[];
  metricIds: string[];
  dimensionIds: string[];
  advisoryOnly: true;
}

export interface AnalyticalDimension {
  dimensionId: string;
  name: string;
  description: string;
  metadataOnly: true;
}

export interface AnalyticalMeasure {
  measureId: string;
  name: string;
  description: string;
  aggregationGuidance: string;
  assumptions: string[];
  metadataOnly: true;
}

export interface AnalyticalDataset {
  datasetId: string;
  name: string;
  purpose: string;
  dimensionIds: string[];
  measureIds: string[];
  sourceNotes: string[];
  metadataOnly: true;
}

export interface DataFreshnessAssumption {
  freshnessId: string;
  name: string;
  assumption: string;
  reviewNotes: string[];
  assumptionBased: true;
}

export interface DataQualityCheck {
  checkId: string;
  name: string;
  purpose: string;
  safeCheckSummary: string;
  severity: "low" | "medium" | "high";
  advisoryOnly: true;
}

export interface EtlPlanNote {
  etlNoteId: string;
  name: string;
  safeSummary: string;
  advisoryOnly: true;
  notExecutable: true;
}

export interface WarehouseModelNote {
  warehouseNoteId: string;
  name: string;
  safeSummary: string;
  advisoryOnly: true;
  notSchema: true;
}

export interface ReportPermission {
  permissionId: string;
  name: string;
  roleOrAudience: string;
  accessSummary: string;
  advisoryOnly: true;
  noAccessEnforcement: true;
}

export interface ReportConsumer {
  consumerId: string;
  name: string;
  stakeholderType: string;
  purpose: string;
}

export interface ReportingRisk {
  riskId: string;
  title: string;
  safeSummary: string;
  severity: "low" | "medium" | "high";
  mitigation: string;
}

export interface ReportingAlignment {
  alignmentId: string;
  target: "process" | "module_blueprint" | "planning" | "future_bi_tool";
  safeSummary: string;
  advisoryOnly: true;
  futureOnly?: true;
}

export interface ReportingMaturityNotes {
  mvp: string[];
  enterprise: string[];
  deferred: string[];
}

export interface ReportingLayerModel {
  reportingId: ReportingDomainId;
  schemaVersion: ReportingSchemaVersion;
  category: ReportingDomainCategory;
  name: string;
  purpose: string;
  familyId?: string;
  processIds: string[];
  moduleIds: string[];
  kpis: KpiDefinition[];
  metrics: MetricDefinition[];
  dashboards: DashboardDefinition[];
  reports: ReportDefinition[];
  sections: ReportSection[];
  visualizations: ReportVisualization[];
  datasets: AnalyticalDataset[];
  dimensions: AnalyticalDimension[];
  measures: AnalyticalMeasure[];
  freshnessAssumptions: DataFreshnessAssumption[];
  dataQualityChecks: DataQualityCheck[];
  etlNotes: EtlPlanNote[];
  warehouseNotes: WarehouseModelNote[];
  consumers: ReportConsumer[];
  permissions: ReportPermission[];
  risks: ReportingRisk[];
  processAlignment: ReportingAlignment[];
  moduleAlignment: ReportingAlignment[];
  planningAlignment: ReportingAlignment[];
  futureBiToolAlignment: ReportingAlignment[];
  maturityNotes: ReportingMaturityNotes;
  assumptions: string[];
  exclusions: string[];
  confidence: ReportingConfidence;
  advisoryOnly: true;
  boundaries: ReportingBoundarySet;
}

export interface ReportingLayerInput {
  category: ReportingDomainCategory | string;
  familyId?: string;
  processIds?: string[];
  moduleIds?: string[];
  reportingName?: string;
  assumptions?: string[];
  exclusions?: string[];
  confidence?: ReportingConfidence;
}

export interface ReportingLayerResult {
  ok: boolean;
  status: "model_built" | "template_found" | "category_not_found" | "invalid";
  model?: ReportingLayerModel;
  models?: ReportingLayerModel[];
  warnings: ReportingValidationFinding[];
  errors: ReportingValidationFinding[];
  advisoryOnly: true;
  boundaries: ReportingBoundarySet;
}

export interface ReportingValidationFinding {
  id: string;
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  path?: string;
  category?: ReportingDomainCategory;
  reportingId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ReportingValidationResult {
  validationId: string;
  createdAt: string;
  schemaVersion: ReportingSchemaVersion;
  valid: boolean;
  status: "pass" | "warn" | "fail";
  modelCount: number;
  warnings: ReportingValidationFinding[];
  errors: ReportingValidationFinding[];
  advisoryOnly: true;
  boundaries: ReportingBoundarySet;
}
