import type { MobileAppFactoryAppType } from "./mobileAppFactoryStrategy.js";
import type { PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type StoreReadinessCategory =
  | "app_identity"
  | "description_copy"
  | "keywords_search"
  | "screenshots_preview"
  | "icon_brand"
  | "privacy_labels"
  | "permissions_disclosure"
  | "age_content_rating"
  | "analytics_crash_disclosure"
  | "support_contact"
  | "release_notes"
  | "compliance_review"
  | "human_approval";

export type StoreReadinessBlockingSeverity = "info" | "warning" | "blocking" | "critical_blocking";

export interface StoreReadinessSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noStoreSubmission: true;
  noAppleStorePortalInteraction: true;
  noAndroidStoreConsoleInteraction: true;
  noScreenshotGeneration: true;
  noPreviewVideoGeneration: true;
  noAssetGeneration: true;
  noCredentialAccess: true;
  noAppGeneration: true;
  noExpoEasExecution: true;
  noPackageChanges: true;
  noProviderExecution: true;
  noDbSqlMutation: true;
  noDashboardMutation: true;
  noSecretsEnvNetwork: true;
  noCiActivation: true;
  noMemoryPersistence: true;
  noGitAutomationFromSource: true;
}

export interface StoreMetadataModel {
  storeMetadataId: string;
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  appName: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  keywords: readonly string[];
  category: StoreReadinessCategory;
  targetAudience: readonly string[];
  valueProposition: string;
  screenshotsPosture: string;
  previewVideoPosture: string;
  iconPosture: string;
  supportUrlPosture: string;
  marketingUrlPosture: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  safetyBoundaries: Pick<
    StoreReadinessSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noStoreSubmission" | "noAssetGeneration"
  >;
}

export interface StorePrivacyRatingModel {
  privacyRatingId: string;
  dataCollectionCategories: readonly string[];
  sensitiveDataCategories: readonly string[];
  analyticsDisclosure: string;
  crashDisclosure: string;
  trackingDisclosure: string;
  permissionsDisclosure: string;
  ageRatingPosture: string;
  contentRatingPosture: string;
  complianceNotes: readonly string[];
  humanReviewRequired: boolean;
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    StoreReadinessSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noStoreSubmission" | "noCredentialAccess"
  >;
}

export interface StoreReadinessChecklistItem {
  checklistItemId: string;
  category: StoreReadinessCategory;
  title: string;
  requiredEvidence: readonly string[];
  blockingSeverity: StoreReadinessBlockingSeverity;
  relatedSecurityChecks: readonly string[];
  relatedAnalyticsChecks: readonly string[];
  relatedReleaseChecks: readonly string[];
  humanApprovalRequired: boolean;
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    StoreReadinessSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noStoreSubmission" | "noProviderExecution"
  >;
}

export interface StoreReadinessAppMetadata {
  readinessId: string;
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  storeMetadata: StoreMetadataModel;
  privacyRating: StorePrivacyRatingModel;
  readinessChecklist: readonly StoreReadinessChecklistItem[];
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  recommendation: StoreReadinessRecommendation;
  summary: StoreReadinessSummary;
  consumedMobileMetadata: readonly string[];
  pmSolidAutopilotIntegration: readonly string[];
  conversationalBuildLoopReadiness: readonly string[];
  safetyBoundaries: StoreReadinessSafetyBoundaries;
}

export interface StoreReadinessInput {
  readinessId?: string;
  appType?: MobileAppFactoryAppType | "unknown_mobile_app";
  storeMetadata?: StoreMetadataModel;
  privacyRating?: StorePrivacyRatingModel;
  readinessChecklist?: readonly StoreReadinessChecklistItem[];
  riskLevel?: PMRiskTier;
  requiredApprovals?: readonly string[];
  limitations?: readonly string[];
  consumedMobileMetadata?: readonly string[];
  pmSolidAutopilotIntegration?: readonly string[];
  conversationalBuildLoopReadiness?: readonly string[];
}

export interface StoreReadinessRecommendation {
  recommendationId: string;
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  postureSummary: string;
  listingPosture: string;
  privacyRatingPosture: string;
  readinessGatePosture: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<
    StoreReadinessSafetyBoundaries,
    "advisoryOnly" | "metadataOnly" | "noStoreSubmission" | "noAssetGeneration" | "noCredentialAccess"
  >;
}

export interface StoreReadinessSummary {
  readinessId: string;
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  checklistItemCount: number;
  blockingItemCount: number;
  humanApprovalItemCount: number;
  categories: readonly StoreReadinessCategory[];
  highestRiskLevel: PMRiskTier;
  requiredApprovalCount: number;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: StoreReadinessSafetyBoundaries;
}

export const storeReadinessCategories: readonly StoreReadinessCategory[] = [
  "app_identity",
  "description_copy",
  "keywords_search",
  "screenshots_preview",
  "icon_brand",
  "privacy_labels",
  "permissions_disclosure",
  "age_content_rating",
  "analytics_crash_disclosure",
  "support_contact",
  "release_notes",
  "compliance_review",
  "human_approval",
];

const safetyBoundaries = (): StoreReadinessSafetyBoundaries => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noStoreSubmission: true,
  noAppleStorePortalInteraction: true,
  noAndroidStoreConsoleInteraction: true,
  noScreenshotGeneration: true,
  noPreviewVideoGeneration: true,
  noAssetGeneration: true,
  noCredentialAccess: true,
  noAppGeneration: true,
  noExpoEasExecution: true,
  noPackageChanges: true,
  noProviderExecution: true,
  noDbSqlMutation: true,
  noDashboardMutation: true,
  noSecretsEnvNetwork: true,
  noCiActivation: true,
  noMemoryPersistence: true,
  noGitAutomationFromSource: true,
});

const metadataSafety = (): StoreMetadataModel["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noStoreSubmission: true,
  noAssetGeneration: true,
});

const privacySafety = (): StorePrivacyRatingModel["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noStoreSubmission: true,
  noCredentialAccess: true,
});

const checklistSafety = (): StoreReadinessChecklistItem["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noStoreSubmission: true,
  noProviderExecution: true,
});

const recommendationSafety = (): StoreReadinessRecommendation["safetyBoundaries"] => ({
  advisoryOnly: true,
  metadataOnly: true,
  noStoreSubmission: true,
  noAssetGeneration: true,
  noCredentialAccess: true,
});

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const uniqueCategories = (values: readonly StoreReadinessCategory[]): StoreReadinessCategory[] =>
  storeReadinessCategories.filter((category) => values.includes(category));

const riskRank: Record<PMRiskTier, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const highestRisk = (risks: readonly PMRiskTier[]): PMRiskTier => {
  const sorted = [...risks].sort((left, right) => riskRank[right] - riskRank[left]);
  return sorted[0] ?? "low";
};

const defaultStoreMetadata = (
  appType: MobileAppFactoryAppType | "unknown_mobile_app",
  riskLevel: PMRiskTier,
): StoreMetadataModel =>
  createStoreMetadataModel({
    storeMetadataId: "store_metadata:default",
    appType,
    appName: "Future app name review required",
    subtitle: "Future subtitle review required",
    shortDescription: "Future short description review required.",
    fullDescription: "Future full description must be drafted from approved product, privacy, and release metadata.",
    keywords: ["future_search_terms", "product_category_review", "audience_review"],
    category: "app_identity",
    targetAudience: ["target_users_from_mobile_app_factory"],
    valueProposition: "Value proposition must be confirmed from product and feature blueprint metadata.",
    screenshotsPosture: "Screenshot story coverage is planned only; no media is produced.",
    previewVideoPosture: "Preview media posture is planned only; no media is produced.",
    iconPosture: "Icon and brand posture require design review before any asset work.",
    supportUrlPosture: "Support URL posture requires human review before external metadata exists.",
    marketingUrlPosture: "Marketing URL posture requires human review before external metadata exists.",
    riskLevel,
    requiredApprovals: ["product_copy_review", "release_review"],
    limitations: ["metadata_only_store_listing_posture", "no_publication_behavior"],
  });

const defaultPrivacyRating = (riskLevel: PMRiskTier): StorePrivacyRatingModel =>
  createStorePrivacyRatingModel({
    privacyRatingId: "store_privacy_rating:default",
    dataCollectionCategories: ["analytics_future", "crash_error_future", "permissions_future"],
    sensitiveDataCategories: ["sensitive_data_blocked_until_review"],
    analyticsDisclosure: "Analytics disclosure must follow Mobile Analytics / Crash Strategy review.",
    crashDisclosure: "Crash/error disclosure must follow redaction and release monitoring review.",
    trackingDisclosure: "Tracking posture remains blocked until privacy and legal review.",
    permissionsDisclosure: "Permission disclosure must match security and notification consent posture.",
    ageRatingPosture: "Age rating requires human review when safety, marketplace, messaging, or monetization signals exist.",
    contentRatingPosture: "Content rating requires human review before release readiness.",
    complianceNotes: ["privacy_review_required", "legal_review_required", "release_review_required"],
    humanReviewRequired: true,
    riskLevel: highestRisk([riskLevel, "high"]),
  });

const defaultChecklist = (riskLevel: PMRiskTier): readonly StoreReadinessChecklistItem[] => [
  createStoreReadinessChecklistItem({
    checklistItemId: "store_readiness_checklist:app_identity",
    category: "app_identity",
    title: "App identity review",
    requiredEvidence: ["approved_app_name", "approved_subtitle", "target_audience_review"],
    blockingSeverity: "blocking",
    relatedSecurityChecks: [],
    relatedAnalyticsChecks: [],
    relatedReleaseChecks: ["release_target_review"],
    humanApprovalRequired: true,
    riskLevel,
  }),
  createStoreReadinessChecklistItem({
    checklistItemId: "store_readiness_checklist:privacy_labels",
    category: "privacy_labels",
    title: "Privacy label review",
    requiredEvidence: ["data_collection_review", "permission_disclosure_review", "redaction_review"],
    blockingSeverity: "critical_blocking",
    relatedSecurityChecks: ["data_sensitivity_review", "permissions_privacy_review"],
    relatedAnalyticsChecks: ["analytics_disclosure_review", "crash_disclosure_review"],
    relatedReleaseChecks: ["release_gate_privacy_review"],
    humanApprovalRequired: true,
    riskLevel: highestRisk([riskLevel, "high"]),
  }),
  createStoreReadinessChecklistItem({
    checklistItemId: "store_readiness_checklist:screenshots_preview",
    category: "screenshots_preview",
    title: "Screenshot and preview story review",
    requiredEvidence: ["screen_blueprint_review", "accessibility_review", "device_class_review"],
    blockingSeverity: "warning",
    relatedSecurityChecks: ["sensitive_screen_review"],
    relatedAnalyticsChecks: [],
    relatedReleaseChecks: ["release_visual_readiness_review"],
    humanApprovalRequired: true,
    riskLevel,
  }),
  createStoreReadinessChecklistItem({
    checklistItemId: "store_readiness_checklist:release_notes",
    category: "release_notes",
    title: "Release notes review",
    requiredEvidence: ["release_notes_draft", "testing_summary", "known_limitations_review"],
    blockingSeverity: "blocking",
    relatedSecurityChecks: ["security_release_notes_review"],
    relatedAnalyticsChecks: ["release_monitoring_disclosure_review"],
    relatedReleaseChecks: ["versioning_policy_review", "rollout_policy_review"],
    humanApprovalRequired: true,
    riskLevel,
  }),
];

export const createStoreMetadataModel = (
  input: Omit<StoreMetadataModel, "safetyBoundaries"> & {
    safetyBoundaries?: StoreMetadataModel["safetyBoundaries"];
  },
): StoreMetadataModel => ({
  storeMetadataId: input.storeMetadataId,
  appType: input.appType,
  appName: input.appName,
  subtitle: input.subtitle,
  shortDescription: input.shortDescription,
  fullDescription: input.fullDescription,
  keywords: uniqueStrings(input.keywords),
  category: input.category,
  targetAudience: uniqueStrings(input.targetAudience),
  valueProposition: input.valueProposition,
  screenshotsPosture: input.screenshotsPosture,
  previewVideoPosture: input.previewVideoPosture,
  iconPosture: input.iconPosture,
  supportUrlPosture: input.supportUrlPosture,
  marketingUrlPosture: input.marketingUrlPosture,
  riskLevel: input.riskLevel,
  requiredApprovals: uniqueStrings(input.requiredApprovals),
  limitations: uniqueStrings(input.limitations),
  safetyBoundaries: input.safetyBoundaries ?? metadataSafety(),
});

export const createStorePrivacyRatingModel = (
  input: Omit<StorePrivacyRatingModel, "safetyBoundaries"> & {
    safetyBoundaries?: StorePrivacyRatingModel["safetyBoundaries"];
  },
): StorePrivacyRatingModel => ({
  privacyRatingId: input.privacyRatingId,
  dataCollectionCategories: uniqueStrings(input.dataCollectionCategories),
  sensitiveDataCategories: uniqueStrings(input.sensitiveDataCategories),
  analyticsDisclosure: input.analyticsDisclosure,
  crashDisclosure: input.crashDisclosure,
  trackingDisclosure: input.trackingDisclosure,
  permissionsDisclosure: input.permissionsDisclosure,
  ageRatingPosture: input.ageRatingPosture,
  contentRatingPosture: input.contentRatingPosture,
  complianceNotes: uniqueStrings(input.complianceNotes),
  humanReviewRequired: input.humanReviewRequired,
  riskLevel: input.riskLevel,
  safetyBoundaries: input.safetyBoundaries ?? privacySafety(),
});

export const createStoreReadinessChecklistItem = (
  input: Omit<StoreReadinessChecklistItem, "safetyBoundaries"> & {
    safetyBoundaries?: StoreReadinessChecklistItem["safetyBoundaries"];
  },
): StoreReadinessChecklistItem => ({
  checklistItemId: input.checklistItemId,
  category: input.category,
  title: input.title,
  requiredEvidence: uniqueStrings(input.requiredEvidence),
  blockingSeverity: input.blockingSeverity,
  relatedSecurityChecks: uniqueStrings(input.relatedSecurityChecks),
  relatedAnalyticsChecks: uniqueStrings(input.relatedAnalyticsChecks),
  relatedReleaseChecks: uniqueStrings(input.relatedReleaseChecks),
  humanApprovalRequired: input.humanApprovalRequired,
  riskLevel: input.riskLevel,
  safetyBoundaries: input.safetyBoundaries ?? checklistSafety(),
});

export const recommendStoreReadiness = (
  readiness: Pick<
    StoreReadinessAppMetadata,
    "readinessId" | "appType" | "storeMetadata" | "privacyRating" | "readinessChecklist" | "riskLevel" | "requiredApprovals"
  >,
): StoreReadinessRecommendation => ({
  recommendationId: `${readiness.readinessId}:recommendation`,
  appType: readiness.appType,
  postureSummary:
    "Use store readiness metadata for listing, privacy, rating, release, testing, and compliance review before publication.",
  listingPosture: readiness.storeMetadata.shortDescription,
  privacyRatingPosture: readiness.privacyRating.humanReviewRequired
    ? "Privacy/rating posture requires human review."
    : "Privacy/rating posture has no blocking human review marker.",
  readinessGatePosture: `${readiness.readinessChecklist.length} advisory checklist item(s) can feed release gates.`,
  riskLevel: readiness.riskLevel,
  requiredApprovals: [...readiness.requiredApprovals],
  recommendedNextStep: {
    nextStepId: "store_readiness_next_step:140B",
    title: "Plan Mobile Factory Review / First Dry-Run",
    safeSummary:
      "Continue with Phase 140B to plan a first mobile factory dry-run without stores, assets, apps, or runtime behavior.",
    priority: readiness.riskLevel,
    decisionMode: "plan_only",
    riskSurfaces: ["store", "release", "security_policy", "provider", "unknown"],
    recommendationOnly: true,
    noExecution: true,
  },
  safetyBoundaries: recommendationSafety(),
});

export const summarizeStoreReadiness = (
  readiness: Pick<
    StoreReadinessAppMetadata,
    "readinessId" | "appType" | "readinessChecklist" | "requiredApprovals" | "riskLevel" | "safetyBoundaries"
  >,
): StoreReadinessSummary => ({
  readinessId: readiness.readinessId,
  appType: readiness.appType,
  checklistItemCount: readiness.readinessChecklist.length,
  blockingItemCount: readiness.readinessChecklist.filter(
    (item) => item.blockingSeverity === "blocking" || item.blockingSeverity === "critical_blocking",
  ).length,
  humanApprovalItemCount: readiness.readinessChecklist.filter((item) => item.humanApprovalRequired).length,
  categories: uniqueCategories(readiness.readinessChecklist.map((item) => item.category)),
  highestRiskLevel: readiness.riskLevel,
  requiredApprovalCount: readiness.requiredApprovals.length,
  recommendedNextPhase: "Phase 140B",
  safeSummary: `${readiness.readinessChecklist.length} store readiness checklist item(s) prepared for future review.`,
  safetyBoundaries: readiness.safetyBoundaries,
});

export const createStoreReadinessAppMetadata = (
  input: StoreReadinessInput = {},
): StoreReadinessAppMetadata => {
  const riskLevel = input.riskLevel ?? "medium";
  const appType = input.appType ?? input.storeMetadata?.appType ?? "unknown_mobile_app";
  const storeMetadata = input.storeMetadata ?? defaultStoreMetadata(appType, riskLevel);
  const privacyRating = input.privacyRating ?? defaultPrivacyRating(riskLevel);
  const readinessChecklist = input.readinessChecklist ?? defaultChecklist(riskLevel);
  const readinessRisk = highestRisk([
    riskLevel,
    storeMetadata.riskLevel,
    privacyRating.riskLevel,
    ...readinessChecklist.map((item) => item.riskLevel),
  ]);
  const requiredApprovals = uniqueStrings([
    ...(input.requiredApprovals ?? []),
    ...storeMetadata.requiredApprovals,
    ...(privacyRating.humanReviewRequired ? ["privacy_rating_review"] : []),
    ...readinessChecklist.filter((item) => item.humanApprovalRequired).map((item) => `${item.category}_review`),
  ]);
  const baseReadiness = {
    readinessId: input.readinessId ?? "store_readiness_app_metadata:default",
    appType,
    storeMetadata,
    privacyRating,
    readinessChecklist: [...readinessChecklist],
    riskLevel: readinessRisk,
    requiredApprovals,
    limitations: uniqueStrings([
      ...(input.limitations ?? []),
      "metadata_only_store_readiness",
      "no_store_asset_or_publication_behavior",
    ]),
    consumedMobileMetadata: uniqueStrings(
      input.consumedMobileMetadata ?? [
        "mobile_app_factory_strategy",
        "mobile_release_eas_strategy",
        "mobile_security_baseline",
        "mobile_analytics_crash_strategy",
        "mobile_testing_strategy",
        "mobile_performance_checklist",
        "mobile_push_notification_strategy",
      ],
    ),
    pmSolidAutopilotIntegration: uniqueStrings(
      input.pmSolidAutopilotIntegration ?? [
        "pm_report_store_readiness_gaps",
        "dod_store_listing_privacy_rating_review",
        "risk_blocker_privacy_content_rating_release_review",
        "solid_boundary_between_metadata_and_publication",
        "autopilot_dry_run_handoff_context_only",
      ],
    ),
    conversationalBuildLoopReadiness: uniqueStrings(
      input.conversationalBuildLoopReadiness ?? [
        "idea_intake_to_requirements",
        "feature_screen_blueprints_to_release_strategy",
        "release_strategy_to_store_metadata",
        "store_metadata_to_future_publication_checklist",
        "future_codex_handoff_prompt_context_only",
      ],
    ),
    safetyBoundaries: safetyBoundaries(),
  };
  const recommendation = recommendStoreReadiness(baseReadiness);
  const summary = summarizeStoreReadiness(baseReadiness);

  return {
    ...baseReadiness,
    recommendation,
    summary,
  };
};

export const selectStoreChecklistItemsByCategory = (
  items: readonly StoreReadinessChecklistItem[],
  category: StoreReadinessCategory,
): readonly StoreReadinessChecklistItem[] => items.filter((item) => item.category === category);

export const selectStoreMetadataByAppType = (
  metadataItems: readonly StoreMetadataModel[],
  appType: MobileAppFactoryAppType | "unknown_mobile_app",
): readonly StoreMetadataModel[] =>
  metadataItems.filter((metadata) => metadata.appType === appType || metadata.appType === "unknown_mobile_app");
