// src/init/initRunner.ts
// Orquesta el flujo completo de init:
// preguntas → contexto → scaffold → archivos en disco.

import { askInitQuestions }  from "./questions.js";
import { buildInitContext }   from "./initContext.js";
import { runOrchestrator }   from "../orchestrator/orchestrator.js";
import { logger }            from "../observability/logger.js";

export async function runInit(): Promise<void> {
  // 1. Preguntas interactivas
  const answers = await askInitQuestions();

  // 2. Construir contexto
  const { task, outputDir } = buildInitContext(answers);

  logger.section("GENERATING PROJECT");
  logger.info(`Task    : ${task}`);
  logger.info(`Output  : ${outputDir}`);

  // 3. Inyectar --out en process.argv para que scaffold lo detecte
  process.argv.push(`--out=${outputDir}`);

  // 4. Correr scaffold con el task generado
  const result = await runOrchestrator(task, "scaffold");

  if (result.parseError) {
    logger.warn("Generation had issues — check output above");
  } else {
    console.log(`
╔══════════════════════════════════════════════╗
║  ✅  Project generated successfully!          ║
╠══════════════════════════════════════════════╣
║  📁  ${outputDir.padEnd(42)}║
╠══════════════════════════════════════════════╣
║  Next steps:                                 ║
║  cd ${answers.outputDir.padEnd(43)}║
║  npm install                                 ║
║  cp .env.example .env                        ║
║  npm run dev                                 ║
╚══════════════════════════════════════════════╝
    `);
  }
}