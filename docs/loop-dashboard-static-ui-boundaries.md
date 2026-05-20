# Loop Dashboard Static UI Boundaries

Phase: 145B - LOOP DASHBOARD STATIC UI PLAN

Status: docs-only / advisory-only / safety boundaries

## Purpose

Define the boundaries for a future static dashboard view of the manual loop. The
future UI may display loop metadata, evidence, and recommendations. It must not
perform the loop.

## Allowed Future Surface

A future static UI may:

- render fixture-backed loop state
- render readiness and wireframe metadata
- show prompt/handoff status
- show approval and audit evidence summaries
- show manual action checklist state
- show report return metadata
- show validation and closeout status
- show next-action recommendation
- show blockers, warnings, and unresolved questions
- show disabled actions with visible reasons
- show operator guidance for manual review

## Blocked Future Surface

A future static UI must not:

- create or modify project files
- mutate dashboard state
- dispatch runtime actions
- invoke Codex
- operate OpenClaw
- drive prompt transfer on behalf of the operator
- call providers
- call network APIs
- read or mutate DB/SQL
- persist memory
- change package/workflow surfaces
- perform source-control behavior
- infer approval from incomplete evidence
- hide blockers behind optional detail

## Data Boundaries

Initial data must be local, static, and reviewable:

- local fixture first
- source-only Autopilot metadata
- no provider-backed data
- no database-backed data
- no external session data
- no live dashboard mutation
- no stored trial result persistence

The static UI may depend on explicitly imported fixtures only in a future
approved implementation phase. It should not discover or retrieve data at
runtime.

## Action Boundaries

All visible actions in the future static UI should be labels, disabled buttons,
or navigation hints until a later approved phase changes that boundary.

Allowed labels:

- Review prompt
- Review approval
- Review audit evidence
- Review report
- Review validation
- Review closeout
- Review next action
- Open blockers

Blocked labels:

- Run protected action
- Complete manual step
- Send to external tool
- Submit to external tool
- Mutate dashboard
- Persist memory

## Safety Badges

The future UI should use status labels that make the boundary obvious:

- Safe to continue
- Needs human review
- Manual action required
- Evidence missing
- Blocked
- Closeout ready
- Next phase ready

Stop-level badges must appear before optional details. Continue-level badges
must include the evidence that supports them.

## Review Rules

The future UI must stop the operator when:

- approval is missing
- evidence is missing or weak
- report validation has a blocking alert
- closeout is blocked or unsafe
- dirty file state is unknown
- protected scope is unclear
- next phase conflicts with closeout
- a future-gated action appears available

The future UI may show a review state when:

- evidence exists but needs human confirmation
- validation has a mild alert
- closeout needs human review
- manual action evidence is incomplete
- the next phase is useful but not yet approved

## Explicit Non-Goals

- no dashboard implementation
- no UI components
- no route creation
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

## Implementation Readiness Criteria

Phase 145I should proceed only if it can remain one of these:

- docs-only static UI implementation plan
- source-only metadata for a future static UI
- fixture-only model that does not touch dashboard files

If dashboard files must change, the work should be re-scoped into a later
explicit UI phase with separate approval.

## Next Recommended Phase

Phase 145I - LOOP DASHBOARD STATIC UI IMPLEMENTATION.
