import assert from "node:assert/strict";
import {
  backendLayerCategories,
  buildDefaultIoBoundaryRules,
  createBackendLayeringFinding,
  createIoBoundaryRule,
  defaultIoBoundaryRules,
  describeBackendLayerCategory,
  selectIoBoundaryRulesByCategory,
  summarizeBackendLayeringFindings,
  summarizeIoBoundaryRules,
  type BackendLayeringSuggestedAction,
  type ModuleReference,
} from "../src/architecture/index.js";
import type { PMEvidenceReference } from "../src/pm/index.js";

const evidenceRef: PMEvidenceReference = {
  evidenceId: "evidence:backend-layering:118I",
  label: "Backend layering smoke evidence",
  reference: "docs/backend-layering-rules.md",
  referenceType: "doc",
  safeSummary: "Caller-supplied metadata evidence for backend layering rules.",
  metadataOnly: true,
  noFileRead: true,
};

const architectureModule: ModuleReference = {
  moduleRefId: "module:architecture:backendRules",
  label: "Backend Layering Rules",
  safeSummary: "Architecture metadata module for backend layering review.",
  layer: "architecture",
  riskSurfaces: ["unknown"],
  metadataOnly: true,
  noFileRead: true,
};

const suggestedAction: BackendLayeringSuggestedAction = {
  actionId: "backend_layering_action:118I:human_review",
  label: "Request backend boundary review",
  safeSummary: "Keep provider and persistence concerns behind future-approved metadata.",
  recommendedPhase: "Phase 119B",
  suggestedPhase: "Phase 119B",
  requiresHumanApproval: true,
  riskLevel: "high",
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
  noRefactorExecution: true,
  noScannerExecution: true,
};

assert.equal(backendLayerCategories.includes("controller_boundary"), true);
assert.equal(backendLayerCategories.includes("db_sql_boundary"), true);

const providerCategory = describeBackendLayerCategory("provider_boundary");
assert.equal(providerCategory.defaultSeverity, "critical");
assert.equal(providerCategory.defaultSmellCategories.includes("provider_leakage"), true);

const customRule = createIoBoundaryRule({
  ruleId: "io_boundary_rule:smoke:provider_boundary",
  title: "Smoke provider boundary",
  category: "provider_boundary",
  allowedResponsibilities: [],
  forbiddenResponsibilities: ["reference_provider_boundary"],
  reviewRequiredResponsibilities: ["describe_adapter_contract"],
  requiredEvidence: ["future gate reference"],
});
assert.equal(customRule.reportOnly, true);
assert.equal(customRule.noProviderExecution, true);
assert.equal(customRule.noDbSqlAccess, true);
assert.equal(customRule.severityDefault, "critical");

const defaultRules = buildDefaultIoBoundaryRules();
assert.equal(defaultRules.length, 12);
assert.equal(defaultIoBoundaryRules.length, 12);
assert.equal(selectIoBoundaryRulesByCategory(defaultRules, "controller_boundary").length, 1);
assert.equal(summarizeIoBoundaryRules(defaultRules).byCategory.provider_boundary, 1);

const finding = createBackendLayeringFinding({
  findingId: "backend_layering_finding:118I:provider",
  ruleId: customRule.ruleId,
  backendLayerCategory: "provider_boundary",
  sourceModule: architectureModule,
  description: "Provider concerns must remain future-gated metadata.",
  evidenceRefs: [evidenceRef],
  suggestedAction,
  severity: "critical",
  riskLevel: "high",
  pmEscalation: "risk_metadata",
  autopilotUse: "validation_context_only",
});
assert.equal(finding.noProviderExecution, true);
assert.equal(finding.noDbSqlAccess, true);
assert.equal(finding.noScannerExecution, true);
assert.equal(finding.relatedSolidPrinciples.includes("dip"), true);

const summary = summarizeBackendLayeringFindings([finding]);
assert.equal(summary.findingCount, 1);
assert.equal(summary.byCategory.provider_boundary, 1);
assert.equal(summary.bySeverity.critical, 1);
assert.equal(summary.noRuntimeExecution, true);

console.log("6/6 backend layering rules smoke tests passed");
