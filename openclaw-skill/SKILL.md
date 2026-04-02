---
name: orquestador-prime
description: Multi-agent AI orchestrator — plan, route, blueprint, audit, and scaffold software projects.
version: 2.1.0
metadata:
  openclaw:
    requires:
      env:
        - OPENAI_API_KEY
      bins:
        - node
        - npx
    primaryEnv: OPENAI_API_KEY
---

# ORQUESTADOR-PRIME

You are invoking the ORQUESTADOR-PRIME multi-agent orchestration system.
It analyzes software tasks and delegates them to 13 specialized AI agents
(architect, frontend, backend, QA, security, devops, DB, API design, integration, UX/UI, motion/FX, AI/ML).

## Available Modes

| Mode | Description | Example |
|---|---|---|
| `plan` | Full implementation plan with agent assignments | "Build a SaaS billing module" |
| `route` | Select the best specialist agents for a task | "Add OAuth2 to the API" |
| `blueprint` | Complete project architecture blueprint | "E-commerce platform with Next.js" |
| `audit` | Security and architecture audit of a repo | (pass --repo=./path) |
| `scaffold` | Generate project files and directory structure | "React dashboard with Tailwind" |

## How to Use

When the user asks you to plan, architect, audit, or scaffold a software project, use the `exec` tool to run:

```
npx tsx src/index.ts --mode=<mode> "<task description>"
```

### Examples

- **Plan**: `npx tsx src/index.ts --mode=plan "Add real-time notifications with WebSockets"`
- **Route**: `npx tsx src/index.ts --mode=route "Migrate PostgreSQL schema to support multi-tenancy"`
- **Blueprint**: `npx tsx src/index.ts --mode=blueprint "SaaS project management tool with Stripe billing"`
- **Audit**: `npx tsx src/index.ts --mode=audit --repo=.`
- **Scaffold**: `npx tsx src/index.ts --mode=scaffold "Next.js dashboard" --out=./my-project`

### Important

- Always quote the task description.
- The `audit` mode requires `--repo=<path>` pointing to a local git repository.
- The `scaffold` mode writes files to `--out=<dir>` (defaults to `./scaffold-output`).
- Output is structured JSON. Parse it and present the results clearly to the user.
