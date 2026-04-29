# Dashboard Safety Audit

Status: docs-only/spec-only

Phase 88I is documentation and audit only. It does not modify `dashboard/`, add
source files, add TypeScript files, implement a read-only control center,
change routes, change pages, change components, change server actions, change
helpers, change config writes, add auth, add redaction, or change data access.

It does not make ORQUESTADOR-PRIME production-ready. This document inventories
the existing dashboard safety posture and records prerequisites before future
read-only control-center work.

## A. Purpose

The dashboard safety audit exists because the tracked dashboard app is useful
for local visibility, but it is live-adjacent. It reads local ORQUESTADOR data
directly and includes a write-capable config path.

The audit separates observation from control. It identifies what the dashboard
can read, where it can write, what data may be sensitive, and what must be
isolated before a future read-only control center can be treated as safe.

This is documentation and audit only. It does not implement a dashboard app,
read-only control center, route, component, server action, auth layer, redaction
layer, or config mutation policy.

## B. Current Dashboard Baseline

The repository contains a tracked Next app under `dashboard/`.

The app uses App Router pages, and most pages are server components. Local data
access is centralized in `dashboard/lib/data.ts`, which resolves the
ORQUESTADOR data directory from `ORQUESTADOR_DATA_DIR` or
`~/.orquestador-prime`.

Dashboard-local types mirror orchestrator store shapes in
`dashboard/lib/types.ts`.

`dashboard/lib/agents.ts` is a static metadata copy. It avoids importing the
runtime agent registry, because the runtime registry has provider-related
module-initialization concerns.

The dashboard README is still default Next.js boilerplate and does not document
the dashboard safety posture, live-adjacent write paths, auth gaps, or redaction
expectations.

## C. Tracked Dashboard Source Inventory

Tracked dashboard files inspected for this audit:

- `dashboard/package.json`
- `dashboard/README.md`
- `dashboard/lib/data.ts`
- `dashboard/lib/types.ts`
- `dashboard/lib/agents.ts`
- `dashboard/lib/distillation.ts`
- `dashboard/app/page.tsx`
- `dashboard/app/runs/page.tsx`
- `dashboard/app/runs/[id]/page.tsx`
- `dashboard/app/actions/page.tsx`
- `dashboard/app/channel-audit/page.tsx`
- `dashboard/app/config/page.tsx`
- `dashboard/app/config/ConfigForm.tsx`
- `dashboard/app/config/actions.ts`
- `dashboard/app/integrations/page.tsx`
- `dashboard/app/integrations/checks.ts`
- `dashboard/components/Badge.tsx`
- `dashboard/components/Card.tsx`
- `dashboard/components/PhaseTimeline.tsx`
- `dashboard/components/RunTable.tsx`
- `dashboard/components/Sidebar.tsx`
- `dashboard/app/layout.tsx`
- `dashboard/app/globals.css`

Local `.next` and `node_modules` directories may exist under `dashboard/`.
Those are generated or dependency output and are not the tracked audit target.
Future audit commands should distinguish tracked dashboard source from local
build and dependency folders.

## D. Read-Path Inventory

| File/helper/page | Data source | Type of data | Potential sensitivity | Safety note |
|---|---|---|---|---|
| `dashboard/lib/data.ts` `getDataDir` | `ORQUESTADOR_DATA_DIR` or `~/.orquestador-prime` | Data-root resolution | Local path disclosure | Read helper only, but all direct store reads depend on this root. |
| `readMemoryStore`, `getRecentEntries`, `getEntryById` | `memory.json` | Memory entries, tasks, traces, summaries, output dirs | Raw task text, trace ids, output directories, summaries | Direct raw store read, not a redacted artifact strategy. |
| `readTrajectoryStore`, `getTrajectories`, `getTrajectoryByTraceId` | `trajectories.json` | User messages, intent, provider calls, tool calls, errors, outcomes | Raw user messages, intent tasks, provider metadata, errors | Direct raw store read; future views need redaction and summaries first. |
| `readActionStore`, `getActions`, trace/trajectory filters | `actions.json` | Action proposals and statuses | Proposal/action metadata, risk categories, sources | Visibility must not become action dispatch or approval behavior. |
| `readChannelAuditStore`, `getChannelAuditEntries`, `getDashboardChannelAuditStats` | `channel-audit.json` | Channel audit entries and stats | Channel identities, permission snapshots, reason strings | Needs redacted summaries before broad dashboard exposure. |
| `readExecutionResultStore`, `getExecutionResults`, proposal filters | `action-executions.json` | Execution result summaries | Result metadata, outcomes, error summaries | Must remain read-only; no retry or dispatch controls. |
| `readSecondApprovalStore`, second approval helpers | `action-second-approvals.json` | Second approval state | Approval timing, status, proposal linkage | Must not grant, consume, approve, reject, or dispatch. |
| `readConfig` | `config.json` | User config, WhatsApp config, providers, domains | Hook token, allowed phones, allowed domains, provider config | Config display requires masking/redaction and future role policy. |
| `getRealExecutionEnabled` | `ACTIONS_REAL_EXECUTION_ENABLED` | Real-execution status flag | Operational execution posture | Status only; must not toggle execution. |
| `dashboard/app/integrations/checks.ts` | Provider/integration environment presence | Boolean configured/not configured states | Presence of provider tokens or deployment tokens | Booleans avoid values, but still reveal operational setup. |
| `dashboard/app/page.tsx` | Multiple helpers above | Overview status, recent entries, actions, approvals, audit stats | Aggregated raw local store data | Useful overview, but not a safe control-center source yet. |
| `dashboard/app/runs/page.tsx` | Memory and trajectories | Run history and distillation tiers | Raw task and trajectory-derived status | Needs redaction policy before broader use. |
| `dashboard/app/runs/[id]/page.tsx` | Run, trajectory, actions, execution results | Run detail, trace, related actions | Raw task, output dir, trace id, provider/tool metadata, action metadata | Highest raw-detail exposure path found. |
| `dashboard/app/actions/page.tsx` | Actions, execution results, second approvals | Action/proposal/approval review metadata | Proposal/action and approval metadata | Must not become approve/reject/dispatch UI. |
| `dashboard/app/channel-audit/page.tsx` | Channel audit entries and stats | Channel decision logs | Channel and permission summaries | Requires identity redaction and access policy. |
| `dashboard/app/config/page.tsx` | Config | Editable config data | Hook token, phone numbers, domains, provider routing | Also links into the write path. |
| `dashboard/app/integrations/page.tsx` | Integration status server logic | Configured/not configured provider status | Operational provider/integration presence | Read-only status, but no auth boundary was found. |

## E. Write-Path Inventory

| File/helper/page | Write behavior | Target | Risk | Future isolation recommendation |
|---|---|---|---|---|
| `dashboard/lib/data.ts` `writeConfig` | Calls `mkdir` for the data directory and `writeFile` for config JSON | `config.json` under the ORQUESTADOR data directory | Local config mutation from dashboard server code | Isolate from any future read-only control-center path. |
| `dashboard/app/config/actions.ts` | `"use server"` action `saveConfig(formData)` reads current config, builds an updated config, and calls `writeConfig` | `config.json` | Server action can persist local config changes | Quarantine as write-capable until auth, approval, audit, redaction, and config policy exist. |
| `dashboard/app/config/ConfigForm.tsx` | Client form is wired to `saveConfig` through `useActionState` | Server action above | UI path can submit config changes | Hide or remove from read-only control center; future mutation requires explicit approval flow. |
| `dashboard/app/config/page.tsx` | Loads config and renders the write-capable form | Config page | Page combines raw config display and mutation affordance | Split future read-only summaries from write-capable settings. |

No write path should be considered safe read-only control-center behavior.

## F. Server Action Analysis

`dashboard/app/config/actions.ts` is write-capable. It is marked with
`"use server"` and exports `saveConfig(formData)`, which calls `writeConfig`.
That server action cannot be treated as read-only dashboard behavior.

`dashboard/app/integrations/checks.ts` is also marked with `"use server"`, but
the inspected behavior computes read-only integration status from config and
environment presence. It still exposes operational setup state and lacks an
auth/role boundary, so future dashboards should treat it as sensitive
read-only status, not as public information.

Write-capable server actions must be isolated before any read-only control
center work advances.

## G. Config Write Path Analysis

The config write path is:

1. `dashboard/app/config/page.tsx` loads `readConfig`.
2. `dashboard/app/config/ConfigForm.tsx` renders editable fields.
3. `ConfigForm` submits `FormData` through `saveConfig`.
4. `dashboard/app/config/actions.ts` builds an updated `UserConfig`.
5. `saveConfig` calls `writeConfig`.
6. `writeConfig` can create the data directory and persist `config.json`.

Config fields include WhatsApp enablement, allowed phones, safe modes, message
limits, n8n webhook path, reply mode, disabled agents, allowed domains, routing
visibility, provider visibility, and `whatsapp.hookToken`.

The `whatsapp.hookToken` field is especially sensitive because the current form
uses the config value as an editable field default. Placeholder masking does not
remove the raw value from the field.

Future config mutation requires masking, redaction, auth/role design, explicit
operator intent, approval-gated mutation, audit records, rollback notes, and a
clear policy that separates read-only control-center views from write-capable
settings.

Phase 88I performs no config writes.

## H. Local Data Source Inventory

Current dashboard-local data categories:

- memory,
- trajectories,
- actions,
- channel audit,
- action executions,
- second approvals,
- config,
- environment and integration status.

These are direct local data and environment reads. They are not equivalent to a
safe redacted artifact strategy. A future read-only control center should
prefer redacted summaries, CI artifacts, explicit manifests, and doctor output
over raw store browsing.

## I. Raw / Private Data Exposure Risk

The dashboard may expose or derive visibility from:

- raw task text,
- user messages,
- trace IDs,
- output directories,
- provider timing and token metadata,
- trajectory `intent.task`,
- provider call metadata,
- tool call metadata,
- errors,
- structured-result metadata,
- action/proposal/approval metadata,
- channel identity summaries,
- execution results,
- permission snapshots,
- config values such as hook tokens,
- allowed phone numbers,
- allowed domains,
- integration/provider configured status.

Future dashboard work should summarize before showing raw detail. Raw views, if
ever allowed, need opt-in access, permission gates, audit, and bounded redaction
rules.

## J. Auth / Role Gap Analysis

No obvious auth, session, role, middleware, or permission boundary was found in
the tracked dashboard source inspected for this audit.

A future read-only dashboard should not expose sensitive local stores,
provider/integration status, config values, action metadata, channel audit
metadata, memory, trajectories, or raw trace details without an auth, role, and
redaction policy.

## K. Redaction / Privacy Gap Analysis

No centralized dashboard redaction layer was found.

Future dashboard/control-center work must:

- summarize before raw detail,
- hide secrets and tokens by default,
- avoid raw provider keys,
- avoid raw config values,
- avoid raw channel identities,
- avoid raw prompts and raw task bodies by default,
- avoid raw provider output,
- avoid raw proposal parameters,
- bound all rendered details,
- make raw-detail views opt-in and permission-gated later.

Phase 88I does not implement redaction.

## L. Operator-Control Risk Analysis

The current dashboard shows concepts such as actions, approvals, executions,
integrations, channel audit, config, and real-execution status. These concepts
are useful for visibility, but they can be mistaken for control-center
readiness.

No operator controls should be added until auth, audit, rate limits, approval
gates, redaction, rollback policy, and runtime maturity exist.

Read-only display must remain separate from approve, reject, dispatch, enqueue,
retry, repair, migrate, configure, deploy, or execute behavior.

## M. Safe Read-Only Prerequisites

Before any real read-only dashboard/control-center work:

- read-only data source policy,
- central redaction layer,
- no raw secret/provider/config exposure,
- auth/role model,
- server action isolation,
- `writeConfig` isolation from read-only views,
- config mutation approval flow,
- artifact/source manifest strategy,
- no direct raw store browsing by default,
- operator-control gating,
- audit logs for future controls,
- rate limits if controls exist,
- dashboard smoke tests,
- privacy review.

## N. Future Write-Isolation Plan

Future strategy should:

- separate read-only app routes from write-capable config and server actions,
- quarantine config mutation UI,
- hide or remove write forms from read-only control-center modes,
- require approval and audit for any future config mutation,
- never expose raw hook tokens in editable fields,
- prefer read-only redacted summaries,
- provide a clear no-write smoke test for read-only mode,
- require a separate phase before enabling any operator control.

## O. Future Control-Center Readiness Checklist

Before read-only control-center implementation advances:

- all write paths inventoried,
- all read paths classified,
- redaction layer exists,
- auth/roles exist,
- raw config and secrets masked,
- server actions isolated,
- store access policy defined,
- artifact manifest strategy defined,
- privacy review complete,
- no mutation paths in read-only mode,
- smoke tests cover no-write guarantees.

## P. Dashboard Maturity Stages

1. Docs-only audit.
2. Read-only manifest spec.
3. Read-only prototype gate.
4. Redacted artifact viewer.
5. Authenticated read-only dashboard.
6. Approval-gated operator review.
7. Controlled operator actions, future only.
8. Enterprise control center.

## Q. Verification And Smoke Plan

Future audit phases should run:

- `git status --short`,
- `node node_modules/typescript/bin/tsc --noEmit`,
- `git diff --check`,
- scope checks confirming no dashboard changes for audit phases,
- targeted grep checks for write, action, server-action, runtime, automation,
  job, provider, network, package, workflow, and production claim wording,
- docs-only smoke checks confirming the audit doc exists and lists read paths,
  write paths, server actions, auth gaps, redaction gaps, prerequisites, and
  explicit non-goals.

If WSL lacks `node`, use the direct Windows Node fallback and report it.

## R. Safety Boundaries / Non-Goals

Phase 88I explicitly includes:

- no dashboard source changes,
- no dashboard app implementation,
- no route/component changes,
- no server action changes,
- no `writeConfig` changes,
- no config writes,
- no store/memory mutation,
- no raw secret exposure,
- no provider calls,
- no network,
- no command execution,
- no runtime execution,
- no action/proposal/approval execution,
- no automation execution,
- no jobs execution,
- no package/workflow changes,
- no production-ready claims,
- no security/compliance guarantees.

## S. Readonly Manifest Next Layer

The next policy layer after this audit is documented in
[Control Center Readonly Manifest](control-center-readonly-manifest.md). That
spec defines a future read-only inventory contract for approved redacted data
sources. It does not modify `dashboard/`, implement a read-only control center,
generate manifests, generate artifacts, read files, read stores, or isolate the
existing write-capable dashboard paths.
