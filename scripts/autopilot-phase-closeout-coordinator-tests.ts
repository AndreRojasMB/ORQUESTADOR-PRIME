import { strict as assert } from "node:assert";
import {
  autopilotSourceOnlyBoundaries,
  coordinateNextAutopilotAction,
  coordinatePhaseCloseout,
  evaluateRoadmapReturnReadiness,
  summarizeAutopilotValidation,
  validateCodexReportAgainstHandoff,
  type AutopilotCloseoutInput,
  type CodexReportContract,
} from "../src/autopilot/index.js";

const baseReport: CodexReportContract = {
  reportId: "report:26K-I",
  phase: "Phase 26K-I",
  filesInspected: ["src/autopilot/phaseCloseoutCoordinator.ts"],
  filesModified: ["src/autopilot/phaseCloseoutCoordinator.ts"],
  summary: "Source-only phase closeout coordinator metadata helpers were added.",
  commandsExecuted: [
    {
      command: "node node_modules/typescript/bin/tsc --noEmit",
      result: "passed",
      safeSummary: "TypeScript check passed.",
      metadataOnly: true,
      noExecutionFromContract: true,
    },
  ],
  tests: [],
  scopeCheck: "clean",
  forbiddenGrepResult: "clean",
  commitHash: "abc1234",
  pushStatus: "pushed",
  nextRecommendedPhase: "Phase 109B - PM STATUS REPORTING PLAN",
  findings: [],
  finalStatus: "accepted",
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecutionFromReport: true,
  boundaries: autopilotSourceOnlyBoundaries,
};

const passedCheck = (name: string) => ({
  name,
  status: "passed" as const,
  safeSummary: `${name} metadata passed.`,
  metadataOnly: true as const,
});

const failedCheck = (name: string) => ({
  name,
  status: "failed" as const,
  safeSummary: `${name} metadata failed.`,
  metadataOnly: true as const,
});

function makeInput(
  overrides: Partial<AutopilotCloseoutInput> = {},
): AutopilotCloseoutInput {
  const finalReport = overrides.finalReport ?? baseReport;
  const validation =
    overrides.validation ??
    validateCodexReportAgainstHandoff({
      report: finalReport,
      allowedFiles: ["src/autopilot/*", "docs/autopilot-phase-closeout-*"],
      forbiddenFiles: ["dashboard/*", "src/whatsapp/*", "package.json"],
      requiredCommands: ["tsc --noEmit"],
      commitRequired: true,
      pushRequired: true,
      riskLevel: "plan_only",
    });
  const validationSummary = summarizeAutopilotValidation(validation);
  const nextActionRecommendation =
    overrides.nextActionRecommendation ??
    coordinateNextAutopilotAction({
      phase: finalReport.phase,
      phaseMode: "I",
      previousPhaseMode: "B",
      expectedNextPhase: finalReport.nextRecommendedPhase,
      report: finalReport,
      validation,
      validationSummary,
      riskLevel: "plan_only",
      approvalStatus: "approved",
      commitStatus: "present",
      pushStatus: "pushed",
    });

  return {
    phase: finalReport.phase,
    phaseMode: "I",
    branch: "dev",
    expectedNextPhase: finalReport.nextRecommendedPhase,
    roadmapTarget: "Phase 109B - PM STATUS REPORTING PLAN",
    finalReport,
    validation,
    nextActionRecommendation,
    memoryProposalStatus: "proposed",
    testsResult: passedCheck("tests"),
    smokeResult: passedCheck("smoke"),
    typecheckResult: passedCheck("typecheck"),
    forbiddenGrepResult: passedCheck("forbidden grep"),
    scopeCheckResult: passedCheck("scope check"),
    stagedFiles: [],
    dirtyFilesOutsideScope: [],
    commitHash: "abc1234",
    pushStatus: "pushed",
    riskLevel: "plan_only",
    sourceOnlyImplementation: true,
    ...overrides,
  };
}

function testRoadmapReturnReadyFor26KI(): void {
  const result = coordinatePhaseCloseout(makeInput());

  assert.equal(result.closeoutStatus, "ready_for_roadmap_return");
  assert.equal(result.roadmapReturnAllowed, true);
  assert.equal(result.nextPhase, "Phase 109B - PM STATUS REPORTING PLAN");
  assert.equal(result.requiredPromptType, "roadmap_return_prompt");
}

function testPlanningPhaseCanBeLocalOnly(): void {
  const { commitHash: _commitHash, ...reportWithoutCommit } = baseReport;
  const finalReport: CodexReportContract = {
    ...reportWithoutCommit,
    reportId: "report:26K-B",
    phase: "Phase 26K-B",
    filesModified: ["docs/autopilot-phase-closeout-coordinator-plan.md"],
    pushStatus: "not_requested",
    nextRecommendedPhase: "Phase 26K-I",
  };
  const validation = validateCodexReportAgainstHandoff({
    report: finalReport,
    allowedFiles: ["docs/autopilot-phase-closeout-*"],
    requiredCommands: ["tsc --noEmit"],
    commitRequired: false,
    pushRequired: false,
  });
  const result = coordinatePhaseCloseout(
    makeInput({
      phase: "Phase 26K-B",
      phaseMode: "B",
      finalReport,
      validation,
      expectedNextPhase: "Phase 26K-I",
      commitHash: "",
      pushStatus: "not_requested",
    }),
  );

  assert.equal(result.closeoutStatus, "completed_local_only");
  assert.equal(result.safeToContinue, true);
}

function testImplementationNeedsCommit(): void {
  const { commitHash: _commitHash, ...reportWithoutCommit } = baseReport;
  const finalReport: CodexReportContract = {
    ...reportWithoutCommit,
    pushStatus: "pushed",
  };
  const validation = validateCodexReportAgainstHandoff({
    report: finalReport,
    allowedFiles: ["src/autopilot/*"],
    requiredCommands: ["tsc --noEmit"],
    commitRequired: false,
    pushRequired: true,
  });
  const result = coordinatePhaseCloseout(
    makeInput({
      finalReport,
      validation,
      commitHash: "",
    }),
  );

  assert.equal(result.closeoutStatus, "needs_commit");
  assert.equal(result.commitRequired, true);
}

function testImplementationNeedsPush(): void {
  const finalReport: CodexReportContract = {
    ...baseReport,
    pushStatus: "not_pushed",
  };
  const validation = validateCodexReportAgainstHandoff({
    report: finalReport,
    allowedFiles: ["src/autopilot/*"],
    requiredCommands: ["tsc --noEmit"],
    commitRequired: true,
    pushRequired: false,
  });
  const result = coordinatePhaseCloseout(
    makeInput({
      finalReport,
      validation,
      pushStatus: "not_pushed",
    }),
  );

  assert.equal(result.closeoutStatus, "needs_push");
  assert.equal(result.pushRequired, true);
}

function testUnstagedDirtyFilesAreMildAlert(): void {
  const result = coordinatePhaseCloseout(
    makeInput({
      dirtyFilesOutsideScope: ["dashboard/app/integrations/checks.ts"],
      stagedFiles: [],
    }),
  );

  assert.equal(result.alertLevel, "mild_alert");
  assert.equal(result.roadmapReturnAllowed, true);
}

function testStagedDirtyFilesBlock(): void {
  const result = coordinatePhaseCloseout(
    makeInput({
      stagedFiles: ["dashboard/app/integrations/checks.ts"],
    }),
  );

  assert.equal(result.closeoutStatus, "blocked");
  assert.equal(result.alertLevel, "blocking_alert");
}

function testForbiddenFileIsUnsafeScope(): void {
  const finalReport: CodexReportContract = {
    ...baseReport,
    filesModified: ["dashboard/app/integrations/checks.ts"],
  };
  const validation = validateCodexReportAgainstHandoff({
    report: finalReport,
    allowedFiles: ["src/autopilot/*"],
    forbiddenFiles: ["dashboard/*"],
    requiredCommands: ["tsc --noEmit"],
    commitRequired: true,
    pushRequired: true,
  });
  const result = coordinatePhaseCloseout(
    makeInput({
      finalReport,
      validation,
    }),
  );

  assert.equal(result.closeoutStatus, "unsafe_scope");
  assert.equal(result.alertLevel, "blocking_alert");
}

function testFailedTypecheckNeedsReview(): void {
  const result = coordinatePhaseCloseout(
    makeInput({
      typecheckResult: failedCheck("typecheck"),
    }),
  );

  assert.equal(result.closeoutStatus, "needs_human_review");
  assert.equal(result.humanReviewRequired, true);
}

function testRoadmapReturnPolicyRejectsWrongTarget(): void {
  const input = makeInput({
    roadmapTarget: "Phase 110B",
  });
  const readiness = evaluateRoadmapReturnReadiness(input, "no_alert");

  assert.equal(readiness.roadmapReturnAllowed, false);
}

const tests = [
  testRoadmapReturnReadyFor26KI,
  testPlanningPhaseCanBeLocalOnly,
  testImplementationNeedsCommit,
  testImplementationNeedsPush,
  testUnstagedDirtyFilesAreMildAlert,
  testStagedDirtyFilesBlock,
  testForbiddenFileIsUnsafeScope,
  testFailedTypecheckNeedsReview,
  testRoadmapReturnPolicyRejectsWrongTarget,
];

for (const test of tests) {
  test();
}

console.log(`${tests.length}/${tests.length} autopilot phase closeout coordinator tests passed`);
