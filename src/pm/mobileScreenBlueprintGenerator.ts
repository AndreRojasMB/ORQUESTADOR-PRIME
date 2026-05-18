import type {
  MobileFeatureBlueprint,
  MobileFeatureBlueprintOutput,
} from "./mobileFeatureBlueprintGenerator.js";
import type { MobileAppFactoryAppType } from "./mobileAppFactoryStrategy.js";
import type { PMEvidenceReference, PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type MobileScreenCategory =
  | "onboarding"
  | "auth_login"
  | "auth_register"
  | "home_dashboard"
  | "list"
  | "detail"
  | "form"
  | "profile"
  | "settings"
  | "chat_thread"
  | "marketplace_browse"
  | "marketplace_detail"
  | "gamification_progress"
  | "paywall"
  | "offline_recovery"
  | "safety_report"
  | "admin_management"
  | "ai_assistant"
  | "unknown";

export type MobileScreenScope = "mvp" | "beta" | "release" | "deferred" | "blocked";

export type MobileComponentSlotType =
  | "header"
  | "primary_content"
  | "list_item"
  | "form_field"
  | "primary_action"
  | "secondary_action"
  | "status_banner"
  | "empty_state"
  | "loading_state"
  | "error_state"
  | "offline_state"
  | "navigation_entry"
  | "safety_action"
  | "monetization_action"
  | "unknown";

export type MobileScreenBlueprintConfidence = "high" | "medium" | "low" | "blocked_by_unknowns";

export type MobileScreenBlueprintNextArtifact =
  | "mobile_api_contract_planner"
  | "screen_followup_needed"
  | "human_review"
  | "blocked_by_unknowns";

export type MobileScreenArtifactTarget =
  | "mobile_app_factory_strategy"
  | "react_native_expo_architecture_profile"
  | "mobile_ux_ui_pattern_catalog"
  | "mobile_navigation_flow_model"
  | "mobile_state_management_strategy"
  | "offline_cache_sync_strategy"
  | "mobile_security_baseline"
  | "mobile_performance_checklist"
  | "mobile_testing_strategy"
  | "mobile_release_eas_strategy"
  | "pm_report"
  | "task_graph"
  | "dod_criteria"
  | "risk_blocker_model"
  | "autopilot_handoff_context";

export interface MobileScreenBlueprintSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noScreenGeneration: true;
  noComponentGeneration: true;
  noRouteGeneration: true;
  noAppGeneration: true;
  noCodexExecution: true;
  noExpoEasExecution: true;
  noNativeProjectCreation: true;
  noPackageChanges: true;
  noCredentialUse: true;
  noProviderCalls: true;
  noRuntimeExecution: true;
  noDashboardMutation: true;
  noDbSqlMutation: true;
  noCiActivation: true;
  noMemoryPersistence: true;
  noGitAutomationFromSource: true;
}

export interface MobileComponentSlot {
  slotId: string;
  slotName: string;
  slotType: MobileComponentSlotType;
  purpose: string;
  required: boolean;
  dataNeeds: readonly string[];
  interactionNotes: readonly string[];
  accessibilityRequirement: string;
  stateRefs: readonly string[];
  riskLevel: PMRiskTier;
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobileScreenBlueprintSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noComponentGeneration" | "noRuntimeExecution"
  >;
}

export interface MobileScreenAcceptanceCriterion {
  criterionId: string;
  title: string;
  description: string;
  category: MobileScreenCategory;
  expectedEvidence: readonly string[];
  riskLevel: PMRiskTier;
  requiredForScope: readonly MobileScreenScope[];
  safetyBoundaries: Pick<
    MobileScreenBlueprintSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noRuntimeExecution"
  >;
}

export interface MobileScreenDefinitionOfDone {
  dodId: string;
  checklistItems: readonly string[];
  mappedArtifacts: readonly MobileScreenArtifactTarget[];
  requiredEvidence: readonly string[];
  riskLevel: PMRiskTier;
  humanReviewRequired: boolean;
  safetyBoundaries: Pick<
    MobileScreenBlueprintSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noCodexExecution" | "noRuntimeExecution"
  >;
}

export interface MobileScreenBlueprint {
  screenBlueprintId: string;
  screenId: string;
  screenName: string;
  description: string;
  sourceFeatureRefs: readonly string[];
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  targetUsers: readonly string[];
  userRoles: readonly string[];
  routeRefs: readonly string[];
  uxPatternRefs: readonly string[];
  screenStateRefs: readonly string[];
  componentSlots: readonly MobileComponentSlot[];
  dataRefs: readonly string[];
  stateRefs: readonly string[];
  securityRefs: readonly string[];
  accessibilityNotes: readonly string[];
  safetyNotes: readonly string[];
  performanceRefs: readonly string[];
  testingRefs: readonly string[];
  releaseRefs: readonly string[];
  phaseScope: readonly MobileScreenScope[];
  category: MobileScreenCategory;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  acceptanceCriteria: readonly MobileScreenAcceptanceCriterion[];
  definitionOfDone: MobileScreenDefinitionOfDone;
  limitations: readonly string[];
  safetyBoundaries: MobileScreenBlueprintSafetyBoundaries;
}

export interface MobileScreenBlueprintGeneratorInput {
  generatorInputId: string;
  sourceFeatureBlueprintOutputRef: string;
  featureBlueprints: readonly MobileFeatureBlueprint[];
  uxPatternContext: readonly string[];
  navigationContext: readonly string[];
  stateContext: readonly string[];
  offlineContext: readonly string[];
  securityContext: readonly string[];
  performanceContext: readonly string[];
  testingContext: readonly string[];
  releaseContext: readonly string[];
  constraints: readonly string[];
  assumptions: readonly string[];
  evidenceRefs: readonly PMEvidenceReference[];
  safetyBoundaries: MobileScreenBlueprintSafetyBoundaries;
}

export interface MobileScreenArtifactMapping {
  mappingId: string;
  sourceScreenBlueprintRefs: readonly string[];
  mobileAppFactoryStrategy: readonly string[];
  reactNativeExpoArchitectureProfile: readonly string[];
  mobileUxUiPatternCatalog: readonly string[];
  mobileNavigationFlowModel: readonly string[];
  mobileStateManagementStrategy: readonly string[];
  offlineCacheSyncStrategy: readonly string[];
  mobileSecurityBaseline: readonly string[];
  mobilePerformanceChecklist: readonly string[];
  mobileTestingStrategy: readonly string[];
  mobileReleaseEasStrategy: readonly string[];
  pmReport: readonly string[];
  taskGraph: readonly string[];
  dodCriteria: readonly string[];
  riskBlockerModel: readonly string[];
  autopilotHandoffContext: readonly string[];
  safetyBoundaries: Pick<
    MobileScreenBlueprintSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noCodexExecution" | "noRuntimeExecution"
  >;
}

export interface MobileScreenBlueprintRecommendation {
  recommendationId: string;
  safeSummary: string;
  nextRecommendedArtifact: MobileScreenBlueprintNextArtifact;
  humanReviewRequired: boolean;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<
    MobileScreenBlueprintSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noCodexExecution" | "noAppGeneration"
  >;
}

export interface MobileScreenBlueprintSummary {
  outputId: string;
  sourceFeatureBlueprintOutputRef: string;
  screenBlueprintCount: number;
  mvpScreenCount: number;
  betaScreenCount: number;
  releaseScreenCount: number;
  blockedScreenCount: number;
  componentSlotCount: number;
  requiredApprovalCount: number;
  unresolvedQuestionCount: number;
  screenCategories: readonly MobileScreenCategory[];
  riskLevel: PMRiskTier;
  confidence: MobileScreenBlueprintConfidence;
  humanReviewRequired: boolean;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: MobileScreenBlueprintSafetyBoundaries;
}

export interface MobileScreenBlueprintOutput {
  outputId: string;
  sourceFeatureBlueprintOutputRef: string;
  screenBlueprints: readonly MobileScreenBlueprint[];
  mvpScreens: readonly MobileScreenBlueprint[];
  betaScreens: readonly MobileScreenBlueprint[];
  releaseScreens: readonly MobileScreenBlueprint[];
  blockedScreens: readonly MobileScreenBlueprint[];
  unresolvedQuestions: readonly string[];
  recommendedNextArtifact: MobileScreenBlueprintNextArtifact;
  confidence: MobileScreenBlueprintConfidence;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  artifactMapping: MobileScreenArtifactMapping;
  recommendation: MobileScreenBlueprintRecommendation;
  summary: MobileScreenBlueprintSummary;
  safetyBoundaries: MobileScreenBlueprintSafetyBoundaries;
}

export interface MobileScreenBlueprintGeneratorInputParams {
  generatorInputId?: string;
  sourceFeatureBlueprintOutputRef?: string;
  featureBlueprintOutput?: MobileFeatureBlueprintOutput;
  featureBlueprints?: readonly MobileFeatureBlueprint[];
  uxPatternContext?: readonly string[];
  navigationContext?: readonly string[];
  stateContext?: readonly string[];
  offlineContext?: readonly string[];
  securityContext?: readonly string[];
  performanceContext?: readonly string[];
  testingContext?: readonly string[];
  releaseContext?: readonly string[];
  constraints?: readonly string[];
  assumptions?: readonly string[];
  evidenceRefs?: readonly PMEvidenceReference[];
}

export const mobileScreenCategories: readonly MobileScreenCategory[] = [
  "onboarding",
  "auth_login",
  "auth_register",
  "home_dashboard",
  "list",
  "detail",
  "form",
  "profile",
  "settings",
  "chat_thread",
  "marketplace_browse",
  "marketplace_detail",
  "gamification_progress",
  "paywall",
  "offline_recovery",
  "safety_report",
  "admin_management",
  "ai_assistant",
  "unknown",
];

const safetyBoundaries = (): MobileScreenBlueprintSafetyBoundaries => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noScreenGeneration: true,
  noComponentGeneration: true,
  noRouteGeneration: true,
  noAppGeneration: true,
  noCodexExecution: true,
  noExpoEasExecution: true,
  noNativeProjectCreation: true,
  noPackageChanges: true,
  noCredentialUse: true,
  noProviderCalls: true,
  noRuntimeExecution: true,
  noDashboardMutation: true,
  noDbSqlMutation: true,
  noCiActivation: true,
  noMemoryPersistence: true,
  noGitAutomationFromSource: true,
});

const passiveSafety = (): MobileScreenAcceptanceCriterion["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noRuntimeExecution: true,
});

const slotSafety = (): MobileComponentSlot["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noComponentGeneration: true,
  noRuntimeExecution: true,
});

const dodSafety = (): MobileScreenDefinitionOfDone["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noCodexExecution: true,
  noRuntimeExecution: true,
});

const mappingSafety = (): MobileScreenArtifactMapping["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noCodexExecution: true,
  noRuntimeExecution: true,
});

const recommendationSafety = (): MobileScreenBlueprintRecommendation["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noCodexExecution: true,
  noAppGeneration: true,
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

const sourceFeatureOutputRef = (params: MobileScreenBlueprintGeneratorInputParams): string => {
  if (params.sourceFeatureBlueprintOutputRef) return params.sourceFeatureBlueprintOutputRef;
  if (params.featureBlueprintOutput) return params.featureBlueprintOutput.outputId;
  return "mobile_feature_blueprint_output:unspecified";
};

const featureBlueprintsFromParams = (
  params: MobileScreenBlueprintGeneratorInputParams,
): readonly MobileFeatureBlueprint[] => {
  if (params.featureBlueprints) return [...params.featureBlueprints];
  if (params.featureBlueprintOutput) return [...params.featureBlueprintOutput.blueprints];
  return [];
};

const screenCategoryFromFeature = (feature: MobileFeatureBlueprint): MobileScreenCategory => {
  const text = `${feature.category} ${feature.featureName} ${feature.description}`.toLowerCase();

  if (text.includes("onboard")) return "onboarding";
  if (text.includes("register") || text.includes("sign up") || text.includes("signup")) return "auth_register";
  if (text.includes("auth") || text.includes("login") || text.includes("session") || text.includes("account")) {
    return "auth_login";
  }
  if (text.includes("dashboard") || text.includes("home")) return "home_dashboard";
  if (text.includes("list") || text.includes("browse")) return "list";
  if (text.includes("detail")) return "detail";
  if (text.includes("form") || text.includes("submit") || text.includes("booking")) return "form";
  if (text.includes("profile")) return "profile";
  if (text.includes("settings")) return "settings";
  if (text.includes("message") || text.includes("chat")) return "chat_thread";
  if (text.includes("marketplace") && text.includes("detail")) return "marketplace_detail";
  if (text.includes("marketplace") || text.includes("buyer") || text.includes("seller")) return "marketplace_browse";
  if (text.includes("gamif") || text.includes("progress")) return "gamification_progress";
  if (text.includes("monet") || text.includes("subscription") || text.includes("payment")) return "paywall";
  if (text.includes("offline") || text.includes("sync")) return "offline_recovery";
  if (text.includes("safety") || text.includes("privacy") || text.includes("report") || text.includes("block")) {
    return "safety_report";
  }
  if (text.includes("admin")) return "admin_management";
  if (text.includes("ai") || text.includes("assistant")) return "ai_assistant";

  return "unknown";
};

const scopesFromFeature = (feature: MobileFeatureBlueprint): MobileScreenScope[] =>
  feature.phaseScope.map((scope) => scope as MobileScreenScope);

const defaultScreenStateRefs = (category: MobileScreenCategory, feature: MobileFeatureBlueprint): string[] =>
  uniqueStrings([
    `${category}:loading`,
    `${category}:empty`,
    `${category}:error`,
    ...(feature["dataRefs"].length > 0 ? [`${category}:partial_data`] : []),
    ...(feature.phaseScope.includes("blocked") ? [`${category}:blocked`] : []),
    ...(category === "offline_recovery" ? [`${category}:offline`] : []),
    ...(category === "paywall" ? [`${category}:limit_reached`] : []),
    ...(category === "safety_report" ? [`${category}:safety_review`] : []),
  ]);

export const createMobileComponentSlot = (
  input: Omit<MobileComponentSlot, "safetyBoundaries"> & {
    safetyBoundaries?: MobileComponentSlot["safetyBoundaries"];
  },
): MobileComponentSlot => ({
  slotId: input.slotId,
  slotName: input.slotName,
  slotType: input.slotType,
  purpose: input.purpose,
  required: input.required,
  dataNeeds: uniqueStrings(input.dataNeeds),
  interactionNotes: uniqueStrings(input.interactionNotes),
  accessibilityRequirement: input.accessibilityRequirement,
  stateRefs: uniqueStrings(input.stateRefs),
  riskLevel: input.riskLevel,
  limitations: uniqueStrings(input.limitations),
  safetyBoundaries: input.safetyBoundaries ?? slotSafety(),
});

const defaultComponentSlots = (
  screenId: string,
  category: MobileScreenCategory,
  feature: MobileFeatureBlueprint,
): readonly MobileComponentSlot[] => {
  const baseSlots: MobileComponentSlot[] = [
    createMobileComponentSlot({
      slotId: `${screenId}:slot:header`,
      slotName: "Screen header",
      slotType: "header",
      purpose: "Orient the user and expose safe navigation context.",
      required: true,
      dataNeeds: [],
      interactionNotes: ["back_or_close_posture_metadata"],
      accessibilityRequirement: "Header purpose and hierarchy must be clear to assistive technology.",
      stateRefs: [],
      riskLevel: feature.riskLevel,
      limitations: ["metadata_only_slot"],
    }),
    createMobileComponentSlot({
      slotId: `${screenId}:slot:primary_content`,
      slotName: "Primary content",
      slotType: "primary_content",
      purpose: "Represent the main user outcome for the source feature.",
      required: true,
      dataNeeds: [...feature.dataRefs],
      interactionNotes: ["content_adapts_to_loading_empty_error_and_offline_states"],
      accessibilityRequirement: "Primary content must preserve reading order and reduced cognitive load.",
      stateRefs: defaultScreenStateRefs(category, feature),
      riskLevel: feature.riskLevel,
      limitations: ["metadata_only_slot"],
    }),
    createMobileComponentSlot({
      slotId: `${screenId}:slot:primary_action`,
      slotName: "Primary action",
      slotType: "primary_action",
      purpose: "Describe the main user action for future implementation planning.",
      required: true,
      dataNeeds: [...feature.dataRefs],
      interactionNotes: ["action_requires_validation_and_recovery_metadata"],
      accessibilityRequirement: "Primary action must have a clear accessible name and disabled-state posture.",
      stateRefs: [...feature.stateRefs],
      riskLevel: feature.riskLevel,
      limitations: ["metadata_only_slot"],
    }),
  ];

  const extraSlots: MobileComponentSlot[] = [];

  if (category === "form" || category === "auth_login" || category === "auth_register" || category === "profile") {
    extraSlots.push(
      createMobileComponentSlot({
        slotId: `${screenId}:slot:form_field_group`,
        slotName: "Form field group",
        slotType: "form_field",
        purpose: "Describe future field grouping, validation, and recovery requirements.",
        required: true,
        dataNeeds: [...feature.dataRefs],
        interactionNotes: ["validation_and_error_copy_required_before_implementation"],
        accessibilityRequirement: "Fields need labels, errors, focus order, and recovery guidance.",
        stateRefs: [...feature.stateRefs],
        riskLevel: feature.riskLevel,
        limitations: ["metadata_only_slot"],
      }),
    );
  }

  if (category === "list" || category === "marketplace_browse") {
    extraSlots.push(
      createMobileComponentSlot({
        slotId: `${screenId}:slot:list_item_pattern`,
        slotName: "List item pattern",
        slotType: "list_item",
        purpose: "Describe repeated item metadata, selection posture, and empty-state expectations.",
        required: true,
        dataNeeds: [...feature.dataRefs],
        interactionNotes: ["large_list_and_empty_state_review_required"],
        accessibilityRequirement: "Repeated items need meaningful labels and predictable selection behavior.",
        stateRefs: defaultScreenStateRefs(category, feature),
        riskLevel: feature.riskLevel,
        limitations: ["metadata_only_slot"],
      }),
    );
  }

  if (category === "offline_recovery") {
    extraSlots.push(
      createMobileComponentSlot({
        slotId: `${screenId}:slot:offline_status`,
        slotName: "Offline status",
        slotType: "offline_state",
        purpose: "Describe offline recovery and stale-data feedback requirements.",
        required: true,
        dataNeeds: [...feature.dataRefs],
        interactionNotes: ["recovery_path_and_conflict_copy_required"],
        accessibilityRequirement: "Offline status must be perceivable without relying on color alone.",
        stateRefs: [`${category}:offline`],
        riskLevel: feature.riskLevel,
        limitations: ["metadata_only_slot"],
      }),
    );
  }

  if (category === "paywall") {
    extraSlots.push(
      createMobileComponentSlot({
        slotId: `${screenId}:slot:monetization_action`,
        slotName: "Monetization action",
        slotType: "monetization_action",
        purpose: "Describe future subscription or limit explanation posture.",
        required: true,
        dataNeeds: [],
        interactionNotes: ["pricing_policy_review_required_before_implementation"],
        accessibilityRequirement: "Value, limits, and recovery options must be clear.",
        stateRefs: [`${category}:limit_reached`],
        riskLevel: feature.riskLevel,
        limitations: ["metadata_only_slot", "approval_required_before_monetization_work"],
      }),
    );
  }

  if (category === "safety_report") {
    extraSlots.push(
      createMobileComponentSlot({
        slotId: `${screenId}:slot:safety_action`,
        slotName: "Safety action",
        slotType: "safety_action",
        purpose: "Describe report, block, and review posture for future safety UX.",
        required: true,
        dataNeeds: [...feature.securityRefs],
        interactionNotes: ["human_review_required_before_safety_flow_implementation"],
        accessibilityRequirement: "Safety actions must be clear, calm, and reversible where policy allows.",
        stateRefs: [`${category}:safety_review`],
        riskLevel: feature.riskLevel,
        limitations: ["metadata_only_slot", "human_review_required"],
      }),
    );
  }

  return [...baseSlots, ...extraSlots];
};

const defaultAcceptanceCriteria = (
  screenId: string,
  category: MobileScreenCategory,
  description: string,
  riskLevel: PMRiskTier,
  scopes: readonly MobileScreenScope[],
): readonly MobileScreenAcceptanceCriterion[] => [
  {
    criterionId: `${screenId}:criterion:user_outcome`,
    title: "Screen outcome described",
    description,
    category,
    expectedEvidence: ["source_feature_ref", "screen_scope_ref", "human_review_if_required"],
    riskLevel,
    requiredForScope: [...scopes],
    safetyBoundaries: passiveSafety(),
  },
  {
    criterionId: `${screenId}:criterion:states_accessibility_safety`,
    title: "States, accessibility, and safety mapped",
    description: "Loading, empty, error, offline, accessibility, safety, testing, and release needs remain mapped as metadata.",
    category,
    expectedEvidence: ["ux_state_refs", "accessibility_notes", "safety_notes", "testing_refs"],
    riskLevel,
    requiredForScope: [...scopes],
    safetyBoundaries: passiveSafety(),
  },
];

const defaultDefinitionOfDone = (
  screenId: string,
  mappedArtifacts: readonly MobileScreenArtifactTarget[],
  riskLevel: PMRiskTier,
): MobileScreenDefinitionOfDone => ({
  dodId: `${screenId}:dod`,
  checklistItems: [
    "source_feature_refs_mapped",
    "screen_category_and_scope_mapped",
    "route_refs_mapped_or_deferred",
    "ux_pattern_and_state_refs_mapped",
    "component_slots_documented_as_metadata",
    "state_data_security_refs_mapped",
    "accessibility_and_safety_notes_documented",
    "testing_and_release_refs_mapped",
    "unresolved_questions_listed",
  ],
  mappedArtifacts: [...mappedArtifacts],
  requiredEvidence: ["screen_blueprint_summary", "source_feature_refs", "artifact_mapping"],
  riskLevel,
  humanReviewRequired: riskLevel === "high" || riskLevel === "critical",
  safetyBoundaries: dodSafety(),
});

export const createMobileScreenBlueprint = (
  input: Omit<MobileScreenBlueprint, "safetyBoundaries"> & {
    safetyBoundaries?: MobileScreenBlueprintSafetyBoundaries;
  },
): MobileScreenBlueprint => ({
  screenBlueprintId: input.screenBlueprintId,
  screenId: input.screenId,
  screenName: input.screenName,
  description: input.description,
  sourceFeatureRefs: uniqueStrings(input.sourceFeatureRefs),
  appType: input.appType,
  targetUsers: uniqueStrings(input.targetUsers),
  userRoles: uniqueStrings(input.userRoles),
  routeRefs: uniqueStrings(input.routeRefs),
  uxPatternRefs: uniqueStrings(input.uxPatternRefs),
  screenStateRefs: uniqueStrings(input.screenStateRefs),
  componentSlots: [...input.componentSlots],
  dataRefs: uniqueStrings(input.dataRefs),
  stateRefs: uniqueStrings(input.stateRefs),
  securityRefs: uniqueStrings(input.securityRefs),
  accessibilityNotes: uniqueStrings(input.accessibilityNotes),
  safetyNotes: uniqueStrings(input.safetyNotes),
  performanceRefs: uniqueStrings(input.performanceRefs),
  testingRefs: uniqueStrings(input.testingRefs),
  releaseRefs: uniqueStrings(input.releaseRefs),
  phaseScope: [...input.phaseScope],
  category: input.category,
  riskLevel: input.riskLevel,
  requiredApprovals: uniqueStrings(input.requiredApprovals),
  acceptanceCriteria: [...input.acceptanceCriteria],
  definitionOfDone: input.definitionOfDone,
  limitations: uniqueStrings(input.limitations),
  safetyBoundaries: input.safetyBoundaries ?? safetyBoundaries(),
});

export const createMobileScreenBlueprintGeneratorInput = (
  params: MobileScreenBlueprintGeneratorInputParams,
): MobileScreenBlueprintGeneratorInput => ({
  generatorInputId: params.generatorInputId ?? "mobile_screen_blueprint_input:default",
  sourceFeatureBlueprintOutputRef: sourceFeatureOutputRef(params),
  featureBlueprints: featureBlueprintsFromParams(params),
  uxPatternContext: uniqueStrings(params.uxPatternContext),
  navigationContext: uniqueStrings(params.navigationContext),
  stateContext: uniqueStrings(params.stateContext),
  offlineContext: uniqueStrings(params.offlineContext),
  securityContext: uniqueStrings(params.securityContext),
  performanceContext: uniqueStrings(params.performanceContext),
  testingContext: uniqueStrings(params.testingContext),
  releaseContext: uniqueStrings(params.releaseContext),
  constraints: uniqueStrings(params.constraints),
  assumptions: uniqueStrings([
    "Screen blueprints are metadata-only and advisory.",
    "UI, route, app, provider, dashboard, DB/SQL, CI, and release actions remain future-gated.",
    ...(params.assumptions ?? []),
  ]),
  evidenceRefs: [...(params.evidenceRefs ?? [])],
  safetyBoundaries: safetyBoundaries(),
});

export const mapFeatureBlueprintsToScreenBlueprints = (
  input: MobileScreenBlueprintGeneratorInput,
): readonly MobileScreenBlueprint[] =>
  input.featureBlueprints.map((feature) => {
    const category = screenCategoryFromFeature(feature);
    const scopes = scopesFromFeature(feature);
    const screenId = `mobile_screen:${feature.featureId}`;
    const mappedArtifacts: MobileScreenArtifactTarget[] = [
      "mobile_app_factory_strategy",
      "react_native_expo_architecture_profile",
      "mobile_ux_ui_pattern_catalog",
      "mobile_navigation_flow_model",
      "mobile_state_management_strategy",
      "offline_cache_sync_strategy",
      "mobile_security_baseline",
      "mobile_performance_checklist",
      "mobile_testing_strategy",
      "mobile_release_eas_strategy",
      "pm_report",
      "task_graph",
      "dod_criteria",
      "risk_blocker_model",
      "autopilot_handoff_context",
    ];

    return createMobileScreenBlueprint({
      screenBlueprintId: `mobile_screen_blueprint:${feature.blueprintId}`,
      screenId,
      screenName: `${feature.featureName} screen`,
      description: `Advisory screen blueprint for ${feature.featureName}: ${feature.description}`,
      sourceFeatureRefs: [feature.blueprintId, feature.featureId, ...feature["sourceRequirementRefs"]],
      appType: feature.appType,
      targetUsers: [...feature.targetUsers],
      userRoles: [...feature.userRoles],
      routeRefs: [...feature.routeRefs],
      uxPatternRefs: [...feature.screenPatternRefs],
      screenStateRefs: defaultScreenStateRefs(category, feature),
      componentSlots: defaultComponentSlots(screenId, category, feature),
      dataRefs: [...feature.dataRefs],
      stateRefs: [...feature.stateRefs],
      securityRefs: [...feature.securityRefs],
      accessibilityNotes: [
        "Screen blueprint must preserve readable hierarchy, focus order, and accessible action labels.",
        ...(category === "safety_report" ? ["Safety flow copy requires human review before implementation."] : []),
      ],
      safetyNotes: [
        "Screen blueprint remains advisory metadata only.",
        ...(feature.requiredApprovals.length > 0 ? ["Required approvals must be resolved before implementation planning advances."] : []),
      ],
      performanceRefs: [...feature.performanceRefs],
      testingRefs: [...feature.testingRefs],
      releaseRefs: [...feature.releaseRefs],
      phaseScope: scopes,
      category,
      riskLevel: feature.riskLevel,
      requiredApprovals: [...feature.requiredApprovals],
      acceptanceCriteria: defaultAcceptanceCriteria(screenId, category, feature.description, feature.riskLevel, scopes),
      definitionOfDone: defaultDefinitionOfDone(screenId, mappedArtifacts, feature.riskLevel),
      limitations: uniqueStrings([
        ...feature.limitations,
        ...(feature.phaseScope.includes("blocked") ? ["source_feature_blocked"] : []),
        "metadata_only_screen_blueprint",
      ]),
    });
  });

const referencesForScreens = (
  screens: readonly MobileScreenBlueprint[],
  selector: (screen: MobileScreenBlueprint) => readonly string[],
): string[] => uniqueStrings(screens.flatMap((screen) => selector(screen)));

const mapScreensToArtifacts = (screens: readonly MobileScreenBlueprint[]): MobileScreenArtifactMapping => ({
  mappingId: "mobile_screen_blueprint_mapping:default",
  sourceScreenBlueprintRefs: screens.map((screen) => screen.screenBlueprintId),
  mobileAppFactoryStrategy: screens.map((screen) => screen.screenId),
  reactNativeExpoArchitectureProfile: referencesForScreens(screens, (screen) => [
    ...screen["routeRefs"],
    ...screen["stateRefs"],
    ...screen["dataRefs"],
  ]),
  mobileUxUiPatternCatalog: referencesForScreens(screens, (screen) => [
    ...screen["uxPatternRefs"],
    ...screen["screenStateRefs"],
  ]),
  mobileNavigationFlowModel: referencesForScreens(screens, (screen) => screen["routeRefs"]),
  mobileStateManagementStrategy: referencesForScreens(screens, (screen) => screen["stateRefs"]),
  offlineCacheSyncStrategy: referencesForScreens(screens, (screen) => screen["dataRefs"]),
  mobileSecurityBaseline: referencesForScreens(screens, (screen) => screen["securityRefs"]),
  mobilePerformanceChecklist: referencesForScreens(screens, (screen) => screen["performanceRefs"]),
  mobileTestingStrategy: referencesForScreens(screens, (screen) => screen["testingRefs"]),
  mobileReleaseEasStrategy: referencesForScreens(screens, (screen) => screen["releaseRefs"]),
  pmReport: screens.map((screen) => screen.screenBlueprintId),
  taskGraph: screens.map((screen) => screen.screenId),
  dodCriteria: screens.map((screen) => screen.definitionOfDone.dodId),
  riskBlockerModel: screens
    .filter((screen) => screen.riskLevel === "high" || screen.riskLevel === "critical" || screen.phaseScope.includes("blocked"))
    .map((screen) => screen.screenBlueprintId),
  autopilotHandoffContext: screens.map((screen) => screen.screenBlueprintId),
  safetyBoundaries: mappingSafety(),
});

const confidenceFromScreens = (
  screens: readonly MobileScreenBlueprint[],
  unresolvedQuestions: readonly string[],
): MobileScreenBlueprintConfidence => {
  if (unresolvedQuestions.length >= 3 || screens.some((screen) => screen.phaseScope.includes("blocked"))) {
    return "blocked_by_unknowns";
  }
  if (
    unresolvedQuestions.length > 0 ||
    screens.some((screen) => screen["routeRefs"].length === 0 || screen["uxPatternRefs"].length === 0)
  ) {
    return "medium";
  }
  return screens.length > 0 ? "high" : "low";
};

const buildRecommendation = (
  riskLevel: PMRiskTier,
  confidence: MobileScreenBlueprintConfidence,
  requiredApprovals: readonly string[],
): MobileScreenBlueprintRecommendation => {
  const humanReviewRequired = riskLevel === "high" || riskLevel === "critical" || requiredApprovals.length > 0;
  const nextRecommendedArtifact: MobileScreenBlueprintNextArtifact =
    confidence === "blocked_by_unknowns"
      ? "blocked_by_unknowns"
      : humanReviewRequired
        ? "human_review"
        : "mobile_api_contract_planner";

  return {
    recommendationId: "mobile_screen_blueprint_recommendation:135B",
    safeSummary:
      "Use screen blueprint metadata as advisory context for future API contract planning after human review when needed.",
    nextRecommendedArtifact,
    humanReviewRequired,
    riskLevel,
    requiredApprovals: [...requiredApprovals],
    recommendedNextStep: {
      nextStepId: "mobile_screen_blueprint_next_step:135B",
      title: "Plan the Mobile API Contract Planner",
      safeSummary:
        "Continue with Phase 135B to plan API contract metadata before any implementation, provider, route, or app work.",
      priority: riskLevel,
      decisionMode: "plan_only",
      riskSurfaces: ["automation", "scaffold", "security_policy", "release", "unknown"],
      recommendationOnly: true,
      noExecution: true,
    },
    safetyBoundaries: recommendationSafety(),
  };
};

export const selectScreenBlueprintsByScope = (
  screens: readonly MobileScreenBlueprint[],
  scope: MobileScreenScope,
): readonly MobileScreenBlueprint[] => screens.filter((screen) => screen.phaseScope.includes(scope));

export const selectScreenBlueprintsByCategory = (
  screens: readonly MobileScreenBlueprint[],
  category: MobileScreenCategory,
): readonly MobileScreenBlueprint[] => screens.filter((screen) => screen.category === category);

export const createMobileScreenBlueprintOutput = (
  input: Omit<
    MobileScreenBlueprintOutput,
    "artifactMapping" | "recommendation" | "summary" | "safetyBoundaries"
  > & {
    artifactMapping?: MobileScreenArtifactMapping;
    recommendation?: MobileScreenBlueprintRecommendation;
    summary?: MobileScreenBlueprintSummary;
    safetyBoundaries?: MobileScreenBlueprintSafetyBoundaries;
  },
): MobileScreenBlueprintOutput => {
  const boundaries = input.safetyBoundaries ?? safetyBoundaries();
  const artifactMapping = input.artifactMapping ?? mapScreensToArtifacts(input.screenBlueprints);
  const recommendation =
    input.recommendation ?? buildRecommendation(input.riskLevel, input.confidence, input.requiredApprovals);
  const outputWithoutSummary = {
    outputId: input.outputId,
    sourceFeatureBlueprintOutputRef: input.sourceFeatureBlueprintOutputRef,
    screenBlueprints: [...input.screenBlueprints],
    mvpScreens: [...input.mvpScreens],
    betaScreens: [...input.betaScreens],
    releaseScreens: [...input.releaseScreens],
    blockedScreens: [...input.blockedScreens],
    unresolvedQuestions: uniqueStrings(input.unresolvedQuestions),
    recommendedNextArtifact: input.recommendedNextArtifact,
    confidence: input.confidence,
    riskLevel: input.riskLevel,
    requiredApprovals: uniqueStrings(input.requiredApprovals),
    artifactMapping,
    recommendation,
    safetyBoundaries: boundaries,
  };
  const summary = input.summary ?? summarizeMobileScreenBlueprintOutput(outputWithoutSummary);

  return {
    ...outputWithoutSummary,
    summary,
  };
};

export const summarizeMobileScreenBlueprintOutput = (
  output: Pick<
    MobileScreenBlueprintOutput,
    | "outputId"
    | "sourceFeatureBlueprintOutputRef"
    | "screenBlueprints"
    | "mvpScreens"
    | "betaScreens"
    | "releaseScreens"
    | "blockedScreens"
    | "unresolvedQuestions"
    | "riskLevel"
    | "confidence"
    | "requiredApprovals"
    | "recommendation"
    | "safetyBoundaries"
  >,
): MobileScreenBlueprintSummary => ({
  outputId: output.outputId,
  sourceFeatureBlueprintOutputRef: output.sourceFeatureBlueprintOutputRef,
  screenBlueprintCount: output.screenBlueprints.length,
  mvpScreenCount: output.mvpScreens.length,
  betaScreenCount: output.betaScreens.length,
  releaseScreenCount: output.releaseScreens.length,
  blockedScreenCount: output.blockedScreens.length,
  componentSlotCount: output.screenBlueprints.reduce((count, screen) => count + screen.componentSlots.length, 0),
  requiredApprovalCount: output.requiredApprovals.length,
  unresolvedQuestionCount: output.unresolvedQuestions.length,
  screenCategories: uniqueStrings(output.screenBlueprints.map((screen) => screen.category)) as MobileScreenCategory[],
  riskLevel: output.riskLevel,
  confidence: output.confidence,
  humanReviewRequired: output.recommendation.humanReviewRequired,
  recommendedNextPhase: "Phase 135B",
  safeSummary:
    `${output.screenBlueprints.length} screen blueprint(s), ${output.blockedScreens.length} blocked, ${output.confidence} confidence.`,
  safetyBoundaries: output.safetyBoundaries,
});

export const generateMobileScreenBlueprints = (
  input: MobileScreenBlueprintGeneratorInput,
): MobileScreenBlueprintOutput => {
  const screens = mapFeatureBlueprintsToScreenBlueprints(input);
  const mvpScreens = selectScreenBlueprintsByScope(screens, "mvp");
  const betaScreens = selectScreenBlueprintsByScope(screens, "beta");
  const releaseScreens = selectScreenBlueprintsByScope(screens, "release");
  const blockedScreens = selectScreenBlueprintsByScope(screens, "blocked");
  const unresolvedQuestions = uniqueStrings([
    ...input.constraints,
    ...screens.filter((screen) => screen.phaseScope.includes("blocked")).map((screen) => screen.screenName),
  ]);
  const riskLevel = highestRisk(screens.map((screen) => screen.riskLevel));
  const requiredApprovals = uniqueStrings(screens.flatMap((screen) => screen.requiredApprovals));
  const confidence = confidenceFromScreens(screens, unresolvedQuestions);
  const recommendation = buildRecommendation(riskLevel, confidence, requiredApprovals);

  return createMobileScreenBlueprintOutput({
    outputId: `mobile_screen_blueprint_output:${input.generatorInputId}`,
    sourceFeatureBlueprintOutputRef: input.sourceFeatureBlueprintOutputRef,
    screenBlueprints: screens,
    mvpScreens,
    betaScreens,
    releaseScreens,
    blockedScreens,
    unresolvedQuestions,
    recommendedNextArtifact: recommendation.nextRecommendedArtifact,
    confidence,
    riskLevel,
    requiredApprovals,
    recommendation,
  });
};
