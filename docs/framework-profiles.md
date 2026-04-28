# Framework Profiles

Phase: 74I
Status: source-only advisory helper

## Purpose

Framework Profiles provide bounded metadata for common frameworks, platforms,
and architecture styles used by ORQUESTADOR-PRIME planning lanes.

They describe identification signals, compatible language ids, project
structure hints, advisory command recommendations, dependency strategy,
configuration notes, architecture patterns, security notes, testing notes,
packaging notes, review heuristics, risks, assumptions, confidence, and safety
boundaries.

They do not inspect the filesystem, scan directories, execute commands, install
dependencies, call providers, use network, change packages, update workflows,
mutate stores, dispatch actions, create proposals, scaffold applications,
generate projects, modify code, claim production readiness, or guarantee
deployment outcomes.

## Supported Profiles

- ASP.NET Core
- WPF / MVVM
- WinUI
- MAUI
- Spring Boot
- FastAPI
- Django
- React
- Next.js
- Electron
- Tauri
- Qt/C++
- REST APIs
- GraphQL
- Microservices
- Modular monoliths

## Registry Shape

Each `FrameworkProfile` includes:

- `id`
- `displayName`
- `category`
- `compatibleLanguageIds`
- `ecosystemNotes`
- `detectionSignals`
- `projectStructure`
- `commandRecommendations`
- `dependencyStrategy`
- `configNotes`
- `architecturePatterns`
- `securityNotes`
- `testingNotes`
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

- return a profile by supported framework id,
- list the static profiles,
- score profiles from caller-supplied path strings.

Path scoring is metadata-only. The resolver receives strings from the caller and
does not read directories, open files, execute commands, or assert framework
certainty.

Unknown framework ids return a structured safe failure.

## Detection Signals

Signals are advisory hints such as:

- known config files,
- package names,
- source file extensions,
- common folders,
- conservative content hints.

Signals support planning and review. They do not prove framework choice,
installed tooling, runnable state, production readiness, or deployment safety.

## Compatible Language IDs

Framework profiles reference the Language Profiles from Phase 73.

Tauri is represented as compatible with JavaScript and TypeScript only in this
phase. Rust is not a supported `LanguageId` yet. Native and Rust tooling are
captured as assumptions and future language-profile notes.

## Command Recommendations

Commands are advisory strings only.

Every command recommendation must include:

- a command string,
- purpose,
- category,
- assumption,
- `advisoryOnly: true`,
- `notExecuted: true`.

The framework profile module never runs these commands.

## Dependency And Package Strategy

Dependency strategy notes describe common package managers, manifests, lockfiles,
update notes, and assumptions.

They do not install packages, rewrite lockfiles, select a package manager, or
change project configuration.

## Configuration And Environment Notes

Configuration notes call out app settings, routing modes, environment
assumptions, platform assumptions, auth boundaries, and native tooling
considerations.

These notes are planning metadata, not runtime instructions.

## Architecture Patterns

Architecture patterns describe reviewable shapes such as middleware pipelines,
MVVM separation, router/service splits, server/client boundaries, preload
bridges, resource-oriented APIs, schema-centered APIs, service boundaries, and
explicit module boundaries.

Patterns are guidance only. They do not scaffold code or generate modules.

## Security And Safety Notes

Security notes emphasize review of auth, configuration, bridge boundaries,
query complexity, local storage, platform permissions, and service boundaries.

They are checklist-style warnings, not certification claims.

## Testing Recommendations

Testing notes describe likely checks such as unit tests, integration checks,
contract checks, route checks, component tests, resolver tests, and platform
checks.

Actual commands remain advisory strings and depend on the caller's stack.

## Packaging And Deploy Notes

Packaging notes describe common artifact and distribution considerations such as
publish output, desktop signing, platform installers, mobile targets, ASGI/WSGI
hosting, executable jars, containers, and service release coordination.

They do not publish artifacts or guarantee deployment readiness.

## Review Heuristics

Review heuristics provide framework-specific checklist items for future audit,
planning, and implementation review lanes.

Examples include middleware order, route contracts, UI threading, state
management, server/client boundaries, resolver batching, bridge exposure, and
module coupling.

## Risks

Risks describe common mistakes such as auth gaps, configuration drift, framework
ambiguity, platform packaging complexity, async blocking, migration review gaps,
query complexity, distributed consistency, and boundary erosion.

## Assumptions And Confidence

Profiles use conservative confidence. A profile can identify signals, but it
cannot prove framework choice, tool installation, build success, test coverage,
deployment safety, or production readiness.

Architecture profiles such as REST APIs, GraphQL, microservices, and modular
monoliths use lower confidence because their signals are often structural and
require human context.

## Safety Boundaries

Framework Profiles are source-only and advisory.

They must not:

- call providers,
- use network,
- read files,
- write files,
- scan directories,
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
- claim production readiness,
- guarantee deployment outcomes,
- overclaim framework detection.

## Validation Rules

The validator checks:

- known framework ids,
- all supported profiles are present,
- compatible language ids exist in Language Profiles,
- required fields are populated,
- arrays and text are bounded,
- command recommendations are advisory and not executed,
- tool and framework assumptions are explicit,
- detection and deployment claims stay conservative,
- all boundaries are true,
- forbidden provider, network, filesystem, command, store, action, proposal,
  scaffold, generated-system, production, and deployment-guarantee claims are
  absent.

## Explicit Non-Goals

Phase 74I does not add:

- CLI commands,
- filesystem scanning,
- package scripts,
- dependency installation,
- workflow changes,
- runtime execution,
- project generation,
- scaffold output,
- audit integration,
- framework-specific implementation templates.

Historical notes about sample scaffolds in older roadmap docs remain historical
only. This phase does not implement scaffold support.

## Future Integration

Future phases may connect framework profiles to:

- Language Profiles,
- Estimation Planning Engine assumptions and risks,
- Module Blueprint implementation notes,
- Business Systems Catalog family planning,
- Requirements Interview Engine follow-up questions,
- code review and audit heuristics,
- safe execution planning,
- scaffold planning after explicit approval gates.

Those integrations are out of scope for Phase 74I.
