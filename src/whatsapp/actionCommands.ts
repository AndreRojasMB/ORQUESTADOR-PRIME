// src/whatsapp/actionCommands.ts
// Deterministic WhatsApp action commands. No provider, dispatch, or approval path.

import {
  createProposalFromChannel,
  listProposalsFromChannel,
  requestReviewFromChannel,
} from "../actions/channelActionBridge.js";
import type {
  ActionCategory,
  ActionProposal,
  ChannelIdentity,
} from "../actions/types.js";
import type { UserConfig } from "../config/userConfig.js";
import type { ChannelMessage, ChannelReply } from "./types.js";

// ─── Command parsing ────────────────────────────────────────────

type WhatsAppActionCommand =
  | { kind: "help" }
  | { kind: "pending" }
  | { kind: "recent" }
  | { kind: "review"; proposalId: string }
  | {
      kind: "propose-query";
      title: string;
      description: string;
    }
  | { kind: "invalid"; reason: string };

const ACTION_COMMAND_PATTERN = /^actions(?:\s+|$)/i;
const SAFE_PROPOSAL_CATEGORY: ActionCategory = "query";
const MAX_REPLY_LENGTH = 3500;

export function isWhatsAppActionCommand(text: string): boolean {
  return ACTION_COMMAND_PATTERN.test(text.trim());
}

function parseWhatsAppActionCommand(text: string): WhatsAppActionCommand {
  const trimmed = text.trim();
  const body = trimmed.replace(/^actions\b/i, "").trim();

  if (body.length === 0 || /^help$/i.test(body)) {
    return { kind: "help" };
  }

  if (/^(pending|list)$/i.test(body)) {
    return { kind: "pending" };
  }

  if (/^recent$/i.test(body)) {
    return { kind: "recent" };
  }

  const reviewMatch = body.match(/^review\s+(\S+)$/i);
  if (reviewMatch) {
    const proposalId = reviewMatch[1]?.trim() ?? "";
    return proposalId.length > 0
      ? { kind: "review", proposalId }
      : { kind: "invalid", reason: "Proposal id is required." };
  }

  const proposePrefix = body.match(/^propose\s+query\s+([\s\S]+)$/i);
  if (proposePrefix) {
    const payload = proposePrefix[1]?.trim() ?? "";
    const separatorIndex = payload.indexOf("::");
    if (separatorIndex < 0) {
      return {
        kind: "invalid",
        reason: 'Use: actions propose query <title> :: <description>',
      };
    }

    const title = payload.slice(0, separatorIndex).trim();
    const description = payload.slice(separatorIndex + 2).trim();
    if (title.length === 0 || description.length === 0) {
      return {
        kind: "invalid",
        reason: "Proposal title and description must be non-empty.",
      };
    }

    return { kind: "propose-query", title, description };
  }

  return {
    kind: "invalid",
    reason: "Unknown actions command. Send: actions help",
  };
}

// ─── Identity ───────────────────────────────────────────────────

function receivedAtForMessage(message: ChannelMessage): string {
  const date = Number.isFinite(message.timestamp)
    ? new Date(message.timestamp)
    : new Date();
  return Number.isFinite(date.getTime())
    ? date.toISOString()
    : new Date().toISOString();
}

function buildWhatsAppIdentity(message: ChannelMessage): ChannelIdentity {
  return {
    channel: "whatsapp",
    principalHash: message.senderHash,
    sourceEventId: message.messageId,
    authMethod: "hook-token",
    trusted: true,
    trustReason: "whatsapp hook token + allowed phone",
    receivedAt: receivedAtForMessage(message),
  };
}

// ─── Reply formatting ───────────────────────────────────────────

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
}

function boundedReply(text: string): string {
  if (text.length <= MAX_REPLY_LENGTH) {
    return text;
  }
  return `${text.slice(0, MAX_REPLY_LENGTH - 20)}\n\n[truncated]`;
}

function formatHelp(): string {
  return [
    "[ACTIONS]",
    "",
    "Available commands:",
    "- actions pending",
    "- actions recent",
    "- actions propose query <title> :: <description>",
    "- actions review <proposalId>",
    "",
    "WhatsApp can create/list/request-review only. It cannot execute actions.",
  ].join("\n");
}

function formatBlocked(reasonCode: string, reason: string): string {
  return [
    "[ACTIONS BLOCKED]",
    "",
    `Reason: ${reasonCode}`,
    truncate(reason, 240),
  ].join("\n");
}

function formatProposalLine(proposal: ActionProposal, index: number): string {
  return [
    `${index + 1}. ${proposal.id}`,
    `   Status: ${proposal.status}`,
    `   Category: ${proposal.category}`,
    `   Title: ${truncate(proposal.title, 96)}`,
  ].join("\n");
}

function formatProposalList(
  title: string,
  proposals: ActionProposal[],
): string {
  if (proposals.length === 0) {
    return `[ACTIONS]\n\n${title}: none.`;
  }

  return boundedReply(
    [
      "[ACTIONS]",
      "",
      `${title}: ${proposals.length}`,
      "",
      ...proposals.map(formatProposalLine),
    ].join("\n"),
  );
}

function formatCreated(proposal: ActionProposal): string {
  return [
    "[ACTIONS]",
    "",
    "Proposal created.",
    `ID: ${proposal.id}`,
    `Status: ${proposal.status}`,
    `Category: ${proposal.category}`,
    `Title: ${truncate(proposal.title, 120)}`,
    "",
    `Request review: actions review ${proposal.id}`,
  ].join("\n");
}

function formatReviewRequested(proposal: ActionProposal): string {
  return [
    "[ACTIONS]",
    "",
    "Review requested.",
    `ID: ${proposal.id}`,
    `Status: ${proposal.status}`,
    `Category: ${proposal.category}`,
    `Title: ${truncate(proposal.title, 120)}`,
  ].join("\n");
}

// ─── Handler ────────────────────────────────────────────────────

export async function handleWhatsAppActionCommand(
  message: ChannelMessage,
  config: UserConfig,
): Promise<ChannelReply> {
  const replyTo = message.senderRaw ?? "";
  const command = parseWhatsAppActionCommand(message.text);
  const identity = buildWhatsAppIdentity(message);

  if (command.kind === "help") {
    return { to: replyTo, text: formatHelp() };
  }

  if (command.kind === "invalid") {
    return { to: replyTo, text: formatBlocked("malformed-request", command.reason) };
  }

  if (command.kind === "pending" || command.kind === "recent") {
    const result = await listProposalsFromChannel(
      {
        identity,
        listMode: command.kind,
        limit: 10,
      },
      { config },
    );

    if (!result.ok) {
      return {
        to: replyTo,
        text: formatBlocked(result.reasonCode, result.reason),
      };
    }

    return {
      to: replyTo,
      text: formatProposalList(
        command.kind === "pending" ? "Pending proposals" : "Recent proposals",
        result.proposals,
      ),
    };
  }

  if (command.kind === "review") {
    const result = await requestReviewFromChannel(
      {
        identity,
        proposalId: command.proposalId,
      },
      { config },
    );

    if (!result.ok || !result.proposal) {
      return {
        to: replyTo,
        text: formatBlocked(result.reasonCode, result.reason),
      };
    }

    return { to: replyTo, text: formatReviewRequested(result.proposal) };
  }

  const result = await createProposalFromChannel(
    {
      identity,
      category: SAFE_PROPOSAL_CATEGORY,
      title: command.title,
      description: command.description,
      parameters: {
        query: command.description,
      },
    },
    { config },
  );

  if (!result.ok || !result.proposal) {
    return {
      to: replyTo,
      text: formatBlocked(result.reasonCode, result.reason),
    };
  }

  return { to: replyTo, text: formatCreated(result.proposal) };
}
