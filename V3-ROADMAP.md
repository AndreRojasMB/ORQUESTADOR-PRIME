# V3 Roadmap — ORQUESTADOR-PRIME

V2 is complete. This document defines the next evolution.

---

## V3 Theme — Execution & Autonomy

V2 made the system smarter about *what* to do.  
V3 makes the system capable of *doing it* — with human approval gates.

---

## Planned Phases

### Phase 13 — Execution Layer
The system proposes real file changes, not just plans.

- `src/execution/proposalWriter.ts` — writes diffs to `agent/` branches
- `src/execution/approvalGate.ts` — human must confirm before any merge
- Git integration: create branch, commit changes, open draft PR
- Never touches `main` or `dev` directly
- Pairs with the existing `.continue/rules/` guardrails

### Phase 14 — Continue MCP Integration
ORQUESTADOR-PRIME becomes a tool inside VS Code.

- Expose CLI modes as MCP tools via `@modelcontextprotocol/sdk`
- `plan`, `blueprint`, `scaffold`, `audit` callable from Continue chat
- Repo-aware context passed automatically from the editor
- Memory layer reads from current workspace

### Phase 15 — Multi-Stack Expansion
Scaffold and blueprint support more stacks.

- Laravel + Inertia template
- React Native / Expo template
- Python FastAPI template
- Monorepo (Turborepo) template
- Stack auto-detection from existing `package.json` or `composer.json`

### Phase 16 — Agent Improvement Loop
Agents learn from past runs.

- Per-agent performance tracking in memory
- `auditAgent()` — scores agent output quality over time
- Routing weights adjust based on historical success rates
- Feedback loop: human marks outputs as useful / not useful

### Phase 17 — Web Dashboard
Browser UI for the orchestrator.

- Next.js dashboard reading `~/.orquestador-prime/memory.json`
- Live trace viewer — see phases, timings, agent assignments
- Blueprint and scaffold launcher with form UI
- Diff viewer for execution proposals

---

## Extension Points Ready in V2

These V2 foundations make V3 features safe to build:

| V2 Foundation | Enables V3 Feature |
|---|---|
| `OrchestratorMode` union type | New modes added in one place |
| `AgentRegistry` + `AgentMetadata` | Agent routing weights, performance tracking |
| `TraceRecord` | Dashboard visualization, audit trail |
| `MemoryStore` | Agent improvement loop, context persistence |
| `Provider` interface | Additional providers (Gemini, local models) |
| `.continue/rules/` | Execution layer guardrails |
| `callProvider()` | Direct calls without SDK lock-in |

---

## Guiding Principles (carry forward from V2)

- Human approval before any destructive action
- Small safe diffs over large rewrites
- Fail fast on config errors, graceful degradation on runtime errors
- Every new feature must keep `npm run check` passing
- Memory and execution layers are opt-in, never mandatory