import type { AutopilotBoundarySet } from "./types.js";
import type {
  ConversationalBuildLoopDryRunInput,
  ConversationalBuildLoopStageId,
} from "./conversationalBuildLoopDryRun.js";

export const conversationalBuildLoopIdeaFixture =
  "Quiero una app movil de habitos gamificada con mundo vivo, progreso, recordatorios y premium futuro.";

export const conversationalBuildLoopAssumedAnswersFixture: readonly string[] = [
  "target_user:wants_daily_habit_motivation",
  "platform:mobile_first",
  "mvp:onboarding_habit_list_check_in_progress_dashboard_settings",
  "future_scope:premium_and_advanced_reminders",
  "privacy:sensitive_progress_data_requires_review",
];

export const conversationalBuildLoopUnresolvedQuestionsFixture: readonly string[] = [
  "Should the MVP require accounts or remain local-first?",
  "What progress data can be retained, exported, or deleted?",
  "How should reminders avoid pressure or manipulative habit loops?",
  "Which premium capabilities are explicitly out of MVP?",
  "What store privacy and rating disclosures are required before release planning?",
];

export const conversationalBuildLoopExpectedStageIdsFixture: readonly ConversationalBuildLoopStageId[] = [
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

export const conversationalBuildLoopExpectedArtifactChainFixture: readonly string[] = [
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

export const conversationalBuildLoopSafetyBoundaryLabelsFixture: readonly string[] = [
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

export const conversationalBuildLoopRequiredApprovalsFixture: readonly string[] = [
  "human_operator_review",
  "pm_scope_review",
  "privacy_safety_review",
  "implementation_handoff_review",
];

export const conversationalBuildLoopForbiddenFilesFixture: readonly string[] = [
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
];

export const conversationalBuildLoopLimitationsFixture: readonly string[] = [
  "fixture_only",
  "metadata_only",
  "no_real_user_interview",
  "no_runtime_loop",
  "no_project_artifact_creation",
  "prompt_draft_requires_human_review",
];

export const conversationalBuildLoopBoundaryFixture: AutopilotBoundarySet = {
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

export const conversationalBuildLoopDefaultInputFixture: ConversationalBuildLoopDryRunInput = {
  conversationDryRunId: "conversational_build_loop:habit_world_v1",
  userIdeaText: conversationalBuildLoopIdeaFixture,
  userIntent: "turn_simple_mobile_idea_into_reviewable_project_metadata",
  targetProjectType: "mobile_app",
  clarificationDepth: "standard",
  assumedAnswers: conversationalBuildLoopAssumedAnswersFixture,
  unresolvedQuestions: conversationalBuildLoopUnresolvedQuestionsFixture,
  safetyBoundaries: conversationalBuildLoopBoundaryFixture,
  safetyBoundaryLabels: conversationalBuildLoopSafetyBoundaryLabelsFixture,
  expectedArtifactChain: conversationalBuildLoopExpectedArtifactChainFixture,
  riskLevel: "high",
  requiredApprovals: conversationalBuildLoopRequiredApprovalsFixture,
};
