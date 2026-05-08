import { createCodexHandoffDraft } from "./codexHandoff.js";
import { prepareCodexHandoffPackage } from "./codexHandoffRunner.js";
import { createMemoryUpdateProposalFromReport } from "./memoryProposalBuilder.js";
import { createMemoryUpdateProposal } from "./memoryUpdateContract.js";
import { coordinateNextAutopilotAction } from "./nextActionCoordinator.js";
import { recommendNextAutopilotAction } from "./nextAutopilotAction.js";
import type { CodexReportContract } from "./reportContract.js";
import { validateCodexReportAgainstHandoff } from "./reportValidator.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import { summarizeAutopilotValidation } from "./autopilotValidationSummary.js";
import type { AutopilotTaskMetadata } from "./types.js";

export const sampleAutopilotTask: AutopilotTaskMetadata = {
  taskId: "task:26G-I",
  objectiveId: "objective:autopilot-loop",
  phase: "Phase 26G-I",
  title: "Autopilot loop contracts implementation",
  mode: "I",
  state: "pending",
  riskLevel: "plan_only",
  loopStage: "task_creation",
  allowedFiles: ["src/autopilot/*", "docs/autopilot-*"],
  forbiddenFiles: ["src/whatsapp/*", "dashboard/*", "package.json"],
  entryCriteria: ["Phase 26G-B docs exist."],
  exitCriteria: ["Autopilot contracts typecheck."],
  verificationPlan: {
    commands: ["node node_modules/typescript/bin/tsc --noEmit"],
    typecheckRequired: true,
    pyCompileRequired: false,
    testsRequired: false,
    metadataOnly: true,
  },
  smokePlan: {
    checks: ["No runtime executor exists.", "No provider sends exist."],
    metadataOnly: true,
  },
  scopeCheck: {
    gitStatusCommand: "git status --short --branch",
    gitDiffCommand: "git diff --name-only",
    stagedFilesCommand: "git diff --cached --name-only",
    expectedChangedFiles: ["src/autopilot/*"],
    forbiddenChangedFiles: ["src/whatsapp/*", "dashboard/*", "package.json"],
    metadataOnly: true,
  },
  forbiddenGrep: {
    patterns: ["environment read", "network call", "command execution"],
    paths: ["src/autopilot"],
    allowedMatches: [],
    metadataOnly: true,
  },
  humanApprovalGate: {
    required: true,
    reason: "Implementation requires explicit phase approval.",
    approverRole: "human_operator",
    beforeStages: ["codex_handoff", "human_approval"],
    metadataOnly: true,
    noSelfApproval: true,
  },
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecution: true,
  boundaries: autopilotSourceOnlyBoundaries,
};

export const sampleCodexHandoffDraft = createCodexHandoffDraft({
  projectPath: "/home/varyan/projects/ORQUESTADOR-PRIME",
  branch: "dev",
  phase: "Phase 26G-I",
  mode: "I",
  previousPhaseContext: "Phase 26G-B created docs-only autopilot plans.",
  allowedFiles: ["src/autopilot/*"],
  forbiddenFiles: ["src/whatsapp/*", "dashboard/*", "package.json"],
  verificationCommands: ["node node_modules/typescript/bin/tsc --noEmit"],
  smokeChecks: ["Autopilot module is source-only."],
  scopeExpectedChangedFiles: ["src/autopilot/*"],
  scopeForbiddenChangedFiles: ["src/whatsapp/*", "dashboard/*", "package.json"],
  forbiddenGrepPatterns: ["environment read", "network call", "command execution"],
  forbiddenGrepPaths: ["src/autopilot"],
});

export const sampleMemoryUpdateProposal = createMemoryUpdateProposal({
  memoryProposalId: "memory:26G-I",
  proposedMemoryEntry: "Phase 26G-I added source-only autopilot loop contracts.",
  sourceReportRef: "report:26G-I",
  reason: "Remember completed source-only contract foundation.",
  risk: "report_only",
});

export const sampleNextAutopilotAction = recommendNextAutopilotAction({
  currentPhase: "Phase 26G-I",
  nextPhase: "Phase 26H-B",
  taskState: "approved",
  riskLevel: "plan_only",
  prerequisites: ["26G-I typecheck passes."],
});

export const sampleCodexHandoffPackage = prepareCodexHandoffPackage({
  task: {
    ...sampleAutopilotTask,
    state: "approved",
    phase: "Phase 26H-I",
    title: "Codex handoff runner MVP",
  },
  handoff: sampleCodexHandoffDraft,
  nextPhase: "Phase 26I-B",
});

export const sampleCodexReport: CodexReportContract = {
  reportId: "report:26I-I",
  phase: "Phase 26I-I",
  filesInspected: ["src/autopilot/*"],
  filesModified: ["src/autopilot/reportValidator.ts"],
  summary: "Phase 26I-I added source-only validation metadata helpers.",
  commandsExecuted: [
    {
      command: "node node_modules/typescript/bin/tsc --noEmit",
      result: "passed",
      safeSummary: "TypeScript check passed by caller-provided metadata.",
      metadataOnly: true,
      noExecutionFromContract: true,
    },
  ],
  tests: [],
  scopeCheck: "Scope metadata is clean.",
  forbiddenGrepResult: "clean",
  commitHash: "example-only",
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

export const sampleReportValidation = validateCodexReportAgainstHandoff({
  report: sampleCodexReport,
  allowedFiles: ["src/autopilot/*"],
  forbiddenFiles: ["src/whatsapp/*", "dashboard/*", "package.json"],
  requiredCommands: ["tsc --noEmit"],
  commitRequired: true,
  pushRequired: true,
  riskLevel: "plan_only",
});

export const sampleMemoryProposalFromReport =
  createMemoryUpdateProposalFromReport({
    report: sampleCodexReport,
    validation: sampleReportValidation,
    riskLevel: "report_only",
  });

export const sampleCoordinatorResult = coordinateNextAutopilotAction({
  phase: "Phase 26I-I",
  phaseMode: "I",
  previousPhaseMode: "B",
  expectedNextPhase: "Phase 26J-B",
  report: sampleCodexReport,
  validation: sampleReportValidation,
  validationSummary: summarizeAutopilotValidation(sampleReportValidation),
  memoryProposal: sampleMemoryProposalFromReport,
  riskLevel: "plan_only",
  approvalStatus: "approved",
  commitStatus: "present",
  pushStatus: "pushed",
  dirtyFilesStatus: {
    knownPreExisting: ["dashboard/app/integrations/checks.ts"],
    currentDirty: ["dashboard/app/integrations/checks.ts"],
    staged: [],
    metadataOnly: true,
  },
});
