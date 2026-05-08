# Codex Handoff Runner Plan

Phase: 26H-B - CODEX HANDOFF RUNNER PLAN

Status: planning / audit / docs-only

## Purpose

This document plans a future Codex Handoff Runner MVP for the
ORQUESTADOR-PRIME / Viernes autopilot loop. The future runner should transform
an approved `AutopilotTaskMetadata` plus `CodexHandoffContract` into a
Codex-ready handoff prompt and an expected report contract.

Phase 26H-B does not implement the runner. It does not launch Codex, automate a
terminal, call providers, send WhatsApp messages, call n8n, run OpenClaw tools,
mutate dashboard state, deploy, write memory, or perform git operations.

## Current Source Foundation

Phase 26G-I added `src/autopilot/*` as source-only contracts:

- task states,
- loop stages,
- risk levels,
- source-only boundaries,
- Codex handoff contract,
- Codex report contract,
- validation report contract,
- memory update proposal contract,
- next-action recommendation contract.

The future runner must use these contracts without weakening their source-only
and human-approval posture.

## Runner MVP Scope

The MVP should be limited to:

- prompt generation only,
- handoff metadata formatting only,
- expected report schema formatting only,
- validation checklist formatting only,
- next-stage recommendation metadata only,
- human-mediated handoff only.

The MVP must not:

- execute Codex,
- start terminal automation,
- launch local or remote processes,
- call provider APIs,
- run desktop automation,
- run browser automation,
- send outbound WhatsApp messages,
- call n8n workflows,
- mutate dashboard state,
- mutate memory,
- write databases or SQL,
- deploy,
- create commits automatically,
- push automatically,
- approve itself.

## Future Runner Inputs

The future runner should accept caller-provided metadata only:

- approved `AutopilotTaskMetadata`,
- `CodexHandoffContract`,
- risk level,
- approval status,
- allowed files,
- forbidden files,
- verification plan,
- smoke plan,
- scope check,
- forbidden grep,
- final report format.

Inputs must be supplied in memory by the caller. The runner should not read
secrets, scan repositories, load config files, inspect environment variables,
or query external systems in the MVP.

## Future Runner Outputs

The future runner should produce:

- generated prompt markdown,
- handoff metadata,
- expected Codex report schema,
- validation checklist,
- scope checklist,
- forbidden grep checklist,
- next-stage recommendation.

The safest first implementation should return the generated prompt as a string
or structured object. If a later phase allows file export, the output path must
be explicit, reviewed, and limited to an approved documentation or handoff
artifact path. No background file export should occur.

## Proposed Runner Stages

### 1. Accept Approved Task Metadata

The runner receives task metadata that has already passed a human gate. If the
task state is not approved for handoff, the runner returns a blocked handoff
draft.

### 2. Normalize Handoff Metadata

The runner checks that required handoff fields are present:

- project path,
- branch,
- phase,
- mode,
- previous phase context,
- allowed files,
- forbidden files,
- verification plan,
- smoke plan,
- final report format.

This check is structural only. It does not read the filesystem.

### 3. Generate Codex Prompt Markdown

The runner formats a prompt with:

- role and project context,
- task and mode,
- previous phase context,
- goal,
- allowed files,
- forbidden files,
- boundaries,
- verification plan,
- smoke plan,
- scope check,
- forbidden grep,
- final report format.

The prompt is a handoff artifact. It is not a command and not an execution
request until a human reviews and submits it.

### 4. Generate Expected Report Schema

The runner renders the required Codex report sections and marks which fields
are mandatory for the current mode.

Implementation mode may require commit and push fields. Planning mode should
explicitly require no commit and no push.

### 5. Wait For Human-Mediated Execution

The MVP stops after producing the prompt and checklist. A human decides whether
to paste the prompt into Codex or approve a future controlled execution path.

### 6. Receive Codex Report

The runner may later accept a report object pasted or supplied by a human. The
MVP should validate structure only:

- phase present,
- files inspected present,
- files modified present,
- commands present,
- tests or explicit not-run reason present,
- scope check present,
- forbidden grep result present,
- next phase present.

### 7. Pass To Validation / Memory / Next Action

After report intake, the runner passes metadata to:

- validation contract,
- memory update proposal contract,
- next action recommendation contract.

The runner does not write memory or approve the next action.

## Report Intake Contract

The report intake should accept only structured metadata matching
`CodexReportContract`. It should reject reports that:

- omit phase,
- omit scope check,
- omit forbidden grep result,
- claim commit or push when not allowed,
- reference forbidden files,
- report execution outside approved scope,
- include secrets or credential material,
- omit the next recommended phase.

## Validation Strategy

The future runner should prepare validation metadata for:

- TypeScript typecheck result,
- Python compile result when Python files changed,
- test result summary,
- git status summary,
- changed-file scope,
- staged-file scope,
- forbidden grep summary,
- secrets/logging warnings,
- final validation status.

The runner must not treat a Codex report as automatically true. It only
prepares validation inputs for a separate validation phase.

## Approval Gates

Human approval is required before:

- generated prompt is used for implementation,
- any future runner launches a task,
- any memory update is written,
- any commit automation is introduced,
- any push automation is introduced,
- any external service call is introduced,
- any critical action proceeds beyond planning.

Critical actions remain plan-only until a separate phase defines risk controls,
approval contract, validation, and rollback.

## Future Implementation Split

Recommended continuation:

- Phase 26H-I - CODEX HANDOFF RUNNER MVP
- Phase 26I-B - AUTOPILOT VALIDATION AND MEMORY PLAN
- Phase 26I-I - AUTOPILOT VALIDATION AND MEMORY MVP

Phase 26H-I should implement only source-level prompt rendering and report
shape validation. It should not add a CLI, package script, terminal launcher,
provider call, Codex invocation, memory write, dashboard integration, or
external automation.
