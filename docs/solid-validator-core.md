# SOLID Validator Core

Phase: 116I - SOLID VALIDATOR CORE IMPLEMENTATION

Status: source-only / report-only / advisory

## Purpose

The SOLID Validator Core turns caller-provided architecture metadata into a
structured advisory report. It aggregates rule coverage, checklist metadata,
module boundary findings, Dependency Inversion findings, smell findings,
severity counts, evidence gaps, risk, approvals, PM escalation, and Autopilot
context.

It is not a source analyzer, executor, or refactor layer.

## Implemented Source Files

- `src/architecture/solidRuleRegistry.ts`
- `src/architecture/solidValidator.ts`
- `src/architecture/index.ts`

## Input Model

`SolidValidatorInput` includes:

- validation id,
- target reference,
- target kind,
- supplied modules,
- supplied dependency metadata,
- supplied checklist items,
- supplied module boundary findings,
- supplied Dependency Inversion findings,
- supplied architecture smell findings,
- supplied review findings,
- supplied evidence references,
- config reference,
- source-only safety flags.

All input is provided by the caller. Missing metadata is treated as missing
evidence.

## Rule Registry Model

`SolidRuleRegistryEntry` includes:

- rule id,
- title,
- SOLID principle references,
- checklist item references,
- smell category references,
- module boundary policy references,
- dependency policy references,
- default severity,
- metadata input kind,
- required evidence,
- report-only safety boundaries.

The default registry contains rules for SRP, OCP, LSP, ISP, DIP, module
boundaries, smell taxonomy, and automation safety.

## Output Model

`SolidValidatorReport` includes:

- report id,
- validation id,
- status,
- aggregated findings,
- summary,
- severity counts,
- risk level,
- approval requirement,
- PM escalation metadata,
- Autopilot use metadata,
- evidence references,
- limitations,
- recommended next action,
- source-only safety flags.

## Statuses

Implemented statuses:

- `passed`
- `warning`
- `failed`
- `needs_review`
- `blocked`
- `insufficient_evidence`

## Helpers

Implemented pure helpers:

- `createSolidRule(...)`
- `buildDefaultSolidRuleRegistry(...)`
- `validateSolidInputMetadata(...)`
- `buildSolidValidatorReport(...)`
- `summarizeSolidValidatorFindings(...)`
- `countSolidValidatorSeverities(...)`

Helpers operate on supplied metadata and static constants only.

## Boundaries

The implementation remains:

- source-only,
- report-only,
- advisory-only,
- caller-supplied metadata only,
- no scanner implementation,
- no syntax-tree parsing,
- no repository reading,
- no automatic import detection,
- no refactor execution,
- no runtime executor,
- no process launch,
- no provider calls,
- no OpenClaw,
- no WhatsApp outbound,
- no n8n,
- no dashboard mutation,
- no package script changes,
- no env or network access,
- no database or SQL state changes,
- no release rollout,
- no source-control behavior from source,
- no memory persistence.

## SOLID Integration

The validator registry links rules to SRP, OCP, LSP, ISP, and DIP. The report
aggregates supplied findings into a single advisory view without changing any
module.

## Module Boundary Integration

Supplied module boundary findings are normalized into validator findings.
Boundary severity values are mapped into validator severity counts.

## DIP Integration

Supplied Dependency Inversion findings are normalized into validator findings
and contribute to risk, approvals, and PM escalation metadata.

## Smell Taxonomy Integration

Supplied architecture smell findings are included directly in the validator
report and preserve their related SOLID principle references.

## Checklist Integration

Supplied review findings and checklist items provide review coverage context.
The validator does not execute review templates; it only reports on metadata
already provided by the caller.

## PM and Autopilot Integration

Validator reports may feed:

- PM Status Reports,
- PM risk metadata,
- PM blocker metadata,
- next-best-action context,
- Autopilot validation context,
- phase closeout context.

This is advisory context only. The validator does not trigger handoff, memory
write, closeout, approval, commit, push, or runtime work.

## Limitations

Phase 116I intentionally does not include:

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

- Phase 117B - FRONTEND RESPONSIBILITY RULES PLAN
