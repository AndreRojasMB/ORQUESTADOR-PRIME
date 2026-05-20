# Approval / Audit Hardening Plan

Phase: 142B - APPROVAL / AUDIT HARDENING PLAN

Status: planning / docs-only / advisory-only

## Purpose

Phase 142B plans the approval and audit hardening layer for
ORQUESTADOR-PRIME / Viernes after the Mobile Factory and manual loop pilots.
The phase strengthens human approvals, evidence, traceability, rollback posture,
next-action safety, and closeout confidence before any dashboard, runtime,
OpenClaw, provider, or semi-automated surface is considered.

This phase is a planning artifact only. It does not add source behavior, invoke
Codex from source, operate OpenClaw, automate prompt transfer, call providers,
write project files from source, mutate dashboards, touch DB/SQL, persist
memory, or perform source-control behavior from source.

## Approval Hardening Scope

Approval gates should exist before:

- prompt copy
- prompt paste
- manual Codex run
- accepting a human-submitted report
- selecting the next phase
- memory proposal acceptance
- future runtime action
- future OpenClaw action
- future provider action
- future dashboard mutation

Each gate should answer:

- Who is the required approver?
- What evidence is required?
- What is the default decision?
- Which decisions are allowed?
- Which conditions block the action?
- Is rollback required?
- Is audit metadata required?
- What limitations remain?

## Approval Gate Model

Future metadata should include:

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

Default decision should be `needs_review` for any medium or high risk action and
`blocked` for any future runtime, OpenClaw, provider, or dashboard mutation
surface until a later phase explicitly narrows the scope.

## Audit Trail Model

Future metadata should include:

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

Audit entries are metadata records, not persisted history in this phase.

## Evidence Model

Future metadata should include:

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

Evidence should be redacted when it contains secret material, environment
values, personal data, or protected operational detail.

## Hardening Risks

Known risks:

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

Risk handling:

- missing approval blocks the protected action
- weak evidence requires human review
- hidden unsafe action blocks continuation
- ambiguous actor requires a corrected audit entry
- unreviewed next phase returns to next-action review
- untracked report requires report-return retry
- memory proposal without approval remains unpersisted
- rollback impossible requires blocker status
- vague audit entry requires repair before closeout
- sensitive info in evidence requires redaction before use

## Candidate Gate Sequence

Recommended sequence for the manual loop:

1. Gate prompt package before human transfer.
2. Gate target session and scope before manual Codex run.
3. Gate human-submitted report before validation acceptance.
4. Gate validation and closeout before next phase.
5. Gate memory proposal before any future persistence.
6. Gate any future external action with default `blocked`.

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

## Integration

This plan consumes:

- Human-Approved Codex Handoff for approval states and safe-copy posture
- Manual Codex Handoff Trial for human transfer evidence
- Controlled Codex Report Return for validation, alert, and closeout evidence
- End-to-End Manual Loop Trial for stage and manual-action checkpoints
- Real User Manual Loop Instructions for operator steps
- Real User Loop Trial Report for evaluation and friction evidence
- Loop UX Hardening for stop conditions and wording
- next-action coordinator for routing posture
- phase closeout coordinator for closeout posture

The integration is passive and review-only.

## Future Implementation Split

Phase 142I should:

- define source-only metadata models for approval gates
- define source-only metadata models for audit entries
- define source-only evidence metadata
- add fixtures for approved, needs-review, and blocked paths
- add smoke checks for blocking decisions
- keep all helpers pure and advisory

Recommended next phase after 142I:

- Phase 143B - LOOP DASHBOARD READINESS PLAN

Fallback naming if the roadmap returns to pilot lane:

- PILOT-13B - LOOP DASHBOARD READINESS PLAN
