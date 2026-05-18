# Mobile Navigation Flow Model

Phase: 124I - MOBILE NAVIGATION FLOW MODEL IMPLEMENTATION

Status: source-only / advisory / metadata-only

## Purpose

The Mobile Navigation Flow Model gives ORQUESTADOR-PRIME / Viernes a typed
metadata layer for future mobile navigation planning. It represents route
groups, public routes, protected routes, role-based routes, modal routes, deep
links, fallback routes, navigation guards, and navigation states before any
real mobile app exists.

The model does not generate routes, screens, components, app folders, native
projects, package changes, provider calls, dashboard mutations, database work,
runtime behavior, or mobile tooling behavior.

## Implemented Source File

- `src/pm/mobileNavigationFlowModel.ts`

The file belongs in PM Core because it consumes product, architecture, UX, risk,
approval, and handoff metadata. Architecture/SOLID and Autopilot may consume
the output as review context only.

## Navigation Patterns

Implemented advisory pattern IDs:

- `tab_first`
- `stack_first`
- `auth_gate`
- `onboarding_gate`
- `role_based`
- `modal_overlay`
- `deep_link_enabled`
- `marketplace_browse_detail`
- `chat_thread`
- `gamified_progress`
- `dashboard_companion`
- `settings_profile`

Patterns may be combined by app type and caller-supplied metadata. They do not
select libraries, create route files, or configure navigation.

## Flow Model

`MobileNavigationFlowModel` records:

- `flowId`
- `phaseRef`
- `appType`
- `navigationPattern`
- `rootNavigator`
- `routeGroups`
- `authRequiredRoutes`
- `publicRoutes`
- `protectedRoutes`
- `roleBasedRoutes`
- `modalRoutes`
- `deepLinks`
- `fallbackRoutes`
- `initialRoute`
- `sessionRestoreStrategy`
- `routes`
- `navigationStates`
- `recommendation`
- `summary`
- `riskLevel`
- `requiredApprovals`
- `limitations`
- metadata consumption notes
- safety boundaries

All values are caller-supplied metadata, static advisory defaults, or derived
from existing Mobile App Factory, React Native / Expo profile, and UX Pattern
Catalog metadata.

## Route Model

`MobileRouteModel` records:

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

Routes are metadata only. Route paths are planning labels and do not create
files, folders, linking configuration, native config, or runtime navigation.

## Route Groups

`MobileRouteGroup` records advisory grouping for:

- `public`
- `auth`
- `main`
- `detail`
- `modal`
- `settings`
- `safety`
- `offline`
- `paywall`
- `fallback`

Groups clarify ownership, default routes, auth posture, and risk posture. They
do not create folder structure.

## Navigation State Model

`MobileNavigationState` records:

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

State types include initialization, session restore, auth required, role
denied, deep link missing, offline recovery, paywall required, safety flow,
fallback, and blocked states. They describe navigation obligations only.

## Helpers

Implemented pure helpers:

- `createMobileNavigationFlow(...)`
- `createMobileRoute(...)`
- `createMobileNavigationState(...)`
- `buildDefaultMobileNavigationPatterns(...)`
- `recommendMobileNavigationFlow(...)`
- `summarizeMobileNavigationFlow(...)`
- `selectRoutesByType(...)`
- `selectProtectedRoutes(...)`

Helpers return metadata objects only. They do not read files, write files,
change package manifests, call providers, run mobile tools, mutate dashboards,
touch databases, persist memory, or execute runtime behavior.

## Safety Boundaries

The model explicitly guarantees:

- source-only
- advisory-only
- metadata-only
- no route file generation
- no screen generation
- no component generation
- no app generation
- no mobile tooling execution
- no native project creation
- no package changes
- no provider calls
- no runtime execution
- no dashboard mutation
- no DB or SQL mutation
- no CI activation
- no memory persistence
- no source-control behavior from source modules

## Mobile App Factory Integration

The model consumes Mobile App Factory metadata conceptually:

- app type
- target users
- core flows
- screen map
- auth needs
- onboarding needs
- monetization needs
- safety needs
- role and permission needs
- release target

This produces a safer first route map before any implementation begins.

## RN/Expo Architecture Profile Integration

The model aligns with RN/Expo profile layers:

- `app_routes`
- `screens`
- `features`
- `state`
- auth profile posture
- offline profile posture
- testing profile posture

This keeps navigation planning connected to future architecture boundaries
without creating RN files, Expo configuration, native folders, or route files.

## UX Pattern Catalog Integration

The model maps routes to:

- screen pattern references
- loading state references
- empty state references
- error state references
- paywall pattern posture
- safety/report/block flows
- onboarding and auth patterns
- accessibility requirements

This preserves user recovery and UX completeness before implementation.

## PM, SOLID, And Autopilot Integration

The model may feed:

- PM status reports
- task graph metadata
- Definition of Done criteria
- UX risks and blockers
- SOLID/frontend/backend review context
- Autopilot handoff context
- Autopilot dry-run scenarios
- phase closeout context

Autopilot may use this model as planning context only. It must not trigger
route generation, prompt execution, validation execution, memory persistence,
provider calls, dashboard mutation, or source-control behavior.

## Conversational Build Loop Readiness

The model prepares a future loop:

```text
simple idea -> mobile strategy -> architecture profile -> UX pattern catalog
-> navigation map -> screen blueprint -> phases -> Codex handoff context
```

Phase 124I does not implement conversational automation. It only adds the
metadata needed for a future approved loop.

## Limitations

- No route files are generated.
- No screens or components are generated.
- No app project is generated.
- No mobile tooling, native, package, workflow, provider, dashboard, DB,
  runtime, memory, or source-control behavior is added.
- Navigation recommendations are not final UX, security, or product approval.
- Future implementation still needs human review for auth, roles, payments,
  deep links, notifications, safety, and offline behavior.

## Next Phase

Recommended next formal phase:

- Phase 125B - MOBILE STATE MANAGEMENT STRATEGY PLAN
