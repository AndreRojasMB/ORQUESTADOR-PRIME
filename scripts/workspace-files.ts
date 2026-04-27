import {
  appendWorkspaceContextEntry,
  listWorkspaceContextEntries,
} from "../src/workspace/workspaceStore.js";
import type {
  WorkspaceContextEntryKind,
  WorkspaceRiskLevel,
} from "../src/workspace/types.js";

const KINDS = new Set<WorkspaceContextEntryKind>([
  "module",
  "script",
  "docs",
  "config",
  "test",
  "store",
  "dashboard",
  "other",
]);

const RISKS = new Set<WorkspaceRiskLevel>(["low", "medium", "high"]);

interface ParsedArgs {
  add: boolean;
  list: boolean;
  path: string | null;
  kind: WorkspaceContextEntryKind;
  summary: string | null;
  ownerArea: string;
  tags: string[];
  tag: string | null;
  riskLevel: WorkspaceRiskLevel;
  pretty: boolean;
  help: boolean;
}

function parseBoolean(value: string, flagName: string): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${flagName} must be true or false`);
}

function splitCsv(value: string | undefined): string[] {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
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

  const kind = (flags["kind"] ?? "module") as WorkspaceContextEntryKind;
  if (!KINDS.has(kind)) {
    throw new Error("--kind is not a known workspace context entry kind");
  }
  const riskLevel = (flags["risk"] ?? "low") as WorkspaceRiskLevel;
  if (!RISKS.has(riskLevel)) {
    throw new Error("--risk is not a known workspace risk level");
  }

  return {
    add: flags["add"] === "true",
    list: flags["list"] === "true" || !flags["add"],
    path: flags["path"] ?? null,
    kind,
    summary: flags["summary"] ?? null,
    ownerArea: flags["owner"] ?? "",
    tags: splitCsv(flags["tags"]),
    tag: flags["tag"] ?? null,
    riskLevel,
    pretty: flags["pretty"] ? parseBoolean(flags["pretty"], "--pretty") : false,
    help: flags["help"] === "true" || flags["h"] === "true",
  };
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run workspace:files -- --list [--tag=<tag>] [--pretty]",
      "  npm run workspace:files -- --add --path=src/foo.ts --kind=module --summary=<summary> [--tags=a,b] [--owner=<area>] [--risk=low|medium|high] [--pretty]",
      "",
      "Safety:",
      "  Paths must be repo-relative. No file contents are scanned or stored.",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    process.exit(0);
  }

  if (args.add) {
    if (!args.path || !args.summary) {
      throw new Error("--add requires --path and --summary");
    }
    const result = await appendWorkspaceContextEntry({
      path: args.path,
      kind: args.kind,
      summary: args.summary,
      ownerArea: args.ownerArea,
      tags: args.tags,
      riskLevel: args.riskLevel,
    });
    process.stdout.write(JSON.stringify(result, null, args.pretty ? 2 : 0));
    process.stdout.write("\n");
    return;
  }

  if (args.list) {
    const entries = await listWorkspaceContextEntries({ tag: args.tag });
    process.stdout.write(JSON.stringify({ entries }, null, args.pretty ? 2 : 0));
    process.stdout.write("\n");
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
