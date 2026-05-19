# Semi-Automated Handoff Boundaries

Phase: PILOT-6B - SEMI-AUTOMATED HANDOFF SAFETY PLAN

Status: docs-only / source-only / advisory / metadata-only

## Boundary Purpose

This document defines the hard limits for any future semi-automated handoff
work. PILOT-6B does not create automation. It describes the conditions that
must be satisfied before later phases may even propose assistance around copy,
prompt insertion, or controlled handoff operations.

## Current Allowed Surface

Only `manual_only` is allowed now.

Allowed:

- produce advisory planning docs
- inspect existing source and documentation
- define future metadata fields
- define approval gates
- define risk and abort models
- run local verification commands requested for the planning phase
- leave all runtime and external surfaces untouched

## Current Forbidden Surface

Forbidden in this phase:

- source implementation
- system copy-buffer automation
- automated prompt insertion
- Codex invocation from source
- OpenClaw operation
- WhatsApp outbound behavior
- provider calls
- network/API calls
- source-stage file writes from a helper
- package or workflow changes
- CI activation
- DB/SQL mutation
- dashboard mutation
- secret or environment access
- memory persistence
- source-control behavior from source

## Future-Gated Surfaces

Future-gated means unavailable until a later phase defines a separate plan,
approval model, verification surface, and rollback posture.

| Surface | Current posture | Required before reconsideration |
| --- | --- | --- |
| Copy assistance | blocked | explicit human approval, complete prompt checks, audit metadata |
| Prompt insertion assistance | blocked | separate bridge plan, session targeting checks, abort controls |
| Codex UI handoff | blocked | dedicated operator review, report validation, closeout gates |
| OpenClaw-assisted handoff | blocked | separate OpenClaw bridge plan and human decision checkpoints |
| External provider activity | blocked | provider-specific plan, approval gate, dry-run evidence |
| Runtime file activity | blocked | dedicated runner plan, write scope, rollback proof |

## Execution Boundary Model

Future metadata should represent boundaries as explicit booleans:

- `sourceOnly`
- `advisoryOnly`
- `metadataOnly`
- `manualOnlyAllowedNow`
- `copyAssistanceFutureGated`
- `promptInsertionFutureGated`
- `codexRunFutureGated`
- `openClawFutureGated`
- `providerCallsForbidden`
- `filesystemWritesForbidden`
- `dashboardMutationForbidden`
- `dbSqlForbidden`
- `packageWorkflowChangesForbidden`
- `memoryPersistenceForbidden`
- `sourceControlFromSourceForbidden`

Any false value on a required safety flag must block the handoff.

## Human Confirmation Boundaries

Future phases must require human confirmation:

- before copy
- before prompt insertion
- before any Codex run in a future controlled phase
- before accepting a returned report
- before recommending a next phase
- before memory persistence
- before any external action

Confirmation must be explicit metadata supplied by a human reviewer. It cannot
be inferred from a passing checklist.

## Audit Boundary

Future audit metadata should capture:

- source artifact refs
- reviewer label
- reviewed-at label
- approval decision
- blocking gates
- accepted risks
- rejected risks
- abort reason
- safe next action
- limitations

Audit metadata is advisory. It does not persist memory or modify external
systems in this planning phase.

## Abort Boundary

Any of these should abort:

- missing human approval
- missing prompt safety boundaries
- missing allowed or forbidden file lists
- unsafe source-control posture
- package or workflow mutation request
- provider, dashboard, DB, runtime, network, or secret-material request
- report mismatch
- unknown target session
- requested level above `manual_only`

Abort should return a user-visible message and a safe next action.
