import assert from "node:assert/strict";
import {
  autopilotDryRunScenarioMatrix,
  evaluateDryRunQualityGates,
  evaluatePromptCompletenessGate,
  summarizeAutopilotDryRunHardening,
} from "../src/autopilot/index.js";

const requiredScenarioIds = [
  "happy_path_b_to_i",
  "happy_path_i_to_next_b",
  "implementation_missing_commit_push",
  "dirty_files_outside_scope_unstaged",
  "dirty_files_outside_scope_staged",
  "forbidden_files_modified",
  "failed_typecheck",
  "failed_smoke_tests",
  "forbidden_grep_failure",
  "memory_proposal_requires_approval",
  "closeout_blocked",
  "prompt_draft_missing_required_sections",
] as const;

assert.equal(autopilotDryRunScenarioMatrix.length, requiredScenarioIds.length);
for (const scenarioId of requiredScenarioIds) {
  assert.ok(
    autopilotDryRunScenarioMatrix.some(
      (scenario) => scenario.scenarioId === scenarioId,
    ),
  );
}

const byId = (scenarioId: (typeof requiredScenarioIds)[number]) => {
  const scenario = autopilotDryRunScenarioMatrix.find(
    (item) => item.scenarioId === scenarioId,
  );
  assert.ok(scenario);
  return scenario;
};

const happy = evaluateDryRunQualityGates(byId("happy_path_b_to_i"));
assert.equal(happy.result.validationSummary.status, "passed");
assert.equal(happy.result.nextActionRecommendation.nextAction, "continue_to_I_phase");
assert.equal(happy.result.closeoutStatus, "completed_local_only");
assert.equal(happy.result.nextActionRecommendation.handoffAllowed, true);

const dirtyUnstaged = evaluateDryRunQualityGates(
  byId("dirty_files_outside_scope_unstaged"),
);
assert.equal(dirtyUnstaged.result.nextActionRecommendation.alertLevel, "mild_alert");
assert.equal(dirtyUnstaged.result.nextActionRecommendation.nextAction, "continue_to_I_phase");

const dirtyStaged = evaluateDryRunQualityGates(
  byId("dirty_files_outside_scope_staged"),
);
assert.equal(dirtyStaged.result.validation.status, "blocked");
assert.equal(dirtyStaged.result.nextActionRecommendation.nextAction, "blocked");

const forbidden = evaluateDryRunQualityGates(byId("forbidden_files_modified"));
assert.equal(forbidden.result.validation.status, "blocked");
assert.equal(forbidden.result.closeoutStatus, "unsafe_scope");

const failedTypecheck = evaluateDryRunQualityGates(byId("failed_typecheck"));
assert.equal(failedTypecheck.result.validation.status, "failed");
assert.ok(
  failedTypecheck.result.nextActionRecommendation.nextAction === "retry_phase" ||
    failedTypecheck.result.nextActionRecommendation.nextAction === "request_human_review",
);

const failedSmoke = evaluateDryRunQualityGates(byId("failed_smoke_tests"));
assert.equal(failedSmoke.result.validation.status, "failed");
assert.ok(
  failedSmoke.result.nextActionRecommendation.nextAction === "retry_phase" ||
    failedSmoke.result.nextActionRecommendation.nextAction === "request_human_review",
);

const memory = evaluateDryRunQualityGates(
  byId("memory_proposal_requires_approval"),
);
assert.equal(memory.result.memoryProposal.status, "proposed");
assert.equal(memory.result.memoryProposal.noMemoryPersistence, true);
assert.equal(memory.result.memoryProposal.requiresHumanApproval, true);

const promptMissingScenario = byId("prompt_draft_missing_required_sections");
assert.ok(promptMissingScenario.simulatedHumanFacingResponseSkeleton);
const promptMissing = evaluateDryRunQualityGates(promptMissingScenario);
const promptGate = evaluatePromptCompletenessGate({
  scenario: promptMissingScenario,
  result: promptMissing.result,
  humanFacingResponseSkeleton:
    promptMissingScenario.simulatedHumanFacingResponseSkeleton,
});
assert.equal(promptGate.status, "blocked");

const skeleton = happy.result.humanFacingResponseSkeleton;
assert.ok(skeleton.includes("1. Alerta"));
assert.ok(skeleton.includes("2. Siguiente fase"));
assert.ok(skeleton.includes("3. Modelo recomendado"));
assert.ok(skeleton.includes("4. Prompt listo para Codex"));

for (const evaluation of autopilotDryRunScenarioMatrix.map(
  evaluateDryRunQualityGates,
)) {
  assert.equal(evaluation.result.noExecution, true);
  assert.equal(evaluation.result.noCodexInvocation, true);
  assert.equal(evaluation.result.noProviderCalls, true);
  assert.equal(evaluation.result.noDashboardMutation, true);
  assert.equal(evaluation.result.noGitMutationFromSource, true);
  assert.equal(evaluation.result.noMemoryPersistence, true);
}

const summary = summarizeAutopilotDryRunHardening();
assert.equal(summary.metadataOnly, true);
assert.equal(summary.noExecution, true);
assert.equal(summary.failedCount, 0);
assert.ok(summary.blockedCount >= 1);

console.log("12/12 Autopilot dry-run hardening smoke tests passed");
