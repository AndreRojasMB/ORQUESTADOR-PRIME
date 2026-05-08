# Autopilot Dry-Run Hardening

Phase: PILOT-2I - AUTOPILOT DRY-RUN HARDENING IMPLEMENTATION

Status: implemented / source-only / metadata-only

## Purpose

PILOT-2I hardens the Autopilot dry-run introduced in PILOT-1I by adding a
metadata-only scenario matrix and quality gates.

The hardening layer tests happy paths, warning paths, failed metadata, blocked
scope, incomplete prompt output, memory proposal safety, next-action
consistency, and closeout consistency without taking real action.

## Implemented Source Files

- `src/autopilot/dryRunScenarioMatrix.ts`
- `src/autopilot/dryRunQualityGates.ts`
- `scripts/autopilot-dry-run-hardening-tests.ts`

Exports are added through `src/autopilot/index.ts`.

## Scenario Matrix

The matrix includes:

- happy path B to I,
- happy path I to next B,
- implementation missing commit/push,
- dirty files outside scope unstaged,
- dirty files outside scope staged,
- forbidden files modified,
- failed typecheck metadata,
- failed smoke tests metadata,
- forbidden grep failure metadata,
- memory proposal requires approval,
- closeout blocked,
- prompt draft missing required sections.

Each scenario is static metadata. It does not inspect the workspace or collect
live evidence.

## Quality Gates

Implemented gates:

- prompt completeness gate,
- report completeness gate,
- validation consistency gate,
- memory proposal safety gate,
- next-action consistency gate,
- closeout consistency gate,
- scope safety gate,
- forbidden action gate.

Each gate returns status, message, evidence refs, risk, human-review
requirement, and recommended action as metadata only.

## Expected Outputs

Hardening summary includes:

- scenario results,
- passed count,
- warning count,
- failed count,
- blocked count,
- recommended next step,
- whether it is safe to return to Phase 121I after human review.

Expected blocked scenarios are kept as blocked metadata. They do not indicate
that real unsafe behavior happened.

## Safety Boundaries

The implementation remains:

- source-only,
- metadata-only,
- report-only,
- advisory-only,
- no Codex invocation,
- no OpenClaw operation,
- no WhatsApp outbound,
- no n8n behavior,
- no provider calls,
- no dashboard mutation,
- no package or workflow changes,
- no CI activation,
- no DB/SQL or release-surface behavior,
- no memory persistence,
- no source-control mutation from source.

## Relationship To 121B And 121I

Phase 121B mobile planning remains local and untracked. PILOT-2I does not
cancel the 121-140 roadmap.

Because hardening is metadata-only and expected blocked scenarios remain
controlled, the recommended return path is:

- Phase 121I - MOBILE APP FACTORY STRATEGY IMPLEMENTATION

If future reviewers want a stricter pilot before returning, the next optional
phase would be:

- Phase PILOT-3B - AUTOPILOT CONTROLLED EXECUTION READINESS PLAN
