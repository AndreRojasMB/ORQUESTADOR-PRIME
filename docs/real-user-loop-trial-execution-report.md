# Real User Loop Trial Execution Report

Phase: PILOT-11I - REAL USER LOOP TRIAL EXECUTION REPORT IMPLEMENTATION

Status: operational documentation / docs-only / advisory-only

## Purpose

This document is the operator-facing report for a real manual loop trial. It
captures what happened when a human operator used the PILOT-10I instructions to
move from a simple idea to a human-submitted Codex report, validation, closeout,
and next decision.

The report is meant to answer:

- Did the operator complete the manual loop safely?
- Was the Codex report received and usable?
- Did validation and closeout produce clear results?
- Where did the operator experience friction?
- Should the roadmap move to hardening, retry, continuation, or blocked status?

## When To Use This Report

Use this report after the operator completes or stops a real manual loop trial:

```text
simple idea -> approved prompt package -> separate human-managed Codex session
-> structured report -> validation -> closeout -> next decision
```

Do not use this report as a runtime command, source task, automation trigger, or
external-session reader. It is a documentation and evaluation artifact only.

## Trial Report Template

Copy and complete this template after the trial:

```text
trialId:
dateLabel:
operator:

ideaText:

startState:
- repo path:
- branch:
- known dirty files:
- staged files:
- source dry-run ref:
- handoff ref:

promptApproved:
- approved_for_copy: yes/no
- approval label:
- safeToExecute remained false: yes/no
- blocking checklist issues:

promptCopiedManually:
- completed: yes/no
- evidence label:
- target session label:
- notes:

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
- passed/needs_review/failed/blocked

alertLevel:
- no_alert/mild_alert/blocking_alert

closeoutStatus:
- completed_local_only/closed_and_pushed/needs_human_review/needs_retry/needs_commit/needs_push/blocked/unsafe_scope

manualEffortLevel:
- low/moderate/high/too_high

timeCostLabel:
- under_10_minutes/10_to_20_minutes/20_to_40_minutes/over_40_minutes

userConfusionPoints:
- item:

usefulnessScore:
- 1/2/3/4/5

blockers:
- item or none:

recommendedFixes:
- item or none:

nextDecision:
- PILOT-12B / retry PILOT-10 or PILOT-11 / retry PILOT-6 or PILOT-7 or PILOT-8 / Phase 141B / blocked
- reason:

safeToContinue:
- yes/no
```

## Validation Result Section

Use this section to interpret `validationStatus` and `alertLevel`.

`passed` means:

- expected phase and mode matched
- required report sections were present
- file scope was respected
- forbidden files were untouched
- dirty files outside scope were not staged
- typecheck and smoke evidence were present or reviewed
- forbidden grep evidence was clean or reviewed
- unsafe runtime, provider, package/workflow, dashboard, DB/SQL, and
  secret-material claims were absent

`needs_review` means:

- the report is usable but warnings remain
- a human reviewer must accept or route the warnings
- the next decision should usually be hardening or retry

`failed` means:

- report evidence is insufficient or contradictory
- retry is required before closeout can continue

`blocked` means:

- a safety or scope blocker exists
- the trial must stop until the blocker is resolved

Alert levels:

- `no_alert`: clean continuation
- `mild_alert`: review needed
- `blocking_alert`: stop and repair

## Closeout Result Section

Use this section to interpret `closeoutStatus`.

Clean closeouts:

- `completed_local_only`: clean planning-mode closeout
- `closed_and_pushed`: clean implementation-mode closeout with commit and push
  evidence

Review or retry closeouts:

- `needs_human_review`: warnings or incomplete evidence require review
- `needs_retry`: report or validation should be retried
- `needs_commit`: implementation-mode work lacks commit evidence
- `needs_push`: implementation-mode work lacks push evidence

Blocked closeouts:

- `blocked`: unresolved blocker prevents continuation
- `unsafe_scope`: scope safety failed

Only clean closeouts should proceed without a new review step.

## Confusion And Friction Log

Record every point where the operator hesitated:

```text
confusionId:
step:
category:
- prompt approval state
- allowed/forbidden scope
- manual evidence labels
- report format
- validation result
- alert level
- closeout status
- next decision
operatorNote:
impact:
- low/moderate/high
recommendedFix:
```

Common friction examples:

- operator could not tell whether `approved_for_copy` was enough
- report format was too long or too ambiguous
- warning severity was unclear
- closeout and next decision disagreed
- dirty-file handling was hard to explain

## Usefulness Evaluation

Score usefulness from 1 to 5:

- `1`: unsafe or unusable
- `2`: too hard to repeat
- `3`: usable but clearly rough
- `4`: useful with minor cleanup
- `5`: ready for repeated manual trials

Manual effort levels:

- `low`: straightforward
- `moderate`: some document switching
- `high`: significant operator reconstruction
- `too_high`: not repeatable without hardening

Time cost labels:

- `under_10_minutes`
- `10_to_20_minutes`
- `20_to_40_minutes`
- `over_40_minutes`

## Risk Evaluation

Mark risk as:

- `low`: clean report, clear closeout, no sensitive or protected-scope concerns
- `medium`: warnings present but understood and contained
- `high`: report or closeout needs retry before continuing
- `critical`: safety breach, protected-scope issue, or unusable report

Risk becomes critical when:

- forbidden files were touched
- package/workflow files changed outside target scope
- provider mutation was claimed
- dashboard mutation was claimed
- DB/SQL mutation was claimed
- secret material appeared
- source-side external action was claimed
- closeout was `unsafe_scope`

## Next Decision Rules

Choose one of:

- `PILOT-12B - LOOP UX HARDENING PLAN`
- `retry PILOT-10 or PILOT-11 with fixes`
- `retry PILOT-6, PILOT-7, or PILOT-8`
- `Phase 141B - ROADMAP CONTINUATION PLAN`
- `blocked until safety issue is resolved`

Decision rules:

- If success and usefulness is 4 or 5, choose Phase 141B or PILOT-12B depending
  on remaining UX friction.
- If success has high friction, choose PILOT-12B.
- If validation or closeout is weak, retry the relevant pilot.
- If handoff or report-return safety was weak, retry PILOT-6, PILOT-7, or
  PILOT-8.
- If any safety breach occurs, choose blocked.

## Final Recommendation Format

Use this final block:

```text
finalRecommendation:
- selectedNextPhase:
- decisionReason:
- safeToContinue: yes/no
- requiredFixes:
- humanApprovalRequired: yes/no
- notes:
```

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

## Known Limitations

- The report depends on human-supplied evidence.
- It cannot inspect a live external session.
- It cannot prove what happened outside the repository.
- It does not persist memory.
- It does not advance the roadmap without human approval.
- It cannot replace Controlled Report Return validation.

## Next Recommended Phase

If the real user trial report is usable:

- PILOT-12B - LOOP UX HARDENING PLAN

If the trial is clean and the roadmap should move on:

- Phase 141B - ROADMAP CONTINUATION PLAN
