export function buildRoutingPrompt(task: string): string {
  return `
Route this task to the most appropriate specialist and explain why:

${task}

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