# Mobile Testing Boundaries

Phase: 129B - MOBILE TESTING STRATEGY PLAN

Status: planning / safety boundaries only

## Boundary Summary

The Mobile Testing Strategy is source-only, advisory-only, and metadata-only.
It may describe future QA posture for mobile apps, but it must never run real
mobile tests or activate external systems.

## Allowed Planning Outputs

The strategy may define:

- testing categories,
- test level posture,
- smoke flow metadata,
- device matrix metadata,
- accessibility QA metadata,
- security QA metadata,
- performance QA metadata,
- offline/sync QA metadata,
- navigation QA metadata,
- auth/session QA metadata,
- release readiness QA metadata,
- risks, approvals, and limitations.

## Denied Actions

The strategy must not:

- run real app tests,
- launch virtual devices,
- perform device automation,
- generate apps,
- generate screens,
- generate routes,
- generate native files,
- run Expo/EAS commands,
- change package files,
- modify workflow or CI files,
- activate CI,
- call providers,
- call network endpoints,
- mutate dashboards,
- touch DB/SQL,
- read secrets or environment values,
- persist memory,
- perform source-control automation from source.

## Source Boundary

Phase 129I source, if added, should be pure TypeScript metadata helpers only.
Helpers should accept caller-supplied metadata and return structured planning
objects. They must not read files, scan repositories, parse ASTs, discover
imports, execute commands, call APIs, or write artifacts.

## Documentation Boundary

Documentation may mention future QA tooling as a gated concept only. It should
avoid operational steps, command strings, credentials, workflow activation,
package edits, or native configuration.

## PM Boundary

Testing metadata may feed PM status reports, DoD criteria, risk/blocker
entries, approval readiness, and phase closeout. It must not self-approve,
transition phases on its own, write memory, or create source-control records.

## SOLID Boundary

Testing metadata may feed SOLID/frontend/backend review context. It must not
perform code analysis, source scanning, import discovery, AST parsing, or
automatic refactors.

## Autopilot Boundary

Autopilot may carry this strategy as handoff and dry-run context only. It must
not execute Codex, run tools, persist memory, call providers, mutate dashboards,
or perform source-control actions from source modules.

## Release Boundary

Release readiness checks are advisory labels only. Store submission, signing,
distribution, update delivery, and Expo/EAS release actions remain future-gated
and require a separate approved phase.
