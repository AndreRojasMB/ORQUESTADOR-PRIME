import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import { runEvalSuite } from "../src/evals/evalRunner.js";
import type { EvalRegressionReport } from "../src/evals/types.js";
import { buildQualityDashboardData } from "../src/quality/qualityReport.js";
import {
  buildQualitySnapshot,
  compareQualitySnapshots,
  type QualitySnapshot,
} from "../src/quality/snapshot.js";
import type { QualityDashboardData, QualityDashboardSourceSummary } from "../src/quality/types.js";
import { riskInputFromEvalReport } from "../src/risk/evalRiskAdapter.js";
import { assessRisk } from "../src/risk/riskAssessment.js";
import type { RiskApprovalSignal } from "../src/risk/types.js";

interface CliArgs {
  qualityReport?: string;
  baseline?: string;
  phase?: string;
  commit?: string;
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
    if (arg.startsWith("--quality-report=")) {
      args.qualityReport = arg.slice("--quality-report=".length);
      continue;
    }
    if (arg.startsWith("--baseline=")) {
      args.baseline = arg.slice("--baseline=".length);
      continue;
    }
    if (arg.startsWith("--phase=")) {
      args.phase = arg.slice("--phase=".length);
      continue;
    }
    if (arg.startsWith("--commit=")) {
      args.commit = arg.slice("--commit=".length);
      continue;
    }
    if (arg.startsWith("--out=")) {
      args.out = arg.slice("--out=".length);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
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

async function buildGeneratedQualityReport(): Promise<QualityDashboardData> {
  const evalReport: EvalRegressionReport = await runEvalSuite();
  const riskSignal: RiskApprovalSignal = assessRisk(riskInputFromEvalReport(evalReport));
  const sources: QualityDashboardSourceSummary[] = [
    {
      type: "eval-report",
      id: evalReport.reportId,
      generated: true,
      createdAt: evalReport.createdAt,
      suiteVersion: evalReport.suiteVersion,
    },
    {
      type: "risk-signal",
      id: riskSignal.signalId,
      generated: true,
      createdAt: riskSignal.createdAt,
      schemaVersion: riskSignal.schemaVersion,
    },
  ];

  return buildQualityDashboardData({
    evalReport,
    riskSignal,
    sources,
  });
}

async function loadQualityReport(args: CliArgs): Promise<QualityDashboardData> {
  if (args.qualityReport) {
    return readJson<QualityDashboardData>(args.qualityReport);
  }

  return buildGeneratedQualityReport();
}

async function loadBaseline(args: CliArgs): Promise<QualitySnapshot | null> {
  if (!args.baseline) {
    return null;
  }

  const parsed = await readJson<unknown>(args.baseline);
  if (
    parsed &&
    typeof parsed === "object" &&
    "snapshot" in parsed &&
    (parsed as { snapshot?: unknown }).snapshot
  ) {
    return (parsed as { snapshot: QualitySnapshot }).snapshot;
  }
  return parsed as QualitySnapshot;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const dashboard = await loadQualityReport(args);
  const current = buildQualitySnapshot({
    dashboard,
    ...(args.phase ? { phase: args.phase } : {}),
    ...(args.commit ? { commit: args.commit } : {}),
  });
  const baseline = await loadBaseline(args);
  const comparison = compareQualitySnapshots({ current, baseline });
  const output = { snapshot: current, comparison };
  const text = `${JSON.stringify(output, null, args.pretty ? 2 : 0)}\n`;

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
