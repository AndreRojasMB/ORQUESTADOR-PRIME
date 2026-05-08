import assert from "node:assert/strict";
import {
  buildDefaultLayerMap,
  classifyImportPolicy,
  createModuleBoundaryFinding,
  defaultModuleLayerMap,
  describeModuleLayer,
  summarizeModuleBoundaryFindings,
  type ModuleBoundarySuggestedAction,
  type ModuleReference,
} from "../src/architecture/index.js";
import type { PMEvidenceReference } from "../src/pm/index.js";

const evidenceRef: PMEvidenceReference = {
  evidenceId: "evidence:module-boundary:112I",
  label: "Module boundary smoke evidence",
  reference: "docs/module-boundary-rules.md",
  referenceType: "doc",
  safeSummary: "Metadata-only evidence for module boundary rule smoke.",
  metadataOnly: true,
  noFileRead: true,
};

const architectureModule: ModuleReference = {
  moduleRefId: "module:architecture:moduleBoundaries",
  label: "Module boundary metadata",
  safeSummary: "Architecture metadata module for source-only boundary findings.",
  layer: "architecture",
  riskSurfaces: ["unknown"],
  metadataOnly: true,
  noFileRead: true,
};

const providerModule: ModuleReference = {
  moduleRefId: "module:providers:future",
  label: "Provider surface",
  safeSummary: "Provider layer reference used as boundary metadata.",
  layer: "providers",
  riskSurfaces: ["provider"],
  metadataOnly: true,
  noFileRead: true,
};

const suggestedAction: ModuleBoundarySuggestedAction = {
  actionId: "module_boundary_action:keep_metadata_only",
  label: "Keep provider references metadata-only",
  safeSummary: "Keep architecture references to provider layers as metadata, not imports.",
  recommendedPhase: "Phase 113B",
  requiresHumanApproval: true,
  riskLevel: "high",
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
  noRefactorExecution: true,
  noScannerExecution: true,
};

assert.equal(
  classifyImportPolicy({
    sourceLayer: "architecture",
    targetLayer: "pm",
    importKind: "type_only_import",
  }),
  "allowed_type_only",
);
assert.equal(
  classifyImportPolicy({
    sourceLayer: "architecture",
    targetLayer: "providers",
    importKind: "value_import",
  }),
  "forbidden",
);

const layerMap = buildDefaultLayerMap();
assert.equal(layerMap.length, 14);
assert.equal(defaultModuleLayerMap.length, 14);
assert.equal(describeModuleLayer("architecture", layerMap)?.noScannerExecution, true);
assert.equal(describeModuleLayer("runtime_future", layerMap)?.futureGatedTargets.includes("runtime_future"), true);

const finding = createModuleBoundaryFinding({
  findingId: "module_boundary_finding:112I:architecture-provider",
  sourceModule: architectureModule,
  targetModule: providerModule,
  importPath: "metadata:providers",
  importKind: "metadata_reference",
  description: "Architecture layer should keep provider references metadata-only.",
  evidenceRefs: [evidenceRef],
  suggestedAction,
  pmEscalation: "risk_metadata",
  autopilotUse: "handoff_context_only",
});
assert.equal(finding.policy, "forbidden");
assert.equal(finding.severity, "fail");
assert.equal(finding.noRefactorExecution, true);
assert.equal(finding.noScannerExecution, true);
assert.equal(finding.boundaries.noRuntimeExecution, true);

const summary = summarizeModuleBoundaryFindings([finding]);
assert.equal(summary.findingCount, 1);
assert.equal(summary.byPolicy.forbidden, 1);
assert.equal(summary.bySeverity.fail, 1);
assert.equal(summary.noScannerExecution, true);
assert.equal(summary.noRefactorExecution, true);

console.log("5/5 module boundary rules smoke tests passed");
