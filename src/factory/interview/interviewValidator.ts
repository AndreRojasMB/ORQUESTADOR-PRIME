import { getBusinessSystemFamily } from "../catalog/businessSystemsCatalog.js";
import { interviewBoundaries } from "./interviewPlanner.js";
import {
  INTERVIEW_EXPECTED_ANSWER_TYPES,
  INTERVIEW_QUESTION_CATEGORIES,
  STAKEHOLDER_INTERVIEW_MODES,
  interviewQuestionBank,
} from "./questionBank.js";
import type {
  InterviewBoundarySet,
  InterviewQuestion,
  InterviewQuestionCategory,
  InterviewValidationFinding,
  InterviewValidationResult,
  InterviewValidationStatus,
  StakeholderInterviewMode,
} from "./types.js";

const SCHEMA_VERSION = "1.0" as const;
const MAX_TEXT_LENGTH = 1_000;
const MAX_ARRAY_LENGTH = 80;

const boundaryKeys = [
  "dataOnly",
  "noProviderCalls",
  "noNetwork",
  "noChatCreation",
  "noSessionPersistence",
  "noStoreMutation",
  "noActionDispatch",
  "noProposalCreation",
  "noScaffolding",
  "noDbSchemas",
  "noEnterpriseGeneration",
] as const satisfies readonly (keyof InterviewBoundarySet)[];

const certificationClaimPatterns = [
  "certified",
  "guarantees compliance",
  "legally compliant",
];

const forbiddenContentPatterns = [
  "token",
  "api key",
  "apikey",
  "secret",
  "password",
  "bearer",
  "provider output",
  "generated code",
  "code snippet",
  "create table",
  "scaffold instruction",
  "scaffold output",
  "runtime action",
  "runtime execution",
  "action dispatch",
  "proposal creation",
];

const makeValidationId = (): string =>
  `interview_validation_${Date.now().toString(36)}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const addFinding = (
  findings: InterviewValidationFinding[],
  severity: "warn" | "fail",
  reasonCode: string,
  safeMessage: string,
  source?: {
    questionId?: string;
    mode?: StakeholderInterviewMode;
    category?: InterviewQuestionCategory;
    familyId?: string;
    metadata?: Record<string, string | number | boolean>;
  },
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(source?.questionId ? { questionId: source.questionId } : {}),
    ...(source?.mode ? { mode: source.mode } : {}),
    ...(source?.category ? { category: source.category } : {}),
    ...(source?.familyId ? { familyId: source.familyId } : {}),
    ...(source?.metadata ? { metadata: source.metadata } : {}),
  });
};

const sourceContext = (input: {
  questionId?: string | undefined;
  mode?: StakeholderInterviewMode | undefined;
  category?: InterviewQuestionCategory | undefined;
  familyId?: string | undefined;
  metadata?: Record<string, string | number | boolean> | undefined;
}): Parameters<typeof addFinding>[4] => ({
  ...(input.questionId ? { questionId: input.questionId } : {}),
  ...(input.mode ? { mode: input.mode } : {}),
  ...(input.category ? { category: input.category } : {}),
  ...(input.familyId ? { familyId: input.familyId } : {}),
  ...(input.metadata ? { metadata: input.metadata } : {}),
});

const safeStringValues = (value: unknown): string[] => {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(safeStringValues);
  }
  if (isRecord(value)) {
    return Object.values(value).flatMap(safeStringValues);
  }
  return [];
};

const hasPattern = (text: string, pattern: string): boolean =>
  text.toLowerCase().includes(pattern.toLowerCase());

const isValidMode = (value: unknown): value is StakeholderInterviewMode =>
  typeof value === "string" &&
  STAKEHOLDER_INTERVIEW_MODES.includes(value as StakeholderInterviewMode);

const isValidCategory = (value: unknown): value is InterviewQuestionCategory =>
  typeof value === "string" &&
  INTERVIEW_QUESTION_CATEGORIES.includes(value as InterviewQuestionCategory);

const hasAllBoundaries = (value: unknown): value is InterviewBoundarySet =>
  isRecord(value) && boundaryKeys.every((key) => value[key] === true);

const validateTextSafety = (
  value: unknown,
  errors: InterviewValidationFinding[],
  warnings: InterviewValidationFinding[],
  source?: Parameters<typeof addFinding>[4],
): void => {
  safeStringValues(value).forEach((text, valueIndex) => {
    if (text.length > MAX_TEXT_LENGTH) {
      addFinding(
        errors,
        "fail",
        "TEXT_TOO_LONG",
        "Interview text exceeds the bounded description limit.",
        { ...source, metadata: { valueIndex, maxLength: MAX_TEXT_LENGTH } },
      );
    }

    certificationClaimPatterns.forEach((pattern) => {
      if (hasPattern(text, pattern)) {
        addFinding(
          errors,
          "fail",
          "CERTIFICATION_OVERCLAIM",
          "Interview text must stay in guidance-only language.",
          source,
        );
      }
    });

    forbiddenContentPatterns.forEach((pattern) => {
      if (hasPattern(text, pattern)) {
        addFinding(
          errors,
          "fail",
          "FORBIDDEN_CONTENT",
          "Interview text contains content outside advisory planning scope.",
          source,
        );
      }
    });
  });

  if (Array.isArray(value) && value.length > MAX_ARRAY_LENGTH) {
    addFinding(
      warnings,
      "warn",
      "ARRAY_FIELD_LARGE",
      "Interview array field is larger than the recommended starter bound.",
      source,
    );
  }
};

const validateQuestionShape = (
  question: unknown,
  errors: InterviewValidationFinding[],
  warnings: InterviewValidationFinding[],
): void => {
  if (!isRecord(question)) {
    addFinding(errors, "fail", "INVALID_QUESTION", "Interview question must be an object.");
    return;
  }

  const questionId = isNonEmptyString(question.questionId)
    ? question.questionId
    : undefined;
  const mode = isValidMode(question.mode) ? question.mode : undefined;
  const category = isValidCategory(question.category) ? question.category : undefined;

  if (!questionId) {
    addFinding(errors, "fail", "MISSING_QUESTION_ID", "Question id is required.");
  }
  if (!mode) {
    addFinding(errors, "fail", "INVALID_MODE", "Question mode must be valid.", sourceContext({ questionId }));
  }
  if (!category) {
    addFinding(errors, "fail", "INVALID_CATEGORY", "Question category must be valid.", {
      ...sourceContext({ questionId, mode }),
    });
  }
  if (!isNonEmptyString(question.text)) {
    addFinding(errors, "fail", "EMPTY_QUESTION_TEXT", "Question text is required.", {
      ...sourceContext({ questionId, mode, category }),
    });
  }
  if (!isNonEmptyString(question.purpose)) {
    addFinding(errors, "fail", "MISSING_PURPOSE", "Question purpose is required.", {
      ...sourceContext({ questionId, mode, category }),
    });
  }
  if (
    typeof question.expectedAnswerType !== "string" ||
    !INTERVIEW_EXPECTED_ANSWER_TYPES.includes(question.expectedAnswerType as never)
  ) {
    addFinding(
      errors,
      "fail",
      "INVALID_EXPECTED_ANSWER_TYPE",
      "Question expected answer type must be valid.",
      sourceContext({ questionId, mode, category }),
    );
  }
  if (typeof question.required !== "boolean") {
    addFinding(errors, "fail", "INVALID_REQUIRED_FLAG", "Question required flag must be boolean.", {
      ...sourceContext({ questionId, mode, category }),
    });
  }
  if (!Array.isArray(question.mapsTo) || question.mapsTo.length === 0) {
    addFinding(errors, "fail", "MISSING_MAPS_TO", "Question mapsTo must be non-empty.", {
      ...sourceContext({ questionId, mode, category }),
    });
  }
  if (!Array.isArray(question.followUps)) {
    addFinding(errors, "fail", "INVALID_FOLLOW_UPS", "Question followUps must be an array.", {
      ...sourceContext({ questionId, mode, category }),
    });
  }

  validateTextSafety(question, errors, warnings, sourceContext({ questionId, mode, category }));
};

const validationResult = (
  questions: readonly unknown[],
  warnings: InterviewValidationFinding[],
  errors: InterviewValidationFinding[],
): InterviewValidationResult => {
  const modesPresent = Array.from(
    new Set(
      questions
        .filter(isRecord)
        .map((question) => question.mode)
        .filter(isValidMode),
    ),
  );
  const categoriesPresent = Array.from(
    new Set(
      questions
        .filter(isRecord)
        .map((question) => question.category)
        .filter(isValidCategory),
    ),
  );
  const status: InterviewValidationStatus =
    errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass";

  return {
    validationId: makeValidationId(),
    createdAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    valid: errors.length === 0,
    status,
    questionCount: questions.length,
    modesPresent,
    categoriesPresent,
    warnings,
    errors,
    advisoryOnly: true,
    boundaries: interviewBoundaries,
  };
};

export const validateInterviewQuestion = (
  question: unknown,
): InterviewValidationResult => {
  const errors: InterviewValidationFinding[] = [];
  const warnings: InterviewValidationFinding[] = [];
  validateQuestionShape(question, errors, warnings);
  return validationResult([question], warnings, errors);
};

export const validateInterviewQuestionBank = (
  questions: readonly InterviewQuestion[] = interviewQuestionBank,
): InterviewValidationResult => {
  const errors: InterviewValidationFinding[] = [];
  const warnings: InterviewValidationFinding[] = [];
  const questionIds = new Set<string>();

  questions.forEach((question) => {
    validateQuestionShape(question, errors, warnings);
    if (questionIds.has(question.questionId)) {
      addFinding(errors, "fail", "DUPLICATE_QUESTION_ID", "Question ids must be unique.", {
        questionId: question.questionId,
        mode: question.mode,
        category: question.category,
      });
    }
    questionIds.add(question.questionId);
  });

  STAKEHOLDER_INTERVIEW_MODES.forEach((mode) => {
    if (!questions.some((question) => question.mode === mode)) {
      addFinding(errors, "fail", "MISSING_STAKEHOLDER_MODE", "Question bank must include every stakeholder mode.", {
        mode,
      });
    }
  });

  INTERVIEW_QUESTION_CATEGORIES.forEach((category) => {
    if (!questions.some((question) => question.category === category)) {
      addFinding(errors, "fail", "MISSING_CATEGORY", "Question bank must include every required category.", {
        category,
      });
    }
  });

  return validationResult(questions, warnings, errors);
};

export const validateInterviewPlan = (
  plan: unknown,
): InterviewValidationResult => {
  const errors: InterviewValidationFinding[] = [];
  const warnings: InterviewValidationFinding[] = [];

  if (!isRecord(plan)) {
    addFinding(errors, "fail", "INVALID_PLAN", "Interview plan must be an object.");
    return validationResult([], warnings, errors);
  }

  const familyId = isNonEmptyString(plan.familyId) ? plan.familyId : undefined;
  if (!familyId || !getBusinessSystemFamily(familyId)) {
    addFinding(errors, "fail", "UNKNOWN_FAMILY", "Interview plan family must exist in the catalog.", {
      ...sourceContext({ familyId }),
    });
  }
  if (plan.schemaVersion !== SCHEMA_VERSION) {
    addFinding(errors, "fail", "INVALID_SCHEMA_VERSION", "Interview plan schema version is unsupported.", {
      ...sourceContext({ familyId }),
    });
  }
  if (plan.advisoryOnly !== true || !hasAllBoundaries(plan.boundaries)) {
    addFinding(errors, "fail", "BOUNDARY_MISSING", "Interview plan safety boundaries must all be true.", {
      ...sourceContext({ familyId }),
    });
  }
  if (!Array.isArray(plan.questions) || plan.questions.length === 0) {
    addFinding(errors, "fail", "EMPTY_PLAN_QUESTIONS", "Interview plan must include questions.", {
      ...sourceContext({ familyId }),
    });
  } else {
    plan.questions.forEach((question) => validateQuestionShape(question, errors, warnings));
  }
  ["stakeholderModes", "moduleIds", "missingAnswers", "extractedFacts", "assumptions", "risks", "recommendedNextQuestions"].forEach(
    (field) => {
      if (!Array.isArray(plan[field])) {
        addFinding(errors, "fail", "INVALID_PLAN_FIELD", "Interview plan array field is required.", {
          ...sourceContext({ familyId, metadata: { field } }),
        });
      }
    },
  );

  validateTextSafety(plan, errors, warnings, sourceContext({ familyId }));
  return validationResult(Array.isArray(plan.questions) ? plan.questions : [], warnings, errors);
};
