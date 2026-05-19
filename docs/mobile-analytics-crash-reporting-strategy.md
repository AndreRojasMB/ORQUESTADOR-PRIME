# Mobile Analytics / Crash Reporting Strategy

Phase: 138I - MOBILE ANALYTICS / CRASH REPORTING STRATEGY IMPLEMENTATION

Status: source-only / advisory / metadata-only

## Purpose

Mobile Analytics / Crash Reporting Strategy gives ORQUESTADOR-PRIME / Viernes
a typed metadata layer for future analytics and crash/error posture. It models
analytics goals, key metrics, event taxonomy, funnel candidates, crash/error
reporting posture, privacy, consent, redaction, retention, release monitoring,
recommendations, summaries, risks, approvals, and limitations before any real
mobile app target or telemetry provider exists.

The layer does not configure analytics SDKs, crash SDKs, providers, native
configuration, event collection, user identity tracking, network/API behavior,
credential material, app projects, Expo/EAS behavior, package manifests,
workflows, dashboards, database/schema assets, memory, or source-control
behavior from source.

## Implemented Source File

- `src/pm/mobileAnalyticsCrashStrategy.ts`

The file belongs in PM Core because it consumes mobile product, UX,
navigation, state, offline, security, performance, testing, release, and push
notification metadata as review context. It returns planning, risk, approval,
DoD, SOLID review, and Autopilot dry-run handoff context.

## Analytics Categories

Implemented advisory categories:

- `activation`
- `onboarding`
- `authentication`
- `navigation`
- `engagement`
- `retention`
- `monetization`
- `marketplace`
- `messaging`
- `gamification`
- `offline_sync`
- `performance`
- `crash`
- `non_fatal_error`
- `security_privacy`
- `release_monitoring`
- `unknown`

Categories are planning labels. They do not create tracking calls, provider
setup, runtime listeners, dashboards, or network behavior.

## Analytics Strategy Model

`MobileAnalyticsCrashStrategy` records:

- `strategyId`
- `appType`
- `analyticsGoals`
- `keyMetrics`
- `eventTaxonomy`
- `funnelCandidates`
- `crashReportingModels`
- `consentPosture`
- `identityPolicy`
- `redactionPolicy`
- `retentionPolicy`
- `riskLevel`
- `requiredApprovals`
- `limitations`

The strategy is metadata only. It does not create provider configuration,
native configuration, dashboards, event emitters, or runtime reporting.

## Event Model

`MobileAnalyticsEvent` records:

- `eventId`
- `eventName`
- `category`
- `sourceFeatureRef`
- `sourceScreenRef`
- `trigger`
- `purpose`
- `allowedProperties`
- `forbiddenProperties`
- `sensitiveDataAllowed`
- `consentRequired`
- `retentionHint`
- `riskLevel`
- `requiredApprovals`

Events are candidates for future human review. They do not collect data,
listen to runtime actions, or send telemetry.

## Funnel / Metric Model

`MobileAnalyticsFunnel` records:

- `funnelId`
- `funnelName`
- `appType`
- `steps`
- `successMetric`
- `dropOffSignals`
- `relatedEvents`
- `businessGoal`
- `riskLevel`
- `limitations`

Funnels describe future measurement posture for PM, DoD, testing, and release
readiness. They do not create dashboards or runtime measurements.

## Crash Reporting Model

`MobileCrashReportingModel` records:

- `crashModelId`
- `reportingScope`
- `errorCategories`
- `nonFatalPolicy`
- `crashGroupingPosture`
- `userContextPolicy`
- `breadcrumbsPolicy`
- `redactionPolicy`
- `releaseTrackingPolicy`
- `alertingPosture`
- `riskLevel`
- `requiredApprovals`
- `limitations`

Crash reporting models describe future review boundaries only. They do not set
up crash SDKs, providers, report delivery, alert rules, or release hooks.

## Helpers

Implemented pure helpers:

- `createMobileAnalyticsCrashStrategy`
- `createMobileAnalyticsEvent`
- `createMobileAnalyticsFunnel`
- `createMobileCrashReportingModel`
- `recommendMobileAnalyticsCrashStrategy`
- `summarizeMobileAnalyticsCrashStrategy`
- `selectAnalyticsEventsByCategory`
- `selectFunnelsByAppType`

All helpers operate only on caller-supplied metadata and static defaults.

## Privacy, Consent, And Redaction Posture

The implementation treats analytics and crash/error metadata as privacy
sensitive by default:

- consent is required for future product events unless explicitly reviewed
- sensitive data is blocked by default
- user identity remains abstract until human review
- raw input, sensitive payloads, and identity-adjacent values are forbidden
- retention is expressed as review-window metadata only
- high-risk events and crash/error models carry required approvals

## Safety Boundaries

The implementation preserves:

- source-only
- advisory-only
- metadata-only
- no analytics SDK setup
- no crash SDK setup
- no event tracking implementation
- no data collection
- no user identity tracking
- no provider execution
- no credential material access
- no network or API calls
- no app creation
- no Expo/EAS execution
- no package changes
- no native config changes
- no dashboard mutation
- no database or schema mutation
- no CI activation
- no memory persistence
- no git automation from source

## Security, Performance, Testing, And Release Integration

The strategy can feed:

- Mobile Security Baseline privacy, logging, consent, redaction, and data
  sensitivity review
- Mobile Performance Checklist future signal readiness and low-end device
  concerns
- Mobile Testing Strategy smoke, regression, release readiness, and QA
  evidence
- Mobile Release / EAS Strategy release monitoring, rollout, rollback, and
  readiness gates
- Mobile Push Notification Strategy consent, opt-out, segmentation, and safety
  posture

No SDKs, providers, event collection, crash reporting, dashboards, release
hooks, or app projects are configured.

## PM, SOLID, And Autopilot Integration

The metadata can support:

- PM reports
- task graph seeds
- DoD criteria
- risks and blockers
- privacy and release approval readiness
- SOLID/frontend/backend review context
- Autopilot handoff context
- dry-run scenarios
- phase closeout

Autopilot may carry this strategy as planning context only. It must not execute
Codex, persist memory, call providers, mutate dashboards, or perform
source-control behavior from source modules.

## Conversational Build Loop Readiness

The strategy prepares a future loop where a simple idea can become:

- feature and screen measurement questions
- privacy-safe event candidates
- funnel and metric posture
- crash/error review posture
- future release monitoring plan
- future Codex handoff prompt context

No conversational automation is implemented in Phase 138I.

## Limitations

- No analytics SDKs are configured.
- No crash SDKs are configured.
- No provider accounts or provider config are touched.
- No events are collected.
- No crash reports are collected or sent.
- No user identity tracking is implemented.
- No dashboards are created.
- No apps, native files, packages, workflows, database/schema assets, secrets,
  runtime behavior, network calls, memory writes, or source-control actions are
  added from source.
- Future implementation still requires human approval, privacy review, testing
  review, and release review.

## Next Phase

Recommended next phase:

**Phase 139B - STORE READINESS / APP METADATA PLAN**
