# Manual Codex Handoff Trial

Status: source-only / advisory / metadata-only

## Purpose

PILOT-5I implements a passive Manual Codex Handoff Trial model. It simulates the
full human-mediated chain:

```text
approved handoff -> human manual copy -> external manual Codex session
-> structured report -> validation -> next action -> closeout
```

The implementation lives in:

- `src/autopilot/manualCodexHandoffTrial.ts`
- `src/autopilot/manualCodexHandoffTrialFixtures.ts`

It does not start Codex from source, insert prompt text into tools, automate the
system copy buffer, use OpenClaw, use WhatsApp, call providers, access network,
write project files from source, mutate dashboards, persist memory, or perform
source-control behavior from source.

## Trial Input Model

`ManualCodexHandoffTrialInput` records:

- `trialId`
- `sourceDryRunRef`
- `handoffRef`
- `targetPhase`
- `targetMode`
- `manualCopyRequired`
- `codexExecutionManual`
- `expectedCodexReportShape`
- `expectedValidationStatus`
- `expectedNextAction`
- `riskLevel`
- `requiredApprovals`
- `limitations`

The default target is:

- Phase TRIAL-1B - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN PLAN

It is intended as a docs-only or metadata-only target.

## Manual Copy Model

`ManualCodexCopyStep` records:

- `copyStepId`
- `promptRef`
- `approvedForCopy`
- `copiedByHuman`
- `copiedAtLabel`
- `destination`
- `executionNotAutomated`
- `riskLevel`
- `limitations`

`copiedByHuman` is caller-supplied metadata. Helpers do not copy, paste, type,
launch tools, or inspect a live session.

## Expected Report Model

`ManualCodexExpectedReport` records:

- `phase`
- `filesInspected`
- `filesModified`
- `summary`
- `safetyGuarantees`
- `testsScripts`
- `commandsExecuted`
- `scopeCheck`
- `forbiddenGrep`
- `commitPush`
- `nextRecommendedPhase`

For B-mode trials, commit/push should remain not requested.

## Validation Model

`ManualCodexTrialValidation` records:

- `validationId`
- `expectedPhaseMatches`
- `expectedModeMatches`
- `scopeRespected`
- `forbiddenFilesUntouched`
- `dirtyOutsideScopeNotStaged`
- `typecheckReported`
- `smokeReported`
- `forbiddenGrepClean`
- `commitPushAppropriate`
- `unsafeRuntimeClaimsAbsent`
- `validationStatus`
- `alertLevel`
- `recommendedAction`
- `blockers`
- `limitations`

Validation blocks unsafe metadata claims such as forbidden file changes,
out-of-scope staging, inappropriate commit/push status, missing manual-copy
evidence, or provider/dashboard/DB/package/runtime claims.

## Outcome Model

`ManualCodexTrialOutcome` records:

- `outcomeId`
- `trialStatus`
- `handoffApprovedForCopy`
- `promptCopiedManually`
- `codexReportReceived`
- `validationStatus`
- `nextActionProduced`
- `closeoutStatusProduced`
- `safeToContinue`
- `recommendedNextPhase`
- `limitations`

`ManualCodexTrialSummary` provides counts, alert level, status, and recommended
next phase.

## Helpers

Implemented helpers:

- `createManualCodexHandoffTrial(...)`
- `createManualCodexCopyStep(...)`
- `createManualCodexExpectedReport(...)`
- `validateManualCodexTrialReport(...)`
- `summarizeManualCodexHandoffTrial(...)`
- `evaluateManualCodexTrialOutcome(...)`
- `createManualCodexHandoffTrialInput(...)`

All helpers are pure metadata functions.

## Success Criteria

The trial passes when:

- handoff metadata is approved for manual copy
- `safeToExecute` remains false in the upstream handoff package
- manual copy evidence is supplied by fixture or caller
- report metadata is present
- expected phase and mode match
- scope is respected
- forbidden files are untouched
- dirty external files are not staged
- typecheck and smoke evidence is reported
- forbidden grep evidence is clean or reviewed
- commit/push posture matches the target mode
- no unsafe runtime claim is present
- next-action and closeout status are produced

## Block Criteria

The trial blocks when:

- handoff is not approved for copy
- upstream handoff becomes action-ready
- human approval metadata is missing
- manual copy evidence is absent
- phase or mode mismatches
- forbidden files are modified
- dirty files outside scope are staged
- forbidden grep reports an unapproved match
- commit/push posture is wrong for the target mode
- report metadata claims provider, dashboard, DB, package, runtime, secret
  material, or network activity

## Integration

The trial consumes:

- Conversational Build Loop dry-run refs
- Human-Approved Codex Handoff package metadata
- Codex Handoff Runner prompt/report shape
- report validation expectations
- next-action coordinator status language
- phase closeout status language

This integration is passive. It does not start sessions, perform copy actions,
write files from source, or call external systems.

## Safety Boundaries

- source-only
- advisory-only
- metadata-only
- manual copy only
- no Codex invocation from source
- no prompt insertion automation
- no system copy automation
- no OpenClaw operation
- no WhatsApp outbound
- no provider calls
- no network/API calls
- no project file writes from source
- no package/workflow changes
- no DB/SQL
- no dashboard mutation
- no memory persistence
- no source-control behavior from source

## Limitations

- fixtures are static
- manual copy evidence is caller-supplied metadata
- validation checks returned report metadata, not live runtime state
- no approval UI exists in this phase
- no external audit sink is used
- no memory update is persisted

## Next Recommended Phase

If smoke checks pass:

- PILOT-6B - SEMI-AUTOMATED HANDOFF SAFETY PLAN

Alternative:

- Phase 141B - ROADMAP CONTINUATION PLAN
