# ORQUESTADOR-PRIME

Multi-agent AI development orchestration system.  
Designed to work alongside a human developer — not replace them.

---

## What this is

ORQUESTADOR-PRIME is a TypeScript CLI that coordinates a team of specialized
AI agents to help with architecture, planning, routing, and project blueprinting.

The human developer remains the final decision maker.  
The system proposes, structures, and delegates — never merges autonomously.

---

## Architecture overview
```
Human Developer
      ↓
  CLI (index.ts)
      ↓
  Orchestrator  ←──  Agent Registry
      ↓                    ↓
  Agent Router        13 Specialists
      ↓
  Provider Router
      ↙         ↘
OpenAI        Anthropic (Claude)
      ↓
  Output Parser (Zod)
      ↓
  Tracer → TraceRecord
```

---

## Project structure
```
src/
├── agents/
│   ├── registry.ts          # Central agent catalog with metadata
│   ├── selector.ts          # Query functions: byTier, byDomain, byTags
│   ├── architect.ts
│   ├── frontend.ts
│   ├── backend.ts
│   ├── qa.ts
│   ├── db.ts                # relationalDbAgent + nosqlAgent
│   ├── security.ts
│   ├── devops.ts
│   ├── apiDesigner.ts
│   ├── integration.ts
│   ├── uxui.ts
│   ├── motionFx.ts
│   └── aiml.ts
├── observability/
│   ├── logger.ts            # Structured logger with levels
│   └── tracer.ts            # TraceRecord, timings, printTrace
├── orchestrator/
│   └── orchestrator.ts      # Central coordinator, mode routing
├── output/
│   ├── schemas.ts           # Zod schemas per mode
│   └── parser.ts            # JSON extractor + validator
├── prompts/
│   ├── planning.ts          # plan mode prompt
│   ├── routing.ts           # route mode prompt
│   └── blueprint.ts         # blueprint mode prompt
├── providers/
│   ├── types.ts             # Provider interface contract
│   ├── openaiProvider.ts    # OpenAI implementation
│   ├── anthropicProvider.ts # Claude implementation
│   └── providerRouter.ts   # Model → provider selector
├── router/
│   └── agentRouter.ts       # Keyword scoring, blueprint context
├── config.ts                # Zod env validation, model config
├── index.ts                 # CLI entry point
└── types.ts                 # Shared type contracts
```

---

## Agents

### Core — always active

| Agent | Domain | Responsibility |
|---|---|---|
| architect | architecture | System design, modules, implementation order |
| frontend | frontend | React architecture, components, routing, state |
| backend | backend | APIs, services, auth, validation |
| qa | quality | Edge cases, test strategies, regression risks |

### Specialized

| Agent | Domain | Responsibility |
|---|---|---|
| relationalDb | data | PostgreSQL, schema design, migrations, indexing |
| nosql | data | Redis, caching, event stores, distributed models |
| security | security | Auth, RBAC, OWASP, attack surface |
| devops | infrastructure | CI/CD, Docker, deployment, observability |
| apiDesigner | backend | REST contracts, versioning, OpenAPI |
| integration | integration | Webhooks, OAuth, adapters, SDK boundaries |

### Design & Experience

| Agent | Domain | Responsibility |
|---|---|---|
| uxui | design | User flows, design systems, accessibility |
| motionFx | design | GSAP, scroll animations, micro-interactions |

### Advanced / Optional

| Agent | Domain | Responsibility |
|---|---|---|
| aiml | ai | LLM integration, RAG, embeddings, evaluation |

---

## CLI modes

### plan
Generates a structured technical plan for a task.
```bash
npm run plan -- "add OAuth login with Google"
```
Output: architecture overview, agent assignments, implementation order,
risks, validation strategy.

### route
Routes a task to the most appropriate specialist.
```bash
npm run route -- "optimize slow PostgreSQL query in reports"
```
Output: best specialist, reasoning, responsibilities, execution order.

### blueprint
Generates a complete project architecture blueprint.  
Uses Claude (Opus) when `ANTHROPIC_API_KEY` is set.
```bash
npm run blueprint -- "saas dashboard with auth, payments, and admin panel"
```
Output: project overview, architecture layers, agent assignments,
implementation roadmap, risks, validation strategy.

---

## Provider strategy

| Mode | Default provider | With Claude configured |
|---|---|---|
| plan | OpenAI (gpt-4o) | OpenAI |
| route | OpenAI (gpt-4o) | OpenAI |
| blueprint | OpenAI (gpt-4o) | Claude Opus |

The system falls back to OpenAI automatically if `ANTHROPIC_API_KEY` is absent.

Provider routing is model-name based — models starting with `claude-` 
route to Anthropic, everything else routes to OpenAI.

---

## Observability

Every execution produces a `TraceRecord` printed to console:
```
═══════════════════════════════════════════════════════
  TRACE trace_m5x2k_a8f3j
═══════════════════════════════════════════════════════
  Mode     : BLUEPRINT
  Total    : 4.21s
  Parse    : ✅ success
  Provider : anthropic (claude-opus-4-5) — 312 in / 890 out — 3.89s
  Agents   : architect, frontend, backend, qa, security
  Keywords : saas, auth, payment, admin

  Phases:
    router               12ms
    provider:claude      3890ms
    parse                8ms
═══════════════════════════════════════════════════════
```

Log level is configurable via `LOG_LEVEL` env variable.  
Accepted values: `trace | debug | info | warn | error` (default: `info`)

---

## Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and add your API keys

# 3. Verify types compile
npm run check

# 4. Run
npm run plan -- "your task here"
```

Local quality workflow: see [docs/local-quality-workflow.md](docs/local-quality-workflow.md).
CI readiness guidance: see [docs/ci-readiness.md](docs/ci-readiness.md).
Local CI dry-run guidance: see [docs/ci-local-dry-run.md](docs/ci-local-dry-run.md).
CI first-run observability: see [docs/ci-first-run-observability.md](docs/ci-first-run-observability.md).
CI stability watch: see [docs/ci-stability-watch.md](docs/ci-stability-watch.md).
Minimal quality CI is active on `dev` pushes and pull requests.

---

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ | — | OpenAI API key |
| `ANTHROPIC_API_KEY` | ❌ | — | Enables Claude for blueprint mode |
| `PLANNER_MODEL` | ❌ | `gpt-4o` | Model for planning tasks |
| `SPECIALIST_MODEL` | ❌ | `gpt-4o` | Model for specialist agents |
| `SYNTHESIS_MODEL` | ❌ | `gpt-4o` | Model for orchestrator synthesis |
| `CLAUDE_ARCHITECT_MODEL` | ❌ | `claude-opus-4-5` | Claude model for architect tasks |
| `CLAUDE_BLUEPRINT_MODEL` | ❌ | `claude-opus-4-5` | Claude model for blueprint mode |
| `LOG_LEVEL` | ❌ | `info` | Log verbosity |

---

## Extension points

### Adding a new agent

1. Create `src/agents/yourAgent.ts` following the existing pattern
2. Add the entry to `src/agents/registry.ts` with `domain`, `tier`, `tags`, `description`
3. Done — the orchestrator picks it up automatically via `allAgents`

### Adding a new CLI mode

1. Add the mode string to `OrchestratorMode` in `src/types.ts`
2. Add the mode to `parseArgs` in `src/orchestrator/orchestrator.ts`
3. Create a prompt in `src/prompts/yourMode.ts`
4. Add a Zod schema in `src/output/schemas.ts`
5. Add the case to `parseOutput` in `src/output/parser.ts`
6. Add the script to `package.json`

### Adding a new provider

1. Create `src/providers/yourProvider.ts` implementing the `Provider` interface
2. Add the model prefix check in `src/providers/providerRouter.ts`
3. Add the API key to `src/config.ts` and `.env.example`

---

## V2 roadmap

| Phase | Status | Description |
|---|---|---|
| 1 — Foundation | ✅ | Config Zod, types, tsconfig, Agent pattern |
| 2 — Agent Metadata | ✅ | Registry with domain, tier, tags |
| 3 — Agent Router | ✅ | Keyword scoring, pre-selection |
| 4 — Blueprint Mode | ✅ | Project detection, roadmap generation |
| 5 — Structured Output | ✅ | Zod contracts per mode, JSON parser |
| 6 — Multi-provider | ✅ | Claude + OpenAI, automatic fallback |
| 7 — Observability | ✅ | Logger, Tracer, TraceRecord |
| 8 — Documentation | ✅ | This README |
| 9 — Audit Mode | 🔲 | Analyze existing repo, detect issues |
| 10 — Scaffold Mode | 🔲 | Generate folder structure by project type |
| 11 — Memory Layer | 🔲 | Context persistence across runs |
| 12 — Execution Layer | 🔲 | Autonomous file changes with human approval |

---

## Design principles

- **Human control first** — the system proposes, the human approves
- **Small safe diffs** — no large rewrites, no destructive changes
- **Fail fast** — config errors surface at startup, not mid-run
- **Modular by default** — every layer is independently replaceable
- **Extensible without bloat** — new agents, modes, providers follow
  the same pattern with minimal surface area
