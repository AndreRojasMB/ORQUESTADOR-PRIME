# Autopilot Dry-Run Hardening Plan

Phase: PILOT-2B - AUTOPILOT DRY-RUN HARDENING PLAN

Status: planning / audit / docs-only

## Purpose

This document plans the hardening pass for the Autopilot dry-run introduced in
PILOT-1I.

PILOT-2 should make the dry-run more realistic and more useful before any
future execution-capable pilot is considered. It should expand the single happy
path into a matrix of controlled metadata scenarios, quality gates, and
expected coordinator outcomes.

PILOT-2B does not implement hardening. It does not add source code, change
package scripts, activate CI, call providers, mutate dashboard state, persist
memory, or change source-control state.

## Hardening Objective

The hardening objective is to prove that the Autopilot loop behaves
conservatively across success, warning, failure, and blocked metadata cases.

The future implementation should improve:

- multiple dry-run scenarios,
- failure scenarios,
- blocked phase scenarios,
- dirty and staged file scenarios,
- missing commit/push scenarios,
- prompt quality validation,
- memory proposal review,
- next-action reliability,
- closeout reliability,
- human-facing response consistency,
- safety boundary enforcement.

## Current Baseline

PILOT-1I implemented a controlled happy path:

- B-mode sample phase,
- clean report validation,
- proposal-only memory output,
- next action `continue_to_I_phase`,
- closeout `completed_local_only`,
- human-facing skeleton present,
- prompt draft as metadata only,
- success status `passed`.

That baseline is useful but narrow. PILOT-2 should keep the same source-only
posture while checking more edge conditions.

## Proposed Scenario Families

Recommended scenario families:

- happy path B to I,
- happy path I to next B,
- implementation missing commit/push,
- dirty files outside scope but unstaged,
- dirty files outside scope and staged,
- forbidden files modified,
- failed typecheck metadata,
- failed smoke metadata,
- forbidden grep failure,
- memory proposal still requiring review,
- closeout blocked,
- prompt draft missing required sections.

Each scenario should be a static fixture or caller-supplied metadata object. No
scenario should collect live evidence from the workspace.

## Expected Output Contract

Each hardened scenario should define expected values for:

- validation status,
- memory proposal status,
- next action,
- closeout status,
- alert level,
- human-facing response,
- recommended next phase,
- handoff allowed,
- human review required,
- prompt draft availability,
- success/failure status.

## Future PILOT-2I Scope

The future implementation may add:

- optional `src/autopilot/dryRunScenarioMatrix.ts`,
- optional `src/autopilot/dryRunQualityGates.ts`,
- optional updates to `src/autopilot/realDryRunFixtures.ts`,
- optional updates to `src/autopilot/realDryRunPilot.ts`,
- optional `scripts/autopilot-dry-run-hardening-tests.ts`,
- `docs/autopilot-dry-run-hardening.md`.

The implementation should remain pure and metadata-only. It should not add
runtime wiring, package changes, workflow changes, provider adapters, dashboard
routes, DB/SQL work, memory storage, or source-control mutation from source.

## Roadmap Relationship

Phase 121B mobile planning remains local and untracked. PILOT-2B does not
cancel the 121-140 roadmap.

After PILOT-2I:

- return to Phase 121I if hardening closes cleanly, or
- plan Phase PILOT-3B only if the hardening matrix exposes unresolved safety or
  coordination gaps.
