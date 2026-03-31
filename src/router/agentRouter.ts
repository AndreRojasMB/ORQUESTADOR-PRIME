// src/router/agentRouter.ts
// Keyword-based agent pre-selector.
// Analiza el texto de una tarea y devuelve los agentes más relevantes
// antes de que el LLM intervenga.
//
// V2 extension: reemplazar extractKeywords() con un LLM call liviano
// cuando el memory layer llegue — la interfaz RouterResult no cambia.

import { selectByTags, selectByTier } from "../agents/selector.js";
import { agentRegistry }              from "../agents/registry.js";
import type { AgentName }             from "../agents/registry.js";
import type { AgentEntry }            from "../types.js";
import type { RouterResult }          from "../types.js";

import type { BlueprintContext, ProjectType } from "../types.js";

const registry = agentRegistry as Record<AgentName, AgentEntry>;

// Mapa de palabras clave → tags del registry.
// Cuando el texto de la tarea contiene una keyword, se activan sus tags.
// V2 extension: cargar este mapa desde un archivo de config externo.
const KEYWORD_TAG_MAP: Record<string, string[]> = {
  // Architecture
  architecture:  ["system-design", "planning"],
  refactor:      ["system-design", "refactor"],
  structure:     ["system-design", "boundaries"],

  // Frontend
  frontend:      ["react", "components"],
  component:     ["react", "components"],
  ui:            ["react", "accessibility"],
  react:         ["react", "routing"],
  routing:       ["routing"],
  state:         ["state"],

  // Backend
  backend:       ["api", "services"],
  api:           ["api", "contracts"],
  service:       ["services", "business-logic"],
  auth:          ["auth", "rbac"],
  validation:    ["validation"],

  // Data
  database:      ["postgresql", "schema"],
  migration:     ["migrations", "schema"],
  schema:        ["schema", "indexing"],
  cache:         ["caching", "redis"],
  redis:         ["redis", "caching"],
  nosql:         ["nosql", "distributed"],

  // Security
  security:      ["auth", "owasp", "attack-surface"],
  owasp:         ["owasp", "secrets"],
  secrets:       ["secrets", "headers"],

  // DevOps
  devops:        ["ci-cd", "deployment"],
  docker:        ["docker", "deployment"],
  deploy:        ["deployment", "scaling"],
  pipeline:      ["ci-cd"],

  // Integration
  integration:   ["webhooks", "adapters", "third-party"],
  webhook:       ["webhooks", "retries"],
  oauth:         ["oauth", "sdk"],
  sdk:           ["sdk", "adapters"],

  // Design
  design:        ["ux", "flows", "design-system"],
  ux:            ["ux", "accessibility"],
  animation:     ["gsap", "animations", "scroll"],
  motion:        ["animations", "micro-interactions"],
  scroll:        ["scroll", "transitions"],

  // AI/ML
  ai:            ["llm", "embeddings"],
  llm:           ["llm", "prompts"],
  rag:           ["rag", "embeddings"],
  embedding:     ["embeddings", "rag"],
  ml:            ["llm", "evaluation"],

  // QA
  test:          ["testing", "edge-cases"],
  qa:            ["testing", "regression"],
  edge:          ["edge-cases", "validation"],
};

// Extrae keywords reconocidas del texto de la tarea.
function extractKeywords(task: string): string[] {
  const normalized = task.toLowerCase();
  return Object.keys(KEYWORD_TAG_MAP).filter((kw) =>
    normalized.includes(kw)
  );
}

// Construye un score por agente basado en cuántos tags coinciden.
function scoreAgents(matchedTags: string[]): Array<{ name: AgentName; score: number }> {
  return (Object.entries(registry) as Array<[AgentName, AgentEntry]>)
    .map(([name, entry]) => {
      const score = entry.meta.tags.filter((tag) =>
        matchedTags.includes(tag)
      ).length;
      return { name, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
}

// Función principal del router.
// forceCore: siempre incluye agentes tier "core" (architect, frontend, backend, qa)
export function routeTask(task: string, forceCore = true): RouterResult {
  const matchedKeywords = extractKeywords(task);

  // Recopilar tags activados por las keywords encontradas
  const activatedTags = matchedKeywords.flatMap(
    (kw) => KEYWORD_TAG_MAP[kw] ?? []
  );

  // Agentes con score > 0 ordenados por relevancia
  const scored = scoreAgents(activatedTags);
  const scoredNames = scored.map(({ name }) => name);

  // Core agents siempre presentes si forceCore
  const coreAgents = forceCore ? selectByTier("core") : [];

  // Merge: core primero, luego scored sin duplicados
  const merged = [
    ...coreAgents,
    ...scoredNames.filter((name) => !coreAgents.includes(name)),
  ];

  // Si no hubo matches y no hay core, devolver todos los core como fallback
  const selectedAgents = merged.length > 0 ? merged : selectByTier("core");

  const summary = buildSummary(selectedAgents, matchedKeywords);

  return {
    selectedAgents,
    matchedKeywords,
    summary,
  };
}

function buildSummary(agents: string[], keywords: string[]): string {
  const agentLines = agents.map((name) => {
    const entry = registry[name as AgentName];
    if (!entry) return `- ${name}`;
    return `- ${name} [${entry.meta.tier}] (${entry.meta.domain}): ${entry.meta.description}`;
  });

  return [
    `Detected keywords: ${keywords.length > 0 ? keywords.join(", ") : "none — using core agents"}`,
    `Selected agents (${agents.length}):`,
    ...agentLines,
  ].join("\n");
}

// Agregar al final de src/router/agentRouter.ts

// Detecta el tipo de proyecto desde el texto de la tarea.
function detectProjectType(task: string): ProjectType {
  const t = task.toLowerCase();
  if (t.includes("erp"))                          return "erp";
  if (t.includes("ecommerce") || t.includes("shop") || t.includes("tienda")) return "ecommerce";
  if (t.includes("saas"))                         return "saas";
  if (t.includes("dashboard"))                    return "dashboard";
  if (t.includes("landing"))                      return "landing";
  if (t.includes("api") && !t.includes("frontend")) return "api";
  return "generic";
}

// Features detectadas por keywords en el texto.
const FEATURE_KEYWORDS: Record<string, string> = {
  auth:        "authentication",
  login:       "authentication",
  payment:     "payments",
  pago:        "payments",
  stripe:      "payments",
  upload:      "file-uploads",
  notification: "notifications",
  email:       "email",
  search:      "search",
  analytics:   "analytics",
  admin:       "admin-panel",
  role:        "rbac",
  realtime:    "real-time",
  websocket:   "real-time",
  chat:        "real-time",
  i18n:        "internationalization",
  dark:        "theming",
};

function detectFeatures(task: string): string[] {
  const t = task.toLowerCase();
  return [...new Set(
    Object.entries(FEATURE_KEYWORDS)
      .filter(([kw]) => t.includes(kw))
      .map(([, feature]) => feature)
  )];
}

// Construye assignments iniciales por tier para blueprint.
function buildAgentAssignments(
  selectedAgents: string[]
): BlueprintContext["agentAssignments"] {
  return selectedAgents.map((name) => {
    const entry = registry[name as AgentName];
    return {
      agent: name,
      domain: entry?.meta.domain ?? "architecture",
      responsibility: entry?.meta.description ?? "",
    };
  });
}

// Función principal para Blueprint Mode.
// Combina routeTask + detección de proyecto + asignaciones por capa.
export function buildBlueprintContext(task: string): {
  router: RouterResult;
  context: BlueprintContext;
} {
  const router = routeTask(task, true);
  const projectType = detectProjectType(task);
  const detectedFeatures = detectFeatures(task);
  const agentAssignments = buildAgentAssignments(router.selectedAgents);

  return {
    router,
    context: {
      projectType,
      detectedFeatures,
      agentAssignments,
    },
  };
}