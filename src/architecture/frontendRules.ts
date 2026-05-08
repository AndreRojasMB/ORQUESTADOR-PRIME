import {
  solidArchitectureBoundaries,
  type SolidArchitectureBoundarySet,
} from "./solidBoundaries.js";
import type {
  ArchitectureSmellCategory,
  ArchitectureSmellSuggestedAction,
} from "./smellTaxonomy.js";
import {
  compareArchitectureSmellSeverity,
  type ArchitectureSmellSeverity,
} from "./smellSeverity.js";
import type {
  ModuleLayer,
  ModuleReference,
} from "./moduleBoundaries.js";
import type {
  SolidAutopilotUse,
  SolidPmEscalation,
  SolidPrinciple,
} from "./solidTypes.js";
import type {
  PMEvidenceReference,
  PMRiskTier,
  PMSchemaVersion,
  ProjectPhaseRef,
} from "../pm/types.js";

export type FrontendResponsibilityCategory =
  | "presentation_only"
  | "container_orchestration"
  | "state_management"
  | "effect_boundary"
  | "routing_boundary"
  | "data_adapter_boundary"
  | "form_validation_boundary"
  | "accessibility_boundary"
  | "design_system_boundary"
  | "dashboard_write_boundary"
  | "provider_boundary"
  | "runtime_future_boundary";

export type FrontendResponsibilitySeverity = ArchitectureSmellSeverity;

export interface FrontendComponentReference {
  componentRefId: string;
  label: string;
  safeSummary: string;
  responsibilityCategory: FrontendResponsibilityCategory;
  metadataOnly: true;
  noFileRead: true;
}

export interface FrontendResponsibilityCategoryDescription {
  category: FrontendResponsibilityCategory;
  label: string;
  safeSummary: string;
  defaultPrinciples: SolidPrinciple[];
  defaultSmellCategories: ArchitectureSmellCategory[];
  defaultSeverity: FrontendResponsibilitySeverity;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
}

export interface FrontendResponsibilitySuggestedAction extends ArchitectureSmellSuggestedAction {
  suggestedPhase?: ProjectPhaseRef;
}

export interface FrontendResponsibilityFinding {
  findingId: string;
  ruleId: string;
  responsibilityCategory: FrontendResponsibilityCategory;
  sourceModule: ModuleReference;
  affectedComponent: FrontendComponentReference;
  affectedLayer: ModuleLayer;
  severity: FrontendResponsibilitySeverity;
  description: string;
  evidenceRefs: PMEvidenceReference[];
  relatedSolidPrinciples: SolidPrinciple[];
  relatedSmellCategoryRefs: ArchitectureSmellCategory[];
  suggestedAction: FrontendResponsibilitySuggestedAction;
  riskLevel: PMRiskTier;
  approvalRequired: boolean;
  pmEscalation: SolidPmEscalation;
  autopilotUse: SolidAutopilotUse;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noDashboardMutation: true;
  noRefactorExecution: true;
  noScannerExecution: true;
  noRuntimeExecution: true;
  boundaries: SolidArchitectureBoundarySet;
}

export interface FrontendResponsibilityFindingInput {
  findingId: string;
  ruleId: string;
  responsibilityCategory: FrontendResponsibilityCategory;
  sourceModule: ModuleReference;
  affectedComponent: FrontendComponentReference;
  description: string;
  suggestedAction: FrontendResponsibilitySuggestedAction;
  affectedLayer?: ModuleLayer;
  severity?: FrontendResponsibilitySeverity;
  evidenceRefs?: PMEvidenceReference[];
  relatedSolidPrinciples?: SolidPrinciple[];
  relatedSmellCategoryRefs?: ArchitectureSmellCategory[];
  riskLevel?: PMRiskTier;
  approvalRequired?: boolean;
  pmEscalation?: SolidPmEscalation;
  autopilotUse?: SolidAutopilotUse;
}

export interface FrontendResponsibilitySummary {
  summaryId: string;
  schemaVersion: PMSchemaVersion;
  findingCount: number;
  byCategory: Record<FrontendResponsibilityCategory, number>;
  bySeverity: Record<FrontendResponsibilitySeverity, number>;
  byPrinciple: Record<SolidPrinciple, number>;
  highestSeverity: FrontendResponsibilitySeverity;
  safeSummary: string;
  approvalRequired: boolean;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noDashboardMutation: true;
  noRefactorExecution: true;
  noScannerExecution: true;
  noRuntimeExecution: true;
  boundaries: SolidArchitectureBoundarySet;
}

export const frontendResponsibilityCategories = [
  "presentation_only",
  "container_orchestration",
  "state_management",
  "effect_boundary",
  "routing_boundary",
  "data_adapter_boundary",
  "form_validation_boundary",
  "accessibility_boundary",
  "design_system_boundary",
  "dashboard_write_boundary",
  "provider_boundary",
  "runtime_future_boundary",
] as const satisfies readonly FrontendResponsibilityCategory[];

const categoryDescriptions: Record<FrontendResponsibilityCategory, FrontendResponsibilityCategoryDescription> = {
  presentation_only: {
    category: "presentation_only",
    label: "Presentation only",
    safeSummary: "Visual component metadata limited to rendering, composition, and props.",
    defaultPrinciples: ["srp", "isp"],
    defaultSmellCategories: ["responsibility_overload"],
    defaultSeverity: "low",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  container_orchestration: {
    category: "container_orchestration",
    label: "Container orchestration",
    safeSummary: "Container metadata for state, adapter coordination, and view composition.",
    defaultPrinciples: ["srp", "ocp", "dip"],
    defaultSmellCategories: ["ambiguous_boundary", "hidden_side_effect"],
    defaultSeverity: "medium",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  state_management: {
    category: "state_management",
    label: "State management",
    safeSummary: "State ownership and update responsibility metadata.",
    defaultPrinciples: ["srp"],
    defaultSmellCategories: ["responsibility_overload", "ambiguous_boundary"],
    defaultSeverity: "medium",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  effect_boundary: {
    category: "effect_boundary",
    label: "Effect boundary",
    safeSummary: "Side-effect isolation and review metadata for UI behavior.",
    defaultPrinciples: ["srp", "dip"],
    defaultSmellCategories: ["hidden_side_effect", "automation_overreach"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  routing_boundary: {
    category: "routing_boundary",
    label: "Routing boundary",
    safeSummary: "Navigation and route ownership metadata separated from visual rendering.",
    defaultPrinciples: ["srp", "ocp"],
    defaultSmellCategories: ["ambiguous_boundary"],
    defaultSeverity: "medium",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  data_adapter_boundary: {
    category: "data_adapter_boundary",
    label: "Data adapter boundary",
    safeSummary: "Caller-supplied data adapter metadata for UI boundaries.",
    defaultPrinciples: ["dip", "ocp"],
    defaultSmellCategories: ["core_infra_coupling", "provider_leakage"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  form_validation_boundary: {
    category: "form_validation_boundary",
    label: "Form validation boundary",
    safeSummary: "Form validation metadata separated from submission side effects.",
    defaultPrinciples: ["srp", "isp"],
    defaultSmellCategories: ["hidden_side_effect", "approval_bypass_risk"],
    defaultSeverity: "medium",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  accessibility_boundary: {
    category: "accessibility_boundary",
    label: "Accessibility boundary",
    safeSummary: "Interactive UI accessibility responsibility metadata.",
    defaultPrinciples: ["srp", "isp"],
    defaultSmellCategories: ["ambiguous_boundary"],
    defaultSeverity: "medium",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  design_system_boundary: {
    category: "design_system_boundary",
    label: "Design system boundary",
    safeSummary: "Design token, style, and visual consistency responsibility metadata.",
    defaultPrinciples: ["srp", "ocp"],
    defaultSmellCategories: ["ambiguous_boundary", "oversized_interface"],
    defaultSeverity: "low",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  dashboard_write_boundary: {
    category: "dashboard_write_boundary",
    label: "Dashboard write boundary",
    safeSummary: "Future-gated dashboard write-path concern represented only as metadata.",
    defaultPrinciples: ["srp", "dip"],
    defaultSmellCategories: ["dashboard_write_leakage", "approval_bypass_risk"],
    defaultSeverity: "critical",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  provider_boundary: {
    category: "provider_boundary",
    label: "Provider boundary",
    safeSummary: "Provider-adjacent UI concern that must stay behind future approved metadata.",
    defaultPrinciples: ["dip"],
    defaultSmellCategories: ["provider_leakage", "core_infra_coupling"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  runtime_future_boundary: {
    category: "runtime_future_boundary",
    label: "Runtime future boundary",
    safeSummary: "Future runtime UI concern that remains gated and advisory.",
    defaultPrinciples: ["dip", "srp"],
    defaultSmellCategories: ["runtime_dependency_in_source_only", "automation_overreach"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
};

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

const emptySeverityCounts = (): Record<FrontendResponsibilitySeverity, number> => ({
  info: 0,
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
});

const emptyPrincipleCounts = (): Record<SolidPrinciple, number> => ({
  srp: 0,
  ocp: 0,
  lsp: 0,
  isp: 0,
  dip: 0,
});

export const describeFrontendResponsibilityCategory = (
  category: FrontendResponsibilityCategory,
): FrontendResponsibilityCategoryDescription => ({
  ...categoryDescriptions[category],
  defaultPrinciples: [...categoryDescriptions[category].defaultPrinciples],
  defaultSmellCategories: [...categoryDescriptions[category].defaultSmellCategories],
});

export const createFrontendResponsibilityFinding = (
  input: FrontendResponsibilityFindingInput,
): FrontendResponsibilityFinding => {
  const description = describeFrontendResponsibilityCategory(input.responsibilityCategory);
  const riskLevel = input.riskLevel ?? input.suggestedAction.riskLevel;
  const severity = input.severity ?? description.defaultSeverity;

  return {
    findingId: input.findingId,
    ruleId: input.ruleId,
    responsibilityCategory: input.responsibilityCategory,
    sourceModule: input.sourceModule,
    affectedComponent: input.affectedComponent,
    affectedLayer: input.affectedLayer ?? input.sourceModule.layer,
    severity,
    description: input.description,
    evidenceRefs: input.evidenceRefs ?? [],
    relatedSolidPrinciples: input.relatedSolidPrinciples ?? description.defaultPrinciples,
    relatedSmellCategoryRefs: input.relatedSmellCategoryRefs ?? description.defaultSmellCategories,
    suggestedAction: input.suggestedAction,
    riskLevel,
    approvalRequired: input.approvalRequired ?? input.suggestedAction.requiresHumanApproval,
    pmEscalation: input.pmEscalation ?? "pm_status_report",
    autopilotUse: input.autopilotUse ?? "validation_context_only",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noDashboardMutation: true,
    noRefactorExecution: true,
    noScannerExecution: true,
    noRuntimeExecution: true,
    boundaries: solidArchitectureBoundaries,
  };
};

export const summarizeFrontendResponsibilityFindings = (
  findings: readonly FrontendResponsibilityFinding[],
): FrontendResponsibilitySummary => {
  const byCategory = emptyCategoryCounts();
  const bySeverity = emptySeverityCounts();
  const byPrinciple = emptyPrincipleCounts();
  let highestSeverity: FrontendResponsibilitySeverity = "info";
  let approvalRequired = false;

  findings.forEach((finding) => {
    byCategory[finding.responsibilityCategory] += 1;
    bySeverity[finding.severity] += 1;
    finding.relatedSolidPrinciples.forEach((principle) => {
      byPrinciple[principle] += 1;
    });
    if (compareArchitectureSmellSeverity(finding.severity, highestSeverity) > 0) {
      highestSeverity = finding.severity;
    }
    approvalRequired = approvalRequired || finding.approvalRequired;
  });

  return {
    summaryId: "frontend_responsibility_summary:117I",
    schemaVersion: "1.0",
    findingCount: findings.length,
    byCategory,
    bySeverity,
    byPrinciple,
    highestSeverity,
    safeSummary: `Frontend responsibility summary contains ${findings.length} finding(s); highest severity is ${highestSeverity}.`,
    approvalRequired,
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noDashboardMutation: true,
    noRefactorExecution: true,
    noScannerExecution: true,
    noRuntimeExecution: true,
    boundaries: solidArchitectureBoundaries,
  };
};
