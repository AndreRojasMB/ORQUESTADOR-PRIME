import {
  getOpenClawCapability,
  listOpenClawCapabilities,
} from "../src/openclaw/capabilityRegistry.js";

interface ParsedArgs {
  capabilityId: string | null;
  dryRunOnly: boolean;
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

  return {
    capabilityId: flags["capability"] ?? null,
    dryRunOnly: flags["dry-run-only"]
      ? parseBoolean(flags["dry-run-only"], "--dry-run-only")
      : false,
    pretty: flags["pretty"] ? parseBoolean(flags["pretty"], "--pretty") : false,
    help: flags["help"] === "true" || flags["h"] === "true",
  };
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run openclaw:capabilities -- [--capability=<id>] [--dry-run-only=true|false] [--pretty]",
      "",
      "Safety:",
      "  Metadata-only capability listing. Does not call OpenClaw.",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    process.exit(0);
  }

  const capabilities = args.capabilityId
    ? [getOpenClawCapability(args.capabilityId)].filter((item) => item !== null)
    : listOpenClawCapabilities();
  const filtered = args.dryRunOnly
    ? capabilities.filter((entry) => entry.dryRunSupported && !entry.realExecutionSupported)
    : capabilities;

  process.stdout.write(
    JSON.stringify(
      {
        total: filtered.length,
        capabilities: filtered,
      },
      null,
      args.pretty ? 2 : 0,
    ),
  );
  process.stdout.write("\n");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
