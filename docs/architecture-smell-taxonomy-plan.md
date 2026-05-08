# Architecture Smell Taxonomy Plan

Phase: 114B - ARCHITECTURE SMELL TAXONOMY PLAN

Status: planning / audit / docs-only

## Purpose

Phase 114 plans an Architecture Smell Taxonomy for the SOLID Architecture
Quality Core. The goal is to define safe review vocabulary for architectural
smells, smell severity, smell findings, and relationships to SOLID principles,
module boundaries, and Dependency Inversion Rules.

This phase is documentation only. It does not implement source code, inspect
the repository, parse source structure, rewrite modules, execute refactors,
launch processes, call providers, mutate dashboards, operate OpenClaw, send
WhatsApp messages, run n8n, persist memory, change packages or workflows,
mutate DB/SQL, deploy, or perform source-control behavior from source.

## Architecture Smell Scope

The future smell taxonomy should catalog review metadata for:

- SRP smells,
- OCP smells,
- LSP smells,
- ISP smells,
- DIP smells,
- module boundary smells,
- dependency direction smells,
- future runtime coupling smells,
- dashboard and provider leakage smells,
- automation safety smells.

The taxonomy should describe suspicious architecture pressure. It must not
detect smells by walking files or trigger fixes by itself.

## Smell Categories

Recommended smell category values:

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

### responsibility_overload

A module or layer appears to own too many reasons to change. This maps mostly
to SRP and can become a PM risk when ownership becomes unclear.

### core_infra_coupling

Core or source-only modules are coupled to infrastructure concepts. This maps
to DIP and module boundary concerns.

### provider_leakage

Provider-adjacent details appear in source-only or advisory layers. This maps
to DIP, module boundaries, and safety boundaries.

### dashboard_write_leakage

Dashboard write concerns appear in layers that should remain advisory or
read-only. This maps to boundary and execution-safety concerns.

### runtime_dependency_in_source_only

Runtime concepts appear in modules that are supposed to be source-only. This
maps to DIP, module boundary, and Autopilot safety concerns.

### ambiguous_boundary

Layer ownership or dependency direction is unclear. This maps to SRP, DIP, and
module boundary findings.

### oversized_interface

A contract is likely too broad for its consumers. This maps to ISP and future
contract review.

### contract_substitution_risk

A replacement implementation may not safely satisfy the same contract. This
maps to LSP and future contract tests.

### extension_blocked_by_core_modification

A change requires modifying core instead of extending through a contract or
port. This maps to OCP and DIP.

### hidden_side_effect

A module appears to imply writes, sends, persistence, launches, or external
effects behind an advisory API. This maps to all safety boundaries.

### approval_bypass_risk

A design could route around approval metadata, human review, or future gates.
This maps to PM, Autopilot, and governance risk.

### automation_overreach

An automation layer is shaped as if it can execute beyond its approved
autonomy. This maps to Autopilot, PM autonomy policy, and closeout review.

## Severity Model

Recommended severity values:

- `info`
- `low`
- `medium`
- `high`
- `critical`

Severity should indicate review urgency:

- `info`: useful context or documentation-quality smell.
- `low`: small design pressure with low current risk.
- `medium`: architectural drift that should be planned.
- `high`: smell that should block broadening scope until reviewed.
- `critical`: stop and request human review before implementation continues.

Severity is advisory. It does not fail builds or enforce runtime behavior in
Phase 114.

## Smell Finding Model

Future `ArchitectureSmellFinding` metadata should include:

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
- source-only boundary flags

Findings are review metadata. They are not refactor commands, runtime gates,
approval records, jobs, dashboard events, or provider actions.

## Related Finding References

Smell findings should be able to reference previous architecture findings:

- SOLID finding ids,
- module boundary finding ids,
- Dependency Inversion finding ids,
- PM risk or blocker metadata ids,
- future review checklist ids.

References should be metadata only. They should not require opening files.

## Safety Boundaries

Phase 114 and the future 114I implementation must remain:

- report-only,
- advisory-only,
- source-only,
- metadata-only,
- no repository inspection,
- no runtime scanner,
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

## Integration With SOLID

The taxonomy should connect smells to SOLID principles:

- SRP: responsibility overload and ambiguous ownership.
- OCP: extension blocked by core modification.
- LSP: contract substitution risk.
- ISP: oversized interfaces.
- DIP: core/infra coupling, provider leakage, runtime dependency pressure.

The smell layer should not execute SOLID refactors.

## Integration With Module Boundaries

Module boundary findings can inform smell findings:

- forbidden layer crossings may become boundary smells,
- future-gated dependencies may become runtime coupling smells,
- ambiguous layer ownership may become ambiguous boundary smells,
- dashboard/provider crossings may become leakage smells.

The smell layer should not replace module boundary rules.

## Integration With Dependency Inversion

DIP findings can inform smell findings:

- concrete adapter dependencies may become core/infra coupling smells,
- provider dependencies may become provider leakage smells,
- missing ports may become extension or abstraction smells,
- future runtime dependencies may become source-only boundary smells.

The smell layer should not execute dependency inversion refactors.

## PM And Autopilot Integration

Architecture smell findings may later feed:

- PM Status Reports,
- PM risk metadata,
- PM blocker metadata,
- Next Best Action recommendations,
- phase closeout summaries,
- future review checklists.

This relationship is contextual. Smell findings must not trigger handoff,
validation, memory persistence, next-action coordination, closeout, approvals,
jobs, provider behavior, or refactors by themselves.

## Future 114I Scope

Recommended safe implementation scope:

- create `src/architecture/smellTaxonomy.ts`,
- create `src/architecture/smellSeverity.ts`,
- update `src/architecture/index.ts`,
- create `docs/architecture-smell-taxonomy.md`,
- optionally create `scripts/architecture-smell-taxonomy-tests.ts`.

Future 114I should define source-only types, static smell category constants,
severity helpers, smell findings, summaries, and smoke tests.

Future 114I must not add repository inspection, syntax-tree parsing, import
parsing, refactor engines, runtime wiring, provider calls, dashboard mutation,
OpenClaw, WhatsApp outbound, n8n, persistence, DB/SQL, deployment, package
changes, or workflow changes.

## Verification Plan For 114I

Recommended checks:

- `git status --short --branch`,
- TypeScript check with Windows Node fallback when WSL Node is unavailable,
- targeted smell taxonomy smoke script if added,
- `git diff --check`,
- `git diff --cached --check`,
- staged file scope review,
- forbidden-pattern review over changed architecture files and docs.

## Return Path

After Phase 114I closes, the next formal target should be:

- Phase 115B - SOLID REVIEW CHECKLIST PLAN

Phase 115 should turn SOLID, module boundary, DIP, and smell taxonomy metadata
into a source-only review checklist.
