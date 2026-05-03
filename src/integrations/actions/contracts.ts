import type {
  IntegrationActionContract,
  IntegrationActionIntegration,
  IntegrationActionName,
  IntegrationActionRiskLevel,
} from "./types.js";

function contract(
  integration: IntegrationActionIntegration,
  action: IntegrationActionName,
  minimumRiskLevel: IntegrationActionRiskLevel,
  options: {
    requiresApproval: boolean;
    externalEffect: boolean;
    destructive?: boolean;
    evidenceRequired?: boolean;
    rollbackRequired?: boolean;
    description: string;
    blockedOperations: readonly string[];
  },
): IntegrationActionContract {
  const defaultEvidenceRequired =
    minimumRiskLevel === "high" || minimumRiskLevel === "critical";
  return {
    integration,
    action,
    minimumRiskLevel,
    requiresApproval: options.requiresApproval,
    externalEffect: options.externalEffect,
    destructive: options.destructive ?? false,
    evidenceRequired: options.evidenceRequired ?? defaultEvidenceRequired,
    rollbackRequired: options.rollbackRequired ?? minimumRiskLevel === "critical",
    description: options.description,
    blockedOperations: options.blockedOperations,
  };
}

export const INTEGRATION_ACTION_CONTRACTS: readonly IntegrationActionContract[] = [
  contract("github", "create_repo", "high", {
    requiresApproval: true,
    externalEffect: true,
    destructive: false,
    description: "Propose creating a GitHub repository.",
    blockedOperations: ["repository creation", "initial commits", "remote settings mutation"],
  }),
  contract("github", "create_issue", "medium", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose creating a GitHub issue.",
    blockedOperations: ["issue creation", "labels mutation", "assignee mutation"],
  }),
  contract("github", "open_pull_request", "high", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose opening a pull request.",
    blockedOperations: ["branch push", "pull request creation", "reviewer mutation"],
  }),
  contract("github", "read_repo_status", "low", {
    requiresApproval: true,
    externalEffect: true,
    evidenceRequired: false,
    description: "Propose reading repository status metadata.",
    blockedOperations: ["writes", "commits", "branch mutation"],
  }),

  contract("n8n", "trigger_workflow", "high", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose triggering an n8n workflow.",
    blockedOperations: ["webhook call", "workflow execution", "payload delivery"],
  }),
  contract("n8n", "validate_webhook", "low", {
    requiresApproval: true,
    externalEffect: true,
    evidenceRequired: false,
    description: "Propose validating webhook configuration without invoking it.",
    blockedOperations: ["production webhook call", "workflow execution"],
  }),
  contract("n8n", "import_workflow", "high", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose importing an n8n workflow.",
    blockedOperations: ["workflow import", "activation", "credential mutation"],
  }),

  contract("whatsapp", "send_message", "high", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose sending a WhatsApp message.",
    blockedOperations: ["message send", "provider send API call"],
  }),
  contract("whatsapp", "validate_bridge", "low", {
    requiresApproval: false,
    externalEffect: false,
    evidenceRequired: false,
    description: "Propose validating local bridge readiness.",
    blockedOperations: ["inbound webhook simulation", "message send"],
  }),
  contract("whatsapp", "prepare_reply", "medium", {
    requiresApproval: true,
    externalEffect: false,
    description: "Propose preparing a reply without sending it.",
    blockedOperations: ["message send", "provider API call"],
  }),

  contract("openclaw", "invoke_tool", "critical", {
    requiresApproval: true,
    externalEffect: true,
    destructive: true,
    description: "Propose invoking an OpenClaw tool.",
    blockedOperations: ["tool invocation", "remote execution", "filesystem mutation"],
  }),
  contract("openclaw", "run_browser_task", "critical", {
    requiresApproval: true,
    externalEffect: true,
    destructive: true,
    description: "Propose running an OpenClaw browser task.",
    blockedOperations: ["browser automation", "remote task execution", "form submission"],
  }),
  contract("openclaw", "run_desktop_task", "critical", {
    requiresApproval: true,
    externalEffect: true,
    destructive: true,
    description: "Propose running an OpenClaw desktop task.",
    blockedOperations: ["desktop automation", "local input", "filesystem mutation"],
  }),

  contract("lightrag", "index_document", "high", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose indexing a document in LightRAG.",
    blockedOperations: ["document upload", "embedding creation", "vector store mutation"],
  }),
  contract("lightrag", "query_context", "medium", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose querying LightRAG context.",
    blockedOperations: ["RAG query", "prompt context retrieval"],
  }),
  contract("lightrag", "refresh_index", "critical", {
    requiresApproval: true,
    externalEffect: true,
    destructive: true,
    description: "Propose refreshing a LightRAG index.",
    blockedOperations: ["index rebuild", "embedding mutation", "collection mutation"],
  }),

  contract("coolify", "create_project", "high", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose creating a Coolify project.",
    blockedOperations: ["project creation", "server association"],
  }),
  contract("coolify", "create_application", "critical", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose creating a Coolify application.",
    blockedOperations: ["application creation", "environment setup", "domain mutation"],
  }),
  contract("coolify", "deploy_application", "critical", {
    requiresApproval: true,
    externalEffect: true,
    destructive: true,
    description: "Propose deploying a Coolify application.",
    blockedOperations: ["deployment", "service restart", "image build"],
  }),
  contract("coolify", "set_environment_variable", "critical", {
    requiresApproval: true,
    externalEffect: true,
    destructive: true,
    description: "Propose setting a Coolify environment variable.",
    blockedOperations: ["remote environment mutation", "secret mutation", "service restart"],
  }),

  contract("openai", "run_model_prompt", "medium", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose running an OpenAI model prompt.",
    blockedOperations: ["model invocation", "prompt submission", "token spend"],
  }),
  contract("openai", "classify_task", "medium", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose classifying a task with OpenAI.",
    blockedOperations: ["model invocation", "prompt submission", "token spend"],
  }),
  contract("openai", "summarize_context", "medium", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose summarizing context with OpenAI.",
    blockedOperations: ["model invocation", "prompt submission", "token spend"],
  }),

  contract("anthropic", "run_model_prompt", "medium", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose running an Anthropic model prompt.",
    blockedOperations: ["model invocation", "message creation", "token spend"],
  }),
  contract("anthropic", "classify_task", "medium", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose classifying a task with Anthropic.",
    blockedOperations: ["model invocation", "message creation", "token spend"],
  }),
  contract("anthropic", "summarize_context", "medium", {
    requiresApproval: true,
    externalEffect: true,
    description: "Propose summarizing context with Anthropic.",
    blockedOperations: ["model invocation", "message creation", "token spend"],
  }),
];

export function getIntegrationActionContract(
  integration: IntegrationActionIntegration,
  action: IntegrationActionName,
): IntegrationActionContract | undefined {
  return INTEGRATION_ACTION_CONTRACTS.find(
    (contractEntry) =>
      contractEntry.integration === integration && contractEntry.action === action,
  );
}
