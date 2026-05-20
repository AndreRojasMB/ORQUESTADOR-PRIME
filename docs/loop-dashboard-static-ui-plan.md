# Loop Dashboard Static UI Plan

Phase: 145B - LOOP DASHBOARD STATIC UI PLAN

Status: docs-only / advisory-only / static UI planning

## Purpose

Plan a future read-only dashboard surface for the manual loop without creating
routes, components, live data access, or dashboard mutations.

The planned UI should help an operator inspect a loop run, understand the
current state, review prompt/handoff readiness, inspect approvals and audit
evidence, track manual actions, review report return, validate closeout, and
choose a next action.

This phase does not implement dashboard files, create UI components, add routes,
invoke Codex, operate OpenClaw, automate prompt transfer, call providers, access
DB/SQL, persist memory, or change package/workflow surfaces.

## Static UI Scope

The future dashboard should show these read-only screens or sections:

- Loop Overview
- Active Loop Run
- Prompt / Handoff Review
- Approval & Audit
- Manual Actions
- Report Return
- Validation / Closeout
- Next Action
- Blockers / Warnings

The first implementation should be static and fixture-backed. It should prove
that the operator can scan the loop state quickly before any live data, mutation,
or external action is considered.

## Proposed Route

Preferred route:

- `/autopilot/loop`

Acceptable shorter route:

- `/loop`

The preferred route keeps the feature grouped with Autopilot concepts and avoids
implying that the dashboard controls every loop in the system.

No route is created in this phase.

## Route Model

Future route metadata:

```ts
interface LoopDashboardStaticRoute {
  routeId: string;
  routePath: string;
  routeName: string;
  purpose: string;
  sourceDataRefs: string[];
  cards: string[];
  emptyState: string;
  loadingState: string;
  errorState: string;
  accessNotes: string[];
  riskLevel: string;
  limitations: string[];
}
```

Recommended route record:

- `routeId`: `loop_dashboard_static_route:autopilot_loop`
- `routePath`: `/autopilot/loop`
- `routeName`: Autopilot Loop
- `purpose`: Show a static, read-only review surface for a manual loop run.
- `sourceDataRefs`: loop readiness fixture, wireframe fixture, approval/audit
  fixture, report return fixture, next-action metadata, closeout metadata.
- `cards`: required static UI cards listed in the card model.
- `emptyState`: No loop fixture is selected. Choose a fixture-backed run.
- `loadingState`: Waiting for local fixture metadata.
- `errorState`: Static loop metadata is incomplete. Review blockers first.
- `accessNotes`: internal operator review, no protected action from the route.
- `riskLevel`: medium by default, high when blockers or missing evidence appear.
- `limitations`: no live data, no persistence, no mutation, no external action.

## Required Static UI Cards

The future static UI should include these cards:

- `LoopOverviewCard`
- `PromptDraftCard`
- `HandoffApprovalCard`
- `ApprovalGateCard`
- `AuditEvidenceCard`
- `ManualActionChecklistCard`
- `ReportReturnCard`
- `ValidationResultCard`
- `CloseoutCard`
- `NextActionCard`
- `BlockersWarningsCard`

Each card should display metadata and disabled actions only. The card may guide
the operator to a manual review step, but it must not perform that step.

## Data Boundary Model

The first static UI must consume:

- read-only local fixtures first
- source-only metadata from readiness and wireframe models
- approval/audit metadata as passive evidence
- report return metadata supplied by the operator
- next-action and closeout metadata as recommendations

The first static UI must not use:

- provider calls
- DB/SQL reads or writes
- runtime action dispatch
- source-side project writes
- dashboard mutation
- dashboard-triggered Codex or OpenClaw operation
- memory persistence
- source-control behavior from dashboard controls

## UX Requirements

The future UI should prioritize operational clarity over decoration:

- clear `safe`, `review`, and `blocked` badges
- explicit manual-only language on protected actions
- visible "Do not proceed" state when blockers exist
- visible "Safe to continue" state only when validation and closeout allow it
- visible "Manual action required" state when the operator must act elsewhere
- evidence visibility on every high-risk card
- disabled actions by default
- visible disabled reasons
- no button that performs a protected action
- copy-ready language only as a future, human-reviewed concept

The dashboard should make stop states impossible to miss. A clean closeout should
feel calm and obvious, but never imply that the system has completed an external
step.

## Safety Boundaries

- docs-only
- advisory-only
- no dashboard implementation
- no UI components
- no route creation
- no dashboard mutation
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

Static UI planning consumes:

- Loop Dashboard Readiness for state, cards, UX signals, and operator actions.
- Loop Dashboard Wireframe for layout, screens, cards, operator flow, and
  indicators.
- Loop UX Hardening for stop/continue wording and checklist order.
- Approval / Audit Hardening for gates, evidence, risk, and rollback posture.
- Human-Approved Handoff for prompt and approval state.
- Controlled Report Return for report, validation, alert, and closeout status.
- Next-action coordinator for recommended phase display.
- Phase closeout coordinator for safe-to-continue posture.

## Future Implementation Split

Phase 145I - LOOP DASHBOARD STATIC UI IMPLEMENTATION:

- define source-only metadata or docs for static UI route/card readiness
- optionally add static fixtures for the route and card model
- keep dashboard real files untouched unless explicitly approved
- preserve read-only behavior
- preserve disabled actions by default

Potential Phase 146B candidates:

- Phase 146B - CONTROLLED AUTOMATION DECISION PLAN
- Phase 146B - LOOP DASHBOARD INTERACTION HARDENING PLAN
- return to the main roadmap if the dashboard path is sufficient

## Next Recommended Phase

Phase 145I - LOOP DASHBOARD STATIC UI IMPLEMENTATION.
