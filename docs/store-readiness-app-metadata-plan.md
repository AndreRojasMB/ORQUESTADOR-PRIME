# Store Readiness / App Metadata Plan

Phase: 139B - STORE READINESS / APP METADATA PLAN

Status: source-only / advisory / metadata-only planning

## Purpose

This plan defines the future Store Readiness / App Metadata layer for
ORQUESTADOR-PRIME / Viernes. The layer will model future listing metadata,
privacy labels, ratings, screenshot and preview posture, brand asset posture,
support/contact posture, release notes, compliance review, and readiness gates
before any real mobile app, store account, artifact, or publication workflow
exists.

Phase 139B is planning only. It does not interact with store consoles, produce
screenshots, produce preview media, produce brand assets, access credential
material, submit apps, generate apps, run Expo/EAS behavior, modify packages,
activate workflows, call providers, mutate dashboards, touch database/schema
assets, read secrets or environment values, persist memory, or perform
source-control behavior from source.

## Store Readiness Scope

The future strategy should describe:

- app name and title posture
- subtitle and short description posture
- full description posture
- keywords and search metadata
- app category posture
- target audience and value proposition
- screenshot and preview media posture
- icon and brand asset posture
- privacy labels
- permission disclosure
- content rating posture
- age rating posture
- data collection disclosure
- analytics/crash disclosure
- support and contact metadata
- release notes posture
- review readiness
- store compliance notes

All items remain advisory metadata. They do not produce listing files, assets,
screenshots, accounts, submissions, or release artifacts.

## Future Metadata Files

The implementation phase should likely add:

- `src/pm/storeReadinessAppMetadata.ts`
- `docs/store-readiness-app-metadata.md`
- optional `scripts/store-readiness-app-metadata-tests.ts`

It should also update `src/pm/index.ts` exports if the TypeScript source file
is added.

## Store Readiness Categories

The future implementation should include:

- `app_identity`
- `description_copy`
- `keywords_search`
- `screenshots_preview`
- `icon_brand`
- `privacy_labels`
- `permissions_disclosure`
- `age_content_rating`
- `analytics_crash_disclosure`
- `support_contact`
- `release_notes`
- `compliance_review`
- `human_approval`

Categories are planning labels for future review. They do not produce assets,
publish listings, interact with stores, or run mobile tooling.

## Store Metadata Model

Future `StoreReadinessAppMetadata` should record:

- `storeMetadataId`
- `appType`
- `appName`
- `subtitle`
- `shortDescription`
- `fullDescription`
- `keywords`
- `category`
- `targetAudience`
- `valueProposition`
- `screenshotsPosture`
- `previewVideoPosture`
- `iconPosture`
- `supportUrlPosture`
- `marketingUrlPosture`
- `riskLevel`
- `requiredApprovals`
- `limitations`

The model should also include checklist, privacy/rating, recommendation,
summary, integration notes, and explicit safety boundaries.

## Privacy / Rating Model

Future `StorePrivacyRatingModel` should record:

- `privacyRatingId`
- `dataCollectionCategories`
- `sensitiveDataCategories`
- `analyticsDisclosure`
- `crashDisclosure`
- `trackingDisclosure`
- `permissionsDisclosure`
- `ageRatingPosture`
- `contentRatingPosture`
- `complianceNotes`
- `humanReviewRequired`
- `riskLevel`

Privacy and rating metadata should be derived from security, analytics/crash,
push notification, testing, and release metadata. It must remain review
posture only.

## Readiness Checklist Model

Future `StoreReadinessChecklistItem` should record:

- `checklistItemId`
- `category`
- `title`
- `requiredEvidence`
- `blockingSeverity`
- `relatedSecurityChecks`
- `relatedAnalyticsChecks`
- `relatedReleaseChecks`
- `humanApprovalRequired`
- `riskLevel`

Checklist items should become PM and DoD evidence for a later release-prep
phase. They must not enforce CI gates or publish anything.

## Integration Plan

The future strategy should consume or reference:

- Mobile App Factory app type, target users, value proposition, safety needs,
  monetization needs, and release target
- Mobile Release / EAS Strategy release readiness, channels, versioning,
  release notes, rollout, rollback, and approval gates
- Mobile Security Baseline data sensitivity, privacy posture, permissions,
  auth/session posture, and compliance advisory posture
- Mobile Analytics / Crash Strategy analytics disclosure, crash disclosure,
  consent, retention, and redaction posture
- Mobile Testing Strategy smoke flows, release readiness, accessibility, and
  human review evidence
- Mobile Performance Checklist low-end device concerns and release readiness
  posture
- Mobile Push Notification Strategy permission education, opt-in/opt-out,
  consent, safety, and communication posture

## PM / SOLID / Autopilot Usage

The future layer should feed:

- PM report sections for listing readiness and compliance gaps
- task graph seeds for copy, privacy labels, rating, support, and release note
  review
- DoD criteria for store readiness evidence
- risks and blockers for privacy, content rating, support contact, and release
  readiness gaps
- SOLID/frontend/backend review context by separating metadata planning from
  implementation and publication behavior
- Autopilot handoff context and dry-run scenarios as advisory metadata only
- phase closeout evidence for future 139I

## Conversational Build Loop Readiness

This plan prepares the path:

idea intake -> requirements -> feature/screen blueprints -> release strategy
-> store metadata -> future publication checklist -> future Codex handoff
prompt.

Phase 139B does not implement conversational automation, store interaction,
asset production, app generation, Codex execution, or release execution.

## Future Implementation Split

- Phase 139I - STORE READINESS / APP METADATA IMPLEMENTATION
- Phase 140B - MOBILE FACTORY REVIEW / FIRST DRY-RUN PLAN

## Exit Criteria For 139B

- Planning documents exist and are docs-only.
- Models and categories are specified for 139I.
- Safety boundaries remain explicit.
- Verification confirms no source, provider, package, app, workflow, dashboard,
  database/schema, secret, network, memory, asset, store, or source-control
  side effects.
