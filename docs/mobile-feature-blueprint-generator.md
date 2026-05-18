# Mobile Feature Blueprint Generator

Phase: 133I - MOBILE FEATURE BLUEPRINT GENERATOR IMPLEMENTATION

Status: source-only / advisory / metadata-only

## Purpose

Mobile Feature Blueprint Generator converts Mobile Requirements Interview
metadata into feature blueprint metadata. A blueprint describes the feature,
source requirements, app context, users, roles, flows, mobile artifact refs,
scope, risk, approvals, acceptance criteria, Definition of Done, dependencies,
and limitations.

The layer does not create feature source, screens, route files, app projects,
Codex runs, Expo/EAS runs, provider behavior, runtime behavior, dashboard
mutations, DB/SQL changes, CI behavior, memory writes, or source-control
actions from source.

## Implemented Source File

- `src/pm/mobileFeatureBlueprintGenerator.ts`

The file belongs in PM Core because it consumes requirement metadata and
returns planning, DoD, risk, approval, task graph, SOLID review, and Autopilot
dry-run handoff context.

## Blueprint Model

`MobileFeatureBlueprint` records:

- `blueprintId`
- `featureId`
- `featureName`
- `description`
- `sourceRequirementRefs`
- `appType`
- `targetUsers`
- `userRoles`
- `coreFlowRefs`
- `screenPatternRefs`
- `routeRefs`
- `stateRefs`
- `dataRefs`
- `securityRefs`
- `performanceRefs`
- `testingRefs`
- `releaseRefs`
- `priority`
- `phaseScope`
- `riskLevel`
- `requiredApprovals`
- `acceptanceCriteria`
- `definitionOfDone`
- `dependencies`
- `limitations`

## Generator Input Model

`MobileFeatureBlueprintGeneratorInput` records:

- `generatorInputId`
- `sourceRequirementsInterviewRef`
- `requirementCandidates`
- `appFactoryContext`
- `architectureProfileContext`
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

`MobileFeatureBlueprintOutput` records:

- `outputId`
- `blueprints`
- `mvpFeatures`
- `betaFeatures`
- `releaseFeatures`
- `blockedFeatures`
- `unresolvedQuestions`
- `recommendedNextArtifact`
- `confidence`
- `riskLevel`
- `requiredApprovals`
- `artifactMapping`
- `recommendation`
- `summary`

The default recommended next phase is:

- Phase 134B - MOBILE SCREEN BLUEPRINT GENERATOR PLAN

## Feature Categories

Implemented categories:

- `onboarding`
- `authentication`
- `dashboard`
- `profile_settings`
- `forms`
- `content_list`
- `detail_view`
- `messaging`
- `marketplace`
- `gamification`
- `offline_sync`
- `monetization`
- `safety_trust`
- `notifications`
- `analytics_reporting`
- `admin_management`
- `ai_assistant`
- `unknown`

## Acceptance Criteria

`MobileFeatureAcceptanceCriterion` records:

- criterion id
- title
- description
- category
- expected evidence
- risk level
- required scope
- safety boundaries

Criteria are metadata for future review and QA planning. They are not runnable
tests.

## Definition Of Done

`MobileFeatureDefinitionOfDone` records:

- checklist items
- mapped artifacts
- required evidence
- risk level
- human review requirement
- safety boundaries

DoD metadata connects requirements, UX, navigation, state/data, security,
testing, release, dependencies, risks, approvals, and unresolved questions.

## Helpers

Implemented pure helpers:

- `createMobileFeatureBlueprint`
- `createMobileFeatureBlueprintGeneratorInput`
- `createMobileFeatureBlueprintOutput`
- `generateMobileFeatureBlueprints`
- `summarizeMobileFeatureBlueprintOutput`
- `selectFeatureBlueprintsByScope`
- `selectFeatureBlueprintsByCategory`
- `mapRequirementsToFeatureBlueprints`

All helpers return metadata only.

## Safety Boundaries

The implementation preserves:

- source-only
- advisory-only
- metadata-only
- no feature source creation
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
- no DB/SQL mutation
- no CI activation
- no memory persistence
- no git automation from source

## Mobile Factory Integration

Feature blueprints can feed Mobile App Factory with:

- requirement references
- app type context
- target users
- user roles
- core flows
- priority
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

idea intake -> requirements interview -> feature blueprints -> future screen,
navigation, state, security, testing, and release mapping -> future phase plan
-> future handoff prompt context.

It does not automate conversation, run agents, dispatch prompts, invoke Codex,
or create an app.

## Limitations

- The model does not create implementation tasks automatically.
- The model does not create UI, routes, app projects, native files, package
  changes, workflow changes, or release artifacts.
- Human review remains required for sensitive, monetized, public release,
  safety-related, or low-confidence feature scope.

## Next Phase

Recommended next phase:

Phase 134B - MOBILE SCREEN BLUEPRINT GENERATOR PLAN
