# Autopilot Dry-Run Hardening Boundaries

Phase: PILOT-2B - AUTOPILOT DRY-RUN HARDENING PLAN

Status: safety boundary plan / docs-only

## Purpose

This document defines the safety boundaries for the future Autopilot dry-run
hardening implementation.

The hardening layer should improve confidence in the dry-run. It must not turn
the dry-run into a runtime actor.

## Required Posture

PILOT-2I should remain:

- source-only,
- metadata-only,
- report-only,
- advisory-only,
- deterministic from supplied metadata,
- fixture-driven or caller-supplied,
- human-reviewed before any follow-up use.

## Denied Behavior

PILOT-2I must not:

- invoke Codex,
- launch local or remote tools,
- call OpenClaw,
- send WhatsApp outbound messages,
- call n8n,
- call providers,
- mutate dashboard state,
- persist memory,
- change package files,
- change workflow files,
- activate CI,
- mutate DB/SQL,
- touch release surfaces,
- read secrets,
- read environment values,
- use network calls,
- read or write files from source helpers,
- change source-control state from source.

## Evidence Boundary

All scenario evidence should be supplied as metadata:

- report metadata,
- handoff metadata,
- validation summaries,
- command result summaries,
- smoke result summaries,
- forbidden grep summaries,
- dirty/staged file summaries,
- commit/push summaries,
- approval summaries,
- risk summaries,
- prompt draft text.

The hardening layer should not gather evidence itself.

## Scenario Boundary

Scenarios may represent failure or blocked states, but those states are
metadata simulations.

Allowed simulated unsafe states:

- forbidden file modified,
- staged file outside scope,
- failed typecheck metadata,
- failed smoke metadata,
- forbidden grep failure metadata,
- missing commit/push metadata,
- blocked closeout metadata,
- incomplete prompt metadata.

These simulations must not create real unsafe state in the workspace.

## Memory Boundary

Memory hardening may check that memory output is proposal-only and
human-reviewable. It must not store, sync, publish, or apply memory.

The future quality gate should fail when memory output lacks explicit review
requirements or claims persistence.

## Prompt Boundary

Prompt hardening may inspect prompt text supplied by a fixture or caller. It
must not submit the prompt, contact a model provider, create a task, or start a
handoff.

The required human-facing sections remain:

1. Alerta
2. Siguiente fase
3. Modelo recomendado
4. Prompt listo para Codex

## Source-Control Boundary

Hardening may classify simulated commit and push metadata. It must not create
branches, commits, pushes, tags, or pull requests from source.

Existing local work outside PILOT-2 scope must remain untouched and unstaged.
The Phase 121B mobile docs remain outside the pilot scope.

## Stop Conditions

PILOT-2I should fail or block a scenario when metadata reports:

- external action requested,
- provider call represented as completed,
- dashboard mutation represented as completed,
- memory persistence represented as completed,
- source-control mutation represented as completed,
- CI activation represented as completed,
- DB/SQL mutation represented as completed,
- source or workflow mutation outside approved scope,
- missing human-facing response sections,
- unsafe staged files outside scope.
