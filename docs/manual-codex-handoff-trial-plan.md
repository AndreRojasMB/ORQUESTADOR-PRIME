# Manual Codex Handoff Trial Plan

Phase: PILOT-5B - MANUAL CODEX HANDOFF TRIAL PLAN

Status: planning / docs-only / advisory metadata

## Purpose

PILOT-5B plans a controlled manual handoff trial. The trial starts with the
Conversational Build Loop prompt draft metadata, passes through the
Human-Approved Codex Prompt Handoff package, requires manual user copy, expects
a structured Codex report, and then validates that report through Autopilot
metadata checks.

This phase is a plan only. It does not run Codex from source, insert prompts
into any tool, automate system copy behavior, use OpenClaw, use WhatsApp, call
providers, write project files from source, or alter runtime surfaces.

## Trial Scope

The planned manual loop is:

1. Conversational Build Loop produces prompt draft metadata.
2. Human-Approved Handoff validates safety and completeness.
3. Handoff status becomes `approved_for_copy`.
4. `safeToExecute` remains false.
5. User manually copies the prompt text into a separate Codex session.
6. Codex is used manually for a safe source-only/advisory target phase.
7. User returns the structured report.
8. Autopilot validates report metadata.
9. Next-action coordinator recommends the next step.
10. Closeout coordinator classifies phase status.

Recommended target phase:

- Phase TRIAL-1B - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN PLAN

The target should be docs-only or metadata-only. It must not be real app
creation, screen creation, backend creation, package mutation, provider setup,
or runtime work.

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

Default scenario:

- `trialId`: `manual_codex_handoff_trial:sample_mobile_idea_blueprint`
- `sourceDryRunRef`: Conversational Build Loop dry-run output
- `handoffRef`: Human-Approved Codex Handoff package
- `targetPhase`: TRIAL-1B - Sample Mobile Idea Blueprint Dry-Run Plan
- `targetMode`: B
- `manualCopyRequired`: true
- `codexRunManual`: true
- `expectedValidationStatus`: passed or needs_review
- `expectedNextAction`: continue_to_I_phase or request_human_review
- `riskLevel`: high because human approval is required

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

Rules:

- `approvedForCopy` must be true before the user copies the prompt.
- `copiedByHuman` must be true.
- `copiedAtLabel` is a label, not a runtime clock requirement.
- `destination` should describe a separate manual Codex session.
- `runNotAutomated` must be true.

## Expected Codex Report Model

The returned report should include:

- phase
- files inspected
- files modified
- implementation or plan summary
- safety guarantees
- tests/scripts
- commands executed
- scope check
- forbidden grep
- commit/push
- next recommended phase

For a B-mode target phase:

- commit should be `No commit`
- push should be `No push`
- files modified should be docs-only or none, depending on the target

## Validation Model

Autopilot should validate:

- expected phase matches
- mode matches target
- allowed files respected
- forbidden files untouched
- dirty files outside scope not staged
- typecheck and smoke commands are reported where expected
- forbidden grep result is clean or explicitly reviewed
- commit/push status matches phase mode
- no runtime/provider/secret/dashboard/DB/package/workflow mutation is claimed
- final report contains required sections
- findings are classified as pass, warning, fail, or blocked metadata

The report validator should remain metadata-only and should not inspect runtime
state by itself.

## Success Criteria

The trial succeeds if:

- handoff package reaches `approved_for_copy`
- `safeToExecute` remains false
- prompt text is copied manually by the user
- Codex returns the expected report shape
- validation returns passed or mild alert only
- next-action recommendation is produced
- closeout status is produced
- no external action happens from source
- no provider, dashboard, DB, package, workflow, memory, or source-control
  behavior is represented as source-driven

## Block And Failure Criteria

Block if:

- handoff has blocking safety issues
- prompt lacks required sections
- `safeToExecute` becomes true
- manual copy evidence is absent
- report misses required fields
- forbidden files are touched
- package/workflow/provider/dashboard/DB surfaces change
- dirty files outside scope are staged
- runtime work is claimed for the trial
- secret material or environment details are exposed

Failure should recommend retry or human review, not autonomous recovery.

## Future PILOT-5I Scope

Future implementation may create:

- `src/autopilot/manualCodexHandoffTrial.ts`
- `src/autopilot/manualCodexHandoffTrialFixtures.ts`
- `docs/manual-codex-handoff-trial.md`
- `scripts/manual-codex-handoff-trial-tests.ts`

It may update:

- `src/autopilot/index.ts`

It must not add runtime action, external action, system copy automation, OpenClaw
operation, WhatsApp behavior, provider behavior, or Codex invocation from
source.

## Verification Plan

For PILOT-5B:

- `git status --short --branch`
- `git diff --stat`
- `git diff --name-only`
- `git diff --check`
- `node node_modules/typescript/bin/tsc --noEmit`

If WSL Node is unavailable, use:

- `node node_modules\\typescript\\bin\\tsc --noEmit`

## Smoke Plan

Confirm:

- only docs were modified
- no source implementation was added
- no Codex session was started from source
- no prompt insertion automation was added
- no system copy automation was added
- no OpenClaw operation happened
- no WhatsApp outbound behavior happened
- no providers were called
- no project file writes from source happened
- no package or workflow change happened
- no CI activation happened
- no runtime executor was added
- no dashboard mutation happened
- no DB/SQL/deploy action happened
- no secret material or network action was touched
- no memory persistence happened
- no source-control behavior was added from source

## Next Recommended Phase

- Phase PILOT-5I - MANUAL CODEX HANDOFF TRIAL IMPLEMENTATION

Optional later path:

- PILOT-6B - SEMI-AUTOMATED HANDOFF SAFETY PLAN
- Phase 141B - ROADMAP CONTINUATION PLAN
