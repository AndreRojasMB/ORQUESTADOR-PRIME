// src/agents/registry.ts
// Catálogo central de agentes con metadata consultable.
// V2 extension: agregar nuevos agentes aquí con su AgentEntry completo.
// El orchestrator y el selector consumen solo este archivo.

import type { AgentEntry } from "../types.js";

import { architectAgent }   from "./architect.js";
import { frontendAgent }    from "./frontend.js";
import { backendAgent }     from "./backend.js";
import { qaAgent }          from "./qa.js";
import { relationalDbAgent, nosqlAgent } from "./db.js";
import { securityAgent }    from "./security.js";
import { devopsAgent }      from "./devops.js";
import { apiDesignerAgent } from "./apiDesigner.js";
import { integrationAgent } from "./integration.js";
import { uxuiAgent }        from "./uxui.js";
import { motionFxAgent }    from "./motionFx.js";
import { aimlAgent }        from "./aiml.js";

export const agentRegistry = {

  architect: {
    agent: architectAgent,
    meta: {
      domain: "architecture",
      tier: "core",
      tags: ["system-design", "refactor", "boundaries", "planning"],
      description: "Defines system structure, modules, and implementation order.",
    },
  },

  frontend: {
    agent: frontendAgent,
    meta: {
      domain: "frontend",
      tier: "core",
      tags: ["react", "components", "routing", "state", "accessibility"],
      description: "React architecture, component structure, and UI behavior.",
    },
  },

  backend: {
    agent: backendAgent,
    meta: {
      domain: "backend",
      tier: "core",
      tags: ["api", "services", "auth", "validation", "business-logic"],
      description: "APIs, services, authentication, and backend architecture.",
    },
  },

  qa: {
    agent: qaAgent,
    meta: {
      domain: "quality",
      tier: "core",
      tags: ["testing", "edge-cases", "regression", "validation", "reliability"],
      description: "Test strategies, edge cases, and regression risk analysis.",
    },
  },

  relationalDb: {
    agent: relationalDbAgent,
    meta: {
      domain: "data",
      tier: "specialized",
      tags: ["postgresql", "schema", "migrations", "indexing", "sql"],
      description: "Relational DB schema design, migrations, and query optimization.",
    },
  },

  nosql: {
    agent: nosqlAgent,
    meta: {
      domain: "data",
      tier: "specialized",
      tags: ["redis", "caching", "event-store", "distributed", "nosql"],
      description: "NoSQL systems, caching strategies, and distributed data models.",
    },
  },

  security: {
    agent: securityAgent,
    meta: {
      domain: "security",
      tier: "specialized",
      tags: ["auth", "rbac", "owasp", "attack-surface", "secrets", "headers"],
      description: "Authentication, authorization, and attack surface analysis.",
    },
  },

  devops: {
    agent: devopsAgent,
    meta: {
      domain: "infrastructure",
      tier: "specialized",
      tags: ["ci-cd", "docker", "deployment", "observability", "scaling"],
      description: "CI/CD pipelines, containerization, and deployment architecture.",
    },
  },

  apiDesigner: {
    agent: apiDesignerAgent,
    meta: {
      domain: "backend",
      tier: "specialized",
      tags: ["rest", "openapi", "contracts", "versioning", "graphql", "pagination"],
      description: "API contract design, versioning strategy, and REST conventions.",
    },
  },

  integration: {
    agent: integrationAgent,
    meta: {
      domain: "integration",
      tier: "specialized",
      tags: ["webhooks", "oauth", "adapters", "sdk", "third-party", "retries"],
      description: "Third-party integrations, adapters, and interop boundaries.",
    },
  },

  uxui: {
    agent: uxuiAgent,
    meta: {
      domain: "design",
      tier: "design",
      tags: ["ux", "flows", "accessibility", "design-system", "mobile-first"],
      description: "User flows, design system consistency, and interaction states.",
    },
  },

  motionFx: {
    agent: motionFxAgent,
    meta: {
      domain: "design",
      tier: "design",
      tags: ["gsap", "animations", "scroll", "micro-interactions", "transitions"],
      description: "Motion systems, scroll effects, and visual FX architecture.",
    },
  },

  aiml: {
    agent: aimlAgent,
    meta: {
      domain: "ai",
      tier: "advanced",
      tags: ["llm", "rag", "embeddings", "prompts", "evaluation", "observability"],
      description: "LLM integration, RAG pipelines, and AI operational concerns.",
    },
  },

} as const satisfies Record<string, AgentEntry>;

export type AgentName = keyof typeof agentRegistry;

// Flat array para handoffs — el orchestrator sigue usando esto sin cambios.
export const allAgents = Object.values(agentRegistry).map((e) => e.agent);