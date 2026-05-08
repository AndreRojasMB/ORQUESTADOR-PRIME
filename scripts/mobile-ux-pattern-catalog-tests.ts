import {
  buildDefaultMobileUxPatternCatalog,
  createMobileScreenStatePattern,
  createMobileUxPattern,
  selectMobileUxPatternsByAppType,
  selectMobileUxPatternsByCategory,
  summarizeMobileUxPatternCatalog,
} from "../src/pm/mobileUxPatternCatalog.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const catalog = buildDefaultMobileUxPatternCatalog({
  catalogId: "mobile-ux-catalog-smoke",
  appType: "marketplace_app",
  targetUsers: ["buyers", "vendors"],
  coreFlows: ["browse catalog", "message vendor", "checkout decision"],
  screenMap: ["Home", "Catalog", "Product Detail", "Vendor Messages"],
  authNeeds: ["account required for saved vendors"],
  offlineNeeds: ["cached catalog preview"],
  monetizationNeeds: ["future premium placement review"],
  safetyNeeds: ["trust signals and report path"],
  architectureLayers: ["screens", "features", "domain"],
});

const customPattern = createMobileUxPattern({
  patternId: "ux-smoke-custom",
  name: "Smoke custom pattern",
  category: "forms",
  appTypes: ["marketplace_app"],
  targetScreens: ["smoke-form"],
  userGoal: "Validate custom pattern construction.",
  recommendedStructure: ["intro", "fields", "review"],
  requiredStates: ["state-error-retry"],
  accessibilityNotes: ["Use persistent labels."],
  safetyNotes: ["Do not log raw values."],
  monetizationNotes: ["No payment behavior is generated."],
  navigationNotes: ["Warn before losing input."],
  dataNeeds: ["field policy"],
  riskLevel: "medium",
  requiredApprovals: ["form policy review"],
  implementationHints: ["Keep this advisory-only."],
  limitations: ["Smoke-only metadata."],
});

const customState = createMobileScreenStatePattern({
  screenStateId: "state-smoke-error",
  stateType: "error",
  trigger: "Smoke test failure.",
  userMessage: "Something needs review.",
  primaryAction: "Retry.",
  secondaryAction: "Go back.",
  recoveryPath: "Preserve user input.",
  telemetryHint: "Track category only.",
  accessibilityRequirement: "Move focus to the error summary.",
  riskLevel: "medium",
});

const navigationPatterns = selectMobileUxPatternsByCategory(catalog, "navigation");
const marketplacePatterns = selectMobileUxPatternsByAppType(catalog, "marketplace_app");
const summary = summarizeMobileUxPatternCatalog(catalog);

assert(catalog.patterns.length >= 16, "catalog should include the required pattern categories");
assert(catalog.screenStatePatterns.length >= 7, "catalog should include screen state patterns");
assert(catalog.recommendations.length > 0, "catalog should recommend relevant patterns");
assert(customPattern.safetyBoundaries.noUiGeneration, "pattern creation must preserve no UI generation");
assert(customState.safetyBoundaries.noRuntimeExecution, "screen state creation must preserve no runtime execution");
assert(navigationPatterns.some((pattern) => pattern.category === "navigation"), "category selection should find navigation patterns");
assert(marketplacePatterns.length > 0, "app type selection should find marketplace patterns");
assert(summary.patternCount === catalog.patterns.length, "summary should reflect catalog pattern count");
assert(summary.safetyBoundaries.noAppGeneration, "summary should preserve no app generation");
assert(
  catalog.safetyBoundaries.noMobileToolingExecution &&
    catalog.safetyBoundaries.noExpoEasExecution &&
    catalog.safetyBoundaries.noPackageChanges,
  "catalog should not assume mobile tooling, release execution, or package changes",
);

console.log("Mobile UX Pattern Catalog smoke tests passed");
console.log(`Patterns: ${summary.patternCount}`);
console.log(`Screen states: ${summary.screenStatePatternCount}`);
console.log(`Recommendations: ${catalog.recommendations.length}`);
