import {
  createEndToEndManualAction,
  createEndToEndManualLoopTrial,
  selectBlockedEndToEndStages,
  selectRequiredManualActions,
  validateEndToEndManualLoopTrial,
} from "../src/autopilot/endToEndManualLoopTrial.ts";
import {
  endToEndManualLoopBlockedMissingApprovalFixture,
  endToEndManualLoopBlockedUnsafeReportFixture,
  endToEndManualLoopDefaultActionsFixture,
  endToEndManualLoopDefaultStagesFixture,
  endToEndManualLoopExpectedOutcomeFixture,
  endToEndManualLoopSuccessFixture,
  endToEndManualLoopTrialInputFixture,
} from "../src/autopilot/endToEndManualLoopFixtures.ts";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const requiredStages = [
  "create_dry_run",
  "generate_prompt_draft",
  "validate_handoff",
  "approve_for_copy",
  "manual_copy_to_codex",
  "manual_codex_execution",
  "manual_report_return",
  "normalize_report",
  "validate_report",
  "generate_next_action",
  "generate_closeout",
  "render_human_response",
] as const;

const requiredActions = [
  "copy_prompt",
  "paste_prompt_to_codex",
  "run_codex_manually",
  "paste_codex_report_back",
  "approve_next_phase",
] as const;

const stageNames = new Set(
  endToEndManualLoopDefaultStagesFixture.map((stage) => stage.stageName),
);
const actionTypes = new Set(
  endToEndManualLoopDefaultActionsFixture.map((action) => action.actionType),
);

for (const stage of requiredStages) {
  assert(stageNames.has(stage), `required stage missing: ${stage}`);
}

for (const action of requiredActions) {
  assert(actionTypes.has(action), `required action missing: ${action}`);
}

const successfulTrial = createEndToEndManualLoopTrial({
  trial: endToEndManualLoopTrialInputFixture,
  stages: endToEndManualLoopDefaultStagesFixture,
  manualActions: endToEndManualLoopDefaultActionsFixture,
  promptDraftPresent: true,
  handoffApprovedForCopy: true,
  safeToExecute: false,
  reportValidationStatus: "passed",
  closeoutStatus: "completed_local_only",
  nextActionProduced: true,
  sourceSideExecutionAbsent: true,
});

assert(successfulTrial.validation.validationStatus === "passed", "successful trial should pass");
assert(successfulTrial.validation.alertLevel === "no_alert", "successful trial should have no alert");
assert(successfulTrial.outcome.safeToContinue === true, "successful trial should continue");
assert(successfulTrial.outcome.trialStatus === "completed", "successful trial should complete");
assert(successfulTrial.noCodexInvocation === true, "must not invoke Codex");
assert(successfulTrial.noOpenClawInvocation === true, "must not operate OpenClaw");
assert(successfulTrial.noSystemCopyBuffer === true, "must not use system copy buffer");
assert(successfulTrial.noReportRetrieval === true, "must not retrieve external reports");
assert(successfulTrial.noProviderCalls === true, "must not call providers");
assert(successfulTrial.noFilesystemWrites === true, "must not write files");

assert(
  successfulTrial.outcome.nextRecommendedPhase ===
    endToEndManualLoopExpectedOutcomeFixture.nextRecommendedPhase,
  "successful trial should recommend expected next phase",
);

const manualOnlyStages = successfulTrial.stages.filter((stage) =>
  [
    "manual_copy_to_codex",
    "manual_codex_execution",
    "manual_report_return",
  ].includes(stage.stageName),
);
assert(
  manualOnlyStages.every((stage) => stage.automationAllowed === false),
  "manual stages must not allow automation",
);

const requiredManualActions = selectRequiredManualActions(successfulTrial.manualActions);
assert(requiredManualActions.length === requiredActions.length, "all manual actions should be required");

const blockedStages = selectBlockedEndToEndStages(successfulTrial.stages);
assert(blockedStages.length === 0, "successful fixture should have no blocked stages");

assert(
  endToEndManualLoopBlockedMissingApprovalFixture.validation.validationStatus === "blocked",
  "missing approval fixture should block",
);
assert(
  endToEndManualLoopBlockedMissingApprovalFixture.validation.blockers.includes(
    "blocked:handoff_not_approved_for_copy",
  ),
  "missing approval should produce handoff blocker",
);

assert(
  endToEndManualLoopBlockedUnsafeReportFixture.validation.validationStatus === "blocked",
  "unsafe report fixture should block",
);
assert(
  endToEndManualLoopBlockedUnsafeReportFixture.outcome.closeoutStatus === "unsafe_scope",
  "unsafe report should produce unsafe scope closeout",
);

const unsafePromptValidation = validateEndToEndManualLoopTrial({
  trial: endToEndManualLoopTrialInputFixture,
  stages: endToEndManualLoopDefaultStagesFixture,
  manualActions: endToEndManualLoopDefaultActionsFixture,
  promptDraftPresent: true,
  handoffApprovedForCopy: true,
  safeToExecute: true,
  reportValidationStatus: "passed",
  closeoutStatus: "completed_local_only",
  nextActionProduced: true,
  sourceSideExecutionAbsent: true,
});

assert(
  unsafePromptValidation.blockers.includes("blocked:prompt_marked_action_ready"),
  "action-ready prompt metadata should block",
);

const sourceSideActionValidation = validateEndToEndManualLoopTrial({
  trial: endToEndManualLoopTrialInputFixture,
  stages: endToEndManualLoopDefaultStagesFixture,
  manualActions: endToEndManualLoopDefaultActionsFixture,
  promptDraftPresent: true,
  handoffApprovedForCopy: true,
  safeToExecute: false,
  reportValidationStatus: "passed",
  closeoutStatus: "completed_local_only",
  nextActionProduced: true,
  sourceSideExecutionAbsent: false,
});

assert(
  sourceSideActionValidation.blockers.includes("blocked:source_side_external_action_claim"),
  "source-side external action claim should block",
);

const nonManualAction = createEndToEndManualAction({
  ...endToEndManualLoopDefaultActionsFixture[0]!,
  actionId: "end_to_end_action:copy_prompt_manual_override",
  completionClaim: "human_confirmed",
});

assert(nonManualAction.allowedAutomationLevel === "manual_only", "helper forces manual-only level");
assert(nonManualAction.requiredHuman === true, "helper forces human requirement");

console.log("End-to-end manual loop trial smoke tests passed");
console.log(`Stages: ${successfulTrial.summary.stageCount}`);
console.log(`Manual actions: ${successfulTrial.summary.manualActionCount}`);
console.log(`Validation: ${successfulTrial.validation.validationStatus}`);
