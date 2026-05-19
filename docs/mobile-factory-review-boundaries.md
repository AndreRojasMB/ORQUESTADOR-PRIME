# Mobile Factory Review Boundaries

Status: source-only / advisory / metadata-only

## Purpose

This boundary document defines what Phase 140B may and may not do while
planning the Mobile Factory block review and first controlled dry-run.

The phase is a planning and audit step. It creates documentation only.

## Allowed Work

Phase 140B may:

- inspect existing 121-139 source and documentation
- summarize advisory metadata coverage
- define a future readiness model
- define a future dry-run input model
- define a future dry-run output model
- define one simple app idea fixture for later simulation
- document known gaps before any real mobile build work
- document future 140I implementation scope
- run repository verification commands

## Not Allowed

Phase 140B must not:

- run the dry-run
- create app files
- create screen files
- create component files
- create route files
- create backend files
- create endpoint files
- run Codex as a worker
- run Expo/EAS commands
- interact with stores
- call providers
- access secret material
- make network/API calls
- modify DB/SQL
- mutate dashboard files
- activate CI
- persist memory
- automate source-control behavior from source modules

## Advisory Contract

All outputs must stay in the planning layer:

- source-only: documentation and future metadata shapes only
- advisory-only: no operational behavior or side effects
- metadata-only: no executable pipeline, no build runner, no mobile tooling
- human-reviewed: any future transition from metadata to implementation requires
  an explicit approved implementation phase

## Dry-Run Boundary

The first dry-run is only planned in 140B. The future dry-run may simulate a
metadata chain, but it must remain passive until an implementation phase
explicitly adds typed fixtures and smoke checks.

The planned chain is:

simple idea -> intake summary -> requirements summary -> feature blueprint
summary -> screen blueprint summary -> API/design/quality/release/store
summaries -> prompt draft metadata.

The prompt draft must be stored as metadata only and must not be used to launch
work.

## Store, Provider, And Runtime Boundary

140B must not interact with any external account, provider, store, SDK,
runtime executor, mobile toolchain, or dashboard. Store and provider concepts
may be referenced only as future readiness posture and approval-gated metadata.

## Repository Boundary

Allowed modifications are limited to:

- `docs/mobile-factory-review-plan.md`
- `docs/mobile-factory-review-boundaries.md`
- `docs/mobile-factory-readiness-model.md`
- `docs/mobile-factory-first-dry-run-plan.md`

Optional updates to existing docs should be avoided unless they are necessary
and documentation-only. No source files should change in 140B.

## Verification Boundary

Verification may run:

- `git status --short --branch`
- `git diff --stat`
- `git diff --name-only`
- `git diff --check`
- `node node_modules/typescript/bin/tsc --noEmit`

If Linux-side Node is unavailable, the Windows Node fallback may be used and
reported honestly.

## Stop Conditions

Stop and report if:

- source files are required to complete 140B
- package, workflow, provider, dashboard, DB/SQL, or runtime files appear in the
  intended diff
- verification requires a login, account setup, secret material, network
  access, provider setup, or mobile tooling
- the proposed plan cannot remain docs-only
