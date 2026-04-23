// dashboard/lib/data.ts
// Filesystem data access for the dashboard.
// Reads memory.json and config.json from the orchestrator data directory.
// All functions are async, never throw, and return typed defaults on error.
// Designed for use in Server Components and Server Actions only.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import type { MemoryStore, MemoryEntry, UserConfig } from "./types";
import { EMPTY_MEMORY_STORE, DEFAULT_USER_CONFIG } from "./types";

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
