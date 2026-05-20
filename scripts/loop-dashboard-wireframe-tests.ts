import assert from "node:assert/strict";
import {
  buildDefaultLoopDashboardWireframe,
  createLoopDashboardCardWireframe,
  createLoopDashboardLayout,
  createLoopDashboardOperatorFlow,
  createLoopDashboardScreen,
  createLoopDashboardUxIndicator,
  selectCardsByScreen,
  selectIndicatorsBySeverity,
} from "../src/autopilot/loopDashboardWireframe.ts";

const requiredScreens = [
  "loop_overview",
  "active_loop_run",
  "prompt_handoff_review",
  "approval_audit",
  "manual_actions",
  "report_return",
  "validation_closeout",
  "next_action",
  "blockers_warnings",
] as const;

const requiredCards = [
  "loop_overview",
  "prompt_draft",
  "handoff_approval",
  "approval_gate",
  "audit_evidence",
  "manual_action_checklist",
  "report_return",
  "validation_result",
  "closeout",
  "next_action",
  "blockers_warnings",
] as const;

const requiredIndicators = [
  "safe_to_continue",
  "review_required",
  "manual_action_required",
  "blocked",
  "evidence_missing",
  "closeout_ready",
  "next_phase_ready",
] as const;

const wireframe = buildDefaultLoopDashboardWireframe();

const screenIds = new Set(wireframe.screens.map((screen) => screen.screenId));
const cardIds = new Set(wireframe.cardWireframes.map((card) => card.cardId));
const indicatorIds = new Set(wireframe.uxIndicators.map((indicator) => indicator.indicatorId));

for (const screen of requiredScreens) {
  assert.equal(screenIds.has(screen), true, `missing screen: ${screen}`);
}

for (const card of requiredCards) {
  assert.equal(cardIds.has(card), true, `missing card: ${card}`);
}

for (const indicator of requiredIndicators) {
  assert.equal(indicatorIds.has(indicator), true, `missing indicator: ${indicator}`);
}

assert.equal(wireframe.summary.requiredScreenCoverage, true);
assert.equal(wireframe.summary.requiredCardCoverage, true);
assert.equal(wireframe.summary.requiredIndicatorCoverage, true);
assert.equal(wireframe.operatorFlow.manualOnly, true);
assert.equal(wireframe.operatorFlow.automationAllowed, false);
assert.equal(wireframe.noDashboardImplementation, true);
assert.equal(wireframe.noUiComponents, true);
assert.equal(wireframe.noRuntimeExecution, true);
assert.equal(wireframe.noCodexInvocation, true);
assert.equal(wireframe.noOpenClawInvocation, true);
assert.equal(wireframe.noSystemCopyBuffer, true);
assert.equal(wireframe.noProviderCalls, true);
assert.equal(wireframe.noFilesystemWrites, true);
assert.equal(wireframe.noDashboardMutation, true);

const overviewScreen = wireframe.screens.find((screen) => screen.screenId === "loop_overview");
assert.ok(overviewScreen, "overview screen should exist");
assert.equal(selectCardsByScreen(overviewScreen, wireframe.cardWireframes).length, 3);

assert.equal(selectIndicatorsBySeverity(wireframe.uxIndicators, "stop").length, 2);

const layout = createLoopDashboardLayout({
  layoutId: "layout:test",
  layoutName: "Test Layout",
  purpose: "Test layout metadata.",
  sections: ["top_status_band"],
  primaryUserFlow: ["open dashboard"],
  navigationModel: "test navigation",
  responsiveNotes: ["stack on mobile"],
  accessibilityNotes: ["text labels"],
  riskLevel: "low",
  limitations: [],
});
assert.equal(layout.metadataOnly, true);

const screen = createLoopDashboardScreen({
  screenId: "loop_overview",
  screenName: "Loop Overview",
  purpose: "Test screen.",
  cards: ["loop_overview"],
  primaryActions: ["Review"],
  secondaryActions: ["Open blockers"],
  stopConditions: [],
  emptyState: "Empty",
  loadingState: "Loading",
  errorState: "Error",
  riskLevel: "low",
  limitations: [],
});
assert.equal(screen.cards.length, 1);

const card = createLoopDashboardCardWireframe({
  cardId: "loop_overview",
  title: "Loop Overview",
  purpose: "Test card.",
  visibleFields: ["currentStage"],
  statusBadges: ["safe_to_continue"],
  primaryAction: "Review",
  secondaryAction: "Open blockers",
  disabledReason: "",
  evidenceLinks: ["next_action"],
  safetyNotes: [],
  operatorGuidance: "Review status.",
  riskLevel: "low",
});
assert.equal(card.noUiComponents, true);

const indicator = createLoopDashboardUxIndicator({
  indicatorId: "safe_to_continue",
  label: "Safe to continue",
  meaning: "Test indicator.",
  visualIntent: "Success badge.",
  severity: "continue",
  continueAllowed: true,
  humanActionRequired: false,
  evidenceRequired: ["validation_summary"],
  recommendedWording: "Safe after review.",
  limitations: [],
});
assert.equal(indicator.continueAllowed, true);

const flow = createLoopDashboardOperatorFlow({
  flowId: "flow:test",
  flowName: "Test flow",
  steps: ["open dashboard", "choose next phase"],
  entryPoint: "Loop Overview",
  exitCriteria: ["human approval present"],
  evidenceRequired: ["next_action"],
  stopConditions: [],
  limitations: [],
});
assert.equal(flow.manualOnly, true);
assert.equal(flow.automationAllowed, false);

console.log(
  `loop dashboard wireframe smoke passed: ${wireframe.screens.length} screens, ${wireframe.cardWireframes.length} cards, ${wireframe.uxIndicators.length} indicators`,
);
