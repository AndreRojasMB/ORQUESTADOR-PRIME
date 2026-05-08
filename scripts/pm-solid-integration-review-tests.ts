import assert from "node:assert/strict";
import {
  buildPmSolidIntegrationReport,
  buildPmSolidReadinessSummary,
  createPmSolidRiskEscalation,
  recommendPost120NextStep,
  summarizeBlock101120Readiness,
  type PmSolidIntegrationInput,
} from "../src/pm/index.js";
import type { PMEvidenceReference } from "../src/pm/index.js";

const evidenceRef: PMEvidenceReference = {
  evidenceId: "evidence:pm-solid-integration:120I",
  label: "PM/SOLID integration review evidence",
  reference: "docs/pm-solid-integration-review.md",
  referenceType: "doc",
  safeSummary: "Caller-supplied evidence for the PM/SOLID integration smoke test.",
  metadataOnly: true,
  noFileRead: true,
};

const escalation = createPmSolidRiskEscalation({
  sourceFindingRef: "solid_finding:120I:metadata",
  sourceReportRef: "architecture_report:120I:smoke",
  severity: "high",
  evidenceRefs: [evidenceRef],
});
assert.equal(escalation.reportOnly, true);
assert.equal(escalation.noRuntimeExecution, true);
assert.equal(escalation.humanReviewRequired, true);

const pmReadiness = buildPmSolidReadinessSummary({
  area: "pm_core",
  completedRefs: ["pm_core:101_110"],
  evidenceRefs: [evidenceRef],
});
assert.equal(pmReadiness.status, "ready");
assert.equal(pmReadiness.noExecution, true);

const solidReadiness = buildPmSolidReadinessSummary({
  area: "solid_core",
  completedRefs: ["solid_core:111_119"],
  warningRefs: [escalation.escalationId],
  evidenceRefs: [evidenceRef],
});
const autopilotReadiness = buildPmSolidReadinessSummary({
  area: "autopilot_support",
  completedRefs: ["autopilot_support:26G_26K"],
  evidenceRefs: [evidenceRef],
});
const envelopeReadiness = buildPmSolidReadinessSummary({
  area: "report_envelopes",
  completedRefs: ["report_envelopes:119I"],
  evidenceRefs: [evidenceRef],
});

const blockReview = summarizeBlock101120Readiness({
  pmCoreReadiness: pmReadiness,
  solidCoreReadiness: solidReadiness,
  autopilotSupportReadiness: autopilotReadiness,
  reportEnvelopeReadiness: envelopeReadiness,
  safeNextBlockTarget: "Phase 121B",
  evidenceRefs: [evidenceRef],
});
assert.equal(blockReview.status, "ready_with_warnings");
assert.equal(blockReview.safeNextBlockTarget, "Phase 121B");
assert.equal(blockReview.optionalPilotRecommendation.requiresSeparatePlan, true);

const nextStep = recommendPost120NextStep(blockReview);
assert.equal(nextStep.nextPhase, "Phase 121B");
assert.equal(nextStep.noExecution, true);

const integrationInput: PmSolidIntegrationInput = {
  integrationId: "pm_solid_integration:120I:smoke",
  phaseRef: "Phase 120I",
  pmReportEnvelopeRefs: ["pm_report_envelope:119I"],
  architectureReportEnvelopeRefs: ["architecture_report_envelope:119I"],
  autopilotCloseoutRefs: ["autopilot_closeout:26K"],
  autopilotStatusRefs: ["autopilot_status:next_action"],
  evidenceRefs: [evidenceRef],
  metadataOnly: true,
  callerSuppliedOnly: true,
  noFileRead: true,
  noRuntimeExecution: true,
  noProviderCalls: true,
  noDashboardMutation: true,
  noMemoryPersistence: true,
  noCiActivation: true,
};
const integrationReport = buildPmSolidIntegrationReport(integrationInput);
assert.equal(integrationReport.reportOnly, true);
assert.equal(integrationReport.callerSuppliedOnly, true);
assert.equal(integrationReport.readinessReview.safeNextBlockTarget, "Phase 121B");
assert.equal(integrationReport.noCiActivation, true);
assert.equal(integrationReport.noProviderCalls, true);
assert.equal(integrationReport.noDashboardMutation, true);
assert.equal(integrationReport.noMemoryPersistence, true);

console.log("5/5 PM/SOLID integration review smoke tests passed");
