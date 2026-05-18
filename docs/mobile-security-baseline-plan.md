# Mobile Security Baseline Plan

Phase: 127B - MOBILE SECURITY BASELINE PLAN

Status: planning / audit / scope only

## Purpose

Mobile Security Baseline plans an advisory metadata layer for future mobile
apps designed by ORQUESTADOR-PRIME / Viernes. It defines security posture for
storage, auth/session, auth artifact handling, network/API boundaries,
permissions, privacy, logging, abuse/safety, offline/sync, release readiness,
and MASVS-style review without implementing any real security behavior.

This phase is docs-only. It does not implement auth, storage, cryptographic controls,
runtime auth artifact handling, network/API clients, permission prompts,
native config, credentials, provider execution, database changes, app
generation, mobile commands, package changes, CI activation, memory
persistence, or source-control automation from source.

## Planning Scope

The baseline should cover:

- secure storage posture,
- auth/session posture,
- auth artifact handling posture,
- network/API posture,
- permission education posture,
- privacy and data minimization posture,
- logging and redaction posture,
- abuse, safety, report, and block posture,
- offline/sync security posture,
- release signing and store posture as future-gated review,
- MASVS-style checklist posture.

The plan only defines metadata contracts and future review criteria. It must
not select or configure real mobile security libraries, platform storage,
native projects, credentials, API clients, or release signing.

## Future Source Scope

Phase 127I should be allowed to create:

- `src/pm/mobileSecurityBaseline.ts`
- `docs/mobile-security-baseline.md`
- optional `scripts/mobile-security-baseline-tests.ts`

Phase 127I may update:

- `src/pm/index.ts`

Phase 127I must not update:

- `package.json`,
- workflows,
- `.github/*`,
- app folders,
- generated mobile app folders,
- Expo/EAS/native config files,
- WhatsApp, bridge, integration, dashboard, provider, DB/SQL, or runtime files,
- environment, vault, credential, or secret files.

## Future Metadata Models

### MobileSecurityBaseline

Future metadata should include:

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

### MobileSecurityRisk

Future risk metadata should include:

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

### MobileSecurityChecklistItem

Future checklist metadata should include:

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

## Security Categories

The baseline should use these advisory categories:

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

These categories are labels for planning, PM review, SOLID review, DoD, and
Autopilot handoff. They do not implement runtime behavior.

## Integration Plan

The baseline should feed:

- Mobile App Factory: app type, target users, data sensitivity, safety needs,
  release target, and approval posture.
- RN/Expo Architecture Profile: security review for app routes, services,
  repositories, state, config, tests, native-future, and release-future layers.
- UX Pattern Catalog: permission education, safety/report/block flows,
  privacy copy, account recovery, and abuse prevention states.
- Navigation Flow Model: auth gates, protected routes, role-based routes,
  safety routes, fallback routes, and session restore posture.
- Mobile State Management: sensitive state classification, session state,
  persisted-future posture, and redaction rules.
- Offline / Cache / Sync: offline writable risk, conflict review, retry
  posture, stale data labels, and recovery UX.
- PM Core: risks, blockers, approvals, DoD, next action, and closeout.
- SOLID/Architecture: frontend, backend, module boundary, DIP, and smell
  review context.
- Autopilot: handoff and dry-run context only.

## Future 127I Implementation Plan

Phase 127I should:

1. Create `src/pm/mobileSecurityBaseline.ts` with metadata types only.
2. Define baseline, risk, checklist, category, recommendation, and summary
   metadata.
3. Add pure helpers that operate on caller-supplied metadata and static
   defaults.
4. Export the module from `src/pm/index.ts`.
5. Add `docs/mobile-security-baseline.md`.
6. Add an optional smoke test without changing `package.json`.

## Stop Conditions

Stop and do not implement if the requested work requires:

- real auth behavior,
- real storage behavior,
- cryptographic control implementation,
- runtime auth artifact handling,
- network/API client behavior,
- permission prompts,
- native config changes,
- credentials,
- provider calls,
- DB/SQL changes,
- app generation,
- mobile commands,
- package or workflow changes,
- CI activation,
- memory persistence,
- source-control automation from source.

## Verification Plan

For 127B:

- `git status --short --branch`
- `git diff --stat`
- `git diff --name-only`
- `git diff --check`
- `node node_modules/typescript/bin/tsc --noEmit`

If WSL node is unavailable, use Windows Node fallback:

- `node node_modules\typescript\bin\tsc --noEmit`

For 127I:

- typecheck,
- smoke test if added,
- forbidden grep,
- scope check,
- staged-file check.

## Return Path

After 127I, the next formal phase should be:

- Phase 128B - MOBILE PERFORMANCE CHECKLIST PLAN
