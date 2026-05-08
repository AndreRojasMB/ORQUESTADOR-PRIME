# Master Task Cycle

Phase: 26G-B - AUTOPILOT LOOP PRIORITY PIVOT PLAN

Status: cycle architecture plan / docs-only

## Purpose

The master task cycle describes how ORQUESTADOR-PRIME / Viernes should move
from a simple idea to a validated next action without activating autonomous
execution.

The cycle is intended to make future work repeatable:

```text
intake -> phase plan -> task queue -> Codex handoff -> report -> validation
-> memory update proposal -> next action -> human approval gate
```

## Cycle Objects

### Objective

An objective captures the original idea.

Fields:

- objective id,
- source,
- original text,
- safe summary,
- assumptions,
- exclusions,
- created at,
- risk level.

### Phase

A phase converts the objective into a bounded work package.

Fields:

- phase id,
- phase name,
- mode,
- goal,
- previous phase context,
- allowed files,
- forbidden files,
- verification plan,
- smoke plan,
- rollback plan,
- expected report contract.

### Task

A task is the unit handed to Codex.

Fields:

- task id,
- objective id,
- phase id,
- title,
- state,
- mode,
- risk level,
- allowed files,
- forbidden files,
- command plan,
- smoke plan,
- forbidden grep,
- final report format.

Task states:

- `pending`,
- `running`,
- `codex_done`,
- `validating`,
- `needs_review`,
- `approved`,
- `failed`,
- `blocked`.

### Handoff

A handoff is a complete Codex prompt derived from the task. It is reviewed by
a human before use.

Fields:

- handoff id,
- task id,
- project path,
- branch,
- prompt text,
- expected output format,
- safety boundaries,
- human approval marker.

### Report

A report is Codex's structured response.

Fields:

- report id,
- task id,
- phase,
- files inspected,
- files modified,
- commands executed,
- verification summary,
- smoke summary,
- scope check,
- forbidden grep result,
- commit/push status,
- next recommended phase.

### Validation

Validation checks the report and workspace state.

Fields:

- validation id,
- report id,
- status,
- findings,
- warnings,
- errors,
- accepted files,
- rejected files,
- commands confirmed,
- remaining risks.

### Memory Update Proposal

A memory update proposal captures what should be remembered after validation.

Fields:

- memory proposal id,
- validated phase,
- commit hash,
- artifact list,
- safety notes,
- next phase,
- unresolved issues,
- do-not-forget notes.

This is a proposal only. It is not automatically persisted in the first MVP.

### Next Action

The next action recommends what to do after validation.

Fields:

- next action id,
- category,
- priority,
- summary,
- reason,
- required approval,
- next phase prompt seed.

## First MVP Queue Representation

The first MVP should represent a queue as in-memory or source-only metadata
contracts. It should not implement a persistent queue.

Recommended queue fields:

- queue id,
- project id,
- current objective id,
- current phase id,
- tasks,
- active task id,
- blocked reasons,
- validation status,
- next action recommendation,
- advisory-only flag,
- no-execution flag.

## Handoff To Codex

The queue does not run Codex. It prepares a handoff prompt and waits for human
confirmation. The human copies or approves the prompt into Codex.

The handoff must include the full safety boundary and final report format so
Codex can close the task without guessing.

## Validation Strategy

Validation should check:

- TypeScript typecheck when TypeScript changed,
- Python compile when Python changed,
- targeted tests,
- smoke checks,
- `git diff --check`,
- staged files,
- changed files,
- forbidden grep,
- no secrets in output,
- no real writes,
- no outbound sends,
- no runtime activation,
- no dashboard mutation,
- no package or workflow drift unless explicitly allowed.

Validation should never assume a task succeeded just because Codex says it did.

## Memory Strategy

The memory update proposal should be reviewed before persistence. The first
MVP should keep memory update candidates as report metadata.

Future memory integration must define:

- storage target,
- redaction rules,
- approval requirement,
- rollback behavior,
- audit trail,
- failure mode.

## Next Action Strategy

Next actions should prefer safe categories:

- report current state,
- plan next phase,
- propose implementation scope,
- request clarification,
- request approval metadata,
- stop due to blocker.

Execution-like next actions are future-only and require a separate approved
phase.

## Connection To Future Surfaces

WhatsApp may later provide explicit approval commands. Dashboard may later show
queue status. A later approved desktop-automation phase may define local action
handling. n8n may later orchestrate external workflows.

None of those are part of the first MVP. This cycle only defines the contract
for controlled movement from idea to validated next recommendation.

## Phase Sequence

Recommended continuation:

- 26G-I: implement source-only autopilot loop contracts.
- 26H-B: plan a Codex handoff runner.
- 26H-I: implement a handoff runner MVP without execution.
- 26I-B: plan validation and memory proposal flow.
- 26I-I: implement validation and memory proposal MVP.
