import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { createSafeError } from "../errors/errorTaxonomy.js";
import { logger } from "../observability/logger.js";
import { checkPermission } from "../permissions/permissionChecker.js";
import {
  redactString,
  type RedactionMetadata,
} from "../privacy/redactionEngine.js";
import { deriveProjectIdentity } from "../supervisor/projectIdentity.js";
import { createLocalInboxDeliveryPolicy } from "./deliveryPolicy.js";
import {
  NOTIFICATION_STORE_VERSION,
  type AppendNotificationInput,
  type AppendNotificationResult,
  type NotificationLinks,
  type NotificationProjectIdentity,
  type NotificationRecord,
  type NotificationSource,
  type NotificationStats,
  type NotificationStoreData,
} from "./types.js";

const DATA_DIR = join(homedir(), ".orquestador-prime");
const NOTIFICATIONS_FILE = join(DATA_DIR, "notifications.json");
const MAX_NOTIFICATION_RECORDS = 1000;

const EMPTY_LINKS: NotificationLinks = {
  jobIds: [],
  proposalIds: [],
  traceIds: [],
  memoryEntryIds: [],
  docs: [],
};

const EMPTY_STORE: NotificationStoreData = {
  version: NOTIFICATION_STORE_VERSION,
  notifications: [],
  lastUpdatedAt: null,
};

function generateNotificationId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `ntf_${ts}_${rand}`;
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

function mergeRedaction(items: RedactionMetadata[]): RedactionMetadata {
  const removedKinds = [...new Set(items.flatMap((item) => item.removedKinds))].sort();
  const first = items[0];
  return {
    removedKinds,
    containsSecrets: items.some((item) => item.containsSecrets),
    containsRawIdentity: items.some((item) => item.containsRawIdentity),
    containsRawBody: items.some((item) => item.containsRawBody),
    containsFileContent: items.some((item) => item.containsFileContent),
    truncated: items.some((item) => item.truncated),
    redactionVersion: first?.redactionVersion ?? "1.0",
  };
}

function cloneLinks(links: NotificationLinks): NotificationLinks {
  return {
    jobIds: links.jobIds.slice(),
    proposalIds: links.proposalIds.slice(),
    traceIds: links.traceIds.slice(),
    memoryEntryIds: links.memoryEntryIds.slice(),
    docs: links.docs.slice(),
  };
}

function normalizeLinks(input?: Partial<NotificationLinks>): NotificationLinks {
  return {
    jobIds: input?.jobIds?.slice() ?? [],
    proposalIds: input?.proposalIds?.slice() ?? [],
    traceIds: input?.traceIds?.slice() ?? [],
    memoryEntryIds: input?.memoryEntryIds?.slice() ?? [],
    docs: input?.docs?.slice() ?? [],
  };
}

function cloneNotification(notification: NotificationRecord): NotificationRecord {
  return {
    notificationId: notification.notificationId,
    version: notification.version,
    projectId: notification.projectId,
    projectName: notification.projectName,
    projectRootHash: notification.projectRootHash,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
    kind: notification.kind,
    severity: notification.severity,
    title: notification.title,
    summary: notification.summary,
    source: notification.source,
    links: cloneLinks(notification.links),
    redaction: cloneRedaction(notification.redaction),
    readAt: notification.readAt,
    dismissedAt: notification.dismissedAt,
    expiresAt: notification.expiresAt,
    deliveryPolicy: {
      ...notification.deliveryPolicy,
      blockedExternalTargets: notification.deliveryPolicy.blockedExternalTargets.slice(),
    },
    correlationId: notification.correlationId,
  };
}

function notificationChannel(source: NotificationSource): "cli" | "system" | "dashboard" {
  if (source === "cli") {
    return "cli";
  }
  return "system";
}

function projectFields(identity: NotificationProjectIdentity): NotificationProjectIdentity {
  return {
    projectId: identity.projectId,
    projectName: identity.projectName,
    projectRootHash: identity.projectRootHash,
  };
}

export async function readNotificationStore(): Promise<NotificationStoreData> {
  try {
    const raw = await readFile(NOTIFICATIONS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as NotificationStoreData;
    if (
      parsed.version !== NOTIFICATION_STORE_VERSION ||
      !Array.isArray(parsed.notifications)
    ) {
      return { ...EMPTY_STORE, notifications: [] };
    }
    return {
      version: NOTIFICATION_STORE_VERSION,
      notifications: parsed.notifications.map(cloneNotification),
      lastUpdatedAt: parsed.lastUpdatedAt ?? null,
    };
  } catch {
    return { ...EMPTY_STORE, notifications: [] };
  }
}

export async function writeNotificationStore(
  store: NotificationStoreData,
): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const normalized: NotificationStoreData = {
      version: NOTIFICATION_STORE_VERSION,
      notifications: store.notifications
        .slice(-MAX_NOTIFICATION_RECORDS)
        .map(cloneNotification),
      lastUpdatedAt: now,
    };
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(
      NOTIFICATIONS_FILE,
      JSON.stringify(normalized, null, 2),
      "utf-8",
    );
    return true;
  } catch (err) {
    logger.warn("notification store write failed - continuing without persistence", {
      error: String(err),
    });
    return false;
  }
}

export async function appendNotification(
  input: AppendNotificationInput,
): Promise<AppendNotificationResult> {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const source = input.source ?? "cli";
  const identity = deriveProjectIdentity(input.projectRoot);

  const permission = await checkPermission(
    {
      subjectKind: input.subjectKind,
      subjectHash: input.subjectHash,
      projectId: identity.projectId,
      toolId: "notification.inbox.create",
      capability: "notification.inbox.create",
      category: "notification",
      operation: "notification.create",
      channel: notificationChannel(source),
      dryRun: true,
      networkAccess: false,
      scopes: ["notification.inbox.create"],
      correlationId: input.correlationId ?? null,
    },
    { appendAudit: true },
  );

  if (!permission.allowed) {
    return {
      notification: null,
      stored: false,
      persisted: false,
      permission,
      error: createSafeError("permission.denied", {
        correlationId: input.correlationId ?? null,
        safeMessage: permission.safeMessage,
      }),
    };
  }

  const title = redactString(input.title, { maxLength: 140 });
  const summary = redactString(input.summary, { maxLength: 500 });
  const redaction = mergeRedaction([title.metadata, summary.metadata]);

  if (redaction.containsRawBody || redaction.containsFileContent) {
    return {
      notification: null,
      stored: false,
      persisted: false,
      permission,
      error: createSafeError("redaction.unsafe", {
        correlationId: input.correlationId ?? null,
        safeMessage: "Notification content contains data that cannot be stored safely.",
      }),
    };
  }

  const project = projectFields(identity);
  const notification: NotificationRecord = {
    notificationId: generateNotificationId(),
    version: NOTIFICATION_STORE_VERSION,
    projectId: project.projectId,
    projectName: project.projectName,
    projectRootHash: project.projectRootHash,
    createdAt,
    updatedAt: createdAt,
    kind: input.kind,
    severity: input.severity,
    title: title.safePreview,
    summary: summary.safePreview,
    source,
    links: normalizeLinks(input.links ?? EMPTY_LINKS),
    redaction,
    readAt: null,
    dismissedAt: null,
    expiresAt: input.expiresAt ?? null,
    deliveryPolicy: createLocalInboxDeliveryPolicy(),
    correlationId: input.correlationId ?? null,
  };

  const store = await readNotificationStore();
  store.notifications.push(notification);
  const persisted = await writeNotificationStore(store);

  return {
    notification: cloneNotification(notification),
    stored: true,
    persisted,
    permission,
    error: persisted
      ? null
      : createSafeError("store.write_failed", {
          correlationId: input.correlationId ?? null,
          source: "notificationStore",
        }),
  };
}

export async function getRecentNotifications(
  n = 50,
): Promise<NotificationRecord[]> {
  const store = await readNotificationStore();
  return store.notifications.slice(-n).map(cloneNotification);
}

export async function getUnreadNotifications(
  n = 50,
): Promise<NotificationRecord[]> {
  const store = await readNotificationStore();
  return store.notifications
    .filter((notification) => !notification.readAt && !notification.dismissedAt)
    .slice(-n)
    .map(cloneNotification);
}

export async function getNotificationStats(): Promise<NotificationStats> {
  const store = await readNotificationStore();
  const stats: NotificationStats = {
    total: store.notifications.length,
    unread: 0,
    dismissed: 0,
    byKind: {},
    bySeverity: {},
  };

  for (const notification of store.notifications) {
    if (!notification.readAt && !notification.dismissedAt) {
      stats.unread++;
    }
    if (notification.dismissedAt) {
      stats.dismissed++;
    }
    stats.byKind[notification.kind] = (stats.byKind[notification.kind] ?? 0) + 1;
    stats.bySeverity[notification.severity] =
      (stats.bySeverity[notification.severity] ?? 0) + 1;
  }

  return stats;
}

export function getNotificationsPath(): string {
  return NOTIFICATIONS_FILE;
}
