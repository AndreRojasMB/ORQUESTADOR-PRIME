import type { ProposedIntegrationAction } from "../integrations/actions/types.js";
import type {
  ViernesBridgeIntent,
  ViernesBridgeRequest,
  ViernesProposedActionMapping,
} from "./types.js";

const BASIC_EVIDENCE_PLAN = {
  summary: "Record safe bridge block decision only.",
  steps: ["Validate request.", "Confirm no provider write is executed."],
} as const;

const INTENT_MAPPINGS: readonly ViernesProposedActionMapping[] = [
  {
    intent: "check_github_repo_status",
    integration: "github",
    action: "read_repo_status",
    riskLevel: "low",
    requiresApproval: true,
    dryRunOnly: true,
    title: "Check GitHub repository status",
    description: "Read minimal GitHub repository metadata through the safe action gate.",
  },
  {
    intent: "validate_whatsapp_bridge",
    integration: "whatsapp",
    action: "validate_bridge",
    riskLevel: "low",
    requiresApproval: false,
    dryRunOnly: true,
    title: "Validate WhatsApp bridge",
    description: "Read the configured WhatsApp bridge health URL only.",
  },
  {
    intent: "prepare_whatsapp_reply",
    integration: "whatsapp",
    action: "prepare_reply",
    riskLevel: "medium",
    requiresApproval: true,
    dryRunOnly: true,
    title: "Prepare WhatsApp reply",
    description: "Prepare a WhatsApp reply draft without sending it.",
  },
];

const BLOCKED_INTENTS: Partial<Record<ViernesBridgeIntent, string>> = {
  send_whatsapp_message: "whatsapp_send_message_blocked",
  trigger_n8n_workflow: "n8n_workflow_execution_blocked",
  create_github_issue: "github_issue_creation_blocked",
  create_github_repo: "github_repo_creation_blocked",
  deploy_coolify: "coolify_deploy_blocked",
  invoke_openclaw_tool: "openclaw_tool_invocation_blocked",
  run_browser_task: "browser_task_execution_blocked",
  index_lightrag_document: "lightrag_indexing_blocked",
  run_model_prompt: "model_prompt_execution_blocked",
};

export interface ViernesActionMappingResult {
  actions: readonly ProposedIntegrationAction[];
  blockedReasons: readonly string[];
}

function nowIso(): string {
  return new Date().toISOString();
}

function safeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function contextText(
  request: ViernesBridgeRequest,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const value = request.context?.[key];
    if (typeof value !== "string") continue;
    const normalized = value.trim();
    if (normalized.length > 0) return normalized;
  }

  return undefined;
}

function actionInput(request: ViernesBridgeRequest): Record<string, unknown> {
  if (request.intent === "check_github_repo_status") {
    return {
      ...(contextText(request, ["owner", "githubOwner", "targetOwner"])
        ? { owner: contextText(request, ["owner", "githubOwner", "targetOwner"]) }
        : {}),
      ...(contextText(request, ["repo", "githubRepo", "targetRepo"])
        ? { repo: contextText(request, ["repo", "githubRepo", "targetRepo"]) }
        : {}),
    };
  }

  if (request.intent === "validate_whatsapp_bridge") {
    return {
      ...(contextText(request, ["targetUrl", "healthUrl", "url"])
        ? { targetUrl: contextText(request, ["targetUrl", "healthUrl", "url"]) }
        : {}),
    };
  }

  if (request.intent === "prepare_whatsapp_reply") {
    return {
      source: request.source,
      draftContext: "redacted_bridge_reply_context",
    };
  }

  return {};
}

function toAction(
  request: ViernesBridgeRequest,
  mapping: ViernesProposedActionMapping,
): ProposedIntegrationAction {
  return {
    id: `viernes-${safeId(request.id)}-${mapping.intent}`,
    integration: mapping.integration,
    action: mapping.action,
    title: mapping.title,
    description: mapping.description,
    riskLevel: mapping.riskLevel,
    requiresApproval: mapping.requiresApproval,
    dryRunOnly: mapping.dryRunOnly,
    input: actionInput(request),
    expectedOutcome: "A safe bridge action result without provider writes.",
    ...(mapping.riskLevel === "high" || mapping.riskLevel === "critical"
      ? { evidencePlan: BASIC_EVIDENCE_PLAN }
      : {}),
    createdAt: nowIso(),
  };
}

export function mapViernesRequestToActions(
  request: ViernesBridgeRequest,
): ViernesActionMappingResult {
  if (request.intent === "unknown" || !request.intent) {
    return { actions: [], blockedReasons: [] };
  }

  const blocked = BLOCKED_INTENTS[request.intent];
  if (blocked) {
    return { actions: [], blockedReasons: [blocked] };
  }

  const mapping = INTENT_MAPPINGS.find((entry) => entry.intent === request.intent);
  if (!mapping) {
    return { actions: [], blockedReasons: ["intent_not_supported"] };
  }

  return { actions: [toAction(request, mapping)], blockedReasons: [] };
}
