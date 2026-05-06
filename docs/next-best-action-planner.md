# Next Best Action Planner

Phase: 108I-NEXT-BEST-ACTION-PLANNER

Status: source-only advisory

## Purpose

The Next Best Action Planner defines advisory metadata for choosing the safest
next Project Manager recommendation from caller-provided PM context. It helps
the PM Agent explain whether the next step should be to observe, report, plan,
propose, request clarification, request approval metadata, improve Definition
of Done metadata, review risk metadata, update ProjectState metadata, defer due
to risk, or stop due to a blocker.

This phase adds only source metadata and pure helper logic. It does not wire the
planner into runtime, actions, approvals, jobs, dashboard, Codex, OpenCode, git,
or any live execution surface.

## Source-Only Advisory Nature

Phase 108I introduces:

- `src/pm/nextBestAction.ts`,
- `src/pm/decisionRules.ts`,
- this document.

The planner accepts metadata supplied by its caller. It does not inspect the
repository, read files, write files, create stores, mutate ProjectState, create
proposals, create approvals, dispatch jobs, unlock runtime, or call external
systems.

## No Execution In 108I

The Next Best Action Planner does not execute actions. It does not create
proposals. It does not execute approvals. It does not dispatch jobs. It does
not unlock runtime. It does not create branches, commits, or PRs. It does not
call Codex/OpenCode. It only recommends advisory metadata.

## Next-Best-Action Fields

A next-best-action entry should include:

- action id,
- category,
- priority,
- status,
- label,
- safe summary,
- recommended autonomy level,
- reasons,
- evidence references,
- related phase refs,
- related task ids,
- related milestone ids,
- advisory/source-only boundaries,
- non-execution flags.

The action entry is a recommendation object. It is not an action proposal, job,
approval record, runtime command, dashboard update, git operation, or automation
request.

## Decision Rule Fields

A decision rule should include:

- rule id,
- label,
- safe summary,
- trigger category,
- output category,
- priority,
- status,
- max autonomy level,
- optional risk severities,
- optional blocker statuses,
- optional DoD statuses,
- optional approval statuses,
- metadata-only flags,
- advisory/source-only boundaries,
- no-execution flags.

Decision rules describe why a recommendation was selected. They do not enforce
policy and do not call any live system.

## Input Sources

The planner may accept metadata from:

- ProjectState summaries,
- task graph and milestone summaries,
- Definition of Done validation results,
- risk entries,
- blocker entries,
- autonomy policy decisions,
- approval gate plans,
- evidence references,
- human-supplied assumptions and exclusions.

All inputs are caller-provided metadata. Phase 108I does not read from a store,
scan source files, query a dashboard, or load runtime state.

## ProjectState Relationship

ProjectState can provide current phase, status, safe summary, and allowed
autonomy metadata. The Next Best Action Planner may recommend updating
ProjectState metadata when state is missing, stale, invalid, or incomplete.

The planner must not mutate ProjectState or call a ProjectStateStore.

## TaskGraph Relationship

Task graph and milestone metadata can help the planner identify blocked,
deferred, ready, or review-needed planning context. The planner may recommend
planning, proposing, reporting, or stopping when task metadata indicates unsafe
forward movement.

It must not schedule tasks, reorder live work, dispatch jobs, or execute task
steps.

## DoD Relationship

Failed Definition of Done validation should route recommendations toward
metadata remediation, especially `improve_dod_metadata`, `plan`, or `propose`.
Missing evidence remains a metadata issue.

The planner must not run tests, run CI, read files, or enforce operational
gates.

## Risk / Blocker Relationship

High and critical risk should prevent any execution-like recommendation and
prefer planning, proposal, risk review, or deferral metadata. Active blockers
should prefer stop, defer, report, plan, or propose categories.

The planner must not resolve blockers, mitigate risks, create proposals, create
approvals, dispatch actions, or write stores.

## Autonomy Policy Relationship

During Phase 101-120, recommendations must respect the L0-L3 cap:

- `L0_observe_only`,
- `L1_report_only`,
- `L2_plan_only`,
- `L3_propose_only`.

L4-L6 remain denied/future-gated. A passing DoD, low risk, or available approval
metadata must not lift recommendations beyond L3 in this block.

## Approval Gate Relationship

Approval-required states should recommend `request_approval_metadata`, not
approval execution. Critical risk can require dual approval metadata, but Phase
108I does not create a second approval record or call approval bridge functions.

## Future PM Reports Relationship

Phase 109 may use next-best-action output in PM status reports. Phase 108I does
not generate reports, persist reports, publish reports, or wire report output
to a dashboard.

## Safety Boundaries

Phase 108I explicitly keeps these boundaries:

- no provider calls,
- no network,
- no filesystem reads/writes from source,
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
- no package/workflow changes,
- no baseline/artifact mutation,
- no action/proposal/approval execution,
- no proposal store writes,
- no jobs execution,
- no branch creation,
- no commit creation,
- no PR creation,
- no Codex/OpenCode execution,
- no DB schemas/SQL,
- no production-ready claims,
- no fully autonomous claims,
- no self-approval claims,
- no security/compliance guarantees.

## Non-Goals

The Next Best Action Planner does not:

- execute actions,
- create proposals,
- execute approvals,
- call approval bridge functions,
- dispatch jobs,
- write proposal stores,
- write ProjectState stores,
- unlock runtime,
- implement dashboard data sources,
- create branches, commits, or PRs,
- call Codex/OpenCode,
- call providers,
- scan the repository,
- read or write files,
- mutate memory or learning stores,
- claim production readiness,
- claim full autonomy,
- claim security or compliance certification.
