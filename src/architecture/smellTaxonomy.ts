import {
  solidArchitectureBoundaries,
  type SolidArchitectureBoundarySet,
} from "./solidBoundaries.js";
import {
  classifyArchitectureSmellSeverity,
  compareArchitectureSmellSeverity,
  type ArchitectureSmellSeverity,
  type ArchitectureSmellSeverityInput,
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

export type ArchitectureSmellCategory =
  | "responsibility_overload"
  | "core_infra_coupling"
  | "provider_leakage"
  | "dashboard_write_leakage"
  | "runtime_dependency_in_source_only"
  | "ambiguous_boundary"
  | "oversized_interface"
  | "contract_substitution_risk"
  | "extension_blocked_by_core_modification"
  | "hidden_side_effect"
  | "approval_bypass_risk"
  | "automation_overreach";

export interface ArchitectureSmellCategoryDescription {
  category: ArchitectureSmellCategory;
  label: string;
  safeSummary: string;
  defaultPrinciples: SolidPrinciple[];
  defaultSeverity: ArchitectureSmellSeverity;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
}

export interface ArchitectureSmellSuggestedAction {
  actionId: string;
  label: string;
  safeSummary: string;
  recommendedPhase?: ProjectPhaseRef;
  requiresHumanApproval: boolean;
  riskLevel: PMRiskTier;
  metadataOnly: true;
  advisoryOnly: true;
  noExecution: true;
  noRefactorExecution: true;
  noScannerExecution: true;
}

export interface ArchitectureSmellFinding {
  findingId: string;
  smellCategory: ArchitectureSmellCategory;
  relatedPrinciples: SolidPrinciple[];
  sourceModule: ModuleReference;
  affectedLayer: ModuleLayer;
  severity: ArchitectureSmellSeverity;
  description: string;
  evidenceRefs: PMEvidenceReference[];
  relatedBoundaryFindingRefs: string[];
  relatedDependencyFindingRefs: string[];
  suggestedAction: ArchitectureSmellSuggestedAction;
  riskLevel: PMRiskTier;
  approvalRequired: boolean;
  pmEscalation: SolidPmEscalation;
  autopilotUse: SolidAutopilotUse;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noRefactorExecution: true;
  noScannerExecution: true;
  noRuntimeExecution: true;
  boundaries: SolidArchitectureBoundarySet;
}

export interface ArchitectureSmellFindingInput {
  findingId: string;
  smellCategory: ArchitectureSmellCategory;
  sourceModule: ModuleReference;
  description: string;
  suggestedAction: ArchitectureSmellSuggestedAction;
  relatedPrinciples?: SolidPrinciple[];
  affectedLayer?: ModuleLayer;
  severity?: ArchitectureSmellSeverity;
  evidenceRefs?: PMEvidenceReference[];
  relatedBoundaryFindingRefs?: string[];
  relatedDependencyFindingRefs?: string[];
  riskLevel?: PMRiskTier;
  approvalRequired?: boolean;
  pmEscalation?: SolidPmEscalation;
  autopilotUse?: SolidAutopilotUse;
  severityInput?: Omit<ArchitectureSmellSeverityInput, "smellCategory" | "relatedPrinciples" | "affectedLayer" | "riskLevel" | "approvalRequired">;
}

export interface ArchitectureSmellSummary {
  summaryId: string;
  schemaVersion: PMSchemaVersion;
  findingCount: number;
  byCategory: Record<ArchitectureSmellCategory, number>;
  bySeverity: Record<ArchitectureSmellSeverity, number>;
  byPrinciple: Record<SolidPrinciple, number>;
  highestSeverity: ArchitectureSmellSeverity;
  safeSummary: string;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noRefactorExecution: true;
  noScannerExecution: true;
  noRuntimeExecution: true;
  boundaries: SolidArchitectureBoundarySet;
}

export const architectureSmellCategories = [
  "responsibility_overload",
  "core_infra_coupling",
  "provider_leakage",
  "dashboard_write_leakage",
  "runtime_dependency_in_source_only",
  "ambiguous_boundary",
  "oversized_interface",
  "contract_substitution_risk",
  "extension_blocked_by_core_modification",
  "hidden_side_effect",
  "approval_bypass_risk",
  "automation_overreach",
] as const satisfies readonly ArchitectureSmellCategory[];

const categoryDescriptions: Record<ArchitectureSmellCategory, ArchitectureSmellCategoryDescription> = {
  responsibility_overload: {
    category: "responsibility_overload",
    label: "Responsibility overload",
    safeSummary: "A module or layer appears to own too many reasons to change.",
    defaultPrinciples: ["srp"],
    defaultSeverity: "low",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  core_infra_coupling: {
    category: "core_infra_coupling",
    label: "Core infrastructure coupling",
    safeSummary: "Core or source-only modules are coupled to infrastructure concepts.",
    defaultPrinciples: ["dip", "srp"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  provider_leakage: {
    category: "provider_leakage",
    label: "Provider leakage",
    safeSummary: "Provider-adjacent details appear in source-only or advisory layers.",
    defaultPrinciples: ["dip"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  dashboard_write_leakage: {
    category: "dashboard_write_leakage",
    label: "Dashboard write leakage",
    safeSummary: "Dashboard write concerns appear in layers that should remain advisory or read-only.",
    defaultPrinciples: ["srp", "dip"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  runtime_dependency_in_source_only: {
    category: "runtime_dependency_in_source_only",
    label: "Runtime dependency in source-only layer",
    safeSummary: "Runtime concepts appear in modules that are supposed to remain source-only.",
    defaultPrinciples: ["dip"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  ambiguous_boundary: {
    category: "ambiguous_boundary",
    label: "Ambiguous boundary",
    safeSummary: "Layer ownership or dependency direction is unclear.",
    defaultPrinciples: ["srp", "dip"],
    defaultSeverity: "medium",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  oversized_interface: {
    category: "oversized_interface",
    label: "Oversized interface",
    safeSummary: "A contract is likely too broad for its consumers.",
    defaultPrinciples: ["isp"],
    defaultSeverity: "medium",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  contract_substitution_risk: {
    category: "contract_substitution_risk",
    label: "Contract substitution risk",
    safeSummary: "A replacement implementation may not safely satisfy the same contract.",
    defaultPrinciples: ["lsp"],
    defaultSeverity: "medium",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  extension_blocked_by_core_modification: {
    category: "extension_blocked_by_core_modification",
    label: "Extension blocked by core modification",
    safeSummary: "A change requires modifying core instead of extending through a contract or port.",
    defaultPrinciples: ["ocp", "dip"],
    defaultSeverity: "medium",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  hidden_side_effect: {
    category: "hidden_side_effect",
    label: "Hidden side effect",
    safeSummary: "An advisory API appears to imply writes, sends, persistence, launches, or external effects.",
    defaultPrinciples: ["srp", "dip"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  approval_bypass_risk: {
    category: "approval_bypass_risk",
    label: "Approval bypass risk",
    safeSummary: "A design could route around approval metadata, human review, or future gates.",
    defaultPrinciples: ["srp", "dip"],
    defaultSeverity: "critical",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  automation_overreach: {
    category: "automation_overreach",
    label: "Automation overreach",
    safeSummary: "An automation layer is shaped as if it can execute beyond approved autonomy.",
    defaultPrinciples: ["srp", "dip"],
    defaultSeverity: "high",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
};

export const describeArchitectureSmellCategory = (
  category: ArchitectureSmellCategory,
): ArchitectureSmellCategoryDescription => ({
  ...categoryDescriptions[category],
  defaultPrinciples: [...categoryDescriptions[category].defaultPrinciples],
});

export const mapSmellToSolidPrinciples = (
  category: ArchitectureSmellCategory,
): SolidPrinciple[] => [...categoryDescriptions[category].defaultPrinciples];

export const createArchitectureSmellFinding = (
  input: ArchitectureSmellFindingInput,
): ArchitectureSmellFinding => {
  const relatedPrinciples = input.relatedPrinciples ?? mapSmellToSolidPrinciples(input.smellCategory);
  const affectedLayer = input.affectedLayer ?? input.sourceModule.layer;
  const riskLevel = input.riskLevel ?? input.suggestedAction.riskLevel;
  const approvalRequired = input.approvalRequired ?? input.suggestedAction.requiresHumanApproval;
  const relatedBoundaryFindingRefs = input.relatedBoundaryFindingRefs ?? [];
  const relatedDependencyFindingRefs = input.relatedDependencyFindingRefs ?? [];
  const severity =
    input.severity ??
    classifyArchitectureSmellSeverity({
      smellCategory: input.smellCategory,
      relatedPrinciples,
      affectedLayer,
      riskLevel,
      approvalRequired,
      hasBoundaryRefs: relatedBoundaryFindingRefs["length"] > 0,
      hasDependencyRefs: relatedDependencyFindingRefs["length"] > 0,
      ...(input.severityInput ?? {}),
    });

  return {
    findingId: input.findingId,
    smellCategory: input.smellCategory,
    relatedPrinciples,
    sourceModule: input.sourceModule,
    affectedLayer,
    severity,
    description: input.description,
    evidenceRefs: input.evidenceRefs ?? [],
    relatedBoundaryFindingRefs,
    relatedDependencyFindingRefs,
    suggestedAction: input.suggestedAction,
    riskLevel,
    approvalRequired,
    pmEscalation: input.pmEscalation ?? "pm_status_report",
    autopilotUse: input.autopilotUse ?? "not_applicable",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noRefactorExecution: true,
    noScannerExecution: true,
    noRuntimeExecution: true,
    boundaries: solidArchitectureBoundaries,
  };
};

const emptyCategoryCounts = (): Record<ArchitectureSmellCategory, number> => ({
  responsibility_overload: 0,
  core_infra_coupling: 0,
  provider_leakage: 0,
  dashboard_write_leakage: 0,
  runtime_dependency_in_source_only: 0,
  ambiguous_boundary: 0,
  oversized_interface: 0,
  contract_substitution_risk: 0,
  extension_blocked_by_core_modification: 0,
  hidden_side_effect: 0,
  approval_bypass_risk: 0,
  automation_overreach: 0,
});

const emptySeverityCounts = (): Record<ArchitectureSmellSeverity, number> => ({
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

export const summarizeArchitectureSmellFindings = (
  findings: readonly ArchitectureSmellFinding[],
): ArchitectureSmellSummary => {
  const byCategory = emptyCategoryCounts();
  const bySeverity = emptySeverityCounts();
  const byPrinciple = emptyPrincipleCounts();
  let highestSeverity: ArchitectureSmellSeverity = "info";

  findings.forEach((finding) => {
    byCategory[finding.smellCategory] += 1;
    bySeverity[finding.severity] += 1;
    finding.relatedPrinciples.forEach((principle) => {
      byPrinciple[principle] += 1;
    });
    if (compareArchitectureSmellSeverity(finding.severity, highestSeverity) > 0) {
      highestSeverity = finding.severity;
    }
  });

  return {
    summaryId: "architecture_smell_summary:114I",
    schemaVersion: "1.0",
    findingCount: findings["length"],
    byCategory,
    bySeverity,
    byPrinciple,
    highestSeverity,
    safeSummary: `Architecture smell summary contains ${findings["length"]} finding(s); highest severity is ${highestSeverity}.`,
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noRefactorExecution: true,
    noScannerExecution: true,
    noRuntimeExecution: true,
    boundaries: solidArchitectureBoundaries,
  };
};
