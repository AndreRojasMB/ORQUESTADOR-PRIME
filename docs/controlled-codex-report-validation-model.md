# Controlled Codex Report Validation Model

Phase: PILOT-8B - CONTROLLED CODEX REPORT RETURN PLAN

Status: planning / audit / docs-only

## Purpose

This document defines the future validation shape for a human-submitted Codex
report. It turns report text into structured metadata, validates it against the
expected handoff, and classifies the result for next-action and closeout.

## Report Return Metadata

`ControlledCodexReportReturn` should include:

- `reportReturnId`
- `sourceHandoffRef`
- `sourceTrialRef`
- `reportText`
- `normalizedReport`
- `expectedPhase`
- `expectedMode`
- `expectedBranch`
- `receivedAtLabel`
- `submittedByHuman`
- `validationStatus`
- `alertLevel`
- `riskLevel`
- `limitations`

`submittedByHuman` must be true for the future controlled loop. Reports from
automatic external retrieval remain outside scope.

## Normalized Report Metadata

`ControlledCodexNormalizedReport` should include:

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

Normalization should detect missing sections and preserve them as validation
warnings or blockers.

## Required Sections

The returned report should include:

- phase
- files inspected
- files modified
- summary
- safety guarantees
- tests/scripts
- commands executed
- scope check
- forbidden grep
- commit/push
- next recommended phase

Implementation phases may require stronger evidence for typecheck, smoke,
commit, and push status. Planning phases should explicitly report local-only
status.

## Validation Metadata

`ControlledCodexReportValidation` should include:

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
- `blockers`
- `warnings`
- `recommendedFixes`

## Validation Statuses

Recommended statuses:

- `passed`
- `needs_review`
- `failed`
- `blocked`

`blocked` should be used for unsafe scope, forbidden file mutation, staged
external dirty files, secret-material exposure, or prohibited runtime/provider
claims.

## Alert Levels

- `no_alert`: clean validation and closeout metadata
- `mild_alert`: accepted warnings, incomplete optional evidence, or local dirty
  files outside scope that remain unstaged
- `blocking_alert`: safety boundary failure, unsafe scope, or missing required
  implementation closeout evidence

## File Scope Checks

Validation should compare:

- expected allowed files
- expected forbidden files
- files modified in the report
- staged files in the scope check
- dirty files outside scope

Dirty files outside scope may be tolerated only when they remain unstaged and
are clearly unrelated.

## Command Evidence Checks

Validation should confirm:

- required commands were reported
- command results include pass/fail labels
- failures include a reason
- WSL Node fallback is documented when relevant
- smoke checks are present when requested
- skipped checks include accepted reasoning

## Forbidden Grep Checks

Validation should accept only:

- clean grep summaries, or
- documented false positives that are explicitly advisory and future-gated

Undocumented matches should return `needs_review` or `blocked` depending on
risk.

## Commit And Push Checks

For implementation mode:

- commit hash should be reported when commit was required
- push status should be reported when push was required
- missing commit/push evidence should produce `needs_commit` or `needs_push`
  closeout metadata

For planning mode:

- commit/push should be reported as not performed

## Safety Claim Checks

Validation must block reports that claim:

- runtime mutation
- provider mutation
- package/workflow mutation without explicit approval
- dashboard mutation
- DB/SQL mutation
- secret-material exposure
- network/API activity
- source-control behavior outside approved human workflow

## Success Criteria

Validation passes when required sections are present, phase/mode match, file
scope is respected, verification evidence is sufficient, forbidden grep is
clean or reviewed, commit/push posture is correct, and unsafe claims are absent.

## Failure Criteria

Validation fails or blocks when required evidence is missing, expected phase or
mode is wrong, forbidden files are touched, unrelated staged files are present,
unsafe action is reported, or implementation closeout evidence is missing.
