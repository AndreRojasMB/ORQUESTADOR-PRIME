import assert from "node:assert/strict";
import {
  buildMobileAppFactoryQualityModel,
  buildMobileAppFactorySafetyModel,
  buildMobileAppFactoryStrategy,
  classifyMobileAppType,
  createMobileAppFactoryIntake,
  mobileAppFactoryAppTypes,
  summarizeMobileAppFactoryStrategy,
  type MobileNavigationModel,
  type MobileScreenMapItem,
} from "../src/pm/mobileAppFactoryStrategy.js";
import type { PMEvidenceReference } from "../src/pm/types.js";

const evidenceRef: PMEvidenceReference = {
  evidenceId: "evidence:mobile-factory:121I",
  label: "Mobile App Factory smoke evidence",
  reference: "docs/mobile-app-factory-strategy.md",
  referenceType: "doc",
  safeSummary: "Caller-supplied metadata evidence for mobile strategy.",
  metadataOnly: true,
  noFileRead: true,
};

const navigationModel: MobileNavigationModel = {
  rootModel: "stack_tabs_modal",
  authGate: "auth_required_after_onboarding",
  primaryNavigation: ["home", "progress", "settings"],
  modalNeeds: ["premium_upgrade"],
  deepLinkNeeds: ["habit_reminder"],
  recoveryPaths: ["account_recovery", "offline_recovery"],
  metadataOnly: true,
  advisoryOnly: true,
  noRouteGeneration: true,
};

const screen: MobileScreenMapItem = {
  screenId: "screen:habit-home",
  title: "Habit Home",
  flowRef: "flow:daily-loop",
  userGoal: "Complete today's habit loop.",
  primaryActions: ["mark_complete", "review_streak"],
  requiredData: ["habit", "streak"],
  emptyStateNeeds: ["first_habit_prompt"],
  loadingStateNeeds: ["local_cache_loading"],
  errorStateNeeds: ["sync_error_message"],
  accessibilityNotes: ["clear labels for completion controls"],
  securityNotes: ["avoid sensitive content on lock screen"],
  metadataOnly: true,
  advisoryOnly: true,
  noUiGeneration: true,
};

assert.equal(mobileAppFactoryAppTypes.includes("habit_gamified_app"), true);
assert.equal(mobileAppFactoryAppTypes.includes("ai_assistant_mobile_app"), true);
assert.equal(classifyMobileAppType("AI assistant for learning habits"), "habit_gamified_app");
assert.equal(classifyMobileAppType("Marketplace for local services"), "marketplace_app");

const intake = createMobileAppFactoryIntake({
  appIdea: "Habit gamified mobile app with premium coaching",
  targetUsers: ["busy professionals"],
  businessGoal: "increase retention through a daily habit loop",
  platformPriority: "cross_platform",
  coreFlows: ["onboarding", "daily_habit_loop", "settings"],
  screenMap: [screen],
  navigationModel,
  dataModelSummary: "habits, streaks, reminders, coaching plans",
  offlineNeeds: ["local cache", "offline completion queue"],
  authNeeds: ["email sign-in"],
  monetizationNeeds: ["premium subscription planning"],
  safetyNeeds: ["privacy review"],
  releaseTarget: "mvp",
  requiredApprovals: ["privacy_review", "monetization_review"],
  evidenceRefs: [evidenceRef],
});
assert.equal(intake.supportedAppType, "habit_gamified_app");
assert.equal(intake.noAppGeneration, true);
assert.equal(intake.noMobileTooling, true);
assert.equal(intake.noProviderCalls, true);

const quality = buildMobileAppFactoryQualityModel(intake);
assert.equal(quality.status, "ready");
assert.equal(quality.noTestExecution, true);
assert.equal(quality.releaseReadinessCriteria.includes("platform_policy_review_ready"), true);

const safety = buildMobileAppFactorySafetyModel(intake);
assert.equal(safety.status, "requires_human_review");
assert.equal(safety.noRuntimeExecution, true);
assert.equal(safety.noDashboardMutation, true);

const strategy = buildMobileAppFactoryStrategy({
  appIdea: intake.appIdea,
  targetUsers: intake.targetUsers,
  businessGoal: intake.businessGoal,
  platformPriority: intake.platformPriority,
  coreFlows: intake.coreFlows,
  screenMap: intake.screenMap,
  navigationModel: intake.navigationModel,
  dataModelSummary: intake.dataModelSummary,
  offlineNeeds: intake.offlineNeeds,
  authNeeds: intake.authNeeds,
  monetizationNeeds: intake.monetizationNeeds,
  safetyNeeds: intake.safetyNeeds,
  releaseTarget: intake.releaseTarget,
  requiredApprovals: intake.requiredApprovals,
  evidenceRefs: intake.evidenceRefs,
});
assert.equal(strategy.sourceOnly, true);
assert.equal(strategy.advisoryOnly, true);
assert.equal(strategy.noNativeProjectCreation, true);
assert.equal(strategy.noMemoryPersistence, true);
assert.equal(strategy.recommendedNextStep.noExecution, true);

const summary = summarizeMobileAppFactoryStrategy(strategy);
assert.equal(summary.metadataOnly, true);
assert.equal(summary.noExecution, true);
assert.equal(summary.recommendedNextPhase, "Phase 122B");
assert.equal(summary.screenCount, 1);

console.log("6/6 Mobile App Factory strategy smoke tests passed");
