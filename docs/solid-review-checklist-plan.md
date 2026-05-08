# SOLID Review Checklist Plan

Phase: 115B - SOLID REVIEW CHECKLIST PLAN

Status: planning / audit / docs-only

## Purpose

Phase 115 plans a SOLID Review Checklist layer for the Architecture Quality
Core. The goal is to turn SOLID principles, module boundary rules, Dependency
Inversion Rules, and Architecture Smell Taxonomy into structured review
questions, finding metadata, templates, and suggestions.

This phase is documentation only. It does not implement source code, inspect
the repository, parse source structure, rewrite modules, execute refactors,
launch processes, call providers, mutate dashboards, operate OpenClaw, send
WhatsApp messages, run n8n, persist memory, change packages or workflows,
mutate DB/SQL, deploy, or perform source-control behavior from source.

## Checklist Scope

The future checklist should cover:

- SRP checklist,
- OCP checklist,
- LSP checklist,
- ISP checklist,
- DIP checklist,
- module boundary checklist,
- dependency direction checklist,
- architecture smell checklist,
- automation safety checklist.

The checklist should structure human review. It must not discover issues by
walking files, and it must not apply fixes.

## Checklist Categories

Recommended checklist category groups:

- `solid_principle_review`
- `module_boundary_review`
- `dependency_direction_review`
- `architecture_smell_review`
- `automation_safety_review`
- `advisory_boundary_review`
- `evidence_quality_review`
- `future_runtime_gate_review`

These are review categories. They do not imply enforcement.

## Checklist Item Model

Future `SolidReviewChecklistItem` metadata should include:

- `itemId`
- `title`
- `principleRefs`
- `smellCategoryRefs`
- `boundaryPolicyRefs`
- `dependencyPolicyRefs`
- `severityHint`
- `question`
- `expectedEvidence`
- `failureSignal`
- `suggestedAction`
- `riskLevel`
- `approvalRequired`
- `pmEscalation`
- `autopilotUse`
- source-only boundary flags

Checklist items are questions and evidence prompts. They are not validators,
build gates, or refactor commands.

## Review Finding Type Model

Future `ReviewFinding` metadata should include:

- `findingId`
- `checklistItemId`
- `findingType`
- `severity`
- `sourceModule`
- `affectedLayer`
- `description`
- `evidenceRefs`
- `relatedSolidFindingRefs`
- `relatedBoundaryFindingRefs`
- `relatedDependencyFindingRefs`
- `relatedSmellFindingRefs`
- `suggestedAction`
- `riskLevel`
- `approvalRequired`
- `pmEscalation`
- `autopilotUse`
- source-only boundary flags

Recommended finding type values:

- `principle_gap`
- `boundary_gap`
- `dependency_direction_gap`
- `smell_detected`
- `evidence_gap`
- `safety_boundary_gap`
- `future_gate_required`
- `human_review_required`

Review findings should remain metadata and should not trigger follow-up work
without a later approved phase.

## Review Template Model

Future `ReviewTemplate` metadata should include:

- `templateId`
- `title`
- `targetScope`
- `checklistItemIds`
- `requiredEvidence`
- `outputSections`
- `safetyBoundaries`
- `recommendedNextAction`
- `reportOnly`
- source-only boundary flags

Recommended template scopes:

- PM source-only module review,
- architecture metadata review,
- Autopilot metadata review,
- live-adjacent boundary review,
- future runtime gate review,
- phase closeout architecture review.

Templates should render repeatable review structure. They should not execute
the review by reading files.

## Suggested Action Model

Suggested actions should describe safe next steps:

- document a boundary,
- request human review,
- add a future source-only finding,
- create a future planning phase,
- defer runtime integration,
- escalate to PM risk metadata,
- mark a finding for phase closeout context.

Suggested actions must remain metadata-only and must not apply refactors,
dispatch jobs, mutate state, call providers, or start Autopilot steps.

## Safety Boundaries

Phase 115 and the future 115I implementation must remain:

- report-only,
- advisory-only,
- source-only,
- metadata-only,
- no repository reading,
- no runtime scanner,
- no syntax-tree parsing,
- no refactor execution,
- no provider calls,
- no dashboard mutation,
- no OpenClaw,
- no WhatsApp outbound,
- no n8n,
- no memory persistence,
- no source-control behavior from source,
- no process launch,
- no env or network access,
- no DB/SQL mutation,
- no deploy.

## Integration With SOLID

The checklist should provide review questions for each SOLID principle:

- SRP: one responsibility, one reason to change, clear ownership.
- OCP: extension through contracts instead of core modification.
- LSP: replacement safety and contract expectations.
- ISP: small, caller-focused interfaces.
- DIP: dependencies point toward abstractions, not concrete infrastructure.

The checklist layer should not execute SOLID refactors.

## Integration With Module Boundaries

Module boundary rules should inform checklist items:

- source and target layers,
- allowed and forbidden policies,
- future-gated dependencies,
- live-adjacent isolation,
- advisory/source-only boundaries.

Checklist findings may reference module boundary finding ids as metadata.

## Integration With Dependency Inversion

DIP rules should inform checklist items:

- dependency category,
- expected abstraction,
- actual dependency metadata,
- concrete adapter pressure,
- provider/runtime/dashboard leakage.

Checklist findings may reference Dependency Inversion finding ids as metadata.

## Integration With Architecture Smells

Smell taxonomy should inform checklist items:

- smell category,
- smell severity,
- related SOLID principles,
- related boundary finding references,
- related Dependency Inversion finding references.

Checklist findings may reference smell finding ids as metadata.

## PM And Autopilot Integration

Review findings may later feed:

- PM Status Reports,
- PM risk metadata,
- PM blocker metadata,
- Next Best Action recommendations,
- phase closeout summaries,
- future review reports.

This relationship is contextual. Checklist findings must not trigger handoff,
validation, memory persistence, next-action coordination, closeout, approvals,
jobs, provider behavior, or refactors by themselves.

## Future 115I Scope

Recommended safe implementation scope:

- create `src/architecture/reviewFindingTypes.ts`,
- create `src/architecture/reviewTemplates.ts`,
- update `src/architecture/index.ts`,
- create `docs/solid-review-checklist.md`,
- optionally create `scripts/solid-review-checklist-tests.ts`.

Future 115I should define source-only types, static checklist item constants,
review finding metadata, review templates, suggestion metadata, and smoke
tests.

Future 115I must not add repository reading, syntax-tree parsing, import
parsing, refactor engines, runtime wiring, provider calls, dashboard mutation,
OpenClaw, WhatsApp outbound, n8n, persistence, DB/SQL, deployment, package
changes, or workflow changes.

## Verification Plan For 115I

Recommended checks:

- `git status --short --branch`,
- TypeScript check with Windows Node fallback when WSL Node is unavailable,
- targeted checklist smoke script if added,
- `git diff --check`,
- `git diff --cached --check`,
- staged file scope review,
- forbidden-pattern review over changed architecture files and docs.

## Return Path

After Phase 115I closes, the next formal target should be:

- Phase 116B - SOLID VALIDATOR CORE PLAN

Phase 116 should plan a source-only validator core over caller-provided
metadata and should still avoid repository reading, syntax-tree parsing, and
refactor execution unless a later phase explicitly changes the boundary.
