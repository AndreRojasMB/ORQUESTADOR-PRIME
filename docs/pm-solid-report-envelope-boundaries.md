# PM/SOLID Report Envelope Boundaries

Phase: 119B - PM/SOLID REPORT ENVELOPES PLAN

Status: planning / audit / scope

## Boundary Statement

PM/SOLID report envelopes are planned as metadata contracts. They should make
PM and Architecture/SOLID report outputs easier to compare, summarize, and
prepare for future local or CI-compatible formatting.

They are not CI jobs, not output writers, not runtime code, not approval
systems, not source analyzers, and not report publishers.

## Allowed Planning Surface

Phase 119B may define:

- shared report envelope fields,
- PM report envelope fields,
- Architecture/SOLID report envelope fields,
- shared status and severity values,
- CI-compatible metadata posture,
- SARIF-ready metadata posture,
- future local/stdout report strategy,
- future Phase 119I implementation scope.

## Denied Planning Surface

Phase 119B and the future 119I MVP must not introduce:

- CI activation,
- CI configuration edits,
- hosted action configuration edits,
- package command changes,
- CI blocking behavior,
- SARIF file emission,
- report artifact publication,
- filesystem writes from source,
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

## Envelope Source Boundary

The shared envelope should accept caller-supplied PM and Architecture/SOLID
metadata. It should not build reports by reading files, calling validators, or
discovering source structure.

## PM Boundary

PM envelopes may reference:

- PM status reports,
- PM phase and milestone reports,
- blocker reports,
- risk reports,
- approval readiness reports,
- next-action reports,
- roadmap return reports.

They must not approve work, resolve blockers, update milestones, continue
phases, persist report history, or trigger next actions.

## Architecture Boundary

Architecture envelopes may reference:

- SOLID findings,
- module boundary findings,
- Dependency Inversion findings,
- architecture smell findings,
- review checklist findings,
- validator summaries,
- frontend responsibility findings,
- backend layering findings.

They must not run scanners, parse source trees, inspect repositories, discover
imports, self-start validators, or execute refactors.

## CI-Compatible Boundary

The contract may describe fields that a later CI-compatible adapter could use:

- stable schema version,
- report kind,
- status,
- severity,
- evidence references,
- limitations,
- risk and approval metadata,
- SARIF-ready metadata.

This is compatibility only. It must not add CI configuration, enable branch
blocking, publish artifacts, emit SARIF files, or change package commands.

## Stdout and Local Output Boundary

Future phases may add local or stdout formatters. Phase 119B does not add
formatters. Phase 119I should only add source-only envelope helpers unless a
future prompt explicitly approves bounded output behavior.

## PM and Autopilot Boundary

Report envelopes may be passed as context to PM and Autopilot coordinators.
They must not start handoff, validation, next-action coordination, closeout,
approval, memory writes, commits, pushes, runtime execution, or provider calls.

## Stop Conditions

Any future report envelope work should stop and require human review if it
would:

- edit CI configuration,
- change package metadata,
- emit files from source,
- publish artifacts,
- activate branch blocking,
- call providers,
- mutate dashboards,
- change database or SQL state,
- inspect source trees automatically,
- execute refactors,
- touch secrets,
- alter runtime wiring.
