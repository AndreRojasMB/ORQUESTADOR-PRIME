import type { PMApprovalPlan, PMApprovalValidationResult } from "./approvalTypes.js";
import type { PMAutonomyPolicyResult } from "./autonomyPolicy.js";
import type { PMBlocker } from "./blockerRules.js";
import type { PMDoDValidationResult } from "./dodTypes.js";
import type { PMMilestone, PMMilestoneHealthSummary } from "./milestonePlanner.js";
import type { PMNextBestActionResult } from "./nextBestAction.js";
import type { PMRiskEntry } from "./riskModel.js";
import type { PMTaskGraph, PMTaskNode } from "./taskGraph.js";
import type {
  PMBoundarySet,
  PMEvidenceReference,
  PMFindingSeverity,
  PMMilestoneId,
  PMSchemaVersion,
  PMTaskId,
  ProjectPhaseRef,
  ProjectState,
  ProjectStateSummary,
} from "./types.js";

export type PMReportId = string;

export type PMReportType =
  | "phase_status_report"
  | "milestone_status_report"
  | "blocker_report"
  | "risk_report"
  | "approval_readiness_report"
  | "next_action_report"
  | "roadmap_return_report";

export type PMReportSectionKey =
  | "current_phase"
  | "milestone_health"
  | "completed_work"
  | "pending_work"
  | "blockers"
  | "risks"
  | "dod_gaps"
  | "approval_requirements"
  | "next_best_action"
  | "autopilot_context"
  | "confidence_uncertainty"
  | "evidence";

export type PMReportConfidenceLevel = "low" | "medium" | "high";

export type PMStatusReportStatus = "pass" | "warn" | "fail";

export interface PMReportConfidence {
  level: PMReportConfidenceLevel;
  safeSummary: string;
  evidenceRefs: PMEvidenceReference[];
  metadataOnly: true;
  noExecution: true;
}

export interface PMReportUncertainty {
  uncertaintyId: string;
  label: string;
  safeSummary: string;
  severity: PMFindingSeverity;
  evidenceRefs: PMEvidenceReference[];
  metadataOnly: true;
  noExecution: true;
}

export interface PMReportWorkItem {
  itemId: string;
  label: string;
  safeSummary: string;
  phaseRef?: ProjectPhaseRef;
  taskId?: PMTaskId;
  milestoneId?: PMMilestoneId;
  status?: string;
  evidenceRefs: PMEvidenceReference[];
  metadataOnly: true;
  noExecution: true;
}

export interface PMSolidFindingPlaceholder {
  findingId: string;
  label: string;
  safeSummary: string;
  severity: PMFindingSeverity;
  evidenceRefs: PMEvidenceReference[];
  placeholderOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface PMAutopilotCloseoutPlaceholder {
  closeoutRefId: string;
  phaseRef: ProjectPhaseRef;
  status: string;
  safeSummary: string;
  roadmapReturnTarget?: ProjectPhaseRef;
  evidenceRefs: PMEvidenceReference[];
  placeholderOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface PMReportGeneratedFromMetadata {
  sourcePhaseRef?: ProjectPhaseRef;
  sourceLabel?: string;
  callerSuppliedTimestamp?: string;
  metadataOnly: true;
  noRuntimeInspection: true;
}

export interface PMReportSectionItem {
  itemId: string;
  label: string;
  safeSummary: string;
  severity?: PMFindingSeverity;
  status?: string;
  phaseRef?: ProjectPhaseRef;
  taskId?: PMTaskId;
  milestoneId?: PMMilestoneId;
  riskId?: string;
  blockerId?: string;
  approvalPlanId?: string;
  evidenceRefs: PMEvidenceReference[];
  metadataOnly: true;
  noExecution: true;
}

export interface PMReportSection {
  sectionId: string;
  key: PMReportSectionKey;
  title: string;
  safeSummary: string;
  items: PMReportSectionItem[];
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
}

export interface PMReportFinding {
  findingId: string;
  severity: PMFindingSeverity;
  reasonCode: string;
  safeMessage: string;
  sectionKey?: PMReportSectionKey;
  phaseRef?: ProjectPhaseRef;
  taskId?: PMTaskId;
  milestoneId?: PMMilestoneId;
  riskId?: string;
  blockerId?: string;
  evidenceRefs: PMEvidenceReference[];
  metadataOnly: true;
  noExecution: true;
}

export interface PMStatusReportInput {
  reportId?: PMReportId;
  reportType: PMReportType;
  schemaVersion?: PMSchemaVersion;
  phaseRef?: ProjectPhaseRef;
  title?: string;
  safeSummary?: string;
  executiveSummary?: string;
  projectState?: ProjectState | ProjectStateSummary;
  currentMilestone?: PMMilestone;
  taskGraph?: PMTaskGraph;
  milestoneHealth?: PMMilestoneHealthSummary;
  dodValidations?: PMDoDValidationResult[];
  risks?: PMRiskEntry[];
  blockers?: PMBlocker[];
  approvalPlans?: PMApprovalPlan[];
  approvalValidations?: PMApprovalValidationResult[];
  autonomyPolicyResult?: PMAutonomyPolicyResult;
  nextBestActionResult?: PMNextBestActionResult;
  completedWork?: PMReportWorkItem[];
  pendingWork?: PMReportWorkItem[];
  solidFindings?: PMSolidFindingPlaceholder[];
  autopilotCloseout?: PMAutopilotCloseoutPlaceholder;
  evidenceRefs?: PMEvidenceReference[];
  confidence?: PMReportConfidence;
  uncertainty?: PMReportUncertainty[];
  findings?: PMReportFinding[];
  generatedFrom?: PMReportGeneratedFromMetadata;
  assumptions?: string[];
  exclusions?: string[];
}

export interface PMStatusReport {
  reportId: PMReportId;
  schemaVersion: PMSchemaVersion;
  reportType: PMReportType;
  status: PMStatusReportStatus;
  phaseRef: ProjectPhaseRef;
  title: string;
  safeSummary: string;
  executiveSummary: string;
  sections: PMReportSection[];
  findings: PMReportFinding[];
  evidenceRefs: PMEvidenceReference[];
  confidence: PMReportConfidence;
  uncertainty: PMReportUncertainty[];
  recommendedNextAction?: PMNextBestActionResult;
  generatedFrom: PMReportGeneratedFromMetadata;
  assumptions: string[];
  exclusions: string[];
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
  noHandoffTrigger: true;
  noValidationTrigger: true;
  noCloseoutTrigger: true;
  noProviderCalls: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
  noGitMutationFromSource: true;
  boundaries: PMBoundarySet;
}

export interface PMStatusReportResult {
  ok: boolean;
  status: "report_built" | "report_built_with_warnings" | "input_invalid";
  report: PMStatusReport;
  warnings: PMReportFinding[];
  errors: PMReportFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  reportOnly: true;
  noExecution: true;
  noProviderCalls: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
  noGitMutationFromSource: true;
  boundaries: PMBoundarySet;
}
