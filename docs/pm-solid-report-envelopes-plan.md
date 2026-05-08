# PM/SOLID Report Envelopes Plan

Phase: 119B - PM/SOLID REPORT ENVELOPES PLAN

Status: planning / audit / scope

## Purpose

PM/SOLID Report Envelopes will define a shared source-only and report-only
contract for PM reports and Architecture/SOLID reports. The goal is to make
report metadata consistent enough for humans, future local formatters, and
future CI-compatible adapters without activating CI or writing output files.

This phase does not implement report envelope code. It creates the technical
plan for Phase 119I.

## Report Envelope Scope

The envelope standard should wrap:

- PM status reports,
- PM phase, milestone, blocker, risk, approval, next-action, and roadmap
  return reports,
- SOLID architecture findings,
- module boundary findings,
- Dependency Inversion findings,
- architecture smell findings,
- review checklist findings,
- validator reports,
- frontend responsibility findings,
- backend layering findings.

The scope is metadata only. Envelopes should not publish reports, write local
files, start runtime behavior, call providers, mutate dashboards, or trigger
approvals.

## Shared Report Envelope Model

The future `ReportEnvelope` metadata should include:

- `envelopeId`
- `schemaVersion`
- `source`
- `reportKind`
- `phaseRef`
- `generatedAtLabel`
- `status`
- `severity`
- `summary`
- `findings`
- `evidenceRefs`
- `limitations`
- `recommendedNextAction`
- `riskLevel`
- `approvalRequired`
- `pmEscalation`
- `autopilotUse`
- `ciCompatibility`
- `sarifReadyMetadata`

The shared envelope should be deterministic from caller-provided metadata. The
timestamp field is a label supplied by the caller, not a clock read.

## PM Report Envelope Model

The future `PMReportEnvelope` metadata should include:

- `pmReportRef`
- `projectStateRef`
- `milestoneRef`
- `phaseRef`
- `blockers`
- `risks`
- `approvals`
- `dodGaps`
- `nextAction`
- `confidence`
- `uncertainty`
- `evidenceRefs`

PM envelopes should wrap PM Status Reporting and PM Core Review outputs. They
should preserve report-only behavior and should not start PM builders unless
called directly by source-only implementation code in a future approved phase.

## Architecture/SOLID Report Envelope Model

The future `ArchitectureReportEnvelope` metadata should include:

- `architectureReportRef`
- `architectureLayer`
- `solidFindings`
- `boundaryFindings`
- `dependencyFindings`
- `smellFindings`
- `reviewFindings`
- `validatorSummary`
- `frontendFindings`
- `backendFindings`
- `severityCounts`
- `limitations`
- `evidenceRefs`

Architecture envelopes should wrap caller-provided architecture metadata from
the SOLID Architecture Layer, Module Boundary Rules, Dependency Inversion
Rules, Architecture Smell Taxonomy, SOLID Review Checklist, SOLID Validator
Core, Frontend Responsibility Rules, and Backend Layering Rules.

## Status and Severity Model

Planned envelope statuses:

- `passed`
- `warning`
- `failed`
- `needs_review`
- `blocked`
- `insufficient_evidence`

Planned envelope severities:

- `info`
- `low`
- `medium`
- `high`
- `critical`

Status and severity are advisory metadata. They must not fail builds, block
branches, or trigger execution by themselves.

## CI/SARIF-Ready Contract

The CI/SARIF-ready posture is compatibility only:

- no CI activation,
- no CI configuration edits,
- no hosted action configuration edits,
- no package command changes,
- no CI blocking behavior,
- no SARIF file emission,
- no report artifact publication,
- no quality gate activation,
- no package manifest edits.

Future metadata may include enough fields for a later mapper, but Phase 119B
and the planned 119I MVP should not create CI output files or upload anything.

## Future Stdout and Local Report Strategy

Future phases may plan:

- local report formatter,
- stdout formatter,
- JSON envelope serialization,
- SARIF mapper,
- PM/SOLID report snapshots.

Phase 119B only defines the contract. Phase 119I should stay source-only and
should avoid runtime wiring or file emission unless a later phase explicitly
approves a bounded formatter.

## Safety Boundaries

Report envelopes must remain:

- report-only,
- advisory-only,
- source-only,
- metadata contracts only,
- no CI activation,
- no CI configuration edits,
- no package command changes,
- no filesystem writes from source,
- no runtime execution,
- no process launch,
- no providers,
- no dashboard mutation,
- no OpenClaw,
- no WhatsApp outbound,
- no n8n,
- no memory persistence,
- no source-control behavior from source,
- no env or network access,
- no database or SQL state changes,
- no release rollout,
- no scanners,
- no syntax-tree parsing,
- no repository reading,
- no automatic import detection,
- no refactor execution.

## PM Integration

PM report envelopes may wrap:

- PM Status Reporting,
- PM Core Review summaries,
- next-best-action recommendations,
- approval readiness metadata,
- blocker and risk reports,
- milestone health and DoD gap metadata.

The envelope should preserve PM source-only boundaries and should not mutate
PM state.

## SOLID and Architecture Integration

Architecture envelopes may wrap:

- SOLID Validator Core reports,
- SOLID Review Checklist findings,
- Architecture Smell Taxonomy findings,
- Module Boundary Rules findings,
- Dependency Inversion Rules findings,
- Frontend Responsibility Rules findings,
- Backend Layering Rules findings.

The envelope should aggregate metadata only. It should not run validators,
read source trees, or execute refactors.

## Autopilot Integration

Report envelopes may later feed:

- Codex handoff context,
- validation memory proposal context,
- next-action coordinator inputs,
- phase closeout coordinator inputs.

This is context only. Envelopes must not trigger handoff, validation, memory
write, execution, approval, commit, push, or closeout automatically.

## Future 119I Implementation Plan

The safe implementation scope for Phase 119I should be:

- create `src/pm/cli/report.ts`,
- create `src/architecture/cli/report.ts`,
- create `docs/pm-solid-ci-contract.md`,
- optionally create `scripts/pm-solid-report-envelope-tests.ts` if it can run
  without package changes.

Phase 119I should not change package metadata, CI configuration, runtime
wiring, source tree scanners, provider code, dashboard code, database assets,
or release behavior.

Any SARIF-related work in 119I should be limited to static metadata shape or a
pure mapping helper if explicitly kept source-only and without file emission.

## Verification Plan

Phase 119B verification should confirm:

- only documentation changed,
- no source implementation was added,
- no package metadata changed,
- no CI configuration changed,
- no CI behavior was activated,
- no SARIF output was emitted,
- no runtime executor was added,
- no process launch was added,
- no provider calls were added,
- no dashboard mutation was added,
- no secrets or network behavior were touched,
- no database or SQL state changes were added,
- no memory persistence was added,
- no source-control behavior from source was added,
- no scanner behavior was added,
- no syntax-tree parsing was added,
- no repository reading was added,
- no automatic import detection was added,
- no refactor execution was added.

## Return Path

After Phase 119I, the next formal target should be:

- Phase 120B - PM + SOLID INTEGRATION REVIEW PLAN
