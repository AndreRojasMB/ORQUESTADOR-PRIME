# Autopilot Real Dry-Run Boundaries

Phase: PILOT-1B - AUTOPILOT REAL DRY-RUN PLAN

Status: safety boundary plan / docs-only

## Purpose

This document defines the safety boundaries for the first controlled Autopilot
real dry-run.

The pilot is a metadata rehearsal. It should demonstrate that the loop can move
from a simulated phase report to a next prompt draft while preserving human
control and avoiding external action.

## Required Posture

The dry-run must remain:

- source-only,
- dry-run only,
- metadata-only,
- report-only,
- advisory-only,
- caller-supplied input only,
- deterministic from supplied metadata,
- human-reviewed before any later execution-capable phase.

## Denied Behavior

The dry-run must not:

- write files from source,
- launch local or remote tools,
- invoke Codex,
- call OpenClaw,
- send WhatsApp outbound messages,
- call n8n,
- mutate dashboard state,
- call providers,
- persist memory,
- mutate source-control state,
- activate CI,
- change package scripts,
- mutate DB/SQL,
- touch release or shipping surfaces,
- read secrets,
- read environment values,
- use network calls,
- approve its own recommendation.

## Evidence Boundary

All evidence must be supplied by the caller or by static fixtures.

Allowed evidence metadata:

- report fields,
- handoff fields,
- validation results,
- command result summaries,
- test result summaries,
- scope status summaries,
- forbidden grep summaries,
- dirty and staged file summaries,
- commit and push summaries,
- approval status summaries,
- risk summaries,
- evidence reference labels.

The pilot must not collect this evidence itself.

## Memory Boundary

The memory stage may produce a proposal with human-review metadata. It must not
store, sync, publish, or apply memory.

The proposal should include:

- source report reference,
- source phase,
- safe summary,
- decision made,
- learning recommendations,
- unresolved issues,
- next phase,
- explicit human review requirement.

## Prompt Boundary

The prompt stage may produce prompt text for human review. It must not run the
prompt, start a task, contact a model provider, or initiate a handoff.

The prompt draft is a text artifact in memory only for the dry-run result.

## Source-Control Boundary

The dry-run may inspect simulated commit and push metadata. It must not run
source-control operations or change repository state.

Existing local files outside pilot scope must remain untouched and unstaged.
The current Phase 121B mobile docs must remain local, untracked, and outside
PILOT-1B staging scope.

## Stop Conditions

PILOT-1I should stop with a failed or blocked dry-run status when metadata
reports:

- missing required safety flags,
- a request for external action,
- real persistence,
- provider calls,
- dashboard mutation,
- source-control mutation,
- CI activation,
- package script changes,
- DB/SQL mutation,
- release or shipping behavior,
- missing human approval for risky continuation,
- dirty files outside scope reported as staged.

## Human Approval Boundary

Human review is required before:

- using the prompt draft,
- applying memory,
- continuing after blocked validation,
- accepting unresolved warnings,
- moving from dry-run metadata into any execution-capable pilot,
- changing the no-runtime boundary.
