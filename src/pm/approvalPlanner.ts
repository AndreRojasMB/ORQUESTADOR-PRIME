import { pmFoundationBoundaries } from "./boundaries.js";
import type {
  PMEvidenceReference,
  PMFindingSeverity,
} from "./types.js";
import type {
  PMApprovalEvidenceRequirement,
  PMApprovalFinding,
  PMApprovalGateType,
  PMApprovalPlan,
  PMApprovalPlanId,
  PMApprovalPlanInput,
  PMApprovalPlanResult,
  PMApprovalRequirement,
  PMApprovalRequirementId,
  PMApprovalRiskLevel,
  PMApprovalStatus,
  PMApprovalValidationResult,
  PMDualApprovalRequirement,
} from "./approvalTypes.js";

const MAX_TEXT_LENGTH = 1200;
const MAX_ID_LENGTH = 160;
const MAX_ARRAY_LENGTH = 120;

const supportedGateTypes = [
  "human_review",
  "maintainer_review",
  "security_review",
  "dual_approval",
  "release_review",
  "future_execution_gate",
] as const satisfies readonly PMApprovalGateType[];

const supportedApprovalStatuses = [
  "not_required",
  "required",
  "pending_metadata",
  "ready_for_human_review",
  "blocked",
  "future_only",
  "invalid",
] as const satisfies readonly PMApprovalStatus[];

const supportedRiskLevels = [
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly PMApprovalRiskLevel[];

const forbiddenContentPatterns: Array<{
  pattern: RegExp;
  reasonCode: string;
  safeMessage: string;
}> = [
  {
    pattern:
      /approveProposal|rejectProposal|dispatchAction|action\s+execution|proposal\s+execution|approval\s+execution/i,
    reasonCode: "FORBIDDEN_ACTION_APPROVAL_EXECUTION_REFERENCE",
    safeMessage:
      "Approval gate metadata must not include action/proposal/approval execution behavior.",
  },
  {
    pattern:
      /api\s*key|token|secret|hookToken|credential|raw\s+prompt|raw\s+provider\s+output/i,
    reasonCode: "FORBIDDEN_PRIVATE_CONTENT",
    safeMessage:
      "Approval gate metadata must not include secrets, tokens, credential wording, raw prompts, or raw provider output.",
  },
  {
    pattern:
      /npm\s+test|test\s+execution|CI\s+execution|write\s*File|append\s*File|fetch\s*\(|child[_-]process|exec\s*\(|spawn\s*\(/i,
    reasonCode: "FORBIDDEN_EXECUTION_TOKEN",
    safeMessage:
      "Approval gate metadata must not include test, CI, filesystem, network, or command execution tokens.",
  },
  {
    pattern:
      /src\/actions\/|src\/jobs\/|src\/runtime\/|src\/automation\/|dashboard\/|src\/scaffold\/|src\/connectors\//i,
    reasonCode: "FORBIDDEN_LIVE_ADJACENT_REFERENCE",
    safeMessage:
      "Approval gate metadata must not point at live-adjacent implementation surfaces.",
  },
  {
    pattern:
      /\bproduction-ready\b|\bproduction ready\b|\bfully autonomous\b|\bself-approve\b|\bdeploy now\b|\brun in prod\b/i,
    reasonCode: "FORBIDDEN_OVERCLAIM",
    safeMessage:
      "Approval gate metadata must not include production, full autonomy, self-approval, or deployment claims.",
  },
  {
    pattern:
      /\b(reads|writes|scans|executes|dispatches|approves|rejects|runs|mutates|persists|schedules|triggers|unlocks|bypasses)\s+(files|filesystem|repository|runtime|dashboard|automation|connector|store|jobs|actions|proposals|approval|approvals|workflow|memory|tests|CI|human approval)\b/i,
    reasonCode: "EXECUTABLE_BEHAVIOR_WORDING",
    safeMessage:
      "Approval gate metadata must not describe operational execution, approval, dispatch, scheduling, persistence, mutation, unlock, or bypass behavior.",
  },
  {
    pattern: /\b[A-Za-z]:\\|\/(?:home|users|tmp|mnt|var|etc)\//i,
    reasonCode: "ABSOLUTE_PATH_CONTENT",
    safeMessage: "Approval gate metadata must not require absolute local paths.",
  },
];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const safeStringValues = (value: unknown, acc: string[] = []): string[] => {
  if (typeof value === "string") {
    acc.push(value);
    return acc;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => safeStringValues(item, acc));
    return acc;
  }
  if (isObject(value)) {
    Object.values(value).forEach((item) => safeStringValues(item, acc));
  }
  return acc;
};

const addFinding = (
  findings: PMApprovalFinding[],
  severity: PMFindingSeverity,
  reasonCode: string,
  safeMessage: string,
  path?: string,
  approvalPlanId?: PMApprovalPlanId,
  requirementId?: PMApprovalRequirementId,
  metadata?: PMApprovalFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(approvalPlanId ? { approvalPlanId } : {}),
    ...(requirementId ? { requirementId } : {}),
    ...(metadata ? { metadata } : {}),
  });
};

const makeValidationResult = (
  findings: PMApprovalFinding[],
  validationId = "approval_plan_validation:107I",
): PMApprovalValidationResult => {
  const errors = findings.filter((finding) => finding.severity === "fail");
  const warnings = findings.filter((finding) => finding.severity === "warn");

  return {
    validationId,
    schemaVersion: "1.0",
    valid: errors.length === 0,
    status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass",
    findings,
    warnings,
    errors,
    advisoryOnly: true,
    sourceOnly: true,
    boundaries: pmFoundationBoundaries,
  };
};

const checkForbiddenContent = (
  value: unknown,
  findings: PMApprovalFinding[],
): void => {
  safeStringValues(value).forEach((text) => {
    forbiddenContentPatterns.forEach(({ pattern, reasonCode, safeMessage }) => {
      if (pattern.test(text)) {
        addFinding(findings, "fail", reasonCode, safeMessage);
      }
    });
  });
};

const checkText = (
  value: unknown,
  findings: PMApprovalFinding[],
  path: string,
  required = false,
  maxLength = MAX_TEXT_LENGTH,
  approvalPlanId?: PMApprovalPlanId,
  requirementId?: PMApprovalRequirementId,
): void => {
  if (typeof value !== "string" || !value.trim()) {
    if (required) {
      addFinding(
        findings,
        "fail",
        "REQUIRED_TEXT_MISSING",
        "Required approval gate text fields must be present and non-empty.",
        path,
        approvalPlanId,
        requirementId,
      );
    }
    return;
  }

  if (value !== value.trim()) {
    addFinding(
      findings,
      "fail",
      "TEXT_NOT_TRIMMED",
      "Approval gate identifiers and bounded text fields must be trimmed.",
      path,
      approvalPlanId,
      requirementId,
    );
  }

  if (value.length > maxLength) {
    addFinding(
      findings,
      "fail",
      "TEXT_TOO_LONG",
      "Approval gate text exceeds the bounded length limit.",
      path,
      approvalPlanId,
      requirementId,
      { maxLength },
    );
  }
};

const checkArray = (
  value: unknown,
  findings: PMApprovalFinding[],
  path: string,
  required = true,
): void => {
  if (!Array.isArray(value)) {
    if (required) {
      addFinding(
        findings,
        "fail",
        "REQUIRED_ARRAY_MISSING",
        "Approval gate arrays must be present.",
        path,
      );
    }
    return;
  }

  if (value.length > MAX_ARRAY_LENGTH) {
    addFinding(
      findings,
      "fail",
      "ARRAY_TOO_LONG",
      "Approval gate arrays must stay within bounded metadata limits.",
      path,
      undefined,
      undefined,
      { maxItems: MAX_ARRAY_LENGTH },
    );
  }
};

const checkEvidenceRefs = (
  refs: unknown,
  findings: PMApprovalFinding[],
  path: string,
  approvalPlanId?: PMApprovalPlanId,
  requirementId?: PMApprovalRequirementId,
): PMEvidenceReference[] => {
  if (!Array.isArray(refs)) {
    addFinding(
      findings,
      "fail",
      "EVIDENCE_REFS_ARRAY_REQUIRED",
      "Evidence refs must be provided as bounded metadata arrays.",
      path,
      approvalPlanId,
      requirementId,
    );
    return [];
  }

  if (refs.length > MAX_ARRAY_LENGTH) {
    addFinding(
      findings,
      "fail",
      "EVIDENCE_REFS_TOO_LONG",
      "Evidence refs must stay within bounded metadata limits.",
      path,
      approvalPlanId,
      requirementId,
      { maxItems: MAX_ARRAY_LENGTH },
    );
  }

  refs.forEach((ref, index) => {
    if (!isObject(ref) || ref.metadataOnly !== true || ref.noFileRead !== true) {
      addFinding(
        findings,
        "fail",
        "EVIDENCE_REF_NOT_METADATA_ONLY",
        "Evidence refs must be metadata-only and must not read files.",
        `${path}.${index}`,
        approvalPlanId,
        requirementId,
      );
      return;
    }
    checkText(ref.evidenceId, findings, `${path}.${index}.evidenceId`, true, MAX_ID_LENGTH, approvalPlanId, requirementId);
    checkText(ref.label, findings, `${path}.${index}.label`, true, MAX_TEXT_LENGTH, approvalPlanId, requirementId);
    checkText(ref.reference, findings, `${path}.${index}.reference`, true, MAX_TEXT_LENGTH, approvalPlanId, requirementId);
    checkText(ref.safeSummary, findings, `${path}.${index}.safeSummary`, true, MAX_TEXT_LENGTH, approvalPlanId, requirementId);
  });

  return refs.filter((ref): ref is PMEvidenceReference => isObject(ref)) as PMEvidenceReference[];
};

const validateEvidenceRequirement = (
  requirement: unknown,
  index: number,
  findings: PMApprovalFinding[],
  pathPrefix: string,
  approvalPlanId?: PMApprovalPlanId,
  requirementId?: PMApprovalRequirementId,
): requirement is PMApprovalEvidenceRequirement => {
  const path = `${pathPrefix}.${index}`;
  if (!isObject(requirement)) {
    addFinding(
      findings,
      "fail",
      "EVIDENCE_REQUIREMENT_NOT_OBJECT",
      "Approval evidence requirements must be metadata objects.",
      path,
      approvalPlanId,
      requirementId,
    );
    return false;
  }

  checkText(requirement.evidenceRequirementId, findings, `${path}.evidenceRequirementId`, true, MAX_ID_LENGTH, approvalPlanId, requirementId);
  checkText(requirement.label, findings, `${path}.label`, true, MAX_TEXT_LENGTH, approvalPlanId, requirementId);
  checkText(requirement.safeSummary, findings, `${path}.safeSummary`, true, MAX_TEXT_LENGTH, approvalPlanId, requirementId);

  if (typeof requirement.required !== "boolean") {
    addFinding(
      findings,
      "fail",
      "EVIDENCE_REQUIREMENT_REQUIRED_FLAG_INVALID",
      "Approval evidence requirements must explicitly state whether they are required.",
      `${path}.required`,
      approvalPlanId,
      requirementId,
    );
  }

  if (
    requirement.metadataOnly !== true ||
    requirement.noFileRead !== true ||
    requirement.noApprovalExecution !== true
  ) {
    addFinding(
      findings,
      "fail",
      "EVIDENCE_REQUIREMENT_NOT_METADATA_ONLY",
      "Approval evidence requirements must remain metadata-only with no file read or approval execution.",
      path,
      approvalPlanId,
      requirementId,
    );
  }

  const evidenceRefs = checkEvidenceRefs(
    requirement.evidenceRefs,
    findings,
    `${path}.evidenceRefs`,
    approvalPlanId,
    requirementId,
  );
  if (requirement.required === true && evidenceRefs.length === 0) {
    addFinding(
      findings,
      "fail",
      "REQUIRED_EVIDENCE_MISSING",
      "Required approval evidence must include at least one metadata-only evidence ref.",
      `${path}.evidenceRefs`,
      approvalPlanId,
      requirementId,
    );
  }

  return true;
};

const validateDualApprovalRequirement = (
  requirement: unknown,
  findings: PMApprovalFinding[],
  path: string,
  approvalPlanId?: PMApprovalPlanId,
  requirementId?: PMApprovalRequirementId,
): requirement is PMDualApprovalRequirement => {
  if (!isObject(requirement)) {
    addFinding(
      findings,
      "fail",
      "DUAL_APPROVAL_REQUIRED",
      "Critical risk requires dual approval metadata.",
      path,
      approvalPlanId,
      requirementId,
    );
    return false;
  }

  checkText(requirement.dualApprovalRequirementId, findings, `${path}.dualApprovalRequirementId`, true, MAX_ID_LENGTH, approvalPlanId, requirementId);
  checkText(requirement.label, findings, `${path}.label`, true, MAX_TEXT_LENGTH, approvalPlanId, requirementId);
  checkText(requirement.safeSummary, findings, `${path}.safeSummary`, true, MAX_TEXT_LENGTH, approvalPlanId, requirementId);
  checkText(requirement.primaryReviewerRole, findings, `${path}.primaryReviewerRole`, true, MAX_ID_LENGTH, approvalPlanId, requirementId);
  checkText(requirement.secondaryReviewerRole, findings, `${path}.secondaryReviewerRole`, true, MAX_ID_LENGTH, approvalPlanId, requirementId);
  checkArray(requirement.evidenceRequirements, findings, `${path}.evidenceRequirements`);

  if (
    requirement.required !== true ||
    requirement.independentReviewerRequired !== true ||
    requirement.metadataOnly !== true ||
    requirement.noSecondApprovalPersistence !== true ||
    requirement.noApprovalExecution !== true ||
    requirement.noSelfApproval !== true
  ) {
    addFinding(
      findings,
      "fail",
      "DUAL_APPROVAL_NOT_METADATA_ONLY",
      "Dual approval metadata must be required, independent, metadata-only, non-persistent, non-executing, and no self-approval.",
      path,
      approvalPlanId,
      requirementId,
    );
  }

  if (
    typeof requirement.primaryReviewerRole === "string" &&
    requirement.primaryReviewerRole === requirement.secondaryReviewerRole
  ) {
    addFinding(
      findings,
      "fail",
      "DUAL_APPROVAL_REVIEWERS_NOT_INDEPENDENT",
      "Dual approval metadata requires different primary and secondary reviewer roles.",
      `${path}.secondaryReviewerRole`,
      approvalPlanId,
      requirementId,
    );
  }

  if (Array.isArray(requirement.evidenceRequirements)) {
    requirement.evidenceRequirements.forEach((evidenceRequirement, index) =>
      validateEvidenceRequirement(
        evidenceRequirement,
        index,
        findings,
        `${path}.evidenceRequirements`,
        approvalPlanId,
        requirementId,
      ),
    );
  }

  return true;
};

const validateRequirement = (
  requirement: unknown,
  index: number,
  findings: PMApprovalFinding[],
  approvalPlanId?: PMApprovalPlanId,
): requirement is PMApprovalRequirement => {
  if (!isObject(requirement)) {
    addFinding(
      findings,
      "fail",
      "APPROVAL_REQUIREMENT_NOT_OBJECT",
      "Approval requirements must be metadata objects.",
      `requirements.${index}`,
      approvalPlanId,
    );
    return false;
  }

  const requirementId = typeof requirement.requirementId === "string" ? requirement.requirementId : undefined;
  checkText(requirement.requirementId, findings, `requirements.${index}.requirementId`, true, MAX_ID_LENGTH, approvalPlanId, requirementId);
  checkText(requirement.reviewerRole, findings, `requirements.${index}.reviewerRole`, true, MAX_ID_LENGTH, approvalPlanId, requirementId);
  checkText(requirement.subjectRef, findings, `requirements.${index}.subjectRef`, true, MAX_ID_LENGTH, approvalPlanId, requirementId);
  checkText(requirement.safeSummary, findings, `requirements.${index}.safeSummary`, true, MAX_TEXT_LENGTH, approvalPlanId, requirementId);
  checkText(requirement.requesterRole, findings, `requirements.${index}.requesterRole`, false, MAX_ID_LENGTH, approvalPlanId, requirementId);
  checkText(requirement.approverRole, findings, `requirements.${index}.approverRole`, false, MAX_ID_LENGTH, approvalPlanId, requirementId);
  checkArray(requirement.taskIds, findings, `requirements.${index}.taskIds`);
  checkArray(requirement.evidenceRequirements, findings, `requirements.${index}.evidenceRequirements`);

  if (!supportedGateTypes.includes(requirement.gateType as PMApprovalGateType)) {
    addFinding(
      findings,
      "fail",
      "APPROVAL_GATE_TYPE_UNSUPPORTED",
      "Approval gate type must use supported advisory values.",
      `requirements.${index}.gateType`,
      approvalPlanId,
      requirementId,
    );
  }

  if (!supportedApprovalStatuses.includes(requirement.status as PMApprovalStatus)) {
    addFinding(
      findings,
      "fail",
      "APPROVAL_STATUS_UNSUPPORTED",
      "Approval status must use supported advisory values.",
      `requirements.${index}.status`,
      approvalPlanId,
      requirementId,
    );
  }

  if (!supportedRiskLevels.includes(requirement.riskLevel as PMApprovalRiskLevel)) {
    addFinding(
      findings,
      "fail",
      "APPROVAL_RISK_LEVEL_UNSUPPORTED",
      "Approval risk level must use supported advisory values.",
      `requirements.${index}.riskLevel`,
      approvalPlanId,
      requirementId,
    );
  }

  if (
    (requirement.riskLevel === "high" || requirement.riskLevel === "critical") &&
    requirement.status === "not_required"
  ) {
    addFinding(
      findings,
      "fail",
      "HIGH_OR_CRITICAL_RISK_REQUIRES_APPROVAL_METADATA",
      "High and critical risk approval requirements must carry approval metadata.",
      `requirements.${index}.status`,
      approvalPlanId,
      requirementId,
    );
  }
  if (requirement.gateType === "future_execution_gate" && requirement.status !== "future_only") {
    addFinding(
      findings,
      "fail",
      "EXECUTION_GATE_MUST_BE_FUTURE_ONLY",
      "Execution approval gates remain future-only in Phase 107I.",
      `requirements.${index}.status`,
      approvalPlanId,
      requirementId,
    );
  }

  if (
    typeof requirement.requesterRole === "string" &&
    typeof requirement.approverRole === "string" &&
    requirement.requesterRole === requirement.approverRole
  ) {
    addFinding(
      findings,
      "fail",
      "SELF_APPROVAL_INVALID",
      "Approval gate metadata must not allow self-approval.",
      `requirements.${index}.approverRole`,
      approvalPlanId,
      requirementId,
    );
  }

  if (
    requirement.metadataOnly !== true ||
    requirement.advisoryOnly !== true ||
    requirement.noApprovalCreation !== true ||
    requirement.noApprovalExecution !== true ||
    requirement.noActionDispatch !== true ||
    requirement.noProposalStoreWrites !== true ||
    requirement.noSelfApproval !== true
  ) {
    addFinding(
      findings,
      "fail",
      "APPROVAL_REQUIREMENT_NOT_METADATA_ONLY",
      "Approval requirements must remain metadata-only, advisory, non-executing, and no store writes.",
      `requirements.${index}`,
      approvalPlanId,
      requirementId,
    );
  }

  if (Array.isArray(requirement.evidenceRequirements)) {
    requirement.evidenceRequirements.forEach((evidenceRequirement, evidenceIndex) =>
      validateEvidenceRequirement(
        evidenceRequirement,
        evidenceIndex,
        findings,
        `requirements.${index}.evidenceRequirements`,
        approvalPlanId,
        requirementId,
      ),
    );
  }

  if (requirement.riskLevel === "critical") {
    validateDualApprovalRequirement(
      requirement.dualApprovalRequirement,
      findings,
      `requirements.${index}.dualApprovalRequirement`,
      approvalPlanId,
      requirementId,
    );
  }

  return true;
};

const validatePlanObject = (
  plan: unknown,
  findings: PMApprovalFinding[],
): plan is PMApprovalPlan => {
  if (!isObject(plan)) {
    addFinding(
      findings,
      "fail",
      "APPROVAL_PLAN_NOT_OBJECT",
      "Approval plan input must be a metadata object.",
    );
    return false;
  }

  const approvalPlanId = typeof plan.approvalPlanId === "string" ? plan.approvalPlanId : undefined;
  checkText(plan.approvalPlanId, findings, "approvalPlanId", true, MAX_ID_LENGTH, approvalPlanId);
  checkText(plan.label, findings, "label", true, MAX_TEXT_LENGTH, approvalPlanId);
  checkText(plan.safeSummary, findings, "safeSummary", true, MAX_TEXT_LENGTH, approvalPlanId);
  checkText(plan.phaseRef, findings, "phaseRef", false, MAX_ID_LENGTH, approvalPlanId);
  checkArray(plan.requirements, findings, "requirements");
  checkArray(plan.assumptions, findings, "assumptions");
  checkArray(plan.exclusions, findings, "exclusions");

  if (plan.schemaVersion !== "1.0") {
    addFinding(
      findings,
      "fail",
      "SCHEMA_VERSION_INVALID",
      "Approval plan schemaVersion must be 1.0.",
      "schemaVersion",
      approvalPlanId,
    );
  }

  if (!supportedRiskLevels.includes(plan.riskLevel as PMApprovalRiskLevel)) {
    addFinding(
      findings,
      "fail",
      "APPROVAL_PLAN_RISK_LEVEL_UNSUPPORTED",
      "Approval plan risk level must use supported advisory values.",
      "riskLevel",
      approvalPlanId,
    );
  }

  if (
    plan.metadataOnly !== true ||
    plan.advisoryOnly !== true ||
    plan.sourceOnly !== true ||
    plan.noApprovalCreation !== true ||
    plan.noApprovalExecution !== true ||
    plan.noActionDispatch !== true ||
    plan.noProposalStoreWrites !== true ||
    plan.noJobsExecution !== true ||
    plan.noSelfApproval !== true
  ) {
    addFinding(
      findings,
      "fail",
      "APPROVAL_PLAN_NOT_SOURCE_ONLY_ADVISORY",
      "Approval plans must remain metadata-only, advisory, source-only, non-executing, no store writes, and no self-approval.",
      undefined,
      approvalPlanId,
    );
  }

  const boundaries = isObject(plan.boundaries) ? plan.boundaries : undefined;
  const missingBoundary = Object.keys(pmFoundationBoundaries).some(
    (key) => boundaries?.[key] !== true,
  );
  if (!boundaries || missingBoundary) {
    addFinding(
      findings,
      "fail",
      "BOUNDARIES_REQUIRED",
      "Approval plans must include all PM foundation boundaries.",
      "boundaries",
      approvalPlanId,
    );
  }

  const seenRequirementIds = new Set<PMApprovalRequirementId>();
  if (Array.isArray(plan.requirements)) {
    plan.requirements.forEach((requirement, index) => {
      if (validateRequirement(requirement, index, findings, approvalPlanId)) {
        if (seenRequirementIds.has(requirement.requirementId)) {
          addFinding(
            findings,
            "fail",
            "APPROVAL_REQUIREMENT_ID_DUPLICATE",
            "Approval requirement ids must be unique.",
            `requirements.${index}.requirementId`,
            approvalPlanId,
            requirement.requirementId,
          );
        }
        seenRequirementIds.add(requirement.requirementId);
      }
    });
  }

  if (
    (plan.riskLevel === "high" || plan.riskLevel === "critical") &&
    (!Array.isArray(plan.requirements) || plan.requirements.length === 0)
  ) {
    addFinding(
      findings,
      "fail",
      "HIGH_RISK_REQUIRES_APPROVAL_METADATA",
      "High and critical risk approval plans require approval metadata.",
      "requirements",
      approvalPlanId,
    );
  }

  if (
    plan.riskLevel === "critical" &&
    Array.isArray(plan.requirements) &&
    !plan.requirements.some((requirement) =>
      isObject(requirement) && isObject(requirement.dualApprovalRequirement),
    )
  ) {
    addFinding(
      findings,
      "fail",
      "CRITICAL_RISK_REQUIRES_DUAL_APPROVAL_METADATA",
      "Critical risk approval plans require dual approval metadata.",
      "requirements",
      approvalPlanId,
    );
  }

  return true;
};

export const validateApprovalPlan = (input: unknown): PMApprovalValidationResult => {
  const findings: PMApprovalFinding[] = [];
  checkForbiddenContent(input, findings);
  validatePlanObject(input, findings);
  return makeValidationResult(findings);
};

const makeDefaultEvidenceRequirement = (required: boolean): PMApprovalEvidenceRequirement => ({
  evidenceRequirementId: "approval_evidence:human_review_metadata",
  label: "Human review evidence metadata",
  safeSummary:
    "Metadata-only evidence reference required before any future approval integration.",
  required,
  evidenceRefs: [],
  metadataOnly: true,
  noFileRead: true,
  noApprovalExecution: true,
});

const makeRequirement = (
  input: PMApprovalPlanInput,
): PMApprovalRequirement => {
  const riskLevel = input.riskLevel;
  const critical = riskLevel === "critical";
  const highOrCritical = riskLevel === "high" || critical;
  const gateType: PMApprovalGateType = critical ? "dual_approval" : highOrCritical ? "human_review" : "human_review";
  const evidenceRequirement = makeDefaultEvidenceRequirement(highOrCritical);

  return {
    requirementId: `approval_requirement:${riskLevel}:107I`,
    gateType,
    status: highOrCritical ? "pending_metadata" : "not_required",
    riskLevel,
    reviewerRole: critical ? "maintainer+security" : "human_reviewer",
    subjectRef: input.phaseRef ?? "phase:107I",
    safeSummary:
      highOrCritical
        ? "Risk level requires approval metadata before future execution-capable planning."
        : "Risk level does not require an approval gate; human review metadata remains advisory.",
    ...(input.phaseRef ? { phaseRef: input.phaseRef } : {}),
    taskIds: [],
    evidenceRequirements: [evidenceRequirement],
    ...(critical
      ? {
          dualApprovalRequirement: {
            dualApprovalRequirementId: "dual_approval:critical_risk:107I",
            label: "Critical risk dual approval metadata",
            safeSummary:
              "Critical risk requires independent second approval metadata only; no second approval persistence is created.",
            required: true,
            primaryReviewerRole: "maintainer",
            secondaryReviewerRole: "security_reviewer",
            independentReviewerRequired: true,
            evidenceRequirements: [evidenceRequirement],
            metadataOnly: true,
            noSecondApprovalPersistence: true,
            noApprovalExecution: true,
            noSelfApproval: true,
          },
        }
      : {}),
    metadataOnly: true,
    advisoryOnly: true,
    noApprovalCreation: true,
    noApprovalExecution: true,
    noActionDispatch: true,
    noProposalStoreWrites: true,
    noSelfApproval: true,
  };
};

export const buildApprovalPlan = (input: PMApprovalPlanInput): PMApprovalPlanResult => {
  const requirements = input.requirements ?? [makeRequirement(input)];
  const plan: PMApprovalPlan = {
    approvalPlanId: input.approvalPlanId?.trim() || "approval_plan:advisory:107I",
    schemaVersion: "1.0",
    label: input.label?.trim() || "Advisory PM approval gate plan",
    safeSummary:
      input.safeSummary?.trim() ||
      "Source-only advisory approval gate contract; no approval creation, execution, action dispatch, or proposal store writes.",
    ...(input.phaseRef ? { phaseRef: input.phaseRef } : {}),
    riskLevel: input.riskLevel,
    requirements: requirements.map((requirement) => ({
      ...requirement,
      taskIds: requirement.taskIds.slice(),
      evidenceRequirements: requirement.evidenceRequirements.map((evidenceRequirement) => ({
        ...evidenceRequirement,
        evidenceRefs: evidenceRequirement.evidenceRefs.map((evidence) => ({ ...evidence })),
      })),
      ...(requirement.dualApprovalRequirement
        ? {
            dualApprovalRequirement: {
              ...requirement.dualApprovalRequirement,
              evidenceRequirements:
                requirement.dualApprovalRequirement.evidenceRequirements.map((evidenceRequirement) => ({
                  ...evidenceRequirement,
                  evidenceRefs: evidenceRequirement.evidenceRefs.map((evidence) => ({ ...evidence })),
                })),
            },
          }
        : {}),
    })),
    assumptions: input.assumptions?.slice() ?? [],
    exclusions: input.exclusions?.slice() ?? [],
    metadataOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noApprovalCreation: true,
    noApprovalExecution: true,
    noActionDispatch: true,
    noProposalStoreWrites: true,
    noJobsExecution: true,
    noSelfApproval: true,
    boundaries: pmFoundationBoundaries,
  };

  const validation = validateApprovalPlan(plan);
  if (!validation.valid) {
    return {
      ok: false,
      status: "input_invalid",
      validation,
      advisoryOnly: true,
      sourceOnly: true,
      noApprovalCreation: true,
      noApprovalExecution: true,
      noActionDispatch: true,
      noProposalStoreWrites: true,
      boundaries: pmFoundationBoundaries,
    };
  }

  return {
    ok: true,
    status: "plan_built",
    plan,
    validation,
    advisoryOnly: true,
    sourceOnly: true,
    noApprovalCreation: true,
    noApprovalExecution: true,
    noActionDispatch: true,
    noProposalStoreWrites: true,
    boundaries: pmFoundationBoundaries,
  };
};
