# Loop Dashboard Wireframe

Phase: 144I - LOOP DASHBOARD WIREFRAME IMPLEMENTATION

Status: source-only / advisory-only / metadata-only

## Purpose

Phase 144I adds passive wireframe metadata for a future manual loop dashboard.
It defines layout, screens, card wireframes, operator flow, UX indicators, and
summary helpers without creating dashboard UI.

This phase does not modify dashboard files, create UI components, add routes,
invoke Codex, operate OpenClaw, perform copy or paste for the operator, call
providers, touch DB/SQL, persist memory, write project files from source, or
change package/workflow surfaces.

## Layout Model

`LoopDashboardLayout` records:

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

The default layout includes a top status band, navigation, active screen
content, blockers/warnings panel, evidence section, and next-action footer.

## Screen Model

`LoopDashboardScreen` records:

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

Required screens:

- `loop_overview`
- `active_loop_run`
- `prompt_handoff_review`
- `approval_audit`
- `manual_actions`
- `report_return`
- `validation_closeout`
- `next_action`
- `blockers_warnings`

## Card Wireframe Model

`LoopDashboardCardWireframe` records:

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

- `loop_overview`
- `prompt_draft`
- `handoff_approval`
- `approval_gate`
- `audit_evidence`
- `manual_action_checklist`
- `report_return`
- `validation_result`
- `closeout`
- `next_action`
- `blockers_warnings`

Cards describe what a future dashboard may display. They do not create UI or
perform actions.

## Operator Flow

`LoopDashboardOperatorFlow` represents:

- open dashboard
- inspect current loop status
- review prompt/handoff
- check approval/audit
- perform manual action outside system
- submit report manually
- review validation
- accept closeout
- choose next phase

The flow is `manualOnly=true` and `automationAllowed=false`.

## UX Indicators

`LoopDashboardUxIndicator` records:

- `indicatorId`
- `label`
- `meaning`
- `visualIntent`
- `severity`
- `continueAllowed`
- `humanActionRequired`
- `evidenceRequired`
- `recommendedWording`
- `limitations`

Required indicators:

- `safe_to_continue`
- `review_required`
- `manual_action_required`
- `blocked`
- `evidence_missing`
- `closeout_ready`
- `next_phase_ready`

## Helpers

Implemented helpers:

- `createLoopDashboardWireframe(...)`
- `createLoopDashboardLayout(...)`
- `createLoopDashboardScreen(...)`
- `createLoopDashboardCardWireframe(...)`
- `createLoopDashboardUxIndicator(...)`
- `buildDefaultLoopDashboardWireframe(...)`
- `summarizeLoopDashboardWireframe(...)`
- `selectCardsByScreen(...)`
- `selectIndicatorsBySeverity(...)`

## Integration

Loop Dashboard Wireframe consumes:

- Loop Dashboard Readiness state, card, signal, and operator-action vocabulary.
- Loop UX Hardening labels and stop/continue guidance.
- Approval / Audit Hardening evidence, approval gates, and rollback posture.
- Human-Approved Handoff prompt and approval state.
- Manual Codex Trial manual checkpoints.
- Controlled Report Return validation and closeout status language.
- Next-action and phase closeout coordinator status vocabulary.

The wireframe layer gives a future static dashboard planning phase a stable
metadata contract while preserving source-only advisory behavior.

## Safety Boundaries

- source-only
- metadata-only
- advisory-only
- no dashboard UI
- no UI components
- no dashboard mutation
- no runtime execution
- no Codex invocation
- no OpenClaw operation
- no system copy-buffer automation
- no provider calls
- no network/API calls
- no source-side file writes
- no package/workflow changes
- no DB/SQL
- no memory persistence
- no git automation from source

## Limitations

- Wireframes are metadata only.
- Fixtures are static.
- No real dashboard route, page, component, or store is created.
- No persistence layer is added.
- Future UI must still pass a separate planning phase.
- Evidence links are ids or summaries, not live data.

## Next Recommended Phase

Phase 145B - LOOP DASHBOARD STATIC UI PLAN.
