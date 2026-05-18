import {
  createMobileDeviceMatrix,
  createMobileSmokeFlow,
  createMobileTestingStrategy,
  recommendMobileTestingStrategy,
  selectDeviceMatrixByPlatform,
  selectSmokeFlowsByAppType,
  summarizeMobileTestingStrategy,
} from "../src/pm/mobileTestingStrategy.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const matrix = createMobileDeviceMatrix({
  matrixId: "qa-matrix:test",
  platform: "cross_platform",
  deviceClass: "standard_phone",
  osVersionRange: "current_supported",
  screenSizeClass: "standard",
  performanceTier: "mid",
  networkCondition: "online_fast",
  accessibilityMode: "default",
  requiredForRelease: true,
  riskLevel: "medium",
});

assert(matrix.safetyBoundaries.noVirtualDeviceLaunch === true, "matrix must not start virtual devices");
assert(matrix.safetyBoundaries.noDeviceAutomation === true, "matrix must not automate devices");

const smokeFlow = createMobileSmokeFlow({
  smokeFlowId: "qa-smoke:test",
  name: "Core flow smoke posture",
  appType: "service_booking_app",
  targetUser: "customer",
  startRoute: "home",
  steps: ["review home", "review booking request", "review confirmation"],
  expectedOutcome: "Customer can be reviewed through the future core flow.",
  requiredTestData: ["sample_booking"],
  relatedRisks: ["booking_regression"],
  priority: "high",
  automationReadiness: "blocked_by_missing_app",
  humanReviewRequired: true,
});

assert(smokeFlow.safetyBoundaries.noRealAppTests === true, "smoke flow must not run real app tests");
assert(smokeFlow.safetyBoundaries.noDeviceAutomation === true, "smoke flow must not automate devices");

const recommendation = recommendMobileTestingStrategy({
  appType: "service_booking_app",
});

assert(recommendation.safetyBoundaries.noRealAppTests === true, "recommendation must not run real app tests");
assert(recommendation.safetyBoundaries.noMobileCommandExecution === true, "recommendation must not run mobile commands");

const strategy = createMobileTestingStrategy({
  appType: "service_booking_app",
  testLevels: ["unit", "integration", "smoke"],
  smokeFlows: [smokeFlow],
  deviceMatrix: [matrix],
});

assert(strategy.safetyBoundaries.sourceOnly === true, "strategy must be source-only");
assert(strategy.safetyBoundaries.metadataOnly === true, "strategy must be metadata-only");
assert(strategy.safetyBoundaries.noRealAppTests === true, "strategy must not run real app tests");
assert(strategy.safetyBoundaries.noVirtualDeviceLaunch === true, "strategy must not start virtual devices");
assert(strategy.safetyBoundaries.noWorkflowCiActivation === true, "strategy must not activate workflow or CI");

const summary = summarizeMobileTestingStrategy(strategy);

assert(summary.testLevelCount === 3, "summary should count test levels");
assert(summary.smokeFlowCount === 1, "summary should count smoke flows");
assert(summary.deviceMatrixCount === 1, "summary should count matrix entries");
assert(summary.releaseRequiredMatrixCount === 1, "summary should count release-required matrix entries");

const flows = selectSmokeFlowsByAppType(strategy, "service_booking_app");
const matrixEntries = selectDeviceMatrixByPlatform(strategy, "cross_platform");

assert(flows.length === 1, "app type filtering should work");
assert(matrixEntries.length === 1, "platform filtering should work");

console.log("Mobile Testing Strategy smoke tests passed");
console.log(`Test levels: ${summary.testLevelCount}`);
console.log(`Smoke flows: ${summary.smokeFlowCount}`);
console.log(`Device matrix entries: ${summary.deviceMatrixCount}`);
