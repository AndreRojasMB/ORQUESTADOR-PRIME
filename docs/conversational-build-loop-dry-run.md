# Conversational Build Loop Dry-Run

Status: source-only / advisory / metadata-only

## Purpose

PILOT-3I implements a controlled Conversational Build Loop dry-run as passive
metadata. It models how a simple mobile idea can become a reviewable artifact
chain and a human-gated Codex handoff prompt draft.

The implementation lives in:

- `src/autopilot/conversationalBuildLoopFixtures.ts`
- `src/autopilot/conversationalBuildLoopDryRun.ts`

It does not start Codex, create app artifacts, write project files from source,
call providers, mutate dashboards, persist memory, or perform external actions.

## Conversational Input Model

`ConversationalBuildLoopDryRunInput` records:

- `conversationDryRunId`
- `userIdeaText`
- `userIntent`
- `targetProjectType`
- `clarificationDepth`
- `assumedAnswers`
- `unresolvedQuestions`
- `safetyBoundaries`
- `safetyBoundaryLabels`
- `expectedArtifactChain`
- `riskLevel`
- `requiredApprovals`

The default fixture uses the habit-world app idea from the Mobile Factory first
dry-run:

> Quiero una app movil de habitos gamificada con mundo vivo, progreso,
> recordatorios y premium futuro.

## Loop Stage Model

`ConversationalBuildLoopStage` records:

- `stageId`
- `stageName`
- `inputRefs`
- `outputRefs`
- `requiredEvidence`
- `humanApprovalRequired`
- `canProceed`
- `blockers`
- `riskLevel`
- `limitations`

Required stages:

- `idea_intake`
- `requirements_interview`
- `feature_blueprints`
- `screen_blueprints`
- `api_contracts`
- `design_system`
- `quality_security_release`
- `store_readiness`
- `prompt_draft`
- `human_review`

Each stage is metadata-only and has `noExecution: true`.

## Artifact Chain Model

`ConversationalBuildLoopArtifactChain` records:

- artifact refs
- completed stages
- blocked stages
- unresolved questions
- next recommended artifact
- whether a prompt may be drafted as metadata
- whether a prompt may be used
- limitations
- source Mobile Factory artifact refs

The default chain keeps `safeToExecutePrompt` false.

## Prompt Draft Model

`ConversationalBuildLoopPromptDraft` records:

- target phase and mode
- project path and branch
- context summary
- allowed files
- forbidden files
- task
- boundaries
- verification plan
- smoke plan
- final report format
- `safeToUseForExecution: false`
- `requiresHumanApproval: true`

The prompt draft is a metadata object only. It is not a build instruction and
is not usable without a later human-approved phase.

## Success And Blocked Criteria

`evaluateConversationalBuildLoopSuccess(...)` passes only when:

- all required stages are present
- core intake, requirements, feature, and screen stages exist
- unresolved questions remain visible
- prompt draft exists
- prompt draft has boundaries
- prompt draft is not usable without approval
- high-risk stages have required approval metadata
- no external or runtime action is represented as complete

The evaluation blocks if:

- required stages are missing
- a stage has blockers
- the prompt draft is unsafe
- unresolved questions are hidden
- high-risk approval metadata is missing
- core artifact stages are absent

## Helpers

Implemented helpers:

- `createConversationalBuildLoopInput(...)`
- `createConversationalBuildLoopStage(...)`
- `createConversationalBuildLoopArtifactChain(...)`
- `createConversationalBuildLoopPromptDraft(...)`
- `runConversationalBuildLoopDryRun(...)`
- `summarizeConversationalBuildLoopDryRun(...)`
- `evaluateConversationalBuildLoopSuccess(...)`

The helpers are pure and operate only on static fixtures or caller-supplied
metadata.

## Mobile Factory Integration

The dry-run mirrors the Mobile Factory first dry-run chain:

idea -> intake -> requirements -> features -> screens -> API/design -> quality
-> release/store -> prompt draft metadata.

It can carry Mobile Factory artifact refs as passive evidence but does not
consume runtime state.

## Autopilot Integration

The implementation follows:

- Autopilot dry-run hardening quality-gate style
- Codex handoff draft shape as metadata
- validation and memory proposal review posture
- next-action recommendation posture
- closeout posture as metadata

It does not invoke Codex, persist memory, mutate source-control state from
source, call providers, or send outbound messages.

## Safety Boundaries

- source-only
- advisory-only
- metadata-only
- no Codex invocation
- no app creation
- no screen/component/route/backend creation
- no source-stage file writes
- no package or workflow changes
- no CI activation
- no Expo/EAS commands
- no providers
- no network/API calls
- no DB/SQL
- no dashboard mutation
- no memory persistence
- no source-control behavior from source
- no WhatsApp outbound
- no OpenClaw operation

## Limitations

- default scenario is a static fixture
- no real user interview is performed
- no implementation artifacts are created
- no runtime evidence is collected
- prompt draft metadata requires human review before any later use
- high-risk product assumptions remain unresolved until reviewed

## Next Recommended Phase

If smoke checks pass:

- PILOT-4B - Human-Approved Codex Prompt Handoff Plan

If future review blocks:

- Phase 141B - Roadmap Continuation Plan
