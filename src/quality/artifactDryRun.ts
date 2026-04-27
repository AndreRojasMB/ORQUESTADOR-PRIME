import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { basename, dirname, resolve } from "path";
import { runEvalSuite } from "../evals/evalRunner.js";
import { riskInputFromEvalReport } from "../risk/evalRiskAdapter.js";
import { assessRisk } from "../risk/riskAssessment.js";
import type { RiskApprovalSignal } from "../risk/types.js";
import { buildQualityDashboardData } from "./qualityReport.js";
import { buildQualitySnapshot, compareQualitySnapshots } from "./snapshot.js";
import type { QualityDashboardData, QualityDashboardSourceSummary } from "./types.js";

export const QUALITY_ARTIFACT_DRY_RUN_SCHEMA_VERSION = "1.0";

export const QUALITY_REPORT_ARTIFACT = "quality-report.json";
export const QUALITY_SNAPSHOT_ARTIFACT = "quality-snapshot.json";
export const QUALITY_MANIFEST_ARTIFACT = "manifest.json";

export type ArtifactDryRunStatus = "pass" | "fail";

export interface QualityArtifactDryRunOptions {
  outDir?: string;
  pretty?: boolean;
}

export interface ArtifactJsonValidationResult {
  fileName: string;
  jsonValid: boolean;
  reasonCode: string | null;
}

export interface ArtifactScanFinding {
  fileName: string;
  kind: string;
  reasonCode: string;
}

export interface ArtifactScanResult {
  status: ArtifactDryRunStatus;
  checkedFiles: string[];
  failedFiles: string[];
  findings: ArtifactScanFinding[];
}

export interface ArtifactManifestFile {
  fileName: string;
  sha256: string;
  byteSize: number;
  jsonValid: boolean;
}

export interface QualityArtifactDryRunBoundaries {
  advisoryOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noRuntimeGateWiring: true;
  noApprovalExecution: true;
  noProposalCreation: true;
  noDispatch: true;
  noStoreMutation: true;
  noDashboardUi: true;
  noUpload: true;
  noBaselines: true;
}

export interface QualityArtifactDryRunManifest {
  manifestId: string;
  createdAt: string;
  schemaVersion: typeof QUALITY_ARTIFACT_DRY_RUN_SCHEMA_VERSION;
  files: ArtifactManifestFile[];
  scan: ArtifactScanResult;
  generatedFiles: string[];
  advisoryOnly: true;
  boundaries: QualityArtifactDryRunBoundaries;
}

export interface QualityArtifactDryRunResult {
  status: ArtifactDryRunStatus;
  createdAt: string;
  schemaVersion: typeof QUALITY_ARTIFACT_DRY_RUN_SCHEMA_VERSION;
  outputDirectoryName: string;
  generatedFiles: string[];
  files: ArtifactManifestFile[];
  validations: ArtifactJsonValidationResult[];
  scan: ArtifactScanResult;
  manifest: QualityArtifactDryRunManifest | null;
  manifestWritten: boolean;
  failureReasons: string[];
  advisoryOnly: true;
  boundaries: QualityArtifactDryRunBoundaries;
}

interface GeneratedArtifact {
  fileName: string;
  text: string;
}

const GENERATED_FILES = [
  QUALITY_REPORT_ARTIFACT,
  QUALITY_SNAPSHOT_ARTIFACT,
  QUALITY_MANIFEST_ARTIFACT,
] as const;

const BOUNDARIES: QualityArtifactDryRunBoundaries = {
  advisoryOnly: true,
  noProviderCalls: true,
  noNetwork: true,
  noRuntimeGateWiring: true,
  noApprovalExecution: true,
  noProposalCreation: true,
  noDispatch: true,
  noStoreMutation: true,
  noDashboardUi: true,
  noUpload: true,
  noBaselines: true,
};

const SCAN_RULES: Array<{
  kind: string;
  reasonCode: string;
  pattern: RegExp;
}> = [
  {
    kind: "authorization-header",
    reasonCode: "artifact.secret.authorization_header",
    pattern: /\bbearer\s+[A-Za-z0-9._~+/=-]{8,}/i,
  },
  {
    kind: "api-key",
    reasonCode: "artifact.secret.api_key",
    pattern: /\b(api[_-]?key|provider[_-]?key)\b\s*[:=]\s*["']?[^"',}\s]{6,}/i,
  },
  {
    kind: "token",
    reasonCode: "artifact.secret.token",
    pattern: /\b(access[_-]?token|refresh[_-]?token|token|secret)\b\s*[:=]\s*["']?[^"',}\s]{6,}/i,
  },
  {
    kind: "secret-like",
    reasonCode: "artifact.secret.prefix",
    pattern: /\b(?:sk|pk|ghp|gho|xoxb|xoxp|twilio)_[A-Za-z0-9_-]{12,}\b/,
  },
  {
    kind: "email",
    reasonCode: "artifact.identity.email",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  },
  {
    kind: "phone",
    reasonCode: "artifact.identity.phone",
    pattern: /(?:\+\d[\d\s().-]{7,}\d|\b\d{3}[\s().-]\d{3}[\s().-]\d{4}\b)/,
  },
  {
    kind: "request-body",
    reasonCode: "artifact.body.request_body",
    pattern: /\brequestBody\b/,
  },
  {
    kind: "raw-body",
    reasonCode: "artifact.body.raw_body",
    pattern: /\brawBody\b/,
  },
  {
    kind: "absolute-path",
    reasonCode: "artifact.path.absolute",
    pattern: /(?:[A-Za-z]:\\|\/(?:home|Users|tmp|mnt)\/)/,
  },
  {
    kind: "raw-task-body",
    reasonCode: "artifact.raw_task_body",
    pattern: /\b(rawTaskBody|taskBody|fullTask|rawTask)\b/i,
  },
  {
    kind: "raw-provider-output",
    reasonCode: "artifact.provider_output",
    pattern: /\b(rawProviderOutput|providerOutput|provider_output)\b/i,
  },
  {
    kind: "execution-output",
    reasonCode: "artifact.execution_output",
    pattern: /\b(rawExecutionOutput|executionOutput|execution_output)\b/i,
  },
  {
    kind: "file-content",
    reasonCode: "artifact.file_content",
    pattern: /\b(rawFileContent|fullFileContent|fileContent)\b/i,
  },
  {
    kind: "proposal-parameters",
    reasonCode: "artifact.proposal_parameters",
    pattern: /\b(rawProposalParameters|proposalParameters|proposalParams)\b/i,
  },
];

function stableId(prefix: string, value: string): string {
  return `${prefix}_${createHash("sha256").update(value).digest("hex").slice(0, 16)}`;
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function safeTimestamp(): string {
  return new Date().toISOString().replace(/[^0-9A-Za-z]/g, "").slice(0, 17);
}

function wslDistroName(): string | null {
  const candidates = [process.env.WSL_DISTRO_NAME, process.cwd(), import.meta.url].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );

  for (const candidate of candidates) {
    const normalized = candidate.replace(/\\/g, "/");
    const fileUrlMatch = normalized.match(/^file:\/\/wsl\.localhost\/([^/]+)\//i);
    if (fileUrlMatch?.[1]) return fileUrlMatch[1];

    const uncMatch = normalized.match(/^\/\/wsl(?:\$|\.localhost)\/([^/]+)\//i);
    if (uncMatch?.[1]) return uncMatch[1];
  }

  return null;
}

function defaultOutDir(): string {
  const directoryName = `orq-quality-artifacts-${safeTimestamp()}`;
  const wslDistro = wslDistroName();

  if (process.platform === "win32" && wslDistro) {
    return `//wsl$/${wslDistro}/tmp/${directoryName}`;
  }

  return `/tmp/${directoryName}`;
}

function normalizeOutDir(outDir: string): string {
  return resolve(outDir).replace(/\\/g, "/");
}

function assertAllowedOutDir(outDir: string): string {
  const normalized = normalizeOutDir(outDir);
  const isPosixTmp = dirname(normalized) === "/tmp" && basename(normalized).startsWith("orq-");
  const isWslUncTmp = /^\/\/wsl\$\/[^/]+\/tmp\/orq-[^/]+$/i.test(normalized);

  if (!isPosixTmp && !isWslUncTmp) {
    throw new Error("Artifact dry-run output directory must be a direct /tmp/orq-* path.");
  }
  return normalized;
}

function jsonText(value: unknown, pretty: boolean): string {
  return `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`;
}

function artifactFile(path: string, fileName: string): string {
  return `${path}/${fileName}`;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function manifestId(createdAt: string, files: ArtifactManifestFile[], scan: ArtifactScanResult): string {
  return stableId("qartifact", JSON.stringify({ createdAt, files, scan }));
}

function manifestFile(
  fileName: string,
  text: string,
  validation: ArtifactJsonValidationResult,
): ArtifactManifestFile {
  return {
    fileName,
    sha256: sha256(text),
    byteSize: Buffer.byteLength(text, "utf-8"),
    jsonValid: validation.jsonValid,
  };
}

async function buildQualityArtifacts(pretty: boolean): Promise<GeneratedArtifact[]> {
  const evalReport = await runEvalSuite();
  const riskSignal: RiskApprovalSignal = assessRisk(riskInputFromEvalReport(evalReport));
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
  const qualityReport: QualityDashboardData = buildQualityDashboardData({
    evalReport,
    riskSignal,
    sources,
  });
  const snapshot = buildQualitySnapshot({ dashboard: qualityReport });
  const comparison = compareQualitySnapshots({ current: snapshot, baseline: null });

  return [
    {
      fileName: QUALITY_REPORT_ARTIFACT,
      text: jsonText(qualityReport, pretty),
    },
    {
      fileName: QUALITY_SNAPSHOT_ARTIFACT,
      text: jsonText({ snapshot, comparison }, pretty),
    },
  ];
}

export function validateArtifactJson(fileName: string, text: string): ArtifactJsonValidationResult {
  try {
    JSON.parse(text) as unknown;
    return {
      fileName,
      jsonValid: true,
      reasonCode: null,
    };
  } catch {
    return {
      fileName,
      jsonValid: false,
      reasonCode: "artifact.json.invalid",
    };
  }
}

export function scanArtifactText(fileName: string, text: string): ArtifactScanResult {
  const findings = SCAN_RULES.filter((rule) => rule.pattern.test(text)).map((rule) => ({
    fileName,
    kind: rule.kind,
    reasonCode: rule.reasonCode,
  }));

  return {
    status: findings.length > 0 ? "fail" : "pass",
    checkedFiles: [fileName],
    failedFiles: findings.length > 0 ? [fileName] : [],
    findings,
  };
}

function mergeScanResults(results: ArtifactScanResult[]): ArtifactScanResult {
  const findings = results.flatMap((result) => result.findings).slice(0, 50);

  return {
    status: findings.length > 0 ? "fail" : "pass",
    checkedFiles: uniqueSorted(results.flatMap((result) => result.checkedFiles)),
    failedFiles: uniqueSorted(results.flatMap((result) => result.failedFiles)),
    findings,
  };
}

async function writeAndReadBack(outDir: string, artifact: GeneratedArtifact): Promise<string> {
  const filePath = artifactFile(outDir, artifact.fileName);
  await writeFile(filePath, artifact.text, "utf-8");
  return readFile(filePath, "utf-8");
}

export async function runQualityArtifactDryRun(
  options: QualityArtifactDryRunOptions = {},
): Promise<QualityArtifactDryRunResult> {
  const createdAt = new Date().toISOString();
  const outDir = assertAllowedOutDir(options.outDir ?? defaultOutDir());
  const pretty = options.pretty === true;
  const outputDirectoryName = basename(outDir);
  const failureReasons: string[] = [];

  await mkdir(outDir, { recursive: false });

  const artifacts = await buildQualityArtifacts(pretty);
  const validations: ArtifactJsonValidationResult[] = [];
  const files: ArtifactManifestFile[] = [];
  const scanResults: ArtifactScanResult[] = [];

  for (const artifact of artifacts) {
    const writtenText = await writeAndReadBack(outDir, artifact);
    const validation = validateArtifactJson(artifact.fileName, writtenText);
    validations.push(validation);
    files.push(manifestFile(artifact.fileName, writtenText, validation));

    if (!validation.jsonValid) {
      failureReasons.push(`${artifact.fileName}:artifact.json.invalid`);
      continue;
    }

    const scan = scanArtifactText(artifact.fileName, writtenText);
    scanResults.push(scan);
    for (const finding of scan.findings) {
      failureReasons.push(`${finding.fileName}:${finding.reasonCode}`);
    }
  }

  const scan = mergeScanResults(scanResults);
  const validationFailed = validations.some((validation) => !validation.jsonValid);
  const failed = validationFailed || scan.status === "fail";

  if (failed) {
    return {
      status: "fail",
      createdAt,
      schemaVersion: QUALITY_ARTIFACT_DRY_RUN_SCHEMA_VERSION,
      outputDirectoryName,
      generatedFiles: [QUALITY_REPORT_ARTIFACT, QUALITY_SNAPSHOT_ARTIFACT],
      files,
      validations,
      scan,
      manifest: null,
      manifestWritten: false,
      failureReasons: uniqueSorted(failureReasons),
      advisoryOnly: true,
      boundaries: { ...BOUNDARIES },
    };
  }

  const manifest: QualityArtifactDryRunManifest = {
    manifestId: manifestId(createdAt, files, scan),
    createdAt,
    schemaVersion: QUALITY_ARTIFACT_DRY_RUN_SCHEMA_VERSION,
    files,
    scan,
    generatedFiles: GENERATED_FILES.slice(),
    advisoryOnly: true,
    boundaries: { ...BOUNDARIES },
  };
  const manifestText = jsonText(manifest, pretty);
  await writeFile(artifactFile(outDir, QUALITY_MANIFEST_ARTIFACT), manifestText, "utf-8");

  return {
    status: "pass",
    createdAt,
    schemaVersion: QUALITY_ARTIFACT_DRY_RUN_SCHEMA_VERSION,
    outputDirectoryName,
    generatedFiles: GENERATED_FILES.slice(),
    files,
    validations,
    scan,
    manifest,
    manifestWritten: true,
    failureReasons: [],
    advisoryOnly: true,
    boundaries: { ...BOUNDARIES },
  };
}
