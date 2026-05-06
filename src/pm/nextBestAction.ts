import { pmAllowedAutonomyLevels101To120, pmFoundationBoundaries } from "./boundaries.js";
import type {
  PMAllowedAutonomyLevel,
  PMAutonomyLevel,
  PMBoundarySet,
  PMEvidenceReference,
  PMFindingSeverity,
  PMMilestoneId,
  PMSchemaVersion,
  PMTaskId,
  ProjectPhaseRef,
  ProjectStateSummary,
} from "./types.js";
import type { PMApprovalPlan, PMApprovalValidationResult } from "./approvalTypes.js";
import type { PMAutonomyDecision, PMAutonomyPolicyResult } from "./autonomyPolicy.js";
import type { PMBlocker, PMBlockerStatus } from "./blockerRules.js";
import type { PMDoDValidationResult } from "./dodTypes.js";
import type { PMRiskEntry, PMRiskSeverity } from "./riskModel.js";

export type PMNextBestActionId = string;

export type PMNextBestActionCategory =
  | "observe"
  | "report"
  | "plan"
  | "propose"
  | "request_clarification"
  | "request_approval_metadata"
  | "resolve_blocker_metadata"
  | "improve_dod_metadata"
  | "review_risk_metadata"
  | "update_project_state_metadata"
  | "defer_due_to_risk"
  | "stop_due_to_blocker";

export type PMNextBestActionPriority = "low" | "medium" | "high" | "critical";

export type PMNextBestActionStatus = "pass" | "warn" | "fail" | "blocked" | "deferred";

export interface PMActionRecommendationReason {
  reasonId: string;
  label: string;
  safeSummary: string;
  category: PMNextBestActionCategory;
  severity: PMFindingSeverity;
  metadataOnly: true;
  noExecution: true;
}

export interface PMActionRecommendation {
  recommendationId: string;
  actionId: PMNextBestActionId;
  category: PMNextBestActionCategory;
  priority: PMNextBestActionPriority;
  status: PMNextBestActionStatus;
  safeSummary: string;
  recommendedAutonomyLevel: PMAllowedAutonomyLevel;
  reasons: PMActionRecommendationReason[];
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
  noActionDispatch: true;
  noProposalCreation: true;
  noApprovalCreation: true;
  noApprovalExecution: true;
  noJobsExecution: true;
  noBranchCommitPrCreation: true;
  noCodexOpenCodeExecution: true;
}

export interface PMNextBestAction {
  actionId: PMNextBestActionId;
  category: PMNextBestActionCategory;
  priority: PMNextBestActionPriority;
  status: PMNextBestActionStatus;
  label: string;
  safeSummary: string;
  recommendedAutonomyLevel: PMAllowedAutonomyLevel;
  reasons: PMActionRecommendationReason[];
  evidenceRefs: PMEvidenceReference[];
  phaseRefs: ProjectPhaseRef[];
  taskIds: PMTaskId[];
  milestoneIds: PMMilestoneId[];
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
  noActionDispatch: true;
  noProposalCreation: true;
  noApprovalCreation: true;
  noApprovalExecution: true;
  noProposalStoreWrites: true;
  noJobsExecution: true;
  noBranchCommitPrCreation: true;
  noCodexOpenCodeExecution: true;
  boundaries: PMBoundarySet;
}

export interface PMNextBestActionFinding {
  id: string;
  severity: PMFindingSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  actionId?: PMNextBestActionId;
  metadata?: Record<string, string | number | boolean>;
}

export interface PMNextBestActionInput {
  plannerId?: string;
  schemaVersion?: PMSchemaVersion;
  currentPhaseRef?: ProjectPhaseRef;
  projectState?: ProjectStateSummary;
  risks?: PMRiskEntry[];
  blockers?: PMBlocker[];
  dodValidations?: PMDoDValidationResult[];
  autonomyDecision?: PMAutonomyDecision;
  autonomyPolicyResult?: PMAutonomyPolicyResult;
  approvalPlans?: PMApprovalPlan[];
  approvalValidations?: PMApprovalValidationResult[];
  requestedAutonomyLevel?: PMAutonomyLevel;
  evidenceRefs?: PMEvidenceReference[];
  assumptions?: string[];
  exclusions?: string[];
}

export interface PMNextBestActionResult {
  validationId: string;
  schemaVersion: PMSchemaVersion;
  valid: boolean;
  status: PMNextBestActionStatus;
  selectedAction?: PMNextBestAction;
  recommendations: PMActionRecommendation[];
  findings: PMNextBestActionFinding[];
  warnings: PMNextBestActionFinding[];
  errors: PMNextBestActionFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
  noActionDispatch: true;
  noProposalCreation: true;
  noApprovalCreation: true;
  noApprovalExecution: true;
  noProposalStoreWrites: true;
  noJobsExecution: true;
  noBranchCommitPrCreation: true;
  noCodexOpenCodeExecution: true;
  boundaries: PMBoundarySet;
}

const priorityRank: Record<PMNextBestActionPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export const pmNextBestActionCategories = [
  "observe",
  "report",
  "plan",
  "propose",
  "request_clarification",
  "request_approval_metadata",
  "resolve_blocker_metadata",
  "improve_dod_metadata",
  "review_risk_metadata",
  "update_project_state_metadata",
  "defer_due_to_risk",
  "stop_due_to_blocker",
] as const satisfies readonly PMNextBestActionCategory[];

export const pmNextBestActionPriorities = [
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly PMNextBestActionPriority[];

export const pmNextBestActionStatuses = [
  "pass",
  "warn",
  "fail",
  "blocked",
  "deferred",
] as const satisfies readonly PMNextBestActionStatus[];

const makeReason = (
  reasonId: string,
  category: PMNextBestActionCategory,
  severity: PMFindingSeverity,
  label: string,
  safeSummary: string,
): PMActionRecommendationReason => ({
  reasonId,
  category,
  severity,
  label,
  safeSummary,
  metadataOnly: true,
  noExecution: true,
});

const makeRecommendation = (
  actionId: PMNextBestActionId,
  category: PMNextBestActionCategory,
  priority: PMNextBestActionPriority,
  status: PMNextBestActionStatus,
  safeSummary: string,
  recommendedAutonomyLevel: PMAllowedAutonomyLevel,
  reasons: PMActionRecommendationReason[],
): PMActionRecommendation => ({
  recommendationId: `${actionId}:recommendation`,
  actionId,
  category,
  priority,
  status,
  safeSummary,
  recommendedAutonomyLevel,
  reasons,
  metadataOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
  noExecution: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noApprovalCreation: true,
  noApprovalExecution: true,
  noJobsExecution: true,
  noBranchCommitPrCreation: true,
  noCodexOpenCodeExecution: true,
});

const addFinding = (
  findings: PMNextBestActionFinding[],
  severity: PMFindingSeverity,
  reasonCode: string,
  safeMessage: string,
  path?: string,
  actionId?: PMNextBestActionId,
  metadata?: Record<string, string | number | boolean>,
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(actionId ? { actionId } : {}),
    ...(metadata ? { metadata } : {}),
  });
};

const maxAutonomy = (
  requested: PMAutonomyLevel | undefined,
): PMAllowedAutonomyLevel => {
  if (requested && pmAllowedAutonomyLevels101To120.includes(requested as PMAllowedAutonomyLevel)) {
    return requested as PMAllowedAutonomyLevel;
  }
  return "L3_propose_only";
};

const hasHighRisk = (risks: readonly PMRiskEntry[]): boolean =>
  risks.some((risk) =>
    (risk.severity === "high" || risk.severity === "critical") &&
    (risk.status === "identified" || risk.status === "watching" || risk.status === "active"),
  );

const highestRiskPriority = (risks: readonly PMRiskEntry[]): PMNextBestActionPriority =>
  risks.some((risk) => risk.severity === "critical") ? "critical" : "high";

const activeBlocker = (blockers: readonly PMBlocker[]): PMBlocker | undefined =>
  blockers.find((blocker) =>
    blocker.status === "open" || blocker.status === "watching" || blocker.status === "blocked",
  );

const blockerPriority = (status: PMBlockerStatus): PMNextBestActionPriority =>
  status === "blocked" ? "critical" : "high";

const failedDod = (dodValidations: readonly PMDoDValidationResult[]): boolean =>
  dodValidations.some((result) => !result.valid || result.status === "fail");

const approvalRequired = (
  approvalPlans: readonly PMApprovalPlan[],
  approvalValidations: readonly PMApprovalValidationResult[],
): boolean =>
  approvalValidations.some((result) => !result.valid || result.status === "fail") ||
  approvalPlans.some((plan) =>
    plan.requirements.some((requirement) =>
      requirement.status === "required" ||
      requirement.status === "pending_metadata" ||
      requirement.status === "ready_for_human_review" ||
      requirement.status === "blocked",
    ),
  );

const evidenceRefsValid = (
  evidenceRefs: readonly PMEvidenceReference[],
  findings: PMNextBestActionFinding[],
): void => {
  evidenceRefs.forEach((evidence, index) => {
    if (evidence.metadataOnly !== true || evidence.noFileRead !== true) {
      addFinding(
        findings,
        "fail",
        "EVIDENCE_REF_NOT_METADATA_ONLY",
        "Next-action evidence refs must remain metadata-only and must not read files.",
        `evidenceRefs.${index}`,
      );
    }
  });
};

const makeSelectedAction = (
  recommendation: PMActionRecommendation,
  input: PMNextBestActionInput,
): PMNextBestAction => ({
  actionId: recommendation.actionId,
  category: recommendation.category,
  priority: recommendation.priority,
  status: recommendation.status,
  label: recommendation.category.replace(/_/g, " "),
  safeSummary: recommendation.safeSummary,
  recommendedAutonomyLevel: recommendation.recommendedAutonomyLevel,
  reasons: recommendation.reasons.map((reason) => ({ ...reason })),
  evidenceRefs: input.evidenceRefs?.map((evidence) => ({ ...evidence })) ?? [],
  phaseRefs: input.currentPhaseRef ? [input.currentPhaseRef] : [],
  taskIds: [],
  milestoneIds: [],
  metadataOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
  noExecution: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noApprovalCreation: true,
  noApprovalExecution: true,
  noProposalStoreWrites: true,
  noJobsExecution: true,
  noBranchCommitPrCreation: true,
  noCodexOpenCodeExecution: true,
  boundaries: pmFoundationBoundaries,
});

const makeResult = (
  input: PMNextBestActionInput,
  recommendations: PMActionRecommendation[],
  findings: PMNextBestActionFinding[],
): PMNextBestActionResult => {
  const errors = findings.filter((finding) => finding.severity === "fail");
  const warnings = findings.filter((finding) => finding.severity === "warn");
  const selectedRecommendation = [...recommendations].sort(
    (left, right) => priorityRank[right.priority] - priorityRank[left.priority],
  )[0];

  return {
    validationId: input.plannerId?.trim() || "next_best_action_validation:108I",
    schemaVersion: "1.0",
    valid: errors.length === 0,
    status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : selectedRecommendation?.status ?? "pass",
    ...(selectedRecommendation ? { selectedAction: makeSelectedAction(selectedRecommendation, input) } : {}),
    recommendations,
    findings,
    warnings,
    errors,
    advisoryOnly: true,
    sourceOnly: true,
    noExecution: true,
    noActionDispatch: true,
    noProposalCreation: true,
    noApprovalCreation: true,
    noApprovalExecution: true,
    noProposalStoreWrites: true,
    noJobsExecution: true,
    noBranchCommitPrCreation: true,
    noCodexOpenCodeExecution: true,
    boundaries: pmFoundationBoundaries,
  };
};

export const planNextBestAction = (
  input: PMNextBestActionInput,
): PMNextBestActionResult => {
  const findings: PMNextBestActionFinding[] = [];
  const recommendations: PMActionRecommendation[] = [];
  const risks = input.risks ?? [];
  const blockers = input.blockers ?? [];
  const dodValidations = input.dodValidations ?? [];
  const approvalPlans = input.approvalPlans ?? [];
  const approvalValidations = input.approvalValidations ?? [];
  const recommendedAutonomyLevel = maxAutonomy(input.requestedAutonomyLevel);

  if (input.schemaVersion && input.schemaVersion !== "1.0") {
    addFinding(
      findings,
      "fail",
      "SCHEMA_VERSION_INVALID",
      "Next-action planner input schemaVersion must be 1.0.",
      "schemaVersion",
    );
  }

  if (
    input.requestedAutonomyLevel &&
    !pmAllowedAutonomyLevels101To120.includes(input.requestedAutonomyLevel as PMAllowedAutonomyLevel)
  ) {
    addFinding(
      findings,
      "warn",
      "AUTONOMY_CAPPED_TO_101_120",
      "Next-action recommendations are capped to observe/report/plan/propose during Phase 101-120.",
      "requestedAutonomyLevel",
      undefined,
      { requestedAutonomyLevel: input.requestedAutonomyLevel },
    );
  }

  evidenceRefsValid(input.evidenceRefs ?? [], findings);

  const blocker = activeBlocker(blockers);
  if (blocker) {
    recommendations.push(
      makeRecommendation(
        "next_action:stop_due_to_blocker:108I",
        "stop_due_to_blocker",
        blockerPriority(blocker.status),
        "blocked",
        "Active blocker metadata makes stopping or deferring the safest advisory recommendation.",
        "L3_propose_only",
        [
          makeReason(
            "reason:active_blocker",
            "stop_due_to_blocker",
            "fail",
            "Active blocker",
            "A blocker is open, watching, or blocked, so the next step stays in report/plan/propose metadata.",
          ),
        ],
      ),
    );
  }

  if (failedDod(dodValidations)) {
    recommendations.push(
      makeRecommendation(
        "next_action:improve_dod_metadata:108I",
        "improve_dod_metadata",
        "high",
        "warn",
        "Definition of Done findings should be addressed as metadata before further planning.",
        "L3_propose_only",
        [
          makeReason(
            "reason:dod_failed",
            "improve_dod_metadata",
            "fail",
            "DoD validation finding",
            "A DoD validation result is failing or invalid, so the next step should improve DoD metadata.",
          ),
        ],
      ),
    );
  }

  if (approvalRequired(approvalPlans, approvalValidations)) {
    recommendations.push(
      makeRecommendation(
        "next_action:request_approval_metadata:108I",
        "request_approval_metadata",
        "high",
        "warn",
        "Approval-gated context should request approval metadata only.",
        "L3_propose_only",
        [
          makeReason(
            "reason:approval_metadata_required",
            "request_approval_metadata",
            "warn",
            "Approval metadata required",
            "Approval gate metadata is required or invalid; the planner recommends metadata review only.",
          ),
        ],
      ),
    );
  }

  if (hasHighRisk(risks)) {
    recommendations.push(
      makeRecommendation(
        "next_action:defer_due_to_risk:108I",
        "defer_due_to_risk",
        highestRiskPriority(risks),
        "deferred",
        "High or critical risk keeps the next step in risk review, planning, or proposal metadata.",
        "L3_propose_only",
        [
          makeReason(
            "reason:high_or_critical_risk",
            "defer_due_to_risk",
            "warn",
            "High or critical risk",
            "Risk metadata indicates high or critical severity, so the planner avoids execution-like recommendations.",
          ),
        ],
      ),
    );
  }

  if (!input.projectState) {
    recommendations.push(
      makeRecommendation(
        "next_action:update_project_state_metadata:108I",
        "update_project_state_metadata",
        "medium",
        "warn",
        "ProjectState metadata is absent, so the next advisory step is to update project-state metadata.",
        recommendedAutonomyLevel,
        [
          makeReason(
            "reason:project_state_missing",
            "update_project_state_metadata",
            "warn",
            "ProjectState metadata missing",
            "The planner did not receive ProjectState metadata from its caller.",
          ),
        ],
      ),
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      makeRecommendation(
        "next_action:propose:108I",
        "propose",
        "medium",
        "pass",
        "No blocking metadata was supplied; propose the next bounded PM step for human review.",
        recommendedAutonomyLevel,
        [
          makeReason(
            "reason:no_blocking_metadata",
            "propose",
            "info",
            "No blocking metadata",
            "Caller-provided metadata did not include active blockers, failing DoD, approval metadata gaps, or high risk.",
          ),
        ],
      ),
    );
  }

  return makeResult(input, recommendations, findings);
};
