import type {
  MobileAppFactoryAppType,
  MobileAppFactoryIntake,
  MobileAppFactoryStrategy,
  MobileReleaseTarget,
} from "./mobileAppFactoryStrategy.js";
import type { MobileArchitectureProfile } from "./mobileArchitectureProfile.js";
import type { MobilePerformanceChecklist } from "./mobilePerformanceChecklist.js";
import type { MobileSecurityBaseline } from "./mobileSecurityBaseline.js";
import type { MobileTestingStrategy } from "./mobileTestingStrategy.js";
import type { PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type MobileReleaseCategory =
  | "build_profile"
  | "submit_profile"
  | "update_channel"
  | "versioning"
  | "release_notes"
  | "signing_credentials_future"
  | "store_metadata"
  | "internal_testing"
  | "staged_rollout"
  | "rollback"
  | "monitoring_future"
  | "approval_gate";

export type MobileReleaseTargetPlatform = "ios" | "android" | "cross_platform" | "tablet" | "unknown";

export type MobileReleaseEnvironment =
  | "development_future"
  | "internal_future"
  | "preview_future"
  | "beta_future"
  | "production_future"
  | "enterprise_future"
  | "unknown";

export type MobileReleaseAudience =
  | "developers"
  | "internal_team"
  | "qa_reviewers"
  | "stakeholders"
  | "beta_users"
  | "limited_market"
  | "general_public_future"
  | "enterprise_users_future";

export type MobileReleaseUpdatePolicy =
  | "manual_review_required"
  | "internal_only_future"
  | "preview_only_future"
  | "staged_rollout_future"
  | "critical_fix_future"
  | "blocked_until_approved";

export type MobileReleaseBlockingSeverity = "info" | "warning" | "blocking" | "critical_blocking";

export interface MobileReleaseSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noEasCommands: true;
  noExpoCommands: true;
  noNativeProjectCreation: true;
  noCredentialMaterialAccess: true;
  noReleaseSignatureOperations: true;
  noStoreSubmission: true;
  noPackageChanges: true;
  noWorkflowCiActivation: true;
  noProviderCalls: true;
  noDbSqlMutation: true;
  noDashboardMutation: true;
  noSecretsEnvNetwork: true;
  noMemoryPersistence: true;
  noGitAutomationFromSource: true;
}

export interface MobileBuildProfilePosture {
  profileId: string;
  profileName: string;
  purpose: string;
  targetPlatforms: readonly MobileReleaseTargetPlatform[];
  channelRefs: readonly string[];
  distributionPosture: string;
  approvalRequired: boolean;
  riskLevel: PMRiskTier;
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobileReleaseSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noEasCommands" | "noNativeProjectCreation"
  >;
}

export interface MobileReleaseChannel {
  channelId: string;
  channelName: string;
  environment: MobileReleaseEnvironment;
  audience: MobileReleaseAudience;
  updatePolicy: MobileReleaseUpdatePolicy;
  buildProfileRef: string;
  approvalRequired: boolean;
  rollbackSupported: boolean;
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    MobileReleaseSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noEasCommands" | "noStoreSubmission"
  >;
}

export interface MobileReleaseReadinessGate {
  gateId: string;
  title: string;
  category: MobileReleaseCategory;
  requiredEvidence: readonly string[];
  blockingSeverity: MobileReleaseBlockingSeverity;
  relatedTestingChecks: readonly string[];
  relatedSecurityChecks: readonly string[];
  relatedPerformanceChecks: readonly string[];
  humanApprovalRequired: boolean;
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    MobileReleaseSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noEasCommands" | "noStoreSubmission" | "noCredentialMaterialAccess"
  >;
}

export interface MobileReleaseRecommendation {
  recommendationId: string;
  appType: MobileAppFactoryAppType;
  releasePosture: string;
  channelPosture: string;
  readinessGatePosture: string;
  rolloutPosture: string;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<
    MobileReleaseSafetyBoundaries,
    "advisoryOnly" | "metadataOnly" | "noEasCommands" | "noExpoCommands" | "noStoreSubmission"
  >;
}

export interface MobileReleaseSummary {
  releaseStrategyId: string;
  appType: MobileAppFactoryAppType;
  targetPlatformCount: number;
  buildProfileCount: number;
  channelCount: number;
  readinessGateCount: number;
  categories: readonly MobileReleaseCategory[];
  highestRiskLevel: PMRiskTier;
  approvalRequiredGateCount: number;
  rollbackSupportedChannelCount: number;
  requiredApprovalCount: number;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: MobileReleaseSafetyBoundaries;
}

export interface MobileReleaseStrategy {
  releaseStrategyId: string;
  phaseRef: ProjectPhaseRef;
  appType: MobileAppFactoryAppType;
  releaseTarget: MobileReleaseTarget | undefined;
  targetPlatforms: readonly MobileReleaseTargetPlatform[];
  buildProfiles: readonly MobileBuildProfilePosture[];
  channels: readonly MobileReleaseChannel[];
  readinessGates: readonly MobileReleaseReadinessGate[];
  versioningPolicy: string;
  releaseNotesPolicy: string;
  signingPosture: string;
  storeReadiness: string;
  rolloutPolicy: string;
  rollbackPolicy: string;
  requiredApprovals: readonly string[];
  riskLevel: PMRiskTier;
  limitations: readonly string[];
  recommendation: MobileReleaseRecommendation;
  summary: MobileReleaseSummary;
  consumedFactoryMetadata: readonly string[];
  consumedArchitectureMetadata: readonly string[];
  consumedTestingMetadata: readonly string[];
  consumedSecurityMetadata: readonly string[];
  consumedPerformanceMetadata: readonly string[];
  pmSolidAutopilotIntegration: readonly string[];
  conversationalBuildLoopReadiness: readonly string[];
  safetyBoundaries: MobileReleaseSafetyBoundaries;
}

export interface MobileReleaseStrategyInput {
  releaseStrategyId?: string;
  phaseRef?: ProjectPhaseRef;
  appType?: MobileAppFactoryAppType;
  releaseTarget?: MobileReleaseTarget | undefined;
  targetPlatforms?: readonly MobileReleaseTargetPlatform[];
  buildProfiles?: readonly MobileBuildProfilePosture[];
  channels?: readonly MobileReleaseChannel[];
  readinessGates?: readonly MobileReleaseReadinessGate[];
  versioningPolicy?: string;
  releaseNotesPolicy?: string;
  signingPosture?: string;
  storeReadiness?: string;
  rolloutPolicy?: string;
  rollbackPolicy?: string;
  requiredApprovals?: readonly string[];
  riskLevel?: PMRiskTier;
  limitations?: readonly string[];
  factoryIntake?: MobileAppFactoryIntake;
  factoryStrategy?: MobileAppFactoryStrategy;
  architectureProfile?: MobileArchitectureProfile;
  testingStrategy?: MobileTestingStrategy;
  securityBaseline?: MobileSecurityBaseline;
  performanceChecklist?: MobilePerformanceChecklist;
}

export const mobileReleaseCategories: readonly MobileReleaseCategory[] = [
  "build_profile",
  "submit_profile",
  "update_channel",
  "versioning",
  "release_notes",
  "signing_credentials_future",
  "store_metadata",
  "internal_testing",
  "staged_rollout",
  "rollback",
  "monitoring_future",
  "approval_gate",
];

const safetyBoundaries: MobileReleaseSafetyBoundaries = {
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noEasCommands: true,
  noExpoCommands: true,
  noNativeProjectCreation: true,
  noCredentialMaterialAccess: true,
  noReleaseSignatureOperations: true,
  noStoreSubmission: true,
  noPackageChanges: true,
  noWorkflowCiActivation: true,
  noProviderCalls: true,
  noDbSqlMutation: true,
  noDashboardMutation: true,
  noSecretsEnvNetwork: true,
  noMemoryPersistence: true,
  noGitAutomationFromSource: true,
};

const profileSafety = (): MobileBuildProfilePosture["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noEasCommands: true,
  noNativeProjectCreation: true,
});

const channelSafety = (): MobileReleaseChannel["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noEasCommands: true,
  noStoreSubmission: true,
});

const gateSafety = (): MobileReleaseReadinessGate["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noEasCommands: true,
  noStoreSubmission: true,
  noCredentialMaterialAccess: true,
});

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function uniquePlatforms(values: readonly MobileReleaseTargetPlatform[]): MobileReleaseTargetPlatform[] {
  const fallback: readonly MobileReleaseTargetPlatform[] = ["cross_platform"];
  return [...new Set(values.length > 0 ? values : fallback)];
}

function uniqueCategories(values: readonly MobileReleaseCategory[]): MobileReleaseCategory[] {
  return mobileReleaseCategories.filter((category) => values.includes(category));
}

function highestRisk(risks: readonly PMRiskTier[]): PMRiskTier {
  if (risks.includes("critical")) return "critical";
  if (risks.includes("high")) return "high";
  if (risks.includes("medium")) return "medium";
  return "low";
}

function appTypeFromInput(input: MobileReleaseStrategyInput): MobileAppFactoryAppType {
  return (
    input.appType ??
    input.factoryIntake?.supportedAppType ??
    input.factoryStrategy?.appType ??
    input.architectureProfile?.appType ??
    input.testingStrategy?.appType ??
    input.securityBaseline?.appType ??
    input.performanceChecklist?.appType ??
    "unknown_mobile_app"
  );
}

function releaseTargetFromInput(input: MobileReleaseStrategyInput): MobileReleaseTarget | undefined {
  return (
    input.releaseTarget ??
    input.factoryIntake?.releaseTarget ??
    input.factoryStrategy?.intake.releaseTarget ??
    input.architectureProfile?.releaseProfile.releaseTarget ??
    input.testingStrategy?.releaseTarget ??
    input.securityBaseline?.releaseTarget ??
    input.performanceChecklist?.releaseTarget
  );
}

function targetPlatformsFromInput(input: MobileReleaseStrategyInput): MobileReleaseTargetPlatform[] {
  if (input.targetPlatforms && input.targetPlatforms.length > 0) return uniquePlatforms(input.targetPlatforms);
  const priority = input.factoryIntake?.platformPriority ?? input.factoryStrategy?.intake.platformPriority ?? input.architectureProfile?.platformPriority;

  if (priority === "ios_first") return ["ios"];
  if (priority === "android_first") return ["android"];
  if (priority === "tablet_first") return ["tablet"];
  if (priority === "cross_platform" || priority === "phased") return ["ios", "android"];
  return ["cross_platform"];
}

function categoriesFromInput(input: MobileReleaseStrategyInput): MobileReleaseCategory[] {
  const releaseTarget = releaseTargetFromInput(input);
  const riskSignals = [
    ...(input.factoryIntake?.monetizationNeeds ?? []),
    ...(input.factoryIntake?.safetyNeeds ?? []),
    ...(input.securityBaseline?.summary.categories ?? []),
    ...(input.testingStrategy?.summary.categories ?? []),
    ...(input.performanceChecklist?.summary.categories ?? []),
    releaseTarget ?? "",
  ].join(" ");
  const categories: MobileReleaseCategory[] = [
    "build_profile",
    "submit_profile",
    "update_channel",
    "versioning",
    "release_notes",
    "store_metadata",
    "internal_testing",
    "rollback",
    "approval_gate",
  ];

  if (/beta|pilot|store|enterprise|future_release_ready/i.test(riskSignals)) categories.push("staged_rollout");
  if (/security|privacy|auth|payment|sensitive|release_signing/i.test(riskSignals)) categories.push("signing_credentials_future");
  if (/performance|release|beta|store|enterprise/i.test(riskSignals)) categories.push("monitoring_future");

  return uniqueCategories(categories);
}

function deriveRisk(input: MobileReleaseStrategyInput): PMRiskTier {
  const categories = categoriesFromInput(input);
  const releaseTarget = releaseTargetFromInput(input);
  return highestRisk([
    input.riskLevel ?? "low",
    input.testingStrategy?.summary.highestRiskLevel ?? "low",
    input.securityBaseline?.summary.highestRiskLevel ?? "low",
    input.performanceChecklist?.summary.highestRiskLevel ?? "low",
    releaseTarget === "store_candidate" || releaseTarget === "enterprise_distribution" ? "high" : "low",
    categories.includes("signing_credentials_future") ? "high" : "low",
  ]);
}

function approvalsFromInput(input: MobileReleaseStrategyInput, riskLevel: PMRiskTier): string[] {
  const categories = categoriesFromInput(input);
  return uniqueStrings([
    ...(input.requiredApprovals ?? []),
    ...(riskLevel === "high" || riskLevel === "critical" ? ["mobile_release_human_review"] : []),
    ...(categories.includes("signing_credentials_future") ? ["release_credential_material_review"] : []),
    ...(categories.includes("staged_rollout") ? ["rollout_approval"] : []),
    ...(categories.includes("store_metadata") ? ["platform_metadata_review"] : []),
  ]);
}

export function createMobileReleaseChannel(
  channel: Omit<MobileReleaseChannel, "safetyBoundaries"> & {
    safetyBoundaries?: MobileReleaseChannel["safetyBoundaries"];
  },
): MobileReleaseChannel {
  return {
    ...channel,
    safetyBoundaries: channel.safetyBoundaries ?? channelSafety(),
  };
}

export function createMobileReleaseReadinessGate(
  gate: Omit<MobileReleaseReadinessGate, "safetyBoundaries"> & {
    safetyBoundaries?: MobileReleaseReadinessGate["safetyBoundaries"];
  },
): MobileReleaseReadinessGate {
  return {
    ...gate,
    requiredEvidence: [...gate.requiredEvidence],
    relatedTestingChecks: [...gate.relatedTestingChecks],
    relatedSecurityChecks: [...gate.relatedSecurityChecks],
    relatedPerformanceChecks: [...gate.relatedPerformanceChecks],
    safetyBoundaries: gate.safetyBoundaries ?? gateSafety(),
  };
}

function createMobileBuildProfilePosture(
  profile: Omit<MobileBuildProfilePosture, "safetyBoundaries"> & {
    safetyBoundaries?: MobileBuildProfilePosture["safetyBoundaries"];
  },
): MobileBuildProfilePosture {
  return {
    ...profile,
    targetPlatforms: [...profile.targetPlatforms],
    channelRefs: [...profile.channelRefs],
    limitations: [...profile.limitations],
    safetyBoundaries: profile.safetyBoundaries ?? profileSafety(),
  };
}

function defaultChannels(input: MobileReleaseStrategyInput): MobileReleaseChannel[] {
  const riskLevel = deriveRisk(input);
  return [
    createMobileReleaseChannel({
      channelId: "mobile-release-channel:internal",
      channelName: "internal_future",
      environment: "internal_future",
      audience: "internal_team",
      updatePolicy: "manual_review_required",
      buildProfileRef: "mobile-build-profile:internal",
      approvalRequired: true,
      rollbackSupported: true,
      riskLevel: "medium",
    }),
    createMobileReleaseChannel({
      channelId: "mobile-release-channel:preview",
      channelName: "preview_future",
      environment: "preview_future",
      audience: "stakeholders",
      updatePolicy: "preview_only_future",
      buildProfileRef: "mobile-build-profile:preview",
      approvalRequired: true,
      rollbackSupported: true,
      riskLevel: "medium",
    }),
    createMobileReleaseChannel({
      channelId: "mobile-release-channel:beta",
      channelName: "beta_future",
      environment: "beta_future",
      audience: "beta_users",
      updatePolicy: "staged_rollout_future",
      buildProfileRef: "mobile-build-profile:beta",
      approvalRequired: true,
      rollbackSupported: true,
      riskLevel: riskLevel === "critical" ? "critical" : "high",
    }),
  ];
}

function defaultBuildProfiles(input: MobileReleaseStrategyInput): MobileBuildProfilePosture[] {
  const targetPlatforms = targetPlatformsFromInput(input);
  return [
    createMobileBuildProfilePosture({
      profileId: "mobile-build-profile:internal",
      profileName: "internal_distribution_future",
      purpose: "Human-reviewed internal release candidate posture.",
      targetPlatforms,
      channelRefs: ["mobile-release-channel:internal"],
      distributionPosture: "Internal-only, future-gated, and approval-required.",
      approvalRequired: true,
      riskLevel: "medium",
      limitations: ["Does not create build config or release artifacts."],
    }),
    createMobileBuildProfilePosture({
      profileId: "mobile-build-profile:preview",
      profileName: "preview_release_future",
      purpose: "Stakeholder preview posture before beta or release-candidate review.",
      targetPlatforms,
      channelRefs: ["mobile-release-channel:preview"],
      distributionPosture: "Preview-only and blocked until QA, security, and performance evidence exists.",
      approvalRequired: true,
      riskLevel: "medium",
      limitations: ["Does not execute Expo/EAS or modify native projects."],
    }),
    createMobileBuildProfilePosture({
      profileId: "mobile-build-profile:beta",
      profileName: "beta_candidate_future",
      purpose: "Beta candidate posture after release readiness gates pass.",
      targetPlatforms,
      channelRefs: ["mobile-release-channel:beta"],
      distributionPosture: "Staged rollout posture with rollback and human approval required.",
      approvalRequired: true,
      riskLevel: "high",
      limitations: ["Does not submit to platforms or publish updates."],
    }),
  ];
}

function defaultReadinessGates(input: MobileReleaseStrategyInput): MobileReleaseReadinessGate[] {
  const riskLevel = deriveRisk(input);
  return [
    createMobileReleaseReadinessGate({
      gateId: "mobile-release-gate:testing",
      title: "Testing strategy evidence is complete",
      category: "internal_testing",
      requiredEvidence: ["mobile_testing_strategy_summary", "smoke_flow_coverage", "device_matrix_posture"],
      blockingSeverity: "blocking",
      relatedTestingChecks: ["smoke", "regression", "release_readiness"],
      relatedSecurityChecks: [],
      relatedPerformanceChecks: [],
      humanApprovalRequired: true,
      riskLevel: "high",
    }),
    createMobileReleaseReadinessGate({
      gateId: "mobile-release-gate:security",
      title: "Security and privacy posture is reviewed",
      category: "signing_credentials_future",
      requiredEvidence: ["mobile_security_baseline_summary", "privacy_logging_posture", "human_review_ref"],
      blockingSeverity: riskLevel === "critical" ? "critical_blocking" : "blocking",
      relatedTestingChecks: ["auth_session", "security"],
      relatedSecurityChecks: ["data_sensitivity", "privacy_posture", "release_signature_posture"],
      relatedPerformanceChecks: [],
      humanApprovalRequired: true,
      riskLevel: riskLevel === "critical" ? "critical" : "high",
    }),
    createMobileReleaseReadinessGate({
      gateId: "mobile-release-gate:performance",
      title: "Performance readiness evidence is complete",
      category: "monitoring_future",
      requiredEvidence: ["mobile_performance_summary", "low_end_device_posture", "future_monitoring_posture"],
      blockingSeverity: "warning",
      relatedTestingChecks: ["performance", "release_readiness"],
      relatedSecurityChecks: [],
      relatedPerformanceChecks: ["startup", "initial_render", "low_end_device"],
      humanApprovalRequired: riskLevel === "high" || riskLevel === "critical",
      riskLevel: riskLevel === "critical" ? "critical" : "high",
    }),
    createMobileReleaseReadinessGate({
      gateId: "mobile-release-gate:rollback",
      title: "Rollout and rollback posture is documented",
      category: "rollback",
      requiredEvidence: ["channel_model_ref", "rollout_policy_ref", "rollback_policy_ref"],
      blockingSeverity: "blocking",
      relatedTestingChecks: ["smoke", "release_readiness"],
      relatedSecurityChecks: ["abuse_safety"],
      relatedPerformanceChecks: ["monitoring_future"],
      humanApprovalRequired: true,
      riskLevel: "high",
    }),
  ];
}

export function recommendMobileReleaseStrategy(input: MobileReleaseStrategyInput = {}): MobileReleaseRecommendation {
  const appType = appTypeFromInput(input);
  const riskLevel = deriveRisk(input);
  const requiredApprovals = approvalsFromInput(input, riskLevel);

  return {
    recommendationId: `mobile-release-strategy:${appType}`,
    appType,
    releasePosture: "Keep release posture as advisory metadata until a real app target and explicit human-approved release phase exist.",
    channelPosture: "Use internal, preview, and beta future channels as planning records only.",
    readinessGatePosture: "Require testing, security, performance, rollout, and rollback evidence before any future release execution.",
    rolloutPosture: "Treat staged rollout and rollback as future-gated human-reviewed posture.",
    riskLevel,
    requiredApprovals,
    recommendedNextStep: {
      nextStepId: "mobile_release_next_step:131B",
      title: "Plan app idea intake interview",
      safeSummary: "Continue with Phase 131B after release strategy metadata is established.",
      priority: riskLevel,
      decisionMode: "plan_only",
      riskSurfaces: ["release", "package_workflow", "ci_baseline", "provider", "credential", "deployment"],
      recommendationOnly: true,
      noExecution: true,
    },
    safetyBoundaries: {
      advisoryOnly: true,
      metadataOnly: true,
      noEasCommands: true,
      noExpoCommands: true,
      noStoreSubmission: true,
    },
  };
}

export function createMobileReleaseStrategy(input: MobileReleaseStrategyInput = {}): MobileReleaseStrategy {
  const appType = appTypeFromInput(input);
  const releaseTarget = releaseTargetFromInput(input);
  const targetPlatforms = targetPlatformsFromInput(input);
  const buildProfiles = input.buildProfiles ? [...input.buildProfiles] : defaultBuildProfiles({ ...input, appType, targetPlatforms });
  const channels = input.channels ? [...input.channels] : defaultChannels({ ...input, appType, targetPlatforms, buildProfiles });
  const readinessGates = input.readinessGates ? [...input.readinessGates] : defaultReadinessGates({ ...input, appType, channels, buildProfiles });
  const riskLevel = highestRisk([
    deriveRisk(input),
    ...buildProfiles.map((profile) => profile.riskLevel),
    ...channels.map((channel) => channel.riskLevel),
    ...readinessGates.map((gate) => gate.riskLevel),
  ]);
  const requiredApprovals = uniqueStrings([
    ...approvalsFromInput(input, riskLevel),
    ...readinessGates.filter((gate) => gate.humanApprovalRequired).map((gate) => `${gate.category}_approval`),
  ]);
  const strategyBase = {
    releaseStrategyId: input.releaseStrategyId ?? `mobile-release-strategy:${appType}`,
    phaseRef: input.phaseRef ?? "Phase 130I",
    appType,
    releaseTarget,
    targetPlatforms,
    buildProfiles,
    channels,
    readinessGates,
    versioningPolicy: input.versioningPolicy ?? "Future-gated semantic version and build-number posture; no config changes.",
    releaseNotesPolicy: input.releaseNotesPolicy ?? "Human-reviewed release notes posture tied to PM closeout and QA evidence.",
    signingPosture: input.signingPosture ?? "Future release-signature and credential-material review required; no material access.",
    storeReadiness: input.storeReadiness ?? "Platform metadata readiness remains advisory until a separate approved release phase.",
    rolloutPolicy: input.rolloutPolicy ?? "Staged rollout posture requires testing, security, performance, and human approval evidence.",
    rollbackPolicy: input.rollbackPolicy ?? "Rollback posture is planned as metadata and never triggers automated action.",
    requiredApprovals,
    riskLevel,
    limitations: [
      "No EAS commands, Expo commands, native project creation, credential material access, release-signature operations, platform submission, package changes, workflow/CI activation, providers, DB/SQL, dashboard mutation, secrets/env/network, memory, or source-control behavior is implemented.",
      "Release strategy remains advisory metadata until a real app target and approved release execution phase exist.",
      ...(input.limitations ?? []),
    ],
    recommendation: recommendMobileReleaseStrategy({ ...input, appType, riskLevel, requiredApprovals }),
    consumedFactoryMetadata: ["app type", "target users", "release target", "quality posture", "safety posture"],
    consumedArchitectureMetadata: ["release profile", "testing profile", "native future", "release future", "platform priority"],
    consumedTestingMetadata: ["test levels", "smoke flows", "device matrix", "release readiness checks"],
    consumedSecurityMetadata: ["data sensitivity", "privacy posture", "abuse/safety posture", "release review posture"],
    consumedPerformanceMetadata: ["startup posture", "low-end device posture", "future monitoring posture", "release readiness posture"],
    pmSolidAutopilotIntegration: [
      "PM reports may include release gates, approvals, rollout posture, rollback posture, and closeout limitations.",
      "SOLID review may use release metadata to verify separation between planning, build, submit, update, security, and rollback responsibilities.",
      "Autopilot may carry release strategy metadata as handoff and dry-run context only.",
    ],
    conversationalBuildLoopReadiness: [
      "Maps a simple app idea to future release plan posture.",
      "Provides release readiness gates and platform checklist context.",
      "Provides future Codex prompt context without conversational automation.",
    ],
    safetyBoundaries,
  } satisfies Omit<MobileReleaseStrategy, "summary">;

  return {
    ...strategyBase,
    summary: summarizeMobileReleaseStrategy(strategyBase),
  };
}

export function summarizeMobileReleaseStrategy(
  strategy: Pick<
    MobileReleaseStrategy,
    | "releaseStrategyId"
    | "appType"
    | "targetPlatforms"
    | "buildProfiles"
    | "channels"
    | "readinessGates"
    | "requiredApprovals"
    | "riskLevel"
    | "safetyBoundaries"
  >,
): MobileReleaseSummary {
  return {
    releaseStrategyId: strategy.releaseStrategyId,
    appType: strategy.appType,
    targetPlatformCount: strategy.targetPlatforms.length,
    buildProfileCount: strategy.buildProfiles.length,
    channelCount: strategy.channels.length,
    readinessGateCount: strategy.readinessGates.length,
    categories: uniqueCategories([
      ...strategy.readinessGates.map((gate) => gate.category),
      "build_profile",
      "submit_profile",
      "update_channel",
      "versioning",
      "release_notes",
      "store_metadata",
      "staged_rollout",
      "rollback",
      "approval_gate",
    ]),
    highestRiskLevel: highestRisk([
      strategy.riskLevel,
      ...strategy.buildProfiles.map((profile) => profile.riskLevel),
      ...strategy.channels.map((channel) => channel.riskLevel),
      ...strategy.readinessGates.map((gate) => gate.riskLevel),
    ]),
    approvalRequiredGateCount: strategy.readinessGates.filter((gate) => gate.humanApprovalRequired).length,
    rollbackSupportedChannelCount: strategy.channels.filter((channel) => channel.rollbackSupported).length,
    requiredApprovalCount: strategy.requiredApprovals.length,
    recommendedNextPhase: "Phase 131B - APP IDEA INTAKE INTERVIEW PLAN",
    safeSummary:
      "Mobile Release / EAS Strategy is source-only advisory metadata for release posture, build/submit/update posture, channels, versioning, readiness gates, rollout, rollback, and platform readiness.",
    safetyBoundaries: strategy.safetyBoundaries,
  };
}

export function selectReleaseChannelsByEnvironment(
  strategyOrChannels: MobileReleaseStrategy | readonly MobileReleaseChannel[],
  environment: MobileReleaseEnvironment,
): MobileReleaseChannel[] {
  const channels = isMobileReleaseStrategy(strategyOrChannels) ? strategyOrChannels.channels : strategyOrChannels;
  return channels.filter((channel) => channel.environment === environment);
}

export function selectReleaseGatesByCategory(
  strategyOrGates: MobileReleaseStrategy | readonly MobileReleaseReadinessGate[],
  category: MobileReleaseCategory,
): MobileReleaseReadinessGate[] {
  const gates = isMobileReleaseStrategy(strategyOrGates) ? strategyOrGates.readinessGates : strategyOrGates;
  return gates.filter((gate) => gate.category === category);
}

function isMobileReleaseStrategy(
  strategyOrEntries: MobileReleaseStrategy | readonly MobileReleaseChannel[] | readonly MobileReleaseReadinessGate[],
): strategyOrEntries is MobileReleaseStrategy {
  return !Array.isArray(strategyOrEntries);
}
