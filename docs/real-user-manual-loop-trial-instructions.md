# Real User Manual Loop Trial Instructions

Phase: PILOT-10I - REAL USER MANUAL LOOP TRIAL INSTRUCTIONS IMPLEMENTATION

Status: operational documentation / docs-only / source-only / advisory-only

## Purpose

This guide gives a human operator a practical way to run the first real manual
loop trial for ORQUESTADOR-PRIME / Viernes without adding automation.

The loop under test is:

```text
simple idea -> dry-run metadata -> prompt draft -> approved handoff
-> external manual Codex run -> human-submitted report -> validation
-> next-action recommendation -> closeout
```

The goal is to learn whether the handoff is understandable, whether the report
format is sufficient, whether validation is clear, and whether the next phase
recommendation feels safe.

## Prerequisites

Before starting, the operator should have:

- Project path: `/home/varyan/projects/ORQUESTADOR-PRIME`
- Branch: `dev`
- Previous completed phase: PILOT-9I
- Previous commit: `f1ecb46f4d6c162245369d519323b6897fa92647`
- A simple idea to test
- Access to the dry-run and handoff metadata docs
- A separate Codex session controlled by the human operator
- The stop-condition checklist in this document

The recommended idea is:

```text
Quiero una app movil de habitos gamificada con mundo vivo, progreso,
recordatorios y premium futuro.
```

## What This Trial Proves

This trial proves whether a human can:

- start from a simple idea
- use existing dry-run or fixture metadata
- inspect the prompt draft safely
- confirm handoff approval
- transfer the prompt manually to a separate Codex session
- receive a structured report
- submit that report back into the Autopilot review context
- validate the report
- classify alert level
- decide the next phase
- close out the trial with explicit evidence

## What This Trial Does Not Do

This trial does not:

- invoke Codex from source
- operate OpenClaw
- automate system copy-buffer behavior
- automate prompt insertion
- retrieve reports from external sessions
- call providers
- access network/API surfaces
- write project files from source
- change package or workflow files
- mutate DB/SQL
- mutate dashboards
- access secret material or environment values
- persist memory
- perform source-control behavior from source

## Step-By-Step Operator Guide

### Step 0: Confirm Repo Path And Branch

Run or review:

```text
git status --short --branch
```

Expected:

- repo path is `/home/varyan/projects/ORQUESTADOR-PRIME`
- branch is `dev`
- any dirty files are already known

Evidence label:

- `repo_state_checked`

Stop if:

- branch is not `dev`
- unknown staged files appear
- the repo path is not the expected project path

### Step 1: Confirm Existing Dirty Files Are Known

Review current dirty files and classify them:

- in-scope for this trial
- known outside-scope work
- unknown or suspicious

Expected:

- outside-scope dirty files remain unstaged
- this trial does not require touching package, workflow, provider, dashboard,
  DB/SQL, runtime, secret, or integration files

Evidence label:

- `dirty_files_reviewed`

Stop if:

- dirty files outside scope are staged
- unknown files appear in protected areas

### Step 2: Choose One Simple App Idea

Use the default habit-world idea or choose another small idea that can stay
docs-only or metadata-only.

Good trial idea qualities:

- short
- mobile-app shaped
- easy to summarize
- no secret material
- no production integration
- no provider setup

Evidence label:

- `idea_selected`

Stop if:

- the idea requires real provider setup, secret material, production data, or
  external side effects

### Step 3: Use Existing Dry-Run Or Fixture Metadata

Use the existing End-to-End Manual Loop fixture metadata or a future
metadata-only dry-run command if one exists and is explicitly safe.

Expected refs:

- `conversational_build_loop:habit_world_v1`
- `prompt_draft:habit_world_v1`
- `human_approved_handoff:habit_world_v1`

Evidence label:

- `dry_run_metadata_available`

Stop if:

- the dry-run tries to create app files
- the dry-run tries to operate external tools
- the dry-run claims source-side file mutation

### Step 4: Inspect Prompt Draft Metadata

Check that the prompt draft includes:

- project path
- branch
- task
- mode
- context summary
- allowed files
- forbidden files
- safety boundaries
- verification plan
- smoke plan
- final report format

Confirm:

- `safeToExecute` or equivalent action-ready flag remains false
- human approval remains required

Evidence label:

- `prompt_draft_reviewed`

Stop if:

- the prompt is marked action-ready
- boundaries are missing
- allowed or forbidden files are unclear
- verification plan is missing

### Step 5: Confirm Handoff Approval State

Confirm the handoff package:

- has status `approved_for_copy`
- has no blocking safety checklist items
- has no blocking completeness checklist items
- keeps `safeToExecute=false`
- requires human approval

Evidence label:

- `handoff_approved_for_copy`

Stop if:

- approval is missing
- checklist blockers remain
- `safeToExecute` is true

### Step 6: Manually Transfer Prompt To Codex

The human operator transfers the approved prompt into a separate Codex session.

Rules:

- no source helper performs the transfer
- no source helper inserts prompt text
- no source helper sends Enter or submits a prompt
- the target session must be selected and reviewed by the human

Evidence label:

- `manual_transfer_confirmed`

Stop if:

- target session is uncertain
- prompt text differs from the approved handoff
- the operator is unsure which project or branch the target session will use

### Step 7: Run Codex Manually In A Separate Session

The human operator starts and supervises the separate Codex task.

Expected:

- target phase is safe, docs-only, or metadata-only
- Codex follows the final report format
- no protected files are touched

Evidence label:

- `manual_codex_run_confirmed`

Stop if:

- Codex starts modifying package/workflow/provider/dashboard/DB/SQL/secret areas
- Codex claims provider or runtime action
- Codex cannot preserve the requested scope

### Step 8: Wait For Codex Structured Report

Wait for the separate Codex task to finish and produce a report.

Expected:

- report follows the required sections
- commands and smoke evidence are stated
- scope and grep checks are stated
- commit/push posture is stated

Evidence label:

- `structured_report_received`

Stop if:

- report is partial
- report lacks scope check
- report lacks forbidden grep
- report omits files modified

### Step 9: Submit Report Back Manually

The human operator submits the structured report text back into the
ChatGPT/Autopilot context.

Evidence label:

- `report_text_submitted`

Stop if:

- report contains secret material
- report contains environment values
- report claims unsafe source-side action

### Step 10: Validate Report

Validate the returned report against:

- expected phase
- expected mode
- expected branch
- required sections
- allowed file scope
- forbidden files untouched
- dirty files outside scope not staged
- typecheck evidence
- smoke evidence
- forbidden grep evidence
- commit/push posture
- absence of runtime, provider, package/workflow, dashboard, DB/SQL, and secret
  material claims

Evidence label:

- `report_validated`

Stop if:

- validation is `blocked`
- validation is `failed`
- alert level is `blocking_alert`

### Step 11: Classify Alert

Classify the result:

- `no_alert`: clean continuation
- `mild_alert`: human review required before continuation
- `blocking_alert`: stop and retry or replan

Evidence label:

- `alert_classified`

Stop if:

- alert level is `blocking_alert`
- warnings are not understood by the operator

### Step 12: Decide Next Phase

Use the next-action recommendation:

- `continue_to_I_phase`
- `continue_to_next_B_phase`
- `request_human_review`
- `retry_phase`
- `blocked`

Evidence label:

- `next_phase_decided`

Stop if:

- next phase is unclear
- next phase conflicts with closeout status

### Step 13: Closeout Result

Record closeout:

- `completed_local_only`
- `closed_and_pushed`
- `needs_human_review`
- `needs_retry`
- `needs_commit`
- `needs_push`
- `blocked`
- `unsafe_scope`

Evidence label:

- `closeout_recorded`

Stop if:

- closeout is `blocked`
- closeout is `unsafe_scope`

## Operator Checklist

### Before Transferring Prompt

- repo path and branch confirmed
- dirty files reviewed
- idea selected
- dry-run metadata available
- prompt draft reviewed
- handoff is `approved_for_copy`
- `safeToExecute=false`
- human approval recorded

### Before Starting The Separate Codex Task

- target session selected by the human
- prompt text matches approved handoff
- target phase is docs-only or metadata-only
- protected files are forbidden
- final report format is included

### After Receiving Report

- report has all required sections
- files inspected are listed
- files modified are listed
- commands are listed
- typecheck and smoke evidence are present or explained
- scope check is present
- forbidden grep is present
- commit/push posture is present
- unsafe claims are absent

### Before Accepting Next Phase

- validation status reviewed
- alert level reviewed
- closeout status reviewed
- dirty files outside scope remain unstaged
- next recommended phase is explicit
- operator notes any confusion points

## Stop Conditions

Stop immediately if:

- prompt is marked `safeToExecute=true`
- handoff is not `approved_for_copy`
- human approval is missing
- dirty files outside scope are staged
- Codex touches `package.json`
- Codex touches workflows
- Codex touches providers
- Codex touches dashboard files
- Codex touches DB/SQL files
- Codex touches secret material
- report lacks scope check
- report lacks forbidden grep
- report claims runtime action
- report claims provider action
- closeout is `blocked`
- closeout is `unsafe_scope`

## Validation Checklist

Required report checks:

- phase matches expected phase
- mode matches expected mode
- required sections are present
- allowed files respected
- forbidden files untouched
- dirty files outside scope not staged
- typecheck evidence present or reviewed
- smoke evidence present or reviewed
- forbidden grep clean or reviewed
- commit/push posture matches mode
- runtime claims absent
- provider claims absent
- package/workflow claims absent
- dashboard claims absent
- DB/SQL claims absent
- secret material absent
- next action produced
- closeout produced

## Expected Codex Report Shape

The separate Codex report should include:

```text
1. Phase:
<phase name>

2. Files inspected:
- <list>

3. Files modified:
- <list>

4. Summary:
- <brief result>

5. Safety guarantees:
- <manual-only/source-only guarantees>

6. Tests/scripts:
- <checks added or updated, if any>

7. Commands executed:
- <command> -> <result>

8. Scope check:
- git status
- git diff
- staged files
- dirty files outside scope

9. Forbidden grep:
- <result>

10. Commit/push:
- <status appropriate to mode>

11. Next recommended phase:
<phase name>
```

## Evaluation Form

Use this after the trial:

```text
trial completed: yes/no
failed step: <step id or none>
confusion points:
- <operator note>
validation result: passed/needs_review/failed/blocked
alert level: no_alert/mild_alert/blocking_alert
closeout result: completed_local_only/closed_and_pushed/needs_human_review/needs_retry/needs_commit/needs_push/blocked/unsafe_scope
manual effort level: low/moderate/high/too_high
time cost label: under_10_minutes/10_to_20_minutes/20_to_40_minutes/over_40_minutes
usefulness score: 1-5
improvement recommendation: <one concrete improvement>
safe to continue: yes/no
next recommended phase: <phase>
```

## Troubleshooting

If the prompt is not approved:

- return to handoff review
- repair missing checklist evidence
- do not continue manually

If report format is incomplete:

- request a corrected report from the separate Codex session
- do not infer missing scope or safety evidence

If validation returns `mild_alert`:

- review warnings one by one
- continue only if the human accepts the warnings
- capture confusion points in the evaluation form

If validation returns `blocking_alert`:

- stop the trial
- preserve the report as evidence
- create a retry or repair plan

If closeout is `unsafe_scope`:

- stop the trial
- do not advance to the next phase
- inspect forbidden file and staged-file evidence

## Next Recommended Phase

If this guide passes verification and the operator is ready for a real trial:

- PILOT-11B - REAL USER LOOP TRIAL EXECUTION REPORT PLAN

Alternative:

- Phase 141B - ROADMAP CONTINUATION PLAN
