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
  ModuleLayer,
} from "./moduleBoundaries.js";
import {
  classifyDependencyPolicy,
  classifyDependencySeverity,
  describeDependencyCategory,
  type DependencyAbstraction,
  type DependencyActualReference,
  type DependencyCategory,
  type DependencyPolicy,
} from "./dependencyRules.js";
import type {
  PMEvidenceReference,
  PMRiskTier,
} from "../pm/types.js";

export interface DependencyClassifierInput {
  importPath: string;
  sourceLayer: ModuleLayer;
  targetLayer: ModuleLayer;
  targetCategory: DependencyCategory;
  isConcrete: boolean;
  isRuntime: boolean;
  isProvider: boolean;
  isDashboard: boolean;
  isAllowedTypeOnly: boolean;
  classificationReason: string;
  evidenceRefs?: PMEvidenceReference[];
  riskLevel?: PMRiskTier;
  pmEscalation?: SolidPmEscalation;
  autopilotUse?: SolidAutopilotUse;
}

export interface DependencyClassifierResult {
  importPath: string;
  sourceLayer: ModuleLayer;
  targetLayer: ModuleLayer;
  targetCategory: DependencyCategory;
  dependencyCategory: DependencyCategory;
  policy: DependencyPolicy;
  severity: ModuleBoundarySeverity;
  expectedAbstraction: DependencyAbstraction;
  actualDependency: DependencyActualReference;
  classificationReason: string;
  safeSummary: string;
  requiresHumanReview: boolean;
  riskLevel: PMRiskTier;
  pmEscalation: SolidPmEscalation;
  autopilotUse: SolidAutopilotUse;
  evidenceRefs: PMEvidenceReference[];
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noRefactorExecution: true;
  noScannerExecution: true;
  noRuntimeExecution: true;
  boundaries: SolidArchitectureBoundarySet;
}

const expectedCategoryFor = (
  targetCategory: DependencyCategory,
): DependencyCategory => {
  const description = describeDependencyCategory(targetCategory);
  return description.expectedAbstractionCategory ?? targetCategory;
};

const reviewRequiredPolicies: readonly DependencyPolicy[] = [
  "review_required",
  "forbidden",
  "future_gated",
];

export const classifyDependencyMetadata = (
  input: DependencyClassifierInput,
): DependencyClassifierResult => {
  const riskLevel = input.riskLevel ?? "medium";
  const policy = classifyDependencyPolicy({
    sourceLayer: input.sourceLayer,
    targetLayer: input.targetLayer,
    targetCategory: input.targetCategory,
    isConcrete: input.isConcrete,
    isRuntime: input.isRuntime,
    isProvider: input.isProvider,
    isDashboard: input.isDashboard,
    isAllowedTypeOnly: input.isAllowedTypeOnly,
  });
  const severity = classifyDependencySeverity(policy, riskLevel);
  const expectedCategory = expectedCategoryFor(input.targetCategory);
  const expectedDescription = describeDependencyCategory(expectedCategory);
  const targetDescription = describeDependencyCategory(input.targetCategory);
  const expectedAbstraction: DependencyAbstraction = {
    abstractionId: `dependency_abstraction:${expectedCategory}`,
    category: expectedCategory,
    label: expectedDescription.label,
    safeSummary: expectedDescription.safeSummary,
    metadataOnly: true,
    sourceOnly: true,
    noRuntimeExecution: true,
  };
  const actualDependency: DependencyActualReference = {
    dependencyId: `dependency_actual:${input.targetLayer}:${input.targetCategory}`,
    category: input.targetCategory,
    importPath: input.importPath,
    isConcrete: input.isConcrete,
    isRuntime: input.isRuntime,
    isProvider: input.isProvider,
    isDashboard: input.isDashboard,
    metadataOnly: true,
    noFileRead: true,
  };

  return {
    importPath: input.importPath,
    sourceLayer: input.sourceLayer,
    targetLayer: input.targetLayer,
    targetCategory: input.targetCategory,
    dependencyCategory: input.targetCategory,
    policy,
    severity,
    expectedAbstraction,
    actualDependency,
    classificationReason: input.classificationReason,
    safeSummary: `${input.sourceLayer} to ${input.targetLayer} classified as ${policy}; target category is ${targetDescription.label}.`,
    requiresHumanReview: reviewRequiredPolicies.includes(policy),
    riskLevel,
    pmEscalation: input.pmEscalation ?? "pm_status_report",
    autopilotUse: input.autopilotUse ?? "handoff_context_only",
    evidenceRefs: input.evidenceRefs ?? [],
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
