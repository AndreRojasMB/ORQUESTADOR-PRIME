# Codex Handoff Runner Boundaries

Phase: 26H-B - CODEX HANDOFF RUNNER PLAN

Status: safety boundary plan / docs-only

## Purpose

This document defines the safety boundaries for a future Codex Handoff Runner
MVP. The runner may prepare prompts and validate report metadata. It must not
be an autonomous execution system.

## Allowed MVP Behavior

The runner MVP may:

- accept an approved autopilot task object,
- accept a `CodexHandoffContract`,
- render a Codex-ready prompt as markdown text,
- render an expected report schema,
- render validation and scope checklists,
- accept a human-supplied Codex report object,
- validate that the report has required sections,
- recommend the next validation or planning stage.

Allowed behavior is metadata-only and source-only.

## Prohibited MVP Behavior

The runner MVP must not:

- launch Codex,
- automate terminal sessions,
- launch local or remote processes,
- run shell commands from source,
- call provider APIs,
- call OpenClaw tools,
- run browser automation,
- send WhatsApp messages,
- call n8n workflows,
- mutate dashboard data,
- mutate memory,
- write stores,
- create database rows,
- write SQL migrations,
- deploy,
- create branches automatically,
- create commits automatically,
- push automatically,
- create pull requests automatically,
- approve itself.

## Prompt Export Boundary

The safest MVP output is a returned prompt string or structured prompt object.

If a later phase allows saving prompt markdown, the phase must define:

- exact output path,
- allowed filename pattern,
- overwrite policy,
- redaction policy,
- human approval requirement,
- rollback behavior.

No prompt export should include secrets, tokens, credential material, raw
provider responses, webhook credentials, vault contents, or production data.

## Report Intake Boundary

Report intake is structural. The runner may check whether a report contains
required fields, but it must not claim the work is correct without validation.

The report intake must keep reports as metadata until a validation phase checks:

- typecheck,
- tests,
- Python compile when relevant,
- git status,
- changed files,
- staged files,
- forbidden grep,
- secrets warnings,
- no real writes.

## Approval Boundary

Human approval is required before:

- using a generated implementation prompt,
- moving a task into implementation,
- writing memory,
- adding commit automation,
- adding push automation,
- touching dashboard write paths,
- using provider calls,
- using OpenClaw,
- using n8n,
- sending WhatsApp messages,
- touching DB or SQL,
- deploying.

Self-approval is invalid.

## Risk Boundary

Risk levels remain:

- `observe_only`,
- `report_only`,
- `plan_only`,
- `propose_only`,
- `critical_plan_only`.

The following remain future-only:

- `execute_low_risk_future`,
- `execute_gated_future`.

Critical actions stay plan-only.

## Integration Boundaries

### WhatsApp

WhatsApp may provide future human approval metadata. It must not trigger the
runner or deliver generated prompts automatically in the MVP.

### Dashboard

Dashboard may later display runner status. It must not mutate runner state,
tasks, memory, config, or stores in the MVP.

### OpenClaw

OpenClaw remains outside the MVP. The runner must not call desktop, browser, or
tool automation.

### n8n

n8n remains outside the MVP. The runner must not call workflows, schedule
workflows, or resume workflows.

### Git

The runner may render instructions about git checks when a phase requires them.
It must not perform branch, commit, push, or pull request operations from
source code.

### Memory

The runner may prepare a memory update proposal. It must not write memory or
learning data. A future memory phase must define redaction, approval, storage,
audit, and rollback.

## Stop Conditions

The runner must stop when:

- task metadata is not approved for handoff,
- required handoff fields are missing,
- allowed or forbidden file lists are empty for implementation mode,
- final report format is missing,
- requested risk level is future execution,
- a report omits scope check,
- a report omits forbidden grep result,
- a report claims unauthorized commit or push,
- a report includes forbidden files,
- a report includes secrets or credential material.

## Phase 26H-I Guardrail

Phase 26H-I should implement prompt and report metadata helpers only. It should
not add package scripts, runtime entrypoints, CLI commands, providers, channel
bridges, dashboard routes, job dispatch, automation, or persistent stores.
