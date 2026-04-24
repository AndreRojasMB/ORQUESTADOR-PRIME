import Link from "next/link";
import { Badge } from "./Badge";
import type {
  MemoryEntry,
  Trajectory,
  DistillationTier,
  OutcomeStatus,
  ApprovalStatus,
} from "@/lib/types";

interface RunTableProps {
  entries: MemoryEntry[];
  compact?: boolean;
  trajectoryMap?: Map<string, Trajectory>;
  tierMap?: Map<string, DistillationTier>;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

const SOURCE_COLORS: Record<string, string> = {
  cli: "bg-zinc-700/50 text-zinc-300",
  whatsapp: "bg-green-900/50 text-green-300",
  omi: "bg-violet-900/50 text-violet-300",
  dashboard: "bg-blue-900/50 text-blue-300",
  unknown: "bg-zinc-800 text-zinc-500",
};

const TIER_COLORS: Record<DistillationTier, string> = {
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

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function Dash() {
  return <span className="text-xs text-zinc-600">—</span>;
}

function OutcomePill({ outcome }: { outcome: OutcomeStatus }) {
  if (outcome == null) return <Dash />;
  return <Pill label={outcome} className={OUTCOME_COLORS[outcome] ?? "bg-zinc-800 text-zinc-400"} />;
}

function ApprovalPill({ approval }: { approval: ApprovalStatus }) {
  if (approval == null) return <Dash />;
  return <Pill label={approval} className={APPROVAL_COLORS[approval] ?? "bg-zinc-800 text-zinc-400"} />;
}

function TierPill({ tier }: { tier: DistillationTier | undefined }) {
  if (!tier) return <Dash />;
  return <Pill label={tier} className={TIER_COLORS[tier]} />;
}

export function RunTable({ entries, compact = false, trajectoryMap, tierMap }: RunTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
        <p className="text-sm text-zinc-500">No runs recorded yet.</p>
        <p className="mt-1 text-xs text-zinc-600">
          Run{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-zinc-400">
            npm run plan -- &apos;your task&apos;
          </code>{" "}
          to get started.
        </p>
      </div>
    );
  }

  const showEnriched = !compact && trajectoryMap != null;

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-xs uppercase tracking-wider text-zinc-500">
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Mode</th>
            <th className="px-4 py-3">Task</th>
            {showEnriched && <th className="px-4 py-3">Source</th>}
            {showEnriched && <th className="px-4 py-3">Judge</th>}
            {showEnriched && <th className="px-4 py-3">Outcome</th>}
            {showEnriched && <th className="px-4 py-3">Tier</th>}
            {showEnriched && <th className="px-4 py-3">Approval</th>}
            {!compact && <th className="px-4 py-3">Agents</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {entries.map((entry) => {
            const traj = trajectoryMap?.get(entry.traceId);
            const source = traj?.source ?? "unknown";
            const sourceColor = SOURCE_COLORS[source] ?? SOURCE_COLORS.unknown;
            const tier = tierMap?.get(entry.traceId);
            return (
              <tr
                key={entry.id}
                className="transition-colors hover:bg-zinc-900/50"
              >
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">
                  <Link href={`/runs/${entry.id}`} className="hover:text-zinc-200">
                    {formatTime(entry.timestamp)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/runs/${entry.id}`}>
                    <Badge variant="mode">{entry.type}</Badge>
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  <Link
                    href={`/runs/${entry.id}`}
                    className="hover:text-zinc-100"
                  >
                    {truncate(entry.task || "(no task)", compact ? 50 : 70)}
                  </Link>
                </td>
                {showEnriched && (
                  <td className="px-4 py-3">
                    <Pill label={source} className={sourceColor} />
                  </td>
                )}
                {showEnriched && (
                  <td className="px-4 py-3">
                    {traj?.judgeScore != null ? (
                      <span className="font-mono text-xs text-zinc-300">
                        {traj.judgeScore}
                      </span>
                    ) : (
                      <Dash />
                    )}
                  </td>
                )}
                {showEnriched && (
                  <td className="px-4 py-3">
                    <OutcomePill outcome={traj?.outcome ?? null} />
                  </td>
                )}
                {showEnriched && (
                  <td className="px-4 py-3">
                    <TierPill tier={tier} />
                  </td>
                )}
                {showEnriched && (
                  <td className="px-4 py-3">
                    <ApprovalPill approval={traj?.approvalStatus ?? null} />
                  </td>
                )}
                {!compact && (
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {entry.agents.length > 0
                      ? truncate(entry.agents.join(", "), 40)
                      : "-"}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
