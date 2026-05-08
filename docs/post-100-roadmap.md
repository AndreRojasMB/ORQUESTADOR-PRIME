# Post-100 Roadmap

Status: docs-only/governance-plan

Phase 101I starts the post-100 block with a Project Manager Agent foundation
and a SOLID core direction. This roadmap is advisory. It does not implement
runtime behavior, dashboard behavior, scaffold generation, connector behavior,
cloud execution, browser automation, CI wiring, deployment, release behavior,
package changes, persistence, command execution, provider calls, or filesystem
I/O.

It does not make ORQUESTADOR-PRIME production ready, release ready, fully
autonomous, or security/compliance certified.

## Purpose

The post-100 roadmap gives ORQUESTADOR-PRIME a conservative path from the
Phase 100I readiness review into better project coordination and architecture
quality before any execution surfaces mature.

The near-term goal is not to execute work. The near-term goal is to define the
language, boundaries, and review posture for a Project Manager Agent that can
observe, report, plan, and propose safely.

## Current State After Phase 100

Phase 100I closed the Phase 86-100 governance and readiness block. The project
has useful advisory metadata, docs-only governance, read-only diagnostics, and
several live-adjacent surfaces.

The system is still not ready for runtime execution, dashboard controls,
connector execution, automation execution, scaffold writes, production
deployment, release publication, strict CI blocking, credential vault behavior,
or autonomous self-improvement.

Current live-adjacent surfaces remain out of scope for this block unless a
later phase explicitly approves a bounded source-only plan:

- dashboard store reads and config write paths,
- scaffold writer and scaffold prompt surfaces,
- actions, proposals, approvals, and dispatch paths,
- jobs and scheduler helpers,
- providers and connector-adjacent clients,
- runtime locks and migrations,
- quality artifact writers,
- channel bridges.

## Approved Pivot

Phase 100I mentioned a recommendation for a productization readiness
backlog/index as a possible next step.

The current approved direction reframes Phase 101-120 as Project Manager Agent
plus SOLID Core. This pivot is safer because ORQUESTADOR-PRIME needs clearer
project management vocabulary, task boundaries, risk language, and
architecture-quality foundations before execution, dashboard, scaffold,
connector, CI, release, or deployment work can mature.

## Why Phase 101-120 Comes First

Project management and SOLID architecture foundations come before execution
because the system needs:

- explicit autonomy levels,
- explicit project-state vocabulary,
- clear boundaries between planning and execution,
- risk surfaces that reviewers can name consistently,
- advisory task and blocker models,
- approval planning language without approval execution,
- small source-only models that do not import live-adjacent modules,
- architecture quality rules before wiring new behavior.

Without those foundations, later runtime or automation work would be harder to
review and easier to overclaim.

## PM Core 101-110 Overview

The PM core should remain advisory and source-only.

Recommended sequence:

- 101I: Project Manager foundation types and safety boundaries.
- 102B/102I: Project-state vocabulary plan and source-only model.
- 103B/103I: Task graph vocabulary plan and source-only model.
- 104B/104I: Definition of Done vocabulary and review metadata.
- 105B/105I: Risk and blocker taxonomy for project management.
- 106B/106I: Approval planning metadata, with no approval execution.
- 107B/107I: PM advisory report shape, with no persistence.
- 108B/108I: PM-to-factory metadata relationship, source-only.
- 109B/109I: PM-to-readiness metadata relationship, source-only.
- 110B/110I: PM foundation review and next-block readiness check.

Allowed PM posture during this block:

- observe only,
- report only,
- plan only,
- propose only.

Denied during this block:

- prepare-review behavior that creates files, records, or branches,
- approval-gated execution,
- autonomous execution,
- persistence,
- provider calls,
- network calls,
- command execution,
- filesystem I/O from source modules.

## SOLID Core 111-120 Overview

The SOLID core should strengthen architecture boundaries before new execution
surfaces are considered.

Recommended sequence:

- 111B/111I: SOLID boundary principles for ORQUESTADOR modules.
- 112B/112I: Interface segregation plan for advisory modules.
- 113B/113I: Dependency direction map for safe source-only lanes.
- 114B/114I: Single-responsibility review checklist.
- 115B/115I: Live-adjacent import boundary policy.
- 116B/116I: Validator and builder shape consistency plan.
- 117B/117I: Evidence-reference model consistency plan.
- 118B/118I: Risk-boundary consistency plan.
- 119B/119I: Advisory module test and smoke strategy.
- 120B/120I: PM plus SOLID readiness review.

This block should improve source clarity and reviewability. It must not wire
runtime, dashboard, scaffold, connector, automation, action, job, provider, CI,
package, release, or deployment behavior.

## Deferred Work

The following remain deferred:

- real runtime implementation,
- real dashboard implementation,
- real scaffold generation,
- connector implementation,
- cloud execution,
- browser automation,
- MirrorFish,
- package command entries,
- CI wiring,
- deployment,
- release,
- credential/vault implementation,
- action/proposal/approval execution,
- jobs execution,
- automation execution,
- database schemas or SQL,
- production claims,
- autonomous operation claims,
- security or compliance guarantees.

## Safety Boundaries

Post-100 PM and SOLID phases must keep these boundaries unless a later phase
explicitly changes them:

- no provider calls,
- no network,
- no filesystem reads or writes from source modules,
- no command execution,
- no runtime execution,
- no dashboard implementation,
- no scaffold generation,
- no connector implementation,
- no credential/vault implementation,
- no package manifest or CI automation changes,
- no baseline or artifact mutation,
- no action/proposal/approval execution,
- no jobs execution,
- no persistence,
- no CI changes,
- no database schemas,
- no SQL,
- no release behavior,
- no deployment behavior,
- no production-readiness claims,
- no fully-autonomous claims,
- no security/compliance guarantees.

## Next Block After 120

After Phase 120, the safest next block should be a review checkpoint. That
checkpoint should decide whether PM and SOLID foundations are clear enough to
support later source-only planning for runtime auth, dashboard isolation,
scaffold manifests, connector governance, CI warning reports, or release
readiness indexing.

No post-120 execution block should start until the Phase 120 review confirms
that boundaries, imports, vocabulary, and verification checks are stable.
