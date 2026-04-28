import type {
  AutomationEdgeSummary,
  AutomationNodeCategory,
  AutomationPermissionRequirement,
  AutomationRiskLevel,
  AutomationRiskSummary,
  AutomationSafeMetadata,
  AutomationValidationFinding,
  AutomationValidationResult,
  AutomationWorkflowSchemaVersion,
} from "./types.js";

export type AutomationDryRunStatus = "pass" | "warn" | "fail";

export type AutomationNodeDryRunStatus =
  | "simulated"
  | "skipped"
  | "blocked"
  | "failed"
  | "unsupported";

export type AutomationDryRunEdgeStatus = "simulated" | "skipped" | "blocked";

export interface AutomationDryRunNodeResult {
  nodeId: string;
  category: AutomationNodeCategory;
  status: AutomationNodeDryRunStatus;
  safeMessage: string;
  riskLevel: AutomationRiskLevel;
  requiredPermissionCount: number;
  previewOnly: true;
  wouldRequireApproval?: boolean | undefined;
  wouldRequireSecondApproval?: boolean | undefined;
  unsupportedReasonCode?: string | undefined;
  metadata?: AutomationSafeMetadata | undefined;
}

export interface AutomationDryRunEdgeEvaluation {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  status: AutomationDryRunEdgeStatus;
  safeMessage: string;
  metadata?: AutomationSafeMetadata | undefined;
}

export interface AutomationPermissionPreview {
  requiredPermissions: AutomationPermissionRequirement[];
  missingPermissionMetadata: string[];
  totalRequiredPermissionCount: number;
  advisoryOnly: true;
}

export interface AutomationApprovalPreviewEntry {
  nodeId: string;
  category: AutomationNodeCategory;
  riskLevel: AutomationRiskLevel;
  reasonCode: string;
  safeMessage: string;
}

export interface AutomationApprovalPreview {
  requiredApprovals: AutomationApprovalPreviewEntry[];
  secondApprovalPreviewRequired: boolean;
  advisoryOnly: true;
}

export interface AutomationDryRunBoundaries {
  noExecution: true;
  noNodeRuns: true;
  noStoreMutation: true;
  noLocksCreated: true;
  noProviderCalls: true;
  noNetwork: true;
  noActionDispatch: true;
  noProposalCreation: true;
  noApprovalExecution: true;
  noNotificationDelivery: true;
  noCredentialAccess: true;
}

export interface AutomationDryRunResult {
  dryRunId: string;
  createdAt: string;
  workflowId?: string | undefined;
  schemaVersion: AutomationWorkflowSchemaVersion;
  valid: boolean;
  status: AutomationDryRunStatus;
  validation: AutomationValidationResult;
  nodeRuns: AutomationDryRunNodeResult[];
  edgeEvaluations: AutomationDryRunEdgeEvaluation[];
  warnings: AutomationValidationFinding[];
  errors: AutomationValidationFinding[];
  riskSummary: AutomationRiskSummary;
  permissionPreview: AutomationPermissionPreview;
  approvalPreview: AutomationApprovalPreview;
  unsupportedFeatures: string[];
  advisoryOnly: true;
  boundaries: AutomationDryRunBoundaries;
}

export type AutomationGraphLimitKind = "node" | "edge";

export interface AutomationDryRunGraphSummary {
  nodeOrder: string[];
  edgeCount: number;
  disconnectedNodeCount: number;
}

export type AutomationDryRunEdgeSummary = AutomationEdgeSummary;
