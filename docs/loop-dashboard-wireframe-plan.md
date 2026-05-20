# Loop Dashboard Wireframe Plan

Phase: 144B - LOOP DASHBOARD WIREFRAME PLAN

Status: docs-only / advisory-only / wireframe planning

## Purpose

Plan the future wireframe for a manual loop dashboard without building UI. The
wireframe should help an operator understand the current loop run, review
prompt and handoff state, inspect approval/audit evidence, track manual actions,
review report return and validation, close out safely, and choose the next
phase.

This phase defines layout, screens, card structure, operator flow, visual status
language, and safety boundaries. It does not modify dashboard files or introduce
components, routes, persistence, providers, runtime behavior, OpenClaw operation,
Codex invocation, or source-side automation.

## Wireframe Scope

Future dashboard screens:

- Loop Overview
- Active Loop Run
- Prompt / Handoff Review
- Approval & Audit
- Manual Actions
- Report Return
- Validation / Closeout
- Next Action
- Blockers / Warnings

The wireframe should make the loop state scannable in under one minute while
keeping stop conditions and manual-only boundaries visible.

## Layout Model

Future metadata:

- `layoutId`
- `layoutName`
- `purpose`
- `sections`
- `primaryUserFlow`
- `navigationModel`
- `responsiveNotes`
- `accessibilityNotes`
- `riskLevel`
- `limitations`

Recommended layout:

- top status band with current stage, alert level, closeout, and next action
- left rail or compact tab set for screen navigation
- main content area with the active screen cards
- persistent Blockers / Warnings rail on desktop
- stacked blockers panel above content on mobile
- evidence drawer or section below the related card

## Screen Model

Future metadata:

- `screenId`
- `screenName`
- `purpose`
- `cards`
- `primaryActions`
- `secondaryActions`
- `stopConditions`
- `emptyState`
- `loadingState`
- `errorState`
- `riskLevel`
- `limitations`

Screen rules:

- every screen shows one clear state summary
- every screen shows blockers before secondary context
- every screen keeps manual-only wording visible
- screens never present a protected action as system-completed
- empty states explain which evidence is missing
- error states route to review, retry, or blocked status

## Card Wireframe Model

Future metadata:

- `cardId`
- `title`
- `purpose`
- `visibleFields`
- `statusBadges`
- `primaryAction`
- `secondaryAction`
- `disabledReason`
- `evidenceLinks`
- `safetyNotes`
- `operatorGuidance`
- `riskLevel`

Required card wireframes:

- Loop Overview
- Prompt Draft
- Handoff Approval
- Approval Gate
- Audit Evidence
- Manual Action Checklist
- Report Return
- Validation Result
- Closeout
- Next Action
- Blockers / Warnings

## Operator Flow

1. Open dashboard.
2. See current loop status in the top status band.
3. Review prompt draft and handoff state.
4. Check approval and audit evidence.
5. Perform any required manual action outside the system.
6. Submit or record report result manually in the approved flow.
7. Review validation status and alert level.
8. Accept closeout only if safe.
9. Choose next phase or stop/retry.

Every step must preserve human control. The wireframe may guide, but not perform,
the operator's manual step.

## UX Indicators

Visual language:

- `safe_to_continue`: calm success badge, label "Safe to continue"
- `review_required`: amber badge, label "Needs human review"
- `manual_action_required`: neutral/amber badge, label "Manual action required"
- `blocked`: strong stop badge, label "Blocked"
- `evidence_missing`: strong stop badge, label "Evidence missing"
- `closeout_ready`: success badge, label "Closeout ready"
- `next_phase_ready`: success badge with confirmation note, label "Next phase ready"

Stop indicators should be visually stronger than continue indicators. The
operator should never need hover-only details to understand a stop condition.

## Safety Boundaries

- docs-only
- advisory-only
- no dashboard implementation
- no dashboard mutation
- no UI components
- no source implementation
- no runtime execution
- no Codex invocation
- no OpenClaw operation
- no system copy-buffer automation
- no provider calls
- no file writes from source
- no package/workflow changes
- no DB/SQL
- no memory persistence
- no git automation from source

## Integration

Wireframes consume:

- Loop Dashboard Readiness for state, cards, UX signals, and operator actions.
- Loop UX Hardening for labels, stop conditions, and manual-only wording.
- Approval / Audit Hardening for approval gates, evidence, redaction, and
  rollback posture.
- Human-Approved Handoff for prompt draft and approval state.
- Manual Codex Trial for manual action checkpoints.
- Controlled Report Return for validation, alert, and closeout language.
- Next-action coordinator for recommended phase display.
- Phase closeout coordinator for status and safe-to-continue posture.

## Future Implementation Split

Phase 144I - LOOP DASHBOARD WIREFRAME IMPLEMENTATION:

- create source-only or docs-only wireframe metadata, depending on need
- define screens, layout sections, card wireframes, and visual indicator fixtures
- document future dashboard UI boundaries
- add smoke checks only if source metadata is introduced
- still no dashboard UI
- still no dashboard mutation

Potential Phase 145B candidates:

- Phase 145B - LOOP DASHBOARD STATIC UI PLAN
- Phase 145B - CONTROLLED AUTOMATION DECISION PLAN
- Phase 141+ roadmap continuation if dashboard path is paused

## Next Recommended Phase

Phase 144I - LOOP DASHBOARD WIREFRAME IMPLEMENTATION.
