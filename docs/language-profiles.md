# Language Profiles

Phase: 73I
Status: source-only advisory helper

## Purpose

Language Profiles provide bounded metadata for common programming and data
languages used by ORQUESTADOR-PRIME planning lanes.

The profiles describe detection signals, common project structure, advisory
command recommendations, dependency strategy, static checks, safe execution
notes, packaging notes, review heuristics, risks, assumptions, confidence, and
safety boundaries.

They do not inspect the filesystem, execute commands, install dependencies,
call providers, use network, change packages, update workflows, mutate stores,
dispatch actions, create proposals, scaffold applications, generate projects, or
modify code.

## Supported Languages

- Python
- C#
- Java
- Kotlin
- JavaScript
- TypeScript
- C++
- SQL
- Bash
- PowerShell
- Go

## Registry Shape

Each `LanguageProfile` includes:

- `id`
- `displayName`
- `ecosystemNotes`
- `detectionSignals`
- `projectStructure`
- `commandRecommendations`
- `dependencyStrategy`
- `staticChecks`
- `safeExecutionNotes`
- `packagingNotes`
- `reviewHeuristics`
- `risks`
- `assumptions`
- `confidence`
- `advisoryOnly`
- `boundaries`

Profiles are static source metadata. They are not generated from live project
inspection.

## Resolver Behavior

The resolver can:

- return a profile by supported language id,
- list the static profiles,
- score profiles from caller-supplied path strings.

Path scoring is metadata-only. The resolver receives strings from the caller and
does not read directories, open files, or infer framework certainty.

Unknown language ids return a structured safe failure.

## Detection Signals

Signals are advisory hints such as:

- known manifest files,
- source file extensions,
- common folders,
- conservative content hints.

Signals support planning and review. They do not prove framework choice,
production readiness, installed tooling, or runnable state.

## Command Recommendations

Commands are advisory strings only.

Every command recommendation must include:

- a command string,
- purpose,
- category,
- assumption,
- `advisoryOnly: true`,
- `notExecuted: true`.

The language profile module never runs these commands.

## Dependency Strategy

Dependency strategy notes describe common manifest files, lockfiles, package
managers, update notes, and assumptions.

They do not install packages, rewrite lockfiles, or select a package manager for
a project.

## Static Checks And Lint

Static checks describe common tools or project scripts that may exist. Tool
availability is always an assumption until a separate inspection phase confirms
it.

## Safe Execution Notes

Safe execution notes emphasize review before running shell scripts, package
scripts, native builds, database migrations, or platform-specific tooling.

They are warnings, not execution plans.

## Packaging And Deploy Notes

Packaging notes describe common artifact styles and deployment assumptions.
They do not create deployment plans, publish artifacts, or claim production
readiness.

## Review Heuristics

Review heuristics provide language-specific checklist items for future audit,
planning, and implementation review lanes.

## Risks

Risks describe common mistakes such as environment drift, package manager
confusion, dynamic typing gaps, native build complexity, SQL migration risk, and
shell automation hazards.

## Assumptions And Confidence

Profiles use conservative confidence. A profile can identify language signals,
but it cannot prove tool installation, framework choice, build success, test
coverage, deployment safety, or production readiness.

## Safety Boundaries

Language Profiles are source-only and advisory.

They must not:

- call providers,
- use network,
- read files,
- write files,
- execute commands,
- install dependencies,
- change package manifests,
- change lockfiles,
- change workflows or CI,
- mutate stores,
- dispatch actions,
- create proposals,
- scaffold applications,
- generate systems,
- modify code,
- claim production readiness.

## Validation Rules

The validator checks:

- known language ids,
- all supported profiles are present,
- required fields are populated,
- arrays and text are bounded,
- command recommendations are advisory and not executed,
- tool assumptions are explicit,
- framework and deployment claims stay conservative,
- all boundaries are true,
- forbidden provider, network, filesystem, command, store, action, proposal,
  scaffold, generated-system, and production claims are absent.

## Explicit Non-Goals

Phase 73I does not add:

- CLI commands,
- filesystem scanning,
- package scripts,
- dependency installation,
- workflow changes,
- runtime execution,
- project generation,
- scaffold output,
- audit integration,
- framework profiles.

## Future Integration

Future phases may connect language profiles to:

- Estimation Planning Engine assumptions and risks,
- Framework Profiles,
- Module Blueprint implementation notes,
- code review and audit heuristics,
- safe execution planning,
- scaffold planning after explicit approval gates.

Those integrations are out of scope for Phase 73I.
