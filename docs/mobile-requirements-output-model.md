# Mobile Requirements Output Model

Phase: 132B - MOBILE REQUIREMENTS INTERVIEW PLAN

Status: planning / future metadata model

## Purpose

The Mobile Requirements Output Model defines how future Phase 132I should turn
requirement answers into structured mobile planning metadata. The output should
be useful for PM, SOLID review, Autopilot dry-run context, Mobile App Factory,
architecture, UX, navigation, state, offline, security, performance, testing,
and release strategy.

The output is advisory only. It does not create apps, prompts, agents, routes,
screens, storage, providers, dashboards, databases, CI, release assets, or
runtime behavior.

## Future Types

Suggested future types:

- `MobileRequirementsInterview`
- `MobileRequirementsInterviewInput`
- `MobileRequirementQuestion`
- `MobileRequirementAnswer`
- `MobileRequirementCandidate`
- `MobileRequirementsOutput`
- `MobileRequirementsRecommendation`
- `MobileRequirementsSummary`

## Requirement Answer Model

Future answer metadata should include:

- `answerId`
- `questionId`
- `answerText`
- `normalizedValue`
- `requirementCandidate`
- `priority`
- `confidence`
- `unresolved`
- `needsFollowUp`
- `evidenceRefs`

Suggested priority values:

- `must_have_mvp`
- `should_have_beta`
- `release_ready`
- `defer_later`
- `blocked_until_clarified`

Suggested confidence values:

- `high`
- `medium`
- `low`
- `blocked_by_unknowns`

## Requirement Candidate Model

Future `MobileRequirementCandidate` should represent a normalized requirement:

- `requirementId`
- `category`
- `title`
- `description`
- `priority`
- `sourceQuestionId`
- `sourceAnswerId`
- `mappedArtifacts`
- `acceptanceCriteria`
- `riskLevel`
- `requiredApprovals`
- `unresolved`
- `limitations`

Requirement candidates should be small enough to become future PM tasks, DoD
criteria, risks, blockers, or blueprint context.

## Requirements Output Model

Future `MobileRequirementsOutput` should include:

- `outputId`
- `sourceIdeaIntakeRef`
- `functionalRequirements`
- `nonFunctionalRequirements`
- `userRoles`
- `coreWorkflows`
- `dataRequirements`
- `authSessionRequirements`
- `offlineSyncRequirements`
- `securityPrivacyRequirements`
- `uxAccessibilityRequirements`
- `monetizationRequirements`
- `performanceRequirements`
- `testingRequirements`
- `releaseRequirements`
- `technicalConstraints`
- `businessConstraints`
- `mvpScope`
- `betaScope`
- `releaseScope`
- `unresolvedQuestions`
- `riskLevel`
- `confidence`
- `requiredApprovals`
- `nextRecommendedArtifact`
- `downstreamMetadataTargets`
- `safetyBoundaries`

## MVP / Beta / Release Scope

The output should separate scope by readiness tier.

### MVP Scope

MVP scope should include:

- minimum core workflows
- required user roles
- essential data requirements
- essential UX states
- security/privacy review requirements
- minimal QA smoke flows
- blockers that prevent a usable prototype

### Beta Scope

Beta scope should include:

- expanded workflows
- broader device and accessibility coverage
- offline/cache refinements
- performance risks
- monetization posture if applicable
- release gate evidence

### Release Scope

Release scope should include:

- public-readiness requirements
- store/readiness posture
- privacy and security evidence
- release notes and rollout posture
- support and recovery requirements
- monitoring posture as future metadata

## Mapping To Mobile Stack

### Mobile App Factory Strategy

Requirements should provide:

- supported app type
- target users
- business goal
- core flows
- data model summary
- offline, auth, monetization, and safety needs
- release target
- risk level and approvals

### RN / Expo Architecture Profile

Requirements should provide:

- platform priority
- app layer responsibilities
- data access boundaries
- auth/offline/security posture
- testing and release posture

### UX/UI Pattern Catalog

Requirements should provide:

- target screens
- state patterns
- accessibility needs
- safety/trust flows
- monetization and permission states

### Navigation Flow Model

Requirements should provide:

- route groups
- public and protected routes
- role-based routes
- onboarding and auth gates
- fallback and recovery routes

### State Management Strategy

Requirements should provide:

- state categories
- ownership by layer
- form state
- session state
- loading, error, empty, and offline states

### Offline / Cache / Sync Strategy

Requirements should provide:

- readable offline data
- writable drafts if any
- queue posture
- conflict behavior
- freshness expectations
- recovery UX

### Mobile Security Baseline

Requirements should provide:

- data sensitivity
- auth and session posture
- privacy requirements
- logging/redaction posture
- abuse/safety requirements
- approvals and evidence

### Mobile Performance Checklist

Requirements should provide:

- startup and initial render concerns
- list, image, animation, memory, and low-end device risks
- areas that need future profiling readiness

### Mobile Testing Strategy

Requirements should provide:

- smoke flows
- device matrix needs
- accessibility, security, performance, offline, navigation, and release QA

### Mobile Release / EAS Strategy

Requirements should provide:

- target release tier
- readiness gates
- channel posture
- rollout and rollback needs
- human approval requirements

## PM / SOLID / Autopilot Mapping

The output should feed:

- PM reports
- task graph seed metadata
- DoD criteria
- risk and blocker metadata
- approval readiness
- SOLID and frontend/backend architecture review
- Autopilot handoff context
- dry-run scenarios
- phase closeout

It must not trigger Autopilot execution, persistent memory, provider behavior,
dashboard mutation, or source-control behavior from source.

## Summary Model

Future summary metadata should include:

- `interviewId`
- `sourceIdeaIntakeRef`
- `questionCount`
- `requiredQuestionCount`
- `answerCount`
- `requirementCandidateCount`
- `mvpRequirementCount`
- `betaRequirementCount`
- `releaseRequirementCount`
- `unresolvedRequiredQuestionCount`
- `riskLevel`
- `confidence`
- `humanReviewRequired`
- `recommendedNextPhase`
- `safeSummary`

## Safety Boundaries

Output must preserve:

- source-only
- advisory-only
- metadata-only
- no chat automation
- no message sending
- no WhatsApp execution
- no OpenClaw use
- no Codex invocation
- no app generation
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

## Next Recommended Artifact

The normal next artifact after successful 132I should be:

- `mobile_feature_blueprint_generator_plan`

If requirements remain unclear or high-risk, the recommendation should be:

- `human_review`
- `blocked_by_unknowns`
- `requirements_followup_needed`

## Future Implementation Notes

Phase 132I should implement pure helpers only. Suggested helpers:

- create interview metadata
- create requirement questions
- create requirement answers
- build default requirement question set
- normalize requirement candidates
- summarize requirements output
- map requirements to Mobile App Factory stack metadata
- select questions by category
- select answers by priority
- select requirement candidates by artifact

No helper should perform I/O, runtime work, provider behavior, mobile commands,
dashboard mutation, DB/SQL work, memory writes, or source-control behavior.
