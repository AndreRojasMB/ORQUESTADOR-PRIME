import assert from "node:assert/strict";
import {
  buildDefaultUiBoundaryRules,
  createFrontendResponsibilityFinding,
  createUiBoundaryRule,
  defaultUiBoundaryRules,
  describeFrontendResponsibilityCategory,
  frontendResponsibilityCategories,
  selectUiBoundaryRulesByCategory,
  summarizeFrontendResponsibilityFindings,
  summarizeUiBoundaryRules,
  type FrontendComponentReference,
  type FrontendResponsibilitySuggestedAction,
  type ModuleReference,
} from "../src/architecture/index.js";
import type { PMEvidenceReference } from "../src/pm/index.js";

const evidenceRef: PMEvidenceReference = {
  evidenceId: "evidence:frontend-rules:117I",
  label: "Frontend responsibility smoke evidence",
  reference: "docs/frontend-responsibility-rules.md",
  referenceType: "doc",
  safeSummary: "Caller-supplied metadata evidence for frontend responsibility rules.",
  metadataOnly: true,
  noFileRead: true,
};

const architectureModule: ModuleReference = {
  moduleRefId: "module:architecture:frontendRules",
  label: "Frontend Responsibility Rules",
  safeSummary: "Architecture metadata module for frontend responsibility review.",
  layer: "architecture",
  riskSurfaces: ["unknown"],
  metadataOnly: true,
  noFileRead: true,
};

const componentRef: FrontendComponentReference = {
  componentRefId: "component:metadata:dashboard-write-warning",
  label: "Dashboard write warning metadata",
  safeSummary: "Caller-supplied component metadata for a future-gated dashboard write concern.",
  responsibilityCategory: "dashboard_write_boundary",
  metadataOnly: true,
  noFileRead: true,
};

const suggestedAction: FrontendResponsibilitySuggestedAction = {
  actionId: "frontend_responsibility_action:117I:human_review",
  label: "Request UI boundary review",
  safeSummary: "Keep dashboard write concerns future-gated and advisory.",
  recommendedPhase: "Phase 118B",
  suggestedPhase: "Phase 118B",
  requiresHumanApproval: true,
  riskLevel: "high",
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
  noRefactorExecution: true,
  noScannerExecution: true,
};

assert.equal(frontendResponsibilityCategories.includes("presentation_only"), true);
assert.equal(frontendResponsibilityCategories.includes("dashboard_write_boundary"), true);

const category = describeFrontendResponsibilityCategory("dashboard_write_boundary");
assert.equal(category.defaultSeverity, "critical");
assert.equal(category.defaultSmellCategories.includes("dashboard_write_leakage"), true);

const customRule = createUiBoundaryRule({
  ruleId: "ui_boundary_rule:smoke:dashboard_write",
  title: "Smoke dashboard write boundary",
  category: "dashboard_write_boundary",
  allowedResponsibilities: [],
  forbiddenResponsibilities: ["reference_dashboard_write_path"],
  reviewRequiredResponsibilities: ["submit_form_metadata"],
  requiredEvidence: ["future gate reference"],
});
assert.equal(customRule.reportOnly, true);
assert.equal(customRule.noDashboardMutation, true);
assert.equal(customRule.severityDefault, "critical");

const defaultRules = buildDefaultUiBoundaryRules();
assert.equal(defaultRules.length, 12);
assert.equal(defaultUiBoundaryRules.length, 12);
assert.equal(selectUiBoundaryRulesByCategory(defaultRules, "presentation_only").length, 1);
assert.equal(summarizeUiBoundaryRules(defaultRules).byCategory.provider_boundary, 1);

const finding = createFrontendResponsibilityFinding({
  findingId: "frontend_responsibility_finding:117I:smoke",
  ruleId: customRule.ruleId,
  responsibilityCategory: "dashboard_write_boundary",
  sourceModule: architectureModule,
  affectedComponent: componentRef,
  description: "A dashboard write concern must remain future-gated metadata.",
  evidenceRefs: [evidenceRef],
  suggestedAction,
  severity: "critical",
  riskLevel: "high",
  pmEscalation: "risk_metadata",
  autopilotUse: "validation_context_only",
});
assert.equal(finding.noDashboardMutation, true);
assert.equal(finding.noScannerExecution, true);
assert.equal(finding.relatedSolidPrinciples.includes("dip"), true);

const summary = summarizeFrontendResponsibilityFindings([finding]);
assert.equal(summary.findingCount, 1);
assert.equal(summary.byCategory.dashboard_write_boundary, 1);
assert.equal(summary.bySeverity.critical, 1);
assert.equal(summary.noRuntimeExecution, true);

console.log("6/6 frontend responsibility rules smoke tests passed");
