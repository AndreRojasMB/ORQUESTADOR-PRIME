import {
  createMobileNotificationChannel,
  createMobileNotificationConsentModel,
  createMobileNotificationEvent,
  createMobilePushNotificationStrategy,
  recommendMobilePushNotificationStrategy,
  selectNotificationChannelsByPurpose,
  selectNotificationEventsByTrigger,
  summarizeMobilePushNotificationStrategy,
} from "../src/pm/mobilePushNotificationStrategy.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const channel = createMobileNotificationChannel({
  channelId: "mobile_notification_channel:test:transactional",
  channelName: "Transactional test channel",
  purpose: "Plan relevant transactional updates.",
  audience: "consented_customers",
  priority: "normal",
  allowedEventTypes: ["transactional", "system_status"],
  frequencyCap: "per_event_with_global_cap_review",
  quietHoursEnabled: true,
  optOutSupported: true,
  requiredConsent: true,
  riskLevel: "medium",
});

assert(channel.safetyBoundaries.noPushProviderSetup === true, "channel must not configure providers");
assert(channel.safetyBoundaries.noNotificationSending === true, "channel must not dispatch messages");

const event = createMobileNotificationEvent({
  eventId: "mobile_notification_event:test:booking_update",
  eventName: "Booking update",
  triggerType: "user_action_future",
  sourceFeatureRef: "mobile_feature:test:booking",
  targetRouteRef: "mobile_route:test:booking_detail",
  messagePurpose: "Plan booking update communication.",
  templateLabel: "booking_update_generic_template",
  personalizationAllowed: false,
  sensitiveDataAllowed: false,
  deliveryUrgency: "normal",
  fallbackBehavior: "show_in_app_booking_status",
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
});

assert(event.safetyBoundaries.noNotificationSending === true, "event must not dispatch messages");
assert(event.safetyBoundaries.noBackgroundRuntime === true, "event must not create background runtime");

const consent = createMobileNotificationConsentModel({
  consentModelId: "mobile_notification_consent:test:general",
  permissionType: "push_general_future",
  educationScreenRef: "mobile_screen:test:permission_education",
  optInTrigger: "after_booking_value_seen",
  optOutPath: "settings_notification_preferences_future",
  rePromptPolicy: "after_feature_value_seen",
  consentEvidence: ["education_copy_review", "privacy_note_review"],
  privacyNote: "Generic previews until human review approves more detail.",
  riskLevel: "medium",
});

assert(consent.safetyBoundaries.noPlatformNotificationConfig === true, "consent must not configure platform settings");
assert(consent.safetyBoundaries.noCredentialUse === true, "consent must not touch credential material");

const strategy = createMobilePushNotificationStrategy({
  strategyId: "mobile_push_notification_strategy:test",
  appType: "service_booking_app",
  notificationGoals: ["support_booking_updates", "preserve_quiet_hours"],
  permissionEducationFlow: "education_before_prompt_future",
  optInTiming: "after_booking_value_seen",
  channels: [channel],
  eventCandidates: [event],
  consentModels: [consent],
  frequencyPolicy: "global_and_channel_caps_required",
  quietHoursPolicy: "quiet_hours_default",
  deepLinkPolicy: "route_refs_only_with_fallback_review",
  privacyPosture: "generic_previews_until_privacy_review",
  safetyPosture: "high_risk_events_require_human_review",
  requiredApprovals: ["release_review"],
  riskLevel: "medium",
  limitations: ["metadata_only_strategy"],
});

assert(strategy.safetyBoundaries.sourceOnly === true, "strategy must be source-only");
assert(strategy.safetyBoundaries.metadataOnly === true, "strategy must be metadata-only");
assert(strategy.safetyBoundaries.noPushProviderSetup === true, "strategy must not configure providers");
assert(strategy.safetyBoundaries.noNotificationSending === true, "strategy must not dispatch messages");
assert(strategy.safetyBoundaries.noCredentialUse === true, "strategy must not touch credential material");
assert(strategy.safetyBoundaries.noBackgroundRuntime === true, "strategy must not create background runtime");
assert(strategy.safetyBoundaries.noAppGeneration === true, "strategy must not create apps");

const defaultStrategy = createMobilePushNotificationStrategy({
  appType: "service_booking_app",
});
const recommendation = recommendMobilePushNotificationStrategy(strategy);
const summary = summarizeMobilePushNotificationStrategy(strategy);
const transactionalChannels = selectNotificationChannelsByPurpose(strategy.channels, "transactional");
const userActionEvents = selectNotificationEventsByTrigger(strategy.eventCandidates, "user_action_future");

assert(defaultStrategy.channels.length >= 4, "default strategy should include advisory channels");
assert(defaultStrategy.eventCandidates.length >= 3, "default strategy should include advisory events");
assert(defaultStrategy.consentModels.length >= 2, "default strategy should include consent models");
assert(recommendation.safetyBoundaries.noPushProviderSetup === true, "recommendation must not configure providers");
assert(summary.channelCount === 1, "summary should count channels");
assert(summary.eventCandidateCount === 1, "summary should count event candidates");
assert(summary.consentModelCount === 1, "summary should count consent models");
assert(summary.recommendedNextPhase === "Phase 138B", "summary should point to Phase 138B");
assert(transactionalChannels.length === 1, "channel purpose filtering should work");
assert(userActionEvents.length === 1, "event trigger filtering should work");

console.log("Mobile Push Notification Strategy smoke tests passed");
console.log(`Default channels: ${defaultStrategy.channels.length}`);
console.log(`Default events: ${defaultStrategy.eventCandidates.length}`);
console.log(`Consent models: ${defaultStrategy.consentModels.length}`);
