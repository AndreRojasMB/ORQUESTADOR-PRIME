// src/prompts/routing.ts

import type { RouterResult } from "../types.js";

export function buildRoutingPrompt(task: string, router?: RouterResult): string {
  const routerContext = router
    ? `\nPre-selected agents for this task:\n${router.summary}\n`
    : "";

  return `
Route this task to the most appropriate specialist and explain why:

${task}
${routerContext}
Your answer must include:
1. Best specialist
2. Why
3. Architecture plan
4. Responsibilities
5. Execution order
6. Risks
7. Validations
`.trim();
}