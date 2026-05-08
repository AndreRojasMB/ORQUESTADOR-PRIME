import type { CodexReportContract } from "./reportContract.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type { AutopilotReportValidationResult } from "./reportValidator.js";
import type {
  AutopilotBoundarySet,
  AutopilotFinding,
  AutopilotRiskLevel,
} from "./types.js";

export type AutopilotMemoryProposalStatus =
  | "proposed"
  | "approved"
  | "rejected"
  | "deferred";

export interface AutopilotMemoryEvidenceRef {
  evidenceId: string;
  source: string;
  metadataOnly: true;
  noFileRead: true;
}

export interface AutopilotMemoryUpdateProposalFromReport {
  proposalId: string;
  sourceReportRef: string;
  sourcePhase: string;
  summary: string;
  errorFixLearned: string[];
  decisionMade: string;
  futureRuleRecommendation: string[];
  riskLevel: AutopilotRiskLevel;
  evidenceRefs: AutopilotMemoryEvidenceRef[];
  unresolvedIssues: string[];
  nextPhase: string;
  requiresHumanApproval: true;
  status: AutopilotMemoryProposalStatus;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noMemoryPersistence: true;
  noStoreMutation: true;
  boundaries: AutopilotBoundarySet;
}

const findingMessages = (findings: readonly AutopilotFinding[]): string[] =>
  findings.map((finding) => `${finding.reasonCode}: ${finding.safeMessage}`);

export function createMemoryUpdateProposalFromReport(input: {
  report: CodexReportContract;
  validation: AutopilotReportValidationResult;
  riskLevel?: AutopilotRiskLevel;
  evidenceRefs?: AutopilotMemoryEvidenceRef[];
}): AutopilotMemoryUpdateProposalFromReport {
  const unresolvedIssues =
    input.validation.status === "passed"
      ? []
      : findingMessages(input.validation.findings);
  const errorFixLearned =
    input.validation.findings.length > 0
      ? findingMessages(input.validation.findings)
      : ["No validation findings were reported for this phase."];
  const futureRuleRecommendation =
    input.validation.status === "passed"
      ? [
          "Continue using report validation before memory proposal and next-action recommendation.",
        ]
      : [
          "Require human review before continuing when validation findings remain unresolved.",
        ];

  return {
    proposalId: `${input.report.phase}:memory_proposal`,
    sourceReportRef: input.report.reportId,
    sourcePhase: input.report.phase,
    summary: input.report.summary,
    errorFixLearned,
    decisionMade:
      input.validation.status === "passed"
        ? "Validation metadata supports continuing to the next advisory phase."
        : "Validation metadata requires review before continuing.",
    futureRuleRecommendation,
    riskLevel: input.riskLevel ?? "report_only",
    evidenceRefs: input.evidenceRefs ? [...input.evidenceRefs] : [],
    unresolvedIssues,
    nextPhase: input.report.nextRecommendedPhase,
    requiresHumanApproval: true,
    status: "proposed",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noMemoryPersistence: true,
    noStoreMutation: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
