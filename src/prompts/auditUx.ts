// src/prompts/auditUx.ts
// Phase 32C-UXAUDIT — read-only structured UX/UI audit prompt.
// The output schema IS the spec; the JSON-only instruction is mandatory.

import type { UxAuditContext } from "../audit/auditContext.js";

export function buildUxAuditPrompt(context: UxAuditContext): string {
  return `
You are a senior product design + frontend team performing a TARGETED visual/UX audit
of a specific page or section. The audit is read-only: do not propose code edits, do not
invent file paths, and do not reference files outside those provided below.

${context.repoSummary}

Active specialist agents and their ownership for this audit:
- uxui    : layout, design tokens, spacing rhythm, interaction states, accessibility
- motionFx: animation systems, scroll effects, micro-interactions, motion timing
- frontend: React structure, composition, state, code splitting, render cost
- qa      : edge cases, regression risks, empty/loading/error states

Repository file contents (focused):
${context.fileContext}

Perform a structured UX/UI audit and respond ONLY with a single valid JSON object.
No markdown, no commentary outside the JSON, no fenced code blocks.

Use this exact structure (omit empty arrays as []; never invent values):
{
  "mode": "audit-ux",
  "scope": "${context.scope}",
  "entry": "${context.entry}",
  "sectionsRequested": ${JSON.stringify(context.sections)},
  "activeAgents": ${JSON.stringify(context.agents)},

  "currentComposition": {
    "summary": "string — one paragraph describing what the page is and how it composes",
    "primaryComponents": ["string — component names found in the provided files"],
    "renderTree": ["string — top-level render order, parent → child"],
    "stylingApproach": "tailwind | css-modules | css-in-js | plain-css | other",
    "stateModel": "local | context | redux | zustand | mobx | server | other"
  },

  "visualProblems": [
    {
      "severity": "critical | high | medium | low",
      "title": "string",
      "where": "file:component or file:line range",
      "evidence": "what in the code shows this",
      "recommendation": "specific, no code"
    }
  ],

  "sectionDiagnosis": [
    {
      "section": "one of sectionsRequested",
      "found": true,
      "files": ["string"],
      "uxFindings":   ["string — flow, hierarchy, copy, states"],
      "uiFindings":   ["string — spacing, color, typography, tokens"],
      "severityHigh": ["string — items that block release"]
    }
  ],

  "motionRecommendation": {
    "currentLibraries": ["framer-motion | gsap | css-only | none | other"],
    "recommended":      "framer-motion | gsap | css-only | none",
    "rationale":        "string — why this fits the page's complexity and stack",
    "specificEffects":  [
      {
        "where": "section or component",
        "effect": "string — e.g. fade-up on scroll into view",
        "easing": "string — e.g. easeOut, cubic-bezier(0.2, 0.8, 0.2, 1)",
        "duration": "string — e.g. 240ms",
        "reducedMotion": "string — fallback behavior under prefers-reduced-motion"
      }
    ]
  },

  "responsiveRisks": [
    { "breakpoint": "sm | md | lg | xl", "risk": "string", "where": "string" }
  ],

  "accessibilityRisks": [
    { "wcag": "criterion id e.g. 1.4.3", "risk": "string", "where": "string", "fix": "string" }
  ],

  "performanceRisks": [
    { "category": "lcp | cls | inp | bundle | image | hydration", "risk": "string", "where": "string" }
  ],

  "noTouchList": [
    { "path": "string — file or directory that should NOT be modified by the next phase", "reason": "string" }
  ],

  "recommendedNextPhase": {
    "phaseName": "string — short label",
    "scope": "string — one paragraph",
    "files": ["string — relative paths only"],
    "agents": ["uxui","motionFx","frontend","qa"],
    "estimatedEffort": "low | medium | high",
    "blockers": ["string — list any preconditions"]
  }
}

Rules:
- Reference ONLY files listed in "FILES READ" / "Focused file tree" above.
- Do not include any field outside the schema.
- Severity and category enums must match exactly.
- If a section in sectionsRequested has no corresponding file, set "found": false and explain in uxFindings.
- noTouchList must contain at least the configuration / lockfile paths visible in the focused tree, if any.
- This audit must not propose any write, branch, commit, or PR. The recommendedNextPhase is descriptive only.
`.trim();
}
