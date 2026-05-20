import assert from "node:assert/strict";
import {
  buildDefaultLoopDashboardCards,
  buildDefaultLoopDashboardSignals,
  createLoopDashboardOperatorAction,
  createLoopDashboardReadiness,
  createLoopDashboardState,
  selectBlockingLoopDashboardSignals,
  selectLoopDashboardCardsByRisk,
} from "../src/autopilot/loopDashboardReadiness.ts";

const state = createLoopDashboardState({
  dashboardStateId: "loop_dashboard_state:test",
  loopRunRef: "manual_loop:test",
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
  evidenceRefs: ["evidence:approval-decision"],
  riskLevel: "medium",
  limitations: [],
});

const cards = buildDefaultLoopDashboardCards(["manual_loop:test"]);
const signals = buildDefaultLoopDashboardSignals();
const actions = [
  createLoopDashboardOperatorAction({
    actionId: "action:test-review",
    actionLabel: "Review next phase",
    actionType: "approve_next_phase",
    requiredEvidence: ["next_action"],
    blockedReason: "",
    safetyNotes: ["Human approval remains required."],
    riskLevel: "medium",
  }),
];

const readiness = createLoopDashboardReadiness({
  readinessId: "loop_dashboard_readiness:test",
  state,
  cards,
  uxSignals: signals.filter(
    (signal) => signal.signalId === "safe_to_continue" || signal.signalId === "ready_for_next_phase",
  ),
  operatorActions: actions,
  limitations: [],
});

assert.equal(state.metadataOnly, true);
assert.equal(cards.length, 10);
assert.equal(signals.length, 7);
assert.equal(actions[0]?.manualOnly, true);
assert.equal(actions[0]?.allowedAutomationLevel, "manual_only");
assert.equal(readiness.summary.safeToContinue, true);
assert.equal(readiness.noDashboardImplementation, true);
assert.equal(readiness.noUiComponents, true);
assert.equal(readiness.noRuntimeExecution, true);
assert.equal(readiness.noCodexInvocation, true);
assert.equal(readiness.noOpenClawInvocation, true);
assert.equal(readiness.noProviderCalls, true);
assert.equal(readiness.noFilesystemWrites, true);
assert.equal(readiness.noDashboardMutation, true);

const blockingSignals = selectBlockingLoopDashboardSignals(signals);
assert.equal(blockingSignals.length, 3);

const highRiskCards = selectLoopDashboardCardsByRisk(cards, "high");
assert.ok(highRiskCards.length >= 3);

const blockedState = createLoopDashboardState({
  ...state,
  dashboardStateId: "loop_dashboard_state:test_blocked",
  alertLevel: "blocking_alert",
  closeoutStatus: "unsafe_scope",
  blockers: ["approval evidence missing"],
  riskLevel: "critical",
});

const blockedReadiness = createLoopDashboardReadiness({
  readinessId: "loop_dashboard_readiness:test_blocked",
  state: blockedState,
  cards,
  uxSignals: blockingSignals,
  operatorActions: actions,
  limitations: [],
});

assert.equal(blockedReadiness.summary.safeToContinue, false);
assert.equal(blockedReadiness.summary.blockingSignalCount, 3);

console.log(
  `loop dashboard readiness smoke passed: ${cards.length} cards, ${signals.length} signals, ${actions.length} operator actions`,
);
