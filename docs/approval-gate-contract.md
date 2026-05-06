# Approval Gate Contract

Status: source-only/advisory-model

Phase 107I adds an advisory approval gate contract, approval requirement
metadata, approval plan metadata, dual approval metadata, and pure
validation/planning helpers. It does not implement real approval creation,
approval execution, action dispatch, proposal store writes, job execution,
runtime behavior, dashboard behavior, connector behavior, filesystem I/O,
package changes, workflow changes, persistence, store mutation, provider
calls, network calls, database schemas, SQL, deployment, release behavior, or
production claims.

The approval gate contract does not create approvals. It does not execute
approvals. It does not call `approveProposal` or `rejectProposal`. It does not
dispatch actions. It does not write proposal stores. It does not unlock
runtime execution. It does not allow self-approval. Critical risk requires
dual approval metadata only, not real second approval persistence.

## Purpose

The Approval Gate Contract gives the Project Manager Agent a bounded advisory
model for describing when human review, maintainer review, security review,
dual approval, release review, or future execution-gate metadata is required.

The contract helps reviewers understand approval expectations before future
execution-capable phases. It does not create an approval record, update a
proposal store, approve a proposal, reject a proposal, consume a second
approval, dispatch an action, or enforce a runtime gate.

## Source-Only Advisory Nature

The Phase 107I source lane is limited to:

- `src/pm/approvalTypes.ts`,
- `src/pm/approvalPlanner.ts`.

These files must stay self-contained inside the PM module. They must not import
runtime, dashboard, scaffold, connector, action, job, automation, provider,
store, memory, learning, config, health, quality, eval, risk, filesystem,
network, test runner, CI, or command-execution modules.

## No Approval Execution In 107I

Approval planning helpers validate objects already passed to them in memory.
They do not call approval bridges, proposal stores, second approval stores,
dispatch bridges, action stores, channel audit stores, runtime gates, jobs,
connectors, or providers.

Approval plans are review metadata only. They are not approval records,
proposal records, channel permissions, dispatch permissions, second approval
grants, job controls, CI gates, deployment gates, or runtime controls.

## Approval Requirement Fields

An approval requirement should describe:

- requirement id,
- gate type,
- status,
- risk level,
- reviewer role,
- subject summary,
- evidence requirements,
- optional dual approval metadata,
- self-approval prohibition,
- metadata-only and no-execution flags.

Requirement metadata does not approve work, reject work, request review from a
store, or transition proposal status.

## Approval Plan Fields

An approval plan should describe:

- approval plan id,
- schema version,
- label,
- safe summary,
- phase reference,
- requirement list,
- risk level,
- related risk/blocker/DoD/autonomy metadata,
- assumptions and exclusions,
- advisory/source-only boundaries.

The plan can explain what kind of approval metadata is required. It cannot
create, persist, grant, consume, revoke, or execute approvals.

## Approval Status Vocabulary

Approval status values are metadata only:

- `not_required`,
- `required`,
- `pending_metadata`,
- `ready_for_human_review`,
- `blocked`,
- `future_only`,
- `invalid`.

These statuses do not correspond to action proposal status transitions.

## Risk-Based Approval Mapping

Risk mapping should stay conservative:

- low risk may need no approval metadata or a single human review note,
- medium risk may need human review metadata,
- high risk requires approval metadata,
- critical risk requires dual approval metadata.

Risk mapping does not inspect risk stores, classify actions, write proposals,
or create approval records.

## Dual Approval Metadata

Dual approval metadata describes a second reviewer requirement, including
reviewer role, independence expectation, and evidence references.

It does not grant a second approval, write a second approval store, consume a
second approval, compare proposal parameter hashes, or persist authorization.

## Relationship To Autonomy Policy

Autonomy policy results may indicate that L4-L6 are future-gated or that human
review is required. Approval plans can describe review metadata needed for
future phases, but they do not lift autonomy caps, enable approval-gated
execution, or grant autonomous behavior.

## Relationship To Risk / Blocker Model

Risk and blocker metadata may drive approval requirements. High or critical
risk, active blockers, and unknown references can produce advisory approval
findings.

The approval contract does not execute mitigations, resolve blockers, mutate
risks, or mutate stores.

## Relationship To DoD

Failed DoD validation or missing required evidence may require approval-review
metadata before future next-action planning.

The approval contract does not execute DoD checks, read files, run tests, run
CI, mutate artifacts, or enforce completion gates.

## Relationship To Future Next Best Action Planner

The Next Best Action Planner is deferred to Phase 108. Future planning may use
approval metadata to explain whether a proposed next action requires review.

Phase 107I does not create next actions, dispatch actions, schedule jobs, or
execute recommendations.

## Relationship To Existing Actions, Proposals, And Approvals

The existing `src/actions/*` layer includes real proposal store I/O, approval
bridge functions, dispatch wrappers, channel audit writes, and second approval
persistence.

Phase 107I does not import, call, wrap, or modify that layer. Future
integration must be separately approved and must preserve default-deny action
safety, second approval safeguards, audit boundaries, and human review.

## Safety Boundaries

Phase 107I keeps these boundaries:

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
- no proposal store writes,
- no jobs execution,
- no database schemas,
- no SQL,
- no production-readiness claims,
- no fully-autonomous claims,
- no self-approval claims,
- no security/compliance guarantees.

## Non-Goals

Phase 107I does not:

- create approvals,
- execute approvals,
- call `approveProposal`,
- call `rejectProposal`,
- call `dispatchAction`,
- create action proposals,
- execute proposals,
- execute actions,
- grant second approvals,
- consume second approvals,
- write proposal stores,
- write approval stores,
- write audit stores,
- dispatch jobs,
- unlock runtime execution,
- allow self-approval,
- enforce approval gates,
- mutate ProjectState,
- mutate risks or blockers,
- mutate Definition of Done objects,
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
