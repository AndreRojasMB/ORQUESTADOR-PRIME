import assert from "node:assert/strict";

import {
  createMobileCacheSyncModel,
  createMobileStateManagementStrategy,
  createMobileStateOwnership,
  mobileStateCategories,
  recommendMobileStateManagementStrategy,
  selectMobileStatesByCategory,
  selectMobileStatesByOwnerLayer,
  summarizeMobileStateManagementStrategy,
} from "../src/pm/mobileStateManagementStrategy.js";

const ownership = createMobileStateOwnership({
  stateId: "state:test-form",
  stateName: "Test Form State",
  ownerLayer: "features",
  stateType: "form_state",
  sourceOfTruth: "form_boundary",
  lifecycle: "feature_lifetime",
  persistencePolicy: "future_draft_recovery",
  syncPolicy: "manual_refresh_future",
  offlineBehavior: "draft_only_future",
  errorHandling: "screen_state_recovery",
  relatedRoutes: ["route:test-form"],
  relatedScreenStates: ["screen-state:error"],
  riskLevel: "medium",
  requiredApprovals: [],
  limitations: ["Smoke fixture only."],
});

assert.equal(ownership.safetyBoundaries.metadataOnly, true);
assert.equal(ownership.safetyBoundaries.noStorageImplementation, true);

const cacheSync = createMobileCacheSyncModel({
  cacheStrategy: "repository_scoped_future",
  invalidationPolicy: "metadata only invalidation",
  refreshPolicy: "metadata only refresh",
  conflictResolutionPolicy: "metadata only conflict review",
  offlineQueuePolicy: "metadata only queue posture",
  retryPolicy: "metadata only retry posture",
  dataFreshnessLevel: "fresh_on_open",
  userFeedbackPattern: "metadata only feedback",
  riskLevel: "medium",
});

assert.equal(cacheSync.safetyBoundaries.noApiCalls, true);
assert.equal(cacheSync.safetyBoundaries.noNetworkCalls, true);

const recommendation = recommendMobileStateManagementStrategy({
  appType: "marketplace_app",
  offlineNeeds: ["offline browse recovery"],
  authNeeds: ["protected account area"],
  monetizationNeeds: ["premium entitlement posture"],
});

assert.equal(recommendation.safetyBoundaries.noStorageImplementation, true);
assert.ok(recommendation.primaryStateCategories.includes("offline_queue"));
assert.ok(recommendation.requiredApprovals.includes("offline_state_review"));

const strategy = createMobileStateManagementStrategy({
  appType: "marketplace_app",
  coreFlows: ["browse", "detail", "checkout draft"],
  dataModelSummary: "Marketplace listing and user account metadata.",
  offlineNeeds: ["offline browse recovery"],
  authNeeds: ["protected account area"],
  safetyNeeds: ["report unsafe listing"],
  monetizationNeeds: ["premium entitlement posture"],
  stateOwnership: [ownership],
  cacheSyncModel: cacheSync,
});

assert.equal(strategy.safetyBoundaries.metadataOnly, true);
assert.equal(strategy.safetyBoundaries.noProviderCalls, true);
assert.equal(strategy.safetyBoundaries.noRuntimeExecution, true);
assert.equal(strategy.safetyBoundaries.noDashboardMutation, true);
assert.equal(strategy.safetyBoundaries.noMemoryPersistence, true);
assert.equal(strategy.stateOwnership.length, 1);

const summary = summarizeMobileStateManagementStrategy(strategy);
assert.equal(summary.strategyId, strategy.strategyId);
assert.equal(summary.stateOwnershipCount, 1);
assert.equal(summary.cacheStrategy, "repository_scoped_future");

assert.equal(selectMobileStatesByCategory(strategy, "form_state").length, 1);
assert.equal(selectMobileStatesByOwnerLayer(strategy, "features").length, 1);
assert.ok(mobileStateCategories.includes("error_loading_empty"));

console.log("Mobile State Management Strategy smoke tests passed");
console.log(`Categories: ${mobileStateCategories.length}`);
console.log(`States: ${strategy.stateOwnership.length}`);
console.log(`Approvals: ${recommendation.requiredApprovals.length}`);
