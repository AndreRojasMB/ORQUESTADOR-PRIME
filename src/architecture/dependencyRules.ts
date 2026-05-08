import {
  solidArchitectureBoundaries,
  type SolidArchitectureBoundarySet,
} from "./solidBoundaries.js";
import type {
  SolidAutopilotUse,
  SolidPmEscalation,
} from "./solidTypes.js";
import type {
  ModuleBoundarySeverity,
  ModuleImportPolicy,
  ModuleLayer,
  ModuleReference,
} from "./moduleBoundaries.js";
import type {
  PMEvidenceReference,
  PMRiskTier,
  PMSchemaVersion,
  ProjectPhaseRef,
} from "../pm/types.js";

export type DependencyCategory =
  | "domain_contract"
  | "source_only_metadata"
  | "port"
  | "adapter"
  | "provider"
  | "runtime"
  | "dashboard"
  | "script"
  | "test"
  | "config"
  | "external_future";

export type DependencyPolicy = ModuleImportPolicy;

export type DependencyInversionSeverity = ModuleBoundarySeverity;

export interface DependencyCategoryDescription {
  category: DependencyCategory;
  label: string;
  safeSummary: string;
  preferredPolicy: DependencyPolicy;
  expectedAbstractionCategory?: DependencyCategory;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
}

export interface DependencyAbstraction {
  abstractionId: string;
  category: DependencyCategory;
  label: string;
  safeSummary: string;
  metadataOnly: true;
  sourceOnly: true;
  noRuntimeExecution: true;
}

export interface DependencyActualReference {
  dependencyId: string;
  category: DependencyCategory;
  importPath: string;
  isConcrete: boolean;
  isRuntime: boolean;
  isProvider: boolean;
  isDashboard: boolean;
  metadataOnly: true;
  noFileRead: true;
}

export interface DependencyInversionSuggestedAction {
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

export interface DependencyPolicyInput {
  sourceLayer: ModuleLayer;
  targetLayer: ModuleLayer;
  targetCategory: DependencyCategory;
  isConcrete?: boolean;
  isRuntime?: boolean;
  isProvider?: boolean;
  isDashboard?: boolean;
  isAllowedTypeOnly?: boolean;
}

export interface DependencyInversionRule {
  ruleId: string;
  sourceLayer: ModuleLayer;
  targetLayer: ModuleLayer;
  sourceCategory: DependencyCategory;
  targetCategory: DependencyCategory;
  expectedAbstractionCategory: DependencyCategory;
  allowedPolicies: DependencyPolicy[];
  violationSeverity: DependencyInversionSeverity;
  rationale: string;
  pmEscalation: SolidPmEscalation;
  autopilotUse: SolidAutopilotUse;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noRefactorExecution: true;
  noScannerExecution: true;
  noRuntimeExecution: true;
}

export interface DependencyInversionFinding {
  findingId: string;
  sourceModule: ModuleReference;
  targetModule: ModuleReference;
  dependencyCategory: DependencyCategory;
  expectedAbstraction: DependencyAbstraction;
  actualDependency: DependencyActualReference;
  policy: DependencyPolicy;
  severity: DependencyInversionSeverity;
  description: string;
  evidenceRefs: PMEvidenceReference[];
  suggestedAction: DependencyInversionSuggestedAction;
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

export interface DependencyInversionFindingInput {
  findingId: string;
  sourceModule: ModuleReference;
  targetModule: ModuleReference;
  expectedAbstraction: DependencyAbstraction;
  actualDependency: DependencyActualReference;
  description: string;
  suggestedAction: DependencyInversionSuggestedAction;
  policy?: DependencyPolicy;
  severity?: DependencyInversionSeverity;
  evidenceRefs?: PMEvidenceReference[];
  riskLevel?: PMRiskTier;
  approvalRequired?: boolean;
  pmEscalation?: SolidPmEscalation;
  autopilotUse?: SolidAutopilotUse;
}

export interface DependencyInversionSummary {
  summaryId: string;
  schemaVersion: PMSchemaVersion;
  findingCount: number;
  byPolicy: Record<DependencyPolicy, number>;
  bySeverity: Record<DependencyInversionSeverity, number>;
  byCategory: Record<DependencyCategory, number>;
  highestSeverity: DependencyInversionSeverity;
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

export const dependencyCategories = [
  "domain_contract",
  "source_only_metadata",
  "port",
  "adapter",
  "provider",
  "runtime",
  "dashboard",
  "script",
  "test",
  "config",
  "external_future",
] as const satisfies readonly DependencyCategory[];

export const dependencyPolicies = [
  "allowed",
  "allowed_type_only",
  "review_required",
  "forbidden",
  "future_gated",
] as const satisfies readonly DependencyPolicy[];

export const dependencyInversionSeverities = [
  "info",
  "warn",
  "fail",
  "critical",
] as const satisfies readonly DependencyInversionSeverity[];

const advisoryLayers: readonly ModuleLayer[] = ["pm", "architecture", "autopilot"];
const concreteCategories: readonly DependencyCategory[] = ["adapter", "provider", "runtime", "dashboard", "config"];

const severityRank: Record<DependencyInversionSeverity, number> = {
  info: 0,
  warn: 1,
  fail: 2,
  critical: 3,
};

const categoryDescriptions: Record<DependencyCategory, DependencyCategoryDescription> = {
  domain_contract: {
    category: "domain_contract",
    label: "Domain contract",
    safeSummary: "Stable domain contract or shared type vocabulary.",
    preferredPolicy: "allowed_type_only",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  source_only_metadata: {
    category: "source_only_metadata",
    label: "Source-only metadata",
    safeSummary: "Advisory metadata that does not represent runtime behavior.",
    preferredPolicy: "allowed_type_only",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  port: {
    category: "port",
    label: "Port",
    safeSummary: "Abstraction boundary for a future adapter relationship.",
    preferredPolicy: "allowed_type_only",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  adapter: {
    category: "adapter",
    label: "Adapter",
    safeSummary: "Concrete adapter boundary that should not be imported by source-only domains.",
    preferredPolicy: "review_required",
    expectedAbstractionCategory: "port",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  provider: {
    category: "provider",
    label: "Provider",
    safeSummary: "Provider-adjacent dependency that must stay outside source-only domains.",
    preferredPolicy: "forbidden",
    expectedAbstractionCategory: "port",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  runtime: {
    category: "runtime",
    label: "Runtime",
    safeSummary: "Execution-capable dependency reserved for future gated phases.",
    preferredPolicy: "future_gated",
    expectedAbstractionCategory: "port",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  dashboard: {
    category: "dashboard",
    label: "Dashboard",
    safeSummary: "UI dependency that needs a future read-only contract before source-only use.",
    preferredPolicy: "future_gated",
    expectedAbstractionCategory: "source_only_metadata",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  script: {
    category: "script",
    label: "Script",
    safeSummary: "Verification helper dependency that should not become production source dependency.",
    preferredPolicy: "review_required",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  test: {
    category: "test",
    label: "Test",
    safeSummary: "Test dependency allowed as verification context only.",
    preferredPolicy: "review_required",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  config: {
    category: "config",
    label: "Config",
    safeSummary: "Configuration-adjacent dependency that must stay out of source-only domains.",
    preferredPolicy: "forbidden",
    expectedAbstractionCategory: "port",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
  external_future: {
    category: "external_future",
    label: "Future external",
    safeSummary: "External relationship reserved for a later approved phase.",
    preferredPolicy: "future_gated",
    expectedAbstractionCategory: "port",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
  },
};

export const describeDependencyCategory = (
  category: DependencyCategory,
): DependencyCategoryDescription => ({
  ...categoryDescriptions[category],
});

export const classifyDependencyPolicy = (
  input: DependencyPolicyInput,
): DependencyPolicy => {
  if (input.isRuntime === true || input.targetCategory === "runtime" || input.targetLayer === "runtime_future") {
    return "future_gated";
  }
  if (input.targetCategory === "external_future") return "future_gated";
  if (input.isProvider === true || input.targetCategory === "provider") {
    return input.sourceLayer === "integrations" ? "review_required" : "forbidden";
  }
  if (input.targetCategory === "config") {
    return advisoryLayers.includes(input.sourceLayer) || input.sourceLayer === "core" ? "forbidden" : "review_required";
  }
  if (input.isDashboard === true || input.targetCategory === "dashboard") {
    return input.isConcrete === true ? "forbidden" : "future_gated";
  }
  if (input.isConcrete === true && input.sourceLayer === "core") return "forbidden";
  if (input.isConcrete === true && advisoryLayers.includes(input.sourceLayer) && concreteCategories.includes(input.targetCategory)) {
    return input.targetCategory === "adapter" ? "review_required" : "forbidden";
  }
  if (input.isAllowedTypeOnly === true) return "allowed_type_only";
  if (input.targetCategory === "domain_contract" || input.targetCategory === "source_only_metadata" || input.targetCategory === "port") {
    return "allowed";
  }
  if (input.targetCategory === "script" || input.targetCategory === "test") return "review_required";
  return "review_required";
};

export const classifyDependencySeverity = (
  policy: DependencyPolicy,
  riskLevel: PMRiskTier,
): DependencyInversionSeverity => {
  if (riskLevel === "critical") return "critical";
  if (policy === "forbidden") return riskLevel === "high" ? "critical" : "fail";
  if (policy === "future_gated") return riskLevel === "high" ? "fail" : "warn";
  if (policy === "review_required") return riskLevel === "high" ? "fail" : "warn";
  return riskLevel === "high" ? "warn" : "info";
};

export const createDependencyInversionFinding = (
  input: DependencyInversionFindingInput,
): DependencyInversionFinding => {
  const riskLevel = input.riskLevel ?? input.suggestedAction.riskLevel;
  const policy =
    input.policy ??
    classifyDependencyPolicy({
      sourceLayer: input.sourceModule.layer,
      targetLayer: input.targetModule.layer,
      targetCategory: input.actualDependency.category,
      isConcrete: input.actualDependency.isConcrete,
      isRuntime: input.actualDependency.isRuntime,
      isProvider: input.actualDependency.isProvider,
      isDashboard: input.actualDependency.isDashboard,
    });
  const severity = input.severity ?? classifyDependencySeverity(policy, riskLevel);

  return {
    findingId: input.findingId,
    sourceModule: input.sourceModule,
    targetModule: input.targetModule,
    dependencyCategory: input.actualDependency.category,
    expectedAbstraction: input.expectedAbstraction,
    actualDependency: input.actualDependency,
    policy,
    severity,
    description: input.description,
    evidenceRefs: input.evidenceRefs ?? [],
    suggestedAction: input.suggestedAction,
    riskLevel,
    approvalRequired: input.approvalRequired ?? input.suggestedAction.requiresHumanApproval,
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

const emptyPolicyCounts = (): Record<DependencyPolicy, number> => ({
  allowed: 0,
  allowed_type_only: 0,
  review_required: 0,
  forbidden: 0,
  future_gated: 0,
});

const emptySeverityCounts = (): Record<DependencyInversionSeverity, number> => ({
  info: 0,
  warn: 0,
  fail: 0,
  critical: 0,
});

const emptyCategoryCounts = (): Record<DependencyCategory, number> => ({
  domain_contract: 0,
  source_only_metadata: 0,
  port: 0,
  adapter: 0,
  provider: 0,
  runtime: 0,
  dashboard: 0,
  script: 0,
  test: 0,
  config: 0,
  external_future: 0,
});

export const summarizeDependencyInversionFindings = (
  findings: readonly DependencyInversionFinding[],
): DependencyInversionSummary => {
  const byPolicy = emptyPolicyCounts();
  const bySeverity = emptySeverityCounts();
  const byCategory = emptyCategoryCounts();
  let highestSeverity: DependencyInversionSeverity = "info";

  findings.forEach((finding) => {
    byPolicy[finding.policy] += 1;
    bySeverity[finding.severity] += 1;
    byCategory[finding.dependencyCategory] += 1;
    if (severityRank[finding.severity] > severityRank[highestSeverity]) {
      highestSeverity = finding.severity;
    }
  });

  return {
    summaryId: "dependency_inversion_summary:113I",
    schemaVersion: "1.0",
    findingCount: findings["length"],
    byPolicy,
    bySeverity,
    byCategory,
    highestSeverity,
    safeSummary: `Dependency inversion summary contains ${findings["length"]} finding(s); highest severity is ${highestSeverity}.`,
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
