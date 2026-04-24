// src/config/userConfigStore.ts
// Reads and writes ~/.orquestador-prime/config.json.
// All operations are non-fatal — config issues never crash the system.

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { logger } from "../observability/logger.js";
import type { UserConfig } from "./userConfig.js";
import { DEFAULT_USER_CONFIG } from "./userConfig.js";

const CONFIG_DIR = join(homedir(), ".orquestador-prime");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export async function readUserConfig(): Promise<UserConfig> {
  try {
    const raw = await readFile(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<UserConfig>;
    return mergeWithDefaults(parsed);
  } catch {
    return { ...DEFAULT_USER_CONFIG };
  }
}

export async function writeUserConfig(config: UserConfig): Promise<void> {
  try {
    await mkdir(CONFIG_DIR, { recursive: true });
    await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    logger.warn("Config write failed — continuing without persistence", {
      error: String(err),
    });
  }
}

export function mergeWithDefaults(partial: Partial<UserConfig>): UserConfig {
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
    allowedDomains:
      partial.allowedDomains ?? DEFAULT_USER_CONFIG.allowedDomains,
    whatsapp: {
      enabled:
        partial.whatsapp?.enabled ?? DEFAULT_USER_CONFIG.whatsapp.enabled,
      allowedPhones:
        partial.whatsapp?.allowedPhones ?? DEFAULT_USER_CONFIG.whatsapp.allowedPhones,
      maxMessagesPerHour:
        partial.whatsapp?.maxMessagesPerHour ?? DEFAULT_USER_CONFIG.whatsapp.maxMessagesPerHour,
      safeModes:
        partial.whatsapp?.safeModes ?? DEFAULT_USER_CONFIG.whatsapp.safeModes,
      n8nWebhookPath:
        partial.whatsapp?.n8nWebhookPath ?? DEFAULT_USER_CONFIG.whatsapp.n8nWebhookPath,
      hookToken:
        partial.whatsapp?.hookToken ?? DEFAULT_USER_CONFIG.whatsapp.hookToken,
      replyVia:
        partial.whatsapp?.replyVia ?? DEFAULT_USER_CONFIG.whatsapp.replyVia,
    },
    skills: {
      enabled: partial.skills?.enabled ?? DEFAULT_USER_CONFIG.skills!.enabled,
      agentMap: { ...DEFAULT_USER_CONFIG.skills!.agentMap, ...partial.skills?.agentMap },
    },
    omi: {
      enabled: partial.omi?.enabled ?? DEFAULT_USER_CONFIG.omi!.enabled,
      allowedEventTypes:
        partial.omi?.allowedEventTypes ?? DEFAULT_USER_CONFIG.omi!.allowedEventTypes,
    },
  };
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}
