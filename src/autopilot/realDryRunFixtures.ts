import { createCodexHandoffDraft } from "./codexHandoff.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type { CodexReportContract, CodexPushStatus } from "./reportContract.js";
import type {
  AutopilotCommandResult,
  AutopilotRiskLevel,
  AutopilotTaskMetadata,
} from "./types.js";
import type { AutopilotApprovalStatus } from "./nextActionDecisionModel.js";

export interface AutopilotRealDryRunWorkspaceFixture {
  knownPreExistingDirtyFiles: string[];
  currentDirtyFiles: string[];
  stagedFiles: string[];
  metadataOnly: true;
}

export interface AutopilotRealDryRunCommitPushFixture {
  commitRequired: boolean;
  pushRequired: boolean;
  commitStatus: "not_required" | "present" | "missing" | "unexpected";
  pushStatus: CodexPushStatus;
  commitHash?: string;
  metadataOnly: true;
}

export interface AutopilotRealDryRunRiskApprovalFixture {
  riskLevel: AutopilotRiskLevel;
  approvalStatus: AutopilotApprovalStatus;
  metadataOnly: true;
}

const commandResult = (
  command: string,
  safeSummary: string,
): AutopilotCommandResult => ({
  command,
  result: "passed",
  safeSummary,
  metadataOnly: true,
  noExecutionFromContract: true,
});

export const autopilotRealDryRunExpectedNextPhase =
  "Phase PILOT-1I - AUTOPILOT REAL DRY-RUN IMPLEMENTATION";

export const autopilotRealDryRunRoadmapReturnTarget =
  "Phase 121I - MOBILE APP FACTORY STRATEGY IMPLEMENTATION";

export const autopilotRealDryRunTask: AutopilotTaskMetadata = {
  taskId: "task:pilot-1b:real-dry-run",
  objectiveId: "objective:autopilot-real-dry-run",
  phase: "Phase PILOT-1B - AUTOPILOT REAL DRY-RUN PLAN",
  title: "Autopilot controlled dry-run planning sample",
  mode: "B",
  state: "approved",
  riskLevel: "report_only",
  loopStage: "codex_handoff",
  allowedFiles: ["docs/autopilot-real-dry-run*"],
  forbiddenFiles: [
    "docs/mobile-app-factory-*",
    "dashboard/*",
    "package.json",
    "src/whatsapp/*",
    "src/viernesBridge/*",
    "src/integrations/*",
  ],
  entryCriteria: ["PILOT-1B planning docs are present as metadata."],
  exitCriteria: ["PILOT-1I dry-run metadata can be proposed safely."],
  verificationPlan: {
    commands: [
      "git status --short --branch",
      "node node_modules/typescript/bin/tsc --noEmit",
      "node scripts/autopilot-real-dry-run-tests.ts",
      "git diff --check",
    ],
    typecheckRequired: true,
    pyCompileRequired: false,
    testsRequired: true,
    metadataOnly: true,
  },
  smokePlan: {
    checks: [
      "Dry-run output remains metadata-only.",
      "Memory proposal remains proposal-only.",
      "Prompt draft remains string-only metadata.",
    ],
    metadataOnly: true,
  },
  scopeCheck: {
    gitStatusCommand: "git status --short --branch",
    gitDiffCommand: "git diff --name-only",
    stagedFilesCommand: "git diff --cached --name-only",
    expectedChangedFiles: ["docs/autopilot-real-dry-run*"],
    forbiddenChangedFiles: [
      "docs/mobile-app-factory-*",
      "dashboard/*",
      "package.json",
      "src/whatsapp/*",
      "src/viernesBridge/*",
      "src/integrations/*",
    ],
    metadataOnly: true,
  },
  forbiddenGrep: {
    patterns: [
      "process launch marker",
      "provider send marker",
      "memory persistence marker",
    ],
    paths: ["docs/autopilot-real-dry-run*"],
    allowedMatches: ["safety boundary wording"],
    metadataOnly: true,
  },
  humanApprovalGate: {
    required: true,
    reason: "Dry-run prompt drafts require human review before use.",
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

export const autopilotRealDryRunHandoff = createCodexHandoffDraft({
  handoffId: "handoff:pilot-1b:real-dry-run",
  projectPath: "/home/varyan/projects/ORQUESTADOR-PRIME",
  branch: "dev",
  phase: "Phase PILOT-1B - AUTOPILOT REAL DRY-RUN PLAN",
  mode: "B",
  previousPhaseContext:
    "Phase 120I closed PM and SOLID integration; Phase 121B mobile docs remain local and outside pilot scope.",
  allowedFiles: ["docs/autopilot-real-dry-run*"],
  forbiddenFiles: [
    "docs/mobile-app-factory-*",
    "dashboard/*",
    "package.json",
    "src/whatsapp/*",
    "src/viernesBridge/*",
    "src/integrations/*",
  ],
  verificationCommands: [
    "git status --short --branch",
    "node node_modules/typescript/bin/tsc --noEmit",
    "git diff --check",
  ],
  smokeChecks: [
    "Dry-run is source-only.",
    "No external action is represented as completed.",
  ],
  scopeExpectedChangedFiles: ["docs/autopilot-real-dry-run*"],
  scopeForbiddenChangedFiles: [
    "docs/mobile-app-factory-*",
    "dashboard/*",
    "package.json",
    "src/whatsapp/*",
    "src/viernesBridge/*",
    "src/integrations/*",
  ],
  forbiddenGrepPatterns: [
    "process launch marker",
    "provider send marker",
    "memory persistence marker",
  ],
  forbiddenGrepPaths: ["docs/autopilot-real-dry-run*"],
});

export const autopilotRealDryRunReport: CodexReportContract = {
  reportId: "report:pilot-1b:real-dry-run",
  phase: "Phase PILOT-1B - AUTOPILOT REAL DRY-RUN PLAN",
  filesInspected: [
    "src/autopilot/*",
    "docs/autopilot-real-dry-run-plan.md",
    "docs/autopilot-real-dry-run-boundaries.md",
    "docs/autopilot-real-dry-run-scenario.md",
    "docs/autopilot-real-dry-run-success-criteria.md",
  ],
  filesModified: [
    "docs/autopilot-real-dry-run-plan.md",
    "docs/autopilot-real-dry-run-boundaries.md",
    "docs/autopilot-real-dry-run-scenario.md",
    "docs/autopilot-real-dry-run-success-criteria.md",
  ],
  summary:
    "PILOT-1B produced a controlled dry-run plan and kept all outputs as advisory metadata.",
  commandsExecuted: [
    commandResult(
      "git status --short --branch",
      "Caller-supplied status metadata reports pilot docs local and unstaged.",
    ),
    commandResult(
      "node node_modules/typescript/bin/tsc --noEmit",
      "Caller-supplied typecheck metadata reports success.",
    ),
    commandResult(
      "git diff --check",
      "Caller-supplied whitespace metadata reports success.",
    ),
  ],
  tests: [
    commandResult(
      "node scripts/autopilot-real-dry-run-tests.ts",
      "Caller-supplied smoke metadata reports success.",
    ),
  ],
  scopeCheck: "Scope metadata reports pilot docs only.",
  forbiddenGrepResult: "clean",
  pushStatus: "not_requested",
  nextRecommendedPhase: autopilotRealDryRunExpectedNextPhase,
  findings: [],
  finalStatus: "accepted",
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecutionFromReport: true,
  boundaries: autopilotSourceOnlyBoundaries,
};

export const autopilotRealDryRunWorkspaceFixture: AutopilotRealDryRunWorkspaceFixture =
  {
    knownPreExistingDirtyFiles: [
      "docs/mobile-app-factory-strategy-plan.md",
      "docs/mobile-app-factory-boundaries.md",
      "docs/mobile-app-factory-intake-model.md",
      "docs/mobile-app-factory-quality-model.md",
    ],
    currentDirtyFiles: [
      "docs/mobile-app-factory-strategy-plan.md",
      "docs/mobile-app-factory-boundaries.md",
      "docs/mobile-app-factory-intake-model.md",
      "docs/mobile-app-factory-quality-model.md",
    ],
    stagedFiles: [],
    metadataOnly: true,
  };

export const autopilotRealDryRunCommitPushFixture: AutopilotRealDryRunCommitPushFixture =
  {
    commitRequired: false,
    pushRequired: false,
    commitStatus: "not_required",
    pushStatus: "not_requested",
    metadataOnly: true,
  };

export const autopilotRealDryRunRiskApprovalFixture: AutopilotRealDryRunRiskApprovalFixture =
  {
    riskLevel: "report_only",
    approvalStatus: "approved",
    metadataOnly: true,
  };

export const autopilotRealDryRunLimitations = [
  "The pilot uses static fixtures and caller-supplied metadata only.",
  "The pilot does not inspect the live workspace.",
  "The pilot does not persist memory.",
  "The pilot does not apply the prompt draft.",
];
