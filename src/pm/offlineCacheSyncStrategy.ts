import type {
  MobileAppFactoryAppType,
  MobileAppFactoryIntake,
  MobileAppFactoryStrategy,
  MobileReleaseTarget,
} from "./mobileAppFactoryStrategy.js";
import type { MobileArchitectureProfile } from "./mobileArchitectureProfile.js";
import type { MobileNavigationFlowModel } from "./mobileNavigationFlowModel.js";
import type {
  MobileCacheStrategy,
  MobileDataFreshnessLevel,
  MobileStateManagementStrategy,
} from "./mobileStateManagementStrategy.js";
import type { MobileUxPatternCatalog } from "./mobileUxPatternCatalog.js";
import type { PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type OfflineQueueOperationType =
  | "draft_save"
  | "form_submit_future"
  | "profile_update_future"
  | "message_send_future"
  | "booking_request_future"
  | "marketplace_action_future"
  | "field_ops_update_future"
  | "safety_report_future"
  | "preference_change_future"
  | "analytics_event_future";

export type OfflineQueuePriority = "low" | "normal" | "high" | "critical_review_required";

export type OfflineRetryPolicy =
  | "none"
  | "manual_retry"
  | "limited_retry_future"
  | "retry_after_connectivity_future"
  | "retry_after_session_review"
  | "retry_after_user_confirmation"
  | "retry_denied_high_risk";

export type OfflineConflictPolicy =
  | "none_expected"
  | "block_if_remote_changed"
  | "require_user_confirmation"
  | "require_human_review"
  | "discard_draft_with_explanation"
  | "rollback_optimistic_feedback"
  | "escalate_pm_risk";

export type SyncConflictType =
  | "stale_read"
  | "concurrent_edit"
  | "deleted_remote"
  | "permission_changed"
  | "auth_session_changed"
  | "version_mismatch"
  | "inventory_changed"
  | "booking_changed"
  | "premium_entitlement_changed"
  | "safety_status_changed"
  | "provider_state_changed";

export type SyncDetectionStrategy =
  | "version_marker_future"
  | "freshness_window_future"
  | "route_reentry_review"
  | "submit_time_review"
  | "auth_session_boundary_review"
  | "human_review_required"
  | "blocked_high_risk";

export type SyncResolutionStrategy =
  | "preserve_local_draft_for_review"
  | "prefer_remote_state"
  | "merge_requires_user_decision"
  | "retry_after_user_confirmation"
  | "rollback_optimistic_feedback"
  | "block_until_human_review"
  | "escalate_pm_risk";

export interface OfflineCacheSyncSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noStorageImplementation: true;
  noNamedStorageAdapterImplementation: true;
  noApiCalls: true;
  noNetworkCalls: true;
  noQueueExecution: true;
  noScheduledWorkers: true;
  noAuthSessionRuntime: true;
  noProviderCalls: true;
  noDbSqlMutation: true;
  noAppGeneration: true;
  noMobileToolingExecution: true;
  noExpoEasExecution: true;
  noPackageChanges: true;
  noCiActivation: true;
  noMemoryPersistence: true;
  noGitAutomationFromSource: true;
}

export interface OfflineQueueModel {
  queueId: string;
  queueName: string;
  operationType: OfflineQueueOperationType;
  targetEntity: string;
  priority: OfflineQueuePriority;
  retryPolicy: OfflineRetryPolicy;
  maxRetries: number;
  conflictPolicy: OfflineConflictPolicy;
  userFeedbackPattern: string;
  requiresAuth: boolean;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  safetyBoundaries: Pick<
    OfflineCacheSyncSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noStorageImplementation" | "noQueueExecution" | "noNetworkCalls"
  >;
}

export interface CacheStrategyModel {
  cacheId: string;
  cacheName: string;
  dataDomain: string;
  cacheStrategy: MobileCacheStrategy;
  invalidationPolicy: string;
  refreshPolicy: string;
  freshnessWindow: string;
  staleDataBehavior: string;
  offlineReadable: boolean;
  offlineWritable: boolean;
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    OfflineCacheSyncSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noStorageImplementation" | "noApiCalls" | "noNetworkCalls"
  >;
}

export interface SyncConflictResolutionModel {
  conflictId: string;
  sourceEntity: string;
  conflictType: SyncConflictType;
  detectionStrategy: SyncDetectionStrategy;
  resolutionStrategy: SyncResolutionStrategy;
  userDecisionRequired: boolean;
  rollbackHint: string;
  auditHint: string;
  recoveryAction: string;
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    OfflineCacheSyncSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noApiCalls" | "noNetworkCalls" | "noStorageImplementation"
  >;
}

export interface OfflineCacheSyncRecommendation {
  recommendationId: string;
  appType: MobileAppFactoryAppType;
  offlinePosture: string;
  cachePosture: string;
  syncPosture: string;
  retryBackoffPosture: string;
  freshnessPosture: MobileDataFreshnessLevel;
  uxRecoveryPosture: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<
    OfflineCacheSyncSafetyBoundaries,
    "advisoryOnly" | "metadataOnly" | "noStorageImplementation" | "noApiCalls" | "noQueueExecution"
  >;
}

export interface OfflineCacheSyncSummary {
  strategyId: string;
  appType: MobileAppFactoryAppType;
  queueCount: number;
  cacheStrategyCount: number;
  conflictModelCount: number;
  offlineWritableCount: number;
  authRequiredQueueCount: number;
  highestRiskLevel: PMRiskTier;
  requiredApprovalCount: number;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: OfflineCacheSyncSafetyBoundaries;
}

export interface OfflineCacheSyncStrategy {
  strategyId: string;
  phaseRef: ProjectPhaseRef;
  appType: MobileAppFactoryAppType;
  releaseTarget: MobileReleaseTarget | undefined;
  dataDomains: readonly string[];
  offlineNeeds: readonly string[];
  authNeeds: readonly string[];
  safetyNeeds: readonly string[];
  monetizationNeeds: readonly string[];
  offlineQueues: readonly OfflineQueueModel[];
  cacheStrategies: readonly CacheStrategyModel[];
  conflictModels: readonly SyncConflictResolutionModel[];
  recommendation: OfflineCacheSyncRecommendation;
  summary: OfflineCacheSyncSummary;
  limitations: readonly string[];
  consumedStateMetadata: readonly string[];
  consumedUxMetadata: readonly string[];
  consumedNavigationMetadata: readonly string[];
  consumedArchitectureMetadata: readonly string[];
  pmSolidAutopilotIntegration: readonly string[];
  conversationalBuildLoopReadiness: readonly string[];
  safetyBoundaries: OfflineCacheSyncSafetyBoundaries;
}

export interface OfflineCacheSyncInput {
  strategyId?: string;
  phaseRef?: ProjectPhaseRef;
  appType?: MobileAppFactoryAppType;
  releaseTarget?: MobileReleaseTarget | undefined;
  dataDomains?: readonly string[];
  offlineNeeds?: readonly string[];
  authNeeds?: readonly string[];
  safetyNeeds?: readonly string[];
  monetizationNeeds?: readonly string[];
  offlineQueues?: readonly OfflineQueueModel[];
  cacheStrategies?: readonly CacheStrategyModel[];
  conflictModels?: readonly SyncConflictResolutionModel[];
  riskLevel?: PMRiskTier;
  requiredApprovals?: readonly string[];
  limitations?: readonly string[];
  factoryIntake?: MobileAppFactoryIntake;
  factoryStrategy?: MobileAppFactoryStrategy;
  stateStrategy?: MobileStateManagementStrategy;
  navigationFlow?: MobileNavigationFlowModel;
  uxPatternCatalog?: MobileUxPatternCatalog;
  architectureProfile?: MobileArchitectureProfile;
}

const safetyBoundaries: OfflineCacheSyncSafetyBoundaries = {
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noStorageImplementation: true,
  noNamedStorageAdapterImplementation: true,
  noApiCalls: true,
  noNetworkCalls: true,
  noQueueExecution: true,
  noScheduledWorkers: true,
  noAuthSessionRuntime: true,
  noProviderCalls: true,
  noDbSqlMutation: true,
  noAppGeneration: true,
  noMobileToolingExecution: true,
  noExpoEasExecution: true,
  noPackageChanges: true,
  noCiActivation: true,
  noMemoryPersistence: true,
  noGitAutomationFromSource: true,
};

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function highestRisk(risks: readonly PMRiskTier[]): PMRiskTier {
  if (risks.includes("critical")) return "critical";
  if (risks.includes("high")) return "high";
  if (risks.includes("medium")) return "medium";
  return "low";
}

function appTypeFromInput(input: OfflineCacheSyncInput): MobileAppFactoryAppType {
  return (
    input.appType ??
    input.factoryIntake?.supportedAppType ??
    input.factoryStrategy?.appType ??
    input.stateStrategy?.appType ??
    input.navigationFlow?.appType ??
    input.uxPatternCatalog?.appTypes[0] ??
    input.architectureProfile?.appType ??
    "unknown_mobile_app"
  );
}

function releaseTargetFromInput(input: OfflineCacheSyncInput): MobileReleaseTarget | undefined {
  return (
    input.releaseTarget ??
    input.factoryIntake?.releaseTarget ??
    input.factoryStrategy?.intake.releaseTarget ??
    input.stateStrategy?.releaseTarget
  );
}

function valuesFromInput(input: OfflineCacheSyncInput, key: "offlineNeeds" | "authNeeds" | "safetyNeeds" | "monetizationNeeds"): string[] {
  return uniqueStrings([
    ...(input[key] ?? []),
    ...(input.factoryIntake?.[key] ?? []),
    ...(input.stateStrategy?.[key] ?? []),
    ...(input.uxPatternCatalog?.[key] ?? []),
  ]);
}

function dataDomainsFromInput(input: OfflineCacheSyncInput): string[] {
  return uniqueStrings([
    ...(input.dataDomains ?? []),
    ...(input.stateStrategy?.dataModelSummary ? [input.stateStrategy.dataModelSummary] : []),
    ...(input.factoryIntake?.dataModelSummary ? [input.factoryIntake.dataModelSummary] : []),
    ...(input.navigationFlow?.routes.map((route) => route.routeName) ?? []),
  ]).slice(0, 8);
}

function deriveRisk(input: OfflineCacheSyncInput): PMRiskTier {
  const signals = [
    ...(input.offlineNeeds ?? []),
    ...(input.authNeeds ?? []),
    ...(input.safetyNeeds ?? []),
    ...(input.monetizationNeeds ?? []),
    ...(input.stateStrategy?.safetyNeeds ?? []),
    ...(input.stateStrategy?.monetizationNeeds ?? []),
  ].join(" ");

  if (input.riskLevel === "critical" || /payment|identity|safety|abuse|inventory|booking/i.test(signals)) {
    return "critical";
  }

  if (input.riskLevel === "high" || /auth|session|offline|sync|premium|queue|marketplace/i.test(signals)) {
    return "high";
  }

  if (input.riskLevel === "medium" || /draft|cache|profile|form/i.test(signals)) {
    return "medium";
  }

  return "low";
}

const queueSafety = (): OfflineQueueModel["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noStorageImplementation: true,
  noQueueExecution: true,
  noNetworkCalls: true,
});

const cacheSafety = (): CacheStrategyModel["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noStorageImplementation: true,
  noApiCalls: true,
  noNetworkCalls: true,
});

const conflictSafety = (): SyncConflictResolutionModel["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noApiCalls: true,
  noNetworkCalls: true,
  noStorageImplementation: true,
});

export function createOfflineQueueModel(
  model: Omit<OfflineQueueModel, "safetyBoundaries"> & {
    safetyBoundaries?: OfflineQueueModel["safetyBoundaries"];
  },
): OfflineQueueModel {
  return {
    ...model,
    requiredApprovals: [...model.requiredApprovals],
    limitations: [...model.limitations],
    safetyBoundaries: model.safetyBoundaries ?? queueSafety(),
  };
}

export function createCacheStrategyModel(
  model: Omit<CacheStrategyModel, "safetyBoundaries"> & {
    safetyBoundaries?: CacheStrategyModel["safetyBoundaries"];
  },
): CacheStrategyModel {
  return {
    ...model,
    safetyBoundaries: model.safetyBoundaries ?? cacheSafety(),
  };
}

export function createSyncConflictResolutionModel(
  model: Omit<SyncConflictResolutionModel, "safetyBoundaries"> & {
    safetyBoundaries?: SyncConflictResolutionModel["safetyBoundaries"];
  },
): SyncConflictResolutionModel {
  return {
    ...model,
    safetyBoundaries: model.safetyBoundaries ?? conflictSafety(),
  };
}

function defaultQueues(input: OfflineCacheSyncInput): OfflineQueueModel[] {
  const offlineNeeds = valuesFromInput(input, "offlineNeeds");
  const safetyNeeds = valuesFromInput(input, "safetyNeeds");
  const monetizationNeeds = valuesFromInput(input, "monetizationNeeds");
  const authNeeds = valuesFromInput(input, "authNeeds");

  return [
    createOfflineQueueModel({
      queueId: "offline-queue:draft-save",
      queueName: "Draft Save Queue Metadata",
      operationType: "draft_save",
      targetEntity: "future_draft_entity",
      priority: "normal",
      retryPolicy: "manual_retry",
      maxRetries: 1,
      conflictPolicy: "discard_draft_with_explanation",
      userFeedbackPattern: "Show draft saved locally as future metadata with explicit recovery copy.",
      requiresAuth: authNeeds.length > 0,
      riskLevel: "medium",
      requiredApprovals: [],
      limitations: ["Queue metadata does not persist drafts or deliver operations."],
    }),
    createOfflineQueueModel({
      queueId: "offline-queue:form-submit",
      queueName: "Form Submit Queue Metadata",
      operationType: "form_submit_future",
      targetEntity: "future_form_submission",
      priority: offlineNeeds.length > 0 ? "high" : "normal",
      retryPolicy: offlineNeeds.length > 0 ? "retry_after_user_confirmation" : "manual_retry",
      maxRetries: offlineNeeds.length > 0 ? 1 : 0,
      conflictPolicy: "require_user_confirmation",
      userFeedbackPattern: "Show pending submit feedback and allow cancellation or manual retry.",
      requiresAuth: authNeeds.length > 0,
      riskLevel: offlineNeeds.length > 0 ? "high" : "medium",
      requiredApprovals: offlineNeeds.length > 0 ? ["offline_submit_review"] : [],
      limitations: ["Submit queue posture is future-gated and does not call APIs."],
    }),
    createOfflineQueueModel({
      queueId: "offline-queue:safety-or-premium",
      queueName: "High Risk Queue Metadata",
      operationType: safetyNeeds.length > 0 ? "safety_report_future" : "marketplace_action_future",
      targetEntity: safetyNeeds.length > 0 ? "future_safety_report" : "future_premium_or_marketplace_entity",
      priority: "critical_review_required",
      retryPolicy: "retry_denied_high_risk",
      maxRetries: 0,
      conflictPolicy: "require_human_review",
      userFeedbackPattern: "Block high-risk queued intent and show review-required recovery copy.",
      requiresAuth: true,
      riskLevel: safetyNeeds.length > 0 || monetizationNeeds.length > 0 ? "critical" : "high",
      requiredApprovals: uniqueStrings([
        ...(safetyNeeds.length > 0 ? ["safety_offline_review"] : []),
        ...(monetizationNeeds.length > 0 ? ["premium_or_marketplace_offline_review"] : []),
      ]),
      limitations: ["High-risk queue metadata must not become automatic delivery behavior."],
    }),
  ];
}

function defaultCaches(input: OfflineCacheSyncInput): CacheStrategyModel[] {
  const domains = dataDomainsFromInput(input);
  const offlineNeeds = valuesFromInput(input, "offlineNeeds");
  const primaryDomain = domains[0] ?? "future_mobile_data";

  return [
    createCacheStrategyModel({
      cacheId: "cache:primary-read-model",
      cacheName: "Primary Read Model Cache Metadata",
      dataDomain: primaryDomain,
      cacheStrategy: offlineNeeds.length > 0 ? "offline_first_read_model_future" : "repository_scoped_future",
      invalidationPolicy: "Route-entry and mutation-result invalidation posture as metadata only.",
      refreshPolicy: offlineNeeds.length > 0 ? "Foreground refresh posture with visible stale label." : "Route-entry refresh posture.",
      freshnessWindow: offlineNeeds.length > 0 ? "stale_ok_with_label" : "fresh_on_open",
      staleDataBehavior: "Show stale data label and recovery affordance.",
      offlineReadable: offlineNeeds.length > 0,
      offlineWritable: false,
      riskLevel: offlineNeeds.length > 0 ? "high" : "medium",
    }),
    createCacheStrategyModel({
      cacheId: "cache:draft-or-form",
      cacheName: "Draft Or Form Cache Metadata",
      dataDomain: "future_form_or_draft_data",
      cacheStrategy: "feature_scoped_future",
      invalidationPolicy: "Clear draft posture after confirmed future submit or user discard.",
      refreshPolicy: "Manual review posture before retry or submit.",
      freshnessWindow: "human_review_required",
      staleDataBehavior: "Preserve draft copy for review and avoid silent overwrite.",
      offlineReadable: true,
      offlineWritable: offlineNeeds.length > 0,
      riskLevel: offlineNeeds.length > 0 ? "high" : "medium",
    }),
  ];
}

function defaultConflicts(input: OfflineCacheSyncInput): SyncConflictResolutionModel[] {
  const riskLevel = deriveRisk(input);
  const safetyNeeds = valuesFromInput(input, "safetyNeeds");
  const monetizationNeeds = valuesFromInput(input, "monetizationNeeds");

  return [
    createSyncConflictResolutionModel({
      conflictId: "sync-conflict:stale-read",
      sourceEntity: "future_cached_read_model",
      conflictType: "stale_read",
      detectionStrategy: "freshness_window_future",
      resolutionStrategy: "prefer_remote_state",
      userDecisionRequired: false,
      rollbackHint: "Replace stale copy after explicit future refresh confirmation.",
      auditHint: "Record conflict category as metadata only in future review context.",
      recoveryAction: "Show stale label and manual refresh affordance.",
      riskLevel: "medium",
    }),
    createSyncConflictResolutionModel({
      conflictId: "sync-conflict:concurrent-edit",
      sourceEntity: "future_editable_entity",
      conflictType: "concurrent_edit",
      detectionStrategy: "submit_time_review",
      resolutionStrategy: "merge_requires_user_decision",
      userDecisionRequired: true,
      rollbackHint: "Keep local draft visible until user chooses a recovery path.",
      auditHint: "Capture attempted operation category as future metadata only.",
      recoveryAction: "Ask user to review changes before retry.",
      riskLevel,
    }),
    createSyncConflictResolutionModel({
      conflictId: "sync-conflict:high-risk",
      sourceEntity: safetyNeeds.length > 0 ? "future_safety_entity" : "future_premium_or_provider_entity",
      conflictType: safetyNeeds.length > 0 ? "safety_status_changed" : monetizationNeeds.length > 0 ? "premium_entitlement_changed" : "provider_state_changed",
      detectionStrategy: "blocked_high_risk",
      resolutionStrategy: "block_until_human_review",
      userDecisionRequired: true,
      rollbackHint: "Do not apply optimistic feedback for high-risk conflict metadata.",
      auditHint: "Escalate as PM risk candidate in future reporting.",
      recoveryAction: "Block action and route user to review/support path.",
      riskLevel: riskLevel === "low" ? "high" : riskLevel,
    }),
  ];
}

export function recommendOfflineCacheSyncStrategy(input: OfflineCacheSyncInput = {}): OfflineCacheSyncRecommendation {
  const appType = appTypeFromInput(input);
  const queues = input.offlineQueues ?? defaultQueues(input);
  const caches = input.cacheStrategies ?? defaultCaches(input);
  const conflicts = input.conflictModels ?? defaultConflicts(input);
  const riskLevel = highestRisk([
    deriveRisk(input),
    ...queues.map((queue) => queue.riskLevel),
    ...caches.map((cache) => cache.riskLevel),
    ...conflicts.map((conflict) => conflict.riskLevel),
  ]);
  const requiredApprovals = uniqueStrings([
    ...(input.requiredApprovals ?? []),
    ...queues.flatMap((queue) => queue.requiredApprovals),
    ...(caches.some((cache) => cache.offlineWritable) ? ["offline_writable_cache_review"] : []),
    ...(conflicts.some((conflict) => conflict.userDecisionRequired) ? ["sync_conflict_review"] : []),
  ]);
  const freshnessPosture: MobileDataFreshnessLevel = caches.some((cache) => cache.offlineWritable)
    ? "human_review_required"
    : caches.some((cache) => cache.offlineReadable)
      ? "stale_ok_with_label"
      : "fresh_on_open";

  return {
    recommendationId: `offline-cache-sync:${appType}`,
    appType,
    offlinePosture: queues.length > 0 ? "Model offline read, draft, and queued intent posture as future-gated metadata." : "Offline behavior can remain read-only metadata until product evidence expands.",
    cachePosture: "Keep cache scope behind repository and service boundaries as advisory metadata.",
    syncPosture: "Prefer explicit conflict review and user recovery copy before future sync behavior.",
    retryBackoffPosture: "Represent retry and backoff as policy metadata only; do not create timers or workers.",
    freshnessPosture,
    uxRecoveryPosture: "Map stale, offline, queued, retry, conflict, rollback, and blocked copy to UX screen state metadata.",
    riskLevel,
    requiredApprovals,
    recommendedNextStep: {
      nextStepId: "offline_cache_sync_next_step:127B",
      title: "Plan mobile security baseline",
      safeSummary: "Continue with Phase 127B to define mobile security baseline after offline/cache/sync metadata is stable.",
      priority: riskLevel,
      decisionMode: "plan_only",
      riskSurfaces: ["security_policy", "provider", "store", "database_schema"],
      recommendationOnly: true,
      noExecution: true,
    },
    safetyBoundaries: {
      advisoryOnly: true,
      metadataOnly: true,
      noStorageImplementation: true,
      noApiCalls: true,
      noQueueExecution: true,
    },
  };
}

export function createOfflineCacheSyncStrategy(input: OfflineCacheSyncInput = {}): OfflineCacheSyncStrategy {
  const appType = appTypeFromInput(input);
  const releaseTarget = releaseTargetFromInput(input);
  const offlineNeeds = valuesFromInput(input, "offlineNeeds");
  const authNeeds = valuesFromInput(input, "authNeeds");
  const safetyNeeds = valuesFromInput(input, "safetyNeeds");
  const monetizationNeeds = valuesFromInput(input, "monetizationNeeds");
  const offlineQueues = input.offlineQueues ? [...input.offlineQueues] : defaultQueues({ ...input, offlineNeeds, authNeeds, safetyNeeds, monetizationNeeds });
  const cacheStrategies = input.cacheStrategies ? [...input.cacheStrategies] : defaultCaches({ ...input, offlineNeeds, authNeeds, safetyNeeds, monetizationNeeds });
  const conflictModels = input.conflictModels ? [...input.conflictModels] : defaultConflicts({ ...input, offlineNeeds, authNeeds, safetyNeeds, monetizationNeeds });
  const recommendation = recommendOfflineCacheSyncStrategy({
    ...input,
    appType,
    releaseTarget,
    offlineNeeds,
    authNeeds,
    safetyNeeds,
    monetizationNeeds,
    offlineQueues,
    cacheStrategies,
    conflictModels,
  });
  const strategyBase = {
    strategyId: input.strategyId ?? `offline-cache-sync:${appType}`,
    phaseRef: input.phaseRef ?? "Phase 126I",
    appType,
    releaseTarget,
    dataDomains: dataDomainsFromInput(input),
    offlineNeeds,
    authNeeds,
    safetyNeeds,
    monetizationNeeds,
    offlineQueues,
    cacheStrategies,
    conflictModels,
    recommendation,
    limitations: [
      "No storage adapters, API clients, queue processors, workers, providers, apps, or mobile tooling are created.",
      "Offline writes, sync behavior, and conflict handling remain future-gated and approval-dependent.",
      ...(input.limitations ?? []),
    ],
    consumedStateMetadata: [
      "offline queue state",
      "sync conflict state",
      "optimistic update state",
      "server cache state",
      "error/loading/empty state",
    ],
    consumedUxMetadata: [
      "offline state",
      "loading state",
      "error state",
      "partial data state",
      "retry and recovery copy",
    ],
    consumedNavigationMetadata: [
      "offline routes",
      "fallback routes",
      "protected routes",
      "auth/session gates",
      "deep link recovery posture",
    ],
    consumedArchitectureMetadata: [
      "repositories",
      "services",
      "state",
      "config",
      "tests",
      "security review boundaries",
    ],
    pmSolidAutopilotIntegration: [
      "PM reports may summarize offline/cache/sync risks and approval posture.",
      "SOLID review may inspect separation between state, repository, service, UX, and navigation responsibilities.",
      "Autopilot may carry the strategy as handoff and dry-run metadata only.",
    ],
    conversationalBuildLoopReadiness: [
      "Maps a simple idea to offline requirements and stale data posture.",
      "Highlights cache, queue, conflict, retry, and recovery UX obligations.",
      "Provides prompt context for future implementation without automating it.",
    ],
    safetyBoundaries,
  } satisfies Omit<OfflineCacheSyncStrategy, "summary">;

  return {
    ...strategyBase,
    summary: summarizeOfflineCacheSyncStrategy(strategyBase),
  };
}

export function summarizeOfflineCacheSyncStrategy(
  strategy: Pick<
    OfflineCacheSyncStrategy,
    "strategyId" | "appType" | "offlineQueues" | "cacheStrategies" | "conflictModels" | "safetyBoundaries"
  >,
): OfflineCacheSyncSummary {
  const riskLevel = highestRisk([
    ...strategy.offlineQueues.map((queue) => queue.riskLevel),
    ...strategy.cacheStrategies.map((cache) => cache.riskLevel),
    ...strategy.conflictModels.map((conflict) => conflict.riskLevel),
  ]);
  const requiredApprovals = uniqueStrings([
    ...strategy.offlineQueues.flatMap((queue) => queue.requiredApprovals),
    ...(strategy.cacheStrategies.some((cache) => cache.offlineWritable) ? ["offline_writable_cache_review"] : []),
    ...(strategy.conflictModels.some((conflict) => conflict.userDecisionRequired) ? ["sync_conflict_review"] : []),
  ]);

  return {
    strategyId: strategy.strategyId,
    appType: strategy.appType,
    queueCount: strategy.offlineQueues.length,
    cacheStrategyCount: strategy.cacheStrategies.length,
    conflictModelCount: strategy.conflictModels.length,
    offlineWritableCount: strategy.cacheStrategies.filter((cache) => cache.offlineWritable).length,
    authRequiredQueueCount: strategy.offlineQueues.filter((queue) => queue.requiresAuth).length,
    highestRiskLevel: riskLevel,
    requiredApprovalCount: requiredApprovals.length,
    recommendedNextPhase: "Phase 127B - MOBILE SECURITY BASELINE PLAN",
    safeSummary:
      "Offline / Cache / Sync Strategy is source-only advisory metadata for future offline queues, cache policy, retry posture, sync conflicts, data freshness, and UX recovery.",
    safetyBoundaries: strategy.safetyBoundaries,
  };
}

export function selectQueuesByOperationType(
  strategyOrQueues: OfflineCacheSyncStrategy | readonly OfflineQueueModel[],
  operationType: OfflineQueueOperationType,
): OfflineQueueModel[] {
  const queues = isOfflineCacheSyncStrategy(strategyOrQueues) ? strategyOrQueues.offlineQueues : strategyOrQueues;
  return queues.filter((queue) => queue.operationType === operationType);
}

export function selectCacheStrategiesByDomain(
  strategyOrCaches: OfflineCacheSyncStrategy | readonly CacheStrategyModel[],
  dataDomain: string,
): CacheStrategyModel[] {
  const caches = isOfflineCacheSyncStrategy(strategyOrCaches) ? strategyOrCaches.cacheStrategies : strategyOrCaches;
  return caches.filter((cache) => cache.dataDomain === dataDomain);
}

function isOfflineCacheSyncStrategy(
  strategyOrItems: OfflineCacheSyncStrategy | readonly OfflineQueueModel[] | readonly CacheStrategyModel[],
): strategyOrItems is OfflineCacheSyncStrategy {
  return !Array.isArray(strategyOrItems);
}
