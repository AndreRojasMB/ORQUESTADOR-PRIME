import {
  createControlledCodexNormalizedReport,
  createControlledCodexReportCloseout,
  createControlledCodexReportReturn,
  validateControlledCodexReportReturn,
  type ControlledCodexNormalizedReport,
  type ControlledCodexReportCloseout,
  type ControlledCodexReportReturn,
  type ControlledCodexReportReturnInput,
  type ControlledCodexReportValidation,
} from "./controlledCodexReportReturn.js";

export const controlledCodexReportReturnAllowedFilesFixture = [
  "docs/sample-mobile-idea-blueprint-dry-run-plan.md",
  "docs/sample-mobile-idea-blueprint-boundaries.md",
] as const;

export const controlledCodexReportReturnForbiddenFilesFixture = [
  "package.json",
  ".github/*",
  "src/whatsapp/*",
  "src/viernesBridge/*",
  "src/integrations/*",
  "dashboard/*",
  "providers/*",
] as const;

export const controlledCodexReportReturnInputFixture: ControlledCodexReportReturnInput = {
  reportReturnId: "controlled_codex_report_return:trial_1b_success",
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

export const controlledCodexNormalizedReportFixture: ControlledCodexNormalizedReport =
  createControlledCodexNormalizedReport({
    reportText: controlledCodexReportReturnInputFixture.reportText,
  });

export const controlledCodexReportValidationFixture: ControlledCodexReportValidation =
  validateControlledCodexReportReturn({
    reportReturn: controlledCodexReportReturnInputFixture,
    normalizedReport: controlledCodexNormalizedReportFixture,
    allowedFiles: controlledCodexReportReturnAllowedFilesFixture,
    forbiddenFiles: controlledCodexReportReturnForbiddenFilesFixture,
    previousDirtyFiles: ["package.json"],
    currentDirtyFiles: ["package.json"],
    stagedFiles: [],
  });

export const controlledCodexReportCloseoutFixture: ControlledCodexReportCloseout =
  createControlledCodexReportCloseout({
    reportReturn: controlledCodexReportReturnInputFixture,
    normalizedReport: controlledCodexNormalizedReportFixture,
    validation: controlledCodexReportValidationFixture,
  });

export const controlledCodexReportReturnSuccessFixture: ControlledCodexReportReturn =
  createControlledCodexReportReturn({
    reportReturn: controlledCodexReportReturnInputFixture,
    normalizedReport: controlledCodexNormalizedReportFixture,
    allowedFiles: controlledCodexReportReturnAllowedFilesFixture,
    forbiddenFiles: controlledCodexReportReturnForbiddenFilesFixture,
    previousDirtyFiles: ["package.json"],
    currentDirtyFiles: ["package.json"],
    stagedFiles: [],
  });

export const controlledCodexMildAlertReportInputFixture: ControlledCodexReportReturnInput = {
  ...controlledCodexReportReturnInputFixture,
  reportReturnId: "controlled_codex_report_return:trial_1b_mild_alert",
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

export const controlledCodexMildAlertReportFixture: ControlledCodexReportReturn =
  createControlledCodexReportReturn({
    reportReturn: controlledCodexMildAlertReportInputFixture,
    allowedFiles: controlledCodexReportReturnAllowedFilesFixture,
    forbiddenFiles: controlledCodexReportReturnForbiddenFilesFixture,
    previousDirtyFiles: ["package.json"],
    currentDirtyFiles: ["package.json"],
    stagedFiles: [],
  });

export const controlledCodexBlockedReportInputFixture: ControlledCodexReportReturnInput = {
  ...controlledCodexReportReturnInputFixture,
  reportReturnId: "controlled_codex_report_return:trial_1b_blocked",
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

export const controlledCodexBlockedReportFixture: ControlledCodexReportReturn =
  createControlledCodexReportReturn({
    reportReturn: controlledCodexBlockedReportInputFixture,
    allowedFiles: controlledCodexReportReturnAllowedFilesFixture,
    forbiddenFiles: controlledCodexReportReturnForbiddenFilesFixture,
    previousDirtyFiles: [],
    currentDirtyFiles: ["package.json"],
    stagedFiles: ["package.json"],
  });
