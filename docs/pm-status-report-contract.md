# PM Status Report Contract

Phase: 109B - PM STATUS REPORTING PLAN

Status: report contract plan / docs-only

## Purpose

This document defines the proposed contract for future PM status reports.

The contract should standardize report envelopes, sections, findings, evidence,
confidence, uncertainty, and next-action recommendations while keeping the
Project Manager Agent advisory and source-only.

## Proposed Report Types

Recommended report type values:

- `phase_status_report`,
- `milestone_status_report`,
- `blocker_report`,
- `risk_report`,
- `approval_readiness_report`,
- `next_action_report`,
- `roadmap_return_report`.

## Proposed Report Envelope

A future PM report should include:

- report id,
- schema version,
- report type,
- phase reference,
- safe title,
- safe summary,
- executive summary,
- sections,
- findings,
- evidence references,
- confidence,
- uncertainty,
- recommended next action,
- generated-from metadata,
- boundaries.

## Proposed Sections

Recommended section keys:

- `current_phase`,
- `milestone_health`,
- `completed_work`,
- `pending_work`,
- `blockers`,
- `risks`,
- `dod_gaps`,
- `approval_requirements`,
- `next_best_action`,
- `autopilot_context`,
- `confidence_uncertainty`,
- `evidence`.

## Proposed Findings

Findings should include:

- finding id,
- severity,
- reason code,
- safe message,
- related phase,
- optional task id,
- optional milestone id,
- optional risk id,
- optional blocker id,
- optional evidence references,
- metadata-only flags.

Severity should align with existing PM vocabulary where possible:

- info,
- warning,
- error,
- blocker.

## Proposed Inputs By Report Type

### phase_status_report

Inputs:

- ProjectState,
- current phase reference,
- completed and pending work,
- active blockers,
- risks,
- next-best-action recommendation.

### milestone_status_report

Inputs:

- milestone plan,
- milestone health,
- task graph summary,
- DoD gaps,
- risks and blockers.

### blocker_report

Inputs:

- blocker entries,
- affected tasks and milestones,
- evidence references,
- recommended planning action.

### risk_report

Inputs:

- risk entries,
- risk severity and surfaces,
- blocker relationships,
- approval requirements,
- recommended risk metadata review.

### approval_readiness_report

Inputs:

- approval plans,
- approval validation,
- risk level,
- evidence requirements,
- future-gated approval notes.

### next_action_report

Inputs:

- next-best-action result,
- autonomy policy result,
- blocker and risk state,
- DoD state,
- approval requirements.

### roadmap_return_report

Inputs:

- Autopilot closeout result,
- roadmap target,
- phase status,
- validation summary,
- unresolved blockers,
- next recommended phase.

## Output Constraints

PM reports should:

- use safe summaries,
- keep evidence references metadata-only,
- avoid raw secrets or raw logs,
- avoid operational commands,
- avoid claims of runtime readiness,
- avoid approval execution,
- avoid memory persistence,
- avoid dashboard mutation,
- avoid provider calls.

## Future Source Model

Phase 109I should likely define:

- `PMReportId`,
- `PMReportType`,
- `PMReportSectionKey`,
- `PMReportSection`,
- `PMReportFinding`,
- `PMReportConfidence`,
- `PMReportUncertainty`,
- `PMStatusReport`,
- `PMStatusReportInput`,
- `PMStatusReportResult`.

Most report-specific details should live in `src/pm/reportTypes.ts`; pure
builder helpers should live in `src/pm/reportBuilder.ts`.

## Future Builder Helpers

Recommended pure helpers:

- `buildPMStatusReport(...)`,
- `buildPhaseStatusReport(...)`,
- `buildMilestoneStatusReport(...)`,
- `buildBlockerReport(...)`,
- `buildRiskReport(...)`,
- `buildApprovalReadinessReport(...)`,
- `buildNextActionReport(...)`,
- `buildRoadmapReturnReport(...)`.

These helpers should accept caller-provided metadata and return structured
report metadata. They should not read, write, call, dispatch, persist, or
execute.

## Validation Expectations

Future validation should check:

- known report type,
- required report id,
- required phase reference,
- bounded safe summary,
- bounded section count,
- evidence references are metadata-only,
- no execution request,
- no persistence request,
- no live-adjacent import dependency,
- no source module filesystem behavior.

## Relationship To Phase 109I

Phase 109I should implement the contract conservatively. If any report builder
would need live data, stores, dashboards, providers, or runtime state, the
builder should instead require caller-provided metadata and return a finding
that the input is incomplete.
