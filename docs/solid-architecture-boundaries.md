# SOLID Architecture Boundaries

Phase: 111B - SOLID ARCHITECTURE CHARTER PLAN

Status: boundary plan / docs-only

## Purpose

This document defines safety boundaries for the future SOLID Architecture
layer. The layer should help reviewers describe architecture quality findings
without turning those findings into refactors, runtime gates, provider calls,
dashboard changes, or external automation.

## Architecture Layer Posture

The SOLID Architecture layer should remain:

- report-only,
- advisory-only,
- source-only,
- metadata-only,
- deterministic from caller-provided context,
- review-oriented.

It may describe architecture concerns and suggested actions. It must not apply
those suggestions by itself.

## Forbidden Behavior

The future architecture layer must not:

- perform direct refactors,
- scan the filesystem from source modules,
- launch processes,
- read environment values,
- call networks,
- call providers,
- mutate dashboards,
- use OpenClaw,
- send WhatsApp messages,
- run n8n,
- persist memory,
- mutate stores,
- modify DB or SQL files,
- deploy,
- change package scripts,
- change workflows,
- perform source-control operations from source.

## Import Boundaries

Future architecture source should stay inside `src/architecture`.

Allowed import direction for Phase 111I:

- architecture types may import shared PM boundary/evidence types if needed,
- architecture modules may define their own SOLID-specific vocabulary,
- architecture modules may remain independent from PM if that is cleaner.

Disallowed imports:

- runtime,
- dashboard,
- providers,
- integrations,
- WhatsApp bridges,
- Viernes bridges,
- actions,
- jobs,
- automation,
- scaffold,
- credentials,
- DB/SQL,
- deployment,
- release surfaces.

## Finding Boundary

SOLID findings are review metadata. They are not:

- tasks,
- action proposals,
- approval records,
- runtime gates,
- dashboard events,
- job requests,
- refactor commands,
- deployment checks.

Any future refactor suggested by a finding requires a separate B/I phase with
human review, scope definition, tests, rollback notes, and explicit file
permissions.

## PM Core Boundary

The architecture layer may feed PM Core reports and risk models as context.
It must not mutate PM state, rebuild PM reports by itself, or invoke
Autopilot stages.

PM remains the coordination vocabulary. SOLID remains an architecture review
vocabulary.

## Autopilot Boundary

SOLID findings may be included in future handoff context or closeout summaries.
They must not trigger handoff runners, validation runners, memory persistence,
next-action coordination, or phase closeout by themselves.

## Evidence Boundary

Evidence references should be metadata only. They should not require the
source module to open files, inspect logs, read provider output, read dashboard
state, or access secrets.

## Severity Boundary

Severity should guide human attention:

- `info`: architecture note,
- `warn`: design pressure or likely maintenance cost,
- `fail`: blocking architecture concern for the current advisory scope,
- `critical`: defer implementation and request human review.

Severity must not execute a fix or block runtime behavior in Phase 111.

## Stop Conditions For 111I

Phase 111I should stop and request review if implementation would require:

- scanners,
- file inspection,
- runtime wiring,
- provider calls,
- dashboard changes,
- package changes,
- workflow changes,
- OpenClaw,
- external automation,
- DB/SQL mutation,
- deployment behavior,
- real refactors outside the planned files.
