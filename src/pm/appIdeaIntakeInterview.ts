import type {
  MobileAppFactoryAppType,
  MobileAppFactoryIntakeInput,
  MobilePlatformPriority,
  MobileReleaseTarget,
} from "./mobileAppFactoryStrategy.js";
import { classifyMobileAppType } from "./mobileAppFactoryStrategy.js";
import type { PMEvidenceReference, PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type AppIdeaIntakeQuestionCategory =
  | "problem"
  | "users"
  | "app_type"
  | "core_flows"
  | "features"
  | "platform"
  | "auth"
  | "data"
  | "offline"
  | "monetization"
  | "safety_privacy"
  | "release"
  | "constraints"
  | "unknowns";

export type AppIdeaIntakeAnswerType =
  | "free_text"
  | "single_choice"
  | "multi_choice"
  | "yes_no"
  | "ranked_list"
  | "risk_flag"
  | "unknown_allowed";

export type AppIdeaIntakeConfidence = "high" | "medium" | "low" | "blocked_by_unknowns";

export type AppIdeaClarificationPriority =
  | "required_before_factory"
  | "required_before_architecture"
  | "required_before_security"
  | "required_before_release"
  | "optional_for_mvp"
  | "optional_for_later";

export type AppIdeaNextRecommendedArtifact =
  | "mobile_factory_intake"
  | "requirements_interview"
  | "human_review"
  | "blocked_by_unknowns";

export interface AppIdeaIntakeSafetyBoundaries {
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

export interface AppIdeaIntakeQuestion {
  questionId: string;
  category: AppIdeaIntakeQuestionCategory;
  questionText: string;
  required: boolean;
  answerType: AppIdeaIntakeAnswerType;
  mapsToField: string;
  followUpTriggers: readonly string[];
  riskIfUnknown: PMRiskTier;
  examples: readonly string[];
  clarificationPriority: AppIdeaClarificationPriority;
  safetyBoundaries: Pick<
    AppIdeaIntakeSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noChatAutomation" | "noMessageSending"
  >;
}

export interface AppIdeaIntakeAnswer {
  answerId: string;
  questionId: string;
  answerText: string;
  normalizedValue: string | readonly string[] | boolean | undefined;
  confidence: AppIdeaIntakeConfidence;
  unresolved: boolean;
  needsFollowUp: boolean;
  evidenceRefs: readonly PMEvidenceReference[];
  safetyBoundaries: Pick<
    AppIdeaIntakeSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noChatAutomation" | "noMessageSending"
  >;
}

export interface AppIdeaIntakeOutput {
  outputId: string;
  appTypeHypothesis: MobileAppFactoryAppType;
  targetUsers: readonly string[];
  problemStatement: string;
  desiredOutcome: string;
  coreFlows: readonly string[];
  featureCandidates: readonly string[];
  constraints: readonly string[];
  assumptions: readonly string[];
  unansweredQuestions: readonly string[];
  confidence: AppIdeaIntakeConfidence;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  nextRecommendedArtifact: AppIdeaNextRecommendedArtifact;
  downstreamMetadataTargets: readonly string[];
  mobileFactoryMapping: MobileAppFactoryIntakeInput;
  safetyBoundaries: AppIdeaIntakeSafetyBoundaries;
}

export interface AppIdeaIntakeRecommendation {
  recommendationId: string;
  safeSummary: string;
  nextStep: PMRecommendedNextStep;
  nextRecommendedArtifact: AppIdeaNextRecommendedArtifact;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  safetyBoundaries: Pick<
    AppIdeaIntakeSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noChatAutomation" | "noCodexExecution" | "noAppGeneration"
  >;
}

export interface AppIdeaIntakeSummary {
  interviewId: string;
  questionCount: number;
  requiredQuestionCount: number;
  answerCount: number;
  unansweredRequiredQuestionCount: number;
  appTypeHypothesis: MobileAppFactoryAppType;
  riskLevel: PMRiskTier;
  confidence: AppIdeaIntakeConfidence;
  nextRecommendedArtifact: AppIdeaNextRecommendedArtifact;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: AppIdeaIntakeSafetyBoundaries;
}

export interface AppIdeaIntakeInterview {
  interviewId: string;
  phaseRef: ProjectPhaseRef;
  ideaText: string;
  appTypeHypothesis: MobileAppFactoryAppType;
  targetUsers: readonly string[];
  problemStatement: string;
  desiredOutcome: string;
  coreFlows: readonly string[];
  featureCandidates: readonly string[];
  constraints: readonly string[];
  assumptions: readonly string[];
  unansweredQuestions: readonly string[];
  confidence: AppIdeaIntakeConfidence;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  nextRecommendedArtifact: AppIdeaNextRecommendedArtifact;
  questions: readonly AppIdeaIntakeQuestion[];
  answers: readonly AppIdeaIntakeAnswer[];
  output: AppIdeaIntakeOutput;
  recommendation: AppIdeaIntakeRecommendation;
  summary: AppIdeaIntakeSummary;
  safetyBoundaries: AppIdeaIntakeSafetyBoundaries;
}

export interface AppIdeaIntakeInput {
  interviewId?: string;
  phaseRef?: ProjectPhaseRef;
  ideaText: string;
  appTypeHypothesis?: MobileAppFactoryAppType;
  targetUsers?: readonly string[];
  problemStatement?: string;
  desiredOutcome?: string;
  coreFlows?: readonly string[];
  featureCandidates?: readonly string[];
  constraints?: readonly string[];
  assumptions?: readonly string[];
  questions?: readonly AppIdeaIntakeQuestion[];
  answers?: readonly AppIdeaIntakeAnswer[];
  platformPriority?: MobilePlatformPriority;
  offlineNeeds?: readonly string[];
  authNeeds?: readonly string[];
  monetizationNeeds?: readonly string[];
  safetyNeeds?: readonly string[];
  releaseTarget?: MobileReleaseTarget;
  dataModelSummary?: string;
  evidenceRefs?: readonly PMEvidenceReference[];
  requiredApprovals?: readonly string[];
}

export const appIdeaIntakeQuestionCategories: readonly AppIdeaIntakeQuestionCategory[] = [
  "problem",
  "users",
  "app_type",
  "core_flows",
  "features",
  "platform",
  "auth",
  "data",
  "offline",
  "monetization",
  "safety_privacy",
  "release",
  "constraints",
  "unknowns",
];

const safetyBoundaries = (): AppIdeaIntakeSafetyBoundaries => ({
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

const questionSafety = (): AppIdeaIntakeQuestion["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noChatAutomation: true,
  noMessageSending: true,
});

const recommendationSafety = (): AppIdeaIntakeRecommendation["safetyBoundaries"] => ({
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

const includesAny = (value: string, signals: readonly string[]): boolean =>
  signals.some((signal) => value.includes(signal));

const inferPlatformPriority = (
  text: string,
  explicitPriority: MobilePlatformPriority | undefined,
): MobilePlatformPriority => {
  if (explicitPriority) return explicitPriority;
  const value = text.toLowerCase();
  if (value.includes("ios") && !value.includes("android")) return "ios_first";
  if (value.includes("android") && !value.includes("ios")) return "android_first";
  if (value.includes("tablet") || value.includes("ipad")) return "tablet_first";
  if (value.includes("phased")) return "phased";
  if (value.includes("mobile") || value.includes("app")) return "cross_platform";
  return "unknown";
};

const inferReleaseTarget = (text: string, explicitTarget: MobileReleaseTarget | undefined): MobileReleaseTarget => {
  if (explicitTarget) return explicitTarget;
  const value = text.toLowerCase();
  if (value.includes("store")) return "store_candidate";
  if (value.includes("beta")) return "beta";
  if (value.includes("pilot")) return "pilot";
  if (value.includes("mvp")) return "mvp";
  if (value.includes("prototype")) return "prototype";
  return "prototype";
};

const inferRiskLevel = (
  input: AppIdeaIntakeInput,
  unansweredRequired: readonly AppIdeaIntakeQuestion[],
): PMRiskTier => {
  const text = [
    input.ideaText,
    ...(input.safetyNeeds ?? []),
    ...(input.authNeeds ?? []),
    ...(input.monetizationNeeds ?? []),
    ...(input.offlineNeeds ?? []),
  ]
    .join(" ")
    .toLowerCase();

  if (
    includesAny(text, [
      "medical",
      "health",
      "minor",
      "child",
      "payment",
      "bank",
      "financial",
      "public safety",
      "sensitive",
    ])
  ) {
    return "high";
  }

  if (unansweredRequired.length >= 3) return "medium";
  if ((input.authNeeds?.length ?? 0) > 0 || (input.offlineNeeds?.length ?? 0) > 0) return "medium";
  return "low";
};

const confidenceFromAnswers = (
  answers: readonly AppIdeaIntakeAnswer[],
  unansweredRequired: readonly AppIdeaIntakeQuestion[],
): AppIdeaIntakeConfidence => {
  if (unansweredRequired.length >= 4) return "blocked_by_unknowns";
  if (unansweredRequired.length > 0) return "low";
  if (answers.some((answer) => answer.confidence === "low" || answer.needsFollowUp)) return "medium";
  return answers.length > 0 ? "high" : "low";
};

const questionByCategory = (
  category: AppIdeaIntakeQuestionCategory,
  questionText: string,
  mapsToField: string,
  options?: Partial<AppIdeaIntakeQuestion>,
): AppIdeaIntakeQuestion =>
  createAppIdeaIntakeQuestion({
    questionId: `app_idea_question:${category}:${mapsToField}`,
    category,
    questionText,
    required: options?.required ?? true,
    answerType: options?.answerType ?? "free_text",
    mapsToField,
    followUpTriggers: options?.followUpTriggers ?? [],
    riskIfUnknown: options?.riskIfUnknown ?? "medium",
    examples: options?.examples ?? [],
    clarificationPriority: options?.clarificationPriority ?? "required_before_factory",
  });

export const createAppIdeaIntakeQuestion = (
  input: Omit<AppIdeaIntakeQuestion, "safetyBoundaries"> & {
    safetyBoundaries?: AppIdeaIntakeQuestion["safetyBoundaries"];
  },
): AppIdeaIntakeQuestion => ({
  questionId: input.questionId,
  category: input.category,
  questionText: input.questionText,
  required: input.required,
  answerType: input.answerType,
  mapsToField: input.mapsToField,
  followUpTriggers: uniqueStrings(input.followUpTriggers),
  riskIfUnknown: input.riskIfUnknown,
  examples: uniqueStrings(input.examples),
  clarificationPriority: input.clarificationPriority,
  safetyBoundaries: input.safetyBoundaries ?? questionSafety(),
});

export const createAppIdeaIntakeAnswer = (
  input: Omit<AppIdeaIntakeAnswer, "normalizedValue" | "safetyBoundaries"> & {
    normalizedValue?: AppIdeaIntakeAnswer["normalizedValue"];
    safetyBoundaries?: AppIdeaIntakeAnswer["safetyBoundaries"];
  },
): AppIdeaIntakeAnswer => ({
  answerId: input.answerId,
  questionId: input.questionId,
  answerText: input.answerText,
  normalizedValue: input.normalizedValue ?? splitAnswer(input.answerText),
  confidence: input.confidence,
  unresolved: input.unresolved,
  needsFollowUp: input.needsFollowUp,
  evidenceRefs: [...input.evidenceRefs],
  safetyBoundaries: input.safetyBoundaries ?? questionSafety(),
});

export const buildDefaultAppIdeaIntakeQuestions = (): readonly AppIdeaIntakeQuestion[] => [
  questionByCategory("problem", "What problem should the mobile app solve first?", "problemStatement", {
    examples: ["Reduce missed appointments", "Help field teams report work faster"],
  }),
  questionByCategory("users", "Who is the primary user group?", "targetUsers", {
    answerType: "multi_choice",
    examples: ["Customers", "Operations team", "Students", "Creators"],
  }),
  questionByCategory("app_type", "What type of mobile app does the idea most resemble?", "appTypeHypothesis", {
    answerType: "single_choice",
    examples: ["Marketplace", "Booking", "Education", "Dashboard companion"],
  }),
  questionByCategory("core_flows", "Which user journeys must work in the MVP?", "coreFlows", {
    answerType: "multi_choice",
    examples: ["Onboard", "Create request", "Track progress", "Review result"],
  }),
  questionByCategory("features", "Which features are must-have and which can wait?", "featureCandidates", {
    answerType: "ranked_list",
    examples: ["Search", "Profile", "Notifications", "Saved items"],
  }),
  questionByCategory("platform", "Which platforms matter first?", "platformPriority", {
    answerType: "single_choice",
    examples: ["Cross-platform", "iOS first", "Android first", "Tablet first"],
  }),
  questionByCategory("auth", "Does the app need accounts, roles, or sessions?", "authNeeds", {
    answerType: "yes_no",
    riskIfUnknown: "medium",
    clarificationPriority: "required_before_security",
  }),
  questionByCategory("data", "What data does the app create, read, or manage?", "dataModelSummary", {
    examples: ["Bookings, profiles, messages", "Tasks, photos, status notes"],
  }),
  questionByCategory("offline", "Should any flows work with unreliable connectivity?", "offlineNeeds", {
    answerType: "yes_no",
    required: false,
    riskIfUnknown: "medium",
  }),
  questionByCategory("monetization", "Will the app use paid access, subscriptions, or marketplace fees?", "monetizationNeeds", {
    answerType: "yes_no",
    required: false,
    riskIfUnknown: "high",
    clarificationPriority: "required_before_release",
  }),
  questionByCategory("safety_privacy", "What privacy, safety, abuse, or reporting concerns should be planned?", "safetyNeeds", {
    answerType: "risk_flag",
    riskIfUnknown: "high",
    clarificationPriority: "required_before_security",
  }),
  questionByCategory("release", "What release ambition should guide the roadmap?", "releaseTarget", {
    answerType: "single_choice",
    examples: ["Prototype", "MVP", "Beta", "Pilot", "Store candidate"],
  }),
  questionByCategory("constraints", "What constraints, dependencies, or deadlines are already known?", "constraints", {
    answerType: "multi_choice",
    required: false,
    riskIfUnknown: "low",
    clarificationPriority: "optional_for_mvp",
  }),
  questionByCategory("unknowns", "What is still unknown and should be clarified before implementation?", "unansweredQuestions", {
    answerType: "unknown_allowed",
    required: false,
    riskIfUnknown: "medium",
    clarificationPriority: "optional_for_later",
  }),
];

export const selectQuestionsByCategory = (
  questions: readonly AppIdeaIntakeQuestion[],
  category: AppIdeaIntakeQuestionCategory,
): readonly AppIdeaIntakeQuestion[] => questions.filter((question) => question.category === category);

export const selectRequiredQuestions = (
  questions: readonly AppIdeaIntakeQuestion[],
): readonly AppIdeaIntakeQuestion[] => questions.filter((question) => question.required);

const answerTextForField = (
  questions: readonly AppIdeaIntakeQuestion[],
  answers: readonly AppIdeaIntakeAnswer[],
  mapsToField: string,
): string | undefined => {
  const question = questions.find((candidate) => candidate.mapsToField === mapsToField);
  if (!question) return undefined;
  return answers.find((answer) => answer.questionId === question.questionId)?.answerText;
};

const answerValuesForField = (
  questions: readonly AppIdeaIntakeQuestion[],
  answers: readonly AppIdeaIntakeAnswer[],
  mapsToField: string,
): string[] => {
  const value = answerTextForField(questions, answers, mapsToField);
  return value ? splitAnswer(value) : [];
};

const unansweredRequiredQuestions = (
  questions: readonly AppIdeaIntakeQuestion[],
  answers: readonly AppIdeaIntakeAnswer[],
): readonly AppIdeaIntakeQuestion[] => {
  const answeredQuestionIds = new Set(answers.filter((answer) => !answer.unresolved).map((answer) => answer.questionId));
  return selectRequiredQuestions(questions).filter((question) => !answeredQuestionIds.has(question.questionId));
};

export const mapIntakeToMobileFactoryInput = (
  output: Pick<
    AppIdeaIntakeOutput,
    | "outputId"
    | "appTypeHypothesis"
    | "targetUsers"
    | "problemStatement"
    | "desiredOutcome"
    | "coreFlows"
    | "featureCandidates"
    | "constraints"
    | "assumptions"
    | "riskLevel"
    | "requiredApprovals"
  > & {
    ideaText?: string;
    platformPriority?: MobilePlatformPriority;
    offlineNeeds?: readonly string[];
    authNeeds?: readonly string[];
    monetizationNeeds?: readonly string[];
    safetyNeeds?: readonly string[];
    releaseTarget?: MobileReleaseTarget;
    dataModelSummary?: string;
    evidenceRefs?: readonly PMEvidenceReference[];
  },
): MobileAppFactoryIntakeInput => ({
  intakeId: `mobile_factory_from_intake:${output.outputId}`,
  appIdea: output.ideaText ?? output.problemStatement,
  originalUserGoal: output.ideaText ?? output.problemStatement,
  safeSummary: `Advisory intake mapped to Mobile App Factory for ${output.appTypeHypothesis}.`,
  targetUsers: [...output.targetUsers],
  businessGoal: output.desiredOutcome,
  platformPriority: output.platformPriority ?? "unknown",
  supportedAppType: output.appTypeHypothesis,
  coreFlows: [...output.coreFlows],
  dataModelSummary: output.dataModelSummary ?? "intake_data_model_pending",
  offlineNeeds: uniqueStrings(output.offlineNeeds),
  authNeeds: uniqueStrings(output.authNeeds),
  monetizationNeeds: uniqueStrings(output.monetizationNeeds),
  safetyNeeds: uniqueStrings(output.safetyNeeds),
  releaseTarget: output.releaseTarget ?? "prototype",
  riskLevel: output.riskLevel,
  requiredApprovals: [...output.requiredApprovals],
  evidenceRefs: [...(output.evidenceRefs ?? [])],
  assumptions: [...output.assumptions],
  exclusions: uniqueStrings([
    "No conversational automation is performed.",
    "No outbound messaging is performed.",
    "No mobile app is generated.",
    "No mobile tooling is invoked.",
    ...output.constraints.map((constraint) => `constraint:${constraint}`),
    ...output.featureCandidates.map((feature) => `feature_candidate:${feature}`),
  ]),
});

const buildRecommendation = (
  riskLevel: PMRiskTier,
  nextRecommendedArtifact: AppIdeaNextRecommendedArtifact,
  requiredApprovals: readonly string[],
): AppIdeaIntakeRecommendation => ({
  recommendationId: "app_idea_intake_recommendation:132B",
  safeSummary:
    "Use the structured intake as advisory context for a requirements interview before any automation or build work.",
  nextStep: {
    nextStepId: "app_idea_intake_next_step:132B",
    title: "Plan the Mobile Requirements Interview",
    safeSummary:
      "Continue with Phase 132B to refine requirements from intake metadata before implementation planning.",
    priority: riskLevel,
    decisionMode: "plan_only",
    riskSurfaces: ["automation", "scaffold", "security_policy", "release", "unknown"],
    recommendationOnly: true,
    noExecution: true,
  },
  nextRecommendedArtifact,
  riskLevel,
  requiredApprovals: [...requiredApprovals],
  safetyBoundaries: recommendationSafety(),
});

export const summarizeAppIdeaIntake = (
  interview: Pick<
    AppIdeaIntakeInterview,
    | "interviewId"
    | "questions"
    | "answers"
    | "appTypeHypothesis"
    | "riskLevel"
    | "confidence"
    | "nextRecommendedArtifact"
    | "safetyBoundaries"
  >,
): AppIdeaIntakeSummary => {
  const requiredQuestions = selectRequiredQuestions(interview.questions);
  const unansweredRequired = unansweredRequiredQuestions(interview.questions, interview.answers);

  return {
    interviewId: interview.interviewId,
    questionCount: interview.questions.length,
    requiredQuestionCount: requiredQuestions.length,
    answerCount: interview.answers.length,
    unansweredRequiredQuestionCount: unansweredRequired.length,
    appTypeHypothesis: interview.appTypeHypothesis,
    riskLevel: interview.riskLevel,
    confidence: interview.confidence,
    nextRecommendedArtifact: interview.nextRecommendedArtifact,
    recommendedNextPhase: "Phase 132B",
    safeSummary:
      `${interview.appTypeHypothesis} intake has ${unansweredRequired.length} unanswered required question(s) and ${interview.confidence} confidence.`,
    safetyBoundaries: interview.safetyBoundaries,
  };
};

export const createAppIdeaIntakeInterview = (
  input: AppIdeaIntakeInput,
): AppIdeaIntakeInterview => {
  const boundaries = safetyBoundaries();
  const questions = [...(input.questions ?? buildDefaultAppIdeaIntakeQuestions())];
  const answers = [...(input.answers ?? [])];
  const unansweredRequired = unansweredRequiredQuestions(questions, answers);
  const appTypeHypothesis = input.appTypeHypothesis ?? classifyMobileAppType(input.ideaText);
  const targetUsers = uniqueStrings(input.targetUsers ?? answerValuesForField(questions, answers, "targetUsers"));
  const coreFlows = uniqueStrings(input.coreFlows ?? answerValuesForField(questions, answers, "coreFlows"));
  const featureCandidates = uniqueStrings(
    input.featureCandidates ?? answerValuesForField(questions, answers, "featureCandidates"),
  );
  const constraints = uniqueStrings(input.constraints ?? answerValuesForField(questions, answers, "constraints"));
  const assumptions = uniqueStrings([
    "This interview is metadata-only and advisory.",
    "Any build, runtime, provider, or mobile tooling action remains future-gated.",
    ...(input.assumptions ?? []),
  ]);
  const problemStatement =
    input.problemStatement ?? answerTextForField(questions, answers, "problemStatement") ?? input.ideaText;
  const desiredOutcome =
    input.desiredOutcome ??
    "Clarify whether the app idea is ready for Mobile App Factory strategy and requirements planning.";
  const unansweredQuestions = uniqueStrings([
    ...unansweredRequired.map((question) => question.questionText),
    ...answerValuesForField(questions, answers, "unansweredQuestions"),
  ]);
  const riskLevel = inferRiskLevel(input, unansweredRequired);
  const confidence = confidenceFromAnswers(answers, unansweredRequired);
  const requiredApprovals = uniqueStrings([
    ...(riskLevel === "high" || riskLevel === "critical" ? ["product_security_review"] : []),
    ...(input.requiredApprovals ?? []),
  ]);
  const nextRecommendedArtifact: AppIdeaNextRecommendedArtifact =
    confidence === "blocked_by_unknowns"
      ? "blocked_by_unknowns"
      : riskLevel === "high" || riskLevel === "critical"
        ? "human_review"
        : "mobile_factory_intake";
  const outputId = `app_idea_intake_output:${input.interviewId ?? "default"}`;
  const platformPriority = inferPlatformPriority(input.ideaText, input.platformPriority);
  const releaseTarget = inferReleaseTarget(input.ideaText, input.releaseTarget);
  const dataModelSummary = input.dataModelSummary ?? answerTextForField(questions, answers, "dataModelSummary");
  const mappingInput: Parameters<typeof mapIntakeToMobileFactoryInput>[0] = {
    outputId,
    ideaText: input.ideaText,
    appTypeHypothesis,
    targetUsers,
    problemStatement,
    desiredOutcome,
    coreFlows,
    featureCandidates,
    constraints,
    assumptions,
    riskLevel,
    requiredApprovals,
    platformPriority,
    offlineNeeds: input.offlineNeeds ?? answerValuesForField(questions, answers, "offlineNeeds"),
    authNeeds: input.authNeeds ?? answerValuesForField(questions, answers, "authNeeds"),
    monetizationNeeds: input.monetizationNeeds ?? answerValuesForField(questions, answers, "monetizationNeeds"),
    safetyNeeds: input.safetyNeeds ?? answerValuesForField(questions, answers, "safetyNeeds"),
    releaseTarget,
  };
  if (dataModelSummary !== undefined) {
    mappingInput.dataModelSummary = dataModelSummary;
  }
  if (input.evidenceRefs !== undefined) {
    mappingInput.evidenceRefs = input.evidenceRefs;
  }
  const mobileFactoryMapping = mapIntakeToMobileFactoryInput(mappingInput);
  const output: AppIdeaIntakeOutput = {
    outputId,
    appTypeHypothesis,
    targetUsers,
    problemStatement,
    desiredOutcome,
    coreFlows,
    featureCandidates,
    constraints,
    assumptions,
    unansweredQuestions,
    confidence,
    riskLevel,
    requiredApprovals,
    nextRecommendedArtifact,
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
    ],
    mobileFactoryMapping,
    safetyBoundaries: boundaries,
  };
  const recommendation = buildRecommendation(riskLevel, nextRecommendedArtifact, requiredApprovals);
  const baseInterview = {
    interviewId: input.interviewId ?? "app_idea_intake:default",
    phaseRef: input.phaseRef ?? "Phase 131I",
    ideaText: input.ideaText,
    appTypeHypothesis,
    targetUsers,
    problemStatement,
    desiredOutcome,
    coreFlows,
    featureCandidates,
    constraints,
    assumptions,
    unansweredQuestions,
    confidence,
    riskLevel,
    requiredApprovals,
    nextRecommendedArtifact,
    questions,
    answers,
    output,
    recommendation,
    safetyBoundaries: boundaries,
  };
  const summary = summarizeAppIdeaIntake(baseInterview);

  return {
    ...baseInterview,
    summary,
  };
};
