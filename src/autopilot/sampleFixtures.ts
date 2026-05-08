import { createCodexHandoffDraft } from "./codexHandoff.js";
import { prepareCodexHandoffPackage } from "./codexHandoffRunner.js";
import { createMemoryUpdateProposal } from "./memoryUpdateContract.js";
import { recommendNextAutopilotAction } from "./nextAutopilotAction.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
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
