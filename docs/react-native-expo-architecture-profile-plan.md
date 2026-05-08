# React Native / Expo Architecture Profile Plan

Phase: 122B - REACT NATIVE / EXPO ARCHITECTURE PROFILE PLAN

Status: planning / advisory / docs-only

## Purpose

Phase 122B plans a React Native / Expo Architecture Profile for future mobile
apps designed by ORQUESTADOR-PRIME. The profile turns Mobile App Factory
strategy metadata into an advisory architecture recommendation before any app
generation, mobile project creation, native setup, release setup, provider
setup, or runtime work is considered.

This phase supports the future Conversational Build Loop by defining the
architecture language needed to move from a simple app idea into a mobile
blueprint, phase plan, and Codex handoff prompt. It does not implement that
automation.

## Profile Scope

The React Native / Expo profile should plan:

- Expo managed workflow posture as an advisory default.
- Expo Router and navigation structure.
- App directory conventions.
- Source domain structure.
- Component responsibility boundaries.
- Screen ownership boundaries.
- Feature/domain boundaries.
- Service and repository boundaries.
- API and data-access boundaries.
- Local persistence boundaries.
- Offline and cache strategy.
- Auth and session posture.
- Security and device-permission posture.
- Testing and release-readiness posture.
- Push notification strategy as future-gated.
- Native module strategy as future-gated.
- EAS build, submit, and update strategy as future-gated.

The profile is a planning surface only. It must not create a mobile project,
install dependencies, create native folders, configure app stores, configure
credentials, run mobile tooling, or change package/workflow files.

## Recommended Architecture Posture

The default future recommendation should be:

- Prefer Expo managed workflow while product and architecture risk are still
  being clarified.
- Use Expo Router only as an advisory navigation profile until a later
  implementation phase explicitly approves app generation.
- Separate route files, screens, components, feature modules, domain models,
  services, repositories, state, theme, tests, config, and future native/release
  concerns.
- Keep provider and backend integration behind adapters or repositories.
- Treat offline, notifications, auth, payments, analytics, and native modules
  as approval-gated future concerns.
- Keep performance posture measurable: list virtualization, minimal
  re-renders, startup awareness, bundle-size awareness, and native-boundary
  review should be planned before real implementation.

## Recommended Mobile Layers

Future mobile apps should be profiled with these layer labels:

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

These are planning labels. They do not create folders or files in Phase 122B.

## Architecture Decisions To Plan

The profile should document decisions for:

- routing model,
- auth gate and onboarding route posture,
- modal and deep link posture,
- component composition,
- feature ownership,
- state ownership,
- API client boundaries,
- repository boundaries,
- local persistence strategy,
- cache invalidation strategy,
- offline queue and conflict posture,
- environment and config boundary,
- testing stack posture,
- release readiness posture,
- native module future-gate posture.

## Mobile Factory Inputs Consumed

The profile should consume metadata from Mobile App Factory:

- app idea,
- app type,
- platform priority,
- target users,
- core flows,
- screen map,
- navigation needs,
- data model summary,
- offline needs,
- auth needs,
- monetization needs,
- safety needs,
- release target,
- risk level,
- required approvals.

The profile should return architecture recommendations and evidence gaps, not
source files.

## PM/SOLID/Autopilot Integration

The profile may feed:

- PM status report context,
- PM task graph seed metadata,
- Definition of Done criteria,
- risk and blocker candidates,
- approval readiness metadata,
- SOLID review context,
- frontend responsibility review,
- backend layering review,
- dependency direction review,
- architecture smell review,
- Autopilot handoff context,
- Autopilot dry-run scenarios,
- phase closeout context.

This integration is metadata only. It must not trigger handoff, validation,
memory persistence, approval execution, source-control actions, runtime work,
or app generation.

## Conversational Build Loop Readiness

This profile prepares a future loop:

```text
idea -> intake -> mobile strategy -> architecture profile -> screen map
-> phase plan -> Codex handoff prompt -> validation -> beta readiness
```

Phase 122B only plans the architecture-profile step. Later phases may use this
metadata to draft a blueprint and prompt, but those later phases still need
explicit approval boundaries.

## Future Implementation Split

Recommended next split:

- Phase 122I - REACT NATIVE / EXPO ARCHITECTURE PROFILE IMPLEMENTATION
- Phase 123B - MOBILE UX/UI PATTERN CATALOG PLAN

Phase 122I should implement source-only metadata types and pure helpers only
if approved. It should not generate a mobile app.

## Exit Criteria For 122B

Phase 122B is complete when:

- the architecture profile scope is documented,
- safety boundaries are explicit,
- the future metadata model is defined,
- recommended mobile layers are named,
- integration with Mobile App Factory, PM, SOLID, and Autopilot is clear,
- future implementation remains source-only and advisory.
