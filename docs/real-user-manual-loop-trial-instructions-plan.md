# Real User Manual Loop Trial Instructions Plan

Phase: PILOT-10B - REAL USER MANUAL LOOP TRIAL INSTRUCTIONS PLAN

Status: planning / audit / docs-only

## Purpose

PILOT-10B plans operating instructions for a real user to try the manual loop
without adding automation. The trial should let an operator walk through one
simple app idea and verify that the passive Autopilot layers are understandable,
safe, and useful in a real handoff.

The intended flow is:

```text
simple idea -> conversational dry-run metadata -> prompt draft metadata
-> human-approved handoff -> human-managed Codex run outside source
-> human-submitted report -> controlled report return -> validation
-> alert classification -> next action -> closeout
```

This phase creates no source implementation and performs no external action.

## Real User Trial Scope

The future trial should cover:

- choosing one simple app idea
- generating or reusing metadata-only dry-run output
- reviewing prompt draft metadata
- confirming the handoff is approved for manual transfer
- placing the prompt into Codex by human action
- waiting for the separate Codex task to finish
- submitting the structured report back into the Autopilot review flow
- validating the report against expected phase, mode, scope, commands, smoke,
  forbidden grep, commit/push posture, and safety claims
- classifying the alert level
- recommending the next phase
- producing closeout metadata

The default idea remains:

```text
Quiero una app movil de habitos gamificada con mundo vivo, progreso,
recordatorios y premium futuro.
```

## Operator Guide Model

Future metadata:

- `guideId`
- `trialName`
- `targetUser`
- `prerequisites`
- `stepList`
- `expectedInputs`
- `expectedOutputs`
- `safetyWarnings`
- `stopConditions`
- `successCriteria`
- `fallbackActions`
- `limitations`

The guide should be written for a human operator, not for a runtime agent. Each
step should say what the user should inspect, what evidence to keep, and where
the trial must stop.

## Trial Evaluation Model

Future metadata:

- `evaluationId`
- `trialRef`
- `completedSteps`
- `failedSteps`
- `userConfusionPoints`
- `validationResult`
- `closeoutResult`
- `nextActionResult`
- `manualEffortLevel`
- `timeCostLabel`
- `usefulnessScore`
- `riskLevel`
- `recommendedImprovement`

The evaluation should capture whether the operator understood the handoff,
whether report validation was clear, and whether the next action felt safe.

## Real User Trial Steps

Step 1: Prepare repo state and confirm dirty files are known.

- Run or review `git status --short --branch`.
- Confirm existing dirty files are expected and not part of the trial.
- Stop if unknown staged files exist.

Step 2: Pick one idea.

- Use the default habit-world idea or another simple docs-only idea.
- Keep the idea short enough to review manually.

Step 3: Use metadata-only dry-run output.

- Prefer an existing fixture when available.
- If a future metadata-only command exists, use it only when it does not start
  external tools or mutate project files from source.

Step 4: Inspect the prompt draft.

- Confirm project path, branch, task, mode, allowed files, forbidden files,
  boundaries, verification plan, smoke plan, and final report format.
- Confirm `safeToExecute` or equivalent prompt-use flag remains false.

Step 5: Approve for manual transfer.

- Confirm handoff status is `approved_for_copy`.
- Confirm no blocking safety or completeness issues remain.
- Record human approval metadata.

Step 6: Place prompt into Codex by human action.

- The operator performs the transfer manually.
- Source helpers must not type, paste, insert, or send prompt text.

Step 7: Wait for Codex report.

- The operator supervises the separate Codex task.
- The source project does not observe the external session.

Step 8: Submit report back.

- The operator provides the final structured report text.
- The report should include phase, files inspected, files modified, summary,
  safety guarantees, tests/scripts, commands, scope check, forbidden grep,
  commit/push, and next recommended phase.

Step 9: Validate report.

- Check phase/mode, scope, forbidden files, dirty/staged state, typecheck and
  smoke evidence, forbidden grep result, commit/push posture, and unsafe claims.

Step 10: Decide next phase.

- If validation is clean, recommend the next implementation or planning phase.
- If warnings remain, request human review.
- If blocking issues appear, stop and plan a retry.

## Stop Conditions

The operator must stop when:

- prompt boundaries are unsafe
- `safeToExecute` unexpectedly becomes true
- human approval metadata is missing
- dirty files outside scope are staged
- Codex report claims package, workflow, provider, dashboard, DB/SQL, or runtime
  mutation outside the target scope
- report lacks scope check
- report lacks forbidden grep
- report claims runtime or provider action
- secret material or environment values appear
- closeout is `blocked` or `unsafe_scope`

## Safety Boundaries

- manual-only
- no automation
- no OpenClaw operation
- no system copy-buffer automation
- no source-driven Codex invocation
- no automatic report retrieval
- no provider calls
- no network/API calls
- no file writes from source
- no package/workflow changes
- no DB/SQL
- no dashboard mutation
- no memory persistence
- no source-control behavior from source

## Future Implementation Split

Phase PILOT-10I should create:

- `src/autopilot/realUserManualLoopInstructions.ts`
- `src/autopilot/realUserManualLoopFixtures.ts`
- `docs/real-user-manual-loop-trial-instructions.md`
- optional `scripts/real-user-manual-loop-instructions-tests.ts`

The implementation should remain metadata-only. It should not add external
actions, runtime file mutation, OpenClaw operation, or source-driven Codex
invocation.

## Future After PILOT-10I

Recommended next options:

- Phase PILOT-11B - REAL USER LOOP TRIAL EXECUTION REPORT PLAN
- Phase 141B - ROADMAP CONTINUATION PLAN
