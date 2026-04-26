// src/actions/channelAuditStore.ts
// Append-only log of external channel safety decisions.
// Location: ~/.orquestador-prime/channel-audit.json
// Phase 33C — store/types only; no proposal or dispatch bridge wiring.

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { logger } from "../observability/logger.js";
import type {
  ActionCategory,
  ChannelAuditDecision,
  ChannelAuditEntry,
  ChannelAuditReasonCode,
  ChannelAuditStats,
  ChannelAuditStoreData,
  ChannelIdentity,
  ChannelOperation,
  ChannelPermissionSnapshot,
} from "./types.js";

// ─── Constants ──────────────────────────────────────────────────

const DATA_DIR = join(homedir(), ".orquestador-prime");
const CHANNEL_AUDIT_FILE = join(DATA_DIR, "channel-audit.json");
const MAX_CHANNEL_AUDIT_ENTRIES = 1000;

const EMPTY_STORE: ChannelAuditStoreData = {
  version: "1.0",
  entries: [],
};

type ChannelAuditIdentity = Pick<
  ChannelIdentity,
  | "channel"
  | "principalHash"
  | "trusted"
  | "trustReason"
  | "authMethod"
  | "sourceEventId"
>;

// ─── Store I/O ──────────────────────────────────────────────────

async function readChannelAuditStore(): Promise<ChannelAuditStoreData> {
  try {
    const raw = await readFile(CHANNEL_AUDIT_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ChannelAuditStoreData;
    if (!Array.isArray(parsed.entries)) {
      return { ...EMPTY_STORE, entries: [] };
    }
    return parsed;
  } catch {
    return { ...EMPTY_STORE, entries: [] };
  }
}

async function writeChannelAuditStore(
  store: ChannelAuditStoreData,
): Promise<boolean> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(CHANNEL_AUDIT_FILE, JSON.stringify(store, null, 2), "utf-8");
    return true;
  } catch (err) {
    logger.warn("channel-audit store write failed — continuing without persistence", {
      error: String(err),
    });
    return false;
  }
}

// ─── ID generation ──────────────────────────────────────────────

function generateChannelAuditId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `cha_${ts}_${rand}`;
}

function clonePermissionSnapshot(
  snapshot: ChannelPermissionSnapshot,
): ChannelPermissionSnapshot {
  return {
    canCreateProposal: snapshot.canCreateProposal,
    canRequestReview: snapshot.canRequestReview,
    canListPending: snapshot.canListPending,
    canGrantSecondApproval: snapshot.canGrantSecondApproval,
    canDispatchApproved: snapshot.canDispatchApproved,
    allowedProposalCategories: snapshot.allowedProposalCategories.slice(),
    allowedDispatchCategories: snapshot.allowedDispatchCategories.slice(),
    forbiddenCategories: snapshot.forbiddenCategories.slice(),
    maxProposalsPerHour: snapshot.maxProposalsPerHour,
    maxDispatchesPerHour: snapshot.maxDispatchesPerHour,
  };
}

// ─── Append ─────────────────────────────────────────────────────

export interface AppendChannelAuditInput {
  identity: ChannelAuditIdentity;
  operation: ChannelOperation;
  decision: ChannelAuditDecision;
  reasonCode: ChannelAuditReasonCode;
  reason: string;
  category?: ActionCategory | null;
  proposalId?: string | null;
  correlationId?: string | null;
  runId?: string | null;
  realExecutionEnabled?: boolean | null;
  secondApprovalId?: string | null;
  executionResultId?: string | null;
  permissionSnapshot?: ChannelPermissionSnapshot;
  timestamp?: string;
}

export async function appendChannelAudit(
  input: AppendChannelAuditInput,
): Promise<{ entry: ChannelAuditEntry; persisted: boolean }> {
  const entry: ChannelAuditEntry = {
    id: generateChannelAuditId(),
    timestamp: input.timestamp ?? new Date().toISOString(),
    decision: input.decision,
    reasonCode: input.reasonCode,
    reason: input.reason,
    channel: input.identity.channel,
    principalHash: input.identity.principalHash,
    trusted: input.identity.trusted,
    trustReason: input.identity.trustReason,
    authMethod: input.identity.authMethod,
    operation: input.operation,
    category: input.category ?? null,
    proposalId: input.proposalId ?? null,
    sourceEventId: input.identity.sourceEventId,
    correlationId: input.correlationId ?? null,
    runId: input.runId ?? null,
    realExecutionEnabled: input.realExecutionEnabled ?? null,
    secondApprovalId: input.secondApprovalId ?? null,
    executionResultId: input.executionResultId ?? null,
  };

  if (input.permissionSnapshot) {
    entry.permissionSnapshot = clonePermissionSnapshot(input.permissionSnapshot);
  }

  const store = await readChannelAuditStore();
  store.entries.push(entry);

  if (store.entries.length > MAX_CHANNEL_AUDIT_ENTRIES) {
    store.entries = store.entries.slice(-MAX_CHANNEL_AUDIT_ENTRIES);
  }

  const persisted = await writeChannelAuditStore(store);
  logger.info("channel-audit decision appended", {
    id: entry.id,
    channel: entry.channel,
    operation: entry.operation,
    category: entry.category,
    decision: entry.decision,
    reasonCode: entry.reasonCode,
    persisted,
  });

  return { entry, persisted };
}

// ─── Queries ────────────────────────────────────────────────────

export async function getRecentChannelAudit(
  n = 50,
): Promise<ChannelAuditEntry[]> {
  const store = await readChannelAuditStore();
  return store.entries.slice(-n);
}

export async function getChannelAuditStats(): Promise<ChannelAuditStats> {
  const store = await readChannelAuditStore();
  const stats: ChannelAuditStats = {
    total: store.entries.length,
    allowed: 0,
    blocked: 0,
    byChannel: {},
    byOperation: {},
    byReasonCode: {},
  };

  for (const entry of store.entries) {
    if (entry.decision === "allowed") {
      stats.allowed++;
    } else {
      stats.blocked++;
    }

    stats.byChannel[entry.channel] = (stats.byChannel[entry.channel] ?? 0) + 1;
    stats.byOperation[entry.operation] =
      (stats.byOperation[entry.operation] ?? 0) + 1;
    stats.byReasonCode[entry.reasonCode] =
      (stats.byReasonCode[entry.reasonCode] ?? 0) + 1;
  }

  return stats;
}

// ─── Store path ─────────────────────────────────────────────────

export function getChannelAuditPath(): string {
  return CHANNEL_AUDIT_FILE;
}
