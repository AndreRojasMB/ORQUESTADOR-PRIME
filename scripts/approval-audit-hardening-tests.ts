import assert from "node:assert/strict";
import {
  createApprovalAuditHardening,
  createApprovalAuditRisk,
  createApprovalEvidenceRecord,
  createApprovalGateHardening,
  createAuditTrailEntry,
  selectApprovalGatesByProtectedAction,
  selectAuditRisksByCategory,
  selectEvidenceByType,
} from "../src/autopilot/approvalAuditHardening.ts";

const safeGate = createApprovalGateHardening({
  approvalGateId: "gate:test-copy",
  gateName: "Test copy approval",
  protectedAction: "copy_prompt",
  requiredApprover: "human_operator",
  requiredEvidence: ["prompt_snapshot", "approval_decision"],
  defaultDecision: "approve",
  allowedDecisions: ["approve", "needs_review", "reject", "blocked"],
  blockingConditions: [],
  riskLevel: "medium",
  rollbackRequired: false,
  auditRequired: true,
  limitations: [],
});

const reportGate = createApprovalGateHardening({
  approvalGateId: "gate:test-report",
  gateName: "Test report acceptance",
  protectedAction: "accept_report",
  requiredApprover: "human_operator",
  requiredEvidence: ["validation_summary"],
  defaultDecision: "approve",
  allowedDecisions: ["approve", "needs_review", "reject", "blocked"],
  blockingConditions: [],
  riskLevel: "medium",
  rollbackRequired: false,
  auditRequired: true,
  limitations: [],
});

const promptEvidence = createApprovalEvidenceRecord({
  evidenceId: "evidence:test-prompt",
  evidenceType: "prompt_snapshot",
  source: "test",
  summary: "Test prompt evidence.",
  requiredFor: ["copy_prompt"],
  redactionRequired: false,
  confidence: "source_metadata",
  limitations: [],
});

const approvalEvidence = createApprovalEvidenceRecord({
  evidenceId: "evidence:test-approval",
  evidenceType: "approval_decision",
  source: "test",
  summary: "Test approval evidence.",
  requiredFor: ["copy_prompt"],
  redactionRequired: false,
  confidence: "human_supplied",
  limitations: [],
});

const validationEvidence = createApprovalEvidenceRecord({
  evidenceId: "evidence:test-validation",
  evidenceType: "validation_summary",
  source: "test",
  summary: "Test validation evidence.",
  requiredFor: ["accept_report"],
  redactionRequired: false,
  confidence: "source_metadata",
  limitations: [],
});

const auditEntries = [
  createAuditTrailEntry({
    auditEntryId: "audit:test-copy",
    sourcePhase: "Phase 142I",
    actionType: "copy_prompt",
    actor: "human_operator",
    decision: "approve",
    evidenceRefs: ["evidence:test-prompt", "evidence:test-approval"],
    timestampLabel: "manual-label",
    riskLevel: "medium",
    redactionStatus: "not_required",
    rollbackHint: "Stop if evidence changes.",
    relatedApprovalGate: "gate:test-copy",
    limitations: [],
  }),
  createAuditTrailEntry({
    auditEntryId: "audit:test-report",
    sourcePhase: "Phase 142I",
    actionType: "accept_report",
    actor: "human_operator",
    decision: "approve",
    evidenceRefs: ["evidence:test-validation"],
    timestampLabel: "manual-label",
    riskLevel: "medium",
    redactionStatus: "not_required",
    rollbackHint: "Retry validation if evidence changes.",
    relatedApprovalGate: "gate:test-report",
    limitations: [],
  }),
];

const weakEvidence = createApprovalEvidenceRecord({
  evidenceId: "evidence:test-weak",
  evidenceType: "codex_report",
  source: "test",
  summary: "Weak report evidence.",
  requiredFor: ["accept_report"],
  redactionRequired: true,
  confidence: "needs_review",
  limitations: [],
});

const weakRisk = createApprovalAuditRisk({
  riskId: "risk:test-weak",
  riskCategory: "weak_evidence",
  description: "Weak evidence needs review.",
  likelihood: "possible",
  impact: "medium",
  severity: "needs_review",
  mitigation: "Review evidence before accepting.",
  blocker: false,
  requiredApproval: "human_operator",
  rollbackHint: "Hold action.",
  limitations: [],
});

const blockedRisk = createApprovalAuditRisk({
  riskId: "risk:test-missing-approval",
  riskCategory: "missing_approval",
  description: "Missing approval blocks protected action.",
  likelihood: "possible",
  impact: "high",
  severity: "blocks_action",
  mitigation: "Collect approval evidence.",
  blocker: true,
  requiredApproval: "human_operator",
  rollbackHint: "Stop until approved.",
  limitations: [],
});

const safeHardening = createApprovalAuditHardening({
  hardeningId: "approval-audit:test-safe",
  sourcePhase: "Phase 142I",
  approvalGates: [safeGate, reportGate],
  auditTrail: auditEntries,
  evidenceRecords: [promptEvidence, approvalEvidence, validationEvidence],
  risks: [],
  requiredApprovals: ["human_operator"],
  limitations: [],
});

const missingApprovalHardening = createApprovalAuditHardening({
  hardeningId: "approval-audit:test-missing",
  sourcePhase: "Phase 142I",
  approvalGates: [safeGate],
  auditTrail: [],
  evidenceRecords: [],
  risks: [blockedRisk],
  requiredApprovals: [],
  limitations: [],
});

const weakEvidenceHardening = createApprovalAuditHardening({
  hardeningId: "approval-audit:test-weak",
  sourcePhase: "Phase 142I",
  approvalGates: [reportGate],
  auditTrail: [auditEntries[1]],
  evidenceRecords: [validationEvidence, weakEvidence],
  risks: [weakRisk],
  requiredApprovals: ["human_operator"],
  limitations: [],
});

assert.equal(safeGate.humanApprovalRequired, true);
assert.equal(safeHardening.decision.decisionStatus, "approved");
assert.equal(safeHardening.decision.safeToContinue, true);
assert.equal(safeHardening.noRuntimeAutomation, true);
assert.equal(safeHardening.noCodexInvocation, true);
assert.equal(safeHardening.noOpenClawInvocation, true);
assert.equal(safeHardening.noSystemCopyAutomation, true);
assert.equal(safeHardening.noProviderCalls, true);
assert.equal(safeHardening.noFilesystemWrites, true);

assert.equal(missingApprovalHardening.decision.decisionStatus, "blocked");
assert.ok(missingApprovalHardening.decision.blockers.length > 0);

assert.equal(weakEvidenceHardening.decision.decisionStatus, "needs_review");
assert.ok(weakEvidenceHardening.decision.warnings.length > 0);

assert.equal(selectApprovalGatesByProtectedAction([safeGate], "copy_prompt").length, 1);
assert.equal(selectAuditRisksByCategory([blockedRisk], "missing_approval").length, 1);
assert.equal(selectEvidenceByType([promptEvidence], "prompt_snapshot").length, 1);
assert.equal(safeHardening.summary.decisionStatus, "approved");

console.log(
  `approval audit hardening smoke passed: ${safeHardening.summary.totalGates} gates, ${safeHardening.summary.evidenceRecords} evidence records, ${safeHardening.summary.auditEntries} audit entries`,
);
