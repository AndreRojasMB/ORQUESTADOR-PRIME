# Codex Handoff Contract

Phase: 26G-B - AUTOPILOT LOOP PRIORITY PIVOT PLAN

Status: handoff contract plan / docs-only

## Purpose

This contract defines the metadata required before handing work from
ORQUESTADOR-PRIME / Viernes to Codex. It is designed for safe planning and
bounded implementation phases.

The handoff contract is a prompt contract. It is not a runner, queue, provider
call, job dispatch, approval execution, dashboard mutation, or automation
trigger.

## Required Handoff Fields

Every Codex handoff must include:

- project path,
- branch,
- phase name,
- task title,
- mode (`B`, `I`, `R`, or `S`),
- previous phase context,
- latest known commit if available,
- known dirty files,
- allowed files,
- forbidden files,
- implementation boundaries,
- verification plan,
- smoke plan,
- scope check,
- forbidden grep,
- commit/push rules,
- final report format,
- next recommended phase.

## Mode Semantics

`B` - planning / audit / scope

- Inspect files.
- Create plans or docs if allowed.
- Do not implement runtime behavior.
- Do not commit or push.

`I` - implementation / verification

- Implement only approved scope.
- Run verification and smoke checks.
- Commit and push only if explicitly required and safe.

`R` - review / validation

- Review outputs, risks, and gaps.
- Prefer findings before summaries.
- Do not modify files unless explicitly allowed.

`S` - smoke / status only

- Run safe checks.
- Report status.
- Do not modify files.

## Required Prompt Skeleton

```text
Act as a senior safe integration agent for ORQUESTADOR-PRIME / Viernes.

Project path:
<absolute path>

Branch:
<branch>

Task:
<phase and title>

Mode:
<B/I/R/S meaning>

Previous phase context:
<summary, commit, known constraints>

Goal:
<bounded objective>

Allowed files:
<explicit list>

Forbidden files:
<explicit list>

Boundaries:
<no secrets, no provider sends, no deploy, no runtime activation, ...>

Implementation requirements:
<only for I mode>

Verification plan:
<commands and expected checks>

Smoke plan:
<behavioral checks>

Scope check:
<git status, diff, staged files>

Forbidden grep:
<patterns and allowed matches>

Commit/push rules:
<none for B/R/S, explicit for I>

Final report format:
<required fields>
```

## Required Codex Report Fields

Codex reports must include:

- phase,
- files inspected,
- files modified,
- plan summary or implementation summary,
- feature flags or boundaries when relevant,
- tests added or updated,
- commands executed with results,
- verification summary,
- smoke summary,
- scope check,
- forbidden grep result,
- commit hash if created,
- push status if pushed,
- alert level,
- deviations from plan,
- next recommended phase.

## Report Status Vocabulary

Recommended status values:

- `planned`,
- `implemented`,
- `verified`,
- `smoke_passed`,
- `needs_review`,
- `blocked`,
- `failed`.

## Verification Requirements

Future handoffs should use the smallest relevant checks first:

- `git status --short --branch`,
- typecheck when TypeScript changed,
- Python compile when Python changed,
- targeted unit or smoke tests,
- `git diff --check`,
- `git diff --cached --check`,
- scope-specific forbidden grep,
- final `git status --short`.

If WSL lacks Node, use the known Windows Node fallback only when it is already
available. Do not install dependencies during a handoff unless the phase
explicitly allows dependency changes.

## Scope Rules

Codex must:

- identify dirty files before editing,
- avoid unrelated dirty files,
- stage only approved files,
- report any pre-existing dirty files,
- stop if a required file is dirty in a way that makes the task unsafe,
- avoid destructive git operations unless explicitly requested.

## Forbidden Content Rules

Codex must not read, print, copy, or invent:

- secrets,
- private keys,
- tokens,
- provider credentials,
- webhook credentials,
- vault contents,
- production data,
- raw provider responses unless explicitly safe and redacted.

## Approval Rules

Human approval is required before:

- implementation after a planning-only phase,
- expanding scope,
- touching forbidden files,
- activating execution behavior,
- enabling provider sends,
- creating deployments,
- changing workflow or package scripts,
- committing when the phase does not explicitly allow it,
- pushing when the phase does not explicitly allow it.

## Future Runner Boundary

A future Codex handoff runner may create the prompt and track state. The first
MVP must not automatically launch Codex, execute shell commands, write stores,
or mark tasks approved without human review.
