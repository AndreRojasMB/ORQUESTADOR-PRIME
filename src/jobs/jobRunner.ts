import { GLOBAL_FORBIDDEN_ACTION_CATEGORIES, type ActionCategory } from "../actions/types.js";
import { createSafeError, safeErrorFromUnknown } from "../errors/errorTaxonomy.js";
import { checkPermission } from "../permissions/permissionChecker.js";
import { getToolRegistryEntry } from "../tools/registry.js";
import {
  DANGEROUS_JOB_KINDS,
  type DangerousJobKind,
  type JobKind,
  type JobLogEntry,
  type JobRecord,
  type JobRunResult,
  type JobStatus,
} from "./types.js";
import { updateJobStatus } from "./jobStore.js";
import { runSafeJobHandler } from "./safeJobHandlers.js";

const ACTION_CATEGORIES = new Set<ActionCategory>([
  "file-write",
  "file-delete",
  "git-branch",
  "git-push",
  "pr-create",
  "pr-merge",
  "tool-invoke",
  "deploy",
  "config-change",
  "notification",
  "query",
  "other",
]);

const GLOBAL_FORBIDDEN_CATEGORY_SET = new Set<ActionCategory>(
  GLOBAL_FORBIDDEN_ACTION_CATEGORIES,
);

function isDangerousJobKind(kind: JobKind): kind is DangerousJobKind {
  return (DANGEROUS_JOB_KINDS as readonly string[]).includes(kind);
}

function isActionCategory(value: string): value is ActionCategory {
  return ACTION_CATEGORIES.has(value as ActionCategory);
}

function isGloballyForbiddenCategory(value: ActionCategory | null): boolean {
  return value ? GLOBAL_FORBIDDEN_CATEGORY_SET.has(value) : false;
}

function logEntry(input: {
  event: JobLogEntry["event"];
  safeMessage: string;
  errorCode?: string | null;
  relatedId?: string | null;
}): JobLogEntry {
  return {
    timestamp: new Date().toISOString(),
    event: input.event,
    safeMessage: input.safeMessage,
    errorCode: input.errorCode ?? null,
    redaction: null,
    relatedId: input.relatedId ?? null,
  };
}

function blockedRunResult(input: {
  job: JobRecord;
  startedAt: string;
  safeMessage: string;
  code: string;
  data?: Record<string, unknown>;
}): JobRunResult {
  const finishedAt = new Date().toISOString();
  return {
    jobId: input.job.jobId,
    kind: input.job.kind,
    status: "blocked",
    ok: false,
    startedAt: input.startedAt,
    finishedAt,
    durationMs: Math.max(0, Date.parse(finishedAt) - Date.parse(input.startedAt)),
    safeSummary: input.safeMessage,
    data: input.data ?? {},
    error: createSafeError("job.blocked", {
      safeMessage: input.safeMessage,
      correlationId: input.job.correlationId,
      auditHint: input.code,
    }),
  };
}

async function persistResult(input: {
  job: JobRecord;
  status: JobStatus;
  attempts: number;
  safeMessage: string;
  ok: boolean;
  data: Record<string, unknown>;
  errorCode?: string | null;
  event?: JobLogEntry["event"];
}): Promise<void> {
  await updateJobStatus({
    jobId: input.job.jobId,
    status: input.status,
    attempts: input.attempts,
    lastErrorCode: input.errorCode ?? null,
    resultSummary: {
      ok: input.ok,
      safeMessage: input.safeMessage,
      data: input.data,
    },
    log: logEntry({
      event: input.event ?? (input.ok ? "completed" : "policy-blocked"),
      safeMessage: input.safeMessage,
      errorCode: input.errorCode ?? null,
    }),
  });
}

export async function runJob(job: JobRecord): Promise<JobRunResult> {
  const startedAt = new Date().toISOString();
  const attempts = job.attempts + 1;

  if (job.status !== "queued" && job.status !== "scheduled") {
    return blockedRunResult({
      job,
      startedAt,
      safeMessage: "Job is not in a runnable state.",
      code: "job-state-not-runnable",
    });
  }

  if (job.expiresAt) {
    const expiresMs = Date.parse(job.expiresAt);
    if (Number.isFinite(expiresMs) && expiresMs <= Date.now()) {
      await updateJobStatus({
        jobId: job.jobId,
        status: "expired",
        lastErrorCode: "job.expired",
        log: logEntry({
          event: "expired",
          safeMessage: "Job expired before manual runner could run it.",
          errorCode: "job.expired",
        }),
      });
      return blockedRunResult({
        job,
        startedAt,
        safeMessage: "Job expired before manual runner could run it.",
        code: "job.expired",
      });
    }
  }

  if (attempts > job.maxAttempts) {
    await persistResult({
      job,
      status: "blocked",
      attempts: job.attempts,
      safeMessage: "Job exceeded max attempts.",
      ok: false,
      data: { attempts: job.attempts, maxAttempts: job.maxAttempts },
      errorCode: "job.max-attempts",
    });
    return blockedRunResult({
      job,
      startedAt,
      safeMessage: "Job exceeded max attempts.",
      code: "job.max-attempts",
    });
  }

  if (isDangerousJobKind(job.kind)) {
    await persistResult({
      job,
      status: "blocked",
      attempts,
      safeMessage: "Dangerous job kind is blocked by queue policy.",
      ok: false,
      data: { kind: job.kind },
      errorCode: "job.blocked",
    });
    return blockedRunResult({
      job,
      startedAt,
      safeMessage: "Dangerous job kind is blocked by queue policy.",
      code: "job.blocked",
    });
  }

  if (!job.toolId || !job.capability) {
    await persistResult({
      job,
      status: "blocked",
      attempts,
      safeMessage: "Job kind has no registered tool.",
      ok: false,
      data: { kind: job.kind },
      errorCode: "tool.forbidden",
    });
    return blockedRunResult({
      job,
      startedAt,
      safeMessage: "Job kind has no registered tool.",
      code: "tool.forbidden",
    });
  }

  const entry = getToolRegistryEntry(job.toolId);
  if (!entry) {
    await persistResult({
      job,
      status: "blocked",
      attempts,
      safeMessage: "Job tool is unknown.",
      ok: false,
      data: { toolId: job.toolId },
      errorCode: "unknown-tool",
    });
    return blockedRunResult({
      job,
      startedAt,
      safeMessage: "Job tool is unknown.",
      code: "unknown-tool",
    });
  }

  const category = isActionCategory(entry.category) ? entry.category : null;
  if (isGloballyForbiddenCategory(category)) {
    await persistResult({
      job,
      status: "blocked",
      attempts,
      safeMessage: "Job category is globally forbidden.",
      ok: false,
      data: { category },
      errorCode: "tool.forbidden",
    });
    return blockedRunResult({
      job,
      startedAt,
      safeMessage: "Job category is globally forbidden.",
      code: "tool.forbidden",
    });
  }

  const permission = await checkPermission(
    {
      subjectKind: job.subjectKind,
      subjectHash: job.subjectHash,
      projectId: job.projectId,
      toolId: entry.toolId,
      capability: entry.capability,
      category,
      operation: "job.run",
      channel: job.source === "dashboard" ? "dashboard" : job.source === "cli" ? "cli" : "system",
      dryRun: true,
      networkAccess: entry.networkAccess,
      scopes: [entry.capability],
      correlationId: job.correlationId,
      jobId: job.jobId,
    },
    { appendAudit: true },
  );

  if (!permission.allowed) {
    await persistResult({
      job,
      status: "blocked",
      attempts,
      safeMessage: permission.safeMessage,
      ok: false,
      data: { reasonCode: permission.reasonCode },
      errorCode: permission.reasonCode,
    });
    return blockedRunResult({
      job,
      startedAt,
      safeMessage: permission.safeMessage,
      code: permission.reasonCode,
      data: { reasonCode: permission.reasonCode },
    });
  }

  await updateJobStatus({
    jobId: job.jobId,
    status: "running",
    attempts,
    log: logEntry({
      event: "started",
      safeMessage: "Manual job runner started safe handler.",
    }),
  });

  try {
    const handlerResult = await runSafeJobHandler(job);
    const status: JobStatus = handlerResult.ok ? "succeeded" : "blocked";
    const finishedAt = new Date().toISOString();
    await persistResult({
      job,
      status,
      attempts,
      safeMessage: handlerResult.safeMessage,
      ok: handlerResult.ok,
      data: handlerResult.data,
      errorCode: handlerResult.ok ? null : "job.blocked",
      event: handlerResult.ok ? "completed" : "policy-blocked",
    });
    return {
      jobId: job.jobId,
      kind: job.kind,
      status,
      ok: handlerResult.ok,
      startedAt,
      finishedAt,
      durationMs: Math.max(0, Date.parse(finishedAt) - Date.parse(startedAt)),
      safeSummary: handlerResult.safeMessage,
      data: handlerResult.data,
      error: handlerResult.ok
        ? null
        : createSafeError("job.blocked", {
            safeMessage: handlerResult.safeMessage,
            correlationId: job.correlationId,
          }),
    };
  } catch (err) {
    const safeError = safeErrorFromUnknown(err, "jobRunner");
    const finishedAt = new Date().toISOString();
    await persistResult({
      job,
      status: "failed",
      attempts,
      safeMessage: safeError.safeMessage,
      ok: false,
      data: { errorCode: safeError.code },
      errorCode: safeError.code,
      event: "failed",
    });
    return {
      jobId: job.jobId,
      kind: job.kind,
      status: "failed",
      ok: false,
      startedAt,
      finishedAt,
      durationMs: Math.max(0, Date.parse(finishedAt) - Date.parse(startedAt)),
      safeSummary: safeError.safeMessage,
      data: { errorCode: safeError.code },
      error: safeError,
    };
  }
}
