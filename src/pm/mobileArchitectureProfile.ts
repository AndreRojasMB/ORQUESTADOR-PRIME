import type {
  MobileAppFactoryAppType,
  MobileAppFactoryIntake,
  MobileAppFactoryStrategy,
  MobilePlatformPriority,
  MobileReleaseTarget,
  MobileScreenMapItem,
} from "./mobileAppFactoryStrategy.js";
import type {
  PMEvidenceReference,
  PMRecommendedNextStep,
  PMRiskTier,
  ProjectPhaseRef,
} from "./types.js";

export type MobileArchitectureLayerId =
  | "app_routes"
  | "screens"
  | "components"
  | "features"
  | "domain"
  | "services"
  | "repositories"
  | "state"
  | "theme"
  | "mocks"
  | "tests"
  | "config"
  | "native_future"
  | "release_future";

export type MobileArchitectureProfileStatus =
  | "recommended"
  | "recommended_with_gaps"
  | "needs_clarification"
  | "blocked";

export type MobileArchitectureProfileRiskSignal =
  | "auth_or_sensitive_data"
  | "offline_sync"
  | "premium_or_payment"
  | "marketplace_transaction"
  | "provider_dependency"
  | "native_module_future"
  | "push_notification_future"
  | "release_future"
  | "ai_safety"
  | "platform_policy";

export interface MobileArchitectureLayer {
  layer: MobileArchitectureLayerId;
  description: string;
  allowedResponsibilities: string[];
  forbiddenResponsibilities: string[];
  reviewRequiredResponsibilities: string[];
  relatedSolidPrinciples: string[];
  riskSignals: MobileArchitectureProfileRiskSignal[];
  autopilotHandoffNotes: string[];
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noFileGeneration: true;
}

export interface MobileNavigationProfile {
  profileId: string;
  recommendedNavigation: string;
  rootRoutePosture: string;
  routeGroups: string[];
  authGatePosture: string;
  modalPosture: string;
  deepLinkPosture: string;
  recoveryPaths: string[];
  accessibilityNotes: string[];
  metadataOnly: true;
  advisoryOnly: true;
  noRouteGeneration: true;
}

export interface MobileStateManagementProfile {
  profileId: string;
  localUiState: string;
  featureState: string;
  serverCacheState: string;
  offlineQueueState: string;
  authSessionState: string;
  persistedPreferences: string;
  reRenderRiskNotes: string[];
  metadataOnly: true;
  advisoryOnly: true;
  noStoreGeneration: true;
}

export interface MobileDataAccessProfile {
  profileId: string;
  apiBoundary: string;
  repositoryBoundary: string;
  dtoMappingPosture: string;
  validationPosture: string;
  errorNormalization: string;
  retryPosture: string;
  providerBoundary: string;
  metadataOnly: true;
  advisoryOnly: true;
  noNetworkCalls: true;
  noProviderCalls: true;
}

export interface MobileOfflineProfile {
  profileId: string;
  cachePosture: string;
  localPersistencePosture: string;
  offlineQueuePosture: string;
  conflictResolutionPosture: string;
  syncRecoveryPosture: string;
  staleDataMessaging: string;
  approvalRequired: boolean;
  metadataOnly: true;
  advisoryOnly: true;
  noStorageConfiguration: true;
}

export interface MobileAuthProfile {
  profileId: string;
  authPosture: string;
  sessionLifecycle: string;
  accountRecovery: string;
  accountDeletion: string;
  permissionPromptPosture: string;
  privacyReview: string;
  metadataOnly: true;
  advisoryOnly: true;
  noCredentialUse: true;
}

export interface MobileSecurityProfile {
  profileId: string;
  devicePermissionRisks: string[];
  sensitiveDataRisks: string[];
  abuseRisks: string[];
  paymentOrPremiumRisks: string[];
  providerTrustBoundaries: string[];
  requiredApprovals: string[];
  metadataOnly: true;
  advisoryOnly: true;
  noSecretsAccess: true;
  noPaymentProcessing: true;
}

export interface MobileTestingProfile {
  profileId: string;
  unitTestTargets: string[];
  componentTestTargets: string[];
  navigationReview: string[];
  accessibilityReview: string[];
  offlineReview: string[];
  authReview: string[];
  performanceReviewTargets: string[];
  releaseSmokeChecklist: string[];
  metadataOnly: true;
  advisoryOnly: true;
  noTestExecution: true;
}

export interface MobileReleaseProfile {
  profileId: string;
  releaseTarget: MobileReleaseTarget;
  readinessPosture: string;
  privacyPolicyReadiness: string;
  crashReportingPosture: string;
  analyticsPosture: string;
  platformPolicyReview: string;
  rolloutNotes: string[];
  requiredApprovals: string[];
  metadataOnly: true;
  advisoryOnly: true;
  noBuildCreation: true;
  noStoreSubmission: true;
  noCiActivation: true;
}

export interface MobileArchitectureRecommendation {
  recommendationId: string;
  appType: MobileAppFactoryAppType;
  platformPriority: MobilePlatformPriority;
  status: MobileArchitectureProfileStatus;
  summary: string;
  preferredWorkflow: string;
  navigationStrategy: string;
  projectStructureStrategy: string;
  riskLevel: PMRiskTier;
  riskSignals: MobileArchitectureProfileRiskSignal[];
  requiredApprovals: string[];
  recommendedNextStep: PMRecommendedNextStep;
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noAppGeneration: true;
  noMobileTooling: true;
  noRuntimeExecution: true;
}

export interface MobileArchitectureProfile {
  profileId: string;
  phaseRef: ProjectPhaseRef;
  appType: MobileAppFactoryAppType;
  platformPriority: MobilePlatformPriority;
  recommendedNavigation: MobileNavigationProfile;
  recommendedProjectStructure: MobileArchitectureLayer[];
  stateManagementProfile: MobileStateManagementProfile;
  dataAccessProfile: MobileDataAccessProfile;
  offlineProfile: MobileOfflineProfile;
  authProfile: MobileAuthProfile;
  securityProfile: MobileSecurityProfile;
  testingProfile: MobileTestingProfile;
  releaseProfile: MobileReleaseProfile;
  architectureRecommendation: MobileArchitectureRecommendation;
  riskLevel: PMRiskTier;
  requiredApprovals: string[];
  limitations: string[];
  evidenceRefs: PMEvidenceReference[];
  consumedFactoryMetadata: string[];
  conversationalBuildLoopReadiness: string;
  metadataOnly: true;
  sourceOnly: true;
  advisoryOnly: true;
  reportOnly: true;
  noAppGeneration: true;
  noMobileTooling: true;
  noNativeProjectCreation: true;
  noPackageChanges: true;
  noProviderCalls: true;
  noRuntimeExecution: true;
  noDashboardMutation: true;
  noDbSqlMutation: true;
  noCiActivation: true;
  noMemoryPersistence: true;
  noGitAutomationFromSource: true;
}

export interface MobileArchitectureProfileInput {
  profileId?: string;
  appType?: MobileAppFactoryAppType;
  platformPriority?: MobilePlatformPriority;
  coreFlows?: string[];
  screenMap?: MobileScreenMapItem[];
  navigationNeeds?: string[];
  offlineNeeds?: string[];
  authNeeds?: string[];
  monetizationNeeds?: string[];
  safetyNeeds?: string[];
  releaseTarget?: MobileReleaseTarget;
  riskLevel?: PMRiskTier;
  requiredApprovals?: string[];
  limitations?: string[];
  evidenceRefs?: PMEvidenceReference[];
  factoryIntake?: MobileAppFactoryIntake;
  factoryStrategy?: MobileAppFactoryStrategy;
}

export interface MobileArchitectureProfileSummary {
  profileId: string;
  appType: MobileAppFactoryAppType;
  platformPriority: MobilePlatformPriority;
  layerCount: number;
  riskLevel: PMRiskTier;
  riskSignals: MobileArchitectureProfileRiskSignal[];
  requiredApprovalCount: number;
  releaseTarget: MobileReleaseTarget;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  metadataOnly: true;
  advisoryOnly: true;
  noExecution: true;
}

export const mobileArchitectureLayerIds: readonly MobileArchitectureLayerId[] = [
  "app_routes",
  "screens",
  "components",
  "features",
  "domain",
  "services",
  "repositories",
  "state",
  "theme",
  "mocks",
  "tests",
  "config",
  "native_future",
  "release_future",
];

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const factoryIntakeFromInput = (
  input: MobileArchitectureProfileInput,
): MobileAppFactoryIntake | undefined => input.factoryIntake ?? input.factoryStrategy?.intake;

const appTypeFromInput = (input: MobileArchitectureProfileInput): MobileAppFactoryAppType =>
  input.appType ?? factoryIntakeFromInput(input)?.supportedAppType ?? "unknown_mobile_app";

const platformPriorityFromInput = (
  input: MobileArchitectureProfileInput,
): MobilePlatformPriority =>
  input.platformPriority ?? factoryIntakeFromInput(input)?.platformPriority ?? "cross_platform";

const releaseTargetFromInput = (
  input: MobileArchitectureProfileInput,
): MobileReleaseTarget =>
  input.releaseTarget ?? factoryIntakeFromInput(input)?.releaseTarget ?? "prototype";

const coreFlowsFromInput = (input: MobileArchitectureProfileInput): string[] =>
  uniqueStrings(input.coreFlows ?? factoryIntakeFromInput(input)?.coreFlows);

const screenMapFromInput = (
  input: MobileArchitectureProfileInput,
): MobileScreenMapItem[] => [...(input.screenMap ?? factoryIntakeFromInput(input)?.screenMap ?? [])];

const offlineNeedsFromInput = (input: MobileArchitectureProfileInput): string[] =>
  uniqueStrings(input.offlineNeeds ?? factoryIntakeFromInput(input)?.offlineNeeds);

const authNeedsFromInput = (input: MobileArchitectureProfileInput): string[] =>
  uniqueStrings(input.authNeeds ?? factoryIntakeFromInput(input)?.authNeeds);

const monetizationNeedsFromInput = (input: MobileArchitectureProfileInput): string[] =>
  uniqueStrings(input.monetizationNeeds ?? factoryIntakeFromInput(input)?.monetizationNeeds);

const safetyNeedsFromInput = (input: MobileArchitectureProfileInput): string[] =>
  uniqueStrings(input.safetyNeeds ?? factoryIntakeFromInput(input)?.safetyNeeds);

const requiredApprovalsFromInput = (input: MobileArchitectureProfileInput): string[] =>
  uniqueStrings([
    ...(input.requiredApprovals ?? []),
    ...(factoryIntakeFromInput(input)?.requiredApprovals ?? []),
  ]);

const riskSignalsFromInput = (
  input: MobileArchitectureProfileInput,
): MobileArchitectureProfileRiskSignal[] => {
  const appType = appTypeFromInput(input);
  const signals: MobileArchitectureProfileRiskSignal[] = [];

  if (authNeedsFromInput(input).length > 0 || safetyNeedsFromInput(input).length > 0) {
    signals.push("auth_or_sensitive_data");
  }
  if (offlineNeedsFromInput(input).length > 0) signals.push("offline_sync");
  if (monetizationNeedsFromInput(input).length > 0) signals.push("premium_or_payment");
  if (appType === "marketplace_app") signals.push("marketplace_transaction");
  if (appType === "dashboard_companion_app") signals.push("provider_dependency");
  if (appType === "ai_assistant_mobile_app") signals.push("ai_safety");
  if (releaseTargetFromInput(input) !== "prototype") signals.push("release_future");

  return Array.from(new Set(signals));
};

const riskFromSignals = (
  input: MobileArchitectureProfileInput,
  signals: readonly MobileArchitectureProfileRiskSignal[],
): PMRiskTier => {
  if (input.riskLevel) return input.riskLevel;
  const factoryRiskLevel = factoryIntakeFromInput(input)?.riskLevel;
  if (factoryRiskLevel) return factoryRiskLevel;
  if (
    signals.includes("marketplace_transaction") ||
    signals.includes("premium_or_payment") ||
    signals.includes("ai_safety")
  ) {
    return "high";
  }
  if (signals.includes("auth_or_sensitive_data") || signals.includes("offline_sync")) {
    return "medium";
  }
  return "low";
};

const layer = (
  id: MobileArchitectureLayerId,
  description: string,
  allowedResponsibilities: string[],
  forbiddenResponsibilities: string[],
  reviewRequiredResponsibilities: string[],
  relatedSolidPrinciples: string[],
  riskSignals: MobileArchitectureProfileRiskSignal[] = [],
): MobileArchitectureLayer => ({
  layer: id,
  description,
  allowedResponsibilities,
  forbiddenResponsibilities,
  reviewRequiredResponsibilities,
  relatedSolidPrinciples,
  riskSignals,
  autopilotHandoffNotes: [
    `${id} is planning metadata only.`,
    "Do not generate files or execute mobile tooling from this profile.",
  ],
  metadataOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
  noFileGeneration: true,
});

export const buildDefaultMobileArchitectureLayers = (): MobileArchitectureLayer[] => [
  layer(
    "app_routes",
    "Advisory route ownership for future Expo Router app groups.",
    ["route_group_planning", "navigation_shell_metadata", "auth_gate_metadata"],
    ["business_logic", "provider_calls", "storage_mutation"],
    ["deep_link_strategy", "auth_gate_strategy"],
    ["srp", "ocp"],
  ),
  layer(
    "screens",
    "Screen-level orchestration and user-flow ownership.",
    ["screen_state_coordination", "empty_loading_error_state_planning"],
    ["provider_calls", "domain_rules", "persistent_storage_details"],
    ["accessibility_review", "flow_completion_review"],
    ["srp", "isp"],
  ),
  layer(
    "components",
    "Reusable presentational UI building blocks.",
    ["presentation", "composition", "accessibility_labels"],
    ["routing", "provider_calls", "business_orchestration"],
    ["design_system_alignment", "performance_re_render_review"],
    ["srp", "isp"],
  ),
  layer(
    "features",
    "Feature-owned composition across screens, state, and services.",
    ["feature_facade_metadata", "flow_ownership", "feature_test_targets"],
    ["global_runtime_wiring", "native_configuration"],
    ["feature_boundary_review", "extension_point_review"],
    ["srp", "ocp", "dip"],
  ),
  layer(
    "domain",
    "Pure domain concepts and business vocabulary.",
    ["entities", "value_objects", "domain_rules_metadata"],
    ["ui_rendering", "provider_calls", "storage_details"],
    ["domain_contract_review"],
    ["srp", "lsp", "dip"],
  ),
  layer(
    "services",
    "Application service boundaries for future use cases.",
    ["use_case_contracts", "orchestration_metadata"],
    ["raw_provider_clients", "native_module_calls"],
    ["dependency_direction_review"],
    ["srp", "ocp", "dip"],
    ["provider_dependency"],
  ),
  layer(
    "repositories",
    "Data repository boundary for API, cache, and local persistence strategy.",
    ["data_contract_metadata", "cache_strategy_metadata", "mapping_strategy"],
    ["screen_rendering", "credential_configuration"],
    ["offline_sync_review", "privacy_review"],
    ["srp", "dip"],
    ["offline_sync", "provider_dependency"],
  ),
  layer(
    "state",
    "State ownership and re-render pressure planning.",
    ["local_state_strategy", "feature_state_strategy", "server_cache_strategy"],
    ["business_rules_without_domain_contract", "provider_calls"],
    ["performance_review", "state_scope_review"],
    ["srp", "isp"],
  ),
  layer(
    "theme",
    "Design token and styling boundary.",
    ["tokens", "semantic_colors", "spacing_typography_metadata"],
    ["screen_flow_logic", "provider_calls"],
    ["accessibility_contrast_review"],
    ["srp"],
  ),
  layer(
    "mocks",
    "Mock data and fixture planning for future tests and demos.",
    ["safe_mock_contracts", "demo_fixture_metadata"],
    ["real_provider_credentials", "production_data"],
    ["privacy_review"],
    ["srp", "dip"],
  ),
  layer(
    "tests",
    "Testing target ownership and review posture.",
    ["unit_targets", "component_targets", "navigation_review_metadata"],
    ["runtime_ci_activation", "store_submission"],
    ["coverage_strategy_review"],
    ["srp"],
  ),
  layer(
    "config",
    "Configuration boundary for future app settings.",
    ["config_contract_metadata", "environment_boundary_notes"],
    ["secret_reads", "credential_writes", "runtime_config_mutation"],
    ["secret_boundary_review"],
    ["srp", "dip"],
    ["platform_policy"],
  ),
  layer(
    "native_future",
    "Future-gated native module and platform-specific boundary.",
    ["native_need_metadata", "approval_gate_notes"],
    ["native_project_generation", "native_configuration_mutation"],
    ["human_approval", "platform_capability_review"],
    ["dip"],
    ["native_module_future"],
  ),
  layer(
    "release_future",
    "Future-gated release and distribution boundary.",
    ["release_readiness_metadata", "rollout_notes", "policy_review_notes"],
    ["build_creation", "store_submission", "ci_activation"],
    ["human_approval", "platform_policy_review"],
    ["srp"],
    ["release_future", "platform_policy"],
  ),
];

export const describeMobileArchitectureLayer = (
  layerId: MobileArchitectureLayerId,
): MobileArchitectureLayer => {
  const found = buildDefaultMobileArchitectureLayers().find((item) => item.layer === layerId);
  if (!found) {
    throw new Error(`Unknown mobile architecture layer: ${layerId}`);
  }
  return found;
};

const buildNavigationProfile = (
  input: MobileArchitectureProfileInput,
): MobileNavigationProfile => {
  const factoryNavigation = factoryIntakeFromInput(input)?.navigationModel;
  const navigationNeeds = uniqueStrings([
    ...(input.navigationNeeds ?? []),
    ...(factoryNavigation?.primaryNavigation ?? []),
  ]);

  return {
    profileId: `mobile_navigation:${appTypeFromInput(input)}`,
    recommendedNavigation: "expo_router_advisory_profile",
    rootRoutePosture: "route_groups_for_onboarding_auth_main_settings_support",
    routeGroups: navigationNeeds.length > 0 ? navigationNeeds : ["onboarding", "main", "settings"],
    authGatePosture: factoryNavigation?.authGate ?? "auth_gate_depends_on_caller_supplied_auth_needs",
    modalPosture: factoryNavigation?.modalNeeds.join(", ") || "modal_needs_not_yet_specified",
    deepLinkPosture: factoryNavigation?.deepLinkNeeds.join(", ") || "deep_links_future_gated",
    recoveryPaths:
      factoryNavigation?.recoveryPaths.length ? [...factoryNavigation.recoveryPaths] : ["support", "offline_recovery"],
    accessibilityNotes: [
      "Plan accessible route names and screen titles.",
      "Review focus order for modal and auth flows before implementation.",
    ],
    metadataOnly: true,
    advisoryOnly: true,
    noRouteGeneration: true,
  };
};

const buildStateProfile = (
  input: MobileArchitectureProfileInput,
): MobileStateManagementProfile => ({
  profileId: `mobile_state:${appTypeFromInput(input)}`,
  localUiState: "keep_close_to_screen_or_component_until_shared_behavior_is_needed",
  featureState: "feature_owned_state_with_small_public_contracts",
  serverCacheState: "future_repository_or_query_cache_boundary",
  offlineQueueState:
    offlineNeedsFromInput(input).length > 0
      ? "future_gated_offline_queue_metadata_required"
      : "offline_queue_not_required_by_current_metadata",
  authSessionState:
    authNeedsFromInput(input).length > 0
      ? "future_gated_auth_session_metadata_required"
      : "auth_session_not_required_by_current_metadata",
  persistedPreferences: "preferences_may_be_profiled_but_not_configured_in_this_phase",
  reRenderRiskNotes: [
    "Plan list virtualization for long collections.",
    "Keep state ownership narrow to reduce avoidable renders.",
    "Defer profiling until a real app exists.",
  ],
  metadataOnly: true,
  advisoryOnly: true,
  noStoreGeneration: true,
});

const buildDataAccessProfile = (
  input: MobileArchitectureProfileInput,
): MobileDataAccessProfile => ({
  profileId: `mobile_data:${appTypeFromInput(input)}`,
  apiBoundary: "future_api_client_hidden_behind_services_or_repositories",
  repositoryBoundary: "repositories_map_external_data_to_domain_metadata",
  dtoMappingPosture: "map_transport_shapes_to_domain_shapes_before_screen_use",
  validationPosture: "validate_caller_supplied_contracts_before_future_runtime_use",
  errorNormalization: "normalize_provider_and_network_errors_before_ui_boundary",
  retryPosture:
    offlineNeedsFromInput(input).length > 0
      ? "retry_and_queue_strategy_requires_future_approval"
      : "simple_retry_posture_can_be_planned_later",
  providerBoundary: "providers_remain_future_gated_and_outside_mobile_profile_execution",
  metadataOnly: true,
  advisoryOnly: true,
  noNetworkCalls: true,
  noProviderCalls: true,
});

const buildOfflineProfile = (
  input: MobileArchitectureProfileInput,
): MobileOfflineProfile => {
  const offlineNeeds = offlineNeedsFromInput(input);
  const hasOfflineNeeds = offlineNeeds.length > 0;

  return {
    profileId: `mobile_offline:${appTypeFromInput(input)}`,
    cachePosture: hasOfflineNeeds ? "cache_strategy_required" : "cache_strategy_optional",
    localPersistencePosture: hasOfflineNeeds
      ? "local_persistence_requires_future_storage_approval"
      : "no_local_persistence_requested",
    offlineQueuePosture: hasOfflineNeeds
      ? "offline_queue_requires_conflict_and_recovery_design"
      : "offline_queue_not_requested",
    conflictResolutionPosture: hasOfflineNeeds
      ? "conflict_resolution_requires_human_review"
      : "conflict_resolution_not_required_by_current_metadata",
    syncRecoveryPosture: hasOfflineNeeds
      ? "sync_recovery_copy_and_support_paths_required"
      : "sync_recovery_not_required_by_current_metadata",
    staleDataMessaging: hasOfflineNeeds
      ? "plan_user_visible_stale_data_and_sync_status_messaging"
      : "not_applicable_yet",
    approvalRequired: hasOfflineNeeds,
    metadataOnly: true,
    advisoryOnly: true,
    noStorageConfiguration: true,
  };
};

const buildAuthProfile = (input: MobileArchitectureProfileInput): MobileAuthProfile => {
  const authNeeds = authNeedsFromInput(input);
  const hasAuthNeeds = authNeeds.length > 0;

  return {
    profileId: `mobile_auth:${appTypeFromInput(input)}`,
    authPosture: hasAuthNeeds ? "auth_required_future_gated" : "anonymous_or_no_auth_profile",
    sessionLifecycle: hasAuthNeeds
      ? "session_lifecycle_requires_future_privacy_review"
      : "session_lifecycle_not_required_by_current_metadata",
    accountRecovery: hasAuthNeeds ? "account_recovery_required" : "account_recovery_not_required_yet",
    accountDeletion: hasAuthNeeds ? "account_deletion_path_required" : "account_deletion_not_required_yet",
    permissionPromptPosture: "permission_prompts_require_screen_level_context_and_human_review",
    privacyReview: hasAuthNeeds ? "privacy_review_required" : "privacy_review_optional_for_current_metadata",
    metadataOnly: true,
    advisoryOnly: true,
    noCredentialUse: true,
  };
};

const buildSecurityProfile = (
  input: MobileArchitectureProfileInput,
): MobileSecurityProfile => {
  const safetyNeeds = safetyNeedsFromInput(input);
  const monetizationNeeds = monetizationNeedsFromInput(input);
  const approvals = requiredApprovalsFromInput(input);

  return {
    profileId: `mobile_security:${appTypeFromInput(input)}`,
    devicePermissionRisks: safetyNeeds.includes("device_permissions")
      ? ["device_permission_review_required"]
      : [],
    sensitiveDataRisks:
      authNeedsFromInput(input).length > 0 || safetyNeeds.length > 0
        ? ["privacy_and_sensitive_data_review_required"]
        : [],
    abuseRisks:
      appTypeFromInput(input) === "social_freemium_app" ||
      appTypeFromInput(input) === "ai_assistant_mobile_app"
        ? ["abuse_and_content_safety_review_required"]
        : [],
    paymentOrPremiumRisks:
      monetizationNeeds.length > 0 ? ["premium_or_payment_review_required"] : [],
    providerTrustBoundaries: ["provider_execution_is_future_gated"],
    requiredApprovals: approvals,
    metadataOnly: true,
    advisoryOnly: true,
    noSecretsAccess: true,
    noPaymentProcessing: true,
  };
};

const buildTestingProfile = (
  input: MobileArchitectureProfileInput,
): MobileTestingProfile => ({
  profileId: `mobile_testing:${appTypeFromInput(input)}`,
  unitTestTargets: ["domain_rules", "formatters", "state_selectors"],
  componentTestTargets:
    screenMapFromInput(input).length > 0
      ? screenMapFromInput(input).map((screen) => `component_review:${screen.screenId}`)
      : ["core_components"],
  navigationReview: ["route_guard_review", "deep_link_review", "recovery_path_review"],
  accessibilityReview: ["screen_title_review", "touch_target_review", "label_review"],
  offlineReview:
    offlineNeedsFromInput(input).length > 0
      ? ["cache_review", "queue_review", "conflict_review"]
      : ["offline_not_required_by_current_metadata"],
  authReview:
    authNeedsFromInput(input).length > 0
      ? ["auth_flow_review", "session_review", "account_recovery_review"]
      : ["auth_not_required_by_current_metadata"],
  performanceReviewTargets: [
    "fps_budget_metadata",
    "render_pressure_review",
    "startup_time_review",
    "bundle_size_review",
    "list_virtualization_review",
  ],
  releaseSmokeChecklist: ["navigation_smoke", "empty_state_smoke", "offline_recovery_smoke"],
  metadataOnly: true,
  advisoryOnly: true,
  noTestExecution: true,
});

const buildReleaseProfile = (
  input: MobileArchitectureProfileInput,
): MobileReleaseProfile => {
  const releaseTarget = releaseTargetFromInput(input);
  const approvals = requiredApprovalsFromInput(input);

  return {
    profileId: `mobile_release:${appTypeFromInput(input)}`,
    releaseTarget,
    readinessPosture: `${releaseTarget}_readiness_metadata_only`,
    privacyPolicyReadiness:
      authNeedsFromInput(input).length > 0 || safetyNeedsFromInput(input).length > 0
        ? "privacy_policy_review_required"
        : "privacy_policy_review_optional_for_current_metadata",
    crashReportingPosture: "future_gated_observability_posture",
    analyticsPosture: "future_gated_analytics_posture",
    platformPolicyReview: releaseTarget === "prototype" ? "not_required_yet" : "required_before_release",
    rolloutNotes: ["rollout_and_rollback_notes_required_before_real_release"],
    requiredApprovals: approvals,
    metadataOnly: true,
    advisoryOnly: true,
    noBuildCreation: true,
    noStoreSubmission: true,
    noCiActivation: true,
  };
};

const defaultNextStep = (riskLevel: PMRiskTier): PMRecommendedNextStep => ({
  nextStepId: "mobile_architecture_profile_next_step:123B",
  title: "Plan the mobile UX/UI pattern catalog",
  safeSummary:
    "Continue with Phase 123B to define reusable mobile UX/UI patterns before app generation is considered.",
  priority: riskLevel,
  decisionMode: "plan_only",
  riskSurfaces: ["scaffold", "release", "security_policy", "provider", "store"],
  recommendationOnly: true,
  noExecution: true,
});

export const recommendMobileArchitectureProfile = (
  input: MobileArchitectureProfileInput,
): MobileArchitectureRecommendation => {
  const appType = appTypeFromInput(input);
  const platformPriority = platformPriorityFromInput(input);
  const riskSignals = riskSignalsFromInput(input);
  const riskLevel = riskFromSignals(input, riskSignals);
  const requiredApprovals = uniqueStrings([
    ...requiredApprovalsFromInput(input),
    ...(riskSignals.includes("premium_or_payment") ? ["monetization_review"] : []),
    ...(riskSignals.includes("offline_sync") ? ["offline_sync_review"] : []),
    ...(riskSignals.includes("auth_or_sensitive_data") ? ["privacy_review"] : []),
    ...(riskSignals.includes("native_module_future") ? ["native_module_review"] : []),
    ...(riskSignals.includes("release_future") ? ["release_readiness_review"] : []),
  ]);
  const hasGaps =
    coreFlowsFromInput(input).length === 0 || screenMapFromInput(input).length === 0;

  return {
    recommendationId: `mobile_architecture_recommendation:${appType}`,
    appType,
    platformPriority,
    status:
      riskLevel === "critical"
        ? "blocked"
        : hasGaps
          ? "recommended_with_gaps"
          : "recommended",
    summary:
      `Recommend an Expo-managed advisory profile for ${appType} with ${platformPriority} platform priority.`,
    preferredWorkflow: "expo_managed_workflow_advisory_default",
    navigationStrategy: "expo_router_route_groups_metadata_only",
    projectStructureStrategy: "layered_app_routes_src_domain_services_repositories_state_theme_tests",
    riskLevel,
    riskSignals,
    requiredApprovals,
    recommendedNextStep: defaultNextStep(riskLevel),
    metadataOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noAppGeneration: true,
    noMobileTooling: true,
    noRuntimeExecution: true,
  };
};

export const createMobileArchitectureProfile = (
  input: MobileArchitectureProfileInput,
): MobileArchitectureProfile => {
  const recommendation = recommendMobileArchitectureProfile(input);
  const factoryIntake = factoryIntakeFromInput(input);
  const layers = buildDefaultMobileArchitectureLayers();
  const limitations = uniqueStrings([
    "Profile uses caller-supplied metadata only.",
    "No mobile app is generated.",
    "No mobile tooling is executed.",
    "No native project or release configuration is created.",
    ...(input.limitations ?? []),
  ]);

  return {
    profileId: input.profileId ?? `mobile_architecture_profile:${recommendation.appType}`,
    phaseRef: "Phase 122I",
    appType: recommendation.appType,
    platformPriority: recommendation.platformPriority,
    recommendedNavigation: buildNavigationProfile(input),
    recommendedProjectStructure: layers,
    stateManagementProfile: buildStateProfile(input),
    dataAccessProfile: buildDataAccessProfile(input),
    offlineProfile: buildOfflineProfile(input),
    authProfile: buildAuthProfile(input),
    securityProfile: buildSecurityProfile(input),
    testingProfile: buildTestingProfile(input),
    releaseProfile: buildReleaseProfile(input),
    architectureRecommendation: recommendation,
    riskLevel: recommendation.riskLevel,
    requiredApprovals: [...recommendation.requiredApprovals],
    limitations,
    evidenceRefs: [...(input.evidenceRefs ?? factoryIntake?.evidenceRefs ?? [])],
    consumedFactoryMetadata: uniqueStrings([
      ...(factoryIntake ? ["factory_intake"] : []),
      ...(input.factoryStrategy ? ["factory_strategy"] : []),
      "app_type",
      "platform_priority",
      "core_flows",
      "screen_map",
      "navigation_needs",
      "offline_needs",
      "auth_needs",
      "monetization_needs",
      "safety_needs",
      "release_target",
    ]),
    conversationalBuildLoopReadiness:
      "Ready to seed a future blueprint and Codex handoff prompt as metadata only.",
    metadataOnly: true,
    sourceOnly: true,
    advisoryOnly: true,
    reportOnly: true,
    noAppGeneration: true,
    noMobileTooling: true,
    noNativeProjectCreation: true,
    noPackageChanges: true,
    noProviderCalls: true,
    noRuntimeExecution: true,
    noDashboardMutation: true,
    noDbSqlMutation: true,
    noCiActivation: true,
    noMemoryPersistence: true,
    noGitAutomationFromSource: true,
  };
};

export const summarizeMobileArchitectureProfile = (
  profile: MobileArchitectureProfile,
): MobileArchitectureProfileSummary => ({
  profileId: profile.profileId,
  appType: profile.appType,
  platformPriority: profile.platformPriority,
  layerCount: profile.recommendedProjectStructure.length,
  riskLevel: profile.riskLevel,
  riskSignals: [...profile.architectureRecommendation.riskSignals],
  requiredApprovalCount: profile.requiredApprovals.length,
  releaseTarget: profile.releaseProfile.releaseTarget,
  recommendedNextPhase: profile.architectureRecommendation.recommendedNextStep.nextStepId.includes("123B")
    ? "Phase 123B"
    : "Phase 122I",
  safeSummary:
    `${profile.appType} architecture profile has ${profile.recommendedProjectStructure.length} advisory layer(s) and risk ${profile.riskLevel}.`,
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
});
