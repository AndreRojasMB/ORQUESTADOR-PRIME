# Autopilot Next-Action Decision Model

Phase: 26J-B - AUTOPILOT NEXT-ACTION COORDINATOR PLAN

Status: decision model plan / docs-only

## Purpose

This document defines the proposed decision model for the future Autopilot
Next-Action Coordinator.

The model converts validation and memory proposal metadata into a single
human-facing next-step recommendation.

## Proposed Type Model

Future Phase 26J-I should likely add source-only types such as:

- `AutopilotCoordinatorInput`,
- `AutopilotCoordinatorResult`,
- `AutopilotCoordinatorNextAction`,
- `AutopilotCoordinatorAlertLevel`,
- `AutopilotCoordinatorBlockerSummary`,
- `AutopilotCoordinatorPromptSeed`,
- `AutopilotCoordinatorDecisionFinding`,
- `AutopilotCoordinatorHumanOutput`.

Recommended alert values:

- `no_alert`,
- `alerta_leve`,
- `alerta_bloqueante`.

Recommended next-action values:

- `continue_next_phase`,
- `continue_to_I_phase`,
- `continue_to_next_B_phase`,
- `retry_phase`,
- `request_human_review`,
- `freeze_scope`,
- `rollback_plan`,
- `blocked`,
- `closeout_required`.

## Decision Input Fields

The coordinator input should include:

- report metadata,
- validation report metadata,
- validation summary metadata,
- memory proposal metadata,
- error learning rule metadata,
- current phase,
- expected next phase,
- current phase mode,
- previous phase mode,
- risk level,
- approval status,
- dirty files status,
- staged files status,
- commit status,
- push status,
- blocked reasons,
- recommended model,
- prompt availability.

## Decision Output Fields

The coordinator output should include:

- next action,
- next phase,
- reason,
- risk level,
- required approval,
- recommended model,
- prompt needed,
- handoff allowed,
- memory proposal status,
- blocker summary,
- alert level,
- human-facing output,
- source-only boundary metadata.

## Rule Matrix

| Condition | Recommendation | Alert |
| --- | --- | --- |
| `B` phase clean | `continue_to_I_phase` | `no_alert` |
| `I` phase clean with commit/push metadata | `continue_to_next_B_phase` | `no_alert` |
| Implementation phase missing commit/push metadata | `request_human_review` | `alerta_leve` |
| Unrelated dirty files, unstaged | continue with caution | `alerta_leve` |
| Forbidden files modified | `blocked` | `alerta_bloqueante` |
| Unrelated files staged | `blocked` | `alerta_bloqueante` |
| Typecheck failed | `retry_phase` or review | `alerta_leve` |
| Tests failed | `retry_phase` or review | `alerta_leve` |
| Forbidden grep violation | `blocked` or retry | `alerta_bloqueante` |
| Memory proposal pending review | continue only without persistence | `alerta_leve` |
| Critical action requested | `freeze_scope` | `alerta_bloqueante` |
| Runtime/provider/dashboard/deploy behavior appears | `blocked` | `alerta_bloqueante` |

## Human-Facing Output

The future coordinator should produce:

```text
1. Alerta
<No alert | Alerta leve | Alerta bloqueante>

2. Siguiente fase
<phase id and short reason>

3. Modelo recomendado
<model name or human-mediated Codex>

4. Prompt listo para Codex
<prompt seed or "not allowed until review">
```

The prompt field is text only. It should not launch Codex.

## Prompt Needed Rules

`promptNeeded=true` when:

- the next action is `continue_to_I_phase`,
- the next action is `retry_phase`,
- the next action is `rollback_plan`,
- a human explicitly asks for a handoff prompt.

`promptNeeded=false` when:

- the next action is `request_human_review`,
- the next action is `blocked`,
- the next action is `closeout_required`,
- the coordinator lacks enough metadata.

## Handoff Allowed Rules

`handoffAllowed=true` only when:

- validation passed or warnings are accepted by a human,
- no forbidden file changes are reported,
- unrelated files are not staged,
- phase mode transition is valid,
- risk is not future execution risk,
- required approval metadata exists.

`handoffAllowed=false` when:

- validation is blocked,
- required evidence is missing,
- critical risk remains unresolved,
- memory persistence is requested,
- runtime or provider behavior appears.

## Relationship To PM Next Best Action

The PM Next Best Action model recommends advisory actions inside the PM domain.
The Autopilot coordinator recommends phase-level movement. Phase 26J-I should
keep those concerns separate:

- PM recommendation: what kind of project-management step is safest.
- Autopilot recommendation: which phase/handoff/review step comes next.

## Future Closeout Relationship

Phase 26K should add a closeout coordinator that packages:

- final phase status,
- accepted warnings,
- unresolved blockers,
- memory proposal review status,
- next phase readiness,
- archive/report summary.

26J should only decide the next step, not close out the whole loop.

## Phase 26J-I Contract Mapping

Phase 26J-I maps this model to:

- `coordinateNextAutopilotAction(...)`,
- `decideNextPhaseFromValidation(...)`,
- `classifyPhaseAlert(...)`,
- `recommendModelForNextPhase(...)`,
- `buildHumanFacingPhaseResponse(...)`.

Each helper accepts caller-supplied metadata. None of them run commands,
inspect files, read environment values, call networks, mutate memory, or change
repository state.
