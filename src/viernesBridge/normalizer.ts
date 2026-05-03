import type {
  ViernesBridgeIntent,
  ViernesBridgeRequest,
  ViernesBridgeSource,
} from "./types.js";

const KNOWN_INTENTS: readonly ViernesBridgeIntent[] = [
  "check_github_repo_status",
  "validate_whatsapp_bridge",
  "prepare_whatsapp_reply",
  "send_whatsapp_message",
  "trigger_n8n_workflow",
  "create_github_issue",
  "create_github_repo",
  "deploy_coolify",
  "invoke_openclaw_tool",
  "run_browser_task",
  "index_lightrag_document",
  "run_model_prompt",
  "unknown",
];

function nowIso(): string {
  return new Date().toISOString();
}

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function source(value: unknown): ViernesBridgeSource {
  return value === "whatsapp" || value === "api" || value === "local"
    ? value
    : "local";
}

function explicitIntent(value: unknown): ViernesBridgeIntent | undefined {
  const normalized = text(value)?.toLowerCase();
  return KNOWN_INTENTS.find((intent) => intent === normalized);
}

function inferIntent(messageText: string): ViernesBridgeIntent {
  const textValue = messageText.toLowerCase();
  if (textValue.includes("github") && textValue.includes("status")) {
    return "check_github_repo_status";
  }
  if (textValue.includes("whatsapp") && textValue.includes("bridge")) {
    return "validate_whatsapp_bridge";
  }
  if (textValue.includes("prepare") && textValue.includes("reply")) {
    return "prepare_whatsapp_reply";
  }
  if (textValue.includes("send") && textValue.includes("whatsapp")) {
    return "send_whatsapp_message";
  }
  if (textValue.includes("trigger") && textValue.includes("n8n")) {
    return "trigger_n8n_workflow";
  }
  if (textValue.includes("deploy") && textValue.includes("coolify")) {
    return "deploy_coolify";
  }
  if (textValue.includes("openclaw") && textValue.includes("invoke")) {
    return "invoke_openclaw_tool";
  }
  return "unknown";
}

function context(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : undefined;
}

export function normalizeViernesBridgeRequest(
  value: Partial<ViernesBridgeRequest> & Record<string, unknown>,
): ViernesBridgeRequest {
  const messageText = text(value.messageText) ?? "";
  const intent = explicitIntent(value.intent) ?? inferIntent(messageText);
  const userId = text(value.userId);
  const clientId = text(value.clientId);
  const requestContext = context(value.context);

  return {
    id: text(value.id) ?? `viernes-${Date.now().toString(36)}`,
    source: source(value.source),
    ...(userId ? { userId } : {}),
    ...(clientId ? { clientId } : {}),
    messageText,
    intent,
    ...(requestContext ? { context: requestContext } : {}),
    requestedAt: text(value.requestedAt) ?? nowIso(),
  };
}
