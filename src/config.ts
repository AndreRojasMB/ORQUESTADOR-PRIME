// src/config.ts
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY:    z.string().min(1, "OPENAI_API_KEY is required"),
  ANTHROPIC_API_KEY: z.string().optional(),

  PLANNER_MODEL:    z.string().default("gpt-4o"),
  SPECIALIST_MODEL: z.string().default("gpt-4o"),
  SYNTHESIS_MODEL:  z.string().default("gpt-4o"),

  CLAUDE_ARCHITECT_MODEL: z.string().default("claude-opus-4-5"),
  CLAUDE_BLUEPRINT_MODEL: z.string().default("claude-opus-4-5"),

  // GitHub — opcional, solo activo si GITHUB_TOKEN existe
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_OWNER: z.string().optional(),
  GITHUB_REPO:  z.string().optional(),
  GITHUB_MCP_ENABLED: z.string().default("false"),

  // OpenClaw — opcional, solo activo si OPENCLAW_GATEWAY_TOKEN existe
  OPENCLAW_GATEWAY_URL:   z.string().default("http://localhost:18789"),
  OPENCLAW_GATEWAY_TOKEN: z.string().optional(),
  OPENCLAW_MODEL:         z.string().default("openclaw-default"),

  // n8n — opcional, solo activo si N8N_API_KEY existe
  N8N_BASE_URL:         z.string().default("http://localhost:5678"),
  N8N_API_KEY:          z.string().optional(),
  N8N_WEBHOOK_BASE_URL: z.string().optional(),

  // Kimi — opcional, solo activo si KIMI_API_KEY existe
  KIMI_API_KEY:  z.string().optional(),
  KIMI_MODEL:    z.string().default("kimi-k2.6"),
  KIMI_THINKING: z.string().default("false"),

  // LightRAG — opcional, solo activo si LIGHTRAG_API_KEY existe
  LIGHTRAG_BASE_URL: z.string().default("http://localhost:9621"),
  LIGHTRAG_API_KEY:  z.string().optional(),

  // Omi — opcional, secret para validar webhooks entrantes
  OMI_WEBHOOK_SECRET: z.string().optional(),

  // Context format — prompt-only; default text preserves pre-31B behavior
  CONTEXT_FORMAT: z.enum(["text", "toon"]).default("text"),

  // Phase 32A — real repo-mutating dispatch stays OFF by default.
  // Previews run without this flag; real execution requires a future phase to flip it.
  ACTIONS_REAL_EXECUTION_ENABLED: z.string().default("false"),
  // Phase 32A — TTL for single-use second approvals (ms). 15 minutes default.
  SECOND_APPROVAL_TTL_MS: z.string().default("900000"),

  // Phase 32C — file-write preview/real safety limits.
  // All inputs are strings (env vars); coerced and capped below.
  FILE_WRITE_ALLOWED_ROOTS:      z.string().default("src,tests,docs,scripts"),
  FILE_WRITE_MAX_FILES:          z.string().default("20"),
  FILE_WRITE_MAX_BYTES_PER_FILE: z.string().default("262144"),
  FILE_WRITE_MAX_TOTAL_BYTES:    z.string().default("1048576"),
  FILE_WRITE_ALLOW_SENSITIVE:    z.string().default("false"),

  // Coolify — opcional, solo activo si COOLIFY_API_TOKEN existe
  COOLIFY_API_URL:      z.string().default("http://localhost:8000"),
  COOLIFY_API_TOKEN:    z.string().optional(),
  COOLIFY_PROJECT_UUID: z.string().optional(),
  COOLIFY_SERVER_UUID:  z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Environment configuration error:");
  console.error(_env.error.flatten().fieldErrors);
  process.exit(1);
}

const env = _env.data;

export const MODELS = {
  planner:    env.PLANNER_MODEL,
  specialist: env.SPECIALIST_MODEL,
  synthesis:  env.SYNTHESIS_MODEL,
} as const;

export const CLAUDE_MODELS = {
  architect: env.CLAUDE_ARCHITECT_MODEL,
  blueprint: env.CLAUDE_BLUEPRINT_MODEL,
} as const;

export const PROVIDERS = {
  openai:    { apiKey: env.OPENAI_API_KEY },
  anthropic: { apiKey: env.ANTHROPIC_API_KEY },
} as const;

export const KIMI_CONFIG = {
  apiKey:   env.KIMI_API_KEY,
  model:    env.KIMI_MODEL,
  thinking: env.KIMI_THINKING === "true",
} as const;

export const OPENCLAW_CONFIG = {
  gatewayUrl: env.OPENCLAW_GATEWAY_URL,
  token:      env.OPENCLAW_GATEWAY_TOKEN,
  model:      env.OPENCLAW_MODEL,
} as const;

export const N8N_CONFIG = {
  baseUrl:        env.N8N_BASE_URL,
  apiKey:         env.N8N_API_KEY,
  webhookBaseUrl: env.N8N_WEBHOOK_BASE_URL ?? env.N8N_BASE_URL,
} as const;

export const LIGHTRAG_CONFIG = {
  baseUrl: env.LIGHTRAG_BASE_URL,
  apiKey:  env.LIGHTRAG_API_KEY,
} as const;

export const COOLIFY_CONFIG = {
  apiUrl:      env.COOLIFY_API_URL,
  token:       env.COOLIFY_API_TOKEN,
  projectUuid: env.COOLIFY_PROJECT_UUID,
  serverUuid:  env.COOLIFY_SERVER_UUID,
} as const;

export const OMI_CONFIG = {
  webhookSecret: env.OMI_WEBHOOK_SECRET,
} as const;

export const CONTEXT_FORMAT: "text" | "toon" = env.CONTEXT_FORMAT;

export const ACTIONS_REAL_EXECUTION_ENABLED: boolean =
  env.ACTIONS_REAL_EXECUTION_ENABLED === "true";

export const SECOND_APPROVAL_TTL_MS: number = (() => {
  const n = Number(env.SECOND_APPROVAL_TTL_MS);
  return Number.isFinite(n) && n > 0 ? n : 900_000;
})();

// Phase 32C — file-write safety limits.
// Each numeric limit is parsed, then clamped to its hard maximum so a hostile
// or fat-fingered env value cannot widen the safety envelope past the cap.
function clampPositive(raw: string, fallback: number, max: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}

export const FILE_WRITE_ALLOWED_ROOTS: string = env.FILE_WRITE_ALLOWED_ROOTS;
export const FILE_WRITE_MAX_FILES: number =
  clampPositive(env.FILE_WRITE_MAX_FILES, 20, 100);
export const FILE_WRITE_MAX_BYTES_PER_FILE: number =
  clampPositive(env.FILE_WRITE_MAX_BYTES_PER_FILE, 262_144, 1_048_576);
export const FILE_WRITE_MAX_TOTAL_BYTES: number =
  clampPositive(env.FILE_WRITE_MAX_TOTAL_BYTES, 1_048_576, 4_194_304);
export const FILE_WRITE_ALLOW_SENSITIVE: boolean =
  env.FILE_WRITE_ALLOW_SENSITIVE === "true";

export const GITHUB_CONFIG = {
  token:   env.GITHUB_TOKEN,
  owner:   env.GITHUB_OWNER,
  repo:    env.GITHUB_REPO,
  enabled: env.GITHUB_MCP_ENABLED === "true" && !!env.GITHUB_TOKEN,
} as const;

export function isClaudeAvailable(): boolean {
  return !!env.ANTHROPIC_API_KEY;
}

export function isOpenClawAvailable(): boolean {
  return !!env.OPENCLAW_GATEWAY_TOKEN;
}

export function isLightRAGAvailable(): boolean {
  return !!env.LIGHTRAG_API_KEY;
}

export function isCoolifyAvailable(): boolean {
  return !!env.COOLIFY_API_TOKEN;
}

export function isN8nAvailable(): boolean {
  return !!env.N8N_API_KEY;
}

export function isKimiAvailable(): boolean {
  return !!env.KIMI_API_KEY;
}

export function isGitHubAvailable(): boolean {
  return GITHUB_CONFIG.enabled &&
    !!GITHUB_CONFIG.token &&
    !!GITHUB_CONFIG.owner &&
    !!GITHUB_CONFIG.repo;
}

export type ModelConfig = typeof MODELS;