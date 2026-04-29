export type TransactionalSchemaVersion = "1.0";

export type TransactionalDomainId = string;

export type TransactionalDomainCategory =
  | "sales_order_transaction"
  | "procurement_transaction"
  | "inventory_movement_transaction"
  | "payment_billing_transaction"
  | "finance_closing_transaction"
  | "maintenance_work_order_transaction"
  | "incident_ticket_transaction"
  | "access_request_audit_transaction"
  | "generic";

export type TransactionalConfidence = "low" | "medium" | "high";

export interface TransactionalBoundarySet {
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
  noTransactionExecution: true;
  noDbWrites: true;
  noSqlExecution: true;
  noStoreMutation: true;
  noActionDispatch: true;
  noProposalCreation: true;
  noApprovalExecution: true;
  noMigrations: true;
  noQueueWorkerGeneration: true;
  noLedgerGeneration: true;
  noScaffolding: true;
  noDbSchemas: true;
  noGeneratedSqlFiles: true;
  noGeneratedLedgers: true;
  noGeneratedQueuesOrWorkers: true;
  noGeneratedTransactionalSystems: true;
  noGeneratedSystems: true;
  noProductionReadinessClaims: true;
  noBankingFinancialComplianceGuarantees: true;
  noExactFinancialClaimsWithoutAssumptions: true;
}

export interface TransactionBoundary {
  boundaryId: string;
  name: string;
  safeSummary: string;
  includedStateIds: string[];
  assumptionBased: true;
  metadataOnly: true;
}

export interface ConsistencyModel {
  consistencyId: string;
  name: string;
  safeSummary: string;
  assumptions: string[];
  advisoryOnly: true;
}

export interface IdempotencyRule {
  idempotencyRuleId: string;
  name: string;
  safeSummary: string;
  appliesToTransitionIds: string[];
  assumptions: string[];
  advisoryOnly: true;
}

export interface RollbackStrategy {
  rollbackStrategyId: string;
  name: string;
  safeSummary: string;
  appliesToStateIds: string[];
  metadataOnly: true;
  notExecutable: true;
}

export interface CompensationStrategy {
  compensationStrategyId: string;
  name: string;
  safeSummary: string;
  triggerStateIds: string[];
  metadataOnly: true;
  notExecutable: true;
}

export interface ReconciliationRule {
  reconciliationRuleId: string;
  name: string;
  safeSummary: string;
  checkpointStateIds: string[];
  assumptionBased: true;
  advisoryOnly: true;
}

export interface ClosingPolicy {
  closingPolicyId: string;
  name: string;
  safeSummary: string;
  assumptionBased: true;
  notGuarantee: true;
}

export interface PostingPolicy {
  postingPolicyId: string;
  name: string;
  safeSummary: string;
  assumptionBased: true;
  notFinancialCorrectnessClaim: true;
}

export interface SettlementNote {
  settlementNoteId: string;
  name: string;
  safeSummary: string;
  assumptionBased: true;
  notFinancialCorrectnessClaim: true;
}

export interface AuditTrailRequirement {
  auditRequirementId: string;
  name: string;
  safeSummary: string;
  requiredEventIds: string[];
  advisoryOnly: true;
}

export interface TraceabilityRequirement {
  traceabilityRequirementId: string;
  name: string;
  safeSummary: string;
  linkedIds: string[];
  advisoryOnly: true;
}

export interface TransactionState {
  stateId: string;
  name: string;
  safeSummary: string;
  kind: "initial" | "active" | "review" | "exception" | "closed" | "final";
}

export interface TransactionTransition {
  transitionId: string;
  fromStateId: string;
  toStateId: string;
  name: string;
  trigger: string;
  guardrails: string[];
  metadataOnly: true;
}

export interface TransactionException {
  exceptionId: string;
  name: string;
  safeSummary: string;
  handlingNotes: string[];
  riskLevel: "low" | "medium" | "high";
}

export interface IntegrityControl {
  integrityControlId: string;
  name: string;
  safeSummary: string;
  controlType: "completeness" | "authorization" | "reconciliation" | "traceability" | "segregation" | "review";
  advisoryOnly: true;
}

export interface ConcurrencyRisk {
  concurrencyRiskId: string;
  title: string;
  safeSummary: string;
  severity: "low" | "medium" | "high";
  mitigation: string;
}

export interface TransactionalMetric {
  metricId: string;
  name: string;
  safeSummary: string;
  assumptions: string[];
  advisoryOnly: true;
}

export interface TransactionalAlignment {
  alignmentId: string;
  target:
    | "process"
    | "module_blueprint"
    | "reporting"
    | "planning"
    | "future_runtime_store_migration";
  safeSummary: string;
  advisoryOnly: true;
  futureOnly?: true;
}

export interface TransactionalMaturityNotes {
  mvp: string[];
  enterprise: string[];
  deferred: string[];
}

export interface TransactionalSystemModel {
  transactionalId: TransactionalDomainId;
  schemaVersion: TransactionalSchemaVersion;
  category: TransactionalDomainCategory;
  name: string;
  purpose: string;
  familyId?: string;
  processIds: string[];
  moduleIds: string[];
  reportingIds: string[];
  transactionBoundaries: TransactionBoundary[];
  consistencyModels: ConsistencyModel[];
  idempotencyRules: IdempotencyRule[];
  rollbackStrategies: RollbackStrategy[];
  compensationStrategies: CompensationStrategy[];
  reconciliationRules: ReconciliationRule[];
  closingPolicies: ClosingPolicy[];
  postingPolicies: PostingPolicy[];
  settlementNotes: SettlementNote[];
  auditTrailRequirements: AuditTrailRequirement[];
  traceabilityRequirements: TraceabilityRequirement[];
  states: TransactionState[];
  transitions: TransactionTransition[];
  exceptions: TransactionException[];
  integrityControls: IntegrityControl[];
  concurrencyRisks: ConcurrencyRisk[];
  metrics: TransactionalMetric[];
  processAlignment: TransactionalAlignment[];
  moduleAlignment: TransactionalAlignment[];
  reportingAlignment: TransactionalAlignment[];
  planningAlignment: TransactionalAlignment[];
  futureRuntimeStoreMigrationAlignment: TransactionalAlignment[];
  maturityNotes: TransactionalMaturityNotes;
  assumptions: string[];
  exclusions: string[];
  confidence: TransactionalConfidence;
  advisoryOnly: true;
  boundaries: TransactionalBoundarySet;
}

export interface TransactionalSystemInput {
  category: TransactionalDomainCategory | string;
  familyId?: string;
  processIds?: string[];
  moduleIds?: string[];
  reportingIds?: string[];
  transactionalName?: string;
  assumptions?: string[];
  exclusions?: string[];
  confidence?: TransactionalConfidence;
}

export interface TransactionalSystemResult {
  ok: boolean;
  status: "model_built" | "template_found" | "category_not_found" | "invalid";
  model?: TransactionalSystemModel;
  models?: TransactionalSystemModel[];
  warnings: TransactionalValidationFinding[];
  errors: TransactionalValidationFinding[];
  advisoryOnly: true;
  boundaries: TransactionalBoundarySet;
}

export interface TransactionalValidationFinding {
  id: string;
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  path?: string;
  category?: TransactionalDomainCategory;
  transactionalId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface TransactionalValidationResult {
  validationId: string;
  createdAt: string;
  schemaVersion: TransactionalSchemaVersion;
  valid: boolean;
  status: "pass" | "warn" | "fail";
  modelCount: number;
  warnings: TransactionalValidationFinding[];
  errors: TransactionalValidationFinding[];
  advisoryOnly: true;
  boundaries: TransactionalBoundarySet;
}
