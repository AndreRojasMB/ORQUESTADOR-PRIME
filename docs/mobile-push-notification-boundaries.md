# Mobile Push Notification Boundaries

Phase: 137B - MOBILE PUSH NOTIFICATION STRATEGY PLAN

Status: planning / docs-only / safety boundary definition

## Boundary Summary

Mobile Push Notification Strategy is allowed to describe future communication
metadata. It is not allowed to configure any real notification provider,
platform service, native setting, app runtime, or message dispatch path.

This keeps ORQUESTADOR-PRIME / Viernes advisory-first while preparing a safer
future permission and communication plan.

## Allowed In Phase 137B

Phase 137B may add documentation that defines:

- future strategy metadata,
- future channel metadata,
- future event candidate metadata,
- future permission and consent metadata,
- quiet hours and frequency posture,
- privacy and safety posture,
- abuse prevention posture,
- release readiness posture,
- integration with mobile planning layers,
- verification expectations for Phase 137I.

## Not Allowed In Phase 137B

Phase 137B must not add:

- provider setup,
- platform service setup,
- native notification configuration,
- credential material access,
- message dispatch behavior,
- background worker runtime,
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

## Future 137I Allowed Scope

Future Phase 137I may add source-only TypeScript metadata:

- `MobilePushNotificationStrategy`,
- `MobilePushNotificationInput`,
- `MobileNotificationChannel`,
- `MobileNotificationEvent`,
- `MobileNotificationConsentModel`,
- `MobileNotificationRecommendation`,
- `MobileNotificationSummary`.

The implementation should export pure helpers that create, summarize, select,
and map metadata.

## Future 137I Disallowed Scope

Future Phase 137I must still not add:

- provider setup,
- platform service configuration,
- native notification configuration,
- credential material,
- message dispatch runtime,
- background worker runtime,
- app generation,
- Expo/EAS commands,
- package changes,
- providers,
- dashboard mutation,
- database or schema changes,
- CI activation,
- memory writes,
- git behavior from source.

## Safety Flags To Preserve

Future metadata should preserve explicit flags for:

- `sourceOnly`,
- `advisoryOnly`,
- `metadataOnly`,
- `noPushProviderSetup`,
- `noPlatformNotificationConfig`,
- `noCredentialUse`,
- `noNativeConfigChanges`,
- `noNotificationDispatch`,
- `noBackgroundRuntime`,
- `noAppGeneration`,
- `noExpoEasExecution`,
- `noPackageChanges`,
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

- permission timing is unclear,
- message purpose may be promotional or sensitive,
- personalization uses personal or sensitive data,
- deep-link targets cross auth, paywall, safety, or role gates,
- quiet hours exceptions are requested,
- frequency caps may become intrusive,
- user segmentation could feel discriminatory or unsafe,
- release readiness depends on platform policy review.

## Scope Safety Gates

Before Phase 137I closeout, verification should confirm:

- only allowed source/docs/test files changed,
- no provider config was added,
- no native config changed,
- no app folders were created,
- no package or workflow changed,
- no message dispatch path exists,
- no background worker runtime exists,
- no provider, dashboard, runtime, database, schema, secret, CI, or memory
  surface changed,
- no source helper can execute mobile tooling or source-control behavior.

## Forbidden Action Gate

The future implementation should prefer advisory wording:

- "describe",
- "record",
- "map",
- "recommend",
- "review",
- "future-gated",
- "human-approved later".

It should avoid claiming that the module configures providers, dispatches
messages, creates platform channels, starts background workers, writes app
files, or executes agents.

## Verification Expectations

For Phase 137B:

- `git status --short --branch`,
- `git diff --stat`,
- `git diff --name-only`,
- `git diff --check`,
- `node node_modules/typescript/bin/tsc --noEmit` when available.

For Phase 137I:

- typecheck,
- optional smoke script,
- forbidden grep,
- staged-file scope check,
- no package, workflow, app, provider, dashboard, runtime, database, schema,
  secret, CI, memory, or mobile tooling changes.
