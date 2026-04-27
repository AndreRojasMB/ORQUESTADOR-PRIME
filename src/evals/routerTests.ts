import { GOLDEN_TASKS } from "./goldenTasks.js";
import type { EvalStatus, GoldenTask, RouterTestResult } from "./types.js";

const CORE_AGENTS = ["architect", "frontend", "backend", "qa"];

const AGENT_TAGS: Record<string, string[]> = {
  architect: ["system-design", "refactor", "boundaries", "planning"],
  frontend: ["react", "components", "routing", "state", "accessibility"],
  backend: ["api", "services", "auth", "validation", "business-logic"],
  qa: ["testing", "edge-cases", "regression", "validation", "reliability"],
  relationalDb: ["postgresql", "schema", "migrations", "indexing", "sql"],
  nosql: ["redis", "caching", "event-store", "distributed", "nosql"],
  security: ["auth", "rbac", "owasp", "attack-surface", "secrets", "headers"],
  devops: ["ci-cd", "docker", "deployment", "observability", "scaling"],
  apiDesigner: ["rest", "openapi", "contracts", "versioning", "graphql", "pagination"],
  integration: ["webhooks", "oauth", "adapters", "sdk", "third-party", "retries"],
  uxui: ["ux", "flows", "accessibility", "design-system", "mobile-first"],
  motionFx: ["gsap", "animations", "scroll", "micro-interactions", "transitions"],
  aiml: ["llm", "rag", "embeddings", "prompts", "evaluation", "observability"],
};

const KEYWORD_TAG_MAP: Record<string, string[]> = {
  architecture: ["system-design", "planning"],
  refactor: ["system-design", "refactor"],
  structure: ["system-design", "boundaries"],
  frontend: ["react", "components"],
  component: ["react", "components"],
  ui: ["react", "accessibility"],
  react: ["react", "routing"],
  routing: ["routing"],
  state: ["state"],
  backend: ["api", "services"],
  api: ["api", "contracts"],
  service: ["services", "business-logic"],
  auth: ["auth", "rbac"],
  validation: ["validation"],
  database: ["postgresql", "schema"],
  migration: ["migrations", "schema"],
  schema: ["schema", "indexing"],
  cache: ["caching", "redis"],
  redis: ["redis", "caching"],
  nosql: ["nosql", "distributed"],
  security: ["auth", "owasp", "attack-surface"],
  owasp: ["owasp", "secrets"],
  secrets: ["secrets", "headers"],
  devops: ["ci-cd", "deployment"],
  docker: ["docker", "deployment"],
  deploy: ["deployment", "scaling"],
  pipeline: ["ci-cd"],
  integration: ["webhooks", "adapters", "third-party"],
  webhook: ["webhooks", "retries"],
  oauth: ["oauth", "sdk"],
  sdk: ["sdk", "adapters"],
  design: ["ux", "flows", "design-system"],
  ux: ["ux", "accessibility"],
  animation: ["gsap", "animations", "scroll"],
  motion: ["animations", "micro-interactions"],
  scroll: ["scroll", "transitions"],
  ai: ["llm", "embeddings"],
  llm: ["llm", "prompts"],
  rag: ["rag", "embeddings"],
  embedding: ["embeddings", "rag"],
  ml: ["llm", "evaluation"],
  test: ["testing", "edge-cases"],
  qa: ["testing", "regression"],
  edge: ["edge-cases", "validation"],
};

const FEATURE_KEYWORDS: Record<string, string> = {
  auth: "authentication",
  login: "authentication",
  payment: "payments",
  pago: "payments",
  stripe: "payments",
  upload: "file-uploads",
  notification: "notifications",
  email: "email",
  search: "search",
  analytics: "analytics",
  admin: "admin-panel",
  role: "rbac",
  realtime: "real-time",
  websocket: "real-time",
  chat: "real-time",
  i18n: "internationalization",
  dark: "theming",
};

function missing(expected: string[], actual: string[]): string[] {
  return expected.filter((item) => !actual.includes(item));
}

function unexpected(expected: string[], actual: string[]): string[] {
  return actual.filter((item) => !expected.includes(item));
}

function statusFor(input: {
  missingAgents: string[];
  missingKeywords: string[];
  missingFeatures: string[];
  projectTypeOk: boolean;
}): EvalStatus {
  if (input.missingAgents.length > 0 || !input.projectTypeOk) return "fail";
  if (input.missingKeywords.length > 0 || input.missingFeatures.length > 0) return "warn";
  return "pass";
}

function routeOffline(task: string): {
  selectedAgents: string[];
  matchedKeywords: string[];
  detectedFeatures: string[];
  projectType: string;
} {
  const normalized = task.toLowerCase();
  const matchedKeywords = Object.keys(KEYWORD_TAG_MAP).filter((keyword) =>
    normalized.includes(keyword),
  );
  const activatedTags = matchedKeywords.flatMap((keyword) => KEYWORD_TAG_MAP[keyword] ?? []);
  const scored = Object.entries(AGENT_TAGS)
    .map(([agent, tags]) => ({
      agent,
      score: tags.filter((tag) => activatedTags.includes(tag)).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.agent);
  const selectedAgents = [
    ...CORE_AGENTS,
    ...scored.filter((agent) => !CORE_AGENTS.includes(agent)),
  ];

  return {
    selectedAgents,
    matchedKeywords,
    detectedFeatures: [
      ...new Set(
        Object.entries(FEATURE_KEYWORDS)
          .filter(([keyword]) => normalized.includes(keyword))
          .map(([, feature]) => feature),
      ),
    ],
    projectType: detectProjectType(normalized),
  };
}

function detectProjectType(normalized: string): string {
  if (normalized.includes("erp")) return "erp";
  if (normalized.includes("ecommerce") || normalized.includes("shop") || normalized.includes("tienda")) return "ecommerce";
  if (normalized.includes("saas")) return "saas";
  if (normalized.includes("dashboard")) return "dashboard";
  if (normalized.includes("landing")) return "landing";
  if (normalized.includes("mobile") || normalized.includes("react native") || normalized.includes("expo")) return "mobile";
  if (normalized.includes("monorepo") || normalized.includes("turborepo")) return "monorepo";
  if (normalized.includes("api") && !normalized.includes("frontend")) return "api";
  return "generic";
}

export function evaluateRouterTask(task: GoldenTask): RouterTestResult {
  const router = routeOffline(task.input);
  const expectedAgents = task.expectedRoute.agents;
  const expectedKeywords = task.expectedRoute.matchedKeywords ?? [];
  const expectedFeatures = task.expectedRoute.features ?? [];
  const missingAgents = missing(expectedAgents, router.selectedAgents);
  const unexpectedAgents = unexpected(expectedAgents, router.selectedAgents);
  const missingKeywords = missing(expectedKeywords, router.matchedKeywords);
  const missingFeatures = missing(expectedFeatures, router.detectedFeatures);
  const expectedProjectType = task.expectedRoute.projectType ?? null;
  const projectTypeOk = expectedProjectType === null || router.projectType === expectedProjectType;
  const reasonCodes: string[] = [];

  if (missingAgents.length > 0) reasonCodes.push("router.missing_agents");
  if (missingKeywords.length > 0) reasonCodes.push("router.missing_keywords");
  if (missingFeatures.length > 0) reasonCodes.push("router.missing_features");
  if (!projectTypeOk) reasonCodes.push("router.project_type_mismatch");
  if (task.expectedRoute.fallbackCore === true && router.matchedKeywords.length > 0) {
    reasonCodes.push("router.fallback_expected");
  }

  const status = statusFor({
    missingAgents,
    missingKeywords,
    missingFeatures,
    projectTypeOk,
  });

  return {
    id: `router.${task.id}`,
    taskId: task.id,
    title: `Router: ${task.title}`,
    status,
    reasonCodes,
    details: reasonCodes.length === 0
      ? ["Router matched expected deterministic route."]
      : [
          `Selected agents: ${router.selectedAgents.join(", ") || "none"}.`,
          `Matched keywords: ${router.matchedKeywords.join(", ") || "none"}.`,
          `Detected features: ${router.detectedFeatures.join(", ") || "none"}.`,
        ],
    selectedAgents: router.selectedAgents,
    matchedKeywords: router.matchedKeywords,
    expectedAgents,
    missingAgents,
    unexpectedAgents,
    detectedFeatures: router.detectedFeatures,
    expectedFeatures,
    projectType: router.projectType,
    expectedProjectType,
  };
}

export function runRouterTests(): RouterTestResult[] {
  return GOLDEN_TASKS.map((task) => evaluateRouterTask(task));
}
