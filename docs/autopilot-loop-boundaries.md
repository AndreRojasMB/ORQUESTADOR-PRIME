# Autopilot Loop Boundaries

Phase: 26G-B - AUTOPILOT LOOP PRIORITY PIVOT PLAN

Status: safety boundary plan / docs-only

## Purpose

This document defines the first-MVP boundaries for the ORQUESTADOR-PRIME /
Viernes autopilot loop. The word "autopilot" in this block means controlled
planning, handoff, report validation, memory update proposal, and next-action
recommendation. It does not mean autonomous execution.

## Allowed First-MVP Behavior

The first MVP may:

- receive an idea or objective as metadata,
- create a phase plan,
- create structured task metadata,
- generate a Codex handoff prompt for human review,
- receive a Codex report,
- validate the report against expected scope,
- propose memory updates,
- recommend the next safe action,
- require human approval before implementation or execution-capable work.

Allowed outputs are advisory records, plans, summaries, and review prompts.

## Prohibited First-MVP Behavior

The first MVP must not:

- send provider messages,
- send WhatsApp messages,
- run OpenClaw,
- run browser automation,
- mutate dashboard data,
- deploy,
- mutate databases,
- write SQL migrations,
- change package scripts,
- send real emails,
- process payments,
- perform production actions,
- call external providers,
- run n8n workflows,
- mutate stores automatically,
- write memory automatically,
- create branches automatically,
- create commits automatically,
- create pull requests automatically,
- execute jobs automatically,
- approve itself,
- bypass human review.

## Human Approval Requirements

Human approval is required before:

- any implementation phase starts,
- any commit is created,
- any push happens,
- any external service call is introduced,
- any dashboard write path is added,
- any runtime runner is added,
- any OpenClaw integration is activated,
- any n8n integration is activated,
- any WhatsApp outbound delivery is introduced,
- any provider send is introduced,
- any DB or SQL change is introduced,
- any package or workflow change is introduced.

Approval must be explicit, phase-scoped, and tied to a verification plan.

## Stop Conditions

The loop must stop and request review when:

- dirty files outside the phase scope are present and could be staged,
- a task requires secrets, credentials, tokens, or vault access,
- a requested action touches providers, deployment, database, workflows, or
  production behavior,
- a Codex report omits verification results,
- tests fail,
- typecheck fails without a documented accepted reason,
- forbidden grep finds a real activation,
- a task requests self-approval,
- a task asks to continue after a critical blocker.

## Risk-Level Rules

`observe_only`

- May inspect allowed files and summarize.
- Must not edit files.

`report_only`

- May produce status and findings.
- Must not propose execution.

`plan_only`

- May create plans, contracts, and verification strategy.
- Must not implement runtime behavior.

`propose_only`

- May recommend a next action.
- Must require human approval before implementation.

`execute_low_risk_future`

- Reserved for a later approved phase.
- Not allowed in the first MVP.

`execute_gated_future`

- Reserved for a later approval-gated phase.
- Not allowed in the first MVP.

`critical_plan_only`

- Critical risk remains planning-only.
- Must not proceed to implementation without a new plan and approval.

## Boundary With WhatsApp

The WhatsApp approval bridge may eventually carry explicit approval commands.
It must not start the autopilot loop by itself, approve ambiguous commands, or
send real outbound messages from the autopilot code path.

## Boundary With Dashboard

The dashboard may eventually display loop metadata. It must not mutate loop
state, config, memory, stores, runtime, or task queues in the first MVP.

## Boundary With OpenClaw

OpenClaw is future-only. The first MVP must not run desktop tools, browser
tools, shell operations, or external automation through OpenClaw.

## Boundary With n8n

n8n is future-only. The first MVP must not call, trigger, resume, or schedule
n8n workflows.

## Boundary With Memory

Memory updates are proposals only. The first MVP may produce a memory update
candidate, but it must not write to memory, stores, files, databases, or
learning systems automatically.

## Boundary With Git

The loop may recommend branch, commit, or push steps in a handoff prompt when
the phase explicitly allows them. The first MVP must not perform git
operations automatically.

## Rollback Model

Rollback for the first MVP is simple:

1. Stop using the generated handoff prompt.
2. Mark the task as `blocked` or `needs_review`.
3. Do not apply memory update proposals.
4. Do not trigger external systems.
5. Continue with a human-reviewed plan.
