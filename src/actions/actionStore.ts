// src/actions/actionStore.ts
// Persists and retrieves action proposals in a local JSON file.
// Location: ~/.orquestador-prime/actions.json
// Pattern: same non-fatal read/write as memoryStore and trajectoryStore.
// Phase 27A — proposals only, no execution.

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { logger } from "../observability/logger.js";
import { classifyAction } from "./actionClassifier.js";
import type {
  ActionStoreData,
  ActionProposal,
  ActionSource,
  ActionCategory,
  ActionStatus,
} from "./types.js";

// ─── Constants ──────────────────────────────────────────────────

const DATA_DIR = join(homedir(), ".orquestador-prime");
const ACTIONS_FILE = join(DATA_DIR, "actions.json");
const MAX_PROPOSALS = 200;

const EMPTY_STORE: ActionStoreData = {
  version: "1.0",
  proposals: [],
};

// ─── Store I/O ──────────────────────────────────────────────────

export async function readActionStore(): Promise<ActionStoreData> {
  try {
    const raw = await readFile(ACTIONS_FILE, "utf-8");
    return JSON.parse(raw) as ActionStoreData;
  } catch {
    return { ...EMPTY_STORE, proposals: [] };
  }
}

async function writeActionStore(store: ActionStoreData): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(ACTIONS_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    logger.warn("Action store write failed — continuing without persistence", {
      error: String(err),
    });
  }
}

// ─── ID generation ──────────────────────────────────────────────

function generateActionId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `act_${ts}_${rand}`;
}

// ─── Create proposal ────────────────────────────────────────────

export interface CreateProposalInput {
  source: ActionSource;
  sourceEventId?: string | null;
  category: ActionCategory;
  title: string;
  description: string;
  parameters?: Record<string, unknown>;
  traceId?: string | null;
  trajectoryId?: string | null;
  expiresInMs?: number;
}

export async function createProposal(
  input: CreateProposalInput,
): Promise<ActionProposal> {
  const classification = classifyAction(input.category);
  const now = new Date();

  const proposal: ActionProposal = {
    id: generateActionId(),
    createdAt: now.toISOString(),
    source: input.source,
    sourceEventId: input.sourceEventId ?? null,

    category: input.category,
    title: input.title,
    description: input.description,
    parameters: input.parameters ?? {},

    riskLevel: classification.riskLevel,
    riskReason: classification.riskReason,
    approvalPolicy: classification.approvalPolicy,

    status: "classified",
    decidedAt: null,
    decidedBy: null,
    expiresAt: input.expiresInMs
      ? new Date(now.getTime() + input.expiresInMs).toISOString()
      : null,

    traceId: input.traceId ?? null,
    trajectoryId: input.trajectoryId ?? null,
  };

  const store = await readActionStore();
  store.proposals.push(proposal);

  // Rotate if over limit
  if (store.proposals.length > MAX_PROPOSALS) {
    store.proposals = store.proposals.slice(-MAX_PROPOSALS);
  }

  await writeActionStore(store);
  logger.info("action:store proposal created", {
    id: proposal.id,
    category: proposal.category,
    riskLevel: proposal.riskLevel,
  });

  return proposal;
}

// ─── Status transition rules ────────────────────────────────────

const ALLOWED_TRANSITIONS: Record<ActionStatus, ActionStatus[]> = {
  "proposed":         ["classified"],
  "classified":       ["pending-approval", "expired"],
  "pending-approval": ["approved", "rejected", "expired"],
  // Terminal states — no transitions out
  "approved":         [],
  "rejected":         [],
  "expired":          [],
  "executed":         [],
  "failed":           [],
};

export interface TransitionResult {
  ok: boolean;
  proposal: ActionProposal | null;
  reason: string;
}

export function isValidTransition(from: ActionStatus, to: ActionStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

// ─── Update status (transition-validated) ───────────────────────

export async function updateProposalStatus(
  proposalId: string,
  status: ActionStatus,
  decidedBy?: string,
): Promise<TransitionResult> {
  const store = await readActionStore();
  const proposal = store.proposals.find((p) => p.id === proposalId);

  if (!proposal) {
    logger.warn("action:store proposal not found", { proposalId });
    return { ok: false, proposal: null, reason: `Proposal "${proposalId}" not found` };
  }

  if (!isValidTransition(proposal.status, status)) {
    const msg = `Invalid transition: "${proposal.status}" → "${status}"`;
    logger.warn("action:store invalid transition", { proposalId, from: proposal.status, to: status });
    return { ok: false, proposal, reason: msg };
  }

  proposal.status = status;
  proposal.decidedAt = new Date().toISOString();
  proposal.decidedBy = decidedBy ?? null;

  await writeActionStore(store);
  logger.info("action:store proposal updated", {
    id: proposalId,
    status,
    decidedBy,
  });

  return { ok: true, proposal, reason: `Transitioned to "${status}"` };
}

// ─── Queries ────────────────────────────────────────────────────

export async function getProposalById(
  id: string,
): Promise<ActionProposal | null> {
  const store = await readActionStore();
  return store.proposals.find((p) => p.id === id) ?? null;
}

export async function getProposalsByStatus(
  status: ActionStatus,
): Promise<ActionProposal[]> {
  const store = await readActionStore();
  return store.proposals.filter((p) => p.status === status);
}

export async function getRecentProposals(n = 10): Promise<ActionProposal[]> {
  const store = await readActionStore();
  return store.proposals.slice(-n);
}

// ─── Expiration ─────────────────────────────────────────────────

export async function expireStaleProposals(): Promise<number> {
  const store = await readActionStore();
  const now = Date.now();
  let expired = 0;

  for (const proposal of store.proposals) {
    if (
      proposal.status === "classified" ||
      proposal.status === "pending-approval"
    ) {
      if (proposal.expiresAt && Date.parse(proposal.expiresAt) < now) {
        proposal.status = "expired";
        proposal.decidedAt = new Date().toISOString();
        proposal.decidedBy = "system:expiry";
        expired++;
      }
    }
  }

  if (expired > 0) {
    await writeActionStore(store);
    logger.info("action:store expired proposals", { count: expired });
  }

  return expired;
}

// ─── Store path ─────────────────────────────────────────────────

export function getActionsPath(): string {
  return ACTIONS_FILE;
}
