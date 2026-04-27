# Production Runtime Foundation

Phase: 58I
Status: canonical runtime foundation specification

## Purpose

This document is a specification only.

It prepares ORQUESTADOR-PRIME for future durable runtime behavior. It does not
implement a server, workers, migrations, locks, native automation, dashboard
controls, or real runtime enforcement.

This foundation is a prerequisite for future native automation, dashboard and
control center work, enterprise software factory execution flows, connectors,
and safe self-improvement.

## Current State

The current system is primarily CLI and local-store oriented.

Existing foundations include:

- local JSON stores,
- workspace management,
- Memory V2 and learning export surfaces,
- permission and tool registry surfaces,
- action and proposal safety surfaces,
- jobs and notifications,
- supervisor advisory components,
- eval, risk, and quality components,
- active CI with scanned redacted quality artifacts.

Production runtime behavior is not implemented yet. There is no production
server, durable worker process, runtime API, migration system, lock manager, or
runtime permission enforcement layer.

## Runtime Foundation Objectives

Future runtime work should support:

- durable execution,
- internal API boundaries,
- workers,
- queue processing,
- scheduler behavior,
- locks and concurrency control,
- store adapters,
- migrations,
- backups,
- auth and rate limits,
- health checks,
- config doctor diagnostics,
- data retention and forget operations,
- structured observability,
- redacted audit events,
- secrets and config policy,
- runtime permissions.

These are foundations for future runtime lanes. They do not authorize
autonomous execution or production mutation by themselves.

## Storage Strategy

The recommended strategy is hybrid:

- keep current JSON stores stable now,
- introduce store adapter contracts before changing the storage engine,
- treat SQLite as the local durable runtime candidate,
- treat Postgres as a later production runtime candidate,
- avoid storage engine migration until store inventory, config doctor, and
  migration policy exist.

| Option | Pros | Cons | Risk |
|---|---|---|---|
| JSON only | Matches current implementation, easy to inspect, low immediate churn. | Weak concurrency, no transaction model, limited query support. | Medium as runtime grows. |
| SQLite | Portable local durability, transactions, simple deployment. | Requires adapters, migrations, backup policy, and lock discipline. | Medium. |
| Postgres | Strong production concurrency and operations model. | Too heavy before runtime architecture, auth, and migrations are settled. | High now. |
| Hybrid JSON now plus SQLite/Postgres later | Preserves current behavior while creating a migration path. | Requires careful adapter and schema design. | Lowest safe path. |

No storage engine migration should happen before the store inventory, health
checks, migration policy, backup policy, and lock model are documented and
tested.

## Runtime Architecture Proposal

Future runtime architecture should be layered:

- runtime core,
- internal API layer,
- worker layer,
- queue layer,
- scheduler layer,
- store adapter layer,
- permission enforcement layer,
- audit layer,
- notification layer,
- health and config layer,
- dashboard/API integration later.

The first runtime APIs should be read/status APIs. Mutation APIs should come
later, be explicit, and be approval-gated.

No anonymous dangerous actions should be allowed.

## Store Migration System

Future store migration support should require:

- schema versions,
- migration manifests,
- dry-run migration,
- apply migration only by explicit command,
- backup before mutation,
- repair mode separate from migration,
- corruption detection,
- bounded diagnostics,
- isolated HOME smoke tests,
- migration locks,
- no mutation of real stores by default.

Migration output must be safe to paste into issue reports. It should identify
store names, version states, and status codes without dumping full file
contents.

## Locking And Concurrency

Future locking support should include:

- per-store locks,
- per-project locks,
- job locks,
- action/proposal locks,
- migration locks,
- stale lock recovery,
- lock owner metadata,
- lock TTL,
- no double-dispatch,
- no parallel dangerous operations.

The first implementation should use a JSON lock-file strategy. Later SQLite or
Postgres adapters can use database-native locks behind the same contract.

## Config Doctor / Health Check

A future command concept is:

```bash
npm run runtime:doctor
```

It should check:

- Node/npm environment,
- WSL/Windows shim caveat,
- required config files,
- provider key presence without exposing values,
- store readability,
- store schema versions,
- workspace status,
- permissions store,
- action/proposal store health,
- job and notification store health,
- artifact directory expectations,
- CI docs and workflow alignment,
- dashboard/runtime readiness placeholders.

Output must be safe to paste:

- no secrets,
- no raw provider output,
- no raw task bodies,
- no full file contents,
- no sensitive raw paths unless bounded and safe.

## Auth / Rate Limit / Runtime Permission Model

Future runtime permissions should include:

- local admin mode first,
- API token model later with hashes only,
- channel identities,
- per-channel permissions,
- per-project permissions,
- per-tool permissions,
- rate limits by identity, channel, and action class,
- explicit approval checks,
- second approval checks for dangerous actions,
- audit logs for allowed and denied decisions,
- no anonymous dangerous actions,
- default-deny automation and connectors.

Runtime permissions are different from advisory CI quality signals. CI quality
artifacts can inform humans, but they do not grant runtime authority.

## Retention / Forget System

Future retention policy should cover:

- memory entries,
- learning exports,
- trajectories,
- job records,
- notifications,
- action execution records,
- artifact and report references,
- audit logs,
- project-level data.

Forget operations must be:

- project-scoped where possible,
- dry-run first,
- explicit apply only,
- privacy-safe,
- audited,
- protected against accidental global deletion.

## Observability / Logging / Tracing

Future observability should provide:

- structured logs,
- trace IDs,
- run IDs,
- job IDs,
- project IDs,
- store IDs,
- redacted event payloads,
- runtime health summaries,
- audit events,
- quality/runtime event linkage,
- bounded diagnostics.

Runtime logs and traces must not contain:

- secrets,
- raw provider output,
- raw task bodies,
- full file contents,
- sensitive absolute paths.

## Relationship To Future Lanes

This foundation unlocks:

- native n8n-like automation,
- dashboard/control center,
- enterprise software factory,
- real connectors and integrations,
- safe long-running jobs,
- stricter approval flows,
- future self-improvement proposals,
- runtime observability,
- baseline and strict CI maturation.

Native automation, dashboard mutation controls, enterprise generators, and
connectors should wait for runtime permissions, locks, audit, and health checks.

## Future Implementation Grouping

Recommended grouping:

1. 58I: runtime foundation docs/spec.
2. 59B: config doctor/store health plan.
3. 59I: config doctor/store health implementation.
4. 60B: store migration/lock plan.
5. 60I: store migration/lock implementation.
6. Later: runtime API, worker/queue, scheduler, dashboard, automation engine.

## Verification And Smoke Standards

Future implementation phases should run:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

For quality-sensitive phases:

```bash
npm run quality:gate
npm run quality:artifacts:dry-run -- --out-dir=/tmp/orq-runtime-artifacts-check
```

Also run:

```bash
git diff --check
git status --short
```

Standard checks:

- no generated artifacts tracked,
- no baseline files tracked,
- isolated HOME for store and migration tests,
- no provider, network, or action behavior unless explicitly planned.

Runtime smoke must use:

```bash
HOME=/tmp/orq-runtime-smoke-*
```

Runtime smoke should verify:

- missing stores are handled safely,
- corrupt stores are handled safely,
- migration dry-runs do not mutate real stores,
- doctor output is redacted,
- no provider calls occur,
- no action dispatch occurs,
- no real user HOME mutation occurs.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Corrupting stores | Dry-run first, backup before apply, isolated HOME smoke tests. |
| Overbuilding a server too early | Specify runtime foundations before adding API/server code. |
| Unsafe runtime API | Start with read/status APIs; approval-gate mutations later. |
| Secret leakage in doctor output | Presence-only checks and redacted summaries. |
| Concurrency bugs | Add lock contracts before workers and automation. |
| Destructive migrations | Separate dry-run, apply, and repair modes. |
| Confusing runtime permissions with advisory CI | Keep CI quality signals separate from runtime authority. |
| Making automation possible before permissions are ready | Require default-deny permissions, audit, and approval gates first. |
