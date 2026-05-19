import type { MobileAppFactoryAppType } from "./mobileAppFactoryStrategy.js";
import type { PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type MobileAnalyticsCategory =
  | "activation"
  | "onboarding"
  | "authentication"
  | "navigation"
  | "engagement"
  | "retention"
  | "monetization"
  | "marketplace"
  | "messaging"
  | "gamification"
  | "offline_sync"
  | "performance"
  | "crash"
  | "non_fatal_error"
  | "security_privacy"
  | "release_monitoring"
  | "unknown";

export interface MobileAnalyticsCrashSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noAnalyticsSdkSetup: true;
  noCrashSdkSetup: true;
  noEventTrackingImplementation: true;
  noDataCapture: true;
  noUserIdentityTracking: true;
  noProviderExecution: true;
  noCredentialUse: true;
  noNetworkApiCalls: true;
  noAppGeneration: true;
  noExpoEasExecution: true;
  noPackageChanges: true;
  noNativeConfigChanges: true;
  noDashboardMutation: true;
  noDbSqlMutation: true;
  noCiActivation: true;
  noMemoryPersistence: true;
  noGitAutomationFromSource: true;
}

export interface MobileAnalyticsEvent {
  eventId: string;
  eventName: string;
  category: MobileAnalyticsCategory;
  sourceFeatureRef: string;
  sourceScreenRef: string;
  trigger: string;
  purpose: string;
  allowedProperties: readonly string[];
  forbiddenProperties: readonly string[];
  sensitiveDataAllowed: boolean;
  consentRequired: boolean;
  retentionHint: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  safetyBoundaries: Pick<
    MobileAnalyticsCrashSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noEventTrackingImplementation" | "noDataCapture"
  >;
}

export interface MobileAnalyticsFunnel {
  funnelId: string;
  funnelName: string;
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  steps: readonly string[];
  successMetric: string;
  dropOffSignals: readonly string[];
  relatedEvents: readonly string[];
  businessGoal: string;
  riskLevel: PMRiskTier;
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobileAnalyticsCrashSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noEventTrackingImplementation" | "noDashboardMutation"
  >;
}

export interface MobileCrashReportingModel {
  crashModelId: string;
  reportingScope: readonly string[];
  errorCategories: readonly MobileAnalyticsCategory[];
  nonFatalPolicy: string;
  crashGroupingPosture: string;
  userContextPolicy: string;
  breadcrumbsPolicy: string;
  redactionPolicy: string;
  releaseTrackingPolicy: string;
  alertingPosture: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobileAnalyticsCrashSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noCrashSdkSetup" | "noDataCapture" | "noProviderExecution"
  >;
}

export interface MobileAnalyticsCrashStrategy {
  strategyId: string;
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  analyticsGoals: readonly string[];
  keyMetrics: readonly string[];
  eventTaxonomy: readonly MobileAnalyticsEvent[];
  funnelCandidates: readonly MobileAnalyticsFunnel[];
  crashReportingModels: readonly MobileCrashReportingModel[];
  consentPosture: string;
  identityPolicy: string;
  redactionPolicy: string;
  retentionPolicy: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  recommendation: MobileAnalyticsCrashRecommendation;
  summary: MobileAnalyticsCrashSummary;
  consumedMobileMetadata: readonly string[];
  pmSolidAutopilotIntegration: readonly string[];
  conversationalBuildLoopReadiness: readonly string[];
  safetyBoundaries: MobileAnalyticsCrashSafetyBoundaries;
}

export interface MobileAnalyticsCrashInput {
  strategyId?: string;
  appType?: MobileAppFactoryAppType | "unknown_mobile_app";
  analyticsGoals?: readonly string[];
  keyMetrics?: readonly string[];
  eventTaxonomy?: readonly MobileAnalyticsEvent[];
  funnelCandidates?: readonly MobileAnalyticsFunnel[];
  crashReportingModels?: readonly MobileCrashReportingModel[];
  consentPosture?: string;
  identityPolicy?: string;
  redactionPolicy?: string;
  retentionPolicy?: string;
  riskLevel?: PMRiskTier;
  requiredApprovals?: readonly string[];
  limitations?: readonly string[];
  consumedMobileMetadata?: readonly string[];
  pmSolidAutopilotIntegration?: readonly string[];
  conversationalBuildLoopReadiness?: readonly string[];
}

export interface MobileAnalyticsCrashRecommendation {
  recommendationId: string;
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  postureSummary: string;
  privacyPosture: string;
  eventPosture: string;
  crashPosture: string;
  releaseMonitoringPosture: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<
    MobileAnalyticsCrashSafetyBoundaries,
    "advisoryOnly" | "metadataOnly" | "noAnalyticsSdkSetup" | "noCrashSdkSetup" | "noDataCapture"
  >;
}

export interface MobileAnalyticsCrashSummary {
  strategyId: string;
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  eventCount: number;
  funnelCount: number;
  crashModelCount: number;
  consentRequiredEventCount: number;
  sensitiveEventCount: number;
  requiredApprovalCount: number;
  categories: readonly MobileAnalyticsCategory[];
  highestRiskLevel: PMRiskTier;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: MobileAnalyticsCrashSafetyBoundaries;
}

export const mobileAnalyticsCategories: readonly MobileAnalyticsCategory[] = [
  "activation",
  "onboarding",
  "authentication",
  "navigation",
  "engagement",
  "retention",
  "monetization",
  "marketplace",
  "messaging",
  "gamification",
  "offline_sync",
  "performance",
  "crash",
  "non_fatal_error",
  "security_privacy",
  "release_monitoring",
  "unknown",
];

const safetyBoundaries = (): MobileAnalyticsCrashSafetyBoundaries => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noAnalyticsSdkSetup: true,
  noCrashSdkSetup: true,
  noEventTrackingImplementation: true,
  noDataCapture: true,
  noUserIdentityTracking: true,
  noProviderExecution: true,
  noCredentialUse: true,
  noNetworkApiCalls: true,
  noAppGeneration: true,
  noExpoEasExecution: true,
  noPackageChanges: true,
  noNativeConfigChanges: true,
  noDashboardMutation: true,
  noDbSqlMutation: true,
  noCiActivation: true,
  noMemoryPersistence: true,
  noGitAutomationFromSource: true,
});

const eventSafety = (): MobileAnalyticsEvent["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noEventTrackingImplementation: true,
  noDataCapture: true,
});

const funnelSafety = (): MobileAnalyticsFunnel["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noEventTrackingImplementation: true,
  noDashboardMutation: true,
});

const crashSafety = (): MobileCrashReportingModel["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noCrashSdkSetup: true,
  noDataCapture: true,
  noProviderExecution: true,
});

const recommendationSafety = (): MobileAnalyticsCrashRecommendation["safetyBoundaries"] => ({
  advisoryOnly: true,
  metadataOnly: true,
  noAnalyticsSdkSetup: true,
  noCrashSdkSetup: true,
  noDataCapture: true,
});

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const uniqueCategories = (values: readonly MobileAnalyticsCategory[]): MobileAnalyticsCategory[] =>
  mobileAnalyticsCategories.filter((category) => values.includes(category));

const riskRank: Record<PMRiskTier, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const highestRisk = (risks: readonly PMRiskTier[]): PMRiskTier => {
  const sorted = [...risks].sort((left, right) => riskRank[right] - riskRank[left]);
  return sorted[0] ?? "low";
};

const defaultEvents = (riskLevel: PMRiskTier): readonly MobileAnalyticsEvent[] => [
  createMobileAnalyticsEvent({
    eventId: "mobile_analytics_event:activation:first_value_seen",
    eventName: "First value seen",
    category: "activation",
    sourceFeatureRef: "mobile_feature:activation_future",
    sourceScreenRef: "mobile_screen:activation_future",
    trigger: "user_reaches_first_value_state_future",
    purpose: "Plan activation insight without collecting runtime data.",
    allowedProperties: ["app_type_label", "flow_label", "screen_state_label"],
    forbiddenProperties: ["raw_input", "personal_identifier", "sensitive_payload"],
    sensitiveDataAllowed: false,
    consentRequired: true,
    retentionHint: "short_product_review_window",
    riskLevel,
    requiredApprovals: ["privacy_review", "product_metrics_review"],
  }),
  createMobileAnalyticsEvent({
    eventId: "mobile_analytics_event:navigation:blocked_state",
    eventName: "Navigation blocked state",
    category: "navigation",
    sourceFeatureRef: "mobile_feature:navigation_future",
    sourceScreenRef: "mobile_screen:navigation_state_future",
    trigger: "route_guard_blocks_user_future",
    purpose: "Plan route guard and fallback review without runtime tracking.",
    allowedProperties: ["route_group_label", "guard_label", "fallback_label"],
    forbiddenProperties: ["raw_route_param", "session_artifact", "personal_identifier"],
    sensitiveDataAllowed: false,
    consentRequired: true,
    retentionHint: "release_readiness_review_window",
    riskLevel: highestRisk([riskLevel, "medium"]),
    requiredApprovals: ["privacy_review", "navigation_review"],
  }),
  createMobileAnalyticsEvent({
    eventId: "mobile_analytics_event:error:recoverable",
    eventName: "Recoverable error posture",
    category: "non_fatal_error",
    sourceFeatureRef: "mobile_feature:error_recovery_future",
    sourceScreenRef: "mobile_screen:error_state_future",
    trigger: "recoverable_error_state_future",
    purpose: "Plan non-fatal error review without reporting runtime errors.",
    allowedProperties: ["error_category_label", "screen_state_label", "recovery_action_label"],
    forbiddenProperties: ["stack_trace", "raw_error_message", "personal_identifier"],
    sensitiveDataAllowed: false,
    consentRequired: true,
    retentionHint: "short_release_review_window",
    riskLevel: highestRisk([riskLevel, "high"]),
    requiredApprovals: ["privacy_review", "release_monitoring_review"],
  }),
  createMobileAnalyticsEvent({
    eventId: "mobile_analytics_event:release:monitoring_ready",
    eventName: "Release monitoring ready",
    category: "release_monitoring",
    sourceFeatureRef: "mobile_feature:release_future",
    sourceScreenRef: "mobile_screen:release_readiness_future",
    trigger: "release_gate_review_future",
    purpose: "Plan release monitoring readiness without provider setup.",
    allowedProperties: ["release_stage_label", "gate_label", "risk_tier_label"],
    forbiddenProperties: ["build_secret", "platform_account_value", "personal_identifier"],
    sensitiveDataAllowed: false,
    consentRequired: false,
    retentionHint: "phase_closeout_review_window",
    riskLevel: highestRisk([riskLevel, "medium"]),
    requiredApprovals: ["release_review"],
  }),
];

const defaultFunnels = (
  appType: MobileAppFactoryAppType | "unknown_mobile_app",
  riskLevel: PMRiskTier,
): readonly MobileAnalyticsFunnel[] => [
  createMobileAnalyticsFunnel({
    funnelId: "mobile_analytics_funnel:activation",
    funnelName: "Activation readiness",
    appType,
    steps: ["idea_context", "onboarding_entry", "first_value_state", "return_intent"],
    successMetric: "first_value_seen_rate_future",
    dropOffSignals: ["onboarding_exit", "auth_block", "empty_state_unresolved"],
    relatedEvents: [
      "mobile_analytics_event:activation:first_value_seen",
      "mobile_analytics_event:navigation:blocked_state",
    ],
    businessGoal: "Understand whether the MVP reaches a meaningful first value later.",
    riskLevel,
    limitations: ["metadata_only_funnel", "requires_future_human_approved_tracking_plan"],
  }),
  createMobileAnalyticsFunnel({
    funnelId: "mobile_analytics_funnel:release_quality",
    funnelName: "Release quality readiness",
    appType,
    steps: ["smoke_flow_passed", "recoverable_error_reviewed", "release_gate_reviewed"],
    successMetric: "release_ready_without_blocking_error_future",
    dropOffSignals: ["critical_error_label", "redaction_gap", "release_gate_blocked"],
    relatedEvents: [
      "mobile_analytics_event:error:recoverable",
      "mobile_analytics_event:release:monitoring_ready",
    ],
    businessGoal: "Prepare release readiness decisions with privacy-safe evidence labels.",
    riskLevel: highestRisk([riskLevel, "medium"]),
    limitations: ["metadata_only_release_quality_funnel", "no_dashboard_or_runtime_measurement"],
  }),
];

const defaultCrashModels = (riskLevel: PMRiskTier): readonly MobileCrashReportingModel[] => [
  createMobileCrashReportingModel({
    crashModelId: "mobile_crash_reporting_model:default",
    reportingScope: [
      "fatal_crash_posture",
      "non_fatal_error_posture",
      "navigation_failure_posture",
      "offline_sync_failure_posture",
      "release_monitoring_posture",
    ],
    errorCategories: ["crash", "non_fatal_error", "navigation", "offline_sync", "performance"],
    nonFatalPolicy: "review_recoverable_errors_as_labels_before_any_reporting",
    crashGroupingPosture: "group_by_feature_screen_and_release_label_only",
    userContextPolicy: "abstract_context_only_until_privacy_approval",
    breadcrumbsPolicy: "allow_screen_state_and_route_labels_only",
    redactionPolicy: "block_raw_input_sensitive_payloads_and_identity_adjacent_values",
    releaseTrackingPolicy: "release_stage_labels_only_until_release_review",
    alertingPosture: "future_human_approved_thresholds_only",
    riskLevel: highestRisk([riskLevel, "high"]),
    requiredApprovals: ["privacy_review", "release_monitoring_review"],
    limitations: ["metadata_only_crash_posture", "no_runtime_reporting"],
  }),
];

export const createMobileAnalyticsEvent = (
  input: Omit<MobileAnalyticsEvent, "safetyBoundaries"> & {
    safetyBoundaries?: MobileAnalyticsEvent["safetyBoundaries"];
  },
): MobileAnalyticsEvent => ({
  eventId: input.eventId,
  eventName: input.eventName,
  category: input.category,
  sourceFeatureRef: input.sourceFeatureRef,
  sourceScreenRef: input.sourceScreenRef,
  trigger: input.trigger,
  purpose: input.purpose,
  allowedProperties: uniqueStrings(input.allowedProperties),
  forbiddenProperties: uniqueStrings(input.forbiddenProperties),
  sensitiveDataAllowed: input.sensitiveDataAllowed,
  consentRequired: input.consentRequired,
  retentionHint: input.retentionHint,
  riskLevel: input.riskLevel,
  requiredApprovals: uniqueStrings(input.requiredApprovals),
  safetyBoundaries: input.safetyBoundaries ?? eventSafety(),
});

export const createMobileAnalyticsFunnel = (
  input: Omit<MobileAnalyticsFunnel, "safetyBoundaries"> & {
    safetyBoundaries?: MobileAnalyticsFunnel["safetyBoundaries"];
  },
): MobileAnalyticsFunnel => ({
  funnelId: input.funnelId,
  funnelName: input.funnelName,
  appType: input.appType,
  steps: uniqueStrings(input.steps),
  successMetric: input.successMetric,
  dropOffSignals: uniqueStrings(input.dropOffSignals),
  relatedEvents: uniqueStrings(input.relatedEvents),
  businessGoal: input.businessGoal,
  riskLevel: input.riskLevel,
  limitations: uniqueStrings(input.limitations),
  safetyBoundaries: input.safetyBoundaries ?? funnelSafety(),
});

export const createMobileCrashReportingModel = (
  input: Omit<MobileCrashReportingModel, "safetyBoundaries"> & {
    safetyBoundaries?: MobileCrashReportingModel["safetyBoundaries"];
  },
): MobileCrashReportingModel => ({
  crashModelId: input.crashModelId,
  reportingScope: uniqueStrings(input.reportingScope),
  errorCategories: uniqueCategories(input.errorCategories),
  nonFatalPolicy: input.nonFatalPolicy,
  crashGroupingPosture: input.crashGroupingPosture,
  userContextPolicy: input.userContextPolicy,
  breadcrumbsPolicy: input.breadcrumbsPolicy,
  redactionPolicy: input.redactionPolicy,
  releaseTrackingPolicy: input.releaseTrackingPolicy,
  alertingPosture: input.alertingPosture,
  riskLevel: input.riskLevel,
  requiredApprovals: uniqueStrings(input.requiredApprovals),
  limitations: uniqueStrings(input.limitations),
  safetyBoundaries: input.safetyBoundaries ?? crashSafety(),
});

export const recommendMobileAnalyticsCrashStrategy = (
  strategy: Pick<
    MobileAnalyticsCrashStrategy,
    | "strategyId"
    | "appType"
    | "riskLevel"
    | "requiredApprovals"
    | "eventTaxonomy"
    | "funnelCandidates"
    | "crashReportingModels"
    | "consentPosture"
  >,
): MobileAnalyticsCrashRecommendation => ({
  recommendationId: `${strategy.strategyId}:recommendation`,
  appType: strategy.appType,
  postureSummary:
    "Use analytics and crash metadata for PM, privacy, security, testing, performance, and release review before implementation.",
  privacyPosture: strategy.consentPosture,
  eventPosture: `${strategy.eventTaxonomy.length} advisory event candidate(s) require property and consent review.`,
  crashPosture: `${strategy.crashReportingModels.length} crash/error posture model(s) require redaction and release review.`,
  releaseMonitoringPosture: `${strategy.funnelCandidates.length} funnel/metric candidate(s) can feed future release readiness gates.`,
  riskLevel: strategy.riskLevel,
  requiredApprovals: [...strategy.requiredApprovals],
  recommendedNextStep: {
    nextStepId: "mobile_analytics_crash_next_step:139B",
    title: "Plan Store Readiness / App Metadata",
    safeSummary:
      "Continue with Phase 139B to plan store metadata and release presentation without provider setup, apps, or runtime behavior.",
    priority: strategy.riskLevel,
    decisionMode: "plan_only",
    riskSurfaces: ["provider", "security_policy", "release", "store", "unknown"],
    recommendationOnly: true,
    noExecution: true,
  },
  safetyBoundaries: recommendationSafety(),
});

export const summarizeMobileAnalyticsCrashStrategy = (
  strategy: Pick<
    MobileAnalyticsCrashStrategy,
    | "strategyId"
    | "appType"
    | "eventTaxonomy"
    | "funnelCandidates"
    | "crashReportingModels"
    | "requiredApprovals"
    | "riskLevel"
    | "safetyBoundaries"
  >,
): MobileAnalyticsCrashSummary => ({
  strategyId: strategy.strategyId,
  appType: strategy.appType,
  eventCount: strategy.eventTaxonomy.length,
  funnelCount: strategy.funnelCandidates.length,
  crashModelCount: strategy.crashReportingModels.length,
  consentRequiredEventCount: strategy.eventTaxonomy.filter((event) => event.consentRequired).length,
  sensitiveEventCount: strategy.eventTaxonomy.filter((event) => event.sensitiveDataAllowed).length,
  requiredApprovalCount: strategy.requiredApprovals.length,
  categories: uniqueCategories([
    ...strategy.eventTaxonomy.map((event) => event.category),
    ...strategy.crashReportingModels.flatMap((model) => model.errorCategories),
  ]),
  highestRiskLevel: strategy.riskLevel,
  recommendedNextPhase: "Phase 139B",
  safeSummary:
    `${strategy.eventTaxonomy.length} event candidate(s), ${strategy.funnelCandidates.length} funnel candidate(s), ${strategy.crashReportingModels.length} crash model(s).`,
  safetyBoundaries: strategy.safetyBoundaries,
});

export const createMobileAnalyticsCrashStrategy = (
  input: MobileAnalyticsCrashInput = {},
): MobileAnalyticsCrashStrategy => {
  const riskLevel = input.riskLevel ?? "medium";
  const appType = input.appType ?? "unknown_mobile_app";
  const eventTaxonomy = input.eventTaxonomy ?? defaultEvents(riskLevel);
  const funnelCandidates = input.funnelCandidates ?? defaultFunnels(appType, riskLevel);
  const crashReportingModels = input.crashReportingModels ?? defaultCrashModels(riskLevel);
  const requiredApprovals = uniqueStrings([
    ...(input.requiredApprovals ?? []),
    ...eventTaxonomy.flatMap((event) => event.requiredApprovals),
    ...crashReportingModels.flatMap((model) => model.requiredApprovals),
  ]);
  const strategyRisk = highestRisk([
    riskLevel,
    ...eventTaxonomy.map((event) => event.riskLevel),
    ...funnelCandidates.map((funnel) => funnel.riskLevel),
    ...crashReportingModels.map((model) => model.riskLevel),
  ]);
  const baseStrategy = {
    strategyId: input.strategyId ?? "mobile_analytics_crash_strategy:default",
    appType,
    analyticsGoals: uniqueStrings(
      input.analyticsGoals ?? [
        "understand_activation_without_runtime_collection",
        "prepare_release_monitoring_readiness",
        "preserve_privacy_and_redaction_first",
      ],
    ),
    keyMetrics: uniqueStrings(
      input.keyMetrics ?? [
        "activation_rate_future",
        "retention_signal_future",
        "recoverable_error_rate_future",
        "release_quality_signal_future",
      ],
    ),
    eventTaxonomy: [...eventTaxonomy],
    funnelCandidates: [...funnelCandidates],
    crashReportingModels: [...crashReportingModels],
    consentPosture: input.consentPosture ?? "consent_required_before_future_product_events",
    identityPolicy: input.identityPolicy ?? "abstract_identity_labels_only_until_privacy_review",
    redactionPolicy: input.redactionPolicy ?? "block_sensitive_payloads_raw_input_and_identity_adjacent_values",
    retentionPolicy: input.retentionPolicy ?? "short_review_windows_until_release_approval",
    riskLevel: strategyRisk,
    requiredApprovals,
    limitations: uniqueStrings([
      ...(input.limitations ?? []),
      "metadata_only_analytics_crash_strategy",
      "no_sdk_provider_or_runtime_behavior",
    ]),
    consumedMobileMetadata: uniqueStrings(
      input.consumedMobileMetadata ?? [
        "mobile_app_factory_strategy",
        "mobile_ux_ui_pattern_catalog",
        "mobile_navigation_flow_model",
        "mobile_state_management_strategy",
        "offline_cache_sync_strategy",
        "mobile_security_baseline",
        "mobile_performance_checklist",
        "mobile_testing_strategy",
        "mobile_release_eas_strategy",
        "mobile_push_notification_strategy",
      ],
    ),
    pmSolidAutopilotIntegration: uniqueStrings(
      input.pmSolidAutopilotIntegration ?? [
        "pm_report_measurement_goals",
        "dod_privacy_safe_instrumentation_review",
        "risk_blocker_consent_redaction_release_monitoring",
        "solid_boundary_between_product_logic_and_measurement",
        "autopilot_dry_run_handoff_context_only",
      ],
    ),
    conversationalBuildLoopReadiness: uniqueStrings(
      input.conversationalBuildLoopReadiness ?? [
        "idea_intake_to_requirements",
        "requirements_to_feature_screen_blueprints",
        "feature_screen_blueprints_to_analytics_crash_strategy",
        "strategy_to_future_release_monitoring_plan",
        "future_codex_handoff_prompt_context_only",
      ],
    ),
    safetyBoundaries: safetyBoundaries(),
  };
  const recommendation = recommendMobileAnalyticsCrashStrategy(baseStrategy);
  const summary = summarizeMobileAnalyticsCrashStrategy(baseStrategy);

  return {
    ...baseStrategy,
    recommendation,
    summary,
  };
};

export const selectAnalyticsEventsByCategory = (
  events: readonly MobileAnalyticsEvent[],
  category: MobileAnalyticsCategory,
): readonly MobileAnalyticsEvent[] => events.filter((event) => event.category === category);

export const selectFunnelsByAppType = (
  funnels: readonly MobileAnalyticsFunnel[],
  appType: MobileAppFactoryAppType | "unknown_mobile_app",
): readonly MobileAnalyticsFunnel[] =>
  funnels.filter((funnel) => funnel.appType === appType || funnel.appType === "unknown_mobile_app");
