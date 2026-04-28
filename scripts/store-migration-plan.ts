import {
  createMigrationPlanErrorResult,
  planStoreMigrations,
} from "../src/runtime/migrations/migrationPlanner.js";

interface CliOptions {
  dataRoot?: string;
  pretty: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { pretty: false };

  for (const arg of argv) {
    if (arg === "--pretty") {
      options.pretty = true;
      continue;
    }
    if (arg === "--json") {
      continue;
    }
    if (arg.startsWith("--data-root=")) {
      options.dataRoot = arg.slice("--data-root=".length);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

async function main(): Promise<void> {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = await planStoreMigrations({ dataRoot: options.dataRoot });
    process.stdout.write(`${JSON.stringify(result, null, options.pretty ? 2 : 0)}\n`);
    process.exitCode = result.errors.length > 0 ? 1 : 0;
  } catch (error) {
    const result = createMigrationPlanErrorResult(error);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = 1;
  }
}

await main();
