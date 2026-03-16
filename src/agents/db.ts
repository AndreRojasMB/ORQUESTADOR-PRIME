import { Agent } from "@openai/agents";
import { MODELS } from "../config.js";

export const relationalDbAgent = new Agent({
  name: "Relational DB Agent",
  model: MODELS.specialist,
  instructions: `
You specialize in relational databases.

Focus on:
- PostgreSQL
- schema design
- indexing strategies
- migrations
- query optimization
`.trim(),
});

export const nosqlAgent = new Agent({
  name: "NoSQL Agent",
  model: MODELS.specialist,
  instructions: `
You specialize in NoSQL systems.

Focus on:
- Redis
- caching strategies
- event stores
- distributed data models
`.trim(),
});