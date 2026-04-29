# Production Runtime Deeper

Phase: 79I
Status: docs-only deeper runtime specification

## A. Purpose

This document is a specification only.

It defines the safe future path for a deeper production runtime foundation in
ORQUESTADOR-PRIME. It does not implement runtime behavior, create a server,
start workers, add queues, add schedulers, add database adapters, apply
migrations, run backups, restore data, repair stores, enforce auth, enforce
rate limits, execute automation, or make ORQUESTADOR-PRIME production-ready.
It does not make ORQUESTADOR-PRIME production-ready.

The deeper runtime exists to eventually give ORQUESTADOR-PRIME a durable,
operator-controlled foundation for runtime APIs, workers, queues, scheduling,
store adapters, migrations, backups, observability, retention, approvals, and
safe execution boundaries. Phase 79I only documents that future architecture.

## B. Current Runtime Baseline

Current known state:

- Runtime foundation documentation exists.
- `runtime:doctor` is read-only and privacy-aware.
- Lock primitives exist, but they are not full runtime orchestration.
- The migration planner is dry-run and report-only.
- Jobs and notifications exist as explicit/manual safe surfaces.
- Action, proposal, and approval primitives exist, but they must not be
  auto-executed by runtime work.
- Native automation remains validation, dry-run, and trace only.
- Enterprise Software Factory lanes remain advisory/source-only metadata.

These foundations are useful, but they are not a production runtime.

## C. Production Runtime Readiness Gaps

Current gaps:

- no production runtime API or server,
- no durable worker daemon,
- no queue backend,
- no scheduler daemon,
- no SQLite or Postgres adapter,
- no migration apply path,
- no backup or restore execution,
- no repair mode,
- no auth or rate-limit enforcement,
- no dashboard or control-center runtime wiring,
- no production deployment packaging.

## D. Runtime API Strategy

The first future runtime API surfaces should be read/status surfaces. Examples
can include planned status areas such as health, config diagnostics, store
readiness, queue status, job status, migration readiness, lock visibility, and
operator review state.

Mutation APIs should come later only behind:

- auth,
- approval gates,
- audit logging,
- rate limits,
- operator controls,
- lock checks,
- dry-run previews where possible.

Endpoint names in this document are planned surfaces only. They are not
implemented routes and do not authorize server creation.

## E. Worker Model

Future workers should define lifecycle states before any worker process exists.
Candidate states include:

- planned,
- starting,
- idle,
- running,
- blocked,
- draining,
- paused,
- failed,
- stopped.

Future worker design should include safe job kinds, explicit blocking rules,
operator visibility, idempotency checks, lock awareness, bounded retries, and
auditable outcomes.

Phase 79I adds no worker loops, worker daemons, or execution behavior.

## F. Queue Model

Future queue semantics should define:

- queued, scheduled, running, blocked, succeeded, failed, expired, cancelled,
  and dead-lettered states,
- retry policy,
- dead-letter strategy,
- idempotency expectations,
- duplicate prevention,
- visibility timeouts or lease concepts,
- operator review for blocked work.

No queue backend is implemented in Phase 79I.

## G. Scheduler Model

The first future scheduler should be explicit and operator-controlled. It
should not begin as a background daemon.

Scheduler strategy should cover:

- due item selection,
- missed schedule handling,
- paused schedule handling,
- timezone assumptions,
- duplicate prevention,
- lock requirements,
- operator-visible dry-run previews.

Background daemon behavior is deferred. Phase 79I adds no scheduler
implementation.

## H. Store Adapter Strategy

Future store adapters should be planned as contracts before storage engines
change. Adapter concepts can include:

- read capability,
- write capability,
- transaction boundary,
- backup capability,
- restore capability,
- lock requirements,
- migration status,
- schema or version readiness,
- redacted diagnostics.

Phase 79I implements no adapters and changes no stores.

## I. SQLite/Postgres Strategy

SQLite is the local durable runtime candidate because it can support a
single-node runtime with stronger transaction semantics than JSON stores.

Postgres is the later multi-user and production runtime candidate because it
can support stronger concurrency, operational tooling, and managed deployment
patterns.

No SQL, schemas, migrations, adapters, or storage engine changes are introduced
in Phase 79I.

## J. Migration Apply Strategy

Future migration apply behavior should require:

- dry-run first,
- backup before apply,
- lock before apply,
- explicit operator confirmation,
- source version validation,
- target version validation,
- bounded redacted diagnostics,
- rollback or restore notes.

Repair mode must remain separate from migration apply.

Phase 79I adds no migration apply implementation.

## K. Backup/Restore Strategy

Future backup strategy should require backup before any store mutation. Backup
metadata should be bounded and redacted. Restore should require operator review,
lock checks, and audit records.

Phase 79I performs no file operations, database operations, backups, or
restores.

## L. Repair Mode Strategy

Future repair mode should keep inspect, diagnose, and repair as separate steps.
Repair should be dry-run first, produce a reviewable plan, require backup and
lock checks, and avoid inventing missing secrets or silently dropping records.

Phase 79I adds no repair implementation.

## M. Auth And Rate-Limit Strategy

The first future auth model should be local admin/operator oriented. Later
token or session models should store only safe hashes or opaque identifiers.

Mutation surfaces should be default-deny. Rate limits should be strategy-only
until an explicit enforcement phase exists.

Phase 79I adds no auth or rate-limit enforcement.

## N. Observability Strategy

Future observability should include:

- structured logs,
- health checks,
- redacted traces,
- queue and job status,
- migration status,
- lock status,
- worker status,
- operator action summaries,
- safe error codes.

Telemetry export, external monitoring integration, and dashboard wiring are not
implemented in Phase 79I.

## O. Retention/Forget Policy

Future retention and forget operations should be:

- project-scoped where possible,
- dry-run first,
- explicit apply later,
- auditable,
- redacted,
- protected from accidental global deletion.

Phase 79I adds no deletion, retention enforcement, forget execution, or store
mutation.

## P. Operator Controls

Future operator controls can include:

- pause workers,
- block queues,
- inspect locks,
- review migration plans,
- trigger safe dry-runs,
- inspect health status,
- inspect blocked jobs,
- acknowledge safe maintenance windows.

These controls are future concepts only. Phase 79I does not implement a
dashboard, control center, API, CLI, or runtime command.

## Q. Integration Plan

Future runtime-deeper work should align with:

- Native Automation Engine: future execution substrate only after explicit
  automation execution approval.
- Jobs/notifications: existing explicit safe surfaces can inform lifecycle
  planning, but Phase 79I does not run jobs.
- Action/proposal/approval system: future mutations must remain approval-gated.
- Store migrations/locks: future apply, repair, and backup require locks and
  backups.
- Workspace manager: runtime operations should remain workspace-aware.
- Dashboard/control center: future operator visibility only, not implemented
  here.
- Transactional Systems Layer: metadata can inform runtime risk, not execute
  transactions.
- BI/reporting: future observability can inform reporting, not generate BI
  assets.
- Enterprise UI Patterns: future operator UI planning only.
- Connectors: future connector runtime requires credentials, limits, audit, and
  explicit approvals.
- Deployment/productization: future packaging requires separate deployment
  planning and security review.

The deeper native automation path is documented in
[Native automation engine deeper](native-automation-engine-deeper.md).
Automation execution depends on future runtime maturity and remains disabled in
Phase 80I.

## R. Runtime Maturity Stages

Future maturity should advance in stages:

1. Local development runtime: explicit commands, read-only diagnostics, no
   daemons.
2. Single-node runtime: local durable store strategy, locks, backups, and
   operator-visible queues.
3. Operator/admin runtime: health, pause/block controls, migration review, and
   audit visibility.
4. Production deployment preparation: config validation, auth strategy, rate
   limits, observability, and retention policy.
5. Multi-worker future: queue backend, leases, idempotency, retries, and
   dead-letter strategy.
6. Database-backed future: SQLite first, Postgres later, with explicit
   migration and backup gates.
7. Approval-gated execution future: mutation surfaces only after approval and
   audit integration.
8. Connector-enabled future: provider and external system behavior only after
   credential, permission, and rate-limit controls.
9. Observability/retention future: redacted logs, retention windows, and
   reviewed forget workflows.

## S. Safety Boundaries / Non-Goals

Phase 79I has these non-goals:

- no provider calls,
- no network,
- no command execution,
- no filesystem mutation,
- no store mutation,
- no runtime server or API implementation,
- no worker, queue, or scheduler execution,
- no DB adapter implementation,
- no migration apply,
- no SQL or DB schemas,
- no auth or rate-limit implementation,
- no backup or restore execution,
- no action, proposal, or approval execution,
- no automation execution,
- no package, workflow, or CI changes,
- no deployment changes,
- no production-ready claims,
- no security or compliance guarantees.

## T. Future Source Candidates

Future source-only planning metadata may eventually live in:

- `src/runtime/planning/types.ts`
- `src/runtime/planning/runtimePlanTemplates.ts`
- `src/runtime/planning/runtimePlanValidator.ts`
- `src/runtime/planning/runtimePlanBuilder.ts`

These files are future candidates only. They are not implemented in Phase 79I.

Future type candidates:

- `RuntimeSchemaVersion`
- `RuntimeCapability`
- `RuntimeBoundarySet`
- `RuntimeApiSurface`
- `RuntimeWorkerPlan`
- `RuntimeQueuePlan`
- `RuntimeSchedulerPlan`
- `RuntimeJobLifecyclePlan`
- `RuntimeStoreAdapterPlan`
- `RuntimeDatabaseStrategy`
- `RuntimeMigrationPlan`
- `RuntimeBackupPlan`
- `RuntimeRepairPlan`
- `RuntimeAuthPlan`
- `RuntimeRateLimitPlan`
- `RuntimeObservabilityPlan`
- `RuntimeRetentionPolicy`
- `RuntimeHealthCheck`
- `RuntimeOperatorControl`
- `RuntimeIntegrationPlan`
- `RuntimeRisk`
- `RuntimeMaturityPlan`
- `RuntimeValidationFinding`
- `RuntimeValidationResult`

## U. Future Validation Strategy

Future source metadata should validate:

- required runtime planning fields,
- bounded arrays and text,
- `advisoryOnly` is true,
- all safety boundaries are true,
- API entries are plans only, not endpoints,
- worker, queue, and scheduler entries are plans only, not executable loops,
- store and database entries are strategy metadata only,
- migration entries are plans only, not apply logic,
- backup and restore entries are strategy only,
- auth and rate-limit entries are strategy only,
- no provider, network, filesystem, action, store, or runtime execution
  behavior,
- no server creation wording,
- no SQL, schema, or migration implementation,
- no production, security, or compliance guarantees.

## Dashboard / Control Center Relationship

The future Dashboard / Control Center path is documented in
[Dashboard / Control Center](dashboard-control-center.md). It is a
read-only-first operator visibility strategy over runtime, config, artifact,
and maturity signals. Phase 81I is docs-only and does not enable runtime
controls, server/API behavior, config writes, repair, migration apply,
worker/queue control, or operator actions.
