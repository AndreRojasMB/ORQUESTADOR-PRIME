import type { MobileAppFactoryAppType } from "./mobileAppFactoryStrategy.js";
import type {
  MobileComponentSlot,
  MobileScreenBlueprint,
} from "./mobileScreenBlueprintGenerator.js";
import type { PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type MobileDesignTokenType =
  | "color"
  | "typography"
  | "spacing"
  | "radius"
  | "shadow"
  | "elevation"
  | "motion"
  | "opacity"
  | "z_index"
  | "semantic";

export type MobileComponentCategory =
  | "button"
  | "input"
  | "card"
  | "list_item"
  | "tab_bar"
  | "header"
  | "modal"
  | "toast"
  | "empty_state"
  | "loading_state"
  | "error_state"
  | "offline_state"
  | "paywall"
  | "profile_summary"
  | "progress_indicator"
  | "badge"
  | "avatar"
  | "navigation_item"
  | "unknown";

export type MobileLayoutBlueprintType =
  | "single_column"
  | "tabbed_root"
  | "stack_detail"
  | "form_flow"
  | "list_detail"
  | "dashboard_grid"
  | "chat_thread"
  | "modal_sheet"
  | "offline_recovery"
  | "paywall"
  | "unknown";

export type MobileThemeSupport =
  | "light_only_review"
  | "dark_only_review"
  | "light_dark_pair_required"
  | "system_theme_required"
  | "brand_variant_future"
  | "unknown";

export type MobileDesignSystemConfidence = "high" | "medium" | "low" | "blocked_by_unknowns";

export type MobileDesignSystemNextArtifact =
  | "mobile_push_notification_strategy_plan"
  | "design_system_followup_needed"
  | "human_review"
  | "blocked_by_unknowns";

export interface MobileDesignSystemSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noUiComponentGeneration: true;
  noScreenGeneration: true;
  noStyleFileGeneration: true;
  noDesignAssetGeneration: true;
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

export interface MobileDesignToken {
  tokenId: string;
  tokenName: string;
  tokenType: MobileDesignTokenType;
  valueLabel: string;
  semanticRole: string;
  usageGuidance: string;
  accessibilityNotes: readonly string[];
  themeSupport: MobileThemeSupport;
  riskLevel: PMRiskTier;
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobileDesignSystemSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noStyleFileGeneration" | "noRuntimeExecution"
  >;
}

export interface MobileComponentBlueprint {
  componentBlueprintId: string;
  componentName: string;
  componentCategory: MobileComponentCategory;
  purpose: string;
  variants: readonly string[];
  states: readonly string[];
  requiredTokens: readonly string[];
  accessibilityRequirements: readonly string[];
  interactionNotes: readonly string[];
  dataNeeds: readonly string[];
  relatedScreenBlueprintRefs: readonly string[];
  riskLevel: PMRiskTier;
  implementationHints: readonly string[];
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobileDesignSystemSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noUiComponentGeneration" | "noRuntimeExecution"
  >;
}

export interface MobileLayoutBlueprint {
  layoutBlueprintId: string;
  layoutName: string;
  layoutType: MobileLayoutBlueprintType;
  targetScreens: readonly string[];
  structure: readonly string[];
  spacingRules: readonly string[];
  responsiveBehavior: readonly string[];
  safeAreaNotes: readonly string[];
  accessibilityNotes: readonly string[];
  performanceNotes: readonly string[];
  riskLevel: PMRiskTier;
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobileDesignSystemSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noScreenGeneration" | "noRuntimeExecution"
  >;
}

export interface MobileDesignSystemInput {
  inputId: string;
  sourceScreenBlueprintOutputRef: string;
  screenBlueprints: readonly MobileScreenBlueprint[];
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  brandConstraints: readonly string[];
  themePosture: string;
  motionPosture: string;
  accessibilityPosture: string;
  uxPatternContext: readonly string[];
  architectureLayerContext: readonly string[];
  performanceContext: readonly string[];
  securityContext: readonly string[];
  assumptions: readonly string[];
  limitations: readonly string[];
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  safetyBoundaries: MobileDesignSystemSafetyBoundaries;
}

export interface MobileDesignSystemBlueprint {
  blueprintId: string;
  sourceScreenBlueprintOutputRef: string;
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  designTokens: readonly MobileDesignToken[];
  componentBlueprints: readonly MobileComponentBlueprint[];
  layoutBlueprints: readonly MobileLayoutBlueprint[];
  themePosture: string;
  motionPosture: string;
  accessibilityPosture: string;
  brandConstraints: readonly string[];
  consistencyRules: readonly string[];
  stateVisualVariants: readonly string[];
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  safetyBoundaries: MobileDesignSystemSafetyBoundaries;
}

export interface MobileDesignSystemRecommendation {
  recommendationId: string;
  safeSummary: string;
  nextRecommendedArtifact: MobileDesignSystemNextArtifact;
  humanReviewRequired: boolean;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<
    MobileDesignSystemSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noCodexExecution" | "noAppGeneration"
  >;
}

export interface MobileDesignSystemSummary {
  blueprintId: string;
  tokenCount: number;
  componentBlueprintCount: number;
  layoutBlueprintCount: number;
  colorTokenCount: number;
  typographyTokenCount: number;
  accessibilityRequirementCount: number;
  stateVariantCount: number;
  requiredApprovalCount: number;
  tokenTypes: readonly MobileDesignTokenType[];
  componentCategories: readonly MobileComponentCategory[];
  riskLevel: PMRiskTier;
  confidence: MobileDesignSystemConfidence;
  humanReviewRequired: boolean;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: MobileDesignSystemSafetyBoundaries;
}

export interface MobileDesignSystemOutput {
  outputId: string;
  blueprint: MobileDesignSystemBlueprint;
  recommendation: MobileDesignSystemRecommendation;
  summary: MobileDesignSystemSummary;
  confidence: MobileDesignSystemConfidence;
  recommendedNextArtifact: MobileDesignSystemNextArtifact;
  safetyBoundaries: MobileDesignSystemSafetyBoundaries;
}

export const mobileDesignTokenTypes: readonly MobileDesignTokenType[] = [
  "color",
  "typography",
  "spacing",
  "radius",
  "shadow",
  "elevation",
  "motion",
  "opacity",
  "z_index",
  "semantic",
];

export const mobileComponentCategories: readonly MobileComponentCategory[] = [
  "button",
  "input",
  "card",
  "list_item",
  "tab_bar",
  "header",
  "modal",
  "toast",
  "empty_state",
  "loading_state",
  "error_state",
  "offline_state",
  "paywall",
  "profile_summary",
  "progress_indicator",
  "badge",
  "avatar",
  "navigation_item",
  "unknown",
];

const safetyBoundaries = (): MobileDesignSystemSafetyBoundaries => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noUiComponentGeneration: true,
  noScreenGeneration: true,
  noStyleFileGeneration: true,
  noDesignAssetGeneration: true,
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

const tokenSafety = (): MobileDesignToken["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noStyleFileGeneration: true,
  noRuntimeExecution: true,
});

const componentSafety = (): MobileComponentBlueprint["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noUiComponentGeneration: true,
  noRuntimeExecution: true,
});

const layoutSafety = (): MobileLayoutBlueprint["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noScreenGeneration: true,
  noRuntimeExecution: true,
});

const recommendationSafety = (): MobileDesignSystemRecommendation["safetyBoundaries"] => ({
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

const confidenceFromBlueprint = (blueprint: MobileDesignSystemBlueprint): MobileDesignSystemConfidence => {
  if (blueprint.layoutBlueprints.length === 0 || blueprint.componentBlueprints.length === 0) return "low";
  if (blueprint.limitations.some((limitation) => limitation.includes("blocked"))) return "blocked_by_unknowns";
  if (blueprint.requiredApprovals.length > 0 || blueprint.riskLevel === "high" || blueprint.riskLevel === "critical") {
    return "medium";
  }
  return blueprint.designTokens.length > 0 ? "high" : "low";
};

const categoryFromSlot = (slot: MobileComponentSlot): MobileComponentCategory => {
  if (slot.slotType === "form_field") return "input";
  if (slot.slotType === "primary_action" || slot.slotType === "secondary_action" || slot.slotType === "safety_action") {
    return "button";
  }
  if (slot.slotType === "list_item") return "list_item";
  if (slot.slotType === "header") return "header";
  if (slot.slotType === "navigation_entry") return "navigation_item";
  if (slot.slotType === "loading_state") return "loading_state";
  if (slot.slotType === "error_state") return "error_state";
  if (slot.slotType === "empty_state") return "empty_state";
  if (slot.slotType === "offline_state") return "offline_state";
  if (slot.slotType === "monetization_action") return "paywall";
  if (slot.slotType === "status_banner") return "toast";
  if (slot.slotType === "primary_content") return "card";
  return "unknown";
};

const layoutTypeFromScreen = (screen: MobileScreenBlueprint): MobileLayoutBlueprintType => {
  if (screen.category === "form" || screen.componentSlots.some((slot) => slot.slotType === "form_field")) return "form_flow";
  if (screen.category === "list" || screen.category === "marketplace_browse") return "list_detail";
  if (screen.category === "home_dashboard") return "dashboard_grid";
  if (screen.category === "chat_thread") return "chat_thread";
  if (screen.category === "paywall") return "paywall";
  if (screen.category === "offline_recovery") return "offline_recovery";
  if (screen["routeRefs"].some((routeRef) => routeRef.includes("modal"))) return "modal_sheet";
  return "single_column";
};

const stateVariantsFromScreens = (screens: readonly MobileScreenBlueprint[]): string[] =>
  uniqueStrings(
    screens.flatMap((screen) => [
      ...screen["screenStateRefs"],
      ...screen.componentSlots.map((slot) => slot.slotType),
    ]),
  );

const componentId = (category: MobileComponentCategory, suffix: string): string =>
  `mobile_component_blueprint:${category}:${suffix}`;

export const createMobileDesignToken = (
  input: Omit<MobileDesignToken, "safetyBoundaries"> & {
    safetyBoundaries?: MobileDesignToken["safetyBoundaries"];
  },
): MobileDesignToken => ({
  tokenId: input.tokenId,
  tokenName: input.tokenName,
  tokenType: input.tokenType,
  valueLabel: input.valueLabel,
  semanticRole: input.semanticRole,
  usageGuidance: input.usageGuidance,
  accessibilityNotes: uniqueStrings(input.accessibilityNotes),
  themeSupport: input.themeSupport,
  riskLevel: input.riskLevel,
  limitations: uniqueStrings(input.limitations),
  safetyBoundaries: input.safetyBoundaries ?? tokenSafety(),
});

export const createMobileComponentBlueprint = (
  input: Omit<MobileComponentBlueprint, "safetyBoundaries"> & {
    safetyBoundaries?: MobileComponentBlueprint["safetyBoundaries"];
  },
): MobileComponentBlueprint => ({
  componentBlueprintId: input.componentBlueprintId,
  componentName: input.componentName,
  componentCategory: input.componentCategory,
  purpose: input.purpose,
  variants: uniqueStrings(input.variants),
  states: uniqueStrings(input.states),
  requiredTokens: uniqueStrings(input.requiredTokens),
  accessibilityRequirements: uniqueStrings(input.accessibilityRequirements),
  interactionNotes: uniqueStrings(input.interactionNotes),
  dataNeeds: uniqueStrings(input.dataNeeds),
  relatedScreenBlueprintRefs: uniqueStrings(input["relatedScreenBlueprintRefs"]),
  riskLevel: input.riskLevel,
  implementationHints: uniqueStrings(input.implementationHints),
  limitations: uniqueStrings(input.limitations),
  safetyBoundaries: input.safetyBoundaries ?? componentSafety(),
});

export const createMobileLayoutBlueprint = (
  input: Omit<MobileLayoutBlueprint, "safetyBoundaries"> & {
    safetyBoundaries?: MobileLayoutBlueprint["safetyBoundaries"];
  },
): MobileLayoutBlueprint => ({
  layoutBlueprintId: input.layoutBlueprintId,
  layoutName: input.layoutName,
  layoutType: input.layoutType,
  targetScreens: uniqueStrings(input.targetScreens),
  structure: uniqueStrings(input.structure),
  spacingRules: uniqueStrings(input.spacingRules),
  responsiveBehavior: uniqueStrings(input.responsiveBehavior),
  safeAreaNotes: uniqueStrings(input.safeAreaNotes),
  accessibilityNotes: uniqueStrings(input.accessibilityNotes),
  performanceNotes: uniqueStrings(input.performanceNotes),
  riskLevel: input.riskLevel,
  limitations: uniqueStrings(input.limitations),
  safetyBoundaries: input.safetyBoundaries ?? layoutSafety(),
});

export const buildDefaultMobileDesignTokens = (
  input: {
    themeSupport?: MobileThemeSupport;
    riskLevel?: PMRiskTier;
    brandConstraints?: readonly string[];
  } = {},
): readonly MobileDesignToken[] => {
  const themeSupport = input.themeSupport ?? "light_dark_pair_required";
  const riskLevel = input.riskLevel ?? "medium";
  const brandNotes = uniqueStrings(input.brandConstraints);
  const accessibilityNotes = uniqueStrings([
    "contrast_review_required",
    "color_not_only_required",
    "text_scaling_review_required",
    ...brandNotes.map((constraint) => `brand_constraint:${constraint}`),
  ]);

  return [
    createMobileDesignToken({
      tokenId: "mobile_design_token:color:surface_primary",
      tokenName: "Surface primary",
      tokenType: "color",
      valueLabel: "surface_primary_label",
      semanticRole: "Primary app surface.",
      usageGuidance: "Use for default screen backgrounds after contrast review.",
      accessibilityNotes,
      themeSupport,
      riskLevel,
      limitations: ["metadata_only_token"],
    }),
    createMobileDesignToken({
      tokenId: "mobile_design_token:color:text_primary",
      tokenName: "Text primary",
      tokenType: "color",
      valueLabel: "text_primary_label",
      semanticRole: "Primary readable text.",
      usageGuidance: "Pair with surface tokens and verify contrast.",
      accessibilityNotes,
      themeSupport,
      riskLevel,
      limitations: ["metadata_only_token"],
    }),
    createMobileDesignToken({
      tokenId: "mobile_design_token:color:action_primary",
      tokenName: "Action primary",
      tokenType: "color",
      valueLabel: "action_primary_label",
      semanticRole: "Primary action affordance.",
      usageGuidance: "Reserve for the single main action on a screen.",
      accessibilityNotes,
      themeSupport,
      riskLevel,
      limitations: ["metadata_only_token"],
    }),
    createMobileDesignToken({
      tokenId: "mobile_design_token:color:danger",
      tokenName: "Danger",
      tokenType: "color",
      valueLabel: "danger_label",
      semanticRole: "Destructive or safety-sensitive action.",
      usageGuidance: "Use with text or icon labels, never color alone.",
      accessibilityNotes,
      themeSupport,
      riskLevel: highestRisk([riskLevel, "high"]),
      limitations: ["metadata_only_token", "human_review_for_destructive_states"],
    }),
    createMobileDesignToken({
      tokenId: "mobile_design_token:typography:body",
      tokenName: "Body text",
      tokenType: "typography",
      valueLabel: "body_text_label",
      semanticRole: "Readable body copy.",
      usageGuidance: "Support dynamic type and avoid truncating critical copy.",
      accessibilityNotes: ["text_scaling_review_required", "line_height_review_required"],
      themeSupport,
      riskLevel,
      limitations: ["metadata_only_token"],
    }),
    createMobileDesignToken({
      tokenId: "mobile_design_token:spacing:base",
      tokenName: "Base spacing",
      tokenType: "spacing",
      valueLabel: "space_base_label",
      semanticRole: "Default rhythm for mobile layouts.",
      usageGuidance: "Apply consistently to screen sections and component groups.",
      accessibilityNotes: ["touch_spacing_review_required"],
      themeSupport: "system_theme_required",
      riskLevel,
      limitations: ["metadata_only_token"],
    }),
    createMobileDesignToken({
      tokenId: "mobile_design_token:radius:control",
      tokenName: "Control radius",
      tokenType: "radius",
      valueLabel: "control_radius_label",
      semanticRole: "Control and field shape.",
      usageGuidance: "Keep control shape consistent across forms and actions.",
      accessibilityNotes: ["focus_outline_must_remain_visible"],
      themeSupport,
      riskLevel: "low",
      limitations: ["metadata_only_token"],
    }),
    createMobileDesignToken({
      tokenId: "mobile_design_token:shadow:surface",
      tokenName: "Surface shadow",
      tokenType: "shadow",
      valueLabel: "surface_shadow_label",
      semanticRole: "Layer separation.",
      usageGuidance: "Use sparingly for sheets, cards, and modals.",
      accessibilityNotes: ["do_not_rely_on_shadow_alone"],
      themeSupport,
      riskLevel: "low",
      limitations: ["metadata_only_token"],
    }),
    createMobileDesignToken({
      tokenId: "mobile_design_token:elevation:modal",
      tokenName: "Modal elevation",
      tokenType: "elevation",
      valueLabel: "modal_elevation_label",
      semanticRole: "Overlay hierarchy.",
      usageGuidance: "Pair with modal focus, dismissal, and background state rules.",
      accessibilityNotes: ["modal_focus_order_review_required"],
      themeSupport,
      riskLevel,
      limitations: ["metadata_only_token"],
    }),
    createMobileDesignToken({
      tokenId: "mobile_design_token:motion:standard",
      tokenName: "Standard motion",
      tokenType: "motion",
      valueLabel: "motion_standard_label",
      semanticRole: "Meaningful transition posture.",
      usageGuidance: "Use only when motion clarifies state change.",
      accessibilityNotes: ["reduced_motion_alternative_required"],
      themeSupport: "system_theme_required",
      riskLevel,
      limitations: ["metadata_only_token", "no_animation_runtime"],
    }),
    createMobileDesignToken({
      tokenId: "mobile_design_token:opacity:disabled",
      tokenName: "Disabled opacity",
      tokenType: "opacity",
      valueLabel: "disabled_opacity_label",
      semanticRole: "Disabled state cue.",
      usageGuidance: "Combine with disabled semantics and label changes when needed.",
      accessibilityNotes: ["disabled_state_must_remain_readable"],
      themeSupport,
      riskLevel,
      limitations: ["metadata_only_token"],
    }),
    createMobileDesignToken({
      tokenId: "mobile_design_token:z_index:overlay",
      tokenName: "Overlay stack",
      tokenType: "z_index",
      valueLabel: "overlay_stack_label",
      semanticRole: "Overlay order.",
      usageGuidance: "Reserve for modal, toast, and blocking overlay review.",
      accessibilityNotes: ["screen_reader_order_review_required"],
      themeSupport: "system_theme_required",
      riskLevel,
      limitations: ["metadata_only_token"],
    }),
    createMobileDesignToken({
      tokenId: "mobile_design_token:semantic:focus",
      tokenName: "Focus visible",
      tokenType: "semantic",
      valueLabel: "focus_visible_label",
      semanticRole: "Visible focus and active state.",
      usageGuidance: "Required for interactive elements and keyboard or assistive navigation.",
      accessibilityNotes: ["visible_focus_required", "contrast_review_required"],
      themeSupport,
      riskLevel: highestRisk([riskLevel, "high"]),
      limitations: ["metadata_only_token"],
    }),
  ];
};

export const buildDefaultMobileComponentBlueprints = (
  input: {
    screenBlueprints?: readonly MobileScreenBlueprint[];
    tokens?: readonly MobileDesignToken[];
    riskLevel?: PMRiskTier;
  } = {},
): readonly MobileComponentBlueprint[] => {
  const screens = [...(input.screenBlueprints ?? [])];
  const tokenIds = uniqueStrings((input.tokens ?? buildDefaultMobileDesignTokens()).map((token) => token.tokenId));
  const baseRisk = input.riskLevel ?? highestRisk(screens.map((screen) => screen.riskLevel));
  const screenDerived = screens.flatMap((screen) =>
    screen.componentSlots.map((slot) => {
      const category = categoryFromSlot(slot);
      return createMobileComponentBlueprint({
        componentBlueprintId: componentId(category, `${screen.screenId}:${slot.slotId}`),
        componentName: slot.slotName,
        componentCategory: category,
        purpose: slot.purpose,
        variants: ["default", "compact", "full_width_review"],
        states: uniqueStrings(["default", "focused", "pressed", "disabled", slot.slotType]),
        requiredTokens: tokenIds,
        accessibilityRequirements: [slot.accessibilityRequirement, "minimum_touch_target_review"],
        interactionNotes: [...slot.interactionNotes],
        dataNeeds: [...slot.dataNeeds],
        relatedScreenBlueprintRefs: [screen.screenBlueprintId],
        riskLevel: highestRisk([screen.riskLevel, slot.riskLevel, baseRisk]),
        implementationHints: ["future_review_only", "map_to_screen_slot_before_implementation"],
        limitations: ["metadata_only_component_blueprint"],
      });
    }),
  );

  const fallbackBlueprints = [
    createMobileComponentBlueprint({
      componentBlueprintId: componentId("button", "default_action"),
      componentName: "Default action",
      componentCategory: "button",
      purpose: "Plan primary, secondary, destructive, loading, and disabled action states.",
      variants: ["primary", "secondary", "destructive", "loading", "disabled"],
      states: ["default", "pressed", "focused", "disabled", "loading"],
      requiredTokens: tokenIds,
      accessibilityRequirements: ["label_required", "minimum_touch_target_review", "loading_state_announcement_review"],
      interactionNotes: ["tap_feedback_required", "destructive_action_confirmation_review"],
      dataNeeds: [],
      relatedScreenBlueprintRefs: [],
      riskLevel: baseRisk,
      implementationHints: ["future_review_only"],
      limitations: ["metadata_only_component_blueprint"],
    }),
    createMobileComponentBlueprint({
      componentBlueprintId: componentId("input", "default_field"),
      componentName: "Default input",
      componentCategory: "input",
      purpose: "Plan labels, helper text, validation, error, disabled, and filled states.",
      variants: ["text", "select", "multiline", "secure_future_review"],
      states: ["default", "focused", "error", "disabled", "filled"],
      requiredTokens: tokenIds,
      accessibilityRequirements: ["visible_label_required", "error_near_field_required", "text_scaling_review_required"],
      interactionNotes: ["keyboard_avoidance_review", "validation_feedback_review"],
      dataNeeds: [],
      relatedScreenBlueprintRefs: [],
      riskLevel: baseRisk,
      implementationHints: ["future_review_only"],
      limitations: ["metadata_only_component_blueprint"],
    }),
    createMobileComponentBlueprint({
      componentBlueprintId: componentId("empty_state", "default_recovery"),
      componentName: "Default empty state",
      componentCategory: "empty_state",
      purpose: "Plan useful empty-state copy, recovery action, and accessible status messaging.",
      variants: ["setup_required", "no_results", "permission_dependent"],
      states: ["empty", "focused_action", "secondary_action"],
      requiredTokens: tokenIds,
      accessibilityRequirements: ["status_message_readable", "action_label_required"],
      interactionNotes: ["provide_recovery_path", "avoid_dead_end"],
      dataNeeds: [],
      relatedScreenBlueprintRefs: [],
      riskLevel: baseRisk,
      implementationHints: ["future_review_only"],
      limitations: ["metadata_only_component_blueprint"],
    }),
    createMobileComponentBlueprint({
      componentBlueprintId: componentId("offline_state", "default_recovery"),
      componentName: "Default offline state",
      componentCategory: "offline_state",
      purpose: "Plan stale content, retry, and recovery messaging.",
      variants: ["stale_data", "action_queued_future", "connection_required"],
      states: ["offline", "retry_available", "blocked"],
      requiredTokens: tokenIds,
      accessibilityRequirements: ["offline_status_not_color_only", "recovery_action_label_required"],
      interactionNotes: ["retry_review", "safe_back_path_required"],
      dataNeeds: [],
      relatedScreenBlueprintRefs: [],
      riskLevel: highestRisk([baseRisk, "medium"]),
      implementationHints: ["future_review_only"],
      limitations: ["metadata_only_component_blueprint"],
    }),
  ];

  const byId = new Map<string, MobileComponentBlueprint>();
  [...screenDerived, ...fallbackBlueprints].forEach((blueprint) => byId.set(blueprint.componentBlueprintId, blueprint));
  return [...byId.values()];
};

const buildDefaultLayouts = (screens: readonly MobileScreenBlueprint[]): readonly MobileLayoutBlueprint[] => {
  if (screens.length === 0) {
    return [
      createMobileLayoutBlueprint({
        layoutBlueprintId: "mobile_layout_blueprint:single_column:default",
        layoutName: "Default single-column layout",
        layoutType: "single_column",
        targetScreens: [],
        structure: ["safe_area_container", "header_region", "content_region", "primary_action_region"],
        spacingRules: ["base_spacing_scale_review", "touch_target_spacing_review"],
        responsiveBehavior: ["mobile_first", "tablet_expansion_future_review"],
        safeAreaNotes: ["respect_top_and_bottom_safe_areas"],
        accessibilityNotes: ["logical_reading_order_required"],
        performanceNotes: ["avoid_unbounded_content_regions"],
        riskLevel: "low",
        limitations: ["metadata_only_layout_blueprint"],
      }),
    ];
  }

  return screens.map((screen) =>
    createMobileLayoutBlueprint({
      layoutBlueprintId: `mobile_layout_blueprint:${screen.screenId}`,
      layoutName: `${screen.screenName} layout`,
      layoutType: layoutTypeFromScreen(screen),
      targetScreens: [screen.screenBlueprintId, screen.screenId],
      structure: uniqueStrings([
        "safe_area_container",
        ...(screen.componentSlots.some((slot) => slot.slotType === "header") ? ["header_region"] : []),
        "content_region",
        ...(screen.componentSlots.some((slot) => slot.slotType === "primary_action") ? ["primary_action_region"] : []),
        ...(screen["screenStateRefs"].length > 0 ? ["state_variant_region"] : []),
      ]),
      spacingRules: ["base_spacing_scale_review", "touch_spacing_review", "keyboard_spacing_review"],
      responsiveBehavior: ["mobile_first", "landscape_readability_review", "tablet_expansion_future_review"],
      safeAreaNotes: ["respect_top_safe_area", "respect_bottom_gesture_area"],
      accessibilityNotes: uniqueStrings(["logical_reading_order_required", ...screen.accessibilityNotes]),
      performanceNotes: uniqueStrings(["avoid_layout_shift", ...screen["performanceRefs"]]),
      riskLevel: screen.riskLevel,
      limitations: ["metadata_only_layout_blueprint"],
    }),
  );
};

export const createMobileDesignSystemBlueprint = (
  input: Omit<MobileDesignSystemBlueprint, "safetyBoundaries"> & {
    safetyBoundaries?: MobileDesignSystemSafetyBoundaries;
  },
): MobileDesignSystemBlueprint => ({
  blueprintId: input.blueprintId,
  sourceScreenBlueprintOutputRef: input.sourceScreenBlueprintOutputRef,
  appType: input.appType,
  designTokens: [...input.designTokens],
  componentBlueprints: [...input.componentBlueprints],
  layoutBlueprints: [...input.layoutBlueprints],
  themePosture: input.themePosture,
  motionPosture: input.motionPosture,
  accessibilityPosture: input.accessibilityPosture,
  brandConstraints: uniqueStrings(input.brandConstraints),
  consistencyRules: uniqueStrings(input.consistencyRules),
  stateVisualVariants: uniqueStrings(input.stateVisualVariants),
  riskLevel: input.riskLevel,
  requiredApprovals: uniqueStrings(input.requiredApprovals),
  limitations: uniqueStrings(input.limitations),
  safetyBoundaries: input.safetyBoundaries ?? safetyBoundaries(),
});

const buildRecommendation = (blueprint: MobileDesignSystemBlueprint): MobileDesignSystemRecommendation => {
  const confidence = confidenceFromBlueprint(blueprint);
  const humanReviewRequired =
    blueprint.riskLevel === "high" || blueprint.riskLevel === "critical" || blueprint.requiredApprovals.length > 0;
  const nextRecommendedArtifact: MobileDesignSystemNextArtifact =
    confidence === "blocked_by_unknowns"
      ? "blocked_by_unknowns"
      : humanReviewRequired
        ? "human_review"
        : "mobile_push_notification_strategy_plan";

  return {
    recommendationId: "mobile_design_system_recommendation:137B",
    safeSummary:
      "Use design-system metadata as advisory context for future mobile planning after accessibility and brand review.",
    nextRecommendedArtifact,
    humanReviewRequired,
    riskLevel: blueprint.riskLevel,
    requiredApprovals: [...blueprint.requiredApprovals],
    recommendedNextStep: {
      nextStepId: "mobile_design_system_next_step:137B",
      title: "Plan the Mobile Push Notification Strategy",
      safeSummary:
        "Continue with Phase 137B to plan notification metadata without mobile tooling, providers, or app changes.",
      priority: blueprint.riskLevel,
      decisionMode: "plan_only",
      riskSurfaces: ["automation", "scaffold", "security_policy", "release", "unknown"],
      recommendationOnly: true,
      noExecution: true,
    },
    safetyBoundaries: recommendationSafety(),
  };
};

export const summarizeMobileDesignSystemBlueprint = (
  blueprint: MobileDesignSystemBlueprint,
): MobileDesignSystemSummary => {
  const accessibilityRequirementCount = blueprint.componentBlueprints.reduce(
    (count, component) => count + component.accessibilityRequirements.length,
    0,
  );
  const confidence = confidenceFromBlueprint(blueprint);
  const recommendation = buildRecommendation(blueprint);

  return {
    blueprintId: blueprint.blueprintId,
    tokenCount: blueprint.designTokens.length,
    componentBlueprintCount: blueprint.componentBlueprints.length,
    layoutBlueprintCount: blueprint.layoutBlueprints.length,
    colorTokenCount: blueprint.designTokens.filter((token) => token.tokenType === "color").length,
    typographyTokenCount: blueprint.designTokens.filter((token) => token.tokenType === "typography").length,
    accessibilityRequirementCount,
    stateVariantCount: blueprint.stateVisualVariants.length,
    requiredApprovalCount: blueprint.requiredApprovals.length,
    tokenTypes: uniqueStrings(blueprint.designTokens.map((token) => token.tokenType)) as MobileDesignTokenType[],
    componentCategories: uniqueStrings(
      blueprint.componentBlueprints.map((component) => component.componentCategory),
    ) as MobileComponentCategory[],
    riskLevel: blueprint.riskLevel,
    confidence,
    humanReviewRequired: recommendation.humanReviewRequired,
    recommendedNextPhase: "Phase 137B",
    safeSummary:
      `${blueprint.designTokens.length} token(s), ${blueprint.componentBlueprints.length} component blueprint(s), ${blueprint.layoutBlueprints.length} layout blueprint(s).`,
    safetyBoundaries: blueprint.safetyBoundaries,
  };
};

export const createMobileDesignSystemOutput = (blueprint: MobileDesignSystemBlueprint): MobileDesignSystemOutput => {
  const recommendation = buildRecommendation(blueprint);
  const summary = summarizeMobileDesignSystemBlueprint(blueprint);

  return {
    outputId: `mobile_design_system_output:${blueprint.blueprintId}`,
    blueprint,
    recommendation,
    summary,
    confidence: summary.confidence,
    recommendedNextArtifact: recommendation.nextRecommendedArtifact,
    safetyBoundaries: blueprint.safetyBoundaries,
  };
};

export const createMobileDesignSystemInput = (
  input: Omit<MobileDesignSystemInput, "safetyBoundaries"> & {
    safetyBoundaries?: MobileDesignSystemSafetyBoundaries;
  },
): MobileDesignSystemInput => ({
  inputId: input.inputId,
  sourceScreenBlueprintOutputRef: input.sourceScreenBlueprintOutputRef,
  screenBlueprints: [...input.screenBlueprints],
  appType: input.appType,
  brandConstraints: uniqueStrings(input.brandConstraints),
  themePosture: input.themePosture,
  motionPosture: input.motionPosture,
  accessibilityPosture: input.accessibilityPosture,
  uxPatternContext: uniqueStrings(input.uxPatternContext),
  architectureLayerContext: uniqueStrings(input.architectureLayerContext),
  performanceContext: uniqueStrings(input.performanceContext),
  securityContext: uniqueStrings(input.securityContext),
  assumptions: uniqueStrings(input.assumptions),
  limitations: uniqueStrings(input.limitations),
  riskLevel: input.riskLevel,
  requiredApprovals: uniqueStrings(input.requiredApprovals),
  safetyBoundaries: input.safetyBoundaries ?? safetyBoundaries(),
});

export const buildMobileDesignSystemBlueprintFromInput = (
  input: MobileDesignSystemInput,
): MobileDesignSystemBlueprint => {
  const tokens = buildDefaultMobileDesignTokens({
    themeSupport: "light_dark_pair_required",
    riskLevel: input.riskLevel,
    brandConstraints: input.brandConstraints,
  });
  const componentBlueprints = buildDefaultMobileComponentBlueprints({
    screenBlueprints: input.screenBlueprints,
    tokens,
    riskLevel: input.riskLevel,
  });
  const layoutBlueprints = buildDefaultLayouts(input.screenBlueprints);
  const screenRisks = input.screenBlueprints.map((screen) => screen.riskLevel);
  const riskLevel = highestRisk([input.riskLevel, ...screenRisks]);
  const requiredApprovals = uniqueStrings([
    ...input.requiredApprovals,
    ...input.screenBlueprints.flatMap((screen) => screen.requiredApprovals),
  ]);

  return createMobileDesignSystemBlueprint({
    blueprintId: `mobile_design_system_blueprint:${input.inputId}`,
    sourceScreenBlueprintOutputRef: input.sourceScreenBlueprintOutputRef,
    appType: input.appType,
    designTokens: tokens,
    componentBlueprints,
    layoutBlueprints,
    themePosture: input.themePosture,
    motionPosture: input.motionPosture,
    accessibilityPosture: input.accessibilityPosture,
    brandConstraints: input.brandConstraints,
    consistencyRules: [
      "use_semantic_tokens",
      "keep_state_variants_consistent",
      "review_dark_light_pairs",
      "review_reduced_motion",
      "preserve_touch_target_posture",
    ],
    stateVisualVariants: stateVariantsFromScreens(input.screenBlueprints),
    riskLevel,
    requiredApprovals,
    limitations: uniqueStrings([
      ...input.limitations,
      "metadata_only_design_system_blueprint",
      "no_real_ui_or_style_assets",
    ]),
  });
};

export const selectDesignTokensByType = (
  tokens: readonly MobileDesignToken[],
  tokenType: MobileDesignTokenType,
): readonly MobileDesignToken[] => tokens.filter((token) => token.tokenType === tokenType);

export const selectComponentBlueprintsByCategory = (
  components: readonly MobileComponentBlueprint[],
  componentCategory: MobileComponentCategory,
): readonly MobileComponentBlueprint[] =>
  components.filter((component) => component.componentCategory === componentCategory);
