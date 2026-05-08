# Autopilot Phase Closeout Decision Model

Phase: 26K-B - AUTOPILOT PHASE CLOSEOUT COORDINATOR PLAN

Status: decision model plan / docs-only

## Purpose

This document defines the proposed decision model for the future Autopilot
Phase Closeout Coordinator.

The model converts final report, validation, next-action, memory proposal,
scope, verification, commit, push, and roadmap target metadata into a closeout
status.

## Proposed Type Model

Future Phase 26K-I should likely add source-only types such as:

- `AutopilotCloseoutInput`,
- `AutopilotCloseoutResult`,
- `AutopilotCloseoutStatus`,
- `AutopilotCloseoutAlertLevel`,
- `AutopilotCloseoutBlockerSummary`,
- `AutopilotCloseoutRoadmapReturn`,
- `AutopilotCloseoutPromptType`,
- `AutopilotCloseoutHumanOutput`.

Recommended closeout statuses:

- `closed_and_pushed`,
- `completed_local_only`,
- `needs_commit`,
- `needs_push`,
- `needs_human_review`,
- `blocked`,
- `unsafe_scope`,
- `ready_for_next_phase`,
- `ready_for_roadmap_return`.

Recommended alert values:

- `no_alert`,
- `mild_alert`,
- `blocking_alert`.

## Decision Input Fields

The closeout input should include:

- phase name,
- phase mode,
- branch,
- expected next phase,
- roadmap target,
- final report metadata,
- validation report metadata,
- next-action recommendation metadata,
- memory proposal status,
- test results,
- smoke results,
- typecheck result,
- forbidden grep result,
- scope check result,
- staged files,
- dirty files outside scope,
- commit hash,
- push status,
- accepted warnings,
- unresolved blockers,
- approval status.

## Decision Output Fields

The closeout output should include:

- closeout status,
- alert level,
- closeout message,
- commit required,
- push required,
- human review required,
- safe to continue,
- next phase,
- roadmap return allowed,
- blocker summary,
- recommended model,
- required prompt type,
- human-facing output,
- source-only boundary metadata.

## Rule Matrix

| Condition | Closeout status | Alert |
| --- | --- | --- |
| `B` phase docs-only, local plan complete | `completed_local_only` | `no_alert` |
| `I` phase with commit and push evidence | `closed_and_pushed` | `no_alert` |
| `I` phase missing commit evidence | `needs_commit` | `mild_alert` |
| `I` phase missing push evidence | `needs_push` | `mild_alert` |
| Unrelated dirty files, unstaged | continue with caution | `mild_alert` |
| Unrelated files staged | `blocked` | `blocking_alert` |
| Forbidden files modified | `unsafe_scope` | `blocking_alert` |
| Typecheck failed | `needs_human_review` | `mild_alert` |
| Tests or smoke failed | `needs_human_review` | `mild_alert` |
| Forbidden grep violation | `blocked` | `blocking_alert` |
| Runtime/provider/dashboard/deploy behavior appears | `blocked` | `blocking_alert` |
| 26K-I closed and pushed | `ready_for_roadmap_return` | `no_alert` |

## Prompt Type Model

Recommended prompt types:

- `none`,
- `implementation_prompt`,
- `planning_prompt`,
- `human_review_prompt`,
- `rollback_plan_prompt`,
- `roadmap_return_prompt`.

The prompt type is metadata only. It does not create or run a prompt.

## Human-Facing Output

The future closeout coordinator should preserve:

```text
1. Alerta
<label>

2. Siguiente fase
<phase and closeout reason>

3. Modelo recomendado
<model>

4. Prompt listo para Codex
<prompt type or unavailable message>
```

## Roadmap Return Decision

Roadmap return is allowed only when:

- current phase is Phase 26K-I,
- phase mode is implementation,
- validation passed,
- scope is clean,
- forbidden grep is clean,
- commit hash exists,
- push status is successful,
- no blocking alert remains,
- roadmap target is Phase 109B.

When these conditions hold, closeout status should be
`ready_for_roadmap_return`.

## Relationship To 26J Coordinator

The 26J next-action coordinator recommends the next phase. The 26K closeout
coordinator confirms whether the current phase has enough evidence to leave.

If 26J recommends continuation but 26K closeout evidence is incomplete, 26K
should request closeout before advancing.

## Relationship To Phase 109B

Phase 109B resumes the formal PM roadmap with PM Status Reporting Plan work.
The Autopilot closeout coordinator should provide the final bridge back to
that roadmap without deleting the Autopilot contracts.

## Phase 26K-I Contract Mapping

Phase 26K-I maps this model to:

- `coordinatePhaseCloseout(...)`,
- `classifyPhaseCloseoutStatus(...)`,
- `evaluateRoadmapReturnReadiness(...)`,
- `buildCloseoutMessage(...)`,
- `recommendCloseoutNextPhase(...)`.

Each helper accepts caller-supplied metadata. None of them run commands,
inspect files, read environment values, call networks, mutate memory, or change
repository state.
