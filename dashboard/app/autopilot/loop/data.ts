export type LoopStatusTone = "safe" | "review" | "blocked" | "manual" | "missing";

export interface LoopBadge {
  label: string;
  tone: LoopStatusTone;
}

export interface LoopDashboardMetric {
  label: string;
  value: string;
  helper: string;
  tone: LoopStatusTone;
}

export interface LoopDashboardCardData {
  cardId: string;
  title: string;
  purpose: string;
  status: string;
  badges: readonly LoopBadge[];
  fields: readonly {
    label: string;
    value: string;
  }[];
  evidence: readonly string[];
  disabledActionLabel: string;
  disabledReason: string;
  safetyNote: string;
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface ManualLoopStep {
  label: string;
  status: string;
  evidence: string;
  tone: LoopStatusTone;
}

export interface LoopDashboardStaticData {
  runLabel: string;
  routeLabel: string;
  statusBanner: string;
  overviewMetrics: readonly LoopDashboardMetric[];
  manualSteps: readonly ManualLoopStep[];
  cards: readonly LoopDashboardCardData[];
  blockers: readonly string[];
  warnings: readonly string[];
  safetyBoundaries: readonly string[];
}

export const loopDashboardStaticData: LoopDashboardStaticData = {
  runLabel: "Manual loop preview: habit-world-v1",
  routeLabel: "/autopilot/loop",
  statusBanner:
    "Read-only preview. Manual loop only. No real action is performed from this dashboard.",
  overviewMetrics: [
    {
      label: "Current stage",
      value: "Closeout review",
      helper: "Operator is reviewing validation and next phase evidence.",
      tone: "review",
    },
    {
      label: "Approval",
      value: "Approved for human transfer",
      helper: "Approval does not authorize dashboard-side action.",
      tone: "safe",
    },
    {
      label: "Alert level",
      value: "Mild review",
      helper: "No blocker in the static fixture, but evidence remains visible.",
      tone: "review",
    },
    {
      label: "Next action",
      value: "Phase 146B decision",
      helper: "Recommendation only; human approval remains required.",
      tone: "manual",
    },
  ],
  manualSteps: [
    {
      label: "Review prompt package",
      status: "Complete",
      evidence: "prompt_snapshot",
      tone: "safe",
    },
    {
      label: "Confirm handoff approval",
      status: "Complete",
      evidence: "approval_decision",
      tone: "safe",
    },
    {
      label: "Perform external manual step",
      status: "Human-managed",
      evidence: "manual_step_claim",
      tone: "manual",
    },
    {
      label: "Review returned report",
      status: "Needs review",
      evidence: "validation_summary",
      tone: "review",
    },
    {
      label: "Accept closeout",
      status: "Not available here",
      evidence: "closeout_summary",
      tone: "blocked",
    },
  ],
  cards: [
    {
      cardId: "loop_overview",
      title: "Loop Overview",
      purpose: "Show current stage, alert level, closeout status, and next action.",
      status: "Review",
      badges: [
        { label: "Review", tone: "review" },
        { label: "Read-only", tone: "manual" },
      ],
      fields: [
        { label: "Run", value: "habit-world-v1" },
        { label: "Stage", value: "Closeout review" },
        { label: "Closeout", value: "Completed local review" },
        { label: "Next", value: "Controlled automation decision plan" },
      ],
      evidence: ["closeout_summary", "next_action"],
      disabledActionLabel: "Review next step",
      disabledReason: "Actions are disabled in this static preview.",
      safetyNote: "Overview displays metadata only.",
      riskLevel: "medium",
    },
    {
      cardId: "prompt_draft",
      title: "Prompt Draft",
      purpose: "Show prompt package readiness and target phase metadata.",
      status: "Ready for review",
      badges: [
        { label: "Safe", tone: "safe" },
        { label: "Manual action required", tone: "manual" },
      ],
      fields: [
        { label: "Prompt status", value: "Complete" },
        { label: "Target phase", value: "145I" },
        { label: "Target mode", value: "Implementation / verification" },
        { label: "Boundary", value: "Read-only dashboard preview" },
      ],
      evidence: ["prompt_snapshot", "static_ui_plan"],
      disabledActionLabel: "Review prompt package",
      disabledReason: "Review is visual only in this route.",
      safetyNote: "Prompt text is not transferred by this dashboard.",
      riskLevel: "medium",
    },
    {
      cardId: "handoff_approval",
      title: "Handoff Approval",
      purpose: "Show approval state and human-controlled transfer posture.",
      status: "Approved for human transfer",
      badges: [
        { label: "Safe", tone: "safe" },
        { label: "Manual action required", tone: "manual" },
      ],
      fields: [
        { label: "Approval state", value: "approved_for_copy" },
        { label: "Safe to copy", value: "Human-reviewed only" },
        { label: "Safe to run", value: "False from source" },
        { label: "Reviewer", value: "Human operator" },
      ],
      evidence: ["approval_decision", "handoff_boundary"],
      disabledActionLabel: "Review approval state",
      disabledReason: "Dashboard controls cannot complete handoff steps.",
      safetyNote: "Approval does not grant source-side external activity.",
      riskLevel: "high",
    },
    {
      cardId: "approval_gate",
      title: "Approval Gate",
      purpose: "Show protected action, required approver, and evidence posture.",
      status: "Needs human review",
      badges: [
        { label: "Review", tone: "review" },
        { label: "Evidence visible", tone: "safe" },
      ],
      fields: [
        { label: "Protected action", value: "continue_next_phase" },
        { label: "Approver", value: "Human operator" },
        { label: "Default decision", value: "blocked until reviewed" },
        { label: "Rollback", value: "Review closeout before proceeding" },
      ],
      evidence: ["approval_gate", "next_action", "closeout_summary"],
      disabledActionLabel: "Record human decision",
      disabledReason: "Decision recording is outside this static route.",
      safetyNote: "A visible gate does not create approval.",
      riskLevel: "high",
    },
    {
      cardId: "audit_evidence",
      title: "Audit Evidence",
      purpose: "Show passive evidence and audit posture for the manual loop.",
      status: "Evidence present",
      badges: [
        { label: "Safe", tone: "safe" },
        { label: "Read-only", tone: "manual" },
      ],
      fields: [
        { label: "Actor", value: "Human operator" },
        { label: "Decision", value: "Review before next phase" },
        { label: "Evidence quality", value: "Sufficient for preview" },
        { label: "Rollback hint", value: "Stop and retry on blocker" },
      ],
      evidence: ["audit_entry", "validation_summary", "closeout_summary"],
      disabledActionLabel: "Review audit evidence",
      disabledReason: "Audit records are not edited here.",
      safetyNote: "Audit evidence is displayed as static metadata.",
      riskLevel: "medium",
    },
    {
      cardId: "manual_action_checklist",
      title: "Manual Action Checklist",
      purpose: "Show human-managed steps and required evidence.",
      status: "Manual action required",
      badges: [
        { label: "Manual action required", tone: "manual" },
        { label: "Review", tone: "review" },
      ],
      fields: [
        { label: "External step", value: "Handled by human outside dashboard" },
        { label: "Required evidence", value: "Manual completion claim" },
        { label: "Blocked reason", value: "No dashboard action is available" },
        { label: "Automation level", value: "manual_only" },
      ],
      evidence: ["manual_step_claim", "approval_decision"],
      disabledActionLabel: "Confirm manual step evidence",
      disabledReason: "Manual steps cannot be completed from this UI.",
      safetyNote: "The dashboard never performs the operator step.",
      riskLevel: "high",
    },
    {
      cardId: "report_return",
      title: "Report Return",
      purpose: "Show human-submitted report status and section completeness.",
      status: "Normalized",
      badges: [
        { label: "Safe", tone: "safe" },
        { label: "Review", tone: "review" },
      ],
      fields: [
        { label: "Report status", value: "Human-submitted metadata" },
        { label: "Phase", value: "145I" },
        { label: "Mode", value: "Implementation / verification" },
        { label: "Sections", value: "Expected sections present" },
      ],
      evidence: ["report_return", "validation_summary"],
      disabledActionLabel: "Review report metadata",
      disabledReason: "Report intake is not implemented in this route.",
      safetyNote: "Report data is not retrieved by the dashboard.",
      riskLevel: "medium",
    },
    {
      cardId: "validation_result",
      title: "Validation Result",
      purpose: "Show validation status, alert level, blockers, and warnings.",
      status: "Mild review",
      badges: [
        { label: "Review", tone: "review" },
        { label: "Evidence visible", tone: "safe" },
      ],
      fields: [
        { label: "Validation", value: "Passed with review note" },
        { label: "Alert", value: "mild_alert" },
        { label: "Blockers", value: "None in fixture" },
        { label: "Warnings", value: "Review static evidence" },
      ],
      evidence: ["validation_summary", "forbidden_grep_result", "typecheck_result"],
      disabledActionLabel: "Review validation",
      disabledReason: "Validation commands are not run from this UI.",
      safetyNote: "Validation is displayed as precomputed metadata.",
      riskLevel: "high",
    },
    {
      cardId: "closeout",
      title: "Closeout",
      purpose: "Show closeout state and safe-to-continue posture.",
      status: "Ready for human review",
      badges: [
        { label: "Review", tone: "review" },
        { label: "Safe", tone: "safe" },
      ],
      fields: [
        { label: "Closeout status", value: "completed_local_only" },
        { label: "Safe to continue", value: "Requires human confirmation" },
        { label: "Retry needed", value: "No" },
        { label: "Human review", value: "Required before next phase" },
      ],
      evidence: ["closeout_summary", "validation_summary"],
      disabledActionLabel: "Review closeout",
      disabledReason: "Closeout cannot be accepted from this static UI.",
      safetyNote: "Closeout display does not mutate repository state.",
      riskLevel: "high",
    },
    {
      cardId: "next_action",
      title: "Next Action",
      purpose: "Show recommended next phase and decision reason.",
      status: "Ready for decision",
      badges: [
        { label: "Manual action required", tone: "manual" },
        { label: "Review", tone: "review" },
      ],
      fields: [
        { label: "Recommended phase", value: "146B - Controlled Automation Decision Plan" },
        { label: "Fallback", value: "146B - Loop Dashboard Interaction Hardening Plan" },
        { label: "Reason", value: "Static UI is present; automation decision remains separate" },
        { label: "Approval", value: "Human decision required" },
      ],
      evidence: ["next_action", "closeout_summary"],
      disabledActionLabel: "Approve next phase",
      disabledReason: "Next phase approval is outside this route.",
      safetyNote: "Next action is a recommendation only.",
      riskLevel: "medium",
    },
    {
      cardId: "blockers_warnings",
      title: "Blockers / Warnings",
      purpose: "Keep warnings and stop states visible before continuation.",
      status: "No blocker in fixture",
      badges: [
        { label: "Safe", tone: "safe" },
        { label: "Review", tone: "review" },
      ],
      fields: [
        { label: "Blockers", value: "None" },
        { label: "Warnings", value: "Review static evidence before next phase" },
        { label: "Stop condition", value: "Any missing evidence changes status to blocked" },
        { label: "Fix", value: "Resolve evidence gaps before continuing" },
      ],
      evidence: ["blocker_summary", "warning_summary"],
      disabledActionLabel: "Resolve blocker",
      disabledReason: "No blocker is selected, and remediation is not available here.",
      safetyNote: "Blockers remain display-only in this preview.",
      riskLevel: "critical",
    },
  ],
  blockers: [],
  warnings: [
    "This route is a static preview and does not prove live loop readiness.",
    "Human approval is still required before any next phase decision.",
  ],
  safetyBoundaries: [
    "Static local data only.",
    "No provider calls.",
    "No DB/SQL access.",
    "No environment or secret reads.",
    "No project file writes.",
    "No dashboard mutation.",
    "No memory persistence.",
    "No external tool invocation.",
    "No prompt transfer behavior.",
    "No real action buttons.",
  ],
};
