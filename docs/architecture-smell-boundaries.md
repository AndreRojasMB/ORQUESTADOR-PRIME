# Architecture Smell Boundaries

Phase: 114B - ARCHITECTURE SMELL TAXONOMY PLAN

Status: boundary plan / docs-only

## Purpose

This document defines safety boundaries for the future Architecture Smell
Taxonomy layer. The layer should catalog architecture review smells as
metadata only. It must not become a repository inspector, source parser,
refactor engine, runtime gate, dashboard adapter, provider bridge, or
enforcement system.

## Required Posture

The future smell taxonomy should remain:

- report-only,
- advisory-only,
- source-only,
- metadata-only,
- deterministic from caller-provided metadata,
- no scanner implementation,
- no source parser implementation,
- no refactor implementation,
- no runtime implementation.

## Forbidden Behavior

The layer must not:

- inspect the repository,
- walk source directories,
- parse imports from real files,
- parse syntax trees,
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

## Source Boundary For 114I

Future 114I source should stay inside `src/architecture`.

Allowed in 114I:

- local architecture imports,
- type-only PM imports for evidence and risk vocabulary if needed,
- imports from existing source-only architecture metadata,
- static smell category constants,
- static severity metadata,
- pure helpers over caller-provided metadata.

Disallowed in 114I:

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

## Finding Boundary

Architecture smell findings are review metadata. They are not:

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

## Evidence Boundary

Evidence references should be metadata-only and safe:

- docs,
- roadmap references,
- review notes,
- source module references without opening files,
- prior architecture finding ids.

Evidence must not include raw source dumps, logs, provider responses, dashboard
store data, production records, generated artifacts, credentials, or secrets.

## PM Boundary

PM may consume smell findings as report, risk, blocker, next-action, or
closeout context. Smell taxonomy rules must not mutate PM state or invoke PM
builders by themselves.

## Autopilot Boundary

Autopilot may receive smell findings as context in a future handoff or
closeout. Smell taxonomy rules must not trigger handoff, validation, memory
persistence, next-action coordination, or closeout.

## Dashboard Boundary

Dashboard must remain isolated. Smell metadata may be displayed in a future
read-only surface only after a dedicated dashboard plan exists.

## Stop Conditions For 114I

Phase 114I should stop and request review if implementation would require:

- source discovery,
- import parsing,
- syntax-tree parsing,
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
