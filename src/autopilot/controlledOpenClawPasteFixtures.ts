import {
  createControlledOpenClawAbortPlan,
  createControlledOpenClawPasteApproval,
  createControlledOpenClawPasteRisk,
  createControlledOpenClawSafetyGate,
  createControlledOpenClawSessionCheck,
  type ControlledOpenClawAbortPlan,
  type ControlledOpenClawPasteApproval,
  type ControlledOpenClawPasteInput,
  type ControlledOpenClawPasteRisk,
  type ControlledOpenClawSafetyGate,
  type ControlledOpenClawSessionCheck,
} from "./controlledOpenClawPasteBridge.js";

const futurePromptInsertLevel = "paste_assisted_future" as const;

export const controlledOpenClawSessionCheckFixture: ControlledOpenClawSessionCheck =
  createControlledOpenClawSessionCheck({
    sessionCheckId: "controlled_openclaw_session:codex_dev",
    expectedApplication: "Codex desktop",
    expectedWindowTitleLabel: "ORQUESTADOR-PRIME dev handoff",
    expectedProjectContext: "/home/varyan/projects/ORQUESTADOR-PRIME",
    expectedBranch: "dev",
    userConfirmed: true,
    confidence: "high",
    blocking: false,
    failureAction: "abort_and_return_to_manual_only",
    riskLevel: "high",
  });

export const controlledOpenClawWrongSessionCheckFixture: ControlledOpenClawSessionCheck =
  createControlledOpenClawSessionCheck({
    ...controlledOpenClawSessionCheckFixture,
    sessionCheckId: "controlled_openclaw_session:wrong_session",
    userConfirmed: false,
    confidence: "low",
    blocking: true,
  });

const controlledOpenClawApprovalActions = [
  "before_openclaw_activation",
  "before_focus_target",
  "before_paste",
  "before_submit",
  "before_accepting_codex_report",
  "before_next_phase",
] as const satisfies readonly ControlledOpenClawPasteApproval["beforeAction"][];

export const controlledOpenClawApprovalsFixture: readonly ControlledOpenClawPasteApproval[] =
  controlledOpenClawApprovalActions.map((beforeAction) =>
    createControlledOpenClawPasteApproval({
      approvalId: `controlled_openclaw_approval:${beforeAction}`,
      bridgeId: "controlled_openclaw_bridge:future_safe",
      beforeAction,
      decision: "approve",
      approver: "human_operator",
      evidenceRequired: ["reviewer_label", "decision_reason"],
      defaultDecision: "needs_review",
      blockingIssues: [],
      riskLevel:
        beforeAction === "before_paste" || beforeAction === "before_submit"
          ? "critical"
          : "high",
    }),
  );

export const controlledOpenClawMissingApprovalFixture: readonly ControlledOpenClawPasteApproval[] = [
  ...controlledOpenClawApprovalsFixture.filter(
    (approval) => approval.beforeAction !== "before_submit",
  ),
  createControlledOpenClawPasteApproval({
    approvalId: "controlled_openclaw_approval:missing_submit",
    bridgeId: "controlled_openclaw_bridge:missing_approval",
    beforeAction: "before_submit",
    decision: "needs_review",
    approver: "human_operator",
    evidenceRequired: ["reviewer_label", "decision_reason"],
    defaultDecision: "needs_review",
    blockingIssues: ["pre_send_review_missing"],
    riskLevel: "critical",
  }),
];

export const controlledOpenClawRisksFixture: readonly ControlledOpenClawPasteRisk[] = [
  createControlledOpenClawPasteRisk({
    riskId: "controlled_openclaw_risk:wrong_session",
    category: "wrong_codex_session",
    description: "Target session could be different from the reviewed handoff context.",
    likelihood: "possible",
    impact: "critical",
    severity: "needs_review",
    mitigation: "Require user-confirmed target session and project context.",
    blocker: false,
    rollbackHint: "return_to_manual_only",
    requiredApproval: "human_operator_review",
    limitations: ["metadata_only"],
  }),
  createControlledOpenClawPasteRisk({
    riskId: "controlled_openclaw_risk:report_mismatch",
    category: "report_mismatch",
    description: "Returned report could omit expected validation sections.",
    likelihood: "possible",
    impact: "medium",
    severity: "needs_review",
    mitigation: "Route report through validation and closeout metadata.",
    blocker: false,
    rollbackHint: "retry_report_validation",
    requiredApproval: "closeout_review",
    limitations: ["metadata_only"],
  }),
];

export const controlledOpenClawUnsafePromptRiskFixture: ControlledOpenClawPasteRisk =
  createControlledOpenClawPasteRisk({
    riskId: "controlled_openclaw_risk:unsafe_prompt",
    category: "unsafe_prompt",
    description: "Prompt boundaries are unsafe or incomplete.",
    likelihood: "possible",
    impact: "critical",
    severity: "blocks_bridge",
    mitigation: "Block bridge and repair prompt metadata.",
    blocker: true,
    rollbackHint: "repair_prompt_metadata",
    requiredApproval: "safety_review",
    limitations: ["blocks_bridge"],
  });

export const controlledOpenClawSafetyGatesFixture: readonly ControlledOpenClawSafetyGate[] = [
  createControlledOpenClawSafetyGate({
    gateId: "controlled_openclaw_gate:handoff_approved",
    gateName: "Handoff approved",
    requiredCondition: "Handoff package is approved for copy.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["human_approved_handoff:approved_for_copy"],
    failureAction: "block_bridge",
    riskLevel: "high",
  }),
  createControlledOpenClawSafetyGate({
    gateId: "controlled_openclaw_gate:safe_to_execute_false",
    gateName: "Safe-to-execute flag",
    requiredCondition: "safeToExecute remains false.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["human_approved_handoff:safe_to_execute_false"],
    failureAction: "block_bridge",
    riskLevel: "critical",
  }),
  createControlledOpenClawSafetyGate({
    gateId: "controlled_openclaw_gate:target_session_confirmed",
    gateName: "Target session confirmed",
    requiredCondition: "Target session is user-confirmed.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["session_check:user_confirmed"],
    failureAction: "abort_and_return_to_manual_only",
    riskLevel: "critical",
  }),
  createControlledOpenClawSafetyGate({
    gateId: "controlled_openclaw_gate:abort_available",
    gateName: "Abort available",
    requiredCondition: "Abort plan exists before any future bridge step.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["abort_plan:available"],
    failureAction: "block_bridge",
    riskLevel: "high",
  }),
];

export const controlledOpenClawUnsafePromptGateFixture: ControlledOpenClawSafetyGate =
  createControlledOpenClawSafetyGate({
    gateId: "controlled_openclaw_gate:unsafe_prompt",
    gateName: "Unsafe prompt",
    requiredCondition: "Prompt boundaries are safe.",
    currentStatus: "blocked",
    blocking: true,
    evidenceRefs: ["prompt:safety_blocked"],
    failureAction: "block_bridge",
    riskLevel: "critical",
  });

export const controlledOpenClawAbortPlanFixture: ControlledOpenClawAbortPlan =
  createControlledOpenClawAbortPlan({
    abortId: "controlled_openclaw_abort:uncertain_session",
    abortReason: "session_identity_uncertain",
    triggeredBy: "controlled_openclaw_gate:target_session_confirmed",
    userVisibleMessage: "Target session is uncertain; return to manual-only handoff.",
    safeNextAction: "return_to_manual_only",
    rollbackRequired: false,
    auditRequired: true,
    limitations: ["metadata_only"],
  });

export const controlledOpenClawSafeFutureBridgeFixture: ControlledOpenClawPasteInput = {
  bridgeId: "controlled_openclaw_bridge:future_safe",
  sourceHandoffRef: "human_approved_codex_handoff:habit_world_v1",
  automationLevel: futurePromptInsertLevel,
  targetApplication: "Codex desktop",
  targetSessionLabel: "ORQUESTADOR-PRIME dev handoff",
  promptRef: "prompt_draft:habit_world_v1",
  prePasteChecks: [
    "handoff:approved_for_copy",
    "handoff:no_blocking_issues",
    "safe_to_execute:false",
    "target_session:user_confirmed",
    "prompt_identity:verified",
    "abort:available",
  ],
  pasteAllowed: true,
  submitAllowed: false,
  humanApprovalRequired: true,
  abortConditions: ["session_identity_uncertain", "human_approval_missing"],
  auditRefs: ["approval:before_paste", "approval:before_submit"],
  riskLevel: "critical",
  limitations: ["metadata_only", "future_gated", "no_runtime_action"],
  sessionChecks: [controlledOpenClawSessionCheckFixture],
  approvals: controlledOpenClawApprovalsFixture,
  risks: controlledOpenClawRisksFixture,
  safetyGates: controlledOpenClawSafetyGatesFixture,
  abortPlans: [controlledOpenClawAbortPlanFixture],
};

export const controlledOpenClawWrongSessionBridgeFixture: ControlledOpenClawPasteInput = {
  ...controlledOpenClawSafeFutureBridgeFixture,
  bridgeId: "controlled_openclaw_bridge:wrong_session",
  sessionChecks: [controlledOpenClawWrongSessionCheckFixture],
};

export const controlledOpenClawMissingApprovalBridgeFixture: ControlledOpenClawPasteInput = {
  ...controlledOpenClawSafeFutureBridgeFixture,
  bridgeId: "controlled_openclaw_bridge:missing_approval",
  approvals: controlledOpenClawMissingApprovalFixture,
};

export const controlledOpenClawUnsafePromptBridgeFixture: ControlledOpenClawPasteInput = {
  ...controlledOpenClawSafeFutureBridgeFixture,
  bridgeId: "controlled_openclaw_bridge:unsafe_prompt",
  risks: [...controlledOpenClawRisksFixture, controlledOpenClawUnsafePromptRiskFixture],
  safetyGates: [
    ...controlledOpenClawSafetyGatesFixture,
    controlledOpenClawUnsafePromptGateFixture,
  ],
};
