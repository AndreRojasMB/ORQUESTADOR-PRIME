# PM Core Review Boundaries

Phase: 110B - PM CORE REVIEW PLAN

Status: boundary plan / docs-only

## Purpose

This document defines the safety boundaries for Phase 110I, the PM Core review
implementation phase.

The review exists to close the advisory PM Core. It must not convert any PM
module into runtime behavior, persistence, dashboard integration, provider
integration, external automation, or deployment behavior.

## Allowed Review Work

Phase 110I may:

- consolidate PM Core exports,
- add metadata-only PM sample fixtures,
- add a PM Core review document,
- add a targeted smoke script,
- correct narrow PM Core roadmap/documentation drift,
- verify TypeScript compatibility,
- verify changed-file scope,
- verify forbidden-pattern checks over changed files.

## Forbidden Work

Phase 110I must not add:

- runtime executor behavior,
- process launch,
- provider calls,
- network calls,
- environment lookup,
- filesystem reads or writes from PM source modules,
- dashboard mutation,
- OpenClaw usage,
- WhatsApp outbound behavior,
- n8n behavior,
- memory persistence,
- package or workflow changes,
- CI behavior,
- DB or SQL behavior,
- deployment behavior,
- source-control automation from source modules,
- approval execution,
- job execution,
- connector behavior,
- scaffold generation.

## Import Boundaries

PM Core source should remain locally scoped:

- PM modules may import local PM modules.
- Type-only references to Autopilot contracts should be avoided unless a
  future phase explicitly needs them.
- PM modules must not import live-adjacent runtime, dashboard, action, job,
  connector, provider, scaffold, automation, credential, release, DB, SQL, or
  deployment surfaces.

## Fixture Boundaries

If `src/pm/sampleFixtures.ts` is added in 110I, fixtures must be:

- static metadata objects,
- source-only,
- advisory-only,
- no-execution,
- safe summaries only,
- free of raw logs, secrets, credentials, provider output, webhook data, or
  production data.

Fixtures must not read files, create stores, query dashboards, call providers,
or represent live runtime state.

## Smoke Test Boundaries

If `scripts/pm-core-review-tests.ts` is added, it should:

- import PM source modules,
- construct in-memory metadata,
- assert source-only flags and representative results,
- avoid package changes,
- avoid external calls,
- avoid writing artifacts into the repo.

If compiled smoke output is needed, it should be outside the repo.

## Documentation Boundaries

Documentation may describe future integrations only as deferred work. It must
not claim readiness for production, autonomous operation, security compliance,
deployment, provider operation, dashboard operation, or runtime operation.

## Dirty File Boundary

Existing dirty Viernes/dashboard/package files are unrelated to PM Core review.
Phase 110I must not stage or normalize them.

If those files appear in `git status`, they should be reported as preexisting
out-of-scope work and left untouched.

## Stop Conditions

Phase 110I should stop and request review if:

- forbidden files are staged,
- live-adjacent source files are modified,
- TypeScript fails for a PM Core change,
- smoke tests fail,
- forbidden-pattern review finds new behavior in changed files,
- package or workflow changes become necessary,
- the intended fix would require runtime or persistence wiring.
