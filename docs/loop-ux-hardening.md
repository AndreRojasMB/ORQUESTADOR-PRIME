# Loop UX Hardening

Phase: PILOT-12I - LOOP UX HARDENING IMPLEMENTATION

Status: operational documentation / docs-only / advisory-only

## Purpose

This document hardens the human experience of the manual loop:

```text
idea -> prompt package -> separate human-managed Codex session
-> human-submitted report -> validation -> closeout -> next action
```

It gives the operator a shorter, clearer path through the loop while preserving
the manual-only safety posture. It does not add source code, invoke Codex from
source, operate OpenClaw, automate prompt transfer, retrieve external reports,
call providers, write project files from source, mutate dashboards, touch DB/SQL,
persist memory, or perform source-control behavior from source.

## UX Problems This Hardens

PILOT-10I and PILOT-11I are complete, but a real operator can still feel friction
around:

- knowing which document to read first
- distinguishing `approved_for_copy` from action-ready permission
- noticing stop conditions before the risky human step
- deciding whether a warning is mild or blocking
- filling out the report template without skipping evidence
- choosing between Phase 141B, PILOT-12 follow-up, retry, or blocked
- trusting that the workflow is manual-only even when Codex is mentioned

This hardening layer turns those concerns into a scan-friendly checklist and a
deterministic decision path.

## Friction Categories

Use the friction model when reviewing a trial:

- `unclear_step`: the operator cannot tell what to do next
- `too_many_steps`: the loop feels longer than necessary
- `ambiguous_stop_condition`: the operator cannot tell whether to stop
- `report_format_confusion`: the report template is hard to complete
- `approval_confusion`: approval state is misunderstood
- `scope_confusion`: allowed and forbidden files are unclear
- `copy_manual_friction`: human transfer is cumbersome or error-prone
- `validation_confusion`: validation status is hard to interpret
- `next_phase_confusion`: the final route is unclear
- `safety_warning_gap`: a warning is missing or appears too late

Severity:

- `low`: wording issue only
- `moderate`: slows the operator
- `high`: likely to cause retry or missed evidence
- `blocking`: could allow unsafe continuation

Priority:

- `p0`: fix before another real manual trial
- `p1`: fix in the next hardening pass
- `p2`: improve after core clarity
- `p3`: optional polish

## Simplified Operator Checklist

### Before Prompt Copy

Continue only if:

- repo path and branch are confirmed
- dirty files are known
- dirty files outside scope are not staged
- prompt package exists
- handoff is `approved_for_copy`
- `safeToExecute=false`
- human approval evidence is present

Stop if:

- approval is missing
- the prompt package is action-ready from source
- forbidden file scope is unclear
- unknown staged files appear

### Before Codex Run

Continue only if:

- the separate session is selected by the human
- project and branch are clear
- prompt text matches the approved package
- target phase is docs-only or metadata-only
- final report format is included

Stop if:

- target session is uncertain
- package/workflow/provider/dashboard/DB/SQL/secret-material areas are in scope
- the prompt asks for source-side external action

### After Codex Report

Continue only if the report includes:

- phase
- files inspected
- files modified
- summary
- safety guarantees
- tests/scripts
- commands executed
- scope check
- forbidden grep
- commit/push posture
- next recommended phase

Stop if:

- report is partial
- scope check is missing
- forbidden grep evidence is missing
- report claims unsafe runtime, provider, package/workflow, dashboard, DB/SQL, or
  secret-material action

### Before Next Phase

Continue only if:

- validation is `passed` or accepted `needs_review`
- alert level is `no_alert` or accepted `mild_alert`
- closeout is clean or explicitly reviewed
- next phase is explicit
- operator friction has been logged

Stop if:

- alert level is `blocking_alert`
- closeout is `blocked`
- closeout is `unsafe_scope`
- next phase conflicts with validation or closeout

## Clearer Stop Conditions

The operator must stop when:

- `safeToExecute=true` appears unexpectedly
- handoff is not `approved_for_copy`
- human approval evidence is missing
- dirty files outside scope are staged
- protected files are touched
- report lacks scope check
- report lacks forbidden grep evidence
- report claims unsafe runtime/provider/package/workflow/dashboard/DB/SQL or
  secret-material action
- closeout is `blocked`
- closeout is `unsafe_scope`

When a stop condition appears, do not route to the next phase. Record the
condition, keep the report as evidence, and choose retry or blocked status.

## Improved Next-Decision Rules

Use this priority order:

1. Safety issue -> blocked until fixed.
2. Weak validation -> retry PILOT-8 or PILOT-9.
3. Confusing manual operation -> revise PILOT-10 docs.
4. Confusing report or evaluation -> revise PILOT-11 docs.
5. Successful loop with high friction -> PILOT-12I follow-up or PILOT-13B.
6. Successful loop with low friction -> Phase 141B.

Decision examples:

| Result | Route |
| --- | --- |
| Clean validation, clean closeout, low friction | Phase 141B |
| Clean validation, clean closeout, high friction | PILOT-12I follow-up or PILOT-13B |
| Missing report evidence | Retry PILOT-8 or PILOT-9 |
| Operator could not follow instructions | Revise PILOT-10 docs |
| Report template caused confusion | Revise PILOT-11 docs |
| Safety breach or unsafe closeout | Blocked until fixed |

## Recommended Wording For User-Facing Steps

Use direct gate language:

- "Continue only if..."
- "Stop if..."
- "Record this evidence label..."
- "Do not infer missing evidence."
- "This approval allows human transfer only."
- "This closeout is an evidence decision, not an action."

Avoid wording that sounds like source-side action. Prefer:

- "human-managed Codex session"
- "human-submitted report"
- "manual transfer"
- "metadata evidence"
- "operator confirmation"

## Before/During/After Trial Checklist

### Before Trial

- choose one simple idea
- confirm repo path and branch
- review known dirty files
- confirm target phase is docs-only or metadata-only
- prepare the report template

### During Trial

- check handoff approval before prompt transfer
- keep `safeToExecute=false`
- transfer prompt only as a human action
- stop on any protected-scope uncertainty
- preserve evidence labels

### After Trial

- validate report fields
- classify alert level
- classify closeout
- log friction and usefulness score
- choose next phase using the priority order

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

## Limitations

- The operator still supplies evidence manually.
- The guide does not inspect external sessions.
- The guide cannot prove what happened outside the repository.
- No UI, dashboard, runner, or persistence layer is added.
- Repeated trials may still need a future read-only dashboard readiness plan.

## Next Recommended Phase

If friction is low and validation is clean:

- Phase 141B - ROADMAP CONTINUATION PLAN

If repeated trials need a better operator surface:

- PILOT-13B - LOOP DASHBOARD READINESS PLAN
