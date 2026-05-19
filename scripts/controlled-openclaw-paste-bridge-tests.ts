import {
  createControlledOpenClawAbortPlan,
  createControlledOpenClawPasteApproval,
  createControlledOpenClawPasteBridge,
  createControlledOpenClawPasteRisk,
  createControlledOpenClawSafetyGate,
  createControlledOpenClawSessionCheck,
  selectBlockingOpenClawGates,
  selectOpenClawRisksByCategory,
} from "../src/autopilot/controlledOpenClawPasteBridge.ts";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const sessionCheck = createControlledOpenClawSessionCheck({
  sessionCheckId: "test_session:confirmed",
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

const futurePromptInsertLevel = "paste_assisted_future" as const;

const wrongSessionCheck = createControlledOpenClawSessionCheck({
  ...sessionCheck,
  sessionCheckId: "test_session:wrong",
  userConfirmed: false,
  confidence: "low",
  blocking: true,
});

const approvals = [
  "before_openclaw_activation",
  "before_focus_target",
  "before_paste",
  "before_submit",
  "before_accepting_codex_report",
  "before_next_phase",
].map((beforeAction) =>
  createControlledOpenClawPasteApproval({
    approvalId: `test_approval:${beforeAction}`,
    bridgeId: "test_bridge:safe_future",
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

const missingApproval = approvals.map((approval) =>
  approval.beforeAction === "before_submit"
    ? createControlledOpenClawPasteApproval({
        ...approval,
        approvalId: "test_approval:missing_send_review",
        decision: "needs_review",
        blockingIssues: ["pre_send_review_missing"],
      })
    : approval,
);

const reportRisk = createControlledOpenClawPasteRisk({
  riskId: "test_risk:report_mismatch",
  category: "report_mismatch",
  description: "Returned report may miss required sections.",
  likelihood: "possible",
  impact: "medium",
  severity: "needs_review",
  mitigation: "Validate report metadata.",
  blocker: false,
  rollbackHint: "retry_report_validation",
  requiredApproval: "closeout_review",
  limitations: ["metadata_only"],
});

const unsafePromptRisk = createControlledOpenClawPasteRisk({
  riskId: "test_risk:unsafe_prompt",
  category: "unsafe_prompt",
  description: "Prompt boundaries are unsafe.",
  likelihood: "possible",
  impact: "critical",
  severity: "blocks_bridge",
  mitigation: "Repair prompt metadata.",
  blocker: true,
  rollbackHint: "repair_prompt_metadata",
  requiredApproval: "safety_review",
  limitations: ["blocks_bridge"],
});

const passingGates = [
  createControlledOpenClawSafetyGate({
    gateId: "test_gate:handoff_approved",
    gateName: "Handoff approved",
    requiredCondition: "Handoff package is approved for copy.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["handoff:approved_for_copy"],
    failureAction: "block_bridge",
    riskLevel: "high",
  }),
  createControlledOpenClawSafetyGate({
    gateId: "test_gate:safe_to_execute_false",
    gateName: "Safe-to-execute flag",
    requiredCondition: "safeToExecute remains false.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["handoff:safe_to_execute_false"],
    failureAction: "block_bridge",
    riskLevel: "critical",
  }),
];

const blockingGate = createControlledOpenClawSafetyGate({
  gateId: "test_gate:unsafe_prompt",
  gateName: "Unsafe prompt",
  requiredCondition: "Prompt boundaries are safe.",
  currentStatus: "blocked",
  blocking: true,
  evidenceRefs: ["prompt:safety_blocked"],
  failureAction: "block_bridge",
  riskLevel: "critical",
});

const abortPlan = createControlledOpenClawAbortPlan({
  abortId: "test_abort:uncertain_session",
  abortReason: "session_identity_uncertain",
  triggeredBy: "test_gate:handoff_approved",
  userVisibleMessage: "Target session is uncertain.",
  safeNextAction: "return_to_manual_only",
  rollbackRequired: false,
  auditRequired: true,
  limitations: ["metadata_only"],
});

const baseBridge = {
  bridgeId: "test_bridge:safe_future",
  sourceHandoffRef: "human_approved_handoff:test",
  automationLevel: futurePromptInsertLevel,
  targetApplication: "Codex desktop",
  targetSessionLabel: "ORQUESTADOR-PRIME dev handoff",
  promptRef: "prompt:test",
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
  riskLevel: "critical" as const,
  limitations: ["metadata_only", "future_gated"],
  sessionChecks: [sessionCheck],
  approvals,
  risks: [reportRisk],
  safetyGates: passingGates,
  abortPlans: [abortPlan],
};

const safeBridge = createControlledOpenClawPasteBridge(baseBridge);
assert(safeBridge.input.bridgeId.length > 0, "bridge should be created");
assert(sessionCheck.userConfirmed === true, "session check should be user-confirmed");
assert(approvals.length === 6, "all approval checkpoints should exist");
assert(reportRisk.category === "report_mismatch", "risk should be created");
assert(abortPlan.abortId.length > 0, "abort plan should exist");
assert(safeBridge.decision.decisionStatus === "future_ready_metadata", "safe future metadata should pass");
assert(safeBridge.decision.pasteAllowed === true, "future metadata can mark pasteAllowed");
assert(safeBridge.decision.submitAllowed === false, "submitAllowed must remain false");
assert(safeBridge.noOpenClawInvocation === true, "must not invoke OpenClaw");
assert(safeBridge.noSystemCopyBuffer === true, "must not use system copy buffer");
assert(safeBridge.noPromptInsertion === true, "must not insert prompts");
assert(safeBridge.noSubmit === true, "must not send");
assert(safeBridge.noCodexInvocation === true, "must not invoke Codex");
assert(safeBridge.noFilesystemWrites === true, "must not write files");

const wrongSessionBridge = createControlledOpenClawPasteBridge({
  ...baseBridge,
  bridgeId: "test_bridge:wrong_session",
  sessionChecks: [wrongSessionCheck],
});
assert(wrongSessionBridge.decision.decisionStatus === "blocked", "wrong session should block");
assert(wrongSessionBridge.decision.pasteAllowed === false, "wrong session should not allow paste metadata");

const missingApprovalBridge = createControlledOpenClawPasteBridge({
  ...baseBridge,
  bridgeId: "test_bridge:missing_approval",
  approvals: missingApproval,
});
assert(missingApprovalBridge.decision.decisionStatus === "blocked", "missing approval should block");

const unsafePromptBridge = createControlledOpenClawPasteBridge({
  ...baseBridge,
  bridgeId: "test_bridge:unsafe_prompt",
  risks: [reportRisk, unsafePromptRisk],
  safetyGates: [...passingGates, blockingGate],
});
assert(unsafePromptBridge.decision.decisionStatus === "blocked", "unsafe prompt should block");

const selectedGates = selectBlockingOpenClawGates([...passingGates, blockingGate]);
assert(selectedGates.length === 1, "blocking gates should be selected");

const selectedRisks = selectOpenClawRisksByCategory([reportRisk, unsafePromptRisk], "unsafe_prompt");
assert(selectedRisks.length === 1, "risk category filtering should work");

console.log("Controlled OpenClaw paste bridge smoke tests passed");
console.log(`Safe bridge status: ${safeBridge.decision.decisionStatus}`);
console.log(`Wrong session status: ${wrongSessionBridge.decision.decisionStatus}`);
console.log(`Submit allowed: ${safeBridge.decision.submitAllowed}`);
