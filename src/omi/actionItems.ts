// src/omi/actionItems.ts
// Deterministic Omi action-item proposal bridge. Proposal-only; no dispatch.

import { createHash } from "node:crypto";
import { createProposalFromChannel } from "../actions/channelActionBridge.js";
import type {
  ActionCategory,
  ChannelIdentity,
  ChannelAuditReasonCode,
} from "../actions/types.js";
import type { UserConfig } from "../config/userConfig.js";
import type { OmiMemoryEvent } from "./types.js";

// ─── Constants ──────────────────────────────────────────────────

const MAX_EXPLICIT_ACTION_ITEMS = 5;
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_ACTION_ITEM_LENGTH = 1500;
const MAX_MEMORY_TITLE_LENGTH = 120;
const OMI_PROPOSAL_CATEGORY: ActionCategory = "query";
const VERIFIED_OMI_PRINCIPAL = "omi:verified-webhook";

const EXPLICIT_MARKER_PATTERN =
  /^(?:orquestador|orquestador\s+action|proposal):\s*([\s\S]+)$/i;

// ─── Public types ───────────────────────────────────────────────

export interface OmiActionProposalContext {
  trusted: boolean;
  trustReason: string;
}

export interface OmiActionProposalSummary {
  explicitCount: number;
  attempted: number;
  created: number;
  blocked: number;
  proposalIds: string[];
  blockedReasonCodes: ChannelAuditReasonCode[];
}

interface ParsedOmiActionItem {
  title: string;
  description: string;
  originalMarkedItem: string;
  actionItemIndex: number;
}

export interface ProcessOmiActionItemOptions {
  config?: UserConfig;
}

// ─── Text safety helpers ────────────────────────────────────────

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function truncate(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function redactSensitiveText(value: string): string {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-contact]")
    .replace(
      /\b(?:access[_-]?token|refresh[_-]?token|token|api[_-]?key|secret)\b\s*[:=]\s*\S+/gi,
      "[redacted-secret]",
    )
    .replace(/\b(?:\+?\d[\d\s().-]{7,}\d)\b/g, "[redacted-contact]");
}

function safeText(value: string, maxLength: number): string {
  return truncate(redactSensitiveText(value), maxLength);
}

function parseExplicitActionItem(
  item: string,
  actionItemIndex: number,
): ParsedOmiActionItem | null {
  const markerMatch = item.trim().match(EXPLICIT_MARKER_PATTERN);
  if (!markerMatch) {
    return null;
  }

  const payload = markerMatch[1]?.trim() ?? "";
  const separatorIndex = payload.indexOf("::");
  if (separatorIndex < 0) {
    return null;
  }

  const rawTitle = payload.slice(0, separatorIndex).trim();
  const rawDescription = payload.slice(separatorIndex + 2).trim();
  if (!rawTitle || !rawDescription) {
    return null;
  }

  return {
    title: safeText(rawTitle, MAX_TITLE_LENGTH),
    description: safeText(rawDescription, MAX_DESCRIPTION_LENGTH),
    originalMarkedItem: safeText(item, MAX_ACTION_ITEM_LENGTH),
    actionItemIndex,
  };
}

export function parseExplicitOmiActionItems(
  event: OmiMemoryEvent,
): ParsedOmiActionItem[] {
  const parsed: ParsedOmiActionItem[] = [];

  for (let index = 0; index < event.actionItems.length; index++) {
    const item = event.actionItems[index];
    if (typeof item !== "string") {
      continue;
    }

    const actionItem = parseExplicitActionItem(item, index);
    if (!actionItem) {
      continue;
    }

    parsed.push(actionItem);
    if (parsed.length >= MAX_EXPLICIT_ACTION_ITEMS) {
      break;
    }
  }

  return parsed;
}

// ─── Identity / proposal creation ───────────────────────────────

function receivedAtForEvent(event: OmiMemoryEvent): string {
  const timestamp = Date.parse(event.timestamp);
  return Number.isFinite(timestamp)
    ? new Date(timestamp).toISOString()
    : new Date().toISOString();
}

function buildOmiIdentity(
  event: OmiMemoryEvent,
  memoryIdHash: string,
  item: ParsedOmiActionItem,
  context: OmiActionProposalContext,
): ChannelIdentity {
  return {
    channel: "omi",
    principalHash: context.trusted ? sha256(VERIFIED_OMI_PRINCIPAL) : null,
    sourceEventId: `omi:${memoryIdHash}:action-item:${item.actionItemIndex}`,
    authMethod: "hmac",
    trusted: context.trusted,
    trustReason: context.trustReason,
    receivedAt: receivedAtForEvent(event),
  };
}

export async function processOmiActionItems(
  event: OmiMemoryEvent,
  context: OmiActionProposalContext,
  options: ProcessOmiActionItemOptions = {},
): Promise<OmiActionProposalSummary> {
  const explicitItems = parseExplicitOmiActionItems(event);
  const memoryIdHash = sha256(event.memoryId);
  const summary: OmiActionProposalSummary = {
    explicitCount: explicitItems.length,
    attempted: 0,
    created: 0,
    blocked: 0,
    proposalIds: [],
    blockedReasonCodes: [],
  };

  for (const item of explicitItems) {
    summary.attempted++;
    const result = await createProposalFromChannel(
      {
        identity: buildOmiIdentity(event, memoryIdHash, item, context),
        category: OMI_PROPOSAL_CATEGORY,
        title: item.title,
        description: item.description,
        parameters: {
          query: item.description,
          actionItem: item.originalMarkedItem,
          memoryTitle: safeText(event.title, MAX_MEMORY_TITLE_LENGTH),
          memoryIdHash,
          actionItemIndex: item.actionItemIndex,
        },
      },
      options.config ? { config: options.config } : {},
    );

    if (result.ok && result.proposal) {
      summary.created++;
      summary.proposalIds.push(result.proposal.id);
    } else {
      summary.blocked++;
      summary.blockedReasonCodes.push(result.reasonCode);
    }
  }

  return summary;
}
