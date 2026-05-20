# End-to-End Manual Loop Trial

Phase: PILOT-9I - END-TO-END MANUAL LOOP TRIAL IMPLEMENTATION

Status: implemented as source-only / advisory-only / metadata-only

## Purpose

The End-to-End Manual Loop Trial models the complete human-mediated Autopilot
handoff path:

```text
idea -> conversational dry-run -> prompt draft -> approved handoff
-> manual transfer to a separate Codex session -> human-submitted report
-> controlled report return -> validation -> next action -> closeout
-> human-facing response
```

The implementation is passive metadata. It does not start external tools,
operate OpenClaw, move prompt text through system buffers, retrieve reports from
external sessions, call providers, mutate dashboards, touch DB/SQL, persist
memory, or perform source-control behavior from source.

## Trial Input Model

`EndToEndManualLoopTrialInput` records:

- `trialId`
- `userIdeaText`
- `sourceDryRunRef`
- `handoffRef`
- `targetCodexPhase`
- `targetCodexMode`
- `manualCopyRequired`
- `manualReportReturnRequired`
- `expectedArtifactChain`
- `expectedReportShape`
- `expectedValidationStatus`
- `expectedCloseoutStatus`
- `expectedNextAction`
- `riskLevel`
- `requiredApprovals`
- `limitations`

The default fixture uses the habit-world mobile idea from the Conversational
Build Loop and Mobile Factory dry-run work.

## Stage Model

`EndToEndManualLoopStage` records:

- `stageId`
- `stageName`
- `inputRefs`
- `outputRefs`
- `humanActionRequired`
- `automationAllowed`
- `blockingConditions`
- `riskLevel`
- `evidenceRefs`
- `limitations`

Required stages:

- `create_dry_run`
- `generate_prompt_draft`
- `validate_handoff`
- `approve_for_copy`
- `manual_copy_to_codex`
- `manual_codex_execution`
- `manual_report_return`
- `normalize_report`
- `validate_report`
- `generate_next_action`
- `generate_closeout`
- `render_human_response`

The manual transfer, manual external run, and manual report-return stages always
keep `automationAllowed=false`.

## Manual Action Model

`EndToEndManualAction` records:

- `actionId`
- `actionType`
- `requiredHuman`
- `instruction`
- `expectedEvidence`
- `safetyWarning`
- `allowedAutomationLevel`
- `completionClaim`
- `riskLevel`
- `limitations`

Required actions:

- `copy_prompt`
- `paste_prompt_to_codex`
- `run_codex_manually`
- `paste_codex_report_back`
- `approve_next_phase`

All actions are `manual_only`. Completion claims are caller-supplied metadata;
helpers do not observe a live session.

## Validation Model

`EndToEndManualLoopValidation` checks:

- dry-run artifact chain completion
- prompt draft presence
- approved-for-copy handoff
- `safeToExecute` remains false
- manual copy and transfer confirmation
- manual external run confirmation
- manual report return confirmation
- report validation status
- closeout status
- next-action production
- absence of source-side external action
- blockers, warnings, validation status, and alert level

The validation blocks unsafe report return, missing human approval, action-ready
prompt metadata, missing manual evidence, unsafe closeout, or any source-side
external-action claim.

## Outcome Model

`EndToEndManualLoopOutcome` records:

- `outcomeId`
- `trialStatus`
- `completedStages`
- `blockedStages`
- `manualActionsRequired`
- `manualActionsCompleted`
- `nextRecommendedPhase`
- `closeoutStatus`
- `safeToContinue`
- `humanFacingSummary`
- `limitations`

`safeToContinue` is true only when validation passes, closeout is clean, and the
source side remains passive.

## Success And Block Criteria

Success requires:

- complete required stage set
- required manual actions present
- prompt draft available
- handoff approved for copy
- `safeToExecute=false`
- manual transfer and report-return metadata present
- report validation passed
- closeout is `completed_local_only` or `closed_and_pushed`
- next action produced

Blockers include:

- missing dry-run stage or artifact chain
- missing prompt draft
- handoff not approved for copy
- action-ready prompt metadata
- missing manual evidence
- blocked or failed report validation
- `unsafe_scope` or `blocked` closeout
- manual stage allowing automation
- source-side external action claim

## Helpers

Implemented pure helpers:

- `createEndToEndManualLoopTrial`
- `createEndToEndManualLoopStage`
- `createEndToEndManualAction`
- `validateEndToEndManualLoopTrial`
- `evaluateEndToEndManualLoopOutcome`
- `summarizeEndToEndManualLoopTrial`
- `selectBlockedEndToEndStages`
- `selectRequiredManualActions`

## Safety Boundaries

- source-only
- advisory-only
- metadata-only
- no Codex invocation from source
- no OpenClaw operation
- no system copy-buffer automation
- no prompt insertion automation
- no automatic report retrieval
- no provider calls
- no network/API calls
- no file writes from source
- no package/workflow changes
- no DB/SQL
- no dashboard mutation
- no secret or environment access
- no memory persistence
- no source-control behavior from source

## Integration

The trial composes the existing passive layers:

- Conversational Build Loop dry-run supplies the idea, artifact chain, and prompt
  draft metadata.
- Human-Approved Handoff supplies copy-readiness and safety/completeness review.
- Manual Codex Handoff Trial supplies manual transfer and report-shape posture.
- Semi-Automated Safety confirms only `manual_only` is active.
- Controlled OpenClaw Paste Bridge remains future metadata only.
- Controlled Codex Report Return supplies report normalization, validation,
  alert level, closeout, and next-phase evidence.
- Next-action and closeout coordinators remain downstream metadata consumers.

## Limitations

- Human actions are represented by caller-supplied metadata.
- No live session is observed.
- No report is retrieved from an external application.
- No external action is triggered.
- Memory proposal remains advisory and is not persisted.

## Next Recommended Phase

PILOT-10B - REAL USER MANUAL LOOP TRIAL INSTRUCTIONS PLAN

Alternative: Phase 141B - ROADMAP CONTINUATION PLAN if the pilot path pauses.
