# Real User Loop Trial Next Decision Model

Phase: PILOT-11B - REAL USER LOOP TRIAL EXECUTION REPORT PLAN

Status: planning / audit / docs-only

## Purpose

This document defines how to decide the next phase after the real user loop
trial execution report is reviewed.

## Decision Inputs

The decision should consume:

- validation status
- alert level
- closeout status
- manual effort level
- usefulness score
- blockers
- recommended fixes
- confusion points
- whether stop criteria were triggered

## Decision Options

### PILOT-12B - LOOP UX HARDENING PLAN

Choose PILOT-12B when:

- trial completes with `passed` or accepted `needs_review`
- no forbidden scope mutation is claimed
- operator confusion is mostly UX or wording related
- manual effort is `moderate`, `high`, or `too_high`
- usefulness score is 3 or higher
- next improvement is about clarity, reporting, prompts, or checklist flow

### Retry PILOT-6B / PILOT-7B / PILOT-8B

Choose a retry when the report exposes a safety-layer gap:

- PILOT-6B retry when automation-level boundaries are unclear
- PILOT-7B retry when OpenClaw readiness language is confusing or risky
- PILOT-8B retry when report-return validation or closeout classification is
  confusing, incomplete, or too permissive

Retry should remain planning-first and advisory.

### Phase 141B - ROADMAP CONTINUATION PLAN

Choose Phase 141B when:

- trial completes cleanly
- operator effort is acceptable
- usefulness score is 4 or 5
- no urgent UX hardening is required
- the roadmap should move back to broader continuation planning

### Blocked

Choose blocked when:

- closeout is `blocked`
- closeout is `unsafe_scope`
- alert level is `blocking_alert`
- forbidden scope mutation is claimed
- secret material appears
- report is missing or unusable

## Decision Model

Future metadata:

- `decisionId`
- `trialReportRef`
- `validationStatus`
- `alertLevel`
- `closeoutStatus`
- `manualEffortLevel`
- `usefulnessScore`
- `stopCriteriaTriggered`
- `selectedNextPhase`
- `decisionReason`
- `requiredFixes`
- `riskLevel`
- `humanApprovalRequired`
- `limitations`

## Decision Rules

Rule 1: Any `unsafe_scope` closeout selects `blocked`.

Rule 2: Any `blocking_alert` selects `blocked` unless a human reviewer marks a
safe retry path.

Rule 3: `mild_alert` with understandable warnings selects PILOT-12B or a
targeted retry.

Rule 4: Clean validation with usefulness score 4 or 5 may select Phase 141B.

Rule 5: Clean validation with usability friction selects PILOT-12B.

Rule 6: Missing report or missing required fields selects a retry of the report
template or report-return plan.

## Human Approval

A human reviewer must approve the next decision before the roadmap advances.
The model should never self-approve.

## Safety Boundaries

- docs-only
- no source implementation
- no Codex invocation from source
- no OpenClaw operation
- no system copy-buffer automation
- no automatic report retrieval
- no provider calls
- no network/API calls
- no file writes from source
- no package/workflow changes
- no DB/SQL
- no dashboard mutation
- no memory persistence
- no source-control behavior from source
