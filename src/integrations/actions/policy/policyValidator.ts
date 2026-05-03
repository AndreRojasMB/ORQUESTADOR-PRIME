import type { ProposedIntegrationAction } from "../types.js";
import type {
  IntegrationTargetPolicy,
  PolicyValidationResult,
  TargetPolicyOptions,
} from "./types.js";

type TargetPolicyModule = typeof import("./targetPolicy.js");
type StatusModule = typeof import("../../status.js");

async function loadTargetPolicyModule(): Promise<TargetPolicyModule> {
  return (await import(new URL("./targetPolicy.ts", import.meta.url).href)) as TargetPolicyModule;
}

async function loadStatusModule(): Promise<StatusModule> {
  return (await import(new URL("../../status.ts", import.meta.url).href)) as StatusModule;
}

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().replace(/^['"]|['"]$/g, "");
  return normalized ? normalized : undefined;
}

function normalizeUrl(value: unknown): string | undefined {
  const text = normalizeText(value);
  if (!text) return undefined;

  try {
    const url = new URL(text);
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return text.replace(/\/$/, "");
  }
}

function stringInput(
  action: ProposedIntegrationAction,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const value = normalizeText(action.input[key]);
    if (value) return value;
  }

  return undefined;
}

function urlInput(
  action: ProposedIntegrationAction,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const value = normalizeUrl(action.input[key]);
    if (value) return value;
  }

  return undefined;
}

function includesNormalized(
  values: readonly string[] | undefined,
  value: string | undefined,
): boolean {
  if (!value) return false;
  return !!values?.some(
    (candidate) => candidate.trim().toLowerCase() === value.trim().toLowerCase(),
  );
}

function includesUrl(
  values: readonly string[] | undefined,
  value: string | undefined,
): boolean {
  if (!value) return false;
  return !!values?.some((candidate) => normalizeUrl(candidate) === value);
}

function hasWebhookIntent(action: ProposedIntegrationAction): boolean {
  return Object.entries(action.input).some(([key, value]) => {
    if (typeof value !== "string" || value.trim().length === 0) return false;
    return key.toLowerCase().includes("webhook");
  });
}

async function getEnvValue(
  name: string,
  options: TargetPolicyOptions,
): Promise<string | undefined> {
  const { getIntegrationEnvSnapshot } = await loadStatusModule();
  const env = await getIntegrationEnvSnapshot(options);
  return normalizeText(env[name]);
}

async function validateGitHubPolicy(
  action: ProposedIntegrationAction,
  policy: IntegrationTargetPolicy,
): Promise<PolicyValidationResult> {
  const reasons: string[] = [];
  const warnings: string[] = [];

  const owner = stringInput(action, ["owner", "targetOwner", "githubOwner"]);
  const repo = stringInput(action, ["repo", "targetRepo", "githubRepo"]);

  if (!policy.allowedOwners || policy.allowedOwners.length === 0) {
    reasons.push("github_owner_policy_missing");
  } else if (owner && !includesNormalized(policy.allowedOwners, owner)) {
    reasons.push("github_owner_not_allowed");
  } else if (!owner) {
    warnings.push("github_owner_inferred_from_policy");
  }

  if (policy.allowedRepos && policy.allowedRepos.length > 0) {
    if (!repo) {
      warnings.push("github_repo_not_provided_owner_level_only");
    } else {
      const ownerRepo = owner ? `${owner}/${repo}` : undefined;
      const repoAllowed =
        includesNormalized(policy.allowedRepos, repo) ||
        includesNormalized(policy.allowedRepos, ownerRepo);
      if (!repoAllowed) reasons.push("github_repo_not_allowed");
    }
  } else if (repo) {
    warnings.push("github_repo_allowed_by_owner_policy_only");
  }

  return {
    allowed: reasons.length === 0,
    reasons,
    warnings,
  };
}

async function validateWhatsAppPolicy(
  action: ProposedIntegrationAction,
  policy: IntegrationTargetPolicy,
  options: TargetPolicyOptions,
): Promise<PolicyValidationResult> {
  const reasons: string[] = [];
  const warnings: string[] = [];

  if (action.action === "send_message") {
    reasons.push("whatsapp_send_message_blocked_phase_15");
  }

  const targetUrl = urlInput(action, ["targetUrl", "healthUrl", "url"]);
  const webhookIntent = hasWebhookIntent(action);
  const webhookUrl = normalizeUrl(await getEnvValue("WHATSAPP_WEBHOOK_URL", options));
  const twilioWebhookUrl = normalizeUrl(
    await getEnvValue("TWILIO_WEBHOOK_PUBLIC_URL", options),
  );

  if (webhookIntent) {
    reasons.push("webhook_execution_blocked");
  }

  if (targetUrl && (targetUrl === webhookUrl || targetUrl === twilioWebhookUrl)) {
    reasons.push("webhook_execution_blocked");
  }

  if (!policy.allowedHealthUrls || policy.allowedHealthUrls.length === 0) {
    reasons.push("missing_health_url");
  } else if (targetUrl && !includesUrl(policy.allowedHealthUrls, targetUrl)) {
    reasons.push("whatsapp_health_url_not_allowed");
  } else if (!targetUrl && !webhookIntent) {
    warnings.push("whatsapp_health_url_inferred_from_policy");
  }

  return {
    allowed: reasons.length === 0,
    reasons: [...new Set(reasons)],
    warnings,
  };
}

async function validateN8nPolicy(
  action: ProposedIntegrationAction,
  policy: IntegrationTargetPolicy,
  options: TargetPolicyOptions,
): Promise<PolicyValidationResult> {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const targetUrl = urlInput(action, ["targetUrl", "baseUrl", "url"]);
  const webhookIntent = hasWebhookIntent(action);
  const webhookUrl = normalizeUrl(await getEnvValue("N8N_WEBHOOK_URL", options));
  const webhookBaseUrl = normalizeUrl(
    await getEnvValue("N8N_WEBHOOK_BASE_URL", options),
  );

  if (webhookIntent) {
    reasons.push("webhook_execution_blocked");
  }

  if (targetUrl && (targetUrl === webhookUrl || targetUrl === webhookBaseUrl)) {
    reasons.push("webhook_execution_blocked");
  }

  if (!policy.allowedBaseUrls || policy.allowedBaseUrls.length === 0) {
    reasons.push("n8n_base_url_policy_missing");
  } else if (targetUrl && !includesUrl(policy.allowedBaseUrls, targetUrl)) {
    reasons.push("n8n_base_url_not_allowed");
  } else if (!targetUrl && !webhookIntent) {
    warnings.push("n8n_base_url_inferred_from_policy");
  }

  return {
    allowed: reasons.length === 0,
    reasons: [...new Set(reasons)],
    warnings,
  };
}

function blockedPolicy(reason: string): PolicyValidationResult {
  return {
    allowed: false,
    reasons: [reason],
    warnings: [],
  };
}

function integrationBlockedReason(
  action: ProposedIntegrationAction,
): string | undefined {
  if (action.integration === "whatsapp" && action.action === "send_message") {
    return "whatsapp_send_message_blocked_phase_15";
  }

  if (action.integration === "openclaw") {
    return "openclaw_execution_blocked_phase_15";
  }

  if (action.integration === "lightrag") {
    return "lightrag_mutation_or_query_blocked_phase_15";
  }

  if (action.integration === "coolify") {
    return "coolify_write_actions_blocked_phase_15";
  }

  if (action.integration === "openai" || action.integration === "anthropic") {
    return action.action === "run_model_prompt"
      ? "model_execution_blocked_phase_15"
      : "model_executor_not_enabled_phase_15";
  }

  return undefined;
}

export async function validateIntegrationActionPolicy(
  action: ProposedIntegrationAction,
  options: TargetPolicyOptions = {},
): Promise<PolicyValidationResult> {
  const { getIntegrationTargetPolicy } = await loadTargetPolicyModule();
  const policy = await getIntegrationTargetPolicy(action.integration, options);
  const reasons: string[] = [];

  if (!policy) {
    return blockedPolicy("target_policy_missing");
  }

  if (policy.blockedActions?.includes(action.action)) {
    reasons.push("action_blocked_by_target_policy");
  }

  if (!policy.allowedActions.includes(action.action)) {
    reasons.push("action_not_allowed_by_target_policy");
  }

  const blockedReason = integrationBlockedReason(action);
  if (blockedReason) reasons.push(blockedReason);

  if (reasons.length > 0) {
    return {
      allowed: false,
      reasons: [...new Set(reasons)],
      warnings: [],
    };
  }

  if (action.integration === "github" && action.action === "read_repo_status") {
    return validateGitHubPolicy(action, policy);
  }

  if (action.integration === "whatsapp" && action.action === "validate_bridge") {
    return validateWhatsAppPolicy(action, policy, options);
  }

  if (action.integration === "whatsapp" && action.action === "prepare_reply") {
    return {
      allowed: true,
      reasons: [],
      warnings: ["whatsapp_prepare_reply_dry_run_only"],
    };
  }

  if (action.integration === "n8n" && action.action === "validate_webhook") {
    return validateN8nPolicy(action, policy, options);
  }

  if (action.integration === "openclaw") {
    return blockedPolicy("openclaw_execution_blocked_phase_15");
  }

  if (action.integration === "lightrag") {
    return blockedPolicy("lightrag_mutation_or_query_blocked_phase_15");
  }

  if (action.integration === "coolify") {
    return blockedPolicy("coolify_write_actions_blocked_phase_15");
  }

  if (action.integration === "openai" || action.integration === "anthropic") {
    return action.action === "run_model_prompt"
      ? blockedPolicy("model_execution_blocked_phase_15")
      : blockedPolicy("model_executor_not_enabled_phase_15");
  }

  return blockedPolicy("target_policy_not_implemented");
}
