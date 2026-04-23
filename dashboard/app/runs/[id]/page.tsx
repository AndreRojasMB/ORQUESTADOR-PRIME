import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntryById, getTrajectoryByTraceId } from "@/lib/data";
import { Badge } from "@/components/Badge";
import { PhaseTimeline } from "@/components/PhaseTimeline";
import type { Trajectory } from "@/lib/types";

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
      {trajectory && <TrajectoryDetail trajectory={trajectory} />}
    </div>
  );
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

function TrajectoryDetail({ trajectory }: { trajectory: Trajectory }) {
  return (
    <div className="space-y-6">
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

      {/* Approval / Outcome / Judge */}
      {(trajectory.approvalStatus != null ||
        trajectory.outcome != null ||
        trajectory.judgeScore != null) && (
        <Section title="Status">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {trajectory.approvalStatus != null && (
              <div>
                <span className="text-zinc-500">Approval: </span>
                <span className="text-zinc-300">{trajectory.approvalStatus}</span>
              </div>
            )}
            {trajectory.outcome != null && (
              <div>
                <span className="text-zinc-500">Outcome: </span>
                <span className="text-zinc-300">{trajectory.outcome}</span>
              </div>
            )}
            {trajectory.judgeScore != null && (
              <div>
                <span className="text-zinc-500">Judge Score: </span>
                <span className="text-zinc-300">{trajectory.judgeScore}</span>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}
