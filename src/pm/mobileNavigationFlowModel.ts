import type {
  MobileAppFactoryAppType,
  MobileAppFactoryIntake,
  MobileAppFactoryStrategy,
  MobileReleaseTarget,
  MobileScreenMapItem,
} from "./mobileAppFactoryStrategy.js";
import type { MobileArchitectureProfile } from "./mobileArchitectureProfile.js";
import type {
  MobileScreenStatePattern,
  MobileUxPattern,
  MobileUxPatternCatalog,
} from "./mobileUxPatternCatalog.js";
import type { PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type MobileNavigationPattern =
  | "tab_first"
  | "stack_first"
  | "auth_gate"
  | "onboarding_gate"
  | "role_based"
  | "modal_overlay"
  | "deep_link_enabled"
  | "marketplace_browse_detail"
  | "chat_thread"
  | "gamified_progress"
  | "dashboard_companion"
  | "settings_profile";

export type MobileRouteType =
  | "tab"
  | "stack"
  | "modal"
  | "public"
  | "protected"
  | "auth"
  | "onboarding"
  | "role_based"
  | "deep_link_entry"
  | "fallback"
  | "settings"
  | "paywall"
  | "offline_sync"
  | "safety"
  | "notification_entry";

export type MobileRouteGroupId =
  | "public"
  | "auth"
  | "main"
  | "detail"
  | "modal"
  | "settings"
  | "safety"
  | "offline"
  | "paywall"
  | "fallback";

export type MobileNavigationStateType =
  | "initializing"
  | "session_restoring"
  | "public_entry"
  | "onboarding_required"
  | "auth_required"
  | "authorized"
  | "role_denied"
  | "permission_denied"
  | "deep_link_resolving"
  | "deep_link_not_found"
  | "offline_recovery"
  | "sync_pending"
  | "paywall_required"
  | "modal_open"
  | "modal_dismissed"
  | "safety_flow"
  | "fallback"
  | "blocked";

export type MobileNavigationGuard =
  | "auth_required"
  | "role_required"
  | "permission_required"
  | "onboarding_required"
  | "subscription_required"
  | "network_required"
  | "safe_mode_required"
  | "resource_exists";

export interface MobileNavigationSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noRouteFileGeneration: true;
  noScreenGeneration: true;
  noComponentGeneration: true;
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

export interface MobileRouteParamModel {
  paramId: string;
  paramName: string;
  expectedShape: string;
  optional: boolean;
  sensitive: boolean;
  fallbackBehavior: string;
  userFacingAllowed: boolean;
  metadataOnly: true;
}

export interface MobileDeepLinkModel {
  deepLinkId: string;
  routeId: string;
  aliases: readonly string[];
  protectedEntry: boolean;
  fallbackRoute: string;
  unsupportedBehavior: string;
  riskLevel: PMRiskTier;
  metadataOnly: true;
  advisoryOnly: true;
  noNativeLinkingConfig: true;
}

export interface MobileRouteModel {
  routeId: string;
  routeName: string;
  routePath: string;
  routeType: MobileRouteType;
  parentRouteId: string | null;
  screenPatternRefs: readonly string[];
  requiredAuth: boolean;
  allowedRoles: readonly string[];
  requiredPermissions: readonly string[];
  params: readonly MobileRouteParamModel[];
  deepLinkAliases: readonly string[];
  guards: readonly MobileNavigationGuard[];
  fallbackRoute: string | null;
  loadingStateRef: string;
  emptyStateRef: string;
  errorStateRef: string;
  accessibilityNotes: readonly string[];
  safetyNotes: readonly string[];
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    MobileNavigationSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noRouteFileGeneration" | "noRuntimeExecution"
  >;
}

export interface MobileRouteGroup {
  groupId: MobileRouteGroupId;
  title: string;
  purpose: string;
  routeIds: readonly string[];
  defaultRouteId: string;
  requiresAuth: boolean;
  riskLevel: PMRiskTier;
  safetyNotes: readonly string[];
  metadataOnly: true;
  advisoryOnly: true;
  noRouteFileGeneration: true;
}

export interface MobileNavigationState {
  stateId: string;
  stateType: MobileNavigationStateType;
  trigger: string;
  currentRoute: string;
  nextRoute: string;
  guardCondition: string;
  fallbackBehavior: string;
  userMessage: string;
  recoveryAction: string;
  analyticsHint: string;
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    MobileNavigationSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noRouteFileGeneration" | "noRuntimeExecution"
  >;
}

export interface MobileNavigationRecommendation {
  recommendationId: string;
  appType: MobileAppFactoryAppType;
  navigationPatterns: readonly MobileNavigationPattern[];
  recommendedRootNavigator: string;
  initialRoute: string;
  routeGroupIds: readonly MobileRouteGroupId[];
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<
    MobileNavigationSafetyBoundaries,
    "advisoryOnly" | "metadataOnly" | "noRouteFileGeneration" | "noAppGeneration"
  >;
}

export interface MobileNavigationSummary {
  flowId: string;
  appType: MobileAppFactoryAppType;
  routeCount: number;
  routeGroupCount: number;
  protectedRouteCount: number;
  deepLinkCount: number;
  navigationStateCount: number;
  navigationPatterns: readonly MobileNavigationPattern[];
  highestRiskLevel: PMRiskTier;
  requiredApprovalCount: number;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: MobileNavigationSafetyBoundaries;
}

export interface MobileNavigationFlowModel {
  flowId: string;
  phaseRef: ProjectPhaseRef;
  appType: MobileAppFactoryAppType;
  navigationPattern: readonly MobileNavigationPattern[];
  rootNavigator: string;
  routeGroups: readonly MobileRouteGroup[];
  authRequiredRoutes: readonly MobileRouteModel[];
  publicRoutes: readonly MobileRouteModel[];
  protectedRoutes: readonly MobileRouteModel[];
  roleBasedRoutes: readonly MobileRouteModel[];
  modalRoutes: readonly MobileRouteModel[];
  deepLinks: readonly MobileDeepLinkModel[];
  fallbackRoutes: readonly MobileRouteModel[];
  initialRoute: string;
  sessionRestoreStrategy: string;
  routes: readonly MobileRouteModel[];
  navigationStates: readonly MobileNavigationState[];
  recommendation: MobileNavigationRecommendation;
  summary: MobileNavigationSummary;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  consumedFactoryMetadata: readonly string[];
  consumedArchitectureMetadata: readonly string[];
  consumedUxPatternMetadata: readonly string[];
  conversationalBuildLoopReadiness: readonly string[];
  safetyBoundaries: MobileNavigationSafetyBoundaries;
}

export interface MobileNavigationFlowInput {
  flowId?: string;
  phaseRef?: ProjectPhaseRef;
  appType?: MobileAppFactoryAppType;
  rootNavigator?: string;
  navigationPatterns?: readonly MobileNavigationPattern[];
  routes?: readonly MobileRouteModel[];
  routeGroups?: readonly MobileRouteGroup[];
  navigationStates?: readonly MobileNavigationState[];
  deepLinks?: readonly MobileDeepLinkModel[];
  initialRoute?: string;
  sessionRestoreStrategy?: string;
  targetUsers?: readonly string[];
  coreFlows?: readonly string[];
  screenMap?: readonly (MobileScreenMapItem | string)[];
  authNeeds?: readonly string[];
  onboardingNeeds?: readonly string[];
  monetizationNeeds?: readonly string[];
  safetyNeeds?: readonly string[];
  roleNeeds?: readonly string[];
  permissionNeeds?: readonly string[];
  releaseTarget?: MobileReleaseTarget;
  architectureLayers?: readonly string[];
  uxPatterns?: readonly MobileUxPattern[];
  screenStatePatterns?: readonly MobileScreenStatePattern[];
  factoryIntake?: MobileAppFactoryIntake;
  factoryStrategy?: MobileAppFactoryStrategy;
  architectureProfile?: MobileArchitectureProfile;
  uxPatternCatalog?: MobileUxPatternCatalog;
  riskLevel?: PMRiskTier;
  requiredApprovals?: readonly string[];
  limitations?: readonly string[];
}

const safetyBoundaries: MobileNavigationSafetyBoundaries = {
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noRouteFileGeneration: true,
  noScreenGeneration: true,
  noComponentGeneration: true,
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

export const mobileNavigationPatternIds: readonly MobileNavigationPattern[] = [
  "tab_first",
  "stack_first",
  "auth_gate",
  "onboarding_gate",
  "role_based",
  "modal_overlay",
  "deep_link_enabled",
  "marketplace_browse_detail",
  "chat_thread",
  "gamified_progress",
  "dashboard_companion",
  "settings_profile",
];

const uniqueStrings = (values: readonly (string | undefined)[]): string[] =>
  [...new Set(values.filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim()))];

const uniquePatterns = (values: readonly (MobileNavigationPattern | undefined)[]): MobileNavigationPattern[] =>
  [...new Set(values.filter((value): value is MobileNavigationPattern => Boolean(value)))];

const routeSafety = (): MobileRouteModel["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noRouteFileGeneration: true,
  noRuntimeExecution: true,
});

function riskWeight(riskLevel: PMRiskTier): number {
  if (riskLevel === "critical") return 4;
  if (riskLevel === "high") return 3;
  if (riskLevel === "medium") return 2;
  return 1;
}

function highestRisk(values: readonly PMRiskTier[]): PMRiskTier {
  return values.reduce<PMRiskTier>((highest, current) => (riskWeight(current) > riskWeight(highest) ? current : highest), "low");
}

function appTypeFromInput(input: MobileNavigationFlowInput): MobileAppFactoryAppType {
  return input.appType ?? input.factoryIntake?.supportedAppType ?? input.factoryStrategy?.appType ?? input.architectureProfile?.appType ?? "unknown_mobile_app";
}

function screenMapFromInput(input: MobileNavigationFlowInput): string[] {
  return uniqueStrings(
    [
      ...(input.screenMap ?? []),
      ...(input.factoryIntake?.screenMap ?? []),
      ...(input.uxPatternCatalog?.screenMap ?? []),
    ].map((screen) => (typeof screen === "string" ? screen : screen.title || screen.screenId)),
  );
}

function needsFromInput(
  input: MobileNavigationFlowInput,
  explicit: readonly string[] | undefined,
  factoryValues: readonly string[] | undefined,
  catalogValues: readonly string[] | undefined,
): string[] {
  return uniqueStrings([...(explicit ?? []), ...(factoryValues ?? []), ...(catalogValues ?? [])]);
}

function defaultRiskFromInput(input: MobileNavigationFlowInput): PMRiskTier {
  if (input.riskLevel) return input.riskLevel;
  if (input.factoryIntake?.riskLevel) return input.factoryIntake.riskLevel;
  if (input.architectureProfile?.riskLevel) return input.architectureProfile.riskLevel;

  const highRiskNeeds = [
    ...needsFromInput(input, input.authNeeds, input.factoryIntake?.authNeeds, input.uxPatternCatalog?.authNeeds),
    ...needsFromInput(input, input.monetizationNeeds, input.factoryIntake?.monetizationNeeds, input.uxPatternCatalog?.monetizationNeeds),
    ...needsFromInput(input, input.safetyNeeds, input.factoryIntake?.safetyNeeds, input.uxPatternCatalog?.safetyNeeds),
    ...(input.roleNeeds ?? []),
    ...(input.permissionNeeds ?? []),
  ];

  if (highRiskNeeds.length > 0) return "high";
  if ((input.factoryIntake?.offlineNeeds.length ?? 0) > 0 || (input.uxPatternCatalog?.offlineNeeds.length ?? 0) > 0) {
    return "medium";
  }
  return "low";
}

function patternsForAppType(appType: MobileAppFactoryAppType, input: MobileNavigationFlowInput): MobileNavigationPattern[] {
  const requested = [...(input.navigationPatterns ?? [])];
  const needsAuth = needsFromInput(input, input.authNeeds, input.factoryIntake?.authNeeds, input.uxPatternCatalog?.authNeeds).length > 0;
  const needsSafety = needsFromInput(input, input.safetyNeeds, input.factoryIntake?.safetyNeeds, input.uxPatternCatalog?.safetyNeeds).length > 0;
  const needsMonetization = needsFromInput(input, input.monetizationNeeds, input.factoryIntake?.monetizationNeeds, input.uxPatternCatalog?.monetizationNeeds).length > 0;
  const needsRoles = (input.roleNeeds?.length ?? 0) > 0;

  const derived: MobileNavigationPattern[] = ["stack_first", "settings_profile"];

  if (appType !== "unknown_mobile_app") derived.push("tab_first");
  if (needsAuth) derived.push("auth_gate");
  if ((input.onboardingNeeds?.length ?? 0) > 0 || appType !== "unknown_mobile_app") derived.push("onboarding_gate");
  if (needsRoles) derived.push("role_based");
  if ((input.factoryIntake?.navigationModel.modalNeeds.length ?? 0) > 0) derived.push("modal_overlay");
  if ((input.factoryIntake?.navigationModel.deepLinkNeeds.length ?? 0) > 0) derived.push("deep_link_enabled");
  if (appType === "marketplace_app") derived.push("marketplace_browse_detail");
  if (appType === "social_freemium_app" || appType === "ai_assistant_mobile_app") derived.push("chat_thread");
  if (appType === "habit_gamified_app" || appType === "education_app") derived.push("gamified_progress");
  if (appType === "dashboard_companion_app" || appType === "erp_mobile_field_ops_app") derived.push("dashboard_companion");
  if (needsSafety || needsMonetization) derived.push("modal_overlay");

  return uniquePatterns([...requested, ...derived]);
}

export function buildDefaultMobileNavigationPatterns(): MobileNavigationPattern[] {
  return [...mobileNavigationPatternIds];
}

export function createMobileRoute(
  route: Omit<MobileRouteModel, "safetyBoundaries"> & { safetyBoundaries?: MobileRouteModel["safetyBoundaries"] },
): MobileRouteModel {
  return {
    ...route,
    screenPatternRefs: [...route["screenPatternRefs"]],
    allowedRoles: [...route.allowedRoles],
    requiredPermissions: [...route.requiredPermissions],
    params: route.params.map((param) => ({ ...param })),
    deepLinkAliases: [...route.deepLinkAliases],
    guards: [...route.guards],
    accessibilityNotes: [...route.accessibilityNotes],
    safetyNotes: [...route.safetyNotes],
    safetyBoundaries: route.safetyBoundaries ?? routeSafety(),
  };
}

export function createMobileNavigationState(
  state: Omit<MobileNavigationState, "safetyBoundaries"> & { safetyBoundaries?: MobileNavigationState["safetyBoundaries"] },
): MobileNavigationState {
  return {
    ...state,
    safetyBoundaries: state.safetyBoundaries ?? routeSafety(),
  };
}

function param(paramName: string, expectedShape: string, optional = false, sensitive = false): MobileRouteParamModel {
  return {
    paramId: `param:${paramName}`,
    paramName,
    expectedShape,
    optional,
    sensitive,
    fallbackBehavior: "fall back to the nearest safe route when the param is missing or invalid",
    userFacingAllowed: !sensitive,
    metadataOnly: true,
  };
}

function defaultRoutes(input: MobileNavigationFlowInput, patterns: readonly MobileNavigationPattern[]): MobileRouteModel[] {
  const screenMap = screenMapFromInput(input);
  const hasAuth = patterns.includes("auth_gate");
  const hasPaywall = needsFromInput(input, input.monetizationNeeds, input.factoryIntake?.monetizationNeeds, input.uxPatternCatalog?.monetizationNeeds).length > 0;
  const hasSafety = needsFromInput(input, input.safetyNeeds, input.factoryIntake?.safetyNeeds, input.uxPatternCatalog?.safetyNeeds).length > 0;
  const routes: MobileRouteModel[] = [
    createMobileRoute({
      routeId: "route:onboarding",
      routeName: "Onboarding",
      routePath: "/onboarding",
      routeType: "onboarding",
      parentRouteId: null,
      screenPatternRefs: ["ux-onboarding-progressive-value"],
      requiredAuth: false,
      allowedRoles: [],
      requiredPermissions: [],
      params: [],
      deepLinkAliases: [],
      guards: ["onboarding_required"],
      fallbackRoute: "route:home",
      loadingStateRef: "state-loading-progressive",
      emptyStateRef: "state-empty-first-run",
      errorStateRef: "state-error-retry",
      accessibilityNotes: ["Plan a clear screen title and a skip or later path when product policy allows it."],
      safetyNotes: ["Do not ask for sensitive permissions before their value is explained."],
      riskLevel: "low",
    }),
    createMobileRoute({
      routeId: "route:home",
      routeName: "Home",
      routePath: "/",
      routeType: patterns.includes("tab_first") ? "tab" : "stack",
      parentRouteId: null,
      screenPatternRefs: ["ux-dashboard-actionable-snapshot", "ux-empty-loading-error-resilient"],
      requiredAuth: hasAuth,
      allowedRoles: [],
      requiredPermissions: [],
      params: [],
      deepLinkAliases: ["/home"],
      guards: hasAuth ? ["auth_required"] : [],
      fallbackRoute: "route:fallback",
      loadingStateRef: "state-loading-progressive",
      emptyStateRef: "state-empty-first-run",
      errorStateRef: "state-error-retry",
      accessibilityNotes: ["Use a stable route label and preserve predictable back behavior."],
      safetyNotes: ["Show stale or partial data explicitly if source freshness is unknown."],
      riskLevel: hasAuth ? "medium" : "low",
    }),
    createMobileRoute({
      routeId: "route:settings",
      routeName: "Settings",
      routePath: "/settings",
      routeType: "settings",
      parentRouteId: "route:home",
      screenPatternRefs: ["ux-profile-settings-control-center"],
      requiredAuth: hasAuth,
      allowedRoles: [],
      requiredPermissions: [],
      params: [],
      deepLinkAliases: ["/settings", "/profile"],
      guards: hasAuth ? ["auth_required"] : [],
      fallbackRoute: "route:home",
      loadingStateRef: "state-loading-progressive",
      emptyStateRef: "state-empty-first-run",
      errorStateRef: "state-error-retry",
      accessibilityNotes: ["Group settings with headings and clear labels."],
      safetyNotes: ["Keep privacy and destructive account controls review-gated."],
      riskLevel: "medium",
    }),
    createMobileRoute({
      routeId: "route:fallback",
      routeName: "Fallback",
      routePath: "/not-found",
      routeType: "fallback",
      parentRouteId: null,
      screenPatternRefs: ["ux-empty-loading-error-resilient"],
      requiredAuth: false,
      allowedRoles: [],
      requiredPermissions: [],
      params: [],
      deepLinkAliases: [],
      guards: [],
      fallbackRoute: "route:home",
      loadingStateRef: "state-loading-progressive",
      emptyStateRef: "state-empty-first-run",
      errorStateRef: "state-error-retry",
      accessibilityNotes: ["Explain unsupported navigation in text and provide a clear recovery action."],
      safetyNotes: ["Do not leak internal route names or private capability details."],
      riskLevel: "low",
    }),
  ];

  if (hasAuth) {
    routes.push(
      createMobileRoute({
        routeId: "route:auth",
        routeName: "Sign In",
        routePath: "/auth",
        routeType: "auth",
        parentRouteId: null,
        screenPatternRefs: ["ux-authentication-contextual-gate"],
        requiredAuth: false,
        allowedRoles: [],
        requiredPermissions: [],
        params: [param("returnTo", "route id or safe path", true)],
        deepLinkAliases: ["/sign-in", "/login"],
        guards: [],
        fallbackRoute: "route:home",
        loadingStateRef: "state-loading-progressive",
        emptyStateRef: "state-empty-first-run",
        errorStateRef: "state-error-retry",
        accessibilityNotes: ["Use persistent form labels and preserve return intent after sign-in."],
        safetyNotes: ["No credential handling is performed by this metadata."],
        riskLevel: "medium",
      }),
    );
  }

  if (patterns.includes("marketplace_browse_detail") || screenMap.some((screen) => /catalog|product|detail/i.test(screen))) {
    routes.push(
      createMobileRoute({
        routeId: "route:browse",
        routeName: "Browse",
        routePath: "/browse",
        routeType: "tab",
        parentRouteId: "route:home",
        screenPatternRefs: ["ux-content-lists-filtered-browse"],
        requiredAuth: false,
        allowedRoles: [],
        requiredPermissions: [],
        params: [],
        deepLinkAliases: ["/browse", "/catalog"],
        guards: [],
        fallbackRoute: "route:home",
        loadingStateRef: "state-loading-progressive",
        emptyStateRef: "state-empty-first-run",
        errorStateRef: "state-error-retry",
        accessibilityNotes: ["Preserve filter state and expose active filters in text."],
        safetyNotes: ["Label promoted or stale content when applicable."],
        riskLevel: "medium",
      }),
      createMobileRoute({
        routeId: "route:detail",
        routeName: "Detail",
        routePath: "/detail/:itemId",
        routeType: "stack",
        parentRouteId: "route:browse",
        screenPatternRefs: ["ux-detail-views-evidence-led"],
        requiredAuth: false,
        allowedRoles: [],
        requiredPermissions: [],
        params: [param("itemId", "stable item identifier")],
        deepLinkAliases: ["/items/:itemId"],
        guards: ["resource_exists"],
        fallbackRoute: "route:browse",
        loadingStateRef: "state-loading-progressive",
        emptyStateRef: "state-empty-first-run",
        errorStateRef: "state-error-retry",
        accessibilityNotes: ["Use a route title that reflects the loaded entity when safe."],
        safetyNotes: ["Distinguish advisory trust signals from verified claims."],
        riskLevel: "high",
      }),
    );
  }

  if (patterns.includes("chat_thread")) {
    routes.push(
      createMobileRoute({
        routeId: "route:thread",
        routeName: "Thread",
        routePath: "/thread/:threadId",
        routeType: "stack",
        parentRouteId: "route:home",
        screenPatternRefs: ["ux-messaging-safe-thread"],
        requiredAuth: true,
        allowedRoles: [],
        requiredPermissions: ["messaging_access"],
        params: [param("threadId", "stable conversation identifier", false, true)],
        deepLinkAliases: ["/messages/:threadId"],
        guards: ["auth_required", "permission_required", "resource_exists"],
        fallbackRoute: hasAuth ? "route:auth" : "route:home",
        loadingStateRef: "state-loading-progressive",
        emptyStateRef: "state-empty-first-run",
        errorStateRef: "state-error-retry",
        accessibilityNotes: ["Announce conversation context and message status without over-notifying."],
        safetyNotes: ["Report and block paths must remain reachable from communication surfaces."],
        riskLevel: "high",
      }),
    );
  }

  if (hasPaywall) {
    routes.push(
      createMobileRoute({
        routeId: "route:paywall",
        routeName: "Upgrade",
        routePath: "/upgrade",
        routeType: "paywall",
        parentRouteId: "route:home",
        screenPatternRefs: ["ux-monetization-clear-value"],
        requiredAuth: hasAuth,
        allowedRoles: [],
        requiredPermissions: [],
        params: [param("source", "route or feature source", true)],
        deepLinkAliases: ["/upgrade", "/pricing"],
        guards: hasAuth ? ["auth_required", "subscription_required"] : ["subscription_required"],
        fallbackRoute: "route:home",
        loadingStateRef: "state-loading-progressive",
        emptyStateRef: "state-empty-first-run",
        errorStateRef: "state-error-retry",
        accessibilityNotes: ["Make plan limits, renewal, and restore access copy readable."],
        safetyNotes: ["Pricing and entitlement behavior requires human review before implementation."],
        riskLevel: "high",
      }),
    );
  }

  if (hasSafety) {
    routes.push(
      createMobileRoute({
        routeId: "route:safety-report",
        routeName: "Report",
        routePath: "/report",
        routeType: "safety",
        parentRouteId: "route:home",
        screenPatternRefs: ["ux-safety-trust-explainable"],
        requiredAuth: hasAuth,
        allowedRoles: [],
        requiredPermissions: [],
        params: [param("targetId", "reported entity identifier", true, true)],
        deepLinkAliases: ["/report"],
        guards: hasAuth ? ["auth_required", "safe_mode_required"] : ["safe_mode_required"],
        fallbackRoute: "route:home",
        loadingStateRef: "state-loading-progressive",
        emptyStateRef: "state-empty-first-run",
        errorStateRef: "state-error-retry",
        accessibilityNotes: ["Explain report steps and keep support paths reachable."],
        safetyNotes: ["Report and block behavior remains advisory until product safety review."],
        riskLevel: "high",
      }),
    );
  }

  return routes;
}

function defaultNavigationStates(routes: readonly MobileRouteModel[]): MobileNavigationState[] {
  const authRoute = routes.find((route) => route.routeId === "route:auth");
  const fallbackRoute = routes.find((route) => route.routeId === "route:fallback");
  const homeRoute = routes.find((route) => route.routeId === "route:home");

  return [
    createMobileNavigationState({
      stateId: "nav-state:initializing",
      stateType: "initializing",
      trigger: "The app opens and navigation metadata is evaluated.",
      currentRoute: "none",
      nextRoute: homeRoute?.routeId ?? "route:home",
      guardCondition: "metadata only; no runtime guard is executed",
      fallbackBehavior: fallbackRoute?.routeId ?? "route:fallback",
      userMessage: "Preparing the app.",
      recoveryAction: "Show a safe fallback route if the initial route cannot be resolved.",
      analyticsHint: "Track initialization as aggregate metadata only.",
      riskLevel: "low",
    }),
    createMobileNavigationState({
      stateId: "nav-state:session-restoring",
      stateType: "session_restoring",
      trigger: "A protected route requires a session posture decision.",
      currentRoute: homeRoute?.routeId ?? "route:home",
      nextRoute: authRoute?.routeId ?? "route:home",
      guardCondition: "auth posture is required by metadata",
      fallbackBehavior: authRoute?.routeId ?? "route:home",
      userMessage: "Checking access before continuing.",
      recoveryAction: "Preserve return intent and provide account recovery where relevant.",
      analyticsHint: "Track auth gate category only, not credentials.",
      riskLevel: "medium",
    }),
    createMobileNavigationState({
      stateId: "nav-state:deep-link-not-found",
      stateType: "deep_link_not_found",
      trigger: "A link target is unsupported or missing.",
      currentRoute: "external_entry",
      nextRoute: fallbackRoute?.routeId ?? "route:fallback",
      guardCondition: "resource_exists guard cannot be satisfied by metadata",
      fallbackBehavior: "show safe fallback with return to home",
      userMessage: "This link cannot be opened safely.",
      recoveryAction: "Offer home, browse, or support depending on app type.",
      analyticsHint: "Track unsupported link category only.",
      riskLevel: "medium",
    }),
    createMobileNavigationState({
      stateId: "nav-state:role-denied",
      stateType: "role_denied",
      trigger: "A role-based route is not available for the current user metadata.",
      currentRoute: "protected_route",
      nextRoute: fallbackRoute?.routeId ?? "route:fallback",
      guardCondition: "role_required guard is not satisfied",
      fallbackBehavior: "show limited explanation without exposing private capability details",
      userMessage: "This area is not available for your account.",
      recoveryAction: "Return to a permitted route or contact support.",
      analyticsHint: "Track denied route group, not role internals.",
      riskLevel: "high",
    }),
    createMobileNavigationState({
      stateId: "nav-state:offline-recovery",
      stateType: "offline_recovery",
      trigger: "The intended route needs fresh data while the app is offline.",
      currentRoute: "requested_route",
      nextRoute: "route:home",
      guardCondition: "network_required guard is not satisfied",
      fallbackBehavior: "show cached content or an offline recovery route when product policy allows it",
      userMessage: "You are offline. Some routes may show saved information only.",
      recoveryAction: "Retry when online or continue with cached data if available.",
      analyticsHint: "Track offline recovery outcome without content payloads.",
      riskLevel: "medium",
    }),
  ];
}

function group(groupId: MobileRouteGroupId, routeIds: readonly string[], defaultRouteId: string, requiresAuth: boolean, riskLevel: PMRiskTier): MobileRouteGroup {
  return {
    groupId,
    title: groupId.replace("_", " "),
    purpose: `${groupId} route group metadata for future mobile navigation planning.`,
    routeIds: [...routeIds],
    defaultRouteId,
    requiresAuth,
    riskLevel,
    safetyNotes: ["Group is metadata only and does not create route folders or runtime navigation."],
    metadataOnly: true,
    advisoryOnly: true,
    noRouteFileGeneration: true,
  };
}

function defaultRouteGroups(routes: readonly MobileRouteModel[]): MobileRouteGroup[] {
  const idsByType = (types: readonly MobileRouteType[]): string[] =>
    routes.filter((route) => types.includes(route.routeType)).map((route) => route.routeId);
  const home = routes.find((route) => route.routeId === "route:home")?.routeId ?? "route:home";
  const fallback = routes.find((route) => route.routeId === "route:fallback")?.routeId ?? home;

  return [
    group("public", idsByType(["public", "onboarding"]), "route:onboarding", false, "low"),
    group("auth", idsByType(["auth"]), routes.find((route) => route.routeId === "route:auth")?.routeId ?? home, false, "medium"),
    group("main", idsByType(["tab", "stack", "protected"]), home, routes.some((route) => route.requiredAuth), "medium"),
    group("detail", idsByType(["deep_link_entry", "stack"]), routes.find((route) => route.routeId === "route:detail")?.routeId ?? home, false, "medium"),
    group("modal", idsByType(["modal"]), home, false, "medium"),
    group("settings", idsByType(["settings"]), routes.find((route) => route.routeId === "route:settings")?.routeId ?? home, routes.some((route) => route.routeId === "route:settings" && route.requiredAuth), "medium"),
    group("safety", idsByType(["safety"]), routes.find((route) => route.routeId === "route:safety-report")?.routeId ?? fallback, false, "high"),
    group("offline", idsByType(["offline_sync"]), home, false, "medium"),
    group("paywall", idsByType(["paywall"]), routes.find((route) => route.routeId === "route:paywall")?.routeId ?? home, false, "high"),
    group("fallback", idsByType(["fallback"]), fallback, false, "low"),
  ].filter((routeGroup) => routeGroup.routeIds.length > 0 || routeGroup.groupId === "fallback");
}

function defaultDeepLinks(routes: readonly MobileRouteModel[]): MobileDeepLinkModel[] {
  return routes
    .filter((route) => route.deepLinkAliases.length > 0)
    .map((route): MobileDeepLinkModel => ({
      deepLinkId: `deep-link:${route.routeId}`,
      routeId: route.routeId,
      aliases: [...route.deepLinkAliases],
      protectedEntry: route.requiredAuth,
      fallbackRoute: route.fallbackRoute ?? "route:fallback",
      unsupportedBehavior: "resolve to safe fallback route and preserve user-facing recovery copy",
      riskLevel: route.riskLevel,
      metadataOnly: true,
      advisoryOnly: true,
      noNativeLinkingConfig: true,
    }));
}

const isMobileNavigationFlowModel = (
  flowOrRoutes: MobileNavigationFlowModel | readonly MobileRouteModel[],
): flowOrRoutes is MobileNavigationFlowModel => !Array.isArray(flowOrRoutes);

const routesFrom = (flowOrRoutes: MobileNavigationFlowModel | readonly MobileRouteModel[]): readonly MobileRouteModel[] =>
  isMobileNavigationFlowModel(flowOrRoutes) ? flowOrRoutes.routes : flowOrRoutes;

export function selectRoutesByType(flowOrRoutes: MobileNavigationFlowModel | readonly MobileRouteModel[], routeType: MobileRouteType): MobileRouteModel[] {
  return routesFrom(flowOrRoutes).filter((route: MobileRouteModel) => route.routeType === routeType);
}

export function selectProtectedRoutes(flowOrRoutes: MobileNavigationFlowModel | readonly MobileRouteModel[]): MobileRouteModel[] {
  return routesFrom(flowOrRoutes).filter((route: MobileRouteModel) => route.requiredAuth || route.routeType === "protected" || route.guards.includes("auth_required"));
}

export function recommendMobileNavigationFlow(input: MobileNavigationFlowInput = {}): MobileNavigationRecommendation {
  const appType = appTypeFromInput(input);
  const navigationPatterns = patternsForAppType(appType, input);
  const riskLevel = defaultRiskFromInput(input);
  const approvals = uniqueStrings([
    ...(input.requiredApprovals ?? []),
    ...(input.factoryIntake?.requiredApprovals ?? []),
    ...(input.architectureProfile?.requiredApprovals ?? []),
    ...(navigationPatterns.includes("auth_gate") ? ["auth_navigation_review"] : []),
    ...(navigationPatterns.includes("role_based") ? ["role_permission_review"] : []),
    ...(navigationPatterns.includes("deep_link_enabled") ? ["deep_link_review"] : []),
    ...(navigationPatterns.includes("chat_thread") ? ["messaging_safety_review"] : []),
  ]);

  return {
    recommendationId: `mobile-navigation:${appType}`,
    appType,
    navigationPatterns,
    recommendedRootNavigator: navigationPatterns.includes("tab_first")
      ? "tab_root_with_stack_details_and_modal_overlays"
      : "stack_root_with_optional_tabs",
    initialRoute: navigationPatterns.includes("onboarding_gate") ? "route:onboarding" : "route:home",
    routeGroupIds: ["public", "auth", "main", "detail", "modal", "settings", "safety", "offline", "paywall", "fallback"],
    riskLevel,
    requiredApprovals: approvals,
    recommendedNextStep: {
      nextStepId: "mobile_navigation_next_step:125B",
      title: "Plan the mobile state management strategy",
      safeSummary: "Continue with Phase 125B to define state ownership after route flow metadata is stable.",
      priority: riskLevel,
      decisionMode: "plan_only",
      riskSurfaces: ["scaffold", "security_policy", "provider", "store"],
      recommendationOnly: true,
      noExecution: true,
    },
    safetyBoundaries: {
      advisoryOnly: true,
      metadataOnly: true,
      noRouteFileGeneration: true,
      noAppGeneration: true,
    },
  };
}

export function summarizeMobileNavigationFlow(flow: Pick<MobileNavigationFlowModel, "flowId" | "appType" | "routes" | "routeGroups" | "deepLinks" | "navigationStates" | "navigationPattern" | "requiredApprovals">): MobileNavigationSummary {
  const routeRisks = flow.routes.map((route) => route.riskLevel);
  const stateRisks = flow.navigationStates.map((state) => state.riskLevel);
  return {
    flowId: flow.flowId,
    appType: flow.appType,
    routeCount: flow.routes.length,
    routeGroupCount: flow.routeGroups.length,
    protectedRouteCount: selectProtectedRoutes(flow.routes).length,
    deepLinkCount: flow.deepLinks.length,
    navigationStateCount: flow.navigationStates.length,
    navigationPatterns: [...flow.navigationPattern],
    highestRiskLevel: highestRisk([...routeRisks, ...stateRisks]),
    requiredApprovalCount: new Set(flow.requiredApprovals).size,
    recommendedNextPhase: "Phase 125B - MOBILE STATE MANAGEMENT STRATEGY PLAN",
    safeSummary:
      "Mobile Navigation Flow Model is source-only advisory metadata for future route planning; it does not generate routes, screens, apps, native projects, or mobile tooling behavior.",
    safetyBoundaries,
  };
}

export function createMobileNavigationFlow(input: MobileNavigationFlowInput = {}): MobileNavigationFlowModel {
  const recommendation = recommendMobileNavigationFlow(input);
  const routes = [...(input.routes ?? defaultRoutes(input, recommendation.navigationPatterns))];
  const routeGroups = [...(input.routeGroups ?? defaultRouteGroups(routes))];
  const navigationStates = [...(input.navigationStates ?? defaultNavigationStates(routes))];
  const deepLinks = [...(input.deepLinks ?? defaultDeepLinks(routes))];
  const riskLevel = highestRisk([recommendation.riskLevel, ...routes.map((route) => route.riskLevel), ...navigationStates.map((state) => state.riskLevel)]);
  const requiredApprovals = uniqueStrings([...recommendation.requiredApprovals, ...(input.requiredApprovals ?? [])]);
  const initialRoute = input.initialRoute ?? recommendation.initialRoute;
  const flowBase = {
    flowId: input.flowId ?? `mobile-navigation-flow:${recommendation.appType}`,
    appType: recommendation.appType,
    routes,
    routeGroups,
    deepLinks,
    navigationStates,
    navigationPattern: recommendation.navigationPatterns,
    requiredApprovals,
  };

  const flow: MobileNavigationFlowModel = {
    ...flowBase,
    phaseRef: input.phaseRef ?? "Phase 124I",
    rootNavigator: input.rootNavigator ?? recommendation.recommendedRootNavigator,
    authRequiredRoutes: selectProtectedRoutes(routes),
    publicRoutes: routes.filter((route) => !route.requiredAuth && (route.routeType === "public" || route.routeType === "onboarding" || route.routeType === "auth")),
    protectedRoutes: selectProtectedRoutes(routes),
    roleBasedRoutes: routes.filter((route) => route.routeType === "role_based" || route.guards.includes("role_required")),
    modalRoutes: selectRoutesByType(routes, "modal"),
    fallbackRoutes: selectRoutesByType(routes, "fallback"),
    initialRoute,
    sessionRestoreStrategy:
      input.sessionRestoreStrategy ??
      "metadata_only_session_restore_strategy_preserves_return_intent_and_falls_back_to_auth_or_home",
    recommendation,
    summary: summarizeMobileNavigationFlow(flowBase),
    riskLevel,
    limitations: [
      "No route files, screens, components, native config, package changes, providers, runtime work, dashboard mutation, DB/SQL, CI, memory, or source-control actions are generated.",
      "Navigation flow is advisory and must be reviewed before future implementation.",
      ...(input.limitations ?? []),
    ],
    consumedFactoryMetadata: [
      "app type",
      "target users",
      "core flows",
      "screen map",
      "auth needs",
      "onboarding needs",
      "monetization needs",
      "safety needs",
      "role and permission needs",
      "release target",
    ],
    consumedArchitectureMetadata: [
      "app_routes",
      "screens",
      "features",
      "state",
      "auth profile",
      "offline profile",
      "testing profile",
    ],
    consumedUxPatternMetadata: [
      "screen patterns",
      "loading state references",
      "empty state references",
      "error state references",
      "paywall patterns",
      "safety patterns",
      "accessibility requirements",
    ],
    conversationalBuildLoopReadiness: [
      "Can turn a simple mobile idea into an advisory route map for a future planning loop.",
      "Can seed route groups, guarded route lists, fallback paths, and MVP navigation flow context.",
      "Does not implement conversational automation or Codex execution.",
    ],
    safetyBoundaries,
  };

  return {
    ...flow,
    summary: summarizeMobileNavigationFlow(flow),
  };
}
