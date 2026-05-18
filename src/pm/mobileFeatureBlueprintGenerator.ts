import type {
  MobileRequirementCandidate,
  MobileRequirementPriority,
  MobileRequirementsInterview,
  MobileRequirementsOutput,
} from "./mobileRequirementsInterview.js";
import type {
  MobileAppFactoryAppType,
} from "./mobileAppFactoryStrategy.js";
import type { PMEvidenceReference, PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type MobileFeatureCategory =
  | "onboarding"
  | "authentication"
  | "dashboard"
  | "profile_settings"
  | "forms"
  | "content_list"
  | "detail_view"
  | "messaging"
  | "marketplace"
  | "gamification"
  | "offline_sync"
  | "monetization"
  | "safety_trust"
  | "notifications"
  | "analytics_reporting"
  | "admin_management"
  | "ai_assistant"
  | "unknown";

export type MobileFeatureScope = "mvp" | "beta" | "release" | "deferred" | "blocked";

export type MobileFeatureBlueprintPriority =
  | "must_have_mvp"
  | "should_have_beta"
  | "release_ready"
  | "defer_later"
  | "blocked_until_clarified";

export type MobileFeatureBlueprintConfidence = "high" | "medium" | "low" | "blocked_by_unknowns";

export type MobileFeatureBlueprintNextArtifact =
  | "mobile_screen_blueprint_generator_plan"
  | "feature_followup_needed"
  | "human_review"
  | "blocked_by_unknowns";

export type MobileFeatureArtifactTarget =
  | "mobile_app_factory_strategy"
  | "react_native_expo_architecture_profile"
  | "mobile_ux_ui_pattern_catalog"
  | "mobile_navigation_flow_model"
  | "mobile_state_management_strategy"
  | "offline_cache_sync_strategy"
  | "mobile_security_baseline"
  | "mobile_performance_checklist"
  | "mobile_testing_strategy"
  | "mobile_release_eas_strategy"
  | "pm_report"
  | "task_graph"
  | "dod_criteria"
  | "risk_blocker_model"
  | "autopilot_handoff_context";

export type MobileFeatureDependencyType =
  | "requirement"
  | "feature"
  | "ux_pattern"
  | "navigation"
  | "state_data"
  | "offline_sync"
  | "security"
  | "performance"
  | "testing"
  | "release"
  | "human_approval"
  | "unknown";

export interface MobileFeatureBlueprintSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noFeatureCodeGeneration: true;
  noScreenGeneration: true;
  noRouteGeneration: true;
  noAppGeneration: true;
  noCodexExecution: true;
  noExpoEasExecution: true;
  noNativeProjectCreation: true;
  noPackageChanges: true;
  noCredentialUse: true;
  noProviderCalls: true;
  noRuntimeExecution: true;
  noDashboardMutation: true;
  noDbSqlMutation: true;
  noCiActivation: true;
  noMemoryPersistence: true;
  noGitAutomationFromSource: true;
}

export interface MobileFeatureAcceptanceCriterion {
  criterionId: string;
  title: string;
  description: string;
  category: MobileFeatureCategory;
  expectedEvidence: readonly string[];
  riskLevel: PMRiskTier;
  requiredForScope: readonly MobileFeatureScope[];
  safetyBoundaries: Pick<
    MobileFeatureBlueprintSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noRuntimeExecution"
  >;
}

export interface MobileFeatureDefinitionOfDone {
  dodId: string;
  checklistItems: readonly string[];
  mappedArtifacts: readonly MobileFeatureArtifactTarget[];
  requiredEvidence: readonly string[];
  riskLevel: PMRiskTier;
  humanReviewRequired: boolean;
  safetyBoundaries: Pick<
    MobileFeatureBlueprintSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noCodexExecution" | "noRuntimeExecution"
  >;
}

export interface MobileFeatureDependency {
  dependencyId: string;
  dependencyType: MobileFeatureDependencyType;
  dependsOnRef: string;
  reason: string;
  blocking: boolean;
  riskLevel: PMRiskTier;
  requiredApproval: string | undefined;
  safetyBoundaries: Pick<
    MobileFeatureBlueprintSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noRuntimeExecution"
  >;
}

export interface MobileFeatureBlueprint {
  blueprintId: string;
  featureId: string;
  featureName: string;
  description: string;
  sourceRequirementRefs: readonly string[];
  appType: MobileAppFactoryAppType | "unknown_mobile_app";
  targetUsers: readonly string[];
  userRoles: readonly string[];
  coreFlowRefs: readonly string[];
  screenPatternRefs: readonly string[];
  routeRefs: readonly string[];
  stateRefs: readonly string[];
  dataRefs: readonly string[];
  securityRefs: readonly string[];
  performanceRefs: readonly string[];
  testingRefs: readonly string[];
  releaseRefs: readonly string[];
  priority: MobileFeatureBlueprintPriority;
  phaseScope: readonly MobileFeatureScope[];
  category: MobileFeatureCategory;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  acceptanceCriteria: readonly MobileFeatureAcceptanceCriterion[];
  definitionOfDone: MobileFeatureDefinitionOfDone;
  dependencies: readonly MobileFeatureDependency[];
  limitations: readonly string[];
  safetyBoundaries: MobileFeatureBlueprintSafetyBoundaries;
}

export interface MobileFeatureBlueprintGeneratorInput {
  generatorInputId: string;
  sourceRequirementsInterviewRef: string;
  requirementCandidates: readonly MobileRequirementCandidate[];
  appFactoryContext: readonly string[];
  architectureProfileContext: readonly string[];
  uxPatternContext: readonly string[];
  navigationContext: readonly string[];
  stateContext: readonly string[];
  offlineContext: readonly string[];
  securityContext: readonly string[];
  performanceContext: readonly string[];
  testingContext: readonly string[];
  releaseContext: readonly string[];
  constraints: readonly string[];
  assumptions: readonly string[];
  evidenceRefs: readonly PMEvidenceReference[];
  safetyBoundaries: MobileFeatureBlueprintSafetyBoundaries;
}

export interface MobileFeatureArtifactMapping {
  mappingId: string;
  sourceBlueprintRefs: readonly string[];
  mobileAppFactoryStrategy: readonly string[];
  reactNativeExpoArchitectureProfile: readonly string[];
  mobileUxUiPatternCatalog: readonly string[];
  mobileNavigationFlowModel: readonly string[];
  mobileStateManagementStrategy: readonly string[];
  offlineCacheSyncStrategy: readonly string[];
  mobileSecurityBaseline: readonly string[];
  mobilePerformanceChecklist: readonly string[];
  mobileTestingStrategy: readonly string[];
  mobileReleaseEasStrategy: readonly string[];
  pmReport: readonly string[];
  taskGraph: readonly string[];
  dodCriteria: readonly string[];
  riskBlockerModel: readonly string[];
  autopilotHandoffContext: readonly string[];
  safetyBoundaries: Pick<
    MobileFeatureBlueprintSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noCodexExecution" | "noRuntimeExecution"
  >;
}

export interface MobileFeatureBlueprintRecommendation {
  recommendationId: string;
  safeSummary: string;
  nextRecommendedArtifact: MobileFeatureBlueprintNextArtifact;
  humanReviewRequired: boolean;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<
    MobileFeatureBlueprintSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noCodexExecution" | "noAppGeneration"
  >;
}

export interface MobileFeatureBlueprintSummary {
  outputId: string;
  sourceRequirementsInterviewRef: string;
  blueprintCount: number;
  mvpFeatureCount: number;
  betaFeatureCount: number;
  releaseFeatureCount: number;
  blockedFeatureCount: number;
  dependencyCount: number;
  approvalCount: number;
  unresolvedQuestionCount: number;
  riskLevel: PMRiskTier;
  confidence: MobileFeatureBlueprintConfidence;
  humanReviewRequired: boolean;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: MobileFeatureBlueprintSafetyBoundaries;
}

export interface MobileFeatureBlueprintOutput {
  outputId: string;
  sourceRequirementsInterviewRef: string;
  blueprints: readonly MobileFeatureBlueprint[];
  mvpFeatures: readonly MobileFeatureBlueprint[];
  betaFeatures: readonly MobileFeatureBlueprint[];
  releaseFeatures: readonly MobileFeatureBlueprint[];
  blockedFeatures: readonly MobileFeatureBlueprint[];
  unresolvedQuestions: readonly string[];
  recommendedNextArtifact: MobileFeatureBlueprintNextArtifact;
  confidence: MobileFeatureBlueprintConfidence;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  artifactMapping: MobileFeatureArtifactMapping;
  recommendation: MobileFeatureBlueprintRecommendation;
  summary: MobileFeatureBlueprintSummary;
  safetyBoundaries: MobileFeatureBlueprintSafetyBoundaries;
}

export interface MobileFeatureBlueprintGeneratorInputParams {
  generatorInputId?: string;
  sourceRequirementsInterviewRef?: string;
  requirementsInterview?: MobileRequirementsInterview | MobileRequirementsOutput;
  requirementCandidates?: readonly MobileRequirementCandidate[];
  appFactoryContext?: readonly string[];
  architectureProfileContext?: readonly string[];
  uxPatternContext?: readonly string[];
  navigationContext?: readonly string[];
  stateContext?: readonly string[];
  offlineContext?: readonly string[];
  securityContext?: readonly string[];
  performanceContext?: readonly string[];
  testingContext?: readonly string[];
  releaseContext?: readonly string[];
  constraints?: readonly string[];
  assumptions?: readonly string[];
  evidenceRefs?: readonly PMEvidenceReference[];
}

export const mobileFeatureCategories: readonly MobileFeatureCategory[] = [
  "onboarding",
  "authentication",
  "dashboard",
  "profile_settings",
  "forms",
  "content_list",
  "detail_view",
  "messaging",
  "marketplace",
  "gamification",
  "offline_sync",
  "monetization",
  "safety_trust",
  "notifications",
  "analytics_reporting",
  "admin_management",
  "ai_assistant",
  "unknown",
];

const safetyBoundaries = (): MobileFeatureBlueprintSafetyBoundaries => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noFeatureCodeGeneration: true,
  noScreenGeneration: true,
  noRouteGeneration: true,
  noAppGeneration: true,
  noCodexExecution: true,
  noExpoEasExecution: true,
  noNativeProjectCreation: true,
  noPackageChanges: true,
  noCredentialUse: true,
  noProviderCalls: true,
  noRuntimeExecution: true,
  noDashboardMutation: true,
  noDbSqlMutation: true,
  noCiActivation: true,
  noMemoryPersistence: true,
  noGitAutomationFromSource: true,
});

const passiveSafety = (): MobileFeatureAcceptanceCriterion["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noRuntimeExecution: true,
});

const dodSafety = (): MobileFeatureDefinitionOfDone["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noCodexExecution: true,
  noRuntimeExecution: true,
});

const mappingSafety = (): MobileFeatureArtifactMapping["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noCodexExecution: true,
  noRuntimeExecution: true,
});

const recommendationSafety = (): MobileFeatureBlueprintRecommendation["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noCodexExecution: true,
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

const sourceRequirementsRef = (params: MobileFeatureBlueprintGeneratorInputParams): string => {
  if (params.sourceRequirementsInterviewRef) return params.sourceRequirementsInterviewRef;
  const source = params.requirementsInterview;
  if (!source) return "mobile_requirements_interview:unspecified";
  return "interviewId" in source ? source.interviewId : source.outputId;
};

const requirementCandidatesFromParams = (
  params: MobileFeatureBlueprintGeneratorInputParams,
): readonly MobileRequirementCandidate[] => {
  if (params.requirementCandidates) return [...params.requirementCandidates];
  const source = params.requirementsInterview;
  if (!source) return [];
  return "requirementCandidates" in source ? [...source.requirementCandidates] : [...source.mvpScope, ...source.betaScope, ...source.releaseScope];
};

const featureCategoryFromRequirement = (candidate: MobileRequirementCandidate): MobileFeatureCategory => {
  const text = `${candidate.category} ${candidate.title} ${candidate.description}`.toLowerCase();

  if (text.includes("onboard")) return "onboarding";
  if (text.includes("auth") || text.includes("session") || text.includes("account")) return "authentication";
  if (text.includes("dashboard")) return "dashboard";
  if (text.includes("profile") || text.includes("settings")) return "profile_settings";
  if (text.includes("form") || text.includes("submit")) return "forms";
  if (text.includes("list") || text.includes("browse")) return "content_list";
  if (text.includes("detail")) return "detail_view";
  if (text.includes("message") || text.includes("chat")) return "messaging";
  if (text.includes("marketplace") || text.includes("buyer") || text.includes("seller")) return "marketplace";
  if (text.includes("gamif") || text.includes("progress")) return "gamification";
  if (text.includes("offline") || text.includes("sync")) return "offline_sync";
  if (text.includes("monet") || text.includes("subscription") || text.includes("payment")) return "monetization";
  if (text.includes("safety") || text.includes("privacy") || text.includes("report") || text.includes("block")) {
    return "safety_trust";
  }
  if (text.includes("notification") || text.includes("reminder")) return "notifications";
  if (text.includes("analytics") || text.includes("reporting")) return "analytics_reporting";
  if (text.includes("admin")) return "admin_management";
  if (text.includes("ai") || text.includes("assistant")) return "ai_assistant";

  return "unknown";
};

const priorityFromRequirement = (priority: MobileRequirementPriority): MobileFeatureBlueprintPriority => priority;

const scopesFromRequirement = (candidate: MobileRequirementCandidate): MobileFeatureScope[] =>
  uniqueStrings([
    ...(candidate.mvpRelevant ? ["mvp"] : []),
    ...(candidate.betaRelevant ? ["beta"] : []),
    ...(candidate.releaseRelevant ? ["release"] : []),
    ...(candidate.unresolved ? ["blocked"] : []),
    ...(!candidate.mvpRelevant && !candidate.betaRelevant && !candidate.releaseRelevant && !candidate.unresolved ? ["deferred"] : []),
  ]) as MobileFeatureScope[];

const refsForArtifacts = (
  candidate: MobileRequirementCandidate,
  artifacts: readonly MobileFeatureArtifactTarget[],
): string[] =>
  candidate.targetMobileArtifacts
    .filter((artifact): artifact is MobileFeatureArtifactTarget => artifacts.includes(artifact as MobileFeatureArtifactTarget))
    .map((artifact) => `${artifact}:${candidate.requirementId}`);

const defaultAcceptanceCriteria = (
  featureId: string,
  category: MobileFeatureCategory,
  description: string,
  riskLevel: PMRiskTier,
  scopes: readonly MobileFeatureScope[],
): readonly MobileFeatureAcceptanceCriterion[] => [
  {
    criterionId: `${featureId}:criterion:user_outcome`,
    title: "User outcome described",
    description,
    category,
    expectedEvidence: ["requirement_ref", "feature_scope_ref", "human_review_if_required"],
    riskLevel,
    requiredForScope: [...scopes],
    safetyBoundaries: passiveSafety(),
  },
  {
    criterionId: `${featureId}:criterion:states_and_review`,
    title: "States and review needs mapped",
    description: "Loading, empty, error, offline, accessibility, security, testing, and release needs remain mapped as metadata.",
    category,
    expectedEvidence: ["ux_ref", "security_ref", "testing_ref", "release_ref"],
    riskLevel,
    requiredForScope: [...scopes],
    safetyBoundaries: passiveSafety(),
  },
];

const defaultDefinitionOfDone = (
  featureId: string,
  mappedArtifacts: readonly MobileFeatureArtifactTarget[],
  riskLevel: PMRiskTier,
): MobileFeatureDefinitionOfDone => ({
  dodId: `${featureId}:dod`,
  checklistItems: [
    "requirements_mapped",
    "target_users_and_roles_mapped",
    "ux_navigation_state_data_refs_mapped",
    "security_testing_release_refs_mapped",
    "acceptance_criteria_written",
    "dependencies_documented",
    "risk_and_approval_posture_documented",
    "unresolved_questions_listed",
  ],
  mappedArtifacts: [...mappedArtifacts],
  requiredEvidence: ["blueprint_summary", "requirement_refs", "artifact_mapping"],
  riskLevel,
  humanReviewRequired: riskLevel === "high" || riskLevel === "critical",
  safetyBoundaries: dodSafety(),
});

const defaultDependencies = (
  featureId: string,
  candidate: MobileRequirementCandidate,
): readonly MobileFeatureDependency[] => [
  {
    dependencyId: `${featureId}:dependency:${candidate.requirementId}`,
    dependencyType: "requirement",
    dependsOnRef: candidate.requirementId,
    reason: "Feature blueprint is derived from this requirement candidate.",
    blocking: candidate.unresolved,
    riskLevel: candidate.riskLevel,
    requiredApproval: candidate.requiredApprovals[0],
    safetyBoundaries: passiveSafety(),
  },
  ...candidate.requiredApprovals.map((approval) => ({
    dependencyId: `${featureId}:dependency:approval:${approval}`,
    dependencyType: "human_approval" as const,
    dependsOnRef: approval,
    reason: "Human approval is required before implementation planning advances.",
    blocking: true,
    riskLevel: candidate.riskLevel,
    requiredApproval: approval,
    safetyBoundaries: passiveSafety(),
  })),
];

export const createMobileFeatureBlueprint = (
  input: Omit<MobileFeatureBlueprint, "safetyBoundaries"> & {
    safetyBoundaries?: MobileFeatureBlueprintSafetyBoundaries;
  },
): MobileFeatureBlueprint => ({
  blueprintId: input.blueprintId,
  featureId: input.featureId,
  featureName: input.featureName,
  description: input.description,
  sourceRequirementRefs: uniqueStrings(input.sourceRequirementRefs),
  appType: input.appType,
  targetUsers: uniqueStrings(input.targetUsers),
  userRoles: uniqueStrings(input.userRoles),
  coreFlowRefs: uniqueStrings(input.coreFlowRefs),
  screenPatternRefs: uniqueStrings(input.screenPatternRefs),
  routeRefs: uniqueStrings(input.routeRefs),
  stateRefs: uniqueStrings(input.stateRefs),
  dataRefs: uniqueStrings(input.dataRefs),
  securityRefs: uniqueStrings(input.securityRefs),
  performanceRefs: uniqueStrings(input.performanceRefs),
  testingRefs: uniqueStrings(input.testingRefs),
  releaseRefs: uniqueStrings(input.releaseRefs),
  priority: input.priority,
  phaseScope: [...input.phaseScope],
  category: input.category,
  riskLevel: input.riskLevel,
  requiredApprovals: uniqueStrings(input.requiredApprovals),
  acceptanceCriteria: [...input.acceptanceCriteria],
  definitionOfDone: input.definitionOfDone,
  dependencies: [...input.dependencies],
  limitations: uniqueStrings(input.limitations),
  safetyBoundaries: input.safetyBoundaries ?? safetyBoundaries(),
});

export const createMobileFeatureBlueprintGeneratorInput = (
  params: MobileFeatureBlueprintGeneratorInputParams,
): MobileFeatureBlueprintGeneratorInput => ({
  generatorInputId: params.generatorInputId ?? "mobile_feature_blueprint_input:default",
  sourceRequirementsInterviewRef: sourceRequirementsRef(params),
  requirementCandidates: requirementCandidatesFromParams(params),
  appFactoryContext: uniqueStrings(params.appFactoryContext),
  architectureProfileContext: uniqueStrings(params.architectureProfileContext),
  uxPatternContext: uniqueStrings(params.uxPatternContext),
  navigationContext: uniqueStrings(params.navigationContext),
  stateContext: uniqueStrings(params.stateContext),
  offlineContext: uniqueStrings(params.offlineContext),
  securityContext: uniqueStrings(params.securityContext),
  performanceContext: uniqueStrings(params.performanceContext),
  testingContext: uniqueStrings(params.testingContext),
  releaseContext: uniqueStrings(params.releaseContext),
  constraints: uniqueStrings(params.constraints),
  assumptions: uniqueStrings([
    "Feature blueprints are metadata-only and advisory.",
    "Implementation, UI, route, app, provider, dashboard, DB/SQL, CI, and release actions remain future-gated.",
    ...(params.assumptions ?? []),
  ]),
  evidenceRefs: [...(params.evidenceRefs ?? [])],
  safetyBoundaries: safetyBoundaries(),
});

export const mapRequirementsToFeatureBlueprints = (
  input: MobileFeatureBlueprintGeneratorInput,
): readonly MobileFeatureBlueprint[] =>
  input.requirementCandidates.map((candidate) => {
    const category = featureCategoryFromRequirement(candidate);
    const scopes = scopesFromRequirement(candidate);
    const featureId = `mobile_feature:${candidate.requirementId}`;
    const mappedArtifacts = candidate.targetMobileArtifacts.filter(
      (artifact): artifact is MobileFeatureArtifactTarget =>
        [
          "mobile_app_factory_strategy",
          "react_native_expo_architecture_profile",
          "mobile_ux_ui_pattern_catalog",
          "mobile_navigation_flow_model",
          "mobile_state_management_strategy",
          "offline_cache_sync_strategy",
          "mobile_security_baseline",
          "mobile_performance_checklist",
          "mobile_testing_strategy",
          "mobile_release_eas_strategy",
          "pm_report",
          "task_graph",
          "dod_criteria",
          "risk_blocker_model",
          "autopilot_handoff_context",
        ].includes(artifact),
    );

    return createMobileFeatureBlueprint({
      blueprintId: `mobile_feature_blueprint:${candidate.requirementId}`,
      featureId,
      featureName: candidate.title,
      description: candidate.description,
      sourceRequirementRefs: [candidate.requirementId, ...candidate.sourceAnswerRefs],
      appType: "unknown_mobile_app",
      targetUsers: [],
      userRoles: refsForArtifacts(candidate, ["mobile_navigation_flow_model", "mobile_security_baseline"]),
      coreFlowRefs: refsForArtifacts(candidate, ["mobile_app_factory_strategy", "mobile_navigation_flow_model"]),
      screenPatternRefs: refsForArtifacts(candidate, ["mobile_ux_ui_pattern_catalog"]),
      routeRefs: refsForArtifacts(candidate, ["mobile_navigation_flow_model"]),
      stateRefs: refsForArtifacts(candidate, ["mobile_state_management_strategy"]),
      dataRefs: refsForArtifacts(candidate, ["mobile_state_management_strategy", "offline_cache_sync_strategy"]),
      securityRefs: refsForArtifacts(candidate, ["mobile_security_baseline", "risk_blocker_model"]),
      performanceRefs: refsForArtifacts(candidate, ["mobile_performance_checklist"]),
      testingRefs: refsForArtifacts(candidate, ["mobile_testing_strategy", "dod_criteria"]),
      releaseRefs: refsForArtifacts(candidate, ["mobile_release_eas_strategy"]),
      priority: priorityFromRequirement(candidate.priority),
      phaseScope: scopes,
      category,
      riskLevel: candidate.riskLevel,
      requiredApprovals: [...candidate.requiredApprovals],
      acceptanceCriteria: defaultAcceptanceCriteria(featureId, category, candidate.description, candidate.riskLevel, scopes),
      definitionOfDone: defaultDefinitionOfDone(featureId, mappedArtifacts, candidate.riskLevel),
      dependencies: defaultDependencies(featureId, candidate),
      limitations: uniqueStrings([
        ...(candidate.unresolved ? ["requirement_unresolved"] : []),
        ...(candidate.requiredApprovals.length > 0 ? ["approval_required_before_implementation"] : []),
        "metadata_only_blueprint",
      ]),
    });
  });

const refsForBlueprints = (
  blueprints: readonly MobileFeatureBlueprint[],
  selector: (blueprint: MobileFeatureBlueprint) => readonly string[],
): string[] => uniqueStrings(blueprints.flatMap((blueprint) => selector(blueprint)));

const mapBlueprintsToArtifacts = (blueprints: readonly MobileFeatureBlueprint[]): MobileFeatureArtifactMapping => ({
  mappingId: "mobile_feature_blueprint_mapping:default",
  sourceBlueprintRefs: blueprints.map((blueprint) => blueprint.blueprintId),
  mobileAppFactoryStrategy: refsForBlueprints(blueprints, (blueprint) => blueprint.coreFlowRefs),
  reactNativeExpoArchitectureProfile: refsForBlueprints(blueprints, (blueprint) => [
    ...blueprint.stateRefs,
    ...blueprint.dataRefs,
  ]),
  mobileUxUiPatternCatalog: refsForBlueprints(blueprints, (blueprint) => blueprint.screenPatternRefs),
  mobileNavigationFlowModel: refsForBlueprints(blueprints, (blueprint) => blueprint.routeRefs),
  mobileStateManagementStrategy: refsForBlueprints(blueprints, (blueprint) => blueprint.stateRefs),
  offlineCacheSyncStrategy: refsForBlueprints(blueprints, (blueprint) => blueprint.dataRefs),
  mobileSecurityBaseline: refsForBlueprints(blueprints, (blueprint) => blueprint.securityRefs),
  mobilePerformanceChecklist: refsForBlueprints(blueprints, (blueprint) => blueprint.performanceRefs),
  mobileTestingStrategy: refsForBlueprints(blueprints, (blueprint) => blueprint.testingRefs),
  mobileReleaseEasStrategy: refsForBlueprints(blueprints, (blueprint) => blueprint.releaseRefs),
  pmReport: blueprints.map((blueprint) => blueprint.blueprintId),
  taskGraph: blueprints.map((blueprint) => blueprint.featureId),
  dodCriteria: blueprints.map((blueprint) => blueprint.definitionOfDone.dodId),
  riskBlockerModel: refsForBlueprints(blueprints, (blueprint) =>
    blueprint.riskLevel === "high" || blueprint.riskLevel === "critical" || blueprint.phaseScope.includes("blocked")
      ? [blueprint.blueprintId]
      : [],
  ),
  autopilotHandoffContext: blueprints.map((blueprint) => blueprint.blueprintId),
  safetyBoundaries: mappingSafety(),
});

const confidenceFromBlueprints = (
  blueprints: readonly MobileFeatureBlueprint[],
  unresolvedQuestions: readonly string[],
): MobileFeatureBlueprintConfidence => {
  if (unresolvedQuestions.length >= 3 || blueprints.some((blueprint) => blueprint.phaseScope.includes("blocked"))) {
    return "blocked_by_unknowns";
  }
  if (unresolvedQuestions.length > 0 || blueprints.some((blueprint) => blueprint.limitations.length > 0)) {
    return "medium";
  }
  return blueprints.length > 0 ? "high" : "low";
};

const buildRecommendation = (
  riskLevel: PMRiskTier,
  confidence: MobileFeatureBlueprintConfidence,
  requiredApprovals: readonly string[],
): MobileFeatureBlueprintRecommendation => {
  const humanReviewRequired = riskLevel === "high" || riskLevel === "critical" || requiredApprovals.length > 0;
  const nextRecommendedArtifact: MobileFeatureBlueprintNextArtifact =
    confidence === "blocked_by_unknowns"
      ? "blocked_by_unknowns"
      : humanReviewRequired
        ? "human_review"
        : "mobile_screen_blueprint_generator_plan";

  return {
    recommendationId: "mobile_feature_blueprint_recommendation:134B",
    safeSummary:
      "Use feature blueprint metadata as advisory context for future screen blueprint planning after human review when needed.",
    nextRecommendedArtifact,
    humanReviewRequired,
    riskLevel,
    requiredApprovals: [...requiredApprovals],
    recommendedNextStep: {
      nextStepId: "mobile_feature_blueprint_next_step:134B",
      title: "Plan the Mobile Screen Blueprint Generator",
      safeSummary:
        "Continue with Phase 134B to plan screen blueprint metadata before any UI, route, or app work.",
      priority: riskLevel,
      decisionMode: "plan_only",
      riskSurfaces: ["automation", "scaffold", "security_policy", "release", "unknown"],
      recommendationOnly: true,
      noExecution: true,
    },
    safetyBoundaries: recommendationSafety(),
  };
};

export const selectFeatureBlueprintsByScope = (
  blueprints: readonly MobileFeatureBlueprint[],
  scope: MobileFeatureScope,
): readonly MobileFeatureBlueprint[] => blueprints.filter((blueprint) => blueprint.phaseScope.includes(scope));

export const selectFeatureBlueprintsByCategory = (
  blueprints: readonly MobileFeatureBlueprint[],
  category: MobileFeatureCategory,
): readonly MobileFeatureBlueprint[] => blueprints.filter((blueprint) => blueprint.category === category);

export const createMobileFeatureBlueprintOutput = (
  input: Omit<
    MobileFeatureBlueprintOutput,
    "artifactMapping" | "recommendation" | "summary" | "safetyBoundaries"
  > & {
    artifactMapping?: MobileFeatureArtifactMapping;
    recommendation?: MobileFeatureBlueprintRecommendation;
    summary?: MobileFeatureBlueprintSummary;
    safetyBoundaries?: MobileFeatureBlueprintSafetyBoundaries;
  },
): MobileFeatureBlueprintOutput => {
  const boundaries = input.safetyBoundaries ?? safetyBoundaries();
  const artifactMapping = input.artifactMapping ?? mapBlueprintsToArtifacts(input.blueprints);
  const recommendation =
    input.recommendation ?? buildRecommendation(input.riskLevel, input.confidence, input.requiredApprovals);
  const outputWithoutSummary = {
    outputId: input.outputId,
    sourceRequirementsInterviewRef: input.sourceRequirementsInterviewRef,
    blueprints: [...input.blueprints],
    mvpFeatures: [...input.mvpFeatures],
    betaFeatures: [...input.betaFeatures],
    releaseFeatures: [...input.releaseFeatures],
    blockedFeatures: [...input.blockedFeatures],
    unresolvedQuestions: uniqueStrings(input.unresolvedQuestions),
    recommendedNextArtifact: input.recommendedNextArtifact,
    confidence: input.confidence,
    riskLevel: input.riskLevel,
    requiredApprovals: uniqueStrings(input.requiredApprovals),
    artifactMapping,
    recommendation,
    safetyBoundaries: boundaries,
  };
  const summary = input.summary ?? summarizeMobileFeatureBlueprintOutput(outputWithoutSummary);

  return {
    ...outputWithoutSummary,
    summary,
  };
};

export const summarizeMobileFeatureBlueprintOutput = (
  output: Pick<
    MobileFeatureBlueprintOutput,
    | "outputId"
    | "sourceRequirementsInterviewRef"
    | "blueprints"
    | "mvpFeatures"
    | "betaFeatures"
    | "releaseFeatures"
    | "blockedFeatures"
    | "unresolvedQuestions"
    | "riskLevel"
    | "confidence"
    | "requiredApprovals"
    | "recommendation"
    | "safetyBoundaries"
  >,
): MobileFeatureBlueprintSummary => ({
  outputId: output.outputId,
  sourceRequirementsInterviewRef: output.sourceRequirementsInterviewRef,
  blueprintCount: output.blueprints.length,
  mvpFeatureCount: output.mvpFeatures.length,
  betaFeatureCount: output.betaFeatures.length,
  releaseFeatureCount: output.releaseFeatures.length,
  blockedFeatureCount: output.blockedFeatures.length,
  dependencyCount: output.blueprints.reduce((count, blueprint) => count + blueprint.dependencies.length, 0),
  approvalCount: output.requiredApprovals.length,
  unresolvedQuestionCount: output.unresolvedQuestions.length,
  riskLevel: output.riskLevel,
  confidence: output.confidence,
  humanReviewRequired: output.recommendation.humanReviewRequired,
  recommendedNextPhase: "Phase 134B",
  safeSummary:
    `${output.blueprints.length} feature blueprint(s), ${output.blockedFeatures.length} blocked, ${output.confidence} confidence.`,
  safetyBoundaries: output.safetyBoundaries,
});

export const generateMobileFeatureBlueprints = (
  input: MobileFeatureBlueprintGeneratorInput,
): MobileFeatureBlueprintOutput => {
  const blueprints = mapRequirementsToFeatureBlueprints(input);
  const mvpFeatures = selectFeatureBlueprintsByScope(blueprints, "mvp");
  const betaFeatures = selectFeatureBlueprintsByScope(blueprints, "beta");
  const releaseFeatures = selectFeatureBlueprintsByScope(blueprints, "release");
  const blockedFeatures = selectFeatureBlueprintsByScope(blueprints, "blocked");
  const unresolvedQuestions = uniqueStrings([
    ...input.constraints,
    ...blueprints.filter((blueprint) => blueprint.phaseScope.includes("blocked")).map((blueprint) => blueprint.featureName),
  ]);
  const riskLevel = highestRisk(blueprints.map((blueprint) => blueprint.riskLevel));
  const requiredApprovals = uniqueStrings(blueprints.flatMap((blueprint) => blueprint.requiredApprovals));
  const confidence = confidenceFromBlueprints(blueprints, unresolvedQuestions);
  const recommendation = buildRecommendation(riskLevel, confidence, requiredApprovals);

  return createMobileFeatureBlueprintOutput({
    outputId: `mobile_feature_blueprint_output:${input.generatorInputId}`,
    sourceRequirementsInterviewRef: input.sourceRequirementsInterviewRef,
    blueprints,
    mvpFeatures,
    betaFeatures,
    releaseFeatures,
    blockedFeatures,
    unresolvedQuestions,
    recommendedNextArtifact: recommendation.nextRecommendedArtifact,
    confidence,
    riskLevel,
    requiredApprovals,
    recommendation,
  });
};
