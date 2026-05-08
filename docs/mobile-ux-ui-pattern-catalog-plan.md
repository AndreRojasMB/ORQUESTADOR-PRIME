# Mobile UX/UI Pattern Catalog Plan

Phase: 123B - MOBILE UX/UI PATTERN CATALOG PLAN

Status: planning / docs-only / source-only / advisory

## Purpose

The Mobile UX/UI Pattern Catalog plans a reusable advisory catalog for future
mobile applications. It helps ORQUESTADOR-PRIME translate Mobile App Factory
intake and React Native / Expo architecture metadata into screen, state,
navigation, accessibility, monetization, and safety UX recommendations.

This phase does not generate screens, create app files, scaffold projects, run
mobile tooling, or activate runtime behavior.

## Scope

The catalog should cover these mobile UX/UI surfaces:

- onboarding,
- auth, login, and registration,
- home and dashboard surfaces,
- tab navigation,
- stack navigation,
- profiles and settings,
- forms and input validation,
- empty states,
- loading states,
- error states,
- offline states,
- paywall and subscription flows,
- freemium limits,
- marketplace and product listing flows,
- chat and messaging,
- progress and gamification,
- habit and task flows,
- notifications and permission education,
- accessibility,
- safety, report, and block flows.

## Recommended Categories

Future catalog entries should be grouped by:

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

Categories are descriptive metadata. They do not select a UI library, generate
components, or create route files.

## Pattern Planning Principles

Every future pattern should describe:

- user goal and decision point,
- expected screen structure,
- required states,
- primary and secondary actions,
- navigation entry and exit,
- accessibility requirements,
- safety and trust requirements,
- monetization constraints when applicable,
- data needs and privacy posture,
- risk level and required approvals,
- implementation hints for a future approved implementation phase,
- limitations and stop conditions.

Patterns should be mobile-first. They should account for touch target size,
safe areas, readable labels, reduced motion needs, clear feedback, recoverable
errors, offline clarity, and screen-reader friendly copy.

## Product Quality Intent

The catalog should help future apps feel complete without overbuilding. The
minimum quality bar for a pattern is:

- clear first action,
- clear empty/loading/error/offline behavior,
- accessible labels and focus order expectations,
- no color-only meaning,
- predictable navigation,
- state ownership notes,
- PM-ready risk and DoD hints,
- Autopilot handoff notes that remain metadata-only.

## Planned Outputs

Phase 123B creates planning docs for:

- the pattern catalog scope,
- boundaries and denied actions,
- the pattern catalog metadata model,
- the screen state pattern metadata model.

Future Phase 123I may implement a pure TypeScript metadata layer, likely in
PM Core, plus documentation and smoke tests. That implementation must remain
advisory and must not generate UI.

Phase 123I implementation note:

- The catalog is implemented as `src/pm/mobileUxPatternCatalog.ts`.
- `src/pm/index.ts` exports the catalog API.
- `docs/mobile-ux-ui-pattern-catalog.md` summarizes the implemented metadata
  model and boundaries.
- The implementation remains source-only, advisory-only, and metadata-only. It
  does not generate UI, screens, components, apps, native projects, mobile
  tooling, providers, dashboard behavior, runtime behavior, package changes,
  DB/SQL changes, CI activation, memory persistence, or source-control actions
  from source.

## Integration With Mobile App Factory

The catalog should consume Mobile App Factory metadata:

- app type,
- target users,
- core flows,
- screen map,
- navigation needs,
- auth needs,
- offline needs,
- monetization needs,
- safety needs,
- release target.

It should return recommended pattern candidates, missing UX state warnings,
approval hints, and DoD seeds.

## Integration With React Native / Expo Profile

The catalog should map patterns to the advisory layers introduced by the
React Native / Expo Architecture Profile:

- `app_routes` for route and navigation ownership,
- `screens` for screen-level orchestration,
- `components` for presentational building blocks,
- `features` for flow ownership,
- `domain` for product vocabulary,
- `services` for use-case boundaries,
- `state` for UI and feature state posture,
- `theme` for design token expectations,
- `tests` for future review targets.

This mapping remains metadata only. It does not create app routes, screens,
components, stores, styles, or tests.

## Integration With PM/SOLID/Autopilot

Pattern metadata may feed:

- PM status reports,
- task graph seed metadata,
- Definition of Done criteria,
- UX risk and blocker candidates,
- SOLID and frontend responsibility review,
- backend/data boundary review when a pattern depends on data,
- Autopilot handoff context,
- dry-run scenario context,
- phase closeout context.

The catalog must not trigger generation, execution, memory persistence,
provider calls, dashboard mutation, or source-control behavior from source
modules.

## Conversational Build Loop Readiness

This catalog prepares a future conversational loop:

```text
idea -> intake -> app type -> architecture profile -> UX pattern candidates
-> screen states -> navigation flow -> phase plan -> Codex handoff context
```

Phase 123B only plans that contract. It does not implement conversational
automation, prompt generation, app generation, or Codex execution.

## Future Implementation Split

Recommended next implementation phase:

- Phase 123I - MOBILE UX/UI PATTERN CATALOG IMPLEMENTATION

Recommended following planning phase:

- Phase 124B - MOBILE NAVIGATION FLOW MODEL PLAN
