# Mobile Navigation State Model

Phase: 124B - MOBILE NAVIGATION FLOW MODEL PLAN

Status: planning / navigation state metadata / docs-only

## Purpose

The Mobile Navigation State Model defines how future mobile navigation should
represent route transitions, guards, fallbacks, session restoration, onboarding
gates, auth gates, role gates, offline recovery, paywall entry, and safety
flows as advisory metadata.

It does not create route files, screens, state stores, effects, telemetry
wiring, app folders, native configuration, provider behavior, or runtime
behavior.

## Future Navigation State Metadata

Future `MobileNavigationState` metadata should include:

- `stateId`
- `stateType`
- `trigger`
- `currentRoute`
- `nextRoute`
- `guardCondition`
- `fallbackBehavior`
- `userMessage`
- `recoveryAction`
- `analyticsHint`
- `riskLevel`

The state model should be suitable for PM review, DoD seeding, UX review,
SOLID/frontend responsibility review, and future Autopilot handoff context.

## Planned State Types

Future state types should include:

- `initializing`
- `session_restoring`
- `public_entry`
- `onboarding_required`
- `auth_required`
- `authorized`
- `role_denied`
- `permission_denied`
- `deep_link_resolving`
- `deep_link_not_found`
- `offline_recovery`
- `sync_pending`
- `paywall_required`
- `modal_open`
- `modal_dismissed`
- `safety_flow`
- `fallback`
- `blocked`

These values describe navigation obligations only. They do not generate UI,
connect to live sessions, or run transitions.

## State Design Rules

Every navigation state should define:

- the trigger that enters the state,
- the current route and next route posture,
- the guard condition,
- fallback behavior,
- user-facing message,
- recovery action,
- analytics hint as metadata only,
- PM risk level,
- human review requirement when auth, payments, safety, or roles are involved.

Navigation should avoid dead ends. Every blocked, denied, missing, or offline
state should have a clear recovery path or support path.

## Session Restore State

Session restore should document:

- splash or initializing posture,
- auth check posture,
- stale session posture,
- expired session fallback,
- return-intent preservation,
- privacy-safe loading copy.

It must not read credentials, validate tokens, call providers, persist
sessions, or run effects.

## Auth And Onboarding States

Auth and onboarding states should document:

- whether the route is public or protected,
- whether onboarding can be skipped,
- where the user returns after completion,
- how errors are handled,
- how account recovery behaves,
- what support path exists.

They must not implement auth, providers, credentials, storage, or live
authorization.

## Role And Permission States

Role and permission states should document:

- allowed roles,
- required permissions,
- denied-route message,
- fallback route,
- safe explanation level,
- review requirement.

They should not leak private capabilities or internal policy details in
user-facing copy.

## Deep Link And Notification States

Deep link and notification states should document:

- alias resolution,
- missing resource fallback,
- protected-link auth behavior,
- expired or unsupported link behavior,
- notification entry recovery,
- privacy-safe analytics hint.

They must not configure native linking, notification providers, manifests,
analytics, or external systems.

## Offline And Sync States

Offline and sync states should document:

- cached route availability,
- stale data message,
- queued action posture,
- conflict recovery,
- retry path,
- support path.

They must not configure storage, queues, provider calls, databases, or SQL.

## Paywall And Safety States

Paywall states should document transparent limits, upgrade posture, restore
access posture, and policy review needs.

Safety states should document report, block, moderation review, trust copy,
privacy posture, and human review requirements.

Neither state type should configure payments, providers, moderation systems,
messages, dashboards, or runtime actions.

## Mapping To Previous Mobile Layers

Navigation states should map to:

- Mobile App Factory core flows and screen map,
- React Native / Expo `app_routes`, `screens`, `features`, `state`, `auth`,
  `offline`, and `tests` posture,
- UX/UI Pattern Catalog screen patterns and screen state references,
- PM risk, DoD, and approval metadata,
- Autopilot dry-run and phase closeout context.

## Conversational Build Loop Readiness

The future Conversational Build Loop may use navigation state metadata to
convert a simple app idea into:

- an initial route tree,
- route groups,
- MVP path,
- guarded route list,
- recovery path list,
- future Codex prompt context.

Phase 124B does not implement that automation.

## Safety Boundary

This model remains:

- source-only,
- advisory-only,
- metadata-only,
- no route file generation,
- no screen generation,
- no app generation,
- no mobile tooling,
- no native project creation,
- no package changes,
- no credentials,
- no provider execution,
- no runtime execution,
- no dashboard mutation,
- no DB/SQL mutation,
- no CI activation,
- no memory persistence,
- no source-control automation from source.
