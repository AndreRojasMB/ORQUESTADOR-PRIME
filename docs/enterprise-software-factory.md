# Enterprise Software Factory

Phase: 68I
Status: specification only

## Purpose

This document is a specification only.

It defines the future Enterprise Software Factory layer for ORQUESTADOR-PRIME:
a macro-planning layer for serious business systems such as ERP, CRM, POS, BI,
BPM, CMS, HRMS/HRIS, SCM, LMS, e-commerce, inventory, accounting, document
management, and project management platforms.

This phase does not generate systems, scaffold applications, create database
schemas, run code, deploy software, or execute workflows. It does not scaffold
and does not run code or deploy. It defines future reviewable planning artifacts
only.

## Current State

ORQUESTADOR-PRIME currently has:

- advisory quality and CI signals,
- active redacted quality artifacts,
- runtime foundation documentation,
- a read-only runtime doctor,
- isolated lock primitives that are not integrated into workflow execution,
- a read-only migration planner,
- native automation schema, validation, dry-run, and trace reporting,
- business systems catalog source metadata and pure validation,
- module blueprint generator source helper and pure validation,
- requirements interview source question bank, planner, and validation,
- estimation planning source helper and pure validation,
- language profiles source metadata, resolver, and pure validation,
- framework profiles source metadata, resolver, and pure validation,
- business process modeling source templates, builder, and validation,
- BI/reporting layer source templates, builder, and validation,
- transactional systems layer source templates, builder, and validation,
- enterprise UI patterns source templates, builder, and validation.

The Enterprise Software Factory is still missing as a generator/runtime layer.
The catalog, module blueprint helper, and interview planner are advisory and
data-only. No CLI, enterprise system generation, scaffolding, database schema
generation, or runtime execution exists yet. Existing scaffold and execute modes
are legacy CLI surfaces and are not part of this phase.

Catalog details live in
[Business systems catalog](business-systems-catalog.md).
Module blueprint details live in
[Module blueprint generator](module-blueprint-generator.md).
Requirements interview details live in
[Requirements interview engine](requirements-interview-engine.md).
Estimation planning details live in
[Estimation planning engine](estimation-planning-engine.md).
Language profile details live in
[Language profiles](language-profiles.md).
Framework profile details live in
[Framework profiles](framework-profiles.md).
Business process modeling details live in
[Business process modeling](business-process-modeling.md).
BI/reporting layer details live in
[BI reporting layer](bi-reporting-layer.md).
Transactional systems layer details live in
[Transactional systems layer](transactional-systems-layer.md).
Enterprise UI pattern details live in
[Enterprise UI patterns](enterprise-ui-patterns.md).
The future runtime maturity path lives in
[Production runtime deeper](production-runtime-deeper.md).

The next future lane can plan answer summaries, commercial proposal support,
richer family-specific templates, transaction-to-planning integration,
reporting-to-planning integration, process-to-blueprint integration, runtime
maturity, or dashboard/control center foundations.

## Factory Objective

The future factory should:

- understand enterprise domains,
- map business system families,
- generate architecture blueprints,
- generate module blueprints,
- generate process models,
- generate backlogs and roadmaps,
- generate implementation plans,
- plan safe scaffolding later,
- support multi-language and framework profiles later.

All factory outputs should be advisory, bounded, assumption-explicit, and human
reviewable before any implementation or scaffold step.

## Business System Family Taxonomy

Future supported families:

- MVC systems
- ERP
- CRM
- POS
- BI
- BPM
- CMS
- HRMS / HRIS
- SCM
- LMS
- e-commerce
- inventory
- accounting / billing
- document management
- project management systems

Each future family entry should define:

- `familyId`
- `name`
- `purpose`
- `typicalActors`
- `coreModules`
- `entities`
- `workflows`
- `permissions`
- `reports`
- `integrations`
- `complianceAndAuditConcerns`
- `dataModelPatterns`
- `uiPatterns`
- `deploymentNotes`

Family definitions should be treated as planning metadata, not generated system
code or database definitions.

## Enterprise Factory Pipeline

Future pipeline:

1. Requirement interview
2. Domain extraction
3. System family selection
4. Architecture selection
5. Module blueprint generation
6. Data model planning
7. Process modeling
8. UI pattern selection
9. API and integration mapping
10. Test strategy
11. Deployment plan
12. Implementation roadmap
13. Optional scaffold later

The optional scaffold step requires a later approved phase. It is not enabled by
this specification.

## Blueprint Output Contracts

Future contracts should be JSON-safe and reviewable.

`EnterpriseSystemBlueprint`

- purpose: top-level system plan.
- high-level fields: `blueprintId`, `systemName`, `familyId`, `scope`,
  `assumptions`, `actors`, `modules`, `architecture`, `risks`, `reviewGates`.

`ModuleBlueprint`

- purpose: module-level design.
- high-level fields: `moduleId`, `name`, `purpose`, `actors`, `entities`,
  `workflows`, `permissions`, `apis`, `uiSurfaces`, `reports`, `risks`.

`ProcessBlueprint`

- purpose: business process model.
- high-level fields: `processId`, `name`, `actors`, `states`, `transitions`,
  `rules`, `exceptions`, `approvalPoints`, `slaNotes`.

`DataModelBlueprint`

- purpose: logical data plan.
- high-level fields: `modelId`, `entities`, `relationships`, `constraints`,
  `auditFields`, `retentionNotes`, `migrationRisks`.

`IntegrationMap`

- purpose: external and internal integration plan.
- high-level fields: `integrationId`, `systems`, `interfaces`, `dataFlows`,
  `authAssumptions`, `failureModes`, `riskNotes`.

`ReportingBlueprint`

- purpose: reporting and BI plan.
- high-level fields: `reportingId`, `kpis`, `reports`, `dimensions`,
  `metrics`, `permissions`, `refreshNotes`, `privacyNotes`.

`UIBlueprint`

- purpose: enterprise UI plan.
- high-level fields: `uiId`, `navigation`, `screens`, `forms`, `tables`,
  `dashboards`, `accessibilityNotes`, `roleBasedViews`.

`TestPlanBlueprint`

- purpose: validation strategy.
- high-level fields: `testPlanId`, `unitTests`, `integrationTests`,
  `e2eTests`, `securityTests`, `loadTests`, `testDataNotes`, `acceptanceCriteria`.

`DeploymentBlueprint`

- purpose: deployment planning.
- high-level fields: `deploymentId`, `environments`, `runtimeAssumptions`,
  `configuration`, `backupNotes`, `rollbackPlan`, `observabilityNotes`.

`RoadmapPlan`

- purpose: phased delivery plan.
- high-level fields: `roadmapId`, `phases`, `milestones`, `dependencies`,
  `effortBands`, `risks`, `decisionPoints`.

Blueprint outputs must be bounded, assumption-explicit, human reviewable, and
free of secrets, raw provider output, execution claims, generated files, and
database schema output unless a later approved scaffold phase explicitly allows
that behavior.

## Safety And Approval Boundaries

Blueprint generation is advisory only.

This phase must not:

- write files as factory output,
- create database migrations,
- create database schemas,
- deploy software,
- call external APIs,
- perform runtime actions,
- mutate stores,
- emit scaffold output,
- execute workflows,
- claim compliance certification.

Human review is required before any scaffold or implementation phase.
Compliance content should be guidance and checklist material only, not a claim
of certification or legal sufficiency.

## Relationship To Other Lanes

The factory depends on or informs:

- requirements interview engine,
- estimation and planning engine,
- language profiles,
- framework profiles,
- database architecture expert,
- business process modeling,
- BI and reporting,
- transactional systems,
- enterprise UI patterns,
- native automation engine,
- production runtime.
- dashboard/control center.

Factory blueprints may describe workflows, but they must not execute workflows.
Native automation remains validation, dry-run, and trace only until future
execution phases are explicitly approved.

The future Dashboard / Control Center is documented in
[Dashboard / Control Center](dashboard-control-center.md). It is an operator
visibility layer over factory/runtime metadata, not a scaffold generator,
runtime controller, approval executor, or production dashboard in Phase 81I.

Baseline and strict CI maturity is documented in
[Baseline / Strict CI maturation](baseline-strict-ci-maturation.md). It is a
future governance layer over quality evidence and factory outputs. Phase 83I is
docs-only and does not change workflows, create baselines, mutate artifacts, or
enable quality enforcement.

Integrations and connector governance is documented in
[Integrations / Connectors](integrations-connectors.md). It is a future
governance layer for external systems. Phase 84I is docs-only and does not add
connector execution, credentials, webhooks, or external writes.

## Implementation Grouping

Recommended future grouping:

1. 68I: docs/spec only.
2. 69B: business systems catalog plan.
3. 69I: catalog metadata implementation.
4. 70B: module blueprint generator plan.
5. 70I: module blueprint generator implementation.
6. 71B: interview engine plan.
7. 71I: interview engine implementation.
8. 72B: estimation and roadmap planner.
9. 72I: estimation planning implementation.
10. 73I: language profiles implementation.
11. 74I: framework profiles implementation.
12. 75I: business process modeling implementation.
13. 76I: BI/reporting layer implementation.
14. 77I: transactional systems layer implementation.
15. 78I: enterprise UI patterns implementation.
16. Later: safe scaffold planner.
17. Later: scaffold generator only after approval gates.

CLI surfaces, scripts, database schemas, dashboard UI, scaffold output, and
runtime behavior remain future work.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Generating systems without requirements | Require interview-first inputs and explicit assumptions. |
| Overclaiming domain expertise | Mark outputs advisory and require human review. |
| Wrong compliance assumptions | Use checklist language only and avoid certification claims. |
| Unsafe scaffolding | Defer scaffold behavior to later approved phases. |
| Huge scope | Split factory work into catalog, blueprint, interview, estimation, and scaffold lanes. |
| Mixing blueprint generation with execution | Keep factory outputs as plans, not runtime actions. |
| Generic low-quality modules | Require family-specific metadata, process context, and review gates. |
