# Autopilot Roadmap Return Plan

Phase: 26K-B - AUTOPILOT PHASE CLOSEOUT COORDINATOR PLAN

Status: roadmap return plan / docs-only

## Purpose

This document defines how the temporary Autopilot pivot returns to the formal
ORQUESTADOR-PRIME PM roadmap.

The return target is:

- Phase 109B - PM STATUS REPORTING PLAN

## Pivot Context

The Autopilot pivot created support infrastructure for safer phase movement:

- Phase 26G: Autopilot loop contracts,
- Phase 26H: Codex handoff runner MVP,
- Phase 26I: validation and memory proposal MVP,
- Phase 26J: next-action coordinator MVP,
- Phase 26K: phase closeout coordinator plan and MVP.

These phases do not replace the post-100 roadmap. They create a controlled
loop for planning, handoff, report validation, memory proposal, next-action
recommendation, and closeout.

## Return Target

The approved return target is:

- Phase 109B - PM STATUS REPORTING PLAN

Phase 109B should resume Project Manager Core work and use Autopilot contracts
as support infrastructure where helpful.

## Required Return Condition

Return to Phase 109B should be recommended only after:

- Phase 26K-I is implemented,
- Phase 26K-I typecheck and smoke checks pass,
- Phase 26K-I forbidden grep evidence is clean,
- Phase 26K-I scope check is clean,
- Phase 26K-I commit hash exists,
- Phase 26K-I push status is successful,
- unrelated dirty files remain unstaged,
- no blocking alert remains,
- the closeout coordinator marks roadmap return as allowed.

## Return Output

The closeout coordinator should return:

- `closeoutStatus=ready_for_roadmap_return`,
- `roadmapReturnAllowed=true`,
- `nextPhase=Phase 109B - PM STATUS REPORTING PLAN`,
- `requiredPromptType=planning_prompt`,
- `recommendedModel=Codex`,
- human-facing response with the required four sections.

## Safety Note

Returning to Phase 109B does not activate runtime execution, dashboard behavior,
provider writes, memory persistence, deployment, DB/SQL mutation, OpenClaw, n8n,
WhatsApp outbound, or source-driven git changes.

The return preserves all Autopilot contracts as source-only support
infrastructure.

## Roadmap Preservation

The 101-300 roadmap remains authoritative for PM and SOLID work. The Autopilot
pivot adds a safer coordination lane but does not delete, skip, or replace the
roadmap.

## Recommended Post-Return Flow

After Phase 26K-I is closed and pushed:

1. Return to Phase 109B planning.
2. Use the closeout result as previous phase context.
3. Keep Phase 109B docs/source scope bounded.
4. Continue advisory/source-only PM reporting work.
5. Preserve existing dirty Viernes/dashboard/package files outside scope unless
   a later phase explicitly handles them.

## Non-Goals

The return plan does not:

- implement Phase 109B,
- create a runtime bridge,
- write memory,
- call providers,
- deploy,
- mutate dashboard state,
- use OpenClaw,
- run n8n,
- send WhatsApp messages,
- change package scripts,
- modify CI,
- mutate DB/SQL files.

## Phase 26K-I Implementation Note

Phase 26K-I implements roadmap return as source-only readiness metadata. The
return is allowed only when the closeout result reports
`ready_for_roadmap_return` and `roadmapReturnAllowed=true`.

The next recommended phase remains Phase 109B - PM STATUS REPORTING PLAN.
