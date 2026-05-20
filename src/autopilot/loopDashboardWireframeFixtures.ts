import {
  buildDefaultLoopDashboardWireframe,
  createLoopDashboardCardWireframe,
  createLoopDashboardLayout,
  createLoopDashboardOperatorFlow,
  createLoopDashboardScreen,
  createLoopDashboardUxIndicator,
  type LoopDashboardCardWireframe,
  type LoopDashboardScreen,
  type LoopDashboardUxIndicator,
} from "./loopDashboardWireframe.js";

export const loopDashboardWireframeLayoutFixture = createLoopDashboardLayout({
  layoutId: "loop_dashboard_layout:fixture",
  layoutName: "Fixture Manual Loop Review Layout",
  purpose: "Static layout fixture for source-only dashboard wireframe metadata.",
  sections: [
    "top_status_band",
    "navigation",
    "active_screen_content",
    "blockers_warnings_panel",
    "evidence_section",
    "next_action_footer",
  ],
  primaryUserFlow: [
    "open dashboard",
    "inspect current loop status",
    "review prompt/handoff",
    "check approval/audit",
    "perform manual action outside system",
    "submit report manually",
    "review validation",
    "accept closeout",
    "choose next phase",
  ],
  navigationModel: "Rail on desktop, tabs on tablet, stacked flow on mobile.",
  responsiveNotes: ["Blockers stay above optional content on mobile."],
  accessibilityNotes: ["Status badges use text labels and visible disabled reasons."],
  riskLevel: "medium",
  limitations: ["Fixture does not create dashboard UI."],
});

export const loopDashboardWireframeScreensFixture: LoopDashboardScreen[] =
  buildDefaultLoopDashboardWireframe({
    wireframeId: "loop_dashboard_wireframe:fixture:screens",
    layout: loopDashboardWireframeLayoutFixture,
  }).screens as LoopDashboardScreen[];

export const loopDashboardWireframeCardsFixture: LoopDashboardCardWireframe[] =
  buildDefaultLoopDashboardWireframe({
    wireframeId: "loop_dashboard_wireframe:fixture:cards",
    layout: loopDashboardWireframeLayoutFixture,
  }).cardWireframes as LoopDashboardCardWireframe[];

export const loopDashboardWireframeIndicatorsFixture: LoopDashboardUxIndicator[] =
  buildDefaultLoopDashboardWireframe({
    wireframeId: "loop_dashboard_wireframe:fixture:indicators",
    layout: loopDashboardWireframeLayoutFixture,
  }).uxIndicators as LoopDashboardUxIndicator[];

export const loopDashboardWireframeOperatorFlowFixture = createLoopDashboardOperatorFlow({
  flowId: "loop_dashboard_operator_flow:fixture",
  flowName: "Fixture manual operator flow",
  steps: [
    "open dashboard",
    "inspect current loop status",
    "review prompt/handoff",
    "check approval/audit",
    "perform manual action outside system",
    "submit report manually",
    "review validation",
    "accept closeout",
    "choose next phase",
  ],
  entryPoint: "Loop Overview",
  exitCriteria: ["closeout safe", "next phase reviewed", "human approval present"],
  evidenceRequired: ["approval_decision", "validation_summary", "closeout_summary"],
  stopConditions: ["blocking alert", "unsafe scope", "missing evidence"],
  limitations: ["Fixture flow is metadata only."],
});

export const loopDashboardWireframeSummaryFixture =
  buildDefaultLoopDashboardWireframe({
    wireframeId: "loop_dashboard_wireframe:fixture:summary",
    layout: loopDashboardWireframeLayoutFixture,
  }).summary;

export const loopDashboardCustomScreenFixture = createLoopDashboardScreen({
  screenId: "blockers_warnings",
  screenName: "Fixture Blockers / Warnings",
  purpose: "Fixture screen for stop-condition review.",
  cards: ["blockers_warnings", "validation_result", "approval_gate"],
  primaryActions: ["Resolve blocker"],
  secondaryActions: ["Review source evidence"],
  stopConditions: ["any active blocker"],
  emptyState: "No blockers.",
  loadingState: "Waiting for blocker metadata.",
  errorState: "Blocker metadata incomplete.",
  riskLevel: "critical",
  limitations: ["Fixture screen is not UI."],
});

export const loopDashboardCustomCardFixture = createLoopDashboardCardWireframe({
  cardId: "blockers_warnings",
  title: "Fixture Blockers / Warnings",
  purpose: "Fixture card for blocked state display.",
  visibleFields: ["blocker", "warning", "severity"],
  statusBadges: ["blocked", "stop_do_not_continue"],
  primaryAction: "Resolve blocker",
  secondaryAction: "Review evidence",
  disabledReason: "No blocker selected.",
  evidenceLinks: ["validation_summary"],
  safetyNotes: ["Blocker card is advisory metadata."],
  operatorGuidance: "Stop on blockers.",
  riskLevel: "critical",
});

export const loopDashboardCustomIndicatorFixture = createLoopDashboardUxIndicator({
  indicatorId: "blocked",
  label: "Blocked",
  meaning: "A blocker prevents continuation.",
  visualIntent: "Strong stop badge.",
  severity: "stop",
  continueAllowed: false,
  humanActionRequired: true,
  evidenceRequired: ["validation_summary"],
  recommendedWording: "Blocked. Do not continue.",
  limitations: ["Indicator is metadata only."],
});

export const loopDashboardDefaultWireframeFixture = buildDefaultLoopDashboardWireframe({
  wireframeId: "loop_dashboard_wireframe:fixture:default",
  layout: loopDashboardWireframeLayoutFixture,
  operatorFlow: loopDashboardWireframeOperatorFlowFixture,
  limitations: ["Default fixture stays source-only and advisory."],
});
