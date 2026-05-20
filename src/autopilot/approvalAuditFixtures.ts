import {
  type ApprovalAuditRisk,
  type ApprovalEvidenceRecord,
  type ApprovalGateHardening,
  type AuditTrailEntry,
  createApprovalAuditHardening,
  createApprovalAuditRisk,
  createApprovalEvidenceRecord,
  createApprovalGateHardening,
  createAuditTrailEntry,
} from "./approvalAuditHardening.js";

export const approvalAuditEvidenceRecordsFixture: ApprovalEvidenceRecord[] = [
  createApprovalEvidenceRecord({
    evidenceId: "evidence:prompt-snapshot",
    evidenceType: "prompt_snapshot",
    source: "human-approved-codex-handoff",
    summary: "Prompt package was reviewed as source-only advisory metadata.",
    requiredFor: ["copy_prompt"],
    redactionRequired: false,
    confidence: "source_metadata",
    limitations: ["Prompt text is not executed by this module."],
  }),
  createApprovalEvidenceRecord({
    evidenceId: "evidence:approval-decision",
    evidenceType: "approval_decision",
    source: "human-approved-codex-handoff",
    summary: "Human approval state is approved for manual copy only.",
    requiredFor: ["copy_prompt", "continue_next_phase"],
    redactionRequired: false,
    confidence: "human_supplied",
    limitations: ["Approval does not authorize runtime automation."],
  }),
  createApprovalEvidenceRecord({
    evidenceId: "evidence:validation-summary",
    evidenceType: "validation_summary",
    source: "controlled-codex-report-return",
    summary: "Report validation returned no blocking alerts.",
    requiredFor: ["accept_report", "continue_next_phase"],
    redactionRequired: false,
    confidence: "source_metadata",
    limitations: ["Validation is based on user-supplied report metadata."],
  }),
  createApprovalEvidenceRecord({
    evidenceId: "evidence:closeout-summary",
    evidenceType: "closeout_summary",
    source: "phase-closeout-coordinator",
    summary: "Closeout metadata is safe to continue.",
    requiredFor: ["continue_next_phase"],
    redactionRequired: false,
    confidence: "source_metadata",
    limitations: ["Closeout remains advisory."],
  }),
  createApprovalEvidenceRecord({
    evidenceId: "evidence:next-action",
    evidenceType: "next_action",
    source: "next-action-coordinator",
    summary: "Next action recommends dashboard readiness after approval hardening.",
    requiredFor: ["continue_next_phase"],
    redactionRequired: false,
    confidence: "source_metadata",
    limitations: ["Next action must still be reviewed by a human."],
  }),
  createApprovalEvidenceRecord({
    evidenceId: "evidence:dirty-file-state",
    evidenceType: "dirty_file_state",
    source: "git-status-review",
    summary: "Dirty files outside the active scope are known and not staged.",
    requiredFor: ["continue_next_phase"],
    redactionRequired: false,
    confidence: "local_command_output",
    limitations: ["The evidence is a point-in-time command result."],
  }),
];

export const weakApprovalEvidenceFixture: ApprovalEvidenceRecord =
  createApprovalEvidenceRecord({
    evidenceId: "evidence:weak-report",
    evidenceType: "codex_report",
    source: "manual-report-return",
    summary: "Report is present but lacks enough command evidence.",
    requiredFor: ["accept_report"],
    redactionRequired: true,
    confidence: "needs_review",
    limitations: ["A reviewer must inspect the pasted report before accepting it."],
  });

export const safeApprovalGateFixture: ApprovalGateHardening =
  createApprovalGateHardening({
    approvalGateId: "gate:copy-prompt",
    gateName: "Approve prompt before manual copy",
    protectedAction: "copy_prompt",
    requiredApprover: "human_operator",
    requiredEvidence: ["prompt_snapshot", "approval_decision"],
    defaultDecision: "approve",
    allowedDecisions: ["approve", "needs_review", "reject", "blocked"],
    blockingConditions: [],
    riskLevel: "medium",
    rollbackRequired: false,
    auditRequired: true,
    limitations: ["Manual copy is outside source-side automation."],
  });

export const acceptReportGateFixture: ApprovalGateHardening =
  createApprovalGateHardening({
    approvalGateId: "gate:accept-report",
    gateName: "Approve report before closeout",
    protectedAction: "accept_report",
    requiredApprover: "human_operator",
    requiredEvidence: ["validation_summary"],
    defaultDecision: "approve",
    allowedDecisions: ["approve", "needs_review", "reject", "blocked"],
    blockingConditions: [],
    riskLevel: "medium",
    rollbackRequired: false,
    auditRequired: true,
    limitations: ["Report acceptance is based on user-supplied metadata."],
  });

export const continueNextPhaseGateFixture: ApprovalGateHardening =
  createApprovalGateHardening({
    approvalGateId: "gate:continue-next-phase",
    gateName: "Approve next phase continuation",
    protectedAction: "continue_next_phase",
    requiredApprover: "human_operator",
    requiredEvidence: [
      "approval_decision",
      "validation_summary",
      "closeout_summary",
      "next_action",
      "dirty_file_state",
    ],
    defaultDecision: "approve",
    allowedDecisions: ["approve", "needs_review", "reject", "blocked"],
    blockingConditions: [],
    riskLevel: "medium",
    rollbackRequired: false,
    auditRequired: true,
    limitations: ["Next phase remains a recommendation until the user approves it."],
  });

export const futureProviderGateFixture: ApprovalGateHardening =
  createApprovalGateHardening({
    approvalGateId: "gate:provider-future",
    gateName: "Block future provider action",
    protectedAction: "approve_provider_action_future",
    requiredApprover: "human_operator",
    requiredEvidence: ["approval_decision"],
    defaultDecision: "approve",
    allowedDecisions: ["needs_review", "blocked"],
    blockingConditions: ["Provider action is not available in this phase."],
    riskLevel: "critical",
    rollbackRequired: true,
    auditRequired: true,
    limitations: ["Future provider actions require a separate approved phase."],
  });

export const missingApprovalGateFixture: ApprovalGateHardening =
  createApprovalGateHardening({
    approvalGateId: "gate:missing-approval",
    gateName: "Block missing approval",
    protectedAction: "continue_next_phase",
    requiredApprover: "human_operator",
    requiredEvidence: ["approval_decision"],
    defaultDecision: "blocked",
    allowedDecisions: ["needs_review", "blocked"],
    blockingConditions: ["No human approval record was supplied."],
    riskLevel: "high",
    rollbackRequired: true,
    auditRequired: true,
    limitations: ["The action remains blocked until approval evidence exists."],
  });

export const approvalAuditTrailFixture: AuditTrailEntry[] = [
  createAuditTrailEntry({
    auditEntryId: "audit:copy-prompt-approved",
    sourcePhase: "Phase 142I",
    actionType: "copy_prompt",
    actor: "human_operator",
    decision: "approve",
    evidenceRefs: ["evidence:prompt-snapshot", "evidence:approval-decision"],
    timestampLabel: "manual-label",
    riskLevel: "medium",
    redactionStatus: "not_required",
    rollbackHint: "Do not proceed to manual copy if evidence changes.",
    relatedApprovalGate: "gate:copy-prompt",
    limitations: ["Audit entry is static fixture metadata."],
  }),
  createAuditTrailEntry({
    auditEntryId: "audit:accept-report-approved",
    sourcePhase: "Phase 142I",
    actionType: "accept_report",
    actor: "human_operator",
    decision: "approve",
    evidenceRefs: ["evidence:validation-summary"],
    timestampLabel: "manual-label",
    riskLevel: "medium",
    redactionStatus: "not_required",
    rollbackHint: "Retry report validation if scope evidence changes.",
    relatedApprovalGate: "gate:accept-report",
    limitations: ["Audit entry is static fixture metadata."],
  }),
  createAuditTrailEntry({
    auditEntryId: "audit:next-phase-approved",
    sourcePhase: "Phase 142I",
    actionType: "continue_next_phase",
    actor: "human_operator",
    decision: "approve",
    evidenceRefs: [
      "evidence:approval-decision",
      "evidence:validation-summary",
      "evidence:closeout-summary",
      "evidence:next-action",
      "evidence:dirty-file-state",
    ],
    timestampLabel: "manual-label",
    riskLevel: "medium",
    redactionStatus: "not_required",
    rollbackHint: "Return to approval/audit review if next action changes.",
    relatedApprovalGate: "gate:continue-next-phase",
    limitations: ["Audit entry is static fixture metadata."],
  }),
];

export const blockedApprovalAuditRiskFixture: ApprovalAuditRisk =
  createApprovalAuditRisk({
    riskId: "risk:missing-approval",
    riskCategory: "missing_approval",
    description: "A protected action was requested without a human approval record.",
    likelihood: "possible",
    impact: "high",
    severity: "blocks_action",
    mitigation: "Require approval decision evidence before continuing.",
    blocker: true,
    requiredApproval: "human_operator",
    rollbackHint: "Stop and collect approval evidence.",
    limitations: ["Risk is represented as metadata only."],
  });

export const weakEvidenceRiskFixture: ApprovalAuditRisk =
  createApprovalAuditRisk({
    riskId: "risk:weak-evidence",
    riskCategory: "weak_evidence",
    description: "Evidence exists but needs reviewer confirmation.",
    likelihood: "possible",
    impact: "medium",
    severity: "needs_review",
    mitigation: "Ask the human reviewer to confirm evidence quality.",
    blocker: false,
    requiredApproval: "human_operator",
    rollbackHint: "Keep the action in review until evidence is clear.",
    limitations: ["Weak evidence does not perform any action."],
  });

export const approvalAuditSafeHardeningFixture = createApprovalAuditHardening({
  hardeningId: "approval-audit:phase-142i:safe",
  sourcePhase: "Phase 142I",
  approvalGates: [
    safeApprovalGateFixture,
    acceptReportGateFixture,
    continueNextPhaseGateFixture,
  ],
  auditTrail: approvalAuditTrailFixture,
  evidenceRecords: approvalAuditEvidenceRecordsFixture,
  risks: [],
  requiredApprovals: ["human_operator"],
  limitations: ["Safe fixture stays source-only and advisory."],
});

export const approvalAuditMissingApprovalFixture = createApprovalAuditHardening({
  hardeningId: "approval-audit:phase-142i:missing-approval",
  sourcePhase: "Phase 142I",
  approvalGates: [missingApprovalGateFixture],
  auditTrail: [],
  evidenceRecords: [],
  risks: [blockedApprovalAuditRiskFixture],
  requiredApprovals: [],
  limitations: ["Missing approval fixture must block continuation."],
});

export const approvalAuditWeakEvidenceFixture = createApprovalAuditHardening({
  hardeningId: "approval-audit:phase-142i:weak-evidence",
  sourcePhase: "Phase 142I",
  approvalGates: [acceptReportGateFixture],
  auditTrail: [
    createAuditTrailEntry({
      auditEntryId: "audit:weak-report-review",
      sourcePhase: "Phase 142I",
      actionType: "accept_report",
      actor: "human_operator",
      decision: "needs_review",
      evidenceRefs: ["evidence:weak-report"],
      timestampLabel: "manual-label",
      riskLevel: "medium",
      redactionStatus: "required_pending",
      rollbackHint: "Do not accept report until evidence is reviewed.",
      relatedApprovalGate: "gate:accept-report",
      limitations: ["Review fixture is advisory only."],
    }),
  ],
  evidenceRecords: [weakApprovalEvidenceFixture],
  risks: [weakEvidenceRiskFixture],
  requiredApprovals: ["human_operator"],
  limitations: ["Weak evidence fixture should request human review."],
});

export const approvalAuditFutureGatedFixture = createApprovalAuditHardening({
  hardeningId: "approval-audit:phase-142i:future-gated",
  sourcePhase: "Phase 142I",
  approvalGates: [futureProviderGateFixture],
  auditTrail: [],
  evidenceRecords: approvalAuditEvidenceRecordsFixture,
  risks: [],
  requiredApprovals: ["human_operator"],
  limitations: ["Future provider gate must remain blocked."],
});

export const approvalAuditSummaryFixture = approvalAuditSafeHardeningFixture.summary;
