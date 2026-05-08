# Backend Layering Rules Plan

Phase: 118B - BACKEND LAYERING RULES PLAN

Status: planning / audit / scope

## Purpose

Backend Layering Rules will define source-only and report-only metadata for
backend architecture review. The layer will model controller, service, domain,
repository, adapter, provider, configuration, IO, runtime, integration, and
database/SQL boundaries without touching real backend modules.

This phase does not implement backend rules. It creates the technical plan for
Phase 118I.

## Backend Layering Scope

The planned scope is:

- controller and API boundary,
- service and application orchestration boundary,
- domain and core boundary,
- repository boundary,
- adapter boundary,
- provider boundary,
- configuration boundary,
- IO boundary,
- runtime boundary,
- integration boundary,
- database and SQL state-change warning as a future-gated concern,
- authentication and security boundary.

The rules should describe backend ownership and risk. They should not validate
real files, call providers, touch runtime behavior, or change persistence.

## Backend Layer Categories

Phase 118I should define these backend layer category values:

- `controller_boundary`
- `service_orchestration`
- `domain_core`
- `repository_boundary`
- `adapter_boundary`
- `provider_boundary`
- `io_boundary`
- `config_boundary`
- `integration_boundary`
- `runtime_future_boundary`
- `db_sql_boundary`
- `auth_security_boundary`

Categories are review labels. They should not imply enforcement, execution, or
backend wiring.

## Backend Finding Model

The future `BackendLayeringFinding` metadata should include:

- `findingId`
- `ruleId`
- `backendLayerCategory`
- `sourceModule`
- `affectedLayer`
- `severity`
- `description`
- `evidenceRefs`
- `relatedSolidPrinciples`
- `relatedBoundaryFindingRefs`
- `relatedDependencyFindingRefs`
- `relatedSmellCategoryRefs`
- `suggestedAction`
- `riskLevel`
- `approvalRequired`
- `pmEscalation`
- `autopilotUse`

Findings should be advisory records only. They should not be commands, backend
changes, provider calls, or persistence operations.

## IO Boundary Rule Model

The future `IoBoundaryRule` metadata should include:

- `ruleId`
- `title`
- `category`
- `allowedResponsibilities`
- `forbiddenResponsibilities`
- `reviewRequiredResponsibilities`
- `severityDefault`
- `requiredEvidence`
- `reportOnly`
- `safetyBoundaries`

IO boundary rules should explain where external interaction belongs. They
should remain metadata and should not open connections, run adapters, change
configuration, or touch database state.

## Safety Boundaries

Backend Layering Rules must remain:

- report-only,
- advisory-only,
- source-only,
- caller-supplied metadata only,
- no backend or runtime state changes,
- no provider calls,
- no database or SQL state changes,
- no filesystem scans,
- no runtime scanner,
- no source-tree parsing,
- no repository reading,
- no automatic import detection,
- no source rewrite,
- no refactor execution,
- no OpenClaw,
- no WhatsApp outbound,
- no n8n,
- no memory persistence,
- no source-control behavior from source,
- no process launch,
- no env or network access,
- no release rollout.

## Architecture Integration

Backend rules should build on the previous architecture layers:

- SOLID Architecture Charter defines principle metadata.
- Module Boundary Rules define layer ownership and import policies.
- Dependency Inversion Rules define abstraction and adapter expectations.
- Architecture Smell Taxonomy names backend coupling and side-effect smells.
- SOLID Review Checklist turns architecture signals into review questions.
- SOLID Validator Core aggregates caller-supplied metadata into reports.
- Frontend Responsibility Rules provide a parallel UI responsibility model.

The backend layer should add backend-specific vocabulary without executing
reviews over real source files.

## PM and Autopilot Integration

Backend findings may later feed:

- PM Status Reports,
- PM risk metadata,
- PM blocker metadata,
- Next Best Action context,
- phase closeout context,
- future quality gate drafts.

This integration is context only. Backend findings must not trigger provider
calls, database changes, handoff, execution, memory writes, approvals, commits,
pushes, or closeout automatically.

## Future 118I Implementation Plan

The safe implementation scope for Phase 118I should be:

- create `src/architecture/backendRules.ts`,
- create `src/architecture/ioBoundaryRules.ts`,
- update `src/architecture/index.ts`,
- create `docs/backend-layering-rules.md`,
- optionally create `scripts/backend-layering-rules-tests.ts` if it can run
  without package changes.

Phase 118I should not add provider calls, database or SQL state changes,
repository reading, source-tree parsing, automatic import detection, runtime
wiring, package script changes, or refactor execution.

## Verification Plan

Phase 118B verification should confirm:

- only documentation changed,
- no architecture implementation was added,
- no backend or runtime files changed,
- no provider calls were added,
- no database or SQL state changes were added,
- no scanner behavior was added,
- no source-tree parsing was added,
- no repository reading was added,
- no automatic import detection was added,
- no refactor execution was added,
- no dashboard mutation was added,
- no package changes were made,
- no secrets or network behavior were touched,
- no source-control automation was added.

## Return Path

After Phase 118I, the next formal target should be:

- Phase 119B - PM/SOLID REPORT ENVELOPES PLAN
