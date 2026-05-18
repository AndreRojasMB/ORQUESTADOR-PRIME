# Mobile Navigation Route Model

Phase: 124B - MOBILE NAVIGATION FLOW MODEL PLAN

Status: planning / route metadata model / docs-only

## Purpose

The Mobile Navigation Route Model defines the future metadata contract for
individual mobile routes. It gives ORQUESTADOR-PRIME a way to describe route
ownership, guards, params, fallbacks, deep link aliases, and UX state
references before any app route exists.

The model does not generate routes, screens, components, app folders, native
configuration, package changes, providers, or runtime behavior.

## Future Route Metadata

Future `MobileNavigationRoute` metadata should include:

- `routeId`
- `routeName`
- `routePath`
- `routeType`
- `parentRouteId`
- `screenPatternRefs`
- `requiredAuth`
- `allowedRoles`
- `requiredPermissions`
- `params`
- `deepLinkAliases`
- `guards`
- `fallbackRoute`
- `loadingStateRef`
- `emptyStateRef`
- `errorStateRef`
- `accessibilityNotes`
- `safetyNotes`
- `riskLevel`

All fields should be static advisory defaults, caller-supplied metadata, or
values derived from Mobile App Factory, React Native / Expo profile, and UX/UI
Pattern Catalog metadata.

## Route Types

Future route types should include:

- `tab`
- `stack`
- `modal`
- `public`
- `protected`
- `auth`
- `onboarding`
- `role_based`
- `deep_link_entry`
- `fallback`
- `settings`
- `paywall`
- `offline_sync`
- `safety`
- `notification_entry`

Route types are descriptive. They do not create router files or runtime
navigation logic.

## Route Group Responsibilities

`public` routes should support safe first use, onboarding, and public browse
where product policy allows it.

`auth` routes should explain why identity is needed and preserve return intent
after sign-in or recovery.

`protected` routes should document guard posture, fallback behavior, and
privacy expectations.

`role_based` routes should document allowed roles and denied-route recovery
without revealing private capability details.

`modal` routes should document temporary tasks, exit behavior, focus handling,
and safe dismissal.

`fallback` routes should recover from unsupported links, missing resources,
expired sessions, or unavailable content.

`offline_sync` routes should document stale data, sync pending, and conflict
recovery posture.

`safety` routes should document report, block, trust, review, and recovery
flows with human review requirements.

## Guard Metadata

Future guards should be metadata only and may describe:

- `auth_required`
- `role_required`
- `permission_required`
- `onboarding_required`
- `subscription_required`
- `network_required`
- `safe_mode_required`
- `resource_exists`

Guard metadata must not enforce live runtime behavior. Future implementation
would still need real product review, auth review, privacy review, and testing.

## Params And Deep Link Metadata

Route params should describe:

- param name,
- expected shape,
- optionality,
- sensitivity,
- fallback behavior when missing or invalid,
- whether a value can be shown in user-facing copy.

Deep link aliases should describe external entry points and unsupported-link
fallbacks. They must not configure native linking or external providers.

## UX State References

Routes should reference UX state patterns from the Mobile UX/UI Pattern
Catalog:

- loading state reference,
- empty state reference,
- error state reference,
- offline state reference when applicable,
- paywall state reference when applicable,
- safety state reference when applicable.

This keeps route planning connected to user-visible recovery without creating
screens or components.

## Accessibility And Safety Notes

Every route should plan:

- screen title expectations,
- back behavior,
- focus restoration after modal or auth redirects,
- readable route labels,
- reduced-motion posture for transitions,
- clear fallback copy,
- privacy and sensitive-data notes,
- destructive-action or safety-flow review needs.

## Future 124I Scope

If approved, Phase 124I may implement route metadata types and pure helpers in
`src/pm/mobileNavigationFlowModel.ts`. It must not generate route files,
screen files, app folders, mobile tooling, package changes, provider calls,
runtime behavior, dashboard mutation, DB/SQL changes, CI activation, memory
persistence, or source-control behavior from source modules.
