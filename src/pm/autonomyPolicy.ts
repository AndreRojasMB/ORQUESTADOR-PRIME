import {
  pmAllowedAutonomyLevels101To120,
  pmDeniedAutonomyLevels101To120,
  pmFoundationBoundaries,
} from "./boundaries.js";
import type {
  PMAllowedAutonomyLevel,
  PMAutonomyLevel,
  PMBoundarySet,
  PMFindingSeverity,
  PMSchemaVersion,
  PMTaskId,
  ProjectPhaseRef,
} from "./types.js";
import type { PMBlocker, PMBlockerStatus } from "./blockerRules.js";
import type { PMDoDValidationResult } from "./dodTypes.js";
import type { PMRiskEntry, PMRiskSeverity } from "./riskModel.js";

export type PMAutonomyPolicyId = string;

export type PMAutonomyDecisionStatus = "pass" | "warn" | "fail" | "future_gated";

export interface PMExecutionConstraint {
  constraintId: string;
  label: string;
  safeSummary: string;
  metadataOnly: true;
  noExecution: true;
  noApprovalExecution: true;
  noJobsExecution: true;
  noRuntimeExecution: true;
  noDashboardExecution: true;
  noConnectorExecution: true;
  noWorkflowMutation: true;
  noFilesystemMutation: true;
}

export interface PMAutonomyRiskRule {
  ruleId: string;
  riskSeverities: PMRiskSeverity[];
  maxAutonomyLevel: PMAllowedAutonomyLevel;
  safeSummary: string;
  metadataOnly: true;
  advisoryOnly: true;
  noExecution: true;
}

export interface PMAutonomyBlockerRule {
  ruleId: string;
  blockerStatuses: PMBlockerStatus[];
  maxAutonomyLevel: PMAllowedAutonomyLevel;
  safeSummary: string;
  metadataOnly: true;
  advisoryOnly: true;
  noExecution: true;
}

export interface PMAutonomyDoDRule {
  ruleId: string;
  dodStatuses: Array<PMDoDValidationResult["status"]>;
  maxAutonomyLevel: PMAllowedAutonomyLevel;
  safeSummary: string;
  metadataOnly: true;
  advisoryOnly: true;
  noExecution: true;
}

export interface PMAutonomyPolicy {
  policyId: PMAutonomyPolicyId;
  schemaVersion: PMSchemaVersion;
  label: string;
  safeSummary: string;
  phaseWindow: "101-120";
  maxAllowedAutonomyLevel: PMAllowedAutonomyLevel;
  deniedAutonomyLevels: PMAutonomyLevel[];
  riskRules: PMAutonomyRiskRule[];
  blockerRules: PMAutonomyBlockerRule[];
  dodRules: PMAutonomyDoDRule[];
  executionConstraints: PMExecutionConstraint[];
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
  noPolicyEnforcement: true;
  noSelfApproval: true;
  boundaries: PMBoundarySet;
}

export interface PMAutonomyPolicyInput {
  policy: PMAutonomyPolicy;
  requestedAutonomyLevel: PMAutonomyLevel;
  currentPhaseRef?: ProjectPhaseRef;
  taskIds?: PMTaskId[];
  risks?: PMRiskEntry[];
  blockers?: PMBlocker[];
  dodValidations?: PMDoDValidationResult[];
}

export interface PMAutonomyPolicyFinding {
  id: string;
  severity: PMFindingSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  policyId?: PMAutonomyPolicyId;
  requestedAutonomyLevel?: PMAutonomyLevel;
  recommendedAutonomyLevel?: PMAutonomyLevel;
  metadata?: Record<string, string | number | boolean>;
}

export interface PMAutonomyPolicyValidationResult {
  validationId: string;
  schemaVersion: PMSchemaVersion;
  valid: boolean;
  status: PMAutonomyDecisionStatus;
  findings: PMAutonomyPolicyFinding[];
  warnings: PMAutonomyPolicyFinding[];
  errors: PMAutonomyPolicyFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: PMBoundarySet;
}

export interface PMAutonomyDecision {
  decisionId: string;
  status: PMAutonomyDecisionStatus;
  requestedAutonomyLevel: PMAutonomyLevel;
  recommendedAutonomyLevel: PMAllowedAutonomyLevel;
  maxAllowedAutonomyLevel: PMAllowedAutonomyLevel;
  deniedAutonomyLevels: PMAutonomyLevel[];
  safeSummary: string;
  findings: PMAutonomyPolicyFinding[];
  executionConstraints: PMExecutionConstraint[];
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
  noPolicyEnforcement: true;
  noSelfApproval: true;
  boundaries: PMBoundarySet;
}

export interface PMAutonomyPolicyResult {
  ok: boolean;
  validation: PMAutonomyPolicyValidationResult;
  decision: PMAutonomyDecision;
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
  noPolicyEnforcement: true;
  noSelfApproval: true;
  boundaries: PMBoundarySet;
}

export const pmAutonomyLevels = [
  "L0_observe_only",
  "L1_report_only",
  "L2_plan_only",
  "L3_propose_only",
  "L4_prepare_review_only",
  "L5_approval_gated_execution",
  "L6_autonomous_execution",
] as const satisfies readonly PMAutonomyLevel[];

export const pmAutonomyRank: Record<PMAutonomyLevel, number> = {
  L0_observe_only: 0,
  L1_report_only: 1,
  L2_plan_only: 2,
  L3_propose_only: 3,
  L4_prepare_review_only: 4,
  L5_approval_gated_execution: 5,
  L6_autonomous_execution: 6,
};

export const pmDefaultExecutionConstraints: PMExecutionConstraint[] = [
  {
    constraintId: "execution_constraint:no_execution:106I",
    label: "No execution",
    safeSummary:
      "Autonomy policy decisions are advisory metadata and must not execute work.",
    metadataOnly: true,
    noExecution: true,
    noApprovalExecution: true,
    noJobsExecution: true,
    noRuntimeExecution: true,
    noDashboardExecution: true,
    noConnectorExecution: true,
    noWorkflowMutation: true,
    noFilesystemMutation: true,
  },
];

export const buildDefaultAutonomyPolicy = (): PMAutonomyPolicy => ({
  policyId: "autonomy_policy:default:101-120:106I",
  schemaVersion: "1.0",
  label: "Default PM autonomy policy for Phase 101-120",
  safeSummary:
    "Source-only advisory autonomy policy capped to observe/report/plan/propose.",
  phaseWindow: "101-120",
  maxAllowedAutonomyLevel: "L3_propose_only",
  deniedAutonomyLevels: [...pmDeniedAutonomyLevels101To120],
  riskRules: [
    {
      ruleId: "risk_rule:high_critical_caps_to_propose",
      riskSeverities: ["high", "critical"],
      maxAutonomyLevel: "L3_propose_only",
      safeSummary:
        "High and critical risk keep autonomy in planning/proposal metadata only.",
      metadataOnly: true,
      advisoryOnly: true,
      noExecution: true,
    },
  ],
  blockerRules: [
    {
      ruleId: "blocker_rule:active_caps_to_propose",
      blockerStatuses: ["open", "watching", "blocked"],
      maxAutonomyLevel: "L3_propose_only",
      safeSummary:
        "Open, watching, or blocked blockers keep autonomy in report/plan/propose metadata only.",
      metadataOnly: true,
      advisoryOnly: true,
      noExecution: true,
    },
  ],
  dodRules: [
    {
      ruleId: "dod_rule:failed_caps_to_propose",
      dodStatuses: ["fail"],
      maxAutonomyLevel: "L3_propose_only",
      safeSummary:
        "Failed DoD validation keeps autonomy in planning/proposal metadata only.",
      metadataOnly: true,
      advisoryOnly: true,
      noExecution: true,
    },
  ],
  executionConstraints: pmDefaultExecutionConstraints.map((constraint) => ({ ...constraint })),
  metadataOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
  noExecution: true,
  noPolicyEnforcement: true,
  noSelfApproval: true,
  boundaries: pmFoundationBoundaries,
});

export const autonomyLevelAtOrBelow = (
  candidate: PMAutonomyLevel,
  maxLevel: PMAutonomyLevel,
): boolean => pmAutonomyRank[candidate] <= pmAutonomyRank[maxLevel];

const lowerCap = (
  current: PMAllowedAutonomyLevel,
  next: PMAllowedAutonomyLevel,
): PMAllowedAutonomyLevel =>
  pmAutonomyRank[next] < pmAutonomyRank[current] ? next : current;

const makePolicyFinding = (
  findings: PMAutonomyPolicyFinding[],
  severity: PMFindingSeverity,
  reasonCode: string,
  safeMessage: string,
  path?: string,
  policyId?: PMAutonomyPolicyId,
  requestedAutonomyLevel?: PMAutonomyLevel,
  recommendedAutonomyLevel?: PMAutonomyLevel,
  metadata?: PMAutonomyPolicyFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(policyId ? { policyId } : {}),
    ...(requestedAutonomyLevel ? { requestedAutonomyLevel } : {}),
    ...(recommendedAutonomyLevel ? { recommendedAutonomyLevel } : {}),
    ...(metadata ? { metadata } : {}),
  });
};

export const makeAutonomyPolicyValidationResult = (
  findings: PMAutonomyPolicyFinding[],
  validationId = "autonomy_policy_validation:106I",
): PMAutonomyPolicyValidationResult => {
  const errors = findings.filter((finding) => finding.severity === "fail");
  const warnings = findings.filter((finding) => finding.severity === "warn");
  const futureGated = findings.some((finding) => finding.reasonCode.includes("FUTURE_GATED"));

  return {
    validationId,
    schemaVersion: "1.0",
    valid: errors.length === 0,
    status:
      errors.length > 0
        ? futureGated
          ? "future_gated"
          : "fail"
        : warnings.length > 0
          ? "warn"
          : "pass",
    findings,
    warnings,
    errors,
    advisoryOnly: true,
    sourceOnly: true,
    boundaries: pmFoundationBoundaries,
  };
};

export const evaluateAutonomyPolicy = (
  input: PMAutonomyPolicyInput,
): PMAutonomyPolicyResult => {
  const findings: PMAutonomyPolicyFinding[] = [];
  const policy = input.policy;
  let recommendedAutonomyLevel = policy.maxAllowedAutonomyLevel;

  if (!pmAllowedAutonomyLevels101To120.includes(policy.maxAllowedAutonomyLevel)) {
    recommendedAutonomyLevel = "L3_propose_only";
    makePolicyFinding(
      findings,
      "fail",
      "POLICY_CAP_EXCEEDS_101_120",
      "Phase 101-120 autonomy must not exceed observe/report/plan/propose.",
      "policy.maxAllowedAutonomyLevel",
      policy.policyId,
      input.requestedAutonomyLevel,
      recommendedAutonomyLevel,
    );
  }

  if (!autonomyLevelAtOrBelow(input.requestedAutonomyLevel, "L3_propose_only")) {
    makePolicyFinding(
      findings,
      "fail",
      "REQUESTED_AUTONOMY_FUTURE_GATED",
      "L4-L6 autonomy is future-gated and denied during Phase 101-120.",
      "requestedAutonomyLevel",
      policy.policyId,
      input.requestedAutonomyLevel,
      recommendedAutonomyLevel,
    );
  }

  input.risks?.forEach((risk, index) => {
    if (risk.severity === "high" || risk.severity === "critical") {
      recommendedAutonomyLevel = lowerCap(recommendedAutonomyLevel, "L3_propose_only");
      makePolicyFinding(
        findings,
        "warn",
        "RISK_CAPS_AUTONOMY",
        "High or critical risk keeps autonomy in planning/proposal metadata only.",
        `risks.${index}.severity`,
        policy.policyId,
        input.requestedAutonomyLevel,
        recommendedAutonomyLevel,
        { riskSeverity: risk.severity },
      );
    }
  });

  input.blockers?.forEach((blocker, index) => {
    if (["open", "watching", "blocked"].includes(blocker.status)) {
      recommendedAutonomyLevel = lowerCap(recommendedAutonomyLevel, "L3_propose_only");
      makePolicyFinding(
        findings,
        "warn",
        "BLOCKER_CAPS_AUTONOMY",
        "Open, watching, or blocked blockers keep autonomy in report/plan/propose metadata only.",
        `blockers.${index}.status`,
        policy.policyId,
        input.requestedAutonomyLevel,
        recommendedAutonomyLevel,
        { blockerStatus: blocker.status },
      );
    }
  });

  input.dodValidations?.forEach((dodValidation, index) => {
    if (!dodValidation.valid || dodValidation.status === "fail") {
      recommendedAutonomyLevel = lowerCap(recommendedAutonomyLevel, "L3_propose_only");
      makePolicyFinding(
        findings,
        "warn",
        "DOD_CAPS_AUTONOMY",
        "Failed DoD validation keeps autonomy in planning/proposal metadata only.",
        `dodValidations.${index}.status`,
        policy.policyId,
        input.requestedAutonomyLevel,
        recommendedAutonomyLevel,
        { dodStatus: dodValidation.status },
      );
    }
  });

  if (!autonomyLevelAtOrBelow(input.requestedAutonomyLevel, recommendedAutonomyLevel)) {
    makePolicyFinding(
      findings,
      "fail",
      "REQUESTED_AUTONOMY_ABOVE_RECOMMENDED_CAP",
      "Requested autonomy exceeds the advisory cap for this policy input.",
      "requestedAutonomyLevel",
      policy.policyId,
      input.requestedAutonomyLevel,
      recommendedAutonomyLevel,
    );
  }

  const validation = makeAutonomyPolicyValidationResult(
    findings,
    "autonomy_policy_evaluation:106I",
  );

  const decision: PMAutonomyDecision = {
    decisionId: "autonomy_decision:advisory:106I",
    status: validation.status,
    requestedAutonomyLevel: input.requestedAutonomyLevel,
    recommendedAutonomyLevel,
    maxAllowedAutonomyLevel: policy.maxAllowedAutonomyLevel,
    deniedAutonomyLevels: policy.deniedAutonomyLevels.slice(),
    safeSummary:
      "Source-only advisory autonomy decision; no execution, approval, job, runtime, or policy enforcement behavior.",
    findings: validation.findings.slice(),
    executionConstraints: policy.executionConstraints.map((constraint) => ({ ...constraint })),
    advisoryOnly: true,
    sourceOnly: true,
    noExecution: true,
    noPolicyEnforcement: true,
    noSelfApproval: true,
    boundaries: pmFoundationBoundaries,
  };

  return {
    ok: validation.valid,
    validation,
    decision,
    advisoryOnly: true,
    sourceOnly: true,
    noExecution: true,
    noPolicyEnforcement: true,
    noSelfApproval: true,
    boundaries: pmFoundationBoundaries,
  };
};
