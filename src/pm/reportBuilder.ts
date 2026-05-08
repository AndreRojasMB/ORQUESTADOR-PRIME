import { pmFoundationBoundaries } from "./boundaries.js";
import type { PMApprovalPlan } from "./approvalTypes.js";
import type { PMBlocker } from "./blockerRules.js";
import type { PMDoDValidationResult } from "./dodTypes.js";
import type { PMNextBestActionResult } from "./nextBestAction.js";
import type {
  PMReportConfidence,
  PMReportFinding,
  PMReportGeneratedFromMetadata,
  PMReportSection,
  PMReportSectionItem,
  PMReportSectionKey,
  PMReportType,
  PMReportUncertainty,
  PMReportWorkItem,
  PMStatusReport,
  PMStatusReportInput,
  PMStatusReportResult,
} from "./reportTypes.js";
import type { PMRiskEntry } from "./riskModel.js";
import type {
  PMEvidenceReference,
  PMFindingSeverity,
  ProjectPhaseRef,
} from "./types.js";

export const pmReportTypes = [
  "phase_status_report",
  "milestone_status_report",
  "blocker_report",
  "risk_report",
  "approval_readiness_report",
  "next_action_report",
  "roadmap_return_report",
] as const satisfies readonly PMReportType[];

const defaultEvidenceRefs: PMEvidenceReference[] = [];

const reportTypeTitle: Record<PMReportType, string> = {
  phase_status_report: "PM phase status report",
  milestone_status_report: "PM milestone status report",
  blocker_report: "PM blocker report",
  risk_report: "PM risk report",
  approval_readiness_report: "PM approval readiness report",
  next_action_report: "PM next action report",
  roadmap_return_report: "PM roadmap return report",
};

const createDefaultConfidence = (evidenceRefs: PMEvidenceReference[]): PMReportConfidence => ({
  level: evidenceRefs["length"] > 0 ? "medium" : "low",
  safeSummary:
    evidenceRefs["length"] > 0
      ? "Report confidence is based on caller-provided evidence metadata."
      : "Report confidence is limited because no evidence metadata was supplied.",
  evidenceRefs,
  metadataOnly: true,
  noExecution: true,
});

const createGeneratedFromMetadata = (
  input: PMStatusReportInput,
  phaseRef: ProjectPhaseRef,
): PMReportGeneratedFromMetadata => ({
  ...(input.generatedFrom?.sourcePhaseRef ? { sourcePhaseRef: input.generatedFrom.sourcePhaseRef } : {}),
  sourceLabel: input.generatedFrom?.sourceLabel ?? `pm_status_reporting:${input.reportType}`,
  ...(input.generatedFrom?.callerSuppliedTimestamp
    ? { callerSuppliedTimestamp: input.generatedFrom.callerSuppliedTimestamp }
    : {}),
  ...(input.generatedFrom?.sourcePhaseRef ? {} : { sourcePhaseRef: phaseRef }),
  metadataOnly: true,
  noRuntimeInspection: true,
});

const makeFinding = (
  index: number,
  severity: PMFindingSeverity,
  reasonCode: string,
  safeMessage: string,
  sectionKey?: PMReportSectionKey,
): PMReportFinding => ({
  findingId: `pm_report_finding:${index}`,
  severity,
  reasonCode,
  safeMessage,
  ...(sectionKey ? { sectionKey } : {}),
  evidenceRefs: [],
  metadataOnly: true,
  noExecution: true,
});

const makeSectionItem = (
  itemId: string,
  label: string,
  safeSummary: string,
  evidenceRefs: PMEvidenceReference[] = defaultEvidenceRefs,
  extra?: {
    severity?: PMFindingSeverity | undefined;
    status?: string | undefined;
    phaseRef?: ProjectPhaseRef | undefined;
    taskId?: string | undefined;
    milestoneId?: string | undefined;
    riskId?: string | undefined;
    blockerId?: string | undefined;
    approvalPlanId?: string | undefined;
  },
): PMReportSectionItem => ({
  itemId,
  label,
  safeSummary,
  ...(extra?.severity ? { severity: extra.severity } : {}),
  ...(extra?.status ? { status: extra.status } : {}),
  ...(extra?.phaseRef ? { phaseRef: extra.phaseRef } : {}),
  ...(extra?.taskId ? { taskId: extra.taskId } : {}),
  ...(extra?.milestoneId ? { milestoneId: extra.milestoneId } : {}),
  ...(extra?.riskId ? { riskId: extra.riskId } : {}),
  ...(extra?.blockerId ? { blockerId: extra.blockerId } : {}),
  ...(extra?.approvalPlanId ? { approvalPlanId: extra.approvalPlanId } : {}),
  evidenceRefs,
  metadataOnly: true,
  noExecution: true,
});

const makeSection = (
  key: PMReportSectionKey,
  title: string,
  safeSummary: string,
  items: PMReportSectionItem[],
): PMReportSection => ({
  sectionId: `pm_report_section:${key}`,
  key,
  title,
  safeSummary,
  items,
  metadataOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
  noExecution: true,
});

const workItemsToSectionItems = (items: PMReportWorkItem[]): PMReportSectionItem[] =>
  items.map((item) =>
    makeSectionItem(item.itemId, item.label, item.safeSummary, item.evidenceRefs, {
      ...(item.phaseRef ? { phaseRef: item.phaseRef } : {}),
      ...(item.taskId ? { taskId: item.taskId } : {}),
      ...(item.milestoneId ? { milestoneId: item.milestoneId } : {}),
      ...(item.status ? { status: item.status } : {}),
    }),
  );

const riskSeverityToFindingSeverity = (severity: PMRiskEntry["severity"]): PMFindingSeverity =>
  severity === "critical" || severity === "high" ? "fail" : severity === "medium" ? "warn" : "info";

const riskItems = (risks: PMRiskEntry[]): PMReportSectionItem[] =>
  risks.map((risk) =>
    makeSectionItem(risk.riskId, risk.label, risk.safeSummary, risk.evidenceRefs, {
      severity: riskSeverityToFindingSeverity(risk.severity),
      status: risk.status,
      riskId: risk.riskId,
      phaseRef: risk.phaseRefs[0],
      taskId: risk.taskIds[0],
      milestoneId: risk.milestoneIds[0],
    }),
  );

const blockerSeverityToFindingSeverity = (blocker: PMBlocker): PMFindingSeverity =>
  blocker.severity === "critical" || blocker.severity === "high"
    ? "fail"
    : blocker.severity === "medium"
      ? "warn"
      : "info";

const blockerItems = (blockers: PMBlocker[]): PMReportSectionItem[] =>
  blockers.map((blocker) =>
    makeSectionItem(blocker.blockerId, blocker.label, blocker.safeSummary, blocker.evidenceRefs, {
      severity: blockerSeverityToFindingSeverity(blocker),
      status: blocker.status,
      blockerId: blocker.blockerId,
      phaseRef: blocker.blockedPhaseRefs[0],
      taskId: blocker.blockedTaskIds[0],
      milestoneId: blocker.blockedMilestoneIds[0],
    }),
  );

const dodGapItems = (validations: PMDoDValidationResult[]): PMReportSectionItem[] =>
  validations.flatMap((validation) =>
    validation.findings.map((finding) =>
      makeSectionItem(finding.id, finding.reasonCode, finding.safeMessage, [], {
        severity: finding.severity,
        status: validation.status,
      }),
    ),
  );

const approvalItems = (approvalPlans: PMApprovalPlan[]): PMReportSectionItem[] =>
  approvalPlans.flatMap((plan) =>
    plan.requirements.map((requirement) =>
      makeSectionItem(
        requirement.requirementId,
        `${requirement.gateType}:${requirement.status}`,
        requirement.safeSummary,
        requirement.evidenceRequirements.flatMap((evidenceRequirement) => evidenceRequirement.evidenceRefs),
        {
          status: requirement.status,
          approvalPlanId: plan.approvalPlanId,
          phaseRef: requirement.phaseRef ?? plan.phaseRef,
          taskId: requirement.taskIds[0],
        },
      ),
    ),
  );

const nextActionItems = (result?: PMNextBestActionResult): PMReportSectionItem[] => {
  if (!result) return [];
  const selected = result.selectedAction
    ? [
        makeSectionItem(
          result.selectedAction.actionId,
          result.selectedAction.label,
          result.selectedAction.safeSummary,
          result.selectedAction.evidenceRefs,
          {
            status: result.selectedAction.status,
            phaseRef: result.selectedAction.phaseRefs[0],
            taskId: result.selectedAction.taskIds[0],
            milestoneId: result.selectedAction.milestoneIds[0],
          },
        ),
      ]
    : [];

  return [
    ...selected,
    ...result.recommendations.map((recommendation) =>
      makeSectionItem(
        recommendation.recommendationId,
        recommendation.category,
        recommendation.safeSummary,
        [],
        {
          status: recommendation.status,
          severity: recommendation.status === "fail" || recommendation.status === "blocked" ? "fail" : "info",
        },
      ),
    ),
  ];
};

const buildSections = (
  input: PMStatusReportInput,
  phaseRef: ProjectPhaseRef,
): PMReportSection[] => {
  const completedWork = input.completedWork ?? [];
  const pendingWork = input.pendingWork ?? [];
  const risks = input.risks ?? [];
  const blockers = input.blockers ?? [];
  const dodValidations = input.dodValidations ?? [];
  const approvalPlans = input.approvalPlans ?? [];
  const taskGraphTasks = input.taskGraph?.tasks ?? [];
  const taskGraphCompleted = taskGraphTasks.filter((task) => task.status === "done");
  const taskGraphPending = taskGraphTasks.filter((task) => task.status !== "done");

  return [
    makeSection("current_phase", "Current phase", `Current phase metadata: ${phaseRef}.`, [
      makeSectionItem("current_phase", phaseRef, input.projectState?.safeSummary ?? input.safeSummary ?? phaseRef, [], {
        phaseRef,
        status: input.projectState?.status,
      }),
    ]),
    makeSection(
      "milestone_health",
      "Milestone health",
      input.milestoneHealth
        ? `Milestone ${input.milestoneHealth.milestoneId} health is ${input.milestoneHealth.health}.`
        : "No milestone health metadata was supplied.",
      input.milestoneHealth
        ? [
            makeSectionItem(
              input.milestoneHealth.milestoneId,
              input.currentMilestone?.label ?? input.milestoneHealth.milestoneId,
              `Health ${input.milestoneHealth.health}; done ${input.milestoneHealth.doneCount}/${input.milestoneHealth.taskCount}; blocked ${input.milestoneHealth.blockedCount}.`,
              [],
              {
                status: input.milestoneHealth.health,
                milestoneId: input.milestoneHealth.milestoneId,
                phaseRef: input.currentMilestone?.phaseRef,
              },
            ),
          ]
        : [],
    ),
    makeSection(
      "completed_work",
      "Completed work",
      `${completedWork.length + taskGraphCompleted.length} completed work item(s) reported.`,
      [
        ...workItemsToSectionItems(completedWork),
        ...taskGraphCompleted.map((task) =>
          makeSectionItem(task.taskId, task.label, task.safeSummary, task.evidenceRefs, {
            status: task.status,
            phaseRef: task.phaseRef,
            taskId: task.taskId,
            milestoneId: task.milestoneId,
          }),
        ),
      ],
    ),
    makeSection(
      "pending_work",
      "Pending work",
      `${pendingWork.length + taskGraphPending.length} pending work item(s) reported.`,
      [
        ...workItemsToSectionItems(pendingWork),
        ...taskGraphPending.map((task) =>
          makeSectionItem(task.taskId, task.label, task.safeSummary, task.evidenceRefs, {
            status: task.status,
            phaseRef: task.phaseRef,
            taskId: task.taskId,
            milestoneId: task.milestoneId,
          }),
        ),
      ],
    ),
    makeSection(
      "blockers",
      "Blockers",
      `${blockers.length} blocker metadata item(s) reported.`,
      blockerItems(blockers),
    ),
    makeSection("risks", "Risks", `${risks.length} risk metadata item(s) reported.`, riskItems(risks)),
    makeSection(
      "dod_gaps",
      "Definition of Done gaps",
      `${dodValidations.filter((validation) => validation.status !== "pass").length} DoD validation(s) need attention.`,
      dodGapItems(dodValidations),
    ),
    makeSection(
      "approval_requirements",
      "Approval requirements",
      `${approvalPlans.length} approval plan(s) supplied as metadata.`,
      approvalItems(approvalPlans),
    ),
    makeSection(
      "next_best_action",
      "Next best action",
      input.nextBestActionResult
        ? `Next-action result status is ${input.nextBestActionResult.status}.`
        : "No next-action recommendation metadata was supplied.",
      nextActionItems(input.nextBestActionResult),
    ),
    makeSection(
      "autopilot_context",
      "Autopilot context",
      input.autopilotCloseout
        ? `Autopilot closeout ${input.autopilotCloseout.closeoutRefId} has status ${input.autopilotCloseout.status}.`
        : "No Autopilot closeout metadata was supplied.",
      input.autopilotCloseout
        ? [
            makeSectionItem(
              input.autopilotCloseout.closeoutRefId,
              input.autopilotCloseout.status,
              input.autopilotCloseout.safeSummary,
              input.autopilotCloseout.evidenceRefs,
              { phaseRef: input.autopilotCloseout.phaseRef },
            ),
          ]
        : [],
    ),
    makeSection(
      "confidence_uncertainty",
      "Confidence and uncertainty",
      `${input.uncertainty?.length ?? 0} uncertainty item(s) reported.`,
      (input.uncertainty ?? []).map((item) =>
        makeSectionItem(item.uncertaintyId, item.label, item.safeSummary, item.evidenceRefs, {
          severity: item.severity,
        }),
      ),
    ),
    makeSection(
      "evidence",
      "Evidence references",
      `${input.evidenceRefs?.length ?? 0} evidence reference(s) supplied.`,
      (input.evidenceRefs ?? []).map((evidence) =>
        makeSectionItem(evidence.evidenceId, evidence.label, evidence.safeSummary, [evidence]),
      ),
    ),
  ];
};

const buildSummary = (input: PMStatusReportInput, phaseRef: ProjectPhaseRef): string => {
  if (input.executiveSummary?.trim()) return input.executiveSummary;
  const riskCount = input.risks?.length ?? 0;
  const blockerCount = input.blockers?.length ?? 0;
  const nextActionStatus = input.nextBestActionResult?.status ?? "not_supplied";
  return `Phase ${phaseRef} report built from caller-provided metadata with ${riskCount} risk(s), ${blockerCount} blocker(s), and next-action status ${nextActionStatus}.`;
};

const collectBuilderFindings = (input: PMStatusReportInput, phaseRef: ProjectPhaseRef): PMReportFinding[] => {
  const findings: PMReportFinding[] = [];
  if (!input.phaseRef && !input.projectState?.currentPhaseRef) {
    findings.push(
      makeFinding(
        findings.length + 1,
        "warn",
        "PHASE_REF_INFERRED",
        "No phase reference was supplied, so the report uses a metadata placeholder.",
        "current_phase",
      ),
    );
  }
  if (!input.evidenceRefs || input.evidenceRefs["length"] === 0) {
    findings.push(
      makeFinding(
        findings.length + 1,
        "warn",
        "EVIDENCE_METADATA_MISSING",
        "No evidence metadata was supplied with the PM status report input.",
        "evidence",
      ),
    );
  }
  if (input.reportType === "roadmap_return_report" && !input.autopilotCloseout) {
    findings.push(
      makeFinding(
        findings.length + 1,
        "warn",
        "ROADMAP_RETURN_CONTEXT_MISSING",
        "Roadmap return report was requested without Autopilot closeout metadata.",
        "autopilot_context",
      ),
    );
  }
  if (phaseRef === "phase:unspecified") {
    findings.push(
      makeFinding(
        findings.length + 1,
        "warn",
        "UNSPECIFIED_PHASE",
        "Report phase is unspecified and should be supplied by the caller for stronger context.",
        "current_phase",
      ),
    );
  }
  return [...findings, ...(input.findings ?? [])];
};

export const buildPmStatusReport = (input: PMStatusReportInput): PMStatusReportResult => {
  const phaseRef = input.phaseRef ?? input.projectState?.currentPhaseRef ?? "phase:unspecified";
  const evidenceRefs = input.evidenceRefs ?? [];
  const findings = collectBuilderFindings(input, phaseRef);
  const errors = findings.filter((finding) => finding.severity === "fail");
  const warnings = findings.filter((finding) => finding.severity === "warn");
  const confidence = input.confidence ?? createDefaultConfidence(evidenceRefs);
  const uncertainty: PMReportUncertainty[] = input.uncertainty ?? [];
  const generatedFrom = createGeneratedFromMetadata(input, phaseRef);
  const sections = buildSections(input, phaseRef);
  const status = errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass";

  const report: PMStatusReport = {
    reportId: input.reportId ?? `pm_report:${input.reportType}:${phaseRef}`,
    schemaVersion: input.schemaVersion ?? "1.0",
    reportType: input.reportType,
    status,
    phaseRef,
    title: input.title ?? reportTypeTitle[input.reportType],
    safeSummary: input.safeSummary ?? `Report-only PM status metadata for ${phaseRef}.`,
    executiveSummary: buildSummary(input, phaseRef),
    sections,
    findings,
    evidenceRefs,
    confidence,
    uncertainty,
    ...(input.nextBestActionResult ? { recommendedNextAction: input.nextBestActionResult } : {}),
    generatedFrom,
    assumptions: input.assumptions ?? [],
    exclusions: input.exclusions ?? [],
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noExecution: true,
    noHandoffTrigger: true,
    noValidationTrigger: true,
    noCloseoutTrigger: true,
    noProviderCalls: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
    noGitMutationFromSource: true,
    boundaries: pmFoundationBoundaries,
  };

  return {
    ok: errors.length === 0,
    status: errors.length > 0 ? "input_invalid" : warnings.length > 0 ? "report_built_with_warnings" : "report_built",
    report,
    warnings,
    errors,
    advisoryOnly: true,
    sourceOnly: true,
    reportOnly: true,
    noExecution: true,
    noProviderCalls: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
    noGitMutationFromSource: true,
    boundaries: pmFoundationBoundaries,
  };
};

const withReportType = (
  input: Omit<PMStatusReportInput, "reportType"> & Partial<Pick<PMStatusReportInput, "reportType">>,
  reportType: PMReportType,
): PMStatusReportInput => ({
  ...input,
  reportType,
});

export const buildPhaseStatusReport = (
  input: Omit<PMStatusReportInput, "reportType"> & Partial<Pick<PMStatusReportInput, "reportType">>,
): PMStatusReportResult => buildPmStatusReport(withReportType(input, "phase_status_report"));

export const buildMilestoneStatusReport = (
  input: Omit<PMStatusReportInput, "reportType"> & Partial<Pick<PMStatusReportInput, "reportType">>,
): PMStatusReportResult => buildPmStatusReport(withReportType(input, "milestone_status_report"));

export const buildBlockerReport = (
  input: Omit<PMStatusReportInput, "reportType"> & Partial<Pick<PMStatusReportInput, "reportType">>,
): PMStatusReportResult => buildPmStatusReport(withReportType(input, "blocker_report"));

export const buildRiskReport = (
  input: Omit<PMStatusReportInput, "reportType"> & Partial<Pick<PMStatusReportInput, "reportType">>,
): PMStatusReportResult => buildPmStatusReport(withReportType(input, "risk_report"));

export const buildApprovalReadinessReport = (
  input: Omit<PMStatusReportInput, "reportType"> & Partial<Pick<PMStatusReportInput, "reportType">>,
): PMStatusReportResult => buildPmStatusReport(withReportType(input, "approval_readiness_report"));

export const buildNextActionReport = (
  input: Omit<PMStatusReportInput, "reportType"> & Partial<Pick<PMStatusReportInput, "reportType">>,
): PMStatusReportResult => buildPmStatusReport(withReportType(input, "next_action_report"));

export const buildRoadmapReturnReport = (
  input: Omit<PMStatusReportInput, "reportType"> & Partial<Pick<PMStatusReportInput, "reportType">>,
): PMStatusReportResult => buildPmStatusReport(withReportType(input, "roadmap_return_report"));
