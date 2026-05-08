# Backend Layering Rules

Phase: 118I - BACKEND LAYERING RULES IMPLEMENTATION

Status: source-only / report-only / advisory

## Purpose

Backend Layering Rules define metadata for backend responsibility review. They
model backend layer categories, IO boundary rules, backend findings, severity,
evidence, SOLID links, boundary links, Dependency Inversion links, smell links,
PM escalation, and Autopilot context.

The layer does not touch real backend modules, providers, database assets,
runtime behavior, dashboard code, or configuration.

## Implemented Source Files

- `src/architecture/backendRules.ts`
- `src/architecture/ioBoundaryRules.ts`
- `src/architecture/index.ts`

## Backend Layer Categories

Implemented category values:

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

Categories are review labels. They do not imply enforcement, backend wiring,
provider calls, persistence activity, or runtime behavior.

## IO Boundary Rule Model

An IO boundary rule includes:

- rule id,
- title,
- backend layer category,
- allowed responsibilities,
- forbidden responsibilities,
- review-required responsibilities,
- default severity,
- required evidence,
- report-only safety boundaries.

Rules describe ownership and review posture. They do not open connections,
read configuration, call adapters, call providers, or change persistence.

## Backend Finding Model

A backend layering finding includes:

- finding id,
- rule id,
- backend layer category,
- source module metadata,
- affected layer,
- severity,
- description,
- evidence references,
- related SOLID principles,
- related module boundary finding references,
- related Dependency Inversion finding references,
- related architecture smell categories,
- suggested action,
- risk level,
- approval metadata,
- PM escalation metadata,
- Autopilot use metadata,
- source-only boundary flags.

Findings are advisory metadata. They are not backend changes or refactor
commands.

## Helpers

Implemented pure helpers:

- `createBackendLayeringFinding(...)`
- `createIoBoundaryRule(...)`
- `buildDefaultIoBoundaryRules(...)`
- `summarizeBackendLayeringFindings(...)`
- `selectIoBoundaryRulesByCategory(...)`
- `describeBackendLayerCategory(...)`
- `summarizeIoBoundaryRules(...)`

Helpers operate only on caller-provided metadata and static source constants.

## Safety Boundaries

The implementation remains:

- source-only,
- report-only,
- advisory-only,
- metadata-only,
- no backend or runtime state changes,
- no provider calls,
- no database or SQL state changes,
- no dashboard mutation,
- no repository reading,
- no scanner implementation,
- no syntax-tree parsing,
- no automatic import detection,
- no refactor execution,
- no runtime executor,
- no process launch,
- no OpenClaw,
- no WhatsApp outbound,
- no n8n,
- no memory persistence,
- no source-control behavior from source,
- no env or network access,
- no release rollout.

## SOLID Integration

Backend categories map to SOLID principles:

- SRP through controller, service, domain, repository, IO, and auth ownership.
- OCP through service, adapter, and integration extension boundaries.
- ISP through controller, repository, and auth contracts.
- DIP through domain, repository, adapter, provider, config, runtime, and
  database boundaries.

The backend layer does not execute SOLID refactors.

## Module Boundary Integration

Backend findings can reference module boundary finding ids to connect backend
layer concerns with source-only import policy metadata.

The layer does not replace Module Boundary Rules and does not validate real
imports.

## DIP Integration

Backend findings can reference Dependency Inversion finding ids where provider,
adapter, repository, config, runtime, or database relationships should stay
behind ports or future-gated contracts.

The layer does not create ports or adapters.

## Architecture Smell Integration

Backend findings can reference smell categories such as:

- responsibility overload,
- core/infra coupling,
- provider leakage,
- runtime dependency in source-only layers,
- hidden side effect,
- approval bypass risk,
- automation overreach.

These references are metadata only.

## Checklist and Validator Integration

Backend findings and IO boundary rules can be supplied to future review
checklists and the SOLID Validator Core as caller-provided metadata.

They do not start validators automatically, and they do not inspect source
files to collect evidence.

## Frontend Responsibility Integration

Backend rules mirror the Frontend Responsibility Rules pattern. Together they
can describe UI/backend separation, data adapter pressure, effect boundaries,
and future-gated write concerns without touching dashboard or backend runtime.

## PM and Autopilot Integration

Backend findings may feed:

- PM Status Reports,
- PM risk metadata,
- PM blocker metadata,
- next-best-action context,
- Autopilot validation context,
- phase closeout context.

This is advisory context only. The layer does not trigger handoff, memory
write, closeout, approval, commit, push, runtime behavior, provider calls, or
database changes.

## Database and Provider No-Touch Limitation

Phase 118I intentionally does not modify database files, SQL artifacts,
provider modules, backend runtime modules, dashboard files, or environment
configuration.

Database, SQL, provider, and runtime concerns are represented only as
caller-supplied review metadata.

## Limitations

Phase 118I intentionally does not include:

- real backend validation,
- backend implementation changes,
- provider integration,
- database or SQL state changes,
- repository reading,
- automatic import detection,
- syntax-tree parsing,
- dependency graph extraction,
- scanner behavior,
- runtime gates,
- refactor execution,
- dashboard integration,
- persistence,
- package scripts,
- workflow integration.

## Next Phase

The next formal target is:

- Phase 119B - PM/SOLID REPORT ENVELOPES PLAN
