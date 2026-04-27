import { readFile } from "fs/promises";
import { runMultiAgentReview } from "../src/multiAgent/reviewRunner.js";
import type {
  MultiAgentReviewMode,
  MultiAgentReviewRequest,
  MultiAgentTraceSource,
} from "../src/multiAgent/types.js";

interface ParsedArgs {
  request: string | null;
  artifactSummary: string | null;
  artifactFile: string | null;
  mode: MultiAgentReviewMode;
  source: MultiAgentTraceSource;
  persist: boolean;
  pretty: boolean;
  correlationId: string | null;
  help: boolean;
}

const MODES = new Set<MultiAgentReviewMode>([
  "general",
  "implementation",
  "verification",
  "smoke",
  "release",
]);

const SOURCES = new Set<MultiAgentTraceSource>([
  "cli",
  "supervisor",
  "job",
  "channel",
  "system",
]);

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

  const mode = (flags["mode"] ?? "general") as MultiAgentReviewMode;
  if (!MODES.has(mode)) {
    throw new Error("--mode is not a known review mode");
  }

  const source = (flags["source"] ?? "cli") as MultiAgentTraceSource;
  if (!SOURCES.has(source)) {
    throw new Error("--source is not a known review source");
  }

  return {
    request: flags["request"] ?? null,
    artifactSummary: flags["artifact-summary"] ?? null,
    artifactFile: flags["artifact-file"] ?? null,
    mode,
    source,
    persist: flags["persist"] ? parseBoolean(flags["persist"], "--persist") : false,
    pretty: flags["pretty"] ? parseBoolean(flags["pretty"], "--pretty") : false,
    correlationId: flags["correlation-id"] ?? null,
    help: flags["help"] === "true" || flags["h"] === "true",
  };
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) {
    return "";
  }
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  return Buffer.concat(chunks).toString("utf-8").trim();
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run multi-agent:review -- --request=<text> [--artifact-summary=<text>] [--mode=<mode>] [--persist=true|false] [--pretty]",
      "  cat request.txt | npm run multi-agent:review -- [--pretty]",
      "",
      "Safety:",
      "  Deterministic advisory review only.",
      "  Writes a trace only when --persist=true.",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    process.exit(0);
  }

  const stdin = await readStdin();
  const request = args.request ?? stdin;
  if (!request.trim()) {
    throw new Error("Provide --request=<text> or stdin text");
  }

  const artifactFromFile = args.artifactFile
    ? await readFile(args.artifactFile, "utf-8")
    : null;

  const artifactSummary = args.artifactSummary ?? artifactFromFile ?? null;
  const reviewRequest: MultiAgentReviewRequest = {
    source: args.source,
    reviewMode: args.mode,
    request,
    correlationId: args.correlationId,
    ...(artifactSummary ? { artifactSummary } : {}),
  };

  const result = await runMultiAgentReview(reviewRequest, { persist: args.persist });
  process.stdout.write(JSON.stringify(result, null, args.pretty ? 2 : 0));
  process.stdout.write("\n");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
