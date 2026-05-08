import assert from "node:assert/strict";
import {
  buildCiCompatibilityMetadata,
  buildSarifReadyMetadata,
  countEnvelopeSeverities,
  createPmReportEnvelope,
  createReportEnvelope,
  summarizeReportEnvelope,
  type PMReportEnvelopeInput,
  type ReportEnvelopeFinding,
  type ReportEnvelopeRecommendedNextAction,
} from "../src/pm/cli/report.js";
import {
  createArchitectureReportEnvelope,
  type ArchitectureReportEnvelopeInput,
} from "../src/architecture/cli/report.js";
import type { PMEvidenceReference } from "../src/pm/index.js";

const evidenceRef: PMEvidenceReference = {
  evidenceId: "evidence:pm-solid-envelope:119I",
  label: "PM/SOLID envelope smoke evidence",
  reference: "docs/pm-solid-ci-contract.md",
  referenceType: "doc",
  safeSummary: "Caller-supplied metadata evidence for report envelope smoke.",
  metadataOnly: true,
  noFileRead: true,
};

const nextAction: ReportEnvelopeRecommendedNextAction = {
  actionId: "report_envelope_action:119I:continue",
  label: "Continue to integration review planning",
  safeSummary: "Use the report envelope as advisory context for Phase 120B.",
  nextPhase: "Phase 120B",
  riskLevel: "low",
  requiresHumanApproval: false,
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
};

const finding: ReportEnvelopeFinding = {
  findingId: "report_envelope_finding:119I:metadata",
  source: "pm",
  title: "Envelope metadata finding",
  severity: "medium",
  status: "warning",
  summary: "Envelope carries advisory metadata only.",
  evidenceRefs: [evidenceRef],
  riskLevel: "medium",
  approvalRequired: false,
  metadataOnly: true,
  reportOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
  noExecution: true,
};

const ciCompatibility = buildCiCompatibilityMetadata({
  compatibilityId: "ci_compatibility:119I:smoke",
});
assert.equal(ciCompatibility.noCiActivation, true);
assert.equal(ciCompatibility.noPackageCommandChanges, true);
assert.equal(ciCompatibility.noArtifactPublication, true);

const sarifMetadata = buildSarifReadyMetadata({
  sarifMetadataId: "sarif_ready:119I:smoke",
  ruleIdPrefix: "orquestador.smoke",
});
assert.equal(sarifMetadata.noFileEmission, true);
assert.equal(sarifMetadata.noArtifactPublication, true);
assert.equal(sarifMetadata.severityMapping.high, "error");

const sharedEnvelope = createReportEnvelope({
  envelopeId: "report_envelope:119I:shared",
  source: "manual_metadata",
  reportKind: "pm_status",
  phaseRef: "Phase 119I",
  generatedAtLabel: "caller-supplied-smoke-label",
  status: "warning",
  severity: "medium",
  summary: "Shared envelope smoke metadata.",
  findings: [finding],
  evidenceRefs: [evidenceRef],
  limitations: ["Smoke input uses caller-provided metadata only."],
  recommendedNextAction: nextAction,
  ciCompatibility,
  sarifReadyMetadata: sarifMetadata,
});
assert.equal(sharedEnvelope.noCiActivation, true);
assert.equal(sharedEnvelope.noFileEmission, true);
assert.equal(sharedEnvelope.noExecution, true);

const pmInput: PMReportEnvelopeInput = {
  envelopeId: "report_envelope:119I:pm",
  reportKind: "pm_status",
  phaseRef: "Phase 119I",
  generatedAtLabel: "caller-supplied-pm-label",
  status: "passed",
  severity: "low",
  summary: "PM envelope smoke metadata.",
  recommendedNextAction: nextAction,
  pmReportRef: "pm_report:119I:smoke",
  projectStateRef: "project_state:orquestador-prime",
  milestoneRef: "milestone:post-100",
  blockers: [],
  risks: ["risk:metadata-only"],
  approvals: [],
  dodGaps: [],
  evidenceRefs: [evidenceRef],
};
const pmEnvelope = createPmReportEnvelope(pmInput);
assert.equal(pmEnvelope.source, "pm");
assert.equal(pmEnvelope.pmReportRef, "pm_report:119I:smoke");
assert.equal(pmEnvelope.risks.length, 1);

const architectureInput: ArchitectureReportEnvelopeInput = {
  envelopeId: "report_envelope:119I:architecture",
  reportKind: "solid_validator",
  phaseRef: "Phase 119I",
  generatedAtLabel: "caller-supplied-architecture-label",
  status: "needs_review",
  severity: "high",
  summary: "Architecture envelope smoke metadata.",
  findings: [finding],
  evidenceRefs: [evidenceRef],
  limitations: ["No source analysis is performed."],
  recommendedNextAction: {
    ...nextAction,
    requiresHumanApproval: true,
    riskLevel: "high",
  },
  architectureReportRef: "architecture_report:119I:smoke",
  architectureLayer: "architecture",
};
const architectureEnvelope = createArchitectureReportEnvelope(architectureInput);
assert.equal(architectureEnvelope.source, "architecture");
assert.equal(architectureEnvelope.architectureLayer, "architecture");
assert.equal(architectureEnvelope.severityCounts.medium, 1);

const counts = countEnvelopeSeverities([finding]);
assert.equal(counts.medium, 1);
assert.equal(counts.critical, 0);

const summary = summarizeReportEnvelope(sharedEnvelope);
assert.equal(summary.findingCount, 1);
assert.equal(summary.severityCounts.medium, 1);
assert.equal(summary.noExecution, true);

console.log("6/6 PM/SOLID report envelope smoke tests passed");
