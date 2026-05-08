import type {
  ArchitectureSmellFinding,
} from "../smellTaxonomy.js";
import type {
  BackendLayeringFinding,
} from "../backendRules.js";
import type {
  DependencyInversionFinding,
} from "../dependencyRules.js";
import type {
  FrontendResponsibilityFinding,
} from "../frontendRules.js";
import type {
  ModuleBoundaryFinding,
} from "../moduleBoundaries.js";
import type {
  ReviewFinding,
} from "../reviewFindingTypes.js";
import type {
  SolidArchitectureFinding,
  SolidArchitectureLayer,
} from "../solidTypes.js";
import type {
  SolidValidatorFindingSummary,
  SolidValidatorReport,
  SolidValidatorSeverityCounts,
} from "../solidValidator.js";
import {
  createReportEnvelope,
  type ReportEnvelope,
  type ReportEnvelopeFinding,
  type ReportEnvelopeInput,
} from "../../pm/cli/report.js";
import type {
  PMEvidenceReference,
} from "../../pm/types.js";

export interface ArchitectureReportEnvelope extends ReportEnvelope {
  architectureReportRef: string;
  architectureLayer: SolidArchitectureLayer;
  solidFindings: SolidArchitectureFinding[];
  boundaryFindings: ModuleBoundaryFinding[];
  dependencyFindings: DependencyInversionFinding[];
  smellFindings: ArchitectureSmellFinding[];
  reviewFindings: ReviewFinding[];
  validatorSummary?: SolidValidatorFindingSummary;
  validatorReport?: SolidValidatorReport;
  frontendFindings: FrontendResponsibilityFinding[];
  backendFindings: BackendLayeringFinding[];
  severityCounts: SolidValidatorSeverityCounts;
  limitations: string[];
  evidenceRefs: PMEvidenceReference[];
}

export interface ArchitectureReportEnvelopeInput extends Omit<ReportEnvelopeInput, "source"> {
  architectureReportRef: string;
  architectureLayer: SolidArchitectureLayer;
  solidFindings?: SolidArchitectureFinding[];
  boundaryFindings?: ModuleBoundaryFinding[];
  dependencyFindings?: DependencyInversionFinding[];
  smellFindings?: ArchitectureSmellFinding[];
  reviewFindings?: ReviewFinding[];
  validatorSummary?: SolidValidatorFindingSummary;
  validatorReport?: SolidValidatorReport;
  frontendFindings?: FrontendResponsibilityFinding[];
  backendFindings?: BackendLayeringFinding[];
  severityCounts?: SolidValidatorSeverityCounts;
}

const emptyValidatorSeverityCounts = (): SolidValidatorSeverityCounts => ({
  info: 0,
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
});

const mergeSeverityCounts = (
  base: SolidValidatorSeverityCounts,
  extra: SolidValidatorSeverityCounts,
): SolidValidatorSeverityCounts => ({
  info: base.info + extra.info,
  low: base.low + extra.low,
  medium: base.medium + extra.medium,
  high: base.high + extra.high,
  critical: base.critical + extra.critical,
});

const severityCountsFromEnvelopeFindings = (
  findings: readonly ReportEnvelopeFinding[],
): SolidValidatorSeverityCounts => {
  const counts = emptyValidatorSeverityCounts();
  findings.forEach((finding) => {
    counts[finding.severity] += 1;
  });
  return counts;
};

export const createArchitectureReportEnvelope = (
  input: ArchitectureReportEnvelopeInput,
): ArchitectureReportEnvelope => {
  const base = createReportEnvelope({
    ...input,
    source: "architecture",
  });
  const validatorCounts = input.validatorSummary?.severityCounts ?? emptyValidatorSeverityCounts();
  const suppliedCounts = input.severityCounts ?? emptyValidatorSeverityCounts();
  const envelopeFindingCounts = severityCountsFromEnvelopeFindings(base.findings);

  return {
    ...base,
    architectureReportRef: input.architectureReportRef,
    architectureLayer: input.architectureLayer,
    solidFindings: input.solidFindings ?? [],
    boundaryFindings: input.boundaryFindings ?? [],
    dependencyFindings: input.dependencyFindings ?? [],
    smellFindings: input.smellFindings ?? [],
    reviewFindings: input.reviewFindings ?? [],
    ...(input.validatorSummary ? { validatorSummary: input.validatorSummary } : {}),
    ...(input.validatorReport ? { validatorReport: input.validatorReport } : {}),
    frontendFindings: input.frontendFindings ?? [],
    backendFindings: input.backendFindings ?? [],
    severityCounts: mergeSeverityCounts(mergeSeverityCounts(suppliedCounts, validatorCounts), envelopeFindingCounts),
    limitations: input.limitations ?? [],
    evidenceRefs: input.evidenceRefs ?? [],
  };
};
