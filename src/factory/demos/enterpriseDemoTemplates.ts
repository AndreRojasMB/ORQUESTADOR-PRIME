import type {
  EnterpriseDemoBoundarySet,
  EnterpriseDemoCategory,
  EnterpriseDemoFactoryMetadataReference,
  EnterpriseDemoId,
  EnterpriseDemoModuleReference,
  EnterpriseDemoPersona,
  EnterpriseDemoReportingReference,
  EnterpriseDemoRisk,
  EnterpriseDemoRiskTier,
  EnterpriseDemoSampleDataPolicy,
  EnterpriseDemoScenario,
  EnterpriseDemoTemplate,
  EnterpriseDemoTransactionalReference,
  EnterpriseDemoUiPatternReference,
  EnterpriseDemoWorkflowReference,
} from "./types.js";

export const enterpriseDemoBoundaries: EnterpriseDemoBoundarySet = {
  advisoryOnly: true,
  sourceOnly: true,
  noProviderCalls: true,
  noNetwork: true,
  noFilesystemReads: true,
  noFilesystemWrites: true,
  noDemoGeneration: true,
  noGeneratedProjects: true,
  noGeneratedFiles: true,
  noScaffolding: true,
  noDashboardImplementation: true,
  noRuntimeExecution: true,
  noAutomationExecution: true,
  noConnectorExecution: true,
  noCredentialVaultImplementation: true,
  noPackageWorkflowChanges: true,
  noDbSchemas: true,
  noSql: true,
  noActionProposalApprovalExecution: true,
  noJobsExecution: true,
  noProductionReadinessClaims: true,
  noCommercialGuarantees: true,
  noSecurityComplianceGuarantees: true,
};

export const supportedEnterpriseDemoIds = [
  "erp_demo",
  "crm_demo",
  "pos_demo",
  "inventory_procurement_demo",
  "maintenance_work_order_demo",
  "incident_support_demo",
  "access_security_demo",
  "executive_bi_demo",
  "enterprise_control_center_demo",
  "generic_factory_demo",
] as const satisfies readonly EnterpriseDemoId[];

export const supportedEnterpriseDemoCategories =
  supportedEnterpriseDemoIds satisfies readonly EnterpriseDemoCategory[];

export const supportedEnterpriseDemoRiskTiers = [
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly EnterpriseDemoRiskTier[];

const scenario = (
  demoId: EnterpriseDemoId,
  title: string,
  summary: string,
  businessGoal: string,
  audience: string[],
  successSignals: string[],
): EnterpriseDemoScenario => ({
  scenarioId: `${demoId}:scenario`,
  title,
  summary,
  businessGoal,
  audience,
  successSignals,
  metadataOnly: true,
});

const persona = (
  demoId: EnterpriseDemoId,
  personaId: string,
  label: string,
  stakeholderType: string,
  goals: string[],
  decisionRights: string[],
): EnterpriseDemoPersona => ({
  personaId: `${demoId}:persona:${personaId}`,
  label,
  stakeholderType,
  goals,
  decisionRights,
  syntheticOnly: true,
  metadataOnly: true,
});

const moduleRef = (
  demoId: EnterpriseDemoId,
  familyId: string,
  moduleId: string,
  label: string,
  summary: string,
): EnterpriseDemoModuleReference => ({
  referenceId: `${demoId}:module:${moduleId}`,
  familyId,
  moduleId,
  label,
  summary,
  metadataOnly: true,
  noFileGeneration: true,
});

const workflowRef = (
  demoId: EnterpriseDemoId,
  processReference: string,
  label: string,
  summary: string,
): EnterpriseDemoWorkflowReference => ({
  referenceId: `${demoId}:workflow:${processReference.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`,
  processReference,
  label,
  summary,
  metadataOnly: true,
  noExecution: true,
});

const reportingRef = (
  demoId: EnterpriseDemoId,
  reportingReference: string,
  label: string,
  summary: string,
): EnterpriseDemoReportingReference => ({
  referenceId: `${demoId}:reporting:${reportingReference.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`,
  reportingReference,
  label,
  summary,
  metadataOnly: true,
  noDashboardGeneration: true,
});

const transactionRef = (
  demoId: EnterpriseDemoId,
  transactionReference: string,
  label: string,
  summary: string,
): EnterpriseDemoTransactionalReference => ({
  referenceId: `${demoId}:transaction:${transactionReference.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`,
  transactionReference,
  label,
  summary,
  metadataOnly: true,
  noDbOrSql: true,
});

const uiRef = (
  demoId: EnterpriseDemoId,
  uiPatternReference: string,
  label: string,
  summary: string,
): EnterpriseDemoUiPatternReference => ({
  referenceId: `${demoId}:ui:${uiPatternReference.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`,
  uiPatternReference,
  label,
  summary,
  metadataOnly: true,
  noUiGeneration: true,
});

const samplePolicy = (
  demoId: EnterpriseDemoId,
  summary: string,
): EnterpriseDemoSampleDataPolicy => ({
  policyId: `${demoId}:sample-data-policy`,
  summary,
  syntheticOnly: true,
  metadataOnly: true,
  noFiles: true,
  noRealisticPersonalData: true,
  noSecrets: true,
  noCredentialValues: true,
});

const risk = (
  demoId: EnterpriseDemoId,
  riskId: string,
  title: string,
  safeSummary: string,
  riskTier: EnterpriseDemoRiskTier,
  mitigation: string,
): EnterpriseDemoRisk => ({
  riskId: `${demoId}:risk:${riskId}`,
  title,
  safeSummary,
  riskTier,
  mitigation,
  metadataOnly: true,
});

const metadataRef = (
  demoId: EnterpriseDemoId,
  referenceType: EnterpriseDemoFactoryMetadataReference["referenceType"],
  reference: string,
  safeSummary: string,
): EnterpriseDemoFactoryMetadataReference => ({
  referenceId: `${demoId}:metadata:${referenceType}:${reference.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`,
  referenceType,
  reference,
  safeSummary,
  metadataOnly: true,
  noFileRead: true,
});

interface DemoTemplateConfig {
  demoId: EnterpriseDemoId;
  name: string;
  summary: string;
  riskTier: EnterpriseDemoRiskTier;
  businessGoal: string;
  audience: string[];
  successSignals: string[];
  personas: Array<[string, string, string, string[], string[]]>;
  modules: Array<[string, string, string, string]>;
  workflows: Array<[string, string, string]>;
  reporting: Array<[string, string, string]>;
  transactions: Array<[string, string, string]>;
  uiPatterns: Array<[string, string, string]>;
  samplePolicySummary: string;
  storyline: string[];
  risks: Array<[string, string, string, EnterpriseDemoRiskTier, string]>;
  assumptions: string[];
  exclusions: string[];
  metadataReferences: Array<[EnterpriseDemoFactoryMetadataReference["referenceType"], string, string]>;
}

const makeTemplate = (config: DemoTemplateConfig): EnterpriseDemoTemplate => ({
  demoId: config.demoId,
  schemaVersion: "1.0",
  category: config.demoId,
  name: config.name,
  summary: config.summary,
  riskTier: config.riskTier,
  scenario: scenario(
    config.demoId,
    config.name,
    config.summary,
    config.businessGoal,
    config.audience,
    config.successSignals,
  ),
  personas: config.personas.map(([personaId, label, stakeholderType, goals, decisionRights]) =>
    persona(config.demoId, personaId, label, stakeholderType, goals, decisionRights),
  ),
  moduleReferences: config.modules.map(([familyId, moduleId, label, summary]) =>
    moduleRef(config.demoId, familyId, moduleId, label, summary),
  ),
  workflowReferences: config.workflows.map(([reference, label, summary]) =>
    workflowRef(config.demoId, reference, label, summary),
  ),
  reportingReferences: config.reporting.map(([reference, label, summary]) =>
    reportingRef(config.demoId, reference, label, summary),
  ),
  transactionalReferences: config.transactions.map(([reference, label, summary]) =>
    transactionRef(config.demoId, reference, label, summary),
  ),
  uiPatternReferences: config.uiPatterns.map(([reference, label, summary]) =>
    uiRef(config.demoId, reference, label, summary),
  ),
  sampleDataPolicy: samplePolicy(config.demoId, config.samplePolicySummary),
  narrative: {
    narrativeId: `${config.demoId}:narrative`,
    title: `${config.name} narrative`,
    audience: config.audience,
    storyline: config.storyline,
    presentationNotes: [
      "Narrative is advisory metadata only.",
      "No rendered deck, generated UI, generated dataset, or scaffold output is produced.",
    ],
    metadataOnly: true,
    noRenderedDeck: true,
  },
  risks: config.risks.map(([riskId, title, safeSummary, riskTier, mitigation]) =>
    risk(config.demoId, riskId, title, safeSummary, riskTier, mitigation),
  ),
  assumptions: config.assumptions,
  exclusions: config.exclusions,
  relevantFactoryMetadataReferences: config.metadataReferences.map(([referenceType, reference, safeSummary]) =>
    metadataRef(config.demoId, referenceType, reference, safeSummary),
  ),
  advisoryOnly: true,
  sourceOnly: true,
  boundaries: enterpriseDemoBoundaries,
});

const enterpriseDemoTemplates: EnterpriseDemoTemplate[] = [
  makeTemplate({
    demoId: "erp_demo",
    name: "ERP advisory demo",
    summary: "Advisory ERP demo metadata for finance, inventory, and procurement storyline review.",
    riskTier: "high",
    businessGoal: "Show how ERP modules could be narrated from source-only factory metadata.",
    audience: ["operations leader", "finance reviewer", "implementation sponsor"],
    successSignals: ["module coverage is understandable", "risks are explicit", "sample data stays synthetic"],
    personas: [
      ["operations_lead", "Operations lead", "business sponsor", ["review inventory flow"], ["prioritize scope"]],
      ["finance_reviewer", "Finance reviewer", "control reviewer", ["review closing assumptions"], ["flag audit risks"]],
    ],
    modules: [
      ["erp", "finance", "Finance module", "Finance module reference for review narrative only."],
      ["erp", "inventory", "Inventory module", "Inventory module reference for stock visibility narrative."],
      ["erp", "procurement", "Procurement module", "Procurement module reference for purchase planning narrative."],
    ],
    workflows: [["process:procurement", "Procurement flow", "Reviewed procurement states and handoffs."]],
    reporting: [["finance_closing_reporting", "Finance reporting", "Closing dashboard concepts as metadata only."]],
    transactions: [["finance_closing_transaction", "Closing transaction", "Transactional boundaries as advisory notes."]],
    uiPatterns: [["admin_dashboard", "ERP admin overview", "Dashboard pattern reference without rendering UI."]],
    samplePolicySummary: "Synthetic ERP labels and aggregate examples only; no ledgers, raw financial data, or files.",
    storyline: [
      "Start with finance, inventory, and procurement module responsibilities.",
      "Walk through procurement state transitions and review checkpoints.",
      "Close with reporting and transaction risk notes.",
    ],
    risks: [
      ["ledger_overclaim", "Ledger overclaim", "ERP demos can imply ledger correctness.", "high", "Keep transaction notes advisory."],
      ["db_drift", "DB drift", "ERP demos can drift into schema design.", "high", "Deny DB schemas and SQL."],
    ],
    assumptions: ["ERP demo metadata uses reviewed catalog and factory references only."],
    exclusions: ["No generated ERP, DB, ledgers, scaffold output, or production readiness claims."],
    metadataReferences: [
      ["business_system_family", "erp", "ERP catalog family vocabulary."],
      ["module_blueprint", "erp:finance", "Future reviewed finance module blueprint reference."],
    ],
  }),
  makeTemplate({
    demoId: "crm_demo",
    name: "CRM advisory demo",
    summary: "Advisory CRM demo metadata for pipeline, account, and support-flow narrative review.",
    riskTier: "high",
    businessGoal: "Describe a CRM story without emails, connector calls, or customer data.",
    audience: ["sales leader", "support manager", "implementation sponsor"],
    successSignals: ["pipeline story is clear", "support handoff is explicit", "connector writes are denied"],
    personas: [["sales_manager", "Sales manager", "business user", ["review pipeline health"], ["prioritize CRM scope"]]],
    modules: [["crm", "pipeline", "Pipeline module", "Pipeline module reference for opportunity review."]],
    workflows: [["process:incident-ticket", "Support handoff", "Ticket triage as process metadata only."]],
    reporting: [["sales_reporting", "Sales reporting", "Pipeline KPI summaries as advisory metadata."]],
    transactions: [["incident_ticket_transaction", "Ticket transaction", "Support state audit reference only."]],
    uiPatterns: [["kanban_board", "Pipeline board", "Kanban pattern reference without generated UI."]],
    samplePolicySummary: "Fake account summaries and synthetic opportunity labels only; no real contacts or emails.",
    storyline: ["Introduce synthetic account segment.", "Review pipeline stage movement.", "Show support escalation metadata."],
    risks: [["outbound_action", "Outbound action drift", "CRM demos can imply emails or connector writes.", "high", "Keep all connector behavior denied."]],
    assumptions: ["CRM demo metadata is not connected to Gmail, calendar, or CRM APIs."],
    exclusions: ["No CRM writes, emails, connector calls, generated dashboards, or realistic personal data."],
    metadataReferences: [["business_system_family", "crm", "CRM catalog family vocabulary."]],
  }),
  makeTemplate({
    demoId: "pos_demo",
    name: "POS advisory demo",
    summary: "Advisory POS demo metadata for checkout, inventory, and closing narrative review.",
    riskTier: "critical",
    businessGoal: "Describe POS value without payment execution, receipts, or database behavior.",
    audience: ["store manager", "finance reviewer", "operations sponsor"],
    successSignals: ["payment behavior is denied", "closing assumptions are explicit", "sample sales are synthetic"],
    personas: [["store_manager", "Store manager", "operator", ["review checkout flow"], ["flag operational blockers"]]],
    modules: [["pos", "checkout", "Checkout module", "Checkout reference for non-executing story."]],
    workflows: [["process:sales-order", "Checkout flow", "Sales order flow as metadata only."]],
    reporting: [["sales_reporting", "Sales reporting", "Synthetic sales summary narrative."]],
    transactions: [["sales_order_transaction", "Sales transaction", "Transaction boundary reference without payment behavior."]],
    uiPatterns: [["pos_ui", "POS UI", "POS pattern reference without generated screens."]],
    samplePolicySummary: "Synthetic sales examples only; no receipts, payment data, card data, or files.",
    storyline: ["Describe checkout intent.", "Relate stock impact as metadata.", "Review closing risk notes."],
    risks: [["payment_claim", "Payment claim", "POS demos can imply payment correctness.", "critical", "Deny payment execution and commercial guarantees."]],
    assumptions: ["All POS amounts and item labels are illustrative metadata."],
    exclusions: ["No payment execution, receipts, DB behavior, SQL, or commercial guarantee claims."],
    metadataReferences: [["business_system_family", "pos", "POS catalog family vocabulary."]],
  }),
  makeTemplate({
    demoId: "inventory_procurement_demo",
    name: "Inventory and procurement advisory demo",
    summary: "Advisory metadata for stock visibility, procurement review, and reorder narrative.",
    riskTier: "high",
    businessGoal: "Show stock and procurement coordination using metadata-only references.",
    audience: ["warehouse lead", "procurement owner"],
    successSignals: ["stock labels are bounded", "purchase behavior is denied"],
    personas: [["warehouse_lead", "Warehouse lead", "operator", ["review stock pressure"], ["escalate exceptions"]]],
    modules: [["inventory", "stock", "Inventory module", "Stock module reference only."]],
    workflows: [["process:inventory-movement", "Inventory movement", "Stock movement flow metadata."]],
    reporting: [["inventory_reporting", "Inventory reporting", "Stock summary KPI reference."]],
    transactions: [["inventory_movement_transaction", "Inventory movement transaction", "Movement boundary reference."]],
    uiPatterns: [["data_table_filters", "Inventory table", "Filterable table pattern reference."]],
    samplePolicySummary: "Bounded synthetic SKU labels only; no store files or purchase order records.",
    storyline: ["Review stock exception.", "Trace procurement handoff.", "Summarize reporting needs."],
    risks: [["store_mutation", "Store mutation drift", "Inventory demos can imply stock writes.", "high", "Keep stock data as labels only."]],
    assumptions: ["No real inventory identifiers are used."],
    exclusions: ["No store mutation, purchase orders, generated files, or DB schemas."],
    metadataReferences: [["business_process", "process:inventory-movement", "Inventory process template reference."]],
  }),
  makeTemplate({
    demoId: "maintenance_work_order_demo",
    name: "Maintenance work-order advisory demo",
    summary: "Advisory metadata for asset issue intake, work-order review, and completion narrative.",
    riskTier: "high",
    businessGoal: "Describe maintenance coordination without scheduler, job, or automation behavior.",
    audience: ["maintenance planner", "operations manager"],
    successSignals: ["work-order lifecycle is clear", "automation remains denied"],
    personas: [["planner", "Maintenance planner", "planner", ["review asset priority"], ["sequence work"]]],
    modules: [["erp", "maintenance", "Maintenance module", "Maintenance module reference only."]],
    workflows: [["process:maintenance-work-order", "Work-order lifecycle", "Maintenance process metadata."]],
    reporting: [["maintenance_work_order_reporting", "Maintenance reporting", "Work-order status summary metadata."]],
    transactions: [["maintenance_work_order_transaction", "Work-order transaction", "State and audit boundary reference."]],
    uiPatterns: [["workflow_queue", "Maintenance queue", "Queue UI pattern reference."]],
    samplePolicySummary: "Synthetic asset labels only; no work-order files or scheduler state.",
    storyline: ["Log synthetic asset issue.", "Review queue and priority.", "Close with audit notes."],
    risks: [["job_execution", "Job execution drift", "Maintenance demos can imply scheduled work.", "high", "Deny jobs and automation execution."]],
    assumptions: ["Assets are named as synthetic labels."],
    exclusions: ["No scheduler, jobs, automation, generated files, or runtime behavior."],
    metadataReferences: [["business_process", "process:maintenance-work-order", "Maintenance process template reference."]],
  }),
  makeTemplate({
    demoId: "incident_support_demo",
    name: "Incident and support advisory demo",
    summary: "Advisory metadata for incident triage, SLA review, and escalation narrative.",
    riskTier: "high",
    businessGoal: "Describe support flow without notifications, actions, or dispatch.",
    audience: ["support manager", "service owner"],
    successSignals: ["SLA assumptions are marked", "action execution remains denied"],
    personas: [["support_manager", "Support manager", "service owner", ["review SLA risk"], ["prioritize escalation"]]],
    modules: [["crm", "support", "Support module", "Support module reference only."]],
    workflows: [["process:incident-ticket", "Incident ticket", "Incident process metadata."]],
    reporting: [["incident_support_reporting", "Incident reporting", "SLA and ticket summary metadata."]],
    transactions: [["incident_ticket_transaction", "Incident transaction", "Ticket audit boundary reference."]],
    uiPatterns: [["approval_inbox", "Support review inbox", "Review inbox pattern reference."]],
    samplePolicySummary: "Fake ticket summaries only; no user messages, notifications, or files.",
    storyline: ["Open synthetic incident.", "Review triage handoff.", "Describe escalation checkpoint."],
    risks: [["notification_drift", "Notification drift", "Support demos can imply messages or actions.", "high", "Keep notifications and actions denied."]],
    assumptions: ["Ticket examples are synthetic and metadata-only."],
    exclusions: ["No notifications, action dispatch, proposal execution, or job execution."],
    metadataReferences: [["business_process", "process:incident-ticket", "Incident process template reference."]],
  }),
  makeTemplate({
    demoId: "access_security_demo",
    name: "Access and security advisory demo",
    summary: "Advisory metadata for access request, review, and audit narrative.",
    riskTier: "critical",
    businessGoal: "Describe access governance without auth enforcement or role changes.",
    audience: ["security reviewer", "system owner"],
    successSignals: ["identities are synthetic", "no security guarantee is implied"],
    personas: [["security_reviewer", "Security reviewer", "risk reviewer", ["review access request"], ["flag control risk"]]],
    modules: [["erp", "access", "Access module", "Access governance reference only."]],
    workflows: [["process:access-request", "Access request", "Access request metadata."]],
    reporting: [["access_security_reporting", "Access reporting", "Access review summary metadata."]],
    transactions: [["access_request_audit_transaction", "Access audit transaction", "Access audit boundary reference."]],
    uiPatterns: [["permission_management", "Permission management UI", "Permission pattern reference without enforcement."]],
    samplePolicySummary: "Synthetic identity labels only; no real users, roles, tokens, or credentials.",
    storyline: ["Introduce synthetic access request.", "Review approval checkpoint.", "Summarize audit risk."],
    risks: [["security_overclaim", "Security overclaim", "Access demos can imply enforcement or guarantees.", "critical", "Mark all controls as advisory."]],
    assumptions: ["Access identities are synthetic labels."],
    exclusions: ["No auth enforcement, role changes, credentials, or security guarantees."],
    metadataReferences: [["business_process", "process:access-request", "Access request template reference."]],
  }),
  makeTemplate({
    demoId: "executive_bi_demo",
    name: "Executive BI advisory demo",
    summary: "Advisory metadata for KPI, reporting, and executive narrative review.",
    riskTier: "medium",
    businessGoal: "Describe executive insights without generating dashboards or calling BI tools.",
    audience: ["executive sponsor", "analytics lead"],
    successSignals: ["KPI assumptions are clear", "no BI API behavior is implied"],
    personas: [["executive_sponsor", "Executive sponsor", "decision maker", ["review top-level indicators"], ["prioritize questions"]]],
    modules: [["bi", "executive-dashboard", "Executive dashboard module", "BI module reference only."]],
    workflows: [["process:reporting-closing", "Reporting close", "Reporting close metadata."]],
    reporting: [["executive_dashboard", "Executive dashboard", "Executive KPI metadata."]],
    transactions: [["finance_closing_transaction", "Closing context", "Closing transaction context as advisory reference."]],
    uiPatterns: [["reporting_dashboard_ui", "Reporting dashboard UI", "Dashboard UI pattern reference."]],
    samplePolicySummary: "Aggregate fake metrics only; no financial correctness, raw reports, or files.",
    storyline: ["Open with KPI overview.", "Explain assumptions.", "Review decision questions."],
    risks: [["commercial_overclaim", "Commercial overclaim", "BI demos can imply guaranteed value.", "medium", "Deny commercial guarantees and exact claims."]],
    assumptions: ["Metrics are illustrative and assumption-based."],
    exclusions: ["No generated dashboards, BI API calls, financial guarantees, or commercial guarantees."],
    metadataReferences: [["reporting", "executive_dashboard", "Executive reporting template reference."]],
  }),
  makeTemplate({
    demoId: "enterprise_control_center_demo",
    name: "Enterprise control-center advisory demo",
    summary: "Advisory metadata for read-only maturity, risk, and governance overview narrative.",
    riskTier: "high",
    businessGoal: "Describe a future control-center view without dashboard implementation or raw store reads.",
    audience: ["operator", "governance reviewer"],
    successSignals: ["visibility is read-only", "raw data remains denied"],
    personas: [["operator", "Operator", "reviewer", ["review maturity lanes"], ["request follow-up review"]]],
    modules: [["mvc", "control-center", "Control center module", "Control-center concept reference only."]],
    workflows: [["process:generic", "Governance review", "Generic review workflow metadata."]],
    reporting: [["process_performance_reporting", "Maturity reporting", "Read-only summary metadata."]],
    transactions: [["access_request_audit_transaction", "Audit context", "Governance audit context reference."]],
    uiPatterns: [["admin_dashboard", "Admin dashboard pattern", "Admin dashboard pattern without dashboard code."]],
    samplePolicySummary: "Summary-only metadata; no raw stores, paths, private data, or files.",
    storyline: ["Review maturity lanes.", "Call out blockers.", "Describe next review steps."],
    risks: [["dashboard_drift", "Dashboard drift", "Control-center demos can become dashboard implementation.", "high", "Keep all references metadata-only."]],
    assumptions: ["Control-center visibility remains future-only and read-only."],
    exclusions: ["No dashboard implementation, raw stores, server actions, generated UI, or runtime behavior."],
    metadataReferences: [["dashboard_control_center", "control-center-readonly-manifest", "Readonly manifest policy reference."]],
  }),
  makeTemplate({
    demoId: "generic_factory_demo",
    name: "Generic enterprise software factory advisory demo",
    summary: "Advisory metadata for end-to-end factory narrative across catalog, blueprints, planning, and governance.",
    riskTier: "medium",
    businessGoal: "Describe how factory lanes relate without generating systems or scaffolds.",
    audience: ["product sponsor", "architecture reviewer"],
    successSignals: ["factory story is coherent", "generation stays deferred"],
    personas: [["architecture_reviewer", "Architecture reviewer", "technical reviewer", ["review lane maturity"], ["flag unsafe jumps"]]],
    modules: [["mvc", "generic-module", "Generic module", "Generic module reference only."]],
    workflows: [["process:generic", "Generic process", "Generic process metadata."]],
    reporting: [["generic", "Generic reporting", "Generic reporting metadata."]],
    transactions: [["generic", "Generic transaction", "Generic transaction metadata."]],
    uiPatterns: [["generic", "Generic UI pattern", "Generic UI pattern metadata."]],
    samplePolicySummary: "Metadata-only examples; no project files, datasets, or scaffold instructions.",
    storyline: ["Start with catalog family.", "Trace module blueprint and planning.", "Close with governance blockers."],
    risks: [["scaffold_drift", "Scaffold drift", "Factory demos can drift into generated systems.", "medium", "Keep scaffold generation denied."]],
    assumptions: ["Factory demo content is planning metadata only."],
    exclusions: ["No scaffolds, generated systems, generated projects, or file output."],
    metadataReferences: [["safe_scaffold", "safe-scaffold-generator", "Safe scaffold governance reference."]],
  }),
];

export const listEnterpriseDemoTemplates = (): EnterpriseDemoTemplate[] =>
  enterpriseDemoTemplates.map((template) => cloneEnterpriseDemoTemplate(template));

export const getEnterpriseDemoTemplateById = (
  demoId: EnterpriseDemoId,
): EnterpriseDemoTemplate | undefined => {
  const template = enterpriseDemoTemplates.find((item) => item.demoId === demoId);
  return template ? cloneEnterpriseDemoTemplate(template) : undefined;
};

export const cloneEnterpriseDemoTemplate = (
  template: EnterpriseDemoTemplate,
): EnterpriseDemoTemplate => ({
  ...template,
  scenario: { ...template.scenario, audience: [...template.scenario.audience], successSignals: [...template.scenario.successSignals] },
  personas: template.personas.map((item) => ({
    ...item,
    goals: [...item.goals],
    decisionRights: [...item.decisionRights],
  })),
  moduleReferences: template.moduleReferences.map((item) => ({ ...item })),
  workflowReferences: template.workflowReferences.map((item) => ({ ...item })),
  reportingReferences: template.reportingReferences.map((item) => ({ ...item })),
  transactionalReferences: template.transactionalReferences.map((item) => ({ ...item })),
  uiPatternReferences: template.uiPatternReferences.map((item) => ({ ...item })),
  sampleDataPolicy: { ...template.sampleDataPolicy },
  narrative: {
    ...template.narrative,
    audience: [...template.narrative.audience],
    storyline: [...template.narrative.storyline],
    presentationNotes: [...template.narrative.presentationNotes],
  },
  risks: template.risks.map((item) => ({ ...item })),
  assumptions: [...template.assumptions],
  exclusions: [...template.exclusions],
  relevantFactoryMetadataReferences: template.relevantFactoryMetadataReferences.map((item) => ({ ...item })),
  boundaries: { ...template.boundaries },
});
