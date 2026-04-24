import Link from "next/link";
import {
  getActions,
  getExecutionResults,
  getSecondApprovals,
  getRealExecutionEnabled,
} from "@/lib/data";
import type {
  ActionProposal,
  ActionStatus,
  ActionCategory,
  ActionRiskLevel,
  ExecutionOutcome,
  ExecutionResult,
  SecondApproval,
  SecondApprovalStatus,
} from "@/lib/types";

type SearchParams = Promise<{
  status?: string | string[];
  risk?: string | string[];
  exec?: string | string[];
}>;

const EXEC_VALUES: Array<ExecutionOutcome | "none"> = [
  "success",
  "failure",
  "dry-run",
  "deferred",
  "blocked",
  "none",
];

const EXEC_COLORS: Record<string, string> = {
  success: "bg-green-900/50 text-green-300",
  failure: "bg-red-900/50 text-red-300",
  "dry-run": "bg-blue-900/50 text-blue-300",
  deferred: "bg-amber-900/50 text-amber-300",
  blocked: "bg-red-900/50 text-red-300",
};

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

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

function buildExecutionMap(results: ExecutionResult[]): Map<string, ExecutionResult[]> {
  const map = new Map<string, ExecutionResult[]>();
  for (const r of results) {
    const arr = map.get(r.proposalId);
    if (arr) arr.push(r);
    else map.set(r.proposalId, [r]);
  }
  // Newest first within each bucket.
  for (const arr of map.values()) {
    arr.sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1));
  }
  return map;
}

const PREVIEW_CATEGORIES = new Set<ActionCategory>([
  "file-write",
  "git-branch",
  "pr-create",
]);

const APPROVAL_COLORS: Record<SecondApprovalStatus, string> = {
  granted: "bg-green-900/50 text-green-300",
  consumed: "bg-zinc-700/50 text-zinc-300",
  expired: "bg-amber-900/50 text-amber-300",
  revoked: "bg-red-900/50 text-red-300",
};

type EffectiveApprovalStatus = SecondApprovalStatus | "active";

function effectiveApprovalStatus(
  a: SecondApproval,
  now: number,
): EffectiveApprovalStatus {
  if (a.status === "granted" && Date.parse(a.expiresAt) > now) return "active";
  if (a.status === "granted" && Date.parse(a.expiresAt) <= now) return "expired";
  return a.status;
}

function formatTimeLeft(iso: string, now: number): string {
  const ms = Date.parse(iso) - now;
  if (!Number.isFinite(ms) || ms <= 0) return "0s";
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins >= 1) return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  return `${secs}s`;
}

function buildApprovalMap(approvals: SecondApproval[]): Map<string, SecondApproval[]> {
  const map = new Map<string, SecondApproval[]>();
  for (const a of approvals) {
    const arr = map.get(a.proposalId);
    if (arr) arr.push(a);
    else map.set(a.proposalId, [a]);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => (a.grantedAt < b.grantedAt ? 1 : -1));
  }
  return map;
}

function truncateHash(hash: string, max = 12): string {
  if (!hash) return "";
  return hash.length <= max ? hash : hash.slice(0, max) + "…";
}

const STATUS_VALUES: ActionStatus[] = [
  "proposed",
  "classified",
  "pending-approval",
  "approved",
  "rejected",
  "expired",
  "executed",
  "failed",
];

const RISK_VALUES: ActionRiskLevel[] = ["safe", "review-required", "forbidden"];

const STATUS_COLORS: Record<string, string> = {
  proposed: "bg-zinc-700/50 text-zinc-300",
  classified: "bg-zinc-700/50 text-zinc-300",
  "pending-approval": "bg-amber-900/50 text-amber-300",
  approved: "bg-green-900/50 text-green-300",
  executed: "bg-green-900/50 text-green-300",
  rejected: "bg-red-900/50 text-red-300",
  failed: "bg-red-900/50 text-red-300",
  expired: "bg-zinc-800 text-zinc-500",
};

const RISK_COLORS: Record<string, string> = {
  safe: "bg-green-900/50 text-green-300",
  "review-required": "bg-amber-900/50 text-amber-300",
  forbidden: "bg-red-900/50 text-red-300",
};

const SOURCE_COLORS: Record<string, string> = {
  cli: "bg-zinc-700/50 text-zinc-300",
  whatsapp: "bg-green-900/50 text-green-300",
  omi: "bg-violet-900/50 text-violet-300",
  dashboard: "bg-blue-900/50 text-blue-300",
  openclaw: "bg-cyan-900/50 text-cyan-300",
  system: "bg-zinc-800 text-zinc-400",
};

function firstParam(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
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

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export default async function ActionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const statusFilter = firstParam(sp.status);
  const riskFilter = firstParam(sp.risk);
  const execFilter = firstParam(sp.exec);

  const [allActions, allExecutions, allApprovals] = await Promise.all([
    getActions(),
    getExecutionResults(),
    getSecondApprovals(),
  ]);

  const execMap = buildExecutionMap(allExecutions);
  const approvalMap = buildApprovalMap(allApprovals);
  const now = Date.now();
  const realExecutionEnabled = getRealExecutionEnabled();

  const filtered = allActions.filter((a) => {
    if (statusFilter && statusFilter !== "all" && a.status !== statusFilter) return false;
    if (riskFilter && riskFilter !== "all" && a.riskLevel !== riskFilter) return false;
    if (execFilter && execFilter !== "all") {
      const runs = execMap.get(a.id) ?? [];
      if (execFilter === "none") {
        if (runs.length > 0) return false;
      } else {
        if (!runs.some((r) => r.outcome === execFilter)) return false;
      }
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Actions</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Action proposals ({allActions.length} total
          {filtered.length !== allActions.length
            ? `, ${filtered.length} shown`
            : ""}
          ).
        </p>
      </div>

      {/* Real-execution banner — advisory only; dashboard cannot trigger dispatch */}
      <div
        className={`rounded-lg border px-4 py-2 text-xs ${
          realExecutionEnabled
            ? "border-amber-900/60 bg-amber-950/30 text-amber-300"
            : "border-zinc-800 bg-zinc-900/60 text-zinc-400"
        }`}
      >
        {realExecutionEnabled ? (
          <>
            Real execution: <span className="font-medium text-amber-300">ENABLED</span> as
            this dashboard sees it. Dispatch still requires the CLI and a valid second approval.
          </>
        ) : (
          <>
            Real execution: <span className="font-medium text-zinc-300">disabled</span>{" "}
            (ACTIONS_REAL_EXECUTION_ENABLED=false). Previews and approvals are advisory only.
          </>
        )}
      </div>

      {/* Filters */}
      <form
        method="GET"
        className="flex flex-wrap items-end gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4"
      >
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">
            Status
          </label>
          <select
            name="status"
            defaultValue={statusFilter ?? "all"}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-200"
          >
            <option value="all">all</option>
            {STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">
            Risk
          </label>
          <select
            name="risk"
            defaultValue={riskFilter ?? "all"}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-200"
          >
            <option value="all">all</option>
            {RISK_VALUES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">
            Execution
          </label>
          <select
            name="exec"
            defaultValue={execFilter ?? "all"}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-200"
          >
            <option value="all">all</option>
            {EXEC_VALUES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700"
        >
          Apply
        </button>
        {(statusFilter || riskFilter || execFilter) && (
          <Link
            href="/actions"
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-sm text-zinc-500">
            {allActions.length === 0
              ? "No action proposals recorded yet."
              : "No actions match these filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Dispatches</th>
                <th className="px-4 py-3">Last Outcome</th>
                <th className="px-4 py-3">Last Run</th>
                <th className="px-4 py-3">2nd Approval</th>
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Title</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {sorted.map((a) => (
                <ActionRow
                  key={a.id}
                  action={a}
                  executions={execMap.get(a.id) ?? []}
                  approvals={approvalMap.get(a.id) ?? []}
                  now={now}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Second Approvals — read-only summary */}
      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Recent Second Approvals
        </h2>
        {allApprovals.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-center">
            <p className="text-sm text-zinc-500">None recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">Granted</th>
                  <th className="px-4 py-3">Proposal</th>
                  <th className="px-4 py-3">Granted By</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expires / Resolved</th>
                  <th className="px-4 py-3">Param Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {[...allApprovals]
                  .sort((a, b) => (a.grantedAt < b.grantedAt ? 1 : -1))
                  .slice(0, 5)
                  .map((a) => {
                    const eff = effectiveApprovalStatus(a, now);
                    const pillColor =
                      eff === "active"
                        ? APPROVAL_COLORS.granted
                        : APPROVAL_COLORS[eff];
                    const label =
                      eff === "active"
                        ? `active · ${formatTimeLeft(a.expiresAt, now)} left`
                        : eff;
                    const resolved =
                      a.consumedAt
                        ? `consumed ${formatTime(a.consumedAt)}`
                        : a.revokedAt
                          ? `revoked ${formatTime(a.revokedAt)}`
                          : `expires ${formatTime(a.expiresAt)}`;
                    return (
                      <tr key={a.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">
                          {formatTime(a.grantedAt)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                          {a.proposalId}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400">
                          {a.grantedBy}
                        </td>
                        <td className="px-4 py-3">
                          <Pill label={label} className={pillColor} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">
                          {resolved}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                          {truncateHash(a.proposalParameterHash)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionRow({
  action,
  executions,
  approvals,
  now,
}: {
  action: ActionProposal;
  executions: ExecutionResult[];
  approvals: SecondApproval[];
  now: number;
}) {
  const sourceColor = SOURCE_COLORS[action.source] ?? "bg-zinc-800 text-zinc-400";
  const riskColor = RISK_COLORS[action.riskLevel] ?? "bg-zinc-800 text-zinc-400";
  const statusColor = STATUS_COLORS[action.status] ?? "bg-zinc-800 text-zinc-400";
  const last = executions[0];
  const lastOutcomeColor = last
    ? EXEC_COLORS[last.outcome] ?? "bg-zinc-800 text-zinc-400"
    : "bg-zinc-800 text-zinc-500";

  const latestApproval = approvals[0];
  const approvalEff = latestApproval ? effectiveApprovalStatus(latestApproval, now) : null;
  const approvalPillColor = latestApproval
    ? approvalEff === "active"
      ? APPROVAL_COLORS.granted
      : APPROVAL_COLORS[approvalEff as SecondApprovalStatus]
    : "bg-zinc-800 text-zinc-500";
  const approvalLabel = latestApproval
    ? approvalEff === "active"
      ? `active · ${formatTimeLeft(latestApproval.expiresAt, now)} left`
      : (approvalEff as string)
    : null;

  const isPreviewCategory = PREVIEW_CATEGORIES.has(action.category);

  return (
    <tr className="transition-colors hover:bg-zinc-900/50">
      <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">
        {formatTime(action.createdAt)}
      </td>
      <td className="px-4 py-3">
        <Pill label={action.category} className="bg-zinc-700/50 text-zinc-300" />
      </td>
      <td className="px-4 py-3">
        <Pill label={action.riskLevel} className={riskColor} />
      </td>
      <td className="px-4 py-3">
        <Pill label={action.status} className={statusColor} />
      </td>
      <td className="px-4 py-3">
        <Pill label={action.source} className={sourceColor} />
      </td>
      <td className="px-4 py-3 text-xs text-zinc-300">{executions.length}</td>
      <td className="px-4 py-3">
        {last ? (
          <Pill label={last.outcome} className={lastOutcomeColor} />
        ) : (
          <span className="text-xs text-zinc-600">—</span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">
        {last ? (
          <>
            <span>{relativeTime(last.finishedAt)}</span>
            <span className="ml-2 text-zinc-600">{formatMs(last.durationMs)}</span>
          </>
        ) : (
          <span className="text-zinc-600">—</span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        {approvalLabel ? (
          <Pill label={approvalLabel} className={approvalPillColor} />
        ) : (
          <span className="text-xs text-zinc-600">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {isPreviewCategory ? (
          <Pill
            label="preview-only"
            className="bg-amber-900/50 text-amber-300"
          />
        ) : (
          <span className="text-xs text-zinc-600">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-zinc-300">{action.title}</td>
    </tr>
  );
}
