import {
  getMultiAgentTraceStats,
  getMultiAgentTracePath,
  getRecentMultiAgentTraces,
} from "../src/multiAgent/traceStore.js";

interface ParsedArgs {
  limit: number;
  pretty: boolean;
  showPath: boolean;
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
    flags[eq > 0 ? raw.slice(2, eq) : raw.slice(2)] =
      eq > 0 ? raw.slice(eq + 1) : "true";
  }

  const limit = flags["limit"] ? Number(flags["limit"]) : 50;
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("--limit must be a positive integer");
  }

  return {
    limit,
    pretty: flags["pretty"] ? parseBoolean(flags["pretty"], "--pretty") : false,
    showPath: flags["path"] ? parseBoolean(flags["path"], "--path") : false,
    help: flags["help"] === "true" || flags["h"] === "true",
  };
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run multi-agent:traces -- [--limit=<n>] [--path=true|false] [--pretty]",
      "",
      "Safety:",
      "  Read-only local trace listing.",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    process.exit(0);
  }

  const [stats, traces] = await Promise.all([
    getMultiAgentTraceStats(),
    getRecentMultiAgentTraces(args.limit),
  ]);

  const output = {
    ...(args.showPath ? { path: getMultiAgentTracePath() } : {}),
    stats,
    traces,
  };

  process.stdout.write(JSON.stringify(output, null, args.pretty ? 2 : 0));
  process.stdout.write("\n");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
