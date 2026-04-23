// dashboard/lib/types.ts
// Dashboard-local type definitions mirroring the orchestrator's data shapes.
// These types describe the JSON structures stored on disk — they carry no
// runtime coupling to the orchestrator and are safe to import from any
// Server Component or Server Action.

// ─── Orchestrator Modes ─────────────────────────────────────────

export type OrchestratorMode =
  | "plan"
  | "route"
  | "blueprint"
  | "audit"
  | "scaffold"
  | "memory"
  | "init"
  | "execute"
  | "chat";

// ─── Provider ───────────────────────────────────────────────────

export type ProviderName = "openai" | "anthropic" | "openclaw";

// ─── Trace (from src/observability/tracer.ts) ───────────────────

export interface PhaseTrace {
  phase: string;
  startedAt: number;
  durationMs: number;
}

export interface ProviderTrace {
  provider: ProviderName;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  durationMs: number;
}

export interface TraceRecord {
  traceId: string;
  mode: OrchestratorMode;
  task: string;
  startedAt: string;
  totalMs: number;
  phases: PhaseTrace[];
  provider?: ProviderTrace;
  parseSuccess: boolean;
  parseError?: string;
  selectedAgents: string[];
  matchedKeywords: string[];
}

// ─── Memory (from src/types.ts) ─────────────────────────────────

export type MemoryEntryType =
  | "plan"
  | "route"
  | "blueprint"
  | "audit"
  | "scaffold";

export interface MemoryEntry {
  id: string;
  type: MemoryEntryType;
  task: string;
  timestamp: string;
  projectType?: string;
  agents: string[];
  keywords: string[];
  summary?: string;
  outputDir?: string;
  traceId: string;
  trace?: TraceRecord;
}

export interface MemoryStore {
  version: string;
  entries: MemoryEntry[];
  lastRun?: string;
}

// ─── User Config (from src/config/userConfig.ts) ────────────────

export interface RoutingRule {
  keywords: string[];
  agents: string[];
}

export interface WhatsAppConfig {
  enabled: boolean;
  allowedPhones: string[];
  maxMessagesPerHour: number;
  safeModes: OrchestratorMode[];
  n8nWebhookPath: string;
  hookToken: string;
  replyVia: "n8n" | "direct";
}

export interface UserConfig {
  version: string;
  agents: {
    disabled: string[];
  };
  routing: {
    rules: RoutingRule[];
  };
  providers: Partial<Record<string, ProviderName>>;
  n8n: {
    triggers: Record<string, string>;
  };
  allowedDomains: string[];
  whatsapp: WhatsAppConfig;
}

// ─── Agent Metadata (from src/agents/registry.ts) ───────────────

export type AgentTier = "core" | "specialized" | "advanced" | "design";

export type AgentDomain =
  | "architecture"
  | "frontend"
  | "backend"
  | "quality"
  | "data"
  | "security"
  | "infrastructure"
  | "integration"
  | "design"
  | "ai";

export interface AgentMeta {
  domain: AgentDomain;
  tier: AgentTier;
  tags: string[];
  description: string;
}

// ─── Defaults ───────────────────────────────────────────────────

export const EMPTY_MEMORY_STORE: MemoryStore = {
  version: "1.0",
  entries: [],
};

export const DEFAULT_USER_CONFIG: UserConfig = {
  version: "1.0",
  agents: { disabled: [] },
  routing: { rules: [] },
  providers: {},
  n8n: { triggers: {} },
  allowedDomains: ["api.openai.com", "api.anthropic.com"],
  whatsapp: {
    enabled: false,
    allowedPhones: [],
    maxMessagesPerHour: 20,
    safeModes: ["plan", "route", "blueprint", "audit", "memory"],
    n8nWebhookPath: "orquestador-whatsapp",
    hookToken: "",
    replyVia: "n8n",
  },
};
