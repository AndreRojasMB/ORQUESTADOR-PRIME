# Business Systems Catalog

Phase: 69I
Status: source metadata and pure validation only

## Purpose

The Business Systems Catalog is the first source metadata layer for the
Enterprise Software Factory.

It describes common enterprise system families so later phases can create
reviewable blueprints from a shared vocabulary. It does not generate enterprise
systems, scaffold applications, create database schemas, run code, call
providers, dispatch actions, create proposals, or mutate stores.

## Current Status

The catalog currently provides:

- compact source metadata for core business system families,
- pure read-only lookup helpers,
- a pure catalog validator,
- advisory safety boundaries.

There is no CLI, no artifact output, no runtime execution, and no connection to
legacy scaffold or execute modes. The Module Blueprint Generator now exists as
a source-only advisory helper that reads the catalog, but it does not generate
systems, scaffold applications, or create database schemas.

## Family Taxonomy

| Family | Starter focus |
|---|---|
| MVC | Controllers, views, models, auth, admin, CRUD, reporting basics. |
| ERP | Finance, inventory, sales, purchases, HR, production, audit. |
| CRM | Contacts, leads, opportunities, pipeline, tickets, campaigns. |
| POS | Checkout, products, stock, payments, returns, cash closing. |
| BI | KPIs, dashboards, ETL planning, metrics, dimensions, access control. |
| BPM | Processes, states, approvals, rules, SLA, exceptions. |
| CMS | Content, media, roles, publishing workflows, versioning. |
| HRMS / HRIS | Employees, payroll handoff, attendance, leave, documents. |
| SCM | Suppliers, procurement, logistics, warehouse, demand planning. |
| LMS | Courses, learners, instructors, assessments, progress. |
| E-commerce | Catalog, cart, checkout, orders, payments, fulfillment. |
| Inventory | Stock, movements, warehouses, adjustments, reconciliation. |
| Accounting / billing | Invoices, ledgers, taxes, payments, audit trails. |
| Document management | Documents, folders, retention, approvals, search. |
| Project management systems | Projects, tasks, teams, timelines, risks, reports. |

## Required Metadata Fields

Each catalog family must define:

- `familyId`
- `name`
- `aliases`
- `purpose`
- `typicalActors`
- `coreModules`
- `commonEntities`
- `workflows`
- `permissions`
- `reports`
- `integrations`
- `complianceAndAuditConcerns`
- `dataModelPatterns`
- `uiPatterns`
- `deploymentNotes`
- `riskNotes`
- `assumptions`
- `tags`

Metadata is starter guidance, not exhaustive domain expertise. Every future
blueprint or implementation phase should keep assumptions explicit and require
human review.

## Validation Rules

The validator checks:

- unique family ids,
- unique cross-family aliases,
- required fields are present,
- non-empty core modules,
- non-empty common entities,
- at least one workflow,
- at least one report,
- at least one permission,
- all required families are present,
- bounded text length,
- compliance wording stays guidance-only,
- forbidden content is not present.

Forbidden catalog content includes raw credentials, provider output, generated
code, scaffold output, database schema snippets, action dispatch language, and
proposal creation language.

Validation output is JSON-safe and advisory. It includes reason codes and family
ids only, not raw sensitive values.

## Relationship To Enterprise Software Factory

The catalog is an input vocabulary for future Enterprise Software Factory
planning. It may inform family selection, requirements interviews, module
blueprints, roadmap planning, and review gates.

It does not create systems or files. It does not activate runtime behavior. It
does not execute workflows.

## Relationship To Future Module Blueprints

A later module blueprint generator may read this catalog and produce
reviewable `ModuleBlueprint` or `EnterpriseSystemBlueprint` drafts.

That future generator should remain advisory first and should not scaffold,
write database schemas, or execute workflows without a separate approved phase.

## Relationship To Interview And Estimation Engines

The requirements interview engine can use catalog families to ask targeted
questions about actors, modules, reports, integrations, and risk areas.

The estimation and roadmap engine can use catalog metadata to reason about
scope bands, dependencies, assumptions, and phased delivery plans.

The Requirements Interview Engine now provides source-only interview planning.
It does not change catalog metadata, create sessions, persist answers, or call
providers.

## Future Phases

Recommended next work:

1. Plan the module blueprint generator.
2. Implement a source-only module blueprint helper.
3. Plan the requirements interview engine.
4. Implement interview-to-blueprint planning.
5. Plan estimation and roadmap generation.
6. Defer scaffold planning until review and approval gates are explicit.

Catalog metadata should grow carefully through review, not through automated
generation.
