# IO Boundary Rule Model

Phase: 118B - BACKEND LAYERING RULES PLAN

Status: planning / audit / scope

## Purpose

The IO Boundary Rule Model defines the metadata shape planned for backend IO
responsibility review. It explains how future rules can describe allowed,
forbidden, and review-required responsibilities without executing backend code.

## Backend Layer Categories

The planned categories are:

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

## Responsibility Vocabulary

Future IO rules may use responsibility labels such as:

- `accept_request_metadata`
- `validate_request_metadata`
- `orchestrate_use_case`
- `apply_domain_rule`
- `describe_repository_contract`
- `describe_adapter_contract`
- `reference_provider_boundary`
- `reference_config_boundary`
- `reference_io_boundary`
- `reference_runtime_future`
- `reference_database_sql_boundary`
- `reference_auth_security_boundary`

These labels are metadata only. They do not invoke backend behavior.

## IO Boundary Rule Metadata

The future `IoBoundaryRule` type should include:

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

Rules should be stable, static, and strict-compatible TypeScript metadata in
Phase 118I.

## Backend Layering Finding Metadata

The future `BackendLayeringFinding` type should include:

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

Findings should capture review evidence and safe suggestions. They should not
perform IO, run adapters, or change backend state.

## Severity Guidance

Severity should remain advisory:

- `info`: documentation or ownership clarification.
- `low`: small layering ambiguity.
- `medium`: responsibility overlap or review-needed IO boundary.
- `high`: concrete coupling risk or side-effect risk.
- `critical`: safety, provider, runtime, database, or approval boundary risk.

Severity must not fail builds or trigger execution by itself.

## Evidence Model

Evidence references should be caller-supplied metadata. They may point to
review notes, docs, contracts, or known finding ids. The IO rule layer must not
collect evidence by reading source trees or discovering imports.

## Integration Notes

The IO boundary model supports:

- SOLID principle findings through SRP and DIP boundary clarity,
- Module Boundary Rules through backend layer ownership,
- Dependency Inversion Rules through ports and adapters,
- Architecture Smell Taxonomy through hidden-side-effect and coupling signals,
- SOLID Review Checklist through backend review questions,
- SOLID Validator Core through caller-supplied findings,
- Frontend Responsibility Rules through parallel UI/backend separation,
- PM and Autopilot through report context.

It must not trigger refactor execution, provider calls, database changes,
handoff, validation, closeout, memory writes, approvals, commits, or pushes.

## Non-Goals

Phase 118B and the future 118I MVP intentionally exclude:

- real backend validation,
- source-tree parsing,
- repository reading,
- automatic import detection,
- dependency graph extraction,
- scanner behavior,
- runtime wiring,
- provider integration,
- database or SQL state changes,
- dashboard integration,
- persistence,
- package script changes,
- workflow changes.

## Next Phase

The next implementation phase should be:

- Phase 118I - BACKEND LAYERING RULES IMPLEMENTATION
