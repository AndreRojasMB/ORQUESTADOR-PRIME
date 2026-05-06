import { pmAllowedAutonomyLevels101To120, pmFoundationBoundaries } from "./boundaries.js";
import type {
  PMAllowedAutonomyLevel,
  PMAutonomyLevel,
  PMBoundarySet,
  PMFindingSeverity,
  PMSchemaVersion,
} from "./types.js";
import {
  planNextBestAction,
  pmNextBestActionCategories,
  pmNextBestActionPriorities,
  pmNextBestActionStatuses,
  type PMNextBestActionCategory,
  type PMNextBestActionInput,
  type PMNextBestActionPriority,
  type PMNextBestActionResult,
  type PMNextBestActionStatus,
} from "./nextBestAction.js";
import type { PMApprovalStatus } from "./approvalTypes.js";
import type { PMBlockerStatus } from "./blockerRules.js";
import type { PMDoDValidationStatus } from "./dodTypes.js";
import type { PMRiskSeverity } from "./riskModel.js";

export type PMDecisionRuleId = string;

export interface PMDecisionRule {
  ruleId: PMDecisionRuleId;
  label: string;
  safeSummary: string;
  triggerCategory: PMNextBestActionCategory;
  outputCategory: PMNextBestActionCategory;
  priority: PMNextBestActionPriority;
  status: PMNextBestActionStatus;
  maxAutonomyLevel: PMAllowedAutonomyLevel;
  riskSeverities: PMRiskSeverity[];
  blockerStatuses: PMBlockerStatus[];
  dodStatuses: PMDoDValidationStatus[];
  approvalStatuses: PMApprovalStatus[];
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

export interface PMDecisionRuleFinding {
  id: string;
  severity: PMFindingSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  ruleId?: PMDecisionRuleId;
  metadata?: Record<string, string | number | boolean>;
}

export interface PMDecisionRuleValidationResult {
  validationId: string;
  schemaVersion: PMSchemaVersion;
  valid: boolean;
  status: "pass" | "warn" | "fail";
  findings: PMDecisionRuleFinding[];
  warnings: PMDecisionRuleFinding[];
  errors: PMDecisionRuleFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: PMBoundarySet;
}

const MAX_TEXT_LENGTH = 1200;
const MAX_ID_LENGTH = 160;
const MAX_ARRAY_LENGTH = 120;

const supportedRiskSeverities = ["low", "medium", "high", "critical"] as const satisfies readonly PMRiskSeverity[];
const supportedBlockerStatuses = ["open", "watching", "blocked", "resolved_metadata_only", "deferred"] as const satisfies readonly PMBlockerStatus[];
const supportedDodStatuses = ["pass", "warn", "fail"] as const satisfies readonly PMDoDValidationStatus[];
const supportedApprovalStatuses = [
  "not_required",
  "required",
  "pending_metadata",
  "ready_for_human_review",
  "blocked",
  "future_only",
  "invalid",
] as const satisfies readonly PMApprovalStatus[];

const forbiddenContentPatterns: Array<{
  pattern: RegExp;
  reasonCode: string;
  safeMessage: string;
}> = [
  {
    pattern:
      /approveProposal|rejectProposal|dispatchAction|action\s+execution|proposal\s+execution|approval\s+execution/i,
    reasonCode: "FORBIDDEN_ACTION_APPROVAL_REFERENCE",
    safeMessage:
      "Decision rule metadata must not include action/proposal/approval execution behavior.",
  },
  {
    pattern:
      /branch\s+creation|commit\s+creation|PR\s+creation|self-approve|deploy\s+now|run\s+in\s+prod/i,
    reasonCode: "FORBIDDEN_GIT_OR_DEPLOY_REFERENCE",
    safeMessage:
      "Decision rule metadata must not include branch, commit, PR, self-approval, or deployment behavior.",
  },
  {
    pattern:
      /api\s*key|token|secret|hookToken|credential|raw\s+prompt|raw\s+provider\s+output/i,
    reasonCode: "FORBIDDEN_PRIVATE_CONTENT",
    safeMessage:
      "Decision rule metadata must not include secrets, tokens, credential wording, raw prompts, or raw provider output.",
  },
  {
    pattern:
      /npm\s+test|test\s+execution|CI\s+execution|write\s*File|append\s*File|fetch\s*\(|child[_-]process|exec\s*\(|spawn\s*\(/i,
    reasonCode: "FORBIDDEN_EXECUTION_TOKEN",
    safeMessage:
      "Decision rule metadata must not include test, CI, filesystem, network, or command execution tokens.",
  },
  {
    pattern:
      /src\/actions\/|src\/jobs\/|src\/runtime\/|src\/automation\/|src\/scaffold\/|dashboard\/|src\/connectors\//i,
    reasonCode: "FORBIDDEN_LIVE_ADJACENT_REFERENCE",
    safeMessage:
      "Decision rule metadata must not point at live-adjacent implementation surfaces.",
  },
  {
    pattern:
      /\bproduction-ready\b|\bproduction ready\b|\bfully autonomous\b/i,
    reasonCode: "FORBIDDEN_OVERCLAIM",
    safeMessage:
      "Decision rule metadata must not include production or full-autonomy claims.",
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
  findings: PMDecisionRuleFinding[],
  severity: PMFindingSeverity,
  reasonCode: string,
  safeMessage: string,
  path?: string,
  ruleId?: PMDecisionRuleId,
  metadata?: Record<string, string | number | boolean>,
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(ruleId ? { ruleId } : {}),
    ...(metadata ? { metadata } : {}),
  });
};

const checkForbiddenContent = (
  input: unknown,
  findings: PMDecisionRuleFinding[],
): void => {
  const combined = safeStringValues(input).join("\n");
  for (const item of forbiddenContentPatterns) {
    if (item.pattern.test(combined)) {
      addFinding(findings, "fail", item.reasonCode, item.safeMessage);
    }
  }
};

const checkText = (
  value: unknown,
  findings: PMDecisionRuleFinding[],
  path: string,
  required = false,
  maxLength = MAX_TEXT_LENGTH,
  ruleId?: PMDecisionRuleId,
): void => {
  if (typeof value !== "string" || !value.trim()) {
    if (required) {
      addFinding(
        findings,
        "fail",
        "REQUIRED_TEXT_MISSING",
        "Required decision rule text must be present and non-empty.",
        path,
        ruleId,
      );
    }
    return;
  }

  if (value !== value.trim()) {
    addFinding(
      findings,
      "fail",
      "TEXT_NOT_TRIMMED",
      "Decision rule identifiers and text must be trimmed.",
      path,
      ruleId,
    );
  }

  if (value.length > maxLength) {
    addFinding(
      findings,
      "fail",
      "TEXT_TOO_LONG",
      "Decision rule text exceeds the bounded length limit.",
      path,
      ruleId,
      { maxLength },
    );
  }
};

const checkArray = (
  value: unknown,
  findings: PMDecisionRuleFinding[],
  path: string,
  ruleId?: PMDecisionRuleId,
): unknown[] => {
  if (!Array.isArray(value)) {
    addFinding(
      findings,
      "fail",
      "ARRAY_REQUIRED",
      "Decision rule arrays must be present.",
      path,
      ruleId,
    );
    return [];
  }

  if (value.length > MAX_ARRAY_LENGTH) {
    addFinding(
      findings,
      "fail",
      "ARRAY_TOO_LONG",
      "Decision rule arrays must stay within bounded metadata limits.",
      path,
      ruleId,
      { maxItems: MAX_ARRAY_LENGTH },
    );
  }

  return value;
};

const checkValues = <T extends string>(
  values: unknown,
  supported: readonly T[],
  findings: PMDecisionRuleFinding[],
  path: string,
  reasonCode: string,
  safeMessage: string,
  ruleId?: PMDecisionRuleId,
): void => {
  const items = checkArray(values, findings, path, ruleId);
  items.forEach((item, index) => {
    if (!supported.includes(item as T)) {
      addFinding(findings, "fail", reasonCode, safeMessage, `${path}.${index}`, ruleId);
    }
  });
};

const validateRule = (
  rule: unknown,
  index: number,
  findings: PMDecisionRuleFinding[],
): rule is PMDecisionRule => {
  if (!isObject(rule)) {
    addFinding(
      findings,
      "fail",
      "DECISION_RULE_NOT_OBJECT",
      "Decision rules must be metadata objects.",
      `rules.${index}`,
    );
    return false;
  }

  const ruleId = typeof rule.ruleId === "string" ? rule.ruleId : undefined;
  checkText(rule.ruleId, findings, `rules.${index}.ruleId`, true, MAX_ID_LENGTH, ruleId);
  checkText(rule.label, findings, `rules.${index}.label`, true, MAX_TEXT_LENGTH, ruleId);
  checkText(rule.safeSummary, findings, `rules.${index}.safeSummary`, true, MAX_TEXT_LENGTH, ruleId);

  if (!pmNextBestActionCategories.includes(rule.triggerCategory as PMNextBestActionCategory)) {
    addFinding(findings, "fail", "TRIGGER_CATEGORY_UNSUPPORTED", "Decision rule trigger category must be known.", `rules.${index}.triggerCategory`, ruleId);
  }
  if (!pmNextBestActionCategories.includes(rule.outputCategory as PMNextBestActionCategory)) {
    addFinding(findings, "fail", "OUTPUT_CATEGORY_UNSUPPORTED", "Decision rule output category must be known.", `rules.${index}.outputCategory`, ruleId);
  }
  if (!pmNextBestActionPriorities.includes(rule.priority as PMNextBestActionPriority)) {
    addFinding(findings, "fail", "PRIORITY_UNSUPPORTED", "Decision rule priority must be known.", `rules.${index}.priority`, ruleId);
  }
  if (!pmNextBestActionStatuses.includes(rule.status as PMNextBestActionStatus)) {
    addFinding(findings, "fail", "STATUS_UNSUPPORTED", "Decision rule status must be known.", `rules.${index}.status`, ruleId);
  }
  if (!pmAllowedAutonomyLevels101To120.includes(rule.maxAutonomyLevel as PMAllowedAutonomyLevel)) {
    addFinding(
      findings,
      "fail",
      "AUTONOMY_ABOVE_101_120_CAP",
      "Decision rules must keep max autonomy within L0-L3 during Phase 101-120.",
      `rules.${index}.maxAutonomyLevel`,
      ruleId,
      { maxAutonomyLevel: String(rule.maxAutonomyLevel) },
    );
  }

  checkValues(rule.riskSeverities, supportedRiskSeverities, findings, `rules.${index}.riskSeverities`, "RISK_SEVERITY_UNSUPPORTED", "Decision rule risk severities must be known.", ruleId);
  checkValues(rule.blockerStatuses, supportedBlockerStatuses, findings, `rules.${index}.blockerStatuses`, "BLOCKER_STATUS_UNSUPPORTED", "Decision rule blocker statuses must be known.", ruleId);
  checkValues(rule.dodStatuses, supportedDodStatuses, findings, `rules.${index}.dodStatuses`, "DOD_STATUS_UNSUPPORTED", "Decision rule DoD statuses must be known.", ruleId);
  checkValues(rule.approvalStatuses, supportedApprovalStatuses, findings, `rules.${index}.approvalStatuses`, "APPROVAL_STATUS_UNSUPPORTED", "Decision rule approval statuses must be known.", ruleId);

  if (
    rule.metadataOnly !== true ||
    rule.advisoryOnly !== true ||
    rule.sourceOnly !== true ||
    rule.noExecution !== true ||
    rule.noActionDispatch !== true ||
    rule.noProposalCreation !== true ||
    rule.noApprovalCreation !== true ||
    rule.noApprovalExecution !== true ||
    rule.noProposalStoreWrites !== true ||
    rule.noJobsExecution !== true ||
    rule.noBranchCommitPrCreation !== true ||
    rule.noCodexOpenCodeExecution !== true
  ) {
    addFinding(
      findings,
      "fail",
      "RULE_NOT_SOURCE_ONLY_ADVISORY",
      "Decision rules must remain metadata-only, advisory, source-only, and non-executing.",
      `rules.${index}`,
      ruleId,
    );
  }

  const boundaries = isObject(rule.boundaries) ? rule.boundaries : undefined;
  const missingBoundary = Object.keys(pmFoundationBoundaries).some((key) => boundaries?.[key] !== true);
  if (!boundaries || missingBoundary) {
    addFinding(
      findings,
      "fail",
      "BOUNDARIES_REQUIRED",
      "Decision rules must include all PM foundation boundaries.",
      `rules.${index}.boundaries`,
      ruleId,
    );
  }

  return true;
};

const makeValidationResult = (
  findings: PMDecisionRuleFinding[],
): PMDecisionRuleValidationResult => {
  const errors = findings.filter((finding) => finding.severity === "fail");
  const warnings = findings.filter((finding) => finding.severity === "warn");
  return {
    validationId: "decision_rule_validation:108I",
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

export const validateDecisionRules = (
  input: unknown,
): PMDecisionRuleValidationResult => {
  const findings: PMDecisionRuleFinding[] = [];
  checkForbiddenContent(input, findings);

  if (!Array.isArray(input)) {
    addFinding(
      findings,
      "fail",
      "DECISION_RULE_ARRAY_REQUIRED",
      "Decision rules must be supplied as a bounded metadata array.",
    );
    return makeValidationResult(findings);
  }

  if (input.length > MAX_ARRAY_LENGTH) {
    addFinding(
      findings,
      "fail",
      "DECISION_RULE_ARRAY_TOO_LONG",
      "Decision rule arrays must stay within bounded metadata limits.",
      undefined,
      undefined,
      { maxItems: MAX_ARRAY_LENGTH },
    );
  }

  const seenRuleIds = new Set<PMDecisionRuleId>();
  input.forEach((rule, index) => {
    if (validateRule(rule, index, findings)) {
      if (seenRuleIds.has(rule.ruleId)) {
        addFinding(
          findings,
          "fail",
          "DECISION_RULE_ID_DUPLICATE",
          "Decision rule ids must be unique.",
          `rules.${index}.ruleId`,
          rule.ruleId,
        );
      }
      seenRuleIds.add(rule.ruleId);
    }
  });

  return makeValidationResult(findings);
};

export const evaluateDecisionRules = (
  input: PMNextBestActionInput,
): PMNextBestActionResult => {
  const cappedInput: PMNextBestActionInput = {
    ...input,
    requestedAutonomyLevel:
      input.requestedAutonomyLevel &&
      pmAllowedAutonomyLevels101To120.includes(input.requestedAutonomyLevel as PMAllowedAutonomyLevel)
        ? input.requestedAutonomyLevel
        : ("L3_propose_only" satisfies PMAllowedAutonomyLevel),
  };
  return planNextBestAction(cappedInput);
};
