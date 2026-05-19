import type { MobileAppFactoryAppType } from "./mobileAppFactoryStrategy.js";
import type { PMRiskTier } from "./types.js";

export type MobileFactoryDryRunArtifactStatus = "planned" | "simulated" | "blocked" | "deferred";

export interface MobileFactoryDryRunSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noFileWritesFromSource: true;
  noCodeGeneration: true;
  noScreenGeneration: true;
  noAppGeneration: true;
  noBackendGeneration: true;
  noEndpointGeneration: true;
  noCodexRun: true;
  noProviderCalls: true;
  noNetwork: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
  noGitAutomationFromSource: true;
}

export interface MobileFactoryDryRunInput {
  dryRunId: string;
  ideaText: string;
  targetUser: string;
  expectedAppType: MobileAppFactoryAppType | "unknown_mobile_app";
  expectedCoreFlows: readonly string[];
  expectedMvpScope: readonly string[];
  safetyBoundaries: MobileFactoryDryRunSafetyBoundaries;
  expectedArtifacts: readonly string[];
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
}

export interface MobileFactoryDryRunArtifactChain {
  chainId: string;
  artifactId: string;
  artifactName: string;
  sourceStage: string;
  targetStage: string;
  status: MobileFactoryDryRunArtifactStatus;
  summary: string;
  dependencies: readonly string[];
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobileFactoryDryRunSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noFileWritesFromSource"
  >;
}

export interface MobileFactoryDryRunPromptDraft {
  promptDraftId: string;
  title: string;
  draftPurpose: string;
  metadataOnlyBody: readonly string[];
  safeToUseForExecution: false;
  requiredApprovalsBeforeUse: readonly string[];
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobileFactoryDryRunSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noCodexRun" | "noCodeGeneration"
  >;
}

export interface MobileFactoryDryRunOutput {
  outputId: string;
  intakeSummary: string;
  requirementsSummary: string;
  featureBlueprintSummary: string;
  screenBlueprintSummary: string;
  apiContractSummary: string;
  designSystemSummary: string;
  qualitySummary: string;
  releaseStoreSummary: string;
  unresolvedQuestions: readonly string[];
  recommendedNextArtifact: string;
  safeToGenerateCodexPrompt: boolean;
  promptDraftMetadataOnly: MobileFactoryDryRunPromptDraft;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  artifactChain: readonly MobileFactoryDryRunArtifactChain[];
  safetyBoundaries: MobileFactoryDryRunSafetyBoundaries;
}

export interface MobileFactoryDryRunScenario {
  scenarioId: string;
  name: string;
  input: MobileFactoryDryRunInput;
  expectedOutputNotes: readonly string[];
  successCriteria: readonly string[];
  limitations: readonly string[];
  safetyBoundaries: MobileFactoryDryRunSafetyBoundaries;
}

export interface MobileFactoryDryRunSummary {
  dryRunId: string;
  outputId: string;
  artifactCount: number;
  simulatedArtifactCount: number;
  blockedArtifactCount: number;
  unresolvedQuestionCount: number;
  safeToGenerateCodexPrompt: boolean;
  promptDraftIsMetadataOnly: boolean;
  successEvaluationPassed: boolean;
  highestRiskLevel: PMRiskTier;
  safeSummary: string;
  safetyBoundaries: MobileFactoryDryRunSafetyBoundaries;
}

const safetyBoundaries = (): MobileFactoryDryRunSafetyBoundaries => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noFileWritesFromSource: true,
  noCodeGeneration: true,
  noScreenGeneration: true,
  noAppGeneration: true,
  noBackendGeneration: true,
  noEndpointGeneration: true,
  noCodexRun: true,
  noProviderCalls: true,
  noNetwork: true,
  noDashboardMutation: true,
  noMemoryPersistence: true,
  noGitAutomationFromSource: true,
});

const artifactSafety = (): MobileFactoryDryRunArtifactChain["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noFileWritesFromSource: true,
});

const promptSafety = (): MobileFactoryDryRunPromptDraft["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noCodexRun: true,
  noCodeGeneration: true,
});

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const riskRank: Record<PMRiskTier, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const highestRisk = (risks: readonly PMRiskTier[]): PMRiskTier => {
  const sorted = [...risks].sort((left, right) => riskRank[right] - riskRank[left]);
  return sorted[0] ?? "low";
};

export const createMobileFactoryDryRunInput = (
  input: Partial<Omit<MobileFactoryDryRunInput, "safetyBoundaries">> = {},
): MobileFactoryDryRunInput => ({
  dryRunId: input.dryRunId ?? "mobile_factory_dry_run:habit_world_v1",
  ideaText:
    input.ideaText ??
    "Quiero una app movil de habitos gamificada con mundo vivo, progreso, recordatorios y premium futuro.",
  targetUser: input.targetUser ?? "Persona que quiere crear rutinas diarias con motivacion visual y progreso claro.",
  expectedAppType: input.expectedAppType ?? "habit_gamified_app",
  expectedCoreFlows: uniqueStrings(
    input.expectedCoreFlows ?? [
      "onboarding_goal_setup",
      "habit_creation",
      "daily_check_in",
      "living_world_progress",
      "reminder_preference_review",
      "future_premium_preview",
    ],
  ),
  expectedMvpScope: uniqueStrings(
    input.expectedMvpScope ?? ["onboarding", "habit_list", "habit_check_in", "progress_dashboard", "basic_settings"],
  ),
  safetyBoundaries: safetyBoundaries(),
  expectedArtifacts: uniqueStrings(
    input.expectedArtifacts ?? [
      "intake_summary",
      "requirements_summary",
      "feature_blueprint_summary",
      "screen_blueprint_summary",
      "api_contract_candidate_summary",
      "design_system_summary",
      "quality_summary",
      "release_store_summary",
      "prompt_draft_metadata_only",
    ],
  ),
  riskLevel: input.riskLevel ?? "medium",
  requiredApprovals: uniqueStrings(
    input.requiredApprovals ?? [
      "pm_scope_review",
      "privacy_consent_review",
      "behavioral_safety_review",
      "release_readiness_review",
    ],
  ),
});

const createArtifact = (
  artifactId: string,
  artifactName: string,
  sourceStage: string,
  targetStage: string,
  summary: string,
  dependencies: readonly string[],
): MobileFactoryDryRunArtifactChain => ({
  chainId: `mobile_factory_dry_run_chain:${artifactId}`,
  artifactId,
  artifactName,
  sourceStage,
  targetStage,
  status: "simulated",
  summary,
  dependencies: uniqueStrings(dependencies),
  limitations: ["metadata_only_artifact", "no_runtime_behavior", "no_project_file_creation"],
  safetyBoundaries: artifactSafety(),
});

const buildArtifactChain = (input: MobileFactoryDryRunInput): readonly MobileFactoryDryRunArtifactChain[] => [
  createArtifact(
    "intake_summary",
    "App Idea Intake output",
    "idea_fixture",
    "requirements",
    `${input.expectedAppType} idea for ${input.targetUser} normalized into passive intake metadata.`,
    [],
  ),
  createArtifact(
    "requirements_summary",
    "Mobile Requirements output",
    "intake",
    "features",
    "MVP/Beta/Release requirements are separated with unresolved questions preserved.",
    ["intake_summary"],
  ),
  createArtifact(
    "feature_blueprint_summary",
    "Feature Blueprints",
    "requirements",
    "screens",
    "Habit tracking, progress world, reminders, settings, and future premium are represented as feature metadata.",
    ["requirements_summary"],
  ),
  createArtifact(
    "screen_blueprint_summary",
    "Screen Blueprints",
    "features",
    "api_design_quality",
    "Onboarding, habit list, check-in, progress dashboard, settings, and premium preview screens are represented as metadata.",
    ["feature_blueprint_summary"],
  ),
  createArtifact(
    "api_contract_candidate_summary",
    "API Contract candidates",
    "screens",
    "quality",
    "Future habit, progress, reminder, profile, and premium data needs are represented as contract candidates only.",
    ["screen_blueprint_summary"],
  ),
  createArtifact(
    "design_system_summary",
    "Design System blueprint",
    "screens",
    "quality",
    "Tokens, component blueprint posture, layout patterns, accessibility, and reduced-motion posture are represented as metadata.",
    ["screen_blueprint_summary"],
  ),
  createArtifact(
    "quality_summary",
    "State/offline/security/performance/testing metadata",
    "api_design",
    "release_store",
    "State, offline, privacy, habit-loop safety, performance, testing, and release checks remain advisory.",
    ["api_contract_candidate_summary", "design_system_summary"],
  ),
  createArtifact(
    "release_store_summary",
    "Release and store readiness metadata",
    "quality",
    "handoff",
    "Release gates, privacy/rating posture, listing posture, and compliance review remain passive readiness metadata.",
    ["quality_summary"],
  ),
  createArtifact(
    "prompt_draft_metadata_only",
    "Next prompt draft metadata",
    "handoff",
    "future_review",
    "Prompt draft is stored as passive planning text and cannot start implementation work.",
    ["release_store_summary"],
  ),
];

export const buildMobileFactoryDryRunPromptDraft = (
  input: MobileFactoryDryRunInput,
  artifactChain: readonly MobileFactoryDryRunArtifactChain[],
): MobileFactoryDryRunPromptDraft => ({
  promptDraftId: `mobile_factory_prompt_draft:${input.dryRunId}`,
  title: "Future mobile build handoff prompt draft",
  draftPurpose: "Represent a future handoff prompt as review metadata only.",
  metadataOnlyBody: [
    `Idea: ${input.ideaText}`,
    `App type: ${input.expectedAppType}`,
    `MVP scope: ${input.expectedMvpScope.join(", ")}`,
    `Artifacts available: ${artifactChain.map((artifact) => artifact.artifactId).join(", ")}`,
    "Human approval is required before any implementation phase.",
  ],
  safeToUseForExecution: false,
  requiredApprovalsBeforeUse: uniqueStrings([...input.requiredApprovals, "implementation_handoff_approval"]),
  limitations: ["metadata_only_prompt_draft", "not_a_build_instruction", "not_authorized_for_runtime_use"],
  safetyBoundaries: promptSafety(),
});

export const runMobileFactoryFirstDryRun = (
  input: MobileFactoryDryRunInput = createMobileFactoryDryRunInput(),
): MobileFactoryDryRunOutput => {
  const artifactChain = buildArtifactChain(input);
  const promptDraftMetadataOnly = buildMobileFactoryDryRunPromptDraft(input, artifactChain);
  const unresolvedQuestions = [
    "Does the app require accounts or can the first MVP remain local-first?",
    "What progress data should be retained, exported, or deleted?",
    "How should reminders avoid pressure or manipulative habit loops?",
    "Which premium capabilities belong outside MVP?",
    "What privacy/rating disclosures are required before release planning?",
  ];

  return {
    outputId: `mobile_factory_dry_run_output:${input.dryRunId}`,
    intakeSummary: "Simple habit-world idea classified as a gamified habit app with reminders and future premium scope.",
    requirementsSummary: "Requirements split into MVP habit tracking, Beta richer progress, and Release privacy/store readiness.",
    featureBlueprintSummary: "Feature metadata covers onboarding, habits, check-ins, progress world, reminders, settings, and premium preview.",
    screenBlueprintSummary: "Screen metadata covers onboarding, list, check-in, dashboard, settings, offline recovery, and premium preview.",
    apiContractSummary: "Contract candidates cover habit CRUD posture, progress summaries, reminder preferences, and premium status labels.",
    designSystemSummary: "Design metadata suggests accessible progress, calm gamification, reduced motion posture, and reusable mobile components.",
    qualitySummary:
      "State, offline, security, performance, testing, analytics, notifications, and safety checks remain advisory evidence.",
    releaseStoreSummary:
      "Release and store readiness metadata captures privacy/rating posture, release notes, compliance review, and approval gates.",
    unresolvedQuestions,
    recommendedNextArtifact: "Phase PILOT-3B - Conversational Build Loop Dry-Run Plan",
    safeToGenerateCodexPrompt: false,
    promptDraftMetadataOnly,
    riskLevel: highestRisk([input.riskLevel, "medium"]),
    requiredApprovals: uniqueStrings([...input.requiredApprovals, ...promptDraftMetadataOnly.requiredApprovalsBeforeUse]),
    artifactChain,
    safetyBoundaries: input.safetyBoundaries,
  };
};

export const evaluateMobileFactoryDryRunSuccess = (output: MobileFactoryDryRunOutput): boolean =>
  output.artifactChain.length >= 8 &&
  output.artifactChain.every((artifact) => artifact.status === "simulated") &&
  output.promptDraftMetadataOnly.safeToUseForExecution === false &&
  output.safeToGenerateCodexPrompt === false &&
  output.safetyBoundaries.noFileWritesFromSource === true &&
  output.safetyBoundaries.noAppGeneration === true &&
  output.safetyBoundaries.noCodexRun === true;

export const summarizeMobileFactoryDryRun = (
  input: MobileFactoryDryRunInput,
  output: MobileFactoryDryRunOutput,
): MobileFactoryDryRunSummary => {
  const simulatedArtifactCount = output.artifactChain.filter((artifact) => artifact.status === "simulated").length;
  const blockedArtifactCount = output.artifactChain.filter((artifact) => artifact.status === "blocked").length;
  const successEvaluationPassed = evaluateMobileFactoryDryRunSuccess(output);

  return {
    dryRunId: input.dryRunId,
    outputId: output.outputId,
    artifactCount: output.artifactChain.length,
    simulatedArtifactCount,
    blockedArtifactCount,
    unresolvedQuestionCount: output.unresolvedQuestions.length,
    safeToGenerateCodexPrompt: output.safeToGenerateCodexPrompt,
    promptDraftIsMetadataOnly: output.promptDraftMetadataOnly.safeToUseForExecution === false,
    successEvaluationPassed,
    highestRiskLevel: highestRisk([input.riskLevel, output.riskLevel]),
    safeSummary: `Mobile Factory first dry-run simulated ${simulatedArtifactCount} artifact(s) with ${output.unresolvedQuestions.length} unresolved question(s).`,
    safetyBoundaries: output.safetyBoundaries,
  };
};

export const createDefaultMobileFactoryDryRunScenario = (): MobileFactoryDryRunScenario => {
  const input = createMobileFactoryDryRunInput();

  return {
    scenarioId: "mobile_factory_scenario:habit_world_v1",
    name: "Gamified habit world first dry-run",
    input,
    expectedOutputNotes: [
      "intake_summary_present",
      "requirements_summary_present",
      "feature_and_screen_summaries_present",
      "api_design_quality_release_store_summaries_present",
      "prompt_draft_metadata_only",
    ],
    successCriteria: [
      "artifact_chain_complete",
      "prompt_draft_not_usable_for_execution",
      "unresolved_questions_preserved",
      "risk_and_approval_metadata_present",
      "no_runtime_side_effects",
    ],
    limitations: ["synthetic_fixture", "metadata_only", "no_real_mobile_target", "no_runtime_evidence"],
    safetyBoundaries: input.safetyBoundaries,
  };
};
