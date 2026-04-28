import type {
  BusinessProcessCategory,
  BusinessProcessConfidence,
  BusinessProcessModel,
  BusinessProcessBoundarySet,
  ProcessActor,
  ProcessAlignmentNote,
  ProcessApproval,
  ProcessCheckpoint,
  ProcessEvent,
  ProcessException,
  ProcessHandoff,
  ProcessMetric,
  ProcessMaturityNotes,
  ProcessRisk,
  ProcessRole,
  ProcessRule,
  ProcessSla,
  ProcessState,
  ProcessTransition,
} from "./types.js";

export const supportedBusinessProcessCategories = [
  "sales_order",
  "procurement",
  "inventory_movement",
  "maintenance_work_order",
  "incident_ticket",
  "access_request",
  "approval",
  "reporting_closing",
  "generic",
] as const satisfies readonly BusinessProcessCategory[];

export const businessProcessBoundaries: BusinessProcessBoundarySet = {
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
  noStoreMutation: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noApprovalExecution: true,
  noScaffolding: true,
  noDbSchemas: true,
  noGeneratedSystems: true,
  noProductionReadinessClaims: true,
  noComplianceGuarantees: true,
};

const role = (
  roleId: string,
  name: string,
  responsibility: string,
  decisionRights: string[],
): ProcessRole => ({
  roleId,
  name,
  responsibility,
  decisionRights,
});

const actor = (
  actorId: string,
  roleId: string,
  name: string,
  description: string,
): ProcessActor => ({
  actorId,
  roleId,
  name,
  description,
});

const state = (
  stateId: string,
  name: string,
  description: string,
  kind: ProcessState["kind"],
): ProcessState => ({
  stateId,
  name,
  description,
  kind,
});

const transition = (
  transitionId: string,
  fromStateId: string,
  toStateId: string,
  name: string,
  trigger: string,
  guardrails: string[],
): ProcessTransition => ({
  transitionId,
  fromStateId,
  toStateId,
  name,
  trigger,
  guardrails,
});

const approval = (
  approvalId: string,
  name: string,
  requiredRoleIds: string[],
  appliesToTransitionIds: string[],
  previewNotes: string[],
  requiredActorIds: string[] = [],
): ProcessApproval => ({
  approvalId,
  name,
  requiredRoleIds,
  requiredActorIds,
  appliesToTransitionIds,
  advisoryOnly: true,
  previewNotes,
});

const rule = (
  ruleId: string,
  name: string,
  safeSummary: string,
): ProcessRule => ({
  ruleId,
  name,
  safeSummary,
  source: "template",
});

const sla = (
  slaId: string,
  name: string,
  expectation: string,
  escalationNotes: string[],
): ProcessSla => ({
  slaId,
  name,
  expectation,
  assumptionBased: true,
  escalationNotes,
});

const exception = (
  exceptionId: string,
  name: string,
  safeSummary: string,
  handlingNotes: string[],
  riskLevel: ProcessException["riskLevel"],
): ProcessException => ({
  exceptionId,
  name,
  safeSummary,
  handlingNotes,
  riskLevel,
});

const event = (
  eventId: string,
  name: string,
  safeSummary: string,
  sourceStateId?: string,
  targetStateId?: string,
): ProcessEvent => ({
  eventId,
  name,
  safeSummary,
  ...(sourceStateId ? { sourceStateId } : {}),
  ...(targetStateId ? { targetStateId } : {}),
});

const handoff = (
  handoffId: string,
  fromRoleId: string,
  toRoleId: string,
  safeSummary: string,
  checkpointIds: string[],
): ProcessHandoff => ({
  handoffId,
  fromRoleId,
  toRoleId,
  safeSummary,
  checkpointIds,
});

const checkpoint = (
  checkpointId: string,
  name: string,
  safeSummary: string,
  auditNotes: string[],
): ProcessCheckpoint => ({
  checkpointId,
  name,
  safeSummary,
  auditNotes,
});

const risk = (
  riskId: string,
  title: string,
  safeSummary: string,
  severity: ProcessRisk["severity"],
  mitigation: string,
): ProcessRisk => ({
  riskId,
  title,
  safeSummary,
  severity,
  mitigation,
});

const metric = (
  metricId: string,
  name: string,
  safeSummary: string,
): ProcessMetric => ({
  metricId,
  name,
  safeSummary,
  advisoryOnly: true,
});

const alignment = (
  alignmentId: string,
  target: ProcessAlignmentNote["target"],
  safeSummary: string,
  futureOnly = false,
): ProcessAlignmentNote => ({
  alignmentId,
  target,
  safeSummary,
  advisoryOnly: true,
  ...(futureOnly ? { futureOnly: true } : {}),
});

const maturity = (
  mvp: string[],
  enterprise: string[],
  deferred: string[],
): ProcessMaturityNotes => ({
  mvp,
  enterprise,
  deferred,
});

const model = (
  input: Omit<BusinessProcessModel, "schemaVersion" | "advisoryOnly" | "boundaries">,
): BusinessProcessModel => ({
  ...input,
  schemaVersion: "1.0",
  advisoryOnly: true,
  boundaries: businessProcessBoundaries,
});

const commonAssumptions = [
  "Process template is advisory source metadata only.",
  "Stakeholder review is required before implementation planning.",
  "SLA expectations are assumptions until confirmed by process owners.",
];

const commonExclusions = [
  "No executable workflow output is produced.",
  "No automation artifact, database schema, scaffold, or generated system is produced.",
  "No compliance or production readiness claim is made.",
];

export const businessProcessTemplates: readonly BusinessProcessModel[] = [
  model({
    processId: "process:sales-order",
    category: "sales_order",
    name: "Sales order flow",
    purpose: "Represent quote/order intake, review, fulfillment handoff, invoice handoff, and exceptions for planning.",
    moduleIds: ["sales", "orders", "fulfillment", "billing"],
    roles: [
      role("sales-rep", "Sales representative", "Captures customer order details and commercial context.", ["submit-order"]),
      role("sales-manager", "Sales manager", "Reviews exceptional terms or risk conditions.", ["approve-exception"]),
      role("fulfillment-owner", "Fulfillment owner", "Coordinates picking, delivery, or service fulfillment.", ["confirm-fulfillment"]),
      role("billing-owner", "Billing owner", "Prepares invoice handoff and reconciliation notes.", ["confirm-invoice-handoff"]),
    ],
    actors: [
      actor("customer", "sales-rep", "Customer", "External requester or buyer represented in the order context."),
      actor("sales-team", "sales-rep", "Sales team", "Internal team preparing the order."),
      actor("fulfillment-team", "fulfillment-owner", "Fulfillment team", "Team responsible for downstream fulfillment."),
      actor("billing-team", "billing-owner", "Billing team", "Team responsible for invoice preparation."),
    ],
    states: [
      state("intake", "Quote/order intake", "Initial request is captured for review.", "initial"),
      state("review", "Commercial review", "Order details are checked for completeness and risk.", "active"),
      state("approval-needed", "Approval needed", "Exceptional terms require management review.", "waiting"),
      state("fulfillment", "Fulfillment handoff", "Approved order is handed to fulfillment.", "active"),
      state("invoice-handoff", "Invoice handoff", "Fulfillment confirmation is prepared for billing.", "active"),
      state("exception", "Order exception", "Mismatch or incomplete data requires review.", "exception"),
      state("closed", "Closed", "Order flow is complete for planning purposes.", "final"),
    ],
    transitions: [
      transition("submit-order", "intake", "review", "Submit order", "Order information is ready for review.", ["Required fields are reviewed by a human."]),
      transition("requires-approval", "review", "approval-needed", "Route for approval", "Risk, discount, or exception threshold is present.", ["Approval is preview metadata only."]),
      transition("approval-cleared", "approval-needed", "fulfillment", "Approval cleared", "Reviewer accepts the order path.", ["Review record requirements remain future work."]),
      transition("standard-order", "review", "fulfillment", "Standard order", "No special review path is needed.", ["Fulfillment owner confirms readiness."]),
      transition("fulfillment-ready", "fulfillment", "invoice-handoff", "Fulfillment ready", "Fulfillment status is ready for billing handoff.", ["Invoice handoff is reviewed."]),
      transition("close-order", "invoice-handoff", "closed", "Close order", "Billing handoff notes are complete.", ["Close criteria are advisory."]),
      transition("order-exception", "review", "exception", "Flag exception", "Order details are incomplete or conflicting.", ["Exception handling notes are required."]),
      transition("exception-reviewed", "exception", "review", "Return to review", "Exception notes are resolved.", ["Human review remains required."]),
    ],
    approvals: [
      approval("sales-exception-approval", "Sales exception approval", ["sales-manager"], ["requires-approval"], ["Approval is represented as a planning checkpoint only."]),
    ],
    rules: [
      rule("sales-completeness", "Order completeness", "Customer, item, quantity, pricing context, and fulfillment notes should be reviewed."),
      rule("sales-exception-routing", "Exception routing", "Discount, credit, stock, or delivery exceptions should be visible before handoff."),
    ],
    slaAssumptions: [
      sla("sales-review-sla", "Review expectation", "Standard review is expected within an agreed business window.", ["Escalate if review is waiting beyond the assumed window."]),
    ],
    exceptions: [
      exception("sales-stock-mismatch", "Stock mismatch", "Requested quantity may not match available fulfillment context.", ["Route to fulfillment owner.", "Update customer-facing assumptions."], "high"),
      exception("sales-incomplete-order", "Incomplete order", "Required order context is missing.", ["Return to sales representative with missing fields."], "medium"),
    ],
    events: [
      event("sales-order-submitted", "Order submitted", "Order was submitted for review.", "intake", "review"),
      event("sales-order-closed", "Order closed", "Order planning flow reached closure.", "invoice-handoff", "closed"),
    ],
    handoffs: [
      handoff("sales-to-fulfillment", "sales-rep", "fulfillment-owner", "Sales context moves to fulfillment review.", ["sales-fulfillment-checkpoint"]),
      handoff("fulfillment-to-billing", "fulfillment-owner", "billing-owner", "Fulfillment context moves to billing review.", ["sales-invoice-checkpoint"]),
    ],
    checkpoints: [
      checkpoint("sales-fulfillment-checkpoint", "Fulfillment checkpoint", "Review order items, delivery assumptions, and exception notes.", ["Keep fulfillment handoff auditable."]),
      checkpoint("sales-invoice-checkpoint", "Invoice checkpoint", "Review billing handoff and reconciliation notes.", ["Keep invoice handoff traceable."]),
    ],
    metrics: [
      metric("sales-cycle-time", "Cycle time", "Measure assumed time from intake to closure for later review."),
      metric("sales-exception-rate", "Exception rate", "Track share of orders routed to exception review."),
    ],
    risks: [
      risk("sales-handoff-risk", "Handoff loss", "Order context may be lost between sales, fulfillment, and billing.", "high", "Use explicit checkpoints and owner review."),
    ],
    moduleAlignment: [
      alignment("sales-module-orders", "module_blueprint", "Aligns with sales, orders, fulfillment, and billing module blueprints."),
    ],
    planningAlignment: [
      alignment("sales-planning-mvp", "planning", "MVP can focus on intake, review, fulfillment handoff, and closure."),
    ],
    automationAlignment: [
      alignment("sales-automation-future", "automation_future", "Future automation may dry-run notification or approval previews after review.", true),
    ],
    maturityNotes: maturity(
      ["Intake, review, fulfillment handoff, closure."],
      ["Exception analytics, role-specific queues, audit checkpoints, reporting handoffs."],
      ["External connector behavior and automatic fulfillment orchestration."],
    ),
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
    confidence: "medium",
  }),
  model({
    processId: "process:procurement",
    category: "procurement",
    name: "Purchase/procurement flow",
    purpose: "Represent requester intake, approval, supplier handoff, receiving, and mismatch exceptions.",
    moduleIds: ["procurement", "purchases", "receiving", "suppliers"],
    roles: [
      role("requester", "Requester", "Defines the purchase need and context.", ["submit-request"]),
      role("approver", "Approver", "Reviews purchase need, budget, and policy context.", ["approve-request"]),
      role("buyer", "Buyer", "Coordinates supplier communication and order preparation.", ["prepare-purchase"]),
      role("receiving-owner", "Receiving owner", "Confirms received goods or service acceptance.", ["confirm-receipt"]),
    ],
    actors: [
      actor("requesting-team", "requester", "Requesting team", "Business team requesting procurement."),
      actor("approval-owner", "approver", "Approval owner", "Responsible reviewer for the request."),
      actor("supplier-contact", "buyer", "Supplier contact", "External party represented in handoff metadata."),
      actor("receiving-team", "receiving-owner", "Receiving team", "Team that confirms receipt."),
    ],
    states: [
      state("request-draft", "Request draft", "Requester prepares purchase context.", "initial"),
      state("approval-review", "Approval review", "Approver reviews request context.", "waiting"),
      state("supplier-handoff", "Supplier handoff", "Buyer coordinates supplier context.", "active"),
      state("receiving", "Receiving", "Goods or services are checked against expectations.", "active"),
      state("mismatch", "Mismatch exception", "Receiving mismatch or missing information requires review.", "exception"),
      state("complete", "Complete", "Procurement flow is complete for planning purposes.", "final"),
    ],
    transitions: [
      transition("submit-procurement-request", "request-draft", "approval-review", "Submit request", "Requester submits bounded purchase context.", ["Budget and need are reviewed."]),
      transition("approve-procurement-request", "approval-review", "supplier-handoff", "Approval noted", "Approver accepts request path.", ["Approval remains advisory metadata."]),
      transition("supplier-ready", "supplier-handoff", "receiving", "Supplier handoff ready", "Buyer has enough supplier context for receiving.", ["Supplier data is reviewed before receiving."]),
      transition("receipt-matched", "receiving", "complete", "Receipt matched", "Receipt is aligned with request context.", ["Receiving owner confirms close criteria."]),
      transition("receipt-mismatch", "receiving", "mismatch", "Receipt mismatch", "Quantity, quality, or documentation mismatch is present.", ["Mismatch handling notes are required."]),
      transition("mismatch-reviewed", "mismatch", "receiving", "Mismatch reviewed", "Mismatch notes are resolved for receiving review.", ["Return path is human-reviewed."]),
    ],
    approvals: [
      approval("procurement-approval", "Procurement request approval", ["approver"], ["approve-procurement-request"], ["Approval is a process checkpoint, not an executed action."]),
    ],
    rules: [
      rule("procurement-business-need", "Business need", "Requests should include need, requested item or service, quantity, and timing assumptions."),
      rule("procurement-mismatch-review", "Mismatch review", "Receiving mismatch should be visible before completion."),
    ],
    slaAssumptions: [
      sla("procurement-review-window", "Review expectation", "Approval review is expected within an agreed business window.", ["Escalate through owner review if waiting beyond assumption."]),
    ],
    exceptions: [
      exception("procurement-mismatch", "Receiving mismatch", "Received item or service does not match the request context.", ["Route to buyer and receiving owner.", "Record safe mismatch summary."], "high"),
    ],
    events: [
      event("procurement-request-submitted", "Request submitted", "Requester submitted procurement context.", "request-draft", "approval-review"),
      event("procurement-completed", "Procurement completed", "Receiving path reached completion.", "receiving", "complete"),
    ],
    handoffs: [
      handoff("requester-to-approver", "requester", "approver", "Purchase need moves to review.", ["procurement-approval-checkpoint"]),
      handoff("buyer-to-receiving", "buyer", "receiving-owner", "Supplier handoff moves to receiving.", ["procurement-receiving-checkpoint"]),
    ],
    checkpoints: [
      checkpoint("procurement-approval-checkpoint", "Approval checkpoint", "Review request need, budget assumptions, and policy context.", ["Keep approval context reviewable."]),
      checkpoint("procurement-receiving-checkpoint", "Receiving checkpoint", "Review receipt, mismatch notes, and supplier handoff context.", ["Keep receiving outcome traceable."]),
    ],
    metrics: [
      metric("procurement-review-time", "Review time", "Track assumed time from request to approval note."),
      metric("procurement-mismatch-rate", "Mismatch rate", "Track share of receiving paths with mismatch review."),
    ],
    risks: [
      risk("procurement-mismatch-risk", "Supplier mismatch", "Supplier handoff and receiving details may diverge.", "high", "Use receiving checkpoints and mismatch exception review."),
    ],
    moduleAlignment: [
      alignment("procurement-module-purchases", "module_blueprint", "Aligns with procurement, purchase, supplier, and receiving module blueprints."),
    ],
    planningAlignment: [
      alignment("procurement-planning-mvp", "planning", "MVP can focus on request, approval, supplier handoff, and receiving review."),
    ],
    automationAlignment: [
      alignment("procurement-automation-future", "automation_future", "Future automation may preview reminders or routing only after explicit approval.", true),
    ],
    maturityNotes: maturity(
      ["Request, approval, supplier handoff, receiving."],
      ["Policy controls, supplier scorecards, exception reporting, multi-level review."],
      ["Supplier connector behavior and automatic purchasing actions."],
    ),
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
    confidence: "medium",
  }),
  model({
    processId: "process:inventory-movement",
    category: "inventory_movement",
    name: "Inventory movement flow",
    purpose: "Represent transfer or adjustment requests, reconciliation, audit checkpoint, and stock risk notes.",
    moduleIds: ["inventory", "warehouses", "stock-movements", "reconciliation"],
    roles: [
      role("stock-requester", "Stock requester", "Requests transfer or adjustment.", ["submit-movement"]),
      role("warehouse-owner", "Warehouse owner", "Reviews stock context and source/destination assumptions.", ["confirm-movement"]),
      role("inventory-controller", "Inventory controller", "Reviews reconciliation and adjustment risk.", ["review-adjustment"]),
    ],
    actors: [
      actor("warehouse-team", "warehouse-owner", "Warehouse team", "Team responsible for stock handling."),
      actor("inventory-control", "inventory-controller", "Inventory control", "Team responsible for reconciliation review."),
    ],
    states: [
      state("movement-requested", "Movement requested", "Transfer or adjustment context is captured.", "initial"),
      state("stock-review", "Stock review", "Stock and location context is reviewed.", "active"),
      state("adjustment-review", "Adjustment review", "Risk-sensitive adjustment is reviewed.", "waiting"),
      state("reconciliation", "Reconciliation", "Movement is reconciled against expected stock context.", "active"),
      state("stock-exception", "Stock exception", "Mismatch or unexplained movement requires review.", "exception"),
      state("movement-closed", "Movement closed", "Inventory movement is complete for planning.", "final"),
    ],
    transitions: [
      transition("submit-movement", "movement-requested", "stock-review", "Submit movement", "Movement context is ready for stock review.", ["Source and destination are reviewed."]),
      transition("requires-adjustment-review", "stock-review", "adjustment-review", "Route adjustment review", "Adjustment or variance risk is present.", ["Controller review is required as metadata."]),
      transition("movement-approved", "stock-review", "reconciliation", "Movement confirmed", "Warehouse owner confirms movement context.", ["Reconciliation remains required."]),
      transition("adjustment-cleared", "adjustment-review", "reconciliation", "Adjustment review cleared", "Controller accepts the adjustment path.", ["Adjustment notes are retained as planning metadata."]),
      transition("reconciled", "reconciliation", "movement-closed", "Reconciled", "Movement aligns with expected stock context.", ["Close criteria are reviewed."]),
      transition("stock-mismatch", "reconciliation", "stock-exception", "Stock mismatch", "Variance or unknown source is present.", ["Exception review is required."]),
      transition("stock-exception-reviewed", "stock-exception", "reconciliation", "Exception reviewed", "Variance notes are resolved for reconciliation.", ["Return to reconciliation after review."]),
    ],
    approvals: [
      approval("inventory-adjustment-review", "Inventory adjustment review", ["inventory-controller"], ["adjustment-cleared"], ["Adjustment approval is a planning checkpoint only."]),
    ],
    rules: [
      rule("inventory-source-destination", "Source and destination", "Stock movement should include source, destination, item, quantity, and reason."),
      rule("inventory-adjustment-reason", "Adjustment reason", "Adjustments should include a reviewed reason and reconciliation path."),
    ],
    slaAssumptions: [
      sla("inventory-reconciliation-window", "Reconciliation expectation", "Reconciliation is expected within an agreed operating window.", ["Escalate unexplained variance to inventory controller."]),
    ],
    exceptions: [
      exception("inventory-unexplained-variance", "Unexplained variance", "Stock count or movement context does not reconcile.", ["Route to inventory controller.", "Record safe variance notes."], "high"),
    ],
    events: [
      event("inventory-movement-submitted", "Movement submitted", "Movement request was submitted.", "movement-requested", "stock-review"),
      event("inventory-movement-closed", "Movement closed", "Movement was reconciled and closed.", "reconciliation", "movement-closed"),
    ],
    handoffs: [
      handoff("warehouse-to-control", "warehouse-owner", "inventory-controller", "Warehouse context moves to inventory control review.", ["inventory-audit-checkpoint"]),
    ],
    checkpoints: [
      checkpoint("inventory-audit-checkpoint", "Inventory audit checkpoint", "Review quantity, item, source, destination, and variance notes.", ["Keep stock adjustment review traceable."]),
    ],
    metrics: [
      metric("inventory-variance-count", "Variance count", "Track movement paths with reconciliation exceptions."),
      metric("inventory-reconciliation-time", "Reconciliation time", "Track assumed time from movement to reconciliation."),
    ],
    risks: [
      risk("inventory-adjustment-risk", "Stock adjustment risk", "Unreviewed adjustments can distort operational stock views.", "high", "Require reason, owner, and reconciliation checkpoint metadata."),
    ],
    moduleAlignment: [
      alignment("inventory-module-stock", "module_blueprint", "Aligns with inventory, warehouse, stock movement, and reconciliation module blueprints."),
    ],
    planningAlignment: [
      alignment("inventory-planning-risk", "planning", "Planning should account for audit checkpoints and stock variance risk."),
    ],
    automationAlignment: [
      alignment("inventory-automation-future", "automation_future", "Future automation may preview alerts for variance review after process approval.", true),
    ],
    maturityNotes: maturity(
      ["Movement request, review, reconciliation, exception notes."],
      ["Cycle counts, variance analytics, multi-location controls, audit reporting."],
      ["Automatic stock posting or warehouse connector behavior."],
    ),
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
    confidence: "medium",
  }),
  model({
    processId: "process:maintenance-work-order",
    category: "maintenance_work_order",
    name: "Maintenance/work-order flow",
    purpose: "Represent request intake, triage, assignment, work completion, SLA assumptions, and escalation.",
    moduleIds: ["maintenance", "work-orders", "assets", "service"],
    roles: [
      role("requester", "Requester", "Reports maintenance need or asset issue.", ["submit-work-order"]),
      role("triage-owner", "Triage owner", "Classifies urgency and assignment path.", ["triage-request"]),
      role("technician", "Technician", "Performs or coordinates work.", ["update-work-status"]),
      role("service-manager", "Service manager", "Reviews escalation and closure quality.", ["review-escalation"]),
    ],
    actors: [
      actor("asset-user", "requester", "Asset user", "Person or team reporting the issue."),
      actor("maintenance-desk", "triage-owner", "Maintenance desk", "Team triaging requests."),
      actor("service-team", "technician", "Service team", "Team performing work."),
    ],
    states: [
      state("request-opened", "Request opened", "Work-order request is captured.", "initial"),
      state("triage", "Triage", "Request is classified for priority and assignment.", "active"),
      state("assigned", "Assigned", "Responsible technician or team is identified.", "active"),
      state("in-progress", "In progress", "Work is underway or being coordinated.", "active"),
      state("escalated", "Escalated", "Issue requires manager review or additional coordination.", "waiting"),
      state("completed", "Completed", "Work is completed pending closure.", "active"),
      state("closed", "Closed", "Work-order is closed for planning.", "final"),
    ],
    transitions: [
      transition("submit-work-order", "request-opened", "triage", "Submit work order", "Requester submits issue context.", ["Asset, severity, and safety notes are reviewed."]),
      transition("triage-work-order", "triage", "assigned", "Triage work order", "Triage owner selects assignment path.", ["Priority and ownership are explicit."]),
      transition("start-work", "assigned", "in-progress", "Start work", "Technician accepts work context.", ["Assignment notes are visible."]),
      transition("escalate-work", "in-progress", "escalated", "Escalate work", "Blocker, safety concern, or SLA assumption breach is present.", ["Escalation reason is documented."]),
      transition("resume-work", "escalated", "in-progress", "Resume work", "Escalation notes are reviewed.", ["Return path is explicit."]),
      transition("complete-work", "in-progress", "completed", "Complete work", "Work result is ready for closure review.", ["Completion notes are reviewed."]),
      transition("close-work-order", "completed", "closed", "Close work order", "Closure criteria are reviewed.", ["Close as planning metadata only."]),
    ],
    approvals: [
      approval("maintenance-escalation-review", "Escalation review", ["service-manager"], ["resume-work"], ["Escalation review is advisory process metadata."]),
    ],
    rules: [
      rule("maintenance-priority", "Priority classification", "Severity, safety, asset impact, and business impact should guide priority."),
      rule("maintenance-closure", "Closure notes", "Closure should include safe summary of work result and remaining risks."),
    ],
    slaAssumptions: [
      sla("maintenance-response-window", "Response expectation", "Initial response is expected within an agreed service window.", ["Escalate high-impact waiting states to service manager."]),
      sla("maintenance-resolution-window", "Resolution expectation", "Resolution timing is an assumption based on severity and resource availability.", ["Review deferred work and blocked states."]),
    ],
    exceptions: [
      exception("maintenance-safety-risk", "Safety risk", "Work cannot proceed safely without additional review.", ["Escalate to service manager.", "Document safe handling notes."], "high"),
    ],
    events: [
      event("work-order-opened", "Work order opened", "Work-order request was submitted.", "request-opened", "triage"),
      event("work-order-closed", "Work order closed", "Work-order planning flow reached closure.", "completed", "closed"),
    ],
    handoffs: [
      handoff("triage-to-technician", "triage-owner", "technician", "Triage context moves to assigned technician.", ["maintenance-assignment-checkpoint"]),
      handoff("technician-to-manager", "technician", "service-manager", "Escalation context moves to manager review.", ["maintenance-escalation-checkpoint"]),
    ],
    checkpoints: [
      checkpoint("maintenance-assignment-checkpoint", "Assignment checkpoint", "Review asset, priority, owner, and safety notes.", ["Keep assignment context traceable."]),
      checkpoint("maintenance-escalation-checkpoint", "Escalation checkpoint", "Review blocker, risk, and next-step notes.", ["Keep escalation context auditable."]),
    ],
    metrics: [
      metric("maintenance-response-time", "Response time", "Track assumed time from request to triage."),
      metric("maintenance-escalation-rate", "Escalation rate", "Track share of work orders with escalation review."),
    ],
    risks: [
      risk("maintenance-sla-risk", "SLA assumption risk", "SLA expectations can be mistaken for firm delivery commitments.", "medium", "Keep expectations assumption-based and reviewed."),
    ],
    moduleAlignment: [
      alignment("maintenance-module-work-orders", "module_blueprint", "Aligns with maintenance, assets, work orders, and service module blueprints."),
    ],
    planningAlignment: [
      alignment("maintenance-planning-sla", "planning", "Planning should capture severity, SLA assumptions, and escalation dependencies."),
    ],
    automationAlignment: [
      alignment("maintenance-automation-future", "automation_future", "Future automation may preview reminders for waiting states after review.", true),
    ],
    maturityNotes: maturity(
      ["Request, triage, assignment, work status, closure."],
      ["Asset history, priority analytics, escalation dashboards, SLA assumption review."],
      ["Automatic dispatch, external maintenance connectors, or live scheduling."],
    ),
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
    confidence: "medium",
  }),
  model({
    processId: "process:incident-ticket",
    category: "incident_ticket",
    name: "Incident/ticket flow",
    purpose: "Represent incident intake, severity, triage, handoffs, resolution, and closure.",
    moduleIds: ["support", "tickets", "incidents", "service"],
    roles: [
      role("reporter", "Reporter", "Submits an incident or support ticket.", ["submit-ticket"]),
      role("support-agent", "Support agent", "Triage owner and first response role.", ["triage-ticket"]),
      role("resolver", "Resolver", "Responsible technical or operational resolver.", ["resolve-ticket"]),
      role("support-manager", "Support manager", "Reviews escalations and closure quality.", ["review-escalation"]),
    ],
    actors: [
      actor("requesting-user", "reporter", "Requesting user", "Person or team reporting the issue."),
      actor("support-desk", "support-agent", "Support desk", "Team triaging and communicating updates."),
      actor("resolution-team", "resolver", "Resolution team", "Team resolving the incident."),
    ],
    states: [
      state("ticket-opened", "Ticket opened", "Incident is captured.", "initial"),
      state("severity-review", "Severity review", "Severity and impact are classified.", "active"),
      state("assigned", "Assigned", "Resolver or owner is selected.", "active"),
      state("waiting-on-handoff", "Waiting on handoff", "Ticket is waiting on another owner or information.", "waiting"),
      state("resolved", "Resolved", "Resolution is recorded for review.", "active"),
      state("closure-review", "Closure review", "Support confirms resolution and notes.", "active"),
      state("closed", "Closed", "Ticket is closed for planning.", "final"),
    ],
    transitions: [
      transition("submit-ticket", "ticket-opened", "severity-review", "Submit ticket", "Reporter submits incident context.", ["Impact and affected area are reviewed."]),
      transition("triage-ticket", "severity-review", "assigned", "Triage ticket", "Support agent classifies and assigns.", ["Severity notes are explicit."]),
      transition("handoff-ticket", "assigned", "waiting-on-handoff", "Handoff ticket", "Resolver needs another role or information.", ["Handoff owner is named."]),
      transition("resume-resolution", "waiting-on-handoff", "assigned", "Resume resolution", "Handoff notes are reviewed.", ["Return path is explicit."]),
      transition("resolve-ticket", "assigned", "resolved", "Resolve ticket", "Resolver records resolution notes.", ["Resolution summary is safe and bounded."]),
      transition("review-closure", "resolved", "closure-review", "Review closure", "Support reviews resolution with requester context.", ["Closure criteria are advisory."]),
      transition("close-ticket", "closure-review", "closed", "Close ticket", "Closure notes are accepted.", ["No notification delivery is performed."]),
    ],
    approvals: [
      approval("incident-escalation-review", "Incident escalation review", ["support-manager"], ["resume-resolution"], ["Escalation approval is represented as review metadata only."]),
    ],
    rules: [
      rule("incident-severity", "Severity classification", "Severity should reflect impact, urgency, and affected users."),
      rule("incident-closure", "Closure quality", "Closure should include resolution notes and remaining risk summary."),
    ],
    slaAssumptions: [
      sla("incident-response-window", "Response expectation", "First response is expected within an agreed service window.", ["Escalate high-severity waiting states for review."]),
    ],
    exceptions: [
      exception("incident-unclear-owner", "Unclear owner", "No resolver or handoff owner is clear.", ["Route to support manager.", "Document missing ownership safely."], "high"),
    ],
    events: [
      event("ticket-opened-event", "Ticket opened", "Incident was submitted.", "ticket-opened", "severity-review"),
      event("ticket-closed-event", "Ticket closed", "Incident planning flow reached closure.", "closure-review", "closed"),
    ],
    handoffs: [
      handoff("support-to-resolver", "support-agent", "resolver", "Support context moves to resolver.", ["incident-assignment-checkpoint"]),
      handoff("resolver-to-support", "resolver", "support-agent", "Resolution context moves back to support.", ["incident-closure-checkpoint"]),
    ],
    checkpoints: [
      checkpoint("incident-assignment-checkpoint", "Assignment checkpoint", "Review severity, impact, owner, and handoff context.", ["Keep ticket assignment traceable."]),
      checkpoint("incident-closure-checkpoint", "Closure checkpoint", "Review resolution notes and requester-facing summary.", ["Keep closure review auditable."]),
    ],
    metrics: [
      metric("incident-response-time", "Response time", "Track assumed time from ticket opening to first response."),
      metric("incident-handoff-count", "Handoff count", "Track number of handoffs before closure."),
    ],
    risks: [
      risk("incident-handoff-risk", "Handoff ambiguity", "Tickets may stall when ownership is unclear.", "high", "Use explicit handoff owners and checkpoints."),
    ],
    moduleAlignment: [
      alignment("incident-module-tickets", "module_blueprint", "Aligns with support, ticket, incident, and service module blueprints."),
    ],
    planningAlignment: [
      alignment("incident-planning-support", "planning", "Planning should capture severity rules, support roles, and escalation assumptions."),
    ],
    automationAlignment: [
      alignment("incident-automation-future", "automation_future", "Future automation may preview queue reminders after review.", true),
    ],
    maturityNotes: maturity(
      ["Ticket intake, severity, assignment, resolution, closure."],
      ["SLA assumption review, escalation analytics, knowledge base handoff, support dashboards."],
      ["Automatic assignment, external ticket connectors, or live notification delivery."],
    ),
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
    confidence: "medium",
  }),
  model({
    processId: "process:access-request",
    category: "access_request",
    name: "User/access request flow",
    purpose: "Represent requester intake, owner approval, access review, and revoke path.",
    moduleIds: ["users", "permissions", "access-control", "audit"],
    roles: [
      role("access-requester", "Access requester", "Requests access or access changes.", ["submit-access-request"]),
      role("resource-owner", "Resource owner", "Reviews business need and access scope.", ["approve-access-scope"]),
      role("access-admin", "Access admin", "Reviews provisioning and revoke path metadata.", ["record-access-review"]),
      role("audit-reviewer", "Audit reviewer", "Reviews access checkpoints and periodic review context.", ["review-access-checkpoint"]),
    ],
    actors: [
      actor("user", "access-requester", "User", "Person requesting access."),
      actor("owner", "resource-owner", "Owner", "Business or system owner reviewing need."),
      actor("admin", "access-admin", "Administrator", "Role that records provisioning review metadata."),
    ],
    states: [
      state("access-requested", "Access requested", "Access request context is captured.", "initial"),
      state("owner-review", "Owner review", "Resource owner reviews scope and need.", "waiting"),
      state("admin-review", "Admin review", "Access admin reviews provisioning context.", "active"),
      state("access-active", "Access active", "Access state is represented for planning.", "active"),
      state("revoke-review", "Revoke review", "Access removal path is reviewed.", "active"),
      state("access-closed", "Access closed", "Access request flow is closed for planning.", "final"),
      state("access-exception", "Access exception", "Scope or ownership problem requires review.", "exception"),
    ],
    transitions: [
      transition("submit-access-request", "access-requested", "owner-review", "Submit access request", "Requester submits access context.", ["Role and purpose are reviewed."]),
      transition("approve-access-scope", "owner-review", "admin-review", "Owner review noted", "Owner accepts the requested scope path.", ["Approval is advisory metadata."]),
      transition("record-access-review", "admin-review", "access-active", "Record access review", "Admin records reviewed access context.", ["No access is changed by this model."]),
      transition("start-revoke-review", "access-active", "revoke-review", "Start revoke review", "Access should be reviewed for removal or change.", ["Revoke path is explicit."]),
      transition("close-access-request", "revoke-review", "access-closed", "Close access request", "Revoke or review notes are complete.", ["Closure is planning metadata."]),
      transition("access-exception-route", "owner-review", "access-exception", "Route exception", "Owner, scope, or need is unclear.", ["Exception notes are required."]),
      transition("access-exception-reviewed", "access-exception", "owner-review", "Exception reviewed", "Exception notes are resolved.", ["Return path is reviewed."]),
    ],
    approvals: [
      approval("access-owner-approval", "Access owner approval", ["resource-owner"], ["approve-access-scope"], ["Owner approval is a process checkpoint only."]),
    ],
    rules: [
      rule("access-least-privilege", "Least privilege review", "Requested access should be scoped to confirmed business need."),
      rule("access-revoke-path", "Revoke path", "Every access grant should have a review and revoke path."),
    ],
    slaAssumptions: [
      sla("access-review-window", "Review expectation", "Owner review is expected within an agreed business window.", ["Escalate waiting owner review through audit reviewer."]),
    ],
    exceptions: [
      exception("access-owner-unknown", "Unknown owner", "No clear resource owner is available for review.", ["Route to audit reviewer.", "Document owner gap safely."], "high"),
    ],
    events: [
      event("access-request-submitted", "Access request submitted", "Access request was submitted.", "access-requested", "owner-review"),
      event("access-request-closed", "Access request closed", "Access request flow reached closure.", "revoke-review", "access-closed"),
    ],
    handoffs: [
      handoff("requester-to-owner", "access-requester", "resource-owner", "Requester context moves to owner review.", ["access-owner-checkpoint"]),
      handoff("owner-to-admin", "resource-owner", "access-admin", "Reviewed access context moves to admin review.", ["access-admin-checkpoint"]),
    ],
    checkpoints: [
      checkpoint("access-owner-checkpoint", "Owner checkpoint", "Review access purpose, scope, and duration assumptions.", ["Keep access owner review traceable."]),
      checkpoint("access-admin-checkpoint", "Admin checkpoint", "Review provisioning notes and revoke path.", ["Keep access review auditable."]),
    ],
    metrics: [
      metric("access-review-time", "Review time", "Track assumed time from request to owner review."),
      metric("access-exception-count", "Exception count", "Track access requests with scope or owner exceptions."),
    ],
    risks: [
      risk("access-overpermission-risk", "Over-permission risk", "Access scope can exceed business need without owner review.", "high", "Use least-privilege review and revoke checkpoints."),
    ],
    moduleAlignment: [
      alignment("access-module-permissions", "module_blueprint", "Aligns with user, permissions, access-control, and audit module blueprints."),
    ],
    planningAlignment: [
      alignment("access-planning-controls", "planning", "Planning should account for owner review, revoke path, and audit checkpoints."),
    ],
    automationAlignment: [
      alignment("access-automation-future", "automation_future", "Future automation may preview access review reminders after explicit controls are approved.", true),
    ],
    maturityNotes: maturity(
      ["Request, owner review, admin review, revoke path."],
      ["Periodic review, access analytics, segregation of duties, audit reporting."],
      ["Automatic provisioning, identity connector behavior, or live permission changes."],
    ),
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
    confidence: "medium",
  }),
  model({
    processId: "process:approval",
    category: "approval",
    name: "Approval flow",
    purpose: "Represent submit, review, approve/reject, escalation, and audit checkpoint behavior as advisory metadata.",
    moduleIds: ["approvals", "controls", "audit"],
    roles: [
      role("submitter", "Submitter", "Submits item for review.", ["submit-item"]),
      role("reviewer", "Reviewer", "Reviews item and records decision context.", ["record-review"]),
      role("escalation-owner", "Escalation owner", "Reviews blocked or high-risk approvals.", ["review-escalation"]),
    ],
    actors: [
      actor("request-owner", "submitter", "Request owner", "Person or team submitting the item."),
      actor("decision-owner", "reviewer", "Decision owner", "Person or role reviewing the item."),
    ],
    states: [
      state("submitted", "Submitted", "Item is submitted for review.", "initial"),
      state("under-review", "Under review", "Reviewer is evaluating context.", "waiting"),
      state("approved", "Approved", "Approval decision is represented for planning.", "final"),
      state("rejected", "Rejected", "Rejection decision is represented for planning.", "final"),
      state("escalated", "Escalated", "Item requires escalation review.", "exception"),
    ],
    transitions: [
      transition("submit-for-review", "submitted", "under-review", "Submit for review", "Submitter sends bounded context.", ["Reviewer and criteria are explicit."]),
      transition("approve-item", "under-review", "approved", "Approve item", "Reviewer records accepted path.", ["Decision note is advisory metadata."]),
      transition("reject-item", "under-review", "rejected", "Reject item", "Reviewer records rejected path.", ["Reason is safe and bounded."]),
      transition("escalate-approval", "under-review", "escalated", "Escalate approval", "Reviewer cannot decide or risk threshold is present.", ["Escalation reason is documented."]),
      transition("return-from-escalation", "escalated", "under-review", "Return from escalation", "Escalation notes are reviewed.", ["Return path is explicit."]),
    ],
    approvals: [
      approval("approval-review", "Approval review", ["reviewer"], ["approve-item", "reject-item"], ["Approval decision is modeled as a checkpoint only."]),
      approval("approval-escalation-review", "Escalation review", ["escalation-owner"], ["return-from-escalation"], ["Escalation review is advisory metadata."]),
    ],
    rules: [
      rule("approval-criteria", "Review criteria", "Approval criteria should be explicit before decisions are reviewed."),
      rule("approval-reason", "Decision reason", "Approve and reject paths should include safe reason notes."),
    ],
    slaAssumptions: [
      sla("approval-review-window", "Review expectation", "Review is expected within an agreed business window.", ["Escalate waiting review through escalation owner."]),
    ],
    exceptions: [
      exception("approval-unclear-criteria", "Unclear criteria", "Decision criteria are incomplete or conflicting.", ["Route to escalation owner.", "Clarify missing criteria."], "medium"),
    ],
    events: [
      event("approval-submitted", "Approval submitted", "Item was submitted for review.", "submitted", "under-review"),
      event("approval-decision-recorded", "Decision recorded", "Approval or rejection path reached final state.", "under-review"),
    ],
    handoffs: [
      handoff("submitter-to-reviewer", "submitter", "reviewer", "Submitter context moves to reviewer.", ["approval-review-checkpoint"]),
      handoff("reviewer-to-escalation", "reviewer", "escalation-owner", "Escalation context moves to owner review.", ["approval-escalation-checkpoint"]),
    ],
    checkpoints: [
      checkpoint("approval-review-checkpoint", "Review checkpoint", "Review criteria, context, and safe decision notes.", ["Keep approval review traceable."]),
      checkpoint("approval-escalation-checkpoint", "Escalation checkpoint", "Review escalation reason and next-step assumptions.", ["Keep escalation review auditable."]),
    ],
    metrics: [
      metric("approval-wait-time", "Review wait time", "Track assumed waiting time for approval review."),
      metric("approval-escalation-rate", "Escalation rate", "Track share of approval paths requiring escalation."),
    ],
    risks: [
      risk("approval-criteria-risk", "Unclear decision criteria", "Approval outcomes may be inconsistent without explicit criteria.", "medium", "Define criteria and review checkpoints."),
    ],
    moduleAlignment: [
      alignment("approval-module-controls", "module_blueprint", "Aligns with approval, controls, and audit module blueprints."),
    ],
    planningAlignment: [
      alignment("approval-planning-controls", "planning", "Planning should account for review roles, criteria, and escalation risk."),
    ],
    automationAlignment: [
      alignment("approval-automation-future", "automation_future", "Future automation may preview approval routing only after explicit governance.", true),
    ],
    maturityNotes: maturity(
      ["Submit, review, approve or reject, escalation notes."],
      ["Multi-level review, decision analytics, audit exports after later approval."],
      ["Live approval actions or external approval records."],
    ),
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
    confidence: "medium",
  }),
  model({
    processId: "process:reporting-closing",
    category: "reporting_closing",
    name: "Reporting/closing flow",
    purpose: "Represent data cut-off, reconciliation, review, signoff, and exception handling.",
    moduleIds: ["reporting", "closing", "reconciliation", "audit"],
    roles: [
      role("data-owner", "Data owner", "Prepares cut-off context and source notes.", ["confirm-cutoff"]),
      role("reconciler", "Reconciler", "Reviews completeness and variance notes.", ["reconcile-data"]),
      role("reviewer", "Reviewer", "Reviews closing package and signoff context.", ["record-signoff"]),
      role("audit-owner", "Audit owner", "Reviews checkpoints and exception summaries.", ["review-closing-checkpoint"]),
    ],
    actors: [
      actor("reporting-team", "data-owner", "Reporting team", "Team preparing closing data."),
      actor("finance-review", "reviewer", "Finance review", "Review group for closing package."),
    ],
    states: [
      state("cutoff", "Data cut-off", "Cut-off assumptions are captured.", "initial"),
      state("reconciliation", "Reconciliation", "Data is reviewed for completeness and variance.", "active"),
      state("review", "Review", "Closing package is reviewed.", "waiting"),
      state("signoff", "Signoff", "Signoff context is represented for planning.", "active"),
      state("closing-exception", "Closing exception", "Variance or missing input requires review.", "exception"),
      state("closed", "Closed", "Reporting/closing flow is complete for planning.", "final"),
    ],
    transitions: [
      transition("confirm-cutoff", "cutoff", "reconciliation", "Confirm cut-off", "Data owner confirms cut-off context.", ["Cut-off assumptions are explicit."]),
      transition("reconcile-data", "reconciliation", "review", "Reconcile data", "Reconciler prepares review package.", ["Variance notes are safe and bounded."]),
      transition("record-signoff", "review", "signoff", "Record signoff context", "Reviewer accepts closing package path.", ["Signoff is planning metadata."]),
      transition("close-reporting", "signoff", "closed", "Close reporting", "Closing notes are complete.", ["Closure is advisory."]),
      transition("closing-exception-route", "reconciliation", "closing-exception", "Route exception", "Variance or missing input requires review.", ["Exception owner is identified."]),
      transition("closing-exception-reviewed", "closing-exception", "reconciliation", "Exception reviewed", "Exception notes are resolved.", ["Return path is reviewed."]),
    ],
    approvals: [
      approval("closing-signoff-review", "Closing signoff review", ["reviewer"], ["record-signoff"], ["Signoff is represented as a planning checkpoint."]),
    ],
    rules: [
      rule("closing-cutoff", "Cut-off clarity", "Cut-off assumptions and included data sources should be explicit."),
      rule("closing-variance", "Variance notes", "Variance and exception notes should be reviewed before signoff."),
    ],
    slaAssumptions: [
      sla("closing-review-window", "Review expectation", "Review is expected within an agreed closing window.", ["Escalate unresolved variance to audit owner."]),
    ],
    exceptions: [
      exception("closing-missing-source", "Missing source input", "Expected source input is missing or incomplete.", ["Route to data owner.", "Document missing source safely."], "high"),
    ],
    events: [
      event("closing-cutoff-confirmed", "Cut-off confirmed", "Cut-off context was confirmed.", "cutoff", "reconciliation"),
      event("closing-closed", "Closing closed", "Closing process reached closure.", "signoff", "closed"),
    ],
    handoffs: [
      handoff("data-owner-to-reconciler", "data-owner", "reconciler", "Cut-off context moves to reconciliation.", ["closing-cutoff-checkpoint"]),
      handoff("reconciler-to-reviewer", "reconciler", "reviewer", "Reconciliation package moves to review.", ["closing-review-checkpoint"]),
    ],
    checkpoints: [
      checkpoint("closing-cutoff-checkpoint", "Cut-off checkpoint", "Review cut-off scope, source systems, and exclusions.", ["Keep cut-off assumptions traceable."]),
      checkpoint("closing-review-checkpoint", "Review checkpoint", "Review reconciliation summary, variance notes, and signoff context.", ["Keep closing review auditable."]),
    ],
    metrics: [
      metric("closing-variance-count", "Variance count", "Track closing paths with variance review."),
      metric("closing-review-time", "Review time", "Track assumed time from reconciliation to signoff context."),
    ],
    risks: [
      risk("closing-data-quality-risk", "Data quality gap", "Missing or inconsistent source data can weaken reporting trust.", "high", "Use cut-off and reconciliation checkpoints."),
    ],
    moduleAlignment: [
      alignment("closing-module-reporting", "module_blueprint", "Aligns with reporting, closing, reconciliation, and audit module blueprints."),
    ],
    planningAlignment: [
      alignment("closing-planning-controls", "planning", "Planning should account for source ownership, cut-off assumptions, and variance review."),
    ],
    automationAlignment: [
      alignment("closing-automation-future", "automation_future", "Future automation may preview review reminders after data governance is approved.", true),
    ],
    maturityNotes: maturity(
      ["Cut-off, reconciliation, review, signoff context."],
      ["Multi-source reconciliation, review dashboards, audit trail reporting."],
      ["Automatic data extraction, posting, or live reporting publication."],
    ),
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
    confidence: "medium",
  }),
  model({
    processId: "process:generic",
    category: "generic",
    name: "Generic business process",
    purpose: "Represent a simple advisory process with intake, review, work, exception, and closure states.",
    moduleIds: ["generic"],
    roles: [
      role("requester", "Requester", "Submits process context.", ["submit"]),
      role("owner", "Owner", "Reviews and owns process progress.", ["review", "close"]),
      role("worker", "Worker", "Completes the process work.", ["perform-work"]),
    ],
    actors: [
      actor("requesting-party", "requester", "Requesting party", "Person or team requesting the process."),
      actor("process-owner", "owner", "Process owner", "Person or role accountable for review."),
    ],
    states: [
      state("intake", "Intake", "Process context is captured.", "initial"),
      state("review", "Review", "Context is reviewed.", "active"),
      state("work", "Work", "Process work is planned or underway.", "active"),
      state("exception", "Exception", "Issue requires review.", "exception"),
      state("closed", "Closed", "Process is closed for planning.", "final"),
    ],
    transitions: [
      transition("submit", "intake", "review", "Submit", "Context is ready for review.", ["Required context is present."]),
      transition("start-work", "review", "work", "Start work", "Owner accepts work path.", ["Owner is explicit."]),
      transition("close", "work", "closed", "Close", "Work notes are complete.", ["Closure criteria are reviewed."]),
      transition("flag-exception", "review", "exception", "Flag exception", "Context is incomplete or conflicting.", ["Exception notes are required."]),
      transition("return-to-review", "exception", "review", "Return to review", "Exception notes are resolved.", ["Return path is reviewed."]),
    ],
    approvals: [
      approval("generic-owner-review", "Owner review", ["owner"], ["start-work"], ["Owner review is planning metadata only."]),
    ],
    rules: [
      rule("generic-context", "Context completeness", "Process context should identify owner, requester, scope, and exception path."),
    ],
    slaAssumptions: [
      sla("generic-review-window", "Review expectation", "Review is expected within an agreed business window.", ["Escalate waiting review to process owner."]),
    ],
    exceptions: [
      exception("generic-incomplete-context", "Incomplete context", "Required process context is missing.", ["Return to requester with missing context summary."], "medium"),
    ],
    events: [
      event("generic-submitted", "Submitted", "Process was submitted.", "intake", "review"),
      event("generic-closed", "Closed", "Process reached closure.", "work", "closed"),
    ],
    handoffs: [
      handoff("requester-to-owner", "requester", "owner", "Requester context moves to owner review.", ["generic-review-checkpoint"]),
    ],
    checkpoints: [
      checkpoint("generic-review-checkpoint", "Review checkpoint", "Review owner, scope, assumptions, and exception path.", ["Keep review traceable."]),
    ],
    metrics: [
      metric("generic-cycle-time", "Cycle time", "Track assumed time from intake to closure."),
    ],
    risks: [
      risk("generic-unclear-owner", "Unclear owner", "Process can stall if ownership is unclear.", "medium", "Require owner and handoff metadata."),
    ],
    moduleAlignment: [
      alignment("generic-module", "module_blueprint", "Aligns with a future reviewed module blueprint when available."),
    ],
    planningAlignment: [
      alignment("generic-planning", "planning", "Planning can use this as a starter process until a specific category is selected."),
    ],
    automationAlignment: [
      alignment("generic-automation-future", "automation_future", "Future automation alignment is metadata only until explicitly approved.", true),
    ],
    maturityNotes: maturity(
      ["Intake, review, work, exception, closure."],
      ["Role-specific queues, metrics, checkpoints, and reporting."],
      ["Executable routing or generated implementation artifacts."],
    ),
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
    confidence: "low",
  }),
];

export const listBusinessProcessTemplates = (): BusinessProcessModel[] =>
  businessProcessTemplates.map((template) => ({
    ...template,
    moduleIds: template.moduleIds.slice(),
    roles: template.roles.map((item) => ({ ...item, decisionRights: item.decisionRights.slice() })),
    actors: template.actors.map((item) => ({ ...item })),
    states: template.states.map((item) => ({ ...item })),
    transitions: template.transitions.map((item) => ({ ...item, guardrails: item.guardrails.slice() })),
    approvals: template.approvals.map((item) => ({
      ...item,
      requiredRoleIds: item.requiredRoleIds.slice(),
      requiredActorIds: item.requiredActorIds.slice(),
      appliesToTransitionIds: item.appliesToTransitionIds.slice(),
      previewNotes: item.previewNotes.slice(),
    })),
    rules: template.rules.map((item) => ({ ...item })),
    slaAssumptions: template.slaAssumptions.map((item) => ({
      ...item,
      escalationNotes: item.escalationNotes.slice(),
    })),
    exceptions: template.exceptions.map((item) => ({ ...item, handlingNotes: item.handlingNotes.slice() })),
    events: template.events.map((item) => ({ ...item })),
    handoffs: template.handoffs.map((item) => ({ ...item, checkpointIds: item.checkpointIds.slice() })),
    checkpoints: template.checkpoints.map((item) => ({ ...item, auditNotes: item.auditNotes.slice() })),
    metrics: template.metrics.map((item) => ({ ...item })),
    risks: template.risks.map((item) => ({ ...item })),
    moduleAlignment: template.moduleAlignment.map((item) => ({ ...item })),
    planningAlignment: template.planningAlignment.map((item) => ({ ...item })),
    automationAlignment: template.automationAlignment.map((item) => ({ ...item })),
    maturityNotes: {
      mvp: template.maturityNotes.mvp.slice(),
      enterprise: template.maturityNotes.enterprise.slice(),
      deferred: template.maturityNotes.deferred.slice(),
    },
    assumptions: template.assumptions.slice(),
    exclusions: template.exclusions.slice(),
  }));
