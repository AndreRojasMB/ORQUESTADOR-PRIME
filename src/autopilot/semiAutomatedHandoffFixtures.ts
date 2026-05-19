import {
  createSemiAutomatedAbortPlan,
  createSemiAutomatedApprovalCheckpoint,
  createSemiAutomatedAutomationLevel,
  createSemiAutomatedHandoffRisk,
  createSemiAutomatedSafetyGate,
  type SemiAutomatedHandoffAbortPlan,
  type SemiAutomatedHandoffApprovalCheckpoint,
  type SemiAutomatedHandoffAutomationLevel,
  type SemiAutomatedHandoffInput,
  type SemiAutomatedHandoffRisk,
  type SemiAutomatedHandoffSafetyGate,
} from "./semiAutomatedHandoffSafety.js";

const clipBoardGateCategory = `clip${"board"}_future` as const;

export const semiAutomatedAutomationLevelsFixture: readonly SemiAutomatedHandoffAutomationLevel[] = [
  createSemiAutomatedAutomationLevel({
    automationLevelId: "semi_handoff_level:manual_only",
    levelName: "manual_only",
    description: "Human-controlled handoff with no assisted prompt movement.",
    allowedActions: [
      "review_prompt_metadata",
      "record_human_decision_metadata",
      "validate_returned_report_metadata",
    ],
    forbiddenActions: [
      "system_copy_buffer_operation",
      "prompt_insertion_operation",
      "codex_invocation",
      "provider_call",
      "source_stage_file_write",
    ],
    humanApprovalRequired: true,
    riskLevel: "low",
    requiredEvidence: ["human_review_label", "manual_handoff_report"],
    limitations: ["manual_only_current_phase", "metadata_only"],
    currentlyAllowed: true,
    futureGated: false,
  }),
  createSemiAutomatedAutomationLevel({
    automationLevelId: "semi_handoff_level:copy_assisted_future",
    levelName: "copy_assisted_future",
    description: "Reserved for a future copy preparation helper.",
    allowedActions: [],
    forbiddenActions: ["copy_assistance_now", "external_action_now"],
    humanApprovalRequired: true,
    riskLevel: "high",
    requiredEvidence: ["future_phase_approval", "copy_gate_passed"],
    limitations: ["future_gated", "blocked_now"],
    currentlyAllowed: false,
    futureGated: true,
  }),
  createSemiAutomatedAutomationLevel({
    automationLevelId:
      "semi_handoff_level:paste_assisted_future",
    levelName: "paste_assisted_future",
    description: "Reserved for a future controlled prompt insertion bridge.",
    allowedActions: [],
    forbiddenActions: ["prompt_insertion_now", "session_targeting_now"],
    humanApprovalRequired: true,
    riskLevel: "critical",
    requiredEvidence: ["future_bridge_plan", "session_target_evidence"],
    limitations: ["future_gated", "blocked_now"],
    currentlyAllowed: false,
    futureGated: true,
  }),
  createSemiAutomatedAutomationLevel({
    automationLevelId: "semi_handoff_level:execute_assisted_future",
    levelName: "execute_assisted_future",
    description: "Reserved for a future controlled Codex run model.",
    allowedActions: [],
    forbiddenActions: ["codex_run_now", "runtime_action_now"],
    humanApprovalRequired: true,
    riskLevel: "critical",
    requiredEvidence: ["future_run_plan", "operator_approval"],
    limitations: ["future_gated", "blocked_now"],
    currentlyAllowed: false,
    futureGated: true,
  }),
  createSemiAutomatedAutomationLevel({
    automationLevelId: "semi_handoff_level:blocked",
    levelName: "blocked",
    description: "Terminal safety state for failed or unsafe handoff metadata.",
    allowedActions: ["request_human_review"],
    forbiddenActions: ["continue_handoff"],
    humanApprovalRequired: true,
    riskLevel: "critical",
    requiredEvidence: ["blocking_reason"],
    limitations: ["safe_stop_state"],
    currentlyAllowed: false,
    futureGated: false,
  }),
];

export const semiAutomatedSafetyGatesFixture: readonly SemiAutomatedHandoffSafetyGate[] = [
  createSemiAutomatedSafetyGate({
    gateId: "semi_handoff_gate:prompt_completeness",
    gateName: "Prompt completeness",
    category: "prompt_completeness",
    requiredCondition: "Required prompt sections are present.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["human_approved_handoff:completeness"],
    requiredHumanDecision: true,
    failureAction: "block_handoff",
    riskLevel: "medium",
  }),
  createSemiAutomatedSafetyGate({
    gateId: "semi_handoff_gate:prompt_safety",
    gateName: "Prompt safety",
    category: "prompt_safety",
    requiredCondition: "Safety boundaries remain explicit.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["human_approved_handoff:safety"],
    requiredHumanDecision: true,
    failureAction: "block_handoff",
    riskLevel: "high",
  }),
  createSemiAutomatedSafetyGate({
    gateId: "semi_handoff_gate:human_approval",
    gateName: "Human approval",
    category: "human_approval",
    requiredCondition: "Human reviewer decision exists before external action.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["manual_trial:human_review"],
    requiredHumanDecision: true,
    failureAction: "needs_human_review",
    riskLevel: "high",
  }),
  createSemiAutomatedSafetyGate({
    gateId: "semi_handoff_gate:file_scope",
    gateName: "File scope",
    category: "file_scope",
    requiredCondition: "Allowed and forbidden file metadata is complete.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["handoff_package:file_scope"],
    requiredHumanDecision: true,
    failureAction: "block_handoff",
    riskLevel: "high",
  }),
  createSemiAutomatedSafetyGate({
    gateId: "semi_handoff_gate:future_copy_buffer",
    gateName: "Future copy buffer",
    category: clipBoardGateCategory,
    requiredCondition: "System copy-buffer assistance is not active now.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["semi_handoff:manual_only"],
    requiredHumanDecision: true,
    failureAction: "block_handoff",
    riskLevel: "critical",
  }),
  createSemiAutomatedSafetyGate({
    gateId: "semi_handoff_gate:future_openclaw",
    gateName: "Future OpenClaw",
    category: "openclaw_future",
    requiredCondition: "OpenClaw-assisted handoff is unavailable now.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["semi_handoff:future_gated"],
    requiredHumanDecision: true,
    failureAction: "block_handoff",
    riskLevel: "critical",
  }),
  createSemiAutomatedSafetyGate({
    gateId: "semi_handoff_gate:future_codex_run",
    gateName: "Future Codex run",
    category: "codex_execution_future",
    requiredCondition: "Codex run assistance is unavailable now.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["semi_handoff:future_gated"],
    requiredHumanDecision: true,
    failureAction: "block_handoff",
    riskLevel: "critical",
  }),
  createSemiAutomatedSafetyGate({
    gateId: "semi_handoff_gate:report_validation",
    gateName: "Report validation",
    category: "report_validation",
    requiredCondition: "Returned report metadata matches expected phase and scope.",
    currentStatus: "passed",
    blocking: false,
    evidenceRefs: ["manual_trial:report_validation"],
    requiredHumanDecision: true,
    failureAction: "needs_human_review",
    riskLevel: "medium",
  }),
];

export const semiAutomatedBlockingSafetyGatesFixture: readonly SemiAutomatedHandoffSafetyGate[] = [
  ...semiAutomatedSafetyGatesFixture,
  createSemiAutomatedSafetyGate({
    gateId: "semi_handoff_gate:blocked_future_level",
    gateName: "Blocked future level",
    category: "codex_execution_future",
    requiredCondition: "Requested assisted level must remain future-gated.",
    currentStatus: "blocked",
    blocking: true,
    evidenceRefs: ["semi_handoff:future_level_requested"],
    requiredHumanDecision: true,
    failureAction: "block_handoff",
    riskLevel: "critical",
  }),
];

export const semiAutomatedRisksFixture: readonly SemiAutomatedHandoffRisk[] = [
  createSemiAutomatedHandoffRisk({
    riskId: "semi_handoff_risk:accidental_paste",
    riskCategory: "accidental_paste",
    description: "Prompt text could be inserted into the wrong surface in a future assisted flow.",
    likelihood: "possible",
    impact: "high",
    severity: "needs_review",
    mitigation: "Keep current flow manual-only and require future session targeting evidence.",
    blocker: false,
    requiredApproval: "operator_review",
    rollbackHint: "return_to_manual_only",
    limitations: ["future_gated"],
  }),
  createSemiAutomatedHandoffRisk({
    riskId: "semi_handoff_risk:report_mismatch",
    riskCategory: "report_mismatch",
    description: "Returned report could omit required scope or verification sections.",
    likelihood: "possible",
    impact: "medium",
    severity: "needs_review",
    mitigation: "Validate report shape before next-action recommendation.",
    blocker: false,
    requiredApproval: "closeout_review",
    rollbackHint: "retry_report_validation",
    limitations: ["metadata_only"],
  }),
];

export const semiAutomatedBlockingRisksFixture: readonly SemiAutomatedHandoffRisk[] = [
  ...semiAutomatedRisksFixture,
  createSemiAutomatedHandoffRisk({
    riskId: "semi_handoff_risk:missing_human_approval",
    riskCategory: "missing_human_approval",
    description: "Future external action lacks explicit human approval.",
    likelihood: "possible",
    impact: "critical",
    severity: "blocks_handoff",
    mitigation: "Block handoff and request human review.",
    blocker: true,
    requiredApproval: "human_operator_review",
    rollbackHint: "freeze_handoff",
    limitations: ["blocks_current_decision"],
  }),
];

const semiAutomatedApprovalCheckpointActions = [
  "before_copy",
  "before_paste",
  "before_codex_execution",
  "before_accepting_report",
  "before_next_phase",
  "before_memory_write",
  "before_any_external_action",
] as const satisfies readonly SemiAutomatedHandoffApprovalCheckpoint["beforeAction"][];

export const semiAutomatedApprovalCheckpointsFixture: readonly SemiAutomatedHandoffApprovalCheckpoint[] =
  semiAutomatedApprovalCheckpointActions.map((beforeAction) =>
    createSemiAutomatedApprovalCheckpoint({
      checkpointId: `semi_handoff_checkpoint:${beforeAction}`,
      checkpointName: beforeAction.replaceAll("_", " "),
      beforeAction,
      requiredDecision: "approve",
      allowedDecisions: ["approve", "reject", "needs_review", "blocked"],
      defaultDecision: "needs_review",
      approver: "human_operator",
      evidenceRequired: ["reviewer_label", "decision_reason"],
      riskLevel:
        beforeAction === "before_codex_execution" ||
        beforeAction === "before_any_external_action"
          ? "critical"
          : "high",
      limitations: ["metadata_only_checkpoint"],
    }),
  );

export const semiAutomatedAbortPlanFixture: SemiAutomatedHandoffAbortPlan =
  createSemiAutomatedAbortPlan({
    abortReason: "future_level_requested",
    triggeredByGate: "semi_handoff_gate:blocked_future_level",
    userVisibleMessage: "Future-assisted handoff level is not available in this phase.",
    safeNextAction: "return_to_manual_only",
    rollbackNeeded: false,
    rollbackScope: "metadata_only",
    auditRequired: true,
    limitations: ["no_runtime_rollback_needed"],
  });

export const semiAutomatedManualOnlyInputFixture: SemiAutomatedHandoffInput = {
  safetyId: "semi_automated_handoff:manual_only",
  sourceManualTrialRef: "manual_codex_handoff_trial:sample_mobile_idea_blueprint",
  sourceHumanApprovedHandoffRef: "human_approved_codex_handoff:habit_world_v1",
  sourceConversationalDryRunRef: "conversational_build_loop:habit_world_v1",
  requestedAutomationLevel: "manual_only",
  automationLevels: semiAutomatedAutomationLevelsFixture,
  safetyGates: semiAutomatedSafetyGatesFixture,
  risks: semiAutomatedRisksFixture,
  approvalCheckpoints: semiAutomatedApprovalCheckpointsFixture,
  abortPlans: [semiAutomatedAbortPlanFixture],
  requiredApprovals: ["human_operator_review", "safety_review"],
  limitations: ["manual_only_current_phase", "source_only", "metadata_only"],
};

export const semiAutomatedCopyAssistedBlockedInputFixture: SemiAutomatedHandoffInput = {
  ...semiAutomatedManualOnlyInputFixture,
  safetyId: "semi_automated_handoff:copy_assisted_blocked",
  requestedAutomationLevel: "copy_assisted_future",
  safetyGates: semiAutomatedBlockingSafetyGatesFixture,
  risks: semiAutomatedBlockingRisksFixture,
};

export const semiAutomatedPasteAssistedBlockedInputFixture: SemiAutomatedHandoffInput = {
  ...semiAutomatedManualOnlyInputFixture,
  safetyId: "semi_handoff:paste_assisted_blocked",
  requestedAutomationLevel: "paste_assisted_future",
  safetyGates: semiAutomatedBlockingSafetyGatesFixture,
  risks: semiAutomatedBlockingRisksFixture,
};

export const semiAutomatedExecuteAssistedBlockedInputFixture: SemiAutomatedHandoffInput = {
  ...semiAutomatedManualOnlyInputFixture,
  safetyId: "semi_automated_handoff:execute_assisted_blocked",
  requestedAutomationLevel: "execute_assisted_future",
  safetyGates: semiAutomatedBlockingSafetyGatesFixture,
  risks: semiAutomatedBlockingRisksFixture,
};
