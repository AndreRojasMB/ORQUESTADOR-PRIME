# Autopilot Dry-Run Scenario Matrix

Phase: PILOT-2B - AUTOPILOT DRY-RUN HARDENING PLAN

Status: scenario matrix plan / docs-only

## Purpose

This document defines the planned scenario matrix for PILOT-2I.

The matrix expands PILOT-1I beyond a single happy path. Each scenario should be
implemented later as static metadata or caller-supplied input only.

## Scenario Output Fields

Every scenario should declare expected:

- validation status,
- memory proposal status,
- next action,
- closeout status,
- alert level,
- human-facing response presence,
- recommended next phase,
- handoff allowed,
- human review required.

## Matrix

| Scenario | Validation | Memory | Next action | Closeout | Alert | Handoff | Human review |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Happy path B to I | `passed` | `proposed` | `continue_to_I_phase` | `completed_local_only` | `no_alert` | allowed after review | required before prompt use |
| Happy path I to next B | `passed` | `proposed` | `continue_to_next_B_phase` | `closed_and_pushed` | `no_alert` | not needed | optional review |
| Implementation missing commit/push | `failed` or `needs_review` | `proposed` | `closeout_required` | `needs_commit` or `needs_push` | `mild_alert` | blocked | required |
| Dirty outside scope unstaged | `needs_review` | `proposed` | `continue_to_I_phase` or `request_human_review` | `completed_local_only` | `mild_alert` | allowed with caution | required |
| Dirty outside scope staged | `blocked` | `proposed` | `blocked` | `blocked` | `blocking_alert` | blocked | required |
| Forbidden files modified | `blocked` | `proposed` | `blocked` | `unsafe_scope` | `blocking_alert` | blocked | required |
| Failed typecheck metadata | `failed` | `proposed` | `retry_phase` | `needs_human_review` | `mild_alert` | blocked | required |
| Failed smoke metadata | `failed` | `proposed` | `retry_phase` | `needs_human_review` | `mild_alert` | blocked | required |
| Forbidden grep failure | `failed` or `blocked` | `proposed` | `request_human_review` or `blocked` | `blocked` | `blocking_alert` | blocked | required |
| Memory proposal requires approval | `passed` | `proposed` | `continue_to_I_phase` with required approval | `completed_local_only` | `mild_alert` | allowed after review | required |
| Closeout blocked | `passed` or `needs_review` | `proposed` | `request_human_review` | `blocked` | `blocking_alert` | blocked | required |
| Prompt draft missing sections | `passed` | `proposed` | `request_human_review` | `needs_human_review` | `mild_alert` | blocked | required |

## Scenario Details

### Happy Path B To I

This scenario preserves the PILOT-1I baseline. It proves that clean planning
metadata can recommend a matching implementation phase while keeping prompt use
under human review.

### Happy Path I To Next B

This scenario should simulate a completed implementation phase with commit and
push metadata supplied by the caller. It should recommend the next planning
phase without running source-control commands.

### Missing Commit/Push

This scenario should simulate implementation closeout evidence missing commit
or push metadata. It should not mark the phase closed.

### Dirty File Scenarios

Unstaged dirty files outside scope should produce a caution path when they are
known and pre-existing. Staged files outside scope should block.

### Forbidden File Scenario

Forbidden file metadata should block validation and closeout.

### Verification Failure Scenarios

Failed typecheck or smoke metadata should recommend retry or human review,
depending on risk and evidence completeness.

### Forbidden Grep Scenario

Forbidden grep failure should block or require review. Allowed matches should
require explicit documentation-only classification.

### Memory Review Scenario

Memory proposals should remain `proposed`. The scenario should fail if a
proposal claims storage or lacks human review.

### Closeout Blocked Scenario

Closeout blockers should prevent continuation even when next-action metadata
looks optimistic.

### Prompt Missing Sections Scenario

Prompt quality hardening should require the four human-facing sections. Missing
sections should block handoff and request review.

## Recommended Fixture Shape

Future scenario objects should include:

- `scenarioId`,
- `title`,
- `phaseMode`,
- `report`,
- `handoff`,
- `workspace`,
- `commitPush`,
- `riskApproval`,
- `expected`,
- `limitations`,
- `metadataOnly: true`.
