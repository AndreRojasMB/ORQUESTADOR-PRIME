export function buildPlanningPrompt(task: string): string {
  return `
Create a structured technical plan for this task using the specialist agents:

${task}

Your answer must include:
1. Architecture overview
2. Responsible agents
3. Implementation order
4. Technical risks
5. Validation strategy
`.trim();
}