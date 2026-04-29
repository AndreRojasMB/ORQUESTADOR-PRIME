# Runtime Readiness Validator

Status: source-only advisory metadata

Phase 90I adds static, pure, source-only runtime readiness metadata and
validation. It does not add a CLI, runtime server, API, worker, queue,
scheduler, database adapter, migration apply path, backup/restore behavior,
repair mode, auth/rate-limit enforcement, dashboard behavior, automation
execution, connector behavior, or job/action/proposal/approval execution.

It does not import or wrap runtime doctor, config doctor, health modules, lock
manager, migration planner, jobs, actions, dashboard, providers, stores,
automation, connectors, memory, learning, quality, eval, or risk modules.

It does not call providers, use the network, read files, write files, scan the
repository, execute commands, mutate stores, change workflows, change package
scripts, create baselines, create artifacts, create branches, create tags,
create releases, or make ORQUESTADOR-PRIME production-ready.

## Purpose

Runtime Readiness Validator gives ORQUESTADOR-PRIME a bounded way to describe
runtime maturity without touching runtime behavior.

The metadata records where runtime surfaces currently stand: documented future
work, read-only diagnostics, dry-run planning, live-adjacent guarded surfaces,
or deferred execution. The validator checks that those records stay advisory,
bounded, and non-operational.

This is source-only advisory metadata. It is not a runtime monitor, runtime
doctor wrapper, repository scanner, dashboard data source, CI gate, or
execution approval.

## Source Scope

The Phase 90I source lane lives under:

- `src/runtime/readiness/types.ts`
- `src/runtime/readiness/runtimeReadinessTemplates.ts`
- `src/runtime/readiness/runtimeReadinessValidator.ts`
- `src/runtime/readiness/runtimeReadinessBuilder.ts`

The module is self-contained. It must not import runtime doctor, health,
locks, migrations, jobs, actions, automation, dashboard, connectors, providers,
memory, learning, quality, eval, risk, filesystem, network, or
command-execution modules.

## Runtime Readiness Model

Each readiness check describes:

- check id,
- category,
- name,
- summary,
- readiness level,
- risk tier,
- current status,
- evidence references,
- preconditions,
- blockers,
- recommendations,
- assumptions,
- exclusions,
- `advisoryOnly: true`,
- full safety boundaries.

Evidence references are strings only. They may point to docs or source surfaces
for human review, but this module does not read those paths.

## Readiness Levels

Supported readiness levels:

- `not_implemented`
- `docs_only_spec`
- `source_only_advisory`
- `local_read_only_diagnostic`
- `local_dry_run_planning`
- `live_adjacent_guarded`
- `deferred_until_prerequisites`
- `future_gated_execution`

These labels are descriptive. They do not grant permission to execute, mutate,
deploy, run runtime behavior, or wire operator controls.

## Risk Tiers

Supported risk tiers:

- `low`
- `medium`
- `high`
- `critical`

Risk tiers are review metadata. They are not access controls and do not enforce
permissions.

## Evidence References

Evidence references include an id, label, reference string, reference type, and
safe summary.

Evidence references must remain:

- metadata-only,
- bounded,
- redaction-aware,
- non-executable,
- free of raw secrets,
- free of raw prompts,
- free of raw provider output,
- free of file content.

The runtime readiness module never treats an evidence reference as a file path
to open.

## Preconditions And Blockers

Preconditions and blockers are planning metadata. They document what must exist
before a runtime surface can mature.

They must not:

- start a server,
- create workers,
- enqueue jobs,
- dispatch actions,
- approve proposals,
- apply migrations,
- create backups,
- run repairs,
- enforce auth or rate limits,
- update stores,
- modify CI,
- update package scripts.

## Recommendations

Recommendations are metadata only. They are not scripts, commands, workflow
steps, action proposals, approvals, jobs, automation runs, runtime calls, or
release steps.

## Static Templates

`runtimeReadinessTemplates.ts` contains a curated static registry for:

- runtime API/server readiness,
- worker readiness,
- queue readiness,
- scheduler readiness,
- store adapter readiness,
- SQLite/Postgres strategy readiness,
- migration apply readiness,
- backup/restore readiness,
- repair mode readiness,
- auth/rate-limit readiness,
- observability readiness,
- retention/forget readiness,
- approval/action safety integration readiness,
- automation runtime dependency readiness,
- dashboard/control-center runtime visibility readiness,
- deployment/productization readiness.

The registry is not generated from the repository. It does not scan files or
calculate live status.

## Builder / Resolver

`runtimeReadinessBuilder.ts` provides pure helpers to:

- get one static runtime readiness check template,
- list runtime readiness check templates,
- build a runtime readiness profile from caller-supplied check ids and bounded
  metadata.

The builder accepts caller-supplied metadata only. It does not inspect the
workspace, call providers, access the network, execute commands, read stores,
write artifacts, or import runtime-adjacent modules.

Unknown check ids fail safely with a structured result.

## Validator

`runtimeReadinessValidator.ts` validates:

- known check ids,
- known categories,
- known readiness levels,
- known risk tiers,
- required fields,
- bounded arrays and text,
- unique evidence/precondition/blocker/recommendation ids,
- `advisoryOnly: true`,
- every safety boundary set to true,
- evidence references as metadata only,
- blockers and preconditions as metadata only,
- recommendations as metadata only,
- no executable behavior wording,
- no production-ready claims,
- no security, compliance, or certification guarantees.

Validation is local and pure. It is not a CI gate unless a later phase
explicitly designs one.

## Check Coverage

Initial check coverage:

| Check | Current readiness | Risk | Notes |
|---|---|---:|---|
| runtime API/server | `docs_only_spec` | high | No production API/server. |
| worker | `docs_only_spec` | high | No durable worker daemon. |
| queue | `live_adjacent_guarded` | high | Local job helpers exist, no queue backend. |
| scheduler | `live_adjacent_guarded` | high | Manual due-job runner exists, no daemon controls. |
| store adapter | `docs_only_spec` | high | JSON/local stores remain in use. |
| SQLite/Postgres strategy | `docs_only_spec` | high | Deferred storage candidates. |
| migration apply | `local_dry_run_planning` | high | Dry-run planner only. |
| backup/restore | `docs_only_spec` | critical | Not implemented. |
| repair mode | `docs_only_spec` | critical | Not implemented. |
| auth/rate-limit | `docs_only_spec` | critical | Not implemented. |
| observability | `local_read_only_diagnostic` | medium | Doctor summaries exist; production runtime logs do not. |
| retention/forget | `docs_only_spec` | high | Not implemented. |
| approval/action integration | `live_adjacent_guarded` | critical | Approval/dispatch paths exist, no runtime boundary. |
| automation dependency | `docs_only_spec` | high | Automation remains validation/dry-run only. |
| dashboard runtime visibility | `docs_only_spec` | high | Manifest policy only. |
| deployment/productization | `docs_only_spec` | critical | Deferred. |

## Integration With Readiness / Maturity Metadata

The existing readiness metadata lane gives a broad system maturity map. Runtime
readiness metadata provides a more detailed advisory profile for the runtime
lane.

It does not replace the broad readiness lane and does not approve runtime
implementation.

## Future Read-Only Dashboard Visibility

Runtime readiness outputs may later be exposed through the
[Control Center Readonly Manifest](control-center-readonly-manifest.md) as
read-only metadata summaries.

They must not become direct dashboard store reads, live runtime probes,
operator controls, config mutations, server actions, or dashboard data-source
imports.

## Release / Productization Use

Future release readiness may reference runtime readiness metadata as
non-blocking review evidence. The metadata does not create release gates, tags,
packages, deployment bundles, license policy, security policy, or production
status.

## Safety Boundaries

Phase 90I explicitly preserves:

- no provider calls,
- no network,
- no filesystem reads from source,
- no filesystem writes from source,
- no repository scanning,
- no command execution,
- no runtime execution,
- no server/API implementation,
- no worker implementation,
- no queue implementation,
- no scheduler implementation,
- no DB adapter implementation,
- no migration apply,
- no backup/restore execution,
- no repair execution,
- no auth/rate-limit implementation,
- no dashboard implementation,
- no automation execution,
- no connector implementation,
- no credential/vault implementation,
- no CI/workflow changes,
- no package/script changes,
- no baseline/artifact mutation,
- no store/memory/learning mutation,
- no action dispatch,
- no proposal/approval execution,
- no jobs execution,
- no scaffold generation,
- no DB schemas,
- no SQL,
- no branch/tag/release creation,
- no production-ready claims,
- no security/compliance guarantees.

## Non-Goals

Runtime readiness metadata does not implement:

- runtime APIs,
- servers,
- listeners,
- workers,
- queues,
- schedulers,
- database adapters,
- database schemas,
- SQL,
- migration apply,
- backup/restore,
- repair mode,
- auth enforcement,
- rate-limit enforcement,
- dashboard views,
- dashboard controls,
- automation execution,
- workflow persistence,
- connectors,
- credential vaults,
- provider calls,
- action/proposal/approval execution,
- job execution,
- scaffold generation,
- deployment,
- releases.

## Future Validation Rules

Any later runtime readiness expansion should continue to require:

- bounded JSON-safe planning fields,
- supported check ids only,
- supported categories only,
- supported readiness levels only,
- supported risk tiers only,
- all boundaries true,
- evidence references as metadata strings only,
- blockers and preconditions as metadata only,
- recommendations as metadata only,
- no provider, network, filesystem, action, store, runtime, automation,
  connector, job, dashboard, CI, release, or deployment behavior,
- no server, listener, worker, queue, scheduler, DB adapter, schema, SQL,
  migration apply, backup, restore, repair, auth, or rate-limit behavior,
- no production, security, compliance, or certification guarantees.
