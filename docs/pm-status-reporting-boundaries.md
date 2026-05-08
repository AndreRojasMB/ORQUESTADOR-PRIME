# PM Status Reporting Boundaries

Phase: 109B - PM STATUS REPORTING PLAN

Status: safety boundary plan / docs-only

## Purpose

This document defines safety boundaries for future PM status reporting.

PM reports are advisory metadata. They should help humans understand project
state and decide the next safe planning step. They must not become execution
requests or operational triggers.

## Reporting Posture

PM status reporting should remain:

- report-only,
- source-only,
- metadata-only,
- advisory-only,
- deterministic,
- review-oriented.

Reports may describe what happened, what is blocked, what evidence is missing,
and what next action is recommended. Reports must not execute or apply those
recommendations.

## Source Boundary

Future source modules should not:

- read files,
- write files,
- read environment values,
- call networks,
- call providers,
- call dashboards,
- call git,
- call OpenClaw,
- send WhatsApp messages,
- run n8n,
- mutate memory,
- mutate stores,
- mutate DB/SQL,
- deploy.

All report inputs should be supplied by the caller as metadata.

## Dashboard Boundary

PM status reports may be suitable for future dashboard display, but Phase 109
must not create a dashboard data source, route, store, mutation, or widget.

Any future dashboard integration requires a separate plan with read-only data
contracts and explicit safety checks.

## Autopilot Boundary

PM reports may feed Autopilot handoff, validation, next-action, and closeout
metadata. Feeding means providing safe context. It does not mean invoking a
runner or continuing a phase by itself.

Autopilot remains a support lane. PM reports remain project-management reports.

## Approval Boundary

PM reports may describe approval requirements. They must not:

- create approval records,
- approve proposals,
- reject proposals,
- dispatch actions,
- write proposal stores,
- bypass human review.

Reports cannot approve their own recommendations.

## Memory Boundary

PM reports may describe what could be remembered later. They must not persist
memory.

Memory updates remain proposal-only until a separate approved persistence
design exists.

## Risk Boundary

High or critical risk should increase caution in the report, not unlock
execution.

Critical risk should recommend planning or human review only.

## Evidence Boundary

Evidence references should be metadata-only. They should identify the source of
confidence without requiring source modules to read files.

Evidence references should avoid secrets, raw logs, raw provider output,
credential material, webhook secrets, vault content, and production data.

## Stop Conditions

Future PM report building should stop or return a failed validation result when
caller metadata contains:

- unknown report type,
- missing phase reference,
- missing report id,
- invalid evidence reference,
- requested execution,
- requested persistence,
- raw secret-like material,
- future-gated autonomy beyond the current PM cap,
- live-adjacent import requirements.

## 109I Guardrail

Phase 109I should add source-only report types and pure report builder helpers.
It should not add package scripts, CLI entrypoints, live bridges, runtime
workers, provider calls, dashboard routes, persistent stores, job dispatch, or
external automation.
