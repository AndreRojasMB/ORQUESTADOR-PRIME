import {
  solidArchitectureBoundaries,
  type SolidArchitectureBoundarySet,
} from "./solidBoundaries.js";
import {
  createSolidReviewChecklistItem,
  type SolidReviewChecklistItem,
  type SolidReviewChecklistItemInput,
  type SolidReviewChecklistScope,
  type SolidReviewSuggestedAction,
} from "./reviewFindingTypes.js";
import type {
  PMRiskTier,
  ProjectPhaseRef,
} from "../pm/types.js";

export type ReviewTemplateTargetScope =
  | "pm_source_only_module"
  | "architecture_metadata_module"
  | "autopilot_metadata_module"
  | "live_adjacent_boundary"
  | "future_runtime_gate"
  | "phase_closeout_architecture_review";

export interface ReviewTemplateRecommendedNextAction {
  nextActionId: string;
  label: string;
  safeSummary: string;
  nextPhase?: ProjectPhaseRef;
  riskLevel: PMRiskTier;
  requiresHumanApproval: boolean;
  metadataOnly: true;
  advisoryOnly: true;
  noExecution: true;
}

export interface ReviewTemplate {
  templateId: string;
  title: string;
  targetScope: ReviewTemplateTargetScope;
  checklistItemIds: string[];
  requiredEvidence: string[];
  outputSections: string[];
  safetyBoundaries: SolidArchitectureBoundarySet;
  recommendedNextAction: ReviewTemplateRecommendedNextAction;
  reportOnly: true;
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noRefactorExecution: true;
  noScannerExecution: true;
  noRuntimeExecution: true;
}

export interface ReviewTemplateInput {
  templateId: string;
  title: string;
  targetScope: ReviewTemplateTargetScope;
  checklistItemIds: string[];
  requiredEvidence: string[];
  outputSections: string[];
  recommendedNextAction: ReviewTemplateRecommendedNextAction;
}

export const createReviewTemplate = (
  input: ReviewTemplateInput,
): ReviewTemplate => ({
  templateId: input.templateId,
  title: input.title,
  targetScope: input.targetScope,
  checklistItemIds: [...input.checklistItemIds],
  requiredEvidence: [...input.requiredEvidence],
  outputSections: [...input.outputSections],
  safetyBoundaries: solidArchitectureBoundaries,
  recommendedNextAction: input.recommendedNextAction,
  reportOnly: true,
  metadataOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
  noRefactorExecution: true,
  noScannerExecution: true,
  noRuntimeExecution: true,
});

const defaultSuggestedAction = (
  actionId: string,
  label: string,
  safeSummary: string,
  riskLevel: PMRiskTier,
): SolidReviewSuggestedAction => ({
  actionId,
  label,
  safeSummary,
  recommendedPhase: "Phase 116B",
  suggestedPhase: "Phase 116B",
  requiresHumanApproval: riskLevel === "high" || riskLevel === "critical",
  riskLevel,
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
  noRefactorExecution: true,
  noScannerExecution: true,
});

const makeItem = (input: SolidReviewChecklistItemInput): SolidReviewChecklistItem =>
  createSolidReviewChecklistItem(input);

export const buildDefaultSolidReviewChecklist = (): SolidReviewChecklistItem[] => [
  makeItem({
    itemId: "solid_review_item:srp:responsibility",
    title: "SRP responsibility check",
    scope: "srp",
    principleRefs: ["srp"],
    smellCategoryRefs: ["responsibility_overload"],
    boundaryPolicyRefs: ["review_required"],
    dependencyPolicyRefs: ["review_required"],
    severityHint: "medium",
    question: "Does the module have one clear reason to change?",
    expectedEvidence: ["module summary", "responsibility statement", "known callers"],
    failureSignal: "Multiple unrelated responsibilities appear in the same source-only module.",
    suggestedAction: defaultSuggestedAction(
      "solid_review_action:srp:document_responsibility",
      "Document responsibility",
      "Capture ownership boundaries as metadata before expanding implementation.",
      "medium",
    ),
  }),
  makeItem({
    itemId: "solid_review_item:ocp:extension",
    title: "OCP extension check",
    scope: "ocp",
    principleRefs: ["ocp"],
    smellCategoryRefs: ["extension_blocked_by_core_modification"],
    boundaryPolicyRefs: ["review_required"],
    dependencyPolicyRefs: ["review_required"],
    severityHint: "medium",
    question: "Can future behavior be extended through contracts instead of modifying core?",
    expectedEvidence: ["extension point metadata", "future phase boundary", "risk notes"],
    failureSignal: "Future change requires direct core modification without a contract.",
    suggestedAction: defaultSuggestedAction(
      "solid_review_action:ocp:plan_extension",
      "Plan extension contract",
      "Plan a future contract before modifying core behavior.",
      "medium",
    ),
  }),
  makeItem({
    itemId: "solid_review_item:lsp:replacement",
    title: "LSP replacement check",
    scope: "lsp",
    principleRefs: ["lsp"],
    smellCategoryRefs: ["contract_substitution_risk"],
    boundaryPolicyRefs: ["review_required"],
    dependencyPolicyRefs: ["review_required"],
    severityHint: "medium",
    question: "Could a replacement satisfy the same contract without surprising callers?",
    expectedEvidence: ["contract assumptions", "replacement limits", "caller expectations"],
    failureSignal: "Replacement behavior depends on hidden assumptions.",
    suggestedAction: defaultSuggestedAction(
      "solid_review_action:lsp:document_contract",
      "Document contract assumptions",
      "Capture substitution assumptions as metadata.",
      "medium",
    ),
  }),
  makeItem({
    itemId: "solid_review_item:isp:interface_size",
    title: "ISP interface size check",
    scope: "isp",
    principleRefs: ["isp"],
    smellCategoryRefs: ["oversized_interface"],
    boundaryPolicyRefs: ["review_required"],
    dependencyPolicyRefs: ["review_required"],
    severityHint: "medium",
    question: "Is the interface small enough for the caller-specific use case?",
    expectedEvidence: ["caller needs", "unused capability notes", "interface summary"],
    failureSignal: "Consumers must depend on methods or metadata they do not need.",
    suggestedAction: defaultSuggestedAction(
      "solid_review_action:isp:split_interface",
      "Plan interface split",
      "Plan a future caller-specific contract if the interface is too broad.",
      "medium",
    ),
  }),
  makeItem({
    itemId: "solid_review_item:dip:abstraction",
    title: "DIP abstraction check",
    scope: "dip",
    principleRefs: ["dip"],
    smellCategoryRefs: ["core_infra_coupling", "provider_leakage"],
    boundaryPolicyRefs: ["forbidden", "future_gated"],
    dependencyPolicyRefs: ["forbidden", "future_gated"],
    severityHint: "high",
    question: "Does the dependency point toward a source-only abstraction instead of concrete infrastructure?",
    expectedEvidence: ["dependency category", "expected abstraction", "actual dependency metadata"],
    failureSignal: "Source-only code depends on provider, config, dashboard, or runtime surfaces.",
    suggestedAction: defaultSuggestedAction(
      "solid_review_action:dip:introduce_port",
      "Plan future port",
      "Introduce a future approved port before concrete dependency work.",
      "high",
    ),
  }),
  makeItem({
    itemId: "solid_review_item:module_boundaries:policy",
    title: "Module boundary policy check",
    scope: "module_boundaries",
    principleRefs: ["srp", "dip"],
    smellCategoryRefs: ["ambiguous_boundary"],
    boundaryPolicyRefs: ["forbidden", "future_gated", "review_required"],
    dependencyPolicyRefs: ["review_required"],
    severityHint: "high",
    question: "Is the source and target layer relationship allowed by boundary metadata?",
    expectedEvidence: ["source layer", "target layer", "policy rationale"],
    failureSignal: "A live-adjacent layer crosses into source-only architecture without a contract.",
    suggestedAction: defaultSuggestedAction(
      "solid_review_action:boundary:review_policy",
      "Review boundary policy",
      "Escalate ambiguous or forbidden layer crossings to review metadata.",
      "high",
    ),
  }),
  makeItem({
    itemId: "solid_review_item:dependency_direction:policy",
    title: "Dependency direction check",
    scope: "dependency_direction",
    principleRefs: ["dip"],
    smellCategoryRefs: ["core_infra_coupling", "runtime_dependency_in_source_only"],
    boundaryPolicyRefs: ["future_gated", "forbidden"],
    dependencyPolicyRefs: ["future_gated", "forbidden"],
    severityHint: "high",
    question: "Does dependency direction avoid concrete runtime, provider, and dashboard dependencies?",
    expectedEvidence: ["target category", "expected abstraction", "classification reason"],
    failureSignal: "A concrete dependency points into a source-only or advisory module.",
    suggestedAction: defaultSuggestedAction(
      "solid_review_action:dependency:defer_concrete",
      "Defer concrete dependency",
      "Keep concrete dependency work in a future gated phase.",
      "high",
    ),
  }),
  makeItem({
    itemId: "solid_review_item:architecture_smells:taxonomy",
    title: "Architecture smell check",
    scope: "architecture_smells",
    principleRefs: ["srp", "ocp", "lsp", "isp", "dip"],
    smellCategoryRefs: ["hidden_side_effect", "approval_bypass_risk", "automation_overreach"],
    boundaryPolicyRefs: ["review_required", "forbidden"],
    dependencyPolicyRefs: ["review_required", "forbidden"],
    severityHint: "high",
    question: "Does the design map to a known architecture smell that needs review?",
    expectedEvidence: ["smell category", "severity", "related finding references"],
    failureSignal: "A high or critical smell has no planned review path.",
    suggestedAction: defaultSuggestedAction(
      "solid_review_action:smell:record_finding",
      "Record smell finding",
      "Capture the smell as metadata before expanding scope.",
      "high",
    ),
  }),
  makeItem({
    itemId: "solid_review_item:automation_safety:approval",
    title: "Automation safety check",
    scope: "automation_safety",
    principleRefs: ["srp", "dip"],
    smellCategoryRefs: ["approval_bypass_risk", "automation_overreach", "hidden_side_effect"],
    boundaryPolicyRefs: ["forbidden", "future_gated"],
    dependencyPolicyRefs: ["forbidden", "future_gated"],
    severityHint: "critical",
    question: "Could this design bypass approvals, launch automation, or imply hidden side effects?",
    expectedEvidence: ["approval posture", "autonomy level", "side-effect boundaries"],
    failureSignal: "Automation can proceed without explicit future approval metadata.",
    suggestedAction: defaultSuggestedAction(
      "solid_review_action:automation:human_review",
      "Request human review",
      "Stop and request human review before any execution-capable phase.",
      "critical",
    ),
  }),
];

export const selectChecklistItemsByScope = (
  items: readonly SolidReviewChecklistItem[],
  scope: SolidReviewChecklistScope,
): SolidReviewChecklistItem[] => items.filter((item) => item.scope === scope);

export const defaultSolidReviewChecklist = buildDefaultSolidReviewChecklist();

export const defaultSolidReviewTemplate = createReviewTemplate({
  templateId: "solid_review_template:architecture_source_only",
  title: "Source-only architecture review",
  targetScope: "architecture_metadata_module",
  checklistItemIds: defaultSolidReviewChecklist.map((item) => item.itemId),
  requiredEvidence: [
    "caller-provided metadata",
    "safe evidence references",
    "known boundary policies",
    "known smell categories",
  ],
  outputSections: [
    "review summary",
    "checklist coverage",
    "findings by severity",
    "SOLID principle gaps",
    "module boundary concerns",
    "Dependency Inversion concerns",
    "architecture smells",
    "evidence gaps",
    "safety boundary notes",
    "suggested next action",
  ],
  recommendedNextAction: {
    nextActionId: "solid_review_next_action:report_only",
    label: "Report review findings",
    safeSummary: "Report checklist findings as metadata for future planning.",
    nextPhase: "Phase 116B",
    riskLevel: "medium",
    requiresHumanApproval: true,
    metadataOnly: true,
    advisoryOnly: true,
    noExecution: true,
  },
});
