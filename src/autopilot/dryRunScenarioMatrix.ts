import {
  autopilotRealDryRunExpectedNextPhase,
  autopilotRealDryRunReport,
  type AutopilotRealDryRunCommitPushFixture,
  type AutopilotRealDryRunRiskApprovalFixture,
  type AutopilotRealDryRunWorkspaceFixture,
} from "./realDryRunFixtures.js";
import {
  buildAutopilotRealDryRunInput,
  type AutopilotRealDryRunInput,
} from "./realDryRunPilot.js";
import type { AutopilotMemoryProposalStatus } from "./memoryProposalBuilder.js";
import type { CodexReportContract, CodexPushStatus } from "./reportContract.js";
import type { AutopilotReportValidationStatus } from "./reportValidator.js";
import type { AutopilotCoordinatorAlertLevel, AutopilotCoordinatorNextAction } from "./nextActionDecisionModel.js";
import type {
  AutopilotCloseoutCheckResult,
  AutopilotCloseoutStatus,
} from "./phaseCloseoutDecisionModel.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type { AutopilotBoundarySet, AutopilotCommandResult } from "./types.js";

export type AutopilotDryRunScenarioId =
  | "happy_path_b_to_i"
  | "happy_path_i_to_next_b"
  | "implementation_missing_commit_push"
  | "dirty_files_outside_scope_unstaged"
  | "dirty_files_outside_scope_staged"
  | "forbidden_files_modified"
  | "failed_typecheck"
  | "failed_smoke_tests"
  | "forbidden_grep_failure"
  | "memory_proposal_requires_approval"
  | "closeout_blocked"
  | "prompt_draft_missing_required_sections";

export interface AutopilotDryRunScenario {
  scenarioId: AutopilotDryRunScenarioId;
  title: string;
  description: string;
  simulatedInput: AutopilotRealDryRunInput;
  expectedValidationStatus: AutopilotReportValidationStatus;
  expectedMemoryProposalStatus: AutopilotMemoryProposalStatus;
  expectedNextAction: AutopilotCoordinatorNextAction;
  expectedCloseoutStatus: AutopilotCloseoutStatus;
  expectedAlertLevel: AutopilotCoordinatorAlertLevel;
  expectedHumanReviewRequired: boolean;
  expectedHandoffAllowed: boolean;
  expectedNextPhase: string;
  expectedPromptSections: string[];
  simulatedHumanFacingResponseSkeleton?: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  boundaries: AutopilotBoundarySet;
}

export const autopilotDryRunRequiredPromptSections = [
  "1. Alerta",
  "2. Siguiente fase",
  "3. Modelo recomendado",
  "4. Prompt listo para Codex",
] as const;

const failedCheck = (
  name: string,
  safeSummary: string,
): AutopilotCloseoutCheckResult => ({
  name,
  status: "failed",
  safeSummary,
  metadataOnly: true,
});

const commandResult = (
  command: string,
  result: "passed" | "failed",
  safeSummary: string,
): AutopilotCommandResult => ({
  command,
  result,
  safeSummary,
  metadataOnly: true,
  noExecutionFromContract: true,
});

const reportWith = (
  overrides: Partial<CodexReportContract>,
): CodexReportContract => ({
  ...autopilotRealDryRunReport,
  ...overrides,
  filesInspected: overrides.filesInspected
    ? [...overrides.filesInspected]
    : [...autopilotRealDryRunReport.filesInspected],
  filesModified: overrides.filesModified
    ? [...overrides.filesModified]
    : [...autopilotRealDryRunReport.filesModified],
  commandsExecuted: overrides.commandsExecuted
    ? [...overrides.commandsExecuted]
    : [...autopilotRealDryRunReport.commandsExecuted],
  tests: overrides.tests
    ? [...overrides.tests]
    : [...autopilotRealDryRunReport.tests],
  findings: overrides.findings
    ? [...overrides.findings]
    : [...autopilotRealDryRunReport.findings],
});

const workspaceWith = (
  overrides: Partial<AutopilotRealDryRunWorkspaceFixture>,
): AutopilotRealDryRunWorkspaceFixture => ({
  knownPreExistingDirtyFiles: overrides.knownPreExistingDirtyFiles
    ? [...overrides.knownPreExistingDirtyFiles]
    : [],
  currentDirtyFiles: overrides.currentDirtyFiles
    ? [...overrides.currentDirtyFiles]
    : [],
  stagedFiles: overrides.stagedFiles ? [...overrides.stagedFiles] : [],
  metadataOnly: true,
});

const commitPushWith = (
  overrides: Partial<AutopilotRealDryRunCommitPushFixture>,
): AutopilotRealDryRunCommitPushFixture => ({
  commitRequired: overrides.commitRequired ?? false,
  pushRequired: overrides.pushRequired ?? false,
  commitStatus: overrides.commitStatus ?? "not_required",
  pushStatus: overrides.pushStatus ?? "not_requested",
  ...(overrides.commitHash ? { commitHash: overrides.commitHash } : {}),
  metadataOnly: true,
});

const riskApprovalWith = (
  overrides: Partial<AutopilotRealDryRunRiskApprovalFixture>,
): AutopilotRealDryRunRiskApprovalFixture => ({
  riskLevel: overrides.riskLevel ?? "report_only",
  approvalStatus: overrides.approvalStatus ?? "approved",
  metadataOnly: true,
});

const scenario = (
  input: Omit<
    AutopilotDryRunScenario,
    "advisoryOnly" | "sourceOnly" | "metadataOnly" | "noExecution" | "boundaries"
  >,
): AutopilotDryRunScenario => ({
  ...input,
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecution: true,
  boundaries: autopilotSourceOnlyBoundaries,
});

export function buildDefaultAutopilotDryRunScenarioMatrix(): AutopilotDryRunScenario[] {
  const nextI = autopilotRealDryRunExpectedNextPhase;
  const nextB = "Phase 121B - MOBILE APP FACTORY STRATEGY PLAN";
  const stagedOutOfScope = "docs/mobile-app-factory-strategy-plan.md";
  const forbiddenFile = "dashboard/app/integrations/checks.ts";

  return [
    scenario({
      scenarioId: "happy_path_b_to_i",
      title: "Happy path B to I",
      description: "Clean planning metadata recommends the matching implementation phase.",
      simulatedInput: buildAutopilotRealDryRunInput({
        dryRunId: "autopilot-dry-run:scenario:happy_path_b_to_i",
        workspace: workspaceWith({}),
      }),
      expectedValidationStatus: "passed",
      expectedMemoryProposalStatus: "proposed",
      expectedNextAction: "continue_to_I_phase",
      expectedCloseoutStatus: "completed_local_only",
      expectedAlertLevel: "mild_alert",
      expectedHumanReviewRequired: true,
      expectedHandoffAllowed: true,
      expectedNextPhase: nextI,
      expectedPromptSections: [...autopilotDryRunRequiredPromptSections],
    }),
    scenario({
      scenarioId: "happy_path_i_to_next_b",
      title: "Happy path I to next B",
      description: "Clean implementation metadata with supplied commit/push evidence recommends the next planning phase.",
      simulatedInput: buildAutopilotRealDryRunInput({
        dryRunId: "autopilot-dry-run:scenario:happy_path_i_to_next_b",
        phaseMode: "I",
        expectedNextPhase: nextB,
        matchingImplementationPhase: nextB,
        report: reportWith({
          commitHash: "simulated-commit",
          pushStatus: "pushed",
          nextRecommendedPhase: nextB,
        }),
        commitPush: commitPushWith({
          commitRequired: true,
          pushRequired: true,
          commitStatus: "present",
          pushStatus: "pushed",
          commitHash: "simulated-commit",
        }),
        workspace: workspaceWith({}),
      }),
      expectedValidationStatus: "passed",
      expectedMemoryProposalStatus: "proposed",
      expectedNextAction: "continue_to_next_B_phase",
      expectedCloseoutStatus: "closed_and_pushed",
      expectedAlertLevel: "mild_alert",
      expectedHumanReviewRequired: true,
      expectedHandoffAllowed: false,
      expectedNextPhase: nextB,
      expectedPromptSections: [...autopilotDryRunRequiredPromptSections],
    }),
    scenario({
      scenarioId: "implementation_missing_commit_push",
      title: "Implementation missing commit/push",
      description: "Implementation metadata lacks supplied closeout evidence and should not close.",
      simulatedInput: buildAutopilotRealDryRunInput({
        dryRunId: "autopilot-dry-run:scenario:implementation_missing_commit_push",
        phaseMode: "I",
        expectedNextPhase: nextB,
        matchingImplementationPhase: nextB,
        report: reportWith({
          pushStatus: "not_pushed" as CodexPushStatus,
          nextRecommendedPhase: nextB,
        }),
        commitPush: commitPushWith({
          commitStatus: "missing",
          pushStatus: "not_pushed",
        }),
        workspace: workspaceWith({}),
      }),
      expectedValidationStatus: "passed",
      expectedMemoryProposalStatus: "proposed",
      expectedNextAction: "closeout_required",
      expectedCloseoutStatus: "needs_commit",
      expectedAlertLevel: "mild_alert",
      expectedHumanReviewRequired: true,
      expectedHandoffAllowed: false,
      expectedNextPhase: nextB,
      expectedPromptSections: [...autopilotDryRunRequiredPromptSections],
    }),
    scenario({
      scenarioId: "dirty_files_outside_scope_unstaged",
      title: "Dirty files outside scope unstaged",
      description: "Known pre-existing dirty files remain unstaged and create a caution path.",
      simulatedInput: buildAutopilotRealDryRunInput({
        dryRunId: "autopilot-dry-run:scenario:dirty_files_outside_scope_unstaged",
      }),
      expectedValidationStatus: "passed",
      expectedMemoryProposalStatus: "proposed",
      expectedNextAction: "continue_to_I_phase",
      expectedCloseoutStatus: "completed_local_only",
      expectedAlertLevel: "mild_alert",
      expectedHumanReviewRequired: true,
      expectedHandoffAllowed: true,
      expectedNextPhase: nextI,
      expectedPromptSections: [...autopilotDryRunRequiredPromptSections],
    }),
    scenario({
      scenarioId: "dirty_files_outside_scope_staged",
      title: "Dirty files outside scope staged",
      description: "A staged out-of-scope file should block validation and handoff.",
      simulatedInput: buildAutopilotRealDryRunInput({
        dryRunId: "autopilot-dry-run:scenario:dirty_files_outside_scope_staged",
        workspace: workspaceWith({
          knownPreExistingDirtyFiles: [stagedOutOfScope],
          currentDirtyFiles: [stagedOutOfScope],
          stagedFiles: [stagedOutOfScope],
        }),
      }),
      expectedValidationStatus: "blocked",
      expectedMemoryProposalStatus: "proposed",
      expectedNextAction: "blocked",
      expectedCloseoutStatus: "unsafe_scope",
      expectedAlertLevel: "blocking_alert",
      expectedHumanReviewRequired: true,
      expectedHandoffAllowed: false,
      expectedNextPhase: "Phase PILOT-1B - AUTOPILOT REAL DRY-RUN PLAN",
      expectedPromptSections: [...autopilotDryRunRequiredPromptSections],
    }),
    scenario({
      scenarioId: "forbidden_files_modified",
      title: "Forbidden files modified",
      description: "A forbidden modified file should block and mark unsafe scope.",
      simulatedInput: buildAutopilotRealDryRunInput({
        dryRunId: "autopilot-dry-run:scenario:forbidden_files_modified",
        report: reportWith({
          filesModified: [
            ...autopilotRealDryRunReport.filesModified,
            forbiddenFile,
          ],
        }),
        workspace: workspaceWith({}),
      }),
      expectedValidationStatus: "blocked",
      expectedMemoryProposalStatus: "proposed",
      expectedNextAction: "blocked",
      expectedCloseoutStatus: "unsafe_scope",
      expectedAlertLevel: "blocking_alert",
      expectedHumanReviewRequired: true,
      expectedHandoffAllowed: false,
      expectedNextPhase: "Phase PILOT-1B - AUTOPILOT REAL DRY-RUN PLAN",
      expectedPromptSections: [...autopilotDryRunRequiredPromptSections],
    }),
    scenario({
      scenarioId: "failed_typecheck",
      title: "Failed typecheck metadata",
      description: "Failed typecheck metadata should recommend retry or review.",
      simulatedInput: buildAutopilotRealDryRunInput({
        dryRunId: "autopilot-dry-run:scenario:failed_typecheck",
        report: reportWith({
          commandsExecuted: [
            commandResult(
              "git status --short --branch",
              "passed",
              "Caller-supplied status metadata reports scope.",
            ),
            commandResult(
              "node node_modules/typescript/bin/tsc --noEmit",
              "failed",
              "Caller-supplied typecheck metadata reports failure.",
            ),
            commandResult(
              "git diff --check",
              "passed",
              "Caller-supplied whitespace metadata reports success.",
            ),
          ],
        }),
        workspace: workspaceWith({}),
        closeoutChecks: {
          typecheckResult: failedCheck(
            "tsc --noEmit",
            "Caller-supplied typecheck metadata reports failure.",
          ),
          metadataOnly: true,
        },
      }),
      expectedValidationStatus: "failed",
      expectedMemoryProposalStatus: "proposed",
      expectedNextAction: "retry_phase",
      expectedCloseoutStatus: "needs_human_review",
      expectedAlertLevel: "mild_alert",
      expectedHumanReviewRequired: true,
      expectedHandoffAllowed: false,
      expectedNextPhase: nextI,
      expectedPromptSections: [...autopilotDryRunRequiredPromptSections],
    }),
    scenario({
      scenarioId: "failed_smoke_tests",
      title: "Failed smoke tests metadata",
      description: "Failed smoke metadata should recommend retry or review.",
      simulatedInput: buildAutopilotRealDryRunInput({
        dryRunId: "autopilot-dry-run:scenario:failed_smoke_tests",
        report: reportWith({
          tests: [
            commandResult(
              "node scripts/autopilot-real-dry-run-tests.ts",
              "failed",
              "Caller-supplied smoke metadata reports failure.",
            ),
          ],
        }),
        workspace: workspaceWith({}),
        closeoutChecks: {
          testsResult: failedCheck(
            "autopilot real dry-run smoke",
            "Caller-supplied smoke metadata reports failure.",
          ),
          smokeResult: failedCheck(
            "source-only dry-run smoke",
            "Caller-supplied smoke metadata reports failure.",
          ),
          metadataOnly: true,
        },
      }),
      expectedValidationStatus: "failed",
      expectedMemoryProposalStatus: "proposed",
      expectedNextAction: "retry_phase",
      expectedCloseoutStatus: "needs_human_review",
      expectedAlertLevel: "mild_alert",
      expectedHumanReviewRequired: true,
      expectedHandoffAllowed: false,
      expectedNextPhase: nextI,
      expectedPromptSections: [...autopilotDryRunRequiredPromptSections],
    }),
    scenario({
      scenarioId: "forbidden_grep_failure",
      title: "Forbidden grep failure metadata",
      description: "Forbidden grep failure should block closeout.",
      simulatedInput: buildAutopilotRealDryRunInput({
        dryRunId: "autopilot-dry-run:scenario:forbidden_grep_failure",
        report: reportWith({
          forbiddenGrepResult: "violation",
        }),
        workspace: workspaceWith({}),
        closeoutChecks: {
          forbiddenGrepResult: failedCheck(
            "forbidden grep",
            "Caller-supplied forbidden grep metadata reports failure.",
          ),
          metadataOnly: true,
        },
      }),
      expectedValidationStatus: "failed",
      expectedMemoryProposalStatus: "proposed",
      expectedNextAction: "retry_phase",
      expectedCloseoutStatus: "blocked",
      expectedAlertLevel: "mild_alert",
      expectedHumanReviewRequired: true,
      expectedHandoffAllowed: false,
      expectedNextPhase: nextI,
      expectedPromptSections: [...autopilotDryRunRequiredPromptSections],
    }),
    scenario({
      scenarioId: "memory_proposal_requires_approval",
      title: "Memory proposal requires approval",
      description: "Memory output remains proposal-only and requires review.",
      simulatedInput: buildAutopilotRealDryRunInput({
        dryRunId: "autopilot-dry-run:scenario:memory_proposal_requires_approval",
        workspace: workspaceWith({}),
        riskApproval: riskApprovalWith({
          approvalStatus: "pending_review",
        }),
      }),
      expectedValidationStatus: "passed",
      expectedMemoryProposalStatus: "proposed",
      expectedNextAction: "continue_to_I_phase",
      expectedCloseoutStatus: "completed_local_only",
      expectedAlertLevel: "mild_alert",
      expectedHumanReviewRequired: true,
      expectedHandoffAllowed: true,
      expectedNextPhase: nextI,
      expectedPromptSections: [...autopilotDryRunRequiredPromptSections],
    }),
    scenario({
      scenarioId: "closeout_blocked",
      title: "Closeout blocked metadata",
      description: "Closeout blockers should prevent phase exit even when validation passes.",
      simulatedInput: buildAutopilotRealDryRunInput({
        dryRunId: "autopilot-dry-run:scenario:closeout_blocked",
        workspace: workspaceWith({}),
        closeoutChecks: {
          scopeCheckResult: failedCheck(
            "scope check",
            "Caller-supplied scope metadata reports closeout blocker.",
          ),
          unresolvedBlockers: ["Closeout scope check metadata failed."],
          metadataOnly: true,
        },
      }),
      expectedValidationStatus: "passed",
      expectedMemoryProposalStatus: "proposed",
      expectedNextAction: "continue_to_I_phase",
      expectedCloseoutStatus: "blocked",
      expectedAlertLevel: "mild_alert",
      expectedHumanReviewRequired: true,
      expectedHandoffAllowed: true,
      expectedNextPhase: nextI,
      expectedPromptSections: [...autopilotDryRunRequiredPromptSections],
    }),
    scenario({
      scenarioId: "prompt_draft_missing_required_sections",
      title: "Prompt draft missing required sections",
      description: "Prompt quality gate should detect missing human-facing sections.",
      simulatedInput: buildAutopilotRealDryRunInput({
        dryRunId: "autopilot-dry-run:scenario:prompt_draft_missing_required_sections",
        workspace: workspaceWith({}),
      }),
      expectedValidationStatus: "passed",
      expectedMemoryProposalStatus: "proposed",
      expectedNextAction: "continue_to_I_phase",
      expectedCloseoutStatus: "completed_local_only",
      expectedAlertLevel: "mild_alert",
      expectedHumanReviewRequired: true,
      expectedHandoffAllowed: true,
      expectedNextPhase: nextI,
      expectedPromptSections: [...autopilotDryRunRequiredPromptSections],
      simulatedHumanFacingResponseSkeleton:
        "1. Alerta\nAlerta leve\n\n2. Siguiente fase\nPrompt quality review required.",
    }),
  ];
}

export const autopilotDryRunScenarioMatrix =
  buildDefaultAutopilotDryRunScenarioMatrix();
