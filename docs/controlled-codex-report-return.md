# Controlled Codex Report Return

Status: source-only / advisory / metadata-only

## Purpose

PILOT-8I implements a passive Controlled Codex Report Return layer. It accepts
human-submitted report metadata, normalizes the report into structured fields,
validates expected phase/mode/scope evidence, classifies alert level, generates
closeout metadata, and recommends the next phase.

The implementation lives in:

- `src/autopilot/controlledCodexReportReturn.ts`
- `src/autopilot/controlledCodexReportReturnFixtures.ts`

It does not retrieve external sessions, invoke Codex, operate OpenClaw, use the
system copy buffer, insert prompts, call providers, access network, write
project files from source, mutate dashboards, persist memory, or perform
source-control behavior from source.

## Report Return Model

`ControlledCodexReportReturnInput` records:

- `reportReturnId`
- `sourceHandoffRef`
- `sourceTrialRef`
- `reportText`
- `expectedPhase`
- `expectedMode`
- `expectedBranch`
- `receivedAtLabel`
- `submittedByHuman`
- `riskLevel`
- `limitations`

`submittedByHuman` is metadata supplied by the caller or fixture. It is not
derived from an external session.

## Normalized Report Model

`ControlledCodexNormalizedReport` records:

- `phase`
- `filesInspected`
- `filesModified`
- `summary`
- `implementationDetails`
- `safetyGuarantees`
- `testsScripts`
- `commandsExecuted`
- `scopeCheck`
- `forbiddenGrep`
- `commitPush`
- `nextRecommendedPhase`
- `unresolvedIssues`
- `evidenceRefs`

Normalization is deterministic string metadata handling. Missing sections remain
visible to validation.

## Validation Model

`ControlledCodexReportValidation` records:

- `validationId`
- `phaseMatches`
- `modeMatches`
- `requiredSectionsPresent`
- `allowedFilesRespected`
- `forbiddenFilesUntouched`
- `dirtyOutsideScopeNotStaged`
- `typecheckPassed`
- `smokePassed`
- `forbiddenGrepClean`
- `commitPushExpected`
- `unsafeRuntimeClaimsAbsent`
- `secretsAbsent`
- `packageWorkflowUntouched`
- `dashboardUntouched`
- `providerMutationAbsent`
- `validationStatus`
- `alertLevel`
- `blockers`
- `warnings`
- `recommendedFixes`

Wrong phase, wrong mode, forbidden files, staged external dirty files, unsafe
runtime claims, provider claims, dashboard claims, package/workflow claims, or
secret-material claims become blockers.

## Closeout Model

`ControlledCodexReportCloseout` records:

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

Memory proposal remains review-only and is never persisted by this layer.

## Alert And Closeout Statuses

Alert levels:

- `no_alert`
- `mild_alert`
- `blocking_alert`

Closeout statuses:

- `closed_and_pushed`
- `completed_local_only`
- `needs_commit`
- `needs_push`
- `needs_retry`
- `needs_human_review`
- `blocked`
- `unsafe_scope`

## Helpers

Implemented helpers:

- `createControlledCodexReportReturn(...)`
- `createControlledCodexNormalizedReport(...)`
- `validateControlledCodexReportReturn(...)`
- `createControlledCodexReportCloseout(...)`
- `summarizeControlledCodexReportReturn(...)`
- `evaluateControlledCodexReportReturnDecision(...)`
- `selectControlledReportBlockers(...)`
- `selectControlledReportWarnings(...)`

All helpers are pure metadata functions.

## Success Criteria

The return passes when:

- report is marked human-submitted
- expected phase and mode match
- required report sections are present
- allowed file scope is respected
- forbidden files are untouched
- dirty files outside scope are not staged
- typecheck and smoke evidence are present or reviewed
- forbidden grep is clean or reviewed
- commit/push posture matches the phase mode
- unsafe runtime, provider, package, dashboard, and secret-material claims are
  absent

## Failure Criteria

The return blocks when:

- report is not human-submitted
- phase or mode mismatches
- required sections are missing
- forbidden files are touched
- dirty files outside scope are staged
- forbidden grep is not clean
- unsafe runtime, provider, package, dashboard, or secret-material claims appear

## Integration

The layer consumes:

- Manual Codex Handoff Trial report expectations
- Controlled OpenClaw Paste Bridge lineage metadata
- Human-Approved Handoff refs and safe-copy posture
- Report Validator status language
- Next-Action Coordinator alert language
- Phase Closeout Coordinator status language
- Memory Proposal metadata posture
- Human-facing response shape

The integration remains passive. It validates returned report metadata and does
not become a runner.

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
- no project file writes from source
- no package/workflow changes
- no DB/SQL
- no dashboard mutation
- no secret or environment access
- no memory persistence
- no source-control behavior from source

## Limitations

- report text is caller-supplied
- fixtures are static
- validation checks metadata, not live runtime state
- no approval UI is implemented
- no external audit sink is used
- memory proposal is only an allowed/blocked flag

## Next Recommended Phase

If smoke checks pass:

- PILOT-9B - END-TO-END MANUAL LOOP TRIAL PLAN
- or Phase 141B - ROADMAP CONTINUATION PLAN
