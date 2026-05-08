# Autopilot Validation And Memory Plan

Phase: 26I-B - AUTOPILOT VALIDATION AND MEMORY PLAN

Status: planning / audit / docs-only

## Purpose

This document plans the future validation and external-memory proposal stage
for the ORQUESTADOR-PRIME / Viernes autopilot loop.

Phase 26I-B does not implement validators, memory persistence, runtime
execution, Codex execution, OpenClaw usage, WhatsApp outbound behavior, n8n
usage, dashboard mutation, provider calls, deployment, database changes, SQL,
or package/workflow changes.

## Current Context

Phase 26H-I added a source-only Codex Handoff Runner MVP:

- prompt renderer,
- expected report schema renderer,
- validation checklist renderer,
- handoff package generator,
- no Codex execution,
- no process launch,
- no provider sends,
- no OpenClaw,
- no dashboard mutation,
- no secrets, environment, or network access,
- no file export,
- no git automation.

Phase 26I should plan the next stage: how to validate a returned
`CodexReportContract`, classify the phase result, create a memory proposal, and
recommend the next action.

## Report Validation Inputs

The future validator should accept caller-provided metadata only:

- `CodexReportContract`,
- expected phase,
- expected branch,
- allowed files,
- forbidden files,
- required commands,
- expected tests,
- forbidden grep rules,
- previous dirty state,
- current dirty state,
- expected commit/push policy,
- human approval policy,
- risk level.

The validator should not read the repository, inspect environment variables,
query providers, or execute commands in the MVP. Command outputs should be
supplied by the caller as evidence metadata.

## Validation Outputs

The future validation result should include:

- status: `passed`, `failed`, `needs_review`, or `blocked`,
- scope violations,
- missing commands,
- failed commands,
- missing tests,
- forbidden grep violations,
- dirty files warning,
- secrets/logging warning,
- commit/push status,
- next action recommendation,
- human review requirement,
- safe summary,
- evidence references.

## Phase Result Classification

The validator should classify the phase as:

- `passed`: required checks passed, scope is clean, no prohibited content found.
- `failed`: required checks failed or the report conflicts with expected scope.
- `needs_review`: evidence is incomplete, warnings exist, or human judgment is
  needed.
- `blocked`: the task crossed a safety boundary, touched forbidden files, or
  requires approval that is missing.

Classification should be conservative. A report is not accepted merely because
it says the work succeeded.

## Scope Validation

Scope validation should compare:

- expected changed files,
- actual changed files from supplied status metadata,
- staged files from supplied status metadata,
- forbidden file list,
- allowed file list,
- known dirty files before the task,
- dirty files after the task.

Unrelated dirty files must remain unstaged. If unrelated files are staged, the
future validator should return `blocked`.

## Command And Test Validation

Command validation should check:

- required commands are present in the report,
- each required command has a result,
- failed commands are called out,
- skipped commands include a reason,
- Windows Node fallback is reported when WSL Node is unavailable,
- Python compile is included when Python files changed,
- typecheck is included when TypeScript files changed.

Test validation should check:

- expected tests are listed,
- each test result is present,
- missing tests include an explicit accepted reason,
- failures produce `failed` or `needs_review`.

## Forbidden Grep Validation

Forbidden grep validation should check supplied grep evidence for:

- runtime activation terms,
- provider send terms,
- OpenClaw execution terms,
- WhatsApp outbound terms,
- dashboard mutation terms,
- secrets or credential terms,
- environment-read terms,
- network-call terms,
- process-launch terms,
- DB/SQL/deploy terms.

Allowed matches must be explicitly explained as documentation-only, prohibited
behavior descriptions, or redacted examples.

## External Memory Proposal

The future memory step should create a proposal only. It should not persist
anything by itself.

The memory proposal should capture:

- source report reference,
- summary of what changed,
- error/fix learned,
- decision made,
- future rule recommendation,
- risk level,
- `requiresHumanApproval=true`,
- status: `proposed`, `approved`, `rejected`, or `deferred`.

The proposal should remain review metadata until a human approves a separate
memory persistence phase.

## Error Learning Model

Repeated errors should become future guardrail proposals. Initial guardrails:

- WSL Node unavailable: use the known Windows Node fallback and report the
  fallback honestly.
- Windows Node fallback works: prefer it only after WSL Node fails.
- Dirty files outside scope must remain unstaged.
- Feature flags must default off.
- Provider sends remain prohibited unless a future phase explicitly changes
  that boundary.
- OpenClaw execution remains prohibited unless a future phase explicitly
  authorizes it.
- Source-only modules must not launch processes.
- Handoff runner output remains prompt/report/checklist metadata only.

## Next Action Decision

The future decision stage should recommend one of:

- continue to next planning phase,
- continue to next implementation phase,
- retry implementation,
- request human review,
- freeze scope,
- prepare rollback plan,
- block due to risk.

Decision rules:

- `passed` with no warnings may recommend the next phase.
- `passed` with warnings may recommend human review or next planning phase.
- `failed` should recommend retry or rollback planning.
- `needs_review` should request human review.
- `blocked` should stop and require a new plan.
- critical risk always stays planning-only.

## Integration With Autopilot Loop

The validation and memory proposal stage connects after Codex report intake and
before next-action coordination:

```text
Codex report -> report validation -> memory proposal -> next action
```

This connection is metadata-only in the MVP. It must not start work, write
memory, create commits, push, call services, or move tasks without human
approval.

## Future Implementation Split

Recommended continuation:

- Phase 26I-I - AUTOPILOT VALIDATION AND MEMORY MVP
- Phase 26J-B - AUTOPILOT NEXT-ACTION COORDINATOR PLAN
- Phase 26J-I - AUTOPILOT NEXT-ACTION COORDINATOR MVP

## Phase 26I-I Implementation Note

Phase 26I-I implements this plan as source-only TypeScript metadata helpers:

- report validation against caller-supplied handoff evidence,
- validation summary generation,
- proposal-only memory update generation,
- advisory error-learning rule derivation,
- post-validation next-action recommendation.

The implementation remains metadata-only. It does not read the workspace, run
commands, call providers, persist memory, mutate git, or start a runtime loop.

Phase 26I-I should implement source-only validators and memory proposal
builders. It should not add runtime entrypoints, package scripts, dashboard
routes, persistent stores, provider calls, external execution, or deployment.
