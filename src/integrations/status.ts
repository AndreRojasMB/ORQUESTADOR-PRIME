import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

export interface IntegrationStatus {
  id: string;
  name: string;
  description: string;
  configured: boolean;
}

type EnvSnapshot = Record<string, string>;

interface IntegrationDefinition {
  id: string;
  name: string;
  description: string;
  requiredEnv: readonly (readonly string[])[];
}

interface LegacyWhatsAppConfig {
  whatsapp?: {
    enabled?: boolean;
    hookToken?: string;
    n8nWebhookPath?: string;
  };
}

export interface IntegrationStatusOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  envFiles?: readonly string[];
  configPath?: string;
}

const INTEGRATIONS: readonly IntegrationDefinition[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "Primary LLM provider for agent orchestration.",
    requiredEnv: [["OPENAI_API_KEY"]],
  },
  {
    id: "anthropic",
    name: "Claude / Anthropic",
    description: "Secondary LLM provider for blueprint and audit modes.",
    requiredEnv: [["ANTHROPIC_API_KEY"]],
  },
  {
    id: "n8n",
    name: "n8n",
    description: "Workflow automation and webhook triggers.",
    requiredEnv: [["N8N_BASE_URL"], ["N8N_WEBHOOK_URL", "N8N_WEBHOOK_BASE_URL"]],
  },
  {
    id: "lightrag",
    name: "LightRAG",
    description: "RAG over codebase for context-aware planning.",
    requiredEnv: [["LIGHTRAG_BASE_URL"]],
  },
  {
    id: "coolify",
    name: "Coolify",
    description: "Self-hosted deployment and application management.",
    requiredEnv: [["COOLIFY_BASE_URL", "COOLIFY_API_URL"], ["COOLIFY_API_TOKEN"]],
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    description: "Controlled execution substrate for agent actions.",
    requiredEnv: [[
      "OPENCLAW_BASE_URL",
      "OPENCLAW_GATEWAY_URL",
      "OPENCLAW_HEALTH_COMMAND",
      "OPENCLAW_STATUS_FILE",
    ]],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Repository access, PRs, and code execution layer.",
    requiredEnv: [["GITHUB_TOKEN"], ["GITHUB_OWNER"]],
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Inbound messaging channel via n8n bridge.",
    requiredEnv: [
      ["WHATSAPP_PROVIDER"],
      ["WHATSAPP_WEBHOOK_URL", "TWILIO_WEBHOOK_PUBLIC_URL"],
      ["WHATSAPP_VERIFY_TOKEN", "WHATSAPP_HOOK_TOKEN"],
    ],
  },
];

export function hasUsableIntegrationValue(value: string | undefined): value is string {
  if (!value) return false;

  const normalized = value.trim().replace(/^['"]|['"]$/g, "");
  if (!normalized) return false;

  const placeholder = normalized.toLowerCase();
  return ![
    "change-me",
    "changeme",
    "placeholder",
    "replace-me",
    "replace_me",
    "todo",
  ].some((token) => placeholder.includes(token)) && !placeholder.startsWith("your_");
}

function parseEnvLine(line: string): [string, string] | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const withoutExport = trimmed.startsWith("export ")
    ? trimmed.slice("export ".length).trim()
    : trimmed;
  const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(withoutExport);
  if (!match) return null;

  const key = match[1];
  const value = match[2];
  if (!key || value == null) return null;

  return [key, value];
}

function unique(paths: readonly string[]): string[] {
  return [...new Set(paths)];
}

function defaultEnvFiles(cwd: string): string[] {
  return unique([
    join(cwd, ".env.local"),
    join(cwd, ".env"),
    join(cwd, "dashboard", ".env.local"),
    join(cwd, "dashboard", ".env"),
    join(cwd, "..", ".env.local"),
    join(cwd, "..", ".env"),
  ]);
}

function defaultConfigPath(env: NodeJS.ProcessEnv): string {
  const dataDir = env.ORQUESTADOR_DATA_DIR?.trim();
  return join(dataDir || join(homedir(), ".orquestador-prime"), "config.json");
}

async function readEnvSnapshot(
  env: NodeJS.ProcessEnv,
  envFiles: readonly string[],
): Promise<EnvSnapshot> {
  const snapshot: EnvSnapshot = {};

  for (const [key, value] of Object.entries(env)) {
    if (hasUsableIntegrationValue(value)) snapshot[key] = value;
  }

  for (const file of envFiles) {
    try {
      const raw = await readFile(file, "utf-8");
      for (const line of raw.split(/\r?\n/)) {
        const parsed = parseEnvLine(line);
        if (!parsed) continue;

        const [key, value] = parsed;
        if (hasUsableIntegrationValue(value) && !snapshot[key]) {
          snapshot[key] = value;
        }
      }
    } catch {
      // Missing env files are normal for local diagnostics.
    }
  }

  return snapshot;
}

export async function getIntegrationEnvSnapshot(
  options: IntegrationStatusOptions = {},
): Promise<Readonly<EnvSnapshot>> {
  const cwd = options.cwd ?? process.cwd();
  const env = options.env ?? process.env;
  const envFiles = options.envFiles ?? defaultEnvFiles(cwd);
  return readEnvSnapshot(env, envFiles);
}

async function readLegacyWhatsAppConfig(path: string): Promise<LegacyWhatsAppConfig> {
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw) as LegacyWhatsAppConfig;
  } catch {
    return {};
  }
}

function envGroupConfigured(env: EnvSnapshot, names: readonly string[]): boolean {
  return names.some((name) => hasUsableIntegrationValue(env[name]));
}

function envRequirementsConfigured(
  env: EnvSnapshot,
  requiredEnv: readonly (readonly string[])[],
): boolean {
  return requiredEnv.every((group) => envGroupConfigured(env, group));
}

function legacyWhatsAppConfigured(config: LegacyWhatsAppConfig): boolean {
  return !!(
    config.whatsapp?.enabled &&
    hasUsableIntegrationValue(config.whatsapp.hookToken) &&
    hasUsableIntegrationValue(config.whatsapp.n8nWebhookPath)
  );
}

export async function getIntegrationStatuses(
  options: IntegrationStatusOptions = {},
): Promise<IntegrationStatus[]> {
  const cwd = options.cwd ?? process.cwd();
  const env = options.env ?? process.env;
  const envFiles = options.envFiles ?? defaultEnvFiles(cwd);
  const configPath = options.configPath ?? defaultConfigPath(env);
  const envSnapshot = await getIntegrationEnvSnapshot({
    cwd,
    env,
    envFiles,
    configPath,
  });
  const legacyConfig = await readLegacyWhatsAppConfig(configPath);

  return INTEGRATIONS.map((integration) => {
    const configured = envRequirementsConfigured(envSnapshot, integration.requiredEnv);
    const configuredByLegacyConfig =
      integration.id === "whatsapp" && legacyWhatsAppConfigured(legacyConfig);

    return {
      id: integration.id,
      name: integration.name,
      description: integration.description,
      configured: configured || configuredByLegacyConfig,
    };
  });
}
