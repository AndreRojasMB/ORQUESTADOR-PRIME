# Mobile Design System Boundaries

Phase: 136B - MOBILE DESIGN SYSTEM BLUEPRINT PLAN

Status: planning / docs-only / safety boundary definition

## Boundary Summary

Mobile Design System Blueprint is allowed to describe future visual system
metadata. It is not allowed to implement visual system assets or runtime UI.

The boundary exists to keep ORQUESTADOR-PRIME / Viernes advisory-first while
preparing a richer mobile design handoff.

## Allowed In Phase 136B

Phase 136B may add documentation that defines:

- future design token metadata,
- future component blueprint metadata,
- future layout blueprint metadata,
- future theme metadata,
- visual state variant posture,
- accessibility visual rules,
- motion and reduced-motion posture,
- brand and style constraints,
- design consistency rules,
- integration with mobile planning layers,
- verification expectations for Phase 136I.

## Not Allowed In Phase 136B

Phase 136B must not add:

- React Native component files,
- screen files,
- route files,
- style files,
- design asset files,
- native styling configuration,
- app folders,
- package changes,
- workflow changes,
- provider calls,
- runtime execution,
- dashboard mutation,
- database or schema changes,
- CI behavior,
- memory persistence,
- source-control automation from source.

## Future 136I Allowed Scope

Future Phase 136I may add source-only TypeScript metadata:

- `MobileDesignSystemBlueprint`,
- `MobileDesignSystemInput`,
- `MobileDesignToken`,
- `MobileComponentBlueprint`,
- `MobileLayoutBlueprint`,
- `MobileThemeBlueprint`,
- `MobileDesignSystemRecommendation`,
- `MobileDesignSystemSummary`.

The implementation should export pure helpers that build, summarize, filter,
and map metadata. It should not read or write external systems.

## Future 136I Disallowed Scope

Future Phase 136I must still not add:

- component implementation,
- screen implementation,
- route implementation,
- style implementation,
- generated assets,
- native config,
- Expo/EAS commands,
- package changes,
- credentials,
- providers,
- runtime execution,
- dashboard changes,
- database or schema changes,
- CI activation,
- memory writes,
- git behavior from source.

## Safety Flags To Preserve

Future metadata should preserve explicit flags for:

- `sourceOnly`,
- `advisoryOnly`,
- `metadataOnly`,
- `noUiComponentGeneration`,
- `noScreenGeneration`,
- `noStyleFileGeneration`,
- `noNativeStylingConfig`,
- `noDesignAssetGeneration`,
- `noAppGeneration`,
- `noExpoEasExecution`,
- `noPackageChanges`,
- `noCredentialUse`,
- `noProviderCalls`,
- `noRuntimeExecution`,
- `noDashboardMutation`,
- `noDbSqlMutation`,
- `noCiActivation`,
- `noMemoryPersistence`,
- `noGitAutomationFromSource`.

The `noDbSqlMutation` flag name should remain a source metadata flag only. It
must not imply any database or schema action.

## Human Review Boundaries

Human review should be required when:

- brand direction is unclear,
- accessibility contrast is unknown,
- motion may affect usability,
- dark mode introduces contrast risk,
- monetization, safety, or sensitive data surfaces affect visual hierarchy,
- platform-specific patterns could conflict with iOS or Android expectations,
- component density or touch targets may reduce usability,
- implementation hints could be mistaken for runnable UI work.

## Scope Safety Gates

Before Phase 136I closeout, verification should confirm:

- only allowed source/docs/test files changed,
- no component files were added,
- no screen files were added,
- no style files were added,
- no app folders were created,
- no native config changed,
- no package or workflow changed,
- no provider, dashboard, runtime, database, schema, secret, CI, or memory
  surface changed,
- no source helper can execute mobile tooling or source-control behavior.

## Forbidden Action Gate

The future implementation should avoid action language that can be mistaken for
runtime work. It should prefer:

- "describe",
- "record",
- "map",
- "recommend",
- "review",
- "future-gated",
- "human-approved later".

It should avoid claiming that the module creates UI, writes styling, exports
assets, invokes mobile commands, starts apps, or executes agents.

## Verification Expectations

For Phase 136B:

- `git status --short --branch`,
- `git diff --stat`,
- `git diff --name-only`,
- `git diff --check`,
- `node node_modules/typescript/bin/tsc --noEmit` when available.

For Phase 136I:

- typecheck,
- optional smoke script,
- forbidden grep,
- staged-file scope check,
- no package, workflow, app, provider, dashboard, runtime, database, schema,
  secret, CI, memory, or mobile tooling changes.
