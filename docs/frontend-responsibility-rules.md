# Frontend Responsibility Rules

Phase: 117I - FRONTEND RESPONSIBILITY RULES IMPLEMENTATION

Status: source-only / report-only / advisory

## Purpose

The Frontend Responsibility Rules layer defines metadata for frontend and UI
responsibility review. It models component responsibilities, UI boundaries,
frontend findings, severity, evidence, SOLID links, smell links, PM escalation,
and Autopilot context.

The layer does not touch the real dashboard. It is generic architecture
metadata and does not validate or change real UI files.

## Implemented Source Files

- `src/architecture/frontendRules.ts`
- `src/architecture/uiBoundaryRules.ts`
- `src/architecture/index.ts`

## Frontend Responsibility Categories

Implemented category values:

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

Categories are review labels. They do not imply enforcement, runtime behavior,
or dashboard changes.

## UI Boundary Rule Model

A UI boundary rule includes:

- rule id,
- title,
- frontend responsibility category,
- allowed responsibilities,
- forbidden responsibilities,
- review-required responsibilities,
- default severity,
- required evidence,
- report-only safety boundaries.

Rules are metadata for review. They do not read components, discover routes,
rewrite UI, or mutate dashboard state.

## Frontend Finding Model

A frontend responsibility finding includes:

- finding id,
- rule id,
- responsibility category,
- source module metadata,
- affected component metadata,
- affected layer,
- severity,
- description,
- evidence references,
- related SOLID principles,
- related architecture smell categories,
- suggested action,
- risk level,
- approval metadata,
- PM escalation metadata,
- Autopilot use metadata,
- source-only boundary flags.

Findings are not refactor commands and do not trigger dashboard work.

## Helpers

Implemented pure helpers:

- `createFrontendResponsibilityFinding(...)`
- `createUiBoundaryRule(...)`
- `buildDefaultUiBoundaryRules(...)`
- `summarizeFrontendResponsibilityFindings(...)`
- `selectUiBoundaryRulesByCategory(...)`
- `describeFrontendResponsibilityCategory(...)`
- `summarizeUiBoundaryRules(...)`

Helpers operate only on caller-provided metadata and static source constants.

## Safety Boundaries

The implementation remains:

- source-only,
- report-only,
- advisory-only,
- metadata-only,
- no dashboard mutation,
- no dashboard source changes,
- no repository reading,
- no scanner implementation,
- no syntax-tree parsing,
- no automatic import detection,
- no refactor execution,
- no runtime executor,
- no process launch,
- no provider calls,
- no OpenClaw,
- no WhatsApp outbound,
- no n8n,
- no memory persistence,
- no source-control behavior from source,
- no env or network access,
- no DB/SQL mutation,
- no deploy.

## SOLID Integration

Frontend rules map to SOLID principles:

- SRP through responsibility separation.
- OCP through component extension boundaries.
- ISP through small UI contracts.
- DIP through data adapter, provider, dashboard, and runtime separation.

The frontend layer does not execute SOLID refactors.

## Architecture Smell Integration

Frontend findings can reference smell categories such as:

- responsibility overload,
- ambiguous boundary,
- hidden side effect,
- dashboard write leakage,
- provider leakage,
- runtime dependency in source-only layers,
- approval bypass risk,
- automation overreach.

These references are metadata only.

## Checklist and Validator Integration

Frontend findings and UI boundary rules can be supplied to future review
checklists and the SOLID Validator Core as caller-provided metadata.

They do not start validators automatically, and they do not inspect source
files to collect evidence.

## PM and Autopilot Integration

Frontend findings may feed:

- PM Status Reports,
- PM risk metadata,
- PM blocker metadata,
- next-best-action context,
- Autopilot validation context,
- phase closeout context.

This is advisory context only. The layer does not trigger handoff, memory
write, closeout, approval, commit, push, runtime behavior, provider calls, or
dashboard changes.

## Dashboard No-Touch Limitation

Phase 117I intentionally does not modify `dashboard/**`, inspect concrete
dashboard implementation files, or make claims about real dashboard behavior.

Dashboard write boundaries are modeled only as future-gated review metadata.

## Limitations

Phase 117I intentionally does not include:

- real UI validation,
- dashboard implementation changes,
- repository reading,
- automatic import detection,
- syntax-tree parsing,
- dependency graph extraction,
- scanner behavior,
- runtime gates,
- refactor execution,
- provider integration,
- dashboard integration,
- persistence,
- package scripts,
- workflow integration.

## Next Phase

The next formal target is:

- Phase 118B - BACKEND LAYERING RULES PLAN
