import {
  conversationalBuildLoopDefaultInputFixture,
  conversationalBuildLoopExpectedStageIdsFixture,
} from "../src/autopilot/conversationalBuildLoopFixtures.ts";
import {
  createConversationalBuildLoopInput,
  evaluateConversationalBuildLoopSuccess,
  runConversationalBuildLoopDryRun,
  summarizeConversationalBuildLoopDryRun,
} from "../src/autopilot/conversationalBuildLoopDryRun.ts";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const input = createConversationalBuildLoopInput();
const output = runConversationalBuildLoopDryRun(input);
const summary = summarizeConversationalBuildLoopDryRun({
  outputId: output.outputId,
  dryRunInput: input,
  stages: output.stages,
  artifactChain: output.artifactChain,
  promptDraftMetadata: output.promptDraftMetadata,
  successEvaluation: output.successEvaluation,
});
const evaluation = evaluateConversationalBuildLoopSuccess({
  conversationDryRunId: input.conversationDryRunId,
  stages: output.stages,
  artifactChain: output.artifactChain,
  promptDraftMetadata: output.promptDraftMetadata,
  requiredApprovals: input.requiredApprovals,
});

const stageIds = output.stages.map((stage) => stage.stageId);

assert(conversationalBuildLoopDefaultInputFixture.userIdeaText.length > 0, "default fixture must include an idea");
assert(input.conversationDryRunId === conversationalBuildLoopDefaultInputFixture.conversationDryRunId, "input must use default fixture id");
assert(conversationalBuildLoopExpectedStageIdsFixture.every((stageId) => stageIds.includes(stageId)), "all required stages must exist");
assert(output.artifactChain.artifacts.length >= conversationalBuildLoopExpectedStageIdsFixture.length, "artifact chain must exist");
assert(output.artifactChain.unresolvedQuestions.length >= 5, "unresolved questions must remain explicit");
assert(output.promptDraftMetadata.promptDraftId.length > 0, "prompt draft must exist");
assert(output.promptDraftMetadata.safeToUseForExecution === false, "prompt draft must not be usable for action");
assert(output.promptDraftMetadata.requiresHumanApproval === true, "prompt draft must require human approval");
assert(output.successEvaluation.status === "passed", "success evaluation must pass");
assert(evaluation.status === "passed", "standalone evaluation must pass");
assert(summary.successStatus === "passed", "summary must report pass");
assert(output.noCodexInvocation === true, "dry-run must not invoke Codex");
assert(output.noProviderCalls === true, "dry-run must not call providers");
assert(output.noFilesystemWrites === true, "dry-run must not write files from source");
assert(output.noDashboardMutation === true, "dry-run must not mutate dashboard");
assert(output.noMemoryPersistence === true, "dry-run must not persist memory");
assert(output.boundaries.noOpenClawExecution === true, "dry-run must not run OpenClaw");
assert(output.boundaries.noWhatsAppOutbound === true, "dry-run must not send WhatsApp outbound messages");

console.log("Conversational Build Loop dry-run smoke tests passed");
console.log(`Stages: ${output.stages.length}`);
console.log(`Artifacts: ${output.artifactChain.artifacts.length}`);
console.log(`Unresolved questions: ${output.artifactChain.unresolvedQuestions.length}`);
