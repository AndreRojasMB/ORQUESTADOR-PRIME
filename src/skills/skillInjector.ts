// src/skills/skillInjector.ts
// Resolves active skills for a set of agents and returns concatenated content.
// Returns empty string if no skills match — zero behavioral change when disabled.

import type { SkillsConfig } from "../config/userConfig.js";
import { loadSkill } from "./skillStore.js";
import { logger } from "../observability/logger.js";

const MAX_CHARS_PER_AGENT = 2000;

/**
 * Returns concatenated skill content applicable to the given agents.
 * If no skills are enabled or no agents match, returns empty string.
 */
export async function getSkillsForAgents(
  agentNames: string[],
  skillsConfig: SkillsConfig | undefined,
): Promise<string> {
  if (!skillsConfig || skillsConfig.enabled.length === 0) {
    return "";
  }

  const agentSet = new Set(agentNames);
  const matchedSkills = new Set<string>();

  // Find which enabled skills map to any of the selected agents
  for (const skillName of skillsConfig.enabled) {
    const targetAgents = skillsConfig.agentMap[skillName];
    if (!targetAgents || targetAgents.length === 0) continue;

    const hasMatch = targetAgents.some((a) => agentSet.has(a));
    if (hasMatch) {
      matchedSkills.add(skillName);
    }
  }

  if (matchedSkills.size === 0) {
    return "";
  }

  // Load and concatenate matched skill content
  const parts: string[] = [];

  for (const skillName of matchedSkills) {
    const content = await loadSkill(skillName);
    if (!content) continue;

    const trimmed =
      content.length > MAX_CHARS_PER_AGENT
        ? content.slice(0, MAX_CHARS_PER_AGENT)
        : content;

    parts.push(trimmed);
  }

  if (parts.length === 0) {
    return "";
  }

  const result = parts.join("\n\n");
  logger.debug(`Skills injected: ${matchedSkills.size} skill(s), ${result.length} chars`);
  return result;
}
