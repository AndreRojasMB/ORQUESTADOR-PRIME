// src/types.ts

import type { StructuredOutput } from "./output/schemas.js";
import type { TraceRecord }      from "./observability/tracer.js";

export type OrchestratorMode = "plan" | "route" | "blueprint" | "audit" | "scaffold" | "memory";
export type FutureMode = OrchestratorMode;

export interface ParsedArgs {
  task: string;
  mode: OrchestratorMode;
}

export interface OrchestratorResult {
  mode:         OrchestratorMode;
  task:         string;
  finalOutput:  string;
  structured?:  StructuredOutput;
  parseError?:  string;
  trace:        TraceRecord;   // ← siempre presente
}

// ─── Agent Metadata ───────────────────────────────────────────────

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

export interface AgentMetadata {
  domain:      AgentDomain;
  tier:        AgentTier;
  tags:        string[];
  description: string;
}

export interface AgentEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agent: any;
  meta:  AgentMetadata;
}

// ─── Router ───────────────────────────────────────────────────────

export interface RouterResult {
  selectedAgents:  string[];
  matchedKeywords: string[];
  summary:         string;
}

// ─── Blueprint ────────────────────────────────────────────────────

export type ProjectType =
  | "saas"
  | "api"
  | "ecommerce"
  | "dashboard"
  | "landing"
  | "erp"
  | "generic";

export interface BlueprintContext {
  projectType:      ProjectType;
  detectedFeatures: string[];
  agentAssignments: BlueprintAgentAssignment[];
}

export interface BlueprintAgentAssignment {
  agent:          string;
  domain:         AgentDomain;
  responsibility: string;
}

export type { ProviderName } from "./providers/types.js";

// ─── Memory Layer ─────────────────────────────────────────────────

export type MemoryEntryType =
  | "plan"
  | "route"
  | "blueprint"
  | "audit"
  | "scaffold";

export interface MemoryEntry {
  id:          string;       // único por entrada
  type:        MemoryEntryType;
  task:        string;
  timestamp:   string;       // ISO
  projectType?: string;      // detectado por blueprint/scaffold
  agents:      string[];     // agentes seleccionados
  keywords:    string[];     // keywords del router
  summary?:    string;       // resumen del output si existe
  outputDir?:  string;       // para scaffold — dónde se generó
  traceId:     string;       // link al TraceRecord
}

export interface MemoryStore {
  version:  string;
  entries:  MemoryEntry[];
  lastRun?: string;          // ISO timestamp del último run
}