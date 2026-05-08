# Mobile Screen State Pattern Model

Phase: 123B - MOBILE UX/UI PATTERN CATALOG PLAN

Status: planning / screen state metadata / docs-only

## Purpose

The Mobile Screen State Pattern Model defines how future mobile UX patterns
should represent empty, loading, error, offline, permission, paywall, safety,
and success states as advisory metadata.

It does not create screens, components, route files, app folders, state stores,
telemetry wiring, mobile builds, or runtime behavior.

## Future Screen State Metadata

Future `MobileScreenStatePattern` metadata should include:

- `screenStateId`
- `stateType`
- `trigger`
- `userMessage`
- `primaryAction`
- `secondaryAction`
- `recoveryPath`
- `telemetryHint`
- `accessibilityRequirement`
- `riskLevel`

The metadata should be suitable for PM review, DoD seeding, UX review, SOLID
review, and future Autopilot handoff context.

## Planned State Types

Future state types should include:

- `empty`
- `loading`
- `error`
- `offline`
- `stale_data`
- `auth_required`
- `permission_required`
- `limit_reached`
- `paywall`
- `success`
- `blocked`
- `safety_report`
- `moderation_review`
- `destructive_action_confirm`

These values describe UX obligations only. They do not generate UI or connect
to live telemetry.

## State Design Rules

Every screen state should define:

- the condition that triggers it,
- the message the user sees,
- the safest primary action,
- an optional secondary action,
- a recovery path,
- accessibility requirements,
- PM risk level,
- whether human review is required before implementation.

Messages should be clear, brief, and action-oriented. Recovery should be
available where possible. Critical or destructive states should require human
review before future implementation.

## Empty State Pattern

Empty states should explain:

- what is missing,
- why the screen is still useful,
- what the user can do next,
- whether a setup step is required,
- whether content depends on sync or permissions.

They should avoid blame and should not trap the user without navigation.

## Loading State Pattern

Loading states should define:

- initial load posture,
- refresh posture,
- skeleton or progress posture,
- timeout copy posture,
- reduced-motion posture,
- accessibility announcement posture.

The catalog may recommend loading behavior as metadata, but it must not
implement timers, effects, network calls, or loading components.

## Error State Pattern

Error states should define:

- friendly message,
- technical detail boundary,
- retry posture,
- support or fallback path,
- data-loss warning if applicable,
- risk escalation when user action is blocked.

Errors should be recoverable when possible and should avoid exposing secrets,
provider details, or internal stack details.

## Offline And Stale Data Pattern

Offline and stale data states should define:

- connection status copy,
- stale data indicator,
- queued action posture,
- conflict warning posture,
- safe retry path,
- local persistence approval needs.

Offline states remain advisory. The catalog must not configure storage,
queues, sync behavior, providers, databases, or SQL.

## Permission And Auth Pattern

Permission and auth states should define:

- why access is needed,
- what remains usable without access,
- safe retry path,
- settings or support path,
- privacy copy needs,
- account recovery path.

Permission education must be clear and non-coercive. Credential and provider
configuration remain outside this catalog.

## Monetization State Pattern

Paywall and limit states should define:

- trigger,
- value explanation,
- transparent limitation,
- upgrade action posture,
- restore-access posture,
- fallback path,
- policy and pricing approval requirements.

This metadata must not configure payments, stores, subscriptions, providers,
or credentials.

## Safety And Trust State Pattern

Safety states should define:

- report path,
- block path,
- review path,
- privacy and visibility expectations,
- human review requirement,
- post-action reassurance,
- escalation risk.

The catalog may model safety UX, but it must not perform moderation, message
delivery, provider calls, dashboard mutation, or memory persistence.

## Mapping To Mobile Layers

Screen states should map to future React Native / Expo layers as metadata:

- `app_routes`: route access and recovery path posture,
- `screens`: screen state orchestration,
- `components`: presentational rendering posture,
- `features`: feature-owned state transitions,
- `domain`: user-facing status vocabulary,
- `services`: future use-case boundary,
- `state`: state ownership expectations,
- `theme`: visual token expectations,
- `tests`: future state coverage targets.

No files or folders are created by this model.

## Conversational Build Loop Readiness

The future Conversational Build Loop may use screen state metadata to convert
a simple app idea into:

- suggested screens,
- missing state warnings,
- suggested MVP flow,
- navigation recovery paths,
- UX DoD criteria,
- Codex prompt context.

Phase 123B does not implement that automation.

## Safety Boundary

This model remains:

- source-only,
- advisory-only,
- metadata-only,
- no UI generation,
- no screen creation,
- no app generation,
- no mobile tooling,
- no package changes,
- no credentials,
- no provider execution,
- no runtime execution,
- no dashboard mutation,
- no DB/SQL mutation,
- no CI activation,
- no memory persistence,
- no source-control automation from source.

## Phase 123I Implementation Note

Phase 123I implements screen state patterns as advisory metadata in
`src/pm/mobileUxPatternCatalog.ts`. The state patterns can seed future
Definition of Done and QA criteria, but they do not implement state machines,
runtime handling, UI components, or mobile screens.
