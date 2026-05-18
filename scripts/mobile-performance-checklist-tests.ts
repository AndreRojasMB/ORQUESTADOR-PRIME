import {
  createMobilePerformanceChecklist,
  createMobilePerformanceChecklistItem,
  createMobilePerformanceRisk,
  createMobileProfilingReadiness,
  recommendMobilePerformanceChecklist,
  selectPerformanceItemsByCategory,
  selectPerformanceRisksByCategory,
  summarizeMobilePerformanceChecklist,
} from "../src/pm/mobilePerformanceChecklist.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const item = createMobilePerformanceChecklistItem({
  checklistItemId: "perf-check:test",
  category: "startup",
  title: "Startup posture test",
  question: "Is startup posture documented for future review?",
  expectedEvidence: ["startup_ref"],
  failureSignal: "Missing startup review.",
  severityHint: "high",
  relatedAppTypes: ["any"],
  relatedArchitectureLayers: ["app_routes"],
  riskLevel: "high",
  requiredApprovals: ["future_profiling_review"],
  limitations: ["Metadata only."],
});

assert(item.safetyBoundaries.noProfilingExecution === true, "item must not execute profiling");

const risk = createMobilePerformanceRisk({
  riskId: "perf-risk:test",
  riskCategory: "startup",
  affectedFlow: "test_flow",
  affectedLayer: "app_routes",
  likelihood: "possible",
  impact: "high",
  severity: "high",
  mitigation: "Require evidence before future implementation.",
  requiredEvidence: ["flow_ref"],
  profilingNeeded: true,
  humanReviewRequired: true,
  limitations: ["Metadata only."],
});

assert(risk.safetyBoundaries.noRuntimeMetricCapture === true, "risk must not capture runtime metrics");

const readiness = createMobileProfilingReadiness({
  profilingId: "perf-readiness:test",
  targetArea: "startup",
  recommendedToolingPosture: "Future approved review only.",
  metricName: "startup_time_future",
  expectedSignal: "First useful screen should be acceptable for target devices.",
  riskLevel: "high",
  requiredEvidence: ["approval_ref"],
  futureExecutionRequired: true,
  limitations: ["Metadata only."],
});

assert(readiness.safetyBoundaries.noProfilingExecution === true, "readiness must not execute profiling");

const recommendation = recommendMobilePerformanceChecklist({
  appType: "marketplace_app",
  targetFlows: ["marketplace listing"],
});

assert(recommendation.safetyBoundaries.noAppGeneration === true, "recommendation must not generate apps");

const checklist = createMobilePerformanceChecklist({
  appType: "marketplace_app",
  targetFlows: ["marketplace listing"],
  checklistItems: [item],
  risks: [risk],
  profilingReadiness: [readiness],
});

assert(checklist.safetyBoundaries.sourceOnly === true, "checklist must be source-only");
assert(checklist.safetyBoundaries.noBenchmarkScripts === true, "checklist must not create comparative runtime scripts");
assert(checklist.safetyBoundaries.noRuntimeMeasurement === true, "checklist must not do runtime metric work");
assert(checklist.safetyBoundaries.noExpoEasExecution === true, "checklist must not execute Expo/EAS");

const summary = summarizeMobilePerformanceChecklist(checklist);

assert(summary.checklistItemCount === 1, "summary should count checklist items");
assert(summary.riskCount === 1, "summary should count risks");
assert(summary.profilingReadinessCount === 1, "summary should count readiness records");

const selectedItems = selectPerformanceItemsByCategory(checklist, "startup");
const selectedRisks = selectPerformanceRisksByCategory(checklist, "startup");

assert(selectedItems.length === 1, "item category filter should work");
assert(selectedRisks.length === 1, "risk category filter should work");

console.log("Mobile Performance Checklist smoke tests passed");
console.log(`Items: ${summary.checklistItemCount}`);
console.log(`Risks: ${summary.riskCount}`);
console.log(`Readiness: ${summary.profilingReadinessCount}`);
