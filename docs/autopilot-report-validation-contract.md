# Autopilot Report Validation Contract

Phase: 26I-B - AUTOPILOT VALIDATION AND MEMORY PLAN

Status: report validation contract plan / docs-only

## Purpose

This contract describes how a future source-only validator should evaluate a
Codex report against the expected handoff and phase metadata.

The contract does not execute checks. It expects check evidence to be supplied
by the caller.

## Input Contract

Required inputs:

- `CodexReportContract`,
- expected phase,
- expected branch,
- allowed files,
- forbidden files,
- required command names,
- expected test names,
- forbidden grep rules,
- previous dirty state,
- current dirty state,
- staged files,
- commit policy,
- push policy,
- risk level.

Optional inputs:

- accepted warning codes,
- known pre-existing dirty files,
- expected fallback notes,
- reviewer notes,
- phase-specific stop conditions.

## Output Contract

Required outputs:

- validation id,
- phase,
- status,
- scope violations,
- missing commands,
- failed commands,
- missing tests,
- forbidden grep violations,
- dirty files warnings,
- secrets/logging warnings,
- commit status finding,
- push status finding,
- next action recommendation,
- human review requirement,
- safe summary.

Status values:

- `passed`,
- `failed`,
- `needs_review`,
- `blocked`.

## Scope Rules

The validator should compare report files against:

- allowed files,
- forbidden files,
- expected changed files,
- pre-existing dirty files,
- current dirty files,
- staged files.

Rules:

- forbidden file changes produce `blocked`,
- unrelated staged files produce `blocked`,
- missing modified-file report produces `needs_review`,
- untracked allowed docs may be acceptable only when expected,
- package/workflow changes require explicit phase permission.

## Command Rules

The validator should check:

- required commands are present,
- each command has a result,
- failed commands are findings,
- skipped commands include a reason,
- WSL Node unavailable is acceptable only when the Windows Node fallback is
  reported and passed,
- Python compile is required when Python files changed,
- typecheck is required when TypeScript files changed.

## Test Rules

The validator should check:

- expected tests are present,
- each expected test has a result,
- test failures produce `failed` unless explicitly accepted by a human,
- missing tests produce `needs_review`,
- no test run should be invented.

## Forbidden Grep Rules

Forbidden grep validation should include:

- exact pattern,
- searched paths,
- result summary,
- allowed matches,
- unapproved matches.

Unapproved matches produce `failed` or `blocked` depending on risk.

## Commit And Push Rules

Commit and push checks should compare reported behavior against the phase mode:

- planning phases should have no commit and no push,
- implementation phases may require commit and push,
- unexpected commit or push produces `blocked`,
- missing required commit or push produces `failed` or `needs_review`.

## Secrets And Logging Rules

The validator should flag:

- secrets in report text,
- raw credential material,
- raw provider responses,
- webhook secrets,
- vault content,
- production data,
- logs with sensitive values.

Any suspected secret should require human review and redaction.

## Next Action Mapping

Recommended mapping:

- `passed`: recommend next phase.
- `passed` with warnings: recommend next planning phase or human review.
- `failed`: recommend retry implementation or rollback planning.
- `needs_review`: request human review.
- `blocked`: freeze scope and create a new plan.

The next action is advisory only.

## Phase 26I-I Contract Mapping

Phase 26I-I maps this contract to:

- `validateCodexReportAgainstHandoff(...)`,
- `summarizeAutopilotValidation(...)`,
- `recommendPostValidationAction(...)`.

Each helper accepts metadata supplied by the caller. None of them run commands,
inspect files, read environment values, call networks, or mutate state.
