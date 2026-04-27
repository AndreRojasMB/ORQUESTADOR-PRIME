import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import { runEvalSuite } from "../src/evals/evalRunner.js";
import type { EvalRegressionReport } from "../src/evals/types.js";
import { buildQualityDashboardData } from "../src/quality/qualityReport.js";
import type { QualityDashboardSourceSummary } from "../src/quality/types.js";
import { riskInputFromEvalReport } from "../src/risk/evalRiskAdapter.js";
import { assessRisk } from "../src/risk/riskAssessment.js";
import type { RiskApprovalSignal } from "../src/risk/types.js";

interface CliArgs {
  evalReport?: string;
  riskSignal?: string;
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
    if (arg.startsWith("--risk-signal=")) {
      args.riskSignal = arg.slice("--risk-signal=".length);
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

async function readJson<T>(path: string): Promise<T> {
  try {
    return JSON.parse(await readFile(path, "utf-8")) as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Unable to read JSON file: ${message}`);
  }
}

async function loadEvalReport(args: CliArgs): Promise<{
  report: EvalRegressionReport;
  source: QualityDashboardSourceSummary;
}> {
  if (args.evalReport) {
    const report = await readJson<EvalRegressionReport>(args.evalReport);
    return {
      report,
      source: {
        type: "eval-report",
        id: report.reportId,
        path: resolve(args.evalReport),
        generated: false,
        createdAt: report.createdAt,
        suiteVersion: report.suiteVersion,
      },
    };
  }

  const report = await runEvalSuite({
    ...(args.baseline ? { baselinePath: args.baseline } : {}),
  });

  if (args.baseline && report.baseline?.loaded !== true) {
    throw new Error(report.baseline?.warning ?? "Baseline could not be loaded.");
  }

  return {
    report,
    source: {
      type: "eval-report",
      id: report.reportId,
      generated: true,
      createdAt: report.createdAt,
      suiteVersion: report.suiteVersion,
      ...(args.baseline ? { path: `baseline:${resolve(args.baseline)}` } : {}),
    },
  };
}

async function loadRiskSignal(args: CliArgs, evalReport: EvalRegressionReport): Promise<{
  signal: RiskApprovalSignal;
  source: QualityDashboardSourceSummary;
}> {
  if (args.riskSignal) {
    const signal = await readJson<RiskApprovalSignal>(args.riskSignal);
    return {
      signal,
      source: {
        type: "risk-signal",
        id: signal.signalId,
        path: resolve(args.riskSignal),
        generated: false,
        createdAt: signal.createdAt,
        schemaVersion: signal.schemaVersion,
      },
    };
  }

  const signal = assessRisk(riskInputFromEvalReport(evalReport));
  return {
    signal,
    source: {
      type: "risk-signal",
      id: signal.signalId,
      generated: true,
      createdAt: signal.createdAt,
      schemaVersion: signal.schemaVersion,
    },
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const evalData = await loadEvalReport(args);
  const riskData = await loadRiskSignal(args, evalData.report);
  const dashboard = buildQualityDashboardData({
    evalReport: evalData.report,
    riskSignal: riskData.signal,
    sources: [evalData.source, riskData.source],
  });
  const text = `${JSON.stringify(dashboard, null, args.pretty ? 2 : 0)}\n`;

  if (args.out) {
    const outPath = resolve(args.out);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, text, "utf-8");
  }

  process.stdout.write(text);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
