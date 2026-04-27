import {
  createRuntimeDoctorErrorResult,
  runRuntimeDoctor,
} from "../src/health/configDoctor.js";

interface CliArgs {
  pretty: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    pretty: false,
  };

  for (const arg of argv) {
    if (arg === "--pretty") {
      args.pretty = true;
      continue;
    }
    if (arg === "--json") {
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function writeResult(value: unknown, pretty: boolean): void {
  process.stdout.write(`${JSON.stringify(value, null, pretty ? 2 : 0)}\n`);
}

async function main(): Promise<void> {
  let args: CliArgs;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    const result = createRuntimeDoctorErrorResult(err);
    writeResult(result, true);
    process.exitCode = 1;
    return;
  }

  try {
    const result = await runRuntimeDoctor();
    writeResult(result, args.pretty);
    process.exitCode = result.summary.status === "fail" ? 1 : 0;
  } catch (err) {
    const result = createRuntimeDoctorErrorResult(err);
    writeResult(result, args.pretty);
    process.exitCode = 1;
  }
}

void main();

