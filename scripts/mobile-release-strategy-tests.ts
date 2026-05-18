import {
  createMobileReleaseChannel,
  createMobileReleaseReadinessGate,
  createMobileReleaseStrategy,
  recommendMobileReleaseStrategy,
  selectReleaseChannelsByEnvironment,
  selectReleaseGatesByCategory,
  summarizeMobileReleaseStrategy,
} from "../src/pm/mobileReleaseStrategy.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const channel = createMobileReleaseChannel({
  channelId: "release-channel:test",
  channelName: "preview_future",
  environment: "preview_future",
  audience: "stakeholders",
  updatePolicy: "manual_review_required",
  buildProfileRef: "release-profile:test",
  approvalRequired: true,
  rollbackSupported: true,
  riskLevel: "medium",
});

assert(channel.safetyBoundaries.noEasCommands === true, "channel must not run EAS commands");
assert(channel.safetyBoundaries.noStoreSubmission === true, "channel must not submit to platforms");

const gate = createMobileReleaseReadinessGate({
  gateId: "release-gate:test",
  title: "Testing evidence exists",
  category: "internal_testing",
  requiredEvidence: ["testing_summary"],
  blockingSeverity: "blocking",
  relatedTestingChecks: ["smoke", "release_readiness"],
  relatedSecurityChecks: [],
  relatedPerformanceChecks: ["startup"],
  humanApprovalRequired: true,
  riskLevel: "high",
});

assert(gate.safetyBoundaries.noCredentialMaterialAccess === true, "gate must not access credential material");
assert(gate.safetyBoundaries.noStoreSubmission === true, "gate must not submit to platforms");

const recommendation = recommendMobileReleaseStrategy({
  appType: "service_booking_app",
});

assert(recommendation.safetyBoundaries.noEasCommands === true, "recommendation must not run EAS commands");
assert(recommendation.safetyBoundaries.noExpoCommands === true, "recommendation must not run Expo commands");
assert(recommendation.safetyBoundaries.noStoreSubmission === true, "recommendation must not submit to platforms");

const strategy = createMobileReleaseStrategy({
  appType: "service_booking_app",
  targetPlatforms: ["ios", "android"],
  channels: [channel],
  readinessGates: [gate],
});

assert(strategy.safetyBoundaries.sourceOnly === true, "strategy must be source-only");
assert(strategy.safetyBoundaries.metadataOnly === true, "strategy must be metadata-only");
assert(strategy.safetyBoundaries.noEasCommands === true, "strategy must not run EAS commands");
assert(strategy.safetyBoundaries.noExpoCommands === true, "strategy must not run Expo commands");
assert(strategy.safetyBoundaries.noCredentialMaterialAccess === true, "strategy must not access credential material");
assert(strategy.safetyBoundaries.noStoreSubmission === true, "strategy must not submit to platforms");
assert(strategy.safetyBoundaries.noWorkflowCiActivation === true, "strategy must not activate workflow or CI");

const summary = summarizeMobileReleaseStrategy(strategy);

assert(summary.targetPlatformCount === 2, "summary should count platforms");
assert(summary.channelCount === 1, "summary should count channels");
assert(summary.readinessGateCount === 1, "summary should count gates");
assert(summary.rollbackSupportedChannelCount === 1, "summary should count rollback-supported channels");

const selectedChannels = selectReleaseChannelsByEnvironment(strategy, "preview_future");
const selectedGates = selectReleaseGatesByCategory(strategy, "internal_testing");

assert(selectedChannels.length === 1, "environment filtering should work");
assert(selectedGates.length === 1, "gate category filtering should work");

console.log("Mobile Release / EAS Strategy smoke tests passed");
console.log(`Channels: ${summary.channelCount}`);
console.log(`Readiness gates: ${summary.readinessGateCount}`);
console.log(`Target platforms: ${summary.targetPlatformCount}`);
