export type ControlledOpenClawAutomationLevel =
  | "manual_only"
  | "copy_assisted_future"
  | "paste_assisted_future"
  | "execute_assisted_future"
  | "blocked";

export type ControlledOpenClawRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type ControlledOpenClawConfidence =
  | "low"
  | "medium"
  | "high";

export type ControlledOpenClawGateStatus =
  | "not_checked"
  | "passed"
  | "warning"
  | "failed"
  | "blocked";

export type ControlledOpenClawDecisionStatus =
  | "future_ready_metadata"
  | "manual_only_review"
  | "needs_human_review"
  | "blocked";

export type ControlledOpenClawApprovalDecision =
  | "approve"
  | "reject"
  | "needs_review"
  | "blocked";

export type ControlledOpenClawApprovalCheckpoint =
  | "before_openclaw_activation"
  | "before_focus_target"
  | "before_paste"
  | "before_submit"
  | "before_accepting_codex_report"
  | "before_next_phase";

export type ControlledOpenClawPasteRiskCategory =
  | "wrong_window_focus"
  | "wrong_codex_session"
  | "accidental_submit"
  | "unsafe_prompt"
  | "stale_prompt"
  | "missing_human_approval"
  | "prompt_scope_mismatch"
  | "secret_exposure"
  | "irreversible_action"
  | "report_mismatch";

export type ControlledOpenClawRiskLikelihood =
  | "rare"
  | "possible"
  | "likely";

export type ControlledOpenClawRiskImpact =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type ControlledOpenClawRiskSeverity =
  | "monitor"
  | "needs_review"
  | "blocks_bridge";

export interface ControlledOpenClawSessionCheck {
  sessionCheckId: string;
  expectedApplication: string;
  expectedWindowTitleLabel: string;
  expectedProjectContext: string;
  expectedBranch: string;
  userConfirmed: boolean;
  confidence: ControlledOpenClawConfidence;
  blocking: boolean;
  failureAction: string;
  riskLevel: ControlledOpenClawRiskLevel;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface ControlledOpenClawPasteApproval {
  approvalId: string;
  bridgeId: string;
  beforeAction: ControlledOpenClawApprovalCheckpoint;
  decision: ControlledOpenClawApprovalDecision;
  approver: string;
  evidenceRequired: readonly string[];
  defaultDecision: ControlledOpenClawApprovalDecision;
  blockingIssues: readonly string[];
  riskLevel: ControlledOpenClawRiskLevel;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface ControlledOpenClawPasteRisk {
  riskId: string;
  category: ControlledOpenClawPasteRiskCategory;
  description: string;
  likelihood: ControlledOpenClawRiskLikelihood;
  impact: ControlledOpenClawRiskImpact;
  severity: ControlledOpenClawRiskSeverity;
  mitigation: string;
  blocker: boolean;
  rollbackHint: string;
  requiredApproval: string;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface ControlledOpenClawSafetyGate {
  gateId: string;
  gateName: string;
  requiredCondition: string;
  currentStatus: ControlledOpenClawGateStatus;
  blocking: boolean;
  evidenceRefs: readonly string[];
  failureAction: string;
  riskLevel: ControlledOpenClawRiskLevel;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface ControlledOpenClawAbortPlan {
  abortId: string;
  abortReason: string;
  triggeredBy: string;
  userVisibleMessage: string;
  safeNextAction: string;
  rollbackRequired: boolean;
  auditRequired: boolean;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface ControlledOpenClawPasteInput {
  bridgeId: string;
  sourceHandoffRef: string;
  automationLevel: ControlledOpenClawAutomationLevel;
  targetApplication: string;
  targetSessionLabel: string;
  promptRef: string;
  prePasteChecks: readonly string[];
  pasteAllowed: boolean;
  submitAllowed: boolean;
  humanApprovalRequired: boolean;
  abortConditions: readonly string[];
  auditRefs: readonly string[];
  riskLevel: ControlledOpenClawRiskLevel;
  limitations: readonly string[];
  sessionChecks: readonly ControlledOpenClawSessionCheck[];
  approvals: readonly ControlledOpenClawPasteApproval[];
  risks: readonly ControlledOpenClawPasteRisk[];
  safetyGates: readonly ControlledOpenClawSafetyGate[];
  abortPlans: readonly ControlledOpenClawAbortPlan[];
}

export interface ControlledOpenClawBridgeDecision {
  decisionId: string;
  bridgeId: string;
  automationLevel: ControlledOpenClawAutomationLevel;
  decisionStatus: ControlledOpenClawDecisionStatus;
  pasteAllowed: boolean;
  submitAllowed: false;
  blockingGateIds: readonly string[];
  blockingRiskIds: readonly string[];
  blockingApprovalIds: readonly string[];
  blockingSessionCheckIds: readonly string[];
  abortPlanRefs: readonly string[];
  requiredHumanApprovals: readonly ControlledOpenClawApprovalCheckpoint[];
  safeToContinue: boolean;
  recommendedNextAction: string;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noOpenClawInvocation: true;
  noSystemCopyBuffer: true;
  noPromptInsertion: true;
  noSubmit: true;
  noCodexInvocation: true;
  noProviderCalls: true;
  noFilesystemWrites: true;
}

export interface ControlledOpenClawBridgeSummary {
  summaryId: string;
  bridgeId: string;
  automationLevel: ControlledOpenClawAutomationLevel;
  decisionStatus: ControlledOpenClawDecisionStatus;
  sessionCheckCount: number;
  approvalCount: number;
  gateCount: number;
  blockingGateCount: number;
  riskCount: number;
  blockingRiskCount: number;
  abortPlanCount: number;
  pasteAllowed: boolean;
  submitAllowed: false;
  safeToContinue: boolean;
  recommendedNextPhase: string;
  safeSummary: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface ControlledOpenClawPasteBridge {
  input: ControlledOpenClawPasteInput;
  decision: ControlledOpenClawBridgeDecision;
  summary: ControlledOpenClawBridgeSummary;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noOpenClawInvocation: true;
  noSystemCopyBuffer: true;
  noPromptInsertion: true;
  noSubmit: true;
  noCodexInvocation: true;
  noProviderCalls: true;
  noFilesystemWrites: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
}

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const requiredApprovalCheckpoints: readonly ControlledOpenClawApprovalCheckpoint[] = [
  "before_openclaw_activation",
  "before_focus_target",
  "before_paste",
  "before_submit",
  "before_accepting_codex_report",
  "before_next_phase",
];

const futurePromptInsertLevel = "paste_assisted_future";

export function createControlledOpenClawSessionCheck(
  input: Omit<
    ControlledOpenClawSessionCheck,
    "advisoryOnly" | "sourceOnly" | "metadataOnly"
  >,
): ControlledOpenClawSessionCheck {
  return {
    ...input,
    blocking:
      input.blocking ||
      input.userConfirmed === false ||
      input.confidence === "low",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createControlledOpenClawPasteApproval(
  input: Omit<
    ControlledOpenClawPasteApproval,
    "advisoryOnly" | "sourceOnly" | "metadataOnly"
  >,
): ControlledOpenClawPasteApproval {
  return {
    ...input,
    evidenceRequired: uniqueStrings(input.evidenceRequired),
    blockingIssues: uniqueStrings(input.blockingIssues),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createControlledOpenClawPasteRisk(
  input: Omit<
    ControlledOpenClawPasteRisk,
    "advisoryOnly" | "sourceOnly" | "metadataOnly"
  >,
): ControlledOpenClawPasteRisk {
  return {
    ...input,
    blocker: input.blocker || input.severity === "blocks_bridge",
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createControlledOpenClawSafetyGate(
  input: Omit<
    ControlledOpenClawSafetyGate,
    "advisoryOnly" | "sourceOnly" | "metadataOnly"
  >,
): ControlledOpenClawSafetyGate {
  return {
    ...input,
    blocking:
      input.blocking ||
      input.currentStatus === "failed" ||
      input.currentStatus === "blocked",
    evidenceRefs: uniqueStrings(input.evidenceRefs),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createControlledOpenClawAbortPlan(
  input: Omit<
    ControlledOpenClawAbortPlan,
    "advisoryOnly" | "sourceOnly" | "metadataOnly"
  >,
): ControlledOpenClawAbortPlan {
  return {
    ...input,
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function selectBlockingOpenClawGates(
  gates: readonly ControlledOpenClawSafetyGate[],
): ControlledOpenClawSafetyGate[] {
  return gates.filter(
    (gate) =>
      gate.blocking ||
      gate.currentStatus === "failed" ||
      gate.currentStatus === "blocked",
  );
}

export function selectOpenClawRisksByCategory(
  risks: readonly ControlledOpenClawPasteRisk[],
  category: ControlledOpenClawPasteRiskCategory,
): ControlledOpenClawPasteRisk[] {
  return risks.filter((risk) => risk.category === category);
}

const allRequiredApprovalsGranted = (
  approvals: readonly ControlledOpenClawPasteApproval[],
): boolean =>
  requiredApprovalCheckpoints.every((checkpoint) =>
    approvals.some(
      (approval) =>
        approval.beforeAction === checkpoint &&
        approval.decision === "approve" &&
        approval.blockingIssues.length === 0,
    ),
  );

const missingOrBlockingApprovals = (
  approvals: readonly ControlledOpenClawPasteApproval[],
): ControlledOpenClawPasteApproval[] =>
  approvals.filter(
    (approval) =>
      approval.decision !== "approve" || approval.blockingIssues.length > 0,
  );

const prePasteChecksPassed = (
  checks: readonly string[],
): boolean => {
  const requiredChecks = [
    "handoff:approved_for_copy",
    "handoff:no_blocking_issues",
    "safe_to_execute:false",
    "target_session:user_confirmed",
    "prompt_identity:verified",
    "abort:available",
  ];

  return requiredChecks.every((requiredCheck) => checks.includes(requiredCheck));
};

export function evaluateControlledOpenClawPasteBridge(
  input: ControlledOpenClawPasteInput,
): ControlledOpenClawBridgeDecision {
  const blockingGates = selectBlockingOpenClawGates(input.safetyGates);
  const blockingRisks = input.risks.filter((risk) => risk.blocker);
  const blockingSessions = input.sessionChecks.filter((check) => check.blocking);
  const blockingApprovals = missingOrBlockingApprovals(input.approvals);
  const approvalsGranted = allRequiredApprovalsGranted(input.approvals);
  const requestedBlockedLevel =
    input.automationLevel === "blocked" ||
    input.automationLevel === "execute_assisted_future";
  const submitRequested = input.submitAllowed === true;
  const allMetadataChecksPass =
    blockingGates.length === 0 &&
    blockingRisks.length === 0 &&
    blockingSessions.length === 0 &&
    blockingApprovals.length === 0 &&
    approvalsGranted &&
    input.humanApprovalRequired === true &&
    prePasteChecksPassed(input.prePasteChecks);

  const pasteAllowed =
    input.pasteAllowed === true &&
    input.automationLevel === futurePromptInsertLevel &&
    allMetadataChecksPass &&
    submitRequested === false;

  const decisionStatus: ControlledOpenClawDecisionStatus =
    requestedBlockedLevel || submitRequested
      ? "blocked"
      : blockingGates.length > 0 ||
          blockingRisks.length > 0 ||
          blockingSessions.length > 0 ||
          blockingApprovals.length > 0 ||
          approvalsGranted === false
        ? "blocked"
        : pasteAllowed
          ? "future_ready_metadata"
          : input.automationLevel === "manual_only"
            ? "manual_only_review"
            : "needs_human_review";

  const safeToContinue =
    decisionStatus === "future_ready_metadata" ||
    decisionStatus === "manual_only_review";

  return {
    decisionId: `${input.bridgeId}:decision`,
    bridgeId: input.bridgeId,
    automationLevel: input.automationLevel,
    decisionStatus,
    pasteAllowed,
    submitAllowed: false,
    blockingGateIds: blockingGates.map((gate) => gate.gateId),
    blockingRiskIds: blockingRisks.map((risk) => risk.riskId),
    blockingApprovalIds: blockingApprovals.map((approval) => approval.approvalId),
    blockingSessionCheckIds: blockingSessions.map((check) => check.sessionCheckId),
    abortPlanRefs: input.abortPlans.map((plan) => plan.abortId),
    requiredHumanApprovals: [...requiredApprovalCheckpoints],
    safeToContinue,
    recommendedNextAction: safeToContinue
      ? "continue_to_report_return_plan"
      : "abort_and_return_to_manual_only",
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noOpenClawInvocation: true,
    noSystemCopyBuffer: true,
    noPromptInsertion: true,
    noSubmit: true,
    noCodexInvocation: true,
    noProviderCalls: true,
    noFilesystemWrites: true,
  };
}

export function summarizeControlledOpenClawPasteBridge(input: {
  bridgeId: string;
  automationLevel: ControlledOpenClawAutomationLevel;
  sessionChecks: readonly ControlledOpenClawSessionCheck[];
  approvals: readonly ControlledOpenClawPasteApproval[];
  risks: readonly ControlledOpenClawPasteRisk[];
  gates: readonly ControlledOpenClawSafetyGate[];
  abortPlans: readonly ControlledOpenClawAbortPlan[];
  decision: ControlledOpenClawBridgeDecision;
  recommendedNextPhase?: string;
}): ControlledOpenClawBridgeSummary {
  const blockingGateCount = selectBlockingOpenClawGates(input.gates).length;
  const blockingRiskCount = input.risks.filter((risk) => risk.blocker).length;

  return {
    summaryId: `${input.bridgeId}:summary`,
    bridgeId: input.bridgeId,
    automationLevel: input.automationLevel,
    decisionStatus: input.decision.decisionStatus,
    sessionCheckCount: input.sessionChecks.length,
    approvalCount: input.approvals.length,
    gateCount: input.gates.length,
    blockingGateCount,
    riskCount: input.risks.length,
    blockingRiskCount,
    abortPlanCount: input.abortPlans.length,
    pasteAllowed: input.decision.pasteAllowed,
    submitAllowed: false,
    safeToContinue: input.decision.safeToContinue,
    recommendedNextPhase:
      input.recommendedNextPhase ??
      "PILOT-8B - CONTROLLED CODEX REPORT RETURN PLAN",
    safeSummary:
      input.decision.decisionStatus === "future_ready_metadata"
        ? "Future bridge metadata is ready for human review; no action is performed."
        : "Future bridge metadata remains blocked, manual-only, or review-gated.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
  };
}

export function createControlledOpenClawPasteBridge(
  input: ControlledOpenClawPasteInput,
): ControlledOpenClawPasteBridge {
  const decision = evaluateControlledOpenClawPasteBridge(input);
  const summary = summarizeControlledOpenClawPasteBridge({
    bridgeId: input.bridgeId,
    automationLevel: input.automationLevel,
    sessionChecks: input.sessionChecks,
    approvals: input.approvals,
    risks: input.risks,
    gates: input.safetyGates,
    abortPlans: input.abortPlans,
    decision,
  });

  return {
    input,
    decision,
    summary,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noOpenClawInvocation: true,
    noSystemCopyBuffer: true,
    noPromptInsertion: true,
    noSubmit: true,
    noCodexInvocation: true,
    noProviderCalls: true,
    noFilesystemWrites: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
  };
}
