import type { BusinessSystemFamilyId } from "../catalog/types.js";

export type InterviewEngineSchemaVersion = "1.0";

export type StakeholderInterviewMode =
  | "ceo_business_owner"
  | "operational_user"
  | "technical_user"
  | "auditor_compliance"
  | "client_customer"
  | "project_manager"
  | "finance_admin"
  | "support_helpdesk";

export type InterviewQuestionCategory =
  | "actors"
  | "business_rules"
  | "processes"
  | "exceptions"
  | "entities"
  | "permissions"
  | "integrations"
  | "reports"
  | "compliance"
  | "volume_performance"
  | "sla"
  | "risks"
  | "constraints"
  | "data_migration"
  | "ux_workflows"
  | "deployment";

export type InterviewExpectedAnswerType =
  | "text"
  | "number"
  | "boolean"
  | "enum"
  | "list"
  | "structured"
  | "unknown";

export type InterviewBoundarySet = {
  dataOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noChatCreation: true;
  noSessionPersistence: true;
  noStoreMutation: true;
  noActionDispatch: true;
  noProposalCreation: true;
  noScaffolding: true;
  noDbSchemas: true;
  noEnterpriseGeneration: true;
};

export type InterviewRiskLevel = "low" | "medium" | "high";
export type InterviewConfidence = "low" | "medium" | "high";

export type InterviewQuestion = {
  questionId: string;
  mode: StakeholderInterviewMode;
  category: InterviewQuestionCategory;
  text: string;
  purpose: string;
  expectedAnswerType: InterviewExpectedAnswerType;
  required: boolean;
  followUps: string[];
  mapsTo: string[];
  riskLevel: InterviewRiskLevel;
  tags: string[];
};

export type InterviewPlanOptions = {
  familyId: BusinessSystemFamilyId;
  stakeholderModes?: StakeholderInterviewMode[];
  moduleIds?: string[];
  includeOptionalQuestions?: boolean;
  maxQuestionsPerMode?: number;
};

export type InterviewExtractedFact = {
  factId: string;
  category: InterviewQuestionCategory;
  sourceQuestionId?: string;
  safeSummary: string;
  mapsTo: string[];
  confidence: InterviewConfidence;
};

export type InterviewPlan = {
  interviewId: string;
  schemaVersion: InterviewEngineSchemaVersion;
  createdAt: string;
  familyId: BusinessSystemFamilyId;
  familyName: string;
  stakeholderModes: StakeholderInterviewMode[];
  moduleIds: string[];
  questions: InterviewQuestion[];
  missingAnswers: string[];
  extractedFacts: InterviewExtractedFact[];
  assumptions: string[];
  risks: string[];
  confidence: InterviewConfidence;
  recommendedNextQuestions: string[];
  advisoryOnly: true;
  boundaries: InterviewBoundarySet;
};

export type InterviewValidationStatus = "pass" | "warn" | "fail";

export type InterviewValidationFinding = {
  id: string;
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  questionId?: string;
  mode?: StakeholderInterviewMode;
  category?: InterviewQuestionCategory;
  familyId?: BusinessSystemFamilyId;
  metadata?: Record<string, string | number | boolean>;
};

export type InterviewValidationResult = {
  validationId: string;
  createdAt: string;
  schemaVersion: InterviewEngineSchemaVersion;
  valid: boolean;
  status: InterviewValidationStatus;
  questionCount: number;
  modesPresent: StakeholderInterviewMode[];
  categoriesPresent: InterviewQuestionCategory[];
  warnings: InterviewValidationFinding[];
  errors: InterviewValidationFinding[];
  advisoryOnly: true;
  boundaries: InterviewBoundarySet;
};
