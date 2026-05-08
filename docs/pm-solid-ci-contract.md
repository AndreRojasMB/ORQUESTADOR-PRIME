# PM/SOLID CI Contract

Phase: 119I - PM/SOLID REPORT ENVELOPES IMPLEMENTATION

Status: source-only / report-only / advisory

## Purpose

The PM/SOLID CI Contract defines metadata-only report envelopes for PM and
Architecture/SOLID outputs. The contract gives future tools a stable shape for
local formatting, JSON serialization, and SARIF-compatible mapping without
activating CI behavior or emitting files.

## Implemented Source Files

- `src/pm/cli/report.ts`
- `src/architecture/cli/report.ts`

## Shared Envelope Model

`ReportEnvelope` includes:

- envelope id,
- schema version,
- source,
- report kind,
- phase reference,
- generated-at label supplied by the caller,
- status,
- severity,
- summary,
- findings,
- evidence references,
- limitations,
- recommended next action,
- risk level,
- approval requirement,
- PM escalation metadata,
- Autopilot use metadata,
- CI compatibility metadata,
- SARIF-ready metadata,
- source-only safety flags.

The envelope is deterministic from caller-provided metadata. It does not read
the clock, inspect files, or publish reports.

## PM Envelope Model

`PMReportEnvelope` extends the shared envelope with:

- PM report reference,
- project state reference,
- milestone reference,
- phase reference,
- blockers,
- risks,
- approvals,
- DoD gaps,
- next action,
- confidence,
- uncertainty,
- evidence references,
- optional PM status report metadata.

PM envelopes wrap report metadata only. They do not build, persist, publish, or
approve PM reports by themselves.

## Architecture/SOLID Envelope Model

`ArchitectureReportEnvelope` extends the shared envelope with:

- architecture report reference,
- architecture layer,
- SOLID findings,
- module boundary findings,
- Dependency Inversion findings,
- architecture smell findings,
- review checklist findings,
- validator summary,
- validator report metadata,
- frontend findings,
- backend findings,
- severity counts,
- limitations,
- evidence references.

Architecture envelopes aggregate supplied metadata only. They do not run
validators or read source trees.

## Status and Severity Model

Implemented statuses:

- `passed`
- `warning`
- `failed`
- `needs_review`
- `blocked`
- `insufficient_evidence`

Implemented severities:

- `info`
- `low`
- `medium`
- `high`
- `critical`

Severity and status are advisory metadata. They do not activate gates, block
branches, or execute follow-up actions.

## CI/SARIF-Ready Metadata

`CiCompatibilityMetadata` records:

- future local formatting eligibility,
- future JSON serialization eligibility,
- future SARIF mapping eligibility,
- advisory-only posture,
- no CI activation,
- no CI config changes,
- no package command changes,
- no blocking gate,
- no artifact publication.

`SarifReadyMetadata` records:

- rule id prefix,
- result kind,
- severity mapping,
- evidence mapping label,
- limitation mapping label,
- metadata-only posture,
- no file emission,
- no artifact publication.

These fields are compatibility metadata only. They do not create output files,
upload results, or activate CI.

## Helpers

Implemented pure helpers:

- `createReportEnvelope(...)`
- `createPmReportEnvelope(...)`
- `createArchitectureReportEnvelope(...)`
- `summarizeReportEnvelope(...)`
- `countEnvelopeSeverities(...)`
- `buildCiCompatibilityMetadata(...)`
- `buildSarifReadyMetadata(...)`

Helpers operate only on caller-provided objects and static defaults.

## Safety Boundaries

The implementation remains:

- source-only,
- report-only,
- advisory-only,
- metadata-only,
- CI compatibility only,
- SARIF compatibility only,
- no CI activation,
- no CI config changes,
- no package command changes,
- no SARIF file emission,
- no artifact publication,
- no runtime executor,
- no process launch from source,
- no provider calls,
- no OpenClaw,
- no WhatsApp outbound,
- no n8n,
- no dashboard mutation,
- no secrets or environment reads,
- no network access,
- no database or SQL state changes,
- no memory persistence,
- no source-control behavior from source,
- no scanner behavior,
- no syntax-tree parsing,
- no repository reading,
- no automatic import detection,
- no refactor execution.

## PM Integration

PM envelopes may wrap:

- PM Status Reporting,
- PM Core Review summaries,
- next-best-action recommendations,
- approval readiness metadata,
- blocker and risk metadata,
- milestone health and DoD gap metadata.

This is context only. PM envelopes do not mutate project state, approve work,
or trigger next actions.

## SOLID and Architecture Integration

Architecture envelopes may wrap:

- SOLID Validator Core reports,
- SOLID Review Checklist findings,
- Architecture Smell Taxonomy findings,
- Module Boundary Rules findings,
- Dependency Inversion Rules findings,
- Frontend Responsibility Rules findings,
- Backend Layering Rules findings.

This is aggregation only. Architecture envelopes do not run scanners, source
analysis, validators, or refactors.

## Autopilot Integration

Report envelopes may feed:

- Codex handoff context,
- validation memory proposal context,
- next-action coordinator inputs,
- phase closeout coordinator inputs.

They do not trigger handoff, validation, memory writes, execution, approvals,
commits, pushes, or closeout automatically.

## Limitations

Phase 119I intentionally does not include:

- report publication,
- local report files,
- stdout formatters,
- SARIF file emission,
- artifact publication,
- CI configuration changes,
- package command changes,
- runtime wiring,
- provider integration,
- dashboard integration,
- database integration,
- persistence,
- scanner behavior,
- syntax-tree parsing,
- repository reading,
- automatic import detection,
- refactor execution.

## Next Phase

The next formal target is:

- Phase 120B - PM + SOLID INTEGRATION REVIEW PLAN
