import {
  pmAllowedAutonomyLevels101To120,
  pmDeniedAutonomyLevels101To120,
  pmFoundationBoundaries,
} from "./boundaries.js";
import type {
  PMAllowedAutonomyLevel,
  PMAutonomyLevel,
  PMFindingSeverity,
} from "./types.js";
import {
  autonomyLevelAtOrBelow,
  makeAutonomyPolicyValidationResult,
  pmAutonomyLevels,
  type PMAutonomyPolicy,
  type PMAutonomyPolicyFinding,
  type PMAutonomyPolicyInput,
  type PMAutonomyPolicyValidationResult,
  type PMExecutionConstraint,
} from "./autonomyPolicy.js";

const MAX_TEXT_LENGTH = 1200;
const MAX_ID_LENGTH = 160;
const MAX_ARRAY_LENGTH = 120;

const forbiddenContentPatterns: Array<{
  pattern: RegExp;
  reasonCode: string;
  safeMessage: string;
}> = [
  {
    pattern:
      /api\s*key|token|secret|hookToken|credential|raw\s+prompt|raw\s+provider\s+output/i,
    reasonCode: "FORBIDDEN_PRIVATE_CONTENT",
    safeMessage:
      "Autonomy policy metadata must not include secrets, tokens, credential wording, raw prompts, or raw provider output.",
  },
  {
    pattern:
      /npm\s+test|test\s+execution|CI\s+execution|write\s*File|append\s*File|fetch\s*\(|child[_-]process|exec\s*\(|spawn\s*\(/i,
    reasonCode: "FORBIDDEN_EXECUTION_TOKEN",
    safeMessage:
      "Autonomy policy metadata must not include test, CI, filesystem, network, or command execution tokens.",
  },
  {
    pattern:
      /dashboard\/|src\/runtime\/|src\/scaffold\/|src\/connectors\/|src\/actions\/|src\/jobs\/|src\/automation\//i,
    reasonCode: "FORBIDDEN_LIVE_ADJACENT_REFERENCE",
    safeMessage:
      "Autonomy policy metadata must not point at live-adjacent implementation surfaces.",
  },
  {
    pattern:
      /\bproduction-ready\b|\bproduction ready\b|\bfully autonomous\b|\bself-approve\b|\bdeploy now\b|\brun in prod\b/i,
    reasonCode: "FORBIDDEN_OVERCLAIM",
    safeMessage:
      "Autonomy policy metadata must not include production, full autonomy, self-approval, or deployment claims.",
  },
  {
    pattern:
      /\b(reads|writes|scans|executes|dispatches|approves|runs|mutates|persists|schedules|triggers|unlocks|bypasses)\s+(files|filesystem|repository|runtime|dashboard|automation|connector|store|jobs|actions|approval|workflow|memory|tests|CI|human approval)\b/i,
    reasonCode: "EXECUTABLE_BEHAVIOR_WORDING",
    safeMessage:
      "Autonomy policy metadata must not describe operational execution, scheduling, persistence, mutation, unlock, or bypass behavior.",
  },
  {
    pattern: /\b[A-Za-z]:\\|\/(?:home|users|tmp|mnt|var|etc)\//i,
    reasonCode: "ABSOLUTE_PATH_CONTENT",
    safeMessage: "Autonomy policy metadata must not require absolute local paths.",
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
  findings: PMAutonomyPolicyFinding[],
  severity: PMFindingSeverity,
  reasonCode: string,
  safeMessage: string,
  path?: string,
  policyId?: string,
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

const checkForbiddenContent = (
  value: unknown,
  findings: PMAutonomyPolicyFinding[],
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
  findings: PMAutonomyPolicyFinding[],
  path: string,
  required = false,
  maxLength = MAX_TEXT_LENGTH,
  policyId?: string,
): void => {
  if (typeof value !== "string" || !value.trim()) {
    if (required) {
      addFinding(
        findings,
        "fail",
        "REQUIRED_TEXT_MISSING",
        "Required autonomy policy text fields must be present and non-empty.",
        path,
        policyId,
      );
    }
    return;
  }

  if (value !== value.trim()) {
    addFinding(
      findings,
      "fail",
      "TEXT_NOT_TRIMMED",
      "Autonomy policy identifiers and bounded text fields must be trimmed.",
      path,
      policyId,
    );
  }

  if (value.length > maxLength) {
    addFinding(
      findings,
      "fail",
      "TEXT_TOO_LONG",
      "Autonomy policy text exceeds the bounded length limit.",
      path,
      policyId,
      undefined,
      undefined,
      { maxLength },
    );
  }
};

const checkArray = (
  value: unknown,
  findings: PMAutonomyPolicyFinding[],
  path: string,
  required = true,
): void => {
  if (!Array.isArray(value)) {
    if (required) {
      addFinding(
        findings,
        "fail",
        "REQUIRED_ARRAY_MISSING",
        "Autonomy policy arrays must be present.",
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
      "Autonomy policy arrays must stay within bounded metadata limits.",
      path,
      undefined,
      undefined,
      undefined,
      { maxItems: MAX_ARRAY_LENGTH },
    );
  }
};

const checkExecutionConstraint = (
  constraint: unknown,
  index: number,
  findings: PMAutonomyPolicyFinding[],
  policyId?: string,
): constraint is PMExecutionConstraint => {
  if (!isObject(constraint)) {
    addFinding(
      findings,
      "fail",
      "EXECUTION_CONSTRAINT_NOT_OBJECT",
      "Execution constraints must be metadata objects.",
      `executionConstraints.${index}`,
      policyId,
    );
    return false;
  }

  checkText(constraint.constraintId, findings, `executionConstraints.${index}.constraintId`, true, MAX_ID_LENGTH, policyId);
  checkText(constraint.label, findings, `executionConstraints.${index}.label`, true, MAX_TEXT_LENGTH, policyId);
  checkText(constraint.safeSummary, findings, `executionConstraints.${index}.safeSummary`, true, MAX_TEXT_LENGTH, policyId);

  [
    "metadataOnly",
    "noExecution",
    "noApprovalExecution",
    "noJobsExecution",
    "noRuntimeExecution",
    "noDashboardExecution",
    "noConnectorExecution",
    "noWorkflowMutation",
    "noFilesystemMutation",
  ].forEach((key) => {
    if (constraint[key] !== true) {
      addFinding(
        findings,
        "fail",
        "EXECUTION_CONSTRAINT_FLAG_REQUIRED",
        "Execution constraints must remain metadata-only with all non-execution flags set to true.",
        `executionConstraints.${index}.${key}`,
        policyId,
      );
    }
  });

  return true;
};

const checkBoundaries = (
  value: unknown,
  findings: PMAutonomyPolicyFinding[],
  path: string,
  policyId?: string,
): void => {
  const boundaries = isObject(value) ? value : undefined;
  const missingBoundary = Object.keys(pmFoundationBoundaries).some(
    (key) => boundaries?.[key] !== true,
  );
  if (!boundaries || missingBoundary) {
    addFinding(
      findings,
      "fail",
      "BOUNDARIES_REQUIRED",
      "Autonomy policy metadata must include all PM foundation boundaries.",
      path,
      policyId,
    );
  }
};

const validatePolicyObject = (
  policy: unknown,
  findings: PMAutonomyPolicyFinding[],
): policy is PMAutonomyPolicy => {
  if (!isObject(policy)) {
    addFinding(
      findings,
      "fail",
      "POLICY_NOT_OBJECT",
      "Autonomy policy input must be a metadata object.",
    );
    return false;
  }

  const policyId = typeof policy.policyId === "string" ? policy.policyId : undefined;
  checkText(policy.policyId, findings, "policyId", true, MAX_ID_LENGTH, policyId);
  checkText(policy.label, findings, "label", true, MAX_TEXT_LENGTH, policyId);
  checkText(policy.safeSummary, findings, "safeSummary", true, MAX_TEXT_LENGTH, policyId);
  checkArray(policy.deniedAutonomyLevels, findings, "deniedAutonomyLevels");
  checkArray(policy.riskRules, findings, "riskRules");
  checkArray(policy.blockerRules, findings, "blockerRules");
  checkArray(policy.dodRules, findings, "dodRules");
  checkArray(policy.executionConstraints, findings, "executionConstraints");

  if (policy.schemaVersion !== "1.0") {
    addFinding(
      findings,
      "fail",
      "SCHEMA_VERSION_INVALID",
      "Autonomy policy schemaVersion must be 1.0.",
      "schemaVersion",
      policyId,
    );
  }

  if (policy.phaseWindow !== "101-120") {
    addFinding(
      findings,
      "fail",
      "PHASE_WINDOW_UNSUPPORTED",
      "Phase 106I only supports the source-only advisory 101-120 phase window.",
      "phaseWindow",
      policyId,
    );
  }

  if (!pmAutonomyLevels.includes(policy.maxAllowedAutonomyLevel as PMAutonomyLevel)) {
    addFinding(
      findings,
      "fail",
      "MAX_AUTONOMY_UNKNOWN",
      "Max autonomy level must be a known PM autonomy level.",
      "maxAllowedAutonomyLevel",
      policyId,
    );
  } else if (!pmAllowedAutonomyLevels101To120.includes(policy.maxAllowedAutonomyLevel as PMAllowedAutonomyLevel)) {
    addFinding(
      findings,
      "fail",
      "MAX_AUTONOMY_EXCEEDS_101_120",
      "Max autonomy during Phase 101-120 must not exceed L3_propose_only.",
      "maxAllowedAutonomyLevel",
      policyId,
      policy.maxAllowedAutonomyLevel as PMAutonomyLevel,
      "L3_propose_only",
    );
  }

  if (Array.isArray(policy.deniedAutonomyLevels)) {
    policy.deniedAutonomyLevels.forEach((level, index) => {
      if (!pmAutonomyLevels.includes(level as PMAutonomyLevel)) {
        addFinding(
          findings,
          "fail",
          "DENIED_AUTONOMY_UNKNOWN",
          "Denied autonomy levels must be known PM autonomy levels.",
          `deniedAutonomyLevels.${index}`,
          policyId,
        );
        return;
      }
      if ((pmDeniedAutonomyLevels101To120 as readonly PMAutonomyLevel[]).includes(level as PMAutonomyLevel)) {
        addFinding(
          findings,
          "warn",
          "DENIED_AUTONOMY_FUTURE_GATED",
          "L4-L6 autonomy is future-gated and denied during Phase 101-120.",
          `deniedAutonomyLevels.${index}`,
          policyId,
          level as PMAutonomyLevel,
          "L3_propose_only",
        );
      }
    });
  }

  if (
    policy.metadataOnly !== true ||
    policy.advisoryOnly !== true ||
    policy.sourceOnly !== true ||
    policy.noExecution !== true ||
    policy.noPolicyEnforcement !== true ||
    policy.noSelfApproval !== true
  ) {
    addFinding(
      findings,
      "fail",
      "POLICY_NOT_SOURCE_ONLY_ADVISORY",
      "Autonomy policy must remain metadata-only, advisory, source-only, non-enforcing, and non-self-approving.",
      undefined,
      policyId,
    );
  }

  if (Array.isArray(policy.executionConstraints)) {
    policy.executionConstraints.forEach((constraint, index) =>
      checkExecutionConstraint(constraint, index, findings, policyId),
    );
  }

  checkBoundaries(policy.boundaries, findings, "boundaries", policyId);

  return true;
};

export const validateAutonomyPolicy = (input: unknown): PMAutonomyPolicyValidationResult => {
  const findings: PMAutonomyPolicyFinding[] = [];
  checkForbiddenContent(input, findings);
  validatePolicyObject(input, findings);
  return makeAutonomyPolicyValidationResult(findings);
};

export const validateAutonomyPolicyInput = (
  input: unknown,
): PMAutonomyPolicyValidationResult => {
  const findings: PMAutonomyPolicyFinding[] = [];
  checkForbiddenContent(input, findings);

  if (!isObject(input)) {
    addFinding(
      findings,
      "fail",
      "POLICY_INPUT_NOT_OBJECT",
      "Autonomy policy input must be a metadata object.",
    );
    return makeAutonomyPolicyValidationResult(findings, "autonomy_policy_input_validation:106I");
  }

  validatePolicyObject(input.policy, findings);

  if (!pmAutonomyLevels.includes(input.requestedAutonomyLevel as PMAutonomyLevel)) {
    addFinding(
      findings,
      "fail",
      "REQUESTED_AUTONOMY_UNKNOWN",
      "Requested autonomy level must be known.",
      "requestedAutonomyLevel",
    );
  } else if (!autonomyLevelAtOrBelow(input.requestedAutonomyLevel as PMAutonomyLevel, "L3_propose_only")) {
    addFinding(
      findings,
      "fail",
      "REQUESTED_AUTONOMY_FUTURE_GATED",
      "L4-L6 autonomy is future-gated and denied during Phase 101-120.",
      "requestedAutonomyLevel",
      undefined,
      input.requestedAutonomyLevel as PMAutonomyLevel,
      "L3_propose_only",
    );
  }

  checkArray(input.risks, findings, "risks", false);
  checkArray(input.blockers, findings, "blockers", false);
  checkArray(input.dodValidations, findings, "dodValidations", false);

  if (Array.isArray(input.risks)) {
    input.risks.forEach((risk, index) => {
      if (isObject(risk) && ["high", "critical"].includes(String(risk.severity))) {
        addFinding(
          findings,
          "warn",
          "RISK_CAPS_AUTONOMY",
          "High or critical risk caps autonomy to plan/propose only.",
          `risks.${index}.severity`,
        );
      }
    });
  }

  if (Array.isArray(input.blockers)) {
    input.blockers.forEach((blocker, index) => {
      if (isObject(blocker) && ["open", "watching", "blocked"].includes(String(blocker.status))) {
        addFinding(
          findings,
          "warn",
          "BLOCKER_CAPS_AUTONOMY",
          "Active blocker statuses cap autonomy to report/plan/propose.",
          `blockers.${index}.status`,
        );
      }
    });
  }

  if (Array.isArray(input.dodValidations)) {
    input.dodValidations.forEach((dodValidation, index) => {
      if (
        isObject(dodValidation) &&
        (dodValidation.valid === false || dodValidation.status === "fail")
      ) {
        addFinding(
          findings,
          "warn",
          "DOD_CAPS_AUTONOMY",
          "Failed DoD validation caps autonomy to plan/propose only.",
          `dodValidations.${index}.status`,
        );
      }
    });
  }

  return makeAutonomyPolicyValidationResult(
    findings,
    "autonomy_policy_input_validation:106I",
  );
};
