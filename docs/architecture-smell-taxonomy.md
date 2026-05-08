# Architecture Smell Taxonomy

Phase: 114I - ARCHITECTURE SMELL TAXONOMY IMPLEMENTATION

Status: source-only / report-only / advisory

## Purpose

The Architecture Smell Taxonomy layer defines metadata for architecture smell
review inside the SOLID Architecture Quality Core. It catalogs smell
categories, severity, findings, SOLID principle mapping, related boundary and
DIP finding references, PM escalation, and Autopilot context.

The layer does not inspect repositories, parse source imports, parse syntax
trees, rewrite modules, execute refactors, launch processes, call providers,
mutate dashboards, operate OpenClaw, send WhatsApp messages, run n8n, persist
memory, deploy, mutate DB/SQL, or perform source-control behavior from source.

## Implemented Source Files

- `src/architecture/smellTaxonomy.ts`
- `src/architecture/smellSeverity.ts`
- `src/architecture/index.ts`

## Smell Categories

Implemented category values:

- `responsibility_overload`
- `core_infra_coupling`
- `provider_leakage`
- `dashboard_write_leakage`
- `runtime_dependency_in_source_only`
- `ambiguous_boundary`
- `oversized_interface`
- `contract_substitution_risk`
- `extension_blocked_by_core_modification`
- `hidden_side_effect`
- `approval_bypass_risk`
- `automation_overreach`

Categories are review labels. They do not imply runtime behavior.

## Severity Model

Implemented severity values:

- `info`
- `low`
- `medium`
- `high`
- `critical`

Severity is advisory. It does not fail builds, enforce CI, or trigger runtime
behavior.

## Finding Model

An architecture smell finding includes:

- finding id,
- smell category,
- related SOLID principles,
- source module reference,
- affected layer,
- severity,
- description,
- evidence references,
- related module boundary finding references,
- related Dependency Inversion finding references,
- suggested action,
- risk level,
- approval metadata,
- PM escalation metadata,
- Autopilot use metadata,
- source-only boundary flags.

Findings are not refactor commands.

## Helpers

Implemented pure helpers:

- `createArchitectureSmellFinding(...)`
- `classifyArchitectureSmellSeverity(...)`
- `describeArchitectureSmellCategory(...)`
- `summarizeArchitectureSmellFindings(...)`
- `mapSmellToSolidPrinciples(...)`

Helpers operate only on caller-provided metadata and static source constants.

## Boundaries

The implementation remains:

- report-only,
- advisory-only,
- source-only,
- metadata-only,
- no repository reading,
- no scanner implementation,
- no syntax-tree parsing,
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

Architecture smells map to SOLID principles:

- SRP: responsibility overload and ambiguous ownership.
- OCP: extension blocked by core modification.
- LSP: contract substitution risk.
- ISP: oversized interface.
- DIP: core/infra coupling, provider leakage, runtime dependency pressure,
  hidden side effects, approval bypass risk, and automation overreach.

The smell layer does not execute SOLID refactors.

## Module Boundary Integration

Module boundary findings can be referenced by smell findings:

- forbidden layer crossings can become boundary smells,
- future-gated dependencies can become runtime coupling smells,
- ambiguous layer ownership can become ambiguous boundary smells,
- dashboard/provider crossings can become leakage smells.

The smell layer does not replace module boundary rules.

## DIP Integration

Dependency Inversion findings can be referenced by smell findings:

- concrete adapter dependencies can become core/infra coupling smells,
- provider dependencies can become provider leakage smells,
- missing ports can become extension or abstraction smells,
- future runtime dependencies can become source-only boundary smells.

The smell layer does not execute dependency inversion refactors.

## PM Integration

Architecture smell findings may later feed:

- PM Status Reports,
- PM risk metadata,
- PM blocker metadata,
- Next Best Action recommendations,
- phase closeout summaries.

This is context only. The smell layer does not mutate PM state or invoke PM
builders.

## Autopilot Integration

Architecture smell findings may be passed as context to future handoff,
validation, or closeout metadata.

They do not start handoff runners, validators, memory persistence,
next-action coordination, or closeout coordination.

## Limitations

Phase 114I intentionally does not include:

- repository reading,
- import parsing,
- syntax-tree parsing,
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

- Phase 115B - SOLID REVIEW CHECKLIST PLAN

Phase 115 should turn SOLID, module boundary, DIP, and smell taxonomy metadata
into a source-only review checklist.
