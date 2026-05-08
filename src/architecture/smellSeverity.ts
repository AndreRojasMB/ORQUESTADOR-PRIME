import type {
  ModuleLayer,
} from "./moduleBoundaries.js";
import type {
  ArchitectureSmellCategory,
} from "./smellTaxonomy.js";
import type {
  SolidPrinciple,
} from "./solidTypes.js";
import type {
  PMRiskTier,
} from "../pm/types.js";

export type ArchitectureSmellSeverity =
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface ArchitectureSmellSeverityInput {
  smellCategory: ArchitectureSmellCategory;
  relatedPrinciples?: readonly SolidPrinciple[];
  affectedLayer?: ModuleLayer;
  riskLevel?: PMRiskTier;
  approvalRequired?: boolean;
  hasBoundaryRefs?: boolean;
  hasDependencyRefs?: boolean;
  impliesSourceOnlyLeakage?: boolean;
  impliesRuntimeCoupling?: boolean;
  impliesProviderCoupling?: boolean;
  impliesDashboardCoupling?: boolean;
  impliesHiddenSideEffect?: boolean;
  impliesApprovalBypass?: boolean;
}

export const architectureSmellSeverities = [
  "info",
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly ArchitectureSmellSeverity[];

const categoryBaseSeverity: Record<ArchitectureSmellCategory, ArchitectureSmellSeverity> = {
  responsibility_overload: "low",
  core_infra_coupling: "high",
  provider_leakage: "high",
  dashboard_write_leakage: "high",
  runtime_dependency_in_source_only: "high",
  ambiguous_boundary: "medium",
  oversized_interface: "medium",
  contract_substitution_risk: "medium",
  extension_blocked_by_core_modification: "medium",
  hidden_side_effect: "high",
  approval_bypass_risk: "critical",
  automation_overreach: "high",
};

const severityRank: Record<ArchitectureSmellSeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export const compareArchitectureSmellSeverity = (
  left: ArchitectureSmellSeverity,
  right: ArchitectureSmellSeverity,
): number => severityRank[left] - severityRank[right];

const maxSeverity = (
  severities: readonly ArchitectureSmellSeverity[],
): ArchitectureSmellSeverity =>
  severities.reduce<ArchitectureSmellSeverity>(
    (highest, current) => (compareArchitectureSmellSeverity(current, highest) > 0 ? current : highest),
    "info",
  );

const riskSeverity = (riskLevel?: PMRiskTier): ArchitectureSmellSeverity => {
  if (riskLevel === "critical") return "critical";
  if (riskLevel === "high") return "high";
  if (riskLevel === "medium") return "medium";
  if (riskLevel === "low") return "low";
  return "info";
};

const layerSeverity = (layer?: ModuleLayer): ArchitectureSmellSeverity => {
  if (layer === "providers" || layer === "runtime_future") return "high";
  if (layer === "dashboard" || layer === "integrations" || layer === "whatsapp" || layer === "viernesBridge") return "medium";
  return "info";
};

export const classifyArchitectureSmellSeverity = (
  input: ArchitectureSmellSeverityInput,
): ArchitectureSmellSeverity => {
  if (input.impliesApprovalBypass === true) return "critical";
  if (input.impliesHiddenSideEffect === true && input.approvalRequired === true) return "critical";
  if ((input.impliesRuntimeCoupling === true || input.impliesProviderCoupling === true) && input.impliesSourceOnlyLeakage === true) {
    return input.riskLevel === "critical" ? "critical" : "high";
  }
  if (input.smellCategory === "automation_overreach" && input.riskLevel === "high") return "critical";

  const relatedFindingPressure =
    input.hasBoundaryRefs === true || input.hasDependencyRefs === true ? "medium" : "info";

  return maxSeverity([
    categoryBaseSeverity[input.smellCategory],
    riskSeverity(input.riskLevel),
    layerSeverity(input.affectedLayer),
    relatedFindingPressure,
    input.approvalRequired === true ? "medium" : "info",
    input.impliesDashboardCoupling === true ? "high" : "info",
  ]);
};
