import { createHash, randomUUID } from "node:crypto";

import { automationWorkflowSchema } from "./workflowSchema.js";
import { validateAutomationWorkflow } from "./validator.js";
import type {
  AutomationEdge,
  AutomationNode,
  AutomationPermissionRequirement,
  AutomationRiskLevel,
  AutomationRiskSummary,
  AutomationSafeMetadata,
  AutomationValidationFinding,
  AutomationWorkflow,
} from "./types.js";
import type {
  AutomationApprovalPreview,
  AutomationApprovalPreviewEntry,
  AutomationDryRunBoundaries,
  AutomationDryRunEdgeEvaluation,
  AutomationDryRunGraphSummary,
  AutomationDryRunNodeResult,
  AutomationDryRunResult,
  AutomationDryRunStatus,
  AutomationPermissionPreview,
} from "./dryRunTypes.js";

const DRY_RUN_SCHEMA_VERSION = "1.0";
const MAX_DRY_RUN_NODES = 100;
const MAX_DRY_RUN_EDGES = 250;
const FUTURE_NODE_CATEGORIES = new Set<string>([
  "connector_call_future",
  "data_write_future_gated",
]);
const RISK_ORDER: AutomationRiskLevel[] = ["low", "medium", "high", "critical"];

const BOUNDARIES: AutomationDryRunBoundaries = {
  noExecution: true,
  noNodeRuns: true,
  noStoreMutation: true,
  noLocksCreated: true,
  noProviderCalls: true,
  noNetwork: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noApprovalExecution: true,
  noNotificationDelivery: true,
  noCredentialAccess: true,
};

export function dryRunAutomationWorkflow(input: unknown): AutomationDryRunResult {
  const createdAt = new Date().toISOString();
  const validation = validateAutomationWorkflow(input);
  if (!validation.valid) {
    return buildResult({
      createdAt,
      workflowId: workflowIdFromInput(input),
      validation,
      nodeRuns: [],
      edgeEvaluations: [],
      warnings: validation.warnings,
      errors: validation.errors,
      riskSummary: validation.riskSummary,
      permissionPreview: emptyPermissionPreview(),
      approvalPreview: emptyApprovalPreview(),
      unsupportedFeatures: validation.unsupportedFeatures,
    });
  }

  const parsed = automationWorkflowSchema.safeParse(input);
  if (!parsed.success) {
    const error = buildFinding({
      severity: "fail",
      reasonCode: "automation.dryRun.schema_unavailable",
      safeMessage: "Validated workflow could not be safely loaded for dry-run.",
    });
    return buildResult({
      createdAt,
      workflowId: workflowIdFromInput(input),
      validation,
      nodeRuns: [],
      edgeEvaluations: [],
      warnings: [],
      errors: [error],
      riskSummary: validation.riskSummary,
      permissionPreview: emptyPermissionPreview(),
      approvalPreview: emptyApprovalPreview(),
      unsupportedFeatures: validation.unsupportedFeatures,
    });
  }

  const workflow = parsed.data;
  const warnings: AutomationValidationFinding[] = [...validation.warnings];
  const errors: AutomationValidationFinding[] = [];

  if (workflow.nodes.length > MAX_DRY_RUN_NODES) {
    errors.push(buildFinding({
      severity: "fail",
      reasonCode: "automation.dryRun.node_limit_exceeded",
      safeMessage: "Workflow exceeds the dry-run node limit.",
      metadata: { maxNodes: MAX_DRY_RUN_NODES, nodeCount: workflow.nodes.length },
    }));
  }
  if (workflow.edges.length > MAX_DRY_RUN_EDGES) {
    errors.push(buildFinding({
      severity: "fail",
      reasonCode: "automation.dryRun.edge_limit_exceeded",
      safeMessage: "Workflow exceeds the dry-run edge limit.",
      metadata: { maxEdges: MAX_DRY_RUN_EDGES, edgeCount: workflow.edges.length },
    }));
  }

  const graph = buildGraphSummary(workflow, warnings);
  if (errors.length > 0) {
    return buildResult({
      createdAt,
      workflowId: workflow.workflowId,
      validation,
      nodeRuns: [],
      edgeEvaluations: [],
      warnings,
      errors,
      riskSummary: validation.riskSummary,
      permissionPreview: buildPermissionPreview(workflow, warnings),
      approvalPreview: buildApprovalPreview(workflow),
      unsupportedFeatures: validation.unsupportedFeatures,
    });
  }

  const nodesById = new Map(workflow.nodes.map((node) => [node.nodeId, node]));
  const nodeRuns = graph.nodeOrder
    .map((nodeId) => nodesById.get(nodeId))
    .filter((node): node is AutomationNode => node !== undefined)
    .map((node) => simulateNode(node));
  for (const nodeRun of nodeRuns) {
    if (nodeRun.status === "unsupported" || nodeRun.status === "blocked") {
      errors.push(buildFinding({
        severity: "fail",
        reasonCode: nodeRun.unsupportedReasonCode ?? "automation.dryRun.node.unsupported",
        safeMessage: "Node is not supported by the dry-run core.",
        nodeId: nodeRun.nodeId,
        metadata: { category: nodeRun.category },
      }));
    }
  }
  const edgeEvaluations = workflow.edges.map((edge) => simulateEdge(edge));

  return buildResult({
    createdAt,
    workflowId: workflow.workflowId,
    validation,
    nodeRuns,
    edgeEvaluations,
    warnings,
    errors,
    riskSummary: validation.riskSummary,
    permissionPreview: buildPermissionPreview(workflow, warnings),
    approvalPreview: buildApprovalPreview(workflow),
    unsupportedFeatures: [
      ...new Set([
        ...validation.unsupportedFeatures,
        ...nodeRuns
          .map((nodeRun) => nodeRun.unsupportedReasonCode)
          .filter((value): value is string => value !== undefined),
      ]),
    ].sort(),
  });
}

function simulateNode(node: AutomationNode): AutomationDryRunNodeResult {
  const approval = nodeRequiresApproval(node);
  const secondApproval = nodeRequiresSecondApproval(node);
  const base = {
    nodeId: node.nodeId,
    category: node.category,
    riskLevel: node.riskLevel,
    requiredPermissionCount: node.requiredPermissions.length,
    previewOnly: true,
    ...(approval ? { wouldRequireApproval: true } : {}),
    ...(secondApproval ? { wouldRequireSecondApproval: true } : {}),
  } satisfies Omit<
    AutomationDryRunNodeResult,
    "status" | "safeMessage" | "unsupportedReasonCode" | "metadata"
  >;

  if (node.disabled === true || node.futureOnly === true) {
    return {
      ...base,
      status: "skipped",
      safeMessage: "Node is disabled or future-only and was not simulated.",
      metadata: {
        disabled: node.disabled === true,
        futureOnly: node.futureOnly === true,
      },
    };
  }

  if (FUTURE_NODE_CATEGORIES.has(node.category)) {
    return {
      ...base,
      status: "unsupported",
      safeMessage: "Future node category is not active in dry-run core.",
      unsupportedReasonCode: `automation.dryRun.node.${node.category}.future`,
    };
  }

  if (node.category === "wait_timer") {
    return {
      ...base,
      status: "unsupported",
      safeMessage: "Timer nodes wait for scheduler semantics in a future phase.",
      unsupportedReasonCode: "automation.dryRun.node.wait_timer.unsupported",
    };
  }

  if (node.category === "loop") {
    return {
      ...base,
      status: "unsupported",
      safeMessage: "Loop nodes wait for bounded loop semantics in a future phase.",
      unsupportedReasonCode: "automation.dryRun.node.loop.unsupported",
    };
  }

  return {
    ...base,
    status: "simulated",
    safeMessage: safeNodeMessage(node),
    ...(node.category === "condition"
      ? { metadata: { branchPreview: "unknown" } }
      : {}),
  };
}

function simulateEdge(edge: AutomationEdge): AutomationDryRunEdgeEvaluation {
  return {
    edgeId: edge.edgeId,
    fromNodeId: edge.fromNodeId,
    toNodeId: edge.toNodeId,
    status: "simulated",
    safeMessage: "Edge traversal was previewed only.",
  };
}

function safeNodeMessage(node: AutomationNode): string {
  switch (node.category) {
    case "approval_request":
      return "Approval requirement was previewed only.";
    case "notification":
      return "Notification was previewed only and not delivered.";
    case "action_proposal":
      return "Action proposal was previewed only and no record was created.";
    case "human_input":
      return "Human input wait state was previewed only.";
    case "data_read":
      return "Data read was simulated only and no store was read.";
    case "condition":
      return "Condition branch was previewed without expression evaluation.";
    case "branch_merge":
      return "Branch merge was structurally previewed.";
    case "error_handler":
      return "Error handler registration was previewed only.";
    case "transform":
    default:
      return "Node was simulated without execution.";
  }
}

function buildGraphSummary(
  workflow: AutomationWorkflow,
  warnings: AutomationValidationFinding[],
): AutomationDryRunGraphSummary {
  const adjacency = new Map<string, string[]>();
  const incomingCount = new Map<string, number>();
  for (const node of workflow.nodes) {
    adjacency.set(node.nodeId, []);
    incomingCount.set(node.nodeId, 0);
  }
  for (const edge of workflow.edges) {
    adjacency.get(edge.fromNodeId)?.push(edge.toNodeId);
    incomingCount.set(edge.toNodeId, (incomingCount.get(edge.toNodeId) ?? 0) + 1);
  }

  const queue = workflow.nodes
    .filter((node) => (incomingCount.get(node.nodeId) ?? 0) === 0)
    .map((node) => node.nodeId);
  const nodeOrder: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    nodeOrder.push(current);
    for (const next of adjacency.get(current) ?? []) {
      const nextCount = (incomingCount.get(next) ?? 0) - 1;
      incomingCount.set(next, nextCount);
      if (nextCount === 0) {
        queue.push(next);
      }
    }
  }

  const disconnected = disconnectedNodeIds(workflow);
  for (const nodeId of disconnected) {
    warnings.push(buildFinding({
      severity: "warn",
      reasonCode: "automation.dryRun.graph.disconnected_node",
      safeMessage: "Node is disconnected from the primary workflow component.",
      nodeId,
    }));
  }

  return {
    nodeOrder,
    edgeCount: workflow.edges.length,
    disconnectedNodeCount: disconnected.length,
  };
}

function disconnectedNodeIds(workflow: AutomationWorkflow): string[] {
  if (workflow.nodes.length <= 1) {
    return [];
  }
  const firstActiveNode = workflow.nodes.find((node) => !isInactive(node));
  if (!firstActiveNode) {
    return [];
  }

  const neighbors = new Map<string, Set<string>>();
  for (const node of workflow.nodes) {
    neighbors.set(node.nodeId, new Set<string>());
  }
  for (const edge of workflow.edges) {
    neighbors.get(edge.fromNodeId)?.add(edge.toNodeId);
    neighbors.get(edge.toNodeId)?.add(edge.fromNodeId);
  }

  const reachable = new Set<string>();
  const queue = [firstActiveNode.nodeId];
  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId || reachable.has(nodeId)) {
      continue;
    }
    reachable.add(nodeId);
    for (const next of neighbors.get(nodeId) ?? []) {
      queue.push(next);
    }
  }

  return workflow.nodes
    .filter((node) => !isInactive(node) && !reachable.has(node.nodeId))
    .map((node) => node.nodeId);
}

function buildPermissionPreview(
  workflow: AutomationWorkflow,
  warnings: AutomationValidationFinding[],
): AutomationPermissionPreview {
  const requiredPermissions = dedupePermissions([
    ...workflow.permissions,
    ...workflow.nodes.flatMap((node) => node.requiredPermissions),
  ]);
  const missingPermissionMetadata = workflow.nodes
    .filter((node) => node.requiredPermissions.length === 0)
    .map((node) => node.nodeId);

  for (const nodeId of missingPermissionMetadata) {
    warnings.push(buildFinding({
      severity: "warn",
      reasonCode: "automation.dryRun.permission.empty_node_permissions",
      safeMessage: "Node has no required permission metadata.",
      nodeId,
    }));
  }

  return {
    requiredPermissions,
    missingPermissionMetadata,
    totalRequiredPermissionCount: requiredPermissions.length,
    advisoryOnly: true,
  };
}

function buildApprovalPreview(workflow: AutomationWorkflow): AutomationApprovalPreview {
  const requiredApprovals: AutomationApprovalPreviewEntry[] = workflow.nodes
    .filter(nodeRequiresApproval)
    .map((node) => ({
      nodeId: node.nodeId,
      category: node.category,
      riskLevel: node.riskLevel,
      reasonCode: approvalReasonCode(node),
      safeMessage: "Node would require human approval before future execution.",
    }));

  return {
    requiredApprovals,
    secondApprovalPreviewRequired: workflow.nodes.some(nodeRequiresSecondApproval),
    advisoryOnly: true,
  };
}

function dedupePermissions(
  permissions: AutomationPermissionRequirement[],
): AutomationPermissionRequirement[] {
  const seen = new Set<string>();
  const deduped: AutomationPermissionRequirement[] = [];
  for (const permission of permissions) {
    const key = [
      permission.permissionId,
      permission.scope ?? "",
      permission.reason,
    ].join(":");
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(permission);
    }
  }
  return deduped;
}

function nodeRequiresApproval(node: AutomationNode): boolean {
  return (
    node.category === "approval_request" ||
    node.category === "action_proposal" ||
    node.riskLevel === "high" ||
    node.riskLevel === "critical"
  );
}

function nodeRequiresSecondApproval(node: AutomationNode): boolean {
  return node.riskLevel === "critical" || FUTURE_NODE_CATEGORIES.has(node.category);
}

function approvalReasonCode(node: AutomationNode): string {
  if (node.riskLevel === "critical") {
    return "automation.dryRun.approval.critical_risk";
  }
  if (node.riskLevel === "high") {
    return "automation.dryRun.approval.high_risk";
  }
  if (node.category === "approval_request") {
    return "automation.dryRun.approval.request_node";
  }
  return "automation.dryRun.approval.action_preview";
}

function isInactive(node: AutomationNode): boolean {
  return node.disabled === true || node.futureOnly === true;
}

function emptyPermissionPreview(): AutomationPermissionPreview {
  return {
    requiredPermissions: [],
    missingPermissionMetadata: [],
    totalRequiredPermissionCount: 0,
    advisoryOnly: true,
  };
}

function emptyApprovalPreview(): AutomationApprovalPreview {
  return {
    requiredApprovals: [],
    secondApprovalPreviewRequired: false,
    advisoryOnly: true,
  };
}

function buildResult(input: {
  createdAt: string;
  workflowId?: string | undefined;
  validation: AutomationDryRunResult["validation"];
  nodeRuns: AutomationDryRunNodeResult[];
  edgeEvaluations: AutomationDryRunEdgeEvaluation[];
  warnings: AutomationValidationFinding[];
  errors: AutomationValidationFinding[];
  riskSummary: AutomationRiskSummary;
  permissionPreview: AutomationPermissionPreview;
  approvalPreview: AutomationApprovalPreview;
  unsupportedFeatures: string[];
}): AutomationDryRunResult {
  const status = statusFromFindings(input.errors, input.warnings);
  return {
    dryRunId: `autodry_${randomUUID()}`,
    createdAt: input.createdAt,
    ...(input.workflowId ? { workflowId: input.workflowId } : {}),
    schemaVersion: DRY_RUN_SCHEMA_VERSION,
    valid: input.validation.valid && input.errors.length === 0,
    status,
    validation: input.validation,
    nodeRuns: input.nodeRuns,
    edgeEvaluations: input.edgeEvaluations,
    warnings: input.warnings,
    errors: input.errors,
    riskSummary: input.riskSummary,
    permissionPreview: input.permissionPreview,
    approvalPreview: input.approvalPreview,
    unsupportedFeatures: input.unsupportedFeatures,
    advisoryOnly: true,
    boundaries: BOUNDARIES,
  };
}

function statusFromFindings(
  errors: AutomationValidationFinding[],
  warnings: AutomationValidationFinding[],
): AutomationDryRunStatus {
  if (errors.length > 0) {
    return "fail";
  }
  if (warnings.length > 0) {
    return "warn";
  }
  return "pass";
}

function workflowIdFromInput(input: unknown): string | undefined {
  if (input && typeof input === "object" && "workflowId" in input) {
    const workflowId = (input as { workflowId?: unknown }).workflowId;
    return typeof workflowId === "string" && workflowId.trim()
      ? workflowId.slice(0, 120)
      : undefined;
  }
  return undefined;
}

function buildFinding(input: {
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  nodeId?: string;
  edgeId?: string;
  triggerId?: string;
  metadata?: AutomationSafeMetadata;
}): AutomationValidationFinding {
  const hash = createHash("sha256")
    .update([
      input.severity,
      input.reasonCode,
      input.nodeId ?? "",
      input.edgeId ?? "",
      input.triggerId ?? "",
      input.safeMessage,
      JSON.stringify(input.metadata ?? {}),
    ].join(":"))
    .digest("hex")
    .slice(0, 12);

  return {
    id: `autodryfind_${hash}`,
    severity: input.severity,
    reasonCode: input.reasonCode,
    safeMessage: input.safeMessage,
    ...(input.nodeId ? { nodeId: input.nodeId } : {}),
    ...(input.edgeId ? { edgeId: input.edgeId } : {}),
    ...(input.triggerId ? { triggerId: input.triggerId } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };
}

export function summarizeDryRunRisk(nodes: AutomationNode[]): AutomationRiskSummary {
  const summary: AutomationRiskSummary = {
    maxRiskLevel: "low",
    criticalNodeCount: 0,
    highNodeCount: 0,
    mediumNodeCount: 0,
    lowNodeCount: 0,
    requiredPermissionCount: 0,
    approvalNodeCount: 0,
    futureOnlyNodeCount: 0,
    disabledNodeCount: 0,
  };

  for (const node of nodes) {
    if (node.riskLevel === "critical") {
      summary.criticalNodeCount += 1;
    } else if (node.riskLevel === "high") {
      summary.highNodeCount += 1;
    } else if (node.riskLevel === "medium") {
      summary.mediumNodeCount += 1;
    } else {
      summary.lowNodeCount += 1;
    }

    summary.requiredPermissionCount += node.requiredPermissions.length;
    if (node.category === "approval_request") {
      summary.approvalNodeCount += 1;
    }
    if (node.futureOnly === true) {
      summary.futureOnlyNodeCount += 1;
    }
    if (node.disabled === true) {
      summary.disabledNodeCount += 1;
    }
  }

  summary.maxRiskLevel = nodes.reduce<AutomationRiskLevel>((current, node) =>
    RISK_ORDER.indexOf(node.riskLevel) > RISK_ORDER.indexOf(current)
      ? node.riskLevel
      : current,
  "low");

  return summary;
}
