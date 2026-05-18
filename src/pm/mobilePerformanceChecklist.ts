import type {
  MobileAppFactoryAppType,
  MobileAppFactoryIntake,
  MobileAppFactoryStrategy,
  MobileReleaseTarget,
} from "./mobileAppFactoryStrategy.js";
import type {
  MobileArchitectureLayerId,
  MobileArchitectureProfile,
} from "./mobileArchitectureProfile.js";
import type { MobileNavigationFlowModel } from "./mobileNavigationFlowModel.js";
import type { MobileSecurityBaseline } from "./mobileSecurityBaseline.js";
import type { MobileStateManagementStrategy } from "./mobileStateManagementStrategy.js";
import type { MobileUxPatternCatalog } from "./mobileUxPatternCatalog.js";
import type { OfflineCacheSyncStrategy } from "./offlineCacheSyncStrategy.js";
import type { PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type MobilePerformanceCategory =
  | "startup"
  | "initial_render"
  | "navigation_transition"
  | "list_rendering"
  | "image_media"
  | "animation"
  | "state_updates"
  | "offline_cache_sync"
  | "network_latency"
  | "memory_usage"
  | "bundle_size"
  | "low_end_device"
  | "battery_impact"
  | "profiling_future";

export type MobilePerformanceLikelihood =
  | "unlikely"
  | "possible"
  | "likely"
  | "unknown"
  | "future_profiling_required";

export type MobilePerformanceImpact = "low" | "medium" | "high" | "critical" | "unknown";

export type MobilePerformanceSeverity = "info" | "low" | "medium" | "high" | "critical";

export interface MobilePerformanceSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noProfilingExecution: true;
  noBenchmarkScripts: true;
  noRuntimeMeasurement: true;
  noRuntimeMetricCapture: true;
  noAppGeneration: true;
  noMobileToolingExecution: true;
  noExpoEasExecution: true;
  noNativeProjectCreation: true;
  noPackageChanges: true;
  noProviderCalls: true;
  noRuntimeExecution: true;
  noDashboardMutation: true;
  noDbSqlMutation: true;
  noCiActivation: true;
  noMemoryPersistence: true;
  noGitAutomationFromSource: true;
}

export interface MobilePerformanceChecklistItem {
  checklistItemId: string;
  category: MobilePerformanceCategory;
  title: string;
  question: string;
  expectedEvidence: readonly string[];
  failureSignal: string;
  severityHint: MobilePerformanceSeverity;
  relatedAppTypes: ReadonlyArray<MobileAppFactoryAppType | "any">;
  relatedArchitectureLayers: ReadonlyArray<MobileArchitectureLayerId | "any">;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobilePerformanceSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noProfilingExecution" | "noRuntimeMetricCapture"
  >;
}

export interface MobilePerformanceRisk {
  riskId: string;
  riskCategory: MobilePerformanceCategory;
  affectedFlow: string;
  affectedLayer: MobileArchitectureLayerId | "unknown";
  likelihood: MobilePerformanceLikelihood;
  impact: MobilePerformanceImpact;
  severity: MobilePerformanceSeverity;
  mitigation: string;
  requiredEvidence: readonly string[];
  profilingNeeded: boolean;
  humanReviewRequired: boolean;
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobilePerformanceSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noProfilingExecution" | "noRuntimeMetricCapture"
  >;
}

export interface MobileProfilingReadiness {
  profilingId: string;
  targetArea: MobilePerformanceCategory;
  recommendedToolingPosture: string;
  metricName: string;
  expectedSignal: string;
  riskLevel: PMRiskTier;
  requiredEvidence: readonly string[];
  futureExecutionRequired: boolean;
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobilePerformanceSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noProfilingExecution" | "noRuntimeMetricCapture"
  >;
}

export interface MobilePerformanceRecommendation {
  recommendationId: string;
  appType: MobileAppFactoryAppType;
  postureSummary: string;
  checklistPosture: string;
  profilingPosture: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<
    MobilePerformanceSafetyBoundaries,
    "advisoryOnly" | "metadataOnly" | "noProfilingExecution" | "noAppGeneration" | "noRuntimeMetricCapture"
  >;
}

export interface MobilePerformanceSummary {
  checklistId: string;
  appType: MobileAppFactoryAppType;
  checklistItemCount: number;
  riskCount: number;
  profilingReadinessCount: number;
  categories: readonly MobilePerformanceCategory[];
  highestRiskLevel: PMRiskTier;
  criticalOrHighRiskCount: number;
  futureProfilingRequiredCount: number;
  humanReviewRequiredCount: number;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: MobilePerformanceSafetyBoundaries;
}

export interface MobilePerformanceChecklist {
  checklistId: string;
  phaseRef: ProjectPhaseRef;
  appType: MobileAppFactoryAppType;
  releaseTarget: MobileReleaseTarget | undefined;
  targetFlows: readonly string[];
  architectureLayers: ReadonlyArray<MobileArchitectureLayerId | "unknown">;
  checklistItems: readonly MobilePerformanceChecklistItem[];
  risks: readonly MobilePerformanceRisk[];
  profilingReadiness: readonly MobileProfilingReadiness[];
  recommendation: MobilePerformanceRecommendation;
  summary: MobilePerformanceSummary;
  limitations: readonly string[];
  consumedFactoryMetadata: readonly string[];
  consumedArchitectureMetadata: readonly string[];
  consumedSecurityMetadata: readonly string[];
  consumedStateOfflineMetadata: readonly string[];
  pmSolidAutopilotIntegration: readonly string[];
  conversationalBuildLoopReadiness: readonly string[];
  safetyBoundaries: MobilePerformanceSafetyBoundaries;
}

export interface MobilePerformanceChecklistInput {
  checklistId?: string;
  phaseRef?: ProjectPhaseRef;
  appType?: MobileAppFactoryAppType;
  releaseTarget?: MobileReleaseTarget | undefined;
  targetFlows?: readonly string[];
  architectureLayers?: ReadonlyArray<MobileArchitectureLayerId | "unknown">;
  checklistItems?: readonly MobilePerformanceChecklistItem[];
  risks?: readonly MobilePerformanceRisk[];
  profilingReadiness?: readonly MobileProfilingReadiness[];
  riskLevel?: PMRiskTier;
  requiredApprovals?: readonly string[];
  limitations?: readonly string[];
  factoryIntake?: MobileAppFactoryIntake;
  factoryStrategy?: MobileAppFactoryStrategy;
  architectureProfile?: MobileArchitectureProfile;
  uxPatternCatalog?: MobileUxPatternCatalog;
  navigationFlow?: MobileNavigationFlowModel;
  stateStrategy?: MobileStateManagementStrategy;
  offlineCacheSyncStrategy?: OfflineCacheSyncStrategy;
  securityBaseline?: MobileSecurityBaseline;
}

export const mobilePerformanceCategories: readonly MobilePerformanceCategory[] = [
  "startup",
  "initial_render",
  "navigation_transition",
  "list_rendering",
  "image_media",
  "animation",
  "state_updates",
  "offline_cache_sync",
  "network_latency",
  "memory_usage",
  "bundle_size",
  "low_end_device",
  "battery_impact",
  "profiling_future",
];

const safetyBoundaries: MobilePerformanceSafetyBoundaries = {
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noProfilingExecution: true,
  noBenchmarkScripts: true,
  noRuntimeMeasurement: true,
  noRuntimeMetricCapture: true,
  noAppGeneration: true,
  noMobileToolingExecution: true,
  noExpoEasExecution: true,
  noNativeProjectCreation: true,
  noPackageChanges: true,
  noProviderCalls: true,
  noRuntimeExecution: true,
  noDashboardMutation: true,
  noDbSqlMutation: true,
  noCiActivation: true,
  noMemoryPersistence: true,
  noGitAutomationFromSource: true,
};

const itemSafety = (): MobilePerformanceChecklistItem["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noProfilingExecution: true,
  noRuntimeMetricCapture: true,
});

const riskSafety = (): MobilePerformanceRisk["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noProfilingExecution: true,
  noRuntimeMetricCapture: true,
});

const readinessSafety = (): MobileProfilingReadiness["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noProfilingExecution: true,
  noRuntimeMetricCapture: true,
});

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function uniqueCategories(values: readonly MobilePerformanceCategory[]): MobilePerformanceCategory[] {
  return mobilePerformanceCategories.filter((category) => values.includes(category));
}

function uniqueLayers(values: ReadonlyArray<MobileArchitectureLayerId | "unknown">): Array<MobileArchitectureLayerId | "unknown"> {
  return [...new Set(values)];
}

function highestRisk(risks: readonly PMRiskTier[]): PMRiskTier {
  if (risks.includes("critical")) return "critical";
  if (risks.includes("high")) return "high";
  if (risks.includes("medium")) return "medium";
  return "low";
}

function riskTierFromSeverity(severity: MobilePerformanceSeverity): PMRiskTier {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function appTypeFromInput(input: MobilePerformanceChecklistInput): MobileAppFactoryAppType {
  return (
    input.appType ??
    input.factoryIntake?.supportedAppType ??
    input.factoryStrategy?.appType ??
    input.architectureProfile?.appType ??
    input.uxPatternCatalog?.appTypes[0] ??
    input.navigationFlow?.appType ??
    input.stateStrategy?.appType ??
    input.offlineCacheSyncStrategy?.appType ??
    input.securityBaseline?.appType ??
    "unknown_mobile_app"
  );
}

function releaseTargetFromInput(input: MobilePerformanceChecklistInput): MobileReleaseTarget | undefined {
  return (
    input.releaseTarget ??
    input.factoryIntake?.releaseTarget ??
    input.factoryStrategy?.intake.releaseTarget ??
    input.architectureProfile?.releaseProfile.releaseTarget ??
    input.stateStrategy?.releaseTarget ??
    input.offlineCacheSyncStrategy?.releaseTarget ??
    input.securityBaseline?.releaseTarget
  );
}

function targetFlowsFromInput(input: MobilePerformanceChecklistInput): string[] {
  return uniqueStrings([
    ...(input.targetFlows ?? []),
    ...(input.factoryIntake?.coreFlows ?? []),
    ...(input.factoryStrategy?.intake.coreFlows ?? []),
    ...(input.uxPatternCatalog?.coreFlows ?? []),
    ...(input.navigationFlow?.routes.map((route) => route.routeName) ?? []),
  ]).slice(0, 12);
}

function architectureLayersFromInput(input: MobilePerformanceChecklistInput): Array<MobileArchitectureLayerId | "unknown"> {
  return uniqueLayers([
    ...(input.architectureLayers ?? []),
    ...(input.architectureProfile?.recommendedProjectStructure.map((layer) => layer.layer) ?? []),
    ...(input.uxPatternCatalog?.architectureLayers.filter((layer): layer is MobileArchitectureLayerId =>
      [
        "app_routes",
        "screens",
        "components",
        "features",
        "domain",
        "services",
        "repositories",
        "state",
        "theme",
        "mocks",
        "tests",
        "config",
        "native_future",
        "release_future",
      ].includes(layer),
    ) ?? []),
  ]).slice(0, 14);
}

function deriveRisk(input: MobilePerformanceChecklistInput): PMRiskTier {
  const signals = [
    ...targetFlowsFromInput(input),
    ...(input.factoryIntake?.offlineNeeds ?? []),
    ...(input.factoryIntake?.monetizationNeeds ?? []),
    ...(input.factoryIntake?.safetyNeeds ?? []),
    ...(input.stateStrategy?.offlineNeeds ?? []),
    ...(input.offlineCacheSyncStrategy?.offlineNeeds ?? []),
  ].join(" ");

  return highestRisk([
    input.riskLevel ?? "low",
    input.securityBaseline?.summary.highestRiskLevel ?? "low",
    input.offlineCacheSyncStrategy?.summary.highestRiskLevel ?? "low",
    /marketplace|chat|media|dashboard|field|offline|sync|ai|assistant|booking/i.test(signals) ? "high" : "low",
    /payment|safety|abuse|critical/i.test(signals) ? "critical" : "low",
  ]);
}

function categorySetFromInput(input: MobilePerformanceChecklistInput): MobilePerformanceCategory[] {
  const signals = [
    ...targetFlowsFromInput(input),
    ...(input.factoryIntake?.offlineNeeds ?? []),
    ...(input.factoryIntake?.authNeeds ?? []),
    ...(input.factoryIntake?.monetizationNeeds ?? []),
  ].join(" ");
  const categories: MobilePerformanceCategory[] = [
    "startup",
    "initial_render",
    "navigation_transition",
    "state_updates",
    "memory_usage",
    "bundle_size",
    "low_end_device",
    "profiling_future",
  ];

  if (/list|feed|marketplace|dashboard|catalog|chat/i.test(signals)) categories.push("list_rendering");
  if (/image|media|photo|video|avatar/i.test(signals)) categories.push("image_media");
  if (/animation|game|gamified|progress|gesture/i.test(signals)) categories.push("animation");
  if (/offline|sync|cache|queue|retry/i.test(signals)) categories.push("offline_cache_sync");
  if (/api|remote|provider|booking|marketplace/i.test(signals)) categories.push("network_latency");
  if (/field|battery|background|location/i.test(signals)) categories.push("battery_impact");

  return uniqueCategories(categories);
}

function approvalDefaults(input: MobilePerformanceChecklistInput, riskLevel: PMRiskTier): string[] {
  return uniqueStrings([
    ...(input.requiredApprovals ?? []),
    ...(riskLevel === "high" || riskLevel === "critical" ? ["mobile_performance_human_review"] : []),
    ...(input.securityBaseline?.summary.highestRiskLevel === "critical" ? ["security_performance_review"] : []),
    ...(input.offlineCacheSyncStrategy?.summary.offlineWritableCount ? ["offline_performance_review"] : []),
  ]);
}

function categoriesFromChecklist(
  items: readonly MobilePerformanceChecklistItem[],
  risks: readonly MobilePerformanceRisk[],
  readiness: readonly MobileProfilingReadiness[],
): MobilePerformanceCategory[] {
  return uniqueCategories([
    ...items.map((item) => item.category),
    ...risks.map((risk) => risk.riskCategory),
    ...readiness.map((entry) => entry.targetArea),
  ]);
}

export function createMobilePerformanceChecklistItem(
  item: Omit<MobilePerformanceChecklistItem, "safetyBoundaries"> & {
    safetyBoundaries?: MobilePerformanceChecklistItem["safetyBoundaries"];
  },
): MobilePerformanceChecklistItem {
  return {
    ...item,
    expectedEvidence: [...item.expectedEvidence],
    relatedAppTypes: [...item.relatedAppTypes],
    relatedArchitectureLayers: [...item.relatedArchitectureLayers],
    requiredApprovals: [...item.requiredApprovals],
    limitations: [...item.limitations],
    safetyBoundaries: item.safetyBoundaries ?? itemSafety(),
  };
}

export function createMobilePerformanceRisk(
  risk: Omit<MobilePerformanceRisk, "safetyBoundaries"> & {
    safetyBoundaries?: MobilePerformanceRisk["safetyBoundaries"];
  },
): MobilePerformanceRisk {
  return {
    ...risk,
    requiredEvidence: [...risk.requiredEvidence],
    limitations: [...risk.limitations],
    safetyBoundaries: risk.safetyBoundaries ?? riskSafety(),
  };
}

export function createMobileProfilingReadiness(
  readiness: Omit<MobileProfilingReadiness, "safetyBoundaries"> & {
    safetyBoundaries?: MobileProfilingReadiness["safetyBoundaries"];
  },
): MobileProfilingReadiness {
  return {
    ...readiness,
    requiredEvidence: [...readiness.requiredEvidence],
    limitations: [...readiness.limitations],
    safetyBoundaries: readiness.safetyBoundaries ?? readinessSafety(),
  };
}

function defaultChecklistItems(input: MobilePerformanceChecklistInput): MobilePerformanceChecklistItem[] {
  const appType = appTypeFromInput(input);
  const categories = categorySetFromInput(input);
  const layers = architectureLayersFromInput(input);

  return [
    createMobilePerformanceChecklistItem({
      checklistItemId: "mobile-performance-check:startup",
      category: "startup",
      title: "Startup posture is reviewable",
      question: "Does the future app identify startup-critical flows, heavy initial dependencies, and first screen obligations?",
      expectedEvidence: ["architecture_profile_ref", "factory_flow_ref", "release_target_ref"],
      failureSignal: "Startup path lacks scope and evidence before implementation.",
      severityHint: "high",
      relatedAppTypes: ["any"],
      relatedArchitectureLayers: ["app_routes", "features", "config"],
      riskLevel: "high",
      requiredApprovals: [],
      limitations: ["Checklist item does not collect runtime startup data."],
    }),
    createMobilePerformanceChecklistItem({
      checklistItemId: "mobile-performance-check:initial-render",
      category: "initial_render",
      title: "Initial render pressure is bounded",
      question: "Are first useful screens planned with loading, empty, error, and skeleton posture before implementation?",
      expectedEvidence: ["ux_state_ref", "screen_map_ref", "state_ownership_ref"],
      failureSignal: "Initial render has no screen state or data dependency posture.",
      severityHint: "high",
      relatedAppTypes: ["any"],
      relatedArchitectureLayers: ["screens", "components", "state"],
      riskLevel: "high",
      requiredApprovals: [],
      limitations: ["Checklist item does not render screens or capture runtime signals."],
    }),
    createMobilePerformanceChecklistItem({
      checklistItemId: "mobile-performance-check:list-rendering",
      category: "list_rendering",
      title: "List rendering posture is explicit",
      question: "Do feed, catalog, dashboard, chat, or field-operation lists have virtualization and pagination review needs?",
      expectedEvidence: ["ux_pattern_ref", "data_domain_ref", "navigation_route_ref"],
      failureSignal: "List-heavy flow lacks list rendering review posture.",
      severityHint: "high",
      relatedAppTypes: ["marketplace_app", "social_freemium_app", "dashboard_companion_app", "erp_mobile_field_ops_app"],
      relatedArchitectureLayers: ["screens", "components", "features", "repositories"],
      riskLevel: categories.includes("list_rendering") ? "high" : "medium",
      requiredApprovals: [],
      limitations: ["Checklist item does not create lists or install list libraries."],
    }),
    createMobilePerformanceChecklistItem({
      checklistItemId: "mobile-performance-check:state-updates",
      category: "state_updates",
      title: "State update pressure is planned",
      question: "Does state ownership avoid broad re-render pressure for forms, session, cache, and optimistic update flows?",
      expectedEvidence: ["state_ownership_ref", "cache_sync_ref", "ux_state_ref"],
      failureSignal: "State-heavy flow lacks ownership and update pressure posture.",
      severityHint: "medium",
      relatedAppTypes: ["any"],
      relatedArchitectureLayers: ["features", "state", "repositories"],
      riskLevel: "medium",
      requiredApprovals: [],
      limitations: ["Checklist item does not create stores or runtime subscriptions."],
    }),
    createMobilePerformanceChecklistItem({
      checklistItemId: "mobile-performance-check:offline-cache-sync",
      category: "offline_cache_sync",
      title: "Offline/cache/sync cost is bounded",
      question: "Do offline, stale data, queued intent, retry, and conflict flows have user feedback and cost posture?",
      expectedEvidence: ["offline_cache_sync_ref", "state_conflict_ref", "ux_recovery_ref"],
      failureSignal: "Offline/cache/sync behavior lacks performance review posture.",
      severityHint: categories.includes("offline_cache_sync") ? "high" : "medium",
      relatedAppTypes: ["any"],
      relatedArchitectureLayers: ["services", "repositories", "state"],
      riskLevel: categories.includes("offline_cache_sync") ? "high" : "medium",
      requiredApprovals: categories.includes("offline_cache_sync") ? ["offline_performance_review"] : [],
      limitations: ["Checklist item does not execute queues, cache behavior, or network behavior."],
    }),
    createMobilePerformanceChecklistItem({
      checklistItemId: "mobile-performance-check:bundle-memory-low-end",
      category: "low_end_device",
      title: "Low-end device posture is documented",
      question: "Does the app idea document bundle, memory, media, and interaction pressure for lower capability devices?",
      expectedEvidence: ["architecture_layer_ref", "release_target_ref", "pm_risk_ref"],
      failureSignal: "Low-end device readiness is unknown for performance-sensitive flows.",
      severityHint: "medium",
      relatedAppTypes: ["any"],
      relatedArchitectureLayers: layers.filter((layer): layer is MobileArchitectureLayerId => layer !== "unknown").length > 0
        ? layers.filter((layer): layer is MobileArchitectureLayerId => layer !== "unknown")
        : ["any"],
      riskLevel: "medium",
      requiredApprovals: [],
      limitations: ["Checklist item does not run device automation."],
    }),
    createMobilePerformanceChecklistItem({
      checklistItemId: "mobile-performance-check:profiling-future",
      category: "profiling_future",
      title: "Future profiling readiness is declared",
      question: "Are target flows, expected signals, privacy boundaries, and human review needs documented before real profiling?",
      expectedEvidence: ["profiling_readiness_ref", "security_baseline_ref", "human_review_ref"],
      failureSignal: "Future profiling is requested without scope or privacy posture.",
      severityHint: "high",
      relatedAppTypes: [appType],
      relatedArchitectureLayers: ["tests", "native_future", "release_future"],
      riskLevel: "high",
      requiredApprovals: ["future_profiling_review"],
      limitations: ["Checklist item does not run profiling tools or collect metrics."],
    }),
  ];
}

function defaultRisks(input: MobilePerformanceChecklistInput): MobilePerformanceRisk[] {
  const riskLevel = deriveRisk(input);
  const categories = categorySetFromInput(input);

  return [
    createMobilePerformanceRisk({
      riskId: "mobile-performance-risk:startup-initial-render",
      riskCategory: "startup",
      affectedFlow: targetFlowsFromInput(input)[0] ?? "future_mobile_startup",
      affectedLayer: "app_routes",
      likelihood: "possible",
      impact: riskLevel === "critical" ? "critical" : "high",
      severity: riskLevel === "critical" ? "critical" : "high",
      mitigation: "Require startup scope, first screen responsibilities, dependency posture, and loading state evidence before implementation.",
      requiredEvidence: ["architecture_profile_ref", "ux_state_ref", "release_target_ref"],
      profilingNeeded: true,
      humanReviewRequired: riskLevel === "critical" || riskLevel === "high",
      limitations: ["Risk does not run profiling or collect startup data."],
    }),
    createMobilePerformanceRisk({
      riskId: "mobile-performance-risk:list-or-media",
      riskCategory: categories.includes("image_media") ? "image_media" : "list_rendering",
      affectedFlow: categories.includes("image_media") ? "future_media_flow" : "future_list_flow",
      affectedLayer: "components",
      likelihood: categories.includes("list_rendering") || categories.includes("image_media") ? "likely" : "possible",
      impact: "high",
      severity: categories.includes("list_rendering") || categories.includes("image_media") ? "high" : "medium",
      mitigation: "Require list/media loading posture, pagination posture, and recovery states before implementation.",
      requiredEvidence: ["ux_pattern_ref", "screen_map_ref", "data_domain_ref"],
      profilingNeeded: categories.includes("list_rendering") || categories.includes("image_media"),
      humanReviewRequired: categories.includes("list_rendering") || categories.includes("image_media"),
      limitations: ["Risk does not create screens, lists, image loaders, or runtime assets."],
    }),
    createMobilePerformanceRisk({
      riskId: "mobile-performance-risk:state-offline-sync",
      riskCategory: categories.includes("offline_cache_sync") ? "offline_cache_sync" : "state_updates",
      affectedFlow: "future_state_or_offline_flow",
      affectedLayer: "state",
      likelihood: categories.includes("offline_cache_sync") ? "likely" : "possible",
      impact: categories.includes("offline_cache_sync") ? "high" : "medium",
      severity: categories.includes("offline_cache_sync") ? "high" : "medium",
      mitigation: "Require state ownership, cache freshness, conflict, retry, and recovery posture before implementation.",
      requiredEvidence: ["state_ownership_ref", "offline_cache_sync_ref", "security_baseline_ref"],
      profilingNeeded: categories.includes("offline_cache_sync"),
      humanReviewRequired: categories.includes("offline_cache_sync"),
      limitations: ["Risk does not execute queues, calls, or state runtime behavior."],
    }),
    createMobilePerformanceRisk({
      riskId: "mobile-performance-risk:low-end-device-battery",
      riskCategory: categories.includes("battery_impact") ? "battery_impact" : "low_end_device",
      affectedFlow: "future_low_end_device_flow",
      affectedLayer: "native_future",
      likelihood: categories.includes("battery_impact") ? "likely" : "possible",
      impact: categories.includes("battery_impact") ? "high" : "medium",
      severity: categories.includes("battery_impact") ? "high" : "medium",
      mitigation: "Require low-end device and battery impact review before future implementation or release claims.",
      requiredEvidence: ["release_target_ref", "architecture_profile_ref", "human_review_ref"],
      profilingNeeded: true,
      humanReviewRequired: true,
      limitations: ["Risk does not run device automation or create release artifacts."],
    }),
  ];
}

function defaultProfilingReadiness(input: MobilePerformanceChecklistInput): MobileProfilingReadiness[] {
  const categories = categorySetFromInput(input);
  const riskLevel = deriveRisk(input);

  return [
    createMobileProfilingReadiness({
      profilingId: "mobile-performance-readiness:startup",
      targetArea: "startup",
      recommendedToolingPosture: "Future approved startup review on a known app target with privacy-safe signals.",
      metricName: "startup_time_future",
      expectedSignal: "First useful screen should be acceptable for target release and device class.",
      riskLevel,
      requiredEvidence: ["release_target_ref", "architecture_profile_ref", "human_review_ref"],
      futureExecutionRequired: true,
      limitations: ["Readiness metadata does not run tools or collect startup metrics."],
    }),
    createMobileProfilingReadiness({
      profilingId: "mobile-performance-readiness:navigation",
      targetArea: "navigation_transition",
      recommendedToolingPosture: "Future approved route transition review for primary flows.",
      metricName: "route_transition_smoothness_future",
      expectedSignal: "Primary route changes should remain visually stable under expected state updates.",
      riskLevel: categories.includes("navigation_transition") ? "high" : "medium",
      requiredEvidence: ["navigation_flow_ref", "ux_state_ref", "state_ownership_ref"],
      futureExecutionRequired: true,
      limitations: ["Readiness metadata does not automate navigation."],
    }),
    createMobileProfilingReadiness({
      profilingId: "mobile-performance-readiness:list-media",
      targetArea: categories.includes("image_media") ? "image_media" : "list_rendering",
      recommendedToolingPosture: "Future approved list/media review after screens and data shape exist.",
      metricName: categories.includes("image_media") ? "media_load_health_future" : "list_scroll_health_future",
      expectedSignal: "Dense content should remain responsive for target devices and data sizes.",
      riskLevel: categories.includes("list_rendering") || categories.includes("image_media") ? "high" : "medium",
      requiredEvidence: ["screen_map_ref", "ux_pattern_ref", "data_domain_ref"],
      futureExecutionRequired: categories.includes("list_rendering") || categories.includes("image_media"),
      limitations: ["Readiness metadata does not create lists, media pipelines, or runtime checks."],
    }),
    createMobileProfilingReadiness({
      profilingId: "mobile-performance-readiness:bundle-memory",
      targetArea: "bundle_size",
      recommendedToolingPosture: "Future approved bundle and memory review before release readiness claims.",
      metricName: "bundle_size_budget_future",
      expectedSignal: "Bundle and memory posture should match the target app type, release target, and device class.",
      riskLevel: "medium",
      requiredEvidence: ["architecture_layer_ref", "dependency_review_ref", "release_profile_ref"],
      futureExecutionRequired: true,
      limitations: ["Readiness metadata does not analyze bundles or memory."],
    }),
  ];
}

export function recommendMobilePerformanceChecklist(input: MobilePerformanceChecklistInput = {}): MobilePerformanceRecommendation {
  const appType = appTypeFromInput(input);
  const risks = input.risks ?? defaultRisks(input);
  const checklistItems = input.checklistItems ?? defaultChecklistItems(input);
  const readiness = input.profilingReadiness ?? defaultProfilingReadiness(input);
  const riskLevel = highestRisk([
    deriveRisk(input),
    ...risks.map((risk) => riskTierFromSeverity(risk.severity)),
    ...checklistItems.map((item) => item.riskLevel),
    ...readiness.map((entry) => entry.riskLevel),
  ]);
  const requiredApprovals = uniqueStrings([
    ...approvalDefaults(input, riskLevel),
    ...checklistItems.flatMap((item) => item.requiredApprovals),
    ...(readiness.some((entry) => entry.futureExecutionRequired) ? ["future_profiling_review"] : []),
  ]);

  return {
    recommendationId: `mobile-performance-checklist:${appType}`,
    appType,
    postureSummary: "Keep performance review as advisory metadata until a real app target and human-approved profiling phase exist.",
    checklistPosture: "Use checklist items as DoD and PM review input for startup, render, navigation, list, media, state, offline, bundle, memory, and low-end device posture.",
    profilingPosture: "Represent future profiling readiness as metadata only; do not run tools or collect runtime signals.",
    riskLevel,
    requiredApprovals,
    recommendedNextStep: {
      nextStepId: "mobile_performance_next_step:129B",
      title: "Plan mobile testing strategy",
      safeSummary: "Continue with Phase 129B after performance checklist metadata is established.",
      priority: riskLevel,
      decisionMode: "plan_only",
      riskSurfaces: ["runtime", "release", "package_workflow", "ci_baseline"],
      recommendationOnly: true,
      noExecution: true,
    },
    safetyBoundaries: {
      advisoryOnly: true,
      metadataOnly: true,
      noProfilingExecution: true,
      noAppGeneration: true,
      noRuntimeMetricCapture: true,
    },
  };
}

export function createMobilePerformanceChecklist(input: MobilePerformanceChecklistInput = {}): MobilePerformanceChecklist {
  const appType = appTypeFromInput(input);
  const releaseTarget = releaseTargetFromInput(input);
  const targetFlows = targetFlowsFromInput(input);
  const architectureLayers = architectureLayersFromInput(input);
  const checklistItems = input.checklistItems ? [...input.checklistItems] : defaultChecklistItems({ ...input, appType, targetFlows, architectureLayers });
  const risks = input.risks ? [...input.risks] : defaultRisks({ ...input, appType, targetFlows, architectureLayers, checklistItems });
  const profilingReadiness = input.profilingReadiness ? [...input.profilingReadiness] : defaultProfilingReadiness({ ...input, appType, targetFlows, architectureLayers, checklistItems, risks });
  const recommendation = recommendMobilePerformanceChecklist({
    ...input,
    appType,
    releaseTarget,
    targetFlows,
    architectureLayers,
    checklistItems,
    risks,
    profilingReadiness,
  });
  const checklistBase = {
    checklistId: input.checklistId ?? `mobile-performance-checklist:${appType}`,
    phaseRef: input.phaseRef ?? "Phase 128I",
    appType,
    releaseTarget,
    targetFlows,
    architectureLayers: architectureLayers.length > 0 ? architectureLayers : ["unknown"],
    checklistItems,
    risks,
    profilingReadiness,
    recommendation,
    limitations: [
      "No profiling tools, comparative runtime scripts, metric capture, app generation, mobile commands, native project creation, package changes, CI activation, providers, runtime, dashboard, DB/SQL, memory, or source-control behavior is implemented.",
      "Performance guidance remains future-gated until a real app target and human-approved profiling phase exist.",
      ...(input.limitations ?? []),
    ],
    consumedFactoryMetadata: [
      "app type",
      "core flows",
      "screen map",
      "release target",
      "quality posture",
    ],
    consumedArchitectureMetadata: [
      "app routes",
      "screens",
      "components",
      "features",
      "services",
      "repositories",
      "state",
      "tests",
      "native future",
      "release future",
    ],
    consumedSecurityMetadata: [
      "data sensitivity",
      "auth/session posture",
      "privacy and logging posture",
      "third-party future posture",
      "release review posture",
    ],
    consumedStateOfflineMetadata: [
      "state ownership",
      "cache freshness",
      "offline queue posture",
      "sync conflict posture",
      "retry and recovery UX",
    ],
    pmSolidAutopilotIntegration: [
      "PM reports may include performance risks, DoD gaps, approvals, and closeout limitations.",
      "SOLID review may inspect ownership across UI, state, services, repositories, backend, and provider boundaries.",
      "Autopilot may carry checklist metadata as handoff and dry-run context only.",
    ],
    conversationalBuildLoopReadiness: [
      "Maps a simple idea to performance risk posture.",
      "Highlights MVP performance checklist items and low-end device concerns.",
      "Provides future Codex prompt context without automation.",
    ],
    safetyBoundaries,
  } satisfies Omit<MobilePerformanceChecklist, "summary">;

  return {
    ...checklistBase,
    summary: summarizeMobilePerformanceChecklist(checklistBase),
  };
}

export function summarizeMobilePerformanceChecklist(
  checklist: Pick<
    MobilePerformanceChecklist,
    "checklistId" | "appType" | "checklistItems" | "risks" | "profilingReadiness" | "safetyBoundaries"
  >,
): MobilePerformanceSummary {
  const riskLevels = [
    ...checklist.checklistItems.map((item) => item.riskLevel),
    ...checklist.risks.map((risk) => riskTierFromSeverity(risk.severity)),
    ...checklist.profilingReadiness.map((entry) => entry.riskLevel),
  ];

  return {
    checklistId: checklist.checklistId,
    appType: checklist.appType,
    checklistItemCount: checklist.checklistItems.length,
    riskCount: checklist.risks.length,
    profilingReadinessCount: checklist.profilingReadiness.length,
    categories: categoriesFromChecklist(checklist.checklistItems, checklist.risks, checklist.profilingReadiness),
    highestRiskLevel: highestRisk(riskLevels),
    criticalOrHighRiskCount: riskLevels.filter((risk) => risk === "critical" || risk === "high").length,
    futureProfilingRequiredCount: checklist.profilingReadiness.filter((entry) => entry.futureExecutionRequired).length,
    humanReviewRequiredCount: checklist.risks.filter((risk) => risk.humanReviewRequired).length,
    recommendedNextPhase: "Phase 129B - MOBILE TESTING STRATEGY PLAN",
    safeSummary:
      "Mobile Performance Checklist is source-only advisory metadata for startup, render, navigation, list, media, state, offline, bundle, memory, low-end device, battery, and profiling readiness posture.",
    safetyBoundaries: checklist.safetyBoundaries,
  };
}

export function selectPerformanceItemsByCategory(
  checklistOrItems: MobilePerformanceChecklist | readonly MobilePerformanceChecklistItem[],
  category: MobilePerformanceCategory,
): MobilePerformanceChecklistItem[] {
  const items = isMobilePerformanceChecklist(checklistOrItems) ? checklistOrItems.checklistItems : checklistOrItems;
  return items.filter((item) => item.category === category);
}

export function selectPerformanceRisksByCategory(
  checklistOrRisks: MobilePerformanceChecklist | readonly MobilePerformanceRisk[],
  category: MobilePerformanceCategory,
): MobilePerformanceRisk[] {
  const risks = isMobilePerformanceChecklist(checklistOrRisks) ? checklistOrRisks.risks : checklistOrRisks;
  return risks.filter((risk) => risk.riskCategory === category);
}

function isMobilePerformanceChecklist(
  checklistOrItems: MobilePerformanceChecklist | readonly MobilePerformanceChecklistItem[] | readonly MobilePerformanceRisk[],
): checklistOrItems is MobilePerformanceChecklist {
  return !Array.isArray(checklistOrItems);
}
