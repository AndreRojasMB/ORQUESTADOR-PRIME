# Conversational Build Loop Boundaries

Status: source-only / advisory / metadata-only

## Purpose

This document defines the safety boundaries for the planned Conversational
Build Loop dry-run. The loop should turn a simple idea into planning metadata,
not into a running app, implementation task, provider action, or persisted
memory record.

## Allowed In PILOT-3B

PILOT-3B may:

- inspect Autopilot dry-run source and docs
- inspect Mobile Factory dry-run source and docs
- define future metadata models
- plan stage ordering
- plan artifact chain expectations
- plan prompt draft metadata
- plan human approval checkpoints
- run repository verification commands

## Not Allowed In PILOT-3B

PILOT-3B must not:

- implement source modules
- run the conversational loop
- invoke Codex
- use a prompt draft for work
- create app, screen, component, route, backend, or endpoint artifacts
- write project files from source-stage logic
- change package or workflow files
- activate CI
- run Expo/EAS tooling
- interact with stores
- call providers
- use network/API calls
- modify DB/SQL
- mutate dashboards
- persist memory
- perform source-control behavior from source modules
- send WhatsApp outbound messages
- run OpenClaw behavior

## Advisory Contract

The future loop must preserve:

- source-only behavior
- advisory-only decisions
- metadata-only outputs
- human approval before any handoff use
- explicit unresolved questions
- blocked status for unsafe or incomplete chains
- no runtime side effects

## Prompt Draft Boundary

The prompt draft may exist only as text metadata. It may include:

- target phase
- target mode
- project path
- branch
- context summary
- allowed files
- forbidden files
- task
- boundaries
- verification plan
- smoke plan
- final report format

It must also carry:

- `safeToUseForExecution: false`
- `requiresHumanApproval: true`

The prompt draft is not permission to start work.

## Human Approval Boundary

Human approval is required before:

- high-risk requirements are accepted
- privacy, safety, monetization, notification, analytics, release, or store
  assumptions are treated as ready
- prompt metadata is converted into a real task
- memory proposal metadata is persisted
- any implementation phase can begin

## Runtime Boundary

The future dry-run may use static fixtures and metadata helpers. It must not:

- read secret material
- call external services
- run mobile tooling
- create project artifacts
- mutate dashboards
- persist memory
- modify source-control state

## Block Conditions

The future dry-run should block when:

- a required stage is missing
- a stage hides blockers or unresolved questions
- prompt metadata lacks boundaries
- prompt metadata is marked usable without human approval
- high-risk action lacks approval
- any source-stage output claims real implementation happened

## Scope Boundary For PILOT-3I

Allowed future implementation files:

- `src/autopilot/conversationalBuildLoopDryRun.ts`
- `src/autopilot/conversationalBuildLoopFixtures.ts`
- `src/autopilot/index.ts`
- `docs/conversational-build-loop-dry-run.md`
- optional `scripts/conversational-build-loop-dry-run-tests.ts`

No package, workflow, provider, dashboard, DB/SQL, mobile app, generated
mobile, store, secret, or runtime files should change.
