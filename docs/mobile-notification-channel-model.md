# Mobile Notification Channel Model

Phase: 137B - MOBILE PUSH NOTIFICATION STRATEGY PLAN

Status: planning / docs-only / future channel and event metadata

## Purpose

The Mobile Notification Channel Model defines how Phase 137I should represent
future notification channels and event candidates as advisory metadata. The
model should help product, UX, privacy, safety, testing, and release review
decide whether a future communication path is appropriate.

It must not create provider channels, native channels, templates, dispatch
logic, background workers, dashboards, app files, or platform configuration.

## Future Type Names

Future Phase 137I should define:

- `MobileNotificationChannel`,
- `MobileNotificationEvent`,
- `MobileNotificationPriority`,
- `MobileNotificationTriggerType`,
- `MobileNotificationDeliveryUrgency`.

## Channel Fields

`MobileNotificationChannel` should include:

- `channelId`,
- `channelName`,
- `purpose`,
- `audience`,
- `priority`,
- `allowedEventTypes`,
- `frequencyCap`,
- `quietHoursEnabled`,
- `optOutSupported`,
- `requiredConsent`,
- `riskLevel`.

## Channel Priority Values

Future priority labels may include:

- `low`,
- `normal`,
- `high`,
- `critical_review_required`,
- `blocked`.

Priority is advisory. It does not bypass consent, quiet hours, safety review,
or release approval.

## Recommended Channel Families

Future defaults may include:

- onboarding education,
- account and security,
- transactional updates,
- reminders,
- messaging updates,
- marketplace updates,
- offline sync recovery,
- safety and trust,
- monetization and subscription,
- release or policy notice.

Each channel should define opt-out posture and approval needs.

## Event Candidate Fields

`MobileNotificationEvent` should include:

- `eventId`,
- `eventName`,
- `triggerType`,
- `sourceFeatureRef`,
- `targetRouteRef`,
- `messagePurpose`,
- `templateLabel`,
- `personalizationAllowed`,
- `sensitiveDataAllowed`,
- `deliveryUrgency`,
- `fallbackBehavior`,
- `riskLevel`,
- `requiredApprovals`.

## Trigger Type Values

Future trigger labels may include:

- `user_action_future`,
- `session_state_future`,
- `offline_sync_future`,
- `message_activity_future`,
- `marketplace_activity_future`,
- `reminder_future`,
- `safety_event_future`,
- `release_event_future`,
- `manual_review_required`,
- `unknown`.

These labels are future review metadata only.

## Delivery Urgency Values

Future urgency labels may include:

- `passive`,
- `normal`,
- `time_sensitive_review`,
- `critical_human_review`,
- `blocked`.

High urgency should require safety, privacy, and release review.

## Template Metadata

Template labels should describe:

- purpose,
- tone,
- required user value,
- forbidden sensitive fields,
- fallback copy,
- localization review,
- accessibility review,
- opt-out reminder posture when appropriate.

Template labels are not message files or provider templates.

## Deep Link Target Rules

Future event candidates should map to route refs only when:

- the target route exists in navigation metadata,
- auth or role gates are clear,
- fallback route is available,
- offline behavior is defined,
- privacy risk is reviewed,
- testing can cover the route.

Route refs are metadata labels. They do not create linking configuration.

## Frequency And Quiet Hours Rules

Every channel should define:

- per-channel cap,
- global cap posture,
- quiet-hours support,
- high-priority exception review,
- re-engagement cooldown,
- opt-out support,
- suppression rules for unsafe or irrelevant states.

No timers, workers, or dispatch schedules are created.

## Risk Rules

High-risk event candidates include:

- safety alerts,
- account/security messages,
- payment or monetization nudges,
- personal or sensitive data,
- child/minor or health contexts,
- role-based or permission-gated flows,
- repeated engagement messages,
- deep links into destructive or private routes.

High-risk events should require human review.

## Mapping To Existing Mobile Stack

Channel and event metadata should map to:

- Mobile App Factory app type and flows,
- UX Pattern Catalog permission and state patterns,
- Navigation Flow Model route refs,
- State Management Strategy state refs,
- Offline / Cache / Sync recovery refs,
- Security Baseline privacy and safety refs,
- Testing Strategy smoke and release checks,
- Release Strategy readiness gates.

## Safety Boundary

The channel and event model must remain:

- source-only,
- advisory-only,
- metadata-only,
- no provider setup,
- no platform service setup,
- no native notification configuration,
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
