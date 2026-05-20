# Loop Dashboard Static UI Route Model

Phase: 145B - LOOP DASHBOARD STATIC UI PLAN

Status: docs-only / advisory-only / future route model

## Purpose

Define the route metadata for a future static dashboard page that visualizes the
manual loop. This is a planning contract only. No route is created in this
phase.

## Route Metadata

Future metadata:

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

## Preferred Route

`routeId`
: `loop_dashboard_static_route:autopilot_loop`

`routePath`
: `/autopilot/loop`

`routeName`
: Autopilot Loop

`purpose`
: Show read-only manual loop status, evidence, validation, closeout, and next
action.

`sourceDataRefs`
:
- `loopDashboardSafeReadinessFixture`
- `loopDashboardDefaultWireframeFixture`
- approval/audit evidence fixture
- controlled report return fixture
- next-action metadata fixture
- phase closeout metadata fixture

`cards`
:
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

`emptyState`
: No loop run is selected. Show fixture selection guidance and keep all actions
disabled.

`loadingState`
: Waiting for local fixture metadata. Do not show progress that implies external
activity.

`errorState`
: Static loop metadata is incomplete. Route the operator to Blockers / Warnings.

`accessNotes`
:
- internal operator review only
- no protected action is available from this route
- all manual actions happen outside the dashboard
- next phase remains a human decision

`riskLevel`
: medium by default; high if warning state is selected; critical if blocked
state is selected.

`limitations`
:
- no live data source
- no persistence
- no external session reads
- no route implementation in this phase
- no dashboard mutation

## Alternate Route

`/loop` may be acceptable if the dashboard keeps a shallow route structure.
However, `/autopilot/loop` is preferred because it keeps the feature scoped to
Autopilot review and avoids confusion with broader system runs.

## Empty State Requirements

The empty state should:

- explain that no loop metadata is selected
- show what fixture or run label is expected
- keep cards in a disabled preview state
- show safety boundaries
- provide no action that performs a protected step

## Loading State Requirements

The loading state should:

- say "Waiting for local metadata"
- avoid implying external work is happening
- avoid hidden timers for human steps
- retain the top safety boundary banner

## Error State Requirements

The error state should:

- identify the missing metadata category
- show whether the missing data is blocking
- route to Blockers / Warnings
- ask for human review
- avoid trying to repair data from the dashboard

## Future 145I Scope

Phase 145I may turn this model into source-only metadata or keep it as expanded
implementation documentation. It must not add a dashboard route unless a later
phase explicitly approves dashboard UI work.

## Next Recommended Phase

Phase 145I - LOOP DASHBOARD STATIC UI IMPLEMENTATION.
