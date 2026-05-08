# Module Boundary Rules Plan

Phase: 112B - MODULE BOUNDARY RULES PLAN

Status: planning / audit / docs-only

## Purpose

Phase 112 plans module boundary rules for ORQUESTADOR-PRIME after the initial
SOLID Architecture Charter. The goal is to define layer metadata, dependency
policy metadata, import policy findings, and a future layer map without adding
repo scanners, refactors, runtime behavior, or enforcement.

Phase 112B is documentation only. It does not implement validators, scan the
repository, rewrite imports, mutate source files, call providers, touch
dashboard behavior, operate OpenClaw, send WhatsApp messages, run n8n, persist
memory, change packages or workflows, mutate DB/SQL, deploy, or perform
source-control behavior from source.

## Module Boundary Scope

The future module boundary layer should define:

- module layers,
- allowed dependencies,
- forbidden dependencies,
- import policy finding metadata,
- layer map metadata,
- boundary severity,
- SOLID escalation metadata,
- PM escalation metadata,
- Autopilot context metadata.

This layer should describe architecture relationships. It must not inspect
files by itself or modify imports.

## Proposed Module Layers

Initial layer values:

- `core`
- `pm`
- `architecture`
- `autopilot`
- `integrations`
- `whatsapp`
- `viernesBridge`
- `dashboard`
- `scripts`
- `docs`
- `tests`
- `providers`
- `config`
- `runtime_future`

Layer names are metadata labels. They do not imply that source modules have
been scanned or classified automatically.

## Layer Intent

### core

Core should contain stable domain vocabulary and pure helpers. It should not
depend on infrastructure, providers, dashboard, runtime, or channel bridges.

### pm

PM should remain source-only and advisory. It may describe project state,
risks, blockers, approvals, reports, and next actions, but must not invoke
execution surfaces.

### architecture

Architecture should remain report-only and advisory. It may describe SOLID and
module boundary findings, but must not scan repositories or run refactors.

### autopilot

Autopilot should remain metadata/control support. It may render prompts,
validate reports, propose memory updates, recommend next actions, and classify
closeout state, but must not launch Codex, persist memory, or run external
automation.

### integrations

Integrations are live-adjacent. Source-only PM and architecture modules should
not import integration modules directly.

### whatsapp and viernesBridge

Channel bridge layers should stay isolated from PM/SOLID internals unless a
future phase defines explicit contracts. They should not become shortcuts for
approvals, execution, or provider calls.

### dashboard

Dashboard surfaces must not expose write paths from PM/SOLID modules. Any
dashboard integration needs a future gated plan with read-only contracts first.

### providers and config

Provider and config surfaces are sensitive and live-adjacent. Source-only
architecture modules must not call or depend on them.

### scripts, docs, and tests

Scripts, docs, and tests can consume metadata for verification, but production
source modules should not depend on them.

### runtime_future

Runtime remains future-gated. It must not be imported by PM or architecture
modules during the 111-120 block.

## Boundary Rule Concepts

Future boundary rules should express:

- source layer,
- target layer,
- policy,
- reason,
- severity,
- suggested action,
- escalation path.

Initial policy values:

- `allowed`
- `allowed_type_only`
- `review_required`
- `forbidden`
- `future_gated`

Examples:

- `architecture -> pm` may be allowed type-only when using shared evidence or
  risk vocabulary.
- `pm -> architecture` should be review-required until a clear reporting
  relationship exists.
- `architecture -> providers` should be forbidden.
- `pm -> runtime_future` should be future-gated.
- `dashboard -> pm` should require a future read-only contract before any
  implementation.

## Relationship To SOLID

Module boundary findings support SOLID principles:

- SRP: layers clarify ownership and responsibility.
- OCP: extension points can be proposed without modifying core modules.
- DIP: core and advisory layers stay independent of infrastructure.
- ISP: future contracts can be made smaller and caller-specific.
- LSP: future replacements can be reviewed against explicit layer contracts.

## Relationship To PM Core

Boundary findings may later feed:

- PM Status Reports,
- PM risk metadata,
- PM blocker metadata,
- Next Best Action recommendations,
- phase closeout summaries.

This relationship is context only. Boundary findings must not trigger PM
builders, state mutation, approvals, jobs, or refactors.

## Relationship To Autopilot

Boundary findings may become handoff, validation, or closeout context. They
must not start handoff runners, validators, memory persistence, next-action
coordination, or phase closeout by themselves.

## Future 112I Scope

Recommended safe implementation scope:

- create `src/architecture/moduleBoundaries.ts`,
- create `src/architecture/layerMap.ts`,
- update `src/architecture/index.ts`,
- create `docs/module-boundary-rules.md`,
- optionally create `scripts/module-boundary-rules-tests.ts`.

Future 112I should define source-only types, static layer constants, static
rule metadata, and pure helper functions. It should not add repo scanning,
source walking, import parsing, refactor engines, runtime wiring, provider
calls, dashboard mutation, OpenClaw, WhatsApp outbound, n8n, persistence,
DB/SQL, deployment, package changes, or workflow changes.

## Verification Plan For 112I

Recommended checks:

- `git status --short --branch`,
- TypeScript check with Windows Node fallback when WSL Node is unavailable,
- targeted boundary-rule smoke script if added,
- `git diff --check`,
- `git diff --cached --check`,
- staged file scope review,
- forbidden-pattern review over changed architecture files and docs.

## Return Path

After Phase 112I closes, the next formal target should be:

- Phase 113B - DEPENDENCY INVERSION RULES PLAN

Phase 113 should deepen DIP-focused rules using the module boundary metadata
from Phase 112.
