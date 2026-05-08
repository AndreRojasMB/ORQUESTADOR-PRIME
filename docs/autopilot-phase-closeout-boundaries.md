# Autopilot Phase Closeout Boundaries

Phase: 26K-B - AUTOPILOT PHASE CLOSEOUT COORDINATOR PLAN

Status: safety boundary plan / docs-only

## Purpose

This document defines safety boundaries for the future Autopilot Phase Closeout
Coordinator.

The closeout coordinator is a review metadata layer. It decides whether the
current phase can be considered closed and whether the next phase can be
recommended for human review.

## Source-Only Boundary

The closeout coordinator should remain:

- source-only,
- metadata-only,
- advisory-only,
- deterministic,
- review-oriented,
- reversible.

It must not become a runner, worker, webhook bridge, provider adapter,
dashboard route, persistence adapter, CLI executor, deployment mechanism, or
git operator.

## Execution Boundary

The coordinator must not:

- execute Codex,
- launch a process,
- call OpenClaw,
- send WhatsApp messages,
- run n8n,
- dispatch jobs,
- dispatch actions,
- create proposals in an action store,
- execute approvals,
- mutate dashboard state,
- call providers,
- read environment values,
- use network calls,
- read or write files from source,
- mutate DB/SQL,
- deploy.

## Closeout Evidence Boundary

Closeout decisions must be based on caller-provided evidence only:

- final report metadata,
- validation metadata,
- test and smoke metadata,
- typecheck metadata,
- forbidden grep metadata,
- scope metadata,
- staged file metadata,
- dirty file metadata,
- commit and push metadata,
- approval metadata.

The coordinator should not collect this evidence itself.

## Commit And Push Boundary

The coordinator may classify whether commit or push evidence is present. It
must not run git commands from source or change repository state.

An implementation phase without commit/push evidence should not be marked
closed. A planning phase may be marked local-only when docs are intentionally
left for the next implementation commit.

## Dirty File Boundary

Dirty files outside scope are not automatically blocking when they remain
unstaged and are known pre-existing workspace context.

The coordinator should return:

- `No hay alerta` when scope is clean,
- `Alerta leve` when unrelated dirty files remain unstaged,
- `Alerta bloqueante` when forbidden or unrelated staged files are reported.

## Memory Boundary

The coordinator may inspect memory proposal status supplied by the caller. It
must not persist memory.

If a memory proposal still requires human approval, the coordinator should carry
that status forward and keep memory persistence disabled.

## Roadmap Boundary

The Autopilot pivot is support infrastructure. It must not delete, replace, or
bypass the formal roadmap.

Returning to Phase 109B should happen only after Phase 26K-I is closed and
pushed.

## Approval Boundary

Human approval is required before:

- accepting unresolved warnings,
- continuing after blocked closeout,
- changing execution boundaries,
- applying memory persistence,
- enabling provider writes,
- using OpenClaw,
- deploying,
- mutating dashboard state.

The system must not approve its own recommendation.

## Stop Conditions

The coordinator should return `blocked` or `unsafe_scope` when metadata reports:

- forbidden files modified,
- unrelated files staged,
- provider writes unexpectedly enabled,
- OpenClaw used unexpectedly,
- dashboard mutation,
- deployment,
- DB/SQL mutation,
- secrets or credential exposure,
- missing approval for critical risk,
- runtime behavior outside the approved phase.

## Phase 26K-I Guardrail

Phase 26K-I should add source-only closeout types and pure decision helpers. It
should not add package scripts, CLI entrypoints, live bridges, runtime workers,
provider calls, dashboard routes, persistent stores, job dispatch, or external
automation.

## Phase 26K-I Boundary Confirmation

The implemented MVP keeps closeout as a metadata decision layer. It has no
runner, no persistence adapter, no provider adapter, no dashboard surface, no
source git mutation, and no memory storage target.
