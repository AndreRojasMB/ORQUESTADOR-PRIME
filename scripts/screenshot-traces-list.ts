import {
  appendScreenshotTraceMetadata,
  getRecentScreenshotTraces,
  getScreenshotTracePath,
  getScreenshotTraceStats,
} from "../src/computerUse/screenshotTraceStore.js";
import type { ScreenshotTraceSource } from "../src/computerUse/types.js";

const SOURCES = new Set<ScreenshotTraceSource>([
  "cli",
  "dashboard",
  "job",
  "system",
  "openclaw",
]);

interface ParsedArgs {
  append: boolean;
  source: ScreenshotTraceSource;
  screenHash: string | null;
  screenshotRef: string | null;
  windowTitle: string | null;
  url: string | null;
  width: number | null;
  height: number | null;
  deviceScaleFactor: number | null;
  linkedProposalId: string | null;
  linkedJobId: string | null;
  correlationId: string | null;
  limit: number;
  pretty: boolean;
  help: boolean;
}

function parseBoolean(value: string, flagName: string): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${flagName} must be true or false`);
}

function parsePositiveNumber(value: string, flagName: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${flagName} must be a positive number`);
  }
  return parsed;
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

  const source = (flags["source"] ?? "cli") as ScreenshotTraceSource;
  if (!SOURCES.has(source)) {
    throw new Error("--source is not known");
  }

  const limit = flags["limit"] ? Number(flags["limit"]) : 50;
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("--limit must be a positive integer");
  }

  return {
    append: flags["append"] ? parseBoolean(flags["append"], "--append") : false,
    source,
    screenHash: flags["screen-hash"] ?? null,
    screenshotRef: flags["screenshot-ref"] ?? null,
    windowTitle: flags["window-title"] ?? null,
    url: flags["url"] ?? null,
    width: flags["width"] ? parsePositiveNumber(flags["width"], "--width") : null,
    height: flags["height"] ? parsePositiveNumber(flags["height"], "--height") : null,
    deviceScaleFactor: flags["device-scale-factor"]
      ? parsePositiveNumber(flags["device-scale-factor"], "--device-scale-factor")
      : null,
    linkedProposalId: flags["proposal-id"] ?? null,
    linkedJobId: flags["job-id"] ?? null,
    correlationId: flags["correlation-id"] ?? null,
    limit,
    pretty: flags["pretty"] ? parseBoolean(flags["pretty"], "--pretty") : false,
    help: flags["help"] === "true" || flags["h"] === "true",
  };
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run computer:screenshot-traces -- [--limit=<n>] [--pretty]",
      "  npm run computer:screenshot-traces -- --append=true --screen-hash=<hash> [--window-title=<title>] [--url=<url>]",
      "",
      "Safety:",
      "  Stores metadata only. Does not capture screenshots or store raw image/base64 data.",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    process.exit(0);
  }

  let appendResult = null;
  if (args.append) {
    appendResult = await appendScreenshotTraceMetadata({
      source: args.source,
      screenHash: args.screenHash,
      screenshotRef: args.screenshotRef,
      windowTitle: args.windowTitle,
      url: args.url,
      viewport: {
        width: args.width,
        height: args.height,
        deviceScaleFactor: args.deviceScaleFactor,
      },
      linkedProposalId: args.linkedProposalId,
      linkedJobId: args.linkedJobId,
      correlationId: args.correlationId,
    });
  }

  const [stats, traces] = await Promise.all([
    getScreenshotTraceStats(),
    getRecentScreenshotTraces(args.limit),
  ]);

  process.stdout.write(
    JSON.stringify(
      {
        path: getScreenshotTracePath(),
        appendResult,
        stats,
        traces,
      },
      null,
      args.pretty ? 2 : 0,
    ),
  );
  process.stdout.write("\n");
  if (appendResult?.error) {
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
