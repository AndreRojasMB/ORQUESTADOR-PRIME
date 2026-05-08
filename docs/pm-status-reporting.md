# PM Status Reporting

Phase: 109I - PM STATUS REPORTING IMPLEMENTATION

Status: source-only / report-only implementation

## Purpose

The PM Status Reporting layer emits structured Project Manager report metadata
for phase status, milestone health, blockers, risks, Definition of Done gaps,
approval readiness, next-best-action context, and roadmap return context.

Reports are designed to help humans and future source-only coordinators review
project state. They do not trigger execution, handoff, validation, closeout,
memory persistence, provider calls, dashboard mutation, git automation, or
runtime behavior.

## Implemented Source Files

- `src/pm/reportTypes.ts`
- `src/pm/reportBuilder.ts`
- `src/pm/index.ts`

## Report Types

Implemented report types:

- `phase_status_report`
- `milestone_status_report`
- `blocker_report`
- `risk_report`
- `approval_readiness_report`
- `next_action_report`
- `roadmap_return_report`

## Report Inputs

Report builders accept caller-provided metadata only:

- ProjectState or ProjectStateSummary
- current milestone
- task graph summary
- milestone health
- DoD validation results
- risk entries
- blockers
- approval plans and approval validation results
- autonomy policy result
- next-best-action result
- SOLID finding placeholders
- Autopilot closeout placeholder
- evidence references
- assumptions and exclusions
- confidence and uncertainty notes

The builder does not inspect stores, files, dashboards, providers, runtime
state, source control, memory, or external systems.

## Report Outputs

Every report result includes:

- report id
- schema version
- report type
- report status
- phase reference
- title and safe summary
- executive summary
- structured sections
- findings
- evidence references
- confidence
- uncertainty
- optional next-action metadata
- generated-from metadata supplied by the caller
- assumptions and exclusions
- PM boundaries and non-execution flags

## Sections

Implemented section keys:

- `current_phase`
- `milestone_health`
- `completed_work`
- `pending_work`
- `blockers`
- `risks`
- `dod_gaps`
- `approval_requirements`
- `next_best_action`
- `autopilot_context`
- `confidence_uncertainty`
- `evidence`

## Autopilot Integration

PM reports may feed future Codex handoff context, validation summaries,
next-action coordinator inputs, and phase closeout coordinator inputs.

This is context only. PM reporting does not call the handoff runner, does not
validate reports by itself, does not close phases, does not continue the
roadmap, and does not persist memory.

## Safety Boundaries

PM status reporting remains:

- source-only
- report-only
- advisory-only
- metadata-only
- deterministic from caller input

It does not:

- run a runtime executor
- launch processes
- call providers
- call OpenClaw
- send WhatsApp messages
- run n8n
- mutate dashboard state
- change packages or workflows
- mutate DB or SQL
- persist memory
- perform source-control operations from source
- approve its own recommendations

## Verification

Phase 109I verification should include TypeScript typecheck, the targeted PM
reporting smoke script, diff checks, scope checks, and forbidden-pattern review
over PM report source and documentation.
