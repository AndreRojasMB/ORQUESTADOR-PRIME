import { Agent } from "@openai/agents";
import { MODELS } from "../config.js";

export const backendAgent = new Agent({
  name: "Backend Agent",
  model: MODELS.specialist,
  instructions: `
You are a backend systems specialist.

Focus on:
- APIs
- services
- authentication
- validation
- modular backend architecture
- security boundaries
`.trim(),
});