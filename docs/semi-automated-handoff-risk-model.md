# Semi-Automated Handoff Risk Model

Phase: PILOT-6B - SEMI-AUTOMATED HANDOFF SAFETY PLAN

Status: docs-only / source-only / advisory / metadata-only

## Purpose

This document defines the risk metadata required before any future
semi-automated handoff capability can be considered. The model is passive. It
does not operate tools, move prompts, call providers, or alter project files.

## Risk Metadata

Future risk records should include:

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

Allowed likelihood values:

- `rare`
- `possible`
- `likely`

Allowed impact values:

- `low`
- `medium`
- `high`
- `critical`

Allowed severity values:

- `monitor`
- `needs_review`
- `blocks_handoff`

## Risk Categories

Required categories:

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

## Baseline Risk Register

| Risk category | Default severity | Mitigation | Blocker |
| --- | --- | --- | --- |
| `accidental_paste` | `blocks_handoff` | Require manual-only flow until insertion controls exist. | true |
| `wrong_codex_session` | `blocks_handoff` | Require target-session evidence in future bridge phases. | true |
| `unsafe_prompt` | `blocks_handoff` | Run safety and completeness gates before copy approval. | true |
| `missing_human_approval` | `blocks_handoff` | Default all checkpoints to deny or review. | true |
| `forbidden_file_scope` | `blocks_handoff` | Validate allowed and forbidden files before handoff. | true |
| `secrets_exposure` | `blocks_handoff` | Reject prompts or reports containing secret-material requests. | true |
| `runtime_execution` | `blocks_handoff` | Keep runtime actions out of this phase and future-gate them. | true |
| `provider_mutation` | `blocks_handoff` | Reject provider activity unless a future provider-specific plan exists. | true |
| `database_mutation` | `blocks_handoff` | Reject DB/SQL changes in handoff safety phases. | true |
| `dashboard_mutation` | `blocks_handoff` | Reject dashboard changes in handoff safety phases. | true |
| `package_workflow_mutation` | `blocks_handoff` | Reject package and workflow changes without explicit phase scope. | true |
| `report_mismatch` | `needs_review` | Send to report validation and closeout review. | false |

## Risk Handling Rules

- Any `blocks_handoff` risk should set the safety state to `blocked`.
- Any missing human approval should block regardless of other passing gates.
- Any future automation level above `manual_only` should block in PILOT-6B.
- Report mismatches can be mild alerts only when scope, safety, and forbidden
  surfaces remain clean.
- Secret-material exposure always blocks and requires human review.
- Runtime, provider, DB, dashboard, package, workflow, and network requests
  always block in this phase.

## Rollback Hints

Rollback metadata should stay advisory and scoped:

- return to `manual_only`
- discard unsafe prompt draft metadata
- regenerate safety checklist
- request human review
- repair allowed and forbidden file scope
- retry report validation
- freeze next-action recommendation

No rollback helper is allowed to perform project mutations in this phase.

## Limitations

The risk model does not inspect live sessions, control UI state, operate
providers, write files, or persist audit records. It only defines future
metadata and decision rules.
