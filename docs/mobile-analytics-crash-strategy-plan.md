# Mobile Analytics / Crash Reporting Strategy Plan

Phase: 138B - MOBILE ANALYTICS / CRASH REPORTING STRATEGY PLAN

Status: source-only / advisory / metadata-only planning

## Purpose

This plan defines the future Mobile Analytics / Crash Reporting Strategy layer
for ORQUESTADOR-PRIME / Viernes. The layer will model product analytics,
event taxonomy, funnel and metric posture, crash/error reporting posture,
privacy and consent posture, redaction, release monitoring readiness, and
alerting readiness before any real mobile app target or telemetry provider
exists.

Phase 138B is planning only. It does not configure analytics SDKs, crash SDKs,
providers, native config, data collection, user identity tracking, dashboards,
database/schema assets, app projects, Expo/EAS behavior, package manifests,
workflow automation, memory, or source-control behavior.

## Scope

The future strategy should describe:

- product analytics posture for activation, engagement, retention, conversion,
  monetization, offline/sync, safety, and release monitoring
- event taxonomy with allowed properties, forbidden properties, consent needs,
  retention hints, feature refs, and screen refs
- funnel tracking posture for onboarding, auth, marketplace, messaging,
  monetization, gamification, and other app-specific journeys
- key metrics for activation, retention, engagement, conversion, performance,
  non-fatal error review, and release monitoring
- crash reporting posture for fatal errors, recoverable errors, grouping,
  user context limits, breadcrumb limits, redaction, and alerting readiness
- privacy posture for consent, minimal properties, sensitive field blocking,
  user identity limits, and retention review
- release readiness posture for version-aware monitoring and human approval
  gates

## Future Metadata Files

The implementation phase should likely add:

- `src/pm/mobileAnalyticsCrashStrategy.ts`
- `docs/mobile-analytics-crash-reporting-strategy.md`
- optional `scripts/mobile-analytics-crash-strategy-tests.ts`

It should also update `src/pm/index.ts` exports if the TypeScript source file
is added.

## Analytics Categories

The future implementation should include these categories:

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

Categories are labels for future review. They must not create tracking calls,
provider setup, runtime listeners, dashboard config, or network behavior.

## Analytics Strategy Model

Future `MobileAnalyticsCrashStrategy` metadata should record:

- `strategyId`
- `appType`
- `analyticsGoals`
- `keyMetrics`
- `eventTaxonomy`
- `funnelCandidates`
- `consentPosture`
- `identityPolicy`
- `redactionPolicy`
- `retentionPolicy`
- `riskLevel`
- `requiredApprovals`
- `limitations`

The strategy should also include summary and recommendation metadata, consumed
mobile artifact refs, PM/SOLID/Autopilot context, and explicit safety
boundaries.

## Analytics Event Model

Future `MobileAnalyticsEvent` metadata should record:

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

Events must remain candidates. They should describe what evidence future
implementation needs before any data collection is approved.

## Funnel / Metric Model

Future `MobileAnalyticsFunnel` or `MobileAnalyticsMetric` metadata should
record:

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

Funnels should connect feature and screen blueprints to PM goals, DoD criteria,
risk review, and release readiness. They must not create dashboards or runtime
measurement.

## Crash Reporting Model

Future `MobileCrashReportingModel` metadata should record:

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

Crash reporting metadata should define review posture only. It must not install
SDKs, create provider config, capture runtime data, or send reports.

## Integration Plan

The future strategy should consume or reference:

- Mobile App Factory app type, users, goals, safety needs, and release target
- UX/UI Pattern Catalog screen states and recovery paths
- Navigation Flow Model route refs, guards, and fallback routes
- Mobile State Management state ownership and error/loading/offline states
- Offline / Cache / Sync strategy freshness, retry, conflict, and recovery
  posture
- Mobile Security Baseline privacy, logging, redaction, auth/session, and data
  sensitivity posture
- Mobile Performance Checklist metrics readiness and low-end device concerns
- Mobile Testing Strategy smoke flows, release readiness, and QA evidence
- Mobile Release / EAS Strategy release gates and monitoring posture
- Mobile Push Notification Strategy consent, opt-out, segmentation, and safety
  posture

## PM / SOLID / Autopilot Usage

The strategy should feed:

- PM report sections for measurement goals, risks, and approvals
- task graph seeds for analytics and crash readiness work
- DoD criteria for privacy-safe instrumentation review
- risks and blockers for sensitive data, consent, release monitoring, and
  alerting gaps
- SOLID/frontend/backend review context for keeping measurement boundaries
  separate from product and runtime logic
- Autopilot handoff context and dry-run scenarios as advisory metadata only
- phase closeout evidence for future 138I

## Conversational Build Loop Readiness

This plan prepares the path:

idea intake -> requirements -> feature/screen blueprints -> analytics/crash
strategy -> future release/monitoring plan -> future Codex handoff prompt.

Phase 138B does not implement conversational automation, provider setup, event
collection, crash SDK setup, Codex execution, or app generation.

## Future Implementation Split

- Phase 138I - MOBILE ANALYTICS / CRASH REPORTING STRATEGY IMPLEMENTATION
- Phase 139B - STORE READINESS / APP METADATA PLAN

## Exit Criteria For 138B

- Planning documents exist and are docs-only.
- Models and categories are specified for 138I.
- Safety boundaries remain explicit.
- Verification confirms no source, provider, package, app, workflow, dashboard,
  database/schema, secret, network, memory, or source-control side effects.
