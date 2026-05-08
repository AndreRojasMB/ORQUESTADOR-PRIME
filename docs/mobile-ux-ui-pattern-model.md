# Mobile UX/UI Pattern Model

Phase: 123B - MOBILE UX/UI PATTERN CATALOG PLAN

Status: planning / metadata model / docs-only

## Purpose

The Mobile UX/UI Pattern Model defines the future metadata contract for
advisory mobile UX patterns. It lets ORQUESTADOR-PRIME recommend reusable
patterns for future apps while keeping all output source-only, advisory-only,
and metadata-only.

The model does not generate UI, create screens, scaffold apps, run mobile
tooling, call providers, or mutate runtime systems.

## Future Pattern Catalog Metadata

Future `MobileUxPatternCatalogItem` metadata should include:

- `patternId`
- `name`
- `category`
- `appTypes`
- `targetScreens`
- `userGoal`
- `recommendedStructure`
- `requiredStates`
- `accessibilityNotes`
- `safetyNotes`
- `monetizationNotes`
- `navigationNotes`
- `dataNeeds`
- `riskLevel`
- `requiredApprovals`
- `implementationHints`
- `limitations`

All fields should be static defaults, caller-supplied metadata, or values
derived from caller-supplied Mobile App Factory and React Native / Expo profile
metadata.

## Pattern Categories

Future category IDs:

- `onboarding`
- `authentication`
- `navigation`
- `dashboard`
- `profile_settings`
- `forms`
- `content_lists`
- `detail_views`
- `empty_loading_error`
- `offline_sync`
- `monetization`
- `messaging`
- `gamification_progress`
- `safety_trust`
- `accessibility`
- `notifications_permissions`

Each category should define target screens, typical states, accessibility
requirements, risk signals, and PM review hints.

## Category Intent

`onboarding` should cover first-run education, value explanation, preference
setup, and skip/continue posture.

`authentication` should cover login, register, recovery, session explanation,
privacy reassurance, and account state recovery.

`navigation` should cover tabs, stacks, modals, deep links, back behavior,
route labels, and recovery paths.

`dashboard` should cover home summaries, action priority, alerts, stale data,
and progressive disclosure.

`profile_settings` should cover profile identity, account settings,
notification preferences, privacy, support, and sign-out posture.

`forms` should cover labels, validation, input formatting, save behavior,
disabled state posture, and recovery.

`content_lists` should cover search, filtering, sorting, pagination or
incremental loading, skeletons, and empty states.

`detail_views` should cover primary object inspection, status, actions,
related content, edit posture, and destructive-action review.

`empty_loading_error` should cover non-happy paths with recoverable copy,
actions, and accessibility expectations.

`offline_sync` should cover offline indicators, stale data messaging, sync
recovery, conflict awareness, and safe retry posture.

`monetization` should cover subscription, paywall, freemium limits, premium
education, restoration, and cancellation education as advisory posture.

`messaging` should cover conversation list, thread, composer, delivery state,
moderation surfaces, and blocked-user posture.

`gamification_progress` should cover streaks, goals, levels, rewards,
feedback loops, and non-punitive recovery.

`safety_trust` should cover report, block, privacy, abuse prevention, content
warnings, trust signals, and human review needs.

`accessibility` should cover screen-reader labels, focus order, contrast,
dynamic type, touch target posture, reduced motion, and keyboard/switch
expectations.

`notifications_permissions` should cover permission education, timing,
fallback behavior, settings links, and opt-out clarity.

## App Type Mapping

The catalog should prioritize patterns by app type:

- habit and task apps: onboarding, gamification, progress, reminders, offline
  recovery, and settings,
- social/freemium apps: authentication, messaging, monetization, safety, and
  moderation,
- marketplace apps: listing, detail, trust, checkout readiness, support, and
  dispute posture,
- ERP or field ops apps: dashboard, forms, offline sync, status, audit copy,
  and role-aware navigation,
- education apps: onboarding, content lists, detail views, progress, feedback,
  and offline content posture,
- service booking apps: discovery, detail, booking form, confirmation,
  cancellation, and support,
- dashboard companion apps: dashboard, alerts, filters, detail views, and
  readonly/write-path review,
- AI assistant apps: onboarding, chat, safety, source visibility, controls,
  and escalation paths.

## Monetization And Paywall Model

Monetization patterns should remain advisory. Metadata may describe:

- paywall trigger,
- value explanation,
- plan comparison posture,
- freemium limit copy,
- restore-access posture,
- cancellation education,
- pricing approval needs,
- policy review needs.

The catalog must not process payments, configure stores, create credentials,
or claim release readiness.

## Accessibility And Safety Model

Every future pattern should include:

- accessible name and role expectations,
- focus order expectations,
- touch target expectations,
- contrast and typography posture,
- reduced motion notes,
- error and recovery copy posture,
- content safety risks,
- privacy risks,
- required approvals for sensitive flows.

Accessibility and safety notes are planning metadata. They do not replace a
future accessibility audit or policy review.

## Implementation Hints

Future implementation hints may reference:

- likely React Native screen ownership,
- component boundary expectations,
- state owner expectations,
- route group posture,
- test targets,
- DoD criteria.

Hints must not create files, install libraries, generate screens, or execute
tools.

## Future 123I Scope

If approved, Phase 123I may implement:

- `src/pm/mobileUxPatternCatalog.ts`
- `src/pm/index.ts` export update,
- `docs/mobile-ux-ui-pattern-catalog.md`
- optional `scripts/mobile-ux-pattern-catalog-tests.ts`

The implementation must remain pure metadata. It must not generate UI, create
apps, run mobile tooling, mutate package manifests, activate CI, call
providers, access secrets, persist memory, or perform runtime behavior.

## Phase 123I Implementation Note

Phase 123I implements this model in `src/pm/mobileUxPatternCatalog.ts` as
source-only TypeScript metadata. The model is exported for PM, SOLID,
Autopilot, Mobile App Factory, and RN/Expo profile planning contexts, but it
does not create UI, route files, screens, components, apps, package changes, or
runtime behavior.

## Next Phase

After 123I, the next formal planning target should be:

- Phase 124B - MOBILE NAVIGATION FLOW MODEL PLAN
