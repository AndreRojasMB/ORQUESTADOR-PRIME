import type { TraceRecord } from "@/lib/types";
import { Badge } from "./Badge";

interface PhaseTimelineProps {
  trace: TraceRecord;
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
}

export function PhaseTimeline({ trace }: PhaseTimelineProps) {
  const maxMs = Math.max(...trace.phases.map((p) => p.durationMs), 1);

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div>
          <span className="text-zinc-500">Total: </span>
          <span className="font-mono text-zinc-200">{formatMs(trace.totalMs)}</span>
        </div>
        <div>
          <span className="text-zinc-500">Parse: </span>
          <span className={trace.parseSuccess ? "text-green-400" : "text-red-400"}>
            {trace.parseSuccess ? "success" : "failed"}
          </span>
        </div>
        {trace.parseError && (
          <div className="text-xs text-red-400/70">{trace.parseError}</div>
        )}
      </div>

      {/* Provider info */}
      {trace.provider && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Provider
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <Badge variant="domain">{trace.provider.provider}</Badge>
            </div>
            <div>
              <span className="text-zinc-500">Model: </span>
              <span className="font-mono text-zinc-300">{trace.provider.model}</span>
            </div>
            {trace.provider.inputTokens != null && (
              <div>
                <span className="text-zinc-500">Tokens: </span>
                <span className="font-mono text-zinc-300">
                  {trace.provider.inputTokens} in / {trace.provider.outputTokens ?? 0} out
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase bars */}
      {trace.phases.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Phases
          </p>
          <div className="space-y-2">
            {trace.phases.map((phase, i) => {
              const widthPct = Math.max((phase.durationMs / maxMs) * 100, 2);
              return (
                <div key={`${phase.phase}-${i}`} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 truncate text-xs font-mono text-zinc-400">
                    {phase.phase}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-5 rounded bg-blue-900/40"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-xs font-mono text-zinc-500">
                    {formatMs(phase.durationMs)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
