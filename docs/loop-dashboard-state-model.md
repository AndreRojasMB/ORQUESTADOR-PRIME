# Loop Dashboard State Model

Phase: 143B - LOOP DASHBOARD READINESS PLAN

Status: docs-only / advisory-only / future metadata model

## Purpose

Define the future state snapshot that a loop dashboard could render. The model is
derived from existing manual loop metadata and should not become a separate
execution system.

## Dashboard State

Future metadata:

```ts
interface LoopDashboardState {
  dashboardStateId: string;
  loopRunRef: string;
  currentStage: string;
  promptDraftStatus: string;
  handoffStatus: string;
  approvalStatus: string;
  auditStatus: string;
  manualActionStatus: string;
  reportReturnStatus: string;
  validationStatus: string;
  alertLevel: string;
  closeoutStatus: string;
  nextAction: string;
  blockers: string[];
  warnings: string[];
  unresolvedQuestions: string[];
  evidenceRefs: string[];
  riskLevel: string;
  limitations: string[];
}
```

## Field Semantics

`dashboardStateId`
: Stable id for the displayed state snapshot.

`loopRunRef`
: Reference to the manual loop run or fixture being summarized.

`currentStage`
: Current stage from the end-to-end manual loop model.

`promptDraftStatus`
: Draft, ready for review, missing, blocked, or approved for manual review.

`handoffStatus`
: Handoff status from the human-approved handoff package.

`approvalStatus`
: Human approval state from approval/audit hardening.

`auditStatus`
: Summary of audit entries and evidence quality.

`manualActionStatus`
: Whether manual actions are pending, complete, blocked, or review-needed.

`reportReturnStatus`
: Whether report metadata is missing, submitted by human, normalized, or blocked.

`validationStatus`
: Controlled report validation status.

`alertLevel`
: `no_alert`, `mild_alert`, or `blocking_alert`.

`closeoutStatus`
: Phase closeout status.

`nextAction`
: Recommendation from next-action coordinator or closeout metadata.

`blockers`
: Blocking issues that prevent continuation.

`warnings`
: Non-blocking issues needing review.

`unresolvedQuestions`
: Open questions from dry-run, handoff, validation, or closeout.

`evidenceRefs`
: Evidence ids supporting displayed decisions.

`riskLevel`
: Highest risk level across current state.

`limitations`
: Explicit limits of the displayed state.

## Status Families

Prompt draft status:

- `missing`
- `draft`
- `needs_review`
- `ready_for_handoff`
- `blocked`

Handoff status:

- `draft`
- `needs_review`
- `approved_for_copy`
- `rejected`
- `blocked`

Approval/audit status:

- `approved`
- `needs_review`
- `blocked`
- `rejected`

Manual action status:

- `not_started`
- `manual_required`
- `completed_by_human`
- `needs_review`
- `blocked`

Report return status:

- `missing`
- `submitted_by_human`
- `normalized`
- `needs_review`
- `blocked`

Closeout status:

- `closed_and_pushed`
- `completed_local_only`
- `needs_commit`
- `needs_push`
- `needs_retry`
- `needs_human_review`
- `blocked`
- `unsafe_scope`

## Derived Signals

`safeToContinue`
: true only when approval/audit state is approved, validation is not blocking,
closeout is safe, no blockers exist, and next action is explicit.

`manualActionRequired`
: true when the next step needs a human operator, such as prompt transfer,
report submission, report acceptance, or next phase approval.

`doNotProceed`
: true when any blocker exists, alert level is blocking, closeout is unsafe, or
future-gated action is requested.

`dirtyFileWarning`
: true when dirty files outside scope exist, and critical when they are staged.

## Evidence Mapping

The state model should reference:

- prompt snapshot evidence
- approval decision evidence
- validation summary evidence
- closeout summary evidence
- next-action evidence
- dirty file state evidence
- forbidden grep result evidence
- typecheck and smoke evidence when relevant
- commit/push posture evidence when relevant

## Limitations

- State is derived from metadata; it does not observe live tools.
- State may be stale if repo state changes after evidence was captured.
- Evidence refs should not contain sensitive material.
- This model does not add persistence or UI.

## Next Recommended Phase

Phase 143I should decide whether this remains docs-only or becomes a source-only
metadata helper with fixtures.
