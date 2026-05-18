# Mobile Security Baseline

Phase: 127I - MOBILE SECURITY BASELINE IMPLEMENTATION

Status: source-only / advisory / metadata-only

## Purpose

Mobile Security Baseline gives ORQUESTADOR-PRIME / Viernes a typed metadata
layer for future mobile security planning. It models security posture, data
sensitivity, risks, MASVS-style checklist items, required approvals, and future
implementation limits before any real mobile app or runtime exists.

The baseline does not implement auth, storage, cryptographic controls,
runtime auth artifact handling, network/API behavior, permission prompts,
native config, credentials, provider execution, DB/SQL behavior, app
generation, Expo/EAS behavior, package changes, CI activation, memory
persistence, or source-control automation from source.

## Implemented Source File

- `src/pm/mobileSecurityBaseline.ts`

The file belongs in PM Core because it consumes Mobile App Factory, RN/Expo
Architecture Profile, UX Pattern Catalog, Navigation Flow Model, Mobile State
Management, and Offline / Cache / Sync metadata. It returns planning, risk,
approval, DoD, SOLID review, and Autopilot handoff context.

## Security Categories

Implemented advisory categories:

- `secure_storage`
- `auth_session`
- `token_handling`
- `network_api`
- `permissions_privacy`
- `logging_redaction`
- `offline_sync`
- `abuse_safety`
- `payment_future`
- `release_signing_future`
- `third_party_sdk_future`
- `compliance_advisory`

Categories are planning labels. They do not select libraries, create platform
configuration, call APIs, or run mobile commands.

## Baseline Model

`MobileSecurityBaseline` records:

- `baselineId`
- `appType`
- `dataSensitivity`
- `authRequired`
- `offlineRisk`
- `storageSecurityPosture`
- `networkSecurityPosture`
- `permissionPosture`
- `privacyPosture`
- `loggingPosture`
- `safetyPosture`
- `releaseSecurityPosture`
- `riskLevel`
- `requiredApprovals`
- `limitations`

It also includes risks, checklist items, recommendation metadata, summary
metadata, integration notes, conversational build loop readiness, and explicit
safety boundaries.

## Risk Model

`MobileSecurityRisk` records:

- `riskId`
- `riskCategory`
- `affectedFlow`
- `affectedData`
- `likelihood`
- `impact`
- `severity`
- `mitigation`
- `requiredEvidence`
- `approvalRequired`
- `humanReviewRequired`
- `limitations`

Risks are report-only. They may become PM risk entries, blockers, approval
readiness gaps, or DoD criteria in future phases.

## Checklist Model

`MobileSecurityChecklistItem` records:

- `checklistItemId`
- `category`
- `title`
- `question`
- `expectedEvidence`
- `failureSignal`
- `severityHint`
- `relatedAppTypes`
- `relatedDataSensitivity`
- `riskLevel`
- `requiredApprovals`

Checklist items are MASVS-style advisory metadata. They ask for evidence before
future implementation and never configure security behavior.

## Helpers

Implemented pure helpers:

- `createMobileSecurityBaseline(...)`
- `createMobileSecurityRisk(...)`
- `createMobileSecurityChecklistItem(...)`
- `recommendMobileSecurityBaseline(...)`
- `summarizeMobileSecurityBaseline(...)`
- `selectSecurityRisksByCategory(...)`
- `selectChecklistItemsByCategory(...)`

Helpers operate only on caller-supplied metadata and static defaults.

## Safety Boundaries

The baseline explicitly guarantees:

- source-only,
- advisory-only,
- metadata-only,
- no auth implementation,
- no storage implementation,
- no cryptographic control implementation,
- no auth artifact runtime,
- no API calls,
- no network calls,
- no permission prompts,
- no native config changes,
- no secrets or credentials,
- no provider calls,
- no DB or SQL mutation,
- no app generation,
- no mobile tooling execution,
- no Expo/EAS execution,
- no package changes,
- no CI activation,
- no memory persistence,
- no git automation from source.

## Mobile App Factory Integration

The baseline consumes:

- app type,
- target users,
- data model summary,
- auth needs,
- offline needs,
- safety needs,
- monetization needs,
- release target.

Those inputs drive data sensitivity, approval posture, risk severity, and
checklist focus.

## RN/Expo Integration

The baseline maps to advisory mobile layers:

- services,
- repositories,
- state,
- config,
- tests,
- native future,
- release future.

It supports future RN/Expo architecture review without creating apps, native
folders, route files, package changes, or mobile command execution.

## State And Offline Integration

The baseline consumes Mobile State Management and Offline / Cache / Sync
metadata for:

- sensitive state,
- session state,
- persisted future state,
- offline writable risk,
- conflict review,
- retry posture,
- stale data labels,
- recovery UX.

This keeps security review aligned with state ownership and offline behavior
before implementation begins.

## PM, SOLID, And Autopilot Integration

The baseline can feed:

- PM reports,
- task graph seeds,
- DoD criteria,
- risks and blockers,
- approval readiness,
- SOLID/frontend/backend review context,
- Autopilot handoff context,
- dry-run scenarios,
- phase closeout.

Autopilot may carry this baseline as planning context only. It must not
generate apps, execute Codex, persist memory, call providers, mutate dashboards,
or perform source-control actions from source modules.

## Conversational Build Loop Readiness

The baseline prepares a future loop where a simple idea can become:

- a security posture,
- a data sensitivity classification,
- required approvals,
- a checklist,
- future Codex prompt context.

No conversational automation is implemented in Phase 127I.

## Limitations

Phase 127I intentionally does not include:

- auth implementation,
- storage implementation,
- cryptographic control implementation,
- auth artifact runtime,
- API or network implementation,
- permission prompts,
- native config changes,
- credential handling,
- provider integration,
- DB or SQL mutation,
- mobile app generation,
- screen or route generation,
- mobile tooling execution,
- package or workflow changes,
- CI activation,
- dashboard mutation,
- memory persistence.

## Next Phase

The recommended next phase is:

- Phase 128B - MOBILE PERFORMANCE CHECKLIST PLAN
