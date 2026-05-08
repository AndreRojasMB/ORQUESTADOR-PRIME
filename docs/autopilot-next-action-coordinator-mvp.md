# Autopilot Next-Action Coordinator MVP

Phase: 26J-I - AUTOPILOT NEXT-ACTION COORDINATOR MVP

Status: implemented / source-only / metadata-only

## Purpose

Phase 26J-I adds the first source-only Autopilot Next-Action Coordinator MVP
for ORQUESTADOR-PRIME / Viernes.

The coordinator consumes caller-provided report validation metadata, validation
summary metadata, memory proposal metadata, error-learning metadata, phase mode,
risk, approval, dirty file, commit, and push metadata. It returns one
human-facing next-step recommendation.

## Implemented Modules

- `src/autopilot/nextActionDecisionModel.ts`
  - defines coordinator input and output contracts,
  - defines alert levels,
  - defines supported next actions,
  - defines prompt seed and human response contracts.

- `src/autopilot/nextActionCoordinator.ts`
  - classifies alerts,
  - decides next action,
  - recommends next phase,
  - recommends model metadata,
  - keeps memory persistence disabled.

- `src/autopilot/humanFacingPhaseResponse.ts`
  - renders the required human-facing response skeleton.

## Alert Levels

Supported alert levels:

- `no_alert` -> `No hay alerta`,
- `mild_alert` -> `Alerta leve`,
- `blocking_alert` -> `Alerta bloqueante`.

## Supported Next Actions

The MVP supports:

- `continue_next_phase`,
- `continue_to_I_phase`,
- `continue_to_next_B_phase`,
- `retry_phase`,
- `request_human_review`,
- `freeze_scope`,
- `rollback_plan`,
- `blocked`,
- `closeout_required`.

## Decision Behavior

The MVP follows conservative rules:

- clean `B` phase metadata recommends the matching `I` phase,
- clean `I` phase metadata with commit/push evidence recommends the next `B`
  phase,
- missing implementation closeout evidence returns `closeout_required`,
- unrelated dirty files that remain unstaged produce `Alerta leve`,
- forbidden or staged out-of-scope files produce `Alerta bloqueante`,
- failed verification metadata recommends retry or human review,
- memory proposals remain proposal-only,
- critical risk stays planning-only.

## Human-Facing Response

The coordinator preserves this structure:

```text
1. Alerta
<label>

2. Siguiente fase
<phase and reason>

3. Modelo recomendado
<model>

4. Prompt listo para Codex
<prompt seed or unavailable message>
```

The prompt field is text metadata only.

## Safety Boundaries

The MVP does not:

- execute Codex,
- launch processes,
- read or write files,
- read environment values,
- use network calls,
- invoke OpenClaw,
- send WhatsApp messages,
- run n8n,
- mutate dashboard state,
- call providers,
- mutate git state from source,
- persist memory,
- mutate DB/SQL,
- deploy.

## Relationship To Next Phase

Phase 26K-B should plan the phase closeout coordinator. That future coordinator
should package final phase status, accepted warnings, unresolved blockers,
memory proposal review status, and next phase readiness.
