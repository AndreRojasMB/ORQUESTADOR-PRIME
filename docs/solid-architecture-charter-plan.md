# SOLID Architecture Charter Plan

Phase: 111B - SOLID ARCHITECTURE CHARTER PLAN

Status: planning / audit / docs-only

## Purpose

Phase 111 starts the SOLID / Architecture Quality Core after the PM Core
101-110 closure. The goal is to define a source-only architecture quality
charter before any refactor implementation is proposed.

This phase does not implement code, scanners, refactors, runtime behavior,
provider behavior, dashboard behavior, OpenClaw usage, WhatsApp outbound, n8n,
memory persistence, DB/SQL, deployment, package changes, workflow changes, or
source-control behavior from source.

## Charter Scope

The SOLID Architecture Charter should define review metadata for:

- SRP: single responsibility findings.
- OCP: extension versus core modification findings.
- LSP: contract and replacement safety findings.
- ISP: interface size and segregation findings.
- DIP: core and infrastructure dependency boundary findings.

The charter is an architecture review layer. It describes findings and
recommendations. It does not rewrite modules, move files, update imports,
create adapters, generate code, or enforce runtime behavior.

## Principle Model

### SRP - Single Responsibility Principle

SRP findings should identify modules that mix unrelated responsibilities.

Examples:

- planning mixed with execution,
- validation mixed with persistence,
- report building mixed with transport,
- provider-specific code mixed with PM vocabulary.

Suggested actions should stay advisory: split responsibility, document module
ownership, or defer a refactor plan.

### OCP - Open/Closed Principle

OCP findings should identify places where extending behavior appears to require
modifying a central core module.

Examples:

- hard-coded routing branches,
- large condition blocks for future module families,
- missing extension contracts,
- direct modification pressure on PM/autopilot source.

Suggested actions should prefer extension contracts and narrow adapters, but
must not create them in Phase 111B.

### LSP - Liskov Substitution Principle

LSP findings should identify contracts where a replacement implementation could
break expected behavior.

Examples:

- optional flags that are not honored consistently,
- result types that imply stronger guarantees than implementations provide,
- adapters that cannot safely replace a contract because boundaries differ.

Findings should describe contract safety only. They should not replace
implementations.

### ISP - Interface Segregation Principle

ISP findings should identify interfaces that force callers to depend on methods
or fields they do not need.

Examples:

- broad contracts mixing read, write, validation, reporting, and execution,
- large exported surfaces with unclear ownership,
- caller-facing types that expose live-adjacent details unnecessarily.

Suggested actions should propose smaller contracts for future phases.

### DIP - Dependency Inversion Principle

DIP findings should identify dependency direction issues between core policy,
advisory metadata, and infrastructure.

Examples:

- core modules importing live-adjacent infrastructure,
- PM or architecture layers depending on provider/dashboard/runtime surfaces,
- validation modules depending on transport or persistence details.

The initial DIP posture should keep source-only PM and architecture modules
free of live-adjacent imports.

## Integration With PM Core

SOLID findings may later feed:

- PM Status Reports,
- PM risk metadata,
- PM blocker metadata,
- Next Best Action recommendations,
- phase closeout summaries,
- Autopilot handoff context.

This integration is metadata only. SOLID findings do not trigger refactors,
handoffs, approvals, jobs, dashboard changes, provider calls, or runtime
behavior.

## Future 111I Scope

Recommended safe implementation scope:

- create `src/architecture/solidTypes.ts`,
- create `src/architecture/solidBoundaries.ts`,
- create `docs/solid-architecture-layer.md`,
- optionally create `scripts/solid-architecture-charter-tests.ts` if it can
  run without package changes.

Future 111I should define static types, constants, and documentation only.
It should not add scanners, refactor engines, source walking, runtime wiring,
providers, dashboards, OpenClaw, WhatsApp, n8n, persistence, DB/SQL,
deployment, package changes, or workflow changes.

## Verification Plan For 111I

Recommended checks:

- `git status --short --branch`,
- TypeScript check with Windows Node fallback when WSL Node is unavailable,
- targeted SOLID charter smoke script if added,
- `git diff --check`,
- `git diff --cached --check`,
- staged file scope review,
- forbidden-pattern review over changed architecture files and docs.

## Return Path

After Phase 111I closes, the next formal target should be:

- Phase 112B - MODULE BOUNDARY RULES PLAN

Phase 112 should refine dependency and module boundary rules using the charter
metadata defined in Phase 111.

## Non-Goals

Phase 111B does not:

- inspect repositories at runtime,
- scan files,
- modify source code,
- refactor modules,
- create architecture gates,
- persist findings,
- publish dashboard data,
- call providers,
- operate OpenClaw,
- send messages,
- run n8n,
- deploy,
- mutate DB/SQL files,
- change package scripts,
- change workflows.
