import Link from "next/link";
import {
  getChannelAuditEntries,
  getDashboardChannelAuditStats,
} from "@/lib/data";
import { Card } from "@/components/Card";
import type {
  ChannelAuditDecision,
  ChannelAuditEntry,
  ChannelAuditReasonCode,
  ChannelKind,
  ChannelOperation,
} from "@/lib/types";

type SearchParams = Promise<{
  channel?: string | string[];
  decision?: string | string[];
  operation?: string | string[];
  reason?: string | string[];
}>;

const CHANNEL_VALUES: ChannelKind[] = [
  "whatsapp",
  "omi",
  "dashboard",
  "openclaw",
  "api",
  "cli",
  "system",
];

const DECISION_VALUES: ChannelAuditDecision[] = ["allowed", "blocked"];

const OPERATION_VALUES: ChannelOperation[] = [
  "create-proposal",
  "request-review",
  "list-pending",
  "grant-second-approval",
  "dispatch-approved",
];

const REASON_VALUES: ChannelAuditReasonCode[] = [
  "allowed",
  "unknown-channel",
  "missing-identity",
  "untrusted-identity",
  "permission-denied",
  "operation-not-allowed",
  "category-not-allowed",
  "forbidden-category",
  "rate-limit-exceeded",
  "malformed-request",
  "duplicate-source-event",
  "proposal-not-found",
  "proposal-not-approved",
  "second-approval-missing",
  "second-approval-expired",
  "second-approval-parameter-drift",
  "real-execution-disabled",
  "real-execution-category-not-allowlisted",
  "prior-successful-execution",
  "audit-store-write-failed",
  "unknown-error",
];

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: "bg-green-900/50 text-green-300",
  omi: "bg-violet-900/50 text-violet-300",
  dashboard: "bg-blue-900/50 text-blue-300",
  openclaw: "bg-cyan-900/50 text-cyan-300",
  api: "bg-purple-900/50 text-purple-300",
  cli: "bg-zinc-700/50 text-zinc-300",
  system: "bg-zinc-800 text-zinc-400",
};

const DECISION_COLORS: Record<ChannelAuditDecision, string> = {
  allowed: "bg-green-900/50 text-green-300",
  blocked: "bg-red-900/50 text-red-300",
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
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

function truncate(value: string | null, max = 14): string {
  if (!value) return "-";
  return value.length <= max ? value : value.slice(0, max) + "...";
}

function truncateReason(value: string, max = 96): string {
  if (!value) return "-";
  return value.length <= max ? value : value.slice(0, max) + "...";
}

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export default async function ChannelAuditPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const channelFilter = firstParam(sp.channel);
  const decisionFilter = firstParam(sp.decision);
  const operationFilter = firstParam(sp.operation);
  const reasonFilter = firstParam(sp.reason);

  const [entries, stats] = await Promise.all([
    getChannelAuditEntries(),
    getDashboardChannelAuditStats(),
  ]);

  const filtered = entries.filter((entry) => {
    if (channelFilter && channelFilter !== "all" && entry.channel !== channelFilter) return false;
    if (decisionFilter && decisionFilter !== "all" && entry.decision !== decisionFilter) return false;
    if (operationFilter && operationFilter !== "all" && entry.operation !== operationFilter) return false;
    if (reasonFilter && reasonFilter !== "all" && entry.reasonCode !== reasonFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) =>
    a.timestamp < b.timestamp ? 1 : -1,
  );
  const uniqueChannels = new Set(entries.map((entry) => entry.channel)).size;
  const recentBlocked = entries
    .filter((entry) => entry.decision === "blocked")
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Channel Audit</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Read-only external channel decisions ({entries.length} total
          {filtered.length !== entries.length ? `, ${filtered.length} shown` : ""}).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card label="Decisions" value={stats.total} />
        <Card label="Allowed" value={stats.allowed} />
        <Card label="Blocked" value={stats.blocked} />
        <Card label="Channels" value={uniqueChannels} />
        <Card label="Recent Blocks" value={recentBlocked.length} />
      </div>

      <form
        method="GET"
        className="flex flex-wrap items-end gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4"
      >
        <FilterSelect label="Channel" name="channel" value={channelFilter} values={CHANNEL_VALUES} />
        <FilterSelect label="Decision" name="decision" value={decisionFilter} values={DECISION_VALUES} />
        <FilterSelect label="Operation" name="operation" value={operationFilter} values={OPERATION_VALUES} />
        <FilterSelect label="Reason" name="reason" value={reasonFilter} values={REASON_VALUES} />
        <button
          type="submit"
          className="rounded bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700"
        >
          Apply
        </button>
        {(channelFilter || decisionFilter || operationFilter || reasonFilter) && (
          <Link href="/channel-audit" className="text-xs text-zinc-500 hover:text-zinc-300">
            Clear
          </Link>
        )}
      </form>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Recent Blocked Decisions
        </h2>
        {recentBlocked.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-center">
            <p className="text-sm text-zinc-500">No blocked channel decisions recorded.</p>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {recentBlocked.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill label={entry.channel} className={CHANNEL_COLORS[entry.channel] ?? "bg-zinc-800 text-zinc-400"} />
                  <Pill label={entry.reasonCode} className="bg-red-900/50 text-red-300" />
                  <span className="text-xs text-zinc-500">{formatTime(entry.timestamp)}</span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">{truncateReason(entry.reason)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {sorted.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-sm text-zinc-500">
            {entries.length === 0
              ? "No channel audit entries recorded yet."
              : "No channel audit entries match these filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Decision</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Operation</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Principal Hash</th>
                <th className="px-4 py-3">Trusted</th>
                <th className="px-4 py-3">Auth</th>
                <th className="px-4 py-3">Proposal</th>
                <th className="px-4 py-3">Source Event</th>
                <th className="px-4 py-3">Correlation</th>
                <th className="px-4 py-3">Run</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {sorted.map((entry) => (
                <AuditRow key={entry.id} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  name,
  value,
  values,
}: {
  label: string;
  name: string;
  value: string | undefined;
  values: readonly string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      <select
        name={name}
        defaultValue={value ?? "all"}
        className="rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-200"
      >
        <option value="all">all</option>
        {values.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

function AuditRow({ entry }: { entry: ChannelAuditEntry }) {
  return (
    <tr className="transition-colors hover:bg-zinc-900/50">
      <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">
        {formatTime(entry.timestamp)}
      </td>
      <td className="px-4 py-3">
        <Pill label={entry.decision} className={DECISION_COLORS[entry.decision]} />
      </td>
      <td className="px-4 py-3">
        <Pill label={entry.channel} className={CHANNEL_COLORS[entry.channel] ?? "bg-zinc-800 text-zinc-400"} />
      </td>
      <td className="px-4 py-3 text-xs text-zinc-300">{entry.operation}</td>
      <td className="px-4 py-3">
        <div className="text-xs text-zinc-300">{entry.reasonCode}</div>
        <div className="mt-1 max-w-xs text-xs text-zinc-600">{truncateReason(entry.reason)}</div>
      </td>
      <td className="px-4 py-3 text-xs text-zinc-400">{entry.category ?? "-"}</td>
      <td className="px-4 py-3 font-mono text-xs text-zinc-500">
        {truncate(entry.principalHash, 18)}
      </td>
      <td className="px-4 py-3 text-xs">
        <span className={entry.trusted ? "text-green-400" : "text-red-400"}>
          {entry.trusted ? "yes" : "no"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-zinc-400">{entry.authMethod}</td>
      <td className="px-4 py-3 font-mono text-xs text-zinc-500">
        {truncate(entry.proposalId)}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-zinc-500">
        {truncate(entry.sourceEventId)}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-zinc-500">
        {truncate(entry.correlationId)}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-zinc-500">
        {truncate(entry.runId)}
      </td>
    </tr>
  );
}
