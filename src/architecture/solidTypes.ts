import {
  solidArchitectureBoundaries,
  type SolidArchitectureBoundarySet,
} from "./solidBoundaries.js";
import type {
  PMEvidenceReference,
  PMRiskSurface,
  PMRiskTier,
  PMSchemaVersion,
  ProjectPhaseRef,
} from "../pm/types.js";

export type SolidPrinciple = "srp" | "ocp" | "lsp" | "isp" | "dip";

export type SolidFindingSeverity = "info" | "warn" | "fail" | "critical";

export type SolidArchitectureLayer =
  | "pm_core"
  | "autopilot"
  | "architecture"
  | "runtime"
  | "dashboard"
  | "integration"
  | "provider"
  | "unknown";

export type SolidAutopilotUse =
  | "not_applicable"
  | "handoff_context_only"
  | "validation_context_only"
  | "closeout_context_only";

export type SolidPmEscalation =
  | "none"
  | "pm_status_report"
  | "risk_metadata"
  | "blocker_metadata"
  | "next_best_action"
  | "phase_closeout";

export interface SolidModuleRef {
  moduleRefId: string;
  label: string;
  safeSummary: string;
  layer: SolidArchitectureLayer;
  riskSurfaces: PMRiskSurface[];
  metadataOnly: true;
  noFileRead: true;
}

export interface SolidSuggestedAction {
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
}

export interface SolidArchitectureFinding {
  findingId: string;
  principle: SolidPrinciple;
  severity: SolidFindingSeverity;
  moduleRef: SolidModuleRef;
  description: string;
  evidenceRefs: PMEvidenceReference[];
  suggestedAction: SolidSuggestedAction;
  riskLevel: PMRiskTier;
  approvalRequired: boolean;
  autopilotUse: SolidAutopilotUse;
  pmEscalation: SolidPmEscalation;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noRefactorExecution: true;
  noRuntimeExecution: true;
  boundaries: SolidArchitectureBoundarySet;
}

export interface SolidArchitectureCharter {
  charterId: string;
  schemaVersion: PMSchemaVersion;
  title: string;
  safeSummary: string;
  principles: SolidPrinciple[];
  findings: SolidArchitectureFinding[];
  assumptions: string[];
  exclusions: string[];
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noRefactorExecution: true;
  noRuntimeExecution: true;
  boundaries: SolidArchitectureBoundarySet;
}

export interface SolidFindingInput {
  findingId: string;
  principle: SolidPrinciple;
  moduleRef: SolidModuleRef;
  description: string;
  suggestedAction: SolidSuggestedAction;
  evidenceRefs?: PMEvidenceReference[];
  riskLevel?: PMRiskTier;
  severity?: SolidFindingSeverity;
  approvalRequired?: boolean;
  autopilotUse?: SolidAutopilotUse;
  pmEscalation?: SolidPmEscalation;
}

export interface SolidSeverityInput {
  riskLevel: PMRiskTier;
  approvalRequired?: boolean;
  principle?: SolidPrinciple;
  moduleLayer?: SolidArchitectureLayer;
}

export interface SolidFindingsSummary {
  summaryId: string;
  schemaVersion: PMSchemaVersion;
  findingCount: number;
  bySeverity: Record<SolidFindingSeverity, number>;
  byPrinciple: Record<SolidPrinciple, number>;
  highestSeverity: SolidFindingSeverity;
  safeSummary: string;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noRefactorExecution: true;
  boundaries: SolidArchitectureBoundarySet;
}

export const solidPrinciples = ["srp", "ocp", "lsp", "isp", "dip"] as const satisfies readonly SolidPrinciple[];

export const solidFindingSeverities = [
  "info",
  "warn",
  "fail",
  "critical",
] as const satisfies readonly SolidFindingSeverity[];

export const solidArchitectureLayers = [
  "pm_core",
  "autopilot",
  "architecture",
  "runtime",
  "dashboard",
  "integration",
  "provider",
  "unknown",
] as const satisfies readonly SolidArchitectureLayer[];

export const solidAutopilotUseValues = [
  "not_applicable",
  "handoff_context_only",
  "validation_context_only",
  "closeout_context_only",
] as const satisfies readonly SolidAutopilotUse[];

export const solidPmEscalationValues = [
  "none",
  "pm_status_report",
  "risk_metadata",
  "blocker_metadata",
  "next_best_action",
  "phase_closeout",
] as const satisfies readonly SolidPmEscalation[];

const severityRank: Record<SolidFindingSeverity, number> = {
  info: 0,
  warn: 1,
  fail: 2,
  critical: 3,
};

export const classifySolidSeverity = (input: SolidSeverityInput): SolidFindingSeverity => {
  if (input.riskLevel === "critical") return "critical";
  if (input.riskLevel === "high") return input.approvalRequired === true ? "fail" : "warn";
  if (input.riskLevel === "medium") {
    return input.moduleLayer === "runtime" || input.moduleLayer === "provider" ? "fail" : "warn";
  }
  return input.approvalRequired === true ? "warn" : "info";
};

export const createSolidFinding = (input: SolidFindingInput): SolidArchitectureFinding => {
  const riskLevel = input.riskLevel ?? input.suggestedAction.riskLevel;
  const severity =
    input.severity ??
    classifySolidSeverity({
      riskLevel,
      ...(input.approvalRequired !== undefined ? { approvalRequired: input.approvalRequired } : {}),
      principle: input.principle,
      moduleLayer: input.moduleRef.layer,
    });

  return {
    findingId: input.findingId,
    principle: input.principle,
    severity,
    moduleRef: input.moduleRef,
    description: input.description,
    evidenceRefs: input.evidenceRefs ?? [],
    suggestedAction: input.suggestedAction,
    riskLevel,
    approvalRequired: input.approvalRequired ?? input.suggestedAction.requiresHumanApproval,
    autopilotUse: input.autopilotUse ?? "not_applicable",
    pmEscalation: input.pmEscalation ?? "none",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noRefactorExecution: true,
    noRuntimeExecution: true,
    boundaries: solidArchitectureBoundaries,
  };
};

export const describeSolidBoundary = (): SolidArchitectureBoundarySet => ({
  ...solidArchitectureBoundaries,
});

const emptySeverityCounts = (): Record<SolidFindingSeverity, number> => ({
  info: 0,
  warn: 0,
  fail: 0,
  critical: 0,
});

const emptyPrincipleCounts = (): Record<SolidPrinciple, number> => ({
  srp: 0,
  ocp: 0,
  lsp: 0,
  isp: 0,
  dip: 0,
});

export const summarizeSolidFindings = (
  findings: readonly SolidArchitectureFinding[],
): SolidFindingsSummary => {
  const bySeverity = emptySeverityCounts();
  const byPrinciple = emptyPrincipleCounts();
  let highestSeverity: SolidFindingSeverity = "info";

  findings.forEach((finding) => {
    bySeverity[finding.severity] += 1;
    byPrinciple[finding.principle] += 1;
    if (severityRank[finding.severity] > severityRank[highestSeverity]) {
      highestSeverity = finding.severity;
    }
  });

  return {
    summaryId: "solid_findings_summary:111I",
    schemaVersion: "1.0",
    findingCount: findings["length"],
    bySeverity,
    byPrinciple,
    highestSeverity,
    safeSummary: `SOLID architecture summary contains ${findings["length"]} finding(s); highest severity is ${highestSeverity}.`,
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noRefactorExecution: true,
    boundaries: solidArchitectureBoundaries,
  };
};

export const buildSolidArchitectureCharter = (input: {
  charterId?: string;
  title?: string;
  safeSummary?: string;
  findings?: SolidArchitectureFinding[];
  assumptions?: string[];
  exclusions?: string[];
} = {}): SolidArchitectureCharter => ({
  charterId: input.charterId ?? "solid_architecture_charter:111I",
  schemaVersion: "1.0",
  title: input.title ?? "SOLID Architecture Charter",
  safeSummary:
    input.safeSummary ??
    "Source-only advisory SOLID architecture charter for review metadata.",
  principles: [...solidPrinciples],
  findings: input.findings ?? [],
  assumptions: input.assumptions ?? [],
  exclusions: input.exclusions ?? [],
  metadataOnly: true,
  reportOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
  noRefactorExecution: true,
  noRuntimeExecution: true,
  boundaries: solidArchitectureBoundaries,
});
