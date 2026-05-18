import {
  createMobileFeatureBlueprint,
} from "../src/pm/mobileFeatureBlueprintGenerator.js";
import {
  createMobileComponentSlot,
  createMobileScreenBlueprint,
  createMobileScreenBlueprintGeneratorInput,
  createMobileScreenBlueprintOutput,
  generateMobileScreenBlueprints,
  mapFeatureBlueprintsToScreenBlueprints,
  selectScreenBlueprintsByCategory,
  selectScreenBlueprintsByScope,
  summarizeMobileScreenBlueprintOutput,
} from "../src/pm/mobileScreenBlueprintGenerator.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const feature = createMobileFeatureBlueprint({
  blueprintId: "mobile_feature_blueprint:test:booking",
  featureId: "mobile_feature:test:booking",
  featureName: "Clinic booking form",
  description: "Users can request an appointment with validation and recovery states.",
  sourceRequirementRefs: ["mobile_requirement:test:booking"],
  appType: "service_booking_app",
  targetUsers: ["patients"],
  userRoles: ["patient"],
  coreFlowRefs: ["booking_flow"],
  screenPatternRefs: ["forms"],
  routeRefs: ["booking_route"],
  stateRefs: ["form_state"],
  dataRefs: ["appointment_request"],
  securityRefs: ["privacy_review"],
  performanceRefs: ["initial_render"],
  testingRefs: ["booking_smoke"],
  releaseRefs: ["mvp_gate"],
  priority: "must_have_mvp",
  phaseScope: ["mvp", "beta"],
  category: "forms",
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
  acceptanceCriteria: [],
  definitionOfDone: {
    dodId: "mobile_feature:test:booking:dod",
    checklistItems: ["feature_metadata_mapped"],
    mappedArtifacts: ["mobile_ux_ui_pattern_catalog", "mobile_navigation_flow_model"],
    requiredEvidence: ["feature_blueprint"],
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
  dependencies: [],
  limitations: ["metadata_only"],
});

const input = createMobileScreenBlueprintGeneratorInput({
  generatorInputId: "mobile_screen_blueprint_input:test",
  sourceFeatureBlueprintOutputRef: "mobile_feature_blueprint_output:test",
  featureBlueprints: [feature],
  uxPatternContext: ["forms"],
  navigationContext: ["booking_route"],
  stateContext: ["form_state"],
  assumptions: ["metadata-only screen planning"],
});

assert(input.safetyBoundaries.metadataOnly === true, "input must be metadata-only");
assert(input.safetyBoundaries.noComponentGeneration === true, "input must not create components");
assert(input.safetyBoundaries.noScreenGeneration === true, "input must not create screens");
assert(input.safetyBoundaries.noRouteGeneration === true, "input must not create route files");
assert(input.safetyBoundaries.noAppGeneration === true, "input must not create apps");

const mappedScreens = mapFeatureBlueprintsToScreenBlueprints(input);
const mappedScreen = mappedScreens[0];

assert(mappedScreens.length === 1, "feature mapping should return one screen blueprint");
if (!mappedScreen) {
  throw new Error("mapped screen blueprint should exist");
}
assert(mappedScreen.phaseScope.includes("mvp"), "mapped screen should be MVP scoped");
assert(mappedScreen.category === "form", "mapped screen should classify as form");
assert(mappedScreen.componentSlots.length >= 4, "mapped screen should include component slots");

const slot = createMobileComponentSlot({
  slotId: "mobile_screen:test:manual:slot:header",
  slotName: "Manual header",
  slotType: "header",
  purpose: "Orient the user.",
  required: true,
  dataNeeds: [],
  interactionNotes: ["metadata_only"],
  accessibilityRequirement: "Header must expose a clear accessible title.",
  stateRefs: [],
  riskLevel: "low",
  limitations: ["metadata_only_slot"],
});

assert(slot.safetyBoundaries.noComponentGeneration === true, "slot must not create components");
assert(slot.safetyBoundaries.noRuntimeExecution === true, "slot must not run runtime behavior");

const manualScreen = createMobileScreenBlueprint({
  screenBlueprintId: "mobile_screen_blueprint:test:manual",
  screenId: "mobile_screen:test:manual",
  screenName: "Manual profile screen",
  description: "Users can review profile metadata.",
  sourceFeatureRefs: ["mobile_feature_blueprint:test:manual"],
  appType: "service_booking_app",
  targetUsers: ["patients"],
  userRoles: ["patient"],
  routeRefs: ["profile_route"],
  uxPatternRefs: ["profile_settings"],
  screenStateRefs: ["profile_loading", "profile_error"],
  componentSlots: [slot],
  dataRefs: ["profile_data"],
  stateRefs: ["profile_state"],
  securityRefs: ["privacy_review"],
  accessibilityNotes: ["labels_required"],
  safetyNotes: ["metadata_only"],
  performanceRefs: ["initial_render"],
  testingRefs: ["profile_smoke"],
  releaseRefs: ["mvp_gate"],
  phaseScope: ["mvp"],
  category: "profile",
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
  acceptanceCriteria: mappedScreen.acceptanceCriteria,
  definitionOfDone: mappedScreen.definitionOfDone,
  limitations: ["metadata_only"],
});

assert(manualScreen.safetyBoundaries.sourceOnly === true, "screen must be source-only");
assert(manualScreen.safetyBoundaries.noCodexExecution === true, "screen must not invoke Codex");
assert(manualScreen.safetyBoundaries.noRuntimeExecution === true, "screen must not run runtime behavior");

const output = generateMobileScreenBlueprints(input);

assert(output.screenBlueprints.length === 1, "output should include one screen blueprint");
assert(output.mvpScreens.length === 1, "output should include one MVP screen");
assert(output.betaScreens.length === 1, "output should include one beta screen");
assert(output.releaseScreens.length === 0, "output should not include release screens");
assert(output.safetyBoundaries.noProviderCalls === true, "output must not call providers");
assert(output.safetyBoundaries.noDashboardMutation === true, "output must not mutate dashboards");

const explicitOutput = createMobileScreenBlueprintOutput({
  outputId: "mobile_screen_blueprint_output:test:manual",
  sourceFeatureBlueprintOutputRef: input.sourceFeatureBlueprintOutputRef,
  screenBlueprints: [manualScreen],
  mvpScreens: [manualScreen],
  betaScreens: [],
  releaseScreens: [],
  blockedScreens: [],
  unresolvedQuestions: [],
  recommendedNextArtifact: "mobile_api_contract_planner",
  confidence: "high",
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
});

const summary = summarizeMobileScreenBlueprintOutput(explicitOutput);
const mvpScreens = selectScreenBlueprintsByScope(explicitOutput.screenBlueprints, "mvp");
const profileScreens = selectScreenBlueprintsByCategory(explicitOutput.screenBlueprints, "profile");

assert(summary.screenBlueprintCount === 1, "summary should count screen blueprints");
assert(summary.mvpScreenCount === 1, "summary should count MVP screens");
assert(summary.componentSlotCount === 1, "summary should count component slots");
assert(summary.recommendedNextPhase === "Phase 135B", "summary should point to Phase 135B");
assert(mvpScreens.length === 1, "scope filtering should work");
assert(profileScreens.length === 1, "category filtering should work");

console.log("Mobile Screen Blueprint Generator smoke tests passed");
console.log(`Screen blueprints: ${summary.screenBlueprintCount}`);
console.log(`MVP screens: ${summary.mvpScreenCount}`);
console.log(`Component slots: ${summary.componentSlotCount}`);
