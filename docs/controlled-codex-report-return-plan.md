# Controlled Codex Report Return Plan

Phase: PILOT-8B - CONTROLLED CODEX REPORT RETURN PLAN

Status: planning / audit / docs-only

## Purpose

This phase plans a future Controlled Codex Report Return layer for
ORQUESTADOR-PRIME / Viernes. The layer will accept a human-submitted report
after a manual or controlled handoff, normalize the report into metadata,
validate it against expected scope, classify alerts, create closeout metadata,
and recommend the next phase.

PILOT-8B does not implement source modules, invoke Codex, operate OpenClaw,
move prompt text, call providers, access network, write project files from
source, mutate dashboards, touch DB/SQL, persist memory, or perform
source-control behavior from source.

## Controlled Report Return Scope

The future return flow should handle:

- human-submitted Codex report text
- report normalization into structured metadata
- report completeness validation
- expected phase, mode, and branch matching
- inspected/modified file evidence
- command evidence
- typecheck and smoke evidence
- forbidden grep evidence
- scope, dirty, and staged file evidence
- commit/push evidence
- safety claim review
- alert classification
- closeout decision
- next-action recommendation
- memory proposal candidate
- human-facing response metadata

The report source is human-submitted text only. There is no automatic external
session retrieval in this phase.

## Report Return Model

Future metadata:

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

The model records what the human supplied and what the validator expects. It is
not a live session adapter.

## Normalized Report Model

Future metadata:

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

Normalization should preserve report meaning while giving validators predictable
fields. Missing or ambiguous sections remain visible as gaps.

## Validation Model

Future metadata:

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

Validation should be conservative. A report is accepted only when its evidence
matches the expected phase, mode, scope, and safety posture.

## Closeout Model

Future metadata:

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

Closeout consumes validation metadata and produces a phase status that the
next-action coordinator can use.

## Alert Levels

- `no_alert`
- `mild_alert`
- `blocking_alert`

## Closeout Statuses

- `closed_and_pushed`
- `completed_local_only`
- `needs_commit`
- `needs_push`
- `needs_retry`
- `needs_human_review`
- `blocked`
- `unsafe_scope`

## Success Criteria

Report return succeeds when:

- expected phase and mode match
- required sections are present
- scope is respected
- forbidden files are untouched
- dirty files outside scope are not staged
- typecheck and smoke evidence are present when required
- forbidden grep is clean or false positives are documented
- commit/push evidence matches the phase mode
- unsafe runtime, provider, secret-material, dashboard, package, and workflow
  claims are absent
- next-action metadata is generated
- closeout metadata is generated

## Failure Criteria

The return should block when:

- required sections are missing
- phase or mode is wrong
- forbidden files are touched
- dirty files outside scope are staged
- secret material is exposed
- package or workflow changes are claimed without approval
- provider, dashboard, DB, or runtime mutation is claimed
- unsafe action is reported
- commit or push evidence is missing for an implementation phase that requires it

## Safety Boundaries

- source-only
- advisory-only
- metadata-only
- no automatic report retrieval
- no OpenClaw operation
- no Codex invocation
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

## Integration

The future implementation should consume:

- Manual Codex Handoff Trial metadata
- Controlled OpenClaw Paste Bridge metadata
- Human-Approved Handoff metadata
- Report Validator contracts
- Next-Action Coordinator metadata
- Phase Closeout Coordinator metadata
- Memory Proposal Builder metadata
- Human-facing response renderer metadata
- future approval/audit metadata

## Future Implementation Split

PILOT-8I should be allowed to add:

- `src/autopilot/controlledCodexReportReturn.ts`
- `src/autopilot/controlledCodexReportReturnFixtures.ts`
- `src/autopilot/index.ts` exports
- `docs/controlled-codex-report-return.md`
- optional `scripts/controlled-codex-report-return-tests.ts`

The implementation should remain pure metadata with no external actions.

After PILOT-8I, recommend one of:

- PILOT-9B - END-TO-END MANUAL LOOP TRIAL PLAN
- Phase 141B - ROADMAP CONTINUATION PLAN
