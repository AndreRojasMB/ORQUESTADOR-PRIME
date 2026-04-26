import { createHash } from "crypto";
import type {
  LearningExportRecord,
  LearningHeuristicLabel,
  PreferencePair,
} from "./types.js";
import { LEARNING_EXPORT_SCHEMA_VERSION } from "./types.js";

const MAX_PREFERENCE_PAIRS = 100;
const MIN_OVERLAP_SCORE = 0.2;

function tokenize(value: string): Set<string> {
  const tokens = value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length >= 4);
  return new Set(tokens);
}

function overlapScore(a: string, b: string): number {
  const left = tokenize(a);
  const right = tokenize(b);

  if (left.size === 0 || right.size === 0) {
    return 0;
  }

  let overlap = 0;
  for (const token of left) {
    if (right.has(token)) {
      overlap++;
    }
  }

  return Math.round((overlap / Math.min(left.size, right.size)) * 100) / 100;
}

function pairId(chosenTrajectoryId: string, rejectedTrajectoryId: string): string {
  return `pair_${createHash("sha256")
    .update(`${chosenTrajectoryId}:${rejectedTrajectoryId}`)
    .digest("hex")
    .slice(0, 16)}`;
}

function isChosenLabel(label: LearningHeuristicLabel): boolean {
  return label === "accepted" || label === "usable";
}

function isRejectedLabel(label: LearningHeuristicLabel): boolean {
  return label === "rejected" || label === "needs-review";
}

function confidence(
  chosen: LearningExportRecord,
  rejected: LearningExportRecord,
  score: number,
): PreferencePair["heuristicConfidence"] {
  if (
    chosen.heuristicLabel === "accepted" &&
    rejected.heuristicLabel === "rejected" &&
    score >= 0.5
  ) {
    return "high";
  }
  if (score >= 0.3) {
    return "medium";
  }
  return "low";
}

export function generatePreferencePairs(
  records: LearningExportRecord[],
): PreferencePair[] {
  const chosenRecords = records.filter((record) => isChosenLabel(record.heuristicLabel));
  const rejectedRecords = records.filter((record) => isRejectedLabel(record.heuristicLabel));
  const pairs: PreferencePair[] = [];

  for (const chosen of chosenRecords) {
    for (const rejected of rejectedRecords) {
      if (chosen.trajectoryId === rejected.trajectoryId) {
        continue;
      }
      if (chosen.mode !== rejected.mode) {
        continue;
      }
      if (chosen.source !== null && rejected.source !== null && chosen.source !== rejected.source) {
        continue;
      }

      const score = overlapScore(chosen.taskPreview, rejected.taskPreview);
      if (score < MIN_OVERLAP_SCORE) {
        continue;
      }

      pairs.push({
        schemaVersion: LEARNING_EXPORT_SCHEMA_VERSION,
        id: pairId(chosen.trajectoryId, rejected.trajectoryId),
        chosenTrajectoryId: chosen.trajectoryId,
        rejectedTrajectoryId: rejected.trajectoryId,
        chosenLabel: chosen.heuristicLabel,
        rejectedLabel: rejected.heuristicLabel,
        mode: chosen.mode,
        source: chosen.source,
        overlapScore: score,
        basis: [
          "same-mode",
          chosen.source === rejected.source ? "same-source" : "source-compatible",
          "task-preview-overlap",
        ],
        reasonCodes: [
          `${chosen.heuristicLabel}-preferred-over-${rejected.heuristicLabel}`,
          `overlap-${score}`,
        ],
        heuristicConfidence: confidence(chosen, rejected, score),
        requiresHumanReview: true,
      });

      if (pairs.length >= MAX_PREFERENCE_PAIRS) {
        return pairs;
      }
    }
  }

  return pairs;
}
