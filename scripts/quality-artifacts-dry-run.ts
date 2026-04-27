import { runQualityArtifactDryRun } from "../src/quality/artifactDryRun.js";

interface CliArgs {
  outDir?: string;
  pretty: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { pretty: false };

  for (const arg of argv) {
    if (arg === "--pretty") {
      args.pretty = true;
      continue;
    }
    if (arg.startsWith("--out-dir=")) {
      args.outDir = arg.slice("--out-dir=".length);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const result = await runQualityArtifactDryRun({
    pretty: args.pretty,
    ...(args.outDir ? { outDir: args.outDir } : {}),
  });
  process.stdout.write(`${JSON.stringify(result, null, args.pretty ? 2 : 0)}\n`);
  process.exitCode = result.status === "pass" ? 0 : 1;
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
