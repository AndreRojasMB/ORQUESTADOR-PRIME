# Real Mini Test Execution Instructions

## Purpose

This guide defines the final operator-facing instructions for one real mini test of the manual loop:

idea -> dashboard/readiness -> approved prompt -> external manual Codex run -> returned report -> validation -> closeout -> A/B/C decision.

The goal is to learn whether the current manual loop is clear, useful, and safe enough to return to the main roadmap, or whether the next phase should improve dashboard UX or evaluate a future controlled OpenClaw path.

## Test Idea

Use this exact idea:

"Quiero una app movil simple de habitos con progreso diario, recordatorios y una pantalla de estadisticas."

The idea is intentionally small. It should be enough to exercise the loop without requiring broad app generation, provider calls, runtime actions, dashboard mutation, or production changes.

## Prerequisites

- The repo path is `/home/varyan/projects/ORQUESTADOR-PRIME`.
- The branch is `dev`.
- Existing dirty files are known before the test starts.
- The operator understands that this is a manual-only test.
- The `/autopilot/loop` static dashboard preview is available if the dashboard dev environment is already running.
- The prompt/handoff metadata is available from the existing manual loop materials or fixtures.
- The operator can paste the final Codex report back into the ChatGPT/Autopilot context manually.

## What This Test Proves

- Whether the static loop dashboard helps the operator understand status, blockers, and next steps.
- Whether the prompt and handoff metadata are clear enough for a manual transfer.
- Whether the returned Codex report can be validated and closed out.
- Whether the operator can decide between A, B, C, or Blocked using captured evidence.
- Whether the manual-only loop is useful enough before any future controlled action planning.

## What This Test Does Not Prove

- It does not prove that source-side Codex invocation is ready.
- It does not prove that OpenClaw can be used safely.
- It does not prove that system copy-buffer access should be enabled.
- It does not prove that report retrieval should happen without a human.
- It does not prove that providers, DB, dashboard mutation, or runtime actions are safe.
- It does not approve broad app generation or production actions.

## Step-by-Step Execution Guide

### Step 0: Confirm Repo Path and Branch

Confirm:

- Repo path: `/home/varyan/projects/ORQUESTADOR-PRIME`
- Branch: `dev`
- Current phase: `Phase 147I - REAL MINI TEST EXECUTION INSTRUCTIONS IMPLEMENTATION`

Evidence to capture:

- `git status --short --branch`
- Current branch label

### Step 1: Check Dirty Files

Review dirty files before starting. Do not stage unrelated files. If unrelated files are dirty, leave them untouched and record that they are outside the mini test scope.

Evidence to capture:

- Dirty file summary
- Whether any unrelated file is staged

Stop if:

- Dirty files outside scope are staged.
- The operator cannot tell which files are related to the test.

### Step 2: Open or Read the Static Loop Dashboard

If available, open `/autopilot/loop` and review:

- Loop overview
- Prompt/handoff status
- Approval/audit state
- Manual action checklist
- Report return status
- Validation/closeout status
- Next action
- Blockers and warnings

If the dashboard is not running, read `docs/loop-dashboard-static-ui.md` and continue with the documented static preview model.

Evidence to capture:

- Dashboard clarity score
- Any confusing card, badge, or wording
- Whether the warning "read-only/manual-only" posture is clear

### Step 3: Prepare the Simple App Idea

Use the required idea exactly:

"Quiero una app movil simple de habitos con progreso diario, recordatorios y una pantalla de estadisticas."

Evidence to capture:

- Idea text
- Any assumption added by the operator

### Step 4: Produce or Use Existing Prompt/Handoff Metadata

Use existing prompt/handoff metadata from the manual loop materials or fixtures. The prompt must include clear boundaries, scope, expected report format, and safety constraints.

Evidence to capture:

- Prompt draft reference
- Handoff reference
- Boundary summary

Stop if:

- Prompt boundaries are missing.
- The prompt suggests source-side external action.
- The handoff metadata is incomplete.

### Step 5: Confirm Handoff Approval

Confirm the handoff approval state before any manual transfer.

Required state:

- `approved_for_copy`
- `safeToExecute` remains false
- Human approval is explicit

Evidence to capture:

- Approval state
- Approver label
- Approval evidence reference

Stop if:

- Handoff approval is missing.
- `safeToExecute` is unexpectedly true.
- The approval is ambiguous.

### Step 6: Manually Copy Prompt to Codex

The operator may manually transfer the approved prompt into a separate Codex session. This guide does not enable system copy-buffer control and does not provide a source-side transfer helper.

Evidence to capture:

- Completion claim: prompt transferred manually
- Any friction or confusion during transfer

Stop if:

- The operator is unsure which prompt text is approved.
- The prompt contains unsafe scope.

### Step 7: Run Codex Manually

The operator starts the Codex run in the separate session by hand. The source project must not trigger or control that session.

Evidence to capture:

- Manual run completion claim
- Whether Codex reported success, partial success, or failure
- Any unexpected file scope claim

Stop if:

- Codex claims changes to forbidden files.
- Codex claims package, workflow, provider, dashboard, DB, or sensitive configuration changes that were not approved.

### Step 8: Paste Codex Report Back Manually

After the Codex run finishes, the operator manually returns the structured report to the ChatGPT/Autopilot context.

Expected report includes:

- Phase
- Files inspected
- Files modified
- Summary
- Safety guarantees
- Tests/scripts
- Commands executed
- Scope check
- Forbidden grep
- Commit/push
- Next recommended phase

Evidence to capture:

- Raw report text
- Whether the report has all required sections
- Any missing evidence

Stop if:

- Report lacks scope check.
- Report lacks forbidden grep.
- Report omits files modified.
- Report claims unsafe runtime, provider, dashboard, DB, package, workflow, or sensitive configuration changes.

### Step 9: Validate Report

Validate the returned report against the controlled report return expectations.

Evidence to capture:

- Validation status
- Alert level
- Blockers
- Warnings
- Recommended fixes

Stop if:

- Report phase or mode is wrong.
- Required sections are missing.
- Scope is unsafe.
- Evidence is insufficient for closeout.

### Step 10: Classify Alert

Classify the result:

- `no_alert`: report is complete and safe.
- `mild_alert`: report is usable but has non-blocking ambiguity or friction.
- `blocking_alert`: report is incomplete, unsafe, or cannot support closeout.

Evidence to capture:

- Alert level
- Reason for classification
- Any human review needed

### Step 11: Closeout

Produce the closeout decision from validation evidence.

Evidence to capture:

- Closeout status
- Safe-to-continue result
- Needs-retry result
- Next recommended phase

Stop if:

- Closeout is `blocked`.
- Closeout is `unsafe_scope`.
- Closeout cannot identify the next action.

### Step 12: Score Friction and Usefulness

Score each field from 1 to 5:

| Field | Score | Notes |
| --- | --- | --- |
| Dashboard clarity |  |  |
| Prompt clarity |  |  |
| Copy/paste friction |  |  |
| Codex report quality |  |  |
| Validation reliability |  |  |
| Closeout clarity |  |  |
| User confidence |  |  |
| Total manual effort |  |  |
| Usefulness |  |  |
| Safety confidence |  |  |

Scoring guide:

- `1`: blocked, confusing, or unsafe.
- `2`: high friction or low confidence.
- `3`: usable with meaningful caveats.
- `4`: clear and mostly smooth.
- `5`: clear, low-friction, and high-confidence.

### Step 13: Decide A/B/C

Choose one final decision:

- `A - Return to main roadmap`: choose this if the loop is useful, clear, safe, and manual transfer friction is tolerable.
- `B - Improve dashboard/UX`: choose this if comprehension, visibility, status wording, or operator flow is weak.
- `C - Prioritize controlled OpenClaw path`: choose this only if manual transfer is the main pain and approval, audit, report validation, rollback posture, and safety confidence are strong.
- `Blocked - Repair safety/validation/reporting`: choose this if the report is unsafe, incomplete, missing evidence, or cannot be closed out.

Evidence to capture:

- Final decision
- Reason
- Supporting scores
- Required next phase

## Evidence Checklist

Capture:

- Repo path and branch
- Dirty file state
- Dashboard or docs-readiness notes
- Idea text
- Prompt draft reference
- Handoff approval state
- Manual transfer completion claim
- Manual Codex run completion claim
- Returned report text
- Validation status
- Alert level
- Closeout status
- Friction/usefulness scores
- Final A/B/C/Blocked decision

Do not capture sensitive values, private account data, environment values, or production configuration.

## Evaluation Rubric

Use this rubric after Step 12:

| Dimension | Good Result | Weak Result | Blocking Result |
| --- | --- | --- | --- |
| Dashboard clarity | Operator understands state and next step | Some labels or cards confuse the operator | Operator cannot tell whether to stop or continue |
| Prompt clarity | Scope and boundaries are explicit | Prompt needs interpretation | Prompt lacks boundaries |
| Copy/paste friction | Manual transfer is tolerable | Transfer is annoying but safe | Transfer causes mistakes or wrong prompt use |
| Codex report quality | Report includes all required sections | Report needs mild clarification | Report lacks required evidence |
| Validation reliability | Validation gives a clear status | Validation has mild ambiguity | Validation cannot decide |
| Closeout clarity | Closeout gives a clear next step | Closeout needs human review | Closeout blocks or is unsafe |
| User confidence | Operator trusts the loop | Operator hesitates | Operator does not trust the result |
| Total manual effort | Low effort for one mini test | Noticeable friction | Too much friction for repeat use |
| Usefulness | Helps decide the roadmap | Somewhat useful | Does not produce a decision |
| Safety confidence | No unsafe action or scope drift | Some review needed | Unsafe action, missing evidence, or scope drift |

## Stop Conditions

Stop immediately if:

- Prompt lacks boundaries.
- Handoff approval is missing.
- `safeToExecute` is unexpectedly true.
- Codex touches forbidden files.
- Dirty files outside scope are staged.
- Report lacks scope check.
- Report lacks forbidden grep.
- Package, workflow, provider, dashboard, or DB changes appear unexpectedly.
- Sensitive values or environment details appear.
- Closeout is unsafe or blocked.

## Safety Boundaries

- Docs-only.
- Manual-only.
- No source implementation.
- No source-side Codex invocation.
- No OpenClaw.
- No system copy-buffer control.
- No external report retrieval.
- No provider calls.
- No source-side file output.
- No package or workflow changes.
- No DB/SQL.
- No dashboard mutation.
- No memory persistence.

## Troubleshooting

If the dashboard is unavailable:

- Continue from the docs and score dashboard clarity as unavailable.
- Record whether the missing visual layer increased friction.

If prompt approval is unclear:

- Stop.
- Re-run the handoff review manually.
- Do not continue until approval is explicit.

If the report is incomplete:

- Classify as `blocking_alert` unless the missing item is minor and documented.
- Ask for a corrected report before closeout.

If copy/paste is the main pain:

- Do not jump directly to automation.
- Confirm approval/audit readiness, report validation reliability, rollback posture, and safety confidence first.
- Record this as possible Decision C evidence.

If safety confidence is low:

- Choose `Blocked`.
- Recommend a focused safety, validation, or reporting repair plan.

## Next Recommended Phase

After this instruction phase, the next step is not another build phase by default.

Next step:

- Execute the real mini test manually.
- Decide A/B/C/Blocked from the captured evidence.

Possible follow-up phases:

- `A`: `Phase 148B - MAIN ROADMAP RETURN PLAN`
- `B`: `Phase 148B - LOOP DASHBOARD UX HARDENING PLAN`
- `C`: `Phase 148B - CONTROLLED OPENCLAW AUTOMATION TRIAL PLAN`
- `Blocked`: focused safety, validation, or reporting repair plan
