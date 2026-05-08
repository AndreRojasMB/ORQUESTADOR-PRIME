# PM Status Reporting Plan

Phase: 109B - PM STATUS REPORTING PLAN

Status: planning / audit / docs-only

## Purpose

This document plans the Project Manager status reporting layer for
ORQUESTADOR-PRIME.

The PM Status Reporting layer should let the Project Manager Agent emit
structured report metadata about phase state, milestone health, completed work,
pending work, blockers, risks, Definition of Done gaps, approval requirements,
confidence, uncertainty, and recommended next action.

Phase 109B does not implement a report builder. It does not add runtime
behavior, provider calls, dashboard behavior, OpenClaw usage, WhatsApp
outbound, n8n usage, memory persistence, deployment, DB/SQL mutation, package
or workflow changes, or source-driven git changes.

## Current Context

The PM core now has source-only advisory models for:

- ProjectState,
- task graph and milestone planning,
- Definition of Done metadata,
- risk and blocker metadata,
- autonomy policy,
- approval gate contracts,
- next-best-action planning.

The Autopilot pivot also added source-only support infrastructure for:

- handoff prompt metadata,
- report validation,
- memory proposal metadata,
- next-action coordination,
- phase closeout and roadmap return.

Phase 109B returns to the formal post-100 roadmap and plans how PM status
reports should connect these pieces without triggering execution.

## PM Status Report Inputs

Future reports should accept caller-provided metadata only:

- ProjectState,
- current milestone,
- task graph,
- task summaries,
- Definition of Done validation,
- risk entries,
- blockers,
- approval plans,
- autonomy policy result,
- next-best-action recommendation,
- evidence references,
- SOLID findings placeholder,
- Autopilot closeout status placeholder,
- phase reference,
- assumptions and exclusions,
- confidence and uncertainty notes.

The report builder should not read stores, scan source files, query dashboards,
call providers, or inspect runtime state.

## PM Status Report Outputs

Future reports should output:

- executive summary,
- current phase,
- milestone health,
- completed work,
- pending work,
- blockers,
- risks,
- Definition of Done gaps,
- approval requirements,
- recommended next action,
- confidence,
- uncertainty,
- evidence references,
- report boundaries,
- non-execution flags.

The output should be report metadata. It should not be an action proposal, job,
approval record, dashboard mutation, runtime command, provider request, or
deployment request.

## Report Types

Recommended report types:

- `phase_status_report`,
- `milestone_status_report`,
- `blocker_report`,
- `risk_report`,
- `approval_readiness_report`,
- `next_action_report`,
- `roadmap_return_report`.

## Report Envelope

A PM report should likely include:

- report id,
- report type,
- schema version,
- phase reference,
- generated from metadata timestamp supplied by caller,
- safe title,
- safe summary,
- sections,
- findings,
- evidence references,
- confidence,
- uncertainty,
- recommended next action,
- boundaries.

The timestamp, if present, should be caller-provided metadata. The source module
should not read system time in the first implementation.

## Relationship To PM Core

Reports should summarize PM metadata rather than mutate it:

- ProjectState provides current phase and status.
- TaskGraph provides task and dependency summaries.
- MilestonePlanner provides milestone health.
- DoD validation provides gaps and evidence needs.
- Risk/Blocker models provide risks and blocked conditions.
- Approval Gate metadata provides review requirements.
- Autonomy Policy metadata provides allowed autonomy posture.
- Next Best Action metadata provides recommended advisory action.

## Relationship To Autopilot

PM status reports should feed:

- Codex handoff context,
- validation summaries,
- next-action coordinator inputs,
- phase closeout coordinator inputs,
- roadmap return explanation.

Reports must not trigger those stages automatically. They should be safe
context objects that a human or future source-only coordinator can review.

## Future 109I Implementation Plan

Recommended implementation scope:

- `src/pm/reportTypes.ts`,
- `src/pm/reportBuilder.ts`,
- `docs/pm-status-reporting.md`,
- optional `scripts/pm-status-reporting-tests.ts` if it follows existing
  script patterns without package changes.

Implementation should be source-only and pure:

- no filesystem reads or writes,
- no environment reads,
- no network calls,
- no command execution,
- no provider calls,
- no dashboard calls,
- no git calls,
- no memory persistence.

## Verification Plan For 109I

Recommended checks:

- `git status --short --branch`,
- `node node_modules/typescript/bin/tsc --noEmit`,
- Windows Node fallback when WSL Node is unavailable,
- targeted PM report smoke tests,
- `git diff --check`,
- `git diff --cached --check`,
- scope check over changed files only,
- forbidden grep over PM report source and docs.

## Non-Goals

Phase 109 does not:

- implement runtime reporting,
- publish reports,
- persist reports,
- wire reports to dashboard,
- call providers,
- send messages,
- create approvals,
- dispatch jobs,
- execute tasks,
- mutate ProjectState,
- write memory,
- create commits or pushes from source.
