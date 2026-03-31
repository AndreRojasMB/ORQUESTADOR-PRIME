// src/agents/selector.ts

import { agentRegistry } from "./registry.js";
import type { AgentName } from "./registry.js";          // ← viene de registry, no de types
import type { AgentDomain, AgentTier, AgentEntry } from "../types.js";

const registry = agentRegistry as Record<AgentName, AgentEntry>;
const entries = Object.entries(registry) as Array<[AgentName, AgentEntry]>;

export function selectByTier(tier: AgentTier): AgentName[] {
  return entries
    .filter(([, entry]) => entry.meta.tier === tier)
    .map(([name]) => name);
}

export function selectByDomain(domain: AgentDomain): AgentName[] {
  return entries
    .filter(([, entry]) => entry.meta.domain === domain)
    .map(([name]) => name);
}

export function selectByTags(tags: string[]): AgentName[] {
  return entries
    .filter(([, entry]) =>
      tags.every((tag) => entry.meta.tags.includes(tag))
    )
    .map(([name]) => name);
}

export function getAgentMeta(name: AgentName): AgentEntry["meta"] {
  const entry = registry[name];
  if (!entry) throw new Error(`Agent "${name}" not found in registry`);  // ← fix error 2
  return entry.meta;
}

export function registrySummary(): string {
  return entries
    .map(([name, entry]) =>
      `[${entry.meta.tier.toUpperCase()}] ${name} (${entry.meta.domain}): ${entry.meta.description}`
    )
    .join("\n");
}