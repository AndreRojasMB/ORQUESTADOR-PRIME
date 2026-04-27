import { mkdir, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import { runEvalSuite } from "../src/evals/evalRunner.js";
import type { EvalRegressionReport } from "../src/evals/types.js";
import { readJsonFile } from "../src/risk/inputReaders.js";
import { riskInputFromEvalReport } from "../src/risk/evalRiskAdapter.js";
import { assessRisk } from "../src/risk/riskAssessment.js";
import type { RiskDecision } from "../src/risk/types.js";

interface CliArgs {
  evalReport?: string;
  baseline?: string;
  out?: string;
  pretty: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { pretty: false };

  for (const arg of argv) {
    if (arg === "--pretty") {
      args.pretty = true;
      continue;
    }
    if (arg.startsWith("--eval-report=")) {
      args.evalReport = arg.slice("--eval-report=".length);
      continue;
    }
    if (arg.startsWith("--baseline=")) {
      args.baseline = arg.slice("--baseline=".length);
      continue;
    }
    if (arg.startsWith("--out=")) {
      args.out = arg.slice("--out=".length);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (args.evalReport && args.baseline) {
    throw new Error("--baseline is only supported when generating an eval report in memory.");
  }

  return args;
}

function shouldFail(decision: RiskDecision): boolean {
  return (
    decision === "pause_for_review" ||
    decision === "require_explicit_approval" ||
    decision === "block_until_fixed"
  );
}

async function loadEvalReport(args: CliArgs): Promise<EvalRegressionReport> {
  if (args.evalReport) {
    return (await readJsonFile(args.evalReport)) as EvalRegressionReport;
  }

  const report = await runEvalSuite({
    ...(args.baseline ? { baselinePath: args.baseline } : {}),
  });

  if (args.baseline && report.baseline?.loaded !== true) {
    throw new Error(report.baseline?.warning ?? "Baseline could not be loaded.");
  }

  return report;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const report = await loadEvalReport(args);
  const signal = assessRisk(riskInputFromEvalReport(report));
  const output = args.out
    ? {
        ok: true,
        wrote: resolve(args.out),
        signal,
      }
    : signal;
  const text = `${JSON.stringify(output, null, args.pretty ? 2 : 0)}\n`;

  if (args.out) {
    const outPath = resolve(args.out);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, `${JSON.stringify(signal, null, args.pretty ? 2 : 0)}\n`, "utf-8");
  }

  process.stdout.write(text);
  process.exitCode = shouldFail(signal.recommendedDecision) ? 1 : 0;
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
