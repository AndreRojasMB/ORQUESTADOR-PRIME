# Mobile UX/UI Pattern Catalog

Phase 123I implements the Mobile UX/UI Pattern Catalog as source-only, advisory metadata for future mobile app planning. It helps a PM, SOLID reviewer, Autopilot handoff, or later Conversational Build Loop reason about mobile UX patterns before any screen, component, Expo project, native project, provider, workflow, dashboard, runtime, database, or memory behavior exists.

This catalog is not a UI kit and not an app generator. It only defines typed pattern metadata, screen state metadata, selection helpers, and summary helpers.

## Purpose

The catalog gives ORQUESTADOR-PRIME / Viernes a reusable planning layer for common mobile UX/UI needs:

- choosing patterns for an app idea from Mobile App Factory metadata
- recording accessibility, safety, monetization, navigation, and data needs
- identifying required screen states before implementation starts
- feeding PM reports, Definition of Done, risk notes, SOLID review, and Autopilot dry-run handoff
- preparing future conversational planning without executing mobile tooling

## Pattern Categories

The catalog includes these categories:

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

Each category has at least one default advisory pattern. The categories are intentionally broad enough to cover marketplace, field operations, education, social, service booking, dashboard companion, AI assistant, and habit/gamified app concepts without producing any real screens.

## Pattern Model

`MobileUxPattern` records:

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
- safety boundaries confirming advisory metadata only

The model is meant to describe how a future screen should be planned, not how it should be rendered. It contains no JSX, React Native code, Expo configuration, styles, native configuration, package instructions, provider calls, or runtime hooks.

## Screen State Model

`MobileScreenStatePattern` records:

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

The default state patterns cover loading, empty, recoverable error, offline cached content, permission denied, unauthenticated access, sync pending, and partial data. These states prepare future UX and QA acceptance criteria while staying source-only.

## Helpers

`src/pm/mobileUxPatternCatalog.ts` exposes:

- `buildDefaultMobileUxPatternCatalog(...)`
- `createMobileUxPattern(...)`
- `createMobileScreenStatePattern(...)`
- `recommendMobileUxPatterns(...)`
- `summarizeMobileUxPatternCatalog(...)`
- `selectMobileUxPatternsByCategory(...)`
- `selectMobileUxPatternsByAppType(...)`

All helpers are pure. They return metadata objects and do not read files, write files, call providers, change packages, run mobile tools, mutate dashboards, touch databases, or persist memory.

## Safety Boundaries

The catalog explicitly guarantees:

- source-only
- advisory-only
- metadata-only
- no UI generation
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
- no git automation from source

These boundaries match the advisory-first architecture used by ORQUESTADOR-PRIME / Viernes.

## Mobile App Factory Integration

The catalog consumes Mobile App Factory metadata conceptually:

- app type
- target users
- core flows
- screen map
- navigation needs
- auth needs
- offline needs
- monetization needs
- safety needs
- release target

The recommendation helper uses those inputs to identify relevant pattern categories. For example, a marketplace app with messaging and trust needs will receive recommendations for content lists, detail views, messaging, safety/trust, authentication, empty/loading/error states, and accessibility.

## RN/Expo Architecture Profile Integration

The catalog can consume architecture layer metadata from the RN/Expo Architecture Profile:

- recommended project structure layers
- source-only runtime boundaries
- architecture constraints
- risk and approval context

This does not create RN files, Expo configuration, native folders, route files, components, screens, or release commands. It only lets the UX catalog align future pattern decisions with the planned architecture boundaries.

## PM, SOLID, and Autopilot Integration

The catalog can feed:

- PM status context: recommended patterns, risks, assumptions, and limitations
- Definition of Done: required states, accessibility notes, source inspection, and recovery paths
- UX risk review: high-risk categories such as monetization, safety/trust, messaging, offline sync, and accessibility
- SOLID review: separation between navigation, data, state, safety, and presentation responsibilities
- Autopilot handoff: dry-run metadata describing what should be reviewed before implementation

Autopilot may use this catalog as advisory planning context only. It must still require human approval before generating or modifying real mobile implementation.

## Conversational Build Loop Readiness

The catalog prepares a future loop where a simple idea can become a structured UX planning proposal:

1. User describes a mobile app idea.
2. Mobile App Factory classifies app type, users, flows, and screen map.
3. RN/Expo Architecture Profile describes safe source boundaries.
4. Mobile UX/UI Pattern Catalog recommends patterns and required states.
5. A future phase can transform the advisory plan into a reviewed navigation flow model.

Phase 123I does not implement conversational automation. It only adds the metadata layer needed for a later approved loop.

## Limitations

- No mobile UI is generated.
- No screen or component code is generated.
- No app project is generated.
- No Expo, EAS, native, package, workflow, provider, dashboard, database, runtime, or memory behavior is added.
- Recommendations are not final UX approval.
- Accessibility, safety, monetization, trust, and navigation notes still require human review.
- The next planning layer must define navigation flow and screen-to-screen transitions before implementation.

## Next Phase

Recommended next phase:

**Phase 124B — Mobile Navigation Flow Model Plan**

That phase should plan a source-only navigation flow model that consumes Mobile App Factory, RN/Expo Architecture Profile, and this UX/UI Pattern Catalog without generating routes, screens, or app code.
