import { mkdir, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import { runLocalQualityGate } from "../src/quality/localGate.js";

interface CliArgs {
  baseline?: string;
  out?: string;
  pretty: boolean;
  failOnReview: boolean;
  failOnRegression: boolean;
  phase?: string;
  commit?: string;
}

function parseBooleanFlag(value: string, name: string): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be true or false`);
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    pretty: false,
    failOnReview: false,
    failOnRegression: false,
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
    if (arg.startsWith("--out=")) {
      args.out = arg.slice("--out=".length);
      continue;
    }
    if (arg.startsWith("--fail-on-review=")) {
      args.failOnReview = parseBooleanFlag(
        arg.slice("--fail-on-review=".length),
        "--fail-on-review",
      );
      continue;
    }
    if (arg.startsWith("--fail-on-regression=")) {
      args.failOnRegression = parseBooleanFlag(
        arg.slice("--fail-on-regression=".length),
        "--fail-on-regression",
      );
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
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const result = await runLocalQualityGate({
    ...(args.baseline ? { baselinePath: args.baseline } : {}),
    failOnReview: args.failOnReview,
    failOnRegression: args.failOnRegression,
    ...(args.phase ? { phase: args.phase } : {}),
    ...(args.commit ? { commit: args.commit } : {}),
  });
  const text = `${JSON.stringify(result, null, args.pretty ? 2 : 0)}\n`;

  if (args.out) {
    const outPath = resolve(args.out);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, text, "utf-8");
  }

  process.stdout.write(text);
  process.exitCode = result.finalStatus === "fail" ? 1 : 0;
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
