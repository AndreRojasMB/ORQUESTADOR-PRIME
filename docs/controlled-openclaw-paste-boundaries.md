# Controlled OpenClaw Paste Boundaries

Phase: PILOT-7B - CONTROLLED OPENCLAW PASTE BRIDGE PLAN

Status: docs-only / source-only / advisory / metadata-only

## Boundary Purpose

This document defines the hard limits for the future Controlled OpenClaw Paste
Bridge. PILOT-7B is not a bridge implementation. It only describes future
contracts and stop conditions.

## Current Allowed Surface

Allowed now:

- docs-only planning
- source and docs inspection
- bridge metadata model planning
- target session verification model planning
- approval gate planning
- risk and abort model planning
- local verification commands

## Current Forbidden Surface

Forbidden now:

- source implementation
- OpenClaw operation
- system copy-buffer operation
- prompt insertion automation
- Enter/send automation
- Codex invocation
- provider calls
- network/API calls
- source-stage file writes
- package or workflow changes
- DB/SQL mutation
- dashboard mutation
- secret or environment access
- memory persistence
- source-control behavior from source

## Future-Gated Boundary

The bridge may be reconsidered only if a later phase proves:

- Semi-Automated Handoff Safety marks the requested level as explicitly approved
- Human-Approved Handoff has no blocking issues
- source handoff is `approved_for_copy`
- `safeToExecute` is false
- target application is manually confirmed
- session label is manually confirmed
- project context and branch match
- prompt label or hash matches the approved package
- human approval exists before focus
- human approval exists before prompt insertion
- human approval exists before Enter/send
- abort is available before every step
- report return path is defined

## Bridge Boundary Flags

Future bridge metadata should include:

- `sourceOnly`
- `advisoryOnly`
- `metadataOnly`
- `openClawFutureGated`
- `pasteFutureGated`
- `submitFutureGated`
- `codexRunForbidden`
- `systemCopyBufferForbidden`
- `providerCallsForbidden`
- `filesystemWritesForbidden`
- `dashboardMutationForbidden`
- `dbSqlForbidden`
- `packageWorkflowChangesForbidden`
- `memoryPersistenceForbidden`
- `sourceControlFromSourceForbidden`
- `humanApprovalRequired`

Any unsafe flag should block the bridge package.

## Human Review Boundary

Human review must be separate for:

- bridge package creation
- target application confirmation
- target session confirmation
- focus confirmation
- prompt identity confirmation
- prompt insertion approval
- Enter/send approval
- report acceptance
- next phase recommendation

Passing machine checks cannot replace human review.

## Audit Boundary

Future audit metadata should capture:

- source handoff ref
- prompt ref
- session check ref
- approval refs
- risk refs
- abort refs
- reviewer label
- decision labels
- report validation ref
- closeout ref

Audit metadata must remain passive unless a later implementation phase defines a
separate persistence plan.

## Stop Conditions

Stop immediately if:

- application identity is uncertain
- session identity is uncertain
- project context is uncertain
- branch is uncertain
- prompt ref is stale
- approval is missing
- `safeToExecute` is not false
- blocking handoff issue exists
- scope mismatch exists
- report return path is absent
- any external action is requested without approval
