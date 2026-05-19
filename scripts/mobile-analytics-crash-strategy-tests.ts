import {
  createMobileAnalyticsCrashStrategy,
  createMobileAnalyticsEvent,
  createMobileAnalyticsFunnel,
  createMobileCrashReportingModel,
  recommendMobileAnalyticsCrashStrategy,
  selectAnalyticsEventsByCategory,
  selectFunnelsByAppType,
  summarizeMobileAnalyticsCrashStrategy,
} from "../src/pm/mobileAnalyticsCrashStrategy.ts";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const event = createMobileAnalyticsEvent({
  eventId: "mobile_analytics_event:test:activation",
  eventName: "Activation test event",
  category: "activation",
  sourceFeatureRef: "mobile_feature:test:activation",
  sourceScreenRef: "mobile_screen:test:onboarding",
  trigger: "user_reaches_test_value_state_future",
  purpose: "Plan activation review without runtime data collection.",
  allowedProperties: ["app_type_label", "screen_state_label"],
  forbiddenProperties: ["raw_input", "personal_identifier"],
  sensitiveDataAllowed: false,
  consentRequired: true,
  retentionHint: "short_review_window",
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
});

assert(event.safetyBoundaries.noEventTrackingImplementation === true, "event must not implement tracking");
assert(event.safetyBoundaries.noDataCapture === true, "event must not collect data");

const funnel = createMobileAnalyticsFunnel({
  funnelId: "mobile_analytics_funnel:test:activation",
  funnelName: "Activation test funnel",
  appType: "service_booking_app",
  steps: ["onboarding_entry", "first_value_state"],
  successMetric: "first_value_seen_rate_future",
  dropOffSignals: ["onboarding_exit"],
  relatedEvents: [event.eventId],
  businessGoal: "Prepare activation review.",
  riskLevel: "medium",
  limitations: ["metadata_only_funnel"],
});

assert(funnel.safetyBoundaries.noEventTrackingImplementation === true, "funnel must not implement tracking");
assert(funnel.safetyBoundaries.noDashboardMutation === true, "funnel must not mutate dashboards");

const crashModel = createMobileCrashReportingModel({
  crashModelId: "mobile_crash_reporting_model:test",
  reportingScope: ["fatal_crash_posture", "non_fatal_error_posture"],
  errorCategories: ["crash", "non_fatal_error"],
  nonFatalPolicy: "review_recoverable_errors_as_labels",
  crashGroupingPosture: "group_by_feature_and_screen_label_only",
  userContextPolicy: "abstract_context_only",
  breadcrumbsPolicy: "screen_state_labels_only",
  redactionPolicy: "block_raw_input_and_sensitive_payloads",
  releaseTrackingPolicy: "release_stage_labels_only",
  alertingPosture: "future_human_approved_thresholds_only",
  riskLevel: "high",
  requiredApprovals: ["release_monitoring_review"],
  limitations: ["metadata_only_crash_posture"],
});

assert(crashModel.safetyBoundaries.noCrashSdkSetup === true, "crash model must not configure crash SDKs");
assert(crashModel.safetyBoundaries.noProviderExecution === true, "crash model must not execute providers");
assert(crashModel.safetyBoundaries.noDataCapture === true, "crash model must not collect data");

const strategy = createMobileAnalyticsCrashStrategy({
  strategyId: "mobile_analytics_crash_strategy:test",
  appType: "service_booking_app",
  analyticsGoals: ["prepare_activation_review", "prepare_release_monitoring"],
  keyMetrics: ["first_value_seen_rate_future"],
  eventTaxonomy: [event],
  funnelCandidates: [funnel],
  crashReportingModels: [crashModel],
  consentPosture: "consent_required_before_future_product_events",
  identityPolicy: "abstract_identity_labels_only",
  redactionPolicy: "block_raw_input_and_sensitive_payloads",
  retentionPolicy: "short_review_windows",
  riskLevel: "medium",
  requiredApprovals: ["product_review"],
  limitations: ["metadata_only_strategy"],
});

assert(strategy.safetyBoundaries.sourceOnly === true, "strategy must be source-only");
assert(strategy.safetyBoundaries.metadataOnly === true, "strategy must be metadata-only");
assert(strategy.safetyBoundaries.noAnalyticsSdkSetup === true, "strategy must not configure analytics SDKs");
assert(strategy.safetyBoundaries.noCrashSdkSetup === true, "strategy must not configure crash SDKs");
assert(strategy.safetyBoundaries.noDataCapture === true, "strategy must not collect data");
assert(strategy.safetyBoundaries.noUserIdentityTracking === true, "strategy must not track user identity");
assert(strategy.safetyBoundaries.noCredentialUse === true, "strategy must not touch credential material");
assert(strategy.safetyBoundaries.noNetworkApiCalls === true, "strategy must not call network or APIs");
assert(strategy.safetyBoundaries.noAppGeneration === true, "strategy must not create apps");

const defaultStrategy = createMobileAnalyticsCrashStrategy({
  appType: "service_booking_app",
});
const recommendation = recommendMobileAnalyticsCrashStrategy(strategy);
const summary = summarizeMobileAnalyticsCrashStrategy(strategy);
const activationEvents = selectAnalyticsEventsByCategory(strategy.eventTaxonomy, "activation");
const serviceBookingFunnels = selectFunnelsByAppType(strategy.funnelCandidates, "service_booking_app");

assert(defaultStrategy.eventTaxonomy.length >= 4, "default strategy should include advisory events");
assert(defaultStrategy.funnelCandidates.length >= 2, "default strategy should include advisory funnels");
assert(defaultStrategy.crashReportingModels.length >= 1, "default strategy should include crash posture");
assert(recommendation.safetyBoundaries.noAnalyticsSdkSetup === true, "recommendation must not configure analytics SDKs");
assert(recommendation.safetyBoundaries.noCrashSdkSetup === true, "recommendation must not configure crash SDKs");
assert(summary.eventCount === 1, "summary should count events");
assert(summary.funnelCount === 1, "summary should count funnels");
assert(summary.crashModelCount === 1, "summary should count crash models");
assert(summary.sensitiveEventCount === 0, "summary should count sensitive events");
assert(summary.recommendedNextPhase === "Phase 139B", "summary should point to Phase 139B");
assert(activationEvents.length === 1, "event category filtering should work");
assert(serviceBookingFunnels.length === 1, "funnel app type filtering should work");

console.log("Mobile Analytics / Crash Strategy smoke tests passed");
console.log(`Default events: ${defaultStrategy.eventTaxonomy.length}`);
console.log(`Default funnels: ${defaultStrategy.funnelCandidates.length}`);
console.log(`Default crash models: ${defaultStrategy.crashReportingModels.length}`);
