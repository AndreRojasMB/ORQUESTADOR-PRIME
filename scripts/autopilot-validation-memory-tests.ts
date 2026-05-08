import { strict as assert } from "node:assert";
import {
  autopilotSourceOnlyBoundaries,
  createMemoryUpdateProposalFromReport,
  deriveErrorLearningRules,
  summarizeAutopilotValidation,
  validateCodexReportAgainstHandoff,
  type CodexReportContract,
} from "../src/autopilot/index.js";

const baseReport: CodexReportContract = {
  reportId: "report:26I-I",
  phase: "Phase 26I-I",
  filesInspected: ["src/autopilot/reportValidator.ts"],
  filesModified: ["src/autopilot/reportValidator.ts"],
  summary: "Source-only validation metadata helpers were added.",
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
  nextRecommendedPhase: "Phase 26J-B",
  findings: [],
  finalStatus: "accepted",
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecutionFromReport: true,
  boundaries: autopilotSourceOnlyBoundaries,
};

function testValidReportPasses(): void {
  const result = validateCodexReportAgainstHandoff({
    report: baseReport,
    allowedFiles: ["src/autopilot/*"],
    forbiddenFiles: ["src/whatsapp/*", "dashboard/*", "package.json"],
    requiredCommands: ["tsc --noEmit"],
    commitRequired: true,
    pushRequired: true,
    riskLevel: "plan_only",
  });

  assert.equal(result.status, "passed");
  assert.equal(result.nextAction, "continue_next_phase");
  assert.equal(result.noMemoryPersistence, true);
}

function testForbiddenFileBlocks(): void {
  const result = validateCodexReportAgainstHandoff({
    report: {
      ...baseReport,
      filesModified: ["dashboard/app/integrations/checks.ts"],
    },
    allowedFiles: ["src/autopilot/*"],
    forbiddenFiles: ["dashboard/*"],
    requiredCommands: ["tsc --noEmit"],
    commitRequired: true,
    pushRequired: true,
  });

  assert.equal(result.status, "blocked");
  assert.equal(result.nextAction, "blocked");
}

function testMissingCommandNeedsReview(): void {
  const result = validateCodexReportAgainstHandoff({
    report: {
      ...baseReport,
      commandsExecuted: [],
    },
    allowedFiles: ["src/autopilot/*"],
    requiredCommands: ["tsc --noEmit"],
    commitRequired: true,
    pushRequired: true,
  });

  assert.equal(result.status, "needs_review");
  assert.equal(result.missingCommands.length, 1);
}

function testMemoryProposalIsProposalOnly(): void {
  const validation = validateCodexReportAgainstHandoff({
    report: baseReport,
    allowedFiles: ["src/autopilot/*"],
    requiredCommands: ["tsc --noEmit"],
    commitRequired: true,
    pushRequired: true,
  });
  const proposal = createMemoryUpdateProposalFromReport({
    report: baseReport,
    validation,
  });

  assert.equal(proposal.status, "proposed");
  assert.equal(proposal.requiresHumanApproval, true);
  assert.equal(proposal.noMemoryPersistence, true);
}

function testLearningRulesCaptureFallback(): void {
  const report: CodexReportContract = {
    ...baseReport,
    commandsExecuted: [
      {
        command: "node node_modules/typescript/bin/tsc --noEmit",
        result: "failed",
        safeSummary: "node: not found in WSL; Windows Node fallback passed.",
        metadataOnly: true,
        noExecutionFromContract: true,
      },
    ],
  };
  const validation = validateCodexReportAgainstHandoff({
    report,
    allowedFiles: ["src/autopilot/*"],
    requiredCommands: ["tsc --noEmit"],
    commitRequired: true,
    pushRequired: true,
  });
  const rules = deriveErrorLearningRules({ report, validation });

  assert(rules.rules.some((rule) => rule.category === "verification_fallback"));
}

function testValidationSummaryCountsFindings(): void {
  const validation = validateCodexReportAgainstHandoff({
    report: {
      ...baseReport,
      forbiddenGrepResult: "unapproved match found",
    },
    allowedFiles: ["src/autopilot/*"],
    requiredCommands: ["tsc --noEmit"],
    commitRequired: true,
    pushRequired: true,
  });
  const summary = summarizeAutopilotValidation(validation);

  assert.equal(summary.status, "failed");
  assert.equal(summary.forbiddenGrepViolationCount, 1);
}

const tests = [
  testValidReportPasses,
  testForbiddenFileBlocks,
  testMissingCommandNeedsReview,
  testMemoryProposalIsProposalOnly,
  testLearningRulesCaptureFallback,
  testValidationSummaryCountsFindings,
];

for (const test of tests) {
  test();
}

console.log(`${tests.length}/${tests.length} autopilot validation memory tests passed`);
