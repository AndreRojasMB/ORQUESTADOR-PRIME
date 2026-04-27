import { createHash } from "crypto";
import {
  redactString,
  type RedactionMetadata,
} from "../privacy/redactionEngine.js";
import { deriveProjectIdentity } from "../supervisor/projectIdentity.js";
import { buildConsensusDecision } from "./consensus.js";
import { runDeterministicReviewers } from "./reviewers.js";
import { appendMultiAgentTrace } from "./traceStore.js";
import {
  MULTI_AGENT_TRACE_SCHEMA_VERSION,
  type BuildMultiAgentTraceInput,
  type MultiAgentReviewMode,
  type MultiAgentReviewRequest,
  type MultiAgentReviewResult,
  type MultiAgentTrace,
  type MultiAgentTraceSource,
} from "./types.js";

function stableHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function generateTraceId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `mat_${ts}_${rand}`;
}

function normalizeList(value: string[] | undefined): string[] {
  return [...new Set((value ?? []).filter((item) => item.trim().length > 0))].sort();
}

function source(value: MultiAgentReviewRequest["source"]): MultiAgentTraceSource {
  return value ?? "cli";
}

function mode(value: MultiAgentReviewRequest["reviewMode"]): MultiAgentReviewMode {
  return value ?? "general";
}

function mergeRedaction(items: RedactionMetadata[]): RedactionMetadata {
  return {
    removedKinds: [...new Set(items.flatMap((item) => item.removedKinds))].sort(),
    containsSecrets: items.some((item) => item.containsSecrets),
    containsRawIdentity: items.some((item) => item.containsRawIdentity),
    containsRawBody: items.some((item) => item.containsRawBody),
    containsFileContent: items.some((item) => item.containsFileContent),
    truncated: items.some((item) => item.truncated),
    redactionVersion: items[0]?.redactionVersion ?? "1.0",
  };
}

export function buildMultiAgentTrace(input: BuildMultiAgentTraceInput): MultiAgentTrace {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const requestRedaction = redactString(input.request.request, { maxLength: 500 });
  const artifactRedaction = input.request.artifactSummary
    ? redactString(input.request.artifactSummary, { maxLength: 500 })
    : null;
  const reviewMode = mode(input.request.reviewMode);
  const reviews = runDeterministicReviewers({
    request: requestRedaction.safePreview,
    artifactSummary: artifactRedaction?.safePreview ?? null,
    reviewMode,
    createdAt,
  });
  const consensus = buildConsensusDecision(reviews);
  const redaction = mergeRedaction(
    artifactRedaction
      ? [requestRedaction.metadata, artifactRedaction.metadata]
      : [requestRedaction.metadata],
  );

  return {
    traceId: generateTraceId(),
    version: MULTI_AGENT_TRACE_SCHEMA_VERSION,
    projectId: input.project.projectId,
    projectName: input.project.projectName,
    projectRootHash: input.project.projectRootHash,
    createdAt,
    updatedAt: createdAt,
    source: source(input.request.source),
    requestHash: stableHash(input.request.request),
    requestPreview: requestRedaction.safePreview,
    artifactPreview: artifactRedaction?.safePreview ?? null,
    reviewMode,
    reviewers: ["critic", "security", "qa"],
    reviews,
    consensus,
    linkedTrajectoryIds: normalizeList(input.request.linkedTrajectoryIds),
    linkedProposalIds: normalizeList(input.request.linkedProposalIds),
    linkedJobIds: normalizeList(input.request.linkedJobIds),
    redaction,
    correlationId: input.request.correlationId ?? null,
  };
}

export async function runMultiAgentReview(
  request: MultiAgentReviewRequest,
  options: { persist?: boolean } = {},
): Promise<MultiAgentReviewResult> {
  const project = deriveProjectIdentity(request.projectRoot);
  const trace = buildMultiAgentTrace({ request, project });

  if (options.persist === true) {
    const persisted = await appendMultiAgentTrace(trace);
    return {
      trace: persisted.trace,
      persisted: persisted.persisted,
      advisoryOnly: true,
    };
  }

  return {
    trace,
    persisted: false,
    advisoryOnly: true,
  };
}
