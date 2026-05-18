import type {
  MobileAppFactoryAppType,
  MobileAppFactoryIntake,
  MobileAppFactoryStrategy,
  MobileReleaseTarget,
} from "./mobileAppFactoryStrategy.js";
import type { MobileArchitectureProfile } from "./mobileArchitectureProfile.js";
import type { MobileNavigationFlowModel } from "./mobileNavigationFlowModel.js";
import type { MobileStateManagementStrategy } from "./mobileStateManagementStrategy.js";
import type { MobileUxPatternCatalog } from "./mobileUxPatternCatalog.js";
import type { OfflineCacheSyncStrategy } from "./offlineCacheSyncStrategy.js";
import type { PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type MobileSecurityCategory =
  | "secure_storage"
  | "auth_session"
  | "token_handling"
  | "network_api"
  | "permissions_privacy"
  | "logging_redaction"
  | "offline_sync"
  | "abuse_safety"
  | "payment_future"
  | "release_signing_future"
  | "third_party_sdk_future"
  | "compliance_advisory";

export type MobileDataSensitivity =
  | "public"
  | "internal"
  | "personal"
  | "sensitive_personal"
  | "financial_future"
  | "child_or_minor_future"
  | "health_future"
  | "unknown";

export type MobileSecurityLikelihood = "unlikely" | "possible" | "likely" | "unknown" | "human_review_required";

export type MobileSecurityImpact = "low" | "medium" | "high" | "critical" | "unknown";

export type MobileSecuritySeverity = "info" | "low" | "medium" | "high" | "critical";

export interface MobileSecuritySafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noAuthImplementation: true;
  noStorageImplementation: true;
  noEncryptionImplementation: true;
  noTokenRuntime: true;
  noApiCalls: true;
  noNetworkCalls: true;
  noPermissionPrompts: true;
  noNativeConfigChanges: true;
  noSecretsOrCredentials: true;
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

export interface MobileSecurityRisk {
  riskId: string;
  riskCategory: MobileSecurityCategory;
  affectedFlow: string;
  affectedData: string;
  likelihood: MobileSecurityLikelihood;
  impact: MobileSecurityImpact;
  severity: MobileSecuritySeverity;
  mitigation: string;
  requiredEvidence: readonly string[];
  approvalRequired: boolean;
  humanReviewRequired: boolean;
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobileSecuritySafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noAuthImplementation" | "noStorageImplementation" | "noApiCalls"
  >;
}

export interface MobileSecurityChecklistItem {
  checklistItemId: string;
  category: MobileSecurityCategory;
  title: string;
  question: string;
  expectedEvidence: readonly string[];
  failureSignal: string;
  severityHint: MobileSecuritySeverity;
  relatedAppTypes: ReadonlyArray<MobileAppFactoryAppType | "any">;
  relatedDataSensitivity: ReadonlyArray<MobileDataSensitivity | "any">;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  safetyBoundaries: Pick<
    MobileSecuritySafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noAuthImplementation" | "noStorageImplementation" | "noNetworkCalls"
  >;
}

export interface MobileSecurityRecommendation {
  recommendationId: string;
  appType: MobileAppFactoryAppType;
  dataSensitivity: MobileDataSensitivity;
  postureSummary: string;
  approvalPosture: string;
  checklistPosture: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<
    MobileSecuritySafetyBoundaries,
    "advisoryOnly" | "metadataOnly" | "noAuthImplementation" | "noStorageImplementation" | "noApiCalls"
  >;
}

export interface MobileSecuritySummary {
  baselineId: string;
  appType: MobileAppFactoryAppType;
  dataSensitivity: MobileDataSensitivity;
  riskCount: number;
  checklistItemCount: number;
  categories: readonly MobileSecurityCategory[];
  highestRiskLevel: PMRiskTier;
  criticalOrHighRiskCount: number;
  approvalRequiredCount: number;
  humanReviewRequiredCount: number;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: MobileSecuritySafetyBoundaries;
}

export interface MobileSecurityBaseline {
  baselineId: string;
  phaseRef: ProjectPhaseRef;
  appType: MobileAppFactoryAppType;
  releaseTarget: MobileReleaseTarget | undefined;
  dataSensitivity: MobileDataSensitivity;
  authRequired: boolean;
  offlineRisk: PMRiskTier;
  storageSecurityPosture: string;
  networkSecurityPosture: string;
  permissionPosture: string;
  privacyPosture: string;
  loggingPosture: string;
  safetyPosture: string;
  releaseSecurityPosture: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  risks: readonly MobileSecurityRisk[];
  checklistItems: readonly MobileSecurityChecklistItem[];
  recommendation: MobileSecurityRecommendation;
  summary: MobileSecuritySummary;
  consumedFactoryMetadata: readonly string[];
  consumedArchitectureMetadata: readonly string[];
  consumedStateMetadata: readonly string[];
  consumedOfflineCacheSyncMetadata: readonly string[];
  pmSolidAutopilotIntegration: readonly string[];
  conversationalBuildLoopReadiness: readonly string[];
  safetyBoundaries: MobileSecuritySafetyBoundaries;
}

export interface MobileSecurityBaselineInput {
  baselineId?: string;
  phaseRef?: ProjectPhaseRef;
  appType?: MobileAppFactoryAppType;
  releaseTarget?: MobileReleaseTarget | undefined;
  dataSensitivity?: MobileDataSensitivity;
  authRequired?: boolean;
  offlineRisk?: PMRiskTier;
  storageSecurityPosture?: string;
  networkSecurityPosture?: string;
  permissionPosture?: string;
  privacyPosture?: string;
  loggingPosture?: string;
  safetyPosture?: string;
  releaseSecurityPosture?: string;
  riskLevel?: PMRiskTier;
  requiredApprovals?: readonly string[];
  limitations?: readonly string[];
  risks?: readonly MobileSecurityRisk[];
  checklistItems?: readonly MobileSecurityChecklistItem[];
  factoryIntake?: MobileAppFactoryIntake;
  factoryStrategy?: MobileAppFactoryStrategy;
  architectureProfile?: MobileArchitectureProfile;
  stateStrategy?: MobileStateManagementStrategy;
  navigationFlow?: MobileNavigationFlowModel;
  uxPatternCatalog?: MobileUxPatternCatalog;
  offlineCacheSyncStrategy?: OfflineCacheSyncStrategy;
}

export const mobileSecurityCategories: readonly MobileSecurityCategory[] = [
  "secure_storage",
  "auth_session",
  "token_handling",
  "network_api",
  "permissions_privacy",
  "logging_redaction",
  "offline_sync",
  "abuse_safety",
  "payment_future",
  "release_signing_future",
  "third_party_sdk_future",
  "compliance_advisory",
];

const safetyBoundaries: MobileSecuritySafetyBoundaries = {
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noAuthImplementation: true,
  noStorageImplementation: true,
  noEncryptionImplementation: true,
  noTokenRuntime: true,
  noApiCalls: true,
  noNetworkCalls: true,
  noPermissionPrompts: true,
  noNativeConfigChanges: true,
  noSecretsOrCredentials: true,
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

const riskSafety = (): MobileSecurityRisk["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noAuthImplementation: true,
  noStorageImplementation: true,
  noApiCalls: true,
});

const checklistSafety = (): MobileSecurityChecklistItem["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noAuthImplementation: true,
  noStorageImplementation: true,
  noNetworkCalls: true,
});

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function uniqueCategories(values: readonly MobileSecurityCategory[]): MobileSecurityCategory[] {
  return mobileSecurityCategories.filter((category) => values.includes(category));
}

function highestRisk(risks: readonly PMRiskTier[]): PMRiskTier {
  if (risks.includes("critical")) return "critical";
  if (risks.includes("high")) return "high";
  if (risks.includes("medium")) return "medium";
  return "low";
}

function riskTierFromSeverity(severity: MobileSecuritySeverity): PMRiskTier {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function appTypeFromInput(input: MobileSecurityBaselineInput): MobileAppFactoryAppType {
  return (
    input.appType ??
    input.factoryIntake?.supportedAppType ??
    input.factoryStrategy?.appType ??
    input.architectureProfile?.appType ??
    input.stateStrategy?.appType ??
    input.navigationFlow?.appType ??
    input.uxPatternCatalog?.appTypes[0] ??
    input.offlineCacheSyncStrategy?.appType ??
    "unknown_mobile_app"
  );
}

function releaseTargetFromInput(input: MobileSecurityBaselineInput): MobileReleaseTarget | undefined {
  return (
    input.releaseTarget ??
    input.factoryIntake?.releaseTarget ??
    input.factoryStrategy?.intake.releaseTarget ??
    input.architectureProfile?.releaseProfile.releaseTarget ??
    input.stateStrategy?.releaseTarget ??
    input.offlineCacheSyncStrategy?.releaseTarget
  );
}

function valuesFromInput(input: MobileSecurityBaselineInput, key: "authNeeds" | "offlineNeeds" | "safetyNeeds" | "monetizationNeeds"): string[] {
  return uniqueStrings([
    ...(input.factoryIntake?.[key] ?? []),
    ...(input.factoryStrategy?.intake[key] ?? []),
    ...(input.stateStrategy?.[key] ?? []),
    ...(input.uxPatternCatalog?.[key] ?? []),
    ...(input.offlineCacheSyncStrategy?.[key] ?? []),
  ]);
}

function deriveDataSensitivity(input: MobileSecurityBaselineInput): MobileDataSensitivity {
  if (input.dataSensitivity) return input.dataSensitivity;

  const signals = [
    input.factoryIntake?.dataModelSummary ?? "",
    input.stateStrategy?.dataModelSummary ?? "",
    ...valuesFromInput(input, "authNeeds"),
    ...valuesFromInput(input, "safetyNeeds"),
    ...valuesFromInput(input, "monetizationNeeds"),
  ].join(" ");

  if (/health|medical/i.test(signals)) return "health_future";
  if (/minor|child|student/i.test(signals)) return "child_or_minor_future";
  if (/payment|financial|invoice|billing/i.test(signals)) return "financial_future";
  if (/identity|safety|abuse|location|profile|personal/i.test(signals)) return "sensitive_personal";
  if (/user|account|email|phone/i.test(signals)) return "personal";
  if (signals.trim().length > 0) return "internal";
  return "unknown";
}

function authRequiredFromInput(input: MobileSecurityBaselineInput): boolean {
  if (input.authRequired !== undefined) return input.authRequired;
  if (valuesFromInput(input, "authNeeds").length > 0) return true;
  return (input.navigationFlow?.protectedRoutes.length ?? 0) > 0;
}

function offlineRiskFromInput(input: MobileSecurityBaselineInput): PMRiskTier {
  if (input.offlineRisk) return input.offlineRisk;
  return highestRisk([
    input.stateStrategy?.summary.highestRiskLevel ?? "low",
    input.offlineCacheSyncStrategy?.summary.highestRiskLevel ?? "low",
    valuesFromInput(input, "offlineNeeds").length > 0 ? "medium" : "low",
    input.offlineCacheSyncStrategy?.summary.offlineWritableCount ? "high" : "low",
  ]);
}

function deriveRisk(input: MobileSecurityBaselineInput, dataSensitivity: MobileDataSensitivity, authRequired: boolean, offlineRisk: PMRiskTier): PMRiskTier {
  const monetizationNeeds = valuesFromInput(input, "monetizationNeeds");
  const safetyNeeds = valuesFromInput(input, "safetyNeeds");

  return highestRisk([
    input.riskLevel ?? "low",
    offlineRisk,
    dataSensitivity === "financial_future" || dataSensitivity === "child_or_minor_future" || dataSensitivity === "health_future"
      ? "critical"
      : "low",
    dataSensitivity === "sensitive_personal" ? "high" : "low",
    authRequired ? "medium" : "low",
    monetizationNeeds.length > 0 ? "high" : "low",
    safetyNeeds.length > 0 ? "high" : "low",
  ]);
}

function approvalDefaults(
  input: MobileSecurityBaselineInput,
  dataSensitivity: MobileDataSensitivity,
  authRequired: boolean,
  riskLevel: PMRiskTier,
): string[] {
  return uniqueStrings([
    ...(input.requiredApprovals ?? []),
    ...(authRequired ? ["auth_session_review"] : []),
    ...(dataSensitivity === "sensitive_personal" ? ["sensitive_data_review"] : []),
    ...(dataSensitivity === "financial_future" ? ["payment_or_financial_data_review"] : []),
    ...(dataSensitivity === "child_or_minor_future" ? ["minor_safety_review"] : []),
    ...(dataSensitivity === "health_future" ? ["health_data_review"] : []),
    ...(riskLevel === "high" || riskLevel === "critical" ? ["security_baseline_human_review"] : []),
  ]);
}

function categoriesFromBaseline(risks: readonly MobileSecurityRisk[], checklistItems: readonly MobileSecurityChecklistItem[]): MobileSecurityCategory[] {
  return uniqueCategories([...risks.map((risk) => risk.riskCategory), ...checklistItems.map((item) => item.category)]);
}

export function createMobileSecurityRisk(
  risk: Omit<MobileSecurityRisk, "safetyBoundaries"> & {
    safetyBoundaries?: MobileSecurityRisk["safetyBoundaries"];
  },
): MobileSecurityRisk {
  return {
    ...risk,
    requiredEvidence: [...risk.requiredEvidence],
    limitations: [...risk.limitations],
    safetyBoundaries: risk.safetyBoundaries ?? riskSafety(),
  };
}

export function createMobileSecurityChecklistItem(
  item: Omit<MobileSecurityChecklistItem, "safetyBoundaries"> & {
    safetyBoundaries?: MobileSecurityChecklistItem["safetyBoundaries"];
  },
): MobileSecurityChecklistItem {
  return {
    ...item,
    expectedEvidence: [...item.expectedEvidence],
    relatedAppTypes: [...item.relatedAppTypes],
    relatedDataSensitivity: [...item.relatedDataSensitivity],
    requiredApprovals: [...item.requiredApprovals],
    safetyBoundaries: item.safetyBoundaries ?? checklistSafety(),
  };
}

function defaultRisks(input: MobileSecurityBaselineInput): MobileSecurityRisk[] {
  const dataSensitivity = deriveDataSensitivity(input);
  const authRequired = authRequiredFromInput(input);
  const offlineRisk = offlineRiskFromInput(input);
  const safetyNeeds = valuesFromInput(input, "safetyNeeds");
  const monetizationNeeds = valuesFromInput(input, "monetizationNeeds");

  return [
    createMobileSecurityRisk({
      riskId: "mobile-security-risk:secure-storage-posture",
      riskCategory: "secure_storage",
      affectedFlow: "future_sensitive_state",
      affectedData: dataSensitivity,
      likelihood: dataSensitivity === "public" || dataSensitivity === "internal" ? "possible" : "human_review_required",
      impact: dataSensitivity === "financial_future" || dataSensitivity === "health_future" ? "critical" : "high",
      severity: dataSensitivity === "public" || dataSensitivity === "internal" ? "medium" : "high",
      mitigation: "Require future storage posture evidence before implementation.",
      requiredEvidence: ["state_ownership_ref", "data_sensitivity_ref", "human_review_ref"],
      approvalRequired: dataSensitivity !== "public" && dataSensitivity !== "internal",
      humanReviewRequired: dataSensitivity !== "public" && dataSensitivity !== "internal",
      limitations: ["Risk is advisory metadata and does not configure platform storage."],
    }),
    createMobileSecurityRisk({
      riskId: "mobile-security-risk:auth-session-posture",
      riskCategory: "auth_session",
      affectedFlow: authRequired ? "protected_mobile_flow" : "public_mobile_flow",
      affectedData: authRequired ? "future_session_state" : "none_required",
      likelihood: authRequired ? "possible" : "unlikely",
      impact: authRequired ? "high" : "low",
      severity: authRequired ? "high" : "low",
      mitigation: "Define session lifecycle, logout, recovery, and protected route evidence before implementation.",
      requiredEvidence: ["navigation_guard_ref", "state_session_ref", "approval_ref"],
      approvalRequired: authRequired,
      humanReviewRequired: authRequired,
      limitations: ["Risk does not implement auth/session behavior."],
    }),
    createMobileSecurityRisk({
      riskId: "mobile-security-risk:network-api-posture",
      riskCategory: "network_api",
      affectedFlow: "future_repository_or_service_flow",
      affectedData: dataSensitivity,
      likelihood: "possible",
      impact: dataSensitivity === "public" ? "medium" : "high",
      severity: dataSensitivity === "public" ? "medium" : "high",
      mitigation: "Require boundary, validation, timeout, retry, and error-normalization evidence before future API work.",
      requiredEvidence: ["architecture_service_ref", "repository_boundary_ref", "error_model_ref"],
      approvalRequired: dataSensitivity !== "public",
      humanReviewRequired: dataSensitivity !== "public",
      limitations: ["Risk does not create API clients or network behavior."],
    }),
    createMobileSecurityRisk({
      riskId: "mobile-security-risk:offline-sync-posture",
      riskCategory: "offline_sync",
      affectedFlow: "future_offline_or_sync_flow",
      affectedData: dataSensitivity,
      likelihood: offlineRisk === "low" ? "possible" : "human_review_required",
      impact: offlineRisk === "critical" ? "critical" : offlineRisk === "high" ? "high" : "medium",
      severity: offlineRisk === "critical" ? "critical" : offlineRisk === "high" ? "high" : "medium",
      mitigation: "Require conflict, rollback, stale data, retry, and recovery evidence before future offline behavior.",
      requiredEvidence: ["offline_cache_sync_ref", "ux_recovery_ref", "state_conflict_ref"],
      approvalRequired: offlineRisk === "high" || offlineRisk === "critical",
      humanReviewRequired: offlineRisk === "high" || offlineRisk === "critical",
      limitations: ["Risk does not create queue execution, storage, or network behavior."],
    }),
    createMobileSecurityRisk({
      riskId: "mobile-security-risk:abuse-safety-posture",
      riskCategory: "abuse_safety",
      affectedFlow: safetyNeeds.length > 0 ? "future_safety_flow" : "general_mobile_flow",
      affectedData: safetyNeeds.length > 0 ? "safety_related_user_data" : "unknown",
      likelihood: safetyNeeds.length > 0 ? "human_review_required" : "possible",
      impact: safetyNeeds.length > 0 ? "critical" : "medium",
      severity: safetyNeeds.length > 0 ? "critical" : "medium",
      mitigation: "Require report, block, recovery, escalation, and moderation posture evidence before implementation.",
      requiredEvidence: ["ux_safety_pattern_ref", "pm_risk_ref", "human_review_ref"],
      approvalRequired: safetyNeeds.length > 0,
      humanReviewRequired: safetyNeeds.length > 0,
      limitations: ["Risk does not implement abuse handling or provider workflows."],
    }),
    createMobileSecurityRisk({
      riskId: "mobile-security-risk:payment-or-premium-future",
      riskCategory: "payment_future",
      affectedFlow: monetizationNeeds.length > 0 ? "future_premium_or_payment_flow" : "none_required",
      affectedData: monetizationNeeds.length > 0 ? "future_entitlement_data" : "none_required",
      likelihood: monetizationNeeds.length > 0 ? "human_review_required" : "unlikely",
      impact: monetizationNeeds.length > 0 ? "critical" : "low",
      severity: monetizationNeeds.length > 0 ? "critical" : "info",
      mitigation: "Keep payment or premium behavior future-gated with separate approval and platform policy review.",
      requiredEvidence: ["monetization_need_ref", "platform_policy_ref", "approval_ref"],
      approvalRequired: monetizationNeeds.length > 0,
      humanReviewRequired: monetizationNeeds.length > 0,
      limitations: ["Risk does not implement payment or premium entitlement behavior."],
    }),
  ];
}

function defaultChecklistItems(input: MobileSecurityBaselineInput): MobileSecurityChecklistItem[] {
  const appType = appTypeFromInput(input);
  const dataSensitivity = deriveDataSensitivity(input);

  return [
    createMobileSecurityChecklistItem({
      checklistItemId: "mobile-security-check:storage-posture",
      category: "secure_storage",
      title: "Storage posture is classified",
      question: "Does the future app classify stored data, retention, recovery, and approval needs before implementation?",
      expectedEvidence: ["data_sensitivity_ref", "state_ownership_ref", "storage_posture_ref"],
      failureSignal: "Sensitive or persistent-future data lacks review evidence.",
      severityHint: dataSensitivity === "public" ? "medium" : "high",
      relatedAppTypes: ["any"],
      relatedDataSensitivity: ["any"],
      riskLevel: dataSensitivity === "public" ? "medium" : "high",
      requiredApprovals: dataSensitivity === "public" || dataSensitivity === "internal" ? [] : ["sensitive_data_review"],
    }),
    createMobileSecurityChecklistItem({
      checklistItemId: "mobile-security-check:auth-session",
      category: "auth_session",
      title: "Auth/session posture is reviewable",
      question: "Do protected flows define session lifecycle, account recovery, account deletion, and protected route evidence?",
      expectedEvidence: ["auth_need_ref", "navigation_guard_ref", "session_state_ref"],
      failureSignal: "Auth-required flows lack session lifecycle evidence.",
      severityHint: "high",
      relatedAppTypes: ["any"],
      relatedDataSensitivity: ["personal", "sensitive_personal", "financial_future", "health_future"],
      riskLevel: "high",
      requiredApprovals: ["auth_session_review"],
    }),
    createMobileSecurityChecklistItem({
      checklistItemId: "mobile-security-check:auth-artifact-handling",
      category: "token_handling",
      title: "Auth artifact handling remains future-gated",
      question: "Are auth artifacts classified, scoped, redacted from logs, and blocked from implementation until approved?",
      expectedEvidence: ["auth_artifact_policy_ref", "logging_redaction_ref", "approval_ref"],
      failureSignal: "Auth artifacts appear in planning without explicit approval posture.",
      severityHint: "critical",
      relatedAppTypes: ["any"],
      relatedDataSensitivity: ["personal", "sensitive_personal", "financial_future", "health_future"],
      riskLevel: "critical",
      requiredApprovals: ["auth_artifact_review"],
    }),
    createMobileSecurityChecklistItem({
      checklistItemId: "mobile-security-check:network-api-boundary",
      category: "network_api",
      title: "Network/API boundary is defined",
      question: "Do future API flows have boundary, validation, error, retry, and evidence requirements before implementation?",
      expectedEvidence: ["architecture_service_ref", "repository_boundary_ref", "error_recovery_ref"],
      failureSignal: "Network/API behavior is requested without advisory boundary evidence.",
      severityHint: "high",
      relatedAppTypes: ["any"],
      relatedDataSensitivity: ["any"],
      riskLevel: "high",
      requiredApprovals: ["network_api_review"],
    }),
    createMobileSecurityChecklistItem({
      checklistItemId: "mobile-security-check:permissions-privacy",
      category: "permissions_privacy",
      title: "Permission and privacy posture is clear",
      question: "Do permission requests have education copy, denial recovery, data minimization, and privacy evidence?",
      expectedEvidence: ["ux_permission_ref", "privacy_copy_ref", "recovery_path_ref"],
      failureSignal: "Permission or privacy-sensitive flows lack recovery and minimization evidence.",
      severityHint: "medium",
      relatedAppTypes: ["any"],
      relatedDataSensitivity: ["personal", "sensitive_personal", "health_future"],
      riskLevel: "medium",
      requiredApprovals: ["privacy_review"],
    }),
    createMobileSecurityChecklistItem({
      checklistItemId: "mobile-security-check:offline-sync",
      category: "offline_sync",
      title: "Offline/sync posture is approval-gated",
      question: "Do offline writable, stale data, conflict, retry, rollback, and recovery flows have review evidence?",
      expectedEvidence: ["offline_cache_sync_ref", "state_sync_ref", "ux_recovery_ref"],
      failureSignal: "Offline or sync behavior lacks conflict and recovery posture.",
      severityHint: "high",
      relatedAppTypes: ["any"],
      relatedDataSensitivity: ["any"],
      riskLevel: "high",
      requiredApprovals: ["offline_sync_review"],
    }),
    createMobileSecurityChecklistItem({
      checklistItemId: "mobile-security-check:release-future",
      category: "release_signing_future",
      title: "Release security remains future-gated",
      question: "Are release signing, store submission, and platform policy checks deferred to explicit future approval?",
      expectedEvidence: ["release_profile_ref", "platform_policy_ref", "human_review_ref"],
      failureSignal: "Release or store behavior is requested without approval posture.",
      severityHint: "critical",
      relatedAppTypes: [appType],
      relatedDataSensitivity: ["any"],
      riskLevel: "critical",
      requiredApprovals: ["release_security_review"],
    }),
  ];
}

export function recommendMobileSecurityBaseline(input: MobileSecurityBaselineInput = {}): MobileSecurityRecommendation {
  const appType = appTypeFromInput(input);
  const dataSensitivity = deriveDataSensitivity(input);
  const authRequired = authRequiredFromInput(input);
  const offlineRisk = offlineRiskFromInput(input);
  const risks = input.risks ?? defaultRisks(input);
  const checklistItems = input.checklistItems ?? defaultChecklistItems(input);
  const riskLevel = highestRisk([
    deriveRisk(input, dataSensitivity, authRequired, offlineRisk),
    ...risks.map((risk) => riskTierFromSeverity(risk.severity)),
    ...checklistItems.map((item) => item.riskLevel),
  ]);
  const requiredApprovals = approvalDefaults(input, dataSensitivity, authRequired, riskLevel);

  return {
    recommendationId: `mobile-security-baseline:${appType}`,
    appType,
    dataSensitivity,
    postureSummary: "Keep mobile security as advisory metadata until auth, storage, network/API, and release behavior are separately approved.",
    approvalPosture:
      requiredApprovals.length > 0
        ? "Human review is required before implementing sensitive, auth, offline, payment, or release behavior."
        : "No elevated security approval is inferred from current metadata.",
    checklistPosture: "Use MASVS-style checklist metadata as DoD and PM review input before future implementation.",
    riskLevel,
    requiredApprovals,
    recommendedNextStep: {
      nextStepId: "mobile_security_next_step:128B",
      title: "Plan mobile performance checklist",
      safeSummary: "Continue with Phase 128B after security baseline metadata is established.",
      priority: riskLevel,
      decisionMode: "plan_only",
      riskSurfaces: ["security_policy", "release", "provider", "store"],
      recommendationOnly: true,
      noExecution: true,
    },
    safetyBoundaries: {
      advisoryOnly: true,
      metadataOnly: true,
      noAuthImplementation: true,
      noStorageImplementation: true,
      noApiCalls: true,
    },
  };
}

export function createMobileSecurityBaseline(input: MobileSecurityBaselineInput = {}): MobileSecurityBaseline {
  const appType = appTypeFromInput(input);
  const releaseTarget = releaseTargetFromInput(input);
  const dataSensitivity = deriveDataSensitivity(input);
  const authRequired = authRequiredFromInput(input);
  const offlineRisk = offlineRiskFromInput(input);
  const riskLevel = deriveRisk(input, dataSensitivity, authRequired, offlineRisk);
  const risks = input.risks ? [...input.risks] : defaultRisks({ ...input, appType, dataSensitivity, authRequired, offlineRisk, riskLevel });
  const checklistItems = input.checklistItems ? [...input.checklistItems] : defaultChecklistItems({ ...input, appType, dataSensitivity });
  const recommendation = recommendMobileSecurityBaseline({
    ...input,
    appType,
    dataSensitivity,
    authRequired,
    offlineRisk,
    riskLevel,
    risks,
    checklistItems,
  });
  const requiredApprovals = uniqueStrings([
    ...recommendation.requiredApprovals,
    ...risks.flatMap((risk) => (risk.approvalRequired ? risk.requiredEvidence : [])),
    ...checklistItems.flatMap((item) => item.requiredApprovals),
  ]);
  const baselineBase = {
    baselineId: input.baselineId ?? `mobile-security-baseline:${appType}`,
    phaseRef: input.phaseRef ?? "Phase 127I",
    appType,
    releaseTarget,
    dataSensitivity,
    authRequired,
    offlineRisk,
    storageSecurityPosture:
      input.storageSecurityPosture ?? "Classify sensitive and persisted-future state before any storage implementation is approved.",
    networkSecurityPosture:
      input.networkSecurityPosture ?? "Require service/repository boundary, validation, retry, and error-normalization evidence before API work.",
    permissionPosture:
      input.permissionPosture ?? "Represent permission education, denial recovery, and privacy rationale as UX metadata only.",
    privacyPosture:
      input.privacyPosture ?? "Minimize collected data in planning metadata and require evidence for sensitive data flows.",
    loggingPosture:
      input.loggingPosture ?? "Require redaction posture for identifiers, auth artifacts, safety reports, and payment-future data.",
    safetyPosture:
      input.safetyPosture ?? "Model report, block, abuse, and recovery flows as approval-gated UX and PM risk metadata.",
    releaseSecurityPosture:
      input.releaseSecurityPosture ?? "Keep signing, store submission, third-party SDK, and platform policy review future-gated.",
    riskLevel: highestRisk([riskLevel, recommendation.riskLevel, ...risks.map((risk) => riskTierFromSeverity(risk.severity))]),
    requiredApprovals,
    limitations: [
      "No auth, storage, cryptographic control, network/API, permission prompt, native config, provider, DB/SQL, app generation, mobile tooling, CI, memory, or source-control behavior is implemented.",
      "Checklist and risk outputs are advisory metadata for future PM, SOLID, and Autopilot review.",
      ...(input.limitations ?? []),
    ],
    risks,
    checklistItems,
    recommendation,
    consumedFactoryMetadata: [
      "app type",
      "target users",
      "data model summary",
      "auth needs",
      "offline needs",
      "safety needs",
      "release target",
    ],
    consumedArchitectureMetadata: [
      "services",
      "repositories",
      "state",
      "config",
      "tests",
      "native future",
      "release future",
    ],
    consumedStateMetadata: [
      "sensitive state",
      "session state",
      "persisted future state",
      "logging and redaction posture",
    ],
    consumedOfflineCacheSyncMetadata: [
      "offline writable risk",
      "conflict review",
      "retry posture",
      "stale data labels",
      "recovery UX",
    ],
    pmSolidAutopilotIntegration: [
      "PM reports may include security risks, approvals, blockers, and DoD gaps.",
      "SOLID review may inspect mobile security boundary ownership across UI, state, services, repositories, backend, and providers.",
      "Autopilot may carry the baseline as handoff and dry-run metadata only.",
    ],
    conversationalBuildLoopReadiness: [
      "Maps a simple idea to data sensitivity and approval posture.",
      "Provides security checklist context for future implementation prompts.",
      "Keeps conversational automation deferred and non-executing.",
    ],
    safetyBoundaries,
  } satisfies Omit<MobileSecurityBaseline, "summary">;

  return {
    ...baselineBase,
    summary: summarizeMobileSecurityBaseline(baselineBase),
  };
}

export function summarizeMobileSecurityBaseline(
  baseline: Pick<
    MobileSecurityBaseline,
    "baselineId" | "appType" | "dataSensitivity" | "risks" | "checklistItems" | "safetyBoundaries"
  >,
): MobileSecuritySummary {
  const riskLevels = [
    ...baseline.risks.map((risk) => riskTierFromSeverity(risk.severity)),
    ...baseline.checklistItems.map((item) => item.riskLevel),
  ];

  return {
    baselineId: baseline.baselineId,
    appType: baseline.appType,
    dataSensitivity: baseline.dataSensitivity,
    riskCount: baseline.risks.length,
    checklistItemCount: baseline.checklistItems.length,
    categories: categoriesFromBaseline(baseline.risks, baseline.checklistItems),
    highestRiskLevel: highestRisk(riskLevels),
    criticalOrHighRiskCount: riskLevels.filter((risk) => risk === "critical" || risk === "high").length,
    approvalRequiredCount: baseline.risks.filter((risk) => risk.approvalRequired).length,
    humanReviewRequiredCount: baseline.risks.filter((risk) => risk.humanReviewRequired).length,
    recommendedNextPhase: "Phase 128B - MOBILE PERFORMANCE CHECKLIST PLAN",
    safeSummary:
      "Mobile Security Baseline is source-only advisory metadata for security posture, risk, checklist, data sensitivity, approvals, and future implementation limits.",
    safetyBoundaries: baseline.safetyBoundaries,
  };
}

export function selectSecurityRisksByCategory(
  baselineOrRisks: MobileSecurityBaseline | readonly MobileSecurityRisk[],
  category: MobileSecurityCategory,
): MobileSecurityRisk[] {
  const risks = isMobileSecurityBaseline(baselineOrRisks) ? baselineOrRisks.risks : baselineOrRisks;
  return risks.filter((risk) => risk.riskCategory === category);
}

export function selectChecklistItemsByCategory(
  baselineOrItems: MobileSecurityBaseline | readonly MobileSecurityChecklistItem[],
  category: MobileSecurityCategory,
): MobileSecurityChecklistItem[] {
  const items = isMobileSecurityBaseline(baselineOrItems) ? baselineOrItems.checklistItems : baselineOrItems;
  return items.filter((item) => item.category === category);
}

function isMobileSecurityBaseline(
  baselineOrItems: MobileSecurityBaseline | readonly MobileSecurityRisk[] | readonly MobileSecurityChecklistItem[],
): baselineOrItems is MobileSecurityBaseline {
  return !Array.isArray(baselineOrItems);
}
