# Approval Gate Hardening Model

Phase: 142B - APPROVAL / AUDIT HARDENING PLAN

Status: planning / docs-only / advisory-only

## Purpose

The approval gate model defines future metadata for deciding whether a protected
action may proceed, needs review, or must remain blocked. Gates are advisory
records only.

## Approval Gate Metadata

Future approval gate records should include:

- `approvalGateId`
- `gateName`
- `protectedAction`
- `requiredApprover`
- `requiredEvidence`
- `defaultDecision`
- `allowedDecisions`
- `blockingConditions`
- `riskLevel`
- `rollbackRequired`
- `auditRequired`
- `limitations`

## Protected Actions

Allowed `protectedAction` values:

- `copy_prompt`
- `paste_prompt`
- `run_codex_manually`
- `accept_report`
- `continue_next_phase`
- `approve_memory_proposal`
- `approve_runtime_action_future`
- `approve_openclaw_action_future`
- `approve_provider_action_future`
- `approve_dashboard_mutation_future`

## Decision Values

Allowed decisions:

- `approved`
- `needs_review`
- `rejected`
- `blocked`

Default decisions:

- human transfer actions default to `needs_review`
- report acceptance defaults to `needs_review`
- next phase selection defaults to `needs_review`
- memory proposal acceptance defaults to `needs_review`
- future runtime, OpenClaw, provider, and dashboard mutation actions default to
  `blocked`

## Required Evidence By Action

### `copy_prompt`

Required evidence:

- `prompt_snapshot`
- `approval_decision`
- `dirty_file_state`

Blocking conditions:

- handoff is not `approved_for_copy`
- `safeToExecute` is true
- dirty files outside scope are staged
- prompt boundaries are missing

### `paste_prompt`

Required evidence:

- `prompt_snapshot`
- `approval_decision`
- target session label

Blocking conditions:

- target session is unclear
- prompt differs from approved snapshot
- protected file scope is unclear

### `run_codex_manually`

Required evidence:

- `approval_decision`
- target phase and mode
- final report format

Blocking conditions:

- target phase is not docs-only or metadata-only
- final report format is missing
- operator cannot confirm project or branch

### `accept_report`

Required evidence:

- `codex_report`
- `validation_summary`
- `forbidden_grep_result`
- `typecheck_result`
- `smoke_result`

Blocking conditions:

- report is not human-submitted
- report lacks required sections
- validation is blocked
- unsafe runtime/provider/package/workflow/dashboard/DB/SQL/secret-material
  claim appears

### `continue_next_phase`

Required evidence:

- `validation_summary`
- `closeout_summary`
- `next_action`

Blocking conditions:

- alert level is `blocking_alert`
- closeout is `blocked`
- closeout is `unsafe_scope`
- next phase conflicts with validation or closeout

### `approve_memory_proposal`

Required evidence:

- `closeout_summary`
- `next_action`
- redaction review

Blocking conditions:

- proposal includes secret material
- human approval is missing
- persistence target is undefined

### Future External Actions

Applies to:

- `approve_runtime_action_future`
- `approve_openclaw_action_future`
- `approve_provider_action_future`
- `approve_dashboard_mutation_future`

Required evidence:

- explicit future phase approval
- rollback plan
- audit plan
- risk review

Blocking conditions:

- no future implementation scope
- rollback is impossible
- audit metadata is missing
- human approval is missing

## Gate Examples

```text
approvalGateId: gate:copy_prompt
gateName: Prompt transfer approval
protectedAction: copy_prompt
requiredApprover: human_operator
requiredEvidence: prompt_snapshot, approval_decision, dirty_file_state
defaultDecision: needs_review
allowedDecisions: approved, needs_review, rejected, blocked
blockingConditions: handoff_not_approved, safe_to_execute_true, dirty_scope_staged
riskLevel: medium
rollbackRequired: rollback_review_required
auditRequired: true
limitations: metadata only; does not perform the transfer
```

```text
approvalGateId: gate:future_provider_action
gateName: Future provider action approval
protectedAction: approve_provider_action_future
requiredApprover: human_operator
requiredEvidence: future_phase_scope, rollback_plan, audit_plan
defaultDecision: blocked
allowedDecisions: blocked, needs_review
blockingConditions: no_future_scope, rollback_missing, audit_missing
riskLevel: high
rollbackRequired: rollback_impossible_blocked
auditRequired: true
limitations: future-gated; no provider call allowed
```

## Safety Boundaries

- docs-only
- advisory-only
- no source implementation
- no runtime behavior
- no Codex invocation from source
- no OpenClaw operation
- no system copy-buffer automation
- no provider calls
- no file writes from source
- no package/workflow changes
- no DB/SQL
- no dashboard mutation
- no memory persistence
- no source-control behavior from source
