# Autopilot Validation And Memory Boundaries

Phase: 26I-B - AUTOPILOT VALIDATION AND MEMORY PLAN

Status: safety boundary plan / docs-only

## Purpose

This document defines the safety boundaries for future Codex report validation
and external-memory proposal handling in the autopilot loop.

The future MVP should validate metadata and propose memory entries. It must not
become a runtime executor or unsupervised persistence path.

## Allowed MVP Behavior

The validation and memory MVP may:

- accept a `CodexReportContract` supplied by a caller,
- compare report metadata to expected phase metadata,
- classify status as passed, failed, needs review, or blocked,
- identify missing commands,
- identify failed commands,
- identify missing tests,
- identify scope violations,
- identify forbidden grep violations,
- identify dirty-file warnings,
- identify secrets/logging warnings,
- create a memory proposal object,
- create a next-action recommendation.

All behavior is source-only and metadata-only.

## Prohibited MVP Behavior

The MVP must not:

- execute Codex,
- launch local or remote processes,
- run shell commands from source,
- call provider APIs,
- call OpenClaw tools,
- send WhatsApp messages,
- call n8n workflows,
- mutate dashboard data,
- persist memory without human review,
- write stores,
- create database rows,
- write SQL migrations,
- deploy,
- create branches,
- create commits,
- push,
- create pull requests,
- approve itself,
- read secrets,
- inspect environment variables,
- use network calls.

## Human Approval Boundary

Human approval is required before:

- memory persistence,
- retrying implementation,
- rollback work,
- any commit or push automation,
- any external service call,
- any dashboard write path,
- any DB/SQL work,
- any deployment,
- any change from planning to execution-capable behavior.

Self-approval is invalid.

## Validation Boundary

Report validation is not proof of correctness. It is a structured review of
reported evidence. The validator should produce findings and recommendations,
then wait for human review when risk or uncertainty remains.

The validator must not:

- repair files,
- revert files,
- stage files,
- commit files,
- push files,
- run missing checks,
- perform rollback.

## Memory Boundary

Memory output is a proposal. It should describe what could be remembered:

- completed phase,
- key decision,
- error/fix pattern,
- future guardrail,
- next phase,
- unresolved risk.

The proposal must include `requiresHumanApproval=true`. Persistence requires a
separate approved phase with redaction, storage, audit, rollback, and review
rules.

## Error Learning Boundary

Learning entries must be safe summaries. They must not include:

- tokens,
- private keys,
- webhook credentials,
- vault contents,
- raw provider responses,
- production data,
- raw logs with sensitive values,
- unredacted user secrets.

## Dirty File Boundary

The validator should treat unrelated staged files as blocking. Existing dirty
files outside scope may remain in the workspace if they are not staged and the
phase report names them as pre-existing.

## Risk Boundary

Critical risk remains planning-only.

Future execution levels remain future-gated and unavailable in the MVP:

- `execute_low_risk_future`,
- `execute_gated_future`.

If a report claims execution beyond the approved phase, the validation result
should be `blocked`.

## Stop Conditions

The validation and memory stage must stop when:

- report structure is incomplete,
- required command evidence is missing,
- required test evidence is missing,
- forbidden files are touched,
- unrelated files are staged,
- forbidden grep has unapproved matches,
- secrets/logging warnings are present,
- commit or push happened when not allowed,
- risk level is future execution,
- human approval is missing.

## Future Phase Guardrail

Phase 26I-I should add source-only validation and proposal helpers. It should
not add package scripts, CLI entrypoints, runtime workers, provider calls,
channel bridges, dashboard routes, persistent stores, job dispatch, or external
automation.

## Phase 26I-I Boundary Confirmation

The implemented MVP keeps validation and memory output as caller-supplied
metadata. It has no runner, no persistence adapter, no provider adapter, no
dashboard surface, no git automation, and no memory storage target.
