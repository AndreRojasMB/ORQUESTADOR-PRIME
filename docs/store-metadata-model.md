# Store Metadata Model

Phase: 139B - STORE READINESS / APP METADATA PLAN

Status: future model / source-only / advisory / metadata-only

## Purpose

The Store Metadata Model defines future metadata for app listing readiness. It
helps ORQUESTADOR-PRIME / Viernes connect Mobile App Factory, release,
security, analytics/crash, testing, performance, and notification planning to
future store-facing copy and readiness evidence without publishing anything or
producing assets.

## Store Readiness Categories

Future store readiness metadata should use:

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

## Store Metadata Fields

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

## Listing Copy Posture

Listing copy should describe:

- problem solved
- target audience
- core value proposition
- main feature groups
- accessibility and safety posture when relevant
- privacy posture in plain language
- support/contact posture
- release note posture

Copy metadata must remain draft posture until product, privacy, and legal
review. It must not claim store approval, production readiness, or compliance
certification.

## Asset Posture

Asset posture should describe future needs for:

- screenshot story coverage
- preview media coverage
- icon and brand consistency
- accessible text alternatives
- device class review
- localization review
- release-specific review

The model must not produce files, render screens, make images, produce preview
media, or modify asset folders.

## Support And Marketing Posture

Support and marketing URL posture should describe:

- whether support contact metadata is required
- whether marketing metadata is required
- what human review is needed before external links exist
- what privacy or compliance evidence must be present

The model must not create pages, validate live links, call networks, or publish
external metadata.

## Readiness Checklist Fields

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

## Mapping To Mobile Artifacts

Store metadata should map to:

- app type and value proposition from Mobile App Factory
- release notes and gate posture from Mobile Release / EAS Strategy
- privacy and permission posture from Mobile Security Baseline
- analytics/crash disclosure from Mobile Analytics / Crash Strategy
- release readiness and QA evidence from Mobile Testing Strategy
- low-end device and performance concerns from Mobile Performance Checklist
- opt-in/opt-out and communication posture from Mobile Push Notification
  Strategy

## Safety Rules

This model must remain:

- source-only
- advisory-only
- metadata-only
- no store submission
- no store console interaction
- no screenshot production
- no preview media production
- no asset production
- no credential material access
- no app generation
- no Expo/EAS commands
- no package changes
- no provider execution
- no database or schema mutation
- no dashboard mutation
- no secrets/env/network
- no CI activation
- no memory persistence
- no source-control automation from source

## 139I Implementation Notes

Phase 139I should implement pure model constructors, selectors,
recommendation helpers, and summaries only. It should not import provider
clients, produce assets, publish metadata, read environment values, or execute
release tooling.
