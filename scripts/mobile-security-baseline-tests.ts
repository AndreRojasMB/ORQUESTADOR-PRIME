import {
  createMobileSecurityBaseline,
  createMobileSecurityChecklistItem,
  createMobileSecurityRisk,
  recommendMobileSecurityBaseline,
  selectChecklistItemsByCategory,
  selectSecurityRisksByCategory,
  summarizeMobileSecurityBaseline,
} from "../src/pm/mobileSecurityBaseline.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const risk = createMobileSecurityRisk({
  riskId: "risk:test",
  riskCategory: "secure_storage",
  affectedFlow: "test_flow",
  affectedData: "sensitive_personal",
  likelihood: "possible",
  impact: "high",
  severity: "high",
  mitigation: "Require evidence before future implementation.",
  requiredEvidence: ["state_ref"],
  approvalRequired: true,
  humanReviewRequired: true,
  limitations: ["Metadata only."],
});

assert(risk.safetyBoundaries.noStorageImplementation === true, "risk must remain no-storage metadata");

const checklistItem = createMobileSecurityChecklistItem({
  checklistItemId: "check:test",
  category: "secure_storage",
  title: "Storage posture test",
  question: "Is future sensitive state reviewed?",
  expectedEvidence: ["review_ref"],
  failureSignal: "Missing review.",
  severityHint: "high",
  relatedAppTypes: ["any"],
  relatedDataSensitivity: ["sensitive_personal"],
  riskLevel: "high",
  requiredApprovals: ["security_review"],
});

assert(checklistItem.safetyBoundaries.noAuthImplementation === true, "checklist must not imply auth implementation");

const recommendation = recommendMobileSecurityBaseline({
  appType: "service_booking_app",
  dataSensitivity: "sensitive_personal",
  authRequired: true,
  offlineRisk: "high",
});

assert(recommendation.safetyBoundaries.noApiCalls === true, "recommendation must not imply API calls");

const baseline = createMobileSecurityBaseline({
  appType: "service_booking_app",
  dataSensitivity: "sensitive_personal",
  authRequired: true,
  offlineRisk: "high",
  risks: [risk],
  checklistItems: [checklistItem],
});

assert(baseline.safetyBoundaries.sourceOnly === true, "baseline must be source-only");
assert(baseline.safetyBoundaries.noAuthImplementation === true, "baseline must not implement auth");
assert(baseline.safetyBoundaries.noStorageImplementation === true, "baseline must not implement storage");
assert(baseline.safetyBoundaries.noEncryptionImplementation === true, "baseline must not implement cryptographic controls");
assert(baseline.safetyBoundaries.noApiCalls === true, "baseline must not call APIs");
assert(baseline.summary.highestRiskLevel === "high", "summary should keep high risk");

const summary = summarizeMobileSecurityBaseline(baseline);

assert(summary.riskCount === 1, "summary should count risks");
assert(summary.checklistItemCount === 1, "summary should count checklist items");

const selectedRisks = selectSecurityRisksByCategory(baseline, "secure_storage");
const selectedChecklist = selectChecklistItemsByCategory(baseline, "secure_storage");

assert(selectedRisks.length === 1, "risk category filter should work");
assert(selectedChecklist.length === 1, "checklist category filter should work");

console.log("Mobile Security Baseline smoke tests passed");
console.log(`Risks: ${summary.riskCount}`);
console.log(`Checklist: ${summary.checklistItemCount}`);
