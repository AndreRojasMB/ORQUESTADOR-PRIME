# Loop UX Friction Model

Phase: PILOT-12I - LOOP UX HARDENING IMPLEMENTATION

Status: implemented as operational documentation / docs-only / advisory-only

## Purpose

The friction model gives PILOT-12I a way to describe where the manual loop feels
unclear, repetitive, risky, or hard to complete. It is advisory metadata for
operator experience review only.

## Friction Metadata

Friction records should include:

- `frictionId`
- `sourceStep`
- `frictionType`
- `description`
- `severity`
- `userImpact`
- `suggestedImprovement`
- `safetyImpact`
- `priority`

## Friction Categories

Allowed `frictionType` values:

- `unclear_step`
- `too_many_steps`
- `ambiguous_stop_condition`
- `report_format_confusion`
- `approval_confusion`
- `scope_confusion`
- `copy_manual_friction`
- `validation_confusion`
- `next_phase_confusion`
- `safety_warning_gap`

## Severity Labels

Use these severity labels:

- `low`: small wording or formatting issue
- `moderate`: slows the operator but does not block the loop
- `high`: likely to cause wrong routing, retry, or missed evidence
- `blocking`: could cause unsafe continuation or invalid closeout

## Priority Labels

Use these priority labels:

- `p0`: must fix before another real manual trial
- `p1`: should fix in PILOT-12I
- `p2`: useful improvement after core safety clarity
- `p3`: optional polish

## Candidate Friction Items

### Approval Meaning

- `frictionId`: `approval-state-meaning`
- `sourceStep`: `confirm handoff approval state`
- `frictionType`: `approval_confusion`
- `description`: Operator may confuse `approved_for_copy` with permission for
  source-side action.
- `severity`: `high`
- `userImpact`: Operator needs extra interpretation before continuing.
- `suggestedImprovement`: Place `approved_for_copy` beside a short note that it
  only permits human transfer.
- `safetyImpact`: Reduces accidental action assumptions.
- `priority`: `p1`

### Stop Condition Visibility

- `frictionId`: `stop-conditions-scattered`
- `sourceStep`: `before manual Codex run`
- `frictionType`: `ambiguous_stop_condition`
- `description`: Stop conditions are correct but spread across guide, report,
  validation, and closeout docs.
- `severity`: `moderate`
- `userImpact`: Operator may need to cross-check multiple docs.
- `suggestedImprovement`: Add a single stop matrix grouped by moment in the loop.
- `safetyImpact`: Makes blocking conditions harder to miss.
- `priority`: `p1`

### Report Shape Length

- `frictionId`: `report-template-length`
- `sourceStep`: `after report return`
- `frictionType`: `report_format_confusion`
- `description`: Report templates are comprehensive but may feel heavy during a
  live manual trial.
- `severity`: `moderate`
- `userImpact`: Operator may omit fields or ask for clarification.
- `suggestedImprovement`: Add a short required-fields checklist before the full
  report template.
- `safetyImpact`: Preserves required evidence while reducing fatigue.
- `priority`: `p2`

### Next Phase Ambiguity

- `frictionId`: `next-phase-routing`
- `sourceStep`: `decide next phase`
- `frictionType`: `next_phase_confusion`
- `description`: Phase 141B, PILOT-12I, retry, and blocked paths are available,
  but the operator may not know which one wins.
- `severity`: `high`
- `userImpact`: Closeout may stall even when validation is usable.
- `suggestedImprovement`: Add a deterministic decision table with priority order.
- `safetyImpact`: Prevents continuing when a retry or blocked state should win.
- `priority`: `p1`

## Triage Rules

- Any `blocking` item becomes a stop condition for the next manual trial.
- Any safety-related `high` item should be handled in PILOT-12I.
- `moderate` friction may be batched if safety boundaries are already clear.
- `low` friction should not delay roadmap continuation unless it repeats across
  multiple trials.

## Friction Review Worksheet

Use this worksheet after a real manual loop trial:

```text
frictionId:
sourceStep:
frictionType:
description:
severity:
userImpact:
suggestedImprovement:
safetyImpact:
priority:
owner:
nextAction:
```

Severity decision:

- choose `blocking` if the issue could hide a stop condition
- choose `high` if the issue could cause retry or missed evidence
- choose `moderate` if the issue slows the operator but does not risk scope
- choose `low` for wording, formatting, or ordering polish

Priority decision:

- `p0`: stop the next real trial until fixed
- `p1`: fix in the next hardening pass
- `p2`: fix after safety-critical clarity
- `p3`: keep as polish backlog

## Safety Boundaries

- docs-only
- no source implementation
- no Codex invocation from source
- no OpenClaw operation
- no system copy-buffer automation
- no automatic report retrieval
- no provider calls
- no file writes from source
- no package/workflow changes
- no DB/SQL
- no dashboard mutation
- no memory persistence
