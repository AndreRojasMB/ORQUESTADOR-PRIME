import { readActionStore } from "../actions/actionStore.js";
import { readChannelAuditStore } from "../actions/channelAuditStore.js";
import { readExecutionResultStore } from "../actions/executionResultStore.js";
import type {
  ActionCategory,
  ActionStatus,
  ChannelAuditReasonCode,
  ChannelKind,
  ChannelOperation,
  ExecutionOutcome,
} from "../actions/types.js";
import { readMemoryStore } from "../memory/memoryStore.js";
import { readTrajectoryStore } from "../trajectory/trajectoryStore.js";
import type { OrchestratorMode } from "../types.js";
import { deriveProjectIdentity } from "./projectIdentity.js";
import { getProjectGoalsState } from "./projectGoalsStore.js";
import {
  SUPERVISOR_REPORT_SCHEMA_VERSION,
  type BuildSupervisorReportOptions,
  type ProjectGoal,
  type SupervisorActionSummary,
  type SupervisorAdvisoryReport,
  type SupervisorChannelAuditSummary,
  type SupervisorExecutionSummary,
  type SupervisorGoalSummary,
  type SupervisorMemorySummary,
  type SupervisorRecommendation,
  type SupervisorRisk,
  type SupervisorTrajectorySummary,
} from "./types.js";

const DEFAULT_RECENT_LIMIT = 10;
const PREVIEW_LIMIT = 140;

function increment<K extends string>(record: Partial<Record<K, number>>, key: K): void {
  record[key] = (record[key] ?? 0) + 1;
}

function dateValue(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function redactPreview(value: string, maxLength = PREVIEW_LIMIT): string {
  const normalized = value
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted-email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[redacted-phone]")
    .replace(
      /\b(api[_-]?key|access[_-]?token|refresh[_-]?token|token|secret|authorization)\b\s*[:=]\s*["']?[^"'\s,;}]+/gi,
      "$1=[redacted-secret]",
    )
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 3))}...`;
}

function recentByDate<T>(
  values: T[],
  limit: number,
  getDate: (value: T) => string,
): T[] {
  return values
    .slice()
    .sort((a, b) => dateValue(getDate(b)) - dateValue(getDate(a)))
    .slice(0, limit);
}

function summarizeGoals(goals: ProjectGoal[]): SupervisorGoalSummary {
  const activeGoals = goals
    .filter((goal) => goal.status === "active" || goal.status === "blocked")
    .sort((a, b) => dateValue(b.updatedAt) - dateValue(a.updatedAt))
    .slice(0, DEFAULT_RECENT_LIMIT)
    .map((goal) => ({
      id: goal.id,
      title: redactPreview(goal.title, 100),
      priority: goal.priority,
      status: goal.status,
      targetPhase: goal.targetPhase ?? null,
      blockerCount: goal.blockers.length,
    }));

  return {
    total: goals.length,
    active: goals.filter((goal) => goal.status === "active").length,
    blocked: goals.filter((goal) => goal.status === "blocked").length,
    done: goals.filter((goal) => goal.status === "done").length,
    deferred: goals.filter((goal) => goal.status === "deferred").length,
    dropped: goals.filter((goal) => goal.status === "dropped").length,
    highPriorityActive: goals.filter(
      (goal) => goal.status === "active" && goal.priority === "high",
    ).length,
    activeGoals,
  };
}

function summarizeTrajectories(
  trajectories: Awaited<ReturnType<typeof readTrajectoryStore>>["trajectories"],
  recentLimit: number,
): SupervisorTrajectorySummary {
  const byMode: Partial<Record<OrchestratorMode, number>> = {};
  const byOutcome: Record<string, number> = {};

  for (const trajectory of trajectories) {
    increment(byMode, trajectory.intent.mode);
    byOutcome[trajectory.outcome ?? "unknown"] = (byOutcome[trajectory.outcome ?? "unknown"] ?? 0) + 1;
  }

  const recent = recentByDate(trajectories, recentLimit, (trajectory) => trajectory.createdAt);

  return {
    total: trajectories.length,
    recentCount: recent.length,
    parseFailures: trajectories.filter((trajectory) => !trajectory.result.parseSuccess).length,
    errorCount: trajectories.reduce((count, trajectory) => count + trajectory.errors.length, 0),
    byMode,
    byOutcome,
    latest: recent.map((trajectory) => ({
      id: trajectory.id,
      createdAt: trajectory.createdAt,
      mode: trajectory.intent.mode,
      source: trajectory.source,
      outcome: trajectory.outcome,
      approvalStatus: trajectory.approvalStatus,
      judgeScore: trajectory.judgeScore,
      parseSuccess: trajectory.result.parseSuccess,
      errorCount: trajectory.errors.length,
    })),
  };
}

function summarizeActions(
  proposals: Awaited<ReturnType<typeof readActionStore>>["proposals"],
  recentLimit: number,
): SupervisorActionSummary {
  const byStatus: Partial<Record<ActionStatus, number>> = {};
  const byCategory: Partial<Record<ActionCategory, number>> = {};

  for (const proposal of proposals) {
    increment(byStatus, proposal.status);
    increment(byCategory, proposal.category);
  }

  return {
    total: proposals.length,
    byStatus,
    byCategory,
    pendingReviewCount: proposals.filter((proposal) => proposal.status === "pending-approval").length,
    approvedCount: proposals.filter((proposal) => proposal.status === "approved").length,
    rejectedCount: proposals.filter((proposal) => proposal.status === "rejected").length,
    recent: recentByDate(proposals, recentLimit, (proposal) => proposal.createdAt).map((proposal) => ({
      id: proposal.id,
      createdAt: proposal.createdAt,
      source: proposal.source,
      category: proposal.category,
      status: proposal.status,
      riskLevel: proposal.riskLevel,
      titlePreview: redactPreview(proposal.title, 100),
      traceId: proposal.traceId,
      trajectoryId: proposal.trajectoryId,
    })),
  };
}

function summarizeExecutions(
  results: Awaited<ReturnType<typeof readExecutionResultStore>>["results"],
  recentLimit: number,
): SupervisorExecutionSummary {
  const byOutcome: Partial<Record<ExecutionOutcome, number>> = {};

  for (const result of results) {
    increment(byOutcome, result.outcome);
  }

  return {
    total: results.length,
    successful: results.filter((result) => result.ok && result.outcome === "success").length,
    failed: results.filter((result) => !result.ok || result.outcome === "failure").length,
    blocked: results.filter((result) => result.outcome === "blocked").length,
    byOutcome,
    recent: recentByDate(results, recentLimit, (result) => result.finishedAt).map((result) => ({
      id: result.id,
      proposalId: result.proposalId,
      category: result.category,
      startedAt: result.startedAt,
      finishedAt: result.finishedAt,
      durationMs: result.durationMs,
      outcome: result.outcome,
      ok: result.ok,
    })),
  };
}

function summarizeChannelAudit(
  entries: Awaited<ReturnType<typeof readChannelAuditStore>>["entries"],
  recentLimit: number,
): SupervisorChannelAuditSummary {
  const byChannel: Partial<Record<ChannelKind, number>> = {};
  const byOperation: Partial<Record<ChannelOperation, number>> = {};
  const byReasonCode: Partial<Record<ChannelAuditReasonCode, number>> = {};

  for (const entry of entries) {
    increment(byChannel, entry.channel);
    increment(byOperation, entry.operation);
    increment(byReasonCode, entry.reasonCode);
  }

  const blockedEntries = entries.filter((entry) => entry.decision === "blocked");

  return {
    total: entries.length,
    allowed: entries.filter((entry) => entry.decision === "allowed").length,
    blocked: blockedEntries.length,
    byChannel,
    byOperation,
    byReasonCode,
    recentBlocked: recentByDate(blockedEntries, recentLimit, (entry) => entry.timestamp).map((entry) => ({
      id: entry.id,
      timestamp: entry.timestamp,
      channel: entry.channel,
      operation: entry.operation,
      reasonCode: entry.reasonCode,
      category: entry.category,
      proposalId: entry.proposalId,
      sourceEventId: entry.sourceEventId,
    })),
  };
}

function summarizeMemory(
  entries: Awaited<ReturnType<typeof readMemoryStore>>["entries"],
  recentLimit: number,
): SupervisorMemorySummary {
  return {
    total: entries.length,
    recent: recentByDate(entries, recentLimit, (entry) => entry.timestamp).map((entry) => ({
      id: entry.id,
      type: entry.type,
      timestamp: entry.timestamp,
      source: entry.source,
      traceId: entry.traceId,
      taskPreview: redactPreview(entry.task, 120),
    })),
  };
}

function buildRisks(input: {
  goals: SupervisorGoalSummary;
  trajectories: SupervisorTrajectorySummary;
  actions: SupervisorActionSummary;
  executions: SupervisorExecutionSummary;
  channelAudit: SupervisorChannelAuditSummary;
}): SupervisorRisk[] {
  const risks: SupervisorRisk[] = [];

  if (input.goals.total === 0) {
    risks.push({
      id: "missing-project-goals",
      severity: "medium",
      title: "No project goals recorded",
      summary: "The supervisor has no explicit project goals to compare against current work.",
      evidence: ["project goal count is 0"],
      advisoryOnly: true,
    });
  }

  if (input.goals.blocked > 0) {
    risks.push({
      id: "blocked-project-goals",
      severity: "high",
      title: "Blocked project goals present",
      summary: "One or more project goals are marked blocked.",
      evidence: [`blocked goals: ${input.goals.blocked}`],
      advisoryOnly: true,
    });
  }

  if (input.trajectories.parseFailures > 0 || input.trajectories.errorCount > 0) {
    risks.push({
      id: "recent-trajectory-quality",
      severity: input.trajectories.parseFailures > 0 ? "medium" : "low",
      title: "Trajectory quality issues detected",
      summary: "Recent trajectory history includes parse failures or recorded errors.",
      evidence: [
        `parse failures: ${input.trajectories.parseFailures}`,
        `recorded errors: ${input.trajectories.errorCount}`,
      ],
      advisoryOnly: true,
    });
  }

  if (input.actions.pendingReviewCount > 0) {
    risks.push({
      id: "pending-action-review",
      severity: "medium",
      title: "Action proposals await review",
      summary: "Pending action proposals require the normal human review path.",
      evidence: [`pending review count: ${input.actions.pendingReviewCount}`],
      advisoryOnly: true,
    });
  }

  if (input.executions.failed > 0 || input.executions.blocked > 0) {
    risks.push({
      id: "execution-issues",
      severity: "high",
      title: "Execution failures or blocked results detected",
      summary: "Action execution history contains failed or blocked outcomes.",
      evidence: [
        `failed executions: ${input.executions.failed}`,
        `blocked executions: ${input.executions.blocked}`,
      ],
      advisoryOnly: true,
    });
  }

  if (input.channelAudit.blocked > 0) {
    risks.push({
      id: "channel-blocks",
      severity: "medium",
      title: "External channel decisions were blocked",
      summary: "Channel audit history contains blocked decisions that may need review.",
      evidence: [`blocked channel decisions: ${input.channelAudit.blocked}`],
      advisoryOnly: true,
    });
  }

  return risks;
}

function buildRecommendations(input: {
  goals: SupervisorGoalSummary;
  risks: SupervisorRisk[];
  actions: SupervisorActionSummary;
  executions: SupervisorExecutionSummary;
  channelAudit: SupervisorChannelAuditSummary;
}): SupervisorRecommendation[] {
  const recommendations: SupervisorRecommendation[] = [];

  if (input.goals.total === 0) {
    recommendations.push({
      id: "define-project-goals",
      kind: "define-goals",
      priority: "high",
      title: "Define project goals",
      rationale: "Supervisor recommendations are safer when explicit project goals exist.",
      nextSafeStep: "Add project goals through a future explicit manual goals command or approved store update.",
      forbiddenShortcuts: ["do not infer goals from vague memory", "do not mutate goals automatically"],
      advisoryOnly: true,
    });
  }

  if (input.actions.pendingReviewCount > 0) {
    recommendations.push({
      id: "review-pending-proposals",
      kind: "review-proposals",
      priority: "medium",
      title: "Review pending proposals through the normal approval flow",
      rationale: "Pending proposals require human review; supervisor cannot approve or reject them.",
      nextSafeStep: "Use the existing review path outside this supervisor status command.",
      forbiddenShortcuts: ["do not approve from supervisor", "do not dispatch from supervisor"],
      advisoryOnly: true,
    });
  }

  if (input.executions.failed > 0 || input.executions.blocked > 0) {
    recommendations.push({
      id: "inspect-execution-issues",
      kind: "inspect-failures",
      priority: "high",
      title: "Inspect execution failures",
      rationale: "Failed or blocked execution results can indicate unsafe proposals or broken gates.",
      nextSafeStep: "Review action execution summaries and rerun verification before more execution work.",
      forbiddenShortcuts: ["do not retry dispatch from supervisor", "do not bypass second approval"],
      advisoryOnly: true,
    });
  }

  if (input.channelAudit.blocked > 0) {
    recommendations.push({
      id: "inspect-channel-blocks",
      kind: "inspect-channel-blocks",
      priority: "medium",
      title: "Inspect blocked channel decisions",
      rationale: "Blocked external channel decisions may reveal configuration or trust mismatches.",
      nextSafeStep: "Use channel audit visibility to inspect reason codes without exposing raw identity.",
      forbiddenShortcuts: ["do not loosen channel permissions automatically", "do not dispatch from channels by default"],
      advisoryOnly: true,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "continue-roadmap",
      kind: "continue-roadmap",
      priority: "medium",
      title: "Continue with the approved roadmap",
      rationale: "No high-priority advisory blockers were detected in current stores.",
      nextSafeStep: "Proceed with the next approved planning or implementation phase.",
      forbiddenShortcuts: ["do not skip verification", "do not bypass approval gates"],
      advisoryOnly: true,
    });
  }

  return recommendations;
}

export async function buildSupervisorAdvisoryReport(
  options: BuildSupervisorReportOptions = {},
): Promise<SupervisorAdvisoryReport> {
  const generatedAt = options.now ?? new Date().toISOString();
  const recentLimit = options.recentLimit ?? DEFAULT_RECENT_LIMIT;
  const identity = deriveProjectIdentity(options.projectRoot);

  const [
    projectGoals,
    trajectoryStore,
    actionStore,
    executionResultStore,
    channelAuditStore,
    memoryStore,
  ] = await Promise.all([
    getProjectGoalsState(identity.projectRoot),
    readTrajectoryStore(),
    readActionStore(),
    readExecutionResultStore(),
    readChannelAuditStore(),
    readMemoryStore(),
  ]);

  const goals = summarizeGoals(projectGoals.goals);
  const trajectories = summarizeTrajectories(trajectoryStore.trajectories, recentLimit);
  const actions = summarizeActions(actionStore.proposals, recentLimit);
  const executions = summarizeExecutions(executionResultStore.results, recentLimit);
  const channelAudit = summarizeChannelAudit(channelAuditStore.entries, recentLimit);
  const memory = summarizeMemory(memoryStore.entries, recentLimit);
  const risks = buildRisks({ goals, trajectories, actions, executions, channelAudit });
  const recommendations = buildRecommendations({
    goals,
    risks,
    actions,
    executions,
    channelAudit,
  });

  return {
    schemaVersion: SUPERVISOR_REPORT_SCHEMA_VERSION,
    generatedAt,
    project: {
      projectId: identity.projectId,
      projectName: identity.projectName,
      projectRootHash: identity.projectRootHash,
    },
    boundaries: {
      advisoryOnly: true,
      noProviderCalls: true,
      cannotApproveRejectOrDispatch: true,
      cannotGrantOrConsumeSecondApproval: true,
      cannotCreateProposals: true,
      cannotMutateExistingStores: true,
    },
    goals,
    trajectories,
    actions,
    executions,
    channelAudit,
    memory,
    risks,
    blockers: risks
      .filter((risk) => risk.severity === "high")
      .map((risk) => risk.title),
    recommendations,
  };
}
