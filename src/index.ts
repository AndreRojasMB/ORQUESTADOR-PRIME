import { parseArgs, runOrchestrator } from "./orchestrator/orchestrator.js";

async function main() {
  const { task, mode } = parseArgs(process.argv.slice(2));

  if (!task) {
    console.error(
      [
        'Usage: npm run dev -- "your task"',
        '       npm run plan -- "your task"',
        '       npm run route -- "your task"',
      ].join("\n")
    );
    process.exit(1);
  }

  const result = await runOrchestrator(task, mode);

  console.log(`\n=== MODE: ${mode.toUpperCase()} ===\n`);
  console.log("=== FINAL RESULT ===\n");
  console.log(result.finalOutput);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});