# Readiness / Maturity Metadata

Status: source-only advisory metadata

Phase 87I adds a bounded source-only readiness metadata lane. It does not add a
CLI, repository scanner, runtime monitor, dashboard data source, CI gate, store
reader, action bridge, job bridge, automation bridge, connector bridge, or
release process.

It does not call providers, use the network, read files, write files, scan the
repository, execute commands, mutate stores, change workflows, change packages,
create baselines, create artifacts, create branches, create tags, create
releases, or make ORQUESTADOR-PRIME production-ready.

## Purpose

Readiness / Maturity Metadata gives ORQUESTADOR-PRIME a static way to describe
where each major lane currently sits: advisory source, docs-only specification,
local diagnostic, local advisory tooling, live-adjacent guarded surface, or
future deferred work.

The goal is governance and sequencing. The metadata can help future reviewers
compare roadmap lanes without accidentally treating nearby live-adjacent code as
safe to execute.

This is source-only advisory metadata. It is not operational status and not a
runtime signal.

## Source Scope

The Phase 87I source lane lives under:

- `src/factory/readiness/types.ts`
- `src/factory/readiness/readinessTemplates.ts`
- `src/factory/readiness/readinessModelBuilder.ts`
- `src/factory/readiness/readinessValidator.ts`

The module is self-contained. It must not import runtime, dashboard, actions,
jobs, automation, connectors, providers, memory, learning, quality, eval, risk,
filesystem, network, or command-execution modules.

## Readiness Lane Model

Each lane model describes:

- lane id,
- category,
- name,
- summary,
- maturity level,
- risk tier,
- status type,
- evidence references,
- preconditions,
- blockers,
- next-step recommendations,
- assumptions,
- exclusions,
- `advisoryOnly: true`,
- full safety boundaries.

Evidence references are strings only. They may point to docs or source surfaces
for human review, but the readiness module does not read those paths.

## Maturity Levels

Supported maturity levels:

- `not_implemented`
- `docs_only_spec`
- `source_only_advisory`
- `local_read_only_diagnostic`
- `local_advisory_tooling`
- `live_adjacent_guarded`
- `deferred_until_prerequisites`
- `future_gated_execution`

These labels are descriptive. They do not grant permission to execute, mutate,
deploy, release, or automate.

## Risk Tiers

Supported risk tiers:

- `low`
- `medium`
- `high`
- `critical`

Risk tiers are review metadata. They are not access controls and do not enforce
permissions.

## Evidence References

Evidence entries include an id, label, reference string, reference type, and
safe summary.

Evidence entries must remain:

- metadata-only,
- bounded,
- redaction-aware,
- non-executable,
- free of raw secrets,
- free of raw prompts,
- free of raw provider output,
- free of file content.

The readiness module never treats an evidence reference as a file path to open.

## Preconditions And Blockers

Preconditions and blockers are planning metadata. They document what would need
to exist before a lane can mature.

They must not:

- create tasks,
- dispatch actions,
- approve proposals,
- enqueue jobs,
- update stores,
- modify CI,
- update packages,
- create baselines,
- execute runtime behavior.

## Next-Step Recommendations

Next steps are recommendation text only. They are not scripts, commands,
workflow steps, action proposals, approvals, jobs, automation runs, or release
steps.

## Static Templates

`readinessTemplates.ts` contains a curated static registry for:

- factory metadata lanes,
- runtime deeper,
- native automation deeper,
- dashboard/control center,
- integrations/connectors,
- safe self-improvement,
- baseline/strict CI,
- productization/release,
- quality/evals/risk,
- workspace/memory/learning,
- actions/proposals/approvals,
- jobs/notifications,
- channels/WhatsApp/Omi/OpenClaw/computer-use,
- deployment/productization.

The registry is not generated from the repository. It does not scan files or
calculate live status.

## Builder / Resolver

`readinessModelBuilder.ts` provides pure helpers to:

- get one static readiness lane template,
- list readiness lane templates,
- build a readiness maturity snapshot from caller-supplied lane ids and bounded
  metadata.

The builder accepts caller-supplied metadata only. It does not inspect the
workspace, call providers, access the network, execute commands, read stores, or
write artifacts.

Unknown lane ids fail safely with a structured result.

## Validator

`readinessValidator.ts` validates:

- known lane ids,
- known maturity levels,
- known risk tiers,
- required fields,
- bounded arrays and text,
- unique evidence/precondition/blocker/next-step ids,
- `advisoryOnly: true`,
- every safety boundary set to true,
- evidence references as metadata only,
- blockers and preconditions as metadata only,
- next steps as recommendations only,
- no executable behavior wording,
- no production-ready claims,
- no security, compliance, or certification guarantees.

Validation is local and pure. It is not a CI gate unless a later phase
explicitly designs one.

## Lane Coverage

Initial lane coverage:

| Lane | Current maturity | Risk | Notes |
|---|---|---:|---|
| factory metadata lanes | `source_only_advisory` | low | Implemented advisory metadata, no generation/runtime. |
| runtime deeper | `docs_only_spec` | high | No production API, workers, DB adapter, auth, backup/restore. |
| native automation deeper | `local_advisory_tooling` | high | Validation/dry-run exists; execution remains deferred. |
| dashboard/control center | `docs_only_spec` | high | Existing dashboard app has write-path risk. |
| integrations/connectors | `docs_only_spec` | critical | Connector-adjacent clients exist; governance remains future. |
| safe self-improvement | `docs_only_spec` | critical | Proposal-only, non-autonomous path. |
| baseline/strict CI | `docs_only_spec` | medium | No committed baselines or strict CI enforcement. |
| productization/release | `docs_only_spec` | medium | No package/version/tag/release changes. |
| quality/evals/risk | `local_advisory_tooling` | medium | Advisory evidence and redacted artifacts only. |
| workspace/memory/learning | `live_adjacent_guarded` | high | Privacy and store mutation risks. |
| actions/proposals/approvals | `live_adjacent_guarded` | critical | Dispatch/write paths exist and remain gated. |
| jobs/notifications | `live_adjacent_guarded` | high | Enqueue/run/local state risks. |
| channels/computer-use | `live_adjacent_guarded` | critical | Bridge, network, and computer-use risks. |
| deployment/productization | `docs_only_spec` | critical | Packaging, deploy, release, and policy work deferred. |

## Integration With Post-85 Sequencing

The post-85 roadmap remains the controlling sequence. Readiness metadata records
lane maturity so future phases can avoid jumping from specification directly to
execution.

It does not replace Phase 86 sequencing and does not approve future phases.

## Runtime Readiness Detail

The detailed runtime readiness profile is documented in
[Runtime Readiness Validator](runtime-readiness-validator.md). It provides a
source-only advisory runtime lane for server/API, workers, queues, schedulers,
store adapters, migration apply, backup/restore, repair, auth/rate-limit,
observability, dashboard visibility, and deployment readiness. It does not
import runtime-adjacent modules, read files, scan the repository, or execute
runtime behavior.

## Baseline Manifest Dry-Run Relationship

The baseline/strict CI lane can reference
[Baseline Manifest Dry-Run](baseline-manifest-dry-run.md) as advisory evidence
for future baseline candidate maturity. The metadata is dry-run-only and does
not create baselines, generate artifacts, enable strict CI, or change release
readiness.

## Strict CI Warning Mode Relationship

[Strict CI Warning Mode](strict-ci-warning-mode.md) remains a future advisory
maturity stage for the baseline/strict CI lane. Warning mode is report-only and
does not enable strict flags, create baselines, mutate artifacts, or change CI
behavior in Phase 93I.

## Future Read-Only Dashboard Visibility

A future control center may display readiness metadata as read-only lane
summaries after the existing dashboard write paths are audited and isolated.

Phase 87I does not modify `dashboard/`, add routes, add components, add server
actions, or create operator controls.

The current dashboard lane risk is documented in
[Dashboard Safety Audit](dashboard-safety-audit.md). That audit is the
prerequisite record for separating live-adjacent dashboard read/write paths from
future read-only control-center visibility.

The future manifest policy is documented in
[Control Center Readonly Manifest](control-center-readonly-manifest.md).
Readiness metadata may later be exposed through that readonly manifest as
metadata strings and bounded summaries, not through direct dashboard store
reads, live repository scanning, or source imports.

## Release / Productization Use

Future release readiness may reference readiness metadata as non-blocking review
evidence. The metadata does not create release gates, tags, packages, changelog
entries, GitHub releases, deployment bundles, license policy, or security
policy.

## Safety Boundaries

Phase 87I explicitly preserves:

- no provider calls,
- no network,
- no filesystem reads from source,
- no filesystem writes from source,
- no repository scanning,
- no command execution,
- no runtime execution,
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

Readiness metadata does not implement:

- runtime APIs,
- workers,
- queues,
- schedulers,
- dashboard views,
- dashboard controls,
- automation execution,
- workflow persistence,
- connectors,
- credential vaults,
- webhook listeners,
- provider calls,
- quality gate enforcement,
- baseline comparison enforcement,
- self-improvement behavior,
- action/proposal/approval execution,
- job execution,
- scaffold generation,
- deployment,
- releases.

## Future Validation Rules

Any later readiness expansion should continue to require:

- bounded JSON-safe planning fields,
- supported lane ids only,
- supported maturity levels only,
- supported risk tiers only,
- all boundaries true,
- evidence references as metadata strings only,
- blockers and preconditions as metadata only,
- next steps as recommendations only,
- no provider, network, filesystem, action, store, runtime, automation,
  connector, job, dashboard, CI, release, or deployment behavior,
- no production, security, compliance, or certification guarantees.

## Connector Metadata Taxonomy Relationship

The connector readiness lane may later reference
[Connector Metadata Taxonomy](connector-metadata-taxonomy.md) entries as
advisory evidence for connector categories, risk tiers, credential
requirements, dry-run expectations, audit plans, approval gates, sandbox plans,
and maturity stages. Phase 94I taxonomy metadata does not execute connectors,
call providers, handle credentials, create webhooks, or make network/API calls.
