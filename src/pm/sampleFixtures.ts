import { pmFoundationBoundaries } from "./boundaries.js";
import { buildPhaseStatusReport } from "./reportBuilder.js";
import type { PMApprovalPlan } from "./approvalTypes.js";
import type { PMBlocker } from "./blockerRules.js";
import type {
  PMAcceptanceCriterion,
  PMDefinitionOfDone,
  PMDoDValidationResult,
  PMEvidenceRequirement,
} from "./dodTypes.js";
import type { PMMilestone, PMMilestoneHealthSummary } from "./milestonePlanner.js";
import type { PMNextBestActionResult } from "./nextBestAction.js";
import type { PMRiskEntry } from "./riskModel.js";
import type { PMStatusReportResult } from "./reportTypes.js";
import type { PMTaskGraph, PMTaskNode } from "./taskGraph.js";
import type {
  PMEvidenceReference,
  PMRecommendedNextStep,
  ProjectBlockerRef,
  ProjectDecisionRef,
  ProjectDoDRef,
  ProjectMilestoneRef,
  ProjectRiskRef,
  ProjectRoadmapRef,
  ProjectSnapshot,
  ProjectState,
  ProjectStateSummary,
  ProjectStateValidationResult,
  ProjectTaskSummaryRef,
} from "./types.js";

export const pmSampleEvidenceRef: PMEvidenceReference = {
  evidenceId: "evidence:pm-core:110I",
  label: "PM Core review evidence",
  reference: "docs/pm-core-review.md",
  referenceType: "review",
  safeSummary: "Metadata-only evidence reference for PM Core review fixtures.",
  metadataOnly: true,
  noFileRead: true,
};

export const pmSampleRecommendedNextStep: PMRecommendedNextStep = {
  nextStepId: "next_step:111B",
  title: "Plan SOLID architecture charter",
  safeSummary: "After PM Core review closes, plan the SOLID architecture charter.",
  priority: "medium",
  decisionMode: "plan_only",
  riskSurfaces: ["unknown"],
  recommendationOnly: true,
  noExecution: true,
};

export const pmSampleRoadmapRef: ProjectRoadmapRef = {
  roadmapRefId: "roadmap:post-100",
  phaseRef: "Phase 111B",
  label: "Post-100 roadmap",
  safeSummary: "Formal roadmap continues with the SOLID Architecture Charter Plan.",
  metadataOnly: true,
  noFileRead: true,
};

export const pmSampleMilestoneRef: ProjectMilestoneRef = {
  milestoneRefId: "milestone_ref:pm-core",
  label: "PM Core 101-110",
  safeSummary: "PM Core review milestone metadata.",
  targetPhaseRef: "Phase 110I",
  status: "reported",
  metadataOnly: true,
  noExecution: true,
};

export const pmSampleTaskSummaryRef: ProjectTaskSummaryRef = {
  taskRefId: "task_ref:pm-core-review",
  label: "PM Core review",
  safeSummary: "Review PM Core capabilities, boundaries, exports, fixtures, and smoke coverage.",
  status: "reported",
  phaseRef: "Phase 110I",
  metadataOnly: true,
  noTaskExecution: true,
};

export const pmSampleDecisionRef: ProjectDecisionRef = {
  decisionRefId: "decision:pm-core-to-solid",
  label: "Proceed to SOLID planning after PM Core closeout",
  safeSummary: "Recommend Phase 111B after PM Core review closes cleanly.",
  decisionMode: "plan_only",
  phaseRef: "Phase 110I",
  metadataOnly: true,
  noApprovalExecution: true,
};

export const pmSampleRiskRef: ProjectRiskRef = {
  riskRefId: "risk_ref:pm-core-boundaries",
  label: "Boundary drift",
  safeSummary: "PM Core review must preserve source-only advisory boundaries.",
  riskTier: "medium",
  riskSurfaces: ["runtime", "dashboard", "provider"],
  metadataOnly: true,
  noMitigationExecution: true,
};

export const pmSampleBlockerRef: ProjectBlockerRef = {
  blockerRefId: "blocker_ref:none",
  label: "No blocking PM Core issue",
  safeSummary: "No blocking PM Core issue is present in this fixture.",
  severity: "low",
  blockedPhaseRefs: [],
  metadataOnly: true,
  noResolutionExecution: true,
};

export const pmSampleDoDRef: ProjectDoDRef = {
  dodRefId: "dod_ref:pm-core-review",
  label: "PM Core review DoD",
  safeSummary: "PM Core review DoD metadata reference.",
  phaseRef: "Phase 110I",
  metadataOnly: true,
  noCheckExecution: true,
};

export const pmSampleProjectStateSummary: ProjectStateSummary = {
  projectId: "orquestador-prime",
  schemaVersion: "1.0",
  name: "ORQUESTADOR-PRIME",
  safeSummary: "PM Core review source-only metadata summary.",
  currentPhaseRef: "Phase 110I",
  status: "reported",
  allowedAutonomyLevels: ["L0_observe_only", "L1_report_only", "L2_plan_only", "L3_propose_only"],
  riskTier: "medium",
  metadataOnly: true,
};

export const pmSampleProjectState: ProjectState = {
  projectId: "orquestador-prime",
  schemaVersion: "1.0",
  name: "ORQUESTADOR-PRIME",
  safeSummary: "PM Core review project state metadata.",
  currentPhaseRef: "Phase 110I",
  status: "reported",
  allowedAutonomyLevels: ["L0_observe_only", "L1_report_only", "L2_plan_only", "L3_propose_only"],
  roadmapRefs: [pmSampleRoadmapRef],
  milestoneRefs: [pmSampleMilestoneRef],
  taskSummaryRefs: [pmSampleTaskSummaryRef],
  decisionRefs: [pmSampleDecisionRef],
  riskRefs: [pmSampleRiskRef],
  blockerRefs: [pmSampleBlockerRef],
  dodRefs: [pmSampleDoDRef],
  evidenceRefs: [pmSampleEvidenceRef],
  recommendedNextSteps: [pmSampleRecommendedNextStep],
  assumptions: ["Fixture metadata is caller-provided and static."],
  exclusions: ["Fixture metadata does not represent live runtime state."],
  advisoryOnly: true,
  sourceOnly: true,
  boundaries: pmFoundationBoundaries,
};

export const pmSampleProjectStateValidation: ProjectStateValidationResult = {
  validationId: "project_state_validation:sample:110I",
  schemaVersion: "1.0",
  valid: true,
  status: "pass",
  findings: [],
  warnings: [],
  errors: [],
  advisoryOnly: true,
  sourceOnly: true,
  boundaries: pmFoundationBoundaries,
};

export const pmSampleProjectSnapshot: ProjectSnapshot = {
  snapshotId: "snapshot:pm-core:110I",
  projectId: pmSampleProjectState.projectId,
  schemaVersion: "1.0",
  status: "valid",
  summary: pmSampleProjectStateSummary,
  state: pmSampleProjectState,
  validation: pmSampleProjectStateValidation,
  metadataOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
  boundaries: pmFoundationBoundaries,
};

export const pmSampleTaskNodes: PMTaskNode[] = [
  {
    taskId: "task:110I:exports",
    label: "Complete PM Core exports",
    safeSummary: "Expose the intended source-only PM Core surface.",
    status: "done",
    priority: "high",
    phaseRef: "Phase 110I",
    milestoneId: "milestone:pm-core-review",
    dependencies: [],
    evidenceRefs: [pmSampleEvidenceRef],
    assumptions: [],
    exclusions: [],
    metadataOnly: true,
    noExecution: true,
  },
  {
    taskId: "task:110I:fixtures",
    label: "Add PM Core fixtures",
    safeSummary: "Add static metadata fixtures for PM Core review.",
    status: "done",
    priority: "high",
    phaseRef: "Phase 110I",
    milestoneId: "milestone:pm-core-review",
    dependencies: [
      {
        dependencyId: "dependency:fixtures-after-exports",
        fromTaskId: "task:110I:fixtures",
        toTaskId: "task:110I:exports",
        dependencyType: "sequence_after",
        safeSummary: "Fixture review follows the public PM export surface.",
        metadataOnly: true,
        noExecution: true,
      },
    ],
    evidenceRefs: [pmSampleEvidenceRef],
    assumptions: [],
    exclusions: [],
    metadataOnly: true,
    noExecution: true,
  },
];

export const pmSampleTaskGraph: PMTaskGraph = {
  graphId: "task_graph:pm-core:110I",
  schemaVersion: "1.0",
  name: "PM Core review graph",
  safeSummary: "Static PM Core review graph metadata.",
  tasks: pmSampleTaskNodes,
  dependencies: pmSampleTaskNodes.flatMap((task) => task.dependencies),
  orderedTaskIds: pmSampleTaskNodes.map((task) => task.taskId),
  assumptions: ["Task graph fixture is static metadata."],
  exclusions: ["No task step is executed by this fixture."],
  advisoryOnly: true,
  sourceOnly: true,
  boundaries: pmFoundationBoundaries,
};

export const pmSampleMilestone: PMMilestone = {
  milestoneId: "milestone:pm-core-review",
  label: "PM Core review",
  safeSummary: "Milestone metadata for closing the PM Core block.",
  status: "complete",
  phaseRef: "Phase 110I",
  taskIds: pmSampleTaskNodes.map((task) => task.taskId),
  metadataOnly: true,
  noExecution: true,
};

export const pmSampleMilestoneHealth: PMMilestoneHealthSummary = {
  milestoneId: pmSampleMilestone.milestoneId,
  health: "complete",
  taskCount: pmSampleTaskNodes.length,
  doneCount: pmSampleTaskNodes.length,
  blockedCount: 0,
  inProgressCount: 0,
  plannedCount: 0,
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
};

export const pmSampleEvidenceRequirement: PMEvidenceRequirement = {
  evidenceRequirementId: "evidence_requirement:pm-core-review",
  label: "PM Core review evidence",
  safeSummary: "Metadata-only evidence reference required for PM Core review.",
  required: true,
  acceptedEvidenceRefs: [pmSampleEvidenceRef],
  metadataOnly: true,
  noFileRead: true,
  noCommandExecution: true,
};

export const pmSampleAcceptanceCriterion: PMAcceptanceCriterion = {
  criterionId: "criterion:pm-core-source-only",
  label: "PM Core remains source-only",
  safeSummary: "The PM Core closure preserves advisory source-only boundaries.",
  status: "satisfied",
  required: true,
  severity: "fail",
  phaseRef: "Phase 110I",
  taskIds: pmSampleTaskNodes.map((task) => task.taskId),
  evidenceRequirements: [pmSampleEvidenceRequirement],
  evidenceRefs: [pmSampleEvidenceRef],
  assumptions: [],
  exclusions: [],
  metadataOnly: true,
  noExecution: true,
  noTestExecution: true,
  noCiExecution: true,
};

export const pmSampleDefinitionOfDone: PMDefinitionOfDone = {
  dodId: "dod:pm-core-review:110I",
  schemaVersion: "1.0",
  title: "PM Core review DoD",
  safeSummary: "DoD metadata for source-only PM Core closure.",
  phaseRef: "Phase 110I",
  taskIds: pmSampleTaskNodes.map((task) => task.taskId),
  criteria: [pmSampleAcceptanceCriterion],
  evidenceRequirements: [pmSampleEvidenceRequirement],
  blockingSeverityThreshold: "fail",
  assumptions: [],
  exclusions: [],
  advisoryOnly: true,
  sourceOnly: true,
  noExecution: true,
  noTestExecution: true,
  noCiExecution: true,
  noCommandExecution: true,
  boundaries: pmFoundationBoundaries,
};

export const pmSampleDoDValidation: PMDoDValidationResult = {
  validationId: "dod_validation:pm-core:110I",
  schemaVersion: "1.0",
  valid: true,
  status: "pass",
  findings: [],
  warnings: [],
  errors: [],
  advisoryOnly: true,
  sourceOnly: true,
  boundaries: pmFoundationBoundaries,
};

export const pmSampleRisk: PMRiskEntry = {
  riskId: "risk:pm-core-boundary-drift",
  label: "Boundary drift",
  safeSummary: "PM Core closure must avoid live-adjacent behavior.",
  likelihood: "possible",
  impact: "medium",
  severity: "medium",
  status: "watching",
  riskSurfaces: ["runtime", "dashboard", "provider"],
  phaseRefs: ["Phase 110I"],
  taskIds: pmSampleTaskNodes.map((task) => task.taskId),
  milestoneIds: [pmSampleMilestone.milestoneId],
  dodRefs: [pmSampleDefinitionOfDone.dodId],
  evidenceRefs: [pmSampleEvidenceRef],
  assumptions: [],
  exclusions: [],
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
  noMitigationExecution: true,
  boundaries: pmFoundationBoundaries,
};

export const pmSampleBlocker: PMBlocker = {
  blockerId: "blocker:pm-core:none",
  label: "No PM Core blocker",
  safeSummary: "No active PM Core blocker is represented by this fixture.",
  status: "resolved_metadata_only",
  severity: "low",
  riskSurfaces: ["unknown"],
  blockedPhaseRefs: [],
  blockedTaskIds: [],
  blockedMilestoneIds: [],
  blockedDodRefs: [],
  evidenceRefs: [pmSampleEvidenceRef],
  assumptions: [],
  exclusions: [],
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
  noResolutionExecution: true,
  noActionProposalApprovalExecution: true,
  noJobsExecution: true,
  boundaries: pmFoundationBoundaries,
};

export const pmSampleApprovalPlan: PMApprovalPlan = {
  approvalPlanId: "approval_plan:pm-core-review",
  schemaVersion: "1.0",
  label: "PM Core review metadata approval",
  safeSummary: "Review metadata notes that Phase 110I remains human-reviewed.",
  phaseRef: "Phase 110I",
  riskLevel: "medium",
  requirements: [],
  assumptions: ["No approval record is created by this fixture."],
  exclusions: ["No approval bridge is called by this fixture."],
  metadataOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
  noApprovalCreation: true,
  noApprovalExecution: true,
  noActionDispatch: true,
  noProposalStoreWrites: true,
  noJobsExecution: true,
  noSelfApproval: true,
  boundaries: pmFoundationBoundaries,
};

export const pmSampleNextBestActionResult: PMNextBestActionResult = {
  validationId: "next_action:pm-core:110I",
  schemaVersion: "1.0",
  valid: true,
  status: "pass",
  recommendations: [
    {
      recommendationId: "recommendation:111B",
      actionId: "action:111B",
      category: "plan",
      priority: "medium",
      status: "pass",
      safeSummary: "Plan Phase 111B after PM Core review closes.",
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
  boundaries: pmFoundationBoundaries,
};

export const pmSamplePhaseStatusReportResult: PMStatusReportResult = buildPhaseStatusReport({
  reportId: "pm_report:pm-core-review:110I",
  phaseRef: "Phase 110I",
  projectState: pmSampleProjectState,
  currentMilestone: pmSampleMilestone,
  taskGraph: pmSampleTaskGraph,
  milestoneHealth: pmSampleMilestoneHealth,
  dodValidations: [pmSampleDoDValidation],
  risks: [pmSampleRisk],
  blockers: [pmSampleBlocker],
  approvalPlans: [pmSampleApprovalPlan],
  nextBestActionResult: pmSampleNextBestActionResult,
  evidenceRefs: [pmSampleEvidenceRef],
  assumptions: ["PM Core review report fixture is static metadata."],
  exclusions: ["PM Core review report fixture does not trigger any external surface."],
});

export const pmCoreReviewSampleFixtures = {
  evidenceRef: pmSampleEvidenceRef,
  projectState: pmSampleProjectState,
  projectSnapshot: pmSampleProjectSnapshot,
  taskGraph: pmSampleTaskGraph,
  milestone: pmSampleMilestone,
  milestoneHealth: pmSampleMilestoneHealth,
  definitionOfDone: pmSampleDefinitionOfDone,
  dodValidation: pmSampleDoDValidation,
  risk: pmSampleRisk,
  blocker: pmSampleBlocker,
  approvalPlan: pmSampleApprovalPlan,
  nextBestAction: pmSampleNextBestActionResult,
  phaseStatusReport: pmSamplePhaseStatusReportResult.report,
} as const;
