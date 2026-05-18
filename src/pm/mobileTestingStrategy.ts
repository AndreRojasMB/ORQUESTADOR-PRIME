import type {
  MobileAppFactoryAppType,
  MobileAppFactoryIntake,
  MobileAppFactoryStrategy,
  MobileReleaseTarget,
} from "./mobileAppFactoryStrategy.js";
import type { MobileArchitectureLayerId, MobileArchitectureProfile } from "./mobileArchitectureProfile.js";
import type { MobileNavigationFlowModel } from "./mobileNavigationFlowModel.js";
import type { MobilePerformanceChecklist } from "./mobilePerformanceChecklist.js";
import type { MobileSecurityBaseline } from "./mobileSecurityBaseline.js";
import type { MobileStateManagementStrategy } from "./mobileStateManagementStrategy.js";
import type { MobileUxPatternCatalog } from "./mobileUxPatternCatalog.js";
import type { OfflineCacheSyncStrategy } from "./offlineCacheSyncStrategy.js";
import type { PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type MobileTestingCategory =
  | "unit"
  | "integration"
  | "e2e"
  | "smoke"
  | "regression"
  | "accessibility"
  | "security"
  | "performance"
  | "offline_sync"
  | "navigation"
  | "auth_session"
  | "release_readiness";

export type MobileTestLevel = "unit" | "integration" | "e2e" | "smoke" | "regression";

export type MobileTestingPlatform = "ios" | "android" | "cross_platform" | "tablet" | "unknown";

export type MobileTestingDeviceClass =
  | "small_phone"
  | "standard_phone"
  | "large_phone"
  | "tablet"
  | "foldable_future"
  | "low_end_device"
  | "unknown";

export type MobileTestingPerformanceTier = "low" | "mid" | "high" | "unknown";

export type MobileTestingNetworkCondition = "online_fast" | "online_slow" | "intermittent" | "offline" | "unknown";

export type MobileTestingAccessibilityMode =
  | "default"
  | "large_text"
  | "screen_reader"
  | "reduced_motion"
  | "high_contrast"
  | "unknown";

export type MobileSmokeFlowPriority = "low" | "medium" | "high" | "critical";

export type MobileSmokeFlowAutomationReadiness =
  | "manual_only"
  | "future_candidate"
  | "blocked_by_missing_app"
  | "blocked_by_sensitive_data"
  | "blocked_by_release_gate";

export interface MobileTestingSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noRealAppTests: true;
  noVirtualDeviceLaunch: true;
  noDeviceAutomation: true;
  noMobileCommandExecution: true;
  noExpoEasExecution: true;
  noPackageChanges: true;
  noWorkflowCiActivation: true;
  noNativeProjectChanges: true;
  noProviderCalls: true;
  noRuntimeExecution: true;
  noDashboardMutation: true;
  noDbSqlMutation: true;
  noSecretsEnvNetwork: true;
  noMemoryPersistence: true;
  noGitAutomationFromSource: true;
}

export interface MobileDeviceMatrix {
  matrixId: string;
  platform: MobileTestingPlatform;
  deviceClass: MobileTestingDeviceClass;
  osVersionRange: string;
  screenSizeClass: string;
  performanceTier: MobileTestingPerformanceTier;
  networkCondition: MobileTestingNetworkCondition;
  accessibilityMode: MobileTestingAccessibilityMode;
  requiredForRelease: boolean;
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    MobileTestingSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noVirtualDeviceLaunch" | "noDeviceAutomation"
  >;
}

export interface MobileSmokeFlow {
  smokeFlowId: string;
  name: string;
  appType: MobileAppFactoryAppType;
  targetUser: string;
  startRoute: string;
  steps: readonly string[];
  expectedOutcome: string;
  requiredTestData: readonly string[];
  relatedRisks: readonly string[];
  priority: MobileSmokeFlowPriority;
  automationReadiness: MobileSmokeFlowAutomationReadiness;
  humanReviewRequired: boolean;
  safetyBoundaries: Pick<
    MobileTestingSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noRealAppTests" | "noDeviceAutomation"
  >;
}

export interface MobileTestingRecommendation {
  recommendationId: string;
  appType: MobileAppFactoryAppType;
  testPosture: string;
  matrixPosture: string;
  smokeFlowPosture: string;
  releaseReadinessPosture: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<
    MobileTestingSafetyBoundaries,
    "advisoryOnly" | "metadataOnly" | "noRealAppTests" | "noVirtualDeviceLaunch" | "noMobileCommandExecution"
  >;
}

export interface MobileTestingSummary {
  strategyId: string;
  appType: MobileAppFactoryAppType;
  testLevelCount: number;
  smokeFlowCount: number;
  deviceMatrixCount: number;
  categories: readonly MobileTestingCategory[];
  highestRiskLevel: PMRiskTier;
  releaseRequiredMatrixCount: number;
  humanReviewRequiredFlowCount: number;
  requiredApprovalCount: number;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: MobileTestingSafetyBoundaries;
}

export interface MobileTestingStrategy {
  strategyId: string;
  phaseRef: ProjectPhaseRef;
  appType: MobileAppFactoryAppType;
  releaseTarget: MobileReleaseTarget | undefined;
  testLevels: readonly MobileTestLevel[];
  smokeFlows: readonly MobileSmokeFlow[];
  deviceMatrix: readonly MobileDeviceMatrix[];
  accessibilityChecks: readonly string[];
  securityChecks: readonly string[];
  performanceChecks: readonly string[];
  offlineSyncChecks: readonly string[];
  releaseReadinessChecks: readonly string[];
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  recommendation: MobileTestingRecommendation;
  summary: MobileTestingSummary;
  consumedFactoryMetadata: readonly string[];
  consumedArchitectureMetadata: readonly string[];
  consumedUxNavigationStateMetadata: readonly string[];
  consumedSecurityPerformanceMetadata: readonly string[];
  pmSolidAutopilotIntegration: readonly string[];
  conversationalBuildLoopReadiness: readonly string[];
  safetyBoundaries: MobileTestingSafetyBoundaries;
}

export interface MobileTestingStrategyInput {
  strategyId?: string;
  phaseRef?: ProjectPhaseRef;
  appType?: MobileAppFactoryAppType;
  releaseTarget?: MobileReleaseTarget | undefined;
  testLevels?: readonly MobileTestLevel[];
  smokeFlows?: readonly MobileSmokeFlow[];
  deviceMatrix?: readonly MobileDeviceMatrix[];
  accessibilityChecks?: readonly string[];
  securityChecks?: readonly string[];
  performanceChecks?: readonly string[];
  offlineSyncChecks?: readonly string[];
  releaseReadinessChecks?: readonly string[];
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
  performanceChecklist?: MobilePerformanceChecklist;
}

export const mobileTestingCategories: readonly MobileTestingCategory[] = [
  "unit",
  "integration",
  "e2e",
  "smoke",
  "regression",
  "accessibility",
  "security",
  "performance",
  "offline_sync",
  "navigation",
  "auth_session",
  "release_readiness",
];

const defaultTestLevels: readonly MobileTestLevel[] = ["unit", "integration", "smoke", "regression"];

const safetyBoundaries: MobileTestingSafetyBoundaries = {
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noRealAppTests: true,
  noVirtualDeviceLaunch: true,
  noDeviceAutomation: true,
  noMobileCommandExecution: true,
  noExpoEasExecution: true,
  noPackageChanges: true,
  noWorkflowCiActivation: true,
  noNativeProjectChanges: true,
  noProviderCalls: true,
  noRuntimeExecution: true,
  noDashboardMutation: true,
  noDbSqlMutation: true,
  noSecretsEnvNetwork: true,
  noMemoryPersistence: true,
  noGitAutomationFromSource: true,
};

const matrixSafety = (): MobileDeviceMatrix["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noVirtualDeviceLaunch: true,
  noDeviceAutomation: true,
});

const smokeSafety = (): MobileSmokeFlow["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noRealAppTests: true,
  noDeviceAutomation: true,
});

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function uniqueCategories(values: readonly MobileTestingCategory[]): MobileTestingCategory[] {
  return mobileTestingCategories.filter((category) => values.includes(category));
}

function uniqueTestLevels(values: readonly MobileTestLevel[]): MobileTestLevel[] {
  return ["unit", "integration", "e2e", "smoke", "regression"].filter((level): level is MobileTestLevel =>
    values.includes(level as MobileTestLevel),
  );
}

function highestRisk(risks: readonly PMRiskTier[]): PMRiskTier {
  if (risks.includes("critical")) return "critical";
  if (risks.includes("high")) return "high";
  if (risks.includes("medium")) return "medium";
  return "low";
}

function appTypeFromInput(input: MobileTestingStrategyInput): MobileAppFactoryAppType {
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
    input.performanceChecklist?.appType ??
    "unknown_mobile_app"
  );
}

function releaseTargetFromInput(input: MobileTestingStrategyInput): MobileReleaseTarget | undefined {
  return (
    input.releaseTarget ??
    input.factoryIntake?.releaseTarget ??
    input.factoryStrategy?.intake.releaseTarget ??
    input.architectureProfile?.releaseProfile.releaseTarget ??
    input.stateStrategy?.releaseTarget ??
    input.offlineCacheSyncStrategy?.releaseTarget ??
    input.securityBaseline?.releaseTarget ??
    input.performanceChecklist?.releaseTarget
  );
}

function targetUsersFromInput(input: MobileTestingStrategyInput): string[] {
  return uniqueStrings([
    ...(input.factoryIntake?.targetUsers ?? []),
    ...(input.factoryStrategy?.intake.targetUsers ?? []),
    ...(input.uxPatternCatalog?.targetUsers ?? []),
    "primary_user",
  ]).slice(0, 8);
}

function routesFromInput(input: MobileTestingStrategyInput): string[] {
  return uniqueStrings([
    ...(input.factoryIntake?.screenMap.map((screen) => screen.title) ?? []),
    ...(input.factoryStrategy?.intake.screenMap.map((screen) => screen.title) ?? []),
    ...(input.uxPatternCatalog?.screenMap ?? []),
    ...(input.navigationFlow?.routes.map((route) => route.routeName) ?? []),
  ]).slice(0, 10);
}

function flowsFromInput(input: MobileTestingStrategyInput): string[] {
  return uniqueStrings([
    ...(input.factoryIntake?.coreFlows ?? []),
    ...(input.factoryStrategy?.intake.coreFlows ?? []),
    ...(input.uxPatternCatalog?.coreFlows ?? []),
    ...(input.performanceChecklist?.targetFlows ?? []),
    ...routesFromInput(input),
  ]).slice(0, 12);
}

function categoriesFromInput(input: MobileTestingStrategyInput): MobileTestingCategory[] {
  const signals = [
    ...flowsFromInput(input),
    ...(input.factoryIntake?.authNeeds ?? []),
    ...(input.factoryIntake?.offlineNeeds ?? []),
    ...(input.factoryIntake?.safetyNeeds ?? []),
    ...(input.factoryIntake?.monetizationNeeds ?? []),
    ...(input.securityBaseline?.summary.categories ?? []),
    ...(input.performanceChecklist?.summary.categories ?? []),
  ].join(" ");
  const categories: MobileTestingCategory[] = ["unit", "integration", "smoke", "regression", "navigation", "release_readiness"];

  if (/auth|session|login|account/i.test(signals)) categories.push("auth_session");
  if (/offline|sync|cache|queue|conflict/i.test(signals)) categories.push("offline_sync");
  if (/privacy|security|safety|abuse|report|block|payment/i.test(signals)) categories.push("security");
  if (/accessibility|screen reader|large text|contrast|motion/i.test(signals)) categories.push("accessibility");
  if (/performance|startup|render|list|media|battery|bundle/i.test(signals)) categories.push("performance");
  if (/marketplace|chat|field|dashboard|critical|release/i.test(signals)) categories.push("e2e");

  return uniqueCategories(categories);
}

function deriveRisk(input: MobileTestingStrategyInput): PMRiskTier {
  const categories = categoriesFromInput(input);
  return highestRisk([
    input.riskLevel ?? "low",
    input.securityBaseline?.summary.highestRiskLevel ?? "low",
    input.performanceChecklist?.summary.highestRiskLevel ?? "low",
    input.offlineCacheSyncStrategy?.summary.highestRiskLevel ?? "low",
    categories.includes("security") || categories.includes("offline_sync") || categories.includes("performance") ? "high" : "low",
    categories.includes("e2e") && categories.includes("release_readiness") ? "medium" : "low",
  ]);
}

function approvalsFromInput(input: MobileTestingStrategyInput, riskLevel: PMRiskTier): string[] {
  return uniqueStrings([
    ...(input.requiredApprovals ?? []),
    ...(riskLevel === "critical" || riskLevel === "high" ? ["mobile_qa_human_review"] : []),
    ...(categoriesFromInput(input).includes("security") ? ["security_qa_review"] : []),
    ...(categoriesFromInput(input).includes("performance") ? ["performance_qa_review"] : []),
    ...(categoriesFromInput(input).includes("offline_sync") ? ["offline_sync_qa_review"] : []),
  ]);
}

function platformFromAppType(appType: MobileAppFactoryAppType): MobileTestingPlatform {
  if (appType === "dashboard_companion_app") return "tablet";
  if (appType === "erp_mobile_field_ops_app") return "android";
  return "cross_platform";
}

export function createMobileDeviceMatrix(
  matrix: Omit<MobileDeviceMatrix, "safetyBoundaries"> & {
    safetyBoundaries?: MobileDeviceMatrix["safetyBoundaries"];
  },
): MobileDeviceMatrix {
  return {
    ...matrix,
    safetyBoundaries: matrix.safetyBoundaries ?? matrixSafety(),
  };
}

export function createMobileSmokeFlow(
  flow: Omit<MobileSmokeFlow, "safetyBoundaries"> & {
    safetyBoundaries?: MobileSmokeFlow["safetyBoundaries"];
  },
): MobileSmokeFlow {
  return {
    ...flow,
    steps: [...flow.steps],
    requiredTestData: [...flow.requiredTestData],
    relatedRisks: [...flow.relatedRisks],
    safetyBoundaries: flow.safetyBoundaries ?? smokeSafety(),
  };
}

function defaultDeviceMatrix(input: MobileTestingStrategyInput): MobileDeviceMatrix[] {
  const appType = appTypeFromInput(input);
  const platform = platformFromAppType(appType);
  const riskLevel = deriveRisk(input);

  return [
    createMobileDeviceMatrix({
      matrixId: "mobile-testing-matrix:standard-phone",
      platform,
      deviceClass: "standard_phone",
      osVersionRange: "current_and_previous_supported",
      screenSizeClass: "standard",
      performanceTier: "mid",
      networkCondition: "online_fast",
      accessibilityMode: "default",
      requiredForRelease: true,
      riskLevel: "medium",
    }),
    createMobileDeviceMatrix({
      matrixId: "mobile-testing-matrix:small-phone-accessibility",
      platform: platform === "tablet" ? "cross_platform" : platform,
      deviceClass: "small_phone",
      osVersionRange: "previous_supported",
      screenSizeClass: "compact",
      performanceTier: "low",
      networkCondition: "online_slow",
      accessibilityMode: "large_text",
      requiredForRelease: riskLevel === "high" || riskLevel === "critical",
      riskLevel: riskLevel === "critical" ? "critical" : "high",
    }),
    createMobileDeviceMatrix({
      matrixId: "mobile-testing-matrix:offline-accessibility",
      platform,
      deviceClass: "standard_phone",
      osVersionRange: "current_supported",
      screenSizeClass: "standard",
      performanceTier: "mid",
      networkCondition: "offline",
      accessibilityMode: "screen_reader",
      requiredForRelease: categoriesFromInput(input).includes("offline_sync"),
      riskLevel: categoriesFromInput(input).includes("offline_sync") ? "high" : "medium",
    }),
    createMobileDeviceMatrix({
      matrixId: "mobile-testing-matrix:tablet-release",
      platform: "tablet",
      deviceClass: "tablet",
      osVersionRange: "current_supported",
      screenSizeClass: "expanded",
      performanceTier: "mid",
      networkCondition: "intermittent",
      accessibilityMode: "reduced_motion",
      requiredForRelease: appType === "dashboard_companion_app",
      riskLevel: appType === "dashboard_companion_app" ? "high" : "medium",
    }),
  ];
}

function defaultSmokeFlows(input: MobileTestingStrategyInput): MobileSmokeFlow[] {
  const appType = appTypeFromInput(input);
  const targetUser = targetUsersFromInput(input)[0] ?? "primary_user";
  const routes = routesFromInput(input);
  const flows = flowsFromInput(input);
  const categories = categoriesFromInput(input);

  return [
    createMobileSmokeFlow({
      smokeFlowId: "mobile-smoke:first-launch",
      name: "First launch and onboarding review",
      appType,
      targetUser,
      startRoute: routes[0] ?? "future_initial_route",
      steps: ["open future app target", "review onboarding or first route", "confirm accessible empty/loading/error posture"],
      expectedOutcome: "Primary user reaches the first useful state with clear recovery posture.",
      requiredTestData: ["sample_user_context"],
      relatedRisks: ["onboarding_dropoff", "missing_accessibility_state"],
      priority: "high",
      automationReadiness: "blocked_by_missing_app",
      humanReviewRequired: true,
    }),
    createMobileSmokeFlow({
      smokeFlowId: "mobile-smoke:core-flow",
      name: "Primary core flow review",
      appType,
      targetUser,
      startRoute: routes[1] ?? routes[0] ?? "future_home_route",
      steps: flows.length > 0 ? flows : ["review core flow path", "confirm expected success and recovery states"],
      expectedOutcome: "Primary core action can be reviewed against UX, navigation, state, and QA evidence.",
      requiredTestData: ["sample_domain_data"],
      relatedRisks: ["core_flow_regression", "state_recovery_gap"],
      priority: "critical",
      automationReadiness: "blocked_by_missing_app",
      humanReviewRequired: true,
    }),
    createMobileSmokeFlow({
      smokeFlowId: "mobile-smoke:offline-sync",
      name: "Offline and sync recovery review",
      appType,
      targetUser,
      startRoute: routes.find((route) => /offline|sync|cache/i.test(route)) ?? routes[0] ?? "future_offline_route",
      steps: ["review offline-readable posture", "review queued-intent posture", "review sync recovery messaging"],
      expectedOutcome: "Offline and sync behavior has visible feedback, recovery, and conflict posture.",
      requiredTestData: ["sample_cached_data", "sample_pending_intent"],
      relatedRisks: ["offline_queue_conflict", "stale_data_confusion"],
      priority: categories.includes("offline_sync") ? "critical" : "medium",
      automationReadiness: categories.includes("offline_sync") ? "future_candidate" : "manual_only",
      humanReviewRequired: categories.includes("offline_sync"),
    }),
    createMobileSmokeFlow({
      smokeFlowId: "mobile-smoke:release-readiness",
      name: "Release readiness walkthrough",
      appType,
      targetUser,
      startRoute: routes[0] ?? "future_release_route",
      steps: ["review release-critical routes", "review security and performance checks", "review accessibility and recovery notes"],
      expectedOutcome: "Release readiness gaps are visible as PM and DoD metadata before any release work.",
      requiredTestData: ["release_readiness_context"],
      relatedRisks: ["release_quality_gap", "human_review_missing"],
      priority: "high",
      automationReadiness: "blocked_by_release_gate",
      humanReviewRequired: true,
    }),
  ];
}

function defaultCheckList(values: readonly string[], fallback: readonly string[]): string[] {
  return uniqueStrings(values.length > 0 ? values : fallback);
}

export function recommendMobileTestingStrategy(input: MobileTestingStrategyInput = {}): MobileTestingRecommendation {
  const appType = appTypeFromInput(input);
  const riskLevel = deriveRisk(input);
  const requiredApprovals = approvalsFromInput(input, riskLevel);

  return {
    recommendationId: `mobile-testing-strategy:${appType}`,
    appType,
    testPosture: "Use unit, integration, smoke, regression, and future end-to-end posture as metadata until a real app target exists.",
    matrixPosture: "Represent platform, screen, performance, network, and accessibility coverage as advisory matrix entries.",
    smokeFlowPosture: "Represent critical journeys as smoke flow metadata without executing mobile app tests.",
    releaseReadinessPosture: "Use release readiness checks as PM and DoD evidence before any release strategy phase.",
    riskLevel,
    requiredApprovals,
    recommendedNextStep: {
      nextStepId: "mobile_testing_next_step:130B",
      title: "Plan mobile release and Expo/EAS strategy",
      safeSummary: "Continue with Phase 130B after testing strategy metadata is established.",
      priority: riskLevel,
      decisionMode: "plan_only",
      riskSurfaces: ["runtime", "release", "package_workflow", "ci_baseline", "provider"],
      recommendationOnly: true,
      noExecution: true,
    },
    safetyBoundaries: {
      advisoryOnly: true,
      metadataOnly: true,
      noRealAppTests: true,
      noVirtualDeviceLaunch: true,
      noMobileCommandExecution: true,
    },
  };
}

export function createMobileTestingStrategy(input: MobileTestingStrategyInput = {}): MobileTestingStrategy {
  const appType = appTypeFromInput(input);
  const releaseTarget = releaseTargetFromInput(input);
  const testLevels = uniqueTestLevels(input.testLevels ?? defaultTestLevels);
  const smokeFlows = input.smokeFlows ? [...input.smokeFlows] : defaultSmokeFlows({ ...input, appType });
  const deviceMatrix = input.deviceMatrix ? [...input.deviceMatrix] : defaultDeviceMatrix({ ...input, appType });
  const riskLevel = highestRisk([
    deriveRisk(input),
    ...smokeFlows.map((flow) => (flow.priority === "critical" ? "critical" : flow.priority)),
    ...deviceMatrix.map((entry) => entry.riskLevel),
  ]);
  const requiredApprovals = approvalsFromInput(input, riskLevel);
  const strategyBase = {
    strategyId: input.strategyId ?? `mobile-testing-strategy:${appType}`,
    phaseRef: input.phaseRef ?? "Phase 129I",
    appType,
    releaseTarget,
    testLevels,
    smokeFlows,
    deviceMatrix,
    accessibilityChecks: defaultCheckList(input.accessibilityChecks ?? [], [
      "large text posture",
      "screen reader posture",
      "reduced motion posture",
      "high contrast posture",
    ]),
    securityChecks: defaultCheckList(input.securityChecks ?? [], [
      "auth/session QA posture",
      "privacy and logging QA posture",
      "abuse/safety flow QA posture",
    ]),
    performanceChecks: defaultCheckList(input.performanceChecks ?? [], [
      "startup and first render QA posture",
      "list/media QA posture",
      "low-end device QA posture",
    ]),
    offlineSyncChecks: defaultCheckList(input.offlineSyncChecks ?? [], [
      "offline-readable QA posture",
      "queued-intent QA posture",
      "sync recovery QA posture",
    ]),
    releaseReadinessChecks: defaultCheckList(input.releaseReadinessChecks ?? [], [
      "smoke flow coverage review",
      "device matrix coverage review",
      "human approval readiness review",
    ]),
    riskLevel,
    requiredApprovals,
    limitations: [
      "No real mobile app tests, virtual target launch, lab automation, mobile command execution, package changes, workflow/CI activation, native project changes, providers, runtime, dashboard, DB/SQL, secrets/env/network, memory, or source-control behavior is implemented.",
      "Testing strategy remains advisory metadata until a real app target and approved QA execution phase exist.",
      ...(input.limitations ?? []),
    ],
    recommendation: recommendMobileTestingStrategy({ ...input, appType, riskLevel, requiredApprovals }),
    consumedFactoryMetadata: [
      "app type",
      "target users",
      "core flows",
      "screen map",
      "auth/offline/monetization/safety needs",
      "release target",
    ],
    consumedArchitectureMetadata: [
      "app routes",
      "screens",
      "components",
      "features",
      "domain",
      "services",
      "repositories",
      "state",
      "tests",
      "release future",
    ],
    consumedUxNavigationStateMetadata: [
      "UX pattern states",
      "navigation routes",
      "state ownership",
      "offline/cache/sync recovery",
      "auth/session gates",
    ],
    consumedSecurityPerformanceMetadata: [
      "security checklist evidence",
      "privacy and abuse/safety posture",
      "performance checklist evidence",
      "low-end device concerns",
      "release readiness posture",
    ],
    pmSolidAutopilotIntegration: [
      "PM reports may include QA gaps, smoke flow coverage, device matrix risk, approvals, and closeout limitations.",
      "SOLID review may use testing metadata to evaluate boundaries across UI, state, service, repository, and release layers.",
      "Autopilot may carry testing strategy metadata as handoff and dry-run context only.",
    ],
    conversationalBuildLoopReadiness: [
      "Maps a simple idea to QA strategy posture.",
      "Suggests smoke flow list and release readiness review context.",
      "Provides future Codex prompt context without conversational automation.",
    ],
    safetyBoundaries,
  } satisfies Omit<MobileTestingStrategy, "summary">;

  return {
    ...strategyBase,
    summary: summarizeMobileTestingStrategy(strategyBase),
  };
}

export function summarizeMobileTestingStrategy(
  strategy: Pick<
    MobileTestingStrategy,
    | "strategyId"
    | "appType"
    | "testLevels"
    | "smokeFlows"
    | "deviceMatrix"
    | "riskLevel"
    | "requiredApprovals"
    | "safetyBoundaries"
  >,
): MobileTestingSummary {
  const categories = uniqueCategories([
    ...strategy.testLevels,
    "accessibility",
    "security",
    "performance",
    "offline_sync",
    "navigation",
    "auth_session",
    "release_readiness",
  ]);

  return {
    strategyId: strategy.strategyId,
    appType: strategy.appType,
    testLevelCount: strategy.testLevels.length,
    smokeFlowCount: strategy.smokeFlows.length,
    deviceMatrixCount: strategy.deviceMatrix.length,
    categories,
    highestRiskLevel: highestRisk([
      strategy.riskLevel,
      ...strategy.smokeFlows.map((flow) => (flow.priority === "critical" ? "critical" : flow.priority)),
      ...strategy.deviceMatrix.map((entry) => entry.riskLevel),
    ]),
    releaseRequiredMatrixCount: strategy.deviceMatrix.filter((entry) => entry.requiredForRelease).length,
    humanReviewRequiredFlowCount: strategy.smokeFlows.filter((flow) => flow.humanReviewRequired).length,
    requiredApprovalCount: strategy.requiredApprovals.length,
    recommendedNextPhase: "Phase 130B - MOBILE RELEASE / EAS STRATEGY PLAN",
    safeSummary:
      "Mobile Testing Strategy is source-only advisory metadata for unit, integration, e2e, smoke, regression, accessibility, security, performance, offline/sync, navigation, auth/session, release readiness, device matrix, and smoke flow posture.",
    safetyBoundaries: strategy.safetyBoundaries,
  };
}

export function selectSmokeFlowsByAppType(
  strategyOrFlows: MobileTestingStrategy | readonly MobileSmokeFlow[],
  appType: MobileAppFactoryAppType,
): MobileSmokeFlow[] {
  const flows = isMobileTestingStrategy(strategyOrFlows) ? strategyOrFlows.smokeFlows : strategyOrFlows;
  return flows.filter((flow) => flow.appType === appType);
}

export function selectDeviceMatrixByPlatform(
  strategyOrMatrix: MobileTestingStrategy | readonly MobileDeviceMatrix[],
  platform: MobileTestingPlatform,
): MobileDeviceMatrix[] {
  const matrix = isMobileTestingStrategy(strategyOrMatrix) ? strategyOrMatrix.deviceMatrix : strategyOrMatrix;
  return matrix.filter((entry) => entry.platform === platform);
}

function isMobileTestingStrategy(
  strategyOrEntries: MobileTestingStrategy | readonly MobileSmokeFlow[] | readonly MobileDeviceMatrix[],
): strategyOrEntries is MobileTestingStrategy {
  return !Array.isArray(strategyOrEntries);
}
