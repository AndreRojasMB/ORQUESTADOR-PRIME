import type {
  AgentReview,
  AgentReviewDecision,
  AgentRiskLevel,
  ConsensusDecision,
  MultiAgentReviewerKind,
} from "./types.js";

const RISK_ORDER: Record<AgentRiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

function highestRisk(reviews: AgentReview[]): AgentRiskLevel {
  return reviews.reduce<AgentRiskLevel>(
    (highest, review) =>
      RISK_ORDER[review.riskLevel] > RISK_ORDER[highest]
        ? review.riskLevel
        : highest,
    "low",
  );
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))].sort();
}

function reviewerVotes(
  reviews: AgentReview[],
): Record<MultiAgentReviewerKind, AgentReviewDecision> {
  return {
    critic: reviews.find((review) => review.reviewer === "critic")?.decision ?? "pass",
    security: reviews.find((review) => review.reviewer === "security")?.decision ?? "pass",
    qa: reviews.find((review) => review.reviewer === "qa")?.decision ?? "pass",
  };
}

function hasReason(reviews: AgentReview[], reasonCode: string): boolean {
  return reviews.some((review) =>
    review.findings.some((finding) => finding.reasonCode === reasonCode),
  );
}

export function buildConsensusDecision(reviews: AgentReview[]): ConsensusDecision {
  const votes = reviewerVotes(reviews);
  const reasonCodes = uniqueSorted(
    reviews.flatMap((review) => review.findings.map((finding) => finding.reasonCode)),
  );
  const requiredFollowups = uniqueSorted(
    reviews.flatMap((review) => review.requiredFollowups),
  );
  const highestRiskLevel = highestRisk(reviews);

  let decision: AgentReviewDecision = "pass";

  if (
    votes.security === "block" ||
    hasReason(reviews, "forbidden-action") ||
    hasReason(reviews, "secret-or-identity-risk")
  ) {
    decision = "block";
  } else if (
    hasReason(reviews, "missing-verification") &&
    (highestRiskLevel === "high" || highestRiskLevel === "critical")
  ) {
    decision = "needs-review";
  } else if (Object.values(votes).includes("needs-review")) {
    decision = "needs-review";
  } else if (Object.values(votes).includes("warn")) {
    decision = "warn";
  }

  const safeSummary =
    decision === "pass"
      ? "All deterministic reviewers passed without blockers."
      : `Deterministic reviewers returned ${decision}; review followups before relying on this advice.`;

  return {
    decision,
    reasonCodes,
    reviewerVotes: votes,
    highestRiskLevel,
    requiredFollowups,
    safeSummary,
    advisoryOnly: true,
  };
}
