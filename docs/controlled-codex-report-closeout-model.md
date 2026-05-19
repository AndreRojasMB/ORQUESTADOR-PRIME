# Controlled Codex Report Closeout Model

Phase: PILOT-8B - CONTROLLED CODEX REPORT RETURN PLAN

Status: planning / audit / docs-only

## Purpose

This document plans the future closeout model for Controlled Codex Report
Return. Closeout consumes normalized report metadata and validation metadata,
then produces a safe phase status, next phase recommendation, optional memory
proposal posture, and human-facing response metadata.

## Closeout Metadata

`ControlledCodexReportCloseout` should include:

- `closeoutId`
- `reportReturnRef`
- `validationRef`
- `closeoutStatus`
- `safeToContinue`
- `needsRetry`
- `needsHumanReview`
- `nextRecommendedPhase`
- `nextRecommendedMode`
- `memoryProposalAllowed`
- `requiredApprovals`
- `limitations`

## Closeout Statuses

- `closed_and_pushed`: implementation phase reports valid commit and push
  evidence
- `completed_local_only`: planning phase completed locally with no commit or
  push
- `needs_commit`: implementation phase passed but lacks commit evidence
- `needs_push`: implementation phase committed but lacks push evidence
- `needs_retry`: verification or smoke evidence failed and can be retried
- `needs_human_review`: evidence is incomplete or needs judgment
- `blocked`: validation reports blocking issues
- `unsafe_scope`: forbidden scope or unsafe mutation is reported

## Closeout Decision Rules

The future coordinator should classify:

- clean B-mode report -> `completed_local_only`
- clean I-mode report with commit and push evidence -> `closed_and_pushed`
- I-mode report without commit evidence -> `needs_commit`
- I-mode report without push evidence -> `needs_push`
- failed verification -> `needs_retry` or `needs_human_review`
- forbidden scope -> `unsafe_scope`
- unsafe claim -> `blocked`

## Next-Action Recommendation

Closeout should feed the existing next-action language:

- `continue_to_I_phase` for clean planning phases
- `continue_to_next_B_phase` for clean implementation phases
- `retry_phase` for failed checks that are fixable
- `request_human_review` for ambiguous evidence
- `blocked` for unsafe scope

The recommendation remains metadata only.

## Memory Proposal Candidate

`memoryProposalAllowed` may be true only when:

- validation is not blocked
- closeout status is safe
- no secret material is present
- the proposal remains review-only
- human approval is required before persistence

The report return layer must not persist memory.

## Human-Facing Response

The future human-facing response should summarize:

- alert level
- closeout status
- safe next phase
- reason for the decision
- unresolved issues
- whether a retry or human review is needed
- whether a memory proposal is available for review

The response should preserve the existing Autopilot pattern:

```text
1. Alerta
<label>

2. Siguiente fase
<phase and reason>

3. Modelo recomendado
<model>

4. Prompt listo para Codex
<prompt seed or unavailable message>
```

The prompt field is metadata text only.

## Integration Points

The future closeout should consume:

- report return metadata
- normalized report metadata
- validation metadata
- next-action coordinator metadata
- phase closeout coordinator metadata
- memory proposal builder metadata
- human-facing response renderer metadata
- future approval/audit metadata

It should also preserve lineage back to:

- Manual Codex Handoff Trial
- Controlled OpenClaw Paste Bridge
- Human-Approved Handoff

## Success Criteria

Closeout succeeds when:

- validation status is acceptable
- alert level is not blocking
- closeout status matches the phase mode
- next recommended phase is explicit
- memory proposal remains review-only
- required approvals are listed
- limitations are visible

## Block Criteria

Closeout blocks when:

- validation is blocked
- unsafe scope is reported
- secret material appears
- package/workflow mutation is claimed without approval
- provider, dashboard, DB, or runtime mutation is claimed
- required implementation commit/push evidence is missing and cannot be
  reconciled

## Safety Boundaries

- source-only
- advisory-only
- metadata-only
- no automatic external report retrieval
- no Codex invocation
- no OpenClaw operation
- no system copy-buffer automation
- no provider calls
- no network/API calls
- no file writes from source
- no package/workflow changes
- no DB/SQL
- no dashboard mutation
- no secret or environment access
- no memory persistence
- no source-control behavior from source

## Next Recommended Phase

If PILOT-8I implements this metadata safely, the next recommended phase should
be one of:

- PILOT-9B - END-TO-END MANUAL LOOP TRIAL PLAN
- Phase 141B - ROADMAP CONTINUATION PLAN
