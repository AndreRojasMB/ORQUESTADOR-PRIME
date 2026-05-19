import type { AutopilotBoundarySet, AutopilotMode } from "./types.js";
import type { MobileFactoryDryRunArtifactChain } from "../pm/mobileFactoryDryRun.js";
export type ConversationalBuildLoopClarificationDepth = "none" | "light" | "standard" | "deep";

export type ConversationalBuildLoopRiskLevel = "low" | "medium" | "high" | "critical";

export type ConversationalBuildLoopStageId =
  | "idea_intake"
  | "requirements_interview"
  | "feature_blueprints"
  | "screen_blueprints"
  | "api_contracts"
  | "design_system"
  | "quality_security_release"
  | "store_readiness"
  | "prompt_draft"
  | "human_review";

export type ConversationalBuildLoopEvaluationStatus = "passed" | "warning" | "failed" | "blocked";

export interface ConversationalBuildLoopDryRunInput {
  conversationDryRunId: string;
  userIdeaText: string;
  userIntent: string;
  targetProjectType: string;
  clarificationDepth: ConversationalBuildLoopClarificationDepth;
  assumedAnswers: readonly string[];
  unresolvedQuestions: readonly string[];
  safetyBoundaries: AutopilotBoundarySet;
  safetyBoundaryLabels: readonly string[];
  expectedArtifactChain: readonly string[];
  riskLevel: ConversationalBuildLoopRiskLevel;
  requiredApprovals: readonly string[];
}

export interface ConversationalBuildLoopStage {
  stageId: ConversationalBuildLoopStageId;
  stageName: string;
  inputRefs: readonly string[];
  outputRefs: readonly string[];
  requiredEvidence: readonly string[];
  humanApprovalRequired: boolean;
  canProceed: boolean;
  blockers: readonly string[];
  riskLevel: ConversationalBuildLoopRiskLevel;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface ConversationalBuildLoopArtifactChain {
  chainId: string;
  artifacts: readonly string[];
  completedStages: readonly ConversationalBuildLoopStageId[];
  blockedStages: readonly ConversationalBuildLoopStageId[];
  unresolvedQuestions: readonly string[];
  nextRecommendedArtifact: string;
  safeToDraftPrompt: boolean;
  safeToExecutePrompt: false;
  limitations: readonly string[];
  sourceMobileFactoryArtifacts: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface ConversationalBuildLoopPromptDraft {
  promptDraftId: string;
  targetPhase: string;
  targetMode: AutopilotMode;
  projectPath: string;
  branch: string;
  contextSummary: string;
  allowedFiles: readonly string[];
  forbiddenFiles: readonly string[];
  task: string;
  boundaries: readonly string[];
  verificationPlan: readonly string[];
  smokePlan: readonly string[];
  finalReportFormat: readonly string[];
  safeToUseForExecution: false;
  requiresHumanApproval: true;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noCodexInvocation: true;
}

export interface ConversationalBuildLoopSuccessEvaluation {
  evaluationId: string;
  status: ConversationalBuildLoopEvaluationStatus;
  passedCriteria: readonly string[];
  warningCriteria: readonly string[];
  failedCriteria: readonly string[];
  blockedCriteria: readonly string[];
  safeSummary: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface ConversationalBuildLoopSummary {
  summaryId: string;
  conversationDryRunId: string;
  stageCount: number;
  completedStageCount: number;
  blockedStageCount: number;
  artifactCount: number;
  unresolvedQuestionCount: number;
  promptDraftAvailable: boolean;
  promptDraftExecutable: false;
  successStatus: ConversationalBuildLoopEvaluationStatus;
  recommendedNextPhase: string;
  safeSummary: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
}

export interface ConversationalBuildLoopDryRunOutput {
  outputId: string;
  input: ConversationalBuildLoopDryRunInput;
  stages: readonly ConversationalBuildLoopStage[];
  artifactChain: ConversationalBuildLoopArtifactChain;
  promptDraftMetadata: ConversationalBuildLoopPromptDraft;
  successEvaluation: ConversationalBuildLoopSuccessEvaluation;
  summary: ConversationalBuildLoopSummary;
  recommendedNextStep: string;
  limitations: readonly string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noCodexInvocation: true;
  noProviderCalls: true;
  noFilesystemWrites: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
  boundaries: AutopilotBoundarySet;
}

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const conversationalBuildLoopIdea =
  "Quiero una app movil de habitos gamificada con mundo vivo, progreso, recordatorios y premium futuro.";

const conversationalBuildLoopAssumedAnswers: readonly string[] = [
  "target_user:wants_daily_habit_motivation",
  "platform:mobile_first",
  "mvp:onboarding_habit_list_check_in_progress_dashboard_settings",
  "future_scope:premium_and_advanced_reminders",
  "privacy:sensitive_progress_data_requires_review",
];

const conversationalBuildLoopUnresolvedQuestions: readonly string[] = [
  "Should the MVP require accounts or remain local-first?",
  "What progress data can be retained, exported, or deleted?",
  "How should reminders avoid pressure or manipulative habit loops?",
  "Which premium capabilities are explicitly out of MVP?",
  "What store privacy and rating disclosures are required before release planning?",
];

const conversationalBuildLoopSafetyBoundaryLabels: readonly string[] = [
  "source-only",
  "advisory-only",
  "metadata-only",
  "no Codex invocation",
  "no app creation",
  "no screen/component/route/backend creation",
  "no source-stage file writes",
  "no package or workflow changes",
  "no Expo/EAS command",
  "no providers",
  "no network/API calls",
  "no DB/SQL",
  "no dashboard mutation",
  "no memory persistence",
  "no source-control behavior from source",
  "no WhatsApp outbound",
  "no OpenClaw operation",
];

const conversationalBuildLoopExpectedArtifactChain: readonly string[] = [
  "intake_summary",
  "requirements_summary",
  "feature_blueprint_summary",
  "screen_blueprint_summary",
  "api_contract_candidate_summary",
  "design_system_summary",
  "quality_security_release_summary",
  "store_readiness_summary",
  "prompt_draft_metadata",
  "human_review_summary",
];

const conversationalBuildLoopRequiredApprovals: readonly string[] = [
  "human_operator_review",
  "pm_scope_review",
  "privacy_safety_review",
  "implementation_handoff_review",
];

const conversationalBuildLoopForbiddenFiles: readonly string[] = [
  "package.json",
  ".github/*",
  "app folders",
  "mobile app output folders",
  "Expo/EAS/native config files",
  "credential and vault files",
  "src/whatsapp/*",
  "src/viernesBridge/*",
  "src/integrations/*",
  "dashboard/*",
  "providers/*",
  "DB/SQL files",
  "runtime execution files",
];

const conversationalBuildLoopLimitations: readonly string[] = [
  "fixture_only",
  "metadata_only",
  "no_real_user_interview",
  "no_runtime_loop",
  "no_project_artifact_creation",
  "prompt_draft_requires_human_review",
];

const conversationalBuildLoopBoundaries: AutopilotBoundarySet = {
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

const requiredStageIds: readonly ConversationalBuildLoopStageId[] = [
  "idea_intake",
  "requirements_interview",
  "feature_blueprints",
  "screen_blueprints",
  "api_contracts",
  "design_system",
  "quality_security_release",
  "store_readiness",
  "prompt_draft",
  "human_review",
];

const stageNames: Record<ConversationalBuildLoopStageId, string> = {
  idea_intake: "Idea intake",
  requirements_interview: "Requirements interview",
  feature_blueprints: "Feature blueprints",
  screen_blueprints: "Screen blueprints",
  api_contracts: "API contracts",
  design_system: "Design system",
  quality_security_release: "Quality, security, and release",
  store_readiness: "Store readiness",
  prompt_draft: "Prompt draft",
  human_review: "Human review",
};

const defaultStageEvidence: Record<ConversationalBuildLoopStageId, readonly string[]> = {
  idea_intake: ["App Idea Intake metadata"],
  requirements_interview: ["Mobile Requirements Interview metadata"],
  feature_blueprints: ["Mobile Feature Blueprint metadata"],
  screen_blueprints: ["Mobile Screen Blueprint metadata"],
  api_contracts: ["Mobile API Contract candidate metadata"],
  design_system: ["Mobile Design System metadata"],
  quality_security_release: ["Security, testing, analytics, release, and store metadata"],
  store_readiness: ["Store Readiness metadata"],
  prompt_draft: ["Codex handoff draft shape metadata"],
  human_review: ["Autopilot dry-run hardening gates and next-action metadata"],
};

const stageRisk = (stageId: ConversationalBuildLoopStageId): ConversationalBuildLoopRiskLevel =>
  stageId === "prompt_draft" || stageId === "human_review" || stageId === "quality_security_release"
    ? "high"
    : "medium";

const requiresApproval = (stageId: ConversationalBuildLoopStageId): boolean =>
  stageId === "prompt_draft" ||
  stageId === "human_review" ||
  stageId === "quality_security_release" ||
  stageId === "store_readiness";

export const createConversationalBuildLoopInput = (
  input: Partial<Omit<ConversationalBuildLoopDryRunInput, "safetyBoundaries">> = {},
): ConversationalBuildLoopDryRunInput => ({
  conversationDryRunId: input.conversationDryRunId ?? "conversational_build_loop:habit_world_v1",
  userIdeaText: input.userIdeaText ?? conversationalBuildLoopIdea,
  userIntent: input.userIntent ?? "turn_simple_mobile_idea_into_reviewable_project_metadata",
  targetProjectType: input.targetProjectType ?? "mobile_app",
  clarificationDepth: input.clarificationDepth ?? "standard",
  assumedAnswers: uniqueStrings(input.assumedAnswers ?? conversationalBuildLoopAssumedAnswers),
  unresolvedQuestions: uniqueStrings(input.unresolvedQuestions ?? conversationalBuildLoopUnresolvedQuestions),
  safetyBoundaries: conversationalBuildLoopBoundaries,
  safetyBoundaryLabels: uniqueStrings(input.safetyBoundaryLabels ?? conversationalBuildLoopSafetyBoundaryLabels),
  expectedArtifactChain: uniqueStrings(input.expectedArtifactChain ?? conversationalBuildLoopExpectedArtifactChain),
  riskLevel: input.riskLevel ?? "high",
  requiredApprovals: uniqueStrings(input.requiredApprovals ?? conversationalBuildLoopRequiredApprovals),
});

export const createConversationalBuildLoopStage = (
  input: Omit<ConversationalBuildLoopStage, "advisoryOnly" | "sourceOnly" | "metadataOnly" | "noExecution">,
): ConversationalBuildLoopStage => ({
  ...input,
  inputRefs: uniqueStrings(input.inputRefs),
  outputRefs: uniqueStrings(input.outputRefs),
  requiredEvidence: uniqueStrings(input.requiredEvidence),
  blockers: uniqueStrings(input.blockers),
  limitations: uniqueStrings(input.limitations),
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecution: true,
});

const buildDefaultStages = (input: ConversationalBuildLoopDryRunInput): readonly ConversationalBuildLoopStage[] =>
  requiredStageIds.map((stageId, index) => {
    const previousStage = requiredStageIds[index - 1];
    const nextStage = requiredStageIds[index + 1];

    return createConversationalBuildLoopStage({
      stageId,
      stageName: stageNames[stageId],
      inputRefs: previousStage ? [`stage:${previousStage}`] : [`idea:${input.conversationDryRunId}`],
      outputRefs: nextStage ? [`stage:${nextStage}`] : ["review:human_approval"],
      requiredEvidence: defaultStageEvidence[stageId],
      humanApprovalRequired: requiresApproval(stageId),
      canProceed: true,
      blockers: [],
      riskLevel: stageRisk(stageId),
      limitations: ["metadata_only_stage", "no_runtime_action", "human_review_before_use"],
    });
  });

export const createConversationalBuildLoopArtifactChain = (input: {
  chainId?: string;
  stages: readonly ConversationalBuildLoopStage[];
  unresolvedQuestions: readonly string[];
  nextRecommendedArtifact?: string;
  safeToDraftPrompt?: boolean;
  sourceMobileFactoryArtifacts?: readonly MobileFactoryDryRunArtifactChain[];
  limitations?: readonly string[];
}): ConversationalBuildLoopArtifactChain => ({
  chainId: input.chainId ?? "conversational_build_loop_chain:habit_world_v1",
  artifacts: input.stages.flatMap((stage) => stage.outputRefs),
  completedStages: input.stages.filter((stage) => stage.canProceed).map((stage) => stage.stageId),
  blockedStages: input.stages.filter((stage) => stage.blockers.length > 0 || !stage.canProceed).map((stage) => stage.stageId),
  unresolvedQuestions: uniqueStrings(input.unresolvedQuestions),
  nextRecommendedArtifact: input.nextRecommendedArtifact ?? "PILOT-4B - Human-Approved Codex Prompt Handoff Plan",
  safeToDraftPrompt: input.safeToDraftPrompt ?? true,
  safeToExecutePrompt: false,
  limitations: uniqueStrings(input.limitations ?? conversationalBuildLoopLimitations),
  sourceMobileFactoryArtifacts: uniqueStrings(input.sourceMobileFactoryArtifacts?.map((artifact) => artifact.artifactId) ?? []),
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecution: true,
});

export const createConversationalBuildLoopPromptDraft = (
  input: Partial<ConversationalBuildLoopPromptDraft> & {
    conversationDryRunId?: string;
    contextSummary: string;
  },
): ConversationalBuildLoopPromptDraft => ({
  promptDraftId: input.promptDraftId ?? `conversational_build_loop_prompt:${input.conversationDryRunId ?? "habit_world_v1"}`,
  targetPhase: input.targetPhase ?? "PILOT-4B - Human-Approved Codex Prompt Handoff Plan",
  targetMode: input.targetMode ?? "B",
  projectPath: input.projectPath ?? "/home/varyan/projects/ORQUESTADOR-PRIME",
  branch: input.branch ?? "dev",
  contextSummary: input.contextSummary,
  allowedFiles: uniqueStrings(
    input.allowedFiles ?? [
      "src/autopilot/conversationalBuildLoopDryRun.ts",
      "src/autopilot/conversationalBuildLoopFixtures.ts",
      "docs/conversational-build-loop-dry-run.md",
      "scripts/conversational-build-loop-dry-run-tests.ts",
    ],
  ),
  forbiddenFiles: uniqueStrings(input.forbiddenFiles ?? conversationalBuildLoopForbiddenFiles),
  task: input.task ?? "Plan a human-approved handoff from conversational mobile metadata to a reviewed Codex prompt.",
  boundaries: uniqueStrings(input.boundaries ?? conversationalBuildLoopSafetyBoundaryLabels),
  verificationPlan: uniqueStrings(
    input.verificationPlan ?? [
      "git status --short --branch",
      "node node_modules/typescript/bin/tsc --noEmit",
      "node --experimental-strip-types scripts/conversational-build-loop-dry-run-tests.ts",
      "git diff --check",
    ],
  ),
  smokePlan: uniqueStrings(
    input.smokePlan ?? [
      "default fixture exists",
      "required stages exist",
      "artifact chain exists",
      "prompt draft remains review-only",
      "success evaluation passes without runtime behavior",
    ],
  ),
  finalReportFormat: uniqueStrings(
    input.finalReportFormat ?? [
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
  ),
  safeToUseForExecution: false,
  requiresHumanApproval: true,
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noCodexInvocation: true,
});

export const evaluateConversationalBuildLoopSuccess = (input: {
  conversationDryRunId: string;
  stages: readonly ConversationalBuildLoopStage[];
  artifactChain: ConversationalBuildLoopArtifactChain;
  promptDraftMetadata: ConversationalBuildLoopPromptDraft;
  requiredApprovals: readonly string[];
}): ConversationalBuildLoopSuccessEvaluation => {
  const stageIds = new Set(input.stages.map((stage) => stage.stageId));
  const missingStages = requiredStageIds.filter((stageId) => !stageIds.has(stageId));
  const blockedStages = input.stages.filter((stage) => !stage.canProceed || stage.blockers.length > 0);
  const highRiskWithoutApproval = input.stages.some(
    (stage) => stage.riskLevel === "high" && stage.humanApprovalRequired && input.requiredApprovals.length === 0,
  );
  const promptUnsafe =
    input.promptDraftMetadata.safeToUseForExecution ||
    !input.promptDraftMetadata.requiresHumanApproval ||
    input.promptDraftMetadata.boundaries.length === 0 ||
    !input.promptDraftMetadata.noCodexInvocation;
  const chainHidesQuestions = input.artifactChain.unresolvedQuestions.length === 0;
  const coreArtifactsMissing =
    !stageIds.has("idea_intake") ||
    !stageIds.has("requirements_interview") ||
    !stageIds.has("feature_blueprints") ||
    !stageIds.has("screen_blueprints");
  const blockedCriteria = [
    ...missingStages.map((stage) => `missing_stage:${stage}`),
    ...blockedStages.map((stage) => `blocked_stage:${stage.stageId}`),
    ...(promptUnsafe ? ["prompt_draft_unsafe"] : []),
    ...(chainHidesQuestions ? ["unresolved_questions_hidden"] : []),
    ...(highRiskWithoutApproval ? ["high_risk_approval_missing"] : []),
    ...(coreArtifactsMissing ? ["core_artifacts_missing"] : []),
  ];
  const passedCriteria = [
    "required_stage_set_present",
    "unresolved_questions_visible",
    "prompt_draft_exists",
    "prompt_draft_review_gated",
    "metadata_only_boundaries_present",
    "no_external_action_completed",
  ];

  return {
    evaluationId: `conversational_build_loop_evaluation:${input.conversationDryRunId}`,
    status: blockedCriteria.length > 0 ? "blocked" : "passed",
    passedCriteria: blockedCriteria.length > 0 ? [] : passedCriteria,
    warningCriteria: [],
    failedCriteria: [],
    blockedCriteria,
    safeSummary:
      blockedCriteria.length > 0
        ? `Conversational dry-run blocked by ${blockedCriteria.length} criterion/criteria.`
        : "Conversational dry-run passed as metadata-only review chain.",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
  };
};

export const summarizeConversationalBuildLoopDryRun = (input: {
  outputId: string;
  dryRunInput: ConversationalBuildLoopDryRunInput;
  stages: readonly ConversationalBuildLoopStage[];
  artifactChain: ConversationalBuildLoopArtifactChain;
  promptDraftMetadata: ConversationalBuildLoopPromptDraft;
  successEvaluation: ConversationalBuildLoopSuccessEvaluation;
}): ConversationalBuildLoopSummary => {
  const completedStageCount = input.artifactChain.completedStages.length;
  const blockedStageCount = input.artifactChain.blockedStages.length;

  return {
    summaryId: `conversational_build_loop_summary:${input.dryRunInput.conversationDryRunId}`,
    conversationDryRunId: input.dryRunInput.conversationDryRunId,
    stageCount: input.stages.length,
    completedStageCount,
    blockedStageCount,
    artifactCount: input.artifactChain.artifacts.length,
    unresolvedQuestionCount: input.artifactChain.unresolvedQuestions.length,
    promptDraftAvailable: input.promptDraftMetadata.promptDraftId.length > 0,
    promptDraftExecutable: false,
    successStatus: input.successEvaluation.status,
    recommendedNextPhase:
      input.successEvaluation.status === "passed"
        ? "PILOT-4B - Human-Approved Codex Prompt Handoff Plan"
        : "Phase 141B - Roadmap Continuation Plan",
    safeSummary: `Conversational loop dry-run has ${input.stages.length} stage(s), ${input.artifactChain.artifacts.length} artifact ref(s), and ${input.artifactChain.unresolvedQuestions.length} unresolved question(s).`,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
  };
};

export const runConversationalBuildLoopDryRun = (
  input: ConversationalBuildLoopDryRunInput = createConversationalBuildLoopInput(),
  sourceMobileFactoryArtifacts: readonly MobileFactoryDryRunArtifactChain[] = [],
): ConversationalBuildLoopDryRunOutput => {
  const stages = buildDefaultStages(input);
  const artifactChain = createConversationalBuildLoopArtifactChain({
    stages,
    unresolvedQuestions: input.unresolvedQuestions,
    sourceMobileFactoryArtifacts,
  });
  const promptDraftMetadata = createConversationalBuildLoopPromptDraft({
    conversationDryRunId: input.conversationDryRunId,
    contextSummary: `${input.userIdeaText} -> ${artifactChain.nextRecommendedArtifact}`,
  });
  const successEvaluation = evaluateConversationalBuildLoopSuccess({
    conversationDryRunId: input.conversationDryRunId,
    stages,
    artifactChain,
    promptDraftMetadata,
    requiredApprovals: input.requiredApprovals,
  });
  const outputId = `conversational_build_loop_output:${input.conversationDryRunId}`;
  const summary = summarizeConversationalBuildLoopDryRun({
    outputId,
    dryRunInput: input,
    stages,
    artifactChain,
    promptDraftMetadata,
    successEvaluation,
  });

  return {
    outputId,
    input,
    stages,
    artifactChain,
    promptDraftMetadata,
    successEvaluation,
    summary,
    recommendedNextStep: summary.recommendedNextPhase,
    limitations: conversationalBuildLoopLimitations,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noCodexInvocation: true,
    noProviderCalls: true,
    noFilesystemWrites: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
    boundaries: conversationalBuildLoopBoundaries,
  };
};
