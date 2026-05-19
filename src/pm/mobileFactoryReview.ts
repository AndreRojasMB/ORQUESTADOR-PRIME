import type { PMRecommendedNextStep, PMRiskSurface, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type MobileFactoryReadinessStatus = "ready_for_metadata_dry_run" | "ready_with_gaps" | "blocked";

export type MobileFactoryCapabilityStatus =
  | "complete"
  | "complete_with_limitations"
  | "missing"
  | "deferred_runtime"
  | "blocked";

export type MobileFactoryGapSeverity = "info" | "warning" | "blocking" | "critical_blocking";

export interface MobileFactoryReviewSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noDryRunRuntime: true;
  noAppGeneration: true;
  noScreenGeneration: true;
  noComponentGeneration: true;
  noRouteGeneration: true;
  noBackendGeneration: true;
  noEndpointGeneration: true;
  noCodexRun: true;
  noExpoEasExecution: true;
  noStoreInteraction: true;
  noProviderExecution: true;
  noSecretMaterial: true;
  noNetworkApiCalls: true;
  noDbSqlMutation: true;
  noDashboardMutation: true;
  noCiActivation: true;
  noMemoryPersistence: true;
  noGitAutomationFromSource: true;
}

export interface MobileFactoryCapabilityReview {
  capabilityId: string;
  phaseRef: ProjectPhaseRef;
  moduleRef: string;
  title: string;
  status: MobileFactoryCapabilityStatus;
  evidenceRefs: readonly string[];
  riskLevel: PMRiskTier;
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobileFactoryReviewSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noDryRunRuntime"
  >;
}

export interface MobileFactoryGap {
  gapId: string;
  title: string;
  severity: MobileFactoryGapSeverity;
  description: string;
  impactedModules: readonly string[];
  requiredBefore: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobileFactoryReviewSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noAppGeneration" | "noCodexRun"
  >;
}

export interface MobileFactoryDeferredRuntimeItem {
  itemId: string;
  title: string;
  description: string;
  deferredUntilPhase: string;
  reason: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  safetyBoundaries: Pick<
    MobileFactoryReviewSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noProviderExecution" | "noNetworkApiCalls"
  >;
}

export interface MobileFactoryReadiness {
  reviewId: string;
  coveredPhases: readonly ProjectPhaseRef[];
  coveredModules: readonly string[];
  readinessStatus: MobileFactoryReadinessStatus;
  completedCapabilities: readonly string[];
  missingCapabilities: readonly string[];
  knownLimitations: readonly string[];
  deferredRuntimeItems: readonly MobileFactoryDeferredRuntimeItem[];
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: string;
}

export interface MobileFactoryReviewInput {
  reviewId?: string;
  coveredPhases?: readonly ProjectPhaseRef[];
  coveredModules?: readonly string[];
  capabilityStatuses?: readonly MobileFactoryCapabilityReview[];
  gaps?: readonly MobileFactoryGap[];
  deferredRuntimeItems?: readonly MobileFactoryDeferredRuntimeItem[];
  knownLimitations?: readonly string[];
  riskLevel?: PMRiskTier;
  requiredApprovals?: readonly string[];
  recommendedNextStep?: string;
}

export interface MobileFactoryReviewRecommendation {
  recommendationId: string;
  reviewId: string;
  readinessStatus: MobileFactoryReadinessStatus;
  postureSummary: string;
  gapSummary: string;
  nextStep: PMRecommendedNextStep;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  safetyBoundaries: Pick<
    MobileFactoryReviewSafetyBoundaries,
    "advisoryOnly" | "metadataOnly" | "noDryRunRuntime" | "noCodexRun" | "noAppGeneration"
  >;
}

export interface MobileFactoryReviewSummary {
  reviewId: string;
  readinessStatus: MobileFactoryReadinessStatus;
  coveredPhaseCount: number;
  coveredModuleCount: number;
  completedCapabilityCount: number;
  missingCapabilityCount: number;
  gapCount: number;
  blockingGapCount: number;
  deferredRuntimeItemCount: number;
  highestRiskLevel: PMRiskTier;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: MobileFactoryReviewSafetyBoundaries;
}

export interface MobileFactoryReview {
  reviewId: string;
  readiness: MobileFactoryReadiness;
  capabilityStatuses: readonly MobileFactoryCapabilityReview[];
  gaps: readonly MobileFactoryGap[];
  deferredRuntimeItems: readonly MobileFactoryDeferredRuntimeItem[];
  recommendation: MobileFactoryReviewRecommendation;
  summary: MobileFactoryReviewSummary;
  safetyBoundaries: MobileFactoryReviewSafetyBoundaries;
}

const coveredPhases: readonly ProjectPhaseRef[] = [
  "121",
  "122",
  "123",
  "124",
  "125",
  "126",
  "127",
  "128",
  "129",
  "130",
  "131",
  "132",
  "133",
  "134",
  "135",
  "136",
  "137",
  "138",
  "139",
];

const coveredModules: readonly string[] = [
  "mobileAppFactoryStrategy",
  "mobileArchitectureProfile",
  "mobileUxPatternCatalog",
  "mobileNavigationFlowModel",
  "mobileStateManagementStrategy",
  "offlineCacheSyncStrategy",
  "mobileSecurityBaseline",
  "mobilePerformanceChecklist",
  "mobileTestingStrategy",
  "mobileReleaseStrategy",
  "appIdeaIntakeInterview",
  "mobileRequirementsInterview",
  "mobileFeatureBlueprintGenerator",
  "mobileScreenBlueprintGenerator",
  "mobileApiContractPlanner",
  "mobileDesignSystemBlueprint",
  "mobilePushNotificationStrategy",
  "mobileAnalyticsCrashStrategy",
  "storeReadinessAppMetadata",
];

const safetyBoundaries = (): MobileFactoryReviewSafetyBoundaries => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noDryRunRuntime: true,
  noAppGeneration: true,
  noScreenGeneration: true,
  noComponentGeneration: true,
  noRouteGeneration: true,
  noBackendGeneration: true,
  noEndpointGeneration: true,
  noCodexRun: true,
  noExpoEasExecution: true,
  noStoreInteraction: true,
  noProviderExecution: true,
  noSecretMaterial: true,
  noNetworkApiCalls: true,
  noDbSqlMutation: true,
  noDashboardMutation: true,
  noCiActivation: true,
  noMemoryPersistence: true,
  noGitAutomationFromSource: true,
});

const capabilitySafety = (): MobileFactoryCapabilityReview["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noDryRunRuntime: true,
});

const gapSafety = (): MobileFactoryGap["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noAppGeneration: true,
  noCodexRun: true,
});

const deferredSafety = (): MobileFactoryDeferredRuntimeItem["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noProviderExecution: true,
  noNetworkApiCalls: true,
});

const recommendationSafety = (): MobileFactoryReviewRecommendation["safetyBoundaries"] => ({
  advisoryOnly: true,
  metadataOnly: true,
  noDryRunRuntime: true,
  noCodexRun: true,
  noAppGeneration: true,
});

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

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

const blockingSeverities: readonly MobileFactoryGapSeverity[] = ["blocking", "critical_blocking"];

const defaultCapabilityStatuses = (): readonly MobileFactoryCapabilityReview[] =>
  coveredModules.map((moduleRef, index) => ({
    capabilityId: `mobile_factory_capability:${moduleRef}`,
    phaseRef: coveredPhases[index] ?? "unknown",
    moduleRef,
    title: `${moduleRef} advisory metadata`,
    status: "complete",
    evidenceRefs: [`src/pm/${moduleRef}.ts`, `docs/${moduleRef}`],
    riskLevel: "low",
    limitations: ["source_only_review_evidence", "runtime_not_verified"],
    safetyBoundaries: capabilitySafety(),
  }));

const defaultGaps = (): readonly MobileFactoryGap[] => [
  {
    gapId: "mobile_factory_gap:build_prompt_composer",
    title: "Mobile build prompt composer is not implemented",
    severity: "warning",
    description: "The block can draft passive prompt metadata, but it does not yet compose an approved mobile build prompt for use.",
    impactedModules: ["mobileFactoryDryRun", "autopilot_handoff"],
    requiredBefore: "any future approved build handoff",
    riskLevel: "medium",
    requiredApprovals: ["pm_scope_review", "architecture_review"],
    limitations: ["metadata_only_prompt_draft", "no_handoff_runtime"],
    safetyBoundaries: gapSafety(),
  },
  {
    gapId: "mobile_factory_gap:implementation_runner",
    title: "No file-writing implementation runner exists",
    severity: "warning",
    description: "Future project artifact creation remains outside the Mobile Factory metadata block.",
    impactedModules: ["screen_blueprints", "api_contracts", "design_system"],
    requiredBefore: "any future implementation pilot",
    riskLevel: "medium",
    requiredApprovals: ["human_approval", "safe_execution_review"],
    limitations: ["no_project_file_creation", "no_runtime_runner"],
    safetyBoundaries: gapSafety(),
  },
  {
    gapId: "mobile_factory_gap:approval_ui_dashboard",
    title: "No approval UI or dashboard review surface exists",
    severity: "info",
    description: "Human review can be represented as metadata, but there is no mobile factory dashboard surface yet.",
    impactedModules: ["pm_reports", "autopilot_handoff"],
    requiredBefore: "operator-facing review workflow",
    riskLevel: "low",
    requiredApprovals: ["pm_review"],
    limitations: ["no_dashboard_surface", "review_metadata_only"],
    safetyBoundaries: gapSafety(),
  },
];

const defaultDeferredRuntimeItems = (): readonly MobileFactoryDeferredRuntimeItem[] => [
  {
    itemId: "mobile_factory_deferred:mobile_project_files",
    title: "Mobile project artifact creation",
    description: "Creating app files, routes, screens, components, and native config remains deferred.",
    deferredUntilPhase: "future approved implementation pilot",
    reason: "Phase 140I validates metadata chain only.",
    riskLevel: "high",
    requiredApprovals: ["human_approval", "architecture_review"],
    safetyBoundaries: deferredSafety(),
  },
  {
    itemId: "mobile_factory_deferred:backend_runtime",
    title: "Backend and endpoint runtime",
    description: "API contract candidates remain labels and do not create backend behavior.",
    deferredUntilPhase: "future backend planning and implementation phase",
    reason: "API posture must stay decoupled from runtime behavior.",
    riskLevel: "high",
    requiredApprovals: ["backend_architecture_review", "security_review"],
    safetyBoundaries: deferredSafety(),
  },
  {
    itemId: "mobile_factory_deferred:provider_store_release",
    title: "Provider, release, and store interactions",
    description: "External provider, mobile release, and store behavior remains deferred to separately approved phases.",
    deferredUntilPhase: "future release/provider/store phase",
    reason: "External side effects require explicit human approval and separate controls.",
    riskLevel: "critical",
    requiredApprovals: ["security_review", "release_review", "human_approval"],
    safetyBoundaries: deferredSafety(),
  },
];

const completedCapabilitiesFrom = (statuses: readonly MobileFactoryCapabilityReview[]): string[] =>
  statuses
    .filter((status) => status.status === "complete" || status.status === "complete_with_limitations")
    .map((status) => status.moduleRef);

const missingCapabilitiesFrom = (
  statuses: readonly MobileFactoryCapabilityReview[],
  gaps: readonly MobileFactoryGap[],
): string[] => [
  ...statuses.filter((status) => status.status === "missing" || status.status === "blocked").map((status) => status.moduleRef),
  ...gaps.filter((gap) => blockingSeverities.includes(gap.severity)).map((gap) => gap.title),
];

const readinessStatusFrom = (
  statuses: readonly MobileFactoryCapabilityReview[],
  gaps: readonly MobileFactoryGap[],
): MobileFactoryReadinessStatus => {
  if (statuses.some((status) => status.status === "blocked") || gaps.some((gap) => gap.severity === "critical_blocking")) {
    return "blocked";
  }

  if (statuses.some((status) => status.status !== "complete") || gaps.length > 0) {
    return "ready_with_gaps";
  }

  return "ready_for_metadata_dry_run";
};

const defaultKnownLimitations = (): readonly string[] => [
  "review_uses_static_metadata_only",
  "no_runtime_validation",
  "no_mobile_target_exists",
  "prompt_draft_cannot_start_work",
  "external_side_effects_deferred",
];

export const buildMobileFactoryReadiness = (input: MobileFactoryReviewInput = {}): MobileFactoryReadiness => {
  const capabilityStatuses = input.capabilityStatuses ?? defaultCapabilityStatuses();
  const gaps = input.gaps ?? defaultGaps();
  const deferredRuntimeItems = input.deferredRuntimeItems ?? defaultDeferredRuntimeItems();
  const riskLevel = input.riskLevel ?? highestRisk([...capabilityStatuses.map((item) => item.riskLevel), ...gaps.map((gap) => gap.riskLevel)]);
  const completedCapabilities = completedCapabilitiesFrom(capabilityStatuses);
  const missingCapabilities = missingCapabilitiesFrom(capabilityStatuses, gaps);

  return {
    reviewId: input.reviewId ?? "mobile_factory_review:121_139",
    coveredPhases: input.coveredPhases ?? coveredPhases,
    coveredModules: input.coveredModules ?? coveredModules,
    readinessStatus: readinessStatusFrom(capabilityStatuses, gaps),
    completedCapabilities,
    missingCapabilities,
    knownLimitations: uniqueStrings(input.knownLimitations ?? defaultKnownLimitations()),
    deferredRuntimeItems,
    riskLevel,
    requiredApprovals: uniqueStrings([
      ...(input.requiredApprovals ?? []),
      ...gaps.flatMap((gap) => gap.requiredApprovals),
      ...deferredRuntimeItems.flatMap((item) => item.requiredApprovals),
    ]),
    recommendedNextStep: input.recommendedNextStep ?? "Phase 140I can close with metadata dry-run evidence and then recommend PILOT-3B.",
  };
};

export const selectMobileFactoryGapsBySeverity = (
  gaps: readonly MobileFactoryGap[],
  severity: MobileFactoryGapSeverity,
): readonly MobileFactoryGap[] => gaps.filter((gap) => gap.severity === severity);

export const recommendMobileFactoryNextStep = (
  review: Pick<MobileFactoryReview, "reviewId" | "readiness" | "gaps">,
): MobileFactoryReviewRecommendation => {
  const readinessStatus = review.readiness.readinessStatus;
  const nextPhase = readinessStatus === "blocked" ? "Phase 141B" : "Phase PILOT-3B";
  const riskSurfaces: PMRiskSurface[] = readinessStatus === "blocked" ? ["automation", "runtime"] : ["automation"];

  return {
    recommendationId: `mobile_factory_review_recommendation:${review.reviewId}`,
    reviewId: review.reviewId,
    readinessStatus,
    postureSummary:
      readinessStatus === "blocked"
        ? "Mobile Factory review is blocked for dry-run continuation until critical gaps are resolved."
        : "Mobile Factory review is ready to continue as passive metadata with explicit gaps.",
    gapSummary: `${review.gaps.length} gap(s) remain tracked as advisory metadata.`,
    nextStep: {
      nextStepId: `mobile_factory_next_step:${review.reviewId}`,
      title: nextPhase,
      safeSummary:
        readinessStatus === "blocked"
          ? "Continue with roadmap continuation planning before another dry-run phase."
          : "Continue with Conversational Build Loop dry-run planning after 140I closes cleanly.",
      priority: review.readiness.riskLevel,
      decisionMode: "plan_only",
      riskSurfaces,
      recommendationOnly: true,
      noExecution: true,
    },
    riskLevel: review.readiness.riskLevel,
    requiredApprovals: review.readiness.requiredApprovals,
    safetyBoundaries: recommendationSafety(),
  };
};

export const summarizeMobileFactoryReview = (
  review: Pick<
    MobileFactoryReview,
    "reviewId" | "readiness" | "capabilityStatuses" | "gaps" | "deferredRuntimeItems" | "safetyBoundaries"
  >,
): MobileFactoryReviewSummary => {
  const completedCapabilityCount = completedCapabilitiesFrom(review.capabilityStatuses).length;
  const missingCapabilityCount = missingCapabilitiesFrom(review.capabilityStatuses, review.gaps).length;
  const blockingGapCount = review.gaps.filter((gap) => blockingSeverities.includes(gap.severity)).length;
  const highestRiskLevel = highestRisk([
    review.readiness.riskLevel,
    ...review.capabilityStatuses.map((capability) => capability.riskLevel),
    ...review.gaps.map((gap) => gap.riskLevel),
    ...review.deferredRuntimeItems.map((item) => item.riskLevel),
  ]);

  return {
    reviewId: review.reviewId,
    readinessStatus: review.readiness.readinessStatus,
    coveredPhaseCount: review.readiness.coveredPhases.length,
    coveredModuleCount: review.readiness.coveredModules.length,
    completedCapabilityCount,
    missingCapabilityCount,
    gapCount: review.gaps.length,
    blockingGapCount,
    deferredRuntimeItemCount: review.deferredRuntimeItems.length,
    highestRiskLevel,
    recommendedNextPhase: review.readiness.readinessStatus === "blocked" ? "Phase 141B" : "Phase PILOT-3B",
    safeSummary: `Mobile Factory review covers ${review.readiness.coveredModules.length} module(s) with ${review.gaps.length} advisory gap(s).`,
    safetyBoundaries: review.safetyBoundaries,
  };
};

export const createMobileFactoryReview = (input: MobileFactoryReviewInput = {}): MobileFactoryReview => {
  const capabilityStatuses = input.capabilityStatuses ?? defaultCapabilityStatuses();
  const gaps = input.gaps ?? defaultGaps();
  const deferredRuntimeItems = input.deferredRuntimeItems ?? defaultDeferredRuntimeItems();
  const readiness = buildMobileFactoryReadiness({
    ...input,
    capabilityStatuses,
    gaps,
    deferredRuntimeItems,
  });
  const reviewId = readiness.reviewId;
  const boundaries = safetyBoundaries();
  const partial = {
    reviewId,
    readiness,
    capabilityStatuses,
    gaps,
    deferredRuntimeItems,
    safetyBoundaries: boundaries,
  };
  const recommendation = recommendMobileFactoryNextStep(partial);
  const summary = summarizeMobileFactoryReview(partial);

  return {
    ...partial,
    recommendation,
    summary,
  };
};
