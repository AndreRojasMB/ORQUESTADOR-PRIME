import {
  solidArchitectureBoundaries,
  type SolidArchitectureBoundarySet,
} from "./solidBoundaries.js";
import {
  buildDefaultSolidRuleRegistry,
  type SolidRuleRegistry,
  type SolidRuleRegistryEntry,
  type SolidValidatorConfig,
  type SolidValidatorSeverity,
} from "./solidRuleRegistry.js";
import type {
  ArchitectureSmellFinding,
} from "./smellTaxonomy.js";
import type {
  DependencyClassifierResult,
} from "./dependencyClassifier.js";
import type {
  DependencyInversionFinding,
} from "./dependencyRules.js";
import type {
  ModuleBoundaryFinding,
  ModuleBoundarySeverity,
  ModuleReference,
} from "./moduleBoundaries.js";
import type {
  ReviewFinding,
  SolidReviewChecklistItem,
  SolidReviewSeverity,
} from "./reviewFindingTypes.js";
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

export type SolidValidatorTargetKind =
  | "module"
  | "phase"
  | "report"
  | "milestone"
  | "architecture_review";

export type SolidValidatorStatus =
  | "passed"
  | "warning"
  | "failed"
  | "needs_review"
  | "blocked"
  | "insufficient_evidence";

export type SolidValidatorFindingSource =
  | "rule_registry"
  | "checklist"
  | "boundary"
  | "dependency"
  | "smell"
  | "evidence";

export interface SolidValidatorInput {
  validationId: string;
  targetRef: string;
  targetKind: SolidValidatorTargetKind;
  suppliedModules: ModuleReference[];
  suppliedDependencies: DependencyClassifierResult[];
  suppliedChecklistItems: SolidReviewChecklistItem[];
  suppliedBoundaryFindings: ModuleBoundaryFinding[];
  suppliedDependencyFindings: DependencyInversionFinding[];
  suppliedSmellFindings: ArchitectureSmellFinding[];
  suppliedReviewFindings: ReviewFinding[];
  suppliedEvidenceRefs: PMEvidenceReference[];
  configRef: string;
  metadataOnly: true;
  callerSuppliedOnly: true;
  noFileRead: true;
  noRuntimeExecution: true;
  noScannerExecution: true;
  noRefactorExecution: true;
}

export interface SolidValidatorRecommendedNextAction {
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

export interface SolidValidatorFinding {
  findingId: string;
  source: SolidValidatorFindingSource;
  ruleId?: string;
  title: string;
  severity: SolidValidatorSeverity;
  principleRefs: SolidPrinciple[];
  description: string;
  evidenceRefs: PMEvidenceReference[];
  riskLevel: PMRiskTier;
  approvalRequired: boolean;
  pmEscalation: SolidPmEscalation;
  autopilotUse: SolidAutopilotUse;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noRuntimeExecution: true;
  noScannerExecution: true;
  noRefactorExecution: true;
}

export interface SolidValidatorInputValidationSummary {
  validationId: string;
  status: SolidValidatorStatus;
  valid: boolean;
  enabledRuleIds: string[];
  missingEvidence: string[];
  suppliedCounts: {
    modules: number;
    dependencies: number;
    checklistItems: number;
    boundaryFindings: number;
    dependencyFindings: number;
    smellFindings: number;
    reviewFindings: number;
    evidenceRefs: number;
  };
  limitations: string[];
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noRuntimeExecution: true;
  noScannerExecution: true;
  noRefactorExecution: true;
}

export interface SolidValidatorSeverityCounts {
  info: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface SolidValidatorFindingSummary {
  summaryId: string;
  schemaVersion: PMSchemaVersion;
  findingCount: number;
  severityCounts: SolidValidatorSeverityCounts;
  highestSeverity: SolidValidatorSeverity;
  safeSummary: string;
  approvalRequired: boolean;
  riskLevel: PMRiskTier;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noRuntimeExecution: true;
  noScannerExecution: true;
  noRefactorExecution: true;
}

export interface SolidValidatorReport {
  reportId: string;
  validationId: string;
  schemaVersion: PMSchemaVersion;
  status: SolidValidatorStatus;
  findings: SolidValidatorFinding[];
  summary: SolidValidatorFindingSummary;
  severityCounts: SolidValidatorSeverityCounts;
  riskLevel: PMRiskTier;
  approvalRequired: boolean;
  pmEscalation: SolidPmEscalation;
  autopilotUse: SolidAutopilotUse;
  evidenceRefs: PMEvidenceReference[];
  limitations: string[];
  recommendedNextAction: SolidValidatorRecommendedNextAction;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  callerSuppliedOnly: true;
  noRuntimeExecution: true;
  noScannerExecution: true;
  noRefactorExecution: true;
  boundaries: SolidArchitectureBoundarySet;
}

const severityRank: Record<SolidValidatorSeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const emptySeverityCounts = (): SolidValidatorSeverityCounts => ({
  info: 0,
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
});

const normalizeBoundarySeverity = (
  severity: ModuleBoundarySeverity,
): SolidValidatorSeverity => {
  if (severity === "critical") return "critical";
  if (severity === "fail") return "high";
  if (severity === "warn") return "medium";
  return "info";
};

const normalizeReviewSeverity = (
  severity: SolidReviewSeverity,
): SolidValidatorSeverity => severity;

const riskFromSeverity = (
  severity: SolidValidatorSeverity,
): PMRiskTier => {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
};

const highestSeverityOf = (
  severities: readonly SolidValidatorSeverity[],
): SolidValidatorSeverity =>
  severities.reduce<SolidValidatorSeverity>(
    (highest, current) => (severityRank[current] > severityRank[highest] ? current : highest),
    "info",
  );

const evidenceMatches = (
  evidence: PMEvidenceReference,
  requiredEvidence: string,
): boolean => {
  const needle = requiredEvidence.toLocaleLowerCase();
  return [
    evidence.evidenceId,
    evidence.label,
    evidence.reference,
    evidence.safeSummary,
  ].some((value) => value.toLocaleLowerCase().includes(needle));
};

const collectMissingEvidence = (
  input: SolidValidatorInput,
  rules: readonly SolidRuleRegistryEntry[],
): string[] => {
  const required = new Set(rules.flatMap((rule) => rule.requiredEvidence));
  return [...required].filter(
    (requiredEvidence) =>
      !input.suppliedEvidenceRefs.some((evidence) => evidenceMatches(evidence, requiredEvidence)),
  );
};

const chooseEnabledRules = (
  registry: SolidRuleRegistry,
  config: SolidValidatorConfig,
): SolidRuleRegistryEntry[] => {
  if (config.enabledRuleIds.length === 0) return [...registry.rules];
  const enabled = new Set(config.enabledRuleIds);
  return registry.rules.filter((rule) => enabled.has(rule.ruleId));
};

export const countSolidValidatorSeverities = (
  findings: readonly SolidValidatorFinding[],
): SolidValidatorSeverityCounts => {
  const severityCounts = emptySeverityCounts();
  findings.forEach((finding) => {
    severityCounts[finding.severity] += 1;
  });
  return severityCounts;
};

const createRuleEvidenceFinding = (
  rule: SolidRuleRegistryEntry,
  missingEvidence: readonly string[],
  severityOverride?: SolidValidatorSeverity,
): SolidValidatorFinding => {
  const severity = severityOverride ?? rule.severityDefault;
  return {
    findingId: `solid_validator_finding:${rule.ruleId}:missing_evidence`,
    source: "rule_registry",
    ruleId: rule.ruleId,
    title: `${rule.title} evidence gap`,
    severity,
    principleRefs: [...rule.principleRefs],
    description: `Rule ${rule.ruleId} is missing required supplied evidence: ${missingEvidence.join(", ")}.`,
    evidenceRefs: [],
    riskLevel: riskFromSeverity(severity),
    approvalRequired: severity === "high" || severity === "critical",
    pmEscalation: severity === "critical" ? "blocker_metadata" : "pm_status_report",
    autopilotUse: "validation_context_only",
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noRuntimeExecution: true,
    noScannerExecution: true,
    noRefactorExecution: true,
  };
};

const findingsFromRules = (
  input: SolidValidatorInput,
  rules: readonly SolidRuleRegistryEntry[],
  config: SolidValidatorConfig,
): SolidValidatorFinding[] =>
  rules.flatMap((rule) => {
    const missingEvidence = rule.requiredEvidence.filter(
      (requiredEvidence) =>
        !input.suppliedEvidenceRefs.some((evidence) => evidenceMatches(evidence, requiredEvidence)),
    );
    if (missingEvidence.length === 0) return [];

    const severity =
      config.requiredEvidencePolicy === "block"
        ? "critical"
        : config.requiredEvidencePolicy === "needs_review"
          ? "medium"
          : "low";

    return [
      createRuleEvidenceFinding(
        rule,
        missingEvidence,
        config.severityOverrides[rule.ruleId] ?? severity,
      ),
    ];
  });

const findingsFromBoundary = (
  findings: readonly ModuleBoundaryFinding[],
): SolidValidatorFinding[] =>
  findings.map((finding) => {
    const severity = normalizeBoundarySeverity(finding.severity);
    return {
      findingId: `solid_validator_finding:boundary:${finding.findingId}`,
      source: "boundary",
      title: "Module boundary finding",
      severity,
      principleRefs: ["srp", "dip"],
      description: finding.description,
      evidenceRefs: finding.evidenceRefs,
      riskLevel: finding.riskLevel,
      approvalRequired: finding.approvalRequired,
      pmEscalation: finding.pmEscalation,
      autopilotUse: finding.autopilotUse,
      metadataOnly: true,
      reportOnly: true,
      advisoryOnly: true,
      sourceOnly: true,
      noRuntimeExecution: true,
      noScannerExecution: true,
      noRefactorExecution: true,
    };
  });

const findingsFromDependency = (
  findings: readonly DependencyInversionFinding[],
): SolidValidatorFinding[] =>
  findings.map((finding) => {
    const severity = normalizeBoundarySeverity(finding.severity);
    return {
      findingId: `solid_validator_finding:dependency:${finding.findingId}`,
      source: "dependency",
      title: "Dependency inversion finding",
      severity,
      principleRefs: ["dip"],
      description: finding.description,
      evidenceRefs: finding.evidenceRefs,
      riskLevel: finding.riskLevel,
      approvalRequired: finding.approvalRequired,
      pmEscalation: finding.pmEscalation,
      autopilotUse: finding.autopilotUse,
      metadataOnly: true,
      reportOnly: true,
      advisoryOnly: true,
      sourceOnly: true,
      noRuntimeExecution: true,
      noScannerExecution: true,
      noRefactorExecution: true,
    };
  });

const findingsFromSmell = (
  findings: readonly ArchitectureSmellFinding[],
): SolidValidatorFinding[] =>
  findings.map((finding) => ({
    findingId: `solid_validator_finding:smell:${finding.findingId}`,
    source: "smell",
    title: "Architecture smell finding",
    severity: finding.severity,
    principleRefs: [...finding.relatedPrinciples],
    description: finding.description,
    evidenceRefs: finding.evidenceRefs,
    riskLevel: finding.riskLevel,
    approvalRequired: finding.approvalRequired,
    pmEscalation: finding.pmEscalation,
    autopilotUse: finding.autopilotUse,
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noRuntimeExecution: true,
    noScannerExecution: true,
    noRefactorExecution: true,
  }));

const findingsFromReview = (
  findings: readonly ReviewFinding[],
): SolidValidatorFinding[] =>
  findings.map((finding) => {
    const severity = normalizeReviewSeverity(finding.severity);
    return {
      findingId: `solid_validator_finding:review:${finding.findingId}`,
      source: "checklist",
      title: "SOLID review finding",
      severity,
      principleRefs: [],
      description: finding.description,
      evidenceRefs: finding.evidenceRefs,
      riskLevel: finding.riskLevel,
      approvalRequired: finding.approvalRequired,
      pmEscalation: finding.pmEscalation,
      autopilotUse: finding.autopilotUse,
      metadataOnly: true,
      reportOnly: true,
      advisoryOnly: true,
      sourceOnly: true,
      noRuntimeExecution: true,
      noScannerExecution: true,
      noRefactorExecution: true,
    };
  });

export const validateSolidInputMetadata = (
  input: SolidValidatorInput,
  registry: SolidRuleRegistry = buildDefaultSolidRuleRegistry(),
  config: SolidValidatorConfig = registry.defaultConfig,
): SolidValidatorInputValidationSummary => {
  const enabledRules = chooseEnabledRules(registry, config);
  const missingEvidence = collectMissingEvidence(input, enabledRules);
  const hasSuppliedReviewMetadata =
    input.suppliedChecklistItems.length > 0 ||
    input.suppliedBoundaryFindings.length > 0 ||
    input.suppliedDependencyFindings.length > 0 ||
    input.suppliedSmellFindings.length > 0 ||
    input.suppliedReviewFindings.length > 0;
  const status: SolidValidatorStatus =
    missingEvidence.length > 0
      ? config.requiredEvidencePolicy === "block"
        ? "blocked"
        : config.requiredEvidencePolicy === "needs_review"
          ? "insufficient_evidence"
          : "warning"
      : hasSuppliedReviewMetadata
        ? "passed"
        : "needs_review";

  return {
    validationId: input.validationId,
    status,
    valid: status === "passed" || status === "warning",
    enabledRuleIds: enabledRules.map((rule) => rule.ruleId),
    missingEvidence,
    suppliedCounts: {
      modules: input.suppliedModules.length,
      dependencies: input.suppliedDependencies.length,
      checklistItems: input.suppliedChecklistItems.length,
      boundaryFindings: input.suppliedBoundaryFindings.length,
      dependencyFindings: input.suppliedDependencyFindings.length,
      smellFindings: input.suppliedSmellFindings.length,
      reviewFindings: input.suppliedReviewFindings.length,
      evidenceRefs: input.suppliedEvidenceRefs.length,
    },
    limitations: [
      "Validation uses caller-supplied metadata only.",
      "Missing metadata is treated as missing evidence.",
      "The report is advisory and does not execute follow-up work.",
    ],
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noRuntimeExecution: true,
    noScannerExecution: true,
    noRefactorExecution: true,
  };
};

export const summarizeSolidValidatorFindings = (
  findings: readonly SolidValidatorFinding[],
): SolidValidatorFindingSummary => {
  const severityCounts = countSolidValidatorSeverities(findings);
  const highestSeverity = highestSeverityOf(findings.map((finding) => finding.severity));
  const approvalRequired = findings.some((finding) => finding.approvalRequired);
  const riskLevel = riskFromSeverity(highestSeverity);

  return {
    summaryId: "solid_validator_summary:116I",
    schemaVersion: "1.0",
    findingCount: findings.length,
    severityCounts,
    highestSeverity,
    safeSummary: `SOLID validator summary contains ${findings.length} finding(s); highest severity is ${highestSeverity}.`,
    approvalRequired,
    riskLevel,
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noRuntimeExecution: true,
    noScannerExecution: true,
    noRefactorExecution: true,
  };
};

const deriveStatus = (
  inputSummary: SolidValidatorInputValidationSummary,
  findingSummary: SolidValidatorFindingSummary,
): SolidValidatorStatus => {
  if (inputSummary.status === "blocked") return "blocked";
  if (inputSummary.status === "insufficient_evidence") return "insufficient_evidence";
  if (findingSummary.severityCounts.critical > 0) return "blocked";
  if (findingSummary.severityCounts.high > 0) return "failed";
  if (findingSummary.severityCounts.medium > 0 || findingSummary.severityCounts.low > 0) return "warning";
  if (inputSummary.status === "needs_review") return "needs_review";
  return "passed";
};

const buildRecommendedNextAction = (
  status: SolidValidatorStatus,
  riskLevel: PMRiskTier,
): SolidValidatorRecommendedNextAction => {
  if (status === "blocked") {
    return {
      actionId: "solid_validator_next_action:block",
      label: "Request architecture review",
      safeSummary: "Stop progression and request human architecture review for blocking metadata.",
      nextPhase: "Phase 116I",
      riskLevel,
      requiresHumanApproval: true,
      metadataOnly: true,
      advisoryOnly: true,
      noExecution: true,
    };
  }
  if (status === "insufficient_evidence" || status === "needs_review") {
    return {
      actionId: "solid_validator_next_action:collect_evidence",
      label: "Collect supplied evidence",
      safeSummary: "Provide more review metadata before relying on the validator report.",
      nextPhase: "Phase 116I",
      riskLevel,
      requiresHumanApproval: true,
      metadataOnly: true,
      advisoryOnly: true,
      noExecution: true,
    };
  }

  return {
    actionId: "solid_validator_next_action:continue",
    label: "Continue architecture roadmap",
    safeSummary: "Use the report as advisory context for the next planning phase.",
    nextPhase: "Phase 117B",
    riskLevel,
    requiresHumanApproval: status !== "passed",
    metadataOnly: true,
    advisoryOnly: true,
    noExecution: true,
  };
};

export const buildSolidValidatorReport = (
  input: SolidValidatorInput,
  registry: SolidRuleRegistry = buildDefaultSolidRuleRegistry(),
  config: SolidValidatorConfig = registry.defaultConfig,
): SolidValidatorReport => {
  const enabledRules = chooseEnabledRules(registry, config);
  const inputSummary = validateSolidInputMetadata(input, registry, config);
  const findings = [
    ...findingsFromRules(input, enabledRules, config),
    ...findingsFromBoundary(input.suppliedBoundaryFindings),
    ...findingsFromDependency(input.suppliedDependencyFindings),
    ...findingsFromSmell(input.suppliedSmellFindings),
    ...findingsFromReview(input.suppliedReviewFindings),
  ];
  const summary = summarizeSolidValidatorFindings(findings);
  const status = deriveStatus(inputSummary, summary);
  const riskLevel =
    status === "blocked" && summary.riskLevel !== "critical" ? "critical" : summary.riskLevel;

  return {
    reportId: `solid_validator_report:${input.validationId}`,
    validationId: input.validationId,
    schemaVersion: "1.0",
    status,
    findings,
    summary,
    severityCounts: summary.severityCounts,
    riskLevel,
    approvalRequired:
      summary.approvalRequired ||
      status === "blocked" ||
      status === "needs_review" ||
      status === "insufficient_evidence",
    pmEscalation:
      status === "blocked"
        ? "blocker_metadata"
        : summary.approvalRequired
          ? "risk_metadata"
          : "pm_status_report",
    autopilotUse: status === "passed" ? "closeout_context_only" : "validation_context_only",
    evidenceRefs: [...input.suppliedEvidenceRefs],
    limitations: inputSummary.limitations,
    recommendedNextAction: buildRecommendedNextAction(status, riskLevel),
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    callerSuppliedOnly: true,
    noRuntimeExecution: true,
    noScannerExecution: true,
    noRefactorExecution: true,
    boundaries: solidArchitectureBoundaries,
  };
};
