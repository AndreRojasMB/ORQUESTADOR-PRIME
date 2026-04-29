# Enterprise UI Patterns

Phase: 78I
Status: source-only advisory helper

## Purpose

Enterprise UI Patterns provides bounded source metadata for reviewable
enterprise interface patterns used by the Enterprise Software Factory.

It represents admin dashboards, advanced CRUD, master/detail views, data
tables, filters, workflow queues, approval inboxes, kanban boards,
calendar/scheduling views, POS UI, permission management, document management,
reporting/dashboard UI metadata, audit/traceability views, transaction review
views, process state views, accessibility recommendations, responsive notes,
state notes, risks, and alignment metadata.

It does not call providers, use network, read files, write files, scan
directories, execute commands, mutate stores, dispatch actions, create
proposals, execute approvals, execute workflows, execute automation, render UI,
generate components, generate screens, generate dashboards, generate routes,
include JSX/TSX/CSS/HTML snippets, implement a design system, scaffold
frontends, create database schemas, run SQL, generate systems, claim production
readiness, or guarantee accessibility compliance.

## Supported UI Pattern Templates

The first source registry includes advisory templates for:

- admin dashboard
- advanced CRUD
- master/detail
- data table and filters
- workflow queue
- approval inbox
- kanban board
- calendar/scheduling
- POS UI
- permission management panel
- document management
- reporting/dashboard UI
- audit/traceability view
- transaction review view
- process state view
- generic enterprise UI pattern

Templates are starter models, not delivered product screens. They must be
reviewed with product owners, operators, accessibility reviewers, and engineers
before any implementation planning.

## UI Pattern Model Shape

`UiPatternModel` includes:

- `uiPatternId`
- `schemaVersion`
- `category`
- `name`
- `purpose`
- `familyId`
- `moduleIds`
- `processIds`
- `reportingIds`
- `transactionIds`
- `planningIds`
- `frameworkIds`
- `screens`
- `layoutRegions`
- `navigationPatterns`
- `interactionPatterns`
- `dataDisplayPatterns`
- `forms`
- `tables`
- `filters`
- `workflowPatterns`
- `permissionPatterns`
- `documentPatterns`
- `reportingPatterns`
- `accessibilityNotes`
- `responsiveNotes`
- `stateNotes`
- `risks`
- `moduleAlignment`
- `processAlignment`
- `reportingAlignment`
- `transactionAlignment`
- `planningAlignment`
- `frameworkAlignment`
- `maturityNotes`
- `assumptions`
- `exclusions`
- `confidence`
- `advisoryOnly`
- `boundaries`

All fields are JSON-safe planning data.

## Screens, Layout, Navigation, And Interaction

Screens describe intended review surfaces and role visibility. Layout regions
describe information priority and responsive concerns. Navigation and
interaction patterns describe review paths, feedback, and state expectations.

These entries are descriptions only. They do not create visible UI, routes, or
frontend files.

## Tables, Filters, Forms, And CRUD

Table, filter, form, and CRUD patterns describe list views, detail review,
validation messaging, search, sort, saved filters, pagination, empty states,
loading states, and error states.

They are advisory metadata only. They do not create forms, components, screens,
or style rules.

## Workflow And Approval UI

Workflow queues and approval inboxes describe ownership, state, review, and
escalation visibility.

They do not execute workflows, execute automation, approve, reject, mutate
stores, dispatch actions, or create proposal records.

## Permission UI

Permission management patterns describe role and access visibility for review.

They do not enforce access, grant permissions, revoke permissions, change
roles, or mutate stores.

## Document Management UI

Document management patterns describe folders, metadata, review status,
retention notes, and evidence references.

They do not store files, index documents, enforce retention, or manage access.

## Reporting And Dashboard UI

Reporting/dashboard UI patterns describe placement of metrics, charts, tables,
and stakeholder summaries as metadata.

They do not generate dashboards, execute BI tools, create dashboard artifacts,
run reports, run SQL, or create analytical schemas.

## Audit, Traceability, And Transaction Review

Audit/traceability views describe timelines, checkpoints, owners, and evidence
metadata.

Transaction review views describe boundaries, exceptions, reconciliation
questions, and review status. They do not execute transactions, payments,
posting, settlement, or record mutation.

## Accessibility And Responsive Notes

Accessibility entries are recommendations only. They can describe focus,
labels, keyboard review paths, contrast review, and status clarity, but they
must not claim certification or guaranteed compliance.

Responsive notes describe planning assumptions for small screens and dense
data. They are not rendered behavior.

## Alignment Notes

`moduleAlignment` links UI patterns to module blueprint responsibilities.

`processAlignment` links UI patterns to process states, handoffs, checkpoints,
and exceptions.

`reportingAlignment` links UI patterns to reporting metadata and stakeholder
views.

`transactionAlignment` links UI patterns to transactional checkpoints,
exceptions, traceability, and review surfaces.

`planningAlignment` links UI complexity, maturity, and risks to roadmap
planning.

`frameworkAlignment` is future-only advisory metadata for later framework and
design-system planning.

## MVP Vs Enterprise Maturity

Each UI pattern model includes:

- MVP notes for a small reviewable interface slice,
- enterprise notes for role-aware views, traceability, and richer states,
- deferred notes for behavior that remains out of scope.

Deferred notes keep UI rendering, routes, visual assets, design-system
implementation, frontend scaffolding, runtime behavior, generated systems, and
dashboard/control center work outside this phase.

## Validation Rules

The validator checks:

- known UI pattern categories,
- required fields are present,
- arrays and text are bounded,
- ids are unique,
- `advisoryOnly` is true,
- all boundaries are true,
- alignment entries remain metadata only,
- accessibility notes are recommendations, not guarantees,
- responsive notes are advisory, not rendered behavior,
- workflow UI entries do not imply workflow behavior,
- approval UI entries do not imply approval behavior,
- permission UI entries do not enforce permissions,
- reporting UI entries do not create dashboard assets,
- forbidden JSX, TSX, CSS, HTML, SQL, schema, provider, network, filesystem,
  command, store, action, proposal, runtime, workflow, automation, approval,
  permission enforcement, transaction, payment, dashboard, route, component,
  scaffold, production, and accessibility guarantee wording is absent.

Findings use reason codes and safe messages only.

## Safety Boundaries

Enterprise UI Patterns is source-only and advisory.

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
- render UI,
- generate components,
- generate screens,
- generate dashboards,
- generate routes,
- include JSX/TSX/CSS/HTML snippets,
- implement CSS or a design system,
- scaffold frontends,
- create database schemas,
- run SQL,
- generate systems,
- claim production readiness,
- guarantee accessibility compliance.

## Explicit Non-Goals

Phase 78I does not add:

- CLI commands,
- package scripts,
- filesystem scanning,
- artifact output,
- runtime execution,
- UI rendering,
- generated components,
- generated screens,
- generated dashboards,
- generated routes,
- JSX/TSX/CSS/HTML snippets,
- CSS or design-system implementation,
- frontend scaffolding,
- workflow or automation execution,
- approval execution,
- permission enforcement,
- transaction or payment execution,
- database schemas,
- SQL,
- generated systems,
- production readiness claims,
- accessibility compliance guarantees.

## Separation From Existing UI And Dashboard Surfaces

The existing UX/UI agent and UX audit prompt are provider and prompt surfaces.
This source layer does not import, mutate, or wire into them.

The existing scaffold prompt and scaffold templates can describe runnable
projects. This source layer does not import, mutate, or wire into scaffold
surfaces.

Existing quality dashboard data, evals, snapshots, artifacts, and CI
observability are not Enterprise UI Patterns. This source layer does not reuse
or modify those surfaces.

Future dashboard/control center work is a separate runtime/UI lane.

## Relationship To Other Factory Lanes

The Business Systems Catalog can provide family-level UI vocabulary.

The Requirements Interview Engine can collect UX/workflow questions for later
review.

The Module Blueprint Generator can compare module responsibilities with UI
surface needs.

Business Process Modeling can align process states, handoffs, queues, and
approval checkpoints with UI metadata.

The BI / Reporting Layer can align reporting metadata with dashboard-like
placement notes without creating dashboards.

The Transactional Systems Layer can align traceability, exception, and review
surfaces with transactional metadata.

The Estimation Planning Engine can use UI pattern complexity, risks, and
maturity notes as roadmap inputs.

Language and Framework Profiles can later provide implementation assumptions,
but this phase does not implement any UI stack.
