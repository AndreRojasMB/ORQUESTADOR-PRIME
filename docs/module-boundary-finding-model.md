# Module Boundary Finding Model

Phase: 112B - MODULE BOUNDARY RULES PLAN

Status: finding model plan / docs-only

## Purpose

This document defines the planned metadata shape for future module boundary
findings.

Boundary findings should help reviewers understand when one module layer
depends on another layer in a way that is allowed, review-required, forbidden,
or future-gated. Findings must not trigger refactors or enforcement by
themselves.

## Planned Finding Fields

A future `ModuleBoundaryFinding` should include:

- `findingId`
- `sourceModule`
- `targetModule`
- `sourceLayer`
- `targetLayer`
- `importPath`
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

## Module Reference Model

`sourceModule` and `targetModule` should be metadata references, not paths to
open.

Recommended fields:

- `moduleRefId`
- `label`
- `safeSummary`
- `layer`
- `riskSurfaces`
- `metadataOnly`
- `noFileRead`

Module references should avoid absolute local paths, raw source text, logs,
provider output, dashboard data, secrets, credentials, or production data.

## Layer Vocabulary

Recommended layer values:

- `core`
- `pm`
- `architecture`
- `autopilot`
- `integrations`
- `whatsapp`
- `viernesBridge`
- `dashboard`
- `scripts`
- `docs`
- `tests`
- `providers`
- `config`
- `runtime_future`

Layer values describe review categories only.

## Policy Vocabulary

Recommended policy values:

- `allowed`
- `allowed_type_only`
- `review_required`
- `forbidden`
- `future_gated`

Policy values are advisory. They do not block a build, fail CI, mutate files,
or enforce runtime behavior in Phase 112.

## Severity Vocabulary

Recommended severity values:

- `info`
- `warn`
- `fail`
- `critical`

Severity should guide review priority:

- `info`: dependency is acceptable or explanatory,
- `warn`: design pressure should be reviewed,
- `fail`: boundary concern should block the current proposed change,
- `critical`: stop implementation and request human review.

## Suggested Action

Suggested actions should be future work metadata only.

Recommended examples:

- add a type-only contract,
- invert dependency direction in a future phase,
- isolate a live-adjacent adapter,
- move display logic behind a read-only contract,
- defer runtime integration.

Suggested actions must include `noExecution` and `noRefactorExecution` flags.

## PM Escalation

Boundary findings may feed:

- PM Status Reports,
- risk metadata,
- blocker metadata,
- Next Best Action recommendations,
- phase closeout summaries.

Escalation should describe where a finding belongs. It should not invoke PM
modules or mutate PM state.

## Autopilot Use

Recommended values:

- `not_applicable`
- `handoff_context_only`
- `validation_context_only`
- `closeout_context_only`

Autopilot use is descriptive. It does not start runners, validations, memory
persistence, next-action coordination, or closeout.

## Validation Strategy For 112I

Future source-only validation should check:

- finding ids are present, trimmed, unique, and bounded,
- source and target module refs are metadata-only,
- layers are known,
- policies are known,
- severity values are known,
- import path is metadata only and not an absolute local path,
- evidence refs are metadata-only,
- suggested actions do not execute,
- PM escalation is metadata-only,
- Autopilot use is context-only,
- live-adjacent imports are absent from architecture source.

## Planned Source Outputs

Future 112I should likely define:

- `ModuleLayer`
- `ModuleImportPolicy`
- `ModuleBoundarySeverity`
- `ModuleReference`
- `ModuleBoundaryRule`
- `ModuleBoundaryFinding`
- `ModuleLayerMapEntry`
- `ModuleLayerMap`
- `ModuleBoundarySummary`

These outputs should include report-only, advisory-only, source-only, and
no-refactor/no-scanner posture flags.

## Non-Goals

The finding model does not:

- scan files,
- parse imports automatically,
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
