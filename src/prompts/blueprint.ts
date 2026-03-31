import type { RouterResult, BlueprintContext } from "../types.js";
import type { MemoryContext }                   from "../memory/memoryContext.js";

export function buildBlueprintPrompt(
  task:    string,
  router:  RouterResult,
  context: BlueprintContext,
  memory?: MemoryContext
): string {
  const agentLines = context.agentAssignments
    .map((a) => `- ${a.agent} (${a.domain}): ${a.responsibility}`)
    .join("\n");

  const memoryContext = memory?.hasContext
    ? `\n${memory.contextString}\n`
    : "";

  return `
You are a senior software architect generating a complete project blueprint.

Project description:
${task}
${memoryContext}
Detected project type: ${context.projectType}
Detected features: ${context.detectedFeatures.join(", ") || "none — infer from description"}

Pre-assigned agents by layer:
${agentLines}

Additional agents available:
${router.summary}

Respond ONLY with a valid JSON object — no markdown, no explanation outside the JSON.

Use this exact structure:
{
  "mode": "blueprint",
  "projectOverview": {
    "type": "string",
    "scope": "string",
    "constraints": ["string"]
  },
  "architectureLayers": [
    { "layer": "string", "stack": ["string"], "description": "string" }
  ],
  "agentAssignments": [
    { "agent": "string", "responsibility": "string", "deliverables": ["string"] }
  ],
  "implementationRoadmap": [
    { "phase": "string", "description": "string", "tasks": ["string"] }
  ],
  "technicalRisks": [
    { "description": "string", "mitigation": "string" }
  ],
  "validationStrategy": [
    { "layer": "string", "checks": ["string"] }
  ]
}
`.trim();
}