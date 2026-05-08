# Autopilot Real Dry-Run Scenario

Phase: PILOT-1B - AUTOPILOT REAL DRY-RUN PLAN

Status: scenario plan / docs-only

## Purpose

This document defines a representative scenario for PILOT-1I. The scenario is
not an implementation. It describes the fixture shape and expected metadata
flow for a controlled Autopilot dry-run.

## Scenario Name

`pilot_sample_phase_closeout`

The scenario represents a simulated planning phase that completed locally,
produced docs-only output, and recommends a matching implementation phase.

## Simulated Input Bundle

Recommended fixture fields:

- `samplePhaseReport`
  - phase: `Phase PILOT-SAMPLE-B - CONTROLLED METADATA PLAN`
  - files inspected: supplied metadata list
  - files modified: supplied docs-only list
  - commands executed: supplied verification summaries
  - tests: supplied smoke summaries
  - scope check: supplied clean summary
  - forbidden grep result: supplied clean summary
  - next recommended phase: `Phase PILOT-SAMPLE-I - CONTROLLED METADATA IMPLEMENTATION`

- `sampleHandoffContract`
  - project path,
  - branch,
  - phase,
  - mode: `B`,
  - allowed files,
  - forbidden files,
  - verification plan,
  - smoke plan,
  - final report sections,
  - source-only boundaries.

- `sampleCodexReportContract`
  - report id,
  - phase,
  - modified file metadata,
  - command result metadata,
  - final status,
  - advisory/source/metadata-only flags.

- `sampleWorkspaceState`
  - previous dirty files,
  - current dirty files,
  - staged files,
  - mobile 121B docs marked as unrelated and unstaged.

- `sampleCommitPushMetadata`
  - commit required: false for the simulated B phase,
  - push required: false for the simulated B phase,
  - commit hash: absent by design,
  - push status: not requested.

- `sampleRiskApprovalMetadata`
  - risk level: report-only,
  - approval status: human review required before using prompt output,
  - memory proposal status: proposed only.

## Expected Stage Flow

1. Handoff package rendering
   - returns prompt text, report schema, checklist, and package metadata.
   - sets no Codex invocation and no execution flags.

2. Report validation
   - validates supplied report metadata against supplied handoff metadata.
   - returns `passed` when scope, commands, tests, and forbidden grep summaries
     are clean.

3. Memory proposal
   - returns proposal status `proposed`.
   - records human review requirement.
   - records no memory persistence.

4. Error-learning rules
   - returns guardrail recommendations.
   - does not apply or store rules.

5. Next-action coordination
   - returns `continue_to_I_phase` for a clean B-mode sample.
   - creates a prompt seed only.
   - preserves human review before prompt use.

6. Phase closeout coordination
   - returns `completed_local_only`.
   - confirms commit and push are not required for the simulated planning
     phase.
   - confirms safe next phase metadata.

7. Human-facing response skeleton
   - returns alert label, next phase line, model recommendation, and prompt
     line.
   - remains metadata only.

8. Next prompt draft
   - returns text for human review.
   - does not start work.

## Expected Output Shape

The final dry-run result should include:

- scenario id,
- validation status,
- memory proposal status,
- learning rule count,
- next action,
- closeout status,
- prompt draft availability,
- human review requirement,
- safety boundary confirmation,
- success or failure status.

## Expected Success State

The scenario should pass when:

- validation status is `passed`,
- memory proposal status is `proposed`,
- next action is `continue_to_I_phase`,
- closeout status is `completed_local_only`,
- prompt draft exists as metadata,
- no external action is reported,
- no unrelated staged files are reported.
