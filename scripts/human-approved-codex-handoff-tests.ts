import {
  createHumanApprovedCodexHandoff,
  createHumanApprovedCodexHandoffPackage,
  evaluateHumanApprovedCodexHandoff,
  markHandoffApprovedForCopy,
  selectBlockingHandoffIssues,
  summarizeHumanApprovedCodexHandoff,
} from "../src/autopilot/humanApprovedCodexHandoff.ts";
import {
  humanApprovedCodexExpectedApprovalChecklistFixture,
  humanApprovedCodexHandoffInputFixture,
  humanApprovedCodexMissingSectionsFixture,
  humanApprovedCodexSamplePromptDraftFixture,
  humanApprovedCodexUnsafeSafetyFixture,
} from "../src/autopilot/humanApprovedCodexHandoffFixtures.ts";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const basePackage = createHumanApprovedCodexHandoffPackage(
  humanApprovedCodexHandoffInputFixture,
);

assert(basePackage.handoffId.length > 0, "handoff package should have an id");
assert(basePackage.safeToCopy === false, "unreviewed package should not be copy-ready");
assert(basePackage.safeToExecute === false, "package must never be action-ready");
assert(basePackage.requiresHumanApproval === true, "package must require human approval");
assert(basePackage.safetyChecklist.length >= 7, "safety checklist should be populated");
assert(
  humanApprovedCodexExpectedApprovalChecklistFixture.every((category) =>
    basePackage.safetyChecklist.some((item) => item.category === category),
  ),
  "expected safety checklist categories should exist",
);

const missingSectionsPackage = createHumanApprovedCodexHandoffPackage({
  ...humanApprovedCodexHandoffInputFixture,
  completenessChecklist: humanApprovedCodexMissingSectionsFixture,
  approvalStatus: "approved_for_copy",
});

assert(
  missingSectionsPackage.approvalStatus === "blocked",
  "missing required sections should block approval",
);
assert(
  selectBlockingHandoffIssues(missingSectionsPackage).length > 0,
  "missing sections should be reported as blocking issues",
);

const unsafePackage = createHumanApprovedCodexHandoffPackage({
  ...humanApprovedCodexHandoffInputFixture,
  safetyChecklist: humanApprovedCodexUnsafeSafetyFixture,
  approvalStatus: "approved_for_copy",
});

assert(unsafePackage.approvalStatus === "blocked", "unsafe wording should block approval");
assert(unsafePackage.safeToCopy === false, "blocked package should not be copy-ready");

const copyApprovedPackage = markHandoffApprovedForCopy(basePackage);
const copyDecision = evaluateHumanApprovedCodexHandoff(copyApprovedPackage);

assert(
  copyApprovedPackage.approvalStatus === "approved_for_copy",
  "clean package should support manual-copy approval",
);
assert(copyApprovedPackage.safeToCopy === true, "manual-copy approval should set safeToCopy");
assert(copyApprovedPackage.safeToExecute === false, "manual-copy approval must not enable actions");
assert(copyDecision.safeToCopy === true, "decision should allow manual copy after approval");
assert(copyDecision.safeToExecute === false, "decision must keep action-ready flag false");
assert(copyDecision.requiresHumanApproval === true, "decision must keep human approval required");

const fullHandoff = createHumanApprovedCodexHandoff({
  ...humanApprovedCodexHandoffInputFixture,
  promptDraft: humanApprovedCodexSamplePromptDraftFixture,
});
const summary = summarizeHumanApprovedCodexHandoff({
  handoff: fullHandoff.handoff,
  decision: fullHandoff.decision,
});

assert(summary.summaryId.length > 0, "summary should have an id");
assert(summary.safeToExecute === false, "summary must keep action-ready flag false");
assert(fullHandoff.noCodexInvocation === true, "handoff must remain no-invocation");
assert(fullHandoff.noProviderCalls === true, "handoff must not call providers");
assert(fullHandoff.noFilesystemWrites === true, "handoff must not write project files");
assert(fullHandoff.noDashboardMutation === true, "handoff must not mutate dashboard");
assert(fullHandoff.noMemoryPersistence === true, "handoff must not persist memory");

console.log("Human-approved Codex handoff smoke tests passed");
console.log(`Safety checks: ${basePackage.safetyChecklist.length}`);
console.log(`Completeness checks: ${basePackage.completenessChecklist.length}`);
console.log(`Blocking issues in approved fixture: ${copyDecision.blockingIssues.length}`);
