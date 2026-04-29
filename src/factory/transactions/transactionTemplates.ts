import type {
  AuditTrailRequirement,
  ClosingPolicy,
  CompensationStrategy,
  ConcurrencyRisk,
  ConsistencyModel,
  IdempotencyRule,
  IntegrityControl,
  PostingPolicy,
  ReconciliationRule,
  RollbackStrategy,
  SettlementNote,
  TraceabilityRequirement,
  TransactionalAlignment,
  TransactionalBoundarySet,
  TransactionalConfidence,
  TransactionalDomainCategory,
  TransactionalMaturityNotes,
  TransactionalMetric,
  TransactionalSystemModel,
  TransactionBoundary,
  TransactionException,
  TransactionState,
  TransactionTransition,
} from "./types.js";

export const supportedTransactionalCategories = [
  "sales_order_transaction",
  "procurement_transaction",
  "inventory_movement_transaction",
  "payment_billing_transaction",
  "finance_closing_transaction",
  "maintenance_work_order_transaction",
  "incident_ticket_transaction",
  "access_request_audit_transaction",
  "generic",
] as const satisfies readonly TransactionalDomainCategory[];

export const transactionalBoundaries: TransactionalBoundarySet = {
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
  noTransactionExecution: true,
  noDbWrites: true,
  noSqlExecution: true,
  noStoreMutation: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noApprovalExecution: true,
  noMigrations: true,
  noQueueWorkerGeneration: true,
  noLedgerGeneration: true,
  noScaffolding: true,
  noDbSchemas: true,
  noGeneratedSqlFiles: true,
  noGeneratedLedgers: true,
  noGeneratedQueuesOrWorkers: true,
  noGeneratedTransactionalSystems: true,
  noGeneratedSystems: true,
  noProductionReadinessClaims: true,
  noBankingFinancialComplianceGuarantees: true,
  noExactFinancialClaimsWithoutAssumptions: true,
};

interface TransactionTemplateConfig {
  category: TransactionalDomainCategory;
  name: string;
  purpose: string;
  focus: string;
  initial: string;
  active: string;
  review: string;
  exception: string;
  closed: string;
  boundaryName: string;
  idempotencyFocus: string;
  reconciliationFocus: string;
  risk: string;
  includeClosing?: boolean;
  includePosting?: boolean;
  includeSettlement?: boolean;
  confidence?: TransactionalConfidence;
}

const idPart = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const state = (
  prefix: string,
  key: string,
  name: string,
  kind: TransactionState["kind"],
): TransactionState => ({
  stateId: `${prefix}:state:${key}`,
  name,
  safeSummary: `Advisory ${name.toLowerCase()} state for review only.`,
  kind,
});

const transition = (
  prefix: string,
  key: string,
  fromStateId: string,
  toStateId: string,
  name: string,
): TransactionTransition => ({
  transitionId: `${prefix}:transition:${key}`,
  fromStateId,
  toStateId,
  name,
  trigger: "Reviewed business event or stakeholder decision.",
  guardrails: [
    "Transition is metadata only and has no operational side effects.",
    "Human review is required before any implementation phase.",
  ],
  metadataOnly: true,
});

const boundary = (
  prefix: string,
  name: string,
  stateIds: string[],
): TransactionBoundary => ({
  boundaryId: `${prefix}:boundary:core`,
  name,
  safeSummary: "Defines the review scope of a transactional unit without running it.",
  includedStateIds: stateIds,
  assumptionBased: true,
  metadataOnly: true,
});

const consistency = (prefix: string, focus: string): ConsistencyModel => ({
  consistencyId: `${prefix}:consistency:review`,
  name: "Consistency review model",
  safeSummary: `Review consistency expectations for ${focus} before implementation.`,
  assumptions: [
    "Consistency model is advisory and depends on future persistence architecture choices.",
    "No durable record or lock behavior is created by this model.",
  ],
  advisoryOnly: true,
});

const idempotency = (
  prefix: string,
  focus: string,
  transitionIds: string[],
): IdempotencyRule => ({
  idempotencyRuleId: `${prefix}:idempotency:submission`,
  name: `${focus} idempotency review`,
  safeSummary: "Describe duplicate-submission prevention as metadata only.",
  appliesToTransitionIds: transitionIds,
  assumptions: [
    "Idempotency key design remains future implementation work.",
    "No request, record, background work item, or business event is created.",
  ],
  advisoryOnly: true,
});

const rollback = (
  prefix: string,
  stateIds: string[],
): RollbackStrategy => ({
  rollbackStrategyId: `${prefix}:rollback:review`,
  name: "Rollback review strategy",
  safeSummary: "Describe review questions for reversing or pausing a failed path.",
  appliesToStateIds: stateIds,
  metadataOnly: true,
  notExecutable: true,
});

const compensation = (
  prefix: string,
  stateIds: string[],
): CompensationStrategy => ({
  compensationStrategyId: `${prefix}:compensation:review`,
  name: "Compensation review strategy",
  safeSummary: "Describe possible business compensation steps without executing them.",
  triggerStateIds: stateIds,
  metadataOnly: true,
  notExecutable: true,
});

const reconciliation = (
  prefix: string,
  focus: string,
  stateIds: string[],
): ReconciliationRule => ({
  reconciliationRuleId: `${prefix}:reconciliation:review`,
  name: `${focus} reconciliation review`,
  safeSummary: "Describe reconciliation checkpoints and owner questions as assumptions.",
  checkpointStateIds: stateIds,
  assumptionBased: true,
  advisoryOnly: true,
});

const closing = (prefix: string): ClosingPolicy => ({
  closingPolicyId: `${prefix}:closing:review`,
  name: "Closing policy review",
  safeSummary: "Describe cut-off and close review expectations without guaranteeing correctness.",
  assumptionBased: true,
  notGuarantee: true,
});

const posting = (prefix: string): PostingPolicy => ({
  postingPolicyId: `${prefix}:posting:review`,
  name: "Posting policy review",
  safeSummary: "Describe posting concepts as advisory metadata, not financial correctness.",
  assumptionBased: true,
  notFinancialCorrectnessClaim: true,
});

const settlement = (prefix: string): SettlementNote => ({
  settlementNoteId: `${prefix}:settlement:review`,
  name: "Settlement review note",
  safeSummary: "Describe settlement review questions without executing payments or claiming correctness.",
  assumptionBased: true,
  notFinancialCorrectnessClaim: true,
});

const audit = (prefix: string, stateIds: string[]): AuditTrailRequirement => ({
  auditRequirementId: `${prefix}:audit:trace`,
  name: "Audit trail review",
  safeSummary: "Identify transaction points that need traceability metadata.",
  requiredEventIds: stateIds,
  advisoryOnly: true,
});

const traceability = (prefix: string, linkedIds: string[]): TraceabilityRequirement => ({
  traceabilityRequirementId: `${prefix}:traceability:review`,
  name: "Traceability review",
  safeSummary: "Describe links between request, review, exception, and closure metadata.",
  linkedIds,
  advisoryOnly: true,
});

const exception = (
  prefix: string,
  focus: string,
  severity: TransactionException["riskLevel"],
): TransactionException => ({
  exceptionId: `${prefix}:exception:review`,
  name: `${focus} exception path`,
  safeSummary: "Represent mismatch, cancellation, or unresolved review paths.",
  handlingNotes: [
    "Exception handling is advisory and requires owner review.",
    "No automated correction or transaction behavior is created.",
  ],
  riskLevel: severity,
});

const integrity = (
  prefix: string,
  type: IntegrityControl["controlType"],
): IntegrityControl => ({
  integrityControlId: `${prefix}:integrity:${type}`,
  name: `${type} review control`,
  safeSummary: "Describe a data integrity control as review metadata only.",
  controlType: type,
  advisoryOnly: true,
});

const concurrency = (
  prefix: string,
  title: string,
  severity: ConcurrencyRisk["severity"],
): ConcurrencyRisk => ({
  concurrencyRiskId: `${prefix}:concurrency:review`,
  title,
  safeSummary: "Concurrent review or update paths may create conflicting business state.",
  severity,
  mitigation: "Require future lock, version, or owner-review design before implementation.",
});

const metric = (prefix: string, focus: string): TransactionalMetric => ({
  metricId: `${prefix}:metric:review`,
  name: `${focus} transaction review metric`,
  safeSummary: "Track reviewable transaction states, exceptions, or reconciliation points.",
  assumptions: [
    "Metric definitions are advisory and do not inspect or calculate live values.",
  ],
  advisoryOnly: true,
});

const alignment = (
  prefix: string,
  target: TransactionalAlignment["target"],
  safeSummary: string,
  futureOnly = false,
): TransactionalAlignment => ({
  alignmentId: `${prefix}:alignment:${target}`,
  target,
  safeSummary,
  advisoryOnly: true,
  ...(futureOnly ? { futureOnly: true } : {}),
});

const maturity = (focus: string): TransactionalMaturityNotes => ({
  mvp: [`Start with a reviewed ${focus} path, explicit assumptions, and exception visibility.`],
  enterprise: [
    "Add stronger reconciliation review, traceability, approval checkpoints, and concurrency controls.",
  ],
  deferred: [
    "Operational behavior, persistence changes, query language artifacts, version-change paths, journal artifacts, background processing, and system creation are deferred.",
  ],
});

const model = (config: TransactionTemplateConfig): TransactionalSystemModel => {
  const prefix = idPart(config.category);
  const initialState = state(prefix, "initial", config.initial, "initial");
  const activeState = state(prefix, "active", config.active, "active");
  const reviewState = state(prefix, "review", config.review, "review");
  const exceptionState = state(prefix, "exception", config.exception, "exception");
  const closedState = state(prefix, "closed", config.closed, "closed");
  const states = [initialState, activeState, reviewState, exceptionState, closedState];
  const transitions = [
    transition(prefix, "start", initialState.stateId, activeState.stateId, "Start review path"),
    transition(prefix, "review", activeState.stateId, reviewState.stateId, "Move to review"),
    transition(prefix, "close", reviewState.stateId, closedState.stateId, "Close after review"),
    transition(prefix, "exception", activeState.stateId, exceptionState.stateId, "Route exception"),
    transition(prefix, "exception-reviewed", exceptionState.stateId, reviewState.stateId, "Return from exception review"),
  ];
  const transitionIds = transitions.map((item) => item.transitionId);
  const stateIds = states.map((item) => item.stateId);
  const reviewStateIds = [reviewState.stateId, exceptionState.stateId];

  return {
    transactionalId: `transactional:${prefix}`,
    schemaVersion: "1.0",
    category: config.category,
    name: config.name,
    purpose: config.purpose,
    processIds: [],
    moduleIds: [],
    reportingIds: [],
    transactionBoundaries: [boundary(prefix, config.boundaryName, stateIds)],
    consistencyModels: [consistency(prefix, config.focus)],
    idempotencyRules: [idempotency(prefix, config.idempotencyFocus, transitionIds.slice(0, 2))],
    rollbackStrategies: [rollback(prefix, reviewStateIds)],
    compensationStrategies: [compensation(prefix, [exceptionState.stateId])],
    reconciliationRules: [reconciliation(prefix, config.reconciliationFocus, reviewStateIds)],
    closingPolicies: config.includeClosing ? [closing(prefix)] : [],
    postingPolicies: config.includePosting ? [posting(prefix)] : [],
    settlementNotes: config.includeSettlement ? [settlement(prefix)] : [],
    auditTrailRequirements: [audit(prefix, stateIds)],
    traceabilityRequirements: [traceability(prefix, [...stateIds, ...transitionIds.slice(0, 2)])],
    states,
    transitions,
    exceptions: [exception(prefix, config.focus, config.category === "generic" ? "medium" : "high")],
    integrityControls: [
      integrity(prefix, "completeness"),
      integrity(prefix, "traceability"),
      integrity(prefix, "reconciliation"),
    ],
    concurrencyRisks: [concurrency(prefix, config.risk, config.category === "generic" ? "medium" : "high")],
    metrics: [metric(prefix, config.focus)],
    processAlignment: [
      alignment(prefix, "process", "Process states and checkpoints can be compared with transactional states."),
    ],
    moduleAlignment: [
      alignment(prefix, "module_blueprint", "Module responsibilities can be compared with transaction boundaries."),
    ],
    reportingAlignment: [
      alignment(prefix, "reporting", "Reporting models can compare metrics and traceability needs."),
    ],
    planningAlignment: [
      alignment(prefix, "planning", "Planning can treat transactional maturity as risk and scope metadata."),
    ],
    futureRuntimeStoreMigrationAlignment: [
      alignment(
        prefix,
        "future_runtime_store_migration",
        "Future durability architecture alignment remains metadata only.",
        true,
      ),
    ],
    maturityNotes: maturity(config.focus),
    assumptions: [
      "Transactional metadata requires business, technical, and audit review before implementation.",
      "No exact financial or business value is produced by this model.",
    ],
    exclusions: [
      "No operational transaction path, durable record change, query artifact, version-change path, journal artifact, background processor, action, proposal, or scaffold is created.",
    ],
    confidence: config.confidence ?? "medium",
    advisoryOnly: true,
    boundaries: transactionalBoundaries,
  };
};

export const transactionalTemplates: readonly TransactionalSystemModel[] = [
  model({
    category: "sales_order_transaction",
    name: "Sales order transactional model",
    purpose: "Represent order intake, review, fulfillment handoff, invoice handoff, and cancellation/exception metadata.",
    focus: "sales order",
    initial: "Order intake",
    active: "Order validation",
    review: "Fulfillment and invoice review",
    exception: "Cancellation or order exception",
    closed: "Order path closed",
    boundaryName: "Sales order review boundary",
    idempotencyFocus: "order submission",
    reconciliationFocus: "order, fulfillment, and invoice status",
    risk: "Order status can diverge across fulfillment and billing review.",
    includePosting: true,
  }),
  model({
    category: "procurement_transaction",
    name: "Procurement transactional model",
    purpose: "Represent request, approval checkpoint, purchase handoff, receiving, mismatch, and reconciliation metadata.",
    focus: "procurement",
    initial: "Purchase request",
    active: "Approval and purchase handoff",
    review: "Receiving review",
    exception: "Receiving mismatch exception",
    closed: "Procurement path closed",
    boundaryName: "Procurement review boundary",
    idempotencyFocus: "purchase request submission",
    reconciliationFocus: "request, receiving, and invoice matching",
    risk: "Receiving and invoice context can diverge without reviewed checkpoints.",
    includePosting: true,
  }),
  model({
    category: "inventory_movement_transaction",
    name: "Inventory movement transactional model",
    purpose: "Represent movement request, validation, advisory posting concept, reconciliation, audit, and concurrency risks.",
    focus: "inventory movement",
    initial: "Movement request",
    active: "Movement validation",
    review: "Movement reconciliation",
    exception: "Stock variance exception",
    closed: "Movement path closed",
    boundaryName: "Inventory movement review boundary",
    idempotencyFocus: "movement request",
    reconciliationFocus: "stock movement and adjustment context",
    risk: "Concurrent stock adjustments can distort reviewed inventory state.",
    includePosting: true,
  }),
  model({
    category: "payment_billing_transaction",
    name: "Payment and billing advisory transactional model",
    purpose: "Represent billing and payment review metadata without payment execution or financial correctness claims.",
    focus: "payment and billing",
    initial: "Billing request",
    active: "Billing review",
    review: "Payment reconciliation review",
    exception: "Payment or billing exception",
    closed: "Billing path closed",
    boundaryName: "Payment and billing review boundary",
    idempotencyFocus: "billing request",
    reconciliationFocus: "billing, payment, and audit context",
    risk: "Payment and billing assumptions can be mistaken for financial correctness.",
    includePosting: true,
    includeSettlement: true,
  }),
  model({
    category: "finance_closing_transaction",
    name: "Finance closing transactional model",
    purpose: "Represent cut-off, reconciliation, review, closing policy, and exception metadata.",
    focus: "finance closing",
    initial: "Cut-off preparation",
    active: "Closing reconciliation",
    review: "Closing review",
    exception: "Closing exception",
    closed: "Closing path closed",
    boundaryName: "Finance closing review boundary",
    idempotencyFocus: "closing package preparation",
    reconciliationFocus: "cut-off and closing review context",
    risk: "Closing assumptions can be misread as financial correctness.",
    includeClosing: true,
    includePosting: true,
  }),
  model({
    category: "maintenance_work_order_transaction",
    name: "Maintenance work-order transactional model",
    purpose: "Represent request, triage, assignment, work checkpoint, closure, and escalation metadata.",
    focus: "maintenance work-order",
    initial: "Work request",
    active: "Triage and assignment",
    review: "Work checkpoint review",
    exception: "Escalation exception",
    closed: "Work-order path closed",
    boundaryName: "Maintenance work-order review boundary",
    idempotencyFocus: "work request",
    reconciliationFocus: "work completion and checkpoint context",
    risk: "Work status can drift when handoffs are not traceable.",
  }),
  model({
    category: "incident_ticket_transaction",
    name: "Incident and ticket transactional model",
    purpose: "Represent intake, severity classification, triage, assignment, resolution, closure, and traceability metadata.",
    focus: "incident ticket",
    initial: "Incident intake",
    active: "Severity and triage",
    review: "Resolution review",
    exception: "Escalation exception",
    closed: "Ticket path closed",
    boundaryName: "Incident ticket review boundary",
    idempotencyFocus: "ticket intake",
    reconciliationFocus: "severity, handoff, resolution, and closure context",
    risk: "Incident state can become unclear across support handoffs.",
  }),
  model({
    category: "access_request_audit_transaction",
    name: "Access request and audit transactional model",
    purpose: "Represent request, owner approval, provisioning metadata, review, revoke path, and audit traceability.",
    focus: "access request audit",
    initial: "Access request",
    active: "Owner review",
    review: "Provisioning metadata review",
    exception: "Access exception",
    closed: "Access path closed",
    boundaryName: "Access request review boundary",
    idempotencyFocus: "access request",
    reconciliationFocus: "request, approval, review, and revoke context",
    risk: "Access metadata can be confused with permission enforcement.",
  }),
  model({
    category: "generic",
    name: "Generic transactional model",
    purpose: "Represent a safe starter transactional review model with assumptions and exclusions.",
    focus: "generic transaction",
    initial: "Request intake",
    active: "Review in progress",
    review: "Review checkpoint",
    exception: "Exception path",
    closed: "Transaction path closed",
    boundaryName: "Generic transaction review boundary",
    idempotencyFocus: "request intake",
    reconciliationFocus: "request and closure context",
    risk: "Generic transactional scope needs domain review before implementation.",
    confidence: "low",
  }),
];

const cloneModel = (template: TransactionalSystemModel): TransactionalSystemModel =>
  JSON.parse(JSON.stringify(template)) as TransactionalSystemModel;

export const listTransactionalTemplates = (): TransactionalSystemModel[] =>
  transactionalTemplates.map(cloneModel);
