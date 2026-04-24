// src/types.ts

import type { StructuredOutput } from "./output/schemas.js";
import type { TraceRecord } from "./observability/tracer.js";
import type { ProviderName } from "./providers/types.js";

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

export type FutureMode = OrchestratorMode;

export interface ParsedArgs {
  task: string;
  mode: OrchestratorMode;
}

export interface OrchestratorResult {
  mode: OrchestratorMode;
  task: string;
  finalOutput: string;
  structured?: StructuredOutput;
  parseError?: string;
  trace: TraceRecord; // ← siempre presente
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
  domain: AgentDomain;
  tier: AgentTier;
  tags: string[];
  description: string;
}

export interface AgentEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agent: any;
  meta: AgentMetadata;
}

// ─── Router ───────────────────────────────────────────────────────

export interface RouterResult {
  selectedAgents: string[];
  matchedKeywords: string[];
  summary: string;
}

// ─── Blueprint ────────────────────────────────────────────────────

export type ProjectType =
  | "saas"
  | "api"
  | "ecommerce"
  | "dashboard"
  | "landing"
  | "erp"
  | "mobile"
  | "monorepo"
  | "generic";

export interface BlueprintContext {
  projectType: ProjectType;
  detectedFeatures: string[];
  agentAssignments: BlueprintAgentAssignment[];
}

export interface BlueprintAgentAssignment {
  agent: string;
  domain: AgentDomain;
  responsibility: string;
}

export type { ProviderName };

// ─── Execution Layer ──────────────────────────────────────────────

export type ExecutionStatus =
  | "pending"
  | "branch_created"
  | "files_written"
  | "pr_opened"
  | "approved"
  | "rejected";

export interface ExecutionProposal {
  branchName: string;
  title: string;
  description: string;
  files: ExecutionFile[];
  risks: string[];
  rollbackPlan: string;
}

export interface ExecutionFile {
  path: string;
  operation: "create" | "modify" | "delete";
  content?: string;
  reason: string;
}

export interface ExecutionResult {
  status: ExecutionStatus;
  branchName: string;
  prUrl?: string;
  prNumber?: number;
  filesWritten: string[];
  approved: boolean;
  message: string;
}

// ─── Memory Layer ─────────────────────────────────────────────────

export type MemoryEntryType =
  | "plan"
  | "route"
  | "blueprint"
  | "audit"
  | "scaffold";

export interface MemoryEntry {
  id: string; // único por entrada
  type: MemoryEntryType;
  task: string;
  timestamp: string; // ISO
  projectType?: string; // detectado por blueprint/scaffold
  agents: string[]; // agentes seleccionados
  keywords: string[]; // keywords del router
  summary?: string; // resumen del output si existe
  outputDir?: string; // para scaffold — dónde se generó
  traceId: string | null; // link al TraceRecord — null for external ingestion
  trace?: import("./observability/tracer.js").TraceRecord | undefined;
  source?: TrajectorySource; // channel that produced this entry
}

export interface MemoryStore {
  version: string;
  entries: MemoryEntry[];
  lastRun?: string; // ISO timestamp del último run
}

// ─── Trajectory Layer ────────────────────────────────────────────

export type TrajectorySource = "cli" | "whatsapp" | "omi" | "dashboard" | null;
export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "auto"
  | null;
export type OutcomeStatus =
  | "completed"
  | "partial"
  | "merged"
  | "reverted"
  | "ci_failed"
  | "rejected"
  | null;

export interface TrajectoryProviderCall {
  provider: ProviderName;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  durationMs: number;
}

export interface TrajectoryError {
  phase: string;
  message: string;
  timestamp: string;
}

export interface Trajectory {
  id: string;
  createdAt: string;
  traceId: string;
  memoryEntryId: string | null;
  source: TrajectorySource;
  userMessage: string;
  intent: { mode: OrchestratorMode; task: string };
  agentsUsed: string[];
  providerCalls: TrajectoryProviderCall[];
  toolCalls: string[];
  errors: TrajectoryError[];
  durationMs: number;
  result: {
    parseSuccess: boolean;
    structured: unknown | null;
    rawLength: number;
  };
  approvalStatus: ApprovalStatus;
  outcome: OutcomeStatus;
  judgeScore: number | null;
}

export interface TrajectoryStore {
  version: string;
  trajectories: Trajectory[];
}