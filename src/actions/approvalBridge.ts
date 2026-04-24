// src/actions/approvalBridge.ts
// Review and approval bridge for ActionProposal records.
// Phase 27B — approval/rejection only, no execution.
//
// Programmatic-first: returns results, not console output.
// Future channels (CLI, dashboard, WhatsApp) call these same functions.

import { logger } from "../observability/logger.js";
import {
  updateProposalStatus,
  getProposalsByStatus,
  getProposalById,
  expireStaleProposals,
} from "./actionStore.js";
import type { TransitionResult } from "./actionStore.js";
import type { ActionProposal } from "./types.js";

// ─── Submit for review ──────────────────────────────────────────

/**
 * Moves a classified proposal to pending-approval.
 * Only valid from "classified" status.
 */
export async function submitForReview(
  proposalId: string,
): Promise<TransitionResult> {
  const proposal = await getProposalById(proposalId);
  if (!proposal) {
    return { ok: false, proposal: null, reason: `Proposal "${proposalId}" not found` };
  }

  if (proposal.status !== "classified") {
    return {
      ok: false,
      proposal,
      reason: `Cannot submit for review: proposal is "${proposal.status}", expected "classified"`,
    };
  }

  return updateProposalStatus(proposalId, "pending-approval");
}

// ─── Approve proposal ───────────────────────────────────────────

/**
 * Approves a pending-approval proposal.
 * Blocked if the proposal's approvalPolicy is "never" (forbidden actions).
 * decidedBy should identify the approver (e.g. "human:cli", "human:dashboard").
 */
export async function approveProposal(
  proposalId: string,
  decidedBy: string,
): Promise<TransitionResult> {
  const proposal = await getProposalById(proposalId);
  if (!proposal) {
    return { ok: false, proposal: null, reason: `Proposal "${proposalId}" not found` };
  }

  if (proposal.status !== "pending-approval") {
    return {
      ok: false,
      proposal,
      reason: `Cannot approve: proposal is "${proposal.status}", expected "pending-approval"`,
    };
  }

  if (proposal.approvalPolicy === "never") {
    logger.warn("action:approval blocked — forbidden action", {
      id: proposalId,
      category: proposal.category,
      riskLevel: proposal.riskLevel,
    });
    return {
      ok: false,
      proposal,
      reason: `Cannot approve: action category "${proposal.category}" is forbidden (risk: ${proposal.riskLevel})`,
    };
  }

  return updateProposalStatus(proposalId, "approved", decidedBy);
}

// ─── Reject proposal ───────────────────────────────────────────

/**
 * Rejects a pending-approval proposal.
 * decidedBy should identify who rejected (e.g. "human:cli", "human:dashboard").
 */
export async function rejectProposal(
  proposalId: string,
  decidedBy: string,
): Promise<TransitionResult> {
  const proposal = await getProposalById(proposalId);
  if (!proposal) {
    return { ok: false, proposal: null, reason: `Proposal "${proposalId}" not found` };
  }

  if (proposal.status !== "pending-approval") {
    return {
      ok: false,
      proposal,
      reason: `Cannot reject: proposal is "${proposal.status}", expected "pending-approval"`,
    };
  }

  return updateProposalStatus(proposalId, "rejected", decidedBy);
}

// ─── Review pending proposals ───────────────────────────────────

export interface PendingReview {
  pending: ActionProposal[];
  classified: ActionProposal[];
  expiredCount: number;
}

/**
 * Returns all proposals awaiting review or approval.
 * Also runs expiration sweep before returning results.
 */
export async function reviewPendingProposals(): Promise<PendingReview> {
  const expiredCount = await expireStaleProposals();

  const [pending, classified] = await Promise.all([
    getProposalsByStatus("pending-approval"),
    getProposalsByStatus("classified"),
  ]);

  return { pending, classified, expiredCount };
}

// ─── Format proposal for display ────────────────────────────────

/**
 * Formats a proposal into a human-readable summary string.
 * Channel-agnostic — usable by CLI, logs, or future dashboard.
 */
export function formatProposalSummary(proposal: ActionProposal): string {
  const lines = [
    `ID       : ${proposal.id}`,
    `Status   : ${proposal.status}`,
    `Source   : ${proposal.source}`,
    `Category : ${proposal.category}`,
    `Risk     : ${proposal.riskLevel}`,
    `Policy   : ${proposal.approvalPolicy}`,
    `Title    : ${proposal.title}`,
    `Description: ${proposal.description}`,
    `Created  : ${proposal.createdAt}`,
  ];

  if (proposal.expiresAt) {
    lines.push(`Expires  : ${proposal.expiresAt}`);
  }
  if (proposal.decidedAt) {
    lines.push(`Decided  : ${proposal.decidedAt} by ${proposal.decidedBy ?? "unknown"}`);
  }
  if (proposal.riskReason) {
    lines.push(`Risk note: ${proposal.riskReason}`);
  }

  return lines.join("\n");
}
