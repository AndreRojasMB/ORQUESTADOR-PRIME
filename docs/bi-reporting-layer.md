# BI / Reporting Layer

Phase: 76I
Status: source-only advisory helper

## Purpose

The BI / Reporting Layer provides bounded source metadata for enterprise
reporting concepts used by the Enterprise Software Factory.

It represents KPIs, metrics, dashboard definitions, report definitions,
analytical datasets, dimensions, measures, freshness assumptions, quality
checks, ETL/ELT notes, warehouse/datamart notes, consumers, permissions, risks,
and alignment notes for later human review.

It does not call providers, use network, read files, write files, scan
directories, execute commands, mutate stores, dispatch actions, create
proposals, execute workflows, execute automation, execute reports, execute
dashboards, run ETL, call BI tool APIs, run SQL, create database schemas,
generate dashboards, generate SQL files, generate ETL jobs, scaffold
applications, generate systems, claim production readiness, guarantee
compliance, or make exact business or financial claims without assumptions.

## Supported Reporting Templates

The first source registry includes advisory templates for:

- executive dashboard reporting
- sales reporting
- procurement reporting
- inventory reporting
- maintenance/work-order reporting
- incident/support reporting
- finance/closing reporting
- access/security reporting
- process performance reporting
- generic reporting

Templates are starter models, not complete BI architecture. They must be
reviewed with business owners, process owners, data owners, and report
consumers before implementation planning.

## Reporting Model Shape

`ReportingLayerModel` includes:

- `reportingId`
- `schemaVersion`
- `category`
- `name`
- `purpose`
- `familyId`
- `processIds`
- `moduleIds`
- `kpis`
- `metrics`
- `dashboards`
- `reports`
- `sections`
- `visualizations`
- `datasets`
- `dimensions`
- `measures`
- `freshnessAssumptions`
- `dataQualityChecks`
- `etlNotes`
- `warehouseNotes`
- `consumers`
- `permissions`
- `risks`
- `processAlignment`
- `moduleAlignment`
- `planningAlignment`
- `futureBiToolAlignment`
- `maturityNotes`
- `assumptions`
- `exclusions`
- `confidence`
- `advisoryOnly`
- `boundaries`

All fields are JSON-safe planning data.

## KPIs And Metrics

KPIs and metrics are reviewable definitions only. Each KPI and metric must
include assumptions and calculation notes.

The layer does not produce values, exact financial claims, guaranteed business
outcomes, or commercial commitments.

## Dashboard And Report Metadata

Dashboards and reports are metadata only. They describe intended consumers,
sections, visualizations, and access context.

They do not create dashboard files, report files, BI tool payloads, embedded
views, runtime endpoints, or refresh jobs.

## Sections And Visualizations

Sections group KPIs, metrics, and visualization descriptions.

Visualizations are descriptions only. They may describe a scorecard, table,
trend, matrix, funnel, heatmap, or summary concept, but they do not render UI or
create dashboard artifacts.

## Analytical Datasets, Dimensions, And Measures

Datasets, dimensions, and measures are analytical metadata only.

They do not define warehouse schemas, datamart schemas, database tables, SQL
queries, migrations, indexes, materialized views, or physical storage.

## Freshness And Quality

Freshness entries are assumptions, not guarantees. They describe expected review
questions about data timing and owner expectations.

Quality checks are advisory summaries. They do not inspect data, connect to
systems, or run tests.

## ETL/ELT And Warehouse Notes

ETL/ELT notes describe future planning concerns such as source ownership,
lineage, transformation review, and refresh coordination.

Warehouse/datamart notes describe future analytical modeling concerns. They are
not schemas and do not create jobs.

## Consumers And Permissions

Consumers describe stakeholders who may review or use reports.

Report permissions are advisory access metadata only. They do not enforce
access, change roles, grant permissions, revoke permissions, or modify stores.

## Risks

Reporting risks cover definition drift, missing data ownership, stale data,
misleading metrics, inappropriate access, and premature BI tool integration.

Risks should include safe mitigations and should not claim compliance or
security certification.

## Alignment Notes

`processAlignment` links reporting metadata to process checkpoints, handoffs,
metrics, and exceptions.

`moduleAlignment` links reporting metadata to module blueprint reports,
permissions, and responsibilities.

`planningAlignment` links reporting maturity, risks, and dependencies to
roadmap and rollout planning.

`futureBiToolAlignment` is future-only advisory metadata for Power BI,
Metabase, Superset, or similar tools. It does not call those tools or create
their assets.

## MVP Vs Enterprise Maturity

Each reporting model includes:

- MVP notes for a small reviewable reporting slice,
- enterprise notes for governed definitions, ownership, freshness, and access
  review,
- deferred notes for behavior that remains out of scope.

Deferred notes keep BI tool integration, generated dashboards, generated SQL,
ETL jobs, analytical schemas, runtime behavior, and scaffold output outside this
phase.

## Validation Rules

The validator checks:

- known reporting categories,
- required fields are present,
- arrays and text are bounded,
- ids are unique,
- KPI assumptions and calculation notes exist,
- metric assumptions and calculation notes exist,
- dashboards and reports remain metadata only,
- visualizations remain descriptions only,
- datasets, dimensions, and measures remain metadata only,
- freshness entries are assumption-based,
- quality checks remain advisory,
- ETL notes are advisory and not executable,
- warehouse/datamart notes are advisory and not schemas,
- report permissions are advisory metadata only,
- `advisoryOnly` is true,
- all boundaries are true,
- forbidden report, dashboard, ETL, BI API, SQL, provider, network,
  filesystem, command, store, action, proposal, runtime, workflow, automation,
  scaffold, schema, code, production, and compliance guarantee wording is
  absent.

Findings use reason codes and safe messages only.

## Safety Boundaries

The BI / Reporting Layer is source-only and advisory.

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
- execute workflows,
- execute automation,
- execute reports,
- execute dashboards,
- run ETL,
- call BI tool APIs,
- run SQL,
- create database schemas,
- generate dashboards,
- generate SQL files,
- generate ETL jobs,
- scaffold applications,
- generate systems,
- modify code,
- claim production readiness,
- guarantee compliance,
- make exact business or financial claims without explicit assumptions.

## Explicit Non-Goals

Phase 76I does not add:

- CLI commands,
- package scripts,
- filesystem scanning,
- artifact output,
- dashboard UI,
- report execution,
- dashboard execution,
- ETL execution,
- BI tool integration,
- SQL execution,
- database schemas,
- generated dashboards,
- generated SQL files,
- generated ETL jobs,
- runtime execution,
- store persistence,
- scaffold output,
- generated systems,
- compliance certification,
- production readiness claims.

## Separation From Quality And Eval Reporting

Existing quality reports, quality dashboard data, evals, snapshots, redacted
artifacts, and CI observability are not enterprise BI.

This layer does not reuse or modify `src/quality/*`, `src/evals/*`, quality
scripts, eval scripts, artifacts, baselines, CI behavior, or package scripts.

## Relationship To Other Factory Lanes

The Business Systems Catalog provides family and report vocabulary.

The Requirements Interview Engine can ask sharper questions about KPIs,
consumers, permissions, freshness, quality, and report ownership.

The Module Blueprint Generator can compare module reports and permissions with
reporting model scope.

The Estimation Planning Engine can use reporting maturity, risks, dependencies,
and exclusions as advisory planning inputs.

Business Process Modeling can provide checkpoints, handoffs, exceptions, SLA
assumptions, and process metrics that reporting models can reference.

The Transactional Systems Layer can provide traceability, reconciliation,
posting/settlement review notes, integrity controls, and transactional metrics
that reporting models can compare against. Transactional models remain
source-only metadata and do not execute transactions, write databases, run SQL,
create ledgers, or generate queues and workers.

Language and Framework Profiles may later add implementation assumptions after
review, but reporting models do not inspect code, choose stacks, or run tools.

Enterprise UI Patterns can compare reporting definitions, consumers,
permissions, and visualization placement with advisory dashboard-like UI
metadata. UI pattern models do not generate dashboards, execute BI tools, or
render screens.

Future automation, dashboards, external BI tools, and scaffold lanes may
consume reviewed reporting metadata only after separate approval gates.

## Future Phases

Possible future work:

1. Add richer family-specific reporting templates after review.
2. Add answer-to-reporting summary inputs after explicit answer modeling exists.
3. Add reporting comparison summaries for planning.
4. Add optional CLI inspection only after source helpers are stable.
5. Keep BI tool integration, generated dashboards, SQL, ETL jobs, schemas, and
   runtime behavior deferred.
