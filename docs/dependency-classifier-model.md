# Dependency Classifier Model

Phase: 113B - DEPENDENCY INVERSION RULES PLAN

Status: classifier model plan / docs-only

## Purpose

This document defines the planned metadata shape for future dependency
classification and Dependency Inversion Principle findings.

The classifier should help reviewers understand whether a dependency points to
a domain contract, source-only metadata, a port, a concrete adapter, a provider,
runtime, dashboard, script, test, config, or future external surface. It must
not discover imports by reading the repository.

## Planned Dependency Categories

Recommended category values:

- `domain_contract`
- `source_only_metadata`
- `port`
- `adapter`
- `provider`
- `runtime`
- `dashboard`
- `script`
- `test`
- `config`
- `external_future`

Categories are advisory review labels. They do not imply runtime behavior.

## Planned Policy Values

Recommended policy values:

- `allowed`
- `allowed_type_only`
- `review_required`
- `forbidden`
- `future_gated`

Policy values should align with Phase 112 module boundary policies.

## Classifier Input Model

A future `DependencyClassifierInput` should include:

- `importPath`
- `sourceLayer`
- `targetLayer`
- `targetCategory`
- `isConcrete`
- `isRuntime`
- `isProvider`
- `isDashboard`
- `isAllowedTypeOnly`
- `classificationReason`
- `evidenceRefs`

Inputs are caller-provided metadata. They are not instructions to inspect a
file.

## Classifier Result Model

A future `DependencyClassifierResult` should include:

- `dependencyCategory`
- `policy`
- `severity`
- `expectedAbstraction`
- `actualDependency`
- `classificationReason`
- `safeSummary`
- `requiresHumanReview`
- `riskLevel`
- `pmEscalation`
- `autopilotUse`
- source-only boundary flags

## DIP Finding Model

A future `DependencyInversionFinding` should include:

- `findingId`
- `sourceModule`
- `targetModule`
- `dependencyCategory`
- `expectedAbstraction`
- `actualDependency`
- `policy`
- `severity`
- `description`
- `evidenceRefs`
- `suggestedAction`
- `riskLevel`
- `approvalRequired`
- `pmEscalation`
- `autopilotUse`
- `metadataOnly`
- `reportOnly`
- `advisoryOnly`
- `sourceOnly`
- `noRefactorExecution`
- `noScannerExecution`
- `noRuntimeExecution`

## Expected Abstraction Model

`expectedAbstraction` should describe the safer dependency shape. Examples:

- use a domain contract instead of a provider client,
- use a port instead of a concrete adapter,
- use source-only metadata instead of runtime state,
- use a read-only report contract instead of dashboard internals,
- defer external dependency work to a future gated phase.

Expected abstractions are recommendations. They do not apply changes.

## Actual Dependency Model

`actualDependency` should describe the dependency metadata observed or supplied
by the caller:

- module reference,
- target category,
- import path metadata,
- concrete/runtime/provider/dashboard flags,
- review rationale.

It should not include raw source snippets, secrets, tokens, production data,
logs, provider responses, or dashboard store payloads.

## Severity Strategy

Recommended severity values:

- `info`
- `warn`
- `fail`
- `critical`

Suggested mapping:

- `allowed` -> `info`
- `allowed_type_only` -> `info`
- `review_required` -> `warn`
- `forbidden` -> `fail`
- `future_gated` -> `warn` or `fail` depending on risk
- critical risk or concrete runtime/provider dependency in source-only
  architecture -> `critical`

Severity guides review priority. It does not enforce runtime behavior.

## Suggested Action Model

Suggested actions should be metadata only. Examples:

- introduce a future port contract,
- move concrete adapter dependency behind a future approved boundary,
- keep PM/architecture references type-only,
- defer runtime integration,
- add a future report-only finding to PM status reporting.

Suggested actions must include advisory/source-only posture flags and must not
execute refactors.

## Validation Strategy For 113I

Future source-only validation should check:

- finding ids are present, trimmed, unique, and bounded,
- dependency categories are known,
- policies are known,
- severities are known,
- source and target modules are metadata-only,
- import path is metadata and not an absolute local path,
- concrete provider/runtime/dashboard flags escalate appropriately,
- evidence refs are metadata-only,
- suggested actions do not execute,
- PM escalation is metadata-only,
- Autopilot use is context-only,
- live-adjacent imports are absent from architecture source.

## Planned Source Outputs

Future 113I should likely define:

- `DependencyCategory`
- `DependencyPolicy`
- `DependencyInversionSeverity`
- `DependencyClassifierInput`
- `DependencyClassifierResult`
- `DependencyInversionRule`
- `DependencyInversionFinding`
- `DependencyInversionFindingInput`
- `DependencyInversionSummary`

These outputs should include report-only, advisory-only, source-only, and
no-refactor/no-scanner posture flags.

## Non-Goals

The classifier model does not:

- inspect files,
- parse imports automatically,
- parse ASTs,
- rewrite imports,
- move modules,
- execute refactors,
- call providers,
- mutate dashboards,
- operate OpenClaw,
- send messages,
- run n8n,
- persist memory,
- create approvals,
- dispatch jobs,
- change packages,
- change workflows,
- deploy.
