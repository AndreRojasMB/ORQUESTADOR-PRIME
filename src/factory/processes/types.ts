import type { BusinessSystemFamilyId } from "../catalog/types.js";

export type BusinessProcessSchemaVersion = "1.0";

export type BusinessProcessId = string;

export type BusinessProcessCategory =
  | "sales_order"
  | "procurement"
  | "inventory_movement"
  | "maintenance_work_order"
  | "incident_ticket"
  | "access_request"
  | "approval"
  | "reporting_closing"
  | "generic";

export type BusinessProcessConfidence = "low" | "medium" | "high";

export type BusinessProcessValidationStatus = "pass" | "warn" | "fail";

export type BusinessProcessBoundarySet = {
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
  noStoreMutation: true;
  noActionDispatch: true;
  noProposalCreation: true;
  noApprovalExecution: true;
  noScaffolding: true;
  noDbSchemas: true;
  noGeneratedSystems: true;
  noProductionReadinessClaims: true;
  noComplianceGuarantees: true;
};

export type ProcessRole = {
  roleId: string;
  name: string;
  responsibility: string;
  decisionRights: string[];
};

export type ProcessActor = {
  actorId: string;
  roleId: string;
  name: string;
  description: string;
};

export type ProcessState = {
  stateId: string;
  name: string;
  description: string;
  kind: "initial" | "active" | "waiting" | "exception" | "final";
};

export type ProcessTransition = {
  transitionId: string;
  fromStateId: string;
  toStateId: string;
  name: string;
  trigger: string;
  guardrails: string[];
};

export type ProcessApproval = {
  approvalId: string;
  name: string;
  requiredRoleIds: string[];
  requiredActorIds: string[];
  appliesToTransitionIds: string[];
  advisoryOnly: true;
  previewNotes: string[];
};

export type ProcessRule = {
  ruleId: string;
  name: string;
  safeSummary: string;
  source: "catalog" | "template" | "input" | "planner";
};

export type ProcessSla = {
  slaId: string;
  name: string;
  expectation: string;
  assumptionBased: true;
  escalationNotes: string[];
};

export type ProcessException = {
  exceptionId: string;
  name: string;
  safeSummary: string;
  handlingNotes: string[];
  riskLevel: "low" | "medium" | "high";
};

export type ProcessEvent = {
  eventId: string;
  name: string;
  safeSummary: string;
  sourceStateId?: string;
  targetStateId?: string;
};

export type ProcessHandoff = {
  handoffId: string;
  fromRoleId: string;
  toRoleId: string;
  safeSummary: string;
  checkpointIds: string[];
};

export type ProcessCheckpoint = {
  checkpointId: string;
  name: string;
  safeSummary: string;
  auditNotes: string[];
};

export type ProcessRisk = {
  riskId: string;
  title: string;
  safeSummary: string;
  severity: "low" | "medium" | "high";
  mitigation: string;
};

export type ProcessMetric = {
  metricId: string;
  name: string;
  safeSummary: string;
  advisoryOnly: true;
};

export type ProcessAlignmentNote = {
  alignmentId: string;
  target: "module_blueprint" | "planning" | "automation_future";
  safeSummary: string;
  advisoryOnly: true;
  futureOnly?: boolean;
};

export type ProcessMaturityNotes = {
  mvp: string[];
  enterprise: string[];
  deferred: string[];
};

export type BusinessProcessModel = {
  processId: BusinessProcessId;
  schemaVersion: BusinessProcessSchemaVersion;
  category: BusinessProcessCategory;
  name: string;
  purpose: string;
  familyId?: BusinessSystemFamilyId;
  moduleIds: string[];
  roles: ProcessRole[];
  actors: ProcessActor[];
  states: ProcessState[];
  transitions: ProcessTransition[];
  approvals: ProcessApproval[];
  rules: ProcessRule[];
  slaAssumptions: ProcessSla[];
  exceptions: ProcessException[];
  events: ProcessEvent[];
  handoffs: ProcessHandoff[];
  checkpoints: ProcessCheckpoint[];
  metrics: ProcessMetric[];
  risks: ProcessRisk[];
  moduleAlignment: ProcessAlignmentNote[];
  planningAlignment: ProcessAlignmentNote[];
  automationAlignment: ProcessAlignmentNote[];
  maturityNotes: ProcessMaturityNotes;
  assumptions: string[];
  exclusions: string[];
  confidence: BusinessProcessConfidence;
  advisoryOnly: true;
  boundaries: BusinessProcessBoundarySet;
};

export type BusinessProcessModelInput = {
  category: BusinessProcessCategory;
  familyId?: BusinessSystemFamilyId;
  moduleIds?: string[];
  processName?: string;
  assumptions?: string[];
  exclusions?: string[];
  confidence?: BusinessProcessConfidence;
};

export type BusinessProcessModelResultStatus =
  | "model_built"
  | "template_found"
  | "category_not_found"
  | "invalid";

export type BusinessProcessValidationFinding = {
  id: string;
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  path?: string;
  processId?: string;
  category?: BusinessProcessCategory;
  metadata?: Record<string, string | number | boolean>;
};

export type BusinessProcessModelResult = {
  ok: boolean;
  status: BusinessProcessModelResultStatus;
  model?: BusinessProcessModel;
  models?: BusinessProcessModel[];
  warnings: BusinessProcessValidationFinding[];
  errors: BusinessProcessValidationFinding[];
  advisoryOnly: true;
  boundaries: BusinessProcessBoundarySet;
};

export type BusinessProcessValidationResult = {
  validationId: string;
  createdAt: string;
  schemaVersion: BusinessProcessSchemaVersion;
  valid: boolean;
  status: BusinessProcessValidationStatus;
  modelCount: number;
  processIds: string[];
  warnings: BusinessProcessValidationFinding[];
  errors: BusinessProcessValidationFinding[];
  advisoryOnly: true;
  boundaries: BusinessProcessBoundarySet;
};
