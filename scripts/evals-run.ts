import { mkdir, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import { formatEvalReport, runEvalSuite } from "../src/evals/evalRunner.js";

interface CliArgs {
  out?: string;
  baseline?: string;
  mode?: string;
  pretty: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { pretty: false };

  for (const arg of argv) {
    if (arg === "--pretty") {
      args.pretty = true;
      continue;
    }
    if (arg.startsWith("--out=")) {
      args.out = arg.slice("--out=".length);
      continue;
    }
    if (arg.startsWith("--baseline=")) {
      args.baseline = arg.slice("--baseline=".length);
      continue;
    }
    if (arg.startsWith("--mode=")) {
      args.mode = arg.slice("--mode=".length);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const report = await runEvalSuite({
    ...(args.baseline ? { baselinePath: args.baseline } : {}),
    ...(args.mode === "all" ? { mode: "all" as const } : {}),
  });
  const output = formatEvalReport(report, args.pretty);

  if (args.out) {
    const outPath = resolve(args.out);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, output, "utf-8");
    process.stdout.write(JSON.stringify({
      ok: true,
      wrote: outPath,
      reportId: report.reportId,
      summary: report.summary,
    }));
    process.stdout.write("\n");
    return;
  }

  process.stdout.write(output);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
