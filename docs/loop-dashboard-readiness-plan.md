# Loop Dashboard Readiness Plan

Phase: 143B - LOOP DASHBOARD READINESS PLAN

Status: docs-only / advisory-only / planning

## Purpose

Plan the future dashboard readiness layer for the manual loop without building a
dashboard yet. The goal is to define what an operator should eventually see when
reviewing one loop run from idea intake through prompt draft, human approval,
manual handoff, report return, validation, closeout, next action, and
approval/audit evidence.

This phase covers the friction path:

```text
loop has friction -> dashboard/UX readiness -> clearer operator visibility
```

It does not add UI, mutate dashboard files, invoke Codex, operate OpenClaw,
perform copy/paste for the operator, call providers, write runtime files, touch
DB/SQL, persist memory, or change package/workflow surfaces.

## Scope

The future dashboard should show:

- current loop phase
- prompt draft status
- handoff approval status
- safety checklist status
- audit and evidence summary
- manual action checklist
- report validation result
- alert level
- closeout status
- next recommended action
- blocked or retry state
- unresolved questions
- dirty file warning
- human approval requirements

The dashboard readiness layer should stay passive. It can describe display state
and operator decisions; it cannot become a runner, automation surface, provider
caller, or persistence layer in this phase.

## Entry Criteria

- Phase 142I approval/audit metadata exists.
- Manual loop docs and execution report templates exist.
- Controlled report return and closeout status language exists.
- Known dirty files are visible to the operator and remain outside this phase's
  scope.
- Dashboard implementation is explicitly deferred.

## Exit Criteria

- Future dashboard state metadata is defined.
- Future dashboard card metadata is defined.
- Operator-facing UX labels and safety indicators are defined.
- Safety boundaries are explicit.
- Phase 143I implementation scope is limited to docs/source metadata, not UI.

## Proposed Future Artifacts

Phase 143I should remain source-only or docs-only unless a separate dashboard UI
phase is approved. Likely artifacts:

- `src/autopilot/loopDashboardReadiness.ts`
- `src/autopilot/loopDashboardFixtures.ts`
- `docs/loop-dashboard-readiness.md`
- optional `scripts/loop-dashboard-readiness-tests.ts`

Dashboard UI, routes, components, persistence, and real dashboard mutation are
not part of 143I.

## Dashboard State Model

Future metadata:

- `dashboardStateId`
- `loopRunRef`
- `currentStage`
- `promptDraftStatus`
- `handoffStatus`
- `approvalStatus`
- `auditStatus`
- `manualActionStatus`
- `reportReturnStatus`
- `validationStatus`
- `alertLevel`
- `closeoutStatus`
- `nextAction`
- `blockers`
- `warnings`
- `unresolvedQuestions`
- `evidenceRefs`
- `riskLevel`
- `limitations`

The state model should be a derived snapshot from existing loop metadata. It
should not introduce a second source of truth.

## Dashboard Cards

Future cards:

- Loop Overview
- Prompt Draft
- Approval Gate
- Manual Action Checklist
- Report Return
- Validation Result
- Closeout
- Next Action
- Audit Trail
- Blockers / Warnings

Each card should define:

- `cardId`
- `title`
- `purpose`
- `inputRefs`
- `visibleFields`
- `statusBadges`
- `primaryActionLabel`
- `disabledReason`
- `safetyNotes`
- `riskLevel`

Cards should prefer status display and review prompts over action buttons. Any
action label must be advisory, human-reviewed, and disabled when evidence is
missing.

## UX Model

The dashboard should use operator-friendly labels:

- "Current stage"
- "Manual action required"
- "Safe to continue?"
- "Do not proceed"
- "Needs human review"
- "Evidence missing"
- "Dirty files outside scope"
- "Next recommended phase"

Indicators:

- Continue: all required evidence present, no blocking alerts, closeout safe.
- Review: warnings, weak evidence, or mild alert.
- Stop: blocker, unsafe scope, missing approval, staged outside-scope files, or
  future-gated action.

Copy-ready wording must be clear:

- `approved_for_copy` means human transfer is allowed.
- It does not make the prompt action-ready.
- It does not authorize source-side external action.
- `safeToExecute` remains false unless a separate future phase changes the
  policy.

## Safety Boundaries

- docs-only
- advisory-only
- no dashboard implementation
- no dashboard mutation
- no source implementation
- no runtime execution
- no Codex invocation
- no OpenClaw operation
- no system copy-buffer automation
- no provider calls
- no file writes from source
- no package/workflow changes
- no DB/SQL
- no memory persistence
- no git automation from source

## Integration

Dashboard readiness consumes:

- Loop UX Hardening for operator labels, stop conditions, and friction
  categories.
- Approval / Audit Hardening for gates, evidence, risk, and rollback posture.
- Human-Approved Codex Handoff for prompt status and approval state.
- Manual Codex Handoff Trial for manual action checklist and report shape.
- Controlled Codex Report Return for validation, alert, and closeout states.
- End-to-End Manual Loop Trial for stage and manual action names.
- Next-action coordinator for recommended phase.
- Phase closeout coordinator for continuation status.

## Risks

- Dashboard could make manual-only steps look action-ready.
- Operators may treat `approved_for_copy` as permission for source-side action.
- Evidence visibility could expose sensitive material if redaction is not
  modeled.
- A dashboard without audit posture could hide blockers behind a green summary.
- Dirty file state could be stale if shown without timestamp or evidence
  references.

## Future Implementation Split

Phase 143I - LOOP DASHBOARD READINESS IMPLEMENTATION:

- implement source-only/advisory dashboard readiness metadata, or docs-only if
  implementation is not needed yet
- define fixtures for clean, review, and blocked loop states
- add docs for future dashboard behavior
- add smoke checks if source metadata is introduced
- no dashboard UI
- no dashboard mutation
- no runtime automation

Potential 144B candidates:

- Phase 144B - LOOP DASHBOARD WIREFRAME PLAN
- Phase 144B - CONTROLLED AUTOMATION DECISION PLAN
- Phase 141+ roadmap continuation if dashboard is not needed yet

## Next Recommended Phase

Phase 143I - LOOP DASHBOARD READINESS IMPLEMENTATION.
