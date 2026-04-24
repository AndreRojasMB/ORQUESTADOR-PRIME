// src/trajectory/trajectoryContext.ts
// Builds trajectory-based learning context for prompt injection.
// Phase 28A — read-only, analogous to memoryContext.ts.

import { retrieveRelevantTrajectories } from "./trajectoryRetriever.js";
import type { ScoredTrajectory } from "./trajectoryRetriever.js";
import type { OrchestratorMode } from "../types.js";

// ─── Types ──────────────────────────────────────────────────────

export interface LearningSignals {
  totalRelevantRuns: number;
  successRate: number;
  commonAgents: string[];
  commonErrors: string[];
  avgDurationMs: number;
}

export interface TrajectoryContext {
  hasContext: boolean;
  relevantRuns: ScoredTrajectory[];
  learningSignals: LearningSignals;
  contextString: string;
}

// ─── Context budget ─────────────────────────────────────────────

const MAX_CONTEXT_CHARS = 2000;

// ─── Learning signals extraction ────────────────────────────────

function extractLearningSignals(runs: ScoredTrajectory[]): LearningSignals {
  if (runs.length === 0) {
    return {
      totalRelevantRuns: 0,
      successRate: 0,
      commonAgents: [],
      commonErrors: [],
      avgDurationMs: 0,
    };
  }

  const trajectories = runs.map((r) => r.trajectory);

  const successCount = trajectories.filter((t) => t.result.parseSuccess).length;
  const successRate = successCount / trajectories.length;

  // Count agent frequency
  const agentCounts = new Map<string, number>();
  for (const t of trajectories) {
    for (const agent of t.agentsUsed) {
      agentCounts.set(agent, (agentCounts.get(agent) ?? 0) + 1);
    }
  }
  const commonAgents = [...agentCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  // Collect unique error messages
  const errorSet = new Set<string>();
  for (const t of trajectories) {
    for (const err of t.errors) {
      errorSet.add(err.message.slice(0, 100));
    }
  }
  const commonErrors = [...errorSet].slice(0, 3);

  const totalDuration = trajectories.reduce((sum, t) => sum + t.durationMs, 0);
  const avgDurationMs = Math.round(totalDuration / trajectories.length);

  return {
    totalRelevantRuns: runs.length,
    successRate,
    commonAgents,
    commonErrors,
    avgDurationMs,
  };
}

// ─── Formatting ─────────────────────────────────────────────────

function formatScoredTrajectory(scored: ScoredTrajectory): string {
  const t = scored.trajectory;
  const status = t.result.parseSuccess ? "SUCCESS" : "FAILED";
  const lines = [
    `- [${status}] "${t.intent.task}" (${t.intent.mode})`,
    `  Agents  : ${t.agentsUsed.join(", ")}`,
    `  Duration: ${t.durationMs}ms`,
  ];

  if (t.errors.length > 0) {
    lines.push(`  Errors  : ${t.errors.map((e) => e.message).join("; ").slice(0, 120)}`);
  }

  if (t.judgeScore !== null) {
    lines.push(`  Quality : ${t.judgeScore}/10`);
  }

  return lines.join("\n");
}

function buildLearningBlock(signals: LearningSignals): string {
  if (signals.totalRelevantRuns === 0) return "";

  const parts: string[] = [];

  const pct = Math.round(signals.successRate * 100);
  parts.push(`Past runs suggest: ${pct}% success rate across ${signals.totalRelevantRuns} similar run(s).`);

  if (signals.commonAgents.length > 0) {
    parts.push(`Commonly effective agents: ${signals.commonAgents.join(", ")}.`);
  }

  if (signals.commonErrors.length > 0) {
    parts.push(`Recurring issues to watch for: ${signals.commonErrors.join("; ")}.`);
  }

  parts.push(`Average duration: ${signals.avgDurationMs}ms.`);

  return parts.join("\n");
}

function buildContextString(
  runs: ScoredTrajectory[],
  signals: LearningSignals,
): string {
  const parts: string[] = ["── Prior Run Context (trajectory learning) ──"];

  for (const run of runs) {
    parts.push(formatScoredTrajectory(run));
  }

  const learningBlock = buildLearningBlock(signals);
  if (learningBlock) {
    parts.push("");
    parts.push(learningBlock);
  }

  parts.push("── End Prior Run Context ──");

  let result = parts.join("\n");

  // Enforce context budget
  if (result.length > MAX_CONTEXT_CHARS) {
    result = result.slice(0, MAX_CONTEXT_CHARS - 15) + "\n[...truncated]";
  }

  return result;
}

// ─── Main builder ───────────────────────────────────────────────

/**
 * Builds trajectory-based learning context for prompt injection.
 * Non-fatal — returns empty context on any error.
 */
export async function buildTrajectoryContext(
  task: string,
  mode: OrchestratorMode,
  selectedAgents?: string[],
): Promise<TrajectoryContext> {
  try {
    const relevantRuns = await retrieveRelevantTrajectories({
      task,
      mode,
      ...(selectedAgents ? { selectedAgents } : {}),
    });

    if (relevantRuns.length === 0) {
      return {
        hasContext: false,
        relevantRuns: [],
        learningSignals: extractLearningSignals([]),
        contextString: "",
      };
    }

    const learningSignals = extractLearningSignals(relevantRuns);
    const contextString = buildContextString(relevantRuns, learningSignals);

    return {
      hasContext: true,
      relevantRuns,
      learningSignals,
      contextString,
    };
  } catch {
    return {
      hasContext: false,
      relevantRuns: [],
      learningSignals: extractLearningSignals([]),
      contextString: "",
    };
  }
}
