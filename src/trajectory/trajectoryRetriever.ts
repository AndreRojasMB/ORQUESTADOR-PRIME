// src/trajectory/trajectoryRetriever.ts
// Retrieves and ranks trajectories relevant to a given task.
// Phase 28A — read-only, no trajectory modification.

import { readTrajectoryStore } from "./trajectoryStore.js";
import type { Trajectory, OrchestratorMode } from "../types.js";
import { classifyForDistillation, type DistillationTier } from "./distillationClassifier.js";

// ─── Types ──────────────────────────────────────────────────────

export interface ScoredTrajectory {
  trajectory: Trajectory;
  score: number;
  matchedKeywords: string[];
  tier?: DistillationTier;
  tierReason?: string;
}

export interface RetrievalQuery {
  task: string;
  mode: OrchestratorMode;
  selectedAgents?: string[];
  /** Include weak-tier trajectories as backfill when trusted/usable are scarce. Default: true. */
  includeWeak?: boolean;
  /** Include unusable-tier trajectories (diagnostic mode). Default: false. */
  includeUnusable?: boolean;
  /** Cap on results. Default: MAX_RESULTS (3). */
  maxResults?: number;
}

// ─── Keyword extraction ─────────────────────────────────────────

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "that", "this", "was", "are",
  "has", "have", "will", "can", "not", "but", "all", "its", "into",
  "using", "use", "como", "para", "con", "una", "del", "los", "las",
  "que", "por",
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

// ─── Scoring ────────────────────────────────────────────────────

function scoreTrajectory(
  trajectory: Trajectory,
  query: RetrievalQuery,
  taskKeywords: string[],
): ScoredTrajectory {
  let score = 0;
  const matchedKeywords: string[] = [];

  // Keyword matches against trajectory task text
  const trajWords = new Set(extractKeywords(trajectory.intent.task));
  for (const kw of taskKeywords) {
    if (trajWords.has(kw)) {
      score += 2;
      matchedKeywords.push(kw);
    }
  }

  // Mode match
  if (trajectory.intent.mode === query.mode) {
    score += 3;
  }

  // Agent overlap
  if (query.selectedAgents && query.selectedAgents.length > 0) {
    const trajAgents = new Set(trajectory.agentsUsed);
    for (const agent of query.selectedAgents) {
      if (trajAgents.has(agent)) {
        score += 1;
      }
    }
  }

  // Quality signals — success boosts
  if (trajectory.result.parseSuccess) {
    score += 2;
  }

  // Quality signals — failure penalties (strengthened per adjustment 2)
  if (!trajectory.result.parseSuccess) {
    score -= 4;
  }
  if (trajectory.errors.length > 0) {
    score -= 3;
  }

  // Judge score — only penalize low scores, do not reward null
  if (trajectory.judgeScore !== null) {
    if (trajectory.judgeScore >= 7) {
      score += 3;
    } else if (trajectory.judgeScore < 4) {
      score -= 3;
    }
  }
  // judgeScore === null → no effect (not a positive signal)

  // Distillation tier — additive boost (Phase 30B).
  // Kept small enough that relevance (keyword×2 + mode=3) still dominates.
  const distillation = classifyForDistillation(trajectory);
  const tier = distillation.tier;
  if (tier === "trusted") {
    score += 4;
  } else if (tier === "usable") {
    score += 2;
  }
  // weak → no boost (neutral); unusable → filtered upstream

  const tierReason = distillation.reasons[0];
  return {
    trajectory,
    score,
    matchedKeywords,
    tier,
    ...(tierReason ? { tierReason } : {}),
  };
}

// ─── Retrieval ──────────────────────────────────────────────────

const MAX_RESULTS = 3;
const MIN_SCORE = 2;

/**
 * Retrieves trajectories relevant to the given query.
 * Returns up to MAX_RESULTS scored trajectories with score >= MIN_SCORE,
 * sorted by score descending.
 * Non-fatal — returns empty array on any error.
 */
export async function retrieveRelevantTrajectories(
  query: RetrievalQuery,
): Promise<ScoredTrajectory[]> {
  try {
    const store = await readTrajectoryStore();
    if (store.trajectories.length === 0) {
      return [];
    }

    const taskKeywords = extractKeywords(query.task);
    if (taskKeywords.length === 0) {
      return [];
    }

    const includeWeak = query.includeWeak !== false;
    const includeUnusable = query.includeUnusable === true;
    const cap = query.maxResults ?? MAX_RESULTS;

    const scored = store.trajectories
      .map((t) => scoreTrajectory(t, query, taskKeywords))
      .filter((s) => s.score >= MIN_SCORE)
      .filter((s) => includeUnusable || s.tier !== "unusable")
      .sort((a, b) => b.score - a.score);

    // Phase A: trusted + usable.
    const primary = scored.filter(
      (s) => s.tier === "trusted" || s.tier === "usable",
    );

    if (primary.length >= cap) {
      return primary.slice(0, cap);
    }

    // Phase B: backfill with weak (and optionally unusable) until cap.
    const backfill = scored.filter(
      (s) =>
        s.tier === "weak" ||
        (includeUnusable && s.tier === "unusable") ||
        s.tier === undefined,
    );

    const combined = includeWeak || includeUnusable
      ? [...primary, ...backfill]
      : primary;

    return combined.slice(0, cap);
  } catch {
    return [];
  }
}
