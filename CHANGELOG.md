# Changelog

All notable changes to ORQUESTADOR-PRIME are documented here.

---

## [2.0.0] — 2026-03-26

### V2 — Complete architectural evolution from V1 foundation.

#### Added

**Phase 1 — Foundation**
- Zod-based environment validation with fail-fast startup
- Shared type contracts in `src/types.ts`
- Fixed `tsconfig.json` — enabled `rootDir`, `outDir`, `@types/node`, removed `jsx`
- Normalized all agents to `new Agent()` pattern
- Added `.env.example` with all required and optional variables

**Phase 2 — Agent Metadata**
- `AgentMetadata` interface: `domain`, `tier`, `tags`, `description` per agent
- Central `agentRegistry` with `as const satisfies` for full type safety
- `selector.ts` — `selectByTier()`, `selectByDomain()`, `selectByTags()`, `registrySummary()`
- Orchestrator system prompt now includes live agent catalog

**Phase 3 — Agent Selector Router**
- Keyword-to-tag mapping with scoring system
- `routeTask()` — pre-selects agents before LLM call
- `RouterResult` contract with `selectedAgents`, `matchedKeywords`, `summary`
- Router context injected into all prompts

**Phase 4 — Blueprint Mode**
- New CLI mode: `npm run blueprint`
- Automatic project type detection: saas, api, ecommerce, dashboard, landing, erp, generic
- Feature detection: auth, payments, admin-panel, notifications, real-time, and more
- Agent assignments by layer with full implementation roadmap

**Phase 5 — Structured Output Contracts**
- Zod schemas per mode: `PlanOutputSchema`, `RouteOutputSchema`, `BlueprintOutputSchema`
- `extractJson()` — handles fenced blocks, plain blocks, and raw JSON
- `OrchestratorResult` now carries typed `structured` field alongside `finalOutput`
- Parse failures are non-fatal — system never crashes on bad LLM output

**Phase 6 — Multi-Provider**
- Anthropic SDK integration (`@anthropic-ai/sdk`)
- `Provider` interface — shared contract for OpenAI and Claude
- `providerRouter.ts` — model-name-based provider selection (`claude-*` → Anthropic)
- Blueprint and audit route to Claude Opus when `ANTHROPIC_API_KEY` is set
- Automatic fallback to OpenAI when Claude is not configured
- Token usage logging per provider call

**Phase 7 — Observability Layer**
- Structured logger with levels: `trace`, `debug`, `info`, `warn`, `error`
- `LOG_LEVEL` env variable for runtime verbosity control
- `Tracer` class — records timing per phase with `phaseAsync()`
- `TraceRecord` — complete execution record: provider, tokens, agents, keywords, parse result
- `printTrace()` — formatted summary printed after every run

**Phase 8 — Documentation**
- Full `README.md` rewrite covering architecture, agents, modes, providers, setup, and extension points
- Extension point guide: how to add agents, modes, and providers

**Phase 9 — Audit Mode**
- New CLI mode: `npm run audit`
- `repoReader.ts` — reads repo tree and key files (up to 100KB per file, 40K total context)
- `auditContext.ts` — builds structured context for LLM
- `AuditOutputSchema` — findings with severity, category, affected files
- Technical debt score (1–10), strengths, and prioritized action list
- `--repo=./path` flag to audit any local repository

**Phase 10 — Scaffold Mode**
- New CLI mode: `npm run scaffold`
- Stack templates: Next.js (saas, dashboard, erp, ecommerce), Express (api)
- `scaffoldWriter.ts` — writes files to disk with directory creation and skip-existing protection
- `ScaffoldOutputSchema` — files, directories, setup instructions, next steps
- `--out=./path` flag for output directory
- Uses `callProvider()` directly for reliable JSON output (no multi-turn handoffs)

**Phase 11 — Memory Layer**
- New CLI mode: `npm run memory`
- `memoryStore.ts` — JSON persistence at `~/.orquestador-prime/memory.json`
- Auto-rotation at 100 entries — oldest entries dropped automatically
- `buildMemoryContext()` — injects recent and related runs into planning and blueprint prompts
- `findRelatedEntries()` — keyword + type matching across history
- Memory write is non-fatal — failures are logged and ignored, never crash the system

#### Changed
- `orchestrator.ts` — blueprint, audit, scaffold use `callProvider()` directly (not `run()` with handoffs) for deterministic JSON output
- `plan` and `route` retain `run()` with handoffs for intentional multi-turn behavior
- Model defaults changed from `gpt-5.4` (non-existent) to `gpt-4o`

#### Fixed
- `tsconfig.json` — `types: []` was blocking `@types/node` resolution
- `tsconfig.json` — `jsx: react-jsx` was noise in a pure Node CLI
- `config.ts` — `requireEnv()` side-effect on import replaced with Zod schema validation
- `orchestrator.ts` — `Agent.create()` inconsistency resolved, all agents use `new Agent()`
- `parser.ts` — removed unsafe cast, `selectSchema` now has exhaustive return type with `default: throw`

---

## [1.0.0] — 2026-03-01

### V1 — Initial working orchestrator

- TypeScript orchestrator with `@openai/agents` SDK
- 13 specialized agents: architect, frontend, backend, qa, relationalDb, nosql,
  security, devops, apiDesigner, integration, uxui, motionFx, aiml
- Two CLI modes: `plan` and `route`
- Basic prompt templates for planning and routing
- `dotenv` configuration