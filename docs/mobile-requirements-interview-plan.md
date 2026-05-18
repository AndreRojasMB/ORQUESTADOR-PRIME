# Mobile Requirements Interview Plan

Phase: 132B - MOBILE REQUIREMENTS INTERVIEW PLAN

Status: planning / audit / scope

## Purpose

Mobile Requirements Interview plans a source-only, advisory-only metadata layer
that refines App Idea Intake output into fuller mobile requirements. It is the
bridge between a simple idea interview and structured planning artifacts for
Mobile App Factory, React Native / Expo architecture, UX, navigation, state,
offline, security, performance, testing, release, PM reports, task graph, DoD,
risks, and Autopilot handoff context.

This phase is docs-only. It does not implement source, conversational
automation, agent behavior, prompts, app generation, mobile tooling, provider
behavior, dashboards, database work, CI, memory persistence, or source-control
automation from source.

## Objective

Phase 132 should make the future mobile blueprint more reliable by collecting
requirements beyond the initial intake:

- functional requirements
- non-functional requirements
- user roles
- core workflows
- data requirements
- auth/session requirements
- offline/sync requirements
- security/privacy requirements
- UX/accessibility requirements
- monetization requirements
- performance requirements
- testing requirements
- release requirements
- technical and business constraints
- assumptions and unresolved questions
- MVP, beta, and release scope

The result should remain metadata-only and reviewable by a human before any
future implementation phase.

## Relationship To Phase 131I

Phase 131I answers "what is the app idea and what is still unclear?"

Phase 132B plans the next layer: "what requirements are needed before this
idea can become a mobile blueprint?"

The requirements interview should consume:

- `AppIdeaIntakeInterview`
- `AppIdeaIntakeOutput`
- app type hypothesis
- target users
- problem statement
- core flows
- feature candidates
- constraints
- unanswered questions
- confidence
- risk level
- required approvals
- Mobile App Factory mapping

## Planned 132I Source Artifacts

Likely implementation files:

- `src/pm/mobileRequirementsInterview.ts`
- `src/pm/index.ts`
- `docs/mobile-requirements-interview.md`
- optional `scripts/mobile-requirements-interview-tests.ts`

## Mobile Requirements Interview Scope

The future implementation should define an advisory interview that records:

- product requirements: problem, outcome, success criteria, MVP scope
- functional requirements: user-visible capabilities and workflows
- non-functional requirements: accessibility, performance, safety, reliability
- user roles: public, authenticated, admin, operator, creator, buyer, seller
- core workflows: route-level and task-level requirements
- data requirements: entities, fields, sensitivity, retention posture
- auth/session requirements: roles, permissions, recovery, account lifecycle
- offline/sync requirements: read/write offline posture and conflict needs
- security/privacy requirements: sensitive data, approvals, evidence needs
- UX/accessibility requirements: states, touch targets, content guidance
- monetization requirements: paywall, subscription, marketplace, store policy
- testing requirements: unit, integration, smoke, QA, release readiness
- release requirements: target channel, review gates, rollout posture
- constraints and assumptions: business, technical, legal, timeline, budget
- scope tiers: MVP, beta, release candidate, deferred backlog

## Requirements Interview Model

Future metadata should include:

- `interviewId`
- `sourceIdeaIntakeRef`
- `requirementScope`
- `functionalRequirements`
- `nonFunctionalRequirements`
- `userRoles`
- `coreWorkflows`
- `dataRequirements`
- `technicalConstraints`
- `businessConstraints`
- `mvpScope`
- `betaScope`
- `releaseScope`
- `unresolvedQuestions`
- `confidence`
- `riskLevel`
- `requiredApprovals`
- `nextRecommendedArtifact`

The model should carry explicit safety boundaries:

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

## Requirement Categories

Future question and answer metadata should support:

- `functional`
- `user_roles`
- `core_workflows`
- `data`
- `auth_session`
- `offline_sync`
- `security_privacy`
- `ux_accessibility`
- `monetization`
- `performance`
- `testing`
- `release`
- `constraints`
- `unknowns`

## Output Mapping

The requirements output should map to the Mobile App Factory stack:

- Mobile App Factory Strategy: app type, target users, feature scope, risk
- RN/Expo Architecture Profile: layers, project posture, platform priorities
- UX/UI Pattern Catalog: screens, states, accessibility and safety patterns
- Navigation Flow Model: route groups, gates, roles, fallbacks, deep links
- State Management Strategy: state ownership, form state, session state
- Offline / Cache / Sync Strategy: cache, queue, conflict, freshness posture
- Mobile Security Baseline: data sensitivity, risks, checklist, approvals
- Mobile Performance Checklist: startup, lists, memory, low-end device risks
- Mobile Testing Strategy: smoke flows, device matrix, QA posture
- Mobile Release / EAS Strategy: readiness gates, rollout, channel posture
- PM reports: status, unresolved questions, risk notes
- task graph: implementation slices and blockers
- DoD criteria: acceptance, QA, security, release evidence
- Autopilot handoff context: future prompt context only

## Quality Expectations

The future implementation should be able to report:

- total questions
- required questions
- unanswered required questions
- requirement candidates by category
- MVP, beta, and release scope item counts
- risk level
- required approvals
- confidence
- whether Mobile App Factory mapping is ready
- whether human review is required

## Stop Conditions

The future implementation should block or recommend human review when:

- sensitive data is present and security/privacy requirements are unclear
- auth/session scope is requested but roles and recovery are unknown
- monetization is requested but policy and release implications are unknown
- offline writes are requested but conflict behavior is unknown
- release target implies public distribution but readiness gates are missing
- user roles are unclear for protected routes or permissions
- MVP scope is too broad or not prioritized
- the user asks for app generation, mobile commands, credentials, providers,
  dashboard mutation, DB/SQL work, CI activation, memory persistence, or
  source-control automation from source

## Verification Plan For 132B

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

- Phase 132I - MOBILE REQUIREMENTS INTERVIEW IMPLEMENTATION

Following planning phase:

- Phase 133B - MOBILE FEATURE BLUEPRINT GENERATOR PLAN
