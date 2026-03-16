import { Agent, run } from "@openai/agents";
import { MODELS } from "../config.js";
import { architectAgent } from "../agents/architect.js";
import { frontendAgent } from "../agents/frontend.js";
import { backendAgent } from "../agents/backend.js";
import { qaAgent } from "../agents/qa.js";
import { relationalDbAgent, nosqlAgent } from "../agents/db.js";
import { securityAgent } from "../agents/security.js";
import { devopsAgent } from "../agents/devops.js";
import { buildPlanningPrompt } from "../prompts/planning.js";
import { buildRoutingPrompt } from "../prompts/routing.js";
import { apiDesignerAgent } from "../agents/apiDesigner.js";
import { integrationAgent } from "../agents/integration.js";
import { uxuiAgent } from "../agents/uxui.js";
import { motionFxAgent } from "../agents/motionFx.js";
import { aimlAgent } from "../agents/aiml.js";

export type OrchestratorMode = "plan" | "route";

export function parseArgs(argv: string[]) {
  let mode: OrchestratorMode = "plan";
  const taskParts: string[] = [];

  for (const arg of argv) {
    if (arg.startsWith("--mode=")) {
      const value = arg.split("=")[1];
      if (value === "plan" || value === "route") {
        mode = value;
        continue;
      }
    }
    taskParts.push(arg);
  }

  return {
    mode,
    task: taskParts.join(" ").trim(),
  };
}

export const orchestrator = Agent.create({
  name: "Project Orchestrator",
  model: MODELS.synthesis,
  instructions: `
You are the central AI orchestrator for a multi-agent engineering system.

Process:
1. Analyze the task
2. Delegate to appropriate specialists
3. Consolidate the results

Your final output must include:
1. Architecture overview
2. Responsible agents
3. Implementation order
4. Technical risks
5. Validation strategy
`.trim(),
    handoffs: [
    architectAgent,
    frontendAgent,
    backendAgent,
    qaAgent,
    relationalDbAgent,
    nosqlAgent,
    securityAgent,
    devopsAgent,
    apiDesignerAgent,
    integrationAgent,
    uxuiAgent,
    motionFxAgent,
    aimlAgent,
    ],
});

export async function runOrchestrator(task: string, mode: OrchestratorMode) {
  const prompt =
    mode === "route" ? buildRoutingPrompt(task) : buildPlanningPrompt(task);

  return run(orchestrator, prompt);
}