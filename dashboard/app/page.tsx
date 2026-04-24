import {
  readMemoryStore,
  getRecentEntries,
  readConfig,
  getTrajectories,
  getActions,
  getExecutionResults,
} from "@/lib/data";
import { classifyForDistillation } from "@/lib/distillation";
import { Card } from "@/components/Card";
import { RunTable } from "@/components/RunTable";
import type { DistillationTier } from "@/lib/types";

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

const TIER_PILL: Record<DistillationTier, string> = {
  trusted: "bg-green-900/50 text-green-300",
  usable: "bg-blue-900/50 text-blue-300",
  weak: "bg-amber-900/50 text-amber-300",
  unusable: "bg-zinc-800 text-zinc-500",
};

export default async function OverviewPage() {
  const [store, recent, config, trajectories, actions, executions] = await Promise.all([
    readMemoryStore(),
    getRecentEntries(5),
    readConfig(),
    getTrajectories(),
    getActions(),
    getExecutionResults(),
  ]);

  const dispatchTotal = executions.length;
  let dispatchSuccess = 0;
  let dispatchDryRun = 0;
  let dispatchFailOrBlocked = 0;
  let dispatchDeferred = 0;
  for (const r of executions) {
    if (r.outcome === "success") dispatchSuccess++;
    else if (r.outcome === "dry-run") dispatchDryRun++;
    else if (r.outcome === "failure" || r.outcome === "blocked") dispatchFailOrBlocked++;
    else if (r.outcome === "deferred") dispatchDeferred++;
  }

  const totalRuns = store.entries.length;
  const lastRun = store.lastRun ? relativeTime(store.lastRun) : "never";
  const activeModes = new Set(store.entries.map((e) => e.type)).size;

  const sourceBreakdown: Record<string, number> = {};
  const tierCounts: Record<DistillationTier, number> = {
    trusted: 0,
    usable: 0,
    weak: 0,
    unusable: 0,
  };

  let scoreSum = 0;
  let scoreCount = 0;
  let completedCount = 0;

  for (const t of trajectories) {
    const key = t.source ?? "unknown";
    sourceBreakdown[key] = (sourceBreakdown[key] ?? 0) + 1;

    const tier = classifyForDistillation(t).tier;
    tierCounts[tier]++;

    if (t.judgeScore != null) {
      scoreSum += t.judgeScore;
      scoreCount++;
    }
    if (t.outcome === "completed" || t.outcome === "merged") {
      completedCount++;
    }
  }

  const totalTrajectories = trajectories.length;
  const avgJudge =
    scoreCount > 0 ? (scoreSum / scoreCount).toFixed(1) : "—";
  const successRate =
    totalTrajectories > 0
      ? `${Math.round((completedCount / totalTrajectories) * 100)}%`
      : "—";
  const pendingApprovals = actions.filter(
    (a) => a.status === "pending-approval",
  ).length;

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
          value={totalTrajectories}
          sub={
            Object.keys(sourceBreakdown).length > 0
              ? Object.entries(sourceBreakdown)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ")
              : "none recorded"
          }
        />
        <Card
          label="Success Rate"
          value={successRate}
          sub={`${completedCount} / ${totalTrajectories || 0} completed`}
        />
        <Card
          label="Avg Judge Score"
          value={avgJudge}
          sub={scoreCount > 0 ? `across ${scoreCount} scored` : "no scores yet"}
        />
        <Card
          label="Trusted"
          value={tierCounts.trusted}
          sub="distillation-ready"
        />
        <Card
          label="Pending Approvals"
          value={pendingApprovals}
          sub={actions.length > 0 ? `of ${actions.length} actions` : "no actions"}
        />
        <Card
          label="Dispatches"
          value={dispatchTotal}
          sub={dispatchTotal > 0 ? `${dispatchSuccess} success` : "none recorded"}
        />
        <Card
          label="Dry-runs"
          value={dispatchDryRun}
          sub="tool-invoke dry-runs"
        />
        <Card
          label="Failed/Blocked"
          value={dispatchFailOrBlocked}
          sub={`deferred: ${dispatchDeferred}`}
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

      {/* Distillation breakdown */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Distillation
        </p>
        {totalTrajectories > 0 ? (
          <div className="flex flex-wrap gap-2 text-sm">
            {(Object.keys(tierCounts) as DistillationTier[]).map((tier) => (
              <span
                key={tier}
                className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${TIER_PILL[tier]}`}
              >
                {tier} {tierCounts[tier]}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No trajectories yet.</p>
        )}
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
