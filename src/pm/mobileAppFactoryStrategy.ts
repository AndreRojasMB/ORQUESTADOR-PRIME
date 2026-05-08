import type {
  PMEvidenceReference,
  PMRecommendedNextStep,
  PMRiskTier,
  ProjectPhaseRef,
} from "./types.js";

export type MobileAppFactoryAppType =
  | "habit_gamified_app"
  | "social_freemium_app"
  | "marketplace_app"
  | "erp_mobile_field_ops_app"
  | "education_app"
  | "service_booking_app"
  | "dashboard_companion_app"
  | "ai_assistant_mobile_app"
  | "unknown_mobile_app";

export type MobilePlatformPriority =
  | "ios_first"
  | "android_first"
  | "cross_platform"
  | "tablet_first"
  | "phased"
  | "unknown";

export type MobileReleaseTarget =
  | "internal_demo"
  | "prototype"
  | "mvp"
  | "beta"
  | "pilot"
  | "store_candidate"
  | "enterprise_distribution"
  | "future_release_ready";

export type MobileStrategyQualityStatus =
  | "ready"
  | "ready_with_gaps"
  | "needs_clarification"
  | "blocked";

export type MobileStrategySafetyStatus =
  | "advisory_safe"
  | "requires_human_review"
  | "blocked_by_execution_request";

export type MobileFactoryIntegrationUse =
  | "pm_status_context"
  | "task_graph_seed"
  | "dod_seed"
  | "risk_context"
  | "solid_review_context"
  | "autopilot_handoff_context"
  | "phase_closeout_context";

export interface MobileScreenMapItem {
  screenId: string;
  title: string;
  flowRef: string;
  userGoal: string;
  primaryActions: string[];
  requiredData: string[];
  emptyStateNeeds: string[];
  loadingStateNeeds: string[];
  errorStateNeeds: string[];
  accessibilityNotes: string[];
  securityNotes: string[];
  metadataOnly: true;
  advisoryOnly: true;
  noUiGeneration: true;
}

export interface MobileNavigationModel {
  rootModel: string;
  authGate: string;
  primaryNavigation: string[];
  modalNeeds: string[];
  deepLinkNeeds: string[];
  recoveryPaths: string[];
  metadataOnly: true;
  advisoryOnly: true;
  noRouteGeneration: true;
}

export interface MobileAppFactoryIntake {
  intakeId: string;
  appIdea: string;
  originalUserGoal: string;
  safeSummary: string;
  targetUsers: string[];
  businessGoal: string;
  platformPriority: MobilePlatformPriority;
  supportedAppType: MobileAppFactoryAppType;
  coreFlows: string[];
  screenMap: MobileScreenMapItem[];
  navigationModel: MobileNavigationModel;
  dataModelSummary: string;
  offlineNeeds: string[];
  authNeeds: string[];
  monetizationNeeds: string[];
  safetyNeeds: string[];
  releaseTarget: MobileReleaseTarget;
  riskLevel: PMRiskTier;
  requiredApprovals: string[];
  evidenceRefs: PMEvidenceReference[];
  assumptions: string[];
  exclusions: string[];
  metadataOnly: true;
  sourceOnly: true;
  advisoryOnly: true;
  noAppGeneration: true;
  noMobileTooling: true;
  noNativeProjectCreation: true;
  noProviderCalls: true;
  noRuntimeExecution: true;
}

export interface MobileAppFactoryIntakeInput {
  intakeId?: string;
  appIdea: string;
  originalUserGoal?: string;
  safeSummary?: string;
  targetUsers?: string[];
  businessGoal?: string;
  platformPriority?: MobilePlatformPriority;
  supportedAppType?: MobileAppFactoryAppType;
  coreFlows?: string[];
  screenMap?: MobileScreenMapItem[];
  navigationModel?: MobileNavigationModel;
  dataModelSummary?: string;
  offlineNeeds?: string[];
  authNeeds?: string[];
  monetizationNeeds?: string[];
  safetyNeeds?: string[];
  releaseTarget?: MobileReleaseTarget;
  riskLevel?: PMRiskTier;
  requiredApprovals?: string[];
  evidenceRefs?: PMEvidenceReference[];
  assumptions?: string[];
  exclusions?: string[];
}

export interface MobileAppFactoryQualityModel {
  qualityModelId: string;
  status: MobileStrategyQualityStatus;
  productChecklist: string[];
  uxChecklist: string[];
  accessibilityChecklist: string[];
  architectureChecklist: string[];
  securityChecklist: string[];
  testingStrategy: string[];
  releaseReadinessCriteria: string[];
  monetizationReview: string[];
  qualityGaps: string[];
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noTestExecution: true;
  noToolingExecution: true;
}

export interface MobileAppFactorySafetyModel {
  safetyModelId: string;
  status: MobileStrategySafetyStatus;
  boundaries: string[];
  stopConditions: string[];
  approvalRequiredBefore: string[];
  deniedActions: string[];
  riskLevel: PMRiskTier;
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noAppGeneration: true;
  noExternalAction: true;
  noCredentialUse: true;
  noPaymentProcessing: true;
  noProviderCalls: true;
  noRuntimeExecution: true;
  noDashboardMutation: true;
}

export interface MobileAppFactoryStrategy {
  strategyId: string;
  phaseRef: ProjectPhaseRef;
  appType: MobileAppFactoryAppType;
  intake: MobileAppFactoryIntake;
  qualityModel: MobileAppFactoryQualityModel;
  safetyModel: MobileAppFactorySafetyModel;
  architectureRecommendation: string;
  releaseReadinessSummary: string;
  pmIntegrationUse: MobileFactoryIntegrationUse[];
  solidIntegrationSummary: string;
  autopilotIntegrationSummary: string;
  recommendedNextStep: PMRecommendedNextStep;
  evidenceRefs: PMEvidenceReference[];
  assumptions: string[];
  exclusions: string[];
  metadataOnly: true;
  sourceOnly: true;
  advisoryOnly: true;
  reportOnly: true;
  noAppGeneration: true;
  noMobileTooling: true;
  noNativeProjectCreation: true;
  noProviderCalls: true;
  noRuntimeExecution: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
}

export interface MobileAppFactoryStrategySummary {
  strategyId: string;
  appType: MobileAppFactoryAppType;
  riskLevel: PMRiskTier;
  releaseTarget: MobileReleaseTarget;
  qualityStatus: MobileStrategyQualityStatus;
  safetyStatus: MobileStrategySafetyStatus;
  requiredApprovalCount: number;
  screenCount: number;
  coreFlowCount: number;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  metadataOnly: true;
  advisoryOnly: true;
  noExecution: true;
}

export const mobileAppFactoryAppTypes: readonly MobileAppFactoryAppType[] = [
  "habit_gamified_app",
  "social_freemium_app",
  "marketplace_app",
  "erp_mobile_field_ops_app",
  "education_app",
  "service_booking_app",
  "dashboard_companion_app",
  "ai_assistant_mobile_app",
  "unknown_mobile_app",
];

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const defaultNavigationModel = (): MobileNavigationModel => ({
  rootModel: "stack_with_future_tab_or_modal_options",
  authGate: "caller_supplied_auth_needs_required_before_design",
  primaryNavigation: ["onboarding", "main_flow", "settings", "support"],
  modalNeeds: [],
  deepLinkNeeds: [],
  recoveryPaths: ["account_recovery", "offline_recovery", "support"],
  metadataOnly: true,
  advisoryOnly: true,
  noRouteGeneration: true,
});

const defaultRiskFromIntake = (input: MobileAppFactoryIntakeInput): PMRiskTier => {
  const highRiskSignals = [
    ...(input.authNeeds ?? []),
    ...(input.monetizationNeeds ?? []),
    ...(input.safetyNeeds ?? []),
  ].join(" ").toLowerCase();

  if (highRiskSignals.includes("payment") || highRiskSignals.includes("sensitive")) {
    return "high";
  }

  if ((input.offlineNeeds?.length ?? 0) > 0 || (input.authNeeds?.length ?? 0) > 0) {
    return "medium";
  }

  return "low";
};

export const classifyMobileAppType = (appIdea: string): MobileAppFactoryAppType => {
  const idea = appIdea.toLowerCase();

  if (idea.includes("habit") || idea.includes("gamif")) return "habit_gamified_app";
  if (idea.includes("social") || idea.includes("community") || idea.includes("freemium")) {
    return "social_freemium_app";
  }
  if (idea.includes("marketplace") || idea.includes("seller") || idea.includes("buyer")) {
    return "marketplace_app";
  }
  if (idea.includes("erp") || idea.includes("field ops") || idea.includes("operation")) {
    return "erp_mobile_field_ops_app";
  }
  if (idea.includes("education") || idea.includes("learning") || idea.includes("course")) {
    return "education_app";
  }
  if (idea.includes("booking") || idea.includes("appointment") || idea.includes("service")) {
    return "service_booking_app";
  }
  if (idea.includes("dashboard") || idea.includes("companion")) {
    return "dashboard_companion_app";
  }
  if (idea.includes("assistant") || idea.includes("ai ")) return "ai_assistant_mobile_app";

  return "unknown_mobile_app";
};

export const createMobileAppFactoryIntake = (
  input: MobileAppFactoryIntakeInput,
): MobileAppFactoryIntake => {
  const supportedAppType = input.supportedAppType ?? classifyMobileAppType(input.appIdea);
  const riskLevel = input.riskLevel ?? defaultRiskFromIntake(input);

  return {
    intakeId: input.intakeId ?? `mobile_intake:${supportedAppType}`,
    appIdea: input.appIdea,
    originalUserGoal: input.originalUserGoal ?? input.appIdea,
    safeSummary: input.safeSummary ?? `Advisory mobile strategy intake for ${supportedAppType}.`,
    targetUsers: uniqueStrings(input.targetUsers),
    businessGoal: input.businessGoal ?? "clarify_mobile_product_strategy",
    platformPriority: input.platformPriority ?? "cross_platform",
    supportedAppType,
    coreFlows: uniqueStrings(input.coreFlows),
    screenMap: [...(input.screenMap ?? [])],
    navigationModel: input.navigationModel ?? defaultNavigationModel(),
    dataModelSummary: input.dataModelSummary ?? "caller_supplied_data_model_pending",
    offlineNeeds: uniqueStrings(input.offlineNeeds),
    authNeeds: uniqueStrings(input.authNeeds),
    monetizationNeeds: uniqueStrings(input.monetizationNeeds),
    safetyNeeds: uniqueStrings(input.safetyNeeds),
    releaseTarget: input.releaseTarget ?? "prototype",
    riskLevel,
    requiredApprovals: uniqueStrings(input.requiredApprovals),
    evidenceRefs: [...(input.evidenceRefs ?? [])],
    assumptions: uniqueStrings(input.assumptions),
    exclusions: uniqueStrings([
      "No app generation is performed.",
      "No mobile tooling is executed.",
      "No native project folders are created.",
      ...(input.exclusions ?? []),
    ]),
    metadataOnly: true,
    sourceOnly: true,
    advisoryOnly: true,
    noAppGeneration: true,
    noMobileTooling: true,
    noNativeProjectCreation: true,
    noProviderCalls: true,
    noRuntimeExecution: true,
  };
};

export const buildMobileAppFactoryQualityModel = (
  intake: MobileAppFactoryIntake,
): MobileAppFactoryQualityModel => {
  const qualityGaps = [
    ...(intake.targetUsers.length === 0 ? ["target_users_missing"] : []),
    ...(intake.coreFlows.length === 0 ? ["core_flows_missing"] : []),
    ...(intake.screenMap.length === 0 ? ["screen_map_missing"] : []),
    ...(intake.requiredApprovals.length === 0 && intake.riskLevel !== "low"
      ? ["approval_plan_missing_for_non_low_risk_strategy"]
      : []),
  ];

  return {
    qualityModelId: `mobile_quality:${intake.intakeId}`,
    status:
      qualityGaps.length === 0
        ? "ready"
        : intake.riskLevel === "critical"
          ? "blocked"
          : "ready_with_gaps",
    productChecklist: [
      "primary_users_defined",
      "success_metric_defined",
      "core_flows_defined",
      "release_target_defined",
    ],
    uxChecklist: [
      "onboarding_planned",
      "empty_loading_error_states_planned",
      "navigation_model_planned",
      "support_and_recovery_paths_planned",
    ],
    accessibilityChecklist: [
      "accessibility_needs_collected",
      "touch_targets_review_planned",
      "screen_reader_labels_review_planned",
    ],
    architectureChecklist: [
      "screen_ownership_planned",
      "state_ownership_planned",
      "data_adapter_boundaries_planned",
      "offline_posture_planned",
    ],
    securityChecklist: [
      "auth_needs_collected",
      "privacy_posture_planned",
      "sensitive_data_review_planned",
      "human_approval_points_identified",
    ],
    testingStrategy: [
      "unit_test_targets_planned",
      "component_test_targets_planned",
      "navigation_review_planned",
      "accessibility_review_planned",
      "release_smoke_checklist_planned",
    ],
    releaseReadinessCriteria: [
      "privacy_review_ready",
      "support_model_ready",
      "platform_policy_review_ready",
      "rollout_and_rollback_notes_ready",
    ],
    monetizationReview: [
      "premium_boundary_planned",
      "upgrade_ux_review_planned",
      "payment_or_store_risk_requires_future_approval",
    ],
    qualityGaps,
    metadataOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noTestExecution: true,
    noToolingExecution: true,
  };
};

export const buildMobileAppFactorySafetyModel = (
  intake: MobileAppFactoryIntake,
): MobileAppFactorySafetyModel => {
  const approvalRequiredBefore = uniqueStrings([
    ...intake.requiredApprovals,
    ...(intake.monetizationNeeds.length > 0 ? ["payment_or_store_configuration"] : []),
    ...(intake.authNeeds.length > 0 ? ["auth_and_privacy_implementation"] : []),
    ...(intake.safetyNeeds.length > 0 ? ["safety_and_policy_review"] : []),
  ]);

  return {
    safetyModelId: `mobile_safety:${intake.intakeId}`,
    status:
      intake.riskLevel === "critical"
        ? "blocked_by_execution_request"
        : approvalRequiredBefore.length > 0
          ? "requires_human_review"
          : "advisory_safe",
    boundaries: [
      "source_only",
      "advisory_only",
      "metadata_only",
      "no_app_generation",
      "no_mobile_tooling",
      "no_provider_calls",
      "no_runtime_execution",
    ],
    stopConditions: [
      "mobile_project_creation_requested",
      "native_folder_creation_requested",
      "credential_or_payment_setup_requested",
      "store_submission_requested",
      "production_backend_requested",
      "runtime_execution_requested",
    ],
    approvalRequiredBefore,
    deniedActions: [
      "generate_mobile_app",
      "create_native_project",
      "run_mobile_tooling",
      "configure_credentials",
      "process_payments",
      "submit_store_metadata",
      "call_external_provider",
    ],
    riskLevel: intake.riskLevel,
    metadataOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noAppGeneration: true,
    noExternalAction: true,
    noCredentialUse: true,
    noPaymentProcessing: true,
    noProviderCalls: true,
    noRuntimeExecution: true,
    noDashboardMutation: true,
  };
};

const recommendedNextStep = (riskLevel: PMRiskTier): PMRecommendedNextStep => ({
  nextStepId: "mobile_factory_next_step:122B",
  title: "Plan the React Native and Expo architecture profile",
  safeSummary:
    "Continue with Phase 122B to define mobile architecture posture before any app generation is considered.",
  priority: riskLevel,
  decisionMode: "plan_only",
  riskSurfaces: ["scaffold", "release", "security_policy", "provider", "store"],
  recommendationOnly: true,
  noExecution: true,
});

export const buildMobileAppFactoryStrategy = (
  input: MobileAppFactoryIntakeInput,
): MobileAppFactoryStrategy => {
  const intake = createMobileAppFactoryIntake(input);
  const qualityModel = buildMobileAppFactoryQualityModel(intake);
  const safetyModel = buildMobileAppFactorySafetyModel(intake);

  return {
    strategyId: `mobile_strategy:${intake.intakeId}`,
    phaseRef: "Phase 121I",
    appType: intake.supportedAppType,
    intake,
    qualityModel,
    safetyModel,
    architectureRecommendation:
      "Use future React Native and Expo architecture profiling as advisory context before any implementation phase.",
    releaseReadinessSummary:
      "Release readiness is a future checklist posture only; no build, store, or publication action is performed.",
    pmIntegrationUse: [
      "pm_status_context",
      "task_graph_seed",
      "dod_seed",
      "risk_context",
      "solid_review_context",
      "autopilot_handoff_context",
      "phase_closeout_context",
    ],
    solidIntegrationSummary:
      "The strategy can seed SOLID, frontend responsibility, backend layering, and boundary reviews as metadata.",
    autopilotIntegrationSummary:
      "The strategy can be carried as handoff context without triggering generation, execution, or memory persistence.",
    recommendedNextStep: recommendedNextStep(intake.riskLevel),
    evidenceRefs: [...intake.evidenceRefs],
    assumptions: [...intake.assumptions],
    exclusions: [...intake.exclusions],
    metadataOnly: true,
    sourceOnly: true,
    advisoryOnly: true,
    reportOnly: true,
    noAppGeneration: true,
    noMobileTooling: true,
    noNativeProjectCreation: true,
    noProviderCalls: true,
    noRuntimeExecution: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
  };
};

export const summarizeMobileAppFactoryStrategy = (
  strategy: MobileAppFactoryStrategy,
): MobileAppFactoryStrategySummary => ({
  strategyId: strategy.strategyId,
  appType: strategy.appType,
  riskLevel: strategy.intake.riskLevel,
  releaseTarget: strategy.intake.releaseTarget,
  qualityStatus: strategy.qualityModel.status,
  safetyStatus: strategy.safetyModel.status,
  requiredApprovalCount: strategy.intake.requiredApprovals.length,
  screenCount: strategy.intake.screenMap.length,
  coreFlowCount: strategy.intake.coreFlows.length,
  recommendedNextPhase: strategy.recommendedNextStep.nextStepId.includes("122B")
    ? "Phase 122B"
    : "Phase 121I",
  safeSummary:
    `${strategy.appType} strategy is ${strategy.safetyModel.status} with ${strategy.qualityModel.qualityGaps.length} quality gap(s).`,
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
});
