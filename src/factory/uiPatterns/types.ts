export type UiPatternSchemaVersion = "1.0";

export type UiPatternId = string;

export type UiPatternCategory =
  | "admin_dashboard"
  | "advanced_crud"
  | "master_detail"
  | "data_table_filters"
  | "workflow_queue"
  | "approval_inbox"
  | "kanban_board"
  | "calendar_scheduling"
  | "pos_ui"
  | "permission_management"
  | "document_management"
  | "reporting_dashboard_ui"
  | "audit_traceability_view"
  | "transaction_review_view"
  | "process_state_view"
  | "generic";

export type UiPatternConfidence = "low" | "medium" | "high";

export type UiPatternValidationStatus = "pass" | "warn" | "fail";

export type UiPatternBoundarySet = {
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
  noUiRendering: true;
  noGeneratedComponents: true;
  noGeneratedScreens: true;
  noGeneratedDashboards: true;
  noGeneratedRoutes: true;
  noJsxTsxCssHtmlSnippets: true;
  noDesignSystemImplementation: true;
  noFrontendScaffolding: true;
  noStoreMutation: true;
  noActionDispatch: true;
  noProposalCreation: true;
  noApprovalExecution: true;
  noDbSchemas: true;
  noSql: true;
  noGeneratedSystems: true;
  noProductionReadinessClaims: true;
  noAccessibilityComplianceGuarantees: true;
};

export type UiScreenPattern = {
  screenId: string;
  name: string;
  purpose: string;
  roleNotes: string[];
  stateNoteIds: string[];
  metadataOnly: true;
};

export type UiLayoutRegion = {
  regionId: string;
  name: string;
  purpose: string;
  priority: "primary" | "secondary" | "supporting";
  responsiveNoteIds: string[];
  metadataOnly: true;
};

export type UiNavigationPattern = {
  navigationId: string;
  name: string;
  safeSummary: string;
  destinations: string[];
  metadataOnly: true;
};

export type UiInteractionPattern = {
  interactionId: string;
  name: string;
  safeSummary: string;
  stateNoteIds: string[];
  advisoryOnly: true;
};

export type UiDataDisplayPattern = {
  displayId: string;
  name: string;
  safeSummary: string;
  density: "compact" | "balanced" | "spacious";
  accessibilityNoteIds: string[];
  metadataOnly: true;
};

export type UiFormPattern = {
  formId: string;
  name: string;
  purpose: string;
  validationNotes: string[];
  stateNoteIds: string[];
  metadataOnly: true;
};

export type UiTablePattern = {
  tableId: string;
  name: string;
  purpose: string;
  columnNotes: string[];
  stateNoteIds: string[];
  metadataOnly: true;
};

export type UiFilterPattern = {
  filterId: string;
  name: string;
  purpose: string;
  filterTypes: string[];
  advisoryOnly: true;
};

export type UiWorkflowPattern = {
  workflowUiId: string;
  name: string;
  safeSummary: string;
  processStateIds: string[];
  noWorkflowExecution: true;
};

export type UiPermissionPattern = {
  permissionUiId: string;
  name: string;
  safeSummary: string;
  roleNotes: string[];
  noPermissionEnforcement: true;
};

export type UiDocumentPattern = {
  documentUiId: string;
  name: string;
  safeSummary: string;
  metadataNotes: string[];
  noStorageBehavior: true;
};

export type UiReportingPattern = {
  reportingUiId: string;
  name: string;
  safeSummary: string;
  visualizationNotes: string[];
  noDashboardGeneration: true;
};

export type UiAccessibilityNote = {
  accessibilityNoteId: string;
  safeRecommendation: string;
  assumption: string;
  notComplianceGuarantee: true;
};

export type UiResponsiveNote = {
  responsiveNoteId: string;
  safeRecommendation: string;
  assumption: string;
  notRenderedBehavior: true;
};

export type UiStateNote = {
  stateNoteId: string;
  state: "empty" | "loading" | "error" | "readonly" | "editing" | "review";
  safeRecommendation: string;
  advisoryOnly: true;
};

export type UiRisk = {
  riskId: string;
  title: string;
  safeSummary: string;
  severity: "low" | "medium" | "high";
  mitigation: string;
};

export type UiAlignment = {
  alignmentId: string;
  target:
    | "module_blueprint"
    | "process"
    | "reporting"
    | "transaction"
    | "planning"
    | "framework_future";
  safeSummary: string;
  advisoryOnly: true;
  metadataOnly: true;
  futureOnly?: true;
};

export type UiMaturityNotes = {
  mvp: string[];
  enterprise: string[];
  deferred: string[];
};

export type UiPatternModel = {
  uiPatternId: UiPatternId;
  schemaVersion: UiPatternSchemaVersion;
  category: UiPatternCategory;
  name: string;
  purpose: string;
  familyId?: string;
  moduleIds: string[];
  processIds: string[];
  reportingIds: string[];
  transactionIds: string[];
  planningIds: string[];
  frameworkIds: string[];
  screens: UiScreenPattern[];
  layoutRegions: UiLayoutRegion[];
  navigationPatterns: UiNavigationPattern[];
  interactionPatterns: UiInteractionPattern[];
  dataDisplayPatterns: UiDataDisplayPattern[];
  forms: UiFormPattern[];
  tables: UiTablePattern[];
  filters: UiFilterPattern[];
  workflowPatterns: UiWorkflowPattern[];
  permissionPatterns: UiPermissionPattern[];
  documentPatterns: UiDocumentPattern[];
  reportingPatterns: UiReportingPattern[];
  accessibilityNotes: UiAccessibilityNote[];
  responsiveNotes: UiResponsiveNote[];
  stateNotes: UiStateNote[];
  risks: UiRisk[];
  moduleAlignment: UiAlignment[];
  processAlignment: UiAlignment[];
  reportingAlignment: UiAlignment[];
  transactionAlignment: UiAlignment[];
  planningAlignment: UiAlignment[];
  frameworkAlignment: UiAlignment[];
  maturityNotes: UiMaturityNotes;
  assumptions: string[];
  exclusions: string[];
  confidence: UiPatternConfidence;
  advisoryOnly: true;
  boundaries: UiPatternBoundarySet;
};

export type UiPatternInput = {
  category: UiPatternCategory | string;
  familyId?: string;
  moduleIds?: string[];
  processIds?: string[];
  reportingIds?: string[];
  transactionIds?: string[];
  planningIds?: string[];
  frameworkIds?: string[];
  uiPatternName?: string;
  assumptions?: string[];
  exclusions?: string[];
  confidence?: UiPatternConfidence;
};

export type UiPatternResultStatus =
  | "model_built"
  | "template_found"
  | "category_not_found"
  | "invalid";

export type UiPatternValidationFinding = {
  id: string;
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  path?: string;
  uiPatternId?: string;
  category?: UiPatternCategory;
  metadata?: Record<string, string | number | boolean>;
};

export type UiPatternResult = {
  ok: boolean;
  status: UiPatternResultStatus;
  model?: UiPatternModel;
  models?: UiPatternModel[];
  warnings: UiPatternValidationFinding[];
  errors: UiPatternValidationFinding[];
  advisoryOnly: true;
  boundaries: UiPatternBoundarySet;
};

export type UiPatternValidationResult = {
  validationId: string;
  createdAt: string;
  schemaVersion: UiPatternSchemaVersion;
  valid: boolean;
  status: UiPatternValidationStatus;
  modelCount: number;
  warnings: UiPatternValidationFinding[];
  errors: UiPatternValidationFinding[];
  advisoryOnly: true;
  boundaries: UiPatternBoundarySet;
};
