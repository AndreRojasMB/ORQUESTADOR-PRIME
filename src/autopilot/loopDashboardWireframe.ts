import type { LoopDashboardRiskLevel } from "./loopDashboardReadiness.js";

export type LoopDashboardWireframeScreenId =
  | "loop_overview"
  | "active_loop_run"
  | "prompt_handoff_review"
  | "approval_audit"
  | "manual_actions"
  | "report_return"
  | "validation_closeout"
  | "next_action"
  | "blockers_warnings";

export type LoopDashboardWireframeCardId =
  | "loop_overview"
  | "prompt_draft"
  | "handoff_approval"
  | "approval_gate"
  | "audit_evidence"
  | "manual_action_checklist"
  | "report_return"
  | "validation_result"
  | "closeout"
  | "next_action"
  | "blockers_warnings";

export type LoopDashboardWireframeIndicatorId =
  | "safe_to_continue"
  | "review_required"
  | "manual_action_required"
  | "blocked"
  | "evidence_missing"
  | "closeout_ready"
  | "next_phase_ready";

export type LoopDashboardWireframeSeverity = "continue" | "review" | "stop";

export interface LoopDashboardLayout {
  layoutId: string;
  layoutName: string;
  purpose: string;
  sections: readonly string[];
  primaryUserFlow: readonly string[];
  navigationModel: string;
  responsiveNotes: readonly string[];
  accessibilityNotes: readonly string[];
  riskLevel: LoopDashboardRiskLevel;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface LoopDashboardScreen {
  screenId: LoopDashboardWireframeScreenId;
  screenName: string;
  purpose: string;
  cards: readonly LoopDashboardWireframeCardId[];
  primaryActions: readonly string[];
  secondaryActions: readonly string[];
  stopConditions: readonly string[];
  emptyState: string;
  loadingState: string;
  errorState: string;
  riskLevel: LoopDashboardRiskLevel;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface LoopDashboardCardWireframe {
  cardId: LoopDashboardWireframeCardId;
  title: string;
  purpose: string;
  visibleFields: readonly string[];
  statusBadges: readonly string[];
  primaryAction: string;
  secondaryAction: string;
  disabledReason: string;
  evidenceLinks: readonly string[];
  safetyNotes: readonly string[];
  operatorGuidance: string;
  riskLevel: LoopDashboardRiskLevel;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noUiComponents: true;
}

export interface LoopDashboardOperatorFlow {
  flowId: string;
  flowName: string;
  steps: readonly string[];
  entryPoint: string;
  exitCriteria: readonly string[];
  manualOnly: true;
  automationAllowed: false;
  evidenceRequired: readonly string[];
  stopConditions: readonly string[];
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface LoopDashboardUxIndicator {
  indicatorId: LoopDashboardWireframeIndicatorId;
  label: string;
  meaning: string;
  visualIntent: string;
  severity: LoopDashboardWireframeSeverity;
  continueAllowed: boolean;
  humanActionRequired: boolean;
  evidenceRequired: readonly string[];
  recommendedWording: string;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface LoopDashboardWireframeSummary {
  summaryId: string;
  layoutId: string;
  screenCount: number;
  cardWireframeCount: number;
  uxIndicatorCount: number;
  operatorFlowStepCount: number;
  highRiskSurfaceCount: number;
  requiredScreenCoverage: boolean;
  requiredCardCoverage: boolean;
  requiredIndicatorCoverage: boolean;
  nextRecommendedPhase: string;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface LoopDashboardWireframe {
  wireframeId: string;
  layout: LoopDashboardLayout;
  screens: readonly LoopDashboardScreen[];
  cardWireframes: readonly LoopDashboardCardWireframe[];
  operatorFlow: LoopDashboardOperatorFlow;
  uxIndicators: readonly LoopDashboardUxIndicator[];
  summary: LoopDashboardWireframeSummary;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noDashboardImplementation: true;
  noUiComponents: true;
  noRuntimeExecution: true;
  noCodexInvocation: true;
  noOpenClawInvocation: true;
  noSystemCopyBuffer: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemWrites: true;
  noDatabaseMutation: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
}

export interface LoopDashboardWireframeInput {
  wireframeId: string;
  layout: LoopDashboardLayout;
  screens: readonly LoopDashboardScreen[];
  cardWireframes: readonly LoopDashboardCardWireframe[];
  operatorFlow: LoopDashboardOperatorFlow;
  uxIndicators: readonly LoopDashboardUxIndicator[];
  limitations: readonly string[];
}

const requiredScreens: readonly LoopDashboardWireframeScreenId[] = [
  "loop_overview",
  "active_loop_run",
  "prompt_handoff_review",
  "approval_audit",
  "manual_actions",
  "report_return",
  "validation_closeout",
  "next_action",
  "blockers_warnings",
];

const requiredCards: readonly LoopDashboardWireframeCardId[] = [
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
];

const requiredIndicators: readonly LoopDashboardWireframeIndicatorId[] = [
  "safe_to_continue",
  "review_required",
  "manual_action_required",
  "blocked",
  "evidence_missing",
  "closeout_ready",
  "next_phase_ready",
];

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

function hasCoverage<T extends string>(required: readonly T[], actual: readonly T[]): boolean {
  const actualSet = new Set(actual);
  return required.every((item) => actualSet.has(item));
}

export function createLoopDashboardLayout(
  input: Omit<LoopDashboardLayout, "advisoryOnly" | "sourceOnly" | "metadataOnly">,
): LoopDashboardLayout {
  return {
    ...input,
    sections: uniqueStrings(input.sections),
    primaryUserFlow: uniqueStrings(input.primaryUserFlow),
    responsiveNotes: uniqueStrings(input.responsiveNotes),
    accessibilityNotes: uniqueStrings(input.accessibilityNotes),
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createLoopDashboardScreen(
  input: Omit<LoopDashboardScreen, "advisoryOnly" | "sourceOnly" | "metadataOnly">,
): LoopDashboardScreen {
  return {
    ...input,
    cards: Array.from(new Set(input.cards)),
    primaryActions: uniqueStrings(input.primaryActions),
    secondaryActions: uniqueStrings(input.secondaryActions),
    stopConditions: uniqueStrings(input.stopConditions),
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createLoopDashboardCardWireframe(
  input: Omit<
    LoopDashboardCardWireframe,
    "advisoryOnly" | "sourceOnly" | "metadataOnly" | "noUiComponents"
  >,
): LoopDashboardCardWireframe {
  return {
    ...input,
    visibleFields: uniqueStrings(input.visibleFields),
    statusBadges: uniqueStrings(input.statusBadges),
    evidenceLinks: uniqueStrings(input.evidenceLinks),
    safetyNotes: uniqueStrings(input.safetyNotes),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noUiComponents: true,
  };
}

export function createLoopDashboardUxIndicator(
  input: Omit<LoopDashboardUxIndicator, "advisoryOnly" | "sourceOnly" | "metadataOnly">,
): LoopDashboardUxIndicator {
  return {
    ...input,
    evidenceRequired: uniqueStrings(input.evidenceRequired),
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createLoopDashboardOperatorFlow(
  input: Omit<
    LoopDashboardOperatorFlow,
    "manualOnly" | "automationAllowed" | "advisoryOnly" | "sourceOnly" | "metadataOnly"
  >,
): LoopDashboardOperatorFlow {
  return {
    ...input,
    steps: uniqueStrings(input.steps),
    exitCriteria: uniqueStrings(input.exitCriteria),
    evidenceRequired: uniqueStrings(input.evidenceRequired),
    stopConditions: uniqueStrings(input.stopConditions),
    limitations: uniqueStrings(input.limitations),
    manualOnly: true,
    automationAllowed: false,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function summarizeLoopDashboardWireframe(
  input: Pick<
    LoopDashboardWireframe,
    "wireframeId" | "layout" | "screens" | "cardWireframes" | "operatorFlow" | "uxIndicators"
  > & { limitations: readonly string[] },
): LoopDashboardWireframeSummary {
  const screenIds = input.screens.map((screen) => screen.screenId);
  const cardIds = input.cardWireframes.map((card) => card.cardId);
  const indicatorIds = input.uxIndicators.map((indicator) => indicator.indicatorId);
  const highRiskSurfaceCount =
    input.screens.filter((screen) => screen.riskLevel === "high" || screen.riskLevel === "critical").length +
    input.cardWireframes.filter((card) => card.riskLevel === "high" || card.riskLevel === "critical").length;

  return {
    summaryId: `${input.wireframeId}:summary`,
    layoutId: input.layout.layoutId,
    screenCount: input.screens.length,
    cardWireframeCount: input.cardWireframes.length,
    uxIndicatorCount: input.uxIndicators.length,
    operatorFlowStepCount: input.operatorFlow.steps.length,
    highRiskSurfaceCount,
    requiredScreenCoverage: hasCoverage(requiredScreens, screenIds),
    requiredCardCoverage: hasCoverage(requiredCards, cardIds),
    requiredIndicatorCoverage: hasCoverage(requiredIndicators, indicatorIds),
    nextRecommendedPhase: "Phase 145B - LOOP DASHBOARD STATIC UI PLAN",
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createLoopDashboardWireframe(
  input: LoopDashboardWireframeInput,
): LoopDashboardWireframe {
  const base = {
    wireframeId: input.wireframeId,
    layout: input.layout,
    screens: input.screens,
    cardWireframes: input.cardWireframes,
    operatorFlow: input.operatorFlow,
    uxIndicators: input.uxIndicators,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noDashboardImplementation: true,
    noUiComponents: true,
    noRuntimeExecution: true,
    noCodexInvocation: true,
    noOpenClawInvocation: true,
    noSystemCopyBuffer: true,
    noProviderCalls: true,
    noNetwork: true,
    noFilesystemWrites: true,
    noDatabaseMutation: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
  } satisfies Omit<LoopDashboardWireframe, "summary">;

  return {
    ...base,
    summary: summarizeLoopDashboardWireframe({
      ...base,
      limitations: input.limitations,
    }),
  };
}

export function selectCardsByScreen(
  screen: LoopDashboardScreen,
  cards: readonly LoopDashboardCardWireframe[],
): LoopDashboardCardWireframe[] {
  const screenCards = new Set(screen.cards);
  return cards.filter((card) => screenCards.has(card.cardId));
}

export function selectIndicatorsBySeverity(
  indicators: readonly LoopDashboardUxIndicator[],
  severity: LoopDashboardWireframeSeverity,
): LoopDashboardUxIndicator[] {
  return indicators.filter((indicator) => indicator.severity === severity);
}

export function buildDefaultLoopDashboardWireframe(
  input: Partial<LoopDashboardWireframeInput> = {},
): LoopDashboardWireframe {
  const layout =
    input.layout ??
    createLoopDashboardLayout({
      layoutId: "loop_dashboard_layout:manual_loop_review",
      layoutName: "Manual Loop Review Layout",
      purpose: "Give the operator a single review surface for loop state and evidence.",
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
      navigationModel: "Desktop rail, tablet tabs, mobile stacked status-first flow.",
      responsiveNotes: [
        "Desktop keeps blockers visible in a side panel.",
        "Mobile shows blockers before optional content.",
        "Evidence details may collapse but evidence status remains visible.",
      ],
      accessibilityNotes: [
        "Pair color with text labels.",
        "Disabled reasons are always visible.",
        "Stop conditions do not depend on hover.",
      ],
      riskLevel: "medium",
      limitations: ["Layout is metadata only and does not create dashboard UI."],
    });

  const cardWireframes = input.cardWireframes ?? defaultLoopDashboardCardWireframes();
  const screens = input.screens ?? defaultLoopDashboardScreens();
  const uxIndicators = input.uxIndicators ?? defaultLoopDashboardUxIndicators();
  const operatorFlow = input.operatorFlow ?? defaultLoopDashboardOperatorFlow();

  return createLoopDashboardWireframe({
    wireframeId: input.wireframeId ?? "loop_dashboard_wireframe:manual_loop_review",
    layout,
    screens,
    cardWireframes,
    operatorFlow,
    uxIndicators,
    limitations: input.limitations ?? ["Default wireframe is source-only advisory metadata."],
  });
}

function defaultLoopDashboardScreens(): LoopDashboardScreen[] {
  return [
    createLoopDashboardScreen({
      screenId: "loop_overview",
      screenName: "Loop Overview",
      purpose: "Show current loop status and next review path.",
      cards: ["loop_overview", "blockers_warnings", "next_action"],
      primaryActions: ["Review next step"],
      secondaryActions: ["Open blockers"],
      stopConditions: ["blocking alert", "unsafe closeout", "missing approval"],
      emptyState: "No loop run metadata selected.",
      loadingState: "Waiting for loop metadata.",
      errorState: "Loop metadata is incomplete; review blockers.",
      riskLevel: "medium",
      limitations: ["Overview is display metadata only."],
    }),
    createLoopDashboardScreen({
      screenId: "active_loop_run",
      screenName: "Active Loop Run",
      purpose: "Show stage, dirty-file warning, and manual action state.",
      cards: ["loop_overview", "manual_action_checklist", "blockers_warnings"],
      primaryActions: ["Review current stage"],
      secondaryActions: ["Open evidence"],
      stopConditions: ["outside-scope staged files", "future-gated action"],
      emptyState: "No active loop run selected.",
      loadingState: "Waiting for active loop state.",
      errorState: "Active loop state cannot be summarized.",
      riskLevel: "high",
      limitations: ["Active run screen does not observe live tools."],
    }),
    createLoopDashboardScreen({
      screenId: "prompt_handoff_review",
      screenName: "Prompt / Handoff Review",
      purpose: "Review prompt draft and handoff approval posture.",
      cards: ["prompt_draft", "handoff_approval", "approval_gate"],
      primaryActions: ["Review prompt package"],
      secondaryActions: ["Open approval gate"],
      stopConditions: ["safeToExecute true", "handoff not approved", "missing prompt evidence"],
      emptyState: "No prompt package metadata available.",
      loadingState: "Waiting for prompt package metadata.",
      errorState: "Prompt package metadata is blocked.",
      riskLevel: "high",
      limitations: ["Prompt review does not perform prompt transfer."],
    }),
    createLoopDashboardScreen({
      screenId: "approval_audit",
      screenName: "Approval & Audit",
      purpose: "Review human decision, evidence quality, and rollback posture.",
      cards: ["approval_gate", "audit_evidence", "blockers_warnings"],
      primaryActions: ["Review approval evidence"],
      secondaryActions: ["Review rollback hint"],
      stopConditions: ["missing approval", "weak evidence", "redaction required"],
      emptyState: "No approval/audit metadata available.",
      loadingState: "Waiting for audit metadata.",
      errorState: "Approval or audit metadata requires review.",
      riskLevel: "high",
      limitations: ["Approval screen does not grant approval."],
    }),
    createLoopDashboardScreen({
      screenId: "manual_actions",
      screenName: "Manual Actions",
      purpose: "Show manual-only steps and required evidence.",
      cards: ["manual_action_checklist", "approval_gate", "audit_evidence"],
      primaryActions: ["Confirm manual step evidence"],
      secondaryActions: ["Review safety notes"],
      stopConditions: ["manual evidence missing", "approval missing"],
      emptyState: "No manual actions required.",
      loadingState: "Waiting for manual action metadata.",
      errorState: "Manual action evidence is missing.",
      riskLevel: "high",
      limitations: ["Manual actions stay outside source-side automation."],
    }),
    createLoopDashboardScreen({
      screenId: "report_return",
      screenName: "Report Return",
      purpose: "Review human-submitted report metadata.",
      cards: ["report_return", "validation_result", "blockers_warnings"],
      primaryActions: ["Review report metadata"],
      secondaryActions: ["Open validation"],
      stopConditions: ["report missing", "report scope mismatch"],
      emptyState: "No report metadata submitted.",
      loadingState: "Waiting for report metadata.",
      errorState: "Report metadata is incomplete.",
      riskLevel: "medium",
      limitations: ["Report return is metadata only."],
    }),
    createLoopDashboardScreen({
      screenId: "validation_closeout",
      screenName: "Validation / Closeout",
      purpose: "Review validation result and closeout status.",
      cards: ["validation_result", "closeout", "blockers_warnings"],
      primaryActions: ["Review closeout"],
      secondaryActions: ["Review validation evidence"],
      stopConditions: ["blocking alert", "unsafe scope", "failed validation"],
      emptyState: "No validation metadata available.",
      loadingState: "Waiting for validation metadata.",
      errorState: "Validation or closeout is unsafe.",
      riskLevel: "high",
      limitations: ["Closeout review does not mutate repository state."],
    }),
    createLoopDashboardScreen({
      screenId: "next_action",
      screenName: "Next Action",
      purpose: "Review recommended next phase and approval requirement.",
      cards: ["next_action", "closeout", "audit_evidence"],
      primaryActions: ["Approve next phase"],
      secondaryActions: ["Review decision evidence"],
      stopConditions: ["missing next action", "closeout blocked"],
      emptyState: "No next action available.",
      loadingState: "Waiting for next-action metadata.",
      errorState: "Next action conflicts with closeout.",
      riskLevel: "medium",
      limitations: ["Next action is a recommendation only."],
    }),
    createLoopDashboardScreen({
      screenId: "blockers_warnings",
      screenName: "Blockers / Warnings",
      purpose: "Make stop conditions and warnings impossible to miss.",
      cards: ["blockers_warnings", "validation_result", "approval_gate"],
      primaryActions: ["Resolve blocker"],
      secondaryActions: ["Review source evidence"],
      stopConditions: ["any active blocker"],
      emptyState: "No blockers or warnings.",
      loadingState: "Waiting for blocker metadata.",
      errorState: "Blocker metadata is incomplete.",
      riskLevel: "critical",
      limitations: ["Blocker screen is advisory and does not resolve blockers."],
    }),
  ];
}

function defaultLoopDashboardCardWireframes(): LoopDashboardCardWireframe[] {
  const passiveNotes = ["Card is display metadata only.", "Human review remains required."];

  return [
    createLoopDashboardCardWireframe({
      cardId: "loop_overview",
      title: "Loop Overview",
      purpose: "Show stage, alert, closeout, and next action.",
      visibleFields: ["currentStage", "alertLevel", "closeoutStatus", "nextAction"],
      statusBadges: ["safe_to_continue", "review_required", "blocked"],
      primaryAction: "Review next step",
      secondaryAction: "Open blockers",
      disabledReason: "Next step unavailable until blockers clear.",
      evidenceLinks: ["next_action", "closeout_summary"],
      safetyNotes: passiveNotes,
      operatorGuidance: "Start here and follow the strongest status indicator.",
      riskLevel: "medium",
    }),
    createLoopDashboardCardWireframe({
      cardId: "prompt_draft",
      title: "Prompt Draft",
      purpose: "Show prompt completeness and target context.",
      visibleFields: ["promptDraftStatus", "targetPhase", "targetMode", "requiredSections"],
      statusBadges: ["draft", "complete", "evidence_missing", "blocked"],
      primaryAction: "Review prompt package",
      secondaryAction: "Open handoff approval",
      disabledReason: "Prompt draft is missing or blocked.",
      evidenceLinks: ["prompt_snapshot", "completeness_checklist"],
      safetyNotes: ["Prompt is for human transfer only."],
      operatorGuidance: "Confirm safeToExecute remains false before continuing.",
      riskLevel: "medium",
    }),
    createLoopDashboardCardWireframe({
      cardId: "handoff_approval",
      title: "Handoff Approval",
      purpose: "Show approval status and copy-readiness posture.",
      visibleFields: ["approvalStatus", "safeToCopy", "safeToExecute", "reviewer"],
      statusBadges: ["approved_for_copy", "review_required", "blocked"],
      primaryAction: "Review approval state",
      secondaryAction: "Open safety checklist",
      disabledReason: "Approval is missing or blocked.",
      evidenceLinks: ["approval_decision", "safety_checklist"],
      safetyNotes: ["Approved for copy does not authorize source-side action."],
      operatorGuidance: "Continue only when approval is explicit and non-blocking.",
      riskLevel: "high",
    }),
    createLoopDashboardCardWireframe({
      cardId: "approval_gate",
      title: "Approval Gate",
      purpose: "Show protected action, approver, decision, and evidence.",
      visibleFields: ["protectedAction", "requiredApprover", "decision", "missingEvidence"],
      statusBadges: ["approved", "review_required", "future_gated", "blocked"],
      primaryAction: "Record human decision",
      secondaryAction: "Review missing evidence",
      disabledReason: "Required evidence is missing.",
      evidenceLinks: ["approval_decision", "gate_evidence"],
      safetyNotes: ["A visible gate does not grant approval."],
      operatorGuidance: "Do not infer approval from summary color alone.",
      riskLevel: "high",
    }),
    createLoopDashboardCardWireframe({
      cardId: "audit_evidence",
      title: "Audit Evidence",
      purpose: "Show actor, decision, evidence quality, and rollback hint.",
      visibleFields: ["actor", "decision", "evidenceLinks", "redactionStatus", "rollbackHint"],
      statusBadges: ["complete", "weak_evidence", "redaction_needed", "blocked"],
      primaryAction: "Review audit evidence",
      secondaryAction: "Open evidence detail",
      disabledReason: "Evidence requires review or redaction.",
      evidenceLinks: ["audit_entry", "validation_summary", "closeout_summary"],
      safetyNotes: ["Audit records are passive metadata."],
      operatorGuidance: "Prefer evidence ids and summaries over raw sensitive material.",
      riskLevel: "medium",
    }),
    createLoopDashboardCardWireframe({
      cardId: "manual_action_checklist",
      title: "Manual Action Checklist",
      purpose: "Show human-managed steps and completion evidence.",
      visibleFields: ["actionType", "manualOnly", "requiredEvidence", "blockedReason"],
      statusBadges: ["manual_action_required", "complete", "review_required", "blocked"],
      primaryAction: "Confirm manual step evidence",
      secondaryAction: "Review safety notes",
      disabledReason: "Protected action requires review first.",
      evidenceLinks: ["approval_decision", "manual_step_evidence"],
      safetyNotes: ["Dashboard does not perform the manual step."],
      operatorGuidance: "Complete the step outside the system and record evidence.",
      riskLevel: "high",
    }),
    createLoopDashboardCardWireframe({
      cardId: "report_return",
      title: "Report Return",
      purpose: "Show report status and section completeness.",
      visibleFields: ["reportStatus", "reportPhase", "reportMode", "sectionCompleteness"],
      statusBadges: ["missing", "submitted", "normalized", "review_required", "blocked"],
      primaryAction: "Review report metadata",
      secondaryAction: "Open validation",
      disabledReason: "Report metadata is missing.",
      evidenceLinks: ["codex_report", "validation_summary"],
      safetyNotes: ["Report data is human-supplied metadata."],
      operatorGuidance: "Do not continue if scope evidence is missing.",
      riskLevel: "medium",
    }),
    createLoopDashboardCardWireframe({
      cardId: "validation_result",
      title: "Validation Result",
      purpose: "Show validation status, alert, blockers, and warnings.",
      visibleFields: ["validationStatus", "alertLevel", "blockers", "warnings", "recommendedFixes"],
      statusBadges: ["no_alert", "mild_alert", "blocking_alert"],
      primaryAction: "Review validation",
      secondaryAction: "Open blockers",
      disabledReason: "Validation has a blocking alert.",
      evidenceLinks: ["forbidden_grep_result", "typecheck_result", "smoke_result"],
      safetyNotes: ["Validation card is metadata review, not a runner."],
      operatorGuidance: "Route blocking alerts to stop or retry.",
      riskLevel: "high",
    }),
    createLoopDashboardCardWireframe({
      cardId: "closeout",
      title: "Closeout",
      purpose: "Show whether the phase can safely close.",
      visibleFields: ["closeoutStatus", "safeToContinue", "needsRetry", "needsHumanReview"],
      statusBadges: ["closeout_ready", "review_required", "needs_retry", "blocked", "unsafe_scope"],
      primaryAction: "Review closeout",
      secondaryAction: "Open next action",
      disabledReason: "Closeout is blocked or unsafe.",
      evidenceLinks: ["closeout_summary", "validation_summary"],
      safetyNotes: ["Closeout evidence does not mutate repository state."],
      operatorGuidance: "Only clean closeout should route forward.",
      riskLevel: "high",
    }),
    createLoopDashboardCardWireframe({
      cardId: "next_action",
      title: "Next Action",
      purpose: "Show recommended next phase and approval requirement.",
      visibleFields: ["recommendedPhase", "reason", "requiredApprovals", "riskLevel"],
      statusBadges: ["next_phase_ready", "review_required", "retry", "blocked"],
      primaryAction: "Approve next phase",
      secondaryAction: "Review decision model",
      disabledReason: "Human approval or evidence is missing.",
      evidenceLinks: ["next_action", "closeout_summary"],
      safetyNotes: ["Next action is a recommendation, not an operation."],
      operatorGuidance: "Confirm the recommendation before opening the next phase.",
      riskLevel: "medium",
    }),
    createLoopDashboardCardWireframe({
      cardId: "blockers_warnings",
      title: "Blockers / Warnings",
      purpose: "Make stop conditions and warnings impossible to miss.",
      visibleFields: ["blocker", "warning", "severity", "source", "recommendedFix"],
      statusBadges: ["warning", "blocked", "stop_do_not_continue"],
      primaryAction: "Resolve blocker",
      secondaryAction: "Review source evidence",
      disabledReason: "No blocker selected.",
      evidenceLinks: ["validation_summary", "dirty_file_state", "approval_decision"],
      safetyNotes: ["Blockers must remain visible before next phase approval."],
      operatorGuidance: "Stop on blockers. Review warnings before continuing.",
      riskLevel: "critical",
    }),
  ];
}

function defaultLoopDashboardUxIndicators(): LoopDashboardUxIndicator[] {
  return [
    createLoopDashboardUxIndicator({
      indicatorId: "safe_to_continue",
      label: "Safe to continue",
      meaning: "No blockers are active and closeout is safe.",
      visualIntent: "Calm success badge with plain text.",
      severity: "continue",
      continueAllowed: true,
      humanActionRequired: false,
      evidenceRequired: ["validation_summary", "closeout_summary"],
      recommendedWording: "Safe to continue after human confirmation.",
      limitations: ["Indicator is derived from metadata only."],
    }),
    createLoopDashboardUxIndicator({
      indicatorId: "review_required",
      label: "Needs human review",
      meaning: "Warnings or weak evidence require review.",
      visualIntent: "Amber review badge.",
      severity: "review",
      continueAllowed: false,
      humanActionRequired: true,
      evidenceRequired: ["approval_decision"],
      recommendedWording: "Review required before continuing.",
      limitations: ["Review indicator does not clear warnings."],
    }),
    createLoopDashboardUxIndicator({
      indicatorId: "manual_action_required",
      label: "Manual action required",
      meaning: "The operator must perform or confirm an external manual step.",
      visualIntent: "Neutral or amber badge with manual-only wording.",
      severity: "review",
      continueAllowed: false,
      humanActionRequired: true,
      evidenceRequired: ["approval_decision"],
      recommendedWording: "Manual action required outside the system.",
      limitations: ["No source-side automation is implied."],
    }),
    createLoopDashboardUxIndicator({
      indicatorId: "blocked",
      label: "Blocked",
      meaning: "A blocking issue prevents continuation.",
      visualIntent: "Strong stop badge.",
      severity: "stop",
      continueAllowed: false,
      humanActionRequired: true,
      evidenceRequired: ["validation_summary"],
      recommendedWording: "Blocked. Do not continue.",
      limitations: ["Blocked state is metadata only."],
    }),
    createLoopDashboardUxIndicator({
      indicatorId: "evidence_missing",
      label: "Evidence missing",
      meaning: "Required evidence is absent.",
      visualIntent: "Strong stop badge near the affected card.",
      severity: "stop",
      continueAllowed: false,
      humanActionRequired: true,
      evidenceRequired: ["approval_decision", "prompt_snapshot"],
      recommendedWording: "Evidence missing. Collect evidence before continuing.",
      limitations: ["Evidence must be supplied by the operator or metadata source."],
    }),
    createLoopDashboardUxIndicator({
      indicatorId: "closeout_ready",
      label: "Closeout ready",
      meaning: "Closeout can be accepted after review.",
      visualIntent: "Success badge paired with confirmation text.",
      severity: "continue",
      continueAllowed: true,
      humanActionRequired: true,
      evidenceRequired: ["closeout_summary"],
      recommendedWording: "Closeout ready for human acceptance.",
      limitations: ["Closeout acceptance remains a human decision."],
    }),
    createLoopDashboardUxIndicator({
      indicatorId: "next_phase_ready",
      label: "Next phase ready",
      meaning: "Next phase recommendation is available.",
      visualIntent: "Success badge with review note.",
      severity: "continue",
      continueAllowed: true,
      humanActionRequired: true,
      evidenceRequired: ["next_action", "closeout_summary"],
      recommendedWording: "Next phase ready after human approval.",
      limitations: ["Recommendation does not create the next phase."],
    }),
  ];
}

function defaultLoopDashboardOperatorFlow(): LoopDashboardOperatorFlow {
  return createLoopDashboardOperatorFlow({
    flowId: "loop_dashboard_operator_flow:manual_loop_review",
    flowName: "Manual loop dashboard review",
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
    exitCriteria: [
      "closeout is safe",
      "next phase recommendation is explicit",
      "human approval is present",
    ],
    evidenceRequired: ["approval_decision", "validation_summary", "closeout_summary", "next_action"],
    stopConditions: ["blocking alert", "unsafe scope", "missing approval", "missing evidence"],
    limitations: ["Operator flow is advisory and does not perform actions."],
  });
}
