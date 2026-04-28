# Business Process Modeling

Phase: 75I
Status: source-only advisory helper

## Purpose

Business Process Modeling provides bounded source metadata for enterprise
processes used by the Enterprise Software Factory.

It represents roles, actors, states, transitions, approvals, business rules, SLA
assumptions, exceptions, events, handoffs, checkpoints, metrics, risks, and
alignment notes for later human review.

It does not call providers, use network, read files, write files, scan
directories, execute commands, mutate stores, dispatch actions, create
proposals, execute workflows, execute automation, execute approvals, scaffold
applications, create database schemas, generate systems, render BPMN, export
BPMN, claim production readiness, or guarantee compliance.

## Supported Process Templates

The first source registry includes advisory templates for:

- sales order flow
- purchase/procurement flow
- inventory movement flow
- maintenance/work-order flow
- incident/ticket flow
- user/access request flow
- approval flow
- reporting/closing flow
- generic process flow

Templates are starter models, not complete domain expertise. They must be
reviewed with process owners before implementation planning.

## Process Model Shape

`BusinessProcessModel` includes:

- `processId`
- `schemaVersion`
- `category`
- `name`
- `purpose`
- `familyId`
- `moduleIds`
- `roles`
- `actors`
- `states`
- `transitions`
- `approvals`
- `rules`
- `slaAssumptions`
- `exceptions`
- `events`
- `handoffs`
- `checkpoints`
- `metrics`
- `risks`
- `moduleAlignment`
- `planningAlignment`
- `automationAlignment`
- `maturityNotes`
- `assumptions`
- `exclusions`
- `confidence`
- `advisoryOnly`
- `boundaries`

All fields are JSON-safe planning data.

## Roles And Actors

Roles describe responsibility and decision rights. Actors reference roles and
describe people, teams, or external participants represented in the process.

Approvals and handoffs must reference known roles or actors. Unknown references
fail validation.

## States And Transitions

States describe process positions such as initial, active, waiting, exception,
and final.

Transitions describe allowed movement between known states. They include
triggers and guardrails, but they do not create executable workflow edges.

## Approvals

Approvals are preview metadata only. They model review checkpoints, responsible
roles, and relevant transitions.

They do not approve, reject, create records, dispatch actions, or execute any
approval behavior.

## Business Rules

Rules are bounded summaries used for review. They should clarify decision
criteria, completeness checks, exception routing, or closure criteria.

Rules are not code, policy certification, or executable logic.

## SLA Assumptions

SLA entries are assumptions, not guarantees. They describe expected business
windows and escalation notes for later stakeholder review.

Validation rejects guarantee wording.

## Exceptions, Events, And Handoffs

Exceptions describe safe handling notes and risk level.

Events describe important process moments. Handoffs describe responsibility
transfer between roles and connect to checkpoints.

These are metadata only. They do not deliver notifications, write records, or
trigger automation.

## Checkpoints, Metrics, And Risks

Checkpoints capture audit or review notes. Metrics describe advisory
measurement ideas. Risks describe likely process failure modes and mitigations.

They support later planning and reporting work, but do not create dashboards or
runtime telemetry.

## Alignment Notes

`moduleAlignment` links process context to future module blueprint review.

`planningAlignment` links process context to roadmap, dependency, risk, and
MVP/enterprise planning.

`automationAlignment` is future-only advisory metadata. It must not create
automation workflows, workflow JSON, scheduler behavior, webhooks, connector
calls, action dispatch, notification delivery, approval records, or proposal
records.

## MVP Vs Enterprise Maturity

Each process model includes:

- MVP notes for the smallest reviewable process slice,
- enterprise notes for richer controls and reporting,
- deferred notes for behavior that remains out of scope.

Deferred notes keep runtime, connector, scaffold, schema, and generated-system
behavior outside this phase.

## Validation Rules

The validator checks:

- known process categories,
- required fields are present,
- arrays and text are bounded,
- `advisoryOnly` is true,
- all boundaries are true,
- role, actor, state, transition, and approval ids are unique,
- transitions reference known states,
- at least one initial state exists,
- at least one final state exists,
- actors reference known roles,
- approvals reference known roles, actors, and transitions,
- handoffs reference known roles,
- SLA entries are assumption-based,
- exceptions include safe handling notes,
- metrics remain advisory,
- alignment entries remain metadata only,
- forbidden execution, provider, network, filesystem, store, action, proposal,
  scaffold, database schema, code, production, and compliance guarantee wording
  is absent.

Findings use reason codes and safe messages only.

## Safety Boundaries

Business Process Modeling is source-only and advisory.

It must not:

- call providers,
- use network,
- read files,
- write files,
- execute commands,
- perform runtime behavior,
- mutate stores,
- dispatch actions,
- create proposals,
- execute workflows,
- execute automation,
- execute approvals,
- scaffold applications,
- create database schemas,
- generate systems,
- modify code,
- render or export BPMN,
- claim production readiness,
- guarantee compliance.

## Explicit Non-Goals

Phase 75I does not add:

- CLI commands,
- package scripts,
- filesystem scanning,
- artifact output,
- BPMN rendering,
- BPMN export,
- workflow execution,
- automation execution,
- approval execution,
- runtime execution,
- store persistence,
- dashboard UI,
- database schemas,
- scaffold output,
- generated systems,
- compliance certification,
- production readiness claims.

## Relationship To Other Factory Lanes

The Business Systems Catalog provides family vocabulary.

The Requirements Interview Engine can use process models to ask sharper
workflow, exception, handoff, and SLA questions.

The Module Blueprint Generator can compare modules with process states,
handoffs, permissions, reports, and audit checkpoints.

The Estimation Planning Engine can use process risks, handoffs, maturity notes,
and dependencies as advisory planning inputs.

Language and Framework Profiles may later add tooling assumptions for reviewed
implementation phases, but process models do not inspect code or choose stacks.

The BI / Reporting Layer can compare process checkpoints, handoffs,
exceptions, SLA assumptions, and metrics with reporting model scope. Reporting
models remain source-only metadata and do not execute reports, run ETL, call BI
tools, create SQL, or generate dashboards.

Future transactional systems, enterprise UI patterns, automation, dashboards,
and scaffold lanes may consume reviewed process models only after separate
approval gates.

## Future Phases

Possible future work:

1. Add answer-to-process summary inputs after explicit answer modeling exists.
2. Add richer family-specific process templates after review.
3. Add process comparison reports for planning.
4. Add optional CLI inspection only after source helpers are stable.
5. Keep BPMN rendering, runtime integration, and scaffold behavior deferred.
