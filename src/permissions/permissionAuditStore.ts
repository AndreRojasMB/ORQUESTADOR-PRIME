import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { logger } from "../observability/logger.js";
import {
  PERMISSION_AUDIT_STORE_VERSION,
  type PermissionAuditEntry,
  type PermissionAuditStats,
  type PermissionAuditStoreData,
} from "./types.js";

const DATA_DIR = join(homedir(), ".orquestador-prime");
const PERMISSION_AUDIT_FILE = join(DATA_DIR, "permission-audit.json");
const MAX_PERMISSION_AUDIT_ENTRIES = 1000;

const EMPTY_STORE: PermissionAuditStoreData = {
  version: PERMISSION_AUDIT_STORE_VERSION,
  entries: [],
};

function generateAuditId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `paud_${ts}_${rand}`;
}

function cloneAuditEntry(entry: PermissionAuditEntry): PermissionAuditEntry {
  return {
    id: entry.id,
    timestamp: entry.timestamp,
    decision: entry.decision,
    reasonCode: entry.reasonCode,
    safeMessage: entry.safeMessage,
    subjectKind: entry.subjectKind,
    subjectHash: entry.subjectHash,
    projectId: entry.projectId,
    toolId: entry.toolId,
    capability: entry.capability,
    category: entry.category,
    channel: entry.channel,
    operation: entry.operation,
    matchedGrantId: entry.matchedGrantId,
    grantStatus: entry.grantStatus,
    correlationId: entry.correlationId,
    jobId: entry.jobId,
    proposalId: entry.proposalId,
  };
}

export async function readPermissionAuditStore(): Promise<PermissionAuditStoreData> {
  try {
    const raw = await readFile(PERMISSION_AUDIT_FILE, "utf-8");
    const parsed = JSON.parse(raw) as PermissionAuditStoreData;

    if (
      parsed.version !== PERMISSION_AUDIT_STORE_VERSION ||
      !Array.isArray(parsed.entries)
    ) {
      return { ...EMPTY_STORE, entries: [] };
    }

    return {
      version: PERMISSION_AUDIT_STORE_VERSION,
      entries: parsed.entries.map(cloneAuditEntry),
    };
  } catch {
    return { ...EMPTY_STORE, entries: [] };
  }
}

async function writePermissionAuditStore(
  store: PermissionAuditStoreData,
): Promise<boolean> {
  try {
    const normalized: PermissionAuditStoreData = {
      version: PERMISSION_AUDIT_STORE_VERSION,
      entries: store.entries
        .slice(-MAX_PERMISSION_AUDIT_ENTRIES)
        .map(cloneAuditEntry),
    };
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(
      PERMISSION_AUDIT_FILE,
      JSON.stringify(normalized, null, 2),
      "utf-8",
    );
    return true;
  } catch (err) {
    logger.warn("permission audit store write failed — continuing without persistence", {
      error: String(err),
    });
    return false;
  }
}

export async function appendPermissionAudit(
  input: Omit<PermissionAuditEntry, "id" | "timestamp"> & {
    timestamp?: string;
  },
): Promise<{ entry: PermissionAuditEntry; persisted: boolean }> {
  const entry: PermissionAuditEntry = {
    id: generateAuditId(),
    timestamp: input.timestamp ?? new Date().toISOString(),
    decision: input.decision,
    reasonCode: input.reasonCode,
    safeMessage: input.safeMessage,
    subjectKind: input.subjectKind,
    subjectHash: input.subjectHash,
    projectId: input.projectId,
    toolId: input.toolId,
    capability: input.capability,
    category: input.category,
    channel: input.channel,
    operation: input.operation,
    matchedGrantId: input.matchedGrantId,
    grantStatus: input.grantStatus,
    correlationId: input.correlationId,
    jobId: input.jobId,
    proposalId: input.proposalId,
  };

  const store = await readPermissionAuditStore();
  store.entries.push(entry);
  const persisted = await writePermissionAuditStore(store);

  return { entry: cloneAuditEntry(entry), persisted };
}

export async function getRecentPermissionAudit(
  n = 50,
): Promise<PermissionAuditEntry[]> {
  const store = await readPermissionAuditStore();
  return store.entries.slice(-n).map(cloneAuditEntry);
}

export async function getPermissionAuditStats(): Promise<PermissionAuditStats> {
  const store = await readPermissionAuditStore();
  const stats: PermissionAuditStats = {
    total: store.entries.length,
    allowed: 0,
    blocked: 0,
    byReasonCode: {},
    bySubjectKind: {},
  };

  for (const entry of store.entries) {
    if (entry.decision === "allowed") {
      stats.allowed++;
    } else {
      stats.blocked++;
    }
    stats.byReasonCode[entry.reasonCode] =
      (stats.byReasonCode[entry.reasonCode] ?? 0) + 1;
    if (entry.subjectKind) {
      stats.bySubjectKind[entry.subjectKind] =
        (stats.bySubjectKind[entry.subjectKind] ?? 0) + 1;
    }
  }

  return stats;
}

export function getPermissionAuditPath(): string {
  return PERMISSION_AUDIT_FILE;
}
