# Autopilot Loop Priority Pivot Plan

Phase: 26G-B - AUTOPILOT LOOP PRIORITY PIVOT PLAN

Status: planning / audit / docs-only

## Purpose

This document defines the priority pivot from channel approval plumbing toward
the first master task cycle for ORQUESTADOR-PRIME and Viernes:

```text
idea or objective
-> phase
-> structured task
-> Codex handoff
-> controlled execution
-> Codex report
-> validation
-> memory update proposal
-> next action recommendation
```

Phase 26G-B does not implement a runtime loop, automatic execution, provider
calls, outbound messages, dashboard mutation, OpenClaw behavior, n8n behavior,
deployments, stores, databases, or production controls. It creates planning
documents only.

## Current Context

Phase 26F-I closed the feature-flagged WhatsApp approval bridge:

- `handleWhatsAppMessage(...)` can intercept exact ORQUESTADOR approval
  commands after WhatsApp safety checks and before normal routing.
- The feature flag is default-off through `orquestadorApprovalBridgeEnabled`.
- The bridge returns observation text and keeps real outbound delivery outside
  this code path.
- Rollback is to disable the feature flag.

This phase treats the WhatsApp bridge as a future approval input, not as an
autopilot trigger. The master loop must be useful without WhatsApp, dashboard,
n8n, or OpenClaw being active.

## Relationship To Existing Roadmaps

This pivot does not delete, replace, or rewrite the post-100 PM/SOLID roadmap.
It adds a practical bridge so future phases can be planned, handed off,
validated, and closed through a controlled cycle.

The PM foundation already provides useful source-only concepts:

- ProjectState metadata,
- task graph and milestone metadata,
- Definition of Done metadata,
- risk and blocker metadata,
- autonomy policy metadata,
- approval gate metadata,
- next-best-action recommendations.

The 26G loop should reuse that vocabulary, but the first MVP remains
documentation and contract driven. It must not wire those PM modules into a
runtime executor yet.

## Autopilot Loop Stages

### 1. Intake

The loop starts with a simple user idea, objective, bug, or desired outcome.
The intake stage should preserve the original user wording and derive a safe
summary.

Required output:

- objective id,
- safe title,
- safe summary,
- source channel metadata,
- assumptions,
- exclusions,
- initial risk level,
- suggested phase kind.

The intake stage must not execute work, read secrets, call providers, or create
tasks in a persistent queue in the first MVP.

### 2. Phase Planning

The planner turns the idea into a bounded phase. A phase names the desired
outcome, mode, allowed files, forbidden files, verification plan, smoke plan,
rollback notes, and stop conditions.

Recommended modes:

- `B`: planning / audit / scope,
- `I`: implementation / verification,
- `R`: review / validation,
- `S`: smoke / status only.

### 3. Task Creation

The task creation stage converts the phase into one or more structured tasks.
The first MVP should create task metadata only, not a durable task runner.

Each task should include:

- task id,
- phase id,
- objective id,
- task title,
- mode,
- state,
- risk level,
- allowed files,
- forbidden files,
- entry criteria,
- exit criteria,
- verification commands,
- smoke checks,
- forbidden grep checks,
- required final report fields.

### 4. Codex Handoff

The handoff stage creates a complete Codex prompt with enough context to do
the work safely. It must include project path, branch, mode, previous phase
context, allowed files, forbidden files, commands, scope checks, and final
report format.

The handoff is not automatic in the first MVP. A human must review and approve
the prompt before it is given to Codex.

### 5. Codex Execution Report

Codex returns a structured report after a planning or implementation phase.
The report is treated as evidence for validation, not as proof by itself.

Required report fields are defined in
[`codex-handoff-contract.md`](codex-handoff-contract.md).

### 6. Validation

Validation checks the Codex report against the expected scope, commands,
test results, grep checks, dirty files, commit state, and safety boundaries.

The validator may classify the result as:

- accepted,
- accepted with warnings,
- needs review,
- blocked,
- failed.

The first MVP should produce validation metadata only. It must not revert,
commit, push, deploy, modify stores, or run external systems.

### 7. Memory Update Proposal

After validation, the loop may propose memory updates:

- completed phase,
- commit hash,
- artifacts created,
- risk notes,
- next phase recommendation,
- deferred decisions,
- unresolved dirty files.

In the first MVP, memory updates are proposals only. They are not written to a
memory store automatically.

### 8. Next Action Recommendation

The loop recommends the next safe action. This should align with existing
Next Best Action vocabulary:

- observe,
- report,
- plan,
- propose,
- request clarification,
- request approval metadata,
- update project-state metadata,
- defer due to risk,
- stop due to blocker.

The recommendation is advisory. It is not a job dispatch, proposal creation,
approval execution, git operation, runtime command, dashboard mutation, or
automation trigger.

### 9. Human Approval Gate

Any move from recommendation to implementation requires human approval. Any
future execution-capable work requires explicit phase authorization, approval
contract, validation plan, rollback plan, and stop conditions.

The human approval gate applies before:

- implementation phases,
- commits,
- pushes,
- external calls,
- provider sends,
- runtime execution,
- dashboard writes,
- OpenClaw usage,
- n8n workflow usage,
- deployment,
- release behavior,
- database or SQL changes.

## Task States

The first queue model should use these states:

- `pending`: task metadata exists and is waiting for handoff.
- `running`: Codex has been handed the task.
- `codex_done`: Codex returned a report.
- `validating`: the report is being checked.
- `needs_review`: human review is required before closing.
- `approved`: validation accepted the task result.
- `failed`: validation found an unacceptable failure.
- `blocked`: task cannot proceed because a prerequisite, boundary, or approval
  is missing.

## Risk Levels

Risk levels for the master loop:

- `observe_only`: may inspect and summarize.
- `report_only`: may produce status reports.
- `plan_only`: may create plans and contracts.
- `propose_only`: may recommend actions for human review.
- `execute_low_risk_future`: reserved for future approved low-risk execution.
- `execute_gated_future`: reserved for future approval-gated execution.
- `critical_plan_only`: critical risk; only planning and review allowed.

During the first MVP, allowed levels are limited to:

- `observe_only`,
- `report_only`,
- `plan_only`,
- `propose_only`,
- `critical_plan_only`.

Future execution levels remain denied.

## First MVP Boundaries

The first MVP must not:

- send provider messages,
- call outbound WhatsApp sends,
- run OpenClaw,
- run browser automation,
- mutate dashboard data,
- deploy,
- mutate databases or SQL,
- change package scripts,
- send real emails,
- process payments,
- perform production actions,
- create branches automatically,
- create commits automatically,
- create pull requests automatically,
- execute n8n workflows,
- write external memory automatically,
- execute user tasks automatically.

## Integration Direction

### WhatsApp Approval Bridge

The 26F bridge can later provide approval metadata or user approval commands.
It must not trigger autopilot execution directly. It should only move a human
approval signal into a future approved approval contract.

### Dashboard

Dashboard integration remains future-only and read-first. Any dashboard view
must use safe summaries and must not mutate config, stores, or runtime state in
the first MVP.

### OpenClaw

OpenClaw remains future-only. The first MVP may describe where OpenClaw would
fit, but it must not run tools, browser tasks, shell commands, or desktop
automation.

### n8n

n8n remains future-only. The first MVP may describe eventual workflow
boundaries, but it must not start or call workflows.

## Future Implementation Split

Recommended next phases:

- Phase 26G-I - AUTOPILOT LOOP CONTRACTS IMPLEMENTATION
- Phase 26H-B - CODEX HANDOFF RUNNER PLAN
- Phase 26H-I - CODEX HANDOFF RUNNER MVP
- Phase 26I-B - AUTOPILOT VALIDATION AND MEMORY PLAN
- Phase 26I-I - AUTOPILOT VALIDATION AND MEMORY MVP

Each implementation phase should stay small, default-off, and independently
verifiable.

## 26G-I Recommended Scope

Phase 26G-I should add source-only contracts for the loop:

- task state types,
- risk level types,
- handoff prompt metadata,
- report metadata,
- validation metadata,
- memory update proposal metadata,
- next action recommendation metadata.

It should avoid runtime runners, persistence, external calls, dashboard wiring,
WhatsApp wiring, n8n wiring, OpenClaw wiring, and package script changes unless
explicitly approved.
