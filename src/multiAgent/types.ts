import type { RedactionMetadata } from "../privacy/redactionEngine.js";
import type { ProjectIdentity } from "../supervisor/types.js";

export const MULTI_AGENT_TRACE_STORE_VERSION = "1.0";
export const MULTI_AGENT_TRACE_SCHEMA_VERSION = "1.0";

export type MultiAgentReviewerKind = "critic" | "security" | "qa";

export type AgentReviewDecision = "pass" | "warn" | "needs-review" | "block";

export type AgentRiskLevel = "low" | "medium" | "high" | "critical";

export type MultiAgentReviewMode =
  | "general"
  | "implementation"
  | "verification"
  | "smoke"
  | "release";

export type MultiAgentTraceSource =
  | "cli"
  | "supervisor"
  | "job"
  | "channel"
  | "system";

export interface AgentFinding {
  id: string;
  reviewer: MultiAgentReviewerKind;
  title: string;
  summary: string;
  severity: AgentRiskLevel;
  reasonCode: string;
  evidence: string[];
  advisoryOnly: true;
}

export interface AgentReview {
  reviewId: string;
  reviewer: MultiAgentReviewerKind;
  reviewerKind: MultiAgentReviewerKind;
  createdAt: string;
  decision: AgentReviewDecision;
  confidence: "low" | "medium" | "high";
  findings: AgentFinding[];
  riskLevel: AgentRiskLevel;
  requiredFollowups: string[];
  blockedShortcuts: string[];
  safeSummary: string;
  redaction: RedactionMetadata;
}

export interface ConsensusDecision {
  decision: AgentReviewDecision;
  reasonCodes: string[];
  reviewerVotes: Record<MultiAgentReviewerKind, AgentReviewDecision>;
  highestRiskLevel: AgentRiskLevel;
  requiredFollowups: string[];
  safeSummary: string;
  advisoryOnly: true;
}

export interface MultiAgentReviewRequest {
  source?: MultiAgentTraceSource;
  reviewMode?: MultiAgentReviewMode;
  request: string;
  artifactSummary?: string;
  linkedTrajectoryIds?: string[];
  linkedProposalIds?: string[];
  linkedJobIds?: string[];
  correlationId?: string | null;
  projectRoot?: string;
}

export interface MultiAgentTrace {
  traceId: string;
  version: typeof MULTI_AGENT_TRACE_SCHEMA_VERSION;
  projectId: string;
  projectName: string;
  projectRootHash: string;
  createdAt: string;
  updatedAt: string;
  source: MultiAgentTraceSource;
  requestHash: string;
  requestPreview: string;
  artifactPreview: string | null;
  reviewMode: MultiAgentReviewMode;
  reviewers: MultiAgentReviewerKind[];
  reviews: AgentReview[];
  consensus: ConsensusDecision;
  linkedTrajectoryIds: string[];
  linkedProposalIds: string[];
  linkedJobIds: string[];
  redaction: RedactionMetadata;
  correlationId: string | null;
}

export interface MultiAgentTraceStoreData {
  version: typeof MULTI_AGENT_TRACE_STORE_VERSION;
  traces: MultiAgentTrace[];
}

export interface MultiAgentTraceStats {
  total: number;
  byConsensus: Partial<Record<AgentReviewDecision, number>>;
  bySource: Partial<Record<MultiAgentTraceSource, number>>;
  byMode: Partial<Record<MultiAgentReviewMode, number>>;
  byReviewerDecision: Record<MultiAgentReviewerKind, Partial<Record<AgentReviewDecision, number>>>;
}

export interface MultiAgentReviewResult {
  trace: MultiAgentTrace;
  persisted: boolean;
  advisoryOnly: true;
}

export interface BuildMultiAgentTraceInput {
  request: MultiAgentReviewRequest;
  project: ProjectIdentity;
  createdAt?: string;
}
