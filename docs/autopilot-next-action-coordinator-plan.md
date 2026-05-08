# Autopilot Next-Action Coordinator Plan

Phase: 26J-B - AUTOPILOT NEXT-ACTION COORDINATOR PLAN

Status: planning / audit / docs-only

## Purpose

This document plans the future Autopilot Next-Action Coordinator for
ORQUESTADOR-PRIME / Viernes.

The coordinator will decide the next safe step after Codex report validation,
validation summary generation, memory proposal generation, error-learning rule
derivation, and current phase state review.

Phase 26J-B does not implement the coordinator. It does not activate runtime
execution, Codex execution, process launch, OpenClaw usage, WhatsApp outbound,
n8n usage, dashboard mutation, provider calls, memory persistence, deploy, DB
or SQL mutation, package/workflow changes, or git operation automation.

## Current Context

Phase 26I-I added source-only validation and memory proposal helpers:

- `validateCodexReportAgainstHandoff(...)`,
- `summarizeAutopilotValidation(...)`,
- `recommendPostValidationAction(...)`,
- `createMemoryUpdateProposalFromReport(...)`,
- `deriveErrorLearningRules(...)`.

The next coordinator should consume those metadata outputs and produce one
human-facing decision package.

## Coordinator Inputs

The future coordinator should accept caller-provided metadata only:

- `CodexReportContract`,
- `AutopilotValidationReportContract`,
- validation summary,
- memory proposal,
- error learning rules,
- current phase,
- expected next phase,
- risk level,
- approval status,
- dirty files status,
- commit/push status,
- blocked reasons,
- previous phase mode,
- current phase mode,
- expected branch,
- recommended model preference,
- whether a handoff prompt is allowed.

The coordinator must not inspect the repository, read environment values, call
providers, or launch tools. All evidence should be supplied by the caller.

## Coordinator Outputs

The future coordinator should return:

- `nextAction`,
- `nextPhase`,
- `reason`,
- `riskLevel`,
- `requiredApproval`,
- `recommendedModel`,
- `promptNeeded`,
- `handoffAllowed`,
- `memoryProposalStatus`,
- blocker summary,
- alert level,
- human-facing prompt seed,
- source-only safety boundary metadata.

## Allowed Next Actions

Allowed next-action values:

- `continue_next_phase`,
- `continue_to_I_phase`,
- `continue_to_next_B_phase`,
- `retry_phase`,
- `request_human_review`,
- `freeze_scope`,
- `rollback_plan`,
- `blocked`,
- `closeout_required`.

These values are advisory metadata. They do not start work by themselves.

## Decision Rules

Recommended rules:

- If the previous phase was `B` and validation is clean, recommend the matching
  `I` phase.
- If the previous phase was `I`, validation is clean, and commit/push metadata
  is complete, recommend the next `B` phase.
- If an implementation phase is missing commit or push metadata, mark the
  result as `needs_review`.
- If unrelated dirty files exist but are not staged, raise `Alerta leve` while
  allowing continuation.
- If forbidden files were modified, return `blocked`.
- If provider writes, OpenClaw usage, dashboard mutation, deployment, DB/SQL
  mutation, or unexpected runtime behavior appear, return `blocked`.
- If typecheck or expected tests failed, recommend `retry_phase` or
  `request_human_review` depending on risk and evidence completeness.
- If the memory proposal still requires approval, do not persist memory.
- If a critical action is requested, remain in planning-only mode.
- If the report recommends a phase that does not match the roadmap sequence,
  return `needs_review`.
- If validation is passed but warnings exist, recommend human review or the next
  planning phase, not an implementation jump.

## Phase Mode Mapping

The coordinator should infer phase flow from mode metadata:

- `B` phase clean -> matching `I` phase.
- `I` phase clean -> next `B` phase.
- `B` phase with incomplete evidence -> request review.
- `I` phase with incomplete verification -> retry or review.
- blocked phase -> stop and create a new plan.

## Human-Facing Output Format

The coordinator must preserve this structure:

1. `Alerta`
2. `Siguiente fase`
3. `Modelo recomendado`
4. `Prompt listo para Codex`

The prompt should be generated only as text metadata. It should not invoke
Codex or create work automatically.

## Integration With Existing Autopilot Modules

The future implementation should reuse:

- `CodexReportContract` from `src/autopilot/reportContract.ts`,
- validation status from `src/autopilot/reportValidator.ts`,
- summary counts from `src/autopilot/autopilotValidationSummary.ts`,
- memory proposal status from `src/autopilot/memoryProposalBuilder.ts`,
- learning rule metadata from `src/autopilot/errorLearningRules.ts`,
- handoff package metadata from `src/autopilot/codexHandoffRunner.ts`,
- risk boundaries from `src/autopilot/riskBoundaries.ts`.

It may align vocabulary with `src/pm/nextBestAction.ts`,
`src/pm/approvalTypes.ts`, and `src/pm/autonomyPolicy.ts`, but it should not
import runtime or live-adjacent surfaces.

## Non-Goals

The coordinator MVP should not:

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
- approve itself.

## Verification Plan For 26J-I

Recommended checks for the future implementation phase:

- `git status --short --branch`,
- `node node_modules/typescript/bin/tsc --noEmit`,
- Windows Node fallback when WSL Node is unavailable,
- targeted coordinator smoke tests,
- `git diff --check`,
- `git diff --cached --check`,
- scope check over changed files only,
- forbidden grep over coordinator source and docs.

## Future Implementation Split

Recommended continuation:

- Phase 26J-I - AUTOPILOT NEXT-ACTION COORDINATOR MVP
- Phase 26K-B - AUTOPILOT PHASE CLOSEOUT COORDINATOR PLAN
- Phase 26K-I - AUTOPILOT PHASE CLOSEOUT COORDINATOR MVP

## Phase 26J-I Implementation Note

Phase 26J-I implements this plan as source-only TypeScript metadata helpers:

- coordinator decision model,
- alert classification,
- next-action decision,
- next-phase recommendation,
- model recommendation,
- human-facing response skeleton.

The implementation remains metadata-only. It does not read the workspace, run
commands, invoke services, persist memory, mutate git state, or start a runtime
loop.
