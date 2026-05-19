# Controlled OpenClaw Paste Bridge

Status: source-only / advisory / metadata-only

## Purpose

PILOT-7I implements passive metadata for a future Controlled OpenClaw Paste
Bridge. It models bridge inputs, target-session checks, human approvals, safety
gates, risks, abort plans, decisions, summaries, fixtures, and smoke tests.

The implementation lives in:

- `src/autopilot/controlledOpenClawPasteBridge.ts`
- `src/autopilot/controlledOpenClawPasteFixtures.ts`

It does not operate OpenClaw, use the system copy buffer, insert prompt text,
send a prompt, invoke Codex, call providers, write project files from source,
mutate dashboards, persist memory, or change package/workflow/DB surfaces.

## Bridge Model

`ControlledOpenClawPasteInput` records:

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
- session checks
- approvals
- risks
- safety gates
- abort plans

`pasteAllowed` is metadata only. `submitAllowed` remains false in this phase.

## Session Verification Model

`ControlledOpenClawSessionCheck` records:

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

Unconfirmed or low-confidence sessions block the bridge.

## Approval Model

`ControlledOpenClawPasteApproval` records:

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

Every checkpoint must be explicitly approved before future-ready metadata can
pass.

## Risk Model

`ControlledOpenClawPasteRisk` records:

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

Risk categories include wrong focus, wrong Codex session, accidental send,
unsafe prompt, stale prompt, missing approval, prompt scope mismatch, secret
exposure, irreversible action, and report mismatch.

## Safety Gates

`ControlledOpenClawSafetyGate` records:

- `gateId`
- `gateName`
- `requiredCondition`
- `currentStatus`
- `blocking`
- `evidenceRefs`
- `failureAction`
- `riskLevel`

Blocking gates stop bridge readiness.

Required gate themes:

- handoff approved for copy
- no blocking handoff issues
- `safeToExecute` false
- target session user-confirmed
- prompt identity verified
- final human approval before prompt insertion
- final human approval before send
- abort available
- no external action without approval

## Abort Model

`ControlledOpenClawAbortPlan` records:

- `abortId`
- `abortReason`
- `triggeredBy`
- `userVisibleMessage`
- `safeNextAction`
- `rollbackRequired`
- `auditRequired`
- `limitations`

Abort plans recommend safe actions such as returning to manual-only handling or
repairing metadata.

## Helpers

Implemented helpers:

- `createControlledOpenClawPasteBridge(...)`
- `createControlledOpenClawSessionCheck(...)`
- `createControlledOpenClawPasteApproval(...)`
- `createControlledOpenClawPasteRisk(...)`
- `createControlledOpenClawSafetyGate(...)`
- `createControlledOpenClawAbortPlan(...)`
- `evaluateControlledOpenClawPasteBridge(...)`
- `summarizeControlledOpenClawPasteBridge(...)`
- `selectBlockingOpenClawGates(...)`
- `selectOpenClawRisksByCategory(...)`

All helpers are pure metadata functions.

## Decision Behavior

Rules:

- wrong session blocks
- missing approval blocks
- unsafe prompt blocks
- missing pre-paste checks block
- requested send capability blocks
- `pasteAllowed` can only be true as future-ready metadata after all gates pass
- `submitAllowed` is always false
- no helper operates tools or mutates files

## Integration

The bridge consumes:

- Semi-Automated Handoff Safety for future-gated automation posture
- Manual Codex Handoff Trial for manual handoff and report evidence
- Human-Approved Handoff for `approved_for_copy`, blockers, and `safeToExecute`
- Conversational Build Loop for prompt draft lineage
- report validation for returned report checks
- next-action coordinator for recommended phase
- phase closeout coordinator for final status
- future audit metadata for reviewer decisions

## Safety Boundaries

The implementation remains:

- source-only
- advisory-only
- metadata-only
- no OpenClaw operation
- no system copy-buffer operation
- no prompt insertion automation
- no send automation
- no Codex invocation
- no provider calls
- no source-stage file writes
- no package or workflow changes
- no DB/SQL
- no dashboard mutation
- no network/API calls
- no secret or environment access
- no memory persistence
- no source-control behavior from source

## Limitations

This phase does not create a live bridge, inspect a real window, move prompt
text, or submit anything. It only records future readiness metadata.

## Next Recommended Phase

Depending on human review:

- `PILOT-8B - CONTROLLED CODEX REPORT RETURN PLAN`
- or `Phase 141B - ROADMAP CONTINUATION PLAN`
