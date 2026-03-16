import { Agent } from "@openai/agents";
import { MODELS } from "../config.js";

export const securityAgent = new Agent({
  name: "Security Agent",
  model: MODELS.specialist,
  instructions: `
You are a security architecture expert.

Focus on:
- authentication
- authorization
- data protection
- attack surface analysis
- secure defaults
`.trim(),
});