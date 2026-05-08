import assert from "node:assert/strict";
import {
  classifyDependencyMetadata,
  classifyDependencyPolicy,
  createDependencyInversionFinding,
  dependencyCategories,
  describeDependencyCategory,
  summarizeDependencyInversionFindings,
  type DependencyInversionSuggestedAction,
  type ModuleReference,
} from "../src/architecture/index.js";
import type { PMEvidenceReference } from "../src/pm/index.js";

const evidenceRef: PMEvidenceReference = {
  evidenceId: "evidence:dependency-inversion:113I",
  label: "Dependency inversion smoke evidence",
  reference: "docs/dependency-inversion-rules.md",
  referenceType: "doc",
  safeSummary: "Metadata-only evidence for dependency inversion smoke.",
  metadataOnly: true,
  noFileRead: true,
};

const architectureModule: ModuleReference = {
  moduleRefId: "module:architecture:dependencyRules",
  label: "Dependency inversion metadata",
  safeSummary: "Architecture metadata module for source-only DIP findings.",
  layer: "architecture",
  riskSurfaces: ["unknown"],
  metadataOnly: true,
  noFileRead: true,
};

const providerModule: ModuleReference = {
  moduleRefId: "module:providers:future",
  label: "Provider dependency",
  safeSummary: "Provider layer reference used as dependency metadata.",
  layer: "providers",
  riskSurfaces: ["provider"],
  metadataOnly: true,
  noFileRead: true,
};

const suggestedAction: DependencyInversionSuggestedAction = {
  actionId: "dependency_action:introduce_port",
  label: "Introduce future port metadata",
  safeSummary: "Represent provider dependency through a future approved port contract.",
  recommendedPhase: "Phase 114B",
  requiresHumanApproval: true,
  riskLevel: "high",
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
  noRefactorExecution: true,
  noScannerExecution: true,
};

assert.equal(dependencyCategories.includes("provider"), true);
assert.equal(describeDependencyCategory("provider").preferredPolicy, "forbidden");
assert.equal(
  classifyDependencyPolicy({
    sourceLayer: "architecture",
    targetLayer: "pm",
    targetCategory: "source_only_metadata",
    isAllowedTypeOnly: true,
  }),
  "allowed_type_only",
);
assert.equal(
  classifyDependencyPolicy({
    sourceLayer: "architecture",
    targetLayer: "providers",
    targetCategory: "provider",
    isConcrete: true,
    isProvider: true,
  }),
  "forbidden",
);

const classification = classifyDependencyMetadata({
  importPath: "metadata:providers",
  sourceLayer: "architecture",
  targetLayer: "providers",
  targetCategory: "provider",
  isConcrete: true,
  isRuntime: false,
  isProvider: true,
  isDashboard: false,
  isAllowedTypeOnly: false,
  classificationReason: "Provider dependency should stay behind a future approved port.",
  evidenceRefs: [evidenceRef],
  riskLevel: "high",
  pmEscalation: "risk_metadata",
  autopilotUse: "handoff_context_only",
});
assert.equal(classification.policy, "forbidden");
assert.equal(classification.severity, "critical");
assert.equal(classification.expectedAbstraction.category, "port");
assert.equal(classification.noScannerExecution, true);

const finding = createDependencyInversionFinding({
  findingId: "dependency_inversion_finding:113I:architecture-provider",
  sourceModule: architectureModule,
  targetModule: providerModule,
  expectedAbstraction: classification.expectedAbstraction,
  actualDependency: classification.actualDependency,
  description: "Architecture layer should describe providers through metadata and future ports.",
  evidenceRefs: [evidenceRef],
  suggestedAction,
  riskLevel: "high",
  pmEscalation: "risk_metadata",
  autopilotUse: "handoff_context_only",
});
assert.equal(finding.policy, "forbidden");
assert.equal(finding.severity, "critical");
assert.equal(finding.noRefactorExecution, true);
assert.equal(finding.noScannerExecution, true);
assert.equal(finding.boundaries.noRuntimeExecution, true);

const summary = summarizeDependencyInversionFindings([finding]);
assert.equal(summary.findingCount, 1);
assert.equal(summary.byPolicy.forbidden, 1);
assert.equal(summary.bySeverity.critical, 1);
assert.equal(summary.byCategory.provider, 1);
assert.equal(summary.noRuntimeExecution, true);

console.log("6/6 dependency inversion rules smoke tests passed");
