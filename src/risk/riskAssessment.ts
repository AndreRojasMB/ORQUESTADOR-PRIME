import { createHash } from "crypto";
import { GLOBAL_FORBIDDEN_ACTION_CATEGORIES } from "../actions/types.js";
import { redactString, redactStructuredValue } from "../privacy/redactionEngine.js";
import type { RedactionMetadata } from "../privacy/redactionEngine.js";
import type {
  EvalStatus,
  PermissionStatus,
  RiskApprovalSignal,
  RiskAssessmentInput,
  RiskDecision,
  RiskLevel,
  RiskProposedAction,
  RiskSensitiveDataFlags,
  WorkspaceStatus,
} from "./types.js";
import { RISK_SIGNAL_SCHEMA_VERSION } from "./types.js";

const FORBIDDEN_CATEGORIES = new Set<string>(GLOBAL_FORBIDDEN_ACTION_CATEGORIES);

const RISK_ORDER: Record<RiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const DECISION_ORDER: Record<RiskDecision, number> = {
  proceed: 0,
  proceed_with_warnings: 1,
  pause_for_review: 2,
  require_explicit_approval: 3,
  block_until_fixed: 4,
};

function hashText(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function scrubBodyLabels(value: string): string {
  return value.replace(/\b(?:request|raw)Body\b/g, "body-field");
}

function stableSignalId(createdAt: string, taskHash: string): string {
  return `risk_${createHash("sha256")
    .update(`${createdAt}:${taskHash}`)
    .digest("hex")
    .slice(0, 16)}`;
}

function addReason(reasons: Set<string>, reason: string): void {
  if (reason.trim().length > 0) {
    reasons.add(reason);
  }
}

function raiseRisk(current: RiskLevel, next: RiskLevel): RiskLevel {
  return RISK_ORDER[next] > RISK_ORDER[current] ? next : current;
}

function raiseDecision(current: RiskDecision, next: RiskDecision): RiskDecision {
  return DECISION_ORDER[next] > DECISION_ORDER[current] ? next : current;
}

function normalizeEvalStatus(input: RiskAssessmentInput): EvalStatus {
  const status = input.evalReport?.summary?.status ?? input.evalReport?.status;
  if (status === "pass" || status === "warn" || status === "fail") {
    return status;
  }
  if (status === "unreadable") return "unreadable";
  return "missing";
}

function normalizePermissionStatus(input: RiskAssessmentInput): PermissionStatus {
  const supplied = input.permission?.status;
  if (
    supplied === "allowed" ||
    supplied === "blocked" ||
    supplied === "missing" ||
    supplied === "not_checked"
  ) {
    return supplied;
  }
  if (input.permission?.allowed === true || input.permission?.decision === "allowed") {
    return "allowed";
  }
  if (input.permission?.allowed === false || input.permission?.decision === "blocked") {
    return "blocked";
  }
  return input.permission ? "not_checked" : "missing";
}

function normalizeWorkspaceStatus(input: RiskAssessmentInput): WorkspaceStatus {
  const supplied = input.workspace?.status;
  if (
    supplied === "initialized" ||
    supplied === "missing" ||
    supplied === "blocked" ||
    supplied === "not_checked"
  ) {
    return supplied;
  }
  if (input.workspace?.blocked || (input.workspace?.blockerCount ?? 0) > 0) {
    return "blocked";
  }
  if (input.workspace?.initialized === true) return "initialized";
  if (input.workspace?.initialized === false) return "missing";
  return input.workspace ? "not_checked" : "not_checked";
}

function actionLabel(action: RiskProposedAction): string {
  return [
    action.toolId,
    action.capability,
    action.category,
    action.kind,
  ]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(":") || "unknown-action";
}

function actionRequiresExplicitApproval(action: RiskProposedAction): boolean {
  const label = actionLabel(action).toLowerCase();
  return Boolean(
    action.mutatesRepo ||
      action.requiresApproval ||
      action.realExecution ||
      action.externalExecution ||
      action.dispatch ||
      action.deploy ||
      action.computerAction === "real" ||
      label.includes("dispatch") ||
      label.includes(".real") ||
      label.includes("deploy") ||
      label.includes("external") ||
      label.includes("computer.click.real") ||
      label.includes("computer.type.real") ||
      label.includes("computer.navigate.real"),
  );
}

function actionIsForbidden(action: RiskProposedAction): boolean {
  const category = typeof action.category === "string" ? action.category : "";
  return FORBIDDEN_CATEGORIES.has(category);
}

function flagsFromMetadata(metadata: RedactionMetadata): RiskSensitiveDataFlags {
  return {
    removedKinds: metadata.removedKinds.slice().sort(),
    containsSecrets: metadata.containsSecrets,
    containsRawIdentity: metadata.containsRawIdentity,
    containsRawBody: metadata.containsRawBody,
    containsFileContent: metadata.containsFileContent,
    unsafe:
      metadata.containsSecrets ||
      metadata.containsRawBody ||
      metadata.containsFileContent,
  };
}

function mergeSensitiveFlags(
  redaction: RiskSensitiveDataFlags,
  supplied: RiskAssessmentInput["sensitiveData"],
): RiskSensitiveDataFlags {
  const removedKinds = new Set([
    ...redaction.removedKinds,
    ...((supplied?.removedKinds ?? []).map(String)),
  ]);
  return {
    removedKinds: [...removedKinds].sort(),
    containsSecrets: redaction.containsSecrets || supplied?.containsSecrets === true,
    containsRawIdentity: redaction.containsRawIdentity || supplied?.containsRawIdentity === true,
    containsRawBody: redaction.containsRawBody || supplied?.containsRawBody === true,
    containsFileContent:
      redaction.containsFileContent || supplied?.containsFileContent === true,
    unsafe: redaction.unsafe || supplied?.unsafe === true,
  };
}

function supervisorRiskStatus(input: RiskAssessmentInput): {
  highest: RiskLevel;
  count: number;
  blockerCount: number;
  reasons: string[];
} {
  const risks = input.supervisor?.risks ?? [];
  let highest: RiskLevel = "low";
  for (const risk of risks) {
    if (risk.severity === "critical" || risk.severity === "high") {
      highest = raiseRisk(highest, "high");
    } else if (risk.severity === "medium") {
      highest = raiseRisk(highest, "medium");
    }
  }
  const blockerCount =
    input.supervisor?.blockerCount ??
    input.supervisor?.blockers?.length ??
    input.supervisor?.highRiskCount ??
    0;
  if (blockerCount > 0) highest = raiseRisk(highest, "high");
  return {
    highest,
    count: risks.length,
    blockerCount,
    reasons: [
      ...(blockerCount > 0 ? ["supervisor.blockers.present"] : []),
      ...(input.supervisor?.highRiskCount && input.supervisor.highRiskCount > 0
        ? ["supervisor.high_risk.present"]
        : []),
    ],
  };
}

function multiAgentRiskStatus(input: RiskAssessmentInput): {
  highest: RiskLevel;
  reasons: string[];
} {
  const decision = input.multiAgent?.decision;
  const highestRisk = input.multiAgent?.highestRiskLevel;
  let highest: RiskLevel = "low";
  const reasons: string[] = [];

  if (decision === "block") {
    highest = "critical";
    reasons.push("multi_agent.block");
  } else if (decision === "needs-review") {
    highest = "high";
    reasons.push("multi_agent.needs_review");
  } else if (decision === "warn") {
    highest = "medium";
    reasons.push("multi_agent.warn");
  }

  if (highestRisk === "critical") highest = raiseRisk(highest, "critical");
  if (highestRisk === "high") highest = raiseRisk(highest, "high");
  if (highestRisk === "medium") highest = raiseRisk(highest, "medium");

  return { highest, reasons };
}

export function assessRisk(input: RiskAssessmentInput = {}): RiskApprovalSignal {
  const createdAt = new Date().toISOString();
  const redactedTask = redactString(input.task ?? "unspecified local assessment", {
    maxLength: 220,
  });
  const redactionSource = {
    task: input.task,
    taskMetadata: input.taskMetadata,
    proposedActions: input.proposedActions,
    permission: input.permission,
    workspace: input.workspace,
    supervisor: input.supervisor,
    multiAgent: input.multiAgent,
  };
  const redactedInput = redactStructuredValue(redactionSource, { maxLength: 800 });
  const taskPreview = scrubBodyLabels(redactedTask.safePreview);
  const taskHash = hashText(`${input.taskId ?? ""}:${taskPreview}:${redactedInput.safePreview}`);
  const reasons = new Set<string>();
  const warnings: string[] = [];
  const proposedActions = input.proposedActions ?? [];
  const proposedActionTypes = proposedActions.map(actionLabel).sort();
  const evalStatus = normalizeEvalStatus(input);
  const permissionStatus = normalizePermissionStatus(input);
  const workspaceStatus = normalizeWorkspaceStatus(input);
  const redactionFlags = mergeSensitiveFlags(
    flagsFromMetadata(redactedInput.metadata),
    input.sensitiveData,
  );

  let riskLevel: RiskLevel = "low";
  let decision: RiskDecision = "proceed";

  if (!input.task && !input.taskId) {
    addReason(reasons, "task.unspecified");
    warnings.push("No explicit task was supplied; assessment used a local placeholder.");
    decision = raiseDecision(decision, "proceed_with_warnings");
    riskLevel = raiseRisk(riskLevel, "medium");
  }

  if (evalStatus === "fail") {
    addReason(reasons, "eval.fail");
    decision = raiseDecision(decision, "pause_for_review");
    riskLevel = raiseRisk(riskLevel, "high");
  } else if (evalStatus === "warn") {
    addReason(reasons, "eval.warn");
    decision = raiseDecision(decision, "proceed_with_warnings");
    riskLevel = raiseRisk(riskLevel, "medium");
  } else if (evalStatus === "missing") {
    addReason(reasons, "eval.missing");
    warnings.push("No eval report was supplied; this remains a local advisory signal.");
    decision = raiseDecision(decision, "proceed_with_warnings");
    riskLevel = raiseRisk(riskLevel, "medium");
  } else if (evalStatus === "unreadable") {
    addReason(reasons, "eval.unreadable");
    decision = raiseDecision(decision, "pause_for_review");
    riskLevel = raiseRisk(riskLevel, "high");
  }

  const evalPrivacyUnsafe = input.evalReport?.privacy?.containsUnsafeOutput === true;
  if (evalPrivacyUnsafe) {
    addReason(reasons, "eval.privacy_unsafe");
    riskLevel = raiseRisk(riskLevel, "critical");
    decision = raiseDecision(decision, "block_until_fixed");
  }

  if (permissionStatus === "blocked") {
    addReason(reasons, input.permission?.reasonCode ?? "permission.blocked");
    riskLevel = raiseRisk(riskLevel, "high");
    decision = raiseDecision(decision, "require_explicit_approval");
  } else if (permissionStatus === "missing") {
    addReason(reasons, "permission.missing");
    decision = raiseDecision(decision, "proceed_with_warnings");
  }

  for (const action of proposedActions) {
    if (actionIsForbidden(action)) {
      addReason(reasons, "action.forbidden_category");
      riskLevel = raiseRisk(riskLevel, "critical");
      decision = raiseDecision(decision, "block_until_fixed");
    } else if (actionRequiresExplicitApproval(action)) {
      addReason(reasons, "action.explicit_approval_required");
      riskLevel = raiseRisk(riskLevel, "high");
      decision = raiseDecision(decision, "require_explicit_approval");
    }
  }

  if (permissionStatus === "blocked" && [...reasons].includes("action.forbidden_category")) {
    addReason(reasons, "permission.blocked_for_forbidden_category");
    decision = raiseDecision(decision, "block_until_fixed");
    riskLevel = raiseRisk(riskLevel, "critical");
  }

  if (workspaceStatus === "blocked") {
    addReason(reasons, "workspace.blocked");
    riskLevel = raiseRisk(riskLevel, "medium");
    decision = raiseDecision(decision, "pause_for_review");
  }

  const supervisor = supervisorRiskStatus(input);
  for (const reason of supervisor.reasons) addReason(reasons, reason);
  if (supervisor.highest === "high" || supervisor.highest === "critical") {
    riskLevel = raiseRisk(riskLevel, supervisor.highest);
    decision = raiseDecision(
      decision,
      supervisor.highest === "critical" ? "require_explicit_approval" : "pause_for_review",
    );
  } else if (supervisor.highest === "medium") {
    riskLevel = raiseRisk(riskLevel, "medium");
    decision = raiseDecision(decision, "proceed_with_warnings");
  }

  const multiAgent = multiAgentRiskStatus(input);
  for (const reason of multiAgent.reasons) addReason(reasons, reason);
  if (multiAgent.highest === "critical") {
    riskLevel = raiseRisk(riskLevel, "critical");
    decision = raiseDecision(decision, "block_until_fixed");
  } else if (multiAgent.highest === "high") {
    riskLevel = raiseRisk(riskLevel, "high");
    decision = raiseDecision(decision, "pause_for_review");
  } else if (multiAgent.highest === "medium") {
    riskLevel = raiseRisk(riskLevel, "medium");
    decision = raiseDecision(decision, "proceed_with_warnings");
  }

  if (redactionFlags.containsSecrets || redactionFlags.containsRawBody) {
    addReason(reasons, "sensitive.secrets_or_body");
    riskLevel = raiseRisk(riskLevel, "critical");
    decision = raiseDecision(decision, "block_until_fixed");
  } else if (redactionFlags.containsRawIdentity) {
    addReason(reasons, "sensitive.identity_redacted");
    riskLevel = raiseRisk(riskLevel, "medium");
    decision = raiseDecision(decision, "proceed_with_warnings");
  }

  if (evalStatus === "fail" && redactionFlags.unsafe) {
    addReason(reasons, "eval.fail_with_sensitive_data");
    riskLevel = raiseRisk(riskLevel, "critical");
    decision = raiseDecision(decision, "block_until_fixed");
  }

  const requiresExplicitApproval = decision === "require_explicit_approval";
  const requiredHumanReview =
    decision === "pause_for_review" ||
    decision === "require_explicit_approval" ||
    decision === "block_until_fixed";

  const confidence =
    input.task || input.evalReport || input.permission || proposedActions.length > 0
      ? "medium"
      : "low";

  return {
    signalId: stableSignalId(createdAt, taskHash),
    createdAt,
    schemaVersion: RISK_SIGNAL_SCHEMA_VERSION,
    project: {
      projectId: input.project?.projectId ?? null,
      projectName: input.project?.projectName ?? null,
      projectRootHash: input.project?.projectRootHash ?? null,
    },
    taskId: input.taskId ?? null,
    taskPreview,
    taskHash,
    riskLevel,
    riskReasons: [...reasons].sort(),
    evalStatus,
    permissionStatus,
    workspaceStatus,
    supervisorStatus: {
      status: supervisor.highest,
      reasonCodes: supervisor.reasons.sort(),
    },
    multiAgentStatus: {
      status: input.multiAgent?.decision ?? "not_checked",
      reasonCodes: [
        ...(input.multiAgent?.reasonCodes ?? []),
        ...multiAgent.reasons,
      ].sort(),
    },
    proposedActionTypes,
    sensitiveDataFlags: redactionFlags,
    recommendedDecision: decision,
    requiredHumanReview,
    requiresExplicitApproval,
    confidence,
    warnings: warnings.sort(),
    advisoryOnly: true,
    boundaries: {
      advisoryOnly: true,
      noProviderCalls: true,
      noNetwork: true,
      noRuntimeGateWiring: true,
      noApprovalExecution: true,
      noProposalCreation: true,
      noDispatch: true,
      noStoreMutation: true,
    },
  };
}
