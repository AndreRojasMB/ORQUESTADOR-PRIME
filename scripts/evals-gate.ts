import { runEvalSuite } from "../src/evals/evalRunner.js";

interface CliArgs {
  baseline?: string;
  pretty: boolean;
  failOnWarn: boolean;
}

function parseBooleanFlag(value: string, name: string): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be true or false`);
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    pretty: false,
    failOnWarn: false,
  };

  for (const arg of argv) {
    if (arg === "--pretty") {
      args.pretty = true;
      continue;
    }
    if (arg.startsWith("--baseline=")) {
      args.baseline = arg.slice("--baseline=".length);
      continue;
    }
    if (arg.startsWith("--fail-on-warn=")) {
      args.failOnWarn = parseBooleanFlag(
        arg.slice("--fail-on-warn=".length),
        "--fail-on-warn",
      );
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
  });
  const baselineFailed = args.baseline ? report.baseline?.loaded !== true : false;
  const failed = report.summary.failed;
  const warned = report.summary.warned;
  const shouldFail =
    baselineFailed ||
    failed > 0 ||
    (args.failOnWarn && warned > 0);

  const output = {
    status: shouldFail ? "fail" : "pass",
    failed,
    warned,
    passed: report.summary.passed,
    total: report.summary.total,
    failOnWarn: args.failOnWarn,
    baselineUsed: Boolean(args.baseline),
    baselineLoaded: report.baseline?.loaded ?? null,
    reportId: report.reportId,
    createdAt: report.createdAt,
    warningIds: report.qualityDashboard.warningIds,
    failingIds: report.qualityDashboard.failingIds,
    baselineWarning: report.baseline?.warning ?? null,
  };

  process.stdout.write(JSON.stringify(output, null, args.pretty ? 2 : 0));
  process.stdout.write("\n");
  process.exitCode = shouldFail ? 1 : 0;
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
