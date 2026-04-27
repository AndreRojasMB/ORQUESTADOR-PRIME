import { getJobStats, readJobStore } from "../src/jobs/jobStore.js";
import type { JobKind, JobStatus } from "../src/jobs/types.js";

const STATUSES = new Set<JobStatus>([
  "queued",
  "scheduled",
  "running",
  "succeeded",
  "failed",
  "blocked",
  "cancelled",
  "expired",
]);

interface ParsedArgs {
  status: JobStatus | null;
  kind: JobKind | null;
  limit: number;
  pretty: boolean;
  help: boolean;
}

function parseBoolean(value: string, flagName: string): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${flagName} must be true or false`);
}

function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string> = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${raw}`);
    }
    const eq = raw.indexOf("=");
    flags[eq > 0 ? raw.slice(2, eq) : raw.slice(2)] = eq > 0 ? raw.slice(eq + 1) : "true";
  }

  const status = flags["status"] ?? null;
  if (status && !STATUSES.has(status as JobStatus)) {
    throw new Error("--status is not a known job status");
  }

  const limit = flags["limit"] ? Number(flags["limit"]) : 50;
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("--limit must be a positive integer");
  }

  return {
    status: status as JobStatus | null,
    kind: (flags["kind"] ?? null) as JobKind | null,
    limit,
    pretty: flags["pretty"] ? parseBoolean(flags["pretty"], "--pretty") : false,
    help: flags["help"] === "true" || flags["h"] === "true",
  };
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run jobs:list -- [--status=<status>] [--kind=<kind>] [--limit=<n>] [--pretty]",
      "",
      "Safety:",
      "  Read-only local jobs listing.",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    process.exit(0);
  }

  const [store, stats] = await Promise.all([readJobStore(), getJobStats()]);
  const jobs = store.jobs
    .filter((job) => (args.status ? job.status === args.status : true))
    .filter((job) => (args.kind ? job.kind === args.kind : true))
    .slice(-args.limit);

  process.stdout.write(JSON.stringify({ stats, jobs }, null, args.pretty ? 2 : 0));
  process.stdout.write("\n");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
