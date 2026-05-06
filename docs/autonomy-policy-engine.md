# Autonomy Policy Engine

Status: source-only/advisory-model

Phase 106I adds an advisory autonomy policy model, pure in-memory policy
evaluation, and pure validation helpers. It does not implement execution,
action dispatch, approval execution, job execution, runtime behavior,
dashboard behavior, connector behavior, filesystem I/O, package changes,
workflow changes, persistence, store mutation, provider calls, network calls,
database schemas, SQL, deployment, release behavior, or production claims.

The autonomy policy does not execute actions. It does not approve itself. It
does not create approvals. It does not dispatch jobs. It does not unlock
runtime execution. It does not bypass human approval. During Phase 101-120 it
caps autonomy at L0-L3.

## Purpose

The Autonomy Policy Engine gives the Project Manager Agent a bounded advisory
model for deciding which autonomy level may be described for a phase, task,
or review context.

The model helps reviewers understand how risks, blockers, and Definition of
Done status should cap autonomy. It does not enforce policy, grant
permission, resume work, approve work, run work, or connect to execution
systems.

## Source-Only Advisory Nature

The Phase 106I source lane is limited to:

- `src/pm/autonomyPolicy.ts`,
- `src/pm/autonomyPolicyValidator.ts`.

These files must stay self-contained inside the PM module. They must not
import runtime, dashboard, scaffold, connector, action, job, automation,
provider, store, memory, learning, config, health, quality, eval, risk,
filesystem, network, test runner, CI, or command-execution modules.

## No Execution In 106I

Autonomy policy helpers evaluate objects already passed to them in memory.
They do not execute commands, dispatch actions, create approvals, approve
proposals, run jobs, unlock runtime behavior, update dashboards, call
connectors, mutate stores, or persist decisions.

Policy decisions are review metadata only. They are not runtime gates,
approval records, job controls, CI gates, deployment gates, or security
controls.

## Autonomy Levels L0-L6

The PM Agent uses explicit autonomy levels:

- `L0_observe_only`: describe known metadata and evidence references.
- `L1_report_only`: summarize status, risks, blockers, and findings.
- `L2_plan_only`: organize phases, dependencies, constraints, and validation.
- `L3_propose_only`: recommend bounded next steps for human review.
- `L4_prepare_review_only`: future-gated during Phase 101-120.
- `L5_approval_gated_execution`: future-gated during Phase 101-120.
- `L6_autonomous_execution`: denied during Phase 101-120.

## Allowed 101-120 Autonomy Levels

During Phase 101-120, allowed autonomy is capped to:

- `L0_observe_only`,
- `L1_report_only`,
- `L2_plan_only`,
- `L3_propose_only`.

The cap applies even when risk is low, blockers are absent, and Definition of
Done metadata passes. Passing advisory metadata does not lift the cap.

## Denied And Future Autonomy Levels

During Phase 101-120, these levels are denied or future-gated:

- `L4_prepare_review_only`,
- `L5_approval_gated_execution`,
- `L6_autonomous_execution`.

Future review-preparation or approval-gated execution requires a separate
approved phase, approval contract, audit plan, rollback plan, and verification
strategy. Autonomous execution is not part of this PM core block.

## Risk Mapping

Risk metadata can lower the recommended autonomy level.

- Low and medium risk may allow L0-L3 within the current cap.
- High and critical risk should cap autonomy to planning and proposal only.
- Risk metadata never allows execution, approval creation, job dispatch, or
  runtime behavior.

Risk mapping consumes caller-provided metadata only. It does not inspect risk
stores, dashboards, runtime state, or repository files.

## Blocker Mapping

Blocker metadata can lower the recommended autonomy level.

- Open, active, or blocked states cap autonomy to report, plan, and propose.
- Deferred or metadata-resolved blockers remain advisory and do not unlock
  execution.
- Unknown blocker references can create advisory findings.

Blocker mapping does not resolve blockers, update tasks, schedule jobs,
dispatch actions, or create approvals.

## DoD Mapping

Definition of Done metadata can lower the recommended autonomy level.

- Failed DoD validation caps autonomy to planning and proposal only.
- Missing required evidence caps autonomy to planning and proposal only.
- Passing DoD metadata does not lift the Phase 101-120 cap above L3.

DoD mapping does not execute checks, run tests, run CI, read files, mutate
artifacts, or enforce completion gates.

## Execution Constraints

Execution constraints are metadata-only flags that describe denied behavior.
They should include:

- no execution,
- no approval execution,
- no jobs execution,
- no runtime execution,
- no dashboard execution,
- no connector execution,
- no workflow mutation,
- no filesystem mutation.

All execution constraints remain descriptive. They are not runtime enforcement
mechanisms.

## Validation Strategy

Validation should check:

- policy ids are present, trimmed, and bounded,
- autonomy levels are known,
- max autonomy during 101-120 does not exceed L3,
- L4-L6 are denied or future-gated during 101-120,
- high and critical risk cap autonomy to plan/propose only,
- active/open/blocked blockers cap autonomy to report/plan/propose,
- failed DoD caps autonomy to plan/propose only,
- execution constraints are metadata-only and all non-execution flags are true,
- private content and execution wording are rejected,
- advisory/source-only boundaries are present.

## Relationship To Risk / Blocker Model

The policy may consume risk and blocker metadata from Phase 105I. It does not
mutate risk entries, mutate blockers, execute mitigations, resolve blockers,
or create approval requirements.

## Relationship To DoD Engine

The policy may consume DoD validation status or failed criterion metadata. It
does not execute DoD checks, read files, run tests, run CI, or mutate DoD
objects.

## Relationship To Future Approval Gate Contract

The Approval Gate Contract is deferred to Phase 107. Future approval contracts
may use autonomy decisions to explain why human review is required.

Phase 106I does not create, approve, reject, resume, or execute approvals.

## Relationship To Future Next Best Action Planner

The Next Best Action Planner is deferred to Phase 108. Future planning may use
autonomy policy results to shape recommendations.

Phase 106I does not create next actions, dispatch actions, schedule jobs, or
execute recommendations.

## Safety Boundaries

Phase 106I keeps these boundaries:

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
- no self-approval claims,
- no security/compliance guarantees.

## Non-Goals

Phase 106I does not:

- execute actions,
- approve itself,
- create approvals,
- execute approvals,
- dispatch jobs,
- unlock runtime execution,
- bypass human approval,
- enforce policy,
- create runtime gates,
- mutate stores,
- persist decisions,
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
- mutate risks or blockers,
- mutate Definition of Done objects,
- create database schemas,
- add SQL,
- change packages,
- change workflows,
- deploy,
- release,
- claim production readiness,
- claim full autonomy,
- claim self-approval,
- claim security or compliance guarantees.
