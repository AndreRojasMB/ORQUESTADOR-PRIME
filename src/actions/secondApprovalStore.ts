// src/actions/secondApprovalStore.ts
// Single-use, short-lived second approvals for repo-mutating ActionProposals.
// Location: ~/.orquestador-prime/action-second-approvals.json
// Non-fatal I/O, same pattern as actionStore / executionResultStore.
//
// Phase 32A — infrastructure only. No dispatch path consumes these yet
// (ACTIONS_REAL_EXECUTION_ENABLED stays false). The API is exercised
// via the `action:approve` CLI and is ready for 32B.

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { createHash } from "crypto";
import { logger } from "../observability/logger.js";
import { SECOND_APPROVAL_TTL_MS } from "../config.js";
import { getProposalById } from "./actionStore.js";
import type {
  SecondApproval,
  SecondApprovalStatus,
  SecondApprovalStoreData,
  ActionProposal,
} from "./types.js";

// ─── Constants ──────────────────────────────────────────────────

const DATA_DIR = join(homedir(), ".orquestador-prime");
const APPROVALS_FILE = join(DATA_DIR, "action-second-approvals.json");
const MAX_APPROVALS = 500;

const EMPTY_STORE: SecondApprovalStoreData = {
  version: "1.0",
  approvals: [],
};

// ─── Store I/O ──────────────────────────────────────────────────

export async function readSecondApprovalStore(): Promise<SecondApprovalStoreData> {
  try {
    const raw = await readFile(APPROVALS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as SecondApprovalStoreData;
    if (!Array.isArray(parsed.approvals)) {
      return { ...EMPTY_STORE, approvals: [] };
    }
    return parsed;
  } catch {
    return { ...EMPTY_STORE, approvals: [] };
  }
}

async function writeSecondApprovalStore(store: SecondApprovalStoreData): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(APPROVALS_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    logger.warn("second-approval store write failed — continuing without persistence", {
      error: String(err),
    });
  }
}

// ─── Helpers ────────────────────────────────────────────────────

function generateApprovalId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `sapr_${ts}_${rand}`;
}

function canonicalJson(value: unknown): string {
  // Stable, sorted-key JSON so the hash is order-independent.
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalJson).join(",") + "]";
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => JSON.stringify(k) + ":" + canonicalJson(v));
  return "{" + entries.join(",") + "}";
}

export function hashProposalParameters(proposal: ActionProposal): string {
  return createHash("sha256").update(canonicalJson(proposal.parameters)).digest("hex");
}

function isActiveGranted(a: SecondApproval, now: number): boolean {
  if (a.status !== "granted") return false;
  return Date.parse(a.expiresAt) > now;
}

// ─── Grant ──────────────────────────────────────────────────────

export interface GrantInput {
  proposalId: string;
  grantedBy: string;
  ttlMs?: number;
}

export interface GrantResult {
  ok: boolean;
  approval: SecondApproval | null;
  reason: string;
}

export async function grantSecondApproval(input: GrantInput): Promise<GrantResult> {
  const proposal = await getProposalById(input.proposalId);
  if (!proposal) {
    return { ok: false, approval: null, reason: `Proposal "${input.proposalId}" not found` };
  }
  if (proposal.status !== "approved") {
    return {
      ok: false,
      approval: null,
      reason: `Cannot grant: proposal is "${proposal.status}", expected "approved"`,
    };
  }

  const now = Date.now();
  const store = await readSecondApprovalStore();

  // Refuse if a live grant already exists — human must revoke first.
  const live = store.approvals.find(
    (a) => a.proposalId === proposal.id && isActiveGranted(a, now),
  );
  if (live) {
    return {
      ok: false,
      approval: live,
      reason: "An active second approval already exists for this proposal",
    };
  }

  const ttl = input.ttlMs && input.ttlMs > 0 ? input.ttlMs : SECOND_APPROVAL_TTL_MS;
  const approval: SecondApproval = {
    id: generateApprovalId(),
    proposalId: proposal.id,
    grantedBy: input.grantedBy,
    grantedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ttl).toISOString(),
    status: "granted",
    consumedAt: null,
    revokedAt: null,
    proposalParameterHash: hashProposalParameters(proposal),
    proposalStatusAtGrant: proposal.status,
  };

  store.approvals.push(approval);
  if (store.approvals.length > MAX_APPROVALS) {
    store.approvals = store.approvals.slice(-MAX_APPROVALS);
  }

  await writeSecondApprovalStore(store);
  logger.info("second-approval granted", {
    id: approval.id,
    proposalId: approval.proposalId,
    grantedBy: approval.grantedBy,
    expiresAt: approval.expiresAt,
  });

  return { ok: true, approval, reason: "Granted" };
}

// ─── Revoke ─────────────────────────────────────────────────────

export async function revokeSecondApproval(
  proposalId: string,
): Promise<{ ok: boolean; count: number }> {
  const now = Date.now();
  const store = await readSecondApprovalStore();
  let count = 0;

  for (const a of store.approvals) {
    if (a.proposalId === proposalId && isActiveGranted(a, now)) {
      a.status = "revoked";
      a.revokedAt = new Date(now).toISOString();
      count++;
    }
  }

  if (count > 0) {
    await writeSecondApprovalStore(store);
    logger.info("second-approval revoked", { proposalId, count });
  }

  return { ok: count > 0, count };
}

// ─── Consume (single-use) ───────────────────────────────────────

export interface ConsumeResult {
  ok: boolean;
  approval: SecondApproval | null;
  reason: string;
}

/**
 * Consume the active grant for a proposal, binding it to the current
 * proposal parameters. Single-use: marks the record "consumed".
 * Guards: active + not expired + parameter hash match + still "approved".
 * Phase 32A has no caller inside the dispatch path; this API is ready
 * for 32B behind ACTIONS_REAL_EXECUTION_ENABLED.
 */
export async function consumeSecondApproval(
  proposalId: string,
): Promise<ConsumeResult> {
  const proposal = await getProposalById(proposalId);
  if (!proposal) {
    return { ok: false, approval: null, reason: `Proposal "${proposalId}" not found` };
  }
  if (proposal.status !== "approved") {
    return {
      ok: false,
      approval: null,
      reason: `Cannot consume: proposal is "${proposal.status}", expected "approved"`,
    };
  }

  const now = Date.now();
  const store = await readSecondApprovalStore();
  const approval = store.approvals.find(
    (a) => a.proposalId === proposalId && isActiveGranted(a, now),
  );

  if (!approval) {
    return { ok: false, approval: null, reason: "No active second approval for this proposal" };
  }

  const currentHash = hashProposalParameters(proposal);
  if (currentHash !== approval.proposalParameterHash) {
    // Fail closed — do NOT consume a grant whose bound parameters drifted.
    return {
      ok: false,
      approval,
      reason: "Proposal parameters changed since approval was granted; re-grant required",
    };
  }

  approval.status = "consumed";
  approval.consumedAt = new Date(now).toISOString();
  await writeSecondApprovalStore(store);
  logger.info("second-approval consumed", {
    id: approval.id,
    proposalId,
  });
  return { ok: true, approval, reason: "Consumed" };
}

// ─── Expire sweep ───────────────────────────────────────────────

export async function expireStaleSecondApprovals(): Promise<number> {
  const now = Date.now();
  const store = await readSecondApprovalStore();
  let expired = 0;

  for (const a of store.approvals) {
    if (a.status === "granted" && Date.parse(a.expiresAt) <= now) {
      a.status = "expired";
      expired++;
    }
  }

  if (expired > 0) {
    await writeSecondApprovalStore(store);
    logger.info("second-approval store expired stale grants", { count: expired });
  }

  return expired;
}

// ─── Queries ────────────────────────────────────────────────────

export async function getApprovalsByProposalId(
  proposalId: string,
): Promise<SecondApproval[]> {
  const store = await readSecondApprovalStore();
  return store.approvals.filter((a) => a.proposalId === proposalId);
}

export async function hasActiveSecondApproval(proposalId: string): Promise<boolean> {
  const now = Date.now();
  const store = await readSecondApprovalStore();
  return store.approvals.some(
    (a) => a.proposalId === proposalId && isActiveGranted(a, now),
  );
}

export async function listSecondApprovals(
  filter?: SecondApprovalStatus,
): Promise<SecondApproval[]> {
  const store = await readSecondApprovalStore();
  if (!filter) return store.approvals;
  return store.approvals.filter((a) => a.status === filter);
}

// ─── Store path ─────────────────────────────────────────────────

export function getSecondApprovalsPath(): string {
  return APPROVALS_FILE;
}
