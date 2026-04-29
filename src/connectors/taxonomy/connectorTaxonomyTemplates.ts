import type {
  ConnectorActionScope,
  ConnectorApprovalGate,
  ConnectorAuditPlan,
  ConnectorBoundarySet,
  ConnectorCapability,
  ConnectorCapabilityKind,
  ConnectorCategory,
  ConnectorCredentialRequirement,
  ConnectorDataAccessScope,
  ConnectorDryRunPlan,
  ConnectorId,
  ConnectorMaturityStage,
  ConnectorPermissionScope,
  ConnectorRateLimitPlan,
  ConnectorRedactionRule,
  ConnectorRetryPlan,
  ConnectorRiskTier,
  ConnectorSandboxPlan,
  ConnectorScopeMode,
  ConnectorTaxonomyEntry,
} from "./types.js";

export const connectorTaxonomyBoundaries: ConnectorBoundarySet = {
  advisoryOnly: true,
  sourceOnly: true,
  noProviderCalls: true,
  noNetwork: true,
  noExternalApiCalls: true,
  noFilesystemReads: true,
  noFilesystemWrites: true,
  noCommandExecution: true,
  noCredentialVaultImplementation: true,
  noOAuthTokenHandling: true,
  noWebhookListener: true,
  noBrowserAutomation: true,
  noTerminalExecution: true,
  noPaymentBillingExecution: true,
  noSsoImplementation: true,
  noConnectorWriteBehavior: true,
  noGmailCalendarGitHubWriteBehavior: true,
  noActionProposalApprovalExecution: true,
  noAutomationRuntimeDashboardExecution: true,
  noPackageWorkflowCiChanges: true,
  noDbSchemas: true,
  noSql: true,
  noProductionReadinessClaims: true,
  noSecurityComplianceGuarantees: true,
};

export const supportedConnectorIds: ConnectorId[] = [
  "gmail",
  "calendar",
  "github_deeper",
  "browser",
  "filesystem_safe",
  "terminal_safe",
  "external_apis",
  "whatsapp",
  "omi_voice",
  "openclaw_computer_use",
  "payments",
  "billing_invoicing",
  "sso",
  "bi_tools",
  "accounting_systems",
  "erp_apis",
  "crm_apis",
];

export const supportedConnectorCategories: ConnectorCategory[] = [
  "communications",
  "productivity",
  "developer",
  "browser_computer_use",
  "local_system",
  "external_api",
  "finance",
  "identity",
  "bi",
  "accounting",
  "erp",
  "crm",
];

export const supportedConnectorCapabilityKinds: ConnectorCapabilityKind[] = [
  "read",
  "write",
  "mutation",
  "trigger",
  "webhook",
  "browser_action",
  "terminal_command",
  "filesystem_read",
  "filesystem_write",
  "payment",
  "identity_admin",
];

export const supportedConnectorRiskTiers: ConnectorRiskTier[] = [
  "low",
  "medium",
  "high",
  "critical",
];

export const supportedConnectorMaturityStages: ConnectorMaturityStage[] = [
  "docs_only_spec",
  "source_only_advisory",
  "live_adjacent_guarded",
  "future_read_only",
  "future_gated_execution",
  "deferred_until_prerequisites",
];

interface ConnectorSeed {
  connectorId: ConnectorId;
  category: ConnectorCategory;
  name: string;
  summary: string;
  currentStatus: string;
  riskTier: ConnectorRiskTier;
  maturityStage: ConnectorMaturityStage;
  readOnlyLabels: string[];
  mutationLabels: string[];
  credentialSummary: string;
  dataSummary: string;
  actionSummary: string;
  sandboxSummary: string;
  exclusions: string[];
}

const capability = (
  connectorId: ConnectorId,
  index: number,
  label: string,
  kind: ConnectorCapabilityKind,
  mode: ConnectorScopeMode,
  requiresApproval: boolean,
): ConnectorCapability => ({
  capabilityId: `${connectorId}:capability:${index + 1}`,
  kind,
  label,
  summary: `${label} is represented as curated connector metadata only.`,
  mode,
  futureOnly: mode !== "read_only",
  requiresApproval,
  metadataOnly: true,
  noExecution: true,
});

const credentialRequirement = (
  connectorId: ConnectorId,
  summary: string,
): ConnectorCredentialRequirement => ({
  requirementId: `${connectorId}:credential_requirement:1`,
  label: "Future credential requirement",
  summary,
  status: "required_future",
  valuesProvided: false,
  metadataOnly: true,
});

const permissionScope = (
  connectorId: ConnectorId,
  mode: ConnectorScopeMode,
  defaultDenied: boolean,
): ConnectorPermissionScope => ({
  scopeId: `${connectorId}:permission_scope:${mode}`,
  label: `${mode} permission scope`,
  summary: "Permission scope is descriptive metadata for future governance review.",
  mode,
  defaultDenied,
  metadataOnly: true,
});

const dataAccessScope = (
  connectorId: ConnectorId,
  summary: string,
): ConnectorDataAccessScope => ({
  dataScopeId: `${connectorId}:data_scope:summary`,
  label: "Redacted summary scope",
  summary,
  mode: "read_only",
  rawDataDenied: true,
  metadataOnly: true,
});

const actionScope = (
  connectorId: ConnectorId,
  summary: string,
): ConnectorActionScope => ({
  actionScopeId: `${connectorId}:action_scope:future_mutation`,
  label: "Future mutation scope",
  summary,
  mode: "future_only",
  requiresApproval: true,
  futureOnly: true,
  metadataOnly: true,
  noExecution: true,
});

const rateLimitPlan = (connectorId: ConnectorId): ConnectorRateLimitPlan => ({
  planId: `${connectorId}:rate_limit_plan:future`,
  summary: "Future connector use requires bounded request budgets before any gated operation.",
  requiredBeforeExecution: true,
  metadataOnly: true,
  noEnforcement: true,
});

const retryPlan = (connectorId: ConnectorId): ConnectorRetryPlan => ({
  planId: `${connectorId}:retry_plan:future`,
  summary: "Future connector use requires bounded retry and timeout policy before any gated operation.",
  requiredBeforeExecution: true,
  metadataOnly: true,
  noExecution: true,
});

const auditPlan = (connectorId: ConnectorId, required: boolean): ConnectorAuditPlan => ({
  planId: `${connectorId}:audit_plan:future`,
  summary: "Future connector use requires redacted audit metadata before any gated operation.",
  required,
  requiredForHighRisk: true,
  metadataOnly: true,
  noAuditWrite: true,
});

const dryRunPlan = (connectorId: ConnectorId): ConnectorDryRunPlan => ({
  planId: `${connectorId}:dry_run_plan:metadata_only`,
  summary: "Dry-run expectations are descriptive only and do not contact external services.",
  required: true,
  externalCalls: false,
  metadataOnly: true,
  noExecution: true,
});

const approvalGate = (connectorId: ConnectorId, required: boolean): ConnectorApprovalGate => ({
  gateId: `${connectorId}:approval_gate:future`,
  summary: "Future write or mutation capability requires explicit approval metadata before it can advance.",
  required,
  requiredForMutation: true,
  requiredForHighRisk: true,
  metadataOnly: true,
  noApprovalExecution: true,
});

const sandboxPlan = (
  connectorId: ConnectorId,
  summary: string,
  required: boolean,
): ConnectorSandboxPlan => ({
  planId: `${connectorId}:sandbox_plan:future`,
  summary,
  required,
  defaultDeny: true,
  futureOnly: true,
  metadataOnly: true,
  noSandboxExecution: true,
});

const redactionRules = (connectorId: ConnectorId): ConnectorRedactionRule[] => [
  {
    ruleId: `${connectorId}:redaction:secrets`,
    label: "Sensitive values denied",
    summary: "Connector summaries must omit secrets, tokens, raw credentials, and unredacted identity details.",
    deniedRawData: [
      "secrets",
      "tokens",
      "credential values",
      "raw payloads",
      "unredacted identity details",
    ],
    metadataOnly: true,
  },
  {
    ruleId: `${connectorId}:redaction:payloads`,
    label: "Raw payloads denied",
    summary: "Connector summaries must prefer counts, labels, reason codes, and redacted status metadata.",
    deniedRawData: ["raw messages", "raw prompts", "raw outputs", "full artifacts"],
    metadataOnly: true,
  },
];

const riskRequiresGate = (riskTier: ConnectorRiskTier): boolean =>
  riskTier === "high" || riskTier === "critical";

const createEntry = (seed: ConnectorSeed): ConnectorTaxonomyEntry => {
  const approvalRequired = riskRequiresGate(seed.riskTier);
  const readOnlyCapabilities = seed.readOnlyLabels.map((label, index) =>
    capability(seed.connectorId, index, label, "read", "read_only", false),
  );
  const mutationCapabilities = seed.mutationLabels.map((label, index) =>
    capability(
      seed.connectorId,
      readOnlyCapabilities.length + index,
      label,
      label.toLowerCase().includes("payment")
        ? "payment"
        : label.toLowerCase().includes("identity")
          ? "identity_admin"
          : "mutation",
      "future_only",
      true,
    ),
  );

  return {
    connectorId: seed.connectorId,
    schemaVersion: "1.0",
    category: seed.category,
    name: seed.name,
    summary: seed.summary,
    currentStatus: seed.currentStatus,
    riskTier: seed.riskTier,
    maturityStage: seed.maturityStage,
    capabilities: [...readOnlyCapabilities, ...mutationCapabilities],
    readOnlyCapabilities,
    mutationCapabilities,
    permissionScopes: [
      permissionScope(seed.connectorId, "read_only", false),
      permissionScope(seed.connectorId, "future_only", true),
    ],
    credentialRequirements: [credentialRequirement(seed.connectorId, seed.credentialSummary)],
    dataAccessScopes: [dataAccessScope(seed.connectorId, seed.dataSummary)],
    actionScopes: [actionScope(seed.connectorId, seed.actionSummary)],
    rateLimitPlan: rateLimitPlan(seed.connectorId),
    retryPlan: retryPlan(seed.connectorId),
    auditPlan: auditPlan(seed.connectorId, approvalRequired),
    dryRunPlan: dryRunPlan(seed.connectorId),
    approvalGate: approvalGate(seed.connectorId, approvalRequired),
    sandboxPlan: sandboxPlan(seed.connectorId, seed.sandboxSummary, approvalRequired),
    redactionRules: redactionRules(seed.connectorId),
    assumptions: [
      "Connector taxonomy is curated advisory metadata only.",
      "Credential requirements describe future prerequisites and never include credential values.",
    ],
    exclusions: seed.exclusions,
    advisoryOnly: true,
    sourceOnly: true,
    boundaries: connectorTaxonomyBoundaries,
  };
};

const connectorSeeds: ConnectorSeed[] = [
  {
    connectorId: "gmail",
    category: "productivity",
    name: "Gmail connector taxonomy",
    summary: "Future Gmail connector metadata for message, thread, and label governance.",
    currentStatus: "Future-only; no Gmail connector is implemented by this taxonomy.",
    riskTier: "high",
    maturityStage: "deferred_until_prerequisites",
    readOnlyLabels: ["Message summary inventory", "Thread summary inventory", "Label summary inventory"],
    mutationLabels: ["Send mail", "Reply to mail", "Draft mail", "Delete mail", "Change labels"],
    credentialSummary: "Future delegated mail access requires a governed credential reference and consent model.",
    dataSummary: "Only redacted message, thread, and label summaries are acceptable future read data.",
    actionSummary: "Mail sending, reply, draft, delete, and label changes require future approval gates.",
    sandboxSummary: "Future Gmail use requires consent, rate limits, redaction, and default-deny outbound actions.",
    exclusions: ["No Gmail remote operation is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "calendar",
    category: "productivity",
    name: "Calendar connector taxonomy",
    summary: "Future calendar connector metadata for availability and event governance.",
    currentStatus: "Future-only; no calendar connector is implemented by this taxonomy.",
    riskTier: "high",
    maturityStage: "deferred_until_prerequisites",
    readOnlyLabels: ["Availability summary inventory", "Event summary inventory"],
    mutationLabels: ["Create event", "Update event", "Delete event", "Invite attendee"],
    credentialSummary: "Future calendar access requires a governed credential reference and consent model.",
    dataSummary: "Only redacted availability and event summaries are acceptable future read data.",
    actionSummary: "Event creation, update, deletion, and invites require future approval gates.",
    sandboxSummary: "Future calendar use requires redaction, rate limits, and default-deny scheduling actions.",
    exclusions: ["No calendar remote operation is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "github_deeper",
    category: "developer",
    name: "GitHub deeper connector taxonomy",
    summary: "Future GitHub governance metadata beyond existing live-adjacent client surfaces.",
    currentStatus: "Live-adjacent clients exist elsewhere; this taxonomy does not import or invoke them.",
    riskTier: "high",
    maturityStage: "live_adjacent_guarded",
    readOnlyLabels: ["Repository summary inventory", "Issue summary inventory", "Pull request summary inventory", "Check summary inventory"],
    mutationLabels: ["Create comment", "Create branch", "Open pull request", "Merge change", "Create release"],
    credentialSummary: "Future GitHub access requires a governed credential reference and repository scope model.",
    dataSummary: "Only redacted repository, issue, pull request, and check summaries are acceptable future read data.",
    actionSummary: "Comments, branches, pull requests, merges, and releases require future approval gates.",
    sandboxSummary: "Future GitHub use requires repository scoping, redacted audit metadata, and default-deny writes.",
    exclusions: ["No GitHub remote write is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "browser",
    category: "browser_computer_use",
    name: "Browser connector taxonomy",
    summary: "Future browser connector metadata for page visibility and guarded interaction planning.",
    currentStatus: "Future-only; browser interaction remains outside this taxonomy.",
    riskTier: "high",
    maturityStage: "deferred_until_prerequisites",
    readOnlyLabels: ["Page metadata summary"],
    mutationLabels: ["Click element", "Type text", "Navigate page", "Submit form"],
    credentialSummary: "Future browser use may require session policy metadata, never session material.",
    dataSummary: "Only redacted page metadata is acceptable future read data.",
    actionSummary: "Click, type, navigate, and submit actions require future approval and sandbox gates.",
    sandboxSummary: "Future browser use requires an isolated sandbox, domain allowlist, and default-deny interaction.",
    exclusions: ["No browser interaction is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "filesystem_safe",
    category: "local_system",
    name: "Filesystem safe connector taxonomy",
    summary: "Future local filesystem connector metadata for safe metadata previews and gated changes.",
    currentStatus: "Future-only; this taxonomy performs no local file inspection.",
    riskTier: "high",
    maturityStage: "deferred_until_prerequisites",
    readOnlyLabels: ["File metadata preview"],
    mutationLabels: ["Create file", "Delete file", "Move file", "Rename file"],
    credentialSummary: "Future local filesystem access requires an approved root and policy reference.",
    dataSummary: "Only bounded file metadata is acceptable future read data; full content is denied by default.",
    actionSummary: "File creation, deletion, movement, and rename operations require future approval gates.",
    sandboxSummary: "Future filesystem use requires approved roots, path normalization, and default-deny mutation.",
    exclusions: ["No filesystem inspection or mutation is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "terminal_safe",
    category: "local_system",
    name: "Terminal safe connector taxonomy",
    summary: "Future terminal connector metadata for command plan review and strict approval gates.",
    currentStatus: "Future-only; this taxonomy performs no command behavior.",
    riskTier: "critical",
    maturityStage: "deferred_until_prerequisites",
    readOnlyLabels: ["Command plan metadata"],
    mutationLabels: ["Run command"],
    credentialSummary: "Future terminal use requires local policy metadata and scoped operator approval.",
    dataSummary: "Only command plan metadata is acceptable future read data.",
    actionSummary: "Any command behavior requires future explicit approval, allowlists, and audit metadata.",
    sandboxSummary: "Future terminal use requires strict sandboxing, allowlists, and default-deny behavior.",
    exclusions: ["No terminal behavior is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "external_apis",
    category: "external_api",
    name: "External APIs connector taxonomy",
    summary: "Future generic external service connector metadata for endpoint governance.",
    currentStatus: "Future-only; no external service connector is implemented by this taxonomy.",
    riskTier: "high",
    maturityStage: "deferred_until_prerequisites",
    readOnlyLabels: ["Endpoint summary inventory", "Response summary policy"],
    mutationLabels: ["Create remote record", "Update remote record", "Delete remote record"],
    credentialSummary: "Future external service access requires governed credential references and scope policy.",
    dataSummary: "Only redacted endpoint and response summaries are acceptable future read data.",
    actionSummary: "Remote create, update, and delete actions require future approval gates.",
    sandboxSummary: "Future external service use requires rate limits, retries, redaction, and default-deny writes.",
    exclusions: ["No external service operation is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "whatsapp",
    category: "communications",
    name: "WhatsApp connector taxonomy",
    summary: "Connector metadata for existing live-adjacent WhatsApp surfaces and future governance.",
    currentStatus: "Live-adjacent bridge surfaces exist elsewhere; this taxonomy does not import or invoke them.",
    riskTier: "high",
    maturityStage: "live_adjacent_guarded",
    readOnlyLabels: ["Inbound summary inventory", "Channel status summary"],
    mutationLabels: ["Send message", "Reply to message", "Dispatch action request"],
    credentialSummary: "Future WhatsApp access requires governed hook and channel credential references.",
    dataSummary: "Only redacted inbound and status summaries are acceptable future read data.",
    actionSummary: "Message sending and action dispatch require future approval and channel gates.",
    sandboxSummary: "Future WhatsApp use requires channel identity review, rate limits, and default-deny outbound actions.",
    exclusions: ["No WhatsApp send or dispatch behavior is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "omi_voice",
    category: "communications",
    name: "Omi voice connector taxonomy",
    summary: "Connector metadata for existing live-adjacent voice surfaces and future governance.",
    currentStatus: "Live-adjacent voice surfaces exist elsewhere; this taxonomy does not import or invoke them.",
    riskTier: "high",
    maturityStage: "live_adjacent_guarded",
    readOnlyLabels: ["Transcript summary inventory", "Action item summary inventory"],
    mutationLabels: ["Create proposal request", "Route action request"],
    credentialSummary: "Future voice access requires governed channel and webhook credential references.",
    dataSummary: "Only redacted transcript and action-item summaries are acceptable future read data.",
    actionSummary: "Proposal or action routing requires future approval and channel gates.",
    sandboxSummary: "Future voice use requires channel identity review, redaction, and default-deny action routing.",
    exclusions: ["No voice-originated action behavior is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "openclaw_computer_use",
    category: "browser_computer_use",
    name: "OpenClaw and computer-use connector taxonomy",
    summary: "Connector metadata for existing live-adjacent computer-use surfaces and future governance.",
    currentStatus: "Live-adjacent client surfaces exist elsewhere; this taxonomy does not import or invoke them.",
    riskTier: "critical",
    maturityStage: "live_adjacent_guarded",
    readOnlyLabels: ["Capability summary inventory", "Dry-run summary inventory"],
    mutationLabels: ["Invoke tool", "Perform computer action"],
    credentialSummary: "Future computer-use access requires governed gateway references and capability scopes.",
    dataSummary: "Only redacted capability and dry-run summaries are acceptable future read data.",
    actionSummary: "Tool invocation and computer actions require future approval, sandbox, and audit gates.",
    sandboxSummary: "Future computer-use requires an isolated sandbox, visual redaction, and default-deny actions.",
    exclusions: ["No computer-use operation is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "payments",
    category: "finance",
    name: "Payments connector taxonomy",
    summary: "Future payments connector metadata for highly gated financial operation planning.",
    currentStatus: "Future-only; no payments connector is implemented by this taxonomy.",
    riskTier: "critical",
    maturityStage: "deferred_until_prerequisites",
    readOnlyLabels: ["Payment status metadata"],
    mutationLabels: ["Create payment", "Transfer funds", "Refund payment"],
    credentialSummary: "Future payments access requires governed credential references and finance approval policy.",
    dataSummary: "Only redacted payment status metadata is acceptable future read data.",
    actionSummary: "Payment, transfer, and refund operations require future multi-step approval gates.",
    sandboxSummary: "Future payments use requires strict sandboxing, finance review, and default-deny operations.",
    exclusions: ["No payment operation is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "billing_invoicing",
    category: "finance",
    name: "Billing and invoicing connector taxonomy",
    summary: "Future billing connector metadata for invoice and customer summary governance.",
    currentStatus: "Future-only; no billing connector is implemented by this taxonomy.",
    riskTier: "critical",
    maturityStage: "deferred_until_prerequisites",
    readOnlyLabels: ["Customer summary inventory", "Invoice summary inventory"],
    mutationLabels: ["Create invoice", "Send invoice", "Charge customer", "Refund invoice"],
    credentialSummary: "Future billing access requires governed credential references and finance approval policy.",
    dataSummary: "Only redacted customer and invoice summaries are acceptable future read data.",
    actionSummary: "Invoice, charge, and refund operations require future approval gates.",
    sandboxSummary: "Future billing use requires finance review, redaction, and default-deny operations.",
    exclusions: ["No billing operation is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "sso",
    category: "identity",
    name: "SSO connector taxonomy",
    summary: "Future identity connector metadata for subject, role, and group governance.",
    currentStatus: "Future-only; no identity connector is implemented by this taxonomy.",
    riskTier: "critical",
    maturityStage: "deferred_until_prerequisites",
    readOnlyLabels: ["Identity metadata summary", "Role summary inventory", "Group summary inventory"],
    mutationLabels: ["Change identity access", "Change group membership", "Change role policy"],
    credentialSummary: "Future identity access requires governed identity-provider credential references.",
    dataSummary: "Only redacted identity, role, and group summaries are acceptable future read data.",
    actionSummary: "Identity, role, and group changes require future approval and audit gates.",
    sandboxSummary: "Future identity use requires strict isolation, administrative review, and default-deny operations.",
    exclusions: ["No identity-provider operation is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "bi_tools",
    category: "bi",
    name: "BI tools connector taxonomy",
    summary: "Future BI connector metadata for report and dataset summary governance.",
    currentStatus: "Future-only; no BI connector is implemented by this taxonomy.",
    riskTier: "high",
    maturityStage: "deferred_until_prerequisites",
    readOnlyLabels: ["Report summary inventory", "Dataset summary inventory"],
    mutationLabels: ["Refresh dataset", "Share report", "Export report", "Write dashboard metadata"],
    credentialSummary: "Future BI access requires governed workspace credential references and report scopes.",
    dataSummary: "Only redacted report and dataset summaries are acceptable future read data.",
    actionSummary: "Refresh, share, export, and write operations require future approval gates.",
    sandboxSummary: "Future BI use requires workspace scoping, redaction, and default-deny mutations.",
    exclusions: ["No BI remote operation is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "accounting_systems",
    category: "accounting",
    name: "Accounting systems connector taxonomy",
    summary: "Future accounting connector metadata for ledger and report summary governance.",
    currentStatus: "Future-only; no accounting connector is implemented by this taxonomy.",
    riskTier: "critical",
    maturityStage: "deferred_until_prerequisites",
    readOnlyLabels: ["Ledger summary inventory", "Financial report summary inventory"],
    mutationLabels: ["Post ledger entry", "Reconcile account", "Adjust financial record"],
    credentialSummary: "Future accounting access requires governed credential references and finance approval policy.",
    dataSummary: "Only redacted ledger and report summaries are acceptable future read data.",
    actionSummary: "Posting, reconciliation, and adjustment operations require future approval gates.",
    sandboxSummary: "Future accounting use requires finance review, redaction, and default-deny operations.",
    exclusions: ["No accounting operation is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "erp_apis",
    category: "erp",
    name: "ERP APIs connector taxonomy",
    summary: "Future ERP connector metadata for operational summary governance.",
    currentStatus: "Future-only; no ERP connector is implemented by this taxonomy.",
    riskTier: "critical",
    maturityStage: "deferred_until_prerequisites",
    readOnlyLabels: ["Order summary inventory", "Inventory summary inventory", "Procurement summary inventory"],
    mutationLabels: ["Fulfill order", "Post ERP record", "Adjust inventory", "Approve procurement"],
    credentialSummary: "Future ERP access requires governed credential references and operational approval policy.",
    dataSummary: "Only redacted order, inventory, and procurement summaries are acceptable future read data.",
    actionSummary: "Fulfillment, posting, adjustment, and approval operations require future approval gates.",
    sandboxSummary: "Future ERP use requires operational review, redaction, and default-deny mutations.",
    exclusions: ["No ERP remote operation is implemented or enabled in Phase 94I."],
  },
  {
    connectorId: "crm_apis",
    category: "crm",
    name: "CRM APIs connector taxonomy",
    summary: "Future CRM connector metadata for contact, account, and opportunity governance.",
    currentStatus: "Future-only; no CRM connector is implemented by this taxonomy.",
    riskTier: "high",
    maturityStage: "deferred_until_prerequisites",
    readOnlyLabels: ["Contact summary inventory", "Account summary inventory", "Opportunity summary inventory"],
    mutationLabels: ["Update CRM record", "Delete CRM record", "Send CRM email", "Create CRM task"],
    credentialSummary: "Future CRM access requires governed credential references and customer data scopes.",
    dataSummary: "Only redacted contact, account, and opportunity summaries are acceptable future read data.",
    actionSummary: "Record updates, deletion, email, and task creation require future approval gates.",
    sandboxSummary: "Future CRM use requires customer-data redaction, approval gates, and default-deny outbound actions.",
    exclusions: ["No CRM remote operation is implemented or enabled in Phase 94I."],
  },
];

export const connectorTaxonomyTemplates: ConnectorTaxonomyEntry[] = connectorSeeds.map(createEntry);

export const listConnectorTaxonomyTemplates = (): ConnectorTaxonomyEntry[] =>
  connectorTaxonomyTemplates.map((entry) => ({
    ...entry,
    capabilities: entry.capabilities.map((item) => ({ ...item })),
    readOnlyCapabilities: entry.readOnlyCapabilities.map((item) => ({ ...item })),
    mutationCapabilities: entry.mutationCapabilities.map((item) => ({ ...item })),
    permissionScopes: entry.permissionScopes.map((item) => ({ ...item })),
    credentialRequirements: entry.credentialRequirements.map((item) => ({ ...item })),
    dataAccessScopes: entry.dataAccessScopes.map((item) => ({ ...item })),
    actionScopes: entry.actionScopes.map((item) => ({ ...item })),
    rateLimitPlan: { ...entry.rateLimitPlan },
    retryPlan: { ...entry.retryPlan },
    auditPlan: { ...entry.auditPlan },
    dryRunPlan: { ...entry.dryRunPlan },
    approvalGate: { ...entry.approvalGate },
    sandboxPlan: { ...entry.sandboxPlan },
    redactionRules: entry.redactionRules.map((item) => ({
      ...item,
      deniedRawData: item.deniedRawData.slice(),
    })),
    assumptions: entry.assumptions.slice(),
    exclusions: entry.exclusions.slice(),
    boundaries: { ...entry.boundaries },
  }));
