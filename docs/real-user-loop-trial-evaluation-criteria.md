# Real User Loop Trial Evaluation Criteria

Phase: PILOT-11B - REAL USER LOOP TRIAL EXECUTION REPORT PLAN

Status: planning / audit / docs-only

## Purpose

This document defines how to score a real manual loop trial after the operator
submits the execution report.

## Success Criteria

The trial succeeds when:

- operator completes the loop manually
- prompt package was approved for manual transfer
- prompt-use flag remained false
- structured Codex report was received
- report includes all required sections
- validation status is `passed`
- alert level is `no_alert`
- closeout is `completed_local_only` for a planning target or
  `closed_and_pushed` for an implementation target
- next decision is explicit
- no unsafe action claim appears
- no stop condition was triggered

## Partial Success Criteria

The trial is a partial success when:

- operator completes the manual loop
- report is present
- validation status is `needs_review`
- alert level is `mild_alert`
- closeout is `needs_human_review`
- warnings are understandable
- next decision is either human review, retry, or targeted hardening
- no forbidden scope mutation is claimed

Partial success should usually feed PILOT-12B unless the warning points to an
earlier safety layer.

## Failure Criteria

The trial fails when:

- report is missing
- report is incomplete
- validation status is `failed`
- alert level is `blocking_alert`
- closeout is `blocked`
- closeout is `unsafe_scope`
- next decision is unclear
- operator cannot tell what to do next

## Stop Criteria

Stop and do not continue when the report indicates:

- forbidden files touched
- `package.json` changed without explicit target scope
- workflow files changed without explicit target scope
- provider mutation
- dashboard mutation
- DB/SQL mutation
- secret material exposure
- runtime action outside the target phase
- dirty files outside scope staged
- report lacks scope check
- report lacks forbidden grep

## Manual Effort Evaluation

Manual effort levels:

- `low`: operator completed the report with little friction
- `moderate`: operator needed to inspect several docs but finished safely
- `high`: operator needed repeated clarification or manual reconstruction
- `too_high`: trial is not repeatable without UX hardening

## Usefulness Score

Usefulness score:

- `1`: unsafe or unusable
- `2`: hard to use and needs major rework
- `3`: usable with clear friction
- `4`: useful with minor improvements
- `5`: ready for repeated manual trials

## Confusion Point Categories

Track confusion in these categories:

- prompt approval state
- allowed and forbidden file scope
- manual evidence labels
- report format
- validation result
- alert classification
- closeout status
- next decision

## Recommended Improvement Rules

Recommend one or more:

- improve operator guide wording
- add sample completed report
- clarify handoff approval evidence
- simplify manual evidence labels
- improve report template fields
- improve warning language
- add closeout examples
- route back to safety-layer retry
- route to UX hardening

## Acceptance Gate

The report is acceptable for phase closeout only when:

- required fields are present
- stop criteria are absent
- validation result is clear
- closeout result is clear
- next decision is clear
- manual effort and usefulness are scored
