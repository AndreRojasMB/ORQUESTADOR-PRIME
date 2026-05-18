# Mobile Feature Blueprint Generator Plan

Phase: 133B - MOBILE FEATURE BLUEPRINT GENERATOR PLAN

Status: planning / audit / scope

## Purpose

Mobile Feature Blueprint Generator plans a source-only, advisory-only metadata
layer that turns Mobile Requirements Interview output into feature blueprints.
The blueprints should connect requirements to users, roles, flows, UX patterns,
navigation, state, data, offline posture, security posture, performance risk,
testing evidence, release readiness, acceptance criteria, Definition of Done,
dependencies, approvals, and future handoff context.

This phase is docs-only. It does not implement source, create feature source,
create screens, create route files, create apps, invoke Codex, run mobile
tooling, call providers, mutate dashboards, touch DB/SQL, activate CI, persist
memory, commit, or push.

## Objective

Phase 133 should make future mobile implementation planning more precise by
turning normalized requirements into feature-level planning objects:

- feature identification
- feature grouping
- feature priority
- MVP/Beta/Release mapping
- user role mapping
- screen and route references
- state and data references
- offline/cache/sync references
- security/privacy references
- performance/testing/release references
- acceptance criteria
- Definition of Done
- dependencies
- risks and approvals
- future Codex handoff context as metadata only

## Relationship To Phase 132I

Phase 132I answers "what are the mobile requirements?"

Phase 133B plans the next layer: "which feature blueprints represent those
requirements, and what implementation context would each blueprint need later?"

The future generator should consume:

- `MobileRequirementsInterview`
- `MobileRequirementsOutput`
- `MobileRequirementCandidate`
- MVP/Beta/Release scope
- user roles
- workflows
- data requirements
- risk and approvals
- artifact mapping from requirements
- unresolved questions
- confidence

## Planned 133I Source Artifacts

Likely implementation files:

- `src/pm/mobileFeatureBlueprintGenerator.ts`
- `src/pm/index.ts`
- `docs/mobile-feature-blueprint-generator.md`
- optional `scripts/mobile-feature-blueprint-generator-tests.ts`

## Mobile Feature Blueprint Scope

The future implementation should define advisory metadata for:

- feature identity and description
- app type and target users
- user roles
- core flow references
- UX/screen pattern references
- navigation/route references
- state ownership references
- data references
- offline/cache/sync references
- security/privacy references
- performance references
- testing references
- release references
- priority and phase scope
- acceptance criteria
- Definition of Done
- dependencies
- risk level and approval needs
- limitations and unresolved questions
- future handoff context for Codex prompts without dispatching anything

## Feature Blueprint Model

Future metadata should include:

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

Future input metadata should include:

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

The input should be caller-supplied metadata only. It should not inspect the
repo, read environment values, call providers, or create artifacts outside the
returned metadata object.

## Output Model

Future output metadata should include:

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

The normal next artifact after 133I should be:

- `mobile_screen_blueprint_generator_plan`

If feature scope is unclear or high-risk, output should recommend:

- `human_review`
- `blocked_by_unknowns`
- `feature_followup_needed`

## Feature Categories

Future implementation should support:

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

## Acceptance Criteria And DoD

Each feature blueprint should include advisory acceptance criteria:

- user-visible outcome
- required roles
- happy path
- loading/empty/error/offline state expectations
- accessibility expectations
- security/privacy expectations
- performance expectations
- testing evidence
- release readiness evidence

Each blueprint should include Definition of Done metadata:

- requirements mapped
- UX pattern references mapped
- navigation references mapped
- state/data references mapped
- security/privacy review needs mapped
- testing and release readiness needs mapped
- risk and approval posture mapped
- unresolved questions documented

## Dependencies

Dependencies should remain planning labels, for example:

- requirement dependency
- UX pattern dependency
- navigation dependency
- state/data dependency
- offline dependency
- security review dependency
- performance review dependency
- testing evidence dependency
- release gate dependency
- human approval dependency

## Safety Boundaries

Future metadata must preserve:

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

## Stop Conditions

The future implementation should recommend human review or block when:

- a requirement candidate is unresolved
- feature priority is unclear
- MVP scope is too broad
- feature risk is high and approvals are missing
- sensitive data or safety flows lack review requirements
- monetization or public release posture is unclear
- offline write behavior lacks conflict expectations
- testing or release evidence is missing for release scope
- the request asks for real source, screens, routes, app projects, mobile
  commands, providers, dashboards, DB/SQL, CI, memory writes, or source-control
  behavior from source

## Verification Plan For 133B

Run:

- `git status --short --branch`
- `git diff --stat`
- `git diff --name-only`
- `git diff --check`
- `node node_modules/typescript/bin/tsc --noEmit`

If WSL node is unavailable, report it and use:

- `node node_modules\\typescript\\bin\\tsc --noEmit`

## Future Implementation Split

Next implementation phase:

- Phase 133I - MOBILE FEATURE BLUEPRINT GENERATOR IMPLEMENTATION

Following planning phase:

- Phase 134B - MOBILE SCREEN BLUEPRINT GENERATOR PLAN
