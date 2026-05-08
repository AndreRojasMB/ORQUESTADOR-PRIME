# Dependency Inversion Boundaries

Phase: 113B - DEPENDENCY INVERSION RULES PLAN

Status: boundary plan / docs-only

## Purpose

This document defines safety boundaries for the future Dependency Inversion
Rules layer. The layer should describe dependency direction, abstraction
expectations, and concrete dependency risks as metadata only.

It must not become a repository scanner, import parser, refactor engine,
runtime gate, dashboard adapter, provider bridge, enforcement system, or source
rewriter.

## Required Posture

The future DIP layer should remain:

- report-only,
- advisory-only,
- source-only,
- metadata-only,
- deterministic from caller-provided metadata,
- no scanner implementation,
- no refactor implementation,
- no runtime implementation.

## Forbidden Behavior

The layer must not:

- inspect the repository,
- walk source directories,
- parse imports from real files,
- parse ASTs,
- rewrite imports,
- move modules,
- launch processes,
- read environment values,
- call networks,
- call providers,
- mutate dashboards,
- operate OpenClaw,
- send WhatsApp messages,
- run n8n,
- persist memory,
- mutate stores,
- mutate DB or SQL files,
- deploy,
- change package scripts,
- change workflows,
- perform source-control behavior from source.

## Source Boundary For 113I

Future 113I source should stay inside `src/architecture`.

Allowed in 113I:

- local architecture imports,
- type-only PM imports for evidence and risk vocabulary if needed,
- imports from existing source-only architecture metadata,
- static dependency category constants,
- static rule metadata,
- pure helpers over caller-provided metadata.

Disallowed in 113I:

- PM state mutation,
- Autopilot invocation,
- runtime imports,
- dashboard imports,
- provider imports,
- integration imports,
- WhatsApp imports,
- Viernes bridge imports,
- action/job/automation imports,
- config or credential imports,
- DB/SQL imports,
- deployment imports.

## Dependency Direction Boundary

The future model should preserve these review postures:

- core depends on contracts, not provider or runtime implementations,
- PM depends on source-only metadata, not concrete adapters,
- architecture depends on source-only metadata, not live-adjacent surfaces,
- Autopilot receives context metadata, not execution dependencies,
- adapters may depend on ports in future runtime phases,
- ports must not depend on concrete adapters,
- provider and config dependencies remain outside PM and architecture modules,
- runtime remains future-gated.

## Classifier Boundary

The dependency classifier should classify metadata supplied by the caller. It
must not discover imports by reading files.

Allowed classifier inputs:

- import path metadata,
- source layer,
- target layer,
- declared target category,
- boolean metadata for concrete/runtime/provider/dashboard posture,
- classification reason,
- evidence references.

Disallowed classifier inputs:

- raw source text,
- logs,
- secret-bearing config,
- provider output,
- dashboard store data,
- production records,
- generated artifacts.

## Finding Boundary

DIP findings are architecture review metadata. They are not:

- build errors,
- runtime gates,
- refactor commands,
- dashboard events,
- provider actions,
- job requests,
- approval records,
- deployment checks,
- persistence records.

Any future enforcement requires a separate phase with explicit approval,
rollback strategy, and verification.

## PM Boundary

PM may consume DIP findings as report, risk, blocker, next-action, or closeout
context. DIP rules must not mutate PM state or invoke PM builders by
themselves.

## Autopilot Boundary

Autopilot may receive DIP findings as context in a future handoff or closeout.
DIP rules must not trigger handoff, validation, memory persistence,
next-action coordination, or closeout.

## Dashboard Boundary

Dashboard must remain isolated. DIP metadata may be displayed in a future
read-only surface only after a dedicated dashboard plan exists.

## Stop Conditions For 113I

Phase 113I should stop and request review if implementation would require:

- source discovery,
- import parsing,
- AST parsing,
- source rewriting,
- runtime hooks,
- provider calls,
- dashboard changes,
- package changes,
- workflow changes,
- external automation,
- DB/SQL mutation,
- deployment behavior,
- real refactors outside the planned files.
