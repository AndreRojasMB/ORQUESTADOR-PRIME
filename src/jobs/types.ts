import type { SafeError, SafeErrorCode } from "../errors/errorTaxonomy.js";
import type { PermissionCheckResult, PermissionSubjectKind } from "../permissions/types.js";
import type { RedactionMetadata } from "../privacy/redactionEngine.js";
import type { ProjectIdentity } from "../supervisor/types.js";
import type { ToolCapability } from "../tools/types.js";

export const JOB_STORE_VERSION = "1.0";

export type JobStatus =
  | "queued"
  | "scheduled"
  | "running"
  | "succeeded"
  | "failed"
  | "blocked"
  | "cancelled"
  | "expired";

export type SafeJobKind =
  | "supervisor.status"
  | "memory.v2.retrieve"
  | "learning.export"
  | "notification.create"
  | "tool.registry.inspect"
  | "permission.audit.inspect";

export type DangerousJobKind =
  | "action.dispatch"
  | "repo.file_write.real"
  | "repo.git_branch.real"
  | "computer.action.real"
  | "external.notification.deliver"
  | "arbitrary.shell";

export type JobKind = SafeJobKind | DangerousJobKind;

export const SAFE_JOB_KINDS = [
  "supervisor.status",
  "memory.v2.retrieve",
  "learning.export",
  "notification.create",
  "tool.registry.inspect",
  "permission.audit.inspect",
] as const satisfies readonly SafeJobKind[];

export const DANGEROUS_JOB_KINDS = [
  "action.dispatch",
  "repo.file_write.real",
  "repo.git_branch.real",
  "computer.action.real",
  "external.notification.deliver",
  "arbitrary.shell",
] as const satisfies readonly DangerousJobKind[];

export type JobSource =
  | "cli"
  | "dashboard"
  | "system"
  | "scheduler"
  | "whatsapp"
  | "omi"
  | "openclaw"
  | "api";

export type JobLogEvent =
  | "created"
  | "permission-blocked"
  | "policy-blocked"
  | "started"
  | "completed"
  | "failed"
  | "expired"
  | "cancelled";

export interface JobLogEntry {
  timestamp: string;
  event: JobLogEvent;
  safeMessage: string;
  errorCode: SafeErrorCode | string | null;
  redaction: RedactionMetadata | null;
  relatedId: string | null;
}

export interface JobResultSummary {
  ok: boolean;
  safeMessage: string;
  data: Record<string, unknown>;
}

export interface JobRecord {
  jobId: string;
  version: typeof JOB_STORE_VERSION;
  projectId: string;
  projectName: string;
  projectRootHash: string;
  createdAt: string;
  updatedAt: string;
  runAt: string;
  expiresAt: string | null;
  status: JobStatus;
  kind: JobKind;
  toolId: string | null;
  capability: ToolCapability | null;
  requestedBy: string;
  subjectKind: PermissionSubjectKind;
  subjectHash: string;
  source: JobSource;
  inputPreview: string;
  inputHash: string;
  safeInput: Record<string, unknown>;
  redaction: RedactionMetadata;
  permissionGrantId: string | null;
  attempts: number;
  maxAttempts: number;
  lastErrorCode: SafeErrorCode | string | null;
  resultSummary: JobResultSummary | null;
  logs: JobLogEntry[];
  correlationId: string | null;
}

export interface JobStoreData {
  version: typeof JOB_STORE_VERSION;
  jobs: JobRecord[];
  lastUpdatedAt: string | null;
}

export interface AppendJobInput {
  kind: JobKind;
  input?: Record<string, unknown>;
  subjectKind: PermissionSubjectKind;
  subjectHash: string;
  source?: JobSource;
  requestedBy?: string;
  projectRoot?: string;
  runAt?: string;
  expiresAt?: string | null;
  maxAttempts?: number;
  correlationId?: string | null;
  createdAt?: string;
}

export interface AppendJobResult {
  job: JobRecord;
  enqueued: boolean;
  persisted: boolean;
  permission: PermissionCheckResult;
}

export interface UpdateJobStatusInput {
  jobId: string;
  status: JobStatus;
  resultSummary?: JobResultSummary | null;
  lastErrorCode?: SafeErrorCode | string | null;
  attempts?: number;
  log?: JobLogEntry;
  updatedAt?: string;
}

export interface JobRunResult {
  jobId: string;
  kind: JobKind;
  status: JobStatus;
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  safeSummary: string;
  data: Record<string, unknown>;
  error: SafeError | null;
}

export interface JobStats {
  total: number;
  byStatus: Partial<Record<JobStatus, number>>;
  byKind: Partial<Record<JobKind, number>>;
}

export type JobProjectIdentity = Pick<
  ProjectIdentity,
  "projectId" | "projectName" | "projectRootHash"
>;
