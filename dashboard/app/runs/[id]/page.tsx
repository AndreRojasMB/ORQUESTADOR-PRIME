import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntryById } from "@/lib/data";
import { Badge } from "@/components/Badge";
import { PhaseTimeline } from "@/components/PhaseTimeline";

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
