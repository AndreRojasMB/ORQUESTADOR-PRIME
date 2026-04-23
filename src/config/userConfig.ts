// src/config/userConfig.ts
// TypeScript types for user-level configuration persisted in config.json.

import type { ProviderName } from "../providers/types.js";
import type { WhatsAppConfig } from "../whatsapp/types.js";

export interface RoutingRule {
  keywords: string[];
  agents: string[];
}

export interface UserConfig {
  version: string;
  agents: {
    disabled: string[];
  };
  routing: {
    rules: RoutingRule[];
  };
  providers: Partial<Record<string, ProviderName>>;
  n8n: {
    triggers: Record<string, string>; // mode → webhook path
  };
  allowedDomains: string[];
  whatsapp: WhatsAppConfig;
}

export const DEFAULT_USER_CONFIG: UserConfig = {
  version: "1.0",
  agents: { disabled: [] },
  routing: { rules: [] },
  providers: {},
  n8n: { triggers: {} },
  allowedDomains: ["api.openai.com", "api.anthropic.com"],
  whatsapp: {
    enabled: false,
    allowedPhones: [],
    maxMessagesPerHour: 20,
    safeModes: ["plan", "route", "blueprint", "audit", "memory"],
    n8nWebhookPath: "orquestador-whatsapp",
    hookToken: "",
    replyVia: "n8n",
  },
};
