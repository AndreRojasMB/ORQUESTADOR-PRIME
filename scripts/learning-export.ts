// scripts/learning-export.ts
// Export-only learning dataset CLI.
//
// This command reads existing local stores and emits redacted dataset records.
// It does not call providers, mutate prompts/config, dispatch actions, or write
// to stores. File output happens only when --out=<path> is explicit.

import { mkdir, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import {
  buildLearningDatasetExport,
  formatDatasetExport,
} from "../src/learning/datasetExport.js";
import type {
  DatasetExportOptions,
  LearningExportFormat,
  LearningExportSource,
} from "../src/learning/types.js";

const VALID_FORMATS = new Set(["json", "jsonl"]);
const VALID_SOURCES = new Set(["cli", "whatsapp", "omi", "dashboard", "openclaw", "system"]);

interface ParsedCliArgs {
  options: DatasetExportOptions;
  outPath: string | null;
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

function parseArgs(argv: string[]): ParsedCliArgs {
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
  const format = flags["format"] ?? "json";
  if (!VALID_FORMATS.has(format)) {
    throw new Error("--format must be json or jsonl");
  }

  const options: DatasetExportOptions = {
    format: format as LearningExportFormat,
  };

  if (flags["limit"]) {
    const limit = Number(flags["limit"]);
    if (!Number.isInteger(limit) || limit <= 0) {
      throw new Error("--limit must be a positive integer");
    }
    options.limit = limit;
  }

  if (flags["since"]) {
    if (!Number.isFinite(Date.parse(flags["since"]))) {
      throw new Error("--since must be a valid ISO-compatible date");
    }
    options.since = flags["since"];
  }

  if (flags["source"]) {
    if (!VALID_SOURCES.has(flags["source"])) {
      throw new Error("--source must be cli, whatsapp, omi, dashboard, openclaw, or system");
    }
    options.source = flags["source"] as LearningExportSource;
  }

  if (flags["mode"]) {
    options.mode = flags["mode"];
  }

  if (flags["include-pairs"]) {
    options.includePairs = parseBoolean(flags["include-pairs"], "--include-pairs");
  }

  if (flags["pretty"]) {
    options.pretty = parseBoolean(flags["pretty"], "--pretty");
  }

  if (flags["include-raw"]) {
    options.includeRaw = parseBoolean(flags["include-raw"], "--include-raw");
  }

  return {
    options,
    outPath: flags["out"] ?? null,
    help,
  };
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run learning:export -- [--format=json|jsonl] [--out=<path>]",
      "  npm run learning:export -- [--limit=<n>] [--since=<iso-date>]",
      "  npm run learning:export -- [--source=cli|whatsapp|omi|dashboard|openclaw|system]",
      "  npm run learning:export -- [--mode=<mode>] [--include-pairs=true|false] [--pretty]",
      "",
      "Safety:",
      "  --include-raw=true is rejected in this phase.",
      "  Default output is redacted and written to stdout unless --out is explicit.",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.help) {
    printUsage();
    process.exit(0);
  }

  if (parsed.options.includeRaw === true) {
    throw new Error("--include-raw=true is not supported in this export-only phase");
  }

  const format = parsed.options.format ?? "json";
  const result = await buildLearningDatasetExport(parsed.options);
  const output = formatDatasetExport(result, format, parsed.options.pretty ?? false);

  if (parsed.outPath) {
    const target = resolve(parsed.outPath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, output, "utf-8");
    console.error(`learning-export wrote ${result.records.length} record(s) to ${target}`);
    return;
  }

  process.stdout.write(output);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
