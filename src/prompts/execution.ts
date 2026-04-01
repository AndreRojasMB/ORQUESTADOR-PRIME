// src/prompts/execution.ts

import type { RouterResult } from "../types.js";

export function buildExecutionPrompt(
  task:   string,
  router: RouterResult
): string {
  return `
You are a senior software engineer proposing safe, minimal code changes.

Task:
${task}

Active agents:
${router.summary}

Analyze the task and propose the minimum safe set of file changes needed.
Respond ONLY with valid JSON — no markdown, no explanation outside the JSON.

Use this exact structure:
{
  "mode": "execute",
  "title": "string",
  "description": "string",
  "files": [
    {
      "path": "string",
      "operation": "create | modify | delete",
      "content": "string",
      "reason": "string"
    }
  ],
  "risks": ["string"],
  "rollbackPlan": "string",
  "testingInstructions": ["string"]
}

Rules:
- Prefer minimal diffs — only change what is strictly necessary
- Never propose deleting files unless explicitly required by the task
- Always include a rollback plan
- content must be the complete file content, not a diff
- Explain every file change in reason
- Maximum 10 files per proposal
`.trim();
}