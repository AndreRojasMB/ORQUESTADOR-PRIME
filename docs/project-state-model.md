# Project State Model

Status: source-only/advisory-model

Phase 102I adds ProjectState metadata, a ProjectStateStore contract, and a
pure validator for in-memory objects. It does not implement persistence,
filesystem I/O, store access, JSON storage, database storage, runtime behavior,
dashboard behavior, action/job/automation behavior, connector behavior,
package changes, workflow changes, provider calls, network calls, command
execution, deployment, release behavior, or production claims.

No files are created by the ProjectState source. No JSON store is created. No
database rows are created. No dashboard data source is created. No runtime
monitor is created. No persistence is implemented.

## Purpose

ProjectState gives the Project Manager Agent a bounded vocabulary for
describing the current project planning state. The model is review metadata,
not operational state.

The goal is to help future reviewers describe project identity, current phase,
roadmap references, milestones, task summaries, evidence, decisions, risks,
blockers, Definition of Done references, and next-step recommendations without
turning those descriptions into execution.

## Source-Only Advisory Nature

The Phase 102I source lane is limited to:

- `src/pm/types.ts`,
- `src/pm/projectStateStore.ts`,
- `src/pm/projectStateValidator.ts`.

These files must stay self-contained inside the PM module. They must not import
runtime, dashboard, scaffold, connector, action, job, automation, provider,
store, memory, learning, config, health, quality, eval, risk, filesystem,
network, or command-execution modules.

## No Persistence In 102I

ProjectStateStore is a contract only. It is not a real store.

Phase 102I does not add:

- file reads,
- file writes,
- JSON file creation,
- HOME data directory mutation,
- ORQUESTADOR data directory mutation,
- database tables,
- database rows,
- in-memory mutable maps,
- runtime caches,
- dashboard data adapters,
- store readers,
- store writers.

Any future persistence adapter requires a separate approved phase with storage
policy, privacy review, redaction, rollback, audit, and verification.

## ProjectState Fields

A ProjectState should describe:

- `projectId`,
- `schemaVersion`,
- `name`,
- `safeSummary`,
- `currentPhaseRef`,
- advisory status,
- allowed autonomy levels,
- roadmap references,
- milestone references,
- task summary references,
- decision references,
- risk references,
- blocker references,
- Definition of Done references,
- evidence references,
- recommended next steps,
- assumptions,
- exclusions,
- advisory/source-only boundaries.

All references are metadata only. References are not paths to open, commands to
run, store ids to load, or approvals to execute.

## ProjectSnapshot Concept

A ProjectSnapshot is an advisory wrapper around a provided ProjectState object
and its validation result. It can describe a candidate point-in-time summary for
human review.

The snapshot model does not create snapshot files, write artifacts, mutate
stores, query runtime, or publish dashboard data.

## Store Contract Versus Real Store

`projectStateStore.ts` defines a future adapter contract so later phases can
discuss how ProjectState might be accepted, returned, validated, or summarized.

The contract has no implementation. It does not include a class, persistence
adapter, file path, environment lookup, database adapter, JSON reader, JSON
writer, dashboard bridge, runtime bridge, action bridge, or job bridge.

## Validation Strategy

`projectStateValidator.ts` validates objects already passed to it in memory.
It does not read files, scan repositories, load stores, call providers, use the
network, execute commands, or inspect runtime state.

Validation checks should include:

- `schemaVersion` is `1.0`,
- `projectId` exists, is trimmed, bounded, and not path-like,
- `name`, `safeSummary`, and phase refs are bounded,
- arrays stay bounded,
- statuses are known,
- autonomy is capped to observe/report/plan/propose during Phase 101-120,
- evidence references are metadata-only and `noFileRead`,
- project references remain metadata-only,
- all boundaries are present and true,
- content avoids secrets, raw prompts, raw provider output, live-adjacent
  implementation references, and execution wording.

## Relationship To Future Task Graph

ProjectState may include task summary references only.

The full task graph is deferred to Phase 103. Phase 102I must not model task
execution, scheduling, assignment automation, dependency execution, or job
dispatch.

## Relationship To Future Definition Of Done Engine

ProjectState may include Definition of Done references only.

The full Definition of Done engine is deferred to Phase 104. Phase 102I must
not execute checks, run commands, inspect files, mutate artifacts, or enforce
completion gates.

## Relationship To Future Risk And Blocker Model

ProjectState may include risk and blocker references only.

The richer risk/blocker model is deferred to Phase 105. Phase 102I must not
execute mitigations, resolve blockers, mutate stores, approve work, or dispatch
actions.

## Relationship To Future PM Reports

ProjectState can become input vocabulary for future PM advisory reports.

PM reports remain future-only in Phase 102I. A later phase must define report
shape, redaction rules, evidence bounds, and verification before any report
generation or persistence exists.

## Safety Boundaries

Phase 102I keeps these boundaries:

- no provider calls,
- no network,
- no filesystem reads or writes from source,
- no real persistence,
- no config/store/memory/learning mutation,
- no command execution,
- no runtime execution,
- no dashboard implementation,
- no scaffold generation,
- no connector implementation,
- no credential/vault implementation,
- no package or workflow changes,
- no baseline or artifact mutation,
- no action/proposal/approval execution,
- no jobs execution,
- no database schemas,
- no SQL,
- no production-readiness claims,
- no fully-autonomous claims,
- no security/compliance guarantees.

## Non-Goals

Phase 102I does not:

- create files from ProjectState source,
- create a JSON store,
- create database rows,
- implement a dashboard data source,
- implement a runtime monitor,
- implement persistence,
- read ORQUESTADOR stores,
- write ORQUESTADOR stores,
- read memory or learning data,
- mutate memory or learning data,
- call providers,
- use the network,
- execute commands,
- implement runtime behavior,
- implement action/job/automation behavior,
- implement connector behavior,
- generate scaffolds,
- change packages,
- change workflows,
- deploy,
- release,
- claim production readiness,
- claim full autonomy,
- claim security or compliance guarantees.
