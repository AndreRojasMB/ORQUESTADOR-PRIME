import {
  buildDefaultLoopDashboardCards,
  buildDefaultLoopDashboardSignals,
  createLoopDashboardOperatorAction,
  createLoopDashboardReadiness,
  createLoopDashboardState,
  type LoopDashboardOperatorAction,
} from "./loopDashboardReadiness.js";

export const loopDashboardEvidenceRefsFixture = [
  "evidence:prompt-snapshot",
  "evidence:approval-decision",
  "evidence:validation-summary",
  "evidence:closeout-summary",
  "evidence:next-action",
] as const;

export const loopDashboardSafeStateFixture = createLoopDashboardState({
  dashboardStateId: "loop_dashboard_state:habit_world:safe",
  loopRunRef: "end_to_end_manual_loop:habit_world_v1",
  currentStage: "generate_closeout",
  promptDraftStatus: "ready_for_handoff",
  handoffStatus: "approved_for_copy",
  approvalStatus: "approved",
  auditStatus: "complete",
  manualActionStatus: "completed_by_human",
  reportReturnStatus: "normalized",
  validationStatus: "passed",
  alertLevel: "no_alert",
  closeoutStatus: "completed_local_only",
  nextAction: "Phase 144B - LOOP DASHBOARD WIREFRAME PLAN",
  blockers: [],
  warnings: [],
  unresolvedQuestions: [],
  evidenceRefs: loopDashboardEvidenceRefsFixture,
  riskLevel: "medium",
  limitations: ["State is derived from static advisory fixtures."],
});

export const loopDashboardWarningStateFixture = createLoopDashboardState({
  dashboardStateId: "loop_dashboard_state:habit_world:warning",
  loopRunRef: "end_to_end_manual_loop:habit_world_v1",
  currentStage: "validate_report",
  promptDraftStatus: "ready_for_handoff",
  handoffStatus: "approved_for_copy",
  approvalStatus: "needs_review",
  auditStatus: "weak_evidence",
  manualActionStatus: "manual_required",
  reportReturnStatus: "needs_review",
  validationStatus: "needs_review",
  alertLevel: "mild_alert",
  closeoutStatus: "needs_human_review",
  nextAction: "Review evidence before dashboard wireframe planning.",
  blockers: [],
  warnings: ["validation evidence needs human review"],
  unresolvedQuestions: ["operator must confirm report scope evidence"],
  evidenceRefs: ["evidence:approval-decision", "evidence:validation-summary"],
  riskLevel: "high",
  limitations: ["Warning state is not safe to continue without review."],
});

export const loopDashboardBlockedStateFixture = createLoopDashboardState({
  dashboardStateId: "loop_dashboard_state:habit_world:blocked",
  loopRunRef: "end_to_end_manual_loop:habit_world_v1",
  currentStage: "validate_report",
  promptDraftStatus: "blocked",
  handoffStatus: "blocked",
  approvalStatus: "blocked",
  auditStatus: "missing_evidence",
  manualActionStatus: "blocked",
  reportReturnStatus: "blocked",
  validationStatus: "blocked",
  alertLevel: "blocking_alert",
  closeoutStatus: "unsafe_scope",
  nextAction: "Stop and resolve approval/evidence blockers.",
  blockers: ["approval evidence missing", "closeout unsafe scope"],
  warnings: ["manual action cannot continue"],
  unresolvedQuestions: ["which evidence record is authoritative"],
  evidenceRefs: [],
  riskLevel: "critical",
  limitations: ["Blocked state must not route to next phase."],
});

export const loopDashboardCardsFixture = buildDefaultLoopDashboardCards([
  "end_to_end_manual_loop:habit_world_v1",
  "approval_audit:phase_142i",
  "controlled_report_return:habit_world_v1",
]);

export const loopDashboardUxSignalsFixture = buildDefaultLoopDashboardSignals();

export const loopDashboardOperatorActionsFixture: LoopDashboardOperatorAction[] = [
  createLoopDashboardOperatorAction({
    actionId: "loop_dashboard_action:review_prompt",
    actionLabel: "Review prompt package",
    actionType: "review_prompt",
    requiredEvidence: ["prompt_snapshot", "approval_decision"],
    blockedReason: "",
    safetyNotes: ["Prompt package is review metadata only."],
    riskLevel: "medium",
  }),
  createLoopDashboardOperatorAction({
    actionId: "loop_dashboard_action:confirm_manual_transfer",
    actionLabel: "Confirm manual transfer evidence",
    actionType: "confirm_manual_transfer",
    requiredEvidence: ["approval_decision"],
    blockedReason: "Handoff approval is missing.",
    safetyNotes: ["Manual transfer is completed by the human operator."],
    riskLevel: "high",
  }),
  createLoopDashboardOperatorAction({
    actionId: "loop_dashboard_action:review_report",
    actionLabel: "Review report metadata",
    actionType: "review_report",
    requiredEvidence: ["validation_summary"],
    blockedReason: "Report metadata is missing.",
    safetyNotes: ["Report state is human-supplied metadata."],
    riskLevel: "medium",
  }),
  createLoopDashboardOperatorAction({
    actionId: "loop_dashboard_action:review_closeout",
    actionLabel: "Review closeout state",
    actionType: "review_closeout",
    requiredEvidence: ["closeout_summary"],
    blockedReason: "Closeout is blocked or unsafe.",
    safetyNotes: ["Closeout review does not mutate repository state."],
    riskLevel: "high",
  }),
  createLoopDashboardOperatorAction({
    actionId: "loop_dashboard_action:approve_next_phase",
    actionLabel: "Approve next phase recommendation",
    actionType: "approve_next_phase",
    requiredEvidence: ["next_action", "closeout_summary"],
    blockedReason: "Next-action evidence is missing.",
    safetyNotes: ["Next phase remains a human decision."],
    riskLevel: "medium",
  }),
  createLoopDashboardOperatorAction({
    actionId: "loop_dashboard_action:review_audit",
    actionLabel: "Review audit evidence",
    actionType: "review_audit",
    requiredEvidence: ["approval_decision", "validation_summary"],
    blockedReason: "Audit evidence is missing or weak.",
    safetyNotes: ["Audit review is passive metadata."],
    riskLevel: "medium",
  }),
];

export const loopDashboardSafeReadinessFixture = createLoopDashboardReadiness({
  readinessId: "loop_dashboard_readiness:habit_world:safe",
  state: loopDashboardSafeStateFixture,
  cards: loopDashboardCardsFixture,
  uxSignals: loopDashboardUxSignalsFixture.filter(
    (signal) => signal.signalId === "safe_to_continue" || signal.signalId === "ready_for_next_phase",
  ),
  operatorActions: loopDashboardOperatorActionsFixture,
  limitations: ["Safe readiness fixture is source-only metadata."],
});

export const loopDashboardWarningReadinessFixture = createLoopDashboardReadiness({
  readinessId: "loop_dashboard_readiness:habit_world:warning",
  state: loopDashboardWarningStateFixture,
  cards: loopDashboardCardsFixture,
  uxSignals: loopDashboardUxSignalsFixture.filter(
    (signal) => signal.signalId === "review_required" || signal.signalId === "manual_action_required",
  ),
  operatorActions: loopDashboardOperatorActionsFixture,
  limitations: ["Warning readiness fixture requires human review."],
});

export const loopDashboardBlockedReadinessFixture = createLoopDashboardReadiness({
  readinessId: "loop_dashboard_readiness:habit_world:blocked",
  state: loopDashboardBlockedStateFixture,
  cards: loopDashboardCardsFixture,
  uxSignals: loopDashboardUxSignalsFixture.filter(
    (signal) =>
      signal.signalId === "blocked" ||
      signal.signalId === "evidence_missing" ||
      signal.signalId === "stop_do_not_continue",
  ),
  operatorActions: loopDashboardOperatorActionsFixture,
  limitations: ["Blocked readiness fixture must not continue."],
});
