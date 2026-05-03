import type { IntegrationActionExecutionResult } from "../integrations/actions/executors/types.js";
import type {
  IntegrationActionIntegration,
  IntegrationActionName,
  IntegrationActionRiskLevel,
} from "../integrations/actions/types.js";

export type ViernesBridgeSource = "whatsapp" | "local" | "api";

export type ViernesBridgeStatus =
  | "accepted"
  | "needs_approval"
  | "blocked"
  | "dry_run_ready"
  | "read_only_executed"
  | "no_action"
  | "error";

export type ViernesBridgeIntent =
  | "check_github_repo_status"
  | "validate_whatsapp_bridge"
  | "prepare_whatsapp_reply"
  | "send_whatsapp_message"
  | "trigger_n8n_workflow"
  | "create_github_issue"
  | "create_github_repo"
  | "deploy_coolify"
  | "invoke_openclaw_tool"
  | "run_browser_task"
  | "index_lightrag_document"
  | "run_model_prompt"
  | "unknown";

export interface ViernesBridgeRequest {
  id: string;
  source: ViernesBridgeSource;
  userId?: string;
  clientId?: string;
  messageText: string;
  intent?: ViernesBridgeIntent;
  context?: Record<string, unknown>;
  requestedAt: string;
}

export interface ViernesProposedActionMapping {
  intent: ViernesBridgeIntent;
  integration: IntegrationActionIntegration;
  action: IntegrationActionName;
  riskLevel: IntegrationActionRiskLevel;
  requiresApproval: boolean;
  dryRunOnly: boolean;
  title: string;
  description: string;
}

export interface ViernesBridgeProposedActionSummary {
  id: string;
  integration: IntegrationActionIntegration;
  action: IntegrationActionName;
  title: string;
  riskLevel: IntegrationActionRiskLevel;
  requiresApproval: boolean;
  dryRunOnly: boolean;
}

export interface ViernesBridgeApprovalSummary {
  id: string;
  actionId: string;
  integration: IntegrationActionIntegration;
  action: IntegrationActionName;
  riskLevel: IntegrationActionRiskLevel;
  status: "pending" | "approved" | "rejected" | "expired";
  requiredBecause: readonly string[];
  expiresAt: string;
}

export interface ViernesBridgeResponse {
  requestId: string;
  status: ViernesBridgeStatus;
  summary: string;
  proposedActions: readonly ViernesBridgeProposedActionSummary[];
  blockedReasons?: readonly string[];
  approvalRequests?: readonly ViernesBridgeApprovalSummary[];
  executionResults?: readonly IntegrationActionExecutionResult[];
  auditIds?: readonly string[];
  createdAt: string;
}
