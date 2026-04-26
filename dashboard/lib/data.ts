// dashboard/lib/data.ts
// Filesystem data access for the dashboard.
// Reads memory.json and config.json from the orchestrator data directory.
// All functions are async, never throw, and return typed defaults on error.
// Designed for use in Server Components and Server Actions only.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import type {
  MemoryStore,
  MemoryEntry,
  UserConfig,
  TrajectoryStore,
  Trajectory,
  ActionStoreData,
  ActionProposal,
  ChannelAuditEntry,
  ChannelAuditStoreData,
  ChannelAuditStats,
  ExecutionResult,
  ExecutionResultStoreData,
  SecondApproval,
  SecondApprovalStoreData,
} from "./types";
import {
  EMPTY_MEMORY_STORE,
  EMPTY_TRAJECTORY_STORE,
  EMPTY_ACTION_STORE,
  EMPTY_CHANNEL_AUDIT_STORE,
  EMPTY_EXECUTION_RESULT_STORE,
  EMPTY_SECOND_APPROVAL_STORE,
  DEFAULT_USER_CONFIG,
} from "./types";

// ─── Data directory ─────────────────────────────────────────────

function getDataDir(): string {
  return process.env.ORQUESTADOR_DATA_DIR ?? join(homedir(), ".orquestador-prime");
}

function memoryPath(): string {
  return join(getDataDir(), "memory.json");
}

function configPath(): string {
  return join(getDataDir(), "config.json");
}

// ─── Safe JSON reader ───────────────────────────────────────────

async function readJsonFile<T>(path: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ─── Memory ─────────────────────────────────────────────────────

export async function readMemoryStore(): Promise<MemoryStore> {
  const store = await readJsonFile<MemoryStore>(memoryPath(), { ...EMPTY_MEMORY_STORE, entries: [] });

  // Defensive: ensure entries is always an array
  if (!Array.isArray(store.entries)) {
    store.entries = [];
  }

  return store;
}

export async function getRecentEntries(n = 5): Promise<MemoryEntry[]> {
  const store = await readMemoryStore();
  return store.entries.slice(-n).reverse();
}

export async function getEntryById(id: string): Promise<MemoryEntry | null> {
  const store = await readMemoryStore();
  return store.entries.find((e) => e.id === id) ?? null;
}

// ─── Trajectories ───────────────────────────────────────────────

function trajectoryPath(): string {
  return join(getDataDir(), "trajectories.json");
}

export async function readTrajectoryStore(): Promise<TrajectoryStore> {
  const store = await readJsonFile<TrajectoryStore>(trajectoryPath(), {
    ...EMPTY_TRAJECTORY_STORE,
    trajectories: [],
  });

  if (!Array.isArray(store.trajectories)) {
    store.trajectories = [];
  }

  return store;
}

export async function getTrajectories(): Promise<Trajectory[]> {
  const store = await readTrajectoryStore();
  return store.trajectories;
}

export async function getTrajectoryById(id: string): Promise<Trajectory | null> {
  const store = await readTrajectoryStore();
  return store.trajectories.find((t) => t.id === id) ?? null;
}

export async function getTrajectoryByTraceId(traceId: string): Promise<Trajectory | null> {
  const store = await readTrajectoryStore();
  return store.trajectories.find((t) => t.traceId === traceId) ?? null;
}

// ─── Actions ────────────────────────────────────────────────────

function actionPath(): string {
  return join(getDataDir(), "actions.json");
}

function channelAuditPath(): string {
  return join(getDataDir(), "channel-audit.json");
}

export async function readActionStore(): Promise<ActionStoreData> {
  const store = await readJsonFile<ActionStoreData>(actionPath(), {
    ...EMPTY_ACTION_STORE,
    proposals: [],
  });

  if (!Array.isArray(store.proposals)) {
    store.proposals = [];
  }

  return store;
}

export async function getActions(): Promise<ActionProposal[]> {
  const store = await readActionStore();
  return store.proposals;
}

export async function getActionsByTraceId(traceId: string): Promise<ActionProposal[]> {
  const store = await readActionStore();
  return store.proposals.filter((p) => p.traceId === traceId);
}

export async function getActionsByTrajectoryId(trajectoryId: string): Promise<ActionProposal[]> {
  const store = await readActionStore();
  return store.proposals.filter((p) => p.trajectoryId === trajectoryId);
}

// ─── Channel audit ──────────────────────────────────────────────

export async function readChannelAuditStore(): Promise<ChannelAuditStoreData> {
  const store = await readJsonFile<ChannelAuditStoreData>(channelAuditPath(), {
    ...EMPTY_CHANNEL_AUDIT_STORE,
    entries: [],
  });

  if (!Array.isArray(store.entries)) {
    store.entries = [];
  }

  return store;
}

export async function getChannelAuditEntries(): Promise<ChannelAuditEntry[]> {
  const store = await readChannelAuditStore();
  return store.entries;
}

export async function getRecentChannelAudit(n = 50): Promise<ChannelAuditEntry[]> {
  const store = await readChannelAuditStore();
  return store.entries.slice(-n).reverse();
}

export async function getDashboardChannelAuditStats(): Promise<ChannelAuditStats> {
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
    if (entry.decision === "allowed") stats.allowed++;
    else stats.blocked++;

    stats.byChannel[entry.channel] = (stats.byChannel[entry.channel] ?? 0) + 1;
    stats.byOperation[entry.operation] =
      (stats.byOperation[entry.operation] ?? 0) + 1;
    stats.byReasonCode[entry.reasonCode] =
      (stats.byReasonCode[entry.reasonCode] ?? 0) + 1;
  }

  return stats;
}

// ─── Execution results ──────────────────────────────────────────

function actionExecutionsPath(): string {
  return join(getDataDir(), "action-executions.json");
}

export async function readExecutionResultStore(): Promise<ExecutionResultStoreData> {
  const store = await readJsonFile<ExecutionResultStoreData>(actionExecutionsPath(), {
    ...EMPTY_EXECUTION_RESULT_STORE,
    results: [],
  });

  if (!Array.isArray(store.results)) {
    store.results = [];
  }

  return store;
}

export async function getExecutionResults(): Promise<ExecutionResult[]> {
  const store = await readExecutionResultStore();
  return store.results;
}

export async function getExecutionResultsByProposalId(
  proposalId: string,
): Promise<ExecutionResult[]> {
  const store = await readExecutionResultStore();
  return store.results.filter((r) => r.proposalId === proposalId);
}

export async function getRecentExecutionResults(n = 10): Promise<ExecutionResult[]> {
  const store = await readExecutionResultStore();
  return store.results.slice(-n).reverse();
}

// ─── Second approvals ───────────────────────────────────────────

function secondApprovalsPath(): string {
  return join(getDataDir(), "action-second-approvals.json");
}

export async function readSecondApprovalStore(): Promise<SecondApprovalStoreData> {
  const store = await readJsonFile<SecondApprovalStoreData>(secondApprovalsPath(), {
    ...EMPTY_SECOND_APPROVAL_STORE,
    approvals: [],
  });

  if (!Array.isArray(store.approvals)) {
    store.approvals = [];
  }

  return store;
}

export async function getSecondApprovals(): Promise<SecondApproval[]> {
  const store = await readSecondApprovalStore();
  return store.approvals;
}

export async function getSecondApprovalsByProposalId(
  proposalId: string,
): Promise<SecondApproval[]> {
  const store = await readSecondApprovalStore();
  return store.approvals.filter((a) => a.proposalId === proposalId);
}

export async function getActiveSecondApprovals(
  now: number = Date.now(),
): Promise<SecondApproval[]> {
  const store = await readSecondApprovalStore();
  return store.approvals.filter(
    (a) => a.status === "granted" && Date.parse(a.expiresAt) > now,
  );
}

// ─── Feature flag surface (read-only) ───────────────────────────

export function getRealExecutionEnabled(): boolean {
  return process.env.ACTIONS_REAL_EXECUTION_ENABLED === "true";
}

// ─── Config ─────────────────────────────────────────────────────

export async function readConfig(): Promise<UserConfig> {
  const partial = await readJsonFile<Partial<UserConfig>>(configPath(), {});
  return mergeWithDefaults(partial);
}

export async function writeConfig(config: UserConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    const dir = getDataDir();
    await mkdir(dir, { recursive: true });
    await writeFile(configPath(), JSON.stringify(config, null, 2), "utf-8");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─── Config merge (mirrors src/config/userConfigStore.ts) ───────

function mergeWithDefaults(partial: Partial<UserConfig>): UserConfig {
  return {
    version: partial.version ?? DEFAULT_USER_CONFIG.version,
    agents: {
      disabled: partial.agents?.disabled ?? DEFAULT_USER_CONFIG.agents.disabled,
    },
    routing: {
      rules: partial.routing?.rules ?? DEFAULT_USER_CONFIG.routing.rules,
    },
    providers: { ...DEFAULT_USER_CONFIG.providers, ...partial.providers },
    n8n: {
      triggers: { ...DEFAULT_USER_CONFIG.n8n.triggers, ...partial.n8n?.triggers },
    },
    allowedDomains: partial.allowedDomains ?? DEFAULT_USER_CONFIG.allowedDomains,
    whatsapp: {
      enabled: partial.whatsapp?.enabled ?? DEFAULT_USER_CONFIG.whatsapp.enabled,
      allowedPhones: partial.whatsapp?.allowedPhones ?? DEFAULT_USER_CONFIG.whatsapp.allowedPhones,
      maxMessagesPerHour: partial.whatsapp?.maxMessagesPerHour ?? DEFAULT_USER_CONFIG.whatsapp.maxMessagesPerHour,
      safeModes: partial.whatsapp?.safeModes ?? DEFAULT_USER_CONFIG.whatsapp.safeModes,
      n8nWebhookPath: partial.whatsapp?.n8nWebhookPath ?? DEFAULT_USER_CONFIG.whatsapp.n8nWebhookPath,
      hookToken: partial.whatsapp?.hookToken ?? DEFAULT_USER_CONFIG.whatsapp.hookToken,
      replyVia: partial.whatsapp?.replyVia ?? DEFAULT_USER_CONFIG.whatsapp.replyVia,
    },
  };
}
