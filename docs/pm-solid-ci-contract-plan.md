# PM/SOLID CI Contract Plan

Phase: 119B - PM/SOLID REPORT ENVELOPES PLAN

Status: planning / audit / scope

## Purpose

The PM/SOLID CI Contract defines future-compatible report metadata for PM and
Architecture/SOLID envelopes. The contract is intended to make reports stable
enough for later local formatting, stdout formatting, JSON serialization, and
SARIF mapping without activating CI behavior in Phase 119B.

## Contract Posture

The contract is:

- source-only,
- report-only,
- advisory-only,
- metadata-only,
- compatible with future CI adapters,
- compatible with future SARIF mapping,
- not an active CI integration,
- not an output writer,
- not an enforcement gate.

## Shared Metadata

Future envelope metadata should include:

- stable `schemaVersion`,
- `reportKind`,
- `source`,
- `phaseRef`,
- `status`,
- `severity`,
- `riskLevel`,
- `approvalRequired`,
- `findings`,
- `evidenceRefs`,
- `limitations`,
- `recommendedNextAction`,
- `ciCompatibility`,
- `sarifReadyMetadata`.

## CI Compatibility Metadata

Future `ciCompatibility` metadata should describe:

- whether the envelope is intended for human review,
- whether the envelope is eligible for future local formatting,
- whether the envelope is eligible for future JSON serialization,
- whether the envelope is eligible for future SARIF mapping,
- whether the envelope is advisory-only,
- whether the envelope has no branch-blocking behavior,
- whether the envelope has no output publication behavior.

## SARIF-Ready Metadata

Future `sarifReadyMetadata` should describe:

- stable rule id mapping,
- finding id mapping,
- severity mapping,
- result message summary,
- evidence reference mapping,
- limitation mapping,
- advisory-only posture,
- no file output in this phase.

The metadata should not imply SARIF file emission. File output remains deferred
until a future phase explicitly approves it.

## Status and Severity Mapping

Statuses:

- `passed`
- `warning`
- `failed`
- `needs_review`
- `blocked`
- `insufficient_evidence`

Severities:

- `info`
- `low`
- `medium`
- `high`
- `critical`

Suggested future mapping:

- `passed` with `info` or `low`: advisory success.
- `warning` with `medium`: review recommended.
- `failed` with `high`: human review required.
- `blocked` with `critical`: stop and escalate.
- `insufficient_evidence`: collect more caller-supplied metadata.
- `needs_review`: human review required before relying on the report.

## PM Envelope Compatibility

PM envelopes should carry:

- project state reference,
- milestone reference,
- phase reference,
- blocker metadata,
- risk metadata,
- approval metadata,
- DoD gap metadata,
- next-action metadata,
- confidence and uncertainty,
- evidence references.

These fields should support future reporting without changing PM state or
triggering approval behavior.

## Architecture Envelope Compatibility

Architecture envelopes should carry:

- architecture layer reference,
- SOLID findings,
- boundary findings,
- dependency findings,
- smell findings,
- review findings,
- validator summary,
- frontend findings,
- backend findings,
- severity counts,
- limitations,
- evidence references.

These fields should support future architecture quality reports without
running validators or reading source trees automatically.

## Explicit Non-Activation Rules

Phase 119B does not allow:

- CI activation,
- CI configuration edits,
- hosted action configuration edits,
- package command changes,
- branch-blocking behavior,
- SARIF file emission,
- report artifact publication,
- source file output from report helpers,
- runtime execution,
- process launch,
- provider calls,
- dashboard mutation,
- OpenClaw activity,
- WhatsApp outbound activity,
- n8n activity,
- memory persistence,
- source-control behavior from source,
- env or network access,
- database or SQL state changes,
- release rollout,
- scanner behavior,
- syntax-tree parsing,
- repository reading,
- automatic import detection,
- refactor execution.

## Future 119I Scope

The future implementation should be limited to:

- `src/pm/cli/report.ts`
- `src/architecture/cli/report.ts`
- `docs/pm-solid-ci-contract.md`
- optional `scripts/pm-solid-report-envelope-tests.ts`

The implementation should define pure metadata helpers only. It should not
change package metadata, CI configuration, runtime wiring, provider modules,
dashboard modules, database assets, or release behavior.

## Return Path

After Phase 119I, the next formal target should be:

- Phase 120B - PM + SOLID INTEGRATION REVIEW PLAN
