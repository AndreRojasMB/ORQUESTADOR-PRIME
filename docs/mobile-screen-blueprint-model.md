# Mobile Screen Blueprint Model

Phase: 134B - MOBILE SCREEN BLUEPRINT GENERATOR PLAN

Status: planning / model design

## Purpose

The Mobile Screen Blueprint Model defines the future metadata shape for
planning mobile screens from feature blueprints. It should sit after Mobile
Feature Blueprint Generator and before any implementation planning that might
touch real UI, routes, app folders, or mobile tooling.

This model is advisory only. It does not create screens, components, styles,
assets, route files, app projects, packages, provider calls, runtime behavior,
dashboard mutations, DB/SQL changes, memory writes, commits, or pushes.

## Future Type Names

Future Phase 134I should consider these source-only metadata types:

- `MobileScreenBlueprint`
- `MobileScreenBlueprintGeneratorInput`
- `MobileScreenBlueprintOutput`
- `MobileScreenCategory`
- `MobileScreenScope`
- `MobileComponentSlot`
- `MobileScreenAcceptanceCriterion`
- `MobileScreenDefinitionOfDone`
- `MobileScreenBlueprintRecommendation`
- `MobileScreenBlueprintSummary`

## Screen Category Values

Future `MobileScreenCategory` should include:

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

## Screen Scope Values

Future `MobileScreenScope` should include:

- `mvp`
- `beta`
- `release`
- `deferred`
- `blocked`

Scope should map to feature phase scope and should preserve blocked or
unresolved decisions as planning metadata.

## Screen Blueprint Fields

Future `MobileScreenBlueprint` metadata should include:

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
- `safetyBoundaries`

## Component Slot Fields

Future `MobileComponentSlot` metadata should include:

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
- `safetyBoundaries`

Recommended `slotType` values may include:

- `header`
- `primary_content`
- `list_item`
- `form_field`
- `primary_action`
- `secondary_action`
- `status_banner`
- `empty_state`
- `loading_state`
- `error_state`
- `offline_state`
- `navigation_entry`
- `safety_action`
- `monetization_action`
- `unknown`

Slots describe screen composition obligations. They are not component source,
JSX, style rules, route entries, assets, or runtime hooks.

## Acceptance Criteria Metadata

Future `MobileScreenAcceptanceCriterion` should record:

- criterion id
- title
- screen category
- user-visible outcome
- target role
- required state coverage
- accessibility evidence
- safety evidence
- risk level
- required scope

Criteria should remain review metadata. They are not runnable app tests.

## Definition Of Done Metadata

Future `MobileScreenDefinitionOfDone` should record:

- source feature refs mapped
- UX pattern refs mapped
- route refs mapped
- required screen state refs mapped
- component slots documented as metadata
- state/data refs mapped
- accessibility notes present
- safety/privacy notes present
- performance, testing, and release refs mapped
- unresolved questions captured
- human review requirement

## Generator Input Fields

Future `MobileScreenBlueprintGeneratorInput` metadata should include:

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
- `safetyBoundaries`

## Output Fields

Future `MobileScreenBlueprintOutput` metadata should include:

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
- `safetyBoundaries`

## Recommended Helpers For 134I

Future pure helpers should include:

- `createMobileScreenBlueprint(...)`
- `createMobileComponentSlot(...)`
- `createMobileScreenBlueprintGeneratorInput(...)`
- `createMobileScreenBlueprintOutput(...)`
- `mapFeatureBlueprintsToScreenBlueprints(...)`
- `summarizeMobileScreenBlueprintOutput(...)`
- `selectScreenBlueprintsByScope(...)`
- `selectScreenBlueprintsByCategory(...)`

Helpers should return metadata objects only.

## Safety Boundary Fields

Future source should preserve flags for:

- source-only
- advisory-only
- metadata-only
- no screen creation
- no component creation
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
- no DB/SQL mutation
- no CI activation
- no memory persistence
- no git automation from source

## Mapping To Existing Mobile Stack

Screen blueprint metadata should map to:

- Mobile Feature Blueprint Generator source feature refs
- Mobile UX/UI Pattern Catalog pattern and state refs
- Mobile Navigation Flow Model route refs
- Mobile State Management Strategy state refs
- Offline / Cache / Sync Strategy recovery refs
- Mobile Security Baseline safety and privacy refs
- Mobile Performance Checklist screen risk refs
- Mobile Testing Strategy smoke and QA refs
- Mobile Release / EAS Strategy readiness gate refs

The mapping is conceptual and must not create implementation artifacts.
