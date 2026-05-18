import {
  buildDefaultMobileRequirementQuestions,
  createMobileRequirementAnswer,
  createMobileRequirementCandidate,
  createMobileRequirementQuestion,
  createMobileRequirementsInterview,
  mapRequirementsToMobileArtifacts,
  selectRequiredRequirementQuestions,
  selectRequirementQuestionsByCategory,
  summarizeMobileRequirements,
} from "../src/pm/mobileRequirementsInterview.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const question = createMobileRequirementQuestion({
  questionId: "mobile_requirement_question:test:functional",
  category: "functional",
  questionText: "Which MVP capabilities are required?",
  required: true,
  answerType: "ranked_list",
  mapsToRequirement: "functionalRequirements",
  mapsToMobileArtifact: ["mobile_app_factory_strategy", "task_graph", "dod_criteria"],
  followUpTriggers: ["unclear_mvp_scope"],
  riskIfUnknown: "medium",
  examples: ["Create booking", "Receive reminder"],
  clarificationPriority: "required_before_factory_mapping",
});

assert(question.safetyBoundaries.metadataOnly === true, "question must be metadata-only");
assert(question.safetyBoundaries.noChatAutomation === true, "question must not automate chat");

const candidate = createMobileRequirementCandidate({
  requirementId: "mobile_requirement:test:booking",
  title: "Clinic booking MVP",
  category: "functional",
  description: "Users can create and reschedule appointments.",
  priority: "must_have_mvp",
  sourceAnswerRefs: ["mobile_requirement_answer:test:functional"],
  targetMobileArtifacts: ["mobile_app_factory_strategy", "mobile_navigation_flow_model", "mobile_testing_strategy"],
  riskLevel: "medium",
  requiredApprovals: [],
  mvpRelevant: true,
  betaRelevant: true,
  releaseRelevant: false,
  unresolved: false,
});

assert(candidate.safetyBoundaries.noAppGeneration === true, "candidate must not generate apps");
assert(candidate.safetyBoundaries.noRuntimeExecution === true, "candidate must not run runtime behavior");

const answer = createMobileRequirementAnswer({
  answerId: "mobile_requirement_answer:test:functional",
  questionId: question.questionId,
  answerText: "Create booking, reschedule booking",
  requirementCandidate: candidate,
  priority: "must_have_mvp",
  confidence: "high",
  unresolved: false,
  needsFollowUp: false,
  evidenceRefs: [],
});

assert(answer.normalizedValue !== undefined, "answer should normalize text");
assert(answer.safetyBoundaries.noMessageSending === true, "answer must not perform outbound messaging");

const defaultQuestions = buildDefaultMobileRequirementQuestions();
const requiredQuestions = selectRequiredRequirementQuestions(defaultQuestions);
const functionalQuestions = selectRequirementQuestionsByCategory(defaultQuestions, "functional");

assert(defaultQuestions.length >= 14, "default question set should cover requirement categories");
assert(requiredQuestions.length > 0, "default question set should include required questions");
assert(functionalQuestions.length === 1, "category filtering should find functional question");

const interview = createMobileRequirementsInterview({
  interviewId: "mobile_requirements_interview:test",
  sourceIdeaIntakeRef: "app_idea_intake:test",
  questions: [question],
  answers: [answer],
  requirementCandidates: [candidate],
});

assert(interview.safetyBoundaries.sourceOnly === true, "interview must be source-only");
assert(interview.safetyBoundaries.metadataOnly === true, "interview must be metadata-only");
assert(interview.safetyBoundaries.noChatAutomation === true, "interview must not automate chat");
assert(interview.safetyBoundaries.noMessageSending === true, "interview must not perform outbound messaging");
assert(interview.safetyBoundaries.noWhatsAppExecution === true, "interview must not use WhatsApp");
assert(interview.safetyBoundaries.noCodexExecution === true, "interview must not invoke Codex");
assert(interview.safetyBoundaries.noAppGeneration === true, "interview must not generate apps");
assert(interview.safetyBoundaries.noExpoEasExecution === true, "interview must not run mobile tooling");
assert(interview.output.artifactMapping.mobileAppFactoryStrategy.length === 1, "mapping should feed Mobile App Factory");
assert(interview.output.artifactMapping.mobileNavigationFlowModel.length === 1, "mapping should feed navigation");
assert(interview.output.artifactMapping.mobileTestingStrategy.length === 1, "mapping should feed testing");

const summary = summarizeMobileRequirements(interview);

assert(summary.questionCount === 1, "summary should count questions");
assert(summary.answerCount === 1, "summary should count answers");
assert(summary.requirementCandidateCount === 1, "summary should count requirement candidates");
assert(summary.mvpRequirementCount === 1, "summary should count MVP requirements");
assert(summary.recommendedNextPhase === "Phase 133B", "summary should point to Phase 133B");

const mapping = mapRequirementsToMobileArtifacts([candidate]);

assert(mapping["sourceRequirementRefs"].length === 1, "artifact mapping should track source requirements");
assert(mapping.mobileAppFactoryStrategy.length === 1, "artifact mapping should include factory refs");
assert(mapping.safetyBoundaries.noCodexExecution === true, "mapping must not invoke Codex");
assert(mapping.safetyBoundaries.noRuntimeExecution === true, "mapping must not run runtime behavior");

console.log("Mobile Requirements Interview smoke tests passed");
console.log(`Questions: ${summary.questionCount}`);
console.log(`Requirements: ${summary.requirementCandidateCount}`);
console.log(`MVP requirements: ${summary.mvpRequirementCount}`);
