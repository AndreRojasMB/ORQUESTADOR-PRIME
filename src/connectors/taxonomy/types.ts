export type ConnectorTaxonomySchemaVersion = "1.0";

export type ConnectorId =
  | "gmail"
  | "calendar"
  | "github_deeper"
  | "browser"
  | "filesystem_safe"
  | "terminal_safe"
  | "external_apis"
  | "whatsapp"
  | "omi_voice"
  | "openclaw_computer_use"
  | "payments"
  | "billing_invoicing"
  | "sso"
  | "bi_tools"
  | "accounting_systems"
  | "erp_apis"
  | "crm_apis";

export type ConnectorCategory =
  | "communications"
  | "productivity"
  | "developer"
  | "browser_computer_use"
  | "local_system"
  | "external_api"
  | "finance"
  | "identity"
  | "bi"
  | "accounting"
  | "erp"
  | "crm";

export type ConnectorCapabilityKind =
  | "read"
  | "write"
  | "mutation"
  | "trigger"
  | "webhook"
  | "browser_action"
  | "terminal_command"
  | "filesystem_read"
  | "filesystem_write"
  | "payment"
  | "identity_admin";

export type ConnectorRiskTier = "low" | "medium" | "high" | "critical";

export type ConnectorMaturityStage =
  | "docs_only_spec"
  | "source_only_advisory"
  | "live_adjacent_guarded"
  | "future_read_only"
  | "future_gated_execution"
  | "deferred_until_prerequisites";

export type ConnectorScopeMode = "read_only" | "write" | "mutation" | "future_only";

export type ConnectorRequirementStatus = "required_future" | "not_required" | "deferred";

export interface ConnectorBoundarySet {
  advisoryOnly: true;
  sourceOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noExternalApiCalls: true;
  noFilesystemReads: true;
  noFilesystemWrites: true;
  noCommandExecution: true;
  noCredentialVaultImplementation: true;
  noOAuthTokenHandling: true;
  noWebhookListener: true;
  noBrowserAutomation: true;
  noTerminalExecution: true;
  noPaymentBillingExecution: true;
  noSsoImplementation: true;
  noConnectorWriteBehavior: true;
  noGmailCalendarGitHubWriteBehavior: true;
  noActionProposalApprovalExecution: true;
  noAutomationRuntimeDashboardExecution: true;
  noPackageWorkflowCiChanges: true;
  noDbSchemas: true;
  noSql: true;
  noProductionReadinessClaims: true;
  noSecurityComplianceGuarantees: true;
}

export interface ConnectorCapability {
  capabilityId: string;
  kind: ConnectorCapabilityKind;
  label: string;
  summary: string;
  mode: ConnectorScopeMode;
  futureOnly: boolean;
  requiresApproval: boolean;
  metadataOnly: true;
  noExecution: true;
}

export interface ConnectorPermissionScope {
  scopeId: string;
  label: string;
  summary: string;
  mode: ConnectorScopeMode;
  defaultDenied: boolean;
  metadataOnly: true;
}

export interface ConnectorCredentialRequirement {
  requirementId: string;
  label: string;
  summary: string;
  status: ConnectorRequirementStatus;
  valuesProvided: false;
  metadataOnly: true;
}

export interface ConnectorDataAccessScope {
  dataScopeId: string;
  label: string;
  summary: string;
  mode: ConnectorScopeMode;
  rawDataDenied: boolean;
  metadataOnly: true;
}

export interface ConnectorActionScope {
  actionScopeId: string;
  label: string;
  summary: string;
  mode: ConnectorScopeMode;
  requiresApproval: boolean;
  futureOnly: boolean;
  metadataOnly: true;
  noExecution: true;
}

export interface ConnectorRateLimitPlan {
  planId: string;
  summary: string;
  requiredBeforeExecution: true;
  metadataOnly: true;
  noEnforcement: true;
}

export interface ConnectorRetryPlan {
  planId: string;
  summary: string;
  requiredBeforeExecution: true;
  metadataOnly: true;
  noExecution: true;
}

export interface ConnectorAuditPlan {
  planId: string;
  summary: string;
  required: boolean;
  requiredForHighRisk: boolean;
  metadataOnly: true;
  noAuditWrite: true;
}

export interface ConnectorDryRunPlan {
  planId: string;
  summary: string;
  required: boolean;
  externalCalls: false;
  metadataOnly: true;
  noExecution: true;
}

export interface ConnectorApprovalGate {
  gateId: string;
  summary: string;
  required: boolean;
  requiredForMutation: boolean;
  requiredForHighRisk: boolean;
  metadataOnly: true;
  noApprovalExecution: true;
}

export interface ConnectorSandboxPlan {
  planId: string;
  summary: string;
  required: boolean;
  defaultDeny: boolean;
  futureOnly: boolean;
  metadataOnly: true;
  noSandboxExecution: true;
}

export interface ConnectorRedactionRule {
  ruleId: string;
  label: string;
  summary: string;
  deniedRawData: string[];
  metadataOnly: true;
}

export interface ConnectorTaxonomyEntry {
  connectorId: ConnectorId;
  schemaVersion: ConnectorTaxonomySchemaVersion;
  category: ConnectorCategory;
  name: string;
  summary: string;
  currentStatus: string;
  riskTier: ConnectorRiskTier;
  maturityStage: ConnectorMaturityStage;
  capabilities: ConnectorCapability[];
  readOnlyCapabilities: ConnectorCapability[];
  mutationCapabilities: ConnectorCapability[];
  permissionScopes: ConnectorPermissionScope[];
  credentialRequirements: ConnectorCredentialRequirement[];
  dataAccessScopes: ConnectorDataAccessScope[];
  actionScopes: ConnectorActionScope[];
  rateLimitPlan: ConnectorRateLimitPlan;
  retryPlan: ConnectorRetryPlan;
  auditPlan: ConnectorAuditPlan;
  dryRunPlan: ConnectorDryRunPlan;
  approvalGate: ConnectorApprovalGate;
  sandboxPlan: ConnectorSandboxPlan;
  redactionRules: ConnectorRedactionRule[];
  assumptions: string[];
  exclusions: string[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: ConnectorBoundarySet;
}

export interface ConnectorTaxonomyInput {
  connectorIds?: Array<ConnectorId | string>;
  taxonomyId?: string;
  name?: string;
  summary?: string;
  assumptions?: string[];
  exclusions?: string[];
}

export interface ConnectorTaxonomy {
  taxonomyId: string;
  schemaVersion: ConnectorTaxonomySchemaVersion;
  name: string;
  summary: string;
  entries: ConnectorTaxonomyEntry[];
  includedConnectorIds: ConnectorId[];
  assumptions: string[];
  exclusions: string[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: ConnectorBoundarySet;
}

export type ConnectorTaxonomyResultStatus =
  | "entry_found"
  | "entry_not_found"
  | "taxonomy_built"
  | "input_invalid";

export interface ConnectorTaxonomyResult {
  ok: boolean;
  status: ConnectorTaxonomyResultStatus;
  entry?: ConnectorTaxonomyEntry;
  entries?: ConnectorTaxonomyEntry[];
  taxonomy?: ConnectorTaxonomy;
  warnings: ConnectorTaxonomyValidationFinding[];
  errors: ConnectorTaxonomyValidationFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: ConnectorBoundarySet;
}

export type ConnectorTaxonomyValidationSeverity = "warn" | "fail";

export interface ConnectorTaxonomyValidationFinding {
  id: string;
  severity: ConnectorTaxonomyValidationSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  connectorId?: ConnectorId;
  metadata?: Record<string, string | number | boolean>;
}

export interface ConnectorTaxonomyValidationResult {
  validationId: string;
  schemaVersion: ConnectorTaxonomySchemaVersion;
  valid: boolean;
  status: "pass" | "warn" | "fail";
  entryCount: number;
  warnings: ConnectorTaxonomyValidationFinding[];
  errors: ConnectorTaxonomyValidationFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: ConnectorBoundarySet;
}
