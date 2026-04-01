import { parseArgs, runOrchestrator } from "./orchestrator/orchestrator.js";
import { runInit } from "./init/initRunner.js";
import { logger } from "./observability/logger.js";

async function main() {
  const { task, mode } = parseArgs(process.argv.slice(2));

  // Modo init — flujo interactivo
  if (mode === "init") {
    await runInit();
    return;
  }

  const requiresTask =
    mode === "plan" ||
    mode === "route" ||
    mode === "blueprint" ||
    mode === "scaffold";

  if (requiresTask && !task) {
    console.error(
      [
        'Usage: npm run dev       -- "your task"',
        '       npm run plan      -- "your task"',
        '       npm run route     -- "your task"',
        '       npm run blueprint -- "your project"',
        '       npm run audit     -- --repo=./path',
        '       npm run scaffold  -- "your project" --out=./dir',
        '       npm run memory',
        '       npm run init',
      ].join("\n")
    );
    process.exit(1);
  }

  const result = await runOrchestrator(task, mode);

  logger.section(`RESULT · ${result.mode.toUpperCase()}`);

  if (result.structured) {
    console.log(JSON.stringify(result.structured, null, 2));
  } else {
    console.log(result.finalOutput);
    if (result.parseError) {
      logger.warn("Parse error", { error: result.parseError });
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});