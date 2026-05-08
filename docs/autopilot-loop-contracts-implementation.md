# Autopilot Loop Contracts Implementation

Phase: 26G-I - AUTOPILOT LOOP CONTRACTS IMPLEMENTATION

Status: source-only contracts

## Purpose

Phase 26G-I adds TypeScript contracts for the first ORQUESTADOR-PRIME /
Viernes autopilot loop foundation. These contracts represent task metadata,
state transitions, Codex handoff metadata, Codex report metadata, validation
metadata, memory update proposals, and next-action recommendations.

This phase does not implement a runtime executor. It does not launch Codex,
call OpenClaw, send WhatsApp messages, trigger n8n workflows, mutate dashboard
state, call providers, read secrets, write memory, deploy, or perform git
operations from source code.

## Source Files

The source-only module lives under `src/autopilot/`:

- `types.ts`
- `riskBoundaries.ts`
- `taskState.ts`
- `codexHandoff.ts`
- `reportContract.ts`
- `validationContract.ts`
- `memoryUpdateContract.ts`
- `nextAutopilotAction.ts`
- `sampleFixtures.ts`
- `index.ts`

## Contracts

The implementation defines:

- task states,
- loop stages,
- risk/autonomy levels,
- source-only boundary flags,
- Codex handoff draft contract,
- Codex report contract,
- validation report contract,
- memory update proposal contract,
- next autopilot action recommendation contract.

## Helper Functions

The helper functions are pure metadata helpers:

- `validateTaskStateTransition(...)`
- `createCodexHandoffDraft(...)`
- `summarizeValidationStatus(...)`
- `createMemoryUpdateProposal(...)`
- `recommendNextAutopilotAction(...)`

They do not read files, write files, read environment variables, call the
network, call providers, invoke Codex, invoke OpenClaw, call WhatsApp, call n8n,
mutate dashboard state, mutate memory, mutate databases, deploy, or perform git
operations.

## MVP Boundary

The first MVP remains:

- advisory only,
- source only,
- metadata only,
- human approval gated,
- no runtime executor,
- no autonomous task execution.

Future phases may build a handoff runner or validation runner, but those phases
must remain default-off and separately approved.

## Next Phase

Recommended next phase:

- Phase 26H-B - CODEX HANDOFF RUNNER PLAN
