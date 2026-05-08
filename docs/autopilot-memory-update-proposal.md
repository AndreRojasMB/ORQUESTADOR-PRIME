# Autopilot Memory Update Proposal

Phase: 26I-B - AUTOPILOT VALIDATION AND MEMORY PLAN

Status: memory proposal contract plan / docs-only

## Purpose

This document defines the proposal-only memory model for the autopilot loop.
Memory proposals help ORQUESTADOR-PRIME / Viernes remember completed phases,
decisions, error/fix patterns, and future guardrails after human review.

Phase 26I-B does not persist memory. It only plans the proposal contract.

## Memory Proposal Fields

A future proposal should include:

- proposal id,
- source report reference,
- source phase,
- summary of what changed,
- error/fix learned,
- decision made,
- future rule recommendation,
- risk level,
- evidence references,
- unresolved issues,
- next phase,
- `requiresHumanApproval=true`,
- status.

Status values:

- `proposed`,
- `approved`,
- `rejected`,
- `deferred`.

## Proposal-Only Rule

The memory stage must produce review metadata only. It should not persist,
publish, sync, upload, or apply memory by itself.

Any future memory persistence requires:

- human approval,
- redaction policy,
- storage target,
- audit trail,
- rollback plan,
- retention policy,
- failure handling.

## Error/Fix Learning Model

Initial learning candidates:

- WSL Node unavailable: document the fallback and continue only when fallback
  verification passes.
- Windows Node fallback works: report it clearly and avoid claiming WSL Node
  success.
- Dirty files outside scope: keep them unstaged and name them as pre-existing.
- Feature flags default off: do not activate new behavior by default.
- Provider sends remain prohibited unless a later phase explicitly changes the
  boundary.
- OpenClaw execution remains prohibited unless separately approved.
- Source-only modules must not launch processes.
- Handoff runner remains prompt/report/checklist metadata only.

## Decision Memory Model

Decision entries should capture:

- decision id,
- decision summary,
- alternatives considered,
- reason selected,
- risk accepted,
- approval status,
- future revisit trigger.

Decision entries must remain concise and redacted.

## Future Rule Recommendation

Future rules should be phrased as guardrails:

- when this error appears, use this fallback,
- when this boundary is present, stop and request review,
- when this dirty state appears, do not stage it,
- when this phrase appears in a report, require validation evidence.

Rules should not include secrets, raw logs, raw provider output, or credentials.

## Approval Requirement

Every proposal requires human approval before persistence. Human approval must
review:

- safe summary,
- redaction,
- risk level,
- storage target,
- rollback expectation,
- whether the memory should be temporary or long-lived.

Self-approval is invalid.

## Future Integration

Future memory integration should connect after report validation and before the
next-action coordinator:

```text
validated report -> memory proposal -> human review -> next action
```

The MVP should keep this as metadata. It must not write to a store or external
memory system.

## Phase 26I-I Contract Mapping

Phase 26I-I maps the proposal model to
`createMemoryUpdateProposalFromReport(...)`. The helper creates review metadata
with `requiresHumanApproval=true`, `status=proposed`, and an explicit
non-persistence boundary.

The implemented proposal is not a store adapter and does not apply learning
rules by itself.
