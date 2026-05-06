import type {
  PMBoundarySet,
  PMEvidenceReference,
  PMFindingSeverity,
  PMSchemaVersion,
  PMTaskId,
  ProjectPhaseRef,
} from "./types.js";

export type PMDoDId = string;

export type PMAcceptanceCriterionId = string;

export type PMAcceptanceCriterionStatus =
  | "not_started"
  | "pending_evidence"
  | "satisfied"
  | "failed"
  | "waived"
  | "not_applicable";

export type PMDoDValidationStatus = "pass" | "warn" | "fail";

export type PMDoDSeverityThreshold = PMFindingSeverity;

export interface PMEvidenceRequirement {
  evidenceRequirementId: string;
  label: string;
  safeSummary: string;
  required: boolean;
  acceptedEvidenceRefs: PMEvidenceReference[];
  metadataOnly: true;
  noFileRead: true;
  noCommandExecution: true;
}

export interface PMAcceptanceCriterion {
  criterionId: PMAcceptanceCriterionId;
  label: string;
  safeSummary: string;
  status: PMAcceptanceCriterionStatus;
  required: boolean;
  severity: PMFindingSeverity;
  phaseRef?: ProjectPhaseRef;
  taskIds: PMTaskId[];
  evidenceRequirements: PMEvidenceRequirement[];
  evidenceRefs: PMEvidenceReference[];
  assumptions: string[];
  exclusions: string[];
  metadataOnly: true;
  noExecution: true;
  noTestExecution: true;
  noCiExecution: true;
}

export interface PMDefinitionOfDone {
  dodId: PMDoDId;
  schemaVersion: PMSchemaVersion;
  title: string;
  safeSummary: string;
  phaseRef?: ProjectPhaseRef;
  taskIds: PMTaskId[];
  criteria: PMAcceptanceCriterion[];
  evidenceRequirements: PMEvidenceRequirement[];
  blockingSeverityThreshold: PMDoDSeverityThreshold;
  assumptions: string[];
  exclusions: string[];
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
  noTestExecution: true;
  noCiExecution: true;
  noCommandExecution: true;
  boundaries: PMBoundarySet;
}

export interface PMDoDValidationFinding {
  id: string;
  severity: PMFindingSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  dodId?: PMDoDId;
  criterionId?: PMAcceptanceCriterionId;
  metadata?: Record<string, string | number | boolean>;
}

export interface PMDoDValidationResult {
  validationId: string;
  schemaVersion: PMSchemaVersion;
  valid: boolean;
  status: PMDoDValidationStatus;
  findings: PMDoDValidationFinding[];
  warnings: PMDoDValidationFinding[];
  errors: PMDoDValidationFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: PMBoundarySet;
}

export interface PMDoDValidationInput {
  dod?: PMDefinitionOfDone;
  dods?: PMDefinitionOfDone[];
}
