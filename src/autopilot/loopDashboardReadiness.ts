export type LoopDashboardRiskLevel = "low" | "medium" | "high" | "critical";

export type LoopDashboardCardId =
  | "loop_overview"
  | "prompt_draft"
  | "approval_gate"
  | "manual_action_checklist"
  | "report_return"
  | "validation_result"
  | "closeout"
  | "next_action"
  | "audit_trail"
  | "blockers_warnings";

export type LoopDashboardSignalId =
  | "safe_to_continue"
  | "review_required"
  | "stop_do_not_continue"
  | "manual_action_required"
  | "blocked"
  | "evidence_missing"
  | "ready_for_next_phase";

export type LoopDashboardSignalSeverity = "continue" | "review" | "stop";

export type LoopDashboardBadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "blocked";

export type LoopDashboardOperatorActionType =
  | "review_prompt"
  | "confirm_manual_transfer"
  | "review_report"
  | "review_validation"
  | "review_closeout"
  | "approve_next_phase"
  | "review_audit";

export type LoopDashboardAutomationLevel = "manual_only";

export interface LoopDashboardState {
  dashboardStateId: string;
  loopRunRef: string;
  currentStage: string;
  promptDraftStatus: string;
  handoffStatus: string;
  approvalStatus: string;
  auditStatus: string;
  manualActionStatus: string;
  reportReturnStatus: string;
  validationStatus: string;
  alertLevel: string;
  closeoutStatus: string;
  nextAction: string;
  blockers: readonly string[];
  warnings: readonly string[];
  unresolvedQuestions: readonly string[];
  evidenceRefs: readonly string[];
  riskLevel: LoopDashboardRiskLevel;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface LoopDashboardStatusBadge {
  badgeId: string;
  label: string;
  tone: LoopDashboardBadgeTone;
  meaning: string;
  blocking: boolean;
  evidenceRefs: readonly string[];
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface LoopDashboardCard {
  cardId: LoopDashboardCardId;
  title: string;
  purpose: string;
  inputRefs: readonly string[];
  visibleFields: readonly string[];
  statusBadges: readonly LoopDashboardStatusBadge[];
  primaryActionLabel: string;
  disabledReason: string;
  safetyNotes: readonly string[];
  riskLevel: LoopDashboardRiskLevel;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noUiComponents: true;
}

export interface LoopDashboardUxSignal {
  signalId: LoopDashboardSignalId;
  label: string;
  meaning: string;
  severity: LoopDashboardSignalSeverity;
  operatorMessage: string;
  continueAllowed: boolean;
  humanActionRequired: boolean;
  evidenceRequired: readonly string[];
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface LoopDashboardOperatorAction {
  actionId: string;
  actionLabel: string;
  actionType: LoopDashboardOperatorActionType;
  manualOnly: true;
  allowedAutomationLevel: LoopDashboardAutomationLevel;
  requiredEvidence: readonly string[];
  blockedReason: string;
  safetyNotes: readonly string[];
  riskLevel: LoopDashboardRiskLevel;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noRuntimeAction: true;
}

export interface LoopDashboardSummary {
  summaryId: string;
  dashboardStateId: string;
  cardCount: number;
  signalCount: number;
  blockingSignalCount: number;
  operatorActionCount: number;
  blockerCount: number;
  warningCount: number;
  safeToContinue: boolean;
  manualActionRequired: boolean;
  recommendedNextPhase: string;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface LoopDashboardReadiness {
  readinessId: string;
  state: LoopDashboardState;
  cards: readonly LoopDashboardCard[];
  uxSignals: readonly LoopDashboardUxSignal[];
  operatorActions: readonly LoopDashboardOperatorAction[];
  summary: LoopDashboardSummary;
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

export interface LoopDashboardReadinessInput {
  readinessId: string;
  state: LoopDashboardState;
  cards: readonly LoopDashboardCard[];
  uxSignals: readonly LoopDashboardUxSignal[];
  operatorActions: readonly LoopDashboardOperatorAction[];
  limitations: readonly string[];
}

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

export function createLoopDashboardState(
  input: Omit<LoopDashboardState, "advisoryOnly" | "sourceOnly" | "metadataOnly">,
): LoopDashboardState {
  return {
    ...input,
    blockers: uniqueStrings(input.blockers),
    warnings: uniqueStrings(input.warnings),
    unresolvedQuestions: uniqueStrings(input.unresolvedQuestions),
    evidenceRefs: uniqueStrings(input.evidenceRefs),
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createLoopDashboardCard(
  input: Omit<LoopDashboardCard, "advisoryOnly" | "sourceOnly" | "metadataOnly" | "noUiComponents">,
): LoopDashboardCard {
  return {
    ...input,
    inputRefs: uniqueStrings(input.inputRefs),
    visibleFields: uniqueStrings(input.visibleFields),
    safetyNotes: uniqueStrings(input.safetyNotes),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noUiComponents: true,
  };
}

export function createLoopDashboardUxSignal(
  input: Omit<LoopDashboardUxSignal, "advisoryOnly" | "sourceOnly" | "metadataOnly">,
): LoopDashboardUxSignal {
  return {
    ...input,
    evidenceRequired: uniqueStrings(input.evidenceRequired),
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createLoopDashboardOperatorAction(
  input: Omit<
    LoopDashboardOperatorAction,
    | "manualOnly"
    | "allowedAutomationLevel"
    | "advisoryOnly"
    | "sourceOnly"
    | "metadataOnly"
    | "noRuntimeAction"
  >,
): LoopDashboardOperatorAction {
  return {
    ...input,
    manualOnly: true,
    allowedAutomationLevel: "manual_only",
    requiredEvidence: uniqueStrings(input.requiredEvidence),
    safetyNotes: uniqueStrings(input.safetyNotes),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noRuntimeAction: true,
  };
}

function createBadge(input: Omit<LoopDashboardStatusBadge, "advisoryOnly" | "sourceOnly" | "metadataOnly">): LoopDashboardStatusBadge {
  return {
    ...input,
    evidenceRefs: uniqueStrings(input.evidenceRefs),
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function buildDefaultLoopDashboardSignals(): LoopDashboardUxSignal[] {
  return [
    createLoopDashboardUxSignal({
      signalId: "safe_to_continue",
      label: "Safe to continue?",
      meaning: "Required evidence is present and no blockers are active.",
      severity: "continue",
      operatorMessage: "Continue only after confirming the next phase recommendation.",
      continueAllowed: true,
      humanActionRequired: false,
      evidenceRequired: ["approval_decision", "validation_summary", "closeout_summary"],
      limitations: ["Signal is advisory and derived from metadata."],
    }),
    createLoopDashboardUxSignal({
      signalId: "review_required",
      label: "Needs human review",
      meaning: "Warnings or weak evidence require a human decision.",
      severity: "review",
      operatorMessage: "Review evidence before continuing.",
      continueAllowed: false,
      humanActionRequired: true,
      evidenceRequired: ["approval_decision"],
      limitations: ["Review signal does not resolve the warning by itself."],
    }),
    createLoopDashboardUxSignal({
      signalId: "stop_do_not_continue",
      label: "Do not proceed",
      meaning: "A blocker or unsafe closeout prevents continuation.",
      severity: "stop",
      operatorMessage: "Stop and resolve blockers before the next phase.",
      continueAllowed: false,
      humanActionRequired: true,
      evidenceRequired: ["validation_summary", "closeout_summary"],
      limitations: ["Stop signal is display metadata only."],
    }),
    createLoopDashboardUxSignal({
      signalId: "manual_action_required",
      label: "Manual action required",
      meaning: "The operator must complete or confirm a manual step.",
      severity: "review",
      operatorMessage: "Complete the human-managed step and record evidence.",
      continueAllowed: false,
      humanActionRequired: true,
      evidenceRequired: ["approval_decision"],
      limitations: ["Manual action remains outside source-side automation."],
    }),
    createLoopDashboardUxSignal({
      signalId: "blocked",
      label: "Blocked",
      meaning: "A blocking issue is present.",
      severity: "stop",
      operatorMessage: "Do not route to the next phase until the block is resolved.",
      continueAllowed: false,
      humanActionRequired: true,
      evidenceRequired: ["validation_summary"],
      limitations: ["Blocked state is advisory metadata."],
    }),
    createLoopDashboardUxSignal({
      signalId: "evidence_missing",
      label: "Evidence missing",
      meaning: "Required evidence is absent or too weak.",
      severity: "stop",
      operatorMessage: "Collect or review evidence before continuing.",
      continueAllowed: false,
      humanActionRequired: true,
      evidenceRequired: ["prompt_snapshot", "approval_decision"],
      limitations: ["Evidence review remains human-controlled."],
    }),
    createLoopDashboardUxSignal({
      signalId: "ready_for_next_phase",
      label: "Ready for next phase",
      meaning: "Metadata indicates the loop can move forward.",
      severity: "continue",
      operatorMessage: "Confirm the next phase with the operator.",
      continueAllowed: true,
      humanActionRequired: true,
      evidenceRequired: ["next_action", "closeout_summary"],
      limitations: ["Human approval is still required before continuing."],
    }),
  ];
}

export function buildDefaultLoopDashboardCards(inputRefs: readonly string[] = []): LoopDashboardCard[] {
  const refs = uniqueStrings(inputRefs);
  const reviewSafetyNotes = [
    "This card is display metadata only.",
    "Human review is required before protected actions.",
  ];

  return [
    createLoopDashboardCard({
      cardId: "loop_overview",
      title: "Loop Overview",
      purpose: "Summarize current stage, alert level, closeout, and next action.",
      inputRefs: refs,
      visibleFields: ["currentStage", "alertLevel", "closeoutStatus", "nextAction"],
      statusBadges: [
        createBadge({
          badgeId: "badge:overview:review",
          label: "Review loop state",
          tone: "neutral",
          meaning: "Operator should inspect the loop state before continuing.",
          blocking: false,
          evidenceRefs: [],
          limitations: [],
        }),
      ],
      primaryActionLabel: "Review next step",
      disabledReason: "Next step is unavailable until blockers clear.",
      safetyNotes: reviewSafetyNotes,
      riskLevel: "medium",
    }),
    createLoopDashboardCard({
      cardId: "prompt_draft",
      title: "Prompt Draft",
      purpose: "Show prompt draft status and required sections.",
      inputRefs: refs,
      visibleFields: ["promptDraftStatus", "handoffStatus", "evidenceRefs"],
      statusBadges: [],
      primaryActionLabel: "Review prompt package",
      disabledReason: "Prompt draft is missing or blocked.",
      safetyNotes: ["Approved for human transfer only; not action-ready."],
      riskLevel: "medium",
    }),
    createLoopDashboardCard({
      cardId: "approval_gate",
      title: "Approval Gate",
      purpose: "Show approval status, approver requirements, and missing evidence.",
      inputRefs: refs,
      visibleFields: ["approvalStatus", "auditStatus", "blockers", "warnings"],
      statusBadges: [],
      primaryActionLabel: "Record human decision",
      disabledReason: "Required approval evidence is missing.",
      safetyNotes: reviewSafetyNotes,
      riskLevel: "high",
    }),
    createLoopDashboardCard({
      cardId: "manual_action_checklist",
      title: "Manual Action Checklist",
      purpose: "Show human-managed steps and their evidence labels.",
      inputRefs: refs,
      visibleFields: ["manualActionStatus", "evidenceRefs", "warnings"],
      statusBadges: [],
      primaryActionLabel: "Confirm manual step",
      disabledReason: "Protected action requires review first.",
      safetyNotes: ["Manual actions remain manual-only metadata."],
      riskLevel: "high",
    }),
    createLoopDashboardCard({
      cardId: "report_return",
      title: "Report Return",
      purpose: "Show whether report metadata was supplied by the human.",
      inputRefs: refs,
      visibleFields: ["reportReturnStatus", "validationStatus", "warnings"],
      statusBadges: [],
      primaryActionLabel: "Review report evidence",
      disabledReason: "Report metadata is missing.",
      safetyNotes: ["Report state is caller-supplied metadata."],
      riskLevel: "medium",
    }),
    createLoopDashboardCard({
      cardId: "validation_result",
      title: "Validation Result",
      purpose: "Show validation status, alert level, blockers, and warnings.",
      inputRefs: refs,
      visibleFields: ["validationStatus", "alertLevel", "blockers", "warnings"],
      statusBadges: [],
      primaryActionLabel: "Review validation",
      disabledReason: "Validation has a blocking alert.",
      safetyNotes: reviewSafetyNotes,
      riskLevel: "high",
    }),
    createLoopDashboardCard({
      cardId: "closeout",
      title: "Closeout",
      purpose: "Show closeout status and whether retry or review is needed.",
      inputRefs: refs,
      visibleFields: ["closeoutStatus", "nextAction", "blockers"],
      statusBadges: [],
      primaryActionLabel: "Review closeout",
      disabledReason: "Closeout is blocked or unsafe.",
      safetyNotes: reviewSafetyNotes,
      riskLevel: "high",
    }),
    createLoopDashboardCard({
      cardId: "next_action",
      title: "Next Action",
      purpose: "Show the next recommended phase and approval requirement.",
      inputRefs: refs,
      visibleFields: ["nextAction", "approvalStatus", "evidenceRefs"],
      statusBadges: [],
      primaryActionLabel: "Approve next phase",
      disabledReason: "Human approval or evidence is missing.",
      safetyNotes: ["Next action is a recommendation, not a source-side action."],
      riskLevel: "medium",
    }),
    createLoopDashboardCard({
      cardId: "audit_trail",
      title: "Audit Trail",
      purpose: "Show audit evidence, actor, decision, and rollback hints.",
      inputRefs: refs,
      visibleFields: ["auditStatus", "evidenceRefs", "warnings"],
      statusBadges: [],
      primaryActionLabel: "Review audit evidence",
      disabledReason: "Evidence requires review.",
      safetyNotes: reviewSafetyNotes,
      riskLevel: "medium",
    }),
    createLoopDashboardCard({
      cardId: "blockers_warnings",
      title: "Blockers / Warnings",
      purpose: "Make stop conditions and warning details scan-friendly.",
      inputRefs: refs,
      visibleFields: ["blockers", "warnings", "unresolvedQuestions"],
      statusBadges: [],
      primaryActionLabel: "Resolve blocker",
      disabledReason: "No blocker selected.",
      safetyNotes: ["Blockers must remain visible before next phase approval."],
      riskLevel: "critical",
    }),
  ];
}

export function summarizeLoopDashboardReadiness(
  input: Pick<
    LoopDashboardReadiness,
    "readinessId" | "state" | "cards" | "uxSignals" | "operatorActions"
  > & { limitations: readonly string[] },
): LoopDashboardSummary {
  const blockingSignals = selectBlockingLoopDashboardSignals(input.uxSignals);
  const manualActionRequired = input.operatorActions.some((action) => action.manualOnly);
  const safeToContinue =
    input.state.blockers.length === 0 &&
    blockingSignals.length === 0 &&
    input.state.alertLevel !== "blocking_alert" &&
    input.state.closeoutStatus !== "blocked" &&
    input.state.closeoutStatus !== "unsafe_scope";

  return {
    summaryId: `${input.readinessId}:summary`,
    dashboardStateId: input.state.dashboardStateId,
    cardCount: input.cards.length,
    signalCount: input.uxSignals.length,
    blockingSignalCount: blockingSignals.length,
    operatorActionCount: input.operatorActions.length,
    blockerCount: input.state.blockers.length,
    warningCount: input.state.warnings.length,
    safeToContinue,
    manualActionRequired,
    recommendedNextPhase: safeToContinue
      ? "Phase 144B - LOOP DASHBOARD WIREFRAME PLAN"
      : "Phase 143I follow-up dashboard readiness review",
    limitations: uniqueStrings(input.limitations),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };
}

export function createLoopDashboardReadiness(
  input: LoopDashboardReadinessInput,
): LoopDashboardReadiness {
  const base = {
    readinessId: input.readinessId,
    state: input.state,
    cards: input.cards,
    uxSignals: input.uxSignals,
    operatorActions: input.operatorActions,
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
  } satisfies Omit<LoopDashboardReadiness, "summary">;

  return {
    ...base,
    summary: summarizeLoopDashboardReadiness({
      ...base,
      limitations: input.limitations,
    }),
  };
}

export function selectLoopDashboardCardsByRisk(
  cards: readonly LoopDashboardCard[],
  riskLevel: LoopDashboardRiskLevel,
): LoopDashboardCard[] {
  return cards.filter((card) => card.riskLevel === riskLevel);
}

export function selectBlockingLoopDashboardSignals(
  signals: readonly LoopDashboardUxSignal[],
): LoopDashboardUxSignal[] {
  return signals.filter(
    (signal) => signal.severity === "stop" || signal.continueAllowed === false && signal.signalId === "blocked",
  );
}
