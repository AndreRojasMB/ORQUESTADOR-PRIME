import type {
  MobileAppFactoryAppType,
  MobileAppFactoryIntake,
  MobileAppFactoryStrategy,
  MobileReleaseTarget,
  MobileScreenMapItem,
} from "./mobileAppFactoryStrategy.js";
import type { MobileArchitectureProfile } from "./mobileArchitectureProfile.js";
import type { PMEvidenceReference, PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type MobileUxPatternCategory =
  | "onboarding"
  | "authentication"
  | "navigation"
  | "dashboard"
  | "profile_settings"
  | "forms"
  | "content_lists"
  | "detail_views"
  | "empty_loading_error"
  | "offline_sync"
  | "monetization"
  | "messaging"
  | "gamification_progress"
  | "safety_trust"
  | "accessibility"
  | "notifications_permissions";

export type MobileScreenStateType =
  | "empty"
  | "loading"
  | "error"
  | "offline"
  | "permission_denied"
  | "unauthenticated"
  | "partial_data"
  | "success"
  | "sync_pending"
  | "rate_limited";

export type MobileUxRecommendationPriority = "primary" | "supporting" | "conditional";

export interface MobileUxSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noUiGeneration: true;
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

export interface MobileUxPattern {
  patternId: string;
  name: string;
  category: MobileUxPatternCategory;
  appTypes: ReadonlyArray<MobileAppFactoryAppType | "any">;
  targetScreens: ReadonlyArray<string>;
  userGoal: string;
  recommendedStructure: ReadonlyArray<string>;
  requiredStates: ReadonlyArray<string>;
  accessibilityNotes: ReadonlyArray<string>;
  safetyNotes: ReadonlyArray<string>;
  monetizationNotes: ReadonlyArray<string>;
  navigationNotes: ReadonlyArray<string>;
  dataNeeds: ReadonlyArray<string>;
  riskLevel: PMRiskTier;
  requiredApprovals: ReadonlyArray<string>;
  implementationHints: ReadonlyArray<string>;
  limitations: ReadonlyArray<string>;
  safetyBoundaries: MobileUxSafetyBoundaries;
}

export interface MobileScreenStatePattern {
  screenStateId: string;
  stateType: MobileScreenStateType;
  trigger: string;
  userMessage: string;
  primaryAction: string;
  secondaryAction: string;
  recoveryPath: string;
  telemetryHint: string;
  accessibilityRequirement: string;
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    MobileUxSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noUiGeneration" | "noRuntimeExecution"
  >;
}

export interface MobileUxPatternCatalogInput {
  catalogId?: string;
  phaseRef?: ProjectPhaseRef;
  appType?: MobileAppFactoryAppType;
  appTypes?: ReadonlyArray<MobileAppFactoryAppType>;
  targetUsers?: ReadonlyArray<string>;
  coreFlows?: ReadonlyArray<string>;
  screenMap?: ReadonlyArray<MobileScreenMapItem | string>;
  navigationNeeds?: ReadonlyArray<string>;
  authNeeds?: ReadonlyArray<string>;
  offlineNeeds?: ReadonlyArray<string>;
  monetizationNeeds?: ReadonlyArray<string>;
  safetyNeeds?: ReadonlyArray<string>;
  releaseTarget?: MobileReleaseTarget;
  architectureLayers?: ReadonlyArray<string>;
  factoryIntake?: MobileAppFactoryIntake;
  factoryStrategy?: MobileAppFactoryStrategy;
  architectureProfile?: MobileArchitectureProfile;
  evidenceRefs?: ReadonlyArray<PMEvidenceReference>;
  assumptions?: ReadonlyArray<string>;
  limitations?: ReadonlyArray<string>;
}

export interface MobileUxPatternRecommendation {
  recommendationId: string;
  patternId: string;
  category: MobileUxPatternCategory;
  appTypes: ReadonlyArray<MobileAppFactoryAppType | "any">;
  targetScreens: ReadonlyArray<string>;
  reason: string;
  priority: MobileUxRecommendationPriority;
  riskLevel: PMRiskTier;
  requiredApprovals: ReadonlyArray<string>;
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<MobileUxSafetyBoundaries, "advisoryOnly" | "metadataOnly" | "noUiGeneration">;
}

export interface MobileUxPatternSummary {
  catalogId: string;
  patternCount: number;
  screenStatePatternCount: number;
  categories: ReadonlyArray<MobileUxPatternCategory>;
  appTypes: ReadonlyArray<MobileAppFactoryAppType | "any">;
  targetScreenCount: number;
  highestRiskLevel: PMRiskTier;
  requiredApprovalCount: number;
  recommendedNextPhase: string;
  safeSummary: string;
  safetyBoundaries: MobileUxSafetyBoundaries;
}

export interface MobileUxPatternCatalog {
  catalogId: string;
  phaseRef?: ProjectPhaseRef;
  purpose: string;
  appTypes: ReadonlyArray<MobileAppFactoryAppType>;
  targetUsers: ReadonlyArray<string>;
  coreFlows: ReadonlyArray<string>;
  screenMap: ReadonlyArray<string>;
  navigationNeeds: ReadonlyArray<string>;
  authNeeds: ReadonlyArray<string>;
  offlineNeeds: ReadonlyArray<string>;
  monetizationNeeds: ReadonlyArray<string>;
  safetyNeeds: ReadonlyArray<string>;
  releaseTarget?: MobileReleaseTarget;
  architectureLayers: ReadonlyArray<string>;
  patterns: ReadonlyArray<MobileUxPattern>;
  screenStatePatterns: ReadonlyArray<MobileScreenStatePattern>;
  recommendations: ReadonlyArray<MobileUxPatternRecommendation>;
  summary: MobileUxPatternSummary;
  evidenceRefs: ReadonlyArray<PMEvidenceReference>;
  assumptions: ReadonlyArray<string>;
  limitations: ReadonlyArray<string>;
  consumedFactoryMetadata: ReadonlyArray<string>;
  consumedArchitectureMetadata: ReadonlyArray<string>;
  conversationalBuildLoopReadiness: ReadonlyArray<string>;
  safetyBoundaries: MobileUxSafetyBoundaries;
}

const safetyBoundaries: MobileUxSafetyBoundaries = {
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noUiGeneration: true,
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

export const mobileUxPatternCategories: ReadonlyArray<MobileUxPatternCategory> = [
  "onboarding",
  "authentication",
  "navigation",
  "dashboard",
  "profile_settings",
  "forms",
  "content_lists",
  "detail_views",
  "empty_loading_error",
  "offline_sync",
  "monetization",
  "messaging",
  "gamification_progress",
  "safety_trust",
  "accessibility",
  "notifications_permissions",
];

function uniqueStrings(values: ReadonlyArray<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim()))];
}

function riskWeight(riskLevel: PMRiskTier): number {
  if (riskLevel === "high") {
    return 3;
  }

  if (riskLevel === "medium") {
    return 2;
  }

  return 1;
}

function highestRisk(values: ReadonlyArray<PMRiskTier>): PMRiskTier {
  return values.reduce<PMRiskTier>((highest, current) => (riskWeight(current) > riskWeight(highest) ? current : highest), "low");
}

function normalizeScreenMap(screenMap: MobileUxPatternCatalogInput["screenMap"]): string[] {
  return uniqueStrings(
    (screenMap ?? []).map((screen) => (typeof screen === "string" ? screen : screen.title ?? screen.screenId)),
  );
}

function deriveAppTypes(input: MobileUxPatternCatalogInput): MobileAppFactoryAppType[] {
  return uniqueStrings([
    input.appType,
    ...(input.appTypes ?? []),
    input.factoryIntake?.supportedAppType,
    input.factoryStrategy?.appType,
  ]) as MobileAppFactoryAppType[];
}

function deriveArchitectureLayers(input: MobileUxPatternCatalogInput): string[] {
  return uniqueStrings([
    ...(input.architectureLayers ?? []),
    ...(input.architectureProfile?.recommendedProjectStructure.map((layer) => layer.layer) ?? []),
  ]);
}

export function createMobileUxPattern(
  pattern: Omit<MobileUxPattern, "safetyBoundaries"> & { safetyBoundaries?: MobileUxSafetyBoundaries },
): MobileUxPattern {
  return {
    ...pattern,
    targetScreens: [...pattern.targetScreens],
    appTypes: [...pattern.appTypes],
    recommendedStructure: [...pattern.recommendedStructure],
    requiredStates: [...pattern.requiredStates],
    accessibilityNotes: [...pattern.accessibilityNotes],
    safetyNotes: [...pattern.safetyNotes],
    monetizationNotes: [...pattern.monetizationNotes],
    navigationNotes: [...pattern.navigationNotes],
    dataNeeds: [...pattern.dataNeeds],
    requiredApprovals: [...pattern.requiredApprovals],
    implementationHints: [...pattern.implementationHints],
    limitations: [...pattern.limitations],
    safetyBoundaries: pattern.safetyBoundaries ?? safetyBoundaries,
  };
}

export function createMobileScreenStatePattern(
  statePattern: Omit<MobileScreenStatePattern, "safetyBoundaries"> & {
    safetyBoundaries?: MobileScreenStatePattern["safetyBoundaries"];
  },
): MobileScreenStatePattern {
  return {
    ...statePattern,
    safetyBoundaries: statePattern.safetyBoundaries ?? {
      sourceOnly: true,
      advisoryOnly: true,
      metadataOnly: true,
      noUiGeneration: true,
      noRuntimeExecution: true,
    },
  };
}

function defaultScreenStatePatterns(): MobileScreenStatePattern[] {
  return [
    createMobileScreenStatePattern({
      screenStateId: "state-loading-progressive",
      stateType: "loading",
      trigger: "Remote or local data is not ready yet.",
      userMessage: "Loading the latest available information.",
      primaryAction: "Wait in place with a visible progress affordance.",
      secondaryAction: "Allow back navigation where safe.",
      recoveryPath: "Show cached or partial data when available.",
      telemetryHint: "Measure time to useful content without collecting sensitive payloads.",
      accessibilityRequirement: "Announce loading status through an accessible live region.",
      riskLevel: "low",
    }),
    createMobileScreenStatePattern({
      screenStateId: "state-empty-first-run",
      stateType: "empty",
      trigger: "The user has no records, messages, products, or configured items.",
      userMessage: "Nothing is available here yet.",
      primaryAction: "Offer one clear next step.",
      secondaryAction: "Provide a learning or browse path if available.",
      recoveryPath: "Avoid dead ends and keep global navigation reachable.",
      telemetryHint: "Track empty-state action selection only at aggregate level.",
      accessibilityRequirement: "Use clear text labels and avoid icon-only calls to action.",
      riskLevel: "low",
    }),
    createMobileScreenStatePattern({
      screenStateId: "state-error-retry",
      stateType: "error",
      trigger: "A recoverable request or validation operation fails.",
      userMessage: "Something could not be completed.",
      primaryAction: "Retry safely.",
      secondaryAction: "Contact support or return to the previous screen.",
      recoveryPath: "Preserve user input and explain what can be tried next.",
      telemetryHint: "Record error category, not secrets or raw form values.",
      accessibilityRequirement: "Move focus to the error summary after failure.",
      riskLevel: "medium",
    }),
    createMobileScreenStatePattern({
      screenStateId: "state-offline-cached",
      stateType: "offline",
      trigger: "Network is unavailable while the app has cached content.",
      userMessage: "You are offline. Showing saved information.",
      primaryAction: "Continue with cached data.",
      secondaryAction: "Retry sync later.",
      recoveryPath: "Queue allowed changes as drafts only when product policy permits it.",
      telemetryHint: "Track offline mode entry and successful recovery, not content payloads.",
      accessibilityRequirement: "Do not rely on color alone to mark offline status.",
      riskLevel: "medium",
    }),
    createMobileScreenStatePattern({
      screenStateId: "state-permission-denied",
      stateType: "permission_denied",
      trigger: "The user denies camera, location, contacts, or notification permission.",
      userMessage: "This feature needs permission before it can work.",
      primaryAction: "Open the relevant settings path.",
      secondaryAction: "Continue without this feature when possible.",
      recoveryPath: "Explain the benefit and never block unrelated flows.",
      telemetryHint: "Track permission outcome as a category only.",
      accessibilityRequirement: "Explain the permission in plain language before any system prompt.",
      riskLevel: "medium",
    }),
    createMobileScreenStatePattern({
      screenStateId: "state-unauthenticated",
      stateType: "unauthenticated",
      trigger: "A protected flow requires an authenticated user.",
      userMessage: "Sign in to continue.",
      primaryAction: "Continue to sign in.",
      secondaryAction: "Browse public content where allowed.",
      recoveryPath: "Return to the original intent after authentication.",
      telemetryHint: "Track auth funnel step, not credentials.",
      accessibilityRequirement: "Keep input labels persistent and readable.",
      riskLevel: "medium",
    }),
    createMobileScreenStatePattern({
      screenStateId: "state-sync-pending",
      stateType: "sync_pending",
      trigger: "A local draft or offline-safe action is waiting for sync.",
      userMessage: "Your changes are saved on this device and waiting to sync.",
      primaryAction: "Keep working.",
      secondaryAction: "Review sync status.",
      recoveryPath: "Give clear conflict-resolution guidance before overwriting data.",
      telemetryHint: "Track pending counts and sync outcome, not user-entered content.",
      accessibilityRequirement: "Expose sync status as text in addition to icons.",
      riskLevel: "medium",
    }),
    createMobileScreenStatePattern({
      screenStateId: "state-partial-data",
      stateType: "partial_data",
      trigger: "Only part of the expected data is available or freshly loaded.",
      userMessage: "Some information may be incomplete.",
      primaryAction: "Review available details.",
      secondaryAction: "Refresh or inspect source context.",
      recoveryPath: "Label missing fields and avoid presenting partial data as complete.",
      telemetryHint: "Track partial-data state entry without capturing raw business payloads.",
      accessibilityRequirement: "Place the incomplete-data notice before dependent content.",
      riskLevel: "medium",
    }),
  ];
}

function defaultPatterns(): MobileUxPattern[] {
  return [
    createMobileUxPattern({
      patternId: "ux-onboarding-progressive-value",
      name: "Progressive value onboarding",
      category: "onboarding",
      appTypes: ["any"],
      targetScreens: ["welcome", "setup", "first-run"],
      userGoal: "Understand the app value and reach a first useful action quickly.",
      recommendedStructure: ["value statement", "one-step setup", "skip path", "first useful action"],
      requiredStates: ["state-loading-progressive", "state-error-retry"],
      accessibilityNotes: ["Keep copy short", "Support screen reader order", "Avoid timed carousels"],
      safetyNotes: ["Do not request sensitive permissions before context is clear"],
      monetizationNotes: ["Do not place purchase pressure before value is demonstrated"],
      navigationNotes: ["Allow skip or later setup unless regulated onboarding requires completion"],
      dataNeeds: ["target users", "core flows", "required setup decisions"],
      riskLevel: "low",
      requiredApprovals: [],
      implementationHints: ["Use step count only when it helps orientation", "Keep first-run decisions reversible"],
      limitations: ["This is a pattern recommendation, not a generated onboarding flow"],
    }),
    createMobileUxPattern({
      patternId: "ux-authentication-contextual-gate",
      name: "Contextual authentication gate",
      category: "authentication",
      appTypes: ["marketplace_app", "social_freemium_app", "erp_mobile_field_ops_app", "dashboard_companion_app"],
      targetScreens: ["sign-in", "account", "protected-action"],
      userGoal: "Authenticate only when a protected action or private data access requires it.",
      recommendedStructure: ["public preview", "auth reason", "credential form", "return path"],
      requiredStates: ["state-unauthenticated", "state-error-retry", "state-loading-progressive"],
      accessibilityNotes: ["Use persistent labels", "Describe errors next to affected fields"],
      safetyNotes: ["Never expose credentials in telemetry", "Avoid ambiguous auth recovery paths"],
      monetizationNotes: ["Separate payment prompts from identity prompts"],
      navigationNotes: ["Return the user to the original protected intent after sign-in"],
      dataNeeds: ["auth requirements", "public/private route split", "account recovery policy"],
      riskLevel: "medium",
      requiredApprovals: ["auth policy review"],
      implementationHints: ["Keep public browsing available when product policy allows it"],
      limitations: ["No session, password, token, or provider implementation is included"],
    }),
    createMobileUxPattern({
      patternId: "ux-navigation-role-aware-shell",
      name: "Role-aware mobile navigation shell",
      category: "navigation",
      appTypes: ["any"],
      targetScreens: ["home", "tabs", "drawer", "detail"],
      userGoal: "Move across core flows without losing context or access boundaries.",
      recommendedStructure: ["primary nav", "secondary actions", "deep-link return", "safe back path"],
      requiredStates: ["state-loading-progressive", "state-error-retry"],
      accessibilityNotes: ["Provide descriptive tab labels", "Keep touch targets large enough"],
      safetyNotes: ["Do not reveal hidden roles or private routes in public navigation"],
      monetizationNotes: ["Keep upgrade entry points distinguishable from core navigation"],
      navigationNotes: ["Use tabs for repeated destinations and stack flows for detail work"],
      dataNeeds: ["screen map", "navigation needs", "role boundaries"],
      riskLevel: "medium",
      requiredApprovals: ["information architecture review"],
      implementationHints: ["Favor predictable back behavior over novelty"],
      limitations: ["Does not generate navigation components or route files"],
    }),
    createMobileUxPattern({
      patternId: "ux-dashboard-actionable-snapshot",
      name: "Actionable dashboard snapshot",
      category: "dashboard",
      appTypes: ["dashboard_companion_app", "erp_mobile_field_ops_app", "dashboard_companion_app", "habit_gamified_app"],
      targetScreens: ["dashboard", "overview", "home"],
      userGoal: "Scan important status and choose the next action quickly.",
      recommendedStructure: ["status summary", "priority cards", "recent activity", "next actions"],
      requiredStates: ["state-loading-progressive", "state-empty-first-run", "state-error-retry"],
      accessibilityNotes: ["Use headings for sections", "Do not encode status only by color"],
      safetyNotes: ["Separate advisory metrics from verified facts"],
      monetizationNotes: ["Avoid mixing ads or upsells into critical status areas"],
      navigationNotes: ["Link each summary to an inspectable detail screen"],
      dataNeeds: ["summary metrics", "recency metadata", "source freshness"],
      riskLevel: "medium",
      requiredApprovals: ["data interpretation review"],
      implementationHints: ["Show stale data explicitly", "Prioritize user tasks over vanity metrics"],
      limitations: ["No analytics widgets or visual components are generated"],
    }),
    createMobileUxPattern({
      patternId: "ux-profile-settings-control-center",
      name: "Profile and settings control center",
      category: "profile_settings",
      appTypes: ["any"],
      targetScreens: ["profile", "settings", "account"],
      userGoal: "Review identity, preferences, privacy settings, and account controls.",
      recommendedStructure: ["identity summary", "preferences", "privacy controls", "support links"],
      requiredStates: ["state-loading-progressive", "state-error-retry"],
      accessibilityNotes: ["Group settings with clear headings", "Use explicit toggle labels"],
      safetyNotes: ["Make destructive or privacy-impacting settings require confirmation"],
      monetizationNotes: ["Separate plan management from personal safety settings"],
      navigationNotes: ["Keep support and sign-out paths discoverable but not destructive by accident"],
      dataNeeds: ["account fields", "settings policy", "privacy options"],
      riskLevel: "medium",
      requiredApprovals: ["privacy review"],
      implementationHints: ["Make defaults visible and reversible"],
      limitations: ["Does not create account storage or settings screens"],
    }),
    createMobileUxPattern({
      patternId: "ux-forms-guided-input",
      name: "Guided mobile form input",
      category: "forms",
      appTypes: ["marketplace_app", "erp_mobile_field_ops_app", "service_booking_app", "dashboard_companion_app", "education_app"],
      targetScreens: ["create", "edit", "checkout", "booking", "survey"],
      userGoal: "Complete structured input with low error rate and clear recovery.",
      recommendedStructure: ["field groups", "inline validation", "save draft", "review before submit"],
      requiredStates: ["state-error-retry", "state-sync-pending", "state-offline-cached"],
      accessibilityNotes: ["Use real labels", "Announce validation errors", "Support keyboard navigation"],
      safetyNotes: ["Preserve drafts during failures", "Do not log raw sensitive field values"],
      monetizationNotes: ["Clarify paid fields or fees before final submission"],
      navigationNotes: ["Warn before losing unsaved changes"],
      dataNeeds: ["field requirements", "validation policy", "draft policy"],
      riskLevel: "medium",
      requiredApprovals: ["data handling review"],
      implementationHints: ["Prefer progressive disclosure over long ungrouped forms"],
      limitations: ["No form schema or component implementation is generated"],
    }),
    createMobileUxPattern({
      patternId: "ux-content-lists-filtered-browse",
      name: "Filtered browse list",
      category: "content_lists",
      appTypes: ["marketplace_app", "education_app", "social_freemium_app", "education_app", "marketplace_app"],
      targetScreens: ["list", "catalog", "feed", "marketplace_app"],
      userGoal: "Find relevant items with filters, sorting, and clear evidence of freshness.",
      recommendedStructure: ["search/filter row", "result cards", "sort option", "empty state"],
      requiredStates: ["state-loading-progressive", "state-empty-first-run", "state-error-retry"],
      accessibilityNotes: ["Expose filter state as text", "Keep result card actions labeled"],
      safetyNotes: ["Do not hide low confidence or stale content behind ranking alone"],
      monetizationNotes: ["Clearly label sponsored or promoted placement if it exists"],
      navigationNotes: ["Preserve filters when opening and returning from detail"],
      dataNeeds: ["item summaries", "filter facets", "rank rationale"],
      riskLevel: "medium",
      requiredApprovals: ["ranking transparency review"],
      implementationHints: ["Use stable item identity and visible active filters"],
      limitations: ["Does not implement search, ranking, or list UI"],
    }),
    createMobileUxPattern({
      patternId: "ux-detail-views-evidence-led",
      name: "Evidence-led detail view",
      category: "detail_views",
      appTypes: ["marketplace_app", "marketplace_app", "education_app", "habit_gamified_app", "dashboard_companion_app"],
      targetScreens: ["detail", "profile", "product", "service"],
      userGoal: "Inspect a specific item with enough context to decide what to do next.",
      recommendedStructure: ["identity", "key facts", "source/evidence area", "actions", "related items"],
      requiredStates: ["state-loading-progressive", "state-error-retry", "state-partial-data"],
      accessibilityNotes: ["Use heading hierarchy", "Describe source links clearly"],
      safetyNotes: ["Distinguish observed data from verified claims"],
      monetizationNotes: ["Do not imply paid listings are more verified unless evidence supports it"],
      navigationNotes: ["Keep source inspection and return navigation available"],
      dataNeeds: ["entity facts", "source URLs", "confidence or trust signals"],
      riskLevel: "high",
      requiredApprovals: ["claims and evidence review"],
      implementationHints: ["Show evidence close to the claim it supports"],
      limitations: ["Does not create public detail screens or data fetches"],
    }),
    createMobileUxPattern({
      patternId: "ux-empty-loading-error-resilient",
      name: "Resilient empty, loading, and error states",
      category: "empty_loading_error",
      appTypes: ["any"],
      targetScreens: ["all user-facing screens"],
      userGoal: "Understand what is happening and recover without losing work.",
      recommendedStructure: ["status message", "safe action", "secondary path", "support hint"],
      requiredStates: ["state-loading-progressive", "state-empty-first-run", "state-error-retry"],
      accessibilityNotes: ["Announce state changes", "Keep focus behavior predictable"],
      safetyNotes: ["Never expose stack traces or secrets in user-facing errors"],
      monetizationNotes: ["Do not use error states as dark-pattern upgrade prompts"],
      navigationNotes: ["Keep back and home paths available where safe"],
      dataNeeds: ["failure categories", "recovery actions", "support policy"],
      riskLevel: "medium",
      requiredApprovals: ["error copy review"],
      implementationHints: ["Define state behavior before building screens"],
      limitations: ["Only models state patterns; it does not implement state machines"],
    }),
    createMobileUxPattern({
      patternId: "ux-offline-sync-transparent",
      name: "Transparent offline and sync",
      category: "offline_sync",
      appTypes: ["erp_mobile_field_ops_app", "habit_gamified_app", "dashboard_companion_app", "education_app", "service_booking_app"],
      targetScreens: ["offline queue", "sync status", "forms", "lists"],
      userGoal: "Keep using safe parts of the app while understanding sync risk.",
      recommendedStructure: ["offline banner", "cached content", "pending queue", "conflict guidance"],
      requiredStates: ["state-offline-cached", "state-sync-pending", "state-error-retry"],
      accessibilityNotes: ["Expose sync status in text", "Avoid color-only offline indicators"],
      safetyNotes: ["Never silently overwrite conflicting data"],
      monetizationNotes: ["Do not gate critical offline recovery behind monetization"],
      navigationNotes: ["Let users review pending items before retrying sync"],
      dataNeeds: ["cache policy", "sync rules", "conflict policy"],
      riskLevel: "high",
      requiredApprovals: ["offline data policy review"],
      implementationHints: ["Design offline rules before persistence work begins"],
      limitations: ["No persistence, sync engine, or background task is generated"],
    }),
    createMobileUxPattern({
      patternId: "ux-monetization-clear-value",
      name: "Clear value monetization",
      category: "monetization",
      appTypes: ["marketplace_app", "education_app", "education_app", "habit_gamified_app", "habit_gamified_app"],
      targetScreens: ["pricing", "checkout", "subscription", "upgrade"],
      userGoal: "Understand what is paid, what is free, and what changes after payment.",
      recommendedStructure: ["benefits", "limits", "price context", "confirmation", "receipt path"],
      requiredStates: ["state-loading-progressive", "state-error-retry"],
      accessibilityNotes: ["Make price and renewal terms readable", "Do not hide cancellation details"],
      safetyNotes: ["Avoid misleading urgency or hidden recurring terms"],
      monetizationNotes: ["Label paid features and trial boundaries plainly"],
      navigationNotes: ["Keep cancellation and help paths findable"],
      dataNeeds: ["plan rules", "pricing copy", "refund and cancellation policy"],
      riskLevel: "high",
      requiredApprovals: ["legal and monetization review"],
      implementationHints: ["Separate advisory copy from billing implementation"],
      limitations: ["No payment provider, purchase flow, or entitlement logic is included"],
    }),
    createMobileUxPattern({
      patternId: "ux-messaging-safe-thread",
      name: "Safe messaging thread",
      category: "messaging",
      appTypes: ["social_freemium_app", "marketplace_app", "service_booking_app", "ai_assistant_mobile_app", "education_app"],
      targetScreens: ["inbox", "thread", "conversation", "support chat"],
      userGoal: "Communicate with context, clear status, and abuse-resistant controls.",
      recommendedStructure: ["thread context", "message list", "composer", "delivery state", "report controls"],
      requiredStates: ["state-loading-progressive", "state-error-retry", "state-offline-cached"],
      accessibilityNotes: ["Announce new messages carefully", "Keep composer controls labeled"],
      safetyNotes: ["Include report/block affordances for user-generated communication"],
      monetizationNotes: ["Disclose paid priority support or promoted contact rules"],
      navigationNotes: ["Preserve return to the originating item or request"],
      dataNeeds: ["message status", "participant identity policy", "moderation policy"],
      riskLevel: "high",
      requiredApprovals: ["safety and moderation review"],
      implementationHints: ["Model abuse and offline delivery states before implementation"],
      limitations: ["No chat backend, transport, or automated moderation is included"],
    }),
    createMobileUxPattern({
      patternId: "ux-gamification-progress-ethical",
      name: "Ethical progress and motivation",
      category: "gamification_progress",
      appTypes: ["education_app", "habit_gamified_app", "habit_gamified_app", "habit_gamified_app"],
      targetScreens: ["progress", "habit", "lesson", "goal"],
      userGoal: "Understand progress and stay motivated without manipulative pressure.",
      recommendedStructure: ["goal context", "progress indicator", "next milestone", "reflection path"],
      requiredStates: ["state-empty-first-run", "state-loading-progressive", "state-error-retry"],
      accessibilityNotes: ["Represent progress in text", "Avoid motion-only feedback"],
      safetyNotes: ["Avoid shame-based copy or risky health/finance pressure"],
      monetizationNotes: ["Do not make streak loss a coercive purchase mechanic"],
      navigationNotes: ["Link progress to the next meaningful action"],
      dataNeeds: ["goal definitions", "progress source", "reset rules"],
      riskLevel: "medium",
      requiredApprovals: ["behavioral safety review"],
      implementationHints: ["Make streaks forgiving and explain calculations"],
      limitations: ["No progress engine or reward system is generated"],
    }),
    createMobileUxPattern({
      patternId: "ux-safety-trust-explainable",
      name: "Explainable safety and trust layer",
      category: "safety_trust",
      appTypes: ["marketplace_app", "marketplace_app", "habit_gamified_app", "dashboard_companion_app", "social_freemium_app"],
      targetScreens: ["detail", "profile", "checkout", "report", "trust center"],
      userGoal: "Understand why something appears trustworthy and how to challenge it.",
      recommendedStructure: ["trust signal", "source explanation", "risk notice", "report/correction path"],
      requiredStates: ["state-error-retry", "state-partial-data"],
      accessibilityNotes: ["Explain icons and badges with text", "Keep notices close to affected content"],
      safetyNotes: ["Do not turn advisory trust signals into absolute verification claims"],
      monetizationNotes: ["Keep paid placement separate from trust scoring"],
      navigationNotes: ["Provide paths to source inspection and reporting"],
      dataNeeds: ["trust reason", "source reference", "review status"],
      riskLevel: "high",
      requiredApprovals: ["trust and safety review"],
      implementationHints: ["Expose why a recommendation exists before asking for user trust"],
      limitations: ["No enforcement, moderation, or verification workflow is implemented"],
    }),
    createMobileUxPattern({
      patternId: "ux-accessibility-baseline",
      name: "Mobile accessibility baseline",
      category: "accessibility",
      appTypes: ["any"],
      targetScreens: ["all user-facing screens"],
      userGoal: "Use core flows with screen reader, keyboard, large text, and sufficient contrast.",
      recommendedStructure: ["semantic labels", "focus order", "large touch targets", "contrast checks"],
      requiredStates: ["state-loading-progressive", "state-error-retry", "state-empty-first-run"],
      accessibilityNotes: ["Define accessibility acceptance checks for every pattern"],
      safetyNotes: ["Do not hide critical warnings from assistive technologies"],
      monetizationNotes: ["Paid prompts must meet the same accessibility standard as core flows"],
      navigationNotes: ["Ensure visible and accessible focus movement through navigation"],
      dataNeeds: ["supported accessibility settings", "content hierarchy", "copy rules"],
      riskLevel: "high",
      requiredApprovals: ["accessibility review"],
      implementationHints: ["Treat accessibility as acceptance criteria, not polish"],
      limitations: ["No UI audit or automated accessibility runner is included"],
    }),
    createMobileUxPattern({
      patternId: "ux-notifications-permissions-consent",
      name: "Permission and notification consent",
      category: "notifications_permissions",
      appTypes: ["service_booking_app", "education_app", "habit_gamified_app", "marketplace_app", "erp_mobile_field_ops_app", "social_freemium_app"],
      targetScreens: ["permission primer", "notification settings", "reminder setup"],
      userGoal: "Choose permissions and notifications with clear benefit and control.",
      recommendedStructure: ["context primer", "system prompt", "preference controls", "fallback path"],
      requiredStates: ["state-permission-denied", "state-error-retry"],
      accessibilityNotes: ["Explain permission choices in text before system prompts"],
      safetyNotes: ["Never nag for sensitive permissions after denial without new context"],
      monetizationNotes: ["Do not require notifications for unrelated paid features"],
      navigationNotes: ["Offer a settings path and a continue-without path"],
      dataNeeds: ["permission purpose", "notification categories", "quiet hours or opt-out policy"],
      riskLevel: "medium",
      requiredApprovals: ["privacy and consent review"],
      implementationHints: ["Ask after intent is clear, not on first launch by default"],
      limitations: ["No platform permission code or push service is configured"],
    }),
  ];
}

function categoryIsRelevant(category: MobileUxPatternCategory, input: MobileUxPatternCatalogInput): boolean {
  const appTypes = deriveAppTypes(input);
  const coreFlows = uniqueStrings([...(input.coreFlows ?? []), ...(input.factoryIntake?.coreFlows ?? [])]).join(" ").toLowerCase();
  const screenMap = normalizeScreenMap(input.screenMap ?? input.factoryIntake?.screenMap).join(" ").toLowerCase();
  const hasNeed = (values: MobileUxPatternCatalogInput[keyof MobileUxPatternCatalogInput]): boolean =>
    Array.isArray(values) && values.length > 0;

  const alwaysRelevant: ReadonlyArray<MobileUxPatternCategory> = [
    "onboarding",
    "navigation",
    "empty_loading_error",
    "accessibility",
  ];

  if (alwaysRelevant.includes(category)) {
    return true;
  }

  if (category === "authentication") {
    return hasNeed(input.authNeeds) || appTypes.some((type) => ["marketplace_app", "social_freemium_app", "erp_mobile_field_ops_app"].includes(type));
  }

  if (category === "offline_sync") {
    return hasNeed(input.offlineNeeds) || coreFlows.includes("offline") || screenMap.includes("sync");
  }

  if (category === "monetization") {
    return hasNeed(input.monetizationNeeds) || appTypes.some((type) => ["marketplace_app", "education_app", "education_app"].includes(type));
  }

  if (category === "safety_trust") {
    return hasNeed(input.safetyNeeds) || appTypes.some((type) => ["marketplace_app", "marketplace_app", "social_freemium_app"].includes(type));
  }

  if (category === "messaging") {
    return coreFlows.includes("message") || coreFlows.includes("chat") || appTypes.some((type) => ["social_freemium_app", "ai_assistant_mobile_app"].includes(type));
  }

  if (category === "notifications_permissions") {
    return coreFlows.includes("notification") || coreFlows.includes("reminder") || screenMap.includes("permission");
  }

  if (category === "dashboard") {
    return appTypes.some((type) => ["dashboard_companion_app", "erp_mobile_field_ops_app", "dashboard_companion_app"].includes(type)) || screenMap.includes("dashboard");
  }

  if (category === "forms") {
    return coreFlows.includes("create") || coreFlows.includes("book") || screenMap.includes("form") || screenMap.includes("edit");
  }

  if (category === "content_lists" || category === "detail_views") {
    return screenMap.length > 0 || appTypes.some((type) => ["marketplace_app", "marketplace_app", "education_app", "education_app"].includes(type));
  }

  if (category === "gamification_progress") {
    return appTypes.some((type) => ["education_app", "habit_gamified_app", "habit_gamified_app", "habit_gamified_app"].includes(type)) || coreFlows.includes("progress");
  }

  if (category === "profile_settings") {
    return screenMap.includes("profile") || screenMap.includes("settings") || appTypes.length > 0;
  }

  return false;
}

function patternMatchesAppType(pattern: MobileUxPattern, appTypes: ReadonlyArray<MobileAppFactoryAppType>): boolean {
  return pattern.appTypes.includes("any") || appTypes.some((appType) => pattern.appTypes.includes(appType));
}

export function selectMobileUxPatternsByCategory(
  catalogOrPatterns: MobileUxPatternCatalog | ReadonlyArray<MobileUxPattern>,
  category: MobileUxPatternCategory,
): MobileUxPattern[] {
  const patterns: ReadonlyArray<MobileUxPattern> = "patterns" in catalogOrPatterns ? catalogOrPatterns.patterns : catalogOrPatterns;
  return patterns.filter((pattern) => pattern.category === category);
}

export function selectMobileUxPatternsByAppType(
  catalogOrPatterns: MobileUxPatternCatalog | ReadonlyArray<MobileUxPattern>,
  appType: MobileAppFactoryAppType,
): MobileUxPattern[] {
  const patterns: ReadonlyArray<MobileUxPattern> = "patterns" in catalogOrPatterns ? catalogOrPatterns.patterns : catalogOrPatterns;
  return patterns.filter((pattern) => pattern.appTypes.includes("any") || pattern.appTypes.includes(appType));
}

export function recommendMobileUxPatterns(
  input: MobileUxPatternCatalogInput,
  patterns: ReadonlyArray<MobileUxPattern> = defaultPatterns(),
): MobileUxPatternRecommendation[] {
  const appTypes = deriveAppTypes(input);
  const screenMap = normalizeScreenMap(input.screenMap ?? input.factoryIntake?.screenMap);

  return patterns
    .filter((pattern) => patternMatchesAppType(pattern, appTypes) || pattern.appTypes.includes("any"))
    .filter((pattern) => categoryIsRelevant(pattern.category, input))
    .map((pattern): MobileUxPatternRecommendation => ({
      recommendationId: `recommend-${pattern.patternId}`,
      patternId: pattern.patternId,
      category: pattern.category,
      appTypes: pattern.appTypes,
      targetScreens: pattern.targetScreens,
      reason: screenMap.length > 0
        ? `Pattern is relevant to the requested app metadata and screen map (${screenMap.slice(0, 4).join(", ")}).`
        : "Pattern is relevant to the requested app metadata and should be considered during UX planning.",
      priority: pattern.appTypes.includes("any") || pattern.riskLevel === "high" ? "primary" : "supporting",
      riskLevel: pattern.riskLevel,
      requiredApprovals: pattern.requiredApprovals,
      recommendedNextStep: {
        nextStepId: `next-${pattern.patternId}`,
        title: `Review ${pattern.name}`,
        safeSummary: `Review ${pattern.name} before any mobile screen or component implementation.`,
        priority: pattern.riskLevel,
        decisionMode: "plan_only",
        riskSurfaces: ["scaffold"],
        recommendationOnly: true,
        noExecution: true,
      },
      safetyBoundaries: {
        advisoryOnly: true,
        metadataOnly: true,
        noUiGeneration: true,
      },
    }));
}

export function summarizeMobileUxPatternCatalog(catalog: Pick<MobileUxPatternCatalog, "catalogId" | "patterns" | "screenStatePatterns">): MobileUxPatternSummary {
  const categories = [...new Set(catalog.patterns.map((pattern) => pattern.category))];
  const appTypes = [...new Set(catalog.patterns.flatMap((pattern) => pattern.appTypes))];
  const targetScreenCount = new Set(catalog.patterns.flatMap((pattern) => pattern.targetScreens)).size;
  const requiredApprovalCount = new Set(catalog.patterns.flatMap((pattern) => pattern.requiredApprovals)).size;

  return {
    catalogId: catalog.catalogId,
    patternCount: catalog.patterns.length,
    screenStatePatternCount: catalog.screenStatePatterns.length,
    categories,
    appTypes,
    targetScreenCount,
    highestRiskLevel: highestRisk(catalog.patterns.map((pattern) => pattern.riskLevel)),
    requiredApprovalCount,
    recommendedNextPhase: "Phase 124B — Mobile Navigation Flow Model Plan",
    safeSummary:
      "Mobile UX/UI Pattern Catalog is source-only advisory metadata for planning future mobile UX flows; it does not generate UI, screens, components, apps, native projects, or mobile build commands.",
    safetyBoundaries,
  };
}

export function buildDefaultMobileUxPatternCatalog(input: MobileUxPatternCatalogInput = {}): MobileUxPatternCatalog {
  const appTypes = deriveAppTypes(input);
  const targetUsers = uniqueStrings([...(input.targetUsers ?? []), ...(input.factoryIntake?.targetUsers ?? [])]);
  const coreFlows = uniqueStrings([...(input.coreFlows ?? []), ...(input.factoryIntake?.coreFlows ?? [])]);
  const screenMap = normalizeScreenMap(input.screenMap ?? input.factoryIntake?.screenMap);
  const architectureLayers = deriveArchitectureLayers(input);
  const patterns = defaultPatterns();
  const screenStatePatterns = defaultScreenStatePatterns();
  const releaseTarget = input.releaseTarget ?? input.factoryIntake?.releaseTarget;
  const optionalContext: Partial<Pick<MobileUxPatternCatalog, "phaseRef" | "releaseTarget">> = {};
  const catalogBase = {
    catalogId: input.catalogId ?? "mobile-ux-ui-pattern-catalog-v1",
    patterns,
    screenStatePatterns,
  };
  const recommendations = recommendMobileUxPatterns(input, patterns);

  if (input.phaseRef) {
    optionalContext.phaseRef = input.phaseRef;
  }

  if (releaseTarget) {
    optionalContext.releaseTarget = releaseTarget;
  }

  const catalog: MobileUxPatternCatalog = {
    ...catalogBase,
    ...optionalContext,
    purpose:
      "Provide advisory mobile UX/UI pattern metadata for future app planning without generating screens, components, native projects, or mobile build execution.",
    appTypes,
    targetUsers,
    coreFlows,
    screenMap,
    navigationNeeds: uniqueStrings([
      ...(input.navigationNeeds ?? []),
      ...(input.factoryIntake?.navigationModel.primaryNavigation ?? []),
      ...(input.factoryIntake?.navigationModel.modalNeeds ?? []),
      ...(input.factoryIntake?.navigationModel.deepLinkNeeds ?? []),
      ...(input.factoryIntake?.navigationModel.recoveryPaths ?? []),
    ]),
    authNeeds: uniqueStrings([...(input.authNeeds ?? []), ...(input.factoryIntake?.authNeeds ?? [])]),
    offlineNeeds: uniqueStrings([...(input.offlineNeeds ?? []), ...(input.factoryIntake?.offlineNeeds ?? [])]),
    monetizationNeeds: uniqueStrings([...(input.monetizationNeeds ?? []), ...(input.factoryIntake?.monetizationNeeds ?? [])]),
    safetyNeeds: uniqueStrings([...(input.safetyNeeds ?? []), ...(input.factoryIntake?.safetyNeeds ?? [])]),
    architectureLayers,
    patterns,
    screenStatePatterns,
    recommendations,
    summary: summarizeMobileUxPatternCatalog(catalogBase),
    evidenceRefs: [...(input.evidenceRefs ?? [])],
    assumptions: [
      "The catalog consumes Mobile App Factory and RN/Expo metadata conceptually.",
      "All recommendations remain advisory until a human approves future implementation work.",
      ...(input.assumptions ?? []),
    ],
    limitations: [
      "No UI, screen, component, app, native project, provider, runtime, package, CI, dashboard, DB, memory, or git action is generated by this source module.",
      "Pattern recommendations require future product, accessibility, safety, and implementation review.",
      ...(input.limitations ?? []),
    ],
    consumedFactoryMetadata: [
      "app type",
      "target users",
      "core flows",
      "screen map",
      "navigation needs",
      "auth needs",
      "offline needs",
      "monetization needs",
      "safety needs",
      "release target",
    ],
    consumedArchitectureMetadata: [
      "architecture layers",
      "runtime boundaries",
      "source-only advisory profile constraints",
    ],
    conversationalBuildLoopReadiness: [
      "Can translate a simple product idea into recommended pattern categories for a future planning loop.",
      "Can feed future screen flow planning with required states, risks, approvals, and accessibility notes.",
      "Does not implement conversational automation, screen generation, or mobile app generation.",
    ],
    safetyBoundaries,
  };

  return {
    ...catalog,
    summary: summarizeMobileUxPatternCatalog(catalog),
  };
}
