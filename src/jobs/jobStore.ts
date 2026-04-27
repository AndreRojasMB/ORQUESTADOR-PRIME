import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { createSafeError } from "../errors/errorTaxonomy.js";
import { logger } from "../observability/logger.js";
import { checkPermission } from "../permissions/permissionChecker.js";
import {
  redactStructuredValue,
  type RedactionMetadata,
} from "../privacy/redactionEngine.js";
import { deriveProjectIdentity } from "../supervisor/projectIdentity.js";
import type { ToolCapability } from "../tools/types.js";
import {
  DANGEROUS_JOB_KINDS,
  JOB_STORE_VERSION,
  type AppendJobInput,
  type AppendJobResult,
  type DangerousJobKind,
  type JobKind,
  type JobLogEntry,
  type JobProjectIdentity,
  type JobRecord,
  type JobSource,
  type JobStats,
  type JobStoreData,
  type SafeJobKind,
  type UpdateJobStatusInput,
} from "./types.js";

const DATA_DIR = join(homedir(), ".orquestador-prime");
const JOBS_FILE = join(DATA_DIR, "jobs.json");
const MAX_JOB_RECORDS = 1000;
const DEFAULT_MAX_ATTEMPTS = 1;
const MAX_ALLOWED_ATTEMPTS = 5;

const EMPTY_STORE: JobStoreData = {
  version: JOB_STORE_VERSION,
  jobs: [],
  lastUpdatedAt: null,
};

const JOB_TOOL_IDS: Record<SafeJobKind, string> = {
  "supervisor.status": "supervisor.status",
  "memory.v2.retrieve": "memory.v2.retrieve",
  "learning.export": "learning.export",
  "notification.create": "notification.inbox.create",
  "tool.registry.inspect": "tool.registry.inspect",
  "permission.audit.inspect": "permission.audit.inspect",
};

const DANGEROUS_TOOL_IDS: Partial<Record<DangerousJobKind, string>> = {
  "action.dispatch": "action.dispatch.approved",
  "repo.file_write.real": "repo.file_write.real",
  "repo.git_branch.real": "repo.git_branch.real",
};

function generateJobId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `job_${ts}_${rand}`;
}

function cloneRedaction(metadata: RedactionMetadata): RedactionMetadata {
  return {
    removedKinds: metadata.removedKinds.slice(),
    containsSecrets: metadata.containsSecrets,
    containsRawIdentity: metadata.containsRawIdentity,
    containsRawBody: metadata.containsRawBody,
    containsFileContent: metadata.containsFileContent,
    truncated: metadata.truncated,
    redactionVersion: metadata.redactionVersion,
  };
}

function cloneLog(log: JobLogEntry): JobLogEntry {
  return {
    timestamp: log.timestamp,
    event: log.event,
    safeMessage: log.safeMessage,
    errorCode: log.errorCode,
    redaction: log.redaction ? cloneRedaction(log.redaction) : null,
    relatedId: log.relatedId,
  };
}

function cloneJob(job: JobRecord): JobRecord {
  return {
    jobId: job.jobId,
    version: job.version,
    projectId: job.projectId,
    projectName: job.projectName,
    projectRootHash: job.projectRootHash,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    runAt: job.runAt,
    expiresAt: job.expiresAt,
    status: job.status,
    kind: job.kind,
    toolId: job.toolId,
    capability: job.capability,
    requestedBy: job.requestedBy,
    subjectKind: job.subjectKind,
    subjectHash: job.subjectHash,
    source: job.source,
    inputPreview: job.inputPreview,
    inputHash: job.inputHash,
    safeInput: { ...job.safeInput },
    redaction: cloneRedaction(job.redaction),
    permissionGrantId: job.permissionGrantId,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    lastErrorCode: job.lastErrorCode,
    resultSummary: job.resultSummary
      ? {
          ok: job.resultSummary.ok,
          safeMessage: job.resultSummary.safeMessage,
          data: { ...job.resultSummary.data },
        }
      : null,
    logs: job.logs.map(cloneLog),
    correlationId: job.correlationId,
  };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`);
  return `{${entries.join(",")}}`;
}

function hashValue(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function normalizeDate(value: string | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }
  if (!Number.isFinite(Date.parse(value))) {
    throw new Error("job date must be ISO-compatible");
  }
  return value;
}

function normalizeNullableDate(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (!Number.isFinite(Date.parse(value))) {
    throw new Error("job expiry date must be ISO-compatible");
  }
  return value;
}

function normalizeMaxAttempts(value: number | undefined): number {
  if (value === undefined) {
    return DEFAULT_MAX_ATTEMPTS;
  }
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("maxAttempts must be a positive integer");
  }
  return Math.min(value, MAX_ALLOWED_ATTEMPTS);
}

function isDangerousJobKind(kind: JobKind): kind is DangerousJobKind {
  return (DANGEROUS_JOB_KINDS as readonly string[]).includes(kind);
}

function toolIdForKind(kind: JobKind): string | null {
  if (isDangerousJobKind(kind)) {
    return DANGEROUS_TOOL_IDS[kind] ?? null;
  }
  return JOB_TOOL_IDS[kind];
}

function capabilityForKind(kind: JobKind): ToolCapability | null {
  const toolId = toolIdForKind(kind);
  return toolId as ToolCapability | null;
}

function channelForSource(source: JobSource): "cli" | "dashboard" | "system" {
  if (source === "cli") {
    return "cli";
  }
  if (source === "dashboard") {
    return "dashboard";
  }
  return "system";
}

function projectFields(identity: JobProjectIdentity): JobProjectIdentity {
  return {
    projectId: identity.projectId,
    projectName: identity.projectName,
    projectRootHash: identity.projectRootHash,
  };
}

function isUnsafeInput(metadata: RedactionMetadata): boolean {
  return (
    metadata.containsSecrets ||
    metadata.containsRawBody ||
    metadata.containsFileContent
  );
}

function buildLog(input: {
  timestamp: string;
  event: JobLogEntry["event"];
  safeMessage: string;
  errorCode?: string | null;
  redaction?: RedactionMetadata | null;
  relatedId?: string | null;
}): JobLogEntry {
  return {
    timestamp: input.timestamp,
    event: input.event,
    safeMessage: input.safeMessage,
    errorCode: input.errorCode ?? null,
    redaction: input.redaction ? cloneRedaction(input.redaction) : null,
    relatedId: input.relatedId ?? null,
  };
}

export async function readJobStore(): Promise<JobStoreData> {
  try {
    const raw = await readFile(JOBS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as JobStoreData;
    if (parsed.version !== JOB_STORE_VERSION || !Array.isArray(parsed.jobs)) {
      return { ...EMPTY_STORE, jobs: [] };
    }
    return {
      version: JOB_STORE_VERSION,
      jobs: parsed.jobs.map(cloneJob),
      lastUpdatedAt: parsed.lastUpdatedAt ?? null,
    };
  } catch {
    return { ...EMPTY_STORE, jobs: [] };
  }
}

export async function writeJobStore(store: JobStoreData): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const normalized: JobStoreData = {
      version: JOB_STORE_VERSION,
      jobs: store.jobs.slice(-MAX_JOB_RECORDS).map(cloneJob),
      lastUpdatedAt: now,
    };
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(JOBS_FILE, JSON.stringify(normalized, null, 2), "utf-8");
    return true;
  } catch (err) {
    logger.warn("job store write failed - continuing without persistence", {
      error: String(err),
    });
    return false;
  }
}

export async function appendJob(input: AppendJobInput): Promise<AppendJobResult> {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const runAt = normalizeDate(input.runAt, createdAt);
  const expiresAt = normalizeNullableDate(input.expiresAt);
  const source = input.source ?? "cli";
  const identity = deriveProjectIdentity(input.projectRoot);
  const project = projectFields(identity);
  const redactedInput = redactStructuredValue(input.input ?? {}, { maxLength: 500 });
  const safeInput =
    typeof redactedInput.value === "object" &&
    redactedInput.value !== null &&
    !Array.isArray(redactedInput.value)
      ? { ...(redactedInput.value as Record<string, unknown>) }
      : {};
  const inputHash = hashValue(safeInput);
  const toolId = toolIdForKind(input.kind);
  const capability = capabilityForKind(input.kind);

  const permission = await checkPermission(
    {
      subjectKind: input.subjectKind,
      subjectHash: input.subjectHash,
      projectId: project.projectId,
      toolId: "job.queue.enqueue",
      capability: "job.queue.enqueue",
      category: "other",
      operation: "job.enqueue",
      channel: channelForSource(source),
      dryRun: true,
      networkAccess: false,
      scopes: ["job.queue.enqueue"],
      correlationId: input.correlationId ?? null,
    },
    { appendAudit: true },
  );

  const unsafeInput = isUnsafeInput(redactedInput.metadata);
  const dangerousKind = isDangerousJobKind(input.kind);
  const allowedToQueue = permission.allowed && !unsafeInput && !dangerousKind;
  const queuedStatus =
    Date.parse(runAt) > Date.parse(createdAt) ? "scheduled" : "queued";
  const status = allowedToQueue ? queuedStatus : "blocked";
  const blockError = !permission.allowed
    ? createSafeError("permission.denied", {
        correlationId: input.correlationId ?? null,
        safeMessage: permission.safeMessage,
      })
    : unsafeInput
      ? createSafeError("redaction.unsafe", {
          correlationId: input.correlationId ?? null,
          safeMessage: "Job input contains data that cannot be stored safely.",
        })
      : dangerousKind
        ? createSafeError("job.blocked", {
            correlationId: input.correlationId ?? null,
            safeMessage: "This job kind is blocked by queue policy.",
          })
        : null;

  const job: JobRecord = {
    jobId: generateJobId(),
    version: JOB_STORE_VERSION,
    projectId: project.projectId,
    projectName: project.projectName,
    projectRootHash: project.projectRootHash,
    createdAt,
    updatedAt: createdAt,
    runAt,
    expiresAt,
    status,
    kind: input.kind,
    toolId,
    capability,
    requestedBy: input.requestedBy ?? `${input.subjectKind}:${input.subjectHash.slice(0, 12)}`,
    subjectKind: input.subjectKind,
    subjectHash: input.subjectHash,
    source,
    inputPreview: redactedInput.safePreview,
    inputHash,
    safeInput,
    redaction: cloneRedaction(redactedInput.metadata),
    permissionGrantId: permission.matchedGrantId,
    attempts: 0,
    maxAttempts: normalizeMaxAttempts(input.maxAttempts),
    lastErrorCode: blockError?.code ?? null,
    resultSummary: blockError
      ? {
          ok: false,
          safeMessage: blockError.safeMessage,
          data: { reason: blockError.code },
        }
      : null,
    logs: [
      buildLog({
        timestamp: createdAt,
        event: status === "blocked" ? "policy-blocked" : "created",
        safeMessage: blockError?.safeMessage ?? "Job queued for manual runner.",
        errorCode: blockError?.code ?? null,
        redaction: redactedInput.metadata,
      }),
    ],
    correlationId: input.correlationId ?? null,
  };

  const store = await readJobStore();
  store.jobs.push(job);
  const persisted = await writeJobStore(store);

  return {
    job: cloneJob(job),
    enqueued: allowedToQueue && persisted,
    persisted,
    permission,
  };
}

export async function updateJobStatus(
  input: UpdateJobStatusInput,
): Promise<{ job: JobRecord | null; persisted: boolean }> {
  const store = await readJobStore();
  const index = store.jobs.findIndex((job) => job.jobId === input.jobId);
  if (index < 0) {
    return { job: null, persisted: false };
  }

  const current = store.jobs[index];
  if (!current) {
    return { job: null, persisted: false };
  }

  const updated: JobRecord = {
    ...cloneJob(current),
    status: input.status,
    updatedAt: input.updatedAt ?? new Date().toISOString(),
    resultSummary:
      input.resultSummary === undefined ? current.resultSummary : input.resultSummary,
    lastErrorCode:
      input.lastErrorCode === undefined ? current.lastErrorCode : input.lastErrorCode,
    attempts: input.attempts ?? current.attempts,
    logs: input.log ? [...current.logs.map(cloneLog), cloneLog(input.log)] : current.logs.map(cloneLog),
  };

  store.jobs[index] = updated;
  const persisted = await writeJobStore(store);
  return { job: cloneJob(updated), persisted };
}

export async function getDueJobs(now = new Date()): Promise<JobRecord[]> {
  const nowMs = now.getTime();
  const store = await readJobStore();
  return store.jobs
    .filter((job) => {
      if (job.status !== "queued" && job.status !== "scheduled") {
        return false;
      }
      const runMs = Date.parse(job.runAt);
      return Number.isFinite(runMs) && runMs <= nowMs;
    })
    .map(cloneJob);
}

export async function getRecentJobs(n = 50): Promise<JobRecord[]> {
  const store = await readJobStore();
  return store.jobs.slice(-n).map(cloneJob);
}

export async function getJobStats(): Promise<JobStats> {
  const store = await readJobStore();
  const stats: JobStats = {
    total: store.jobs.length,
    byStatus: {},
    byKind: {},
  };

  for (const job of store.jobs) {
    stats.byStatus[job.status] = (stats.byStatus[job.status] ?? 0) + 1;
    stats.byKind[job.kind] = (stats.byKind[job.kind] ?? 0) + 1;
  }

  return stats;
}

export function getJobsPath(): string {
  return JOBS_FILE;
}
