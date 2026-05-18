# Mobile Performance Checklist

Phase: 128I - MOBILE PERFORMANCE CHECKLIST IMPLEMENTATION

Status: source-only / advisory / metadata-only

## Purpose

Mobile Performance Checklist gives ORQUESTADOR-PRIME / Viernes a typed metadata
layer for future mobile performance planning. It models checklist items,
performance risks, profiling readiness, recommendations, and summaries before
any real mobile app or runtime exists.

The checklist does not run profiling tools, create comparative runtime scripts,
capture runtime metrics, generate apps, run mobile commands, create native
projects, modify packages, activate CI, call providers, mutate dashboard state,
touch DB/SQL, read secrets, persist memory, or perform source-control
automation from source.

## Implemented Source File

- `src/pm/mobilePerformanceChecklist.ts`

The file belongs in PM Core because it consumes Mobile App Factory, RN/Expo
Architecture Profile, UX Pattern Catalog, Navigation Flow Model, Mobile State
Management, Offline / Cache / Sync, and Mobile Security Baseline metadata. It
returns planning, risk, approval, DoD, SOLID review, and Autopilot handoff
context.

## Performance Categories

Implemented advisory categories:

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

Categories are planning labels. They do not run tools, collect metrics, create
screens, configure packages, or execute mobile workflows.

## Checklist Model

`MobilePerformanceChecklistItem` records:

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

Checklist items become PM and DoD context for future implementation. They do
not create UI, routes, stores, assets, tests, or tooling.

## Risk Model

`MobilePerformanceRisk` records:

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

Risks are report-only. They may become PM risk entries, blockers, approval
readiness gaps, or DoD criteria in future phases.

## Profiling Readiness Model

`MobileProfilingReadiness` records:

- `profilingId`
- `targetArea`
- `recommendedToolingPosture`
- `metricName`
- `expectedSignal`
- `riskLevel`
- `requiredEvidence`
- `futureExecutionRequired`
- `limitations`

Readiness records describe what should be reviewed later when a real app target
exists and a human-approved profiling phase is opened. They do not run tools or
collect runtime signals.

## Helpers

Implemented pure helpers:

- `createMobilePerformanceChecklist(...)`
- `createMobilePerformanceChecklistItem(...)`
- `createMobilePerformanceRisk(...)`
- `createMobileProfilingReadiness(...)`
- `recommendMobilePerformanceChecklist(...)`
- `summarizeMobilePerformanceChecklist(...)`
- `selectPerformanceItemsByCategory(...)`
- `selectPerformanceRisksByCategory(...)`

Helpers operate only on caller-supplied metadata and static defaults.

## Safety Boundaries

The checklist explicitly guarantees:

- source-only,
- advisory-only,
- metadata-only,
- no profiling execution,
- no comparative runtime scripts,
- no runtime metric capture,
- no app generation,
- no mobile tooling execution,
- no Expo/EAS execution,
- no native project creation,
- no package changes,
- no provider calls,
- no runtime execution,
- no dashboard mutation,
- no DB or SQL mutation,
- no CI activation,
- no memory persistence,
- no git automation from source.

## Mobile Security Integration

The checklist consumes Mobile Security Baseline metadata for:

- data sensitivity,
- auth/session posture,
- privacy and logging posture,
- third-party future posture,
- release review posture.

Performance review must not weaken security. Future metric capture must remain
privacy-safe and approval-gated.

## State And Offline Integration

The checklist consumes Mobile State Management and Offline / Cache / Sync
metadata for:

- state ownership,
- cache freshness,
- offline queue posture,
- sync conflict posture,
- retry and recovery UX.

This keeps performance review aligned with state, cache, and sync posture
before implementation begins.

## UX And Navigation Integration

The checklist consumes UX and Navigation metadata for:

- first useful screens,
- loading/empty/error states,
- route transitions,
- modal routes,
- deep-link entry,
- list and media-heavy screens,
- accessibility and recovery paths.

No screens, routes, components, or navigation config are generated.

## PM, SOLID, And Autopilot Integration

The checklist can feed:

- PM reports,
- task graph seeds,
- DoD criteria,
- risks and blockers,
- approval readiness,
- SOLID/frontend/backend review context,
- Autopilot handoff context,
- dry-run scenarios,
- phase closeout.

Autopilot may carry this checklist as planning context only. It must not
generate apps, execute Codex, persist memory, call providers, mutate dashboards,
or perform source-control actions from source modules.

## Conversational Build Loop Readiness

The checklist prepares a future loop where a simple idea can become:

- a performance risk posture,
- MVP checklist items,
- low-end device concerns,
- future Codex prompt context.

No conversational automation is implemented in Phase 128I.

## Limitations

Phase 128I intentionally does not include:

- profiling execution,
- comparative runtime scripts,
- runtime metric capture,
- app generation,
- screen or route generation,
- native project creation,
- mobile tooling execution,
- package or workflow changes,
- CI activation,
- provider integration,
- DB or SQL mutation,
- dashboard mutation,
- secrets access,
- memory persistence.

## Next Phase

The recommended next phase is:

- Phase 129B - MOBILE TESTING STRATEGY PLAN
