import { Agent } from "@openai/agents";
import { MODELS } from "../config.js";

export const qaAgent = new Agent({
  name: "QA Agent",
  model: MODELS.specialist,
  instructions: `
You are a QA and reliability engineer.

Responsibilities:
- identify edge cases
- test strategies
- regression risks
- validation rules
- failure scenarios
`.trim(),
});