import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEntryById,
  getTrajectoryByTraceId,
  getActionsByTraceId,
  getActionsByTrajectoryId,
  getExecutionResultsByProposalId,
} from "@/lib/data";
import { classifyForDistillation } from "@/lib/distillation";
import { Badge } from "@/components/Badge";
import { PhaseTimeline } from "@/components/PhaseTimeline";
import type {
  Trajectory,
  ActionProposal,
  ExecutionResult,
  DistillationResult,
  OutcomeStatus,
  ApprovalStatus,
} from "@/lib/types";

type Params = Promise<{ id: string }>;

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

export default async function RunDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const entry = await getEntryById(id);

  if (!entry) {
    notFound();
  }

  const trajectory = await getTrajectoryByTraceId(entry.traceId);
  const distillation = trajectory ? classifyForDistillation(trajectory) : null;

  // Related actions: join on traceId (and trajectory.id if available).
  const actionsByTrace = await getActionsByTraceId(entry.traceId);
  const actionsByTrajectory = trajectory
    ? await getActionsByTrajectoryId(trajectory.id)
    : [];
  const relatedActions = dedupeActions([...actionsByTrace, ...actionsByTrajectory]);

  const executionsByProposal = new Map<string, ExecutionResult[]>();
  for (const action of relatedActions) {
    const runs = await getExecutionResultsByProposalId(action.id);
    runs.sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1));
    executionsByProposal.set(action.id, runs);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/runs"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          &larr; Back to Runs
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Run Detail</h1>
          <Badge variant="mode">{entry.type}</Badge>
          {trajectory && (
            <SourceBadge source={trajectory.source} />
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          {formatTimestamp(entry.timestamp)}
        </p>
      </div>

      {/* Task */}
      <Section title="Task">
        <p className="text-sm text-zinc-300 leading-relaxed">
          {entry.task || "(no task provided)"}
        </p>
      </Section>

      {/* Agents */}
      <Section title="Agents">
        {entry.agents.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {entry.agents.map((agent) => (
              <Badge key={agent} variant="domain">
                {agent}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-600">No agents recorded.</p>
        )}
      </Section>

      {/* Keywords */}
      <Section title="Keywords">
        {entry.keywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {entry.keywords.map((kw) => (
              <Badge key={kw}>{kw}</Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-600">No keywords matched.</p>
        )}
      </Section>

      {/* Optional fields */}
      {entry.summary && (
        <Section title="Summary">
          <p className="text-sm text-zinc-300">{entry.summary}</p>
        </Section>
      )}

      {entry.projectType && (
        <Section title="Project Type">
          <Badge>{entry.projectType}</Badge>
        </Section>
      )}

      {entry.outputDir && (
        <Section title="Output Directory">
          <code className="text-sm font-mono text-zinc-400">{entry.outputDir}</code>
        </Section>
      )}

      {/* Trace ID */}
      <Section title="Trace ID">
        <code className="text-xs font-mono text-zinc-500">{entry.traceId}</code>
      </Section>

      {/* Trace detail */}
      <div>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Trace
        </h2>
        {entry.trace ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <PhaseTimeline trace={entry.trace} />
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 text-center">
            <p className="text-sm text-zinc-500">
              Trace data not available for this run (recorded before v24A).
            </p>
          </div>
        )}
      </div>

      {/* Trajectory enrichment */}
      {trajectory && (
        <TrajectoryDetail trajectory={trajectory} distillation={distillation} />
      )}

      {/* Related Actions */}
      <Section title="Related Actions">
        {relatedActions.length > 0 ? (
          <div className="space-y-2">
            {relatedActions.map((a) => (
              <ActionRow
                key={a.id}
                action={a}
                executions={executionsByProposal.get(a.id) ?? []}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-600">No actions for this run.</p>
        )}
      </Section>
    </div>
  );
}

function dedupeActions(actions: ActionProposal[]): ActionProposal[] {
  const seen = new Set<string>();
  const out: ActionProposal[] = [];
  for (const a of actions) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    out.push(a);
  }
  return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      {children}
    </div>
  );
}

const SOURCE_COLORS: Record<string, string> = {
  cli: "bg-zinc-700/50 text-zinc-300",
  whatsapp: "bg-green-900/50 text-green-300",
  omi: "bg-violet-900/50 text-violet-300",
  dashboard: "bg-blue-900/50 text-blue-300",
  unknown: "bg-zinc-800 text-zinc-500",
};

function SourceBadge({ source }: { source: string | null }) {
  const label = source ?? "unknown";
  const color = SOURCE_COLORS[label] ?? SOURCE_COLORS.unknown;
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

function TrajectoryDetail({
  trajectory,
  distillation,
}: {
  trajectory: Trajectory;
  distillation: DistillationResult | null;
}) {
  return (
    <div className="space-y-6">
      {/* Quality */}
      <Section title="Quality">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-zinc-500">Judge: </span>
              {trajectory.judgeScore != null ? (
                <span className="font-mono text-zinc-300">{trajectory.judgeScore}</span>
              ) : (
                <span className="text-zinc-600">—</span>
              )}
            </div>
            <div>
              <span className="text-zinc-500">Outcome: </span>
              <OutcomePill outcome={trajectory.outcome} />
            </div>
            <div>
              <span className="text-zinc-500">Approval: </span>
              <ApprovalPill approval={trajectory.approvalStatus} />
            </div>
            {distillation && (
              <div>
                <span className="text-zinc-500">Tier: </span>
                <TierPill tier={distillation.tier} />
              </div>
            )}
          </div>
          {distillation && distillation.reasons.length > 0 && (
            <p className="mt-2 text-xs text-zinc-500">
              {distillation.reasons.join(" · ")}
            </p>
          )}
        </div>
      </Section>

      {/* Trajectory ID + Duration */}
      <Section title="Trajectory">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="text-zinc-500">ID: </span>
            <code className="text-xs font-mono text-zinc-400">{trajectory.id}</code>
          </div>
          <div>
            <span className="text-zinc-500">Duration: </span>
            <span className="text-zinc-300">{formatMs(trajectory.durationMs)}</span>
          </div>
          <div>
            <span className="text-zinc-500">Parse: </span>
            <span className={trajectory.result.parseSuccess ? "text-green-400" : "text-red-400"}>
              {trajectory.result.parseSuccess ? "success" : "failed"}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Output: </span>
            <span className="text-zinc-300">{trajectory.result.rawLength.toLocaleString()} chars</span>
          </div>
        </div>
      </Section>

      {/* Provider Calls */}
      <Section title="Provider Calls">
        {trajectory.providerCalls.length > 0 ? (
          <div className="space-y-2">
            {trajectory.providerCalls.map((call, i) => (
              <div
                key={i}
                className="flex flex-wrap gap-x-4 gap-y-1 rounded border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm"
              >
                <div>
                  <span className="text-zinc-500">Provider: </span>
                  <span className="text-zinc-300">{call.provider}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Model: </span>
                  <span className="font-mono text-xs text-zinc-300">{call.model}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Tokens: </span>
                  <span className="text-zinc-300">
                    {call.inputTokens != null ? call.inputTokens.toLocaleString() : "—"} in
                    {" / "}
                    {call.outputTokens != null ? call.outputTokens.toLocaleString() : "—"} out
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Duration: </span>
                  <span className="text-zinc-300">{formatMs(call.durationMs)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-600">No provider data recorded.</p>
        )}
      </Section>

      {/* Errors */}
      {trajectory.errors.length > 0 && (
        <Section title="Errors">
          <div className="space-y-2">
            {trajectory.errors.map((err, i) => (
              <div
                key={i}
                className="rounded border border-red-900/50 bg-red-900/10 px-4 py-3 text-sm"
              >
                <span className="text-red-400">[{err.phase}]</span>{" "}
                <span className="text-zinc-300">{err.message}</span>
                <p className="mt-1 text-xs text-zinc-600">{err.timestamp}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

    </div>
  );
}

const TIER_COLORS: Record<string, string> = {
  trusted: "bg-green-900/50 text-green-300",
  usable: "bg-blue-900/50 text-blue-300",
  weak: "bg-amber-900/50 text-amber-300",
  unusable: "bg-zinc-800 text-zinc-500",
};

const OUTCOME_COLORS: Record<string, string> = {
  completed: "bg-green-900/50 text-green-300",
  merged: "bg-green-900/50 text-green-300",
  partial: "bg-amber-900/50 text-amber-300",
  rejected: "bg-red-900/50 text-red-300",
  reverted: "bg-red-900/50 text-red-300",
  ci_failed: "bg-red-900/50 text-red-300",
};

const APPROVAL_COLORS: Record<string, string> = {
  approved: "bg-green-900/50 text-green-300",
  pending: "bg-amber-900/50 text-amber-300",
  auto: "bg-zinc-700/50 text-zinc-300",
  rejected: "bg-red-900/50 text-red-300",
};

const RISK_COLORS: Record<string, string> = {
  safe: "bg-green-900/50 text-green-300",
  "review-required": "bg-amber-900/50 text-amber-300",
  forbidden: "bg-red-900/50 text-red-300",
};

const ACTION_STATUS_COLORS: Record<string, string> = {
  proposed: "bg-zinc-700/50 text-zinc-300",
  classified: "bg-zinc-700/50 text-zinc-300",
  "pending-approval": "bg-amber-900/50 text-amber-300",
  approved: "bg-green-900/50 text-green-300",
  executed: "bg-green-900/50 text-green-300",
  rejected: "bg-red-900/50 text-red-300",
  failed: "bg-red-900/50 text-red-300",
  expired: "bg-zinc-800 text-zinc-500",
};

const EXEC_OUTCOME_COLORS: Record<string, string> = {
  success: "bg-green-900/50 text-green-300",
  failure: "bg-red-900/50 text-red-300",
  "dry-run": "bg-blue-900/50 text-blue-300",
  deferred: "bg-amber-900/50 text-amber-300",
  blocked: "bg-red-900/50 text-red-300",
};

const EXEC_HISTORY_LIMIT = 3;

function execFormatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

function truncateMessage(message: string, max = 180): string {
  if (message.length <= max) return message;
  return message.slice(0, max) + "…";
}

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function OutcomePill({ outcome }: { outcome: OutcomeStatus }) {
  if (outcome == null) return <span className="text-zinc-600">—</span>;
  return <Pill label={outcome} className={OUTCOME_COLORS[outcome] ?? "bg-zinc-800 text-zinc-400"} />;
}

function ApprovalPill({ approval }: { approval: ApprovalStatus }) {
  if (approval == null) return <span className="text-zinc-600">—</span>;
  return <Pill label={approval} className={APPROVAL_COLORS[approval] ?? "bg-zinc-800 text-zinc-400"} />;
}

function TierPill({ tier }: { tier: string }) {
  return <Pill label={tier} className={TIER_COLORS[tier] ?? "bg-zinc-800 text-zinc-400"} />;
}

function ActionRow({
  action,
  executions,
}: {
  action: ActionProposal;
  executions: ExecutionResult[];
}) {
  const shown = executions.slice(0, EXEC_HISTORY_LIMIT);
  const extra = executions.length - shown.length;

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Pill
          label={action.category}
          className="bg-zinc-700/50 text-zinc-300"
        />
        <Pill
          label={action.riskLevel}
          className={RISK_COLORS[action.riskLevel] ?? "bg-zinc-800 text-zinc-400"}
        />
        <Pill
          label={action.status}
          className={ACTION_STATUS_COLORS[action.status] ?? "bg-zinc-800 text-zinc-400"}
        />
        <span className="text-xs text-zinc-500">{formatTimestamp(action.createdAt)}</span>
      </div>
      <p className="mt-2 text-sm text-zinc-300">{action.title}</p>
      {action.description && (
        <p className="mt-1 text-xs text-zinc-500">{action.description}</p>
      )}

      <div className="mt-3 border-t border-zinc-800 pt-2">
        <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">
          Execution History
        </p>
        {shown.length === 0 ? (
          <p className="text-xs text-zinc-600">No executions recorded.</p>
        ) : (
          <div className="space-y-1.5">
            {shown.map((r) => (
              <div key={r.id} className="text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill
                    label={r.outcome}
                    className={EXEC_OUTCOME_COLORS[r.outcome] ?? "bg-zinc-800 text-zinc-400"}
                  />
                  <span className="text-zinc-400">{execFormatMs(r.durationMs)}</span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-zinc-400">{r.actor}</span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-zinc-500">{formatTimestamp(r.finishedAt)}</span>
                </div>
                {r.message && (
                  <p className="mt-0.5 text-zinc-500">{truncateMessage(r.message)}</p>
                )}
              </div>
            ))}
            {extra > 0 && (
              <p className="text-xs text-zinc-600">+{extra} earlier execution{extra === 1 ? "" : "s"}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
