# Module Blueprint Generator

Phase: 70I
Status: source-only advisory helper

## Purpose

The module blueprint generator turns static Business Systems Catalog metadata
into reviewable `ModuleBlueprint` planning data.

It does not generate enterprise systems. It does not scaffold applications,
create database schemas, write files, run code, call providers, use network,
dispatch actions, create proposals, mutate stores, or execute workflows.

## Current Status

The current helper is source-only:

- no CLI,
- no package script,
- no artifact output,
- no dashboard UI,
- no runtime behavior,
- no connection to legacy scaffold or execute modes.

It reads the static catalog and returns bounded planning data for human review.

## Input Model

`ModuleBlueprintGenerationOptions`

- `familyId`: required business system family id.
- `moduleId`: optional catalog module id or normalized module name.
- `includeAssumptions`: optional flag for assumption detail.

If `moduleId` is omitted, the helper returns blueprints for all core modules in
the requested family.

## Output Model

`ModuleBlueprint`

- `blueprintId`
- `createdAt`
- `schemaVersion`
- `familyId`
- `moduleId`
- `name`
- `purpose`
- `actors`
- `responsibilities`
- `entities`
- `workflows`
- `permissions`
- `reports`
- `integrations`
- `businessRules`
- `auditConcerns`
- `risks`
- `assumptions`
- `uiPatterns`
- `dataConsiderations`
- `testConsiderations`
- `implementationNotes`
- `advisoryOnly`
- `boundaries`

Blueprints are advisory planning records, not implementation instructions.

## Validation Rules

The validator checks:

- known family id,
- known module id,
- required fields are present,
- key arrays are non-empty,
- advisory-only flag is true,
- all boundaries are true,
- bounded text length,
- no code snippets,
- no database schema snippets,
- no generated-file or scaffold instructions,
- no compliance certification claims,
- no credentials, tokens, or provider output,
- no runtime/action/proposal language,
- no raw local paths where avoidable.

Validation findings use reason codes and safe messages only.

## Supported Families

The helper supports all catalog families:

- MVC
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

## Conceptual Examples

ERP can produce reviewable module blueprints for finance, inventory, purchases,
sales, HR, production, and audit.

CRM can produce reviewable module blueprints for contacts, leads, opportunities,
pipeline, tickets, and campaigns.

POS can produce reviewable module blueprints for checkout, products, stock,
payments, returns, and cash closing.

BI can produce reviewable module blueprints for KPIs, dashboards, ETL planning,
metrics, dimensions, and access control.

BPM can produce reviewable module blueprints for processes, states, approvals,
rules, SLA, and exceptions.

MVC can produce reviewable module blueprints for controllers, views, models,
auth, admin, CRUD, and reporting basics.

## Relationship To Business Systems Catalog

The generator uses catalog metadata as its only source. It does not infer from
provider output, live systems, stores, external APIs, or local project files.

Catalog metadata remains the shared vocabulary. Module blueprints are a
structured view over that metadata for later interview, estimation, and review
work.

## Relationship To Future Interview Engine

A future interview engine may use module blueprints to ask targeted questions
about actors, rules, reports, integrations, risks, and assumptions.

That future engine should keep outputs advisory until a separate implementation
phase is approved.

## Relationship To Estimation And Planning

The Estimation Planning Engine may use module blueprints to reason about
relative scope, dependencies, risk, and delivery phases.

The module blueprint helper still does not estimate effort or create backlogs.
Planning output remains advisory and does not create systems, scaffolds,
database schemas, delivery commitments, or commercial quotations.

## Relationship To Future Safe Scaffold Phase

A later scaffold phase may use reviewed module blueprints as input, but only
after explicit approval gates exist.

This phase does not create scaffold output, database schemas, files, runtime
jobs, providers, actions, or proposals.

## Future Phases

Recommended next work:

1. Plan the requirements interview engine.
2. Add richer family-specific templates only after review.
3. Add richer planning heuristics after the estimation helper is reviewed.
4. Defer safe scaffold planning until blueprint review gates are explicit.
