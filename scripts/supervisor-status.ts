// scripts/supervisor-status.ts
// Advisory supervisor/JARVIS status report.
//
// Read-only: no provider calls, no action mutations, no proposal creation,
// no approval/dispatch/second-approval behavior.

import { buildSupervisorAdvisoryReport } from "../src/supervisor/advisoryReport.js";

interface ParsedArgs {
  pretty: boolean;
  recentLimit?: number;
  help: boolean;
}

function parseBoolean(value: string, flagName: string): boolean {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error(`${flagName} must be true or false`);
}

function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string> = {};

  for (const raw of argv) {
    if (!raw.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${raw}`);
    }

    const eq = raw.indexOf("=");
    if (eq > 0) {
      flags[raw.slice(2, eq)] = raw.slice(eq + 1);
    } else {
      flags[raw.slice(2)] = "true";
    }
  }

  const parsed: ParsedArgs = {
    pretty: flags["pretty"] ? parseBoolean(flags["pretty"], "--pretty") : false,
    help: flags["help"] === "true" || flags["h"] === "true",
  };

  if (flags["recent-limit"]) {
    const recentLimit = Number(flags["recent-limit"]);
    if (!Number.isInteger(recentLimit) || recentLimit <= 0) {
      throw new Error("--recent-limit must be a positive integer");
    }
    parsed.recentLimit = recentLimit;
  }

  return parsed;
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run supervisor:status -- [--pretty] [--recent-limit=<n>]",
      "",
      "Safety:",
      "  Advisory/read-only status report only.",
      "  Does not approve, reject, dispatch, create proposals, or mutate stores.",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  const report = await buildSupervisorAdvisoryReport({
    ...(args.recentLimit ? { recentLimit: args.recentLimit } : {}),
  });

  process.stdout.write(JSON.stringify(report, null, args.pretty ? 2 : 0));
  process.stdout.write("\n");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
