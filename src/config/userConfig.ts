// src/config/userConfig.ts
// TypeScript types for user-level configuration persisted in config.json.

import type { ProviderName } from "../providers/types.js";
import type { WhatsAppConfig } from "../whatsapp/types.js";
import type { OmiConfig } from "../omi/types.js";
import { GLOBAL_FORBIDDEN_ACTION_CATEGORIES } from "../actions/types.js";
import type {
  ActionCategory,
  ChannelKind,
  ChannelPermission,
} from "../actions/types.js";

export interface RoutingRule {
  keywords: string[];
  agents: string[];
}

export interface SkillsConfig {
  enabled: string[];
  agentMap: Record<string, string[]>;
}

export type ExternalChannelKind = Exclude<ChannelKind, "cli" | "system">;

export type ChannelPermissionConfig = ChannelPermission;

export type ExternalChannelsConfig = Record<
  ExternalChannelKind,
  ChannelPermissionConfig
>;

function defaultChannelPermission(): ChannelPermissionConfig {
  return {
    canCreateProposal: false,
    canRequestReview: false,
    canListPending: false,
    canGrantSecondApproval: false,
    canDispatchApproved: false,
    allowedProposalCategories: [],
    allowedDispatchCategories: [],
    forbiddenCategories: [...GLOBAL_FORBIDDEN_ACTION_CATEGORIES] as ActionCategory[],
    maxProposalsPerHour: 0,
    maxDispatchesPerHour: 0,
  };
}

export const DEFAULT_EXTERNAL_CHANNELS_CONFIG: ExternalChannelsConfig = {
  whatsapp:  defaultChannelPermission(),
  omi:       defaultChannelPermission(),
  dashboard: defaultChannelPermission(),
  openclaw:  defaultChannelPermission(),
  api:       defaultChannelPermission(),
};

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
  skills?: SkillsConfig;
  omi?: OmiConfig;
  externalChannels: ExternalChannelsConfig;
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
  skills: {
    enabled: [],
    agentMap: {},
  },
  omi: {
    enabled: false,
    allowedEventTypes: ["memory_created"],
  },
  externalChannels: DEFAULT_EXTERNAL_CHANNELS_CONFIG,
};
