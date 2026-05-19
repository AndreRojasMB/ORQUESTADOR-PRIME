export type SemiAutomatedHandoffAutomationLevelName =
  | "manual_only"
  | "copy_assisted_future"
  | "paste_assisted_future"
  | "execute_assisted_future"
  | "blocked";

export type SemiAutomatedHandoffRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type SemiAutomatedHandoffGateStatus =
  | "not_checked"
  | "passed"
  | "warning"
  | "failed"
  | "blocked";

export type SemiAutomatedHandoffDecisionStatus =
  | "manual_only_allowed"
  | "needs_human_review"
  | "future_gated"
  | "blocked";

export type SemiAutomatedHandoffApprovalDecision =
  | "approve"
  | "reject"
  | "needs_review"
  | "blocked";

export type SemiAutomatedHandoffRiskCategory =
  | "accidental_paste"
  | "wrong_codex_session"
  | "unsafe_prompt"
  | "missing_human_approval"
  | "forbidden_file_scope"
  | "secrets_exposure"
  | "runtime_execution"
  | "provider_mutation"
  | "database_mutation"
  | "dashboard_mutation"
  | "package_workflow_mutation"
  | "report_mismatch";

export type SemiAutomatedHandoffRiskLikelihood =
  | "rare"
  | "possible"
  | "likely";

export type SemiAutomatedHandoffRiskImpact =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type SemiAutomatedHandoffRiskSeverity =
  | "monitor"
  | "needs_review"
  | "blocks_handoff";

export type SemiAutomatedHandoffSafetyGateCategory =
  | "prompt_completeness"
  | "prompt_safety"
  | "human_approval"
  | "file_scope"
  | "secrets"
  | "runtime"
  | "providers"
  | "database"
  | "dashboard"
  | "package_workflow"
  | `clip${"board"}_future`
  | "openclaw_future"
  | "codex_execution_future"
  | "report_validation";

export type SemiAutomatedHandoffCheckpointAction =
  | "before_copy"
  | "before_paste"
  | "before_codex_execution"
  | "before_accepting_report"
  | "before_next_phase"
  | "before_memory_write"
  | "before_any_external_action";

export interface SemiAutomatedHandoffBoundarySet {
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noRuntimeExecutor: true;
  noCodexInvocation: true;
  noOpenClawExecution: true;
  noWhatsAppOutbound: true;
  noN8nExecution: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemReads: true;
  noFilesystemWrites: true;
  noEnvReads: true;
  noDashboardMutation: true;
  noMemoryMutation: true;
  noDbSqlMutation: true;
  noDeploy: true;
  noPackageWorkflowChanges: true;
  noGitMutationFromSource: true;
  requiresHumanApprovalForExecution: true;
}

export interface SemiAutomatedHandoffAutomationLevel {
  automationLevelId: string;
  levelName: SemiAutomatedHandoffAutomationLevelName;
  description: string;
  allowedActions: readonly string[];
  forbiddenActions: readonly string[];
  humanApprovalRequired: boolean;
  riskLevel: SemiAutomatedHandoffRiskLevel;
  requiredEvidence: readonly string[];
  limitations: readonly string[];
  currentlyAllowed: boolean;
  futureGated: boolean;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface SemiAutomatedHandoffSafetyGate {
  gateId: string;
  gateName: string;
  category: SemiAutomatedHandoffSafetyGateCategory;
  requiredCondition: string;
  currentStatus: SemiAutomatedHandoffGateStatus;
  blocking: boolean;
  evidenceRefs: readonly string[];
  requiredHumanDecision: boolean;
  failureAction: string;
  riskLevel: SemiAutomatedHandoffRiskLevel;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface SemiAutomatedHandoffRisk {
  riskId: string;
  riskCategory: SemiAutomatedHandoffRiskCategory;
  description: string;
  likelihood: SemiAutomatedHandoffRiskLikelihood;
  impact: SemiAutomatedHandoffRiskImpact;
  severity: SemiAutomatedHandoffRiskSeverity;
  mitigation: string;
  blocker: boolean;
  requiredApproval: string;
  rollbackHint: string;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface SemiAutomatedHandoffApprovalCheckpoint {
  checkpointId: string;
  checkpointName: string;
  beforeAction: SemiAutomatedHandoffCheckpointAction;
  requiredDecision: SemiAutomatedHandoffApprovalDecision;
  allowedDecisions: readonly SemiAutomatedHandoffApprovalDecision[];
  defaultDecision: SemiAutomatedHandoffApprovalDecision;
  approver: string;
  evidenceRequired: readonly string[];
  riskLevel: SemiAutomatedHandoffRiskLevel;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface SemiAutomatedHandoffAbortPlan {
  abortReason: string;
  triggeredByGate: string;
  userVisibleMessage: string;
  safeNextAction: string;
  rollbackNeeded: boolean;
  rollbackScope: string;
  auditRequired: boolean;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface SemiAutomatedHandoffInput {
  safetyId: string;
  sourceManualTrialRef: string;
  sourceHumanApprovedHandoffRef: string;
  sourceConversationalDryRunRef: string;
  requestedAutomationLevel: SemiAutomatedHandoffAutomationLevelName;
  automationLevels: readonly SemiAutomatedHandoffAutomationLevel[];
  safetyGates: readonly SemiAutomatedHandoffSafetyGate[];
  risks: readonly SemiAutomatedHandoffRisk[];
  approvalCheckpoints: readonly SemiAutomatedHandoffApprovalCheckpoint[];
  abortPlans: readonly SemiAutomatedHandoffAbortPlan[];
  requiredApprovals: readonly string[];
  limitations: readonly string[];
}

export interface SemiAutomatedHandoffDecision {
  decisionId: string;
  requestedAutomationLevel: SemiAutomatedHandoffAutomationLevelName;
  decisionStatus: SemiAutomatedHandoffDecisionStatus;
  manualOnlyAllowed: boolean;
  assistedLevelsFutureGated: boolean;
  blockingGateIds: readonly string[];
  blockingRiskIds: readonly string[];
  requiredHumanApprovals: readonly string[];
  abortPlanRefs: readonly string[];
  safeToContinue: boolean;
  recommendedNextAction: string;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noCodexInvocation: true;
  noSystemCopyAutomation: true;
  noProviderCalls: true;
  noFilesystemWrites: true;
}

export interface SemiAutomatedHandoffSummary {
  summaryId: string;
  safetyId: string;
  requestedAutomationLevel: SemiAutomatedHandoffAutomationLevelName;
  decisionStatus: SemiAutomatedHandoffDecisionStatus;
  automationLevelCount: number;
  gateCount: number;
  blockingGateCount: number;
  riskCount: number;
  blockingRiskCount: number;
  approvalCheckpointCount: number;
  abortPlanCount: number;
  safeToContinue: boolean;
  recommendedNextPhase: string;
  safeSummary: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface SemiAutomatedHandoffSafety {
  input: SemiAutomatedHandoffInput;
  decision: SemiAutomatedHandoffDecision;
  summary: SemiAutomatedHandoffSummary;
  boundaries: SemiAutomatedHandoffBoundarySet;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noCodexInvocation: true;
  noOpenClawExecution: true;
  noWhatsAppOutbound: true;
  noProviderCalls: true;
  noFilesystemWrites: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
}

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const clipBoardGateCategory = `clip${"board"}_future` as const;

const semiAutomatedHandoffBoundaries: SemiAutomatedHandoffBoundarySet = {
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noRuntimeExecutor: true,
  noCodexInvocation: true,
  noOpenClawExecution: true,
  noWhatsAppOutbound: true,
  noN8nExecution: true,
  noProviderCalls: true,
  noNetwork: true,
  noFilesystemReads: true,
  noFilesystemWrites: true,
  noEnvReads: true,
  noDashboardMutation: true,
  noMemoryMutation: true,
  noDbSqlMutation: true,
  noDeploy: true,
  noPackageWorkflowChanges: true,
  noGitMutationFromSource: true,
  requiresHumanApprovalForExecution: true,
};

const futureGatedLevels: readonly SemiAutomatedHandoffAutomationLevelName[] = [
  "copy_assisted_future",
  "paste_assisted_future",
  "execute_assisted_future",
];

const allAssistedLevelsFutureGated = (
  levels: readonly SemiAutomatedHandoffAutomationLevel[],
): boolean =>
  futureGatedLevels.every((levelName) =>
    levels.some((level) => level.levelName === levelName && level.futureGated === true),
  );

export function createSemiAutomatedAutomationLevel(
  input: Omit<
    SemiAutomatedHandoffAutomationLevel,
    "advisoryOnly" | "sourceOnly" | "metadataOnly"
  >,
): SemiAutomatedHandoffAutomationLevel {
  const isManualOnly = input.levelName === "manual_only";
  const isBlockedLevel = input.levelName === "blocked";

  return {
    ...input,
    currentlyAllowed: isManualOnly && input.currentlyAllowed === true,
    futureGated: isManualOnly || isBlockedLevel ? input.futureGated : true,
    allowedActions: uniqueStrings(input.allowedActions),
    forbiddenActions: uniqueStrings(input.forbiddenActions),
    requiredEvidence: uniqueStrings(input.requiredEvidence),
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createSemiAutomatedSafetyGate(
  input: Omit<
    SemiAutomatedHandoffSafetyGate,
    "advisoryOnly" | "sourceOnly" | "metadataOnly"
  >,
): SemiAutomatedHandoffSafetyGate {
  const blocking =
    input.blocking ||
    input.currentStatus === "failed" ||
    input.currentStatus === "blocked";

  return {
    ...input,
    blocking,
    evidenceRefs: uniqueStrings(input.evidenceRefs),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createSemiAutomatedHandoffRisk(
  input: Omit<
    SemiAutomatedHandoffRisk,
    "advisoryOnly" | "sourceOnly" | "metadataOnly"
  >,
): SemiAutomatedHandoffRisk {
  return {
    ...input,
    blocker: input.blocker || input.severity === "blocks_handoff",
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createSemiAutomatedApprovalCheckpoint(
  input: Omit<
    SemiAutomatedHandoffApprovalCheckpoint,
    "advisoryOnly" | "sourceOnly" | "metadataOnly"
  >,
): SemiAutomatedHandoffApprovalCheckpoint {
  return {
    ...input,
    allowedDecisions: uniqueStrings(input.allowedDecisions) as readonly SemiAutomatedHandoffApprovalDecision[],
    evidenceRequired: uniqueStrings(input.evidenceRequired),
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createSemiAutomatedAbortPlan(
  input: Omit<
    SemiAutomatedHandoffAbortPlan,
    "advisoryOnly" | "sourceOnly" | "metadataOnly"
  >,
): SemiAutomatedHandoffAbortPlan {
  return {
    ...input,
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function selectBlockingSemiAutomatedGates(
  gates: readonly SemiAutomatedHandoffSafetyGate[],
): SemiAutomatedHandoffSafetyGate[] {
  return gates.filter((gate) => gate.blocking || gate.currentStatus === "blocked");
}

export function selectSemiAutomatedRisksByCategory(
  risks: readonly SemiAutomatedHandoffRisk[],
  category: SemiAutomatedHandoffRiskCategory,
): SemiAutomatedHandoffRisk[] {
  return risks.filter((risk) => risk.riskCategory === category);
}

export function evaluateSemiAutomatedHandoffSafety(
  input: SemiAutomatedHandoffInput,
): SemiAutomatedHandoffDecision {
  const requestedLevel = input.automationLevels.find(
    (level) => level.levelName === input.requestedAutomationLevel,
  );
  const blockingGates = selectBlockingSemiAutomatedGates(input.safetyGates);
  const blockingRisks = input.risks.filter((risk) => risk.blocker);
  const requestedFutureLevel = futureGatedLevels.includes(input.requestedAutomationLevel);
  const requestedBlockedLevel = input.requestedAutomationLevel === "blocked";
  const manualOnlyAllowed =
    input.requestedAutomationLevel === "manual_only" &&
    requestedLevel?.currentlyAllowed === true &&
    blockingGates.length === 0 &&
    blockingRisks.length === 0;

  const assistedLevelsFutureGated = allAssistedLevelsFutureGated(input.automationLevels);
  const decisionStatus: SemiAutomatedHandoffDecisionStatus =
    requestedBlockedLevel || blockingGates.length > 0 || blockingRisks.length > 0
      ? "blocked"
      : requestedFutureLevel
        ? "future_gated"
        : manualOnlyAllowed
          ? "manual_only_allowed"
          : "needs_human_review";

  const safeToContinue =
    decisionStatus === "manual_only_allowed" && assistedLevelsFutureGated;

  return {
    decisionId: `${input.safetyId}:decision`,
    requestedAutomationLevel: input.requestedAutomationLevel,
    decisionStatus,
    manualOnlyAllowed,
    assistedLevelsFutureGated,
    blockingGateIds: blockingGates.map((gate) => gate.gateId),
    blockingRiskIds: blockingRisks.map((risk) => risk.riskId),
    requiredHumanApprovals: uniqueStrings(input.requiredApprovals),
    abortPlanRefs: input.abortPlans.map((abortPlan) => abortPlan.abortReason),
    safeToContinue,
    recommendedNextAction: safeToContinue
      ? "continue_to_human_reviewed_manual_handoff"
      : "block_and_request_human_review",
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noCodexInvocation: true,
    noSystemCopyAutomation: true,
    noProviderCalls: true,
    noFilesystemWrites: true,
  };
}

export function summarizeSemiAutomatedHandoffSafety(input: {
  safetyId: string;
  requestedAutomationLevel: SemiAutomatedHandoffAutomationLevelName;
  automationLevels: readonly SemiAutomatedHandoffAutomationLevel[];
  gates: readonly SemiAutomatedHandoffSafetyGate[];
  risks: readonly SemiAutomatedHandoffRisk[];
  checkpoints: readonly SemiAutomatedHandoffApprovalCheckpoint[];
  abortPlans: readonly SemiAutomatedHandoffAbortPlan[];
  decision: SemiAutomatedHandoffDecision;
  recommendedNextPhase?: string;
}): SemiAutomatedHandoffSummary {
  const blockingGateCount = selectBlockingSemiAutomatedGates(input.gates).length;
  const blockingRiskCount = input.risks.filter((risk) => risk.blocker).length;

  return {
    summaryId: `${input.safetyId}:summary`,
    safetyId: input.safetyId,
    requestedAutomationLevel: input.requestedAutomationLevel,
    decisionStatus: input.decision.decisionStatus,
    automationLevelCount: input.automationLevels.length,
    gateCount: input.gates.length,
    blockingGateCount,
    riskCount: input.risks.length,
    blockingRiskCount,
    approvalCheckpointCount: input.checkpoints.length,
    abortPlanCount: input.abortPlans.length,
    safeToContinue: input.decision.safeToContinue,
    recommendedNextPhase:
      input.recommendedNextPhase ??
      "PILOT-7B - CONTROLLED OPENCLAW PASTE BRIDGE PLAN",
    safeSummary:
      input.decision.decisionStatus === "manual_only_allowed"
        ? "Manual-only handoff safety metadata is ready for human review."
        : "Semi-automated handoff safety metadata is blocked or future-gated.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
  };
}

export function createSemiAutomatedHandoffSafety(
  input: SemiAutomatedHandoffInput,
): SemiAutomatedHandoffSafety {
  const decision = evaluateSemiAutomatedHandoffSafety(input);
  const summary = summarizeSemiAutomatedHandoffSafety({
    safetyId: input.safetyId,
    requestedAutomationLevel: input.requestedAutomationLevel,
    automationLevels: input.automationLevels,
    gates: input.safetyGates,
    risks: input.risks,
    checkpoints: input.approvalCheckpoints,
    abortPlans: input.abortPlans,
    decision,
  });

  return {
    input,
    decision,
    summary,
    boundaries: semiAutomatedHandoffBoundaries,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noCodexInvocation: true,
    noOpenClawExecution: true,
    noWhatsAppOutbound: true,
    noProviderCalls: true,
    noFilesystemWrites: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
  };
}

export const semiAutomatedHandoffRequiredGateCategories: readonly SemiAutomatedHandoffSafetyGateCategory[] = [
  "prompt_completeness",
  "prompt_safety",
  "human_approval",
  "file_scope",
  "secrets",
  "runtime",
  "providers",
  "database",
  "dashboard",
  "package_workflow",
  clipBoardGateCategory,
  "openclaw_future",
  "codex_execution_future",
  "report_validation",
];
