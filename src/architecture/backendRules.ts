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

export type BackendLayerCategory =
  | "controller_boundary"
  | "service_orchestration"
  | "domain_core"
  | "repository_boundary"
  | "adapter_boundary"
  | "provider_boundary"
  | "io_boundary"
  | "config_boundary"
  | "integration_boundary"
  | "runtime_future_boundary"
  | "db_sql_boundary"
  | "auth_security_boundary";

export type BackendLayeringSeverity = ArchitectureSmellSeverity;

export interface BackendLayerCategoryDescription {
  category: BackendLayerCategory;
  label: string;
  safeSummary: string;
  defaultPrinciples: SolidPrinciple[];
  defaultSmellCategories: ArchitectureSmellCategory[];
  defaultSeverity: BackendLayeringSeverity;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
}

export interface BackendLayeringSuggestedAction extends ArchitectureSmellSuggestedAction {
  suggestedPhase?: ProjectPhaseRef;
}

export interface BackendLayeringFinding {
  findingId: string;
  ruleId: string;
  backendLayerCategory: BackendLayerCategory;
  sourceModule: ModuleReference;
  affectedLayer: ModuleLayer;
  severity: BackendLayeringSeverity;
  description: string;
  evidenceRefs: PMEvidenceReference[];
  relatedSolidPrinciples: SolidPrinciple[];
  relatedBoundaryFindingRefs: string[];
  relatedDependencyFindingRefs: string[];
  relatedSmellCategoryRefs: ArchitectureSmellCategory[];
  suggestedAction: BackendLayeringSuggestedAction;
  riskLevel: PMRiskTier;
  approvalRequired: boolean;
  pmEscalation: SolidPmEscalation;
  autopilotUse: SolidAutopilotUse;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noBackendRuntimeMutation: true;
  noProviderExecution: true;
  noDbSqlAccess: true;
  noDashboardMutation: true;
  noRefactorExecution: true;
  noScannerExecution: true;
  noRuntimeExecution: true;
  boundaries: SolidArchitectureBoundarySet;
}

export interface BackendLayeringFindingInput {
  findingId: string;
  ruleId: string;
  backendLayerCategory: BackendLayerCategory;
  sourceModule: ModuleReference;
  description: string;
  suggestedAction: BackendLayeringSuggestedAction;
  affectedLayer?: ModuleLayer;
  severity?: BackendLayeringSeverity;
  evidenceRefs?: PMEvidenceReference[];
  relatedSolidPrinciples?: SolidPrinciple[];
  relatedBoundaryFindingRefs?: string[];
  relatedDependencyFindingRefs?: string[];
  relatedSmellCategoryRefs?: ArchitectureSmellCategory[];
  riskLevel?: PMRiskTier;
  approvalRequired?: boolean;
  pmEscalation?: SolidPmEscalation;
  autopilotUse?: SolidAutopilotUse;
}

export interface BackendLayeringSummary {
  summaryId: string;
  schemaVersion: PMSchemaVersion;
  findingCount: number;
  byCategory: Record<BackendLayerCategory, number>;
  bySeverity: Record<BackendLayeringSeverity, number>;
  byPrinciple: Record<SolidPrinciple, number>;
  highestSeverity: BackendLayeringSeverity;
  safeSummary: string;
  approvalRequired: boolean;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noBackendRuntimeMutation: true;
  noProviderExecution: true;
  noDbSqlAccess: true;
  noDashboardMutation: true;
  noRefactorExecution: true;
  noScannerExecution: true;
  noRuntimeExecution: true;
  boundaries: SolidArchitectureBoundarySet;
}

export const backendLayerCategories = [
  "controller_boundary",
  "service_orchestration",
  "domain_core",
  "repository_boundary",
  "adapter_boundary",
  "provider_boundary",
  "io_boundary",
  "config_boundary",
  "integration_boundary",
  "runtime_future_boundary",
  "db_sql_boundary",
  "auth_security_boundary",
] as const satisfies readonly BackendLayerCategory[];

const categoryDescriptions: Record<BackendLayerCategory, BackendLayerCategoryDescription> = {
  controller_boundary: {
    category: "controller_boundary",
    label: "Controller boundary",
    safeSummary: "Request and response metadata boundary for API/controller responsibilities.",
    defaultPrinciples: ["srp", "isp"],
    defaultSmellCategories: ["ambiguous_boundary", "hidden_side_effect"],
    defaultSeverity: "medium",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  service_orchestration: {
    category: "service_orchestration",
    label: "Service orchestration",
    safeSummary: "Application service metadata for use-case coordination without direct IO.",
    defaultPrinciples: ["srp", "ocp", "dip"],
    defaultSmellCategories: ["responsibility_overload", "hidden_side_effect"],
    defaultSeverity: "medium",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  domain_core: {
    category: "domain_core",
    label: "Domain core",
    safeSummary: "Domain logic metadata that should stay free of infrastructure details.",
    defaultPrinciples: ["srp", "dip"],
    defaultSmellCategories: ["core_infra_coupling", "ambiguous_boundary"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  repository_boundary: {
    category: "repository_boundary",
    label: "Repository boundary",
    safeSummary: "Persistence contract metadata without database client activity.",
    defaultPrinciples: ["dip", "isp"],
    defaultSmellCategories: ["hidden_side_effect", "core_infra_coupling"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  adapter_boundary: {
    category: "adapter_boundary",
    label: "Adapter boundary",
    safeSummary: "Concrete IO translation metadata that should sit behind ports.",
    defaultPrinciples: ["dip", "ocp"],
    defaultSmellCategories: ["core_infra_coupling", "provider_leakage"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  provider_boundary: {
    category: "provider_boundary",
    label: "Provider boundary",
    safeSummary: "Provider-adjacent metadata that must remain behind future approved ports.",
    defaultPrinciples: ["dip"],
    defaultSmellCategories: ["provider_leakage", "approval_bypass_risk"],
    defaultSeverity: "critical",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  io_boundary: {
    category: "io_boundary",
    label: "IO boundary",
    safeSummary: "External interaction metadata separated from domain and advisory layers.",
    defaultPrinciples: ["srp", "dip"],
    defaultSmellCategories: ["hidden_side_effect", "automation_overreach"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  config_boundary: {
    category: "config_boundary",
    label: "Config boundary",
    safeSummary: "Configuration ownership metadata without environment reads or writes.",
    defaultPrinciples: ["srp", "dip"],
    defaultSmellCategories: ["core_infra_coupling", "hidden_side_effect"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  integration_boundary: {
    category: "integration_boundary",
    label: "Integration boundary",
    safeSummary: "External-system relationship metadata without connector activity.",
    defaultPrinciples: ["dip", "ocp"],
    defaultSmellCategories: ["provider_leakage", "automation_overreach"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  runtime_future_boundary: {
    category: "runtime_future_boundary",
    label: "Runtime future boundary",
    safeSummary: "Future runtime concern represented only as gated metadata.",
    defaultPrinciples: ["srp", "dip"],
    defaultSmellCategories: ["runtime_dependency_in_source_only", "automation_overreach"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  db_sql_boundary: {
    category: "db_sql_boundary",
    label: "Database and SQL boundary",
    safeSummary: "Persistence state boundary metadata without schema or query changes.",
    defaultPrinciples: ["dip", "srp"],
    defaultSmellCategories: ["hidden_side_effect", "approval_bypass_risk"],
    defaultSeverity: "critical",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  auth_security_boundary: {
    category: "auth_security_boundary",
    label: "Auth and security boundary",
    safeSummary: "Authentication, authorization, and approval-sensitive metadata.",
    defaultPrinciples: ["srp", "dip", "isp"],
    defaultSmellCategories: ["approval_bypass_risk", "hidden_side_effect"],
    defaultSeverity: "critical",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
};

const emptyCategoryCounts = (): Record<BackendLayerCategory, number> => ({
  controller_boundary: 0,
  service_orchestration: 0,
  domain_core: 0,
  repository_boundary: 0,
  adapter_boundary: 0,
  provider_boundary: 0,
  io_boundary: 0,
  config_boundary: 0,
  integration_boundary: 0,
  runtime_future_boundary: 0,
  db_sql_boundary: 0,
  auth_security_boundary: 0,
});

const emptySeverityCounts = (): Record<BackendLayeringSeverity, number> => ({
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

export const describeBackendLayerCategory = (
  category: BackendLayerCategory,
): BackendLayerCategoryDescription => ({
  ...categoryDescriptions[category],
  defaultPrinciples: [...categoryDescriptions[category].defaultPrinciples],
  defaultSmellCategories: [...categoryDescriptions[category].defaultSmellCategories],
});

export const createBackendLayeringFinding = (
  input: BackendLayeringFindingInput,
): BackendLayeringFinding => {
  const description = describeBackendLayerCategory(input.backendLayerCategory);
  const riskLevel = input.riskLevel ?? input.suggestedAction.riskLevel;
  const severity = input.severity ?? description.defaultSeverity;

  return {
    findingId: input.findingId,
    ruleId: input.ruleId,
    backendLayerCategory: input.backendLayerCategory,
    sourceModule: input.sourceModule,
    affectedLayer: input.affectedLayer ?? input.sourceModule.layer,
    severity,
    description: input.description,
    evidenceRefs: input.evidenceRefs ?? [],
    relatedSolidPrinciples: input.relatedSolidPrinciples ?? description.defaultPrinciples,
    relatedBoundaryFindingRefs: input.relatedBoundaryFindingRefs ?? [],
    relatedDependencyFindingRefs: input.relatedDependencyFindingRefs ?? [],
    relatedSmellCategoryRefs: input.relatedSmellCategoryRefs ?? description.defaultSmellCategories,
    suggestedAction: input.suggestedAction,
    riskLevel,
    approvalRequired: input.approvalRequired ?? input.suggestedAction.requiresHumanApproval,
    pmEscalation: input.pmEscalation ?? "pm_status_report",
    autopilotUse: input.autopilotUse ?? "not_applicable",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noBackendRuntimeMutation: true,
    noProviderExecution: true,
    noDbSqlAccess: true,
    noDashboardMutation: true,
    noRefactorExecution: true,
    noScannerExecution: true,
    noRuntimeExecution: true,
    boundaries: solidArchitectureBoundaries,
  };
};

export const summarizeBackendLayeringFindings = (
  findings: readonly BackendLayeringFinding[],
): BackendLayeringSummary => {
  const byCategory = emptyCategoryCounts();
  const bySeverity = emptySeverityCounts();
  const byPrinciple = emptyPrincipleCounts();
  let highestSeverity: BackendLayeringSeverity = "info";
  let approvalRequired = false;

  findings.forEach((finding) => {
    byCategory[finding.backendLayerCategory] += 1;
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
    summaryId: "backend_layering_summary:118I",
    schemaVersion: "1.0",
    findingCount: findings.length,
    byCategory,
    bySeverity,
    byPrinciple,
    highestSeverity,
    safeSummary: `Backend layering summary contains ${findings.length} finding(s); highest severity is ${highestSeverity}.`,
    approvalRequired,
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noBackendRuntimeMutation: true,
    noProviderExecution: true,
    noDbSqlAccess: true,
    noDashboardMutation: true,
    noRefactorExecution: true,
    noScannerExecution: true,
    noRuntimeExecution: true,
    boundaries: solidArchitectureBoundaries,
  };
};
