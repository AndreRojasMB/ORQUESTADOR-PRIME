import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { logger } from "../observability/logger.js";
import {
  MULTI_AGENT_TRACE_STORE_VERSION,
  type AgentReviewDecision,
  type MultiAgentReviewMode,
  type MultiAgentReviewerKind,
  type MultiAgentTrace,
  type MultiAgentTraceSource,
  type MultiAgentTraceStats,
  type MultiAgentTraceStoreData,
} from "./types.js";

const DATA_DIR = join(homedir(), ".orquestador-prime");
const TRACE_FILE = join(DATA_DIR, "multi-agent-traces.json");
const MAX_MULTI_AGENT_TRACES = 1000;

const REVIEWERS: MultiAgentReviewerKind[] = ["critic", "security", "qa"];

const EMPTY_STORE: MultiAgentTraceStoreData = {
  version: MULTI_AGENT_TRACE_STORE_VERSION,
  traces: [],
};

function cloneTrace(trace: MultiAgentTrace): MultiAgentTrace {
  return {
    traceId: trace.traceId,
    version: trace.version,
    projectId: trace.projectId,
    projectName: trace.projectName,
    projectRootHash: trace.projectRootHash,
    createdAt: trace.createdAt,
    updatedAt: trace.updatedAt,
    source: trace.source,
    requestHash: trace.requestHash,
    requestPreview: trace.requestPreview,
    artifactPreview: trace.artifactPreview,
    reviewMode: trace.reviewMode,
    reviewers: trace.reviewers.slice(),
    reviews: trace.reviews.map((review) => ({
      ...review,
      findings: review.findings.map((finding) => ({
        ...finding,
        evidence: finding.evidence.slice(),
      })),
      requiredFollowups: review.requiredFollowups.slice(),
      blockedShortcuts: review.blockedShortcuts.slice(),
      redaction: {
        ...review.redaction,
        removedKinds: review.redaction.removedKinds.slice(),
      },
    })),
    consensus: {
      ...trace.consensus,
      reasonCodes: trace.consensus.reasonCodes.slice(),
      reviewerVotes: { ...trace.consensus.reviewerVotes },
      requiredFollowups: trace.consensus.requiredFollowups.slice(),
    },
    linkedTrajectoryIds: trace.linkedTrajectoryIds.slice(),
    linkedProposalIds: trace.linkedProposalIds.slice(),
    linkedJobIds: trace.linkedJobIds.slice(),
    redaction: {
      ...trace.redaction,
      removedKinds: trace.redaction.removedKinds.slice(),
    },
    correlationId: trace.correlationId,
  };
}

export async function readMultiAgentTraceStore(): Promise<MultiAgentTraceStoreData> {
  try {
    const raw = await readFile(TRACE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as MultiAgentTraceStoreData;
    if (
      parsed.version !== MULTI_AGENT_TRACE_STORE_VERSION ||
      !Array.isArray(parsed.traces)
    ) {
      return { ...EMPTY_STORE, traces: [] };
    }
    return {
      version: MULTI_AGENT_TRACE_STORE_VERSION,
      traces: parsed.traces.map(cloneTrace),
    };
  } catch {
    return { ...EMPTY_STORE, traces: [] };
  }
}

async function writeMultiAgentTraceStore(
  store: MultiAgentTraceStoreData,
): Promise<boolean> {
  try {
    const normalized: MultiAgentTraceStoreData = {
      version: MULTI_AGENT_TRACE_STORE_VERSION,
      traces: store.traces.slice(-MAX_MULTI_AGENT_TRACES).map(cloneTrace),
    };
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(TRACE_FILE, JSON.stringify(normalized, null, 2), "utf-8");
    return true;
  } catch (err) {
    logger.warn("multi-agent trace store write failed - continuing without persistence", {
      error: String(err),
    });
    return false;
  }
}

export async function appendMultiAgentTrace(
  trace: MultiAgentTrace,
): Promise<{ trace: MultiAgentTrace; persisted: boolean }> {
  const store = await readMultiAgentTraceStore();
  store.traces.push(cloneTrace(trace));
  const persisted = await writeMultiAgentTraceStore(store);
  return { trace: cloneTrace(trace), persisted };
}

export async function getRecentMultiAgentTraces(
  n = 50,
): Promise<MultiAgentTrace[]> {
  const store = await readMultiAgentTraceStore();
  return store.traces.slice(-n).map(cloneTrace);
}

function increment<K extends string>(
  record: Partial<Record<K, number>>,
  key: K,
): void {
  record[key] = (record[key] ?? 0) + 1;
}

export async function getMultiAgentTraceStats(): Promise<MultiAgentTraceStats> {
  const store = await readMultiAgentTraceStore();
  const stats: MultiAgentTraceStats = {
    total: store.traces.length,
    byConsensus: {},
    bySource: {},
    byMode: {},
    byReviewerDecision: {
      critic: {},
      security: {},
      qa: {},
    },
  };

  for (const trace of store.traces) {
    increment<AgentReviewDecision>(stats.byConsensus, trace.consensus.decision);
    increment<MultiAgentTraceSource>(stats.bySource, trace.source);
    increment<MultiAgentReviewMode>(stats.byMode, trace.reviewMode);
    for (const reviewer of REVIEWERS) {
      const decision = trace.consensus.reviewerVotes[reviewer];
      increment<AgentReviewDecision>(stats.byReviewerDecision[reviewer], decision);
    }
  }

  return stats;
}

export function getMultiAgentTracePath(): string {
  return TRACE_FILE;
}
