# Controlled OpenClaw Paste Bridge Plan

Phase: PILOT-7B - CONTROLLED OPENCLAW PASTE BRIDGE PLAN

Status: docs-only / source-only / advisory / metadata-only

## Purpose

This phase plans a future safety bridge for a possible OpenClaw-assisted prompt
insertion flow. It does not activate OpenClaw, does not move prompt text, does
not use a system copy buffer, does not start Codex, and does not operate a live
session.

The plan exists to decide what must be true before a later implementation phase
could even model a controlled bridge.

## Future-Only Scope

The bridge may only be considered after all of these are available as metadata:

- an approved handoff package
- `approved_for_copy` status
- `safeToExecute` remaining false
- manual target Codex session identity check
- human confirmation before target focus
- human confirmation before prompt insertion
- human confirmation before Enter/send
- abort path when focus, session, scope, or prompt identity is uncertain
- audit refs for every decision
- returned report path for validation and closeout

Current phase posture:

- planning only
- no source implementation
- no OpenClaw operation
- no prompt insertion
- no system copy-buffer operation
- no Codex invocation

## Bridge Model

Future metadata:

- `bridgeId`
- `sourceHandoffRef`
- `automationLevel`
- `targetApplication`
- `targetSessionLabel`
- `promptRef`
- `prePasteChecks`
- `pasteAllowed`
- `submitAllowed`
- `humanApprovalRequired`
- `abortConditions`
- `auditRefs`
- `riskLevel`
- `limitations`

Rules:

- `pasteAllowed` defaults to false.
- `submitAllowed` defaults to false.
- `humanApprovalRequired` is always true.
- `automationLevel` must come from Semi-Automated Handoff Safety.
- `safeToExecute` must remain false even when copy is approved.
- Any uncertain session or focus check blocks the bridge.

## Target Session Verification Model

Future metadata:

- `sessionCheckId`
- `expectedApplication`
- `expectedWindowTitleLabel`
- `expectedProjectContext`
- `expectedBranch`
- `userConfirmed`
- `confidence`
- `blocking`
- `failureAction`
- `riskLevel`

Required behavior:

- `userConfirmed` must be true before any focus-sensitive step.
- confidence below an explicit threshold blocks.
- mismatched project context blocks.
- mismatched branch blocks.
- unknown window title blocks.
- failure action should be `abort_and_return_to_manual_only`.

## Paste Approval Model

Future metadata:

- `approvalId`
- `bridgeId`
- `beforeAction`
- `decision`
- `approver`
- `evidenceRequired`
- `defaultDecision`
- `blockingIssues`
- `riskLevel`

Required checkpoints:

- `before_openclaw_activation`
- `before_focus_target`
- `before_paste`
- `before_submit`
- `before_accepting_codex_report`
- `before_next_phase`

Default decision is `needs_review`. Approval cannot be inferred from clean
checks.

## Risk Model

Future metadata:

- `riskId`
- `category`
- `description`
- `likelihood`
- `impact`
- `severity`
- `mitigation`
- `blocker`
- `rollbackHint`
- `requiredApproval`
- `limitations`

Risk categories:

- `wrong_window_focus`
- `wrong_codex_session`
- `accidental_submit`
- `unsafe_prompt`
- `stale_prompt`
- `missing_human_approval`
- `prompt_scope_mismatch`
- `secret_exposure`
- `irreversible_action`
- `report_mismatch`

## Safety Gates

Future gates:

- handoff is `approved_for_copy`
- no blocking handoff issues
- `safeToExecute` is false
- level is `manual_only` or a separately approved future paste level
- target session is confirmed by user
- prompt hash or label is verified
- final human approval before prompt insertion
- final human approval before Enter/send
- abort path is available
- no external action occurs without approval metadata

Any failed gate blocks the bridge.

## Abort Model

Future metadata:

- `abortId`
- `abortReason`
- `triggeredBy`
- `userVisibleMessage`
- `safeNextAction`
- `rollbackRequired`
- `auditRequired`
- `limitations`

Baseline abort reasons:

- `session_identity_uncertain`
- `window_focus_uncertain`
- `prompt_label_mismatch`
- `handoff_not_approved`
- `safe_to_execute_not_false`
- `human_approval_missing`
- `scope_mismatch`
- `pre_send_review_missing`
- `report_return_missing`

Abort should recommend returning to manual-only handling or repairing metadata.

## Safety Boundaries

This phase remains:

- source-only
- advisory-only
- metadata-only
- no OpenClaw operation
- no system copy-buffer automation
- no prompt insertion automation
- no Enter/send automation
- no Codex invocation
- no WhatsApp outbound
- no provider calls
- no source-stage file writes
- no package or workflow changes
- no DB/SQL
- no dashboard mutation
- no secret or environment access
- no memory persistence
- no source-control behavior from source

## Integration

The planned bridge consumes:

- Semi-Automated Handoff Safety for level and gate posture
- Manual Codex Handoff Trial for manual-copy and report-return evidence
- Human-Approved Handoff for `approved_for_copy`, blocking issues, and `safeToExecute`
- Conversational Build Loop dry-run for source prompt metadata
- report validation for returned report checks
- next-action coordinator for the next phase recommendation
- phase closeout coordinator for completion status
- future approval/audit metadata for reviewer decisions

## Future Implementation Split

Future PILOT-7I safe scope:

- create `src/autopilot/controlledOpenClawPasteBridge.ts`
- create `src/autopilot/controlledOpenClawPasteFixtures.ts`
- update `src/autopilot/index.ts`
- create `docs/controlled-openclaw-paste-bridge.md`
- optional `scripts/controlled-openclaw-paste-bridge-tests.ts`

PILOT-7I must remain metadata-only unless a separate human-approved phase
explicitly changes that boundary.

## Future After PILOT-7I

Recommended next phase depends on safety result:

- `PILOT-8B - CONTROLLED CODEX REPORT RETURN PLAN`
- or `Phase 141B - ROADMAP CONTINUATION PLAN`
