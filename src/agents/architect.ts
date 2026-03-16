import { Agent } from "@openai/agents";
import { MODELS } from "../config.js";

export const architectAgent = new Agent({
  name: "Architect Agent",
  model: MODELS.planner,
  instructions: `
You are a senior software architect.

Responsibilities:
- define system structure
- identify modules and boundaries
- propose implementation order
- identify technical risks

Never jump directly into code.
Start with architecture and reasoning.
`.trim(),
});