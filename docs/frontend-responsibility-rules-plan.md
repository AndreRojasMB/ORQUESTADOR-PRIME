# Phase 117B - Frontend Responsibility Rules Plan

## Purpose

Phase 117 plans Frontend Responsibility Rules as a source-only and report-only architecture layer. The layer will define generic frontend responsibility metadata for UI components, state ownership, effects, routing, forms, accessibility, design system boundaries, and dashboard write-path warnings.

This phase does not inspect or modify the real dashboard. It does not implement frontend validators, scanners, source-tree parsing, automatic import detection, repository reading, refactors, runtime wiring, provider calls, dashboard mutation, or deployment behavior.

## Frontend Responsibility Scope

The future layer should model review rules for:

- Presentational components.
- Container or controller components.
- State ownership.
- Side-effect boundaries.
- Data fetching boundaries.
- Routing boundaries.
- Form responsibility.
- Accessibility responsibility.
- Design token and style responsibility.
- Component composition.
- Dashboard write-path warning as a future-gated concern.
- Provider-adjacent UI boundaries.
- Runtime-future UI boundaries.

The scope is generic architecture metadata. It should not depend on any concrete dashboard implementation file.

## Frontend Responsibility Categories

Future `FrontendResponsibilityCategory` values should include:

- `presentation_only`
- `container_orchestration`
- `state_management`
- `effect_boundary`
- `routing_boundary`
- `data_adapter_boundary`
- `form_validation_boundary`
- `accessibility_boundary`
- `design_system_boundary`
- `dashboard_write_boundary`
- `provider_boundary`
- `runtime_future_boundary`

Categories are review labels only. They do not imply enforcement, runtime behavior, or code changes.

## Frontend Finding Model

Future `FrontendResponsibilityFinding` metadata should include:

- `findingId`: stable finding id.
- `ruleId`: source rule id.
- `responsibilityCategory`: frontend responsibility category.
- `sourceModule`: metadata-only source module reference.
- `affectedComponent`: component reference supplied by the caller.
- `affectedLayer`: module layer affected by the finding.
- `severity`: advisory severity.
- `description`: human-readable issue description.
- `evidenceRefs`: caller-supplied evidence references.
- `relatedSolidPrinciples`: related SOLID principles.
- `relatedSmellCategoryRefs`: related architecture smell categories.
- `suggestedAction`: advisory next action.
- `riskLevel`: PM risk tier.
- `approvalRequired`: whether human approval is required before follow-up.
- `pmEscalation`: PM escalation metadata.
- `autopilotUse`: Autopilot context metadata.

Findings must be metadata only and must not trigger UI changes.

## UI Boundary Rule Model

Future `UiBoundaryRule` metadata should include:

- `ruleId`: stable rule id.
- `title`: concise rule title.
- `category`: frontend responsibility category.
- `allowedResponsibilities`: responsibilities allowed for the category.
- `forbiddenResponsibilities`: responsibilities that should be separated.
- `reviewRequiredResponsibilities`: responsibilities requiring human review.
- `severityDefault`: default advisory severity.
- `requiredEvidence`: caller-supplied evidence required for confidence.
- `reportOnly`: must remain true.
- `safetyBoundaries`: source-only and report-only safety metadata.

Rules should describe responsibility boundaries. They must not read components, inspect routes, rewrite UI, or mutate dashboard state.

## Decision Concepts

The future implementation should classify supplied metadata using simple, pure rules:

- Presentational components should not own data fetching, provider calls, routing orchestration, or writes.
- Container components may orchestrate state and data adapters when the caller supplies evidence.
- State ownership should be explicit and should not be hidden inside unrelated visual components.
- Effects should be isolated and reviewed when they imply external behavior.
- Routing should remain separate from visual-only components.
- Forms should separate validation metadata from provider writes and submission side effects.
- Accessibility should be explicit and reviewable for interactive UI.
- Design tokens and styles should not embed data or provider behavior.
- Dashboard write paths are future-gated and must remain advisory metadata in this block.

## Safety Boundaries

The future layer must remain:

- Report-only.
- Advisory-only.
- Source-only.
- Caller-supplied metadata only.
- No dashboard mutation.
- No dashboard refactor.
- No filesystem scans.
- No runtime scanner.
- No source-tree parsing.
- No repository reading.
- No automatic import detection.
- No automatic source changes.
- No providers.
- No OpenClaw.
- No WhatsApp outbound.
- No n8n.
- No memory persistence.
- No git automation.
- No process launch.
- No env or network access.
- No DB, SQL, or deploy actions.

## Integration With Prior Architecture Layers

Frontend responsibility rules should build on:

- Phase 111I SOLID Architecture Charter for SRP, OCP, ISP, and DIP vocabulary.
- Phase 112I Module Boundary Rules for layer metadata and dashboard/provider boundaries.
- Phase 113I Dependency Inversion Rules for UI-to-provider and UI-to-runtime dependency posture.
- Phase 114I Architecture Smell Taxonomy for UI responsibility overload, dashboard leakage, hidden side effects, and approval bypass risk.
- Phase 115I SOLID Review Checklist for repeatable frontend review questions.
- Phase 116I SOLID Validator Core for report aggregation over caller-supplied metadata.

The frontend layer should contribute specialized frontend metadata to these layers rather than replacing them.

## PM and Autopilot Integration

Frontend findings may feed:

- PM Status Reports.
- PM risk metadata.
- PM blocker metadata.
- Next-best-action recommendations.
- Autopilot validation context.
- Phase closeout summaries.
- Future quality gate drafts.

They must not trigger dashboard mutation, refactors, scanners, handoff, execution, memory writes, approvals, commits, pushes, provider calls, or deployment automatically.

## Future Phase 117I Scope

Phase 117I should safely implement:

- `src/architecture/frontendRules.ts`
- `src/architecture/uiBoundaryRules.ts`
- update `src/architecture/index.ts`
- `docs/frontend-responsibility-rules.md`
- optional `scripts/frontend-responsibility-rules-tests.ts`

Phase 117I must not modify `dashboard/**`, inspect concrete dashboard implementation, read repository contents from source, parse source trees, detect imports automatically, execute refactors, wire runtime behavior, call providers, or mutate dashboard state.

## Return Path

After Phase 117I, the next formal roadmap target should be:

Phase 118B - BACKEND LAYERING RULES PLAN
