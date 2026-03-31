// src/config.ts

import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY:    z.string().min(1, "OPENAI_API_KEY is required"),
  ANTHROPIC_API_KEY: z.string().optional(),

  PLANNER_MODEL:    z.string().default("gpt-4o"),
  SPECIALIST_MODEL: z.string().default("gpt-4o"),
  SYNTHESIS_MODEL:  z.string().default("gpt-4o"),

  // Modelos Claude — opcionales, solo activos si ANTHROPIC_API_KEY existe
  CLAUDE_ARCHITECT_MODEL: z.string().default("claude-opus-4-5"),
  CLAUDE_BLUEPRINT_MODEL: z.string().default("claude-opus-4-5"),
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

// Helper — indica si Claude está disponible en este entorno
export function isClaudeAvailable(): boolean {
  return !!env.ANTHROPIC_API_KEY;
}

export type ModelConfig = typeof MODELS;