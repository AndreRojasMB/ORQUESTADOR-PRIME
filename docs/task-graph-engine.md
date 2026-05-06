# Task Graph Engine

Status: source-only/advisory-model

Phase 103I adds an advisory task graph model, pure in-memory graph validation,
advisory topological ordering, and milestone health summaries. It does not
implement persistence, filesystem I/O, store access, runtime behavior,
dashboard behavior, action/job/automation behavior, connector behavior,
package changes, workflow changes, provider calls, network calls, command
execution, database schemas, SQL, deployment, release behavior, or production
claims.

The graph does not execute tasks. The graph does not schedule jobs. The graph
does not dispatch actions. The graph does not create approvals. The graph does
not write stores. The graph is not a runtime planner.

## Purpose

The Task Graph Engine gives the Project Manager Agent a bounded planning model
for task nodes, dependencies, milestone grouping, and advisory order review.

The goal is to help reviewers see dependency structure before future phases
define richer Definition of Done, risk, blocker, reporting, or execution-gated
workflows. In Phase 103I, every output is metadata for human review.

## Source-Only Advisory Nature

The Phase 103I source lane is limited to:

- `src/pm/types.ts`,
- `src/pm/taskGraph.ts`,
- `src/pm/milestonePlanner.ts`.

These files must stay self-contained inside the PM module. They must not import
runtime, dashboard, scaffold, connector, action, job, automation, provider,
store, memory, learning, config, health, quality, eval, risk, filesystem,
network, or command-execution modules.

## No Persistence In 103I

Task graphs and milestone plans are in-memory objects passed to pure helper
functions.

Phase 103I does not add:

- file reads,
- file writes,
- JSON file creation,
- store readers,
- store writers,
- HOME data directory mutation,
- ORQUESTADOR data directory mutation,
- database tables,
- database rows,
- runtime caches,
- dashboard data adapters,
- job queues,
- action dispatch paths.

## Task Graph Concept

A task graph is advisory metadata describing tasks and relationships between
tasks. It can validate structure and return a planning order.

The planning order is not an execution order. It is a review aid for humans and
future advisory PM reports.

## Task Node Fields

A task node should describe:

- task id,
- label,
- safe summary,
- advisory status,
- priority,
- optional phase reference,
- optional milestone id,
- dependency references,
- evidence references,
- assumptions,
- exclusions,
- metadata-only and no-execution flags.

Task nodes do not run code, assign work, update stores, or create jobs.

## Task Dependency Fields

A dependency should describe:

- dependency id,
- source task id,
- target task id,
- dependency type,
- safe summary,
- metadata-only and no-execution flags.

Supported dependency types are:

- `blocks`,
- `requires`,
- `related`,
- `sequence_after`.

Dependencies must reference known task ids. Dependency metadata does not
schedule or execute anything.

## Milestone Fields

A milestone should describe:

- milestone id,
- label,
- safe summary,
- advisory status,
- optional phase reference,
- task ids,
- metadata-only and no-execution flags.

Milestones group task metadata. They do not create project records, release
gates, jobs, dashboards, or approvals.

## Topological Ordering

The task graph may return advisory `orderedTaskIds` for valid dependency
graphs. The order is only a planning sequence for review.

Related dependencies should not force ordering. Blocking, required, and
sequence-after dependencies can contribute to advisory ordering.

## Cycle Detection

The task graph validator should detect dependency cycles and return validation
findings. Cycles mean the graph cannot produce a full advisory order.

Cycle findings are metadata only. They do not repair the graph or mutate
ProjectState.

## Missing Dependency Validation

Every dependency must reference known task ids. Missing dependency targets or
sources fail validation.

The validator does not read ProjectState, scan files, or look up tasks from any
store.

## Relationship To ProjectState

ProjectState may continue to contain task summary references and milestone
references. The Task Graph Engine may produce metadata that future phases can
summarize into ProjectState-shaped references.

Phase 103I does not mutate ProjectState, write ProjectStateStore, or create a
ProjectSnapshot.

## Relationship To Future DoD Engine

The Definition of Done engine is deferred to Phase 104. Phase 103I may include
task and milestone metadata that future DoD references can point to, but it
does not run checks, enforce gates, inspect files, mutate artifacts, or execute
commands.

## Relationship To Future Risk And Blocker Model

The richer risk/blocker model is deferred to Phase 105. Phase 103I can surface
blocked task status as advisory metadata, but it does not resolve blockers,
execute mitigations, dispatch actions, approve work, or mutate stores.

## Relationship To Future PM Reports

Future PM reports may summarize task graph validity, missing dependencies,
cycle findings, advisory ordering, and milestone health.

Phase 103I does not generate reports, persist reports, publish dashboard data,
or create artifacts.

## Safety Boundaries

Phase 103I keeps these boundaries:

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

Phase 103I does not:

- execute tasks,
- schedule jobs,
- dispatch actions,
- create approvals,
- write stores,
- read stores,
- implement a runtime planner,
- implement persistence,
- call providers,
- use the network,
- execute commands,
- implement dashboard behavior,
- generate scaffolds,
- implement connectors,
- mutate ProjectState,
- create database schemas,
- add SQL,
- change packages,
- change workflows,
- deploy,
- release,
- claim production readiness,
- claim full autonomy,
- claim security or compliance guarantees.
