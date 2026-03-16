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

const plannerModel = process.env.PLANNER_MODEL || "gpt-5.4";
const specialistModel = process.env.SPECIALIST_MODEL || "gpt-5.4";
const synthesisModel = process.env.SYNTHESIS_MODEL || "gpt-5.4";

/* =========================
   CORE SPECIALISTS
========================= */

const architectAgent = new Agent({
  name: "Architect Agent",
  model: plannerModel,
  instructions: `
You are a senior software architect.

Responsibilities:
- define system structure
- identify modules and boundaries
- propose implementation order
- identify technical risks

Never jump directly into code.
Start with architecture and reasoning.
`.trim(),
});

const frontendAgent = new Agent({
  name: "Frontend Agent",
  model: specialistModel,
  instructions: `
You are a frontend architecture specialist.

Focus on:
- React architecture
- routing
- state management
- accessibility
- performance
- component structure

Respect the architecture defined by the Architect Agent.
`.trim(),
});

const backendAgent = new Agent({
  name: "Backend Agent",
  model: specialistModel,
  instructions: `
You are a backend systems specialist.

Focus on:
- APIs
- services
- authentication
- validation
- modular backend architecture
- security boundaries
`.trim(),
});

const qaAgent = new Agent({
  name: "QA Agent",
  model: specialistModel,
  instructions: `
You are a QA and reliability engineer.

Responsibilities:
- identify edge cases
- test strategies
- regression risks
- validation rules
- failure scenarios
`.trim(),
});

/* =========================
   DATA SPECIALISTS
========================= */

const relationalDbAgent = new Agent({
  name: "Relational DB Agent",
  model: specialistModel,
  instructions: `
You specialize in relational databases.

Focus on:
- PostgreSQL
- schema design
- indexing strategies
- migrations
- query optimization
`.trim(),
});

const nosqlAgent = new Agent({
  name: "NoSQL Agent",
  model: specialistModel,
  instructions: `
You specialize in NoSQL systems.

Focus on:
- Redis
- caching strategies
- event stores
- distributed data models
`.trim(),
});

/* =========================
   PLATFORM SPECIALISTS
========================= */

const securityAgent = new Agent({
  name: "Security Agent",
  model: specialistModel,
  instructions: `
You are a security architecture expert.

Focus on:
- authentication
- authorization
- data protection
- attack surface analysis
- secure defaults
`.trim(),
});

const devopsAgent = new Agent({
  name: "DevOps Agent",
  model: specialistModel,
  instructions: `
You are a DevOps and infrastructure specialist.

Focus on:
- CI/CD pipelines
- Docker
- deployment architecture
- observability
- scaling strategy
`.trim(),
});

/* =========================
   ORCHESTRATOR
========================= */

const orchestrator = Agent.create({
  name: "Project Orchestrator",
  model: synthesisModel,
  instructions: `
You are the central AI orchestrator for a multi-agent engineering system.

Process:

1. Analyze the task
2. Delegate to appropriate specialists
3. Consolidate the results

Your final output must include:

1. Architecture overview
2. Responsible agents
3. Implementation order
4. Technical risks
5. Validation strategy
`.trim(),
  handoffs: [
    architectAgent,
    frontendAgent,
    backendAgent,
    qaAgent,
    relationalDbAgent,
    nosqlAgent,
    securityAgent,
    devopsAgent,
  ],
});

/* =========================
   ARG PARSER
========================= */

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

/* =========================
   MAIN
========================= */

async function main() {
  const { task, mode } = parseArgs(process.argv.slice(2));

  if (!task) {
    console.error('Usage: npm run dev -- "your task"');
    process.exit(1);
  }

  const prompt =
    mode === "route"
      ? `Route this task to the most appropriate specialist and explain why:\n\n${task}`
      : `Create a structured technical plan for this task using the specialist agents:\n\n${task}`;

  const result = await run(orchestrator, prompt);

  console.log(`\n=== MODE: ${mode.toUpperCase()} ===\n`);
  console.log("=== FINAL RESULT ===\n");
  console.log(result.finalOutput);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});