# Mobile Testing Strategy

Phase: 129I - MOBILE TESTING STRATEGY IMPLEMENTATION

Status: source-only / advisory / metadata-only

## Purpose

Mobile Testing Strategy gives ORQUESTADOR-PRIME / Viernes a typed metadata
layer for future mobile QA planning. It models test levels, QA categories,
device matrix posture, smoke flow posture, release readiness checks,
recommendations, summaries, approvals, and limitations before any real mobile
app target exists.

The strategy does not run real mobile app tests, start virtual devices, perform
device automation, execute mobile commands, create apps, modify native
projects, change packages, activate workflows or CI, call providers, mutate
dashboards, touch DB/SQL, read secrets or environment values, persist memory,
or perform source-control automation from source.

## Implemented Source File

- `src/pm/mobileTestingStrategy.ts`

The file belongs in PM Core because it consumes Mobile App Factory, RN/Expo
Architecture Profile, UX Pattern Catalog, Navigation Flow Model, Mobile State
Management, Offline / Cache / Sync, Mobile Security Baseline, and Mobile
Performance Checklist metadata. It returns planning, risk, approval, DoD,
SOLID review, and Autopilot handoff context.

## Testing Categories

Implemented advisory categories:

- `unit`
- `integration`
- `e2e`
- `smoke`
- `regression`
- `accessibility`
- `security`
- `performance`
- `offline_sync`
- `navigation`
- `auth_session`
- `release_readiness`

Categories are planning labels. They do not create test files, execute app
targets, start virtual devices, activate mobile tooling, or modify workflow
configuration.

## Strategy Model

`MobileTestingStrategy` records:

- `strategyId`
- `appType`
- `testLevels`
- `smokeFlows`
- `deviceMatrix`
- `accessibilityChecks`
- `securityChecks`
- `performanceChecks`
- `offlineSyncChecks`
- `releaseReadinessChecks`
- `riskLevel`
- `requiredApprovals`
- `limitations`

The model consumes caller-supplied metadata and static defaults only. It does
not inspect repositories, discover imports, generate tests, execute commands,
or infer runtime state.

## Device Matrix Model

`MobileDeviceMatrix` records:

- `matrixId`
- `platform`
- `deviceClass`
- `osVersionRange`
- `screenSizeClass`
- `performanceTier`
- `networkCondition`
- `accessibilityMode`
- `requiredForRelease`
- `riskLevel`

Matrix entries describe future QA coverage posture. They do not start devices,
execute app targets, create mobile projects, or activate automation.

## Smoke Flow Model

`MobileSmokeFlow` records:

- `smokeFlowId`
- `name`
- `appType`
- `targetUser`
- `startRoute`
- `steps`
- `expectedOutcome`
- `requiredTestData`
- `relatedRisks`
- `priority`
- `automationReadiness`
- `humanReviewRequired`

Smoke flows describe critical journeys for future QA. They do not create test
files or execute app behavior.

## Helpers

Implemented pure helpers:

- `createMobileTestingStrategy(...)`
- `createMobileDeviceMatrix(...)`
- `createMobileSmokeFlow(...)`
- `recommendMobileTestingStrategy(...)`
- `summarizeMobileTestingStrategy(...)`
- `selectSmokeFlowsByAppType(...)`
- `selectDeviceMatrixByPlatform(...)`

Helpers operate only on caller-supplied metadata and static defaults.

## Safety Boundaries

The strategy explicitly guarantees:

- source-only,
- advisory-only,
- metadata-only,
- no real app tests,
- no virtual device launch,
- no device automation,
- no mobile command execution,
- no Expo/EAS execution,
- no package changes,
- no workflow or CI activation,
- no native project changes,
- no provider calls,
- no runtime execution,
- no dashboard mutation,
- no DB or SQL mutation,
- no secrets/env/network,
- no memory persistence,
- no git automation from source.

## Mobile Factory Integration

The strategy consumes:

- app type,
- target users,
- core flows,
- screen map,
- auth needs,
- offline needs,
- monetization needs,
- safety needs,
- release target.

Those inputs drive test levels, smoke flows, device matrix risk, approval
posture, and release readiness checks.

## RN/Expo Integration

The strategy maps QA posture to advisory mobile layers:

- app routes,
- screens,
- components,
- features,
- domain,
- services,
- repositories,
- state,
- tests,
- release future.

This supports future RN/Expo review without creating apps, native files, test
files, or command wiring.

## UX, Navigation, State, Offline, Security, And Performance Integration

The strategy consumes:

- UX pattern states,
- navigation routes and gates,
- state ownership,
- offline/cache/sync recovery,
- auth/session posture,
- security checklist evidence,
- performance checklist evidence,
- low-end device concerns,
- release readiness posture.

These inputs turn mobile planning metadata into QA posture without executing
mobile tests.

## PM, SOLID, And Autopilot Integration

The strategy can feed:

- PM reports,
- task graph seeds,
- DoD criteria,
- QA risks and blockers,
- approval readiness,
- SOLID/frontend/backend review context,
- Autopilot handoff context,
- dry-run scenarios,
- phase closeout.

Autopilot may carry this strategy as planning context only. It must not execute
Codex, persist memory, call providers, mutate dashboards, or perform
source-control actions from source modules.

## Conversational Build Loop Readiness

The strategy prepares a future loop where a simple idea can become:

- a QA strategy,
- a smoke flow list,
- a device matrix posture,
- a release readiness checklist,
- future Codex prompt context.

No conversational automation is implemented in Phase 129I.

## Limitations

Phase 129I intentionally does not include:

- real mobile app tests,
- virtual device execution,
- device automation,
- mobile test file generation,
- app generation,
- native project changes,
- Expo/EAS execution,
- package changes,
- workflow or CI activation,
- provider calls,
- runtime execution,
- dashboard mutation,
- DB/SQL mutation,
- secrets/env/network access,
- memory persistence,
- git automation from source.

## Next Phase

Phase 130B - MOBILE RELEASE / EAS STRATEGY PLAN.
