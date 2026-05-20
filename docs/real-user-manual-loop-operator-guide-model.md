# Real User Manual Loop Operator Guide Model

Phase: PILOT-10B - REAL USER MANUAL LOOP TRIAL INSTRUCTIONS PLAN

Status: planning / audit / docs-only

## Purpose

This document defines the future operator guide model for a real user manual
loop trial. The guide should be understandable by a product operator who is
testing the loop for clarity, safety, and usefulness.

## Operator Guide Metadata

Future model fields:

- `guideId`
- `trialName`
- `targetUser`
- `prerequisites`
- `stepList`
- `expectedInputs`
- `expectedOutputs`
- `safetyWarnings`
- `stopConditions`
- `successCriteria`
- `fallbackActions`
- `limitations`

## Target User

The target user is a human operator who can:

- read repo status output
- review a prompt draft
- identify allowed and forbidden files
- perform manual transfer into a separate Codex session
- submit a final structured report back to the Autopilot review flow
- decide whether warnings need escalation

The guide should not assume the operator will run external automation.

## Prerequisites

The operator should have:

- project path: `/home/varyan/projects/ORQUESTADOR-PRIME`
- branch: `dev`
- current roadmap phase and previous commit reference
- known dirty-file list
- default idea or selected simple idea
- approved handoff metadata
- expected report format
- stop-condition checklist

## Step List Shape

Each step should include:

- step id
- title
- objective
- human action required
- expected input
- expected output
- evidence label
- stop condition
- fallback action
- limitation

## Suggested Steps

1. Prepare repo state.
2. Select simple idea.
3. Use dry-run metadata or fixture.
4. Inspect prompt draft.
5. Approve handoff for manual transfer.
6. Place prompt into Codex by human action.
7. Wait for the separate Codex report.
8. Submit report text back.
9. Validate report.
10. Decide next phase.

## Expected Inputs

- idea text
- dry-run metadata ref
- prompt draft ref
- handoff package ref
- approval metadata
- report text
- repo status evidence
- validation evidence

## Expected Outputs

- reviewed prompt draft
- approval result
- manual transfer claim
- manual external run claim
- human-submitted report
- normalized report metadata
- validation result
- alert classification
- closeout result
- next-action recommendation
- operator feedback notes

## Safety Warnings

- Do not continue if the prompt is marked action-ready.
- Do not continue if approval is missing.
- Do not continue with unknown staged files.
- Do not accept a report that lacks scope check or forbidden grep evidence.
- Do not accept provider, runtime, package/workflow, dashboard, DB/SQL, or
  secret-material claims.
- Treat every external step as human-only metadata.

## Fallback Actions

- `retry_prompt_review`
- `repair_handoff_boundaries`
- `request_human_review`
- `retry_report_validation`
- `freeze_trial_scope`
- `return_to_planning`

## Limitations

- The guide cannot verify a live external session.
- Manual action evidence is human-supplied.
- Report validation is only as complete as the submitted report.
- Memory proposals remain advisory and are not persisted.
