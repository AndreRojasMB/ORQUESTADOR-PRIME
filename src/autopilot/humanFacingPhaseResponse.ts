import {
  coordinatorAlertLabel,
  type AutopilotCoordinatorHumanOutput,
  type AutopilotCoordinatorNextAction,
  type AutopilotCoordinatorPromptSeed,
  type AutopilotCoordinatorAlertLevel,
} from "./nextActionDecisionModel.js";

export interface HumanFacingPhaseResponseInput {
  alertLevel: AutopilotCoordinatorAlertLevel;
  nextPhase: string;
  reason: string;
  recommendedModel: string;
  promptSeed: AutopilotCoordinatorPromptSeed;
  nextAction: AutopilotCoordinatorNextAction;
}

export function buildHumanFacingPhaseResponse(
  input: HumanFacingPhaseResponseInput,
): AutopilotCoordinatorHumanOutput {
  const alertLabel = coordinatorAlertLabel(input.alertLevel);
  const promptLine = input.promptSeed.handoffAllowed
    ? `${input.promptSeed.promptTitle}: ${input.promptSeed.safeSummary}`
    : "No disponible hasta resolver revision o bloqueo.";
  const nextPhaseLine = `${input.nextPhase} - ${input.reason}`;
  const recommendedModelLine = input.recommendedModel;

  return {
    alertLabel,
    nextPhaseLine,
    recommendedModelLine,
    promptLine,
    skeleton: [
      "1. Alerta",
      alertLabel,
      "",
      "2. Siguiente fase",
      nextPhaseLine,
      "",
      "3. Modelo recomendado",
      recommendedModelLine,
      "",
      "4. Prompt listo para Codex",
      promptLine,
    ].join("\n"),
    metadataOnly: true,
    noExecution: true,
  };
}
