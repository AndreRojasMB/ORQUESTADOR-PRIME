import {
  solidArchitectureBoundaries,
  type SolidArchitectureBoundarySet,
} from "./solidBoundaries.js";
import type {
  ArchitectureSmellCategory,
} from "./smellTaxonomy.js";
import type {
  ArchitectureSmellSeverity,
} from "./smellSeverity.js";
import type {
  DependencyPolicy,
} from "./dependencyRules.js";
import type {
  ModuleImportPolicy,
} from "./moduleBoundaries.js";
import type {
  SolidPrinciple,
} from "./solidTypes.js";
import type {
  PMSchemaVersion,
} from "../pm/types.js";

export type SolidValidatorInputKind =
  | "module_metadata"
  | "dependency_metadata"
  | "checklist_item_metadata"
  | "boundary_finding_metadata"
  | "dependency_finding_metadata"
  | "smell_finding_metadata"
  | "evidence_metadata";

export type SolidValidatorSeverity = ArchitectureSmellSeverity;

export type SolidValidatorMissingEvidencePolicy =
  | "allow_warning"
  | "needs_review"
  | "block";

export interface SolidRuleRegistryEntry {
  ruleId: string;
  title: string;
  principleRefs: SolidPrinciple[];
  checklistItemRefs: string[];
  smellCategoryRefs: ArchitectureSmellCategory[];
  boundaryPolicyRefs: ModuleImportPolicy[];
  dependencyPolicyRefs: DependencyPolicy[];
  severityDefault: SolidValidatorSeverity;
  evaluateInputKind: SolidValidatorInputKind;
  requiredEvidence: string[];
  reportOnly: true;
  safetyBoundaries: SolidArchitectureBoundarySet;
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noRuntimeExecution: true;
  noScannerExecution: true;
  noRefactorExecution: true;
}

export interface SolidRuleInput {
  ruleId: string;
  title: string;
  principleRefs: SolidPrinciple[];
  evaluateInputKind: SolidValidatorInputKind;
  requiredEvidence: string[];
  checklistItemRefs?: string[];
  smellCategoryRefs?: ArchitectureSmellCategory[];
  boundaryPolicyRefs?: ModuleImportPolicy[];
  dependencyPolicyRefs?: DependencyPolicy[];
  severityDefault?: SolidValidatorSeverity;
}

export interface SolidValidatorConfig {
  configId: string;
  enabledRuleIds: string[];
  severityOverrides: Partial<Record<string, SolidValidatorSeverity>>;
  requiredEvidencePolicy: SolidValidatorMissingEvidencePolicy;
  minimumStatusForBlock: "failed" | "blocked";
  reportOnly: true;
  safetyBoundaries: SolidArchitectureBoundarySet;
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noRuntimeExecution: true;
  noScannerExecution: true;
  noRefactorExecution: true;
}

export interface SolidRuleRegistry {
  registryId: string;
  schemaVersion: PMSchemaVersion;
  rules: SolidRuleRegistryEntry[];
  defaultConfig: SolidValidatorConfig;
  reportOnly: true;
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noRuntimeExecution: true;
  noScannerExecution: true;
  noRefactorExecution: true;
  safetyBoundaries: SolidArchitectureBoundarySet;
}

export const solidValidatorInputKinds = [
  "module_metadata",
  "dependency_metadata",
  "checklist_item_metadata",
  "boundary_finding_metadata",
  "dependency_finding_metadata",
  "smell_finding_metadata",
  "evidence_metadata",
] as const satisfies readonly SolidValidatorInputKind[];

export const solidValidatorSeverities = [
  "info",
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly SolidValidatorSeverity[];

export const solidValidatorMissingEvidencePolicies = [
  "allow_warning",
  "needs_review",
  "block",
] as const satisfies readonly SolidValidatorMissingEvidencePolicy[];

export const createSolidRule = (input: SolidRuleInput): SolidRuleRegistryEntry => ({
  ruleId: input.ruleId,
  title: input.title,
  principleRefs: [...input.principleRefs],
  checklistItemRefs: input.checklistItemRefs ?? [],
  smellCategoryRefs: input.smellCategoryRefs ?? [],
  boundaryPolicyRefs: input.boundaryPolicyRefs ?? [],
  dependencyPolicyRefs: input.dependencyPolicyRefs ?? [],
  severityDefault: input.severityDefault ?? "medium",
  evaluateInputKind: input.evaluateInputKind,
  requiredEvidence: [...input.requiredEvidence],
  reportOnly: true,
  safetyBoundaries: solidArchitectureBoundaries,
  metadataOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
  noRuntimeExecution: true,
  noScannerExecution: true,
  noRefactorExecution: true,
});

export const createSolidValidatorConfig = (input: {
  configId?: string;
  enabledRuleIds?: string[];
  severityOverrides?: Partial<Record<string, SolidValidatorSeverity>>;
  requiredEvidencePolicy?: SolidValidatorMissingEvidencePolicy;
  minimumStatusForBlock?: "failed" | "blocked";
} = {}): SolidValidatorConfig => ({
  configId: input.configId ?? "solid_validator_config:116I:default",
  enabledRuleIds: input.enabledRuleIds ?? [],
  severityOverrides: input.severityOverrides ?? {},
  requiredEvidencePolicy: input.requiredEvidencePolicy ?? "needs_review",
  minimumStatusForBlock: input.minimumStatusForBlock ?? "blocked",
  reportOnly: true,
  safetyBoundaries: solidArchitectureBoundaries,
  metadataOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
  noRuntimeExecution: true,
  noScannerExecution: true,
  noRefactorExecution: true,
});

export const buildDefaultSolidRuleRegistry = (): SolidRuleRegistry => {
  const rules: SolidRuleRegistryEntry[] = [
    createSolidRule({
      ruleId: "solid_validator_rule:srp:checklist_coverage",
      title: "SRP checklist coverage",
      principleRefs: ["srp"],
      checklistItemRefs: ["solid_review_item:srp:responsibility"],
      smellCategoryRefs: ["responsibility_overload"],
      boundaryPolicyRefs: ["review_required"],
      dependencyPolicyRefs: ["review_required"],
      severityDefault: "medium",
      evaluateInputKind: "checklist_item_metadata",
      requiredEvidence: ["module summary", "responsibility statement"],
    }),
    createSolidRule({
      ruleId: "solid_validator_rule:ocp:extension_metadata",
      title: "OCP extension metadata",
      principleRefs: ["ocp"],
      checklistItemRefs: ["solid_review_item:ocp:extension"],
      smellCategoryRefs: ["extension_blocked_by_core_modification"],
      boundaryPolicyRefs: ["review_required"],
      dependencyPolicyRefs: ["review_required"],
      severityDefault: "medium",
      evaluateInputKind: "checklist_item_metadata",
      requiredEvidence: ["extension point metadata"],
    }),
    createSolidRule({
      ruleId: "solid_validator_rule:lsp:substitution_metadata",
      title: "LSP substitution metadata",
      principleRefs: ["lsp"],
      checklistItemRefs: ["solid_review_item:lsp:replacement"],
      smellCategoryRefs: ["contract_substitution_risk"],
      boundaryPolicyRefs: ["review_required"],
      dependencyPolicyRefs: ["review_required"],
      severityDefault: "medium",
      evaluateInputKind: "checklist_item_metadata",
      requiredEvidence: ["contract assumptions"],
    }),
    createSolidRule({
      ruleId: "solid_validator_rule:isp:interface_metadata",
      title: "ISP interface metadata",
      principleRefs: ["isp"],
      checklistItemRefs: ["solid_review_item:isp:interface_size"],
      smellCategoryRefs: ["oversized_interface"],
      boundaryPolicyRefs: ["review_required"],
      dependencyPolicyRefs: ["review_required"],
      severityDefault: "medium",
      evaluateInputKind: "checklist_item_metadata",
      requiredEvidence: ["caller needs", "interface summary"],
    }),
    createSolidRule({
      ruleId: "solid_validator_rule:dip:dependency_direction",
      title: "DIP dependency direction metadata",
      principleRefs: ["dip"],
      checklistItemRefs: ["solid_review_item:dip:abstraction"],
      smellCategoryRefs: ["core_infra_coupling", "provider_leakage"],
      boundaryPolicyRefs: ["forbidden", "future_gated"],
      dependencyPolicyRefs: ["forbidden", "future_gated"],
      severityDefault: "high",
      evaluateInputKind: "dependency_finding_metadata",
      requiredEvidence: ["dependency category", "expected abstraction", "actual dependency metadata"],
    }),
    createSolidRule({
      ruleId: "solid_validator_rule:boundary:policy_findings",
      title: "Module boundary policy metadata",
      principleRefs: ["srp", "dip"],
      checklistItemRefs: ["solid_review_item:module_boundaries:policy"],
      smellCategoryRefs: ["ambiguous_boundary"],
      boundaryPolicyRefs: ["forbidden", "future_gated", "review_required"],
      dependencyPolicyRefs: ["review_required"],
      severityDefault: "high",
      evaluateInputKind: "boundary_finding_metadata",
      requiredEvidence: ["source layer", "target layer", "policy rationale"],
    }),
    createSolidRule({
      ruleId: "solid_validator_rule:smell:taxonomy_findings",
      title: "Architecture smell metadata",
      principleRefs: ["srp", "ocp", "lsp", "isp", "dip"],
      checklistItemRefs: ["solid_review_item:architecture_smells:taxonomy"],
      smellCategoryRefs: ["hidden_side_effect", "approval_bypass_risk", "automation_overreach"],
      boundaryPolicyRefs: ["review_required", "forbidden"],
      dependencyPolicyRefs: ["review_required", "forbidden"],
      severityDefault: "high",
      evaluateInputKind: "smell_finding_metadata",
      requiredEvidence: ["smell category", "severity"],
    }),
    createSolidRule({
      ruleId: "solid_validator_rule:safety:automation_boundaries",
      title: "Automation safety metadata",
      principleRefs: ["srp", "dip"],
      checklistItemRefs: ["solid_review_item:automation_safety:approval"],
      smellCategoryRefs: ["approval_bypass_risk", "automation_overreach", "hidden_side_effect"],
      boundaryPolicyRefs: ["forbidden", "future_gated"],
      dependencyPolicyRefs: ["forbidden", "future_gated"],
      severityDefault: "critical",
      evaluateInputKind: "evidence_metadata",
      requiredEvidence: ["approval posture", "side-effect boundaries"],
    }),
  ];

  return {
    registryId: "solid_rule_registry:116I:default",
    schemaVersion: "1.0",
    rules,
    defaultConfig: createSolidValidatorConfig({
      enabledRuleIds: rules.map((rule) => rule.ruleId),
      requiredEvidencePolicy: "needs_review",
    }),
    reportOnly: true,
    metadataOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noRuntimeExecution: true,
    noScannerExecution: true,
    noRefactorExecution: true,
    safetyBoundaries: solidArchitectureBoundaries,
  };
};

export const defaultSolidRuleRegistry = buildDefaultSolidRuleRegistry();
