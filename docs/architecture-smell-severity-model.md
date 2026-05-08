# Architecture Smell Severity Model

Phase: 114B - ARCHITECTURE SMELL TAXONOMY PLAN

Status: severity model plan / docs-only

## Purpose

This document defines the planned severity and finding metadata for future
Architecture Smell Taxonomy implementation.

Severity should help reviewers decide whether an architecture smell is context,
planning work, scope pressure, a blocker, or a stop condition. It should not
enforce runtime behavior.

## Severity Values

Recommended values:

- `info`
- `low`
- `medium`
- `high`
- `critical`

## Severity Meaning

### info

Informational smell or traceability note. It can be included in reports but
does not require immediate action.

### low

Small architecture pressure. It may be handled in normal planning or later
cleanup.

### medium

Meaningful architecture drift. It should appear in PM reports or planning
metadata before expanding scope.

### high

High-risk architecture pressure. It should usually trigger human review,
explicit planning, or a bounded follow-up phase before implementation expands.

### critical

Stop condition. It should block implementation until reviewed, especially when
the smell suggests provider leakage, runtime coupling in source-only modules,
approval bypass, hidden side effects, or automation overreach.

## Severity Inputs

Future severity helpers should consider caller-provided metadata:

- smell category,
- related SOLID principles,
- affected module layer,
- risk level,
- approval requirement,
- related module boundary findings,
- related Dependency Inversion findings,
- whether the smell implies source-only boundary leakage,
- whether the smell implies runtime/provider/dashboard coupling,
- whether the smell implies hidden side effects or approval bypass.

Inputs are metadata. They are not instructions to inspect files.

## Category-To-Severity Guidance

Suggested default posture:

- `responsibility_overload`: low to medium.
- `core_infra_coupling`: high.
- `provider_leakage`: high to critical.
- `dashboard_write_leakage`: high.
- `runtime_dependency_in_source_only`: high to critical.
- `ambiguous_boundary`: medium.
- `oversized_interface`: medium.
- `contract_substitution_risk`: medium to high.
- `extension_blocked_by_core_modification`: medium to high.
- `hidden_side_effect`: high to critical.
- `approval_bypass_risk`: critical.
- `automation_overreach`: high to critical.

The future implementation should allow caller-provided risk to increase
severity but should not decrease critical safety issues without human review.

## Smell Finding Fields

A future `ArchitectureSmellFinding` should include:

- `findingId`
- `smellCategory`
- `relatedPrinciples`
- `sourceModule`
- `affectedLayer`
- `severity`
- `description`
- `evidenceRefs`
- `relatedBoundaryFindingRefs`
- `relatedDependencyFindingRefs`
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

## Suggested Action Model

Suggested actions should be metadata only. Examples:

- split responsibilities in a future phase,
- introduce a future port contract,
- document a boundary in a future review,
- move dashboard behavior behind a future read-only contract,
- defer runtime integration,
- escalate to PM risk or blocker metadata,
- request human review for approval-bypass risk.

Suggested actions must not execute refactors, dispatch jobs, mutate state, call
providers, or start Autopilot steps.

## Escalation Model

Smell severity should map to advisory escalation:

- `info`: PM status report context.
- `low`: PM status report or future checklist.
- `medium`: PM risk metadata or next-action planning.
- `high`: PM risk/blocker metadata and human review.
- `critical`: blocking alert and phase closeout context.

Escalation remains metadata-only.

## Validation Strategy For 114I

Future source-only validation should check:

- finding ids are present, trimmed, unique, and bounded,
- smell categories are known,
- severity values are known,
- related principles are known,
- source modules are metadata-only,
- affected layers are known,
- evidence refs are metadata-only,
- related finding references are metadata-only,
- suggested actions do not execute,
- PM escalation is metadata-only,
- Autopilot use is context-only,
- live-adjacent imports are absent from architecture source.

## Planned Source Outputs

Future 114I should likely define:

- `ArchitectureSmellCategory`
- `ArchitectureSmellSeverity`
- `ArchitectureSmellFinding`
- `ArchitectureSmellFindingInput`
- `ArchitectureSmellSuggestedAction`
- `ArchitectureSmellSummary`
- `classifyArchitectureSmellSeverity(...)`
- `createArchitectureSmellFinding(...)`
- `summarizeArchitectureSmellFindings(...)`
- `describeArchitectureSmellCategory(...)`

These outputs should include report-only, advisory-only, source-only, and
no-refactor/no-scanner posture flags.

## Non-Goals

The severity model does not:

- inspect files,
- parse imports automatically,
- parse syntax trees,
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
