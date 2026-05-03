import { spawn } from "child_process";
import { readFile } from "fs/promises";
import { isAbsolute, join, resolve } from "path";
import type { IntegrationStatusOptions } from "./status.js";

export type IntegrationHealthTarget =
  | "openai"
  | "anthropic"
  | "lightrag"
  | "coolify"
  | "github"
  | "openclaw"
  | "n8n"
  | "whatsapp";

export type IntegrationHealthTargetArg = IntegrationHealthTarget | "claude";

export type IntegrationHealthCode =
  | "ok"
  | "missing_config"
  | "unauthorized_or_forbidden"
  | "unavailable"
  | "configured_without_probe"
  | "unsupported_probe"
  | "error";

export interface IntegrationHealthResult {
  id: IntegrationHealthTarget;
  name: string;
  status: IntegrationHealthCode;
}

export interface IntegrationHealthOptions extends IntegrationStatusOptions {
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 5_000;
const MAX_TIMEOUT_MS = 5_000;
const OPENCLAW_HEALTHY_VALUES = new Set([
  "ok",
  "healthy",
  "ready",
  "running",
  "up",
  "online",
]);
const OPENCLAW_UNAVAILABLE_VALUES = new Set([
  "down",
  "failed",
  "offline",
  "unavailable",
  "unhealthy",
]);
const OPENCLAW_UNSAFE_COMMAND_TERMS = [
  "/tools/invoke",
  "/v1/chat/completions",
  "chat/completions",
  "completion",
  "commit",
  "create",
  "delete",
  "deploy",
  "issue",
  "invoke",
  "merge",
  "pulls",
  "push",
  "repo",
  "tools.invoke",
];

type StatusModule = typeof import("./status.js");

async function loadStatusModule(): Promise<StatusModule> {
  return (await import(new URL("./status.ts", import.meta.url).href)) as StatusModule;
}

function timeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), clampTimeout(timeoutMs)).unref();
  return controller.signal;
}

function clampTimeout(timeoutMs: number): number {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return DEFAULT_TIMEOUT_MS;
  return Math.min(Math.floor(timeoutMs), MAX_TIMEOUT_MS);
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

function statusConfigured(
  statuses: readonly { id: string; configured: boolean }[],
  id: IntegrationHealthTarget,
): boolean {
  return statuses.find((status) => status.id === id)?.configured ?? false;
}

function classifyHttpStatus(status: number): IntegrationHealthCode {
  if (status >= 200 && status < 300) return "ok";
  if (status >= 300 && status < 400) return "ok";
  if (status === 401 || status === 403) return "unauthorized_or_forbidden";
  if (status >= 500) return "unavailable";
  return "error";
}

async function safeGithubGet(
  url: string,
  token: string,
  timeoutMs: number,
): Promise<IntegrationHealthCode> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "ORQUESTADOR-PRIME-integrations-health",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: timeoutSignal(timeoutMs),
    });

    return classifyHttpStatus(response.status);
  } catch (err) {
    return isUnavailableError(err) ? "unavailable" : "error";
  }
}

async function safeOpenAIModelsGet(
  apiKey: string,
  timeoutMs: number,
): Promise<IntegrationHealthCode> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "ORQUESTADOR-PRIME-integrations-health",
      },
      redirect: "manual",
      signal: timeoutSignal(timeoutMs),
    });

    return classifyHttpStatus(response.status);
  } catch (err) {
    return isUnavailableError(err) ? "unavailable" : "error";
  }
}

async function safeAnthropicModelsGet(
  apiKey: string,
  timeoutMs: number,
): Promise<IntegrationHealthCode> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/models", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "anthropic-version": "2023-06-01",
        "User-Agent": "ORQUESTADOR-PRIME-integrations-health",
        "x-api-key": apiKey,
      },
      redirect: "manual",
      signal: timeoutSignal(timeoutMs),
    });

    return classifyHttpStatus(response.status);
  } catch (err) {
    return isUnavailableError(err) ? "unavailable" : "error";
  }
}

async function safeLightRAGGet(
  url: string,
  apiKey: string | undefined,
  timeoutMs: number,
): Promise<IntegrationHealthCode> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json,text/plain,*/*",
      "User-Agent": "ORQUESTADOR-PRIME-integrations-health",
    };
    if (apiKey) headers["X-API-Key"] = apiKey;

    const response = await fetch(url, {
      method: "GET",
      headers,
      redirect: "manual",
      signal: timeoutSignal(timeoutMs),
    });

    return classifyHttpStatus(response.status);
  } catch (err) {
    return isUnavailableError(err) ? "unavailable" : "error";
  }
}

async function safeCoolifyGet(
  url: string,
  token: string,
  timeoutMs: number,
): Promise<IntegrationHealthCode> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json,text/plain,*/*",
        Authorization: `Bearer ${token}`,
        "User-Agent": "ORQUESTADOR-PRIME-integrations-health",
      },
      redirect: "manual",
      signal: timeoutSignal(timeoutMs),
    });

    return classifyHttpStatus(response.status);
  } catch (err) {
    return isUnavailableError(err) ? "unavailable" : "error";
  }
}

function appendPath(baseUrl: string, path: string): string | null {
  try {
    const url = new URL(baseUrl);
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

async function safeReadOnlyGet(
  url: string,
  timeoutMs: number,
): Promise<IntegrationHealthCode> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "User-Agent": "ORQUESTADOR-PRIME-integrations-health",
      },
      redirect: "manual",
      signal: timeoutSignal(timeoutMs),
    });

    return classifyHttpStatus(response.status);
  } catch (err) {
    return isUnavailableError(err) ? "unavailable" : "error";
  }
}

function isSafeWhatsAppHealthUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;

    const hostname = url.hostname.toLowerCase();
    const providerHosts = [
      "twilio.com",
      "facebook.com",
      "graph.facebook.com",
      "meta.com",
      "whatsapp.com",
    ];
    if (
      providerHosts.some(
        (host) => hostname === host || hostname.endsWith(`.${host}`),
      )
    ) {
      return false;
    }

    const path = url.pathname.toLowerCase();
    return ![
      "/webhook",
      "/whatsapp-orchestrator",
      "/messages",
      "/message",
      "/send",
      "/twilio",
      "/meta",
    ].some((term) => path.includes(term));
  } catch {
    return false;
  }
}

function normalizeStatusValue(value: unknown): string | null {
  return typeof value === "string" ? value.trim().toLowerCase() : null;
}

function classifyOpenClawStatusPayload(payload: unknown): IntegrationHealthCode | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  if (record["ok"] === true || record["healthy"] === true) return "ok";
  if (record["ok"] === false || record["healthy"] === false) return "unavailable";

  const status =
    normalizeStatusValue(record["status"]) ??
    normalizeStatusValue(record["health"]) ??
    normalizeStatusValue(record["state"]);
  if (!status) return null;

  if (OPENCLAW_HEALTHY_VALUES.has(status)) return "ok";
  if (OPENCLAW_UNAVAILABLE_VALUES.has(status) || status === "error") {
    return "unavailable";
  }

  return null;
}

function classifyOpenClawTextOutput(output: string): IntegrationHealthCode | null {
  const text = output.trim();
  if (!text) return null;

  try {
    return classifyOpenClawStatusPayload(JSON.parse(text));
  } catch {
    const normalized = text.toLowerCase();
    if (/\b(ok|healthy|ready|running|up|online)\b/.test(normalized)) return "ok";
    if (/\b(down|failed|offline|unavailable|unhealthy|error)\b/.test(normalized)) {
      return "unavailable";
    }
  }

  return null;
}

function resolveStatusFilePath(rawPath: string, cwd: string): string {
  return isAbsolute(rawPath) ? rawPath : resolve(cwd, rawPath);
}

async function checkOpenClawStatusFile(
  path: string,
  required: boolean,
): Promise<IntegrationHealthCode | null> {
  try {
    const raw = await readFile(path, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return classifyOpenClawStatusPayload(parsed) ?? "error";
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT" && !required) return null;
    return code === "ENOENT" ? "unavailable" : "error";
  }
}

function parseCommand(raw: string): string[] | null {
  if (/[;&|<>`$]/.test(raw)) return null;

  const tokens: string[] = [];
  const pattern = /"([^"]*)"|'([^']*)'|[^\s]+/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(raw)) !== null) {
    const token = match[1] ?? match[2] ?? match[0];
    if (token) tokens.push(token);
  }

  return tokens.length > 0 ? tokens : null;
}

function isSafeOpenClawHealthCommand(raw: string): boolean {
  const normalized = raw.toLowerCase();
  const hasHealthIntent =
    normalized.includes("health") || normalized.includes("status");
  if (!hasHealthIntent) return false;

  return !OPENCLAW_UNSAFE_COMMAND_TERMS.some((term) =>
    normalized.includes(term),
  );
}

async function runOpenClawHealthCommand(
  rawCommand: string,
  timeoutMs: number,
): Promise<IntegrationHealthCode> {
  if (!isSafeOpenClawHealthCommand(rawCommand)) return "unsupported_probe";

  const tokens = parseCommand(rawCommand);
  if (!tokens) return "unsupported_probe";

  const [command, ...args] = tokens;
  if (!command) return "unsupported_probe";

  return new Promise((resolveResult) => {
    let settled = false;
    let timedOut = false;
    let stdout = "";
    let timer: NodeJS.Timeout | null = null;
    const child = spawn(command, args, {
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    const finish = (status: IntegrationHealthCode): void => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolveResult(status);
    };

    timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, clampTimeout(timeoutMs));
    timer.unref();

    child.stdout?.on("data", (chunk: Buffer) => {
      if (stdout.length < 4096) {
        stdout += chunk.toString("utf-8").slice(0, 4096 - stdout.length);
      }
    });
    child.stderr?.on("data", () => undefined);
    child.on("error", (err: NodeJS.ErrnoException) => {
      finish(err.code === "ENOENT" ? "unsupported_probe" : "unavailable");
    });
    child.on("close", (code) => {
      if (timedOut) {
        finish("unavailable");
        return;
      }
      if (code !== 0) {
        finish("unavailable");
        return;
      }
      finish(classifyOpenClawTextOutput(stdout) ?? "ok");
    });
  });
}

export async function checkOpenAIHealth(
  options: IntegrationHealthOptions = {},
): Promise<IntegrationHealthResult> {
  const timeoutMs = clampTimeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const {
    getIntegrationEnvSnapshot,
    getIntegrationStatuses,
    hasUsableIntegrationValue,
  } = await loadStatusModule();
  const [statuses, env] = await Promise.all([
    getIntegrationStatuses(options),
    getIntegrationEnvSnapshot(options),
  ]);

  const apiKey = env["OPENAI_API_KEY"];
  if (
    !statusConfigured(statuses, "openai") ||
    !hasUsableIntegrationValue(apiKey)
  ) {
    return { id: "openai", name: "OpenAI", status: "missing_config" };
  }

  return {
    id: "openai",
    name: "OpenAI",
    status: await safeOpenAIModelsGet(apiKey, timeoutMs),
  };
}

export async function checkAnthropicHealth(
  options: IntegrationHealthOptions = {},
): Promise<IntegrationHealthResult> {
  const timeoutMs = clampTimeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const {
    getIntegrationEnvSnapshot,
    getIntegrationStatuses,
    hasUsableIntegrationValue,
  } = await loadStatusModule();
  const [statuses, env] = await Promise.all([
    getIntegrationStatuses(options),
    getIntegrationEnvSnapshot(options),
  ]);

  const apiKey = env["ANTHROPIC_API_KEY"];
  if (
    !statusConfigured(statuses, "anthropic") ||
    !hasUsableIntegrationValue(apiKey)
  ) {
    return {
      id: "anthropic",
      name: "Claude / Anthropic",
      status: "missing_config",
    };
  }

  return {
    id: "anthropic",
    name: "Claude / Anthropic",
    status: await safeAnthropicModelsGet(apiKey, timeoutMs),
  };
}

export async function checkGitHubHealth(
  options: IntegrationHealthOptions = {},
): Promise<IntegrationHealthResult> {
  const timeoutMs = clampTimeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const {
    getIntegrationEnvSnapshot,
    getIntegrationStatuses,
    hasUsableIntegrationValue,
  } = await loadStatusModule();
  const [statuses, env] = await Promise.all([
    getIntegrationStatuses(options),
    getIntegrationEnvSnapshot(options),
  ]);

  const token = env["GITHUB_TOKEN"];
  const owner = env["GITHUB_OWNER"];
  if (
    !statusConfigured(statuses, "github") ||
    !hasUsableIntegrationValue(token) ||
    !hasUsableIntegrationValue(owner)
  ) {
    return { id: "github", name: "GitHub", status: "missing_config" };
  }

  const userStatus = await safeGithubGet(
    "https://api.github.com/user",
    token,
    timeoutMs,
  );
  if (userStatus !== "ok") {
    return { id: "github", name: "GitHub", status: userStatus };
  }

  const ownerStatus = await safeGithubGet(
    `https://api.github.com/users/${encodeURIComponent(owner)}`,
    token,
    timeoutMs,
  );

  return { id: "github", name: "GitHub", status: ownerStatus };
}

export async function checkLightRAGHealth(
  options: IntegrationHealthOptions = {},
): Promise<IntegrationHealthResult> {
  const timeoutMs = clampTimeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const {
    getIntegrationEnvSnapshot,
    getIntegrationStatuses,
    hasUsableIntegrationValue,
  } = await loadStatusModule();
  const [statuses, env] = await Promise.all([
    getIntegrationStatuses(options),
    getIntegrationEnvSnapshot(options),
  ]);

  const baseUrl = env["LIGHTRAG_BASE_URL"];
  const healthUrl = env["LIGHTRAG_HEALTH_URL"];
  const apiKey = env["LIGHTRAG_API_KEY"];
  const hasLightRAGConfig =
    statusConfigured(statuses, "lightrag") ||
    hasUsableIntegrationValue(baseUrl) ||
    hasUsableIntegrationValue(healthUrl);

  if (!hasLightRAGConfig) {
    return { id: "lightrag", name: "LightRAG", status: "missing_config" };
  }

  const probeUrl = hasUsableIntegrationValue(healthUrl) ? healthUrl : baseUrl;
  if (!hasUsableIntegrationValue(probeUrl)) {
    return {
      id: "lightrag",
      name: "LightRAG",
      status: "configured_without_probe",
    };
  }

  try {
    new URL(probeUrl);
  } catch {
    return { id: "lightrag", name: "LightRAG", status: "error" };
  }

  if (!hasUsableIntegrationValue(healthUrl)) {
    return {
      id: "lightrag",
      name: "LightRAG",
      status: "configured_without_probe",
    };
  }

  return {
    id: "lightrag",
    name: "LightRAG",
    status: await safeLightRAGGet(
      probeUrl,
      hasUsableIntegrationValue(apiKey) ? apiKey : undefined,
      timeoutMs,
    ),
  };
}

export async function checkCoolifyHealth(
  options: IntegrationHealthOptions = {},
): Promise<IntegrationHealthResult> {
  const timeoutMs = clampTimeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const {
    getIntegrationEnvSnapshot,
    getIntegrationStatuses,
    hasUsableIntegrationValue,
  } = await loadStatusModule();
  const [statuses, env] = await Promise.all([
    getIntegrationStatuses(options),
    getIntegrationEnvSnapshot(options),
  ]);

  const baseUrl = env["COOLIFY_BASE_URL"] ?? env["COOLIFY_API_URL"];
  const token = env["COOLIFY_API_TOKEN"];
  if (
    !statusConfigured(statuses, "coolify") ||
    !hasUsableIntegrationValue(baseUrl) ||
    !hasUsableIntegrationValue(token)
  ) {
    return { id: "coolify", name: "Coolify", status: "missing_config" };
  }

  const versionUrl = appendPath(baseUrl, "/version");
  if (!versionUrl) return { id: "coolify", name: "Coolify", status: "error" };

  const versionStatus = await safeCoolifyGet(versionUrl, token, timeoutMs);
  if (versionStatus !== "error") {
    return { id: "coolify", name: "Coolify", status: versionStatus };
  }

  const healthUrl = appendPath(baseUrl, "/health");
  if (!healthUrl) return { id: "coolify", name: "Coolify", status: "error" };

  return {
    id: "coolify",
    name: "Coolify",
    status: await safeCoolifyGet(healthUrl, token, timeoutMs),
  };
}

export async function checkOpenClawHealth(
  options: IntegrationHealthOptions = {},
): Promise<IntegrationHealthResult> {
  const {
    getIntegrationEnvSnapshot,
    getIntegrationStatuses,
    hasUsableIntegrationValue,
  } = await loadStatusModule();
  const [statuses, env] = await Promise.all([
    getIntegrationStatuses(options),
    getIntegrationEnvSnapshot(options),
  ]);
  const baseUrl = env["OPENCLAW_BASE_URL"] ?? env["OPENCLAW_GATEWAY_URL"];
  const healthCommand = env["OPENCLAW_HEALTH_COMMAND"];
  const configuredStatusFile = env["OPENCLAW_STATUS_FILE"];
  const cwd = options.cwd ?? process.cwd();
  const defaultStatusFile = join(cwd, "data", "openclaw_status.json");

  const hasOpenClawConfig =
    statusConfigured(statuses, "openclaw") ||
    hasUsableIntegrationValue(baseUrl) ||
    hasUsableIntegrationValue(healthCommand) ||
    hasUsableIntegrationValue(configuredStatusFile);

  if (!hasOpenClawConfig) {
    return { id: "openclaw", name: "OpenClaw", status: "missing_config" };
  }

  if (hasUsableIntegrationValue(configuredStatusFile)) {
    const status = await checkOpenClawStatusFile(
      resolveStatusFilePath(configuredStatusFile, cwd),
      true,
    );
    return { id: "openclaw", name: "OpenClaw", status: status ?? "error" };
  }

  const defaultStatus = await checkOpenClawStatusFile(defaultStatusFile, false);
  if (defaultStatus) {
    return { id: "openclaw", name: "OpenClaw", status: defaultStatus };
  }

  if (hasUsableIntegrationValue(healthCommand)) {
    return {
      id: "openclaw",
      name: "OpenClaw",
      status: await runOpenClawHealthCommand(
        healthCommand,
        options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      ),
    };
  }

  return {
    id: "openclaw",
    name: "OpenClaw",
    status: "configured_without_probe",
  };
}

export async function checkN8nHealth(
  options: IntegrationHealthOptions = {},
): Promise<IntegrationHealthResult> {
  const timeoutMs = clampTimeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const { getIntegrationEnvSnapshot, hasUsableIntegrationValue } =
    await loadStatusModule();
  const env = await getIntegrationEnvSnapshot(options);
  const baseUrl = env["N8N_BASE_URL"];
  const webhookUrl = env["N8N_WEBHOOK_URL"] ?? env["N8N_WEBHOOK_BASE_URL"];

  if (!hasUsableIntegrationValue(baseUrl)) {
    if (hasUsableIntegrationValue(webhookUrl)) {
      return { id: "n8n", name: "n8n", status: "configured_without_probe" };
    }

    return { id: "n8n", name: "n8n", status: "missing_config" };
  }

  const healthUrl = appendPath(baseUrl, "/healthz");
  if (!healthUrl) return { id: "n8n", name: "n8n", status: "error" };

  const healthStatus = await safeReadOnlyGet(healthUrl, timeoutMs);
  if (healthStatus !== "error") {
    return { id: "n8n", name: "n8n", status: healthStatus };
  }

  const baseStatus = await safeReadOnlyGet(baseUrl, timeoutMs);
  return { id: "n8n", name: "n8n", status: baseStatus };
}

export async function checkWhatsAppHealth(
  options: IntegrationHealthOptions = {},
): Promise<IntegrationHealthResult> {
  const timeoutMs = clampTimeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const {
    getIntegrationEnvSnapshot,
    getIntegrationStatuses,
    hasUsableIntegrationValue,
  } = await loadStatusModule();
  const [statuses, env] = await Promise.all([
    getIntegrationStatuses(options),
    getIntegrationEnvSnapshot(options),
  ]);
  const provider = env["WHATSAPP_PROVIDER"];
  const webhookUrl =
    env["WHATSAPP_WEBHOOK_URL"] ?? env["TWILIO_WEBHOOK_PUBLIC_URL"];
  const verifyToken =
    env["WHATSAPP_VERIFY_TOKEN"] ?? env["WHATSAPP_HOOK_TOKEN"];
  const healthUrl = env["WHATSAPP_HEALTH_URL"];

  const hasWhatsAppConfig =
    statusConfigured(statuses, "whatsapp") ||
    (hasUsableIntegrationValue(provider) &&
      hasUsableIntegrationValue(webhookUrl) &&
      hasUsableIntegrationValue(verifyToken));

  if (!hasWhatsAppConfig) {
    return { id: "whatsapp", name: "WhatsApp", status: "missing_config" };
  }

  if (!hasUsableIntegrationValue(healthUrl)) {
    return {
      id: "whatsapp",
      name: "WhatsApp",
      status: "configured_without_probe",
    };
  }

  if (!isSafeWhatsAppHealthUrl(healthUrl)) {
    return {
      id: "whatsapp",
      name: "WhatsApp",
      status: "configured_without_probe",
    };
  }

  return {
    id: "whatsapp",
    name: "WhatsApp",
    status: await safeReadOnlyGet(healthUrl, timeoutMs),
  };
}

export async function checkIntegrationHealth(
  target: IntegrationHealthTargetArg | "all",
  options: IntegrationHealthOptions = {},
): Promise<IntegrationHealthResult[]> {
  if (target === "openai") return [await checkOpenAIHealth(options)];
  if (target === "anthropic" || target === "claude") {
    return [await checkAnthropicHealth(options)];
  }
  if (target === "lightrag") return [await checkLightRAGHealth(options)];
  if (target === "coolify") return [await checkCoolifyHealth(options)];
  if (target === "github") return [await checkGitHubHealth(options)];
  if (target === "openclaw") return [await checkOpenClawHealth(options)];
  if (target === "n8n") return [await checkN8nHealth(options)];
  if (target === "whatsapp") return [await checkWhatsAppHealth(options)];

  const [openai, anthropic, lightrag, coolify, github, openclaw, n8n, whatsapp] =
    await Promise.all([
      checkOpenAIHealth(options),
      checkAnthropicHealth(options),
      checkLightRAGHealth(options),
      checkCoolifyHealth(options),
      checkGitHubHealth(options),
      checkOpenClawHealth(options),
      checkN8nHealth(options),
      checkWhatsAppHealth(options),
    ]);
  return [openai, anthropic, lightrag, coolify, github, openclaw, n8n, whatsapp];
}
