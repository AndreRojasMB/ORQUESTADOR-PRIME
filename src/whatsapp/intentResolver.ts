// src/whatsapp/intentResolver.ts
// Keyword-only intent resolution: message text → OrchestratorMode + task.
// v1: deterministic, no provider/NL fallback.

import type { OrchestratorMode } from "../types.js";

interface IntentResult {
  mode: OrchestratorMode;
  task: string;
  blocked: boolean;
}

const KEYWORD_MAP: Array<{ pattern: RegExp; mode: OrchestratorMode }> = [
  { pattern: /^blueprint|^design|^architect/i, mode: "blueprint" },
  { pattern: /^plan\b|^planning\b/i,          mode: "plan" },
  { pattern: /^audit|^review|^check\b/i,      mode: "audit" },
  { pattern: /^route|^who should/i,            mode: "route" },
  { pattern: /^scaffold|^generate project/i,   mode: "scaffold" },
  { pattern: /^execute|^implement|^deploy/i,   mode: "execute" },
  { pattern: /^memory|^history|^recent/i,      mode: "memory" },
];

/**
 * Maps a user message to an orchestrator mode and cleaned task text.
 * If the resolved mode is not in safeModes, returns blocked=true
 * and falls back to "plan" with the original text.
 */
export function resolveIntent(
  text: string,
  safeModes: OrchestratorMode[],
): IntentResult {
  const trimmed = text.trim();

  for (const { pattern, mode } of KEYWORD_MAP) {
    const match = trimmed.match(pattern);
    if (match) {
      const task = trimmed.slice(match[0].length).trim() || trimmed;

      if (!safeModes.includes(mode)) {
        return { mode: "plan", task: trimmed, blocked: true };
      }

      return { mode, task, blocked: false };
    }
  }

  // Default: plan mode with full text as task
  return { mode: "plan", task: trimmed, blocked: false };
}
