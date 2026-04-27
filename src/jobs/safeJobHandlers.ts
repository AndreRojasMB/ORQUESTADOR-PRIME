import { getRecentPermissionAudit, getPermissionAuditStats } from "../permissions/permissionAuditStore.js";
import { buildSupervisorAdvisoryReport } from "../supervisor/advisoryReport.js";
import { listToolRegistry } from "../tools/registry.js";
import { retrieveMemoryV2 } from "../memory/memoryV2Retrieval.js";
import type { MemoryV2EntryType, MemoryV2RetrievalQuery } from "../memory/memoryV2Types.js";
import { appendNotification } from "../notifications/notificationStore.js";
import type {
  NotificationKind,
  NotificationSeverity,
} from "../notifications/types.js";
import type { JobRecord, JobResultSummary } from "./types.js";

const VALID_MEMORY_TYPES = new Set<MemoryV2EntryType>([
  "run-summary",
  "project-goal",
  "decision",
  "preference",
  "constraint",
  "risk",
  "integration-note",
  "external-note",
  "learning-summary",
]);

const VALID_NOTIFICATION_KINDS = new Set<NotificationKind>([
  "job.succeeded",
  "job.failed",
  "job.blocked",
  "permission.blocked",
  "channel.blocked",
  "computer.dry_run",
  "memory.retrieval",
  "learning.export",
  "supervisor.recommendation",
  "system.info",
]);

const VALID_NOTIFICATION_SEVERITIES = new Set<NotificationSeverity>([
  "info",
  "warning",
  "error",
  "critical",
]);

function stringValue(input: Record<string, unknown>, key: string): string | null {
  const value = input[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function numberValue(input: Record<string, unknown>, key: string): number | null {
  const value = input[key];
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

function booleanValue(input: Record<string, unknown>, key: string): boolean | null {
  const value = input[key];
  return typeof value === "boolean" ? value : null;
}

function csvValue(input: Record<string, unknown>, key: string): string[] {
  const value = input[key];
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

function summary(
  safeMessage: string,
  data: Record<string, unknown> = {},
): JobResultSummary {
  return {
    ok: true,
    safeMessage,
    data,
  };
}

function blocked(safeMessage: string, data: Record<string, unknown> = {}): JobResultSummary {
  return {
    ok: false,
    safeMessage,
    data,
  };
}

export async function runSafeJobHandler(job: JobRecord): Promise<JobResultSummary> {
  if (job.kind === "supervisor.status") {
    const recentLimit = numberValue(job.safeInput, "recentLimit") ?? undefined;
    const report = await buildSupervisorAdvisoryReport({
      ...(recentLimit ? { recentLimit } : {}),
    });
    return summary("Supervisor advisory status generated.", {
      projectId: report.project.projectId,
      goals: report.goals.total,
      risks: report.risks.length,
      blockers: report.blockers.length,
      recommendations: report.recommendations.length,
    });
  }

  if (job.kind === "memory.v2.retrieve") {
    const queryText = stringValue(job.safeInput, "query");
    if (!queryText) {
      return blocked("Memory retrieval job requires a query.", {
        reason: "missing-query",
      });
    }

    const typeValue = stringValue(job.safeInput, "type");
    const query: MemoryV2RetrievalQuery = {
      query: queryText,
      tags: csvValue(job.safeInput, "tags"),
      includeV1Backfill: booleanValue(job.safeInput, "includeV1") ?? false,
      allowPrivate: booleanValue(job.safeInput, "allowPrivate") ?? false,
    };

    const limit = numberValue(job.safeInput, "limit");
    if (limit) {
      query.limit = limit;
    }
    if (typeValue && VALID_MEMORY_TYPES.has(typeValue as MemoryV2EntryType)) {
      query.type = typeValue as MemoryV2EntryType;
    }

    const response = await retrieveMemoryV2(query);
    return summary("Memory V2 retrieval completed.", {
      projectId: response.project.projectId,
      resultCount: response.results.length,
      totalCandidates: response.totalCandidates,
      filtered: response.filtered,
      topResults: response.results.slice(0, 3).map((result) => ({
        entryId: result.entryId,
        score: result.score,
        reasons: result.reasons,
        safeContext: result.safeContext,
      })),
    });
  }

  if (job.kind === "notification.create") {
    const title = stringValue(job.safeInput, "title");
    const message = stringValue(job.safeInput, "summary") ?? stringValue(job.safeInput, "message");
    if (!title || !message) {
      return blocked("Notification job requires title and summary.", {
        reason: "missing-notification-fields",
      });
    }

    const kindValue = stringValue(job.safeInput, "kind") ?? "system.info";
    const severityValue = stringValue(job.safeInput, "severity") ?? "info";
    if (!VALID_NOTIFICATION_KINDS.has(kindValue as NotificationKind)) {
      return blocked("Notification job has an unknown kind.", {
        reason: "unknown-notification-kind",
      });
    }
    if (!VALID_NOTIFICATION_SEVERITIES.has(severityValue as NotificationSeverity)) {
      return blocked("Notification job has an unknown severity.", {
        reason: "unknown-notification-severity",
      });
    }

    const kind = kindValue as NotificationKind;
    const severity = severityValue as NotificationSeverity;
    const result = await appendNotification({
      kind,
      severity,
      title,
      summary: message,
      source: "job",
      subjectKind: job.subjectKind,
      subjectHash: job.subjectHash,
      links: { jobIds: [job.jobId] },
      correlationId: job.correlationId,
    });

    if (!result.stored || !result.notification) {
      return blocked(result.error?.safeMessage ?? "Notification was blocked.", {
        permission: result.permission.reasonCode,
      });
    }

    return summary("Local notification stored.", {
      notificationId: result.notification.notificationId,
      persisted: result.persisted,
      kind: result.notification.kind,
      severity: result.notification.severity,
    });
  }

  if (job.kind === "tool.registry.inspect") {
    const entries = listToolRegistry();
    return summary("Tool registry inspected.", {
      total: entries.length,
      toolIds: entries.map((entry) => entry.toolId),
    });
  }

  if (job.kind === "permission.audit.inspect") {
    const limit = numberValue(job.safeInput, "limit") ?? 10;
    const [stats, recent] = await Promise.all([
      getPermissionAuditStats(),
      getRecentPermissionAudit(limit),
    ]);
    return summary("Permission audit inspected.", {
      stats,
      recentCount: recent.length,
      recent: recent.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        decision: entry.decision,
        reasonCode: entry.reasonCode,
        subjectKind: entry.subjectKind,
        toolId: entry.toolId,
        capability: entry.capability,
      })),
    });
  }

  if (job.kind === "learning.export") {
    return blocked("Learning export jobs are blocked in this first queue slice.", {
      reason: "learning-export-job-not-enabled",
    });
  }

  return blocked("Job kind is not supported by safe handlers.", {
    reason: "unsupported-job-kind",
  });
}
