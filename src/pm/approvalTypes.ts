import type {
  PMAutonomyLevel,
  PMBoundarySet,
  PMEvidenceReference,
  PMFindingSeverity,
  PMSchemaVersion,
  PMTaskId,
  ProjectPhaseRef,
} from "./types.js";

export type PMApprovalPlanId = string;

export type PMApprovalRequirementId = string;

export type PMApprovalGateType =
  | "human_review"
  | "maintainer_review"
  | "security_review"
  | "dual_approval"
  | "release_review"
  | "future_execution_gate";

export type PMApprovalStatus =
  | "not_required"
  | "required"
  | "pending_metadata"
  | "ready_for_human_review"
  | "blocked"
  | "future_only"
  | "invalid";

export type PMApprovalRiskLevel = "low" | "medium" | "high" | "critical";

export interface PMApprovalEvidenceRequirement {
  evidenceRequirementId: string;
  label: string;
  safeSummary: string;
  required: boolean;
  evidenceRefs: PMEvidenceReference[];
  metadataOnly: true;
  noFileRead: true;
  noApprovalExecution: true;
}

export interface PMDualApprovalRequirement {
  dualApprovalRequirementId: string;
  label: string;
  safeSummary: string;
  required: boolean;
  primaryReviewerRole: string;
  secondaryReviewerRole: string;
  independentReviewerRequired: true;
  evidenceRequirements: PMApprovalEvidenceRequirement[];
  metadataOnly: true;
  noSecondApprovalPersistence: true;
  noApprovalExecution: true;
  noSelfApproval: true;
}

export interface PMApprovalRequirement {
  requirementId: PMApprovalRequirementId;
  gateType: PMApprovalGateType;
  status: PMApprovalStatus;
  riskLevel: PMApprovalRiskLevel;
  reviewerRole: string;
  subjectRef: string;
  safeSummary: string;
  phaseRef?: ProjectPhaseRef;
  taskIds: PMTaskId[];
  requestedAutonomyLevel?: PMAutonomyLevel;
  evidenceRequirements: PMApprovalEvidenceRequirement[];
  dualApprovalRequirement?: PMDualApprovalRequirement;
  requesterRole?: string;
  approverRole?: string;
  metadataOnly: true;
  advisoryOnly: true;
  noApprovalCreation: true;
  noApprovalExecution: true;
  noActionDispatch: true;
  noProposalStoreWrites: true;
  noSelfApproval: true;
}

export interface PMApprovalPlan {
  approvalPlanId: PMApprovalPlanId;
  schemaVersion: PMSchemaVersion;
  label: string;
  safeSummary: string;
  phaseRef?: ProjectPhaseRef;
  riskLevel: PMApprovalRiskLevel;
  requirements: PMApprovalRequirement[];
  assumptions: string[];
  exclusions: string[];
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noApprovalCreation: true;
  noApprovalExecution: true;
  noActionDispatch: true;
  noProposalStoreWrites: true;
  noJobsExecution: true;
  noSelfApproval: true;
  boundaries: PMBoundarySet;
}

export interface PMApprovalPlanInput {
  approvalPlanId?: PMApprovalPlanId;
  label?: string;
  safeSummary?: string;
  phaseRef?: ProjectPhaseRef;
  riskLevel: PMApprovalRiskLevel;
  requirements?: PMApprovalRequirement[];
  assumptions?: string[];
  exclusions?: string[];
}

export interface PMApprovalFinding {
  id: string;
  severity: PMFindingSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  approvalPlanId?: PMApprovalPlanId;
  requirementId?: PMApprovalRequirementId;
  metadata?: Record<string, string | number | boolean>;
}

export interface PMApprovalValidationResult {
  validationId: string;
  schemaVersion: PMSchemaVersion;
  valid: boolean;
  status: "pass" | "warn" | "fail";
  findings: PMApprovalFinding[];
  warnings: PMApprovalFinding[];
  errors: PMApprovalFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: PMBoundarySet;
}

export interface PMApprovalPlanResult {
  ok: boolean;
  status: "plan_built" | "input_invalid";
  plan?: PMApprovalPlan;
  validation: PMApprovalValidationResult;
  advisoryOnly: true;
  sourceOnly: true;
  noApprovalCreation: true;
  noApprovalExecution: true;
  noActionDispatch: true;
  noProposalStoreWrites: true;
  boundaries: PMBoundarySet;
}
