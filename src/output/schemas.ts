// src/output/schemas.ts
// Zod schemas para validar el output estructurado del LLM por modo.
// El LLM debe responder en JSON siguiendo estos contratos.
// V2 extension: agregar schemas para futuros modos (audit, scaffold, memory).

import { z } from "zod";

// ─── Helpers ─────────────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRouteOutput(input: unknown): unknown {
  if (!isRecord(input)) return input;

  const bestSpecialist =
    typeof input.bestSpecialist === "string"
      ? input.bestSpecialist
      : Array.isArray(input.best_specialists) && input.best_specialists.length > 0
      ? String(input.best_specialists[0])
      : typeof input.best_specialist === "string"
      ? input.best_specialist
      : "";

  const reasoning =
    typeof input.reasoning === "string"
      ? input.reasoning
      : Array.isArray(input.why)
      ? input.why.map(String).join(" ")
      : typeof input.why === "string"
      ? input.why
      : "";

  const architecturePlan =
    typeof input.architecturePlan === "string"
      ? input.architecturePlan
      : typeof input.architecture_plan === "string"
      ? input.architecture_plan
      : isRecord(input.architecture_plan)
      ? Object.entries(input.architecture_plan)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join(" | ")
      : isRecord(input.architecturePlan)
      ? Object.entries(input.architecturePlan)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join(" | ")
      : "";

  let responsibilities: string[] = [];
  if (Array.isArray(input.responsibilities)) {
    responsibilities = input.responsibilities.map(String);
  } else if (isRecord(input.responsibilities)) {
    responsibilities = Object.entries(input.responsibilities).map(
      ([agent, responsibility]) => `${agent}: ${String(responsibility)}`
    );
  }

  const executionOrder = Array.isArray(input.executionOrder)
    ? input.executionOrder.map(String)
    : Array.isArray(input.execution_order)
    ? input.execution_order.map(String)
    : [];

  const risks = Array.isArray(input.risks)
    ? input.risks.map((risk) => {
        if (typeof risk === "string") {
          return {
            description: risk,
            mitigation: "Review and mitigate during implementation.",
          };
        }
        return risk;
      })
    : [];

  const validations = Array.isArray(input.validations)
    ? input.validations.map((validation) => {
        if (typeof validation === "string") {
          return {
            layer: "general",
            checks: [validation],
          };
        }
        return validation;
      })
    : [];

  return {
    ...input,
    mode: input.mode ?? "route",
    bestSpecialist,
    reasoning,
    architecturePlan,
    responsibilities,
    executionOrder,
    risks,
    validations,
  };
}

// ─── Bloques compartidos ─────────────────────────────────────────

const RiskSchema = z.object({
  description: z.string(),
  mitigation: z.string(),
});

const AgentAssignmentSchema = z.object({
  agent: z.string(),
  responsibility: z.string(),
  deliverables: z.array(z.string()),
});

const ValidationStepSchema = z.object({
  layer: z.string(),
  checks: z.array(z.string()),
});

// ─── Plan Mode ───────────────────────────────────────────────────

export const PlanOutputSchema = z.object({
  mode: z.literal("plan"),
  architectureOverview: z.string(),
  agentAssignments: z.array(AgentAssignmentSchema),
  implementationOrder: z.array(z.string()),
  technicalRisks: z.array(RiskSchema),
  validationStrategy: z.array(ValidationStepSchema),
});

export type PlanOutput = z.infer<typeof PlanOutputSchema>;

// ─── Route Mode ──────────────────────────────────────────────────

const RouteBaseSchema = z.object({
  mode: z.literal("route"),
  bestSpecialist: z.string(),
  reasoning: z.string(),
  architecturePlan: z.string(),
  responsibilities: z.array(z.string()),
  executionOrder: z.array(z.string()),
  risks: z.array(RiskSchema),
  validations: z.array(ValidationStepSchema),
});

export const RouteOutputSchema = z.preprocess(
  normalizeRouteOutput,
  RouteBaseSchema
);

export type RouteOutput = z.infer<typeof RouteOutputSchema>;

// ─── Blueprint Mode ──────────────────────────────────────────────

const BlueprintPhaseSchema = z.object({
  phase: z.string(),
  description: z.string(),
  tasks: z.array(z.string()),
});

const ArchitectureLayerSchema = z.object({
  layer: z.string(),
  stack: z.array(z.string()),
  description: z.string(),
});

export const BlueprintOutputSchema = z.object({
  mode: z.literal("blueprint"),
  projectOverview: z.object({
    type: z.string(),
    scope: z.string(),
    constraints: z.array(z.string()),
  }),
  architectureLayers: z.array(ArchitectureLayerSchema),
  agentAssignments: z.array(AgentAssignmentSchema),
  implementationRoadmap: z.array(BlueprintPhaseSchema),
  technicalRisks: z.array(RiskSchema),
  validationStrategy: z.array(ValidationStepSchema),
});

export type BlueprintOutput = z.infer<typeof BlueprintOutputSchema>;

// ─── Audit Mode ──────────────────────────────────────────────────

const FindingSchema = z.object({
  severity: z.enum(["critical", "high", "medium", "low"]),
  category: z.string(),
  agent: z.string(),
  title: z.string(),
  description: z.string(),
  recommendation: z.string(),
  affectedFiles: z.array(z.string()),
});

const PrioritizedActionSchema = z.object({
  priority: z.number(),
  action: z.string(),
  effort: z.enum(["low", "medium", "high"]),
  impact: z.enum(["low", "medium", "high"]),
});

export const AuditOutputSchema = z.object({
  mode: z.literal("audit"),
  repositorySummary: z.object({
    projectType: z.string(),
    techStack: z.array(z.string()),
    estimatedMaturity: z.enum(["early", "growing", "mature"]),
  }),
  findings: z.array(FindingSchema),
  strengths: z.array(z.string()),
  prioritizedActions: z.array(PrioritizedActionSchema),
  technicalDebt: z.object({
    score: z.number().min(1).max(10),
    summary: z.string(),
    mainContributors: z.array(z.string()),
  }),
});

export type AuditOutput = z.infer<typeof AuditOutputSchema>;

// ─── Scaffold Mode ───────────────────────────────────────────────

const ScaffoldFileSchema = z.object({
  path: z.string(),
  description: z.string(),
  content: z.string(),
});

export const ScaffoldOutputSchema = z.object({
  mode: z.literal("scaffold"),
  projectType: z.string(),
  techStack: z.array(z.string()),
  directories: z.array(z.string()),
  files: z.array(ScaffoldFileSchema),
  setupInstructions: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

export type ScaffoldOutput = z.infer<typeof ScaffoldOutputSchema>;

// ─── Memory Mode ─────────────────────────────────────────────────

const MemoryEntrySchema = z.object({
  id: z.string(),
  type: z.string(),
  task: z.string(),
  timestamp: z.string(),
  projectType: z.string().optional(),
  agents: z.array(z.string()),
  keywords: z.array(z.string()),
  summary: z.string().optional(),
  outputDir: z.string().optional(),
  traceId: z.string(),
});

export const MemoryOutputSchema = z.object({
  mode: z.literal("memory"),
  total: z.number(),
  lastRun: z.string(),
  recent: z.array(MemoryEntrySchema),
});

export type MemoryOutput = z.infer<typeof MemoryOutputSchema>;

// ─── Union final ────────────────────────────────────────────────

export type StructuredOutput =
  | PlanOutput
  | RouteOutput
  | BlueprintOutput
  | AuditOutput
  | ScaffoldOutput
  | MemoryOutput;