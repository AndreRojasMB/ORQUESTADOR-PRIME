import {
  buildMobileFactoryDryRunPromptDraft,
  createDefaultMobileFactoryDryRunScenario,
  createMobileFactoryDryRunInput,
  evaluateMobileFactoryDryRunSuccess,
  runMobileFactoryFirstDryRun,
  summarizeMobileFactoryDryRun,
} from "../src/pm/mobileFactoryDryRun.ts";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const scenario = createDefaultMobileFactoryDryRunScenario();
const input = createMobileFactoryDryRunInput();
const output = runMobileFactoryFirstDryRun(input);
const promptDraft = buildMobileFactoryDryRunPromptDraft(input, output.artifactChain);
const summary = summarizeMobileFactoryDryRun(input, output);
const success = evaluateMobileFactoryDryRunSuccess(output);

assert(scenario.input.dryRunId === input.dryRunId, "default scenario must use the default input");
assert(input.expectedAppType === "habit_gamified_app", "input must classify the habit-world idea");
assert(input.expectedCoreFlows.length >= 6, "input must include expected core flows");
assert(input.expectedMvpScope.includes("habit_check_in"), "input must include MVP check-in scope");
assert(output.outputId.includes(input.dryRunId), "output must reference input dry-run id");
assert(output.artifactChain.length >= 9, "output must include the expected artifact chain");
assert(output.artifactChain.every((artifact) => artifact.status === "simulated"), "artifacts must be simulated");
assert(output.unresolvedQuestions.length >= 5, "output must preserve unresolved questions");
assert(output.safeToGenerateCodexPrompt === false, "prompt should not be marked safe for use");
assert(output.promptDraftMetadataOnly.safeToUseForExecution === false, "prompt draft must be passive");
assert(promptDraft.safeToUseForExecution === false, "rebuilt prompt draft must remain passive");
assert(summary.successEvaluationPassed === true, "summary must show successful metadata dry-run");
assert(success === true, "success evaluation must pass");
assert(output.safetyBoundaries.noFileWritesFromSource === true, "dry-run must not write files from source");
assert(output.safetyBoundaries.noCodeGeneration === true, "dry-run must not create code");
assert(output.safetyBoundaries.noScreenGeneration === true, "dry-run must not create screens");
assert(output.safetyBoundaries.noAppGeneration === true, "dry-run must not create apps");
assert(output.safetyBoundaries.noBackendGeneration === true, "dry-run must not create backend behavior");
assert(output.safetyBoundaries.noEndpointGeneration === true, "dry-run must not create endpoints");
assert(output.safetyBoundaries.noCodexRun === true, "dry-run must not run Codex");
assert(output.safetyBoundaries.noProviderCalls === true, "dry-run must not call providers");
assert(output.safetyBoundaries.noNetwork === true, "dry-run must not use network");
assert(output.safetyBoundaries.noDashboardMutation === true, "dry-run must not mutate dashboard");
assert(output.safetyBoundaries.noMemoryPersistence === true, "dry-run must not persist memory");

console.log("Mobile Factory First Dry-Run smoke tests passed");
console.log(`Artifacts: ${output.artifactChain.length}`);
console.log(`Unresolved questions: ${output.unresolvedQuestions.length}`);
