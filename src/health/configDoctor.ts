import { createHash } from "crypto";
import { readFile, stat } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { getStoreInventory } from "./storeInventory.js";
import type {
  DoctorCheck,
  DoctorFinding,
  DoctorStatus,
  RuntimeDoctorBoundaries,
  RuntimeDoctorResult,
  RuntimeDoctorSummary,
  SafeMetadata,
  StoreHealth,
  StoreInventoryEntry,
} from "./types.js";

export const RUNTIME_DOCTOR_SCHEMA_VERSION = "1.0";

interface RuntimeDoctorOptions {
  projectRoot?: string;
  dataDir?: string;
  createdAt?: string;
}

interface StoreScanResult {
  warnings: DoctorFinding[];
  errors: DoctorFinding[];
}

const BOUNDARIES: RuntimeDoctorBoundaries = {
  readOnly: true,
  noStoreMutation: true,
  noRepair: true,
  noMigration: true,
  noLocksCreated: true,
  noProviderCalls: true,
  noNetwork: true,
  noActionDispatch: true,
};

const LARGE_STORE_WARN_BYTES = 2 * 1024 * 1024;

const SUSPICIOUS_KEY_RULES: Array<{
  pattern: RegExp;
  reasonCode: string;
  safeMessage: string;
}> = [
  {
    pattern: /(?:token|secret|apiKey|api_key|providerKey|provider_key|hookToken)/i,
    reasonCode: "privacy.suspicious_key.secret",
    safeMessage: "Store contains a key name that may carry secret material.",
  },
  {
    pattern: /(?:requestBody|rawBody|rawTask|taskBody)/i,
    reasonCode: "privacy.suspicious_key.raw_body",
    safeMessage: "Store contains a key name associated with raw body content.",
  },
  {
    pattern: /(?:providerOutput|provider_output|rawProviderOutput)/i,
    reasonCode: "privacy.suspicious_key.provider_output",
    safeMessage: "Store contains a key name associated with provider output.",
  },
  {
    pattern: /(?:executionOutput|execution_output|rawExecutionOutput|output)/i,
    reasonCode: "privacy.suspicious_key.execution_output",
    safeMessage: "Store contains a key name associated with execution output.",
  },
  {
    pattern: /(?:proposalParameters|proposalParams|parameters)/i,
    reasonCode: "privacy.suspicious_key.proposal_parameters",
    safeMessage: "Store contains a key name associated with proposal parameters.",
  },
];

const SUSPICIOUS_VALUE_RULES: Array<{
  pattern: RegExp;
  reasonCode: string;
  safeMessage: string;
}> = [
  {
    pattern: /\bbearer\s+[A-Za-z0-9._~+/=-]{8,}/i,
    reasonCode: "privacy.suspicious_value.bearer",
    safeMessage: "Store contains a bearer-like value.",
  },
  {
    pattern: /\b(?:sk|pk|ghp|gho|xoxb|xoxp|twilio)_[A-Za-z0-9_-]{12,}\b/,
    reasonCode: "privacy.suspicious_value.secret_prefix",
    safeMessage: "Store contains a token-prefix-like value.",
  },
  {
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    reasonCode: "privacy.suspicious_value.email",
    safeMessage: "Store contains an email-like value.",
  },
  {
    pattern: /(?:\+\d[\d\s().-]{7,}\d|\b\d{3}[\s().-]\d{3}[\s().-]\d{4}\b)/,
    reasonCode: "privacy.suspicious_value.phone",
    safeMessage: "Store contains a phone-like value.",
  },
  {
    pattern: /(?:[A-Za-z]:\\|\/(?:home|Users|tmp|mnt)\/)/,
    reasonCode: "privacy.suspicious_value.path",
    safeMessage: "Store contains an absolute-path-like value.",
  },
];

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function doctorId(createdAt: string, dataDir: string): string {
  return `rtdoc_${sha256(`${createdAt}:${dataDir}`).slice(0, 16)}`;
}

function findingId(prefix: string, parts: string[]): string {
  return `${prefix}_${sha256(parts.join(":")).slice(0, 12)}`;
}

function dataDirFromEnvironment(options: RuntimeDoctorOptions): {
  dataDir: string;
  source: "option" | "env" | "home";
} {
  if (options.dataDir?.trim()) {
    return { dataDir: options.dataDir.trim(), source: "option" };
  }
  const envDir = process.env.ORQUESTADOR_DATA_DIR?.trim();
  if (envDir) {
    return { dataDir: envDir, source: "env" };
  }
  return { dataDir: join(homedir(), ".orquestador-prime"), source: "home" };
}

function safeRootMetadata(dataDir: string, source: string): SafeMetadata {
  return {
    dataRootSource: source,
    dataRootHash: sha256(dataDir).slice(0, 16),
  };
}

function buildFinding(input: {
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  storeId?: string;
  checkId?: string;
  metadata?: SafeMetadata;
}): DoctorFinding {
  return {
    id: findingId("find", [
      input.severity,
      input.reasonCode,
      input.storeId ?? "",
      input.checkId ?? "",
      input.safeMessage,
    ]),
    severity: input.severity,
    reasonCode: input.reasonCode,
    safeMessage: input.safeMessage,
    ...(input.storeId ? { storeId: input.storeId } : {}),
    ...(input.checkId ? { checkId: input.checkId } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };
}

function checkStatus(checks: DoctorCheck[]): Exclude<DoctorStatus, "skipped"> {
  if (checks.some((check) => check.status === "fail")) return "fail";
  if (checks.some((check) => check.status === "warn")) return "warn";
  return "pass";
}

function statusFromStore(store: StoreHealth): DoctorStatus {
  if (store.errors.length > 0) return "fail";
  if (store.warnings.length > 0) return "warn";
  if (!store.exists) return "skipped";
  return "pass";
}

function countCollection(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object") return Object.keys(value).length;
  return 0;
}

function walkJson(value: unknown, visit: (key: string | null, value: unknown) => void, key: string | null = null): void {
  visit(key, value);

  if (Array.isArray(value)) {
    for (const item of value) {
      walkJson(item, visit, null);
    }
    return;
  }

  if (value && typeof value === "object") {
    for (const [nestedKey, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      walkJson(nestedValue, visit, nestedKey);
    }
  }
}

function scanParsedStore(entry: StoreInventoryEntry, parsed: unknown): StoreScanResult {
  const findings = new Map<string, DoctorFinding>();
  const add = (finding: DoctorFinding) => {
    findings.set(`${finding.reasonCode}:${finding.storeId ?? ""}`, finding);
  };

  walkJson(parsed, (key, value) => {
    if (key) {
      for (const rule of SUSPICIOUS_KEY_RULES) {
        if (rule.pattern.test(key)) {
          add(buildFinding({
            severity: "warn",
            reasonCode: rule.reasonCode,
            safeMessage: rule.safeMessage,
            storeId: entry.storeId,
          }));
        }
      }
      if (entry.sensitiveFields?.some((field) => field.toLowerCase() === key.toLowerCase())) {
        add(buildFinding({
          severity: "warn",
          reasonCode: "privacy.sensitive_field.present",
          safeMessage: "Store contains a configured sensitive field name.",
          storeId: entry.storeId,
        }));
      }
    }

    if (typeof value === "string") {
      for (const rule of SUSPICIOUS_VALUE_RULES) {
        if (rule.pattern.test(value)) {
          add(buildFinding({
            severity: "warn",
            reasonCode: rule.reasonCode,
            safeMessage: rule.safeMessage,
            storeId: entry.storeId,
          }));
        }
      }
    }
  });

  return {
    warnings: [...findings.values()],
    errors: [],
  };
}

async function inspectStore(entry: StoreInventoryEntry, dataDir: string): Promise<StoreHealth> {
  const filePath = join(dataDir, entry.fileName);
  const base: StoreHealth = {
    storeId: entry.storeId,
    displayName: entry.displayName,
    fileName: entry.fileName,
    scope: entry.scope,
    required: entry.required,
    status: "skipped",
    exists: false,
    readable: false,
    parseable: false,
    schemaVersionPresent: false,
    warnings: [],
    errors: [],
    metadata: {
      futureLockScope: entry.futureLockScope ?? null,
      futureMigrationVersion: entry.futureMigrationVersion ?? null,
    },
  };

  let stats;
  try {
    stats = await stat(filePath);
  } catch {
    const missingFinding = buildFinding({
      severity: entry.required ? "fail" : "warn",
      reasonCode: entry.required ? "store.required_missing" : "store.optional_missing",
      safeMessage: entry.required
        ? "Required store file is missing."
        : "Optional store file is missing.",
      storeId: entry.storeId,
    });
    if (entry.required) {
      base.errors.push(missingFinding);
    } else {
      base.warnings.push(missingFinding);
    }
    base.status = statusFromStore(base);
    return base;
  }

  base.exists = true;
  base.sizeBytes = stats.size;
  if (stats.size > LARGE_STORE_WARN_BYTES) {
    base.warnings.push(buildFinding({
      severity: "warn",
      reasonCode: "store.size.large",
      safeMessage: "Store file is larger than the current runtime doctor warning threshold.",
      storeId: entry.storeId,
      metadata: { thresholdBytes: LARGE_STORE_WARN_BYTES },
    }));
  }

  let raw: string;
  try {
    raw = await readFile(filePath, "utf-8");
    base.readable = true;
  } catch {
    base.errors.push(buildFinding({
      severity: "fail",
      reasonCode: "store.unreadable",
      safeMessage: "Store file exists but could not be read.",
      storeId: entry.storeId,
    }));
    base.status = statusFromStore(base);
    return base;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.replace(/^\uFEFF/, ""));
    base.parseable = true;
  } catch {
    base.errors.push(buildFinding({
      severity: "fail",
      reasonCode: "store.json.invalid",
      safeMessage: "Store file is not valid JSON.",
      storeId: entry.storeId,
    }));
    base.status = statusFromStore(base);
    return base;
  }

  const parsedObject = parsed && typeof parsed === "object"
    ? parsed as Record<string, unknown>
    : null;

  if (entry.versionField) {
    base.schemaVersionPresent = parsedObject
      ? Object.prototype.hasOwnProperty.call(parsedObject, entry.versionField)
      : false;

    if (!base.schemaVersionPresent) {
      base.warnings.push(buildFinding({
        severity: "warn",
        reasonCode: "store.version.missing",
        safeMessage: "Store JSON does not include the expected version field.",
        storeId: entry.storeId,
      }));
    } else if (entry.expectedVersion) {
      const rawVersion = String(parsedObject?.[entry.versionField] ?? "");
      base.versionMatches = rawVersion === entry.expectedVersion;
      if (!base.versionMatches) {
        base.warnings.push(buildFinding({
          severity: "warn",
          reasonCode: "store.version.mismatch",
          safeMessage: "Store JSON version does not match the expected version.",
          storeId: entry.storeId,
          metadata: { expectedVersion: entry.expectedVersion },
        }));
      }
    }
  }

  const collectionCounts: Record<string, number> = {};
  for (const field of entry.collectionFields ?? []) {
    collectionCounts[field] = countCollection(parsedObject?.[field]);
  }
  if (Object.keys(collectionCounts).length > 0) {
    base.collectionCounts = collectionCounts;
    base.initialized = Object.values(collectionCounts).some((count) => count > 0);
  } else {
    base.initialized = true;
  }

  const scan = scanParsedStore(entry, parsed);
  base.warnings.push(...scan.warnings);
  base.errors.push(...scan.errors);
  base.status = statusFromStore(base);
  return base;
}

function makeCheck(input: {
  id: string;
  label: string;
  status: DoctorStatus;
  reasonCode: string;
  safeMessage: string;
  metadata?: SafeMetadata;
}): DoctorCheck {
  return {
    id: input.id,
    label: input.label,
    status: input.status,
    reasonCode: input.reasonCode,
    safeMessage: input.safeMessage,
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readTextIfPresent(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf-8");
  } catch {
    return null;
  }
}

function packageScriptCheck(packageJson: unknown, scriptName: string): DoctorCheck {
  const scripts =
    packageJson &&
    typeof packageJson === "object" &&
    "scripts" in packageJson &&
    typeof (packageJson as { scripts?: unknown }).scripts === "object" &&
    (packageJson as { scripts?: unknown }).scripts !== null
      ? (packageJson as { scripts: Record<string, unknown> }).scripts
      : {};
  const present = typeof scripts[scriptName] === "string";

  return makeCheck({
    id: `package-script-${scriptName.replace(/[^a-z0-9]+/gi, "-")}`,
    label: `Package script ${scriptName}`,
    status: present ? "pass" : "fail",
    reasonCode: present ? "package.script.present" : "package.script.missing",
    safeMessage: present
      ? `Package script ${scriptName} is present.`
      : `Package script ${scriptName} is missing.`,
  });
}

function workflowContainsCheck(workflowText: string | null, needle: string, id: string, label: string): DoctorCheck {
  if (!workflowText) {
    return makeCheck({
      id,
      label,
      status: "warn",
      reasonCode: "workflow.unavailable",
      safeMessage: "Workflow file could not be read.",
    });
  }
  const present = workflowText.includes(needle);
  return makeCheck({
    id,
    label,
    status: present ? "pass" : "fail",
    reasonCode: present ? "workflow.expected_text.present" : "workflow.expected_text.missing",
    safeMessage: present
      ? "Workflow contains the expected safe configuration."
      : "Workflow is missing expected safe configuration.",
  });
}

function workflowAbsentCheck(workflowText: string | null, needle: string, id: string, label: string): DoctorCheck {
  if (!workflowText) {
    return makeCheck({
      id,
      label,
      status: "warn",
      reasonCode: "workflow.unavailable",
      safeMessage: "Workflow file could not be read.",
    });
  }
  const absent = !workflowText.includes(needle);
  return makeCheck({
    id,
    label,
    status: absent ? "pass" : "fail",
    reasonCode: absent ? "workflow.deferred_flag.absent" : "workflow.deferred_flag.present",
    safeMessage: absent
      ? "Deferred strict CI flag is not active in workflow."
      : "Deferred strict CI flag appears in workflow.",
  });
}

async function buildChecks(projectRoot: string, dataRootMetadata: SafeMetadata): Promise<DoctorCheck[]> {
  const packagePath = join(projectRoot, "package.json");
  const packageText = await readTextIfPresent(packagePath);
  let packageJson: unknown = null;
  try {
    packageJson = packageText ? JSON.parse(packageText) as unknown : null;
  } catch {
    packageJson = null;
  }

  const workflowText = await readTextIfPresent(join(projectRoot, ".github", "workflows", "quality.yml"));
  const checks: DoctorCheck[] = [
    makeCheck({
      id: "node-runtime",
      label: "Node runtime",
      status: "pass",
      reasonCode: "node.runtime.available",
      safeMessage: "Node runtime is available to the doctor process.",
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    }),
    makeCheck({
      id: "npm-availability",
      label: "npm availability",
      status: process.env.npm_execpath ? "pass" : "warn",
      reasonCode: process.env.npm_execpath ? "npm.detected" : "npm.not_detected",
      safeMessage: process.env.npm_execpath
        ? "npm appears to be driving the current process."
        : "npm availability was not checked by running a subprocess.",
    }),
    makeCheck({
      id: "typescript-binary",
      label: "TypeScript binary",
      status: await fileExists(join(projectRoot, "node_modules", "typescript", "bin", "tsc"))
        ? "pass"
        : "warn",
      reasonCode: "typescript.binary.presence_check",
      safeMessage: "TypeScript binary presence was checked without creating files.",
    }),
    makeCheck({
      id: "data-root",
      label: "Data root",
      status: "pass",
      reasonCode: "data_root.resolved",
      safeMessage: "ORQUESTADOR data root was resolved without creating it.",
      metadata: dataRootMetadata,
    }),
    packageScriptCheck(packageJson, "check:node"),
    packageScriptCheck(packageJson, "quality:gate"),
    packageScriptCheck(packageJson, "quality:artifacts:dry-run"),
    workflowContainsCheck(workflowText, "node-version: 22", "workflow-node-22", "CI Node version"),
    workflowContainsCheck(workflowText, "actions/checkout@v6", "workflow-checkout-v6", "Checkout action"),
    workflowContainsCheck(workflowText, "actions/setup-node@v6", "workflow-setup-node-v6", "Setup Node action"),
    workflowContainsCheck(workflowText, "npm run quality:gate", "workflow-quality-gate", "Quality gate step"),
    workflowContainsCheck(
      workflowText,
      "npm run quality:artifacts:dry-run",
      "workflow-artifact-dry-run",
      "Artifact dry-run step",
    ),
    workflowContainsCheck(workflowText, "actions/upload-artifact@v4", "workflow-upload-artifact", "Artifact upload"),
    workflowAbsentCheck(workflowText, "--fail-on-review", "workflow-no-fail-on-review", "fail-on-review deferred"),
    workflowAbsentCheck(
      workflowText,
      "--fail-on-regression",
      "workflow-no-fail-on-regression",
      "fail-on-regression deferred",
    ),
    makeCheck({
      id: "runtime-server-placeholder",
      label: "Runtime server",
      status: "skipped",
      reasonCode: "runtime.server.not_implemented",
      safeMessage: "Runtime server remains future work.",
    }),
    makeCheck({
      id: "migration-placeholder",
      label: "Store migrations",
      status: "skipped",
      reasonCode: "runtime.migrations.not_implemented",
      safeMessage: "Store migrations remain future work.",
    }),
    makeCheck({
      id: "locks-placeholder",
      label: "Locks",
      status: "skipped",
      reasonCode: "runtime.locks.not_implemented",
      safeMessage: "Store locks remain future work.",
    }),
    makeCheck({
      id: "automation-placeholder",
      label: "Native automation engine",
      status: "skipped",
      reasonCode: "runtime.automation.not_implemented",
      safeMessage: "Native automation remains future work.",
    }),
  ];

  return checks;
}

function findingsFromChecks(checks: DoctorCheck[]): {
  warnings: DoctorFinding[];
  errors: DoctorFinding[];
} {
  const warnings: DoctorFinding[] = [];
  const errors: DoctorFinding[] = [];

  for (const check of checks) {
    if (check.status !== "warn" && check.status !== "fail") {
      continue;
    }
    const finding = buildFinding({
      severity: check.status,
      reasonCode: check.reasonCode,
      safeMessage: check.safeMessage,
      checkId: check.id,
      ...(check.metadata ? { metadata: check.metadata } : {}),
    });
    if (check.status === "fail") {
      errors.push(finding);
    } else {
      warnings.push(finding);
    }
  }

  return { warnings, errors };
}

function summarize(checks: DoctorCheck[], stores: StoreHealth[]): RuntimeDoctorSummary {
  const statuses = [
    ...checks.map((check) => check.status),
    ...stores.map((store) => store.status),
  ];

  const failCount = statuses.filter((status) => status === "fail").length;
  const warnCount = statuses.filter((status) => status === "warn").length;
  const skippedCount = statuses.filter((status) => status === "skipped").length;
  const passCount = statuses.filter((status) => status === "pass").length;

  return {
    status: failCount > 0 ? "fail" : warnCount > 0 ? "warn" : "pass",
    passCount,
    warnCount,
    failCount,
    skippedCount,
    storeCount: stores.length,
  };
}

function recommendations(summary: RuntimeDoctorSummary): string[] {
  const items = [
    "Keep runtime doctor read-only until store migration and lock policy are implemented.",
    "Treat missing optional stores as expected on fresh installations.",
    "Review privacy warnings before enabling migrations, locks, runtime API, or automation.",
  ];

  if (summary.status === "fail") {
    items.unshift("Resolve failed doctor checks before adding runtime mutation features.");
  }

  return items;
}

export async function runRuntimeDoctor(
  options: RuntimeDoctorOptions = {},
): Promise<RuntimeDoctorResult> {
  const createdAt = options.createdAt ?? new Date().toISOString();
  const projectRoot = options.projectRoot ?? process.cwd();
  const dataRoot = dataDirFromEnvironment(options);
  const rootMetadata = safeRootMetadata(dataRoot.dataDir, dataRoot.source);
  const stores = await Promise.all(
    getStoreInventory().map((entry) => inspectStore(entry, dataRoot.dataDir)),
  );
  const checks = await buildChecks(projectRoot, rootMetadata);
  const checkFindings = findingsFromChecks(checks);
  const warnings = [
    ...stores.flatMap((store) => store.warnings),
    ...checkFindings.warnings,
  ];
  const errors = [
    ...stores.flatMap((store) => store.errors),
    ...checkFindings.errors,
  ];
  const summary = summarize(checks, stores);

  return {
    doctorId: doctorId(createdAt, dataRoot.dataDir),
    createdAt,
    schemaVersion: RUNTIME_DOCTOR_SCHEMA_VERSION,
    advisoryOnly: true,
    summary,
    checks,
    stores,
    warnings,
    errors,
    recommendations: recommendations(summary),
    redaction: {
      status: "pass",
      rawValuesIncluded: false,
      reasonCode: "redaction.raw_values_omitted",
    },
    boundaries: { ...BOUNDARIES },
  };
}

export function createRuntimeDoctorErrorResult(error: unknown): RuntimeDoctorResult {
  const createdAt = new Date().toISOString();
  const safeMessage = error instanceof Error && error.message
    ? "Runtime doctor failed before checks completed."
    : "Runtime doctor failed with an unknown error.";
  const finding = buildFinding({
    severity: "fail",
    reasonCode: "doctor.execution_error",
    safeMessage,
  });

  return {
    doctorId: `rtdoc_error_${sha256(createdAt).slice(0, 16)}`,
    createdAt,
    schemaVersion: RUNTIME_DOCTOR_SCHEMA_VERSION,
    advisoryOnly: true,
    summary: {
      status: "fail",
      passCount: 0,
      warnCount: 0,
      failCount: 1,
      skippedCount: 0,
      storeCount: 0,
    },
    checks: [],
    stores: [],
    warnings: [],
    errors: [finding],
    recommendations: ["Fix the doctor execution error before trusting runtime health output."],
    redaction: {
      status: "pass",
      rawValuesIncluded: false,
      reasonCode: "redaction.raw_values_omitted",
    },
    boundaries: { ...BOUNDARIES },
  };
}
