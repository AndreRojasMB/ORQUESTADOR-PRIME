import {
  solidArchitectureBoundaries,
  type SolidArchitectureBoundarySet,
} from "./solidBoundaries.js";
import type {
  SolidAutopilotUse,
  SolidPmEscalation,
} from "./solidTypes.js";
import type {
  PMEvidenceReference,
  PMRiskSurface,
  PMRiskTier,
  PMSchemaVersion,
  ProjectPhaseRef,
} from "../pm/types.js";

export type ModuleLayer =
  | "core"
  | "pm"
  | "architecture"
  | "autopilot"
  | "integrations"
  | "whatsapp"
  | "viernesBridge"
  | "dashboard"
  | "scripts"
  | "docs"
  | "tests"
  | "providers"
  | "config"
  | "runtime_future";

export type ModuleImportPolicy =
  | "allowed"
  | "allowed_type_only"
  | "review_required"
  | "forbidden"
  | "future_gated";

export type ModuleBoundarySeverity = "info" | "warn" | "fail" | "critical";

export type ModuleImportKind =
  | "metadata_reference"
  | "type_only_import"
  | "value_import"
  | "future_contract";

export interface ModuleReference {
  moduleRefId: string;
  label: string;
  safeSummary: string;
  layer: ModuleLayer;
  riskSurfaces: PMRiskSurface[];
  metadataOnly: true;
  noFileRead: true;
}

export interface ModuleBoundarySuggestedAction {
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

export interface ModuleBoundaryFinding {
  findingId: string;
  sourceModule: ModuleReference;
  targetModule: ModuleReference;
  sourceLayer: ModuleLayer;
  targetLayer: ModuleLayer;
  importPath: string;
  importKind: ModuleImportKind;
  policy: ModuleImportPolicy;
  severity: ModuleBoundarySeverity;
  description: string;
  evidenceRefs: PMEvidenceReference[];
  suggestedAction: ModuleBoundarySuggestedAction;
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

export interface ModuleBoundaryFindingInput {
  findingId: string;
  sourceModule: ModuleReference;
  targetModule: ModuleReference;
  importPath: string;
  description: string;
  suggestedAction: ModuleBoundarySuggestedAction;
  importKind?: ModuleImportKind;
  policy?: ModuleImportPolicy;
  severity?: ModuleBoundarySeverity;
  evidenceRefs?: PMEvidenceReference[];
  riskLevel?: PMRiskTier;
  approvalRequired?: boolean;
  pmEscalation?: SolidPmEscalation;
  autopilotUse?: SolidAutopilotUse;
}

export interface ModuleImportPolicyInput {
  sourceLayer: ModuleLayer;
  targetLayer: ModuleLayer;
  importKind?: ModuleImportKind;
}

export interface ModuleLayerDescription {
  layer: ModuleLayer;
  label: string;
  safeSummary: string;
  allowedTargets: ModuleLayer[];
  reviewRequiredTargets: ModuleLayer[];
  forbiddenTargets: ModuleLayer[];
  futureGatedTargets: ModuleLayer[];
  rationale: string;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noScannerExecution: true;
  noRefactorExecution: true;
}

export interface ModuleBoundarySummary {
  summaryId: string;
  schemaVersion: PMSchemaVersion;
  findingCount: number;
  byPolicy: Record<ModuleImportPolicy, number>;
  bySeverity: Record<ModuleBoundarySeverity, number>;
  highestSeverity: ModuleBoundarySeverity;
  safeSummary: string;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noScannerExecution: true;
  noRefactorExecution: true;
  boundaries: SolidArchitectureBoundarySet;
}

export const moduleLayers = [
  "core",
  "pm",
  "architecture",
  "autopilot",
  "integrations",
  "whatsapp",
  "viernesBridge",
  "dashboard",
  "scripts",
  "docs",
  "tests",
  "providers",
  "config",
  "runtime_future",
] as const satisfies readonly ModuleLayer[];

export const moduleImportPolicies = [
  "allowed",
  "allowed_type_only",
  "review_required",
  "forbidden",
  "future_gated",
] as const satisfies readonly ModuleImportPolicy[];

export const moduleBoundarySeverities = [
  "info",
  "warn",
  "fail",
  "critical",
] as const satisfies readonly ModuleBoundarySeverity[];

export const moduleImportKinds = [
  "metadata_reference",
  "type_only_import",
  "value_import",
  "future_contract",
] as const satisfies readonly ModuleImportKind[];

const liveAdjacentLayers: readonly ModuleLayer[] = [
  "integrations",
  "whatsapp",
  "viernesBridge",
  "dashboard",
  "providers",
  "config",
  "runtime_future",
] as const;

const reviewBoundaryLayers: readonly ModuleLayer[] = [
  "scripts",
  "docs",
  "tests",
] as const;

const boundarySeverityRank: Record<ModuleBoundarySeverity, number> = {
  info: 0,
  warn: 1,
  fail: 2,
  critical: 3,
};

export const classifyImportPolicy = (
  input: ModuleImportPolicyInput,
): ModuleImportPolicy => {
  if (input.sourceLayer === input.targetLayer) return "allowed";
  if (input.targetLayer === "runtime_future") return "future_gated";
  if (input.sourceLayer === "architecture" && input.targetLayer === "pm") {
    return input.importKind === "type_only_import" || input.importKind === "metadata_reference"
      ? "allowed_type_only"
      : "review_required";
  }
  if (input.sourceLayer === "pm" && input.targetLayer === "architecture") return "review_required";
  if (input.sourceLayer === "autopilot" && (["pm", "architecture"] as readonly ModuleLayer[]).includes(input.targetLayer)) {
    return input.importKind === "type_only_import" || input.importKind === "metadata_reference"
      ? "allowed_type_only"
      : "review_required";
  }
  if (input.sourceLayer === "core" && liveAdjacentLayers.includes(input.targetLayer)) return "forbidden";
  if ((["pm", "architecture"] as readonly ModuleLayer[]).includes(input.sourceLayer) && liveAdjacentLayers.includes(input.targetLayer)) {
    return input.targetLayer === "dashboard" ? "future_gated" : "forbidden";
  }
  if (
    (["whatsapp", "viernesBridge", "dashboard"] as readonly ModuleLayer[]).includes(input.sourceLayer) &&
    (["pm", "architecture"] as readonly ModuleLayer[]).includes(input.targetLayer)
  ) {
    return "review_required";
  }
  if (reviewBoundaryLayers.includes(input.sourceLayer)) return "review_required";
  if (input.sourceLayer === "providers" && (["core", "pm", "architecture"] as readonly ModuleLayer[]).includes(input.targetLayer)) {
    return "review_required";
  }
  return "review_required";
};

const severityFromPolicy = (
  policy: ModuleImportPolicy,
  riskLevel: PMRiskTier,
): ModuleBoundarySeverity => {
  if (riskLevel === "critical") return "critical";
  if (policy === "forbidden") return "fail";
  if (policy === "future_gated") return riskLevel === "high" ? "fail" : "warn";
  if (policy === "review_required") return riskLevel === "high" ? "fail" : "warn";
  if (policy === "allowed_type_only") return "info";
  return riskLevel === "high" ? "warn" : "info";
};

export const createModuleBoundaryFinding = (
  input: ModuleBoundaryFindingInput,
): ModuleBoundaryFinding => {
  const importKind = input.importKind ?? "metadata_reference";
  const riskLevel = input.riskLevel ?? input.suggestedAction.riskLevel;
  const policy =
    input.policy ??
    classifyImportPolicy({
      sourceLayer: input.sourceModule.layer,
      targetLayer: input.targetModule.layer,
      importKind,
    });
  const severity = input.severity ?? severityFromPolicy(policy, riskLevel);

  return {
    findingId: input.findingId,
    sourceModule: input.sourceModule,
    targetModule: input.targetModule,
    sourceLayer: input.sourceModule.layer,
    targetLayer: input.targetModule.layer,
    importPath: input.importPath,
    importKind,
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

export const describeModuleLayer = (
  layer: ModuleLayer,
  layerMap: readonly ModuleLayerDescription[],
): ModuleLayerDescription | undefined =>
  layerMap.find((entry) => entry.layer === layer);

const emptyPolicyCounts = (): Record<ModuleImportPolicy, number> => ({
  allowed: 0,
  allowed_type_only: 0,
  review_required: 0,
  forbidden: 0,
  future_gated: 0,
});

const emptySeverityCounts = (): Record<ModuleBoundarySeverity, number> => ({
  info: 0,
  warn: 0,
  fail: 0,
  critical: 0,
});

export const summarizeModuleBoundaryFindings = (
  findings: readonly ModuleBoundaryFinding[],
): ModuleBoundarySummary => {
  const byPolicy = emptyPolicyCounts();
  const bySeverity = emptySeverityCounts();
  let highestSeverity: ModuleBoundarySeverity = "info";

  findings.forEach((finding) => {
    byPolicy[finding.policy] += 1;
    bySeverity[finding.severity] += 1;
    if (boundarySeverityRank[finding.severity] > boundarySeverityRank[highestSeverity]) {
      highestSeverity = finding.severity;
    }
  });

  return {
    summaryId: "module_boundary_summary:112I",
    schemaVersion: "1.0",
    findingCount: findings["length"],
    byPolicy,
    bySeverity,
    highestSeverity,
    safeSummary: `Module boundary summary contains ${findings["length"]} finding(s); highest severity is ${highestSeverity}.`,
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noScannerExecution: true,
    noRefactorExecution: true,
    boundaries: solidArchitectureBoundaries,
  };
};
