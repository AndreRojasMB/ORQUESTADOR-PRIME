import "dotenv/config";
import { Agent, run } from "@openai/agents";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

requireEnv("OPENAI_API_KEY");

const model = process.env.OPENAI_MODEL || "gpt-5.4";

const architectAgent = new Agent({
  name: "Architect Agent",
  model,
  instructions: `
You are a software architect.
Define system structure, modules, boundaries, risks, and implementation order.
Do not jump into coding before a clear plan exists.
`.trim(),
});

const frontendAgent = new Agent({
  name: "Frontend Agent",
  model,
  instructions: `
You are a frontend specialist.
Focus on UI architecture, routing, state, components, accessibility, and performance.
Respect the architecture defined by the architect agent.
`.trim(),
});

const backendAgent = new Agent({
  name: "Backend Agent",
  model,
  instructions: `
You are a backend specialist.
Focus on APIs, authentication, services, validation, database design, and security.
Respect contracts and avoid breaking compatibility.
`.trim(),
});

const qaAgent = new Agent({
  name: "QA Agent",
  model,
  instructions: `
You are a QA specialist.
Review risks, test scenarios, regressions, edge cases, and acceptance criteria.
Never assume something works without validation.
`.trim(),
});

const orchestrator = Agent.create({
  name: "Project Orchestrator",
  model,
  instructions: `
You are the technical orchestrator.
First analyze the task.
Then delegate to the right specialists.
Finally produce a consolidated response with:
1. architecture plan
2. responsibilities
3. execution order
4. risks
5. validations
`.trim(),
  handoffs: [architectAgent, frontendAgent, backendAgent, qaAgent],
});

function parseArgs(argv: string[]) {
  let mode = "plan";
  const taskParts: string[] = [];

  for (const arg of argv) {
    if (arg.startsWith("--mode=")) {
      const value = arg.split("=")[1];
      if (value === "plan" || value === "route") {
        mode = value;
        continue;
      }
    }
    taskParts.push(arg);
  }

  return {
    mode,
    task: taskParts.join(" ").trim(),
  };
}

async function main() {
  const { task, mode } = parseArgs(process.argv.slice(2));

  if (!task) {
    console.error('Usage: npm run dev -- "your task"');
    process.exit(1);
  }

  const prompt =
    mode === "route"
      ? `Route and solve this task with the best specialist:\n\n${task}`
      : `Plan and solve this task with the right specialists:\n\n${task}`;

  const result = await run(orchestrator, prompt);

  console.log(`\n=== MODE: ${mode.toUpperCase()} ===\n`);
  console.log("=== FINAL RESULT ===\n");
  console.log(result.finalOutput);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});