import type {
  AutomationDryRunBoundaries,
  AutomationDryRunResult,
  AutomationDryRunStatus,
} from "./dryRunTypes.js";
import type {
  AutomationRiskSummary,
  AutomationSafeMetadata,
  AutomationSafeMetadataValue,
  AutomationValidationFinding,
  AutomationWorkflowSchemaVersion,
} from "./types.js";

const TRACE_ID_PREFIX = "autodrytrace";
const MAX_SAFE_STRING_LENGTH = 160;
const MAX_SAFE_ARRAY_LENGTH = 20;
const SENSITIVE_METADATA_KEY_PATTERN =
  /credential|token|secret|password|apiKey|api_key|bearer|requestBody|rawBody|proposalParameter|notificationBody/i;
const PATH_LIKE_PATTERN =
  /^(?:\/|~\/|[a-zA-Z]:[\\/]|\\\\)|(?:\/home\/|\/tmp\/|\\Users\\|\\wsl\$)/;

export interface AutomationDryRunTraceFinding {
  severity: AutomationValidationFinding["severity"];
  reasonCode: string;
  safeMessage: string;
  nodeId?: string | undefined;
  edgeId?: string | undefined;
  triggerId?: string | undefined;
  metadata?: AutomationSafeMetadata | undefined;
}

export interface AutomationDryRunTraceSummary {
  nodeCount: number;
  edgeCount: number;
  simulatedNodeCount: number;
  skippedNodeCount: number;
  blockedNodeCount: number;
  unsupportedNodeCount: number;
  failedNodeCount: number;
  approvalPreviewCount: number;
  secondApprovalPreviewRequired: boolean;
  requiredPermissionCount: number;
  warningCount: number;
  errorCount: number;
}

export interface AutomationDryRunTraceReport extends AutomationDryRunTraceSummary {
  traceId: string;
  createdAt: string;
  workflowId?: string | undefined;
  dryRunId: string;
  schemaVersion: AutomationWorkflowSchemaVersion;
  status: AutomationDryRunStatus;
  valid: boolean;
  riskSummary: AutomationRiskSummary;
  unsupportedFeatures: string[];
  warnings: AutomationDryRunTraceFinding[];
  errors: AutomationDryRunTraceFinding[];
  boundaries: AutomationDryRunBoundaries;
  advisoryOnly: true;
}

export function buildAutomationDryRunTraceReport(
  dryRunResult: AutomationDryRunResult,
): AutomationDryRunTraceReport {
  const summary = summarizeDryRunTrace(dryRunResult);

  return {
    traceId: traceIdFromDryRunId(dryRunResult.dryRunId),
    createdAt: dryRunResult.createdAt,
    ...(dryRunResult.workflowId ? { workflowId: dryRunResult.workflowId } : {}),
    dryRunId: dryRunResult.dryRunId,
    schemaVersion: dryRunResult.schemaVersion,
    status: dryRunResult.status,
    valid: dryRunResult.valid,
    ...summary,
    riskSummary: { ...dryRunResult.riskSummary },
    unsupportedFeatures: dryRunResult.unsupportedFeatures
      .map((feature) => sanitizeString(feature))
      .filter((feature) => feature.length > 0),
    warnings: dryRunResult.warnings.map(safeFinding),
    errors: dryRunResult.errors.map(safeFinding),
    boundaries: { ...dryRunResult.boundaries },
    advisoryOnly: true,
  };
}

export function summarizeDryRunTrace(
  dryRunResult: AutomationDryRunResult,
): AutomationDryRunTraceSummary {
  return {
    nodeCount: dryRunResult.nodeRuns.length,
    edgeCount: dryRunResult.edgeEvaluations.length,
    simulatedNodeCount: dryRunResult.nodeRuns.filter((node) => node.status === "simulated").length,
    skippedNodeCount: dryRunResult.nodeRuns.filter((node) => node.status === "skipped").length,
    blockedNodeCount: dryRunResult.nodeRuns.filter((node) => node.status === "blocked").length,
    unsupportedNodeCount: dryRunResult.nodeRuns.filter((node) => node.status === "unsupported").length,
    failedNodeCount: dryRunResult.nodeRuns.filter((node) => node.status === "failed").length,
    approvalPreviewCount: dryRunResult.approvalPreview.requiredApprovals.length,
    secondApprovalPreviewRequired: dryRunResult.approvalPreview.secondApprovalPreviewRequired,
    requiredPermissionCount: dryRunResult.permissionPreview.totalRequiredPermissionCount,
    warningCount: dryRunResult.warnings.length,
    errorCount: dryRunResult.errors.length,
  };
}

function safeFinding(finding: AutomationValidationFinding): AutomationDryRunTraceFinding {
  const metadata = sanitizeMetadata(finding.metadata);

  return {
    severity: finding.severity,
    reasonCode: sanitizeString(finding.reasonCode),
    safeMessage: sanitizeString(finding.safeMessage),
    ...(finding.nodeId ? { nodeId: sanitizeString(finding.nodeId) } : {}),
    ...(finding.edgeId ? { edgeId: sanitizeString(finding.edgeId) } : {}),
    ...(finding.triggerId ? { triggerId: sanitizeString(finding.triggerId) } : {}),
    ...(metadata ? { metadata } : {}),
  };
}

function sanitizeMetadata(
  metadata: AutomationSafeMetadata | undefined,
): AutomationSafeMetadata | undefined {
  if (!metadata) {
    return undefined;
  }

  const safeEntries = Object.entries(metadata).map(([key, value]) => [
    sanitizeString(key),
    sanitizeMetadataValue(key, value),
  ] as const);

  return Object.fromEntries(safeEntries);
}

function sanitizeMetadataValue(
  key: string,
  value: AutomationSafeMetadataValue,
): AutomationSafeMetadataValue {
  if (SENSITIVE_METADATA_KEY_PATTERN.test(key)) {
    return "[redacted-sensitive-metadata]";
  }

  if (Array.isArray(value)) {
    return value.slice(0, MAX_SAFE_ARRAY_LENGTH).map((entry) =>
      typeof entry === "string" ? sanitizeString(entry) : entry,
    ) as AutomationSafeMetadataValue;
  }

  return typeof value === "string" ? sanitizeString(value) : value;
}

function sanitizeString(value: string): string {
  const trimmed = value.trim();
  if (PATH_LIKE_PATTERN.test(trimmed)) {
    return "[redacted-path]";
  }
  return trimmed.slice(0, MAX_SAFE_STRING_LENGTH);
}

function traceIdFromDryRunId(dryRunId: string): string {
  const safeDryRunId = sanitizeString(dryRunId)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 96);

  return `${TRACE_ID_PREFIX}_${safeDryRunId || "unknown"}`;
}
