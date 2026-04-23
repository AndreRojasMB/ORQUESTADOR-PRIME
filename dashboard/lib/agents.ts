// TEMPORARY SNAPSHOT — source of truth is src/agents/registry.ts
// TODO: Replace with direct import when bundler supports it (Phase 25+)
//
// Direct import is not possible because registry.ts imports all 13 agent
// constructors from @openai/agents, which requires OPENAI_API_KEY at
// module init time and is incompatible with the Next.js bundler.
// This file contains ONLY the metadata (no agent instances).

import type { AgentMeta } from "./types";

export const agentRegistry: Record<string, AgentMeta> = {
  architect: {
    domain: "architecture",
    tier: "core",
    tags: ["system-design", "refactor", "boundaries", "planning"],
    description: "Defines system structure, modules, and implementation order.",
  },

  frontend: {
    domain: "frontend",
    tier: "core",
    tags: ["react", "components", "routing", "state", "accessibility"],
    description: "React architecture, component structure, and UI behavior.",
  },

  backend: {
    domain: "backend",
    tier: "core",
    tags: ["api", "services", "auth", "validation", "business-logic"],
    description: "APIs, services, authentication, and backend architecture.",
  },

  qa: {
    domain: "quality",
    tier: "core",
    tags: ["testing", "edge-cases", "regression", "validation", "reliability"],
    description: "Test strategies, edge cases, and regression risk analysis.",
  },

  relationalDb: {
    domain: "data",
    tier: "specialized",
    tags: ["postgresql", "schema", "migrations", "indexing", "sql"],
    description: "Relational DB schema design, migrations, and query optimization.",
  },

  nosql: {
    domain: "data",
    tier: "specialized",
    tags: ["redis", "caching", "event-store", "distributed", "nosql"],
    description: "NoSQL systems, caching strategies, and distributed data models.",
  },

  security: {
    domain: "security",
    tier: "specialized",
    tags: ["auth", "rbac", "owasp", "attack-surface", "secrets", "headers"],
    description: "Authentication, authorization, and attack surface analysis.",
  },

  devops: {
    domain: "infrastructure",
    tier: "specialized",
    tags: ["ci-cd", "docker", "deployment", "observability", "scaling"],
    description: "CI/CD pipelines, containerization, and deployment architecture.",
  },

  apiDesigner: {
    domain: "backend",
    tier: "specialized",
    tags: ["rest", "openapi", "contracts", "versioning", "graphql", "pagination"],
    description: "API contract design, versioning strategy, and REST conventions.",
  },

  integration: {
    domain: "integration",
    tier: "specialized",
    tags: ["webhooks", "oauth", "adapters", "sdk", "third-party", "retries"],
    description: "Third-party integrations, adapters, and interop boundaries.",
  },

  uxui: {
    domain: "design",
    tier: "design",
    tags: ["ux", "flows", "accessibility", "design-system", "mobile-first"],
    description: "User flows, design system consistency, and interaction states.",
  },

  motionFx: {
    domain: "design",
    tier: "design",
    tags: ["gsap", "animations", "scroll", "micro-interactions", "transitions"],
    description: "Motion systems, scroll effects, and visual FX architecture.",
  },

  aiml: {
    domain: "ai",
    tier: "advanced",
    tags: ["llm", "rag", "embeddings", "prompts", "evaluation", "observability"],
    description: "LLM integration, RAG pipelines, and AI operational concerns.",
  },
};
