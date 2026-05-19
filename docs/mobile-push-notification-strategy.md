# Mobile Push Notification Strategy

Phase: 137I - MOBILE PUSH NOTIFICATION STRATEGY IMPLEMENTATION

Status: source-only / advisory / metadata-only

## Purpose

Mobile Push Notification Strategy gives ORQUESTADOR-PRIME / Viernes a typed
metadata layer for future mobile communication planning. It models permission
education, opt-in timing, channels, event candidates, consent posture, quiet
hours, frequency caps, route targets, privacy posture, safety posture,
recommendations, summaries, risks, approvals, and limitations before any real
mobile notification runtime exists.

The layer does not configure providers, platform services, native settings,
credential material, message dispatch, background runtime, app projects,
Expo/EAS behavior, package manifests, workflows, dashboards, database/schema
assets, memory, or source-control behavior from source.

## Implemented Source File

- `src/pm/mobilePushNotificationStrategy.ts`

The file belongs in PM Core because it consumes mobile product, UX, navigation,
state, offline, security, testing, and release metadata as review context. It
returns planning, risk, approval, DoD, SOLID review, and Autopilot dry-run
handoff context.

## Strategy Model

`MobilePushNotificationStrategy` records:

- `strategyId`
- `appType`
- `notificationGoals`
- `permissionEducationFlow`
- `optInTiming`
- `channels`
- `eventCandidates`
- `consentModels`
- `frequencyPolicy`
- `quietHoursPolicy`
- `deepLinkPolicy`
- `privacyPosture`
- `safetyPosture`
- `requiredApprovals`
- `riskLevel`
- `limitations`

The strategy is metadata only. It does not create provider configuration,
native configuration, schedules, workers, or app files.

## Channel Model

`MobileNotificationChannel` records:

- `channelId`
- `channelName`
- `purpose`
- `audience`
- `priority`
- `allowedEventTypes`
- `frequencyCap`
- `quietHoursEnabled`
- `optOutSupported`
- `requiredConsent`
- `riskLevel`

Channels describe future communication categories only.

## Event Model

`MobileNotificationEvent` records:

- `eventId`
- `eventName`
- `triggerType`
- `sourceFeatureRef`
- `targetRouteRef`
- `messagePurpose`
- `templateLabel`
- `personalizationAllowed`
- `sensitiveDataAllowed`
- `deliveryUrgency`
- `fallbackBehavior`
- `riskLevel`
- `requiredApprovals`

Events are candidates for future human review. They do not trigger delivery,
register listeners, or create background behavior.

## Consent Model

`MobileNotificationConsentModel` records:

- `consentModelId`
- `permissionType`
- `educationScreenRef`
- `optInTrigger`
- `optOutPath`
- `rePromptPolicy`
- `consentEvidence`
- `privacyNote`
- `riskLevel`

Consent metadata makes permission education, opt-in timing, opt-out paths, and
privacy evidence explicit before implementation.

## Notification Categories

Implemented categories:

- `permission_education`
- `opt_in`
- `reminder`
- `transactional`
- `social`
- `marketplace`
- `gamification_progress`
- `safety_trust`
- `monetization`
- `system_status`
- `offline_sync`
- `release_future`
- `analytics_future`
- `unknown`

## Helpers

Implemented pure helpers:

- `createMobilePushNotificationStrategy`
- `createMobileNotificationChannel`
- `createMobileNotificationEvent`
- `createMobileNotificationConsentModel`
- `recommendMobilePushNotificationStrategy`
- `summarizeMobilePushNotificationStrategy`
- `selectNotificationChannelsByPurpose`
- `selectNotificationEventsByTrigger`

All helpers operate only on caller-supplied metadata and static defaults.

## Safety Boundaries

The implementation preserves:

- source-only
- advisory-only
- metadata-only
- no push provider setup
- no platform notification config
- no named provider config
- no credential use
- no native config changes
- no message dispatch
- no background runtime
- no app creation
- no Expo/EAS execution
- no package changes
- no provider calls
- no runtime execution
- no dashboard mutation
- no database or schema mutation
- no secrets/env/network
- no CI activation
- no memory persistence
- no git automation from source

## UX And Navigation Integration

The strategy can feed:

- permission education UX,
- opt-in timing review,
- settings and opt-out routes,
- route refs for future deep-link review,
- fallback states when permission is declined,
- quiet-hours and frequency messaging,
- accessibility review for education copy.

No routes or screens are created.

## Security And Privacy Integration

The strategy can feed:

- privacy review,
- sensitive preview suppression,
- consent evidence,
- safety escalation review,
- abuse and spam prevention,
- high-risk template approval,
- permission-denied fallback review.

It does not touch secrets, credential material, provider accounts, platform
services, or native configuration.

## Testing And Release Integration

The strategy can feed:

- testing smoke-flow candidates,
- permission-denied QA,
- opt-out QA,
- quiet-hours review,
- release readiness gates,
- platform policy review,
- rollout and rollback posture.

It does not run tests, activate CI, create release artifacts, or execute mobile
commands.

## PM / SOLID / Autopilot Integration

The metadata can support:

- PM reports,
- DoD criteria,
- risks and blockers,
- approval readiness,
- SOLID/frontend/backend review context,
- Autopilot handoff context,
- dry-run scenarios,
- phase closeout.

Autopilot may carry this strategy as planning context only. It must not invoke
providers, dispatch messages, persist memory, mutate dashboards, or perform
source-control behavior from source modules.

## Conversational Build Loop Readiness

This phase prepares a future loop:

idea intake -> requirements -> feature and screen blueprints -> notification
strategy -> future analytics and crash reporting planning -> future handoff
prompt context.

Phase 137I does not add conversational automation, provider setup, message
dispatch, app creation, or agent execution.

## Limitations

- No push provider setup exists.
- No platform service setup exists.
- No native notification configuration exists.
- No credential material is read or written.
- No message dispatch exists.
- No background runtime exists.
- No app project is created.
- Channel and event values are advisory labels, not production configuration.
- Privacy, safety, release, and platform policy posture still require human
  review before implementation.

## Next Phase

Recommended next phase:

**Phase 138B - Mobile Analytics / Crash Reporting Strategy Plan**

That phase should plan source-only analytics and crash reporting metadata
without providers, app changes, native config, credential material, package
changes, runtime execution, dashboards, database/schema changes, or mobile
commands.
