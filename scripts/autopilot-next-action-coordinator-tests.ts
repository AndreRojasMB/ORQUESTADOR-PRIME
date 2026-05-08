import { strict as assert } from "node:assert";
import {
  autopilotSourceOnlyBoundaries,
  coordinateNextAutopilotAction,
  summarizeAutopilotValidation,
  validateCodexReportAgainstHandoff,
  type AutopilotCoordinatorInput,
  type CodexReportContract,
} from "../src/autopilot/index.js";

const baseReport: CodexReportContract = {
  reportId: "report:26J-I",
  phase: "Phase 26J-I",
  filesInspected: ["src/autopilot/nextActionCoordinator.ts"],
  filesModified: ["src/autopilot/nextActionCoordinator.ts"],
  summary: "Source-only next-action coordinator metadata helpers were added.",
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
  nextRecommendedPhase: "Phase 26K-B",
  findings: [],
  finalStatus: "accepted",
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecutionFromReport: true,
  boundaries: autopilotSourceOnlyBoundaries,
};

function makeInput(
  overrides: Partial<AutopilotCoordinatorInput> = {},
): AutopilotCoordinatorInput {
  const report = overrides.report ?? baseReport;
  const validation =
    overrides.validation ??
    validateCodexReportAgainstHandoff({
      report,
      allowedFiles: ["src/autopilot/*"],
      forbiddenFiles: ["dashboard/*", "src/whatsapp/*", "package.json"],
      requiredCommands: ["tsc --noEmit"],
      commitRequired: true,
      pushRequired: true,
      riskLevel: "plan_only",
    });

  return {
    phase: "Phase 26J-I",
    phaseMode: "I",
    previousPhaseMode: "B",
    expectedNextPhase: "Phase 26K-B",
    report,
    validation,
    validationSummary: summarizeAutopilotValidation(validation),
    riskLevel: "plan_only",
    approvalStatus: "approved",
    commitStatus: "present",
    pushStatus: "pushed",
    ...overrides,
  };
}

function testCleanPlanningPhaseRecommendsImplementation(): void {
  const { commitHash: _commitHash, ...reportWithoutCommit } = baseReport;
  const report = {
    ...reportWithoutCommit,
    phase: "Phase 26J-B",
    filesModified: ["docs/autopilot-next-action-coordinator-plan.md"],
    pushStatus: "not_requested",
  } satisfies CodexReportContract;
  const validation = validateCodexReportAgainstHandoff({
    report,
    allowedFiles: ["docs/autopilot-next-action-*"],
    requiredCommands: ["tsc --noEmit"],
    commitRequired: false,
    pushRequired: false,
  });
  const result = coordinateNextAutopilotAction(
    makeInput({
      phase: "Phase 26J-B",
      phaseMode: "B",
      expectedNextPhase: "Phase 26J-I",
      matchingImplementationPhase: "Phase 26J-I",
      report,
      validation,
      validationSummary: summarizeAutopilotValidation(validation),
      commitStatus: "not_required",
      pushStatus: "not_requested",
    }),
  );

  assert.equal(result.nextAction, "continue_to_I_phase");
  assert.equal(result.alertLevel, "no_alert");
  assert.equal(result.handoffAllowed, true);
}

function testCleanImplementationPhaseRecommendsNextPlanning(): void {
  const result = coordinateNextAutopilotAction(makeInput());

  assert.equal(result.nextAction, "continue_to_next_B_phase");
  assert.equal(result.alertLevel, "no_alert");
  assert.equal(result.memoryWriteAllowed, false);
}

function testMissingCommitNeedsCloseout(): void {
  const { commitHash: _commitHash, ...reportWithoutCommit } = baseReport;
  const report: CodexReportContract = {
    ...reportWithoutCommit,
    pushStatus: "not_pushed",
  };
  const validation = validateCodexReportAgainstHandoff({
    report,
    allowedFiles: ["src/autopilot/*"],
    requiredCommands: ["tsc --noEmit"],
    commitRequired: false,
    pushRequired: false,
  });
  const result = coordinateNextAutopilotAction(
    makeInput({
      report,
      validation,
      validationSummary: summarizeAutopilotValidation(validation),
      commitStatus: "missing",
      pushStatus: "not_pushed",
    }),
  );

  assert.equal(result.nextAction, "closeout_required");
  assert.equal(result.alertLevel, "mild_alert");
}

function testUnstagedDirtyFilesProduceMildAlert(): void {
  const result = coordinateNextAutopilotAction(
    makeInput({
      dirtyFilesStatus: {
        knownPreExisting: ["dashboard/app/integrations/checks.ts"],
        currentDirty: ["dashboard/app/integrations/checks.ts"],
        staged: [],
        metadataOnly: true,
      },
    }),
  );

  assert.equal(result.alertLevel, "mild_alert");
  assert.equal(result.nextAction, "continue_to_next_B_phase");
}

function testForbiddenFileBlocks(): void {
  const report: CodexReportContract = {
    ...baseReport,
    filesModified: ["dashboard/app/integrations/checks.ts"],
  };
  const validation = validateCodexReportAgainstHandoff({
    report,
    allowedFiles: ["src/autopilot/*"],
    forbiddenFiles: ["dashboard/*"],
    requiredCommands: ["tsc --noEmit"],
    commitRequired: true,
    pushRequired: true,
  });
  const result = coordinateNextAutopilotAction(
    makeInput({
      report,
      validation,
      validationSummary: summarizeAutopilotValidation(validation),
    }),
  );

  assert.equal(result.nextAction, "blocked");
  assert.equal(result.alertLevel, "blocking_alert");
}

function testCriticalRiskFreezesScope(): void {
  const result = coordinateNextAutopilotAction(
    makeInput({
      riskLevel: "critical_plan_only",
    }),
  );

  assert.equal(result.nextAction, "freeze_scope");
  assert.equal(result.alertLevel, "blocking_alert");
}

function testHumanFacingSkeletonKeepsRequiredSections(): void {
  const result = coordinateNextAutopilotAction(makeInput());

  assert(result.humanFacingResponseSkeleton.skeleton.includes("1. Alerta"));
  assert(result.humanFacingResponseSkeleton.skeleton.includes("2. Siguiente fase"));
  assert(result.humanFacingResponseSkeleton.skeleton.includes("3. Modelo recomendado"));
  assert(result.humanFacingResponseSkeleton.skeleton.includes("4. Prompt listo para Codex"));
}

const tests = [
  testCleanPlanningPhaseRecommendsImplementation,
  testCleanImplementationPhaseRecommendsNextPlanning,
  testMissingCommitNeedsCloseout,
  testUnstagedDirtyFilesProduceMildAlert,
  testForbiddenFileBlocks,
  testCriticalRiskFreezesScope,
  testHumanFacingSkeletonKeepsRequiredSections,
];

for (const test of tests) {
  test();
}

console.log(`${tests.length}/${tests.length} autopilot next-action coordinator tests passed`);
