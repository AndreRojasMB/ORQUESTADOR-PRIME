// src/trajectory/trajectoryBuilder.ts
// Builds a Trajectory record from a completed TraceRecord and execution context.
// Called by the orchestrator after each run completes.

import type { TraceRecord } from "../observability/tracer.js";
import type {
  Trajectory,
  TrajectorySource,
  TrajectoryProviderCall,
  ApprovalStatus,
  OrchestratorResult,
} from "../types.js";
import { judgeTrajectory } from "./trajectoryJudge.js";
import { resolveOutcome } from "./outcomeResolver.js";

export interface TrajectoryInput {
  trace: TraceRecord;
  result: OrchestratorResult;
  source?: TrajectorySource | undefined;
  memoryEntryId?: string | null | undefined;
  approvalStatus?: ApprovalStatus | undefined;
}

export function buildTrajectory(input: TrajectoryInput): Trajectory {
  const { trace, result, source, memoryEntryId, approvalStatus } = input;

  const providerCalls: TrajectoryProviderCall[] = [];
  if (trace.provider) {
    providerCalls.push({
      provider: trace.provider.provider,
      model: trace.provider.model,
      inputTokens: trace.provider.inputTokens ?? null,
      outputTokens: trace.provider.outputTokens ?? null,
      durationMs: trace.provider.durationMs,
    });
  }

  const trajectory: Trajectory = {
    id: generateTrajectoryId(),
    createdAt: new Date().toISOString(),
    traceId: trace.traceId,
    memoryEntryId: memoryEntryId ?? null,
    source: source ?? "cli",
    userMessage: trace.task,
    intent: { mode: trace.mode, task: trace.task },
    agentsUsed: trace.selectedAgents,
    providerCalls,
    toolCalls: [],
    errors: trace.parseError
      ? [
          {
            phase: "parse",
            message: trace.parseError,
            timestamp: new Date().toISOString(),
          },
        ]
      : [],
    durationMs: trace.totalMs,
    result: {
      parseSuccess: trace.parseSuccess,
      structured: result.structured ?? null,
      rawLength: result.finalOutput.length,
    },
    approvalStatus: approvalStatus ?? null,
    outcome: null,
    judgeScore: null,
  };

  // Derive outcome from available build-time evidence
  trajectory.outcome = resolveOutcome({
    mode: trace.mode,
    parseSuccess: trace.parseSuccess,
    errorCount: trajectory.errors.length,
    approvalStatus: trajectory.approvalStatus,
    tracePhases: trace.phases.map((p) => p.phase),
  });

  // Evaluate trajectory quality via heuristic judge
  const verdict = judgeTrajectory(trajectory);
  trajectory.judgeScore = verdict.score;

  return trajectory;
}

function generateTrajectoryId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `traj_${ts}_${rand}`;
}
