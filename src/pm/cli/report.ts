import type {
  PMReportConfidence,
  PMReportUncertainty,
  PMStatusReport,
} from "../reportTypes.js";
import type {
  PMEvidenceReference,
  PMRiskTier,
  PMSchemaVersion,
  ProjectPhaseRef,
} from "../types.js";

export type ReportEnvelopeStatus =
  | "passed"
  | "warning"
  | "failed"
  | "needs_review"
  | "blocked"
  | "insufficient_evidence";

export type ReportEnvelopeSeverity =
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";

export type ReportEnvelopeSource =
  | "pm"
  | "architecture"
  | "solid"
  | "autopilot"
  | "manual_metadata";

export type ReportEnvelopeKind =
  | "pm_status"
  | "pm_phase"
  | "pm_milestone"
  | "pm_blocker"
  | "pm_risk"
  | "pm_approval"
  | "pm_next_action"
  | "pm_roadmap_return"
  | "solid_architecture"
  | "solid_validator"
  | "architecture_boundary"
  | "architecture_dependency"
  | "architecture_smell"
  | "architecture_review"
  | "frontend_responsibility"
  | "backend_layering";

export type ReportEnvelopePmEscalation =
  | "none"
  | "pm_status_report"
  | "risk_metadata"
  | "blocker_metadata"
  | "next_best_action"
  | "phase_closeout";

export type ReportEnvelopeAutopilotUse =
  | "not_applicable"
  | "handoff_context_only"
  | "validation_context_only"
  | "closeout_context_only";

export interface ReportEnvelopeRecommendedNextAction {
  actionId: string;
  label: string;
  safeSummary: string;
  nextPhase?: ProjectPhaseRef;
  riskLevel: PMRiskTier;
  requiresHumanApproval: boolean;
  metadataOnly: true;
  advisoryOnly: true;
  noExecution: true;
}

export interface ReportEnvelopeFinding {
  findingId: string;
  source: ReportEnvelopeSource;
  title: string;
  severity: ReportEnvelopeSeverity;
  status?: ReportEnvelopeStatus;
  summary: string;
  evidenceRefs: PMEvidenceReference[];
  riskLevel: PMRiskTier;
  approvalRequired: boolean;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
}

export interface CiCompatibilityMetadata {
  compatibilityId: string;
  eligibleForFutureLocalFormatting: boolean;
  eligibleForFutureJsonSerialization: boolean;
  eligibleForFutureSarifMapping: boolean;
  advisoryOnly: true;
  metadataOnly: true;
  noCiActivation: true;
  noCiConfigChanges: true;
  noPackageCommandChanges: true;
  noBlockingGate: true;
  noArtifactPublication: true;
}

export interface SarifReadyMetadata {
  sarifMetadataId: string;
  ruleIdPrefix: string;
  resultKind: string;
  severityMapping: Record<ReportEnvelopeSeverity, string>;
  evidenceMappingLabel: string;
  limitationsMappingLabel: string;
  metadataOnly: true;
  reportOnly: true;
  noFileEmission: true;
  noArtifactPublication: true;
}

export interface ReportEnvelope {
  envelopeId: string;
  schemaVersion: PMSchemaVersion;
  source: ReportEnvelopeSource;
  reportKind: ReportEnvelopeKind;
  phaseRef: ProjectPhaseRef;
  generatedAtLabel: string;
  status: ReportEnvelopeStatus;
  severity: ReportEnvelopeSeverity;
  summary: string;
  findings: ReportEnvelopeFinding[];
  evidenceRefs: PMEvidenceReference[];
  limitations: string[];
  recommendedNextAction: ReportEnvelopeRecommendedNextAction;
  riskLevel: PMRiskTier;
  approvalRequired: boolean;
  pmEscalation: ReportEnvelopePmEscalation;
  autopilotUse: ReportEnvelopeAutopilotUse;
  ciCompatibility: CiCompatibilityMetadata;
  sarifReadyMetadata: SarifReadyMetadata;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
  noCiActivation: true;
  noFileEmission: true;
  noProviderCalls: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
  noGitMutationFromSource: true;
}

export interface ReportEnvelopeInput {
  envelopeId: string;
  source: ReportEnvelopeSource;
  reportKind: ReportEnvelopeKind;
  phaseRef: ProjectPhaseRef;
  generatedAtLabel: string;
  status: ReportEnvelopeStatus;
  severity: ReportEnvelopeSeverity;
  summary: string;
  recommendedNextAction: ReportEnvelopeRecommendedNextAction;
  schemaVersion?: PMSchemaVersion;
  findings?: ReportEnvelopeFinding[];
  evidenceRefs?: PMEvidenceReference[];
  limitations?: string[];
  riskLevel?: PMRiskTier;
  approvalRequired?: boolean;
  pmEscalation?: ReportEnvelopePmEscalation;
  autopilotUse?: ReportEnvelopeAutopilotUse;
  ciCompatibility?: CiCompatibilityMetadata;
  sarifReadyMetadata?: SarifReadyMetadata;
}

export interface ReportEnvelopeSeverityCounts {
  info: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface ReportEnvelopeSummary {
  summaryId: string;
  schemaVersion: PMSchemaVersion;
  envelopeId: string;
  status: ReportEnvelopeStatus;
  severity: ReportEnvelopeSeverity;
  findingCount: number;
  severityCounts: ReportEnvelopeSeverityCounts;
  riskLevel: PMRiskTier;
  approvalRequired: boolean;
  safeSummary: string;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
}

export interface PMReportEnvelope extends ReportEnvelope {
  pmReportRef: string;
  projectStateRef?: string;
  milestoneRef?: string;
  phaseRef: ProjectPhaseRef;
  blockers: string[];
  risks: string[];
  approvals: string[];
  dodGaps: string[];
  nextAction?: ReportEnvelopeRecommendedNextAction;
  confidence?: PMReportConfidence;
  uncertainty: PMReportUncertainty[];
  evidenceRefs: PMEvidenceReference[];
  pmReport?: PMStatusReport;
}

export interface PMReportEnvelopeInput extends Omit<ReportEnvelopeInput, "source"> {
  pmReportRef: string;
  projectStateRef?: string;
  milestoneRef?: string;
  blockers?: string[];
  risks?: string[];
  approvals?: string[];
  dodGaps?: string[];
  nextAction?: ReportEnvelopeRecommendedNextAction;
  confidence?: PMReportConfidence;
  uncertainty?: PMReportUncertainty[];
  pmReport?: PMStatusReport;
}

const severityRank: Record<ReportEnvelopeSeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const emptySeverityCounts = (): ReportEnvelopeSeverityCounts => ({
  info: 0,
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
});

const riskFromSeverity = (severity: ReportEnvelopeSeverity): PMRiskTier => {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
};

export const buildCiCompatibilityMetadata = (
  input: Partial<Pick<
    CiCompatibilityMetadata,
    | "compatibilityId"
    | "eligibleForFutureLocalFormatting"
    | "eligibleForFutureJsonSerialization"
    | "eligibleForFutureSarifMapping"
  >> = {},
): CiCompatibilityMetadata => ({
  compatibilityId: input.compatibilityId ?? "ci_compatibility:metadata_only",
  eligibleForFutureLocalFormatting: input.eligibleForFutureLocalFormatting ?? true,
  eligibleForFutureJsonSerialization: input.eligibleForFutureJsonSerialization ?? true,
  eligibleForFutureSarifMapping: input.eligibleForFutureSarifMapping ?? true,
  advisoryOnly: true,
  metadataOnly: true,
  noCiActivation: true,
  noCiConfigChanges: true,
  noPackageCommandChanges: true,
  noBlockingGate: true,
  noArtifactPublication: true,
});

export const buildSarifReadyMetadata = (
  input: Partial<Pick<
    SarifReadyMetadata,
    | "sarifMetadataId"
    | "ruleIdPrefix"
    | "resultKind"
    | "evidenceMappingLabel"
    | "limitationsMappingLabel"
  >> & {
    severityMapping?: Partial<Record<ReportEnvelopeSeverity, string>>;
  } = {},
): SarifReadyMetadata => ({
  sarifMetadataId: input.sarifMetadataId ?? "sarif_ready:metadata_only",
  ruleIdPrefix: input.ruleIdPrefix ?? "orquestador.report",
  resultKind: input.resultKind ?? "advisory_result",
  severityMapping: {
    info: input.severityMapping?.info ?? "note",
    low: input.severityMapping?.low ?? "note",
    medium: input.severityMapping?.medium ?? "warning",
    high: input.severityMapping?.high ?? "error",
    critical: input.severityMapping?.critical ?? "error",
  },
  evidenceMappingLabel: input.evidenceMappingLabel ?? "caller_supplied_evidence",
  limitationsMappingLabel: input.limitationsMappingLabel ?? "known_limitations",
  metadataOnly: true,
  reportOnly: true,
  noFileEmission: true,
  noArtifactPublication: true,
});

export const createReportEnvelope = (input: ReportEnvelopeInput): ReportEnvelope => {
  const findings = input.findings ?? [];
  const riskLevel = input.riskLevel ?? riskFromSeverity(input.severity);

  return {
    envelopeId: input.envelopeId,
    schemaVersion: input.schemaVersion ?? "1.0",
    source: input.source,
    reportKind: input.reportKind,
    phaseRef: input.phaseRef,
    generatedAtLabel: input.generatedAtLabel,
    status: input.status,
    severity: input.severity,
    summary: input.summary,
    findings,
    evidenceRefs: input.evidenceRefs ?? [],
    limitations: input.limitations ?? [],
    recommendedNextAction: input.recommendedNextAction,
    riskLevel,
    approvalRequired:
      input.approvalRequired ??
      input.recommendedNextAction.requiresHumanApproval ??
      findings.some((finding) => finding.approvalRequired),
    pmEscalation: input.pmEscalation ?? "pm_status_report",
    autopilotUse: input.autopilotUse ?? "not_applicable",
    ciCompatibility: input.ciCompatibility ?? buildCiCompatibilityMetadata(),
    sarifReadyMetadata: input.sarifReadyMetadata ?? buildSarifReadyMetadata(),
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noExecution: true,
    noCiActivation: true,
    noFileEmission: true,
    noProviderCalls: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
    noGitMutationFromSource: true,
  };
};

export const countEnvelopeSeverities = (
  findings: readonly ReportEnvelopeFinding[],
): ReportEnvelopeSeverityCounts => {
  const counts = emptySeverityCounts();
  findings.forEach((finding) => {
    counts[finding.severity] += 1;
  });
  return counts;
};

export const summarizeReportEnvelope = (
  envelope: ReportEnvelope,
): ReportEnvelopeSummary => {
  const severityCounts = countEnvelopeSeverities(envelope.findings);
  const highestFindingSeverity = envelope.findings.reduce<ReportEnvelopeSeverity>(
    (highest, finding) => (severityRank[finding.severity] > severityRank[highest] ? finding.severity : highest),
    envelope.severity,
  );

  return {
    summaryId: `report_envelope_summary:${envelope.envelopeId}`,
    schemaVersion: envelope.schemaVersion,
    envelopeId: envelope.envelopeId,
    status: envelope.status,
    severity: highestFindingSeverity,
    findingCount: envelope.findings.length,
    severityCounts,
    riskLevel: envelope.riskLevel,
    approvalRequired: envelope.approvalRequired,
    safeSummary: `Report envelope ${envelope.envelopeId} contains ${envelope.findings.length} finding(s); highest severity is ${highestFindingSeverity}.`,
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noExecution: true,
  };
};

export const createPmReportEnvelope = (
  input: PMReportEnvelopeInput,
): PMReportEnvelope => {
  const base = createReportEnvelope({
    ...input,
    source: "pm",
  });

  return {
    ...base,
    pmReportRef: input.pmReportRef,
    ...(input.projectStateRef ? { projectStateRef: input.projectStateRef } : {}),
    ...(input.milestoneRef ? { milestoneRef: input.milestoneRef } : {}),
    blockers: input.blockers ?? [],
    risks: input.risks ?? [],
    approvals: input.approvals ?? [],
    dodGaps: input.dodGaps ?? [],
    ...(input.nextAction ? { nextAction: input.nextAction } : {}),
    ...(input.confidence ? { confidence: input.confidence } : {}),
    uncertainty: input.uncertainty ?? [],
    evidenceRefs: input.evidenceRefs ?? [],
    ...(input.pmReport ? { pmReport: input.pmReport } : {}),
  };
};
