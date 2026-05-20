# Audit Trail Hardening Model

Phase: 142B - APPROVAL / AUDIT HARDENING PLAN

Status: planning / docs-only / advisory-only

## Purpose

The audit trail hardening model defines future metadata for tracing decisions,
evidence, risk, rollback posture, and related approval gates. It is not a
persistence layer and does not write to an audit sink in this phase.

## Audit Trail Metadata

Future audit entries should include:

- `auditEntryId`
- `sourcePhase`
- `actionType`
- `actor`
- `decision`
- `evidenceRefs`
- `timestampLabel`
- `riskLevel`
- `redactionStatus`
- `rollbackHint`
- `relatedApprovalGate`
- `limitations`

## Evidence Metadata

Future evidence records should include:

- `evidenceId`
- `evidenceType`
- `source`
- `summary`
- `requiredFor`
- `redactionRequired`
- `confidence`
- `limitations`

Evidence types:

- `prompt_snapshot`
- `approval_decision`
- `codex_report`
- `validation_summary`
- `closeout_summary`
- `next_action`
- `dirty_file_state`
- `forbidden_grep_result`
- `typecheck_result`
- `smoke_result`
- `commit_push_status`

## Redaction Status

Allowed `redactionStatus` values:

- `not_required`
- `required_pending`
- `redacted`
- `blocked_sensitive`

Rules:

- secret material requires redaction
- environment values require redaction
- protected operational details require review
- blocked sensitive evidence cannot be used for continuation

## Confidence Labels

Allowed `confidence` values:

- `human_supplied`
- `local_command_output`
- `source_metadata`
- `needs_review`

The model should not pretend that human-supplied evidence is live proof. It
should preserve the source and confidence label.

## Audit Entry Examples

```text
auditEntryId: audit:accept_report:trial_001
sourcePhase: PILOT-11I
actionType: accept_report
actor: human_operator
decision: needs_review
evidenceRefs: report:trial_001, validation:trial_001, closeout:trial_001
timestampLabel: operator_supplied_label
riskLevel: medium
redactionStatus: not_required
rollbackHint: retry report return if validation is blocked
relatedApprovalGate: gate:accept_report
limitations: metadata only; does not inspect external sessions
```

```text
auditEntryId: audit:future_runtime_action:blocked
sourcePhase: Phase 142B
actionType: approve_runtime_action_future
actor: human_operator
decision: blocked
evidenceRefs: risk:future_runtime_boundary
timestampLabel: planning_label
riskLevel: high
redactionStatus: not_required
rollbackHint: no continuation without future scoped implementation plan
relatedApprovalGate: gate:future_runtime_action
limitations: future-gated; no runtime behavior allowed
```

## Evidence Examples

```text
evidenceId: evidence:prompt_snapshot:trial_001
evidenceType: prompt_snapshot
source: human_approved_handoff
summary: Prompt package reviewed, approved for human transfer, and not action-ready.
requiredFor: copy_prompt, paste_prompt
redactionRequired: false
confidence: source_metadata
limitations: does not prove external session content
```

```text
evidenceId: evidence:validation_summary:trial_001
evidenceType: validation_summary
source: controlled_report_return
summary: Validation passed with no blocking alert.
requiredFor: accept_report, continue_next_phase
redactionRequired: false
confidence: source_metadata
limitations: depends on human-submitted report text
```

## Hardening Risks

Risks to track:

- missing approval
- weak evidence
- hidden unsafe action
- ambiguous actor
- unreviewed next phase
- untracked report
- memory proposal without approval
- rollback impossible
- audit entry too vague
- sensitive info in evidence

## Review Rules

- Missing approval blocks the related protected action.
- Weak evidence routes to human review.
- Ambiguous actor requires corrected audit metadata.
- Untracked report requires report-return retry.
- Memory proposal without approval remains unpersisted.
- Rollback impossible blocks future external action.
- Sensitive evidence must be redacted or blocked.

## Integration

The audit model consumes:

- Human-Approved Codex Handoff approval states
- Manual Codex Handoff Trial manual evidence
- Controlled Codex Report Return validation and closeout summaries
- End-to-End Manual Loop Trial stage evidence
- Real User Manual Loop Instructions operator evidence labels
- Real User Loop Trial Report evaluation fields
- Loop UX Hardening stop conditions
- next-action coordinator recommendation posture
- phase closeout coordinator closeout posture

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
