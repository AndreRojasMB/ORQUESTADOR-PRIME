# Mobile Performance Checklist Plan

Phase: 128B - MOBILE PERFORMANCE CHECKLIST PLAN

Status: planning / audit / scope only

## Purpose

Mobile Performance Checklist plans a source-only, advisory-only, metadata-only
layer for future mobile performance review in ORQUESTADOR-PRIME / Viernes. It
defines checklist, risk, and profile-readiness metadata for startup, initial
render, navigation transitions, lists, images/media, animation, state updates,
offline/cache/sync, network latency posture, memory, bundle size, low-end
device concerns, battery impact, and future metric capture readiness.

This phase does not implement source code, run performance tooling, create
metric capture scripts, generate apps, run mobile commands, create native
projects, edit packages, activate CI, call providers, touch dashboard state,
mutate DB/SQL, read secrets, persist memory, or perform source-control
automation from source.

## Planning Scope

The checklist should cover:

- startup performance,
- initial render,
- navigation transition performance,
- list rendering performance,
- image and media loading posture,
- animation performance,
- state update performance,
- offline/cache/sync performance,
- network latency posture,
- memory usage posture,
- bundle size posture,
- profile-readiness,
- low-end device readiness,
- battery impact posture.

The plan is not an optimization guide for an existing app. It is a metadata
contract that future phases can use to turn product and architecture context
into PM risks, DoD criteria, and handoff notes.

## Future Source Scope

Phase 128I should be allowed to create:

- `src/pm/mobilePerformanceChecklist.ts`
- `docs/mobile-performance-checklist.md`
- optional `scripts/mobile-performance-checklist-tests.ts`

Phase 128I may update:

- `src/pm/index.ts`

Phase 128I must not update:

- `package.json`,
- workflows,
- `.github/*`,
- app folders,
- generated mobile app folders,
- Expo/EAS/native config files,
- WhatsApp, bridge, integration, dashboard, provider, DB/SQL, or runtime files,
- environment, vault, credential, or secret files.

## Future Metadata Models

### MobilePerformanceChecklistItem

Future metadata should include:

- `checklistItemId`
- `category`
- `title`
- `question`
- `expectedEvidence`
- `failureSignal`
- `severityHint`
- `relatedAppTypes`
- `relatedArchitectureLayers`
- `riskLevel`
- `requiredApprovals`
- `limitations`

### MobilePerformanceRisk

Future risk metadata should include:

- `riskId`
- `riskCategory`
- `affectedFlow`
- `affectedLayer`
- `likelihood`
- `impact`
- `severity`
- `mitigation`
- `requiredEvidence`
- `profilingNeeded`
- `humanReviewRequired`
- `limitations`

### MobileProfilingReadiness

Future readiness metadata should include:

- `profilingId`
- `targetArea`
- `recommendedToolingPosture`
- `metricName`
- `expectedSignal`
- `riskLevel`
- `requiredEvidence`
- `futureExecutionRequired`
- `limitations`

## Performance Categories

The checklist should use these advisory categories:

- `startup`
- `initial_render`
- `navigation_transition`
- `list_rendering`
- `image_media`
- `animation`
- `state_updates`
- `offline_cache_sync`
- `network_latency`
- `memory_usage`
- `bundle_size`
- `low_end_device`
- `battery_impact`
- `profiling_future`

These categories are planning labels. They do not run app instrumentation,
collect metrics, create scripts, or configure mobile tooling.

## Integration Plan

The checklist should feed:

- Mobile App Factory: app type, target users, core flows, release target, and
  quality posture.
- RN/Expo Architecture Profile: app routes, screens, components, features,
  services, repositories, state, tests, native-future, and release-future
  layers.
- UX Pattern Catalog: list screens, loading/empty/error states, animation
  posture, media-heavy views, and accessibility friction.
- Navigation Flow Model: route transitions, session restore, deep-link entry,
  modal routes, offline routes, and fallback behavior.
- Mobile State Management: state ownership, render pressure, cache posture,
  optimistic updates, and error/loading/empty state behavior.
- Offline / Cache / Sync: cache freshness, queued intents, retry posture,
  stale data labels, conflict recovery, and offline UX.
- Mobile Security Baseline: privacy-sensitive logging, auth/session flows,
  offline writable data, third-party SDK future posture, and release review.
- PM Core: risks, blockers, approvals, DoD, next action, and closeout.
- SOLID/Architecture: frontend, backend, module boundary, DIP, and smell
  review context.
- Autopilot: handoff and dry-run context only.

## Future 128I Implementation Plan

Phase 128I should:

1. Create `src/pm/mobilePerformanceChecklist.ts` with metadata types only.
2. Define checklist, risk, profiling-readiness, recommendation, and summary
   metadata.
3. Add pure helpers that operate on caller-supplied metadata and static
   defaults.
4. Export the module from `src/pm/index.ts`.
5. Add `docs/mobile-performance-checklist.md`.
6. Add an optional smoke test without changing `package.json`.

## Stop Conditions

Stop and do not implement if the requested work requires:

- real profiling execution,
- runtime metric capture,
- app or screen generation,
- mobile command execution,
- native project creation,
- package or workflow changes,
- CI activation,
- device automation,
- provider calls,
- DB/SQL changes,
- dashboard mutation,
- secrets access,
- memory persistence,
- source-control automation from source.

## Verification Plan

For 128B:

- `git status --short --branch`
- `git diff --stat`
- `git diff --name-only`
- `git diff --check`
- `node node_modules/typescript/bin/tsc --noEmit`

If WSL node is unavailable, use Windows Node fallback:

- `node node_modules\typescript\bin\tsc --noEmit`

For 128I:

- typecheck,
- smoke test if added,
- forbidden grep,
- scope check,
- staged-file check.

## Return Path

After 128I, the next formal phase should be:

- Phase 129B - MOBILE TESTING STRATEGY PLAN
