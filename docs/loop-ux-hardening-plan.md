# Loop UX Hardening Plan

Phase: PILOT-12B / PILOT-12I - LOOP UX HARDENING

Status: implemented as operational documentation / docs-only / advisory-only

## Purpose

This plan reviews the human experience of the manual loop:

```text
idea -> prompt package -> manual Codex session -> human-submitted report
-> validation -> closeout -> next action
```

The goal is to reduce operator friction before either returning to the main
roadmap or implementing a tighter manual-loop UX layer. This phase does not add
source behavior, invoke Codex, operate OpenClaw, move prompt text through system
buffers, retrieve external reports, call providers, or write project files from
source.

## UX Hardening Scope

The review should focus on:

- operator clarity across the whole loop
- step naming and evidence labels
- checklist usability
- stop condition visibility
- report template usability
- next-phase decision clarity
- friction reduction
- operator confidence
- manual-only safety posture
- wording that avoids accidental action assumptions

The review consumes existing docs and metadata models from:

- Real User Manual Loop Trial Instructions
- Real User Loop Trial Execution Report
- End-to-End Manual Loop Trial
- Controlled Codex Report Return
- Manual Codex Handoff Trial
- Human-Approved Codex Prompt Handoff
- next-action coordination
- phase closeout coordination

## Hardening Questions

Use these questions during review:

- Can an operator identify the current step without reading multiple documents?
- Can an operator tell whether they may continue, stop, retry, or ask for review?
- Are the evidence labels easy to capture and repeat?
- Are safety stops visible before risky human actions?
- Is the expected report shape easy to produce and validate?
- Are next-phase rules clear enough to avoid indecision?
- Are manual-only boundaries repeated at the points where mistakes are likely?
- Does any wording imply source-side action when only human action is intended?

## Proposed Improvements

Implemented improvements for PILOT-12I:

- added a one-page operator-facing hardening guide
- grouped stops by phase of work: before prompt transfer, before manual Codex run,
  after report return, and before next phase
- added friction categories with severity and priority labels
- normalized step names across guide, report, validation, next-action, and closeout
- made `safeToExecute=false` and `approved_for_copy` checks prominent
- added a short decision table for Phase 141B, PILOT-12 follow-up,
  PILOT-13B, retry, or blocked
- added plain-language "continue only if" wording beside each major gate

## Operator-Facing Artifact

PILOT-12I adds:

- `docs/loop-ux-hardening.md`

This document is the short operational layer the operator should use during
manual loop review. The four planning/model docs remain available as supporting
reference.

## Success Criteria

The hardening plan is successful when:

- friction categories are explicit
- checklist sections are defined
- stop conditions remain visible and blocking
- decision rules are deterministic enough for the next phase
- manual-only safety posture remains unchanged
- future implementation can improve docs without adding runtime behavior

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

## Integration

This plan consumes:

- `docs/real-user-manual-loop-trial-instructions.md` for operator steps and stop
  points
- `docs/real-user-loop-trial-execution-report.md` for report template,
  evaluation, and decision rules
- `docs/controlled-codex-report-return.md` for validation and closeout language
- `src/autopilot/endToEndManualLoopTrial.ts` for stage and manual-action labels
- `src/autopilot/controlledCodexReportReturn.ts` for alert and closeout statuses
- `src/autopilot/nextActionCoordinator.ts` for next-action routing
- `src/autopilot/phaseCloseoutCoordinator.ts` for closeout posture

The integration remains passive and documentation-only.

## Future Implementation Split

Phase PILOT-12I remained docs-only. Safe scope completed:

- added compact operator checklist
- added friction triage and next-decision tables
- preserved all source-only and manual-only boundaries
- did not modify source code

Optional next paths after PILOT-12I:

- Phase 141B - ROADMAP CONTINUATION PLAN, if the loop is usable with low
  friction
- PILOT-13B - LOOP DASHBOARD READINESS PLAN, if repeated trials need a future
  read-only operator surface
