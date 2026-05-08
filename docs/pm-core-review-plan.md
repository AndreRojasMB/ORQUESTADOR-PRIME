# PM Core Review Plan

Phase: 110B - PM CORE REVIEW PLAN

Status: planning / audit / docs-only

## Purpose

Phase 110 reviews the Project Manager Core created across Phases 101-109
before the roadmap moves into the SOLID Architecture block.

This plan defines how Phase 110I should close the PM Core safely: verify
source boundaries, check architecture consistency, identify documentation and
export gaps, add safe review fixtures when useful, and confirm readiness for
Phase 111B - SOLID ARCHITECTURE CHARTER PLAN.

Phase 110B does not implement PM Core changes. It does not wire runtime,
providers, dashboards, OpenClaw, WhatsApp, n8n, persistence, memory, DB/SQL,
deployment, CI, package scripts, or source-control behavior.

## Review Scope

The PM Core review covers:

- Phase 101: PM foundation types and boundaries.
- Phase 102: Project State Model.
- Phase 103: Task Graph and Milestones.
- Phase 104: Definition of Done Engine.
- Phase 105: Risk and Blocker Model.
- Phase 106: Autonomy Policy Engine.
- Phase 107: Approval Gate Contract.
- Phase 108: Next Best Action Planner.
- Phase 109: PM Status Reporting.

The review should treat all PM Core modules as source-only advisory metadata.
No module should become an execution, persistence, dashboard, connector, job,
provider, deployment, or memory surface.

## Current PM Core Findings

The current PM Core contains source files for:

- `src/pm/types.ts`
- `src/pm/boundaries.ts`
- `src/pm/projectStateStore.ts`
- `src/pm/projectStateValidator.ts`
- `src/pm/taskGraph.ts`
- `src/pm/milestonePlanner.ts`
- `src/pm/dodTypes.ts`
- `src/pm/dodValidator.ts`
- `src/pm/riskModel.ts`
- `src/pm/blockerRules.ts`
- `src/pm/autonomyPolicy.ts`
- `src/pm/autonomyPolicyValidator.ts`
- `src/pm/approvalTypes.ts`
- `src/pm/approvalPlanner.ts`
- `src/pm/nextBestAction.ts`
- `src/pm/decisionRules.ts`
- `src/pm/reportTypes.ts`
- `src/pm/reportBuilder.ts`
- `src/pm/index.ts`

The current PM Core already has smoke coverage for PM Status Reporting through
`scripts/pm-status-reporting-tests.ts`. Earlier PM modules have source
validators/builders but do not yet share one consolidated PM Core smoke suite.

## Review Checklist

Phase 110I should review:

- source-only boundaries remain explicit,
- advisory/report-only behavior remains explicit where applicable,
- no runtime execution is introduced,
- no providers are imported or called,
- no dashboard mutation is introduced,
- no OpenClaw usage is introduced,
- no WhatsApp outbound behavior is introduced,
- no n8n behavior is introduced,
- no memory persistence is introduced,
- no source-control automation is introduced from source modules,
- no process launch is introduced,
- no environment or network lookup is introduced,
- no DB/SQL or deploy behavior is introduced,
- PM module imports stay local to PM or type-only where appropriate,
- TypeScript remains strict-compatible.

## Architecture Consistency Review

Phase 110I should verify:

- `src/pm/index.ts` exports the intended PM Core surface.
- Naming is consistent across validators, planners, builders, and result types.
- Shared vocabulary remains in `src/pm/types.ts` or clear module-local files.
- Duplicate or conflicting type aliases are avoided.
- Documentation matches implemented phases 101-109.
- Reported roadmap phase names match the actual implemented sequence.
- Fixtures, if added, are metadata-only and do not imply runtime state.
- Smoke tests exercise representative happy and boundary cases.

## PM Core Health Model

The PM Core health review should summarize:

- completed capabilities,
- missing capabilities,
- known limitations,
- deferred runtime items,
- risks,
- blockers,
- readiness for SOLID block 111-120,
- readiness to feed Autopilot contracts.

Recommended health dimensions:

- `capability_coverage`
- `boundary_integrity`
- `export_integrity`
- `documentation_alignment`
- `smoke_coverage`
- `roadmap_alignment`
- `autopilot_context_readiness`
- `solid_block_readiness`

Each dimension should be reported as metadata with a safe summary, not as an
execution gate.

## Gap Analysis Themes

Observed gaps to address or explicitly defer in 110I:

- `src/pm/index.ts` currently exports PM Status Reporting only; a PM Core
  barrel export may be needed.
- `src/pm/sampleFixtures.ts` does not exist yet; a metadata-only fixture set
  may help review all PM Core modules together.
- There is no consolidated PM Core smoke script covering the 101-109 surface.
- `docs/post-100-roadmap.md` still contains older labels for Phases 106-109
  that no longer match the implemented sequence after the approved roadmap
  evolution.
- PM docs are mostly phase-specific; Phase 110I should add a consolidated
  PM Core review document.
- Existing dirty Viernes/dashboard/package files remain outside PM Core scope
  and must not be staged in 110I.

## Proposed 110I Scope

Recommended safe implementation scope:

- add or complete `src/pm/index.ts` exports,
- add `src/pm/sampleFixtures.ts` only if useful for source-only review,
- add `docs/pm-core-review.md`,
- add optional `scripts/pm-core-review-tests.ts` if it follows current script
  patterns without package changes,
- optionally update `docs/post-100-roadmap.md` only to correct stale PM Core
  labels, if explicitly kept narrow.

Phase 110I should not add runtime wiring, provider calls, dashboard behavior,
OpenClaw, WhatsApp outbound, n8n, persistence, memory persistence, package
changes, workflow changes, DB/SQL, deployment, or CI behavior.

## Verification Plan For 110I

Recommended checks:

- `git status --short --branch`
- TypeScript check with Windows Node fallback if WSL Node is unavailable
- targeted PM Core smoke script if added
- `git diff --check`
- `git diff --cached --check`
- staged file scope review
- forbidden-pattern review over changed PM Core files and docs

## Exit Criteria For 110I

Phase 110I should be considered complete when:

- PM Core review docs exist,
- PM Core exports are deliberate and documented,
- optional PM Core fixtures are source-only metadata,
- optional PM Core smoke tests pass,
- TypeScript passes,
- forbidden-pattern review is clean for changed files,
- unrelated dirty files remain unstaged,
- the commit is pushed when verification is green.

## Next Formal Phase

After Phase 110I closes, the next formal target remains:

- Phase 111B - SOLID ARCHITECTURE CHARTER PLAN
