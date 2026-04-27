# Production Runtime Roadmap Specification

Phase: 42A-42I
Status: specification only

This document defines the staged production runtime roadmap. It is docs-only and
does not implement a runtime server, internal API, auth, migrations, locks,
backups, or retention jobs.

## Goals

Production runtime work should make ORQUESTADOR-PRIME safer to operate outside
local CLI flows while preserving existing gates.

The runtime roadmap covers:

- storage decision,
- locks and concurrency,
- internal API,
- auth and rate limits,
- backups and migrations,
- store migration system,
- config doctor and store health,
- data retention and forget system.

## Non-Goals

This phase must not:

- start a server,
- expose an API,
- add network listeners,
- add external auth,
- migrate stores automatically,
- delete data,
- run background daemons,
- bypass CLI safety gates.

## Storage Decision

Current stores are local JSON under `~/.orquestador-prime`. This is acceptable
for local-first phases.

Future production storage options:

- JSON with locks for local single-user operation,
- SQLite for local durable multi-store operation,
- Postgres only if a hosted multi-user runtime is explicitly approved.

Decision criteria:

- data integrity,
- migration complexity,
- backup/restore support,
- privacy controls,
- concurrency needs,
- deployment target,
- operator burden.

Recommendation: add store health and migration metadata before changing
storage engines.

## Locks and Concurrency

Before any server or daemon exists, define file/store locks.

Lock requirements:

- project or store scoped,
- timeout,
- stale lock detection,
- safe failure messages,
- no destructive unlock by default,
- audit lock conflicts for sensitive operations.

Concurrent writes to permissions, actions, jobs, notifications, memory, and
workspace stores should be blocked or retried safely.

## Internal API Roadmap

An internal API may eventually expose read-only and controlled mutation
endpoints.

Initial API classes:

- health/status,
- config diagnostics,
- tool registry inspect,
- permission check,
- supervisor status,
- memory retrieval,
- workspace read,
- notification inbox read.

Mutation endpoints require a separate safety review:

- action proposal creation,
- job enqueue,
- notification create,
- workspace updates.

No dispatch, approval, second approval, or computer-use endpoint should be
added without an explicit phase.

## Auth and Rate Limits

Internal API auth must be default-deny.

Required concepts:

- API subject kind,
- subject hash,
- token hash only,
- project scope,
- role,
- permission grant,
- rate limit by subject and route,
- audit for blocked requests.

Raw API tokens must never be logged.

## Backups

Backups should be explicit CLI actions first.

Backup requirements:

- include store versions,
- redact or encrypt sensitive stores if needed,
- write only to explicit path,
- no automatic upload,
- restore requires dry-run preview first,
- restore never overwrites without confirmation.

## Migrations

Migration system requirements:

- store version detection,
- dry-run migration plan,
- backup before write,
- explicit apply command,
- idempotent steps,
- rollback notes,
- audit metadata.

No automatic migration should happen during normal reads in the first runtime
slice.

## Config Doctor and Health Check

This is the safest first runtime implementation slice.

Checks:

- provider env presence without revealing secrets,
- store readability and schema versions,
- permission store health,
- action store health,
- memory V2 health,
- job/notification store health,
- channel config default-deny,
- OpenClaw dry-run config,
- known npm/WSL typecheck caveat.

Output should be JSON by default and contain no secret values.

## Retention and Forget System

Retention must be explicit and conservative.

Forget operations need:

- dry-run list of affected records,
- project scope,
- record kinds,
- privacy labels,
- backup recommendation,
- explicit apply command in later phase.

No delete operation should be automatic.

## Verification

Future runtime implementation should verify:

- no server starts unless explicitly requested,
- no network listener is created,
- config doctor does not reveal secrets,
- store health handles missing/corrupt files,
- migrations are dry-run only until approved,
- retention/forget does not delete by default.

