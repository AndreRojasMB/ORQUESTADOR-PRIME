# Manual Codex Handoff Trial Scenario

Phase: PILOT-5B - MANUAL CODEX HANDOFF TRIAL PLAN

Status: scenario plan / docs-only

## Scenario Summary

The first trial should use a deliberately safe target:

- Phase TRIAL-1B - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN PLAN
- Mode: B
- Scope: docs-only or metadata-only
- Topic: convert a simple mobile idea into a blueprint plan
- No app creation
- No screen/component/route/backend creation
- No package/workflow changes
- No providers
- No runtime behavior

The trial checks whether ORQUESTADOR-PRIME can complete the human-mediated
handoff loop without automating the risky step.

## Trial Scenario Model

Future metadata:

- `trialId`
- `sourceDryRunRef`
- `handoffRef`
- `targetPhase`
- `targetMode`
- `manualCopyRequired`
- `codexRunManual`
- `expectedCodexReportShape`
- `expectedValidationStatus`
- `expectedNextAction`
- `riskLevel`
- `requiredApprovals`
- `limitations`

Default fixture:

```text
trialId: manual_codex_handoff_trial:sample_mobile_idea_blueprint
sourceDryRunRef: conversational_build_loop:habit_world_v1
handoffRef: human_approved_codex_handoff:habit_world_v1
targetPhase: TRIAL-1B - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN PLAN
targetMode: B
manualCopyRequired: true
codexRunManual: true
expectedValidationStatus: passed_or_needs_review
expectedNextAction: continue_to_I_phase_or_request_human_review
riskLevel: high
```

## Manual Copy Model

Future metadata:

- `copyStepId`
- `promptRef`
- `approvedForCopy`
- `copiedByHuman`
- `copiedAtLabel`
- `destination`
- `runNotAutomated`
- `riskLevel`
- `limitations`

Example:

```text
copyStepId: manual_copy:trial_1b
promptRef: human_approved_codex_handoff:habit_world_v1:prompt
approvedForCopy: true
copiedByHuman: true
copiedAtLabel: human_supplied_label
destination: separate_codex_session
runNotAutomated: true
riskLevel: high
```

`copiedAtLabel` is supplied by the human or by a static fixture. It is not a
runtime clock read.

## Expected Prompt Content

The prompt should include:

- project path
- branch
- target phase
- target mode
- previous phase context
- goal
- allowed files
- forbidden files
- verification plan
- smoke plan
- scope check
- forbidden grep
- final report format
- explicit safety boundaries

The prompt should not ask for runtime action, provider action, source-stage file
writes, package/workflow changes, dashboard mutation, DB/SQL work, or memory
persistence.

## Human Steps

1. Review the Human-Approved Handoff package.
2. Confirm `approved_for_copy`.
3. Confirm `safeToExecute` is false.
4. Manually copy prompt text.
5. Paste it into a separate Codex session.
6. Run the target trial manually.
7. Return the report text to Autopilot as metadata.
8. Trigger validation metadata checks.

The source system should not perform steps 4, 5, or 6.

## Expected Trial Output Chain

- handoff package summary
- manual copy metadata
- returned report metadata
- report validation result
- next-action recommendation
- closeout status
- unresolved issues list
- recommended next phase

## Success Path

Expected successful path:

```text
prompt_draft_metadata
-> human_approved_handoff
-> manual_copy_metadata
-> returned_report_metadata
-> report_validation
-> next_action
-> closeout_status
```

Success means the metadata proves the loop is safe enough for a future manual
trial, not that a live product build happened.

## Blocked Path

Blocked examples:

- handoff remains `needs_review`
- handoff is `blocked`
- manual copy metadata is missing
- report is incomplete
- report claims forbidden file changes
- report claims provider, dashboard, DB, package, workflow, runtime, or memory
  behavior
- validation returns failed or blocked
- closeout reports unsafe scope

Blocked status should recommend human review or retry.

## Required Approvals

- human operator approval before manual copy
- PM scope approval for trial target
- safety/privacy approval for prompt boundaries
- closeout approval before continuing to PILOT-6B or Phase 141B

## Limitations

- scenario is a controlled pilot
- target phase should be non-production and low blast-radius
- report validation depends on returned report metadata
- no live monitoring is performed
- no provider or runtime evidence is collected
- no memory persistence occurs
