import assert from "node:assert/strict";
import {
  buildDefaultMobileArchitectureLayers,
  createMobileArchitectureProfile,
  describeMobileArchitectureLayer,
  mobileArchitectureLayerIds,
  recommendMobileArchitectureProfile,
  summarizeMobileArchitectureProfile,
} from "../src/pm/mobileArchitectureProfile.js";
import {
  createMobileAppFactoryIntake,
  type MobileScreenMapItem,
} from "../src/pm/mobileAppFactoryStrategy.js";
import type { PMEvidenceReference } from "../src/pm/types.js";

const evidenceRef: PMEvidenceReference = {
  evidenceId: "evidence:mobile-architecture:122I",
  label: "Mobile architecture profile smoke evidence",
  reference: "docs/react-native-expo-architecture-profile.md",
  referenceType: "doc",
  safeSummary: "Caller-supplied metadata evidence for the RN/Expo profile.",
  metadataOnly: true,
  noFileRead: true,
};

const screen: MobileScreenMapItem = {
  screenId: "screen:marketplace-home",
  title: "Marketplace Home",
  flowRef: "flow:buyer-discovery",
  userGoal: "Browse available services safely.",
  primaryActions: ["search", "filter", "open_listing"],
  requiredData: ["listing", "seller"],
  emptyStateNeeds: ["no_results"],
  loadingStateNeeds: ["listing_loading"],
  errorStateNeeds: ["listing_error"],
  accessibilityNotes: ["search input label"],
  securityNotes: ["avoid exposing private seller details"],
  metadataOnly: true,
  advisoryOnly: true,
  noUiGeneration: true,
};

const intake = createMobileAppFactoryIntake({
  appIdea: "Marketplace app for local services with offline saved listings",
  targetUsers: ["buyers", "sellers"],
  platformPriority: "cross_platform",
  supportedAppType: "marketplace_app",
  coreFlows: ["buyer_discovery", "listing_detail", "seller_contact"],
  screenMap: [screen],
  offlineNeeds: ["saved listings cache"],
  authNeeds: ["buyer sign-in", "seller sign-in"],
  monetizationNeeds: ["marketplace fee planning"],
  safetyNeeds: ["privacy review"],
  releaseTarget: "mvp",
  requiredApprovals: ["privacy_review", "marketplace_policy_review"],
  evidenceRefs: [evidenceRef],
});

const layers = buildDefaultMobileArchitectureLayers();
assert.equal(layers.length, mobileArchitectureLayerIds.length);
assert.equal(layers.some((layer) => layer.layer === "app_routes"), true);
assert.equal(layers.some((layer) => layer.layer === "release_future"), true);
assert.equal(describeMobileArchitectureLayer("repositories").noFileGeneration, true);

const recommendation = recommendMobileArchitectureProfile({ factoryIntake: intake });
assert.equal(recommendation.appType, "marketplace_app");
assert.equal(recommendation.noAppGeneration, true);
assert.equal(recommendation.noMobileTooling, true);
assert.equal(recommendation.riskSignals.includes("marketplace_transaction"), true);

const profile = createMobileArchitectureProfile({ factoryIntake: intake });
assert.equal(profile.sourceOnly, true);
assert.equal(profile.advisoryOnly, true);
assert.equal(profile.noAppGeneration, true);
assert.equal(profile.noMobileTooling, true);
assert.equal(profile.noNativeProjectCreation, true);
assert.equal(profile.noPackageChanges, true);
assert.equal(profile.noProviderCalls, true);
assert.equal(profile.noRuntimeExecution, true);
assert.equal(profile.noDashboardMutation, true);
assert.equal(profile.noDbSqlMutation, true);
assert.equal(profile.noCiActivation, true);
assert.equal(profile.noMemoryPersistence, true);
assert.equal(profile.recommendedProjectStructure.length, mobileArchitectureLayerIds.length);
assert.equal(profile.offlineProfile.approvalRequired, true);
assert.equal(profile.authProfile.noCredentialUse, true);
assert.equal(profile.releaseProfile.noBuildCreation, true);
assert.equal(profile.testingProfile.noTestExecution, true);

const summary = summarizeMobileArchitectureProfile(profile);
assert.equal(summary.metadataOnly, true);
assert.equal(summary.noExecution, true);
assert.equal(summary.recommendedNextPhase, "Phase 123B");
assert.equal(summary.layerCount, 14);

console.log("5/5 Mobile Architecture Profile smoke tests passed");
