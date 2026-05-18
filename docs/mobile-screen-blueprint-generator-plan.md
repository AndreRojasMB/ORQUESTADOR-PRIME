# Mobile Screen Blueprint Generator Plan

Phase: 134B - MOBILE SCREEN BLUEPRINT GENERATOR PLAN

Status: planning / audit / scope

## Purpose

Mobile Screen Blueprint Generator plans a source-only, advisory-only metadata
layer that turns Mobile Feature Blueprint Generator output into screen
blueprints. A screen blueprint should describe screen identity, feature
grouping, layout posture, component slots, UX pattern references, screen state
references, navigation references, state/data needs, security/privacy notes,
accessibility notes, safety notes, performance/testing/release references,
scope, risk, approvals, acceptance criteria, Definition of Done, and future
handoff context.

This phase is docs-only. It does not implement source, create real screens,
create components, create route files, create apps, invoke Codex, run mobile
tooling, call providers, mutate dashboards, touch DB/SQL, activate CI, persist
memory, commit, or push.

## Objective

Phase 134 should make future mobile planning more concrete by introducing a
screen-level planning artifact between feature blueprints and implementation
planning:

- screen identification
- screen grouping by feature
- MVP/Beta/Release grouping
- screen layout metadata
- component slot metadata
- UX pattern references
- screen state references
- navigation route references
- state and data references
- security and privacy references
- accessibility and safety notes
- performance, testing, and release references
- acceptance criteria and Definition of Done
- risk and approval posture
- future Codex handoff context as passive metadata

## Relationship To Phase 133I

Phase 133I answers "which feature blueprints represent the mobile
requirements?"

Phase 134B plans the next layer: "which planned screens are needed for those
features, and what metadata must each screen carry before implementation is
approved?"

The future generator should consume:

- `MobileFeatureBlueprintOutput`
- `MobileFeatureBlueprint`
- feature scope
- feature category
- screen pattern references
- route references
- state and data references
- security, performance, testing, and release references
- acceptance criteria
- Definition of Done
- unresolved questions
- confidence, risks, and approvals

## Planned 134I Source Artifacts

Likely implementation files:

- `src/pm/mobileScreenBlueprintGenerator.ts`
- `src/pm/index.ts`
- `docs/mobile-screen-blueprint-generator.md`
- optional `scripts/mobile-screen-blueprint-generator-tests.ts`

## Mobile Screen Blueprint Scope

The future implementation should define advisory metadata for:

- screen identity and description
- source feature references
- app type, target users, and user roles
- route references
- UX pattern references
- screen state references
- component slot metadata
- data references
- state references
- security and privacy references
- accessibility notes
- safety notes
- performance references
- testing references
- release references
- MVP/Beta/Release scope
- risk level and approval needs
- acceptance criteria
- Definition of Done
- limitations and unresolved questions
- future handoff context for Codex prompts without dispatching anything

## Screen Blueprint Model

Future metadata should include:

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

Future metadata should include:

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

Component slots are labels for future planning. They do not create React Native
components, styles, assets, hooks, gestures, or runtime behavior.

## Generator Input Model

Future input metadata should include:

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

The input should be caller-supplied metadata only. It should not inspect the
repo, read environment values, call providers, or create artifacts outside the
returned metadata object.

## Output Model

Future output metadata should include:

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

The normal next artifact after 134I should be:

- `mobile_api_contract_planner`

If screen scope is unclear or high-risk, output should recommend:

- `human_review`
- `blocked_by_unknowns`
- `screen_followup_needed`

## Screen Categories

Future implementation should support:

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

## Acceptance Criteria And DoD

Each screen blueprint should include advisory acceptance criteria:

- user-visible outcome
- required role or audience
- entry route posture
- primary action posture
- loading, empty, error, offline, and permission state expectations
- accessibility expectations
- security and privacy expectations
- performance expectations
- testing evidence
- release readiness evidence

Each screen blueprint should include Definition of Done metadata:

- source feature references mapped
- UX pattern references mapped
- route references mapped
- state/data references mapped
- security and privacy review needs mapped
- accessibility and safety notes documented
- testing and release readiness needs mapped
- risk and approval posture mapped
- unresolved questions documented

## Integration Plan

Screen blueprints may feed:

- Mobile App Factory screen map refinement
- React Native / Expo Architecture Profile layer alignment
- UX/UI Pattern Catalog screen pattern and state references
- Navigation Flow Model route references
- State Management Strategy ownership references
- Offline / Cache / Sync Strategy recovery posture
- Mobile Security Baseline privacy and safety review
- Mobile Performance Checklist screen risk posture
- Mobile Testing Strategy smoke and QA coverage
- Mobile Release / EAS Strategy readiness gate context
- PM reports
- task graph metadata
- DoD criteria
- risks and blockers
- Autopilot handoff context
- dry-run scenarios
- phase closeout

## Conversational Build Loop Readiness

This phase prepares:

idea intake -> requirements -> feature blueprints -> screen blueprints ->
navigation/state/security/testing/release mapping -> future phase plan ->
future handoff prompt context.

It does not automate conversation, run agents, dispatch prompts, invoke Codex,
create UI, or create an app.

## Safety Boundary Summary

Phase 134B remains:

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

## Future Implementation Split

- Phase 134I - MOBILE SCREEN BLUEPRINT GENERATOR IMPLEMENTATION
- Phase 135B - MOBILE API CONTRACT PLANNER
