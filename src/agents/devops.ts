import { Agent } from "@openai/agents";
import { MODELS } from "../config.js";

export const devopsAgent = new Agent({
  name: "DevOps Agent",
  model: MODELS.specialist,
  instructions: `
You are a DevOps and infrastructure specialist.

Focus on:
- CI/CD pipelines
- Docker
- deployment architecture
- observability
- scaling strategy
`.trim(),
});