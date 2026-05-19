import {
  createMobileComponentSlot,
  createMobileScreenBlueprint,
} from "../src/pm/mobileScreenBlueprintGenerator.js";
import {
  buildDefaultMobileComponentBlueprints,
  buildDefaultMobileDesignTokens,
  buildMobileDesignSystemBlueprintFromInput,
  createMobileComponentBlueprint,
  createMobileDesignSystemBlueprint,
  createMobileDesignSystemInput,
  createMobileDesignSystemOutput,
  createMobileDesignToken,
  createMobileLayoutBlueprint,
  selectComponentBlueprintsByCategory,
  selectDesignTokensByType,
  summarizeMobileDesignSystemBlueprint,
} from "../src/pm/mobileDesignSystemBlueprint.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const token = createMobileDesignToken({
  tokenId: "mobile_design_token:test:color:action",
  tokenName: "Test action color",
  tokenType: "color",
  valueLabel: "action_color_label",
  semanticRole: "Primary action affordance.",
  usageGuidance: "Use after contrast review.",
  accessibilityNotes: ["contrast_review_required"],
  themeSupport: "light_dark_pair_required",
  riskLevel: "medium",
  limitations: ["metadata_only_token"],
});

assert(token.safetyBoundaries.noStyleFileGeneration === true, "token must not add style files");
assert(token.safetyBoundaries.noRuntimeExecution === true, "token must not run runtime behavior");

const component = createMobileComponentBlueprint({
  componentBlueprintId: "mobile_component_blueprint:test:button",
  componentName: "Test action",
  componentCategory: "button",
  purpose: "Plan action states.",
  variants: ["primary", "secondary", "disabled"],
  states: ["default", "pressed", "focused", "disabled"],
  requiredTokens: [token.tokenId],
  accessibilityRequirements: ["label_required", "minimum_touch_target_review"],
  interactionNotes: ["tap_feedback_review"],
  dataNeeds: [],
  relatedScreenBlueprintRefs: ["mobile_screen_blueprint:test:booking"],
  riskLevel: "medium",
  implementationHints: ["future_review_only"],
  limitations: ["metadata_only_component_blueprint"],
});

assert(component.safetyBoundaries.noUiComponentGeneration === true, "component blueprint must not add UI");
assert(component["relatedScreenBlueprintRefs"].length === 1, "component blueprint should keep screen refs");

const layout = createMobileLayoutBlueprint({
  layoutBlueprintId: "mobile_layout_blueprint:test:booking",
  layoutName: "Booking layout",
  layoutType: "form_flow",
  targetScreens: ["mobile_screen_blueprint:test:booking"],
  structure: ["safe_area_container", "header_region", "content_region", "primary_action_region"],
  spacingRules: ["base_spacing_scale_review"],
  responsiveBehavior: ["mobile_first"],
  safeAreaNotes: ["respect_bottom_gesture_area"],
  accessibilityNotes: ["logical_reading_order_required"],
  performanceNotes: ["avoid_layout_shift"],
  riskLevel: "medium",
  limitations: ["metadata_only_layout_blueprint"],
});

assert(layout.safetyBoundaries.noScreenGeneration === true, "layout blueprint must not add screens");

const slot = createMobileComponentSlot({
  slotId: "mobile_screen:test:booking:slot:form",
  slotName: "Booking fields",
  slotType: "form_field",
  purpose: "Collect booking metadata.",
  required: true,
  dataNeeds: ["booking_request"],
  interactionNotes: ["validation_feedback_review"],
  accessibilityRequirement: "Fields require visible labels.",
  stateRefs: ["form_state"],
  riskLevel: "medium",
  limitations: ["metadata_only_slot"],
});

const screen = createMobileScreenBlueprint({
  screenBlueprintId: "mobile_screen_blueprint:test:booking",
  screenId: "mobile_screen:test:booking",
  screenName: "Booking request",
  description: "Users submit booking request metadata.",
  sourceFeatureRefs: ["mobile_feature_blueprint:test:booking"],
  appType: "service_booking_app",
  targetUsers: ["customers"],
  userRoles: ["customer"],
  routeRefs: ["booking_route"],
  uxPatternRefs: ["forms"],
  screenStateRefs: ["booking_loading", "booking_error", "booking_offline"],
  componentSlots: [slot],
  dataRefs: ["booking_request"],
  stateRefs: ["form_state"],
  securityRefs: ["privacy_review"],
  accessibilityNotes: ["visible_labels_required"],
  safetyNotes: ["metadata_only"],
  performanceRefs: ["initial_render"],
  testingRefs: ["booking_smoke"],
  releaseRefs: ["mvp_gate"],
  phaseScope: ["mvp"],
  category: "form",
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
  acceptanceCriteria: [],
  definitionOfDone: {
    dodId: "mobile_screen:test:booking:dod",
    checklistItems: ["screen_metadata_mapped"],
    mappedArtifacts: ["mobile_ux_ui_pattern_catalog"],
    requiredEvidence: ["screen_blueprint"],
    riskLevel: "medium",
    humanReviewRequired: false,
    safetyBoundaries: {
      sourceOnly: true,
      advisoryOnly: true,
      metadataOnly: true,
      noCodexExecution: true,
      noRuntimeExecution: true,
    },
  },
  limitations: ["metadata_only"],
});

const defaultTokens = buildDefaultMobileDesignTokens({
  themeSupport: "light_dark_pair_required",
  riskLevel: "medium",
  brandConstraints: ["calm_service_brand"],
});
const defaultComponents = buildDefaultMobileComponentBlueprints({
  screenBlueprints: [screen],
  tokens: defaultTokens,
  riskLevel: "medium",
});

assert(defaultTokens.length >= 10, "default tokens should cover multiple token families");
assert(defaultComponents.length >= 4, "default components should include screen-derived and fallback blueprints");
assert(defaultComponents.some((entry) => entry.componentCategory === "input"), "screen slot should map to input");

const input = createMobileDesignSystemInput({
  inputId: "mobile_design_system_input:test",
  sourceScreenBlueprintOutputRef: "mobile_screen_blueprint_output:test",
  screenBlueprints: [screen],
  appType: "service_booking_app",
  brandConstraints: ["calm_service_brand"],
  themePosture: "light_dark_pair_required",
  motionPosture: "reduced_motion_alternative_required",
  accessibilityPosture: "contrast_and_text_scaling_review_required",
  uxPatternContext: ["forms", "empty_loading_error"],
  architectureLayerContext: ["components", "theme", "screens"],
  performanceContext: ["initial_render"],
  securityContext: ["privacy_review"],
  assumptions: ["metadata_only_design_system"],
  limitations: ["no_real_ui"],
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
});

const mappedBlueprint = buildMobileDesignSystemBlueprintFromInput(input);
const manualBlueprint = createMobileDesignSystemBlueprint({
  blueprintId: "mobile_design_system_blueprint:test:manual",
  sourceScreenBlueprintOutputRef: input.sourceScreenBlueprintOutputRef,
  appType: input.appType,
  designTokens: [token],
  componentBlueprints: [component],
  layoutBlueprints: [layout],
  themePosture: input.themePosture,
  motionPosture: input.motionPosture,
  accessibilityPosture: input.accessibilityPosture,
  brandConstraints: input.brandConstraints,
  consistencyRules: ["use_semantic_tokens"],
  stateVisualVariants: ["booking_loading", "booking_error"],
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
  limitations: ["metadata_only_design_system_blueprint"],
});

const summary = summarizeMobileDesignSystemBlueprint(manualBlueprint);
const output = createMobileDesignSystemOutput(manualBlueprint);
const colorTokens = selectDesignTokensByType(defaultTokens, "color");
const buttonComponents = selectComponentBlueprintsByCategory(defaultComponents, "button");

assert(mappedBlueprint.safetyBoundaries.noUiComponentGeneration === true, "mapped blueprint must not add UI");
assert(mappedBlueprint.safetyBoundaries.noDesignAssetGeneration === true, "mapped blueprint must not add design assets");
assert(mappedBlueprint.stateVisualVariants.includes("booking_error"), "mapped blueprint should include state variants");
assert(summary.tokenCount === 1, "summary should count tokens");
assert(summary.componentBlueprintCount === 1, "summary should count component blueprints");
assert(summary.layoutBlueprintCount === 1, "summary should count layout blueprints");
assert(summary.recommendedNextPhase === "Phase 137B", "summary should point to Phase 137B");
assert(output.safetyBoundaries.noAppGeneration === true, "output must not add apps");
assert(colorTokens.length >= 3, "token filtering should find color tokens");
assert(buttonComponents.length >= 1, "category filtering should find buttons");

console.log("Mobile Design System Blueprint smoke tests passed");
console.log(`Default tokens: ${defaultTokens.length}`);
console.log(`Default components: ${defaultComponents.length}`);
console.log(`Mapped layouts: ${mappedBlueprint.layoutBlueprints.length}`);
