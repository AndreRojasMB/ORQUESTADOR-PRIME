# Mobile App Factory Strategy

Phase: 121I - MOBILE APP FACTORY STRATEGY IMPLEMENTATION

Status: source-only / advisory / metadata-only

## Purpose

The Mobile App Factory Strategy gives ORQUESTADOR-PRIME a safe way to turn a
mobile product idea into product, UX, architecture, quality, safety, and future
release-readiness metadata.

It is not an app generator. It does not create React Native, Expo, native, app
store, payment, provider, dashboard, backend, or runtime artifacts.

## Implemented Source File

- `src/pm/mobileAppFactoryStrategy.ts`

The file belongs in PM Core because this phase produces product strategy,
task-graph seeds, Definition of Done seeds, risk metadata, approval context,
and next-phase recommendations. Architecture/SOLID receives this metadata as
review context only.

## Supported App Types

The strategy supports advisory classification for:

- `habit_gamified_app`
- `social_freemium_app`
- `marketplace_app`
- `erp_mobile_field_ops_app`
- `education_app`
- `service_booking_app`
- `dashboard_companion_app`
- `ai_assistant_mobile_app`
- `unknown_mobile_app`

Classification is descriptive. It does not select dependencies, create
templates, generate screens, or configure mobile tooling.

## Intake Model

`MobileAppFactoryIntake` records caller-supplied metadata:

- app idea and safe summary,
- original user goal,
- target users,
- business goal,
- platform priority,
- app type,
- core flows,
- screen map,
- navigation model,
- data model summary,
- offline needs,
- auth needs,
- monetization needs,
- safety needs,
- release target,
- PM risk level,
- required approvals,
- evidence, assumptions, and exclusions.

The intake is source-only and advisory-only. It has explicit flags for no app
generation, no mobile tooling, no native project creation, no provider calls,
and no runtime execution.

## Quality Model

`MobileAppFactoryQualityModel` covers:

- product clarity,
- UX completeness,
- accessibility,
- architecture posture,
- security and privacy,
- testing strategy,
- release-readiness criteria,
- monetization review,
- quality gaps.

The model describes future review work. It does not run tests, configure test
tools, create builds, or publish artifacts.

## Safety Model

`MobileAppFactorySafetyModel` captures:

- source-only, advisory-only, metadata-only boundaries,
- stop conditions,
- approval points,
- denied actions,
- risk level,
- explicit no-execution flags.

Human review is required before future work involving credentials, payments,
store configuration, auth/privacy implementation, production backend behavior,
external services, or runtime actions.

## Strategy Output

`MobileAppFactoryStrategy` combines:

- intake,
- app type,
- quality model,
- safety model,
- architecture recommendation,
- release-readiness summary,
- PM integration uses,
- SOLID integration summary,
- Autopilot integration summary,
- recommended next step.

The default next step is:

- Phase 122B - REACT NATIVE / EXPO ARCHITECTURE PROFILE PLAN

## PM Integration

The strategy may feed:

- PM status context,
- task graph seed metadata,
- Definition of Done seed metadata,
- risk and blocker context,
- approval readiness,
- phase closeout context.

It does not create live tasks, blockers, approvals, reports, commits, pushes,
or execution plans.

## SOLID Integration

The strategy may provide context for:

- SOLID review,
- module boundary review,
- dependency direction review,
- architecture smell review,
- frontend responsibility review,
- backend layering review.

This is context only. No scanner, source inspection, refactor, app generation,
or runtime wiring is performed.

## Autopilot Integration

The strategy may be included in Autopilot handoff context, next-action context,
and closeout context. It must not trigger Codex execution, OpenClaw use,
WhatsApp outbound behavior, provider calls, dashboard mutation, memory
persistence, or source-control behavior from source modules.

## Safety Boundaries

Phase 121I keeps these boundaries:

- source-only,
- advisory-only,
- metadata-only,
- no app generation,
- no Expo or EAS tooling,
- no native project creation,
- no mobile app templates,
- no package manifest changes,
- no workflow changes,
- no CI activation,
- no provider execution,
- no dashboard mutation,
- no DB or SQL mutation,
- no secrets or credentials,
- no network calls,
- no runtime executor,
- no memory persistence.

## Limitations

Phase 121I intentionally does not:

- generate mobile code,
- create mobile folders,
- install dependencies,
- create app store metadata,
- configure push notifications,
- configure payments,
- configure auth providers,
- run tests over a real app,
- claim production readiness.

## Next Phase

Recommended next formal phase:

- Phase 122B - REACT NATIVE / EXPO ARCHITECTURE PROFILE PLAN
