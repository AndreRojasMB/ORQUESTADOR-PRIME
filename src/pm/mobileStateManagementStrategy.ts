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
import type {
  MobileScreenStatePattern,
  MobileUxPatternCatalog,
} from "./mobileUxPatternCatalog.js";
import type {
  MobileNavigationFlowModel,
  MobileRouteModel,
} from "./mobileNavigationFlowModel.js";
import type {
  PMEvidenceReference,
  PMRecommendedNextStep,
  PMRiskTier,
  ProjectPhaseRef,
} from "./types.js";

export type MobileStateCategory =
  | "ui_local"
  | "feature_local"
  | "app_global"
  | "server_cache"
  | "persisted_local"
  | "auth_session"
  | "navigation_state"
  | "form_state"
  | "offline_queue"
  | "sync_conflict"
  | "optimistic_update"
  | "error_loading_empty";

export type MobileStateOwnerLayer =
  | Extract<
      MobileArchitectureLayerId,
      "app_routes" | "screens" | "components" | "features" | "domain" | "services" | "repositories" | "state" | "config" | "tests"
    >
  | "ux_patterns"
  | "navigation_model"
  | "factory_intake"
  | "human_review";

export type MobileStateSourceOfTruth =
  | "local_component"
  | "feature_boundary"
  | "app_state"
  | "repository_cache"
  | "remote_system_future"
  | "session_boundary"
  | "navigation_model"
  | "form_boundary"
  | "offline_queue"
  | "human_review";

export type MobileStateLifecycle =
  | "screen_lifetime"
  | "feature_lifetime"
  | "session_lifetime"
  | "app_lifetime"
  | "persisted_future"
  | "queued_until_reconciled"
  | "review_required";

export type MobilePersistencePolicy =
  | "none"
  | "ephemeral_only"
  | "future_preferences_only"
  | "future_draft_recovery"
  | "future_offline_read_model"
  | "future_sensitive_review_required"
  | "blocked_until_approved";

export type MobileSyncPolicy =
  | "none"
  | "manual_refresh_future"
  | "route_entry_refresh_future"
  | "foreground_refresh_future"
  | "future_queue_and_retry"
  | "future_conflict_review"
  | "blocked_until_approved";

export type MobileOfflineBehavior =
  | "not_required"
  | "show_offline_state"
  | "read_only_cached_future"
  | "draft_only_future"
  | "queue_intent_future"
  | "block_with_recovery"
  | "human_review_required";

export type MobileErrorHandlingPolicy =
  | "inline_recoverable"
  | "screen_state_recovery"
  | "route_fallback"
  | "rollback_optimistic_change"
  | "manual_retry"
  | "human_review_required"
  | "blocked";

export type MobileCacheStrategy =
  | "none"
  | "screen_scoped_future"
  | "feature_scoped_future"
  | "repository_scoped_future"
  | "persisted_read_model_future"
  | "offline_first_read_model_future"
  | "freshness_critical_future";

export type MobileDataFreshnessLevel =
  | "static_reference"
  | "eventually_consistent"
  | "stale_ok_with_label"
  | "fresh_on_open"
  | "fresh_before_submit"
  | "real_time_future"
  | "human_review_required";

export interface MobileStateSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noStorageImplementation: true;
  noNamedStorageAdapterImplementation: true;
  noApiCalls: true;
  noNetworkCalls: true;
  noProviderCalls: true;
  noRuntimeExecution: true;
  noDashboardMutation: true;
  noDbSqlMutation: true;
  noMobileToolingExecution: true;
  noExpoEasExecution: true;
  noPackageChanges: true;
  noCiActivation: true;
  noMemoryPersistence: true;
  noGitAutomationFromSource: true;
}

export interface MobileStateOwnership {
  stateId: string;
  stateName: string;
  ownerLayer: MobileStateOwnerLayer;
  stateType: MobileStateCategory;
  sourceOfTruth: MobileStateSourceOfTruth;
  lifecycle: MobileStateLifecycle;
  persistencePolicy: MobilePersistencePolicy;
  syncPolicy: MobileSyncPolicy;
  offlineBehavior: MobileOfflineBehavior;
  errorHandling: MobileErrorHandlingPolicy;
  relatedRoutes: readonly string[];
  relatedScreenStates: readonly string[];
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobileStateSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noStorageImplementation" | "noRuntimeExecution"
  >;
}

export interface MobileCacheSyncModel {
  cacheStrategy: MobileCacheStrategy;
  invalidationPolicy: string;
  refreshPolicy: string;
  conflictResolutionPolicy: string;
  offlineQueuePolicy: string;
  retryPolicy: string;
  dataFreshnessLevel: MobileDataFreshnessLevel;
  userFeedbackPattern: string;
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    MobileStateSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noApiCalls" | "noNetworkCalls" | "noStorageImplementation"
  >;
}

export interface MobileStateRecommendation {
  recommendationId: string;
  appType: MobileAppFactoryAppType;
  primaryStateCategories: readonly MobileStateCategory[];
  stateOwnershipPosture: string;
  cacheSyncPosture: string;
  persistencePosture: string;
  offlinePosture: string;
  authSessionPosture: string;
  formStatePosture: string;
  optimisticUpdatePosture: string;
  errorStatePosture: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<
    MobileStateSafetyBoundaries,
    "advisoryOnly" | "metadataOnly" | "noStorageImplementation" | "noApiCalls" | "noRuntimeExecution"
  >;
}

export interface MobileStateManagementSummary {
  strategyId: string;
  appType: MobileAppFactoryAppType;
  stateOwnershipCount: number;
  stateCategories: readonly MobileStateCategory[];
  ownerLayers: readonly MobileStateOwnerLayer[];
  highestRiskLevel: PMRiskTier;
  requiredApprovalCount: number;
  cacheStrategy: MobileCacheStrategy;
  dataFreshnessLevel: MobileDataFreshnessLevel;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: MobileStateSafetyBoundaries;
}

export interface MobileStateManagementStrategy {
  strategyId: string;
  phaseRef: ProjectPhaseRef;
  appType: MobileAppFactoryAppType;
  releaseTarget: MobileReleaseTarget | undefined;
  coreFlows: readonly string[];
  dataModelSummary: string;
  offlineNeeds: readonly string[];
  authNeeds: readonly string[];
  safetyNeeds: readonly string[];
  monetizationNeeds: readonly string[];
  stateOwnership: readonly MobileStateOwnership[];
  cacheSyncModel: MobileCacheSyncModel;
  recommendation: MobileStateRecommendation;
  summary: MobileStateManagementSummary;
  evidenceRefs: readonly PMEvidenceReference[];
  assumptions: readonly string[];
  limitations: readonly string[];
  consumedFactoryMetadata: readonly string[];
  consumedArchitectureMetadata: readonly string[];
  consumedUxPatternMetadata: readonly string[];
  consumedNavigationMetadata: readonly string[];
  pmSolidAutopilotIntegration: readonly string[];
  conversationalBuildLoopReadiness: readonly string[];
  safetyBoundaries: MobileStateSafetyBoundaries;
}

export interface MobileStateManagementInput {
  strategyId?: string;
  phaseRef?: ProjectPhaseRef;
  appType?: MobileAppFactoryAppType;
  releaseTarget?: MobileReleaseTarget | undefined;
  coreFlows?: readonly string[];
  dataModelSummary?: string;
  offlineNeeds?: readonly string[];
  authNeeds?: readonly string[];
  safetyNeeds?: readonly string[];
  monetizationNeeds?: readonly string[];
  stateOwnership?: readonly MobileStateOwnership[];
  cacheSyncModel?: MobileCacheSyncModel;
  riskLevel?: PMRiskTier;
  requiredApprovals?: readonly string[];
  evidenceRefs?: readonly PMEvidenceReference[];
  assumptions?: readonly string[];
  limitations?: readonly string[];
  factoryIntake?: MobileAppFactoryIntake;
  factoryStrategy?: MobileAppFactoryStrategy;
  architectureProfile?: MobileArchitectureProfile;
  uxPatternCatalog?: MobileUxPatternCatalog;
  navigationFlow?: MobileNavigationFlowModel;
}

export const mobileStateCategories: readonly MobileStateCategory[] = [
  "ui_local",
  "feature_local",
  "app_global",
  "server_cache",
  "persisted_local",
  "auth_session",
  "navigation_state",
  "form_state",
  "offline_queue",
  "sync_conflict",
  "optimistic_update",
  "error_loading_empty",
];

const safetyBoundaries: MobileStateSafetyBoundaries = {
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noStorageImplementation: true,
  noNamedStorageAdapterImplementation: true,
  noApiCalls: true,
  noNetworkCalls: true,
  noProviderCalls: true,
  noRuntimeExecution: true,
  noDashboardMutation: true,
  noDbSqlMutation: true,
  noMobileToolingExecution: true,
  noExpoEasExecution: true,
  noPackageChanges: true,
  noCiActivation: true,
  noMemoryPersistence: true,
  noGitAutomationFromSource: true,
};

const ownershipSafety = (): MobileStateOwnership["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noStorageImplementation: true,
  noRuntimeExecution: true,
});

const cacheSyncSafety = (): MobileCacheSyncModel["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noApiCalls: true,
  noNetworkCalls: true,
  noStorageImplementation: true,
});

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function uniqueCategories(values: readonly MobileStateCategory[]): MobileStateCategory[] {
  return mobileStateCategories.filter((category) => values.includes(category));
}

function highestRisk(risks: readonly PMRiskTier[]): PMRiskTier {
  if (risks.includes("critical")) return "critical";
  if (risks.includes("high")) return "high";
  if (risks.includes("medium")) return "medium";
  return "low";
}

function appTypeFromInput(input: MobileStateManagementInput): MobileAppFactoryAppType {
  return (
    input.appType ??
    input.factoryIntake?.supportedAppType ??
    input.factoryStrategy?.appType ??
    input.architectureProfile?.appType ??
    input.uxPatternCatalog?.appTypes[0] ??
    input.navigationFlow?.appType ??
    "unknown_mobile_app"
  );
}

function releaseTargetFromInput(input: MobileStateManagementInput): MobileReleaseTarget | undefined {
  return input.releaseTarget ?? input.factoryIntake?.releaseTarget ?? input.factoryStrategy?.intake.releaseTarget;
}

function coreFlowsFromInput(input: MobileStateManagementInput): string[] {
  return uniqueStrings([
    ...(input.coreFlows ?? []),
    ...(input.factoryIntake?.coreFlows ?? []),
    ...(input.factoryStrategy?.intake.coreFlows ?? []),
    ...(input.uxPatternCatalog?.coreFlows ?? []),
  ]);
}

function routeIdsFromNavigation(navigationFlow?: MobileNavigationFlowModel): string[] {
  return navigationFlow?.routes.map((route) => route.routeId) ?? [];
}

function screenStateIdsFromCatalog(catalog?: MobileUxPatternCatalog): string[] {
  return catalog?.screenStatePatterns.map((state) => state.screenStateId) ?? [];
}

function deriveRiskFromInput(input: MobileStateManagementInput): PMRiskTier {
  const signals = [
    ...(input.offlineNeeds ?? []),
    ...(input.authNeeds ?? []),
    ...(input.safetyNeeds ?? []),
    ...(input.monetizationNeeds ?? []),
    ...(input.factoryIntake?.offlineNeeds ?? []),
    ...(input.factoryIntake?.authNeeds ?? []),
    ...(input.factoryIntake?.safetyNeeds ?? []),
    ...(input.factoryIntake?.monetizationNeeds ?? []),
  ].join(" ");

  if (input.riskLevel === "critical" || /identity|payment|safety|abuse|marketplace transaction|credential/i.test(signals)) {
    return "critical";
  }

  if (input.riskLevel === "high" || /offline|sync|auth|session|premium|role|permission/i.test(signals)) {
    return "high";
  }

  if (input.riskLevel === "medium" || /form|cache|draft|profile/i.test(signals)) {
    return "medium";
  }

  return "low";
}

function categorySetForInput(input: MobileStateManagementInput): MobileStateCategory[] {
  const values = [
    ...(input.offlineNeeds ?? []),
    ...(input.authNeeds ?? []),
    ...(input.safetyNeeds ?? []),
    ...(input.monetizationNeeds ?? []),
    ...(input.factoryIntake?.offlineNeeds ?? []),
    ...(input.factoryIntake?.authNeeds ?? []),
    ...(input.factoryIntake?.safetyNeeds ?? []),
    ...(input.factoryIntake?.monetizationNeeds ?? []),
    ...(input.uxPatternCatalog?.offlineNeeds ?? []),
    ...(input.uxPatternCatalog?.authNeeds ?? []),
    ...(input.uxPatternCatalog?.safetyNeeds ?? []),
    ...(input.uxPatternCatalog?.monetizationNeeds ?? []),
  ].join(" ");

  const categories: MobileStateCategory[] = [
    "ui_local",
    "feature_local",
    "app_global",
    "server_cache",
    "navigation_state",
    "form_state",
    "error_loading_empty",
  ];

  if (/persist|preference|draft/i.test(values)) categories.push("persisted_local");
  if (/auth|session|account|role|permission/i.test(values)) categories.push("auth_session");
  if (/offline|queue/i.test(values)) categories.push("offline_queue");
  if (/sync|conflict/i.test(values)) categories.push("sync_conflict");
  if (/optimistic|like|save|submit|booking|marketplace|payment|premium/i.test(values)) categories.push("optimistic_update");

  return uniqueCategories(categories);
}

function defaultRelatedRoutes(input: MobileStateManagementInput, routeType?: (route: MobileRouteModel) => boolean): string[] {
  const routes = input.navigationFlow?.routes ?? [];
  const selected = routeType ? routes.filter(routeType) : routes;
  return selected.slice(0, 6).map((route) => route.routeId);
}

function defaultScreenStates(input: MobileStateManagementInput, stateType?: (state: MobileScreenStatePattern) => boolean): string[] {
  const states = input.uxPatternCatalog?.screenStatePatterns ?? [];
  const selected = stateType ? states.filter(stateType) : states;
  return selected.slice(0, 6).map((state) => state.screenStateId);
}

export function createMobileStateOwnership(
  state: Omit<MobileStateOwnership, "safetyBoundaries"> & {
    safetyBoundaries?: MobileStateOwnership["safetyBoundaries"];
  },
): MobileStateOwnership {
  return {
    ...state,
    relatedRoutes: [...state.relatedRoutes],
    relatedScreenStates: [...state.relatedScreenStates],
    requiredApprovals: [...state.requiredApprovals],
    limitations: [...state.limitations],
    safetyBoundaries: state.safetyBoundaries ?? ownershipSafety(),
  };
}

export function createMobileCacheSyncModel(
  model: Omit<MobileCacheSyncModel, "safetyBoundaries"> & {
    safetyBoundaries?: MobileCacheSyncModel["safetyBoundaries"];
  },
): MobileCacheSyncModel {
  return {
    ...model,
    safetyBoundaries: model.safetyBoundaries ?? cacheSyncSafety(),
  };
}

function buildDefaultStateOwnership(input: MobileStateManagementInput): MobileStateOwnership[] {
  const allRoutes = defaultRelatedRoutes(input);
  const protectedRoutes = defaultRelatedRoutes(input, (route) => route.requiredAuth || route.routeType === "protected" || route.routeType === "role_based");
  const formStates = defaultScreenStates(input, (state) => state.stateType === "error" || state.stateType === "success");
  const recoveryStates = defaultScreenStates(input, (state) => ["loading", "empty", "error", "offline", "partial_data", "sync_pending"].includes(state.stateType));
  const riskLevel = deriveRiskFromInput(input);
  const baseApprovals = uniqueStrings([...(input.requiredApprovals ?? []), ...(input.factoryIntake?.requiredApprovals ?? [])]);

  return [
    createMobileStateOwnership({
      stateId: "state:ui-local",
      stateName: "Local UI Interaction State",
      ownerLayer: "screens",
      stateType: "ui_local",
      sourceOfTruth: "local_component",
      lifecycle: "screen_lifetime",
      persistencePolicy: "none",
      syncPolicy: "none",
      offlineBehavior: "not_required",
      errorHandling: "inline_recoverable",
      relatedRoutes: allRoutes,
      relatedScreenStates: defaultScreenStates(input, (state) => state.stateType === "loading" || state.stateType === "empty"),
      riskLevel: "low",
      requiredApprovals: [],
      limitations: ["Screen-local state is advisory metadata and does not create components or hooks."],
    }),
    createMobileStateOwnership({
      stateId: "state:feature-local",
      stateName: "Feature Flow State",
      ownerLayer: "features",
      stateType: "feature_local",
      sourceOfTruth: "feature_boundary",
      lifecycle: "feature_lifetime",
      persistencePolicy: "ephemeral_only",
      syncPolicy: "none",
      offlineBehavior: "show_offline_state",
      errorHandling: "screen_state_recovery",
      relatedRoutes: allRoutes,
      relatedScreenStates: recoveryStates,
      riskLevel: "medium",
      requiredApprovals: [],
      limitations: ["Feature state describes future ownership only and does not create stores."],
    }),
    createMobileStateOwnership({
      stateId: "state:server-cache",
      stateName: "Server Cache State",
      ownerLayer: "repositories",
      stateType: "server_cache",
      sourceOfTruth: "repository_cache",
      lifecycle: "session_lifetime",
      persistencePolicy: "none",
      syncPolicy: "route_entry_refresh_future",
      offlineBehavior: input.offlineNeeds?.length ? "read_only_cached_future" : "show_offline_state",
      errorHandling: "manual_retry",
      relatedRoutes: allRoutes,
      relatedScreenStates: recoveryStates,
      riskLevel: input.offlineNeeds?.length ? "high" : "medium",
      requiredApprovals: input.offlineNeeds?.length ? ["offline_cache_review"] : [],
      limitations: ["Cache state is planning metadata and does not create clients or adapters."],
    }),
    createMobileStateOwnership({
      stateId: "state:auth-session",
      stateName: "Auth And Session State",
      ownerLayer: "state",
      stateType: "auth_session",
      sourceOfTruth: "session_boundary",
      lifecycle: "session_lifetime",
      persistencePolicy: "future_sensitive_review_required",
      syncPolicy: "blocked_until_approved",
      offlineBehavior: "block_with_recovery",
      errorHandling: "route_fallback",
      relatedRoutes: protectedRoutes,
      relatedScreenStates: defaultScreenStates(input, (state) => state.stateType === "unauthenticated" || state.stateType === "permission_denied"),
      riskLevel: input.authNeeds?.length || protectedRoutes.length ? "high" : "medium",
      requiredApprovals: protectedRoutes.length || input.authNeeds?.length ? ["auth_session_state_review"] : [],
      limitations: ["Session metadata must not store credentials or execute auth behavior."],
    }),
    createMobileStateOwnership({
      stateId: "state:navigation",
      stateName: "Navigation State",
      ownerLayer: "navigation_model",
      stateType: "navigation_state",
      sourceOfTruth: "navigation_model",
      lifecycle: "session_lifetime",
      persistencePolicy: "none",
      syncPolicy: "none",
      offlineBehavior: "show_offline_state",
      errorHandling: "route_fallback",
      relatedRoutes: allRoutes,
      relatedScreenStates: recoveryStates,
      riskLevel: "medium",
      requiredApprovals: [],
      limitations: ["Navigation state references route metadata only and does not generate route files."],
    }),
    createMobileStateOwnership({
      stateId: "state:form",
      stateName: "Form State",
      ownerLayer: "features",
      stateType: "form_state",
      sourceOfTruth: "form_boundary",
      lifecycle: "feature_lifetime",
      persistencePolicy: "future_draft_recovery",
      syncPolicy: "manual_refresh_future",
      offlineBehavior: "draft_only_future",
      errorHandling: "screen_state_recovery",
      relatedRoutes: allRoutes,
      relatedScreenStates: formStates,
      riskLevel: "medium",
      requiredApprovals: [],
      limitations: ["Form state describes future validation posture only and does not submit data."],
    }),
    createMobileStateOwnership({
      stateId: "state:offline-queue",
      stateName: "Offline Queue State",
      ownerLayer: "services",
      stateType: "offline_queue",
      sourceOfTruth: "offline_queue",
      lifecycle: "queued_until_reconciled",
      persistencePolicy: "blocked_until_approved",
      syncPolicy: "future_queue_and_retry",
      offlineBehavior: input.offlineNeeds?.length ? "queue_intent_future" : "human_review_required",
      errorHandling: "human_review_required",
      relatedRoutes: defaultRelatedRoutes(input, (route) => route.routeType === "offline_sync"),
      relatedScreenStates: defaultScreenStates(input, (state) => state.stateType === "offline" || state.stateType === "sync_pending"),
      riskLevel: input.offlineNeeds?.length ? "high" : "medium",
      requiredApprovals: input.offlineNeeds?.length ? ["offline_queue_review"] : [],
      limitations: ["Offline queue state is future-gated and does not create queued jobs or storage."],
    }),
    createMobileStateOwnership({
      stateId: "state:error-loading-empty",
      stateName: "Error Loading Empty State",
      ownerLayer: "ux_patterns",
      stateType: "error_loading_empty",
      sourceOfTruth: "human_review",
      lifecycle: "screen_lifetime",
      persistencePolicy: "none",
      syncPolicy: "none",
      offlineBehavior: "show_offline_state",
      errorHandling: "screen_state_recovery",
      relatedRoutes: allRoutes,
      relatedScreenStates: recoveryStates,
      riskLevel: "low",
      requiredApprovals: [],
      limitations: ["UX state metadata does not generate screens or components."],
    }),
    createMobileStateOwnership({
      stateId: "state:sync-conflict",
      stateName: "Sync Conflict State",
      ownerLayer: "repositories",
      stateType: "sync_conflict",
      sourceOfTruth: "human_review",
      lifecycle: "review_required",
      persistencePolicy: "blocked_until_approved",
      syncPolicy: "future_conflict_review",
      offlineBehavior: "human_review_required",
      errorHandling: "human_review_required",
      relatedRoutes: allRoutes,
      relatedScreenStates: recoveryStates,
      riskLevel,
      requiredApprovals: riskLevel === "high" || riskLevel === "critical" ? ["sync_conflict_review"] : [],
      limitations: ["Conflict state is advisory only and does not resolve data."],
    }),
    createMobileStateOwnership({
      stateId: "state:optimistic-update",
      stateName: "Optimistic Update State",
      ownerLayer: "features",
      stateType: "optimistic_update",
      sourceOfTruth: "feature_boundary",
      lifecycle: "feature_lifetime",
      persistencePolicy: "none",
      syncPolicy: "future_conflict_review",
      offlineBehavior: "block_with_recovery",
      errorHandling: "rollback_optimistic_change",
      relatedRoutes: allRoutes,
      relatedScreenStates: recoveryStates,
      riskLevel: input.monetizationNeeds?.length || input.safetyNeeds?.length ? "high" : "medium",
      requiredApprovals: uniqueStrings([
        ...baseApprovals,
        ...(input.monetizationNeeds?.length ? ["monetization_state_review"] : []),
        ...(input.safetyNeeds?.length ? ["safety_state_review"] : []),
      ]),
      limitations: ["Optimistic updates are recommendation metadata only and do not mutate user data."],
    }),
  ].filter((state) => categorySetForInput(input).includes(state.stateType));
}

export function createMobileStateManagementStrategy(
  input: MobileStateManagementInput = {},
): MobileStateManagementStrategy {
  const appType = appTypeFromInput(input);
  const releaseTarget = releaseTargetFromInput(input);
  const coreFlows = coreFlowsFromInput(input);
  const offlineNeeds = uniqueStrings([...(input.offlineNeeds ?? []), ...(input.factoryIntake?.offlineNeeds ?? [])]);
  const authNeeds = uniqueStrings([...(input.authNeeds ?? []), ...(input.factoryIntake?.authNeeds ?? [])]);
  const safetyNeeds = uniqueStrings([...(input.safetyNeeds ?? []), ...(input.factoryIntake?.safetyNeeds ?? [])]);
  const monetizationNeeds = uniqueStrings([...(input.monetizationNeeds ?? []), ...(input.factoryIntake?.monetizationNeeds ?? [])]);
  const stateOwnership = input.stateOwnership ? [...input.stateOwnership] : buildDefaultStateOwnership({ ...input, offlineNeeds, authNeeds, safetyNeeds, monetizationNeeds });
  const cacheSyncModel = input.cacheSyncModel ?? createMobileCacheSyncModel({
    cacheStrategy: offlineNeeds.length > 0 ? "offline_first_read_model_future" : "repository_scoped_future",
    invalidationPolicy: "future metadata should describe route-entry, mutation-result, and session-boundary invalidation",
    refreshPolicy: offlineNeeds.length > 0 ? "future foreground refresh with explicit offline feedback" : "future route-entry refresh with user retry affordance",
    conflictResolutionPolicy: safetyNeeds.length > 0 ? "block high-risk conflicts until human review" : "prefer explicit recovery copy and manual retry metadata",
    offlineQueuePolicy: offlineNeeds.length > 0 ? "future queue posture requires approval before implementation" : "queue not required unless later product evidence asks for it",
    retryPolicy: "future retry posture remains manual or approval-gated for high-risk operations",
    dataFreshnessLevel: offlineNeeds.length > 0 ? "stale_ok_with_label" : "fresh_on_open",
    userFeedbackPattern: "link loading, empty, error, offline, stale, queued, and rollback feedback to UX screen states",
    riskLevel: highestRisk(stateOwnership.map((state) => state.riskLevel)),
  });
  const recommendation = recommendMobileStateManagementStrategy({
    ...input,
    appType,
    releaseTarget,
    coreFlows,
    offlineNeeds,
    authNeeds,
    safetyNeeds,
    monetizationNeeds,
    stateOwnership,
    cacheSyncModel,
  });
  const strategyBase = {
    strategyId: input.strategyId ?? `mobile-state:${appType}`,
    phaseRef: input.phaseRef ?? "Phase 125I",
    appType,
    releaseTarget,
    coreFlows,
    dataModelSummary:
      input.dataModelSummary ??
      input.factoryIntake?.dataModelSummary ??
      input.factoryStrategy?.intake.dataModelSummary ??
      "Caller has not supplied a detailed mobile data model summary yet.",
    offlineNeeds,
    authNeeds,
    safetyNeeds,
    monetizationNeeds,
    stateOwnership,
    cacheSyncModel,
    recommendation,
    evidenceRefs: [...(input.evidenceRefs ?? [])],
    assumptions: [
      "State decisions remain advisory until a future implementation phase is approved.",
      "Caller-supplied metadata is the only input; no repo or app inspection is performed.",
      ...(input.assumptions ?? []),
    ],
    limitations: [
      "No storage adapter, API client, provider integration, runtime store, or generated mobile app is created.",
      "Offline, cache, sync, auth, and persistence decisions remain future-gated.",
      ...(input.limitations ?? []),
    ],
    consumedFactoryMetadata: [
      "app type",
      "core flows",
      "data model summary",
      "offline needs",
      "auth needs",
      "safety needs",
      "monetization needs",
      "release target",
    ],
    consumedArchitectureMetadata: [
      "app_routes",
      "screens",
      "features",
      "domain",
      "services",
      "repositories",
      "state",
      "config",
      "tests",
    ],
    consumedUxPatternMetadata: [
      "loading state refs",
      "empty state refs",
      "error state refs",
      "offline state refs",
      "permission and recovery states",
    ],
    consumedNavigationMetadata: [
      "auth gates",
      "onboarding gates",
      "protected routes",
      "session restore",
      "role-based routes",
      "fallback routes",
      "offline routes",
    ],
    pmSolidAutopilotIntegration: [
      "PM reports may summarize state ownership, risk, approvals, and DoD gaps.",
      "SOLID review may check separation between screens, features, repositories, state, and services.",
      "Autopilot may carry this strategy as handoff and dry-run context only.",
    ],
    conversationalBuildLoopReadiness: [
      "Maps a simple idea to future state ownership categories.",
      "Highlights persistence, offline, loading, error, and recovery obligations.",
      "Provides prompt context for future implementation without automating it.",
    ],
    safetyBoundaries,
  } satisfies Omit<MobileStateManagementStrategy, "summary">;

  return {
    ...strategyBase,
    summary: summarizeMobileStateManagementStrategy(strategyBase),
  };
}

export function recommendMobileStateManagementStrategy(
  input: MobileStateManagementInput = {},
): MobileStateRecommendation {
  const appType = appTypeFromInput(input);
  const stateOwnership = input.stateOwnership ?? buildDefaultStateOwnership(input);
  const categories = uniqueCategories(stateOwnership.map((state) => state.stateType));
  const riskLevel = highestRisk([deriveRiskFromInput(input), ...stateOwnership.map((state) => state.riskLevel)]);
  const requiredApprovals = uniqueStrings([
    ...(input.requiredApprovals ?? []),
    ...stateOwnership.flatMap((state) => state.requiredApprovals),
    ...(input.authNeeds?.length ? ["auth_session_state_review"] : []),
    ...(input.offlineNeeds?.length ? ["offline_state_review"] : []),
    ...(input.safetyNeeds?.length ? ["safety_state_review"] : []),
    ...(input.monetizationNeeds?.length ? ["monetization_state_review"] : []),
  ]);

  return {
    recommendationId: `mobile-state-recommendation:${appType}`,
    appType,
    primaryStateCategories: categories,
    stateOwnershipPosture: "Keep state ownership explicit by layer before implementation starts.",
    cacheSyncPosture: input.offlineNeeds?.length
      ? "Plan offline-aware cache and sync metadata with human review before runtime work."
      : "Plan repository-scoped cache posture as advisory metadata only.",
    persistencePosture: input.authNeeds?.length || input.safetyNeeds?.length
      ? "Treat persistence as sensitive and approval-gated."
      : "Prefer ephemeral state until durable product evidence exists.",
    offlinePosture: input.offlineNeeds?.length
      ? "Model offline UX, queue intent, retry posture, and conflict review without creating queues."
      : "Keep offline behavior limited to user feedback metadata unless future evidence requires more.",
    authSessionPosture: input.authNeeds?.length
      ? "Represent session posture and protected state boundaries without credentials or runtime auth."
      : "Keep auth/session state out of scope unless future app metadata requires it.",
    formStatePosture: "Represent validation, dirty state, submit readiness, recovery, and draft posture as metadata.",
    optimisticUpdatePosture: input.safetyNeeds?.length || input.monetizationNeeds?.length
      ? "Require review before future optimistic updates in safety or monetization flows."
      : "Allow reversible optimistic feedback only as future-gated metadata.",
    errorStatePosture: "Link loading, empty, error, offline, and partial states to UX Pattern Catalog state references.",
    riskLevel,
    requiredApprovals,
    recommendedNextStep: {
      nextStepId: "mobile_state_next_step:126B",
      title: "Plan offline, cache, and sync strategy",
      safeSummary: "Continue with Phase 126B to deepen offline/cache/sync policy after state ownership metadata is stable.",
      priority: riskLevel,
      decisionMode: "plan_only",
      riskSurfaces: ["scaffold", "security_policy", "provider", "store"],
      recommendationOnly: true,
      noExecution: true,
    },
    safetyBoundaries: {
      advisoryOnly: true,
      metadataOnly: true,
      noStorageImplementation: true,
      noApiCalls: true,
      noRuntimeExecution: true,
    },
  };
}

export function summarizeMobileStateManagementStrategy(
  strategy: Pick<
    MobileStateManagementStrategy,
    "strategyId" | "appType" | "stateOwnership" | "cacheSyncModel" | "safetyBoundaries"
  >,
): MobileStateManagementSummary {
  const stateCategories = uniqueCategories(strategy.stateOwnership.map((state) => state.stateType));
  const ownerLayers = [...new Set(strategy.stateOwnership.map((state) => state.ownerLayer))];
  const riskLevel = highestRisk([...strategy.stateOwnership.map((state) => state.riskLevel), strategy.cacheSyncModel.riskLevel]);

  return {
    strategyId: strategy.strategyId,
    appType: strategy.appType,
    stateOwnershipCount: strategy.stateOwnership.length,
    stateCategories,
    ownerLayers,
    highestRiskLevel: riskLevel,
    requiredApprovalCount: new Set(strategy.stateOwnership.flatMap((state) => state.requiredApprovals)).size,
    cacheStrategy: strategy.cacheSyncModel.cacheStrategy,
    dataFreshnessLevel: strategy.cacheSyncModel.dataFreshnessLevel,
    recommendedNextPhase: "Phase 126B - OFFLINE / CACHE / SYNC STRATEGY PLAN",
    safeSummary:
      "Mobile State Management Strategy is source-only advisory metadata for future state ownership, cache/sync posture, offline behavior, auth/session posture, forms, navigation state, optimistic updates, and error/loading/empty UX.",
    safetyBoundaries: strategy.safetyBoundaries,
  };
}

export function selectMobileStatesByCategory(
  strategyOrStates: MobileStateManagementStrategy | readonly MobileStateOwnership[],
  category: MobileStateCategory,
): MobileStateOwnership[] {
  const states = isMobileStateManagementStrategy(strategyOrStates)
    ? strategyOrStates.stateOwnership
    : strategyOrStates;
  return states.filter((state) => state.stateType === category);
}

export function selectMobileStatesByOwnerLayer(
  strategyOrStates: MobileStateManagementStrategy | readonly MobileStateOwnership[],
  ownerLayer: MobileStateOwnerLayer,
): MobileStateOwnership[] {
  const states = isMobileStateManagementStrategy(strategyOrStates)
    ? strategyOrStates.stateOwnership
    : strategyOrStates;
  return states.filter((state) => state.ownerLayer === ownerLayer);
}

function isMobileStateManagementStrategy(
  strategyOrStates: MobileStateManagementStrategy | readonly MobileStateOwnership[],
): strategyOrStates is MobileStateManagementStrategy {
  return !Array.isArray(strategyOrStates);
}
