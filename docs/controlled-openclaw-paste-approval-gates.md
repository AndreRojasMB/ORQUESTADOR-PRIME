# Controlled OpenClaw Paste Approval Gates

Phase: PILOT-7B - CONTROLLED OPENCLAW PASTE BRIDGE PLAN

Status: docs-only / source-only / advisory / metadata-only

## Purpose

This document defines future approval gates for a possible OpenClaw-assisted
prompt insertion bridge. Gates are metadata only. They do not operate tools,
move prompt text, or submit anything to Codex.

## Required Safety Gates

Future gate metadata should include:

- `gateId`
- `gateName`
- `category`
- `requiredCondition`
- `currentStatus`
- `blocking`
- `evidenceRefs`
- `requiredHumanDecision`
- `failureAction`
- `riskLevel`

Required gates:

- handoff is `approved_for_copy`
- no blocking handoff issues
- `safeToExecute` is false
- level is `manual_only` or separately approved future paste mode
- target application is user-confirmed
- target session is user-confirmed
- project context matches
- branch matches
- prompt label or hash is verified
- final human approval before prompt insertion
- final human approval before Enter/send
- abort is available
- no external action without approval
- report return path is available

## Approval Model

Future approval metadata:

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

Allowed decisions:

- `approve`
- `reject`
- `needs_review`
- `blocked`

Default decision:

- `needs_review`

## Target Session Verification Gates

Future target session checks:

- expected application label is present
- expected window title label is present
- expected project context is present
- expected branch is present
- user confirms target context
- confidence is sufficient
- uncertainty blocks
- failure action is safe and visible

These checks must remain human-mediated. They must not infer approval from
window text alone.

## Pre-Paste Checklist

Before prompt insertion:

- source handoff ref matches bridge ref
- source prompt ref matches approved prompt ref
- `approved_for_copy` is present
- `safeToExecute` is false
- no blocking handoff issue exists
- target session check passed
- final human approval exists
- abort path exists

## Pre-Submit Checklist

Before Enter/send:

- prompt text is visibly reviewable by the human
- target session is still confirmed
- human explicitly approves send step
- no new uncertainty appeared
- report return path remains available
- audit refs are ready

## Abort Model

Future abort fields:

- `abortId`
- `abortReason`
- `triggeredBy`
- `userVisibleMessage`
- `safeNextAction`
- `rollbackRequired`
- `auditRequired`
- `limitations`

Abort reasons:

- `session_identity_uncertain`
- `window_focus_uncertain`
- `prompt_label_mismatch`
- `handoff_not_approved`
- `safe_to_execute_not_false`
- `human_approval_missing`
- `scope_mismatch`
- `pre_send_review_missing`
- `report_return_missing`

Safe next actions:

- return to manual-only handoff
- request human review
- repair prompt metadata
- repair session metadata
- rerun report validation
- freeze next-action recommendation

## Gate Evaluation Rules

- Any failed blocking gate blocks the bridge.
- Human approval is required before every future external action.
- `approved_for_copy` never means action-ready.
- `safeToExecute` must stay false.
- A report cannot be trusted until validation and closeout metadata accept it.
- Unknown target state must abort instead of continuing.
