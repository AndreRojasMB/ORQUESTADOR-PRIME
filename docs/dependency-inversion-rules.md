# Dependency Inversion Rules

Phase: 113I - DEPENDENCY INVERSION RULES IMPLEMENTATION

Status: source-only / report-only / advisory

## Purpose

The Dependency Inversion Rules layer defines metadata for Dependency Inversion
Principle review inside the SOLID Architecture Quality Core. It models
dependency categories, policies, expected abstractions, actual dependency
metadata, findings, summaries, and a caller-provided metadata classifier.

The layer does not inspect repositories, parse source imports, parse ASTs,
rewrite modules, execute refactors, launch processes, call providers, mutate
dashboards, operate OpenClaw, send WhatsApp messages, run n8n, persist memory,
deploy, mutate DB/SQL, or perform source-control behavior from source.

## Implemented Source Files

- `src/architecture/dependencyRules.ts`
- `src/architecture/dependencyClassifier.ts`
- `src/architecture/index.ts`

## Dependency Categories

Implemented category values:

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

Categories are review labels. They do not imply runtime behavior.

## Dependency Policies

Implemented policy values:

- `allowed`
- `allowed_type_only`
- `review_required`
- `forbidden`
- `future_gated`

Policies describe review posture only. They do not rewrite imports, fail
builds, or enforce CI.

## DIP Finding Model

A dependency inversion finding includes:

- finding id,
- source module reference,
- target module reference,
- dependency category,
- expected abstraction,
- actual dependency metadata,
- policy,
- severity,
- description,
- evidence references,
- suggested action,
- risk level,
- approval metadata,
- PM escalation metadata,
- Autopilot use metadata,
- source-only boundary flags.

Findings are not refactor commands.

## Classifier Metadata

`classifyDependencyMetadata(...)` accepts caller-provided metadata:

- import path metadata,
- source layer,
- target layer,
- target dependency category,
- concrete dependency flag,
- runtime flag,
- provider flag,
- dashboard flag,
- type-only allowance flag,
- classification reason.

The classifier does not discover imports. It only classifies metadata supplied
by the caller.

## Helpers

Implemented pure helpers:

- `createDependencyInversionFinding(...)`
- `classifyDependencyPolicy(...)`
- `classifyDependencyMetadata(...)`
- `summarizeDependencyInversionFindings(...)`
- `describeDependencyCategory(...)`

Helpers operate only on caller-provided metadata and static source constants.

## Boundaries

The implementation remains:

- report-only,
- advisory-only,
- source-only,
- metadata-only,
- no repository inspection,
- no scanner implementation,
- no AST parsing,
- no refactor execution,
- no provider calls,
- no dashboard mutation,
- no OpenClaw,
- no WhatsApp outbound,
- no n8n,
- no memory persistence,
- no source-control behavior from source,
- no process launch,
- no env or network access,
- no DB/SQL mutation,
- no deploy.

## SOLID Integration

Dependency inversion rules deepen the SOLID charter:

- DIP becomes explicit dependency direction metadata.
- OCP is supported through ports and extension boundaries.
- SRP is supported by separating contracts, adapters, providers, runtime, and
  dashboard concerns.
- ISP and LSP remain future contract-review concerns.

The DIP layer does not execute SOLID refactors.

## Module Boundary Integration

This layer builds on Phase 112:

- `ModuleLayer` supplies source and target layer vocabulary.
- module boundary policies supply the policy vocabulary.
- module references supply metadata-only source and target module refs.
- module boundary findings can be refined into DIP findings when the concern
  is dependency direction or concrete adapter leakage.

The DIP layer specializes module boundary metadata. It does not replace it.

## PM Integration

DIP findings may later feed:

- PM Status Reports,
- PM risk metadata,
- PM blocker metadata,
- Next Best Action recommendations,
- phase closeout summaries.

This is context only. The DIP layer does not mutate PM state or invoke PM
builders.

## Autopilot Integration

DIP findings may be passed as context to future handoff, validation, or
closeout metadata.

They do not start handoff runners, validators, memory persistence,
next-action coordination, or closeout coordination.

## Limitations

Phase 113I intentionally does not include:

- repository scanning,
- import parsing,
- AST parsing,
- dependency graph extraction,
- refactor execution,
- import rewriting,
- runtime gates,
- dashboard display,
- provider integration,
- persistence,
- package scripts,
- workflow integration.

## Next Phase

The next formal target is:

- Phase 114B - ARCHITECTURE SMELL TAXONOMY PLAN

Phase 114 should define architecture smell vocabulary using SOLID, module
boundary, and DIP metadata as input context.
