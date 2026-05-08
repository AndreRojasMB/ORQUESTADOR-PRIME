# Dependency Inversion Rules Plan

Phase: 113B - DEPENDENCY INVERSION RULES PLAN

Status: planning / audit / docs-only

## Purpose

Phase 113 plans Dependency Inversion Rules for the SOLID Architecture Quality
Core. The goal is to define source-only metadata for dependency direction,
ports, adapters, concrete dependency risk, and future DIP findings without
adding validators, repository inspection, import parsing, runtime behavior, or
refactors.

This phase is documentation only. It does not implement architecture source,
scan files, parse imports, rewrite modules, launch processes, call providers,
mutate dashboards, operate OpenClaw, send WhatsApp messages, run n8n, persist
memory, change packages or workflows, mutate DB/SQL, deploy, or perform
source-control behavior from source.

## DIP Scope

The future dependency inversion layer should describe:

- core modules depending on abstractions rather than concrete infrastructure,
- PM and architecture modules staying source-only and advisory,
- providers and connectors staying out of PM and architecture core,
- future runtime dependencies remaining explicitly gated,
- concrete adapters living outside source-only domains,
- dependency findings that can be reviewed by humans before any future
  implementation phase.

The layer should model dependency direction. It must not enforce dependency
direction by scanning the repository or blocking builds in Phase 113.

## Dependency Categories

Recommended dependency category values:

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

### domain_contract

Stable domain contracts, type vocabulary, evidence references, and risk labels.
These should be safe for core, PM, architecture, and Autopilot modules when the
relationship is type-only or metadata-only.

### source_only_metadata

Advisory metadata from PM, SOLID, module boundary, and future architecture
quality models. This category must not contain runtime hooks.

### port

A future abstraction owned by a source-only or domain layer. Ports define what a
caller needs without depending on a concrete adapter.

### adapter

A concrete implementation boundary. Adapters can be useful in future runtime
phases, but source-only modules should not depend on them directly.

### provider

Provider-adjacent dependencies. These are live-adjacent and should be forbidden
from PM and architecture source-only layers.

### runtime

Execution-capable dependencies. During the 111-120 block, runtime dependencies
remain future-gated.

### dashboard

User interface dependencies. PM and architecture layers may describe dashboard
readiness in reports, but they should not import dashboard implementations.

### script and test

Verification and smoke surfaces. They may consume metadata for validation, but
production source modules should not depend on them.

### config

Configuration-adjacent dependencies. These should remain outside source-only
PM and architecture modules.

### external_future

Future external dependency relationships that require an explicit gated phase
before implementation.

## Dependency Policies

Recommended policy values:

- `allowed`
- `allowed_type_only`
- `review_required`
- `forbidden`
- `future_gated`

Policy posture:

- `allowed`: metadata relationship is acceptable.
- `allowed_type_only`: only type-only or metadata-only references are allowed.
- `review_required`: the relationship may be reasonable but needs human review.
- `forbidden`: the dependency direction violates the source-only boundary.
- `future_gated`: the relationship is reserved for a later approved phase.

Policies are advisory in Phase 113. They do not rewrite imports or enforce CI.

## Dependency Rule Model

Future `DependencyInversionRule` metadata should include:

- rule id,
- source layer,
- target layer,
- source dependency category,
- target dependency category,
- expected abstraction category,
- allowed policies,
- rationale,
- severity when violated,
- PM escalation metadata,
- Autopilot use metadata,
- advisory/source-only boundary flags.

Example rule intents:

- `core -> provider` should be forbidden.
- `architecture -> provider` should be forbidden.
- `pm -> runtime` should be future-gated.
- `architecture -> pm` should be allowed type-only for shared evidence and
  risk vocabulary.
- concrete adapters should depend on ports, not the other way around.

## DIP Finding Model

Future `DependencyInversionFinding` metadata should include:

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
- source-only boundary flags

Findings are review metadata. They are not refactor commands, build failures,
runtime gates, approval records, or dashboard events.

## Classifier Strategy

The future classifier should classify caller-provided metadata only. It should
not inspect the repository in Phase 113I.

Recommended classifier input fields:

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

Recommended classifier output fields:

- dependency category,
- policy,
- severity,
- whether abstraction is expected,
- suggested safe abstraction,
- review notes,
- PM escalation,
- Autopilot context use,
- source-only boundary flags.

The classifier should be deterministic from provided metadata. It should not
read source files or parse import statements.

## Safety Boundaries

Phase 113 and the future 113I implementation must remain:

- report-only,
- advisory-only,
- source-only,
- metadata-only,
- no repository inspection,
- no runtime scanner,
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

## Integration With SOLID

Dependency inversion rules deepen the SOLID charter:

- DIP becomes explicit dependency direction metadata.
- OCP is supported by ports and extension boundaries.
- SRP is supported by separating contracts, adapters, providers, and runtime.
- ISP and LSP remain future contract-review concerns.

The DIP layer should not execute SOLID refactors.

## Integration With Module Boundaries

Dependency inversion rules build on Phase 112 module boundaries:

- `ModuleLayer` provides source/target layer vocabulary.
- module import policies provide the initial policy vocabulary.
- layer map metadata helps decide whether a dependency is forbidden,
  review-required, or future-gated.
- boundary findings can become DIP findings when the problem is concrete
  dependency direction rather than only layer crossing.

The DIP layer should not replace module boundaries. It should specialize them.

## PM And Autopilot Integration

DIP findings may later feed:

- PM Status Reports,
- PM risk metadata,
- PM blocker metadata,
- Next Best Action recommendations,
- Autopilot handoff context,
- validation summaries,
- phase closeout context.

This relationship is contextual. DIP findings must not trigger handoff,
validation, memory persistence, next-action coordination, closeout, approvals,
jobs, provider behavior, or refactors by themselves.

## Future 113I Scope

Recommended safe implementation scope:

- create `src/architecture/dependencyRules.ts`,
- create `src/architecture/dependencyClassifier.ts`,
- update `src/architecture/index.ts`,
- create `docs/dependency-inversion-rules.md`,
- optionally create `scripts/dependency-inversion-rules-tests.ts`.

Future 113I should define source-only types, static rule metadata, dependency
category constants, classifier helpers for caller-provided metadata, DIP
findings, summaries, and smoke tests.

Future 113I must not add repository scanning, AST parsing, import parsing,
refactor engines, runtime wiring, provider calls, dashboard mutation, OpenClaw,
WhatsApp outbound, n8n, persistence, DB/SQL, deployment, package changes, or
workflow changes.

## Verification Plan For 113I

Recommended checks:

- `git status --short --branch`,
- TypeScript check with Windows Node fallback when WSL Node is unavailable,
- targeted DIP smoke script if added,
- `git diff --check`,
- `git diff --cached --check`,
- staged file scope review,
- forbidden-pattern review over changed architecture files and docs.

## Return Path

After Phase 113I closes, the next formal target should be:

- Phase 114B - ARCHITECTURE SMELL TAXONOMY PLAN

Phase 114 should define architecture smell vocabulary using SOLID, module
boundary, and DIP metadata as input context.
