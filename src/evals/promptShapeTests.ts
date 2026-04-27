import { buildBlueprintPrompt } from "../prompts/blueprint.js";
import { buildPlanningPrompt } from "../prompts/planning.js";
import { buildRoutingPrompt } from "../prompts/routing.js";
import { buildScaffoldPrompt } from "../prompts/scaffold.js";
import { buildExecutionPrompt } from "../prompts/execution.js";
import type { BlueprintContext, OrchestratorMode, RouterResult } from "../types.js";
import type { PromptShapeResult } from "./types.js";

interface PromptCase {
  promptId: string;
  mode: OrchestratorMode;
  text: string;
  requiredSections: string[];
  forbiddenPatterns: RegExp[];
  jsonOnlyExpected: boolean;
  safetyClauses: string[];
}

const SAFE_TASK = "Design a safe local project status workflow with redacted examples and offline validation.";

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function syntheticRouter(): RouterResult {
  return {
    selectedAgents: ["architect", "frontend", "backend", "qa"],
    matchedKeywords: ["frontend", "validation"],
    summary: [
      "Detected keywords: frontend, validation",
      "Selected agents (4):",
      "- architect [core] (architecture): Defines system structure.",
      "- frontend [core] (frontend): React architecture.",
      "- backend [core] (backend): APIs and services.",
      "- qa [core] (quality): Test strategy.",
    ].join("\n"),
  };
}

function syntheticBlueprintContext(): BlueprintContext {
  return {
    projectType: "saas",
    detectedFeatures: ["authentication", "search", "analytics"],
    agentAssignments: [
      { agent: "architect", domain: "architecture", responsibility: "System boundaries and sequencing." },
      { agent: "frontend", domain: "frontend", responsibility: "User-facing routes and components." },
      { agent: "backend", domain: "backend", responsibility: "Service contracts and validation." },
      { agent: "qa", domain: "quality", responsibility: "Regression and edge-case validation." },
    ],
  };
}

function promptCases(): PromptCase[] {
  const router = syntheticRouter();
  const blueprint = syntheticBlueprintContext();

  return [
    {
      promptId: "prompt.routing",
      mode: "route",
      text: buildRoutingPrompt(SAFE_TASK, router),
      requiredSections: ["Best specialist", "Architecture plan", "Risks", "Validations"],
      forbiddenPatterns: [/sk_[a-z0-9_-]{12,}/i, /bearer\s+[a-z0-9._-]{12,}/i],
      jsonOnlyExpected: false,
      safetyClauses: [],
    },
    {
      promptId: "prompt.planning",
      mode: "plan",
      text: buildPlanningPrompt(SAFE_TASK, router),
      requiredSections: ["Respond ONLY with a valid JSON object", "architectureOverview", "validationStrategy"],
      forbiddenPatterns: [/sk_[a-z0-9_-]{12,}/i, /bearer\s+[a-z0-9._-]{12,}/i],
      jsonOnlyExpected: true,
      safetyClauses: ["technicalRisks"],
    },
    {
      promptId: "prompt.blueprint",
      mode: "blueprint",
      text: buildBlueprintPrompt(SAFE_TASK, router, blueprint),
      requiredSections: ["projectOverview", "architectureLayers", "implementationRoadmap", "validationStrategy"],
      forbiddenPatterns: [/sk_[a-z0-9_-]{12,}/i, /bearer\s+[a-z0-9._-]{12,}/i],
      jsonOnlyExpected: true,
      safetyClauses: ["technicalRisks"],
    },
    {
      promptId: "prompt.scaffold",
      mode: "scaffold",
      text: buildScaffoldPrompt(SAFE_TASK, router, blueprint),
      requiredSections: ["Generate a complete scaffold specification", "files", "setupInstructions", "files[].path must be relative"],
      forbiddenPatterns: [/sk_[a-z0-9_-]{12,}/i, /bearer\s+[a-z0-9._-]{12,}/i],
      jsonOnlyExpected: true,
      safetyClauses: ["no leading slash"],
    },
    {
      promptId: "prompt.execution",
      mode: "execute",
      text: buildExecutionPrompt(SAFE_TASK, router),
      requiredSections: ["minimum safe set of file changes", "rollbackPlan", "testingInstructions", "Maximum 10 files"],
      forbiddenPatterns: [/sk_[a-z0-9_-]{12,}/i, /bearer\s+[a-z0-9._-]{12,}/i],
      jsonOnlyExpected: true,
      safetyClauses: ["Never propose deleting files unless explicitly required", "Always include a rollback plan"],
    },
  ];
}

export function runPromptShapeTests(): PromptShapeResult[] {
  return promptCases().map((testCase) => {
    const normalized = normalize(testCase.text);
    const missingSections = testCase.requiredSections.filter(
      (section) => !normalized.includes(normalize(section)),
    );
    const missingSafety = testCase.safetyClauses.filter(
      (section) => !normalized.includes(normalize(section)),
    );
    const forbiddenMatches = testCase.forbiddenPatterns
      .filter((pattern) => pattern.test(testCase.text))
      .map((pattern) => pattern.source);
    const jsonOnlyMissing = testCase.jsonOnlyExpected && !normalized.includes("json");
    const reasonCodes: string[] = [];

    if (missingSections.length > 0) reasonCodes.push("prompt.missing_sections");
    if (missingSafety.length > 0) reasonCodes.push("prompt.missing_safety_clause");
    if (forbiddenMatches.length > 0) reasonCodes.push("prompt.forbidden_secret_shape");
    if (jsonOnlyMissing) reasonCodes.push("prompt.json_contract_missing");

    return {
      id: testCase.promptId,
      promptId: testCase.promptId,
      title: `Prompt shape: ${testCase.promptId}`,
      status: reasonCodes.length > 0 ? "fail" : "pass",
      reasonCodes,
      details: reasonCodes.length === 0
        ? ["Prompt shape contains required offline contract sections."]
        : [
            `Missing sections: ${[...missingSections, ...missingSafety].join(", ") || "none"}.`,
            `Forbidden matches: ${forbiddenMatches.join(", ") || "none"}.`,
          ],
      mode: testCase.mode,
      promptLength: testCase.text.length,
      requiredSections: [...testCase.requiredSections, ...testCase.safetyClauses],
      missingSections: [...missingSections, ...missingSafety],
      forbiddenMatches,
      jsonOnlyExpected: testCase.jsonOnlyExpected,
    };
  });
}
