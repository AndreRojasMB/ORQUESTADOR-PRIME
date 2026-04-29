import type {
  UiAccessibilityNote,
  UiAlignment,
  UiDataDisplayPattern,
  UiDocumentPattern,
  UiFilterPattern,
  UiFormPattern,
  UiInteractionPattern,
  UiLayoutRegion,
  UiMaturityNotes,
  UiNavigationPattern,
  UiPatternBoundarySet,
  UiPatternCategory,
  UiPatternConfidence,
  UiPatternModel,
  UiPermissionPattern,
  UiReportingPattern,
  UiResponsiveNote,
  UiRisk,
  UiScreenPattern,
  UiStateNote,
  UiTablePattern,
  UiWorkflowPattern,
} from "./types.js";

export const supportedUiPatternCategories = [
  "admin_dashboard",
  "advanced_crud",
  "master_detail",
  "data_table_filters",
  "workflow_queue",
  "approval_inbox",
  "kanban_board",
  "calendar_scheduling",
  "pos_ui",
  "permission_management",
  "document_management",
  "reporting_dashboard_ui",
  "audit_traceability_view",
  "transaction_review_view",
  "process_state_view",
  "generic",
] as const satisfies readonly UiPatternCategory[];

export const uiPatternBoundaries: UiPatternBoundarySet = {
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
  noUiRendering: true,
  noGeneratedComponents: true,
  noGeneratedScreens: true,
  noGeneratedDashboards: true,
  noGeneratedRoutes: true,
  noJsxTsxCssHtmlSnippets: true,
  noDesignSystemImplementation: true,
  noFrontendScaffolding: true,
  noStoreMutation: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noApprovalExecution: true,
  noDbSchemas: true,
  noSql: true,
  noGeneratedSystems: true,
  noProductionReadinessClaims: true,
  noAccessibilityComplianceGuarantees: true,
};

type UiTemplateConfig = {
  category: UiPatternCategory;
  name: string;
  purpose: string;
  focus: string;
  primaryScreen: string;
  secondaryScreen: string;
  tableFocus: string;
  formFocus: string;
  workflowFocus: string;
  permissionFocus: string;
  documentFocus: string;
  reportingFocus: string;
  risk: string;
  confidence?: UiPatternConfidence;
};

const idPart = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const screen = (
  prefix: string,
  key: string,
  name: string,
  stateNoteIds: string[],
): UiScreenPattern => ({
  screenId: `${prefix}:screen:${key}`,
  name,
  purpose: `Review ${name.toLowerCase()} structure as enterprise UI metadata.`,
  roleNotes: [
    "Role visibility remains advisory until future access design is reviewed.",
    "Screen notes describe intended information hierarchy only.",
  ],
  stateNoteIds,
  metadataOnly: true,
});

const layoutRegion = (
  prefix: string,
  key: string,
  name: string,
  priority: UiLayoutRegion["priority"],
  responsiveNoteIds: string[],
): UiLayoutRegion => ({
  regionId: `${prefix}:region:${key}`,
  name,
  purpose: `Describe ${name.toLowerCase()} placement and priority for review.`,
  priority,
  responsiveNoteIds,
  metadataOnly: true,
});

const navigation = (prefix: string, focus: string): UiNavigationPattern => ({
  navigationId: `${prefix}:navigation:primary`,
  name: `${focus} navigation`,
  safeSummary: "Describes reviewable navigation paths and drill-down expectations.",
  destinations: ["overview", "work-list", "detail-review"],
  metadataOnly: true,
});

const interaction = (
  prefix: string,
  focus: string,
  stateNoteIds: string[],
): UiInteractionPattern => ({
  interactionId: `${prefix}:interaction:review`,
  name: `${focus} interaction review`,
  safeSummary: "Captures selection, review, and feedback behavior as descriptive metadata.",
  stateNoteIds,
  advisoryOnly: true,
});

const dataDisplay = (
  prefix: string,
  focus: string,
  accessibilityNoteIds: string[],
): UiDataDisplayPattern => ({
  displayId: `${prefix}:display:summary`,
  name: `${focus} display`,
  safeSummary: "Describes summary, list, and detail information without producing a visual asset.",
  density: "balanced",
  accessibilityNoteIds,
  metadataOnly: true,
});

const form = (
  prefix: string,
  focus: string,
  stateNoteIds: string[],
): UiFormPattern => ({
  formId: `${prefix}:form:review`,
  name: `${focus} review form`,
  purpose: "Describe form grouping, validation messaging, and review flow as metadata.",
  validationNotes: [
    "Use visible labels and concise validation messages in a future design phase.",
    "Separate required information from optional enrichment fields.",
  ],
  stateNoteIds,
  metadataOnly: true,
});

const table = (
  prefix: string,
  focus: string,
  stateNoteIds: string[],
): UiTablePattern => ({
  tableId: `${prefix}:table:work-list`,
  name: `${focus} work list`,
  purpose: "Describe table columns, density, sorting, and review priorities as metadata.",
  columnNotes: [
    "Prioritize identifier, status, owner, age, and next review fields.",
    "Keep destructive or irreversible actions outside this metadata layer.",
  ],
  stateNoteIds,
  metadataOnly: true,
});

const filter = (prefix: string, focus: string): UiFilterPattern => ({
  filterId: `${prefix}:filter:review`,
  name: `${focus} filters`,
  purpose: "Describe search, sort, saved filter, and pagination expectations.",
  filterTypes: ["status", "owner", "date-range", "priority", "free-text"],
  advisoryOnly: true,
});

const workflow = (prefix: string, focus: string): UiWorkflowPattern => ({
  workflowUiId: `${prefix}:workflow-ui:state-review`,
  name: `${focus} state review`,
  safeSummary: "Shows process state context and ownership as review metadata only.",
  processStateIds: ["intake", "review", "exception", "closed"],
  noWorkflowExecution: true,
});

const permission = (prefix: string, focus: string): UiPermissionPattern => ({
  permissionUiId: `${prefix}:permission-ui:role-view`,
  name: `${focus} role view`,
  safeSummary: "Describes role and access visibility for stakeholder review only.",
  roleNotes: [
    "Permission visibility is descriptive and does not grant, revoke, or enforce access.",
  ],
  noPermissionEnforcement: true,
});

const documentPattern = (prefix: string, focus: string): UiDocumentPattern => ({
  documentUiId: `${prefix}:document-ui:metadata`,
  name: `${focus} document metadata`,
  safeSummary: "Describes folders, tags, retention review, and document status metadata.",
  metadataNotes: [
    "Storage, retention enforcement, and content indexing remain outside this model.",
  ],
  noStorageBehavior: true,
});

const reportingPattern = (prefix: string, focus: string): UiReportingPattern => ({
  reportingUiId: `${prefix}:reporting-ui:placement`,
  name: `${focus} reporting placement`,
  safeSummary: "Describes placement of metrics and charts for review without creating assets.",
  visualizationNotes: [
    "Use clear labels, legends, and accessible color pairing in a future design phase.",
  ],
  noDashboardGeneration: true,
});

const accessibility = (prefix: string): UiAccessibilityNote[] => [
  {
    accessibilityNoteId: `${prefix}:accessibility:focus`,
    safeRecommendation: "Plan visible focus states and keyboard review paths.",
    assumption: "Actual accessibility testing belongs to a later implementation review.",
    notComplianceGuarantee: true,
  },
  {
    accessibilityNoteId: `${prefix}:accessibility:labels`,
    safeRecommendation: "Plan descriptive labels for controls, tables, and status indicators.",
    assumption: "Label content depends on reviewed product copy.",
    notComplianceGuarantee: true,
  },
];

const responsive = (prefix: string): UiResponsiveNote[] => [
  {
    responsiveNoteId: `${prefix}:responsive:small`,
    safeRecommendation: "Plan a single-column small-screen review path with clear primary actions.",
    assumption: "Final breakpoints depend on the future framework and design system.",
    notRenderedBehavior: true,
  },
  {
    responsiveNoteId: `${prefix}:responsive:dense-data`,
    safeRecommendation: "Plan alternate detail disclosure for dense tables on narrow screens.",
    assumption: "Actual behavior must be validated in a later UI implementation phase.",
    notRenderedBehavior: true,
  },
];

const stateNotes = (prefix: string): UiStateNote[] => [
  {
    stateNoteId: `${prefix}:state:empty`,
    state: "empty",
    safeRecommendation: "Explain why no records are visible and suggest a review-safe next step.",
    advisoryOnly: true,
  },
  {
    stateNoteId: `${prefix}:state:loading`,
    state: "loading",
    safeRecommendation: "Reserve stable space for pending information in future UI work.",
    advisoryOnly: true,
  },
  {
    stateNoteId: `${prefix}:state:error`,
    state: "error",
    safeRecommendation: "Describe recoverable errors near the affected region.",
    advisoryOnly: true,
  },
  {
    stateNoteId: `${prefix}:state:review`,
    state: "review",
    safeRecommendation: "Mark review status, owner, and unresolved assumptions clearly.",
    advisoryOnly: true,
  },
];

const risk = (prefix: string, title: string, safeSummary: string): UiRisk => ({
  riskId: `${prefix}:risk:primary`,
  title,
  safeSummary,
  severity: "medium",
  mitigation: "Keep the first pass metadata-only and require product review before UI delivery work.",
});

const alignment = (
  prefix: string,
  target: UiAlignment["target"],
  safeSummary: string,
  futureOnly = false,
): UiAlignment => ({
  alignmentId: `${prefix}:alignment:${target}`,
  target,
  safeSummary,
  advisoryOnly: true,
  metadataOnly: true,
  ...(futureOnly ? { futureOnly: true } : {}),
});

const maturity = (focus: string): UiMaturityNotes => ({
  mvp: [
    `Review a minimal ${focus.toLowerCase()} path with core states, clear ownership, and safe fallbacks.`,
  ],
  enterprise: [
    `Expand ${focus.toLowerCase()} with role-aware views, richer review states, and traceability.`,
  ],
  deferred: [
    "Executable behavior, visual assets, routes, style implementation, and delivered screens stay out of scope.",
  ],
});

const makeTemplate = (config: UiTemplateConfig): UiPatternModel => {
  const prefix = `ui:${idPart(config.category)}`;
  const states = stateNotes(prefix);
  const responsiveNotes = responsive(prefix);
  const accessibilityNotes = accessibility(prefix);
  const stateIds = states.map((item) => item.stateNoteId);
  const responsiveIds = responsiveNotes.map((item) => item.responsiveNoteId);
  const accessibilityIds = accessibilityNotes.map((item) => item.accessibilityNoteId);

  return {
    uiPatternId: prefix,
    schemaVersion: "1.0",
    category: config.category,
    name: config.name,
    purpose: config.purpose,
    moduleIds: [],
    processIds: [],
    reportingIds: [],
    transactionIds: [],
    planningIds: [],
    frameworkIds: [],
    screens: [
      screen(prefix, "overview", config.primaryScreen, stateIds),
      screen(prefix, "detail", config.secondaryScreen, stateIds),
    ],
    layoutRegions: [
      layoutRegion(prefix, "primary", "Primary work area", "primary", responsiveIds),
      layoutRegion(prefix, "support", "Review context panel", "supporting", responsiveIds),
    ],
    navigationPatterns: [navigation(prefix, config.focus)],
    interactionPatterns: [interaction(prefix, config.focus, stateIds)],
    dataDisplayPatterns: [dataDisplay(prefix, config.focus, accessibilityIds)],
    forms: [form(prefix, config.formFocus, stateIds)],
    tables: [table(prefix, config.tableFocus, stateIds)],
    filters: [filter(prefix, config.tableFocus)],
    workflowPatterns: [workflow(prefix, config.workflowFocus)],
    permissionPatterns: [permission(prefix, config.permissionFocus)],
    documentPatterns: [documentPattern(prefix, config.documentFocus)],
    reportingPatterns: [reportingPattern(prefix, config.reportingFocus)],
    accessibilityNotes,
    responsiveNotes,
    stateNotes: states,
    risks: [risk(prefix, `${config.focus} complexity`, config.risk)],
    moduleAlignment: [
      alignment(prefix, "module_blueprint", "Module responsibilities can be reviewed against UI surface needs."),
    ],
    processAlignment: [
      alignment(prefix, "process", "Process states and handoffs can inform visible review states."),
    ],
    reportingAlignment: [
      alignment(prefix, "reporting", "Reporting metadata can inform summary placement and stakeholder views."),
    ],
    transactionAlignment: [
      alignment(prefix, "transaction", "Transactional checkpoints can inform review and traceability surfaces."),
    ],
    planningAlignment: [
      alignment(prefix, "planning", "Planning can compare MVP and enterprise UI maturity against roadmap scope."),
    ],
    frameworkAlignment: [
      alignment(
        prefix,
        "framework_future",
        "Future framework choices can refine layout, navigation, and interaction assumptions.",
        true,
      ),
    ],
    maturityNotes: maturity(config.focus),
    assumptions: [
      "UI pattern metadata needs product, accessibility, and engineering review before implementation.",
      "Framework, design-system, and data-source choices remain future planning inputs.",
    ],
    exclusions: [
      "No visual asset, screen file, route, style rule, access-control behavior, or runtime behavior is created.",
    ],
    confidence: config.confidence ?? "low",
    advisoryOnly: true,
    boundaries: uiPatternBoundaries,
  };
};

const uiPatternTemplateConfigs: UiTemplateConfig[] = [
  {
    category: "admin_dashboard",
    name: "Admin dashboard UI pattern",
    purpose: "Review leadership and operator summary surfaces as metadata.",
    focus: "Admin dashboard",
    primaryScreen: "Admin overview",
    secondaryScreen: "Operational detail review",
    tableFocus: "Summary widget and alert list",
    formFocus: "Dashboard preference review",
    workflowFocus: "Operational status",
    permissionFocus: "Admin role visibility",
    documentFocus: "Dashboard reference document",
    reportingFocus: "Executive metric placement",
    risk: "Dashboards can hide unresolved data ownership and freshness assumptions.",
  },
  {
    category: "advanced_crud",
    name: "Advanced CRUD UI pattern",
    purpose: "Review list, create, read, update, and detail flows as metadata.",
    focus: "Advanced CRUD",
    primaryScreen: "Record list review",
    secondaryScreen: "Record detail review",
    tableFocus: "Editable record list",
    formFocus: "Record edit review",
    workflowFocus: "Record lifecycle",
    permissionFocus: "Record role visibility",
    documentFocus: "Record attachment metadata",
    reportingFocus: "Record summary placement",
    risk: "CRUD flows can blur review, edit, and restricted states if not modeled clearly.",
  },
  {
    category: "master_detail",
    name: "Master/detail UI pattern",
    purpose: "Review split-view and detail exploration patterns as metadata.",
    focus: "Master detail",
    primaryScreen: "Master list",
    secondaryScreen: "Detail panel",
    tableFocus: "Master record list",
    formFocus: "Detail attribute review",
    workflowFocus: "Selection state",
    permissionFocus: "Detail field visibility",
    documentFocus: "Detail document references",
    reportingFocus: "Detail summary placement",
    risk: "Dense detail panels can overwhelm small screens without responsive review notes.",
  },
  {
    category: "data_table_filters",
    name: "Data table and filters UI pattern",
    purpose: "Review table, search, sort, pagination, and filter behavior as metadata.",
    focus: "Data table filters",
    primaryScreen: "Filterable table",
    secondaryScreen: "Filtered result detail",
    tableFocus: "Searchable table",
    formFocus: "Saved filter review",
    workflowFocus: "Filtered work state",
    permissionFocus: "Column visibility",
    documentFocus: "Export policy metadata",
    reportingFocus: "Table insight placement",
    risk: "Tables can become unclear if filter state, empty state, and ownership are missing.",
  },
  {
    category: "workflow_queue",
    name: "Workflow queue UI pattern",
    purpose: "Review queue ownership, state, escalation, and exception views as metadata.",
    focus: "Workflow queue",
    primaryScreen: "Queue overview",
    secondaryScreen: "Queue item review",
    tableFocus: "Queue work list",
    formFocus: "Queue triage review",
    workflowFocus: "Queue status columns",
    permissionFocus: "Queue role visibility",
    documentFocus: "Queue evidence reference",
    reportingFocus: "Queue performance placement",
    risk: "Queue views can imply operational behavior if ownership and review-only boundaries are unclear.",
  },
  {
    category: "approval_inbox",
    name: "Approval inbox UI pattern",
    purpose: "Review approval request visibility without approval behavior.",
    focus: "Approval inbox",
    primaryScreen: "Approval request list",
    secondaryScreen: "Approval request detail",
    tableFocus: "Approval inbox",
    formFocus: "Approval comment review",
    workflowFocus: "Approval checkpoint",
    permissionFocus: "Approver role visibility",
    documentFocus: "Approval evidence metadata",
    reportingFocus: "Approval aging placement",
    risk: "Approval inbox metadata must not be mistaken for approval behavior.",
  },
  {
    category: "kanban_board",
    name: "Kanban board UI pattern",
    purpose: "Review column, card, and transition visibility as metadata.",
    focus: "Kanban board",
    primaryScreen: "Board overview",
    secondaryScreen: "Card detail review",
    tableFocus: "Card list fallback",
    formFocus: "Card detail review",
    workflowFocus: "Column state review",
    permissionFocus: "Board role visibility",
    documentFocus: "Card document reference",
    reportingFocus: "Board flow placement",
    risk: "Board movement can imply state changes if the pattern is not clearly descriptive.",
  },
  {
    category: "calendar_scheduling",
    name: "Calendar scheduling UI pattern",
    purpose: "Review schedule, availability, conflict, and timezone concerns as metadata.",
    focus: "Calendar scheduling",
    primaryScreen: "Schedule overview",
    secondaryScreen: "Event detail review",
    tableFocus: "Schedule agenda",
    formFocus: "Event detail review",
    workflowFocus: "Scheduling state",
    permissionFocus: "Calendar role visibility",
    documentFocus: "Schedule attachment metadata",
    reportingFocus: "Schedule utilization placement",
    risk: "Scheduling views can mislead if timezone, conflict, and ownership assumptions are absent.",
  },
  {
    category: "pos_ui",
    name: "POS UI pattern",
    purpose: "Review point-of-sale surface needs as metadata only.",
    focus: "POS UI",
    primaryScreen: "Checkout review",
    secondaryScreen: "Sale exception review",
    tableFocus: "Basket line review",
    formFocus: "Tender review",
    workflowFocus: "Checkout state",
    permissionFocus: "Cashier role visibility",
    documentFocus: "Receipt metadata",
    reportingFocus: "Shift summary placement",
    risk: "POS surfaces need fast-entry clarity while keeping payment and transaction behavior out of scope.",
  },
  {
    category: "permission_management",
    name: "Permission management UI pattern",
    purpose: "Review role, group, and access visibility as metadata.",
    focus: "Permission management",
    primaryScreen: "Access overview",
    secondaryScreen: "Role detail review",
    tableFocus: "Role assignment list",
    formFocus: "Access request review",
    workflowFocus: "Access review state",
    permissionFocus: "Permission visibility matrix",
    documentFocus: "Access policy metadata",
    reportingFocus: "Access review placement",
    risk: "Permission screens can be confused with enforcement unless boundaries are explicit.",
  },
  {
    category: "document_management",
    name: "Document management UI pattern",
    purpose: "Review document navigation, metadata, status, and retention surfaces.",
    focus: "Document management",
    primaryScreen: "Document library",
    secondaryScreen: "Document metadata review",
    tableFocus: "Document list",
    formFocus: "Document metadata review",
    workflowFocus: "Document review state",
    permissionFocus: "Document role visibility",
    documentFocus: "Document folder metadata",
    reportingFocus: "Document status placement",
    risk: "Document management needs clear metadata boundaries around storage and retention behavior.",
  },
  {
    category: "reporting_dashboard_ui",
    name: "Reporting dashboard UI pattern",
    purpose: "Review dashboard-like reporting surfaces as placement metadata.",
    focus: "Reporting dashboard UI",
    primaryScreen: "Reporting overview",
    secondaryScreen: "Metric detail review",
    tableFocus: "Report table placement",
    formFocus: "Report filter review",
    workflowFocus: "Reporting review state",
    permissionFocus: "Report audience visibility",
    documentFocus: "Report definition metadata",
    reportingFocus: "Visualization placement",
    risk: "Reporting UI must stay separate from external BI tool output and runtime reporting behavior.",
  },
  {
    category: "audit_traceability_view",
    name: "Audit traceability UI pattern",
    purpose: "Review timeline, checkpoint, actor, and evidence visibility as metadata.",
    focus: "Audit traceability view",
    primaryScreen: "Traceability timeline",
    secondaryScreen: "Checkpoint detail review",
    tableFocus: "Checkpoint list",
    formFocus: "Audit note review",
    workflowFocus: "Checkpoint state",
    permissionFocus: "Audit viewer visibility",
    documentFocus: "Evidence metadata",
    reportingFocus: "Traceability summary placement",
    risk: "Traceability views must not imply audit log creation or compliance certification.",
  },
  {
    category: "transaction_review_view",
    name: "Transaction review UI pattern",
    purpose: "Review transactional boundaries, exceptions, and reconciliation surfaces.",
    focus: "Transaction review view",
    primaryScreen: "Transaction overview",
    secondaryScreen: "Exception detail review",
    tableFocus: "Transaction work list",
    formFocus: "Reconciliation note review",
    workflowFocus: "Transaction state review",
    permissionFocus: "Reviewer role visibility",
    documentFocus: "Transaction evidence metadata",
    reportingFocus: "Transaction status placement",
    risk: "Transaction review screens must not imply payment, posting, settlement, or record mutation.",
  },
  {
    category: "process_state_view",
    name: "Process state UI pattern",
    purpose: "Review process state, handoff, exception, and checkpoint visibility.",
    focus: "Process state view",
    primaryScreen: "Process state overview",
    secondaryScreen: "Handoff detail review",
    tableFocus: "Process state list",
    formFocus: "Handoff note review",
    workflowFocus: "Process state visualization",
    permissionFocus: "Process role visibility",
    documentFocus: "Process evidence metadata",
    reportingFocus: "Process metric placement",
    risk: "Process state views must remain descriptive and not create workflow behavior.",
  },
  {
    category: "generic",
    name: "Generic enterprise UI pattern",
    purpose: "Review a safe starter enterprise UI pattern for unresolved domains.",
    focus: "Generic enterprise UI",
    primaryScreen: "Enterprise overview",
    secondaryScreen: "Enterprise detail review",
    tableFocus: "Generic work list",
    formFocus: "Generic review form",
    workflowFocus: "Generic state review",
    permissionFocus: "Generic role visibility",
    documentFocus: "Generic document metadata",
    reportingFocus: "Generic summary placement",
    risk: "Generic UI patterns can become shallow if not refined by domain and stakeholder review.",
  },
];

const uiPatternTemplates = uiPatternTemplateConfigs.map(makeTemplate);

export const listUiPatternTemplates = (): UiPatternModel[] =>
  JSON.parse(JSON.stringify(uiPatternTemplates)) as UiPatternModel[];
