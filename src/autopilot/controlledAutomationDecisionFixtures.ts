import {
  createControlledAutomationDecision,
  createControlledAutomationDecisionInput,
  createControlledAutomationOption,
  type ControlledAutomationDecision,
  type ControlledAutomationDecisionInput,
  type ControlledAutomationOption,
  type ControlledAutomationReadinessCriteria,
} from "./controlledAutomationDecision.js";

export const controlledAutomationOptionsFixture: ControlledAutomationOption[] = [
  createControlledAutomationOption({
    optionId: "manual_dashboard_only",
    optionName: "Manual plus static dashboard only",
    description: "Keep the loop fully manual and use the dashboard as a read-only review surface.",
    benefit: "Highest safety posture and lowest implementation risk.",
    risk: "Manual transfer friction may remain unresolved.",
    requiredReadiness: ["dashboard clarity acceptable", "manual-only boundaries understood"],
    requiredApproval: ["human approval before next phase"],
    implementationCost: "low",
    safetyLevel: "highest",
    recommendation: "Use as the baseline path.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  }),
  createControlledAutomationOption({
    optionId: "dashboard_interaction_hardening",
    optionName: "Dashboard interaction hardening",
    description: "Improve dashboard clarity, empty states, navigation, and evidence display.",
    benefit: "Reduces operator confusion without introducing external action risk.",
    risk: "Can delay the real mini test if overused.",
    requiredReadiness: ["dashboard clarity weak", "safety risk controlled"],
    requiredApproval: ["human approval for dashboard-only scope"],
    implementationCost: "medium",
    safetyLevel: "high",
    recommendation: "Choose when the static dashboard is hard to interpret.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  }),
  createControlledAutomationOption({
    optionId: "controlled_openclaw_paste_future",
    optionName: "Controlled OpenClaw paste bridge future",
    description: "Plan a future assisted prompt-transfer path after evidence proves the need.",
    benefit: "May reduce manual transfer friction.",
    risk: "Wrong target, stale prompt, missing approval, or accidental send could be serious.",
    requiredReadiness: [
      "real mini test completed",
      "manual transfer pain high",
      "approval and audit strong",
      "abort and rollback strong",
      "report validation reliable",
    ],
    requiredApproval: [
      "before OpenClaw activation",
      "before target focus",
      "before prompt insertion",
      "before send",
      "before report acceptance",
      "before next phase",
    ],
    implementationCost: "high",
    safetyLevel: "low",
    recommendation: "Only consider after real mini test evidence.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  }),
  createControlledAutomationOption({
    optionId: "controlled_report_return_future",
    optionName: "Controlled report return hardening future",
    description: "Strengthen report normalization, validation, alert classification, and closeout.",
    benefit: "Improves next-action and closeout confidence.",
    risk: "Does not reduce manual transfer effort.",
    requiredReadiness: ["report validation weak", "closeout confidence low"],
    requiredApproval: ["human approval for report-return hardening scope"],
    implementationCost: "medium",
    safetyLevel: "high",
    recommendation: "Choose when returned reports are the weak link.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  }),
  createControlledAutomationOption({
    optionId: "defer_until_real_test",
    optionName: "Defer until real mini test",
    description: "Run one real mini test before selecting the automation path.",
    benefit: "Creates evidence before committing to a riskier path.",
    risk: "Slower than choosing a build path immediately.",
    requiredReadiness: ["operator guide exists", "static dashboard exists", "report template exists"],
    requiredApproval: ["human approval to run the mini test manually"],
    implementationCost: "low",
    safetyLevel: "high",
    recommendation: "Primary recommendation before any assisted path.",
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
  evidenceRefs: [
    "dashboard_static_ui:145i",
    "approval_audit:142i",
    "controlled_report_return:8i",
  ],
  limitations: ["Readiness values are fixture metadata."],
};

function buildDecisionInput(
  overrides: Partial<
    Omit<ControlledAutomationDecisionInput, "readinessCriteria" | "options">
  > & {
    readinessCriteria?: Partial<typeof baseReadiness>;
  },
): ControlledAutomationDecisionInput {
  return createControlledAutomationDecisionInput({
    decisionId: overrides.decisionId ?? "controlled_automation_decision:fixture",
    sourceDashboardRef: overrides.sourceDashboardRef ?? "loop_dashboard_static_ui:145i",
    sourceLoopUxRef: overrides.sourceLoopUxRef ?? "loop_ux_hardening:pilot_12i",
    sourceApprovalAuditRef: overrides.sourceApprovalAuditRef ?? "approval_audit_hardening:142i",
    sourceOpenClawBridgeRef:
      overrides.sourceOpenClawBridgeRef ?? "controlled_openclaw_paste_bridge:pilot_7i",
    sourceReportReturnRef:
      overrides.sourceReportReturnRef ?? "controlled_codex_report_return:pilot_8i",
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
    limitations: overrides.limitations ?? ["Fixture is source-only advisory metadata."],
    options: controlledAutomationOptionsFixture,
  });
}

export const controlledAutomationDeferUntilMiniTestFixture: ControlledAutomationDecision =
  createControlledAutomationDecision(
    buildDecisionInput({
      decisionId: "controlled_automation_decision:defer_until_real_test",
      realMiniTestCompleted: false,
    }),
  );

export const controlledAutomationManualDashboardOnlyFixture: ControlledAutomationDecision =
  createControlledAutomationDecision(
    buildDecisionInput({
      decisionId: "controlled_automation_decision:manual_dashboard_only",
      realMiniTestCompleted: true,
      realMiniTestEvidenceRefs: ["mini_test:habit_world:complete"],
      readinessCriteria: {
        dashboardClarity: "strong",
        copyPastePainLevel: "acceptable",
      },
    }),
  );

export const controlledAutomationDashboardHardeningFixture: ControlledAutomationDecision =
  createControlledAutomationDecision(
    buildDecisionInput({
      decisionId: "controlled_automation_decision:dashboard_interaction_hardening",
      realMiniTestCompleted: true,
      realMiniTestEvidenceRefs: ["mini_test:habit_world:dashboard_confusion"],
      readinessCriteria: {
        dashboardClarity: "weak",
        userFrictionLevel: "high",
        operatorConfidence: "acceptable",
      },
    }),
  );

export const controlledAutomationOpenClawFutureCandidateFixture: ControlledAutomationDecision =
  createControlledAutomationDecision(
    buildDecisionInput({
      decisionId: "controlled_automation_decision:openclaw_future_candidate",
      realMiniTestCompleted: true,
      realMiniTestEvidenceRefs: ["mini_test:habit_world:manual_transfer_pain_high"],
      readinessCriteria: {
        copyPastePainLevel: "high",
        approvalAuditReadiness: "strong",
        abortRollbackReadiness: "strong",
        reportValidationReliability: "strong",
        dirtyFileSafety: "strong",
        operatorConfidence: "strong",
        safetyRisk: "low",
      },
    }),
  );

export const controlledAutomationReportReturnHardeningFixture: ControlledAutomationDecision =
  createControlledAutomationDecision(
    buildDecisionInput({
      decisionId: "controlled_automation_decision:report_return_hardening",
      realMiniTestCompleted: true,
      realMiniTestEvidenceRefs: ["mini_test:habit_world:report_validation_weak"],
      readinessCriteria: {
        reportValidationReliability: "weak",
        operatorConfidence: "acceptable",
      },
    }),
  );

export const controlledAutomationHighSafetyRiskFixture: ControlledAutomationDecision =
  createControlledAutomationDecision(
    buildDecisionInput({
      decisionId: "controlled_automation_decision:high_safety_risk",
      realMiniTestCompleted: true,
      realMiniTestEvidenceRefs: ["mini_test:habit_world:safety_risk_high"],
      riskLevel: "high",
      readinessCriteria: {
        safetyRisk: "high",
        operatorConfidence: "weak",
      },
    }),
  );

export const controlledAutomationDecisionFixtures = [
  controlledAutomationDeferUntilMiniTestFixture,
  controlledAutomationManualDashboardOnlyFixture,
  controlledAutomationDashboardHardeningFixture,
  controlledAutomationOpenClawFutureCandidateFixture,
  controlledAutomationReportReturnHardeningFixture,
  controlledAutomationHighSafetyRiskFixture,
] as const;
