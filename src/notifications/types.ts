import type { SafeError } from "../errors/errorTaxonomy.js";
import type { PermissionCheckResult, PermissionSubjectKind } from "../permissions/types.js";
import type { RedactionMetadata } from "../privacy/redactionEngine.js";
import type { ProjectIdentity } from "../supervisor/types.js";

export const NOTIFICATION_STORE_VERSION = "1.0";

export type NotificationKind =
  | "job.succeeded"
  | "job.failed"
  | "job.blocked"
  | "permission.blocked"
  | "channel.blocked"
  | "computer.dry_run"
  | "memory.retrieval"
  | "learning.export"
  | "supervisor.recommendation"
  | "system.info";

export type NotificationSeverity = "info" | "warning" | "error" | "critical";

export type NotificationSource =
  | "cli"
  | "job"
  | "scheduler"
  | "system"
  | "supervisor"
  | "memory"
  | "learning"
  | "permission"
  | "channel"
  | "computer";

export interface NotificationLinks {
  jobIds: string[];
  proposalIds: string[];
  traceIds: string[];
  memoryEntryIds: string[];
  docs: string[];
}

export interface NotificationDeliveryPolicy {
  localInbox: true;
  whatsapp: false;
  omi: false;
  email: false;
  api: false;
  desktop: false;
  blockedExternalTargets: string[];
  reason: string;
}

export interface NotificationRecord {
  notificationId: string;
  version: typeof NOTIFICATION_STORE_VERSION;
  projectId: string;
  projectName: string;
  projectRootHash: string;
  createdAt: string;
  updatedAt: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  summary: string;
  source: NotificationSource;
  links: NotificationLinks;
  redaction: RedactionMetadata;
  readAt: string | null;
  dismissedAt: string | null;
  expiresAt: string | null;
  deliveryPolicy: NotificationDeliveryPolicy;
  correlationId: string | null;
}

export interface NotificationStoreData {
  version: typeof NOTIFICATION_STORE_VERSION;
  notifications: NotificationRecord[];
  lastUpdatedAt: string | null;
}

export interface AppendNotificationInput {
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  summary: string;
  source?: NotificationSource;
  subjectKind: PermissionSubjectKind;
  subjectHash: string;
  projectRoot?: string;
  links?: Partial<NotificationLinks>;
  expiresAt?: string | null;
  correlationId?: string | null;
  createdAt?: string;
}

export interface AppendNotificationResult {
  notification: NotificationRecord | null;
  stored: boolean;
  persisted: boolean;
  permission: PermissionCheckResult;
  error: SafeError | null;
}

export interface NotificationStats {
  total: number;
  unread: number;
  dismissed: number;
  byKind: Partial<Record<NotificationKind, number>>;
  bySeverity: Partial<Record<NotificationSeverity, number>>;
}

export type NotificationProjectIdentity = Pick<
  ProjectIdentity,
  "projectId" | "projectName" | "projectRootHash"
>;
