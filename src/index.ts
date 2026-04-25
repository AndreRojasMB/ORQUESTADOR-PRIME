import { parseArgs, runOrchestrator } from "./orchestrator/orchestrator.js";
import { runInit } from "./init/initRunner.js";
import { runChat } from "./chat/chatMode.js";
import { printBanner } from "./banner.js";
import { logger } from "./observability/logger.js";
import type { OrchestratorMode } from "./types.js";

// Phase 32E-AUDITUX-CORE — structured, mode-aware help.
// Invoked when --help (or -h) is present; never starts the LLM.
function printHelp(mode?: OrchestratorMode): void {
  const generic = [
    "ORQUESTADOR-PRIME — multi-agent CLI",
    "",
    "Modes:",
    '  npm run dev        -- "your task"          # plan (default)',
    '  npm run plan       -- "your task"',
    '  npm run route      -- "your task"',
    '  npm run blueprint  -- "your project"',
    '  npm run audit      -- --repo=./path',
    '  npm run audit:ux   -- <see audit:ux flags below>',
    '  npm run scaffold   -- "your project" --out=./dir',
    "  npm run memory",
    "  npm run chat",
    "  npm run init",
    "  npm run execute    -- --repo=./path",
    "",
    "Common flags:",
    "  --help                          Print this help and exit",
    "  --mode=<mode>                   Force mode (plan|route|blueprint|audit|audit-ux|...)",
    "  --repo=<path>                   Target repo path (audit / audit-ux / execute)",
  ].join("\n");

  const auditUx = [
    "audit:ux flags (read-only, no writes):",
    "  --repo=<path>                   Target repo (default: '.')",
    "  --entry=<rel-path>              REQUIRED. Entry file the audit centers on",
    "  --sections=<csv>                REQUIRED. Logical sections to diagnose (e.g. hero,navbar)",
    "  --scope=<short-label>           REQUIRED. Short label persisted in the audit context",
    "  --files=<csv>                   Additional files (entry is auto-included)",
    "  --agents=<csv>                  Specialist agents (default: uxui,motionFx,frontend,qa)",
    "",
    "  --include=<csv>                 Patterns added to the seed set (glob: *, **)",
    "  --exclude=<csv>                 Patterns removed from seeds and import-followed files",
    "  --max-files=<n>                 Hard cap on files read (1..200, default 30)",
    "  --max-bytes=<n>                 Per-file size ceiling (1024..500000, default 100000)",
    "  --follow-imports=<0|1|2>        BFS depth for relative-import follower (default 0)",
    "",
    "Pattern syntax (v1, no new dep):",
    "  exact path:  src/foo.tsx",
    "  prefix dir:  src/sections/    (trailing / matches anything inside)",
    "  glob:        src/sections/**/*.tsx",
    "",
    "Examples:",
    "  npm run audit:ux -- --repo=. --entry=src/index.ts --sections=cli --scope=demo",
    "  npm run audit:ux -- --repo=. --entry=src/index.ts --sections=cli --scope=d1 --follow-imports=1",
    "  npm run audit:ux -- --repo=. --entry=src/orchestrator/orchestrator.ts \\",
    "                       --include='src/audit/**/*.ts' --exclude='src/scaffold/**' \\",
    "                       --sections=audit --scope=graph --follow-imports=2 --max-files=80",
  ].join("\n");

  if (mode === "audit-ux") {
    console.log(auditUx);
    return;
  }
  console.log(generic + "\n\n" + auditUx);
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  const { task, mode, helpRequested } = parsed;

  if (helpRequested) {
    printHelp(mode);
    return;
  }

  await printBanner();

  // Modo init — flujo interactivo
  if (mode === "init") {
    await runInit();
    return;
  }

  // Modo chat — configuración interactiva
  if (mode === "chat") {
    await runChat();
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
        '       npm run audit:ux  -- --repo=./path --entry=src/pages/Home.tsx --files=a.tsx,b.tsx --sections=hero,navbar --scope=home [--agents=uxui,motionFx,frontend,qa]',
        '       npm run scaffold  -- "your project" --out=./dir',
        '       npm run memory',
        '       npm run chat',
        '       npm run init',
        "",
        "Tip: append --help for detailed audit:ux flag reference.",
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