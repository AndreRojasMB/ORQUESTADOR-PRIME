# Approval / Audit Hardening

## Purpose

Phase 142I adds source-only, advisory metadata for approval gates, audit trail entries, evidence records, risk posture, and rollback readiness around the manual loop. It strengthens the human-in-the-loop path before dashboard visibility, runtime preparation, OpenClaw operation, provider actions, or any other external side effect is considered.

The layer does not run tools, invoke Codex, operate OpenClaw, perform copy or paste for the operator, call providers, mutate dashboards, write runtime files, persist memory, or change package and workflow surfaces.

## Approval Gate Model

Approval gates protect actions that require an explicit human decision before the loop can continue.

Fields:

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

Protected actions:

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

Human approval remains required for each protected action. Future runtime, OpenClaw, provider, and dashboard actions remain gated and blocked until a separate approved phase defines them.

## Audit Trail Model

Audit entries describe who approved or rejected a protected action, what evidence supported the decision, and how to recover if the decision becomes unsafe.

Fields:

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

Audit metadata is intentionally passive. It records review posture; it does not perform the protected action.

## Evidence Model

Evidence records keep approval decisions grounded in concrete artifacts.

Fields:

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

Weak evidence moves the decision to review. Missing evidence blocks the protected action.

## Risk Model

Risks classify approval and audit weaknesses before they become unsafe actions.

Risk categories:

- `missing_approval`
- `weak_evidence`
- `hidden_unsafe_action`
- `ambiguous_actor`
- `unreviewed_next_phase`
- `untracked_report`
- `memory_proposal_without_approval`
- `rollback_impossible`
- `vague_audit_entry`
- `sensitive_evidence`

Blocking risks produce blocked decision metadata. Review-level risks keep the loop in human review.

## Decision Behavior

The decision helper evaluates:

- missing human approvals
- missing evidence required by gates
- weak evidence confidence
- redaction needs
- future-gated protected actions
- blocking risk records
- incomplete audit trail references

Decision states:

- `approved`
- `needs_review`
- `blocked`
- `rejected`

`approved` means the metadata is safe to continue to the next advisory phase. It does not authorize runtime actions or external automation.

## Integration

Approval / Audit Hardening consumes:

- Human-Approved Codex Handoff approval state and prompt evidence.
- Manual Codex Handoff Trial copy and report-return checkpoints.
- Controlled Codex Report Return validation and closeout metadata.
- End-to-End Manual Loop Trial stage evidence.
- Real User Manual Loop Instructions and execution report artifacts.
- Loop UX Hardening stop conditions and clearer operator wording.
- Next-action and closeout metadata as evidence for continuation.

It gives future dashboard readiness a stable approval and audit vocabulary before UI or persistence is introduced.

## Safety Boundaries

- source-only
- metadata-only
- advisory-only
- no runtime automation
- no Codex invocation from source
- no OpenClaw operation
- no system copy-buffer automation
- no provider calls
- no network calls
- no filesystem writes from source
- no package or workflow changes
- no DB/SQL mutation
- no dashboard mutation
- no memory persistence
- no git automation from source

## Limitations

- Audit entries are metadata and do not prove an external event happened unless the user supplies evidence.
- Evidence confidence is advisory and must be interpreted by a reviewer.
- Future runtime, OpenClaw, provider, and dashboard gates are blocked in this phase.
- No persistent audit store is added.
- No dashboard surface is added.

## Next Recommended Phase

Phase 143B - LOOP DASHBOARD READINESS PLAN.
