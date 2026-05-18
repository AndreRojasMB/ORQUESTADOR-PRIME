# Mobile Screen Blueprint Generator

Phase: 134I - MOBILE SCREEN BLUEPRINT GENERATOR IMPLEMENTATION

Status: source-only / advisory / metadata-only

## Purpose

Mobile Screen Blueprint Generator converts Mobile Feature Blueprint Generator
metadata into screen blueprint metadata. A screen blueprint describes the
screen, source features, route refs, UX pattern refs, screen state refs,
component slots, state/data refs, security refs, accessibility notes, safety
notes, performance refs, testing refs, release refs, MVP/Beta/Release scope,
risk, approvals, acceptance criteria, Definition of Done, and limitations.

The layer does not create components, real screens, route files, app projects,
Codex runs, Expo/EAS runs, provider behavior, runtime behavior, dashboard
mutations, database/schema changes, CI behavior, memory writes, or source-control
actions from source.

## Implemented Source File

- `src/pm/mobileScreenBlueprintGenerator.ts`

The file belongs in PM Core because it consumes feature blueprint metadata and
returns planning, DoD, risk, approval, task graph, SOLID review, and Autopilot
dry-run handoff context.

## Screen Blueprint Model

`MobileScreenBlueprint` records:

- `screenBlueprintId`
- `screenId`
- `screenName`
- `description`
- `sourceFeatureRefs`
- `appType`
- `targetUsers`
- `userRoles`
- `routeRefs`
- `uxPatternRefs`
- `screenStateRefs`
- `componentSlots`
- `dataRefs`
- `stateRefs`
- `securityRefs`
- `accessibilityNotes`
- `safetyNotes`
- `performanceRefs`
- `testingRefs`
- `releaseRefs`
- `phaseScope`
- `riskLevel`
- `requiredApprovals`
- `acceptanceCriteria`
- `definitionOfDone`
- `limitations`

## Component Slot Model

`MobileComponentSlot` records:

- `slotId`
- `slotName`
- `slotType`
- `purpose`
- `required`
- `dataNeeds`
- `interactionNotes`
- `accessibilityRequirement`
- `stateRefs`
- `riskLevel`
- `limitations`

Slots describe future composition obligations only. They are not React Native
components, JSX, styles, assets, hooks, gestures, or runtime behavior.

## Generator Input Model

`MobileScreenBlueprintGeneratorInput` records:

- `generatorInputId`
- `sourceFeatureBlueprintOutputRef`
- `featureBlueprints`
- `uxPatternContext`
- `navigationContext`
- `stateContext`
- `offlineContext`
- `securityContext`
- `performanceContext`
- `testingContext`
- `releaseContext`
- `constraints`
- `assumptions`
- `evidenceRefs`

Input values are caller-supplied metadata. The helper does not inspect the
repository or call external systems.

## Output Model

`MobileScreenBlueprintOutput` records:

- `outputId`
- `screenBlueprints`
- `mvpScreens`
- `betaScreens`
- `releaseScreens`
- `blockedScreens`
- `unresolvedQuestions`
- `recommendedNextArtifact`
- `confidence`
- `riskLevel`
- `requiredApprovals`
- `artifactMapping`
- `recommendation`
- `summary`

The default recommended next phase is:

- Phase 135B - MOBILE API CONTRACT PLANNER

## Screen Categories

Implemented categories:

- `onboarding`
- `auth_login`
- `auth_register`
- `home_dashboard`
- `list`
- `detail`
- `form`
- `profile`
- `settings`
- `chat_thread`
- `marketplace_browse`
- `marketplace_detail`
- `gamification_progress`
- `paywall`
- `offline_recovery`
- `safety_report`
- `admin_management`
- `ai_assistant`
- `unknown`

## Acceptance Criteria

`MobileScreenAcceptanceCriterion` records:

- criterion id
- title
- description
- screen category
- expected evidence
- risk level
- required scope
- safety boundaries

Criteria are metadata for future review and QA planning. They are not runnable
tests.

## Definition Of Done

`MobileScreenDefinitionOfDone` records:

- checklist items
- mapped artifacts
- required evidence
- risk level
- human review requirement
- safety boundaries

DoD metadata connects feature refs, UX pattern refs, route refs, screen state
refs, component slots, state/data refs, security refs, accessibility notes,
safety notes, testing refs, release refs, risks, approvals, and unresolved
questions.

## Helpers

Implemented pure helpers:

- `createMobileScreenBlueprint`
- `createMobileComponentSlot`
- `createMobileScreenBlueprintGeneratorInput`
- `createMobileScreenBlueprintOutput`
- `generateMobileScreenBlueprints`
- `mapFeatureBlueprintsToScreenBlueprints`
- `summarizeMobileScreenBlueprintOutput`
- `selectScreenBlueprintsByScope`
- `selectScreenBlueprintsByCategory`

All helpers return metadata only.

## Safety Boundaries

The implementation preserves:

- source-only
- advisory-only
- metadata-only
- no component creation
- no screen creation
- no route file creation
- no app creation
- no Codex invocation
- no Expo/EAS execution
- no native project creation
- no package changes
- no credential use
- no provider calls
- no runtime execution
- no dashboard mutation
- no database or schema mutation
- no CI activation
- no memory persistence
- no git automation from source

## Mobile Factory Integration

Screen blueprints can feed Mobile App Factory with:

- source feature references
- app type context
- target users
- user roles
- screen map refinements
- route and UX pattern references
- phase scope
- risk and approval posture
- acceptance criteria
- DoD metadata

## PM / SOLID / Autopilot Integration

The metadata can support:

- PM reports
- task graph seeds
- DoD criteria
- risk and blocker metadata
- approval readiness
- SOLID/frontend/backend review context
- Autopilot handoff context
- dry-run scenarios
- phase closeout

It does not trigger Autopilot execution, memory writes, provider behavior,
dashboard mutation, or source-control behavior from source.

## Conversational Build Loop Readiness

This phase prepares:

idea intake -> requirements interview -> feature blueprints -> screen
blueprints -> future API contract, navigation, state, security, testing, and
release mapping -> future phase plan -> future handoff prompt context.

It does not automate conversation, run agents, dispatch prompts, invoke Codex,
create UI, or create an app.

## Limitations

- No real UI is created.
- No component code is created.
- No screen files are created.
- No route files are created.
- No app project is created.
- No Expo, EAS, native, package, workflow, provider, dashboard, database,
  runtime, or memory behavior is added.
- Recommendations are not final UX approval.
- Accessibility, safety, privacy, monetization, testing, and release notes
  still require human review when risk or approvals demand it.
- The next planning layer must define API contract metadata before future
  implementation planning touches provider or data boundaries.

## Next Phase

Recommended next phase:

**Phase 135B - Mobile API Contract Planner**

That phase should plan source-only API contract metadata that consumes screen
blueprints without creating providers, endpoints, runtime calls, routes,
screens, or app code.
