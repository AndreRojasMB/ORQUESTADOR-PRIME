# App Idea Intake Interview

Phase 131I implements the App Idea Intake Interview as source-only, advisory-only metadata. It turns a simple mobile app idea into structured intake context: problem, users, app type hypothesis, flows, features, constraints, assumptions, unanswered questions, confidence, risk posture, approvals, and the next recommended artifact.

This phase does not automate a conversation, perform outbound messaging, invoke Codex, generate an app, run mobile tooling, touch credentials, call providers, mutate dashboards, or persist memory.

## Interview Model

The interview metadata is represented by `AppIdeaIntakeInterview`.

Core fields:

- `interviewId`
- `ideaText`
- `appTypeHypothesis`
- `targetUsers`
- `problemStatement`
- `desiredOutcome`
- `coreFlows`
- `featureCandidates`
- `constraints`
- `assumptions`
- `unansweredQuestions`
- `confidence`
- `riskLevel`
- `requiredApprovals`
- `nextRecommendedArtifact`

The interview also carries:

- `questions`
- `answers`
- `output`
- `recommendation`
- `summary`
- `safetyBoundaries`

## Question Model

The question metadata is represented by `AppIdeaIntakeQuestion`.

Fields:

- `questionId`
- `category`
- `questionText`
- `required`
- `answerType`
- `mapsToField`
- `followUpTriggers`
- `riskIfUnknown`
- `examples`
- `clarificationPriority`

Categories:

- `problem`
- `users`
- `app_type`
- `core_flows`
- `features`
- `platform`
- `auth`
- `data`
- `offline`
- `monetization`
- `safety_privacy`
- `release`
- `constraints`
- `unknowns`

## Answer Model

The answer metadata is represented by `AppIdeaIntakeAnswer`.

Fields:

- `answerId`
- `questionId`
- `answerText`
- `normalizedValue`
- `confidence`
- `unresolved`
- `needsFollowUp`
- `evidenceRefs`

Answers remain passive metadata. They are not sent anywhere and do not trigger runtime behavior.

## Intake Output Mapping

`AppIdeaIntakeOutput` maps the normalized interview into Mobile App Factory input metadata through `mapIntakeToMobileFactoryInput`.

The mapping can feed:

- Mobile App Factory Strategy
- React Native / Expo Architecture Profile
- Mobile UX/UI Pattern Catalog
- Mobile Navigation Flow Model
- Mobile State Management Strategy
- Offline / Cache / Sync Strategy
- Mobile Security Baseline
- Mobile Performance Checklist
- Mobile Testing Strategy
- Mobile Release / EAS Strategy

The mapping is conceptual and advisory. It prepares structured context for later phases without creating files for an app, routes, screens, storage, network behavior, release configuration, or provider actions.

## Helpers

Implemented helpers:

- `createAppIdeaIntakeInterview`
- `createAppIdeaIntakeQuestion`
- `createAppIdeaIntakeAnswer`
- `buildDefaultAppIdeaIntakeQuestions`
- `summarizeAppIdeaIntake`
- `mapIntakeToMobileFactoryInput`
- `selectQuestionsByCategory`
- `selectRequiredQuestions`

All helpers are pure and metadata-only.

## Safety Boundaries

The phase is constrained by:

- source-only
- advisory-only
- metadata-only
- no chat automation
- no outbound messaging
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

## Mobile Factory Integration

The intake output becomes a safe seed for Mobile App Factory metadata:

- app idea
- user groups
- business goal
- platform priority
- supported app type
- core flows
- data summary
- offline needs
- auth needs
- monetization needs
- safety needs
- release target
- risk level
- approvals
- assumptions
- exclusions

## PM / SOLID / Autopilot Integration

The interview metadata can support:

- PM status reports
- task graph seed context
- DoD criteria
- risk and blocker review
- SOLID architecture review
- Autopilot handoff context
- dry-run scenarios
- phase closeout

It does not trigger Autopilot execution, persistent memory, provider operations, or git actions from source.

## Conversational Build Loop Readiness

This phase prepares the future path:

simple idea -> structured intake -> normalized answers -> Mobile App Factory strategy -> architecture, UX, navigation, state, offline, security, performance, testing, and release metadata -> future handoff prompt context.

It does not implement conversation automation, agent execution, prompt dispatch, or app generation.

## Limitations

- The model does not validate real user interviews.
- The model does not infer full requirements.
- The model does not generate UI, routes, code, app projects, or release assets.
- Human review remains required for sensitive data, payments, safety, privacy, public release, and unclear requirements.

## Next Phase

Recommended next phase:

Phase 132B - MOBILE REQUIREMENTS INTERVIEW PLAN
