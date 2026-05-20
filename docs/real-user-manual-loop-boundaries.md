# Real User Manual Loop Boundaries

Phase: PILOT-10B - REAL USER MANUAL LOOP TRIAL INSTRUCTIONS PLAN

Status: planning / audit / docs-only

## Purpose

This document defines the operational boundaries for a real user manual loop
trial. It makes the difference explicit between a human-operated trial and any
future automation layer.

## Allowed In PILOT-10B

- docs-only planning
- reviewing existing source and docs
- defining operator instructions
- defining guide and evaluation metadata
- defining stop conditions
- defining safety checks
- running local verification commands
- leaving dirty files outside scope untouched

## Not Allowed In PILOT-10B

- source implementation
- source-driven Codex invocation
- OpenClaw operation
- system copy-buffer automation
- prompt insertion automation
- automatic report retrieval
- provider calls
- network/API calls
- runtime file mutation
- package/workflow changes
- DB/SQL mutation
- dashboard mutation
- secret or environment access
- memory persistence
- source-control behavior from source
- commit or push

## Manual-Only Principle

The trial may describe human actions, but those actions are outside source
helpers:

- the human chooses the idea
- the human reviews the prompt draft
- the human approves manual transfer
- the human places the prompt in the separate Codex session
- the human supervises the separate Codex task
- the human submits the report text back
- the human reviews warnings and stop conditions

The repository only stores advisory metadata and documentation.

## Evidence Boundary

Evidence should be recorded as labels or structured metadata:

- `repo_state_known`
- `dirty_files_reviewed`
- `prompt_draft_reviewed`
- `approved_for_copy`
- `manual_transfer_confirmed`
- `manual_codex_run_confirmed`
- `report_text_submitted`
- `report_validated`
- `next_action_produced`
- `closeout_produced`

These labels do not imply that source code performed the action.

## Stop Boundary

The trial must stop if any of these occur:

- unknown staged files
- missing handoff approval
- unsafe prompt boundary
- action-ready prompt flag
- report missing required fields
- forbidden file touched
- dirty file outside scope staged
- runtime or provider action claim
- package/workflow mutation claim
- dashboard mutation claim
- DB/SQL mutation claim
- secret material exposure
- blocked or unsafe closeout

## Safe Continuation Boundary

The trial may continue only when:

- the handoff is approved for manual transfer
- `safeToExecute` remains false
- all external steps are human-reported
- report validation is clean or warnings are accepted by a human
- closeout is safe
- the next phase recommendation is explicit

## Relationship To Existing Layers

- Conversational Build Loop provides dry-run and prompt draft metadata.
- Human-Approved Handoff provides approval and checklist posture.
- End-to-End Manual Loop Trial provides full chain metadata.
- Controlled Report Return validates the human-submitted report.
- Next-action and closeout coordinators classify continuation posture.

No layer in this chain should become an executor during PILOT-10B.
