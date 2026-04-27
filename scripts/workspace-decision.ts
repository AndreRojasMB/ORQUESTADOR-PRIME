import {
  appendWorkspaceDecision,
  listWorkspaceDecisions,
} from "../src/workspace/workspaceStore.js";

interface ParsedArgs {
  add: boolean;
  list: boolean;
  title: string | null;
  context: string | null;
  decision: string | null;
  alternatives: string[];
  consequences: string[];
  rationale: string;
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

  return {
    add: flags["add"] === "true",
    list: flags["list"] === "true" || !flags["add"],
    title: flags["title"] ?? null,
    context: flags["context"] ?? null,
    decision: flags["decision"] ?? null,
    alternatives: splitCsv(flags["alternatives"]),
    consequences: splitCsv(flags["consequences"]),
    rationale: flags["rationale"] ?? "",
    pretty: flags["pretty"] ? parseBoolean(flags["pretty"], "--pretty") : false,
    help: flags["help"] === "true" || flags["h"] === "true",
  };
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run workspace:decision -- --list [--pretty]",
      "  npm run workspace:decision -- --add --title=<title> --context=<context> --decision=<decision> [--rationale=<text>] [--alternatives=a,b] [--consequences=a,b] [--pretty]",
      "",
      "Safety:",
      "  --list is read-only. --add is an explicit workspace store write.",
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
    if (!args.title || !args.context || !args.decision) {
      throw new Error("--add requires --title, --context, and --decision");
    }
    const result = await appendWorkspaceDecision({
      title: args.title,
      context: args.context,
      decision: args.decision,
      alternatives: args.alternatives,
      consequences: args.consequences,
      rationale: args.rationale,
    });
    process.stdout.write(JSON.stringify(result, null, args.pretty ? 2 : 0));
    process.stdout.write("\n");
    return;
  }

  if (args.list) {
    const decisions = await listWorkspaceDecisions();
    process.stdout.write(JSON.stringify({ decisions }, null, args.pretty ? 2 : 0));
    process.stdout.write("\n");
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
