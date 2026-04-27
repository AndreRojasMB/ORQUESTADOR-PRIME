import { mkdir, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import { assessRisk } from "../src/risk/riskAssessment.js";
import {
  buildSyntheticRiskInput,
  parseRiskInput,
  readEvalReport,
  readJsonFile,
  readStdinIfAvailable,
} from "../src/risk/inputReaders.js";
import type { RiskAssessmentInput, RiskDecision } from "../src/risk/types.js";

interface CliArgs {
  input?: string;
  evalReport?: string;
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
    if (arg.startsWith("--input=")) {
      args.input = arg.slice("--input=".length);
      continue;
    }
    if (arg.startsWith("--eval-report=")) {
      args.evalReport = arg.slice("--eval-report=".length);
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

async function loadInput(args: CliArgs): Promise<RiskAssessmentInput> {
  if (args.input) {
    return parseRiskInput(await readJsonFile(args.input)).input;
  }

  const stdin = await readStdinIfAvailable();
  if (stdin) {
    return parseRiskInput(stdin).input;
  }

  const input = buildSyntheticRiskInput();
  input.taskMetadata = {
    ...(input.taskMetadata ?? {}),
    warningReason: "risk.input.missing",
  };
  return input;
}

function shouldFail(decision: RiskDecision): boolean {
  return (
    decision === "pause_for_review" ||
    decision === "require_explicit_approval" ||
    decision === "block_until_fixed"
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const input = await loadInput(args);

  if (args.evalReport) {
    input.evalReport = await readEvalReport(args.evalReport);
  }

  const signal = assessRisk(input);
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
