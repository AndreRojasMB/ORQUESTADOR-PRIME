# End-to-End Manual Loop Success Criteria

Phase: PILOT-9B - END-TO-END MANUAL LOOP TRIAL PLAN

Status: planning / audit / docs-only

## Purpose

This document defines success, warning, and block criteria for the future
End-to-End Manual Loop Trial.

## Success Criteria

The trial succeeds when all of the following are true:

- dry-run artifact chain is complete
- prompt draft metadata exists
- prompt draft is not action-ready
- handoff package passes safety checks
- handoff package passes completeness checks
- approval status is `approved_for_copy`
- `safeToExecute` remains false
- manual-copy evidence is supplied by a human
- external manual Codex run evidence is supplied by a human
- report return is human-submitted
- normalized report has required sections
- report phase and mode match
- allowed file scope is respected
- forbidden files are untouched
- dirty files outside scope are not staged
- typecheck and smoke evidence are present or explicitly reviewed
- forbidden grep evidence is clean or explicitly reviewed
- unsafe runtime, provider, package, workflow, dashboard, DB, and
  secret-material claims are absent
- report return validation is `no_alert` or accepted `mild_alert`
- next-action recommendation is produced
- closeout metadata is produced
- final human-facing response is produced
- no source-side external action occurred

## Warning Criteria

The trial may continue with `mild_alert` when:

- optional evidence is incomplete but blockers are absent
- typecheck or smoke evidence requires human explanation
- unresolved questions remain visible
- dirty files outside scope remain unstaged
- validation requires human review but scope remains safe
- memory proposal is available only as review metadata

Warnings must be visible in the final human-facing response.

## Block Criteria

The trial blocks when:

- prompt draft is marked action-ready
- handoff has blocking safety or completeness issues
- `safeToExecute` becomes true
- human approval metadata is missing
- manual action evidence is missing
- external report text is absent
- returned report is missing required fields
- report phase or mode mismatches
- forbidden files are touched
- dirty files outside scope are staged
- forbidden grep is not clean and not reviewed
- unsafe runtime claim appears
- provider mutation claim appears
- dashboard mutation claim appears
- DB/SQL mutation claim appears
- package/workflow mutation claim appears
- secret-material exposure appears
- closeout status is `unsafe_scope`
- closeout status is `blocked`

## Evidence Requirements

The future implementation should require metadata evidence for:

- source dry-run reference
- artifact chain reference
- prompt draft reference
- handoff package reference
- handoff approval reference
- manual copy claim
- manual run claim
- manual report-return claim
- normalized report reference
- validation reference
- next-action reference
- closeout reference
- human-facing response reference

Evidence remains caller-supplied metadata. It is not collected from a live
external session.

## Safety Boundary Checklist

The future trial must preserve:

- source-only
- advisory-only
- metadata-only
- manual-only external steps
- no Codex invocation from source
- no OpenClaw operation
- no system copy-buffer automation
- no prompt insertion automation
- no automatic report retrieval
- no provider calls
- no network/API calls
- no file writes from source
- no package/workflow changes
- no DB/SQL
- no dashboard mutation
- no secret or environment access
- no memory persistence
- no source-control behavior from source

## Acceptance Matrix

| Condition | Result |
| --- | --- |
| all required criteria pass | `completed_local_only` or expected clean closeout |
| warnings only, human review accepted | `needs_human_review` or accepted `mild_alert` |
| missing manual evidence | `blocked` |
| report scope violation | `unsafe_scope` |
| unsafe runtime/provider/package/dashboard/DB claim | `blocked` |
| report phase/mode mismatch | `blocked` |
| implementation closeout evidence missing | `needs_commit`, `needs_push`, or `needs_human_review` |

## Next-Action Criteria

The next-action recommendation should be:

- `continue_to_I_phase` for clean planning trial closeout
- `continue_to_next_B_phase` for clean implementation closeout
- `request_human_review` for accepted warnings
- `retry_phase` for fixable validation failure
- `blocked` for unsafe scope or missing manual evidence

## Future PILOT-9I Verification

Future implementation should include a smoke test that validates:

- default scenario exists
- all required stages exist
- manual action metadata exists
- action-ready prompt is blocked
- approved-for-copy handoff can proceed
- human-submitted report can be normalized
- clean report creates no alert
- mild report creates mild alert
- blocked report creates blocking alert
- closeout and next-action metadata are produced
- no external action assumptions are present
