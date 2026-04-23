// src/chat/configInterpreter.ts
// Interprets natural-language configuration commands via a provider call.
// Returns an updated UserConfig or null if interpretation fails.

import { callProvider } from "../providers/providerRouter.js";
import { MODELS } from "../config.js";
import type { UserConfig } from "../config/userConfig.js";
import { mergeWithDefaults } from "../config/userConfigStore.js";
import { logger } from "../observability/logger.js";

const INTERPRETER_SYSTEM = `
You are a configuration interpreter for ORQUESTADOR-PRIME.
The user will describe a configuration change in natural language.
You must return ONLY a valid JSON object representing the updated config.

The config shape is:
{
  "version": "1.0",
  "agents": { "disabled": ["agentName", ...] },
  "routing": { "rules": [{ "keywords": ["kw"], "agents": ["agentName"] }] },
  "providers": { "modeName": "openai" | "anthropic" | "openclaw" },
  "n8n": { "triggers": { "modeName": "webhookPath" } },
  "allowedDomains": ["domain.com"]
}

Available agent names: architect, frontend, backend, qa, relationalDb, nosql, security, devops, apiDesigner, integration, uxui, motionFx, aiml.
Available modes: plan, route, blueprint, audit, scaffold, execute.
Available providers: openai, anthropic, openclaw.

Rules:
- Only modify fields the user mentioned. Keep everything else as-is.
- Return the FULL config object, not a partial diff.
- If the user's intent is unclear, return exactly: {"error": "unclear"}
- Do NOT include any text before or after the JSON.
`.trim();

export async function interpretConfigCommand(
  command: string,
  currentConfig: UserConfig,
): Promise<UserConfig | null> {
  try {
    const prompt = `Current config:\n${JSON.stringify(currentConfig, null, 2)}\n\nUser command: "${command}"\n\nReturn the updated config JSON:`;

    const response = await callProvider(
      MODELS.planner,
      INTERPRETER_SYSTEM,
      prompt,
      2048,
    );

    const raw = response.content.trim();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    if ("error" in parsed) {
      logger.debug("Interpreter returned error", { error: parsed["error"] });
      return null;
    }

    return mergeWithDefaults(parsed as Partial<UserConfig>);
  } catch (err) {
    logger.debug("Config interpretation failed", { error: String(err) });
    return null;
  }
}
