# Mobile Feature Blueprint Model

Phase: 133B - MOBILE FEATURE BLUEPRINT GENERATOR PLAN

Status: planning / future metadata model

## Purpose

The Mobile Feature Blueprint Model defines the future metadata shape for a
single mobile feature. A blueprint should describe what a feature is, why it
exists, which requirement candidates support it, how it maps to mobile planning
artifacts, what acceptance criteria apply, what Definition of Done is expected,
which dependencies exist, and what safety gates remain.

Blueprints are advisory metadata. They are not feature source files, UI files,
route files, app projects, prompts, agents, provider calls, runtime work, or
source-control actions.

## Future Type

Planned type:

`MobileFeatureBlueprint`

Required fields:

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

## Priority Model

Suggested future priority values:

- `must_have_mvp`
- `should_have_beta`
- `release_ready`
- `defer_later`
- `blocked_until_clarified`

Priority should be derived from Mobile Requirement Candidate priority when
available, then adjusted by risk, dependencies, and release target.

## Phase Scope Model

Suggested future phase scope values:

- `mvp`
- `beta`
- `release`
- `deferred`
- `blocked`

A feature can appear in multiple scope lists when it starts in MVP and expands
in beta or release. The blueprint should keep that expansion explicit.

## Core Field Semantics

### Identity

- `blueprintId`: stable metadata id for the blueprint.
- `featureId`: stable feature id for future PM/task references.
- `featureName`: human-readable feature title.
- `description`: requirement-derived purpose and expected user outcome.

### Source Mapping

- `sourceRequirementRefs`: references to `MobileRequirementCandidate` ids.
- `appType`: Mobile App Factory app type context.
- `targetUsers`: target user groups affected by the feature.
- `userRoles`: roles allowed, blocked, or required by the feature.
- `coreFlowRefs`: core workflow references from requirements/navigation.

### Mobile Artifact Mapping

- `screenPatternRefs`: UX pattern and screen-state references.
- `routeRefs`: navigation route references.
- `stateRefs`: state ownership and state category references.
- `dataRefs`: data entity or field references.
- `securityRefs`: security risk or checklist references.
- `performanceRefs`: performance checklist or risk references.
- `testingRefs`: smoke flow and QA checklist references.
- `releaseRefs`: release gate, channel, or rollout posture references.

### Risk And Review

- `riskLevel`: PM risk tier.
- `requiredApprovals`: human approvals before implementation.
- `dependencies`: blueprint or artifact dependencies.
- `limitations`: known exclusions, unknowns, or future-gated behavior.

## Acceptance Criteria Model

Acceptance criteria should be metadata objects or strings that cover:

- user-visible success
- role/permission expectations
- happy path
- validation behavior
- loading state
- empty state
- error state
- offline state if relevant
- accessibility expectations
- security/privacy expectations
- performance expectation
- testing evidence
- release evidence if in release scope

Acceptance criteria should not become runnable tests in this phase.

## Definition Of Done Model

Definition of Done should include:

- requirements mapped
- feature category assigned
- target users and roles mapped
- UX/screen pattern refs mapped
- navigation refs mapped
- state/data refs mapped
- security/privacy refs mapped
- performance/testing/release refs mapped
- acceptance criteria written
- dependencies documented
- risk and approval posture documented
- unresolved questions listed

DoD entries remain planning metadata.

## Dependency Model

Suggested future dependency fields:

- `dependencyId`
- `dependencyType`
- `dependsOnRef`
- `reason`
- `blocking`
- `riskLevel`
- `requiredApproval`

Suggested dependency types:

- `requirement`
- `feature`
- `ux_pattern`
- `navigation`
- `state_data`
- `offline_sync`
- `security`
- `performance`
- `testing`
- `release`
- `human_approval`
- `unknown`

## Safety Boundaries

Each blueprint should carry:

- source-only
- advisory-only
- metadata-only
- no feature source creation
- no screen creation
- no route file creation
- no app creation
- no Codex invocation
- no Expo/EAS execution
- no package changes
- no provider calls
- no runtime execution
- no dashboard mutation
- no DB/SQL mutation
- no memory persistence
- no git automation from source

## Mapping Examples

Example advisory blueprint names:

- onboarding account setup
- authenticated profile settings
- marketplace browse list
- marketplace detail view
- offline draft capture
- safety report flow
- subscription paywall review
- admin review dashboard
- AI assistant chat context

These are planning labels only. They do not create files, UI, routes, providers,
or app behavior.
