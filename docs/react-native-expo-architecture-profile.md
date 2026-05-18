# React Native / Expo Architecture Profile

Phase: 122I - REACT NATIVE / EXPO ARCHITECTURE PROFILE IMPLEMENTATION

Status: source-only / advisory / metadata-only

## Purpose

The React Native / Expo Architecture Profile turns Mobile App Factory metadata
into a safe mobile architecture recommendation for future apps. It describes
navigation, project layers, state, data access, offline, auth, security,
testing, and release-readiness posture before any app generation is approved.

The profile does not generate apps, create native folders, run mobile tooling,
change package manifests, activate workflows, call providers, mutate dashboard
state, access secrets, or perform runtime work.

## Implemented Source File

- `src/pm/mobileArchitectureProfile.ts`

The source file lives in PM Core because it consumes product/intake metadata
and returns planning, risk, approval, DoD, and handoff metadata. SOLID and
Architecture Core consume it as review context only.

## Architecture Profile Model

`MobileArchitectureProfile` includes:

- `profileId`
- `phaseRef`
- `appType`
- `platformPriority`
- `recommendedNavigation`
- `recommendedProjectStructure`
- `stateManagementProfile`
- `dataAccessProfile`
- `offlineProfile`
- `authProfile`
- `securityProfile`
- `testingProfile`
- `releaseProfile`
- `architectureRecommendation`
- `riskLevel`
- `requiredApprovals`
- `limitations`
- `evidenceRefs`
- `consumedFactoryMetadata`
- `conversationalBuildLoopReadiness`

All values are caller-supplied metadata, static advisory defaults, or derived
from caller-supplied Mobile App Factory metadata.

## Recommended Layers

The profile defines these advisory mobile layers:

- `app_routes`
- `screens`
- `components`
- `features`
- `domain`
- `services`
- `repositories`
- `state`
- `theme`
- `mocks`
- `tests`
- `config`
- `native_future`
- `release_future`

Layers describe responsibilities and review posture. They do not create
folders or files.

## Navigation Profile

`MobileNavigationProfile` describes:

- route group posture,
- auth gate posture,
- modal posture,
- deep link posture,
- recovery paths,
- navigation accessibility notes.

Expo Router is represented only as advisory metadata. No route files are
created.

## State Profile

`MobileStateManagementProfile` describes:

- local UI state,
- feature state,
- server cache state,
- offline queue state,
- auth/session state,
- persisted preferences,
- re-render risk notes.

The profile recommends narrow state ownership and future performance review.
It does not install state libraries or create stores.

## Data And Offline Profiles

`MobileDataAccessProfile` describes API, repository, DTO mapping, validation,
error normalization, retry, and provider boundaries.

`MobileOfflineProfile` describes cache, local persistence, offline queue,
conflict, sync recovery, stale data messaging, and approval posture.

Both remain advisory. No network calls, provider calls, storage configuration,
database changes, or SQL changes are performed.

## Auth And Security Profiles

`MobileAuthProfile` describes auth posture, session lifecycle, account
recovery, account deletion, permission prompts, and privacy review.

`MobileSecurityProfile` describes device permission risks, sensitive data
risks, abuse risks, premium or payment risks, provider trust boundaries, and
required approvals.

The profile does not read secrets, create credential material, configure auth
providers, process payments, or configure stores.

## Testing Profile

`MobileTestingProfile` describes future test and review targets:

- unit targets,
- component targets,
- navigation review,
- accessibility review,
- offline review,
- auth review,
- performance review targets,
- release smoke checklist.

Performance review targets include FPS budget metadata, render pressure,
startup time, bundle size, and list virtualization. No tests are run by the
profile itself.

## Release Profile

`MobileReleaseProfile` describes:

- release target,
- readiness posture,
- privacy policy readiness,
- crash reporting posture,
- analytics posture,
- platform policy review,
- rollout notes,
- required approvals.

Release concerns are future-gated. The profile does not create builds, submit
apps, publish updates, activate CI, or modify package scripts.

## Helpers

Implemented pure helpers:

- `createMobileArchitectureProfile(...)`
- `recommendMobileArchitectureProfile(...)`
- `summarizeMobileArchitectureProfile(...)`
- `buildDefaultMobileArchitectureLayers(...)`
- `describeMobileArchitectureLayer(...)`

Helpers operate only on provided metadata and static source constants.

## Mobile App Factory Integration

The profile consumes:

- app type,
- platform priority,
- core flows,
- screen map,
- navigation needs,
- offline needs,
- auth needs,
- monetization needs,
- safety needs,
- release target,
- risk level,
- required approvals.

This turns Mobile App Factory strategy into a more concrete architecture
profile without generating code.

## PM/SOLID/Autopilot Integration

The profile may feed:

- PM status reports,
- PM task graph metadata,
- Definition of Done metadata,
- risk and blocker metadata,
- approval readiness metadata,
- SOLID review,
- frontend responsibility review,
- backend layering review,
- dependency direction review,
- Autopilot handoff context,
- Autopilot dry-run scenario context,
- phase closeout context.

It does not trigger handoff execution, validation execution, memory
persistence, source-control behavior, runtime behavior, provider calls, or app
generation.

## Conversational Build Loop Readiness

The profile prepares a future loop:

```text
idea -> intake -> mobile strategy -> architecture profile -> screen map
-> phase plan -> Codex handoff prompt -> validation -> beta readiness
```

Phase 122I only implements the architecture profile metadata. It does not
implement conversational automation, prompt generation, app generation, or
Codex execution.

## Safety Boundaries

Phase 122I remains:

- source-only,
- advisory-only,
- metadata-only,
- no app generation,
- no Expo or EAS execution,
- no native project creation,
- no package changes,
- no workflow changes,
- no CI activation,
- no credential material,
- no providers,
- no runtime execution,
- no dashboard mutation,
- no DB/SQL mutation,
- no secrets or env reads,
- no network calls,
- no memory persistence,
- no source-control automation from source.

## Limitations

Phase 122I intentionally does not:

- create mobile app folders,
- write route or screen files,
- install dependencies,
- configure app manifests,
- configure native modules,
- configure push notifications,
- configure payments,
- configure providers,
- create builds,
- submit store metadata,
- claim production readiness.

## Next Phase

Recommended next formal phase:

- Phase 123B - MOBILE UX/UI PATTERN CATALOG PLAN
