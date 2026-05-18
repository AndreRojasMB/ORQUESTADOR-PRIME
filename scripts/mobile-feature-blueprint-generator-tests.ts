import { createMobileRequirementCandidate } from "../src/pm/mobileRequirementsInterview.js";
import {
  createMobileFeatureBlueprint,
  createMobileFeatureBlueprintGeneratorInput,
  createMobileFeatureBlueprintOutput,
  generateMobileFeatureBlueprints,
  mapRequirementsToFeatureBlueprints,
  selectFeatureBlueprintsByCategory,
  selectFeatureBlueprintsByScope,
  summarizeMobileFeatureBlueprintOutput,
} from "../src/pm/mobileFeatureBlueprintGenerator.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const requirement = createMobileRequirementCandidate({
  requirementId: "mobile_requirement:test:booking",
  title: "Clinic booking MVP",
  category: "functional",
  description: "Users can create and reschedule appointments.",
  priority: "must_have_mvp",
  sourceAnswerRefs: ["mobile_requirement_answer:test:functional"],
  targetMobileArtifacts: [
    "mobile_app_factory_strategy",
    "mobile_navigation_flow_model",
    "mobile_ux_ui_pattern_catalog",
    "mobile_state_management_strategy",
    "mobile_testing_strategy",
  ],
  riskLevel: "medium",
  requiredApprovals: [],
  mvpRelevant: true,
  betaRelevant: true,
  releaseRelevant: false,
  unresolved: false,
});

const input = createMobileFeatureBlueprintGeneratorInput({
  generatorInputId: "mobile_feature_blueprint_input:test",
  sourceRequirementsInterviewRef: "mobile_requirements_interview:test",
  requirementCandidates: [requirement],
  appFactoryContext: ["service_booking_app"],
  assumptions: ["metadata-only feature planning"],
});

assert(input.safetyBoundaries.metadataOnly === true, "input must be metadata-only");
assert(input.safetyBoundaries.noFeatureCodeGeneration === true, "input must not create feature source");
assert(input.safetyBoundaries.noScreenGeneration === true, "input must not create screens");
assert(input.safetyBoundaries.noRouteGeneration === true, "input must not create route files");
assert(input.safetyBoundaries.noAppGeneration === true, "input must not create apps");

const mappedBlueprints = mapRequirementsToFeatureBlueprints(input);
const mappedBlueprint = mappedBlueprints[0];

assert(mappedBlueprints.length === 1, "requirement mapping should return one blueprint");
if (!mappedBlueprint) {
  throw new Error("mapped blueprint should exist");
}
assert(mappedBlueprint.phaseScope.includes("mvp"), "mapped blueprint should be MVP scoped");
assert(mappedBlueprint.category === "unknown" || mappedBlueprint.category === "forms", "mapped blueprint should classify safely");

const manualBlueprint = createMobileFeatureBlueprint({
  blueprintId: "mobile_feature_blueprint:test:manual",
  featureId: "mobile_feature:test:manual",
  featureName: "Manual profile setup",
  description: "Users can maintain profile details.",
  sourceRequirementRefs: ["mobile_requirement:test:profile"],
  appType: "service_booking_app",
  targetUsers: ["clinic admins"],
  userRoles: ["admin"],
  coreFlowRefs: ["profile_flow"],
  screenPatternRefs: ["profile_settings"],
  routeRefs: ["settings_profile"],
  stateRefs: ["form_state"],
  dataRefs: ["profile_data"],
  securityRefs: ["privacy_review"],
  performanceRefs: [],
  testingRefs: ["profile_smoke"],
  releaseRefs: [],
  priority: "must_have_mvp",
  phaseScope: ["mvp"],
  category: "profile_settings",
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
  acceptanceCriteria: mappedBlueprint.acceptanceCriteria,
  definitionOfDone: mappedBlueprint.definitionOfDone,
  dependencies: mappedBlueprint.dependencies,
  limitations: ["metadata_only"],
});

assert(manualBlueprint.safetyBoundaries.sourceOnly === true, "blueprint must be source-only");
assert(manualBlueprint.safetyBoundaries.noCodexExecution === true, "blueprint must not invoke Codex");
assert(manualBlueprint.safetyBoundaries.noRuntimeExecution === true, "blueprint must not run runtime behavior");

const output = generateMobileFeatureBlueprints(input);

assert(output.blueprints.length === 1, "output should include one blueprint");
assert(output.mvpFeatures.length === 1, "output should include one MVP feature");
assert(output.betaFeatures.length === 1, "output should include one beta feature");
assert(output.releaseFeatures.length === 0, "output should not include release features");
assert(output.safetyBoundaries.noProviderCalls === true, "output must not call providers");
assert(output.safetyBoundaries.noDashboardMutation === true, "output must not mutate dashboards");

const explicitOutput = createMobileFeatureBlueprintOutput({
  outputId: "mobile_feature_blueprint_output:test:manual",
  sourceRequirementsInterviewRef: input.sourceRequirementsInterviewRef,
  blueprints: [manualBlueprint],
  mvpFeatures: [manualBlueprint],
  betaFeatures: [],
  releaseFeatures: [],
  blockedFeatures: [],
  unresolvedQuestions: [],
  recommendedNextArtifact: "mobile_screen_blueprint_generator_plan",
  confidence: "high",
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
});

const summary = summarizeMobileFeatureBlueprintOutput(explicitOutput);
const mvpFeatures = selectFeatureBlueprintsByScope(explicitOutput.blueprints, "mvp");
const profileFeatures = selectFeatureBlueprintsByCategory(explicitOutput.blueprints, "profile_settings");

assert(summary.blueprintCount === 1, "summary should count blueprints");
assert(summary.mvpFeatureCount === 1, "summary should count MVP features");
assert(summary.recommendedNextPhase === "Phase 134B", "summary should point to Phase 134B");
assert(mvpFeatures.length === 1, "scope filtering should work");
assert(profileFeatures.length === 1, "category filtering should work");

console.log("Mobile Feature Blueprint Generator smoke tests passed");
console.log(`Blueprints: ${summary.blueprintCount}`);
console.log(`MVP features: ${summary.mvpFeatureCount}`);
console.log(`Approvals: ${summary.approvalCount}`);
