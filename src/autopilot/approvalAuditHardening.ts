export type ApprovalAuditRiskLevel = "low" | "medium" | "high" | "critical";

export type ApprovalAuditDecisionStatus =
  | "approved"
  | "needs_review"
  | "blocked"
  | "rejected";

export type ApprovalGateDecision =
  | "approve"
  | "needs_review"
  | "reject"
  | "blocked";

export type ApprovalAuditProtectedAction =
  | "copy_prompt"
  | "paste_prompt"
  | "run_codex_manually"
  | "accept_report"
  | "continue_next_phase"
  | "approve_memory_proposal"
  | "approve_runtime_action_future"
  | "approve_openclaw_action_future"
  | "approve_provider_action_future"
  | "approve_dashboard_mutation_future";

export type ApprovalAuditEvidenceType =
  | "prompt_snapshot"
  | "approval_decision"
  | "codex_report"
  | "validation_summary"
  | "closeout_summary"
  | "next_action"
  | "dirty_file_state"
  | "forbidden_grep_result"
  | "typecheck_result"
  | "smoke_result"
  | "commit_push_status";

export type ApprovalAuditRiskCategory =
  | "missing_approval"
  | "weak_evidence"
  | "hidden_unsafe_action"
  | "ambiguous_actor"
  | "unreviewed_next_phase"
  | "untracked_report"
  | "memory_proposal_without_approval"
  | "rollback_impossible"
  | "vague_audit_entry"
  | "sensitive_evidence";

export type ApprovalAuditLikelihood = "rare" | "possible" | "likely";
export type ApprovalAuditImpact = "low" | "medium" | "high" | "critical";
export type ApprovalAuditSeverity = "monitor" | "needs_review" | "blocks_action";
export type ApprovalAuditRedactionStatus =
  | "not_required"
  | "required_pending"
  | "redacted"
  | "blocked_sensitive";
export type ApprovalEvidenceConfidence =
  | "human_supplied"
  | "local_command_output"
  | "source_metadata"
  | "needs_review";
export type ApprovalRollbackRequirement =
  | "not_required"
  | "review_required"
  | "plan_required"
  | "impossible_blocked";

export interface ApprovalGateHardening {
  approvalGateId: string;
  gateName: string;
  protectedAction: ApprovalAuditProtectedAction;
  requiredApprover: string;
  requiredEvidence: ApprovalAuditEvidenceType[];
  defaultDecision: ApprovalGateDecision;
  allowedDecisions: ApprovalGateDecision[];
  blockingConditions: string[];
  riskLevel: ApprovalAuditRiskLevel;
  rollbackRequired: boolean;
  auditRequired: boolean;
  limitations: string[];
  humanApprovalRequired: true;
  futureGated: boolean;
}

export interface AuditTrailEntry {
  auditEntryId: string;
  sourcePhase: string;
  actionType: ApprovalAuditProtectedAction;
  actor: string;
  decision: ApprovalGateDecision;
  evidenceRefs: string[];
  timestampLabel: string;
  riskLevel: ApprovalAuditRiskLevel;
  redactionStatus: ApprovalAuditRedactionStatus;
  rollbackHint: string;
  relatedApprovalGate: string;
  limitations: string[];
}

export interface ApprovalEvidenceRecord {
  evidenceId: string;
  evidenceType: ApprovalAuditEvidenceType;
  source: string;
  summary: string;
  requiredFor: ApprovalAuditProtectedAction[];
  redactionRequired: boolean;
  confidence: ApprovalEvidenceConfidence;
  limitations: string[];
}

export interface ApprovalAuditRisk {
  riskId: string;
  riskCategory: ApprovalAuditRiskCategory;
  description: string;
  likelihood: ApprovalAuditLikelihood;
  impact: ApprovalAuditImpact;
  severity: ApprovalAuditSeverity;
  mitigation: string;
  blocker: boolean;
  requiredApproval: string;
  rollbackHint: string;
  limitations: string[];
}

export interface ApprovalAuditDecision {
  decisionId: string;
  decisionStatus: ApprovalAuditDecisionStatus;
  safeToContinue: boolean;
  needsHumanReview: boolean;
  futureActionsRemainGated: boolean;
  blockers: string[];
  warnings: string[];
  requiredApprovals: string[];
  rollbackPosture: ApprovalRollbackRequirement;
  limitations: string[];
}

export interface ApprovalAuditSummary {
  summaryId: string;
  totalGates: number;
  futureGatedActions: number;
  auditEntries: number;
  evidenceRecords: number;
  blockingRisks: number;
  decisionStatus: ApprovalAuditDecisionStatus;
  safeToContinue: boolean;
  nextRecommendedPhase: string;
  limitations: string[];
}

export interface ApprovalAuditHardening {
  hardeningId: string;
  sourcePhase: string;
  approvalGates: ApprovalGateHardening[];
  auditTrail: AuditTrailEntry[];
  evidenceRecords: ApprovalEvidenceRecord[];
  risks: ApprovalAuditRisk[];
  decision: ApprovalAuditDecision;
  summary: ApprovalAuditSummary;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noRuntimeAutomation: true;
  noCodexInvocation: true;
  noOpenClawInvocation: true;
  noSystemCopyAutomation: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemWrites: true;
  noDashboardMutation: true;
  noDatabaseMutation: true;
  noPackageWorkflowChanges: true;
  noMemoryPersistence: true;
}

export interface ApprovalAuditHardeningInput {
  hardeningId: string;
  sourcePhase: string;
  approvalGates: ApprovalGateHardening[];
  auditTrail: AuditTrailEntry[];
  evidenceRecords: ApprovalEvidenceRecord[];
  risks: ApprovalAuditRisk[];
  requiredApprovals: string[];
  limitations: string[];
}

const FUTURE_GATED_ACTIONS: ReadonlySet<ApprovalAuditProtectedAction> = new Set([
  "approve_runtime_action_future",
  "approve_openclaw_action_future",
  "approve_provider_action_future",
  "approve_dashboard_mutation_future",
]);

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function uniqueEvidenceTypes(
  values: ApprovalAuditEvidenceType[],
): ApprovalAuditEvidenceType[] {
  return [...new Set(values)];
}

function isFutureGatedAction(action: ApprovalAuditProtectedAction): boolean {
  return FUTURE_GATED_ACTIONS.has(action);
}

export function createApprovalGateHardening(
  input: Omit<ApprovalGateHardening, "humanApprovalRequired" | "futureGated">,
): ApprovalGateHardening {
  const futureGated = isFutureGatedAction(input.protectedAction);
  const defaultDecision: ApprovalGateDecision = futureGated
    ? "blocked"
    : input.defaultDecision;
  const allowedDecisions = uniqueStrings(input.allowedDecisions) as ApprovalGateDecision[];

  return {
    ...input,
    requiredEvidence: uniqueEvidenceTypes(input.requiredEvidence),
    defaultDecision,
    allowedDecisions: futureGated
      ? uniqueStrings([...allowedDecisions, "blocked"]) as ApprovalGateDecision[]
      : allowedDecisions,
    blockingConditions: uniqueStrings(input.blockingConditions),
    rollbackRequired: input.rollbackRequired || futureGated,
    auditRequired: true,
    limitations: uniqueStrings([
      ...input.limitations,
      "Human approval is required before the protected action.",
      futureGated ? "Future action remains advisory and unavailable in this phase." : "",
    ]),
    humanApprovalRequired: true,
    futureGated,
  };
}

export function createAuditTrailEntry(input: AuditTrailEntry): AuditTrailEntry {
  return {
    ...input,
    evidenceRefs: uniqueStrings(input.evidenceRefs),
    limitations: uniqueStrings(input.limitations),
  };
}

export function createApprovalEvidenceRecord(
  input: ApprovalEvidenceRecord,
): ApprovalEvidenceRecord {
  return {
    ...input,
    requiredFor: [...new Set(input.requiredFor)],
    limitations: uniqueStrings(input.limitations),
  };
}

export function createApprovalAuditRisk(input: ApprovalAuditRisk): ApprovalAuditRisk {
  return {
    ...input,
    limitations: uniqueStrings(input.limitations),
  };
}

export function evaluateApprovalAuditDecision(input: {
  decisionId: string;
  approvalGates: ApprovalGateHardening[];
  auditTrail: AuditTrailEntry[];
  evidenceRecords: ApprovalEvidenceRecord[];
  risks: ApprovalAuditRisk[];
  requiredApprovals: string[];
  limitations: string[];
}): ApprovalAuditDecision {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const approvals = uniqueStrings(input.requiredApprovals);

  if (approvals.length === 0) {
    blockers.push("missing human approval for protected actions");
  }

  const evidenceByType = new Set(
    input.evidenceRecords.map((record) => record.evidenceType),
  );
  const auditByGate = new Set(
    input.auditTrail.map((entry) => entry.relatedApprovalGate),
  );

  for (const gate of input.approvalGates) {
    if (gate.defaultDecision === "blocked" || gate.defaultDecision === "reject") {
      blockers.push(`${gate.approvalGateId} default decision blocks action`);
    }

    if (gate.defaultDecision === "needs_review") {
      warnings.push(`${gate.approvalGateId} requires review before action`);
    }

    if (gate.futureGated && gate.defaultDecision !== "blocked") {
      blockers.push(`${gate.approvalGateId} future action must remain gated`);
    }

    if (!gate.auditRequired || !auditByGate.has(gate.approvalGateId)) {
      warnings.push(`${gate.approvalGateId} lacks complete audit evidence`);
    }

    const missingEvidence = gate.requiredEvidence.filter(
      (evidenceType) => !evidenceByType.has(evidenceType),
    );
    for (const evidenceType of missingEvidence) {
      blockers.push(`${gate.approvalGateId} missing evidence: ${evidenceType}`);
    }
  }

  for (const record of input.evidenceRecords) {
    if (record.confidence === "needs_review") {
      warnings.push(`${record.evidenceId} evidence confidence needs review`);
    }
    if (record.redactionRequired) {
      warnings.push(`${record.evidenceId} requires redaction review`);
    }
  }

  for (const risk of input.risks) {
    if (risk.blocker || risk.severity === "blocks_action") {
      blockers.push(`${risk.riskId} blocks approval: ${risk.riskCategory}`);
    } else if (risk.severity === "needs_review") {
      warnings.push(`${risk.riskId} requires review: ${risk.riskCategory}`);
    }
  }

  const rollbackPosture: ApprovalRollbackRequirement = blockers.some((blocker) =>
    blocker.includes("rollback_impossible"),
  )
    ? "impossible_blocked"
    : blockers.length > 0
      ? "plan_required"
      : warnings.length > 0
        ? "review_required"
        : "not_required";

  const decisionStatus: ApprovalAuditDecisionStatus =
    blockers.length > 0 ? "blocked" : warnings.length > 0 ? "needs_review" : "approved";

  return {
    decisionId: input.decisionId,
    decisionStatus,
    safeToContinue: decisionStatus === "approved",
    needsHumanReview: decisionStatus !== "approved",
    futureActionsRemainGated: input.approvalGates
      .filter((gate) => gate.futureGated)
      .every((gate) => gate.defaultDecision === "blocked"),
    blockers: uniqueStrings(blockers),
    warnings: uniqueStrings(warnings),
    requiredApprovals: approvals,
    rollbackPosture,
    limitations: uniqueStrings([
      ...input.limitations,
      "Decision is advisory metadata only and does not perform protected actions.",
    ]),
  };
}

export function summarizeApprovalAuditHardening(
  input: Pick<
    ApprovalAuditHardening,
    "hardeningId" | "approvalGates" | "auditTrail" | "evidenceRecords" | "risks" | "decision"
  > & { limitations: string[] },
): ApprovalAuditSummary {
  return {
    summaryId: `${input.hardeningId}:summary`,
    totalGates: input.approvalGates.length,
    futureGatedActions: input.approvalGates.filter((gate) => gate.futureGated).length,
    auditEntries: input.auditTrail.length,
    evidenceRecords: input.evidenceRecords.length,
    blockingRisks: input.risks.filter(
      (risk) => risk.blocker || risk.severity === "blocks_action",
    ).length,
    decisionStatus: input.decision.decisionStatus,
    safeToContinue: input.decision.safeToContinue,
    nextRecommendedPhase:
      input.decision.decisionStatus === "approved"
        ? "Phase 143B - LOOP DASHBOARD READINESS PLAN"
        : "Phase 142I follow-up approval/audit review",
    limitations: uniqueStrings(input.limitations),
  };
}

export function createApprovalAuditHardening(
  input: ApprovalAuditHardeningInput,
): ApprovalAuditHardening {
  const decision = evaluateApprovalAuditDecision({
    decisionId: `${input.hardeningId}:decision`,
    approvalGates: input.approvalGates,
    auditTrail: input.auditTrail,
    evidenceRecords: input.evidenceRecords,
    risks: input.risks,
    requiredApprovals: input.requiredApprovals,
    limitations: input.limitations,
  });
  const base = {
    hardeningId: input.hardeningId,
    sourcePhase: input.sourcePhase,
    approvalGates: input.approvalGates,
    auditTrail: input.auditTrail,
    evidenceRecords: input.evidenceRecords,
    risks: input.risks,
    decision,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noRuntimeAutomation: true,
    noCodexInvocation: true,
    noOpenClawInvocation: true,
    noSystemCopyAutomation: true,
    noProviderCalls: true,
    noNetwork: true,
    noFilesystemWrites: true,
    noDashboardMutation: true,
    noDatabaseMutation: true,
    noPackageWorkflowChanges: true,
    noMemoryPersistence: true,
  } satisfies Omit<ApprovalAuditHardening, "summary">;

  return {
    ...base,
    summary: summarizeApprovalAuditHardening({
      ...base,
      limitations: input.limitations,
    }),
  };
}

export function selectApprovalGatesByProtectedAction(
  gates: ApprovalGateHardening[],
  protectedAction: ApprovalAuditProtectedAction,
): ApprovalGateHardening[] {
  return gates.filter((gate) => gate.protectedAction === protectedAction);
}

export function selectAuditRisksByCategory(
  risks: ApprovalAuditRisk[],
  riskCategory: ApprovalAuditRiskCategory,
): ApprovalAuditRisk[] {
  return risks.filter((risk) => risk.riskCategory === riskCategory);
}

export function selectEvidenceByType(
  evidenceRecords: ApprovalEvidenceRecord[],
  evidenceType: ApprovalAuditEvidenceType,
): ApprovalEvidenceRecord[] {
  return evidenceRecords.filter((record) => record.evidenceType === evidenceType);
}
