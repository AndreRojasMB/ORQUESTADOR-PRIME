# Loop Dashboard Boundaries

Phase: 143B - LOOP DASHBOARD READINESS PLAN

Status: docs-only / advisory-only / boundary model

## Purpose

Define the safety boundaries for any future loop dashboard readiness work. This
document keeps Phase 143B focused on display planning and prevents dashboard
readiness from becoming runtime control, external automation, or persistence.

## Allowed In 143B

- Plan dashboard state fields.
- Plan dashboard card fields.
- Plan operator-facing labels and status badges.
- Plan evidence visibility.
- Plan stop/continue indicators.
- Plan future implementation boundaries.
- Document how dashboard readiness consumes existing loop metadata.

## Not Allowed In 143B

- Dashboard UI implementation.
- Dashboard route, component, or layout changes.
- Dashboard data persistence.
- Runtime execution.
- Codex invocation.
- OpenClaw operation.
- System copy-buffer automation.
- Provider calls.
- Network/API calls.
- Source-side project file writes.
- Package or workflow changes.
- DB/SQL changes.
- Memory persistence.
- Source-control automation from source.

## Future Dashboard Boundary

A future dashboard should be read-only by default. It may present:

- current loop stage
- approval and audit state
- report validation state
- closeout state
- next recommended action
- required human decisions
- blockers and warnings
- evidence references

It must not:

- infer missing approvals
- hide blocking evidence
- present future-gated actions as available
- imply source-side automation
- store sensitive evidence without redaction policy
- mutate dashboard state from advisory metadata without approval

## Human Approval Boundary

Dashboard readiness must preserve human-in-the-loop control:

- human approval is required before manual prompt transfer
- human approval is required before report acceptance
- human approval is required before next phase selection
- human approval is required before any future runtime, OpenClaw, provider, or
  dashboard mutation action

The dashboard can show approval requirements. It cannot grant approval by
displaying them.

## Evidence Boundary

Evidence shown in a future dashboard should be:

- referenced by id
- summarized for scanning
- redacted when needed
- tied to the protected action it supports
- marked stale if the underlying repo state changes

Evidence should not include secret material, private environment values,
provider payloads, or production data.

## Dirty File Boundary

Dirty file visibility should show:

- known outside-scope dirty files
- staged file warning
- protected file warning
- evidence timestamp or label
- operator review state

The dashboard must not stage, revert, or modify files.

## Stop Boundary

The dashboard should show a hard stop when:

- approval is missing
- evidence is missing
- alert level is `blocking_alert`
- closeout is `blocked` or `unsafe_scope`
- outside-scope dirty files are staged
- forbidden files are touched
- future-gated action is requested
- `safeToExecute=true` appears unexpectedly

## Continue Boundary

The dashboard may show "safe to continue" only when:

- handoff is approved for manual copy
- `safeToExecute=false`
- required evidence exists
- audit status is acceptable
- validation has no blocking alert
- closeout is safe
- next action is explicit
- no protected scope issue is present

## Safety Summary

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
- no network/API calls
- no source-side file writes
- no package/workflow changes
- no DB/SQL
- no memory persistence
- no git automation from source

## Next Boundary Review

Phase 143I should keep these boundaries intact. If 143I proposes source metadata,
it must remain passive and should not import or mutate dashboard code.
