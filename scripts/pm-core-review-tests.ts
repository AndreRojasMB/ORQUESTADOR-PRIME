import assert from "node:assert/strict";
import {
  buildPhaseStatusReport,
  buildTaskGraph,
  pmCoreReviewSampleFixtures,
  pmFoundationBoundaries,
  pmSampleDefinitionOfDone,
  pmSampleProjectSnapshot,
  pmSampleProjectState,
  pmSampleTaskGraph,
  validateDefinitionOfDone,
  validateProjectSnapshot,
  validateProjectState,
} from "../src/pm/index.js";

assert.equal(pmFoundationBoundaries.advisoryOnly, true);
assert.equal(pmFoundationBoundaries.sourceOnly, true);
assert.equal(pmFoundationBoundaries.noRuntimeExecution, true);
assert.equal(pmFoundationBoundaries.noProviderCalls, true);
assert.equal(pmFoundationBoundaries.noDashboardImplementation, true);

const projectStateValidation = validateProjectState(pmSampleProjectState);
assert.equal(projectStateValidation.valid, true);
assert.equal(projectStateValidation.status, "pass");

const projectSnapshotValidation = validateProjectSnapshot(pmSampleProjectSnapshot);
assert.equal(projectSnapshotValidation.valid, true);
assert.equal(projectSnapshotValidation.status, "pass");

const taskGraphResult = buildTaskGraph({
  graphId: pmSampleTaskGraph.graphId,
  name: pmSampleTaskGraph.name,
  safeSummary: pmSampleTaskGraph.safeSummary,
  tasks: pmSampleTaskGraph.tasks,
  dependencies: pmSampleTaskGraph.dependencies,
  assumptions: pmSampleTaskGraph.assumptions,
  exclusions: pmSampleTaskGraph.exclusions,
});
assert.equal(taskGraphResult.ok, true);
assert.deepEqual(taskGraphResult.orderedTaskIds, pmSampleTaskGraph.orderedTaskIds);

const dodValidation = validateDefinitionOfDone(pmSampleDefinitionOfDone);
assert.equal(dodValidation.valid, true);
assert.equal(dodValidation.status, "pass");

assert.equal(pmCoreReviewSampleFixtures.projectState.advisoryOnly, true);
assert.equal(pmCoreReviewSampleFixtures.projectState.sourceOnly, true);
assert.equal(pmCoreReviewSampleFixtures.taskGraph.advisoryOnly, true);
assert.equal(pmCoreReviewSampleFixtures.definitionOfDone.noExecution, true);
assert.equal(pmCoreReviewSampleFixtures.risk.noMitigationExecution, true);
assert.equal(pmCoreReviewSampleFixtures.blocker.noResolutionExecution, true);
assert.equal(pmCoreReviewSampleFixtures.approvalPlan.noApprovalExecution, true);
assert.equal(pmCoreReviewSampleFixtures.nextBestAction.noExecution, true);
assert.equal(pmCoreReviewSampleFixtures.phaseStatusReport.reportOnly, true);
assert.equal(pmCoreReviewSampleFixtures.phaseStatusReport.noExecution, true);

const reportResult = buildPhaseStatusReport({
  reportId: "pm_report:core_review:smoke",
  phaseRef: "Phase 110I",
  projectState: pmCoreReviewSampleFixtures.projectState,
  currentMilestone: pmCoreReviewSampleFixtures.milestone,
  taskGraph: pmCoreReviewSampleFixtures.taskGraph,
  milestoneHealth: pmCoreReviewSampleFixtures.milestoneHealth,
  dodValidations: [pmCoreReviewSampleFixtures.dodValidation],
  risks: [pmCoreReviewSampleFixtures.risk],
  blockers: [pmCoreReviewSampleFixtures.blocker],
  approvalPlans: [pmCoreReviewSampleFixtures.approvalPlan],
  nextBestActionResult: pmCoreReviewSampleFixtures.nextBestAction,
  evidenceRefs: [pmCoreReviewSampleFixtures.evidenceRef],
});
assert.equal(reportResult.ok, true);
assert.equal(reportResult.report.reportOnly, true);
assert.equal(reportResult.report.noProviderCalls, true);
assert.equal(reportResult.report.noDashboardMutation, true);
assert.equal(reportResult.report.noMemoryPersistence, true);

console.log("7/7 PM Core review smoke tests passed");
