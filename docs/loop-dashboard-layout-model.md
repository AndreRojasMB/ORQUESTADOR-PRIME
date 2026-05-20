# Loop Dashboard Layout Model

Phase: 144B - LOOP DASHBOARD WIREFRAME PLAN

Status: docs-only / advisory-only / future layout model

## Purpose

Define the future layout metadata for a dashboard that visualizes the manual
loop without performing the loop. The layout is optimized for operator scanning,
safe review, and clear stop/continue decisions.

## Layout Metadata

Future metadata:

```ts
interface LoopDashboardLayout {
  layoutId: string;
  layoutName: string;
  purpose: string;
  sections: string[];
  primaryUserFlow: string[];
  navigationModel: string;
  responsiveNotes: string[];
  accessibilityNotes: string[];
  riskLevel: string;
  limitations: string[];
}
```

## Recommended Layout

`layoutId`
: `loop_dashboard_layout:manual_loop_review`

`layoutName`
: Manual Loop Review Layout

`purpose`
: Give the operator a single review surface for loop status, evidence, manual
actions, validation, closeout, and next phase.

`sections`
:
- top status band
- navigation rail or tabs
- active screen content
- blockers / warnings rail
- evidence drawer or evidence section
- next-action footer

`primaryUserFlow`
:
- open loop dashboard
- inspect top status band
- check blockers first
- review prompt/handoff state
- review approval/audit state
- review manual actions
- review report return
- review validation and closeout
- confirm next phase decision

`navigationModel`
: Desktop uses a left rail. Tablet uses tabs. Mobile uses a stacked status-first
flow with blockers before content.

`responsiveNotes`
:
- desktop: two-column content with persistent blockers rail
- tablet: tabs plus stacked cards
- mobile: one-column cards and sticky status summary
- blockers must appear above optional content on small screens
- evidence detail can collapse, but evidence status must remain visible

`accessibilityNotes`
:
- color must be paired with text labels
- status badges need plain-language labels
- disabled actions need visible reasons
- keyboard order follows operator flow
- stop conditions must be readable without hover
- headings should match screen and card names

`riskLevel`
: medium by default, high when blockers, missing evidence, or manual action
required states are present.

`limitations`
:
- layout is a planning artifact only
- no routes, components, or persisted state
- no dashboard mutation
- no runtime behavior

## Top Status Band

The status band should show:

- current loop stage
- alert level
- closeout status
- safe-to-continue indicator
- manual action required indicator
- next recommended phase

When blockers exist, the status band should switch to stop-first language.

## Navigation

Recommended screen order:

1. Loop Overview
2. Active Loop Run
3. Prompt / Handoff Review
4. Approval & Audit
5. Manual Actions
6. Report Return
7. Validation / Closeout
8. Next Action
9. Blockers / Warnings

The Blockers / Warnings view should be reachable from every screen and should
surface automatically when blockers exist.

## Evidence Visibility

Evidence should appear in three places:

- compact evidence count or status badge on the card
- evidence references in the card detail
- consolidated evidence section for audit review

Evidence content should be summarized and redaction-aware.

## Empty, Loading, And Error Layout States

Empty state:

- explain which metadata is missing
- show the next safe review step
- avoid implying that the dashboard can produce missing evidence

Loading state:

- future-only display state
- avoid hidden progress claims
- show "waiting for metadata" rather than action wording

Error state:

- show source metadata problem
- show suggested human review step
- route to Blockers / Warnings when safety is uncertain

## Future 144I Scope

Phase 144I can turn this into source-only metadata or keep it as expanded docs.
It must not create dashboard routes, components, styles, or data persistence.
