export type EnterpriseDemoSchemaVersion = "1.0";

export type EnterpriseDemoId =
  | "erp_demo"
  | "crm_demo"
  | "pos_demo"
  | "inventory_procurement_demo"
  | "maintenance_work_order_demo"
  | "incident_support_demo"
  | "access_security_demo"
  | "executive_bi_demo"
  | "enterprise_control_center_demo"
  | "generic_factory_demo";

export type EnterpriseDemoCategory = EnterpriseDemoId;

export type EnterpriseDemoRiskTier = "low" | "medium" | "high" | "critical";

export interface EnterpriseDemoBoundarySet {
  advisoryOnly: true;
  sourceOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemReads: true;
  noFilesystemWrites: true;
  noDemoGeneration: true;
  noGeneratedProjects: true;
  noGeneratedFiles: true;
  noScaffolding: true;
  noDashboardImplementation: true;
  noRuntimeExecution: true;
  noAutomationExecution: true;
  noConnectorExecution: true;
  noCredentialVaultImplementation: true;
  noPackageWorkflowChanges: true;
  noDbSchemas: true;
  noSql: true;
  noActionProposalApprovalExecution: true;
  noJobsExecution: true;
  noProductionReadinessClaims: true;
  noCommercialGuarantees: true;
  noSecurityComplianceGuarantees: true;
}

export interface EnterpriseDemoScenario {
  scenarioId: string;
  title: string;
  summary: string;
  businessGoal: string;
  audience: string[];
  successSignals: string[];
  metadataOnly: true;
}

export interface EnterpriseDemoPersona {
  personaId: string;
  label: string;
  stakeholderType: string;
  goals: string[];
  decisionRights: string[];
  syntheticOnly: true;
  metadataOnly: true;
}

export interface EnterpriseDemoModuleReference {
  referenceId: string;
  familyId: string;
  moduleId: string;
  label: string;
  summary: string;
  metadataOnly: true;
  noFileGeneration: true;
}

export interface EnterpriseDemoWorkflowReference {
  referenceId: string;
  processReference: string;
  label: string;
  summary: string;
  metadataOnly: true;
  noExecution: true;
}

export interface EnterpriseDemoReportingReference {
  referenceId: string;
  reportingReference: string;
  label: string;
  summary: string;
  metadataOnly: true;
  noDashboardGeneration: true;
}

export interface EnterpriseDemoTransactionalReference {
  referenceId: string;
  transactionReference: string;
  label: string;
  summary: string;
  metadataOnly: true;
  noDbOrSql: true;
}

export interface EnterpriseDemoUiPatternReference {
  referenceId: string;
  uiPatternReference: string;
  label: string;
  summary: string;
  metadataOnly: true;
  noUiGeneration: true;
}

export interface EnterpriseDemoSampleDataPolicy {
  policyId: string;
  summary: string;
  syntheticOnly: true;
  metadataOnly: true;
  noFiles: true;
  noRealisticPersonalData: true;
  noSecrets: true;
  noCredentialValues: true;
}

export interface EnterpriseDemoNarrative {
  narrativeId: string;
  title: string;
  audience: string[];
  storyline: string[];
  presentationNotes: string[];
  metadataOnly: true;
  noRenderedDeck: true;
}

export interface EnterpriseDemoRisk {
  riskId: string;
  title: string;
  safeSummary: string;
  riskTier: EnterpriseDemoRiskTier;
  mitigation: string;
  metadataOnly: true;
}

export interface EnterpriseDemoFactoryMetadataReference {
  referenceId: string;
  referenceType:
    | "business_system_family"
    | "module_blueprint"
    | "requirements_interview"
    | "estimation_plan"
    | "business_process"
    | "reporting"
    | "transactional"
    | "ui_pattern"
    | "safe_scaffold"
    | "connector_taxonomy"
    | "credential_strategy"
    | "runtime_readiness"
    | "dashboard_control_center"
    | "productization";
  reference: string;
  safeSummary: string;
  metadataOnly: true;
  noFileRead: true;
}

export interface EnterpriseDemoTemplate {
  demoId: EnterpriseDemoId;
  schemaVersion: EnterpriseDemoSchemaVersion;
  category: EnterpriseDemoCategory;
  name: string;
  summary: string;
  riskTier: EnterpriseDemoRiskTier;
  scenario: EnterpriseDemoScenario;
  personas: EnterpriseDemoPersona[];
  moduleReferences: EnterpriseDemoModuleReference[];
  workflowReferences: EnterpriseDemoWorkflowReference[];
  reportingReferences: EnterpriseDemoReportingReference[];
  transactionalReferences: EnterpriseDemoTransactionalReference[];
  uiPatternReferences: EnterpriseDemoUiPatternReference[];
  sampleDataPolicy: EnterpriseDemoSampleDataPolicy;
  narrative: EnterpriseDemoNarrative;
  risks: EnterpriseDemoRisk[];
  assumptions: string[];
  exclusions: string[];
  relevantFactoryMetadataReferences: EnterpriseDemoFactoryMetadataReference[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: EnterpriseDemoBoundarySet;
}

export interface EnterpriseDemoInput {
  demoId?: string;
  category?: string;
  name?: string;
  summary?: string;
  assumptions?: string[];
  exclusions?: string[];
}

export interface EnterpriseDemoResult {
  ok: boolean;
  status: "demo_found" | "demo_not_found" | "demo_built" | "input_invalid";
  demo?: EnterpriseDemoTemplate;
  demos?: EnterpriseDemoTemplate[];
  warnings: EnterpriseDemoValidationFinding[];
  errors: EnterpriseDemoValidationFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: EnterpriseDemoBoundarySet;
}

export type EnterpriseDemoValidationSeverity = "info" | "warn" | "fail";

export interface EnterpriseDemoValidationFinding {
  id: string;
  severity: EnterpriseDemoValidationSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  demoId?: EnterpriseDemoId;
  metadata?: Record<string, string | number | boolean>;
}

export interface EnterpriseDemoValidationResult {
  validationId: string;
  schemaVersion: EnterpriseDemoSchemaVersion;
  valid: boolean;
  status: "pass" | "warn" | "fail";
  demoCount: number;
  warnings: EnterpriseDemoValidationFinding[];
  errors: EnterpriseDemoValidationFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: EnterpriseDemoBoundarySet;
}
