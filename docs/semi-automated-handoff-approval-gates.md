# Semi-Automated Handoff Approval Gates

Phase: PILOT-6B - SEMI-AUTOMATED HANDOFF SAFETY PLAN

Status: docs-only / source-only / advisory / metadata-only

## Purpose

This document defines the gate and checkpoint metadata needed before any future
semi-automated handoff step is considered. Gates are passive planning objects.
They do not move prompt text, operate external systems, or mutate repository
state.

## Safety Gate Model

Future gate fields:

- `gateId`
- `gateName`
- `category`
- `requiredCondition`
- `currentStatus`
- `blocking`
- `evidenceRefs`
- `requiredHumanDecision`
- `failureAction`
- `riskLevel`

Allowed statuses:

- `not_checked`
- `passed`
- `warning`
- `failed`
- `blocked`

Required categories:

- `prompt_completeness`
- `prompt_safety`
- `human_approval`
- `file_scope`
- `secrets`
- `runtime`
- `providers`
- `database`
- `dashboard`
- `package_workflow`
- `copy_buffer_future`
- `openclaw_future`
- `codex_run_future`
- `report_validation`

## Required Gates

| Gate | Required condition | Failure action |
| --- | --- | --- |
| Prompt completeness | Required prompt sections are present. | `block_handoff` |
| Prompt safety | Boundaries are explicit and unsafe wording is absent. | `block_handoff` |
| Human approval | Reviewer decision is explicit. | `needs_human_review` |
| File scope | Allowed and forbidden surfaces are declared. | `block_handoff` |
| Secrets | No secret-material access is requested or reported. | `block_handoff` |
| Runtime | No runtime operation is requested or reported. | `block_handoff` |
| Providers | No provider operation is requested or reported. | `block_handoff` |
| Database | No DB/SQL mutation is requested or reported. | `block_handoff` |
| Dashboard | No dashboard mutation is requested or reported. | `block_handoff` |
| Package/workflow | No package or workflow mutation is requested or reported. | `block_handoff` |
| Future copy buffer | Level remains future-gated unless explicitly planned later. | `block_handoff` |
| Future OpenClaw | OpenClaw-assisted handoff remains future-gated. | `block_handoff` |
| Future Codex run | Codex run assistance remains future-gated. | `block_handoff` |
| Report validation | Returned report matches expected phase, mode, and scope. | `needs_human_review` |

## Approval Checkpoint Model

Future checkpoint fields:

- `checkpointId`
- `checkpointName`
- `beforeAction`
- `requiredDecision`
- `allowedDecisions`
- `defaultDecision`
- `approver`
- `evidenceRequired`
- `riskLevel`
- `limitations`

Required checkpoints:

- `before_copy`
- `before_paste`
- `before_codex_execution`
- `before_accepting_report`
- `before_next_phase`
- `before_memory_write`
- `before_any_external_action`

Allowed decisions:

- `approve`
- `reject`
- `needs_review`
- `blocked`

Default decision:

- `needs_review`

## Gate Evaluation Rules

- A blocking failed gate sets the handoff state to `blocked`.
- Missing approval sets the handoff state to `needs_human_review`.
- Any future automation level above `manual_only` blocks in this phase.
- `approved_for_copy` can never imply action-ready status.
- Report validation must run before next-action metadata is trusted.
- Phase closeout must classify local-only, review, blocked, or future phase
  recommendation separately from approval state.

## Abort And Rollback Model

Future abort fields:

- `abortReason`
- `triggeredByGate`
- `userVisibleMessage`
- `safeNextAction`
- `rollbackNeeded`
- `rollbackScope`
- `auditRequired`
- `limitations`

Abort reasons:

- `missing_required_section`
- `unsafe_prompt_boundary`
- `missing_human_decision`
- `future_level_requested`
- `forbidden_scope_requested`
- `secret_material_risk`
- `runtime_surface_requested`
- `provider_surface_requested`
- `database_surface_requested`
- `dashboard_surface_requested`
- `package_workflow_surface_requested`
- `report_validation_mismatch`

Safe next actions:

- return to manual-only handling
- request human review
- repair prompt metadata
- repair scope metadata
- retry report validation
- freeze next-action recommendation
- plan a separate future-gated phase

## Audit Metadata

Future audit records should include:

- gate results
- checkpoint decisions
- reviewer label
- evidence refs
- accepted warnings
- blocking issues
- abort reason
- recommended next action
- closeout classification

Audit records remain metadata-only and do not persist memory in this phase.
