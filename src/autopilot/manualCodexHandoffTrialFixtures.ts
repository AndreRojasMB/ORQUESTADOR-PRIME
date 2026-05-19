import type { CodexReportContract } from "./reportContract.js";
import type {
  ManualCodexCopyStep,
  ManualCodexExpectedReport,
  ManualCodexTrialValidation,
} from "./manualCodexHandoffTrial.js";
import type { ManualCodexHandoffTrialInput } from "./manualCodexHandoffTrial.js";
import type { HumanApprovedCodexHandoffPackage } from "./humanApprovedCodexHandoff.js";

export const manualCodexApprovedHandoffRefFixture =
  "human_approved_codex_handoff:habit_world_v1";

export const manualCodexTrialInputFixture: ManualCodexHandoffTrialInput = {
  trialId: "manual_codex_handoff_trial:sample_mobile_idea_blueprint",
  sourceDryRunRef: "conversational_build_loop:habit_world_v1",
  handoffRef: manualCodexApprovedHandoffRefFixture,
  targetPhase: "TRIAL-1B - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN PLAN",
  targetMode: "B",
  manualCopyRequired: true,
  codexExecutionManual: true,
  expectedCodexReportShape: [
    "phase",
    "files inspected",
    "files modified",
    "implementation or plan summary",
    "safety guarantees",
    "tests/scripts",
    "commands executed",
    "scope check",
    "forbidden grep",
    "commit/push",
    "next recommended phase",
  ],
  expectedValidationStatus: "passed",
  expectedNextAction: "continue_to_I_phase",
  riskLevel: "plan_only",
  requiredApprovals: [
    "human_operator_manual_copy_approval",
    "pm_scope_approval",
    "safety_review",
    "closeout_review",
  ],
  limitations: [
    "manual_copy_only",
    "metadata_validation_only",
    "no_live_session_monitoring",
    "no_source_driven_external_action",
  ],
};

export const manualCodexApprovedHandoffPackageFixture: Pick<
  HumanApprovedCodexHandoffPackage,
  "safeToCopy" | "safeToExecute" | "requiresHumanApproval" | "allowedFiles" | "forbiddenFiles"
> = {
  safeToCopy: true,
  safeToExecute: false,
  requiresHumanApproval: true,
  allowedFiles: [
    "docs/sample-mobile-idea-blueprint-dry-run-plan.md",
    "docs/sample-mobile-idea-blueprint-boundaries.md",
  ],
  forbiddenFiles: [
    "package.json",
    ".github/*",
    "src/whatsapp/*",
    "src/viernesBridge/*",
    "src/integrations/*",
    "dashboard/*",
    "providers/*",
    "DB/SQL files",
    "runtime execution files",
  ],
};

export const manualCodexCopyStepFixture: ManualCodexCopyStep = {
  copyStepId: "manual_copy:trial_1b",
  promptRef: `${manualCodexApprovedHandoffRefFixture}:prompt`,
  approvedForCopy: true,
  copiedByHuman: true,
  copiedAtLabel: "human_supplied_label",
  destination: "separate_codex_session",
  executionNotAutomated: true,
  riskLevel: "plan_only",
  limitations: ["manual_copy_evidence_only", "no_source_driven_external_action"],
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noCodexInvocation: true,
  noSystemCopyAutomation: true,
  noProviderCalls: true,
  noFilesystemWrites: true,
};

export const manualCodexExpectedReportFixture: ManualCodexExpectedReport =
  {
    phase: manualCodexTrialInputFixture.targetPhase,
    filesInspected: [
      "docs/human-approved-codex-prompt-handoff.md",
      "docs/conversational-build-loop-dry-run.md",
      "package.json",
      "tsconfig.json",
    ],
    filesModified: [
      "docs/sample-mobile-idea-blueprint-dry-run-plan.md",
      "docs/sample-mobile-idea-blueprint-boundaries.md",
    ],
    summary: "Sample mobile idea blueprint dry-run plan completed as metadata.",
    safetyGuarantees: [
      "source-only",
      "advisory-only",
      "metadata-only",
      "manual copy only",
      "no provider calls",
      "no source-stage file writes",
    ],
    testsScripts: ["typecheck", "docs smoke"],
    commandsExecuted: [
      "git status --short --branch",
      "node node_modules/typescript/bin/tsc --noEmit",
      "git diff --check",
    ],
    scopeCheck: "Allowed docs-only files modified; no staged external files.",
    forbiddenGrep: "clean",
    commitPush: "No commit. No push.",
    nextRecommendedPhase: "TRIAL-1I - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN IMPLEMENTATION",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  };

export const manualCodexSuccessfulReportFixture: CodexReportContract = {
  reportId: `${manualCodexTrialInputFixture.targetPhase}:report`,
  phase: manualCodexTrialInputFixture.targetPhase,
  filesInspected: [...manualCodexExpectedReportFixture.filesInspected],
  filesModified: [...manualCodexExpectedReportFixture.filesModified],
  summary:
    "Sample mobile idea blueprint dry-run plan completed with source-only advisory metadata.",
  commandsExecuted: [
    {
      command: "git status --short --branch",
      result: "passed",
      safeSummary: "Status reported with external dirty files left unstaged.",
      metadataOnly: true,
      noExecutionFromContract: true,
    },
    {
      command: "node node_modules/typescript/bin/tsc --noEmit",
      result: "passed",
      safeSummary: "Typecheck passed through available Node runtime.",
      metadataOnly: true,
      noExecutionFromContract: true,
    },
    {
      command: "git diff --check",
      result: "passed",
      safeSummary: "Diff whitespace check passed.",
      metadataOnly: true,
      noExecutionFromContract: true,
    },
  ],
  tests: [
    {
      command: "docs smoke",
      result: "passed",
      safeSummary: "Docs-only trial smoke passed.",
      metadataOnly: true,
      noExecutionFromContract: true,
    },
  ],
  scopeCheck: "Allowed docs-only files modified; no staged external files.",
  forbiddenGrepResult: "clean",
  pushStatus: "not_requested",
  nextRecommendedPhase: "TRIAL-1I - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN IMPLEMENTATION",
  findings: [],
  finalStatus: "accepted",
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecutionFromReport: true,
  boundaries: {
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noRuntimeExecutor: true,
    noCodexInvocation: true,
    noOpenClawExecution: true,
    noWhatsAppOutbound: true,
    noN8nExecution: true,
    noProviderCalls: true,
    noNetwork: true,
    noFilesystemReads: true,
    noFilesystemWrites: true,
    noEnvReads: true,
    noDashboardMutation: true,
    noMemoryMutation: true,
    noDbSqlMutation: true,
    noDeploy: true,
    noPackageWorkflowChanges: true,
    noGitMutationFromSource: true,
    requiresHumanApprovalForExecution: true,
  },
};

export const manualCodexBlockedReportFixture: CodexReportContract = {
  ...manualCodexSuccessfulReportFixture,
  reportId: `${manualCodexTrialInputFixture.targetPhase}:blocked_report`,
  filesModified: ["package.json"],
  summary:
    "Blocked sample report claims package workflow changed and must be rejected.",
  forbiddenGrepResult: "violation: forbidden file touched",
  finalStatus: "blocked",
};

export const manualCodexExpectedValidationFixture: Pick<
  ManualCodexTrialValidation,
  "validationStatus" | "alertLevel" | "recommendedAction"
> = {
  validationStatus: "passed",
  alertLevel: "no_alert",
  recommendedAction: "continue_to_I_phase",
};
