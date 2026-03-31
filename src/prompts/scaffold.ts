// src/prompts/scaffold.ts

import type { RouterResult, BlueprintContext } from "../types.js";

export function buildScaffoldPrompt(
  task:    string,
  router:  RouterResult,
  context: BlueprintContext
): string {
  return `
You are a senior software architect generating a project scaffold specification.

Project description:
${task}

Detected project type : ${context.projectType}
Detected features     : ${context.detectedFeatures.join(", ") || "none"}

Active agents:
${router.summary}

Generate a complete scaffold specification and respond ONLY with valid JSON.
No markdown, no explanation outside the JSON.

Use this exact structure:
{
  "mode": "scaffold",
  "projectType": "string",
  "techStack": ["string"],
  "directories": ["string"],
  "files": [
    {
      "path": "string",
      "description": "string",
      "content": "string"
    }
  ],
  "setupInstructions": ["string"],
  "nextSteps": ["string"]
}

Rules:
- files[].path must be relative (no leading slash)
- files[].content must be complete, runnable file content
- Include only essential files — no boilerplate noise
- Tailor stack to the project type and features detected
- Always include: README.md, .env.example, .gitignore, tsconfig.json or equivalent
- For web projects include: entry point, one route/page, one component, one utility
`.trim();
}