import type { AutopilotBoundarySet, AutopilotMode } from "./types.js";
import type { ConversationalBuildLoopPromptDraft } from "./conversationalBuildLoopDryRun.js";

export type HumanApprovedCodexApprovalStatus =
  | "draft"
  | "needs_review"
  | "approved_for_copy"
  | "rejected"
  | "blocked";

export type HumanApprovedCodexChecklistStatus = "pass" | "warning" | "fail" | "blocked";

export type HumanApprovedCodexSafetyChecklistCategory =
  | "scope"
  | "files"
  | "secrets"
  | "runtime"
  | "providers"
  | "database"
  | "dashboard"
  | "package_workflow"
  | "codex_execution"
  | "generated_artifacts"
  | "final_report";

export type HumanApprovedCodexHandoffRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type HumanApprovedCodexHandoffDecisionStatus =
  | "ready_for_review"
  | "approved_for_manual_copy"
  | "blocked"
  | "rejected";

export interface HumanApprovedCodexSafetyChecklistItem {
  checklistItemId: string;
  category: HumanApprovedCodexSafetyChecklistCategory;
  question: string;
  expectedSafeAnswer: string;
  actualStatus: HumanApprovedCodexChecklistStatus;
  blocking: boolean;
  evidenceRefs: readonly string[];
  recommendedFix: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface HumanApprovedCodexCompletenessChecklistItem {
  checklistItemId: string;
  sectionName: string;
  present: boolean;
  blocking: boolean;
  evidenceRefs: readonly string[];
  recommendedFix: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
}

export interface HumanApprovedCodexHandoffPackage {
  handoffId: string;
  sourceDryRunRef: string;
  sourcePromptDraftRef: string;
  targetPhase: string;
  targetMode: AutopilotMode;
  promptText: string;
  contextSummary: string;
  allowedFiles: readonly string[];
  forbiddenFiles: readonly string[];
  boundaries: readonly string[];
  verificationPlan: readonly string[];
  smokePlan: readonly string[];
  finalReportFormat: readonly string[];
  safetyChecklist: readonly HumanApprovedCodexSafetyChecklistItem[];
  completenessChecklist: readonly HumanApprovedCodexCompletenessChecklistItem[];
  approvalStatus: HumanApprovedCodexApprovalStatus;
  safeToCopy: boolean;
  safeToExecute: false;
  requiresHumanApproval: true;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noCodexInvocation: true;
  noSystemCopyAutomation: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemWrites: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
}

export interface HumanApprovedCodexApproval {
  approvalId: string;
  handoffId: string;
  approvalStatus: HumanApprovedCodexApprovalStatus;
  reviewer: string;
  reviewedAtLabel: string;
  approvalChecklist: readonly HumanApprovedCodexSafetyChecklistItem[];
  blockingIssues: readonly string[];
  riskLevel: HumanApprovedCodexHandoffRiskLevel;
  decision: HumanApprovedCodexHandoffDecisionStatus;
  decisionReason: string;
  requiredBeforeCopy: true;
  requiredBeforeExecution: true;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface HumanApprovedCodexHandoffDecision {
  decisionId: string;
  handoffId: string;
  approvalStatus: HumanApprovedCodexApprovalStatus;
  safeToCopy: boolean;
  safeToExecute: false;
  requiresHumanApproval: true;
  blockingIssues: readonly string[];
  warnings: readonly string[];
  recommendedAction: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface HumanApprovedCodexHandoffSummary {
  summaryId: string;
  handoffId: string;
  approvalStatus: HumanApprovedCodexApprovalStatus;
  safetyChecklistCount: number;
  completenessChecklistCount: number;
  blockingIssueCount: number;
  warningCount: number;
  safeToCopy: boolean;
  safeToExecute: false;
  requiresHumanApproval: true;
  recommendedNextPhase: string;
  safeSummary: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface HumanApprovedCodexHandoffInput {
  handoffId?: string;
  sourceDryRunRef: string;
  sourcePromptDraftRef: string;
  promptDraft: ConversationalBuildLoopPromptDraft;
  promptText?: string;
  approvalStatus?: HumanApprovedCodexApprovalStatus;
  reviewer?: string;
  reviewedAtLabel?: string;
  riskLevel?: HumanApprovedCodexHandoffRiskLevel;
  limitations?: readonly string[];
  safetyChecklist?: readonly HumanApprovedCodexSafetyChecklistItem[];
  completenessChecklist?: readonly HumanApprovedCodexCompletenessChecklistItem[];
}

export interface HumanApprovedCodexHandoff {
  handoff: HumanApprovedCodexHandoffPackage;
  approval: HumanApprovedCodexApproval;
  decision: HumanApprovedCodexHandoffDecision;
  summary: HumanApprovedCodexHandoffSummary;
  boundaries: AutopilotBoundarySet;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noCodexInvocation: true;
  noProviderCalls: true;
  noFilesystemWrites: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
}

const humanApprovedCodexBoundaries: AutopilotBoundarySet = {
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
};

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const requiredPromptSectionNames = [
  "project path",
  "branch",
  "task",
  "mode",
  "context summary",
  "allowed files",
  "forbidden files",
  "boundaries",
  "verification plan",
  "smoke plan",
  "final report format",
] as const;

const unsafePromptPatterns: readonly { label: string; pattern: RegExp }[] = [
  { label: "codex_run_request", pattern: /\brun\s+codex\b/i },
  { label: "auto_prompt_insert", pattern: /\bauto(?:mate|mated)?\s+(?:prompt\s+)?(?:insert|use)\b/i },
  { label: "system_copy_buffer", pattern: /\bautomate\s+the\s+system\s+copy\s+buffer\b/i },
  { label: "provider_activation", pattern: /\bcall\s+providers?\b/i },
  { label: "network_activation", pattern: /\bmake\s+network\/api\s+calls?\b/i },
  { label: "runtime_write", pattern: /\bwrite\s+project\s+files\s+from\s+source\b/i },
  { label: "package_workflow_change", pattern: /\bmutate\s+package\s+or\s+workflow\s+files?\b/i },
  { label: "database_activation", pattern: /\bmutate\s+DB\/SQL\b/i },
  { label: "dashboard_activation", pattern: /\bmutate\s+dashboard\b/i },
];

const sectionPresent = (
  sectionName: (typeof requiredPromptSectionNames)[number],
  draft: ConversationalBuildLoopPromptDraft,
  promptText: string,
): boolean => {
  if (sectionName === "project path") {
    return draft.projectPath.length > 0 && promptText.includes(draft.projectPath);
  }

  if (sectionName === "branch") {
    return draft.branch.length > 0 && promptText.includes(draft.branch);
  }

  if (sectionName === "task") {
    return draft.task.length > 0 && promptText.includes(draft.task);
  }

  if (sectionName === "mode") {
    return draft.targetMode.length > 0 && promptText.includes(draft.targetMode);
  }

  if (sectionName === "context summary") {
    return draft.contextSummary.length > 0;
  }

  if (sectionName === "allowed files") {
    return draft.allowedFiles.length > 0;
  }

  if (sectionName === "forbidden files") {
    return draft.forbiddenFiles.length > 0;
  }

  if (sectionName === "boundaries") {
    return draft.boundaries.length > 0;
  }

  if (sectionName === "verification plan") {
    return draft.verificationPlan.length > 0;
  }

  if (sectionName === "smoke plan") {
    return draft.smokePlan.length > 0;
  }

  return draft.finalReportFormat.length > 0;
};

const renderDefaultPromptText = (draft: ConversationalBuildLoopPromptDraft): string =>
  [
    "Project path:",
    draft.projectPath,
    "",
    "Branch:",
    draft.branch,
    "",
    "Task:",
    draft.task,
    "",
    "Mode:",
    draft.targetMode,
    "",
    "Context summary:",
    draft.contextSummary,
    "",
    "Allowed files:",
    ...draft.allowedFiles.map((item) => `- ${item}`),
    "",
    "Forbidden files:",
    ...draft.forbiddenFiles.map((item) => `- ${item}`),
    "",
    "Boundaries:",
    ...draft.boundaries.map((item) => `- ${item}`),
    "",
    "Verification plan:",
    ...draft.verificationPlan.map((item) => `- ${item}`),
    "",
    "Smoke plan:",
    ...draft.smokePlan.map((item) => `- ${item}`),
    "",
    "Final report format:",
    ...draft.finalReportFormat.map((item) => `- ${item}`),
  ].join("\n");

export const createHumanApprovedCodexSafetyChecklistItem = (
  input: Omit<
    HumanApprovedCodexSafetyChecklistItem,
    "advisoryOnly" | "sourceOnly" | "metadataOnly"
  >,
): HumanApprovedCodexSafetyChecklistItem => ({
  ...input,
  evidenceRefs: uniqueStrings(input.evidenceRefs),
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
});

export const createHumanApprovedCodexCompletenessChecklistItem = (
  input: Omit<
    HumanApprovedCodexCompletenessChecklistItem,
    "advisoryOnly" | "sourceOnly" | "metadataOnly"
  >,
): HumanApprovedCodexCompletenessChecklistItem => ({
  ...input,
  evidenceRefs: uniqueStrings(input.evidenceRefs),
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
});

const buildCompletenessChecklist = (
  draft: ConversationalBuildLoopPromptDraft,
  promptText: string,
): readonly HumanApprovedCodexCompletenessChecklistItem[] =>
  requiredPromptSectionNames.map((sectionName) => {
    const present = sectionPresent(sectionName, draft, promptText);

    return createHumanApprovedCodexCompletenessChecklistItem({
      checklistItemId: `handoff_completeness:${sectionName.replaceAll(" ", "_")}`,
      sectionName,
      present,
      blocking: !present,
      evidenceRefs: present ? [`prompt_section:${sectionName}`] : [],
      recommendedFix: present
        ? "No fix required."
        : `Add ${sectionName} to the handoff prompt metadata.`,
    });
  });

const buildDefaultSafetyChecklist = (input: {
  promptText: string;
  draft: ConversationalBuildLoopPromptDraft;
}): readonly HumanApprovedCodexSafetyChecklistItem[] => {
  const unsafeMatches = unsafePromptPatterns.filter(({ pattern }) => pattern.test(input.promptText));

  return [
    createHumanApprovedCodexSafetyChecklistItem({
      checklistItemId: "handoff_safety:scope",
      category: "scope",
      question: "Is the handoff scope bounded to one reviewed phase?",
      expectedSafeAnswer: "The handoff has a target phase, target mode, and explicit context summary.",
      actualStatus:
        input.draft.targetPhase.length > 0 && input.draft.targetMode.length > 0
          ? "pass"
          : "blocked",
      blocking: input.draft.targetPhase.length === 0 || input.draft.targetMode.length === 0,
      evidenceRefs: ["promptDraft.targetPhase", "promptDraft.targetMode"],
      recommendedFix: "Add target phase and mode before review.",
    }),
    createHumanApprovedCodexSafetyChecklistItem({
      checklistItemId: "handoff_safety:files",
      category: "files",
      question: "Are allowed and forbidden files explicit?",
      expectedSafeAnswer: "Allowed and forbidden files are both non-empty.",
      actualStatus:
        input.draft.allowedFiles.length > 0 && input.draft.forbiddenFiles.length > 0
          ? "pass"
          : "blocked",
      blocking: input.draft.allowedFiles.length === 0 || input.draft.forbiddenFiles.length === 0,
      evidenceRefs: ["promptDraft.allowedFiles", "promptDraft.forbiddenFiles"],
      recommendedFix: "Add scoped allowed files and forbidden files.",
    }),
    createHumanApprovedCodexSafetyChecklistItem({
      checklistItemId: "handoff_safety:secrets",
      category: "secrets",
      question: "Does the handoff avoid secret material access?",
      expectedSafeAnswer: "The prompt boundaries exclude secret material and environment access.",
      actualStatus: input.draft.boundaries.some((boundary) => boundary.includes("secret"))
        ? "pass"
        : "warning",
      blocking: false,
      evidenceRefs: ["promptDraft.boundaries"],
      recommendedFix: "Make secret-material exclusions explicit if absent.",
    }),
    createHumanApprovedCodexSafetyChecklistItem({
      checklistItemId: "handoff_safety:runtime",
      category: "runtime",
      question: "Does the handoff avoid runtime activation?",
      expectedSafeAnswer: "The prompt remains text and review metadata only.",
      actualStatus: input.draft.safeToUseForExecution ? "blocked" : "pass",
      blocking: input.draft.safeToUseForExecution,
      evidenceRefs: ["promptDraft.safeToUseForExecution"],
      recommendedFix: "Keep prompt draft unusable without human review.",
    }),
    createHumanApprovedCodexSafetyChecklistItem({
      checklistItemId: "handoff_safety:providers",
      category: "providers",
      question: "Does the handoff avoid provider and network actions?",
      expectedSafeAnswer: "Provider and network action boundaries are present.",
      actualStatus:
        input.draft.boundaries.some((boundary) => boundary.includes("providers")) &&
        input.draft.boundaries.some((boundary) => boundary.includes("network"))
          ? "pass"
          : "warning",
      blocking: false,
      evidenceRefs: ["promptDraft.boundaries"],
      recommendedFix: "Add provider and network exclusions if absent.",
    }),
    createHumanApprovedCodexSafetyChecklistItem({
      checklistItemId: "handoff_safety:codex_invocation",
      category: "codex_execution",
      question: "Is the prompt blocked from direct model invocation?",
      expectedSafeAnswer: "The prompt draft is review-gated and not usable automatically.",
      actualStatus:
        input.draft.noCodexInvocation && input.draft.requiresHumanApproval ? "pass" : "blocked",
      blocking: !input.draft.noCodexInvocation || !input.draft.requiresHumanApproval,
      evidenceRefs: ["promptDraft.noCodexInvocation", "promptDraft.requiresHumanApproval"],
      recommendedFix: "Restore human approval and no-invocation flags.",
    }),
    createHumanApprovedCodexSafetyChecklistItem({
      checklistItemId: "handoff_safety:unsafe_wording",
      category: "runtime",
      question: "Does the prompt avoid unsafe action wording?",
      expectedSafeAnswer: "No unsafe action wording is present.",
      actualStatus: unsafeMatches.length > 0 ? "blocked" : "pass",
      blocking: unsafeMatches.length > 0,
      evidenceRefs: unsafeMatches.map((match) => `unsafe_pattern:${match.label}`),
      recommendedFix: unsafeMatches.length > 0
        ? "Remove unsafe action wording before approval."
        : "No fix required.",
    }),
    createHumanApprovedCodexSafetyChecklistItem({
      checklistItemId: "handoff_safety:final_report",
      category: "final_report",
      question: "Does the handoff request a complete final report?",
      expectedSafeAnswer: "Final report sections are present.",
      actualStatus: input.draft.finalReportFormat.length > 0 ? "pass" : "blocked",
      blocking: input.draft.finalReportFormat.length === 0,
      evidenceRefs: ["promptDraft.finalReportFormat"],
      recommendedFix: "Add final report sections.",
    }),
  ];
};

const hasBlockingChecklistItem = (input: {
  safetyChecklist: readonly HumanApprovedCodexSafetyChecklistItem[];
  completenessChecklist: readonly HumanApprovedCodexCompletenessChecklistItem[];
}): boolean =>
  input.safetyChecklist.some(
    (item) => item.blocking && (item.actualStatus === "fail" || item.actualStatus === "blocked"),
  ) || input.completenessChecklist.some((item) => item.blocking && !item.present);

const approvalStatusForPackage = (input: {
  requestedStatus: HumanApprovedCodexApprovalStatus;
  hasBlocking: boolean;
}): HumanApprovedCodexApprovalStatus => {
  if (input.hasBlocking) {
    return "blocked";
  }

  if (input.requestedStatus === "approved_for_copy") {
    return "approved_for_copy";
  }

  if (input.requestedStatus === "rejected") {
    return "rejected";
  }

  return input.requestedStatus === "draft" ? "draft" : "needs_review";
};

export const createHumanApprovedCodexHandoffPackage = (
  input: HumanApprovedCodexHandoffInput,
): HumanApprovedCodexHandoffPackage => {
  const promptText = input.promptText ?? renderDefaultPromptText(input.promptDraft);
  const completenessChecklist =
    input.completenessChecklist ?? buildCompletenessChecklist(input.promptDraft, promptText);
  const safetyChecklist =
    input.safetyChecklist ?? buildDefaultSafetyChecklist({ promptText, draft: input.promptDraft });
  const hasBlocking = hasBlockingChecklistItem({ safetyChecklist, completenessChecklist });
  const approvalStatus = approvalStatusForPackage({
    requestedStatus: input.approvalStatus ?? "needs_review",
    hasBlocking,
  });
  const safeToCopy = approvalStatus === "approved_for_copy" && !hasBlocking;

  return {
    handoffId: input.handoffId ?? `${input.sourcePromptDraftRef}:human_approved_handoff`,
    sourceDryRunRef: input.sourceDryRunRef,
    sourcePromptDraftRef: input.sourcePromptDraftRef,
    targetPhase: input.promptDraft.targetPhase,
    targetMode: input.promptDraft.targetMode,
    promptText,
    contextSummary: input.promptDraft.contextSummary,
    allowedFiles: uniqueStrings(input.promptDraft.allowedFiles),
    forbiddenFiles: uniqueStrings(input.promptDraft.forbiddenFiles),
    boundaries: uniqueStrings(input.promptDraft.boundaries),
    verificationPlan: uniqueStrings(input.promptDraft.verificationPlan),
    smokePlan: uniqueStrings(input.promptDraft.smokePlan),
    finalReportFormat: uniqueStrings(input.promptDraft.finalReportFormat),
    safetyChecklist,
    completenessChecklist,
    approvalStatus,
    safeToCopy,
    safeToExecute: false,
    requiresHumanApproval: true,
    limitations: uniqueStrings(
      input.limitations ?? [
        "manual_review_required",
        "copy_ready_only_after_approval",
        "no_runtime_action",
        "no_provider_action",
        "no_source_write_from_handoff",
      ],
    ),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noCodexInvocation: true,
    noSystemCopyAutomation: true,
    noProviderCalls: true,
    noNetwork: true,
    noFilesystemWrites: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
  };
};

export const selectBlockingHandoffIssues = (
  input: HumanApprovedCodexHandoffPackage | HumanApprovedCodexApproval,
): readonly string[] => {
  if ("blockingIssues" in input) {
    return uniqueStrings(input.blockingIssues);
  }

  const safetyIssues = input.safetyChecklist
    .filter((item) => item.blocking && (item.actualStatus === "fail" || item.actualStatus === "blocked"))
    .map((item) => item.checklistItemId);
  const completenessIssues = input.completenessChecklist
    .filter((item) => item.blocking && !item.present)
    .map((item) => item.checklistItemId);

  return uniqueStrings([...safetyIssues, ...completenessIssues]);
};

export const createHumanApprovedCodexApproval = (input: {
  handoff: HumanApprovedCodexHandoffPackage;
  reviewer?: string;
  reviewedAtLabel?: string;
  riskLevel?: HumanApprovedCodexHandoffRiskLevel;
  decisionReason?: string;
}): HumanApprovedCodexApproval => {
  const blockingIssues = selectBlockingHandoffIssues(input.handoff);
  const decision: HumanApprovedCodexHandoffDecisionStatus =
    input.handoff.approvalStatus === "approved_for_copy" && blockingIssues.length === 0
      ? "approved_for_manual_copy"
      : input.handoff.approvalStatus === "rejected"
        ? "rejected"
        : blockingIssues.length > 0
          ? "blocked"
          : "ready_for_review";

  return {
    approvalId: `${input.handoff.handoffId}:approval`,
    handoffId: input.handoff.handoffId,
    approvalStatus: input.handoff.approvalStatus,
    reviewer: input.reviewer ?? "human_reviewer_required",
    reviewedAtLabel: input.reviewedAtLabel ?? "not_reviewed",
    approvalChecklist: input.handoff.safetyChecklist,
    blockingIssues,
    riskLevel: input.riskLevel ?? (blockingIssues.length > 0 ? "high" : "medium"),
    decision,
    decisionReason:
      input.decisionReason ??
      (decision === "approved_for_manual_copy"
        ? "Human reviewer approved this prompt text for manual copy only."
        : "Human review is required before manual copy use."),
    requiredBeforeCopy: true,
    requiredBeforeExecution: true,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
  };
};

export const evaluateHumanApprovedCodexHandoff = (
  input: HumanApprovedCodexHandoffPackage,
): HumanApprovedCodexHandoffDecision => {
  const blockingIssues = selectBlockingHandoffIssues(input);
  const warnings = input.safetyChecklist
    .filter((item) => item.actualStatus === "warning")
    .map((item) => item.checklistItemId);
  const unsafeApproval =
    input.safeToExecute ||
    !input.requiresHumanApproval ||
    (input.safeToCopy && input.approvalStatus !== "approved_for_copy") ||
    (input.approvalStatus === "approved_for_copy" && blockingIssues.length > 0);
  const allBlockingIssues = uniqueStrings([
    ...blockingIssues,
    ...(unsafeApproval ? ["unsafe_approval_flags"] : []),
  ]);
  const safeToCopy = input.approvalStatus === "approved_for_copy" && allBlockingIssues.length === 0;

  return {
    decisionId: `${input.handoffId}:decision`,
    handoffId: input.handoffId,
    approvalStatus: allBlockingIssues.length > 0 ? "blocked" : input.approvalStatus,
    safeToCopy,
    safeToExecute: false,
    requiresHumanApproval: true,
    blockingIssues: allBlockingIssues,
    warnings,
    recommendedAction: safeToCopy
      ? "Human may manually copy this prompt text after final review."
      : allBlockingIssues.length > 0
        ? "Fix blocking issues before approving manual copy."
        : "Request human review before manual copy.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
  };
};

export const summarizeHumanApprovedCodexHandoff = (input: {
  handoff: HumanApprovedCodexHandoffPackage;
  decision: HumanApprovedCodexHandoffDecision;
}): HumanApprovedCodexHandoffSummary => ({
  summaryId: `${input.handoff.handoffId}:summary`,
  handoffId: input.handoff.handoffId,
  approvalStatus: input.decision.approvalStatus,
  safetyChecklistCount: input.handoff.safetyChecklist.length,
  completenessChecklistCount: input.handoff.completenessChecklist.length,
  blockingIssueCount: input.decision.blockingIssues.length,
  warningCount: input.decision.warnings.length,
  safeToCopy: input.decision.safeToCopy,
  safeToExecute: false,
  requiresHumanApproval: true,
  recommendedNextPhase: input.decision.safeToCopy
    ? "PILOT-5B - Manual Codex Handoff Trial Plan"
    : "PILOT-4I - Human-Approved Codex Prompt Handoff Implementation",
  safeSummary: input.decision.safeToCopy
    ? "Handoff package is approved for human manual copy only."
    : "Handoff package remains review-gated or blocked.",
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecution: true,
});

export const markHandoffApprovedForCopy = (
  input: HumanApprovedCodexHandoffPackage,
): HumanApprovedCodexHandoffPackage => {
  const blockingIssues = selectBlockingHandoffIssues(input);
  const approvalStatus: HumanApprovedCodexApprovalStatus =
    blockingIssues.length > 0 ? "blocked" : "approved_for_copy";

  return {
    ...input,
    approvalStatus,
    safeToCopy: approvalStatus === "approved_for_copy",
    safeToExecute: false,
    requiresHumanApproval: true,
  };
};

export const createHumanApprovedCodexHandoff = (
  input: HumanApprovedCodexHandoffInput,
): HumanApprovedCodexHandoff => {
  const handoff = createHumanApprovedCodexHandoffPackage(input);
  const approvalInput: Parameters<typeof createHumanApprovedCodexApproval>[0] = {
    handoff,
  };

  if (input.reviewer !== undefined) {
    approvalInput.reviewer = input.reviewer;
  }

  if (input.reviewedAtLabel !== undefined) {
    approvalInput.reviewedAtLabel = input.reviewedAtLabel;
  }

  if (input.riskLevel !== undefined) {
    approvalInput.riskLevel = input.riskLevel;
  }

  const approval = createHumanApprovedCodexApproval(approvalInput);
  const decision = evaluateHumanApprovedCodexHandoff(handoff);
  const summary = summarizeHumanApprovedCodexHandoff({ handoff, decision });

  return {
    handoff,
    approval,
    decision,
    summary,
    boundaries: humanApprovedCodexBoundaries,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noCodexInvocation: true,
    noProviderCalls: true,
    noFilesystemWrites: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
  };
};
