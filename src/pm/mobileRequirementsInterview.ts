import type { AppIdeaIntakeInterview, AppIdeaIntakeOutput } from "./appIdeaIntakeInterview.js";
import type { PMEvidenceReference, PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type MobileRequirementCategory =
  | "functional"
  | "user_roles"
  | "core_workflows"
  | "data"
  | "auth_session"
  | "offline_sync"
  | "security_privacy"
  | "ux_accessibility"
  | "monetization"
  | "performance"
  | "testing"
  | "release"
  | "constraints"
  | "unknowns";

export type MobileRequirementScope =
  | "mvp"
  | "beta"
  | "release"
  | "deferred"
  | "blocked_until_clarified";

export type MobileRequirementAnswerType =
  | "free_text"
  | "single_choice"
  | "multi_choice"
  | "yes_no"
  | "ranked_list"
  | "scope_bucket"
  | "risk_flag"
  | "acceptance_criteria"
  | "unknown_allowed";

export type MobileRequirementPriority =
  | "must_have_mvp"
  | "should_have_beta"
  | "release_ready"
  | "defer_later"
  | "blocked_until_clarified";

export type MobileRequirementsConfidence = "high" | "medium" | "low" | "blocked_by_unknowns";

export type MobileRequirementClarificationPriority =
  | "required_before_factory_mapping"
  | "required_before_architecture"
  | "required_before_ux_navigation"
  | "required_before_state_data"
  | "required_before_security"
  | "required_before_testing"
  | "required_before_release"
  | "optional_for_mvp"
  | "optional_for_beta"
  | "optional_for_later";

export type MobileRequirementsNextArtifact =
  | "mobile_feature_blueprint_generator_plan"
  | "requirements_followup_needed"
  | "human_review"
  | "blocked_by_unknowns";

export type MobileRequirementsArtifactTarget =
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

export interface MobileRequirementsSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noChatAutomation: true;
  noMessageSending: true;
  noWhatsAppExecution: true;
  noOpenClaw: true;
  noCodexExecution: true;
  noAppGeneration: true;
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

export interface MobileRequirementQuestion {
  questionId: string;
  category: MobileRequirementCategory;
  questionText: string;
  required: boolean;
  answerType: MobileRequirementAnswerType;
  mapsToRequirement: string;
  mapsToMobileArtifact: readonly MobileRequirementsArtifactTarget[];
  followUpTriggers: readonly string[];
  riskIfUnknown: PMRiskTier;
  examples: readonly string[];
  clarificationPriority: MobileRequirementClarificationPriority;
  safetyBoundaries: Pick<
    MobileRequirementsSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noChatAutomation" | "noMessageSending"
  >;
}

export interface MobileRequirementCandidate {
  requirementId: string;
  title: string;
  category: MobileRequirementCategory;
  description: string;
  priority: MobileRequirementPriority;
  sourceAnswerRefs: readonly string[];
  targetMobileArtifacts: readonly MobileRequirementsArtifactTarget[];
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  mvpRelevant: boolean;
  betaRelevant: boolean;
  releaseRelevant: boolean;
  unresolved: boolean;
  safetyBoundaries: Pick<
    MobileRequirementsSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noAppGeneration" | "noRuntimeExecution"
  >;
}

export interface MobileRequirementAnswer {
  answerId: string;
  questionId: string;
  answerText: string;
  normalizedValue: string | readonly string[] | boolean | undefined;
  requirementCandidate: MobileRequirementCandidate | undefined;
  priority: MobileRequirementPriority;
  confidence: MobileRequirementsConfidence;
  unresolved: boolean;
  needsFollowUp: boolean;
  evidenceRefs: readonly PMEvidenceReference[];
  safetyBoundaries: Pick<
    MobileRequirementsSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noChatAutomation" | "noMessageSending"
  >;
}

export interface MobileRequirementsArtifactMapping {
  mappingId: string;
  sourceRequirementRefs: readonly string[];
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
    MobileRequirementsSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noCodexExecution" | "noRuntimeExecution"
  >;
}

export interface MobileRequirementsOutput {
  outputId: string;
  sourceIdeaIntakeRef: string;
  requirementScope: readonly MobileRequirementScope[];
  functionalRequirements: readonly MobileRequirementCandidate[];
  nonFunctionalRequirements: readonly MobileRequirementCandidate[];
  userRoles: readonly MobileRequirementCandidate[];
  coreWorkflows: readonly MobileRequirementCandidate[];
  dataRequirements: readonly MobileRequirementCandidate[];
  technicalConstraints: readonly MobileRequirementCandidate[];
  businessConstraints: readonly MobileRequirementCandidate[];
  mvpScope: readonly MobileRequirementCandidate[];
  betaScope: readonly MobileRequirementCandidate[];
  releaseScope: readonly MobileRequirementCandidate[];
  unresolvedQuestions: readonly string[];
  confidence: MobileRequirementsConfidence;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  nextRecommendedArtifact: MobileRequirementsNextArtifact;
  artifactMapping: MobileRequirementsArtifactMapping;
  downstreamMetadataTargets: readonly string[];
  safetyBoundaries: MobileRequirementsSafetyBoundaries;
}

export interface MobileRequirementsRecommendation {
  recommendationId: string;
  safeSummary: string;
  nextStep: PMRecommendedNextStep;
  nextRecommendedArtifact: MobileRequirementsNextArtifact;
  humanReviewRequired: boolean;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  safetyBoundaries: Pick<
    MobileRequirementsSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noChatAutomation" | "noCodexExecution" | "noAppGeneration"
  >;
}

export interface MobileRequirementsSummary {
  interviewId: string;
  sourceIdeaIntakeRef: string;
  questionCount: number;
  requiredQuestionCount: number;
  answerCount: number;
  requirementCandidateCount: number;
  mvpRequirementCount: number;
  betaRequirementCount: number;
  releaseRequirementCount: number;
  unresolvedRequiredQuestionCount: number;
  riskLevel: PMRiskTier;
  confidence: MobileRequirementsConfidence;
  humanReviewRequired: boolean;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: MobileRequirementsSafetyBoundaries;
}

export interface MobileRequirementsInterview {
  interviewId: string;
  phaseRef: ProjectPhaseRef;
  sourceIdeaIntakeRef: string;
  requirementScope: readonly MobileRequirementScope[];
  functionalRequirements: readonly MobileRequirementCandidate[];
  nonFunctionalRequirements: readonly MobileRequirementCandidate[];
  userRoles: readonly MobileRequirementCandidate[];
  coreWorkflows: readonly MobileRequirementCandidate[];
  dataRequirements: readonly MobileRequirementCandidate[];
  technicalConstraints: readonly MobileRequirementCandidate[];
  businessConstraints: readonly MobileRequirementCandidate[];
  mvpScope: readonly MobileRequirementCandidate[];
  betaScope: readonly MobileRequirementCandidate[];
  releaseScope: readonly MobileRequirementCandidate[];
  unresolvedQuestions: readonly string[];
  confidence: MobileRequirementsConfidence;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  nextRecommendedArtifact: MobileRequirementsNextArtifact;
  questions: readonly MobileRequirementQuestion[];
  answers: readonly MobileRequirementAnswer[];
  requirementCandidates: readonly MobileRequirementCandidate[];
  output: MobileRequirementsOutput;
  recommendation: MobileRequirementsRecommendation;
  summary: MobileRequirementsSummary;
  safetyBoundaries: MobileRequirementsSafetyBoundaries;
}

export interface MobileRequirementsInput {
  interviewId?: string;
  phaseRef?: ProjectPhaseRef;
  sourceIdeaIntakeRef?: string;
  sourceIdeaIntake?: AppIdeaIntakeInterview | AppIdeaIntakeOutput;
  requirementScope?: readonly MobileRequirementScope[];
  questions?: readonly MobileRequirementQuestion[];
  answers?: readonly MobileRequirementAnswer[];
  requirementCandidates?: readonly MobileRequirementCandidate[];
  functionalRequirements?: readonly MobileRequirementCandidate[];
  nonFunctionalRequirements?: readonly MobileRequirementCandidate[];
  userRoles?: readonly MobileRequirementCandidate[];
  coreWorkflows?: readonly MobileRequirementCandidate[];
  dataRequirements?: readonly MobileRequirementCandidate[];
  technicalConstraints?: readonly MobileRequirementCandidate[];
  businessConstraints?: readonly MobileRequirementCandidate[];
  mvpScope?: readonly MobileRequirementCandidate[];
  betaScope?: readonly MobileRequirementCandidate[];
  releaseScope?: readonly MobileRequirementCandidate[];
  unresolvedQuestions?: readonly string[];
  confidence?: MobileRequirementsConfidence;
  riskLevel?: PMRiskTier;
  requiredApprovals?: readonly string[];
}

export const mobileRequirementCategories: readonly MobileRequirementCategory[] = [
  "functional",
  "user_roles",
  "core_workflows",
  "data",
  "auth_session",
  "offline_sync",
  "security_privacy",
  "ux_accessibility",
  "monetization",
  "performance",
  "testing",
  "release",
  "constraints",
  "unknowns",
];

export const mobileRequirementsArtifactTargets: readonly MobileRequirementsArtifactTarget[] = [
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
];

const safetyBoundaries = (): MobileRequirementsSafetyBoundaries => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noChatAutomation: true,
  noMessageSending: true,
  noWhatsAppExecution: true,
  noOpenClaw: true,
  noCodexExecution: true,
  noAppGeneration: true,
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

const questionSafety = (): MobileRequirementQuestion["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noChatAutomation: true,
  noMessageSending: true,
});

const candidateSafety = (): MobileRequirementCandidate["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noAppGeneration: true,
  noRuntimeExecution: true,
});

const mappingSafety = (): MobileRequirementsArtifactMapping["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noCodexExecution: true,
  noRuntimeExecution: true,
});

const recommendationSafety = (): MobileRequirementsRecommendation["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noChatAutomation: true,
  noCodexExecution: true,
  noAppGeneration: true,
});

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const splitAnswer = (answerText: string): string[] =>
  uniqueStrings(
    answerText
      .split(/[,\n;]/u)
      .map((value) => value.trim())
      .filter(Boolean),
  );

const questionByCategory = (
  category: MobileRequirementCategory,
  questionText: string,
  mapsToRequirement: string,
  mapsToMobileArtifact: readonly MobileRequirementsArtifactTarget[],
  options?: Partial<MobileRequirementQuestion>,
): MobileRequirementQuestion =>
  createMobileRequirementQuestion({
    questionId: `mobile_requirement_question:${category}:${mapsToRequirement}`,
    category,
    questionText,
    required: options?.required ?? true,
    answerType: options?.answerType ?? "free_text",
    mapsToRequirement,
    mapsToMobileArtifact,
    followUpTriggers: options?.followUpTriggers ?? [],
    riskIfUnknown: options?.riskIfUnknown ?? "medium",
    examples: options?.examples ?? [],
    clarificationPriority: options?.clarificationPriority ?? "required_before_factory_mapping",
  });

export const createMobileRequirementQuestion = (
  input: Omit<MobileRequirementQuestion, "safetyBoundaries"> & {
    safetyBoundaries?: MobileRequirementQuestion["safetyBoundaries"];
  },
): MobileRequirementQuestion => ({
  questionId: input.questionId,
  category: input.category,
  questionText: input.questionText,
  required: input.required,
  answerType: input.answerType,
  mapsToRequirement: input.mapsToRequirement,
  mapsToMobileArtifact: [...input.mapsToMobileArtifact],
  followUpTriggers: uniqueStrings(input.followUpTriggers),
  riskIfUnknown: input.riskIfUnknown,
  examples: uniqueStrings(input.examples),
  clarificationPriority: input.clarificationPriority,
  safetyBoundaries: input.safetyBoundaries ?? questionSafety(),
});

export const createMobileRequirementCandidate = (
  input: Omit<MobileRequirementCandidate, "safetyBoundaries"> & {
    safetyBoundaries?: MobileRequirementCandidate["safetyBoundaries"];
  },
): MobileRequirementCandidate => ({
  requirementId: input.requirementId,
  title: input.title,
  category: input.category,
  description: input.description,
  priority: input.priority,
  sourceAnswerRefs: uniqueStrings(input.sourceAnswerRefs),
  targetMobileArtifacts: [...input.targetMobileArtifacts],
  riskLevel: input.riskLevel,
  requiredApprovals: uniqueStrings(input.requiredApprovals),
  mvpRelevant: input.mvpRelevant,
  betaRelevant: input.betaRelevant,
  releaseRelevant: input.releaseRelevant,
  unresolved: input.unresolved,
  safetyBoundaries: input.safetyBoundaries ?? candidateSafety(),
});

export const createMobileRequirementAnswer = (
  input: Omit<MobileRequirementAnswer, "normalizedValue" | "requirementCandidate" | "safetyBoundaries"> & {
    normalizedValue?: MobileRequirementAnswer["normalizedValue"];
    requirementCandidate?: MobileRequirementCandidate | undefined;
    safetyBoundaries?: MobileRequirementAnswer["safetyBoundaries"];
  },
): MobileRequirementAnswer => ({
  answerId: input.answerId,
  questionId: input.questionId,
  answerText: input.answerText,
  normalizedValue: input.normalizedValue ?? splitAnswer(input.answerText),
  requirementCandidate: input.requirementCandidate,
  priority: input.priority,
  confidence: input.confidence,
  unresolved: input.unresolved,
  needsFollowUp: input.needsFollowUp,
  evidenceRefs: [...input.evidenceRefs],
  safetyBoundaries: input.safetyBoundaries ?? questionSafety(),
});

export const buildDefaultMobileRequirementQuestions = (): readonly MobileRequirementQuestion[] => [
  questionByCategory(
    "functional",
    "Which user-visible capabilities must be present in the MVP?",
    "functionalRequirements",
    ["mobile_app_factory_strategy", "task_graph", "dod_criteria"],
    { answerType: "ranked_list", examples: ["Create booking", "Track status", "Edit profile"] },
  ),
  questionByCategory(
    "user_roles",
    "Which user roles exist and what can each role do?",
    "userRoles",
    ["mobile_navigation_flow_model", "mobile_security_baseline", "task_graph"],
    { answerType: "multi_choice", examples: ["Guest", "Customer", "Operator", "Admin"] },
  ),
  questionByCategory(
    "core_workflows",
    "Which workflows define a successful first version?",
    "coreWorkflows",
    ["mobile_navigation_flow_model", "mobile_ux_ui_pattern_catalog", "mobile_testing_strategy"],
    { answerType: "multi_choice", examples: ["Onboard", "Submit request", "Review outcome"] },
  ),
  questionByCategory("data", "What entities, fields, and sensitivity levels are required?", "dataRequirements", [
    "mobile_state_management_strategy",
    "offline_cache_sync_strategy",
    "mobile_security_baseline",
  ]),
  questionByCategory(
    "auth_session",
    "What account, role, permission, recovery, or session behavior is required?",
    "authSessionRequirements",
    ["mobile_navigation_flow_model", "mobile_state_management_strategy", "mobile_security_baseline"],
    { answerType: "multi_choice", clarificationPriority: "required_before_security" },
  ),
  questionByCategory(
    "offline_sync",
    "Which flows should work with unreliable connectivity and what recovery is expected?",
    "offlineSyncRequirements",
    ["offline_cache_sync_strategy", "mobile_state_management_strategy", "mobile_ux_ui_pattern_catalog"],
    { required: false, riskIfUnknown: "medium" },
  ),
  questionByCategory(
    "security_privacy",
    "What privacy, safety, abuse, consent, or compliance requirements are known?",
    "securityPrivacyRequirements",
    ["mobile_security_baseline", "risk_blocker_model", "dod_criteria"],
    { answerType: "risk_flag", riskIfUnknown: "high", clarificationPriority: "required_before_security" },
  ),
  questionByCategory(
    "ux_accessibility",
    "Which UX states and accessibility requirements are mandatory?",
    "uxAccessibilityRequirements",
    ["mobile_ux_ui_pattern_catalog", "mobile_testing_strategy", "dod_criteria"],
    { examples: ["Loading", "Empty", "Error", "Offline", "Screen reader labels"] },
  ),
  questionByCategory(
    "monetization",
    "Is monetization required for MVP, beta, release, or later?",
    "monetizationRequirements",
    ["mobile_ux_ui_pattern_catalog", "mobile_security_baseline", "mobile_release_eas_strategy"],
    { required: false, answerType: "scope_bucket", riskIfUnknown: "high", clarificationPriority: "required_before_release" },
  ),
  questionByCategory(
    "performance",
    "Which flows or surfaces have performance risk on lower-end devices?",
    "performanceRequirements",
    ["mobile_performance_checklist", "mobile_testing_strategy", "dod_criteria"],
    { required: false },
  ),
  questionByCategory(
    "testing",
    "Which smoke flows and QA evidence should prove readiness?",
    "testingRequirements",
    ["mobile_testing_strategy", "dod_criteria", "pm_report"],
    { answerType: "acceptance_criteria", clarificationPriority: "required_before_testing" },
  ),
  questionByCategory(
    "release",
    "What release target and readiness gates should guide the roadmap?",
    "releaseRequirements",
    ["mobile_release_eas_strategy", "pm_report", "risk_blocker_model"],
    { answerType: "single_choice", clarificationPriority: "required_before_release" },
  ),
  questionByCategory(
    "constraints",
    "What technical or business constraints are already known?",
    "technicalConstraints",
    ["pm_report", "task_graph", "risk_blocker_model"],
    { required: false, answerType: "multi_choice", riskIfUnknown: "low", clarificationPriority: "optional_for_mvp" },
  ),
  questionByCategory(
    "unknowns",
    "Which unanswered requirements should block implementation or remain deferred?",
    "unresolvedQuestions",
    ["pm_report", "risk_blocker_model", "autopilot_handoff_context"],
    { required: false, answerType: "unknown_allowed", clarificationPriority: "optional_for_later" },
  ),
];

export const selectRequirementQuestionsByCategory = (
  questions: readonly MobileRequirementQuestion[],
  category: MobileRequirementCategory,
): readonly MobileRequirementQuestion[] => questions.filter((question) => question.category === category);

export const selectRequiredRequirementQuestions = (
  questions: readonly MobileRequirementQuestion[],
): readonly MobileRequirementQuestion[] => questions.filter((question) => question.required);

const unansweredRequiredQuestions = (
  questions: readonly MobileRequirementQuestion[],
  answers: readonly MobileRequirementAnswer[],
): readonly MobileRequirementQuestion[] => {
  const answeredQuestionIds = new Set(answers.filter((answer) => !answer.unresolved).map((answer) => answer.questionId));
  return selectRequiredRequirementQuestions(questions).filter((question) => !answeredQuestionIds.has(question.questionId));
};

const candidateFromAnswer = (
  answer: MobileRequirementAnswer,
  question: MobileRequirementQuestion | undefined,
): MobileRequirementCandidate => {
  const category = question?.category ?? "unknowns";
  const artifacts = question?.mapsToMobileArtifact ?? ["pm_report", "autopilot_handoff_context"];
  const title = question?.mapsToRequirement ?? answer.questionId;

  return createMobileRequirementCandidate({
    requirementId: `mobile_requirement:${answer.answerId}`,
    title,
    category,
    description: answer.answerText,
    priority: answer.priority,
    sourceAnswerRefs: [answer.answerId],
    targetMobileArtifacts: artifacts,
    riskLevel: question?.riskIfUnknown ?? "medium",
    requiredApprovals: category === "security_privacy" || category === "monetization" ? ["human_review"] : [],
    mvpRelevant: answer.priority === "must_have_mvp",
    betaRelevant: answer.priority === "should_have_beta" || answer.priority === "must_have_mvp",
    releaseRelevant: answer.priority === "release_ready",
    unresolved: answer.unresolved || answer.needsFollowUp,
  });
};

const sourceIntakeRef = (input: MobileRequirementsInput): string => {
  if (input.sourceIdeaIntakeRef) return input.sourceIdeaIntakeRef;
  const source = input.sourceIdeaIntake;
  if (!source) return "app_idea_intake:unspecified";
  return "interviewId" in source ? source.interviewId : source.outputId;
};

const sourceUnresolvedQuestions = (source: AppIdeaIntakeInterview | AppIdeaIntakeOutput | undefined): string[] => {
  if (!source) return [];
  return "output" in source ? [...source.unansweredQuestions] : [...source.unansweredQuestions];
};

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

const confidenceFromState = (
  answers: readonly MobileRequirementAnswer[],
  unansweredRequired: readonly MobileRequirementQuestion[],
  candidates: readonly MobileRequirementCandidate[],
): MobileRequirementsConfidence => {
  if (unansweredRequired.length >= 4) return "blocked_by_unknowns";
  if (unansweredRequired.length > 0) return "low";
  if (candidates.some((candidate) => candidate.unresolved) || answers.some((answer) => answer.needsFollowUp)) {
    return "medium";
  }
  return answers.length > 0 ? "high" : "low";
};

const groupCandidates = (
  candidates: readonly MobileRequirementCandidate[],
  categories: readonly MobileRequirementCategory[],
): readonly MobileRequirementCandidate[] => candidates.filter((candidate) => categories.includes(candidate.category));

export const mapRequirementsToMobileArtifacts = (
  candidates: readonly MobileRequirementCandidate[],
): MobileRequirementsArtifactMapping => {
  const refsFor = (target: MobileRequirementsArtifactTarget): string[] =>
    candidates
      .filter((candidate) => candidate.targetMobileArtifacts.includes(target))
      .map((candidate) => candidate.requirementId);

  return {
    mappingId: "mobile_requirements_artifact_mapping:default",
    sourceRequirementRefs: candidates.map((candidate) => candidate.requirementId),
    mobileAppFactoryStrategy: refsFor("mobile_app_factory_strategy"),
    reactNativeExpoArchitectureProfile: refsFor("react_native_expo_architecture_profile"),
    mobileUxUiPatternCatalog: refsFor("mobile_ux_ui_pattern_catalog"),
    mobileNavigationFlowModel: refsFor("mobile_navigation_flow_model"),
    mobileStateManagementStrategy: refsFor("mobile_state_management_strategy"),
    offlineCacheSyncStrategy: refsFor("offline_cache_sync_strategy"),
    mobileSecurityBaseline: refsFor("mobile_security_baseline"),
    mobilePerformanceChecklist: refsFor("mobile_performance_checklist"),
    mobileTestingStrategy: refsFor("mobile_testing_strategy"),
    mobileReleaseEasStrategy: refsFor("mobile_release_eas_strategy"),
    pmReport: refsFor("pm_report"),
    taskGraph: refsFor("task_graph"),
    dodCriteria: refsFor("dod_criteria"),
    riskBlockerModel: refsFor("risk_blocker_model"),
    autopilotHandoffContext: refsFor("autopilot_handoff_context"),
    safetyBoundaries: mappingSafety(),
  };
};

const buildRecommendation = (
  riskLevel: PMRiskTier,
  confidence: MobileRequirementsConfidence,
  requiredApprovals: readonly string[],
): MobileRequirementsRecommendation => {
  const humanReviewRequired = riskLevel === "high" || riskLevel === "critical" || confidence === "blocked_by_unknowns";
  const nextRecommendedArtifact: MobileRequirementsNextArtifact =
    confidence === "blocked_by_unknowns"
      ? "blocked_by_unknowns"
      : humanReviewRequired
        ? "human_review"
        : "mobile_feature_blueprint_generator_plan";

  return {
    recommendationId: "mobile_requirements_recommendation:133B",
    safeSummary:
      "Use requirements metadata as advisory context for a future feature blueprint plan after human review when needed.",
    nextStep: {
      nextStepId: "mobile_requirements_next_step:133B",
      title: "Plan the Mobile Feature Blueprint Generator",
      safeSummary:
        "Continue with Phase 133B to plan feature blueprint metadata before any implementation or generation work.",
      priority: riskLevel,
      decisionMode: "plan_only",
      riskSurfaces: ["automation", "scaffold", "security_policy", "release", "unknown"],
      recommendationOnly: true,
      noExecution: true,
    },
    nextRecommendedArtifact,
    humanReviewRequired,
    riskLevel,
    requiredApprovals: [...requiredApprovals],
    safetyBoundaries: recommendationSafety(),
  };
};

export const summarizeMobileRequirements = (
  interview: Pick<
    MobileRequirementsInterview,
    | "interviewId"
    | "sourceIdeaIntakeRef"
    | "questions"
    | "answers"
    | "requirementCandidates"
    | "mvpScope"
    | "betaScope"
    | "releaseScope"
    | "riskLevel"
    | "confidence"
    | "recommendation"
    | "safetyBoundaries"
  >,
): MobileRequirementsSummary => {
  const unansweredRequired = unansweredRequiredQuestions(interview.questions, interview.answers);

  return {
    interviewId: interview.interviewId,
    sourceIdeaIntakeRef: interview.sourceIdeaIntakeRef,
    questionCount: interview.questions.length,
    requiredQuestionCount: selectRequiredRequirementQuestions(interview.questions).length,
    answerCount: interview.answers.length,
    requirementCandidateCount: interview.requirementCandidates.length,
    mvpRequirementCount: interview.mvpScope.length,
    betaRequirementCount: interview.betaScope.length,
    releaseRequirementCount: interview.releaseScope.length,
    unresolvedRequiredQuestionCount: unansweredRequired.length,
    riskLevel: interview.riskLevel,
    confidence: interview.confidence,
    humanReviewRequired: interview.recommendation.humanReviewRequired,
    recommendedNextPhase: "Phase 133B",
    safeSummary:
      `${interview.requirementCandidates.length} requirement candidate(s), ${unansweredRequired.length} unanswered required question(s), ${interview.confidence} confidence.`,
    safetyBoundaries: interview.safetyBoundaries,
  };
};

export const createMobileRequirementsInterview = (
  input: MobileRequirementsInput,
): MobileRequirementsInterview => {
  const boundaries = safetyBoundaries();
  const questions = [...(input.questions ?? buildDefaultMobileRequirementQuestions())];
  const answers = [...(input.answers ?? [])];
  const unansweredRequired = unansweredRequiredQuestions(questions, answers);
  const answerCandidates = answers.map((answer) => {
    const question = questions.find((candidate) => candidate.questionId === answer.questionId);
    return answer.requirementCandidate ?? candidateFromAnswer(answer, question);
  });
  const requirementCandidates = [...(input.requirementCandidates ?? answerCandidates)];
  const sourceRef = sourceIntakeRef(input);
  const unresolvedQuestions = uniqueStrings([
    ...sourceUnresolvedQuestions(input.sourceIdeaIntake),
    ...unansweredRequired.map((question) => question.questionText),
    ...(input.unresolvedQuestions ?? []),
    ...requirementCandidates.filter((candidate) => candidate.unresolved).map((candidate) => candidate.title),
  ]);
  const riskLevel =
    input.riskLevel ??
    highestRisk([
      ...requirementCandidates.map((candidate) => candidate.riskLevel),
      ...questions.filter((question) => question.required).map((question) => question.riskIfUnknown),
    ]);
  const confidence = input.confidence ?? confidenceFromState(answers, unansweredRequired, requirementCandidates);
  const requiredApprovals = uniqueStrings([
    ...requirementCandidates.flatMap((candidate) => candidate.requiredApprovals),
    ...(riskLevel === "high" || riskLevel === "critical" ? ["human_review"] : []),
    ...(input.requiredApprovals ?? []),
  ]);
  const functionalRequirements =
    input.functionalRequirements ?? groupCandidates(requirementCandidates, ["functional"]);
  const nonFunctionalRequirements =
    input.nonFunctionalRequirements ??
    groupCandidates(requirementCandidates, [
      "security_privacy",
      "ux_accessibility",
      "performance",
      "testing",
      "release",
      "offline_sync",
      "monetization",
    ]);
  const userRoles = input.userRoles ?? groupCandidates(requirementCandidates, ["user_roles"]);
  const coreWorkflows = input.coreWorkflows ?? groupCandidates(requirementCandidates, ["core_workflows"]);
  const dataRequirements = input.dataRequirements ?? groupCandidates(requirementCandidates, ["data"]);
  const technicalConstraints =
    input.technicalConstraints ??
    requirementCandidates.filter(
      (candidate) =>
        candidate.category === "constraints" &&
        candidate.targetMobileArtifacts.some((target) =>
          ["react_native_expo_architecture_profile", "mobile_state_management_strategy", "offline_cache_sync_strategy"].includes(target),
        ),
    );
  const businessConstraints =
    input.businessConstraints ??
    requirementCandidates.filter(
      (candidate) =>
        candidate.category === "constraints" &&
        candidate.targetMobileArtifacts.some((target) => ["pm_report", "risk_blocker_model"].includes(target)),
    );
  const mvpScope = input.mvpScope ?? requirementCandidates.filter((candidate) => candidate.mvpRelevant);
  const betaScope = input.betaScope ?? requirementCandidates.filter((candidate) => candidate.betaRelevant);
  const releaseScope = input.releaseScope ?? requirementCandidates.filter((candidate) => candidate.releaseRelevant);
  const requirementScope = input.requirementScope ?? uniqueStrings([
    ...(mvpScope.length > 0 ? ["mvp"] : []),
    ...(betaScope.length > 0 ? ["beta"] : []),
    ...(releaseScope.length > 0 ? ["release"] : []),
    ...(unresolvedQuestions.length > 0 ? ["blocked_until_clarified"] : []),
  ]) as MobileRequirementScope[];
  const artifactMapping = mapRequirementsToMobileArtifacts(requirementCandidates);
  const recommendation = buildRecommendation(riskLevel, confidence, requiredApprovals);
  const nextRecommendedArtifact = recommendation.nextRecommendedArtifact;
  const output: MobileRequirementsOutput = {
    outputId: `mobile_requirements_output:${input.interviewId ?? "default"}`,
    sourceIdeaIntakeRef: sourceRef,
    requirementScope,
    functionalRequirements,
    nonFunctionalRequirements,
    userRoles,
    coreWorkflows,
    dataRequirements,
    technicalConstraints,
    businessConstraints,
    mvpScope,
    betaScope,
    releaseScope,
    unresolvedQuestions,
    confidence,
    riskLevel,
    requiredApprovals,
    nextRecommendedArtifact,
    artifactMapping,
    downstreamMetadataTargets: [
      "Mobile App Factory Strategy",
      "React Native / Expo Architecture Profile",
      "Mobile UX/UI Pattern Catalog",
      "Mobile Navigation Flow Model",
      "Mobile State Management Strategy",
      "Offline / Cache / Sync Strategy",
      "Mobile Security Baseline",
      "Mobile Performance Checklist",
      "Mobile Testing Strategy",
      "Mobile Release / EAS Strategy",
      "PM reports",
      "task graph",
      "DoD criteria",
      "risks/blockers",
      "Autopilot handoff context",
    ],
    safetyBoundaries: boundaries,
  };
  const baseInterview = {
    interviewId: input.interviewId ?? "mobile_requirements_interview:default",
    phaseRef: input.phaseRef ?? "Phase 132I",
    sourceIdeaIntakeRef: sourceRef,
    requirementScope,
    functionalRequirements,
    nonFunctionalRequirements,
    userRoles,
    coreWorkflows,
    dataRequirements,
    technicalConstraints,
    businessConstraints,
    mvpScope,
    betaScope,
    releaseScope,
    unresolvedQuestions,
    confidence,
    riskLevel,
    requiredApprovals,
    nextRecommendedArtifact,
    questions,
    answers,
    requirementCandidates,
    output,
    recommendation,
    safetyBoundaries: boundaries,
  };
  const summary = summarizeMobileRequirements(baseInterview);

  return {
    ...baseInterview,
    summary,
  };
};
