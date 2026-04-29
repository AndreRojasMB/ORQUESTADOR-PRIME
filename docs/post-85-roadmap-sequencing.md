# Post-85 Roadmap Sequencing

Status: docs-only/spec-only

Phase 86I is docs-only and spec-only. It does not implement runtime,
dashboard, automation, connectors, CI, releases, scaffolding, deployment, or
self-improvement behavior. It does not add source files, TypeScript files,
package changes, workflow changes, dashboard changes, runtime behavior,
automation execution, connector implementation, credential or vault
implementation, scaffold generation, database schemas, SQL, baseline or
artifact mutation, action/proposal/approval execution, job execution, branch,
tag, or release creation.

It does not make ORQUESTADOR-PRIME production-ready. This document records a
safe sequencing plan for Phases 86-100.

## A. Purpose

The post-85 roadmap consolidation exists because ORQUESTADOR-PRIME now has many
docs-only governance lanes, several source-only advisory factory lanes, and
several live-adjacent implementation surfaces.

The goal is sequencing and risk control before any implementation reaches
runtime, dashboard controls, automation execution, connector calls, strict CI
blocking, scaffold generation, deployment, release tags, or self-improvement
flows.

This is governance/spec only. It is a roadmap checkpoint, not an implementation
phase.

## B. Current Completed State After Phase 85

Factory metadata lanes are implemented as source-only and advisory:

- catalog,
- blueprints,
- interview,
- planning,
- language and framework profiles,
- processes,
- reporting,
- transactions,
- UI patterns.

Governance lanes are docs-only and spec-only:

- runtime deeper,
- automation deeper,
- dashboard/control center,
- connectors,
- safe self-improvement,
- baseline/strict CI,
- productization/release.

Quality, eval, and risk are implemented local advisory tooling with redacted CI
artifacts.

Runtime has a read-only doctor plus lock and migration planning primitives, but
there is no production runtime.

The dashboard app exists and is live-adjacent because it has server actions and
config-write capability.

Actions, jobs, connectors, and channel surfaces are live-adjacent and must be
treated carefully.

## C. Current System Maturity Map

Implemented and safe:

- TypeScript typecheck and local quality checks.
- Redacted quality artifact dry-run and CI upload.
- Source-only factory metadata helpers that do not execute work.

Implemented but advisory only:

- Business process models.
- BI/reporting models.
- Transactional system models.
- Enterprise UI pattern models.
- Quality/eval/risk signals when treated as review evidence.
- Automation validation and dry-run.

Implemented but live-adjacent:

- Existing dashboard app with server actions and config-write capability.
- Action/proposal/approval stores and dispatch paths.
- Job queue and scheduler helpers.
- Channel bridges for WhatsApp and Omi.
- Connector-adjacent clients for n8n, Coolify, OpenClaw/computer-use, and
  provider routing.
- Request sandbox that can perform fetch when allowed.

Docs-only/spec-only:

- Production runtime deeper.
- Native automation deeper.
- Dashboard/control center.
- Integrations/connectors governance.
- Safe self-improvement.
- Baseline/strict CI maturation.
- Productization/release path.

Not implemented:

- Production runtime API/server.
- Durable worker daemon.
- Queue backend.
- Scheduler daemon.
- Database adapter.
- Migration apply.
- Backup/restore execution.
- Repair mode.
- Credential vault.
- Unified connector registry.
- Safe read-only control center implementation.
- Docs site.
- Release packaging.

Unsafe to implement yet:

- Automation execution.
- Connector execution.
- Dashboard controls.
- Runtime mutation APIs.
- Strict CI blocking.
- Self-PR creation.
- Release tags, packages, and GitHub releases.

## D. Post-85 Strategic Decision

The next work should start with docs-only roadmap consolidation.

Strict CI activation is deferred.

Dashboard read-only implementation is deferred until dashboard write paths are
audited and isolated.

Runtime source implementation should start only with read-only planning,
validation, or safe doctor expansion.

Automation execution is deferred.

Connector execution is deferred.

Source-only connector metadata may happen before real connector calls.

## E. Recommended Phases 86-100

| Phase | Code/name | Goal | Scope | Risk level | Model recommendation | Classification | Preconditions | Must-not-change boundaries | Verification | Smoke tests | Expected commit type |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 86I | POST-85-ROADMAP-CONSOLIDATION | Docs-only roadmap sequencing spec. | Add roadmap doc and pointers. | Low | GPT-5.5 Medium | Docs-only | Phase 86B approved. | No source, package, workflow, dashboard, runtime, CI, tag, release, baseline, or artifact changes. | Status, typecheck, diff check, grep, scope check. | Roadmap exists, phases 86-100 listed, deferred work clear. | `docs:` |
| 87I | READINESS-MATURITY-METADATA | Optional source-only advisory readiness models for lane maturity/status. | Metadata types/templates/validators only. | Low | GPT-5.5 Medium | Source-only advisory | 86I committed; boundaries approved. | No filesystem reads, provider calls, runtime wiring, dashboard, CI, package, or store mutation. | Typecheck, validator smoke, forbidden grep. | Known lanes validate; unknown lane fails safely; all boundaries true. | `feat:` |
| 88I | DASHBOARD-SAFETY-AUDIT | Docs-only audit of existing dashboard write/read paths and safe read-only prerequisites. | Audit docs only. | Medium | GPT-5.5 High | Docs-only | 86I complete; dashboard source inspected read-only. | No `dashboard/*` edits, no server actions, no routes, no app changes. | Status, typecheck, diff check, grep. | `writeConfig` and server actions identified; no dashboard implementation. | `docs:` |
| 89I | CONTROL-CENTER-READONLY-MANIFEST-SPEC | Define static artifact/source manifest strategy, no app implementation. | Docs-only or source-only metadata. | Medium | GPT-5.5 High | Docs-only or source-only metadata | 88I audit complete. | No direct store reads, dashboard routes, server APIs, config writes, or artifact mutation. | Typecheck if source added; grep for fs writes/server actions. | Manifest plan is read-only; raw secrets excluded. | `docs:` or `feat:` |
| 90I | RUNTIME-READINESS-VALIDATOR-PLAN | Plan or source-only advisory runtime readiness validator metadata. | Source-only advisory preferred. | Medium | GPT-5.5 High | Source-only advisory | Runtime deeper spec and roadmap accepted. | No server, worker, queue, scheduler, DB adapter, migration apply, backup, repair, or auth implementation. | Typecheck, validator smoke, forbidden grep. | Readiness model validates as advisory; execution wording rejected. | `feat:` or `docs:` |
| 91I | RUNTIME-DOCTOR-SAFE-EXPANSION | Expand read-only doctor checks only, if scoped and proven safe. | Source read-only diagnostic. | Medium | GPT-5.5 High | Source read-only diagnostic | 90I validator or plan complete; explicit safe check list approved. | No writes, repair, migration apply, runtime API, DB adapter, server, queue, worker, or scheduler. | Typecheck; doctor smoke with isolated HOME if needed. | Missing/corrupt stores handled safely; output redacted. | `feat:` |
| 92I | BASELINE-MANIFEST-DRY-RUN-SPEC | Define baseline manifest dry-run policy and metadata, no committed baselines. | Docs/source advisory. | Medium | GPT-5.5 High | Docs/source advisory | Baseline policy stable; no strict CI activation. | No baseline creation, artifact commit, workflow edit, strict flag activation, or gate behavior change. | Typecheck if source; diff check; grep. | Dry-run metadata only; no files outside explicit temp path in later smoke. | `docs:` or `feat:` |
| 93I | STRICT-CI-WARNING-MODE-PLAN | Docs-only plan for warning-mode strict CI, not workflow activation. | Docs-only. | Medium | GPT-5.5 High | Docs-only | 92I complete; advisory comparison language stable. | No `.github` edits, package scripts, fail-on-review, fail-on-regression, branch protection, or badges. | Status, typecheck, diff check, grep for workflow changes. | Warning mode described as future only. | `docs:` |
| 94I | CONNECTOR-METADATA-TAXONOMY | Source-only connector registry metadata and validator, no connector implementation. | Types/templates/validators only. | High | GPT-5.5 High | Source-only advisory | Connector governance doc accepted; no vault yet. | No `fetch`, OAuth, credentials, webhooks, external writes, payments, SSO, browser automation, or connector calls. | Typecheck, validator smoke, strict grep. | High-risk connectors require approvals; credentials are requirements only. | `feat:` |
| 95I | CREDENTIAL-VAULT-STRATEGY | Docs-only credential/vault architecture and threat model. | Docs-only. | Critical | GPT-5.5 Extra High | Docs-only | Connector metadata taxonomy approved. | No secrets, env writes, OAuth, vault source, credential storage, network, or provider calls. | Status, typecheck, diff check, secret grep. | No secret examples; vault remains future-only. | `docs:` |
| 96I | SAFE-SCAFFOLD-GENERATOR-PLAN | Docs-only or source-only scaffold planning metadata; no generated projects. | Advisory only. | High | GPT-5.5 High | Advisory only | Factory lanes mature; scaffold boundaries approved. | Do not touch `src/scaffold/*`, prompts, templates, generated systems, package scripts, or files outside docs/advisory metadata. | Typecheck if source; grep for scaffold generation. | Planning metadata only; no generated files. | `docs:` or `feat:` |
| 97I | ENTERPRISE-DEMO-GENERATOR-ADVISORY | Source-only advisory demo model templates, not runnable demos. | Metadata/templates/validators only. | Medium | GPT-5.5 Medium | Source-only advisory | Factory and UI/transaction/reporting metadata available. | No generated projects, UI, routes, data stores, demos, scaffolds, or runtime actions. | Typecheck, validator smoke. | Demo models are advisory and non-executable. | `feat:` |
| 98I | DASHBOARD-READONLY-PROTOTYPE-GATE | Only after 88-89; add read-only views if write paths are isolated. | Dashboard implementation. | High | GPT-5.5 Extra High | Dashboard implementation | 88I audit and 89I manifest complete; read-only policy approved. | No config writes, mutation server actions, raw store leakage, job/action execution, automation execution, or operator controls. | Dashboard build/typecheck, route smoke, grep for write paths. | Views render read-only summaries; write paths not touched. | `feat:` |
| 99I | RELEASE-GOVERNANCE-TEMPLATES | Docs templates for release notes/operator/onboarding/support, no release. | Docs-only/templates. | Low | GPT-5.5 Medium | Docs-only/templates | 85I and 86I complete. | No tags, releases, version changes, CHANGELOG publication, LICENSE/SECURITY creation unless separately approved. | Status, typecheck, diff check, grep. | Templates exist; no release behavior. | `docs:` |
| 100I | PRODUCTIZATION-READINESS-REVIEW | Docs-only readiness review for whether runtime/dashboard/CI can advance. | Docs-only. | Medium | GPT-5.5 High | Docs-only | Prior roadmap phases complete or explicitly deferred. | No production-ready claims, release/tag/package, deployment, strict CI activation, runtime mutation, or dashboard controls. | Status, typecheck, diff check, grep. | Readiness decision is review-only and bounded. | `docs:` |

## F. Recommended Immediate Phase 87B / 87I Direction

After Phase 86I, the next safe plan should likely be:

- `Phase 87B-READINESS-MATURITY-METADATA-PLAN`
- then possibly `Phase 87I-READINESS-MATURITY-METADATA`

The likely 87I implementation should be source-only advisory readiness and
maturity metadata for lanes such as runtime, dashboard, automation, connectors,
CI, factory metadata, productization, and self-improvement. It should not read
the filesystem, scan the repo, call providers, mutate stores, modify packages,
edit workflows, or wire into runtime behavior.

Phase 86I does not implement Phase 87.

## G. Deferred Critical Work

The following work remains deferred:

- automation execution,
- connector execution,
- credential/vault implementation,
- payment, billing, and SSO connectors,
- runtime mutation APIs,
- store migration apply,
- backup/restore execution,
- dashboard operator controls,
- strict CI fail-on-regression and fail-on-review,
- production deployment,
- self-PR creation,
- release tags, packages, and GitHub releases,
- `LICENSE` or `SECURITY.md` policy creation unless explicitly approved.

## H. Preconditions Before Real Execution Features

Before runtime mutation:

- auth and permission model,
- audit records,
- lock discipline,
- backup/restore strategy,
- migration policy,
- operator controls,
- rollback path,
- rate limits.

Before automation execution:

- persisted workflow governance,
- approval gates,
- runtime queues,
- cancellation policy,
- audit logs,
- connector policy,
- dry-run to execution transition review.

Before connector execution:

- credential vault,
- scoped permissions,
- dry-run contract,
- audit logs,
- rate limits,
- sandboxing,
- human approval gates.

Before dashboard controls:

- read-only layer first,
- redaction enforcement,
- auth and roles,
- no raw store exposure,
- existing write paths isolated,
- operator action audit.

Before strict CI blocking:

- committed baseline,
- rollback playbook,
- warning-mode trial,
- low false-positive rate,
- human approval.

Before release/tag/package:

- SemVer reconciliation,
- changelog policy,
- strict CI maturity,
- release checklist,
- license decision,
- security policy decision.

Before self-improvement PR flow:

- baseline anchors,
- before/after eval comparison,
- redaction,
- proposal schema,
- human approval,
- rollback plan.

## I. Standard Verification Strategy For Future Phases

Standard verification commands:

```bash
git status --short
node node_modules/typescript/bin/tsc --noEmit
git diff --check
git diff --cached --check
```

If WSL lacks `node`, use the direct Windows Node fallback and report it
separately.

Each future phase should also run:

- `git diff --name-only` scope checks,
- forbidden grep checks tailored to that phase,
- docs-only smoke checks for docs-only phases,
- validator/import smoke checks for source-only advisory phases,
- route/build/read-only smoke checks for future dashboard implementation,
- explicit confirmation of no package, workflow, source, dashboard, baseline,
  artifact, release, or tag changes when those are out of scope.

## J. Risk Register

Real risks found in the repository:

- Existing dashboard has `writeConfig` and server actions.
- Existing action/job scripts can mutate local state.
- Existing action execution bridge includes file-write and git-branch behavior
  behind gates.
- Existing connector-adjacent clients can use `sandboxedFetch`.
- Package version, tags, and changelog remain misaligned.
- No tracked root `LICENSE` or `SECURITY.md`.
- No committed baselines.
- Strict CI enforcement is not active.
- Runtime is not production-ready.
- Automation remains dry-run only.
- Connectors are not governed by a unified registry yet.

## K. Safety Boundaries / Non-Goals

Phase 86I explicitly does not include:

- provider calls,
- network,
- filesystem mutation from source,
- package or version changes,
- package or script changes,
- workflow or CI changes,
- dashboard changes,
- runtime implementation,
- automation execution,
- connector implementation,
- credential/vault implementation,
- scaffold generation,
- DB schemas or SQL,
- baseline or artifact mutation,
- action, proposal, or approval execution,
- jobs execution,
- branch, tag, or release creation,
- production-ready claims,
- security or compliance guarantees.
