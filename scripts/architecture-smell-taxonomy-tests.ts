import assert from "node:assert/strict";
import {
  architectureSmellCategories,
  classifyArchitectureSmellSeverity,
  createArchitectureSmellFinding,
  describeArchitectureSmellCategory,
  mapSmellToSolidPrinciples,
  summarizeArchitectureSmellFindings,
  type ArchitectureSmellSuggestedAction,
  type ModuleReference,
} from "../src/architecture/index.js";
import type { PMEvidenceReference } from "../src/pm/index.js";

const evidenceRef: PMEvidenceReference = {
  evidenceId: "evidence:architecture-smell:114I",
  label: "Architecture smell smoke evidence",
  reference: "docs/architecture-smell-taxonomy.md",
  referenceType: "doc",
  safeSummary: "Metadata-only evidence for architecture smell taxonomy smoke.",
  metadataOnly: true,
  noFileRead: true,
};

const architectureModule: ModuleReference = {
  moduleRefId: "module:architecture:smellTaxonomy",
  label: "Architecture smell taxonomy",
  safeSummary: "Architecture metadata module for source-only smell findings.",
  layer: "architecture",
  riskSurfaces: ["unknown"],
  metadataOnly: true,
  noFileRead: true,
};

const suggestedAction: ArchitectureSmellSuggestedAction = {
  actionId: "architecture_smell_action:document_future_boundary",
  label: "Document future boundary",
  safeSummary: "Capture the smell as metadata and defer remediation to a future approved phase.",
  recommendedPhase: "Phase 115B",
  requiresHumanApproval: true,
  riskLevel: "high",
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
  noRefactorExecution: true,
  noScannerExecution: true,
};

assert.equal(architectureSmellCategories.includes("provider_leakage"), true);
assert.deepEqual(mapSmellToSolidPrinciples("oversized_interface"), ["isp"]);
assert.equal(describeArchitectureSmellCategory("approval_bypass_risk").defaultSeverity, "critical");

assert.equal(
  classifyArchitectureSmellSeverity({
    smellCategory: "provider_leakage",
    affectedLayer: "architecture",
    riskLevel: "high",
    impliesProviderCoupling: true,
    impliesSourceOnlyLeakage: true,
  }),
  "high",
);

assert.equal(
  classifyArchitectureSmellSeverity({
    smellCategory: "approval_bypass_risk",
    affectedLayer: "autopilot",
    riskLevel: "medium",
    impliesApprovalBypass: true,
  }),
  "critical",
);

const finding = createArchitectureSmellFinding({
  findingId: "architecture_smell_finding:114I:provider-leakage",
  smellCategory: "provider_leakage",
  sourceModule: architectureModule,
  description: "Architecture metadata should not depend on provider-adjacent implementation details.",
  evidenceRefs: [evidenceRef],
  relatedBoundaryFindingRefs: ["module_boundary_finding:112I:architecture-provider"],
  relatedDependencyFindingRefs: ["dependency_inversion_finding:113I:architecture-provider"],
  suggestedAction,
  riskLevel: "high",
  pmEscalation: "risk_metadata",
  autopilotUse: "handoff_context_only",
  severityInput: {
    impliesProviderCoupling: true,
    impliesSourceOnlyLeakage: true,
  },
});
assert.equal(finding.severity, "high");
assert.equal(finding.relatedPrinciples.includes("dip"), true);
assert.equal(finding.noRefactorExecution, true);
assert.equal(finding.noScannerExecution, true);
assert.equal(finding.boundaries.noRuntimeExecution, true);

const summary = summarizeArchitectureSmellFindings([finding]);
assert.equal(summary.findingCount, 1);
assert.equal(summary.byCategory.provider_leakage, 1);
assert.equal(summary.bySeverity.high, 1);
assert.equal(summary.byPrinciple.dip, 1);
assert.equal(summary.noRuntimeExecution, true);

console.log("6/6 architecture smell taxonomy smoke tests passed");
