import assert from "node:assert/strict";
import {
  buildDefaultSolidReviewChecklist,
  createReviewFinding,
  createReviewTemplate,
  createSolidReviewChecklistItem,
  defaultSolidReviewChecklist,
  defaultSolidReviewTemplate,
  selectChecklistItemsByScope,
  solidReviewChecklistScopes,
  summarizeReviewFindings,
  type ModuleReference,
  type SolidReviewSuggestedAction,
} from "../src/architecture/index.js";
import type { PMEvidenceReference } from "../src/pm/index.js";

const evidenceRef: PMEvidenceReference = {
  evidenceId: "evidence:solid-review:115I",
  label: "SOLID review checklist smoke evidence",
  reference: "docs/solid-review-checklist.md",
  referenceType: "doc",
  safeSummary: "Metadata-only evidence for SOLID review checklist smoke.",
  metadataOnly: true,
  noFileRead: true,
};

const architectureModule: ModuleReference = {
  moduleRefId: "module:architecture:reviewFindingTypes",
  label: "SOLID review checklist",
  safeSummary: "Architecture metadata module for source-only review checklist findings.",
  layer: "architecture",
  riskSurfaces: ["unknown"],
  metadataOnly: true,
  noFileRead: true,
};

const suggestedAction: SolidReviewSuggestedAction = {
  actionId: "solid_review_action:smoke:report_only",
  label: "Report checklist finding",
  safeSummary: "Capture the checklist result as metadata only.",
  recommendedPhase: "Phase 116B",
  suggestedPhase: "Phase 116B",
  requiresHumanApproval: true,
  riskLevel: "high",
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
  noRefactorExecution: true,
  noScannerExecution: true,
};

assert.equal(solidReviewChecklistScopes.includes("dip"), true);

const item = createSolidReviewChecklistItem({
  itemId: "solid_review_item:smoke:dip",
  title: "Smoke DIP checklist item",
  scope: "dip",
  principleRefs: ["dip"],
  smellCategoryRefs: ["provider_leakage"],
  boundaryPolicyRefs: ["forbidden"],
  dependencyPolicyRefs: ["forbidden"],
  severityHint: "high",
  question: "Does this dependency point toward an abstraction?",
  expectedEvidence: ["dependency category", "expected abstraction"],
  failureSignal: "Concrete provider metadata appears in source-only architecture.",
  suggestedAction,
});
assert.equal(item.scope, "dip");
assert.equal(item.reportOnly, true);

const finding = createReviewFinding({
  findingId: "solid_review_finding:115I:smoke",
  checklistItemId: item.itemId,
  findingType: "dependency_direction_gap",
  sourceModule: architectureModule,
  description: "A provider-like dependency should remain behind future port metadata.",
  evidenceRefs: [evidenceRef],
  relatedDependencyFindingRefs: ["dependency_inversion_finding:113I:architecture-provider"],
  relatedSmellFindingRefs: ["architecture_smell_finding:114I:provider-leakage"],
  suggestedAction,
  severity: "high",
  riskLevel: "high",
  pmEscalation: "risk_metadata",
  autopilotUse: "handoff_context_only",
});
assert.equal(finding.severity, "high");
assert.equal(finding.noRefactorExecution, true);
assert.equal(finding.noScannerExecution, true);
assert.equal(finding.boundaries.noRuntimeExecution, true);

const defaultChecklist = buildDefaultSolidReviewChecklist();
assert.equal(defaultChecklist.length, 9);
assert.equal(defaultSolidReviewChecklist.length, 9);
assert.equal(selectChecklistItemsByScope(defaultChecklist, "dip").length, 1);

const template = createReviewTemplate({
  templateId: "solid_review_template:smoke",
  title: "Smoke checklist template",
  targetScope: "architecture_metadata_module",
  checklistItemIds: [item.itemId],
  requiredEvidence: ["metadata-only evidence"],
  outputSections: ["summary", "findings", "next action"],
  recommendedNextAction: {
    nextActionId: "solid_review_next_action:smoke",
    label: "Continue to validator planning",
    safeSummary: "Use review findings as context for the next planning phase.",
    nextPhase: "Phase 116B",
    riskLevel: "medium",
    requiresHumanApproval: true,
    metadataOnly: true,
    advisoryOnly: true,
    noExecution: true,
  },
});
assert.equal(template.reportOnly, true);
assert.equal(defaultSolidReviewTemplate.noRuntimeExecution, true);

const summary = summarizeReviewFindings([finding]);
assert.equal(summary.findingCount, 1);
assert.equal(summary.byFindingType.dependency_direction_gap, 1);
assert.equal(summary.bySeverity.high, 1);
assert.equal(summary.noRuntimeExecution, true);

console.log("6/6 SOLID review checklist smoke tests passed");
