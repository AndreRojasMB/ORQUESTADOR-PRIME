import type {
  HumanApprovedCodexCompletenessChecklistItem,
  HumanApprovedCodexHandoffInput,
  HumanApprovedCodexHandoffPackage,
  HumanApprovedCodexSafetyChecklistItem,
} from "./humanApprovedCodexHandoff.js";
import type { ConversationalBuildLoopPromptDraft } from "./conversationalBuildLoopDryRun.js";

export const humanApprovedCodexSamplePromptDraftFixture: ConversationalBuildLoopPromptDraft = {
  promptDraftId: "conversational_build_loop_prompt:habit_world_v1",
  targetPhase: "PILOT-4I - Human-Approved Codex Prompt Handoff Implementation",
  targetMode: "I",
  projectPath: "/home/varyan/projects/ORQUESTADOR-PRIME",
  branch: "dev",
  contextSummary:
    "Conversational Build Loop dry-run produced a passive prompt draft from the habit-world mobile idea.",
  allowedFiles: [
    "src/autopilot/humanApprovedCodexHandoff.ts",
    "src/autopilot/humanApprovedCodexHandoffFixtures.ts",
    "src/autopilot/index.ts",
    "docs/human-approved-codex-prompt-handoff.md",
    "scripts/human-approved-codex-handoff-tests.ts",
  ],
  forbiddenFiles: [
    "package.json",
    ".github/*",
    "app folders",
    "mobile app output folders",
    "Expo/EAS/native config files",
    "secret material and vault files",
    "src/whatsapp/*",
    "src/viernesBridge/*",
    "src/integrations/*",
    "dashboard/*",
    "providers/*",
    "DB/SQL files",
    "runtime execution files",
  ],
  task: "Implement source-only human-approved Codex handoff metadata.",
  boundaries: [
    "source-only",
    "advisory-only",
    "metadata-only",
    "no Codex invocation",
    "no prompt insertion automation",
    "no system copy buffer automation",
    "no OpenClaw operation",
    "no WhatsApp outbound",
    "no providers",
    "no network/API calls",
    "no source-stage file writes",
    "no package or workflow changes",
    "no DB/SQL",
    "no dashboard mutation",
    "no memory persistence",
  ],
  verificationPlan: [
    "git status --short --branch",
    "node node_modules/typescript/bin/tsc --noEmit",
    "node --experimental-strip-types scripts/human-approved-codex-handoff-tests.ts",
    "git diff --check",
  ],
  smokePlan: [
    "handoff package creation",
    "completeness checklist blocks missing sections",
    "safety checklist blocks unsafe wording",
    "manual-copy approval remains review gated",
  ],
  finalReportFormat: [
    "phase",
    "files inspected",
    "files modified",
    "implementation summary",
    "integration",
    "safety guarantees",
    "tests",
    "commands",
    "scope check",
    "forbidden grep",
    "commit/push",
    "next recommended phase",
  ],
  safeToUseForExecution: false,
  requiresHumanApproval: true,
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noCodexInvocation: true,
};

export const humanApprovedCodexHandoffInputFixture: HumanApprovedCodexHandoffInput = {
  handoffId: "human_approved_codex_handoff:habit_world_v1",
  sourceDryRunRef: "conversational_build_loop:habit_world_v1",
  sourcePromptDraftRef: humanApprovedCodexSamplePromptDraftFixture.promptDraftId,
  promptDraft: humanApprovedCodexSamplePromptDraftFixture,
  approvalStatus: "needs_review",
  reviewer: "human_reviewer_required",
  reviewedAtLabel: "not_reviewed",
  riskLevel: "high",
  limitations: [
    "manual_review_required",
    "copy_ready_only_after_approval",
    "metadata_only",
  ],
};

export const humanApprovedCodexExpectedApprovalChecklistFixture: readonly string[] = [
  "scope",
  "files",
  "secrets",
  "runtime",
  "providers",
  "codex_execution",
  "final_report",
];

export const humanApprovedCodexExpectedSafePackageFixture: Pick<
  HumanApprovedCodexHandoffPackage,
  "approvalStatus" | "safeToCopy" | "safeToExecute" | "requiresHumanApproval"
> = {
  approvalStatus: "approved_for_copy",
  safeToCopy: true,
  safeToExecute: false,
  requiresHumanApproval: true,
};

export const humanApprovedCodexExpectedBlockedPackageFixture: Pick<
  HumanApprovedCodexHandoffPackage,
  "approvalStatus" | "safeToCopy" | "safeToExecute" | "requiresHumanApproval"
> = {
  approvalStatus: "blocked",
  safeToCopy: false,
  safeToExecute: false,
  requiresHumanApproval: true,
};

export const humanApprovedCodexMissingSectionsFixture: readonly HumanApprovedCodexCompletenessChecklistItem[] = [
  {
    checklistItemId: "handoff_completeness:project_path",
    sectionName: "project path",
    present: false,
    blocking: true,
    evidenceRefs: [],
    recommendedFix: "Add project path to the handoff prompt metadata.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  },
];

export const humanApprovedCodexUnsafeSafetyFixture: readonly HumanApprovedCodexSafetyChecklistItem[] = [
  {
    checklistItemId: "handoff_safety:unsafe_wording",
    category: "runtime",
    question: "Does the prompt avoid unsafe action wording?",
    expectedSafeAnswer: "No unsafe action wording is present.",
    actualStatus: "blocked",
    blocking: true,
    evidenceRefs: ["unsafe_pattern:codex_run_request"],
    recommendedFix: "Remove unsafe action wording before approval.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
  },
];
