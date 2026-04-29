# Transactional Systems Layer

Phase: 77I
Status: source-only advisory helper

## Purpose

The Transactional Systems Layer provides bounded source metadata for enterprise
transactional patterns used by the Enterprise Software Factory.

It represents transaction boundaries, consistency models, idempotency rules,
rollback and compensation strategies, reconciliation rules, closing policies,
posting policies, settlement notes, audit trail requirements, traceability
requirements, states, transitions, exceptions, integrity controls, concurrency
risks, metrics, and alignment notes for later human review.

It does not call providers, use network, read files, write files, scan
directories, execute commands, mutate stores, dispatch actions, create
proposals, execute approvals, execute workflows, execute automation, execute
transactions, write databases, run SQL, create schemas, apply migrations,
generate SQL files, generate ledgers, generate queues or workers, scaffold
applications, generate systems, claim production readiness, guarantee banking
or financial correctness, guarantee compliance, or make exact business or
financial claims without assumptions.

## Supported Transactional Templates

The first source registry includes advisory templates for:

- sales order transaction
- procurement transaction
- inventory movement transaction
- payment/billing transaction
- finance closing transaction
- maintenance/work-order transaction
- incident/ticket transaction
- access request/audit transaction
- generic transaction model

Templates are starter models, not complete transactional architecture. They
must be reviewed with business owners, process owners, data owners, technical
owners, and audit stakeholders before implementation planning.

## Transactional Model Shape

`TransactionalSystemModel` includes:

- `transactionalId`
- `schemaVersion`
- `category`
- `name`
- `purpose`
- `familyId`
- `processIds`
- `moduleIds`
- `reportingIds`
- `transactionBoundaries`
- `consistencyModels`
- `idempotencyRules`
- `rollbackStrategies`
- `compensationStrategies`
- `reconciliationRules`
- `closingPolicies`
- `postingPolicies`
- `settlementNotes`
- `auditTrailRequirements`
- `traceabilityRequirements`
- `states`
- `transitions`
- `exceptions`
- `integrityControls`
- `concurrencyRisks`
- `metrics`
- `processAlignment`
- `moduleAlignment`
- `reportingAlignment`
- `planningAlignment`
- `futureRuntimeStoreMigrationAlignment`
- `maturityNotes`
- `assumptions`
- `exclusions`
- `confidence`
- `advisoryOnly`
- `boundaries`

All fields are JSON-safe planning data.

## Transaction Boundaries

Transaction boundaries describe the review scope of a business operation. They
are metadata only.

They do not create database transactions, runtime transactions, locks, records,
queues, workers, or workflow nodes.

## Consistency And Idempotency

Consistency models describe review questions for future storage and runtime
design.

Idempotency rules describe duplicate-submission concerns as advisory metadata.
They do not create keys, records, queues, API behavior, retry behavior, or
transaction execution.

## Rollback And Compensation

Rollback and compensation strategies are metadata only. They capture review
questions for failed or reversed paths.

They do not execute rollback, write records, alter stores, dispatch actions, or
apply migrations.

## Reconciliation

Reconciliation rules describe assumptions and checkpoints for comparing
business state across process, module, and reporting views.

They are not financial correctness guarantees and do not calculate values.

## Closing Policies

Closing policies describe cut-off and close review expectations. They are
assumptions, not guarantees.

They do not close periods, write records, lock stores, or apply migrations.

## Posting And Settlement Notes

Posting policies and settlement notes are advisory metadata only.

They must not claim banking correctness, settlement correctness, financial
accuracy, tax correctness, or legal compliance.

## Audit Trail And Traceability

Audit trail and traceability requirements describe what should be reviewable in
a future implementation.

They do not create audit records, logs, stores, ledgers, permissions, or
runtime enforcement.

## States And Transitions

States describe transaction lifecycle positions such as initial, active,
review, exception, closed, and final.

Transitions describe allowed movement between known states. They are metadata
only and do not create executable workflow edges.

## Exceptions

Exceptions describe mismatch, cancellation, escalation, unresolved review, and
other exception paths.

Exception handling notes are advisory and must remain bounded and safe.

## Integrity Controls And Concurrency Risks

Integrity controls describe review concepts such as completeness, traceability,
authorization, segregation, and reconciliation.

Concurrency risks describe possible conflicts from simultaneous review or
future update paths. They do not create locks or runtime behavior.

## Transactional Metrics

Transactional metrics are advisory measurement ideas for review. They do not
inspect live data, calculate values, create reports, or feed dashboards.

## Alignment Notes

`processAlignment` links transactional states to process states, checkpoints,
handoffs, and exceptions.

`moduleAlignment` links transaction boundaries to module responsibilities.

`reportingAlignment` links transactional traceability to reporting and BI
metadata.

`planningAlignment` links transactional maturity, risk, and dependencies to
roadmap planning.

`futureRuntimeStoreMigrationAlignment` is future-only advisory metadata. It
does not wire into runtime, stores, migrations, locks, queues, workers, actions,
or automation.

## MVP Vs Enterprise Maturity

Each transactional model includes:

- MVP notes for a small reviewable transactional slice,
- enterprise notes for stronger reconciliation, traceability, approval
  checkpoints, and concurrency controls,
- deferred notes for behavior that remains out of scope.

Deferred notes keep runtime execution, DB writes, SQL, migrations, ledgers,
queues, workers, generated systems, and scaffold output outside this phase.

## Validation Rules

The validator checks:

- known transactional categories,
- required fields are present,
- arrays and text are bounded,
- ids are unique,
- transaction states have valid ids,
- transitions reference known states,
- at least one initial state exists,
- at least one final, closed, or review state exists,
- idempotency rules are advisory and include assumptions,
- rollback and compensation strategies are metadata only and not executable,
- reconciliation rules are assumption-based and advisory,
- closing policies are assumptions and not guarantees,
- posting policies and settlement notes do not claim financial correctness,
- audit trail and traceability requirements remain advisory metadata,
- `advisoryOnly` is true,
- all boundaries are true,
- forbidden SQL, schema, DB write, migration, transaction execution, provider,
  network, filesystem, command, store, action, proposal, approval, runtime,
  workflow, automation, queue, worker, ledger, scaffold, code, production,
  financial guarantee, and compliance guarantee wording is absent.

Findings use reason codes and safe messages only.

## Safety Boundaries

The Transactional Systems Layer is source-only and advisory.

It must not:

- call providers,
- use network,
- read files,
- write files,
- scan directories,
- execute commands,
- perform runtime behavior,
- mutate stores,
- dispatch actions,
- create proposals,
- execute approvals,
- execute workflows,
- execute automation,
- execute transactions,
- write databases,
- run SQL,
- create database schemas,
- apply migrations,
- generate SQL files,
- generate ledgers,
- generate queues or workers,
- scaffold applications,
- generate transactional systems,
- generate systems,
- modify code,
- claim production readiness,
- guarantee banking, financial, or compliance outcomes,
- make exact business or financial claims without explicit assumptions.

## Explicit Non-Goals

Phase 77I does not add:

- CLI commands,
- package scripts,
- filesystem scanning,
- artifact output,
- runtime execution,
- transaction execution,
- workflow execution,
- automation execution,
- DB writes,
- SQL execution,
- database schemas,
- migrations,
- generated SQL files,
- generated ledgers,
- generated queues or workers,
- generated transactional systems,
- store persistence,
- action or proposal behavior,
- approval execution,
- scaffold output,
- generated systems,
- banking or financial guarantees,
- compliance certification,
- production readiness claims.

## Separation From Existing Runtime Surfaces

Runtime, stores, jobs, actions, approvals, migrations, locks, automation,
quality, evals, snapshots, and artifacts already exist elsewhere.

This layer does not reuse or modify `src/actions/*`, `src/jobs/*`,
`src/automation/*`, `src/quality/*`, `src/evals/*`, runtime files, store files,
migration files, scripts, package scripts, workflows, artifacts, baselines, or
CI behavior.

## Relationship To Other Factory Lanes

The Business Systems Catalog provides family and module vocabulary.

The Requirements Interview Engine can ask sharper questions about transaction
boundaries, idempotency, reconciliation, closing, exceptions, and audit needs.

The Module Blueprint Generator can compare module responsibilities with
transaction boundaries and integrity controls.

The Estimation Planning Engine can use transactional maturity, risks,
dependencies, and exclusions as advisory planning inputs.

Business Process Modeling can compare process states, handoffs, approvals,
exceptions, and checkpoints with transactional states.

The BI / Reporting Layer can compare transactional traceability, metrics, and
reconciliation notes with reporting scope.

Enterprise UI Patterns can compare transactional states, exceptions,
reconciliation notes, audit checkpoints, and traceability requirements with
advisory review surfaces. UI pattern models do not execute transactions,
payments, approvals, workflows, or UI rendering.

Language and Framework Profiles may later add implementation assumptions after
review, but transactional models do not inspect code, choose stacks, or run
tools.

Future automation, dashboards, runtime, stores, migrations, and scaffold lanes
may consume reviewed transactional metadata only after separate approval gates.

## Future Phases

Possible future work:

1. Add richer family-specific transactional templates after review.
2. Add answer-to-transaction summary inputs after explicit answer modeling
   exists.
3. Add transaction-to-process/reporting comparison summaries for planning.
4. Add optional CLI inspection only after source helpers are stable.
5. Keep runtime/store integration, migrations, SQL, ledgers, queues, workers,
   generated systems, and scaffold behavior deferred.
