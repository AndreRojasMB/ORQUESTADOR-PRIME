# PM/SOLID Integration Boundaries

Phase: 120B - PM + SOLID INTEGRATION REVIEW PLAN

Status: planning / boundary definition / docs-only

## Boundary Statement

The PM/SOLID integration layer is a planned metadata bridge between PM Core,
Architecture Quality Core, report envelopes, and Autopilot support context.

It is not an execution layer, source analyzer, runtime bridge, dashboard
adapter, provider adapter, database adapter, release lane, or approval engine.

## Allowed Planning Surface

Phase 120B may document:

- how PM Core consumes architecture findings as metadata,
- how architecture report envelopes can be included in PM reports,
- how SOLID validator reports can become PM risk context,
- how blocker candidates can be derived from severe architecture findings,
- how next-best-action can reference PM/SOLID review state,
- how phase closeout can include PM/SOLID evidence,
- how Autopilot support contracts can receive context.

## Denied Surface

Phase 120B and the future 120I MVP must not introduce:

- runtime execution,
- process launch from source,
- provider calls,
- OpenClaw operation,
- WhatsApp outbound behavior,
- n8n behavior,
- dashboard mutation,
- database or SQL state changes,
- deployment or release behavior,
- CI activation,
- CI configuration edits,
- package command changes,
- SARIF file emission,
- published artifact behavior,
- branch-blocking behavior,
- memory persistence,
- source-control behavior from source,
- scanner behavior,
- source-tree parsing,
- repository reading,
- automatic import detection,
- refactor execution,
- approval behavior that starts itself.

## PM Core Boundary

PM Core may receive integration metadata as:

- status report context,
- risk entries,
- blocker candidates,
- approval readiness context,
- next-best-action evidence,
- closeout evidence.

PM Core must not create live approval records, mutate project state stores, call
providers, send messages, publish reports, persist memory, or start work.

## SOLID Core Boundary

SOLID / Architecture Quality Core may provide:

- SOLID findings,
- module boundary findings,
- dependency inversion findings,
- smell findings,
- review findings,
- validator reports,
- frontend findings,
- backend findings,
- architecture report envelopes.

The architecture layer must remain report-only. It must not inspect live source
trees, collect imports, run validators by itself, or modify modules.

## Autopilot Support Boundary

Autopilot support contracts may consume PM/SOLID context for:

- handoff context,
- validation context,
- memory proposal context,
- next-action context,
- phase closeout context.

This context must not trigger handoff, validation, memory persistence,
execution, approval, commit, push, or closeout by itself.

## Report Envelope Boundary

Report envelopes may wrap PM and architecture outputs in a common shape. They
remain metadata-only and must not publish files, emit artifacts, activate CI,
start gates, or write external outputs.

## Stop Conditions

The 120I implementation should stop and require human review if:

- a proposed hook needs runtime state,
- a proposed hook needs source reading,
- a proposed hook needs provider or dashboard access,
- a proposed hook needs database or SQL access,
- a proposed hook needs CI configuration changes,
- a proposed hook needs package command changes,
- a proposed hook would apply a refactor,
- a proposed hook would persist memory or approvals.
