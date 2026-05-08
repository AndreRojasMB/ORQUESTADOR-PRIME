import type {
  ArchitectureReportEnvelope,
} from "../architecture/cli/report.js";
import type {
  ArchitectureSmellFinding,
} from "../architecture/smellTaxonomy.js";
import type {
  BackendLayeringFinding,
} from "../architecture/backendRules.js";
import type {
  DependencyInversionFinding,
} from "../architecture/dependencyRules.js";
import type {
  FrontendResponsibilityFinding,
} from "../architecture/frontendRules.js";
import type {
  ModuleBoundaryFinding,
} from "../architecture/moduleBoundaries.js";
import type {
  ReviewFinding,
} from "../architecture/reviewFindingTypes.js";
import type {
  SolidArchitectureFinding,
} from "../architecture/solidTypes.js";
import type {
  SolidValidatorFindingSummary,
} from "../architecture/solidValidator.js";
import type {
  PMReportEnvelope,
  ReportEnvelopeRecommendedNextAction,
  ReportEnvelopeSeverity,
  ReportEnvelopeStatus,
} from "./cli/report.js";
import type {
  PMEvidenceReference,
  PMRiskTier,
  PMSchemaVersion,
  ProjectPhaseRef,
} from "./types.js";

export type PmSolidIntegrationStatus =
  | "ready"
  | "ready_with_warnings"
  | "needs_review"
  | "blocked";

export type PmSolidReadinessArea =
  | "pm_core"
  | "solid_core"
  | "autopilot_support"
  | "report_envelopes";

export type PmSolidRiskEscalationSource =
  | "solid_finding"
  | "boundary_finding"
  | "dependency_finding"
  | "smell_finding"
  | "review_finding"
  | "validator_summary"
  | "frontend_finding"
  | "backend_finding"
  | "architecture_report_envelope"
  | "manual_metadata";

export interface PmSolidRiskEscalation {
  escalationId: string;
  sourceFindingRef: string;
  sourceReportRef: string;
  targetPmRiskRef: string;
  source: PmSolidRiskEscalationSource;
  severity: ReportEnvelopeSeverity;
  riskLevel: PMRiskTier;
  blockerCandidate: boolean;
  approvalRequirement: string;
  suggestedMitigation: string;
  evidenceRefs: PMEvidenceReference[];
  nextActionRecommendation: ReportEnvelopeRecommendedNextAction;
  humanReviewRequired: boolean;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
  noRuntimeExecution: true;
  noProviderCalls: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
  noCiActivation: true;
}

export interface PmSolidRiskEscalationInput {
  escalationId?: string;
  sourceFindingRef: string;
  sourceReportRef?: string;
  targetPmRiskRef?: string;
  source?: PmSolidRiskEscalationSource;
  severity: ReportEnvelopeSeverity;
  riskLevel?: PMRiskTier;
  blockerCandidate?: boolean;
  approvalRequirement?: string;
  suggestedMitigation?: string;
  evidenceRefs?: PMEvidenceReference[];
  nextActionRecommendation?: ReportEnvelopeRecommendedNextAction;
  humanReviewRequired?: boolean;
}

export interface PmSolidReadinessSummary {
  summaryId: string;
  area: PmSolidReadinessArea;
  status: PmSolidIntegrationStatus;
  safeSummary: string;
  completedRefs: string[];
  warningRefs: string[];
  blockerRefs: string[];
  evidenceRefs: PMEvidenceReference[];
  knownLimitations: string[];
  deferredRuntimeItems: string[];
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
}

export interface PmSolidReadinessSummaryInput {
  summaryId?: string;
  area: PmSolidReadinessArea;
  completedRefs?: string[];
  warningRefs?: string[];
  blockerRefs?: string[];
  evidenceRefs?: PMEvidenceReference[];
  knownLimitations?: string[];
  deferredRuntimeItems?: string[];
  safeSummary?: string;
}

export interface PmSolidOptionalPilotRecommendation {
  phaseRef: ProjectPhaseRef;
  safeSummary: string;
  recommendedOnlyAfterPhase: ProjectPhaseRef;
  requiresSeparatePlan: true;
  metadataOnly: true;
  advisoryOnly: true;
  noExecution: true;
}

export interface Block101120ReadinessReview {
  reviewId: string;
  schemaVersion: PMSchemaVersion;
  status: PmSolidIntegrationStatus;
  pmCoreReadiness: PmSolidReadinessSummary;
  solidCoreReadiness: PmSolidReadinessSummary;
  autopilotSupportReadiness: PmSolidReadinessSummary;
  reportEnvelopeReadiness: PmSolidReadinessSummary;
  knownLimitations: string[];
  deferredRuntimeItems: string[];
  safeNextBlockTarget: ProjectPhaseRef;
  optionalPilotRecommendation: PmSolidOptionalPilotRecommendation;
  evidenceRefs: PMEvidenceReference[];
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
  noRuntimeExecution: true;
  noProviderCalls: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
  noCiActivation: true;
}

export interface PmSolidIntegrationInput {
  integrationId: string;
  phaseRef: ProjectPhaseRef;
  pmReportEnvelopeRefs: string[];
  architectureReportEnvelopeRefs: string[];
  pmReportEnvelopes?: PMReportEnvelope[];
  architectureReportEnvelopes?: ArchitectureReportEnvelope[];
  solidFindings?: SolidArchitectureFinding[];
  boundaryFindings?: ModuleBoundaryFinding[];
  dependencyFindings?: DependencyInversionFinding[];
  smellFindings?: ArchitectureSmellFinding[];
  reviewFindings?: ReviewFinding[];
  validatorSummaries?: SolidValidatorFindingSummary[];
  frontendFindings?: FrontendResponsibilityFinding[];
  backendFindings?: BackendLayeringFinding[];
  autopilotCloseoutRefs?: string[];
  autopilotStatusRefs?: string[];
  evidenceRefs?: PMEvidenceReference[];
  knownLimitations?: string[];
  deferredRuntimeItems?: string[];
  safeNextBlockTarget?: ProjectPhaseRef;
  optionalPilotPhaseRef?: ProjectPhaseRef;
  metadataOnly: true;
  callerSuppliedOnly: true;
  noFileRead: true;
  noRuntimeExecution: true;
  noProviderCalls: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
  noCiActivation: true;
}

export interface PmSolidIntegrationReport {
  reportId: string;
  schemaVersion: PMSchemaVersion;
  integrationId: string;
  phaseRef: ProjectPhaseRef;
  status: PmSolidIntegrationStatus;
  summary: string;
  riskEscalations: PmSolidRiskEscalation[];
  readinessReview: Block101120ReadinessReview;
  recommendedNextStep: ReportEnvelopeRecommendedNextAction;
  evidenceRefs: PMEvidenceReference[];
  knownLimitations: string[];
  deferredRuntimeItems: string[];
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  callerSuppliedOnly: true;
  noExecution: true;
  noRuntimeExecution: true;
  noProviderCalls: true;
  noDashboardMutation: true;
  noMemoryPersistence: true;
  noCiActivation: true;
  noGitMutationFromSource: true;
}

const severityRank: Record<ReportEnvelopeSeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const statusRank: Record<PmSolidIntegrationStatus, number> = {
  ready: 0,
  ready_with_warnings: 1,
  needs_review: 2,
  blocked: 3,
};

const defaultEvidenceRefs = (
  evidenceRefs: readonly PMEvidenceReference[] | undefined,
): PMEvidenceReference[] => (evidenceRefs ? [...evidenceRefs] : []);

const uniqueStrings = (values: readonly string[]): string[] =>
  Array.from(new Set(values.filter((value) => value.trim().length > 0)));

const riskFromSeverity = (severity: ReportEnvelopeSeverity): PMRiskTier => {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
};

const statusFromReadiness = (
  summaries: readonly PmSolidReadinessSummary[],
): PmSolidIntegrationStatus =>
  summaries.reduce<PmSolidIntegrationStatus>(
    (highest, summary) =>
      statusRank[summary.status] > statusRank[highest] ? summary.status : highest,
    "ready",
  );

const statusFromSeverity = (severity: ReportEnvelopeSeverity): PmSolidIntegrationStatus => {
  if (severity === "critical") return "blocked";
  if (severity === "high") return "needs_review";
  if (severity === "medium") return "ready_with_warnings";
  return "ready";
};

const normalizeSeverity = (
  severity: "info" | "warn" | "fail" | "critical" | ReportEnvelopeSeverity,
): ReportEnvelopeSeverity => {
  if (severity === "warn") return "medium";
  if (severity === "fail") return "high";
  return severity;
};

const defaultNextAction = (
  riskLevel: PMRiskTier,
  requiresHumanApproval: boolean,
  nextPhase: ProjectPhaseRef,
): ReportEnvelopeRecommendedNextAction => ({
  actionId: `pm_solid_next_action:${nextPhase}`,
  label: "Continue with formal roadmap review",
  safeSummary: requiresHumanApproval
    ? "Review PM/SOLID metadata before continuing to the next formal phase."
    : "Continue to the next formal planning phase with PM/SOLID metadata as context.",
  nextPhase,
  riskLevel,
  requiresHumanApproval,
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
});

export const createPmSolidRiskEscalation = (
  input: PmSolidRiskEscalationInput,
): PmSolidRiskEscalation => {
  const riskLevel = input.riskLevel ?? riskFromSeverity(input.severity);
  const blockerCandidate =
    input.blockerCandidate ??
    (input.severity === "critical" || riskLevel === "critical");
  const humanReviewRequired =
    input.humanReviewRequired ??
    (blockerCandidate || riskLevel === "high" || riskLevel === "critical");
  const nextActionRecommendation =
    input.nextActionRecommendation ??
    defaultNextAction(riskLevel, humanReviewRequired, "Phase 121B");

  return {
    escalationId: input.escalationId ?? `pm_solid_escalation:${input.sourceFindingRef}`,
    sourceFindingRef: input.sourceFindingRef,
    sourceReportRef: input.sourceReportRef ?? "caller_supplied_report_ref",
    targetPmRiskRef: input.targetPmRiskRef ?? `pm_risk:${input.sourceFindingRef}`,
    source: input.source ?? "manual_metadata",
    severity: input.severity,
    riskLevel,
    blockerCandidate,
    approvalRequirement:
      input.approvalRequirement ??
      (humanReviewRequired ? "human_review_required" : "human_review_not_required"),
    suggestedMitigation:
      input.suggestedMitigation ??
      "Capture the finding as PM risk context and keep remediation in a separately approved phase.",
    evidenceRefs: defaultEvidenceRefs(input.evidenceRefs),
    nextActionRecommendation,
    humanReviewRequired,
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noExecution: true,
    noRuntimeExecution: true,
    noProviderCalls: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
    noCiActivation: true,
  };
};

export const buildPmSolidReadinessSummary = (
  input: PmSolidReadinessSummaryInput,
): PmSolidReadinessSummary => {
  const completedReferences = uniqueStrings(input.completedRefs ?? []);
  const warningReferences = uniqueStrings(input.warningRefs ?? []);
  const blockerReferences = uniqueStrings(input.blockerRefs ?? []);
  const status: PmSolidIntegrationStatus =
    blockerReferences.length > 0
      ? "blocked"
      : warningReferences.length > 0
        ? "ready_with_warnings"
        : completedReferences.length > 0
          ? "ready"
          : "needs_review";

  return {
    summaryId: input.summaryId ?? `pm_solid_readiness:${input.area}`,
    area: input.area,
    status,
    safeSummary:
      input.safeSummary ??
      `${input.area} readiness is ${status} based on caller-supplied metadata.`,
    completedRefs: completedReferences,
    warningRefs: warningReferences,
    blockerRefs: blockerReferences,
    evidenceRefs: defaultEvidenceRefs(input.evidenceRefs),
    knownLimitations: [...(input.knownLimitations ?? [])],
    deferredRuntimeItems: [...(input.deferredRuntimeItems ?? [])],
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noExecution: true,
  };
};

export const summarizeBlock101120Readiness = (input: {
  reviewId?: string;
  pmCoreReadiness: PmSolidReadinessSummary;
  solidCoreReadiness: PmSolidReadinessSummary;
  autopilotSupportReadiness: PmSolidReadinessSummary;
  reportEnvelopeReadiness: PmSolidReadinessSummary;
  knownLimitations?: string[];
  deferredRuntimeItems?: string[];
  safeNextBlockTarget?: ProjectPhaseRef;
  optionalPilotPhaseRef?: ProjectPhaseRef;
  evidenceRefs?: PMEvidenceReference[];
}): Block101120ReadinessReview => {
  const summaries = [
    input.pmCoreReadiness,
    input.solidCoreReadiness,
    input.autopilotSupportReadiness,
    input.reportEnvelopeReadiness,
  ];
  const status = statusFromReadiness(summaries);
  const safeNextBlockTarget = input.safeNextBlockTarget ?? "Phase 121B";
  const optionalPilotPhaseRef = input.optionalPilotPhaseRef ?? "Phase PILOT-1B";

  return {
    reviewId: input.reviewId ?? "block_101_120_readiness:120I",
    schemaVersion: "1.0",
    status,
    pmCoreReadiness: input.pmCoreReadiness,
    solidCoreReadiness: input.solidCoreReadiness,
    autopilotSupportReadiness: input.autopilotSupportReadiness,
    reportEnvelopeReadiness: input.reportEnvelopeReadiness,
    knownLimitations: uniqueStrings([
      ...(input.knownLimitations ?? []),
      ...summaries.flatMap((summary) => summary.knownLimitations),
    ]),
    deferredRuntimeItems: uniqueStrings([
      ...(input.deferredRuntimeItems ?? []),
      ...summaries.flatMap((summary) => summary.deferredRuntimeItems),
    ]),
    safeNextBlockTarget,
    optionalPilotRecommendation: {
      phaseRef: optionalPilotPhaseRef,
      safeSummary:
        "A controlled Autopilot dry-run pilot can be considered only after Phase 120I closes cleanly.",
      recommendedOnlyAfterPhase: "Phase 120I",
      requiresSeparatePlan: true,
      metadataOnly: true,
      advisoryOnly: true,
      noExecution: true,
    },
    evidenceRefs: defaultEvidenceRefs(input.evidenceRefs),
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noExecution: true,
    noRuntimeExecution: true,
    noProviderCalls: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
    noCiActivation: true,
  };
};

export const recommendPost120NextStep = (
  review: Block101120ReadinessReview,
): ReportEnvelopeRecommendedNextAction => ({
  actionId: `post_120_next_step:${review.safeNextBlockTarget}`,
  label:
    review.status === "ready" || review.status === "ready_with_warnings"
      ? "Continue to the next formal block"
      : "Review PM/SOLID readiness before continuing",
  safeSummary:
    review.status === "ready" || review.status === "ready_with_warnings"
      ? `Continue to ${review.safeNextBlockTarget}; optional pilot remains separate.`
      : "Resolve readiness blockers or evidence gaps before leaving the 101-120 block.",
  nextPhase: review.safeNextBlockTarget,
  riskLevel: review.status === "blocked" ? "high" : review.status === "needs_review" ? "medium" : "low",
  requiresHumanApproval: review.status === "blocked" || review.status === "needs_review",
  metadataOnly: true,
  advisoryOnly: true,
  noExecution: true,
});

const escalationFromFinding = (input: {
  sourceFindingRef: string;
  sourceReportRef: string;
  source: PmSolidRiskEscalationSource;
  severity: ReportEnvelopeSeverity;
  evidenceRefs: PMEvidenceReference[];
  suggestedMitigation?: string;
}): PmSolidRiskEscalation =>
  createPmSolidRiskEscalation({
    sourceFindingRef: input.sourceFindingRef,
    sourceReportRef: input.sourceReportRef,
    source: input.source,
    severity: input.severity,
    evidenceRefs: input.evidenceRefs,
    ...(input.suggestedMitigation ? { suggestedMitigation: input.suggestedMitigation } : {}),
  });

const collectRiskEscalations = (
  input: PmSolidIntegrationInput,
): PmSolidRiskEscalation[] => {
  const architectureEnvelopeEscalations =
    input.architectureReportEnvelopes?.flatMap((envelope) =>
      envelope.findings.map((finding) =>
        escalationFromFinding({
          sourceFindingRef: finding.findingId,
          sourceReportRef: envelope.architectureReportRef,
          source: "architecture_report_envelope",
          severity: finding.severity,
          evidenceRefs: finding.evidenceRefs,
          suggestedMitigation:
            "Use the architecture report envelope as PM risk context; schedule remediation separately.",
        }),
      ),
    ) ?? [];

  const solidEscalations =
    input.solidFindings?.map((finding) =>
      escalationFromFinding({
        sourceFindingRef: finding.findingId,
        sourceReportRef: "solid_findings",
        source: "solid_finding",
        severity: normalizeSeverity(finding.severity),
        evidenceRefs: finding.evidenceRefs,
      }),
    ) ?? [];

  const boundaryEscalations =
    input.boundaryFindings?.map((finding) =>
      escalationFromFinding({
        sourceFindingRef: finding.findingId,
        sourceReportRef: "module_boundary_findings",
        source: "boundary_finding",
        severity: normalizeSeverity(finding.severity),
        evidenceRefs: finding.evidenceRefs,
      }),
    ) ?? [];

  const dependencyEscalations =
    input.dependencyFindings?.map((finding) =>
      escalationFromFinding({
        sourceFindingRef: finding.findingId,
        sourceReportRef: "dependency_inversion_findings",
        source: "dependency_finding",
        severity: normalizeSeverity(finding.severity),
        evidenceRefs: finding.evidenceRefs,
      }),
    ) ?? [];

  const smellEscalations =
    input.smellFindings?.map((finding) =>
      escalationFromFinding({
        sourceFindingRef: finding.findingId,
        sourceReportRef: "architecture_smell_findings",
        source: "smell_finding",
        severity: finding.severity,
        evidenceRefs: finding.evidenceRefs,
      }),
    ) ?? [];

  const reviewEscalations =
    input.reviewFindings?.map((finding) =>
      escalationFromFinding({
        sourceFindingRef: finding.findingId,
        sourceReportRef: "solid_review_findings",
        source: "review_finding",
        severity: finding.severity,
        evidenceRefs: finding.evidenceRefs,
      }),
    ) ?? [];

  const validatorEscalations =
    input.validatorSummaries?.map((summary) =>
      escalationFromFinding({
        sourceFindingRef: summary.summaryId,
        sourceReportRef: "solid_validator_summaries",
        source: "validator_summary",
        severity: summary.highestSeverity,
        evidenceRefs: [],
        suggestedMitigation:
          "Use validator severity counts as PM readiness context; do not run validation from this hook.",
      }),
    ) ?? [];

  const frontendEscalations =
    input.frontendFindings?.map((finding) =>
      escalationFromFinding({
        sourceFindingRef: finding.findingId,
        sourceReportRef: "frontend_responsibility_findings",
        source: "frontend_finding",
        severity: finding.severity,
        evidenceRefs: finding.evidenceRefs,
      }),
    ) ?? [];

  const backendEscalations =
    input.backendFindings?.map((finding) =>
      escalationFromFinding({
        sourceFindingRef: finding.findingId,
        sourceReportRef: "backend_layering_findings",
        source: "backend_finding",
        severity: finding.severity,
        evidenceRefs: finding.evidenceRefs,
      }),
    ) ?? [];

  return [
    ...architectureEnvelopeEscalations,
    ...solidEscalations,
    ...boundaryEscalations,
    ...dependencyEscalations,
    ...smellEscalations,
    ...reviewEscalations,
    ...validatorEscalations,
    ...frontendEscalations,
    ...backendEscalations,
  ];
};

const refsFromInput = (input: PmSolidIntegrationInput): {
  pmEnvelopeReferences: string[];
  solidFindingReferences: string[];
  autopilotReferences: string[];
  architectureEnvelopeReferences: string[];
} => ({
  pmEnvelopeReferences: uniqueStrings([
    ...input.pmReportEnvelopeRefs,
    ...(input.pmReportEnvelopes?.map((envelope) => envelope.pmReportRef) ?? []),
  ]),
  solidFindingReferences: uniqueStrings([
    ...(input.solidFindings?.map((finding) => finding.findingId) ?? []),
    ...(input.boundaryFindings?.map((finding) => finding.findingId) ?? []),
    ...(input.dependencyFindings?.map((finding) => finding.findingId) ?? []),
    ...(input.smellFindings?.map((finding) => finding.findingId) ?? []),
    ...(input.reviewFindings?.map((finding) => finding.findingId) ?? []),
    ...(input.validatorSummaries?.map((summary) => summary.summaryId) ?? []),
    ...(input.frontendFindings?.map((finding) => finding.findingId) ?? []),
    ...(input.backendFindings?.map((finding) => finding.findingId) ?? []),
  ]),
  autopilotReferences: uniqueStrings([
    ...(input.autopilotCloseoutRefs ?? []),
    ...(input.autopilotStatusRefs ?? []),
  ]),
  architectureEnvelopeReferences: uniqueStrings([
    ...input.architectureReportEnvelopeRefs,
    ...(input.architectureReportEnvelopes?.map((envelope) => envelope.architectureReportRef) ?? []),
  ]),
});

export const buildPmSolidIntegrationReport = (
  input: PmSolidIntegrationInput,
): PmSolidIntegrationReport => {
  const riskEscalations = collectRiskEscalations(input);
  const highestSeverity = riskEscalations.reduce<ReportEnvelopeSeverity>(
    (highest, escalation) =>
      severityRank[escalation.severity] > severityRank[highest] ? escalation.severity : highest,
    "info",
  );
  const integrationReferences = refsFromInput(input);
  const severeEscalations = riskEscalations.filter(
    (escalation) => escalation.riskLevel === "high" || escalation.riskLevel === "critical",
  );
  const readinessStatus = statusFromSeverity(highestSeverity);
  const knownLimitations = [
    ...(input.knownLimitations ?? []),
    "The integration report is built from caller-supplied metadata only.",
  ];
  const deferredRuntimeItems = [
    ...(input.deferredRuntimeItems ?? []),
    "Runtime execution remains deferred.",
    "CI activation remains deferred.",
    "Provider, dashboard, database, and memory side effects remain deferred.",
  ];
  const evidenceRefs = input.evidenceRefs ?? [];
  const safeNextBlockTarget = input.safeNextBlockTarget ?? "Phase 121B";
  const optionalPilotPhaseRef = input.optionalPilotPhaseRef ?? "Phase PILOT-1B";

  const pmCoreReadiness = buildPmSolidReadinessSummary({
    area: "pm_core",
    completedRefs:
      integrationReferences.pmEnvelopeReferences.length > 0
        ? integrationReferences.pmEnvelopeReferences
        : ["pm_core:101_110"],
    evidenceRefs,
    knownLimitations,
    deferredRuntimeItems,
    safeSummary: "PM Core 101-110 is ready as source-only advisory metadata for integration review.",
  });
  const solidCoreReadiness = buildPmSolidReadinessSummary({
    area: "solid_core",
    completedRefs:
      integrationReferences.solidFindingReferences.length > 0
        ? integrationReferences.solidFindingReferences
        : ["solid_core:111_119"],
    warningRefs: severeEscalations.map((escalation) => escalation.escalationId),
    evidenceRefs,
    knownLimitations,
    deferredRuntimeItems,
    safeSummary: "SOLID Core 111-119 is ready as report-only architecture metadata with any severe findings kept advisory.",
  });
  const autopilotSupportReadiness = buildPmSolidReadinessSummary({
    area: "autopilot_support",
    completedRefs:
      integrationReferences.autopilotReferences.length > 0
        ? integrationReferences.autopilotReferences
        : ["autopilot_support:26G_26K"],
    evidenceRefs,
    knownLimitations,
    deferredRuntimeItems,
    safeSummary: "Autopilot support is ready to receive PM/SOLID context without triggering execution.",
  });
  const reportEnvelopeReadiness = buildPmSolidReadinessSummary({
    area: "report_envelopes",
    completedRefs:
      integrationReferences.architectureEnvelopeReferences.length > 0
        ? integrationReferences.architectureEnvelopeReferences
        : ["report_envelopes:119I"],
    evidenceRefs,
    knownLimitations,
    deferredRuntimeItems,
    safeSummary: "PM/SOLID report envelopes are ready as metadata wrappers for integration review.",
  });
  const readinessReview = summarizeBlock101120Readiness({
    pmCoreReadiness,
    solidCoreReadiness,
    autopilotSupportReadiness,
    reportEnvelopeReadiness,
    knownLimitations,
    deferredRuntimeItems,
    safeNextBlockTarget,
    optionalPilotPhaseRef,
    evidenceRefs,
  });
  const recommendedNextStep = recommendPost120NextStep(readinessReview);

  return {
    reportId: `pm_solid_integration_report:${input.integrationId}`,
    schemaVersion: "1.0",
    integrationId: input.integrationId,
    phaseRef: input.phaseRef,
    status:
      statusRank[readinessStatus] > statusRank[readinessReview.status]
        ? readinessStatus
        : readinessReview.status,
    summary:
      `PM/SOLID integration review contains ${riskEscalations.length} risk escalation candidate(s) and targets ${readinessReview.safeNextBlockTarget}.`,
    riskEscalations,
    readinessReview,
    recommendedNextStep,
    evidenceRefs: defaultEvidenceRefs(input.evidenceRefs),
    knownLimitations,
    deferredRuntimeItems,
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    callerSuppliedOnly: true,
    noExecution: true,
    noRuntimeExecution: true,
    noProviderCalls: true,
    noDashboardMutation: true,
    noMemoryPersistence: true,
    noCiActivation: true,
    noGitMutationFromSource: true,
  };
};
