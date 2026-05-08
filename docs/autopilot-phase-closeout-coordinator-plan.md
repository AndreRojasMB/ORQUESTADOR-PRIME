# Autopilot Phase Closeout Coordinator Plan

Phase: 26K-B - AUTOPILOT PHASE CLOSEOUT COORDINATOR PLAN

Status: planning / audit / docs-only

## Purpose

This document plans the future Autopilot Phase Closeout Coordinator for
ORQUESTADOR-PRIME / Viernes.

The closeout coordinator decides whether a phase is fully closed, locally
complete only, missing commit/push evidence, blocked, unsafe to continue, ready
for the next B/I phase, or ready to return to the formal roadmap.

Phase 26K-B does not implement the coordinator. It does not activate runtime
execution, Codex execution, process launch, OpenClaw usage, WhatsApp outbound,
n8n usage, dashboard mutation, provider calls, memory persistence, deploy, DB
or SQL mutation, package/workflow changes, or source-driven git changes.

## Current Context

Phase 26J-I added a source-only next-action coordinator:

- alert classification,
- next action decision,
- next phase recommendation,
- model recommendation,
- human-facing response skeleton.

Phase 26K should close the Autopilot pivot so the project can safely return to
the formal PM roadmap at Phase 109B.

## Closeout Inputs

The future coordinator should accept caller-provided metadata only:

- phase name,
- phase mode: `B` or `I`,
- Codex final report,
- validation report,
- next-action recommendation,
- memory proposal status,
- tests and smoke results,
- typecheck result,
- forbidden grep result,
- scope check result,
- staged files,
- dirty files outside scope,
- commit hash,
- push status,
- branch,
- expected next phase,
- roadmap target,
- accepted warnings,
- unresolved blockers,
- approval status.

The coordinator must not inspect the repository, read environment values, call
providers, launch tools, or mutate state. All evidence should be supplied by the
caller.

## Closeout Outputs

The future coordinator should return:

- `closeoutStatus`,
- `alertLevel`,
- `closeoutMessage`,
- `commitRequired`,
- `pushRequired`,
- `humanReviewRequired`,
- `safeToContinue`,
- `nextPhase`,
- `roadmapReturnAllowed`,
- blocker summary,
- recommended model,
- required prompt type,
- human-facing response skeleton,
- source-only boundary metadata.

## Closeout Statuses

Supported closeout statuses:

- `closed_and_pushed`,
- `completed_local_only`,
- `needs_commit`,
- `needs_push`,
- `needs_human_review`,
- `blocked`,
- `unsafe_scope`,
- `ready_for_next_phase`,
- `ready_for_roadmap_return`.

## Decision Rules

Recommended rules:

- A `B` phase with docs-only output and no commit may be
  `completed_local_only`.
- An `I` phase must have commit and push evidence to be fully closed.
- If commit hash and successful push metadata exist, mark
  `closed_and_pushed`.
- If dirty files outside scope are unstaged, raise `Alerta leve` while allowing
  continuation.
- If dirty files outside scope are staged, return `blocked`.
- If forbidden files were modified, return `unsafe_scope`.
- If typecheck or required tests fail, recommend retry or human review.
- If forbidden grep evidence reports provider sends, OpenClaw usage, dashboard
  mutation, deployment, DB/SQL mutation, memory persistence, runtime behavior,
  or process launch, return `blocked`.
- If implementation was source-only and scope is clean, allow continuation.
- If the Autopilot pivot is closed through 26K-I, recommend return to Phase
  109B.
- If the phase is not actually closed, do not advance.

## Phase Mode Policy

Planning phases may finish locally when they only create plan docs and the next
approved phase will commit them together with implementation artifacts.

Implementation phases should close only when:

- required verification passed,
- smoke checks passed,
- forbidden grep evidence is clean,
- scope check is clean,
- unrelated dirty files are not staged,
- commit hash exists,
- push status is successful,
- final report names the next recommended phase.

## Relationship To Next-Action Coordinator

The next-action coordinator recommends where to go. The closeout coordinator
decides whether the current phase is safe enough to leave.

The future implementation should consume the next-action coordinator result
without treating it as permission to continue when closeout evidence is
incomplete.

## Human-Facing Output Format

The closeout coordinator must preserve this structure:

1. `Alerta`
2. `Siguiente fase`
3. `Modelo recomendado`
4. `Prompt listo para Codex`

The prompt field is text metadata only. It should not invoke Codex.

## Non-Goals

The closeout coordinator MVP should not:

- execute Codex,
- launch processes,
- call providers,
- send WhatsApp messages,
- run n8n,
- invoke OpenClaw,
- mutate dashboard state,
- persist memory,
- stage, commit, or push from source,
- deploy,
- change package scripts or workflows,
- modify DB/SQL files,
- approve its own recommendation.

## Verification Plan For 26K-I

Recommended checks for the future implementation phase:

- `git status --short --branch`,
- `node node_modules/typescript/bin/tsc --noEmit`,
- Windows Node fallback when WSL Node is unavailable,
- targeted closeout coordinator smoke tests,
- `git diff --check`,
- `git diff --cached --check`,
- scope check over changed files only,
- forbidden grep over closeout source and docs.

## Future Implementation Split

Recommended continuation:

- Phase 26K-I - AUTOPILOT PHASE CLOSEOUT COORDINATOR MVP
- Phase 109B - PM STATUS REPORTING PLAN

## Phase 26K-I Implementation Note

Phase 26K-I implements this plan as source-only TypeScript metadata helpers:

- closeout decision model,
- closeout status classification,
- roadmap return readiness,
- commit and push requirement handling,
- scope, dirty, and staged metadata handling,
- human-facing closeout response.

The implementation remains metadata-only. It does not read the workspace, run
commands, invoke services, persist memory, mutate git state, or start a runtime
loop.
