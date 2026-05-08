import type { CodexHandoffContract } from "./codexHandoff.js";
import { renderCodexPromptFromHandoff } from "./codexPromptRenderer.js";
import {
  renderExpectedCodexReportSchema,
  type ExpectedCodexReportSchema,
} from "./codexReportSchema.js";
import {
  createHandoffValidationChecklist,
  type HandoffValidationChecklist,
} from "./handoffValidationChecklist.js";
import {
  recommendNextAutopilotAction,
  type AutopilotNextActionRecommendation,
} from "./nextAutopilotAction.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type {
  AutopilotBoundarySet,
  AutopilotTaskMetadata,
} from "./types.js";

export interface CodexHandoffRunnerInput {
  task: AutopilotTaskMetadata;
  handoff: CodexHandoffContract;
  nextPhase: string;
  recommendedModel?: string;
}

export interface CodexHandoffPackage {
  packageId: string;
  promptMarkdown: string;
  handoffMetadata: CodexHandoffContract;
  expectedReportSchema: ExpectedCodexReportSchema;
  validationChecklist: HandoffValidationChecklist;
  nextStageRecommendation: AutopilotNextActionRecommendation;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noCodexInvocation: true;
  noExecution: true;
  noFilesystemWrite: true;
  noProviderCalls: true;
  noNetwork: true;
  noDashboardMutation: true;
  boundaries: AutopilotBoundarySet;
}

export function prepareCodexHandoffPackage(
  input: CodexHandoffRunnerInput,
): CodexHandoffPackage {
  const prompt = renderCodexPromptFromHandoff(input.handoff);
  const expectedReportSchema = renderExpectedCodexReportSchema(input.handoff);
  const validationChecklist = createHandoffValidationChecklist(input.handoff);
  const taskNotApproved = input.task.state !== "approved";

  return {
    packageId: `${input.handoff.handoffId}:package`,
    promptMarkdown: prompt.promptMarkdown,
    handoffMetadata: input.handoff,
    expectedReportSchema,
    validationChecklist,
    nextStageRecommendation: recommendNextAutopilotAction({
      currentPhase: input.handoff.phase,
      nextPhase: input.nextPhase,
      taskState: input.task.state,
      riskLevel: input.task.riskLevel,
      blockedBy: taskNotApproved
        ? ["Task metadata is not approved for human-mediated handoff."]
        : [],
      prerequisites: [
        "Human reviews generated prompt.",
        "Human confirms scope and safety boundaries.",
      ],
      recommendedModel: input.recommendedModel ?? "Codex",
    }),
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noCodexInvocation: true,
    noExecution: true,
    noFilesystemWrite: true,
    noProviderCalls: true,
    noNetwork: true,
    noDashboardMutation: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
