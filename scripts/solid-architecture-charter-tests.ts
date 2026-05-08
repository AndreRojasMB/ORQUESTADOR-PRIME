import assert from "node:assert/strict";
import {
  buildSolidArchitectureCharter,
  classifySolidSeverity,
  createSolidFinding,
  describeSolidBoundary,
  solidArchitectureBoundaries,
  summarizeSolidFindings,
  type SolidModuleRef,
  type SolidSuggestedAction,
} from "../src/architecture/index.js";
import type { PMEvidenceReference } from "../src/pm/index.js";

const evidenceRef: PMEvidenceReference = {
  evidenceId: "evidence:solid:111I",
  label: "SOLID charter smoke evidence",
  reference: "docs/solid-architecture-layer.md",
  referenceType: "doc",
  safeSummary: "Metadata-only evidence reference for the SOLID architecture smoke test.",
  metadataOnly: true,
  noFileRead: true,
};

const moduleRef: SolidModuleRef = {
  moduleRefId: "module:pm:index",
  label: "PM public surface",
  safeSummary: "PM Core source export surface used as architecture review context.",
  layer: "pm_core",
  riskSurfaces: ["unknown"],
  metadataOnly: true,
  noFileRead: true,
};

const suggestedAction: SolidSuggestedAction = {
  actionId: "solid_action:document_boundary",
  label: "Document boundary",
  safeSummary: "Document the boundary before proposing any implementation change.",
  recommendedPhase: "Phase 112B",
  requiresHumanApproval: true,
  riskLevel: "medium",
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
  noRefactorExecution: true,
};

const severity = classifySolidSeverity({
  riskLevel: "medium",
  approvalRequired: true,
  principle: "dip",
  moduleLayer: "pm_core",
});
assert.equal(severity, "warn");

const finding = createSolidFinding({
  findingId: "solid_finding:111I:dip:pm-index",
  principle: "dip",
  moduleRef,
  description: "PM public surface should remain source-only and avoid live-adjacent imports.",
  evidenceRefs: [evidenceRef],
  suggestedAction,
  approvalRequired: true,
  autopilotUse: "handoff_context_only",
  pmEscalation: "pm_status_report",
});
assert.equal(finding.metadataOnly, true);
assert.equal(finding.reportOnly, true);
assert.equal(finding.noRefactorExecution, true);
assert.equal(finding.boundaries.noScanners, true);

const summary = summarizeSolidFindings([finding]);
assert.equal(summary.findingCount, 1);
assert.equal(summary.byPrinciple.dip, 1);
assert.equal(summary.bySeverity.warn, 1);
assert.equal(summary.noRefactorExecution, true);

const boundary = describeSolidBoundary();
assert.deepEqual(boundary, solidArchitectureBoundaries);
assert.equal(boundary.noRuntimeExecution, true);
assert.equal(boundary.noProviderCalls, true);
assert.equal(boundary.noDashboardMutation, true);
assert.equal(boundary.noOpenClaw, true);
assert.equal(boundary.noWhatsAppOutbound, true);
assert.equal(boundary.noMemoryPersistence, true);

const charter = buildSolidArchitectureCharter({
  findings: [finding],
  assumptions: ["Smoke test uses caller-provided metadata."],
  exclusions: ["No scanner or refactor behavior is included."],
});
assert.equal(charter.reportOnly, true);
assert.equal(charter.sourceOnly, true);
assert.equal(charter.noRefactorExecution, true);
assert.equal(charter.findings[0]?.findingId, finding.findingId);

console.log("5/5 SOLID architecture charter smoke tests passed");
