# Risk / Blocker Model

Status: source-only/advisory-model

Phase 105I adds advisory risk and blocker metadata, pure in-memory risk
classification helpers, pure validation helpers, and blocker rule evaluation.
It does not implement action execution, approval execution, job execution,
runtime behavior, dashboard behavior, connector behavior, filesystem I/O,
package changes, workflow changes, persistence, store mutation, provider
calls, network calls, database schemas, SQL, deployment, release behavior, or
production claims.

Risk and blocker metadata does not execute actions. It does not resolve
blockers. It does not create approvals. It does not dispatch jobs. It does not
mutate stores. It does not implement runtime gates.

## Purpose

The Risk / Blocker Model gives the Project Manager Agent a bounded vocabulary
for identifying project risks, blocked planning surfaces, evidence references,
and advisory classification results.

The model helps reviewers describe why a phase, task, milestone, or Definition
of Done item may need attention without turning that description into
mitigation, resolution, approval, scheduling, or execution behavior.

## Source-Only Advisory Nature

The Phase 105I source lane is limited to:

- `src/pm/riskModel.ts`,
- `src/pm/blockerRules.ts`.

These files must stay self-contained inside the PM module. They must not import
runtime, dashboard, scaffold, connector, action, job, automation, provider,
store, memory, learning, config, health, quality, eval, risk, filesystem,
network, test runner, CI, or command-execution modules.

## No Action, Job, Or Runtime Execution In 105I

Risk and blocker helpers validate objects already passed to them in memory.
They do not call action systems, execute proposal or approval systems, dispatch
jobs, invoke runtime behavior, run commands, inspect dashboards, call
connectors, or mutate stores.

Risk classification is advisory only. Blocker evaluation is advisory only.
Findings are review metadata, not enforcement gates.

## Risk Fields

A risk entry should describe:

- risk id,
- label,
- safe summary,
- likelihood,
- impact,
- severity,
- status,
- risk surfaces,
- optional phase refs,
- optional task refs,
- optional milestone refs,
- optional Definition of Done refs,
- evidence references,
- assumptions and exclusions,
- metadata-only and no-execution flags.

Risk entries do not execute mitigations, create approvals, update tasks,
update milestones, update DoD records, or mutate ProjectState.

## Blocker Fields

A blocker should describe:

- blocker id,
- label,
- safe summary,
- status,
- severity,
- risk surfaces,
- blocked phase refs,
- blocked task refs,
- blocked milestone refs,
- blocked Definition of Done refs,
- evidence references,
- assumptions and exclusions,
- metadata-only and no-resolution flags.

Blocker entries do not resolve blockers, schedule work, dispatch jobs, create
approvals, update stores, or activate runtime gates.

## Risk Surfaces

Risk surfaces reuse the PM foundation vocabulary, including runtime,
dashboard, scaffold, connector, credential, automation, action approvals,
jobs, CI/baseline, release, security policy, package/workflow, database
schema, deployment, provider, memory/learning, store, and unknown.

Surface values are metadata only. They do not import or inspect those
surfaces.

## Likelihood, Impact, And Severity

Likelihood should stay bounded:

- `rare`,
- `possible`,
- `likely`,
- `near_certain`.

Impact and severity should stay bounded:

- `low`,
- `medium`,
- `high`,
- `critical`.

Severity can be provided explicitly or derived by a pure advisory classifier
from likelihood and impact. The classifier does not execute mitigation,
approve work, or block runtime behavior.

## Blocker Evaluation

Blocker evaluation may compare blocker references against caller-provided
known task and milestone ids. Missing references can produce advisory findings.

If no known set is provided, evaluation should avoid pretending to inspect a
task graph or milestone plan. The model does not read files, scan the repo,
load stores, or query runtime state.

## Validation Strategy

Validation checks should include:

- risk ids are present, trimmed, unique, and bounded,
- blocker ids are present, trimmed, unique, and bounded,
- risk surfaces are known,
- likelihood, impact, severity, and status values are known,
- blocker statuses are known,
- task, milestone, and DoD refs are metadata-only strings,
- evidence references are metadata-only and `noFileRead`,
- private content and execution wording are rejected,
- advisory/source-only boundaries are present.

## Relationship To ProjectState

ProjectState already has `ProjectRiskRef` and `ProjectBlockerRef` metadata.
Phase 105I may produce risk and blocker objects that future phases can
summarize into those references.

Phase 105I does not mutate ProjectState, write ProjectStateStore, create a
ProjectSnapshot, or create a dashboard data source.

## Relationship To TaskGraph

Risks and blockers may reference task ids as metadata. They may also advise
that a task appears blocked. They do not mutate task status, rebuild task
graphs, execute tasks, schedule jobs, or dispatch actions.

## Relationship To DoD

Risks and blockers may reference Definition of Done ids or criterion ids as
metadata. Missing evidence or failed criteria can be described as risk
context, but Phase 105I does not mutate DoD objects, execute checks, or enforce
completion gates.

## Relationship To Future Autonomy Policy Engine

The Autonomy Policy Engine is deferred to Phase 106. Future autonomy policy
may consume risk and blocker metadata to advise autonomy limits.

Phase 105I does not enforce autonomy, enable approval-gated execution, or
grant autonomous behavior.

## Relationship To Future Approval Gate Contract

The Approval Gate Contract is deferred to Phase 107. Future approval planning
may consume risk and blocker metadata to explain why human review is required.

Phase 105I does not create, approve, reject, resume, or execute approvals.

## Relationship To Future PM Reports

Future PM reports may summarize risk severity, active blockers, unknown
references, and advisory findings.

Phase 105I does not generate reports, persist reports, publish dashboard data,
or create artifacts.

## Safety Boundaries

Phase 105I keeps these boundaries:

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

Phase 105I does not:

- execute actions,
- resolve blockers,
- execute mitigations,
- create approvals,
- dispatch jobs,
- mutate stores,
- implement runtime gates,
- read files,
- write files,
- use the network,
- call providers,
- execute commands,
- run tests,
- run CI,
- implement dashboard behavior,
- generate scaffolds,
- implement connectors,
- mutate ProjectState,
- mutate TaskGraph,
- mutate milestones,
- mutate Definition of Done objects,
- create database schemas,
- add SQL,
- change packages,
- change workflows,
- deploy,
- release,
- claim production readiness,
- claim full autonomy,
- claim security or compliance guarantees.
