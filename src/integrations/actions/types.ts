export const INTEGRATION_ACTION_INTEGRATIONS = [
  "github",
  "n8n",
  "whatsapp",
  "openclaw",
  "lightrag",
  "coolify",
  "openai",
  "anthropic",
] as const;

export const INTEGRATION_ACTION_RISK_LEVELS = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type IntegrationActionIntegration =
  (typeof INTEGRATION_ACTION_INTEGRATIONS)[number];

export type IntegrationActionRiskLevel =
  (typeof INTEGRATION_ACTION_RISK_LEVELS)[number];

export type GitHubIntegrationAction =
  | "create_repo"
  | "create_issue"
  | "open_pull_request"
  | "read_repo_status";

export type N8nIntegrationAction =
  | "trigger_workflow"
  | "validate_webhook"
  | "import_workflow";

export type WhatsAppIntegrationAction =
  | "send_message"
  | "validate_bridge"
  | "prepare_reply";

export type OpenClawIntegrationAction =
  | "invoke_tool"
  | "run_browser_task"
  | "run_desktop_task";

export type LightRAGIntegrationAction =
  | "index_document"
  | "query_context"
  | "refresh_index";

export type CoolifyIntegrationAction =
  | "create_project"
  | "create_application"
  | "deploy_application"
  | "set_environment_variable";

export type ModelProviderIntegrationAction =
  | "run_model_prompt"
  | "classify_task"
  | "summarize_context";

export type IntegrationActionName =
  | GitHubIntegrationAction
  | N8nIntegrationAction
  | WhatsAppIntegrationAction
  | OpenClawIntegrationAction
  | LightRAGIntegrationAction
  | CoolifyIntegrationAction
  | ModelProviderIntegrationAction;

export interface IntegrationActionPlan {
  summary: string;
  steps: readonly string[];
}
export interface ProposedIntegrationAction {
  id: string;
  integration: IntegrationActionIntegration;
  action: IntegrationActionName;
  title: string;
  description: string;
  riskLevel: IntegrationActionRiskLevel;
  requiresApproval: boolean;
  approvalCode?: string;
  actToken?: string;
  dryRunOnly: boolean;
  input: Record<string, unknown>;
  expectedOutcome: string;
  blockedReasons?: readonly string[];
  evidencePlan?: IntegrationActionPlan;
  rollbackPlan?: IntegrationActionPlan;
  createdAt: string;
}

export interface IntegrationActionContract {
  integration: IntegrationActionIntegration;
  action: IntegrationActionName;
  minimumRiskLevel: IntegrationActionRiskLevel;
  requiresApproval: boolean;
  externalEffect: boolean;
  destructive: boolean;
  evidenceRequired: boolean;
  rollbackRequired: boolean;
  description: string;
  blockedOperations: readonly string[];
}

export interface IntegrationActionValidationResult {
  actionId: string;
  integration: IntegrationActionIntegration;
  action: IntegrationActionName;
  riskLevel: IntegrationActionRiskLevel;
  allowed: boolean;
  reasons: readonly string[];
  warnings: readonly string[];
}
