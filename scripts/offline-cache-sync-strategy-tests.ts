import assert from "node:assert/strict";

import {
  createCacheStrategyModel,
  createOfflineCacheSyncStrategy,
  createOfflineQueueModel,
  createSyncConflictResolutionModel,
  recommendOfflineCacheSyncStrategy,
  selectCacheStrategiesByDomain,
  selectQueuesByOperationType,
  summarizeOfflineCacheSyncStrategy,
} from "../src/pm/offlineCacheSyncStrategy.js";

const queue = createOfflineQueueModel({
  queueId: "offline-queue:test-draft",
  queueName: "Test Draft Queue",
  operationType: "draft_save",
  targetEntity: "test_draft",
  priority: "normal",
  retryPolicy: "manual_retry",
  maxRetries: 1,
  conflictPolicy: "discard_draft_with_explanation",
  userFeedbackPattern: "Show pending draft feedback.",
  requiresAuth: false,
  riskLevel: "medium",
  requiredApprovals: [],
  limitations: ["Smoke fixture only."],
});

assert.equal(queue.safetyBoundaries.noQueueExecution, true);
assert.equal(queue.safetyBoundaries.noNetworkCalls, true);

const cache = createCacheStrategyModel({
  cacheId: "cache:test-domain",
  cacheName: "Test Domain Cache",
  dataDomain: "test_domain",
  cacheStrategy: "repository_scoped_future",
  invalidationPolicy: "Metadata only invalidation.",
  refreshPolicy: "Metadata only refresh.",
  freshnessWindow: "fresh_on_open",
  staleDataBehavior: "Show stale label.",
  offlineReadable: true,
  offlineWritable: false,
  riskLevel: "medium",
});

assert.equal(cache.safetyBoundaries.noApiCalls, true);
assert.equal(cache.safetyBoundaries.noStorageImplementation, true);

const conflict = createSyncConflictResolutionModel({
  conflictId: "sync-conflict:test",
  sourceEntity: "test_entity",
  conflictType: "concurrent_edit",
  detectionStrategy: "submit_time_review",
  resolutionStrategy: "merge_requires_user_decision",
  userDecisionRequired: true,
  rollbackHint: "Keep local draft visible.",
  auditHint: "Metadata only audit hint.",
  recoveryAction: "Ask user to review.",
  riskLevel: "high",
});

assert.equal(conflict.safetyBoundaries.noNetworkCalls, true);

const recommendation = recommendOfflineCacheSyncStrategy({
  appType: "marketplace_app",
  offlineNeeds: ["offline browse"],
  authNeeds: ["protected account"],
  safetyNeeds: ["report unsafe listing"],
  offlineQueues: [queue],
  cacheStrategies: [cache],
  conflictModels: [conflict],
});

assert.equal(recommendation.safetyBoundaries.noStorageImplementation, true);
assert.equal(recommendation.safetyBoundaries.noQueueExecution, true);
assert.equal(recommendation.riskLevel, "high");

const strategy = createOfflineCacheSyncStrategy({
  appType: "marketplace_app",
  dataDomains: ["test_domain"],
  offlineNeeds: ["offline browse"],
  authNeeds: ["protected account"],
  safetyNeeds: ["report unsafe listing"],
  offlineQueues: [queue],
  cacheStrategies: [cache],
  conflictModels: [conflict],
});

assert.equal(strategy.safetyBoundaries.metadataOnly, true);
assert.equal(strategy.safetyBoundaries.noApiCalls, true);
assert.equal(strategy.safetyBoundaries.noQueueExecution, true);
assert.equal(strategy.safetyBoundaries.noProviderCalls, true);
assert.equal(strategy.safetyBoundaries.noMemoryPersistence, true);
assert.equal(strategy.offlineQueues.length, 1);
assert.equal(strategy.cacheStrategies.length, 1);
assert.equal(strategy.conflictModels.length, 1);

const summary = summarizeOfflineCacheSyncStrategy(strategy);
assert.equal(summary.strategyId, strategy.strategyId);
assert.equal(summary.queueCount, 1);
assert.equal(summary.cacheStrategyCount, 1);
assert.equal(summary.conflictModelCount, 1);

assert.equal(selectQueuesByOperationType(strategy, "draft_save").length, 1);
assert.equal(selectCacheStrategiesByDomain(strategy, "test_domain").length, 1);

console.log("Offline Cache Sync Strategy smoke tests passed");
console.log(`Queues: ${strategy.offlineQueues.length}`);
console.log(`Caches: ${strategy.cacheStrategies.length}`);
console.log(`Conflicts: ${strategy.conflictModels.length}`);
