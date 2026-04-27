import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { join, relative } from "path";
import { pathToFileURL } from "url";
import type tsModule from "typescript";
import { runEvalSuite } from "../evals/evalRunner.js";
import type { EvalRegressionReport } from "../evals/types.js";
import { riskInputFromEvalReport } from "../risk/evalRiskAdapter.js";
import { assessRisk } from "../risk/riskAssessment.js";
import type { RiskApprovalSignal, RiskDecision } from "../risk/types.js";
import { buildQualityDashboardData } from "./qualityReport.js";
import {
  buildQualitySnapshot,
  compareQualitySnapshots,
  type QualitySnapshot,
  type QualitySnapshotComparison,
} from "./snapshot.js";
import type { QualityDashboardData, QualityDashboardSourceSummary } from "./types.js";

export const LOCAL_QUALITY_GATE_SCHEMA_VERSION = "1.0";

export type LocalQualityGateFinalStatus = "pass" | "warn" | "fail";

export interface LocalQualityGateOptions {
  baselinePath?: string;
  failOnReview?: boolean;
  failOnRegression?: boolean;
  phase?: string;
  commit?: string;
}

export interface LocalQualityGateCommandResult {
  name: string;
  ok: boolean;
  status: "pass" | "warn" | "fail";
  reasonCodes: string[];
}

export interface LocalQualityGateTypecheckResult {
  ok: boolean;
  diagnosticCount: number;
  diagnostics: string[];
  commandEquivalent: "node node_modules/typescript/bin/tsc --noEmit";
}

export interface LocalQualityGateEvalSummary {
  ok: boolean;
  status: "pass" | "warn" | "fail";
  failed: number;
  warned: number;
  passed: number;
  total: number;
  reportId: string;
  createdAt: string;
  failingIds: string[];
  warningIds: string[];
}

export interface LocalQualityGateOutputs {
  evalReportId: string;
  riskSignalId: string;
  qualityDashboardId: string;
  qualitySnapshotId: string;
  qualitySnapshotFingerprint: string;
  baselineLoaded: boolean;
  advisoryRegression: boolean;
}

export interface LocalQualityGateBoundaries {
  advisoryOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noRuntimeGateWiring: true;
  noApprovalExecution: true;
  noProposalCreation: true;
  noDispatch: true;
  noStoreMutation: true;
  noDashboardUi: true;
  noServer: true;
  noCi: true;
}

export interface LocalQualityGateResult {
  gateId: string;
  createdAt: string;
  schemaVersion: typeof LOCAL_QUALITY_GATE_SCHEMA_VERSION;
  project: QualityDashboardData["project"];
  commandResults: LocalQualityGateCommandResult[];
  typecheck: LocalQualityGateTypecheckResult;
  evalGate: LocalQualityGateEvalSummary;
  riskSignal: RiskApprovalSignal;
  qualityReport: QualityDashboardData;
  qualitySnapshotComparison: QualitySnapshotComparison;
  finalStatus: LocalQualityGateFinalStatus;
  blockingReasons: string[];
  advisoryWarnings: string[];
  outputs: LocalQualityGateOutputs;
  advisoryOnly: true;
  boundaries: LocalQualityGateBoundaries;
}

type TypeScriptApi = typeof tsModule;

function hashId(prefix: string, value: string): string {
  return `${prefix}_${createHash("sha256").update(value).digest("hex").slice(0, 16)}`;
}

function sorted(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))].sort();
}

function safeRelativePath(path: string): string {
  const relativePath = relative(process.cwd(), path);
  return relativePath.startsWith("..") ? "[outside-project]" : relativePath || ".";
}

async function loadTypeScript(): Promise<TypeScriptApi> {
  const localTypeScriptPath = join(
    process.cwd(),
    "node_modules",
    "typescript",
    "lib",
    "typescript.js",
  );
  return (await import(pathToFileURL(localTypeScriptPath).href)) as TypeScriptApi;
}

function formatDiagnostic(ts: TypeScriptApi, diagnostic: tsModule.Diagnostic): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, " ");
  const code = `TS${diagnostic.code}`;

  if (!diagnostic.file || diagnostic.start === undefined) {
    return `${code}: ${message}`.slice(0, 300);
  }

  const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  const fileName = safeRelativePath(diagnostic.file.fileName);
  return `${fileName}:${position.line + 1}:${position.character + 1} ${code}: ${message}`.slice(
    0,
    300,
  );
}

export async function runTypecheck(): Promise<LocalQualityGateTypecheckResult> {
  const ts = await loadTypeScript();
  const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, "tsconfig.json");

  if (!configPath) {
    return {
      ok: false,
      diagnosticCount: 1,
      diagnostics: ["tsconfig.not_found: tsconfig.json could not be found."],
      commandEquivalent: "node node_modules/typescript/bin/tsc --noEmit",
    };
  }

  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) {
    return {
      ok: false,
      diagnosticCount: 1,
      diagnostics: [formatDiagnostic(ts, config.error)],
      commandEquivalent: "node node_modules/typescript/bin/tsc --noEmit",
    };
  }

  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    process.cwd(),
    { noEmit: true },
    configPath,
  );

  if (parsed.errors.length > 0) {
    return {
      ok: false,
      diagnosticCount: parsed.errors.length,
      diagnostics: parsed.errors.slice(0, 20).map((diagnostic) => formatDiagnostic(ts, diagnostic)),
      commandEquivalent: "node node_modules/typescript/bin/tsc --noEmit",
    };
  }

  const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: { ...parsed.options, noEmit: true },
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);

  return {
    ok: diagnostics.length === 0,
    diagnosticCount: diagnostics.length,
    diagnostics: diagnostics.slice(0, 20).map((diagnostic) => formatDiagnostic(ts, diagnostic)),
    commandEquivalent: "node node_modules/typescript/bin/tsc --noEmit",
  };
}

function evalSummary(report: EvalRegressionReport): LocalQualityGateEvalSummary {
  return {
    ok: report.summary.failed === 0,
    status: report.summary.status,
    failed: report.summary.failed,
    warned: report.summary.warned,
    passed: report.summary.passed,
    total: report.summary.total,
    reportId: report.reportId,
    createdAt: report.createdAt,
    failingIds: report.qualityDashboard.failingIds.slice().sort(),
    warningIds: report.qualityDashboard.warningIds.slice().sort(),
  };
}

function riskNeedsReview(decision: RiskDecision): boolean {
  return (
    decision === "pause_for_review" ||
    decision === "require_explicit_approval" ||
    decision === "block_until_fixed"
  );
}

async function readBaseline(path: string | undefined): Promise<QualitySnapshot | null> {
  if (!path) return null;
  const parsed = JSON.parse(await readFile(path, "utf-8")) as unknown;
  if (
    parsed &&
    typeof parsed === "object" &&
    "snapshot" in parsed &&
    (parsed as { snapshot?: unknown }).snapshot
  ) {
    return (parsed as { snapshot: QualitySnapshot }).snapshot;
  }
  return parsed as QualitySnapshot;
}

function commandResults(input: {
  typecheck: LocalQualityGateTypecheckResult;
  evalGate: LocalQualityGateEvalSummary;
  riskSignal: RiskApprovalSignal;
  qualityReport: QualityDashboardData;
  comparison: QualitySnapshotComparison;
}): LocalQualityGateCommandResult[] {
  return [
    {
      name: "typecheck",
      ok: input.typecheck.ok,
      status: input.typecheck.ok ? "pass" : "fail",
      reasonCodes: input.typecheck.ok ? [] : ["typecheck.failed"],
    },
    {
      name: "evals",
      ok: input.evalGate.ok,
      status: input.evalGate.status,
      reasonCodes: sorted([
        ...input.evalGate.failingIds.map((id) => `eval.fail:${id}`),
        ...input.evalGate.warningIds.map((id) => `eval.warn:${id}`),
      ]),
    },
    {
      name: "risk",
      ok: !riskNeedsReview(input.riskSignal.recommendedDecision),
      status: riskNeedsReview(input.riskSignal.recommendedDecision)
        ? "warn"
        : input.riskSignal.warnings.length > 0
          ? "warn"
          : "pass",
      reasonCodes: sorted([...input.riskSignal.riskReasons, ...input.riskSignal.warnings]),
    },
    {
      name: "quality",
      ok:
        input.qualityReport.overallStatus !== "review" &&
        input.qualityReport.overallStatus !== "blocked",
      status:
        input.qualityReport.overallStatus === "pass"
          ? "pass"
          : input.qualityReport.overallStatus === "warn"
            ? "warn"
            : "warn",
      reasonCodes: sorted([...input.qualityReport.failingIds, ...input.qualityReport.warningIds]),
    },
    {
      name: "snapshot",
      ok: !input.comparison.advisoryRegression,
      status: input.comparison.advisoryRegression ? "warn" : "pass",
      reasonCodes: sorted([
        ...input.comparison.addedFailingIds.map((id) => `snapshot.added_fail:${id}`),
        ...input.comparison.addedWarningIds.map((id) => `snapshot.added_warn:${id}`),
        ...(input.comparison.schemaWarnings.length > 0 ? ["snapshot.schema_warning"] : []),
      ]),
    },
  ];
}

function finalPolicy(input: {
  typecheck: LocalQualityGateTypecheckResult;
  evalGate: LocalQualityGateEvalSummary;
  riskSignal: RiskApprovalSignal;
  qualityReport: QualityDashboardData;
  comparison: QualitySnapshotComparison;
  failOnReview: boolean;
  failOnRegression: boolean;
}): {
  finalStatus: LocalQualityGateFinalStatus;
  blockingReasons: string[];
  advisoryWarnings: string[];
} {
  const blockingReasons: string[] = [];
  const advisoryWarnings: string[] = [];

  if (!input.typecheck.ok) {
    blockingReasons.push("typecheck.failed");
  }
  if (!input.evalGate.ok) {
    blockingReasons.push("eval.failed");
  }

  if (riskNeedsReview(input.riskSignal.recommendedDecision)) {
    const reason = `risk.${input.riskSignal.recommendedDecision}`;
    if (input.failOnReview) blockingReasons.push(reason);
    else advisoryWarnings.push(reason);
  }

  if (
    input.qualityReport.overallStatus === "review" ||
    input.qualityReport.overallStatus === "blocked"
  ) {
    const reason = `quality.${input.qualityReport.overallStatus}`;
    if (input.failOnReview) blockingReasons.push(reason);
    else advisoryWarnings.push(reason);
  }

  if (input.comparison.advisoryRegression) {
    const reason = "snapshot.advisory_regression";
    if (input.failOnRegression) blockingReasons.push(reason);
    else advisoryWarnings.push(reason);
  }

  if (input.evalGate.warningIds.length > 0) {
    advisoryWarnings.push("eval.warnings_present");
  }
  if (input.riskSignal.warnings.length > 0) {
    advisoryWarnings.push("risk.warnings_present");
  }
  if (input.comparison.schemaWarnings.length > 0) {
    advisoryWarnings.push("snapshot.schema_warning");
  }

  return {
    finalStatus:
      blockingReasons.length > 0 ? "fail" : advisoryWarnings.length > 0 ? "warn" : "pass",
    blockingReasons: sorted(blockingReasons),
    advisoryWarnings: sorted(advisoryWarnings),
  };
}

export async function runLocalQualityGate(
  options: LocalQualityGateOptions = {},
): Promise<LocalQualityGateResult> {
  const createdAt = new Date().toISOString();
  const typecheck = await runTypecheck();
  const evalReport = await runEvalSuite();
  const evalGate = evalSummary(evalReport);
  const riskSignal = assessRisk(riskInputFromEvalReport(evalReport));
  const sources: QualityDashboardSourceSummary[] = [
    {
      type: "eval-report",
      id: evalReport.reportId,
      generated: true,
      createdAt: evalReport.createdAt,
      suiteVersion: evalReport.suiteVersion,
    },
    {
      type: "risk-signal",
      id: riskSignal.signalId,
      generated: true,
      createdAt: riskSignal.createdAt,
      schemaVersion: riskSignal.schemaVersion,
    },
  ];
  const qualityReport = buildQualityDashboardData({
    evalReport,
    riskSignal,
    sources,
  });
  const currentSnapshot = buildQualitySnapshot({
    dashboard: qualityReport,
    ...(options.phase ? { phase: options.phase } : {}),
    ...(options.commit ? { commit: options.commit } : {}),
  });
  const baseline = await readBaseline(options.baselinePath);
  const comparison = compareQualitySnapshots({
    current: currentSnapshot,
    baseline,
  });
  const policy = finalPolicy({
    typecheck,
    evalGate,
    riskSignal,
    qualityReport,
    comparison,
    failOnReview: options.failOnReview === true,
    failOnRegression: options.failOnRegression === true,
  });
  const results = commandResults({
    typecheck,
    evalGate,
    riskSignal,
    qualityReport,
    comparison,
  });

  return {
    gateId: hashId(
      "qgate",
      `${createdAt}:${evalReport.reportId}:${riskSignal.signalId}:${currentSnapshot.snapshotId}`,
    ),
    createdAt,
    schemaVersion: LOCAL_QUALITY_GATE_SCHEMA_VERSION,
    project: qualityReport.project,
    commandResults: results,
    typecheck,
    evalGate,
    riskSignal,
    qualityReport,
    qualitySnapshotComparison: comparison,
    finalStatus: policy.finalStatus,
    blockingReasons: policy.blockingReasons,
    advisoryWarnings: policy.advisoryWarnings,
    outputs: {
      evalReportId: evalReport.reportId,
      riskSignalId: riskSignal.signalId,
      qualityDashboardId: qualityReport.dashboardId,
      qualitySnapshotId: currentSnapshot.snapshotId,
      qualitySnapshotFingerprint: currentSnapshot.fingerprint,
      baselineLoaded: comparison.baselineLoaded,
      advisoryRegression: comparison.advisoryRegression,
    },
    advisoryOnly: true,
    boundaries: {
      advisoryOnly: true,
      noProviderCalls: true,
      noNetwork: true,
      noRuntimeGateWiring: true,
      noApprovalExecution: true,
      noProposalCreation: true,
      noDispatch: true,
      noStoreMutation: true,
      noDashboardUi: true,
      noServer: true,
      noCi: true,
    },
  };
}
