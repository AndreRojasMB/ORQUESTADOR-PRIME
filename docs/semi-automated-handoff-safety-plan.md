# Semi-Automated Handoff Safety Plan

Phase: PILOT-6B - SEMI-AUTOMATED HANDOFF SAFETY PLAN

Status: docs-only / source-only / advisory / metadata-only

## Purpose

This phase plans the safety layer that must exist before any future assisted
handoff behavior is considered. It does not add source implementation, does not
operate a live session, and does not move prompts or reports between tools.

The plan extends the current passive chain:

```text
Conversational Build Loop dry-run
-> Human-Approved Codex Handoff
-> Manual Codex Handoff Trial
-> report validation
-> next-action recommendation
-> phase closeout
```

PILOT-6B defines the required risk model, safety gates, approval checkpoints,
automation levels, abort states, and audit metadata for a future
semi-automated handoff layer.

## Scope

The planned safety layer covers:

- assisted review of copy-ready prompt metadata
- human approval before copy
- human approval before prompt insertion
- human approval before any Codex run in a later phase
- possible future system copy-buffer helper
- possible future OpenClaw-assisted prompt insertion
- possible future Codex UI handoff
- report return handling
- abort and rollback states
- audit metadata for approvals, blocks, and decisions

Only `manual_only` is allowed in the current roadmap state. All other levels are
future-gated and blocked until a later phase creates separate approval,
verification, and operational controls.

## Automation Level Model

Future metadata:

- `automationLevelId`
- `levelName`
- `description`
- `allowedActions`
- `forbiddenActions`
- `humanApprovalRequired`
- `riskLevel`
- `requiredEvidence`
- `limitations`

Required levels:

- `manual_only`
- `copy_assisted_future`
- `paste_assisted_future`
- `execute_assisted_future`
- `blocked`

Current posture:

| Level | Current status | Summary |
| --- | --- | --- |
| `manual_only` | allowed | Human reviews, copies, runs, and returns reports manually. |
| `copy_assisted_future` | blocked | Reserved for a later helper that may prepare copy text after explicit approval. |
| `paste_assisted_future` | blocked | Reserved for a later controlled UI insertion bridge with separate human approval. |
| `execute_assisted_future` | blocked | Reserved for a later controlled run model with separate safety design. |
| `blocked` | allowed as state | Used when any gate or approval fails. |

## Safety Gate Model

Future metadata:

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

Gate categories:

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

Blocking gates must force `blocked` or `needs_human_review` and must not produce
an action-capable handoff.

## Risk Model

Future metadata:

- `riskId`
- `riskCategory`
- `description`
- `likelihood`
- `impact`
- `severity`
- `mitigation`
- `blocker`
- `requiredApproval`
- `rollbackHint`
- `limitations`

Risk categories:

- `accidental_paste`
- `wrong_codex_session`
- `unsafe_prompt`
- `missing_human_approval`
- `forbidden_file_scope`
- `secrets_exposure`
- `runtime_execution`
- `provider_mutation`
- `database_mutation`
- `dashboard_mutation`
- `package_workflow_mutation`
- `report_mismatch`

## Approval Checkpoint Model

Future metadata:

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

Default decision is always `deny` or `needs_review` unless the human reviewer
explicitly approves the checkpoint.

## Abort And Rollback Model

Future metadata:

- `abortReason`
- `triggeredByGate`
- `userVisibleMessage`
- `safeNextAction`
- `rollbackNeeded`
- `rollbackScope`
- `auditRequired`
- `limitations`

Abort states should preserve the last safe metadata package, surface a human
readable reason, and recommend one safe next action such as reviewing scope,
repairing prompt boundaries, or returning to manual-only handling.

## Safety Boundaries

This phase remains:

- source-only
- advisory-only
- metadata-only
- no system copy-buffer automation
- no automated prompt insertion
- no Codex invocation
- no OpenClaw operation
- no WhatsApp outbound
- no provider calls
- no source-stage file writes
- no package or workflow changes
- no DB/SQL
- no dashboard mutation
- no network/API calls
- no secret or environment access
- no memory persistence
- no source-control behavior from source

## Integration

The planned layer consumes:

- Manual Codex Handoff Trial metadata for manual-copy evidence and report shape
- Human-Approved Codex Handoff metadata for approval status and prompt checks
- Conversational Build Loop dry-run metadata for artifact chain and prompt draft
- Codex Handoff Runner metadata for prompt envelope shape
- report validation metadata for scope, command, grep, and commit/push posture
- next-action coordinator metadata for phase recommendation
- phase closeout metadata for local-only, pushed, blocked, or review statuses
- future approval/audit metadata for checkpoint decisions

## Future PILOT-6I Scope

Safe implementation scope:

- create `src/autopilot/semiAutomatedHandoffSafety.ts`
- create `src/autopilot/semiAutomatedHandoffFixtures.ts`
- update `src/autopilot/index.ts`
- create `docs/semi-automated-handoff-safety.md`
- optional `scripts/semi-automated-handoff-safety-tests.ts`

Future PILOT-6I must remain metadata-only:

- no runtime action
- no system copy-buffer helper
- no OpenClaw operation
- no Codex invocation
- no external actions

## Future After PILOT-6I

Recommended next phase depends on safety result:

- `PILOT-7B - CONTROLLED OPENCLAW PASTE BRIDGE PLAN`
- or `Phase 141B - ROADMAP CONTINUATION PLAN`
