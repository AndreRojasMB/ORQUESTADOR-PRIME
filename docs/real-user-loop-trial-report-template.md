# Real User Loop Trial Report Template

Phase: PILOT-11B - REAL USER LOOP TRIAL EXECUTION REPORT PLAN

Status: planning / audit / docs-only

## Purpose

This template defines the report a human operator should complete after a real
manual loop trial. It is meant to be pasted into the Autopilot review context by
the human operator.

## Report Template Model

Future metadata fields:

- `trialId`
- `ideaText`
- `startState`
- `promptApproved`
- `codexReportReceived`
- `validationStatus`
- `alertLevel`
- `closeoutStatus`
- `manualEffortLevel`
- `userConfusionPoints`
- `usefulnessScore`
- `blockers`
- `recommendedFixes`
- `nextDecision`

## Copyable Report Template

```text
trialId:

ideaText:

startState:
- repo path:
- branch:
- known dirty files:
- staged files:
- source dry-run ref:
- handoff ref:

promptApproved:
- status: yes/no
- approval label:
- safeToExecute remained false: yes/no
- blocking checklist issues:

manualStepEvidence:
- prompt manually transferred: yes/no
- separate Codex session completed: yes/no
- report manually submitted back: yes/no

codexReportReceived:
- received: yes/no
- report phase:
- report mode:
- files inspected:
- files modified:
- commands reported:
- tests or smoke reported:
- scope check reported: yes/no
- forbidden grep reported: yes/no
- commit/push posture:
- next recommended phase:

validationStatus:
- status: passed/needs_review/failed/blocked
- alert level: no_alert/mild_alert/blocking_alert
- blockers:
- warnings:
- recommended fixes:

closeoutStatus:
- status:
- safe to continue: yes/no
- needs retry: yes/no
- needs human review: yes/no

manualEffortLevel:
- low/moderate/high/too_high

timeCostLabel:
- under_10_minutes/10_to_20_minutes/20_to_40_minutes/over_40_minutes

userConfusionPoints:
- item:

usefulnessScore:
- 1/2/3/4/5

recommendedFixes:
- item:

nextDecision:
- PILOT-12B / retry safety/report phase / Phase 141B / blocked
- reason:
```

## Field Guidance

`trialId` should be stable and human-readable.

`ideaText` should be the exact idea used during the manual loop trial.

`startState` should make dirty files and staged files visible before report
validation.

`promptApproved` should confirm `approved_for_copy` and that the prompt-use flag
remained false.

`manualStepEvidence` should remain human-supplied evidence only.

`codexReportReceived` should summarize the structured report produced by the
separate Codex session.

`validationStatus` should mirror Controlled Report Return output.

`closeoutStatus` should mirror closeout metadata.

`nextDecision` should choose the next path and explain why.

## Required Sections

The submitted report must include:

- trial id
- idea text
- start state
- prompt approval state
- manual step evidence
- Codex report received state
- validation status
- alert level
- closeout status
- blockers or none
- recommended fixes or none
- next decision

## Stop Before Acceptance

Do not accept the report when:

- prompt approval is missing
- `safeToExecute` became true
- report was not received
- report lacks scope check
- report lacks forbidden grep
- forbidden files were touched
- dirty files outside scope were staged
- package/workflow/provider/dashboard/DB/SQL/secret-material mutation is claimed
- closeout is `blocked`
- closeout is `unsafe_scope`
