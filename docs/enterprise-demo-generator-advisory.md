# Enterprise Demo Generator Advisory

Phase: 97I
Status: source-only advisory metadata

## Purpose

Phase 97I adds source-only advisory enterprise demo metadata. It describes
possible demo scenarios, personas, modules, workflows, reporting views,
transactional concerns, UI patterns, sample data policy, and narrative flow as
bounded metadata.

This phase does not generate demos, generated projects, generated files,
dashboards, database schemas, SQL, scaffold output, fake dataset files,
runtime behavior, automation, connectors, actions, jobs, or commercial claims.

## Source-Only Advisory Nature

The source lane lives under:

- `src/factory/demos/types.ts`,
- `src/factory/demos/enterpriseDemoTemplates.ts`,
- `src/factory/demos/enterpriseDemoBuilder.ts`,
- `src/factory/demos/enterpriseDemoValidator.ts`.

The lane is static and pure. It must not import scaffold writers, scaffold
prompts, providers, runtime, dashboard, automation, connectors, actions, jobs,
stores, memory, learning, quality, eval, risk, filesystem, network, or command
execution modules.

## Demo Scenario Model

Each demo template describes a scenario with:

- business goal,
- audience,
- success signals,
- bounded summary,
- metadata-only marker.

Scenarios are planning records only. They do not create a demo environment,
routes, apps, dashboards, generated projects, or files.

## Persona / Stakeholder Model

Personas describe stakeholder roles, goals, and decision rights. They are
synthetic metadata only.

Personas must not include realistic personal data, real customer details,
credentials, account identifiers, provider output, task bodies, or private
store data.

## Module / Feature Reference Model

Module references are strings that can point to catalog or module-blueprint
vocabulary. They are metadata only and must not generate files, module folders,
package changes, or implementation tasks.

## Workflow / Process Reference Model

Workflow references point to business process categories or template IDs. They
describe narrative flow only. They do not execute workflows, automation,
approvals, proposals, jobs, or notifications.

## Reporting / Dashboard Reference Model

Reporting references point to reporting categories, KPI groups, or dashboard
concepts as metadata. They do not generate dashboards, BI payloads, charts,
routes, components, artifacts, or raw data extracts.

## Transactional Reference Model

Transactional references describe boundaries, review points, idempotency
concerns, audit needs, and risk notes. They do not create DB schemas, SQL,
ledgers, queues, payments, migrations, or store mutations.

## UI Pattern Reference Model

UI pattern references point to enterprise UI pattern categories such as admin
dashboards, workflow queues, approval inboxes, reporting dashboards, or
transaction review views. They do not render UI, generate components, create
routes, scaffold frontends, or modify `dashboard/`.

## Connector / Credential Boundaries

Demo metadata may mention connector taxonomy or credential strategy references
as future dependencies, but it must not execute connectors, call APIs, handle
credentials, include credential values, implement a vault, handle OAuth/tokens,
or create webhook behavior.

## Sample Data Policy

Sample data policy is metadata only. Phase 97I does not write fake datasets to
disk, generate seed files, create fixtures, create databases, or store demo
records.

Allowed sample data language is limited to bounded synthetic descriptions,
fake labels, aggregate examples, and explicit assumptions. Denied content
includes realistic personal data, secrets, tokens, config values, provider
keys, customer data, financial correctness claims, raw logs, raw prompts, raw
provider output, and private store data.

## Storyline / Narrative Model

Narratives describe presentation order, audience framing, and review notes.
They are not rendered slide decks, UI screens, demo apps, generated docs, or
commercial proposals.

## Demo Coverage Templates

Initial advisory templates cover:

| Demo | Purpose | Risk | Sample data policy | Denied behavior |
|---|---|---:|---|---|
| ERP demo | Finance, inventory, procurement story | high | synthetic descriptions only | no generated ERP, DB, ledgers |
| CRM demo | Personas, pipeline, support flow | high | fake account summaries only | no CRM writes, emails, connectors |
| POS demo | Checkout, inventory, closing story | critical | synthetic sales examples only | no payment execution, receipts, DB |
| Inventory/procurement demo | Stock and procurement workflow | high | bounded sample labels only | no store mutation or purchase orders |
| Maintenance work-order demo | Work-order lifecycle | high | synthetic assets only | no scheduler, jobs, automation |
| Incident/support demo | Ticket triage and SLA narrative | high | fake ticket summaries only | no notifications or actions |
| Access/security demo | Access request and audit story | critical | synthetic identities only | no auth enforcement or role changes |
| Executive BI demo | KPI and dashboard narrative | medium | aggregate fake metrics only | no generated dashboards or BI API calls |
| Enterprise control-center demo | Read-only maturity overview | high | summary-only metadata | no dashboard implementation or raw stores |
| Generic factory demo | End-to-end factory narrative | medium | metadata-only examples | no scaffolds or generated systems |

## Validation Rules

The validator checks:

- known demo IDs and categories only,
- known risk tiers only,
- required fields present,
- bounded arrays and text,
- unique persona, reference, and risk IDs,
- `advisoryOnly: true`,
- `sourceOnly: true`,
- all boundaries set to true,
- sample data policy is metadata-only,
- personas are synthetic metadata only,
- references are metadata-only,
- no secrets, tokens, config values, or provider keys,
- no generated project or file paths as executable output,
- no scaffold instructions that write files,
- no DB schema or SQL behavior,
- no connector or API calls,
- no production-ready claims,
- no commercial, security, compliance, or certification guarantees,
- no provider, network, filesystem write, action, store, runtime, dashboard, or
  automation behavior.

## Integration With Factory Lanes

Enterprise demo metadata can reference:

- business systems catalog,
- module blueprint generator,
- requirements interview engine,
- estimation/planning engine,
- business process modeling,
- BI/reporting layer,
- transactional systems layer,
- enterprise UI patterns.

Those references are strings and summaries only. They are not imports, file
reads, repository scans, or execution hooks.

## Integration With Safe Scaffold Generator

The safe scaffold path remains separate. Demo metadata does not authorize
scaffold generation, file writes, generated projects, template execution,
package/script changes, workflow changes, or generated file manifests.

## Integration With Connector Taxonomy And Credential Vault Strategy

Demo metadata may identify future connector or credential prerequisites.
Connector execution and credential handling remain denied. Credential
requirements must stay references and policy notes only, never values.

## Integration With Dashboard / Control Center

Demo metadata may describe future read-only control-center stories. It does
not modify `dashboard/`, add routes, add components, add server actions, read
raw stores, expose private data, or implement operator controls.

## Integration With Productization / Release Path

Demo metadata is not product or release evidence by itself. It can support
future review narrative only after governance, redaction, release policy, and
approval gates mature.

## Safety Boundaries / Non-Goals

Phase 97I explicitly preserves:

- no provider calls,
- no network,
- no filesystem mutation,
- no generated demos,
- no generated projects,
- no generated files,
- no scaffold generation,
- no dashboard implementation,
- no runtime/automation/connector execution,
- no credential/vault implementation,
- no package/workflow changes,
- no DB schemas/SQL,
- no action/proposal/approval execution,
- no jobs execution,
- no production-ready claims,
- no commercial guarantee claims,
- no security/compliance guarantees.

## Future Work

Future phases may decide whether demo metadata should appear in read-only
control-center summaries, productization review packs, or scaffold planning
inputs. Those phases must keep generation, dashboard implementation, connector
execution, credentials, DB/SQL, and file writes separately approved.
