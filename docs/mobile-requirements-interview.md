# Mobile Requirements Interview

Phase: 132I - MOBILE REQUIREMENTS INTERVIEW IMPLEMENTATION

Status: source-only / advisory / metadata-only

## Purpose

Mobile Requirements Interview turns App Idea Intake metadata into structured
mobile requirements before any blueprint, implementation, app generation, or
mobile tooling work is considered. It captures functional requirements,
non-functional requirements, UX, data, security, monetization, testing, release
needs, and MVP/Beta/Release scope as passive planning metadata.

The layer does not automate chat, perform outbound messaging, use WhatsApp,
invoke Codex, generate apps, run Expo/EAS tooling, call providers, mutate
dashboards, touch DB/SQL, read secrets, activate CI, or persist memory.

## Implemented Source File

- `src/pm/mobileRequirementsInterview.ts`

The file belongs in PM Core because it consumes App Idea Intake metadata and
returns requirement candidates, artifact mappings, risk, approvals, summary,
DoD context, task graph context, SOLID review context, and Autopilot dry-run
handoff context.

## Interview Model

`MobileRequirementsInterview` records:

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

The interview also carries:

- `questions`
- `answers`
- `requirementCandidates`
- `output`
- `recommendation`
- `summary`
- `safetyBoundaries`

## Question Model

`MobileRequirementQuestion` records:

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

Implemented categories:

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

## Answer Model

`MobileRequirementAnswer` records:

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

Answers remain passive metadata and do not trigger runtime behavior.

## Requirement Candidate Model

`MobileRequirementCandidate` records:

- `requirementId`
- `title`
- `category`
- `description`
- `priority`
- `sourceAnswerRefs`
- `targetMobileArtifacts`
- `riskLevel`
- `requiredApprovals`
- `mvpRelevant`
- `betaRelevant`
- `releaseRelevant`
- `unresolved`

Candidates can later feed PM tasks, DoD criteria, risks, blockers, architecture
review, and feature blueprint planning.

## Output Mapping

`mapRequirementsToMobileArtifacts(...)` maps requirement candidates to:

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
- PM reports
- task graph
- DoD criteria
- risks/blockers
- Autopilot handoff context

The mapping is conceptual and advisory. It does not generate routes, screens,
stores, APIs, tests, release files, prompts, agents, or source-control actions.

## Helpers

Implemented pure helpers:

- `createMobileRequirementsInterview`
- `createMobileRequirementQuestion`
- `createMobileRequirementAnswer`
- `createMobileRequirementCandidate`
- `buildDefaultMobileRequirementQuestions`
- `summarizeMobileRequirements`
- `mapRequirementsToMobileArtifacts`
- `selectRequirementQuestionsByCategory`
- `selectRequiredRequirementQuestions`

All helpers return metadata only.

## Safety Boundaries

The implementation preserves:

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

Mobile Requirements Interview refines the output of App Idea Intake before it
feeds Mobile App Factory and the mobile planning stack. It can clarify:

- target users
- roles and permissions
- core workflows
- MVP feature scope
- data and sensitivity posture
- auth/session posture
- offline and sync needs
- safety/privacy needs
- monetization posture
- testing and release readiness needs

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

This phase prepares the future path:

idea intake -> requirements interview -> normalized requirements -> MVP/Beta
scope -> mobile architecture/UX/navigation/state/security/testing/release
metadata -> future feature blueprint planning.

It does not automate conversation, run agents, dispatch prompts, or generate an
app.

## Limitations

- The model does not perform live interviews.
- The model does not verify requirements with users.
- The model does not create implementation tasks automatically.
- The model does not generate mobile code, screens, app folders, native files,
  package changes, workflow changes, or release artifacts.
- Human review remains required for sensitive, regulated, monetized, public
  release, or low-confidence requirements.

## Next Phase

Recommended next phase:

Phase 133B - MOBILE FEATURE BLUEPRINT GENERATOR PLAN
