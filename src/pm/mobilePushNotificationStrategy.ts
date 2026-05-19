import type { MobileAppFactoryAppType } from "./mobileAppFactoryStrategy.js";
import type { PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type MobileNotificationCategory =
  | "permission_education"
  | "opt_in"
  | "reminder"
  | "transactional"
  | "social"
  | "marketplace"
  | "gamification_progress"
  | "safety_trust"
  | "monetization"
  | "system_status"
  | "offline_sync"
  | "release_future"
  | "analytics_future"
  | "unknown";

export type MobileNotificationPriority = "low" | "normal" | "high" | "critical_review_required" | "blocked";

export type MobileNotificationTriggerType =
  | "user_action_future"
  | "session_state_future"
  | "offline_sync_future"
  | "message_activity_future"
  | "marketplace_activity_future"
  | "reminder_future"
  | "safety_event_future"
  | "release_event_future"
  | "manual_review_required"
  | "unknown";

export type MobileNotificationDeliveryUrgency =
  | "passive"
  | "normal"
  | "time_sensitive_review"
  | "critical_human_review"
  | "blocked";

export type MobileNotificationPermissionType =
  | "push_general_future"
  | "transactional_future"
  | "messaging_future"
  | "reminder_future"
  | "marketing_future"
  | "safety_future"
  | "critical_review_required"
  | "unknown";

export type MobileNotificationRePromptPolicy =
  | "never_after_decline"
  | "after_feature_value_seen"
  | "after_settings_visit"
  | "after_major_release_review"
  | "manual_review_required"
  | "blocked";

export interface MobilePushNotificationSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noPushProviderSetup: true;
  noPlatformNotificationConfig: true;
  noNamedProviderConfig: true;
  noCredentialUse: true;
  noNativeConfigChanges: true;
  noNotificationSending: true;
  noBackgroundRuntime: true;
  noAppGeneration: true;
  noExpoEasExecution: true;
  noPackageChanges: true;
  noProviderCalls: true;
  noRuntimeExecution: true;
  noDashboardMutation: true;
  noDbSqlMutation: true;
  noSecretsEnvNetwork: true;
  noCiActivation: true;
  noMemoryPersistence: true;
  noGitAutomationFromSource: true;
}

export interface MobileNotificationChannel {
  channelId: string;
  channelName: string;
  purpose: string;
  audience: string;
  priority: MobileNotificationPriority;
  allowedEventTypes: readonly MobileNotificationCategory[];
  frequencyCap: string;
  quietHoursEnabled: boolean;
  optOutSupported: boolean;
  requiredConsent: boolean;
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    MobilePushNotificationSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noPushProviderSetup" | "noNotificationSending"
  >;
}

export interface MobileNotificationEvent {
  eventId: string;
  eventName: string;
  triggerType: MobileNotificationTriggerType;
  sourceFeatureRef: string;
  targetRouteRef: string;
  messagePurpose: string;
  templateLabel: string;
  personalizationAllowed: boolean;
  sensitiveDataAllowed: boolean;
  deliveryUrgency: MobileNotificationDeliveryUrgency;
  fallbackBehavior: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  safetyBoundaries: Pick<
    MobilePushNotificationSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noNotificationSending" | "noBackgroundRuntime"
  >;
}

export interface MobileNotificationConsentModel {
  consentModelId: string;
  permissionType: MobileNotificationPermissionType;
  educationScreenRef: string;
  optInTrigger: string;
  optOutPath: string;
  rePromptPolicy: MobileNotificationRePromptPolicy;
  consentEvidence: readonly string[];
  privacyNote: string;
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    MobilePushNotificationSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noPlatformNotificationConfig" | "noCredentialUse"
  >;
}

export interface MobilePushNotificationStrategy {
  strategyId: string;
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  notificationGoals: readonly string[];
  permissionEducationFlow: string;
  optInTiming: string;
  channels: readonly MobileNotificationChannel[];
  eventCandidates: readonly MobileNotificationEvent[];
  consentModels: readonly MobileNotificationConsentModel[];
  frequencyPolicy: string;
  quietHoursPolicy: string;
  deepLinkPolicy: string;
  privacyPosture: string;
  safetyPosture: string;
  requiredApprovals: readonly string[];
  riskLevel: PMRiskTier;
  limitations: readonly string[];
  safetyBoundaries: MobilePushNotificationSafetyBoundaries;
}

export interface MobilePushNotificationInput {
  strategyId?: string;
  appType?: MobileAppFactoryAppType | "unknown_mobile_app";
  notificationGoals?: readonly string[];
  permissionEducationFlow?: string;
  optInTiming?: string;
  channels?: readonly MobileNotificationChannel[];
  eventCandidates?: readonly MobileNotificationEvent[];
  consentModels?: readonly MobileNotificationConsentModel[];
  frequencyPolicy?: string;
  quietHoursPolicy?: string;
  deepLinkPolicy?: string;
  privacyPosture?: string;
  safetyPosture?: string;
  requiredApprovals?: readonly string[];
  riskLevel?: PMRiskTier;
  limitations?: readonly string[];
}

export interface MobilePushNotificationRecommendation {
  recommendationId: string;
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  postureSummary: string;
  permissionPosture: string;
  channelPosture: string;
  eventPosture: string;
  privacyPosture: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<
    MobilePushNotificationSafetyBoundaries,
    "advisoryOnly" | "metadataOnly" | "noPushProviderSetup" | "noNotificationSending" | "noBackgroundRuntime"
  >;
}

export interface MobilePushNotificationSummary {
  strategyId: string;
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  channelCount: number;
  eventCandidateCount: number;
  consentModelCount: number;
  optOutSupportedChannelCount: number;
  quietHoursChannelCount: number;
  sensitiveEventCount: number;
  requiredApprovalCount: number;
  categories: readonly MobileNotificationCategory[];
  triggerTypes: readonly MobileNotificationTriggerType[];
  highestRiskLevel: PMRiskTier;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: MobilePushNotificationSafetyBoundaries;
}

export const mobileNotificationCategories: readonly MobileNotificationCategory[] = [
  "permission_education",
  "opt_in",
  "reminder",
  "transactional",
  "social",
  "marketplace",
  "gamification_progress",
  "safety_trust",
  "monetization",
  "system_status",
  "offline_sync",
  "release_future",
  "analytics_future",
  "unknown",
];

const safetyBoundaries = (): MobilePushNotificationSafetyBoundaries => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noPushProviderSetup: true,
  noPlatformNotificationConfig: true,
  noNamedProviderConfig: true,
  noCredentialUse: true,
  noNativeConfigChanges: true,
  noNotificationSending: true,
  noBackgroundRuntime: true,
  noAppGeneration: true,
  noExpoEasExecution: true,
  noPackageChanges: true,
  noProviderCalls: true,
  noRuntimeExecution: true,
  noDashboardMutation: true,
  noDbSqlMutation: true,
  noSecretsEnvNetwork: true,
  noCiActivation: true,
  noMemoryPersistence: true,
  noGitAutomationFromSource: true,
});

const channelSafety = (): MobileNotificationChannel["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noPushProviderSetup: true,
  noNotificationSending: true,
});

const eventSafety = (): MobileNotificationEvent["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noNotificationSending: true,
  noBackgroundRuntime: true,
});

const consentSafety = (): MobileNotificationConsentModel["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noPlatformNotificationConfig: true,
  noCredentialUse: true,
});

const recommendationSafety = (): MobilePushNotificationRecommendation["safetyBoundaries"] => ({
  advisoryOnly: true,
  metadataOnly: true,
  noPushProviderSetup: true,
  noNotificationSending: true,
  noBackgroundRuntime: true,
});

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

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

const categoriesFromChannels = (
  channels: readonly MobileNotificationChannel[],
): readonly MobileNotificationCategory[] =>
  uniqueStrings(channels.flatMap((channel) => channel.allowedEventTypes)) as MobileNotificationCategory[];

export const createMobileNotificationChannel = (
  input: Omit<MobileNotificationChannel, "safetyBoundaries"> & {
    safetyBoundaries?: MobileNotificationChannel["safetyBoundaries"];
  },
): MobileNotificationChannel => ({
  channelId: input.channelId,
  channelName: input.channelName,
  purpose: input.purpose,
  audience: input.audience,
  priority: input.priority,
  allowedEventTypes: uniqueStrings(input.allowedEventTypes) as MobileNotificationCategory[],
  frequencyCap: input.frequencyCap,
  quietHoursEnabled: input.quietHoursEnabled,
  optOutSupported: input.optOutSupported,
  requiredConsent: input.requiredConsent,
  riskLevel: input.riskLevel,
  safetyBoundaries: input.safetyBoundaries ?? channelSafety(),
});

export const createMobileNotificationEvent = (
  input: Omit<MobileNotificationEvent, "safetyBoundaries"> & {
    safetyBoundaries?: MobileNotificationEvent["safetyBoundaries"];
  },
): MobileNotificationEvent => ({
  eventId: input.eventId,
  eventName: input.eventName,
  triggerType: input.triggerType,
  sourceFeatureRef: input.sourceFeatureRef,
  targetRouteRef: input.targetRouteRef,
  messagePurpose: input.messagePurpose,
  templateLabel: input.templateLabel,
  personalizationAllowed: input.personalizationAllowed,
  sensitiveDataAllowed: input.sensitiveDataAllowed,
  deliveryUrgency: input.deliveryUrgency,
  fallbackBehavior: input.fallbackBehavior,
  riskLevel: input.riskLevel,
  requiredApprovals: uniqueStrings(input.requiredApprovals),
  safetyBoundaries: input.safetyBoundaries ?? eventSafety(),
});

export const createMobileNotificationConsentModel = (
  input: Omit<MobileNotificationConsentModel, "safetyBoundaries"> & {
    safetyBoundaries?: MobileNotificationConsentModel["safetyBoundaries"];
  },
): MobileNotificationConsentModel => ({
  consentModelId: input.consentModelId,
  permissionType: input.permissionType,
  educationScreenRef: input.educationScreenRef,
  optInTrigger: input.optInTrigger,
  optOutPath: input.optOutPath,
  rePromptPolicy: input.rePromptPolicy,
  consentEvidence: uniqueStrings(input.consentEvidence),
  privacyNote: input.privacyNote,
  riskLevel: input.riskLevel,
  safetyBoundaries: input.safetyBoundaries ?? consentSafety(),
});

const defaultChannels = (riskLevel: PMRiskTier): readonly MobileNotificationChannel[] => [
  createMobileNotificationChannel({
    channelId: "mobile_notification_channel:permission_education",
    channelName: "Permission education",
    purpose: "Explain future notification value before opt-in review.",
    audience: "all_users_after_context",
    priority: "normal",
    allowedEventTypes: ["permission_education", "opt_in"],
    frequencyCap: "education_once_until_user_action",
    quietHoursEnabled: true,
    optOutSupported: true,
    requiredConsent: false,
    riskLevel,
  }),
  createMobileNotificationChannel({
    channelId: "mobile_notification_channel:transactional",
    channelName: "Transactional updates",
    purpose: "Plan future account, booking, marketplace, or status updates.",
    audience: "consented_relevant_users",
    priority: "normal",
    allowedEventTypes: ["transactional", "marketplace", "system_status"],
    frequencyCap: "per_event_with_global_cap_review",
    quietHoursEnabled: true,
    optOutSupported: true,
    requiredConsent: true,
    riskLevel,
  }),
  createMobileNotificationChannel({
    channelId: "mobile_notification_channel:reminders",
    channelName: "Reminders",
    purpose: "Plan future reminders without pressure or spam loops.",
    audience: "consented_users_with_active_goal",
    priority: "low",
    allowedEventTypes: ["reminder", "gamification_progress"],
    frequencyCap: "daily_or_less_review",
    quietHoursEnabled: true,
    optOutSupported: true,
    requiredConsent: true,
    riskLevel,
  }),
  createMobileNotificationChannel({
    channelId: "mobile_notification_channel:safety_trust",
    channelName: "Safety and trust",
    purpose: "Plan future safety or trust communication with human review.",
    audience: "affected_users_after_review",
    priority: "critical_review_required",
    allowedEventTypes: ["safety_trust", "offline_sync"],
    frequencyCap: "case_by_case_human_review",
    quietHoursEnabled: true,
    optOutSupported: true,
    requiredConsent: true,
    riskLevel: highestRisk([riskLevel, "high"]),
  }),
];

const defaultConsentModels = (riskLevel: PMRiskTier): readonly MobileNotificationConsentModel[] => [
  createMobileNotificationConsentModel({
    consentModelId: "mobile_notification_consent:general",
    permissionType: "push_general_future",
    educationScreenRef: "mobile_screen:permission_education_future",
    optInTrigger: "after_user_sees_feature_value",
    optOutPath: "settings_notification_preferences_future",
    rePromptPolicy: "after_feature_value_seen",
    consentEvidence: ["education_copy_review", "opt_out_path_review", "privacy_note_review"],
    privacyNote: "Use generic previews until privacy review approves more detail.",
    riskLevel,
  }),
  createMobileNotificationConsentModel({
    consentModelId: "mobile_notification_consent:safety",
    permissionType: "safety_future",
    educationScreenRef: "mobile_screen:safety_permission_education_future",
    optInTrigger: "after_safety_feature_context",
    optOutPath: "settings_safety_notification_preferences_future",
    rePromptPolicy: "manual_review_required",
    consentEvidence: ["safety_review", "privacy_review", "release_gate_review"],
    privacyNote: "Safety communication requires human review and generic previews.",
    riskLevel: highestRisk([riskLevel, "high"]),
  }),
];

const defaultEvents = (riskLevel: PMRiskTier): readonly MobileNotificationEvent[] => [
  createMobileNotificationEvent({
    eventId: "mobile_notification_event:permission_prompt_ready",
    eventName: "Permission education ready",
    triggerType: "user_action_future",
    sourceFeatureRef: "mobile_feature:permission_education_future",
    targetRouteRef: "mobile_route:permission_education_future",
    messagePurpose: "Guide the user to review notification value before opt-in.",
    templateLabel: "permission_education_template_label",
    personalizationAllowed: false,
    sensitiveDataAllowed: false,
    deliveryUrgency: "passive",
    fallbackBehavior: "show_in_app_education_state",
    riskLevel,
    requiredApprovals: ["ux_copy_review", "privacy_review"],
  }),
  createMobileNotificationEvent({
    eventId: "mobile_notification_event:transactional_update",
    eventName: "Transactional update",
    triggerType: "user_action_future",
    sourceFeatureRef: "mobile_feature:transactional_future",
    targetRouteRef: "mobile_route:transaction_detail_future",
    messagePurpose: "Notify about relevant future transactional state.",
    templateLabel: "transactional_generic_template_label",
    personalizationAllowed: false,
    sensitiveDataAllowed: false,
    deliveryUrgency: "normal",
    fallbackBehavior: "show_in_app_status_state",
    riskLevel,
    requiredApprovals: ["privacy_review"],
  }),
  createMobileNotificationEvent({
    eventId: "mobile_notification_event:offline_recovery",
    eventName: "Offline recovery available",
    triggerType: "offline_sync_future",
    sourceFeatureRef: "mobile_feature:offline_sync_future",
    targetRouteRef: "mobile_route:offline_recovery_future",
    messagePurpose: "Explain future sync or recovery state without exposing sensitive details.",
    templateLabel: "offline_recovery_template_label",
    personalizationAllowed: false,
    sensitiveDataAllowed: false,
    deliveryUrgency: "normal",
    fallbackBehavior: "show_offline_recovery_state",
    riskLevel: highestRisk([riskLevel, "medium"]),
    requiredApprovals: ["offline_sync_review", "privacy_review"],
  }),
];

export const createMobilePushNotificationStrategy = (
  input: MobilePushNotificationInput = {},
): MobilePushNotificationStrategy => {
  const riskLevel = input.riskLevel ?? "medium";
  const channels = input.channels ?? defaultChannels(riskLevel);
  const eventCandidates = input.eventCandidates ?? defaultEvents(riskLevel);
  const consentModels = input.consentModels ?? defaultConsentModels(riskLevel);
  const requiredApprovals = uniqueStrings([
    ...(input.requiredApprovals ?? []),
    ...eventCandidates.flatMap((event) => event.requiredApprovals),
  ]);

  return {
    strategyId: input.strategyId ?? "mobile_push_notification_strategy:default",
    appType: input.appType ?? "unknown_mobile_app",
    notificationGoals: uniqueStrings(
      input.notificationGoals ?? [
        "educate_before_opt_in",
        "support_transactional_relevance",
        "preserve_privacy_and_quiet_hours",
      ],
    ),
    permissionEducationFlow: input.permissionEducationFlow ?? "education_before_prompt_future",
    optInTiming: input.optInTiming ?? "after_feature_value_seen",
    channels: [...channels],
    eventCandidates: [...eventCandidates],
    consentModels: [...consentModels],
    frequencyPolicy: input.frequencyPolicy ?? "global_and_channel_caps_required",
    quietHoursPolicy: input.quietHoursPolicy ?? "quiet_hours_default_with_human_review_exceptions",
    deepLinkPolicy: input.deepLinkPolicy ?? "route_refs_only_with_auth_and_fallback_review",
    privacyPosture: input.privacyPosture ?? "generic_previews_until_privacy_review",
    safetyPosture: input.safetyPosture ?? "high_risk_events_require_human_review",
    requiredApprovals,
    riskLevel: highestRisk([
      riskLevel,
      ...channels.map((channel) => channel.riskLevel),
      ...eventCandidates.map((event) => event.riskLevel),
      ...consentModels.map((consent) => consent.riskLevel),
    ]),
    limitations: uniqueStrings([
      ...(input.limitations ?? []),
      "metadata_only_push_notification_strategy",
      "no_provider_or_runtime_behavior",
    ]),
    safetyBoundaries: safetyBoundaries(),
  };
};

export const recommendMobilePushNotificationStrategy = (
  strategy: MobilePushNotificationStrategy,
): MobilePushNotificationRecommendation => ({
  recommendationId: `${strategy.strategyId}:recommendation`,
  appType: strategy.appType,
  postureSummary:
    "Use notification metadata for PM, UX, privacy, security, testing, and release review before any implementation phase.",
  permissionPosture: strategy.permissionEducationFlow,
  channelPosture: `${strategy.channels.length} advisory channel(s) with opt-out and quiet-hours review.`,
  eventPosture: `${strategy.eventCandidates.length} advisory event candidate(s) require privacy and route review.`,
  privacyPosture: strategy.privacyPosture,
  riskLevel: strategy.riskLevel,
  requiredApprovals: [...strategy.requiredApprovals],
  recommendedNextStep: {
    nextStepId: "mobile_push_notification_next_step:138B",
    title: "Plan the Mobile Analytics / Crash Reporting Strategy",
    safeSummary:
      "Continue with Phase 138B to plan analytics and crash reporting metadata without providers, apps, or runtime behavior.",
    priority: strategy.riskLevel,
    decisionMode: "plan_only",
    riskSurfaces: ["automation", "provider", "security_policy", "release", "unknown"],
    recommendationOnly: true,
    noExecution: true,
  },
  safetyBoundaries: recommendationSafety(),
});

export const summarizeMobilePushNotificationStrategy = (
  strategy: MobilePushNotificationStrategy,
): MobilePushNotificationSummary => ({
  strategyId: strategy.strategyId,
  appType: strategy.appType,
  channelCount: strategy.channels.length,
  eventCandidateCount: strategy.eventCandidates.length,
  consentModelCount: strategy.consentModels.length,
  optOutSupportedChannelCount: strategy.channels.filter((channel) => channel.optOutSupported).length,
  quietHoursChannelCount: strategy.channels.filter((channel) => channel.quietHoursEnabled).length,
  sensitiveEventCount: strategy.eventCandidates.filter((event) => event.sensitiveDataAllowed).length,
  requiredApprovalCount: strategy.requiredApprovals.length,
  categories: categoriesFromChannels(strategy.channels),
  triggerTypes: uniqueStrings(strategy.eventCandidates.map((event) => event.triggerType)) as MobileNotificationTriggerType[],
  highestRiskLevel: strategy.riskLevel,
  recommendedNextPhase: "Phase 138B",
  safeSummary:
    `${strategy.channels.length} channel(s), ${strategy.eventCandidates.length} event candidate(s), ${strategy.consentModels.length} consent model(s).`,
  safetyBoundaries: strategy.safetyBoundaries,
});

export const selectNotificationChannelsByPurpose = (
  channels: readonly MobileNotificationChannel[],
  purpose: string,
): readonly MobileNotificationChannel[] => {
  const normalizedPurpose = purpose.trim().toLowerCase();
  return channels.filter(
    (channel) =>
      channel.purpose.toLowerCase().includes(normalizedPurpose) ||
      channel.channelName.toLowerCase().includes(normalizedPurpose),
  );
};

export const selectNotificationEventsByTrigger = (
  events: readonly MobileNotificationEvent[],
  triggerType: MobileNotificationTriggerType,
): readonly MobileNotificationEvent[] => events.filter((event) => event.triggerType === triggerType);
