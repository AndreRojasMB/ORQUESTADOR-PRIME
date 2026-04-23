// src/banner.ts
// Prints a welcome banner with system status on every run.

import { agentRegistry } from "./agents/registry.js";
import { readMemoryStore } from "./memory/memoryStore.js";
import { readUserConfig } from "./config/userConfigStore.js";
import {
  isN8nAvailable,
  isLightRAGAvailable,
  isCoolifyAvailable,
  isOpenClawAvailable,
  MODELS,
} from "./config.js";

const VERSION = "3.1.0";

function status(ok: boolean): string {
  return ok ? "\u2705" : "\u274C";
}

export async function printBanner(): Promise<void> {
  const userConfig = await readUserConfig();
  const totalAgents = Object.keys(agentRegistry).length;
  const activeAgents = totalAgents - userConfig.agents.disabled.length;

  const store = await readMemoryStore();
  const totalRuns = store.entries.length;

  const defaultProvider = `openai (${MODELS.planner})`;

  const n8n = status(isN8nAvailable());
  const rag = status(isLightRAGAvailable());
  const coolify = status(isCoolifyAvailable());
  const openclaw = status(isOpenClawAvailable());

  console.log(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551  ORQUESTADOR-PRIME  v${VERSION.padEnd(36)}\u2551
\u2551  Agents: ${String(activeAgents).padEnd(3)} active  \u00B7  Provider: ${defaultProvider.padEnd(20)}\u2551
\u2551  Memory: ${String(totalRuns).padEnd(4)} runs${" ".repeat(39)}\u2551
\u2551  n8n ${n8n}  LightRAG ${rag}  Coolify ${coolify}  OpenClaw ${openclaw}${" ".repeat(9)}\u2551
\u2551  Hint: Run \`npm run chat\` to configure${" ".repeat(18)}\u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
  `.trim());
}
