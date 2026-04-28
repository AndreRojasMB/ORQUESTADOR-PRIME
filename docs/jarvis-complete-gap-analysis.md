# JARVIS Complete Gap Analysis

Phase: 57I
Status: canonical roadmap gap map

## Purpose

This document maps what remains to build the complete ORQUESTADOR-PRIME JARVIS
and Software Factory vision.

Full JARVIS is not complete. This document does not claim runtime production
readiness. It builds on the advisory quality/CI stack that was closed out in
Phase 55B-F.

The goal is to make the next macro-roadmap visible before adding production
runtime behavior, native automation, dashboard controls, enterprise generators,
or stricter CI behavior.

## Current Shipped Capability Map

Already shipped areas:

- Core CLI orchestration for planning, routing, blueprinting, audit, scaffold,
  memory, chat, initialization, and controlled execution modes.
- Multi-agent registry with architecture, frontend, backend, QA, data,
  security, DevOps, API, integration, UX/UI, motion, and AI/ML specialists.
- Provider routing surfaces for configured model providers.
- Project-scoped workspace manager.
- Memory V2 retrieval with project isolation and privacy-aware filtering.
- Redacted learning export.
- Supervisor advisory layer and project goals foundation.
- Deterministic multi-agent review traces.
- Tool registry, permission checker, permission audit, redaction, and safe
  error foundations.
- Local jobs queue and notification inbox.
- Computer-use and OpenClaw dry-run safety foundations.
- External channel identity, audit, proposal, and guarded execution safety
  surfaces.
- Offline eval harness and eval gate.
- Advisory risk signal and eval-to-risk bridge.
- Quality report, quality snapshot, and local quality gate.
- Local artifact dry-run and scanned redacted artifact upload.
- Active `quality` CI workflow.
- Release-readiness docs for the advisory quality/CI stack.

## Closed Advisory Quality/CI Scope

The offline eval, risk, and quality stack is closed as an advisory quality
system.

CI and redacted artifacts are active. CI currently runs typecheck, the local
quality gate, and the artifact dry-run before uploading compact scanned JSON.

Baseline and strict CI policies exist. Baselines and strict CI remain deferred.
The current quality stack is a developer signal, not runtime approval
enforcement.

## Intentionally Deferred Items

These remain deferred:

- committed baselines,
- CI baseline comparison,
- `fail-on-review`,
- `fail-on-regression`,
- branch protection,
- PR annotations,
- badges,
- dashboard UI or server,
- release tagging,
- production runtime enforcement,
- native automation engine,
- n8n-like runtime engine,
- stricter runtime approval integration,
- full enterprise software factory.

## Complete Missing Capability Map

### A. Production Runtime / Durable Platform

Missing:

- runtime API,
- workers,
- queue processing,
- locks and concurrency control,
- database and storage migration,
- SQLite and Postgres storage options,
- auth and rate limits,
- backups,
- migrations,
- retention and forget system,
- health checks and config doctor,
- deployment readiness,
- observability, logging, and tracing,
- secrets and config management,
- runtime permissions.

### B. Dashboard UI / Control Center

Missing:

- quality artifact visualization,
- eval, risk, and quality dashboards,
- jobs and notifications views,
- approvals and proposal visibility,
- workspace status,
- memory and learning views,
- channel visibility,
- artifact download and safe summaries,
- baseline and strict CI visibility,
- admin and operator controls.

### C. Native Automation Engine / n8n-Like Layer

Missing:

- workflow graph model,
- triggers,
- schedules,
- webhooks,
- nodes and actions,
- connectors,
- credential policy,
- permission checks,
- approval gates,
- dry-run execution,
- retries,
- logs,
- audit trail,
- rollback and cancel,
- notifications,
- redaction,
- sandboxing,
- templates,
- n8n import or migration strategy,
- default-deny design.

This lane must not start with real execution. It should begin with a graph
schema, validation, dry-run output, and permission checks.

The canonical native automation engine specification lives in
[Native automation engine](native-automation-engine.md). Automation execution
remains future work.

### D. Enterprise Software Factory

Missing:

- system family catalog,
- domain module blueprints,
- enterprise architecture generator,
- enterprise project scaffolding,
- backlog and roadmap generation,
- feature and module generation,
- report generation,
- documentation generation,
- test generation,
- deployment planning,
- demo and MVP generation,
- integration map.

### E. Requirements Interview Engine

Missing:

- stakeholder interview modes,
- CEO mode,
- operational user mode,
- technical user mode,
- auditor and compliance mode,
- client and customer mode,
- domain extraction,
- process extraction,
- rules extraction,
- entity extraction,
- permissions extraction,
- integration extraction,
- reporting requirements,
- SLA, volume, and risk questions,
- interview-to-blueprint generation.

### F. Estimation / Planning Engine

Missing:

- roadmap generator,
- backlog generator,
- epics and user stories,
- effort estimation,
- risk matrix,
- dependency matrix,
- delivery plan,
- commercial proposal,
- scope definition,
- phased implementation plan,
- MVP versus enterprise rollout.

### G. Multi-Language Engineering Support

Missing formal language profiles for:

- Python,
- C#,
- Java,
- Kotlin,
- JavaScript,
- TypeScript,
- C++,
- SQL,
- Bash,
- PowerShell,
- Go.

Each language profile should define:

- project structure detection,
- build command detection,
- test command detection,
- dependency management,
- linting and static checks,
- safe execution strategy,
- templates,
- common architectures,
- packaging and deployment,
- code review heuristics.

### H. Framework / Platform Profiles

Missing framework and platform profiles for:

- ASP.NET Core,
- WPF / MVVM,
- WinUI,
- MAUI,
- Spring Boot,
- FastAPI,
- Django,
- React,
- Next.js,
- Electron,
- Tauri,
- Qt/C++,
- REST APIs,
- GraphQL,
- microservices,
- modular monoliths.

Each profile should define:

- canonical architecture,
- folder structure,
- build and test commands,
- deployment notes,
- security notes,
- sample scaffold,
- quality checks,
- common pitfalls.

### I. Enterprise Business System Families

Missing system family catalogs for:

- MVC systems,
- ERP,
- CRM,
- POS,
- BI,
- BPM,
- CMS,
- HRMS / HRIS,
- SCM,
- LMS,
- e-commerce,
- inventory systems,
- accounting / billing,
- document management,
- project management systems.

Each family should define:

- core modules,
- entities,
- workflows,
- permissions,
- reports,
- integrations,
- audit and compliance concerns,
- data model patterns,
- UI patterns,
- deployment considerations.

### J. Enterprise Module Blueprint Generator

Missing reusable module blueprint sets.

ERP examples:

- purchases,
- sales,
- inventory,
- accounting,
- finance,
- HR,
- production,
- reports,
- audit.

CRM examples:

- customers,
- leads,
- opportunities,
- pipeline,
- campaigns,
- tickets,
- reports.

POS examples:

- checkout,
- products,
- stock,
- discounts,
- billing,
- payments,
- returns,
- cash closing.

BI examples:

- KPIs,
- dashboards,
- ETL,
- warehouse,
- analytical queries.

BPM examples:

- flows,
- states,
- approvals,
- rules,
- SLA,
- exceptions,
- automation events.

### K. Business Process Modeling Layer

Missing:

- BPMN-like process modeling,
- states,
- transitions,
- rules,
- approvals,
- responsibilities,
- SLA,
- exceptions,
- automations,
- events,
- diagrams and export,
- process-to-system blueprint.

### L. Reporting / BI Layer

Missing:

- KPIs,
- dashboards,
- cubes and dimensions,
- ETL,
- data warehouse,
- datamarts,
- analytical queries,
- Power BI, Metabase, and Superset integration strategy,
- report permissions,
- auditability.

### M. Transactional Systems Layer

Missing:

- consistency patterns,
- concurrency patterns,
- transactions,
- rollback,
- reconciliation,
- closing processes,
- audit logs,
- traceability,
- data integrity,
- banking, POS, and ERP-grade operations.

### N. Enterprise UI Patterns

Missing:

- admin dashboards,
- advanced CRUD,
- master/detail forms,
- filterable tables,
- workflows,
- kanban,
- calendars,
- reports,
- POS UI,
- permission panels,
- document management,
- responsive screens,
- accessibility patterns.

### O. Security / Compliance / Governance

Missing:

- OWASP profiles,
- ISO 27001-like controls,
- PCI-like payment controls,
- HIPAA-like health controls,
- data classification,
- threat modeling,
- audit policy,
- access control,
- encryption,
- backups and recovery,
- retention,
- data lineage,
- compliance review agent.

These should be framed as implementation guidance and review checklists, not as
claims of certification.

### P. Database Architecture Expert

Missing database expert profiles for:

- PostgreSQL,
- MySQL,
- SQL Server,
- Oracle,
- MongoDB,
- Cassandra,
- Redis,
- Elasticsearch / OpenSearch,
- data warehouse,
- datamarts.

Missing design capabilities:

- logical design,
- physical design,
- indexes,
- partitioning,
- migrations,
- tuning,
- transactions,
- auditing,
- backups.

### Q. QA / Testing Factory

Missing:

- unit tests,
- integration tests,
- E2E tests,
- load testing,
- security testing,
- contract testing,
- optional mutation testing,
- test data generation,
- regression tests,
- CI test profiles.

### R. DevOps / Deployment Profiles

Missing deployment profiles for:

- Docker,
- Kubernetes,
- GitHub Actions,
- Coolify,
- Nginx,
- IIS,
- Windows services,
- Linux services,
- observability,
- logs,
- metrics,
- traces,
- rollback,
- optional blue/green deployment,
- environment matrix,
- secrets policy.

### S. Desktop Application Layer

Missing:

- WPF MVVM,
- WinUI,
- MAUI,
- local DB,
- offline-first behavior,
- backend sync,
- installers,
- auto-update,
- Windows permissions,
- printers,
- readers,
- devices,
- hardware integration,
- desktop security.

### T. Integrations / Connectors

Missing or incomplete connector strategy for:

- Gmail,
- Calendar,
- GitHub,
- browser,
- filesystem,
- terminal,
- external APIs,
- WhatsApp,
- Omi / voice,
- OpenClaw,
- n8n bridge,
- native automation connectors,
- payment systems,
- billing / facturacion,
- SSO,
- BI tools,
- accounting systems,
- ERP and CRM APIs.

### U. Safe Self-Improvement

Missing:

- failure review,
- self-PR proposals,
- diff generation,
- risk assessment,
- human approval,
- accept/reject learning,
- red-team process,
- rollback plan.

The system must not perform autonomous production self-modification.

### V. Productization / Release Path

Missing:

- semantic versions,
- release notes,
- changelog,
- tags,
- packaging,
- installer or deployment path,
- docs site,
- onboarding guide,
- operator manual,
- support and troubleshooting guide,
- telemetry policy,
- license and security policy.

## Old Roadmap Comparison

Old roadmap terminology may differ from the current shipped implementation. This
table maps old labels carefully against the current repo state.

| Old phase | Classification | Current mapping |
|---|---|---|
| 30A-G | already shipped | Retrieval, observability, controlled dispatch foundations shipped across Phase 30 and 30E. |
| 31A-B | partially shipped | Motion guidance and context compression shipped; broader UX/profile system remains missing. |
| 32A | already shipped | Controlled execution preview and second approval/dashboard visibility shipped. |
| 33A | already shipped | Channel safety spec shipped; later 33B-J implemented channel hardening surfaces. |
| 34A | partially shipped | Learning strategy and redacted export shipped; no training or self-modification. |
| 35A-B | partially shipped | Supervisor spec and project goals shipped; full JARVIS brain runtime remains missing. |
| 36A-B | already shipped | Tool registry, permission checker, redaction, and safe errors shipped. |
| 37A-B | already shipped | Jobs and notifications local foundations shipped. |
| 38A | partially shipped | Computer-use safety and OpenClaw dry-run shipped; real computer use deferred. |
| 39A | partially shipped | Multi-agent collaboration specs and deterministic review traces shipped; provider-backed reviewers deferred. |
| 40A | already shipped | Workspace manager shipped. |
| 41A | already shipped | Offline eval harness shipped. |
| 42A | intentionally deferred | Production runtime spec exists; runtime server, auth, locks, migrations, and storage changes remain deferred. |
| 43A | partially shipped | Multi-channel assistant spec exists; full unified runtime pipeline remains deferred. |
| 44A | intentionally deferred | Self-improvement safety spec exists; failure review and self-improvement proposals remain deferred. |
| 45A-B | already shipped | Local quality gate and local workflow docs shipped. |
| 46A-B | already shipped | CI readiness and local dry-run docs shipped. |
| 47A | already shipped | Active minimal CI and observability docs shipped. |
| 48A | already shipped | CI first-run feedback and stability docs shipped. |
| 49A | already shipped | Artifact redaction policy and local artifact dry-run shipped. |
| 50A | obsolete/replaced | Initial upload deferral was replaced by later approved redacted artifact upload. |
| 51A | already shipped | Baseline policy and Actions Node24 hardening shipped. |
| 52A | already shipped | Redacted CI artifact upload shipped and verified. |
| 53A | intentionally deferred | Baseline readiness and candidate dry-run docs shipped; committed baselines remain deferred. |
| 54A | already shipped | Strict CI readiness and final hardening docs shipped; strict flags remain deferred. |
| 55A-F | already shipped | Advisory quality/CI release-readiness closeout shipped. |

## Dependency Order

Safe future order:

1. Post-closeout usage watch.
2. Complete gap map docs.
3. Production runtime foundation refresh.
4. Store health, config doctor, and locks.
5. Native automation engine spec.
6. Permission-gated automation dry-run core.
7. Enterprise software factory specs.
8. Language and framework profiles.
9. Requirements interview engine.
10. Estimation and planning engine.
11. Business systems catalog and modules.
12. Business process modeling.
13. Dashboard and control center.
14. Runtime integrations and connectors.
15. Baseline and strict CI maturation.
16. Productization and release path.

## Risk Map

| Macro-lane | Risk level | Why | Safety requirements |
|---|---|---|---|
| Production runtime | high | Adds server, auth, storage, concurrency, and deployment concerns. | Default-deny API, config doctor, locks, migrations dry-run first. |
| Dashboard UI | medium | May expose artifacts, stores, approvals, and channel state. | Read-only first, redaction, no mutation controls initially. |
| Native automation | critical | Can execute workflows and affect external systems. | Dry-run first, permission checks, approvals, audit, sandbox, default-deny. |
| Enterprise factory | high | Generated systems may encode wrong architecture or business assumptions. | Specs, interview inputs, profiles, review gates. |
| Interview engine | medium | Incorrect requirements can poison downstream generation. | Structured outputs, assumptions, review checkpoints. |
| Estimation engine | medium | Can overpromise timelines or costs. | Confidence bands, assumptions, human review. |
| Language profiles | medium | Unsafe command execution and weak heuristics are likely. | Per-language safe command registry and dry-run checks. |
| Framework profiles | medium | Bad scaffolds create security and maintenance issues. | Canonical profiles, fixtures, smoke checks. |
| Business catalog | medium | Domain complexity and ambiguous modules. | Docs-first catalogs and reviewable schemas. |
| BPM layer | high | Process models can become hidden runtime gates. | Advisory modeling first, no execution by default. |
| BI/reporting | medium | Data and report privacy risks. | Redacted samples, permissions, no live DB access first. |
| Transactional layer | high | Financial and data integrity risks. | Transaction patterns, audits, reconciliation specs. |
| Enterprise UI | medium | High scope and many edge cases. | Pattern library before app generation. |
| Security/governance | high | Compliance claims are risky. | Avoid certification claims; provide checklists and threat models. |
| DB expert | high | Data loss and performance risks. | Migration dry-run, backups, no destructive SQL by default. |
| QA factory | medium | Generated tests can be flaky or shallow. | Stable fixtures and profile-specific checks. |
| DevOps profiles | high | Deployment and secret handling risks. | No deploy first, dry-run plans, secret policy. |
| Desktop layer | high | OS and hardware permissions increase blast radius. | Desktop safety profiles and sandboxed examples. |
| Integrations | high | Secrets, network, and external side effects. | Connector registry, credential policy, mocked smoke. |
| Self-improvement | critical | Can drift into unsafe self-modification. | Proposal-only, human approval, no automatic code changes. |
| Productization | medium | Risk of overclaiming readiness. | Release checklist, semver discipline, support docs. |

## Recommended Roadmap From 57 Onward

| Phase | Objective | Risk level | Implementation style | Suggested model |
|---|---|---|---|---|
| 57 | Persist full gap map. | low | docs-only | GPT-5.5 High |
| 58 | Production runtime foundation refresh. | high | docs-first | GPT-5.5 Extra High |
| 59 | Store health, config doctor, and locks. | high | source + docs | GPT-5.5 Extra High |
| 60 | Native automation engine spec. | critical | docs-only | GPT-5.5 Extra High |
| 61 | Automation dry-run graph core. | critical | source + docs | GPT-5.5 Extra High |
| 62 | Enterprise software factory spec. | high | docs-only | GPT-5.5 High |
| 63 | Language profiles. | medium | source + docs | GPT-5.5 High |
| 64 | Framework profiles. | medium | source + docs | GPT-5.5 High |
| 65 | Requirements interview engine. | medium | source + docs | GPT-5.5 High |
| 66 | Estimation and planning engine. | medium | source + docs | GPT-5.5 High |
| 67 | Business systems catalog. | medium | docs-first | GPT-5.5 High |
| 68 | Module blueprint generator. | high | source + docs | GPT-5.5 Extra High |
| 69 | Business process modeling. | high | source + docs | GPT-5.5 Extra High |
| 70 | BI/reporting layer. | medium | docs-first | GPT-5.5 High |
| 71 | Transactional systems layer. | high | docs-first | GPT-5.5 Extra High |
| 72 | Enterprise UI patterns. | medium | docs + templates | GPT-5.5 High |
| 73 | Dashboard/control center. | high | runtime/UI | GPT-5.5 Extra High |
| 74 | Baseline and strict CI maturation. | medium | workflow + docs | GPT-5.5 High |
| 75 | Productization and release path. | medium | docs + tooling | GPT-5.5 High |

## First Recommended Implementation Phase

Recommended next implementation phase after this document:

```text
Phase 58B-PRODUCTION-RUNTIME-FOUNDATION-PLAN
```

Native automation and enterprise factory work need a clearer durable runtime
foundation first. Production runtime foundations should be planned before adding
n8n-like execution, dashboard control surfaces, or enterprise generators.

The canonical production runtime foundation specification lives in
[Production runtime foundation](production-runtime-foundation.md). It is the
next dependency before native automation, dashboard, and enterprise factory
runtime work.

## Standard Verification/Smoke Rules For Future Work

Future phases should start with:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

For quality-sensitive phases:

```bash
npm run quality:gate
npm run quality:artifacts:dry-run -- --out-dir=/tmp/orq-future-artifacts
```

Also run:

```bash
git diff --check
git status --short
```

Standard safety checks:

- no generated artifacts tracked,
- no baseline files tracked,
- isolated `HOME` when stores or effects are involved,
- no provider, network, action, approval, or proposal behavior unless
  explicitly planned,
- no workflow behavior changes unless explicitly planned.

## Final Warning

This gap map is a roadmap, not implementation.

It should prevent overbuilding and unsafe automation. Full JARVIS completion
requires multiple future macro-lanes, each with its own safety review,
verification, and closeout.
