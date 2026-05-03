import type { ProposedIntegrationAction } from "../types.js";
import type {
  IntegrationActionExecutionResult,
  IntegrationActionExecutorContext,
} from "./types.js";

type StatusModule = typeof import("../../status.js");

async function loadStatusModule(): Promise<StatusModule> {
  return (await import(new URL("../../status.ts", import.meta.url).href)) as StatusModule;
}

function nowIso(): string {
  return new Date().toISOString();
}

const DEFAULT_TIMEOUT_MS = 5_000;
const MAX_TIMEOUT_MS = 5_000;

function timeoutSignal(timeoutMs = DEFAULT_TIMEOUT_MS): {
  signal: AbortSignal;
  cancel: () => void;
} {
  const controller = new AbortController();
  const clamped = Math.min(Math.max(1, timeoutMs), MAX_TIMEOUT_MS);
  const timer = setTimeout(() => controller.abort(), clamped);
  timer.unref();
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timer),
  };
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

function hasWebhookIntent(action: ProposedIntegrationAction): boolean {
  return Object.entries(action.input).some(([key, value]) => {
    if (typeof value !== "string" || value.trim().length === 0) return false;
    return key.toLowerCase().includes("webhook");
  });
}

function isUnavailableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const message = err.message.toLowerCase();
  return (
    err.name === "AbortError" ||
    message.includes("aborted") ||
    message.includes("fetch failed") ||
    message.includes("econnrefused") ||
    message.includes("econnreset") ||
    message.includes("enotfound") ||
    message.includes("etimedout")
  );
}

function evidence(
  provider: string,
  healthReachable: boolean,
  statusSummary: string,
  statusCode?: number,
): Record<string, unknown> {
  return {
    provider,
    healthReachable,
    ...(typeof statusCode === "number" ? { statusCode } : {}),
    statusSummary,
    checkedAt: nowIso(),
  };
}

function blockedResult(
  action: ProposedIntegrationAction,
  reason: string,
  provider: string,
  statusCode?: number,
): IntegrationActionExecutionResult {
  return {
    actionId: action.id,
    integration: action.integration,
    action: action.action,
    status: "blocked",
    mode: "blocked",
    summary: "WhatsApp validate_bridge was blocked safely.",
    blockedReasons: [reason],
    evidenceRedacted: evidence(provider, false, reason, statusCode),
    createdAt: nowIso(),
  };
}

function failedResult(
  action: ProposedIntegrationAction,
  reason: string,
  provider: string,
  statusCode?: number,
): IntegrationActionExecutionResult {
  return {
    actionId: action.id,
    integration: action.integration,
    action: action.action,
    status: "failed",
    mode: "blocked",
    summary: "WhatsApp bridge health read-only check failed safely.",
    blockedReasons: [reason],
    evidenceRedacted: evidence(provider, false, reason, statusCode),
    createdAt: nowIso(),
  };
}

export async function executeWhatsAppValidateBridge(
  action: ProposedIntegrationAction,
  context: IntegrationActionExecutorContext,
): Promise<IntegrationActionExecutionResult> {
  const { getIntegrationEnvSnapshot, hasUsableIntegrationValue } =
    await loadStatusModule();
  const options = context.statusOptions ?? {};
  const env = await getIntegrationEnvSnapshot(options);
  const provider = normalizeText(env["WHATSAPP_PROVIDER"]) ?? "unknown";
  const healthUrl = normalizeUrl(env["WHATSAPP_HEALTH_URL"]);
  const targetUrl = urlInput(action, ["targetUrl", "healthUrl", "url"]);
  const webhookUrl = normalizeUrl(env["WHATSAPP_WEBHOOK_URL"]);
  const twilioWebhookUrl = normalizeUrl(env["TWILIO_WEBHOOK_PUBLIC_URL"]);

  if (hasWebhookIntent(action)) {
    return blockedResult(action, "webhook_execution_blocked", provider);
  }

  if (targetUrl && (targetUrl === webhookUrl || targetUrl === twilioWebhookUrl)) {
    return blockedResult(action, "webhook_execution_blocked", provider);
  }

  if (!hasUsableIntegrationValue(healthUrl)) {
    return blockedResult(action, "missing_health_url", provider);
  }

  if (targetUrl && targetUrl !== healthUrl) {
    return blockedResult(action, "whatsapp_health_url_not_allowed", provider);
  }

  const { signal, cancel } = timeoutSignal();

  try {
    const response = await fetch(healthUrl, {
      method: "GET",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "User-Agent": "ORQUESTADOR-PRIME-integration-action-executor",
      },
      redirect: "manual",
      signal,
    });

    if (response.status === 401 || response.status === 403) {
      return blockedResult(
        action,
        "unauthorized_or_forbidden",
        provider,
        response.status,
      );
    }

    if (response.status >= 500) {
      return failedResult(
        action,
        "whatsapp_bridge_unavailable",
        provider,
        response.status,
      );
    }

    if (response.status < 200 || response.status >= 400) {
      return failedResult(
        action,
        "whatsapp_bridge_health_error",
        provider,
        response.status,
      );
    }

    return {
      actionId: action.id,
      integration: action.integration,
      action: action.action,
      status: "executed_read_only",
      mode: "read_only",
      summary: "WhatsApp bridge health check completed safely.",
      evidenceRedacted: evidence(provider, true, "bridge_health_ok", response.status),
      createdAt: nowIso(),
    };
  } catch (err) {
    return failedResult(
      action,
      isUnavailableError(err)
        ? "whatsapp_bridge_unavailable"
        : "whatsapp_bridge_health_error",
      provider,
    );
  } finally {
    cancel();
  }
}
