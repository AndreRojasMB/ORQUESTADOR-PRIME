# Mobile Requirements Question Model

Phase: 132B - MOBILE REQUIREMENTS INTERVIEW PLAN

Status: planning / future metadata model

## Purpose

The Mobile Requirements Question Model defines the future question metadata for
turning App Idea Intake output into a more complete mobile requirement set.
Questions remain advisory metadata. They are not delivered through a live chat
channel and do not trigger agents, prompts, providers, mobile commands, apps,
or runtime behavior.

## Future Type

Planned type:

`MobileRequirementQuestion`

Required fields:

- `questionId`
- `category`
- `questionText`
- `required`
- `answerType`
- `mapsToRequirement`
- `mapsToMobileArtifact`
- `followUpTriggers`
- `riskIfUnknown`
- `examples`
- `clarificationPriority`

## Question Categories

The future implementation should support:

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

## Answer Types

Suggested future answer types:

- `free_text`
- `single_choice`
- `multi_choice`
- `yes_no`
- `ranked_list`
- `scope_bucket`
- `risk_flag`
- `acceptance_criteria`
- `unknown_allowed`

## Clarification Priority

Suggested future priority values:

- `required_before_factory_mapping`
- `required_before_architecture`
- `required_before_ux_navigation`
- `required_before_state_data`
- `required_before_security`
- `required_before_testing`
- `required_before_release`
- `optional_for_mvp`
- `optional_for_beta`
- `optional_for_later`

## Maps To Requirement

`mapsToRequirement` should identify which requirement group receives the
answer. Examples:

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

## Maps To Mobile Artifact

`mapsToMobileArtifact` should identify future consumers:

- `mobile_app_factory_strategy`
- `react_native_expo_architecture_profile`
- `mobile_ux_ui_pattern_catalog`
- `mobile_navigation_flow_model`
- `mobile_state_management_strategy`
- `offline_cache_sync_strategy`
- `mobile_security_baseline`
- `mobile_performance_checklist`
- `mobile_testing_strategy`
- `mobile_release_eas_strategy`
- `pm_report`
- `task_graph`
- `dod_criteria`
- `risk_blocker_model`
- `autopilot_handoff_context`

## Default Question Set Plan

The future default question set should include at least one required question
for each high-impact category.

### Functional

- What must the user be able to do in the MVP?
- Which capabilities are essential, optional, or explicitly out of scope?

### User Roles

- Which user roles exist?
- Which roles have special permissions or review responsibilities?

### Core Workflows

- What are the top three user journeys?
- What starts and completes each workflow?

### Data

- What entities and fields are required?
- Which data is sensitive, user-generated, or shared across roles?

### Auth Session

- Does the app require accounts, roles, sessions, recovery, or account deletion?
- Which flows are public, protected, or role-gated?

### Offline Sync

- Which data should be readable with poor connectivity?
- Are offline writes, drafts, retries, or conflicts in scope?

### Security Privacy

- What privacy, abuse, reporting, blocking, consent, or compliance concerns are known?
- What evidence or approval is required before implementation?

### UX Accessibility

- Which screens need loading, empty, error, offline, permission, or recovery states?
- What accessibility requirements are mandatory for MVP?

### Monetization

- Is monetization in scope for MVP, beta, release, or later?
- What user experience must surround paid access or marketplace behavior?

### Performance

- Which flows must feel fast on low-end devices?
- Are images, lists, animations, or sync likely to create performance risk?

### Testing

- Which smoke flows prove MVP readiness?
- Which devices, accessibility modes, and risk areas require QA coverage?

### Release

- What is the release target: prototype, MVP, beta, pilot, store candidate, or internal demo?
- What gates must block release until reviewed?

### Constraints

- What technical, business, timeline, budget, policy, or team constraints exist?

### Unknowns

- Which unanswered questions should block implementation?
- Which unanswered questions can remain deferred for beta or later?

## Follow-Up Triggers

Follow-up triggers should be metadata labels, for example:

- `missing_user_role`
- `unclear_mvp_scope`
- `sensitive_data_present`
- `auth_scope_unclear`
- `offline_write_requested`
- `monetization_present`
- `public_release_target`
- `high_performance_risk`
- `testing_evidence_missing`
- `release_gate_missing`

## Risk If Unknown

Suggested risk posture:

- low: optional polish, non-critical preferences
- medium: workflow, UX, state, or testing ambiguity
- high: auth, privacy, monetization, offline writes, public release
- critical: safety-critical, regulated, or irreversible behavior

## Safety Boundaries

Questions must carry metadata-only safety:

- source-only
- advisory-only
- no chat automation
- no outbound messaging
- no WhatsApp execution
- no OpenClaw use
- no Codex invocation
- no app generation
- no mobile command execution
- no provider calls
- no dashboard mutation
- no DB/SQL mutation
- no memory persistence
