# SOLID Review Checklist Boundaries

Phase: 115B - SOLID REVIEW CHECKLIST PLAN

Status: boundary plan / docs-only

## Purpose

This document defines safety boundaries for the future SOLID Review Checklist
layer. The layer should organize review questions, checklist items, templates,
and review findings as metadata only.

It must not become a repository reader, source parser, refactor engine,
runtime gate, dashboard adapter, provider bridge, enforcement system, or
source rewriter.

## Required Posture

The future checklist layer should remain:

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

## Source Boundary For 115I

Future 115I source should stay inside `src/architecture`.

Allowed in 115I:

- local architecture imports,
- type-only PM imports for evidence and risk vocabulary if needed,
- imports from existing source-only architecture metadata,
- static checklist item constants,
- static review template metadata,
- pure helpers over caller-provided metadata.

Disallowed in 115I:

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

## Checklist Item Boundary

Checklist items are review prompts. They are not:

- build errors,
- runtime gates,
- refactor commands,
- dashboard events,
- provider actions,
- job requests,
- approval records,
- deployment checks,
- persistence records.

Checklist items should ask for evidence and expected posture. They should not
collect evidence by reading files.

## Review Finding Boundary

Review findings are architecture review metadata. They should reference:

- checklist item ids,
- source module refs,
- affected layers,
- evidence refs,
- related SOLID finding ids,
- related module boundary finding ids,
- related Dependency Inversion finding ids,
- related smell finding ids.

Review findings must not contain raw source dumps, logs, provider responses,
dashboard store data, production records, generated artifacts, credentials, or
secrets.

## Review Template Boundary

Review templates define structure only:

- sections,
- checklist item ids,
- evidence expectations,
- output headings,
- safety boundaries,
- recommended next-action metadata.

Templates must not execute the review, launch tools, mutate reports, or write
state.

## PM Boundary

PM may consume review findings as report, risk, blocker, next-action, or
closeout context. Review checklist rules must not mutate PM state or invoke PM
builders by themselves.

## Autopilot Boundary

Autopilot may receive review findings as context in a future handoff or
closeout. Review checklist rules must not trigger handoff, validation, memory
persistence, next-action coordination, or closeout.

## Dashboard Boundary

Dashboard must remain isolated. Review checklist metadata may be displayed in a
future read-only surface only after a dedicated dashboard plan exists.

## Stop Conditions For 115I

Phase 115I should stop and request review if implementation would require:

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
