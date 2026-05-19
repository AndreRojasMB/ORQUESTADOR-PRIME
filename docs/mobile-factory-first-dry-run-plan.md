# Mobile Factory First Dry-Run Plan

Status: source-only / advisory / metadata-only

## Purpose

This document plans the first controlled Mobile Factory dry-run for a simple
mobile app idea. Phase 140B does not run the dry-run. It defines the scenario,
future input metadata, future output metadata, expected artifact chain, success
criteria, limitations, and safety boundaries for a later implementation phase.

## Scenario

Idea fixture:

> Quiero una app movil de habitos gamificada con mundo vivo, progreso,
> recordatorios y premium futuro.

The scenario is intentionally broad enough to exercise:

- habit and gamification features
- onboarding and dashboard flows
- reminders and notification consent posture
- premium future scope
- state/offline/progress persistence posture
- analytics and release readiness posture
- store readiness and privacy/rating posture

## Future Dry-Run Input Model

```ts
interface MobileFactoryDryRunInput {
  dryRunId: string;
  ideaText: string;
  targetUser: string;
  expectedAppType: string;
  expectedCoreFlows: readonly string[];
  expectedMvpScope: readonly string[];
  safetyBoundaries: readonly string[];
  expectedArtifacts: readonly string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  requiredApprovals: readonly string[];
}
```

## Planned Input Fixture

- `dryRunId`: `mobile_factory_dry_run:habit_world_v1`
- `ideaText`: habit app with living world, progress, reminders, and future
  premium scope
- `targetUser`: person trying to build better daily routines with motivation
- `expectedAppType`: gamified habit / productivity mobile app
- `expectedCoreFlows`:
  - onboarding and goal setup
  - habit creation
  - daily check-in
  - progress/world growth
  - reminder preference review
  - premium preview as future scope
- `expectedMvpScope`:
  - onboarding
  - habit list
  - habit check-in
  - progress dashboard
  - basic settings
- `expectedArtifacts`:
  - intake summary
  - requirements summary
  - feature blueprint summary
  - screen blueprint summary
  - API contract candidate summary
  - design system summary
  - state/offline/security/performance/testing/release/store summaries
  - prompt draft metadata only
- `riskLevel`: medium
- `requiredApprovals`:
  - PM scope review
  - privacy and consent review
  - behavioral safety review
  - release readiness review

## Future Dry-Run Output Model

```ts
interface MobileFactoryDryRunOutput {
  outputId: string;
  intakeSummary: string;
  requirementsSummary: string;
  featureBlueprintSummary: string;
  screenBlueprintSummary: string;
  apiContractSummary: string;
  designSystemSummary: string;
  qualitySummary: string;
  releaseStoreSummary: string;
  unresolvedQuestions: readonly string[];
  recommendedNextArtifact: string;
  safeToGenerateCodexPrompt: boolean;
  promptDraftMetadataOnly: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  requiredApprovals: readonly string[];
}
```

## Expected Artifact Chain

The future dry-run should simulate this passive chain:

1. App Idea Intake output
2. Mobile Requirements output
3. Feature Blueprints
4. Screen Blueprints
5. API Contract candidates
6. Design System blueprint
7. State/offline/security/performance/testing/release/store metadata
8. Final PM/SOLID/Autopilot summary
9. Next Codex prompt draft as metadata only

No stage may write app files, start mobile tooling, call providers, or use the
prompt draft to begin implementation.

## Expected Output Notes

The first dry-run should surface:

- likely app type: habit / gamified productivity
- MVP flows: onboarding, habit tracking, progress dashboard, settings
- Beta flows: richer world progress, streak recovery, advanced reminders
- Release scope: privacy disclosure, release gates, store readiness
- risks: habit-loop pressure, notification consent, premium copy, progress data
- unresolved questions: account model, offline conflict posture, monetization
  rules, health/safety boundaries, data retention expectations
- recommended next artifact: mobile factory review / first dry-run report

## Success Criteria

The dry-run plan is successful if 140I can later prove that:

- a simple idea can be normalized into intake metadata
- requirements can be derived without runtime behavior
- feature and screen summaries can be grouped by MVP/Beta/Release
- API/design/state/offline/security/testing/release/store summaries are present
- unresolved questions are explicit
- risks and approvals are preserved
- prompt draft metadata remains passive
- no implementation work is triggered

## Limitations

- the fixture is synthetic and does not represent validated market research
- dry-run summaries are advisory and may be incomplete
- no mobile target exists for real QA or release checks
- no UI, backend, provider, store, or runtime behavior is created
- prompt draft metadata is not a permission to start build work

## Safety Boundaries

- source-only
- advisory-only
- metadata-only
- no dry-run execution in 140B
- no mobile app creation
- no screen creation
- no component creation
- no route creation
- no backend creation
- no endpoint creation
- no Codex run
- no Expo/EAS commands
- no store interaction
- no providers
- no secret material
- no network/API calls
- no DB/SQL
- no dashboard mutation
- no CI activation
- no memory persistence
- no source-controlled automation behavior

## Future Implementation Split

Phase 140I may implement:

- source-only review metadata
- source-only dry-run fixture metadata
- passive summary helpers
- smoke tests that validate the metadata chain
- docs for the review and dry-run result

Optional next phase after 140I:

- Phase PILOT-3B - Conversational Build Loop Dry-Run Plan
