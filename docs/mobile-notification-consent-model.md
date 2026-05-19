# Mobile Notification Consent Model

Phase: 137B - MOBILE PUSH NOTIFICATION STRATEGY PLAN

Status: planning / docs-only / future consent metadata

## Purpose

The Mobile Notification Consent Model defines how Phase 137I should represent
permission education, opt-in timing, opt-out paths, re-prompt posture, consent
evidence, privacy notes, and risk level as advisory metadata.

Consent metadata is not a permission prompt implementation, provider setup,
native configuration, message dispatch path, or storage implementation.

## Future Type Names

Future Phase 137I should define:

- `MobileNotificationConsentModel`,
- `MobileNotificationPermissionType`,
- `MobileNotificationOptInTiming`,
- `MobileNotificationRePromptPolicy`,
- `MobileNotificationFrequencyPolicy`,
- `MobileNotificationQuietHoursPolicy`.

## Consent Fields

`MobileNotificationConsentModel` should include:

- `consentModelId`,
- `permissionType`,
- `educationScreenRef`,
- `optInTrigger`,
- `optOutPath`,
- `rePromptPolicy`,
- `consentEvidence`,
- `privacyNote`,
- `riskLevel`.

## Permission Type Values

Future permission type labels may include:

- `push_general_future`,
- `transactional_future`,
- `messaging_future`,
- `reminder_future`,
- `marketing_future`,
- `safety_future`,
- `critical_review_required`,
- `unknown`.

These labels are planning metadata only.

## Opt-In Timing Rules

Opt-in timing should be:

- value-led,
- contextual,
- after the user understands the feature,
- never blocking core access unless there is a documented safety reason,
- recoverable through settings or support,
- reviewed for privacy and platform policy.

Poor timing should become a UX risk or blocker.

## Education Screen Rules

Permission education should explain:

- why notifications help,
- what categories the user may receive,
- how frequency is controlled,
- how quiet hours work,
- how opt-out works,
- whether sensitive data is ever allowed,
- what fallback exists if the user declines.

Education screens should be mapped by screen ref only. No screen is created in
this phase.

## Re-Prompt Policy

Future re-prompt labels may include:

- `never_after_decline`,
- `after_feature_value_seen`,
- `after_settings_visit`,
- `after_major_release_review`,
- `manual_review_required`,
- `blocked`.

Re-prompt posture should avoid dark patterns and repeated pressure.

## Frequency Policy

Future frequency policy metadata should include:

- global cap label,
- channel cap labels,
- cooldown labels,
- quiet-hours exception posture,
- high-risk suppression posture,
- user opt-out posture,
- release approval posture.

These are labels only. No runtime schedule is added.

## Privacy Note Rules

Privacy notes should define:

- whether personalization is allowed,
- whether sensitive data is disallowed,
- whether previews must be generic,
- whether route targets are protected,
- whether consent evidence is required,
- whether approval is required before implementation.

## Abuse Prevention

Consent and frequency metadata should help prevent:

- spammy engagement loops,
- coercive permission education,
- sensitive preview leakage,
- unsafe deep links,
- repeated monetization nudges,
- ignored quiet hours,
- unclear opt-out paths.

## Testing And Release Mapping

Consent metadata should feed:

- UX copy review,
- accessibility review,
- permission-denied flow review,
- notification-disabled fallback review,
- security and privacy checklist evidence,
- release readiness gates,
- PM risk and blocker reports.

It should not run tests or create release configuration.

## Conversational Build Loop Readiness

This model helps a future loop turn feature and screen blueprints into a
notification permission plan:

feature need -> permission education -> opt-in timing -> channel/event posture
-> release readiness -> future handoff prompt context.

No automation, provider setup, message dispatch, or app creation is included.

## Safety Boundary

The consent model must remain:

- source-only,
- advisory-only,
- metadata-only,
- no provider setup,
- no native permission prompt implementation,
- no platform notification configuration,
- no credential material,
- no message dispatch,
- no background worker runtime,
- no app creation,
- no Expo/EAS commands,
- no package changes,
- no provider calls,
- no runtime execution,
- no dashboard mutation,
- no database or schema mutation,
- no CI activation,
- no memory persistence,
- no git automation from source.
