# Mobile Factory First Dry-Run

Status: source-only / advisory / metadata-only

## Purpose

Phase 140I implements the first controlled Mobile Factory dry-run as passive
fixture metadata. It proves the 121-139 stack can carry a simple idea through
intake, requirements, features, screens, API/design/quality/release/store
summaries, unresolved questions, and a prompt draft that remains metadata only.

The implementation lives in `src/pm/mobileFactoryDryRun.ts`.

## Controlled App Idea Scenario

Default idea:

> Quiero una app movil de habitos gamificada con mundo vivo, progreso,
> recordatorios y premium futuro.

Default app type:

- `habit_gamified_app`

Default target user:

- person trying to build better daily routines with clear motivation and
  progress feedback

## Dry-Run Input Model

`MobileFactoryDryRunInput` records:

- `dryRunId`
- `ideaText`
- `targetUser`
- `expectedAppType`
- `expectedCoreFlows`
- `expectedMvpScope`
- `safetyBoundaries`
- `expectedArtifacts`
- `riskLevel`
- `requiredApprovals`

The default input includes onboarding, habit creation, daily check-in, living
world progress, reminder preference review, and future premium preview.

## Dry-Run Output Model

`MobileFactoryDryRunOutput` records:

- `outputId`
- `intakeSummary`
- `requirementsSummary`
- `featureBlueprintSummary`
- `screenBlueprintSummary`
- `apiContractSummary`
- `designSystemSummary`
- `qualitySummary`
- `releaseStoreSummary`
- `unresolvedQuestions`
- `recommendedNextArtifact`
- `safeToGenerateCodexPrompt`
- `promptDraftMetadataOnly`
- `riskLevel`
- `requiredApprovals`
- `artifactChain`
- `safetyBoundaries`

`safeToGenerateCodexPrompt` is `false` by default. The prompt draft exists only
for review metadata and cannot start implementation work.

## Artifact Chain

`MobileFactoryDryRunArtifactChain` represents the expected passive chain:

1. App Idea Intake output
2. Mobile Requirements output
3. Feature Blueprints
4. Screen Blueprints
5. API Contract candidates
6. Design System blueprint
7. State/offline/security/performance/testing metadata
8. Release and store readiness metadata
9. Next prompt draft metadata

Each artifact is marked `simulated` and includes limitations confirming no
runtime behavior or project file creation.

## Prompt Draft Metadata

`MobileFactoryDryRunPromptDraft` stores:

- prompt draft id
- title
- purpose
- metadata-only body lines
- `safeToUseForExecution: false`
- required approvals before use
- limitations
- safety boundaries

The draft is not a build instruction. It is a future handoff review artifact.

## Success Evaluation

`evaluateMobileFactoryDryRunSuccess(...)` passes only when:

- the artifact chain has the expected breadth
- all artifacts are simulated
- the prompt draft is not usable for execution
- `safeToGenerateCodexPrompt` remains false
- source safety flags confirm no file writes, no app generation, and no Codex run

## Helpers

Implemented helpers:

- `createMobileFactoryDryRunInput(...)`
- `runMobileFactoryFirstDryRun(...)`
- `summarizeMobileFactoryDryRun(...)`
- `buildMobileFactoryDryRunPromptDraft(...)`
- `evaluateMobileFactoryDryRunSuccess(...)`
- `createDefaultMobileFactoryDryRunScenario(...)`

All helpers are pure and operate on static fixtures or caller-provided
metadata.

## Safety Boundaries

- source-only
- advisory-only
- metadata-only
- no file writes from source
- no code generation
- no app generation
- no screen generation
- no backend generation
- no endpoint generation
- no Codex run
- no provider calls
- no network
- no dashboard mutation
- no memory persistence
- no source-controlled automation behavior

## Known Limitations

- scenario is synthetic
- summaries are advisory and not real product validation
- no mobile project target exists
- no route, screen, component, backend, provider, store, or release runtime exists
- prompt draft metadata cannot be used without a separate approved phase

## Conversational Build Loop Readiness

This dry-run proves the metadata path:

simple idea -> intake -> requirements -> features -> screens -> API/design ->
quality -> release/store -> prompt draft metadata.

It does not automate conversation, run agents, start Codex, write app files, or
perform external side effects.

## Recommendation After 140I

If the review and dry-run smoke checks pass, the recommended next phase is:

- Phase PILOT-3B - Conversational Build Loop Dry-Run Plan

If future review status becomes blocked, the safer next phase is:

- Phase 141B - Roadmap Continuation Plan
