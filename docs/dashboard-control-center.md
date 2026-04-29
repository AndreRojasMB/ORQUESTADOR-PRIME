# Dashboard / Control Center

Phase: 81I-DASHBOARD-CONTROL-CENTER
Status: docs-only/spec-only

Phase 81I is docs-only and spec-only. It does not implement a dashboard app,
does not add source files or TypeScript files, does not modify the existing
`dashboard/` app, and does not add routes, components, server actions, APIs,
auth, runtime controls, or operator actions. It does not make
ORQUESTADOR-PRIME production-ready. This document defines a safe future
read-only-first Dashboard / Control Center architecture.

## A. Purpose

The Dashboard / Control Center exists to give operators a single place to
understand ORQUESTADOR-PRIME status without creating hidden autonomy.

Future operator visibility should include quality artifacts, eval and risk
signals, runtime and config doctor output, automation validation and dry-run
summaries, jobs and notifications, proposal and approval metadata, redacted
memory and learning summaries, workspace context, factory metadata, and runtime
maturity specs.

This phase is architecture/spec only. It creates no app, no backend, no
operator controls, and no execution path.

## B. Current Dashboard/Control-Center Baseline

A tracked `dashboard/` Next app already exists in the repository.

Current dashboard code can read local ORQUESTADOR data. In particular,
`dashboard/lib/data.ts` reads local stores and also exposes config write
capability through `writeConfig`. `dashboard/app/config/actions.ts` contains a
server action that can persist config changes.

Quality dashboard data exists as advisory JSON and CI artifact-style data, not
as a full operator UI. Runtime and config doctor surfaces are read-only and
privacy-aware. Jobs, actions, proposals, and approvals are live-adjacent and
must not be wired casually into UI controls. Native automation remains
validation, dry-run, and trace only. Factory metadata lanes remain
source-only/advisory.

## C. Current Readiness Gaps

Current gaps before a safe control center can be implemented:

- no safe unified read-only dashboard/control-center architecture,
- no auth or authorization model,
- no redaction enforcement layer for dashboard views,
- no safe operator-control boundary,
- no read-only artifact manifest strategy,
- no reconciled policy for existing config-writing dashboard paths,
- no runtime API maturity for safe controls,
- no automation execution maturity,
- no safe approval/action execution bridge for UI controls.

## D. Read-Only-First Dashboard Strategy

The first safe path is specs and later static/read-only artifact viewers.

Future dashboard work should prefer redacted artifacts and explicit read-only
summaries. It should avoid direct raw store reads unless a later redaction and
permission layer exists. All mutation and control surfaces are future-only.

Read-only views should explain status, provenance, freshness, privacy status,
and recommended human review without triggering changes.

## E. CI Artifact Viewer Strategy

A future CI artifact viewer should consume redacted uploaded JSON artifacts
only.

It must not mutate artifacts, update CI workflows, regenerate reports, or
recalculate gates. Artifact paths, retention, and provenance should be displayed
as metadata. Missing artifacts should produce safe empty or unavailable states.

## F. Quality/Eval/Risk Viewer Strategy

Future views may summarize quality reports, quality snapshots, eval outputs,
quality gates, and risk signals.

They must not recalculate gates, mutate baselines, modify CI, create approvals,
or dispatch actions. Quality and risk outputs remain advisory signals for human
review unless a later explicit gate phase says otherwise.

## G. Runtime/Config Doctor Viewer Strategy

Runtime and config doctor views should display doctor output only.

They must never repair stores, mutate config, write files, apply runtime
changes, create locks, or run migrations. Config writes are out of scope until
auth, operator controls, audit, redaction, and permission boundaries are
designed and implemented in a later phase.

## H. Automation Validation/Dry-Run Viewer Strategy

Automation views may later show workflow validation, dry-run, trace, risk, and
unsupported-feature summaries.

They must not persist workflows, execute automation, enable triggers, create
webhook listeners, start schedulers, invoke connectors, access credentials, or
bridge into action/proposal/approval execution.

## I. Jobs/Notifications Viewer Strategy

Jobs and notifications may later appear as read-only status and local inbox
views.

These views must not run jobs, deliver notifications, activate a scheduler,
start workers, mutate queues, retry blocked work, or bypass dangerous job
blocking. Notification delivery remains future-only and permission-gated.

## J. Approvals/Proposals Viewer Strategy

Approvals and proposals may later be visible as review metadata only.

The control center must not approve, reject, grant second approval, consume
second approval, dispatch actions, create proposals, mutate proposal
parameters, or expose raw sensitive proposal data in Phase 81I or in any
read-only-first viewer.

## K. Memory/Learning Viewer Strategy

Memory and learning views should use redacted summaries only.

Raw prompts, raw identities, credentials, provider output, and sensitive
payloads should not be shown by default. Future raw-detail views must be
opt-in, permission-gated, audited, and redacted. The viewer must not write
memory, export learning data with mutation semantics, or mutate stores.

## L. Workspace/Project Viewer Strategy

Workspace and project views may later summarize project metadata, roadmap
items, decisions, risks, context maps, linked docs, and relevant trace IDs.

The initial strategy is read-only summaries. No workspace initialization,
roadmap mutation, decision append, context-map write, or project store mutation
belongs in this phase.

## M. Factory Metadata Viewer Strategy

Future read-only views may include:

- Business Systems Catalog,
- Module Blueprint Generator,
- Requirements Interview Engine,
- Estimation / Planning Engine,
- Language Profiles,
- Framework Profiles,
- Business Process Modeling,
- BI / Reporting Layer,
- Transactional Systems Layer,
- Enterprise UI Patterns.

These are advisory metadata views only. They must not scaffold apps, generate
systems, create database schemas, create runtime tasks, or execute workflows.

## N. Runtime Maturity/Spec Viewer

The control center may later display runtime deeper specs, automation deeper
specs, maturity stages, health summaries, and readiness gaps.

It must not implement a runtime server, API, worker, queue, scheduler, repair
mode, migration apply path, backup/restore behavior, auth enforcement, or
operator controls.

## O. Operator Controls Future Strategy

Future controls may include:

- pause workers,
- block queues,
- inspect locks,
- review migration plans,
- disable automation triggers,
- review approvals,
- inspect redacted audit trails.

These controls require auth/authorization, approval gates, audit logging, rate
limits, runtime maturity, redaction enforcement, and explicit operator
permissions first.

There are no operator controls in Phase 81I.

## P. Data Source And Artifact Access Strategy

Future data access should prefer redacted CI artifacts, explicit summary files,
and read-only doctor outputs.

Direct store reads require a later policy covering redaction, permissions,
freshness, provenance, missing-file behavior, unsafe raw values, and failure
modes. Existing config-writing dashboard paths need a separate safety pass
before they are considered part of a future control center.

## Q. Redaction/Privacy Model

Future views should redact:

- secrets,
- provider keys and tokens,
- raw prompts unless explicitly allowed,
- credentials and connector payloads,
- raw channel identities,
- personal or sensitive data,
- raw proposal parameters,
- raw execution output,
- raw store payloads that have not passed a redaction policy.

The default view should show summaries before raw detail. Raw views, if ever
added, should be opt-in, permission-gated, audited, and bounded.

## R. Auth/Permission Future Strategy

Mutation surfaces must be default-deny.

The first future role should be read-only. Operator/admin roles can be designed
later after runtime maturity, redaction enforcement, audit logging, approval
gates, and rate limits exist.

Phase 81I implements no auth and no permission enforcement.

## S. Control Center Maturity Stages

Recommended maturity path:

1. Docs-only control center strategy.
2. Local read-only artifact viewer.
3. Quality/eval/risk viewer.
4. Runtime/config status viewer.
5. Automation validation/dry-run viewer.
6. Operator review dashboard.
7. Approval inbox future, read-only first.
8. Memory/learning future, redacted summaries only.
9. Workspace/factory viewer future.
10. Gated operator controls future.
11. Authenticated enterprise control center future.

## T. Integration Plan

Future integration should align with:

- Production Runtime Deeper,
- Native Automation Engine Deeper,
- jobs and notifications,
- action/proposal/approval system,
- quality, evals, and risk,
- store, migrations, and locks,
- runtime/config doctor,
- workspace manager,
- memory and learning,
- factory advisory metadata lanes,
- Enterprise UI Patterns,
- connectors and credentials,
- deployment and productization.

Integration should start with read-only summaries and redacted artifacts before
any direct store reads or operator controls.

## U. Safety Boundaries / Non-Goals

Phase 81I has these non-goals:

- no provider calls,
- no network,
- no command execution,
- no source files,
- no TypeScript files,
- no filesystem mutation,
- no artifact mutation,
- no config writes,
- no memory or store mutation,
- no job, action, proposal, or approval execution,
- no automation execution,
- no workflow persistence,
- no scheduler, worker, or queue implementation,
- no server or API implementation,
- no dashboard app implementation,
- no UI component or route generation,
- no package, workflow, or CI changes,
- no DB schemas or SQL,
- no auth implementation,
- no production-ready claims,
- no security or compliance guarantees.

## V. Future Source Candidates

Future source-only planning metadata may eventually live in:

- `src/controlCenter/planning/types.ts`
- `src/controlCenter/planning/controlCenterPlanTemplates.ts`
- `src/controlCenter/planning/controlCenterPlanValidator.ts`
- `src/controlCenter/planning/controlCenterPlanBuilder.ts`

These files are future candidates only. They are not implemented in Phase 81I.

Future type candidates:

- `ControlCenterSchemaVersion`
- `ControlCenterCapability`
- `ControlCenterBoundarySet`
- `ControlCenterView`
- `ControlCenterDataSource`
- `ControlCenterArtifactSource`
- `ControlCenterRedactionRule`
- `ControlCenterPermissionModel`
- `ControlCenterOperatorControl`
- `ControlCenterRuntimeView`
- `ControlCenterAutomationView`
- `ControlCenterQualityView`
- `ControlCenterApprovalView`
- `ControlCenterMemoryView`
- `ControlCenterWorkspaceView`
- `ControlCenterFactoryView`
- `ControlCenterRisk`
- `ControlCenterMaturityPlan`
- `ControlCenterValidationFinding`
- `ControlCenterValidationResult`

## W. Future Validation Strategy

Future source metadata should validate:

- bounded planning fields and text,
- `advisoryOnly` is true,
- all safety boundaries are true,
- data sources are marked read-only plans,
- artifact sources are marked read-only references,
- operator controls are marked future-only,
- redaction rules are strategy until implemented,
- auth and permissions are strategy only,
- no secret exposure,
- no provider, network, filesystem write, action, store, runtime, or automation
  execution wording,
- no production, security, or compliance guarantees.

## Safe Self-Improvement Relationship

The deeper safe self-improvement path is documented in
[Safe self-improvement deeper](safe-self-improvement-deeper.md). Future
control-center views may show redacted self-improvement findings, proposal
summaries, risk levels, review status, and eval comparison plans, but those
views must remain read-only until a later explicit guarded phase.

## Baseline / Strict CI Maturation

A future read-only control center may display baseline status, comparison
results, strict CI maturity stage, and reviewer notes. The governance path is
documented in
[Baseline / Strict CI maturation](baseline-strict-ci-maturation.md). Phase 83I
does not implement dashboard views or operator controls.

## Integrations / Connectors Relationship

The future connector governance path is documented in
[Integrations / Connectors](integrations-connectors.md). A later control center
may show read-only connector inventory, risk, permission, credential
requirement, and audit summaries, but Phase 84I adds no dashboard behavior.

## Productization / Release Path

The future productization path is documented in
[Productization / Release Path](productization-release-path.md). A later control
center may show read-only release status, maturity stage, checklist state, and
artifact policy summaries, but Phase 85I adds no release controls and no
dashboard behavior.
