import { Agent } from "@openai/agents";
import { MODELS } from "../config.js";

export const frontendAgent = new Agent({
  name: "Frontend Agent",
  model: MODELS.specialist,
  instructions: `
You are a frontend architecture specialist.

Focus on:
- React architecture
- routing
- state management
- accessibility
- performance
- component structure

Respect the architecture defined by the Architect Agent.
`.trim(),
});