# PM Core Review Gap Analysis

Phase: 110B - PM CORE REVIEW PLAN

Status: gap analysis / docs-only

## Summary

The PM Core 101-109 is broadly complete as a source-only advisory foundation.
It now includes project state, task graph, milestone health, Definition of
Done, risk/blocker metadata, autonomy policy, approval gate metadata,
next-best-action planning, and status reporting.

Phase 110I should focus on closure quality, not new behavior.

## Completed Capability Map

### Phase 101 - PM Foundation

Completed:

- shared PM vocabulary,
- autonomy levels,
- risk surfaces,
- boundaries,
- evidence references,
- advisory phase plan metadata.

Review focus:

- confirm shared types are still coherent after Phases 102-109,
- confirm boundary constants still cover current PM modules.

### Phase 102 - Project State Model

Completed:

- ProjectState metadata,
- ProjectSnapshot metadata,
- ProjectStateStore contract,
- pure ProjectState validation.

Review focus:

- confirm store contract remains non-persistent,
- confirm ProjectState references match later PM modules.

### Phase 103 - Task Graph And Milestones

Completed:

- task nodes,
- dependencies,
- advisory ordering,
- milestone metadata,
- milestone health summaries.

Review focus:

- confirm graph order remains advisory,
- confirm milestone health can feed PM reports.

### Phase 104 - Definition Of Done

Completed:

- Definition of Done metadata,
- acceptance criteria,
- evidence requirements,
- pure validation.

Review focus:

- confirm DoD validation findings feed PM reporting and next-action metadata.

### Phase 105 - Risk And Blocker Model

Completed:

- risk entries,
- advisory risk classification,
- blocker metadata,
- blocker evaluation,
- shared risk/blocker validation result.

Review focus:

- confirm risk and blocker terms align with PM reports and autonomy policy.

### Phase 106 - Autonomy Policy Engine

Completed:

- autonomy policy metadata,
- L0-L6 model,
- 101-120 L0-L3 cap,
- risk/blocker/DoD autonomy rules,
- pure validation and evaluation.

Review focus:

- confirm L4-L6 remain future-gated during the PM Core block.

### Phase 107 - Approval Gate Contract

Completed:

- approval requirement metadata,
- approval plan metadata,
- dual approval metadata,
- pure approval planning and validation helpers.

Review focus:

- confirm no relationship to real proposal stores or approval execution.

### Phase 108 - Next Best Action Planner

Completed:

- next-action metadata,
- decision rule metadata,
- pure recommendation helpers,
- L0-L3 respecting recommendations.

Review focus:

- confirm recommendations do not become proposals, jobs, or runtime actions.

### Phase 109 - PM Status Reporting

Completed:

- report types,
- report builder helpers,
- report sections,
- PM report smoke test,
- report-only documentation.

Review focus:

- confirm reports can summarize PM Core without triggering Autopilot stages.

## Gaps To Address In 110I

### PM Barrel Exports

`src/pm/index.ts` currently exports only report types and report builder
helpers. Phase 110I should decide whether this file should export the full PM
Core surface.

Recommended action:

- update `src/pm/index.ts` to deliberately export PM Core modules,
- avoid exporting live-adjacent surfaces,
- keep exports source-only.

### PM Sample Fixtures

No consolidated `src/pm/sampleFixtures.ts` exists.

Recommended action:

- add representative metadata fixtures only if they improve review and smoke
  coverage,
- include ProjectState, task graph, milestone health, DoD, risk, blocker,
  approval, next-action, and report examples,
- keep all fixtures static and metadata-only.

### PM Core Smoke Script

There is a PM status reporting smoke script, but not a full PM Core review
smoke script.

Recommended action:

- add `scripts/pm-core-review-tests.ts` if it can run through the existing
  compiled smoke pattern without package changes,
- assert exports, fixture flags, representative builder/validator behavior,
  and report integration.

### Roadmap Drift

`docs/post-100-roadmap.md` still contains older PM Core labels for Phases
106-109 that no longer match the implemented sequence:

- 106 is now Autonomy Policy Engine,
- 107 is now Approval Gate Contract,
- 108 is now Next Best Action Planner,
- 109 is now PM Status Reporting.

Recommended action:

- update only the PM Core overview section if 110I includes docs alignment,
- do not rewrite unrelated roadmap sections.

### Cross-Doc Review

Phase-specific docs are present, but there is no consolidated PM Core closure
document.

Recommended action:

- add `docs/pm-core-review.md`,
- include capability map, source boundary summary, test summary, known gaps,
  and readiness note for Phase 111B.

## Known Limitations To Preserve

The PM Core remains advisory. It does not:

- persist project state,
- read stores,
- write stores,
- inspect runtime state,
- dispatch actions,
- create proposals,
- execute approvals,
- run jobs,
- call providers,
- mutate dashboards,
- operate OpenClaw,
- send WhatsApp messages,
- run n8n,
- change packages or workflows,
- deploy.

These limitations are intentional and should be preserved in 110I.

## Readiness For SOLID Block 111-120

The PM Core appears ready for a closure implementation phase.

After 110I verifies exports, fixtures, documentation alignment, smoke coverage,
and boundaries, the roadmap can move to:

- Phase 111B - SOLID ARCHITECTURE CHARTER PLAN

The SOLID block should use PM Core contracts as context while continuing to
avoid runtime, provider, dashboard, deployment, persistence, and automation
wiring.
