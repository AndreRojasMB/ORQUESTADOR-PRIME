import {
  createStoreMetadataModel,
  createStorePrivacyRatingModel,
  createStoreReadinessAppMetadata,
  createStoreReadinessChecklistItem,
  recommendStoreReadiness,
  selectStoreChecklistItemsByCategory,
  selectStoreMetadataByAppType,
  summarizeStoreReadiness,
} from "../src/pm/storeReadinessAppMetadata.ts";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const storeMetadata = createStoreMetadataModel({
  storeMetadataId: "store_metadata:test",
  appType: "service_booking_app",
  appName: "Service Booking Test",
  subtitle: "Plan bookings with review-ready metadata",
  shortDescription: "Advisory listing copy for future review.",
  fullDescription: "Future full description generated from approved planning metadata only.",
  keywords: ["booking", "service", "review"],
  category: "app_identity",
  targetAudience: ["customers", "service_providers"],
  valueProposition: "Coordinate service booking flows with review-ready release posture.",
  screenshotsPosture: "Screenshot story coverage planned only.",
  previewVideoPosture: "Preview media posture planned only.",
  iconPosture: "Icon posture requires design review.",
  supportUrlPosture: "Support URL posture requires review.",
  marketingUrlPosture: "Marketing URL posture requires review.",
  riskLevel: "medium",
  requiredApprovals: ["product_copy_review"],
  limitations: ["metadata_only_listing"],
});

assert(storeMetadata.safetyBoundaries.noStoreSubmission === true, "metadata must not submit stores");
assert(storeMetadata.safetyBoundaries.noAssetGeneration === true, "metadata must not produce assets");

const privacyRating = createStorePrivacyRatingModel({
  privacyRatingId: "store_privacy_rating:test",
  dataCollectionCategories: ["analytics_future", "crash_error_future"],
  sensitiveDataCategories: ["sensitive_data_blocked_until_review"],
  analyticsDisclosure: "Analytics disclosure requires future privacy review.",
  crashDisclosure: "Crash disclosure requires redaction review.",
  trackingDisclosure: "Tracking posture blocked until review.",
  permissionsDisclosure: "Permissions disclosure follows security and notification posture.",
  ageRatingPosture: "Age rating requires human review.",
  contentRatingPosture: "Content rating requires human review.",
  complianceNotes: ["privacy_review_required", "release_review_required"],
  humanReviewRequired: true,
  riskLevel: "high",
});

assert(privacyRating.safetyBoundaries.noStoreSubmission === true, "privacy model must not submit stores");
assert(privacyRating.safetyBoundaries.noCredentialAccess === true, "privacy model must not touch credential material");

const checklistItem = createStoreReadinessChecklistItem({
  checklistItemId: "store_readiness_checklist:test:privacy",
  category: "privacy_labels",
  title: "Privacy labels review",
  requiredEvidence: ["privacy_review", "analytics_disclosure_review"],
  blockingSeverity: "critical_blocking",
  relatedSecurityChecks: ["data_sensitivity_review"],
  relatedAnalyticsChecks: ["analytics_crash_disclosure_review"],
  relatedReleaseChecks: ["release_gate_privacy_review"],
  humanApprovalRequired: true,
  riskLevel: "high",
});

assert(checklistItem.safetyBoundaries.noStoreSubmission === true, "checklist must not submit stores");
assert(checklistItem.safetyBoundaries.noProviderExecution === true, "checklist must not execute providers");

const readiness = createStoreReadinessAppMetadata({
  readinessId: "store_readiness_app_metadata:test",
  appType: "service_booking_app",
  storeMetadata,
  privacyRating,
  readinessChecklist: [checklistItem],
  riskLevel: "medium",
  requiredApprovals: ["release_review"],
  limitations: ["metadata_only_readiness"],
});

assert(readiness.safetyBoundaries.sourceOnly === true, "readiness must be source-only");
assert(readiness.safetyBoundaries.metadataOnly === true, "readiness must be metadata-only");
assert(readiness.safetyBoundaries.noStoreSubmission === true, "readiness must not submit stores");
assert(readiness.safetyBoundaries.noAppleStorePortalInteraction === true, "readiness must not interact with Apple store portal");
assert(readiness.safetyBoundaries.noAndroidStoreConsoleInteraction === true, "readiness must not interact with Android store console");
assert(readiness.safetyBoundaries.noScreenshotGeneration === true, "readiness must not produce screenshots");
assert(readiness.safetyBoundaries.noAssetGeneration === true, "readiness must not produce assets");
assert(readiness.safetyBoundaries.noCredentialAccess === true, "readiness must not touch credential material");
assert(readiness.safetyBoundaries.noAppGeneration === true, "readiness must not create apps");

const defaultReadiness = createStoreReadinessAppMetadata({
  appType: "service_booking_app",
});
const recommendation = recommendStoreReadiness(readiness);
const summary = summarizeStoreReadiness(readiness);
const privacyItems = selectStoreChecklistItemsByCategory(readiness.readinessChecklist, "privacy_labels");
const serviceMetadata = selectStoreMetadataByAppType([storeMetadata], "service_booking_app");

assert(defaultReadiness.readinessChecklist.length >= 4, "default readiness should include checklist items");
assert(defaultReadiness.privacyRating.humanReviewRequired === true, "default privacy rating should require review");
assert(recommendation.safetyBoundaries.noStoreSubmission === true, "recommendation must not submit stores");
assert(recommendation.safetyBoundaries.noAssetGeneration === true, "recommendation must not produce assets");
assert(summary.checklistItemCount === 1, "summary should count checklist items");
assert(summary.blockingItemCount === 1, "summary should count blocking items");
assert(summary.humanApprovalItemCount === 1, "summary should count human approval items");
assert(summary.recommendedNextPhase === "Phase 140B", "summary should point to Phase 140B");
assert(privacyItems.length === 1, "category filtering should work");
assert(serviceMetadata.length === 1, "app type filtering should work");

console.log("Store Readiness / App Metadata smoke tests passed");
console.log(`Default checklist items: ${defaultReadiness.readinessChecklist.length}`);
console.log(`Default approvals: ${defaultReadiness.requiredApprovals.length}`);
