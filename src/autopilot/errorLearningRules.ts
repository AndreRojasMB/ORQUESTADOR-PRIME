import type { CodexReportContract } from "./reportContract.js";
import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type { AutopilotReportValidationResult } from "./reportValidator.js";
import type { AutopilotBoundarySet, AutopilotRiskLevel } from "./types.js";

export type AutopilotErrorLearningRuleCategory =
  | "verification_fallback"
  | "scope_guardrail"
  | "feature_flag_guardrail"
  | "provider_boundary"
  | "execution_boundary"
  | "memory_boundary"
  | "handoff_boundary";

export interface AutopilotErrorLearningRule {
  ruleId: string;
  category: AutopilotErrorLearningRuleCategory;
  trigger: string;
  recommendation: string;
  riskLevel: AutopilotRiskLevel;
  requiresHumanApproval: true;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noMemoryPersistence: true;
}

export interface AutopilotErrorLearningRulesResult {
  resultId: string;
  phase: string;
  rules: AutopilotErrorLearningRule[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  noMemoryPersistence: true;
  boundaries: AutopilotBoundarySet;
}

const includesAny = (value: string, markers: readonly string[]): boolean => {
  const lower = value.toLowerCase();
  return markers.some((marker) => lower.includes(marker));
};

const makeRule = (
  phase: string,
  category: AutopilotErrorLearningRuleCategory,
  trigger: string,
  recommendation: string,
  riskLevel: AutopilotRiskLevel = "report_only",
): AutopilotErrorLearningRule => ({
  ruleId: `${phase}:${category}:${trigger.replaceAll(" ", "_")}`,
  category,
  trigger,
  recommendation,
  riskLevel,
  requiresHumanApproval: true,
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noExecution: true,
  noMemoryPersistence: true,
});

export function deriveErrorLearningRules(input: {
  report: CodexReportContract;
  validation: AutopilotReportValidationResult;
}): AutopilotErrorLearningRulesResult {
  const combinedCommandText = input.report.commandsExecuted
    .map((command) => `${command.command} ${command.safeSummary}`)
    .join("\n");
  const rules: AutopilotErrorLearningRule[] = [];

  if (includesAny(combinedCommandText, ["node: not found", "wsl node"])) {
    rules.push(
      makeRule(
        input.report.phase,
        "verification_fallback",
        "WSL Node unavailable",
        "Report WSL Node failure honestly and use the established Windows Node fallback only when it passes.",
      ),
    );
  }

  if (includesAny(combinedCommandText, ["windows node fallback", "wsl$"])) {
    rules.push(
      makeRule(
        input.report.phase,
        "verification_fallback",
        "Windows Node fallback used",
        "Record fallback verification separately from WSL verification; do not claim the original command passed.",
      ),
    );
  }

  if (
    input.validation.scopeViolations.length > 0 ||
    input.validation.dirtyFilesWarnings.length > 0
  ) {
    rules.push(
      makeRule(
        input.report.phase,
        "scope_guardrail",
        "dirty files outside scope",
        "Keep unrelated dirty files unstaged and list them as pre-existing scope context.",
        "plan_only",
      ),
    );
  }

  if (includesAny(input.report.summary, ["feature flag", "default-off"])) {
    rules.push(
      makeRule(
        input.report.phase,
        "feature_flag_guardrail",
        "feature flag default off",
        "New integration behavior should remain disabled by default unless a later approved phase changes that boundary.",
      ),
    );
  }

  if (includesAny(input.report.summary, ["provider send", "provider call"])) {
    rules.push(
      makeRule(
        input.report.phase,
        "provider_boundary",
        "provider send boundary",
        "Provider sends stay prohibited unless a separate human-approved execution phase changes the scope.",
        "critical_plan_only",
      ),
    );
  }

  if (includesAny(input.report.summary, ["openclaw", "process launch"])) {
    rules.push(
      makeRule(
        input.report.phase,
        "execution_boundary",
        "external execution boundary",
        "Source-only modules must not launch processes or invoke external execution systems.",
        "critical_plan_only",
      ),
    );
  }

  if (includesAny(input.report.summary, ["memory proposal", "memory update"])) {
    rules.push(
      makeRule(
        input.report.phase,
        "memory_boundary",
        "memory proposal only",
        "Memory updates remain proposal metadata until a human-approved persistence phase exists.",
      ),
    );
  }

  if (includesAny(input.report.summary, ["handoff runner"])) {
    rules.push(
      makeRule(
        input.report.phase,
        "handoff_boundary",
        "handoff runner metadata only",
        "The handoff runner remains limited to prompt, report schema, checklist, and package metadata.",
      ),
    );
  }

  return {
    resultId: `${input.report.phase}:error_learning_rules`,
    phase: input.report.phase,
    rules,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noExecution: true,
    noMemoryPersistence: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
