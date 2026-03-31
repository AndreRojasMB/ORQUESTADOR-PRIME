// src/prompts/planning.ts

import type { RouterResult }  from "../types.js";
import type { MemoryContext } from "../memory/memoryContext.js";

export function buildPlanningPrompt(
  task:    string,
  router?: RouterResult,
  memory?: MemoryContext
): string {
  const routerContext = router
    ? `\nPre-selected agents for this task:\n${router.summary}\n`
    : "";

  const memoryContext = memory?.hasContext
    ? `\n${memory.contextString}\n`
    : "";

  return `
Create a structured technical plan for this task using the specialist agents:

${task}
${memoryContext}${routerContext}
Respond ONLY with a valid JSON object — no markdown, no explanation outside the JSON.

Use this exact structure:
{
  "mode": "plan",
  "architectureOverview": "string",
  "agentAssignments": [
    { "agent": "string", "responsibility": "string", "deliverables": ["string"] }
  ],
  "implementationOrder": ["string"],
  "technicalRisks": [
    { "description": "string", "mitigation": "string" }
  ],
  "validationStrategy": [
    { "layer": "string", "checks": ["string"] }
  ]
}
`.trim();
}