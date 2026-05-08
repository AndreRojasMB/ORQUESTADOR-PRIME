# React Native / Expo Boundaries

Phase: 122B - REACT NATIVE / EXPO ARCHITECTURE PROFILE PLAN

Status: planning / safety boundaries / docs-only

## Boundary Statement

The React Native / Expo Architecture Profile is an advisory metadata layer. It
may recommend architecture posture, project layout, navigation structure,
state ownership, API/data boundaries, cache/offline posture, testing posture,
and release-readiness criteria.

It is not an app generator, mobile project creator, native setup tool, release
tool, notification setup tool, provider executor, dashboard mutator, database
tool, CI activator, or runtime executor.

## Allowed Surface

Phase 122B may document:

- Expo managed workflow suitability.
- Expo Router and navigation posture.
- App directory conventions.
- Source domain structure.
- Screen, component, feature, service, repository, and state boundaries.
- API/data access boundaries.
- Offline and cache strategy.
- Auth and security posture.
- Testing profile.
- Release-readiness profile.
- Future-gated native module posture.
- Future-gated notification posture.
- Future-gated EAS posture.
- PM/SOLID/Autopilot integration as context only.

## Denied Surface

Phase 122B must not introduce:

- mobile app generation,
- generated mobile app folders,
- app templates,
- native project creation,
- package manifest changes,
- workflow changes,
- CI activation,
- credential handling,
- store submission behavior,
- push notification setup,
- provider execution,
- database or SQL mutation,
- runtime execution,
- dashboard mutation,
- OpenClaw operation,
- WhatsApp outbound behavior,
- n8n execution,
- memory persistence,
- source-control behavior from source modules.

## Future-Gated Mobile Commands

The following command strings are documented only as denied/future-gated
boundaries. Phase 122B must not run them, add package scripts for them, or
activate workflows around them:

- `npx create-expo-app`
- `expo prebuild`
- `eas build`
- `eas submit`
- `eas update`

Any future use would require a separate approved phase with a workspace scope,
manual approval, credential boundary, rollback note, and verification plan.

## Architecture Boundary

The profile may recommend:

- `app/` route ownership,
- `src/` domain organization,
- screen and component separation,
- feature modules,
- service and repository contracts,
- state ownership,
- theme and design token ownership,
- mock and test ownership,
- config boundary,
- native future boundary,
- release future boundary.

It must not create those folders, write source files, install dependencies,
modify app configs, or run mobile tooling.

## Data And Offline Boundary

The profile may describe:

- API client boundaries,
- repository boundaries,
- cache posture,
- local persistence posture,
- offline queue posture,
- conflict resolution posture,
- sync risk,
- privacy and sensitive data concerns.

It must not connect to providers, create databases, write SQL, configure
storage, perform network calls, or persist data.

## Security Boundary

The profile may describe:

- auth posture,
- session posture,
- secure storage needs,
- device permission review,
- privacy needs,
- abuse and content safety risks,
- approval requirements.

It must not read secrets, create credentials, configure auth providers, set up
payments, configure push notifications, or access production systems.

## Release Boundary

The profile may describe:

- internal demo readiness,
- beta readiness,
- store candidate readiness,
- enterprise distribution posture,
- privacy review,
- platform policy review,
- rollout and rollback notes.

It must not create builds, submit apps, publish updates, upload artifacts,
activate CI, or change package scripts.

## PM/SOLID/Autopilot Boundary

The profile may feed:

- PM reports,
- project state,
- task graph,
- DoD criteria,
- risks and blockers,
- SOLID review,
- Autopilot handoff context,
- dry-run scenario metadata,
- phase closeout.

This metadata must not trigger app generation, validation, handoff execution,
memory persistence, approval execution, source-control actions, runtime work,
or provider calls.

## Stop Conditions

A future implementation phase should stop and request human review if the work
requires:

- app project creation,
- native folder generation,
- package manifest changes,
- workflow changes,
- CI activation,
- credential handling,
- store submission,
- push notification setup,
- provider or backend setup,
- database or SQL mutation,
- dashboard mutation,
- runtime execution.
