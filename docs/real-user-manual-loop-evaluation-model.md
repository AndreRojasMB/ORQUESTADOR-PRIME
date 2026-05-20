# Real User Manual Loop Evaluation Model

Phase: PILOT-10B - REAL USER MANUAL LOOP TRIAL INSTRUCTIONS PLAN

Status: planning / audit / docs-only

## Purpose

This document defines how a future real user manual loop trial should be
evaluated after the operator completes or stops the trial.

## Trial Evaluation Metadata

Future model fields:

- `evaluationId`
- `trialRef`
- `completedSteps`
- `failedSteps`
- `userConfusionPoints`
- `validationResult`
- `closeoutResult`
- `nextActionResult`
- `manualEffortLevel`
- `timeCostLabel`
- `usefulnessScore`
- `riskLevel`
- `recommendedImprovement`

## Completed Steps

Completed steps should be recorded as stable labels:

- `repo_state_prepared`
- `idea_selected`
- `dry_run_metadata_available`
- `prompt_draft_reviewed`
- `handoff_approved_for_copy`
- `manual_transfer_completed`
- `manual_codex_run_completed`
- `report_submitted`
- `report_validated`
- `next_phase_decided`

These labels are evidence claims supplied by the human operator.

## Failed Steps

Failed steps should identify the earliest point of failure:

- `dirty_files_unknown`
- `prompt_boundary_unsafe`
- `handoff_not_approved`
- `manual_transfer_not_completed`
- `report_missing`
- `report_incomplete`
- `validation_blocked`
- `closeout_unsafe`
- `next_action_unclear`

## User Confusion Points

The evaluation should capture where the operator hesitated:

- unclear dirty-file handling
- unclear prompt draft fields
- unclear handoff approval status
- unclear manual transfer evidence
- unclear report format
- unclear validation warnings
- unclear closeout status
- unclear next-phase recommendation

## Validation Result

Validation should classify:

- `passed`
- `needs_review`
- `failed`
- `blocked`

The evaluation should also record alert level:

- `no_alert`
- `mild_alert`
- `blocking_alert`

## Closeout Result

Closeout should classify:

- `completed_local_only`
- `closed_and_pushed`
- `needs_human_review`
- `needs_retry`
- `needs_commit`
- `needs_push`
- `blocked`
- `unsafe_scope`

For a planning-mode trial, `completed_local_only` is the expected clean result.

## Manual Effort Level

Manual effort labels:

- `low`
- `moderate`
- `high`
- `too_high`

The operator should use `too_high` if the trial requires too much context
switching or too many ambiguous manual checks.

## Time Cost Label

Time cost labels:

- `under_10_minutes`
- `10_to_20_minutes`
- `20_to_40_minutes`
- `over_40_minutes`

The target for a simple idea trial should be `10_to_20_minutes` after the guide
is polished.

## Usefulness Score

Usefulness score should be a 1 to 5 integer:

- 1: confusing or unsafe
- 2: usable only with heavy support
- 3: usable with clear friction
- 4: useful and mostly clear
- 5: ready for repeated manual trials

## Recommended Improvement

Recommended improvements may include:

- clarify step text
- add sample report
- add screenshot-free checklist
- reduce manual evidence fields
- improve stop-condition wording
- improve next-action explanation
- add operator FAQ
- add dry-run fixture selector

## Acceptance Criteria

The future real user trial is acceptable when:

- all safety boundaries are preserved
- operator can complete the guide without source-side automation
- report validation is understandable
- closeout result is explainable
- next phase recommendation is actionable
- user confusion points are captured
- improvement recommendation is specific
