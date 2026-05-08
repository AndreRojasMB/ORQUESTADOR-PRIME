# Codex Handoff Runner MVP

Phase: 26H-I - CODEX HANDOFF RUNNER MVP

Status: source-only prompt/report/checklist renderer

## Purpose

Phase 26H-I adds a source-only Codex Handoff Runner MVP. The runner prepares
handoff metadata for a human to review. It does not launch Codex, automate a
terminal, call providers, run desktop automation, send WhatsApp messages, call
n8n, mutate dashboard state, write memory, deploy, or automate git operations.

## Source Files

The MVP adds:

- `src/autopilot/codexPromptRenderer.ts`
- `src/autopilot/codexReportSchema.ts`
- `src/autopilot/handoffValidationChecklist.ts`
- `src/autopilot/codexHandoffRunner.ts`

It also exports those helpers from `src/autopilot/index.ts`.

## Implemented Helpers

The MVP provides:

- `renderCodexPromptFromHandoff(...)`
- `renderExpectedCodexReportSchema(...)`
- `createHandoffValidationChecklist(...)`
- `prepareCodexHandoffPackage(...)`

All helpers are pure. They accept caller-provided metadata and return strings
or structured metadata. They do not read files, write files, inspect runtime
state, access secrets, use network calls, or launch tools.

## Handoff Package

The handoff package includes:

- `promptMarkdown`
- `handoffMetadata`
- `expectedReportSchema`
- `validationChecklist`
- `nextStageRecommendation`

The package is a metadata object. It is not an execution request by itself.

## Safety Boundary

The MVP keeps these boundaries:

- source only,
- metadata only,
- no Codex invocation,
- no process launching,
- no provider sends,
- no desktop automation,
- no dashboard mutation,
- no secrets or environment access,
- no network calls,
- no memory write,
- no DB or SQL mutation,
- no deploy,
- no git automation,
- human approval before use.

## Next Phase

Recommended next phase:

- Phase 26I-B - AUTOPILOT VALIDATION AND MEMORY PLAN
