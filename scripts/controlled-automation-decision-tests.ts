import assert from "node:assert/strict";
import {
  createControlledAutomationDecision,
  createControlledAutomationDecisionInput,
  createControlledAutomationOption,
  selectAutomationOptionsBySafetyLevel,
  selectRejectedAutomationOptions,
  type ControlledAutomationDecision,
  type ControlledAutomationDecisionInput,
  type ControlledAutomationOption,
  type ControlledAutomationReadinessCriteria,
} from "../src/autopilot/controlledAutomationDecision.ts";

const options: ControlledAutomationOption[] = [
  createControlledAutomationOption({
    optionId: "manual_dashboard_only",
    optionName: "Manual plus static dashboard only",
    description: "Keep the loop manual and use the dashboard as the review surface.",
    benefit: "Highest safety posture.",
    risk: "Manual transfer friction may remain.",
    requiredReadiness: ["dashboard clarity acceptable"],
    requiredApproval: ["human approval before next phase"],
    implementationCost: "low",
    safetyLevel: "highest",
    recommendation: "Baseline path.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  }),
  createControlledAutomationOption({
    optionId: "dashboard_interaction_hardening",
    optionName: "Dashboard interaction hardening",
    description: "Improve dashboard interaction before assisted behavior.",
    benefit: "Reduces operator confusion.",
    risk: "Can delay real mini test learning.",
    requiredReadiness: ["dashboard clarity weak"],
    requiredApproval: ["human approval for dashboard-only scope"],
    implementationCost: "medium",
    safetyLevel: "high",
    recommendation: "Use when dashboard clarity is weak.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  }),
  createControlledAutomationOption({
    optionId: "controlled_openclaw_paste_future",
    optionName: "Controlled OpenClaw paste future",
    description: "Plan future assisted prompt transfer after evidence proves the need.",
    benefit: "May reduce manual transfer friction.",
    risk: "Wrong target or stale prompt risk remains high.",
    requiredReadiness: ["mini test complete", "approval audit strong", "rollback strong"],
    requiredApproval: ["human approval before each protected step"],
    implementationCost: "high",
    safetyLevel: "low",
    recommendation: "Future candidate only.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  }),
  createControlledAutomationOption({
    optionId: "controlled_report_return_future",
    optionName: "Controlled report return future",
    description: "Harden report return before assisted behavior.",
    benefit: "Improves validation reliability.",
    risk: "Does not reduce manual transfer effort.",
    requiredReadiness: ["report validation weak"],
    requiredApproval: ["human approval for report-return scope"],
    implementationCost: "medium",
    safetyLevel: "high",
    recommendation: "Use when report validation is weak.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  }),
  createControlledAutomationOption({
    optionId: "defer_until_real_test",
    optionName: "Defer until real mini test",
    description: "Run a real mini test before selecting the path.",
    benefit: "Creates evidence before riskier planning.",
    risk: "Slower than immediate path selection.",
    requiredReadiness: ["operator guide exists"],
    requiredApproval: ["human approval to run mini test manually"],
    implementationCost: "low",
    safetyLevel: "high",
    recommendation: "Primary pre-evidence path.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  }),
];

const baseReadiness: Omit<
  ControlledAutomationReadinessCriteria,
  "advisoryOnly" | "sourceOnly" | "metadataOnly"
> = {
  dashboardClarity: "strong",
  userFrictionLevel: "acceptable",
  copyPastePainLevel: "acceptable",
  approvalAuditReadiness: "strong",
  abortRollbackReadiness: "strong",
  reportValidationReliability: "strong",
  dirtyFileSafety: "strong",
  operatorConfidence: "strong",
  safetyRisk: "low",
  evidenceRefs: ["evidence:test"],
  limitations: [],
};

function decision(
  decisionId: string,
  overrides: Partial<
    Omit<ControlledAutomationDecisionInput, "decisionId" | "readinessCriteria" | "options">
  > & {
    readinessCriteria?: Partial<typeof baseReadiness>;
  } = {},
): ControlledAutomationDecision {
  const input = createControlledAutomationDecisionInput({
    decisionId,
    sourceDashboardRef: "loop_dashboard_static_ui:145i",
    sourceLoopUxRef: "loop_ux_hardening:pilot_12i",
    sourceApprovalAuditRef: "approval_audit_hardening:142i",
    sourceOpenClawBridgeRef: "controlled_openclaw_paste_bridge:pilot_7i",
    sourceReportReturnRef: "controlled_codex_report_return:pilot_8i",
    realMiniTestCompleted: overrides.realMiniTestCompleted ?? false,
    realMiniTestEvidenceRefs: overrides.realMiniTestEvidenceRefs ?? [],
    readinessCriteria: {
      ...baseReadiness,
      ...overrides.readinessCriteria,
      evidenceRefs: [
        ...baseReadiness.evidenceRefs,
        ...(overrides.readinessCriteria?.evidenceRefs ?? []),
      ],
      limitations: [
        ...baseReadiness.limitations,
        ...(overrides.readinessCriteria?.limitations ?? []),
      ],
    },
    riskLevel: overrides.riskLevel ?? "medium",
    requiredApprovals: overrides.requiredApprovals ?? ["human_operator"],
    limitations: overrides.limitations ?? [],
    options,
  });

  return createControlledAutomationDecision(input);
}

const deferDecision = decision("decision:test-defer");
assert.equal(deferDecision.outcome.selectedOption, "defer_until_real_test");
assert.equal(deferDecision.outcome.requiresMiniTestFirst, true);
assert.equal(deferDecision.outcome.safeToAutomate, false);

const dashboardHardeningDecision = decision("decision:test-dashboard", {
  realMiniTestCompleted: true,
  realMiniTestEvidenceRefs: ["mini_test:dashboard_weak"],
  readinessCriteria: { dashboardClarity: "weak" },
});
assert.equal(
  dashboardHardeningDecision.outcome.selectedOption,
  "dashboard_interaction_hardening",
);
assert.equal(dashboardHardeningDecision.outcome.safeToAutomate, false);

const reportDecision = decision("decision:test-report", {
  realMiniTestCompleted: true,
  realMiniTestEvidenceRefs: ["mini_test:report_weak"],
  readinessCriteria: { reportValidationReliability: "weak" },
});
assert.equal(reportDecision.outcome.selectedOption, "controlled_report_return_future");
assert.equal(reportDecision.outcome.safeToAutomate, false);

const openClawDecision = decision("decision:test-openclaw", {
  realMiniTestCompleted: true,
  realMiniTestEvidenceRefs: ["mini_test:manual_transfer_pain_high"],
  readinessCriteria: {
    copyPastePainLevel: "high",
    approvalAuditReadiness: "strong",
    abortRollbackReadiness: "strong",
    reportValidationReliability: "strong",
    dirtyFileSafety: "strong",
    operatorConfidence: "strong",
    safetyRisk: "low",
  },
});
assert.equal(openClawDecision.outcome.selectedOption, "controlled_openclaw_paste_future");
assert.equal(openClawDecision.outcome.safeToAutomate, true);
assert.equal(openClawDecision.noOpenClawInvocation, true);
assert.equal(openClawDecision.noCodexInvocation, true);
assert.equal(openClawDecision.noSystemCopyBuffer, true);
assert.equal(openClawDecision.noPromptTransferAutomation, true);
assert.equal(openClawDecision.noProviderCalls, true);
assert.equal(openClawDecision.noFilesystemWrites, true);
assert.equal(openClawDecision.noDashboardMutation, true);

const highRiskDecision = decision("decision:test-high-risk", {
  realMiniTestCompleted: true,
  realMiniTestEvidenceRefs: ["mini_test:safety_risk_high"],
  riskLevel: "high",
  readinessCriteria: { safetyRisk: "high", operatorConfidence: "weak" },
});
assert.equal(highRiskDecision.outcome.selectedOption, "manual_dashboard_only");
assert.equal(highRiskDecision.outcome.safeToAutomate, false);
assert.ok(highRiskDecision.outcome.blockers.length > 0);

const manualDecision = decision("decision:test-manual", {
  realMiniTestCompleted: true,
  realMiniTestEvidenceRefs: ["mini_test:manual_ok"],
  readinessCriteria: { dashboardClarity: "strong", copyPastePainLevel: "acceptable" },
});
assert.equal(manualDecision.outcome.selectedOption, "manual_dashboard_only");
assert.equal(manualDecision.outcome.safeToAutomate, false);

const highSafetyOptions = selectAutomationOptionsBySafetyLevel(options, "high");
assert.ok(highSafetyOptions.length >= 2);

const rejected = selectRejectedAutomationOptions(options, "manual_dashboard_only");
assert.equal(rejected.includes("manual_dashboard_only"), false);
assert.equal(rejected.length, 4);

console.log(
  `controlled automation decision smoke passed: ${options.length} options, ${highSafetyOptions.length} high-safety options`,
);
