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

## [2.1.0] — 2026-03-26

### Phase 13 — Interactive CLI Init

- `npm run init` — flujo interactivo tipo `npm create vite@latest`
- `src/init/questions.ts` — preguntas con `@inquirer/prompts`
- Selección de project type, stack por tipo, features con checkbox
- `src/init/initContext.ts` — convierte respuestas en task string
- `src/init/initRunner.ts` — orquesta preguntas → scaffold → disco
- Stacks: Next.js, Next.js+Prisma, Express, Fastify, Hono, Remix, Astro, Vite+React, Medusa
- Features: auth, rbac, payments, database, uploads, email, realtime,
  search, analytics, admin, i18n, theming, cicd, docker
- Output box con next steps al finalizar

### Phase 14 — Execution Layer

- `npm run execute` — modo CLI para ejecutar cambios reales en repos
- `src/execution/gitClient.ts` — operaciones git locales con `simple-git`
- `src/execution/githubClient.ts` — GitHub API con `@octokit/rest`
- `src/execution/proposalWriter.ts` — escribe archivos en branch `agent/*`
- `src/execution/approvalGate.ts` — human-in-the-loop antes de cualquier acción
- `src/prompts/execution.ts` — prompt especializado para propuestas de cambio
- `ExecutionOutputSchema` — Zod schema con files, risks, rollback, testing
- Flujo completo: propuesta → approval gate → branch → commit → draft PR
- NUNCA toca `main` o `dev` directamente
- Fallback graceful cuando GitHub no está configurado

### Added — MCPs

- `github-mcp.yaml` — GitHub MCP para Continue/VS Code
- `figma-mcp.yaml` — Figma MCP
- `filesystem-mcp.yaml` — acceso al filesystem desde el editor
- `chrome-devtools-mcp.yaml` — Chrome DevTools / Puppeteer
- `database-mcp.yaml` — PostgreSQL desde el editor
- `memory-mcp.yaml` — memoria persistente en Continue
- `shell-mcp.yaml` — CLI seguro con ALLOWED_COMMANDS

### Changed

- `config.ts` — agregado `GITHUB_CONFIG`, `isGitHubAvailable()`
- `types.ts` — agregado `ExecutionProposal`, `ExecutionFile`,
  `ExecutionResult`, `ExecutionStatus`
- `output/schemas.ts` — agregado `ExecutionOutputSchema`
- `output/parser.ts` — agregado caso `execute` e `init`

---

## [3.0.0] — 2026-04-02

### Phase 15 — OpenClaw Integration

#### Added

- `src/openclaw/openclawClient.ts` — HTTP client for OpenClaw Gateway
  (`/v1/chat/completions` for chat, `/tools/invoke` for skill execution)
- `src/openclaw/openclawSkillRunner.ts` — invokes OpenClaw skills by name,
  maps results back into `ProviderResponse` shape
- `src/providers/openclawProvider.ts` — `Provider` implementation routing
  through OpenClaw Gateway's OpenAI-compatible endpoint
- `openclaw-skill/SKILL.md` — OpenClaw skill definition that exposes
  ORQUESTADOR-PRIME modes (plan, route, blueprint, audit, scaffold) as
  callable tools from any OpenClaw channel (Slack, Discord, CLI, etc.)

#### Changed

- `src/providers/types.ts` — added `"openclaw"` to `ProviderName` union
- `src/providers/providerRouter.ts` — models starting with `openclaw-`
  route to `openclawProvider`
- `src/config.ts` — added `OPENCLAW_GATEWAY_URL`, `OPENCLAW_GATEWAY_TOKEN`,
  `OPENCLAW_MODEL` env vars, `OPENCLAW_CONFIG` export, `isOpenClawAvailable()` helper

### Phase 16 — n8n Integration

#### Added

- `src/n8n/n8nClient.ts` — HTTP client for n8n with two trigger paths:
  webhook triggers (`POST /webhook/<path>`) and REST API execution
  (`POST /api/v1/workflows/:id/execute` with `X-N8N-API-KEY`)
- `src/n8n/n8nWorkflowRunner.ts` — high-level runner that normalizes
  webhook vs API responses for orchestrator consumption
- `n8n-templates/orquestador-trigger.json` — importable n8n workflow
  (Webhook Trigger → Execute Command → Parse Output → Respond to Webhook)
  that lets any n8n workflow invoke ORQUESTADOR-PRIME modes

#### Changed

- `src/config.ts` — added `N8N_BASE_URL`, `N8N_API_KEY`,
  `N8N_WEBHOOK_BASE_URL` env vars, `N8N_CONFIG` export, `isN8nAvailable()` helper

### Phase 17 — LightRAG Integration (RAG over Codebase)

#### Added

- `src/lightrag/lightragClient.ts` — HTTP client for LightRAG server
  (`POST /documents/text` for indexing, `POST /documents/file` for uploads,
  `POST /query` with mode selection: naive/local/global/hybrid)
- `src/lightrag/lightragIndexer.ts` — indexes repository files into LightRAG
  using existing `repoReader.ts` infrastructure, with stats tracking
- `src/lightrag/lightragContext.ts` — queries LightRAG in hybrid mode,
  formats codebase context snippets for prompt injection (max 4K chars,
  non-fatal on errors)

#### Changed

- `src/config.ts` — added `LIGHTRAG_BASE_URL`, `LIGHTRAG_API_KEY` env vars,
  `LIGHTRAG_CONFIG` export, `isLightRAGAvailable()` helper
- `src/orchestrator/orchestrator.ts` — when LightRAG is available, queries
  RAG context via `buildRAGContext()` and prepends it to prompts for
  `plan`, `blueprint`, and `audit` modes (traced as `lightrag:query` phase)

### Phase 18 — Coolify Integration (Auto Deploy)

#### Added

- `src/coolify/coolifyClient.ts` — HTTP client for Coolify REST API
  (list/get/create/deploy/start/stop/restart applications, list servers
  and projects, Bearer token auth via `COOLIFY_API_TOKEN`)
- `src/coolify/coolifyDeployer.ts` — high-level deployer:
  `deployFromRepo()` creates app + triggers deploy,
  `redeployApplication()` restarts existing app,
  `getDeploymentStatus()` fetches current state

#### Changed

- `src/config.ts` — added `COOLIFY_API_URL`, `COOLIFY_API_TOKEN`,
  `COOLIFY_PROJECT_UUID`, `COOLIFY_SERVER_UUID` env vars,
  `COOLIFY_CONFIG` export, `isCoolifyAvailable()` helper

### Phase 19 — Multi-Stack Expansion

#### Added

- `src/scaffold/templates/fastify.ts` — Fastify + TypeScript template
  (server bootstrap, health route, @fastify/cors + sensible)
- `src/scaffold/templates/hono.ts` — Hono + TypeScript template
  (edge-first, Cloudflare Workers wrangler.toml, middleware)
- `src/scaffold/templates/astro.ts` — Astro + TypeScript template
  (static site, Base layout, index + 404 pages)
- `src/scaffold/templates/viteReact.ts` — Vite + React + TypeScript template
  (SPA, App/main entry, vite.config.ts)
- `src/scaffold/templates/remix.ts` — Remix + TypeScript template
  (SSR, root layout, index route, health API route)

#### Changed

- `src/scaffold/templates.ts` — imports all 5 new templates, added
  `StackName` type, `selectTemplateByStack()` for stack-specific selection,
  `selectTemplate()` now routes landing to Astro, supports mobile/monorepo
- `src/types.ts` — added `"mobile"` and `"monorepo"` to `ProjectType` union
- `src/init/questions.ts` — added Mobile App and Monorepo project types,
  React Native/Expo and Turborepo stack choices, mobile-specific features
  (push, offline, deep linking, biometric, camera), monorepo features
  (shared UI, shared config, API package), expanded generic stacks to all 7
- `src/router/agentRouter.ts` — `detectProjectType()` now detects
  "mobile", "react native", "expo", "monorepo", "turborepo" keywords