export type AutomationWorkflowSchemaVersion = "1.0";

export type AutomationValidationStatus = "pass" | "warn" | "fail";

export type AutomationRiskLevel = "low" | "medium" | "high" | "critical";

export type AutomationTriggerType =
  | "manual"
  | "schedule"
  | "webhook"
  | "event"
  | "inbox_notification"
  | "channel_message"
  | "file_store_change_future"
  | "external_connector_event_future";

export type AutomationNodeCategory =
  | "transform"
  | "condition"
  | "approval_request"
  | "notification"
  | "action_proposal"
  | "human_input"
  | "data_read"
  | "connector_call_future"
  | "data_write_future_gated"
  | "wait_timer"
  | "branch_merge"
  | "loop"
  | "error_handler";

export type AutomationSafeMetadataValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | boolean[];

export type AutomationSafeMetadata = Record<string, AutomationSafeMetadataValue>;

export interface AutomationTrigger {
  triggerId: string;
  type: AutomationTriggerType;
  enabled: boolean;
  futureOnly?: boolean | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface AutomationPermissionRequirement {
  permissionId: string;
  scope?: string | undefined;
  reason: string;
}

export interface AutomationWorkflow {
  workflowId: string;
  schemaVersion: AutomationWorkflowSchemaVersion;
  version: string;
  name: string;
  description?: string | undefined;
  dryRunOnly: true;
  triggers: AutomationTrigger[];
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  variables?: Record<string, unknown> | undefined;
  permissions: AutomationPermissionRequirement[];
  approvalPolicy?: Record<string, unknown> | undefined;
  retryPolicy?: Record<string, unknown> | undefined;
  timeoutPolicy?: Record<string, unknown> | undefined;
  redactionPolicy?: Record<string, unknown> | undefined;
  auditPolicy?: Record<string, unknown> | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface AutomationNode {
  nodeId: string;
  type: string;
  category: AutomationNodeCategory;
  label?: string | undefined;
  inputSchema?: Record<string, unknown> | undefined;
  outputSchema?: Record<string, unknown> | undefined;
  riskLevel: AutomationRiskLevel;
  requiredPermissions: AutomationPermissionRequirement[];
  dryRunBehavior: Record<string, unknown>;
  executionBehavior?: null | undefined;
  redactionRules?: Record<string, unknown> | undefined;
  disabled?: boolean | undefined;
  futureOnly?: boolean | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface AutomationEdge {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  condition?: Record<string, unknown> | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface AutomationValidationFinding {
  id: string;
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  nodeId?: string;
  edgeId?: string;
  triggerId?: string;
  metadata?: AutomationSafeMetadata;
}

export interface AutomationNodeSummary {
  nodeId: string;
  category: AutomationNodeCategory;
  riskLevel: AutomationRiskLevel;
  disabled?: boolean;
  futureOnly?: boolean;
  requiredPermissionCount: number;
  status: AutomationValidationStatus;
}

export interface AutomationEdgeSummary {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  status: AutomationValidationStatus;
}

export interface AutomationRiskSummary {
  maxRiskLevel: AutomationRiskLevel;
  criticalNodeCount: number;
  highNodeCount: number;
  mediumNodeCount: number;
  lowNodeCount: number;
  requiredPermissionCount: number;
  approvalNodeCount: number;
  futureOnlyNodeCount: number;
  disabledNodeCount: number;
}

export interface AutomationValidationBoundaries {
  noExecution: true;
  noNodeRuns: true;
  noStoreMutation: true;
  noLocksCreated: true;
  noProviderCalls: true;
  noNetwork: true;
  noActionDispatch: true;
  noProposalCreation: true;
  noApprovalExecution: true;
  noCredentialAccess: true;
}

export interface AutomationValidationResult {
  validationId: string;
  createdAt: string;
  schemaVersion: AutomationWorkflowSchemaVersion;
  valid: boolean;
  status: AutomationValidationStatus;
  errors: AutomationValidationFinding[];
  warnings: AutomationValidationFinding[];
  nodeSummaries: AutomationNodeSummary[];
  edgeSummaries: AutomationEdgeSummary[];
  riskSummary: AutomationRiskSummary;
  unsupportedFeatures: string[];
  advisoryOnly: true;
  boundaries: AutomationValidationBoundaries;
}
