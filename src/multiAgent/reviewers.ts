import {
  redactString,
  type RedactionMetadata,
} from "../privacy/redactionEngine.js";
import type {
  AgentFinding,
  AgentReview,
  AgentReviewDecision,
  AgentRiskLevel,
  MultiAgentReviewerKind,
  MultiAgentReviewMode,
} from "./types.js";

interface ReviewerInput {
  request: string;
  artifactSummary: string | null;
  reviewMode: MultiAgentReviewMode;
  createdAt: string;
}

interface FindingSeed {
  title: string;
  summary: string;
  severity: AgentRiskLevel;
  reasonCode: string;
  evidence: string[];
}

const RISK_ORDER: Record<AgentRiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const TEXT_LIMIT = 180;

function combinedText(input: ReviewerInput): string {
  return `${input.request}\n${input.artifactSummary ?? ""}`.toLowerCase();
}

function safeEvidence(value: string): string {
  return redactString(value, { maxLength: TEXT_LIMIT }).safePreview;
}

function makeFinding(
  reviewer: MultiAgentReviewerKind,
  index: number,
  seed: FindingSeed,
): AgentFinding {
  return {
    id: `${reviewer}_${index + 1}`,
    reviewer,
    title: seed.title,
    summary: seed.summary,
    severity: seed.severity,
    reasonCode: seed.reasonCode,
    evidence: seed.evidence.map(safeEvidence),
    advisoryOnly: true,
  };
}

function highestRisk(findings: AgentFinding[]): AgentRiskLevel {
  return findings.reduce<AgentRiskLevel>(
    (highest, finding) =>
      RISK_ORDER[finding.severity] > RISK_ORDER[highest]
        ? finding.severity
        : highest,
    "low",
  );
}

function mergeMetadata(items: RedactionMetadata[]): RedactionMetadata {
  const removedKinds = [...new Set(items.flatMap((item) => item.removedKinds))].sort();
  return {
    removedKinds,
    containsSecrets: items.some((item) => item.containsSecrets),
    containsRawIdentity: items.some((item) => item.containsRawIdentity),
    containsRawBody: items.some((item) => item.containsRawBody),
    containsFileContent: items.some((item) => item.containsFileContent),
    truncated: items.some((item) => item.truncated),
    redactionVersion: items[0]?.redactionVersion ?? "1.0",
  };
}

function decisionFor(
  reviewer: MultiAgentReviewerKind,
  findings: AgentFinding[],
): AgentReviewDecision {
  if (findings.some((finding) => finding.severity === "critical")) {
    return "block";
  }
  if (reviewer === "security" && findings.some((finding) => finding.severity === "high")) {
    return "block";
  }
  if (findings.some((finding) => finding.severity === "high")) {
    return "needs-review";
  }
  if (findings.some((finding) => finding.severity === "medium")) {
    return "warn";
  }
  if (findings.length > 0) {
    return "warn";
  }
  return "pass";
}

function review(
  reviewer: MultiAgentReviewerKind,
  input: ReviewerInput,
  seeds: FindingSeed[],
  emptySummary: string,
): AgentReview {
  const requestRedaction = redactString(input.request, { maxLength: 500 });
  const artifactRedaction = input.artifactSummary
    ? redactString(input.artifactSummary, { maxLength: 500 })
    : null;
  const findings = seeds.map((seed, index) => makeFinding(reviewer, index, seed));
  const decision = decisionFor(reviewer, findings);
  const riskLevel = highestRisk(findings);
  const requiredFollowups = findings.map((finding) => finding.summary);
  const blockedShortcuts = findings
    .filter((finding) => finding.severity === "critical" || finding.severity === "high")
    .map((finding) => finding.title);

  return {
    reviewId: `${reviewer}_${Date.now().toString(36)}`,
    reviewer,
    reviewerKind: reviewer,
    createdAt: input.createdAt,
    decision,
    confidence: findings.length > 0 ? "medium" : "high",
    findings,
    riskLevel,
    requiredFollowups,
    blockedShortcuts,
    safeSummary: findings.length > 0
      ? `${reviewer} reviewer found ${findings.length} advisory item(s).`
      : emptySummary,
    redaction: mergeMetadata(
      artifactRedaction
        ? [requestRedaction.metadata, artifactRedaction.metadata]
        : [requestRedaction.metadata],
    ),
  };
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

export function runCriticReviewer(input: ReviewerInput): AgentReview {
  const text = combinedText(input);
  const seeds: FindingSeed[] = [];

  if (input.request.trim().length < 24) {
    seeds.push({
      title: "Request is underspecified",
      summary: "Clarify the intended outcome before treating this as ready.",
      severity: "medium",
      reasonCode: "underspecified-request",
      evidence: [input.request],
    });
  }

  if (includesAny(text, ["maybe", "probably", "assume", "guess"])) {
    seeds.push({
      title: "Assumption needs confirmation",
      summary: "Replace speculative language with checked facts or explicit assumptions.",
      severity: "medium",
      reasonCode: "unsupported-assumption",
      evidence: [input.request],
    });
  }

  if (includesAny(text, ["skip verification", "no tests", "don't test", "do not test"])) {
    seeds.push({
      title: "Verification shortcut requested",
      summary: "Keep a verification step for any meaningful change.",
      severity: "high",
      reasonCode: "missing-verification",
      evidence: [input.request],
    });
  }

  if (
    input.reviewMode === "implementation" &&
    !includesAny(text, ["verify", "typecheck", "smoke", "test", "git diff --check"])
  ) {
    seeds.push({
      title: "Implementation lacks verification plan",
      summary: "Add typecheck, diff check, or focused smoke coverage.",
      severity: "medium",
      reasonCode: "missing-verification",
      evidence: [input.request],
    });
  }

  return review(
    "critic",
    input,
    seeds,
    "Critic reviewer found no deterministic clarity blockers.",
  );
}

export function runSecurityReviewer(input: ReviewerInput): AgentReview {
  const text = combinedText(input);
  const redaction = redactString(`${input.request}\n${input.artifactSummary ?? ""}`, {
    maxLength: 500,
  });
  const seeds: FindingSeed[] = [];

  if (redaction.metadata.containsSecrets || redaction.metadata.containsRawIdentity) {
    seeds.push({
      title: "Raw secret or identity risk",
      summary: "Remove raw identity or secret-like content before storing a trace.",
      severity: "critical",
      reasonCode: "secret-or-identity-risk",
      evidence: [redaction.safePreview],
    });
  }

  if (redaction.metadata.containsRawBody || redaction.metadata.containsFileContent) {
    seeds.push({
      title: "Unsafe raw content risk",
      summary: "Use a bounded redacted summary instead of raw content.",
      severity: "high",
      reasonCode: "raw-content-risk",
      evidence: [redaction.safePreview],
    });
  }

  if (
    includesAny(text, [
      "dispatch",
      "approve",
      "second approval",
      "grant second",
      "merge pr",
      "git push",
      "deploy",
      "delete file",
      "real computer",
      "click real",
      "type real",
    ])
  ) {
    seeds.push({
      title: "Forbidden or gated action shortcut",
      summary: "Advisory review cannot satisfy approval, permission, or action gates.",
      severity: "critical",
      reasonCode: "forbidden-action",
      evidence: [input.request],
    });
  }

  if (includesAny(text, ["provider call", "llm call", "network call", "openai", "anthropic"])) {
    seeds.push({
      title: "Provider or network use needs explicit phase approval",
      summary: "Keep this deterministic/local unless a later phase allows provider use.",
      severity: "high",
      reasonCode: "provider-or-network-risk",
      evidence: [input.request],
    });
  }

  return review(
    "security",
    input,
    seeds,
    "Security reviewer found no deterministic policy blockers.",
  );
}

export function runQaReviewer(input: ReviewerInput): AgentReview {
  const text = combinedText(input);
  const seeds: FindingSeed[] = [];

  if (!includesAny(text, ["typecheck", "tsc", "npm run check"])) {
    seeds.push({
      title: "Typecheck coverage not mentioned",
      summary: "Include typecheck or document why it is not needed.",
      severity: "medium",
      reasonCode: "missing-typecheck",
      evidence: [input.request],
    });
  }

  if (!includesAny(text, ["git diff --check", "diff check", "whitespace"])) {
    seeds.push({
      title: "Diff check not mentioned",
      summary: "Include a whitespace/diff check before shipping.",
      severity: "low",
      reasonCode: "missing-diff-check",
      evidence: [input.request],
    });
  }

  if (
    includesAny(text, ["store", "persist", "json", "append"]) &&
    !includesAny(text, ["missing", "corrupt", "retention", "isolated home"])
  ) {
    seeds.push({
      title: "Store edge cases need smoke coverage",
      summary: "Check missing/corrupt stores, retention, and isolated HOME behavior.",
      severity: "medium",
      reasonCode: "missing-store-smoke",
      evidence: [input.request],
    });
  }

  if (
    input.reviewMode === "smoke" &&
    !includesAny(text, ["privacy", "leak", "redact"])
  ) {
    seeds.push({
      title: "Smoke plan lacks privacy scan",
      summary: "Add a scan for raw phone, email, token, raw body, and full path leaks.",
      severity: "medium",
      reasonCode: "missing-privacy-smoke",
      evidence: [input.request],
    });
  }

  return review(
    "qa",
    input,
    seeds,
    "QA reviewer found no deterministic verification gaps.",
  );
}

export function runDeterministicReviewers(input: ReviewerInput): AgentReview[] {
  return [
    runCriticReviewer(input),
    runSecurityReviewer(input),
    runQaReviewer(input),
  ];
}
