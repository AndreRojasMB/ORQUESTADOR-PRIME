# Definition Of Done Engine

Status: source-only/advisory-model

Phase 104I adds Definition of Done metadata and a pure in-memory validator for
review objects. It does not implement CI execution, test execution, command
execution, persistence, filesystem I/O, store mutation, runtime behavior,
dashboard behavior, action/job/automation behavior, connector behavior,
package changes, workflow changes, provider calls, network calls, database
schemas, SQL, deployment, release behavior, or production claims.

Definition of Done metadata does not execute tests. It does not run CI. It
does not read files. It does not create approvals. It does not write stores.
It does not implement operational gates.

## Purpose

The Definition of Done engine gives the Project Manager Agent a bounded review
model for describing completion criteria, required evidence, criterion status,
and advisory validation findings.

The model helps future reviewers explain why a phase looks complete or
incomplete without turning the review metadata into permission to run checks,
inspect files, approve work, or mutate project state.

## Source-Only Advisory Nature

The Phase 104I source lane is limited to:

- `src/pm/dodTypes.ts`,
- `src/pm/dodValidator.ts`.

These files must stay self-contained inside the PM module. They must not import
runtime, dashboard, scaffold, connector, action, job, automation, provider,
store, memory, learning, config, health, quality, eval, risk, filesystem,
network, test runner, CI, or command-execution modules.

## No CI Or Test Execution In 104I

The DoD validator checks objects already passed to it in memory. It does not
start commands, invoke test runners, trigger workflows, inspect artifacts,
read reports, or query CI systems.

Validation findings describe metadata problems only. They are not build gates,
CI gates, merge gates, release gates, approvals, or runtime controls.

## DoD Fields

A Definition of Done should describe:

- DoD id,
- schema version,
- title,
- safe summary,
- optional phase reference,
- optional task references,
- acceptance criteria,
- evidence requirements,
- blocking severity threshold,
- assumptions,
- exclusions,
- advisory/source-only boundaries.

The DoD object is metadata only. It does not contain test commands, CI commands,
scripts, executable snippets, file paths to open, dashboard links to load, or
store ids to mutate.

## Acceptance Criterion Fields

An acceptance criterion should describe:

- criterion id,
- label,
- safe summary,
- advisory status,
- whether it is required,
- severity,
- optional phase reference,
- optional task references,
- required evidence references,
- assumptions and exclusions,
- metadata-only and no-execution flags.

Criterion status is review metadata. A failed required criterion creates an
advisory validation finding; it does not execute remediation or block a system
operation by itself.

## Evidence Requirement Fields

An evidence requirement should describe:

- evidence requirement id,
- label,
- safe summary,
- whether it is required,
- accepted evidence references,
- metadata-only flags,
- no-file-read flag.

Evidence references must be metadata-only and must include `noFileRead`. The
DoD model does not read docs, source files, reports, logs, dashboard data,
store records, memory, learning data, artifacts, or CI output.

## Validation Strategy

`dodValidator.ts` validates provided objects in memory. Validation should check:

- DoD ids are present, trimmed, unique where arrays are used, and bounded,
- criterion ids are present, trimmed, unique, and bounded,
- criterion statuses are known,
- evidence requirements are metadata-only,
- evidence references are metadata-only and `noFileRead`,
- blocking severity threshold is known,
- missing required evidence creates a finding,
- failed required criteria create findings,
- forbidden private content and execution wording are rejected,
- advisory/source-only boundaries are present.

## Relationship To ProjectState

ProjectState already has `ProjectDoDRef` metadata. Phase 104I may produce DoD
objects that future phases can summarize as ProjectState references.

Phase 104I does not mutate ProjectState, write ProjectStateStore, create a
ProjectSnapshot, or create a dashboard data source.

## Relationship To TaskGraph

DoD criteria may point to task ids as metadata. This relationship is advisory.
The DoD engine does not execute tasks, schedule jobs, dispatch actions, create
approvals, or calculate runtime plans.

## Relationship To Future Risk And Blocker Model

The richer risk and blocker model is deferred to Phase 105. Phase 104I can
surface failed criteria and missing evidence as advisory findings, but it does
not resolve blockers, execute mitigations, approve work, or mutate stores.

## Relationship To Future PM Reports

Future PM reports, deferred to Phase 109, may summarize DoD validity,
criterion status, missing evidence, and advisory findings.

Phase 104I does not generate reports, persist reports, publish dashboard data,
or create artifacts.

## Safety Boundaries

Phase 104I keeps these boundaries:

- no provider calls,
- no network,
- no filesystem reads or writes from source,
- no real persistence,
- no config/store/memory/learning mutation,
- no command execution,
- no test execution,
- no CI execution,
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

Phase 104I does not:

- execute tests,
- run CI,
- execute commands,
- read files,
- write files,
- create approvals,
- write stores,
- implement operational gates,
- mutate ProjectState,
- mutate ProjectStateStore,
- inspect task graph files,
- execute tasks,
- schedule jobs,
- dispatch actions,
- implement runtime behavior,
- implement dashboard behavior,
- generate scaffolds,
- implement connectors,
- call providers,
- use the network,
- create database schemas,
- add SQL,
- change packages,
- change workflows,
- deploy,
- release,
- claim production readiness,
- claim full autonomy,
- claim security or compliance guarantees.
