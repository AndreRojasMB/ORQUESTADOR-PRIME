import { createHash, randomUUID } from "node:crypto";
import type { ZodIssue } from "zod";

import {
  automationWorkflowSchema,
  FORBIDDEN_AUTOMATION_KEYS,
} from "./workflowSchema.js";
import type {
  AutomationEdge,
  AutomationEdgeSummary,
  AutomationNode,
  AutomationNodeSummary,
  AutomationRiskLevel,
  AutomationRiskSummary,
  AutomationSafeMetadata,
  AutomationValidationBoundaries,
  AutomationValidationFinding,
  AutomationValidationResult,
  AutomationValidationStatus,
  AutomationWorkflow,
} from "./types.js";

const VALIDATION_SCHEMA_VERSION = "1.0";
const FORBIDDEN_KEY_SET = new Set<string>(
  FORBIDDEN_AUTOMATION_KEYS.map((key) => key.toLowerCase()),
);
const FUTURE_NODE_CATEGORIES = new Set<string>([
  "connector_call_future",
  "data_write_future_gated",
]);
const RISK_ORDER: AutomationRiskLevel[] = ["low", "medium", "high", "critical"];

const BOUNDARIES: AutomationValidationBoundaries = {
  noExecution: true,
  noNodeRuns: true,
  noStoreMutation: true,
  noLocksCreated: true,
  noProviderCalls: true,
  noNetwork: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noApprovalExecution: true,
  noCredentialAccess: true,
};

export function validateAutomationWorkflow(
  input: unknown,
): AutomationValidationResult {
  const createdAt = new Date().toISOString();
  const errors: AutomationValidationFinding[] = [];
  const warnings: AutomationValidationFinding[] = [];
  const unsupportedFeatures = new Set<string>();

  errors.push(...findForbiddenKeys(input));

  const parsed = automationWorkflowSchema.safeParse(input);
  if (!parsed.success) {
    errors.push(...schemaFindings(parsed.error.issues));
    return buildResult({
      createdAt,
      errors,
      warnings,
      nodeSummaries: [],
      edgeSummaries: [],
      riskSummary: emptyRiskSummary(),
      unsupportedFeatures: [...unsupportedFeatures].sort(),
    });
  }

  const workflow = parsed.data;
  validateTriggers(workflow, errors, warnings, unsupportedFeatures);
  validateWorkflowPermissions(workflow, errors);
  validateNodes(workflow, errors, warnings, unsupportedFeatures);
  validateEdges(workflow, errors);
  validateCycles(workflow, errors);

  return buildResult({
    createdAt,
    errors,
    warnings,
    nodeSummaries: summarizeNodes(workflow.nodes, errors, warnings),
    edgeSummaries: summarizeEdges(workflow.edges, errors, warnings),
    riskSummary: summarizeRisk(workflow.nodes),
    unsupportedFeatures: [...unsupportedFeatures].sort(),
  });
}

function validateTriggers(
  workflow: AutomationWorkflow,
  errors: AutomationValidationFinding[],
  warnings: AutomationValidationFinding[],
  unsupportedFeatures: Set<string>,
): void {
  const seen = new Set<string>();
  for (const trigger of workflow.triggers) {
    if (seen.has(trigger.triggerId)) {
      errors.push(buildFinding({
        severity: "fail",
        reasonCode: "automation.trigger.duplicate_id",
        safeMessage: "Trigger id must be unique.",
        triggerId: trigger.triggerId,
      }));
    }
    seen.add(trigger.triggerId);

    if (trigger.type === "manual") {
      continue;
    }

    unsupportedFeatures.add(`trigger:${trigger.type}`);
    if (trigger.enabled && trigger.futureOnly !== true) {
      errors.push(buildFinding({
        severity: "fail",
        reasonCode: "automation.trigger.future_enabled",
        safeMessage: "Only manual triggers may be enabled in this phase.",
        triggerId: trigger.triggerId,
        metadata: { triggerType: trigger.type },
      }));
    } else {
      warnings.push(buildFinding({
        severity: "warn",
        reasonCode: "automation.trigger.future_disabled",
        safeMessage: "Future trigger is recognized but not activatable.",
        triggerId: trigger.triggerId,
        metadata: { triggerType: trigger.type },
      }));
    }
  }
}

function validateWorkflowPermissions(
  workflow: AutomationWorkflow,
  errors: AutomationValidationFinding[],
): void {
  const nodePermissionCount = workflow.nodes.reduce(
    (total, node) => total + node.requiredPermissions.length,
    0,
  );
  if (nodePermissionCount > 0 && workflow.permissions.length === 0) {
    errors.push(buildFinding({
      severity: "fail",
      reasonCode: "automation.workflow.permissions_missing",
      safeMessage: "Workflow permissions must be declared when nodes require permissions.",
      metadata: { nodePermissionCount },
    }));
  }
}

function validateNodes(
  workflow: AutomationWorkflow,
  errors: AutomationValidationFinding[],
  warnings: AutomationValidationFinding[],
  unsupportedFeatures: Set<string>,
): void {
  const seen = new Set<string>();
  for (const node of workflow.nodes) {
    if (seen.has(node.nodeId)) {
      errors.push(buildFinding({
        severity: "fail",
        reasonCode: "automation.node.duplicate_id",
        safeMessage: "Node id must be unique.",
        nodeId: node.nodeId,
      }));
    }
    seen.add(node.nodeId);

    if (node.requiredPermissions.length === 0) {
      warnings.push(buildFinding({
        severity: "warn",
        reasonCode: "automation.node.permissions_empty",
        safeMessage: "Node has an explicit but empty permissions list.",
        nodeId: node.nodeId,
      }));
    }

    if (node.category === "approval_request" && !hasNodeApprovalPolicy(workflow, node)) {
      errors.push(buildFinding({
        severity: "fail",
        reasonCode: "automation.node.approval_policy_missing",
        safeMessage: "Approval request nodes require an approval policy.",
        nodeId: node.nodeId,
      }));
    }

    if (node.category === "loop" && !isFutureDisabled(node)) {
      errors.push(buildFinding({
        severity: "fail",
        reasonCode: "automation.node.loop_enabled",
        safeMessage: "Loop nodes are not enabled until bounded loop rules exist.",
        nodeId: node.nodeId,
      }));
    }

    if (FUTURE_NODE_CATEGORIES.has(node.category)) {
      unsupportedFeatures.add(`node:${node.category}`);
      if (!isFutureDisabled(node)) {
        errors.push(buildFinding({
          severity: "fail",
          reasonCode: "automation.node.future_enabled",
          safeMessage: "Future node category must be disabled or marked future-only.",
          nodeId: node.nodeId,
          metadata: { category: node.category },
        }));
      } else {
        warnings.push(buildFinding({
          severity: "warn",
          reasonCode: "automation.node.future_disabled",
          safeMessage: "Future node category is recognized but not activatable.",
          nodeId: node.nodeId,
          metadata: { category: node.category },
        }));
      }
    }
  }
}

function validateEdges(
  workflow: AutomationWorkflow,
  errors: AutomationValidationFinding[],
): void {
  const nodeIds = new Set(workflow.nodes.map((node) => node.nodeId));
  const edgeIds = new Set<string>();
  for (const edge of workflow.edges) {
    if (edgeIds.has(edge.edgeId)) {
      errors.push(buildFinding({
        severity: "fail",
        reasonCode: "automation.edge.duplicate_id",
        safeMessage: "Edge id must be unique.",
        edgeId: edge.edgeId,
      }));
    }
    edgeIds.add(edge.edgeId);

    if (!nodeIds.has(edge.fromNodeId)) {
      errors.push(buildFinding({
        severity: "fail",
        reasonCode: "automation.edge.from_missing",
        safeMessage: "Edge source node does not exist.",
        edgeId: edge.edgeId,
      }));
    }
    if (!nodeIds.has(edge.toNodeId)) {
      errors.push(buildFinding({
        severity: "fail",
        reasonCode: "automation.edge.to_missing",
        safeMessage: "Edge target node does not exist.",
        edgeId: edge.edgeId,
      }));
    }
    if (edge.fromNodeId === edge.toNodeId) {
      errors.push(buildFinding({
        severity: "fail",
        reasonCode: "automation.edge.self_cycle",
        safeMessage: "Self-referential edges are not allowed.",
        edgeId: edge.edgeId,
      }));
    }
  }
}

function validateCycles(
  workflow: AutomationWorkflow,
  errors: AutomationValidationFinding[],
): void {
  const nodeIds = new Set(workflow.nodes.map((node) => node.nodeId));
  const adjacency = new Map<string, string[]>();
  for (const nodeId of nodeIds) {
    adjacency.set(nodeId, []);
  }
  for (const edge of workflow.edges) {
    if (nodeIds.has(edge.fromNodeId) && nodeIds.has(edge.toNodeId)) {
      adjacency.get(edge.fromNodeId)?.push(edge.toNodeId);
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const cycleNode = [...nodeIds].find((nodeId) =>
    hasCycle(nodeId, adjacency, visiting, visited),
  );

  if (cycleNode) {
    errors.push(buildFinding({
      severity: "fail",
      reasonCode: "automation.graph.cycle_detected",
      safeMessage: "Workflow graph cycles are not allowed in this phase.",
      nodeId: cycleNode,
    }));
  }
}

function hasCycle(
  nodeId: string,
  adjacency: Map<string, string[]>,
  visiting: Set<string>,
  visited: Set<string>,
): boolean {
  if (visited.has(nodeId)) {
    return false;
  }
  if (visiting.has(nodeId)) {
    return true;
  }

  visiting.add(nodeId);
  for (const nextNodeId of adjacency.get(nodeId) ?? []) {
    if (hasCycle(nextNodeId, adjacency, visiting, visited)) {
      return true;
    }
  }
  visiting.delete(nodeId);
  visited.add(nodeId);
  return false;
}

function findForbiddenKeys(input: unknown): AutomationValidationFinding[] {
  const findings: AutomationValidationFinding[] = [];
  const visited = new WeakSet<object>();

  function visit(value: unknown, path: string[]): void {
    if (value === null || typeof value !== "object") {
      return;
    }
    if (visited.has(value)) {
      return;
    }
    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, [...path, String(index)]));
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      if (FORBIDDEN_KEY_SET.has(key.toLowerCase())) {
        findings.push(buildFinding({
          severity: "fail",
          reasonCode: "automation.credential_like_key",
          safeMessage: "Workflow contains a forbidden credential-like key.",
          metadata: {
            keyName: key,
            pathDepth: path.length,
          },
        }));
      }
      visit(child, [...path, key]);
    }
  }

  visit(input, []);
  return findings;
}

function schemaFindings(issues: ZodIssue[]): AutomationValidationFinding[] {
  return issues.map((issue) =>
    buildFinding({
      severity: "fail",
      reasonCode: "automation.schema.invalid",
      safeMessage: "Workflow schema validation failed.",
      metadata: {
        path: issue.path.map(String).join(".").slice(0, 120),
        code: issue.code,
      },
    }),
  );
}

function hasNodeApprovalPolicy(
  workflow: AutomationWorkflow,
  node: AutomationNode,
): boolean {
  return Boolean(workflow.approvalPolicy ?? node.metadata?.approvalPolicy);
}

function isFutureDisabled(node: AutomationNode): boolean {
  return node.disabled === true || node.futureOnly === true;
}

function summarizeNodes(
  nodes: AutomationNode[],
  errors: AutomationValidationFinding[],
  warnings: AutomationValidationFinding[],
): AutomationNodeSummary[] {
  return nodes.map((node) => {
    const status = statusForNode(node.nodeId, errors, warnings);
    return {
      nodeId: node.nodeId,
      category: node.category,
      riskLevel: node.riskLevel,
      ...(node.disabled !== undefined ? { disabled: node.disabled } : {}),
      ...(node.futureOnly !== undefined ? { futureOnly: node.futureOnly } : {}),
      requiredPermissionCount: node.requiredPermissions.length,
      status,
    };
  });
}

function summarizeEdges(
  edges: AutomationEdge[],
  errors: AutomationValidationFinding[],
  warnings: AutomationValidationFinding[],
): AutomationEdgeSummary[] {
  return edges.map((edge) => ({
    edgeId: edge.edgeId,
    fromNodeId: edge.fromNodeId,
    toNodeId: edge.toNodeId,
    status: statusForEdge(edge.edgeId, errors, warnings),
  }));
}

function statusForNode(
  nodeId: string,
  errors: AutomationValidationFinding[],
  warnings: AutomationValidationFinding[],
): AutomationValidationStatus {
  if (errors.some((finding) => finding.nodeId === nodeId)) {
    return "fail";
  }
  if (warnings.some((finding) => finding.nodeId === nodeId)) {
    return "warn";
  }
  return "pass";
}

function statusForEdge(
  edgeId: string,
  errors: AutomationValidationFinding[],
  warnings: AutomationValidationFinding[],
): AutomationValidationStatus {
  if (errors.some((finding) => finding.edgeId === edgeId)) {
    return "fail";
  }
  if (warnings.some((finding) => finding.edgeId === edgeId)) {
    return "warn";
  }
  return "pass";
}

function summarizeRisk(nodes: AutomationNode[]): AutomationRiskSummary {
  const summary = emptyRiskSummary();
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

  summary.maxRiskLevel = maxRiskLevel(nodes.map((node) => node.riskLevel));
  return summary;
}

function emptyRiskSummary(): AutomationRiskSummary {
  return {
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
}

function maxRiskLevel(levels: AutomationRiskLevel[]): AutomationRiskLevel {
  return levels.reduce<AutomationRiskLevel>((current, next) =>
    RISK_ORDER.indexOf(next) > RISK_ORDER.indexOf(current) ? next : current,
  "low");
}

function buildResult(input: {
  createdAt: string;
  errors: AutomationValidationFinding[];
  warnings: AutomationValidationFinding[];
  nodeSummaries: AutomationNodeSummary[];
  edgeSummaries: AutomationEdgeSummary[];
  riskSummary: AutomationRiskSummary;
  unsupportedFeatures: string[];
}): AutomationValidationResult {
  const status: AutomationValidationStatus =
    input.errors.length > 0 ? "fail" : input.warnings.length > 0 ? "warn" : "pass";

  return {
    validationId: `autoval_${randomUUID()}`,
    createdAt: input.createdAt,
    schemaVersion: VALIDATION_SCHEMA_VERSION,
    valid: input.errors.length === 0,
    status,
    errors: input.errors,
    warnings: input.warnings,
    nodeSummaries: input.nodeSummaries,
    edgeSummaries: input.edgeSummaries,
    riskSummary: input.riskSummary,
    unsupportedFeatures: input.unsupportedFeatures,
    advisoryOnly: true,
    boundaries: BOUNDARIES,
  };
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
    id: `autofind_${hash}`,
    severity: input.severity,
    reasonCode: input.reasonCode,
    safeMessage: input.safeMessage,
    ...(input.nodeId ? { nodeId: input.nodeId } : {}),
    ...(input.edgeId ? { edgeId: input.edgeId } : {}),
    ...(input.triggerId ? { triggerId: input.triggerId } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };
}
