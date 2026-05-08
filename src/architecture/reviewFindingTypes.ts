import {
  solidArchitectureBoundaries,
  type SolidArchitectureBoundarySet,
} from "./solidBoundaries.js";
import type {
  ArchitectureSmellCategory,
  ArchitectureSmellSuggestedAction,
} from "./smellTaxonomy.js";
import type {
  ArchitectureSmellSeverity,
} from "./smellSeverity.js";
import type {
  DependencyPolicy,
} from "./dependencyRules.js";
import type {
  ModuleImportPolicy,
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

export type SolidReviewChecklistScope =
  | "srp"
  | "ocp"
  | "lsp"
  | "isp"
  | "dip"
  | "module_boundaries"
  | "dependency_direction"
  | "architecture_smells"
  | "automation_safety";

export type SolidReviewFindingType =
  | "principle_gap"
  | "boundary_gap"
  | "dependency_direction_gap"
  | "smell_detected"
  | "evidence_gap"
  | "safety_boundary_gap"
  | "future_gate_required"
  | "human_review_required";

export type SolidReviewSeverity = ArchitectureSmellSeverity;

export interface SolidReviewSuggestedAction extends ArchitectureSmellSuggestedAction {
  suggestedPhase?: ProjectPhaseRef;
}

export interface SolidReviewChecklistItem {
  itemId: string;
  title: string;
  scope: SolidReviewChecklistScope;
  principleRefs: SolidPrinciple[];
  smellCategoryRefs: ArchitectureSmellCategory[];
  boundaryPolicyRefs: ModuleImportPolicy[];
  dependencyPolicyRefs: DependencyPolicy[];
  severityHint: SolidReviewSeverity;
  question: string;
  expectedEvidence: string[];
  failureSignal: string;
  suggestedAction: SolidReviewSuggestedAction;
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

export interface SolidReviewChecklistItemInput {
  itemId: string;
  title: string;
  scope: SolidReviewChecklistScope;
  question: string;
  expectedEvidence: string[];
  failureSignal: string;
  suggestedAction: SolidReviewSuggestedAction;
  principleRefs?: SolidPrinciple[];
  smellCategoryRefs?: ArchitectureSmellCategory[];
  boundaryPolicyRefs?: ModuleImportPolicy[];
  dependencyPolicyRefs?: DependencyPolicy[];
  severityHint?: SolidReviewSeverity;
  riskLevel?: PMRiskTier;
  approvalRequired?: boolean;
  pmEscalation?: SolidPmEscalation;
  autopilotUse?: SolidAutopilotUse;
}

export interface ReviewFinding {
  findingId: string;
  checklistItemId: string;
  findingType: SolidReviewFindingType;
  severity: SolidReviewSeverity;
  sourceModule: ModuleReference;
  affectedLayer: ModuleLayer;
  description: string;
  evidenceRefs: PMEvidenceReference[];
  relatedSolidFindingRefs: string[];
  relatedBoundaryFindingRefs: string[];
  relatedDependencyFindingRefs: string[];
  relatedSmellFindingRefs: string[];
  suggestedAction: SolidReviewSuggestedAction;
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

export interface ReviewFindingInput {
  findingId: string;
  checklistItemId: string;
  findingType: SolidReviewFindingType;
  sourceModule: ModuleReference;
  description: string;
  suggestedAction: SolidReviewSuggestedAction;
  affectedLayer?: ModuleLayer;
  severity?: SolidReviewSeverity;
  evidenceRefs?: PMEvidenceReference[];
  relatedSolidFindingRefs?: string[];
  relatedBoundaryFindingRefs?: string[];
  relatedDependencyFindingRefs?: string[];
  relatedSmellFindingRefs?: string[];
  riskLevel?: PMRiskTier;
  approvalRequired?: boolean;
  pmEscalation?: SolidPmEscalation;
  autopilotUse?: SolidAutopilotUse;
}

export interface SolidReviewFindingSummary {
  summaryId: string;
  schemaVersion: PMSchemaVersion;
  findingCount: number;
  byFindingType: Record<SolidReviewFindingType, number>;
  bySeverity: Record<SolidReviewSeverity, number>;
  highestSeverity: SolidReviewSeverity;
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

export const solidReviewChecklistScopes = [
  "srp",
  "ocp",
  "lsp",
  "isp",
  "dip",
  "module_boundaries",
  "dependency_direction",
  "architecture_smells",
  "automation_safety",
] as const satisfies readonly SolidReviewChecklistScope[];

export const solidReviewFindingTypes = [
  "principle_gap",
  "boundary_gap",
  "dependency_direction_gap",
  "smell_detected",
  "evidence_gap",
  "safety_boundary_gap",
  "future_gate_required",
  "human_review_required",
] as const satisfies readonly SolidReviewFindingType[];

const severityRank: Record<SolidReviewSeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const severityFromRisk = (riskLevel: PMRiskTier): SolidReviewSeverity => {
  if (riskLevel === "critical") return "critical";
  if (riskLevel === "high") return "high";
  if (riskLevel === "medium") return "medium";
  return "low";
};

export const createSolidReviewChecklistItem = (
  input: SolidReviewChecklistItemInput,
): SolidReviewChecklistItem => {
  const riskLevel = input.riskLevel ?? input.suggestedAction.riskLevel;

  return {
    itemId: input.itemId,
    title: input.title,
    scope: input.scope,
    principleRefs: input.principleRefs ?? [],
    smellCategoryRefs: input.smellCategoryRefs ?? [],
    boundaryPolicyRefs: input.boundaryPolicyRefs ?? [],
    dependencyPolicyRefs: input.dependencyPolicyRefs ?? [],
    severityHint: input.severityHint ?? severityFromRisk(riskLevel),
    question: input.question,
    expectedEvidence: [...input.expectedEvidence],
    failureSignal: input.failureSignal,
    suggestedAction: input.suggestedAction,
    riskLevel,
    approvalRequired: input.approvalRequired ?? input.suggestedAction.requiresHumanApproval,
    pmEscalation: input.pmEscalation ?? "pm_status_report",
    autopilotUse: input.autopilotUse ?? "handoff_context_only",
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

export const createReviewFinding = (
  input: ReviewFindingInput,
): ReviewFinding => {
  const riskLevel = input.riskLevel ?? input.suggestedAction.riskLevel;

  return {
    findingId: input.findingId,
    checklistItemId: input.checklistItemId,
    findingType: input.findingType,
    severity: input.severity ?? severityFromRisk(riskLevel),
    sourceModule: input.sourceModule,
    affectedLayer: input.affectedLayer ?? input.sourceModule.layer,
    description: input.description,
    evidenceRefs: input.evidenceRefs ?? [],
    relatedSolidFindingRefs: input.relatedSolidFindingRefs ?? [],
    relatedBoundaryFindingRefs: input.relatedBoundaryFindingRefs ?? [],
    relatedDependencyFindingRefs: input.relatedDependencyFindingRefs ?? [],
    relatedSmellFindingRefs: input.relatedSmellFindingRefs ?? [],
    suggestedAction: input.suggestedAction,
    riskLevel,
    approvalRequired: input.approvalRequired ?? input.suggestedAction.requiresHumanApproval,
    pmEscalation: input.pmEscalation ?? "pm_status_report",
    autopilotUse: input.autopilotUse ?? "handoff_context_only",
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

const emptyFindingTypeCounts = (): Record<SolidReviewFindingType, number> => ({
  principle_gap: 0,
  boundary_gap: 0,
  dependency_direction_gap: 0,
  smell_detected: 0,
  evidence_gap: 0,
  safety_boundary_gap: 0,
  future_gate_required: 0,
  human_review_required: 0,
});

const emptySeverityCounts = (): Record<SolidReviewSeverity, number> => ({
  info: 0,
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
});

export const summarizeReviewFindings = (
  findings: readonly ReviewFinding[],
): SolidReviewFindingSummary => {
  const byFindingType = emptyFindingTypeCounts();
  const bySeverity = emptySeverityCounts();
  let highestSeverity: SolidReviewSeverity = "info";

  findings.forEach((finding) => {
    byFindingType[finding.findingType] += 1;
    bySeverity[finding.severity] += 1;
    if (severityRank[finding.severity] > severityRank[highestSeverity]) {
      highestSeverity = finding.severity;
    }
  });

  return {
    summaryId: "solid_review_finding_summary:115I",
    schemaVersion: "1.0",
    findingCount: findings["length"],
    byFindingType,
    bySeverity,
    highestSeverity,
    safeSummary: `SOLID review summary contains ${findings["length"]} finding(s); highest severity is ${highestSeverity}.`,
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
