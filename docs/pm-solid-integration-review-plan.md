# PM/SOLID Integration Review Plan

Phase: 120B - PM + SOLID INTEGRATION REVIEW PLAN

Status: planning / audit / docs-only

## Purpose

Phase 120B plans the integration review that closes the immediate PM and
Architecture Quality block:

- Phases 101-110: PM Core.
- Phases 111-119: SOLID / Architecture Quality Core.

The review is intended to verify that PM reports, SOLID findings, architecture
findings, report envelopes, and Autopilot support contracts can share metadata
without activating runtime behavior.

This phase does not implement integration source, runtime wiring, validators,
source readers, PM hooks, dashboard behavior, provider behavior, database
behavior, CI activation, release behavior, or refactor execution.

## Integration Review Scope

The Phase 120 integration review should cover:

- PM Core 101-110: project state, task graph, DoD, risk, blocker, autonomy,
  approval, next-best-action, PM reports, and PM Core closure.
- SOLID / Architecture Quality Core 111-119: SOLID charter, module boundaries,
  dependency inversion, smell taxonomy, review checklist, validator core,
  frontend rules, backend rules, and PM/SOLID report envelopes.
- Autopilot support infrastructure from the 26G-26K pivot: handoff context,
  report validation, memory proposal metadata, next-action coordination, and
  phase closeout coordination.
- PM/SOLID report envelopes from Phase 119I as the shared metadata wrapper.
- Readiness for Phase 120I implementation.
- Readiness for the next formal block, Phase 121-140.

## PM To SOLID Integration Model

Future Phase 120I should define a source-only metadata flow from architecture
signals into PM coordination metadata.

Architecture-side inputs:

- SOLID findings.
- Module boundary findings.
- Dependency inversion findings.
- Architecture smell findings.
- Review checklist findings.
- SOLID validator reports.
- Frontend responsibility findings.
- Backend layering findings.
- Architecture report envelopes.

PM-side outputs:

- PM status report context.
- PM risk entries.
- PM blocker candidates.
- Approval readiness metadata.
- Next-best-action metadata.
- Phase closeout context.
- Autopilot context.

Recommended flow:

1. A caller supplies architecture findings or an architecture report envelope.
2. A PM/SOLID hook normalizes severity, risk, evidence, and approval metadata.
3. The normalized record becomes a PM risk or blocker candidate.
4. PM reporting can include the record as evidence and uncertainty context.
5. Next-best-action can recommend human review, planning, or deferral.
6. Autopilot can use the envelope as context only.

The flow must not start handoff, validation, memory persistence, closeout,
approval, source modification, runtime behavior, or source-control behavior.

## Risk Escalation Model

Phase 120I should define PM/SOLID risk escalation metadata with these fields:

- `sourceFindingRef`
- `sourceReportRef`
- `targetPmRiskRef`
- `severity`
- `riskLevel`
- `blockerCandidate`
- `approvalRequirement`
- `suggestedMitigation`
- `evidenceRefs`
- `nextActionRecommendation`
- `humanReviewRequired`

Escalation is advisory. It should describe how a finding may become PM risk or
blocker metadata, not create live records or execute follow-up work.

## Integration Boundaries

The integration review must preserve:

- source-only behavior,
- report-only and advisory-only behavior,
- caller-supplied metadata posture,
- no automatic handoff,
- no validation execution,
- no memory persistence,
- no runtime execution,
- no process launch from source,
- no provider calls,
- no dashboard mutation,
- no CI activation,
- no CI configuration edits,
- no package command changes,
- no SARIF file emission,
- no OpenClaw operation,
- no WhatsApp outbound behavior,
- no n8n behavior,
- no database or SQL state changes,
- no deployment or release behavior,
- no scanner behavior,
- no syntax-tree parsing,
- no repository reading,
- no automatic import detection,
- no refactor execution,
- no source-control behavior from source.

## Future 120I Implementation Plan

Recommended safe implementation scope:

- Create `src/pm/solidHooks.ts`.
- Update `src/pm/index.ts` only if the hook surface needs a public export.
- Create `docs/pm-solid-integration-review.md`.
- Optionally create `scripts/pm-solid-integration-review-tests.ts` if it can run
  without package manifest changes.

The hook should be pure and metadata-only. It should accept caller-provided
PM/SOLID findings or report envelopes and return advisory PM risk, blocker,
approval, next-action, and closeout context.

Explicit non-goals for 120I:

- no runtime wiring,
- no source scanning,
- no source-tree parsing,
- no automatic import detection,
- no dashboard integration,
- no provider execution,
- no database or SQL activity,
- no CI configuration changes,
- no package command changes,
- no release or deployment behavior.

## Block 101-120 Readiness Model

Phase 120I should report:

- PM Core readiness.
- SOLID Core readiness.
- Autopilot support readiness.
- Report envelope readiness.
- Known limitations.
- Deferred runtime items.
- Safe next block target.
- Future dry-run pilot recommendation.

Recommended readiness classifications:

- `ready_for_120I`
- `needs_docs_alignment`
- `needs_source_export_review`
- `needs_smoke_coverage`
- `blocked_by_scope`
- `deferred_runtime`
- `ready_for_121B`
- `pilot_candidate_after_120I`

## Return Path

After Phase 120I closes cleanly, the next formal target should be:

- Phase 121B - MOBILE APP FACTORY STRATEGY PLAN

After Phase 120I closes cleanly, a separate controlled pilot can be considered:

- Phase PILOT-1B - AUTOPILOT REAL DRY-RUN PLAN

The pilot is outside Phase 120B and must not be implemented here.
