import {
  buildDefaultAppIdeaIntakeQuestions,
  createAppIdeaIntakeAnswer,
  createAppIdeaIntakeInterview,
  createAppIdeaIntakeQuestion,
  mapIntakeToMobileFactoryInput,
  selectQuestionsByCategory,
  selectRequiredQuestions,
  summarizeAppIdeaIntake,
} from "../src/pm/appIdeaIntakeInterview.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const customQuestion = createAppIdeaIntakeQuestion({
  questionId: "app_idea_question:test:problem",
  category: "problem",
  questionText: "What should the app improve first?",
  required: true,
  answerType: "free_text",
  mapsToField: "problemStatement",
  followUpTriggers: ["unclear_problem"],
  riskIfUnknown: "medium",
  examples: ["Reduce manual scheduling"],
  clarificationPriority: "required_before_factory",
});

assert(customQuestion.safetyBoundaries.metadataOnly === true, "question must be metadata-only");
assert(customQuestion.safetyBoundaries.noChatAutomation === true, "question must not automate chat");

const answer = createAppIdeaIntakeAnswer({
  answerId: "app_idea_answer:test:problem",
  questionId: customQuestion.questionId,
  answerText: "Help small clinics manage appointments",
  confidence: "high",
  unresolved: false,
  needsFollowUp: false,
  evidenceRefs: [],
});

assert(answer.normalizedValue !== undefined, "answer should normalize text");
assert(answer.safetyBoundaries.noMessageSending === true, "answer must not perform outbound messaging");

const defaultQuestions = buildDefaultAppIdeaIntakeQuestions();
const requiredQuestions = selectRequiredQuestions(defaultQuestions);
const problemQuestions = selectQuestionsByCategory(defaultQuestions, "problem");

assert(defaultQuestions.length >= 14, "default question set should cover all categories");
assert(requiredQuestions.length > 0, "default question set should include required questions");
assert(problemQuestions.length === 1, "category filtering should find the problem question");

const answers = [
  createAppIdeaIntakeAnswer({
    answerId: "app_idea_answer:test:users",
    questionId: "app_idea_question:users:targetUsers",
    answerText: "clinic admins, patients",
    confidence: "high",
    unresolved: false,
    needsFollowUp: false,
    evidenceRefs: [],
  }),
  createAppIdeaIntakeAnswer({
    answerId: "app_idea_answer:test:flows",
    questionId: "app_idea_question:core_flows:coreFlows",
    answerText: "book appointment, reschedule appointment, receive reminder",
    confidence: "medium",
    unresolved: false,
    needsFollowUp: false,
    evidenceRefs: [],
  }),
];

const interview = createAppIdeaIntakeInterview({
  interviewId: "app_idea_intake:test",
  ideaText: "A mobile booking app for small clinics with patient reminders",
  answers,
  authNeeds: ["patient account"],
  safetyNeeds: ["privacy review"],
  releaseTarget: "prototype",
});

assert(interview.safetyBoundaries.sourceOnly === true, "interview must be source-only");
assert(interview.safetyBoundaries.metadataOnly === true, "interview must be metadata-only");
assert(interview.safetyBoundaries.noChatAutomation === true, "interview must not automate chat");
assert(interview.safetyBoundaries.noMessageSending === true, "interview must not perform outbound messaging");
assert(interview.safetyBoundaries.noCodexExecution === true, "interview must not invoke Codex");
assert(interview.safetyBoundaries.noAppGeneration === true, "interview must not generate apps");
assert(interview.safetyBoundaries.noExpoEasExecution === true, "interview must not run mobile tooling");
assert(interview.output.downstreamMetadataTargets.includes("Mobile App Factory Strategy"), "output should target factory metadata");
assert(interview.output.mobileFactoryMapping.supportedAppType === "service_booking_app", "mapping should classify booking app");
assert(
  interview.output.mobileFactoryMapping.exclusions?.includes("No mobile app is generated.") === true,
  "mapping must exclude app generation",
);

const summary = summarizeAppIdeaIntake(interview);

assert(summary.questionCount === defaultQuestions.length, "summary should count questions");
assert(summary.answerCount === answers.length, "summary should count answers");
assert(summary.recommendedNextPhase === "Phase 132B", "summary should point to Phase 132B");

const mappedFactoryInput = mapIntakeToMobileFactoryInput({
  outputId: "app_idea_intake_output:test",
  ideaText: "Clinic booking app",
  appTypeHypothesis: "service_booking_app",
  targetUsers: ["clinic admins"],
  problemStatement: "Scheduling is manual",
  desiredOutcome: "Reduce scheduling work",
  coreFlows: ["create booking"],
  featureCandidates: ["reminders"],
  constraints: ["privacy review"],
  assumptions: ["metadata-only intake"],
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
});

assert(mappedFactoryInput.supportedAppType === "service_booking_app", "factory mapping should keep app type");
assert(mappedFactoryInput.exclusions?.includes("No outbound messaging is performed.") === true, "mapping should stay passive");
assert(mappedFactoryInput.exclusions?.includes("No mobile tooling is invoked.") === true, "mapping should not invoke mobile tooling");

console.log("App Idea Intake Interview smoke tests passed");
console.log(`Questions: ${summary.questionCount}`);
console.log(`Required questions: ${summary.requiredQuestionCount}`);
console.log(`Answers: ${summary.answerCount}`);
