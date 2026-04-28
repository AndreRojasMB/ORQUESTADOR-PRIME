# Store Migration And Lock Policy

Phase: 60I
Status: specification only

## Purpose

This document is a specification only.

It defines future store migrations, backups, repair, and locks for
ORQUESTADOR-PRIME. It does not implement migration, backup, repair, or locking
yet.

This policy is a safety prerequisite for durable runtime behavior, workers,
native automation, future store adapters, and long-running operations.

## Current State

Current state:

- `runtime:doctor` exists and is read-only.
- The store inventory exists.
- `futureMigrationVersion` and `futureLockScope` exist in inventory metadata.
- Current stores are JSON files.
- No migration/apply/repair/lock commands exist yet.
- No backup system exists yet.
- No lock system exists yet.

The runtime doctor must remain read-only and lock-free.

Phase 61I adds isolated lock primitives under `src/runtime/locks`. They are
library-level only: no CLI exists yet, no store/migration/repair/runtime-doctor
integration exists yet, and no existing store writer uses them. Lock operations
require an explicit lock root. Stale locks are reported safely and are not
automatically cleaned up.

Phase 62I adds a dry-run migration planner:

```bash
npm run store:migration:plan
```

The planner is report-only. It does not apply migrations, create backups,
create locks, repair stores, mutate stores, or integrate with existing store
writes. Locks remain required only for future apply, repair, and backup phases.

## Migration Model

A future migration record should include:

- `migrationId`,
- `storeId`,
- `fromVersion`,
- `toVersion`,
- `description`,
- `safetyClass`,
- `requiresBackup`,
- `requiresLock`,
- `dryRun`,
- `apply`,
- `validateBefore`,
- `validateAfter`,
- rollback/restore instructions,
- bounded diagnostics.

Allowed safety classes:

- `read-only-check`,
- `shape-only`,
- `destructive-risk`,
- `sensitive`.

Rules:

- Dry-run must come before apply.
- Apply must never be implicit.
- Apply must require backup and lock.
- Apply must validate the source version before changing anything.
- Apply must validate the target version after changing anything.
- Phase 60I does not implement apply.

## Backup Strategy

Future backup path concept:

```text
<data-root>/backups/<timestamp>/<storeId>/<fileName>
```

Future backup manifest fields:

- `backupId`,
- `createdAt`,
- `storeId`,
- `fileName`,
- `sourceFileHash`,
- `backupFileHash`,
- `byteSize`,
- `schemaVersion`,
- `migrationId`,
- `reason`,
- `redacted: true`.

The backup manifest must not include raw store contents or secrets.

Restore must be explicit, locked, audited, and never automatic.

## Lock Model

A future lock record should include:

- `lockId`,
- `storeId`,
- `projectId`,
- `operation`,
- `owner`,
- `createdAt`,
- `expiresAt`,
- `ttlMs`,
- `processHint`,
- `reason`,
- `staleAfter`,
- `metadataHash`.

Future lock file path concept:

```text
<data-root>/locks/<lock-scope>.lock.json
```

Rules:

- Acquire before apply, repair, or dispatch-like writes.
- Release after operation.
- Fail closed on active lock.
- Stale recovery is explicit only.
- `runtime:doctor` remains lock-free.
- Read-only commands must not create locks.

## Store Versioning

Store versioning uses:

- `expectedVersion`,
- `versionField`,
- `futureMigrationVersion`,
- `futureLockScope`,
- `migrationReady`,
- `migrationRequired`,
- `migrationBlocked`,
- `lockScopeKnown`,
- `backupRequired`.

Version mismatch is a warning until a migration CLI exists.

Future apply must fail if the source version is unexpected.

## Repair Policy

Repair is not migration.

Repair must:

- be explicit,
- dry-run first,
- require backup,
- require lock,
- never invent secrets,
- never silently drop records,
- produce proposed actions before apply.

Repair is not implemented in this phase.

## Future CLI Concepts

Future commands may include:

```bash
npm run store:migrate -- --dry-run
npm run store:migrate -- --apply
npm run store:backup
npm run store:locks
npm run store:repair -- --dry-run
```

These commands are not implemented yet.

No package scripts are added in this phase.

## Implementation Grouping

Recommended grouping:

1. 60I: docs/spec for migrations, backups, repair, and locks.
2. 61B: minimal lock primitives plan.
3. 61I: isolated lock primitive implementation.
4. 62B: dry-run migration planner.
5. 62I: dry-run migration planner implementation.
6. Later: backup/apply/repair only after lock safety is proven.

## Safety Boundaries

Safety boundaries:

- no migration apply without explicit command,
- no backup without explicit command,
- no repair without explicit command,
- no locks from read-only commands,
- no real HOME mutation in smoke tests,
- no provider/network/action/proposal behavior.
