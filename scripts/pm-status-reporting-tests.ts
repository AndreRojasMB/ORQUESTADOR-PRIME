import assert from "node:assert/strict";
import {
  buildApprovalReadinessReport,
  buildBlockerReport,
  buildMilestoneStatusReport,
  buildNextActionReport,
  buildPhaseStatusReport,
  buildRiskReport,
  buildRoadmapReturnReport,
  type PMAutopilotCloseoutPlaceholder,
  type PMReportWorkItem,
} from "../src/pm/index.js";
import type { PMApprovalPlan } from "../src/pm/approvalTypes.js";
import type { PMBlocker } from "../src/pm/blockerRules.js";
import type { PMDoDValidationResult } from "../src/pm/dodTypes.js";
import type { PMMilestone, PMMilestoneHealthSummary } from "../src/pm/milestonePlanner.js";
import type { PMNextBestActionResult } from "../src/pm/nextBestAction.js";
import type { PMRiskEntry } from "../src/pm/riskModel.js";
import type { PMTaskGraph } from "../src/pm/taskGraph.js";
import type { PMEvidenceReference, ProjectStateSummary } from "../src/pm/types.js";

const evidenceRef: PMEvidenceReference = {
  evidenceId: "evidence:109I:smoke",
  label: "Phase 109I smoke evidence",
  reference: "docs/pm-status-reporting.md",
  referenceType: "doc",
  safeSummary: "Metadata-only evidence reference for PM status reporting smoke.",
  metadataOnly: true,
  noFileRead: true,
};

const projectState: ProjectStateSummary = {
  projectId: "orquestador-prime",
  schemaVersion: "1.0",
  name: "ORQUESTADOR-PRIME",
  safeSummary: "PM status reporting smoke project state.",
  currentPhaseRef: "Phase 109I",
  status: "reported",
  allowedAutonomyLevels: ["L0_observe_only", "L1_report_only", "L2_plan_only", "L3_propose_only"],
  riskTier: "medium",
  metadataOnly: true,
};

const completedWork: PMReportWorkItem = {
  itemId: "work:completed:109B",
  label: "109B plan",
  safeSummary: "PM status reporting plan was completed as docs-only metadata.",
  phaseRef: "Phase 109B",
  status: "done",
  evidenceRefs: [evidenceRef],
  metadataOnly: true,
  noExecution: true,
};

const taskGraph: PMTaskGraph = {
  graphId: "task_graph:109I:smoke",
  schemaVersion: "1.0",
  name: "109I smoke task graph",
  safeSummary: "Metadata-only task graph for PM status report smoke.",
  tasks: [
    {
      taskId: "task:109I:report_types",
      label: "Report types",
      safeSummary: "Add report type metadata.",
      status: "done",
      priority: "high",
      phaseRef: "Phase 109I",
      milestoneId: "milestone:pm_reporting",
      dependencies: [],
      evidenceRefs: [evidenceRef],
      assumptions: [],
      exclusions: [],
      metadataOnly: true,
      noExecution: true,
    },
    {
      taskId: "task:109I:builder",
      label: "Report builder",
      safeSummary: "Add pure report builder helpers.",
      status: "in_progress",
      priority: "high",
      phaseRef: "Phase 109I",
      milestoneId: "milestone:pm_reporting",
      dependencies: [],
      evidenceRefs: [evidenceRef],
      assumptions: [],
      exclusions: [],
      metadataOnly: true,
      noExecution: true,
    },
  ],
  dependencies: [],
  orderedTaskIds: ["task:109I:report_types", "task:109I:builder"],
  assumptions: [],
  exclusions: [],
  advisoryOnly: true,
  sourceOnly: true,
  boundaries: {
    advisoryOnly: true,
    sourceOnly: true,
    noProviderCalls: true,
    noNetwork: true,
    noFilesystemReads: true,
    noFilesystemWrites: true,
    noCommandExecution: true,
    noRuntimeExecution: true,
    noDashboardImplementation: true,
    noScaffoldGeneration: true,
    noConnectorImplementation: true,
    noCredentialVaultImplementation: true,
    noPackageWorkflowChanges: true,
    noBaselineArtifactMutation: true,
    noActionProposalApprovalExecution: true,
    noJobsExecution: true,
    noPersistence: true,
    noCiChanges: true,
    noDbSchemas: true,
    noSql: true,
    noProductionReadinessClaims: true,
    noFullyAutonomousClaims: true,
    noSecurityComplianceGuarantees: true,
  },
};

const milestone: PMMilestone = {
  milestoneId: "milestone:pm_reporting",
  label: "PM reporting",
  safeSummary: "PM reporting metadata milestone.",
  status: "in_progress",
  phaseRef: "Phase 109I",
  taskIds: ["task:109I:report_types", "task:109I:builder"],
  metadataOnly: true,
  noExecution: true,
};

const milestoneHealth: PMMilestoneHealthSummary = {
  milestoneId: "milestone:pm_reporting",
  health: "in_progress",
  taskCount: 2,
  doneCount: 1,
  blockedCount: 0,
  inProgressCount: 1,
  plannedCount: 0,
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
};

const dodValidation: PMDoDValidationResult = {
  validationId: "dod_validation:109I:smoke",
  schemaVersion: "1.0",
  valid: false,
  status: "warn",
  findings: [
    {
      id: "dod_gap:smoke",
      severity: "warn",
      reasonCode: "SMOKE_GAP",
      safeMessage: "Smoke DoD gap stays metadata-only.",
      metadata: { smoke: true },
    },
  ],
  warnings: [],
  errors: [],
  advisoryOnly: true,
  sourceOnly: true,
  boundaries: taskGraph.boundaries,
};

const risk: PMRiskEntry = {
  riskId: "risk:109I:scope",
  label: "Scope drift",
  safeSummary: "Implementation must stay inside PM report files.",
  likelihood: "possible",
  impact: "medium",
  severity: "medium",
  status: "watching",
  riskSurfaces: ["store"],
  phaseRefs: ["Phase 109I"],
  taskIds: ["task:109I:builder"],
  milestoneIds: ["milestone:pm_reporting"],
  dodRefs: [],
  evidenceRefs: [evidenceRef],
  assumptions: [],
  exclusions: [],
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
  noMitigationExecution: true,
  boundaries: taskGraph.boundaries,
};

const blocker: PMBlocker = {
  blockerId: "blocker:109I:none",
  label: "No active blocker",
  safeSummary: "No active blocker is present in this smoke fixture.",
  status: "resolved_metadata_only",
  severity: "low",
  riskSurfaces: ["unknown"],
  blockedPhaseRefs: [],
  blockedTaskIds: [],
  blockedMilestoneIds: [],
  blockedDodRefs: [],
  evidenceRefs: [evidenceRef],
  assumptions: [],
  exclusions: [],
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
  noResolutionExecution: true,
  noActionProposalApprovalExecution: true,
  noJobsExecution: true,
  boundaries: taskGraph.boundaries,
};

const approvalPlan: PMApprovalPlan = {
  approvalPlanId: "approval_plan:109I:smoke",
  schemaVersion: "1.0",
  label: "PM report approval metadata",
  safeSummary: "No real approval is created by PM status reporting.",
  phaseRef: "Phase 109I",
  riskLevel: "medium",
  requirements: [],
  assumptions: [],
  exclusions: [],
  metadataOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
  noApprovalCreation: true,
  noApprovalExecution: true,
  noActionDispatch: true,
  noProposalStoreWrites: true,
  noJobsExecution: true,
  noSelfApproval: true,
  boundaries: taskGraph.boundaries,
};

const nextBestAction: PMNextBestActionResult = {
  validationId: "next_action:109I:smoke",
  schemaVersion: "1.0",
  valid: true,
  status: "pass",
  recommendations: [
    {
      recommendationId: "recommendation:110B",
      actionId: "action:110B",
      category: "plan",
      priority: "medium",
      status: "pass",
      safeSummary: "Proceed to PM Core Review Plan after 109I is closed.",
      recommendedAutonomyLevel: "L2_plan_only",
      reasons: [],
      metadataOnly: true,
      advisoryOnly: true,
      sourceOnly: true,
      noExecution: true,
      noActionDispatch: true,
      noProposalCreation: true,
      noApprovalCreation: true,
      noApprovalExecution: true,
      noJobsExecution: true,
      noBranchCommitPrCreation: true,
      noCodexOpenCodeExecution: true,
    },
  ],
  findings: [],
  warnings: [],
  errors: [],
  advisoryOnly: true,
  sourceOnly: true,
  noExecution: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noApprovalCreation: true,
  noApprovalExecution: true,
  noProposalStoreWrites: true,
  noJobsExecution: true,
  noBranchCommitPrCreation: true,
  noCodexOpenCodeExecution: true,
  boundaries: taskGraph.boundaries,
};

const autopilotCloseout: PMAutopilotCloseoutPlaceholder = {
  closeoutRefId: "autopilot_closeout:26K-I",
  phaseRef: "Phase 26K-I",
  status: "closed_and_pushed",
  safeSummary: "Autopilot pivot closed and returned to the PM roadmap.",
  roadmapReturnTarget: "Phase 109B",
  evidenceRefs: [evidenceRef],
  placeholderOnly: true,
  metadataOnly: true,
  noExecution: true,
};

const baseInput = {
  phaseRef: "Phase 109I",
  projectState,
  taskGraph,
  currentMilestone: milestone,
  milestoneHealth,
  dodValidations: [dodValidation],
  risks: [risk],
  blockers: [blocker],
  approvalPlans: [approvalPlan],
  nextBestActionResult: nextBestAction,
  completedWork: [completedWork],
  autopilotCloseout,
  evidenceRefs: [evidenceRef],
  assumptions: ["Smoke fixture is caller-provided metadata."],
  exclusions: ["No runtime behavior is tested here."],
};

const phaseReport = buildPhaseStatusReport(baseInput);
assert.equal(phaseReport.ok, true);
assert.equal(phaseReport.report.reportType, "phase_status_report");
assert.equal(phaseReport.report.reportOnly, true);
assert.equal(phaseReport.report.noExecution, true);
assert.equal(phaseReport.report.noProviderCalls, true);

const milestoneReport = buildMilestoneStatusReport(baseInput);
assert.equal(
  milestoneReport.report.sections.find((section) => section.key === "milestone_health")?.items.length,
  1,
);

const blockerReport = buildBlockerReport(baseInput);
assert.equal(blockerReport.report.sections.find((section) => section.key === "blockers")?.items.length, 1);

const riskReport = buildRiskReport(baseInput);
assert.equal(riskReport.report.sections.find((section) => section.key === "risks")?.items.length, 1);

const approvalReport = buildApprovalReadinessReport(baseInput);
assert.equal(
  approvalReport.report.sections.find((section) => section.key === "approval_requirements")?.items.length,
  0,
);

const nextActionReport = buildNextActionReport(baseInput);
assert.equal(
  nextActionReport.report.sections.find((section) => section.key === "next_best_action")?.items.length,
  1,
);

const roadmapReport = buildRoadmapReturnReport(baseInput);
assert.equal(
  roadmapReport.report.sections.find((section) => section.key === "autopilot_context")?.items.length,
  1,
);
assert.equal(roadmapReport.report.noHandoffTrigger, true);
assert.equal(roadmapReport.report.noValidationTrigger, true);
assert.equal(roadmapReport.report.noCloseoutTrigger, true);
assert.equal(roadmapReport.report.noMemoryPersistence, true);
assert.equal(roadmapReport.report.noGitMutationFromSource, true);

console.log("7/7 PM status reporting smoke tests passed");
