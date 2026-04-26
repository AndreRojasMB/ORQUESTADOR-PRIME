// scripts/memory-v2-retrieve.ts
// Read-only Memory V2 retrieval CLI.
//
// No provider calls, embeddings, vector DB, prompt injection, or store writes.

import { retrieveMemoryV2 } from "../src/memory/memoryV2Retrieval.js";
import type {
  MemoryV2EntryType,
  MemoryV2RetrievalQuery,
} from "../src/memory/memoryV2Types.js";

const VALID_TYPES = new Set([
  "run-summary",
  "project-goal",
  "decision",
  "preference",
  "constraint",
  "risk",
  "integration-note",
  "external-note",
  "learning-summary",
]);

interface ParsedArgs {
  query: MemoryV2RetrievalQuery;
  pretty: boolean;
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

function parseCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
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

  const help = flags["help"] === "true" || flags["h"] === "true";
  const queryText = flags["query"] ?? "";
  const pretty = flags["pretty"] ? parseBoolean(flags["pretty"], "--pretty") : false;

  if (!help && queryText.trim().length === 0) {
    throw new Error("--query is required");
  }

  const query: MemoryV2RetrievalQuery = {
    query: queryText,
    includeV1Backfill: false,
    allowPrivate: false,
  };

  if (flags["tags"]) {
    query.tags = parseCsv(flags["tags"]);
  }

  if (flags["type"]) {
    if (!VALID_TYPES.has(flags["type"])) {
      throw new Error("--type is not a known Memory V2 entry type");
    }
    query.type = flags["type"] as MemoryV2EntryType;
  }

  if (flags["limit"]) {
    const limit = Number(flags["limit"]);
    if (!Number.isInteger(limit) || limit <= 0) {
      throw new Error("--limit must be a positive integer");
    }
    query.limit = limit;
  }

  if (flags["include-v1"]) {
    query.includeV1Backfill = parseBoolean(flags["include-v1"], "--include-v1");
  }

  if (flags["allow-private"]) {
    query.allowPrivate = parseBoolean(flags["allow-private"], "--allow-private");
  }

  return { query, pretty, help };
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run memory:v2:retrieve -- --query=<text> [--tags=<csv>] [--type=<type>]",
      "  npm run memory:v2:retrieve -- --query=<text> [--limit=<n>] [--include-v1=true|false]",
      "  npm run memory:v2:retrieve -- --query=<text> [--allow-private=true|false] [--pretty]",
      "",
      "Safety:",
      "  Read-only retrieval only.",
      "  No provider calls, embeddings, vector DB, prompt injection, or store writes.",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  const response = await retrieveMemoryV2(args.query);
  process.stdout.write(JSON.stringify(response, null, args.pretty ? 2 : 0));
  process.stdout.write("\n");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
