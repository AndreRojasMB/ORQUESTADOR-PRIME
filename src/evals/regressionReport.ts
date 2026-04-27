import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { redactStructuredValue, type RedactionMetadata } from "../privacy/redactionEngine.js";
import type {
  BudgetResult,
  CompressionPolicyResult,
  EvalBaselineSummary,
  EvalChangedResults,
  EvalCheckResult,
  EvalPrivacySummary,
  EvalRegressionReport,
  EvalStatus,
  EvalSuiteSummary,
  PromptShapeResult,
  RouterTestResult,
} from "./types.js";
import { EVAL_SUITE_VERSION } from "./types.js";
import type { ProjectIdentity } from "../supervisor/types.js";

function reportId(createdAt: string, ids: string[]): string {
  return `eval_${createHash("sha256").update(`${createdAt}:${ids.join("|")}`).digest("hex").slice(0, 16)}`;
}

function allResults(input: {
  goldenTaskResults: EvalCheckResult[];
  routerResults: RouterTestResult[];
  promptShapeResults: PromptShapeResult[];
  budgetResults: BudgetResult[];
  compressionPolicyResults: CompressionPolicyResult[];
}): EvalCheckResult[] {
  return [
    ...input.goldenTaskResults,
    ...input.routerResults,
    ...input.promptShapeResults,
    ...input.budgetResults,
    ...input.compressionPolicyResults,
  ];
}

export function summarizeResults(results: EvalCheckResult[]): EvalSuiteSummary {
  const failed = results.filter((item) => item.status === "fail").length;
  const warned = results.filter((item) => item.status === "warn").length;
  const passed = results.filter((item) => item.status === "pass").length;
  return {
    total: results.length,
    passed,
    warned,
    failed,
    status: failed > 0 ? "fail" : warned > 0 ? "warn" : "pass",
  };
}

function warningOrFailIds(results: EvalCheckResult[]): string[] {
  return results
    .filter((item) => item.status === "fail" || item.status === "warn")
    .map((item) => item.id)
    .sort();
}

function statusMap(results: EvalCheckResult[]): Map<string, EvalStatus> {
  return new Map(results.map((item) => [item.id, item.status]));
}

function changedResults(
  current: EvalCheckResult[],
  baselineReport: EvalRegressionReport | null,
): EvalChangedResults {
  if (!baselineReport) {
    return {
      addedFailingOrWarningIds: [],
      removedFailingOrWarningIds: [],
      changedStatusIds: [],
    };
  }

  const baselineResults = allResults(baselineReport);
  const currentProblemIds = new Set(warningOrFailIds(current));
  const baselineProblemIds = new Set(warningOrFailIds(baselineResults));
  const currentStatuses = statusMap(current);
  const baselineStatuses = statusMap(baselineResults);
  const allIds = new Set([...currentStatuses.keys(), ...baselineStatuses.keys()]);

  return {
    addedFailingOrWarningIds: [...currentProblemIds].filter((id) => !baselineProblemIds.has(id)).sort(),
    removedFailingOrWarningIds: [...baselineProblemIds].filter((id) => !currentProblemIds.has(id)).sort(),
    changedStatusIds: [...allIds]
      .filter((id) => currentStatuses.get(id) !== baselineStatuses.get(id))
      .sort(),
  };
}

async function loadBaseline(path: string | undefined): Promise<{
  summary: EvalBaselineSummary | null;
  report: EvalRegressionReport | null;
}> {
  if (!path) return { summary: null, report: null };

  try {
    const parsed = JSON.parse(await readFile(path, "utf-8")) as EvalRegressionReport;
    return {
      report: parsed,
      summary: {
        path,
        loaded: true,
        reportId: parsed.reportId ?? null,
        createdAt: parsed.createdAt ?? null,
        summary: parsed.summary ?? null,
        warning: null,
      },
    };
  } catch (err) {
    return {
      report: null,
      summary: {
        path,
        loaded: false,
        reportId: null,
        createdAt: null,
        summary: null,
        warning: `Baseline could not be read: ${err instanceof Error ? err.message : String(err)}`,
      },
    };
  }
}

function mergeMetadata(items: RedactionMetadata[]): RedactionMetadata {
  return {
    removedKinds: [...new Set(items.flatMap((item) => item.removedKinds))].sort(),
    containsSecrets: items.some((item) => item.containsSecrets),
    containsRawIdentity: items.some((item) => item.containsRawIdentity),
    containsRawBody: items.some((item) => item.containsRawBody),
    containsFileContent: items.some((item) => item.containsFileContent),
    truncated: items.some((item) => item.truncated),
    redactionVersion: items[0]?.redactionVersion ?? "1.0",
  };
}

function buildPrivacySummary(results: EvalCheckResult[]): EvalPrivacySummary {
  const redacted = redactStructuredValue(results, { maxLength: 1_000 });
  return {
    redaction: mergeMetadata([redacted.metadata]),
    containsUnsafeOutput:
      redacted.metadata.containsSecrets ||
      redacted.metadata.containsRawIdentity ||
      redacted.metadata.containsRawBody ||
      redacted.metadata.containsFileContent,
    checkedPatterns: ["phone", "email", "token", "body-like-fields"],
  };
}

export async function buildRegressionReport(input: {
  project: ProjectIdentity;
  goldenTaskResults: EvalCheckResult[];
  routerResults: RouterTestResult[];
  promptShapeResults: PromptShapeResult[];
  budgetResults: BudgetResult[];
  compressionPolicyResults: CompressionPolicyResult[];
  baselinePath?: string;
}): Promise<EvalRegressionReport> {
  const createdAt = new Date().toISOString();
  const results = allResults(input);
  const baseline = await loadBaseline(input.baselinePath);
  const summary = summarizeResults(results);
  const ids = results.map((item) => `${item.id}:${item.status}`);
  const failingIds = results.filter((item) => item.status === "fail").map((item) => item.id).sort();
  const warningIds = results.filter((item) => item.status === "warn").map((item) => item.id).sort();
  const budgetBlocks = input.budgetResults.filter((item) => item.status === "fail").length;

  return {
    reportId: reportId(createdAt, ids),
    createdAt,
    suiteVersion: EVAL_SUITE_VERSION,
    project: {
      projectId: input.project.projectId,
      projectName: input.project.projectName,
      projectRootHash: input.project.projectRootHash,
    },
    summary,
    goldenTaskResults: input.goldenTaskResults,
    routerResults: input.routerResults,
    promptShapeResults: input.promptShapeResults,
    budgetResults: input.budgetResults,
    compressionPolicyResults: input.compressionPolicyResults,
    changedResults: changedResults(results, baseline.report),
    baseline: baseline.summary,
    warnings: [
      ...(baseline.summary?.warning ? [baseline.summary.warning] : []),
      "Evaluation is offline and advisory; it does not represent model quality.",
    ],
    privacy: buildPrivacySummary(results),
    qualityDashboard: {
      latestStatus: summary.status,
      failingIds,
      warningIds,
      routerFailures: input.routerResults.filter((item) => item.status === "fail").length,
      promptShapeFailures: input.promptShapeResults.filter((item) => item.status === "fail").length,
      budgetBlocks,
      compressionWarnings: input.compressionPolicyResults.filter((item) => item.status === "warn").length,
    },
  };
}
