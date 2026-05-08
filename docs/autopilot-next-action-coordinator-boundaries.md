# Autopilot Next-Action Coordinator Boundaries

Phase: 26J-B - AUTOPILOT NEXT-ACTION COORDINATOR PLAN

Status: safety boundary plan / docs-only

## Purpose

This document defines safety boundaries for the future Autopilot Next-Action
Coordinator.

The coordinator is a decision metadata layer. It should read only
caller-provided report, validation, memory proposal, risk, approval, and phase
state metadata. It should return the next recommended step for human review.

## Source-Only Boundary

The coordinator should remain:

- source-only,
- metadata-only,
- advisory-only,
- deterministic,
- review-oriented,
- reversible.

It must not become a runner, worker, webhook bridge, provider adapter,
dashboard route, persistence adapter, CLI executor, or deployment mechanism.

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

## Memory Boundary

The coordinator may inspect memory proposal metadata supplied by the caller.
It must not persist memory.

If a memory proposal has `requiresHumanApproval=true`, the coordinator should
carry that status forward and include it in the human-facing output. It should
not apply, sync, publish, or store the proposal.

## Git Boundary

The coordinator may inspect reported commit/push metadata supplied by the
caller. It must not run git commands from source or modify repository state.

If a planning phase reports commit or push metadata unexpectedly, the
coordinator should request review or block according to risk.

If an implementation phase lacks expected commit/push metadata, the coordinator
should request review rather than continuing silently.

## Dirty File Boundary

Dirty files outside scope are not automatically blocking when they remain
unstaged and are known pre-existing workspace context.

The coordinator should return:

- `No alert` when scope is clean,
- `Alerta leve` when unrelated dirty files remain unstaged,
- `Alerta bloqueante` when forbidden or unrelated staged files are reported.

## Approval Boundary

Human approval is required before:

- running a generated Codex prompt,
- applying memory persistence,
- continuing after blocked validation,
- accepting warnings in a risky phase,
- changing execution boundaries,
- enabling provider writes,
- using OpenClaw,
- deploying,
- mutating dashboard state.

The system must not approve its own recommendations.

## Risk Boundary

Risk handling should be conservative:

- `observe_only`, `report_only`, `plan_only`, and `propose_only` may continue
  through advisory steps.
- `critical_plan_only` remains planning-only.
- future execution risk levels require human review and must not continue to an
  implementation handoff.

## Stop Conditions

The coordinator should return `blocked` when metadata reports:

- forbidden files modified,
- unrelated files staged,
- provider writes unexpectedly enabled,
- OpenClaw used unexpectedly,
- dashboard mutation,
- deployment,
- DB/SQL mutation,
- secrets or credential exposure,
- missing approval for critical risk,
- runtime execution outside the approved phase.

## Rollback Boundary

`rollback_plan` means prepare a plan for human review. It does not revert files
or run commands.

## Phase 26J-I Guardrail

Phase 26J-I should add source-only coordinator types and pure decision helpers.
It should not add package scripts, CLI entrypoints, live bridges, runtime
workers, provider calls, dashboard routes, persistent stores, job dispatch, or
external automation.

## Phase 26J-I Boundary Confirmation

The implemented MVP keeps the coordinator as a metadata decision layer. It has
no runner, no persistence adapter, no provider adapter, no dashboard surface,
no source git mutation, and no memory storage target.
