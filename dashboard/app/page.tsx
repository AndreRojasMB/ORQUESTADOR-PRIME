import { readMemoryStore, getRecentEntries, readConfig, getTrajectories } from "@/lib/data";
import { Card } from "@/components/Card";
import { RunTable } from "@/components/RunTable";

function relativeTime(iso: string): string {
  try {
    const ms = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(ms / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return "unknown";
  }
}

export default async function OverviewPage() {
  const [store, recent, config, trajectories] = await Promise.all([
    readMemoryStore(),
    getRecentEntries(5),
    readConfig(),
    getTrajectories(),
  ]);

  const totalRuns = store.entries.length;
  const lastRun = store.lastRun ? relativeTime(store.lastRun) : "never";
  const activeModes = new Set(store.entries.map((e) => e.type)).size;

  const sourceBreakdown: Record<string, number> = {};
  for (const t of trajectories) {
    const key = t.source ?? "unknown";
    sourceBreakdown[key] = (sourceBreakdown[key] ?? 0) + 1;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-zinc-400">
          System status and recent activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Card label="Total Runs" value={totalRuns} />
        <Card label="Last Run" value={lastRun} />
        <Card label="Agents" value={13} sub="registered" />
        <Card label="Active Modes" value={activeModes} sub={`of 5 available`} />
        <Card
          label="Trajectories"
          value={trajectories.length}
          sub={
            Object.keys(sourceBreakdown).length > 0
              ? Object.entries(sourceBreakdown)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ")
              : "none recorded"
          }
        />
      </div>

      {/* Status row */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Status
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <StatusDot label="WhatsApp" active={config.whatsapp.enabled} />
        </div>
      </div>

      {/* Recent runs */}
      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Recent Runs
        </h2>
        <RunTable entries={recent} compact />
      </div>
    </div>
  );
}

function StatusDot({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          active ? "bg-green-500" : "bg-zinc-600"
        }`}
      />
      <span className="text-zinc-300">{label}</span>
      <span className="text-xs text-zinc-600">
        {active ? "enabled" : "disabled"}
      </span>
    </div>
  );
}
