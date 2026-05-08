import assert from "node:assert/strict";
import {
  buildAutopilotDryRunPromptDraft,
  buildAutopilotRealDryRunInput,
  evaluateAutopilotDryRunSuccess,
  runAutopilotRealDryRun,
  summarizeAutopilotRealDryRun,
} from "../src/autopilot/index.js";

const input = buildAutopilotRealDryRunInput();
assert.equal(input.metadataOnly, true);
assert.equal(input.noExecution, true);
assert.equal(input.workspace.stagedFiles.length, 0);

const result = runAutopilotRealDryRun(input);
assert.equal(result.metadataOnly, true);
assert.equal(result.noExecution, true);
assert.equal(result.noCodexInvocation, true);
assert.equal(result.handoffPackage.metadataOnly, true);
assert.equal(result.handoffPackage.noCodexInvocation, true);
assert.ok(result.handoffPackage.promptMarkdown.length > 0);

assert.equal(result.validationSummary.status, "passed");
assert.equal(result.validationSummary.findingCount, 0);
assert.equal(result.memoryProposal.status, "proposed");
assert.equal(result.memoryProposal.noMemoryPersistence, true);
assert.equal(result.memoryProposal.requiresHumanApproval, true);
assert.equal(result.learningRules.metadataOnly, true);

assert.equal(result.nextActionRecommendation.nextAction, "continue_to_I_phase");
assert.equal(result.nextActionRecommendation.noCodexInvocation, true);
assert.equal(result.nextActionRecommendation.memoryWriteAllowed, false);

assert.equal(result.closeoutStatus, "completed_local_only");
assert.equal(result.closeoutResult.noGitMutationFromSource, true);
assert.equal(result.closeoutResult.noMemoryPersistence, true);

const skeleton = result.humanFacingResponseSkeleton;
assert.ok(skeleton.includes("1. Alerta"));
assert.ok(skeleton.includes("2. Siguiente fase"));
assert.ok(skeleton.includes("3. Modelo recomendado"));
assert.ok(skeleton.includes("4. Prompt listo para Codex"));

assert.ok(result.nextCodexPromptDraft.promptMarkdown.length > 0);
assert.equal(result.nextCodexPromptDraft.metadataOnly, true);
assert.equal(result.nextCodexPromptDraft.noCodexInvocation, true);
assert.equal(result.nextCodexPromptDraft.noExecution, true);
assert.equal(result.successStatus, "passed");

const rebuiltDraft = buildAutopilotDryRunPromptDraft({
  dryRunId: input.dryRunId,
  handoffPackage: result.handoffPackage,
  nextActionRecommendation: result.nextActionRecommendation,
});
assert.equal(rebuiltDraft.sourcePackageRef, result.handoffPackage.packageId);

const success = evaluateAutopilotDryRunSuccess({
  validationSummary: result.validationSummary,
  memoryProposal: result.memoryProposal,
  learningRules: result.learningRules,
  nextActionRecommendation: result.nextActionRecommendation,
  closeoutResult: result.closeoutResult,
  nextCodexPromptDraft: result.nextCodexPromptDraft,
});
assert.equal(success, "passed");

const summary = summarizeAutopilotRealDryRun(result);
assert.equal(summary.successStatus, "passed");
assert.equal(summary.promptDraftAvailable, true);
assert.equal(summary.noExecution, true);

console.log("9/9 Autopilot real dry-run smoke tests passed");
