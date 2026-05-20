# Real User Loop Trial Execution Report Plan

Phase: PILOT-11B - REAL USER LOOP TRIAL EXECUTION REPORT PLAN

Status: planning / audit / docs-only

## Purpose

PILOT-11B plans how a human operator will document and evaluate the first real
manual loop trial after following the PILOT-10I operator guide.

The report should capture the full trial path:

```text
idea -> approved prompt package -> human-managed Codex session
-> structured report -> validation -> alert classification
-> closeout -> next decision
```

This phase only defines reporting, evaluation, and decision metadata. It does
not invoke Codex from source, operate OpenClaw, automate system copy-buffer
behavior, retrieve reports from external sessions, call providers, write files
from source, mutate dashboards, touch DB/SQL, persist memory, or perform
source-control behavior from source.

## Execution Report Scope

The future report should capture:

- idea used
- prompt approval status
- prompt manually transferred
- Codex report received
- validation result
- alert level
- closeout result
- failed step, if any
- user confusion points
- manual effort
- usefulness score
- blockers
- recommended fixes
- next recommended phase

The report should not try to prove what happened in an external session by
automation. It should rely on human-supplied evidence labels and the structured
report text.

## Reporting Flow

1. Operator completes or stops the manual loop trial.
2. Operator fills the report template.
3. Autopilot or a human reviewer checks required report fields.
4. Controlled Report Return validates the submitted Codex report text.
5. Next-action and closeout metadata classify the outcome.
6. Reviewer chooses the next decision path.

## Required Evidence

The report should include evidence labels:

- `idea_selected`
- `prompt_approved`
- `manual_prompt_transfer_confirmed`
- `manual_codex_session_completed`
- `codex_report_received`
- `report_submitted`
- `validation_completed`
- `closeout_recorded`
- `next_decision_recorded`

These labels are operator statements. They do not imply source-side external
action.

## Report Review Questions

The reviewer should ask:

- Was the idea simple enough for a first trial?
- Did the operator understand the prompt approval state?
- Did the report include all required sections?
- Did validation produce a clear result?
- Did closeout match the validation result?
- Was the next decision obvious?
- Did any stop condition trigger?
- What should be improved before repeating the trial?

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

## Future Implementation Split

Phase PILOT-11I should create:

- `docs/real-user-loop-trial-execution-report.md`
- optional metadata-only checklist docs if needed

The implementation should remain documentation-first unless a future phase
explicitly authorizes a passive metadata source module.

## Next Phase Options

After PILOT-11I:

- PILOT-12B - LOOP UX HARDENING PLAN
- PILOT-6B / PILOT-7B / PILOT-8B retry if safety or report-return gaps appear
- Phase 141B - ROADMAP CONTINUATION PLAN
