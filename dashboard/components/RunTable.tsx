import Link from "next/link";
import { Badge } from "./Badge";
import type { MemoryEntry } from "@/lib/types";

interface RunTableProps {
  entries: MemoryEntry[];
  compact?: boolean;
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

export function RunTable({ entries, compact = false }: RunTableProps) {
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

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-xs uppercase tracking-wider text-zinc-500">
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Mode</th>
            <th className="px-4 py-3">Task</th>
            {!compact && <th className="px-4 py-3">Agents</th>}
            {!compact && <th className="px-4 py-3">Keywords</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {entries.map((entry) => (
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
                  {truncate(entry.task || "(no task)", compact ? 50 : 80)}
                </Link>
              </td>
              {!compact && (
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {entry.agents.length > 0
                    ? entry.agents.join(", ")
                    : "-"}
                </td>
              )}
              {!compact && (
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {entry.keywords.length > 0
                      ? entry.keywords.map((kw) => (
                          <Badge key={kw}>{kw}</Badge>
                        ))
                      : <span className="text-xs text-zinc-600">-</span>}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
