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

export const GITHUB_CONFIG = {
  token:   env.GITHUB_TOKEN,
  owner:   env.GITHUB_OWNER,
  repo:    env.GITHUB_REPO,
  enabled: env.GITHUB_MCP_ENABLED === "true" && !!env.GITHUB_TOKEN,
} as const;

export function isClaudeAvailable(): boolean {
  return !!env.ANTHROPIC_API_KEY;
}

export function isGitHubAvailable(): boolean {
  return GITHUB_CONFIG.enabled &&
    !!GITHUB_CONFIG.token &&
    !!GITHUB_CONFIG.owner &&
    !!GITHUB_CONFIG.repo;
}

export type ModelConfig = typeof MODELS;