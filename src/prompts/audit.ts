// src/prompts/audit.ts

import type { AuditContext } from "../audit/auditContext.js";
import type { RouterResult } from "../types.js";

export function buildAuditPrompt(
  context: AuditContext,
  router:  RouterResult
): string {
  return `
You are a senior engineering team performing a structured audit of an existing repository.

${context.repoSummary}

Active specialist agents for this audit:
${router.summary}

Repository file contents:
${context.fileContext}

Perform a comprehensive audit and respond ONLY with a valid JSON object.
No markdown, no explanation outside the JSON.

Use this exact structure:
{
  "mode": "audit",
  "repositorySummary": {
    "projectType": "string",
    "techStack": ["string"],
    "estimatedMaturity": "early | growing | mature"
  },
  "findings": [
    {
      "severity": "critical | high | medium | low",
      "category": "string",
      "agent": "string",
      "title": "string",
      "description": "string",
      "recommendation": "string",
      "affectedFiles": ["string"]
    }
  ],
  "strengths": ["string"],
  "prioritizedActions": [
    {
      "priority": 1,
      "action": "string",
      "effort": "low | medium | high",
      "impact": "low | medium | high"
    }
  ],
  "technicalDebt": {
    "score": 1,
    "summary": "string",
    "mainContributors": ["string"]
  }
}

Be specific. Reference actual files and patterns found in the repository.
Do not invent findings — only report what is observable from the provided code.
`.trim();
}