# Loop Dashboard Static UI

Phase: 145I - LOOP DASHBOARD STATIC UI IMPLEMENTATION

Status: read-only / static local data / dashboard preview

## Purpose

Phase 145I adds the first static dashboard preview for the manual loop. It gives
the operator a visual surface for prompt/handoff readiness, approval and audit
evidence, manual action checklist state, report return, validation, closeout,
next action, blockers, and warnings.

The route is intentionally read-only. It does not perform protected actions or
connect to live providers, DB/SQL, external sessions, memory storage, or runtime
dispatch.

## Route

Implemented route:

- `/autopilot/loop`

Files:

- `dashboard/app/autopilot/loop/page.tsx`
- `dashboard/app/autopilot/loop/loading.tsx`
- `dashboard/app/autopilot/loop/data.ts`

The route is not added to the global sidebar in this phase, keeping the change
isolated to the new preview surface.

## Static Data Source

The route reads from a local fixture:

- `loopDashboardStaticData` in `dashboard/app/autopilot/loop/data.ts`

The fixture represents:

- loop overview
- prompt draft status
- handoff approval
- approval/audit state
- manual action checklist
- report return status
- validation result
- closeout status
- next action
- blockers/warnings

No provider calls, DB/SQL access, environment reads, network calls, memory
persistence, or project file writes are used.

## Cards Implemented

The static route renders:

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

Cards are display-only. Disabled controls are shown only to communicate future
workflow shape and the reason actions are unavailable.

## Manual-Only UX Wording

The route includes visible manual-only wording:

- "Read-only preview. Manual loop only."
- "No real action is performed from this dashboard."
- "All steps remain human-managed."
- "This dashboard only displays evidence and status."

Every protected card includes a disabled reason and safety note.

## Safety Boundaries

- read-only UI
- static local data only
- no external actions
- no Codex invocation
- no OpenClaw operation
- no system copy-buffer automation
- no provider calls
- no DB/SQL
- no environment or secret reads
- no package/workflow changes
- no memory persistence
- no dashboard mutation
- no project file writes from source
- no source-control behavior from the dashboard

## Integration

The route follows:

- Loop Dashboard Readiness state, cards, signals, and operator actions.
- Loop Dashboard Wireframe layout, card, indicator, and operator-flow model.
- Loop UX Hardening stop/continue language.
- Approval / Audit Hardening evidence and protected action posture.
- Human-Approved Handoff approval vocabulary.
- Controlled Report Return validation and closeout status language.
- Next-action and phase closeout coordinator recommendations.

## Known Limitations

- Static fixture only.
- No live loop run selector.
- No dashboard persistence.
- No route navigation entry yet.
- No report intake UI.
- No approval recording UI.
- No interactive workflow beyond read-only display.

## Next Recommended Phase

Phase 146B - CONTROLLED AUTOMATION DECISION PLAN.
