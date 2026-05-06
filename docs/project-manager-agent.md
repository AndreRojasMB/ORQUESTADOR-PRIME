# Project Manager Agent

Status: source-only/advisory-foundation

The Project Manager Agent is a future coordination layer for
ORQUESTADOR-PRIME. During Phase 101-120, it is advisory and source-only. It
does not execute work, persist state, read files, write files, call providers,
use the network, execute commands, implement dashboard views, generate
scaffolds, execute connectors, dispatch actions, approve proposals, run jobs,
or run automation.

It does not make the system production ready, release ready, fully autonomous,
or security/compliance certified.

## Purpose

The PM Agent exists to give ORQUESTADOR-PRIME a safe planning vocabulary for
project coordination. It should help future reviewers describe phases, tasks,
risks, blockers, evidence, approval needs, and Definition of Done expectations
without treating those descriptions as permission to execute.

Phase 101I only establishes static TypeScript types and hard safety boundary
constants. It does not add a CLI, runtime, store, dashboard, provider bridge,
automation bridge, connector bridge, or action bridge.

## PM Agent Role

The PM Agent should eventually help with:

- summarizing project state,
- describing current and next phases,
- identifying blockers,
- naming risk surfaces,
- preparing advisory phase plans,
- proposing next steps for human review,
- tracking future Definition of Done vocabulary,
- describing approval requirements before risky work.

All outputs remain advisory. Human review remains the boundary between a plan
and implementation.

## Autonomy Levels

The PM Agent uses explicit autonomy levels:

- `L0_observe_only`: may describe known context and evidence references.
- `L1_report_only`: may summarize status, blockers, and risks.
- `L2_plan_only`: may organize phases, dependencies, and validation plans.
- `L3_propose_only`: may recommend bounded next actions for review.
- `L4_prepare_review_only`: future-gated; must not be enabled in Phase 101-120.
- `L5_approval_gated_execution`: future-gated; must not be enabled in Phase 101-120.
- `L6_autonomous_execution`: prohibited for the PM foundation.

## Current Allowed Levels During 101-120

Allowed:

- observe,
- report,
- plan,
- propose.

The current PM foundation is capped at:

- `L0_observe_only`,
- `L1_report_only`,
- `L2_plan_only`,
- `L3_propose_only`.

These levels are descriptive and advisory. They do not permit execution,
persistence, provider calls, filesystem I/O, network calls, command execution,
dashboard implementation, scaffold generation, connector implementation,
action/proposal/approval execution, jobs execution, or automation execution.

## Denied And Future Levels

Denied during Phase 101-120:

- `L4_prepare_review_only`,
- `L5_approval_gated_execution`,
- `L6_autonomous_execution`.

Future review-preparation or approval-gated execution would require separate
approved phases, import boundaries, persistence policy, approval policy,
rollback policy, audit strategy, verification strategy, and human review.

Autonomous execution is not part of this foundation.

## Boundaries

The PM Agent foundation must keep these boundaries:

- advisory only,
- source only,
- no provider calls,
- no network,
- no filesystem reads,
- no filesystem writes,
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
- no persistence,
- no CI changes,
- no database schemas,
- no SQL,
- no production-readiness claims,
- no fully-autonomous claims,
- no security/compliance guarantees.

## Future ProjectState

A future `ProjectState` model may describe:

- project id,
- phase references,
- current status,
- blockers,
- evidence references,
- assumptions,
- exclusions,
- risk surfaces,
- recommended next steps.

In the current block, this remains metadata only. It must not read stores,
write stores, scan repositories, persist state, or become a dashboard data
source.

## Future Task Graph

A future task graph may describe:

- task ids,
- dependencies,
- sequencing,
- owner role labels,
- review gates,
- blockers,
- validation expectations.

The task graph must remain advisory until a later approved phase defines safe
persistence, audit, approval, and rollback behavior.

## Future Definition Of Done

A future Definition of Done model may describe:

- required docs,
- source boundaries,
- validation commands,
- smoke checks,
- forbidden grep checks,
- review notes,
- rollback expectations.

Definition of Done metadata must not execute checks by itself. It should help
humans and future tooling review whether a phase is complete.

## Future Risk And Blocker Model

The PM Agent may use risk surfaces such as runtime, dashboard, scaffold,
connector, credential, automation, action approvals, jobs, CI/baseline,
release, security policy, package/workflow, database schema, deployment,
provider, memory/learning, store, and unknown.

Risk and blocker entries are planning metadata. They do not enforce
permissions, execute mitigations, mutate stores, or approve work.

## Future Approval Plan

A future approval plan may describe:

- approval reason,
- required reviewer role,
- evidence references,
- risk tier,
- rollback expectation,
- expiration expectation,
- denied behavior.

Approval plans are not approval records. They must not approve, reject, resume,
dispatch, execute, or mutate action/proposal/approval systems.

## Future SOLID Integration

The PM Agent should integrate with SOLID foundations through small,
single-purpose models and explicit dependency boundaries.

Future PM modules should avoid importing live-adjacent surfaces. Interfaces
should separate project vocabulary, risk vocabulary, evidence references,
approval planning, and validation metadata.

## Future Runtime, Dashboard, Scaffold, And CI Integration

Future integrations must remain gated:

- runtime integration requires auth, roles, audit, backup, locks, and rollback
  policy,
- dashboard integration requires write-path isolation, redaction, auth/roles,
  and manifest-backed data,
- scaffold integration requires generated-file manifest policy, write approval,
  overwrite policy, and rollback,
- CI integration requires warning-mode contracts before blocking behavior.

None of those integrations are implemented in Phase 101I.

## Non-Goals

Phase 101I does not:

- implement execution,
- implement persistence,
- read files from source,
- write files from source,
- call providers,
- use the network,
- execute commands,
- implement dashboard behavior,
- generate scaffolds,
- implement connectors,
- implement credentials or vaults,
- dispatch actions,
- create proposals,
- approve or reject approvals,
- run jobs,
- run automation,
- modify package files,
- modify workflows,
- create baselines,
- mutate artifacts,
- create database schemas,
- add SQL,
- deploy,
- release,
- claim production readiness,
- claim full autonomy,
- claim security or compliance guarantees.
