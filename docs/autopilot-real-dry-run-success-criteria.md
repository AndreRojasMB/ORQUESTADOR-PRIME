# Autopilot Real Dry-Run Success Criteria

Phase: PILOT-1B - AUTOPILOT REAL DRY-RUN PLAN

Status: success criteria plan / docs-only

## Purpose

This document defines how PILOT-1I should be judged. The pilot should pass only
if it proves the Autopilot loop can produce useful coordination metadata
without taking real action.

## Pass Criteria

PILOT-1I should pass when:

- TypeScript typecheck passes,
- smoke tests pass,
- the dry-run accepts caller-supplied metadata only,
- validation summary is produced,
- memory output is proposal-only,
- error-learning rules are proposal-only,
- next-action recommendation is produced,
- phase closeout status is produced,
- human-facing coordinator response is produced,
- next prompt draft is produced as metadata only,
- no Codex invocation happens,
- no OpenClaw operation happens,
- no WhatsApp outbound behavior happens,
- no provider calls happen,
- no dashboard mutation happens,
- no memory persistence happens,
- no source-control mutation happens,
- no CI activation happens,
- no package changes happen,
- no DB/SQL or release-surface behavior happens,
- no dirty files outside scope are staged.

## Failure Criteria

PILOT-1I should fail or block when:

- a required safety flag is missing,
- report metadata is incomplete,
- validation cannot classify the sample,
- memory output is anything beyond a proposal,
- the next-action coordinator permits continuation despite blocking metadata,
- closeout reports safe continuation while scope is unsafe,
- prompt output is treated as permission to start work,
- any external action is requested,
- dirty files outside scope are staged,
- mobile Phase 121B docs are staged by mistake,
- package, workflow, dashboard, provider, DB/SQL, or runtime surfaces change.

## Verification Plan

Recommended verification for PILOT-1I:

- `git status --short --branch`,
- `node node_modules/typescript/bin/tsc --noEmit`,
- Windows Node fallback if WSL Node is unavailable,
- targeted smoke test for the dry-run result,
- `git diff --stat`,
- `git diff --name-only`,
- `git diff --check`,
- `git diff --cached --name-only`,
- forbidden grep over pilot source and docs.

## Smoke Assertions

The smoke test should assert:

- default fixture creation is deterministic,
- handoff package rendering returns metadata,
- report validation returns the expected status,
- memory proposal returns `proposed`,
- next-action result returns the expected next phase,
- closeout result returns the expected local-only status,
- prompt draft is present as text only,
- safety flags deny external action,
- no real workspace, provider, dashboard, memory, CI, or source-control action
  is represented as completed.

## Scope Criteria

Allowed PILOT-1I changes should be limited to:

- optional `src/autopilot/realDryRunPilot.ts`,
- optional `src/autopilot/realDryRunFixtures.ts`,
- optional `scripts/autopilot-real-dry-run-tests.ts`,
- `docs/autopilot-real-dry-run.md`.

The current Phase 121B mobile docs should remain local, untracked, and
unstaged unless a later mobile phase explicitly resumes that work.

## Roadmap Criteria

The pilot should not cancel the 121-140 roadmap.

After PILOT-1I:

- return to Phase 121I if the pilot closes cleanly, or
- plan a separate PILOT-2 if the dry-run exposes unresolved safety gaps.
