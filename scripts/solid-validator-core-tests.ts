import assert from "node:assert/strict";
import {
  buildDefaultSolidRuleRegistry,
  buildSolidValidatorReport,
  countSolidValidatorSeverities,
  createArchitectureSmellFinding,
  createDependencyInversionFinding,
  createSolidRule,
  createSolidValidatorConfig,
  createReviewFinding,
  defaultSolidReviewChecklist,
  validateSolidInputMetadata,
  type DependencyAbstraction,
  type DependencyActualReference,
  type DependencyInversionSuggestedAction,
  type ModuleReference,
  type SolidReviewSuggestedAction,
  type SolidValidatorInput,
} from "../src/architecture/index.js";
import type { PMEvidenceReference } from "../src/pm/index.js";

const evidenceRef: PMEvidenceReference = {
  evidenceId: "evidence:solid-validator:116I:dependency-category",
  label: "dependency category, expected abstraction, and actual dependency metadata",
  reference: "docs/solid-validator-core.md",
  referenceType: "doc",
  safeSummary: "Caller-supplied metadata evidence for validator smoke.",
  metadataOnly: true,
  noFileRead: true,
};

const moduleRef: ModuleReference = {
  moduleRefId: "module:architecture:solidValidator",
  label: "SOLID Validator Core",
  safeSummary: "Architecture metadata module for report-only validator core.",
  layer: "architecture",
  riskSurfaces: ["unknown"],
  metadataOnly: true,
  noFileRead: true,
};

const targetModule: ModuleReference = {
  moduleRefId: "module:providers:future",
  label: "Future provider metadata",
  safeSummary: "Future provider reference represented as caller-supplied metadata.",
  layer: "providers",
  riskSurfaces: ["provider"],
  metadataOnly: true,
  noFileRead: true,
};

const expectedAbstraction: DependencyAbstraction = {
  abstractionId: "dependency_abstraction:port:future-provider",
  category: "port",
  label: "Future provider port",
  safeSummary: "Port metadata expected before provider-adjacent implementation.",
  metadataOnly: true,
  sourceOnly: true,
  noRuntimeExecution: true,
};

const actualDependency: DependencyActualReference = {
  dependencyId: "dependency_actual:provider:future",
  category: "provider",
  importPath: "@future/provider",
  isConcrete: true,
  isRuntime: false,
  isProvider: true,
  isDashboard: false,
  metadataOnly: true,
  noFileRead: true,
};

const dependencyAction: DependencyInversionSuggestedAction = {
  actionId: "dependency_action:116I:review",
  label: "Review provider metadata",
  safeSummary: "Keep provider-adjacent metadata behind a future approved port.",
  recommendedPhase: "Phase 117B",
  requiresHumanApproval: true,
  riskLevel: "high",
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
  noRefactorExecution: true,
  noScannerExecution: true,
};

const reviewAction: SolidReviewSuggestedAction = {
  actionId: "solid_review_action:116I:report",
  label: "Report validator metadata",
  safeSummary: "Capture the supplied metadata as an advisory finding.",
  recommendedPhase: "Phase 117B",
  suggestedPhase: "Phase 117B",
  requiresHumanApproval: true,
  riskLevel: "high",
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
  noRefactorExecution: true,
  noScannerExecution: true,
};

const registry = buildDefaultSolidRuleRegistry();
assert.equal(registry.rules.length, 8);
assert.equal(registry.reportOnly, true);

const customRule = createSolidRule({
  ruleId: "solid_validator_rule:smoke:metadata",
  title: "Smoke metadata rule",
  principleRefs: ["dip"],
  evaluateInputKind: "dependency_finding_metadata",
  requiredEvidence: ["dependency category"],
  severityDefault: "high",
});
assert.equal(customRule.noRuntimeExecution, true);

const dependencyFinding = createDependencyInversionFinding({
  findingId: "dependency_inversion_finding:116I:provider",
  sourceModule: moduleRef,
  targetModule,
  expectedAbstraction,
  actualDependency,
  description: "Provider metadata should remain behind an approved port.",
  evidenceRefs: [evidenceRef],
  suggestedAction: dependencyAction,
  policy: "forbidden",
  severity: "fail",
  riskLevel: "high",
  pmEscalation: "risk_metadata",
  autopilotUse: "validation_context_only",
});

const smellFinding = createArchitectureSmellFinding({
  findingId: "architecture_smell_finding:116I:provider",
  smellCategory: "provider_leakage",
  sourceModule: moduleRef,
  description: "Provider-adjacent metadata appears in supplied architecture context.",
  evidenceRefs: [evidenceRef],
  relatedDependencyFindingRefs: [dependencyFinding.findingId],
  suggestedAction: reviewAction,
  riskLevel: "high",
  pmEscalation: "risk_metadata",
  autopilotUse: "validation_context_only",
});

const reviewFinding = createReviewFinding({
  findingId: "review_finding:116I:dependency",
  checklistItemId: "solid_review_item:dip:abstraction",
  findingType: "dependency_direction_gap",
  sourceModule: moduleRef,
  description: "The supplied dependency metadata needs a future port review.",
  evidenceRefs: [evidenceRef],
  relatedDependencyFindingRefs: [dependencyFinding.findingId],
  relatedSmellFindingRefs: [smellFinding.findingId],
  suggestedAction: reviewAction,
  severity: "high",
  riskLevel: "high",
  pmEscalation: "risk_metadata",
  autopilotUse: "validation_context_only",
});

const input: SolidValidatorInput = {
  validationId: "solid_validator_validation:116I:smoke",
  targetRef: "Phase 116I",
  targetKind: "architecture_review",
  suppliedModules: [moduleRef],
  suppliedDependencies: [],
  suppliedChecklistItems: defaultSolidReviewChecklist,
  suppliedBoundaryFindings: [],
  suppliedDependencyFindings: [dependencyFinding],
  suppliedSmellFindings: [smellFinding],
  suppliedReviewFindings: [reviewFinding],
  suppliedEvidenceRefs: [evidenceRef],
  configRef: registry.defaultConfig.configId,
  metadataOnly: true,
  callerSuppliedOnly: true,
  noFileRead: true,
  noRuntimeExecution: true,
  noScannerExecution: true,
  noRefactorExecution: true,
};

const focusedConfig = createSolidValidatorConfig({
  enabledRuleIds: ["solid_validator_rule:dip:dependency_direction"],
});

const inputSummary = validateSolidInputMetadata(input, registry, focusedConfig);
assert.equal(inputSummary.suppliedCounts.dependencyFindings, 1);
assert.equal(inputSummary.noScannerExecution, true);

const report = buildSolidValidatorReport(input, registry, focusedConfig);
assert.equal(report.reportOnly, true);
assert.equal(report.callerSuppliedOnly, true);
assert.equal(report.status, "failed");
assert.equal(report.severityCounts.high >= 1, true);
assert.equal(report.noRefactorExecution, true);
assert.equal(report.boundaries.noRuntimeExecution, true);

const counts = countSolidValidatorSeverities(report.findings);
assert.equal(counts.high, report.severityCounts.high);

const strictConfig = createSolidValidatorConfig({
  enabledRuleIds: ["solid_validator_rule:dip:dependency_direction"],
  requiredEvidencePolicy: "block",
});
const insufficientReport = buildSolidValidatorReport(
  {
    ...input,
    validationId: "solid_validator_validation:116I:insufficient",
    suppliedEvidenceRefs: [],
  },
  registry,
  strictConfig,
);
assert.equal(insufficientReport.status, "blocked");
assert.equal(insufficientReport.approvalRequired, true);

console.log("6/6 SOLID validator core smoke tests passed");
