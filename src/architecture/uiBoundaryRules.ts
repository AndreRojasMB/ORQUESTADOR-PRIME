import {
  solidArchitectureBoundaries,
  type SolidArchitectureBoundarySet,
} from "./solidBoundaries.js";
import {
  describeFrontendResponsibilityCategory,
  type FrontendResponsibilityCategory,
  type FrontendResponsibilitySeverity,
} from "./frontendRules.js";
import type {
  PMSchemaVersion,
} from "../pm/types.js";

export type UiResponsibility =
  | "render_markup"
  | "compose_children"
  | "receive_props"
  | "own_local_state"
  | "coordinate_state"
  | "coordinate_data_adapter"
  | "handle_effect_metadata"
  | "own_route_metadata"
  | "validate_form_input"
  | "submit_form_metadata"
  | "declare_accessibility_metadata"
  | "apply_design_tokens"
  | "reference_dashboard_write_path"
  | "reference_provider_boundary"
  | "reference_runtime_future";

export interface UiBoundaryRule {
  ruleId: string;
  title: string;
  category: FrontendResponsibilityCategory;
  allowedResponsibilities: UiResponsibility[];
  forbiddenResponsibilities: UiResponsibility[];
  reviewRequiredResponsibilities: UiResponsibility[];
  severityDefault: FrontendResponsibilitySeverity;
  requiredEvidence: string[];
  reportOnly: true;
  safetyBoundaries: SolidArchitectureBoundarySet;
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noDashboardMutation: true;
  noRuntimeExecution: true;
  noScannerExecution: true;
  noRefactorExecution: true;
}

export interface UiBoundaryRuleInput {
  ruleId: string;
  title: string;
  category: FrontendResponsibilityCategory;
  allowedResponsibilities: UiResponsibility[];
  forbiddenResponsibilities: UiResponsibility[];
  reviewRequiredResponsibilities: UiResponsibility[];
  requiredEvidence: string[];
  severityDefault?: FrontendResponsibilitySeverity;
}

export interface UiBoundaryRuleSummary {
  summaryId: string;
  schemaVersion: PMSchemaVersion;
  ruleCount: number;
  byCategory: Record<FrontendResponsibilityCategory, number>;
  safeSummary: string;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noDashboardMutation: true;
  noRuntimeExecution: true;
  noScannerExecution: true;
  noRefactorExecution: true;
  safetyBoundaries: SolidArchitectureBoundarySet;
}

export const uiResponsibilities = [
  "render_markup",
  "compose_children",
  "receive_props",
  "own_local_state",
  "coordinate_state",
  "coordinate_data_adapter",
  "handle_effect_metadata",
  "own_route_metadata",
  "validate_form_input",
  "submit_form_metadata",
  "declare_accessibility_metadata",
  "apply_design_tokens",
  "reference_dashboard_write_path",
  "reference_provider_boundary",
  "reference_runtime_future",
] as const satisfies readonly UiResponsibility[];

const emptyCategoryCounts = (): Record<FrontendResponsibilityCategory, number> => ({
  presentation_only: 0,
  container_orchestration: 0,
  state_management: 0,
  effect_boundary: 0,
  routing_boundary: 0,
  data_adapter_boundary: 0,
  form_validation_boundary: 0,
  accessibility_boundary: 0,
  design_system_boundary: 0,
  dashboard_write_boundary: 0,
  provider_boundary: 0,
  runtime_future_boundary: 0,
});

export const createUiBoundaryRule = (
  input: UiBoundaryRuleInput,
): UiBoundaryRule => {
  const category = describeFrontendResponsibilityCategory(input.category);

  return {
    ruleId: input.ruleId,
    title: input.title,
    category: input.category,
    allowedResponsibilities: [...input.allowedResponsibilities],
    forbiddenResponsibilities: [...input.forbiddenResponsibilities],
    reviewRequiredResponsibilities: [...input.reviewRequiredResponsibilities],
    severityDefault: input.severityDefault ?? category.defaultSeverity,
    requiredEvidence: [...input.requiredEvidence],
    reportOnly: true,
    safetyBoundaries: solidArchitectureBoundaries,
    metadataOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noDashboardMutation: true,
    noRuntimeExecution: true,
    noScannerExecution: true,
    noRefactorExecution: true,
  };
};

export const buildDefaultUiBoundaryRules = (): UiBoundaryRule[] => [
  createUiBoundaryRule({
    ruleId: "ui_boundary_rule:presentation_only",
    title: "Presentation-only component boundary",
    category: "presentation_only",
    allowedResponsibilities: ["render_markup", "compose_children", "receive_props", "apply_design_tokens"],
    forbiddenResponsibilities: [
      "coordinate_data_adapter",
      "handle_effect_metadata",
      "own_route_metadata",
      "reference_dashboard_write_path",
      "reference_provider_boundary",
      "reference_runtime_future",
    ],
    reviewRequiredResponsibilities: ["own_local_state"],
    requiredEvidence: ["component responsibility summary", "props contract summary"],
    severityDefault: "medium",
  }),
  createUiBoundaryRule({
    ruleId: "ui_boundary_rule:container_orchestration",
    title: "Container orchestration boundary",
    category: "container_orchestration",
    allowedResponsibilities: ["coordinate_state", "coordinate_data_adapter", "compose_children"],
    forbiddenResponsibilities: ["reference_dashboard_write_path", "reference_provider_boundary", "reference_runtime_future"],
    reviewRequiredResponsibilities: ["handle_effect_metadata", "own_route_metadata"],
    requiredEvidence: ["state orchestration summary", "adapter metadata summary"],
  }),
  createUiBoundaryRule({
    ruleId: "ui_boundary_rule:state_management",
    title: "State ownership boundary",
    category: "state_management",
    allowedResponsibilities: ["own_local_state", "coordinate_state"],
    forbiddenResponsibilities: ["reference_provider_boundary", "reference_runtime_future"],
    reviewRequiredResponsibilities: ["handle_effect_metadata", "reference_dashboard_write_path"],
    requiredEvidence: ["state ownership summary"],
  }),
  createUiBoundaryRule({
    ruleId: "ui_boundary_rule:effect_boundary",
    title: "Effect isolation boundary",
    category: "effect_boundary",
    allowedResponsibilities: ["handle_effect_metadata"],
    forbiddenResponsibilities: ["reference_dashboard_write_path", "reference_provider_boundary", "reference_runtime_future"],
    reviewRequiredResponsibilities: ["coordinate_data_adapter", "submit_form_metadata"],
    requiredEvidence: ["effect boundary notes", "approval posture"],
  }),
  createUiBoundaryRule({
    ruleId: "ui_boundary_rule:routing_boundary",
    title: "Routing responsibility boundary",
    category: "routing_boundary",
    allowedResponsibilities: ["own_route_metadata", "compose_children"],
    forbiddenResponsibilities: ["reference_provider_boundary", "reference_runtime_future"],
    reviewRequiredResponsibilities: ["coordinate_data_adapter", "handle_effect_metadata"],
    requiredEvidence: ["routing responsibility notes"],
  }),
  createUiBoundaryRule({
    ruleId: "ui_boundary_rule:data_adapter_boundary",
    title: "Data adapter boundary",
    category: "data_adapter_boundary",
    allowedResponsibilities: ["coordinate_data_adapter"],
    forbiddenResponsibilities: ["reference_provider_boundary", "reference_runtime_future"],
    reviewRequiredResponsibilities: ["handle_effect_metadata", "reference_dashboard_write_path"],
    requiredEvidence: ["data adapter metadata", "expected abstraction summary"],
  }),
  createUiBoundaryRule({
    ruleId: "ui_boundary_rule:form_validation_boundary",
    title: "Form validation boundary",
    category: "form_validation_boundary",
    allowedResponsibilities: ["validate_form_input"],
    forbiddenResponsibilities: ["reference_provider_boundary", "reference_runtime_future"],
    reviewRequiredResponsibilities: ["submit_form_metadata", "reference_dashboard_write_path"],
    requiredEvidence: ["form validation summary", "submission boundary notes"],
  }),
  createUiBoundaryRule({
    ruleId: "ui_boundary_rule:accessibility_boundary",
    title: "Accessibility responsibility boundary",
    category: "accessibility_boundary",
    allowedResponsibilities: ["declare_accessibility_metadata"],
    forbiddenResponsibilities: ["reference_provider_boundary", "reference_runtime_future"],
    reviewRequiredResponsibilities: ["handle_effect_metadata"],
    requiredEvidence: ["accessibility notes", "interactive element summary"],
    severityDefault: "medium",
  }),
  createUiBoundaryRule({
    ruleId: "ui_boundary_rule:design_system_boundary",
    title: "Design system boundary",
    category: "design_system_boundary",
    allowedResponsibilities: ["apply_design_tokens", "render_markup", "compose_children"],
    forbiddenResponsibilities: ["coordinate_data_adapter", "reference_provider_boundary", "reference_runtime_future"],
    reviewRequiredResponsibilities: ["own_local_state"],
    requiredEvidence: ["design token summary", "style responsibility notes"],
  }),
  createUiBoundaryRule({
    ruleId: "ui_boundary_rule:dashboard_write_boundary",
    title: "Dashboard write boundary",
    category: "dashboard_write_boundary",
    allowedResponsibilities: [],
    forbiddenResponsibilities: ["reference_dashboard_write_path"],
    reviewRequiredResponsibilities: ["submit_form_metadata", "handle_effect_metadata"],
    requiredEvidence: ["future gate reference", "approval posture"],
    severityDefault: "critical",
  }),
  createUiBoundaryRule({
    ruleId: "ui_boundary_rule:provider_boundary",
    title: "Provider UI boundary",
    category: "provider_boundary",
    allowedResponsibilities: [],
    forbiddenResponsibilities: ["reference_provider_boundary"],
    reviewRequiredResponsibilities: ["coordinate_data_adapter"],
    requiredEvidence: ["provider boundary notes", "port metadata summary"],
    severityDefault: "high",
  }),
  createUiBoundaryRule({
    ruleId: "ui_boundary_rule:runtime_future_boundary",
    title: "Future runtime UI boundary",
    category: "runtime_future_boundary",
    allowedResponsibilities: [],
    forbiddenResponsibilities: ["reference_runtime_future"],
    reviewRequiredResponsibilities: ["handle_effect_metadata"],
    requiredEvidence: ["future runtime gate reference"],
    severityDefault: "high",
  }),
];

export const selectUiBoundaryRulesByCategory = (
  rules: readonly UiBoundaryRule[],
  category: FrontendResponsibilityCategory,
): UiBoundaryRule[] => rules.filter((rule) => rule.category === category);

export const summarizeUiBoundaryRules = (
  rules: readonly UiBoundaryRule[],
): UiBoundaryRuleSummary => {
  const byCategory = emptyCategoryCounts();

  rules.forEach((rule) => {
    byCategory[rule.category] += 1;
  });

  return {
    summaryId: "ui_boundary_rule_summary:117I",
    schemaVersion: "1.0",
    ruleCount: rules.length,
    byCategory,
    safeSummary: `UI boundary rule summary contains ${rules.length} rule(s).`,
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noDashboardMutation: true,
    noRuntimeExecution: true,
    noScannerExecution: true,
    noRefactorExecution: true,
    safetyBoundaries: solidArchitectureBoundaries,
  };
};

export const defaultUiBoundaryRules = buildDefaultUiBoundaryRules();
