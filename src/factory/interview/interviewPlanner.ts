import { getBusinessSystemFamily } from "../catalog/businessSystemsCatalog.js";
import type { BusinessSystemFamily } from "../catalog/types.js";
import {
  STAKEHOLDER_INTERVIEW_MODES,
  interviewQuestionBank,
} from "./questionBank.js";
import type {
  InterviewBoundarySet,
  InterviewExtractedFact,
  InterviewPlan,
  InterviewPlanOptions,
  InterviewQuestion,
  StakeholderInterviewMode,
} from "./types.js";

export const interviewBoundaries: InterviewBoundarySet = {
  dataOnly: true,
  noProviderCalls: true,
  noNetwork: true,
  noChatCreation: true,
  noSessionPersistence: true,
  noStoreMutation: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noScaffolding: true,
  noDbSchemas: true,
  noEnterpriseGeneration: true,
};

const normalizeId = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const makeInterviewId = (
  familyId: string,
  stakeholderModes: readonly StakeholderInterviewMode[],
): string => `interview:${normalizeId(familyId)}:${stakeholderModes.join("+")}`;

const requestedModes = (
  stakeholderModes?: readonly StakeholderInterviewMode[],
): StakeholderInterviewMode[] =>
  stakeholderModes && stakeholderModes.length > 0
    ? Array.from(new Set(stakeholderModes))
    : STAKEHOLDER_INTERVIEW_MODES.slice();

const selectQuestions = (
  modes: readonly StakeholderInterviewMode[],
  includeOptionalQuestions: boolean,
  maxQuestionsPerMode?: number,
): InterviewQuestion[] =>
  modes.flatMap((mode) => {
    const questionsForMode = interviewQuestionBank.filter(
      (question) =>
        question.mode === mode && (includeOptionalQuestions || question.required),
    );
    return typeof maxQuestionsPerMode === "number" && maxQuestionsPerMode > 0
      ? questionsForMode.slice(0, maxQuestionsPerMode)
      : questionsForMode;
  });

const knownModuleIds = (family: BusinessSystemFamily): string[] =>
  family.coreModules.map((module) => normalizeId(module.id || module.name));

const extractedCatalogFacts = (
  family: BusinessSystemFamily,
  questions: readonly InterviewQuestion[],
): InterviewExtractedFact[] => {
  const firstQuestionId = questions[0]?.questionId;

  return [
    {
    factId: `fact:${family.familyId}:actors`,
    category: "actors",
    safeSummary: `${family.name} catalog suggests actor groups that require confirmation.`,
    mapsTo: ["actors", "permissions"],
    confidence: "low",
  },
    {
    factId: `fact:${family.familyId}:modules`,
    category: "processes",
    safeSummary: `${family.name} catalog has ${family.coreModules.length} starter modules for interview planning.`,
    mapsTo: ["moduleBlueprintInputs", "workflows"],
    confidence: "low",
  },
    {
    factId: `fact:${family.familyId}:questions`,
    category: "risks",
    ...(firstQuestionId ? { sourceQuestionId: firstQuestionId } : {}),
    safeSummary: "Interview facts are incomplete until stakeholders answer the required questions.",
    mapsTo: ["assumptions", "risks"],
    confidence: "low",
  },
  ];
};

const moduleContextNotes = (
  family: BusinessSystemFamily,
  moduleIds: readonly string[],
): { validModuleIds: string[]; assumptions: string[]; risks: string[]; next: string[] } => {
  const availableModuleIds = new Set(knownModuleIds(family));
  const validModuleIds = moduleIds.map(normalizeId).filter((moduleId) =>
    availableModuleIds.has(moduleId),
  );
  const invalidModuleIds = moduleIds.map(normalizeId).filter((moduleId) =>
    !availableModuleIds.has(moduleId),
  );

  return {
    validModuleIds,
    assumptions: validModuleIds.map(
      (moduleId) =>
        `Module context '${moduleId}' was requested and should be confirmed by stakeholders.`,
    ),
    risks: invalidModuleIds.map(
      () => "A requested module was not found in the family catalog and needs review.",
    ),
    next: validModuleIds.map(
      (moduleId) =>
        `Ask stakeholders which ${moduleId} workflows, permissions, reports, and exceptions are required.`,
    ),
  };
};

const invalidFamilyPlan = (
  options: InterviewPlanOptions,
  modes: StakeholderInterviewMode[],
): InterviewPlan => ({
  interviewId: makeInterviewId(options.familyId, modes),
  schemaVersion: "1.0",
  createdAt: new Date().toISOString(),
  familyId: options.familyId,
  familyName: "Unknown family",
  stakeholderModes: modes,
  moduleIds: (options.moduleIds ?? []).map(normalizeId),
  questions: [],
  missingAnswers: [],
  extractedFacts: [],
  assumptions: [
    "Requested family was not found in the business systems catalog.",
    "No stakeholder answers have been collected.",
  ],
  risks: ["Interview planning cannot be completed until a valid family is selected."],
  confidence: "low",
  recommendedNextQuestions: [
    "Select a valid business system family before interviewing stakeholders.",
  ],
  advisoryOnly: true,
  boundaries: interviewBoundaries,
});

export const createInterviewPlan = (
  options: InterviewPlanOptions,
): InterviewPlan => {
  const modes = requestedModes(options.stakeholderModes);
  const family = getBusinessSystemFamily(options.familyId);
  if (!family) {
    return invalidFamilyPlan(options, modes);
  }

  const moduleContext = moduleContextNotes(family, options.moduleIds ?? []);
  const questions = selectQuestions(
    modes,
    options.includeOptionalQuestions === true,
    options.maxQuestionsPerMode,
  );

  return {
    interviewId: makeInterviewId(family.familyId, modes),
    schemaVersion: "1.0",
    createdAt: new Date().toISOString(),
    familyId: family.familyId,
    familyName: family.name,
    stakeholderModes: modes,
    moduleIds: moduleContext.validModuleIds,
    questions,
    missingAnswers: questions
      .filter((question) => question.required)
      .map((question) => question.questionId),
    extractedFacts: extractedCatalogFacts(family, questions),
    assumptions: [
      ...family.assumptions,
      ...moduleContext.assumptions,
      "Question plan is generated from source metadata only.",
      "No stakeholder answer has been collected or persisted.",
    ],
    risks: [
      ...family.riskNotes,
      ...moduleContext.risks,
      "Requirements remain incomplete until stakeholders answer the interview questions.",
    ],
    confidence: "low",
    recommendedNextQuestions: [
      ...questions.slice(0, 6).map((question) => question.text),
      ...moduleContext.next,
    ],
    advisoryOnly: true,
    boundaries: interviewBoundaries,
  };
};
