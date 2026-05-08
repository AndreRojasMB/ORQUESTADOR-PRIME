import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type {
  AutopilotBoundarySet,
  AutopilotForbiddenGrepContract,
  AutopilotMode,
  AutopilotScopeCheckContract,
  AutopilotSmokePlan,
  AutopilotVerificationPlan,
} from "./types.js";

export interface CodexHandoffFinalReportFormat {
  requiredSections: string[];
  includeCommitHash: boolean;
  includePushStatus: boolean;
  includeAlertLevel: boolean;
  metadataOnly: true;
}

export interface CodexHandoffContract {
  handoffId: string;
  projectPath: string;
  branch: string;
  phase: string;
  mode: AutopilotMode;
  previousPhaseContext: string;
  allowedFiles: string[];
  forbiddenFiles: string[];
  verificationPlan: AutopilotVerificationPlan;
  smokePlan: AutopilotSmokePlan;
  scopeCheck: AutopilotScopeCheckContract;
  forbiddenGrep: AutopilotForbiddenGrepContract;
  finalReportFormat: CodexHandoffFinalReportFormat;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noCodexInvocation: true;
  noExecution: true;
  requiresHumanApprovalBeforeUse: true;
  boundaries: AutopilotBoundarySet;
}

export interface CodexHandoffDraftInput {
  handoffId?: string;
  projectPath: string;
  branch: string;
  phase: string;
  mode: AutopilotMode;
  previousPhaseContext: string;
  allowedFiles: string[];
  forbiddenFiles: string[];
  verificationCommands: string[];
  smokeChecks: string[];
  scopeExpectedChangedFiles: string[];
  scopeForbiddenChangedFiles: string[];
  forbiddenGrepPatterns: string[];
  forbiddenGrepPaths: string[];
  finalReportSections?: string[];
}

const defaultFinalReportSections = [
  "phase",
  "files inspected",
  "files modified",
  "implementation or plan summary",
  "commands executed",
  "tests",
  "scope check",
  "forbidden grep",
  "commit/push status",
  "next recommended phase",
];

export function createCodexHandoffDraft(
  input: CodexHandoffDraftInput,
): CodexHandoffContract {
  return {
    handoffId: input.handoffId ?? `${input.phase}:handoff`,
    projectPath: input.projectPath,
    branch: input.branch,
    phase: input.phase,
    mode: input.mode,
    previousPhaseContext: input.previousPhaseContext,
    allowedFiles: [...input.allowedFiles],
    forbiddenFiles: [...input.forbiddenFiles],
    verificationPlan: {
      commands: [...input.verificationCommands],
      typecheckRequired: input.verificationCommands.some((command) =>
        command.includes("tsc --noEmit"),
      ),
      pyCompileRequired: input.verificationCommands.some((command) =>
        command.includes("py_compile"),
      ),
      testsRequired: input.verificationCommands.some((command) =>
        command.includes("test"),
      ),
      metadataOnly: true,
    },
    smokePlan: {
      checks: [...input.smokeChecks],
      metadataOnly: true,
    },
    scopeCheck: {
      gitStatusCommand: "git status --short --branch",
      gitDiffCommand: "git diff --name-only",
      stagedFilesCommand: "git diff --cached --name-only",
      expectedChangedFiles: [...input.scopeExpectedChangedFiles],
      forbiddenChangedFiles: [...input.scopeForbiddenChangedFiles],
      metadataOnly: true,
    },
    forbiddenGrep: {
      patterns: [...input.forbiddenGrepPatterns],
      paths: [...input.forbiddenGrepPaths],
      allowedMatches: [],
      metadataOnly: true,
    },
    finalReportFormat: {
      requiredSections: input.finalReportSections
        ? [...input.finalReportSections]
        : [...defaultFinalReportSections],
      includeCommitHash: input.mode === "I",
      includePushStatus: input.mode === "I",
      includeAlertLevel: true,
      metadataOnly: true,
    },
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noCodexInvocation: true,
    noExecution: true,
    requiresHumanApprovalBeforeUse: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
