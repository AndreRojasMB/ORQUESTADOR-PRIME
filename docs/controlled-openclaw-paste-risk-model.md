# Controlled OpenClaw Paste Risk Model

Phase: PILOT-7B - CONTROLLED OPENCLAW PASTE BRIDGE PLAN

Status: docs-only / source-only / advisory / metadata-only

## Purpose

This document defines future risk metadata for a possible OpenClaw-assisted
prompt insertion bridge. The model is advisory and does not operate OpenClaw,
move prompt text, start Codex, or inspect a live session.

## Risk Metadata

Future risk fields:

- `riskId`
- `category`
- `description`
- `likelihood`
- `impact`
- `severity`
- `mitigation`
- `blocker`
- `rollbackHint`
- `requiredApproval`
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
- `blocks_bridge`

## Risk Categories

Required categories:

- `wrong_window_focus`
- `wrong_codex_session`
- `accidental_submit`
- `unsafe_prompt`
- `stale_prompt`
- `missing_human_approval`
- `prompt_scope_mismatch`
- `secret_exposure`
- `irreversible_action`
- `report_mismatch`

## Baseline Risk Register

| Risk category | Default severity | Mitigation | Blocker |
| --- | --- | --- | --- |
| `wrong_window_focus` | `blocks_bridge` | Require user-confirmed target and abort on uncertainty. | true |
| `wrong_codex_session` | `blocks_bridge` | Require session label and project context confirmation. | true |
| `accidental_submit` | `blocks_bridge` | Require separate pre-send approval. | true |
| `unsafe_prompt` | `blocks_bridge` | Require handoff safety and completeness checks. | true |
| `stale_prompt` | `blocks_bridge` | Verify prompt ref, label, or hash before insertion. | true |
| `missing_human_approval` | `blocks_bridge` | Default every checkpoint to review. | true |
| `prompt_scope_mismatch` | `blocks_bridge` | Compare prompt files and boundaries against approved handoff. | true |
| `secret_exposure` | `blocks_bridge` | Reject any secret-material request or report. | true |
| `irreversible_action` | `blocks_bridge` | Keep `safeToExecute` false and block action-ready language. | true |
| `report_mismatch` | `needs_review` | Route returned report to validation and closeout. | false |

## Risk Handling Rules

- Any `blocks_bridge` risk blocks the bridge.
- Any missing approval blocks.
- Any uncertain target session blocks.
- Any prompt identity mismatch blocks.
- `safeToExecute` must remain false.
- Returned report mismatch can be reviewed only if all safety gates remain clean.
- No future bridge may continue after a stop condition without human review.

## Rollback Hints

Rollback remains advisory:

- return to manual-only handoff
- discard bridge package metadata
- repair session check metadata
- repair prompt identity metadata
- request human review
- retry report validation
- freeze next-action recommendation

No rollback helper may mutate project files or external systems in this phase.

## Limitations

This risk model does not inspect live windows, monitor focus, move text, use
OpenClaw, start Codex, or persist audit records. It only defines future safety
metadata.
