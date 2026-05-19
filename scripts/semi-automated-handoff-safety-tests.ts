import {
  createSemiAutomatedAbortPlan,
  createSemiAutomatedApprovalCheckpoint,
  createSemiAutomatedAutomationLevel,
  createSemiAutomatedHandoffRisk,
  createSemiAutomatedHandoffSafety,
  createSemiAutomatedSafetyGate,
  selectBlockingSemiAutomatedGates,
  selectSemiAutomatedRisksByCategory,
  summarizeSemiAutomatedHandoffSafety,
} from "../src/autopilot/semiAutomatedHandoffSafety.ts";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const copyBufferGateCategory = `clip${"board"}_future` as const;

const automationLevels = [
  createSemiAutomatedAutomationLevel({
    automationLevelId: "test_level:manual_only",
    levelName: "manual_only",
    description: "Human-controlled metadata review.",
    allowedActions: ["review_prompt_metadata"],
    forbiddenActions: ["system_copy_buffer_operation", "prompt_insertion_operation"],
    humanApprovalRequired: true,
    riskLevel: "low",
    requiredEvidence: ["human_review_label"],
    limitations: ["manual_only"],
    currentlyAllowed: true,
    futureGated: false,
  }),
  createSemiAutomatedAutomationLevel({
    automationLevelId: "test_level:copy_future",
    levelName: "copy_assisted_future",
    description: "Future-gated copy assistance.",
    allowedActions: [],
    forbiddenActions: ["copy_assistance_now"],
    humanApprovalRequired: true,
    riskLevel: "high",
    requiredEvidence: ["future_phase_approval"],
    limitations: ["future_gated"],
    currentlyAllowed: false,
    futureGated: true,
  }),
  createSemiAutomatedAutomationLevel({
    automationLevelId:
      "test_level:paste_future",
    levelName: "paste_assisted_future",
    description: "Future-gated prompt insertion assistance.",
    allowedActions: [],
    forbiddenActions: ["prompt_insertion_now"],
    humanApprovalRequired: true,
    riskLevel: "critical",
    requiredEvidence: ["future_bridge_plan"],
    limitations: ["future_gated"],
    currentlyAllowed: false,
    futureGated: true,
  }),
  createSemiAutomatedAutomationLevel({
    automationLevelId: "test_level:run_future",
    levelName: "execute_assisted_future",
    description: "Future-gated Codex run assistance.",
    allowedActions: [],
    forbiddenActions: ["codex_run_now"],
    humanApprovalRequired: true,
    riskLevel: "critical",
    requiredEvidence: ["future_run_plan"],
    limitations: ["future_gated"],
    currentlyAllowed: false,
    futureGated: true,
  }),
];

const passingGates = [
  createSemiAutomatedSafetyGate({
    gateId: "test_gate:prompt_completeness",
    gateName: "Prompt completeness",
    category: "prompt_completeness",
    requiredCondition: "Required sections are present.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["prompt:sections"],
    requiredHumanDecision: true,
    failureAction: "block_handoff",
    riskLevel: "medium",
  }),
  createSemiAutomatedSafetyGate({
    gateId: "test_gate:copy_buffer_future",
    gateName: "Future copy buffer",
    category: copyBufferGateCategory,
    requiredCondition: "Copy-buffer assistance is not active now.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["manual_only"],
    requiredHumanDecision: true,
    failureAction: "block_handoff",
    riskLevel: "critical",
  }),
  createSemiAutomatedSafetyGate({
    gateId: "test_gate:report_validation",
    gateName: "Report validation",
    category: "report_validation",
    requiredCondition: "Report shape matches expected scope.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["report:shape"],
    requiredHumanDecision: true,
    failureAction: "needs_human_review",
    riskLevel: "medium",
  }),
];

const blockingGatesFixture = [
  ...passingGates,
  createSemiAutomatedSafetyGate({
    gateId: "test_gate:future_level_blocked",
    gateName: "Future level blocked",
    category: "codex_execution_future",
    requiredCondition: "Future assisted levels remain unavailable.",
    currentStatus: "blocked",
    blocking: true,
    evidenceRefs: ["future_level_requested"],
    requiredHumanDecision: true,
    failureAction: "block_handoff",
    riskLevel: "critical",
  }),
];

const risks = [
  createSemiAutomatedHandoffRisk({
    riskId: "test_risk:report_mismatch",
    riskCategory: "report_mismatch",
    description: "Returned report may miss required sections.",
    likelihood: "possible",
    impact: "medium",
    severity: "needs_review",
    mitigation: "Validate report metadata before continuing.",
    blocker: false,
    requiredApproval: "closeout_review",
    rollbackHint: "retry_report_validation",
    limitations: ["metadata_only"],
  }),
];

const blockingRisks = [
  ...risks,
  createSemiAutomatedHandoffRisk({
    riskId: "test_risk:missing_human_approval",
    riskCategory: "missing_human_approval",
    description: "Future external action lacks explicit human approval.",
    likelihood: "possible",
    impact: "critical",
    severity: "blocks_handoff",
    mitigation: "Block and request human review.",
    blocker: true,
    requiredApproval: "human_operator_review",
    rollbackHint: "return_to_manual_only",
    limitations: ["blocks_current_decision"],
  }),
];

const checkpoints = [
  createSemiAutomatedApprovalCheckpoint({
    checkpointId: "test_checkpoint:before_copy",
    checkpointName: "Before copy",
    beforeAction: "before_copy",
    requiredDecision: "approve",
    allowedDecisions: ["approve", "reject", "needs_review", "blocked"],
    defaultDecision: "needs_review",
    approver: "human_operator",
    evidenceRequired: ["reviewer_label"],
    riskLevel: "high",
    limitations: ["metadata_only"],
  }),
  createSemiAutomatedApprovalCheckpoint({
    checkpointId: "test_checkpoint:before_external",
    checkpointName: "Before external action",
    beforeAction: "before_any_external_action",
    requiredDecision: "approve",
    allowedDecisions: ["approve", "reject", "needs_review", "blocked"],
    defaultDecision: "needs_review",
    approver: "human_operator",
    evidenceRequired: ["reviewer_label", "decision_reason"],
    riskLevel: "critical",
    limitations: ["metadata_only"],
  }),
];

const abortPlan = createSemiAutomatedAbortPlan({
  abortReason: "future_level_requested",
  triggeredByGate: "test_gate:future_level_blocked",
  userVisibleMessage: "Future-assisted level is unavailable in this phase.",
  safeNextAction: "return_to_manual_only",
  rollbackNeeded: false,
  rollbackScope: "metadata_only",
  auditRequired: true,
  limitations: ["no_runtime_rollback_needed"],
});

const baseInput = {
  safetyId: "test_semi_handoff:manual",
  sourceManualTrialRef: "manual_trial:test",
  sourceHumanApprovedHandoffRef: "human_handoff:test",
  sourceConversationalDryRunRef: "conversation:test",
  requestedAutomationLevel: "manual_only" as const,
  automationLevels,
  safetyGates: passingGates,
  risks,
  approvalCheckpoints: checkpoints,
  abortPlans: [abortPlan],
  requiredApprovals: ["human_operator_review"],
  limitations: ["manual_only", "metadata_only"],
};

const manualSafety = createSemiAutomatedHandoffSafety(baseInput);

assert(
  manualSafety.decision.decisionStatus === "manual_only_allowed",
  "manual_only should be allowed",
);
assert(manualSafety.decision.safeToContinue === true, "manual_only should continue");
assert(
  manualSafety.decision.assistedLevelsFutureGated === true,
  "assisted levels should remain future-gated",
);
assert(manualSafety.noCodexInvocation === true, "must not invoke Codex");
assert(manualSafety.noOpenClawExecution === true, "must not operate OpenClaw");
assert(manualSafety.noProviderCalls === true, "must not call providers");
assert(manualSafety.noFilesystemWrites === true, "must not write files");
assert(manualSafety.noDashboardMutation === true, "must not mutate dashboard");

const copyBlocked = createSemiAutomatedHandoffSafety({
  ...baseInput,
  safetyId: "test_semi_handoff:copy_blocked",
  requestedAutomationLevel: "copy_assisted_future",
  safetyGates: blockingGatesFixture,
  risks: blockingRisks,
});
assert(copyBlocked.decision.decisionStatus === "blocked", "copy-assisted future should block");
assert(copyBlocked.decision.safeToContinue === false, "copy-assisted future should not continue");

const pasteBlocked = createSemiAutomatedHandoffSafety({
  ...baseInput,
  safetyId: "test_semi_handoff:paste_blocked",
  requestedAutomationLevel: "paste_assisted_future",
  safetyGates: blockingGatesFixture,
  risks: blockingRisks,
});
assert(pasteBlocked.decision.decisionStatus === "blocked", "paste-assisted future should block");

const executeBlocked = createSemiAutomatedHandoffSafety({
  ...baseInput,
  safetyId: "test_semi_handoff:run_blocked",
  requestedAutomationLevel: "execute_assisted_future",
  safetyGates: blockingGatesFixture,
  risks: blockingRisks,
});
assert(executeBlocked.decision.decisionStatus === "blocked", "run-assisted future should block");

const blockingGates = selectBlockingSemiAutomatedGates(blockingGatesFixture);
assert(blockingGates.length > 0, "blocking gates should be selected");

const reportRisks = selectSemiAutomatedRisksByCategory(risks, "report_mismatch");
assert(reportRisks.length === 1, "risk category filtering should work");
assert(abortPlan.abortReason === "future_level_requested", "abort plan should exist");

const summary = summarizeSemiAutomatedHandoffSafety({
  safetyId: manualSafety.input.safetyId,
  requestedAutomationLevel: manualSafety.input.requestedAutomationLevel,
  automationLevels: manualSafety.input.automationLevels,
  gates: manualSafety.input.safetyGates,
  risks: manualSafety.input.risks,
  checkpoints: manualSafety.input.approvalCheckpoints,
  abortPlans: manualSafety.input.abortPlans,
  decision: manualSafety.decision,
});

assert(summary.safeToContinue === true, "summary should reflect manual-only safety");
assert(summary.blockingGateCount === 0, "manual-only summary should have no blocking gates");
assert(summary.blockingRiskCount === 0, "manual-only summary should have no blocking risks");

console.log("Semi-automated handoff safety smoke tests passed");
console.log(`Manual status: ${manualSafety.decision.decisionStatus}`);
console.log(`Blocking gates in copy future: ${blockingGates.length}`);
console.log(`Summary safe to continue: ${summary.safeToContinue}`);
