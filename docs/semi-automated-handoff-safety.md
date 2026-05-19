# Semi-Automated Handoff Safety

Status: source-only / advisory / metadata-only

## Purpose

PILOT-6I implements a passive safety layer for future semi-automated handoff
work. It defines automation levels, safety gates, risk records, approval
checkpoints, abort plans, decisions, summaries, and fixtures.

The implementation lives in:

- `src/autopilot/semiAutomatedHandoffSafety.ts`
- `src/autopilot/semiAutomatedHandoffFixtures.ts`

It does not operate Codex, move prompt text, use OpenClaw, use WhatsApp, call
providers, write project files from source, mutate dashboards, persist memory,
or change package/workflow/DB surfaces.

## Automation Level Model

`SemiAutomatedHandoffAutomationLevel` records:

- `automationLevelId`
- `levelName`
- `description`
- `allowedActions`
- `forbiddenActions`
- `humanApprovalRequired`
- `riskLevel`
- `requiredEvidence`
- `limitations`
- `currentlyAllowed`
- `futureGated`

Supported levels:

- `manual_only`
- `copy_assisted_future`
- `paste_assisted_future`
- `execute_assisted_future`
- `blocked`

Only `manual_only` is currently allowed. Assisted levels are always
future-gated in this phase.

## Safety Gate Model

`SemiAutomatedHandoffSafetyGate` records:

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

Gate categories cover prompt completeness, prompt safety, human approval, file
scope, secrets, runtime, providers, database, dashboard, package/workflow,
future copy-buffer behavior, future OpenClaw handoff, future Codex run handling,
and report validation.

## Risk Model

`SemiAutomatedHandoffRisk` records:

- `riskId`
- `riskCategory`
- `description`
- `likelihood`
- `impact`
- `severity`
- `mitigation`
- `blocker`
- `requiredApproval`
- `rollbackHint`
- `limitations`

Risk categories include accidental paste, wrong Codex session, unsafe prompt,
missing human approval, forbidden file scope, secrets exposure, runtime,
provider, database, dashboard, package/workflow, and report mismatch risks.

## Approval Checkpoint Model

`SemiAutomatedHandoffApprovalCheckpoint` records:

- `checkpointId`
- `checkpointName`
- `beforeAction`
- `requiredDecision`
- `allowedDecisions`
- `defaultDecision`
- `approver`
- `evidenceRequired`
- `riskLevel`
- `limitations`

Required checkpoints:

- `before_copy`
- `before_paste`
- `before_codex_execution`
- `before_accepting_report`
- `before_next_phase`
- `before_memory_write`
- `before_any_external_action`

Human approval is required before every future external action.

## Abort And Rollback Model

`SemiAutomatedHandoffAbortPlan` records:

- `abortReason`
- `triggeredByGate`
- `userVisibleMessage`
- `safeNextAction`
- `rollbackNeeded`
- `rollbackScope`
- `auditRequired`
- `limitations`

Abort plans are metadata-only. They recommend safe next actions such as
returning to manual-only handling, repairing prompt metadata, or requesting
human review.

## Helpers

Implemented helpers:

- `createSemiAutomatedHandoffSafety(...)`
- `createSemiAutomatedAutomationLevel(...)`
- `createSemiAutomatedSafetyGate(...)`
- `createSemiAutomatedHandoffRisk(...)`
- `createSemiAutomatedApprovalCheckpoint(...)`
- `createSemiAutomatedAbortPlan(...)`
- `evaluateSemiAutomatedHandoffSafety(...)`
- `summarizeSemiAutomatedHandoffSafety(...)`
- `selectBlockingSemiAutomatedGates(...)`
- `selectSemiAutomatedRisksByCategory(...)`

All helpers are pure metadata functions.

## Decision Behavior

Rules:

- `manual_only` is the only active allowed level.
- `copy_assisted_future`, `paste_assisted_future`, and
  `execute_assisted_future` are future-gated.
- requested future-assisted levels block or stay future-gated.
- blocking gates block the decision.
- blocking risks block the decision.
- human approval remains required before external action.
- helpers do not operate tools or mutate files.

## Integration

The safety layer consumes:

- Manual Codex Handoff Trial refs for manual-copy evidence and report shape
- Human-Approved Codex Handoff refs for prompt approval posture
- Conversational Build Loop refs for artifact-chain context
- Codex Handoff Runner shape for prompt envelope metadata
- report validation metadata for scope and verification posture
- next-action coordinator metadata for recommended phase
- phase closeout metadata for completion state
- future approval/audit metadata for reviewer decisions

## Safety Boundaries

The implementation remains:

- source-only
- advisory-only
- metadata-only
- manual-only as the active allowed level
- no system copy-buffer automation
- no automated prompt insertion
- no Codex invocation
- no OpenClaw operation
- no WhatsApp outbound
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

This phase does not create a bridge, monitor a live session, move prompt text,
or perform external actions. It only creates safety metadata and fixtures for
future human-reviewed planning.

## Next Recommended Phase

Depending on human review:

- `PILOT-7B - CONTROLLED OPENCLAW PASTE BRIDGE PLAN`
- or `Phase 141B - ROADMAP CONTINUATION PLAN`
