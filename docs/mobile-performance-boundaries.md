# Mobile Performance Boundaries

Phase: 128B - MOBILE PERFORMANCE CHECKLIST PLAN

Status: safety boundary plan only

## Boundary Summary

Mobile Performance Checklist is source-only, advisory-only, and metadata-only.
It describes future performance review posture and evidence needs. It must not
run profiling tools, generate apps, create native projects, edit packages,
activate CI, execute comparative runtime checks, automate devices, call providers, or mutate
runtime systems.

## Allowed In 128B

Allowed work:

- create docs that define future performance metadata,
- inspect existing PM and mobile architecture metadata,
- preserve advisory-first architecture,
- run typecheck and diff checks,
- document future implementation scope.

## Denied In 128B

Denied work:

- profiling execution,
- runtime metric capture,
- app generation,
- route or screen generation,
- mobile command execution,
- native project creation,
- package changes,
- workflow changes,
- CI activation,
- comparative runtime scripts,
- device automation,
- provider execution,
- DB or SQL mutation,
- dashboard mutation,
- secrets access,
- memory persistence,
- source-control automation from source.

## Future 128I Source Boundaries

If Phase 128I creates source, it must remain pure metadata. Helpers may:

- create checklist items,
- create risk records,
- create profiling-readiness records,
- summarize risk posture,
- select records by category,
- recommend future review steps.

Helpers must not:

- read or write files,
- read environment variables,
- run mobile commands,
- collect runtime metrics,
- automate devices,
- call providers,
- call network/API endpoints,
- mutate dashboard state,
- mutate DB/SQL,
- run CI,
- persist memory,
- invoke source-control commands.

## Tooling Mentions

Any mention of performance tooling, runtime metrics, startup timing, frame
health, bundle analysis, memory analysis, or device checks must be:

- advisory,
- future-gated,
- non-executing,
- non-configuring,
- evidence-oriented,
- approval-gated for implementation.

The checklist may say a flow needs startup review, list review, render review,
bundle review, memory review, or low-end device review. It must not provide
runtime instrumentation or platform commands.

## App And Native Boundary

The phase must not create app folders, native folders, Expo/EAS config files,
route files, screen files, assets, stores, tests, or build artifacts. Future
performance metadata can reference these concerns only as planned review
targets.

## Security And Privacy Boundary

Performance review must not weaken Phase 127I security posture. Future metric
capture must avoid sensitive payloads, auth artifacts, private user content,
payment data, safety reports, and secrets. In 128B, this remains a planning
constraint only.

## Autopilot Boundary

Autopilot may receive performance checklist metadata as handoff context or
dry-run scenario input. It must not turn performance risks into automatic
profiling, app generation, device automation, provider calls, memory writes,
dashboard updates, commits, or pushes from source modules.

## Human Review Boundary

Human review is required before future phases perform:

- profiling on real apps,
- runtime metric capture,
- package or native configuration changes,
- dependency changes for performance,
- CI performance gates,
- release readiness claims,
- low-end device lab execution.
