# Autopilot Real Dry-Run

Phase: PILOT-1I - AUTOPILOT REAL DRY-RUN IMPLEMENTATION

Status: implemented / source-only / metadata-only

## Purpose

PILOT-1I adds a controlled Autopilot dry-run that exercises the full master
loop with static fixtures and caller-supplied metadata.

The dry-run proves that ORQUESTADOR-PRIME / Viernes can move through:

```text
simulated phase report -> handoff package -> report validation
-> memory proposal -> learning rules -> next-action coordination
-> phase closeout -> human-facing response -> prompt draft
```

The pilot does not invoke Codex, start tools, call providers, persist memory,
mutate dashboard state, or change source-control state from source.

## Implemented Source Files

- `src/autopilot/realDryRunFixtures.ts`
- `src/autopilot/realDryRunPilot.ts`
- `scripts/autopilot-real-dry-run-tests.ts`

Exports are added through `src/autopilot/index.ts`.

## Dry-Run Input

The dry-run input is metadata only:

- simulated task metadata,
- simulated `CodexHandoffContract`,
- simulated `CodexReportContract`,
- simulated dirty and staged file status,
- simulated commit and push status,
- simulated risk and approval status,
- expected next phase metadata,
- roadmap target metadata,
- limitation notes.

No evidence is collected by the dry-run itself. The caller or fixture provides
all metadata.

## Stages

`runAutopilotRealDryRun(...)` performs these pure stages:

1. prepares the Codex handoff package,
2. validates the simulated report against the simulated handoff,
3. summarizes validation metadata,
4. creates a proposal-only memory update,
5. derives error-learning rule proposals,
6. coordinates the next advisory action,
7. coordinates phase closeout,
8. builds a prompt draft string,
9. evaluates pass/fail status for the pilot result.

Each stage returns structured metadata. None of the stages reads files,
writes files, reads environment values, uses network calls, starts tools, calls
providers, writes memory, or mutates dashboard/source-control state.

## Output

The dry-run output includes:

- `handoffPackage`,
- `validation`,
- `validationSummary`,
- `memoryProposal`,
- `learningRules`,
- `nextActionRecommendation`,
- `closeoutResult`,
- `closeoutStatus`,
- `humanFacingResponseSkeleton`,
- `nextCodexPromptDraft`,
- `successStatus`,
- `limitations`,
- source-only safety flags.

## Success Criteria

The default pilot fixture should pass when:

- handoff package metadata exists,
- validation status is `passed`,
- validation summary exists,
- memory proposal status is `proposed`,
- learning rule metadata exists,
- next action is `continue_to_I_phase`,
- closeout status is `completed_local_only`,
- human-facing response contains the four required sections,
- prompt draft is a string-only metadata object,
- all safety flags deny external action.

## Boundaries

The implementation remains:

- source-only,
- metadata-only,
- dry-run only,
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

## Limitations

This pilot uses controlled fixtures. It does not inspect the live workspace,
discover imports, validate real command output, apply memory, publish reports,
or perform source analysis.

Real-world use still requires human review and a separate approved phase before
any execution-capable behavior can be considered.

## Relationship To Phase 121B

Phase 121B mobile planning remains local work and is not cancelled by this
pilot. The mobile docs stay outside PILOT-1I staging scope.

## Next Step

If PILOT-1I closes cleanly, return to:

- Phase 121I - MOBILE APP FACTORY STRATEGY IMPLEMENTATION

If the pilot exposes unresolved coordination or safety gaps, plan:

- Phase PILOT-2B - AUTOPILOT DRY-RUN HARDENING PLAN
