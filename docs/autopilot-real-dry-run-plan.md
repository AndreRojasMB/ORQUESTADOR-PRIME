# Autopilot Real Dry-Run Plan

Phase: PILOT-1B - AUTOPILOT REAL DRY-RUN PLAN

Status: planning / audit / docs-only

## Purpose

This document plans the first controlled Autopilot real dry-run for
ORQUESTADOR-PRIME / Viernes.

The pilot is intended to exercise the full Autopilot review loop with
simulated metadata only:

```text
phase report -> validation -> memory proposal -> next-action coordinator
-> closeout coordinator -> prompt draft -> no Codex invocation
```

PILOT-1B does not implement the dry-run. It creates the plan, boundaries,
scenario, and success criteria for a later implementation phase.

## Dry-Run Objective

The dry-run should prove that the Autopilot support layer can coordinate a
complete phase handoff and closeout cycle without taking external action.

The pilot should:

- use simulated and controlled metadata,
- render a Codex handoff package as text and metadata only,
- validate a simulated `CodexReportContract`,
- generate a memory update proposal only,
- derive error-learning rule proposals,
- coordinate the next recommended action,
- coordinate phase closeout,
- produce a human-facing response skeleton,
- produce the next prompt text as metadata only.

The pilot must not:

- invoke Codex,
- call OpenClaw,
- send WhatsApp outbound messages,
- persist memory,
- mutate source-control state,
- mutate dashboard state,
- call providers,
- activate CI,
- change package scripts,
- touch DB/SQL or release surfaces.

## Dry-Run Input

PILOT-1I should use caller-supplied or static fixture metadata only.

Recommended input bundle:

- simulated phase report,
- simulated handoff contract,
- simulated `CodexReportContract`,
- simulated dirty and staged workspace status,
- simulated commit and push metadata,
- simulated risk metadata,
- simulated approval metadata,
- simulated evidence references,
- simulated roadmap target.

No input should be collected by reading source files, checking repository state,
querying providers, reading environment values, or launching tools.

## Dry-Run Stages

Recommended stage order:

1. Load or sample input metadata.
2. Render a Codex handoff package.
3. Validate Codex report metadata.
4. Generate a memory update proposal.
5. Derive error-learning rule proposals.
6. Coordinate the next action.
7. Coordinate phase closeout.
8. Generate a human-facing response skeleton.
9. Produce the next prompt text as metadata only.

Each stage should receive explicit metadata and return explicit metadata. The
dry-run should not perform discovery, source-tree inspection, runtime checks,
external calls, persistence, or source-control mutation.

## Dry-Run Output

The pilot output should include:

- validation summary,
- memory proposal,
- error-learning rule proposals,
- next-action recommendation,
- closeout status,
- human-facing coordinator response,
- next Codex prompt draft,
- pilot success or failure status,
- limitation notes,
- safety boundary confirmation.

Output is advisory. It does not approve, start, apply, publish, persist, or
dispatch follow-up work.

## Future PILOT-1I Scope

The future implementation phase may add:

- optional `src/autopilot/realDryRunPilot.ts`,
- optional `src/autopilot/realDryRunFixtures.ts`,
- optional `scripts/autopilot-real-dry-run-tests.ts`,
- `docs/autopilot-real-dry-run.md`.

The implementation must remain source-only and report-only. It should not add
package changes, workflow changes, provider adapters, dashboard routes,
persistence targets, DB/SQL work, release work, or runtime wiring.

## Roadmap Relationship

This pilot temporarily pauses Phase 121I so the Autopilot loop can be planned
as a controlled dry-run.

It does not cancel the 121-140 roadmap. After PILOT-1I closes cleanly, the
project can return to:

- Phase 121I - MOBILE APP FACTORY STRATEGY IMPLEMENTATION

If the pilot exposes unresolved safety or coordination gaps, a separate
PILOT-2 planning phase may be considered before returning to 121I.
