# Dashboard Readonly Prototype Gate

Status: docs-only/spec-only

Phase 98I is docs-only and spec-only. It does not implement a dashboard
prototype, modify `dashboard/*`, add routes, add components, add server
actions, add APIs, add auth, add redaction, add data adapters, change
`writeConfig`, change `saveConfig`, read stores, mutate stores, or write
config.

It does not make ORQUESTADOR-PRIME production-ready. This document records a
gate decision: a real read-only dashboard prototype remains blocked until write
isolation, redaction, auth/role strategy, privacy review, and manifest-backed
data sourcing are complete.

## A. Purpose

The dashboard readonly prototype gate exists because the current dashboard is
useful for local visibility but remains live-adjacent. It reads local
ORQUESTADOR data directly and includes config write paths.

The goal of this document is to prevent an unsafe jump from audit and manifest
policy into dashboard implementation. Phase 98I records the gate, blockers, and
future prerequisites only.

This is architecture and governance documentation. It creates no app behavior,
no dashboard route, no component, no server action, no API, no auth layer, no
redaction layer, and no data adapter.

## B. Current Dashboard Baseline

The existing dashboard is a tracked Next app under `dashboard/`.

`dashboard/lib/data.ts` reads local ORQUESTADOR stores. It resolves the local
data directory from `ORQUESTADOR_DATA_DIR` or `~/.orquestador-prime`.

`dashboard/lib/data.ts` also exposes `writeConfig`, which can persist local
config data.

`dashboard/app/config/actions.ts` has a write-capable server action named
`saveConfig`.

`dashboard/app/config/ConfigForm.tsx` submits config changes through
`saveConfig`.

The current dashboard can expose operational data from memory, trajectories,
actions, channel audit, action executions, second approvals, config, and
integration environment/status checks.

No obvious auth, session, role, or middleware boundary was found during the
dashboard safety audit.

No centralized dashboard redaction layer was found.

## C. Gate Decision

It is not safe to implement a real read-only dashboard prototype in Phase 98I.

Phase 98I is a docs-only gate decision.

Future prototype work must wait for write isolation, redaction, auth/role
strategy, privacy review, and manifest-backed data sourcing.

## D. Prototype Blockers

Current blockers:

- `writeConfig` exists and can persist config.
- `saveConfig` is a server action wired to UI.
- A config form exists and submits changes.
- Raw local store reads exist.
- Sensitive config exposure is possible, including `whatsapp.hookToken`.
- No auth/role boundary was found.
- No centralized redaction layer was found.
- No manifest-backed data adapter exists.
- No privacy review exists for dashboard prototype exposure.
- No smoke tests prove that dashboard prototype routes cannot write.

## E. Required Prerequisites Before Any Prototype

Before any future dashboard prototype, the project must:

- inventory all write paths,
- isolate `writeConfig`,
- isolate or remove `saveConfig` from read-only surfaces,
- classify every server action,
- define a redaction policy,
- define an auth/role strategy,
- define a read-only data source policy,
- bind future views to the readonly manifest policy,
- deny raw secrets, config values, and tokens,
- deny direct raw store browsing by default,
- complete a privacy review,
- add smoke tests for no mutation paths,
- define a rollback plan,
- prove no mutation path is reachable from the read-only prototype.

## F. Read-Only Data Source Strategy

Allowed future sources:

- static advisory metadata,
- readiness/maturity metadata,
- runtime readiness metadata,
- enterprise demo advisory metadata,
- redacted CI artifacts,
- quality dashboard data summaries,
- readonly manifest entries,
- docs-derived status,
- runtime doctor summaries only if redacted and manifest-bound later.

Denied sources:

- raw memory stores,
- raw trajectories,
- raw user messages,
- raw prompts,
- raw provider output,
- raw config values,
- hook tokens,
- action/proposal raw params,
- raw channel identities,
- raw execution output,
- raw local paths,
- arbitrary direct file reads.

## G. Redaction / Privacy Strategy

Future dashboard work must summarize before detail.

Future read-only views must deny:

- secrets, config values, and token values,
- raw prompts, user messages, and provider output,
- raw channel identity values,
- raw local paths by default.

A centralized redaction layer is required before raw detail views.

Future raw views must be opt-in, role-gated, audited, and out of scope for
Phase 98I.

## H. Auth / Role Prerequisite

No auth, role, session, or middleware boundary was found in the tracked
dashboard source inspected during the safety audit.

Even redacted views need an access policy before prototype exposure.

Operator and admin controls require stronger future governance and are not part
of Phase 98I.

## I. Write-Path Isolation Strategy

Future work should handle write paths as follows:

- `writeConfig`: keep it out of any read-only import path and quarantine it
  behind a later explicit config-mutation policy.
- `saveConfig`: isolate or remove it from read-only routes before any
  prototype.
- Config form: keep it out of read-only dashboard surfaces.
- Server actions: classify each server action as read-only, mutating, or
  forbidden before use.
- Future controls: keep controls absent from the read-only prototype.
- Action/approval/job pages: display bounded summaries only after redaction and
  access policy exist.
- Integrations page: treat configured/not-configured status as sensitive
  operational status.
- Dashboard config visibility: show summary-only metadata in any future
  read-only lane, never raw values.

## J. Future Source Architecture If Later Allowed

If a later phase allows source work, the safer architecture is:

- manifest-backed dashboard slice,
- no server actions,
- no config form,
- no write helpers,
- no raw store reads,
- static/advisory metadata only,
- redacted data adapter,
- smoke tests proving no writes,
- mutation routes disabled or separated.

This section is design only. Phase 98I implements none of it.

## K. Integration Plan

A future read-only dashboard may support:

- control-center readonly manifest,
- readiness/maturity metadata,
- runtime readiness validator,
- runtime doctor summaries,
- quality/evals/risk summaries,
- baseline/strict CI warning mode,
- enterprise demo advisory metadata,
- productization/release readiness,
- connector governance,
- safe self-improvement.

Those integrations must remain read-only, redacted, manifest-bound, and
non-executing.

## L. Verification And Smoke Plan For Future Prototype

Future prototype proof requirements:

- no write paths reachable,
- no server action mutation,
- no config form,
- no raw store reads,
- only manifest/static advisory data,
- no secrets,
- all routes read-only,
- no package or workflow changes.

## M. Safety Boundaries / Non-Goals

Phase 98I includes:

- no provider calls,
- no network,
- no filesystem mutation,
- no config writes,
- no `writeConfig` changes,
- no server action mutation,
- no store/memory mutation,
- no raw secret exposure,
- no raw config/token exposure,
- no dashboard operator controls,
- no action/proposal/approval execution,
- no automation/runtime/connector execution,
- no jobs execution,
- no package/workflow changes,
- no production-ready claims,
- no security/compliance guarantees.
