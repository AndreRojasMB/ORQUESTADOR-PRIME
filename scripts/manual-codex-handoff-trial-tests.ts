import {
  createManualCodexHandoffTrial,
  createManualCodexHandoffTrialInput,
  evaluateManualCodexTrialOutcome,
  validateManualCodexTrialReport,
} from "../src/autopilot/manualCodexHandoffTrial.ts";
import {
  manualCodexApprovedHandoffPackageFixture,
  manualCodexBlockedReportFixture,
  manualCodexCopyStepFixture,
  manualCodexExpectedReportFixture,
  manualCodexExpectedValidationFixture,
  manualCodexSuccessfulReportFixture,
  manualCodexTrialInputFixture,
} from "../src/autopilot/manualCodexHandoffTrialFixtures.ts";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const createdInput = createManualCodexHandoffTrialInput();
assert(createdInput.trialId.length > 0, "trial input should have an id");
assert(createdInput.manualCopyRequired === true, "manual copy should be required");
assert(createdInput.codexExecutionManual === true, "Codex use should be marked manual");
assert(
  createdInput.expectedCodexReportShape.includes("phase"),
  "expected report shape should include phase",
);

assert(
  manualCodexCopyStepFixture.copiedByHuman === true,
  "copy step should record human-supplied copy evidence",
);
assert(
  manualCodexCopyStepFixture.executionNotAutomated === true,
  "copy step should remain not automated",
);
assert(
  manualCodexExpectedReportFixture.phase === manualCodexTrialInputFixture.targetPhase,
  "expected report phase should match target phase",
);

const successfulValidation = validateManualCodexTrialReport({
  trial: manualCodexTrialInputFixture,
  copyStep: manualCodexCopyStepFixture,
  handoffPackage: manualCodexApprovedHandoffPackageFixture,
  report: manualCodexSuccessfulReportFixture,
  expectedReport: manualCodexExpectedReportFixture,
  previousDirtyFiles: ["package.json"],
  currentDirtyFiles: ["package.json"],
  stagedFiles: [],
});

assert(
  successfulValidation.validationStatus === manualCodexExpectedValidationFixture.validationStatus,
  "successful report should pass validation",
);
assert(successfulValidation.alertLevel === "no_alert", "successful report should have no alert");
assert(
  successfulValidation.recommendedAction === "continue_to_I_phase",
  "successful B-mode trial should recommend matching implementation phase",
);

const blockedValidation = validateManualCodexTrialReport({
  trial: manualCodexTrialInputFixture,
  copyStep: manualCodexCopyStepFixture,
  handoffPackage: manualCodexApprovedHandoffPackageFixture,
  report: manualCodexBlockedReportFixture,
  expectedReport: manualCodexExpectedReportFixture,
  previousDirtyFiles: [],
  currentDirtyFiles: ["package.json"],
  stagedFiles: ["package.json"],
});

assert(blockedValidation.validationStatus === "blocked", "unsafe report should block");
assert(blockedValidation.blockers.length > 0, "blocked report should list blockers");

const completedTrial = createManualCodexHandoffTrial({
  trial: manualCodexTrialInputFixture,
  copyStep: manualCodexCopyStepFixture,
  expectedReport: manualCodexExpectedReportFixture,
  returnedReport: manualCodexSuccessfulReportFixture,
  handoffPackage: manualCodexApprovedHandoffPackageFixture,
  closeoutStatus: "completed_local_only",
  previousDirtyFiles: ["package.json"],
  currentDirtyFiles: ["package.json"],
  stagedFiles: [],
});

assert(completedTrial.outcome.safeToContinue === true, "completed trial should be safe to continue");
assert(completedTrial.summary.blockerCount === 0, "completed trial should have no blockers");
assert(completedTrial.noCodexInvocation === true, "trial must not start Codex from source");
assert(completedTrial.noProviderCalls === true, "trial must not call providers");
assert(completedTrial.noFilesystemWrites === true, "trial must not write project files");
assert(completedTrial.noDashboardMutation === true, "trial must not mutate dashboard");
assert(completedTrial.noMemoryPersistence === true, "trial must not persist memory");

const blockedOutcome = evaluateManualCodexTrialOutcome({
  trial: manualCodexTrialInputFixture,
  copyStep: manualCodexCopyStepFixture,
  report: manualCodexBlockedReportFixture,
  validation: blockedValidation,
  closeoutStatus: "unsafe_scope",
});

assert(blockedOutcome.trialStatus === "blocked", "blocked validation should block outcome");
assert(blockedOutcome.safeToContinue === false, "blocked outcome should not continue");

console.log("Manual Codex handoff trial smoke tests passed");
console.log(`Successful validation: ${successfulValidation.validationStatus}`);
console.log(`Blocked validation: ${blockedValidation.validationStatus}`);
console.log(`Completed trial status: ${completedTrial.outcome.trialStatus}`);
