import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type { CodexHandoffContract } from "./codexHandoff.js";
import type { AutopilotBoundarySet } from "./types.js";

export interface ExpectedCodexReportField {
  fieldName: string;
  required: boolean;
  safeSummary: string;
  metadataOnly: true;
}

export interface ExpectedCodexReportSchema {
  schemaId: string;
  phase: string;
  fields: ExpectedCodexReportField[];
  requiredSections: string[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noReportExecution: true;
  boundaries: AutopilotBoundarySet;
}

const field = (
  fieldName: string,
  required: boolean,
  safeSummary: string,
): ExpectedCodexReportField => ({
  fieldName,
  required,
  safeSummary,
  metadataOnly: true,
});

export function renderExpectedCodexReportSchema(
  handoff: CodexHandoffContract,
): ExpectedCodexReportSchema {
  const includeCommitFields = handoff.finalReportFormat.includeCommitHash;
  const includePushFields = handoff.finalReportFormat.includePushStatus;

  return {
    schemaId: `${handoff.handoffId}:expected_report_schema`,
    phase: handoff.phase,
    fields: [
      field("phase", true, "Phase name reported by Codex."),
      field("filesInspected", true, "Files or surfaces inspected during the task."),
      field("filesModified", true, "Files modified during the task, or none."),
      field("summary", true, "Plan or implementation summary."),
      field("commandsExecuted", true, "Commands run and their results."),
      field("tests", true, "Tests or smoke checks run, or explicit not-run reason."),
      field("scopeCheck", true, "Changed and staged file scope result."),
      field("forbiddenGrepResult", true, "Forbidden grep result and allowed matches."),
      field("commitHash", includeCommitFields, "Commit hash when commit is required and completed."),
      field("pushStatus", includePushFields, "Push status when push is required and completed."),
      field("nextRecommendedPhase", true, "Next safe phase recommendation."),
    ],
    requiredSections: [...handoff.finalReportFormat.requiredSections],
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noReportExecution: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
