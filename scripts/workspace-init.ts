import { initWorkspaceProject, getWorkspacePath } from "../src/workspace/workspaceStore.js";

interface ParsedArgs {
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

  return {
    pretty: flags["pretty"] ? parseBoolean(flags["pretty"], "--pretty") : false,
    showPath: flags["path"] ? parseBoolean(flags["path"], "--path") : false,
    help: flags["help"] === "true" || flags["h"] === "true",
  };
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run workspace:init -- [--pretty] [--path=true|false]",
      "",
      "Safety:",
      "  Explicitly initializes only the current project workspace.",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    process.exit(0);
  }

  const result = await initWorkspaceProject();
  const output = {
    ...(args.showPath ? { path: getWorkspacePath() } : {}),
    ...result,
  };
  process.stdout.write(JSON.stringify(output, null, args.pretty ? 2 : 0));
  process.stdout.write("\n");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
