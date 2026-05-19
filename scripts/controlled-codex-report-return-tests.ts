import {
  createControlledCodexNormalizedReport,
  createControlledCodexReportCloseout,
  createControlledCodexReportReturn,
  evaluateControlledCodexReportReturnDecision,
  selectControlledReportBlockers,
  selectControlledReportWarnings,
  validateControlledCodexReportReturn,
  type ControlledCodexReportReturnInput,
} from "../src/autopilot/controlledCodexReportReturn.ts";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const allowedFiles = [
  "docs/sample-mobile-idea-blueprint-dry-run-plan.md",
  "docs/sample-mobile-idea-blueprint-boundaries.md",
] as const;

const forbiddenFiles = [
  "package.json",
  ".github/*",
  "src/whatsapp/*",
  "src/viernesBridge/*",
  "src/integrations/*",
  "dashboard/*",
  "providers/*",
] as const;

const successfulInput: ControlledCodexReportReturnInput = {
  reportReturnId: "controlled_codex_report_return:test_success",
  sourceHandoffRef: "human_approved_codex_handoff:habit_world_v1",
  sourceTrialRef: "manual_codex_handoff_trial:sample_mobile_idea_blueprint",
  reportText: [
    "Phase: TRIAL-1B - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN PLAN",
    "Files inspected: docs/human-approved-codex-prompt-handoff.md; docs/conversational-build-loop-dry-run.md",
    "Files modified: docs/sample-mobile-idea-blueprint-dry-run-plan.md; docs/sample-mobile-idea-blueprint-boundaries.md",
    "Summary: Sample mobile idea blueprint dry-run plan completed as metadata.",
    "Safety guarantees: source-only; advisory-only; metadata-only; no provider calls; no source-stage file writes",
    "Tests/scripts: docs smoke passed",
    "Commands executed: git status --short --branch passed; node node_modules/typescript/bin/tsc --noEmit passed; git diff --check passed",
    "Scope check: Allowed docs-only files modified; no staged external files.",
    "Forbidden grep: clean",
    "Commit/push: No commit. No push.",
    "Next recommended phase: TRIAL-1I - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN IMPLEMENTATION",
  ].join("\n"),
  expectedPhase: "TRIAL-1B - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN PLAN",
  expectedMode: "B",
  expectedBranch: "dev",
  receivedAtLabel: "human_supplied_report_label",
  submittedByHuman: true,
  riskLevel: "plan_only",
  limitations: ["human_submitted_report_only", "metadata_validation_only"],
};

const normalized = createControlledCodexNormalizedReport({
  reportText: successfulInput.reportText,
});

assert(normalized.phase === successfulInput.expectedPhase, "phase should normalize");
assert(normalized.filesInspected.length > 0, "files inspected should normalize");
assert(normalized.filesModified.length > 0, "files modified should normalize");
assert(normalized.metadataOnly === true, "normalized report is metadata only");

const successfulValidation = validateControlledCodexReportReturn({
  reportReturn: successfulInput,
  normalizedReport: normalized,
  allowedFiles,
  forbiddenFiles,
  previousDirtyFiles: ["package.json"],
  currentDirtyFiles: ["package.json"],
  stagedFiles: [],
});

assert(successfulValidation.validationStatus === "passed", "successful report should pass");
assert(successfulValidation.alertLevel === "no_alert", "successful report should have no alert");
assert(successfulValidation.blockers.length === 0, "successful report should have no blockers");

const closeout = createControlledCodexReportCloseout({
  reportReturn: successfulInput,
  normalizedReport: normalized,
  validation: successfulValidation,
});

assert(closeout.closeoutStatus === "completed_local_only", "B-mode report should close local only");
assert(closeout.safeToContinue === true, "clean closeout should continue");
assert(closeout.noMemoryPersistence === true, "closeout must not persist memory");

const decision = evaluateControlledCodexReportReturnDecision({
  reportReturn: successfulInput,
  validation: successfulValidation,
  closeout,
});

assert(decision.decisionStatus === "continue", "successful decision should continue");
assert(decision.safeToContinue === true, "successful decision should be safe to continue");

const successfulReturn = createControlledCodexReportReturn({
  reportReturn: successfulInput,
  normalizedReport: normalized,
  allowedFiles,
  forbiddenFiles,
  previousDirtyFiles: ["package.json"],
  currentDirtyFiles: ["package.json"],
  stagedFiles: [],
});

assert(successfulReturn.summary.safeToContinue === true, "successful return should be safe");
assert(successfulReturn.noCodexInvocation === true, "must not invoke Codex");
assert(successfulReturn.noExternalSessionRead === true, "must not read external sessions");
assert(successfulReturn.noOpenClawInvocation === true, "must not operate OpenClaw");
assert(successfulReturn.noSystemCopyBuffer === true, "must not use system copy buffer");
assert(successfulReturn.noProviderCalls === true, "must not call providers");
assert(successfulReturn.noFilesystemWrites === true, "must not write files");

const mildInput: ControlledCodexReportReturnInput = {
  ...successfulInput,
  reportReturnId: "controlled_codex_report_return:test_mild",
  reportText: [
    "Phase: TRIAL-1B - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN PLAN",
    "Files inspected: docs/human-approved-codex-prompt-handoff.md",
    "Files modified: docs/sample-mobile-idea-blueprint-dry-run-plan.md",
    "Summary: Sample mobile idea blueprint dry-run plan completed as metadata.",
    "Safety guarantees: source-only; advisory-only; metadata-only",
    "Tests/scripts: docs smoke passed",
    "Commands executed: git status --short --branch passed; git diff --check passed",
    "Scope check: Allowed docs-only files modified; no staged external files.",
    "Forbidden grep: clean",
    "Commit/push: No commit. No push.",
    "Next recommended phase: TRIAL-1I - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN IMPLEMENTATION",
    "Unresolved issues: Typecheck evidence should be added before implementation closeout.",
  ].join("\n"),
};

const mildReturn = createControlledCodexReportReturn({
  reportReturn: mildInput,
  allowedFiles,
  forbiddenFiles,
  previousDirtyFiles: ["package.json"],
  currentDirtyFiles: ["package.json"],
  stagedFiles: [],
});

assert(mildReturn.validation.validationStatus === "needs_review", "mild report should need review");
assert(mildReturn.validation.alertLevel === "mild_alert", "mild report should have mild alert");

const blockedInput: ControlledCodexReportReturnInput = {
  ...successfulInput,
  reportReturnId: "controlled_codex_report_return:test_blocked",
  reportText: [
    "Phase: WRONG PHASE",
    "Files inspected: package.json",
    "Files modified: package.json",
    "Summary: Blocked report claims package workflow changed.",
    "Safety guarantees: metadata-only",
    "Tests/scripts: docs smoke failed",
    "Commands executed: git status --short --branch passed",
    "Scope check: Forbidden file touched.",
    "Forbidden grep: violation reported",
    "Commit/push: No commit. No push.",
    "Next recommended phase: human review",
  ].join("\n"),
};

const blockedReturn = createControlledCodexReportReturn({
  reportReturn: blockedInput,
  allowedFiles,
  forbiddenFiles,
  previousDirtyFiles: [],
  currentDirtyFiles: ["package.json"],
  stagedFiles: ["package.json"],
});

assert(blockedReturn.validation.validationStatus === "blocked", "blocked report should block");
assert(blockedReturn.closeout.closeoutStatus === "unsafe_scope", "blocked scope should be unsafe");
assert(blockedReturn.decision.safeToContinue === false, "blocked report should not continue");

const selectedBlockers = selectControlledReportBlockers(blockedReturn.validation);
const selectedWarnings = selectControlledReportWarnings(mildReturn.validation);

assert(selectedBlockers.length > 0, "blocker selection should return blockers");
assert(selectedWarnings.length > 0, "warning selection should return warnings");

console.log("Controlled Codex report return smoke tests passed");
console.log(`Successful validation: ${successfulValidation.validationStatus}`);
console.log(`Mild validation: ${mildReturn.validation.validationStatus}`);
console.log(`Blocked validation: ${blockedReturn.validation.validationStatus}`);
