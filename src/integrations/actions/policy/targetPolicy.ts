import type {
  IntegrationActionIntegration,
  IntegrationActionName,
} from "../types.js";
import type { IntegrationTargetPolicy, TargetPolicyOptions } from "./types.js";

type StatusModule = typeof import("../../status.js");

async function loadStatusModule(): Promise<StatusModule> {
  return (await import(new URL("../../status.ts", import.meta.url).href)) as StatusModule;
}

function normalizeText(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/^['"]|['"]$/g, "");
  return normalized ? normalized : undefined;
}

function splitList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => normalizeText(item))
    .filter((item): item is string => !!item);
}

function valueList(...values: (string | undefined)[]): string[] {
  return values
    .map((value) => normalizeText(value))
    .filter((value): value is string => !!value);
}

function policy(
  integration: IntegrationActionIntegration,
  allowedActions: readonly IntegrationActionName[],
  extra: Omit<IntegrationTargetPolicy, "integration" | "allowedActions"> = {},
): IntegrationTargetPolicy {
  return {
    integration,
    allowedActions,
    ...extra,
  };
}

export async function getIntegrationTargetPolicies(
  options: TargetPolicyOptions = {},
): Promise<readonly IntegrationTargetPolicy[]> {
  const { getIntegrationEnvSnapshot } = await loadStatusModule();
  const env = await getIntegrationEnvSnapshot(options);

  const githubOwner = normalizeText(env.GITHUB_OWNER);
  const githubAllowedRepos = splitList(env.GITHUB_ALLOWED_REPOS);
  const n8nBaseUrl = normalizeText(env.N8N_BASE_URL);
  const whatsappHealthUrl = normalizeText(env.WHATSAPP_HEALTH_URL);
  const openclawGatewayUrl = normalizeText(env.OPENCLAW_GATEWAY_URL);
  const lightRagBaseUrl = normalizeText(env.LIGHTRAG_BASE_URL);
  const coolifyBaseUrls = valueList(env.COOLIFY_BASE_URL, env.COOLIFY_API_URL);

  return [
    policy("github", ["read_repo_status"], {
      ...(githubOwner ? { allowedOwners: [githubOwner] } : {}),
      ...(githubAllowedRepos.length > 0
        ? { allowedRepos: githubAllowedRepos }
        : {}),
      blockedActions: ["create_repo", "create_issue", "open_pull_request"],
      notes: ["Phase 15 allows GitHub read status only."],
    }),
    policy("whatsapp", ["validate_bridge", "prepare_reply"], {
      ...(whatsappHealthUrl ? { allowedHealthUrls: [whatsappHealthUrl] } : {}),
      blockedActions: ["send_message"],
      notes: [
        "Phase 15 never sends WhatsApp messages and never calls webhook URLs.",
      ],
    }),
    policy("n8n", ["validate_webhook"], {
      ...(n8nBaseUrl ? { allowedBaseUrls: [n8nBaseUrl] } : {}),
      blockedActions: ["trigger_workflow", "import_workflow"],
      notes: ["Phase 15 validates n8n base configuration only."],
    }),
    policy("openclaw", [], {
      ...(openclawGatewayUrl ? { allowedBaseUrls: [openclawGatewayUrl] } : {}),
      blockedActions: ["invoke_tool", "run_browser_task", "run_desktop_task"],
      notes: ["OpenClaw execution remains blocked in Phase 15."],
    }),
    policy("lightrag", [], {
      ...(lightRagBaseUrl ? { allowedBaseUrls: [lightRagBaseUrl] } : {}),
      blockedActions: ["index_document", "query_context", "refresh_index"],
      notes: ["LightRAG index and query actions remain blocked in Phase 15."],
    }),
    policy("coolify", [], {
      ...(coolifyBaseUrls.length > 0 ? { allowedBaseUrls: coolifyBaseUrls } : {}),
      blockedActions: [
        "create_project",
        "create_application",
        "deploy_application",
        "set_environment_variable",
      ],
      notes: ["Coolify writes and deploys remain blocked in Phase 15."],
    }),
    policy("openai", [], {
      blockedActions: ["run_model_prompt", "classify_task", "summarize_context"],
      notes: ["OpenAI model execution remains blocked from executors."],
    }),
    policy("anthropic", [], {
      blockedActions: ["run_model_prompt", "classify_task", "summarize_context"],
      notes: ["Anthropic model execution remains blocked from executors."],
    }),
  ];
}

export async function getIntegrationTargetPolicy(
  integration: IntegrationActionIntegration,
  options: TargetPolicyOptions = {},
): Promise<IntegrationTargetPolicy | undefined> {
  const policies = await getIntegrationTargetPolicies(options);
  return policies.find((entry) => entry.integration === integration);
}
