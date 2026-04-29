# Config Doctor And Store Health Check

Phase: 59I
Status: read-only runtime foundation implementation

## Purpose

The runtime doctor is a read-only diagnostic command for ORQUESTADOR-PRIME.

It inventories known local stores, checks package and CI alignment, and emits a
safe JSON health summary that can be pasted into issues or phase notes.

It does not repair stores, migrate stores, create locks, create stores, run a
runtime server, enable native automation, or perform action/proposal behavior.

## Usage

```bash
npm run runtime:doctor
```

Pretty JSON:

```bash
npm run runtime:doctor -- --pretty
```

The command prints JSON to stdout.

In mixed WSL/Windows environments, the local npm or `tsx` shim may require the
compiled `/tmp` fallback pattern used by the quality guides.

## Read-Only Behavior

The doctor:

- reads package and workflow files,
- resolves the ORQUESTADOR data root,
- checks known store file names,
- uses file stat and file read operations only,
- parses JSON directly for health checks,
- reports bounded status, counts, reason codes, and recommendations.

The doctor does not:

- create missing data directories,
- create missing store files,
- repair corrupt stores,
- migrate stores,
- create lock files,
- dispatch actions,
- approve or reject proposals,
- create proposals,
- run providers,
- use network access.

## Store Inventory

The first inventory includes:

- `config.json`,
- `workspaces.json`,
- `memory.json`,
- `memory-v2.json`,
- `permissions.json`,
- `permission-audit.json`,
- `actions.json`,
- `action-executions.json`,
- `action-second-approvals.json`,
- `channel-audit.json`,
- `jobs.json`,
- `notifications.json`,
- `trajectories.json`,
- `multi-agent-traces.json`,
- `supervisor-goals.json`,
- `screenshot-traces.json`.

Missing optional stores are expected on fresh installations and are reported as
warnings or skipped checks rather than as repair tasks.

## What It Checks

Store checks include:

- exists or missing,
- readable or unreadable,
- parseable or unparseable JSON,
- version field presence,
- expected version match when known,
- initialized collection counts,
- file size warning threshold,
- suspicious key and value patterns.

Config and project checks include:

- Node runtime information,
- npm process hint when available,
- TypeScript binary presence,
- required package scripts,
- active CI workflow alignment,
- artifact upload configuration,
- baseline and strict CI flags remaining deferred,
- runtime server, migrations, locks, and automation remaining future work.

## Output Contract

The JSON result includes:

- `doctorId`,
- `createdAt`,
- `schemaVersion`,
- `summary`,
- `checks`,
- `stores`,
- `warnings`,
- `errors`,
- `recommendations`,
- `advisoryOnly: true`,
- redaction status,
- safety boundaries.

Statuses are:

- `pass`,
- `warn`,
- `fail`,
- `skipped`.

The command exits `0` for `pass` or `warn`, and exits `1` for `fail` or doctor
execution errors.

## Privacy And Redaction Policy

The doctor must not emit:

- secrets,
- tokens,
- raw provider output,
- raw task bodies,
- request body payloads,
- raw body payloads,
- full file contents,
- raw proposal parameters,
- sensitive raw paths.

Privacy findings use bounded reason codes and safe messages only. Matched raw
values are not included in output.

## Future Relationship

The runtime doctor is the first implementation slice after the production
runtime foundation spec.

Future phases may build on it for:

- config doctor expansion,
- store migration planning,
- store locks,
- runtime API readiness,
- worker and queue readiness,
- dashboard readiness.

Repair, migration, locks, runtime API, dashboard, and automation remain future
work.

The migration and lock policy is documented in
[Store migration and lock policy](store-migration-locks.md). The runtime doctor
may later report migration and lock readiness, but it must not create locks,
repair stores, or run migrations.

## Dashboard Safety Audit Relationship

Dashboard config views are covered by
[Dashboard Safety Audit](dashboard-safety-audit.md). Future dashboard config
surfaces must not mutate config without an approved auth, redaction, approval,
audit, and write-isolation policy. Phase 88I documents that risk only and does
not change the runtime doctor or dashboard behavior.

## Runtime Readiness Validator Relationship

The existing runtime doctor is a read-only diagnostic that inspects configured
health surfaces. The source-only advisory
[Runtime Readiness Validator](runtime-readiness-validator.md) is different: it
does not import the doctor, read files, inspect stores, scan the repository, or
run diagnostics. It records static readiness metadata for future runtime
maturity review.

## Runtime Doctor Safe Expansion

[Runtime Doctor Safe Expansion](runtime-doctor-safe-expansion.md) documents the
Phase 91I presence-only checks added to the doctor. The doctor remains
read-only and privacy-aware: it may report safe doc/source presence, but it does
not invoke migration planning, acquire locks, repair stores, write config,
execute jobs/actions/automation, call providers, or expand raw store browsing.
